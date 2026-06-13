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

    // Nuevo sistema: inventario de cuentas registrado desde Admin > Cuentas.
    const { data: cuenta, error: errorCuenta } = await supabase
      .from("cuentas")
      .select("*, productos(tipo_venta, duracion, duracion_dias)")
      .ilike("correo", correo)
      .eq("pin_acceso", pin)
      .limit(1)
      .maybeSingle()

    if (errorCuenta) {
      console.error("Error consultando tabla cuentas:", errorCuenta)
    }

    if (cuenta) {
      const estadoCuenta = String(cuenta.estado || "").toLowerCase()
      const correoCuenta = String(cuenta.correo || "").toLowerCase()
      const productoRelacionado = Array.isArray(cuenta.productos)
        ? cuenta.productos[0]
        : cuenta.productos
      const tipoVenta = productoRelacionado?.tipo_venta || null

      if (estadoCuenta === "bloqueada") {
        return NextResponse.json(
          { ok: false, error: "Esta cuenta está bloqueada. Contacta con soporte." },
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
          tipo_venta: tipoVenta,
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
          tipo_venta: tipoVenta,
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
        origen: "cuentas",
      })
    }

    // Sistema anterior: conserva soporte_clientes + soporte_mensajes.
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
        { ok: false, error: "Esta cuenta no está activa. Contacta con soporte." },
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
      origen: "soporte_clientes",
    })
  } catch (error) {
    console.error("Error en consulta de códigos:", error)

    return NextResponse.json(
      { ok: false, error: "Error interno del servidor." },
      { status: 500 }
    )
  }
}
