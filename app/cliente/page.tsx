"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
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

type SectionId = "dashboard" | "compras" | "accesos" | "vencimientos" | "creditos" | "telegram";

const WHATSAPP_NUMBER = "51900557949";

function buildWhatsAppLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function buildRenewMessage(cuenta: CuentaProducto, producto?: Producto, usuario?: Usuario | null) {
  return [
    "Hola Jonas Stream, quiero renovar mi cuenta.",
    "",
    `Producto: ${producto?.nombre || "Producto"}`,
    `Correo de acceso: ${cuenta.correo || "No disponible"}`,
    `Mi correo registrado: ${usuario?.correo || "No disponible"}`,
    `Fecha de vencimiento: ${formatDate(cuenta.cliente_fin || cuenta.fecha_fin)}`,
  ].join("\n");
}

const menu: { id: SectionId; label: string; icon: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: "⌂" },
  { id: "compras", label: "Mis compras", icon: "▣" },
  { id: "accesos", label: "Mis accesos", icon: "✦" },
  { id: "vencimientos", label: "Vencimientos", icon: "◷" },
  { id: "creditos", label: "Créditos", icon: "◆" },
  { id: "telegram", label: "Telegram", icon: "✈" },
];

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

function normalizar(value?: string | null) {
  return String(value || "").trim().toLowerCase();
}

function getStatusClass(estado?: string | null) {
  const value = normalizar(estado || "pendiente");
  if (value === "completado" || value === "entregado" || value === "pagado") return `${styles.statusBadge} ${styles.statusOk}`;
  if (value === "cancelado" || value === "rechazado") return `${styles.statusBadge} ${styles.statusBad}`;
  return `${styles.statusBadge} ${styles.statusWait}`;
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
  const [activeSection, setActiveSection] = useState<SectionId>("dashboard");

  useEffect(() => {
    cargarPanelCliente();
  }, []);

  const cargarPanelCliente = async () => {
    try {
      setLoading(true);

      const { data: authData } = await supabase.auth.getUser();
      let authUser = authData?.user || null;

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
      const productoIdsFromCuentas = cuentasData.map((cuenta) => cuenta.producto_id).filter(Boolean);

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
        new Set([
          ...productoIdsFromCuentas,
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
    .filter((credito) => normalizar(credito.estado || "activo") === "activo")
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

  const cuentasActivas = cuentas.filter((cuenta) => normalizar(cuenta.estado) === "entregada");

  const proximosVencimientos = useMemo(() => {
    return cuentasActivas
      .filter((cuenta) => {
        const dias = getDiasRestantes(cuenta.cliente_fin || cuenta.fecha_fin);
        return dias !== null && dias <= 7;
      })
      .slice(0, 5);
  }, [cuentasActivas]);

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

  if (loading) {
    return (
      <main className={styles.loadingPage}>
        <div className={styles.loadingCard}>
          <span className={styles.loader} />
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

          <button type="button" onClick={cerrarSesion} className={styles.primaryButton}>
            Cerrar sesión
          </button>
        </aside>

        <section className={styles.content}>
          <section className={styles.heroPanel}>
            <span className={styles.kicker}>Bienvenido de vuelta</span>
            <h1>
              Hola, <span>{nombre}</span>
            </h1>
            <p>Gestiona tus compras, accesos entregados, vencimientos y créditos desde un solo lugar.</p>
            <div className={styles.heroActions}>
              <Link href="/tienda">Ir a tienda</Link>
              <Link href="/carrito">Ver carrito</Link>
            </div>
          </section>

          {activeSection === "dashboard" && (
            <div className={styles.sectionStack}>
              <div className={styles.statsGrid}>
                <StatCard title="Saldo disponible" value={formatMoney(saldo)} subtitle="Créditos Jonas Stream" />
                <StatCard title="Accesos activos" value={String(cuentasActivas.length)} subtitle="Cuentas entregadas" />
                <StatCard title="Por vencer" value={String(proximosVencimientos.length)} subtitle="En los próximos 7 días" />
              </div>

              <Panel title="Próximos vencimientos">
                {proximosVencimientos.length === 0 ? (
                  <EmptyText text="No tienes vencimientos próximos." />
                ) : (
                  <div className={styles.listStack}>
                    {proximosVencimientos.map((cuenta) => (
                      <VencimientoItem key={cuenta.id} cuenta={cuenta} producto={productoPorId.get(cuenta.producto_id)} usuario={usuario} />
                    ))}
                  </div>
                )}
              </Panel>
            </div>
          )}

          {activeSection === "compras" && (
            <Panel title="Mis compras">
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
            <Panel title="Mis accesos">
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
                      <article key={cuenta.id} className={styles.accessCard}>
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

                        <div className={styles.accessActions}>
                          <button type="button" onClick={() => copiarTexto(textoCopiar)} className={styles.primaryButton}>
                            Copiar datos
                          </button>

                          <a
                            href={buildWhatsAppLink(buildRenewMessage(cuenta, producto, usuario))}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.whatsappButton}
                          >
                            Solicitar renovación
                          </a>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </Panel>
          )}

          {activeSection === "vencimientos" && (
            <Panel title="Vencimientos">
              {cuentasActivas.length === 0 ? (
                <EmptyText text="No tienes productos con vencimiento." />
              ) : (
                <div className={styles.listStack}>
                  {cuentasActivas.map((cuenta) => (
                    <VencimientoItem key={cuenta.id} cuenta={cuenta} producto={productoPorId.get(cuenta.producto_id)} usuario={usuario} showButton />
                  ))}
                </div>
              )}
            </Panel>
          )}

          {activeSection === "creditos" && (
            <Panel title="Créditos">
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.infoRow}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function VencimientoItem({ cuenta, producto, usuario, showButton = false }: { cuenta: CuentaProducto; producto?: Producto; usuario?: Usuario | null; showButton?: boolean }) {
  const dias = getDiasRestantes(cuenta.cliente_fin || cuenta.fecha_fin);
  const danger = dias !== null && dias <= 2;
  const warning = dias !== null && dias > 2 && dias <= 7;

  return (
    <div className={`${styles.expireItem} ${danger ? styles.expireDanger : warning ? styles.expireWarning : ""}`}>
      <div>
        <h3>{producto?.nombre || "Producto"}</h3>
        <p>
          {dias === null
            ? "Sin fecha de vencimiento"
            : dias < 0
            ? `Venció hace ${Math.abs(dias)} día(s)`
            : `Vence en ${dias} día(s)`}
        </p>
        <small>Vencimiento: {formatDate(cuenta.cliente_fin || cuenta.fecha_fin)}</small>
      </div>

      {showButton && (
        <a
          href={buildWhatsAppLink(buildRenewMessage(cuenta, producto, usuario))}
          target="_blank"
          rel="noopener noreferrer"
        >
          Solicitar renovación
        </a>
      )}
    </div>
  );
}
