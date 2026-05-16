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
  producto_id: string;
  correo: string;
  clave: string;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  cliente_inicio?: string | null;
  cliente_fin?: string | null;
  estado: string;
  pedido_id?: string | null;
  usuario_id?: string | null;
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

type SectionId = "dashboard" | "compras" | "accesos" | "vencimientos" | "creditos" | "soporte" | "telegram";

function formatMoney(value?: number | null) {
  return `S/ ${Number(value || 0).toFixed(2)}`;
}

function formatDate(value?: string | null) {
  if (!value) return "Sin fecha";
  const date = value.includes("T") ? new Date(value) : new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "Sin fecha";
  return date.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
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

function uniqueById<T extends { id: string }>(items: T[]) {
  return Array.from(new Map(items.map((item) => [item.id, item])).values());
}

export default function ClientePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    cargarPanelCliente();
  }, []);

  const cargarPanelCliente = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.replace("/login");
        return;
      }

      const { data: usuarioData } = await supabase
        .from("usuarios")
        .select("id,nombre,correo,rol,estado,celular,celular_completo")
        .eq("id", user.id)
        .maybeSingle();

      const usuarioFinal: Usuario =
        usuarioData || {
          id: user.id,
          nombre: user.user_metadata?.name || user.email?.split("@")[0] || "Cliente",
          correo: user.email || "",
          rol: "cliente",
          estado: "aprobado",
        };

      setUsuario(usuarioFinal);

      const correoUsuario = usuarioFinal.correo || user.email || "";
      const pedidosQuery = correoUsuario
        ? `usuario_id.eq.${user.id},cliente_correo.eq.${correoUsuario}`
        : `usuario_id.eq.${user.id}`;

      const [pedidosResult, creditosResult, soportesResult] = await Promise.all([
        supabase.from("pedidos").select("*").or(pedidosQuery).order("created_at", { ascending: false }),
        supabase.from("creditos").select("*").eq("usuario_id", user.id).order("created_at", { ascending: false }),
        supabase.from("soporte_tickets").select("*").eq("usuario_id", user.id).order("created_at", { ascending: false }),
      ]);

      const pedidosData = (pedidosResult.data || []) as Pedido[];
      const creditosData = (creditosResult.data || []) as Credito[];
      const soportesData = (soportesResult.data || []) as SoporteTicket[];
      setPedidos(pedidosData);
      setCreditos(creditosData);
      setSoportes(soportesData);

      if (soportesResult.error) {
        console.warn("Soporte no disponible todavía:", soportesResult.error.message);
      }

      const pedidoIds = pedidosData.map((pedido) => pedido.id).filter(Boolean);

      let cuentasPorUsuario: CuentaProducto[] = [];
      const { data: cuentasUsuarioData } = await supabase
        .from("cuentas_producto")
        .select("*")
        .eq("usuario_id", user.id)
        .order("cliente_fin", { ascending: true });
      cuentasPorUsuario = (cuentasUsuarioData || []) as CuentaProducto[];

      let cuentasPorPedido: CuentaProducto[] = [];
      if (pedidoIds.length > 0) {
        const { data: cuentasPedidoData } = await supabase
          .from("cuentas_producto")
          .select("*")
          .in("pedido_id", pedidoIds)
          .order("cliente_fin", { ascending: true });
        cuentasPorPedido = (cuentasPedidoData || []) as CuentaProducto[];
      }

      const cuentasData = uniqueById([...cuentasPorUsuario, ...cuentasPorPedido]);
      setCuentas(cuentasData);

      let itemsData: PedidoItem[] = [];
      if (pedidoIds.length > 0) {
        const { data } = await supabase.from("pedido_items").select("*").in("pedido_id", pedidoIds);
        itemsData = (data || []) as PedidoItem[];
      }
      setPedidoItems(itemsData);

      const productoIds = Array.from(
        new Set([
          ...cuentasData.map((cuenta) => cuenta.producto_id).filter(Boolean),
          ...itemsData.map((item) => item.producto_id).filter(Boolean),
        ] as string[]),
      );

      if (productoIds.length > 0) {
        const { data } = await supabase
          .from("productos")
          .select("id,nombre,imagen,categoria,tipo_venta")
          .in("id", productoIds);
        setProductos((data || []) as Producto[]);
      } else {
        setProductos([]);
      }
    } catch (error) {
      console.error("Error cargando panel cliente:", error);
    } finally {
      setLoading(false);
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

  const cuentasActivas = cuentas.filter((cuenta) => String(cuenta.estado || "").toLowerCase() === "entregada");

  const proximosVencimientos = useMemo(() => {
    return cuentasActivas
      .filter((cuenta) => {
        const dias = getDiasRestantes(cuenta.cliente_fin || cuenta.fecha_fin);
        return dias !== null && dias <= 7;
      })
      .slice(0, 5);
  }, [cuentasActivas]);

  const soportesAbiertos = soportes.filter((item) => String(item.estado || "pendiente").toLowerCase() !== "entregado");

  const menu: { id: SectionId; label: string; icon: string }[] = [
    { id: "dashboard", label: "Dashboard", icon: "⌂" },
    { id: "compras", label: "Mis compras", icon: "▣" },
    { id: "accesos", label: "Mis accesos", icon: "✦" },
    { id: "vencimientos", label: "Vencimientos", icon: "◷" },
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
    const producto = cuenta ? productoPorId.get(cuenta.producto_id) : null;

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
        producto_nombre: producto?.nombre || "Producto",
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


  if (loading) {
    return (
      <main className={styles.loadingPage}>
        <div className={styles.loadingCard}>
          <div className={styles.loader} />
          <p>Cargando tu panel...</p>
        </div>
      </main>
    );
  }

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
            <p>Gestiona tus compras, accesos entregados, vencimientos y créditos desde un solo lugar.</p>
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
                      <VencimientoItem key={cuenta.id} cuenta={cuenta} producto={productoPorId.get(cuenta.producto_id)} />
                    ))}
                  </div>
                )}
              </GlassCard>
            </div>
          )}

          {activeSection === "compras" && (
            <GlassCard title="Mis compras">
              {pedidos.length === 0 ? (
                <EmptyText text="Aún no tienes compras registradas." />
              ) : (
                <div className={styles.listStack}>
                  {pedidos.map((pedido) => {
                    const items = itemsPorPedido.get(pedido.id) || [];
                    const nombres = items
                      .map((item) => productoPorId.get(String(item.producto_id || ""))?.nombre || "Producto")
                      .join(", ");

                    return (
                      <div key={pedido.id} className={styles.orderItem}>
                        <div>
                          <h3>Pedido #{pedido.id.slice(0, 8)}</h3>
                          <p>{nombres || "Pedido Jonas Stream"}</p>
                          <small>{formatDate(pedido.created_at)} · {pedido.metodo_pago || "Sin método"}</small>
                        </div>
                        <div className={styles.orderRight}>
                          <strong>{formatMoney(pedido.total)}</strong>
                          <span className={`${styles.statusBadge} ${estadoPedidoClass(pedido.estado)}`}>{pedido.estado || "pendiente"}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </GlassCard>
          )}

          {activeSection === "accesos" && (
            <GlassCard title="Mis accesos">
              {cuentasActivas.length === 0 ? (
                <EmptyText text="Todavía no tienes accesos entregados. Compra con créditos o espera que el admin apruebe tu pedido normal." />
              ) : (
                <div className={styles.accessGrid}>
                  {cuentasActivas.map((cuenta) => {
                    const producto = productoPorId.get(cuenta.producto_id);
                    const textoCopiar = [
                      `Producto: ${producto?.nombre || "Producto"}`,
                      `Correo: ${cuenta.correo}`,
                      `Contraseña: ${cuenta.clave}`,
                      `Vence: ${formatDate(cuenta.cliente_fin || cuenta.fecha_fin)}`,
                    ].join("\n");

                    return (
                      <div key={cuenta.id} className={styles.accessCard}>
                        <div className={styles.accessTop}>
                          <div>
                            <h3>{producto?.nombre || "Producto"}</h3>
                            <p>{producto?.tipo_venta || producto?.categoria || "Acceso digital"}</p>
                          </div>
                          <span>Activo</span>
                        </div>

                        <InfoRow label="Correo" value={cuenta.correo || "No disponible"} />
                        <InfoRow label="Contraseña" value={cuenta.clave || "No disponible"} />
                        <InfoRow label="Inicio" value={formatDate(cuenta.cliente_inicio)} />
                        <InfoRow label="Vencimiento" value={formatDate(cuenta.cliente_fin || cuenta.fecha_fin)} />

                        <button type="button" onClick={() => copiarTexto(textoCopiar)} className={styles.primaryButton}>Copiar datos</button>
                      </div>
                    );
                  })}
                </div>
              )}
            </GlassCard>
          )}

          {activeSection === "vencimientos" && (
            <GlassCard title="Vencimientos">
              {cuentasActivas.length === 0 ? (
                <EmptyText text="No tienes productos con vencimiento." />
              ) : (
                <div className={styles.listStack}>
                  {cuentasActivas.map((cuenta) => (
                    <VencimientoItem key={cuenta.id} cuenta={cuenta} producto={productoPorId.get(cuenta.producto_id)} showButton />
                  ))}
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
                        const producto = productoPorId.get(cuenta.producto_id);
                        return (
                          <option key={cuenta.id} value={cuenta.id}>
                            {(producto?.nombre || "Producto") + " - " + cuenta.correo}
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
        <h3>{producto?.nombre || "Producto"}</h3>
        <p>{dias === null ? "Sin fecha de vencimiento" : dias < 0 ? `Venció hace ${Math.abs(dias)} día(s)` : `Vence en ${dias} día(s)`}</p>
        <small>Vencimiento: {formatDate(cuenta.cliente_fin || cuenta.fecha_fin)}</small>
      </div>

      {showButton && <Link href="/tienda">Renovar</Link>}
    </div>
  );
}
