import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

function normalizarCorreo(valor: unknown) {
  return String(valor || "").trim().toLowerCase()
}

function normalizarPin(valor: unknown) {
  return String(valor || "").trim().toUpperCase()
}

function normalizarEstado(valor: unknown) {
  return String(valor || "").trim().toLowerCase()
}

function esFechaVencida(valor: unknown) {
  if (!valor) return false

  const fecha = new Date(String(valor))

  if (Number.isNaN(fecha.getTime())) return false

  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  fecha.setHours(0, 0, 0, 0)

  return fecha.getTime() < hoy.getTime()
}

function estadoCuentaBloquea(estado: unknown) {
  const limpio = normalizarEstado(estado)

  return [
    "bloqueada",
    "bloqueado",
    "mantenimiento",
    "suspendida",
    "suspendido",
    "vencida",
    "vencido",
    "inactiva",
    "inactivo",
    "cancelada",
    "cancelado",
  ].includes(limpio)
}

function mensajeEstado(estado: unknown) {
  const limpio = normalizarEstado(estado)

  if (limpio === "bloqueada" || limpio === "bloqueado") {
    return "Esta cuenta está bloqueada. Contacta con soporte."
  }

  if (limpio === "mantenimiento") {
    return "Esta cuenta está en mantenimiento. Contacta con soporte."
  }

  if (limpio === "suspendida" || limpio === "suspendido") {
    return "Esta cuenta está suspendida. Contacta con soporte."
  }

  if (limpio === "vencida" || limpio === "vencido") {
    return "Esta cuenta está vencida. Contacta con soporte."
  }

  if (
    limpio === "inactiva" ||
    limpio === "inactivo" ||
    limpio === "cancelada" ||
    limpio === "cancelado"
  ) {
    return "Esta cuenta no está activa. Contacta con soporte."
  }

  return "Esta cuenta no está disponible. Contacta con soporte."
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

    const supabase = getSupabaseAdmin()

    /*
      Fuente principal:
      Admin → Cuentas.

      /codigos debe validar primero la tabla cuentas porque ahí está el
      PIN público actual, fechas reales del cliente y estado principal.
    */
    const { data: cuenta, error: errorCuenta } = await supabase
      .from("cuentas")
      .select("*")
      .ilike("correo", correo)
      .eq("pin_acceso", pin)
      .limit(1)
      .maybeSingle()

    if (errorCuenta) {
      console.error("Error consultando tabla cuentas:", errorCuenta)

      return NextResponse.json(
        { ok: false, error: "No se pudo validar el acceso." },
        { status: 500 }
      )
    }

    if (cuenta) {
      const estadoCuenta = normalizarEstado(cuenta.estado)
      const correoCuenta = normalizarCorreo(cuenta.correo)
      const fechaVencimiento = cuenta.cliente_fin || null

      if (estadoCuentaBloquea(estadoCuenta)) {
        return NextResponse.json(
          { ok: false, error: mensajeEstado(estadoCuenta) },
          { status: 403 }
        )
      }

      if (esFechaVencida(fechaVencimiento)) {
        return NextResponse.json(
          { ok: false, error: "Esta cuenta está vencida. Contacta con soporte." },
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
        console.error("Error cargando mensajes:", errorMensajes)

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
          fecha_vencimiento: fechaVencimiento,
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
          cliente_fin: fechaVencimiento,
          observacion_admin: cuenta.observacion_admin,
        },
        mensajes: mensajes || [],
      })
    }

    /*
      Compatibilidad temporal:
      soporte_clientes.

      Se mantiene para correos/PIN antiguos, pero lo correcto ahora es que
      Admin → Cuentas sea la fuente principal.
    */
    const { data: cliente, error: errorCliente } = await supabase
      .from("soporte_clientes")
      .select("*")
      .ilike("correo_asignado", correo)
      .eq("pin_acceso", pin)
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

    const estadoCliente = normalizarEstado(cliente.estado)
    const fechaVencimiento =
      cliente.fecha_vencimiento || cliente.vencimiento || cliente.fecha_fin || null

    if (estadoCliente !== "activo") {
      return NextResponse.json(
        { ok: false, error: mensajeEstado(estadoCliente) },
        { status: 403 }
      )
    }

    if (esFechaVencida(fechaVencimiento)) {
      return NextResponse.json(
        { ok: false, error: "Esta cuenta está vencida. Contacta con soporte." },
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
        fecha_vencimiento: fechaVencimiento,
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
