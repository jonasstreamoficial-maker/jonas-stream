import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

type CuentaRow = {
  id: string
  producto_id: string | null
  producto_nombre: string | null
  correo: string
  clave: string
  perfil: string | null
  pin_perfil: string | null
  pin_acceso: string
  estado: string
  cliente_id: string | null
  cliente_nombre: string | null
  cliente_correo: string | null
  pedido_id: string | null
  cliente_inicio: string | null
  cliente_fin: string | null
}

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

    const { data: cuenta, error: errorCuenta } = await supabase
      .from("cuentas")
      .select(
        "id, producto_id, producto_nombre, correo, clave, perfil, pin_perfil, pin_acceso, estado, cliente_id, cliente_nombre, cliente_correo, pedido_id, cliente_inicio, cliente_fin"
      )
      .ilike("correo", correo)
      .eq("pin_acceso", pin)
      .limit(1)
      .maybeSingle()

    if (errorCuenta) {
      console.error("Error validando cuenta:", errorCuenta)

      return NextResponse.json(
        { ok: false, error: "No se pudo validar el acceso." },
        { status: 500 }
      )
    }

    if (!cuenta) {
      return NextResponse.json(
        { ok: false, error: "Correo o PIN incorrecto." },
        { status: 401 }
      )
    }

    const cuentaData = cuenta as CuentaRow
    const estadoCuenta = String(cuentaData.estado || "").toLowerCase()

    if (estadoCuenta === "bloqueada") {
      return NextResponse.json(
        { ok: false, error: "Esta cuenta está bloqueada. Contacta con soporte." },
        { status: 403 }
      )
    }

    const { data: mensajes, error: errorMensajes } = await supabase
      .from("soporte_mensajes")
      .select("*")
      .ilike("correo_destino", cuentaData.correo.toLowerCase())
      .order("fecha_mensaje", { ascending: false })
      .limit(15)

    if (errorMensajes) {
      console.error("Error cargando mensajes:", errorMensajes)

      return NextResponse.json(
        { ok: false, error: "La cuenta fue validada, pero no se pudieron cargar los mensajes." },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      cliente: {
        id: cuentaData.id,
        nombre: cuentaData.cliente_nombre || cuentaData.producto_nombre || "Cliente JONAS STREAM",
        plataforma: cuentaData.producto_nombre || "JONAS STREAM",
        correo_asignado: cuentaData.correo,
        clave: cuentaData.clave,
        perfil: cuentaData.perfil,
        pin_perfil: cuentaData.pin_perfil,
        estado: cuentaData.estado,
        fecha_inicio: cuentaData.cliente_inicio || null,
        fecha_vencimiento: cuentaData.cliente_fin || null,
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
