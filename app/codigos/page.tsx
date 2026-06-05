"use client"

import { useState } from "react"
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
  const base = `${asunto || ""}\n${texto || ""}`
    .replace(/\s+/g, " ")
    .trim()

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

export default function CodigosPage() {
  const [correo, setCorreo] = useState("")
  const [pin, setPin] = useState("")
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState("")
  const [cliente, setCliente] = useState<ClienteConsulta | null>(null)
  const [mensajes, setMensajes] = useState<MensajeConsulta[]>([])

  const consultar = async (e: FormEvent) => {
    e.preventDefault()

    setCargando(true)
    setError("")
    setCliente(null)
    setMensajes([])

    try {
      const res = await fetch("/api/codigos/consultar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          correo,
          pin,
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

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <div style={styles.brandBox}>
          <p style={styles.kicker}>JONAS STREAM</p>
          <h1 style={styles.title}>Consulta de códigos</h1>
          <p style={styles.description}>
            Ingresa tu correo asignado y PIN para ver tus códigos de acceso.
          </p>
        </div>

        <form onSubmit={consultar} style={styles.form}>
          <input
            style={styles.input}
            placeholder="Correo asignado"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            autoComplete="email"
          />

          <input
            style={styles.input}
            placeholder="PIN de acceso"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            type="password"
            autoComplete="current-password"
          />

          <button type="submit" style={styles.button} disabled={cargando}>
            {cargando ? "Consultando..." : "Consultar códigos"}
          </button>
        </form>

        {error && <div style={styles.error}>{error}</div>}

        {cliente && (
          <section style={styles.accountBox}>
            <p style={styles.kicker}>CUENTA ASIGNADA</p>

            <div style={styles.accountGrid}>
              <div>
                <span style={styles.label}>Cliente</span>
                <strong>{cliente.nombre}</strong>
              </div>

              <div>
                <span style={styles.label}>Plataforma</span>
                <strong>{cliente.plataforma || "No definida"}</strong>
              </div>

              <div>
                <span style={styles.label}>Correo</span>
                <strong>{cliente.correo_asignado}</strong>
              </div>

              <div>
                <span style={styles.label}>Estado</span>
                <strong>{cliente.estado}</strong>
              </div>

              <div>
                <span style={styles.label}>Vencimiento</span>
                <strong>
                  {cliente.fecha_vencimiento
                    ? new Date(cliente.fecha_vencimiento).toLocaleDateString(
                        "es-PE"
                      )
                    : "No definido"}
                </strong>
              </div>
            </div>
          </section>
        )}

        {cliente && (
          <section style={styles.messagesBox}>
            <p style={styles.kicker}>MENSAJES RECIENTES</p>

            {mensajes.length === 0 ? (
              <p style={styles.muted}>
                Todavía no hay códigos o mensajes para esta cuenta.
              </p>
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
                        <div>
                          <h3 style={styles.messageTitle}>
                            {mensaje.asunto || "Sin asunto"}
                          </h3>

                          <p style={styles.dateText}>
                            {new Date(mensaje.fecha_mensaje).toLocaleString(
                              "es-PE"
                            )}
                          </p>

                          <p style={styles.remitenteText}>
                            {mensaje.remitente || "Remitente no disponible"}
                          </p>
                        </div>

                        {codigo && <div style={styles.codeBox}>{codigo}</div>}
                      </div>

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

                      <div style={styles.bodyBox}>
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
    </main>
  )
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top left, rgba(1, 231, 239, 0.18), transparent 35%), radial-gradient(circle at bottom right, rgba(0, 251, 255, 0.12), transparent 35%), linear-gradient(135deg, #000000, #031316, #071B1E)",
    color: "#ECFFFF",
    fontFamily: "Arial, sans-serif",
    padding: "34px",
    display: "flex",
    justifyContent: "center",
  },
  card: {
    width: "100%",
    maxWidth: "780px",
    border: "1px solid rgba(1, 231, 239, 0.18)",
    background: "rgba(3, 19, 22, 0.82)",
    borderRadius: "28px",
    padding: "30px",
    boxShadow: "0 0 40px rgba(0, 251, 255, 0.18)",
  },
  brandBox: {
    textAlign: "center",
    marginBottom: "24px",
  },
  kicker: {
    color: "#01E7EF",
    letterSpacing: "0.16em",
    fontWeight: 900,
    fontSize: "12px",
    margin: "0 0 8px",
  },
  title: {
    margin: 0,
    fontSize: "38px",
    lineHeight: 1,
  },
  description: {
    margin: "12px 0 0",
    color: "#9BC8CB",
    lineHeight: 1.6,
  },
  form: {
    display: "grid",
    gap: "14px",
  },
  input: {
    width: "100%",
    border: "1px solid rgba(1, 231, 239, 0.22)",
    outline: "none",
    borderRadius: "16px",
    padding: "15px",
    background: "rgba(0, 0, 0, 0.35)",
    color: "#ECFFFF",
    fontSize: "15px",
  },
  button: {
    border: "none",
    background: "linear-gradient(135deg, #01E7EF, #00FBFF)",
    color: "#000000",
    borderRadius: "16px",
    padding: "15px",
    fontWeight: 950,
    cursor: "pointer",
    fontSize: "15px",
  },
  error: {
    marginTop: "16px",
    border: "1px solid rgba(255, 67, 67, 0.45)",
    background: "rgba(255, 67, 67, 0.15)",
    color: "#ff9b9b",
    borderRadius: "16px",
    padding: "14px",
    fontWeight: 800,
  },
  accountBox: {
    marginTop: "24px",
    border: "1px solid rgba(1, 231, 239, 0.18)",
    background: "rgba(1, 231, 239, 0.06)",
    borderRadius: "20px",
    padding: "18px",
  },
  accountGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "14px",
  },
  label: {
    display: "block",
    color: "#9BC8CB",
    fontSize: "12px",
    marginBottom: "5px",
  },
  messagesBox: {
    marginTop: "24px",
  },
  messagesList: {
    display: "grid",
    gap: "14px",
    marginTop: "14px",
  },
  messageCard: {
    border: "1px solid rgba(1, 231, 239, 0.18)",
    background: "rgba(0, 0, 0, 0.26)",
    borderRadius: "20px",
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
  },
  codeBox: {
    border: "1px solid rgba(1, 231, 239, 0.4)",
    background: "rgba(1, 231, 239, 0.12)",
    color: "#00FBFF",
    borderRadius: "16px",
    padding: "12px 16px",
    fontSize: "24px",
    fontWeight: 950,
    letterSpacing: "0.14em",
  },
  actionButton: {
    display: "inline-flex",
    marginTop: "14px",
    border: "1px solid rgba(1, 231, 239, 0.45)",
    background:
      "linear-gradient(135deg, rgba(1, 231, 239, 0.18), rgba(0, 251, 255, 0.1))",
    color: "#00FBFF",
    borderRadius: "14px",
    padding: "11px 14px",
    fontWeight: 950,
    textDecoration: "none",
  },
  bodyBox: {
    marginTop: "14px",
    border: "1px solid rgba(1, 231, 239, 0.12)",
    background: "rgba(0, 0, 0, 0.22)",
    borderRadius: "16px",
    padding: "14px",
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
  },
}