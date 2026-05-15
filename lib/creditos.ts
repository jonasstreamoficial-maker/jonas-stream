import { supabase } from "@/lib/supabase";
import { obtenerCarrito, limpiarCarrito } from "@/lib/carrito";

export type CreditoUsuario = {
  id: string;
  usuario_id: string;
  saldo: number;
  estado: string;
  created_at?: string | null;
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

type UsuarioActual = {
  id: string;
  nombre: string;
  correo: string;
  rol?: string;
  estado?: string;
};

type CompraCreditosRespuesta = {
  id: string;
  usuario_id?: string | null;
  cliente_nombre?: string | null;
  cliente_correo?: string | null;
  total?: number | null;
  estado?: string | null;
  metodo_pago?: string | null;
  descuento?: number | null;
  cuentas_asignadas?: boolean;
  cuentas_entregadas?: CuentaEntregada[];
  requiere_revision?: boolean;
  motivo_revision?: string | null;
  saldo_anterior?: number;
  saldo_final?: number;
};

async function obtenerUsuarioActual(): Promise<UsuarioActual> {
  if (typeof window === "undefined") {
    throw new Error("No disponible en servidor");
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Debes iniciar sesión para usar créditos");
  }

  const { data: usuarioData } = await supabase
    .from("usuarios")
    .select("id,nombre,correo,rol,estado")
    .eq("id", user.id)
    .maybeSingle();

  const usuario: UsuarioActual = {
    id: user.id,
    nombre:
      (usuarioData as any)?.nombre ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "Cliente",
    correo: (usuarioData as any)?.correo || user.email || "",
    rol: (usuarioData as any)?.rol || "cliente",
    estado: (usuarioData as any)?.estado || "aprobado",
  };

  try {
    window.localStorage.setItem("usuario", JSON.stringify(usuario));
  } catch {
    // No bloquea la compra.
  }

  return usuario;
}

export async function obtenerCreditoUsuario(): Promise<CreditoUsuario | null> {
  if (typeof window === "undefined") return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("creditos")
    .select("*")
    .eq("usuario_id", user.id)
    .order("created_at", { ascending: false });

  if (error || !data || data.length === 0) return null;

  const creditos = data as CreditoUsuario[];
  const activos = creditos.filter(
    (credito) => String(credito.estado || "activo").toLowerCase() === "activo",
  );

  const saldoActivo = activos.reduce((acc, credito) => acc + Number(credito.saldo || 0), 0);
  const ultimo = creditos[0];

  return {
    ...ultimo,
    id: ultimo.id,
    usuario_id: user.id,
    saldo: saldoActivo,
    estado: activos.length > 0 ? "activo" : String(ultimo.estado || "inactivo").toLowerCase(),
  };
}

export async function comprarConCreditos(totalFinal: number, descuento = 0): Promise<CompraCreditosRespuesta> {
  await obtenerUsuarioActual();

  const carrito = obtenerCarrito();

  if (carrito.length === 0) {
    throw new Error("El carrito está vacío");
  }

  const total = Number(totalFinal || 0);

  if (total <= 0) {
    throw new Error("El total del pedido no es válido");
  }

  const items = carrito.map((item) => ({
    id: item.id,
    producto_id: item.id,
    nombre: item.nombre,
    precio: Number(item.precio || 0),
    cantidad: Math.max(1, Number(item.cantidad || 1)),
  }));

  const { data, error } = await supabase.rpc("comprar_con_creditos", {
    p_total: total,
    p_descuento: Number(descuento || 0),
    p_items: items,
  });

  if (error) {
    throw new Error(error.message || "No se pudo completar la compra con créditos");
  }

  const respuesta = data as CompraCreditosRespuesta | null;

  if (!respuesta?.id) {
    throw new Error("La compra con créditos no devolvió un pedido válido");
  }

  limpiarCarrito();

  return {
    ...respuesta,
    estado: "completado",
    metodo_pago: "Créditos",
    cuentas_asignadas: respuesta.cuentas_asignadas ?? true,
    cuentas_entregadas: Array.isArray(respuesta.cuentas_entregadas)
      ? respuesta.cuentas_entregadas
      : [],
    requiere_revision: false,
    motivo_revision: null,
  };
}
