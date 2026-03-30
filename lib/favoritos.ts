import { supabase } from "@/lib/supabase"

type UsuarioLocal = {
  id: string
}

const obtenerUsuario = (): UsuarioLocal | null => {
  if (typeof window === "undefined") return null

  const data = localStorage.getItem("usuario")
  if (!data) return null

  return JSON.parse(data)
}

export const obtenerFavoritos = async () => {
  const usuario = obtenerUsuario()
  if (!usuario) return []

  const { data } = await supabase
    .from("favoritos")
    .select("producto_id")
    .eq("usuario_id", usuario.id)

  return data || []
}

export const esFavorito = async (productoId: string) => {
  const usuario = obtenerUsuario()
  if (!usuario) return false

  const { data } = await supabase
    .from("favoritos")
    .select("*")
    .eq("usuario_id", usuario.id)
    .eq("producto_id", productoId)
    .single()

  return !!data
}

export const toggleFavorito = async (productoId: string) => {
  const usuario = obtenerUsuario()
  if (!usuario) {
    alert("Debes iniciar sesión")
    return false
  }

  const { data } = await supabase
    .from("favoritos")
    .select("*")
    .eq("usuario_id", usuario.id)
    .eq("producto_id", productoId)
    .single()

  if (data) {
    await supabase
      .from("favoritos")
      .delete()
      .eq("id", data.id)

    return false
  } else {
    await supabase.from("favoritos").insert([
      {
        usuario_id: usuario.id,
        producto_id: productoId,
      },
    ])

    return true
  }
}