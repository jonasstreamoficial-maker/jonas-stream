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
import { validarCupon } from "@/lib/cupones";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import styles from "./carrito.module.css";

const WHATSAPP_NUMBER = "51900557949";

function buildWhatsAppLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export default function CarritoPage() {
  const [carrito, setCarrito] = useState<ProductoCarrito[]>([]);
  const [procesandoPedido, setProcesandoPedido] = useState(false);
  const [codigoCupon, setCodigoCupon] = useState("");
  const [descuento, setDescuento] = useState(0);
  const [cuponAplicado, setCuponAplicado] = useState<string | null>(null);
  const [metodoPago, setMetodoPago] = useState("");
  const [comprobante, setComprobante] = useState<File | null>(null);
  const [subiendoComprobante, setSubiendoComprobante] = useState(false);

  const cargarCarrito = () => {
    setCarrito(obtenerCarrito());
  };

  useEffect(() => {
    cargarCarrito();

    const handleFocus = () => cargarCarrito();
    window.addEventListener("focus", handleFocus);

    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const unidades = useMemo(() => {
    return carrito.reduce((acc, item) => acc + item.cantidad, 0);
  }, [carrito]);

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
    if (!comprobante) return "";

    setSubiendoComprobante(true);

    const extension = comprobante.name.split(".").pop() || "jpg";
    const fileName = `pedido-${pedidoId}-${Date.now()}.${extension}`;
    const filePath = `pedidos/${fileName}`;

    const { error } = await supabase.storage
      .from("comprobantes")
      .upload(filePath, comprobante, {
        cacheControl: "3600",
        upsert: false,
      });

    setSubiendoComprobante(false);

    if (error) {
      throw new Error("No se pudo subir el comprobante. Verifica el bucket comprobantes.");
    }

    const { data } = supabase.storage.from("comprobantes").getPublicUrl(filePath);

    return data.publicUrl;
  };

  const finalizarCompra = async () => {
    try {
      if (!metodoPago) {
        toast.error("Selecciona un método de pago");
        return;
      }

      if (!comprobante) {
        toast.error("Adjunta la imagen del comprobante");
        return;
      }

      setProcesandoPedido(true);

      const productosPedido = carrito.map((producto) => ({
        nombre: producto.nombre,
        cantidad: producto.cantidad,
        precio: Number(producto.precio || 0),
        subtotal: Number(producto.precio || 0) * producto.cantidad,
      }));

      const pedido = await crearPedido("pendiente");
      const comprobanteUrl = await subirComprobante(pedido.id);

      const detalleProductos = productosPedido
        .map(
          (producto) =>
            `• ${producto.nombre} x${producto.cantidad} - S/ ${producto.subtotal.toFixed(2)}`
        )
        .join("\n");

      const mensajeWhatsApp = `Hola Jonas Stream, acabo de crear un pedido.\n\nPedido ID: ${
        pedido.id
      }\n\nMétodo de pago: ${metodoPago}\nComprobante: ${
        comprobanteUrl || "Pendiente de revisión"
      }\n\nProductos:\n${detalleProductos}\n\nSubtotal: S/ ${totalOriginal.toFixed(
        2
      )}\nDescuento: S/ ${montoDescuento.toFixed(2)}\nTotal: S/ ${totalFinal.toFixed(
        2
      )}\n\nQuiero continuar con la confirmación de mi compra.`;

      toast.success(`Pedido creado correctamente. ID: ${pedido.id}`);

      window.open(buildWhatsAppLink(mensajeWhatsApp), "_blank", "noopener,noreferrer");

      cargarCarrito();
      setCodigoCupon("");
      setDescuento(0);
      setCuponAplicado(null);
      setMetodoPago("");
      setComprobante(null);
    } catch (error) {
      const mensaje =
        error instanceof Error ? error.message : "Ocurrió un error al crear el pedido";
      toast.error(mensaje);
    } finally {
      setProcesandoPedido(false);
      setSubiendoComprobante(false);
    }
  };

  const totalOriginal = totalCarrito();
  const montoDescuento = (totalOriginal * descuento) / 100;
  const totalFinal = Math.max(totalOriginal - montoDescuento, 0);

  return (
    <main className={styles.page}>
      <div className={styles.bgGlowOne} />
      <div className={styles.bgGlowTwo} />
      <div className={styles.gridOverlay} />

      <div className={styles.sideBrand}>JONAS STREAM</div>
      <div className={`${styles.sideBrand} ${styles.sideBrandRight}`}>JONAS STREAM</div>

      <header className={styles.topbarWrap}>
        <div className={styles.topbar}>
          <Link href="/" className={styles.brandBlock} aria-label="Ir al inicio">
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
          Revisa tus productos seleccionados, modifica cantidades, aplica cupones y crea tu
          pedido de forma segura.
        </p>

        <div className={styles.heroActions}>
          <Link href="/tienda" className={styles.heroBtnPrimary}>
            Seguir comprando
          </Link>

          {carrito.length > 0 && (
            <button type="button" onClick={vaciarCarrito} className={styles.heroBtnDanger}>
              Vaciar carrito
            </button>
          )}
        </div>
      </section>

      {carrito.length === 0 ? (
        <section className={styles.emptySection}>
          <div className={styles.emptyIcon}>🛒</div>
          <h2>Tu carrito está vacío</h2>
          <p>Agrega productos desde la tienda para continuar con tu compra.</p>

          <Link href="/tienda" className={styles.emptyButton}>
            Ir a la tienda
          </Link>
        </section>
      ) : (
        <section className={styles.checkoutGrid}>
          <div className={styles.productsPanel}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionKicker}>PRODUCTOS SELECCIONADOS</span>
              <h2 className={styles.sectionTitle}>Detalle de compra</h2>
            </div>

            <div className={styles.productsList}>
              {carrito.map((producto) => (
                <article key={producto.id} className={styles.cartCard}>
                  <div className={styles.imageWrap}>
                    {producto.imagen ? (
                      <img src={producto.imagen} alt={producto.nombre} className={styles.image} />
                    ) : (
                      <div className={styles.imagePlaceholder}>JS</div>
                    )}
                  </div>

                  <div className={styles.productInfo}>
                    <span className={styles.category}>{producto.categoria || "General"}</span>
                    <h3>{producto.nombre}</h3>
                    <p>{producto.tipo_venta || "Producto digital"}</p>

                    <div className={styles.unitPrice}>
                      <small>Precio unitario</small>
                      <strong>S/ {Number(producto.precio || 0).toFixed(2)}</strong>
                    </div>

                    <div className={styles.qtyControl}>
                      <button
                        type="button"
                        onClick={() => disminuirCantidad(producto.id, producto.cantidad)}
                      >
                        −
                      </button>

                      <span>{producto.cantidad}</span>

                      <button
                        type="button"
                        onClick={() => aumentarCantidad(producto.id, producto.cantidad)}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className={styles.productTotal}>
                    <span>Subtotal</span>
                    <strong>S/ {(producto.precio * producto.cantidad).toFixed(2)}</strong>

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
                  onChange={(event) => setCodigoCupon(event.target.value.toUpperCase())}
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

            <div className={styles.paymentBox}>
              <span>MÉTODO DE PAGO</span>

              <div className={styles.paymentGrid}>
                {["Yape", "Plin", "Bim", "Binance"].map((metodo) => (
                  <button
                    key={metodo}
                    type="button"
                    onClick={() => setMetodoPago(metodo)}
                    className={metodoPago === metodo ? styles.paymentActive : ""}
                  >
                    {metodo}
                  </button>
                ))}
              </div>

              <label className={styles.uploadBox}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setComprobante(event.target.files?.[0] || null)}
                />

                <strong>{comprobante ? comprobante.name : "Adjuntar comprobante"}</strong>
                <small>Sube una captura o foto del pago. Se enviará como link por WhatsApp.</small>
              </label>
            </div>

            <button
              type="button"
              className={styles.createOrderButton}
              onClick={finalizarCompra}
              disabled={procesandoPedido || subiendoComprobante}
            >
              {procesandoPedido || subiendoComprobante ? "Procesando pedido..." : "Crear pedido"}
            </button>

            <p className={styles.summaryNote}>
              Al crear el pedido se registrará con estado pendiente para continuar el proceso de
              confirmación.
            </p>
          </aside>
        </section>
      )}
    </main>
  );
}
