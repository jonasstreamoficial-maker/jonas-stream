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

const ENLACE_CODIGOS = "https://jonasstream.xyz/codigos"

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
    <main style={stylesPage.page}>
      <section style={stylesPage.container}>
        <header style={stylesPage.header}>
          <div>
            <p style={stylesPage.kicker}>JONAS STREAM · SOPORTE PANEL</p>
            <h1 style={stylesPage.title}>Control de correos y PIN</h1>
            <p style={stylesPage.description}>
              Administra correos asignados, PIN de acceso y estado de consulta para
              que tus clientes revisen sus códigos desde /codigos.
            </p>
          </div>

          <div style={stylesPage.adminCard}>
            <p style={stylesPage.mutedSmall}>Administrador</p>
            <strong>{usuario?.nombre || "Admin"}</strong>
            <span style={stylesPage.smallText}>{usuario?.correo}</span>

            <button type="button" onClick={cerrarSesion} style={stylesPage.buttonGhost}>
              Cerrar sesión
            </button>
          </div>
        </header>

        <div style={stylesPage.statsGrid}>
          <StatCard label="Correos activos" value={resumen.activos} />
          <StatCard label="Correos vencidos" value={resumen.vencidos} />
          <StatCard label="Suspendidos" value={resumen.suspendidos} />
          <StatCard label="Sin PIN" value={resumen.sinPin} />
        </div>

        <section style={stylesPage.panel}>
          <div style={stylesPage.panelHeader}>
            <div>
              <p style={stylesPage.kicker}>GESTIÓN DE ACCESOS</p>
              <h2 style={{ margin: "10px 0" }}>
                {editandoId ? "Editar correo asignado" : "Registrar correo asignado"}
              </h2>
              <p style={stylesPage.muted}>
                Registra el correo, la plataforma y el PIN que usará el cliente para
                entrar a la página pública de códigos.
              </p>
            </div>

            <button type="button" onClick={actualizarVencidos} style={stylesPage.buttonSecondary}>
              Marcar vencidos
            </button>
          </div>

          {mensaje && <div style={stylesPage.notice}>{mensaje}</div>}

          <form onSubmit={guardarCuenta} style={stylesPage.formGrid}>
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
              <option value="Netflix">Netflix</option>
              <option value="Prime Video">Prime Video</option>
              <option value="Disney+">Disney+</option>
              <option value="Crunchyroll">Crunchyroll</option>
              <option value="Vix">Vix</option>
              <option value="Max">Max</option>
              <option value="Spotify">Spotify</option>
              <option value="YouTube Premium">YouTube Premium</option>
              <option value="Otro">Otro</option>
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

        <section style={stylesPage.panel}>
          <div style={stylesPage.panelHeader}>
            <div>
              <p style={stylesPage.kicker}>CORREOS REGISTRADOS</p>
              <h2 style={{ margin: "10px 0" }}>Lista de accesos</h2>
              <p style={stylesPage.muted}>
                Desde aquí cambias el PIN, activas o suspendes el acceso público
                y revisas los mensajes recibidos.
              </p>
            </div>

            <button type="button" onClick={cargarDatos} style={stylesPage.buttonSecondary}>
              Actualizar
            </button>
          </div>

          <div style={stylesPage.filters}>
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
            <div style={stylesPage.tableWrap}>
              <table style={stylesPage.table}>
                <thead>
                  <tr>
                    <th style={stylesPage.th}>Correo</th>
                    <th style={stylesPage.th}>Plataforma</th>
                    <th style={stylesPage.th}>PIN</th>
                    <th style={stylesPage.th}>Vence</th>
                    <th style={stylesPage.th}>Estado</th>
                    <th style={stylesPage.th}>Mensajes</th>
                    <th style={stylesPage.th}>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {cuentasFiltradas.map((cuenta) => {
                    const dias = diasRestantes(cuenta.fecha_vencimiento)
                    const resumenCorreo = resumenMensajes.get(
                      cuenta.correo_asignado.toLowerCase()
                    )

                    return (
                      <tr key={cuenta.id}>
                        <td style={stylesPage.td}>
                          <strong>{cuenta.correo_asignado}</strong>
                          <span style={stylesPage.smallText}>
                            {cuenta.nombre || "Sin etiqueta"}
                          </span>
                          {cuenta.celular && (
                            <span style={stylesPage.smallText}>WhatsApp: {cuenta.celular}</span>
                          )}
                        </td>

                        <td style={stylesPage.td}>
                          <strong>{cuenta.plataforma}</strong>
                          {cuenta.correo_cliente && (
                            <span style={stylesPage.smallText}>
                              Cliente: {cuenta.correo_cliente}
                            </span>
                          )}
                        </td>

                        <td style={stylesPage.td}>
                          <strong style={stylesPage.pinText}>
                            {cuenta.pin_acceso || "SIN PIN"}
                          </strong>
                        </td>

                        <td style={stylesPage.td}>
                          <strong>{cuenta.fecha_vencimiento}</strong>
                          <span style={stylesPage.smallText}>
                            {dias < 0
                              ? `Vencido hace ${Math.abs(dias)} día(s)`
                              : `Faltan ${dias} día(s)`}
                          </span>
                        </td>

                        <td style={stylesPage.td}>
                          <EstadoBadge estado={cuenta.estado} dias={dias} />
                        </td>

                        <td style={stylesPage.td}>
                          <strong>{resumenCorreo?.total || 0}</strong>
                          <span style={stylesPage.smallText}>
                            {resumenCorreo?.ultimoAsunto || "Sin mensajes recientes"}
                          </span>
                          {resumenCorreo?.ultimaFecha && (
                            <span style={stylesPage.smallText}>
                              {new Date(resumenCorreo.ultimaFecha).toLocaleString("es-PE")}
                            </span>
                          )}
                        </td>

                        <td style={stylesPage.td}>
                          <div style={stylesPage.actions}>
                            <button
                              type="button"
                              onClick={() => copiarAcceso(cuenta)}
                              style={stylesPage.buttonMini}
                            >
                              Copiar acceso
                            </button>

                            <button
                              type="button"
                              onClick={() => editarPinRapido(cuenta)}
                              style={stylesPage.buttonMiniGhost}
                            >
                              Editar PIN
                            </button>

                            <button
                              type="button"
                              onClick={() => generarNuevoPin(cuenta)}
                              style={stylesPage.buttonMiniGhost}
                            >
                              Nuevo PIN
                            </button>

                            <button
                              type="button"
                              onClick={() => abrirMensajes(cuenta)}
                              style={stylesPage.buttonMiniGhost}
                            >
                              Ver mensajes
                            </button>

                            <button
                              type="button"
                              onClick={() => renovarCuenta(cuenta)}
                              style={stylesPage.buttonMiniGhost}
                            >
                              +30 días
                            </button>

                            <button
                              type="button"
                              onClick={() => editarCuenta(cuenta)}
                              style={stylesPage.buttonMiniGhost}
                            >
                              Editar
                            </button>

                            {cuenta.estado === "activo" ? (
                              <button
                                type="button"
                                onClick={() => cambiarEstado(cuenta, "suspendido")}
                                style={stylesPage.buttonWarning}
                              >
                                Suspender
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => cambiarEstado(cuenta, "activo")}
                                style={stylesPage.buttonMiniGhost}
                              >
                                Activar
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => eliminarCuenta(cuenta)}
                              style={stylesPage.buttonDanger}
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
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
    background:
      "radial-gradient(circle at top left, rgba(1, 231, 239, 0.18), transparent 35%), radial-gradient(circle at bottom right, rgba(0, 251, 255, 0.14), transparent 35%), linear-gradient(135deg, #000000, #031316, #071B1E)",
    color: "#ECFFFF",
    padding: "40px",
    fontFamily: "Arial, sans-serif",
  },
  centerPage: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top left, rgba(1, 231, 239, 0.18), transparent 35%), linear-gradient(135deg, #000000, #031316, #071B1E)",
    color: "#ECFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Arial, sans-serif",
  },
  loadingBox: {
    border: "1px solid rgba(1, 231, 239, 0.18)",
    background: "rgba(3, 19, 22, 0.78)",
    borderRadius: "22px",
    padding: "28px",
    boxShadow: "0 0 40px rgba(0, 251, 255, 0.22)",
    textAlign: "center",
  },
  container: {
    maxWidth: "1380px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    alignItems: "center",
    marginBottom: "34px",
  },
  kicker: {
    color: "#01E7EF",
    letterSpacing: "0.16em",
    fontWeight: 900,
    fontSize: "13px",
    margin: 0,
  },
  title: {
    fontSize: "52px",
    margin: "12px 0",
    lineHeight: 1,
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
    marginTop: "4px",
  },
  adminCard: {
    border: "1px solid rgba(1, 231, 239, 0.18)",
    background: "rgba(3, 19, 22, 0.78)",
    borderRadius: "20px",
    padding: "16px",
    minWidth: "260px",
    boxShadow: "0 0 25px rgba(1, 231, 239, 0.18)",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "18px",
    marginTop: "36px",
  },
  statCard: {
    border: "1px solid rgba(1, 231, 239, 0.18)",
    background: "rgba(3, 19, 22, 0.78)",
    borderRadius: "22px",
    padding: "24px",
    boxShadow: "0 0 25px rgba(1, 231, 239, 0.18)",
  },
  statValue: {
    display: "block",
    color: "#01E7EF",
    fontSize: "38px",
    marginTop: "12px",
  },
  panel: {
    marginTop: "30px",
    border: "1px solid rgba(1, 231, 239, 0.18)",
    background: "rgba(3, 19, 22, 0.78)",
    borderRadius: "24px",
    padding: "24px",
    boxShadow: "0 0 25px rgba(1, 231, 239, 0.18)",
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    alignItems: "center",
    marginBottom: "22px",
  },
  notice: {
    border: "1px solid rgba(1, 231, 239, 0.25)",
    background: "rgba(1, 231, 239, 0.08)",
    color: "#ECFFFF",
    borderRadius: "16px",
    padding: "14px",
    marginBottom: "18px",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "14px",
  },
  filters: {
    display: "grid",
    gridTemplateColumns: "1fr 240px",
    gap: "14px",
    marginBottom: "20px",
  },
  input: {
    width: "100%",
    border: "1px solid rgba(1, 231, 239, 0.18)",
    outline: "none",
    borderRadius: "15px",
    padding: "14px 15px",
    background: "rgba(0, 0, 0, 0.34)",
    color: "#ECFFFF",
    fontSize: "14px",
  },
  formActions: {
    gridColumn: "1 / -1",
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  buttonPrimary: {
    border: "none",
    background: "linear-gradient(135deg, #01E7EF, #00FBFF)",
    color: "#000000",
    borderRadius: "15px",
    padding: "14px 18px",
    fontWeight: 950,
    cursor: "pointer",
  },
  buttonSecondary: {
    border: "1px solid rgba(1, 231, 239, 0.25)",
    background: "rgba(1, 231, 239, 0.08)",
    color: "#01E7EF",
    borderRadius: "15px",
    padding: "14px 18px",
    fontWeight: 900,
    cursor: "pointer",
  },
  buttonGhost: {
    width: "100%",
    marginTop: "14px",
    border: "1px solid rgba(1, 231, 239, 0.18)",
    background: "rgba(1, 231, 239, 0.08)",
    color: "#01E7EF",
    borderRadius: "14px",
    padding: "12px",
    fontWeight: 900,
    cursor: "pointer",
  },
  tableWrap: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "1180px",
  },
  th: {
    color: "#01E7EF",
    textAlign: "left",
    padding: "14px",
    borderBottom: "1px solid rgba(1, 231, 239, 0.18)",
    fontSize: "13px",
    textTransform: "uppercase",
  },
  td: {
    padding: "14px",
    borderBottom: "1px solid rgba(1, 231, 239, 0.1)",
    color: "#ECFFFF",
    verticalAlign: "top",
  },
  pinText: {
    color: "#00FBFF",
    letterSpacing: "0.12em",
    fontSize: "16px",
  },
  actions: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    maxWidth: "360px",
  },
  buttonMini: {
    border: "none",
    background: "#00FBFF",
    color: "#000000",
    borderRadius: "999px",
    padding: "8px 11px",
    fontSize: "12px",
    fontWeight: 900,
    cursor: "pointer",
  },
  buttonMiniGhost: {
    border: "1px solid rgba(1, 231, 239, 0.25)",
    background: "rgba(1, 231, 239, 0.08)",
    color: "#01E7EF",
    borderRadius: "999px",
    padding: "8px 11px",
    fontSize: "12px",
    fontWeight: 900,
    cursor: "pointer",
  },
  buttonWarning: {
    border: "1px solid rgba(255, 204, 102, 0.45)",
    background: "rgba(255, 204, 102, 0.14)",
    color: "#ffcc66",
    borderRadius: "999px",
    padding: "8px 11px",
    fontSize: "12px",
    fontWeight: 900,
    cursor: "pointer",
  },
  buttonDanger: {
    border: "1px solid rgba(255, 67, 67, 0.45)",
    background: "rgba(255, 67, 67, 0.15)",
    color: "#ff8a8a",
    borderRadius: "999px",
    padding: "8px 11px",
    fontSize: "12px",
    fontWeight: 900,
    cursor: "pointer",
  },
}