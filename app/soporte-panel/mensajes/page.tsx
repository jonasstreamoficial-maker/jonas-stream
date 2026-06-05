"use client"

import { useEffect, useMemo, useState } from "react"
import type { CSSProperties } from "react"
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
  plataforma: string
  correo_asignado: string
  estado: string
}

type SoporteMensaje = {
  id: string
  cliente_id: string | null
  correo_destino: string
  plataforma: string | null
  remitente: string | null
  asunto: string | null
  cuerpo_texto: string | null
  cuerpo_html: string | null
  leido: boolean
  fecha_mensaje: string
  created_at: string
}

function limpiarUrl(url: string) {
  return url.replace(/[)\].,;]+$/g, "")
}

function obtenerNombreLink(url: string) {
  const urlLower = url.toLowerCase()

  if (urlLower.includes("netflix.com")) return "Abrir Netflix"
  if (urlLower.includes("disney")) return "Abrir Disney+"
  if (urlLower.includes("primevideo") || urlLower.includes("amazon")) {
    return "Abrir Prime Video"
  }
  if (urlLower.includes("crunchyroll")) return "Abrir Crunchyroll"
  if (urlLower.includes("youtube")) return "Abrir YouTube"
  if (urlLower.includes("spotify")) return "Abrir Spotify"
  if (urlLower.includes("max.com") || urlLower.includes("hbomax")) return "Abrir Max"

  return "Abrir enlace"
}

function extraerLinks(texto: string) {
  if (!texto) return []

  const textoNormalizado = texto.replace(/\[(https?:\/\/[^\]]+)\]/gi, "$1")
  const encontrados = textoNormalizado.match(/https?:\/\/[^\s<>"']+/gi) || []

  return Array.from(new Set(encontrados.map((url) => limpiarUrl(url))))
}

function TextoConLinks({ texto }: { texto: string }) {
  if (!texto) return null

  const textoNormalizado = texto.replace(/\[(https?:\/\/[^\]]+)\]/gi, "$1")
  const partes = textoNormalizado.split(/(https?:\/\/[^\s<>"']+)/gi)

  return (
    <>
      {partes.map((parte, index) => {
        const esLink = /^https?:\/\//i.test(parte)

        if (!esLink) {
          return <span key={index}>{parte}</span>
        }

        const urlLimpia = limpiarUrl(parte)
        const sobrante = parte.slice(urlLimpia.length)

        return (
          <span key={index}>
            <a
              href={urlLimpia}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.linkInline}
            >
              {obtenerNombreLink(urlLimpia)}
            </a>
            {sobrante}
          </span>
        )
      })}
    </>
  )
}

export default function SoporteMensajesPage() {
  const router = useRouter()

  const [verificando, setVerificando] = useState(true)
  const [usuario, setUsuario] = useState<UsuarioAdmin | null>(null)
  const [mensajes, setMensajes] = useState<SoporteMensaje[]>([])
  const [clientes, setClientes] = useState<SoporteCliente[]>([])
  const [mensajeSeleccionado, setMensajeSeleccionado] =
    useState<SoporteMensaje | null>(null)
  const [busqueda, setBusqueda] = useState("")
  const [filtroLectura, setFiltroLectura] = useState("todos")
  const [cargando, setCargando] = useState(false)
  const [aviso, setAviso] = useState("")

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
      await cargarDatos()
    }

    validarAcceso()
  }, [router])

  const cargarDatos = async () => {
    setCargando(true)
    setAviso("")

    const [mensajesResult, clientesResult] = await Promise.all([
      supabase
        .from("soporte_mensajes")
        .select("*")
        .order("fecha_mensaje", { ascending: false }),
      supabase
        .from("soporte_clientes")
        .select("id,nombre,plataforma,correo_asignado,estado"),
    ])

    if (mensajesResult.error) {
      setAviso("No se pudieron cargar los mensajes.")
    } else {
      setMensajes((mensajesResult.data || []) as SoporteMensaje[])
    }

    if (!clientesResult.error) {
      setClientes((clientesResult.data || []) as SoporteCliente[])
    }

    setCargando(false)
  }

  const cerrarSesion = async () => {
    await supabase.auth.signOut()
    router.replace("/soporte-panel")
  }

  const obtenerCliente = (mensaje: SoporteMensaje) => {
    if (mensaje.cliente_id) {
      const porId = clientes.find((cliente) => cliente.id === mensaje.cliente_id)
      if (porId) return porId
    }

    return clientes.find(
      (cliente) =>
        cliente.correo_asignado.toLowerCase() ===
        mensaje.correo_destino.toLowerCase()
    )
  }

  const marcarLeido = async (mensaje: SoporteMensaje, leido: boolean) => {
    const { error } = await supabase
      .from("soporte_mensajes")
      .update({ leido })
      .eq("id", mensaje.id)

    if (error) {
      setAviso("No se pudo actualizar el mensaje.")
      return
    }

    setMensajes((prev) =>
      prev.map((item) => (item.id === mensaje.id ? { ...item, leido } : item))
    )

    if (mensajeSeleccionado?.id === mensaje.id) {
      setMensajeSeleccionado({ ...mensaje, leido })
    }
  }

  const eliminarMensaje = async (mensaje: SoporteMensaje) => {
    const confirmar = window.confirm(
      `¿Eliminar el mensaje "${mensaje.asunto || "Sin asunto"}"?`
    )

    if (!confirmar) return

    const { error } = await supabase
      .from("soporte_mensajes")
      .delete()
      .eq("id", mensaje.id)

    if (error) {
      setAviso("No se pudo eliminar el mensaje.")
      return
    }

    setMensajes((prev) => prev.filter((item) => item.id !== mensaje.id))

    if (mensajeSeleccionado?.id === mensaje.id) {
      setMensajeSeleccionado(null)
    }
  }

  const mensajesFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()

    return mensajes.filter((mensaje) => {
      const cliente = obtenerCliente(mensaje)

      const texto = [
        cliente?.nombre,
        mensaje.correo_destino,
        mensaje.plataforma,
        mensaje.remitente,
        mensaje.asunto,
        mensaje.cuerpo_texto,
      ]
        .join(" ")
        .toLowerCase()

      const coincideBusqueda = !q || texto.includes(q)

      const coincideLectura =
        filtroLectura === "todos" ||
        (filtroLectura === "leidos" && mensaje.leido) ||
        (filtroLectura === "no_leidos" && !mensaje.leido)

      return coincideBusqueda && coincideLectura
    })
  }, [mensajes, clientes, busqueda, filtroLectura])

  const resumen = useMemo(() => {
    return {
      total: mensajes.length,
      noLeidos: mensajes.filter((mensaje) => !mensaje.leido).length,
      leidos: mensajes.filter((mensaje) => mensaje.leido).length,
      correos: new Set(mensajes.map((mensaje) => mensaje.correo_destino)).size,
    }
  }, [mensajes])

  if (verificando) {
    return (
      <main style={styles.centerPage}>
        <div style={styles.loadingBox}>
          <p style={styles.kicker}>JONAS STREAM</p>
          <h2 style={{ margin: "14px 0 8px" }}>Verificando acceso...</h2>
          <p style={styles.muted}>Validando sesión administrativa.</p>
        </div>
      </main>
    )
  }

  return (
    <main style={styles.page}>
      <section style={styles.container}>
        <header style={styles.header}>
          <div>
            <p style={styles.kicker}>JONAS STREAM · SOPORTE PANEL</p>
            <h1 style={styles.title}>Mensajes recibidos</h1>
            <p style={styles.description}>
              Bandeja interna para revisar correos recibidos por cuentas
              asignadas a clientes.
            </p>
          </div>

          <div style={styles.adminCard}>
            <p style={styles.mutedSmall}>Administrador</p>
            <strong>{usuario?.nombre || "Admin"}</strong>
            <span style={styles.smallText}>{usuario?.correo}</span>

            <button
              type="button"
              onClick={() => router.push("/soporte-panel/dashboard")}
              style={styles.buttonGhost}
            >
              Volver al dashboard
            </button>

            <button
              type="button"
              onClick={cerrarSesion}
              style={styles.buttonDangerFull}
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        <div style={styles.statsGrid}>
          <StatCard label="Total mensajes" value={resumen.total} />
          <StatCard label="No leídos" value={resumen.noLeidos} />
          <StatCard label="Leídos" value={resumen.leidos} />
          <StatCard label="Correos con mensajes" value={resumen.correos} />
        </div>

        <section style={styles.panel}>
          <div style={styles.panelHeader}>
            <div>
              <p style={styles.kicker}>BANDEJA DE SOPORTE</p>
              <h2 style={{ margin: "10px 0" }}>Lista de mensajes</h2>
              <p style={styles.muted}>
                Busca por cliente, correo, remitente, plataforma o asunto.
              </p>
            </div>

            <button
              type="button"
              onClick={cargarDatos}
              style={styles.buttonSecondary}
            >
              {cargando ? "Actualizando..." : "Actualizar"}
            </button>
          </div>

          {aviso && <div style={styles.notice}>{aviso}</div>}

          <div style={styles.filters}>
            <input
              style={styles.input}
              placeholder="Buscar mensaje, cliente, correo, remitente..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />

            <select
              style={styles.input}
              value={filtroLectura}
              onChange={(e) => setFiltroLectura(e.target.value)}
            >
              <option value="todos">Todos</option>
              <option value="no_leidos">No leídos</option>
              <option value="leidos">Leídos</option>
            </select>
          </div>

          {mensajesFiltrados.length === 0 ? (
            <p style={styles.muted}>
              No hay mensajes registrados todavía. Cuando conectemos cPanel,
              aparecerán aquí automáticamente.
            </p>
          ) : (
            <div style={styles.layout}>
              <div style={styles.list}>
                {mensajesFiltrados.map((mensaje) => {
                  const cliente = obtenerCliente(mensaje)
                  const activo = mensajeSeleccionado?.id === mensaje.id

                  return (
                    <button
                      key={mensaje.id}
                      type="button"
                      onClick={() => setMensajeSeleccionado(mensaje)}
                      style={{
                        ...styles.messageItem,
                        borderColor: activo
                          ? "#00FBFF"
                          : "rgba(1, 231, 239, 0.16)",
                        background: activo
                          ? "rgba(1, 231, 239, 0.12)"
                          : "rgba(0,0,0,0.22)",
                      }}
                    >
                      <div style={styles.messageTop}>
                        <strong>{mensaje.asunto || "Sin asunto"}</strong>

                        <span
                          style={{
                            ...styles.badge,
                            borderColor: mensaje.leido ? "#9BC8CB" : "#00FBFF",
                            color: mensaje.leido ? "#9BC8CB" : "#00FBFF",
                          }}
                        >
                          {mensaje.leido ? "Leído" : "Nuevo"}
                        </span>
                      </div>

                      <p style={styles.messageText}>
                        {cliente?.nombre || "Cliente no vinculado"} ·{" "}
                        {mensaje.correo_destino}
                      </p>

                      <span style={styles.smallText}>
                        {mensaje.remitente || "Remitente no disponible"} ·{" "}
                        {new Date(mensaje.fecha_mensaje).toLocaleString("es-PE")}
                      </span>
                    </button>
                  )
                })}
              </div>

              <div style={styles.preview}>
                {!mensajeSeleccionado ? (
                  <div>
                    <p style={styles.kicker}>VISTA DEL MENSAJE</p>
                    <h2>Selecciona un mensaje</h2>
                    <p style={styles.muted}>
                      Aquí verás el asunto, remitente, correo destino y contenido
                      del mensaje.
                    </p>
                  </div>
                ) : (
                  <MensajePreview
                    mensaje={mensajeSeleccionado}
                    cliente={obtenerCliente(mensajeSeleccionado)}
                    onMarcarLeido={marcarLeido}
                    onEliminar={eliminarMensaje}
                  />
                )}
              </div>
            </div>
          )}
        </section>
      </section>
    </main>
  )
}

function MensajePreview({
  mensaje,
  cliente,
  onMarcarLeido,
  onEliminar,
}: {
  mensaje: SoporteMensaje
  cliente?: SoporteCliente
  onMarcarLeido: (mensaje: SoporteMensaje, leido: boolean) => void
  onEliminar: (mensaje: SoporteMensaje) => void
}) {
  const cuerpo =
    mensaje.cuerpo_texto ||
    "Este mensaje no tiene cuerpo en texto. Cuando conectemos cPanel, aquí aparecerá el contenido del correo."

  const links = extraerLinks(cuerpo)

  return (
    <div>
      <p style={styles.kicker}>DETALLE DEL MENSAJE</p>

      <h2 style={{ margin: "10px 0" }}>{mensaje.asunto || "Sin asunto"}</h2>

      <div style={styles.infoGrid}>
        <div>
          <span style={styles.label}>Cliente</span>
          <strong>{cliente?.nombre || "No vinculado"}</strong>
        </div>

        <div>
          <span style={styles.label}>Plataforma</span>
          <strong>
            {mensaje.plataforma || cliente?.plataforma || "No definida"}
          </strong>
        </div>

        <div>
          <span style={styles.label}>Correo destino</span>
          <strong>{mensaje.correo_destino}</strong>
        </div>

        <div>
          <span style={styles.label}>Remitente</span>
          <strong>{mensaje.remitente || "No disponible"}</strong>
        </div>

        <div>
          <span style={styles.label}>Fecha</span>
          <strong>
            {new Date(mensaje.fecha_mensaje).toLocaleString("es-PE")}
          </strong>
        </div>

        <div>
          <span style={styles.label}>Estado</span>
          <strong>{mensaje.leido ? "Leído" : "No leído"}</strong>
        </div>
      </div>

      {links.length > 0 && (
        <div style={styles.linksBox}>
          <span style={styles.label}>Enlaces detectados</span>

          <div style={styles.linksList}>
            {links.map((url) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.linkButton}
              >
                {obtenerNombreLink(url)}
              </a>
            ))}
          </div>
        </div>
      )}

      <div style={styles.bodyBox}>
        <TextoConLinks texto={cuerpo} />
      </div>

      <div style={styles.actions}>
        <button
          type="button"
          onClick={() => onMarcarLeido(mensaje, !mensaje.leido)}
          style={styles.buttonPrimary}
        >
          {mensaje.leido ? "Marcar como no leído" : "Marcar como leído"}
        </button>

        <button
          type="button"
          onClick={() => onEliminar(mensaje)}
          style={styles.buttonDanger}
        >
          Eliminar mensaje
        </button>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div style={styles.statCard}>
      <p style={{ color: "#9BC8CB", margin: 0 }}>{label}</p>
      <strong style={styles.statValue}>{value}</strong>
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
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
  layout: {
    display: "grid",
    gridTemplateColumns: "0.9fr 1.1fr",
    gap: "18px",
    alignItems: "start",
  },
  list: {
    display: "grid",
    gap: "12px",
  },
  messageItem: {
    width: "100%",
    textAlign: "left",
    border: "1px solid rgba(1, 231, 239, 0.16)",
    borderRadius: "18px",
    padding: "16px",
    color: "#ECFFFF",
    cursor: "pointer",
  },
  messageTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
  },
  messageText: {
    color: "#9BC8CB",
    margin: "8px 0 0",
    fontSize: "13px",
  },
  preview: {
    border: "1px solid rgba(1, 231, 239, 0.18)",
    background: "rgba(0, 0, 0, 0.24)",
    borderRadius: "22px",
    padding: "22px",
    minHeight: "420px",
  },
  badge: {
    display: "inline-flex",
    padding: "6px 10px",
    borderRadius: "999px",
    border: "1px solid #00FBFF",
    color: "#00FBFF",
    fontSize: "11px",
    fontWeight: 900,
    textTransform: "uppercase",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "14px",
    marginTop: "20px",
  },
  label: {
    display: "block",
    color: "#9BC8CB",
    fontSize: "12px",
    marginBottom: "5px",
  },
  linksBox: {
    marginTop: "22px",
    border: "1px solid rgba(1, 231, 239, 0.18)",
    background: "rgba(1, 231, 239, 0.06)",
    borderRadius: "18px",
    padding: "16px",
  },
  linksList: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "10px",
  },
  linkButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid rgba(1, 231, 239, 0.45)",
    background: "linear-gradient(135deg, rgba(1, 231, 239, 0.16), rgba(0, 251, 255, 0.08))",
    color: "#00FBFF",
    borderRadius: "14px",
    padding: "11px 14px",
    fontWeight: 950,
    textDecoration: "none",
    boxShadow: "0 0 25px rgba(1, 231, 239, 0.16)",
  },
  linkInline: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "4px 4px",
    border: "1px solid rgba(1, 231, 239, 0.45)",
    background: "rgba(1, 231, 239, 0.10)",
    color: "#00FBFF",
    borderRadius: "12px",
    padding: "7px 11px",
    fontWeight: 900,
    textDecoration: "none",
  },
  bodyBox: {
    marginTop: "22px",
    border: "1px solid rgba(1, 231, 239, 0.14)",
    background: "rgba(0, 0, 0, 0.28)",
    borderRadius: "18px",
    padding: "18px",
    color: "#ECFFFF",
    lineHeight: 1.7,
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
  },
  actions: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginTop: "20px",
  },
  buttonPrimary: {
    border: "none",
    background: "linear-gradient(135deg, #01E7EF, #00FBFF)",
    color: "#000000",
    borderRadius: "15px",
    padding: "13px 16px",
    fontWeight: 950,
    cursor: "pointer",
  },
  buttonSecondary: {
    border: "1px solid rgba(1, 231, 239, 0.25)",
    background: "rgba(1, 231, 239, 0.08)",
    color: "#01E7EF",
    borderRadius: "15px",
    padding: "13px 16px",
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
  buttonDanger: {
    border: "1px solid rgba(255, 67, 67, 0.45)",
    background: "rgba(255, 67, 67, 0.15)",
    color: "#ff8a8a",
    borderRadius: "15px",
    padding: "13px 16px",
    fontWeight: 900,
    cursor: "pointer",
  },
  buttonDangerFull: {
    width: "100%",
    marginTop: "10px",
    border: "1px solid rgba(255, 67, 67, 0.45)",
    background: "rgba(255, 67, 67, 0.15)",
    color: "#ff8a8a",
    borderRadius: "14px",
    padding: "12px",
    fontWeight: 900,
    cursor: "pointer",
  },
}