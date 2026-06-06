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

function extraerLinks(texto: string) {
  const links = new Set<string>()
  const regex = /https?:\/\/[^\s<>"'\]\)]+/gi
  const matches = texto.match(regex) || []

  for (const match of matches) {
    const url = match.replace(/[)\].,;]+$/g, "").trim()

    if (url && url.startsWith("http")) {
      links.add(url)
    }

    if (links.size >= 10) break
  }

  return Array.from(links)
}

function filtrarLinksImportantes(links: string[]) {
  if (!links.length) return []

  const basura = [
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
  ]

  const utiles = links.filter((link) => {
    const lower = link.toLowerCase()
    return !basura.some((palabra) => lower.includes(palabra))
  })

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

function seleccionarEnlacePrincipal(params: {
  links: string[]
  tipo: string
  plataforma: string | null
  asunto: string
  cuerpo: string
}) {
  const { links, tipo, plataforma, asunto, cuerpo } = params

  if (!links.length) return null

  const plataformaLower = (plataforma || "").toLowerCase()
  const base = `${asunto} ${cuerpo}`.toLowerCase()

  if (plataformaLower.includes("netflix")) {
    return (
      links.find((link) =>
        /netflix\.com\/(val|epr)|nftoken|code=|token=/i.test(link)
      ) || links[0]
    )
  }

  if (plataformaLower.includes("vix")) {
    return links[0]
  }

  if (tipo === "password") {
    return (
      links.find((link) =>
        /reset|password|recover|recovery|change|forgot|pass|pwd/i.test(link)
      ) || links[0]
    )
  }

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
    return links[0]
  }

  return links[0]
}

function seleccionarEnlacesTelegram(params: {
  links: string[]
  tipo: string
  plataforma: string | null
  asunto: string
  cuerpo: string
}) {
  const { links, tipo, plataforma } = params

  if (!links.length) return []

  if (tipo === "password" && esMaxOHbo(plataforma)) {
    return links.slice(0, 3)
  }

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
  fechaMensaje: string
  cliente: ClienteSoporte | null
}) {
  const {
    correoDestino,
    plataforma,
    remitente,
    asunto,
    cuerpoTexto,
    fechaMensaje,
    cliente,
  } = params

  const codigo = extraerCodigo(`${asunto}\n${cuerpoTexto}`)
  const links = filtrarLinksImportantes(extraerLinks(cuerpoTexto))
  const tipo = detectarTipoMensaje(asunto, cuerpoTexto, codigo, links)

  const plataformaTexto = plataforma || cliente?.plataforma || "No detectada"
  const clienteTexto = cliente?.nombre || "Sin cliente asignado"

  const panelUrl = `https://jonasstream.xyz/soporte-panel/mensajes?correo=${encodeURIComponent(
    correoDestino
  )}`

  const enlacesTelegram = seleccionarEnlacesTelegram({
    links,
    tipo,
    plataforma: plataformaTexto,
    asunto,
    cuerpo: cuerpoTexto,
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

    if (tipo === "password" && esMaxOHbo(plataformaTexto) && enlacesTelegram.length > 1) {
      partes.push("<b>Acciones Max/HBO:</b>")
      enlacesTelegram.forEach((link, index) => {
        partes.push(
          `<a href="${escapeHtml(link)}">Opción ${index + 1}</a>`
        )
      })
    } else {
      partes.push(
        `<b>Acción:</b> <a href="${escapeHtml(enlacesTelegram[0])}">${escapeHtml(
          etiquetaEnlace(tipo)
        )}</a>`
      )
    }
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
      `${remitente || ""} ${asunto} ${cuerpoTexto}`
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
    version: "recibir-mensaje-telegram-max-opciones-2026-06-06-v3",
    mensaje: "API de soporte activa con alertas Telegram, enlaces limpios y opciones Max/HBO.",
  })
}