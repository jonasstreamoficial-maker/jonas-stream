"use client"

import { useEffect, useMemo, useState } from "react"
import type { CSSProperties } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

type UsuarioAdmin = {
  id: string
  nombre: string
  correo: string
  rol: string
  estado: string
}

type SoporteCliente = {
  id: string
  nombre: string
  plataforma: string
  correo_asignado: string
  estado: string
}

type SoporteMensaje = {
  id: string
  cliente_id: string | null
  correo_destino: string
  plataforma: string | null
  remitente: string | null
  asunto: string | null
  cuerpo_texto: string | null
  cuerpo_html: string | null
  leido: boolean
  fecha_mensaje: string
  created_at: string
}

type LinkDetectado = {
  url: string
  contexto: string
}

const PATRON_PASSWORD_URL =
  /passwordresettoken|set-new-password|new-password|reset-password|password-reset|resetpassword|password\/reset|reset\/password|password-reset\/complete|resetpass|reset-password\?token|forgot-password|forgotten-password|account-recovery|loginhelp|\/password\?|\/password\/|newpassword|change-password|recover|recovery/i

const PATRON_PASSWORD_TEXTO =
  /contraseña|password|restablec|restablecer|recuper|reset|forgot|change password|cambiar contraseña|set new password|establecer contraseña|nueva contraseña|password reset|trouble signing in|problemas para iniciar/i

const PATRON_CODIGO_TEXTO =
  /c[oó]digo|code|verification|verificaci[oó]n|security code|one[-\s]?time|one time|passcode|otp|inicio de sesi[oó]n|sign[-\s]?in|login|acceso|hogar|household|clave de un solo uso|clave.*uso|un solo uso/i

const PLATAFORMAS = [
  "Netflix",
  "Prime Video",
  "Disney+",
  "Crunchyroll",
  "Vix",
  "Max",
  "Spotify",
  "YouTube Premium",
  "Apple TV",
  "Deezer",
  "Tidal",
  "Rakuten Viki",
  "Paramount+",
  "Canva",
  "Otro",
]

const PALETA_PLATAFORMAS: Record<
  string,
  { fondo: string; borde: string; texto: string; brillo: string }
> = {
  netflix: {
    fondo: "rgba(229, 9, 20, 0.14)",
    borde: "rgba(229, 9, 20, 0.46)",
    texto: "#ff6b72",
    brillo: "rgba(229, 9, 20, 0.24)",
  },
  "prime video": {
    fondo: "rgba(0, 168, 225, 0.14)",
    borde: "rgba(0, 168, 225, 0.46)",
    texto: "#6ad7ff",
    brillo: "rgba(0, 168, 225, 0.24)",
  },
  "disney+": {
    fondo: "rgba(17, 60, 207, 0.18)",
    borde: "rgba(86, 128, 255, 0.52)",
    texto: "#9cb8ff",
    brillo: "rgba(86, 128, 255, 0.24)",
  },
  crunchyroll: {
    fondo: "rgba(244, 117, 33, 0.16)",
    borde: "rgba(244, 117, 33, 0.52)",
    texto: "#ffb06b",
    brillo: "rgba(244, 117, 33, 0.25)",
  },
  vix: {
    fondo: "rgba(255, 130, 0, 0.16)",
    borde: "rgba(255, 130, 0, 0.50)",
    texto: "#ffbe6b",
    brillo: "rgba(255, 130, 0, 0.24)",
  },
  max: {
    fondo: "rgba(97, 72, 255, 0.18)",
    borde: "rgba(120, 99, 255, 0.54)",
    texto: "#b9adff",
    brillo: "rgba(120, 99, 255, 0.24)",
  },
  spotify: {
    fondo: "rgba(30, 215, 96, 0.14)",
    borde: "rgba(30, 215, 96, 0.45)",
    texto: "#7cffad",
    brillo: "rgba(30, 215, 96, 0.23)",
  },
  "youtube premium": {
    fondo: "rgba(255, 0, 0, 0.14)",
    borde: "rgba(255, 0, 0, 0.45)",
    texto: "#ff7474",
    brillo: "rgba(255, 0, 0, 0.22)",
  },
  "apple tv": {
    fondo: "rgba(245, 245, 247, 0.12)",
    borde: "rgba(245, 245, 247, 0.38)",
    texto: "#f5f5f7",
    brillo: "rgba(245, 245, 247, 0.18)",
  },
  deezer: {
    fondo: "rgba(164, 82, 255, 0.16)",
    borde: "rgba(255, 95, 180, 0.48)",
    texto: "#ff9ad0",
    brillo: "rgba(164, 82, 255, 0.24)",
  },
  tidal: {
    fondo: "rgba(255, 255, 255, 0.11)",
    borde: "rgba(255, 255, 255, 0.36)",
    texto: "#ffffff",
    brillo: "rgba(255, 255, 255, 0.16)",
  },
  "rakuten viki": {
    fondo: "rgba(0, 180, 255, 0.15)",
    borde: "rgba(0, 180, 255, 0.48)",
    texto: "#76dcff",
    brillo: "rgba(0, 180, 255, 0.22)",
  },
  "paramount+": {
    fondo: "rgba(0, 93, 255, 0.15)",
    borde: "rgba(0, 130, 255, 0.48)",
    texto: "#80caff",
    brillo: "rgba(0, 93, 255, 0.22)",
  },
  canva: {
    fondo: "rgba(0, 199, 190, 0.15)",
    borde: "rgba(151, 71, 255, 0.48)",
    texto: "#9ff6ff",
    brillo: "rgba(151, 71, 255, 0.22)",
  },
  otro: {
    fondo: "rgba(155, 200, 203, 0.12)",
    borde: "rgba(155, 200, 203, 0.30)",
    texto: "#BFECEF",
    brillo: "rgba(155, 200, 203, 0.16)",
  },
}

const normalizarPlataforma = (valor: string | null | undefined) => {
  const texto = String(valor || "otro").trim().toLowerCase()

  if (texto.includes("netflix")) return "netflix"
  if (texto.includes("prime") || texto.includes("amazon")) return "prime video"
  if (texto.includes("disney")) return "disney+"
  if (texto.includes("crunchy")) return "crunchyroll"
  if (texto.includes("vix")) return "vix"
  if (texto.includes("max") || texto.includes("hbo")) return "max"
  if (texto.includes("spotify")) return "spotify"
  if (texto.includes("youtube")) return "youtube premium"
  if (texto.includes("apple")) return "apple tv"
  if (texto.includes("deezer")) return "deezer"
  if (texto.includes("tidal")) return "tidal"
  if (texto.includes("viki") || texto.includes("rakuten")) return "rakuten viki"
  if (texto.includes("paramount")) return "paramount+"
  if (texto.includes("canva")) return "canva"

  return "otro"
}

const estiloChipPlataforma = (plataforma: string | null | undefined): CSSProperties => {
  const paleta =
    PALETA_PLATAFORMAS[normalizarPlataforma(plataforma)] || PALETA_PLATAFORMAS.otro

  return {
    display: "inline-flex",
    alignItems: "center",
    width: "fit-content",
    border: `1px solid ${paleta.borde}`,
    background: paleta.fondo,
    color: paleta.texto,
    borderRadius: "999px",
    padding: "7px 11px",
    fontSize: "11px",
    fontWeight: 950,
    boxShadow: `0 0 18px ${paleta.brillo}`,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  }
}


function decodificarEntidadesBasicas(valor: string) {
  return valor
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/gi, "'")
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
}

function limpiarUrl(url: string) {
  return decodificarEntidadesBasicas(url)
    .replace(/[)\].,;]+$/g, "")
    .trim()
}

function normalizarFuenteParaLinks(valor: string) {
  let texto = decodificarEntidadesBasicas(valor).replace(/=\n/g, "")

  for (let i = 0; i < 8; i += 1) {
    texto = texto
      .replace(
        /(https?:\/\/[^\s<>"']*(?:set-new-password|new-password|reset-password|password-reset|resetpassword|password\/reset|reset\/password|password-reset\/complete|resetpass|reset-password\?token|forgot-password|account-recovery|\/password\?)[^\s<>"']*)\n([A-Za-z0-9._~:/?#[\]@!$&'()*+,;=%-]+)/gi,
        "$1$2"
      )
      .replace(
        /(https?:\/\/[^\s<>"']*[?&][A-Za-z0-9_.%-]+=+[A-Za-z0-9._~:/?#[\]@!$&'()*+,;=%-]*)\n([A-Za-z0-9._~:/?#[\]@!$&'()*+,;=%-]+)/gi,
        "$1$2"
      )
  }

  return texto
}

function quitarHtml(valor: string) {
  return decodificarEntidadesBasicas(valor)
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function agregarLinkDetectado(
  mapa: Map<string, LinkDetectado>,
  urlOriginal: string,
  contextoOriginal: string
) {
  const url = limpiarUrl(urlOriginal)

  if (!url || !/^https?:\/\//i.test(url)) return

  const contexto = quitarHtml(contextoOriginal || "").slice(0, 900)
  const existente = mapa.get(url)

  if (!existente) {
    mapa.set(url, { url, contexto })
    return
  }

  if (contexto.length > existente.contexto.length) {
    mapa.set(url, { url, contexto })
  }
}

function extraerUrlRealDesdeParametros(url: string) {
  const resultados: string[] = []

  try {
    const objeto = new URL(url)

    for (const clave of [
      "url",
      "u",
      "target",
      "redirect",
      "redirect_uri",
      "continue",
      "continueUrl",
      "next",
      "link",
      "deep_link",
    ]) {
      const valor = objeto.searchParams.get(clave)

      if (!valor) continue

      const decodificado = limpiarUrl(valor)

      if (/^https?:\/\//i.test(decodificado)) {
        resultados.push(decodificado)
      }
    }
  } catch {
    return resultados
  }

  return resultados
}

function extraerLinksDetectados(texto: string, html?: string | null) {
  const links = new Map<string, LinkDetectado>()
  const fuentes = [html || "", texto || ""].filter(Boolean)

  for (const fuente of fuentes) {
    const limpio = normalizarFuenteParaLinks(fuente)

    const hrefRegex =
      /<a\b[^>]*?href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi

    let hrefMatch: RegExpExecArray | null

    while ((hrefMatch = hrefRegex.exec(limpio)) !== null) {
      const contexto = hrefMatch[0]
      const url = limpiarUrl(hrefMatch[1])
      agregarLinkDetectado(links, url, contexto)

      for (const real of extraerUrlRealDesdeParametros(url)) {
        agregarLinkDetectado(links, real, contexto)
      }

      if (links.size >= 80) break
    }

    const markdownRegex = /\[(.*?)\]\((https?:\/\/[^)\s]+)\)/gi
    let markdownMatch: RegExpExecArray | null

    while ((markdownMatch = markdownRegex.exec(limpio)) !== null) {
      agregarLinkDetectado(links, markdownMatch[2], markdownMatch[0])

      if (links.size >= 80) break
    }

    const urlRegex = /https?:\/\/[^\s<>"'\]\)]+/gi
    let urlMatch: RegExpExecArray | null

    while ((urlMatch = urlRegex.exec(limpio)) !== null) {
      const inicio = Math.max(0, urlMatch.index - 360)
      const fin = Math.min(limpio.length, urlMatch.index + urlMatch[0].length + 360)
      const contexto = limpio.slice(inicio, fin)
      const url = limpiarUrl(urlMatch[0])

      agregarLinkDetectado(links, url, contexto)

      for (const real of extraerUrlRealDesdeParametros(url)) {
        agregarLinkDetectado(links, real, contexto)
      }

      if (links.size >= 80) break
    }

    if (links.size >= 80) break
  }

  return Array.from(links.values()).slice(0, 80)
}

function esLinkBasura(url: string) {
  const lower = url.toLowerCase()

  return [
    "privacy",
    "privacidad",
    "terms",
    "terminos",
    "términos",
    "help",
    "ayuda",
    "unsubscribe",
    "notification",
    "notificaciones",
    "contactus",
    "centro",
    "preferences",
    "email-preferences",
    "support",
  ].some((palabra) => lower.includes(palabra))
}

function esLinkTracking(url: string) {
  const lower = url.toLowerCase()

  return (
    lower.includes("/ls/click") ||
    lower.includes("ablink.") ||
    lower.includes("link.vix.com") ||
    lower.includes("links.mail.crunchyroll.com") ||
    lower.includes("click.email") ||
    lower.includes("click.mail") ||
    lower.includes("trk.") ||
    lower.includes("tracking") ||
    lower.includes("mandrillapp.com/track") ||
    lower.includes("sendgrid.net")
  )
}

function filtrarLinksDetectadosImportantes(links: LinkDetectado[]) {
  if (!links.length) return []

  const utiles = links.filter((link) => !esLinkBasura(link.url))

  return utiles.length ? utiles : links
}

function esNumeroPareceFecha(codigo: string) {
  if (/^20\d{6}$/.test(codigo)) return true
  if (/^\d{8}$/.test(codigo)) {
    const yyyy = Number(codigo.slice(0, 4))
    const mm = Number(codigo.slice(4, 6))
    const dd = Number(codigo.slice(6, 8))

    if (yyyy >= 2020 && yyyy <= 2099 && mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31) {
      return true
    }
  }

  return false
}

function codigoValido(valor: string) {
  const codigo = valor.replace(/\D/g, "")

  if (codigo.length < 4 || codigo.length > 8) return null
  if (esNumeroPareceFecha(codigo)) return null

  return codigo
}

function extraerCodigo(texto: string, asunto?: string | null) {
  const base = `${asunto || ""}\n${texto || ""}`.replace(/\s+/g, " ").trim()

  const patrones = [
    /c[oó]digo detectado:\s*(\d[\d\s-]{2,14}\d)/iu,
    /(?:c[oó]digo|code|verification code|security code|one[-\s]?time code|one time code|sign[-\s]?in code|login code|passcode|otp|clave de un solo uso|clave.{0,30}uso).{0,180}?(\d[\d\s-]{2,14}\d)/iu,
    /(?:ingresa|introduce|usa|utiliza|enter|use).{0,180}?(\d[\d\s-]{2,14}\d).{0,140}?(?:c[oó]digo|code|verification|verificaci[oó]n|login|inicio|clave)/iu,
    /(?:hogar|household|home).{0,180}?(\d[\d\s-]{2,14}\d)/iu,
    /(\d[\d\s-]{2,14}\d).{0,160}?(?:c[oó]digo|code|verification|verificaci[oó]n|login|inicio|clave|hogar|household|home)/iu,
  ]

  for (const patron of patrones) {
    const match = base.match(patron)

    if (match?.[1]) {
      const codigo = codigoValido(match[1])
      if (codigo) return codigo
    }
  }

  if (!PATRON_CODIGO_TEXTO.test(base)) return null

  const matchLibre = base.match(/\b(\d(?:[\s-]?\d){3,7})\b/u)

  if (!matchLibre?.[1]) return null

  return codigoValido(matchLibre[1])
}

function contextoIndicaPassword(valor: string) {
  return PATRON_PASSWORD_TEXTO.test(valor) || PATRON_PASSWORD_URL.test(valor)
}

function detectarTipoMensaje(
  asunto: string,
  cuerpo: string,
  codigo: string | null,
  links: LinkDetectado[]
) {
  const base = `${asunto}\n${cuerpo}`.toLowerCase()

  const esPassword =
    PATRON_PASSWORD_TEXTO.test(base) ||
    links.some(
      (link) =>
        PATRON_PASSWORD_URL.test(link.url) || PATRON_PASSWORD_TEXTO.test(link.contexto)
    )

  if (esPassword) return "password"
  if (codigo) return "codigo"

  if (
    PATRON_CODIGO_TEXTO.test(base) &&
    /clave de un solo uso|one[-\s]?time|otp|c[oó]digo|code/i.test(base)
  ) {
    return "codigo"
  }

  if (
    /cambio.{0,80}correo|correo.{0,80}cambi|email.{0,80}changed|changed.{0,80}email|email.{0,80}updated|direcci[oó]n.{0,80}correo|new email address|correo electr[oó]nico.{0,80}actualiz/i.test(
      base
    )
  ) {
    return "cambio_correo"
  }

  if (/hogar|household|home verification|home update|actualizar hogar/i.test(base)) {
    return "hogar"
  }

  if (
    /nuevo inicio|inicio de sesi[oó]n|new sign|sign-in|login alert|nuevo dispositivo|new device|accedid|acceso nuevo|inicia sesi[oó]n/i.test(
      base
    )
  ) {
    return "seguridad"
  }

  if (
    /dispositivo|device|seguridad|security|actividad inusual|suspicious|alerta/i.test(
      base
    )
  ) {
    return "seguridad"
  }

  if (
    links.length > 0 &&
    /crear cuenta|crea tu cuenta|activar|activación|activate|verify|verificar|confirmar|registro|sign up|signup|enlace|link/i.test(
      base
    )
  ) {
    return "enlace"
  }

  if (links.length > 0) return "enlace"

  return "normal"
}

function puntuarLinkPassword(link: LinkDetectado) {
  const url = link.url.toLowerCase()
  const contexto = link.contexto.toLowerCase()
  const base = `${url} ${contexto}`

  let score = 0

  if (PATRON_PASSWORD_URL.test(url)) score += 320
  if (PATRON_PASSWORD_TEXTO.test(contexto)) score += 240

  if (
    /auth\.hbomax\.com.*set-new-password|auth\.max\.com.*set-new-password|account\.max\.com|identity\.max\.com|netflix\.com\/password|sso\.crunchyroll\.com.*new-password|deezer\.com\/password\/reset|accounts\.spotify\.com.*password-reset|paramountplus\.com.*resetpassword|login\.tidal\.com\/resetpass|viki\.com\/reset-password|vix\.com.*reset\/password|iforgot\.apple\.com|appleid\.apple\.com|canva\..*password/i.test(
      url
    )
  ) {
    score += 240
  }

  if (/auth|identity|account|accounts|login|sso/i.test(url)) score += 40

  if (esLinkTracking(url)) {
    score -= 20

    if (PATRON_PASSWORD_TEXTO.test(contexto)) {
      score += 280
    }
  }

  if (
    /watch|play\.max\.com|\/pe\/es|suscr[ií]bete|subscribe|browse|movies|series|home|homepage|plans|pricing|help|support/i.test(
      base
    ) &&
    !PATRON_PASSWORD_TEXTO.test(contexto)
  ) {
    score -= 180
  }

  if (
    /iniciar sesi[oó]n|sign in|login|entrar|abrir max|ver pel[ií]culas|watch now/i.test(
      contexto
    ) &&
    !PATRON_PASSWORD_TEXTO.test(contexto)
  ) {
    score -= 150
  }

  if (esLinkBasura(url)) score -= 180

  return score
}

function obtenerTextoBotonPrincipal(
  url: string,
  tipo: string,
  texto: string,
  asunto?: string | null,
  plataforma?: string | null
) {
  const base = `${url} ${texto} ${asunto || ""} ${
    plataforma || ""
  }`.toLowerCase()

  if (tipo === "password") return "Restablecer contraseña"

  if (
    base.includes("crear tu cuenta") ||
    base.includes("crear cuenta") ||
    base.includes("epr?code") ||
    base.includes("signup") ||
    base.includes("register")
  ) {
    return "Crear cuenta"
  }

  if (
    base.includes("verificar") ||
    base.includes("verify") ||
    base.includes("activar") ||
    base.includes("activate")
  ) {
    return "Abrir verificación"
  }

  if (base.includes("netflix")) return "Abrir Netflix"
  if (base.includes("disney")) return "Abrir Disney+"

  if (base.includes("prime") || base.includes("amazon")) {
    return "Abrir Prime Video"
  }

  if (base.includes("crunchyroll") || base.includes("crunchy")) {
    return "Abrir Crunchyroll"
  }

  if (base.includes("youtube")) return "Abrir YouTube"
  if (base.includes("spotify")) return "Abrir Spotify"
  if (base.includes("max.com") || base.includes("hbo")) return "Abrir Max"
  if (base.includes("vix")) return "Abrir Vix"

  return "Abrir enlace principal"
}

function extraerLinkPrincipal(
  texto: string,
  html?: string | null,
  asunto?: string | null,
  plataforma?: string | null
) {
  const textoCompleto = `${asunto || ""}\n${texto || ""}\n${quitarHtml(html || "")}`
  const links = filtrarLinksDetectadosImportantes(extraerLinksDetectados(texto, html))
  const codigo = extraerCodigo(textoCompleto, asunto)
  const tipo = detectarTipoMensaje(asunto || "", textoCompleto, codigo, links)

  // Regla principal: si el correo es de código, se muestra solo código y no link.
  if (tipo === "codigo") return null

  if (links.length === 0) return null

  if (tipo === "password") {
    const ordenados = [...links]
      .map((link) => ({
        ...link,
        score: puntuarLinkPassword(link),
      }))
      .sort((a, b) => b.score - a.score)

    const mejor = ordenados[0]

    if (mejor && mejor.score >= 60) {
      return {
        url: mejor.url,
        texto: obtenerTextoBotonPrincipal(
          mejor.url,
          tipo,
          textoCompleto,
          asunto,
          plataforma
        ),
      }
    }

    // Respaldo: si el correo/botón dice contraseña pero el link es tracking,
    // igual lo mostramos porque normalmente ahí está escondido el reset.
    const trackingPassword = ordenados.find((link) => {
      const contexto = `${asunto || ""} ${link.contexto}`
      return (
        esLinkTracking(link.url) &&
        contextoIndicaPassword(contexto) &&
        !esLinkBasura(link.url)
      )
    })

    if (trackingPassword) {
      return {
        url: trackingPassword.url,
        texto: obtenerTextoBotonPrincipal(
          trackingPassword.url,
          tipo,
          textoCompleto,
          asunto,
          plataforma
        ),
      }
    }

    if (contextoIndicaPassword(textoCompleto) && links.length === 1 && !esLinkBasura(links[0].url)) {
      return {
        url: links[0].url,
        texto: obtenerTextoBotonPrincipal(
          links[0].url,
          tipo,
          textoCompleto,
          asunto,
          plataforma
        ),
      }
    }

    return null
  }

  if (tipo === "enlace") {
    const noTracking = links.filter((link) => !esLinkTracking(link.url))

    const principal =
      noTracking.find((link) =>
        /verify|verification|activate|activation|confirm|register|signup|sign-up|val|code|token|auth|account/i.test(
          link.url
        )
      ) ||
      noTracking[0] ||
      null

    if (!principal) return null

    return {
      url: principal.url,
      texto: obtenerTextoBotonPrincipal(
        principal.url,
        tipo,
        textoCompleto,
        asunto,
        plataforma
      ),
    }
  }

  return null
}

function limpiarCuerpoParaVista(texto: string) {
  if (!texto) return ""

  return quitarHtml(texto)
    .replace(/@font-face[\s\S]{0,1400}?}/gi, " ")
    .replace(/font-family:[^;\n]+;?/gi, " ")
    .replace(/\[(https?:\/\/[^\]]+)\]/gi, "")
    .replace(/https?:\/\/[^\s<>"']+/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim()
}

function formatearFecha(fecha?: string | null) {
  if (!fecha) return "Fecha no disponible"

  return new Date(fecha).toLocaleString("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

export default function SoporteMensajesPage() {
  const router = useRouter()

  const [verificando, setVerificando] = useState(true)
  const [usuario, setUsuario] = useState<UsuarioAdmin | null>(null)
  const [mensajes, setMensajes] = useState<SoporteMensaje[]>([])
  const [clientes, setClientes] = useState<SoporteCliente[]>([])
  const [mensajeSeleccionado, setMensajeSeleccionado] =
    useState<SoporteMensaje | null>(null)
  const [busqueda, setBusqueda] = useState("")
  const [filtroCorreoUrl, setFiltroCorreoUrl] = useState("")
  const [filtroLectura, setFiltroLectura] = useState("todos")
  const [cargando, setCargando] = useState(false)
  const [aviso, setAviso] = useState("")
  const [seleccionInicialHecha, setSeleccionInicialHecha] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const correo = params.get("correo")

    if (correo) {
      const correoLimpio = correo.trim().toLowerCase()
      setBusqueda(correoLimpio)
      setFiltroCorreoUrl(correoLimpio)
    }
  }, [])

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
    setCargando(true)
    setAviso("")

    const [mensajesResult, clientesResult] = await Promise.all([
      supabase
        .from("soporte_mensajes")
        .select("*")
        .order("fecha_mensaje", { ascending: false }),
      supabase
        .from("soporte_clientes")
        .select("id,nombre,plataforma,correo_asignado,estado"),
    ])

    if (mensajesResult.error) {
      setAviso("No se pudieron cargar los mensajes.")
    } else {
      setMensajes((mensajesResult.data || []) as SoporteMensaje[])
    }

    if (!clientesResult.error) {
      setClientes((clientesResult.data || []) as SoporteCliente[])
    }

    setCargando(false)
  }

  const cerrarSesion = async () => {
    await supabase.auth.signOut()
    router.replace("/soporte-panel")
  }

  const obtenerCliente = (mensaje: SoporteMensaje) => {
    if (mensaje.cliente_id) {
      const porId = clientes.find((cliente) => cliente.id === mensaje.cliente_id)
      if (porId) return porId
    }

    return clientes.find(
      (cliente) =>
        cliente.correo_asignado.toLowerCase() ===
        mensaje.correo_destino.toLowerCase()
    )
  }

  const marcarLeido = async (mensaje: SoporteMensaje, leido: boolean) => {
    const { error } = await supabase
      .from("soporte_mensajes")
      .update({ leido })
      .eq("id", mensaje.id)

    if (error) {
      setAviso("No se pudo actualizar el mensaje.")
      return
    }

    setMensajes((prev) =>
      prev.map((item) => (item.id === mensaje.id ? { ...item, leido } : item))
    )

    if (mensajeSeleccionado?.id === mensaje.id) {
      setMensajeSeleccionado({ ...mensaje, leido })
    }
  }

  const eliminarMensaje = async (mensaje: SoporteMensaje) => {
    const confirmar = window.confirm(
      `¿Eliminar el mensaje "${mensaje.asunto || "Sin asunto"}"?`
    )

    if (!confirmar) return

    const { error } = await supabase
      .from("soporte_mensajes")
      .delete()
      .eq("id", mensaje.id)

    if (error) {
      setAviso("No se pudo eliminar el mensaje.")
      return
    }

    setMensajes((prev) => prev.filter((item) => item.id !== mensaje.id))

    if (mensajeSeleccionado?.id === mensaje.id) {
      setMensajeSeleccionado(null)
    }
  }

  const copiarTexto = async (texto: string, mensajeOk: string) => {
    try {
      await navigator.clipboard.writeText(texto)
      setAviso(mensajeOk)
    } catch {
      setAviso("No se pudo copiar automáticamente.")
    }
  }

  const limpiarFiltroCorreo = () => {
    setBusqueda("")
    setFiltroCorreoUrl("")
    setMensajeSeleccionado(null)
    setSeleccionInicialHecha(false)
    window.history.replaceState({}, "", "/soporte-panel/mensajes")
  }

  const mensajesFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()

    return mensajes.filter((mensaje) => {
      const cliente = obtenerCliente(mensaje)

      const texto = [
        cliente?.nombre,
        mensaje.correo_destino,
        mensaje.plataforma,
        mensaje.remitente,
        mensaje.asunto,
        mensaje.cuerpo_texto,
      ]
        .join(" ")
        .toLowerCase()

      const coincideBusqueda = !q || texto.includes(q)

      const coincideLectura =
        filtroLectura === "todos" ||
        (filtroLectura === "leidos" && mensaje.leido) ||
        (filtroLectura === "no_leidos" && !mensaje.leido)

      return coincideBusqueda && coincideLectura
    })
  }, [mensajes, clientes, busqueda, filtroLectura])

  useEffect(() => {
    if (
      !filtroCorreoUrl ||
      seleccionInicialHecha ||
      mensajesFiltrados.length === 0
    ) {
      return
    }

    setMensajeSeleccionado(mensajesFiltrados[0])
    setSeleccionInicialHecha(true)
  }, [filtroCorreoUrl, seleccionInicialHecha, mensajesFiltrados])

  const resumen = useMemo(() => {
    const base = busqueda.trim() ? mensajesFiltrados : mensajes

    return {
      total: base.length,
      noLeidos: base.filter((mensaje) => !mensaje.leido).length,
      leidos: base.filter((mensaje) => mensaje.leido).length,
      correos: new Set(base.map((mensaje) => mensaje.correo_destino)).size,
    }
  }, [mensajes, mensajesFiltrados, busqueda])

  if (verificando) {
    return (
      <main style={styles.centerPage}>
        <div style={styles.loadingBox}>
          <div style={styles.logoMarkSmall}>JS</div>
          <p style={styles.kicker}>JONAS STREAM</p>
          <h2 style={{ margin: "14px 0 8px" }}>Verificando acceso...</h2>
          <p style={styles.muted}>Validando sesión administrativa.</p>
        </div>
      </main>
    )
  }

  return (
    <main style={styles.page}>
      <div style={styles.backgroundGlowOne} />
      <div style={styles.backgroundGlowTwo} />

      <section style={styles.container}>
        <header style={styles.header}>
          <div style={styles.headerText}>
            <div style={styles.brandLine}>
              <div style={styles.logoMark}>JS</div>
              <div>
                <p style={styles.kicker}>JONAS STREAM · SOPORTE PANEL</p>
                <h1 style={styles.title}>Mensajes recibidos</h1>
              </div>
            </div>

            <p style={styles.description}>
              Bandeja interna para revisar correos, códigos y enlaces recibidos
              por las cuentas asignadas.
            </p>
          </div>

          <div style={styles.adminCard}>
            <p style={styles.mutedSmall}>Administrador</p>
            <strong>{usuario?.nombre || "Admin"}</strong>
            <span style={styles.smallText}>{usuario?.correo}</span>

            <div style={styles.adminButtons}>
              <button
                type="button"
                onClick={() => router.push("/soporte-panel/dashboard")}
                style={styles.buttonGhost}
              >
                Dashboard
              </button>

              <button
                type="button"
                onClick={() => window.open("/codigos", "_blank")}
                style={styles.buttonGhost}
              >
                /codigos
              </button>
            </div>

            <button
              type="button"
              onClick={cerrarSesion}
              style={styles.buttonDangerFull}
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        {filtroCorreoUrl && (
          <div style={styles.filterAlert}>
            <div>
              <span style={styles.label}>Filtro activo por correo</span>
              <strong>{filtroCorreoUrl}</strong>
            </div>

            <button
              type="button"
              onClick={limpiarFiltroCorreo}
              style={styles.buttonSecondary}
            >
              Ver todos
            </button>
          </div>
        )}

        <div style={styles.statsGrid}>
          <StatCard label="Total mensajes" value={resumen.total} />
          <StatCard label="No leídos" value={resumen.noLeidos} />
          <StatCard label="Leídos" value={resumen.leidos} />
          <StatCard label="Correos con mensajes" value={resumen.correos} />
        </div>

        <div style={styles.platformLegend}>
          {PLATAFORMAS.slice(0, 13).map((plataforma) => (
            <span key={plataforma} style={estiloChipPlataforma(plataforma)}>
              {plataforma}
            </span>
          ))}
        </div>

        <section style={styles.panel}>
          <div style={styles.panelHeader}>
            <div>
              <p style={styles.kicker}>BANDEJA DE SOPORTE</p>
              <h2 style={styles.sectionTitle}>Lista de mensajes</h2>
              <p style={styles.muted}>
                Busca por cliente, correo, remitente, plataforma o asunto.
              </p>
            </div>

            <button
              type="button"
              onClick={cargarDatos}
              style={styles.buttonPrimary}
            >
              {cargando ? "Actualizando..." : "Actualizar bandeja"}
            </button>
          </div>

          {aviso && <div style={styles.notice}>{aviso}</div>}

          <div style={styles.filters}>
            <input
              style={styles.input}
              placeholder="Buscar mensaje, cliente, correo, remitente..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value)
                setFiltroCorreoUrl("")
                setSeleccionInicialHecha(false)
              }}
            />

            <select
              style={styles.input}
              value={filtroLectura}
              onChange={(e) => setFiltroLectura(e.target.value)}
            >
              <option value="todos">Todos</option>
              <option value="no_leidos">No leídos</option>
              <option value="leidos">Leídos</option>
            </select>
          </div>

          {mensajesFiltrados.length === 0 ? (
            <div style={styles.emptyState}>
              <strong>No hay mensajes para este filtro.</strong>
              <p>Verifica que el correo tenga mensajes recibidos.</p>
            </div>
          ) : (
            <div style={styles.layout}>
              <div style={styles.list}>
                {mensajesFiltrados.map((mensaje) => {
                  const cliente = obtenerCliente(mensaje)
                  const activo = mensajeSeleccionado?.id === mensaje.id
                  const textoMensaje = `${mensaje.cuerpo_texto || ""}\n${quitarHtml(
                    mensaje.cuerpo_html || ""
                  )}`
                  const codigo = extraerCodigo(textoMensaje, mensaje.asunto)

                  return (
                    <button
                      key={mensaje.id}
                      type="button"
                      onClick={() => setMensajeSeleccionado(mensaje)}
                      style={{
                        ...styles.messageItem,
                        borderColor: activo
                          ? "#00FBFF"
                          : "rgba(1, 231, 239, 0.16)",
                        background: activo
                          ? "rgba(1, 231, 239, 0.12)"
                          : "rgba(0,0,0,0.24)",
                      }}
                    >
                      <div style={styles.messageTop}>
                        <strong>{mensaje.asunto || "Sin asunto"}</strong>

                        <span
                          style={{
                            ...styles.badge,
                            borderColor: mensaje.leido ? "#9BC8CB" : "#00FBFF",
                            color: mensaje.leido ? "#9BC8CB" : "#00FBFF",
                          }}
                        >
                          {mensaje.leido ? "Leído" : "Nuevo"}
                        </span>
                      </div>

                      <div style={styles.platformRow}>
                        <span style={estiloChipPlataforma(mensaje.plataforma || cliente?.plataforma)}>
                          {mensaje.plataforma || cliente?.plataforma || "No definida"}
                        </span>
                      </div>

                      <p style={styles.messageText}>
                        {cliente?.nombre || "Cliente no vinculado"} ·{" "}
                        {mensaje.correo_destino}
                      </p>

                      <span style={styles.smallText}>
                        {mensaje.remitente || "Remitente no disponible"} ·{" "}
                        {formatearFecha(mensaje.fecha_mensaje)}
                      </span>

                      {codigo && <span style={styles.codePreview}>Código: {codigo}</span>}
                    </button>
                  )
                })}
              </div>

              <div style={styles.preview}>
                {!mensajeSeleccionado ? (
                  <div style={styles.previewEmpty}>
                    <p style={styles.kicker}>VISTA DEL MENSAJE</p>
                    <h2>Selecciona un mensaje</h2>
                    <p style={styles.muted}>
                      Aquí verás el asunto, remitente, correo destino, códigos
                      detectados y contenido del correo.
                    </p>
                  </div>
                ) : (
                  <MensajePreview
                    mensaje={mensajeSeleccionado}
                    cliente={obtenerCliente(mensajeSeleccionado)}
                    onMarcarLeido={marcarLeido}
                    onEliminar={eliminarMensaje}
                    onCopiar={copiarTexto}
                  />
                )}
              </div>
            </div>
          )}
        </section>
      </section>
    </main>
  )
}

function MensajePreview({
  mensaje,
  cliente,
  onMarcarLeido,
  onEliminar,
  onCopiar,
}: {
  mensaje: SoporteMensaje
  cliente?: SoporteCliente
  onMarcarLeido: (mensaje: SoporteMensaje, leido: boolean) => void
  onEliminar: (mensaje: SoporteMensaje) => void
  onCopiar: (texto: string, mensajeOk: string) => void
}) {
  const cuerpo =
    mensaje.cuerpo_texto ||
    quitarHtml(mensaje.cuerpo_html || "") ||
    "Este mensaje no tiene cuerpo en texto. Aquí aparecerá el contenido del correo."

  const textoCompleto = `${mensaje.asunto || ""}\n${cuerpo}\n${quitarHtml(
    mensaje.cuerpo_html || ""
  )}`

  const codigo = extraerCodigo(textoCompleto, mensaje.asunto)
  const linkPrincipal = extraerLinkPrincipal(
    cuerpo,
    mensaje.cuerpo_html,
    mensaje.asunto,
    mensaje.plataforma || cliente?.plataforma
  )
  const cuerpoLimpio = limpiarCuerpoParaVista(cuerpo)

  return (
    <div>
      <div style={styles.previewHeader}>
        <div>
          <p style={styles.kicker}>DETALLE DEL MENSAJE</p>
          <h2 style={styles.previewTitle}>{mensaje.asunto || "Sin asunto"}</h2>
        </div>

        <span
          style={{
            ...styles.badgeLarge,
            borderColor: mensaje.leido ? "#9BC8CB" : "#00FBFF",
            color: mensaje.leido ? "#9BC8CB" : "#00FBFF",
          }}
        >
          {mensaje.leido ? "Leído" : "Nuevo"}
        </span>
      </div>

      {codigo && (
        <div style={styles.codeBox}>
          <span>Código detectado</span>
          <button
            type="button"
            onClick={() => onCopiar(codigo, "Código copiado correctamente.")}
            style={styles.codeButton}
          >
            {codigo}
          </button>
        </div>
      )}

      <div style={styles.infoGrid}>
        <InfoItem label="Cliente" value={cliente?.nombre || "No vinculado"} />
        <PlatformInfoItem
          plataforma={mensaje.plataforma || cliente?.plataforma || "No definida"}
        />
        <InfoItem label="Correo destino" value={mensaje.correo_destino} />
        <InfoItem label="Remitente" value={mensaje.remitente || "No disponible"} />
        <InfoItem label="Fecha" value={formatearFecha(mensaje.fecha_mensaje)} />
        <InfoItem label="Estado" value={mensaje.leido ? "Leído" : "No leído"} />
      </div>

      {linkPrincipal && (
        <div style={styles.linksBox}>
          <span style={styles.label}>Acción principal</span>

          <div style={styles.linksList}>
            <a
              href={linkPrincipal.url}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.linkButton}
            >
              {linkPrincipal.texto}
            </a>

            <button
              type="button"
              onClick={() =>
                onCopiar(linkPrincipal.url, "Enlace copiado correctamente.")
              }
              style={styles.secondaryButton}
            >
              Copiar enlace
            </button>
          </div>
        </div>
      )}

      <div style={styles.bodyBox}>{cuerpoLimpio}</div>

      <div style={styles.actions}>
        <button
          type="button"
          onClick={() => onMarcarLeido(mensaje, !mensaje.leido)}
          style={styles.buttonPrimary}
        >
          {mensaje.leido ? "Marcar como no leído" : "Marcar como leído"}
        </button>

        <button
          type="button"
          onClick={() => onEliminar(mensaje)}
          style={styles.buttonDanger}
        >
          Eliminar mensaje
        </button>
      </div>
    </div>
  )
}

function PlatformInfoItem({ plataforma }: { plataforma: string }) {
  return (
    <div style={styles.infoItem}>
      <span style={styles.label}>Plataforma</span>
      <span style={estiloChipPlataforma(plataforma)}>{plataforma}</span>
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.infoItem}>
      <span style={styles.label}>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div style={styles.statCard}>
      <p style={{ color: "#9BC8CB", margin: 0 }}>{label}</p>
      <strong style={styles.statValue}>{value}</strong>
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    position: "relative",
    overflowX: "hidden",
    background:
      "radial-gradient(circle at 12% -8%, rgba(1, 231, 239, 0.22), transparent 34%), radial-gradient(circle at 88% 10%, rgba(107, 72, 255, 0.18), transparent 28%), radial-gradient(circle at 72% 118%, rgba(0, 251, 255, 0.14), transparent 34%), linear-gradient(135deg, #000000 0%, #031316 48%, #071B1E 100%)",
    color: "#ECFFFF",
    padding: "clamp(14px, 3vw, 40px)",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
  },
  backgroundGlowOne: {
    position: "fixed",
    width: "540px",
    height: "540px",
    borderRadius: "999px",
    background: "rgba(1, 231, 239, 0.13)",
    filter: "blur(100px)",
    top: "-180px",
    left: "-150px",
    pointerEvents: "none",
  },
  backgroundGlowTwo: {
    position: "fixed",
    width: "640px",
    height: "640px",
    borderRadius: "999px",
    background: "rgba(0, 251, 255, 0.10)",
    filter: "blur(120px)",
    right: "-220px",
    bottom: "-220px",
    pointerEvents: "none",
  },
  centerPage: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #000000 0%, #031316 48%, #071B1E 100%)",
    color: "#ECFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
    padding: "20px",
  },
  loadingBox: {
    border: "1px solid rgba(1, 231, 239, 0.18)",
    background: "linear-gradient(180deg, rgba(3, 19, 22, 0.90), rgba(0, 0, 0, 0.68))",
    borderRadius: "24px",
    padding: "28px",
    boxShadow: "0 0 40px rgba(0, 251, 255, 0.22)",
    textAlign: "center",
    width: "min(100%, 420px)",
  },
  logoMark: {
    width: "54px",
    height: "54px",
    borderRadius: "18px",
    display: "grid",
    placeItems: "center",
    background:
      "linear-gradient(135deg, rgba(1, 231, 239, 1), rgba(0, 251, 255, 0.48))",
    color: "#000000",
    fontWeight: 1000,
    boxShadow: "0 0 30px rgba(0, 251, 255, 0.22)",
    flex: "0 0 auto",
  },
  logoMarkSmall: {
    width: "58px",
    height: "58px",
    borderRadius: "19px",
    display: "grid",
    placeItems: "center",
    background:
      "linear-gradient(135deg, rgba(1, 231, 239, 1), rgba(0, 251, 255, 0.48))",
    color: "#000000",
    fontWeight: 1000,
    margin: "0 auto 18px",
  },
  container: {
    position: "relative",
    zIndex: 1,
    maxWidth: "1320px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    alignItems: "stretch",
    flexWrap: "wrap",
    marginBottom: "28px",
  },
  headerText: {
    flex: "1 1 560px",
  },
  brandLine: {
    display: "flex",
    gap: "16px",
    alignItems: "center",
    marginBottom: "14px",
  },
  kicker: {
    color: "#01E7EF",
    letterSpacing: "0.16em",
    fontWeight: 950,
    fontSize: "12px",
    margin: 0,
    textTransform: "uppercase",
  },
  title: {
    fontSize: "clamp(34px, 5vw, 56px)",
    margin: "8px 0 0",
    lineHeight: 0.98,
    letterSpacing: "-0.045em",
  },
  description: {
    color: "#9BC8CB",
    maxWidth: "760px",
    lineHeight: 1.7,
    margin: 0,
  },
  muted: {
    color: "#9BC8CB",
    lineHeight: 1.7,
    margin: 0,
  },
  mutedSmall: {
    color: "#9BC8CB",
    margin: "0 0 6px",
    fontSize: "13px",
  },
  smallText: {
    display: "block",
    color: "#9BC8CB",
    fontSize: "12px",
    marginTop: "6px",
    overflowWrap: "anywhere",
  },
  adminCard: {
    border: "1px solid rgba(1, 231, 239, 0.18)",
    background: "linear-gradient(180deg, rgba(3, 19, 22, 0.90), rgba(0, 0, 0, 0.68))",
    borderRadius: "22px",
    padding: "16px",
    minWidth: "min(100%, 280px)",
    boxShadow: "0 0 25px rgba(1, 231, 239, 0.18)",
    flex: "0 1 320px",
  },
  adminButtons: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    marginTop: "14px",
  },
  filterAlert: {
    border: "1px solid rgba(1, 231, 239, 0.25)",
    background: "rgba(1, 231, 239, 0.08)",
    borderRadius: "18px",
    padding: "16px",
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: "20px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "14px",
    marginTop: "22px",
  },
  statCard: {
    border: "1px solid rgba(1, 231, 239, 0.18)",
    background: "linear-gradient(180deg, rgba(3, 19, 22, 0.90), rgba(0, 0, 0, 0.68))",
    borderRadius: "22px",
    padding: "20px",
    boxShadow: "0 0 25px rgba(1, 231, 239, 0.14)",
  },
  statValue: {
    display: "block",
    color: "#01E7EF",
    fontSize: "clamp(30px, 4vw, 42px)",
    marginTop: "10px",
  },
  platformLegend: {
    marginTop: "18px",
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },
  panel: {
    marginTop: "24px",
    border: "1px solid rgba(1, 231, 239, 0.18)",
    background: "linear-gradient(180deg, rgba(3, 19, 22, 0.90), rgba(0, 0, 0, 0.68))",
    borderRadius: "26px",
    padding: "clamp(16px, 3vw, 24px)",
    boxShadow: "0 0 30px rgba(1, 231, 239, 0.16)",
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: "22px",
  },
  sectionTitle: {
    margin: "8px 0",
    fontSize: "clamp(22px, 3vw, 30px)",
    letterSpacing: "-0.03em",
  },
  notice: {
    border: "1px solid rgba(1, 231, 239, 0.25)",
    background: "rgba(1, 231, 239, 0.08)",
    color: "#ECFFFF",
    borderRadius: "16px",
    padding: "14px",
    marginBottom: "18px",
  },
  filters: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(160px, 240px)",
    gap: "14px",
    marginBottom: "20px",
  },
  input: {
    width: "100%",
    border: "1px solid rgba(1, 231, 239, 0.20)",
    outline: "none",
    borderRadius: "16px",
    padding: "14px 15px",
    background: "rgba(0, 0, 0, 0.36)",
    color: "#ECFFFF",
    fontSize: "14px",
    minWidth: 0,
  },
  emptyState: {
    border: "1px dashed rgba(1, 231, 239, 0.22)",
    background: "rgba(0, 0, 0, 0.20)",
    borderRadius: "20px",
    padding: "22px",
    color: "#9BC8CB",
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 370px), 1fr))",
    gap: "18px",
    alignItems: "start",
  },
  list: {
    display: "grid",
    gap: "12px",
    maxHeight: "72vh",
    overflowY: "auto",
    paddingRight: "4px",
  },
  messageItem: {
    width: "100%",
    textAlign: "left",
    border: "1px solid rgba(1, 231, 239, 0.16)",
    borderRadius: "20px",
    padding: "16px",
    color: "#ECFFFF",
    cursor: "pointer",
    transition: "0.2s ease",
  },
  messageTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "start",
  },
  platformRow: {
    display: "flex",
    marginTop: "12px",
  },
  messageText: {
    color: "#9BC8CB",
    margin: "8px 0 0",
    fontSize: "13px",
    overflowWrap: "anywhere",
  },
  codePreview: {
    display: "inline-flex",
    marginTop: "10px",
    border: "1px solid rgba(0, 251, 255, 0.28)",
    background: "rgba(0, 251, 255, 0.08)",
    color: "#00FBFF",
    borderRadius: "999px",
    padding: "7px 10px",
    fontSize: "12px",
    fontWeight: 950,
    letterSpacing: "0.08em",
  },
  preview: {
    border: "1px solid rgba(1, 231, 239, 0.18)",
    background: "rgba(0, 0, 0, 0.26)",
    borderRadius: "24px",
    padding: "clamp(16px, 3vw, 22px)",
    minHeight: "420px",
    overflowWrap: "anywhere",
  },
  previewEmpty: {
    minHeight: "340px",
    display: "grid",
    alignContent: "center",
  },
  previewHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    alignItems: "start",
    flexWrap: "wrap",
  },
  previewTitle: {
    margin: "8px 0 0",
    fontSize: "clamp(22px, 3vw, 30px)",
    letterSpacing: "-0.03em",
  },
  badge: {
    display: "inline-flex",
    padding: "6px 10px",
    borderRadius: "999px",
    border: "1px solid #00FBFF",
    color: "#00FBFF",
    fontSize: "11px",
    fontWeight: 950,
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  },
  badgeLarge: {
    display: "inline-flex",
    padding: "8px 12px",
    borderRadius: "999px",
    border: "1px solid #00FBFF",
    color: "#00FBFF",
    fontSize: "12px",
    fontWeight: 950,
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  },
  codeBox: {
    marginTop: "18px",
    border: "1px solid rgba(0, 251, 255, 0.26)",
    background: "rgba(0, 251, 255, 0.08)",
    borderRadius: "20px",
    padding: "16px",
    display: "flex",
    justifyContent: "space-between",
    gap: "14px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  codeButton: {
    border: "1px solid rgba(1, 231, 239, 0.45)",
    background: "rgba(1, 231, 239, 0.13)",
    color: "#00FBFF",
    borderRadius: "16px",
    padding: "12px 16px",
    fontSize: "clamp(22px, 4vw, 32px)",
    fontWeight: 1000,
    letterSpacing: "0.18em",
    cursor: "pointer",
    boxShadow: "0 0 26px rgba(0, 251, 255, 0.12)",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 190px), 1fr))",
    gap: "12px",
    marginTop: "18px",
  },
  infoItem: {
    border: "1px solid rgba(1, 231, 239, 0.12)",
    background: "rgba(0, 0, 0, 0.24)",
    borderRadius: "16px",
    padding: "14px",
    overflowWrap: "anywhere",
  },
  label: {
    display: "block",
    color: "#9BC8CB",
    fontSize: "12px",
    marginBottom: "5px",
  },
  linksBox: {
    marginTop: "18px",
    border: "1px solid rgba(1, 231, 239, 0.18)",
    background: "rgba(1, 231, 239, 0.06)",
    borderRadius: "18px",
    padding: "16px",
  },
  linksList: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "10px",
  },
  linkButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid rgba(1, 231, 239, 0.45)",
    background:
      "linear-gradient(135deg, rgba(1, 231, 239, 0.16), rgba(0, 251, 255, 0.08))",
    color: "#00FBFF",
    borderRadius: "14px",
    padding: "11px 14px",
    fontWeight: 950,
    textDecoration: "none",
    boxShadow: "0 0 25px rgba(1, 231, 239, 0.16)",
  },
  bodyBox: {
    marginTop: "18px",
    border: "1px solid rgba(1, 231, 239, 0.14)",
    background: "rgba(0, 0, 0, 0.28)",
    borderRadius: "18px",
    padding: "16px",
    color: "#ECFFFF",
    lineHeight: 1.7,
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
    maxHeight: "420px",
    overflowY: "auto",
  },
  actions: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginTop: "20px",
  },
  buttonPrimary: {
    border: "none",
    background: "linear-gradient(135deg, #01E7EF, #00FBFF)",
    color: "#000000",
    borderRadius: "15px",
    padding: "13px 16px",
    fontWeight: 950,
    cursor: "pointer",
  },
  buttonSecondary: {
    border: "1px solid rgba(1, 231, 239, 0.25)",
    background: "rgba(1, 231, 239, 0.08)",
    color: "#01E7EF",
    borderRadius: "15px",
    padding: "13px 16px",
    fontWeight: 900,
    cursor: "pointer",
  },
  secondaryButton: {
    border: "1px solid rgba(155, 200, 203, 0.22)",
    background: "rgba(155, 200, 203, 0.08)",
    color: "#ECFFFF",
    borderRadius: "14px",
    padding: "11px 14px",
    fontWeight: 900,
    cursor: "pointer",
  },
  buttonGhost: {
    width: "100%",
    border: "1px solid rgba(1, 231, 239, 0.18)",
    background: "rgba(1, 231, 239, 0.08)",
    color: "#01E7EF",
    borderRadius: "14px",
    padding: "12px",
    fontWeight: 900,
    cursor: "pointer",
  },
  buttonDanger: {
    border: "1px solid rgba(255, 67, 67, 0.45)",
    background: "rgba(255, 67, 67, 0.15)",
    color: "#ff8a8a",
    borderRadius: "15px",
    padding: "13px 16px",
    fontWeight: 900,
    cursor: "pointer",
  },
  buttonDangerFull: {
    width: "100%",
    marginTop: "10px",
    border: "1px solid rgba(255, 67, 67, 0.45)",
    background: "rgba(255, 67, 67, 0.15)",
    color: "#ff8a8a",
    borderRadius: "14px",
    padding: "12px",
    fontWeight: 900,
    cursor: "pointer",
  },
}
