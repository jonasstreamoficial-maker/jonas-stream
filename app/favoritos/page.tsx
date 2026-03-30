"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { obtenerFavoritos } from "@/lib/favoritos"

export default function FavoritosPage() {
  const [productos, setProductos] = useState<any[]>([])

  useEffect(() => {
    cargarFavoritos()
  }, [])

  const cargarFavoritos = async () => {
    const favs = await obtenerFavoritos()

    const ids = favs.map((f: any) => f.producto_id)

    if (ids.length === 0) {
      setProductos([])
      return
    }

    const { data } = await supabase
      .from("productos")
      .select("*")
      .in("id", ids)

    setProductos(data || [])
  }

  return (
    <main style={{ padding: "40px", color: "white", background: "#030507", minHeight: "100vh" }}>
      <h1>❤️ Favoritos</h1>

      {productos.length === 0 ? (
        <p>No tienes favoritos aún</p>
      ) : (
        <div style={{ display: "grid", gap: "20px", marginTop: "20px" }}>
          {productos.map((p) => (
            <div key={p.id} style={{ border: "1px solid cyan", padding: "20px" }}>
              <h3>{p.nombre}</h3>
              <p>S/ {p.precio}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}