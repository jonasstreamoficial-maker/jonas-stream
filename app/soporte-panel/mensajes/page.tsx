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

function extraerLinks(texto: string) {
  if (!texto) return []

  const textoNormalizado = texto.replace(/\[(https?:\/\/[^\]]+)\]/gi, "$1")
  const encontrados = textoNormalizado.match(/https?:\/\/[^\s<>"']+/gi) || []

  return Array.from(new Set(encontrados.map((url) => limpiarUrl(url))))
}

function esLinkSecundario(url: string) {
  const lower = url.toLowerCase()

  return (
    lower.includes("help.netflix") ||
    lower.includes("help.netflix.com") ||
    lower.includes("privacy") ||
    lower.includes("privacidad") ||
    lower.includes("terms") ||
    lower.includes("terminos") ||
    lower.includes("términos") ||
    lower.includes("contactus") ||
    lower.includes("contact") ||
    lower.includes("centro") ||
    lower.includes("ayuda") ||
    lower.includes("unsubscribe") ||
    lower.includes("cancel") ||
    lower.includes("support")
  )
}

function obtenerTextoBotonPrincipal(
  url: string,
  texto: string,
  asunto?: string | null,
  plataforma?: string | null
) {
  const base = `${url} ${texto} ${asunto || ""} ${
    plataforma || ""
  }`.toLowerCase()

  if (
    base.includes("crear tu cuenta") ||
    base.includes("crear cuenta") ||
    base.includes("epr?code") ||
    base.includes("signup") ||
    base.includes("register")
  ) {
    return "Crear cuenta"
  }

  if (
    base.includes("olvid") ||
    base.includes("contraseña") ||
    base.includes("password") ||
    base.includes("reset") ||
    base.includes("loginhelp") ||
    base.includes("recover")
  ) {
    return "Restablecer contraseña"
  }

  if (
    base.includes("código") ||
    base.includes("codigo") ||
    base.includes("code=") ||
    base.includes("verificar") ||
    base.includes("verify")
  ) {
    return "Abrir código"
  }

  if (base.includes("netflix")) return "Abrir Netflix"
  if (base.includes("disney")) return "Abrir Disney+"

  if (base.includes("prime") || base.includes("amazon")) {
    return "Abrir Prime Video"
  }

  if (base.includes("crunchyroll") || base.includes("crunchy")) {
    return "Abrir Crunchyroll"
  }

  if (base.includes("youtube")) return "Abrir YouTube"
  if (base.includes("spotify")) return "Abrir Spotify"
  if (base.includes("max.com") || base.includes("hbo")) return "Abrir Max"
  if (base.includes("vix")) return "Abrir Vix"

  return "Abrir enlace principal"
}

function extraerLinkPrincipal(
  texto: string,
  asunto?: string | null,
  plataforma?: string | null
) {
  const links = extraerLinks(texto)

  if (links.length === 0) return null

  const linksUtiles = links.filter((url) => !esLinkSecundario(url))

  const principal =
    linksUtiles.find((url) => {
      const lower = url.toLowerCase()

      return (
        lower.includes("epr?code") ||
        lower.includes("code=") ||
        lower.includes("password") ||
        lower.includes("reset") ||
        lower.includes("loginhelp") ||
        lower.includes("verify") ||
        lower.includes("signup") ||
        lower.includes("register")
      )
    }) ||
    linksUtiles.find((url) => {
      const lower = url.toLowerCase()

      return (
        lower.includes("netflix") ||
        lower.includes("disney") ||
        lower.includes("primevideo") ||
        lower.includes("amazon") ||
        lower.includes("crunchyroll") ||
        lower.includes("youtube") ||
        lower.includes("spotify") ||
        lower.includes("max.com") ||
        lower.includes("vix")
      )
    }) ||
    linksUtiles[0] ||
    links[0]

  return {
    url: principal,
    texto: obtenerTextoBotonPrincipal(principal, texto, asunto, plataforma),
  }
}

function limpiarCuerpoParaVista(texto: string) {
  if (!texto) return ""

  return texto
    .replace(/\[(https?:\/\/[^\]]+)\]/gi, "")
    .replace(/https?:\/\/[^\s<>"']+/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

function extraerCodigo(texto: string, asunto?: string | null) {
  const base = `${asunto || ""}\n${texto || ""}`.replace(/\s+/g, " ").trim()

  const patrones = [
    /c[oó]digo.{0,100}?(\d[\d\s-]{2,12}\d)/i,
    /ingresa.{0,100}?(\d[\d\s-]{2,12}\d)/i,
    /\b(\d(?:[\s-]?\d){3,7})\b/,
  ]

  for (const patron of patrones) {
    const match = base.match(patron)

    if (match?.[1]) {
      const codigo = match[1].replace(/\D/g, "")

      if (codigo.length >= 4 && codigo.length <= 8) {
        return codigo
      }
    }
  }

  return null
}

function formatearFecha(fecha?: string | null) {
  if (!fecha) return "Fecha no disponible"

  return new Date(fecha).toLocaleString("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  })
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
  const [filtroCorreoUrl, setFiltroCorreoUrl] = useState("")
  const [filtroLectura, setFiltroLectura] = useState("todos")
  const [cargando, setCargando] = useState(false)
  const [aviso, setAviso] = useState("")
  const [seleccionInicialHecha, setSeleccionInicialHecha] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const correo = params.get("correo")

    if (correo) {
      const correoLimpio = correo.trim().toLowerCase()
      setBusqueda(correoLimpio)
      setFiltroCorreoUrl(correoLimpio)
    }
  }, [])

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

  const copiarTexto = async (texto: string, mensajeOk: string) => {
    try {
      await navigator.clipboard.writeText(texto)
      setAviso(mensajeOk)
    } catch {
      setAviso("No se pudo copiar automáticamente.")
    }
  }

  const limpiarFiltroCorreo = () => {
    setBusqueda("")
    setFiltroCorreoUrl("")
    setMensajeSeleccionado(null)
    setSeleccionInicialHecha(false)
    window.history.replaceState({}, "", "/soporte-panel/mensajes")
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

  useEffect(() => {
    if (
      !filtroCorreoUrl ||
      seleccionInicialHecha ||
      mensajesFiltrados.length === 0
    ) {
      return
    }

    setMensajeSeleccionado(mensajesFiltrados[0])
    setSeleccionInicialHecha(true)
  }, [filtroCorreoUrl, seleccionInicialHecha, mensajesFiltrados])

  const resumen = useMemo(() => {
    const base = busqueda.trim() ? mensajesFiltrados : mensajes

    return {
      total: base.length,
      noLeidos: base.filter((mensaje) => !mensaje.leido).length,
      leidos: base.filter((mensaje) => mensaje.leido).length,
      correos: new Set(base.map((mensaje) => mensaje.correo_destino)).size,
    }
  }, [mensajes, mensajesFiltrados, busqueda])

  if (verificando) {
    return (
      <main style={styles.centerPage}>
        <div style={styles.loadingBox}>
          <div style={styles.logoMarkSmall}>JS</div>
          <p style={styles.kicker}>JONAS STREAM</p>
          <h2 style={{ margin: "14px 0 8px" }}>Verificando acceso...</h2>
          <p style={styles.muted}>Validando sesión administrativa.</p>
        </div>
      </main>
    )
  }

  return (
    <main style={styles.page}>
      <div style={styles.backgroundGlowOne} />
      <div style={styles.backgroundGlowTwo} />

      <section style={styles.container}>
        <header style={styles.header}>
          <div style={styles.headerText}>
            <div style={styles.brandLine}>
              <div style={styles.logoMark}>JS</div>
              <div>
                <p style={styles.kicker}>JONAS STREAM · SOPORTE PANEL</p>
                <h1 style={styles.title}>Mensajes recibidos</h1>
              </div>
            </div>

            <p style={styles.description}>
              Bandeja interna para revisar correos, códigos y enlaces recibidos
              por las cuentas asignadas.
            </p>
          </div>

          <div style={styles.adminCard}>
            <p style={styles.mutedSmall}>Administrador</p>
            <strong>{usuario?.nombre || "Admin"}</strong>
            <span style={styles.smallText}>{usuario?.correo}</span>

            <div style={styles.adminButtons}>
              <button
                type="button"
                onClick={() => router.push("/soporte-panel/dashboard")}
                style={styles.buttonGhost}
              >
                Dashboard
              </button>

              <button
                type="button"
                onClick={() => window.open("/codigos", "_blank")}
                style={styles.buttonGhost}
              >
                /codigos
              </button>
            </div>

            <button
              type="button"
              onClick={cerrarSesion}
              style={styles.buttonDangerFull}
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        {filtroCorreoUrl && (
          <div style={styles.filterAlert}>
            <div>
              <span style={styles.label}>Filtro activo por correo</span>
              <strong>{filtroCorreoUrl}</strong>
            </div>

            <button
              type="button"
              onClick={limpiarFiltroCorreo}
              style={styles.buttonSecondary}
            >
              Ver todos
            </button>
          </div>
        )}

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
              <h2 style={styles.sectionTitle}>Lista de mensajes</h2>
              <p style={styles.muted}>
                Busca por cliente, correo, remitente, plataforma o asunto.
              </p>
            </div>

            <button
              type="button"
              onClick={cargarDatos}
              style={styles.buttonPrimary}
            >
              {cargando ? "Actualizando..." : "Actualizar bandeja"}
            </button>
          </div>

          {aviso && <div style={styles.notice}>{aviso}</div>}

          <div style={styles.filters}>
            <input
              style={styles.input}
              placeholder="Buscar mensaje, cliente, correo, remitente..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value)
                setFiltroCorreoUrl("")
                setSeleccionInicialHecha(false)
              }}
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
            <div style={styles.emptyState}>
              <strong>No hay mensajes para este filtro.</strong>
              <p>Verifica que el correo tenga mensajes recibidos.</p>
            </div>
          ) : (
            <div style={styles.layout}>
              <div style={styles.list}>
                {mensajesFiltrados.map((mensaje) => {
                  const cliente = obtenerCliente(mensaje)
                  const activo = mensajeSeleccionado?.id === mensaje.id
                  const codigo = extraerCodigo(
                    mensaje.cuerpo_texto || "",
                    mensaje.asunto
                  )

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
                          : "rgba(0,0,0,0.24)",
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
                        {formatearFecha(mensaje.fecha_mensaje)}
                      </span>

                      {codigo && <span style={styles.codePreview}>Código: {codigo}</span>}
                    </button>
                  )
                })}
              </div>

              <div style={styles.preview}>
                {!mensajeSeleccionado ? (
                  <div style={styles.previewEmpty}>
                    <p style={styles.kicker}>VISTA DEL MENSAJE</p>
                    <h2>Selecciona un mensaje</h2>
                    <p style={styles.muted}>
                      Aquí verás el asunto, remitente, correo destino, códigos
                      detectados y contenido del correo.
                    </p>
                  </div>
                ) : (
                  <MensajePreview
                    mensaje={mensajeSeleccionado}
                    cliente={obtenerCliente(mensajeSeleccionado)}
                    onMarcarLeido={marcarLeido}
                    onEliminar={eliminarMensaje}
                    onCopiar={copiarTexto}
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
  onCopiar,
}: {
  mensaje: SoporteMensaje
  cliente?: SoporteCliente
  onMarcarLeido: (mensaje: SoporteMensaje, leido: boolean) => void
  onEliminar: (mensaje: SoporteMensaje) => void
  onCopiar: (texto: string, mensajeOk: string) => void
}) {
  const cuerpo =
    mensaje.cuerpo_texto ||
    "Este mensaje no tiene cuerpo en texto. Aquí aparecerá el contenido del correo."

  const linkPrincipal = extraerLinkPrincipal(
    cuerpo,
    mensaje.asunto,
    mensaje.plataforma || cliente?.plataforma
  )

  const codigo = extraerCodigo(cuerpo, mensaje.asunto)
  const cuerpoLimpio = limpiarCuerpoParaVista(cuerpo)

  return (
    <div>
      <div style={styles.previewHeader}>
        <div>
          <p style={styles.kicker}>DETALLE DEL MENSAJE</p>
          <h2 style={styles.previewTitle}>{mensaje.asunto || "Sin asunto"}</h2>
        </div>

        <span
          style={{
            ...styles.badgeLarge,
            borderColor: mensaje.leido ? "#9BC8CB" : "#00FBFF",
            color: mensaje.leido ? "#9BC8CB" : "#00FBFF",
          }}
        >
          {mensaje.leido ? "Leído" : "Nuevo"}
        </span>
      </div>

      {codigo && (
        <div style={styles.codeBox}>
          <span>Código detectado</span>
          <button
            type="button"
            onClick={() => onCopiar(codigo, "Código copiado correctamente.")}
            style={styles.codeButton}
          >
            {codigo}
          </button>
        </div>
      )}

      <div style={styles.infoGrid}>
        <InfoItem label="Cliente" value={cliente?.nombre || "No vinculado"} />
        <InfoItem
          label="Plataforma"
          value={mensaje.plataforma || cliente?.plataforma || "No definida"}
        />
        <InfoItem label="Correo destino" value={mensaje.correo_destino} />
        <InfoItem label="Remitente" value={mensaje.remitente || "No disponible"} />
        <InfoItem label="Fecha" value={formatearFecha(mensaje.fecha_mensaje)} />
        <InfoItem label="Estado" value={mensaje.leido ? "Leído" : "No leído"} />
      </div>

      {linkPrincipal && (
        <div style={styles.linksBox}>
          <span style={styles.label}>Acción principal</span>

          <div style={styles.linksList}>
            <a
              href={linkPrincipal.url}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.linkButton}
            >
              {linkPrincipal.texto}
            </a>

            <button
              type="button"
              onClick={() =>
                onCopiar(linkPrincipal.url, "Enlace copiado correctamente.")
              }
              style={styles.secondaryButton}
            >
              Copiar enlace
            </button>
          </div>
        </div>
      )}

      <div style={styles.bodyBox}>{cuerpoLimpio}</div>

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

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.infoItem}>
      <span style={styles.label}>{label}</span>
      <strong>{value}</strong>
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
    position: "relative",
    overflowX: "hidden",
    background:
      "linear-gradient(135deg, #000000 0%, #031316 48%, #071B1E 100%)",
    color: "#ECFFFF",
    padding: "clamp(14px, 3vw, 40px)",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
  },
  backgroundGlowOne: {
    position: "fixed",
    width: "540px",
    height: "540px",
    borderRadius: "999px",
    background: "rgba(1, 231, 239, 0.13)",
    filter: "blur(100px)",
    top: "-180px",
    left: "-150px",
    pointerEvents: "none",
  },
  backgroundGlowTwo: {
    position: "fixed",
    width: "640px",
    height: "640px",
    borderRadius: "999px",
    background: "rgba(0, 251, 255, 0.10)",
    filter: "blur(120px)",
    right: "-220px",
    bottom: "-220px",
    pointerEvents: "none",
  },
  centerPage: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #000000 0%, #031316 48%, #071B1E 100%)",
    color: "#ECFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
    padding: "20px",
  },
  loadingBox: {
    border: "1px solid rgba(1, 231, 239, 0.18)",
    background: "rgba(3, 19, 22, 0.82)",
    borderRadius: "24px",
    padding: "28px",
    boxShadow: "0 0 40px rgba(0, 251, 255, 0.22)",
    textAlign: "center",
    width: "min(100%, 420px)",
  },
  logoMark: {
    width: "54px",
    height: "54px",
    borderRadius: "18px",
    display: "grid",
    placeItems: "center",
    background:
      "linear-gradient(135deg, rgba(1, 231, 239, 1), rgba(0, 251, 255, 0.48))",
    color: "#000000",
    fontWeight: 1000,
    boxShadow: "0 0 30px rgba(0, 251, 255, 0.22)",
    flex: "0 0 auto",
  },
  logoMarkSmall: {
    width: "58px",
    height: "58px",
    borderRadius: "19px",
    display: "grid",
    placeItems: "center",
    background:
      "linear-gradient(135deg, rgba(1, 231, 239, 1), rgba(0, 251, 255, 0.48))",
    color: "#000000",
    fontWeight: 1000,
    margin: "0 auto 18px",
  },
  container: {
    position: "relative",
    zIndex: 1,
    maxWidth: "1320px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    alignItems: "stretch",
    flexWrap: "wrap",
    marginBottom: "28px",
  },
  headerText: {
    flex: "1 1 560px",
  },
  brandLine: {
    display: "flex",
    gap: "16px",
    alignItems: "center",
    marginBottom: "14px",
  },
  kicker: {
    color: "#01E7EF",
    letterSpacing: "0.16em",
    fontWeight: 950,
    fontSize: "12px",
    margin: 0,
    textTransform: "uppercase",
  },
  title: {
    fontSize: "clamp(34px, 5vw, 56px)",
    margin: "8px 0 0",
    lineHeight: 0.98,
    letterSpacing: "-0.045em",
  },
  description: {
    color: "#9BC8CB",
    maxWidth: "760px",
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
    marginTop: "6px",
    overflowWrap: "anywhere",
  },
  adminCard: {
    border: "1px solid rgba(1, 231, 239, 0.18)",
    background: "rgba(3, 19, 22, 0.82)",
    borderRadius: "22px",
    padding: "16px",
    minWidth: "min(100%, 280px)",
    boxShadow: "0 0 25px rgba(1, 231, 239, 0.18)",
    flex: "0 1 320px",
  },
  adminButtons: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    marginTop: "14px",
  },
  filterAlert: {
    border: "1px solid rgba(1, 231, 239, 0.25)",
    background: "rgba(1, 231, 239, 0.08)",
    borderRadius: "18px",
    padding: "16px",
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: "20px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "14px",
    marginTop: "22px",
  },
  statCard: {
    border: "1px solid rgba(1, 231, 239, 0.18)",
    background: "rgba(3, 19, 22, 0.82)",
    borderRadius: "22px",
    padding: "20px",
    boxShadow: "0 0 25px rgba(1, 231, 239, 0.14)",
  },
  statValue: {
    display: "block",
    color: "#01E7EF",
    fontSize: "clamp(30px, 4vw, 42px)",
    marginTop: "10px",
  },
  panel: {
    marginTop: "24px",
    border: "1px solid rgba(1, 231, 239, 0.18)",
    background: "rgba(3, 19, 22, 0.82)",
    borderRadius: "26px",
    padding: "clamp(16px, 3vw, 24px)",
    boxShadow: "0 0 30px rgba(1, 231, 239, 0.16)",
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: "22px",
  },
  sectionTitle: {
    margin: "8px 0",
    fontSize: "clamp(22px, 3vw, 30px)",
    letterSpacing: "-0.03em",
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
    gridTemplateColumns: "minmax(0, 1fr) minmax(160px, 240px)",
    gap: "14px",
    marginBottom: "20px",
  },
  input: {
    width: "100%",
    border: "1px solid rgba(1, 231, 239, 0.20)",
    outline: "none",
    borderRadius: "16px",
    padding: "14px 15px",
    background: "rgba(0, 0, 0, 0.36)",
    color: "#ECFFFF",
    fontSize: "14px",
    minWidth: 0,
  },
  emptyState: {
    border: "1px dashed rgba(1, 231, 239, 0.22)",
    background: "rgba(0, 0, 0, 0.20)",
    borderRadius: "20px",
    padding: "22px",
    color: "#9BC8CB",
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 370px), 1fr))",
    gap: "18px",
    alignItems: "start",
  },
  list: {
    display: "grid",
    gap: "12px",
    maxHeight: "72vh",
    overflowY: "auto",
    paddingRight: "4px",
  },
  messageItem: {
    width: "100%",
    textAlign: "left",
    border: "1px solid rgba(1, 231, 239, 0.16)",
    borderRadius: "20px",
    padding: "16px",
    color: "#ECFFFF",
    cursor: "pointer",
    transition: "0.2s ease",
  },
  messageTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "start",
  },
  messageText: {
    color: "#9BC8CB",
    margin: "8px 0 0",
    fontSize: "13px",
    overflowWrap: "anywhere",
  },
  codePreview: {
    display: "inline-flex",
    marginTop: "10px",
    border: "1px solid rgba(0, 251, 255, 0.28)",
    background: "rgba(0, 251, 255, 0.08)",
    color: "#00FBFF",
    borderRadius: "999px",
    padding: "7px 10px",
    fontSize: "12px",
    fontWeight: 950,
    letterSpacing: "0.08em",
  },
  preview: {
    border: "1px solid rgba(1, 231, 239, 0.18)",
    background: "rgba(0, 0, 0, 0.26)",
    borderRadius: "24px",
    padding: "clamp(16px, 3vw, 22px)",
    minHeight: "420px",
    overflowWrap: "anywhere",
  },
  previewEmpty: {
    minHeight: "340px",
    display: "grid",
    alignContent: "center",
  },
  previewHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    alignItems: "start",
    flexWrap: "wrap",
  },
  previewTitle: {
    margin: "8px 0 0",
    fontSize: "clamp(22px, 3vw, 30px)",
    letterSpacing: "-0.03em",
  },
  badge: {
    display: "inline-flex",
    padding: "6px 10px",
    borderRadius: "999px",
    border: "1px solid #00FBFF",
    color: "#00FBFF",
    fontSize: "11px",
    fontWeight: 950,
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  },
  badgeLarge: {
    display: "inline-flex",
    padding: "8px 12px",
    borderRadius: "999px",
    border: "1px solid #00FBFF",
    color: "#00FBFF",
    fontSize: "12px",
    fontWeight: 950,
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  },
  codeBox: {
    marginTop: "18px",
    border: "1px solid rgba(0, 251, 255, 0.26)",
    background: "rgba(0, 251, 255, 0.08)",
    borderRadius: "20px",
    padding: "16px",
    display: "flex",
    justifyContent: "space-between",
    gap: "14px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  codeButton: {
    border: "1px solid rgba(1, 231, 239, 0.45)",
    background: "rgba(1, 231, 239, 0.13)",
    color: "#00FBFF",
    borderRadius: "16px",
    padding: "12px 16px",
    fontSize: "clamp(22px, 4vw, 32px)",
    fontWeight: 1000,
    letterSpacing: "0.18em",
    cursor: "pointer",
    boxShadow: "0 0 26px rgba(0, 251, 255, 0.12)",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 190px), 1fr))",
    gap: "12px",
    marginTop: "18px",
  },
  infoItem: {
    border: "1px solid rgba(1, 231, 239, 0.12)",
    background: "rgba(0, 0, 0, 0.24)",
    borderRadius: "16px",
    padding: "14px",
    overflowWrap: "anywhere",
  },
  label: {
    display: "block",
    color: "#9BC8CB",
    fontSize: "12px",
    marginBottom: "5px",
  },
  linksBox: {
    marginTop: "18px",
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
    background:
      "linear-gradient(135deg, rgba(1, 231, 239, 0.16), rgba(0, 251, 255, 0.08))",
    color: "#00FBFF",
    borderRadius: "14px",
    padding: "11px 14px",
    fontWeight: 950,
    textDecoration: "none",
    boxShadow: "0 0 25px rgba(1, 231, 239, 0.16)",
  },
  bodyBox: {
    marginTop: "18px",
    border: "1px solid rgba(1, 231, 239, 0.14)",
    background: "rgba(0, 0, 0, 0.28)",
    borderRadius: "18px",
    padding: "16px",
    color: "#ECFFFF",
    lineHeight: 1.7,
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
    maxHeight: "420px",
    overflowY: "auto",
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
  secondaryButton: {
    border: "1px solid rgba(155, 200, 203, 0.22)",
    background: "rgba(155, 200, 203, 0.08)",
    color: "#ECFFFF",
    borderRadius: "14px",
    padding: "11px 14px",
    fontWeight: 900,
    cursor: "pointer",
  },
  buttonGhost: {
    width: "100%",
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
