import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)

    const correo = String(body?.correo || "").trim().toLowerCase()
    const pin = String(body?.pin || "").trim()

    if (!correo || !pin) {
      return NextResponse.json(
        { ok: false, error: "Ingresa el correo y el PIN." },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()

    const { data: cliente, error: errorCliente } = await supabase
      .from("soporte_clientes")
      .select("*")
      .ilike("correo_asignado", correo)
      .eq("pin_acceso", pin)
      .limit(1)
      .maybeSingle()

    if (errorCliente) {
      console.error("Error validando cliente:", errorCliente)

      return NextResponse.json(
        { ok: false, error: "No se pudo validar el acceso." },
        { status: 500 }
      )
    }

    if (!cliente) {
      return NextResponse.json(
        { ok: false, error: "Correo o PIN incorrecto." },
        { status: 401 }
      )
    }

    const estado = String(cliente.estado || "").toLowerCase()

    if (estado !== "activo") {
      return NextResponse.json(
        {
          ok: false,
          error: "Esta cuenta no está activa. Contacta con soporte.",
        },
        { status: 403 }
      )
    }

    const correoAsignado = String(cliente.correo_asignado || "").toLowerCase()

    const { data: mensajes, error: errorMensajes } = await supabase
      .from("soporte_mensajes")
      .select("*")
      .ilike("correo_destino", correoAsignado)
      .order("fecha_mensaje", { ascending: false })
      .limit(15)

    if (errorMensajes) {
      console.error("Error cargando mensajes:", errorMensajes)

      return NextResponse.json(
        { ok: false, error: "No se pudieron cargar los mensajes." },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      cliente: {
        id: cliente.id,
        nombre: cliente.nombre,
        plataforma: cliente.plataforma,
        correo_asignado: cliente.correo_asignado,
        estado: cliente.estado,
        fecha_inicio: cliente.fecha_inicio || null,
        fecha_vencimiento:
          cliente.fecha_vencimiento ||
          cliente.vencimiento ||
          cliente.fecha_fin ||
          null,
      },
      mensajes: mensajes || [],
    })
  } catch (error) {
    console.error("Error en consulta de códigos:", error)

    return NextResponse.json(
      { ok: false, error: "Error interno del servidor." },
      { status: 500 }
    )
  }
}