import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function destinoPorRol(rol?: string | null) {
  if (rol === "admin") return "/admin";
  if (rol === "proveedor") return "/proveedor";
  return "/cliente";
}

function respuestaApiNoAutorizada(mensaje: string, status = 401) {
  return NextResponse.json(
    {
      ok: false,
      error: mensaje,
    },
    { status }
  );
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) return response;

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const rutaPanel =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/cliente") ||
    pathname.startsWith("/proveedor");

  const rutaApiEditorPrivada =
    pathname.startsWith("/api/editor-web/portada") ||
    pathname.startsWith("/api/editor-web/upload");

  const rutaPrivada = rutaPanel || rutaApiEditorPrivada;

  if (rutaPrivada && !user) {
    if (rutaApiEditorPrivada) {
      return respuestaApiNoAutorizada("No autorizado", 401);
    }

    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (!user) return response;

  const { data: perfil } = await supabase
    .from("usuarios")
    .select("rol,estado")
    .eq("id", user.id)
    .maybeSingle();

  const aprobado = perfil?.estado === "aprobado" || perfil?.estado === "activo";

  if (rutaPrivada && (!perfil || !aprobado)) {
    if (rutaApiEditorPrivada) {
      return respuestaApiNoAutorizada("Usuario no autorizado o pendiente de aprobación", 403);
    }

    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("estado", "pendiente");
    return NextResponse.redirect(url);
  }

  if (rutaApiEditorPrivada && perfil?.rol !== "admin") {
    return respuestaApiNoAutorizada("Solo administrador", 403);
  }

  if (rutaPanel && perfil) {
    const destino = destinoPorRol(perfil.rol);

    if (pathname.startsWith("/admin") && perfil.rol !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = destino;
      return NextResponse.redirect(url);
    }

    if (
      pathname.startsWith("/proveedor") &&
      perfil.rol !== "proveedor" &&
      perfil.rol !== "admin"
    ) {
      const url = request.nextUrl.clone();
      url.pathname = destino;
      return NextResponse.redirect(url);
    }

    if (
      pathname.startsWith("/cliente") &&
      perfil.rol !== "cliente" &&
      perfil.rol !== "admin"
    ) {
      const url = request.nextUrl.clone();
      url.pathname = destino;
      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith("/login") && perfil && aprobado) {
    const url = request.nextUrl.clone();
    url.pathname = destinoPorRol(perfil.rol);
    return NextResponse.redirect(url);
  }

  return response;
}