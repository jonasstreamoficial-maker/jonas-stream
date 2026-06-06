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

const BRAND = {
  cyan: "#01E7EF",
  cyanGlow: "#00FBFF",
  turquoise: "#018B90",
  black: "#000000",
  base: "#031316",
  dark: "#071B1E",
  white: "#ECFFFF",
  muted: "#9BC8CB",
  danger: "#ff6b6b",
  warning: "#ffd166",
  panel: "rgba(3, 19, 22, 0.86)",
  panelStrong: "rgba(0, 0, 0, 0.38)",
  border: "rgba(1, 231, 239, 0.18)",
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
    lower.includes("unsubscribe") ||
    lower.includes("cancel")
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
    utiles.find((url) => {
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
    base.includes("iniciar sesión") ||
    base.includes("verification")
  ) {
    return "Abrir verificación"
  }

  return "Abrir enlace"
}

function extraerCodigo(texto: string, asunto?: string | null) {
  const base = `${asunto || ""}\n${texto || ""}`.replace(/\s+/g, " ").trim()

  const patrones = [
    /c[oó]digo.{0,120}?(\d[\d\s-]{2,14}\d)/i,
    /ingresa.{0,120}?(\d[\d\s-]{2,14}\d)/i,
    /verificaci[oó]n.{0,120}?(\d[\d\s-]{2,14}\d)/i,
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
    "Terms of Use",
    "Privacy",
    "Help Center",
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
  const date = new Date(fecha)

  if (Number.isNaN(date.getTime())) {
    return "Fecha no disponible"
  }

  return date.toLocaleString("es-PE", {
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
      color: BRAND.cyanGlow,
      fondo: "rgba(0, 251, 255, 0.10)",
    }
  }

  if (normalizado === "vencido") {
    return {
      texto: "Vencido",
      color: BRAND.danger,
      fondo: "rgba(255, 107, 107, 0.12)",
    }
  }

  if (normalizado === "suspendido") {
    return {
      texto: "Suspendido",
      color: BRAND.warning,
      fondo: "rgba(255, 209, 102, 0.12)",
    }
  }

  return {
    texto: estado || "Sin estado",
    color: BRAND.muted,
    fondo: "rgba(155, 200, 203, 0.10)",
  }
}

export default function CodigosPage() {
  const [correo, setCorreo] = useState("")
  const [pin, setPin] = useState("")
  const [mostrarPin, setMostrarPin] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState("")
  const [aviso, setAviso] = useState("")
  const [cliente, setCliente] = useState<ClienteConsulta | null>(null)
  const [mensajes, setMensajes] = useState<MensajeConsulta[]>([])

  const ultimoMensaje = useMemo(() => mensajes[0] || null, [mensajes])
  const estado = cliente ? estadoVisual(cliente.estado) : null
  const diasRestantes = calcularDiasRestantes(cliente?.fecha_vencimiento)

  const consultarCodigos = async (correoConsulta: string, pinConsulta: string) => {
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
          correo: correoConsulta.trim().toLowerCase(),
          pin: pinConsulta.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.ok) {
        setError(data.error || "No se pudo consultar la cuenta.")
        return
      }

      setCliente(data.cliente)
      setMensajes(data.mensajes || [])

      if ((data.mensajes || []).length === 0) {
        setAviso("Acceso validado. Aún no hay mensajes recientes para este correo.")
      }
    } catch {
      setError("Error de conexión. Intenta nuevamente.")
    } finally {
      setCargando(false)
    }
  }

  const consultar = async (e: FormEvent) => {
    e.preventDefault()

    const correoLimpio = correo.trim().toLowerCase()
    const pinLimpio = pin.trim()

    if (!correoLimpio.includes("@jonasstream.xyz")) {
      setError("Ingresa el correo asignado por JONAS STREAM.")
      return
    }

    if (!pinLimpio) {
      setError("Ingresa tu PIN de acceso.")
      return
    }

    setCorreo(correoLimpio)
    await consultarCodigos(correoLimpio, pinLimpio)
  }

  const actualizar = async () => {
    if (!correo.trim() || !pin.trim()) return
    await consultarCodigos(correo.trim().toLowerCase(), pin.trim())
  }

  const copiarTexto = async (texto: string, mensajeOK: string) => {
    try {
      await navigator.clipboard.writeText(texto)
      setAviso(mensajeOK)
    } catch {
      setAviso("No se pudo copiar automáticamente. Mantén presionado y copia manualmente.")
    }
  }

  const copiarCodigo = async (codigo: string) => {
    await copiarTexto(codigo, "Código copiado correctamente.")
  }

  return (
    <main style={styles.page}>
      <div style={styles.backgroundGrid} />
      <div style={styles.backgroundGlowOne} />
      <div style={styles.backgroundGlowTwo} />

      <section style={styles.shell}>
        <aside style={styles.brandPanel}>
          <div style={styles.brandTop}>
            <div style={styles.logoMark}>JS</div>
            <div>
              <p style={styles.kicker}>JONAS STREAM</p>
              <strong style={styles.brandName}>Soporte de accesos</strong>
            </div>
          </div>

          <div style={styles.heroBlock}>
            <h1 style={styles.heroTitle}>Consulta tus códigos en segundos</h1>
            <p style={styles.heroText}>
              Ingresa el correo asignado y tu PIN para ver códigos de inicio de
              sesión, enlaces de verificación y mensajes recientes.
            </p>
          </div>

          <div style={styles.stepsBox}>
            <div style={styles.stepItem}>
              <span style={styles.stepNumber}>1</span>
              <div>
                <strong>Correo asignado</strong>
                <p>Es el correo que recibiste al comprar tu perfil.</p>
              </div>
            </div>

            <div style={styles.stepItem}>
              <span style={styles.stepNumber}>2</span>
              <div>
                <strong>PIN de acceso</strong>
                <p>Permite abrir únicamente tu bandeja asignada.</p>
              </div>
            </div>

            <div style={styles.stepItem}>
              <span style={styles.stepNumber}>3</span>
              <div>
                <strong>Mensajes recientes</strong>
                <p>Los códigos nuevos aparecerán cuando lleguen al sistema.</p>
              </div>
            </div>
          </div>

          <div style={styles.securityBox}>
            <strong>Consulta privada</strong>
            <span>No compartas tu PIN. Soporte puede cambiarlo si lo necesitas.</span>
          </div>
        </aside>

        <section style={styles.mainPanel}>
          <div style={styles.mobileBrand}>
            <div style={styles.logoMarkSmall}>JS</div>
            <div>
              <p style={styles.kicker}>JONAS STREAM</p>
              <strong>Centro de códigos</strong>
            </div>
          </div>

          <div style={styles.topBar}>
            <div>
              <p style={styles.kicker}>ACCESO DE CLIENTE</p>
              <h2 style={styles.sectionTitle}>Consulta de códigos</h2>
              <p style={styles.sectionDescription}>
                Revisa aquí los códigos y enlaces enviados a tu correo asignado.
              </p>
            </div>

            <span style={styles.liveBadge}>
              <span style={styles.liveDot} />
              Activo
            </span>
          </div>

          <form onSubmit={consultar} style={styles.form}>
            <label style={styles.field}>
              <span>Correo asignado</span>
              <input
                style={styles.input}
                placeholder="netflix001@jonasstream.xyz"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                autoComplete="email"
                autoCapitalize="none"
                inputMode="email"
                required
              />
            </label>

            <label style={styles.field}>
              <span>PIN de acceso</span>
              <div style={styles.passwordWrap}>
                <input
                  style={styles.inputPassword}
                  placeholder="Ingresa tu PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  type={mostrarPin ? "text" : "password"}
                  autoComplete="current-password"
                  inputMode="numeric"
                  required
                />

                <button
                  type="button"
                  onClick={() => setMostrarPin((value) => !value)}
                  style={styles.eyeButton}
                  aria-label={mostrarPin ? "Ocultar PIN" : "Mostrar PIN"}
                >
                  {mostrarPin ? "Ocultar" : "Ver"}
                </button>
              </div>
            </label>

            <button type="submit" style={styles.button} disabled={cargando}>
              {cargando ? "Consultando..." : "Consultar códigos"}
            </button>
          </form>

          {error && <div style={styles.error}>{error}</div>}
          {aviso && <div style={styles.notice}>{aviso}</div>}

          {!cliente && (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>⌁</div>
              <h3>Ingresa tus datos de acceso</h3>
              <p>
                Cuando consultes, verás tu cuenta asignada, últimos mensajes,
                códigos disponibles y enlaces principales.
              </p>
            </div>
          )}

          {cliente && (
            <section style={styles.accountBox}>
              <div style={styles.accountTop}>
                <div>
                  <p style={styles.kicker}>CUENTA ASIGNADA</p>
                  <h3 style={styles.accountTitle}>
                    {cliente.plataforma || "Plataforma"}
                  </h3>
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
                <InfoItem label="Cliente" value={cliente.nombre || "Cliente"} />
                <InfoItem label="Correo" value={cliente.correo_asignado} />
                <InfoItem
                  label="Vencimiento"
                  value={
                    cliente.fecha_vencimiento
                      ? new Date(cliente.fecha_vencimiento).toLocaleDateString(
                          "es-PE"
                        )
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

              <div style={styles.accountActions}>
                <button type="button" onClick={actualizar} style={styles.refreshButton}>
                  Actualizar mensajes
                </button>

                <button
                  type="button"
                  onClick={() =>
                    copiarTexto(
                      cliente.correo_asignado,
                      "Correo asignado copiado correctamente."
                    )
                  }
                  style={styles.secondaryButton}
                >
                  Copiar correo
                </button>
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
                    aparecerá aquí. Presiona actualizar después de solicitar un código.
                  </p>
                </div>
              ) : (
                <div style={styles.messagesList}>
                  {mensajes.map((mensaje) => {
                    const cuerpo = mensaje.cuerpo_texto || ""
                    const codigo = extraerCodigo(cuerpo, mensaje.asunto)
                    const link = extraerLinkPrincipal(cuerpo)
                    const cuerpoLimpio = limpiarCuerpo(cuerpo)
                    const textoAccion = obtenerTextoAccion(cuerpo, mensaje.asunto)

                    return (
                      <article key={mensaje.id} style={styles.messageCard}>
                        <div style={styles.messageHeader}>
                          <div style={styles.messageInfo}>
                            <h3 style={styles.messageTitle}>
                              {mensaje.asunto || "Sin asunto"}
                            </h3>

                            <p style={styles.dateText}>
                              {formatearFecha(mensaje.fecha_mensaje)}
                            </p>

                            <p style={styles.remitenteText}>
                              {mensaje.remitente || "Remitente no disponible"}
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

const baseButton: CSSProperties = {
  border: "none",
  borderRadius: "18px",
  padding: "15px 18px",
  fontWeight: 1000,
  cursor: "pointer",
  fontSize: "15px",
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    position: "relative",
    overflowX: "hidden",
    background: `linear-gradient(135deg, ${BRAND.black} 0%, ${BRAND.base} 48%, ${BRAND.dark} 100%)`,
    color: BRAND.white,
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
    padding: "clamp(14px, 3vw, 34px)",
  },
  backgroundGrid: {
    position: "fixed",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(1, 231, 239, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(1, 231, 239, 0.035) 1px, transparent 1px)",
    backgroundSize: "44px 44px",
    maskImage: "linear-gradient(to bottom, black, transparent 75%)",
    pointerEvents: "none",
  },
  backgroundGlowOne: {
    position: "fixed",
    width: "min(520px, 80vw)",
    height: "min(520px, 80vw)",
    borderRadius: "999px",
    background: "rgba(1, 231, 239, 0.13)",
    filter: "blur(90px)",
    top: "-160px",
    left: "-120px",
    pointerEvents: "none",
  },
  backgroundGlowTwo: {
    position: "fixed",
    width: "min(620px, 90vw)",
    height: "min(620px, 90vw)",
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
    gridTemplateColumns: "minmax(280px, 380px) minmax(0, 1fr)",
    gap: "22px",
    alignItems: "start",
  },
  brandPanel: {
    minHeight: "calc(100vh - 68px)",
    border: `1px solid ${BRAND.border}`,
    background:
      "linear-gradient(180deg, rgba(3, 19, 22, 0.92), rgba(0, 0, 0, 0.58))",
    borderRadius: "30px",
    padding: "28px",
    boxShadow: "0 0 40px rgba(0, 251, 255, 0.14)",
    position: "sticky",
    top: "24px",
  },
  brandTop: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "34px",
  },
  logoMark: {
    width: "62px",
    height: "62px",
    borderRadius: "20px",
    display: "grid",
    placeItems: "center",
    background:
      "linear-gradient(135deg, rgba(1, 231, 239, 1), rgba(0, 251, 255, 0.48))",
    color: BRAND.black,
    fontWeight: 1000,
    fontSize: "20px",
    boxShadow: "0 0 30px rgba(0, 251, 255, 0.22)",
    flex: "0 0 auto",
  },
  logoMarkSmall: {
    width: "46px",
    height: "46px",
    borderRadius: "16px",
    display: "grid",
    placeItems: "center",
    background:
      "linear-gradient(135deg, rgba(1, 231, 239, 1), rgba(0, 251, 255, 0.48))",
    color: BRAND.black,
    fontWeight: 1000,
    fontSize: "15px",
    boxShadow: "0 0 24px rgba(0, 251, 255, 0.18)",
    flex: "0 0 auto",
  },
  brandName: {
    display: "block",
    color: BRAND.white,
  },
  heroBlock: {
    marginTop: "8px",
  },
  kicker: {
    color: BRAND.cyan,
    letterSpacing: "0.18em",
    fontWeight: 950,
    fontSize: "12px",
    margin: "0 0 8px",
    textTransform: "uppercase",
  },
  heroTitle: {
    margin: "0 0 14px",
    fontSize: "clamp(34px, 4vw, 48px)",
    lineHeight: 1,
    letterSpacing: "-0.04em",
  },
  heroText: {
    margin: 0,
    color: BRAND.muted,
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
    color: BRAND.cyanGlow,
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
    color: BRAND.muted,
  },
  mainPanel: {
    border: `1px solid ${BRAND.border}`,
    background: BRAND.panel,
    borderRadius: "30px",
    padding: "clamp(18px, 3vw, 28px)",
    boxShadow: "0 0 40px rgba(0, 251, 255, 0.18)",
    minWidth: 0,
  },
  mobileBrand: {
    display: "none",
    alignItems: "center",
    gap: "12px",
    marginBottom: "20px",
    border: "1px solid rgba(1, 231, 239, 0.14)",
    background: "rgba(1, 231, 239, 0.05)",
    borderRadius: "20px",
    padding: "14px",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    alignItems: "flex-start",
    marginBottom: "22px",
  },
  sectionTitle: {
    margin: 0,
    fontSize: "clamp(30px, 4vw, 38px)",
    letterSpacing: "-0.035em",
    lineHeight: 1.05,
  },
  sectionDescription: {
    margin: "8px 0 0",
    color: BRAND.muted,
    lineHeight: 1.6,
  },
  liveBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    border: "1px solid rgba(0, 251, 255, 0.35)",
    background: "rgba(0, 251, 255, 0.09)",
    color: BRAND.cyanGlow,
    borderRadius: "999px",
    padding: "9px 12px",
    fontSize: "12px",
    fontWeight: 950,
    whiteSpace: "nowrap",
  },
  liveDot: {
    width: "8px",
    height: "8px",
    borderRadius: "999px",
    background: BRAND.cyanGlow,
    boxShadow: "0 0 14px rgba(0, 251, 255, 0.7)",
  },
  form: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(220px, 0.75fr)",
    gap: "14px",
    alignItems: "end",
  },
  field: {
    display: "grid",
    gap: "8px",
    color: BRAND.muted,
    fontSize: "13px",
    fontWeight: 800,
    minWidth: 0,
  },
  input: {
    width: "100%",
    border: "1px solid rgba(1, 231, 239, 0.24)",
    outline: "none",
    borderRadius: "17px",
    padding: "16px",
    background: BRAND.panelStrong,
    color: BRAND.white,
    fontSize: "16px",
    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.015)",
    minWidth: 0,
  },
  passwordWrap: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) auto",
    alignItems: "center",
    border: "1px solid rgba(1, 231, 239, 0.24)",
    borderRadius: "17px",
    background: BRAND.panelStrong,
    overflow: "hidden",
  },
  inputPassword: {
    width: "100%",
    border: "none",
    outline: "none",
    padding: "16px",
    background: "transparent",
    color: BRAND.white,
    fontSize: "16px",
    minWidth: 0,
  },
  eyeButton: {
    height: "100%",
    border: "none",
    borderLeft: "1px solid rgba(1, 231, 239, 0.14)",
    background: "rgba(1, 231, 239, 0.08)",
    color: BRAND.cyanGlow,
    padding: "0 14px",
    fontWeight: 900,
    cursor: "pointer",
  },
  button: {
    ...baseButton,
    gridColumn: "1 / -1",
    background:
      "linear-gradient(135deg, #01E7EF 0%, #00FBFF 55%, #9BFFFF 100%)",
    color: BRAND.black,
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
    color: BRAND.cyanGlow,
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
    justifyItems: "center",
    textAlign: "center",
    color: BRAND.muted,
  },
  emptyIcon: {
    width: "54px",
    height: "54px",
    borderRadius: "18px",
    display: "grid",
    placeItems: "center",
    border: "1px solid rgba(1, 231, 239, 0.22)",
    background: "rgba(1, 231, 239, 0.07)",
    color: BRAND.cyanGlow,
    fontSize: "30px",
    marginBottom: "12px",
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
    gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))",
    gap: "12px",
  },
  accountActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "16px",
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
    color: BRAND.muted,
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
    color: BRAND.cyanGlow,
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
    color: BRAND.muted,
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
    minWidth: 0,
  },
  messageHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    alignItems: "center",
  },
  messageInfo: {
    minWidth: 0,
  },
  messageTitle: {
    margin: 0,
    fontSize: "18px",
    letterSpacing: "-0.02em",
    overflowWrap: "anywhere",
  },
  dateText: {
    margin: "6px 0 0",
    color: BRAND.muted,
    fontSize: "12px",
  },
  remitenteText: {
    margin: "6px 0 0",
    color: BRAND.muted,
    fontSize: "12px",
    overflowWrap: "anywhere",
  },
  codeBox: {
    border: "1px solid rgba(1, 231, 239, 0.45)",
    background: "rgba(1, 231, 239, 0.12)",
    color: BRAND.cyanGlow,
    borderRadius: "18px",
    padding: "13px 16px",
    fontSize: "clamp(22px, 5vw, 30px)",
    fontWeight: 1000,
    letterSpacing: "0.16em",
    cursor: "pointer",
    boxShadow: "0 0 26px rgba(0, 251, 255, 0.12)",
    flex: "0 0 auto",
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
    color: BRAND.cyanGlow,
    borderRadius: "14px",
    padding: "11px 14px",
    fontWeight: 950,
    textDecoration: "none",
  },
  secondaryButton: {
    border: "1px solid rgba(155, 200, 203, 0.2)",
    background: "rgba(155, 200, 203, 0.08)",
    color: BRAND.white,
    borderRadius: "14px",
    padding: "11px 14px",
    fontWeight: 900,
    cursor: "pointer",
  },
  refreshButton: {
    border: "1px solid rgba(1, 231, 239, 0.35)",
    background: "rgba(1, 231, 239, 0.11)",
    color: BRAND.cyanGlow,
    borderRadius: "14px",
    padding: "11px 14px",
    fontWeight: 950,
    cursor: "pointer",
  },
  bodyBox: {
    marginTop: "14px",
    border: "1px solid rgba(1, 231, 239, 0.12)",
    background: "rgba(0, 0, 0, 0.24)",
    borderRadius: "17px",
    padding: "15px",
    color: BRAND.white,
    lineHeight: 1.65,
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
    maxHeight: "300px",
    overflowY: "auto",
  },
  muted: {
    color: BRAND.muted,
    lineHeight: 1.6,
    margin: 0,
  },
}

/*
  Responsive móvil/tablet:
  Next permite estilos inline, pero las media queries deben ir en CSS global.
  Este bloque se inyecta desde el componente para que puedas copiar solo este archivo.
*/
if (typeof document !== "undefined") {
  const id = "jonas-codigos-responsive-style"

  if (!document.getElementById(id)) {
    const style = document.createElement("style")
    style.id = id
    style.innerHTML = `
      @media (max-width: 980px) {
        main section[style] {
          max-width: 760px;
        }

        main section[style*="grid-template-columns: minmax(280px, 380px)"] {
          grid-template-columns: 1fr !important;
        }

        main aside[style] {
          display: none !important;
        }

        main div[style*="display: none"] {
          display: flex !important;
        }
      }

      @media (max-width: 640px) {
        body {
          overflow-x: hidden;
        }

        main {
          padding: 12px !important;
        }

        main section[style*="border-radius: 30px"] {
          border-radius: 22px !important;
        }

        form[style] {
          grid-template-columns: 1fr !important;
        }

        div[style*="justify-content: space-between"] {
          align-items: flex-start;
        }

        article div[style*="justify-content: space-between"] {
          flex-direction: column !important;
          align-items: stretch !important;
        }

        button[title="Copiar código"] {
          width: 100% !important;
        }

        a[style], button[style] {
          max-width: 100%;
        }
      }
    `
    document.head.appendChild(style)
  }
}
