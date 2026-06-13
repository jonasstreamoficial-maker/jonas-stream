"use client"

import { useEffect, useMemo, useState } from "react"
import type { FormEvent } from "react"
import Link from "next/link"
import styles from "./codigos.module.css"

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

const WHATSAPP_SOPORTE = "51900557949"
const AUTO_REFRESH_MS = 30000

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
      clase: styles.statusActive,
    }
  }

  if (normalizado === "vencido") {
    return {
      texto: "Vencido",
      clase: styles.statusDanger,
    }
  }

  if (normalizado === "suspendido") {
    return {
      texto: "Suspendido",
      clase: styles.statusWarning,
    }
  }

  return {
    texto: estado || "Sin estado",
    clase: styles.statusNeutral,
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
  const [actualizandoAuto, setActualizandoAuto] = useState(false)
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date | null>(null)

  const ultimoMensaje = useMemo(() => mensajes[0] || null, [mensajes])
  const estado = cliente ? estadoVisual(cliente.estado) : null
  const diasRestantes = calcularDiasRestantes(cliente?.fecha_vencimiento)

  const whatsappUrl = useMemo(() => {
    const texto = cliente
      ? `Hola JONAS STREAM, necesito ayuda con mi código.\n\nCorreo asignado: ${cliente.correo_asignado}\nPlataforma: ${cliente.plataforma || "No definida"}`
      : "Hola JONAS STREAM, necesito ayuda con mi código."

    return `https://wa.me/${WHATSAPP_SOPORTE}?text=${encodeURIComponent(texto)}`
  }, [cliente])

  const consultarCodigos = async (
    correoConsulta: string,
    pinConsulta: string,
    silencioso = false
  ) => {
    if (silencioso) {
      setActualizandoAuto(true)
    } else {
      setCargando(true)
      setError("")
      setAviso("")
      setCliente(null)
      setMensajes([])
    }

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
      setUltimaActualizacion(new Date())

      if (!silencioso && (data.mensajes || []).length === 0) {
        setAviso("Acceso validado. Aún no hay mensajes recientes para este correo.")
      }
    } catch {
      if (!silencioso) {
        setError("Error de conexión. Intenta nuevamente.")
      }
    } finally {
      if (silencioso) {
        setActualizandoAuto(false)
      } else {
        setCargando(false)
      }
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
    await consultarCodigos(correo.trim().toLowerCase(), pin.trim(), false)
  }

  useEffect(() => {
    if (!cliente || !correo.trim() || !pin.trim()) return

    const intervalo = window.setInterval(() => {
      consultarCodigos(correo.trim().toLowerCase(), pin.trim(), true)
    }, AUTO_REFRESH_MS)

    return () => window.clearInterval(intervalo)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cliente?.id, correo, pin])

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
    <main className={styles.page}>
      <div className={styles.bgGlowOne} />
      <div className={styles.bgGlowTwo} />
      <div className={styles.gridOverlay} />
      <div className={styles.sideBrand}>JONAS STREAM</div>
      <div className={`${styles.sideBrand} ${styles.sideBrandRight}`}>CÓDIGOS</div>

      <header className={styles.topbarWrap}>
        <div className={styles.topbar}>
          <Link href="/" className={styles.brandBlock}>
            <strong>JONAS STREAM</strong>
            <span>Códigos y accesos</span>
          </Link>

          <nav className={styles.topActions}>
            <Link href="/" className={styles.topLink}>Inicio</Link>
            <Link href="/tienda" className={styles.topLink}>Tienda</Link>
            <Link href="/cliente" className={styles.topLink}>Panel cliente</Link>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={styles.topLinkPrimary}>
              Contáctanos
            </a>
          </nav>
        </div>
      </header>

      <section className={styles.hero}>
        <span className={styles.heroBadge}>Consulta segura</span>
        <h1 className={styles.heroTitle}>
          Códigos y accesos
          <span>Jonas Stream</span>
        </h1>
        <p className={styles.heroText}>
          Ingresa tu correo asignado y PIN para revisar códigos, mensajes recientes,
          enlaces principales y datos de tu cuenta.
        </p>
      </section>

      <section className={styles.mainGrid}>
        <aside className={styles.infoPanel}>
          <div className={styles.infoCard}>
            <span>Estado</span>
            <strong>{cliente ? "Acceso validado" : "Pendiente"}</strong>
            <p>
              La consulta se actualiza automáticamente cuando el acceso está validado.
            </p>
          </div>

          <div className={styles.infoCard}>
            <span>Soporte</span>
            <strong>WhatsApp</strong>
            <p>Escríbenos si tu código no llega o tu plataforma solicita verificación.</p>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={styles.whatsappSideButton}>
              Contactar soporte
            </a>
          </div>
        </aside>

        <section className={styles.contentPanel}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionKicker}>Acceso del cliente</span>
            <h2 className={styles.sectionTitle}>Consultar códigos</h2>
            <p>Usa solo el correo asignado por JONAS STREAM y tu PIN.</p>
          </div>

          <form onSubmit={consultar} className={styles.formGrid}>
            <label className={styles.fieldGroup}>
              <span>Correo asignado</span>
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="cliente@jonasstream.xyz"
                autoComplete="email"
              />
            </label>

            <label className={styles.fieldGroup}>
              <span>PIN de acceso</span>
              <div className={styles.pinField}>
                <input
                  type={mostrarPin ? "text" : "password"}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Ingresa tu PIN"
                  autoComplete="one-time-code"
                />
                <button type="button" onClick={() => setMostrarPin((value) => !value)}>
                  {mostrarPin ? "Ocultar" : "Ver"}
                </button>
              </div>
            </label>

            <button type="submit" className={styles.primaryButton} disabled={cargando}>
              {cargando ? "Consultando..." : "Consultar códigos"}
            </button>
          </form>

          <div className={styles.supportRow}>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={styles.whatsappButton}>
              Contactar soporte por WhatsApp
            </a>

            {cliente && (
              <span className={styles.autoStatus}>
                {actualizandoAuto
                  ? "Actualizando mensajes..."
                  : `Autoactualización cada ${AUTO_REFRESH_MS / 1000} segundos`}
              </span>
            )}
          </div>

          {error && <div className={styles.errorBox}>{error}</div>}
          {aviso && <div className={styles.noticeBox}>{aviso}</div>}

          {!cliente && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>⌁</div>
              <h3>Ingresa tus datos de acceso</h3>
              <p>
                Cuando consultes, verás tu cuenta asignada, últimos mensajes,
                códigos disponibles y enlaces principales.
              </p>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={styles.emptyWhatsappButton}>
                ¿Necesitas ayuda? Escribir a soporte
              </a>
            </div>
          )}

          {cliente && (
            <section className={styles.accountBox}>
              <div className={styles.accountTop}>
                <div>
                  <span className={styles.kicker}>Cuenta asignada</span>
                  <h3>{cliente.plataforma || "Plataforma"}</h3>
                </div>

                {estado && (
                  <span className={`${styles.statusBadge} ${estado.clase}`}>
                    {estado.texto}
                  </span>
                )}
              </div>

              <div className={styles.accountGrid}>
                <InfoItem label="Cliente" value={cliente.nombre || "Cliente"} />
                <InfoItem label="Correo" value={cliente.correo_asignado} />
                <InfoItem
                  label="Vencimiento"
                  value={
                    cliente.fecha_vencimiento
                      ? new Date(cliente.fecha_vencimiento).toLocaleDateString("es-PE")
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

              <div className={styles.accountActions}>
                <button type="button" onClick={actualizar} className={styles.refreshButton} disabled={cargando || actualizandoAuto}>
                  {actualizandoAuto ? "Actualizando..." : "Actualizar mensajes"}
                </button>

                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={styles.whatsappMiniButton}>
                  Soporte WhatsApp
                </a>

                <button type="button" onClick={() => copiarTexto(cliente.correo_asignado, "Correo asignado copiado correctamente.")} className={styles.secondaryButton}>
                  Copiar correo
                </button>

                {ultimaActualizacion && (
                  <span className={styles.lastUpdateText}>
                    Última actualización: {ultimaActualizacion.toLocaleTimeString("es-PE", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </span>
                )}
              </div>
            </section>
          )}

          {cliente && ultimoMensaje && (
            <section className={styles.highlightBox}>
              <div>
                <span className={styles.kicker}>Último mensaje</span>
                <h3>{ultimoMensaje.asunto || "Sin asunto"}</h3>
                <p>{formatearFecha(ultimoMensaje.fecha_mensaje)}</p>
              </div>

              {extraerCodigo(ultimoMensaje.cuerpo_texto || "", ultimoMensaje.asunto) && (
                <button
                  type="button"
                  className={styles.copyCodeButton}
                  onClick={() =>
                    copiarCodigo(
                      extraerCodigo(ultimoMensaje.cuerpo_texto || "", ultimoMensaje.asunto) || ""
                    )
                  }
                >
                  Copiar código
                </button>
              )}
            </section>
          )}

          {cliente && (
            <section className={styles.messagesBox}>
              <div className={styles.messagesHeader}>
                <div>
                  <span className={styles.kicker}>Mensajes recientes</span>
                  <h3>{mensajes.length} mensaje(s) encontrado(s)</h3>
                </div>
              </div>

              {mensajes.length === 0 ? (
                <div className={styles.emptyMessages}>
                  <strong>No hay mensajes todavía</strong>
                  <p>
                    Cuando llegue un código, enlace o aviso para este correo,
                    aparecerá aquí. Presiona actualizar después de solicitar un código.
                  </p>
                </div>
              ) : (
                <div className={styles.messagesList}>
                  {mensajes.map((mensaje) => {
                    const cuerpo = mensaje.cuerpo_texto || ""
                    const codigo = extraerCodigo(cuerpo, mensaje.asunto)
                    const link = extraerLinkPrincipal(cuerpo)
                    const cuerpoLimpio = limpiarCuerpo(cuerpo)
                    const textoAccion = obtenerTextoAccion(cuerpo, mensaje.asunto)

                    return (
                      <article key={mensaje.id} className={styles.messageCard}>
                        <div className={styles.messageHeader}>
                          <div className={styles.messageInfo}>
                            <h3>{mensaje.asunto || "Sin asunto"}</h3>
                            <p>{formatearFecha(mensaje.fecha_mensaje)}</p>
                            <small>{mensaje.remitente || "Remitente no disponible"}</small>
                          </div>

                          {codigo && (
                            <button type="button" className={styles.codeBox} onClick={() => copiarCodigo(codigo)} title="Copiar código">
                              {codigo}
                            </button>
                          )}
                        </div>

                        <div className={styles.messageActions}>
                          {link && (
                            <a href={link} target="_blank" rel="noopener noreferrer" className={styles.actionButton}>
                              {textoAccion}
                            </a>
                          )}

                          {codigo && (
                            <button type="button" className={styles.secondaryButton} onClick={() => copiarCodigo(codigo)}>
                              Copiar código
                            </button>
                          )}
                        </div>

                        <div className={styles.bodyBox}>
                          {cuerpoLimpio || "Mensaje recibido sin contenido visible."}
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
    <div className={styles.infoItem}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}
