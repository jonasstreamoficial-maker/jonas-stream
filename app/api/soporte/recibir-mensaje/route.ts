import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

type PayloadMensaje = {
  correo_destino?: string
  correo?: string
  to?: string
  destinatario?: string
  plataforma?: string | null
  remitente?: string | null
  from?: string | null
  asunto?: string | null
  subject?: string | null
  cuerpo_texto?: string | null
  text?: string | null
  mensaje?: string | null
  cuerpo_html?: string | null
  html?: string | null
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

function texto(valor: unknown, maxLength = 10000) {
  return limpiarTextoSeguro(valor, maxLength)
}

function normalizarFecha(valor: unknown) {
  const valorLimpio = limpiarTextoSeguro(valor, 120)

  if (!valorLimpio) return new Date().toISOString()

  const fecha = new Date(valorLimpio)

  if (Number.isNaN(fecha.getTime())) {
    return new Date().toISOString()
  }

  return fecha.toISOString()
}

function detectarPlataforma(correoDestino: string, contenido: string) {
  const base = `${correoDestino} ${contenido}`.toLowerCase()

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
  if (base.includes("surfshark")) return "Surfshark"

  return null
}

function extraerCodigo(contenido: string) {
  const base = contenido || ""

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

function extraerLinks(contenido: string) {
  const links = new Set<string>()
  const regex = /https?:\/\/[^\s<>"'\]\)]+/gi
  const matches = contenido.match(regex) || []

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

  if (tipo === "password" && esMaxOHbo(plataforma)) {
    return links[0]
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
    return [links[0]]
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
    partes.push(
      `<b>Acción:</b> <a href="${escapeHtml(enlacesTelegram[0])}">${escapeHtml(
        etiquetaEnlace(tipo)
      )}</a>`
    )
  }

  if (tipo === "seguridad" || tipo === "normal") {
    partes.push("")
    partes.push("<b>Resumen:</b>")
    partes.push(escapeHtml(crearResumen(cuerpoTexto, tipo === "seguridad" ? 500 : 350)))
  }

  partes.push("")
  partes.push(`<b>Panel:</b> <a href="${escapeHtml(panelUrl)}">Ver mensaje en panel</a>`)

  return partes.join("\n").slice(0, 3900)
}

async function enviarTelegram(contenido: string) {
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
        text: contenido,
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
    const expectedSecret = process.env.JONAS_WEBHOOK_SECRET
    const secret = request.headers.get("x-jonas-secret")

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
      console.error("JSON inválido en recibir mensaje:", error)

      return NextResponse.json(
        { ok: false, error: "JSON inválido." },
        { status: 400 }
      )
    }

    const correoDestino = normalizarCorreo(
      body.correo_destino || body.correo || body.to || body.destinatario
    )

    if (!correoDestino) {
      return NextResponse.json(
        { ok: false, error: "Falta correo_destino." },
        { status: 400 }
      )
    }

    const remitente = texto(body.remitente || body.from, 320)
    const asunto = texto(body.asunto || body.subject, 500) || "Sin asunto"
    const cuerpoTexto = texto(body.cuerpo_texto || body.text || body.mensaje, 20000) || ""
    const cuerpoHtml = texto(body.cuerpo_html || body.html, 50000)
    const fechaMensaje = normalizarFecha(body.fecha_mensaje)

    const supabase = getSupabaseAdmin()

    // 1. Fuente principal: Admin → Cuentas.
    const { data: cuenta, error: errorCuenta } = await supabase
      .from("cuentas")
      .select(
        "id,producto_nombre,correo,cliente_nombre,cliente_correo,pin_acceso,cliente_inicio,cliente_fin,estado"
      )
      .ilike("correo", correoDestino)
      .limit(1)
      .maybeSingle()

    if (errorCuenta) {
      console.error("Error buscando cuenta para mensaje:", errorCuenta)
    }

    // 2. Soporte panel legacy/sincronizado.
    // Aunque exista en cuentas, igual buscamos soporte_clientes para guardar cliente_id correctamente.
    const { data: clienteLegacy, error: errorClienteLegacy } = await supabase
      .from("soporte_clientes")
      .select(
        "id,nombre,plataforma,correo_asignado,estado,pin_acceso,fecha_inicio,fecha_vencimiento"
      )
      .ilike("correo_asignado", correoDestino)
      .limit(1)
      .maybeSingle()

    if (errorClienteLegacy) {
      console.error("Error buscando soporte_clientes para mensaje:", errorClienteLegacy)
    }

    const plataforma =
      texto(body.plataforma, 160) ||
      texto(cuenta?.producto_nombre, 160) ||
      texto(clienteLegacy?.plataforma, 160) ||
      detectarPlataforma(correoDestino, `${asunto}\n${cuerpoTexto}`) ||
      "Sin plataforma"

    const clienteParaTelegram: ClienteSoporte | null = clienteLegacy
      ? {
          id: clienteLegacy.id,
          nombre: clienteLegacy.nombre,
          plataforma: clienteLegacy.plataforma,
          correo_asignado: clienteLegacy.correo_asignado,
          estado: clienteLegacy.estado,
        }
      : cuenta
        ? {
            id: cuenta.id,
            nombre: cuenta.cliente_nombre || cuenta.producto_nombre || "Cliente",
            plataforma: cuenta.producto_nombre || "Cuenta asignada",
            correo_asignado: cuenta.correo,
            estado: cuenta.estado,
          }
        : null

    const payload = {
      // cliente_id queda ligado a soporte_clientes, no a cuentas.
      // Si el trigger de sincronización ya creó el registro, aquí se guarda relacionado.
      cliente_id: clienteLegacy?.id || null,
      correo_destino: correoDestino,
      plataforma,
      remitente,
      asunto,
      cuerpo_texto: cuerpoTexto,
      cuerpo_html: cuerpoHtml,
      leido: false,
      fecha_mensaje: fechaMensaje,
    }

    const { data: mensajeInsertado, error: errorInsert } = await supabase
      .from("soporte_mensajes")
      .insert([payload])
      .select("*")
      .single()

    if (errorInsert) {
      console.error("Error guardando mensaje de soporte:", errorInsert)

      return NextResponse.json(
        { ok: false, error: "No se pudo guardar el mensaje." },
        { status: 500 }
      )
    }

    const alertaTelegram = construirAlertaTelegram({
      correoDestino,
      plataforma,
      remitente,
      asunto,
      cuerpoTexto,
      fechaMensaje,
      cliente: clienteParaTelegram,
    })

    await enviarTelegram(alertaTelegram)

    return NextResponse.json({
      ok: true,
      mensaje: mensajeInsertado,
      match: cuenta
        ? {
            origen: "cuentas",
            cuenta_id: cuenta.id,
            producto_nombre: cuenta.producto_nombre,
            correo: cuenta.correo,
            estado: cuenta.estado,
            pin_acceso: cuenta.pin_acceso,
            fecha_inicio: cuenta.cliente_inicio,
            fecha_vencimiento: cuenta.cliente_fin,
            soporte_cliente_id: clienteLegacy?.id || null,
          }
        : clienteLegacy
          ? {
              origen: "soporte_clientes",
              cliente_id: clienteLegacy.id,
              plataforma: clienteLegacy.plataforma,
              correo: clienteLegacy.correo_asignado,
              estado: clienteLegacy.estado,
              pin_acceso: clienteLegacy.pin_acceso,
              fecha_inicio: clienteLegacy.fecha_inicio,
              fecha_vencimiento: clienteLegacy.fecha_vencimiento,
            }
          : {
              origen: "sin_registro",
              correo: correoDestino,
            },
    })
  } catch (error) {
    console.error("Error en recibir mensaje de soporte:", error)

    return NextResponse.json(
      { ok: false, error: "Error interno del servidor." },
      { status: 500 }
    )
  }
}
