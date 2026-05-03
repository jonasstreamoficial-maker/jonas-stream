"use client"

import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import toast from "react-hot-toast"
import styles from "./admin.module.css"

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

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: "▣" },
  { id: "productos", label: "Productos", icon: "◈" },
  { id: "pedidos", label: "Pedidos", icon: "◉" },
  { id: "usuarios", label: "Usuarios", icon: "◎" },
  { id: "comprobantes", label: "Comprobantes", icon: "▤" },
  { id: "inventario", label: "Inventario", icon: "▦" },
  { id: "creditos", label: "Créditos", icon: "✦" },
  { id: "configuracion", label: "Configuración", icon: "⚙" },
] as const

type TabId = (typeof tabs)[number]["id"]

export default function AdminPage() {
  const router = useRouter()

  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [cargando, setCargando] = useState(true)
  const [tabActiva, setTabActiva] = useState<TabId>("dashboard")
  const [busquedaGlobal, setBusquedaGlobal] = useState("")

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
    setTabActiva("productos")
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
  const totalPedidos = pedidos.length
  const pedidosCompletados = pedidos.filter((pedido) => pedido.estado === "completado").length
  const pedidosCancelados = pedidos.filter((pedido) => pedido.estado === "cancelado").length
  const ventasTotales = pedidos
    .filter((pedido) => pedido.estado === "completado")
    .reduce((acc, pedido) => acc + Number(pedido.total || 0), 0)
  const pedidosPendientes = pedidos.filter((pedido) => pedido.estado === "pendiente").length
  const usuariosPendientes = usuarios.filter((u) => u.estado === "pendiente").length
  const pedidosRecientes = pedidos.slice(0, 5)
  const productosBajoStock = productos.filter((p) => Number(p.stock) <= 3).slice(0, 6)
  const ticketPromedio = pedidosCompletados > 0 ? ventasTotales / pedidosCompletados : 0
  const tasaConversion = totalPedidos > 0 ? Math.round((pedidosCompletados / totalPedidos) * 100) : 0
  const saludInventario = totalProductos > 0 ? Math.max(0, Math.round(((totalProductos - productosBajoStock.length) / totalProductos) * 100)) : 100

  const resultadosGlobales = useMemo(() => {
    const query = busquedaGlobal.trim().toLowerCase()
    if (!query) return []

    const productosEncontrados = productos
      .filter((p) => `${p.nombre} ${p.categoria} ${p.tipo_venta}`.toLowerCase().includes(query))
      .slice(0, 4)
      .map((p) => ({ tipo: "Producto", titulo: p.nombre, detalle: `S/ ${p.precio} · Stock ${p.stock}`, tab: "productos" as TabId }))

    const pedidosEncontrados = pedidos
      .filter((p) => `${p.id} ${p.cliente_nombre} ${p.cliente_correo}`.toLowerCase().includes(query))
      .slice(0, 4)
      .map((p) => ({ tipo: "Pedido", titulo: `#${p.id.slice(0, 8)}`, detalle: `${p.cliente_nombre} · S/ ${p.total}`, tab: "pedidos" as TabId }))

    const usuariosEncontrados = usuarios
      .filter((u) => `${u.nombre} ${u.correo} ${u.rol}`.toLowerCase().includes(query))
      .slice(0, 4)
      .map((u) => ({ tipo: "Usuario", titulo: u.nombre, detalle: `${u.correo} · ${u.rol}`, tab: "usuarios" as TabId }))

    return [...productosEncontrados, ...pedidosEncontrados, ...usuariosEncontrados].slice(0, 8)
  }, [busquedaGlobal, productos, pedidos, usuarios])

  const productosFiltrados: Producto[] = [...productos]
    .filter((producto: Producto) => {
      const texto = `${producto.nombre} ${producto.descripcion} ${producto.categoria} ${producto.tipo_venta}`.toLowerCase()
      const coincideBusqueda = texto.includes(busquedaProducto.toLowerCase())
      const coincideEstado =
        filtroEstadoProducto === "todos" || producto.estado === filtroEstadoProducto

      return coincideBusqueda && coincideEstado
    })
    .sort((a: Producto, b: Producto) => {
      switch (ordenProducto) {
        case "nombre":
          return a.nombre.localeCompare(b.nombre)
        case "precio_mayor":
          return b.precio - a.precio
        case "precio_menor":
          return a.precio - b.precio
        default:
          return 0
      }
    })

  if (cargando) {
    return <AdminSkeleton />
  }

  return (
    <main className={styles.adminShell}>
      <div className={styles.backgroundGlow}></div>

      <aside className={styles.sidebar}>
        <div className={styles.brandBox}>
          <div className={styles.brandMark}>JS</div>
          <div>
            <p className={styles.brandEyebrow}>Admin panel</p>
            <h1>Jonas Stream</h1>
          </div>
        </div>

        <nav className={styles.nav}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setTabActiva(tab.id)}
              className={`${styles.navButton} ${
                tabActiva === tab.id ? styles.navButtonActive : ""
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <p>{usuario?.nombre}</p>
          <span>{usuario?.correo}</span>
          <button type="button" onClick={cerrarSesion} className={styles.logoutButton}>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <section className={styles.content}>
        <header className={styles.topbar}>
          <div>
            <p className={styles.kicker}>Control central</p>
            <h2>{tabs.find((tab) => tab.id === tabActiva)?.label}</h2>
            <span>Gestiona productos, usuarios, pedidos y configuración.</span>
          </div>

          <div className={styles.commandCenter}>
            <div className={styles.searchBox}>
              <span>⌘</span>
              <input
                type="search"
                placeholder="Buscar producto, pedido o usuario..."
                value={busquedaGlobal}
                onChange={(e) => setBusquedaGlobal(e.target.value)}
              />
              {resultadosGlobales.length > 0 && (
                <div className={styles.searchResults}>
                  {resultadosGlobales.map((item, index) => (
                    <button
                      key={`${item.tipo}-${item.titulo}-${index}`}
                      type="button"
                      onClick={() => {
                        setTabActiva(item.tab)
                        setBusquedaGlobal("")
                      }}
                    >
                      <span>{item.tipo}</span>
                      <strong>{item.titulo}</strong>
                      <small>{item.detalle}</small>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button type="button" onClick={cargarDatos} className={styles.refreshButton}>Actualizar</button>
            <div className={styles.topbarPill}>
              <span className={styles.statusDot}></span>
              Supabase conectado
            </div>
          </div>
        </header>

        {tabActiva === "dashboard" && (
          <div className={styles.sectionStack}>
            <div className={styles.metricsGrid}>
              <MetricCard title="Ventas totales" value={`S/ ${ventasTotales.toFixed(2)}`} detail="Pedidos completados" />
              <MetricCard title="Pedidos pendientes" value={pedidosPendientes} detail={`${totalPedidos} pedidos en total`} />
              <MetricCard title="Productos activos" value={productosActivos} detail={`${totalProductos} productos registrados`} />
              <MetricCard title="Usuarios pendientes" value={usuariosPendientes} detail={`${totalUsuarios} usuarios registrados`} />
              <MetricCard title="Ticket promedio" value={`S/ ${ticketPromedio.toFixed(2)}`} detail="Promedio completado" />
              <MetricCard title="Conversión" value={`${tasaConversion}%`} detail={`${pedidosCompletados} completados`} />
              <MetricCard title="Salud inventario" value={`${saludInventario}%`} detail={`${productosBajoStock.length} alertas de stock`} />
              <MetricCard title="Cancelados" value={pedidosCancelados} detail="Pedidos perdidos" />
            </div>

            <div className={styles.commandGrid}>
              <article className={`${styles.panel} ${styles.heroPanel}`}>
                <p className={styles.kicker}>Modo Dios</p>
                <h3>Centro de mando Jonas Stream</h3>
                <p>Resumen ejecutivo para decidir rápido: ventas, stock crítico, usuarios por aprobar y pedidos pendientes.</p>
                <div className={styles.heroActions}>
                  <button type="button" onClick={() => setTabActiva("productos")} className={styles.primaryButton}>Crear producto</button>
                  <button type="button" onClick={() => setTabActiva("pedidos")} className={styles.secondaryButton}>Ver pedidos</button>
                </div>
              </article>

              <article className={styles.panel}>
                <div className={styles.panelHeader}>
                  <div>
                    <p className={styles.kicker}>Alertas inteligentes</p>
                    <h3>Prioridades de hoy</h3>
                  </div>
                </div>
                <div className={styles.alertList}>
                  <PriorityItem label="Pedidos pendientes" value={pedidosPendientes} tone="warning" />
                  <PriorityItem label="Usuarios por aprobar" value={usuariosPendientes} tone="success" />
                  <PriorityItem label="Productos bajo stock" value={productosBajoStock.length} tone="danger" />
                  <PriorityItem label="Productos activos" value={productosActivos} tone="info" />
                </div>
              </article>
            </div>

            <div className={styles.dashboardGrid}>
              <article className={styles.panel}>
                <div className={styles.panelHeader}>
                  <div>
                    <p className={styles.kicker}>Actividad</p>
                    <h3>Pedidos recientes</h3>
                  </div>
                  <button type="button" onClick={() => setTabActiva("pedidos")} className={styles.linkButton}>
                    Ver todos
                  </button>
                </div>

                <div className={styles.compactList}>
                  {pedidosRecientes.length === 0 ? (
                    <EmptyState title="Sin pedidos" text="Aún no hay pedidos registrados." />
                  ) : (
                    pedidosRecientes.map((pedido) => (
                      <div key={pedido.id} className={styles.compactItem}>
                        <div>
                          <strong>{pedido.cliente_nombre}</strong>
                          <span>#{pedido.id.slice(0, 8)} · {new Date(pedido.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className={styles.compactRight}>
                          <strong>S/ {pedido.total}</strong>
                          <StatusBadge estado={pedido.estado} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </article>

              <article className={styles.panel}>
                <div className={styles.panelHeader}>
                  <div>
                    <p className={styles.kicker}>Inventario</p>
                    <h3>Productos con bajo stock</h3>
                  </div>
                  <button type="button" onClick={() => setTabActiva("productos")} className={styles.linkButton}>
                    Gestionar
                  </button>
                </div>

                <div className={styles.compactList}>
                  {productosBajoStock.length === 0 ? (
                    <EmptyState title="Stock estable" text="No hay productos críticos por ahora." />
                  ) : (
                    productosBajoStock.map((producto) => (
                      <div key={producto.id} className={styles.compactItem}>
                        <div>
                          <strong>{producto.nombre}</strong>
                          <span>{producto.categoria || "Sin categoría"}</span>
                        </div>
                        <div className={styles.stockPill}>{producto.stock} und.</div>
                      </div>
                    ))
                  )}
                </div>
              </article>
            </div>
          </div>
        )}

        {tabActiva === "productos" && (
          <div className={styles.sectionStack}>
            <article className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <p className={styles.kicker}>Catálogo</p>
                  <h3>{editandoId ? "Editar producto" : "Crear producto"}</h3>
                </div>
                {editandoId && <span className={styles.editBadge}>Modo edición</span>}
              </div>

              <div className={styles.productPreviewStrip}>
                <div className={styles.previewOrb}>{formProducto.nombre?.slice(0, 2).toUpperCase() || "JS"}</div>
                <div>
                  <p>Vista rápida</p>
                  <h4>{formProducto.nombre || "Nuevo producto premium"}</h4>
                  <span>S/ {formProducto.precio || "0"} · Stock {formProducto.stock || "0"} · {formProducto.estado_catalogo || "ACTIVO"}</span>
                </div>
              </div>

              <form onSubmit={guardarProducto} className={styles.formGrid}>
                <input name="nombre" placeholder="Nombre" value={formProducto.nombre} onChange={handleProductoChange} className={styles.input} />

                <textarea name="descripcion" placeholder="Descripción" value={formProducto.descripcion} onChange={handleProductoChange} className={`${styles.input} ${styles.textarea}`} />

                <input name="precio" type="number" placeholder="Precio" value={formProducto.precio} onChange={handleProductoChange} className={styles.input} />
                <input name="precio_antes" type="number" placeholder="Precio antes" value={formProducto.precio_antes} onChange={handleProductoChange} className={styles.input} />
                <input name="stock" type="number" placeholder="Stock" value={formProducto.stock} onChange={handleProductoChange} className={styles.input} />
                <input name="categoria" placeholder="Categoría" value={formProducto.categoria} onChange={handleProductoChange} className={styles.input} />

                <select name="tipo_venta" value={formProducto.tipo_venta} onChange={handleProductoChange} className={styles.input}>
                  <option value="">Tipo de venta</option>
                  <option value="Cuenta Completa">Cuenta Completa</option>
                  <option value="Perfiles">Perfiles</option>
                </select>

                <input name="duracion" placeholder="Duración (ej: 1 mes, 12 meses)" value={formProducto.duracion} onChange={handleProductoChange} className={styles.input} />
                <input name="proveedor" placeholder="Proveedor" value={formProducto.proveedor} onChange={handleProductoChange} className={styles.input} />
                <input name="stock_texto" placeholder="Texto de stock" value={formProducto.stock_texto} onChange={handleProductoChange} className={styles.input} />

                <select name="estado_catalogo" value={formProducto.estado_catalogo} onChange={handleProductoChange} className={styles.input}>
                  <option value="ACTIVO">ACTIVO</option>
                  <option value="LIMITADO">LIMITADO</option>
                  <option value="AGOTADO">AGOTADO</option>
                </select>

                <input name="badge" placeholder="Etiqueta visual" value={formProducto.badge} onChange={handleProductoChange} className={styles.input} />

                <select name="accent" value={formProducto.accent} onChange={handleProductoChange} className={styles.input}>
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

                <input name="whatsapp" placeholder="WhatsApp" value={formProducto.whatsapp} onChange={handleProductoChange} className={styles.input} />

                <select name="estado" value={formProducto.estado} onChange={handleProductoChange} className={styles.input}>
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>

                <div className={styles.checkGroup}>
                  <label><input type="checkbox" name="renovable" checked={formProducto.renovable} onChange={handleProductoChange} /> Renovable</label>
                  <label><input type="checkbox" name="publicacion" checked={formProducto.publicacion} onChange={handleProductoChange} /> Publicación activa</label>
                  <label><input type="checkbox" name="destacado" checked={formProducto.destacado} onChange={handleProductoChange} /> Destacado</label>
                  <label><input type="checkbox" name="oferta" checked={formProducto.oferta} onChange={handleProductoChange} /> Oferta</label>
                </div>

                <div className={styles.fileBox}>
                  <label>Imagen del producto</label>
                  <input type="file" accept="image/*" onChange={(e) => setImagenFile(e.target.files?.[0] || null)} className={styles.input} />
                  {imagenFile && <p>Archivo seleccionado: {imagenFile.name}</p>}
                  {subiendoImagen && <p>Subiendo imagen...</p>}
                </div>

                <div className={styles.formActions}>
                  <button type="submit" className={styles.primaryButton}>
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
                      className={styles.secondaryButton}
                    >
                      Cancelar edición
                    </button>
                  )}
                </div>
              </form>
            </article>

            <article className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <p className={styles.kicker}>Productos</p>
                  <h3>Lista de productos</h3>
                </div>
                <span className={styles.countBadge}>{productosFiltrados.length} resultados</span>
              </div>

              <div className={styles.filtersGrid}>
                <input type="text" placeholder="Buscar producto..." value={busquedaProducto} onChange={(e) => setBusquedaProducto(e.target.value)} className={styles.input} />

                <select value={filtroEstadoProducto} onChange={(e) => setFiltroEstadoProducto(e.target.value)} className={styles.input}>
                  <option value="todos">Todos los estados</option>
                  <option value="activo">Activos</option>
                  <option value="inactivo">Inactivos</option>
                </select>

                <select value={ordenProducto} onChange={(e) => setOrdenProducto(e.target.value)} className={styles.input}>
                  <option value="recientes">Orden normal</option>
                  <option value="nombre">Nombre A-Z</option>
                  <option value="precio_mayor">Precio mayor a menor</option>
                  <option value="precio_menor">Precio menor a mayor</option>
                </select>
              </div>

              <div className={styles.productGrid}>
                {productosFiltrados.map((p) => (
                  <article key={p.id} className={styles.productCard}>
                    {p.imagen ? (
                      <img src={p.imagen} alt={p.nombre} className={styles.productImage} />
                    ) : (
                      <div className={styles.productImagePlaceholder}>JS</div>
                    )}

                    <div className={styles.productBody}>
                      <div className={styles.productTopline}>
                        <StatusBadge estado={p.estado} />
                        {p.oferta && <span className={styles.offerBadge}>Oferta</span>}
                      </div>

                      <h4>{p.nombre}</h4>
                      <p>{p.descripcion || "Sin descripción"}</p>

                      <div className={styles.productMeta}>
                        <span>S/ {p.precio}</span>
                        <span>Stock: {p.stock}</span>
                        <span>{p.categoria || "Sin categoría"}</span>
                        <span>{p.tipo_venta || "Sin tipo"}</span>
                        <span>{p.duracion || "-"}</span>
                        <span>{p.proveedor || "Jonas Stream"}</span>
                        <span>{p.estado_catalogo || "-"}</span>
                        <span>{p.renovable ? "Renovable" : "No renovable"}</span>
                      </div>

                      <div className={styles.cardActions}>
                        <button onClick={() => editarProducto(p)} className={styles.secondaryButton}>Editar</button>
                        <button onClick={() => eliminarProducto(p.id)} className={styles.dangerButton}>Eliminar</button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </article>
          </div>
        )}

        {tabActiva === "pedidos" && (
          <article className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <p className={styles.kicker}>Ventas</p>
                <h3>Pedidos recientes</h3>
              </div>
              <span className={styles.countBadge}>{pedidos.length} pedidos</span>
            </div>

            {pedidos.length === 0 ? (
              <EmptyState title="No hay pedidos" text="Aún no hay pedidos registrados." />
            ) : (
              <div className={styles.cardsGrid}>
                {pedidos.map((pedido) => (
                  <article key={pedido.id} className={styles.orderCard}>
                    <div className={styles.cardHeaderLine}>
                      <h4>Pedido #{pedido.id.slice(0, 8)}</h4>
                      <StatusBadge estado={pedido.estado} />
                    </div>

                    <div className={styles.infoGrid}>
                      <span>Cliente</span><strong>{pedido.cliente_nombre}</strong>
                      <span>Correo</span><strong>{pedido.cliente_correo}</strong>
                      <span>Total</span><strong>S/ {pedido.total}</strong>
                      <span>Método</span><strong>{pedido.metodo_pago}</strong>
                      <span>Fecha</span><strong>{new Date(pedido.created_at).toLocaleString()}</strong>
                    </div>

                    <div className={styles.cardActions}>
                      <button onClick={() => actualizarEstadoPedido(pedido.id, "pendiente")} className={styles.secondaryButton}>Pendiente</button>
                      <button onClick={() => actualizarEstadoPedido(pedido.id, "completado")} className={styles.secondaryButton}>Completado</button>
                      <button onClick={() => actualizarEstadoPedido(pedido.id, "cancelado")} className={styles.dangerButton}>Cancelado</button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </article>
        )}

        {tabActiva === "usuarios" && (
          <article className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <p className={styles.kicker}>Accesos</p>
                <h3>Gestión de usuarios</h3>
              </div>
              <span className={styles.countBadge}>{usuarios.length} usuarios</span>
            </div>

            <div className={styles.cardsGrid}>
              {usuarios.map((u) => (
                <article key={u.id} className={styles.userCard}>
                  <div className={styles.avatar}>{u.nombre?.slice(0, 2).toUpperCase() || "US"}</div>

                  <div>
                    <h4>{u.nombre}</h4>
                    <p>{u.correo}</p>
                  </div>

                  <div className={styles.userMeta}>
                    <span>Rol: <strong>{u.rol}</strong></span>
                    <span>Estado: <StatusBadge estado={u.estado} /></span>
                  </div>

                  <div className={styles.cardActions}>
                    <button onClick={() => actualizarEstado(u.id, "aprobado")} className={styles.secondaryButton}>Aprobar</button>
                    <button onClick={() => actualizarEstado(u.id, "rechazado")} className={styles.secondaryButton}>Rechazar</button>
                    <button onClick={() => cambiarRol(u.id, "cliente")} className={styles.secondaryButton}>Cliente</button>
                    <button onClick={() => cambiarRol(u.id, "proveedor")} className={styles.secondaryButton}>Proveedor</button>
                    <button onClick={() => cambiarRol(u.id, "admin")} className={styles.secondaryButton}>Admin</button>
                    <button onClick={() => eliminarUsuario(u.id)} className={styles.dangerButton}>Eliminar</button>
                  </div>
                </article>
              ))}
            </div>
          </article>
        )}

        {tabActiva === "comprobantes" && (
          <PlaceholderPanel
            title="Comprobantes"
            text="Aquí podrás revisar comprobantes, validar pagos y adjuntar evidencias cuando agregues esa lógica."
            buttonText="Próximamente"
          />
        )}

        {tabActiva === "inventario" && (
          <PlaceholderPanel
            title="Inventario inteligente"
            text="Espacio reservado para movimientos, alertas de stock, proveedores y reposición automática."
            buttonText="Placeholder"
          />
        )}

        {tabActiva === "creditos" && (
          <PlaceholderPanel
            title="Créditos"
            text="Zona preparada para saldos, créditos de proveedores, historial y control financiero."
            buttonText="Placeholder"
          />
        )}

        {tabActiva === "configuracion" && (
          <article className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <p className={styles.kicker}>Personalización</p>
                <h3>Configuración de tienda</h3>
              </div>
              {configId && <span className={styles.countBadge}>Configuración activa</span>}
            </div>

            <form onSubmit={guardarConfiguracion} className={styles.formGrid}>
              <input name="nombre_tienda" placeholder="Nombre de la tienda" value={formConfig.nombre_tienda} onChange={handleConfigChange} className={styles.input} />
              <input name="slogan" placeholder="Slogan" value={formConfig.slogan} onChange={handleConfigChange} className={styles.input} />
              <input name="banner_titulo" placeholder="Título del banner" value={formConfig.banner_titulo} onChange={handleConfigChange} className={styles.input} />
              <textarea name="banner_texto" placeholder="Texto del banner" value={formConfig.banner_texto} onChange={handleConfigChange} className={`${styles.input} ${styles.textarea}`} />
              <input name="banner_boton" placeholder="Texto del botón" value={formConfig.banner_boton} onChange={handleConfigChange} className={styles.input} />
              <input name="whatsapp" placeholder="WhatsApp general" value={formConfig.whatsapp} onChange={handleConfigChange} className={styles.input} />

              <div className={styles.formActions}>
                <button type="submit" className={styles.primaryButton}>
                  {guardandoConfig
                    ? "Guardando..."
                    : configId
                    ? "Actualizar configuración"
                    : "Guardar configuración"}
                </button>
              </div>
            </form>
          </article>
        )}
      </section>
    </main>
  )
}

function AdminSkeleton() {
  return (
    <main className={styles.adminShell}>
      <div className={styles.backgroundGlow}></div>

      <aside className={styles.sidebar}>
        <div className={styles.brandBox}>
          <div className={styles.brandMark}>JS</div>
          <div>
            <p className={styles.brandEyebrow}>Admin panel</p>
            <h1>Jonas Stream</h1>
          </div>
        </div>

        <nav className={styles.nav}>
          {tabs.map((tab) => (
            <div key={tab.id} className={`${styles.navButton} ${styles.skeletonLine}`}>
              <span>{tab.icon}</span>
              {tab.label}
            </div>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.skeletonTitle}></div>
          <div className={styles.skeletonText}></div>
          <div className={styles.skeletonButton}></div>
        </div>
      </aside>

      <section className={styles.content}>
        <header className={styles.topbar}>
          <div>
            <p className={styles.kicker}>Control central</p>
            <div className={styles.skeletonHeroTitle}></div>
            <div className={styles.skeletonHeroText}></div>
          </div>
          <div className={styles.topbarPill}>
            <span className={styles.statusDot}></span>
            Supabase conectado
          </div>
        </header>

        <div className={styles.sectionStack}>
          <div className={styles.metricsGrid}>
            {Array.from({ length: 4 }).map((_, index) => (
              <article key={index} className={`${styles.metricCard} ${styles.skeletonCard}`}>
                <div className={styles.skeletonText}></div>
                <div className={styles.skeletonNumber}></div>
                <div className={styles.skeletonTextSmall}></div>
              </article>
            ))}
          </div>

          <div className={styles.dashboardGrid}>
            {Array.from({ length: 2 }).map((_, index) => (
              <article key={index} className={`${styles.panel} ${styles.skeletonPanel}`}>
                <div className={styles.skeletonTitle}></div>
                <div className={styles.skeletonItem}></div>
                <div className={styles.skeletonItem}></div>
                <div className={styles.skeletonItem}></div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

function MetricCard({
  title,
  value,
  detail,
}: {
  title: string
  value: string | number
  detail: string
}) {
  return (
    <article className={styles.metricCard}>
      <p>{title}</p>
      <strong>{value}</strong>
      <span>{detail}</span>
    </article>
  )
}

function StatusBadge({ estado }: { estado: string }) {
  const normalized = estado?.toLowerCase()

  return (
    <span
      className={`${styles.statusBadge} ${
        normalized === "completado" || normalized === "aprobado" || normalized === "activo"
          ? styles.statusSuccess
          : normalized === "cancelado" || normalized === "rechazado" || normalized === "inactivo"
          ? styles.statusDanger
          : styles.statusWarning
      }`}
    >
      {estado}
    </span>
  )
}

function PriorityItem({ label, value, tone }: { label: string; value: number; tone: "success" | "warning" | "danger" | "info" }) {
  return (
    <div className={`${styles.priorityItem} ${styles[`priority${tone[0].toUpperCase()}${tone.slice(1)}`]}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className={styles.emptyState}>
      <div>✦</div>
      <h4>{title}</h4>
      <p>{text}</p>
    </div>
  )
}

function PlaceholderPanel({
  title,
  text,
  buttonText,
}: {
  title: string
  text: string
  buttonText: string
}) {
  return (
    <article className={`${styles.panel} ${styles.placeholderPanel}`}>
      <div className={styles.placeholderOrb}>✦</div>
      <p className={styles.kicker}>Módulo preparado</p>
      <h3>{title}</h3>
      <p>{text}</p>
      <button type="button" className={styles.secondaryButton}>{buttonText}</button>
    </article>
  )
}
