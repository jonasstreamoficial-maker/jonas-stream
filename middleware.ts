import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/cliente/:path*",
    "/proveedor/:path*",
    "/login/:path*",

    "/tienda/:path*",
    "/carrito/:path*",
    "/favoritos/:path*",
    "/codigos/:path*",

    "/api/codigos/:path*",
    "/api/editor-web/portada/:path*",
    "/api/editor-web/upload/:path*",
  ],
};