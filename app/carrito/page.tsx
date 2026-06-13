"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  obtenerCarrito,
  quitarDelCarrito,
  cambiarCantidadCarrito,
  limpiarCarrito,
  totalCarrito,
  type ProductoCarrito,
} from "@/lib/carrito";
import { crearPedido } from "@/lib/pedidos";
import {
  comprarConCreditos,
  obtenerCreditoUsuario,
  type CreditoUsuario,
  type CuentaEntregada,
} from "@/lib/creditos";
import { validarCupon } from "@/lib/cupones";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import styles from "./carrito.module.css";

const WHATSAPP_NUMBER = "51900557949";
const COMPROBANTES_BUCKET = "comprobantes";

type UsuarioLocal = {
  id: string;
  nombre: string;
  correo: string;
  rol?: string;
  estado?: string;
};

type PedidoCreado = {
  id: string;
  usuario_id?: string | null;
  cliente_nombre?: string | null;
  cliente_correo?: string | null;
  total?: number | null;
  metodo_pago?: string | null;
};

type PedidoPendiente = {
  id: string;
  metodo_pago: string;
  total: number;
  fecha: string;
  productos: ProductoCarrito[];
  comprobante_url?: string | null;
};

function buildWhatsAppLink(message: string) {
  return `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}`;
}

function limpiarNombreArchivo(nombre: string) {
  return nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-");
}

function esCuentaCompleta(tipoVenta?: string | null) {
  const texto = (tipoVenta || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

  return texto.includes("cuenta");
}

function formatearFechaEntrega(fecha?: string | null) {
  if (!fecha) return "Sin fecha";

  const date = new Date(fecha);
  if (Number.isNaN(date.getTime())) return "Sin fecha";

  return date.toLocaleString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatearRangoVigencia(inicio?: string | null, fin?: string | null) {
  const inicioTexto = formatearFechaEntrega(inicio);
  const finTexto = formatearFechaEntrega(fin);

  if (inicioTexto === "Sin fecha" && finTexto === "Sin fecha") {
    return "Vigencia pendiente";
  }

  return `${inicioTexto} hasta ${finTexto}`;
}

function leerUsuarioLocal(): UsuarioLocal | null {
  if (typeof window === "undefined") return null;

  try {
    const data = window.localStorage.getItem("usuario");
    if (!data) return null;

    return JSON.parse(data) as UsuarioLocal;
  } catch {
    return null;
  }
}

export default function CarritoPage() {
  const [carrito, setCarrito] = useState<ProductoCarrito[]>([]);
  const [procesandoPedido, setProcesandoPedido] = useState(false);
  const [codigoCupon, setCodigoCupon] = useState("");
  const [descuento, setDescuento] = useState(0);
  const [cuponAplicado, setCuponAplicado] = useState<string | null>(null);
  const [metodoPago, setMetodoPago] = useState("");
  const [comprobante, setComprobante] = useState<File | null>(null);
  const [previewComprobante, setPreviewComprobante] = useState<string | null>(
    null,
  );
  const [subiendoComprobante, setSubiendoComprobante] = useState(false);
  const [creditoUsuario, setCreditoUsuario] = useState<CreditoUsuario | null>(
    null,
  );
  const [cuentasEntregadas, setCuentasEntregadas] = useState<CuentaEntregada[]>(
    [],
  );
  const [pedidoEntregadoId, setPedidoEntregadoId] = useState<string | null>(
    null,
  );
  const [pedidoPendiente, setPedidoPendiente] = useState<PedidoPendiente | null>(
    null,
  );

  const cargarCarrito = () => {
    setCarrito(obtenerCarrito());
  };

  useEffect(() => {
    cargarCarrito();
    cargarCreditoUsuario();
    cargarUltimaEntrega();
    cargarUltimoPedidoPendiente();

    const handleFocus = () => {
      cargarCarrito();
      cargarCreditoUsuario();
    };
    window.addEventListener("focus", handleFocus);

    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  useEffect(() => {
    return () => {
      if (previewComprobante) {
        URL.revokeObjectURL(previewComprobante);
      }
    };
  }, [previewComprobante]);

  const cargarCreditoUsuario = async () => {
    const credito = await obtenerCreditoUsuario();
    setCreditoUsuario(credito);
  };

  const cargarUltimaEntrega = () => {
    if (typeof window === "undefined") return;

    try {
      const data = window.localStorage.getItem("ultima_entrega_creditos");
      if (!data) return;

      const parsed = JSON.parse(data) as {
        pedido_id?: string;
        cuentas?: CuentaEntregada[];
      };
      setPedidoEntregadoId(parsed.pedido_id || null);
      setCuentasEntregadas(Array.isArray(parsed.cuentas) ? parsed.cuentas : []);
    } catch {
      setPedidoEntregadoId(null);
      setCuentasEntregadas([]);
    }
  };

  const guardarUltimaEntrega = (
    pedidoId: string,
    cuentas: CuentaEntregada[],
  ) => {
    setPedidoEntregadoId(pedidoId);
    setCuentasEntregadas(cuentas);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        "ultima_entrega_creditos",
        JSON.stringify({ pedido_id: pedidoId, cuentas }),
      );
    }
  };

  const ocultarUltimaEntrega = () => {
    setPedidoEntregadoId(null);
    setCuentasEntregadas([]);

    if (typeof window !== "undefined") {
      window.localStorage.removeItem("ultima_entrega_creditos");
    }
  };

  const cargarUltimoPedidoPendiente = () => {
    if (typeof window === "undefined") return;

    try {
      const data = window.localStorage.getItem("ultimo_pedido_pendiente");
      if (!data) return;

      const parsed = JSON.parse(data) as PedidoPendiente;
      if (!parsed?.id) return;

      setPedidoPendiente(parsed);
    } catch {
      setPedidoPendiente(null);
    }
  };

  const guardarPedidoPendiente = (pedido: PedidoPendiente) => {
    setPedidoPendiente(pedido);

    if (typeof window !== "undefined") {
      window.localStorage.setItem("ultimo_pedido_pendiente", JSON.stringify(pedido));
    }
  };

  const ocultarPedidoPendiente = () => {
    setPedidoPendiente(null);

    if (typeof window !== "undefined") {
      window.localStorage.removeItem("ultimo_pedido_pendiente");
    }
  };

  const unidades = useMemo(() => {
    return carrito.reduce((acc, item) => acc + item.cantidad, 0);
  }, [carrito]);

  const totalOriginal = totalCarrito();
  const montoDescuento = (totalOriginal * descuento) / 100;
  const totalFinal = Math.max(totalOriginal - montoDescuento, 0);
  const saldoCredito = Number(creditoUsuario?.saldo || 0);
  const creditoActivo = creditoUsuario?.estado === "activo";
  const creditoSuficiente = creditoActivo && saldoCredito >= totalFinal;
  const pagoConCreditos = metodoPago === "Créditos";

  const aumentarCantidad = (id: string, cantidadActual: number) => {
    cambiarCantidadCarrito(id, cantidadActual + 1);
    cargarCarrito();
  };

  const disminuirCantidad = (id: string, cantidadActual: number) => {
    cambiarCantidadCarrito(id, cantidadActual - 1);
    cargarCarrito();
  };

  const eliminarProducto = (id: string) => {
    quitarDelCarrito(id);
    cargarCarrito();
    toast.success("Producto eliminado");
  };

  const vaciarCarrito = () => {
    const confirmar = confirm("¿Seguro que quieres vaciar el carrito?");
    if (!confirmar) return;

    limpiarCarrito();
    cargarCarrito();
    setCodigoCupon("");
    setDescuento(0);
    setCuponAplicado(null);
    setMetodoPago("");
    setComprobante(null);
    setPreviewComprobante(null);
    toast.success("Carrito vacío");
  };

  const aplicarCupon = async () => {
    if (!codigoCupon.trim()) {
      toast.error("Ingresa un cupón");
      return;
    }

    const data = await validarCupon(codigoCupon.trim());

    if (!data) {
      toast.error("Cupón inválido o inactivo");
      return;
    }

    setDescuento(data.descuento);
    setCuponAplicado(data.codigo);
    toast.success(`Cupón aplicado: ${data.descuento}%`);
  };

  const quitarCupon = () => {
    setCodigoCupon("");
    setDescuento(0);
    setCuponAplicado(null);
    toast.success("Cupón removido");
  };

  const subirComprobante = async (pedidoId: string) => {
    if (!comprobante) {
      throw new Error("Debes adjuntar el comprobante de pago.");
    }

    setSubiendoComprobante(true);

    try {
      const extension = comprobante.name.split(".").pop() || "jpg";
      const nombreLimpio = limpiarNombreArchivo(comprobante.name);
      const fileName = `pedido-${pedidoId}-${Date.now()}-${nombreLimpio || `comprobante.${extension}`}`;
      const filePath = `pedidos/${fileName}`;

      const { data, error } = await supabase.storage
        .from(COMPROBANTES_BUCKET)
        .upload(filePath, comprobante, {
          cacheControl: "3600",
          upsert: false,
          contentType: comprobante.type || "image/jpeg",
        });

      if (error) {
        console.error("ERROR SUBIENDO COMPROBANTE:", error);
        throw new Error(
          `No se pudo subir el comprobante: ${error.message || "revisa policies del bucket"}`,
        );
      }

      console.log("Archivo subido:", data);

      const { data: publicUrlData } = supabase.storage
        .from(COMPROBANTES_BUCKET)
        .getPublicUrl(filePath);

      if (!publicUrlData?.publicUrl) {
        throw new Error(
          "El comprobante se subió, pero no se pudo generar el link público.",
        );
      }

      console.log("URL pública comprobante:", publicUrlData.publicUrl);

      return publicUrlData.publicUrl;
    } finally {
      setSubiendoComprobante(false);
    }
  };

  const guardarComprobanteEnTabla = async (
    pedido: PedidoCreado,
    comprobanteUrl: string,
  ) => {
    const usuarioLocal = leerUsuarioLocal();

    const payload = {
      pedido_id: pedido.id,
      usuario_id: pedido.usuario_id || usuarioLocal?.id || null,
      cliente_nombre:
        pedido.cliente_nombre || usuarioLocal?.nombre || "Cliente Jonas Stream",
      cliente_correo: pedido.cliente_correo || usuarioLocal?.correo || "",
      url: comprobanteUrl,
      archivo_url: comprobanteUrl,
      imagen_url: comprobanteUrl,
      comprobante_url: comprobanteUrl,
      estado: "pendiente",
      metodo_pago: metodoPago,
      monto: totalFinal,
      detalle: `Pedido #${pedido.id.slice(0, 8)} · ${carrito.length} producto(s) · ${unidades} unidad(es)`,
    };

    const { error } = await supabase.from("comprobantes").insert([payload]);

    if (error) {
      console.error("ERROR INSERTANDO COMPROBANTE:", error);
      throw new Error(
        error.message ||
          "El comprobante subió, pero no se pudo registrar en la tabla comprobantes",
      );
    }
  };

  const seleccionarComprobante = (file?: File) => {
    if (!file) {
      setComprobante(null);
      setPreviewComprobante(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Sube una imagen válida");
      return;
    }

    if (previewComprobante) {
      URL.revokeObjectURL(previewComprobante);
    }

    setComprobante(file);
    setPreviewComprobante(URL.createObjectURL(file));
  };

  const finalizarCompra = async () => {
    try {
      if (carrito.length === 0) {
        toast.error("Tu carrito está vacío");
        return;
      }

      if (!metodoPago) {
        toast.error("Selecciona un método de pago");
        return;
      }

      if (pagoConCreditos) {
        if (!creditoActivo) {
          toast.error("Tus créditos no están activos");
          return;
        }

        if (!creditoSuficiente) {
          toast.error("No tienes créditos suficientes para esta compra");
          return;
        }

        setProcesandoPedido(true);

        const pedidoCredito = await comprarConCreditos(totalFinal, descuento);

        cargarCarrito();
        await cargarCreditoUsuario();
        setCodigoCupon("");
        setDescuento(0);
        setCuponAplicado(null);
        setMetodoPago("");
        setComprobante(null);
        setPreviewComprobante(null);

        if (pedidoCredito.cuentas_asignadas) {
          const cuentas = Array.isArray(pedidoCredito.cuentas_entregadas)
            ? (pedidoCredito.cuentas_entregadas as CuentaEntregada[])
            : [];

          guardarUltimaEntrega(pedidoCredito.id, cuentas);
          toast.success(
            "Compra con créditos completada. Tu cuenta fue asignada.",
          );

          const mensajeWhatsAppCreditos = `✅ *COMPRA CON CRÉDITOS - JONAS STREAM*

📌 *Pedido ID:*
${pedidoCredito.id}

💳 *Pago:*
• Método: Créditos
• Total: S/ ${totalFinal.toFixed(2)}

📦 *Productos:*
${carrito
  .map(
    (p) =>
      `• ${p.nombre} x${p.cantidad} — S/ ${(Number(p.precio || 0) * p.cantidad).toFixed(2)}`,
  )
  .join("\n")}

✅ *Pedido completado automáticamente.*`;

          window.open(
            buildWhatsAppLink(mensajeWhatsAppCreditos),
            "_blank",
            "noopener,noreferrer",
          );
        } else {
          toast.error(
            "Pedido creado, pero falta cuenta disponible. El admin lo revisará.",
          );

          const mensajeWhatsAppCreditosPendiente = `🧾 *PEDIDO CON CRÉDITOS - JONAS STREAM*

📌 *Pedido ID:*
${pedidoCredito.id}

💳 *Pago:*
• Método: Créditos
• Total: S/ ${totalFinal.toFixed(2)}

📦 *Productos:*
${carrito
  .map(
    (p) =>
      `• ${p.nombre} x${p.cantidad} — S/ ${(Number(p.precio || 0) * p.cantidad).toFixed(2)}`,
  )
  .join("\n")}

⚠️ *Pedido registrado, pendiente de asignación por admin.*`;

          window.open(
            buildWhatsAppLink(mensajeWhatsAppCreditosPendiente),
            "_blank",
            "noopener,noreferrer",
          );
        }

        return;
      }

      if (!comprobante) {
        toast.error("Adjunta la imagen del comprobante");
        return;
      }

      setProcesandoPedido(true);

      const pedido = (await crearPedido(
        metodoPago,
        totalFinal,
        descuento,
      )) as PedidoCreado;
      const comprobanteUrl = await subirComprobante(pedido.id);

      const { error: comprobantePedidoError } = await supabase
        .from("pedidos")
        .update({
          comprobante_url: comprobanteUrl,
          voucher_url: comprobanteUrl,
          captura_pago: comprobanteUrl,
          comprobante: comprobanteUrl,
        })
        .eq("id", pedido.id);

      if (comprobantePedidoError) {
        console.error(
          "ERROR GUARDANDO COMPROBANTE EN PEDIDO:",
          comprobantePedidoError,
        );
        throw new Error(
          comprobantePedidoError.message ||
            "El comprobante subió, pero no se pudo guardar en el pedido",
        );
      }

      await guardarComprobanteEnTabla(pedido, comprobanteUrl);

      // 🔥 AGRUPAR PRODUCTOS POR TIPO
      // Detecta "Cuenta completa", "cuenta completa", "CUENTA", etc.
      const cuentas = carrito.filter((p) => esCuentaCompleta(p.tipo_venta));
      const perfiles = carrito.filter((p) => !esCuentaCompleta(p.tipo_venta));

      const listaCuentas = cuentas
        .map(
          (p) =>
            `• ${p.nombre} x${p.cantidad} — S/ ${(Number(p.precio || 0) * p.cantidad).toFixed(2)}`,
        )
        .join("\n");

      const listaPerfiles = perfiles
        .map(
          (p) =>
            `• ${p.nombre} x${p.cantidad} — S/ ${(Number(p.precio || 0) * p.cantidad).toFixed(2)}`,
        )
        .join("\n");

      const productosTexto = [
        cuentas.length ? `*🔥 Cuenta completa*\n${listaCuentas}` : "",
        perfiles.length ? `*👤 Perfil*\n${listaPerfiles}` : "",
      ]
        .filter(Boolean)
        .join("\n\n");

      const pedidoPendienteParaMostrar: PedidoPendiente = {
        id: pedido.id,
        metodo_pago: metodoPago,
        total: totalFinal,
        fecha: new Date().toISOString(),
        productos: carrito.map((item) => ({ ...item })),
        comprobante_url: comprobanteUrl,
      };

      const mensajeWhatsApp = `🧾 *NUEVO PEDIDO - JONAS STREAM*

📌 *Pedido ID:*
${pedido.id}

💳 *Pago:*
• Método: ${metodoPago}
• Comprobante: ${comprobanteUrl}

📦 *Productos:*
${productosTexto}

💰 *Resumen:*
• Subtotal: S/ ${totalOriginal.toFixed(2)}
• Descuento: S/ ${montoDescuento.toFixed(2)}
• *Total: S/ ${totalFinal.toFixed(2)}*

✅ *Quedo atento a la confirmación de mi compra.*`;

      toast.success("Pedido creado. Redirigiendo a WhatsApp...");

      const whatsappUrl = buildWhatsAppLink(mensajeWhatsApp);

      window.open(whatsappUrl, "_blank", "noopener,noreferrer");

      guardarPedidoPendiente(pedidoPendienteParaMostrar);
      ocultarUltimaEntrega();

      cargarCarrito();
      setCodigoCupon("");
      setDescuento(0);
      setCuponAplicado(null);
      setMetodoPago("");
      setComprobante(null);
      setPreviewComprobante(null);
    } catch (error) {
      console.error("ERROR REAL CREANDO PEDIDO:", error);
      const mensaje =
        error instanceof Error
          ? error.message
          : "Ocurrió un error al crear el pedido";
      toast.error(mensaje);
    } finally {
      setProcesandoPedido(false);
      setSubiendoComprobante(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.bgGlowOne} />
      <div className={styles.bgGlowTwo} />
      <div className={styles.gridOverlay} />

      <div className={styles.sideBrand}>JONAS STREAM</div>
      <div className={`${styles.sideBrand} ${styles.sideBrandRight}`}>
        JONAS STREAM
      </div>

      <header className={styles.topbarWrap}>
        <div className={styles.topbar}>
          <Link
            href="/"
            className={styles.brandBlock}
            aria-label="Ir al inicio"
          >
            <strong>JONAS STREAM</strong>
            <span>TIENDA OFICIAL</span>
          </Link>

          <div className={styles.topActions}>
            <Link href="/" className={styles.topLink}>
              INICIO
            </Link>

            <Link href="/tienda" className={styles.topLink}>
              TIENDA
            </Link>

            <Link href="/cliente" className={styles.topLink}>
              PANEL CLIENTE
            </Link>

            <a
              href="https://wa.me/51900557949?text=Hola%20Jonas%20Stream%2C%20quiero%20informaci%C3%B3n"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.topLinkPrimary}
            >
              CONTÁCTANOS
            </a>
          </div>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroBadge}>CHECKOUT JONAS STREAM</div>

        <h1 className={styles.heroTitle}>
          TU CARRITO
          <span> DE COMPRA</span>
        </h1>

        <p className={styles.heroText}>
          Revisa tus productos seleccionados, modifica cantidades, aplica
          cupones y crea tu pedido de forma segura.
        </p>

        <div className={styles.heroActions}>
          <Link href="/tienda" className={styles.heroBtnPrimary}>
            Seguir comprando
          </Link>

          {carrito.length > 0 && (
            <button
              type="button"
              onClick={vaciarCarrito}
              className={styles.heroBtnDanger}
            >
              Vaciar carrito
            </button>
          )}
        </div>
      </section>

      {carrito.length === 0 ? (
        cuentasEntregadas.length > 0 ? (
          <section className={styles.deliverySection}>
            <div className={styles.deliveryIcon}>✓</div>
            <span className={styles.sectionKicker}>ENTREGA AUTOMÁTICA</span>
            <h2>Tu cuenta fue entregada</h2>
            <p>
              Guarda estos datos. También podrás verlos luego en tu panel cliente.
            </p>

            {pedidoEntregadoId && (
              <div className={styles.deliveryOrder}>
                Pedido #{pedidoEntregadoId.slice(0, 8)}
              </div>
            )}

            <div className={styles.deliveryGrid}>
              {cuentasEntregadas.map((cuenta) => (
                <article key={cuenta.id} className={styles.deliveryCard}>
                  <span>{cuenta.producto_nombre || "Producto"}</span>
                  <h3>{cuenta.correo}</h3>
                  <div>
                    <small>Contraseña</small>
                    <strong>{cuenta.clave}</strong>
                  </div>
                  <p>
                    Vigencia: {formatearRangoVigencia(cuenta.cliente_inicio, cuenta.cliente_fin)}
                  </p>
                </article>
              ))}
            </div>

            <div className={styles.deliveryActions}>
              <Link href="/cliente" className={styles.emptyButton}>
                Ver panel cliente
              </Link>

              <button
                type="button"
                onClick={ocultarUltimaEntrega}
                className={styles.hideDeliveryButton}
              >
                Ocultar entrega
              </button>
            </div>
          </section>
        ) : pedidoPendiente ? (
          <section className={styles.pendingSection}>
            <div className={styles.pendingIcon}>⌛</div>
            <span className={styles.sectionKicker}>ENTREGA PENDIENTE</span>
            <h2>Pedido registrado</h2>
            <p>
              Tu pedido fue creado correctamente. Cuando el administrador valide tu pago,
              se asignará una cuenta disponible y podrás verla en tu panel cliente o en /codigos.
            </p>

            <div className={styles.pendingOrder}>
              Pedido #{pedidoPendiente.id.slice(0, 8)}
            </div>

            <div className={styles.pendingGrid}>
              <article className={styles.pendingInfoCard}>
                <span>Estado</span>
                <strong>Pendiente de verificación</strong>
              </article>
              <article className={styles.pendingInfoCard}>
                <span>Método de pago</span>
                <strong>{pedidoPendiente.metodo_pago}</strong>
              </article>
              <article className={styles.pendingInfoCard}>
                <span>Total</span>
                <strong>S/ {pedidoPendiente.total.toFixed(2)}</strong>
              </article>
              <article className={styles.pendingInfoCard}>
                <span>Fecha</span>
                <strong>{formatearFechaEntrega(pedidoPendiente.fecha)}</strong>
              </article>
            </div>

            <div className={styles.pendingProducts}>
              <span>Productos registrados</span>
              <div className={styles.pendingProductList}>
                {pedidoPendiente.productos.map((item) => (
                  <div key={item.id}>
                    <strong>{item.nombre}</strong>
                    <small>
                      {item.cantidad} unidad(es) · S/{" "}
                      {(Number(item.precio || 0) * item.cantidad).toFixed(2)}
                    </small>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.deliveryActions}>
              <Link href="/cliente" className={styles.emptyButton}>
                Ver panel cliente
              </Link>
              <Link href="/codigos" className={styles.emptyButton}>
                Ir a códigos
              </Link>
              <a
                href={buildWhatsAppLink(`Hola Jonas Stream, quiero consultar el estado de mi pedido #${pedidoPendiente.id.slice(0, 8)}.`)}
                target="_blank"
                rel="noreferrer"
                className={styles.pendingWhatsappButton}
              >
                Soporte WhatsApp
              </a>
              <button
                type="button"
                onClick={ocultarPedidoPendiente}
                className={styles.hideDeliveryButton}
              >
                Ocultar aviso
              </button>
            </div>
          </section>
        ) : (
          <section className={styles.emptySection}>
            <div className={styles.emptyIcon}>🛒</div>
            <h2>Tu carrito está vacío</h2>
            <p>
              Agrega productos desde la tienda para continuar con tu compra.
            </p>

            <Link href="/tienda" className={styles.emptyButton}>
              Ir a la tienda
            </Link>
          </section>
        )
      ) : (
        <section className={styles.checkoutGrid}>
          <div className={styles.productsPanel}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionKicker}>
                PRODUCTOS SELECCIONADOS
              </span>
              <h2 className={styles.sectionTitle}>Detalle de compra</h2>
            </div>

            <div className={styles.productsList}>
              {carrito.map((producto) => (
                <article key={producto.id} className={styles.cartCard}>
                  <div className={styles.imageWrap}>
                    {producto.imagen ? (
                      <img
                        src={producto.imagen}
                        alt={producto.nombre}
                        className={styles.image}
                      />
                    ) : (
                      <div className={styles.imagePlaceholder}>JS</div>
                    )}
                  </div>

                  <div className={styles.productInfo}>
                    <span className={styles.category}>
                      {producto.categoria || "General"}
                    </span>
                    <h3>{producto.nombre}</h3>
                    <p>{producto.tipo_venta || "Producto digital"}</p>

                    <div className={styles.unitPrice}>
                      <small>Precio unitario</small>
                      <strong>
                        S/ {Number(producto.precio || 0).toFixed(2)}
                      </strong>
                    </div>

                    <div className={styles.qtyControl}>
                      <button
                        type="button"
                        onClick={() =>
                          disminuirCantidad(producto.id, producto.cantidad)
                        }
                      >
                        −
                      </button>

                      <span>{producto.cantidad}</span>

                      <button
                        type="button"
                        onClick={() =>
                          aumentarCantidad(producto.id, producto.cantidad)
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className={styles.productTotal}>
                    <span>Subtotal</span>
                    <strong>
                      S/ {(producto.precio * producto.cantidad).toFixed(2)}
                    </strong>

                    <button
                      type="button"
                      onClick={() => eliminarProducto(producto.id)}
                      className={styles.removeButton}
                    >
                      Eliminar
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className={styles.summaryPanel}>
            <div className={styles.summaryHeader}>
              <span>Resumen</span>
              <h2>Tu pedido</h2>
            </div>

            <div className={styles.summaryRows}>
              <div className={styles.summaryRow}>
                <span>Productos</span>
                <strong>{carrito.length}</strong>
              </div>

              <div className={styles.summaryRow}>
                <span>Unidades</span>
                <strong>{unidades}</strong>
              </div>

              <div className={styles.line} />

              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <strong>S/ {totalOriginal.toFixed(2)}</strong>
              </div>

              {descuento > 0 && (
                <div className={`${styles.summaryRow} ${styles.discountRow}`}>
                  <span>Descuento ({descuento}%)</span>
                  <strong>- S/ {montoDescuento.toFixed(2)}</strong>
                </div>
              )}

              <div className={styles.line} />

              <div className={styles.totalRow}>
                <span>Total</span>
                <strong>S/ {totalFinal.toFixed(2)}</strong>
              </div>
            </div>

            <div className={styles.couponBox}>
              <span>CUPÓN DE DESCUENTO</span>

              <div className={styles.couponGrid}>
                <input
                  type="text"
                  placeholder="Código de cupón"
                  value={codigoCupon}
                  onChange={(event) =>
                    setCodigoCupon(event.target.value.toUpperCase())
                  }
                />

                <button type="button" onClick={aplicarCupon}>
                  Aplicar
                </button>
              </div>

              {cuponAplicado && (
                <div className={styles.appliedCoupon}>
                  <p>Cupón aplicado: {cuponAplicado}</p>
                  <button type="button" onClick={quitarCupon}>
                    Quitar
                  </button>
                </div>
              )}
            </div>

            <div
              className={`${styles.creditBox} ${creditoSuficiente ? styles.creditBoxActive : ""}`}
            >
              <span>CRÉDITOS JONAS STREAM</span>
              <strong>S/ {saldoCredito.toFixed(2)}</strong>
              <small>
                {creditoUsuario
                  ? creditoActivo
                    ? creditoSuficiente
                      ? "Saldo suficiente para pagar este carrito con créditos."
                      : "Saldo insuficiente para cubrir el total actual."
                    : "Tu saldo existe, pero está inactivo."
                  : "No tienes créditos asignados o no iniciaste sesión."}
              </small>
            </div>

            <div className={styles.paymentBox}>
              <span>MÉTODO DE PAGO</span>

              <div className={styles.paymentGrid}>
                {["Yape", "Plin", "Bim", "Binance", "Créditos"].map(
                  (metodo) => (
                    <button
                      key={metodo}
                      type="button"
                      onClick={() => setMetodoPago(metodo)}
                      className={
                        metodoPago === metodo ? styles.paymentActive : ""
                      }
                    >
                      {metodo}
                    </button>
                  ),
                )}
              </div>

              {!pagoConCreditos && (
                <label className={styles.uploadBox}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      seleccionarComprobante(event.target.files?.[0])
                    }
                  />

                  <strong>
                    {comprobante ? comprobante.name : "Adjuntar comprobante"}
                  </strong>
                  <small>
                    Sube una captura o foto del pago. Se guardará en tu pedido y
                    el admin podrá revisarlo.
                  </small>

                  {previewComprobante && (
                    <div className={styles.previewBox}>
                      <img
                        src={previewComprobante}
                        alt="Vista previa del comprobante"
                      />
                    </div>
                  )}
                </label>
              )}
            </div>

            <button
              type="button"
              className={styles.createOrderButton}
              onClick={finalizarCompra}
              disabled={procesandoPedido || subiendoComprobante}
            >
              {procesandoPedido || subiendoComprobante
                ? "Procesando pedido..."
                : pagoConCreditos
                  ? "Comprar con créditos"
                  : "Crear pedido"}
            </button>

            <p className={styles.summaryNote}>
              {pagoConCreditos
                ? "Al pagar con créditos, el pedido se completa automáticamente y se asigna una cuenta disponible."
                : "Al crear el pedido se registrará con estado pendiente para continuar el proceso de confirmación."}
            </p>
          </aside>
        </section>
      )}
    </main>
  );
}
