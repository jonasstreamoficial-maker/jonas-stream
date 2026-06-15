import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type PayloadMensaje = {
  correo_destino?: string
  plataforma?: string | null
  remitente?: string | null
  asunto?: string | null
  cuerpo_texto?: string | null
  cuerpo_html?: string | null
  fecha_mensaje?: string | null
}

type ClienteSoporte = {
  id: string
  nombre: string | null
  plataforma: string | null
  correo_asignado: string | null
  estado: string | null
}

type LinkDetectado = {
  url: string
  contexto: string
}

type TipoMensaje =
  | "codigo"
  | "password"
  | "cambio_correo"
  | "nuevo_inicio"
  | "hogar"
  | "seguridad"
  | "enlace"
  | "normal"

const PATRON_PASSWORD_URL =
  /passwordresettoken|set-new-password|new-password|reset-password|password-reset|resetpassword|password\/reset|reset\/password|password-reset\/complete|resetpass|reset-password\?token|forgot-password|forgotten-password|account-recovery|loginhelp|\/password\?|\/password\/|newpassword/i

const PATRON_PASSWORD_TEXTO =
  /contraseña|password|restablec|recuper|reset|cambiar contraseña|change password|forgot password|set new password|establecer contraseña|nueva contraseña|reset your password|password reset/i

const PATRON_CODIGO_TEXTO =
  /c[oó]digo|code|verification|verificaci[oó]n|security code|one[-\s]?time|passcode|otp|inicio de sesi[oó]n|sign[-\s]?in|login|acceso|hogar|household/i

function limpiarTextoSeguro(valor: unknown, maxLength = 10000) {
  if (valor === null || valor === undefined) return null

  const texto = String(valor)
    .replace(/\u0000/g, "")
    .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim()

  if (!texto) return null

  return texto.slice(0, maxLength)
}

function normalizarCorreo(valor: unknown) {
  return limpiarTextoSeguro(valor, 320)?.toLowerCase() || ""
}

function normalizarFecha(valor: unknown) {
  const texto = limpiarTextoSeguro(valor, 120)

  if (!texto) return new Date().toISOString()

  const fecha = new Date(texto)

  if (Number.isNaN(fecha.getTime())) {
    return new Date().toISOString()
  }

  return fecha.toISOString()
}

function decodificarEntidadesBasicas(valor: string) {
  return valor
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/gi, "'")
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
}

function decodificarTracking(valor: string) {
  try {
    let texto = decodificarEntidadesBasicas(valor)

    texto = texto
      .replace(/-2F/gi, "%2F")
      .replace(/-3A/gi, "%3A")
      .replace(/-3D/gi, "%3D")
      .replace(/-26/gi, "%26")
      .replace(/-3F/gi, "%3F")
      .replace(/-2B/gi, "%2B")
      .replace(/-25/gi, "%25")
      .replace(/-40/gi, "%40")

    return decodeURIComponent(texto)
  } catch {
    return decodificarEntidadesBasicas(valor)
  }
}

function limpiarUrl(url: string) {
  return decodificarTracking(url)
    .replace(/[)\].,;]+$/g, "")
    .trim()
}

function quitarHtml(valor: string) {
  return decodificarEntidadesBasicas(valor)
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function escapeHtml(valor: string | number | null | undefined) {
  if (valor === null || valor === undefined) return ""

  return String(valor)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

function detectarPlataforma(correoDestino: string, texto: string) {
  const base = `${correoDestino} ${texto}`.toLowerCase()

  if (base.includes("netflix")) return "Netflix"
  if (base.includes("disney")) return "Disney+"
  if (base.includes("prime") || base.includes("amazon")) return "Prime Video"
  if (base.includes("crunchy") || base.includes("crunchyroll")) return "Crunchyroll"
  if (base.includes("youtube")) return "YouTube"
  if (base.includes("spotify")) return "Spotify"
  if (base.includes("max") || base.includes("hbo")) return "Max"
  if (base.includes("vix")) return "Vix"
  if (base.includes("chatgpt") || base.includes("openai")) return "ChatGPT"
  if (base.includes("apple")) return "Apple TV"
  if (base.includes("paramount")) return "Paramount+"
  if (base.includes("canva")) return "Canva"
  if (base.includes("deezer")) return "Deezer"
  if (base.includes("tidal")) return "Tidal"
  if (base.includes("viki")) return "Rakuten Viki"
  if (base.includes("universal")) return "Universal"

  return null
}

function esFechaOCodigoFalso(codigo: string) {
  const limpio = codigo.replace(/\D/g, "")

  if (/^20\d{6}$/.test(limpio)) return true // 20260615
  if (/^19\d{6}$/.test(limpio)) return true
  if (/^\d{8}$/.test(limpio)) {
    const yyyy = Number(limpio.slice(0, 4))
    const mm = Number(limpio.slice(4, 6))
    const dd = Number(limpio.slice(6, 8))

    if (yyyy >= 2000 && yyyy <= 2100 && mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31) {
      return true
    }
  }

  return false
}

function extraerCodigo(texto: string) {
  const base = (texto || "").replace(/\s+/g, " ").trim()

  const patronesDirectos = [
    /(?:c[oó]digo|code|verification code|security code|one[-\s]?time code|sign[-\s]?in code|login code|passcode|otp).{0,120}?(\d[\d\s-]{2,14}\d)/iu,
    /(?:ingresa|introduce|usa|utiliza|enter|use).{0,120}?(\d[\d\s-]{2,14}\d).{0,80}?(?:c[oó]digo|code|verification|verificaci[oó]n|login|inicio)/iu,
    /(?:hogar|household|home).{0,120}?(\d[\d\s-]{2,14}\d)/iu,
  ]

  for (const patron of patronesDirectos) {
    const match = base.match(patron)

    if (!match?.[1]) continue

    const codigo = match[1].replace(/\D/g, "")

    if (codigo.length >= 4 && codigo.length <= 8 && !esFechaOCodigoFalso(codigo)) {
      return codigo
    }
  }

  // Fallback controlado: solo si el asunto/cuerpo tiene contexto fuerte de código.
  if (!PATRON_CODIGO_TEXTO.test(base)) return null

  const matchLibre = base.match(/\b(\d(?:[\s-]?\d){3,7})\b/u)

  if (!matchLibre?.[1]) return null

  const codigo = matchLibre[1].replace(/\D/g, "")

  if (codigo.length < 4 || codigo.length > 8) return null
  if (esFechaOCodigoFalso(codigo)) return null

  return codigo
}

function agregarLinkDetectado(
  mapa: Map<string, LinkDetectado>,
  urlOriginal: string,
  contextoOriginal: string
) {
  const url = limpiarUrl(urlOriginal)

  if (!url || !/^https?:\/\//i.test(url)) return

  const contexto = quitarHtml(contextoOriginal || "").slice(0, 1000)
  const existente = mapa.get(url)

  if (!existente) {
    mapa.set(url, { url, contexto })
    return
  }

  if (contexto.length > existente.contexto.length) {
    mapa.set(url, { url, contexto })
  }
}

function extraerUrlRealDesdeParametros(url: string) {
  const resultados: string[] = []

  try {
    const objeto = new URL(url)

    for (const clave of [
      "url",
      "u",
      "upn",
      "target",
      "redirect",
      "redirect_uri",
      "continue",
      "continueUrl",
      "next",
      "link",
      "deep_link",
      "r",
    ]) {
      const valor = objeto.searchParams.get(clave)

      if (!valor) continue

      const decodificado = limpiarUrl(valor)

      if (/^https?:\/\//i.test(decodificado)) {
        resultados.push(decodificado)
      }

      const matchInterno = decodificado.match(/https?:\/\/[^\s"'<>]+/i)

      if (matchInterno?.[0]) {
        resultados.push(limpiarUrl(matchInterno[0]))
      }
    }
  } catch {
    return resultados
  }

  return resultados
}

function extraerLinksDetectados(texto: string, html?: string | null) {
  const links = new Map<string, LinkDetectado>()
  const fuentes = [texto || "", html || ""].filter(Boolean)

  for (const fuente of fuentes) {
    const limpio = decodificarEntidadesBasicas(fuente)

    const hrefRegex =
      /<a\b[^>]*?href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi

    let hrefMatch: RegExpExecArray | null

    while ((hrefMatch = hrefRegex.exec(limpio)) !== null) {
      const url = limpiarUrl(hrefMatch[1])
      const contexto = hrefMatch[0]

      agregarLinkDetectado(links, url, contexto)

      for (const real of extraerUrlRealDesdeParametros(url)) {
        agregarLinkDetectado(links, real, contexto)
      }

      if (links.size >= 40) break
    }

    const urlRegex = /https?:\/\/[^\s<>"'\]\)]+/gi
    let urlMatch: RegExpExecArray | null

    while ((urlMatch = urlRegex.exec(limpio)) !== null) {
      const inicio = Math.max(0, urlMatch.index - 280)
      const fin = Math.min(limpio.length, urlMatch.index + urlMatch[0].length + 280)
      const contexto = limpio.slice(inicio, fin)
      const url = limpiarUrl(urlMatch[0])

      agregarLinkDetectado(links, url, contexto)

      for (const real of extraerUrlRealDesdeParametros(url)) {
        agregarLinkDetectado(links, real, contexto)
      }

      if (links.size >= 40) break
    }

    if (links.size >= 40) break
  }

  return Array.from(links.values()).slice(0, 40)
}

function esLinkBasura(link: string) {
  const lower = link.toLowerCase()

  return [
    "privacy",
    "privacidad",
    "terms",
    "terminos",
    "términos",
    "help",
    "ayuda",
    "unsubscribe",
    "notification",
    "notificaciones",
    "contactus",
    "centro",
    "preferences",
    "email-preferences",
  ].some((palabra) => lower.includes(palabra))
}

function esLinkTracking(link: string) {
  const lower = link.toLowerCase()

  return (
    lower.includes("ablink.message.") ||
    lower.includes("/ls/click") ||
    lower.includes("click.email") ||
    lower.includes("click.mail") ||
    lower.includes("trk.") ||
    lower.includes("tracking") ||
    lower.includes("mandrillapp.com/track") ||
    lower.includes("sendgrid.net")
  )
}

function filtrarLinksDetectadosImportantes(links: LinkDetectado[]) {
  if (!links.length) return []

  const utiles = links.filter((link) => !esLinkBasura(link.url))

  return utiles.length ? utiles : links
}

function detectarTipoMensaje(
  asunto: string,
  cuerpo: string,
  codigo: string | null,
  links: LinkDetectado[]
): TipoMensaje {
  const base = `${asunto}\n${cuerpo}`.toLowerCase()

  if (codigo) return "codigo"

  if (PATRON_PASSWORD_TEXTO.test(base)) {
    return "password"
  }

  if (
    /cambio.{0,80}correo|correo.{0,80}cambi|email.{0,80}changed|changed.{0,80}email|email.{0,80}updated|direcci[oó]n.{0,80}correo|new email address|correo electr[oó]nico.{0,80}actualiz/i.test(
      base
    )
  ) {
    return "cambio_correo"
  }

  if (/hogar|household|home verification|home update|actualizar hogar/i.test(base)) {
    return "hogar"
  }

  if (
    /nuevo inicio|inicio de sesi[oó]n|new sign|sign-in|login alert|nuevo dispositivo|new device|accedid|acceso nuevo/i.test(
      base
    )
  ) {
    return "nuevo_inicio"
  }

  if (
    /dispositivo|device|seguridad|security|actividad inusual|suspicious|alerta/i.test(base)
  ) {
    return "seguridad"
  }

  if (
    links.length > 0 &&
    /crear cuenta|crea tu cuenta|activar|activación|activate|verify|verificar|confirmar|registro|sign up|signup|enlace|link/i.test(
      base
    )
  ) {
    return "enlace"
  }

  if (links.length > 0) return "enlace"

  return "normal"
}

function puntuarLinkPassword(link: LinkDetectado) {
  const url = link.url.toLowerCase()
  const contexto = link.contexto.toLowerCase()
  const base = `${url} ${contexto}`

  let score = 0

  if (PATRON_PASSWORD_URL.test(url)) {
    score += 220
  }

  if (PATRON_PASSWORD_TEXTO.test(contexto)) {
    score += 110
  }

  if (
    /auth\.hbomax\.com|auth\.max\.com|account\.max\.com|identity\.max\.com|netflix\.com\/password|sso\.crunchyroll\.com.*new-password|deezer\.com\/password\/reset|accounts\.spotify\.com.*password-reset|paramountplus\.com.*resetpassword|login\.tidal\.com\/resetpass|viki\.com\/reset-password|vix\.com.*reset\/password|auth\.disney|appleid\.apple\.com|iforgot\.apple\.com|canva\..*password/i.test(
      url
    )
  ) {
    score += 120
  }

  if (/auth|identity|account|accounts|login|sso/i.test(url)) {
    score += 30
  }

  // Si es tracking, solo se acepta cuando el botón/contexto habla de contraseña.
  if (esLinkTracking(url)) {
    score -= 80

    if (PATRON_PASSWORD_TEXTO.test(contexto)) {
      score += 120
    }
  }

  if (
    /watch|play\.max\.com|\/pe\/es|suscr[ií]bete|subscribe|browse|movies|series|home|homepage|plans|pricing|help|support/i.test(
      base
    )
  ) {
    score -= 120
  }

  if (
    /iniciar sesi[oó]n|sign in|login|entrar|abrir max|ver pel[ií]culas|watch now/i.test(
      contexto
    ) &&
    !PATRON_PASSWORD_TEXTO.test(contexto)
  ) {
    score -= 90
  }

  if (esLinkBasura(url)) {
    score -= 140
  }

  return score
}

async function fetchConTimeout(url: string, init: RequestInit, timeoutMs = 3500) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timeout)
  }
}

async function obtenerSiguienteRedireccion(url: string) {
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36",
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  }

  for (const method of ["HEAD", "GET"] as const) {
    try {
      const response = await fetchConTimeout(
        url,
        {
          method,
          redirect: "manual",
          headers,
        },
        3500
      )

      const location = response.headers.get("location")

      if (location) {
        return new URL(location, url).toString()
      }

      if (method === "GET") {
        const contentType = response.headers.get("content-type") || ""

        if (contentType.includes("text/html")) {
          const html = await response.text()
          const htmlDecodificado = decodificarTracking(html)

          const matchPassword =
            htmlDecodificado.match(
              /https?:\/\/[^\s"'<>]*(?:set-new-password|new-password|passwordResetToken|reset-password|password-reset|resetpassword|password\/reset|reset\/password|password-reset\/complete|resetpass|forgot-password|account-recovery)[^\s"'<>]*/i
            ) ||
            htmlDecodificado.match(
              /https?:\/\/(?:auth\.hbomax\.com|auth\.max\.com|account\.max\.com|identity\.max\.com|sso\.crunchyroll\.com|accounts\.spotify\.com|login\.tidal\.com|www\.paramountplus\.com|www\.deezer\.com|www\.viki\.com|vix\.com|www\.netflix\.com)\/[^\s"'<>]+/i
            )

          if (matchPassword?.[0]) {
            return limpiarUrl(matchPassword[0])
          }
        }
      }
    } catch {
      // Si falla, se usa el link original si tiene buen contexto.
    }
  }

  return null
}

async function resolverLinkTracking(urlOriginal: string) {
  let actual = limpiarUrl(urlOriginal)

  if (!/^https?:\/\//i.test(actual)) return actual

  for (let intento = 0; intento < 4; intento += 1) {
    const siguiente = await obtenerSiguienteRedireccion(actual)

    if (!siguiente) break

    const limpio = limpiarUrl(siguiente)

    if (!limpio || limpio === actual) break

    actual = limpio

    if (!esLinkTracking(actual)) break
  }

  return actual
}

async function resolverLinksDetectados(links: LinkDetectado[]) {
  const mapa = new Map<string, LinkDetectado>()

  for (const link of links) {
    mapa.set(link.url, link)

    if (!esLinkTracking(link.url)) continue

    const resuelto = await resolverLinkTracking(link.url)

    if (
      resuelto &&
      resuelto !== link.url &&
      /^https?:\/\//i.test(resuelto)
    ) {
      mapa.set(resuelto, {
        url: resuelto,
        contexto: `${link.contexto} ${resuelto}`,
      })
    }
  }

  return Array.from(mapa.values())
}

function seleccionarEnlacePassword(links: LinkDetectado[]) {
  if (!links.length) return null

  const ordenados = [...links]
    .map((link) => ({
      ...link,
      score: puntuarLinkPassword(link),
    }))
    .sort((a, b) => b.score - a.score)

  const mejor = ordenados[0]

  if (mejor && mejor.score >= 70) {
    return mejor.url
  }

  return null
}

function seleccionarEnlacePrincipal(params: {
  links: LinkDetectado[]
  tipo: TipoMensaje
  asunto: string
  cuerpo: string
}) {
  const { links, tipo, asunto, cuerpo } = params
  const base = `${asunto} ${cuerpo}`.toLowerCase()

  if (!links.length) return null
  if (tipo === "codigo") return null

  if (tipo === "password") {
    return seleccionarEnlacePassword(links)
  }

  if (tipo === "enlace") {
    const noTracking = links.filter((link) => !esLinkTracking(link.url))

    return (
      noTracking.find((link) =>
        /verify|verification|activate|activation|confirm|register|signup|sign-up|val|code|token|auth|account/i.test(
          link.url
        )
      )?.url ||
      noTracking[0]?.url ||
      null
    )
  }

  if (PATRON_PASSWORD_TEXTO.test(base)) {
    return seleccionarEnlacePassword(links)
  }

  return null
}

function tituloTelegram(tipo: TipoMensaje) {
  if (tipo === "codigo") return "🔐 Código recibido"
  if (tipo === "password") return "🔑 Enlace de contraseña recibido"
  if (tipo === "cambio_correo") return "📧 Cambio de correo detectado"
  if (tipo === "nuevo_inicio") return "👤 Inicio de sesión detectado"
  if (tipo === "hogar") return "🏠 Aviso de hogar detectado"
  if (tipo === "seguridad") return "⚠️ Aviso de seguridad"
  if (tipo === "enlace") return "🔗 Enlace recibido"
  return "📩 Nuevo mensaje recibido"
}

function detalleEvento(tipo: TipoMensaje, asunto: string, cuerpo: string) {
  const base = `${asunto}\n${cuerpo}`.toLowerCase()

  if (tipo === "codigo") {
    if (/hogar|household|home/i.test(base)) return "Código de hogar"
    if (/inicio de sesi[oó]n|sign[-\s]?in|login|acceso/i.test(base)) {
      return "Código de inicio de sesión"
    }
    if (/verificaci[oó]n|verification/i.test(base)) return "Código de verificación"
    return "Código de acceso"
  }

  if (tipo === "password") {
    if (/restablec|recuper|reset|forgot/i.test(base)) {
      return "Solicitud para restablecer contraseña"
    }

    return "Cambio o gestión de contraseña"
  }

  if (tipo === "cambio_correo") return "Cambio o actualización de correo"
  if (tipo === "nuevo_inicio") return "Nuevo inicio de sesión o nuevo dispositivo"
  if (tipo === "hogar") return "Gestión de hogar o ubicación principal"
  if (tipo === "seguridad") return "Alerta de seguridad"
  if (tipo === "enlace") return "Enlace de acción recibido"

  return "Mensaje informativo"
}

function etiquetaEnlace(tipo: TipoMensaje) {
  if (tipo === "password") return "Restablecer contraseña"
  if (tipo === "enlace") return "Abrir enlace principal"
  return "Abrir enlace"
}

function crearResumen(cuerpo: string, maxLength = 450) {
  const limpio = cuerpo
    .replace(/https?:\/\/[^\s<>"'\]\)]+/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim()

  if (!limpio) return "Sin resumen disponible."

  return limpio.slice(0, maxLength)
}

function formatearFechaPeru(fechaIso: string) {
  try {
    return new Intl.DateTimeFormat("es-PE", {
      dateStyle: "short",
      timeStyle: "short",
      timeZone: "America/Lima",
    }).format(new Date(fechaIso))
  } catch {
    return fechaIso
  }
}

async function construirAlertaTelegram(params: {
  correoDestino: string
  plataforma: string | null
  remitente: string | null
  asunto: string
  cuerpoTexto: string
  cuerpoHtml?: string | null
  fechaMensaje: string
  cliente: ClienteSoporte | null
}) {
  const {
    correoDestino,
    plataforma,
    remitente,
    asunto,
    cuerpoTexto,
    cuerpoHtml,
    fechaMensaje,
    cliente,
  } = params

  const textoCompleto = `${asunto}\n${cuerpoTexto}\n${quitarHtml(cuerpoHtml || "")}`
  const codigo = extraerCodigo(textoCompleto)

  let linksDetectados = filtrarLinksDetectadosImportantes(
    extraerLinksDetectados(cuerpoTexto, cuerpoHtml)
  )

  const tipo = detectarTipoMensaje(asunto, textoCompleto, codigo, linksDetectados)

  if (tipo !== "codigo") {
    linksDetectados = filtrarLinksDetectadosImportantes(
      await resolverLinksDetectados(linksDetectados)
    )
  }

  const plataformaTexto = plataforma || cliente?.plataforma || "No detectada"
  const clienteTexto = cliente?.nombre || "Sin cliente asignado"

  const panelUrl = `https://jonasstream.xyz/soporte-panel/mensajes?correo=${encodeURIComponent(
    correoDestino
  )}`

  const enlacePrincipal = seleccionarEnlacePrincipal({
    links: linksDetectados,
    tipo,
    asunto,
    cuerpo: textoCompleto,
  })

  const partes: string[] = [
    `<b>${escapeHtml(tituloTelegram(tipo))}</b>`,
    "",
    `<b>Tipo:</b> ${escapeHtml(detalleEvento(tipo, asunto, textoCompleto))}`,
    `<b>Plataforma:</b> ${escapeHtml(plataformaTexto)}`,
    `<b>Cliente:</b> ${escapeHtml(clienteTexto)}`,
    `<b>Correo:</b> ${escapeHtml(correoDestino)}`,
    `<b>Asunto:</b> ${escapeHtml(asunto)}`,
    remitente ? `<b>Remitente:</b> ${escapeHtml(remitente)}` : "",
    `<b>Fecha:</b> ${escapeHtml(formatearFechaPeru(fechaMensaje))}`,
  ].filter(Boolean)

  if (tipo === "codigo" && codigo) {
    partes.push("")
    partes.push(`<b>Código:</b> <code>${escapeHtml(codigo)}</code>`)
  }

  if ((tipo === "password" || tipo === "enlace") && enlacePrincipal) {
    partes.push("")
    partes.push(
      `<b>Acción:</b> <a href="${escapeHtml(enlacePrincipal)}">${escapeHtml(
        etiquetaEnlace(tipo)
      )}</a>`
    )
  }

  if (tipo === "password" && !enlacePrincipal) {
    partes.push("")
    partes.push(
      "No se detectó un enlace claro de contraseña. Revisa el mensaje completo en el panel."
    )
  }

  if (
    tipo === "cambio_correo" ||
    tipo === "nuevo_inicio" ||
    tipo === "hogar" ||
    tipo === "seguridad" ||
    tipo === "normal"
  ) {
    partes.push("")
    partes.push("<b>Resumen:</b>")
    partes.push(escapeHtml(crearResumen(cuerpoTexto, 500)))
  }

  partes.push("")
  partes.push(`<b>Panel:</b> <a href="${escapeHtml(panelUrl)}">Ver mensaje en panel</a>`)

  return partes.join("\n").slice(0, 3900)
}

async function enviarTelegram(texto: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    console.warn("Telegram no configurado: falta TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID")
    return
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: texto,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    })

    if (!response.ok) {
      const detalle = await response.text()
      console.error("Telegram respondió error:", response.status, detalle)
    }
  } catch (error) {
    console.error("Error enviando Telegram:", error)
  }
}

export async function POST(request: Request) {
  try {
    const secret = request.headers.get("x-jonas-secret")
    const expectedSecret = process.env.JONAS_WEBHOOK_SECRET

    if (!expectedSecret) {
      console.error("Falta configurar JONAS_WEBHOOK_SECRET")

      return NextResponse.json(
        { ok: false, error: "Falta configurar JONAS_WEBHOOK_SECRET" },
        { status: 500 }
      )
    }

    if (!secret || secret !== expectedSecret) {
      return NextResponse.json(
        { ok: false, error: "No autorizado" },
        { status: 401 }
      )
    }

    let body: PayloadMensaje

    try {
      body = (await request.json()) as PayloadMensaje
    } catch (error) {
      console.error("JSON inválido en recibir-mensaje:", error)

      return NextResponse.json(
        { ok: false, error: "JSON inválido" },
        { status: 400 }
      )
    }

    const correoDestino = normalizarCorreo(body.correo_destino)

    if (!correoDestino) {
      return NextResponse.json(
        { ok: false, error: "Falta correo_destino" },
        { status: 400 }
      )
    }

    const remitente = limpiarTextoSeguro(body.remitente, 500)
    const asunto = limpiarTextoSeguro(body.asunto, 500) || "Sin asunto"
    const cuerpoTexto =
      limpiarTextoSeguro(body.cuerpo_texto, 50000) ||
      "Correo recibido sin cuerpo de texto detectable."
    const cuerpoHtml = limpiarTextoSeguro(body.cuerpo_html, 50000)
    const fechaMensaje = normalizarFecha(body.fecha_mensaje)

    const supabase = getSupabaseAdmin()

    const { data: cliente, error: errorCliente } = await supabase
      .from("soporte_clientes")
      .select("id,nombre,plataforma,correo_asignado,estado")
      .ilike("correo_asignado", correoDestino)
      .maybeSingle()

    if (errorCliente) {
      console.error("Error buscando cliente:", {
        code: errorCliente.code,
        message: errorCliente.message,
        details: errorCliente.details,
        hint: errorCliente.hint,
        correoDestino,
      })

      return NextResponse.json(
        {
          ok: false,
          error: "Error buscando cliente",
          detalle: errorCliente.message,
        },
        { status: 500 }
      )
    }

    const plataformaDetectada = detectarPlataforma(
      correoDestino,
      `${remitente || ""} ${asunto} ${cuerpoTexto} ${quitarHtml(cuerpoHtml || "")}`
    )

    const plataformaFinal =
      limpiarTextoSeguro(body.plataforma, 100) ||
      cliente?.plataforma ||
      plataformaDetectada ||
      null

    const nuevoMensaje = {
      cliente_id: cliente?.id || null,
      correo_destino: correoDestino,
      plataforma: plataformaFinal,
      remitente,
      asunto,
      cuerpo_texto: cuerpoTexto,
      cuerpo_html: cuerpoHtml,
      leido: false,
      fecha_mensaje: fechaMensaje,
    }

    const { data: mensajeInsertado, error: errorInsert } = await supabase
      .from("soporte_mensajes")
      .insert([nuevoMensaje])
      .select("id,correo_destino,asunto,cliente_id")
      .single()

    if (errorInsert) {
      console.error("Error insertando mensaje:", {
        code: errorInsert.code,
        message: errorInsert.message,
        details: errorInsert.details,
        hint: errorInsert.hint,
        correoDestino,
        asunto,
        remitente,
        fechaMensaje,
        cuerpoLength: cuerpoTexto.length,
        htmlLength: cuerpoHtml?.length || 0,
      })

      return NextResponse.json(
        {
          ok: false,
          error: "No se pudo guardar el mensaje",
          detalle: errorInsert.message,
          code: errorInsert.code,
        },
        { status: 500 }
      )
    }

    const alertaTelegram = await construirAlertaTelegram({
      correoDestino,
      plataforma: plataformaFinal,
      remitente,
      asunto,
      cuerpoTexto,
      cuerpoHtml,
      fechaMensaje,
      cliente: cliente as ClienteSoporte | null,
    })

    await enviarTelegram(alertaTelegram)

    return NextResponse.json({
      ok: true,
      mensaje: "Mensaje guardado correctamente",
      data: mensajeInsertado,
      cliente_encontrado: Boolean(cliente),
      telegram: "procesado",
    })
  } catch (error) {
    console.error("Error general en recibir-mensaje:", error)

    return NextResponse.json(
      {
        ok: false,
        error: "Error interno del servidor",
        detalle: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    version: "recibir-mensaje-telegram-plataformas-password-codigo-v9",
    mensaje:
      "API activa. Detecta códigos, links de contraseña por plataforma, cambios de correo, inicios y alertas.",
  })
}
