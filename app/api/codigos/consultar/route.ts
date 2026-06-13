import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

type Cuenta = {
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

function normalizarCorreo(value: unknown) {
  return String(value || "").trim().toLowerCase()
}

function normalizarPin(value: unknown) {
  return String(value || "").trim()
}

function estadoCliente(estado: string) {
  const normalizado = String(estado || "").trim().toLowerCase()

  if (normalizado === "asignada") return "activo"
  if (normalizado === "vencida") return "vencido"
  if (normalizado === "bloqueada") return "bloqueada"
  if (normalizado === "mantenimiento") return "mantenimiento"
  return "disponible"
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)

    const correo = normalizarCorreo(body?.correo)
    const pin = normalizarPin(body?.pin)

    if (!correo || !pin) {
      return NextResponse.json(
        { ok: false, error: "Ingresa el correo y el PIN de consulta." },
        { status: 400 }
      )
    }

    if (!correo.includes("@")) {
      return NextResponse.json(
        { ok: false, error: "Ingresa un correo válido." },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()

    const { data: cuenta, error: errorCuenta } = await supabase
      .from("cuentas")
      .select(
        "id,producto_id,producto_nombre,correo,clave,perfil,pin_perfil,pin_acceso,estado,cliente_id,cliente_nombre,cliente_correo,pedido_id,cliente_inicio,cliente_fin"
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

    const cuentaData = cuenta as Cuenta
    const estadoNormalizado = String(cuentaData.estado || "").trim().toLowerCase()

    if (estadoNormalizado === "bloqueada" || estadoNormalizado === "mantenimiento") {
      return NextResponse.json(
        {
          ok: false,
          error: "Esta cuenta no está disponible para consulta. Contacta con soporte.",
        },
        { status: 403 }
      )
    }

    const correoCuenta = normalizarCorreo(cuentaData.correo)

    const { data: mensajes, error: errorMensajes } = await supabase
      .from("soporte_mensajes")
      .select("*")
      .ilike("correo_destino", correoCuenta)
      .order("fecha_mensaje", { ascending: false })
      .limit(15)

    if (errorMensajes) {
      console.warn("No se pudieron cargar mensajes recientes:", errorMensajes.message)
    }

    return NextResponse.json({
      ok: true,
      cliente: {
        id: cuentaData.id,
        nombre: cuentaData.cliente_nombre || cuentaData.cliente_correo || "Cliente Jonas Stream",
        plataforma: cuentaData.producto_nombre || "Acceso digital",
        correo_asignado: cuentaData.correo,
        clave: cuentaData.clave,
        perfil: cuentaData.perfil || null,
        pin_perfil: cuentaData.pin_perfil || null,
        estado: estadoCliente(cuentaData.estado),
        fecha_inicio: cuentaData.cliente_inicio || null,
        fecha_vencimiento: cuentaData.cliente_fin || null,
      },
      mensajes: errorMensajes ? [] : mensajes || [],
    })
  } catch (error) {
    console.error("Error en consulta de códigos:", error)

    return NextResponse.json(
      { ok: false, error: "Error interno del servidor." },
      { status: 500 }
    )
  }
}
