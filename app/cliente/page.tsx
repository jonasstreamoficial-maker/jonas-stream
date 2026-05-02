"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Pedido = {
  id: string;
  producto?: string | null;
  nombre_producto?: string | null;
  total?: number | null;
  estado?: "pendiente" | "pagado" | "entregado" | string;
  created_at?: string;
};

type Acceso = {
  id: string;
  producto?: string | null;
  correo?: string | null;
  email?: string | null;
  contraseña?: string | null;
  password?: string | null;
  tipo?: "perfil" | "cuenta completa" | string;
  fecha_vencimiento?: string | null;
  vence?: string | null;
};

type Credito = {
  id: string;
  monto?: number | null;
  tipo?: string | null;
  descripcion?: string | null;
  created_at?: string;
};

type Perfil = {
  id?: string;
  nombre?: string | null;
  full_name?: string | null;
  saldo?: number | null;
  creditos?: number | null;
  telegram_id?: string | null;
  telegram_vinculado?: boolean | null;
};

export default function ClientePage() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [nombre, setNombre] = useState("Cliente");

  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [accesos, setAccesos] = useState<Acceso[]>([]);
  const [creditos, setCreditos] = useState<Credito[]>([]);
  const [activeSection, setActiveSection] = useState("dashboard");

  useEffect(() => {
    cargarPanelCliente();
  }, []);

  const cargarPanelCliente = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      setUserId(user.id);
      setNombre(user.user_metadata?.name || user.email?.split("@")[0] || "Cliente");

      const { data: perfilData } = await supabase
        .from("perfiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (perfilData) {
        setPerfil(perfilData);
        setNombre(
          perfilData.nombre ||
            perfilData.full_name ||
            user.user_metadata?.name ||
            user.email?.split("@")[0] ||
            "Cliente"
        );
      }

      const { data: pedidosData } = await supabase
        .from("pedidos")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setPedidos(pedidosData || []);

      const { data: accesosData } = await supabase
        .from("accesos")
        .select("*")
        .eq("user_id", user.id)
        .order("fecha_vencimiento", { ascending: true });

      setAccesos(accesosData || []);

      const { data: creditosData } = await supabase
        .from("creditos")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setCreditos(creditosData || []);
    } catch (error) {
      console.error("Error cargando panel cliente:", error);
    } finally {
      setLoading(false);
    }
  };

  const saldo = perfil?.saldo ?? perfil?.creditos ?? 0;

  const proximosVencimientos = useMemo(() => {
    const hoy = new Date();

    return accesos
      .filter((acceso) => {
        const fecha = acceso.fecha_vencimiento || acceso.vence;
        if (!fecha) return false;

        const vencimiento = new Date(fecha);
        const dias = Math.ceil(
          (vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
        );

        return dias <= 7;
      })
      .slice(0, 5);
  }, [accesos]);

  const getDiasRestantes = (fecha?: string | null) => {
    if (!fecha) return null;

    const hoy = new Date();
    const vencimiento = new Date(fecha);

    return Math.ceil(
      (vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
    );
  };

  const getEstadoClass = (estado?: string) => {
    if (estado === "pagado") return "text-cyan-300 border-cyan-400/40 bg-cyan-400/10";
    if (estado === "entregado") return "text-emerald-300 border-emerald-400/40 bg-emerald-400/10";
    return "text-yellow-300 border-yellow-400/40 bg-yellow-400/10";
  };

  const menu = [
    { id: "dashboard", label: "Dashboard", icon: "🏠" },
    { id: "compras", label: "Mis compras", icon: "🛒" },
    { id: "accesos", label: "Mis accesos", icon: "⭐" },
    { id: "vencimientos", label: "Vencimientos", icon: "⏳" },
    { id: "creditos", label: "Créditos", icon: "💎" },
    { id: "telegram", label: "Telegram", icon: "✈️" },
  ];

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
    <main className="min-h-screen bg-[#020617] text-white overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-cyan-300/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row min-h-screen">
        <aside className="lg:w-72 border-b lg:border-b-0 lg:border-r border-cyan-400/10 bg-white/[0.04] backdrop-blur-2xl">
          <div className="p-6">
            <div className="mb-8">
              <h1 className="text-2xl font-black tracking-wide">
                Jonas <span className="text-cyan-300 drop-shadow-[0_0_12px_rgba(34,211,238,0.8)]">Stream</span>
              </h1>
              <p className="text-sm text-cyan-100/60 mt-1">Panel Cliente</p>
            </div>

            <nav className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-3">
              {menu.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                    activeSection === item.id
                      ? "bg-cyan-400/15 text-cyan-200 border border-cyan-300/40 shadow-[0_0_24px_rgba(34,211,238,0.20)]"
                      : "bg-white/[0.03] text-white/70 border border-white/5 hover:border-cyan-300/30 hover:bg-cyan-400/10 hover:text-cyan-100"
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        <section className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mb-8 rounded-3xl border border-cyan-400/15 bg-white/[0.04] p-6 backdrop-blur-xl shadow-[0_0_40px_rgba(34,211,238,0.08)]">
            <p className="text-cyan-200/80 text-sm">Bienvenido de vuelta</p>
            <h2 className="mt-1 text-3xl sm:text-4xl font-black">
              Hola, <span className="text-cyan-300">{nombre}</span>
            </h2>
            <p className="mt-2 text-white/50 text-sm">
              Gestiona tus compras, accesos, vencimientos y créditos desde un solo lugar.
            </p>
          </div>

          {activeSection === "dashboard" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard title="Saldo disponible" value={`S/ ${saldo}`} subtitle="Créditos Jonas Stream" />
                <StatCard title="Accesos activos" value={String(accesos.length)} subtitle="Productos disponibles" />
                <StatCard title="Por vencer" value={String(proximosVencimientos.length)} subtitle="En los próximos 7 días" />
              </div>

              <GlassCard title="Próximos vencimientos">
                {proximosVencimientos.length === 0 ? (
                  <EmptyText text="No tienes vencimientos próximos." />
                ) : (
                  <div className="space-y-3">
                    {proximosVencimientos.map((acceso) => (
                      <VencimientoItem key={acceso.id} acceso={acceso} dias={getDiasRestantes(acceso.fecha_vencimiento || acceso.vence)} />
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
                  {pedidos.map((pedido) => (
                    <div key={pedido.id} className="rounded-2xl border border-white/10 bg-black/20 p-4 hover:border-cyan-300/30 transition">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-white">
                            {pedido.producto || pedido.nombre_producto || "Producto"}
                          </h3>
                          <p className="text-xs text-white/45">
                            {pedido.created_at ? new Date(pedido.created_at).toLocaleDateString() : "Sin fecha"}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-cyan-200 font-bold">
                            S/ {pedido.total ?? 0}
                          </span>
                          <span className={`rounded-full border px-3 py-1 text-xs font-bold ${getEstadoClass(pedido.estado)}`}>
                            {pedido.estado || "pendiente"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          )}

          {activeSection === "accesos" && (
            <GlassCard title="Mis accesos">
              {accesos.length === 0 ? (
                <EmptyText text="Todavía no tienes accesos activos." />
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {accesos.map((acceso) => (
                    <div key={acceso.id} className="rounded-3xl border border-cyan-400/15 bg-black/25 p-5 shadow-[0_0_24px_rgba(34,211,238,0.06)] hover:border-cyan-300/35 hover:-translate-y-1 transition-all duration-300">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                          <h3 className="text-xl font-black text-cyan-100">
                            {acceso.producto || "Producto"}
                          </h3>
                          <p className="text-xs text-white/45 uppercase tracking-wider">
                            {acceso.tipo || "perfil"}
                          </p>
                        </div>
                        <span className="rounded-full bg-cyan-400/10 border border-cyan-300/30 px-3 py-1 text-xs text-cyan-200">
                          Activo
                        </span>
                      </div>

                      <div className="space-y-3 text-sm">
                        <InfoRow label="Correo" value={acceso.correo || acceso.email || "No disponible"} />
                        <InfoRow label="Contraseña" value={acceso.contraseña || acceso.password || "No disponible"} />
                        <InfoRow label="Vencimiento" value={(acceso.fecha_vencimiento || acceso.vence) ? new Date(acceso.fecha_vencimiento || acceso.vence || "").toLocaleDateString() : "Sin fecha"} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          )}

          {activeSection === "vencimientos" && (
            <GlassCard title="Vencimientos">
              {accesos.length === 0 ? (
                <EmptyText text="No tienes productos con vencimiento." />
              ) : (
                <div className="space-y-3">
                  {accesos.map((acceso) => (
                    <VencimientoItem
                      key={acceso.id}
                      acceso={acceso}
                      dias={getDiasRestantes(acceso.fecha_vencimiento || acceso.vence)}
                      showButton
                    />
                  ))}
                </div>
              )}
            </GlassCard>
          )}

          {activeSection === "creditos" && (
            <GlassCard title="Créditos">
              <div className="mb-6 rounded-3xl border border-cyan-300/20 bg-cyan-400/10 p-6">
                <p className="text-white/50 text-sm">Saldo actual</p>
                <h3 className="text-4xl font-black text-cyan-200 mt-1">S/ {saldo}</h3>
              </div>

              {creditos.length === 0 ? (
                <EmptyText text="No tienes historial de créditos." />
              ) : (
                <div className="space-y-3">
                  {creditos.map((credito) => (
                    <div key={credito.id} className="rounded-2xl border border-white/10 bg-black/20 p-4 flex items-center justify-between">
                      <div>
                        <p className="font-bold">{credito.descripcion || credito.tipo || "Movimiento"}</p>
                        <p className="text-xs text-white/45">
                          {credito.created_at ? new Date(credito.created_at).toLocaleDateString() : "Sin fecha"}
                        </p>
                      </div>
                      <span className="text-cyan-200 font-black">S/ {credito.monto ?? 0}</span>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          )}

          {activeSection === "telegram" && (
            <GlassCard title="Telegram">
              <div className="rounded-3xl border border-cyan-300/20 bg-black/25 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
                  <div>
                    <h3 className="text-2xl font-black text-cyan-100">Vincula tu Telegram</h3>
                    <p className="text-white/50 mt-2 text-sm">
                      Recibe avisos de compras, accesos y vencimientos directamente en Telegram.
                    </p>
                  </div>

                  <span
                    className={`rounded-full border px-4 py-2 text-sm font-bold ${
                      perfil?.telegram_id || perfil?.telegram_vinculado
                        ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                        : "border-red-400/40 bg-red-400/10 text-red-300"
                    }`}
                  >
                    {perfil?.telegram_id || perfil?.telegram_vinculado
                      ? "Vinculado"
                      : "No vinculado"}
                  </span>
                </div>

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

function StatCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-3xl border border-cyan-400/15 bg-white/[0.04] p-5 backdrop-blur-xl shadow-[0_0_30px_rgba(34,211,238,0.06)] hover:border-cyan-300/35 hover:-translate-y-1 transition-all duration-300">
      <p className="text-sm text-white/50">{title}</p>
      <h3 className="mt-2 text-3xl font-black text-cyan-200">{value}</h3>
      <p className="mt-1 text-xs text-white/40">{subtitle}</p>
    </div>
  );
}

function GlassCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-cyan-400/15 bg-white/[0.04] p-5 sm:p-6 backdrop-blur-xl shadow-[0_0_35px_rgba(34,211,238,0.08)]">
      <h2 className="mb-5 text-2xl font-black text-cyan-100">{title}</h2>
      {children}
    </div>
  );
}

function EmptyText({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-6 text-center text-white/45">
      {text}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <p className="text-xs text-white/40">{label}</p>
      <p className="mt-1 font-semibold text-white break-all">{value}</p>
    </div>
  );
}

function VencimientoItem({
  acceso,
  dias,
  showButton = false,
}: {
  acceso: Acceso;
  dias: number | null;
  showButton?: boolean;
}) {
  const danger = dias !== null && dias <= 2;
  const warning = dias !== null && dias > 2 && dias <= 7;

  return (
    <div
      className={`rounded-2xl border p-4 transition hover:-translate-y-1 ${
        danger
          ? "border-red-400/35 bg-red-500/10"
          : warning
          ? "border-yellow-400/35 bg-yellow-500/10"
          : "border-cyan-400/15 bg-black/20"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="font-black text-white">{acceso.producto || "Producto"}</h3>
          <p className="text-sm text-white/50">
            {dias === null
              ? "Sin fecha de vencimiento"
              : dias < 0
              ? `Venció hace ${Math.abs(dias)} día(s)`
              : `Vence en ${dias} día(s)`}
          </p>
        </div>

        {showButton && (
          <button className="rounded-xl border border-cyan-300/30 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-200 hover:bg-cyan-400 hover:text-black transition">
            Renovar
          </button>
        )}
      </div>
    </div>
  );
}