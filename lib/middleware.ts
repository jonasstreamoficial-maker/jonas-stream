import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

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

        response = NextResponse.next({
          request: { headers: request.headers },
        })

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  // Refresca/sincroniza cookies de Supabase para SSR.
  // Importante: NO bloqueamos /admin aquí porque tu AdminPage ya valida:
  // - sesión activa
  // - usuario existe en public.usuarios
  // - rol admin/proveedor
  // - estado aprobado
  // Esto evita el bug donde el login funciona, pero el middleware no alcanza a leer la cookie nueva.
  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: ["/admin/:path*"],
}
