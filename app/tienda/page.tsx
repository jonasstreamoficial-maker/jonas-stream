"use client"

import Link from "next/link"
import { useEffect, useState, type CSSProperties } from "react"
import { supabase } from "@/lib/supabase"
import { agregarAlCarrito, contarItemsCarrito } from "@/lib/carrito"
import { toggleFavorito, obtenerFavoritos } from "@/lib/favoritos"
import toast from "react-hot-toast"

type Producto = {
  id: string
  nombre: string
  descripcion: string
  precio: number
  precio_antes: number | null
  stock: number
  imagen?: string | null
  categoria: string
  tipo_venta: string
  whatsapp: string
  estado: string
  publicacion: boolean
  destacado: boolean
  oferta: boolean
}

type ConfiguracionTienda = {
  id: string
  nombre_tienda: string
  slogan: string
  banner_titulo: string
  banner_texto: string
  banner_boton: string
  whatsapp: string
}

export default function TiendaPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [config, setConfig] = useState<ConfiguracionTienda | null>(null)
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState("")
  const [categoriaFiltro, setCategoriaFiltro] = useState("todos")
  const [cantidadCarrito, setCantidadCarrito] = useState(0)
  const [favoritos, setFavoritos] = useState<string[]>([])

  useEffect(() => {
    cargarTienda()
    actualizarContador()
    cargarFavoritos()
  }, [])

  const actualizarContador = () => {
    setCantidadCarrito(contarItemsCarrito())
  }

  const cargarFavoritos = async () => {
    const data = await obtenerFavoritos()
    setFavoritos(data.map((f: any) => f.producto_id))
  }

  const manejarFavorito = async (productoId: string) => {
    const estado = await toggleFavorito(productoId)

    setFavoritos((prev) =>
      estado
        ? [...prev, productoId]
        : prev.filter((id) => id !== productoId)
    )
  }

  const cargarTienda = async () => {
    setCargando(true)

    const { data: productosData } = await supabase
      .from("productos")
      .select("*")
      .eq("estado", "activo")
      .eq("publicacion", true)
      .order("created_at", { ascending: false })

    const { data: configData } = await supabase
      .from("configuracion_tienda")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)

    if (productosData) setProductos(productosData)

    if (configData && configData.length > 0) {
      setConfig(configData[0])
    }

    setCargando(false)
  }

  const categoriasUnicas = [
    "todos",
    ...Array.from(
      new Set(
        productos
          .map((p) => p.categoria)
          .filter((categoria) => categoria && categoria.trim() !== "")
      )
    ),
  ]

  const productosFiltrados = productos.filter((p) => {
    const texto = `${p.nombre} ${p.descripcion} ${p.categoria} ${p.tipo_venta}`.toLowerCase()
    const coincideBusqueda = texto.includes(busqueda.toLowerCase())
    const coincideCategoria =
      categoriaFiltro === "todos" ? true : p.categoria === categoriaFiltro

    return coincideBusqueda && coincideCategoria
  })

  const abrirWhatsApp = (producto: Producto) => {
    const numero = producto.whatsapp || config?.whatsapp || ""

    if (!numero) {
      toast.error("Este producto no tiene WhatsApp configurado")
      return
    }

    const mensaje = `Hola, quiero comprar este producto: ${producto.nombre}`
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`
    window.open(url, "_blank")
  }

  const comprarProducto = (producto: Producto) => {
    agregarAlCarrito({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      imagen: producto.imagen || null,
      categoria: producto.categoria || "",
      tipo_venta: producto.tipo_venta || "",
    })

    actualizarContador()
    toast.success(`Producto agregado al carrito: ${producto.nombre}`)
  }

  if (cargando) {
    return (
      <main style={estilos.main}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "60vh",
            fontSize: "20px",
            color: "#00e5ff",
          }}
        >
          ⚡ Cargando tienda...
        </div>
      </main>
    )
  }

  return (
    <main style={estilos.main}>
      <div style={estilos.fondoGlow}></div>

      <header style={estilos.topbar}>
        <div style={estilos.topbarMarca}>
          <span style={estilos.topbarLogo}>
            {config?.nombre_tienda || "JONAS STREAM"}
          </span>
        </div>

        <div style={estilos.topbarAcciones}>
          <Link href="/carrito" style={estilos.carritoBoton}>
            Carrito ({cantidadCarrito})
          </Link>
        </div>
      </header>

      <section style={estilos.hero}>
        <div style={estilos.heroOverlay}></div>
        <div style={estilos.heroContenido}>
          <p style={estilos.miniMarca}>
            {config?.nombre_tienda || "JONAS STREAM"}
          </p>

          <h1 style={estilos.heroTitulo}>
            {config?.banner_titulo || "Las mejores cuentas digitales"}
          </h1>

          <p style={estilos.heroTexto}>
            {config?.banner_texto || "Streaming, música, VPN y apps en una sola tienda"}
          </p>

          <div style={estilos.heroBotones}>
            <a href="#productos" style={estilos.botonPrincipal}>
              {config?.banner_boton || "Comprar ahora"}
            </a>

            <Link href="/carrito" style={estilos.botonSecundarioHero}>
              Ver carrito
            </Link>
          </div>
        </div>
      </section>

      <section style={estilos.infoBar}>
        <div style={estilos.infoCard}>
          <h3 style={estilos.infoCardTitulo}>
            {config?.nombre_tienda || "JONAS STREAM"}
          </h3>
          <p style={estilos.infoCardTexto}>
            {config?.slogan || "Tu plataforma oficial"}
          </p>
        </div>

        <div style={estilos.infoCard}>
          <h3 style={estilos.infoCardTitulo}>Productos disponibles</h3>
          <p style={estilos.infoCardTexto}>{productos.length}</p>
        </div>

        <div style={estilos.infoCard}>
          <h3 style={estilos.infoCardTitulo}>Destacados</h3>
          <p style={estilos.infoCardTexto}>
            {productos.filter((p) => p.destacado).length}
          </p>
        </div>
      </section>

      <section id="productos" style={estilos.seccion}>
        <div style={estilos.seccionHeader}>
          <div>
            <h2 style={estilos.sectionTitle}>Tienda</h2>
            <p style={estilos.sectionSubtext}>
              Explora productos activos y publicados
            </p>
          </div>
        </div>

        <div style={estilos.filtros}>
          <input
            type="text"
            placeholder="Buscar producto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={estilos.input}
          />

          <select
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)}
            style={estilos.input}
          >
            {categoriasUnicas.map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria === "todos" ? "Todas las categorías" : categoria}
              </option>
            ))}
          </select>
        </div>

        {productosFiltrados.length === 0 ? (
          <div style={estilos.vacio}>
            <h3 style={{ marginBottom: "8px" }}>No hay productos para mostrar</h3>
            <p style={{ color: "#b8c9d6" }}>
              Intenta cambiar la búsqueda o la categoría
            </p>
          </div>
        ) : (
          <div style={estilos.gridProductos}>
            {productosFiltrados.map((producto) => (
              <article
                key={producto.id}
                style={estilos.cardProducto}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)"
                  e.currentTarget.style.boxShadow = "0 0 28px rgba(0,229,255,0.12)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)"
                  e.currentTarget.style.boxShadow = "0 0 22px rgba(0,229,255,0.08)"
                }}
              >
                <div style={estilos.imagenWrap}>
                  {producto.imagen ? (
                    <img
                      src={producto.imagen}
                      alt={producto.nombre}
                      style={estilos.imagenProducto}
                    />
                  ) : (
                    <div style={estilos.imagenPlaceholder}>
                      Sin imagen
                    </div>
                  )}

                  <div style={estilos.badges}>
                    {producto.destacado && (
                      <span style={estilos.badgeDestacado}>Destacado</span>
                    )}
                    {producto.oferta && (
                      <span style={estilos.badgeOferta}>Oferta</span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => manejarFavorito(producto.id)}
                  style={{
                    position: "absolute",
                    top: "14px",
                    right: "14px",
                    background: "rgba(0,0,0,0.6)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "50%",
                    width: "38px",
                    height: "38px",
                    cursor: "pointer",
                    fontSize: "18px",
                    color: favoritos.includes(producto.id) ? "red" : "white",
                  }}
                >
                  {favoritos.includes(producto.id) ? "❤️" : "🤍"}
                </button>

                <div style={estilos.cardContenido}>
                  <p style={estilos.categoria}>{producto.categoria || "General"}</p>

                  <h3 style={estilos.nombreProducto}>{producto.nombre}</h3>

                  <p style={estilos.descripcion}>
                    {producto.descripcion || "Producto digital disponible"}
                  </p>

                  <div style={estilos.metaFila}>
                    <span style={estilos.metaChip}>
                      {producto.tipo_venta || "Digital"}
                    </span>

                    <span style={estilos.metaChip}>
                      Stock: {producto.stock}
                    </span>
                  </div>

                  <div style={estilos.precioWrap}>
                    <span style={estilos.precioActual}>S/ {producto.precio}</span>

                    {producto.precio_antes && producto.precio_antes > producto.precio && (
                      <span style={estilos.precioAntes}>
                        S/ {producto.precio_antes}
                      </span>
                    )}
                  </div>

                  <div style={estilos.botonesCard}>
                    <button
                      onClick={() => comprarProducto(producto)}
                      style={estilos.botonComprar}
                    >
                      Comprar
                    </button>

                    <button
                      onClick={() => abrirWhatsApp(producto)}
                      style={estilos.botonWhatsapp}
                    >
                      WhatsApp
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

const estilos: Record<string, CSSProperties> = {
  main: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top, rgba(0,229,255,0.08), transparent 22%), #030507",
    color: "white",
    position: "relative",
    overflow: "hidden",
    paddingBottom: "60px",
  },
  fondoGlow: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    background:
      "radial-gradient(circle at 15% 15%, rgba(0,251,255,0.06), transparent 22%), radial-gradient(circle at 85% 10%, rgba(0,229,255,0.05), transparent 20%), radial-gradient(circle at 50% 100%, rgba(0,229,255,0.04), transparent 25%)",
  },
  topbar: {
    position: "relative",
    zIndex: 2,
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "18px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
  },
  topbarMarca: {
    display: "flex",
    alignItems: "center",
  },
  topbarLogo: {
    color: "#00e5ff",
    fontWeight: "bold",
    letterSpacing: "2px",
    textTransform: "uppercase",
  },
  topbarAcciones: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },
  carritoBoton: {
    textDecoration: "none",
    background: "rgba(0,229,255,0.12)",
    color: "#00f7ff",
    border: "1px solid rgba(0,229,255,0.28)",
    borderRadius: "999px",
    padding: "10px 16px",
    fontWeight: "bold",
  },
  titulo: {
    fontSize: "36px",
    padding: "60px 24px",
    textAlign: "center",
    position: "relative",
    zIndex: 1,
  },
  hero: {
    minHeight: "58vh",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 24px",
    borderBottom: "1px solid rgba(0,229,255,0.12)",
  },
  heroOverlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(180deg, rgba(3,5,7,0.35) 0%, rgba(3,5,7,0.78) 100%)",
  },
  heroContenido: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    maxWidth: "1000px",
    textAlign: "center",
  },
  miniMarca: {
    color: "#00e5ff",
    letterSpacing: "4px",
    fontSize: "14px",
    textTransform: "uppercase",
    marginBottom: "18px",
    textShadow: "0 0 12px rgba(0,229,255,0.25)",
  },
  heroTitulo: {
    fontSize: "clamp(36px, 6vw, 74px)",
    lineHeight: 1.05,
    marginBottom: "16px",
    textShadow: "0 0 24px rgba(0,229,255,0.16)",
  },
  heroTexto: {
    maxWidth: "760px",
    margin: "0 auto 26px auto",
    color: "#d0dee8",
    fontSize: "18px",
    lineHeight: 1.6,
  },
  heroBotones: {
    display: "flex",
    justifyContent: "center",
    gap: "14px",
    flexWrap: "wrap",
  },
  botonPrincipal: {
    display: "inline-block",
    background: "#00e5ff",
    color: "#001018",
    textDecoration: "none",
    border: "none",
    borderRadius: "14px",
    padding: "14px 22px",
    fontWeight: "bold",
    boxShadow: "0 0 18px rgba(0,229,255,0.22)",
  },
  botonSecundarioHero: {
    display: "inline-block",
    background: "transparent",
    color: "#00e5ff",
    textDecoration: "none",
    border: "1px solid rgba(0,229,255,0.34)",
    borderRadius: "14px",
    padding: "14px 22px",
    fontWeight: "bold",
  },
  infoBar: {
    position: "relative",
    zIndex: 1,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    padding: "24px",
    maxWidth: "1200px",
    margin: "-40px auto 10px auto",
  },
  infoCard: {
    background: "rgba(11, 17, 24, 0.9)",
    border: "1px solid rgba(0,229,255,0.2)",
    borderRadius: "18px",
    padding: "20px",
    backdropFilter: "blur(8px)",
    boxShadow: "0 0 18px rgba(0,229,255,0.08)",
  },
  infoCardTitulo: {
    color: "#e6fbff",
    marginBottom: "8px",
    fontSize: "18px",
  },
  infoCardTexto: {
    color: "#00e5ff",
    fontSize: "20px",
    fontWeight: "bold",
  },
  seccion: {
    position: "relative",
    zIndex: 1,
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "28px 24px 0 24px",
  },
  seccionHeader: {
    marginBottom: "20px",
  },
  sectionTitle: {
    fontSize: "30px",
    marginBottom: "8px",
    color: "#00e5ff",
    textShadow: "0 0 12px rgba(0,229,255,0.25)",
  },
  sectionSubtext: {
    color: "#bdd0dd",
  },
  filtros: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "14px",
    marginBottom: "24px",
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "12px",
    border: "1px solid rgba(0,229,255,0.18)",
    background: "#081018",
    color: "white",
    outline: "none",
  },
  vacio: {
    background: "rgba(11, 17, 24, 0.9)",
    border: "1px solid rgba(0,229,255,0.18)",
    borderRadius: "18px",
    padding: "28px",
    textAlign: "center",
  },
  gridProductos: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))",
    gap: "20px",
  },
  cardProducto: {
    background: "rgba(11, 17, 24, 0.9)",
    border: "1px solid rgba(0,229,255,0.18)",
    borderRadius: "22px",
    overflow: "hidden",
    boxShadow: "0 0 22px rgba(0,229,255,0.08)",
    backdropFilter: "blur(8px)",
    position: "relative",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  imagenWrap: {
    position: "relative",
    width: "100%",
    height: "280px",
    background: "#071018",
  },
  imagenProducto: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  imagenPlaceholder: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#8ea6b8",
    fontSize: "18px",
  },
  badges: {
    position: "absolute",
    top: "14px",
    left: "14px",
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  badgeDestacado: {
    background: "rgba(0,229,255,0.18)",
    color: "#00f7ff",
    border: "1px solid rgba(0,229,255,0.3)",
    borderRadius: "999px",
    padding: "6px 10px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  badgeOferta: {
    background: "rgba(255,90,90,0.16)",
    color: "#ff9898",
    border: "1px solid rgba(255,120,120,0.26)",
    borderRadius: "999px",
    padding: "6px 10px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  cardContenido: {
    padding: "20px",
  },
  categoria: {
    color: "#8fc9d4",
    fontSize: "13px",
    textTransform: "uppercase",
    letterSpacing: "1px",
    marginBottom: "10px",
  },
  nombreProducto: {
    fontSize: "24px",
    marginBottom: "10px",
  },
  descripcion: {
    color: "#c7d7e2",
    lineHeight: 1.55,
    minHeight: "48px",
    marginBottom: "14px",
  },
  metaFila: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginBottom: "16px",
  },
  metaChip: {
    background: "rgba(0,229,255,0.08)",
    color: "#c9f7ff",
    border: "1px solid rgba(0,229,255,0.15)",
    borderRadius: "999px",
    padding: "7px 12px",
    fontSize: "12px",
  },
  precioWrap: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "18px",
    flexWrap: "wrap",
  },
  precioActual: {
    fontSize: "30px",
    fontWeight: "bold",
    color: "#00f7ff",
    textShadow: "0 0 12px rgba(0,229,255,0.18)",
  },
  precioAntes: {
    color: "#8ea5b5",
    textDecoration: "line-through",
    fontSize: "18px",
  },
  botonesCard: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  botonComprar: {
    flex: 1,
    minWidth: "120px",
    background: "#00e5ff",
    color: "#001018",
    border: "none",
    borderRadius: "12px",
    padding: "12px 14px",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 0 14px rgba(0,229,255,0.22)",
    transition: "all 0.2s ease",
  },
  botonWhatsapp: {
    flex: 1,
    minWidth: "120px",
    background: "transparent",
    color: "#00e5ff",
    border: "1px solid rgba(0,229,255,0.34)",
    borderRadius: "12px",
    padding: "12px 14px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
}