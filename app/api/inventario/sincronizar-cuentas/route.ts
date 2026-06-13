import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

type Producto = {
  id: string
  nombre?: string | null
}

type Cuenta = {
  producto_id: string | null
  estado: string | null
}

function estadoProductoPorStock(stock: number) {
  return {
    stock,
    estado_catalogo: stock <= 0 ? "AGOTADO" : stock <= 3 ? "LIMITADO" : "ACTIVO",
    publicacion: stock > 0,
    estado: stock > 0 ? "activo" : "inactivo",
  }
}

export async function POST() {
  try {
    const supabase = getSupabaseAdmin()

    const { data: productos, error: productosError } = await supabase
      .from("productos")
      .select("id,nombre")

    if (productosError) {
      return NextResponse.json(
        { ok: false, error: "No se pudieron cargar productos", detalle: productosError.message },
        { status: 500 }
      )
    }

    const { data: cuentas, error: cuentasError } = await supabase
      .from("cuentas")
      .select("producto_id,estado")

    if (cuentasError) {
      return NextResponse.json(
        { ok: false, error: "No se pudieron cargar cuentas", detalle: cuentasError.message },
        { status: 500 }
      )
    }

    const conteoDisponibles = new Map<string, number>()

    for (const cuenta of (cuentas || []) as Cuenta[]) {
      if (!cuenta.producto_id) continue
      if (String(cuenta.estado || "").toLowerCase() !== "disponible") continue
      conteoDisponibles.set(cuenta.producto_id, (conteoDisponibles.get(cuenta.producto_id) || 0) + 1)
    }

    let productosActualizados = 0
    let totalDisponibles = 0
    const resultados: Array<{ producto_id: string; nombre?: string | null; stock: number; ok: boolean; error?: string }> = []

    for (const producto of (productos || []) as Producto[]) {
      const stockReal = conteoDisponibles.get(producto.id) || 0
      totalDisponibles += stockReal

      const { error: updateError } = await supabase
        .from("productos")
        .update(estadoProductoPorStock(stockReal))
        .eq("id", producto.id)

      if (updateError) {
        resultados.push({ producto_id: producto.id, nombre: producto.nombre, stock: stockReal, ok: false, error: updateError.message })
        continue
      }

      productosActualizados += 1
      resultados.push({ producto_id: producto.id, nombre: producto.nombre, stock: stockReal, ok: true })
    }

    return NextResponse.json({
      ok: true,
      productos_actualizados: productosActualizados,
      total_disponibles: totalDisponibles,
      resultados,
    })
  } catch (error) {
    console.error("Error sincronizando inventario desde cuentas:", error)

    return NextResponse.json(
      { ok: false, error: "Error interno sincronizando inventario desde cuentas" },
      { status: 500 }
    )
  }
}
