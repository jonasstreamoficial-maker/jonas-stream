import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

type Cuenta = Record<string, any>
type ClienteLegacy = Record<string, any>

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

  const fechaTexto = String(valor)

  // Si viene como YYYY-MM-DD, se compara solo por fecha para evitar problemas de hora.
  const soloFecha = fechaTexto.match(/^(\d{4})-(\d{2})-(\d{2})/)

  const fecha = soloFecha
    ? new Date(
        Number(soloFecha[1]),
        Number(soloFecha[2]) - 1,
        Number(soloFecha[3])
      )
    : new Date(fechaTexto)

  if (Number.isNaN(fecha.getTime())) return false

  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  fecha.setHours(0, 0, 0, 0)

  return fecha.getTime() < hoy.getTime()
}

function estadoPermitidoParaCodigos(estado: unknown) {
  const limpio = normalizarEstado(estado)

  return [
    "asignada",
    "asignado",
    "entregada",
    "entregado",
    "activa",
    "activo",
    "vendida",
    "vendido",
  ].includes(limpio)
}

function mensajeEstado(estado: unknown) {
  const limpio = normalizarEstado(estado)

  if (limpio === "disponible" || limpio === "libre") {
    return "Esta cuenta todavía no está asignada a un cliente."
  }

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

  if (!limpio) {
    return "Esta cuenta no tiene estado válido. Contacta con soporte."
  }

  return "Esta cuenta no está disponible. Contacta con soporte."
}

async function cargarMensajesPorCorreo(correo: string) {
  const supabase = getSupabaseAdmin()

  return supabase
    .from("soporte_mensajes")
    .select("*")
    .ilike("correo_destino", correo)
    .order("fecha_mensaje", { ascending: false })
    .limit(15)
}

function construirRespuestaCuenta(cuenta: Cuenta, mensajes: any[]) {
  const fechaVencimiento = cuenta.cliente_fin || null

  return {
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
      cliente_nombre: cuenta.cliente_nombre,
      cliente_correo: cuenta.cliente_correo,
      cliente_inicio: cuenta.cliente_inicio,
      cliente_fin: fechaVencimiento,
    },
    mensajes: mensajes || [],
  }
}

function construirRespuestaLegacy(cliente: ClienteLegacy, mensajes: any[]) {
  const fechaVencimiento =
    cliente.fecha_vencimiento || cliente.vencimiento || cliente.fecha_fin || null

  return {
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
  }
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

      Esta ruta ahora:
      - valida el PIN sin importar mayúsculas/minúsculas;
      - bloquea cuentas disponibles/libres;
      - evita que un PIN antiguo de soporte_clientes permita entrar si ya existe en cuentas;
      - solo permite estados realmente asignados/activos.
    */
    const { data: cuentas, error: errorCuentas } = await supabase
      .from("cuentas")
      .select("*")
      .ilike("correo", correo)
      .limit(10)

    if (errorCuentas) {
      console.error("Error consultando tabla cuentas:", errorCuentas)

      return NextResponse.json(
        { ok: false, error: "No se pudo validar el acceso." },
        { status: 500 }
      )
    }

    if (cuentas && cuentas.length > 0) {
      const cuenta = cuentas.find(
        (item) => normalizarPin(item.pin_acceso) === pin
      )

      if (!cuenta) {
        return NextResponse.json(
          { ok: false, error: "Correo o PIN incorrecto." },
          { status: 401 }
        )
      }

      const estadoCuenta = normalizarEstado(cuenta.estado)
      const correoCuenta = normalizarCorreo(cuenta.correo)
      const fechaVencimiento = cuenta.cliente_fin || null

      if (!estadoPermitidoParaCodigos(estadoCuenta)) {
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

      const { data: mensajes, error: errorMensajes } =
        await cargarMensajesPorCorreo(correoCuenta)

      if (errorMensajes) {
        console.error("Error cargando mensajes:", errorMensajes)

        return NextResponse.json(
          { ok: false, error: "No se pudieron cargar los mensajes." },
          { status: 500 }
        )
      }

      return NextResponse.json(construirRespuestaCuenta(cuenta, mensajes || []))
    }

    /*
      Compatibilidad temporal:
      soporte_clientes.

      Solo se usa si NO existe ese correo en Admin → Cuentas.
      Si el correo ya existe en cuentas, no se permite entrar con PIN antiguo.
    */
    const { data: clientesLegacy, error: errorCliente } = await supabase
      .from("soporte_clientes")
      .select("*")
      .ilike("correo_asignado", correo)
      .limit(10)

    if (errorCliente) {
      console.error("Error validando cliente legacy:", errorCliente)

      return NextResponse.json(
        { ok: false, error: "No se pudo validar el acceso." },
        { status: 500 }
      )
    }

    const cliente = (clientesLegacy || []).find(
      (item) => normalizarPin(item.pin_acceso) === pin
    )

    if (!cliente) {
      return NextResponse.json(
        { ok: false, error: "Correo o PIN incorrecto." },
        { status: 401 }
      )
    }

    const estadoCliente = normalizarEstado(cliente.estado)
    const fechaVencimiento =
      cliente.fecha_vencimiento || cliente.vencimiento || cliente.fecha_fin || null

    if (estadoCliente !== "activo" && estadoCliente !== "activa") {
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

    const { data: mensajes, error: errorMensajes } =
      await cargarMensajesPorCorreo(correoAsignado)

    if (errorMensajes) {
      console.error("Error cargando mensajes legacy:", errorMensajes)

      return NextResponse.json(
        { ok: false, error: "No se pudieron cargar los mensajes." },
        { status: 500 }
      )
    }

    return NextResponse.json(construirRespuestaLegacy(cliente, mensajes || []))
  } catch (error) {
    console.error("Error en consulta de códigos:", error)

    return NextResponse.json(
      { ok: false, error: "Error interno del servidor." },
      { status: 500 }
    )
  }
}
