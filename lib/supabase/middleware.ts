import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) return response

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value)
        })

        response = NextResponse.next({ request })

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const rutaPrivada =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/cliente") ||
    pathname.startsWith("/proveedor")

  if (rutaPrivada && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  if (pathname.startsWith("/login") && user) {
    const { data: perfil } = await supabase
      .from("usuarios")
      .select("rol,estado")
      .eq("id", user.id)
      .maybeSingle()

    if (perfil && (perfil.estado === "aprobado" || perfil.estado === "activo")) {
      const url = request.nextUrl.clone()
      url.pathname = perfil.rol === "admin" ? "/admin" : perfil.rol === "proveedor" ? "/proveedor" : "/cliente"
      return NextResponse.redirect(url)
    }
  }

  return response
}
