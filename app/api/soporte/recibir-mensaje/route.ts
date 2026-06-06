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
  const correo = limpiarTextoSeguro(valor, 320)?.toLowerCase() || ""

  return correo
}

function normalizarFecha(valor: unknown) {
  const texto = limpiarTextoSeguro(valor, 120)

  if (!texto) {
    return new Date().toISOString()
  }

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

  return null
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

    return NextResponse.json({
      ok: true,
      mensaje: "Mensaje guardado correctamente",
      data: mensajeInsertado,
      cliente_encontrado: Boolean(cliente),
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
    mensaje: "API de soporte activa. Usa POST para registrar mensajes.",
  })
}