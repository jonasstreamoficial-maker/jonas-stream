import { NextResponse } from "next/server"

export const runtime = "nodejs"

type TelegramChat = {
  id: number | string
  type?: string
  username?: string
  first_name?: string
  last_name?: string
}

type TelegramMessage = {
  message_id?: number
  text?: string
  chat?: TelegramChat
  from?: {
    id?: number | string
    is_bot?: boolean
    first_name?: string
    last_name?: string
    username?: string
  }
}

type TelegramUpdate = {
  update_id?: number
  message?: TelegramMessage
  edited_message?: TelegramMessage
}

const PANEL_URL = "https://jonasstream.xyz/soporte-panel/mensajes"
const DASHBOARD_URL = "https://jonasstream.xyz/soporte-panel/dashboard"
const CODIGOS_URL = "https://jonasstream.xyz/codigos"

function escapeHtml(valor: string | number | null | undefined) {
  if (valor === null || valor === undefined) return ""

  return String(valor)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

async function enviarMensajeTelegram(params: {
  chatId: string | number
  text: string
  replyMarkup?: Record<string, unknown>
}) {
  const token = process.env.TELEGRAM_BOT_TOKEN

  if (!token) {
    console.error("Falta TELEGRAM_BOT_TOKEN")
    return
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: params.chatId,
      text: params.text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
      reply_markup: params.replyMarkup,
    }),
  })

  if (!response.ok) {
    const detalle = await response.text()
    console.error("Error enviando mensaje Telegram:", response.status, detalle)
  }
}

function obtenerComando(texto: string) {
  const limpio = texto.trim().toLowerCase()

  const comando = limpio.split(/\s+/)[0] || ""

  return comando.split("@")[0]
}

function tecladoPrincipal() {
  return {
    inline_keyboard: [
      [
        { text: "📩 Ver panel", url: PANEL_URL },
        { text: "🔐 Consulta códigos", url: CODIGOS_URL },
      ],
      [
        { text: "📊 Dashboard", url: DASHBOARD_URL },
      ],
    ],
  }
}

async function responderComando(chat: TelegramChat, textoOriginal: string) {
  const chatId = chat.id
  const comando = obtenerComando(textoOriginal)

  if (comando === "/start") {
    await enviarMensajeTelegram({
      chatId,
      text:
        `<b>JONAS STREAM Alertas</b>\n\n` +
        `Bot interno activo.\n\n` +
        `Desde aquí puedes consultar accesos rápidos del sistema y recibir alertas administrativas de códigos, enlaces, seguridad y vencimientos.`,
      replyMarkup: tecladoPrincipal(),
    })

    return
  }

  if (comando === "/info") {
    const username = chat.username ? `@${chat.username}` : "Sin username"

    await enviarMensajeTelegram({
      chatId,
      text:
        `<b>Información de Telegram</b>\n\n` +
        `<b>Chat ID:</b> <code>${escapeHtml(chat.id)}</code>\n` +
        `<b>Tipo:</b> ${escapeHtml(chat.type || "private")}\n` +
        `<b>Usuario:</b> ${escapeHtml(username)}\n\n` +
        `Este ID sirve para configurar alertas privadas del bot.`,
    })

    return
  }

  if (comando === "/panel") {
    await enviarMensajeTelegram({
      chatId,
      text: `<b>Panel de soporte</b>\n\nAcceso directo al panel privado de mensajes.`,
      replyMarkup: {
        inline_keyboard: [[{ text: "📩 Abrir panel", url: PANEL_URL }]],
      },
    })

    return
  }

  if (comando === "/codigos") {
    await enviarMensajeTelegram({
      chatId,
      text: `<b>Consulta de códigos</b>\n\nAcceso público para clientes con correo asignado y PIN.`,
      replyMarkup: {
        inline_keyboard: [[{ text: "🔐 Abrir consulta de códigos", url: CODIGOS_URL }]],
      },
    })

    return
  }

  if (comando === "/estado") {
    await enviarMensajeTelegram({
      chatId,
      text:
        `<b>Estado del bot</b>\n\n` +
        `Bot: <b>Activo</b>\n` +
        `Webhook: <b>Operativo</b>\n` +
        `Alertas Telegram: <b>Configuradas</b>\n` +
        `Panel: <b>Disponible</b>\n\n` +
        `Fecha de revisión: ${escapeHtml(
          new Intl.DateTimeFormat("es-PE", {
            dateStyle: "short",
            timeStyle: "short",
            timeZone: "America/Lima",
          }).format(new Date())
        )}`,
      replyMarkup: tecladoPrincipal(),
    })

    return
  }

  if (comando === "/vencimientos") {
    await enviarMensajeTelegram({
      chatId,
      text:
        `<b>Vencimientos</b>\n\n` +
        `Este módulo todavía no está conectado.\n\n` +
        `Siguiente mejora sugerida: consultar cuentas próximas a vencer desde Supabase y enviarlas aquí automáticamente.`,
    })

    return
  }

  if (comando === "/ayuda") {
    await enviarMensajeTelegram({
      chatId,
      text:
        `<b>Ayuda JONAS STREAM Alertas</b>\n\n` +
        `<b>Comandos disponibles:</b>\n\n` +
        `/start - Iniciar bot\n` +
        `/info - Ver tu Telegram ID\n` +
        `/panel - Abrir panel de soporte\n` +
        `/codigos - Abrir consulta de códigos\n` +
        `/estado - Ver estado del bot\n` +
        `/vencimientos - Ver vencimientos próximos\n\n` +
        `Este bot es interno y solo debe usarse para administración.`,
      replyMarkup: tecladoPrincipal(),
    })

    return
  }

  await enviarMensajeTelegram({
    chatId,
    text:
      `<b>Comando no reconocido</b>\n\n` +
      `Usa /ayuda para ver los comandos disponibles.`,
  })
}

export async function POST(request: Request) {
  try {
    const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET
    const receivedSecret = request.headers.get("x-telegram-bot-api-secret-token")

    if (expectedSecret && receivedSecret !== expectedSecret) {
      return NextResponse.json(
        { ok: false, error: "No autorizado" },
        { status: 401 }
      )
    }

    const update = (await request.json()) as TelegramUpdate
    const mensaje = update.message || update.edited_message

    if (!mensaje?.chat?.id) {
      return NextResponse.json({ ok: true, ignored: true })
    }

    const texto = mensaje.text?.trim()

    if (!texto) {
      return NextResponse.json({ ok: true, ignored: true })
    }

    await responderComando(mensaje.chat, texto)

    return NextResponse.json({
      ok: true,
      processed: true,
    })
  } catch (error) {
    console.error("Error en webhook Telegram:", error)

    return NextResponse.json(
      {
        ok: false,
        error: "Error interno del webhook",
        detalle: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    version: "telegram-webhook-jonas-2026-06-06-v1",
    mensaje: "Webhook Telegram activo.",
  })
}