"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import styles from "./cliente.module.css";

type Usuario = {
  id: string;
  nombre?: string | null;
  correo?: string | null;
  rol?: string | null;
  estado?: string | null;
  celular?: string | null;
  celular_completo?: string | null;
};

type Pedido = {
  id: string;
  usuario_id?: string | null;
  cliente_nombre?: string | null;
  cliente_correo?: string | null;
  total?: number | null;
  estado?: string | null;
  metodo_pago?: string | null;
  created_at?: string | null;
};

type Producto = {
  id: string;
  nombre?: string | null;
  imagen?: string | null;
  categoria?: string | null;
  tipo_venta?: string | null;
};

type PedidoItem = {
  id?: string;
  pedido_id: string;
  producto_id?: string | null;
  cantidad?: number | null;
  precio?: number | null;
};

type CuentaProducto = {
  id: string;
  producto_id?: string | null;
  producto_nombre?: string | null;
  correo: string;
  clave: string;
  perfil?: string | null;
  pin_perfil?: string | null;
  pin_acceso?: string | null;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  cliente_inicio?: string | null;
  cliente_fin?: string | null;
  estado: string;
  pedido_id?: string | null;
  cliente_id?: string | null;
  cliente_nombre?: string | null;
  cliente_correo?: string | null;
  observacion_admin?: string | null;
  notas?: string | null;
  created_at?: string | null;
};

type Credito = {
  id: string;
  usuario_id: string;
  saldo?: number | null;
  estado?: string | null;
  created_at?: string | null;
};


type SoporteEstado = "pendiente" | "en_proceso" | "entregado";

type SoporteTicket = {
  id: string;
  usuario_id: string;
  cuenta_id?: string | null;
  pedido_id?: string | null;
  producto_id?: string | null;
  cliente_nombre?: string | null;
  cliente_correo?: string | null;
  producto_nombre?: string | null;
  cuenta_correo?: string | null;
  problema?: string | null;
  mensaje?: string | null;
  estado?: SoporteEstado | string | null;
  dias_compensacion?: number | null;
  respuesta_admin?: string | null;
  fecha_reporte?: string | null;
  fecha_resuelto?: string | null;
  created_at?: string | null;
};

type SectionId = "dashboard" | "compras" | "accesos" | "creditos" | "soporte" | "telegram";

function formatMoney(value?: number | null) {
  return `S/ ${Number(value || 0).toFixed(2)}`;
}

function formatDate(value?: string | null) {
  if (!value) return "Sin fecha";
  const date = value.includes("T") ? new Date(value) : new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "Sin fecha";
  return date.toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });
}

function getDiasRestantes(fecha?: string | null) {
  if (!fecha) return null;
  const fin = fecha.includes("T") ? new Date(fecha) : new Date(`${fecha}T00:00:00`);
  if (Number.isNaN(fin.getTime())) return null;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  fin.setHours(0, 0, 0, 0);
  return Math.ceil((fin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
}

function estadoPedidoClass(estado?: string | null) {
  const value = String(estado || "pendiente").toLowerCase();
  if (value === "completado" || value === "entregado" || value === "pagado") return styles.statusOk;
  if (value === "cancelado" || value === "rechazado") return styles.statusBad;
  return styles.statusWait;
}

function normalizarFiltro(value?: string | null) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();
}

function tipoAccesoKey(cuenta?: CuentaProducto | null, producto?: Producto | null) {
  const texto = normalizarFiltro(
    [producto?.tipo_venta, producto?.categoria, cuenta?.producto_nombre, cuenta?.perfil].filter(Boolean).join(" ")
  );

  if (texto.includes("perfil")) return "perfil";
  if (texto.includes("completa") || texto.includes("cuenta completa") || texto.includes("premium")) return "cuenta_completa";
  return "otros";
}

function tipoAccesoLabel(cuenta?: CuentaProducto | null, producto?: Producto | null) {
  const tipo = tipoAccesoKey(cuenta, producto);
  if (tipo === "perfil") return "Perfil";
  if (tipo === "cuenta_completa") return "Cuenta completa";
  return producto?.tipo_venta || producto?.categoria || "Acceso digital";
}

function pedidoEstadoLabel(estado?: string | null) {
  const value = String(estado || "pendiente").toLowerCase();
  if (value === "completado" || value === "entregado" || value === "pagado") return "Completado";
  if (value === "cancelado" || value === "rechazado") return "Cancelado";
  return "Pendiente";
}

function uniqueById<T extends { id: string }>(items: T[]) {
  return Array.from(new Map(items.map((item) => [item.id, item])).values());
}

export default function ClientePage() {
  const router = useRouter();

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [pedidoItems, setPedidoItems] = useState<PedidoItem[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cuentas, setCuentas] = useState<CuentaProducto[]>([]);
  const [creditos, setCreditos] = useState<Credito[]>([]);
  const [soportes, setSoportes] = useState<SoporteTicket[]>([]);
  const [soporteCuentaId, setSoporteCuentaId] = useState("");
  const [soporteProblema, setSoporteProblema] = useState("Cuenta caída");
  const [soporteMensaje, setSoporteMensaje] = useState("");
  const [enviandoSoporte, setEnviandoSoporte] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId>("dashboard");
  const [busquedaCompras, setBusquedaCompras] = useState("");
  const [estadoCompras, setEstadoCompras] = useState("todos");
  const [metodoCompras, setMetodoCompras] = useState("todos");
  const [busquedaAccesos, setBusquedaAccesos] = useState("");
  const [tipoAccesos, setTipoAccesos] = useState("todos");
  const [estadoAccesos, setEstadoAccesos] = useState("todos");

  useEffect(() => {
    cargarPanelCliente();
  }, []);

  const cargarPanelCliente = async () => {
    try {
      const response = await fetch("/api/cliente/resumen", {
        method: "GET",
        cache: "no-store",
      });

      if (response.status === 401) {
        router.replace("/login");
        return;
      }

      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.error || "No se pudo cargar el panel cliente");
      }

      setUsuario(payload.usuario || null);
      setPedidos((payload.pedidos || []) as Pedido[]);
      setCreditos((payload.creditos || []) as Credito[]);
      setSoportes((payload.soportes || []) as SoporteTicket[]);
      setCuentas((payload.cuentas || []) as CuentaProducto[]);
      setPedidoItems((payload.pedido_items || []) as PedidoItem[]);
      setProductos((payload.productos || []) as Producto[]);
    } catch (error) {
      console.error("Error cargando panel cliente:", error);
      toast.error("No se pudo cargar tu panel cliente");
    }
  };

  const nombre = usuario?.nombre || usuario?.correo?.split("@")[0] || "Cliente";
  const saldo = creditos
    .filter((credito) => String(credito.estado || "activo").toLowerCase() === "activo")
    .reduce((acc, credito) => acc + Number(credito.saldo || 0), 0);

  const productoPorId = useMemo(() => new Map(productos.map((producto) => [producto.id, producto])), [productos]);

  const itemsPorPedido = useMemo(() => {
    const map = new Map<string, PedidoItem[]>();
    pedidoItems.forEach((item) => {
      const actuales = map.get(item.pedido_id) || [];
      actuales.push(item);
      map.set(item.pedido_id, actuales);
    });
    return map;
  }, [pedidoItems]);

  const cuentasActivas = cuentas.filter((cuenta) => {
    const estado = String(cuenta.estado || "").toLowerCase();
    return estado === "asignada" || estado === "entregada" || estado === "activo";
  });

  const proximosVencimientos = useMemo(() => {
    return cuentasActivas
      .filter((cuenta) => {
        const dias = getDiasRestantes(cuenta.cliente_fin || cuenta.fecha_fin);
        return dias !== null && dias <= 7;
      })
      .slice(0, 5);
  }, [cuentasActivas]);

  const soportesAbiertos = soportes.filter((item) => String(item.estado || "pendiente").toLowerCase() !== "entregado");

  const pedidosFiltrados = useMemo(() => {
    const texto = normalizarFiltro(busquedaCompras);

    return pedidos.filter((pedido) => {
      const items = itemsPorPedido.get(pedido.id) || [];
      const productosPedido = items
        .map((item) => productoPorId.get(String(item.producto_id || ""))?.nombre || "Producto")
        .join(" ");
      const estado = normalizarFiltro(pedido.estado || "pendiente");
      const metodo = normalizarFiltro(pedido.metodo_pago || "sin metodo");
      const base = normalizarFiltro([
        pedido.id,
        pedido.cliente_nombre,
        pedido.cliente_correo,
        pedido.metodo_pago,
        pedido.estado,
        productosPedido,
        formatMoney(pedido.total),
      ].filter(Boolean).join(" "));

      const coincideTexto = !texto || base.includes(texto);
      const coincideEstado = estadoCompras === "todos" || estado.includes(estadoCompras);
      const coincideMetodo = metodoCompras === "todos" || metodo.includes(metodoCompras);

      return coincideTexto && coincideEstado && coincideMetodo;
    });
  }, [pedidos, itemsPorPedido, productoPorId, busquedaCompras, estadoCompras, metodoCompras]);

  const accesosFiltrados = useMemo(() => {
    const texto = normalizarFiltro(busquedaAccesos);

    return cuentasActivas.filter((cuenta) => {
      const producto = productoPorId.get(String(cuenta.producto_id || ""));
      const tipo = tipoAccesoKey(cuenta, producto);
      const dias = getDiasRestantes(cuenta.cliente_fin || cuenta.fecha_fin);
      const estado = normalizarFiltro(cuenta.estado);
      const base = normalizarFiltro([
        producto?.nombre,
        cuenta.producto_nombre,
        cuenta.correo,
        cuenta.perfil,
        cuenta.pin_perfil,
        cuenta.pin_acceso,
        tipoAccesoLabel(cuenta, producto),
        cuenta.pedido_id,
        estado,
      ].filter(Boolean).join(" "));

      const coincideTexto = !texto || base.includes(texto);
      const coincideTipo = tipoAccesos === "todos" || tipo === tipoAccesos;
      const coincideEstado =
        estadoAccesos === "todos" ||
        (estadoAccesos === "por_vencer" && dias !== null && dias <= 7) ||
        (estadoAccesos === "vigentes" && (dias === null || dias >= 8)) ||
        estado.includes(estadoAccesos);

      return coincideTexto && coincideTipo && coincideEstado;
    });
  }, [cuentasActivas, productoPorId, busquedaAccesos, tipoAccesos, estadoAccesos]);

  const menu: { id: SectionId; label: string; icon: string }[] = [
    { id: "dashboard", label: "Dashboard", icon: "⌂" },
    { id: "compras", label: "Mis compras", icon: "▣" },
    { id: "accesos", label: "Mis accesos", icon: "✦" },
    { id: "creditos", label: "Créditos", icon: "◆" },
    { id: "soporte", label: "Soporte", icon: "⚠" },
    { id: "telegram", label: "Telegram", icon: "✈" },
  ];

  const copiarTexto = async (texto: string) => {
    try {
      await navigator.clipboard.writeText(texto);
      toast.success("Datos copiados correctamente");
    } catch {
      toast.error("No se pudo copiar");
    }
  };


  const crearSoporte = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!usuario?.id) {
      toast.error("Debes iniciar sesión para reportar soporte");
      return;
    }

    if (!soporteCuentaId) {
      toast.error("Selecciona la cuenta que vas a reportar");
      return;
    }

    if (!soporteMensaje.trim()) {
      toast.error("Describe brevemente el problema");
      return;
    }

    const cuenta = cuentasActivas.find((item) => item.id === soporteCuentaId);
    const producto = cuenta ? productoPorId.get(String(cuenta.producto_id || "")) : null;

    if (!cuenta) {
      toast.error("No se encontró la cuenta seleccionada");
      return;
    }

    try {
      setEnviandoSoporte(true);

      const payload = {
        usuario_id: usuario.id,
        cuenta_id: cuenta.id,
        pedido_id: cuenta.pedido_id || null,
        producto_id: cuenta.producto_id || null,
        cliente_nombre: usuario.nombre || "Cliente",
        cliente_correo: usuario.correo || "",
        producto_nombre: producto?.nombre || cuenta.producto_nombre || "Producto",
        cuenta_correo: cuenta.correo || "",
        problema: soporteProblema,
        mensaje: soporteMensaje.trim(),
        estado: "pendiente",
        dias_compensacion: 0,
        fecha_reporte: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("soporte_tickets")
        .insert([payload])
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setSoportes((prev) => [data as SoporteTicket, ...prev]);
      }

      setSoporteCuentaId("");
      setSoporteProblema("Cuenta caída");
      setSoporteMensaje("");
      toast.success("Soporte enviado al admin");
    } catch (error) {
      const detalle = error instanceof Error ? error.message : "Error desconocido";
      console.error("Error creando soporte:", error);
      toast.error(`No se pudo enviar soporte: ${detalle}`);
    } finally {
      setEnviandoSoporte(false);
    }
  };


  return (
    <main className={styles.page}>
      <div className={styles.bgGlowOne} />
      <div className={styles.bgGlowTwo} />
      <div className={styles.gridOverlay} />

      <div className={styles.shell}>
        <aside className={styles.sidebar}>
          <Link href="/" className={styles.brandBlock}>
            <strong>JONAS STREAM</strong>
            <span>Panel Cliente</span>
          </Link>

          <nav className={styles.nav}>
            {menu.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                className={`${styles.navButton} ${activeSection === item.id ? styles.navButtonActive : ""}`}
              >
                <span>{item.icon}</span>
                <strong>{item.label}</strong>
              </button>
            ))}
          </nav>

          <div className={styles.userCardMini}>
            <strong>{nombre}</strong>
            <span>{usuario?.correo || "Cliente Jonas Stream"}</span>
            <em>{usuario?.estado || "activo"}</em>
          </div>
        </aside>

        <section className={styles.content}>
          <div className={styles.heroPanel}>
            <span className={styles.kicker}>Bienvenido de vuelta</span>
            <h1>
              Hola, <span>{nombre}</span>
            </h1>
            <p>Gestiona tus compras, accesos entregados, fechas de vencimiento y créditos desde un solo lugar.</p>
            <div className={styles.heroActions}>
              <Link href="/tienda">Ir a tienda</Link>
              <Link href="/carrito">Ver carrito</Link>
            </div>
          </div>

          {activeSection === "dashboard" && (
            <div className={styles.sectionStack}>
              <div className={styles.statsGrid}>
                <StatCard title="Saldo disponible" value={formatMoney(saldo)} subtitle="Créditos Jonas Stream" />
                <StatCard title="Accesos activos" value={String(cuentasActivas.length)} subtitle="Cuentas entregadas" />
                <StatCard title="Por vencer" value={String(proximosVencimientos.length)} subtitle="En los próximos 7 días" />
                <StatCard title="Soportes abiertos" value={String(soportesAbiertos.length)} subtitle="Pendientes o en proceso" />
              </div>

              <GlassCard title="Próximos vencimientos">
                {proximosVencimientos.length === 0 ? (
                  <EmptyText text="No tienes vencimientos próximos." />
                ) : (
                  <div className={styles.listStack}>
                    {proximosVencimientos.map((cuenta) => (
                      <VencimientoItem key={cuenta.id} cuenta={cuenta} producto={productoPorId.get(String(cuenta.producto_id || ""))} />
                    ))}
                  </div>
                )}
              </GlassCard>
            </div>
          )}

          {activeSection === "compras" && (
            <GlassCard title="Mis compras">
              <div className={styles.listTools}>
                <input
                  value={busquedaCompras}
                  onChange={(event) => setBusquedaCompras(event.target.value)}
                  placeholder="Buscar pedido, producto, método o monto..."
                  className={styles.searchInput}
                />
                <select value={estadoCompras} onChange={(event) => setEstadoCompras(event.target.value)} className={styles.filterSelect}>
                  <option value="todos">Todos los estados</option>
                  <option value="pendiente">Pendientes</option>
                  <option value="completado">Completados</option>
                  <option value="cancelado">Cancelados</option>
                </select>
                <select value={metodoCompras} onChange={(event) => setMetodoCompras(event.target.value)} className={styles.filterSelect}>
                  <option value="todos">Todos los pagos</option>
                  <option value="creditos">Créditos</option>
                  <option value="yape">Yape</option>
                  <option value="plin">Plin</option>
                  <option value="bim">Bim</option>
                  <option value="binance">Binance</option>
                </select>
              </div>

              <div className={styles.listSummary}>
                <span>{pedidosFiltrados.length} pedido(s)</span>
                <small>Lista compacta para revisar muchas compras sin llenar la pantalla.</small>
              </div>

              {pedidosFiltrados.length === 0 ? (
                <EmptyText text="No hay compras que coincidan con el filtro." />
              ) : (
                <div className={styles.compactTable}>
                  {pedidosFiltrados.map((pedido) => {
                    const items = itemsPorPedido.get(pedido.id) || [];
                    const nombres = items
                      .map((item) => productoPorId.get(String(item.producto_id || ""))?.nombre || "Producto")
                      .join(", ");

                    return (
                      <div key={pedido.id} className={styles.compactRow}>
                        <div className={styles.compactMain}>
                          <strong>#{pedido.id.slice(0, 8)}</strong>
                          <span>{nombres || "Pedido Jonas Stream"}</span>
                        </div>
                        <div className={styles.compactMeta}>
                          <span>{formatDate(pedido.created_at)}</span>
                          <span>{pedido.metodo_pago || "Sin método"}</span>
                        </div>
                        <strong className={styles.compactAmount}>{formatMoney(pedido.total)}</strong>
                        <span className={`${styles.statusBadge} ${estadoPedidoClass(pedido.estado)}`}>
                          {pedidoEstadoLabel(pedido.estado)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </GlassCard>
          )}

          {activeSection === "accesos" && (
            <GlassCard title="Mis accesos">
              <div className={styles.listTools}>
                <input
                  value={busquedaAccesos}
                  onChange={(event) => setBusquedaAccesos(event.target.value)}
                  placeholder="Buscar correo, producto, perfil, pedido o PIN..."
                  className={styles.searchInput}
                />
                <select value={tipoAccesos} onChange={(event) => setTipoAccesos(event.target.value)} className={styles.filterSelect}>
                  <option value="todos">Todos los tipos</option>
                  <option value="cuenta_completa">Cuenta completa</option>
                  <option value="perfil">Perfil</option>
                  <option value="otros">Otros</option>
                </select>
                <select value={estadoAccesos} onChange={(event) => setEstadoAccesos(event.target.value)} className={styles.filterSelect}>
                  <option value="todos">Todos</option>
                  <option value="vigentes">Vigentes</option>
                  <option value="por_vencer">Por vencer</option>
                </select>
              </div>

              <div className={styles.listSummary}>
                <span>{accesosFiltrados.length} acceso(s)</span>
                <small>El vencimiento ya está sincronizado con cada acceso asignado.</small>
              </div>

              {accesosFiltrados.length === 0 ? (
                <EmptyText text="No hay accesos que coincidan con el filtro." />
              ) : (
                <div className={styles.accessListCompact}>
                  {accesosFiltrados.map((cuenta) => {
                    const producto = productoPorId.get(String(cuenta.producto_id || ""));
                    const dias = getDiasRestantes(cuenta.cliente_fin || cuenta.fecha_fin);
                    const tipo = tipoAccesoLabel(cuenta, producto);
                    const textoCopiar = [
                      `Producto: ${producto?.nombre || cuenta.producto_nombre || "Producto"}`,
                      `Tipo: ${tipo}`,
                      `Correo: ${cuenta.correo}`,
                      `Contraseña: ${cuenta.clave}`,
                      cuenta.perfil ? `Perfil: ${cuenta.perfil}` : null,
                      cuenta.pin_perfil ? `PIN perfil: ${cuenta.pin_perfil}` : null,
                      cuenta.pin_acceso ? `PIN consulta: ${cuenta.pin_acceso}` : null,
                      `Inicio: ${formatDate(cuenta.cliente_inicio)}`,
                      `Vence: ${formatDate(cuenta.cliente_fin || cuenta.fecha_fin)}`,
                    ].filter(Boolean).join("\n");

                    return (
                      <div key={cuenta.id} className={styles.accessRowCompact}>
                        <div className={styles.accessNameCell}>
                          <strong>{producto?.nombre || cuenta.producto_nombre || "Producto"}</strong>
                          <span>{tipo}</span>
                        </div>

                        <div className={styles.accessDataCell}>
                          <span>Correo</span>
                          <strong>{cuenta.correo || "No disponible"}</strong>
                        </div>

                        <div className={styles.accessDataCell}>
                          <span>Clave</span>
                          <strong>{cuenta.clave || "No disponible"}</strong>
                        </div>

                        <div className={styles.accessDataCell}>
                          <span>Perfil / PIN</span>
                          <strong>{[cuenta.perfil, cuenta.pin_perfil].filter(Boolean).join(" · ") || "No aplica"}</strong>
                        </div>

                        <div className={styles.accessDataCell}>
                          <span>Vigencia</span>
                          <strong>{formatDate(cuenta.cliente_inicio)} → {formatDate(cuenta.cliente_fin || cuenta.fecha_fin)}</strong>
                          <small>{dias === null ? "Sin días definidos" : dias < 0 ? `Vencido hace ${Math.abs(dias)} día(s)` : `${dias} día(s) restantes`}</small>
                        </div>

                        <div className={styles.accessRowActions}>
                          <button type="button" onClick={() => copiarTexto(textoCopiar)} className={styles.primaryButton}>Copiar</button>
                          <Link href="/codigos" className={styles.secondaryButton}>Códigos</Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </GlassCard>
          )}

          {activeSection === "creditos" && (
            <GlassCard title="Créditos">
              <div className={styles.creditHero}>
                <span>Saldo actual</span>
                <strong>{formatMoney(saldo)}</strong>
              </div>

              {creditos.length === 0 ? (
                <EmptyText text="No tienes créditos asignados todavía." />
              ) : (
                <div className={styles.listStack}>
                  {creditos.map((credito) => (
                    <div key={credito.id} className={styles.creditRow}>
                      <div>
                        <strong>Créditos Jonas Stream</strong>
                        <span>Estado: {credito.estado || "activo"}</span>
                      </div>
                      <em>{formatMoney(credito.saldo)}</em>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          )}


          {activeSection === "soporte" && (
            <GlassCard title="Soporte">
              <div className={styles.supportGrid}>
                <form onSubmit={crearSoporte} className={styles.supportForm}>
                  <div>
                    <span className={styles.supportKicker}>Reportar cuenta</span>
                    <h3>Enviar soporte al admin</h3>
                    <p>
                      Selecciona una cuenta entregada, escribe el problema y el admin verá la fecha y hora del reporte.
                    </p>
                  </div>

                  <label className={styles.formGroup}>
                    <span>Cuenta afectada</span>
                    <select value={soporteCuentaId} onChange={(event) => setSoporteCuentaId(event.target.value)}>
                      <option value="">Selecciona una cuenta</option>
                      {cuentasActivas.map((cuenta) => {
                        const producto = productoPorId.get(String(cuenta.producto_id || ""));
                        return (
                          <option key={cuenta.id} value={cuenta.id}>
                            {(producto?.nombre || cuenta.producto_nombre || "Producto") + " - " + cuenta.correo}
                          </option>
                        );
                      })}
                    </select>
                  </label>

                  <label className={styles.formGroup}>
                    <span>Tipo de problema</span>
                    <select value={soporteProblema} onChange={(event) => setSoporteProblema(event.target.value)}>
                      <option>Cuenta caída</option>
                      <option>Clave incorrecta</option>
                      <option>Correo no ingresa</option>
                      <option>Perfil ocupado</option>
                      <option>Renovación pendiente</option>
                      <option>Otro problema</option>
                    </select>
                  </label>

                  <label className={styles.formGroup}>
                    <span>Detalle del soporte</span>
                    <textarea
                      value={soporteMensaje}
                      onChange={(event) => setSoporteMensaje(event.target.value)}
                      placeholder="Ejemplo: La cuenta no inicia sesión desde hoy, me sale contraseña incorrecta."
                      rows={5}
                    />
                  </label>

                  <button type="submit" disabled={enviandoSoporte} className={styles.primaryButton}>
                    {enviandoSoporte ? "Enviando..." : "Enviar soporte"}
                  </button>
                </form>

                <div className={styles.supportInfoBox}>
                  <span>Flujo del soporte</span>
                  <strong>Pendiente → En proceso → Entregado</strong>
                  <p>
                    Si el admin demora en responder, podrá sumar días de compensación automáticamente o modificarlo manualmente.
                  </p>
                </div>
              </div>

              <div className={styles.supportListHeader}>
                <h3>Mis reportes</h3>
                <span>{soportes.length} soporte(s)</span>
              </div>

              {soportes.length === 0 ? (
                <EmptyText text="Aún no tienes reportes de soporte." />
              ) : (
                <div className={styles.supportList}>
                  {soportes.map((ticket) => (
                    <SoporteItem key={ticket.id} ticket={ticket} />
                  ))}
                </div>
              )}
            </GlassCard>
          )}

          {activeSection === "telegram" && (
            <GlassCard title="Telegram">
              <div className={styles.telegramBox}>
                <h3>Vincula tu Telegram</h3>
                <p>Recibe avisos de compras, accesos y vencimientos directamente en Telegram. Esta sección queda lista para conectar tu bot más adelante.</p>
                <button type="button" className={styles.primaryButton}>Vincular Telegram</button>
              </div>
            </GlassCard>
          )}
        </section>
      </div>
    </main>
  );
}

function StatCard({ title, value, subtitle }: { title: string; value: string; subtitle: string }) {
  return (
    <div className={styles.statCard}>
      <p>{title}</p>
      <strong>{value}</strong>
      <span>{subtitle}</span>
    </div>
  );
}

function GlassCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className={styles.panel}>
      <h2>{title}</h2>
      {children}
    </div>
  );
}

function EmptyText({ text }: { text: string }) {
  return <div className={styles.emptyState}>{text}</div>;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.infoRow}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}


function soporteEstadoClass(estado?: string | null) {
  const value = String(estado || "pendiente").toLowerCase();
  if (value === "entregado" || value === "finalizado" || value === "resuelto") return styles.supportDelivered;
  if (value === "en_proceso" || value === "proceso") return styles.supportProcess;
  return styles.supportPending;
}

function soporteEstadoLabel(estado?: string | null) {
  const value = String(estado || "pendiente").toLowerCase();
  if (value === "entregado" || value === "finalizado" || value === "resuelto") return "Soporte entregado";
  if (value === "en_proceso" || value === "proceso") return "Soporte en proceso";
  return "Soporte pendiente";
}

function formatDateTime(value?: string | null) {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin fecha";
  return date.toLocaleString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function SoporteItem({ ticket }: { ticket: SoporteTicket }) {
  return (
    <div className={styles.supportItem}>
      <div>
        <div className={styles.supportItemTop}>
          <h3>{ticket.producto_nombre || "Producto"}</h3>
          <span className={`${styles.supportBadge} ${soporteEstadoClass(ticket.estado)}`}>
            {soporteEstadoLabel(ticket.estado)}
          </span>
        </div>

        <p>{ticket.problema || "Soporte"}</p>
        <small>Cuenta: {ticket.cuenta_correo || "No indicada"}</small>
        <small>Reportado: {formatDateTime(ticket.fecha_reporte || ticket.created_at)}</small>

        {ticket.mensaje ? <em>{ticket.mensaje}</em> : null}
        {ticket.respuesta_admin ? <b>Respuesta admin: {ticket.respuesta_admin}</b> : null}
      </div>

      <div className={styles.supportDays}>
        <span>Días compensados</span>
        <strong>{Number(ticket.dias_compensacion || 0)}</strong>
      </div>
    </div>
  );
}

function VencimientoItem({ cuenta, producto, showButton = false }: { cuenta: CuentaProducto; producto?: Producto; showButton?: boolean }) {
  const dias = getDiasRestantes(cuenta.cliente_fin || cuenta.fecha_fin);
  const danger = dias !== null && dias <= 2;
  const warning = dias !== null && dias > 2 && dias <= 7;

  return (
    <div className={`${styles.expireItem} ${danger ? styles.expireDanger : warning ? styles.expireWarning : ""}`}>
      <div>
        <h3>{producto?.nombre || cuenta.producto_nombre || "Producto"}</h3>
        <p>{dias === null ? "Sin fecha de vencimiento" : dias < 0 ? `Venció hace ${Math.abs(dias)} día(s)` : `Vence en ${dias} día(s)`}</p>
        <small>Vencimiento: {formatDate(cuenta.cliente_fin || cuenta.fecha_fin)}</small>
      </div>

      {showButton && <Link href="/tienda">Renovar</Link>}
    </div>
  );
}
