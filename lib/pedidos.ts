import { supabase } from "@/lib/supabase";
import { obtenerCarrito, limpiarCarrito } from "@/lib/carrito";

type UsuarioLocal = {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
  estado: string;
};

export const crearPedido = async (
  metodoPago: string,
  totalFinal?: number,
  descuento: number = 0
) => {
  if (typeof window === "undefined") {
    throw new Error("No disponible en servidor");
  }

  const usuarioGuardado = localStorage.getItem("usuario");

  if (!usuarioGuardado) {
    throw new Error("Debes iniciar sesión para continuar");
  }

  const usuario: UsuarioLocal = JSON.parse(usuarioGuardado);
  const carrito = obtenerCarrito();

  if (carrito.length === 0) {
    throw new Error("El carrito está vacío");
  }

  if (!metodoPago) {
    throw new Error("Selecciona un método de pago");
  }

  const totalCarrito = carrito.reduce((acc, item) => {
    return acc + Number(item.precio || 0) * item.cantidad;
  }, 0);

  const total = typeof totalFinal === "number" ? totalFinal : totalCarrito;

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
        descuento,
      },
    ])
    .select()
    .single();

  if (pedidoError || !pedidoData) {
    console.error("ERROR CREANDO PEDIDO:", pedidoError);
    throw new Error(pedidoError?.message || "No se pudo crear el pedido");
  }

  const itemsPayload = carrito.map((item) => ({
    pedido_id: pedidoData.id,
    producto_id: item.id,
    cantidad: item.cantidad,
    precio: Number(item.precio || 0),
  }));

  const { error: itemsError } = await supabase.from("pedido_items").insert(itemsPayload);

  if (itemsError) {
    console.error("ERROR CREANDO ITEMS DEL PEDIDO:", itemsError);
    throw new Error(itemsError.message || "El pedido se creó, pero falló el detalle");
  }

  limpiarCarrito();

  return pedidoData;
};
