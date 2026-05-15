import { supabase } from "@/lib/supabase";
import { obtenerCarrito, limpiarCarrito } from "@/lib/carrito";

export type CreditoUsuario = {
  id: string;
  usuario_id: string;
  saldo: number;
  estado: string;
  created_at?: string | null;
};

type UsuarioActual = {
  id: string;
  nombre: string;
  correo: string;
  rol?: string;
  estado?: string;
};

type CuentaProducto = {
  id: string;
  producto_id: string;
  correo: string;
  clave: string;
  estado: string;
  cliente_inicio?: string | null;
  cliente_fin?: string | null;
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

function fechaISO(fecha = new Date()) {
  return fecha.toISOString().slice(0, 10);
}

function sumarDiasISO(dias: number, base = new Date()) {
  const fecha = new Date(base);
  fecha.setDate(fecha.getDate() + dias);
  return fechaISO(fecha);
}

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
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  return {
    ...(data as CreditoUsuario),
    saldo: Number((data as CreditoUsuario).saldo || 0),
    estado: String((data as CreditoUsuario).estado || "activo").toLowerCase(),
  };
}

async function obtenerCuentasDisponiblesPorCarrito(
  carrito: ReturnType<typeof obtenerCarrito>,
) {
  const resultado = new Map<string, CuentaProducto[]>();

  for (const item of carrito) {
    const cantidad = Math.max(1, Number(item.cantidad || 1));

    const { data, error } = await supabase
      .from("cuentas_producto")
      .select("id,producto_id,correo,clave,estado,cliente_inicio,cliente_fin")
      .eq("producto_id", item.id)
      .eq("estado", "disponible")
      .order("created_at", { ascending: true })
      .limit(cantidad);

    if (error) {
      throw new Error(`No se pudo consultar cuentas disponibles para ${item.nombre}`);
    }

    if (!data || data.length < cantidad) {
      throw new Error(`${item.nombre} no tiene cuentas suficientes disponibles`);
    }

    resultado.set(item.id, data as CuentaProducto[]);
  }

  return resultado;
}

export async function comprarConCreditos(totalFinal: number, descuento = 0) {
  const usuario = await obtenerUsuarioActual();
  const carrito = obtenerCarrito();

  if (carrito.length === 0) {
    throw new Error("El carrito está vacío");
  }

  const total = Number(totalFinal || 0);
  if (total <= 0) {
    throw new Error("El total del pedido no es válido");
  }

  const credito = await obtenerCreditoUsuario();

  if (!credito) {
    throw new Error("No tienes créditos asignados");
  }

  if (credito.estado !== "activo") {
    throw new Error("Tus créditos no están activos");
  }

  const saldoActual = Number(credito.saldo || 0);
  if (saldoActual < total) {
    throw new Error("No tienes créditos suficientes");
  }

  // Compra por créditos es automática: si no hay cuentas disponibles, NO se crea compra pendiente.
  const cuentasPorProducto = await obtenerCuentasDisponiblesPorCarrito(carrito);
  const nuevoSaldo = Math.max(saldoActual - total, 0);

  const { data: pedidoData, error: pedidoError } = await supabase
    .from("pedidos")
    .insert([
      {
        usuario_id: usuario.id,
        cliente_nombre: usuario.nombre,
        cliente_correo: usuario.correo,
        total,
        estado: "completado",
        metodo_pago: "Créditos",
        descuento,
      },
    ])
    .select()
    .single();

  if (pedidoError || !pedidoData) {
    throw new Error(pedidoError?.message || "No se pudo crear el pedido con créditos");
  }

  const itemsPayload = carrito.map((item) => ({
    pedido_id: pedidoData.id,
    producto_id: item.id,
    cantidad: item.cantidad,
    precio: Number(item.precio || 0),
  }));

  const { error: itemsError } = await supabase.from("pedido_items").insert(itemsPayload);

  if (itemsError) {
    await supabase.from("pedidos").delete().eq("id", pedidoData.id);
    throw new Error(itemsError.message || "El pedido se creó, pero falló el detalle");
  }

  const { error: creditoError } = await supabase
    .from("creditos")
    .update({ saldo: nuevoSaldo })
    .eq("id", credito.id);

  if (creditoError) {
    await supabase.from("pedido_items").delete().eq("pedido_id", pedidoData.id);
    await supabase.from("pedidos").delete().eq("id", pedidoData.id);
    throw new Error("No se pudo descontar el crédito. No se completó la compra.");
  }

  const clienteInicio = fechaISO();
  const clienteFin = sumarDiasISO(30);
  const cuentasEntregadas: CuentaEntregada[] = [];

  for (const item of carrito) {
    const cuentas = cuentasPorProducto.get(item.id) || [];
    const ids = cuentas.map((cuenta) => cuenta.id);

    const { error: entregaError } = await supabase
      .from("cuentas_producto")
      .update({
        estado: "entregada",
        pedido_id: pedidoData.id,
        usuario_id: usuario.id,
        cliente_inicio: clienteInicio,
        cliente_fin: clienteFin,
      })
      .in("id", ids);

    if (entregaError) {
      // Revertimos saldo si la entrega falla.
      await supabase.from("creditos").update({ saldo: saldoActual }).eq("id", credito.id);
      await supabase.from("pedidos").update({ estado: "pendiente" }).eq("id", pedidoData.id);
      throw new Error(`No se pudo entregar la cuenta de ${item.nombre}. No se descontaron créditos.`);
    }

    cuentasEntregadas.push(
      ...cuentas.map((cuenta) => ({
        id: cuenta.id,
        producto_id: cuenta.producto_id,
        producto_nombre: item.nombre,
        correo: cuenta.correo,
        clave: cuenta.clave,
        cliente_inicio: clienteInicio,
        cliente_fin: clienteFin,
      })),
    );
  }

  try {
    await supabase.rpc("log_admin_action", {
      p_accion: "COMPRA_CREDITOS_AUTOMATICA",
      p_entidad: "pedidos",
      p_entidad_id: pedidoData.id,
      p_detalle: `Compra automática con créditos por S/ ${total.toFixed(2)}. Saldo final: S/ ${nuevoSaldo.toFixed(2)}. Cuentas entregadas: ${cuentasEntregadas.length}`,
    });
  } catch {
    // El log no debe bloquear la compra.
  }

  limpiarCarrito();

  return {
    ...pedidoData,
    estado: "completado",
    cuentas_asignadas: true,
    cuentas_entregadas: cuentasEntregadas,
    requiere_revision: false,
    motivo_revision: null,
    saldo_anterior: saldoActual,
    saldo_final: nuevoSaldo,
  };
}
