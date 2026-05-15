"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import styles from "./page.module.css";

const WHATSAPP_NUMBER = "51900557949";

const paises = [
  { pais: "Perú", codigo: "+51" },
  { pais: "Guatemala", codigo: "+502" },
  { pais: "México", codigo: "+52" },
  { pais: "Colombia", codigo: "+57" },
  { pais: "Ecuador", codigo: "+593" },
  { pais: "Bolivia", codigo: "+591" },
  { pais: "Chile", codigo: "+56" },
  { pais: "Argentina", codigo: "+54" },
  { pais: "Uruguay", codigo: "+598" },
  { pais: "Paraguay", codigo: "+595" },
  { pais: "Venezuela", codigo: "+58" },
  { pais: "Brasil", codigo: "+55" },
  { pais: "Panamá", codigo: "+507" },
  { pais: "Costa Rica", codigo: "+506" },
  { pais: "El Salvador", codigo: "+503" },
  { pais: "Honduras", codigo: "+504" },
  { pais: "Nicaragua", codigo: "+505" },
  { pais: "República Dominicana", codigo: "+1" },
  { pais: "Puerto Rico", codigo: "+1" },
  { pais: "Estados Unidos", codigo: "+1" },
  { pais: "Canadá", codigo: "+1" },
  { pais: "España", codigo: "+34" },
  { pais: "Alemania", codigo: "+49" },
  { pais: "Francia", codigo: "+33" },
  { pais: "Italia", codigo: "+39" },
  { pais: "Portugal", codigo: "+351" },
  { pais: "Reino Unido", codigo: "+44" },
  { pais: "Australia", codigo: "+61" },
  { pais: "Japón", codigo: "+81" },
  { pais: "China", codigo: "+86" },
];

function buildWhatsAppLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function limpiarCelular(value: string) {
  return value.replace(/[^\d]/g, "");
}

function separarNombreCompleto(nombreCompleto: string) {
  const partes = nombreCompleto.trim().replace(/\s+/g, " ").split(" ").filter(Boolean);
  const primerNombre = partes[0] || "";
  const segundoNombre = partes.slice(1).join(" ");
  return { primerNombre, segundoNombre };
}

export default function RegistroPage() {
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [pais, setPais] = useState("Perú");
  const [celular, setCelular] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [cargando, setCargando] = useState(false);

  const paisSeleccionado = useMemo(() => {
    return paises.find((item) => item.pais === pais) || paises[0];
  }, [pais]);

  const celularLimpio = limpiarCelular(celular);
  const celularCompleto = `${paisSeleccionado.codigo}${celularLimpio}`;
  const telefonoSinMas = celularCompleto.replace("+", "");

  const registrarUsuario = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (cargando) return;

    const nombreLimpio = nombre.trim().replace(/\s+/g, " ");
    const correoNormalizado = correo.trim().toLowerCase();
    const { primerNombre, segundoNombre } = separarNombreCompleto(nombreLimpio);

    if (nombreLimpio.length < 3) {
      toast.error("Ingresa tu nombre completo");
      return;
    }

    if (!correoNormalizado.includes("@")) {
      toast.error("Ingresa un correo válido");
      return;
    }

    if (celularLimpio.length < 6) {
      toast.error("Ingresa un número de celular válido");
      return;
    }

    if (contrasena.length < 6) {
      toast.error("La contraseña debe tener mínimo 6 caracteres");
      return;
    }

    if (contrasena !== confirmarContrasena) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    setCargando(true);

    try {
      const { data: usuarioExistente, error: errorBusqueda } = await supabase
        .from("usuarios")
        .select("id")
        .eq("correo", correoNormalizado)
        .maybeSingle();

      if (errorBusqueda) {
        toast.error("No se pudo verificar el correo");
        setCargando(false);
        return;
      }

      if (usuarioExistente) {
        toast.error("Este correo ya está registrado");
        setCargando(false);
        return;
      }

      const { count } = await supabase
        .from("usuarios")
        .select("id", { count: "exact", head: true });

      const numeroOrden = Number(count || 0) + 409;
      const nuevoId = crypto.randomUUID();

      const { error: errorPerfil } = await supabase.from("usuarios").insert({
        id: nuevoId,
        nombre: nombreLimpio,
        segundo_nombre: segundoNombre || null,
        correo: correoNormalizado,
        contrasena,
        pais: paisSeleccionado.pais,
        codigo_pais: paisSeleccionado.codigo,
        celular: celularLimpio,
        celular_completo: celularCompleto,
        telefono: telefonoSinMas,
        numero_orden: numeroOrden,
        prefijo_cliente: String(numeroOrden),
        etiqueta_contacto: "| SV |",
        rol: "cliente",
        estado: "pendiente",
      });

      if (errorPerfil) {
        console.error("Error creando usuario:", errorPerfil);
        toast.error(errorPerfil.message || "No se pudo guardar el usuario");
        setCargando(false);
        return;
      }

      toast.success("Registro enviado. Espera aprobación del admin.");
      router.push("/login");
    } catch (error) {
      console.error("Error inesperado:", error);
      toast.error("Error inesperado al crear la cuenta");
      setCargando(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.bgGlowOne} />
      <div className={styles.bgGlowTwo} />
      <div className={styles.gridOverlay} />

      <div className={styles.sideBrand}>JONAS STREAM</div>
      <div className={`${styles.sideBrand} ${styles.sideBrandRight}`}>JONAS STREAM</div>

      <header className={styles.topbarWrap}>
        <div className={styles.topbar}>
          <Link href="/" className={styles.brandBlock} aria-label="Ir al inicio">
            <strong>JONAS STREAM</strong>
            <span>REGISTRO OFICIAL</span>
          </Link>

          <div className={styles.topActions}>
            <Link href="/" className={styles.topLink}>
              INICIO
            </Link>

            <Link href="/login" className={styles.topLink}>
              INICIAR SESIÓN
            </Link>

            <a
              href={buildWhatsAppLink("Hola Jonas Stream, necesito ayuda con mi registro.")}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.topLinkPrimary}
            >
              CONTÁCTANOS
            </a>
          </div>
        </div>
      </header>

      <section className={styles.heroPanel}>
        <div className={styles.heroBadge}>NUEVA CUENTA</div>

        <h1 className={styles.heroTitle}>
          CREA TU
          <span> ACCESO</span>
        </h1>

        <p className={styles.heroText}>
          Regístrate para solicitar acceso a Jonas Stream. Tu cuenta quedará pendiente hasta que el
          administrador revise y apruebe tu solicitud.
        </p>

        <div className={styles.accessGrid}>
          <div className={styles.accessCard}>
            <span>01</span>
            <strong>Envías tu solicitud</strong>
          </div>

          <div className={styles.accessCard}>
            <span>02</span>
            <strong>Admin revisa</strong>
          </div>

          <div className={styles.accessCard}>
            <span>03</span>
            <strong>Acceso aprobado</strong>
          </div>
        </div>

        <p className={styles.panelNote}>
          El administrador verá tu país, código y número completo para contactarte más rápido.
        </p>
      </section>

      <section className={styles.formSection}>
        <form onSubmit={registrarUsuario} className={styles.registerCard}>
          <div className={styles.cardGlow} />

          <div className={styles.formHeader}>
            <span className={styles.formKicker}>SOLICITUD DE ACCESO</span>
            <h2>Registro</h2>
            <p>Completa tus datos para crear tu cuenta.</p>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <label htmlFor="nombre">Nombre completo</label>
              <div className={styles.inputWrap}>
                <input
                  id="nombre"
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Tu nombre completo"
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="correo">Correo electrónico</label>
              <div className={styles.inputWrap}>
                <input
                  id="correo"
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="tunombre@correo.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="pais">País</label>
              <div className={styles.inputWrap}>
                <select
                  id="pais"
                  value={pais}
                  onChange={(e) => {
                    setPais(e.target.value);
                    setCelular("");
                  }}
                  required
                >
                  {paises.map((item) => (
                    <option key={`${item.pais}-${item.codigo}`} value={item.pais}>
                      {item.pais} ({item.codigo})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="celular">Celular</label>
              <div className={`${styles.inputWrap} ${styles.phoneWrap}`}>
                <span className={styles.phoneCode}>{paisSeleccionado.codigo}</span>

                <input
                  id="celular"
                  type="tel"
                  value={celular}
                  onChange={(e) => setCelular(limpiarCelular(e.target.value))}
                  placeholder="Ingresa tu número"
                  autoComplete="tel-national"
                  required
                />
              </div>

              {celularLimpio.length > 0 && (
                <p className={styles.phonePreview}>
                  Número completo: <strong>{celularCompleto}</strong>
                </p>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="contrasena">Contraseña</label>
              <div className={`${styles.inputWrap} ${styles.passwordWrap}`}>
                <input
                  id="contrasena"
                  type={mostrarContrasena ? "text" : "password"}
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                  required
                />

                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setMostrarContrasena((prev) => !prev)}
                  aria-label={mostrarContrasena ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {mostrarContrasena ? "OCULTAR" : "VER"}
                </button>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="confirmarContrasena">Confirmar contraseña</label>
              <div className={styles.inputWrap}>
                <input
                  id="confirmarContrasena"
                  type={mostrarContrasena ? "text" : "password"}
                  value={confirmarContrasena}
                  onChange={(e) => setConfirmarContrasena(e.target.value)}
                  placeholder="Repite tu contraseña"
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>
          </div>

          <button type="submit" disabled={cargando} className={styles.submitButton}>
            {cargando ? "Enviando solicitud..." : "Crear cuenta"}
          </button>

          <div className={styles.formFooter}>
            <Link href="/login" className={styles.secondaryLink}>
              Ya tengo cuenta
            </Link>

            <span>Tu cuenta se creará como cliente y quedará pendiente de aprobación.</span>
          </div>
        </form>
      </section>

      <footer className={styles.footerWrap}>
        <div className={styles.footerLegal}>
          © 2026 Jonas Stream. Todos los derechos reservados.

          <div className={styles.footerLinks}>
            <Link href="/terminos">Términos y Condiciones</Link>
            <span className={styles.footerSeparator}>•</span>
            <Link href="/privacidad">Política de Privacidad</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
