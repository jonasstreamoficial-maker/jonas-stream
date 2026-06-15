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

  return null
}

function esNumeroPareceFecha(codigo: string) {
  // Evita falsos códigos como 20260615 sacados de fechas.
  if (/^20\d{6}$/.test(codigo)) return true
  if (/^\d{8}$/.test(codigo)) {
    const yyyy = Number(codigo.slice(0, 4))
    const mm = Number(codigo.slice(4, 6))
    const dd = Number(codigo.slice(6, 8))

    if (yyyy >= 2020 && yyyy <= 2099 && mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31) {
      return true
    }
  }

  return false
}

function codigoValido(valor: string) {
  const codigo = valor.replace(/\D/g, "")

  if (codigo.length < 4 || codigo.length > 8) return null
  if (esNumeroPareceFecha(codigo)) return null

  return codigo
}

function extraerCodigo(texto: string) {
  const base = texto || ""

  // Solo acepta números cuando están cerca de palabras de código.
  // Esto evita tomar fechas como 20260615 en avisos de inicio de sesión.
  const patronesDirectos = [
    /c[oó]digo detectado:\s*(\d[\d\s-]{2,14}\d)/iu,
    /c[oó]digo.{0,140}?(\d[\d\s-]{2,14}\d)/iu,
    /ingresa.{0,140}?(\d[\d\s-]{2,14}\d)/iu,
    /verification code.{0,140}?(\d[\d\s-]{2,14}\d)/iu,
    /security code.{0,140}?(\d[\d\s-]{2,14}\d)/iu,
    /one[-\s]?time code.{0,140}?(\d[\d\s-]{2,14}\d)/iu,
    /sign[-\s]?in code.{0,140}?(\d[\d\s-]{2,14}\d)/iu,
    /login code.{0,140}?(\d[\d\s-]{2,14}\d)/iu,
    /access code.{0,140}?(\d[\d\s-]{2,14}\d)/iu,
    /c[oó]digo de acceso.{0,140}?(\d[\d\s-]{2,14}\d)/iu,
  ]

  for (const patron of patronesDirectos) {
    const match = base.match(patron)

    if (match?.[1]) {
      const codigo = codigoValido(match[1])
      if (codigo) return codigo
    }
  }

  return null
}

function contextoIndicaPassword(valor: string) {
  return /contraseña|password|restablec|restablecer|recuper|reset|forgot|change password|cambiar contraseña|set new password|nueva contraseña|password reset/i.test(
    valor
  )
}

function agregarLinkDetectado(
  mapa: Map<string, LinkDetectado>,
  urlOriginal: string,
  contextoOriginal: string
) {
  const url = limpiarUrl(urlOriginal)

  if (!url || !/^https?:\/\//i.test(url)) return

  const contexto = quitarHtml(contextoOriginal || "").slice(0, 900)
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
      agregarLinkDetectado(links, url, hrefMatch[0])

      const reales = extraerUrlRealDesdeParametros(url)

      for (const real of reales) {
        agregarLinkDetectado(links, real, hrefMatch[0])
      }

      if (links.size >= 30) break
    }

    const urlRegex = /https?:\/\/[^\s<>"'\]\)]+/gi
    let urlMatch: RegExpExecArray | null

    while ((urlMatch = urlRegex.exec(limpio)) !== null) {
      const inicio = Math.max(0, urlMatch.index - 260)
      const fin = Math.min(limpio.length, urlMatch.index + urlMatch[0].length + 260)
      const contexto = limpio.slice(inicio, fin)
      const url = limpiarUrl(urlMatch[0])

      agregarLinkDetectado(links, url, contexto)

      const reales = extraerUrlRealDesdeParametros(url)

      for (const real of reales) {
        agregarLinkDetectado(links, real, contexto)
      }

      if (links.size >= 30) break
    }

    if (links.size >= 30) break
  }

  return Array.from(links.values()).slice(0, 30)
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

function escapeHtml(valor: string | null | undefined) {
  if (!valor) return ""

  return valor
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

function detectarTipoMensaje(
  asunto: string,
  cuerpo: string,
  codigo: string | null,
  links: LinkDetectado[]
) {
  const base = `${asunto}\n${cuerpo}`.toLowerCase()

  // Regla principal:
  // Si hay código numérico, se responde código y NO se manda link.
  if (codigo) return "codigo"

  if (
    /contraseña|password|restablec|recuper|reset|cambiar contraseña|change password|forgot password|set new password|establecer contraseña|nueva contraseña/.test(
      base
    )
  ) {
    return "password"
  }

  if (
    links.length > 0 &&
    /crear cuenta|crea tu cuenta|activar|activación|activate|verify|verificar|confirmar|registro|sign up|signup|enlace|link/.test(
      base
    )
  ) {
    return "enlace"
  }

  if (
    /dispositivo|device|seguridad|security|accedid|nuevo inicio|new sign|login alert|actividad inusual|suspicious|hogar|household|home/.test(
      base
    )
  ) {
    return "seguridad"
  }

  if (links.length > 0) return "enlace"

  return "normal"
}

function puntuarLinkPassword(link: LinkDetectado) {
  const url = link.url.toLowerCase()
  const contexto = link.contexto.toLowerCase()
  const base = `${url} ${contexto}`

  let score = 0

  // Señales fuertes: estas sí son de contraseña.
  if (
    /passwordresettoken|set-new-password|reset-password|password-reset|change-password|forgot-password|account-recovery|loginhelp|recover|recovery|forgotten-password/.test(
      url
    )
  ) {
    score += 160
  }

  if (
    /contraseña|password|restablec|restablecer|recuper|reset|forgot|change password|cambiar contraseña|set new password|nueva contraseña/.test(
      contexto
    )
  ) {
    score += 90
  }

  if (
    /auth\.hbomax\.com|auth\.max\.com|account\.max\.com|identity\.max\.com|auth\.disney|netflix\.com\/password|amazon\..*\/ap\/forgotpassword|crunchyroll\..*password|canva\..*password/.test(
      url
    )
  ) {
    score += 90
  }

  if (/auth|identity|account|accounts|login/.test(url)) {
    score += 30
  }

  // Señales de link incorrecto para contraseña.
  if (
    /watch|play\.max\.com|\/pe\/es|suscr[ií]bete|subscribe|browse|movies|series|home|homepage|plans|pricing/.test(
      base
    )
  ) {
    score -= 110
  }

  if (
    /iniciar sesi[oó]n|sign in|login|entrar|abrir max|ver pel[ií]culas|watch now/.test(
      contexto
    ) &&
    !/contraseña|password|reset|restablec|recuper/.test(contexto)
  ) {
    score -= 80
  }

  // Tracking genérico: se resuelve antes; si queda tracking, no debe ganar salvo que sea clarísimo.
  if (esLinkTracking(url)) {
    score -= 140
  }

  if (esLinkBasura(url)) {
    score -= 130
  }

  return score
}

async function fetchConTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = 4500
) {
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
        4500
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
              /https?:\/\/(?:auth\.hbomax\.com|auth\.max\.com|account\.max\.com|identity\.max\.com)\/[^\s"'<>]+/i
            ) ||
            htmlDecodificado.match(
              /https?:\/\/[^\s"'<>]*(?:set-new-password|passwordResetToken|reset-password|password-reset|change-password|forgot-password|account-recovery)[^\s"'<>]*/i
            )

          if (matchPassword?.[0]) {
            return limpiarUrl(matchPassword[0])
          }
        }
      }
    } catch {
      // Si falla HEAD/GET, se intenta con el siguiente método o se conserva el link original.
    }
  }

  return null
}

async function resolverLinkTracking(urlOriginal: string) {
  let actual = limpiarUrl(urlOriginal)

  if (!/^https?:\/\//i.test(actual)) return actual

  for (let intento = 0; intento < 5; intento += 1) {
    const siguiente = await obtenerSiguienteRedireccion(actual)

    if (!siguiente) break

    const limpio = limpiarUrl(siguiente)

    if (!limpio || limpio === actual) break

    actual = limpio

    if (!esLinkTracking(actual)) {
      break
    }
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

function seleccionarEnlacePrincipal(params: {
  links: LinkDetectado[]
  tipo: string
  asunto: string
  cuerpo: string
}) {
  const { links, tipo, asunto, cuerpo } = params

  if (!links.length) return null

  const base = `${asunto} ${cuerpo}`.toLowerCase()

  if (tipo === "codigo") {
    return null
  }

  if (tipo === "password") {
    const ordenados = [...links]
      .map((link) => ({
        ...link,
        score: puntuarLinkPassword(link),
      }))
      .sort((a, b) => b.score - a.score)

    const mejor = ordenados[0]

    // 1) Link real de contraseña: auth, reset, passwordResetToken, etc.
    if (mejor && mejor.score >= 60) {
      return mejor.url
    }

    // 2) Respaldo práctico:
    // Algunas plataformas mandan el enlace real detrás de tracking
    // y Vercel no siempre puede resolverlo. Si el asunto/cuerpo y
    // el contexto del botón dicen contraseña, mandamos ese tracking.
    const trackingPassword = ordenados.find((link) => {
      const contexto = `${asunto} ${link.contexto}`
      return (
        esLinkTracking(link.url) &&
        contextoIndicaPassword(contexto) &&
        !esLinkBasura(link.url)
      )
    })

    if (trackingPassword) {
      return trackingPassword.url
    }

    // 3) Último respaldo: si todo el correo es de contraseña y solo
    // existe un link importante, se envía ese link en vez de ocultarlo.
    if (contextoIndicaPassword(base) && links.length === 1 && !esLinkBasura(links[0].url)) {
      return links[0].url
    }

    return null
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

  if (/reset|password|contraseña|recuper|restablec/.test(base)) {
    return seleccionarEnlacePrincipal({
      links,
      tipo: "password",
      asunto,
      cuerpo,
    })
  }

  return null
}

function etiquetaEnlace(tipo: string) {
  if (tipo === "password") return "Abrir enlace de contraseña"
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

  // Si es código, no resolvemos ni enviamos links.
  // Esto evita que mensajes de login/hogar muestren enlaces innecesarios.
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

  let titulo = "📩 Nuevo mensaje recibido"

  if (tipo === "codigo") titulo = "🔐 Código recibido"
  if (tipo === "password") titulo = "🔑 Enlace de contraseña recibido"
  if (tipo === "enlace") titulo = "🔗 Enlace recibido"
  if (tipo === "seguridad") titulo = "⚠️ Aviso de seguridad"

  const partes: string[] = [
    `<b>${escapeHtml(titulo)}</b>`,
    "",
    `<b>Plataforma:</b> ${escapeHtml(plataformaTexto)}`,
    `<b>Correo:</b> ${escapeHtml(correoDestino)}`,
    `<b>Cliente:</b> ${escapeHtml(clienteTexto)}`,
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
      "No se detectó un enlace seguro de contraseña. Revisa el mensaje completo en el panel."
    )
  }

  if (tipo === "seguridad") {
    partes.push("")
    partes.push("<b>Resumen:</b>")
    partes.push(escapeHtml(crearResumen(cuerpoTexto, 500)))
  }

  if (tipo === "normal") {
    partes.push("")
    partes.push("<b>Resumen:</b>")
    partes.push(escapeHtml(crearResumen(cuerpoTexto, 350)))
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
      .eq("correo_asignado", correoDestino)
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
    version: "recibir-mensaje-password-fallback-tracking-v8",
    mensaje:
      "API activa. Si es código, envía solo código. Si es contraseña, prioriza link real y usa tracking solo si el contexto es de contraseña.",
  })
}
