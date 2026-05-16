"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import styles from "./cliente.module.css";

const WHATSAPP_NUMBER = "51900557949";

type SectionId = "dashboard" | "compras" | "accesos" | "vencimientos" | "creditos" | "telegram";

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
  usuario_id?: string | null;
  saldo?: number | null;
  estado?: string | null;
  created_at?: string | null;
};

type PlataformaGrupo = {
  id: string;
  nombre: string;
  categoria: string;
  accent: string;
  cuentas: CuentaProducto[];
};

const menu: { id: SectionId; label: string; icon: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: "⌂" },
  { id: "compras", label: "Mis compras", icon: "▣" },
  { id: "accesos", label: "Mis accesos", icon: "✦" },
  { id: "vencimientos", label: "Vencimientos", icon: "◷" },
  { id: "creditos", label: "Créditos", icon: "◆" },
  { id: "telegram", label: "Telegram", icon: "➜" },
];

function normalizar(value?: string | null) {
  return String(value || "").trim().toLowerCase();
}

function buildWhatsAppLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function formatMoney(value?: number | null) {
  return `S/ ${Number(value || 0).toFixed(2)}`;
}

function formatDate(value?: string | null) {
  if (!value) return "Sin fecha";
  const date = value.includes("T") ? new Date(value) : new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "Sin fecha";
  return date.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
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

function getStatusClass(estado?: string | null) {
  const value = normalizar(estado);
  if (value === "completado" || value === "aprobado" || value === "entregado") {
    return `${styles.statusBadge} ${styles.statusOk}`;
  }
  if (value === "cancelado" || value === "rechazado") {
    return `${styles.statusBadge} ${styles.statusBad}`;
  }
  return `${styles.statusBadge} ${styles.statusWait}`;
}

function getProductName(producto?: Producto | null) {
  const nombre = producto?.nombre?.trim();
  return nombre || "Producto";
}

function getAccent(producto?: Producto | null) {
  const nombre = normalizar(producto?.nombre);
  if (nombre.includes("netflix")) return "netflix";
  if (nombre.includes("youtube")) return "youtube";
  if (nombre.includes("max") || nombre.includes("hbo")) return "max";
  if (nombre.includes("crunchy")) return "crunchyroll";
  if (nombre.includes("disney")) return "disney";
  if (nombre.includes("prime")) return "prime";
  if (nombre.includes("spotify")) return "spotify";
  if (nombre.includes("canva")) return "canva";
  if (nombre.includes("iptv")) return "iptv";
  return "default";
}

function buildRenewMessage(cuenta: CuentaProducto, producto?: Producto | null, usuario?: Usuario | null) {
  return [
    "Hola Jonas Stream, quiero renovar mi cuenta.",
    "",
    `Producto: ${getProductName(producto)}`,
    `Correo de acceso: ${cuenta.correo || "No disponible"}`,
    `Mi correo registrado: ${usuario?.correo || "No disponible"}`,
    `Fecha de vencimiento: ${formatDate(cuenta.cliente_fin || cuenta.fecha_fin)}`,
  ].join("\n");
}

function buildReportMessage(cuenta: CuentaProducto, producto?: Producto | null, usuario?: Usuario | null) {
  return [
    "Hola Jonas Stream, quiero reportar un problema con mi cuenta.",
    "",
    `Producto: ${getProductName(producto)}`,
    `Correo de acceso: ${cuenta.correo || "No disponible"}`,
    `Mi correo registrado: ${usuario?.correo || "No disponible"}`,
    "Problema:",
  ].join("\n");
}

export default function ClientePage() {
  const router = useRouter();

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [pedidoItems, setPedidoItems] = useState<PedidoItem[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cuentas, setCuentas] = useState<CuentaProducto[]>([]);
  const [creditos, setCreditos] = useState<Credito[]>([]);
  const [activeSection, setActiveSection] = useState<SectionId>("dashboard");
  const [selectedPlatformId, setSelectedPlatformId] = useState<string | null>(null);
  const [cargandoDatos, setCargandoDatos] = useState(false);

  useEffect(() => {
    cargarPanelCliente();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarPanelCliente = async () => {
    setCargandoDatos(true);

    try {
      const { data: authData } = await supabase.auth.getUser();
      const authUser = authData?.user || null;

      let usuarioLocal: Usuario | null = null;

      if (typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem("usuario");
          usuarioLocal = raw ? (JSON.parse(raw) as Usuario) : null;
        } catch {
          usuarioLocal = null;
        }
      }

      if (!authUser && !usuarioLocal?.id) {
        router.replace("/login");
        return;
      }

      const userId = authUser?.id || usuarioLocal?.id || "";
      const userEmail = authUser?.email || usuarioLocal?.correo || "";

      let usuarioData: Usuario | null = null;

      if (userId) {
        const { data } = await supabase
          .from("usuarios")
          .select("id,nombre,correo,rol,estado,celular,celular_completo")
          .eq("id", userId)
          .maybeSingle();

        usuarioData = data as Usuario | null;
      }

      if (!usuarioData && userEmail) {
        const { data } = await supabase
          .from("usuarios")
          .select("id,nombre,correo,rol,estado,celular,celular_completo")
          .eq("correo", userEmail)
          .maybeSingle();

        usuarioData = data as Usuario | null;
      }

      const usuarioFinal: Usuario = usuarioData || usuarioLocal || {
        id: userId,
        nombre: authUser?.user_metadata?.name || userEmail.split("@")[0] || "Cliente",
        correo: userEmail,
        rol: "cliente",
        estado: "aprobado",
      };

      setUsuario(usuarioFinal);

      const usuarioIdReal = usuarioFinal.id || userId;
      const correoReal = usuarioFinal.correo || userEmail;

      const pedidosQuery = supabase
        .from("pedidos")
        .select("*")
        .order("created_at", { ascending: false });

      if (usuarioIdReal && correoReal) {
        pedidosQuery.or(`usuario_id.eq.${usuarioIdReal},cliente_correo.eq.${correoReal}`);
      } else if (usuarioIdReal) {
        pedidosQuery.eq("usuario_id", usuarioIdReal);
      } else if (correoReal) {
        pedidosQuery.eq("cliente_correo", correoReal);
      }

      const cuentasQuery = supabase
        .from("cuentas_producto")
        .select("*")
        .order("cliente_fin", { ascending: true });

      if (usuarioIdReal) {
        cuentasQuery.eq("usuario_id", usuarioIdReal);
      }

      const creditosQuery = supabase
        .from("creditos")
        .select("*")
        .order("created_at", { ascending: false });

      if (usuarioIdReal) {
        creditosQuery.eq("usuario_id", usuarioIdReal);
      }

      const [pedidosResult, cuentasResult, creditosResult] = await Promise.all([
        pedidosQuery,
        cuentasQuery,
        creditosQuery,
      ]);

      const pedidosData = (pedidosResult.data || []) as Pedido[];
      const cuentasData = ((cuentasResult.data || []) as CuentaProducto[]).filter(
        (cuenta) => normalizar(cuenta.estado) === "entregada"
      );
      const creditosData = (creditosResult.data || []) as Credito[];

      setPedidos(pedidosData);
      setCuentas(cuentasData);
      setCreditos(creditosData);

      const pedidoIds = pedidosData.map((pedido) => pedido.id);

      let itemsData: PedidoItem[] = [];
      if (pedidoIds.length > 0) {
        const { data } = await supabase
          .from("pedido_items")
          .select("*")
          .in("pedido_id", pedidoIds);

        itemsData = (data || []) as PedidoItem[];
      }

      setPedidoItems(itemsData);

      const productoIds = Array.from(
        new Set(
          [
            ...cuentasData.map((cuenta) => cuenta.producto_id).filter(Boolean),
            ...itemsData.map((item) => item.producto_id).filter(Boolean),
          ] as string[]
        )
      );

      let productosData: Producto[] = [];

      if (productoIds.length > 0) {
        /*
          IMPORTANTE:
          No pedimos "accent" porque si esa columna no existe en Supabase,
          la consulta falla completa y por eso salía "Producto".
        */
        const { data, error } = await supabase
          .from("productos")
          .select("id,nombre,imagen,categoria,tipo_venta")
          .in("id", productoIds);

        if (error) {
          console.error("ERROR CARGANDO PRODUCTOS PARA PANEL CLIENTE:", error);
        }

        productosData = (data || []) as Producto[];
      }

      setProductos(productosData);
    } catch (error) {
      console.error("Error cargando panel cliente:", error);
    } finally {
      setCargandoDatos(false);
    }
  };

  const nombre = usuario?.nombre || usuario?.correo?.split("@")[0] || "Cliente";

  const saldo = creditos
    .filter((credito) => normalizar(credito.estado || "activo") === "activo")
    .reduce((acc, credito) => acc + Number(credito.saldo || 0), 0);

  const productoPorId = useMemo(() => {
    return new Map(productos.map((producto) => [producto.id, producto]));
  }, [productos]);

  const itemsPorPedido = useMemo(() => {
    const map = new Map<string, PedidoItem[]>();

    pedidoItems.forEach((item) => {
      const actuales = map.get(item.pedido_id) || [];
      actuales.push(item);
      map.set(item.pedido_id, actuales);
    });

    return map;
  }, [pedidoItems]);

  const cuentasActivas = cuentas.filter((cuenta) => normalizar(cuenta.estado) === "entregada");

  const plataformas = useMemo<PlataformaGrupo[]>(() => {
    const map = new Map<string, PlataformaGrupo>();

    cuentasActivas.forEach((cuenta) => {
      const producto = productoPorId.get(cuenta.producto_id);
      const id = producto?.id || cuenta.producto_id || "sin-producto";
      const actual = map.get(id) || {
        id,
        nombre: getProductName(producto),
        categoria: producto?.tipo_venta || producto?.categoria || "Acceso digital",
        accent: getAccent(producto),
        cuentas: [],
      };

      actual.nombre = getProductName(producto);
      actual.categoria = producto?.tipo_venta || producto?.categoria || actual.categoria;
      actual.accent = getAccent(producto);
      actual.cuentas.push(cuenta);

      map.set(id, actual);
    });

    return Array.from(map.values()).sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [cuentasActivas, productoPorId]);

  const plataformaSeleccionada = selectedPlatformId
    ? plataformas.find((plataforma) => plataforma.id === selectedPlatformId) || null
    : null;

  const comprasConCreditos = pedidos.filter((pedido) => normalizar(pedido.metodo_pago).includes("crédito") || normalizar(pedido.metodo_pago).includes("credito"));
  const totalGastadoCreditos = comprasConCreditos.reduce((acc, pedido) => acc + Number(pedido.total || 0), 0);
  const totalRecargadoActual = creditos.reduce((acc, credito) => acc + Number(credito.saldo || 0), 0);

  const copiarTexto = async (texto: string) => {
    try {
      await navigator.clipboard.writeText(texto);
      alert("Datos copiados");
    } catch {
      alert("No se pudo copiar");
    }
  };

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    if (typeof window !== "undefined") localStorage.removeItem("usuario");
    router.push("/login");
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

          <button type="button" onClick={cerrarSesion} className={styles.primaryButton}>
            Cerrar sesión
          </button>
        </aside>

        <section className={styles.content}>
          <section className={styles.heroPanel}>
            <span className={styles.kicker}>{cargandoDatos ? "Sincronizando datos" : "Bienvenido de vuelta"}</span>
            <h1>
              Hola, <span>{nombre}</span>
            </h1>
            <p>Gestiona tus compras, plataformas entregadas, vencimientos y créditos desde un solo lugar.</p>
            <div className={styles.heroActions}>
              <Link href="/tienda">Ir a tienda</Link>
              <Link href="/carrito">Ver carrito</Link>
            </div>
          </section>

          {activeSection === "dashboard" && (
            <div className={styles.sectionStack}>
              <div className={styles.statsGrid}>
                <StatCard title="Saldo disponible" value={formatMoney(saldo)} subtitle="Créditos Jonas Stream" />
                <StatCard title="Plataformas" value={String(plataformas.length)} subtitle="Servicios con accesos" />
                <StatCard title="Accesos activos" value={String(cuentasActivas.length)} subtitle="Cuentas entregadas" />
              </div>

              <Panel title="Resumen de accesos">
                {plataformas.length === 0 ? (
                  <EmptyText text={cargandoDatos ? "Cargando accesos..." : "Todavía no tienes plataformas entregadas."} />
                ) : (
                  <PlatformGrid plataformas={plataformas} onOpen={(id) => { setSelectedPlatformId(id); setActiveSection("accesos"); }} />
                )}
              </Panel>
            </div>
          )}

          {activeSection === "compras" && (
            <Panel title="Mis compras">
              {pedidos.length === 0 ? (
                <EmptyText text={cargandoDatos ? "Cargando compras..." : "Aún no tienes compras registradas."} />
              ) : (
                <div className={styles.listStack}>
                  {pedidos.map((pedido) => {
                    const items = itemsPorPedido.get(pedido.id) || [];
                    const nombres = items
                      .map((item) => getProductName(productoPorId.get(String(item.producto_id || ""))))
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
                          <span className={getStatusClass(pedido.estado)}>{pedido.estado || "pendiente"}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Panel>
          )}

          {activeSection === "accesos" && (
            <Panel title={plataformaSeleccionada ? `Accesos de ${plataformaSeleccionada.nombre}` : "Mis accesos por plataforma"}>
              {cuentasActivas.length === 0 ? (
                <EmptyText text={cargandoDatos ? "Cargando accesos..." : "Todavía no tienes accesos entregados. Compra con créditos o espera que el admin apruebe tu pedido normal."} />
              ) : plataformaSeleccionada ? (
                <div className={styles.platformDetailStack}>
                  <button type="button" className={styles.backButton} onClick={() => setSelectedPlatformId(null)}>
                    ← Volver a plataformas
                  </button>

                  <div className={`${styles.platformHeaderCard} ${styles[`accent_${plataformaSeleccionada.accent}`] || styles.accent_default}`}>
                    <div>
                      <span>PLATAFORMA SELECCIONADA</span>
                      <h3>{plataformaSeleccionada.nombre}</h3>
                      <p>{plataformaSeleccionada.categoria} · {plataformaSeleccionada.cuentas.length} acceso(s)</p>
                    </div>
                    <strong>{plataformaSeleccionada.cuentas.length}</strong>
                  </div>

                  <div className={styles.accessTableWrap}>
                    <table className={styles.accessTable}>
                      <thead>
                        <tr>
                          <th>Acceso</th>
                          <th>Clave</th>
                          <th>Inicio</th>
                          <th>Vencimiento</th>
                          <th>Estado</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {plataformaSeleccionada.cuentas.map((cuenta) => (
                          <AccessRow
                            key={cuenta.id}
                            cuenta={cuenta}
                            producto={productoPorId.get(cuenta.producto_id)}
                            usuario={usuario}
                            copiarTexto={copiarTexto}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className={styles.platformStack}>
                  <div className={styles.panelHintBox}>
                    <strong>VISTA ORDENADA</strong>
                    <p>Primero ves tus plataformas. Entra a una para ver correos, claves, vencimientos y solicitar renovación por WhatsApp.</p>
                  </div>
                  <PlatformGrid plataformas={plataformas} onOpen={setSelectedPlatformId} />
                </div>
              )}
            </Panel>
          )}

          {activeSection === "vencimientos" && (
            <Panel title="Vencimientos">
              {cuentasActivas.length === 0 ? (
                <EmptyText text={cargandoDatos ? "Cargando vencimientos..." : "No tienes productos con vencimiento."} />
              ) : (
                <div className={styles.accessTableWrap}>
                  <table className={styles.accessTable}>
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Acceso</th>
                        <th>Vencimiento</th>
                        <th>Días</th>
                        <th>Estado</th>
                        <th>Renovación</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cuentasActivas
                        .slice()
                        .sort((a, b) => String(a.cliente_fin || a.fecha_fin || "").localeCompare(String(b.cliente_fin || b.fecha_fin || "")))
                        .map((cuenta) => {
                          const producto = productoPorId.get(cuenta.producto_id);
                          const dias = getDiasRestantes(cuenta.cliente_fin || cuenta.fecha_fin);
                          const status = dias === null ? "SIN FECHA" : dias < 0 ? "VENCIDO" : dias <= 7 ? "POR VENCER" : "ACTIVO";

                          return (
                            <tr key={cuenta.id}>
                              <td>
                                <strong>{getProductName(producto)}</strong>
                                <small>{producto?.tipo_venta || producto?.categoria || "Acceso digital"}</small>
                              </td>
                              <td>
                                <strong>{cuenta.correo || "Sin correo"}</strong>
                                <small>Clave: {cuenta.clave || "Sin clave"}</small>
                              </td>
                              <td><strong>{formatDate(cuenta.cliente_fin || cuenta.fecha_fin)}</strong></td>
                              <td><strong>{dias === null ? "-" : dias < 0 ? `${Math.abs(dias)} vencido(s)` : `${dias} día(s)`}</strong></td>
                              <td>
                                <span className={dias !== null && dias < 0 ? `${styles.statusBadge} ${styles.statusBad}` : dias !== null && dias <= 7 ? `${styles.statusBadge} ${styles.statusWait}` : `${styles.statusBadge} ${styles.statusOk}`}>
                                  {status}
                                </span>
                              </td>
                              <td>
                                <a className={styles.tableWhatsappButton} href={buildWhatsAppLink(buildRenewMessage(cuenta, producto, usuario))} target="_blank" rel="noopener noreferrer">
                                  Solicitar renovación
                                </a>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}
            </Panel>
          )}

          {activeSection === "creditos" && (
            <Panel title="Créditos">
              <div className={styles.statsGrid}>
                <StatCard title="Saldo actual" value={formatMoney(saldo)} subtitle="Disponible para comprar" />
                <StatCard title="Gastado en compras" value={formatMoney(totalGastadoCreditos)} subtitle="Pedidos pagados con créditos" />
                <StatCard title="Saldo asignado" value={formatMoney(totalRecargadoActual)} subtitle="Créditos activos actuales" />
              </div>

              <div className={styles.sectionStack} style={{ marginTop: 16 }}>
                <Panel title="Historial de gastos">
                  {comprasConCreditos.length === 0 ? (
                    <EmptyText text="Todavía no tienes compras pagadas con créditos." />
                  ) : (
                    <div className={styles.accessTableWrap}>
                      <table className={styles.accessTable}>
                        <thead>
                          <tr>
                            <th>Fecha</th>
                            <th>Pedido</th>
                            <th>Producto</th>
                            <th>Monto</th>
                            <th>Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {comprasConCreditos.map((pedido) => {
                            const items = itemsPorPedido.get(pedido.id) || [];
                            const nombres = items
                              .map((item) => getProductName(productoPorId.get(String(item.producto_id || ""))))
                              .join(", ");

                            return (
                              <tr key={pedido.id}>
                                <td><strong>{formatDate(pedido.created_at)}</strong></td>
                                <td><strong>#{pedido.id.slice(0, 8)}</strong></td>
                                <td><strong>{nombres || "Pedido Jonas Stream"}</strong></td>
                                <td><strong>{formatMoney(pedido.total)}</strong></td>
                                <td><span className={getStatusClass(pedido.estado)}>{pedido.estado || "pendiente"}</span></td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Panel>

                <Panel title="Créditos activos">
                  {creditos.length === 0 ? (
                    <EmptyText text="No tienes créditos asignados todavía." />
                  ) : (
                    <div className={styles.listStack}>
                      {creditos.map((credito) => (
                        <div key={credito.id} className={styles.creditRow}>
                          <div>
                            <strong>Créditos Jonas Stream</strong>
                            <span>Estado: {credito.estado || "activo"} · {formatDate(credito.created_at)}</span>
                          </div>
                          <em>{formatMoney(credito.saldo)}</em>
                        </div>
                      ))}
                    </div>
                  )}
                </Panel>
              </div>
            </Panel>
          )}

          {activeSection === "telegram" && (
            <Panel title="Telegram">
              <div className={styles.telegramBox}>
                <h3>Vincula tu Telegram</h3>
                <p>Recibe avisos de compras, accesos y vencimientos directamente en Telegram. Esta sección queda lista para conectar tu bot más adelante.</p>
                <button type="button" className={styles.primaryButton}>Vincular Telegram</button>
              </div>
            </Panel>
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

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className={styles.panel}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function EmptyText({ text }: { text: string }) {
  return <div className={styles.emptyState}>{text}</div>;
}

function PlatformGrid({ plataformas, onOpen }: { plataformas: PlataformaGrupo[]; onOpen: (id: string) => void }) {
  return (
    <div className={styles.platformGrid}>
      {plataformas.map((plataforma) => {
        const fechas = plataforma.cuentas
          .map((cuenta) => cuenta.cliente_fin || cuenta.fecha_fin)
          .filter(Boolean)
          .sort() as string[];

        const vencidos = plataforma.cuentas.filter((cuenta) => {
          const dias = getDiasRestantes(cuenta.cliente_fin || cuenta.fecha_fin);
          return dias !== null && dias < 0;
        }).length;

        const porVencer = plataforma.cuentas.filter((cuenta) => {
          const dias = getDiasRestantes(cuenta.cliente_fin || cuenta.fecha_fin);
          return dias !== null && dias >= 0 && dias <= 7;
        }).length;

        return (
          <button
            type="button"
            key={plataforma.id}
            onClick={() => onOpen(plataforma.id)}
            className={`${styles.platformCard} ${styles[`accent_${plataforma.accent}`] || styles.accent_default}`}
          >
            <div className={styles.platformTopline}>
              <div>
                <span>PLATAFORMA</span>
                <strong>{plataforma.nombre}</strong>
              </div>
              <em>{plataforma.cuentas.length}</em>
            </div>

            <div className={styles.platformMiniGrid}>
              <div><strong>{plataforma.cuentas.length}</strong><span>Activos</span></div>
              <div><strong>{porVencer}</strong><span>Por vencer</span></div>
              <div><strong>{vencidos}</strong><span>Vencidos</span></div>
            </div>

            <p>Próximo vence: {formatDate(fechas[0])}</p>
            <b>Ver accesos →</b>
          </button>
        );
      })}
    </div>
  );
}

function AccessRow({
  cuenta,
  producto,
  usuario,
  copiarTexto,
}: {
  cuenta: CuentaProducto;
  producto?: Producto;
  usuario?: Usuario | null;
  copiarTexto: (texto: string) => void;
}) {
  const textoCopiar = [
    `Producto: ${getProductName(producto)}`,
    `Correo: ${cuenta.correo}`,
    `Contraseña: ${cuenta.clave}`,
    `Vence: ${formatDate(cuenta.cliente_fin || cuenta.fecha_fin)}`,
  ].join("\n");

  return (
    <tr>
      <td>
        <strong>{cuenta.correo || "Sin correo"}</strong>
        <small>{getProductName(producto)}</small>
      </td>
      <td><strong>{cuenta.clave || "Sin clave"}</strong></td>
      <td><strong>{formatDate(cuenta.cliente_inicio || cuenta.fecha_inicio)}</strong></td>
      <td><strong>{formatDate(cuenta.cliente_fin || cuenta.fecha_fin)}</strong></td>
      <td><span className={`${styles.statusBadge} ${styles.statusOk}`}>Activo</span></td>
      <td>
        <div className={styles.tableActions}>
          <button type="button" onClick={() => copiarTexto(textoCopiar)} className={styles.tableCopyButton}>
            Copiar
          </button>

          <a
            className={styles.tableWhatsappButton}
            href={buildWhatsAppLink(buildRenewMessage(cuenta, producto, usuario))}
            target="_blank"
            rel="noopener noreferrer"
          >
            Renovar
          </a>

          <a
            className={styles.tableWhatsappButton}
            href={buildWhatsAppLink(buildReportMessage(cuenta, producto, usuario))}
            target="_blank"
            rel="noopener noreferrer"
          >
            Reportar
          </a>
        </div>
      </td>
    </tr>
  );
}
