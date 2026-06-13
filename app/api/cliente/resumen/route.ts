import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function normalizarCorreo(value?: string | null) {
  return String(value || "").trim().toLowerCase();
}

function uniqueById<T extends { id: string }>(items: T[]) {
  return Array.from(new Map(items.map((item) => [item.id, item])).values());
}

async function getCurrentUser(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Faltan variables públicas de Supabase");
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll() {
        // Ruta de solo lectura. No necesita modificar cookies.
      },
    },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return user;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    const { data: usuarioData } = await supabase
      .from("usuarios")
      .select("id,nombre,correo,rol,estado,celular,celular_completo")
      .eq("id", user.id)
      .maybeSingle();

    const usuario =
      usuarioData ||
      ({
        id: user.id,
        nombre: user.user_metadata?.name || user.email?.split("@")[0] || "Cliente",
        correo: user.email || "",
        rol: "cliente",
        estado: "aprobado",
      } as Record<string, unknown>);

    const correoUsuario = normalizarCorreo(String(usuario?.correo || user.email || ""));

    const pedidosQuery = correoUsuario
      ? `usuario_id.eq.${user.id},cliente_correo.eq.${correoUsuario}`
      : `usuario_id.eq.${user.id}`;

    const [pedidosResult, creditosResult] = await Promise.all([
      supabase.from("pedidos").select("*").or(pedidosQuery).order("created_at", { ascending: false }),
      supabase.from("creditos").select("*").eq("usuario_id", user.id).order("created_at", { ascending: false }),
    ]);

    if (pedidosResult.error) throw pedidosResult.error;
    if (creditosResult.error) throw creditosResult.error;

    const pedidos = pedidosResult.data || [];
    const creditos = creditosResult.data || [];
    const pedidoIds = pedidos.map((pedido) => pedido.id).filter(Boolean);

    let soportes: unknown[] = [];
    try {
      const { data } = await supabase
        .from("soporte_tickets")
        .select("*")
        .eq("usuario_id", user.id)
        .order("created_at", { ascending: false });
      soportes = data || [];
    } catch {
      soportes = [];
    }

    const cuentasConsultas = [];

    const cuentaOwnerQuery = correoUsuario
      ? `cliente_id.eq.${user.id},cliente_correo.eq.${correoUsuario}`
      : `cliente_id.eq.${user.id}`;

    cuentasConsultas.push(
      supabase
        .from("cuentas")
        .select("*")
        .or(cuentaOwnerQuery)
        .order("cliente_fin", { ascending: true, nullsFirst: false }),
    );

    if (pedidoIds.length > 0) {
      cuentasConsultas.push(
        supabase
          .from("cuentas")
          .select("*")
          .in("pedido_id", pedidoIds)
          .order("cliente_fin", { ascending: true, nullsFirst: false }),
      );
    }

    const cuentasResults = await Promise.all(cuentasConsultas);
    cuentasResults.forEach((result) => {
      if (result.error) throw result.error;
    });

    const cuentas = uniqueById(cuentasResults.flatMap((result) => result.data || []));

    let pedidoItems: unknown[] = [];
    if (pedidoIds.length > 0) {
      const { data, error } = await supabase.from("pedido_items").select("*").in("pedido_id", pedidoIds);
      if (error) throw error;
      pedidoItems = data || [];
    }

    const productoIds = Array.from(
      new Set(
        [
          ...cuentas.map((cuenta) => cuenta.producto_id).filter(Boolean),
          ...(pedidoItems as { producto_id?: string | null }[]).map((item) => item.producto_id).filter(Boolean),
        ] as string[],
      ),
    );

    let productos: unknown[] = [];
    if (productoIds.length > 0) {
      const { data, error } = await supabase
        .from("productos")
        .select("id,nombre,imagen,categoria,tipo_venta")
        .in("id", productoIds);
      if (error) throw error;
      productos = data || [];
    }

    return NextResponse.json({
      ok: true,
      usuario,
      pedidos,
      pedido_items: pedidoItems,
      productos,
      cuentas,
      creditos,
      soportes,
    });
  } catch (error) {
    console.error("Error cargando resumen cliente:", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Error interno del panel cliente" },
      { status: 500 },
    );
  }
}
