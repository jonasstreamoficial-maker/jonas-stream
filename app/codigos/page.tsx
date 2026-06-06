"use client"

import { useMemo, useState } from "react"
import type { CSSProperties, FormEvent } from "react"

type ClienteConsulta = {
  id: string
  nombre: string
  plataforma: string | null
  correo_asignado: string
  estado: string
  fecha_inicio: string | null
  fecha_vencimiento: string | null
}

type MensajeConsulta = {
  id: string
  correo_destino: string
  plataforma: string | null
  remitente: string | null
  asunto: string | null
  cuerpo_texto: string | null
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
    lower.includes("help") ||
    lower.includes("privacy") ||
    lower.includes("privacidad") ||
    lower.includes("terms") ||
    lower.includes("terminos") ||
    lower.includes("términos") ||
    lower.includes("contact") ||
    lower.includes("ayuda") ||
    lower.includes("support") ||
    lower.includes("unsubscribe")
  )
}

function extraerLinkPrincipal(texto: string) {
  const links = extraerLinks(texto)

  if (links.length === 0) return null

  const utiles = links.filter((url) => !esLinkSecundario(url))

  return (
    utiles.find((url) => {
      const lower = url.toLowerCase()

      return (
        lower.includes("code=") ||
        lower.includes("epr?code") ||
        lower.includes("password") ||
        lower.includes("reset") ||
        lower.includes("loginhelp") ||
        lower.includes("verify") ||
        lower.includes("signup") ||
        lower.includes("register")
      )
    }) ||
    utiles[0] ||
    links[0]
  )
}

function obtenerTextoAccion(texto: string, asunto?: string | null) {
  const base = `${texto} ${asunto || ""}`.toLowerCase()

  if (
    base.includes("crear cuenta") ||
    base.includes("crear tu cuenta") ||
    base.includes("epr?code") ||
    base.includes("signup") ||
    base.includes("register")
  ) {
    return "Crear cuenta"
  }

  if (
    base.includes("contraseña") ||
    base.includes("password") ||
    base.includes("reset") ||
    base.includes("olvid")
  ) {
    return "Restablecer contraseña"
  }

  if (
    base.includes("código") ||
    base.includes("codigo") ||
    base.includes("inicio de sesión") ||
    base.includes("iniciar sesión")
  ) {
    return "Ver código"
  }

  return "Abrir enlace"
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

function limpiarCuerpo(texto: string) {
  if (!texto) return ""

  let limpio = texto
    .replace(/\[(https?:\/\/[^\]]+)\]/gi, "")
    .replace(/https?:\/\/[^\s<>"']+/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()

  const cortes = [
    "¿Preguntas?",
    "Términos de uso",
    "Privacidad",
    "Centro de ayuda",
    "Netflix envió",
    "SRC:",
  ]

  for (const corte of cortes) {
    const index = limpio.toLowerCase().indexOf(corte.toLowerCase())

    if (index !== -1) {
      limpio = limpio.slice(0, index).trim()
    }
  }

  return limpio
}

function formatearFecha(fecha: string) {
  return new Date(fecha).toLocaleString("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

function calcularDiasRestantes(fecha?: string | null) {
  if (!fecha) return null

  const hoy = new Date()
  const vencimiento = new Date(`${fecha}T00:00:00`)

  hoy.setHours(0, 0, 0, 0)
  vencimiento.setHours(0, 0, 0, 0)

  return Math.ceil(
    (vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
  )
}

function estadoVisual(estado: string) {
  const normalizado = estado.toLowerCase()

  if (normalizado === "activo") {
    return {
      texto: "Activo",
      color: "#00FBFF",
      fondo: "rgba(0, 251, 255, 0.10)",
    }
  }

  if (normalizado === "vencido") {
    return {
      texto: "Vencido",
      color: "#ff6b6b",
      fondo: "rgba(255, 107, 107, 0.12)",
    }
  }

  if (normalizado === "suspendido") {
    return {
      texto: "Suspendido",
      color: "#ffd166",
      fondo: "rgba(255, 209, 102, 0.12)",
    }
  }

  return {
    texto: estado || "Sin estado",
    color: "#9BC8CB",
    fondo: "rgba(155, 200, 203, 0.10)",
  }
}

export default function CodigosPage() {
  const [correo, setCorreo] = useState("")
  const [pin, setPin] = useState("")
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState("")
  const [aviso, setAviso] = useState("")
  const [cliente, setCliente] = useState<ClienteConsulta | null>(null)
  const [mensajes, setMensajes] = useState<MensajeConsulta[]>([])

  const ultimoMensaje = useMemo(() => mensajes[0] || null, [mensajes])
  const estado = cliente ? estadoVisual(cliente.estado) : null
  const diasRestantes = calcularDiasRestantes(cliente?.fecha_vencimiento)

  const consultar = async (e: FormEvent) => {
    e.preventDefault()

    setCargando(true)
    setError("")
    setAviso("")
    setCliente(null)
    setMensajes([])

    try {
      const res = await fetch("/api/codigos/consultar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          correo: correo.trim().toLowerCase(),
          pin: pin.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.ok) {
        setError(data.error || "No se pudo consultar la cuenta.")
        return
      }

      setCliente(data.cliente)
      setMensajes(data.mensajes || [])
    } catch {
      setError("Error de conexión. Intenta nuevamente.")
    } finally {
      setCargando(false)
    }
  }

  const copiarCodigo = async (codigo: string) => {
    try {
      await navigator.clipboard.writeText(codigo)
      setAviso("Código copiado correctamente.")
    } catch {
      setAviso("No se pudo copiar. Selecciona el código manualmente.")
    }
  }

  return (
    <main style={styles.page}>
      <div style={styles.backgroundGlowOne} />
      <div style={styles.backgroundGlowTwo} />

      <section style={styles.shell}>
        <aside style={styles.sidePanel}>
          <div style={styles.logoMark}>JS</div>

          <p style={styles.kicker}>JONAS STREAM</p>

          <h1 style={styles.heroTitle}>Centro de códigos</h1>

          <p style={styles.heroText}>
            Consulta rápida y segura de códigos, enlaces de acceso y mensajes de
            verificación de tus plataformas.
          </p>

          <div style={styles.stepsBox}>
            <div style={styles.stepItem}>
              <span style={styles.stepNumber}>1</span>
              <div>
                <strong>Ingresa tu correo asignado</strong>
                <p>Usa el correo entregado por soporte.</p>
              </div>
            </div>

            <div style={styles.stepItem}>
              <span style={styles.stepNumber}>2</span>
              <div>
                <strong>Coloca tu PIN de acceso</strong>
                <p>El PIN valida que la cuenta te corresponde.</p>
              </div>
            </div>

            <div style={styles.stepItem}>
              <span style={styles.stepNumber}>3</span>
              <div>
                <strong>Revisa códigos recientes</strong>
                <p>Los mensajes nuevos aparecerán automáticamente.</p>
              </div>
            </div>
          </div>

          <div style={styles.securityBox}>
            <strong>Consulta segura</strong>
            <span>No compartas tu PIN con terceros.</span>
          </div>
        </aside>

        <section style={styles.mainPanel}>
          <div style={styles.topBar}>
            <div>
              <p style={styles.kicker}>ACCESO DE CLIENTE</p>
              <h2 style={styles.sectionTitle}>Consulta de códigos</h2>
            </div>

            <span style={styles.liveBadge}>Servicio activo</span>
          </div>

          <form onSubmit={consultar} style={styles.form}>
            <label style={styles.field}>
              <span>Correo asignado</span>
              <input
                style={styles.input}
                placeholder="ejemplo001@jonasstream.xyz"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                autoComplete="email"
                autoCapitalize="none"
                required
              />
            </label>

            <label style={styles.field}>
              <span>PIN de acceso</span>
              <input
                style={styles.input}
                placeholder="Ingresa tu PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                type="password"
                autoComplete="current-password"
                required
              />
            </label>

            <button type="submit" style={styles.button} disabled={cargando}>
              {cargando ? "Consultando..." : "Consultar códigos"}
            </button>
          </form>

          {error && <div style={styles.error}>{error}</div>}
          {aviso && <div style={styles.notice}>{aviso}</div>}

          {!cliente && (
            <div style={styles.emptyState}>
              <h3>Esperando consulta</h3>
              <p>
                Ingresa tu correo y PIN para mostrar la cuenta asignada, códigos
                recientes y enlaces disponibles.
              </p>
            </div>
          )}

          {cliente && (
            <section style={styles.accountBox}>
              <div style={styles.accountTop}>
                <div>
                  <p style={styles.kicker}>CUENTA ASIGNADA</p>
                  <h3 style={styles.accountTitle}>{cliente.plataforma}</h3>
                </div>

                {estado && (
                  <span
                    style={{
                      ...styles.statusBadge,
                      color: estado.color,
                      borderColor: estado.color,
                      background: estado.fondo,
                    }}
                  >
                    {estado.texto}
                  </span>
                )}
              </div>

              <div style={styles.accountGrid}>
                <InfoItem label="Cliente" value={cliente.nombre} />
                <InfoItem label="Correo" value={cliente.correo_asignado} />
                <InfoItem
                  label="Vencimiento"
                  value={
                    cliente.fecha_vencimiento
                      ? new Date(
                          cliente.fecha_vencimiento
                        ).toLocaleDateString("es-PE")
                      : "No definido"
                  }
                />
                <InfoItem
                  label="Días restantes"
                  value={
                    diasRestantes === null
                      ? "No definido"
                      : diasRestantes >= 0
                      ? `${diasRestantes} día(s)`
                      : `Vencido hace ${Math.abs(diasRestantes)} día(s)`
                  }
                />
              </div>
            </section>
          )}

          {cliente && ultimoMensaje && (
            <section style={styles.highlightBox}>
              <div>
                <p style={styles.kicker}>ÚLTIMO MENSAJE</p>
                <h3 style={styles.highlightTitle}>
                  {ultimoMensaje.asunto || "Sin asunto"}
                </h3>
                <p style={styles.muted}>
                  {formatearFecha(ultimoMensaje.fecha_mensaje)}
                </p>
              </div>

              {extraerCodigo(
                ultimoMensaje.cuerpo_texto || "",
                ultimoMensaje.asunto
              ) && (
                <button
                  type="button"
                  style={styles.copyCodeButton}
                  onClick={() =>
                    copiarCodigo(
                      extraerCodigo(
                        ultimoMensaje.cuerpo_texto || "",
                        ultimoMensaje.asunto
                      ) || ""
                    )
                  }
                >
                  Copiar código
                </button>
              )}
            </section>
          )}

          {cliente && (
            <section style={styles.messagesBox}>
              <div style={styles.messagesHeader}>
                <div>
                  <p style={styles.kicker}>MENSAJES RECIENTES</p>
                  <h3 style={styles.messagesTitle}>
                    {mensajes.length} mensaje(s) encontrado(s)
                  </h3>
                </div>
              </div>

              {mensajes.length === 0 ? (
                <div style={styles.emptyMessages}>
                  <strong>No hay mensajes todavía</strong>
                  <p>
                    Cuando llegue un código, enlace o aviso para este correo,
                    aparecerá aquí.
                  </p>
                </div>
              ) : (
                <div style={styles.messagesList}>
                  {mensajes.map((mensaje) => {
                    const cuerpo = mensaje.cuerpo_texto || ""
                    const codigo = extraerCodigo(cuerpo, mensaje.asunto)
                    const link = extraerLinkPrincipal(cuerpo)
                    const cuerpoLimpio = limpiarCuerpo(cuerpo)
                    const textoAccion = obtenerTextoAccion(
                      cuerpo,
                      mensaje.asunto
                    )

                    return (
                      <article key={mensaje.id} style={styles.messageCard}>
                        <div style={styles.messageHeader}>
                          <div>
                            <h3 style={styles.messageTitle}>
                              {mensaje.asunto || "Sin asunto"}
                            </h3>

                            <p style={styles.dateText}>
                              {formatearFecha(mensaje.fecha_mensaje)}
                            </p>

                            <p style={styles.remitenteText}>
                              {mensaje.remitente ||
                                "Remitente no disponible"}
                            </p>
                          </div>

                          {codigo && (
                            <button
                              type="button"
                              style={styles.codeBox}
                              onClick={() => copiarCodigo(codigo)}
                              title="Copiar código"
                            >
                              {codigo}
                            </button>
                          )}
                        </div>

                        <div style={styles.messageActions}>
                          {link && (
                            <a
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={styles.actionButton}
                            >
                              {textoAccion}
                            </a>
                          )}

                          {codigo && (
                            <button
                              type="button"
                              style={styles.secondaryButton}
                              onClick={() => copiarCodigo(codigo)}
                            >
                              Copiar código
                            </button>
                          )}
                        </div>

                        <div style={styles.bodyBox}>
                          {cuerpoLimpio ||
                            "Mensaje recibido sin contenido visible."}
                        </div>
                      </article>
                    )
                  })}
                </div>
              )}
            </section>
          )}
        </section>
      </section>
    </main>
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

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    position: "relative",
    overflow: "hidden",
    background:
      "linear-gradient(135deg, #000000 0%, #031316 48%, #071B1E 100%)",
    color: "#ECFFFF",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
    padding: "34px",
  },
  backgroundGlowOne: {
    position: "fixed",
    width: "520px",
    height: "520px",
    borderRadius: "999px",
    background: "rgba(1, 231, 239, 0.13)",
    filter: "blur(90px)",
    top: "-160px",
    left: "-120px",
    pointerEvents: "none",
  },
  backgroundGlowTwo: {
    position: "fixed",
    width: "620px",
    height: "620px",
    borderRadius: "999px",
    background: "rgba(0, 251, 255, 0.10)",
    filter: "blur(110px)",
    right: "-180px",
    bottom: "-200px",
    pointerEvents: "none",
  },
  shell: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    maxWidth: "1180px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "380px minmax(0, 1fr)",
    gap: "22px",
    alignItems: "start",
  },
  sidePanel: {
    minHeight: "calc(100vh - 68px)",
    border: "1px solid rgba(1, 231, 239, 0.18)",
    background:
      "linear-gradient(180deg, rgba(3, 19, 22, 0.88), rgba(0, 0, 0, 0.58))",
    borderRadius: "30px",
    padding: "28px",
    boxShadow: "0 0 40px rgba(0, 251, 255, 0.14)",
  },
  mainPanel: {
    border: "1px solid rgba(1, 231, 239, 0.18)",
    background: "rgba(3, 19, 22, 0.86)",
    borderRadius: "30px",
    padding: "28px",
    boxShadow: "0 0 40px rgba(0, 251, 255, 0.18)",
  },
  logoMark: {
    width: "62px",
    height: "62px",
    borderRadius: "20px",
    display: "grid",
    placeItems: "center",
    background:
      "linear-gradient(135deg, rgba(1, 231, 239, 1), rgba(0, 251, 255, 0.48))",
    color: "#000000",
    fontWeight: 1000,
    fontSize: "20px",
    boxShadow: "0 0 30px rgba(0, 251, 255, 0.22)",
    marginBottom: "24px",
  },
  kicker: {
    color: "#01E7EF",
    letterSpacing: "0.18em",
    fontWeight: 950,
    fontSize: "12px",
    margin: "0 0 8px",
    textTransform: "uppercase",
  },
  heroTitle: {
    margin: "0 0 14px",
    fontSize: "46px",
    lineHeight: 1,
    letterSpacing: "-0.04em",
  },
  heroText: {
    margin: 0,
    color: "#9BC8CB",
    lineHeight: 1.7,
    fontSize: "15px",
  },
  stepsBox: {
    display: "grid",
    gap: "14px",
    marginTop: "28px",
  },
  stepItem: {
    display: "grid",
    gridTemplateColumns: "42px 1fr",
    gap: "12px",
    alignItems: "start",
    border: "1px solid rgba(1, 231, 239, 0.14)",
    background: "rgba(1, 231, 239, 0.05)",
    borderRadius: "18px",
    padding: "14px",
  },
  stepNumber: {
    width: "34px",
    height: "34px",
    borderRadius: "12px",
    display: "grid",
    placeItems: "center",
    background: "rgba(0, 251, 255, 0.12)",
    color: "#00FBFF",
    fontWeight: 950,
    border: "1px solid rgba(0, 251, 255, 0.28)",
  },
  securityBox: {
    marginTop: "24px",
    border: "1px solid rgba(1, 231, 239, 0.18)",
    background: "rgba(0, 0, 0, 0.26)",
    borderRadius: "18px",
    padding: "16px",
    display: "grid",
    gap: "6px",
    color: "#9BC8CB",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    alignItems: "center",
    marginBottom: "22px",
  },
  sectionTitle: {
    margin: 0,
    fontSize: "36px",
    letterSpacing: "-0.035em",
  },
  liveBadge: {
    border: "1px solid rgba(0, 251, 255, 0.35)",
    background: "rgba(0, 251, 255, 0.09)",
    color: "#00FBFF",
    borderRadius: "999px",
    padding: "9px 12px",
    fontSize: "12px",
    fontWeight: 950,
    whiteSpace: "nowrap",
  },
  form: {
    display: "grid",
    gridTemplateColumns: "1fr 0.75fr",
    gap: "14px",
    alignItems: "end",
  },
  field: {
    display: "grid",
    gap: "8px",
    color: "#9BC8CB",
    fontSize: "13px",
    fontWeight: 800,
  },
  input: {
    width: "100%",
    border: "1px solid rgba(1, 231, 239, 0.24)",
    outline: "none",
    borderRadius: "17px",
    padding: "16px",
    background: "rgba(0, 0, 0, 0.38)",
    color: "#ECFFFF",
    fontSize: "15px",
    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.015)",
  },
  button: {
    gridColumn: "1 / -1",
    border: "none",
    background:
      "linear-gradient(135deg, #01E7EF 0%, #00FBFF 55%, #9BFFFF 100%)",
    color: "#000000",
    borderRadius: "18px",
    padding: "16px",
    fontWeight: 1000,
    cursor: "pointer",
    fontSize: "15px",
    boxShadow: "0 0 30px rgba(0, 251, 255, 0.18)",
  },
  error: {
    marginTop: "16px",
    border: "1px solid rgba(255, 67, 67, 0.45)",
    background: "rgba(255, 67, 67, 0.14)",
    color: "#ff9b9b",
    borderRadius: "16px",
    padding: "14px",
    fontWeight: 850,
  },
  notice: {
    marginTop: "16px",
    border: "1px solid rgba(0, 251, 255, 0.35)",
    background: "rgba(0, 251, 255, 0.09)",
    color: "#00FBFF",
    borderRadius: "16px",
    padding: "14px",
    fontWeight: 850,
  },
  emptyState: {
    marginTop: "24px",
    minHeight: "240px",
    border: "1px dashed rgba(1, 231, 239, 0.22)",
    background: "rgba(0, 0, 0, 0.18)",
    borderRadius: "24px",
    padding: "24px",
    display: "grid",
    alignContent: "center",
    textAlign: "center",
    color: "#9BC8CB",
  },
  accountBox: {
    marginTop: "24px",
    border: "1px solid rgba(1, 231, 239, 0.18)",
    background:
      "linear-gradient(135deg, rgba(1, 231, 239, 0.08), rgba(0, 0, 0, 0.22))",
    borderRadius: "22px",
    padding: "20px",
  },
  accountTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
    marginBottom: "18px",
  },
  accountTitle: {
    margin: 0,
    fontSize: "26px",
  },
  statusBadge: {
    border: "1px solid",
    borderRadius: "999px",
    padding: "8px 12px",
    fontWeight: 950,
    fontSize: "12px",
    textTransform: "uppercase",
  },
  accountGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "12px",
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
  highlightBox: {
    marginTop: "18px",
    border: "1px solid rgba(0, 251, 255, 0.24)",
    background: "rgba(0, 251, 255, 0.07)",
    borderRadius: "22px",
    padding: "18px",
    display: "flex",
    justifyContent: "space-between",
    gap: "14px",
    alignItems: "center",
  },
  highlightTitle: {
    margin: "0 0 6px",
    fontSize: "20px",
  },
  copyCodeButton: {
    border: "1px solid rgba(0, 251, 255, 0.35)",
    background: "rgba(0, 251, 255, 0.14)",
    color: "#00FBFF",
    borderRadius: "14px",
    padding: "12px 14px",
    fontWeight: 950,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  messagesBox: {
    marginTop: "24px",
  },
  messagesHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "14px",
    alignItems: "center",
    marginBottom: "14px",
  },
  messagesTitle: {
    margin: 0,
    fontSize: "22px",
  },
  emptyMessages: {
    border: "1px dashed rgba(1, 231, 239, 0.22)",
    background: "rgba(0, 0, 0, 0.18)",
    borderRadius: "20px",
    padding: "20px",
    color: "#9BC8CB",
  },
  messagesList: {
    display: "grid",
    gap: "14px",
  },
  messageCard: {
    border: "1px solid rgba(1, 231, 239, 0.18)",
    background: "rgba(0, 0, 0, 0.28)",
    borderRadius: "22px",
    padding: "18px",
  },
  messageHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    alignItems: "center",
  },
  messageTitle: {
    margin: 0,
    fontSize: "18px",
    letterSpacing: "-0.02em",
  },
  dateText: {
    margin: "6px 0 0",
    color: "#9BC8CB",
    fontSize: "12px",
  },
  remitenteText: {
    margin: "6px 0 0",
    color: "#9BC8CB",
    fontSize: "12px",
    overflowWrap: "anywhere",
  },
  codeBox: {
    border: "1px solid rgba(1, 231, 239, 0.45)",
    background: "rgba(1, 231, 239, 0.12)",
    color: "#00FBFF",
    borderRadius: "18px",
    padding: "13px 16px",
    fontSize: "26px",
    fontWeight: 1000,
    letterSpacing: "0.16em",
    cursor: "pointer",
    boxShadow: "0 0 26px rgba(0, 251, 255, 0.12)",
  },
  messageActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "14px",
  },
  actionButton: {
    display: "inline-flex",
    border: "1px solid rgba(1, 231, 239, 0.45)",
    background:
      "linear-gradient(135deg, rgba(1, 231, 239, 0.18), rgba(0, 251, 255, 0.1))",
    color: "#00FBFF",
    borderRadius: "14px",
    padding: "11px 14px",
    fontWeight: 950,
    textDecoration: "none",
  },
  secondaryButton: {
    border: "1px solid rgba(155, 200, 203, 0.2)",
    background: "rgba(155, 200, 203, 0.08)",
    color: "#ECFFFF",
    borderRadius: "14px",
    padding: "11px 14px",
    fontWeight: 900,
    cursor: "pointer",
  },
  bodyBox: {
    marginTop: "14px",
    border: "1px solid rgba(1, 231, 239, 0.12)",
    background: "rgba(0, 0, 0, 0.24)",
    borderRadius: "17px",
    padding: "15px",
    color: "#ECFFFF",
    lineHeight: 1.65,
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
    maxHeight: "300px",
    overflowY: "auto",
  },
  muted: {
    color: "#9BC8CB",
    lineHeight: 1.6,
    margin: 0,
  },
}