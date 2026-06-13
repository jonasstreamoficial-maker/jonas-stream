"use client"

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
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
  created_at?: string | null
}

type Pedido = {
  id: string
  cliente_nombre: string
  cliente_correo: string
  total: number
  estado: string
  metodo_pago: string
  created_at: string
  comprobante_url?: string | null
  comprobante?: string | null
  captura_pago?: string | null
  voucher_url?: string | null
  producto_nombre?: string | null
}

type Comprobante = {
  id: string
  pedido_id?: string | null
  usuario_id?: string | null
  cliente_nombre?: string | null
  cliente_correo?: string | null
  url?: string | null
  archivo_url?: string | null
  imagen_url?: string | null
  comprobante_url?: string | null
  estado?: string | null
  metodo_pago?: string | null
  monto?: number | null
  detalle?: string | null
  created_at?: string | null
}



type CuentaInventario = {
  id: string
  producto_id?: string | null
  producto_nombre?: string | null
  correo: string
  clave: string
  perfil?: string | null
  pin_perfil?: string | null
  pin_acceso?: string | null
  estado: string
  cliente_id?: string | null
  cliente_nombre?: string | null
  cliente_correo?: string | null
  pedido_id?: string | null
  cliente_inicio?: string | null
  cliente_fin?: string | null
  observacion_admin?: string | null
  created_at?: string | null
  updated_at?: string | null
}

type AdminLog = {
  id: string
  accion: string
  entidad: string
  entidad_id?: string | null
  actor_nombre?: string | null
  actor_correo?: string | null
  detalle?: string | null
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

type MetricTone = "success" | "warning" | "danger" | "info" | "neutral"

type OrdenProducto = "recientes" | "nombre" | "precio_mayor" | "precio_menor" | "stock_menor"
type OrdenPedido = "recientes" | "monto_mayor" | "monto_menor"

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


const cuentaInicial = {
  producto_id: "",
  producto_nombre: "",
  correo: "",
  clave: "",
  perfil: "",
  pin_perfil: "",
  pin_acceso: "",
  estado: "disponible",
  observacion_admin: "",
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
  { id: "cuentas", label: "Cuentas", icon: "▧" },
  { id: "inventario", label: "Inventario", icon: "▦" },
  { id: "creditos", label: "Créditos", icon: "✦" },
  { id: "historial", label: "Historial", icon: "◷" },
  { id: "configuracion", label: "Configuración", icon: "⚙" },
] as const

type TabId = (typeof tabs)[number]["id"]


const navGroups: { title: string; items: TabId[] }[] = [
  { title: "Inicio", items: ["dashboard"] },
  { title: "Operación", items: ["pedidos", "comprobantes", "cuentas", "inventario"] },
  { title: "Gestión", items: ["productos", "usuarios", "creditos"] },
  { title: "Sistema", items: ["historial", "configuracion"] },
]

const estadosPedido = ["todos", "pendiente", "completado", "cancelado"]
const estadosUsuario = ["todos", "pendiente", "aprobado", "rechazado"]
const rolesUsuario = ["todos", "cliente", "proveedor", "admin"]

const normalizarTexto = (valor?: string | number | null) => String(valor ?? "").trim().toLowerCase()
const formatearSoles = (valor: number) => `S/ ${Number(valor || 0).toFixed(2)}`
const fechaLegible = (fecha?: string | null) => {
  if (!fecha) return "Sin fecha"
  const date = new Date(fecha)
  if (Number.isNaN(date.getTime())) return "Sin fecha"
  return date.toLocaleString("es-PE", { dateStyle: "medium", timeStyle: "short" })
}
const obtenerComprobanteUrl = (item: Pedido | Comprobante) => {
  const posibleComprobante = item as Partial<Pedido & Comprobante>

  return (
    posibleComprobante.url ||
    posibleComprobante.archivo_url ||
    posibleComprobante.imagen_url ||
    posibleComprobante.comprobante_url ||
    posibleComprobante.comprobante ||
    posibleComprobante.captura_pago ||
    posibleComprobante.voucher_url ||
    null
  )
}

export default function AdminPage() {
  const router = useRouter()

  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const usuarioRef = useRef<Usuario | null>(null)
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [comprobantes, setComprobantes] = useState<Comprobante[]>([])
  const [cuentas, setCuentas] = useState<CuentaInventario[]>([])
  const [logs, setLogs] = useState<AdminLog[]>([])
  const [cargando, setCargando] = useState(true)
  const [tabActiva, setTabActiva] = useState<TabId>("dashboard")
  const [busquedaGlobal, setBusquedaGlobal] = useState("")
  const [ultimaActualizacion, setUltimaActualizacion] = useState<string | null>(null)
  const [eventosLive, setEventosLive] = useState<string[]>([])
  const [limiteProductos, setLimiteProductos] = useState(12)
  const [limitePedidos, setLimitePedidos] = useState(12)
  const [limiteComprobantes, setLimiteComprobantes] = useState(12)
  const [limiteLogs, setLimiteLogs] = useState(18)

  const [formProducto, setFormProducto] = useState(productoInicial)
  const [editandoId, setEditandoId] = useState<string | null>(null)

  const [busquedaProducto, setBusquedaProducto] = useState("")
  const [filtroEstadoProducto, setFiltroEstadoProducto] = useState("todos")
  const [filtroStockProducto, setFiltroStockProducto] = useState("todos")
  const [ordenProducto, setOrdenProducto] = useState<OrdenProducto>("recientes")

  const [busquedaPedido, setBusquedaPedido] = useState("")
  const [filtroEstadoPedido, setFiltroEstadoPedido] = useState("todos")
  const [filtroMetodoPago, setFiltroMetodoPago] = useState("todos")
  const [filtroComprobantePedido, setFiltroComprobantePedido] = useState("todos")
  const [ordenPedido, setOrdenPedido] = useState<OrdenPedido>("recientes")
  const [vistaPedidos, setVistaPedidos] = useState<"tarjetas" | "tabla">("tabla")
  const [pedidosSeleccionados, setPedidosSeleccionados] = useState<string[]>([])
  const [procesandoMasivo, setProcesandoMasivo] = useState(false)

  const [busquedaUsuario, setBusquedaUsuario] = useState("")
  const [filtroEstadoUsuario, setFiltroEstadoUsuario] = useState("todos")
  const [filtroRolUsuario, setFiltroRolUsuario] = useState("todos")
  const [vistaUsuarios, setVistaUsuarios] = useState<"tarjetas" | "tabla">("tabla")

  const [busquedaComprobante, setBusquedaComprobante] = useState("")
  const [filtroEstadoComprobante, setFiltroEstadoComprobante] = useState("todos")
  const [vistaComprobantes, setVistaComprobantes] = useState<"revision" | "tabla">("revision")

  const [busquedaHistorial, setBusquedaHistorial] = useState("")
  const [filtroEntidadLog, setFiltroEntidadLog] = useState("todos")

  const [configId, setConfigId] = useState<string | null>(null)
  const [formConfig, setFormConfig] = useState(configuracionInicial)
  const [guardandoConfig, setGuardandoConfig] = useState(false)

  const [imagenFile, setImagenFile] = useState<File | null>(null)
  const [subiendoImagen, setSubiendoImagen] = useState(false)
  const [guardandoProducto, setGuardandoProducto] = useState(false)
  const [comprobantesDisponibles, setComprobantesDisponibles] = useState(true)
  const [cuentasDisponibles, setCuentasDisponibles] = useState(true)
  const [sincronizandoInventario, setSincronizandoInventario] = useState(false)
  const [busquedaInventario, setBusquedaInventario] = useState("")
  const [filtroInventario, setFiltroInventario] = useState<"todos" | "critico" | "agotado" | "bajo" | "estable">("critico")

  const [formCuenta, setFormCuenta] = useState(cuentaInicial)
  const [editandoCuentaId, setEditandoCuentaId] = useState<string | null>(null)
  const [guardandoCuenta, setGuardandoCuenta] = useState(false)
  const [busquedaCuenta, setBusquedaCuenta] = useState("")
  const [filtroCuentaEstado, setFiltroCuentaEstado] = useState("todos")

  const reproducirBeep = useCallback(() => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const audioContext = new AudioContextClass()
      const oscillator = audioContext.createOscillator()
      const gain = audioContext.createGain()
      oscillator.connect(gain)
      gain.connect(audioContext.destination)
      oscillator.frequency.value = 880
      gain.gain.setValueAtTime(0.025, audioContext.currentTime)
      oscillator.start()
      oscillator.stop(audioContext.currentTime + 0.12)
    } catch {
      // Algunos navegadores bloquean audio automático. No afecta el panel.
    }
  }, [])

  const registrarEvento = useCallback((mensaje: string, sonar = false) => {
    setEventosLive((prev) => [mensaje, ...prev].slice(0, 8))
    if (sonar) reproducirBeep()
  }, [reproducirBeep])

  const registrarLog = useCallback(async (
    accion: string,
    entidad: string,
    entidadId?: string,
    detalle?: string
  ) => {
    try {
      await supabase.rpc("log_admin_action", {
        p_accion: accion.toUpperCase(),
        p_entidad: entidad,
        p_entidad_id: entidadId || null,
        p_detalle: detalle || null,
      })
    } catch (err) {
      console.error("Error log:", err)
    }
  }, [])

  const cargarDatos = useCallback(async (usuarioActual?: Usuario | null, mostrarSkeleton = false) => {
    if (mostrarSkeleton) setCargando(true)

    const adminActual = usuarioActual ?? usuarioRef.current
    const esProveedorActual = adminActual?.rol === "proveedor"

    const usuariosQuery = supabase.from("usuarios").select("*").order("nombre", { ascending: true })
    const productosQuery = supabase.from("productos").select("*").order("created_at", { ascending: false })
    const pedidosQuery = supabase.from("pedidos").select("*").order("created_at", { ascending: false })

    if (esProveedorActual && adminActual?.nombre) {
      productosQuery.eq("proveedor", adminActual.nombre)
    }

    const [usuariosResult, productosResult, pedidosResult, logsResult, configResult, comprobantesResult, cuentasResult] = await Promise.all([
      esProveedorActual && adminActual?.id ? usuariosQuery.eq("id", adminActual.id) : usuariosQuery,
      productosQuery,
      pedidosQuery,
      supabase.from("admin_logs").select("*").order("created_at", { ascending: false }).limit(80),
      supabase.from("configuracion_tienda").select("*").order("created_at", { ascending: false }).limit(1),
      supabase.from("comprobantes").select("*").order("created_at", { ascending: false }).limit(80),
      supabase.from("cuentas").select("*").order("created_at", { ascending: false }).limit(300),
    ])

    if (usuariosResult.data) setUsuarios(usuariosResult.data as Usuario[])
    if (productosResult.data) setProductos(productosResult.data as Producto[])
    if (pedidosResult.data) setPedidos(pedidosResult.data as Pedido[])
    if (logsResult.data) setLogs(logsResult.data as AdminLog[])

    if (comprobantesResult.error) {
      setComprobantesDisponibles(false)
      setComprobantes([])
    } else {
      setComprobantesDisponibles(true)
      setComprobantes((comprobantesResult.data || []) as Comprobante[])
    }

    if (cuentasResult.error) {
      setCuentasDisponibles(false)
      setCuentas([])
    } else {
      setCuentasDisponibles(true)
      setCuentas((cuentasResult.data || []) as CuentaInventario[])
    }

    if (configResult.data && configResult.data.length > 0) {
      const config = configResult.data[0] as ConfiguracionTienda
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

    setUltimaActualizacion(new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" }))
    setCargando(false)
  }, [])

  useEffect(() => {
    const validarAcceso = async () => {
      const leerUsuarioLocal = () => {
        try {
          const guardado = localStorage.getItem("usuario")
          if (!guardado) return null
          return JSON.parse(guardado) as Usuario
        } catch {
          return null
        }
      }

      const usuarioLocal = leerUsuarioLocal()

      const usarUsuarioLocalTemporal = async () => {
        if (!usuarioLocal) return false
        const rolPermitido = usuarioLocal.rol === "admin" || usuarioLocal.rol === "proveedor"
        const estadoPermitido = usuarioLocal.estado === "aprobado" || usuarioLocal.estado === "activo"
        if (!rolPermitido || !estadoPermitido) return false

        usuarioRef.current = usuarioLocal
        setUsuario(usuarioLocal)
        await cargarDatos(usuarioLocal, true)
        return true
      }

      let session = null
      let sessionError = null

      for (let intento = 0; intento < 4; intento += 1) {
        const resultado = await supabase.auth.getSession()
        session = resultado.data.session
        sessionError = resultado.error

        if (session?.user?.email) break
        await new Promise((resolve) => window.setTimeout(resolve, 300))
      }

      if (sessionError || !session?.user?.email) {
        const accesoLocal = await usarUsuarioLocalTemporal()
        if (accesoLocal) return

        localStorage.removeItem("usuario")
        router.replace("/login")
        return
      }

      const { data: usuarioData, error: usuarioError } = await supabase
        .from("usuarios")
        .select("id,nombre,correo,rol,estado")
        .eq("id", session.user.id)
        .maybeSingle()

      if (usuarioError || !usuarioData) {
        const accesoLocal = await usarUsuarioLocalTemporal()
        if (accesoLocal) return

        await supabase.auth.signOut()
        localStorage.removeItem("usuario")
        toast.error("Tu usuario no existe en la tabla usuarios")
        router.replace("/login")
        return
      }

      const usuarioParseado = usuarioData as Usuario
      const rolPermitido = usuarioParseado.rol === "admin" || usuarioParseado.rol === "proveedor"
      const estadoPermitido = usuarioParseado.estado === "aprobado" || usuarioParseado.estado === "activo"

      if (!rolPermitido || usuarioParseado.estado === "rechazado") {
        await supabase.auth.signOut()
        localStorage.removeItem("usuario")
        router.replace("/login")
        return
      }

      if (!estadoPermitido) {
        await supabase.auth.signOut()
        localStorage.removeItem("usuario")
        toast("Tu cuenta está pendiente de aprobación")
        router.replace("/login")
        return
      }

      usuarioRef.current = usuarioParseado
      setUsuario(usuarioParseado)
      localStorage.setItem("usuario", JSON.stringify(usuarioParseado))
      await cargarDatos(usuarioParseado, true)
    }

    validarAcceso()
  }, [router, cargarDatos])

  useEffect(() => {
    const canal = supabase
      .channel("jonas-stream-admin-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "pedidos" }, (payload) => {
        const nuevoEstado = (payload.new as Pedido | undefined)?.estado
        registrarEvento(nuevoEstado === "completado" ? "Venta completada" : "Movimiento detectado en pedidos", nuevoEstado === "completado")
        if (nuevoEstado === "completado") toast.success("Venta completada")
        cargarDatos()
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "productos" }, () => {
        registrarEvento("Cambio detectado en productos")
        cargarDatos()
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "cuentas" }, () => {
        registrarEvento("Cambio detectado en inventario de cuentas")
        cargarDatos()
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "usuarios" }, () => {
        registrarEvento("Cambio detectado en usuarios")
        cargarDatos()
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "admin_logs" }, () => {
        registrarEvento("Nuevo registro en historial")
        cargarDatos()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(canal)
    }
  }, [cargarDatos, registrarEvento])

  const actualizarEstado = async (id: string, nuevoEstado: string) => {
    const usuarioObjetivo = usuarios.find((u) => u.id === id)
    const { error } = await supabase.from("usuarios").update({ estado: nuevoEstado }).eq("id", id)

    if (!error) {
      setUsuarios((prev) => prev.map((u) => (u.id === id ? { ...u, estado: nuevoEstado } : u)))
      registrarEvento(`Usuario ${usuarioObjetivo?.nombre || ""} actualizado a ${nuevoEstado}`)
      await registrarLog("actualizar_estado", "usuarios", id, `Estado: ${nuevoEstado}`)
      toast.success(`Usuario ${nuevoEstado}`)
      await cargarDatos()
    } else {
      toast.error("No se pudo actualizar el estado")
    }
  }

  const cambiarRol = async (id: string, nuevoRol: string) => {
    const { error } = await supabase.from("usuarios").update({ rol: nuevoRol }).eq("id", id)

    if (!error) {
      setUsuarios((prev) => prev.map((u) => (u.id === id ? { ...u, rol: nuevoRol } : u)))
      registrarEvento(`Rol actualizado a ${nuevoRol}`)
      await registrarLog("cambiar_rol", "usuarios", id, `Rol: ${nuevoRol}`)
      toast.success(`Rol actualizado a ${nuevoRol}`)
      await cargarDatos()
    } else {
      toast.error("No se pudo cambiar el rol")
    }
  }

  const eliminarUsuario = async (id: string) => {
    const confirmar = confirm("¿Seguro que quieres eliminar este usuario? Esta acción no se puede deshacer.")
    if (!confirmar) return

    const { error } = await supabase.from("usuarios").delete().eq("id", id)

    if (!error) {
      setUsuarios((prev) => prev.filter((u) => u.id !== id))
      registrarEvento("Usuario eliminado")
      await registrarLog("eliminar", "usuarios", id, "Usuario eliminado")
      toast.success("Usuario eliminado")
      await cargarDatos()
    } else {
      toast.error("No se pudo eliminar el usuario")
    }
  }

  const calcularEstadoInventario = (stock: number) => ({
    estado_catalogo: stock <= 0 ? "AGOTADO" : stock <= 3 ? "LIMITADO" : "ACTIVO",
    publicacion: stock > 0,
    estado: stock > 0 ? "activo" : "inactivo",
  })

  const ajustarStockProducto = async (producto: Producto, cantidad: number) => {
    const stockActual = Number(producto.stock || 0)
    const nuevoStock = Math.max(0, stockActual + cantidad)
    const payload = {
      stock: nuevoStock,
      ...calcularEstadoInventario(nuevoStock),
    }

    const { error } = await supabase.from("productos").update(payload).eq("id", producto.id)

    if (error) {
      toast.error("No se pudo ajustar el stock")
      return false
    }

    setProductos((prev) => prev.map((p) => (p.id === producto.id ? { ...p, ...payload } : p)))
    await registrarLog("ajustar_stock", "productos", producto.id, `${producto.nombre}: ${cantidad > 0 ? "+" : ""}${cantidad} unidad(es). Stock final: ${nuevoStock}`)
    registrarEvento(`Stock actualizado: ${producto.nombre}`)
    toast.success(`Stock actualizado: ${producto.nombre}`)
    return true
  }

  const descontarStockPorPedido = async (pedido: Pedido) => {
    if (!pedido.producto_nombre) return false

    const productoMatch = productos.find((producto) => {
      const productoNombre = normalizarTexto(producto.nombre)
      const pedidoProducto = normalizarTexto(pedido.producto_nombre)
      return productoNombre === pedidoProducto || productoNombre.includes(pedidoProducto) || pedidoProducto.includes(productoNombre)
    })

    if (!productoMatch) {
      await registrarLog("stock_no_encontrado", "pedidos", pedido.id, `No se encontró producto para descontar: ${pedido.producto_nombre}`)
      return false
    }

    const stockActual = Number(productoMatch.stock || 0)
    const nuevoStock = Math.max(0, stockActual - 1)
    const payload = {
      stock: nuevoStock,
      ...calcularEstadoInventario(nuevoStock),
    }

    const { error } = await supabase.from("productos").update(payload).eq("id", productoMatch.id)

    if (error) {
      toast.error("Pedido completado, pero no se pudo descontar stock")
      return false
    }

    setProductos((prev) => prev.map((p) => (p.id === productoMatch.id ? { ...p, ...payload } : p)))
    await registrarLog("descontar_stock", "productos", productoMatch.id, `Pedido #${pedido.id.slice(0, 8)} descontó 1 unidad. Stock final: ${nuevoStock}`)
    registrarEvento(`Stock descontado: ${productoMatch.nombre}`)
    return true
  }

  const actualizarEstadoPedido = async (id: string, nuevoEstado: string) => {
    const pedidoActual = pedidos.find((pedido) => pedido.id === id)
    const debeDescontarStock = nuevoEstado === "completado" && pedidoActual?.estado !== "completado"

    const { error } = await supabase.from("pedidos").update({ estado: nuevoEstado }).eq("id", id)

    if (!error) {
      if (debeDescontarStock && pedidoActual) await descontarStockPorPedido(pedidoActual)
      setPedidos((prev) => prev.map((p) => (p.id === id ? { ...p, estado: nuevoEstado } : p)))
      registrarEvento(`Pedido marcado como ${nuevoEstado}`, nuevoEstado === "completado")
      await registrarLog("actualizar_estado", "pedidos", id, `Estado: ${nuevoEstado}`)
      toast.success(debeDescontarStock ? `Pedido completado y stock sincronizado` : `Pedido actualizado a ${nuevoEstado}`)
      await cargarDatos()
    } else {
      toast.error("No se pudo actualizar el pedido")
    }
  }

  const eliminarPedido = async (id: string) => {
    const pedidoObjetivo = pedidos.find((pedido) => pedido.id === id)
    const confirmar = confirm(`¿Eliminar pedido #${id.slice(0, 8)}? Esta acción no se puede deshacer.`)
    if (!confirmar) return

    const { error } = await supabase.from("pedidos").delete().eq("id", id)

    if (!error) {
      setPedidos((prev) => prev.filter((pedido) => pedido.id !== id))
      setPedidosSeleccionados((prev) => prev.filter((pedidoId) => pedidoId !== id))
      registrarEvento(`Pedido #${id.slice(0, 8)} eliminado`)
      await registrarLog("eliminar", "pedidos", id, `Pedido eliminado${pedidoObjetivo?.cliente_nombre ? ` · ${pedidoObjetivo.cliente_nombre}` : ""}`)
      toast.success("Pedido eliminado")
      await cargarDatos()
    } else {
      toast.error("No se pudo eliminar el pedido")
    }
  }

  const alternarPedidoSeleccionado = (id: string) => {
    setPedidosSeleccionados((prev) => prev.includes(id) ? prev.filter((pedidoId) => pedidoId !== id) : [...prev, id])
  }

  const seleccionarPedidosVisibles = (ids: string[]) => {
    setPedidosSeleccionados((prev) => {
      const visiblesSet = new Set(ids)
      const todosVisiblesSeleccionados = ids.length > 0 && ids.every((id) => prev.includes(id))
      if (todosVisiblesSeleccionados) return prev.filter((id) => !visiblesSet.has(id))
      return Array.from(new Set([...prev, ...ids]))
    })
  }

  const actualizarPedidosMasivo = async (nuevoEstado: string) => {
    if (pedidosSeleccionados.length === 0) {
      toast.error("Selecciona al menos un pedido")
      return
    }

    const confirmar = confirm(`¿Actualizar ${pedidosSeleccionados.length} pedido(s) a ${nuevoEstado}?`)
    if (!confirmar) return

    setProcesandoMasivo(true)
    const ids = [...pedidosSeleccionados]
    const { error } = await supabase.from("pedidos").update({ estado: nuevoEstado }).in("id", ids)

    if (error) {
      toast.error("No se pudieron actualizar los pedidos seleccionados")
      setProcesandoMasivo(false)
      return
    }

    if (nuevoEstado === "completado") {
      const pedidosParaDescontar = pedidos.filter((pedido) => ids.includes(pedido.id) && pedido.estado !== "completado")
      for (const pedido of pedidosParaDescontar) {
        await descontarStockPorPedido(pedido)
      }
    }

    setPedidos((prev) => prev.map((pedido) => ids.includes(pedido.id) ? { ...pedido, estado: nuevoEstado } : pedido))
    setPedidosSeleccionados([])
    registrarEvento(`${ids.length} pedido(s) actualizados a ${nuevoEstado}`, nuevoEstado === "completado")
    await registrarLog("actualizar_masivo", "pedidos", undefined, `${ids.length} pedidos a ${nuevoEstado}`)
    toast.success(nuevoEstado === "completado" ? `${ids.length} pedido(s) completados y stock revisado` : `${ids.length} pedido(s) actualizados`)
    setProcesandoMasivo(false)
    await cargarDatos()
  }

  const eliminarPedidosSeleccionados = async () => {
    if (pedidosSeleccionados.length === 0) {
      toast.error("Selecciona al menos un pedido")
      return
    }

    const confirmar = confirm(`¿Eliminar ${pedidosSeleccionados.length} pedido(s)? Esta acción no se puede deshacer.`)
    if (!confirmar) return

    setProcesandoMasivo(true)
    const ids = [...pedidosSeleccionados]
    const { error } = await supabase.from("pedidos").delete().in("id", ids)

    if (error) {
      toast.error("No se pudieron eliminar los pedidos seleccionados")
      setProcesandoMasivo(false)
      return
    }

    setPedidos((prev) => prev.filter((pedido) => !ids.includes(pedido.id)))
    setPedidosSeleccionados([])
    registrarEvento(`${ids.length} pedido(s) eliminados`)
    await registrarLog("eliminar_masivo", "pedidos", undefined, `${ids.length} pedidos eliminados`)
    toast.success(`${ids.length} pedido(s) eliminados`)
    setProcesandoMasivo(false)
    await cargarDatos()
  }

  const sincronizarInventarioAutomatico = async () => {
    if (productos.length === 0) {
      toast.error("No hay productos para sincronizar")
      return
    }

    const agotados = productos.filter((p) => Number(p.stock) <= 0)
    const bajos = productos.filter((p) => Number(p.stock) > 0 && Number(p.stock) <= 3)

    if (agotados.length === 0 && bajos.length === 0) {
      toast.success("Inventario estable: no hay ajustes automáticos")
      return
    }

    const confirmar = confirm(`Inventario automático aplicará: ${agotados.length} agotado(s) y ${bajos.length} limitado(s). ¿Continuar?`)
    if (!confirmar) return

    setSincronizandoInventario(true)

    const operaciones = []
    if (agotados.length > 0) {
      operaciones.push(
        supabase
          .from("productos")
          .update({ estado_catalogo: "AGOTADO", publicacion: false })
          .in("id", agotados.map((p) => p.id))
      )
    }

    if (bajos.length > 0) {
      operaciones.push(
        supabase
          .from("productos")
          .update({ estado_catalogo: "LIMITADO" })
          .in("id", bajos.map((p) => p.id))
      )
    }

    const resultados = await Promise.all(operaciones)
    const fallo = resultados.find((resultado) => resultado.error)

    if (fallo?.error) {
      toast.error("No se pudo sincronizar todo el inventario")
      setSincronizandoInventario(false)
      return
    }

    await registrarLog("sincronizar", "productos", undefined, `Inventario automático: ${agotados.length} agotados, ${bajos.length} limitados`)
    registrarEvento("Inventario automático sincronizado")
    toast.success("Inventario automático sincronizado")
    setSincronizandoInventario(false)
    await cargarDatos()
  }

  const reponerProductoRapido = async (producto: Producto, cantidad = 10) => {
    const ok = await ajustarStockProducto(producto, cantidad)
    if (ok) await cargarDatos()
  }

  const actualizarEstadoComprobante = async (id: string, nuevoEstado: string) => {
    const { error } = await supabase.from("comprobantes").update({ estado: nuevoEstado }).eq("id", id)

    if (!error) {
      setComprobantes((prev) => prev.map((c) => (c.id === id ? { ...c, estado: nuevoEstado } : c)))
      registrarEvento(`Comprobante ${nuevoEstado}`)
      await registrarLog("actualizar_estado", "comprobantes", id, `Estado: ${nuevoEstado}`)
      toast.success(`Comprobante ${nuevoEstado}`)
      await cargarDatos()
    } else {
      toast.error("No se pudo actualizar el comprobante")
    }
  }

  const resolverComprobantePro = async (
    comprobante: { id: string; pedidoId?: string | null; origen: "tabla" | "pedido" },
    nuevoEstado: string
  ) => {
    const estadoPedido =
      nuevoEstado === "aprobado" || nuevoEstado === "completado"
        ? "completado"
        : nuevoEstado === "rechazado"
        ? "cancelado"
        : "pendiente"

    if (comprobante.origen === "tabla") {
      const { error } = await supabase.from("comprobantes").update({ estado: nuevoEstado }).eq("id", comprobante.id)

      if (error) {
        toast.error("No se pudo actualizar el comprobante")
        return
      }

      setComprobantes((prev) => prev.map((c) => (c.id === comprobante.id ? { ...c, estado: nuevoEstado } : c)))
      await registrarLog("actualizar_estado", "comprobantes", comprobante.id, `Estado: ${nuevoEstado}`)
    }

    if (comprobante.pedidoId) {
      const { error: pedidoError } = await supabase.from("pedidos").update({ estado: estadoPedido }).eq("id", comprobante.pedidoId)

      if (!pedidoError) {
        setPedidos((prev) => prev.map((p) => (p.id === comprobante.pedidoId ? { ...p, estado: estadoPedido } : p)))
        await registrarLog("actualizar_por_comprobante", "pedidos", comprobante.pedidoId, `Comprobante ${nuevoEstado}`)
      }
    }

    registrarEvento(`Comprobante ${nuevoEstado}`, nuevoEstado === "aprobado" || nuevoEstado === "completado")
    toast.success(`Comprobante ${nuevoEstado}`)
    await cargarDatos()
  }

  const handleProductoChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

    const extension = imagenFile.name.split(".").pop()?.toLowerCase() || "webp"
    const nombreArchivo = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`

    const { error: uploadError } = await supabase.storage.from("productos").upload(nombreArchivo, imagenFile, {
      cacheControl: "3600",
      upsert: false,
    })

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

    const precio = Number(formProducto.precio)
    const precioAntes = formProducto.precio_antes ? Number(formProducto.precio_antes) : null
    const stock = Number(formProducto.stock)

    if (!formProducto.nombre.trim() || !formProducto.precio || !formProducto.stock) {
      toast.error("Completa nombre, precio y stock")
      return
    }

    if (Number.isNaN(precio) || precio < 0 || Number.isNaN(stock) || stock < 0) {
      toast.error("Precio y stock deben ser números válidos")
      return
    }

    if (precioAntes !== null && (Number.isNaN(precioAntes) || precioAntes < 0)) {
      toast.error("Precio antes debe ser válido")
      return
    }

    setGuardandoProducto(true)

    let imagenUrl: string | null = null
    if (imagenFile) {
      const urlSubida = await subirImagen()
      if (!urlSubida) {
        setGuardandoProducto(false)
        return
      }
      imagenUrl = urlSubida
    }

    const payload: Partial<Producto> = {
      nombre: formProducto.nombre.trim(),
      descripcion: formProducto.descripcion.trim(),
      precio,
      precio_antes: precioAntes,
      stock,
      categoria: formProducto.categoria.trim(),
      tipo_venta: formProducto.tipo_venta,
      whatsapp: formProducto.whatsapp.trim(),
      estado: formProducto.estado,
      publicacion: formProducto.publicacion,
      destacado: formProducto.destacado,
      oferta: formProducto.oferta,
      duracion: formProducto.duracion.trim(),
      proveedor: formProducto.proveedor.trim(),
      renovable: formProducto.renovable,
      stock_texto: formProducto.stock_texto.trim(),
      estado_catalogo: stock === 0 ? "AGOTADO" : formProducto.estado_catalogo,
      badge: formProducto.badge.trim(),
      accent: formProducto.accent,
    }

    if (imagenUrl) payload.imagen = imagenUrl

    if (editandoId) {
      const { error } = await supabase.from("productos").update(payload).eq("id", editandoId)

      if (error) {
        toast.error("No se pudo actualizar el producto")
        setGuardandoProducto(false)
        return
      }

      await registrarLog("actualizar", "productos", editandoId, formProducto.nombre)
      toast.success("Producto actualizado")
    } else {
      const { data, error } = await supabase.from("productos").insert([payload]).select("id")

      if (error) {
        toast.error("No se pudo crear el producto")
        setGuardandoProducto(false)
        return
      }

      await registrarLog("crear", "productos", data?.[0]?.id, formProducto.nombre)
      toast.success("Producto creado")
    }

    setFormProducto(productoInicial)
    setEditandoId(null)
    setImagenFile(null)
    setGuardandoProducto(false)
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
    const confirmar = confirm("¿Seguro que quieres eliminar este producto? Esta acción no se puede deshacer.")
    if (!confirmar) return

    const { error } = await supabase.from("productos").delete().eq("id", id)

    if (!error) {
      setProductos((prev) => prev.filter((p) => p.id !== id))
      registrarEvento("Producto eliminado")
      await registrarLog("eliminar", "productos", id, "Producto eliminado")
      toast.success("Producto eliminado")
      await cargarDatos()
    } else {
      toast.error("No se pudo eliminar el producto")
    }
  }



  const limpiarFormularioCuenta = () => {
    setFormCuenta(cuentaInicial)
    setEditandoCuentaId(null)
  }

  const handleCuentaChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    if (name === "producto_id") {
      const producto = productos.find((item) => item.id === value)
      setFormCuenta((prev) => ({
        ...prev,
        producto_id: value,
        producto_nombre: producto?.nombre || "",
      }))
      return
    }

    setFormCuenta((prev) => ({ ...prev, [name]: value }))
  }

  const guardarCuenta = async (e: FormEvent) => {
    e.preventDefault()

    if (!formCuenta.producto_id) {
      toast.error("Selecciona un producto")
      return
    }

    if (!formCuenta.correo.trim() || !formCuenta.clave.trim()) {
      toast.error("Completa correo y clave")
      return
    }

    if (!formCuenta.pin_acceso.trim()) {
      toast.error("Crea un PIN de acceso para consulta pública")
      return
    }

    setGuardandoCuenta(true)

    const producto = productos.find((item) => item.id === formCuenta.producto_id)
    const payload = {
      producto_id: formCuenta.producto_id,
      producto_nombre: producto?.nombre || formCuenta.producto_nombre || null,
      correo: formCuenta.correo.trim(),
      clave: formCuenta.clave.trim(),
      perfil: formCuenta.perfil.trim() || null,
      pin_perfil: formCuenta.pin_perfil.trim() || null,
      pin_acceso: formCuenta.pin_acceso.trim(),
      estado: formCuenta.estado,
      observacion_admin: formCuenta.observacion_admin.trim() || null,
    }

    const result = editandoCuentaId
      ? await supabase.from("cuentas").update(payload).eq("id", editandoCuentaId)
      : await supabase.from("cuentas").insert([payload]).select("id")

    if (result.error) {
      toast.error(result.error.message || "No se pudo guardar la cuenta")
      setGuardandoCuenta(false)
      return
    }

    await registrarLog(editandoCuentaId ? "actualizar" : "crear", "cuentas", editandoCuentaId || undefined, payload.producto_nombre || payload.correo)
    toast.success(editandoCuentaId ? "Cuenta actualizada" : "Cuenta registrada")
    limpiarFormularioCuenta()
    setGuardandoCuenta(false)
    await cargarDatos()
  }

  const editarCuenta = (cuenta: CuentaInventario) => {
    setEditandoCuentaId(cuenta.id)
    setFormCuenta({
      producto_id: cuenta.producto_id || "",
      producto_nombre: cuenta.producto_nombre || "",
      correo: cuenta.correo || "",
      clave: cuenta.clave || "",
      perfil: cuenta.perfil || "",
      pin_perfil: cuenta.pin_perfil || "",
      pin_acceso: cuenta.pin_acceso || "",
      estado: cuenta.estado || "disponible",
      observacion_admin: cuenta.observacion_admin || "",
    })
    setTabActiva("cuentas")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const actualizarEstadoCuenta = async (cuenta: CuentaInventario, estado: string) => {
    const { error } = await supabase.from("cuentas").update({ estado }).eq("id", cuenta.id)

    if (error) {
      toast.error("No se pudo actualizar la cuenta")
      return
    }

    await registrarLog("actualizar_estado", "cuentas", cuenta.id, `Estado: ${estado}`)
    toast.success(`Cuenta marcada como ${estado}`)
    await cargarDatos()
  }

  const eliminarCuenta = async (cuenta: CuentaInventario) => {
    const confirmar = confirm(`¿Eliminar la cuenta ${cuenta.correo}? Esta acción no se puede deshacer.`)
    if (!confirmar) return

    const { error } = await supabase.from("cuentas").delete().eq("id", cuenta.id)

    if (error) {
      toast.error("No se pudo eliminar la cuenta")
      return
    }

    await registrarLog("eliminar", "cuentas", cuenta.id, cuenta.correo)
    toast.success("Cuenta eliminada")
    await cargarDatos()
  }

  const handleConfigChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormConfig((prev) => ({ ...prev, [name]: value }))
  }

  const guardarConfiguracion = async (e: FormEvent) => {
    e.preventDefault()
    setGuardandoConfig(true)

    const payload = {
      nombre_tienda: formConfig.nombre_tienda.trim(),
      slogan: formConfig.slogan.trim(),
      banner_titulo: formConfig.banner_titulo.trim(),
      banner_texto: formConfig.banner_texto.trim(),
      banner_boton: formConfig.banner_boton.trim(),
      whatsapp: formConfig.whatsapp.trim(),
    }

    if (configId) {
      const { error } = await supabase.from("configuracion_tienda").update(payload).eq("id", configId)

      if (error) {
        toast.error("No se pudo actualizar la configuración")
        setGuardandoConfig(false)
        return
      }

      await registrarLog("actualizar", "configuracion_tienda", configId, "Configuración de tienda")
      toast.success("Configuración actualizada")
    } else {
      const { data, error } = await supabase.from("configuracion_tienda").insert([payload]).select()

      if (error) {
        toast.error("No se pudo guardar la configuración")
        setGuardandoConfig(false)
        return
      }

      if (data && data.length > 0) setConfigId(data[0].id)
      await registrarLog("crear", "configuracion_tienda", undefined, "Configuración de tienda")
      toast.success("Configuración guardada")
    }

    setGuardandoConfig(false)
    await cargarDatos()
  }

  const cerrarSesion = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem("usuario")
    router.push("/login")
  }

  const esProveedor = usuario?.rol === "proveedor"
  const totalUsuarios = usuarios.length
  const totalProductos = productos.length
  const productosActivos = productos.filter((p) => p.estado === "activo").length
  const totalPedidos = pedidos.length
  const pedidosCompletados = pedidos.filter((pedido) => pedido.estado === "completado").length
  const pedidosCancelados = pedidos.filter((pedido) => pedido.estado === "cancelado").length
  const pedidosPendientes = pedidos.filter((pedido) => pedido.estado === "pendiente").length
  const ventasTotales = pedidos.filter((pedido) => pedido.estado === "completado").reduce((acc, pedido) => acc + Number(pedido.total || 0), 0)
  const ingresosPendientes = pedidos.filter((pedido) => pedido.estado === "pendiente").reduce((acc, pedido) => acc + Number(pedido.total || 0), 0)
  const usuariosPendientes = usuarios.filter((u) => u.estado === "pendiente").length
  const usuariosAprobados = usuarios.filter((u) => u.estado === "aprobado").length
  const usuariosRechazados = usuarios.filter((u) => u.estado === "rechazado").length
  const usuariosAdmin = usuarios.filter((u) => u.rol === "admin").length
  const usuariosProveedor = usuarios.filter((u) => u.rol === "proveedor").length
  const usuariosCliente = usuarios.filter((u) => u.rol === "cliente").length
  const productosBajoStock = productos.filter((p) => Number(p.stock) > 0 && Number(p.stock) <= 3)
  const productosAgotados = productos.filter((p) => Number(p.stock) <= 0)
  const productosCriticos = [...productosAgotados, ...productosBajoStock].slice(0, 8)
  const productosInventario = [...productosAgotados, ...productosBajoStock, ...productos.filter((p) => Number(p.stock) > 3)]
  const ticketPromedio = pedidosCompletados > 0 ? ventasTotales / pedidosCompletados : 0
  const tasaConversion = totalPedidos > 0 ? Math.round((pedidosCompletados / totalPedidos) * 100) : 0
  const saludInventario = totalProductos > 0 ? Math.max(0, Math.round(((totalProductos - productosCriticos.length) / totalProductos) * 100)) : 100
  const productosDestacados = productos.filter((p) => p.destacado).length
  const productosOferta = productos.filter((p) => p.oferta).length
  const productosSinImagen = productos.filter((p) => !p.imagen).length
  const productosInactivos = productos.filter((p) => p.estado === "inactivo").length
  const pedidosConComprobante = pedidos.filter((pedido) => obtenerComprobanteUrl(pedido)).length
  const comprobantesPendientes = comprobantes.filter((c) => (c.estado || "pendiente") === "pendiente").length
  const metodosPago = Array.from(new Set(pedidos.map((p) => p.metodo_pago).filter(Boolean)))
  const entidadesLog = Array.from(new Set(logs.map((log) => log.entidad).filter(Boolean)))

  const resultadosGlobales = useMemo(() => {
    const query = normalizarTexto(busquedaGlobal)
    if (!query) return []

    const productosEncontrados = productos
      .filter((p) => normalizarTexto(`${p.nombre} ${p.categoria} ${p.tipo_venta} ${p.proveedor}`).includes(query))
      .slice(0, 4)
      .map((p) => ({ tipo: "Producto", titulo: p.nombre, detalle: `${formatearSoles(p.precio)} · Stock ${p.stock}`, tab: "productos" as TabId }))

    const pedidosEncontrados = pedidos
      .filter((p) => normalizarTexto(`${p.id} ${p.cliente_nombre} ${p.cliente_correo} ${p.metodo_pago}`).includes(query))
      .slice(0, 4)
      .map((p) => ({ tipo: "Pedido", titulo: `#${p.id.slice(0, 8)}`, detalle: `${p.cliente_nombre} · ${formatearSoles(p.total)}`, tab: "pedidos" as TabId }))

    const usuariosEncontrados = usuarios
      .filter((u) => normalizarTexto(`${u.nombre} ${u.correo} ${u.rol} ${u.estado}`).includes(query))
      .slice(0, 4)
      .map((u) => ({ tipo: "Usuario", titulo: u.nombre, detalle: `${u.correo} · ${u.rol}`, tab: "usuarios" as TabId }))

    return [...productosEncontrados, ...pedidosEncontrados, ...usuariosEncontrados].slice(0, 8)
  }, [busquedaGlobal, productos, pedidos, usuarios])

  const productosFiltrados: Producto[] = useMemo(() => {
    return [...productos]
      .filter((producto) => {
        const texto = normalizarTexto(`${producto.nombre} ${producto.descripcion} ${producto.categoria} ${producto.tipo_venta} ${producto.proveedor}`)
        const coincideBusqueda = texto.includes(normalizarTexto(busquedaProducto))
        const coincideEstado = filtroEstadoProducto === "todos" || producto.estado === filtroEstadoProducto
        const stock = Number(producto.stock || 0)
        const coincideStock =
          filtroStockProducto === "todos" ||
          (filtroStockProducto === "agotado" && stock <= 0) ||
          (filtroStockProducto === "bajo" && stock > 0 && stock <= 3) ||
          (filtroStockProducto === "ok" && stock > 3)

        return coincideBusqueda && coincideEstado && coincideStock
      })
      .sort((a, b) => {
        switch (ordenProducto) {
          case "nombre":
            return a.nombre.localeCompare(b.nombre)
          case "precio_mayor":
            return Number(b.precio) - Number(a.precio)
          case "precio_menor":
            return Number(a.precio) - Number(b.precio)
          case "stock_menor":
            return Number(a.stock) - Number(b.stock)
          default:
            return 0
        }
      })
  }, [productos, busquedaProducto, filtroEstadoProducto, filtroStockProducto, ordenProducto])

  const productosInventarioFiltrados: Producto[] = useMemo(() => {
    const query = normalizarTexto(busquedaInventario)

    return productosInventario
      .filter((producto) => {
        const stock = Number(producto.stock || 0)
        const texto = normalizarTexto(`${producto.nombre} ${producto.categoria} ${producto.proveedor} ${producto.estado_catalogo}`)
        const coincideBusqueda = !query || texto.includes(query)
        const coincideFiltro =
          filtroInventario === "todos" ||
          (filtroInventario === "critico" && stock <= 3) ||
          (filtroInventario === "agotado" && stock <= 0) ||
          (filtroInventario === "bajo" && stock > 0 && stock <= 3) ||
          (filtroInventario === "estable" && stock > 3)

        return coincideBusqueda && coincideFiltro
      })
      .sort((a, b) => Number(a.stock || 0) - Number(b.stock || 0))
  }, [productosInventario, busquedaInventario, filtroInventario])



  const cuentasFiltradas: CuentaInventario[] = useMemo(() => {
    const query = normalizarTexto(busquedaCuenta)

    return cuentas.filter((cuenta) => {
      const producto = productos.find((item) => item.id === cuenta.producto_id)
      const texto = normalizarTexto(`${cuenta.correo} ${cuenta.producto_nombre} ${producto?.nombre} ${cuenta.perfil} ${cuenta.pin_acceso} ${cuenta.cliente_correo} ${cuenta.estado}`)
      const coincideBusqueda = !query || texto.includes(query)
      const coincideEstado = filtroCuentaEstado === "todos" || cuenta.estado === filtroCuentaEstado

      return coincideBusqueda && coincideEstado
    })
  }, [cuentas, productos, busquedaCuenta, filtroCuentaEstado])

  const cuentasDisponiblesTotal = cuentas.filter((cuenta) => cuenta.estado === "disponible").length
  const cuentasAsignadasTotal = cuentas.filter((cuenta) => cuenta.estado === "asignada").length
  const cuentasVencidasTotal = cuentas.filter((cuenta) => cuenta.estado === "vencida").length
  const cuentasBloqueadasTotal = cuentas.filter((cuenta) => cuenta.estado === "bloqueada" || cuenta.estado === "mantenimiento").length

  const pedidosFiltrados: Pedido[] = useMemo(() => {
    return [...pedidos]
      .filter((pedido) => {
        const texto = normalizarTexto(`${pedido.id} ${pedido.cliente_nombre} ${pedido.cliente_correo} ${pedido.metodo_pago} ${pedido.producto_nombre}`)
        const comprobanteUrl = obtenerComprobanteUrl(pedido)
        const coincideBusqueda = texto.includes(normalizarTexto(busquedaPedido))
        const coincideEstado = filtroEstadoPedido === "todos" || pedido.estado === filtroEstadoPedido
        const coincideMetodo = filtroMetodoPago === "todos" || pedido.metodo_pago === filtroMetodoPago
        const coincideComprobante =
          filtroComprobantePedido === "todos" ||
          (filtroComprobantePedido === "con" && Boolean(comprobanteUrl)) ||
          (filtroComprobantePedido === "sin" && !comprobanteUrl)
        return coincideBusqueda && coincideEstado && coincideMetodo && coincideComprobante
      })
      .sort((a, b) => {
        switch (ordenPedido) {
          case "monto_mayor":
            return Number(b.total) - Number(a.total)
          case "monto_menor":
            return Number(a.total) - Number(b.total)
          default:
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        }
      })
  }, [pedidos, busquedaPedido, filtroEstadoPedido, filtroMetodoPago, filtroComprobantePedido, ordenPedido])

  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((u) => {
      const texto = normalizarTexto(`${u.nombre} ${u.correo} ${u.rol} ${u.estado}`)
      const coincideBusqueda = texto.includes(normalizarTexto(busquedaUsuario))
      const coincideEstado = filtroEstadoUsuario === "todos" || u.estado === filtroEstadoUsuario
      const coincideRol = filtroRolUsuario === "todos" || u.rol === filtroRolUsuario
      return coincideBusqueda && coincideEstado && coincideRol
    })
  }, [usuarios, busquedaUsuario, filtroEstadoUsuario, filtroRolUsuario])

  const comprobantesUnificados = useMemo(() => {
    if (comprobantes.length > 0) {
      return comprobantes.map((c) => ({
        id: c.id,
        pedidoId: c.pedido_id,
        cliente: c.cliente_nombre || c.cliente_correo || "Cliente sin nombre",
        correo: c.cliente_correo || "",
        monto: Number(c.monto || 0),
        metodo: c.metodo_pago || "No definido",
        estado: c.estado || "pendiente",
        url: obtenerComprobanteUrl(c),
        fecha: c.created_at,
        origen: "tabla" as const,
      }))
    }

    return pedidos
      .filter((pedido) => obtenerComprobanteUrl(pedido))
      .map((pedido) => ({
        id: pedido.id,
        pedidoId: pedido.id,
        cliente: pedido.cliente_nombre,
        correo: pedido.cliente_correo,
        monto: Number(pedido.total || 0),
        metodo: pedido.metodo_pago,
        estado: pedido.estado,
        url: obtenerComprobanteUrl(pedido),
        fecha: pedido.created_at,
        origen: "pedido" as const,
      }))
  }, [comprobantes, pedidos])

  const comprobantesFiltrados = useMemo(() => {
    return comprobantesUnificados.filter((comprobante) => {
      const texto = normalizarTexto(`${comprobante.id} ${comprobante.pedidoId} ${comprobante.cliente} ${comprobante.correo} ${comprobante.metodo} ${comprobante.estado}`)
      const coincideBusqueda = texto.includes(normalizarTexto(busquedaComprobante))
      const coincideEstado = filtroEstadoComprobante === "todos" || comprobante.estado === filtroEstadoComprobante
      return coincideBusqueda && coincideEstado
    })
  }, [comprobantesUnificados, busquedaComprobante, filtroEstadoComprobante])

  const logsFiltrados = useMemo(() => {
    return logs.filter((log) => {
      const texto = normalizarTexto(`${log.accion} ${log.entidad} ${log.detalle} ${log.actor_nombre} ${log.actor_correo}`)
      const coincideBusqueda = texto.includes(normalizarTexto(busquedaHistorial))
      const coincideEntidad = filtroEntidadLog === "todos" || log.entidad === filtroEntidadLog
      return coincideBusqueda && coincideEntidad
    })
  }, [logs, busquedaHistorial, filtroEntidadLog])

  const hoy = new Date()
  const logsHoy = logs.filter((log) => {
    const fecha = new Date(log.created_at)
    return !Number.isNaN(fecha.getTime()) && fecha.toDateString() === hoy.toDateString()
  }).length
  const logsCriticos = logs.filter((log) => {
    const texto = normalizarTexto(`${log.accion} ${log.entidad} ${log.detalle}`)
    return texto.includes("eliminar") || texto.includes("rechaz") || texto.includes("error") || texto.includes("cancel") || texto.includes("agotado") || texto.includes("stock_no_encontrado")
  }).length
  const logsSistema = logs.filter((log) => normalizarTexto(log.entidad).includes("configuracion") || normalizarTexto(log.entidad).includes("admin_logs")).length
  const ultimaAccionImportante = logs.find((log) => {
    const texto = normalizarTexto(`${log.accion} ${log.detalle}`)
    return texto.includes("eliminar") || texto.includes("actualizar") || texto.includes("crear") || texto.includes("sincronizar") || texto.includes("stock")
  }) || logs[0]

  const inicioHoy = new Date()
  inicioHoy.setHours(0, 0, 0, 0)

  const pedidosHoy = pedidos.filter((pedido) => {
    const fecha = new Date(pedido.created_at)
    return !Number.isNaN(fecha.getTime()) && fecha >= inicioHoy
  })
  const ventasHoy = pedidosHoy
    .filter((pedido) => pedido.estado === "completado")
    .reduce((acc, pedido) => acc + Number(pedido.total || 0), 0)
  const pedidosUrgentes = pedidos.filter((pedido) => {
    const creado = new Date(pedido.created_at).getTime()
    const viejo = !Number.isNaN(creado) && Date.now() - creado > 1000 * 60 * 60 * 24
    return pedido.estado === "pendiente" && (viejo || !obtenerComprobanteUrl(pedido))
  })
  const pedidosSinPago = pedidos.filter((pedido) => pedido.estado === "pendiente" && !obtenerComprobanteUrl(pedido))
  const productosCriticosTotal = productosAgotados.length + productosBajoStock.length
  const productosDisponibles = productos.filter((producto) => Number(producto.stock || 0) > 3).length
  const comprobantesPendientesDashboard = comprobantesUnificados.filter((comprobante) => comprobante.estado === "pendiente").length
  const actividadHoyTotal = pedidosHoy.length + logsHoy
  const productoMasMovido = (() => {
    const contador = new Map<string, number>()
    pedidos
      .filter((pedido) => pedido.estado === "completado" && pedido.producto_nombre)
      .forEach((pedido) => {
        const nombre = pedido.producto_nombre || "Producto"
        contador.set(nombre, (contador.get(nombre) || 0) + 1)
      })

    return Array.from(contador.entries()).sort((a, b) => b[1] - a[1])[0] || null
  })()
  const prioridadPrincipal =
    pedidosUrgentes.length > 0
      ? "Atender pedidos urgentes"
      : comprobantesPendientesDashboard > 0
      ? "Revisar comprobantes"
      : productosCriticosTotal > 0
      ? "Reponer inventario"
      : "Operación estable"

  const productosVisibles = productosFiltrados.slice(0, limiteProductos)
  const pedidosVisibles = pedidosFiltrados.slice(0, limitePedidos)
  const pedidosVisiblesIds = pedidosVisibles.map((pedido) => pedido.id)
  const pedidosSeleccionadosVisibles = pedidosVisiblesIds.filter((id) => pedidosSeleccionados.includes(id)).length
  const totalSeleccionado = pedidos.filter((pedido) => pedidosSeleccionados.includes(pedido.id)).reduce((acc, pedido) => acc + Number(pedido.total || 0), 0)
  const comprobantesVisibles = comprobantesFiltrados.slice(0, limiteComprobantes)
  const logsVisibles = logsFiltrados.slice(0, limiteLogs)

  if (cargando) return <AdminSkeleton />

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
          {navGroups.map((group) => (
            <div key={group.title} className={styles.navGroup}>
              <p className={styles.navGroupTitle}>{group.title}</p>
              <div className={styles.navGroupItems}>
                {group.items.map((tabId) => {
                  const tab = tabs.find((item) => item.id === tabId)
                  if (!tab) return null

                  const badgeValue =
                    tab.id === "pedidos"
                      ? pedidosPendientes
                      : tab.id === "usuarios"
                      ? usuariosPendientes
                      : tab.id === "cuentas"
                      ? cuentas.filter((cuenta) => cuenta.estado === "disponible").length
                      : tab.id === "inventario"
                      ? productosCriticos.length
                      : 0

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setTabActiva(tab.id)}
                      className={`${styles.navButton} ${tabActiva === tab.id ? styles.navButtonActive : ""}`}
                    >
                      <span className={styles.navIcon}>{tab.icon}</span>
                      <strong>{tab.label}</strong>
                      {badgeValue > 0 && <em>{badgeValue}</em>}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userMiniCard}>
            <div className={styles.userMiniAvatar}>{usuario?.nombre?.slice(0, 2).toUpperCase() || "JS"}</div>
            <div>
              <p>{usuario?.nombre}</p>
              <span>{usuario?.correo}</span>
            </div>
          </div>
          <div className={styles.sidebarFooterMeta}>
            <div className={styles.rolePill}>{usuario?.rol}</div>
            <div className={styles.sessionPill}>Online</div>
          </div>
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
            <span>Gestiona ventas, catálogo, usuarios, comprobantes e inventario sin tocar RLS todavía.</span>
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

            <button type="button" onClick={() => cargarDatos()} className={styles.refreshButton}>Actualizar</button>
            {ultimaActualizacion && <div className={styles.topbarPill}>Sync {ultimaActualizacion}</div>}
            <div className={styles.topbarPill}>
              <span className={styles.statusDot}></span>
              Supabase conectado
            </div>
          </div>
        </header>

        <section className={styles.proRibbon}>
          <div className={styles.proRibbonMain}>
            <span className={styles.proTag}>PRO CONTROL 2.0</span>
            <strong>Vista ejecutiva activa</strong>
            <p>Pedidos, stock, comprobantes, usuarios e historial centralizados sin tocar RLS todavía.</p>
          </div>
          <div className={styles.proRibbonStats}>
            <button type="button" onClick={() => setTabActiva("pedidos")}>
              <span>{pedidosPendientes}</span>
              Pedidos pendientes
            </button>
            <button type="button" onClick={() => setTabActiva("inventario")}>
              <span>{productosCriticos.length}</span>
              Stock crítico
            </button>
            <button type="button" onClick={() => setTabActiva("comprobantes")}>
              <span>{comprobantesPendientes}</span>
              Comprobantes
            </button>
            <button type="button" onClick={() => setTabActiva("usuarios")}>
              <span>{usuariosPendientes}</span>
              Usuarios por aprobar
            </button>
          </div>
        </section>

        {tabActiva === "dashboard" && (
          <div className={styles.sectionStack}>
            <section className={styles.dashboardCommandHero}>
              <div className={styles.commandHeroMain}>
                <span className={styles.proTag}>DASHBOARD PRO PULIDO</span>
                <h3>Centro de mando Jonas Stream</h3>
                <p>
                  Entra, mira el estado real del negocio y actúa en segundos: ventas, pagos,
                  pedidos urgentes, usuarios pendientes y stock crítico en un solo lugar.
                </p>

                <div className={styles.commandHeroFocus}>
                  <span>Prioridad actual</span>
                  <strong>{prioridadPrincipal}</strong>
                  <small>
                    {pedidosUrgentes.length > 0
                      ? `${pedidosUrgentes.length} pedido(s) requieren atención inmediata.`
                      : comprobantesPendientesDashboard > 0
                      ? `${comprobantesPendientesDashboard} pago(s) necesitan validación.`
                      : productosCriticosTotal > 0
                      ? `${productosCriticosTotal} producto(s) están en nivel crítico.`
                      : "No hay bloqueos críticos ahora mismo."}
                  </small>
                </div>

                <div className={styles.dashboardHeroActions}>
                  <button
                    type="button"
                    onClick={() => {
                      setTabActiva("pedidos")
                      setFiltroEstadoPedido("pendiente")
                    }}
                    className={styles.primaryButton}
                  >
                    Atender pendientes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTabActiva("comprobantes")
                      setFiltroEstadoComprobante("pendiente")
                    }}
                    className={styles.secondaryButton}
                  >
                    Revisar pagos
                  </button>
                  <button type="button" onClick={() => setTabActiva("inventario")} className={styles.secondaryButton}>
                    Ver stock crítico
                  </button>
                </div>
              </div>

              <div className={styles.commandMoneyCard}>
                <p>Ingreso confirmado</p>
                <strong>{formatearSoles(ventasTotales)}</strong>
                <span>{pedidosCompletados} ventas completadas · Ticket {formatearSoles(ticketPromedio)}</span>

                <div className={styles.commandMoneyGrid}>
                  <div>
                    <small>Hoy</small>
                    <b>{formatearSoles(ventasHoy)}</b>
                  </div>
                  <div>
                    <small>Por cobrar</small>
                    <b>{formatearSoles(ingresosPendientes)}</b>
                  </div>
                  <div>
                    <small>Conversión</small>
                    <b>{tasaConversion}%</b>
                  </div>
                  <div>
                    <small>Salud stock</small>
                    <b>{saludInventario}%</b>
                  </div>
                </div>
              </div>
            </section>

            <section className={styles.dashboardAlertGrid}>
              <button
                type="button"
                onClick={() => {
                  setTabActiva("pedidos")
                  setFiltroEstadoPedido("pendiente")
                }}
                className={`${styles.alertActionCard} ${pedidosUrgentes.length > 0 ? styles.alertCardDanger : ""}`}
              >
                <span>◉</span>
                <div>
                  <strong>{pedidosUrgentes.length}</strong>
                  <p>Pedidos urgentes</p>
                  <small>{pedidosSinPago.length} sin comprobante visible</small>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTabActiva("comprobantes")
                  setFiltroEstadoComprobante("pendiente")
                }}
                className={`${styles.alertActionCard} ${comprobantesPendientesDashboard > 0 ? styles.alertCardWarning : ""}`}
              >
                <span>▤</span>
                <div>
                  <strong>{comprobantesPendientesDashboard}</strong>
                  <p>Pagos por validar</p>
                  <small>Evita entregar sin revisar</small>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTabActiva("inventario")}
                className={`${styles.alertActionCard} ${productosCriticosTotal > 0 ? styles.alertCardDanger : ""}`}
              >
                <span>▦</span>
                <div>
                  <strong>{productosCriticosTotal}</strong>
                  <p>Alertas de stock</p>
                  <small>{productosAgotados.length} agotados · {productosBajoStock.length} bajos</small>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTabActiva("usuarios")
                  setFiltroEstadoUsuario("pendiente")
                }}
                className={`${styles.alertActionCard} ${usuariosPendientes > 0 ? styles.alertCardWarning : ""}`}
              >
                <span>◎</span>
                <div>
                  <strong>{usuariosPendientes}</strong>
                  <p>Usuarios pendientes</p>
                  <small>{usuariosAprobados} aprobados · {usuariosRechazados} rechazados</small>
                </div>
              </button>
            </section>

            <div className={styles.metricsGridPro}>
              <MetricCard title="Ventas reales" value={formatearSoles(ventasTotales)} detail={`${formatearSoles(ventasHoy)} vendido hoy`} tone="success" />
              <MetricCard title="Por cobrar" value={formatearSoles(ingresosPendientes)} detail={`${pedidosPendientes} pedidos pendientes`} tone="warning" />
              <MetricCard title="Pedidos hoy" value={pedidosHoy.length} detail={`${pedidosUrgentes.length} urgentes detectados`} tone="info" />
              <MetricCard title="Stock crítico" value={productosCriticosTotal} detail={`${productosDisponibles} productos estables`} tone="danger" />
              <MetricCard title="Comprobantes" value={comprobantesUnificados.length || pedidosConComprobante} detail={`${comprobantesPendientesDashboard} pendientes`} tone="neutral" />
              <MetricCard title="Usuarios" value={totalUsuarios} detail={`${usuariosPendientes} pendientes · ${usuariosAdmin} admin`} tone="info" />
              <MetricCard title="Catálogo activo" value={productosActivos} detail={`${productosOferta} ofertas · ${productosDestacados} destacados`} tone="success" />
              <MetricCard title="Actividad hoy" value={actividadHoyTotal} detail={`${logsHoy} acciones registradas`} tone="neutral" />
            </div>

            <section className={styles.dashboardDecisionMatrix}>
              <article className={`${styles.panel} ${styles.nextActionsPanel}`}>
                <div className={styles.panelHeader}>
                  <div>
                    <p className={styles.kicker}>Siguiente acción</p>
                    <h3>Qué hacer primero</h3>
                    <span className={styles.panelHint}>Ordenado por impacto operativo: dinero, entrega y stock.</span>
                  </div>
                </div>

                <div className={styles.nextActionList}>
                  <button type="button" onClick={() => { setTabActiva("pedidos"); setFiltroEstadoPedido("pendiente") }} className={styles.nextActionItem}>
                    <em className={pedidosUrgentes.length > 0 ? styles.actionPulseDanger : styles.actionPulseOk}></em>
                    <div>
                      <strong>Atender pedidos pendientes</strong>
                      <span>{pedidosPendientes} pendientes · {formatearSoles(ingresosPendientes)} por confirmar</span>
                    </div>
                    <b>Ir</b>
                  </button>

                  <button type="button" onClick={() => { setTabActiva("comprobantes"); setFiltroEstadoComprobante("pendiente") }} className={styles.nextActionItem}>
                    <em className={comprobantesPendientesDashboard > 0 ? styles.actionPulseWarning : styles.actionPulseOk}></em>
                    <div>
                      <strong>Validar comprobantes</strong>
                      <span>{comprobantesPendientesDashboard} pagos pendientes de revisión</span>
                    </div>
                    <b>Ir</b>
                  </button>

                  <button type="button" onClick={() => setTabActiva("inventario")} className={styles.nextActionItem}>
                    <em className={productosCriticosTotal > 0 ? styles.actionPulseDanger : styles.actionPulseOk}></em>
                    <div>
                      <strong>Controlar inventario</strong>
                      <span>{productosAgotados.length} agotados · {productosBajoStock.length} bajo stock</span>
                    </div>
                    <b>Ir</b>
                  </button>
                </div>
              </article>

              <article className={`${styles.panel} ${styles.businessSnapshotPanel}`}>
                <div className={styles.panelHeader}>
                  <div>
                    <p className={styles.kicker}>Snapshot</p>
                    <h3>Lectura rápida</h3>
                    <span className={styles.panelHint}>Resumen para decidir sin entrar a cada módulo.</span>
                  </div>
                </div>

                <div className={styles.snapshotGrid}>
                  <div>
                    <span>Producto más movido</span>
                    <strong>{productoMasMovido ? productoMasMovido[0] : "Sin ventas aún"}</strong>
                    <small>{productoMasMovido ? `${productoMasMovido[1]} venta(s) completadas` : "Cuando haya ventas, aparecerá aquí."}</small>
                  </div>
                  <div>
                    <span>Riesgo operativo</span>
                    <strong>{pedidosUrgentes.length + productosCriticosTotal + comprobantesPendientesDashboard}</strong>
                    <small>Suma de urgencias visibles</small>
                  </div>
                  <div>
                    <span>Usuarios activos</span>
                    <strong>{usuariosAprobados}</strong>
                    <small>{usuariosProveedor} proveedores · {usuariosCliente} clientes</small>
                  </div>
                  <div>
                    <span>Historial crítico</span>
                    <strong>{logsCriticos}</strong>
                    <small>{logsSistema} acciones de sistema</small>
                  </div>
                </div>
              </article>
            </section>

            <div className={styles.dashboardGridPro}>
              <article className={styles.panel}>
                <div className={styles.panelHeader}>
                  <div>
                    <p className={styles.kicker}>Cola de trabajo</p>
                    <h3>Pedidos que mirar primero</h3>
                    <span className={styles.panelHint}>Priorizados por pendiente, antigüedad y comprobante.</span>
                  </div>
                  <button type="button" onClick={() => setTabActiva("pedidos")} className={styles.linkButton}>Ver pedidos</button>
                </div>

                <div className={styles.compactList}>
                  {(pedidosUrgentes.length > 0 ? pedidosUrgentes : pedidos.slice(0, 5)).slice(0, 5).length === 0 ? (
                    <EmptyState title="Sin pedidos" text="Aún no hay pedidos registrados." />
                  ) : (
                    (pedidosUrgentes.length > 0 ? pedidosUrgentes : pedidos.slice(0, 5)).slice(0, 5).map((pedido) => (
                      <button key={pedido.id} type="button" onClick={() => setTabActiva("pedidos")} className={styles.dashboardListButton}>
                        <div>
                          <strong>{pedido.cliente_nombre}</strong>
                          <span>#{pedido.id.slice(0, 8)} · {pedido.producto_nombre || "Producto no definido"}</span>
                        </div>
                        <div className={styles.compactRight}>
                          <strong>{formatearSoles(pedido.total)}</strong>
                          <StatusBadge estado={pedido.estado} />
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </article>

              <article className={styles.panel}>
                <div className={styles.panelHeader}>
                  <div>
                    <p className={styles.kicker}>Inventario</p>
                    <h3>Stock que puede frenar ventas</h3>
                    <span className={styles.panelHint}>Reposición rápida desde inventario.</span>
                  </div>
                  <button type="button" onClick={() => setTabActiva("inventario")} className={styles.linkButton}>Gestionar</button>
                </div>

                <div className={styles.compactList}>
                  {productosCriticos.length === 0 ? (
                    <EmptyState title="Stock estable" text="No hay productos críticos por ahora." />
                  ) : (
                    productosCriticos.map((producto) => (
                      <button key={producto.id} type="button" onClick={() => editarProducto(producto)} className={styles.dashboardListButton}>
                        <div>
                          <strong>{producto.nombre}</strong>
                          <span>{producto.categoria || "Sin categoría"} · {producto.proveedor || "Jonas Stream"}</span>
                        </div>
                        <div className={Number(producto.stock) <= 0 ? styles.stockPillDanger : styles.stockPill}>{producto.stock} und.</div>
                      </button>
                    ))
                  )}
                </div>
              </article>

              <article className={styles.panel}>
                <div className={styles.panelHeader}>
                  <div>
                    <p className={styles.kicker}>Auditoría</p>
                    <h3>Última acción importante</h3>
                    <span className={styles.panelHint}>Control interno del panel.</span>
                  </div>
                  <button type="button" onClick={() => setTabActiva("historial")} className={styles.linkButton}>Historial</button>
                </div>
                {!ultimaAccionImportante ? (
                  <EmptyState title="Sin historial" text="Las acciones del panel aparecerán aquí." />
                ) : (
                  <div className={styles.auditPreviewPro}>
                    <span>{ultimaAccionImportante.entidad}</span>
                    <strong>{ultimaAccionImportante.accion}</strong>
                    <p>{ultimaAccionImportante.detalle || "Sin detalle"}</p>
                    <small>{ultimaAccionImportante.actor_nombre || "Sistema"} · {fechaLegible(ultimaAccionImportante.created_at)}</small>
                  </div>
                )}
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
                  <span className={styles.panelHint}>Edición estable con validación de precio, stock, estado visual e imagen.</span>
                </div>
                {editandoId && <span className={styles.editBadge}>Modo edición</span>}
              </div>

              <div className={styles.productPreviewStrip}>
                <div className={styles.previewOrb}>{formProducto.nombre?.slice(0, 2).toUpperCase() || "JS"}</div>
                <div>
                  <p>Vista rápida</p>
                  <h4>{formProducto.nombre || "Nuevo producto premium"}</h4>
                  <span>{formatearSoles(Number(formProducto.precio || 0))} · Stock {formProducto.stock || "0"} · {Number(formProducto.stock || 0) <= 0 ? "AGOTADO" : formProducto.estado_catalogo || "ACTIVO"}</span>
                </div>
              </div>

              <form onSubmit={guardarProducto} className={styles.formGrid}>
                <input name="nombre" placeholder="Nombre" value={formProducto.nombre} onChange={handleProductoChange} className={styles.input} />
                <textarea name="descripcion" placeholder="Descripción" value={formProducto.descripcion} onChange={handleProductoChange} className={`${styles.input} ${styles.textarea}`} />
                <input name="precio" type="number" min="0" step="0.01" placeholder="Precio" value={formProducto.precio} onChange={handleProductoChange} className={styles.input} />
                <input name="precio_antes" type="number" min="0" step="0.01" placeholder="Precio antes" value={formProducto.precio_antes} onChange={handleProductoChange} className={styles.input} />
                <input name="stock" type="number" min="0" placeholder="Stock" value={formProducto.stock} onChange={handleProductoChange} className={styles.input} />
                <input name="categoria" placeholder="Categoría" value={formProducto.categoria} onChange={handleProductoChange} className={styles.input} />

                <select name="tipo_venta" value={formProducto.tipo_venta} onChange={handleProductoChange} className={styles.input}>
                  <option value="">Tipo de venta</option>
                  <option value="Cuenta Completa">Cuenta Completa</option>
                  <option value="Perfiles">Perfiles</option>
                  <option value="Código / Giftcard">Código / Giftcard</option>
                  <option value="Renovación">Renovación</option>
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
                  <button type="submit" disabled={guardandoProducto || subiendoImagen} className={styles.primaryButton}>
                    {guardandoProducto ? "Guardando..." : editandoId ? "Actualizar producto" : "Crear producto"}
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
                  <span className={styles.panelHint}>Control comercial del catálogo con alertas, estado visual y acciones rápidas.</span>
                </div>
                <span className={styles.countBadge}>{productosFiltrados.length} resultados</span>
              </div>

              <section className={styles.productOpsPanel}>
                <div className={styles.productOpsMain}>
                  <span className={styles.proTag}>PRODUCTOS PRO</span>
                  <h4>Catálogo listo para vender</h4>
                  <p>Detecta productos agotados, ofertas, publicaciones activas y artículos sin imagen antes de que afecten la tienda.</p>
                </div>
                <div className={styles.productOpsStats}>
                  <button type="button" onClick={() => { setFiltroEstadoProducto("activo"); setFiltroStockProducto("todos") }}>
                    <strong>{productosActivos}</strong>
                    <span>Activos</span>
                  </button>
                  <button type="button" onClick={() => setFiltroStockProducto("agotado")}>
                    <strong>{productosAgotados.length}</strong>
                    <span>Agotados</span>
                  </button>
                  <button type="button" onClick={() => setFiltroStockProducto("bajo")}>
                    <strong>{productosBajoStock.length}</strong>
                    <span>Bajo stock</span>
                  </button>
                  <button type="button" onClick={() => { setFiltroEstadoProducto("todos"); setFiltroStockProducto("todos"); setBusquedaProducto("") }}>
                    <strong>{productosSinImagen}</strong>
                    <span>Sin imagen</span>
                  </button>
                </div>
              </section>

              <div className={styles.miniStatsGrid}>
                <button type="button" onClick={() => { setFiltroEstadoProducto("activo"); setFiltroStockProducto("todos") }} className={styles.miniStatCard}>
                  <span>Activos</span><strong>{productosActivos}</strong><small>Publicables en catálogo</small>
                </button>
                <button type="button" onClick={() => setFiltroStockProducto("bajo")} className={styles.miniStatCard}>
                  <span>Bajo stock</span><strong>{productosBajoStock.length}</strong><small>Reponer pronto</small>
                </button>
                <button type="button" onClick={() => setFiltroStockProducto("agotado")} className={`${styles.miniStatCard} ${styles.miniStatDanger}`}>
                  <span>Agotados</span><strong>{productosAgotados.length}</strong><small>Ocultar o reponer</small>
                </button>
                <button type="button" onClick={() => { setFiltroEstadoProducto("todos"); setFiltroStockProducto("todos"); setBusquedaProducto("") }} className={styles.miniStatCard}>
                  <span>Sin imagen</span><strong>{productosSinImagen}</strong><small>{productosInactivos} inactivos</small>
                </button>
              </div>

              <div className={styles.filtersGridWide}>
                <input type="text" placeholder="Buscar producto..." value={busquedaProducto} onChange={(e) => setBusquedaProducto(e.target.value)} className={styles.input} />
                <select value={filtroEstadoProducto} onChange={(e) => setFiltroEstadoProducto(e.target.value)} className={styles.input}>
                  <option value="todos">Todos los estados</option>
                  <option value="activo">Activos</option>
                  <option value="inactivo">Inactivos</option>
                </select>
                <select value={filtroStockProducto} onChange={(e) => setFiltroStockProducto(e.target.value)} className={styles.input}>
                  <option value="todos">Todo el stock</option>
                  <option value="agotado">Agotados</option>
                  <option value="bajo">Bajo stock</option>
                  <option value="ok">Stock estable</option>
                </select>
                <select value={ordenProducto} onChange={(e) => setOrdenProducto(e.target.value as OrdenProducto)} className={styles.input}>
                  <option value="recientes">Más recientes</option>
                  <option value="nombre">Nombre A-Z</option>
                  <option value="precio_mayor">Precio mayor</option>
                  <option value="precio_menor">Precio menor</option>
                  <option value="stock_menor">Menor stock</option>
                </select>
              </div>

              <div className={styles.productGrid}>
                {productosVisibles.length === 0 ? (
                  <EmptyState title="Sin productos" text="No hay productos que coincidan con los filtros." />
                ) : productosVisibles.map((p) => (
                  <article key={p.id} className={`${styles.productCard} ${styles.productCardPro} ${Number(p.stock) <= 0 ? styles.cardDanger : Number(p.stock) <= 3 ? styles.cardWarning : ""}`}>
                    {p.imagen ? <img src={p.imagen} alt={p.nombre} className={styles.productImage} /> : <div className={styles.productImagePlaceholder}>JS</div>}
                    <div className={styles.productBody}>
                      <div className={styles.productTopline}>
                        <StatusBadge estado={p.estado} />
                        <div className={styles.productStateCluster}>
                          {Number(p.stock) <= 0 && <span className={styles.badgeDanger}>Agotado</span>}
                          {Number(p.stock) > 0 && Number(p.stock) <= 3 && <span className={styles.badgeWarning}>Bajo stock</span>}
                          {p.destacado && <span className={styles.badgeInfo}>Destacado</span>}
                          {p.oferta && <span className={styles.offerBadge}>Oferta</span>}
                        </div>
                      </div>
                      <h4>{p.nombre}</h4>
                      <p>{p.descripcion || "Sin descripción"}</p>
                      <div className={styles.productHealthLine}>
                        <span>{p.publicacion ? "Publicado" : "Oculto"}</span>
                        <strong>{Number(p.stock) <= 0 ? "Reponer ahora" : Number(p.stock) <= 3 ? "Stock limitado" : "Stock estable"}</strong>
                      </div>
                      <div className={styles.productMeta}>
                        <span>{formatearSoles(p.precio)}</span>
                        <span className={Number(p.stock) <= 3 ? styles.metaDanger : ""}>Stock: {p.stock}</span>
                        <span>{p.categoria || "Sin categoría"}</span>
                        <span>{p.tipo_venta || "Sin tipo"}</span>
                        <span>{p.duracion || "-"}</span>
                        <span>{p.proveedor || "Jonas Stream"}</span>
                        <span>{Number(p.stock) <= 0 ? "AGOTADO" : p.estado_catalogo || "-"}</span>
                        <span>{p.renovable ? "Renovable" : "No renovable"}</span>
                      </div>
                      <div className={styles.cardActions}>
                        <button type="button" onClick={() => editarProducto(p)} className={styles.secondaryButton}>Editar</button>
                        <button type="button" onClick={() => reponerProductoRapido(p)} className={styles.successButton}>+10 stock</button>
                        <button type="button" onClick={() => eliminarProducto(p.id)} className={styles.dangerButton}>Eliminar</button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {productosFiltrados.length > productosVisibles.length && (
                <div className={styles.loadMoreBox}>
                  <button type="button" onClick={() => setLimiteProductos((prev) => prev + 12)} className={styles.secondaryButton}>Cargar más productos</button>
                </div>
              )}
            </article>
          </div>
        )}

        {tabActiva === "pedidos" && (
          <article className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <p className={styles.kicker}>Ventas</p>
                <h3>Pedidos</h3>
                <span className={styles.panelHint}>Filtros por cliente, correo, ID, estado, método de pago y monto.</span>
              </div>
              <span className={styles.countBadge}>{pedidosFiltrados.length} pedidos</span>
            </div>

            <div className={styles.miniStatsGrid}>
              <button type="button" onClick={() => setFiltroEstadoPedido("pendiente")} className={styles.miniStatCard}>
                <span>Pendientes</span><strong>{pedidosPendientes}</strong><small>{formatearSoles(ingresosPendientes)} por cobrar</small>
              </button>
              <button type="button" onClick={() => setFiltroEstadoPedido("completado")} className={styles.miniStatCard}>
                <span>Completados</span><strong>{pedidosCompletados}</strong><small>{formatearSoles(ventasTotales)} vendido</small>
              </button>
              <button type="button" onClick={() => setFiltroEstadoPedido("cancelado")} className={`${styles.miniStatCard} ${styles.miniStatDanger}`}>
                <span>Cancelados</span><strong>{pedidosCancelados}</strong><small>Revisar pérdidas</small>
              </button>
              <button type="button" onClick={() => { setFiltroEstadoPedido("todos"); setBusquedaPedido("") }} className={styles.miniStatCard}>
                <span>Vista completa</span><strong>{totalPedidos}</strong><small>Limpiar filtros</small>
              </button>
            </div>

            <div className={styles.filtersGridWide}>
              <input type="text" placeholder="Buscar pedido, cliente o correo..." value={busquedaPedido} onChange={(e) => setBusquedaPedido(e.target.value)} className={styles.input} />
              <select value={filtroEstadoPedido} onChange={(e) => setFiltroEstadoPedido(e.target.value)} className={styles.input}>
                {estadosPedido.map((estado) => <option key={estado} value={estado}>{estado === "todos" ? "Todos los estados" : estado}</option>)}
              </select>
              <select value={filtroMetodoPago} onChange={(e) => setFiltroMetodoPago(e.target.value)} className={styles.input}>
                <option value="todos">Todos los pagos</option>
                {metodosPago.map((metodo) => <option key={metodo} value={metodo}>{metodo}</option>)}
              </select>
              <select value={filtroComprobantePedido} onChange={(e) => setFiltroComprobantePedido(e.target.value)} className={styles.input}>
                <option value="todos">Todos los comprobantes</option>
                <option value="con">Con comprobante</option>
                <option value="sin">Sin comprobante</option>
              </select>
              <select value={ordenPedido} onChange={(e) => setOrdenPedido(e.target.value as OrdenPedido)} className={styles.input}>
                <option value="recientes">Más recientes</option>
                <option value="monto_mayor">Mayor monto</option>
                <option value="monto_menor">Menor monto</option>
              </select>
            </div>

            <div className={styles.toolbarInline}>
              <div className={styles.bulkInfo}>
                <strong>{pedidosSeleccionados.length}</strong>
                <span>seleccionados · {formatearSoles(totalSeleccionado)}</span>
              </div>
              <div className={styles.bulkActions}>
                <button type="button" onClick={() => seleccionarPedidosVisibles(pedidosVisiblesIds)} className={styles.secondaryButton}>
                  {pedidosSeleccionadosVisibles === pedidosVisiblesIds.length && pedidosVisiblesIds.length > 0 ? "Quitar visibles" : "Seleccionar visibles"}
                </button>
                <button type="button" disabled={procesandoMasivo || pedidosSeleccionados.length === 0} onClick={() => actualizarPedidosMasivo("completado")} className={styles.successButton}>Completar lote</button>
                <button type="button" disabled={procesandoMasivo || pedidosSeleccionados.length === 0} onClick={() => actualizarPedidosMasivo("cancelado")} className={styles.dangerButton}>Cancelar lote</button>
                <button type="button" disabled={procesandoMasivo || pedidosSeleccionados.length === 0} onClick={eliminarPedidosSeleccionados} className={styles.dangerGhostButton}>Eliminar lote</button>
                <button type="button" onClick={() => setPedidosSeleccionados([])} className={styles.dangerGhostButton}>Limpiar selección</button>
              </div>
              <div className={styles.toggleGroup}>
                <button type="button" onClick={() => { setBusquedaPedido(""); setFiltroEstadoPedido("todos"); setFiltroMetodoPago("todos"); setFiltroComprobantePedido("todos"); setOrdenPedido("recientes") }} className={styles.toggleUtility}>Limpiar filtros</button>
                <button type="button" onClick={() => setVistaPedidos("tarjetas")} className={vistaPedidos === "tarjetas" ? styles.toggleActive : ""}>Tarjetas</button>
                <button type="button" onClick={() => setVistaPedidos("tabla")} className={vistaPedidos === "tabla" ? styles.toggleActive : ""}>Tabla</button>
              </div>
            </div>

            {pedidosFiltrados.length === 0 ? (
              <EmptyState title="No hay pedidos" text="No hay pedidos que coincidan con los filtros." />
            ) : (
              <>
                {vistaPedidos === "tabla" ? (
                  <div className={styles.tableWrap}>
                    <table className={styles.proTable}>
                      <thead>
                        <tr>
                          <th className={styles.checkColumn}><input type="checkbox" aria-label="Seleccionar pedidos visibles" checked={pedidosVisiblesIds.length > 0 && pedidosVisiblesIds.every((id) => pedidosSeleccionados.includes(id))} onChange={() => seleccionarPedidosVisibles(pedidosVisiblesIds)} /></th>
                          <th>Pedido</th>
                          <th>Cliente</th>
                          <th>Total</th>
                          <th>Pago</th>
                          <th>Estado</th>
                          <th>Prioridad</th>
                          <th>Comprobante</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pedidosVisibles.map((pedido) => {
                          const comprobanteUrl = obtenerComprobanteUrl(pedido)
                          const horasDesdeCreacion = (Date.now() - new Date(pedido.created_at).getTime()) / (1000 * 60 * 60)
                          const esUrgente = pedido.estado === "pendiente" && horasDesdeCreacion >= 24
                          const sinComprobante = !comprobanteUrl
                          const altoValor = Number(pedido.total || 0) >= 100
                          return (
                            <tr key={pedido.id} className={pedidosSeleccionados.includes(pedido.id) ? styles.rowSelected : ""}>
                              <td className={styles.checkColumn}><input type="checkbox" aria-label={`Seleccionar pedido ${pedido.id.slice(0, 8)}`} checked={pedidosSeleccionados.includes(pedido.id)} onChange={() => alternarPedidoSeleccionado(pedido.id)} /></td>
                              <td><strong>#{pedido.id.slice(0, 8)}</strong><small>{fechaLegible(pedido.created_at)}</small></td>
                              <td><strong>{pedido.cliente_nombre}</strong><small>{pedido.cliente_correo}</small></td>
                              <td>{formatearSoles(pedido.total)}</td>
                              <td>{pedido.metodo_pago || "No definido"}</td>
                              <td><StatusBadge estado={pedido.estado} /></td>
                              <td>
                                <div className={styles.tablePriorityStack}>
                                  {esUrgente && <span className={styles.badgeDanger}>Urgente</span>}
                                  {sinComprobante && <span className={styles.badgeWarning}>Sin pago</span>}
                                  {altoValor && <span className={styles.badgeInfo}>Alto valor</span>}
                                  {!esUrgente && !sinComprobante && !altoValor && <span className={styles.badgeOk}>OK</span>}
                                </div>
                              </td>
                              <td>{comprobanteUrl ? <a href={comprobanteUrl} target="_blank" rel="noreferrer">Abrir</a> : <span className={styles.mutedText}>Sin voucher</span>}</td>
                              <td>
                                <div className={styles.tableActions}>
                                  <button type="button" onClick={() => actualizarEstadoPedido(pedido.id, "completado")} className={styles.successButton}>OK</button>
                                  <button type="button" onClick={() => actualizarEstadoPedido(pedido.id, "cancelado")} className={styles.dangerButton}>Cancelar</button>
                                  <button type="button" onClick={() => eliminarPedido(pedido.id)} className={styles.dangerGhostButton}>Eliminar</button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className={styles.cardsGrid}>
                    {pedidosVisibles.map((pedido) => {
                      const comprobanteUrl = obtenerComprobanteUrl(pedido)
                      const horasDesdeCreacion = (Date.now() - new Date(pedido.created_at).getTime()) / (1000 * 60 * 60)
                      const esPendiente = pedido.estado === "pendiente"
                      const esUrgente = esPendiente && horasDesdeCreacion >= 24
                      const sinComprobante = !comprobanteUrl
                      const altoValor = Number(pedido.total || 0) >= 100
                      const cardEstadoClase = esUrgente ? styles.orderUrgent : sinComprobante ? styles.orderWarning : altoValor ? styles.orderHighValue : ""

                      return (
                        <article key={pedido.id} className={`${styles.orderCard} ${styles.orderCardPro} ${cardEstadoClase} ${pedidosSeleccionados.includes(pedido.id) ? styles.cardSelected : ""}`}>
                          <div className={styles.orderCardTopline}>
                            <label className={styles.selectionBadge}>
                              <input type="checkbox" checked={pedidosSeleccionados.includes(pedido.id)} onChange={() => alternarPedidoSeleccionado(pedido.id)} />
                              Seleccionar
                            </label>
                            <StatusBadge estado={pedido.estado} />
                          </div>

                          <div className={styles.orderHeroLine}>
                            <div>
                              <span>Pedido #{pedido.id.slice(0, 8)}</span>
                              <h4>{pedido.cliente_nombre}</h4>
                            </div>
                            <strong>{formatearSoles(pedido.total)}</strong>
                          </div>

                          <div className={styles.orderSignalStrip}>
                            {esUrgente && <span className={styles.badgeDanger}>URGENTE +24H</span>}
                            {sinComprobante && <span className={styles.badgeWarning}>SIN PAGO</span>}
                            {altoValor && <span className={styles.badgeInfo}>ALTO VALOR</span>}
                            {!esUrgente && !sinComprobante && !altoValor && <span className={styles.badgeOk}>CONTROLADO</span>}
                          </div>

                          <div className={styles.infoGrid}>
                            <span>Correo</span><strong>{pedido.cliente_correo}</strong>
                            <span>Método</span><strong>{pedido.metodo_pago || "No definido"}</strong>
                            <span>Fecha</span><strong>{fechaLegible(pedido.created_at)}</strong>
                            <span>Tiempo</span><strong>{horasDesdeCreacion < 1 ? "Hace menos de 1h" : `Hace ${Math.floor(horasDesdeCreacion)}h`}</strong>
                          </div>

                          <div className={styles.orderVoucherBox}>
                            <span>Comprobante</span>
                            {comprobanteUrl ? (
                              <a href={comprobanteUrl} target="_blank" rel="noreferrer">Abrir voucher</a>
                            ) : (
                              <strong>Sin comprobante adjunto</strong>
                            )}
                          </div>

                          <div className={styles.cardActions}>
                            <button type="button" onClick={() => actualizarEstadoPedido(pedido.id, "pendiente")} className={styles.secondaryButton}>⏳ Pendiente</button>
                            <button type="button" onClick={() => actualizarEstadoPedido(pedido.id, "completado")} className={styles.successButton}>✔ Completar</button>
                            <button type="button" onClick={() => actualizarEstadoPedido(pedido.id, "cancelado")} className={styles.dangerButton}>✖ Cancelar</button>
                            <button type="button" onClick={() => eliminarPedido(pedido.id)} className={styles.dangerGhostButton}>Eliminar pedido</button>
                          </div>
                        </article>
                      )
                    })}
                  </div>
                )}
                {pedidosFiltrados.length > pedidosVisibles.length && (
                  <div className={styles.loadMoreBox}>
                    <button type="button" onClick={() => setLimitePedidos((prev) => prev + 12)} className={styles.secondaryButton}>Cargar más pedidos</button>
                  </div>
                )}
              </>
            )}
          </article>
        )}

        {tabActiva === "usuarios" && (
          <div className={styles.sectionStack}>
            <section className={styles.usersHeroPro}>
              <div className={styles.usersHeroCopy}>
                <span className={styles.proTag}>USUARIOS PRO</span>
                <h3>Control de accesos Jonas Stream</h3>
                <p>
                  Aprueba registros, separa clientes/proveedores/admins y detecta accesos pendientes sin tocar RLS todavía.
                  Esta pantalla queda lista para operar con más claridad y menos riesgo.
                </p>
                <div className={styles.usersHeroActions}>
                  <button type="button" onClick={() => { setFiltroEstadoUsuario("pendiente"); setVistaUsuarios("tabla") }} className={styles.primaryButton}>Revisar pendientes</button>
                  <button type="button" onClick={() => { setFiltroRolUsuario("proveedor"); setVistaUsuarios("tabla") }} className={styles.secondaryButton}>Ver proveedores</button>
                  <button type="button" onClick={() => { setFiltroRolUsuario("admin"); setVistaUsuarios("tabla") }} className={styles.secondaryButton}>Ver admins</button>
                </div>
              </div>

              <div className={styles.usersHeroStats}>
                <div>
                  <span>Pendientes</span>
                  <strong>{usuariosPendientes}</strong>
                  <small>requieren decisión</small>
                </div>
                <div>
                  <span>Aprobados</span>
                  <strong>{usuariosAprobados}</strong>
                  <small>con acceso activo</small>
                </div>
                <div>
                  <span>Admins</span>
                  <strong>{usuariosAdmin}</strong>
                  <small>control total</small>
                </div>
                <div>
                  <span>Rechazados</span>
                  <strong>{usuariosRechazados}</strong>
                  <small>sin acceso</small>
                </div>
              </div>
            </section>

            <article className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <p className={styles.kicker}>Accesos</p>
                  <h3>Gestión de usuarios</h3>
                  <span className={styles.panelHint}>Aprobar, rechazar y cambiar rol con acciones más claras y vista tabla/tarjetas.</span>
                </div>
                <span className={styles.countBadge}>{usuariosFiltrados.length} usuarios</span>
              </div>

              <div className={styles.miniStatsGrid}>
                <button type="button" onClick={() => setFiltroEstadoUsuario("pendiente")} className={styles.miniStatCard}>
                  <span>Pendientes</span><strong>{usuariosPendientes}</strong><small>Requieren aprobación</small>
                </button>
                <button type="button" onClick={() => setFiltroEstadoUsuario("aprobado")} className={styles.miniStatCard}>
                  <span>Aprobados</span><strong>{usuariosAprobados}</strong><small>Acceso habilitado</small>
                </button>
                <button type="button" onClick={() => setFiltroRolUsuario("proveedor")} className={styles.miniStatCard}>
                  <span>Proveedores</span><strong>{usuariosProveedor}</strong><small>Gestionan catálogo</small>
                </button>
                <button type="button" onClick={() => { setFiltroEstadoUsuario("todos"); setFiltroRolUsuario("todos"); setBusquedaUsuario("") }} className={styles.miniStatCard}>
                  <span>Total</span><strong>{totalUsuarios}</strong><small>{usuariosCliente} clientes · {usuariosAdmin} admins</small>
                </button>
              </div>

              <div className={styles.toolbarInline}>
                <div className={styles.userRiskPanel}>
                  <strong>{usuariosPendientes}</strong>
                  <span>usuarios esperando revisión · {usuariosRechazados} rechazados · {usuariosAdmin} admins</span>
                </div>
                <div className={styles.toggleGroup}>
                  <button type="button" onClick={() => { setBusquedaUsuario(""); setFiltroEstadoUsuario("todos"); setFiltroRolUsuario("todos") }} className={styles.toggleUtility}>Limpiar filtros</button>
                  <button type="button" onClick={() => setVistaUsuarios("tabla")} className={vistaUsuarios === "tabla" ? styles.toggleActive : ""}>Lista</button>
                  <button type="button" onClick={() => setVistaUsuarios("tarjetas")} className={vistaUsuarios === "tarjetas" ? styles.toggleActive : ""}>Tarjetas</button>
                </div>
              </div>

              <div className={styles.filtersGridWide}>
                <input type="text" placeholder="Buscar usuario, correo, rol o estado..." value={busquedaUsuario} onChange={(e) => setBusquedaUsuario(e.target.value)} className={styles.input} />
                <select value={filtroEstadoUsuario} onChange={(e) => setFiltroEstadoUsuario(e.target.value)} className={styles.input}>
                  {estadosUsuario.map((estado) => <option key={estado} value={estado}>{estado === "todos" ? "Todos los estados" : estado}</option>)}
                </select>
                <select value={filtroRolUsuario} onChange={(e) => setFiltroRolUsuario(e.target.value)} className={styles.input}>
                  {rolesUsuario.map((rol) => <option key={rol} value={rol}>{rol === "todos" ? "Todos los roles" : rol}</option>)}
                </select>
              </div>

              {usuariosFiltrados.length === 0 ? (
                <EmptyState title="Sin usuarios" text="No hay usuarios que coincidan con los filtros." />
              ) : vistaUsuarios === "tabla" ? (
                <div className={styles.tableWrap}>
                  <table className={styles.proTable}>
                    <thead>
                      <tr>
                        <th>Usuario</th>
                        <th>Correo</th>
                        <th>Rol</th>
                        <th>Estado</th>
                        <th>Acceso</th>
                        {!esProveedor && <th>Roles</th>}
                        {!esProveedor && <th>Eliminar</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {usuariosFiltrados.map((u) => (
                        <tr key={u.id} className={u.estado === "pendiente" ? styles.userPendingRow : u.estado === "rechazado" ? styles.userRejectedRow : ""}>
                          <td>
                            <strong>{u.nombre || "Usuario sin nombre"}</strong>
                            <small>ID {u.id.slice(0, 8)}</small>
                          </td>
                          <td>{u.correo}</td>
                          <td><span className={styles.roleChip}>{u.rol}</span></td>
                          <td><StatusBadge estado={u.estado} /></td>
                          <td>
                            <div className={styles.tableActions}>
                              <button type="button" onClick={() => actualizarEstado(u.id, "aprobado")} className={styles.successButton}>Aprobar</button>
                              <button type="button" onClick={() => actualizarEstado(u.id, "rechazado")} className={styles.dangerButton}>Rechazar</button>
                            </div>
                          </td>
                          {!esProveedor && (
                            <td>
                              <div className={styles.tableActions}>
                                <button type="button" onClick={() => cambiarRol(u.id, "cliente")} className={styles.secondaryButton}>Cliente</button>
                                <button type="button" onClick={() => cambiarRol(u.id, "proveedor")} className={styles.secondaryButton}>Proveedor</button>
                                <button type="button" onClick={() => cambiarRol(u.id, "admin")} className={styles.secondaryButton}>Admin</button>
                              </div>
                            </td>
                          )}
                          {!esProveedor && (
                            <td>
                              <button type="button" onClick={() => eliminarUsuario(u.id)} className={styles.dangerGhostButton}>Eliminar</button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className={styles.cardsGrid}>
                  {usuariosFiltrados.map((u) => {
                    const iniciales = u.nombre?.slice(0, 2).toUpperCase() || "US"
                    const esPendiente = u.estado === "pendiente"
                    const esRechazado = u.estado === "rechazado"
                    const esAdmin = u.rol === "admin"

                    return (
                      <article key={u.id} className={`${styles.userCard} ${styles.userCardPro} ${esPendiente ? styles.cardWarning : ""} ${esRechazado ? styles.cardDanger : ""}`}>
                        <div className={styles.userCardTopline}>
                          <div className={styles.avatar}>{iniciales}</div>
                          <div className={styles.userStateStack}>
                            <StatusBadge estado={u.estado} />
                            <span className={styles.roleChip}>{u.rol}</span>
                          </div>
                        </div>

                        <div>
                          <h4>{u.nombre || "Usuario sin nombre"}</h4>
                          <p>{u.correo}</p>
                        </div>

                        <div className={styles.userAccessSummary}>
                          <div>
                            <span>Estado</span>
                            <strong>{esPendiente ? "Revisión necesaria" : esRechazado ? "Acceso bloqueado" : "Acceso habilitado"}</strong>
                          </div>
                          <div>
                            <span>Nivel</span>
                            <strong>{esAdmin ? "Control total" : u.rol === "proveedor" ? "Gestión catálogo" : "Cliente"}</strong>
                          </div>
                        </div>

                        {esPendiente && <div className={styles.noticeBox}>Este usuario está esperando aprobación. Revísalo antes de entregar acceso.</div>}

                        <div className={styles.actionDivider}>Estado de acceso</div>
                        <div className={styles.cardActions}>
                          <button type="button" onClick={() => actualizarEstado(u.id, "aprobado")} className={styles.successButton}>✅ Aprobar</button>
                          <button type="button" onClick={() => actualizarEstado(u.id, "rechazado")} className={styles.dangerButton}>⛔ Rechazar</button>
                        </div>

                        {!esProveedor && (
                          <>
                            <div className={styles.actionDivider}>Rol del usuario</div>
                            <div className={styles.roleActionGrid}>
                              <button type="button" onClick={() => cambiarRol(u.id, "cliente")} className={`${styles.secondaryButton} ${u.rol === "cliente" ? styles.roleActiveButton : ""}`}>Cliente</button>
                              <button type="button" onClick={() => cambiarRol(u.id, "proveedor")} className={`${styles.secondaryButton} ${u.rol === "proveedor" ? styles.roleActiveButton : ""}`}>Proveedor</button>
                              <button type="button" onClick={() => cambiarRol(u.id, "admin")} className={`${styles.secondaryButton} ${u.rol === "admin" ? styles.roleActiveButton : ""}`}>Admin</button>
                            </div>
                            <button type="button" onClick={() => eliminarUsuario(u.id)} className={styles.dangerGhostButton}>Eliminar usuario</button>
                          </>
                        )}
                      </article>
                    )
                  })}
                </div>
              )}
            </article>
          </div>
        )}

        {tabActiva === "comprobantes" && (
          <div className={styles.sectionStack}>
            <section className={styles.paymentHeroPro}>
              <div className={styles.paymentHeroCopy}>
                <span className={styles.proTag}>COMPROBANTES PRO</span>
                <h3>Centro de revisión de pagos</h3>
                <p>
                  Valida vouchers, revisa cliente, monto, método y estado del pedido desde una sola pantalla. Si apruebas un comprobante, el pedido queda listo para completar.
                </p>
                <div className={styles.dashboardHeroActions}>
                  <button type="button" onClick={() => setFiltroEstadoComprobante("pendiente")} className={styles.primaryButton}>Revisar pendientes</button>
                  <button type="button" onClick={() => setVistaComprobantes("revision")} className={styles.secondaryButton}>Vista revisión</button>
                  <button type="button" onClick={() => setVistaComprobantes("tabla")} className={styles.secondaryButton}>Vista tabla</button>
                </div>
              </div>

              <div className={styles.paymentHeroPanel}>
                <p>Pagos en revisión</p>
                <strong>{comprobantesUnificados.filter((c) => c.estado === "pendiente").length}</strong>
                <span>{formatearSoles(comprobantesUnificados.filter((c) => c.estado === "pendiente").reduce((acc, item) => acc + Number(item.monto || 0), 0))} pendientes por validar</span>
                <div className={styles.moneySplitGrid}>
                  <div>
                    <small>Aprobados</small>
                    <b>{comprobantesUnificados.filter((c) => c.estado === "aprobado" || c.estado === "completado").length}</b>
                  </div>
                  <div>
                    <small>Sin archivo</small>
                    <b>{comprobantesUnificados.filter((c) => !c.url).length}</b>
                  </div>
                </div>
              </div>
            </section>

            <article className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <p className={styles.kicker}>Pagos</p>
                  <h3>Comprobantes reales</h3>
                  <span className={styles.panelHint}>Lee la tabla comprobantes si existe; si no, muestra vouchers guardados en pedidos.</span>
                </div>
                <span className={styles.countBadge}>{comprobantesFiltrados.length} comprobantes</span>
              </div>

              {!comprobantesDisponibles && (
                <div className={styles.noticeBox}>
                  No encontré la tabla <strong>comprobantes</strong>. Por ahora este módulo usa URLs de comprobante dentro de pedidos si tus columnas existen.
                </div>
              )}

              <div className={styles.paymentStatsGrid}>
                <button type="button" onClick={() => setFiltroEstadoComprobante("pendiente")} className={styles.paymentStatCard}>
                  <span>Pendientes</span>
                  <strong>{comprobantesUnificados.filter((c) => c.estado === "pendiente").length}</strong>
                  <small>{formatearSoles(comprobantesUnificados.filter((c) => c.estado === "pendiente").reduce((acc, item) => acc + Number(item.monto || 0), 0))}</small>
                </button>
                <button type="button" onClick={() => setFiltroEstadoComprobante("aprobado")} className={styles.paymentStatCard}>
                  <span>Aprobados</span>
                  <strong>{comprobantesUnificados.filter((c) => c.estado === "aprobado" || c.estado === "completado").length}</strong>
                  <small>Pagos listos para entrega</small>
                </button>
                <button type="button" onClick={() => setFiltroEstadoComprobante("observado")} className={styles.paymentStatCard}>
                  <span>Observados</span>
                  <strong>{comprobantesUnificados.filter((c) => c.estado === "observado").length}</strong>
                  <small>Necesitan revisión manual</small>
                </button>
                <button type="button" onClick={() => setFiltroEstadoComprobante("rechazado")} className={`${styles.paymentStatCard} ${styles.paymentStatDanger}`}>
                  <span>Rechazados</span>
                  <strong>{comprobantesUnificados.filter((c) => c.estado === "rechazado").length}</strong>
                  <small>Revisar con cliente</small>
                </button>
              </div>

              <div className={styles.filtersGridCompact}>
                <input type="text" placeholder="Buscar cliente, correo, pedido o método..." value={busquedaComprobante} onChange={(e) => setBusquedaComprobante(e.target.value)} className={styles.input} />
                <select value={filtroEstadoComprobante} onChange={(e) => setFiltroEstadoComprobante(e.target.value)} className={styles.input}>
                  <option value="todos">Todos los estados</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="aprobado">Aprobado</option>
                  <option value="completado">Completado</option>
                  <option value="observado">Observado</option>
                  <option value="rechazado">Rechazado</option>
                </select>
              </div>

              <div className={styles.toolbarInline}>
                <div className={styles.bulkInfo}>
                  <strong>{comprobantesFiltrados.length}</strong>
                  <span>filtrados · {formatearSoles(comprobantesFiltrados.reduce((acc, item) => acc + Number(item.monto || 0), 0))}</span>
                </div>
                <div className={styles.bulkActions}>
                  <button type="button" onClick={() => { setFiltroEstadoComprobante("todos"); setBusquedaComprobante("") }} className={styles.secondaryButton}>Limpiar filtros</button>
                  <button type="button" onClick={() => { setFiltroEstadoComprobante("pendiente"); setVistaComprobantes("revision") }} className={styles.primaryButton}>Cola pendiente</button>
                </div>
                <div className={styles.toggleGroup}>
                  <button type="button" onClick={() => setVistaComprobantes("revision")} className={vistaComprobantes === "revision" ? styles.toggleActive : ""}>Revisión</button>
                  <button type="button" onClick={() => setVistaComprobantes("tabla")} className={vistaComprobantes === "tabla" ? styles.toggleActive : ""}>Tabla</button>
                </div>
              </div>

              {comprobantesFiltrados.length === 0 ? (
                <EmptyState title="Sin comprobantes" text="Cuando tus pedidos tengan voucher o actives la tabla comprobantes, aparecerán aquí." />
              ) : (
                <>
                  {vistaComprobantes === "tabla" ? (
                    <div className={styles.tableWrap}>
                      <table className={styles.proTable}>
                        <thead>
                          <tr>
                            <th>Comprobante</th>
                            <th>Cliente</th>
                            <th>Monto</th>
                            <th>Método</th>
                            <th>Estado</th>
                            <th>Origen</th>
                            <th>Archivo</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {comprobantesVisibles.map((comprobante) => (
                            <tr key={comprobante.id}>
                              <td><strong>#{comprobante.id.slice(0, 8)}</strong><small>{fechaLegible(comprobante.fecha)}</small></td>
                              <td><strong>{comprobante.cliente}</strong><small>{comprobante.correo || "Sin correo"}</small></td>
                              <td>{formatearSoles(comprobante.monto)}</td>
                              <td>{comprobante.metodo}</td>
                              <td><StatusBadge estado={comprobante.estado} /></td>
                              <td><span className={comprobante.origen === "tabla" ? styles.badgeInfo : styles.badgeOk}>{comprobante.origen === "tabla" ? "Tabla" : "Pedido"}</span></td>
                              <td>{comprobante.url ? <a href={comprobante.url} target="_blank" rel="noreferrer">Abrir</a> : <span className={styles.badgeWarning}>Sin archivo</span>}</td>
                              <td>
                                <div className={styles.tableActions}>
                                  <button type="button" onClick={() => resolverComprobantePro(comprobante, "aprobado")} className={styles.successButton}>Aprobar</button>
                                  <button type="button" onClick={() => resolverComprobantePro(comprobante, "observado")} className={styles.secondaryButton}>Observar</button>
                                  <button type="button" onClick={() => resolverComprobantePro(comprobante, "rechazado")} className={styles.dangerButton}>Rechazar</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className={styles.reviewGridPro}>
                      {comprobantesVisibles.map((comprobante) => {
                        const estadoCritico = comprobante.estado === "pendiente" || comprobante.estado === "observado"
                        const sinArchivo = !comprobante.url

                        return (
                          <article key={comprobante.id} className={`${styles.reviewCardPro} ${estadoCritico ? styles.reviewPending : ""} ${sinArchivo ? styles.reviewNoFile : ""}`}>
                            <div className={styles.reviewMediaPro}>
                              {comprobante.url ? (
                                <a href={comprobante.url} target="_blank" rel="noreferrer">
                                  <img src={comprobante.url} alt={`Comprobante ${comprobante.id.slice(0, 8)}`} />
                                  <span>Abrir comprobante</span>
                                </a>
                              ) : (
                                <div className={styles.reviewPlaceholderPro}>
                                  <strong>Sin archivo</strong>
                                  <small>El cliente todavía no adjuntó voucher o la URL no existe.</small>
                                </div>
                              )}
                            </div>

                            <div className={styles.reviewBodyPro}>
                              <div className={styles.reviewTopline}>
                                <div>
                                  <p className={styles.kicker}>Revisión de pago</p>
                                  <h4>#{comprobante.id.slice(0, 8)}</h4>
                                </div>
                                <StatusBadge estado={comprobante.estado} />
                              </div>

                              <div className={styles.reviewAmountBox}>
                                <span>Monto declarado</span>
                                <strong>{formatearSoles(comprobante.monto)}</strong>
                                <small>{comprobante.metodo || "Método no definido"}</small>
                              </div>

                              <div className={styles.infoGrid}>
                                <span>Cliente</span><strong>{comprobante.cliente}</strong>
                                <span>Correo</span><strong>{comprobante.correo || "Sin correo"}</strong>
                                <span>Pedido</span><strong>{comprobante.pedidoId ? `#${comprobante.pedidoId.slice(0, 8)}` : "Sin pedido vinculado"}</strong>
                                <span>Fecha</span><strong>{fechaLegible(comprobante.fecha)}</strong>
                                <span>Origen</span><strong>{comprobante.origen === "tabla" ? "Tabla comprobantes" : "Pedido con voucher"}</strong>
                              </div>

                              <div className={styles.reviewChecklist}>
                                <span className={comprobante.url ? styles.checkOk : styles.checkBad}>{comprobante.url ? "Archivo visible" : "Sin archivo"}</span>
                                <span className={Number(comprobante.monto || 0) > 0 ? styles.checkOk : styles.checkWarn}>{Number(comprobante.monto || 0) > 0 ? "Monto válido" : "Monto por confirmar"}</span>
                                <span className={comprobante.pedidoId ? styles.checkOk : styles.checkWarn}>{comprobante.pedidoId ? "Pedido vinculado" : "Sin pedido"}</span>
                              </div>

                              <div className={styles.reviewActionsPro}>
                                <button type="button" onClick={() => resolverComprobantePro(comprobante, "aprobado")} className={styles.successButton}>Aprobar pago</button>
                                <button type="button" onClick={() => resolverComprobantePro(comprobante, "observado")} className={styles.secondaryButton}>Observar</button>
                                <button type="button" onClick={() => resolverComprobantePro(comprobante, "rechazado")} className={styles.dangerButton}>Rechazar</button>
                              </div>
                            </div>
                          </article>
                        )
                      })}
                    </div>
                  )}
                  {comprobantesFiltrados.length > comprobantesVisibles.length && (
                    <div className={styles.loadMoreBox}>
                      <button type="button" onClick={() => setLimiteComprobantes((prev) => prev + 12)} className={styles.secondaryButton}>Cargar más comprobantes</button>
                    </div>
                  )}
                </>
              )}
            </article>
          </div>
        )}


        {tabActiva === "cuentas" && (
          <div className={styles.sectionStack}>
            <section className={styles.accountsHeroPro}>
              <div>
                <span className={styles.proTag}>Inventario de accesos</span>
                <h3>Cuentas registradas</h3>
                <p>
                  Registra correos, claves, perfiles y PIN de consulta. Las fechas de inicio y vencimiento se llenarán después,
                  cuando una cuenta sea asignada a un pedido aprobado o a una compra con créditos.
                </p>
              </div>

              <div className={styles.accountsHeroStats}>
                <button type="button" onClick={() => setFiltroCuentaEstado("disponible")}>
                  <strong>{cuentasDisponiblesTotal}</strong>
                  <span>Disponibles</span>
                </button>
                <button type="button" onClick={() => setFiltroCuentaEstado("asignada")}>
                  <strong>{cuentasAsignadasTotal}</strong>
                  <span>Asignadas</span>
                </button>
                <button type="button" onClick={() => setFiltroCuentaEstado("vencida")}>
                  <strong>{cuentasVencidasTotal}</strong>
                  <span>Vencidas</span>
                </button>
                <button type="button" onClick={() => setFiltroCuentaEstado("bloqueada")}>
                  <strong>{cuentasBloqueadasTotal}</strong>
                  <span>Bloqueadas</span>
                </button>
              </div>
            </section>

            {!cuentasDisponibles && (
              <div className={styles.noticeBox}>
                La tabla <strong>cuentas</strong> todavía no existe o no tiene permisos. Primero ejecuta el SQL incluido en este ZIP:
                <strong> supabase/sql/crear-tabla-cuentas.sql</strong>.
              </div>
            )}

            <article className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <p className={styles.kicker}>Registro</p>
                  <h3>{editandoCuentaId ? "Editar cuenta" : "Registrar cuenta"}</h3>
                  <span className={styles.panelHint}>Aquí solo cargas la cuenta. La fecha se calculará cuando se entregue al cliente.</span>
                </div>
                {editandoCuentaId && <span className={styles.editBadge}>Modo edición</span>}
              </div>

              <form onSubmit={guardarCuenta} className={styles.accountsFormGrid}>
                <select name="producto_id" value={formCuenta.producto_id} onChange={handleCuentaChange} className={styles.input}>
                  <option value="">Selecciona producto</option>
                  {productos.map((producto) => (
                    <option key={producto.id} value={producto.id}>
                      {producto.nombre} · {producto.tipo_venta || "Sin tipo"}
                    </option>
                  ))}
                </select>

                <select name="estado" value={formCuenta.estado} onChange={handleCuentaChange} className={styles.input}>
                  <option value="disponible">Disponible</option>
                  <option value="asignada">Asignada</option>
                  <option value="mantenimiento">Mantenimiento</option>
                  <option value="bloqueada">Bloqueada</option>
                  <option value="vencida">Vencida</option>
                </select>

                <input name="correo" placeholder="Correo de la cuenta" value={formCuenta.correo} onChange={handleCuentaChange} className={styles.input} />
                <input name="clave" placeholder="Clave de la cuenta" value={formCuenta.clave} onChange={handleCuentaChange} className={styles.input} />
                <input name="perfil" placeholder="Perfil / usuario interno" value={formCuenta.perfil} onChange={handleCuentaChange} className={styles.input} />
                <input name="pin_perfil" placeholder="PIN del perfil" value={formCuenta.pin_perfil} onChange={handleCuentaChange} className={styles.input} />
                <input name="pin_acceso" placeholder="PIN de consulta pública" value={formCuenta.pin_acceso} onChange={handleCuentaChange} className={styles.input} />
                <textarea name="observacion_admin" placeholder="Observación interna" value={formCuenta.observacion_admin} onChange={handleCuentaChange} className={`${styles.input} ${styles.textarea}`} />

                <div className={styles.formActions}>
                  <button type="submit" disabled={guardandoCuenta} className={styles.primaryButton}>
                    {guardandoCuenta ? "Guardando..." : editandoCuentaId ? "Actualizar cuenta" : "Registrar cuenta"}
                  </button>
                  {editandoCuentaId && (
                    <button type="button" onClick={limpiarFormularioCuenta} className={styles.secondaryButton}>
                      Cancelar edición
                    </button>
                  )}
                </div>
              </form>
            </article>

            <article className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <p className={styles.kicker}>Inventario</p>
                  <h3>Lista de cuentas</h3>
                  <span className={styles.panelHint}>Controla disponibles, asignadas, vencidas, bloqueadas y mantenimiento.</span>
                </div>
                <span className={styles.countBadge}>{cuentasFiltradas.length} cuentas</span>
              </div>

              <div className={styles.accountsToolbarPro}>
                <input
                  type="text"
                  placeholder="Buscar por correo, producto, perfil, cliente o PIN..."
                  value={busquedaCuenta}
                  onChange={(e) => setBusquedaCuenta(e.target.value)}
                  className={styles.input}
                />
                <div className={styles.toggleGroup}>
                  <button type="button" onClick={() => setFiltroCuentaEstado("todos")} className={filtroCuentaEstado === "todos" ? styles.toggleActive : ""}>Todo</button>
                  <button type="button" onClick={() => setFiltroCuentaEstado("disponible")} className={filtroCuentaEstado === "disponible" ? styles.toggleActive : ""}>Disponible</button>
                  <button type="button" onClick={() => setFiltroCuentaEstado("asignada")} className={filtroCuentaEstado === "asignada" ? styles.toggleActive : ""}>Asignada</button>
                  <button type="button" onClick={() => setFiltroCuentaEstado("vencida")} className={filtroCuentaEstado === "vencida" ? styles.toggleActive : ""}>Vencida</button>
                </div>
              </div>

              <div className={styles.accountsGridPro}>
                {cuentasFiltradas.length === 0 ? (
                  <EmptyState title="Sin cuentas" text="Registra cuentas disponibles para que luego puedan asignarse a pedidos." />
                ) : cuentasFiltradas.map((cuenta) => {
                  const producto = productos.find((item) => item.id === cuenta.producto_id)
                  const estado = normalizarTexto(cuenta.estado)
                  const esDisponible = estado === "disponible"
                  const esAsignada = estado === "asignada"
                  const esProblema = estado === "bloqueada" || estado === "mantenimiento" || estado === "vencida"

                  return (
                    <article key={cuenta.id} className={`${styles.accountCardPro} ${esDisponible ? styles.accountCardAvailable : esAsignada ? styles.accountCardAssigned : esProblema ? styles.accountCardDanger : ""}`}>
                      <div className={styles.accountCardTop}>
                        <div>
                          <span className={styles.inventoryLabel}>{producto?.nombre || cuenta.producto_nombre || "Producto sin vincular"}</span>
                          <h4>{cuenta.correo}</h4>
                          <p>{cuenta.perfil || "Sin perfil"} · PIN perfil: {cuenta.pin_perfil || "-"}</p>
                        </div>
                        <StatusBadge estado={cuenta.estado || "disponible"} />
                      </div>

                      <div className={styles.accountSecretGrid}>
                        <div>
                          <span>Clave</span>
                          <strong>{cuenta.clave}</strong>
                        </div>
                        <div>
                          <span>PIN consulta</span>
                          <strong>{cuenta.pin_acceso || "-"}</strong>
                        </div>
                      </div>

                      <div className={styles.accountMetaGrid}>
                        <div>
                          <span>Cliente</span>
                          <strong>{cuenta.cliente_nombre || cuenta.cliente_correo || "Sin asignar"}</strong>
                        </div>
                        <div>
                          <span>Inicio</span>
                          <strong>{fechaLegible(cuenta.cliente_inicio)}</strong>
                        </div>
                        <div>
                          <span>Fin</span>
                          <strong>{fechaLegible(cuenta.cliente_fin)}</strong>
                        </div>
                        <div>
                          <span>Pedido</span>
                          <strong>{cuenta.pedido_id ? `#${cuenta.pedido_id.slice(0, 8)}` : "Sin pedido"}</strong>
                        </div>
                      </div>

                      {cuenta.observacion_admin && <p className={styles.accountNote}>{cuenta.observacion_admin}</p>}

                      <div className={styles.inventoryQuickActions}>
                        <button type="button" onClick={() => editarCuenta(cuenta)} className={styles.primaryButton}>Editar</button>
                        <button type="button" onClick={() => actualizarEstadoCuenta(cuenta, "disponible")} className={styles.successButton}>Disponible</button>
                        <button type="button" onClick={() => actualizarEstadoCuenta(cuenta, "mantenimiento")} className={styles.secondaryButton}>Mantenimiento</button>
                        <button type="button" onClick={() => actualizarEstadoCuenta(cuenta, "bloqueada")} className={styles.dangerGhostButton}>Bloquear</button>
                        <button type="button" onClick={() => eliminarCuenta(cuenta)} className={styles.dangerButton}>Eliminar</button>
                      </div>
                    </article>
                  )
                })}
              </div>
            </article>
          </div>
        )}

        {tabActiva === "inventario" && (
          <div className={styles.sectionStack}>
            <section className={styles.inventoryHeroPro}>
              <div>
                <span className={styles.proTag}>FASE 6 · INVENTARIO AUTO</span>
                <h3>Centro de stock inteligente</h3>
                <p>
                  Controla agotados, bajo stock, reposiciones rápidas y descuento automático al completar pedidos
                  cuando el producto del pedido coincide con el catálogo.
                </p>
              </div>
              <div className={styles.inventoryHeroStats}>
                <button type="button" onClick={() => setFiltroInventario("agotado")}>
                  <strong>{productosAgotados.length}</strong>
                  <span>Agotados</span>
                </button>
                <button type="button" onClick={() => setFiltroInventario("bajo")}>
                  <strong>{productosBajoStock.length}</strong>
                  <span>Bajo stock</span>
                </button>
                <button type="button" onClick={() => setFiltroInventario("estable")}>
                  <strong>{productos.filter((p) => Number(p.stock) > 3).length}</strong>
                  <span>Estables</span>
                </button>
              </div>
            </section>

            <div className={styles.metricsGridCompact}>
              <MetricCard title="Stock estable" value={productos.filter((p) => Number(p.stock) > 3).length} detail="Productos sin alerta" tone="success" />
              <MetricCard title="Bajo stock" value={productosBajoStock.length} detail="1 a 3 unidades" tone="warning" />
              <MetricCard title="Agotados" value={productosAgotados.length} detail="Reponer urgente" tone="danger" />
              <MetricCard title="Salud" value={`${saludInventario}%`} detail="Estado general" tone="info" />
            </div>

            <article className={`${styles.panel} ${styles.autoInventoryPanel} ${styles.autoInventoryPanelPro}`}>
              <div>
                <p className={styles.kicker}>Automatización</p>
                <h3>Inventario automático</h3>
                <p>
                  Sincroniza estados visuales: stock 0 pasa a AGOTADO y se oculta; stock 1-3 pasa a LIMITADO;
                  stock mayor a 3 queda ACTIVO. Al completar pedidos, el panel intenta descontar 1 unidad por coincidencia de nombre.
                </p>
              </div>
              <div className={styles.autoInventoryActions}>
                <button type="button" disabled={sincronizandoInventario} onClick={sincronizarInventarioAutomatico} className={styles.primaryButton}>
                  {sincronizandoInventario ? "Sincronizando..." : "Sincronizar inventario"}
                </button>
                <button type="button" onClick={() => { setFiltroInventario("critico"); setBusquedaInventario("") }} className={styles.secondaryButton}>Ver críticos</button>
                <button type="button" onClick={() => { setFiltroStockProducto("agotado"); setTabActiva("productos") }} className={styles.dangerButton}>Editar agotados</button>
              </div>
            </article>

            <article className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <p className={styles.kicker}>Operación</p>
                  <h3>Control de inventario</h3>
                  <span className={styles.panelHint}>Filtra, repone, descuenta o edita productos sin salir del módulo.</span>
                </div>
                <span className={styles.countBadge}>{productosInventarioFiltrados.length} productos</span>
              </div>

              <div className={styles.inventoryToolbarPro}>
                <input
                  type="text"
                  placeholder="Buscar producto, categoría o proveedor..."
                  value={busquedaInventario}
                  onChange={(e) => setBusquedaInventario(e.target.value)}
                  className={styles.input}
                />
                <div className={styles.toggleGroup}>
                  <button type="button" onClick={() => setFiltroInventario("critico")} className={filtroInventario === "critico" ? styles.toggleActive : ""}>Críticos</button>
                  <button type="button" onClick={() => setFiltroInventario("agotado")} className={filtroInventario === "agotado" ? styles.toggleActive : ""}>Agotados</button>
                  <button type="button" onClick={() => setFiltroInventario("bajo")} className={filtroInventario === "bajo" ? styles.toggleActive : ""}>Bajo</button>
                  <button type="button" onClick={() => setFiltroInventario("estable")} className={filtroInventario === "estable" ? styles.toggleActive : ""}>Estable</button>
                  <button type="button" onClick={() => setFiltroInventario("todos")} className={filtroInventario === "todos" ? styles.toggleActive : ""}>Todo</button>
                </div>
              </div>

              <div className={styles.inventoryGridPro}>
                {productosInventarioFiltrados.length === 0 ? (
                  <EmptyState title="Sin productos" text="No hay productos que coincidan con el filtro de inventario." />
                ) : productosInventarioFiltrados.map((producto) => {
                  const stock = Number(producto.stock || 0)
                  const esAgotado = stock <= 0
                  const esBajo = stock > 0 && stock <= 3
                  const porcentajeStock = Math.min(100, Math.max(0, (stock / 10) * 100))

                  return (
                    <article key={producto.id} className={`${styles.inventoryCardPro} ${esAgotado ? styles.inventoryCardDanger : esBajo ? styles.inventoryCardWarning : ""}`}>
                      <div className={styles.inventoryCardTop}>
                        <div>
                          <span className={styles.inventoryLabel}>{producto.categoria || "Sin categoría"}</span>
                          <h4>{producto.nombre}</h4>
                          <p>{producto.proveedor || "Jonas Stream"} · {producto.estado_catalogo || "ACTIVO"}</p>
                        </div>
                        <div className={esAgotado ? styles.stockPillDanger : esBajo ? styles.stockPill : styles.stockPillOk}>{stock} und.</div>
                      </div>

                      <div className={styles.stockMeter}>
                        <span style={{ width: `${porcentajeStock}%` }}></span>
                      </div>

                      <div className={styles.inventoryStatusLine}>
                        <strong>{esAgotado ? "Reponer ahora" : esBajo ? "Stock limitado" : "Inventario estable"}</strong>
                        <small>{producto.publicacion ? "Publicado" : "Oculto"}</small>
                      </div>

                      <div className={styles.inventoryQuickActions}>
                        <button type="button" onClick={() => ajustarStockProducto(producto, -1)} className={styles.dangerGhostButton}>-1</button>
                        <button type="button" onClick={() => ajustarStockProducto(producto, 1)} className={styles.secondaryButton}>+1</button>
                        <button type="button" onClick={() => ajustarStockProducto(producto, 5)} className={styles.secondaryButton}>+5</button>
                        <button type="button" onClick={() => reponerProductoRapido(producto, 10)} className={styles.successButton}>+10</button>
                        <button type="button" onClick={() => editarProducto(producto)} className={styles.primaryButton}>Editar</button>
                      </div>
                    </article>
                  )
                })}
              </div>
            </article>
          </div>
        )}

        {tabActiva === "creditos" && (
          <PlaceholderPanel
            title="Créditos"
            text="Zona preparada para saldos, créditos de proveedores, historial y control financiero. El diseño queda listo para conectar una tabla de créditos después."
            buttonText="Preparado"
          />
        )}

        {tabActiva === "historial" && (
          <div className={styles.sectionStack}>
            <section className={styles.auditHeroPro}>
              <div className={styles.auditHeroCopy}>
                <span className={styles.proTag}>FASE 8 · HISTORIAL PRO</span>
                <h3>Centro de auditoría operativa</h3>
                <p>
                  Revisa acciones reales del panel, filtra por entidad, detecta movimientos críticos
                  y valida quién hizo cada cambio antes de avanzar a seguridad/RLS.
                </p>
                <div className={styles.dashboardHeroActions}>
                  <button type="button" onClick={() => { setFiltroEntidadLog("todos"); setBusquedaHistorial("") }} className={styles.primaryButton}>Ver todo</button>
                  <button type="button" onClick={() => setBusquedaHistorial("eliminar")} className={styles.secondaryButton}>Auditar eliminados</button>
                  <button type="button" onClick={() => setBusquedaHistorial("stock")} className={styles.secondaryButton}>Auditar stock</button>
                </div>
              </div>

              <div className={styles.auditHeroPanel}>
                <p>Eventos registrados</p>
                <strong>{logs.length}</strong>
                <span>{logsHoy} acciones de hoy · {logsCriticos} eventos críticos detectados</span>
                <div className={styles.moneySplitGrid}>
                  <div>
                    <small>Entidades</small>
                    <b>{entidadesLog.length}</b>
                  </div>
                  <div>
                    <small>Sistema</small>
                    <b>{logsSistema}</b>
                  </div>
                </div>
              </div>
            </section>

            <article className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <p className={styles.kicker}>Auditoría</p>
                  <h3>Historial de actividad</h3>
                  <span className={styles.panelHint}>Registros reales desde admin_logs con filtros por entidad, búsqueda y lectura tipo timeline.</span>
                </div>
                <span className={styles.countBadge}>{logsFiltrados.length} eventos</span>
              </div>

              <div className={styles.auditStatsGrid}>
                <button type="button" onClick={() => { setFiltroEntidadLog("todos"); setBusquedaHistorial("") }} className={styles.auditStatCard}>
                  <span>Total logs</span>
                  <strong>{logs.length}</strong>
                  <small>Todos los movimientos</small>
                </button>
                <button type="button" onClick={() => setBusquedaHistorial("eliminar")} className={`${styles.auditStatCard} ${styles.auditStatDanger}`}>
                  <span>Críticos</span>
                  <strong>{logsCriticos}</strong>
                  <small>Eliminar / rechazar / errores</small>
                </button>
                <button type="button" onClick={() => setBusquedaHistorial("stock")} className={styles.auditStatCard}>
                  <span>Inventario</span>
                  <strong>{logs.filter((log) => normalizarTexto(`${log.accion} ${log.detalle}`).includes("stock")).length}</strong>
                  <small>Reposiciones y descuentos</small>
                </button>
                <button type="button" onClick={() => setBusquedaHistorial("actualizar")} className={styles.auditStatCard}>
                  <span>Actualizaciones</span>
                  <strong>{logs.filter((log) => normalizarTexto(log.accion).includes("actualizar")).length}</strong>
                  <small>Cambios de estado y edición</small>
                </button>
              </div>

              {ultimaAccionImportante && (
                <section className={styles.auditFocusCard}>
                  <div>
                    <p className={styles.kicker}>Última acción importante</p>
                    <h4>{ultimaAccionImportante.accion} · {ultimaAccionImportante.entidad}</h4>
                    <span>{ultimaAccionImportante.detalle || "Sin detalle registrado"}</span>
                  </div>
                  <div className={styles.auditFocusMeta}>
                    <strong>{ultimaAccionImportante.actor_nombre || "Sistema"}</strong>
                    <small>{ultimaAccionImportante.actor_correo || "sin correo"}</small>
                    <em>{fechaLegible(ultimaAccionImportante.created_at)}</em>
                  </div>
                </section>
              )}

              <div className={styles.filtersGridWide}>
                <input type="text" placeholder="Buscar acción, detalle, actor o correo..." value={busquedaHistorial} onChange={(e) => setBusquedaHistorial(e.target.value)} className={styles.input} />
                <select value={filtroEntidadLog} onChange={(e) => setFiltroEntidadLog(e.target.value)} className={styles.input}>
                  <option value="todos">Todas las entidades</option>
                  {entidadesLog.map((entidad) => <option key={entidad} value={entidad}>{entidad}</option>)}
                </select>
                <button type="button" onClick={() => { setBusquedaHistorial(""); setFiltroEntidadLog("todos") }} className={styles.secondaryButton}>Limpiar filtros</button>
                <button type="button" onClick={() => cargarDatos()} className={styles.primaryButton}>Actualizar logs</button>
              </div>

              <div className={styles.auditEntityChips}>
                <button type="button" onClick={() => setFiltroEntidadLog("todos")} className={filtroEntidadLog === "todos" ? styles.auditChipActive : ""}>Todas</button>
                {entidadesLog.slice(0, 10).map((entidad) => (
                  <button key={entidad} type="button" onClick={() => setFiltroEntidadLog(entidad)} className={filtroEntidadLog === entidad ? styles.auditChipActive : ""}>
                    {entidad}
                  </button>
                ))}
              </div>

              {logsVisibles.length === 0 ? (
                <EmptyState title="Sin historial" text="Cuando ejecutes acciones del panel, aparecerán aquí." />
              ) : (
                <div className={styles.auditTimeline}>
                  {logsVisibles.map((log, index) => {
                    const textoCritico = normalizarTexto(`${log.accion} ${log.entidad} ${log.detalle}`)
                    const esCritico = textoCritico.includes("eliminar") || textoCritico.includes("rechaz") || textoCritico.includes("error") || textoCritico.includes("cancel") || textoCritico.includes("stock_no_encontrado")
                    const esStock = textoCritico.includes("stock") || textoCritico.includes("inventario") || textoCritico.includes("reponer")
                    const esCreacion = textoCritico.includes("crear")

                    return (
                      <article key={log.id} className={`${styles.auditTimelineItem} ${esCritico ? styles.auditTimelineDanger : ""} ${esStock ? styles.auditTimelineStock : ""}`}>
                        <div className={styles.auditTimelineMarker}>
                          <span>{index + 1}</span>
                        </div>

                        <div className={styles.auditTimelineBody}>
                          <div className={styles.auditTimelineTop}>
                            <div>
                              <h4>{log.accion} · {log.entidad}</h4>
                              <p>{log.detalle || "Sin detalle registrado"}</p>
                            </div>
                            <div className={styles.auditBadges}>
                              {esCritico && <span className={styles.badgeDanger}>Crítico</span>}
                              {esStock && <span className={styles.badgeWarning}>Stock</span>}
                              {esCreacion && <span className={styles.badgeOk}>Creación</span>}
                              <StatusBadge estado={fechaLegible(log.created_at)} />
                            </div>
                          </div>

                          <div className={styles.auditMetaGrid}>
                            <div>
                              <span>Actor</span>
                              <strong>{log.actor_nombre || "Sistema"}</strong>
                            </div>
                            <div>
                              <span>Correo</span>
                              <strong>{log.actor_correo || "sin correo"}</strong>
                            </div>
                            <div>
                              <span>Entidad ID</span>
                              <strong>{log.entidad_id ? `#${log.entidad_id.slice(0, 8)}` : "No vinculado"}</strong>
                            </div>
                            <div>
                              <span>Fecha</span>
                              <strong>{fechaLegible(log.created_at)}</strong>
                            </div>
                          </div>
                        </div>
                      </article>
                    )
                  })}
                </div>
              )}

              {logsFiltrados.length > logsVisibles.length && (
                <div className={styles.loadMoreBox}>
                  <button type="button" onClick={() => setLimiteLogs((prev) => prev + 18)} className={styles.secondaryButton}>Cargar más historial</button>
                </div>
              )}
            </article>
          </div>
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
                <button type="submit" className={styles.primaryButton}>{guardandoConfig ? "Guardando..." : configId ? "Actualizar configuración" : "Guardar configuración"}</button>
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
          {navGroups.map((group) => (
            <div key={group.title} className={styles.navGroup}>
              <p className={styles.navGroupTitle}>{group.title}</p>
              <div className={styles.navGroupItems}>
                {group.items.map((tabId) => {
                  const tab = tabs.find((item) => item.id === tabId)
                  if (!tab) return null
                  return <div key={tab.id} className={`${styles.navButton} ${styles.skeletonLine}`}><span className={styles.navIcon}>{tab.icon}</span><strong>{tab.label}</strong></div>
                })}
              </div>
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
          <div className={styles.topbarPill}><span className={styles.statusDot}></span>Supabase conectado</div>
        </header>
        <div className={styles.sectionStack}>
          <div className={styles.metricsGrid}>
            {Array.from({ length: 8 }).map((_, index) => <article key={index} className={`${styles.metricCard} ${styles.skeletonCard}`}><div className={styles.skeletonText}></div><div className={styles.skeletonNumber}></div><div className={styles.skeletonTextSmall}></div></article>)}
          </div>
          <div className={styles.dashboardGrid}>
            {Array.from({ length: 2 }).map((_, index) => <article key={index} className={`${styles.panel} ${styles.skeletonPanel}`}><div className={styles.skeletonTitle}></div><div className={styles.skeletonItem}></div><div className={styles.skeletonItem}></div><div className={styles.skeletonItem}></div></article>)}
          </div>
        </div>
      </section>
    </main>
  )
}

function MetricCard({ title, value, detail, tone = "neutral" }: { title: string; value: string | number; detail: string; tone?: MetricTone }) {
  const toneClass = {
    success: styles.metricSuccess,
    warning: styles.metricWarning,
    danger: styles.metricDanger,
    info: styles.metricInfo,
    neutral: "",
  }[tone]

  return (
    <article className={`${styles.metricCard} ${toneClass}`}>
      <p>{title}</p>
      <strong>{value}</strong>
      <span>{detail}</span>
    </article>
  )
}

function StatusBadge({ estado }: { estado: string }) {
  const normalized = normalizarTexto(estado)
  return (
    <span className={`${styles.statusBadge} ${
      normalized === "completado" || normalized === "aprobado" || normalized === "activo"
        ? styles.statusSuccess
        : normalized === "cancelado" || normalized === "rechazado" || normalized === "inactivo"
        ? styles.statusDanger
        : styles.statusWarning
    }`}>
      {estado}
    </span>
  )
}

function PriorityItem({ label, value, tone }: { label: string; value: number; tone: "success" | "warning" | "danger" | "info" }) {
  const toneClass = {
    success: styles.prioritySuccess,
    warning: styles.priorityWarning,
    danger: styles.priorityDanger,
    info: styles.priorityInfo,
  }[tone]

  return (
    <div className={`${styles.priorityItem} ${toneClass}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function ChartBar({ label, value, total }: { label: string; value: number; total: number }) {
  const width = value <= 0 ? 0 : Math.max(5, Math.round((value / total) * 100))
  return (
    <div className={styles.chartRow}>
      <div className={styles.chartTopline}>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <div className={styles.chartTrack}>
        <div className={styles.chartFill} style={{ width: `${width}%` }}></div>
      </div>
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

type PlaceholderPanelProps = { title: string; text: string; buttonText: string }

function PlaceholderPanel({ title, text, buttonText }: PlaceholderPanelProps) {
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
