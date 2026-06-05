"use client"

import { useEffect, useMemo, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

type UsuarioAdmin = {
  id: string
  nombre: string
  correo: string
  rol: string
  estado: string
}

type SoporteCliente = {
  id: string
  nombre: string
  celular: string | null
  correo_cliente: string | null
  plataforma: string
  correo_asignado: string
  fecha_inicio: string
  fecha_vencimiento: string
  estado: "activo" | "vencido" | "suspendido" | "bloqueado"
  telegram_chat_id: string | null
  notas: string | null
  creado_por: string | null
  created_at: string
  updated_at: string
}

const hoyISO = () => new Date().toISOString().slice(0, 10)

const sumarDiasISO = (dias: number, base = new Date()) => {
  const fecha = new Date(base)
  fecha.setDate(fecha.getDate() + dias)
  return fecha.toISOString().slice(0, 10)
}

const diasRestantes = (fecha: string) => {
  const fin = new Date(`${fecha}T00:00:00`)
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  fin.setHours(0, 0, 0, 0)
  return Math.ceil((fin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
}

const formInicial = {
  nombre: "",
  celular: "",
  correo_cliente: "",
  plataforma: "Netflix",
  correo_asignado: "",
  fecha_inicio: hoyISO(),
  fecha_vencimiento: sumarDiasISO(30),
  estado: "activo" as SoporteCliente["estado"],
  telegram_chat_id: "",
  notas: "",
}

export default function SoporteDashboardPage() {
  const router = useRouter()

  const [verificando, setVerificando] = useState(true)
  const [usuario, setUsuario] = useState<UsuarioAdmin | null>(null)
  const [clientes, setClientes] = useState<SoporteCliente[]>([])
  const [cargandoClientes, setCargandoClientes] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [busqueda, setBusqueda] = useState("")
  const [filtroEstado, setFiltroEstado] = useState("todos")
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [form, setForm] = useState(formInicial)
  const [mensaje, setMensaje] = useState("")

  useEffect(() => {
    const validarAcceso = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error || !user) {
        router.replace("/soporte-panel")
        return
      }

      const { data: usuarioDB, error: errorUsuario } = await supabase
        .from("usuarios")
        .select("id,nombre,correo,rol,estado")
        .eq("id", user.id)
        .single()

      if (
        errorUsuario ||
        !usuarioDB ||
        usuarioDB.rol !== "admin" ||
        (usuarioDB.estado !== "aprobado" && usuarioDB.estado !== "activo")
      ) {
        await supabase.auth.signOut()
        router.replace("/soporte-panel")
        return
      }

      setUsuario(usuarioDB as UsuarioAdmin)
      setVerificando(false)
      await cargarClientes()
    }

    validarAcceso()
  }, [router])

  const cargarClientes = async () => {
    setCargandoClientes(true)

    const { data, error } = await supabase
      .from("soporte_clientes")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      setMensaje("No se pudieron cargar los clientes.")
      setCargandoClientes(false)
      return
    }

    setClientes((data || []) as SoporteCliente[])
    setCargandoClientes(false)
  }

  const cerrarSesion = async () => {
    await supabase.auth.signOut()
    router.replace("/soporte-panel")
  }

  const limpiarFormulario = () => {
    setForm(formInicial)
    setEditandoId(null)
    setMensaje("")
  }

  const guardarCliente = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMensaje("")

    if (!form.nombre.trim()) {
      setMensaje("Completa el nombre del cliente.")
      return
    }

    if (!form.plataforma.trim()) {
      setMensaje("Selecciona o escribe la plataforma.")
      return
    }

    if (!form.correo_asignado.trim()) {
      setMensaje("Completa el correo asignado.")
      return
    }

    if (!form.fecha_vencimiento) {
      setMensaje("Completa la fecha de vencimiento.")
      return
    }

    setGuardando(true)

    const payload = {
      nombre: form.nombre.trim(),
      celular: form.celular.trim() || null,
      correo_cliente: form.correo_cliente.trim() || null,
      plataforma: form.plataforma.trim(),
      correo_asignado: form.correo_asignado.trim().toLowerCase(),
      fecha_inicio: form.fecha_inicio,
      fecha_vencimiento: form.fecha_vencimiento,
      estado: form.estado,
      telegram_chat_id: form.telegram_chat_id.trim() || null,
      notas: form.notas.trim() || null,
      creado_por: usuario?.id || null,
      updated_at: new Date().toISOString(),
    }

    if (editandoId) {
      const { error } = await supabase
        .from("soporte_clientes")
        .update(payload)
        .eq("id", editandoId)

      if (error) {
        setMensaje("No se pudo actualizar el cliente.")
        setGuardando(false)
        return
      }

      setMensaje("Cliente actualizado correctamente.")
    } else {
      const { error } = await supabase.from("soporte_clientes").insert([payload])

      if (error) {
        setMensaje("No se pudo registrar el cliente.")
        setGuardando(false)
        return
      }

      setMensaje("Cliente registrado correctamente.")
    }

    setGuardando(false)
    limpiarFormulario()
    await cargarClientes()
  }

  const editarCliente = (cliente: SoporteCliente) => {
    setEditandoId(cliente.id)
    setForm({
      nombre: cliente.nombre || "",
      celular: cliente.celular || "",
      correo_cliente: cliente.correo_cliente || "",
      plataforma: cliente.plataforma || "Netflix",
      correo_asignado: cliente.correo_asignado || "",
      fecha_inicio: cliente.fecha_inicio || hoyISO(),
      fecha_vencimiento: cliente.fecha_vencimiento || sumarDiasISO(30),
      estado: cliente.estado || "activo",
      telegram_chat_id: cliente.telegram_chat_id || "",
      notas: cliente.notas || "",
    })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const cambiarEstado = async (
    cliente: SoporteCliente,
    nuevoEstado: SoporteCliente["estado"]
  ) => {
    const { error } = await supabase
      .from("soporte_clientes")
      .update({
        estado: nuevoEstado,
        updated_at: new Date().toISOString(),
      })
      .eq("id", cliente.id)

    if (error) {
      setMensaje("No se pudo cambiar el estado.")
      return
    }

    await cargarClientes()
  }

  const renovarCliente = async (cliente: SoporteCliente) => {
    const fechaActual = new Date(`${cliente.fecha_vencimiento}T00:00:00`)
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    const base = fechaActual > hoy ? fechaActual : hoy
    const nuevaFecha = sumarDiasISO(30, base)

    const { error } = await supabase
      .from("soporte_clientes")
      .update({
        estado: "activo",
        fecha_vencimiento: nuevaFecha,
        updated_at: new Date().toISOString(),
      })
      .eq("id", cliente.id)

    if (error) {
      setMensaje("No se pudo renovar el cliente.")
      return
    }

    await cargarClientes()
  }

  const eliminarCliente = async (cliente: SoporteCliente) => {
    const confirmar = window.confirm(
      `¿Eliminar a ${cliente.nombre}? Esta acción no se puede deshacer.`
    )

    if (!confirmar) return

    const { error } = await supabase
      .from("soporte_clientes")
      .delete()
      .eq("id", cliente.id)

    if (error) {
      setMensaje("No se pudo eliminar el cliente.")
      return
    }

    await cargarClientes()
  }

  const actualizarVencidos = async () => {
    const hoy = hoyISO()

    const vencidos = clientes.filter(
      (cliente) =>
        cliente.estado === "activo" && cliente.fecha_vencimiento < hoy
    )

    if (vencidos.length === 0) {
      setMensaje("No hay clientes vencidos por actualizar.")
      return
    }

    const ids = vencidos.map((cliente) => cliente.id)

    const { error } = await supabase
      .from("soporte_clientes")
      .update({
        estado: "vencido",
        updated_at: new Date().toISOString(),
      })
      .in("id", ids)

    if (error) {
      setMensaje("No se pudieron actualizar los vencidos.")
      return
    }

    setMensaje(`${vencidos.length} cliente(s) marcados como vencidos.`)
    await cargarClientes()
  }

  const clientesFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()

    return clientes.filter((cliente) => {
      const texto = [
        cliente.nombre,
        cliente.celular,
        cliente.correo_cliente,
        cliente.plataforma,
        cliente.correo_asignado,
        cliente.estado,
      ]
        .join(" ")
        .toLowerCase()

      const coincideBusqueda = !q || texto.includes(q)
      const coincideEstado =
        filtroEstado === "todos" || cliente.estado === filtroEstado

      return coincideBusqueda && coincideEstado
    })
  }, [clientes, busqueda, filtroEstado])

  const resumen = useMemo(() => {
    const activos = clientes.filter(
      (cliente) =>
        cliente.estado === "activo" &&
        diasRestantes(cliente.fecha_vencimiento) >= 0
    ).length

    const vencidos = clientes.filter(
      (cliente) =>
        cliente.estado === "vencido" ||
        diasRestantes(cliente.fecha_vencimiento) < 0
    ).length

    const suspendidos = clientes.filter(
      (cliente) => cliente.estado === "suspendido"
    ).length

    const bloqueados = clientes.filter(
      (cliente) => cliente.estado === "bloqueado"
    ).length

    return {
      activos,
      vencidos,
      suspendidos,
      bloqueados,
      total: clientes.length,
    }
  }, [clientes])

  if (verificando) {
    return (
      <main style={stylesPage.centerPage}>
        <div style={stylesPage.loadingBox}>
          <p style={stylesPage.kicker}>JONAS STREAM</p>
          <h2 style={{ margin: "14px 0 8px" }}>Verificando acceso...</h2>
          <p style={stylesPage.muted}>Validando sesión administrativa.</p>
        </div>
      </main>
    )
  }

  return (
    <main style={stylesPage.page}>
      <section style={stylesPage.container}>
        <header style={stylesPage.header}>
          <div>
            <p style={stylesPage.kicker}>JONAS STREAM · SOPORTE PANEL</p>
            <h1 style={stylesPage.title}>Dashboard de soporte</h1>
            <p style={stylesPage.description}>
              Administración de clientes, correos asignados, renovaciones,
              vencimientos y acceso operativo del soporte.
            </p>
          </div>

          <div style={stylesPage.adminCard}>
            <p style={stylesPage.mutedSmall}>Administrador</p>
            <strong>{usuario?.nombre || "Admin"}</strong>
            <span style={stylesPage.smallText}>{usuario?.correo}</span>

            <button type="button" onClick={cerrarSesion} style={stylesPage.buttonGhost}>
              Cerrar sesión
            </button>
          </div>
        </header>

        <div style={stylesPage.statsGrid}>
          <StatCard label="Clientes activos" value={resumen.activos} />
          <StatCard label="Clientes vencidos" value={resumen.vencidos} />
          <StatCard label="Suspendidos" value={resumen.suspendidos} />
          <StatCard label="Total clientes" value={resumen.total} />
        </div>

        <section style={stylesPage.panel}>
          <div style={stylesPage.panelHeader}>
            <div>
              <p style={stylesPage.kicker}>GESTIÓN DE CLIENTES</p>
              <h2 style={{ margin: "10px 0" }}>
                {editandoId ? "Editar cliente" : "Registrar cliente"}
              </h2>
              <p style={stylesPage.muted}>
                Registra el cliente, la plataforma, el correo asignado y la fecha
                de vencimiento.
              </p>
            </div>

            <button type="button" onClick={actualizarVencidos} style={stylesPage.buttonSecondary}>
              Marcar vencidos
            </button>
          </div>

          {mensaje && <div style={stylesPage.notice}>{mensaje}</div>}

          <form onSubmit={guardarCliente} style={stylesPage.formGrid}>
            <input
              style={stylesPage.input}
              placeholder="Nombre del cliente"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />

            <input
              style={stylesPage.input}
              placeholder="Celular / WhatsApp"
              value={form.celular}
              onChange={(e) => setForm({ ...form, celular: e.target.value })}
            />

            <input
              style={stylesPage.input}
              placeholder="Correo personal del cliente"
              value={form.correo_cliente}
              onChange={(e) =>
                setForm({ ...form, correo_cliente: e.target.value })
              }
            />

            <select
              style={stylesPage.input}
              value={form.plataforma}
              onChange={(e) => setForm({ ...form, plataforma: e.target.value })}
            >
              <option value="Netflix">Netflix</option>
              <option value="Prime Video">Prime Video</option>
              <option value="Disney+">Disney+</option>
              <option value="Crunchyroll">Crunchyroll</option>
              <option value="Vix">Vix</option>
              <option value="Max">Max</option>
              <option value="Spotify">Spotify</option>
              <option value="YouTube Premium">YouTube Premium</option>
              <option value="Otro">Otro</option>
            </select>

            <input
              style={stylesPage.input}
              placeholder="Correo asignado: cliente01@jonasstream.xyz"
              value={form.correo_asignado}
              onChange={(e) =>
                setForm({ ...form, correo_asignado: e.target.value })
              }
            />

            <input
              style={stylesPage.input}
              type="date"
              value={form.fecha_inicio}
              onChange={(e) =>
                setForm({ ...form, fecha_inicio: e.target.value })
              }
            />

            <input
              style={stylesPage.input}
              type="date"
              value={form.fecha_vencimiento}
              onChange={(e) =>
                setForm({ ...form, fecha_vencimiento: e.target.value })
              }
            />

            <select
              style={stylesPage.input}
              value={form.estado}
              onChange={(e) =>
                setForm({
                  ...form,
                  estado: e.target.value as SoporteCliente["estado"],
                })
              }
            >
              <option value="activo">Activo</option>
              <option value="vencido">Vencido</option>
              <option value="suspendido">Suspendido</option>
              <option value="bloqueado">Bloqueado</option>
            </select>

            <input
              style={stylesPage.input}
              placeholder="Telegram Chat ID, opcional"
              value={form.telegram_chat_id}
              onChange={(e) =>
                setForm({ ...form, telegram_chat_id: e.target.value })
              }
            />

            <textarea
              style={{ ...stylesPage.input, minHeight: "92px", gridColumn: "1 / -1" }}
              placeholder="Notas internas"
              value={form.notas}
              onChange={(e) => setForm({ ...form, notas: e.target.value })}
            />

            <div style={stylesPage.formActions}>
              <button type="submit" disabled={guardando} style={stylesPage.buttonPrimary}>
                {guardando
                  ? "Guardando..."
                  : editandoId
                  ? "Actualizar cliente"
                  : "Registrar cliente"}
              </button>

              {editandoId && (
                <button type="button" onClick={limpiarFormulario} style={stylesPage.buttonSecondary}>
                  Cancelar edición
                </button>
              )}
            </div>
          </form>
        </section>

        <section style={stylesPage.panel}>
          <div style={stylesPage.panelHeader}>
            <div>
              <p style={stylesPage.kicker}>CLIENTES REGISTRADOS</p>
              <h2 style={{ margin: "10px 0" }}>Lista de clientes</h2>
              <p style={stylesPage.muted}>
                Filtra por nombre, correo, plataforma o estado.
              </p>
            </div>
          </div>

          <div style={stylesPage.filters}>
            <input
              style={stylesPage.input}
              placeholder="Buscar cliente, correo o plataforma..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />

            <select
              style={stylesPage.input}
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="todos">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="vencido">Vencidos</option>
              <option value="suspendido">Suspendidos</option>
              <option value="bloqueado">Bloqueados</option>
            </select>
          </div>

          {cargandoClientes ? (
            <p style={stylesPage.muted}>Cargando clientes...</p>
          ) : clientesFiltrados.length === 0 ? (
            <p style={stylesPage.muted}>No hay clientes registrados.</p>
          ) : (
            <div style={stylesPage.tableWrap}>
              <table style={stylesPage.table}>
                <thead>
                  <tr>
                    <th style={stylesPage.th}>Cliente</th>
                    <th style={stylesPage.th}>Plataforma</th>
                    <th style={stylesPage.th}>Correo asignado</th>
                    <th style={stylesPage.th}>Vence</th>
                    <th style={stylesPage.th}>Estado</th>
                    <th style={stylesPage.th}>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {clientesFiltrados.map((cliente) => {
                    const dias = diasRestantes(cliente.fecha_vencimiento)

                    return (
                      <tr key={cliente.id}>
                        <td style={stylesPage.td}>
                          <strong>{cliente.nombre}</strong>
                          <span style={stylesPage.smallText}>
                            {cliente.celular || "Sin celular"}
                          </span>
                        </td>

                        <td style={stylesPage.td}>{cliente.plataforma}</td>

                        <td style={stylesPage.td}>
                          <strong>{cliente.correo_asignado}</strong>
                          {cliente.correo_cliente && (
                            <span style={stylesPage.smallText}>
                              Cliente: {cliente.correo_cliente}
                            </span>
                          )}
                        </td>

                        <td style={stylesPage.td}>
                          <strong>{cliente.fecha_vencimiento}</strong>
                          <span style={stylesPage.smallText}>
                            {dias < 0
                              ? `Vencido hace ${Math.abs(dias)} día(s)`
                              : `Faltan ${dias} día(s)`}
                          </span>
                        </td>

                        <td style={stylesPage.td}>
                          <EstadoBadge estado={cliente.estado} dias={dias} />
                        </td>

                        <td style={stylesPage.td}>
                          <div style={stylesPage.actions}>
                            <button
                              type="button"
                              onClick={() => renovarCliente(cliente)}
                              style={stylesPage.buttonMini}
                            >
                              Renovar +30
                            </button>

                            <button
                              type="button"
                              onClick={() => editarCliente(cliente)}
                              style={stylesPage.buttonMiniGhost}
                            >
                              Editar
                            </button>

                            <button
                              type="button"
                              onClick={() => cambiarEstado(cliente, "suspendido")}
                              style={stylesPage.buttonMiniGhost}
                            >
                              Suspender
                            </button>

                            <button
                              type="button"
                              onClick={() => cambiarEstado(cliente, "activo")}
                              style={stylesPage.buttonMiniGhost}
                            >
                              Activar
                            </button>

                            <button
                              type="button"
                              onClick={() => eliminarCliente(cliente)}
                              style={stylesPage.buttonDanger}
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </main>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div style={stylesPage.statCard}>
      <p style={{ color: "#9BC8CB", margin: 0 }}>{label}</p>
      <strong style={stylesPage.statValue}>{value}</strong>
    </div>
  )
}

function EstadoBadge({
  estado,
  dias,
}: {
  estado: SoporteCliente["estado"]
  dias: number
}) {
  const vencidoPorFecha = dias < 0

  const color =
    estado === "activo" && !vencidoPorFecha
      ? "#00FBFF"
      : estado === "vencido" || vencidoPorFecha
      ? "#ff5252"
      : estado === "suspendido"
      ? "#ffcc66"
      : "#9BC8CB"

  return (
    <span
      style={{
        display: "inline-flex",
        padding: "7px 11px",
        borderRadius: "999px",
        border: `1px solid ${color}`,
        color,
        fontSize: "12px",
        fontWeight: 900,
        textTransform: "uppercase",
      }}
    >
      {vencidoPorFecha && estado === "activo" ? "vencido" : estado}
    </span>
  )
}

const stylesPage: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top left, rgba(1, 231, 239, 0.18), transparent 35%), radial-gradient(circle at bottom right, rgba(0, 251, 255, 0.14), transparent 35%), linear-gradient(135deg, #000000, #031316, #071B1E)",
    color: "#ECFFFF",
    padding: "40px",
    fontFamily: "Arial, sans-serif",
  },
  centerPage: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top left, rgba(1, 231, 239, 0.18), transparent 35%), linear-gradient(135deg, #000000, #031316, #071B1E)",
    color: "#ECFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Arial, sans-serif",
  },
  loadingBox: {
    border: "1px solid rgba(1, 231, 239, 0.18)",
    background: "rgba(3, 19, 22, 0.78)",
    borderRadius: "22px",
    padding: "28px",
    boxShadow: "0 0 40px rgba(0, 251, 255, 0.22)",
    textAlign: "center",
  },
  container: {
    maxWidth: "1280px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    alignItems: "center",
    marginBottom: "34px",
  },
  kicker: {
    color: "#01E7EF",
    letterSpacing: "0.16em",
    fontWeight: 900,
    fontSize: "13px",
    margin: 0,
  },
  title: {
    fontSize: "52px",
    margin: "12px 0",
    lineHeight: 1,
  },
  description: {
    color: "#9BC8CB",
    maxWidth: "680px",
    lineHeight: 1.7,
    margin: 0,
  },
  muted: {
    color: "#9BC8CB",
    lineHeight: 1.7,
    margin: 0,
  },
  mutedSmall: {
    color: "#9BC8CB",
    margin: "0 0 6px",
    fontSize: "13px",
  },
  smallText: {
    display: "block",
    color: "#9BC8CB",
    fontSize: "12px",
    marginTop: "4px",
  },
  adminCard: {
    border: "1px solid rgba(1, 231, 239, 0.18)",
    background: "rgba(3, 19, 22, 0.78)",
    borderRadius: "20px",
    padding: "16px",
    minWidth: "260px",
    boxShadow: "0 0 25px rgba(1, 231, 239, 0.18)",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "18px",
    marginTop: "36px",
  },
  statCard: {
    border: "1px solid rgba(1, 231, 239, 0.18)",
    background: "rgba(3, 19, 22, 0.78)",
    borderRadius: "22px",
    padding: "24px",
    boxShadow: "0 0 25px rgba(1, 231, 239, 0.18)",
  },
  statValue: {
    display: "block",
    color: "#01E7EF",
    fontSize: "38px",
    marginTop: "12px",
  },
  panel: {
    marginTop: "30px",
    border: "1px solid rgba(1, 231, 239, 0.18)",
    background: "rgba(3, 19, 22, 0.78)",
    borderRadius: "24px",
    padding: "24px",
    boxShadow: "0 0 25px rgba(1, 231, 239, 0.18)",
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    alignItems: "center",
    marginBottom: "22px",
  },
  notice: {
    border: "1px solid rgba(1, 231, 239, 0.25)",
    background: "rgba(1, 231, 239, 0.08)",
    color: "#ECFFFF",
    borderRadius: "16px",
    padding: "14px",
    marginBottom: "18px",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "14px",
  },
  filters: {
    display: "grid",
    gridTemplateColumns: "1fr 240px",
    gap: "14px",
    marginBottom: "20px",
  },
  input: {
    width: "100%",
    border: "1px solid rgba(1, 231, 239, 0.18)",
    outline: "none",
    borderRadius: "15px",
    padding: "14px 15px",
    background: "rgba(0, 0, 0, 0.34)",
    color: "#ECFFFF",
    fontSize: "14px",
  },
  formActions: {
    gridColumn: "1 / -1",
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  buttonPrimary: {
    border: "none",
    background: "linear-gradient(135deg, #01E7EF, #00FBFF)",
    color: "#000000",
    borderRadius: "15px",
    padding: "14px 18px",
    fontWeight: 950,
    cursor: "pointer",
  },
  buttonSecondary: {
    border: "1px solid rgba(1, 231, 239, 0.25)",
    background: "rgba(1, 231, 239, 0.08)",
    color: "#01E7EF",
    borderRadius: "15px",
    padding: "14px 18px",
    fontWeight: 900,
    cursor: "pointer",
  },
  buttonGhost: {
    width: "100%",
    marginTop: "14px",
    border: "1px solid rgba(1, 231, 239, 0.18)",
    background: "rgba(1, 231, 239, 0.08)",
    color: "#01E7EF",
    borderRadius: "14px",
    padding: "12px",
    fontWeight: 900,
    cursor: "pointer",
  },
  tableWrap: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "1000px",
  },
  th: {
    color: "#01E7EF",
    textAlign: "left",
    padding: "14px",
    borderBottom: "1px solid rgba(1, 231, 239, 0.18)",
    fontSize: "13px",
    textTransform: "uppercase",
  },
  td: {
    padding: "14px",
    borderBottom: "1px solid rgba(1, 231, 239, 0.1)",
    color: "#ECFFFF",
    verticalAlign: "top",
  },
  actions: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  buttonMini: {
    border: "none",
    background: "#00FBFF",
    color: "#000000",
    borderRadius: "999px",
    padding: "8px 11px",
    fontSize: "12px",
    fontWeight: 900,
    cursor: "pointer",
  },
  buttonMiniGhost: {
    border: "1px solid rgba(1, 231, 239, 0.25)",
    background: "rgba(1, 231, 239, 0.08)",
    color: "#01E7EF",
    borderRadius: "999px",
    padding: "8px 11px",
    fontSize: "12px",
    fontWeight: 900,
    cursor: "pointer",
  },
  buttonDanger: {
    border: "1px solid rgba(255, 67, 67, 0.45)",
    background: "rgba(255, 67, 67, 0.15)",
    color: "#ff8a8a",
    borderRadius: "999px",
    padding: "8px 11px",
    fontSize: "12px",
    fontWeight: 900,
    cursor: "pointer",
  },
}