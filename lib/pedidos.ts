import { supabase } from "@/lib/supabase"
import { obtenerCarrito, limpiarCarrito } from "@/lib/carrito"

type UsuarioLocal = {
  id: string
  nombre: string
  correo: string
  rol: string
  estado: string
}

export const crearPedido = async (metodoPago: string = "pendiente") => {
  if (typeof window === "undefined") {
    throw new Error("No disponible en servidor")
  }

  const usuarioGuardado = localStorage.getItem("usuario")
  if (!usuarioGuardado) {
    throw new Error("Debes iniciar sesión para continuar")
  }

  const usuario: UsuarioLocal = JSON.parse(usuarioGuardado)
  const carrito = obtenerCarrito()

  if (carrito.length === 0) {
    throw new Error("El carrito está vacío")
  }

  const total = carrito.reduce((acc, item) => {
    return acc + item.precio * item.cantidad
  }, 0)

  const { data: pedidoData, error: pedidoError } = await supabase
    .from("pedidos")
    .insert([
      {
        usuario_id: usuario.id,
        cliente_nombre: usuario.nombre,
        cliente_correo: usuario.correo,
        total,
        estado: "pendiente",
        metodo_pago: metodoPago,
      },
    ])
    .select()
    .single()

  if (pedidoError || !pedidoData) {
    throw new Error("No se pudo crear el pedido")
  }

  const itemsPayload = carrito.map((item) => ({
    pedido_id: pedidoData.id,
    producto_id: item.id,
    cantidad: item.cantidad,
    precio: item.precio,
  }))

  const { error: itemsError } = await supabase
    .from("pedido_items")
    .insert(itemsPayload)

  if (itemsError) {
    throw new Error("El pedido se creó, pero falló el detalle")
  }

  limpiarCarrito()

  return pedidoData
}