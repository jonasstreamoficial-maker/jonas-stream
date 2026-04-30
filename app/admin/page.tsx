"use client"

import {
  useEffect,
  useState,
  type CSSProperties,
  type ChangeEvent,
  type FormEvent,
} from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import toast from "react-hot-toast"

type Usuario = {
  id: string
  nombre: string
  correo: string
  rol: string
  estado: string
}

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
  duracion?: string | null
  proveedor?: string | null
  renovable?: boolean | null
  stock_texto?: string | null
  estado_catalogo?: string | null
  badge?: string | null
  accent?: string | null
}

type Pedido = {
  id: string
  cliente_nombre: string
  cliente_correo: string
  total: number
  estado: string
  metodo_pago: string
  created_at: string
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

const productoInicial = {
  nombre: "",
  descripcion: "",
  precio: "",
  precio_antes: "",
  stock: "",
  categoria: "",
  tipo_venta: "",
  whatsapp: "",
  estado: "activo",
  publicacion: true,
  destacado: false,
  oferta: false,
  duracion: "1 mes",
  proveedor: "Jonas Stream",
  renovable: true,
  stock_texto: "",
  estado_catalogo: "ACTIVO",
  badge: "",
  accent: "prime",
}

const configuracionInicial = {
  nombre_tienda: "",
  slogan: "",
  banner_titulo: "",
  banner_texto: "",
  banner_boton: "",
  whatsapp: "",
}

export default function AdminPage() {
  const router = useRouter()

  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [cargando, setCargando] = useState(true)

  const [formProducto, setFormProducto] = useState(productoInicial)
  const [editandoId, setEditandoId] = useState<string | null>(null)

  const [busquedaProducto, setBusquedaProducto] = useState("")
  const [filtroEstadoProducto, setFiltroEstadoProducto] = useState("todos")
  const [ordenProducto, setOrdenProducto] = useState("recientes")

  const [configId, setConfigId] = useState<string | null>(null)
  const [formConfig, setFormConfig] = useState(configuracionInicial)
  const [guardandoConfig, setGuardandoConfig] = useState(false)

  const [imagenFile, setImagenFile] = useState<File | null>(null)
  const [subiendoImagen, setSubiendoImagen] = useState(false)

  useEffect(() => {
    const guardado = localStorage.getItem("usuario")

    if (!guardado) {
      router.push("/login")
      return
    }

    const usuarioParseado: Usuario = JSON.parse(guardado)

    if (usuarioParseado.rol !== "admin") {
      router.push("/login")
      return
    }

    setUsuario(usuarioParseado)
    cargarDatos()
  }, [router])

  const cargarDatos = async () => {
    setCargando(true)

    const { data: usuariosData } = await supabase.from("usuarios").select("*")

    const { data: productosData } = await supabase
      .from("productos")
      .select("*")
      .order("created_at", { ascending: false })

    const { data: pedidosData } = await supabase
      .from("pedidos")
      .select("*")
      .order("created_at", { ascending: false })

    const { data: configData } = await supabase
      .from("configuracion_tienda")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)

    if (usuariosData) setUsuarios(usuariosData)
    if (productosData) setProductos(productosData)
    if (pedidosData) setPedidos(pedidosData)

    if (configData && configData.length > 0) {
      const config = configData[0] as ConfiguracionTienda
      setConfigId(config.id)
      setFormConfig({
        nombre_tienda: config.nombre_tienda || "",
        slogan: config.slogan || "",
        banner_titulo: config.banner_titulo || "",
        banner_texto: config.banner_texto || "",
        banner_boton: config.banner_boton || "",
        whatsapp: config.whatsapp || "",
      })
    } else {
      setConfigId(null)
      setFormConfig(configuracionInicial)
    }

    setCargando(false)
  }

  const actualizarEstado = async (id: string, nuevoEstado: string) => {
    const { error } = await supabase
      .from("usuarios")
      .update({ estado: nuevoEstado })
      .eq("id", id)

    if (!error) {
      await cargarDatos()
    } else {
      toast.error("No se pudo actualizar el estado")
    }
  }

  const cambiarRol = async (id: string, nuevoRol: string) => {
    const { error } = await supabase
      .from("usuarios")
      .update({ rol: nuevoRol })
      .eq("id", id)

    if (!error) {
      await cargarDatos()
    } else {
      toast.error("No se pudo cambiar el rol")
    }
  }

  const eliminarUsuario = async (id: string) => {
    const confirmar = confirm("¿Seguro que quieres eliminar este usuario?")
    if (!confirmar) return

    const { error } = await supabase.from("usuarios").delete().eq("id", id)

    if (!error) {
      await cargarDatos()
    } else {
      toast.error("No se pudo eliminar el usuario")
    }
  }

  const actualizarEstadoPedido = async (id: string, nuevoEstado: string) => {
    const { error } = await supabase
      .from("pedidos")
      .update({ estado: nuevoEstado })
      .eq("id", id)

    if (!error) {
      toast.success(`Pedido actualizado a ${nuevoEstado}`)
      await cargarDatos()
    } else {
      toast.error("No se pudo actualizar el pedido")
    }
  }

  const handleProductoChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked
      setFormProducto((prev) => ({ ...prev, [name]: checked }))
    } else {
      setFormProducto((prev) => ({ ...prev, [name]: value }))
    }
  }

  const subirImagen = async () => {
    if (!imagenFile) return null

    setSubiendoImagen(true)

    const extension = imagenFile.name.split(".").pop()
    const nombreArchivo = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${extension}`

    const { error: uploadError } = await supabase.storage
      .from("productos")
      .upload(nombreArchivo, imagenFile)

    if (uploadError) {
      setSubiendoImagen(false)
      toast.error("No se pudo subir la imagen")
      return null
    }

    const { data } = supabase.storage.from("productos").getPublicUrl(nombreArchivo)

    setSubiendoImagen(false)
    return data.publicUrl
  }

  const guardarProducto = async (e: FormEvent) => {
    e.preventDefault()

    if (!formProducto.nombre || !formProducto.precio || !formProducto.stock) {
      toast.error("Completa nombre, precio y stock")
      return
    }

    let imagenUrl: string | null = null

    if (imagenFile) {
      const urlSubida = await subirImagen()
      if (!urlSubida) return
      imagenUrl = urlSubida
    }

    const payload: {
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
      duracion: string
      proveedor: string
      renovable: boolean
      stock_texto: string
      estado_catalogo: string
      badge: string
      accent: string
    } = {
      nombre: formProducto.nombre,
      descripcion: formProducto.descripcion,
      precio: Number(formProducto.precio),
      precio_antes: formProducto.precio_antes ? Number(formProducto.precio_antes) : null,
      stock: Number(formProducto.stock),
      categoria: formProducto.categoria,
      tipo_venta: formProducto.tipo_venta,
      whatsapp: formProducto.whatsapp,
      estado: formProducto.estado,
      publicacion: formProducto.publicacion,
      destacado: formProducto.destacado,
      oferta: formProducto.oferta,
      duracion: formProducto.duracion,
      proveedor: formProducto.proveedor,
      renovable: formProducto.renovable,
      stock_texto: formProducto.stock_texto,
      estado_catalogo: formProducto.estado_catalogo,
      badge: formProducto.badge,
      accent: formProducto.accent,
    }

    if (imagenUrl) {
      payload.imagen = imagenUrl
    }

    if (editandoId) {
      const { error } = await supabase
        .from("productos")
        .update(payload)
        .eq("id", editandoId)

      if (error) {
        toast.error("No se pudo actualizar el producto")
        return
      }

      toast.success("Producto actualizado")
    } else {
      const { error } = await supabase.from("productos").insert([payload])

      if (error) {
        toast.error("No se pudo crear el producto")
        return
      }

      toast.success("Producto creado")
    }

    setFormProducto(productoInicial)
    setEditandoId(null)
    setImagenFile(null)
    await cargarDatos()
  }

  const editarProducto = (producto: Producto) => {
    setEditandoId(producto.id)
    setFormProducto({
      nombre: producto.nombre || "",
      descripcion: producto.descripcion || "",
      precio: String(producto.precio ?? ""),
      precio_antes: producto.precio_antes ? String(producto.precio_antes) : "",
      stock: String(producto.stock ?? ""),
      categoria: producto.categoria || "",
      tipo_venta: producto.tipo_venta || "",
      whatsapp: producto.whatsapp || "",
      estado: producto.estado || "activo",
      publicacion: producto.publicacion ?? true,
      destacado: producto.destacado ?? false,
      oferta: producto.oferta ?? false,
      duracion: producto.duracion || "1 mes",
      proveedor: producto.proveedor || "Jonas Stream",
      renovable: producto.renovable ?? true,
      stock_texto: producto.stock_texto || "",
      estado_catalogo: producto.estado_catalogo || "ACTIVO",
      badge: producto.badge || "",
      accent: producto.accent || "prime",
    })
    setImagenFile(null)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const eliminarProducto = async (id: string) => {
    const confirmar = confirm("¿Seguro que quieres eliminar este producto?")
    if (!confirmar) return

    const { error } = await supabase.from("productos").delete().eq("id", id)

    if (!error) {
      await cargarDatos()
    } else {
      toast.error("No se pudo eliminar el producto")
    }
  }

  const handleConfigChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormConfig((prev) => ({ ...prev, [name]: value }))
  }

  const guardarConfiguracion = async (e: FormEvent) => {
    e.preventDefault()
    setGuardandoConfig(true)

    const payload = {
      nombre_tienda: formConfig.nombre_tienda,
      slogan: formConfig.slogan,
      banner_titulo: formConfig.banner_titulo,
      banner_texto: formConfig.banner_texto,
      banner_boton: formConfig.banner_boton,
      whatsapp: formConfig.whatsapp,
    }

    if (configId) {
      const { error } = await supabase
        .from("configuracion_tienda")
        .update(payload)
        .eq("id", configId)

      if (error) {
        toast.error("No se pudo actualizar la configuración")
        setGuardandoConfig(false)
        return
      }

      toast.success("Configuración actualizada")
    } else {
      const { data, error } = await supabase
        .from("configuracion_tienda")
        .insert([payload])
        .select()

      if (error) {
        toast.error("No se pudo guardar la configuración")
        setGuardandoConfig(false)
        return
      }

      if (data && data.length > 0) {
        setConfigId(data[0].id)
      }

      toast.success("Configuración guardada")
    }

    setGuardandoConfig(false)
    await cargarDatos()
  }

  const cerrarSesion = () => {
    localStorage.removeItem("usuario")
    router.push("/login")
  }

  const totalUsuarios = usuarios.length
  const totalProductos = productos.length
  const productosActivos = productos.filter((p) => p.estado === "activo").length
  const productosInactivos = productos.filter((p) => p.estado === "inactivo").length
  const totalPedidos = pedidos.length

  const productosFiltrados = [...productos]
    .filter((p) => {
      const texto =
        `${p.nombre} ${p.descripcion} ${p.categoria} ${p.tipo_venta}`.toLowerCase()

      const coincideBusqueda = texto.includes(busquedaProducto.toLowerCase())

      const coincideEstado =
        filtroEstadoProducto === "todos"
          ? true
          : p.estado === filtroEstadoProducto

      return coincideBusqueda && coincideEstado
    })
    .sort((a, b) => {
      if (ordenProducto === "nombre") {
        return a.nombre.localeCompare(b.nombre)
      }

      if (ordenProducto === "precio_mayor") {
        return b.precio - a.precio
      }

      if (ordenProducto === "precio_menor") {
        return a.precio - b.precio
      }

      return 0
    })

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
          ⚡ Cargando panel admin...
        </div>
      </main>
    )
  }

  return (
    <main style={estilos.main}>
      <div style={estilos.fondoGlow}></div>

      <header style={estilos.header}>
        <div>
          <h1 style={estilos.titulo}>JONAS STREAM | ADMIN</h1>
          <p style={estilos.subtexto}>Bienvenido: {usuario?.nombre}</p>
          <p style={estilos.subtexto}>Correo: {usuario?.correo}</p>
        </div>

        <button onClick={cerrarSesion} style={estilos.botonPrincipal}>
          Cerrar sesión
        </button>
      </header>

      <section style={{ marginBottom: "40px" }}>
        <h2 style={estilos.sectionTitle}>Dashboard</h2>

        <div style={estilos.gridCards}>
          <div style={estilos.card}>
            <h3 style={estilos.cardTitle}>Total usuarios</h3>
            <p style={estilos.cardValue}>{totalUsuarios}</p>
          </div>

          <div style={estilos.card}>
            <h3 style={estilos.cardTitle}>Total productos</h3>
            <p style={estilos.cardValue}>{totalProductos}</p>
          </div>

          <div style={estilos.card}>
            <h3 style={estilos.cardTitle}>Productos activos</h3>
            <p style={estilos.cardValue}>{productosActivos}</p>
          </div>

          <div style={estilos.card}>
            <h3 style={estilos.cardTitle}>Productos inactivos</h3>
            <p style={estilos.cardValue}>{productosInactivos}</p>
          </div>

          <div style={estilos.card}>
            <h3 style={estilos.cardTitle}>Total pedidos</h3>
            <p style={estilos.cardValue}>{totalPedidos}</p>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: "40px" }}>
        <h2 style={estilos.sectionTitle}>Gestión de usuarios</h2>

        <div style={estilos.listaUsuarios}>
          {usuarios.map((u) => (
            <div key={u.id} style={estilos.usuarioCard}>
              <div style={{ marginBottom: "14px" }}>
                <h3 style={{ fontSize: "22px", marginBottom: "8px" }}>
                  {u.nombre}
                </h3>
                <p style={estilos.infoTexto}>Correo: {u.correo}</p>
                <p style={estilos.infoTexto}>Rol: {u.rol}</p>
                <p style={estilos.infoTexto}>
                  Estado:{" "}
                  <span
                    style={{
                      color:
                        u.estado === "aprobado"
                          ? "#7CFFB2"
                          : u.estado === "rechazado"
                          ? "#FF8B8B"
                          : "#FFE082",
                      fontWeight: "bold",
                    }}
                  >
                    {u.estado}
                  </span>
                </p>
              </div>

              <div style={estilos.acciones}>
                <button
                  onClick={() => actualizarEstado(u.id, "aprobado")}
                  style={estilos.botonSecundario}
                >
                  Aprobar
                </button>

                <button
                  onClick={() => actualizarEstado(u.id, "rechazado")}
                  style={estilos.botonSecundario}
                >
                  Rechazar
                </button>

                <button
                  onClick={() => cambiarRol(u.id, "cliente")}
                  style={estilos.botonSecundario}
                >
                  Cliente
                </button>

                <button
                  onClick={() => cambiarRol(u.id, "proveedor")}
                  style={estilos.botonSecundario}
                >
                  Proveedor
                </button>

                <button
                  onClick={() => cambiarRol(u.id, "admin")}
                  style={estilos.botonSecundario}
                >
                  Admin
                </button>

                <button
                  onClick={() => eliminarUsuario(u.id)}
                  style={estilos.botonEliminar}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: "40px" }}>
        <h2 style={estilos.sectionTitle}>
          {editandoId ? "Editar producto" : "Crear producto"}
        </h2>

        <form onSubmit={guardarProducto} style={estilos.formulario}>
          <input
            name="nombre"
            placeholder="Nombre"
            value={formProducto.nombre}
            onChange={handleProductoChange}
            style={estilos.input}
          />

          <textarea
            name="descripcion"
            placeholder="Descripción"
            value={formProducto.descripcion}
            onChange={handleProductoChange}
            style={{ ...estilos.input, minHeight: "100px" }}
          />

          <input
            name="precio"
            type="number"
            placeholder="Precio"
            value={formProducto.precio}
            onChange={handleProductoChange}
            style={estilos.input}
          />

          <input
            name="precio_antes"
            type="number"
            placeholder="Precio antes"
            value={formProducto.precio_antes}
            onChange={handleProductoChange}
            style={estilos.input}
          />

          <input
            name="stock"
            type="number"
            placeholder="Stock"
            value={formProducto.stock}
            onChange={handleProductoChange}
            style={estilos.input}
          />

          <input
            name="categoria"
            placeholder="Categoría"
            value={formProducto.categoria}
            onChange={handleProductoChange}
            style={estilos.input}
          />

          <select
            name="tipo_venta"
            value={formProducto.tipo_venta}
            onChange={handleProductoChange}
            style={estilos.input}
          >
            <option value="">Tipo de venta</option>
            <option value="Cuenta Completa">Cuenta Completa</option>
            <option value="Perfiles">Perfiles</option>
          </select>

          <input
            name="duracion"
            placeholder="Duración (ej: 1 mes, 12 meses)"
            value={formProducto.duracion}
            onChange={handleProductoChange}
            style={estilos.input}
          />

          <input
            name="proveedor"
            placeholder="Proveedor"
            value={formProducto.proveedor}
            onChange={handleProductoChange}
            style={estilos.input}
          />

          <input
            name="stock_texto"
            placeholder="Texto de stock (ej: Stock disponible, Últimas unidades)"
            value={formProducto.stock_texto}
            onChange={handleProductoChange}
            style={estilos.input}
          />

          <select
            name="estado_catalogo"
            value={formProducto.estado_catalogo}
            onChange={handleProductoChange}
            style={estilos.input}
          >
            <option value="ACTIVO">ACTIVO</option>
            <option value="LIMITADO">LIMITADO</option>
            <option value="AGOTADO">AGOTADO</option>
          </select>

          <input
            name="badge"
            placeholder="Etiqueta visual (ej: Más vendido, Premium, Oferta)"
            value={formProducto.badge}
            onChange={handleProductoChange}
            style={estilos.input}
          />

          <select
            name="accent"
            value={formProducto.accent}
            onChange={handleProductoChange}
            style={estilos.input}
          >
            <option value="netflix">Netflix</option>
            <option value="disney">Disney+</option>
            <option value="prime">Prime Video</option>
            <option value="max">Max</option>
            <option value="spotify">Spotify</option>
            <option value="youtube">YouTube</option>
            <option value="crunchy">Crunchyroll</option>
            <option value="paramount">Paramount+</option>
            <option value="canva">Canva</option>
            <option value="office">Microsoft 365</option>
            <option value="iptv">IPTV</option>
            <option value="viki">Viki</option>
          </select>

          <label style={estilos.checkboxLabel}>
            <input
              type="checkbox"
              name="renovable"
              checked={formProducto.renovable}
              onChange={handleProductoChange}
            />
            Renovable
          </label>

          <input
            name="whatsapp"
            placeholder="WhatsApp"
            value={formProducto.whatsapp}
            onChange={handleProductoChange}
            style={estilos.input}
          />

          <select
            name="estado"
            value={formProducto.estado}
            onChange={handleProductoChange}
            style={estilos.input}
          >
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>

          <label style={estilos.checkboxLabel}>
            <input
              type="checkbox"
              name="publicacion"
              checked={formProducto.publicacion}
              onChange={handleProductoChange}
            />
            Publicación activa
          </label>

          <label style={estilos.checkboxLabel}>
            <input
              type="checkbox"
              name="destacado"
              checked={formProducto.destacado}
              onChange={handleProductoChange}
            />
            Destacado
          </label>

          <label style={estilos.checkboxLabel}>
            <input
              type="checkbox"
              name="oferta"
              checked={formProducto.oferta}
              onChange={handleProductoChange}
            />
            Oferta
          </label>

          <div>
            <label style={estilos.labelArchivo}>Imagen del producto</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImagenFile(e.target.files?.[0] || null)}
              style={estilos.input}
            />
            {imagenFile && (
              <p style={estilos.infoTexto}>Archivo seleccionado: {imagenFile.name}</p>
            )}
            {subiendoImagen && (
              <p style={estilos.infoTexto}>Subiendo imagen...</p>
            )}
          </div>

          <div style={estilos.acciones}>
            <button type="submit" style={estilos.botonPrincipal}>
              {editandoId ? "Actualizar producto" : "Crear producto"}
            </button>

            {editandoId && (
              <button
                type="button"
                onClick={() => {
                  setEditandoId(null)
                  setFormProducto(productoInicial)
                  setImagenFile(null)
                }}
                style={estilos.botonSecundario}
              >
                Cancelar edición
              </button>
            )}
          </div>
        </form>
      </section>

      <section style={{ marginBottom: "40px" }}>
        <h2 style={estilos.sectionTitle}>Lista de productos</h2>

        <div style={estilos.filtrosProductos}>
          <input
            type="text"
            placeholder="Buscar producto..."
            value={busquedaProducto}
            onChange={(e) => setBusquedaProducto(e.target.value)}
            style={estilos.input}
          />

          <select
            value={filtroEstadoProducto}
            onChange={(e) => setFiltroEstadoProducto(e.target.value)}
            style={estilos.input}
          >
            <option value="todos">Todos los estados</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </select>

          <select
            value={ordenProducto}
            onChange={(e) => setOrdenProducto(e.target.value)}
            style={estilos.input}
          >
            <option value="recientes">Orden normal</option>
            <option value="nombre">Nombre A-Z</option>
            <option value="precio_mayor">Precio mayor a menor</option>
            <option value="precio_menor">Precio menor a mayor</option>
          </select>
        </div>

        <div style={estilos.listaUsuarios}>
          {productosFiltrados.map((p) => (
            <div key={p.id} style={estilos.usuarioCard}>
              <div style={{ marginBottom: "14px" }}>
                {p.imagen && (
                  <img
                    src={p.imagen}
                    alt={p.nombre}
                    style={estilos.imagenProducto}
                  />
                )}

                <h3 style={{ fontSize: "22px", marginBottom: "8px" }}>
                  {p.nombre}
                </h3>
                <p style={estilos.infoTexto}>Precio: S/ {p.precio}</p>
                <p style={estilos.infoTexto}>Stock: {p.stock}</p>
                <p style={estilos.infoTexto}>Categoría: {p.categoria || "-"}</p>
                <p style={estilos.infoTexto}>
                  Tipo de venta: {p.tipo_venta || "-"}
                </p>
                <p style={estilos.infoTexto}>WhatsApp: {p.whatsapp || "-"}</p>
                <p style={estilos.infoTexto}>Duración: {p.duracion || "-"}</p>
                <p style={estilos.infoTexto}>Proveedor: {p.proveedor || "Jonas Stream"}</p>
                <p style={estilos.infoTexto}>Estado catálogo: {p.estado_catalogo || "-"}</p>
                <p style={estilos.infoTexto}>Texto stock: {p.stock_texto || "-"}</p>
                <p style={estilos.infoTexto}>Renovable: {p.renovable ? "Sí" : "No"}</p>
                <p style={estilos.infoTexto}>Accent: {p.accent || "-"}</p>
                <p style={estilos.infoTexto}>Estado: {p.estado}</p>
                <p style={estilos.infoTexto}>
                  Publicación: {p.publicacion ? "Sí" : "No"} | Destacado:{" "}
                  {p.destacado ? "Sí" : "No"} | Oferta: {p.oferta ? "Sí" : "No"}
                </p>
              </div>

              <div style={estilos.acciones}>
                <button
                  onClick={() => editarProducto(p)}
                  style={estilos.botonSecundario}
                >
                  Editar
                </button>

                <button
                  onClick={() => eliminarProducto(p.id)}
                  style={estilos.botonEliminar}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: "40px" }}>
        <h2 style={estilos.sectionTitle}>Configuración de tienda</h2>

        <form onSubmit={guardarConfiguracion} style={estilos.formulario}>
          <input
            name="nombre_tienda"
            placeholder="Nombre de la tienda"
            value={formConfig.nombre_tienda}
            onChange={handleConfigChange}
            style={estilos.input}
          />

          <input
            name="slogan"
            placeholder="Slogan"
            value={formConfig.slogan}
            onChange={handleConfigChange}
            style={estilos.input}
          />

          <input
            name="banner_titulo"
            placeholder="Título del banner"
            value={formConfig.banner_titulo}
            onChange={handleConfigChange}
            style={estilos.input}
          />

          <textarea
            name="banner_texto"
            placeholder="Texto del banner"
            value={formConfig.banner_texto}
            onChange={handleConfigChange}
            style={{ ...estilos.input, minHeight: "100px" }}
          />

          <input
            name="banner_boton"
            placeholder="Texto del botón"
            value={formConfig.banner_boton}
            onChange={handleConfigChange}
            style={estilos.input}
          />

          <input
            name="whatsapp"
            placeholder="WhatsApp general"
            value={formConfig.whatsapp}
            onChange={handleConfigChange}
            style={estilos.input}
          />

          <button type="submit" style={estilos.botonPrincipal}>
            {guardandoConfig
              ? "Guardando..."
              : configId
              ? "Actualizar configuración"
              : "Guardar configuración"}
          </button>
        </form>
      </section>

      <section style={{ marginBottom: "40px" }}>
        <h2 style={estilos.sectionTitle}>Pedidos recientes</h2>

        {pedidos.length === 0 ? (
          <div style={estilos.usuarioCard}>
            <p style={estilos.infoTexto}>No hay pedidos registrados.</p>
          </div>
        ) : (
          <div style={estilos.listaUsuarios}>
            {pedidos.map((pedido) => (
              <div key={pedido.id} style={estilos.usuarioCard}>
                <h3 style={{ fontSize: "22px", marginBottom: "10px" }}>
                  Pedido #{pedido.id.slice(0, 8)}
                </h3>

                <p style={estilos.infoTexto}>Cliente: {pedido.cliente_nombre}</p>
                <p style={estilos.infoTexto}>Correo: {pedido.cliente_correo}</p>
                <p style={estilos.infoTexto}>Total: S/ {pedido.total}</p>
                <p style={estilos.infoTexto}>
                  Método de pago: {pedido.metodo_pago}
                </p>

                <p style={estilos.infoTexto}>
                  Estado:{" "}
                  <span
                    style={{
                      color:
                        pedido.estado === "completado"
                          ? "#7CFFB2"
                          : pedido.estado === "cancelado"
                          ? "#FF8B8B"
                          : "#FFE082",
                      fontWeight: "bold",
                    }}
                  >
                    {pedido.estado}
                  </span>
                </p>

                <p style={estilos.infoTexto}>
                  Fecha: {new Date(pedido.created_at).toLocaleString()}
                </p>

                <div style={{ ...estilos.acciones, marginTop: "14px" }}>
                  <button
                    onClick={() => actualizarEstadoPedido(pedido.id, "pendiente")}
                    style={estilos.botonSecundario}
                  >
                    Pendiente
                  </button>

                  <button
                    onClick={() => actualizarEstadoPedido(pedido.id, "completado")}
                    style={estilos.botonSecundario}
                  >
                    Completado
                  </button>

                  <button
                    onClick={() => actualizarEstadoPedido(pedido.id, "cancelado")}
                    style={estilos.botonEliminar}
                  >
                    Cancelado
                  </button>
                </div>
              </div>
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
      "radial-gradient(circle at top, rgba(0,229,255,0.08), transparent 25%), #030507",
    color: "white",
    padding: "40px",
    position: "relative",
    overflow: "hidden",
  },
  fondoGlow: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(circle at 20% 20%, rgba(0,251,255,0.06), transparent 30%), radial-gradient(circle at 80% 10%, rgba(0,229,255,0.05), transparent 25%)",
    pointerEvents: "none",
  },
  header: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
    marginBottom: "40px",
  },
  titulo: {
    fontSize: "38px",
    marginBottom: "10px",
    letterSpacing: "1px",
    textShadow: "0 0 18px rgba(0,229,255,0.25)",
  },
  subtexto: {
    color: "#c7d7e2",
    marginBottom: "6px",
  },
  sectionTitle: {
    fontSize: "24px",
    marginBottom: "18px",
    color: "#00e5ff",
    textShadow: "0 0 12px rgba(0,229,255,0.25)",
  },
  gridCards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "18px",
  },
  card: {
    background: "rgba(11, 17, 24, 0.88)",
    border: "1px solid rgba(0,229,255,0.25)",
    borderRadius: "18px",
    padding: "22px",
    boxShadow: "0 0 20px rgba(0,229,255,0.08)",
    backdropFilter: "blur(8px)",
  },
  cardTitle: {
    marginBottom: "12px",
    color: "#dffcff",
    fontSize: "18px",
  },
  cardValue: {
    fontSize: "38px",
    fontWeight: "bold",
    color: "#00fbff",
    textShadow: "0 0 12px rgba(0,251,255,0.25)",
  },
  listaUsuarios: {
    display: "grid",
    gap: "18px",
  },
  usuarioCard: {
    background: "rgba(11, 17, 24, 0.88)",
    border: "1px solid rgba(0,229,255,0.22)",
    borderRadius: "18px",
    padding: "22px",
    boxShadow: "0 0 18px rgba(0,229,255,0.07)",
    position: "relative",
    zIndex: 1,
  },
  infoTexto: {
    color: "#d4e3ee",
    marginBottom: "6px",
  },
  acciones: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },
  formulario: {
    display: "grid",
    gap: "14px",
    background: "rgba(11, 17, 24, 0.88)",
    border: "1px solid rgba(0,229,255,0.22)",
    borderRadius: "18px",
    padding: "22px",
    position: "relative",
    zIndex: 1,
  },
  filtrosProductos: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "14px",
    marginBottom: "20px",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid rgba(0,229,255,0.22)",
    background: "#081018",
    color: "white",
    outline: "none",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#d4e3ee",
  },
  labelArchivo: {
    display: "block",
    marginBottom: "8px",
    color: "#d4e3ee",
  },
  imagenProducto: {
    width: "100%",
    maxWidth: "220px",
    height: "220px",
    objectFit: "cover",
    borderRadius: "14px",
    border: "1px solid rgba(0,229,255,0.22)",
    marginBottom: "14px",
    display: "block",
  },
  botonPrincipal: {
    background: "#00e5ff",
    color: "#001018",
    border: "none",
    borderRadius: "12px",
    padding: "12px 18px",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 0 16px rgba(0,229,255,0.25)",
  },
  botonSecundario: {
    background: "transparent",
    color: "#00e5ff",
    border: "1px solid rgba(0,229,255,0.35)",
    borderRadius: "10px",
    padding: "10px 14px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  botonEliminar: {
    background: "rgba(255, 80, 80, 0.12)",
    color: "#ff9a9a",
    border: "1px solid rgba(255, 120, 120, 0.3)",
    borderRadius: "10px",
    padding: "10px 14px",
    fontWeight: "bold",
    cursor: "pointer",
  },
}