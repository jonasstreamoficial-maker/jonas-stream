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

type CuentaProducto = {
  id: string;
  producto_id: string;
  correo: string;
  clave: string;
  estado: string;
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

function fechaISO(fecha = new Date()) {
  return fecha.toISOString().slice(0, 10);
}

function sumarDiasISO(dias: number, base = new Date()) {
  const fecha = new Date(base);
  fecha.setDate(fecha.getDate() + dias);
  return fechaISO(fecha);
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

async function verificarCuentasDisponibles(carrito: ReturnType<typeof obtenerCarrito>) {
  for (const item of carrito) {
    const cantidad = Math.max(1, Number(item.cantidad || 1));

    const { data, error } = await supabase
      .from("cuentas_producto")
      .select("id,producto_id,correo,clave,estado")
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
  }
}

async function asignarCuentasAlPedido(
  pedidoId: string,
  usuarioId: string,
  carrito: ReturnType<typeof obtenerCarrito>
) {
  const clienteInicio = fechaISO();
  const clienteFin = sumarDiasISO(30);
  const cuentasAsignadas: CuentaProducto[] = [];

  for (const item of carrito) {
    const cantidad = Math.max(1, Number(item.cantidad || 1));

    const { data, error } = await supabase
      .from("cuentas_producto")
      .select("id,producto_id,correo,clave,estado")
      .eq("producto_id", item.id)
      .eq("estado", "disponible")
      .order("created_at", { ascending: true })
      .limit(cantidad);

    if (error || !data || data.length < cantidad) {
      throw new Error(`${item.nombre} no tiene cuentas suficientes disponibles`);
    }

    const cuentas = data as CuentaProducto[];
    const ids = cuentas.map((cuenta) => cuenta.id);

    const { error: entregaError } = await supabase
      .from("cuentas_producto")
      .update({
        estado: "entregada",
        pedido_id: pedidoId,
        usuario_id: usuarioId,
        cliente_inicio: clienteInicio,
        cliente_fin: clienteFin,
      })
      .in("id", ids);

    if (entregaError) {
      throw new Error(`No se pudo entregar la cuenta de ${item.nombre}`);
    }

    cuentasAsignadas.push(...cuentas);
  }

  return cuentasAsignadas;
}

export async function comprarConCreditos(totalFinal: number, descuento = 0) {
  const usuario = leerUsuarioLocal();
  const carrito = obtenerCarrito();

  if (carrito.length === 0) {
    throw new Error("El carrito está vacío");
  }

  const credito = await obtenerCreditoUsuario();

  if (!credito) {
    throw new Error("No tienes créditos asignados");
  }

  if (credito.estado !== "activo") {
    throw new Error("Tus créditos no están activos");
  }

  const total = Number(totalFinal || 0);
  const saldoActual = Number(credito.saldo || 0);

  if (saldoActual < total) {
    throw new Error("No tienes créditos suficientes");
  }

  // IMPORTANTE:
  // Primero creamos el pedido y sus items para que SIEMPRE llegue al admin.
  // Luego intentamos la entrega automática. Si no hay cuentas disponibles,
  // el pedido queda PENDIENTE para que el admin lo revise/entregue manualmente.
  const { data: pedidoData, error: pedidoError } = await supabase
    .from("pedidos")
    .insert([
      {
        usuario_id: usuario.id,
        cliente_nombre: usuario.nombre,
        cliente_correo: usuario.correo,
        total,
        estado: "pendiente",
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
    throw new Error(itemsError.message || "El pedido se creó, pero falló el detalle");
  }

  let cuentasAsignadas = false;
  let motivoRevision = "";

  try {
    await asignarCuentasAlPedido(pedidoData.id, usuario.id, carrito);
    cuentasAsignadas = true;
  } catch (error) {
    motivoRevision = error instanceof Error ? error.message : "No se pudo asignar cuenta automáticamente";

    try {
      await supabase.rpc("log_admin_action", {
        p_accion: "CREDITOS_PENDIENTE_ENTREGA",
        p_entidad: "pedidos",
        p_entidad_id: pedidoData.id,
        p_detalle: `Pedido con créditos creado, pero requiere revisión: ${motivoRevision}`,
      });
    } catch {
      // El log no debe bloquear el pedido.
    }

    limpiarCarrito();

    return {
      ...pedidoData,
      estado: "pendiente",
      cuentas_asignadas: false,
      requiere_revision: true,
      motivo_revision: motivoRevision,
      saldo_anterior: saldoActual,
      saldo_final: saldoActual,
    };
  }

  if (!cuentasAsignadas) {
    limpiarCarrito();

    return {
      ...pedidoData,
      estado: "pendiente",
      cuentas_asignadas: false,
      requiere_revision: true,
      motivo_revision: "No se pudo asignar cuenta automáticamente",
      saldo_anterior: saldoActual,
      saldo_final: saldoActual,
    };
  }

  const nuevoSaldo = Math.max(saldoActual - total, 0);

  const { error: creditoError } = await supabase
    .from("creditos")
    .update({ saldo: nuevoSaldo })
    .eq("id", credito.id);

  if (creditoError) {
    await supabase.from("pedidos").update({ estado: "pendiente" }).eq("id", pedidoData.id);
    throw new Error("La cuenta fue ubicada, pero no se pudo descontar el crédito. El pedido quedó pendiente para revisión.");
  }

  const { error: completarError } = await supabase
    .from("pedidos")
    .update({ estado: "completado" })
    .eq("id", pedidoData.id);

  if (completarError) {
    throw new Error("Se descontaron créditos, pero no se pudo completar el pedido. Avísale al admin.");
  }

  try {
    await supabase.rpc("log_admin_action", {
      p_accion: "COMPRA_CREDITOS",
      p_entidad: "pedidos",
      p_entidad_id: pedidoData.id,
      p_detalle: `Compra con créditos por S/ ${total.toFixed(2)}. Saldo final: S/ ${nuevoSaldo.toFixed(2)}`,
    });
  } catch {
    // El log no debe bloquear la compra.
  }

  limpiarCarrito();

  return {
    ...pedidoData,
    estado: "completado",
    cuentas_asignadas: true,
    requiere_revision: false,
    motivo_revision: null,
    saldo_anterior: saldoActual,
    saldo_final: nuevoSaldo,
  };
}
