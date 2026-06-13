import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

type PedidoItem = {
  producto_id: string | null
  cantidad: number | null
  precio?: number | null
}

type Producto = {
  id: string
  nombre: string | null
  duracion?: string | null
  duracion_dias?: number | null
  tipo_venta?: string | null
}

type Pedido = {
  id: string
  usuario_id?: string | null
  cliente_nombre?: string | null
  cliente_correo?: string | null
  producto_nombre?: string | null
  estado?: string | null
}

function normalizarTexto(valor?: string | null) {
  return String(valor || "").trim().toLowerCase()
}

function calcularDuracionDias(producto?: Producto | null) {
  const duracionDias = Number(producto?.duracion_dias || 0)
  if (Number.isFinite(duracionDias) && duracionDias > 0) return duracionDias

  const texto = normalizarTexto(producto?.duracion)
  const numeroEncontrado = texto.match(/\d+/)
  const numero = numeroEncontrado ? Number(numeroEncontrado[0]) : 0

  if (!Number.isFinite(numero) || numero <= 0) return 30
  if (texto.includes("año") || texto.includes("ano")) return numero * 365
  if (texto.includes("mes")) return numero * 30
  if (texto.includes("semana")) return numero * 7
  if (texto.includes("día") || texto.includes("dia")) return numero

  return numero
}

function sumarDias(fecha: Date, dias: number) {
  const copia = new Date(fecha)
  copia.setDate(copia.getDate() + dias)
  return copia
}

function estadoProductoPorStock(stock: number) {
  return {
    stock,
    estado_catalogo: stock <= 0 ? "AGOTADO" : stock <= 3 ? "LIMITADO" : "ACTIVO",
    publicacion: stock > 0,
    estado: stock > 0 ? "activo" : "inactivo",
  }
}

async function sincronizarStockProducto(supabase: ReturnType<typeof getSupabaseAdmin>, productoId: string) {
  const { count, error: countError } = await supabase
    .from("cuentas")
    .select("id", { count: "exact", head: true })
    .eq("producto_id", productoId)
    .eq("estado", "disponible")

  if (countError) {
    throw new Error("La cuenta se asignó, pero no se pudo sincronizar el stock del producto")
  }

  const stockReal = Number(count || 0)

  const { error: updateError } = await supabase
    .from("productos")
    .update(estadoProductoPorStock(stockReal))
    .eq("id", productoId)

  if (updateError) {
    throw new Error("La cuenta se asignó, pero no se pudo actualizar productos.stock")
  }

  return stockReal
}

async function buscarProductoPorNombre(supabase: ReturnType<typeof getSupabaseAdmin>, nombre?: string | null) {
  const nombreLimpio = String(nombre || "").trim()
  if (!nombreLimpio) return null

  const { data } = await supabase
    .from("productos")
    .select("id,nombre,duracion,duracion_dias,tipo_venta")
    .ilike("nombre", nombreLimpio)
    .limit(1)
    .maybeSingle()

  if (data) return data as Producto

  const { data: dataFlexible } = await supabase
    .from("productos")
    .select("id,nombre,duracion,duracion_dias,tipo_venta")
    .ilike("nombre", `%${nombreLimpio}%`)
    .limit(1)
    .maybeSingle()

  return (dataFlexible as Producto | null) || null
}

async function obtenerItemsDelPedido(supabase: ReturnType<typeof getSupabaseAdmin>, pedido: Pedido) {
  const { data: items, error } = await supabase
    .from("pedido_items")
    .select("producto_id,cantidad,precio")
    .eq("pedido_id", pedido.id)

  if (!error && items && items.length > 0) {
    return items as PedidoItem[]
  }

  const producto = await buscarProductoPorNombre(supabase, pedido.producto_nombre)
  if (!producto?.id) return []

  return [{ producto_id: producto.id, cantidad: 1 }]
}

async function obtenerProducto(supabase: ReturnType<typeof getSupabaseAdmin>, productoId: string) {
  const { data, error } = await supabase
    .from("productos")
    .select("id,nombre,duracion,duracion_dias,tipo_venta")
    .eq("id", productoId)
    .maybeSingle()

  if (error || !data) return null
  return data as Producto
}

async function asignarPedido(pedidoId: string) {
  const supabase = getSupabaseAdmin()

  const { data: pedidoData, error: pedidoError } = await supabase
    .from("pedidos")
    .select("id,usuario_id,cliente_nombre,cliente_correo,producto_nombre,estado")
    .eq("id", pedidoId)
    .maybeSingle()

  if (pedidoError || !pedidoData) {
    throw new Error("No se encontró el pedido")
  }

  const pedido = pedidoData as Pedido

  if (pedido.estado === "completado") {
    return {
      pedido_id: pedido.id,
      ok: true,
      cuentas_asignadas: 0,
      cuentas: [],
      nota: "El pedido ya estaba completado",
    }
  }

  const items = await obtenerItemsDelPedido(supabase, pedido)

  if (items.length === 0) {
    throw new Error("El pedido no tiene productos vinculados. Revisa pedido_items o producto_nombre")
  }

  const cuentasAsignadas: Array<{
    id: string
    producto_id: string
    producto_nombre: string | null
    correo: string
    cliente_inicio: string
    cliente_fin: string
  }> = []

  const productosSincronizar = new Set<string>()
  const inicio = new Date()

  for (const item of items) {
    const productoId = item.producto_id
    const cantidad = Math.max(1, Number(item.cantidad || 1))

    if (!productoId) {
      throw new Error("Uno de los productos del pedido no tiene producto_id")
    }

    const producto = await obtenerProducto(supabase, productoId)

    if (!producto) {
      throw new Error(`No se encontró el producto ${productoId.slice(0, 8)}`)
    }

    const { data: cuentasDisponibles, error: cuentasError } = await supabase
      .from("cuentas")
      .select("id,correo")
      .eq("producto_id", productoId)
      .eq("estado", "disponible")
      .order("created_at", { ascending: true })
      .limit(cantidad)

    if (cuentasError) {
      throw new Error("No se pudo revisar el inventario de cuentas")
    }

    if (!cuentasDisponibles || cuentasDisponibles.length < cantidad) {
      throw new Error(`No hay cuentas disponibles suficientes para ${producto.nombre || "este producto"}`)
    }

    const duracion = calcularDuracionDias(producto)
    const fin = sumarDias(inicio, duracion)

    for (const cuenta of cuentasDisponibles) {
      const payload = {
        estado: "asignada",
        cliente_id: pedido.usuario_id || null,
        cliente_nombre: pedido.cliente_nombre || null,
        cliente_correo: pedido.cliente_correo || null,
        pedido_id: pedido.id,
        cliente_inicio: inicio.toISOString(),
        cliente_fin: fin.toISOString(),
      }

      const { data: cuentaActualizada, error: updateError } = await supabase
        .from("cuentas")
        .update(payload)
        .eq("id", cuenta.id)
        .eq("estado", "disponible")
        .select("id,producto_id,producto_nombre,correo,cliente_inicio,cliente_fin")
        .maybeSingle()

      if (updateError || !cuentaActualizada) {
        throw new Error("Una cuenta dejó de estar disponible durante la asignación")
      }

      productosSincronizar.add(productoId)

      cuentasAsignadas.push({
        id: cuentaActualizada.id,
        producto_id: cuentaActualizada.producto_id,
        producto_nombre: cuentaActualizada.producto_nombre || producto.nombre,
        correo: cuentaActualizada.correo,
        cliente_inicio: cuentaActualizada.cliente_inicio,
        cliente_fin: cuentaActualizada.cliente_fin,
      })
    }
  }

  for (const productoId of productosSincronizar) {
    await sincronizarStockProducto(supabase, productoId)
  }

  const { error: pedidoUpdateError } = await supabase
    .from("pedidos")
    .update({ estado: "completado" })
    .eq("id", pedido.id)

  if (pedidoUpdateError) {
    throw new Error("Las cuentas se asignaron, pero no se pudo completar el pedido")
  }

  return {
    pedido_id: pedido.id,
    ok: true,
    cuentas_asignadas: cuentasAsignadas.length,
    cuentas: cuentasAsignadas,
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)

    const pedidoIds: string[] = Array.isArray(body?.pedido_ids)
      ? body.pedido_ids.map((item: unknown) => String(item || "").trim()).filter(Boolean)
      : [String(body?.pedido_id || "").trim()].filter(Boolean)

    if (pedidoIds.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Falta el pedido a completar." },
        { status: 400 }
      )
    }

    const resultados = []
    const errores: string[] = []

    for (const pedidoId of pedidoIds) {
      try {
        const resultado = await asignarPedido(pedidoId)
        resultados.push(resultado)
      } catch (error) {
        const mensaje = error instanceof Error ? error.message : "No se pudo asignar la cuenta"
        resultados.push({ pedido_id: pedidoId, ok: false, cuentas_asignadas: 0, error: mensaje })
        errores.push(`#${pedidoId.slice(0, 8)}: ${mensaje}`)
      }
    }

    const pedidosCompletados = resultados.filter((item) => item.ok).length
    const cuentasAsignadas = resultados.reduce((acc, item) => acc + Number(item.cuentas_asignadas || 0), 0)

    if (pedidosCompletados === 0) {
      return NextResponse.json(
        {
          ok: false,
          error: errores[0] || "No se pudo completar ningún pedido.",
          resultados,
          errores,
        },
        { status: 409 }
      )
    }

    return NextResponse.json({
      ok: true,
      pedidos_completados: pedidosCompletados,
      cuentas_asignadas: cuentasAsignadas,
      resultados,
      errores,
    })
  } catch (error) {
    console.error("Error asignando cuentas al pedido:", error)

    return NextResponse.json(
      { ok: false, error: "Error interno al asignar cuentas." },
      { status: 500 }
    )
  }
}
