"use client"

import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

type UsuarioAdmin = {
  id: string
  nombre: string
  correo: string
  rol: string
  estado: string
}

type EstadoCuenta = "activo" | "vencido" | "suspendido" | "bloqueado"

type SoporteCliente = {
  id: string
  nombre: string
  celular: string | null
  correo_cliente: string | null
  plataforma: string
  correo_asignado: string
  pin_acceso: string | null
  fecha_inicio: string
  fecha_vencimiento: string
  estado: EstadoCuenta
  telegram_chat_id: string | null
  notas: string | null
  creado_por: string | null
  created_at: string
  updated_at: string
}

type SoporteMensaje = {
  id: string
  correo_destino: string
  plataforma: string | null
  remitente: string | null
  asunto: string | null
  fecha_mensaje: string | null
  created_at: string | null
}

type CuentaAdmin = {
  id: string
  correo: string | null
  pin_acceso: string | null
  producto_nombre: string | null
  estado: string | null
  cliente_nombre: string | null
  cliente_correo: string | null
  cliente_inicio: string | null
  cliente_fin: string | null
  updated_at?: string | null
}

const ENLACE_CODIGOS = "https://jonasstream.xyz/codigos"

const PLATAFORMAS = [
  "Netflix",
  "Disney Estandar",
  "Disney Premium",
  "Prime Video",
  "Max",
  "Paramount+",
  "Crunchyroll",
  "Vix Premium",
  "Rakuten Viki",
  "Apple TV",
  "Apple TV + MLS",
  "Plex",
  "Universal",
  "IPTV",
  "Flujo TV",
  "DGO",
  "Movistar",
  "L1 Max",
  "Spotify",
  "Tidal",
  "Deezer",
  "Apple Music",
  "YouTube Premium",
  "Canva",
  "Surfshark",
  "Hola VPN",
  "Otro",
]

const PALETA_PLATAFORMAS: Record<
  string,
  { fondo: string; borde: string; texto: string; brillo: string }
> = {
  netflix: {
    fondo: "rgba(229, 9, 20, 0.14)",
    borde: "rgba(229, 9, 20, 0.70)",
    texto: "#e50914",
    brillo: "rgba(229, 9, 20, 0.28)",
  },
  "disney estandar": {
    fondo: "rgba(0, 32, 98, 0.34)",
    borde: "#002062",
    texto: "#7FA6FF",
    brillo: "rgba(0, 32, 98, 0.36)",
  },
  "disney premium": {
    fondo: "rgba(0, 178, 187, 0.16)",
    borde: "rgba(0, 178, 187, 0.72)",
    texto: "#00b2bb",
    brillo: "rgba(0, 178, 187, 0.26)",
  },
  "prime video": {
    fondo: "rgba(0, 122, 255, 0.16)",
    borde: "rgba(0, 122, 255, 0.72)",
    texto: "#007aff",
    brillo: "rgba(0, 122, 255, 0.28)",
  },
  max: {
    fondo: "rgba(0, 39, 239, 0.18)",
    borde: "#0027ef",
    texto: "#4D6DFF",
    brillo: "rgba(0, 39, 239, 0.32)",
  },
  "paramount+": {
    fondo: "rgba(0, 104, 255, 0.16)",
    borde: "rgba(0, 104, 255, 0.72)",
    texto: "#0068ff",
    brillo: "rgba(0, 104, 255, 0.28)",
  },
  crunchyroll: {
    fondo: "rgba(255, 88, 0, 0.16)",
    borde: "rgba(255, 88, 0, 0.76)",
    texto: "#ff5800",
    brillo: "rgba(255, 88, 0, 0.30)",
  },
  "vix premium": {
    fondo: "rgba(255, 88, 0, 0.16)",
    borde: "rgba(255, 88, 0, 0.76)",
    texto: "#ff5800",
    brillo: "rgba(255, 88, 0, 0.30)",
  },
  "rakuten viki": {
    fondo: "rgba(0, 157, 255, 0.16)",
    borde: "rgba(0, 157, 255, 0.72)",
    texto: "#009dff",
    brillo: "rgba(0, 157, 255, 0.28)",
  },
  "apple tv": {
    fondo: "rgba(156, 163, 175, 0.14)",
    borde: "rgba(156, 163, 175, 0.72)",
    texto: "#9ca3af",
    brillo: "rgba(156, 163, 175, 0.22)",
  },
  "apple tv + mls": {
    fondo: "rgba(255, 31, 31, 0.16)",
    borde: "rgba(255, 31, 31, 0.76)",
    texto: "#ff1f1f",
    brillo: "rgba(255, 31, 31, 0.30)",
  },
  plex: {
    fondo: "rgba(254, 177, 0, 0.16)",
    borde: "rgba(254, 177, 0, 0.76)",
    texto: "#feb100",
    brillo: "rgba(254, 177, 0, 0.30)",
  },
  universal: {
    fondo: "rgba(255, 255, 0, 0.13)",
    borde: "rgba(255, 255, 0, 0.70)",
    texto: "#ffff00",
    brillo: "rgba(255, 255, 0, 0.26)",
  },
  iptv: {
    fondo: "rgba(84, 64, 235, 0.18)",
    borde: "rgba(84, 64, 235, 0.76)",
    texto: "#5440eb",
    brillo: "rgba(84, 64, 235, 0.32)",
  },
  "flujo tv": {
    fondo: "rgba(255, 98, 36, 0.16)",
    borde: "rgba(255, 98, 36, 0.76)",
    texto: "#ff6224",
    brillo: "rgba(255, 98, 36, 0.30)",
  },
  dgo: {
    fondo: "rgba(0, 176, 242, 0.16)",
    borde: "rgba(0, 176, 242, 0.72)",
    texto: "#00b0f2",
    brillo: "rgba(0, 176, 242, 0.28)",
  },
  movistar: {
    fondo: "rgba(126, 217, 87, 0.16)",
    borde: "rgba(126, 217, 87, 0.72)",
    texto: "#7ed957",
    brillo: "rgba(126, 217, 87, 0.28)",
  },
  "l1 max": {
    fondo: "rgba(255, 31, 31, 0.16)",
    borde: "rgba(255, 31, 31, 0.76)",
    texto: "#ff1f1f",
    brillo: "rgba(255, 31, 31, 0.30)",
  },
  spotify: {
    fondo: "rgba(29, 185, 84, 0.16)",
    borde: "rgba(29, 185, 84, 0.72)",
    texto: "#1db954",
    brillo: "rgba(29, 185, 84, 0.28)",
  },
  tidal: {
    fondo: "rgba(156, 163, 175, 0.14)",
    borde: "rgba(156, 163, 175, 0.72)",
    texto: "#9ca3af",
    brillo: "rgba(156, 163, 175, 0.22)",
  },
  deezer: {
    fondo: "rgba(255, 79, 184, 0.16)",
    borde: "rgba(255, 79, 184, 0.72)",
    texto: "#ff4fb8",
    brillo: "rgba(255, 79, 184, 0.30)",
  },
  "apple music": {
    fondo: "rgba(250, 87, 193, 0.16)",
    borde: "rgba(250, 87, 193, 0.72)",
    texto: "#fa57c1",
    brillo: "rgba(250, 87, 193, 0.30)",
  },
  "youtube premium": {
    fondo: "rgba(255, 0, 0, 0.16)",
    borde: "rgba(255, 0, 0, 0.72)",
    texto: "#ff0000",
    brillo: "rgba(255, 0, 0, 0.30)",
  },
  canva: {
    fondo: "rgba(0, 196, 204, 0.16)",
    borde: "rgba(0, 196, 204, 0.72)",
    texto: "#00c4cc",
    brillo: "rgba(0, 196, 204, 0.28)",
  },
  surfshark: {
    fondo: "rgba(100, 245, 210, 0.14)",
    borde: "rgba(100, 245, 210, 0.72)",
    texto: "#64f5d2",
    brillo: "rgba(100, 245, 210, 0.26)",
  },
  "hola vpn": {
    fondo: "rgba(255, 122, 0, 0.16)",
    borde: "rgba(255, 122, 0, 0.76)",
    texto: "#ff7a00",
    brillo: "rgba(255, 122, 0, 0.30)",
  },
  otro: {
    fondo: "rgba(155, 200, 203, 0.10)",
    borde: "rgba(1, 231, 239, 0.18)",
    texto: "#9BC8CB",
    brillo: "rgba(1, 231, 239, 0.12)",
  },
}


const normalizarPlataforma = (valor: string | null | undefined) => {
  const texto = String(valor || "otro").trim().toLowerCase()

  if (texto.includes("netflix")) return "netflix"
  if (texto.includes("disney") && texto.includes("premium")) return "disney premium"
  if (texto.includes("disney")) return "disney estandar"
  if (texto.includes("prime") || texto.includes("amazon")) return "prime video"
  if (texto.includes("paramount")) return "paramount+"
  if (texto.includes("crunchy")) return "crunchyroll"
  if (texto.includes("vix")) return "vix premium"
  if (texto.includes("l1")) return "l1 max"
  if (texto.includes("max") || texto.includes("hbo")) return "max"
  if (texto.includes("rakuten") || texto.includes("viki")) return "rakuten viki"
  if (texto.includes("apple") && texto.includes("mls")) return "apple tv + mls"
  if (texto.includes("apple") && (texto.includes("music") || texto.includes("música") || texto.includes("musica"))) return "apple music"
  if (texto.includes("apple")) return "apple tv"
  if (texto.includes("plex")) return "plex"
  if (texto.includes("universal")) return "universal"
  if (texto.includes("iptv")) return "iptv"
  if (texto.includes("flujo")) return "flujo tv"
  if (texto.includes("dgo")) return "dgo"
  if (texto.includes("movistar")) return "movistar"
  if (texto.includes("spotify")) return "spotify"
  if (texto.includes("tidal")) return "tidal"
  if (texto.includes("deezer")) return "deezer"
  if (texto.includes("youtube")) return "youtube premium"
  if (texto.includes("canva")) return "canva"
  if (texto.includes("surfshark")) return "surfshark"
  if (texto.includes("hola")) return "hola vpn"

  return "otro"
}


const obtenerPaletaPlataforma = (plataforma: string | null | undefined) => {
  const clave = normalizarPlataforma(plataforma)
  return PALETA_PLATAFORMAS[clave] || PALETA_PLATAFORMAS.otro
}

const estiloChipPlataforma = (plataforma: string | null | undefined): CSSProperties => {
  const paleta = obtenerPaletaPlataforma(plataforma)

  return {
    display: "inline-flex",
    alignItems: "center",
    width: "fit-content",
    border: `1px solid ${paleta.borde}`,
    background: `linear-gradient(135deg, ${paleta.fondo}, rgba(3, 19, 22, 0.78))`,
    color: paleta.texto,
    borderRadius: "999px",
    padding: "7px 11px",
    fontSize: "12px",
    fontWeight: 950,
    boxShadow: `0 0 18px ${paleta.brillo}`,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  }
}

const estiloCardPlataforma = (plataforma: string | null | undefined): CSSProperties => {
  const paleta = obtenerPaletaPlataforma(plataforma)

  return {
    border: `1px solid ${paleta.borde}`,
    background: `linear-gradient(90deg, ${paleta.fondo} 0%, rgba(3, 19, 22, 0.88) 24%, rgba(0, 0, 0, 0.22) 100%)`,
    boxShadow: `0 0 24px ${paleta.brillo}`,
  }
}


const hoyISO = () => new Date().toISOString().slice(0, 10)

const sumarDiasISO = (dias: number, base = new Date()) => {
  const fecha = new Date(base)
  fecha.setDate(fecha.getDate() + dias)
  return fecha.toISOString().slice(0, 10)
}

const generarPin = () => {
  return String(Math.floor(100000 + Math.random() * 900000))
}

const diasRestantes = (fecha: string) => {
  const fin = new Date(`${fecha}T00:00:00`)
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  fin.setHours(0, 0, 0, 0)
  return Math.ceil((fin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
}

const crearFormInicial = () => ({
  nombre: "",
  celular: "",
  correo_cliente: "",
  plataforma: "Netflix",
  correo_asignado: "",
  pin_acceso: generarPin(),
  fecha_inicio: hoyISO(),
  fecha_vencimiento: sumarDiasISO(30),
  estado: "activo" as EstadoCuenta,
  telegram_chat_id: "",
  notas: "",
})

const normalizarEstadoCuentaAdmin = (estado: string | null | undefined) => {
  return String(estado || "").trim().toLowerCase()
}

const cuentaAdminDebeSincronizar = (cuenta: CuentaAdmin) => {
  const correo = String(cuenta.correo || "").trim().toLowerCase()
  const estado = normalizarEstadoCuentaAdmin(cuenta.estado)

  if (!correo.endsWith("@jonasstream.xyz")) return false

  return [
    "asignada",
    "asignado",
    "activa",
    "activo",
    "vendida",
    "vendido",
    "entregada",
    "entregado",
    "vencida",
    "vencido",
    "bloqueada",
    "bloqueado",
    "suspendida",
    "suspendido",
    "mantenimiento",
  ].includes(estado)
}

const estadoSoporteDesdeCuentaAdmin = (cuenta: CuentaAdmin): EstadoCuenta => {
  const estado = normalizarEstadoCuentaAdmin(cuenta.estado)

  if (estado.includes("bloque")) return "bloqueado"
  if (estado.includes("suspend") || estado.includes("mantenimiento")) return "suspendido"
  if (estado.includes("venc")) return "vencido"

  const fechaFin = cuenta.cliente_fin || null

  if (fechaFin) {
    const fecha = new Date(`${fechaFin}T00:00:00`)
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    if (!Number.isNaN(fecha.getTime()) && fecha.getTime() < hoy.getTime()) {
      return "vencido"
    }
  }

  return "activo"
}

const construirPayloadSoporteDesdeCuentaAdmin = (
  cuenta: CuentaAdmin,
  usuarioId: string | null | undefined
) => {
  const correo = String(cuenta.correo || "").trim().toLowerCase()

  return {
    nombre: cuenta.cliente_nombre || correo,
    celular: null,
    correo_cliente: cuenta.cliente_correo || null,
    plataforma: cuenta.producto_nombre || detectarPlataformaPorCorreo(correo),
    correo_asignado: correo,
    pin_acceso: cuenta.pin_acceso || generarPin(),
    fecha_inicio: cuenta.cliente_inicio || hoyISO(),
    fecha_vencimiento: cuenta.cliente_fin || sumarDiasISO(30),
    estado: estadoSoporteDesdeCuentaAdmin(cuenta),
    telegram_chat_id: null,
    notas: "Sincronizado desde Admin → Cuentas.",
    creado_por: usuarioId || null,
    updated_at: new Date().toISOString(),
  }
}

const detectarPlataformaPorCorreo = (correo: string) => {
  const texto = correo.toLowerCase()

  if (texto.includes("netflix")) return "Netflix"
  if (texto.includes("disney") && texto.includes("premium")) return "Disney Premium"
  if (texto.includes("disney")) return "Disney Estandar"
  if (texto.includes("prime") || texto.includes("amazon")) return "Prime Video"
  if (texto.includes("paramount")) return "Paramount+"
  if (texto.includes("crunchy") || texto.includes("crunchyroll")) return "Crunchyroll"
  if (texto.includes("vix")) return "Vix Premium"
  if (texto.includes("l1")) return "L1 Max"
  if (texto.includes("max") || texto.includes("hbo")) return "Max"
  if (texto.includes("viki") || texto.includes("rakuten")) return "Rakuten Viki"
  if (texto.includes("apple") && texto.includes("mls")) return "Apple TV + MLS"
  if (texto.includes("apple") && (texto.includes("music") || texto.includes("musica") || texto.includes("música"))) return "Apple Music"
  if (texto.includes("apple") || texto.includes("appletv")) return "Apple TV"
  if (texto.includes("plex")) return "Plex"
  if (texto.includes("universal")) return "Universal"
  if (texto.includes("iptv")) return "IPTV"
  if (texto.includes("flujo")) return "Flujo TV"
  if (texto.includes("dgo")) return "DGO"
  if (texto.includes("movistar")) return "Movistar"
  if (texto.includes("spotify")) return "Spotify"
  if (texto.includes("youtube")) return "YouTube Premium"
  if (texto.includes("deezer")) return "Deezer"
  if (texto.includes("tidal")) return "Tidal"
  if (texto.includes("canva")) return "Canva"
  if (texto.includes("surfshark")) return "Surfshark"
  if (texto.includes("hola")) return "Hola VPN"

  return "Otro"
}


const extraerCorreosJonas = (texto: string) => {
  const encontrados =
    texto.match(/[a-zA-Z0-9._%+\-]+@jonasstream\.xyz/gi) || []

  return Array.from(
    new Set(encontrados.map((correo) => correo.trim().toLowerCase()))
  )
}


const limpiarCampoCSV = (valor: string | number | null | undefined) => {
  const texto = String(valor ?? "").replace(/\r?\n|\r/g, " ").trim()
  return `"${texto.replace(/"/g, '""')}"`
}

const descargarArchivoCSV = (nombreArchivo: string, contenido: string) => {
  const blob = new Blob(["\ufeff" + contenido], {
    type: "text/csv;charset=utf-8;",
  })

  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = nombreArchivo
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const nombreArchivoCSV = () => {
  const fecha = new Date().toISOString().slice(0, 10)
  return `jonas-stream-correos-pin-${fecha}.csv`
}

const partirEnBloques = <T,>(array: T[], size: number) => {
  const bloques: T[][] = []

  for (let i = 0; i < array.length; i += size) {
    bloques.push(array.slice(i, i + size))
  }

  return bloques
}

export default function SoporteDashboardPage() {
  const router = useRouter()

  const [verificando, setVerificando] = useState(true)
  const [usuario, setUsuario] = useState<UsuarioAdmin | null>(null)
  const [cuentas, setCuentas] = useState<SoporteCliente[]>([])
  const [mensajesRecientes, setMensajesRecientes] = useState<SoporteMensaje[]>([])
  const [cargandoCuentas, setCargandoCuentas] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [busqueda, setBusqueda] = useState("")
  const [filtroEstado, setFiltroEstado] = useState("todos")
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [form, setForm] = useState(crearFormInicial)
  const [mensaje, setMensaje] = useState("")
  const [correosMasivos, setCorreosMasivos] = useState("")
  const [importandoMasivo, setImportandoMasivo] = useState(false)
  const [resultadoMasivo, setResultadoMasivo] = useState("")
  const [sincronizandoAdmin, setSincronizandoAdmin] = useState(false)
  const [anchoPantalla, setAnchoPantalla] = useState(1200)

  useEffect(() => {
    const actualizarAncho = () => {
      setAnchoPantalla(window.innerWidth)
    }

    actualizarAncho()
    window.addEventListener("resize", actualizarAncho)

    return () => {
      window.removeEventListener("resize", actualizarAncho)
    }
  }, [])

  const esMovil = anchoPantalla < 760
  const esTablet = anchoPantalla >= 760 && anchoPantalla < 1120

  useEffect(() => {
    const validarAcceso = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error || !user) {
        router.replace("/soporte-panel")
        return
      }

      const { data: usuarioDB, error: errorUsuario } = await supabase
        .from("usuarios")
        .select("id,nombre,correo,rol,estado")
        .eq("id", user.id)
        .single()

      if (
        errorUsuario ||
        !usuarioDB ||
        usuarioDB.rol !== "admin" ||
        (usuarioDB.estado !== "aprobado" && usuarioDB.estado !== "activo")
      ) {
        await supabase.auth.signOut()
        router.replace("/soporte-panel")
        return
      }

      setUsuario(usuarioDB as UsuarioAdmin)
      setVerificando(false)
      await cargarDatos()
    }

    validarAcceso()
  }, [router])

  const cargarDatos = async () => {
    setCargandoCuentas(true)

    const [cuentasRes, mensajesRes] = await Promise.all([
      supabase
        .from("soporte_clientes")
        .select("*")
        .order("created_at", { ascending: false }),

      supabase
        .from("soporte_mensajes")
        .select("id,correo_destino,plataforma,remitente,asunto,fecha_mensaje,created_at")
        .order("fecha_mensaje", { ascending: false })
        .limit(2000),
    ])

    if (cuentasRes.error) {
      setMensaje("No se pudieron cargar los correos registrados.")
      setCargandoCuentas(false)
      return
    }

    if (mensajesRes.error) {
      setMensaje("Se cargaron los correos, pero no se pudieron cargar los mensajes recientes.")
    }

    setCuentas((cuentasRes.data || []) as SoporteCliente[])
    setMensajesRecientes((mensajesRes.data || []) as SoporteMensaje[])
    setCargandoCuentas(false)
  }

  const sincronizarDesdeCuentasAdmin = async () => {
    setMensaje("")
    setSincronizandoAdmin(true)

    const { data: cuentasAdmin, error: errorCuentasAdmin } = await supabase
      .from("cuentas")
      .select(
        "id,correo,pin_acceso,producto_nombre,estado,cliente_nombre,cliente_correo,cliente_inicio,cliente_fin,updated_at"
      )
      .not("correo", "is", null)
      .order("updated_at", { ascending: false })
      .limit(2500)

    if (errorCuentasAdmin) {
      setMensaje("No se pudo leer Admin → Cuentas. Revisa permisos o columnas de la tabla cuentas.")
      setSincronizandoAdmin(false)
      return
    }

    const payloads = ((cuentasAdmin || []) as CuentaAdmin[])
      .filter(cuentaAdminDebeSincronizar)
      .map((cuenta) => construirPayloadSoporteDesdeCuentaAdmin(cuenta, usuario?.id))

    if (payloads.length === 0) {
      setMensaje("No hay cuentas asignadas en Admin para sincronizar con soporte.")
      setSincronizandoAdmin(false)
      return
    }

    const existentes = new Map(
      cuentas.map((cuenta) => [cuenta.correo_asignado.toLowerCase(), cuenta])
    )

    let insertados = 0
    let actualizados = 0

    for (const payload of payloads) {
      const existente = existentes.get(payload.correo_asignado.toLowerCase())

      if (existente) {
        const { error } = await supabase
          .from("soporte_clientes")
          .update(payload)
          .eq("id", existente.id)

        if (error) {
          setMensaje(`Error sincronizando ${payload.correo_asignado}. Revisa columnas de soporte_clientes.`)
          setSincronizandoAdmin(false)
          await cargarDatos()
          return
        }

        actualizados += 1
      } else {
        const { error } = await supabase.from("soporte_clientes").insert([payload])

        if (error) {
          setMensaje(`Error insertando ${payload.correo_asignado}. Revisa si ya existe duplicado en soporte_clientes.`)
          setSincronizandoAdmin(false)
          await cargarDatos()
          return
        }

        insertados += 1
      }
    }

    setMensaje(
      `Sincronización completa desde Admin: ${actualizados} actualizado(s) y ${insertados} nuevo(s).`
    )
    setSincronizandoAdmin(false)
    await cargarDatos()
  }

  const cerrarSesion = async () => {
    await supabase.auth.signOut()
    router.replace("/soporte-panel")
  }

  const limpiarFormulario = () => {
    setForm(crearFormInicial())
    setEditandoId(null)
    setMensaje("")
  }

  const guardarCuenta = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMensaje("")

    const correoAsignado = form.correo_asignado.trim().toLowerCase()
    const pin = form.pin_acceso.trim()

    if (!form.plataforma.trim()) {
      setMensaje("Selecciona la plataforma.")
      return
    }

    if (!correoAsignado) {
      setMensaje("Completa el correo asignado.")
      return
    }

    if (!correoAsignado.includes("@jonasstream.xyz")) {
      setMensaje("El correo asignado debe ser del dominio jonasstream.xyz.")
      return
    }

    if (!pin || pin.length < 4) {
      setMensaje("Coloca un PIN de acceso válido.")
      return
    }

    if (!form.fecha_vencimiento) {
      setMensaje("Completa la fecha de vencimiento.")
      return
    }

    setGuardando(true)

    const payload = {
      nombre: form.nombre.trim() || correoAsignado,
      celular: form.celular.trim() || null,
      correo_cliente: form.correo_cliente.trim() || null,
      plataforma: form.plataforma.trim(),
      correo_asignado: correoAsignado,
      pin_acceso: pin,
      fecha_inicio: form.fecha_inicio,
      fecha_vencimiento: form.fecha_vencimiento,
      estado: form.estado,
      telegram_chat_id: form.telegram_chat_id.trim() || null,
      notas: form.notas.trim() || null,
      creado_por: usuario?.id || null,
      updated_at: new Date().toISOString(),
    }

    if (editandoId) {
      const { error } = await supabase
        .from("soporte_clientes")
        .update(payload)
        .eq("id", editandoId)

      if (error) {
        setMensaje("No se pudo actualizar el correo. Revisa si el PIN existe en Supabase.")
        setGuardando(false)
        return
      }

      setMensaje("Correo actualizado correctamente.")
    } else {
      const { error } = await supabase.from("soporte_clientes").insert([payload])

      if (error) {
        setMensaje("No se pudo registrar el correo. Revisa si ya existe o si falta la columna pin_acceso.")
        setGuardando(false)
        return
      }

      setMensaje("Correo registrado correctamente.")
    }

    setGuardando(false)
    limpiarFormulario()
    await cargarDatos()
  }

  const importarCorreosMasivamente = async () => {
    setMensaje("")
    setResultadoMasivo("")

    const correosDetectados = extraerCorreosJonas(correosMasivos)

    if (correosDetectados.length === 0) {
      setResultadoMasivo("No se detectaron correos válidos de jonasstream.xyz.")
      return
    }

    const existentes = new Set(
      cuentas.map((cuenta) => cuenta.correo_asignado.toLowerCase())
    )

    const correosNuevos = correosDetectados.filter(
      (correo) => !existentes.has(correo)
    )

    const omitidos = correosDetectados.length - correosNuevos.length

    if (correosNuevos.length === 0) {
      setResultadoMasivo(
        `No se importó nada. Los ${correosDetectados.length} correo(s) ya estaban registrados.`
      )
      return
    }

    const confirmar = window.confirm(
      `Se importarán ${correosNuevos.length} correo(s) nuevos.\n\nSe generará PIN automático y estado activo.\n\n¿Continuar?`
    )

    if (!confirmar) return

    setImportandoMasivo(true)

    const fechaInicio = hoyISO()
    const fechaVencimiento = sumarDiasISO(30)

    const payloads = correosNuevos.map((correo) => ({
      nombre: correo,
      celular: null,
      correo_cliente: null,
      plataforma: detectarPlataformaPorCorreo(correo),
      correo_asignado: correo,
      pin_acceso: generarPin(),
      fecha_inicio: fechaInicio,
      fecha_vencimiento: fechaVencimiento,
      estado: "activo" as EstadoCuenta,
      telegram_chat_id: null,
      notas: "Importado masivamente desde dashboard.",
      creado_por: usuario?.id || null,
      updated_at: new Date().toISOString(),
    }))

    const bloques = partirEnBloques(payloads, 100)
    let insertados = 0

    for (const bloque of bloques) {
      const { error } = await supabase.from("soporte_clientes").insert(bloque)

      if (error) {
        setResultadoMasivo(
          `Error al importar. Se insertaron ${insertados} antes del error. Revisa si hay correos duplicados o restricciones en Supabase.`
        )
        setImportandoMasivo(false)
        await cargarDatos()
        return
      }

      insertados += bloque.length
    }

    setResultadoMasivo(
      `Importación completa: ${insertados} correo(s) registrados. Omitidos por ya existir: ${omitidos}.`
    )

    setCorreosMasivos("")
    setImportandoMasivo(false)
    await cargarDatos()
  }

  const editarCuenta = (cuenta: SoporteCliente) => {
    setEditandoId(cuenta.id)
    setForm({
      nombre: cuenta.nombre || "",
      celular: cuenta.celular || "",
      correo_cliente: cuenta.correo_cliente || "",
      plataforma: cuenta.plataforma || "Netflix",
      correo_asignado: cuenta.correo_asignado || "",
      pin_acceso: cuenta.pin_acceso || "",
      fecha_inicio: cuenta.fecha_inicio || hoyISO(),
      fecha_vencimiento: cuenta.fecha_vencimiento || sumarDiasISO(30),
      estado: cuenta.estado || "activo",
      telegram_chat_id: cuenta.telegram_chat_id || "",
      notas: cuenta.notas || "",
    })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const cambiarEstado = async (cuenta: SoporteCliente, nuevoEstado: EstadoCuenta) => {
    const { error } = await supabase
      .from("soporte_clientes")
      .update({
        estado: nuevoEstado,
        updated_at: new Date().toISOString(),
      })
      .eq("id", cuenta.id)

    if (error) {
      setMensaje("No se pudo cambiar el estado.")
      return
    }

    setMensaje(`Estado actualizado a ${nuevoEstado}.`)
    await cargarDatos()
  }

  const generarNuevoPin = async (cuenta: SoporteCliente) => {
    const nuevoPin = generarPin()

    const confirmar = window.confirm(
      `¿Generar nuevo PIN para ${cuenta.correo_asignado}?\n\nNuevo PIN: ${nuevoPin}`
    )

    if (!confirmar) return

    const { error } = await supabase
      .from("soporte_clientes")
      .update({
        pin_acceso: nuevoPin,
        updated_at: new Date().toISOString(),
      })
      .eq("id", cuenta.id)

    if (error) {
      setMensaje("No se pudo generar el nuevo PIN.")
      return
    }

    setMensaje(`Nuevo PIN generado para ${cuenta.correo_asignado}: ${nuevoPin}`)
    await cargarDatos()
  }

  const editarPinRapido = async (cuenta: SoporteCliente) => {
    const nuevoPin = window.prompt(
      `Nuevo PIN para ${cuenta.correo_asignado}:`,
      cuenta.pin_acceso || ""
    )

    if (nuevoPin === null) return

    const pinLimpio = nuevoPin.trim()

    if (!pinLimpio || pinLimpio.length < 4) {
      setMensaje("El PIN debe tener al menos 4 caracteres.")
      return
    }

    const { error } = await supabase
      .from("soporte_clientes")
      .update({
        pin_acceso: pinLimpio,
        updated_at: new Date().toISOString(),
      })
      .eq("id", cuenta.id)

    if (error) {
      setMensaje("No se pudo actualizar el PIN.")
      return
    }

    setMensaje(`PIN actualizado para ${cuenta.correo_asignado}.`)
    await cargarDatos()
  }

  const renovarCuenta = async (cuenta: SoporteCliente) => {
    const fechaActual = new Date(`${cuenta.fecha_vencimiento}T00:00:00`)
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    const base = fechaActual > hoy ? fechaActual : hoy
    const nuevaFecha = sumarDiasISO(30, base)

    const { error } = await supabase
      .from("soporte_clientes")
      .update({
        estado: "activo",
        fecha_vencimiento: nuevaFecha,
        updated_at: new Date().toISOString(),
      })
      .eq("id", cuenta.id)

    if (error) {
      setMensaje("No se pudo renovar la cuenta.")
      return
    }

    setMensaje(`Cuenta renovada hasta ${nuevaFecha}.`)
    await cargarDatos()
  }

  const eliminarCuenta = async (cuenta: SoporteCliente) => {
    const confirmar = window.confirm(
      `¿Eliminar ${cuenta.correo_asignado}? Esta acción no se puede deshacer.`
    )

    if (!confirmar) return

    const { error } = await supabase
      .from("soporte_clientes")
      .delete()
      .eq("id", cuenta.id)

    if (error) {
      setMensaje("No se pudo eliminar el correo.")
      return
    }

    setMensaje("Correo eliminado correctamente.")
    await cargarDatos()
  }

  const actualizarVencidos = async () => {
    const hoy = hoyISO()

    const vencidos = cuentas.filter(
      (cuenta) => cuenta.estado === "activo" && cuenta.fecha_vencimiento < hoy
    )

    if (vencidos.length === 0) {
      setMensaje("No hay correos vencidos por actualizar.")
      return
    }

    const ids = vencidos.map((cuenta) => cuenta.id)

    const { error } = await supabase
      .from("soporte_clientes")
      .update({
        estado: "vencido",
        updated_at: new Date().toISOString(),
      })
      .in("id", ids)

    if (error) {
      setMensaje("No se pudieron actualizar los vencidos.")
      return
    }

    setMensaje(`${vencidos.length} correo(s) marcados como vencidos.`)
    await cargarDatos()
  }

  const copiarAcceso = async (cuenta: SoporteCliente) => {
    const texto = `Acceso a códigos JONAS STREAM

Ingresa aquí:
${ENLACE_CODIGOS}

Correo asignado:
${cuenta.correo_asignado}

PIN:
${cuenta.pin_acceso || "SIN PIN"}

Tu entretenimiento, sin complicaciones.`

    try {
      await navigator.clipboard.writeText(texto)
      setMensaje(`Acceso copiado para ${cuenta.correo_asignado}.`)
    } catch {
      setMensaje("No se pudo copiar automáticamente. Copia el correo y PIN manualmente.")
    }
  }

  const abrirMensajes = (cuenta: SoporteCliente) => {
    router.push(`/soporte-panel/mensajes?correo=${encodeURIComponent(cuenta.correo_asignado)}`)
  }

  const resumenMensajes = useMemo(() => {
    const map = new Map<
      string,
      {
        total: number
        ultimoAsunto: string | null
        ultimaFecha: string | null
        remitente: string | null
      }
    >()

    for (const mensaje of mensajesRecientes) {
      const correo = String(mensaje.correo_destino || "").toLowerCase()
      if (!correo) continue

      const actual = map.get(correo)

      if (!actual) {
        map.set(correo, {
          total: 1,
          ultimoAsunto: mensaje.asunto || "Sin asunto",
          ultimaFecha: mensaje.fecha_mensaje || mensaje.created_at || null,
          remitente: mensaje.remitente || null,
        })
      } else {
        actual.total += 1
      }
    }

    return map
  }, [mensajesRecientes])

  const cuentasFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase()

    return cuentas.filter((cuenta) => {
      const texto = [
        cuenta.nombre,
        cuenta.celular,
        cuenta.correo_cliente,
        cuenta.plataforma,
        cuenta.correo_asignado,
        cuenta.pin_acceso,
        cuenta.estado,
      ]
        .join(" ")
        .toLowerCase()

      const coincideBusqueda = !q || texto.includes(q)
      const coincideEstado = filtroEstado === "todos" || cuenta.estado === filtroEstado

      return coincideBusqueda && coincideEstado
    })
  }, [cuentas, busqueda, filtroEstado])

  const resumen = useMemo(() => {
    const activos = cuentas.filter(
      (cuenta) =>
        cuenta.estado === "activo" && diasRestantes(cuenta.fecha_vencimiento) >= 0
    ).length

    const vencidos = cuentas.filter(
      (cuenta) =>
        cuenta.estado === "vencido" || diasRestantes(cuenta.fecha_vencimiento) < 0
    ).length

    const suspendidos = cuentas.filter((cuenta) => cuenta.estado === "suspendido").length

    const sinPin = cuentas.filter((cuenta) => !cuenta.pin_acceso).length

    return {
      activos,
      vencidos,
      suspendidos,
      sinPin,
      total: cuentas.length,
    }
  }, [cuentas])

  const previsualizacionImportacion = useMemo(() => {
    const correos = extraerCorreosJonas(correosMasivos)
    const existentes = new Set(
      cuentas.map((cuenta) => cuenta.correo_asignado.toLowerCase())
    )

    const nuevos = correos.filter((correo) => !existentes.has(correo))
    const repetidos = correos.length - nuevos.length

    return {
      detectados: correos.length,
      nuevos: nuevos.length,
      repetidos,
    }
  }, [correosMasivos, cuentas])


  const exportarCorreosCSV = (soloFiltrados: boolean) => {
    const base = soloFiltrados ? cuentasFiltradas : cuentas

    if (base.length === 0) {
      setMensaje("No hay correos para exportar.")
      return
    }

    const cabeceras = [
      "correo_asignado",
      "pin_acceso",
      "plataforma",
      "estado",
      "fecha_inicio",
      "fecha_vencimiento",
      "dias_restantes",
      "cliente_etiqueta",
      "whatsapp",
      "correo_cliente",
      "mensajes",
      "ultimo_asunto",
      "ultima_fecha",
      "enlace_codigos",
    ]

    const filas = base.map((cuenta) => {
      const resumenCorreo = resumenMensajes.get(
        cuenta.correo_asignado.toLowerCase()
      )
      const dias = diasRestantes(cuenta.fecha_vencimiento)

      return [
        cuenta.correo_asignado,
        cuenta.pin_acceso || "",
        cuenta.plataforma,
        cuenta.estado,
        cuenta.fecha_inicio,
        cuenta.fecha_vencimiento,
        dias,
        cuenta.nombre || "",
        cuenta.celular || "",
        cuenta.correo_cliente || "",
        resumenCorreo?.total || 0,
        resumenCorreo?.ultimoAsunto || "",
        resumenCorreo?.ultimaFecha
          ? new Date(resumenCorreo.ultimaFecha).toLocaleString("es-PE")
          : "",
        ENLACE_CODIGOS,
      ]
        .map(limpiarCampoCSV)
        .join(",")
    })

    const csv = [cabeceras.join(","), ...filas].join("\n")

    descargarArchivoCSV(nombreArchivoCSV(), csv)
    setMensaje(
      soloFiltrados
        ? `CSV descargado con ${base.length} correo(s) visibles.`
        : `CSV descargado con ${base.length} correo(s) registrados.`
    )
  }

  if (verificando) {
    return (
      <main style={stylesPage.centerPage}>
        <div style={stylesPage.loadingBox}>
          <p style={stylesPage.kicker}>JONAS STREAM</p>
          <h2 style={{ margin: "14px 0 8px" }}>Verificando acceso...</h2>
          <p style={stylesPage.muted}>Validando sesión administrativa.</p>
        </div>
      </main>
    )
  }

  return (
    <main style={{ ...stylesPage.page, ...(esMovil ? stylesPage.pageMobile : {}) }}>
      <div style={stylesPage.gridBackground} />
      <div style={stylesPage.sideTextLeft}>JONAS STREAM</div>
      <div style={stylesPage.sideTextRight}>SOPORTE</div>

      <section style={stylesPage.container}>
        <div style={{ ...stylesPage.topbar, ...(esMovil ? stylesPage.topbarMobile : {}) }}>
          <div style={stylesPage.brandBlock}>
            <div style={stylesPage.brandLogo}>JS</div>
            <div>
              <strong style={stylesPage.brandTitle}>JONAS STREAM</strong>
              <span style={stylesPage.brandSubtitle}>SOPORTE PANEL</span>
            </div>
          </div>

          <div style={{ ...stylesPage.topActions, ...(esMovil ? stylesPage.topActionsMobile : {}) }}>
            <button
              type="button"
              onClick={() => window.open(ENLACE_CODIGOS, "_blank", "noopener,noreferrer")}
              style={stylesPage.navButton}
            >
              Abrir /codigos
            </button>

            <button
              type="button"
              onClick={() => router.push("/soporte-panel/mensajes")}
              style={stylesPage.navButtonStrong}
            >
              Bandeja de mensajes
            </button>

            <button type="button" onClick={cerrarSesion} style={stylesPage.navButtonDanger}>
              Cerrar sesión
            </button>
          </div>
        </div>

        <header style={{ ...stylesPage.heroHeader, ...(esMovil ? stylesPage.heroHeaderMobile : {}) }}>
          <div style={stylesPage.heroCopy}>
            <p style={stylesPage.kicker}>CONTROL CENTRAL · ADMIN → SOPORTE</p>
            <h1 style={{ ...stylesPage.title, ...(esMovil ? stylesPage.titleMobile : {}) }}>
              Control de correos y PIN
            </h1>
            <p style={stylesPage.description}>
              Administra accesos públicos para /codigos, revisa mensajes recibidos y
              sincroniza los datos principales desde Admin → Cuentas.
            </p>
          </div>

          <div style={{ ...stylesPage.adminCard, ...(esMovil ? stylesPage.adminCardMobile : {}) }}>
            <p style={stylesPage.mutedSmall}>Administrador</p>
            <strong>{usuario?.nombre || "Admin"}</strong>
            <span style={stylesPage.smallText}>{usuario?.correo}</span>

            <div style={stylesPage.adminMiniGrid}>
              <div>
                <span style={stylesPage.smallText}>Fuente principal</span>
                <strong>Admin · Cuentas</strong>
              </div>
              <div>
                <span style={stylesPage.smallText}>Vista pública</span>
                <strong>/codigos</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={sincronizarDesdeCuentasAdmin}
              disabled={sincronizandoAdmin}
              style={stylesPage.buttonPrimaryFull}
            >
              {sincronizandoAdmin ? "Sincronizando..." : "Sincronizar desde Admin"}
            </button>
          </div>
        </header>

        <div style={{ ...stylesPage.statsGrid, ...(esMovil ? stylesPage.statsGridMobile : esTablet ? stylesPage.statsGridTablet : {}) }}>
          <StatCard label="Correos activos" value={resumen.activos} />
          <StatCard label="Correos vencidos" value={resumen.vencidos} />
          <StatCard label="Suspendidos" value={resumen.suspendidos} />
          <StatCard label="Sin PIN" value={resumen.sinPin} />
        </div>

        <div style={stylesPage.syncNotice}>
          <strong>Sincronización:</strong> si registras o editas cuentas en Admin → Cuentas,
          presiona “Sincronizar desde Admin” para reflejar correo, plataforma, PIN, cliente y fechas aquí.
          El formulario manual queda como respaldo para casos puntuales.
        </div>

        <section style={{ ...stylesPage.panel, ...(esMovil ? stylesPage.panelMobile : {}) }}>
          <div style={{ ...stylesPage.panelHeader, ...(esMovil ? stylesPage.panelHeaderMobile : {}) }}>
            <div>
              <p style={stylesPage.kicker}>RESPALDO MANUAL</p>
              <h2 style={{ margin: "10px 0" }}>
                {editandoId ? "Editar acceso manual" : "Registrar acceso manual"}
              </h2>
              <p style={stylesPage.muted}>
                Usa este formulario solo si el correo todavía no existe en Admin → Cuentas.
                Para cuentas vendidas, lo correcto es sincronizar desde Admin.
              </p>
            </div>

            <button type="button" onClick={actualizarVencidos} style={stylesPage.buttonSecondary}>
              Marcar vencidos
            </button>
          </div>

          {mensaje && <div style={stylesPage.notice}>{mensaje}</div>}

          <form onSubmit={guardarCuenta} style={{ ...stylesPage.formGrid, ...(esMovil ? stylesPage.formGridMobile : esTablet ? stylesPage.formGridTablet : {}) }}>
            <input
              style={stylesPage.input}
              placeholder="Etiqueta o cliente, opcional"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />

            <select
              style={stylesPage.input}
              value={form.plataforma}
              onChange={(e) => setForm({ ...form, plataforma: e.target.value })}
            >
              {PLATAFORMAS.map((plataforma) => (
                <option key={plataforma} value={plataforma}>
                  {plataforma}
                </option>
              ))}
            </select>

            <input
              style={stylesPage.input}
              placeholder="Correo asignado: netflix001@jonasstream.xyz"
              value={form.correo_asignado}
              onChange={(e) => setForm({ ...form, correo_asignado: e.target.value })}
            />

            <input
              style={stylesPage.input}
              placeholder="PIN de acceso"
              value={form.pin_acceso}
              onChange={(e) => setForm({ ...form, pin_acceso: e.target.value })}
            />

            <select
              style={stylesPage.input}
              value={form.estado}
              onChange={(e) =>
                setForm({
                  ...form,
                  estado: e.target.value as EstadoCuenta,
                })
              }
            >
              <option value="activo">Activo</option>
              <option value="vencido">Vencido</option>
              <option value="suspendido">Suspendido</option>
              <option value="bloqueado">Bloqueado</option>
            </select>

            <input
              style={stylesPage.input}
              type="date"
              value={form.fecha_vencimiento}
              onChange={(e) => setForm({ ...form, fecha_vencimiento: e.target.value })}
            />

            <input
              style={stylesPage.input}
              placeholder="WhatsApp del cliente, opcional"
              value={form.celular}
              onChange={(e) => setForm({ ...form, celular: e.target.value })}
            />

            <input
              style={stylesPage.input}
              placeholder="Correo personal del cliente, opcional"
              value={form.correo_cliente}
              onChange={(e) => setForm({ ...form, correo_cliente: e.target.value })}
            />

            <input
              style={stylesPage.input}
              type="date"
              value={form.fecha_inicio}
              onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })}
            />

            <input
              style={stylesPage.input}
              placeholder="Telegram Chat ID, opcional"
              value={form.telegram_chat_id}
              onChange={(e) => setForm({ ...form, telegram_chat_id: e.target.value })}
            />

            <textarea
              style={{ ...stylesPage.input, minHeight: "90px", gridColumn: "1 / -1" }}
              placeholder="Notas internas"
              value={form.notas}
              onChange={(e) => setForm({ ...form, notas: e.target.value })}
            />

            <div style={stylesPage.formActions}>
              <button type="submit" disabled={guardando} style={stylesPage.buttonPrimary}>
                {guardando
                  ? "Guardando..."
                  : editandoId
                  ? "Actualizar correo"
                  : "Registrar correo"}
              </button>

              <button
                type="button"
                onClick={() => setForm({ ...form, pin_acceso: generarPin() })}
                style={stylesPage.buttonSecondary}
              >
                Generar PIN
              </button>

              {editandoId && (
                <button type="button" onClick={limpiarFormulario} style={stylesPage.buttonSecondary}>
                  Cancelar edición
                </button>
              )}
            </div>
          </form>
        </section>

        <section style={{ ...stylesPage.panel, ...(esMovil ? stylesPage.panelMobile : {}) }}>
          <div style={{ ...stylesPage.panelHeader, ...(esMovil ? stylesPage.panelHeaderMobile : {}) }}>
            <div>
              <p style={stylesPage.kicker}>IMPORTADOR MASIVO</p>
              <h2 style={{ margin: "10px 0" }}>Registrar correos desde cPanel</h2>
              <p style={stylesPage.muted}>
                Pega aquí tus correos ya creados en cPanel. El sistema los registra
                en el dashboard con PIN automático, estado activo y vencimiento de 30 días.
              </p>
            </div>
          </div>

          <textarea
            style={{ ...stylesPage.textareaImport, ...(esMovil ? stylesPage.textareaImportMobile : {}) }}
            placeholder={`Pega tus correos aquí, uno por línea:

netflix001@jonasstream.xyz
netflix002@jonasstream.xyz
disney001@jonasstream.xyz
prime001@jonasstream.xyz
crunchy001@jonasstream.xyz`}
            value={correosMasivos}
            onChange={(e) => setCorreosMasivos(e.target.value)}
          />

          <div style={{ ...stylesPage.importSummary, ...(esMovil ? stylesPage.importSummaryMobile : {}) }}>
            <div>
              <span style={stylesPage.smallText}>Detectados</span>
              <strong>{previsualizacionImportacion.detectados}</strong>
            </div>

            <div>
              <span style={stylesPage.smallText}>Nuevos</span>
              <strong>{previsualizacionImportacion.nuevos}</strong>
            </div>

            <div>
              <span style={stylesPage.smallText}>Ya registrados</span>
              <strong>{previsualizacionImportacion.repetidos}</strong>
            </div>
          </div>

          {resultadoMasivo && <div style={stylesPage.notice}>{resultadoMasivo}</div>}

          <div style={stylesPage.formActions}>
            <button
              type="button"
              onClick={importarCorreosMasivamente}
              disabled={importandoMasivo}
              style={stylesPage.buttonPrimary}
            >
              {importandoMasivo ? "Importando..." : "Importar y generar PIN"}
            </button>

            <button
              type="button"
              onClick={() => {
                setCorreosMasivos("")
                setResultadoMasivo("")
              }}
              style={stylesPage.buttonSecondary}
            >
              Limpiar
            </button>
          </div>
        </section>

        <section style={{ ...stylesPage.panel, ...(esMovil ? stylesPage.panelMobile : {}) }}>
          <div style={{ ...stylesPage.panelHeader, ...(esMovil ? stylesPage.panelHeaderMobile : {}) }}>
            <div>
              <p style={stylesPage.kicker}>CORREOS REGISTRADOS</p>
              <h2 style={{ margin: "10px 0" }}>Lista detallada de accesos</h2>
              <p style={stylesPage.muted}>
                Vista tipo inventario: correo, plataforma, cliente, PIN, vencimiento,
                mensajes y acciones rápidas en una sola fila.
              </p>
            </div>

            <div style={{ ...stylesPage.headerActions, ...(esMovil ? stylesPage.headerActionsMobile : {}) }}>
              <button
                type="button"
                onClick={() => exportarCorreosCSV(true)}
                style={stylesPage.buttonSecondary}
              >
                Exportar visibles
              </button>

              <button
                type="button"
                onClick={() => exportarCorreosCSV(false)}
                style={stylesPage.buttonSecondary}
              >
                Exportar todo CSV
              </button>

              <button type="button" onClick={cargarDatos} style={stylesPage.buttonSecondary}>
                Actualizar
              </button>
            </div>
          </div>

          <div style={{ ...stylesPage.filters, ...(esMovil ? stylesPage.filtersMobile : {}) }}>
            <input
              style={stylesPage.input}
              placeholder="Buscar por correo, plataforma, PIN, cliente o estado..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />

            <select
              style={stylesPage.input}
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="todos">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="vencido">Vencidos</option>
              <option value="suspendido">Suspendidos</option>
              <option value="bloqueado">Bloqueados</option>
            </select>
          </div>

          {cargandoCuentas ? (
            <p style={stylesPage.muted}>Cargando correos...</p>
          ) : cuentasFiltradas.length === 0 ? (
            <p style={stylesPage.muted}>No hay correos registrados.</p>
          ) : (
            <div style={stylesPage.accessList}>
              {cuentasFiltradas.map((cuenta) => {
                const dias = diasRestantes(cuenta.fecha_vencimiento)
                const resumenCorreo = resumenMensajes.get(
                  cuenta.correo_asignado.toLowerCase()
                )

                return (
                  <article
                    key={cuenta.id}
                    style={{ ...stylesPage.accessCard, ...estiloCardPlataforma(cuenta.plataforma) }}
                  >
                    <div style={stylesPage.accessMain}>
                      <div style={stylesPage.accessTitleBlock}>
                        <span style={estiloChipPlataforma(cuenta.plataforma)}>
                          {cuenta.plataforma}
                        </span>
                        <h3 style={stylesPage.accessCorreo}>{cuenta.correo_asignado}</h3>
                        <p style={stylesPage.accessSubtext}>{cuenta.nombre || "Sin etiqueta"}</p>
                      </div>

                      <div style={stylesPage.accessMetaGrid}>
                        <div style={stylesPage.accessMetaItem}>
                          <span>PIN</span>
                          <strong style={stylesPage.pinText}>{cuenta.pin_acceso || "SIN PIN"}</strong>
                        </div>

                        <div style={stylesPage.accessMetaItem}>
                          <span>Cliente</span>
                          <strong>{cuenta.correo_cliente || "Sin cliente"}</strong>
                          {cuenta.celular && <small>WhatsApp: {cuenta.celular}</small>}
                        </div>

                        <div style={stylesPage.accessMetaItem}>
                          <span>Vencimiento</span>
                          <strong>{cuenta.fecha_vencimiento}</strong>
                          <small>
                            {dias < 0
                              ? `Vencido hace ${Math.abs(dias)} día(s)`
                              : `Faltan ${dias} día(s)`}
                          </small>
                        </div>

                        <div style={stylesPage.accessMetaItem}>
                          <span>Mensajes</span>
                          <strong>{resumenCorreo?.total || 0}</strong>
                          <small>{resumenCorreo?.ultimoAsunto || "Sin mensajes recientes"}</small>
                        </div>

                        <div style={stylesPage.accessMetaItem}>
                          <span>Estado</span>
                          <EstadoBadge estado={cuenta.estado} dias={dias} />
                        </div>
                      </div>
                    </div>

                    <div style={stylesPage.accessActions}>
                      <button type="button" onClick={() => copiarAcceso(cuenta)} style={stylesPage.buttonMini}>
                        Copiar acceso
                      </button>

                      <button type="button" onClick={() => abrirMensajes(cuenta)} style={stylesPage.buttonMiniGhost}>
                        Ver mensajes
                      </button>

                      <button type="button" onClick={() => editarPinRapido(cuenta)} style={stylesPage.buttonMiniGhost}>
                        Editar PIN
                      </button>

                      <button type="button" onClick={() => generarNuevoPin(cuenta)} style={stylesPage.buttonMiniGhost}>
                        Nuevo PIN
                      </button>

                      <button type="button" onClick={() => renovarCuenta(cuenta)} style={stylesPage.buttonMiniGhost}>
                        +30 días
                      </button>

                      <button type="button" onClick={() => editarCuenta(cuenta)} style={stylesPage.buttonMiniGhost}>
                        Editar
                      </button>

                      {cuenta.estado === "activo" ? (
                        <button type="button" onClick={() => cambiarEstado(cuenta, "suspendido")} style={stylesPage.buttonWarning}>
                          Suspender
                        </button>
                      ) : (
                        <button type="button" onClick={() => cambiarEstado(cuenta, "activo")} style={stylesPage.buttonMiniGhost}>
                          Activar
                        </button>
                      )}

                      <button type="button" onClick={() => eliminarCuenta(cuenta)} style={stylesPage.buttonDanger}>
                        Eliminar
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </section>
    </main>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div style={stylesPage.statCard}>
      <p style={{ color: "#9BC8CB", margin: 0 }}>{label}</p>
      <strong style={stylesPage.statValue}>{value}</strong>
    </div>
  )
}

function EstadoBadge({ estado, dias }: { estado: EstadoCuenta; dias: number }) {
  const vencidoPorFecha = dias < 0

  const color =
    estado === "activo" && !vencidoPorFecha
      ? "#00FBFF"
      : estado === "vencido" || vencidoPorFecha
      ? "#ff5252"
      : estado === "suspendido"
      ? "#ffcc66"
      : "#9BC8CB"

  return (
    <span
      style={{
        display: "inline-flex",
        padding: "7px 11px",
        borderRadius: "999px",
        border: `1px solid ${color}`,
        color,
        fontSize: "12px",
        fontWeight: 900,
        textTransform: "uppercase",
      }}
    >
      {vencidoPorFecha && estado === "activo" ? "vencido" : estado}
    </span>
  )
}

const stylesPage: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    position: "relative",
    overflowX: "hidden",
    background:
      "radial-gradient(circle at 12% 12%, rgba(1, 231, 239, 0.18), transparent 35%), radial-gradient(circle at 88% 82%, rgba(0, 251, 255, 0.14), transparent 35%), linear-gradient(135deg, #000000 0%, #031316 48%, #071B1E 100%)",
    color: "#ECFFFF",
    padding: "28px",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
  },
  pageMobile: { padding: "14px" },
  gridBackground: {
    position: "fixed",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(1, 231, 239, 0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(1, 231, 239, 0.055) 1px, transparent 1px)",
    backgroundSize: "44px 44px",
    WebkitMaskImage: "linear-gradient(to bottom, transparent, black 16%, black 84%, transparent)",
    maskImage: "linear-gradient(to bottom, transparent, black 16%, black 84%, transparent)",
    pointerEvents: "none",
    zIndex: 0,
  },
  sideTextLeft: {
    position: "fixed",
    zIndex: 0,
    top: "50%",
    left: "7%",
    transform: "translateY(-50%) rotate(180deg)",
    writingMode: "vertical-rl",
    color: "rgba(1, 231, 239, 0.075)",
    fontSize: "clamp(58px, 8vw, 112px)",
    fontWeight: 1000,
    letterSpacing: "0.08em",
    pointerEvents: "none",
    userSelect: "none",
  },
  sideTextRight: {
    position: "fixed",
    zIndex: 0,
    top: "50%",
    right: "5%",
    transform: "translateY(-50%)",
    writingMode: "vertical-rl",
    color: "rgba(1, 231, 239, 0.075)",
    fontSize: "clamp(58px, 8vw, 112px)",
    fontWeight: 1000,
    letterSpacing: "0.08em",
    pointerEvents: "none",
    userSelect: "none",
  },
  centerPage: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top left, rgba(1, 231, 239, 0.18), transparent 35%), linear-gradient(135deg, #000000, #031316, #071B1E)",
    color: "#ECFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
  },
  loadingBox: {
    border: "1px solid rgba(1, 231, 239, 0.18)",
    background: "rgba(3, 19, 22, 0.78)",
    borderRadius: "22px",
    padding: "28px",
    boxShadow: "0 0 40px rgba(0, 251, 255, 0.22)",
    textAlign: "center",
  },
  container: { position: "relative", zIndex: 2, maxWidth: "1320px", margin: "0 auto" },
  topbar: {
    border: "1px solid rgba(1, 231, 239, 0.18)",
    background: "rgba(3, 19, 22, 0.78)",
    borderRadius: "24px",
    padding: "16px 18px",
    boxShadow: "0 0 25px rgba(1, 231, 239, 0.18)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    marginBottom: "22px",
    backdropFilter: "blur(18px)",
  },
  topbarMobile: { display: "grid", gridTemplateColumns: "1fr" },
  brandBlock: { display: "flex", alignItems: "center", gap: "14px" },
  brandLogo: {
    width: "54px",
    height: "54px",
    borderRadius: "18px",
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg, #01E7EF, #00FBFF, #018B90)",
    color: "#000000",
    fontWeight: 1000,
    boxShadow: "0 0 40px rgba(0, 251, 255, 0.22)",
  },
  brandTitle: { display: "block", color: "#ECFFFF", fontSize: "24px", lineHeight: 1, letterSpacing: "0.08em" },
  brandSubtitle: { display: "block", color: "#9BC8CB", fontSize: "12px", fontWeight: 900, letterSpacing: "0.24em", marginTop: "5px" },
  topActions: { display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "flex-end" },
  topActionsMobile: { display: "grid", gridTemplateColumns: "1fr" },
  navButton: {
    border: "1px solid rgba(1, 231, 239, 0.18)",
    background: "rgba(1, 231, 239, 0.08)",
    color: "#ECFFFF",
    borderRadius: "15px",
    padding: "12px 16px",
    fontWeight: 950,
    cursor: "pointer",
  },
  navButtonStrong: {
    border: "1px solid rgba(1, 231, 239, 0.18)",
    background: "rgba(1, 139, 144, 0.44)",
    color: "#ECFFFF",
    borderRadius: "15px",
    padding: "12px 16px",
    fontWeight: 950,
    cursor: "pointer",
  },
  navButtonDanger: {
    border: "1px solid rgba(255, 67, 67, 0.45)",
    background: "rgba(255, 67, 67, 0.15)",
    color: "#ff8a8a",
    borderRadius: "15px",
    padding: "12px 16px",
    fontWeight: 950,
    cursor: "pointer",
  },
  heroHeader: {
    border: "1px solid rgba(1, 231, 239, 0.18)",
    background: "rgba(3, 19, 22, 0.78)",
    borderRadius: "28px",
    padding: "30px",
    boxShadow: "0 0 25px rgba(1, 231, 239, 0.18)",
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.3fr) minmax(320px, 0.7fr)",
    gap: "24px",
    alignItems: "center",
    marginBottom: "22px",
    backdropFilter: "blur(18px)",
  },
  heroHeaderMobile: { gridTemplateColumns: "1fr", padding: "22px" },
  heroCopy: { minWidth: 0 },
  kicker: { color: "#01E7EF", letterSpacing: "0.16em", fontWeight: 950, fontSize: "12px", margin: 0, textTransform: "uppercase" },
  title: {
    fontSize: "clamp(42px, 5vw, 64px)",
    margin: "12px 0",
    lineHeight: 0.98,
    color: "#ECFFFF",
    letterSpacing: "-0.045em",
    textShadow: "0 0 25px rgba(1, 231, 239, 0.18)",
  },
  titleMobile: { fontSize: "36px", lineHeight: 1.05 },
  description: { color: "#9BC8CB", maxWidth: "760px", lineHeight: 1.7, margin: 0 },
  muted: { color: "#9BC8CB", lineHeight: 1.7, margin: 0 },
  mutedSmall: { color: "#9BC8CB", margin: "0 0 6px", fontSize: "13px" },
  smallText: { display: "block", color: "#9BC8CB", fontSize: "12px", marginTop: "4px", overflowWrap: "anywhere" },
  adminCard: {
    border: "1px solid rgba(1, 231, 239, 0.18)",
    background: "rgba(0, 0, 0, 0.28)",
    borderRadius: "22px",
    padding: "18px",
    boxShadow: "inset 0 0 30px rgba(1, 231, 239, 0.05)",
  },
  adminCardMobile: { width: "100%", minWidth: "0" },
  adminMiniGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "14px" },
  buttonPrimaryFull: {
    width: "100%",
    marginTop: "14px",
    border: "none",
    background: "linear-gradient(135deg, #01E7EF, #00FBFF, #018B90)",
    color: "#000000",
    borderRadius: "15px",
    padding: "13px 16px",
    fontWeight: 1000,
    cursor: "pointer",
    boxShadow: "0 0 40px rgba(0, 251, 255, 0.22)",
  },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "18px", marginTop: "24px" },
  statsGridTablet: { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" },
  statsGridMobile: { gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "12px", marginTop: "18px" },
  statCard: {
    border: "1px solid rgba(1, 231, 239, 0.18)",
    background: "rgba(3, 19, 22, 0.78)",
    borderRadius: "22px",
    padding: "24px",
    boxShadow: "0 0 25px rgba(1, 231, 239, 0.18)",
  },
  statValue: { display: "block", color: "#01E7EF", fontSize: "38px", marginTop: "12px", textShadow: "0 0 25px rgba(1, 231, 239, 0.18)" },
  syncNotice: { marginTop: "18px", border: "1px solid rgba(1, 231, 239, 0.18)", background: "rgba(1, 231, 239, 0.08)", color: "#9BC8CB", borderRadius: "18px", padding: "14px 16px", lineHeight: 1.6 },
  panel: { marginTop: "28px", border: "1px solid rgba(1, 231, 239, 0.18)", background: "rgba(3, 19, 22, 0.78)", borderRadius: "24px", padding: "24px", boxShadow: "0 0 25px rgba(1, 231, 239, 0.18)", backdropFilter: "blur(16px)" },
  panelMobile: { padding: "18px", borderRadius: "22px", marginTop: "20px" },
  panelHeader: { display: "flex", justifyContent: "space-between", gap: "20px", alignItems: "center", marginBottom: "22px" },
  panelHeaderMobile: { display: "grid", gridTemplateColumns: "1fr", alignItems: "stretch", gap: "14px" },
  notice: { border: "1px solid rgba(1, 231, 239, 0.18)", background: "rgba(1, 231, 239, 0.08)", color: "#ECFFFF", borderRadius: "16px", padding: "14px", marginBottom: "18px" },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "14px" },
  formGridTablet: { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" },
  formGridMobile: { gridTemplateColumns: "1fr" },
  filters: { display: "grid", gridTemplateColumns: "1fr 240px", gap: "14px", marginBottom: "20px" },
  filtersMobile: { gridTemplateColumns: "1fr" },
  input: { width: "100%", border: "1px solid rgba(1, 231, 239, 0.18)", outline: "none", borderRadius: "15px", padding: "14px 15px", background: "rgba(0, 0, 0, 0.34)", color: "#ECFFFF", fontSize: "14px" },
  textareaImport: { width: "100%", minHeight: "180px", border: "1px solid rgba(1, 231, 239, 0.18)", outline: "none", borderRadius: "15px", padding: "16px", background: "rgba(0, 0, 0, 0.34)", color: "#ECFFFF", fontSize: "14px", lineHeight: 1.6, resize: "vertical", marginBottom: "16px" },
  textareaImportMobile: { minHeight: "150px", fontSize: "13px" },
  importSummary: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "14px", marginBottom: "16px" },
  importSummaryMobile: { gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "10px" },
  formActions: { gridColumn: "1 / -1", display: "flex", gap: "12px", flexWrap: "wrap" },
  headerActions: { display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "flex-end" },
  headerActionsMobile: { justifyContent: "stretch" },
  buttonPrimary: { border: "none", background: "linear-gradient(135deg, #01E7EF, #00FBFF, #018B90)", color: "#000000", borderRadius: "15px", padding: "14px 18px", fontWeight: 950, cursor: "pointer", boxShadow: "0 0 40px rgba(0, 251, 255, 0.22)" },
  buttonSecondary: { border: "1px solid rgba(1, 231, 239, 0.18)", background: "rgba(1, 231, 239, 0.08)", color: "#01E7EF", borderRadius: "15px", padding: "14px 18px", fontWeight: 900, cursor: "pointer" },
  buttonGhost: { width: "100%", marginTop: "12px", border: "1px solid rgba(1, 231, 239, 0.18)", background: "rgba(1, 231, 239, 0.08)", color: "#01E7EF", borderRadius: "14px", padding: "12px", fontWeight: 900, cursor: "pointer" },
  buttonDangerFull: { width: "100%", marginTop: "12px", border: "1px solid rgba(255, 67, 67, 0.45)", background: "rgba(255, 67, 67, 0.15)", color: "#ff8a8a", borderRadius: "14px", padding: "12px", fontWeight: 900, cursor: "pointer" },
  accessList: { display: "grid", gap: "14px" },
  accessCard: { borderRadius: "22px", padding: "16px", display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: "16px", alignItems: "center" },
  accessMain: { minWidth: 0, display: "grid", gap: "14px" },
  accessTitleBlock: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px" },
  accessCorreo: { margin: 0, color: "#ECFFFF", fontSize: "18px", overflowWrap: "anywhere" },
  accessSubtext: { width: "100%", margin: 0, color: "#9BC8CB", fontSize: "12px" },
  accessMetaGrid: { display: "grid", gridTemplateColumns: "repeat(5, minmax(130px, 1fr))", gap: "10px" },
  accessMetaItem: { border: "1px solid rgba(1, 231, 239, 0.12)", background: "rgba(0, 0, 0, 0.24)", borderRadius: "16px", padding: "11px", display: "grid", gap: "4px", minWidth: 0, color: "#ECFFFF" },
  accessActions: { display: "flex", justifyContent: "flex-end", gap: "8px", flexWrap: "wrap", maxWidth: "360px" },
  pinText: { color: "#00FBFF", letterSpacing: "0.12em", fontSize: "16px" },
  buttonMini: { border: "none", background: "#00FBFF", color: "#000000", borderRadius: "999px", padding: "8px 11px", fontSize: "12px", fontWeight: 900, cursor: "pointer" },
  buttonMiniGhost: { border: "1px solid rgba(1, 231, 239, 0.18)", background: "rgba(1, 231, 239, 0.08)", color: "#01E7EF", borderRadius: "999px", padding: "8px 11px", fontSize: "12px", fontWeight: 900, cursor: "pointer" },
  buttonWarning: { border: "1px solid rgba(255, 204, 102, 0.45)", background: "rgba(255, 204, 102, 0.14)", color: "#ffcc66", borderRadius: "999px", padding: "8px 11px", fontSize: "12px", fontWeight: 900, cursor: "pointer" },
  buttonDanger: { border: "1px solid rgba(255, 67, 67, 0.45)", background: "rgba(255, 67, 67, 0.15)", color: "#ff8a8a", borderRadius: "999px", padding: "8px 11px", fontSize: "12px", fontWeight: 900, cursor: "pointer" },
}
