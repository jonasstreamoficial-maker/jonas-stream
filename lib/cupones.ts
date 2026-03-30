import { supabase } from "@/lib/supabase"

export const validarCupon = async (codigo: string) => {
  const { data, error } = await supabase
    .from("cupones")
    .select("*")
    .eq("codigo", codigo)
    .eq("activo", true)
    .single()

  if (error || !data) {
    return null
  }

  return data
}