"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

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

function estadoPedidoClass(estado?: string | null) {
  const value = String(estado || "pendiente").toLowerCase();
  if (value === "completado" || value === "entregado" || value === "pagado") {
    return "border-emerald-400/40 bg-emerald-400/10 text-emerald-300";
  }
  if (value === "cancelado" || value === "rechazado") {
    return "border-red-400/40 bg-red-400/10 text-red-300";
  }
  return "border-yellow-400/40 bg-yellow-400/10 text-yellow-300";
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
        .single();

      const usuarioFinal: Usuario =
        usuarioData || {
          id: user.id,
          nombre: user.user_metadata?.name || user.email?.split("@")[0] || "Cliente",
          correo: user.email || "",
          rol: "cliente",
          estado: "aprobado",
        };

      setUsuario(usuarioFinal);

      const [pedidosResult, cuentasResult, creditosResult] = await Promise.all([
        supabase
          .from("pedidos")
          .select("*")
          .eq("usuario_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("cuentas_producto")
          .select("*")
          .eq("usuario_id", user.id)
          .order("cliente_fin", { ascending: true }),
        supabase
          .from("creditos")
          .select("*")
          .eq("usuario_id", user.id)
          .order("created_at", { ascending: false }),
      ]);

      const pedidosData = (pedidosResult.data || []) as Pedido[];
      const cuentasData = (cuentasResult.data || []) as CuentaProducto[];
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
    .filter((credito) => String(credito.estado || "activo").toLowerCase() === "activo")
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

  const proximosVencimientos = useMemo(() => {
    return cuentas
      .filter((cuenta) => String(cuenta.estado || "").toLowerCase() === "entregada")
      .filter((cuenta) => {
        const dias = getDiasRestantes(cuenta.cliente_fin || cuenta.fecha_fin);
        return dias !== null && dias <= 7;
      })
      .slice(0, 5);
  }, [cuentas]);

  const cuentasActivas = cuentas.filter((cuenta) => String(cuenta.estado || "").toLowerCase() === "entregada");

  const menu: { id: SectionId; label: string; icon: string }[] = [
    { id: "dashboard", label: "Dashboard", icon: "⌂" },
    { id: "compras", label: "Mis compras", icon: "▣" },
    { id: "accesos", label: "Mis accesos", icon: "✦" },
    { id: "vencimientos", label: "Vencimientos", icon: "◷" },
    { id: "creditos", label: "Créditos", icon: "◆" },
    { id: "telegram", label: "Telegram", icon: "✈" },
  ];

  const copiarTexto = async (texto: string) => {
    try {
      await navigator.clipboard.writeText(texto);
      alert("Datos copiados");
    } catch {
      alert("No se pudo copiar");
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#020617] text-white flex items-center justify-center">
        <div className="rounded-3xl border border-cyan-400/20 bg-white/5 px-8 py-6 shadow-[0_0_40px_rgba(34,211,238,0.18)] backdrop-blur-xl">
          <div className="h-10 w-10 mx-auto mb-4 rounded-full border-2 border-cyan-300 border-t-transparent animate-spin" />
          <p className="text-cyan-100 tracking-wide">Cargando tu panel...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#000000] text-white overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-[#018B90]/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-cyan-300/10 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(1,231,239,.35)_1px,transparent_1px),linear-gradient(90deg,rgba(1,231,239,.35)_1px,transparent_1px)] [background-size:42px_42px]" />
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row min-h-screen">
        <aside className="lg:w-72 border-b lg:border-b-0 lg:border-r border-cyan-400/10 bg-white/[0.04] backdrop-blur-2xl">
          <div className="p-6">
            <Link href="/" className="block mb-8 no-underline">
              <h1 className="text-2xl font-black tracking-[0.08em]">
                JONAS <span className="text-cyan-300 drop-shadow-[0_0_12px_rgba(34,211,238,0.8)]">STREAM</span>
              </h1>
              <p className="text-xs text-cyan-100/60 mt-1 tracking-[0.28em] uppercase">Panel Cliente</p>
            </Link>

            <nav className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-3">
              {menu.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black transition-all duration-300 ${
                    activeSection === item.id
                      ? "bg-cyan-400/15 text-cyan-200 border border-cyan-300/40 shadow-[0_0_24px_rgba(34,211,238,0.20)]"
                      : "bg-white/[0.03] text-white/70 border border-white/5 hover:border-cyan-300/30 hover:bg-cyan-400/10 hover:text-cyan-100"
                  }`}
                >
                  <span className="text-lg text-cyan-300">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="mt-8 rounded-3xl border border-cyan-400/15 bg-black/25 p-4">
              <p className="text-sm font-black text-cyan-100 truncate">{nombre}</p>
              <p className="text-xs text-white/45 truncate">{usuario?.correo || "Cliente Jonas Stream"}</p>
              <div className="mt-3 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-black text-emerald-300 w-fit uppercase">
                {usuario?.estado || "activo"}
              </div>
            </div>
          </div>
        </aside>

        <section className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mb-8 rounded-[28px] border border-cyan-400/15 bg-white/[0.04] p-6 backdrop-blur-xl shadow-[0_0_40px_rgba(34,211,238,0.08)]">
            <p className="text-cyan-200/80 text-sm font-black uppercase tracking-[0.18em]">Bienvenido de vuelta</p>
            <h2 className="mt-2 text-3xl sm:text-5xl font-black tracking-tight">
              Hola, <span className="text-cyan-300">{nombre}</span>
            </h2>
            <p className="mt-3 text-white/55 text-sm leading-7 max-w-3xl">
              Gestiona tus compras, accesos entregados, vencimientos y créditos desde un solo lugar.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/tienda" className="rounded-2xl bg-cyan-400 px-5 py-3 font-black text-black no-underline shadow-[0_0_24px_rgba(34,211,238,0.35)]">
                Ir a tienda
              </Link>
              <Link href="/carrito" className="rounded-2xl border border-cyan-300/25 bg-cyan-400/10 px-5 py-3 font-black text-cyan-100 no-underline">
                Ver carrito
              </Link>
            </div>
          </div>

          {activeSection === "dashboard" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard title="Saldo disponible" value={formatMoney(saldo)} subtitle="Créditos Jonas Stream" />
                <StatCard title="Accesos activos" value={String(cuentasActivas.length)} subtitle="Cuentas entregadas" />
                <StatCard title="Por vencer" value={String(proximosVencimientos.length)} subtitle="En los próximos 7 días" />
              </div>

              <GlassCard title="Próximos vencimientos">
                {proximosVencimientos.length === 0 ? (
                  <EmptyText text="No tienes vencimientos próximos." />
                ) : (
                  <div className="space-y-3">
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
                <div className="space-y-3">
                  {pedidos.map((pedido) => {
                    const items = itemsPorPedido.get(pedido.id) || [];
                    const nombres = items
                      .map((item) => productoPorId.get(String(item.producto_id || ""))?.nombre || "Producto")
                      .join(", ");

                    return (
                      <div key={pedido.id} className="rounded-2xl border border-white/10 bg-black/20 p-4 hover:border-cyan-300/30 transition">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div>
                            <h3 className="font-black text-white">Pedido #{pedido.id.slice(0, 8)}</h3>
                            <p className="text-sm text-cyan-100/70 mt-1">{nombres || "Pedido Jonas Stream"}</p>
                            <p className="text-xs text-white/45 mt-1">{formatDate(pedido.created_at)} · {pedido.metodo_pago || "Sin método"}</p>
                          </div>

                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-cyan-200 font-black">{formatMoney(pedido.total)}</span>
                            <span className={`rounded-full border px-3 py-1 text-xs font-black uppercase ${estadoPedidoClass(pedido.estado)}`}>
                              {pedido.estado || "pendiente"}
                            </span>
                          </div>
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
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {cuentasActivas.map((cuenta) => {
                    const producto = productoPorId.get(cuenta.producto_id);
                    const textoCopiar = [
                      `Producto: ${producto?.nombre || "Producto"}`,
                      `Correo: ${cuenta.correo}`,
                      `Contraseña: ${cuenta.clave}`,
                      `Vence: ${formatDate(cuenta.cliente_fin || cuenta.fecha_fin)}`,
                    ].join("\n");

                    return (
                      <div key={cuenta.id} className="rounded-3xl border border-cyan-400/15 bg-black/25 p-5 shadow-[0_0_24px_rgba(34,211,238,0.06)] hover:border-cyan-300/35 hover:-translate-y-1 transition-all duration-300">
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div>
                            <h3 className="text-xl font-black text-cyan-100">{producto?.nombre || "Producto"}</h3>
                            <p className="text-xs text-white/45 uppercase tracking-wider">{producto?.tipo_venta || producto?.categoria || "Acceso digital"}</p>
                          </div>
                          <span className="rounded-full bg-emerald-400/10 border border-emerald-300/30 px-3 py-1 text-xs text-emerald-300 font-black uppercase">Activo</span>
                        </div>

                        <div className="space-y-3 text-sm">
                          <InfoRow label="Correo" value={cuenta.correo || "No disponible"} />
                          <InfoRow label="Contraseña" value={cuenta.clave || "No disponible"} />
                          <InfoRow label="Inicio" value={formatDate(cuenta.cliente_inicio)} />
                          <InfoRow label="Vencimiento" value={formatDate(cuenta.cliente_fin || cuenta.fecha_fin)} />
                        </div>

                        <button onClick={() => copiarTexto(textoCopiar)} className="mt-4 w-full rounded-2xl bg-cyan-400 px-5 py-3 font-black text-black shadow-[0_0_24px_rgba(34,211,238,0.24)] hover:bg-cyan-300 transition">
                          Copiar datos
                        </button>
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
                <div className="space-y-3">
                  {cuentasActivas.map((cuenta) => (
                    <VencimientoItem key={cuenta.id} cuenta={cuenta} producto={productoPorId.get(cuenta.producto_id)} showButton />
                  ))}
                </div>
              )}
            </GlassCard>
          )}

          {activeSection === "creditos" && (
            <GlassCard title="Créditos">
              <div className="mb-6 rounded-3xl border border-cyan-300/20 bg-cyan-400/10 p-6">
                <p className="text-white/50 text-sm">Saldo actual</p>
                <h3 className="text-4xl font-black text-cyan-200 mt-1">{formatMoney(saldo)}</h3>
              </div>

              {creditos.length === 0 ? (
                <EmptyText text="No tienes créditos asignados todavía." />
              ) : (
                <div className="space-y-3">
                  {creditos.map((credito) => (
                    <div key={credito.id} className="rounded-2xl border border-white/10 bg-black/20 p-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-black">Créditos Jonas Stream</p>
                        <p className="text-xs text-white/45">Estado: {credito.estado || "activo"}</p>
                      </div>
                      <span className="text-cyan-200 font-black">{formatMoney(credito.saldo)}</span>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          )}

          {activeSection === "telegram" && (
            <GlassCard title="Telegram">
              <div className="rounded-3xl border border-cyan-300/20 bg-black/25 p-6">
                <h3 className="text-2xl font-black text-cyan-100">Vincula tu Telegram</h3>
                <p className="text-white/50 mt-2 text-sm max-w-2xl leading-7">
                  Recibe avisos de compras, accesos y vencimientos directamente en Telegram. Esta sección queda lista para conectar tu bot más adelante.
                </p>

                <button className="mt-6 rounded-2xl bg-cyan-400 px-5 py-3 font-black text-black shadow-[0_0_24px_rgba(34,211,238,0.35)] hover:scale-[1.02] hover:bg-cyan-300 transition">
                  Vincular Telegram
                </button>
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
    <div className="rounded-3xl border border-cyan-400/15 bg-white/[0.04] p-5 backdrop-blur-xl shadow-[0_0_30px_rgba(34,211,238,0.06)] hover:border-cyan-300/35 hover:-translate-y-1 transition-all duration-300">
      <p className="text-sm text-white/50">{title}</p>
      <h3 className="mt-2 text-3xl font-black text-cyan-200">{value}</h3>
      <p className="mt-1 text-xs text-white/40">{subtitle}</p>
    </div>
  );
}

function GlassCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-cyan-400/15 bg-white/[0.04] p-5 sm:p-6 backdrop-blur-xl shadow-[0_0_35px_rgba(34,211,238,0.08)]">
      <h2 className="mb-5 text-2xl font-black text-cyan-100 uppercase tracking-wide">{title}</h2>
      {children}
    </div>
  );
}

function EmptyText({ text }: { text: string }) {
  return <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-center text-white/45">{text}</div>;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <p className="text-xs text-white/40">{label}</p>
      <p className="mt-1 font-semibold text-white break-all">{value}</p>
    </div>
  );
}

function VencimientoItem({ cuenta, producto, showButton = false }: { cuenta: CuentaProducto; producto?: Producto; showButton?: boolean }) {
  const dias = getDiasRestantes(cuenta.cliente_fin || cuenta.fecha_fin);
  const danger = dias !== null && dias <= 2;
  const warning = dias !== null && dias > 2 && dias <= 7;

  return (
    <div className={`rounded-2xl border p-4 transition hover:-translate-y-1 ${danger ? "border-red-400/35 bg-red-500/10" : warning ? "border-yellow-400/35 bg-yellow-500/10" : "border-cyan-400/15 bg-black/20"}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="font-black text-white">{producto?.nombre || "Producto"}</h3>
          <p className="text-sm text-white/50">
            {dias === null ? "Sin fecha de vencimiento" : dias < 0 ? `Venció hace ${Math.abs(dias)} día(s)` : `Vence en ${dias} día(s)`}
          </p>
          <p className="text-xs text-cyan-100/60 mt-1">Vencimiento: {formatDate(cuenta.cliente_fin || cuenta.fecha_fin)}</p>
        </div>

        {showButton && (
          <Link href="/tienda" className="rounded-xl border border-cyan-300/30 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-200 hover:bg-cyan-400 hover:text-black transition no-underline text-center">
            Renovar
          </Link>
        )}
      </div>
    </div>
  );
}
