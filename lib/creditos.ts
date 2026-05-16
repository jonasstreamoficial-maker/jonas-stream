import { supabase } from "@/lib/supabase";
import { obtenerCarrito, limpiarCarrito } from "@/lib/carrito";

export type CreditoUsuario = {
  id: string;
  usuario_id: string;
  saldo: number;
  estado: string;
  created_at?: string | null;
};

type UsuarioLocal = {
  id: string;
  nombre: string;
  correo: string;
  rol?: string;
  estado?: string;
};

export type CuentaEntregada = {
  id: string;
  producto_id: string;
  producto_nombre: string;
  correo: string;
  clave: string;
  cliente_inicio?: string | null;
  cliente_fin?: string | null;
};

function leerUsuarioLocal(): UsuarioLocal {
  if (typeof window === "undefined") {
    throw new Error("No disponible en servidor");
  }

  const usuarioGuardado = window.localStorage.getItem("usuario");

  if (!usuarioGuardado) {
    throw new Error("Debes iniciar sesión para usar créditos");
  }

  return JSON.parse(usuarioGuardado) as UsuarioLocal;
}

function normalizarEstado(value?: string | null) {
  return String(value || "activo").trim().toLowerCase();
}

export async function obtenerCreditoUsuario(): Promise<CreditoUsuario | null> {
  if (typeof window === "undefined") return null;

  const usuarioGuardado = window.localStorage.getItem("usuario");
  if (!usuarioGuardado) return null;

  const usuario = JSON.parse(usuarioGuardado) as UsuarioLocal;

  const { data, error } = await supabase
    .from("creditos")
    .select("*")
    .eq("usuario_id", usuario.id)
    .eq("estado", "activo")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  return {
    ...(data as CreditoUsuario),
    saldo: Number((data as CreditoUsuario).saldo || 0),
    estado: normalizarEstado((data as CreditoUsuario).estado),
  };
}

export async function comprarConCreditos(totalFinal: number, descuento = 0) {
  const usuario = leerUsuarioLocal();
  const carrito = obtenerCarrito();

  if (carrito.length === 0) {
    throw new Error("El carrito está vacío");
  }

  const total = Number(totalFinal || 0);

  if (!Number.isFinite(total) || total <= 0) {
    throw new Error("El total del pedido no es válido");
  }

  const items = carrito.map((item) => ({
    id: item.id,
    producto_id: item.id,
    nombre: item.nombre,
    precio: Number(item.precio || 0),
    cantidad: Math.max(1, Number(item.cantidad || 1)),
  }));

  const { data, error } = await supabase.rpc("comprar_con_creditos_manual", {
    p_usuario_id: usuario.id,
    p_usuario_correo: usuario.correo,
    p_total: total,
    p_descuento: Number(descuento || 0),
    p_items: items,
  });

  if (error) {
    console.error("ERROR COMPRA CRÉDITOS:", error);
    throw new Error(error.message || "No se pudo completar la compra con créditos");
  }

  const respuesta = data as {
    id: string;
    usuario_id: string;
    cliente_nombre: string;
    cliente_correo: string;
    total: number;
    estado: string;
    metodo_pago: string;
    descuento: number;
    cuentas_asignadas: boolean;
    cuentas_entregadas: CuentaEntregada[];
    requiere_revision: boolean;
    motivo_revision: string | null;
    saldo_anterior: number;
    saldo_final: number;
  };

  limpiarCarrito();

  return respuesta;
}
