import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export const runtime = "nodejs"

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

function limpiarUrl(url: string) {
  return decodificarEntidadesBasicas(url)
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

function extraerCodigo(texto: string) {
  const base = texto || ""

  const patronesDirectos = [
    /c[oó]digo detectado:\s*(\d[\d\s-]{2,14}\d)/iu,
    /c[oó]digo.{0,120}?(\d[\d\s-]{2,14}\d)/iu,
    /ingresa.{0,120}?(\d[\d\s-]{2,14}\d)/iu,
    /verification code.{0,120}?(\d[\d\s-]{2,14}\d)/iu,
    /security code.{0,120}?(\d[\d\s-]{2,14}\d)/iu,
  ]

  for (const patron of patronesDirectos) {
    const match = base.match(patron)

    if (match?.[1]) {
      const codigo = match[1].replace(/\D/g, "")

      if (codigo.length >= 4 && codigo.length <= 8) {
        return codigo
      }
    }
  }

  const tieneContextoCodigo =
    /c[oó]digo|code|verificaci[oó]n|verification|inicio de sesi[oó]n|login|acceso/i.test(
      base
    )

  if (!tieneContextoCodigo) return null

  const matchLibre = base.match(/\b(\d(?:[\s-]?\d){3,7})\b/u)

  if (matchLibre?.[1]) {
    const codigo = matchLibre[1].replace(/\D/g, "")

    if (codigo.length >= 4 && codigo.length <= 8) {
      return codigo
    }
  }

  return null
}

function agregarLinkDetectado(
  mapa: Map<string, LinkDetectado>,
  urlOriginal: string,
  contextoOriginal: string
) {
  const url = limpiarUrl(urlOriginal)

  if (!url || !/^https?:\/\//i.test(url)) return

  const contexto = quitarHtml(contextoOriginal || "").slice(0, 700)
  const existente = mapa.get(url)

  if (!existente) {
    mapa.set(url, { url, contexto })
    return
  }

  if (contexto.length > existente.contexto.length) {
    mapa.set(url, { url, contexto })
  }
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
      agregarLinkDetectado(links, hrefMatch[1], hrefMatch[0])
      if (links.size >= 15) break
    }

    const urlRegex = /https?:\/\/[^\s<>"'\]\)]+/gi
    let urlMatch: RegExpExecArray | null

    while ((urlMatch = urlRegex.exec(limpio)) !== null) {
      const inicio = Math.max(0, urlMatch.index - 180)
      const fin = Math.min(limpio.length, urlMatch.index + urlMatch[0].length + 180)
      const contexto = limpio.slice(inicio, fin)

      agregarLinkDetectado(links, urlMatch[0], contexto)

      if (links.size >= 15) break
    }

    if (links.size >= 15) break
  }

  return Array.from(links.values()).slice(0, 15)
}

function extraerLinks(texto: string, html?: string | null) {
  return extraerLinksDetectados(texto, html).map((link) => link.url)
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

function filtrarLinksImportantes(links: string[]) {
  if (!links.length) return []

  const utiles = links.filter((link) => !esLinkBasura(link))

  return utiles.length ? utiles : links
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

function esMaxOHbo(plataforma: string | null) {
  const p = (plataforma || "").toLowerCase()
  return p.includes("max") || p.includes("hbo")
}

function detectarTipoMensaje(
  asunto: string,
  cuerpo: string,
  codigo: string | null,
  links: string[]
) {
  const base = `${asunto}\n${cuerpo}`.toLowerCase()

  if (codigo) return "codigo"

  if (
    /contraseña|password|restablec|recuper|reset|cambiar contraseña|change password|forgot password/.test(
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
    /dispositivo|device|seguridad|security|accedid|nuevo inicio|new sign|login alert|actividad inusual|suspicious/.test(
      base
    )
  ) {
    return "seguridad"
  }

  if (links.length > 0) return "enlace"

  return "normal"
}

function puntuarLinkPassword(link: LinkDetectado, plataforma: string | null) {
  const url = link.url.toLowerCase()
  const contexto = link.contexto.toLowerCase()
  const base = `${url} ${contexto}`

  let score = 0

  if (/contraseña|password|restablec|restablecer|recuper|reset|forgot|change password|cambiar contraseña/.test(contexto)) {
    score += 90
  }

  if (/reset|password|recover|recovery|forgot|change-password|change_password|pwd|loginhelp|account-recovery/.test(url)) {
    score += 80
  }

  if (/auth|identity|account|accounts|signin|login/.test(url)) {
    score += 25
  }

  if (esMaxOHbo(plataforma)) {
    if (/auth\.max\.com|auth\.hbomax\.com|account\.max\.com|identity\.max\.com|wbd|warner|hbo/.test(url)) {
      score += 35
    }

    if (/watch|play\.max\.com|\/sign-in|signin|login|iniciar sesi[oó]n|entrar a max|abrir max/.test(base)) {
      score -= 55
    }
  }

  if (/iniciar sesi[oó]n|sign in|login|entrar|abrir max|watch|play/.test(contexto) && !/contraseña|password|reset|restablec|recuper/.test(contexto)) {
    score -= 50
  }

  if (esLinkBasura(url)) {
    score -= 100
  }

  return score
}

function seleccionarEnlacePrincipal(params: {
  links: string[]
  linksDetectados?: LinkDetectado[]
  tipo: string
  plataforma: string | null
  asunto: string
  cuerpo: string
}) {
  const { links, linksDetectados, tipo, plataforma, asunto, cuerpo } = params

  if (!links.length) return null

  const plataformaLower = (plataforma || "").toLowerCase()
  const base = `${asunto} ${cuerpo}`.toLowerCase()
  const detectados =
    linksDetectados && linksDetectados.length
      ? linksDetectados
      : links.map((url) => ({ url, contexto: base }))

  // Netflix: prioriza enlaces reales de activación/verificación.
  if (plataformaLower.includes("netflix")) {
    return (
      links.find((link) =>
        /netflix\.com\/(val|epr)|nftoken|code=|token=/i.test(link)
      ) || links[0]
    )
  }

  // Para contraseña, no asumir que el primer enlace es el correcto.
  // Esto evita enviar enlaces normales de ingreso cuando se pidió restablecer contraseña.
  if (tipo === "password") {
    const ordenados = [...detectados]
      .map((link) => ({
        ...link,
        score: puntuarLinkPassword(link, plataforma),
      }))
      .sort((a, b) => b.score - a.score)

    const mejor = ordenados[0]

    if (mejor && mejor.score > 0) {
      return mejor.url
    }

    // Si no hay evidencia clara de contraseña, no se manda un enlace falso.
    return null
  }

  // Vix: normalmente el primer enlace es el botón principal.
  if (plataformaLower.includes("vix")) {
    return links[0]
  }

  // Para activar, confirmar, registrar o verificar.
  if (tipo === "enlace") {
    return (
      links.find((link) =>
        /verify|verification|activate|activation|confirm|register|signup|sign-up|val|code|token/i.test(
          link
        )
      ) || links[0]
    )
  }

  if (/reset|password|contraseña|recuper|restablec/.test(base)) {
    return seleccionarEnlacePrincipal({
      links,
      linksDetectados: detectados,
      tipo: "password",
      plataforma,
      asunto,
      cuerpo,
    })
  }

  return links[0]
}

function seleccionarEnlacesTelegram(params: {
  links: string[]
  linksDetectados?: LinkDetectado[]
  tipo: string
  plataforma: string | null
  asunto: string
  cuerpo: string
}) {
  if (!params.links.length) return []

  const principal = seleccionarEnlacePrincipal(params)

  return principal ? [principal] : []
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

function construirAlertaTelegram(params: {
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
  const linksDetectados = filtrarLinksDetectadosImportantes(
    extraerLinksDetectados(cuerpoTexto, cuerpoHtml)
  )
  const links = linksDetectados.map((link) => link.url)
  const tipo = detectarTipoMensaje(asunto, textoCompleto, codigo, links)

  const plataformaTexto = plataforma || cliente?.plataforma || "No detectada"
  const clienteTexto = cliente?.nombre || "Sin cliente asignado"

  const panelUrl = `https://jonasstream.xyz/soporte-panel/mensajes?correo=${encodeURIComponent(
    correoDestino
  )}`

  const enlacesTelegram = seleccionarEnlacesTelegram({
    links,
    linksDetectados,
    tipo,
    plataforma: plataformaTexto,
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

  if ((tipo === "password" || tipo === "enlace") && enlacesTelegram.length > 0) {
    partes.push("")
    partes.push(
      `<b>Acción:</b> <a href="${escapeHtml(enlacesTelegram[0])}">${escapeHtml(
        etiquetaEnlace(tipo)
      )}</a>`
    )
  }

  if (tipo === "password" && enlacesTelegram.length === 0) {
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

    const alertaTelegram = construirAlertaTelegram({
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
    version: "recibir-mensaje-telegram-links-password-seguros-2026-06-14-v5",
    mensaje:
      "API de soporte activa. Telegram ya no asume que el primer enlace de Max/HBO es contraseña.",
  })
}
