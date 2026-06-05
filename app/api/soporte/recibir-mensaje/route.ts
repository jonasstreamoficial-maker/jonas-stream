import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export const runtime = "nodejs"

type PayloadMensaje = {
  correo_destino?: string
  plataforma?: string
  remitente?: string
  asunto?: string
  cuerpo_texto?: string
  cuerpo_html?: string
  fecha_mensaje?: string
}

export async function POST(request: Request) {
  try {
    const secret = request.headers.get("x-jonas-secret")
    const expectedSecret = process.env.JONAS_WEBHOOK_SECRET

    if (!expectedSecret) {
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

    const body = (await request.json()) as PayloadMensaje

    const correoDestino = body.correo_destino?.trim().toLowerCase()

    if (!correoDestino) {
      return NextResponse.json(
        { ok: false, error: "Falta correo_destino" },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()

    const { data: cliente, error: errorCliente } = await supabase
      .from("soporte_clientes")
      .select("id,nombre,plataforma,correo_asignado,estado")
      .eq("correo_asignado", correoDestino)
      .maybeSingle()

    if (errorCliente) {
      return NextResponse.json(
        { ok: false, error: "Error buscando cliente" },
        { status: 500 }
      )
    }

    const plataformaFinal =
      body.plataforma?.trim() || cliente?.plataforma || null

    const { data: mensajeInsertado, error: errorInsert } = await supabase
      .from("soporte_mensajes")
      .insert([
        {
          cliente_id: cliente?.id || null,
          correo_destino: correoDestino,
          plataforma: plataformaFinal,
          remitente: body.remitente?.trim() || null,
          asunto: body.asunto?.trim() || "Sin asunto",
          cuerpo_texto: body.cuerpo_texto || null,
          cuerpo_html: body.cuerpo_html || null,
          leido: false,
          fecha_mensaje: body.fecha_mensaje || new Date().toISOString(),
        },
      ])
      .select("id,correo_destino,asunto,cliente_id")
      .single()

    if (errorInsert) {
      return NextResponse.json(
        { ok: false, error: "No se pudo guardar el mensaje" },
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
    console.error("Error en recibir-mensaje:", error)

    return NextResponse.json(
      { ok: false, error: "Error interno del servidor" },
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