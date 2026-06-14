import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

function normalizarCorreo(valor: unknown) {
  return String(valor || "").trim().toLowerCase()
}

function normalizarPin(valor: unknown) {
  return String(valor || "").trim().toUpperCase().replace(/\s+/g, "")
}

function pinValido(pin: string) {
  return /^[A-Z0-9-]{3,32}$/.test(pin)
}

function estadoCuentaPermiteAcceso(estado: string) {
  const limpio = estado.toLowerCase().trim()
  return ["asignada", "entregada", "activo", "activa"].includes(limpio)
}

function mensajeEstadoCuenta(estado: string) {
  const limpio = estado.toLowerCase().trim()

  if (limpio === "bloqueada" || limpio === "bloqueado") {
    return "Esta cuenta está bloqueada. Contacta con soporte."
  }

  if (limpio === "mantenimiento") {
    return "Esta cuenta está en mantenimiento. Contacta con soporte."
  }

  if (limpio === "vencida" || limpio === "vencido") {
    return "Esta cuenta está vencida. Contacta con soporte."
  }

  if (limpio === "disponible") {
    return "Esta cuenta aún no está asignada a un cliente. Contacta con soporte."
  }

  return "Esta cuenta no está activa. Contacta con soporte."
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)

    const correo = normalizarCorreo(body?.correo)
    const pin = normalizarPin(body?.pin)

    if (!correo || !pin) {
      return NextResponse.json(
        { ok: false, error: "Ingresa el correo y el PIN." },
        { status: 400 }
      )
    }

    if (!pinValido(pin)) {
      return NextResponse.json(
        { ok: false, error: "El PIN ingresado no tiene un formato válido." },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()

    // 1. Sistema principal: Admin → Cuentas.
    // Aquí viven el PIN, las fechas, la clave, el perfil y el estado real.
    const { data: cuenta, error: errorCuenta } = await supabase
      .from("cuentas")
      .select("*")
      .ilike("correo", correo)
      .ilike("pin_acceso", pin)
      .limit(1)
      .maybeSingle()

    if (errorCuenta) {
      console.error("Error consultando tabla cuentas:", errorCuenta)
    }

    if (cuenta) {
      const estadoCuenta = String(cuenta.estado || "").toLowerCase()
      const correoCuenta = normalizarCorreo(cuenta.correo)

      if (!estadoCuentaPermiteAcceso(estadoCuenta)) {
        return NextResponse.json(
          { ok: false, error: mensajeEstadoCuenta(estadoCuenta) },
          { status: 403 }
        )
      }

      const { data: mensajes, error: errorMensajes } = await supabase
        .from("soporte_mensajes")
        .select("*")
        .ilike("correo_destino", correoCuenta)
        .order("fecha_mensaje", { ascending: false })
        .limit(15)

      if (errorMensajes) {
        console.error("Error cargando mensajes desde cuentas:", errorMensajes)

        return NextResponse.json(
          { ok: false, error: "No se pudieron cargar los mensajes." },
          { status: 500 }
        )
      }

      return NextResponse.json({
        ok: true,
        origen: "cuentas",
        cliente: {
          id: cuenta.id,
          nombre: cuenta.cliente_nombre || cuenta.producto_nombre || "Cliente",
          plataforma: cuenta.producto_nombre || "Cuenta asignada",
          correo_asignado: cuenta.correo,
          estado: cuenta.estado,
          fecha_inicio: cuenta.cliente_inicio || null,
          fecha_vencimiento: cuenta.cliente_fin || null,

          clave: cuenta.clave,
          perfil: cuenta.perfil,
          pin_perfil: cuenta.pin_perfil,
          pin_acceso: cuenta.pin_acceso,
          producto_nombre: cuenta.producto_nombre,
          cliente_nombre: cuenta.cliente_nombre,
          cliente_correo: cuenta.cliente_correo,
          pedido_id: cuenta.pedido_id,
        },
        cuenta: {
          id: cuenta.id,
          producto_id: cuenta.producto_id,
          producto_nombre: cuenta.producto_nombre,
          correo: cuenta.correo,
          clave: cuenta.clave,
          perfil: cuenta.perfil,
          pin_perfil: cuenta.pin_perfil,
          pin_acceso: cuenta.pin_acceso,
          estado: cuenta.estado,
          cliente_id: cuenta.cliente_id,
          cliente_nombre: cuenta.cliente_nombre,
          cliente_correo: cuenta.cliente_correo,
          pedido_id: cuenta.pedido_id,
          cliente_inicio: cuenta.cliente_inicio,
          cliente_fin: cuenta.cliente_fin,
          observacion_admin: cuenta.observacion_admin,
        },
        mensajes: mensajes || [],
      })
    }

    // 2. Respaldo antiguo: soporte_clientes.
    // Esto mantiene vivos los correos/PIN que ya tenías antes del inventario por Admin → Cuentas.
    const { data: cliente, error: errorCliente } = await supabase
      .from("soporte_clientes")
      .select("*")
      .ilike("correo_asignado", correo)
      .ilike("pin_acceso", pin)
      .limit(1)
      .maybeSingle()

    if (errorCliente) {
      console.error("Error validando cliente legacy:", errorCliente)

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
        { ok: false, error: "Esta cuenta no está activa. Contacta con soporte." },
        { status: 403 }
      )
    }

    const correoAsignado = normalizarCorreo(cliente.correo_asignado)

    const { data: mensajes, error: errorMensajes } = await supabase
      .from("soporte_mensajes")
      .select("*")
      .ilike("correo_destino", correoAsignado)
      .order("fecha_mensaje", { ascending: false })
      .limit(15)

    if (errorMensajes) {
      console.error("Error cargando mensajes legacy:", errorMensajes)

      return NextResponse.json(
        { ok: false, error: "No se pudieron cargar los mensajes." },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      origen: "soporte_clientes",
      cliente: {
        id: cliente.id,
        nombre: cliente.nombre,
        plataforma: cliente.plataforma,
        correo_asignado: cliente.correo_asignado,
        estado: cliente.estado,
        fecha_inicio: cliente.fecha_inicio || null,
        fecha_vencimiento:
          cliente.fecha_vencimiento || cliente.vencimiento || cliente.fecha_fin || null,
        pin_acceso: cliente.pin_acceso || null,
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
