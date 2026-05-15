"use client"

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
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
  pais?: string | null
  codigo_pais?: string | null
  celular?: string | null
  celular_completo?: string | null
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
  usuario_id?: string | null
  total: number
  estado: string
  metodo_pago: string
  created_at: string
  comprobante_url?: string | null
  comprobante?: string | null
  captura_pago?: string | null
  voucher_url?: string | null
  producto_nombre?: string | null
  cantidad?: number | null
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

type Credito = {
  id: string
  usuario_id: string
  saldo: number
  estado: string
  created_at?: string | null
}

type CuentaProducto = {
  id: string
  producto_id: string
  correo: string
  clave: string
  fecha_inicio?: string | null
  fecha_fin?: string | null
  cliente_inicio?: string | null
  cliente_fin?: string | null
  estado: string
  pedido_id?: string | null
  usuario_id?: string | null
  notas?: string | null
  created_at?: string | null
}

type ComprobanteUnificado = {
  id: string
  pedidoId?: string | null
  cliente: string
  correo: string
  monto: number
  metodo: string
  estado: string
  url: string | null
  fecha?: string | null
  origen: "tabla" | "pedido"
}

type MetricTone = "success" | "warning" | "danger" | "info" | "neutral"

type OrdenProducto = "recientes" | "nombre" | "precio_mayor" | "precio_menor" | "stock_menor"
type OrdenPedido = "recientes" | "monto_mayor" | "monto_menor"

type ConfirmacionAdmin = {
  abierta: boolean
  titulo: string
  descripcion: string
  textoConfirmar: string
  tono: "danger" | "success" | "warning"
  onConfirmar: (() => Promise<void> | void) | null
}


const USD_RATE = 3.75

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

const crearCuentaInicial = () => ({
  producto_id: "",
  correo: "",
  clave: "",
  fecha_inicio: fechaISO(),
  fecha_fin: sumarDiasISO(30),
  estado: "disponible",
  notas: "",
})

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: "▣" },
  { id: "productos", label: "Productos", icon: "◈" },
  { id: "pedidos", label: "Pedidos", icon: "◉" },
  { id: "usuarios", label: "Usuarios", icon: "◎" },
  { id: "comprobantes", label: "Comprobantes", icon: "▤" },
  { id: "inventario", label: "Inventario", icon: "▦" },
  { id: "cuentas", label: "Cuentas", icon: "▧" },
  { id: "creditos", label: "Créditos", icon: "✦" },
  { id: "historial", label: "Historial", icon: "◷" },
  { id: "configuracion", label: "Configuración", icon: "⚙" },
] as const

type TabId = (typeof tabs)[number]["id"]


const navGroups: { title: string; items: TabId[] }[] = [
  { title: "Inicio", items: ["dashboard"] },
  { title: "Operación", items: ["pedidos", "comprobantes", "inventario"] },
  { title: "Gestión", items: ["productos", "cuentas", "usuarios", "creditos"] },
  { title: "Sistema", items: ["historial", "configuracion"] },
]

const estadosPedido = ["todos", "pendiente", "completado", "cancelado"]
const estadosUsuario = ["todos", "pendiente", "aprobado", "rechazado"]
const rolesUsuario = ["todos", "cliente", "proveedor", "admin"]
const etiquetasGoogleContactos = ["| ADMIN |", "| CV |", "| JS |", "| RATAS |", "| SE |", "| SR |", "| SV |"]

const normalizarTexto = (valor?: string | number | null) => String(valor ?? "").trim().toLowerCase()
const limpiarNumeroContacto = (valor?: string | null) => String(valor ?? "").replace(/[^\d]/g, "")
const separarNombreContacto = (nombreCompleto?: string | null) => {
  const partes = String(nombreCompleto ?? "").trim().split(/\s+/).filter(Boolean)
  return {
    nombre: partes[0] || "",
    segundoNombre: partes.slice(1).join(" "),
  }
}
const escaparCSV = (valor?: string | number | null) => {
  const texto = String(valor ?? "")
  return `"${texto.replace(/"/g, '""')}"`
}
const descargarArchivoTexto = (nombreArchivo: string, contenido: string, tipo = "text/csv;charset=utf-8;") => {
  const blob = new Blob([contenido], { type: tipo })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = nombreArchivo
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
const formatearSoles = (valor: number) => `S/ ${Number(valor || 0).toFixed(2)}`
const fechaLegible = (fecha?: string | null) => {
  if (!fecha) return "Sin fecha"
  const date = new Date(fecha)
  if (Number.isNaN(date.getTime())) return "Sin fecha"
  return date.toLocaleString("es-PE", { dateStyle: "medium", timeStyle: "short" })
}
const fechaISO = (fecha = new Date()) => fecha.toISOString().slice(0, 10)
const sumarDiasISO = (dias: number, base = new Date()) => {
  const fecha = new Date(base)
  fecha.setDate(fecha.getDate() + dias)
  return fechaISO(fecha)
}
const fechaCorta = (fecha?: string | null) => {
  if (!fecha) return "Sin fecha"
  const date = new Date(`${fecha}T00:00:00`)
  if (Number.isNaN(date.getTime())) return "Sin fecha"
  return date.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" })
}
const diasRestantes = (fecha?: string | null) => {
  if (!fecha) return null
  const fin = new Date(`${fecha}T00:00:00`)
  if (Number.isNaN(fin.getTime())) return null
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  fin.setHours(0, 0, 0, 0)
  return Math.ceil((fin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
}
const obtenerEstadoStockVisual = (stockValor: number) => {
  const stock = Math.max(0, Number(stockValor || 0))

  if (stock <= 0) {
    return { label: "AGOTADO", detalle: "Consultar reposición", tono: "danger" as const }
  }

  if (stock <= 3) {
    return { label: "LIMITADO", detalle: "Últimas unidades", tono: "warning" as const }
  }

  return { label: "ACTIVO", detalle: "Stock disponible", tono: "success" as const }
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

  const [autorizado, setAutorizado] = useState(false)
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const usuarioRef = useRef<Usuario | null>(null)
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [comprobantes, setComprobantes] = useState<Comprobante[]>([])
  const [logs, setLogs] = useState<AdminLog[]>([])
  const [creditos, setCreditos] = useState<Credito[]>([])
  const [cuentasProducto, setCuentasProducto] = useState<CuentaProducto[]>([])
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
  const [etiquetaGoogleContactos, setEtiquetaGoogleContactos] = useState("| SV |")
  const [ordenGoogleContactos, setOrdenGoogleContactos] = useState("409")

  const [busquedaComprobante, setBusquedaComprobante] = useState("")
  const [filtroEstadoComprobante, setFiltroEstadoComprobante] = useState("todos")
  const [vistaComprobantes, setVistaComprobantes] = useState<"revision" | "tabla">("tabla")
  const [comprobantePreview, setComprobantePreview] = useState<ComprobanteUnificado | null>(null)
  const [pedidoAEliminar, setPedidoAEliminar] = useState<Pedido | null>(null)

  const [busquedaHistorial, setBusquedaHistorial] = useState("")
  const [filtroEntidadLog, setFiltroEntidadLog] = useState("todos")

  const [busquedaCredito, setBusquedaCredito] = useState("")
  const [filtroEstadoCredito, setFiltroEstadoCredito] = useState("todos")
  const [formCredito, setFormCredito] = useState({ usuario_id: "", saldo: "", estado: "activo" })
  const [editandoCreditoId, setEditandoCreditoId] = useState<string | null>(null)
  const [guardandoCredito, setGuardandoCredito] = useState(false)

  const [busquedaCuenta, setBusquedaCuenta] = useState("")
  const [filtroEstadoCuenta, setFiltroEstadoCuenta] = useState("todos")
  const [productoCuentasActivoId, setProductoCuentasActivoId] = useState<string | null>(null)
  const [formCuenta, setFormCuenta] = useState(crearCuentaInicial)
  const [editandoCuentaId, setEditandoCuentaId] = useState<string | null>(null)
  const [guardandoCuenta, setGuardandoCuenta] = useState(false)
  const [textoImportacionCuentas, setTextoImportacionCuentas] = useState("")
  const [importandoCuentas, setImportandoCuentas] = useState(false)
  const [archivoImportacionNombre, setArchivoImportacionNombre] = useState("")
  const inputImportarCuentasRef = useRef<HTMLInputElement | null>(null)

  const [configId, setConfigId] = useState<string | null>(null)
  const [formConfig, setFormConfig] = useState(configuracionInicial)
  const [guardandoConfig, setGuardandoConfig] = useState(false)

  const [imagenFile, setImagenFile] = useState<File | null>(null)
  const [imagenPreviewUrl, setImagenPreviewUrl] = useState<string | null>(null)
  const [subiendoImagen, setSubiendoImagen] = useState(false)
  const [guardandoProducto, setGuardandoProducto] = useState(false)
  const [comprobantesDisponibles, setComprobantesDisponibles] = useState(true)
  const [sincronizandoInventario, setSincronizandoInventario] = useState(false)
  const [busquedaInventario, setBusquedaInventario] = useState("")
  const [filtroInventario, setFiltroInventario] = useState<"todos" | "critico" | "agotado" | "bajo" | "estable">("critico")

  const [confirmacionAdmin, setConfirmacionAdmin] = useState<ConfirmacionAdmin>({
    abierta: false,
    titulo: "",
    descripcion: "",
    textoConfirmar: "Confirmar",
    tono: "danger",
    onConfirmar: null,
  })

  const cerrarConfirmacionAdmin = () => {
    setConfirmacionAdmin({
      abierta: false,
      titulo: "",
      descripcion: "",
      textoConfirmar: "Confirmar",
      tono: "danger",
      onConfirmar: null,
    })
  }

  const abrirConfirmacionAdmin = (config: Omit<ConfirmacionAdmin, "abierta">) => {
    setConfirmacionAdmin({
      abierta: true,
      ...config,
    })
  }

  const ejecutarConfirmacionAdmin = async () => {
    const accion = confirmacionAdmin.onConfirmar
    cerrarConfirmacionAdmin()
    if (accion) await accion()
  }


  useEffect(() => {
    if (!imagenFile) {
      setImagenPreviewUrl(null)
      return
    }

    const objectUrl = URL.createObjectURL(imagenFile)
    setImagenPreviewUrl(objectUrl)

    return () => URL.revokeObjectURL(objectUrl)
  }, [imagenFile])


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

    const [usuariosResult, productosResult, pedidosResult, logsResult, configResult, comprobantesResult, creditosResult, cuentasResult] = await Promise.all([
      esProveedorActual && adminActual?.id ? usuariosQuery.eq("id", adminActual.id) : usuariosQuery,
      productosQuery,
      pedidosQuery,
      supabase.from("admin_logs").select("*").order("created_at", { ascending: false }).limit(80),
      supabase.from("configuracion_tienda").select("*").order("created_at", { ascending: false }).limit(1),
      supabase.from("comprobantes").select("*").order("created_at", { ascending: false }).limit(80),
      supabase.from("creditos").select("*").order("created_at", { ascending: false }).limit(120),
      supabase.from("cuentas_producto").select("*").order("created_at", { ascending: false }).limit(300),
    ])

    if (usuariosResult.data) setUsuarios(usuariosResult.data as Usuario[])
    if (productosResult.data) setProductos(productosResult.data as Producto[])
    if (pedidosResult.data) setPedidos(pedidosResult.data as Pedido[])
    if (logsResult.data) setLogs(logsResult.data as AdminLog[])
    if (!creditosResult.error && creditosResult.data) setCreditos(creditosResult.data as Credito[])
    if (!cuentasResult.error && cuentasResult.data) setCuentasProducto(cuentasResult.data as CuentaProducto[])

    if (comprobantesResult.error) {
      setComprobantesDisponibles(false)
      setComprobantes([])
    } else {
      setComprobantesDisponibles(true)
      setComprobantes((comprobantesResult.data || []) as Comprobante[])
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
    const validarAdmin = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error || !user) {
        router.replace("/login")
        return
      }

      const { data: usuario, error: errorUsuario } = await supabase
        .from("usuarios")
        .select("id,nombre,correo,rol,estado,pais,codigo_pais,celular,celular_completo")
        .eq("id", user.id)
        .single()

      if (
        errorUsuario ||
        !usuario ||
        usuario.rol !== "admin" ||
        (usuario.estado !== "aprobado" &&
          usuario.estado !== "activo")
      ) {
        await supabase.auth.signOut()
        router.replace("/login")
        return
      }

      const usuarioParseado = usuario as Usuario

      usuarioRef.current = usuarioParseado
      setUsuario(usuarioParseado)
      setAutorizado(true)
      await cargarDatos(usuarioParseado, true)
    }

    validarAdmin()
  }, [router, cargarDatos])

  useEffect(() => {
    if (!autorizado) return

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
      .on("postgres_changes", { event: "*", schema: "public", table: "usuarios" }, () => {
        registrarEvento("Cambio detectado en usuarios")
        cargarDatos()
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "admin_logs" }, () => {
        registrarEvento("Nuevo registro en historial")
        cargarDatos()
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "creditos" }, () => {
        registrarEvento("Movimiento detectado en créditos")
        cargarDatos()
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "cuentas_producto" }, () => {
        registrarEvento("Cambio detectado en cuentas")
        cargarDatos()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(canal)
    }
  }, [autorizado, cargarDatos, registrarEvento])

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

  const eliminarUsuario = (id: string) => {
    const usuarioObjetivo = usuarios.find((u) => u.id === id)

    abrirConfirmacionAdmin({
      titulo: `Eliminar usuario${usuarioObjetivo?.nombre ? ` ${usuarioObjetivo.nombre}` : ""}`,
      descripcion: "Esta acción eliminará el usuario del panel. No se puede deshacer.",
      textoConfirmar: "Sí, eliminar usuario",
      tono: "danger",
      onConfirmar: async () => {
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
      },
    })
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
    const normalizarProductoPedido = (valor?: unknown) => normalizarTexto(String(valor ?? ""))

    const buscarProductoPorDatos = (datos: Record<string, unknown>) => {
      const productoId = String(datos.producto_id ?? datos.product_id ?? datos.id_producto ?? "")

      if (productoId) {
        const porId = productos.find((producto) => producto.id === productoId)
        if (porId) return porId
      }

      const nombrePedido = normalizarProductoPedido(
        datos.producto_nombre ??
        datos.nombre_producto ??
        datos.nombre ??
        datos.producto ??
        pedido.producto_nombre
      )

      if (!nombrePedido) return null

      return productos.find((producto) => {
        const productoNombre = normalizarTexto(producto.nombre)
        return (
          productoNombre === nombrePedido ||
          productoNombre.includes(nombrePedido) ||
          nombrePedido.includes(productoNombre)
        )
      }) || null
    }

    const entregas = new Map<string, { producto: Producto; cantidad: number }>()

    const sumarEntrega = (producto: Producto | null, cantidad: number) => {
      if (!producto) return

      const cantidadSegura = Math.max(1, Math.floor(Number(cantidad || 1)))
      const actual = entregas.get(producto.id)

      entregas.set(producto.id, {
        producto,
        cantidad: (actual?.cantidad || 0) + cantidadSegura,
      })
    }

    const { data: itemsPedido, error: itemsError } = await supabase
      .from("pedido_items")
      .select("*")
      .eq("pedido_id", pedido.id)

    if (!itemsError && itemsPedido && itemsPedido.length > 0) {
      ;(itemsPedido as Record<string, unknown>[]).forEach((item) => {
        const productoItem = buscarProductoPorDatos(item)
        const cantidadItem = Number(item.cantidad ?? item.quantity ?? item.unidades ?? 1)
        sumarEntrega(productoItem, cantidadItem)
      })
    }

    if (entregas.size === 0) {
      if (!pedido.producto_nombre) {
        await registrarLog(
          "cuenta_no_encontrada",
          "pedidos",
          pedido.id,
          "No se encontró producto_nombre ni items del pedido para entregar cuenta"
        )
        toast.error("No encontré producto vinculado para entregar cuenta")
        return false
      }

      const productoPedido = buscarProductoPorDatos({
        producto_nombre: pedido.producto_nombre,
      })

      sumarEntrega(productoPedido, Number(pedido.cantidad || 1))
    }

    if (entregas.size === 0) {
      await registrarLog(
        "cuenta_no_encontrada",
        "pedidos",
        pedido.id,
        `No se encontró producto para entregar cuenta: ${pedido.producto_nombre || "pedido_items sin producto coincidente"}`
      )
      toast.error("No se encontró producto para entregar cuenta")
      return false
    }

    const usuarioAsignado =
      pedido.usuario_id ||
      usuarios.find((item) => normalizarTexto(item.correo) === normalizarTexto(pedido.cliente_correo))?.id ||
      null

    const cuentasParaEntregar: CuentaProducto[] = []

    for (const { producto, cantidad } of entregas.values()) {
      const { data: cuentasDisponibles, error: cuentasError } = await supabase
        .from("cuentas_producto")
        .select("*")
        .eq("producto_id", producto.id)
        .eq("estado", "disponible")
        .order("created_at", { ascending: true })
        .limit(cantidad)

      if (cuentasError) {
        await registrarLog(
          "cuenta_error",
          "cuentas_producto",
          producto.id,
          `Pedido #${pedido.id.slice(0, 8)} no pudo consultar cuentas disponibles: ${cuentasError.message}`
        )
        toast.error(`No pude consultar cuentas disponibles para ${producto.nombre}`)
        return false
      }

      const disponibles = (cuentasDisponibles || []) as CuentaProducto[]

      if (disponibles.length < cantidad) {
        await registrarLog(
          "cuenta_stock_insuficiente",
          "cuentas_producto",
          producto.id,
          `Pedido #${pedido.id.slice(0, 8)} requiere ${cantidad} cuenta(s), disponibles ${disponibles.length}`
        )
        toast.error(`${producto.nombre} no tiene cuentas suficientes disponibles`)
        return false
      }

      cuentasParaEntregar.push(...disponibles)
    }

    if (cuentasParaEntregar.length === 0) {
      toast.error("No hay cuentas disponibles para entregar")
      return false
    }

    const idsCuentas = cuentasParaEntregar.map((cuenta) => cuenta.id)
    const clienteInicio = fechaISO()
    const clienteFin = sumarDiasISO(30)

    const { error: entregaError } = await supabase
      .from("cuentas_producto")
      .update({
        estado: "entregada",
        pedido_id: pedido.id,
        usuario_id: usuarioAsignado,
        cliente_inicio: clienteInicio,
        cliente_fin: clienteFin,
      })
      .in("id", idsCuentas)

    if (entregaError) {
      await registrarLog(
        "cuenta_entrega_error",
        "cuentas_producto",
        pedido.id,
        `No se pudieron marcar cuentas como entregadas: ${entregaError.message}`
      )
      toast.error("No se pudieron asignar las cuentas al pedido")
      return false
    }

    setCuentasProducto((prev) =>
      prev.map((cuenta) =>
        idsCuentas.includes(cuenta.id)
          ? {
              ...cuenta,
              estado: "entregada",
              pedido_id: pedido.id,
              usuario_id: usuarioAsignado,
              cliente_inicio: clienteInicio,
              cliente_fin: clienteFin,
            }
          : cuenta
      )
    )

    for (const { producto, cantidad } of entregas.values()) {
      await registrarLog(
        "entregar_cuenta",
        "cuentas_producto",
        producto.id,
        `Pedido #${pedido.id.slice(0, 8)} entregó ${cantidad} cuenta(s) de ${producto.nombre}`
      )
      registrarEvento(`Cuenta entregada: ${producto.nombre}`)
    }

    toast.success(
      cuentasParaEntregar.length === 1
        ? "Cuenta asignada correctamente"
        : `${cuentasParaEntregar.length} cuentas asignadas correctamente`
    )

    return true
  }

  const actualizarEstadoPedido = async (id: string, nuevoEstado: string) => {
    const pedidoActual = pedidos.find((pedido) => pedido.id === id)
    const debeEntregarCuenta = nuevoEstado === "completado" && pedidoActual?.estado !== "completado"

    if (debeEntregarCuenta && pedidoActual) {
      const cuentaEntregada = await descontarStockPorPedido(pedidoActual)
      if (!cuentaEntregada) return
    }

    const { error } = await supabase.from("pedidos").update({ estado: nuevoEstado }).eq("id", id)

    if (!error) {
      setPedidos((prev) => prev.map((p) => (p.id === id ? { ...p, estado: nuevoEstado } : p)))
      registrarEvento(`Pedido marcado como ${nuevoEstado}`, nuevoEstado === "completado")
      await registrarLog("actualizar_estado", "pedidos", id, `Estado: ${nuevoEstado}`)
      toast.success(debeEntregarCuenta ? `Pedido completado y cuenta asignada` : `Pedido actualizado a ${nuevoEstado}`)
      await cargarDatos()
    } else {
      toast.error("No se pudo actualizar el pedido")
    }
  }

  const eliminarPedido = async (id: string) => {
    const pedidoObjetivo = pedidos.find((pedido) => pedido.id === id)
    if (!pedidoObjetivo) {
      toast.error("No encontré el pedido para eliminar")
      return
    }

    setPedidoAEliminar(pedidoObjetivo)
  }

  const ejecutarEliminarPedido = async () => {
    if (!pedidoAEliminar) return

    const id = pedidoAEliminar.id
    const pedidoObjetivo = pedidoAEliminar
    setPedidoAEliminar(null)

    const { error: itemsError } = await supabase.from("pedido_items").delete().eq("pedido_id", id)

    if (itemsError) {
      toast.error("No se pudieron eliminar los items del pedido")
      return
    }

    const { error: comprobantesError } = await supabase.from("comprobantes").delete().eq("pedido_id", id)

    if (comprobantesError) {
      toast.error("No se pudieron eliminar los comprobantes del pedido")
      return
    }

    const { error: pedidoError } = await supabase.from("pedidos").delete().eq("id", id)

    if (pedidoError) {
      toast.error("No se pudo eliminar el pedido")
      return
    }

    setPedidos((prev) => prev.filter((pedido) => pedido.id !== id))
    setComprobantes((prev) => prev.filter((comprobante) => comprobante.pedido_id !== id))
    setPedidosSeleccionados((prev) => prev.filter((pedidoId) => pedidoId !== id))

    registrarEvento(`Pedido #${id.slice(0, 8)} eliminado`)
    await registrarLog("eliminar", "pedidos", id, `Pedido eliminado${pedidoObjetivo?.cliente_nombre ? ` · ${pedidoObjetivo.cliente_nombre}` : ""}`)
    toast.success("Pedido eliminado")
    await cargarDatos()
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

    abrirConfirmacionAdmin({
      titulo: nuevoEstado === "completado" ? "Completar lote de pedidos" : "Cancelar lote de pedidos",
      descripcion: `Se actualizarán ${pedidosSeleccionados.length} pedido(s) a estado ${nuevoEstado}.`,
      textoConfirmar: nuevoEstado === "completado" ? "Sí, completar lote" : "Sí, cancelar lote",
      tono: nuevoEstado === "completado" ? "success" : "danger",
      onConfirmar: async () => {
        setProcesandoMasivo(true)
        const ids = [...pedidosSeleccionados]

        if (nuevoEstado === "completado") {
          const pedidosParaEntregar = pedidos.filter((pedido) => ids.includes(pedido.id) && pedido.estado !== "completado")

          for (const pedido of pedidosParaEntregar) {
            const cuentaEntregada = await descontarStockPorPedido(pedido)

            if (!cuentaEntregada) {
              setProcesandoMasivo(false)
              return
            }
          }
        }

        const { error } = await supabase.from("pedidos").update({ estado: nuevoEstado }).in("id", ids)

        if (error) {
          toast.error("No se pudieron actualizar los pedidos seleccionados")
          setProcesandoMasivo(false)
          return
        }

        setPedidos((prev) => prev.map((pedido) => ids.includes(pedido.id) ? { ...pedido, estado: nuevoEstado } : pedido))
        setPedidosSeleccionados([])
        registrarEvento(`${ids.length} pedido(s) actualizados a ${nuevoEstado}`, nuevoEstado === "completado")
        await registrarLog("actualizar_masivo", "pedidos", undefined, `${ids.length} pedidos a ${nuevoEstado}`)
        toast.success(nuevoEstado === "completado" ? `${ids.length} pedido(s) completados y cuentas asignadas` : `${ids.length} pedido(s) actualizados`)
        setProcesandoMasivo(false)
        await cargarDatos()
      },
    })
  }

  const eliminarPedidosSeleccionados = async () => {
    if (pedidosSeleccionados.length === 0) {
      toast.error("Selecciona al menos un pedido")
      return
    }

    abrirConfirmacionAdmin({
      titulo: "Eliminar pedidos seleccionados",
      descripcion: `Se eliminarán ${pedidosSeleccionados.length} pedido(s), sus items y comprobantes vinculados. Esta acción no se puede deshacer.`,
      textoConfirmar: "Sí, eliminar lote",
      tono: "danger",
      onConfirmar: async () => {
        setProcesandoMasivo(true)
        const ids = [...pedidosSeleccionados]

        const { error: itemsError } = await supabase.from("pedido_items").delete().in("pedido_id", ids)

        if (itemsError) {
          toast.error("No se pudieron eliminar los items de los pedidos")
          setProcesandoMasivo(false)
          return
        }

        const { error: comprobantesError } = await supabase.from("comprobantes").delete().in("pedido_id", ids)

        if (comprobantesError) {
          toast.error("No se pudieron eliminar los comprobantes")
          setProcesandoMasivo(false)
          return
        }

        const { error: pedidosError } = await supabase.from("pedidos").delete().in("id", ids)

        if (pedidosError) {
          toast.error("No se pudieron eliminar los pedidos seleccionados")
          setProcesandoMasivo(false)
          return
        }

        setPedidos((prev) => prev.filter((pedido) => !ids.includes(pedido.id)))
        setComprobantes((prev) => prev.filter((comprobante) => !ids.includes(comprobante.pedido_id || "")))
        setPedidosSeleccionados([])

        registrarEvento(`${ids.length} pedido(s) eliminados`)
        await registrarLog("eliminar_masivo", "pedidos", undefined, `${ids.length} pedidos eliminados`)
        toast.success(`${ids.length} pedido(s) eliminados`)
        setProcesandoMasivo(false)
        await cargarDatos()
      },
    })
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

    abrirConfirmacionAdmin({
      titulo: "Sincronizar inventario automático",
      descripcion: `Se marcarán ${agotados.length} producto(s) como AGOTADO y ${bajos.length} como LIMITADO. Los agotados se ocultarán de tienda.`,
      textoConfirmar: "Sí, sincronizar",
      tono: "warning",
      onConfirmar: async () => {
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
      },
    })
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

    const pedidoActualComprobante = comprobante.pedidoId
      ? pedidos.find((pedido) => pedido.id === comprobante.pedidoId)
      : null
    const debeEntregarCuenta =
      estadoPedido === "completado" &&
      pedidoActualComprobante?.estado !== "completado"

    if (debeEntregarCuenta && pedidoActualComprobante) {
      const cuentaEntregada = await descontarStockPorPedido(pedidoActualComprobante)
      if (!cuentaEntregada) return
    }

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
    toast.success(
      nuevoEstado === "aprobado" || nuevoEstado === "completado"
        ? "Comprobante aprobado y cuenta asignada"
        : `Comprobante ${nuevoEstado}`
    )
    await cargarDatos()
  }


  const exportarUsuariosGoogleContacts = (usuariosAExportar: Usuario[]) => {
    if (usuariosAExportar.length === 0) {
      toast.error("No hay usuarios para exportar")
      return
    }

    const inicio = Math.max(1, Number(ordenGoogleContactos || 1))
    const etiqueta = etiquetaGoogleContactos || "| SV |"

    const headers = [
      "Name Prefix",
      "Given Name",
      "Additional Name",
      "Family Name",
      "E-mail 1 - Value",
      "Phone 1 - Value",
      "Group Membership",
      "Notes",
    ]

    const filas = usuariosAExportar.map((usuarioExportar, index) => {
      const { nombre, segundoNombre } = separarNombreContacto(usuarioExportar.nombre)
      const telefono = limpiarNumeroContacto(usuarioExportar.celular_completo || `${usuarioExportar.codigo_pais || ""}${usuarioExportar.celular || ""}`)
      const numeroOrden = String(inicio + index)
      const notas = [
        "Jonas Stream",
        `Rol: ${usuarioExportar.rol || "cliente"}`,
        `Estado: ${usuarioExportar.estado || "pendiente"}`,
        usuarioExportar.pais ? `Pais: ${usuarioExportar.pais}` : "",
      ].filter(Boolean).join(" | ")

      return [
        numeroOrden,
        nombre,
        segundoNombre,
        "",
        usuarioExportar.correo || "",
        telefono,
        etiqueta,
        notas,
      ].map(escaparCSV).join(",")
    })

    const csv = "\uFEFF" + [headers.join(","), ...filas].join("\n")
    const fecha = fechaISO()
    descargarArchivoTexto(`google-contacts-jonas-stream-${etiqueta.replace(/[^a-zA-Z0-9]+/g, "-")}-${fecha}.csv`, csv)
    toast.success(`CSV listo para Google Contacts: ${usuariosAExportar.length} contacto(s)`)
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

  const eliminarProducto = (id: string) => {
    const productoObjetivo = productos.find((p) => p.id === id)

    abrirConfirmacionAdmin({
      titulo: `Eliminar producto${productoObjetivo?.nombre ? ` ${productoObjetivo.nombre}` : ""}`,
      descripcion: "Esta acción eliminará el producto del catálogo admin. No se puede deshacer.",
      textoConfirmar: "Sí, eliminar producto",
      tono: "danger",
      onConfirmar: async () => {
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
      },
    })
  }

  const handleCuentaChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    setFormCuenta((prev) => {
      if (name === "fecha_inicio") {
        const base = value ? new Date(`${value}T00:00:00`) : new Date()
        return {
          ...prev,
          fecha_inicio: value,
          fecha_fin: sumarDiasISO(30, base),
        }
      }

      return {
        ...prev,
        [name]: value,
      }
    })
  }

  const limpiarFormularioCuenta = () => {
    setFormCuenta(crearCuentaInicial())
    setEditandoCuentaId(null)
  }

  const guardarCuenta = async (e: FormEvent) => {
    e.preventDefault()

    if (!formCuenta.producto_id) {
      toast.error("Selecciona un producto")
      return
    }

    if (!formCuenta.correo.trim() || !formCuenta.clave.trim()) {
      toast.error("Completa correo y contraseña")
      return
    }

    setGuardandoCuenta(true)

    const payload = {
      producto_id: formCuenta.producto_id,
      correo: formCuenta.correo.trim(),
      clave: formCuenta.clave.trim(),
      fecha_inicio: formCuenta.fecha_inicio || fechaISO(),
      fecha_fin: formCuenta.fecha_fin || sumarDiasISO(30),
      estado: formCuenta.estado || "disponible",
      notas: formCuenta.notas.trim() || null,
    }

    if (editandoCuentaId) {
      const { error } = await supabase.from("cuentas_producto").update(payload).eq("id", editandoCuentaId)

      if (error) {
        toast.error("No se pudo actualizar la cuenta")
        setGuardandoCuenta(false)
        return
      }

      await registrarLog("actualizar", "cuentas_producto", editandoCuentaId, `Cuenta actualizada: ${payload.correo}`)
      toast.success("Cuenta actualizada")
    } else {
      const { data, error } = await supabase.from("cuentas_producto").insert([payload]).select("id")

      if (error) {
        toast.error("No se pudo guardar la cuenta")
        setGuardandoCuenta(false)
        return
      }

      await registrarLog("crear", "cuentas_producto", data?.[0]?.id, `Cuenta agregada: ${payload.correo}`)
      toast.success("Cuenta agregada")
    }

    limpiarFormularioCuenta()
    setGuardandoCuenta(false)
    await cargarDatos()
  }

  const editarCuenta = (cuenta: CuentaProducto) => {
    setEditandoCuentaId(cuenta.id)
    setFormCuenta({
      producto_id: cuenta.producto_id || "",
      correo: cuenta.correo || "",
      clave: cuenta.clave || "",
      fecha_inicio: cuenta.fecha_inicio || fechaISO(),
      fecha_fin: cuenta.fecha_fin || sumarDiasISO(30),
      estado: cuenta.estado || "disponible",
      notas: cuenta.notas || "",
    })
    setTabActiva("cuentas")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const eliminarCuenta = (cuenta: CuentaProducto) => {
    abrirConfirmacionAdmin({
      titulo: `Eliminar cuenta ${cuenta.correo}`,
      descripcion: "Esta cuenta completa saldrá del banco de cuentas. No se puede deshacer.",
      textoConfirmar: "Sí, eliminar cuenta",
      tono: "danger",
      onConfirmar: async () => {
        const { error } = await supabase.from("cuentas_producto").delete().eq("id", cuenta.id)

        if (error) {
          toast.error("No se pudo eliminar la cuenta")
          return
        }

        setCuentasProducto((prev) => prev.filter((item) => item.id !== cuenta.id))
        await registrarLog("eliminar", "cuentas_producto", cuenta.id, `Cuenta eliminada: ${cuenta.correo}`)
        toast.success("Cuenta eliminada")
        await cargarDatos()
      },
    })
  }

  const copiarDatosCuenta = async (cuenta: CuentaProducto) => {
    const producto = productos.find((item) => item.id === cuenta.producto_id)
    const texto = [
      `Producto: ${producto?.nombre || "Producto"}`,
      `Correo: ${cuenta.correo}`,
      `Contraseña: ${cuenta.clave}`,
      `Vence admin: ${fechaCorta(cuenta.fecha_fin)}`,
      `Vence cliente: ${fechaCorta(cuenta.cliente_fin || cuenta.fecha_fin)}`,
    ].join("\n")

    try {
      await navigator.clipboard.writeText(texto)
      toast.success("Datos copiados")
    } catch {
      toast.error("No se pudo copiar")
    }
  }

  const renovarCuentaCliente = (cuenta: CuentaProducto) => {
    const usuarioCuenta = cuenta.usuario_id ? obtenerUsuarioPorId(cuenta.usuario_id) : null
    const baseActual = cuenta.cliente_fin ? new Date(`${cuenta.cliente_fin}T00:00:00`) : new Date()
    const hoyBase = new Date()
    hoyBase.setHours(0, 0, 0, 0)
    const baseRenovacion = !Number.isNaN(baseActual.getTime()) && baseActual > hoyBase ? baseActual : hoyBase
    const nuevaFechaFin = sumarDiasISO(30, baseRenovacion)
    const clienteInicio = cuenta.cliente_inicio || fechaISO()

    abrirConfirmacionAdmin({
      titulo: `Renovar cuenta ${cuenta.correo}`,
      descripcion: `Se extenderá el acceso del cliente ${usuarioCuenta?.correo || "asignado"} hasta ${fechaCorta(nuevaFechaFin)}.`,
      textoConfirmar: "Sí, renovar +30 días",
      tono: "success",
      onConfirmar: async () => {
        const payload = {
          estado: "entregada",
          cliente_inicio: clienteInicio,
          cliente_fin: nuevaFechaFin,
        }

        const { error } = await supabase.from("cuentas_producto").update(payload).eq("id", cuenta.id)

        if (error) {
          toast.error("No se pudo renovar la cuenta")
          return
        }

        setCuentasProducto((prev) => prev.map((item) => (item.id === cuenta.id ? { ...item, ...payload } : item)))
        await registrarLog("renovar", "cuentas_producto", cuenta.id, `Cuenta renovada hasta ${nuevaFechaFin}`)
        registrarEvento(`Cuenta renovada: ${cuenta.correo}`)
        toast.success("Cuenta renovada +30 días")
        await cargarDatos()
      },
    })
  }

  const quitarAccesoCuenta = (cuenta: CuentaProducto) => {
    const usuarioCuenta = cuenta.usuario_id ? obtenerUsuarioPorId(cuenta.usuario_id) : null

    abrirConfirmacionAdmin({
      titulo: `Quitar acceso a ${cuenta.correo}`,
      descripcion: `Se liberará la cuenta, se quitará el cliente ${usuarioCuenta?.correo || "asignado"}, el pedido y la vigencia del cliente. Volverá al stock disponible.`,
      textoConfirmar: "Sí, quitar acceso",
      tono: "warning",
      onConfirmar: async () => {
        const payload = {
          estado: "disponible",
          pedido_id: null,
          usuario_id: null,
          cliente_inicio: null,
          cliente_fin: null,
        }

        const { error } = await supabase.from("cuentas_producto").update(payload).eq("id", cuenta.id)

        if (error) {
          toast.error("No se pudo quitar el acceso")
          return
        }

        setCuentasProducto((prev) => prev.map((item) => (item.id === cuenta.id ? { ...item, ...payload } : item)))
        await registrarLog("quitar_acceso", "cuentas_producto", cuenta.id, `Acceso liberado para ${cuenta.correo}`)
        registrarEvento(`Acceso quitado: ${cuenta.correo}`)
        toast.success("Acceso quitado y cuenta disponible")
        await cargarDatos()
      },
    })
  }

  const cambiarEstadoCuentaOperativa = (cuenta: CuentaProducto, nuevoEstado: "disponible" | "bloqueada" | "vencida") => {
    const accion = nuevoEstado === "disponible" ? "liberar" : nuevoEstado === "bloqueada" ? "bloquear" : "marcar vencida"

    abrirConfirmacionAdmin({
      titulo: `${accion.charAt(0).toUpperCase()}${accion.slice(1)} cuenta ${cuenta.correo}`,
      descripcion: nuevoEstado === "disponible"
        ? "La cuenta quedará disponible para venta automática y volverá al stock."
        : "La cuenta saldrá del stock disponible y no se entregará automáticamente.",
      textoConfirmar: `Sí, ${accion}`,
      tono: nuevoEstado === "disponible" ? "success" : "danger",
      onConfirmar: async () => {
        const payload = nuevoEstado === "disponible"
          ? { estado: "disponible", pedido_id: null, usuario_id: null, cliente_inicio: null, cliente_fin: null }
          : { estado: nuevoEstado }

        const { error } = await supabase.from("cuentas_producto").update(payload).eq("id", cuenta.id)

        if (error) {
          toast.error("No se pudo actualizar la cuenta")
          return
        }

        setCuentasProducto((prev) => prev.map((item) => (item.id === cuenta.id ? { ...item, ...payload } : item)))
        await registrarLog(accion.replace(" ", "_"), "cuentas_producto", cuenta.id, `Estado cuenta: ${nuevoEstado}`)
        registrarEvento(`Cuenta ${nuevoEstado}: ${cuenta.correo}`)
        toast.success(`Cuenta ${nuevoEstado}`)
        await cargarDatos()
      },
    })
  }

  const handleCreditoChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormCredito((prev) => ({ ...prev, [name]: value }))
  }

  const limpiarFormularioCredito = () => {
    setFormCredito({ usuario_id: "", saldo: "", estado: "activo" })
    setEditandoCreditoId(null)
  }

  const guardarCredito = async (e: FormEvent) => {
    e.preventDefault()

    const saldo = Number(formCredito.saldo)

    if (!formCredito.usuario_id) {
      toast.error("Selecciona un usuario")
      return
    }

    if (Number.isNaN(saldo) || saldo < 0) {
      toast.error("El saldo debe ser un número válido")
      return
    }

    setGuardandoCredito(true)

    const payload = {
      usuario_id: formCredito.usuario_id,
      saldo,
      estado: formCredito.estado || "activo",
    }

    if (editandoCreditoId) {
      const { error } = await supabase.from("creditos").update(payload).eq("id", editandoCreditoId)

      if (error) {
        toast.error("No se pudo actualizar el crédito")
        setGuardandoCredito(false)
        return
      }

      await registrarLog("actualizar", "creditos", editandoCreditoId, `Saldo: ${formatearSoles(saldo)} · Estado: ${payload.estado}`)
      toast.success("Crédito actualizado")
    } else {
      const { data, error } = await supabase.from("creditos").insert([payload]).select("id")

      if (error) {
        toast.error("No se pudo crear el crédito")
        setGuardandoCredito(false)
        return
      }

      await registrarLog("crear", "creditos", data?.[0]?.id, `Saldo inicial: ${formatearSoles(saldo)}`)
      toast.success("Crédito creado")
    }

    limpiarFormularioCredito()
    setGuardandoCredito(false)
    await cargarDatos()
  }

  const editarCredito = (credito: Credito) => {
    setEditandoCreditoId(credito.id)
    setFormCredito({
      usuario_id: credito.usuario_id,
      saldo: String(credito.saldo ?? 0),
      estado: credito.estado || "activo",
    })
    setTabActiva("creditos")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const eliminarCredito = (credito: Credito) => {
    abrirConfirmacionAdmin({
      titulo: `Eliminar crédito #${credito.id.slice(0, 8)}`,
      descripcion: `Se eliminará el registro financiero con saldo ${formatearSoles(Number(credito.saldo || 0))}. Esta acción no se puede deshacer.`,
      textoConfirmar: "Sí, eliminar crédito",
      tono: "danger",
      onConfirmar: async () => {
        const { error } = await supabase.from("creditos").delete().eq("id", credito.id)

        if (error) {
          toast.error("No se pudo eliminar el crédito")
          return
        }

        setCreditos((prev) => prev.filter((item) => item.id !== credito.id))
        await registrarLog("eliminar", "creditos", credito.id, `Crédito eliminado: ${formatearSoles(Number(credito.saldo || 0))}`)
        toast.success("Crédito eliminado")
        await cargarDatos()
      },
    })
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

  const obtenerComprobanteDePedido = useCallback((pedido: Pedido): ComprobanteUnificado | null => {
    const comprobanteTabla = comprobantes.find((item) => item.pedido_id === pedido.id)

    if (comprobanteTabla) {
      const url = obtenerComprobanteUrl(comprobanteTabla)
      if (!url) return null

      return {
        id: comprobanteTabla.id,
        pedidoId: pedido.id,
        cliente: comprobanteTabla.cliente_nombre || pedido.cliente_nombre || comprobanteTabla.cliente_correo || "Cliente sin nombre",
        correo: comprobanteTabla.cliente_correo || pedido.cliente_correo || "",
        monto: Number(comprobanteTabla.monto ?? pedido.total ?? 0),
        metodo: comprobanteTabla.metodo_pago || pedido.metodo_pago || "No definido",
        estado: comprobanteTabla.estado || pedido.estado || "pendiente",
        url,
        fecha: comprobanteTabla.created_at || pedido.created_at,
        origen: "tabla" as const,
      }
    }

    const urlPedido = obtenerComprobanteUrl(pedido)
    if (!urlPedido) return null

    return {
      id: pedido.id,
      pedidoId: pedido.id,
      cliente: pedido.cliente_nombre || "Cliente sin nombre",
      correo: pedido.cliente_correo || "",
      monto: Number(pedido.total || 0),
      metodo: pedido.metodo_pago || "No definido",
      estado: pedido.estado || "pendiente",
      url: urlPedido,
      fecha: pedido.created_at,
      origen: "pedido" as const,
    }
  }, [comprobantes])

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
  const pedidosConComprobante = pedidos.filter((pedido) => obtenerComprobanteDePedido(pedido)).length
  const comprobantesPendientes = comprobantes.filter((c) => (c.estado || "pendiente") === "pendiente").length
  const metodosPago = Array.from(new Set(pedidos.map((p) => p.metodo_pago).filter(Boolean)))
  const entidadesLog = Array.from(new Set(logs.map((log) => log.entidad).filter(Boolean)))
  const usuariosParaCredito = usuarios.filter((u) => u.estado === "aprobado" || u.estado === "activo")
  const obtenerUsuarioPorId = (usuarioId: string) => usuarios.find((u) => u.id === usuarioId)
  const productoEditandoActual = editandoId ? productos.find((producto) => producto.id === editandoId) : null
  const imagenPreviewProducto = imagenPreviewUrl || productoEditandoActual?.imagen || null
  const totalSaldoCreditos = creditos.reduce((acc, credito) => acc + Number(credito.saldo || 0), 0)
  const creditosActivos = creditos.filter((credito) => normalizarTexto(credito.estado) === "activo").length
  const creditosBloqueados = creditos.filter((credito) => ["bloqueado", "suspendido", "inactivo"].includes(normalizarTexto(credito.estado))).length
  const creditosSinSaldo = creditos.filter((credito) => Number(credito.saldo || 0) <= 0).length
  const saldoPromedioCredito = creditos.length > 0 ? totalSaldoCreditos / creditos.length : 0
  const obtenerProductoPorId = (productoId: string) => productos.find((producto) => producto.id === productoId)
  const cuentasDisponibles = cuentasProducto.filter((cuenta) => normalizarTexto(cuenta.estado) === "disponible").length
  const cuentasEntregadas = cuentasProducto.filter((cuenta) => normalizarTexto(cuenta.estado) === "entregada").length
  const cuentasBloqueadas = cuentasProducto.filter((cuenta) => ["bloqueada", "vencida"].includes(normalizarTexto(cuenta.estado))).length
  const cuentasPorVencer = cuentasProducto.filter((cuenta) => {
    const dias = diasRestantes(cuenta.fecha_fin)
    return dias !== null && dias >= 0 && dias <= 7
  }).length

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

  const pedidosFiltrados: Pedido[] = useMemo(() => {
    return [...pedidos]
      .filter((pedido) => {
        const texto = normalizarTexto(`${pedido.id} ${pedido.cliente_nombre} ${pedido.cliente_correo} ${pedido.metodo_pago} ${pedido.producto_nombre}`)
        const comprobanteUrl = obtenerComprobanteDePedido(pedido)?.url
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
  }, [pedidos, busquedaPedido, filtroEstadoPedido, filtroMetodoPago, filtroComprobantePedido, ordenPedido, obtenerComprobanteDePedido])

  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((u) => {
      const texto = normalizarTexto(`${u.nombre} ${u.correo} ${u.rol} ${u.estado}`)
      const coincideBusqueda = texto.includes(normalizarTexto(busquedaUsuario))
      const coincideEstado = filtroEstadoUsuario === "todos" || u.estado === filtroEstadoUsuario
      const coincideRol = filtroRolUsuario === "todos" || u.rol === filtroRolUsuario
      return coincideBusqueda && coincideEstado && coincideRol
    })
  }, [usuarios, busquedaUsuario, filtroEstadoUsuario, filtroRolUsuario])

  const comprobantesUnificados = useMemo<ComprobanteUnificado[]>(() => {
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

  const creditosFiltrados = useMemo(() => {
    const query = normalizarTexto(busquedaCredito)

    return creditos.filter((credito) => {
      const usuarioCredito = obtenerUsuarioPorId(credito.usuario_id)
      const texto = normalizarTexto(`${credito.id} ${credito.estado} ${credito.saldo} ${usuarioCredito?.nombre} ${usuarioCredito?.correo} ${usuarioCredito?.rol}`)
      const coincideBusqueda = !query || texto.includes(query)
      const coincideEstado = filtroEstadoCredito === "todos" || normalizarTexto(credito.estado) === filtroEstadoCredito
      return coincideBusqueda && coincideEstado
    })
  }, [creditos, usuarios, busquedaCredito, filtroEstadoCredito])

  const cuentasFiltradas = useMemo(() => {
    const query = normalizarTexto(busquedaCuenta)

    return cuentasProducto.filter((cuenta) => {
      const productoCuenta = obtenerProductoPorId(cuenta.producto_id)
      const usuarioCuenta = cuenta.usuario_id ? obtenerUsuarioPorId(cuenta.usuario_id) : null
      const texto = normalizarTexto(`${cuenta.correo} ${cuenta.estado} ${cuenta.notas} ${cuenta.cliente_inicio} ${cuenta.cliente_fin} ${productoCuenta?.nombre} ${productoCuenta?.categoria} ${usuarioCuenta?.nombre} ${usuarioCuenta?.correo}`)
      const coincideBusqueda = !query || texto.includes(query)
      const coincideEstado = filtroEstadoCuenta === "todos" || normalizarTexto(cuenta.estado) === filtroEstadoCuenta
      return coincideBusqueda && coincideEstado
    })
  }, [cuentasProducto, productos, busquedaCuenta, filtroEstadoCuenta])


  const resumenCuentasPorProducto = useMemo(() => {
    return productos
      .map((producto) => {
        const cuentasDelProducto = cuentasProducto.filter((cuenta) => cuenta.producto_id === producto.id)
        const disponibles = cuentasDelProducto.filter((cuenta) => normalizarTexto(cuenta.estado) === "disponible").length
        const entregadas = cuentasDelProducto.filter((cuenta) => normalizarTexto(cuenta.estado) === "entregada").length
        const bloqueadas = cuentasDelProducto.filter((cuenta) => ["bloqueada", "vencida"].includes(normalizarTexto(cuenta.estado))).length
        const vencidas = cuentasDelProducto.filter((cuenta) => {
          const diasCliente = diasRestantes(cuenta.cliente_fin)
          return diasCliente !== null && diasCliente < 0
        }).length
        const porVencer = cuentasDelProducto.filter((cuenta) => {
          const diasCliente = diasRestantes(cuenta.cliente_fin || cuenta.fecha_fin)
          return diasCliente !== null && diasCliente >= 0 && diasCliente <= 7
        }).length

        return {
          producto,
          total: cuentasDelProducto.length,
          disponibles,
          entregadas,
          bloqueadas,
          vencidas,
          porVencer,
        }
      })
      .filter((item) => item.total > 0)
      .sort((a, b) => b.total - a.total || a.producto.nombre.localeCompare(b.producto.nombre))
  }, [productos, cuentasProducto])

  const productoCuentasActivo = productoCuentasActivoId
    ? productos.find((producto) => producto.id === productoCuentasActivoId) || null
    : null

  const cuentasDetalleProducto = useMemo(() => {
    if (!productoCuentasActivoId) return cuentasFiltradas
    return cuentasFiltradas.filter((cuenta) => cuenta.producto_id === productoCuentasActivoId)
  }, [cuentasFiltradas, productoCuentasActivoId])

  const resumenCuentasActivo = productoCuentasActivoId
    ? resumenCuentasPorProducto.find((item) => item.producto.id === productoCuentasActivoId) || null
    : null

  const escaparCSV = (valor?: string | number | null) => {
    const texto = String(valor ?? "")
    return `"${texto.replace(/"/g, '""')}"`
  }

  const descargarArchivo = (nombreArchivo: string, contenido: string, tipo = "text/csv;charset=utf-8;") => {
    const blob = new Blob(["\ufeff", contenido], { type: tipo })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = nombreArchivo
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const construirCSVDeCuentas = (cuentas: CuentaProducto[]) => {
    const separador = ";"
    const encabezados = [
      "PRODUCTO",
      "CORREO",
      "CLIENTE",
      "VIGENCIA CLIENTE",
      "ESTADO",
      "DIAS",
    ]

    const filas = cuentas.map((cuenta) => {
      const productoCuenta = obtenerProductoPorId(cuenta.producto_id)
      const usuarioCuenta = cuenta.usuario_id ? obtenerUsuarioPorId(cuenta.usuario_id) : null
      const inicioCliente = cuenta.cliente_inicio || ""
      const finCliente = cuenta.cliente_fin || ""
      const dias = diasRestantes(cuenta.cliente_fin || cuenta.fecha_fin)

      return [
        productoCuenta?.nombre || "Producto eliminado",
        cuenta.correo,
        usuarioCuenta ? `${usuarioCuenta.nombre || "Cliente"} (${usuarioCuenta.correo})` : "Sin cliente",
        inicioCliente && finCliente ? `${fechaCorta(inicioCliente)} -> ${fechaCorta(finCliente)}` : "Sin entrega",
        cuenta.estado || "Sin estado",
        dias === null ? "" : dias,
      ].map(escaparCSV).join(separador)
    })

    return [encabezados.map(escaparCSV).join(separador), ...filas].join("\r\n")
  }

  const exportarCuentasCSV = (soloFiltradas = false) => {
    const cuentasAExportar = soloFiltradas ? cuentasFiltradas : cuentasProducto

    if (cuentasAExportar.length === 0) {
      toast.error("No hay cuentas para exportar")
      return
    }

    const fechaBackup = fechaISO()
    const csv = construirCSVDeCuentas(cuentasAExportar)
    descargarArchivo(
      soloFiltradas ? `jonas-stream-cuentas-filtradas-${fechaBackup}.csv` : `jonas-stream-cuentas-${fechaBackup}.csv`,
      csv
    )
    registrarEvento(soloFiltradas ? "Exportación CSV filtrada generada" : "Exportación CSV completa generada")
    registrarLog(
      soloFiltradas ? "exportar_cuentas_filtradas" : "exportar_cuentas",
      "cuentas_producto",
      undefined,
      `${cuentasAExportar.length} cuenta(s) exportadas a CSV`
    )
    toast.success(`${cuentasAExportar.length} cuenta(s) exportadas`)
  }

  const exportarRespaldoCuentas = () => {
    if (cuentasProducto.length === 0) {
      toast.error("No hay cuentas para respaldar")
      return
    }

    abrirConfirmacionAdmin({
      titulo: "Exportar respaldo completo de cuentas",
      descripcion: "Se descargará un CSV ordenado para Excel: producto, correo, cliente, vigencia de cliente, estado y días restantes. Guárdalo en un lugar seguro.",
      textoConfirmar: "Sí, descargar respaldo",
      tono: "warning",
      onConfirmar: async () => {
        const fechaBackup = fechaISO()
        const csv = construirCSVDeCuentas(cuentasProducto)
        descargarArchivo(`backup-jonas-stream-cuentas-${fechaBackup}.csv`, csv)
        await registrarLog("respaldo_cuentas", "cuentas_producto", undefined, `${cuentasProducto.length} cuenta(s) respaldadas`)
        registrarEvento("Respaldo de cuentas generado")
        toast.success("Respaldo de cuentas descargado")
      },
    })
  }

  const cargarArchivoCuentasTXT = async (archivo?: File | null) => {
    if (!archivo) return

    if (!archivo.name.toLowerCase().endsWith(".txt")) {
      toast.error("Sube un archivo .txt")
      return
    }

    try {
      const contenido = await archivo.text()
      setTextoImportacionCuentas(contenido)
      setArchivoImportacionNombre(archivo.name)
      const lineas = contenido.split(/\r?\n/).map((linea) => linea.trim()).filter(Boolean).length
      toast.success(`${lineas} línea(s) cargadas desde TXT`)
    } catch {
      toast.error("No se pudo leer el archivo TXT")
    }
  }

  const handleArchivoImportacionChange = async (e: ChangeEvent<HTMLInputElement>) => {
    await cargarArchivoCuentasTXT(e.target.files?.[0] || null)
    e.target.value = ""
  }

  const handleDropImportacion = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    await cargarArchivoCuentasTXT(e.dataTransfer.files?.[0] || null)
  }

  const limpiarArchivoImportacion = () => {
    setTextoImportacionCuentas("")
    setArchivoImportacionNombre("")
  }

  const importarCuentasDesdeTXT = async () => {
    if (!formCuenta.producto_id) {
      toast.error("Primero selecciona un producto arriba")
      return
    }

    const lineas = textoImportacionCuentas
      .split(/\r?\n/)
      .map((linea) => linea.trim())
      .filter(Boolean)

    if (lineas.length === 0) {
      toast.error("Arrastra o selecciona un TXT con cuentas en formato correo:contraseña")
      return
    }

    setImportandoCuentas(true)

    const cuentasParseadas: { correo: string; clave: string }[] = []
    const errores: string[] = []

    lineas.forEach((lineaOriginal, index) => {
      const linea = lineaOriginal
        .replace(/^🎫\s*/u, "")
        .replace(/^[-*•]\s*/u, "")
        .trim()

      const separadorIndex = linea.indexOf(":")

      if (separadorIndex <= 0) {
        errores.push(`Línea ${index + 1}: falta :`)
        return
      }

      const correo = linea.slice(0, separadorIndex).trim()
      const clave = linea.slice(separadorIndex + 1).trim()
      const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)

      if (!correoValido || !clave) {
        errores.push(`Línea ${index + 1}: formato inválido`)
        return
      }

      cuentasParseadas.push({ correo, clave })
    })

    if (cuentasParseadas.length === 0) {
      toast.error("No encontré cuentas válidas para importar")
      setImportandoCuentas(false)
      return
    }

    const { data: cuentasExistentesDB, error: errorExistentes } = await supabase
      .from("cuentas_producto")
      .select("correo")
      .eq("producto_id", formCuenta.producto_id)

    if (errorExistentes) {
      toast.error("No pude revisar duplicados en Supabase")
      setImportandoCuentas(false)
      return
    }

    const correosExistentes = new Set(
      ((cuentasExistentesDB || []) as Pick<CuentaProducto, "correo">[])
        .map((cuenta) => normalizarTexto(cuenta.correo))
    )

    const vistosEnArchivo = new Set<string>()
    const cuentasNuevas = cuentasParseadas.filter((cuenta) => {
      const correoNormalizado = normalizarTexto(cuenta.correo)
      if (vistosEnArchivo.has(correoNormalizado)) return false
      vistosEnArchivo.add(correoNormalizado)
      return !correosExistentes.has(correoNormalizado)
    })

    const omitidas = cuentasParseadas.length - cuentasNuevas.length

    if (cuentasNuevas.length === 0) {
      toast.error("Todas las cuentas ya existen o están duplicadas")
      setImportandoCuentas(false)
      return
    }

    const payload = cuentasNuevas.map((cuenta) => ({
      producto_id: formCuenta.producto_id,
      correo: cuenta.correo,
      clave: cuenta.clave,
      fecha_inicio: formCuenta.fecha_inicio || fechaISO(),
      fecha_fin: formCuenta.fecha_fin || sumarDiasISO(30),
      estado: formCuenta.estado || "disponible",
      notas: formCuenta.notas.trim() || null,
    }))

    const { error } = await supabase.from("cuentas_producto").insert(payload)

    if (error) {
      toast.error(`No se pudieron importar: ${error.message}`)
      setImportandoCuentas(false)
      return
    }

    await registrarLog(
      "importar_txt",
      "cuentas_producto",
      formCuenta.producto_id,
      `${payload.length} cuenta(s) importadas masivamente${omitidas > 0 ? ` · ${omitidas} omitidas` : ""}${errores.length > 0 ? ` · ${errores.length} inválidas` : ""}`
    )
    registrarEvento(`${payload.length} cuenta(s) importadas`)
    toast.success(`${payload.length} cuenta(s) importadas${omitidas > 0 ? ` · ${omitidas} duplicada(s) omitida(s)` : ""}`)
    setTextoImportacionCuentas("")
    setArchivoImportacionNombre("")
    setImportandoCuentas(false)
    await cargarDatos()
  }



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
    return pedido.estado === "pendiente" && (viejo || !obtenerComprobanteDePedido(pedido))
  })
  const pedidosSinPago = pedidos.filter((pedido) => pedido.estado === "pendiente" && !obtenerComprobanteDePedido(pedido))
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

  if (!autorizado) {
    return null
  }

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

        <section className={`${styles.proRibbon} ${styles.proRibbonCompact}`}>
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
                  <span className={styles.panelHint}>
                    Formulario limpio con vista previa igual a tienda. Solo dejamos lo necesario para vender.
                  </span>
                </div>
                {editandoId && <span className={styles.editBadge}>Modo edición</span>}
              </div>

              <div className={styles.productEditorLayout}>
                <div className={styles.productLivePreview}>
                  <p className={styles.kicker}>Vista previa tienda</p>

                  <article className={styles.storePreviewCard}>
                    <div className={styles.previewBadgeRow}>
                      <span className={styles.adminCategoryBadge}>
                        {formProducto.categoria || "Streaming"}
                      </span>
                      <span className={styles.adminTypeBadge}>
                        {formProducto.tipo_venta || "Cuenta completa"}
                      </span>
                    </div>

                    <button type="button" className={styles.previewFavorite} aria-label="Vista previa favorito">
                      ♥
                    </button>

                    <div className={styles.previewImageBox}>
                      {imagenPreviewProducto ? (
                        <img
                          src={imagenPreviewProducto}
                          alt={formProducto.nombre || "Vista previa producto"}
                          className={styles.previewImage}
                        />
                      ) : (
                        <div className={styles.previewNoImage}>JS</div>
                      )}
                    </div>

                    <div className={styles.previewBody}>
                      <h4>{formProducto.nombre || "Nuevo producto"}</h4>
                      <p>{formProducto.descripcion || "Descripción visible en tienda"}</p>

                      <div
                        className={`${styles.adminStockStrip} ${
                          obtenerEstadoStockVisual(Number(formProducto.stock || 0)).tono === "danger"
                            ? styles.adminStockDanger
                            : obtenerEstadoStockVisual(Number(formProducto.stock || 0)).tono === "warning"
                            ? styles.adminStockWarning
                            : styles.adminStockSuccess
                        }`}
                      >
                        <span>Stock</span>
                        <strong>{Number(formProducto.stock || 0)}</strong>
                      </div>

                      <div className={styles.adminMetaGrid}>
                        <div className={styles.adminMetaCard}>
                          <span>Tipo</span>
                          <strong>{formProducto.tipo_venta || "Cuenta completa"}</strong>
                        </div>
                        <div className={styles.adminMetaCard}>
                          <span>Duración</span>
                          <strong>{formProducto.duracion || "1 mes"}</strong>
                        </div>
                        <div className={styles.adminMetaCard}>
                          <span>Proveedor</span>
                          <strong>{formProducto.proveedor || "Jonas Stream"}</strong>
                        </div>
                        <div className={`${styles.adminMetaCard} ${formProducto.renovable ? styles.adminMetaSuccess : styles.adminMetaDanger}`}>
                          <span>Renovable</span>
                          <strong>{formProducto.renovable ? "Sí" : "No"}</strong>
                        </div>
                      </div>

                      <div className={styles.adminStatusRow}>
                        <span
                          className={
                            obtenerEstadoStockVisual(Number(formProducto.stock || 0)).tono === "danger"
                              ? styles.badgeDanger
                              : obtenerEstadoStockVisual(Number(formProducto.stock || 0)).tono === "warning"
                              ? styles.badgeWarning
                              : styles.badgeOk
                          }
                        >
                          {obtenerEstadoStockVisual(Number(formProducto.stock || 0)).label}
                        </span>
                        <small>{obtenerEstadoStockVisual(Number(formProducto.stock || 0)).detalle}</small>
                      </div>

                      <div className={styles.adminPriceGrid}>
                        <div className={styles.adminPriceCard}>
                          <small>PEN</small>
                          <strong>{formatearSoles(Number(formProducto.precio || 0))}</strong>
                          {formProducto.precio_antes && Number(formProducto.precio_antes) > 0 && (
                            <em>Antes {formatearSoles(Number(formProducto.precio_antes))}</em>
                          )}
                        </div>
                        <div className={styles.adminPriceCard}>
                          <small>USD</small>
                          <strong>$ {(Number(formProducto.precio || 0) / USD_RATE).toFixed(2)}</strong>
                        </div>
                      </div>

                      <button type="button" className={styles.previewBuyButton}>Comprar</button>
                    </div>
                  </article>
                </div>

                <form onSubmit={guardarProducto} className={styles.cleanProductForm}>
                  <div className={styles.cleanFormGrid}>
                    <input
                      name="nombre"
                      placeholder="Nombre del producto"
                      value={formProducto.nombre}
                      onChange={handleProductoChange}
                      className={styles.input}
                    />

                    <input
                      name="categoria"
                      placeholder="Categoría, ejemplo: Streaming"
                      value={formProducto.categoria}
                      onChange={handleProductoChange}
                      className={styles.input}
                    />

                    <textarea
                      name="descripcion"
                      placeholder="Descripción visible en tienda"
                      value={formProducto.descripcion}
                      onChange={handleProductoChange}
                      className={`${styles.input} ${styles.textarea}`}
                    />

                    <input
                      name="precio"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Precio"
                      value={formProducto.precio}
                      onChange={handleProductoChange}
                      className={styles.input}
                    />

                    <input
                      name="precio_antes"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Precio antes (opcional)"
                      value={formProducto.precio_antes}
                      onChange={handleProductoChange}
                      className={styles.input}
                    />

                    <input
                      name="stock"
                      type="number"
                      min="0"
                      placeholder="Stock"
                      value={formProducto.stock}
                      onChange={handleProductoChange}
                      className={styles.input}
                    />

                    <select
                      name="tipo_venta"
                      value={formProducto.tipo_venta}
                      onChange={handleProductoChange}
                      className={styles.input}
                    >
                      <option value="">Tipo de venta</option>
                      <option value="Cuenta Completa">Cuenta completa</option>
                      <option value="Perfil">Perfil</option>
                      <option value="Perfiles">Perfiles</option>
                      <option value="Código / Giftcard">Código / Giftcard</option>
                      <option value="Renovación">Renovación</option>
                    </select>

                    <input
                      name="duracion"
                      placeholder="Duración, ejemplo: 1 mes"
                      value={formProducto.duracion}
                      onChange={handleProductoChange}
                      className={styles.input}
                    />

                    <input
                      name="proveedor"
                      placeholder="Proveedor"
                      value={formProducto.proveedor}
                      onChange={handleProductoChange}
                      className={styles.input}
                    />

                    <select
                      name="estado"
                      value={formProducto.estado}
                      onChange={handleProductoChange}
                      className={styles.input}
                    >
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                    </select>
                  </div>

                  <div className={styles.compactChecks}>
                    <label>
                      <input type="checkbox" name="renovable" checked={formProducto.renovable} onChange={handleProductoChange} />
                      Renovable
                    </label>
                    <label>
                      <input type="checkbox" name="publicacion" checked={formProducto.publicacion} onChange={handleProductoChange} />
                      Publicar en tienda
                    </label>
                    <label>
                      <input type="checkbox" name="destacado" checked={formProducto.destacado} onChange={handleProductoChange} />
                      Destacado
                    </label>
                    <label>
                      <input type="checkbox" name="oferta" checked={formProducto.oferta} onChange={handleProductoChange} />
                      Oferta
                    </label>
                  </div>

                  <div className={styles.fileBoxPreview}>
                    <div>
                      <label>Imagen del producto</label>
                      <p>Se muestra al instante en la vista previa antes de guardar.</p>
                    </div>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImagenFile(e.target.files?.[0] || null)}
                      className={styles.input}
                    />

                    {imagenFile && <small>Archivo seleccionado: {imagenFile.name}</small>}
                    {subiendoImagen && <small>Subiendo imagen...</small>}
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
              </div>
            </article>

            <article className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <p className={styles.kicker}>Productos</p>
                  <h3>Catálogo visual</h3>
                  <span className={styles.panelHint}>
                    Vista admin alineada con la tienda: imagen grande, datos clave y acciones rápidas.
                  </span>
                </div>
                <span className={styles.countBadge}>{productosFiltrados.length} productos</span>
              </div>

              <div className={styles.adminProductToolbar}>
                <input
                  type="text"
                  placeholder="Buscar producto..."
                  value={busquedaProducto}
                  onChange={(e) => setBusquedaProducto(e.target.value)}
                  className={styles.input}
                />
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

              <div className={styles.miniStatsGrid}>
                <button type="button" onClick={() => { setFiltroEstadoProducto("activo"); setFiltroStockProducto("todos") }} className={styles.miniStatCard}>
                  <span>Activos</span><strong>{productosActivos}</strong><small>Publicables</small>
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

              <div className={styles.adminProductGrid}>
                {productosVisibles.length === 0 ? (
                  <EmptyState title="Sin productos" text="No hay productos que coincidan con los filtros." />
                ) : productosVisibles.map((p) => {
                  const stock = Number(p.stock || 0)
                  const agotado = stock <= 0
                  const limitado = stock > 0 && stock <= 3
                  const tipoVenta = p.tipo_venta || "Cuenta completa"
                  const usd = Number(p.precio || 0) / USD_RATE

                  return (
                    <article key={p.id} className={styles.adminStoreCard}>
                      <div className={styles.adminProductVisual}>
                        <div className={styles.adminProductBadges}>
                          <span className={styles.adminCategoryBadge}>{p.categoria || "Streaming"}</span>
                          <span className={styles.adminTypeBadge}>{tipoVenta}</span>
                        </div>

                        {p.destacado && <span className={styles.adminFeaturedBadge}>Destacado</span>}

                        {p.imagen ? (
                          <img src={p.imagen} alt={p.nombre} className={styles.adminProductImage} />
                        ) : (
                          <div className={styles.adminProductPlaceholder}>JS</div>
                        )}
                      </div>

                      <div className={styles.adminProductContent}>
                        <h4>{p.nombre}</h4>
                        <p>{p.descripcion || "Producto digital disponible"}</p>

                        <div className={`${styles.adminStockStrip} ${agotado ? styles.adminStockDanger : limitado ? styles.adminStockWarning : styles.adminStockSuccess}`}>
                          <span>Stock</span>
                          <strong>{stock}</strong>
                        </div>

                        <div className={styles.adminMetaGrid}>
                          <div className={styles.adminMetaCard}>
                            <span>Tipo</span>
                            <strong>{tipoVenta}</strong>
                          </div>
                          <div className={styles.adminMetaCard}>
                            <span>Duración</span>
                            <strong>{p.duracion || "1 mes"}</strong>
                          </div>
                          <div className={styles.adminMetaCard}>
                            <span>Proveedor</span>
                            <strong>{p.proveedor || "Jonas Stream"}</strong>
                          </div>
                          <div className={`${styles.adminMetaCard} ${p.renovable ? styles.adminMetaSuccess : styles.adminMetaDanger}`}>
                            <span>Renovable</span>
                            <strong>{p.renovable ? "Sí" : "No"}</strong>
                          </div>
                        </div>

                        <div className={styles.adminStatusRow}>
                          <span className={agotado ? styles.badgeDanger : limitado ? styles.badgeWarning : styles.badgeOk}>
                            {agotado ? "AGOTADO" : limitado ? "LIMITADO" : "ACTIVO"}
                          </span>
                          <small>{agotado ? "Consultar reposición" : limitado ? "Últimas unidades" : "Stock disponible"}</small>
                        </div>

                        <div className={styles.adminPriceGrid}>
                          <div className={styles.adminPriceCard}>
                            <small>PEN</small>
                            <strong>{formatearSoles(p.precio)}</strong>
                            {p.precio_antes && Number(p.precio_antes) > 0 && (
                              <em>Antes {formatearSoles(Number(p.precio_antes))}</em>
                            )}
                          </div>
                          <div className={styles.adminPriceCard}>
                            <small>USD</small>
                            <strong>$ {usd.toFixed(2)}</strong>
                          </div>
                        </div>

                        <div className={styles.adminProductActions}>
                          <button type="button" onClick={() => editarProducto(p)} className={styles.secondaryButton}>Editar</button>
                          <button type="button" onClick={() => reponerProductoRapido(p)} className={styles.successButton}>+10 stock</button>
                          <button type="button" onClick={() => eliminarProducto(p.id)} className={styles.dangerButton}>Eliminar</button>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>

              {productosFiltrados.length > productosVisibles.length && (
                <div className={styles.loadMoreBox}>
                  <button type="button" onClick={() => setLimiteProductos((prev) => prev + 12)} className={styles.secondaryButton}>
                    Cargar más productos
                  </button>
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
                          const comprobantePedido = obtenerComprobanteDePedido(pedido)
                          const comprobanteUrl = comprobantePedido?.url
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
                              <td>{comprobantePedido ? <button type="button" onClick={() => setComprobantePreview(comprobantePedido)} className={styles.secondaryButton}>👁 Ver</button> : <span className={styles.mutedText}>Sin voucher</span>}</td>
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
                      const comprobantePedido = obtenerComprobanteDePedido(pedido)
                      const comprobanteUrl = comprobantePedido?.url
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
                            {comprobantePedido ? (
                              <button type="button" onClick={() => setComprobantePreview(comprobantePedido)} className={styles.secondaryButton}>👁 Vista previa</button>
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

              <div className={styles.googleContactsBox}>
                <div>
                  <p className={styles.kicker}>Google Contacts</p>
                  <h4>Exportar contactos con tu orden</h4>
                  <span>Formato: Prefijo = número de orden, Nombre = primer nombre, Segundo nombre = resto del nombre, Apellidos vacío, Teléfono sin + y etiqueta seleccionada.</span>
                </div>

                <div className={styles.googleContactsControls}>
                  <label>
                    <span>Orden inicial</span>
                    <input
                      type="number"
                      min="1"
                      value={ordenGoogleContactos}
                      onChange={(e) => setOrdenGoogleContactos(e.target.value)}
                      className={styles.input}
                    />
                  </label>

                  <label>
                    <span>Etiqueta</span>
                    <select value={etiquetaGoogleContactos} onChange={(e) => setEtiquetaGoogleContactos(e.target.value)} className={styles.input}>
                      {etiquetasGoogleContactos.map((etiqueta) => (
                        <option key={etiqueta} value={etiqueta}>{etiqueta}</option>
                      ))}
                    </select>
                  </label>

                  <button type="button" onClick={() => exportarUsuariosGoogleContacts(usuariosFiltrados)} className={styles.primaryButton}>
                    Exportar filtrados
                  </button>

                  <button type="button" onClick={() => exportarUsuariosGoogleContacts(usuarios)} className={styles.secondaryButton}>
                    Exportar todos
                  </button>
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
                        <th>Celular</th>
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
                          <td>
                            {limpiarNumeroContacto(u.celular_completo || `${u.codigo_pais || ""}${u.celular || ""}`) || "Sin celular"}
                            {u.pais && <small>{u.pais}</small>}
                          </td>
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
                          <p className={styles.userPhoneLine}>{limpiarNumeroContacto(u.celular_completo || `${u.codigo_pais || ""}${u.celular || ""}`) || "Sin celular"}{u.pais ? ` · ${u.pais}` : ""}</p>
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
                  <button type="button" onClick={() => { setFiltroEstadoComprobante("pendiente"); setVistaComprobantes("tabla") }} className={styles.primaryButton}>Cola pendiente</button>
                </div>
                <div className={styles.toggleGroup}>
                  <button type="button" onClick={() => setVistaComprobantes("tabla")} className={vistaComprobantes === "tabla" ? styles.toggleActive : ""}>Filas</button>
                  <button type="button" onClick={() => setVistaComprobantes("revision")} className={vistaComprobantes === "revision" ? styles.toggleActive : ""}>Tarjetas</button>
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
                              <td>
                                {comprobante.url ? (
                                  <button type="button" onClick={() => setComprobantePreview(comprobante)} className={styles.secondaryButton}>👁 Ver</button>
                                ) : (
                                  <span className={styles.badgeWarning}>Sin archivo</span>
                                )}
                              </td>
                              <td>
                                <div className={styles.tableActions}>
                                  <button type="button" onClick={() => resolverComprobantePro(comprobante, "aprobado")} className={styles.successButton}>Aprobar</button>
                                  <button type="button" onClick={() => setComprobantePreview(comprobante)} className={styles.secondaryButton}>Revisar</button>
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

            {comprobantePreview && (
              <div
                role="dialog"
                aria-modal="true"
                style={{
                  position: "fixed",
                  inset: 0,
                  zIndex: 9999,
                  background: "rgba(0, 0, 0, 0.86)",
                  backdropFilter: "blur(10px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "22px",
                }}
                onClick={() => setComprobantePreview(null)}
              >
                <div
                  style={{
                    width: "min(1180px, 96vw)",
                    maxHeight: "94vh",
                    overflow: "hidden",
                    border: "1px solid rgba(1, 231, 239, 0.35)",
                    borderRadius: "24px",
                    background: "#031316",
                    boxShadow: "0 0 50px rgba(0, 251, 255, 0.18)",
                    display: "grid",
                    gridTemplateColumns: "minmax(0, 1.35fr) minmax(320px, 0.65fr)",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ background: "#000", minHeight: "70vh", maxHeight: "94vh", overflow: "auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {comprobantePreview.url ? (
                      <img
                        src={comprobantePreview.url}
                        alt={`Comprobante ${comprobantePreview.id.slice(0, 8)}`}
                        style={{ width: "100%", height: "auto", maxHeight: "92vh", objectFit: "contain" }}
                      />
                    ) : (
                      <div className={styles.reviewPlaceholderPro}>
                        <strong>Sin archivo</strong>
                        <small>No hay comprobante para mostrar.</small>
                      </div>
                    )}
                  </div>

                  <aside style={{ padding: "24px", overflow: "auto" }}>
                    <div className={styles.reviewTopline}>
                      <div>
                        <p className={styles.kicker}>Vista previa</p>
                        <h4>#{comprobantePreview.id.slice(0, 8)}</h4>
                      </div>
                      <button type="button" onClick={() => setComprobantePreview(null)} className={styles.dangerGhostButton}>Cerrar</button>
                    </div>

                    <div className={styles.reviewAmountBox}>
                      <span>Monto declarado</span>
                      <strong>{formatearSoles(comprobantePreview.monto)}</strong>
                      <small>{comprobantePreview.metodo || "Método no definido"}</small>
                    </div>

                    <div className={styles.infoGrid}>
                      <span>Cliente</span><strong>{comprobantePreview.cliente}</strong>
                      <span>Correo</span><strong>{comprobantePreview.correo || "Sin correo"}</strong>
                      <span>Pedido</span><strong>{comprobantePreview.pedidoId ? `#${comprobantePreview.pedidoId.slice(0, 8)}` : "Sin pedido"}</strong>
                      <span>Fecha</span><strong>{fechaLegible(comprobantePreview.fecha)}</strong>
                      <span>Estado</span><strong>{comprobantePreview.estado}</strong>
                    </div>

                    <div className={styles.reviewActionsPro}>
                      {comprobantePreview.url && <a href={comprobantePreview.url} target="_blank" rel="noreferrer" className={styles.primaryButton}>Abrir en otra pestaña</a>}
                      <button type="button" onClick={() => resolverComprobantePro(comprobantePreview, "aprobado")} className={styles.successButton}>Aprobar pago</button>
                      <button type="button" onClick={() => resolverComprobantePro(comprobantePreview, "observado")} className={styles.secondaryButton}>Observar</button>
                      <button type="button" onClick={() => resolverComprobantePro(comprobantePreview, "rechazado")} className={styles.dangerButton}>Rechazar</button>
                    </div>
                  </aside>
                </div>
              </div>
            )}
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
                  stock mayor a 3 queda ACTIVO. Al completar pedidos o aprobar comprobantes, el panel descuenta la cantidad comprada por coincidencia de nombre.
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

        {tabActiva === "cuentas" && (
          <div className={styles.sectionStack}>
            <section className={styles.metricsGridCompact}>
              <MetricCard title="Cuentas" value={cuentasProducto.length} detail={`${cuentasEntregadas} entregadas`} tone="info" />
              <MetricCard title="Disponibles" value={cuentasDisponibles} detail="Listas para entregar" tone="success" />
              <MetricCard title="Por vencer" value={cuentasPorVencer} detail="Vencen en 7 días" tone="warning" />
              <MetricCard title="Bloqueadas" value={cuentasBloqueadas} detail="No vender / vencidas" tone="danger" />
            </section>

            <article className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <p className={styles.kicker}>Banco de cuentas completas</p>
                  <h3>{editandoCuentaId ? "Editar cuenta" : "Agregar cuenta completa"}</h3>
                  <span className={styles.panelHint}>
                    Las fechas se crean automáticamente: inicio hoy y finalización en 30 días. Puedes editarlas si necesitas.
                  </span>
                </div>
                {editandoCuentaId && <span className={styles.editBadge}>Modo edición</span>}
              </div>

              <form onSubmit={guardarCuenta} className={styles.formGrid}>
                <select
                  name="producto_id"
                  value={formCuenta.producto_id}
                  onChange={handleCuentaChange}
                  className={styles.input}
                >
                  <option value="">Seleccionar producto</option>
                  {productos.map((producto) => (
                    <option key={producto.id} value={producto.id}>
                      {producto.nombre}
                    </option>
                  ))}
                </select>

                <select
                  name="estado"
                  value={formCuenta.estado}
                  onChange={handleCuentaChange}
                  className={styles.input}
                >
                  <option value="disponible">Disponible</option>
                  <option value="entregada">Entregada</option>
                  <option value="bloqueada">Bloqueada</option>
                  <option value="vencida">Vencida</option>
                </select>

                <input
                  name="correo"
                  type="email"
                  placeholder="Correo de la cuenta"
                  value={formCuenta.correo}
                  onChange={handleCuentaChange}
                  className={styles.input}
                />

                <input
                  name="clave"
                  type="text"
                  placeholder="Contraseña"
                  value={formCuenta.clave}
                  onChange={handleCuentaChange}
                  className={styles.input}
                />

                <label className={styles.dateFieldLabel}>
                  <span>Fecha inicio</span>
                  <input
                    name="fecha_inicio"
                    type="date"
                    value={formCuenta.fecha_inicio}
                    onChange={handleCuentaChange}
                    className={styles.input}
                  />
                </label>

                <label className={styles.dateFieldLabel}>
                  <span>Fecha fin automática (+30 días)</span>
                  <input
                    name="fecha_fin"
                    type="date"
                    value={formCuenta.fecha_fin}
                    onChange={handleCuentaChange}
                    className={styles.input}
                  />
                </label>

                <textarea
                  name="notas"
                  placeholder="Notas internas opcionales"
                  value={formCuenta.notas}
                  onChange={handleCuentaChange}
                  className={`${styles.input} ${styles.textarea}`}
                />

                <div className={styles.formActions}>
                  <button type="submit" className={styles.primaryButton} disabled={guardandoCuenta}>
                    {guardandoCuenta ? "Guardando..." : editandoCuentaId ? "Actualizar cuenta" : "Guardar cuenta"}
                  </button>
                  {editandoCuentaId && (
                    <button type="button" className={styles.secondaryButton} onClick={limpiarFormularioCuenta}>
                      Cancelar edición
                    </button>
                  )}
                </div>
              </form>
            </article>

            <article className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <p className={styles.kicker}>Importación y respaldo</p>
                  <h3>Importar cuentas por archivo TXT</h3>
                  <span className={styles.panelHint}>Arrastra tu archivo .txt con una cuenta por línea. Formato: correo1@gmail.com:123456</span>
                </div>
                <div className={styles.tableActions}>
                  <button type="button" onClick={() => exportarCuentasCSV(false)} className={styles.secondaryButton}>Exportar CSV</button>
                  <button type="button" onClick={() => exportarCuentasCSV(true)} className={styles.secondaryButton}>Exportar filtradas</button>
                  <button type="button" onClick={exportarRespaldoCuentas} className={styles.successButton}>Respaldo cuentas</button>
                </div>
              </div>

              <div className={styles.noticeBox}>
                Primero selecciona arriba el producto, fechas, estado y notas. Luego arrastra tu TXT. Ejemplo: correo1@gmail.com:123456. El sistema omite duplicadas del mismo producto.
              </div>

              <input
                ref={inputImportarCuentasRef}
                type="file"
                accept=".txt,text/plain"
                onChange={handleArchivoImportacionChange}
                className={styles.hiddenFileInput}
              />

              <div
                className={styles.importDropzone}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDropImportacion}
                onClick={() => inputImportarCuentasRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") inputImportarCuentasRef.current?.click()
                }}
              >
                <div className={styles.importDropIcon}>TXT</div>
                <div>
                  <strong>{archivoImportacionNombre || "Arrastra aquí tu archivo de cuentas"}</strong>
                  <p>Formato: correo1@gmail.com:123456 · correo2@gmail.com:clave456</p>
                  <small>{textoImportacionCuentas ? `${textoImportacionCuentas.split(/\r?\n/).filter((linea) => linea.trim()).length} línea(s) listas para importar` : "Click para seleccionar archivo .txt"}</small>
                </div>
              </div>

              <div className={styles.formActions}>
                <button type="button" onClick={importarCuentasDesdeTXT} disabled={importandoCuentas || guardandoCuenta || !textoImportacionCuentas.trim()} className={styles.primaryButton}>
                  {importandoCuentas ? "Importando..." : "Importar cuentas TXT"}
                </button>
                <button type="button" onClick={limpiarArchivoImportacion} className={styles.secondaryButton}>
                  Limpiar archivo
                </button>
              </div>
            </article>

            <article className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <p className={styles.kicker}>Control de cuentas por plataforma</p>
                  <h3>{productoCuentasActivo ? `Cuentas de ${productoCuentasActivo.nombre}` : "Resumen de cuentas"}</h3>
                  <span className={styles.panelHint}>
                    {productoCuentasActivo
                      ? "Aquí ves solo las cuentas de esta plataforma: clientes asignados, vigencias, estado y acciones."
                      : "Primero ves el resumen por producto. Entra a una plataforma para ver clientes y cuentas sin hacer una lista infinita."}
                  </span>
                </div>

                {productoCuentasActivo && (
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => setProductoCuentasActivoId(null)}
                  >
                    ← Volver al resumen
                  </button>
                )}
              </div>

              {!productoCuentasActivo && (
                resumenCuentasPorProducto.length === 0 ? (
                  <EmptyState title="Sin cuentas" text="Agrega tus primeras cuentas completas para ordenar el stock real." />
                ) : (
                  <div className={styles.accountSummaryGrid}>
                    {resumenCuentasPorProducto.map((item) => (
                      <button
                        key={item.producto.id}
                        type="button"
                        className={`${styles.accountPlatformCard} ${
                          item.disponibles <= 0
                            ? styles.accountPlatformDanger
                            : item.disponibles <= 3
                            ? styles.accountPlatformWarning
                            : styles.accountPlatformSuccess
                        }`}
                        onClick={() => {
                          setProductoCuentasActivoId(item.producto.id)
                          setBusquedaCuenta("")
                          setFiltroEstadoCuenta("todos")
                        }}
                      >
                        <div className={styles.accountPlatformTop}>
                          <div>
                            <span>{item.producto.categoria || "Plataforma"}</span>
                            <strong>{item.producto.nombre}</strong>
                          </div>
                          <em>{item.total}</em>
                        </div>

                        <div className={styles.accountPlatformStats}>
                          <div>
                            <b>{item.disponibles}</b>
                            <small>Disponibles</small>
                          </div>
                          <div>
                            <b>{item.entregadas}</b>
                            <small>Ocupadas</small>
                          </div>
                          <div>
                            <b>{item.bloqueadas}</b>
                            <small>Bloqueadas</small>
                          </div>
                          <div>
                            <b>{item.porVencer}</b>
                            <small>Por vencer</small>
                          </div>
                        </div>

                        <div className={styles.accountPlatformFooter}>
                          <span>Stock tienda: {item.producto.stock}</span>
                          <strong>Gestionar cuentas →</strong>
                        </div>
                      </button>
                    ))}
                  </div>
                )
              )}

              {productoCuentasActivo && (
                <>
                  <div className={styles.accountDetailHero}>
                    <div>
                      <p className={styles.kicker}>Plataforma seleccionada</p>
                      <h4>{productoCuentasActivo.nombre}</h4>
                      <span>{productoCuentasActivo.categoria || "Sin categoría"} · Stock tienda {productoCuentasActivo.stock}</span>
                    </div>

                    <div className={styles.accountDetailStats}>
                      <div>
                        <strong>{resumenCuentasActivo?.total || 0}</strong>
                        <span>Total</span>
                      </div>
                      <div>
                        <strong>{resumenCuentasActivo?.disponibles || 0}</strong>
                        <span>Libres</span>
                      </div>
                      <div>
                        <strong>{resumenCuentasActivo?.entregadas || 0}</strong>
                        <span>Ocupadas</span>
                      </div>
                      <div>
                        <strong>{resumenCuentasActivo?.bloqueadas || 0}</strong>
                        <span>Bloqueadas</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.filtersGridCompact}>
                    <input
                      type="search"
                      placeholder={`Buscar cuenta, cliente o nota en ${productoCuentasActivo.nombre}...`}
                      value={busquedaCuenta}
                      onChange={(e) => setBusquedaCuenta(e.target.value)}
                      className={styles.input}
                    />

                    <select
                      value={filtroEstadoCuenta}
                      onChange={(e) => setFiltroEstadoCuenta(e.target.value)}
                      className={styles.input}
                    >
                      <option value="todos">Todos</option>
                      <option value="disponible">Disponibles</option>
                      <option value="entregada">Entregadas / ocupadas</option>
                      <option value="bloqueada">Bloqueadas</option>
                      <option value="vencida">Vencidas</option>
                    </select>
                  </div>

                  {cuentasDetalleProducto.length === 0 ? (
                    <EmptyState title="Sin cuentas en este filtro" text="Cambia el filtro o importa cuentas para esta plataforma." />
                  ) : (
                    <div className={styles.tableWrap}>
                      <table className={styles.proTable}>
                        <thead>
                          <tr>
                            <th>Acceso</th>
                            <th>Cliente asignado</th>
                            <th>Vigencia admin</th>
                            <th>Vigencia cliente</th>
                            <th>Estado</th>
                            <th>Notas</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cuentasDetalleProducto.map((cuenta) => {
                            const usuarioCuenta = cuenta.usuario_id ? obtenerUsuarioPorId(cuenta.usuario_id) : null
                            const diasAdmin = diasRestantes(cuenta.fecha_fin)
                            const adminVencida = diasAdmin !== null && diasAdmin < 0
                            const adminPorVencer = diasAdmin !== null && diasAdmin >= 0 && diasAdmin <= 7
                            const diasCliente = diasRestantes(cuenta.cliente_fin)
                            const clienteVencido = diasCliente !== null && diasCliente < 0
                            const clientePorVencer = diasCliente !== null && diasCliente >= 0 && diasCliente <= 7
                            const estadoNormalizado = normalizarTexto(cuenta.estado)
                            const estaEntregada = estadoNormalizado === "entregada"
                            const estaBloqueada = estadoNormalizado === "bloqueada"

                            return (
                              <tr key={cuenta.id}>
                                <td>
                                  <strong>{cuenta.correo}</strong>
                                  <small>Clave: {cuenta.clave}</small>
                                </td>
                                <td>
                                  <strong>{usuarioCuenta?.nombre || (cuenta.usuario_id ? "Cliente asignado" : "Sin cliente")}</strong>
                                  <small>{usuarioCuenta?.correo || (cuenta.usuario_id ? cuenta.usuario_id.slice(0, 8) : "Todavía no entregada")}</small>
                                  {cuenta.pedido_id && <small>Pedido #{cuenta.pedido_id.slice(0, 8)}</small>}
                                </td>
                                <td>
                                  <strong>{fechaCorta(cuenta.fecha_inicio)} → {fechaCorta(cuenta.fecha_fin)}</strong>
                                  <small className={adminVencida ? styles.textDanger : adminPorVencer ? styles.textWarning : styles.textSuccess}>
                                    {diasAdmin === null
                                      ? "Sin cálculo"
                                      : adminVencida
                                      ? `Venció hace ${Math.abs(diasAdmin)} día(s)`
                                      : diasAdmin === 0
                                      ? "Vence hoy"
                                      : `Vence en ${diasAdmin} día(s)`}
                                  </small>
                                </td>
                                <td>
                                  <strong>{cuenta.cliente_inicio && cuenta.cliente_fin ? `${fechaCorta(cuenta.cliente_inicio)} → ${fechaCorta(cuenta.cliente_fin)}` : "Sin entrega"}</strong>
                                  <small className={clienteVencido ? styles.textDanger : clientePorVencer ? styles.textWarning : styles.textSuccess}>
                                    {!cuenta.cliente_fin
                                      ? "Se llenará al aprobar pedido"
                                      : diasCliente === null
                                      ? "Sin cálculo"
                                      : clienteVencido
                                      ? `Cliente venció hace ${Math.abs(diasCliente)} día(s)`
                                      : diasCliente === 0
                                      ? "Cliente vence hoy"
                                      : `Cliente vence en ${diasCliente} día(s)`}
                                  </small>
                                </td>
                                <td>
                                  <span
                                    className={`${styles.statusBadge} ${
                                      estadoNormalizado === "disponible"
                                        ? styles.statusSuccess
                                        : estadoNormalizado === "entregada"
                                        ? styles.statusWarning
                                        : styles.statusDanger
                                    }`}
                                  >
                                    {cuenta.estado}
                                  </span>
                                </td>
                                <td>{cuenta.notas || <span className={styles.mutedText}>Sin notas</span>}</td>
                                <td>
                                  <div className={styles.tableActions}>
                                    <button type="button" className={styles.secondaryButton} onClick={() => copiarDatosCuenta(cuenta)}>Copiar</button>
                                    {estaEntregada && <button type="button" className={styles.successButton} onClick={() => renovarCuentaCliente(cuenta)}>Renovar +30</button>}
                                    {estaEntregada && <button type="button" className={styles.dangerGhostButton} onClick={() => quitarAccesoCuenta(cuenta)}>Quitar acceso</button>}
                                    {estaBloqueada ? (
                                      <button type="button" className={styles.successButton} onClick={() => cambiarEstadoCuentaOperativa(cuenta, "disponible")}>Liberar</button>
                                    ) : (
                                      <button type="button" className={styles.dangerGhostButton} onClick={() => cambiarEstadoCuentaOperativa(cuenta, "bloqueada")}>Bloquear</button>
                                    )}
                                    <button type="button" className={styles.successButton} onClick={() => editarCuenta(cuenta)}>Editar</button>
                                    <button type="button" className={styles.dangerGhostButton} onClick={() => eliminarCuenta(cuenta)}>Eliminar</button>
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </article>
          </div>
        )}

        {tabActiva === "creditos" && (
          <div className={styles.sectionStack}>
            <section className={styles.usersHeroPro}>
              <div className={styles.usersHeroCopy}>
                <span className={styles.proTag}>CRÉDITOS PRO</span>
                <h3>Centro financiero Jonas Stream</h3>
                <p>
                  Administra saldos internos por usuario, controla créditos activos, bloquea cuentas con riesgo
                  y deja trazabilidad en el historial del panel sin salir del ecosistema Supabase.
                </p>
                <div className={styles.usersHeroActions}>
                  <button type="button" onClick={() => { setFiltroEstadoCredito("activo"); setBusquedaCredito("") }} className={styles.primaryButton}>Ver activos</button>
                  <button type="button" onClick={() => { setFiltroEstadoCredito("bloqueado"); setBusquedaCredito("") }} className={styles.secondaryButton}>Ver bloqueados</button>
                  <button type="button" onClick={limpiarFormularioCredito} className={styles.secondaryButton}>Nuevo crédito</button>
                </div>
              </div>

              <div className={styles.usersHeroStats}>
                <div>
                  <span>Saldo total</span>
                  <strong>{formatearSoles(totalSaldoCreditos)}</strong>
                  <small>{creditos.length} registros financieros</small>
                </div>
                <div>
                  <span>Activos</span>
                  <strong>{creditosActivos}</strong>
                  <small>usuarios con crédito habilitado</small>
                </div>
                <div>
                  <span>Promedio</span>
                  <strong>{formatearSoles(saldoPromedioCredito)}</strong>
                  <small>saldo medio por cuenta</small>
                </div>
                <div>
                  <span>Alertas</span>
                  <strong>{creditosBloqueados + creditosSinSaldo}</strong>
                  <small>{creditosBloqueados} bloqueados · {creditosSinSaldo} sin saldo</small>
                </div>
              </div>
            </section>

            <div className={styles.metricsGridCompact}>
              <MetricCard title="Saldo total" value={formatearSoles(totalSaldoCreditos)} detail={`${creditos.length} crédito(s) registrados`} tone="success" />
              <MetricCard title="Créditos activos" value={creditosActivos} detail="Disponibles para operar" tone="info" />
              <MetricCard title="Sin saldo" value={creditosSinSaldo} detail="Revisar o recargar" tone="warning" />
              <MetricCard title="Bloqueados" value={creditosBloqueados} detail="Cuentas con restricción" tone="danger" />
            </div>

            <article className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <p className={styles.kicker}>Gestión financiera</p>
                  <h3>{editandoCreditoId ? "Editar crédito" : "Crear crédito"}</h3>
                  <span className={styles.panelHint}>Selecciona un usuario aprobado, define saldo y estado operativo del crédito.</span>
                </div>
                {editandoCreditoId && <span className={styles.editBadge}>Modo edición</span>}
              </div>

              <form onSubmit={guardarCredito} className={styles.formGrid}>
                <select name="usuario_id" value={formCredito.usuario_id} onChange={handleCreditoChange} className={styles.input}>
                  <option value="">Seleccionar usuario</option>
                  {usuariosParaCredito.map((u) => (
                    <option key={u.id} value={u.id}>{u.nombre} · {u.correo} · {u.rol}</option>
                  ))}
                </select>

                <input
                  name="saldo"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Saldo del crédito"
                  value={formCredito.saldo}
                  onChange={handleCreditoChange}
                  className={styles.input}
                />

                <select name="estado" value={formCredito.estado} onChange={handleCreditoChange} className={styles.input}>
                  <option value="activo">Activo</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="bloqueado">Bloqueado</option>
                  <option value="inactivo">Inactivo</option>
                </select>

                <div className={styles.formActions}>
                  <button type="submit" disabled={guardandoCredito} className={styles.primaryButton}>
                    {guardandoCredito ? "Guardando..." : editandoCreditoId ? "Actualizar crédito" : "Crear crédito"}
                  </button>
                  {editandoCreditoId && (
                    <button type="button" onClick={limpiarFormularioCredito} className={styles.secondaryButton}>Cancelar edición</button>
                  )}
                </div>
              </form>
            </article>

            <article className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <p className={styles.kicker}>Cartera interna</p>
                  <h3>Créditos registrados</h3>
                  <span className={styles.panelHint}>Vista conectada a la tabla creditos con filtros por usuario, correo, rol, estado y saldo.</span>
                </div>
                <span className={styles.countBadge}>{creditosFiltrados.length} créditos</span>
              </div>

              <div className={styles.miniStatsGrid}>
                <button type="button" onClick={() => setFiltroEstadoCredito("activo")} className={styles.miniStatCard}>
                  <span>Activos</span><strong>{creditosActivos}</strong><small>Operación habilitada</small>
                </button>
                <button type="button" onClick={() => setFiltroEstadoCredito("pendiente")} className={styles.miniStatCard}>
                  <span>Pendientes</span><strong>{creditos.filter((c) => normalizarTexto(c.estado) === "pendiente").length}</strong><small>Requieren revisión</small>
                </button>
                <button type="button" onClick={() => setBusquedaCredito("0")} className={styles.miniStatCard}>
                  <span>Sin saldo</span><strong>{creditosSinSaldo}</strong><small>Recargar o bloquear</small>
                </button>
                <button type="button" onClick={() => { setFiltroEstadoCredito("todos"); setBusquedaCredito("") }} className={`${styles.miniStatCard} ${styles.miniStatDanger}`}>
                  <span>Bloqueados</span><strong>{creditosBloqueados}</strong><small>Alertas financieras</small>
                </button>
              </div>

              <div className={styles.filtersGridCompact}>
                <input
                  type="text"
                  placeholder="Buscar usuario, correo, rol, estado o saldo..."
                  value={busquedaCredito}
                  onChange={(e) => setBusquedaCredito(e.target.value)}
                  className={styles.input}
                />
                <select value={filtroEstadoCredito} onChange={(e) => setFiltroEstadoCredito(e.target.value)} className={styles.input}>
                  <option value="todos">Todos los estados</option>
                  <option value="activo">Activo</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="bloqueado">Bloqueado</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>

              {creditosFiltrados.length === 0 ? (
                <EmptyState title="Sin créditos" text="Crea el primer saldo interno para clientes, proveedores o cuentas aprobadas." />
              ) : (
                <div className={styles.tableWrap}>
                  <table className={styles.proTable}>
                    <thead>
                      <tr>
                        <th>Usuario</th>
                        <th>Rol</th>
                        <th>Saldo</th>
                        <th>Estado</th>
                        <th>Riesgo</th>
                        <th>Fecha</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {creditosFiltrados.map((credito) => {
                        const usuarioCredito = obtenerUsuarioPorId(credito.usuario_id)
                        const saldo = Number(credito.saldo || 0)
                        const estadoCredito = normalizarTexto(credito.estado)
                        const riesgo = estadoCredito === "bloqueado" || estadoCredito === "inactivo"
                          ? "Alto"
                          : saldo <= 0
                          ? "Medio"
                          : "Controlado"

                        return (
                          <tr key={credito.id}>
                            <td>
                              <strong>{usuarioCredito?.nombre || "Usuario no encontrado"}</strong>
                              <small>{usuarioCredito?.correo || credito.usuario_id}</small>
                            </td>
                            <td><span className={styles.roleChip}>{usuarioCredito?.rol || "sin rol"}</span></td>
                            <td><strong>{formatearSoles(saldo)}</strong><small>Crédito #{credito.id.slice(0, 8)}</small></td>
                            <td><StatusBadge estado={credito.estado || "activo"} /></td>
                            <td>
                              {riesgo === "Alto" ? <span className={styles.badgeDanger}>Alto</span> : riesgo === "Medio" ? <span className={styles.badgeWarning}>Medio</span> : <span className={styles.badgeOk}>OK</span>}
                            </td>
                            <td>{fechaLegible(credito.created_at)}</td>
                            <td>
                              <div className={styles.tableActions}>
                                <button type="button" onClick={() => editarCredito(credito)} className={styles.secondaryButton}>Editar</button>
                                <button type="button" onClick={() => eliminarCredito(credito)} className={styles.dangerGhostButton}>Eliminar</button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </article>
          </div>
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

        {tabActiva !== "comprobantes" && comprobantePreview && (
          <div
            role="dialog"
            aria-modal="true"
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              background: "rgba(0, 0, 0, 0.86)",
              backdropFilter: "blur(10px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "22px",
            }}
            onClick={() => setComprobantePreview(null)}
          >
            <div
              style={{
                width: "min(1180px, 96vw)",
                maxHeight: "94vh",
                overflow: "hidden",
                border: "1px solid rgba(1, 231, 239, 0.35)",
                borderRadius: "24px",
                background: "#031316",
                boxShadow: "0 0 50px rgba(0, 251, 255, 0.18)",
                display: "grid",
                gridTemplateColumns: "minmax(0, 1.35fr) minmax(320px, 0.65fr)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ background: "#000", minHeight: "70vh", maxHeight: "94vh", overflow: "auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {comprobantePreview.url ? (
                  <img
                    src={comprobantePreview.url}
                    alt={`Comprobante ${comprobantePreview.id.slice(0, 8)}`}
                    style={{ width: "100%", height: "auto", maxHeight: "92vh", objectFit: "contain" }}
                  />
                ) : (
                  <div className={styles.reviewPlaceholderPro}>
                    <strong>Sin archivo</strong>
                    <small>No hay comprobante para mostrar.</small>
                  </div>
                )}
              </div>

              <aside style={{ padding: "24px", overflow: "auto" }}>
                <div className={styles.reviewTopline}>
                  <div>
                    <p className={styles.kicker}>Vista previa de pago</p>
                    <h4>#{comprobantePreview.id.slice(0, 8)}</h4>
                  </div>
                  <button type="button" onClick={() => setComprobantePreview(null)} className={styles.dangerGhostButton}>Cerrar</button>
                </div>

                <div className={styles.reviewAmountBox}>
                  <span>Monto declarado</span>
                  <strong>{formatearSoles(comprobantePreview.monto)}</strong>
                  <small>{comprobantePreview.metodo || "Método no definido"}</small>
                </div>

                <div className={styles.infoGrid}>
                  <span>Cliente</span><strong>{comprobantePreview.cliente}</strong>
                  <span>Correo</span><strong>{comprobantePreview.correo || "Sin correo"}</strong>
                  <span>Pedido</span><strong>{comprobantePreview.pedidoId ? `#${comprobantePreview.pedidoId.slice(0, 8)}` : "Sin pedido"}</strong>
                  <span>Fecha</span><strong>{fechaLegible(comprobantePreview.fecha)}</strong>
                  <span>Estado</span><strong>{comprobantePreview.estado}</strong>
                </div>

                <div className={styles.reviewActionsPro}>
                  {comprobantePreview.url && <a href={comprobantePreview.url} target="_blank" rel="noreferrer" className={styles.primaryButton}>Abrir en otra pestaña</a>}
                  <button type="button" onClick={() => resolverComprobantePro(comprobantePreview, "aprobado")} className={styles.successButton}>Aprobar pago</button>
                  <button type="button" onClick={() => resolverComprobantePro(comprobantePreview, "observado")} className={styles.secondaryButton}>Observar</button>
                  <button type="button" onClick={() => resolverComprobantePro(comprobantePreview, "rechazado")} className={styles.dangerButton}>Rechazar</button>
                </div>
              </aside>
            </div>
          </div>
        )}

        {pedidoAEliminar && (
          <div
            role="dialog"
            aria-modal="true"
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 10000,
              background: "rgba(0, 0, 0, 0.82)",
              backdropFilter: "blur(12px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "22px",
            }}
            onClick={() => setPedidoAEliminar(null)}
          >
            <div
              style={{
                width: "min(520px, 94vw)",
                border: "1px solid rgba(255, 111, 145, 0.35)",
                borderRadius: "24px",
                background: "linear-gradient(145deg, rgba(7, 27, 30, 0.98), rgba(49, 9, 18, 0.96))",
                boxShadow: "0 0 55px rgba(255, 111, 145, 0.2)",
                padding: "26px",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <p className={styles.kicker}>Confirmación segura</p>
              <h3 style={{ margin: "8px 0 10px", color: "#ECFFFF", fontSize: "26px" }}>Eliminar pedido #{pedidoAEliminar.id.slice(0, 8)}</h3>
              <p style={{ color: "#9BC8CB", lineHeight: 1.6, marginBottom: "18px" }}>
                Se eliminarán también sus items y comprobantes vinculados. Esta acción no se puede deshacer.
              </p>

              <div className={styles.infoGrid} style={{ marginBottom: "18px" }}>
                <span>Cliente</span><strong>{pedidoAEliminar.cliente_nombre || "Sin cliente"}</strong>
                <span>Correo</span><strong>{pedidoAEliminar.cliente_correo || "Sin correo"}</strong>
                <span>Total</span><strong>{formatearSoles(pedidoAEliminar.total)}</strong>
                <span>Estado</span><strong>{pedidoAEliminar.estado}</strong>
              </div>

              <div className={styles.reviewActionsPro}>
                <button type="button" onClick={() => setPedidoAEliminar(null)} className={styles.secondaryButton}>Cancelar</button>
                <button type="button" onClick={ejecutarEliminarPedido} className={styles.dangerButton}>Sí, eliminar pedido</button>
              </div>
            </div>
          </div>
        )}

        <AdminConfirmModal
          abierta={confirmacionAdmin.abierta}
          titulo={confirmacionAdmin.titulo}
          descripcion={confirmacionAdmin.descripcion}
          textoConfirmar={confirmacionAdmin.textoConfirmar}
          tono={confirmacionAdmin.tono}
          onCancelar={cerrarConfirmacionAdmin}
          onConfirmar={ejecutarConfirmacionAdmin}
        />
      </section>
    </main>
  )
}


function AdminConfirmModal({
  abierta,
  titulo,
  descripcion,
  textoConfirmar,
  tono,
  onCancelar,
  onConfirmar,
}: {
  abierta: boolean
  titulo: string
  descripcion: string
  textoConfirmar: string
  tono: "danger" | "success" | "warning"
  onCancelar: () => void
  onConfirmar: () => void
}) {
  if (!abierta) return null

  const esDanger = tono === "danger"
  const esSuccess = tono === "success"

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10001,
        background: "rgba(0, 0, 0, 0.84)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "22px",
      }}
      onClick={onCancelar}
    >
      <div
        style={{
          width: "min(520px, 94vw)",
          border: esDanger
            ? "1px solid rgba(255, 111, 145, 0.35)"
            : esSuccess
            ? "1px solid rgba(124, 255, 178, 0.34)"
            : "1px solid rgba(255, 224, 130, 0.34)",
          borderRadius: "24px",
          background: esDanger
            ? "linear-gradient(145deg, rgba(7, 27, 30, 0.98), rgba(49, 9, 18, 0.96))"
            : esSuccess
            ? "linear-gradient(145deg, rgba(7, 27, 30, 0.98), rgba(8, 42, 27, 0.96))"
            : "linear-gradient(145deg, rgba(7, 27, 30, 0.98), rgba(45, 34, 9, 0.96))",
          boxShadow: esDanger
            ? "0 0 55px rgba(255, 111, 145, 0.2)"
            : esSuccess
            ? "0 0 55px rgba(124, 255, 178, 0.16)"
            : "0 0 55px rgba(255, 224, 130, 0.14)",
          padding: "26px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className={styles.kicker}>{esDanger ? "Confirmación segura" : "Acción administrativa"}</p>
        <h3 style={{ margin: "8px 0 10px", color: "#ECFFFF", fontSize: "26px", lineHeight: 1.08 }}>{titulo}</h3>
        <p style={{ color: "#9BC8CB", lineHeight: 1.6, marginBottom: "18px" }}>{descripcion}</p>

        <div className={styles.reviewActionsPro}>
          <button type="button" onClick={onCancelar} className={styles.secondaryButton}>Cancelar</button>
          <button
            type="button"
            onClick={onConfirmar}
            className={esDanger ? styles.dangerButton : esSuccess ? styles.successButton : styles.primaryButton}
          >
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
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
