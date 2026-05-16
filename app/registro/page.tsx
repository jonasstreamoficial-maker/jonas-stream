"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";
import styles from "./page.module.css";

const WHATSAPP_NUMBER = "51900557949";
const ETIQUETA_DEFAULT = "| SV |";

const paises = [
  { pais: "Peru", codigo: "+51" },
  { pais: "Guatemala", codigo: "+502" },
  { pais: "Mexico", codigo: "+52" },
  { pais: "Colombia", codigo: "+57" },
  { pais: "Ecuador", codigo: "+593" },
  { pais: "Bolivia", codigo: "+591" },
  { pais: "Chile", codigo: "+56" },
  { pais: "Argentina", codigo: "+54" },
  { pais: "Uruguay", codigo: "+598" },
  { pais: "Paraguay", codigo: "+595" },
  { pais: "Venezuela", codigo: "+58" },
  { pais: "Brasil", codigo: "+55" },
  { pais: "Panama", codigo: "+507" },
  { pais: "Costa Rica", codigo: "+506" },
  { pais: "El Salvador", codigo: "+503" },
  { pais: "Honduras", codigo: "+504" },
  { pais: "Nicaragua", codigo: "+505" },
  { pais: "Republica Dominicana", codigo: "+1" },
  { pais: "Puerto Rico", codigo: "+1" },
  { pais: "Estados Unidos", codigo: "+1" },
  { pais: "Canada", codigo: "+1" },
  { pais: "Espana", codigo: "+34" },
  { pais: "Alemania", codigo: "+49" },
  { pais: "Francia", codigo: "+33" },
  { pais: "Italia", codigo: "+39" },
  { pais: "Portugal", codigo: "+351" },
  { pais: "Reino Unido", codigo: "+44" },
  { pais: "Australia", codigo: "+61" },
  { pais: "Japon", codigo: "+81" },
  { pais: "China", codigo: "+86" },
];

function buildWhatsAppLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function limpiarCelular(value: string) {
  return value.replace(/[^\d]/g, "");
}

function separarNombreCompleto(nombreCompleto: string) {
  const partes = nombreCompleto.trim().split(/\s+/).filter(Boolean);
  return {
    primerNombre: partes[0] || "",
    segundoNombre: partes.slice(1).join(" "),
  };
}

export default function RegistroPage() {
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [pais, setPais] = useState("Peru");
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
  const telefonoSinMas = celularCompleto.replace(/[^\d]/g, "");

  const registrarUsuario = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (cargando) return;

    const nombreLimpio = nombre.trim().replace(/\s+/g, " ");
    const correoNormalizado = correo.trim().toLowerCase();
    const { primerNombre, segundoNombre } = separarNombreCompleto(nombreLimpio);

    if (nombreLimpio.length < 3 || !primerNombre) {
      toast.error("Ingresa tu nombre completo");
      return;
    }

    if (celularLimpio.length < 6) {
      toast.error("Ingresa un numero de celular valido");
      return;
    }

    if (contrasena.length < 6) {
      toast.error("La contrasena debe tener minimo 6 caracteres");
      return;
    }

    if (contrasena !== confirmarContrasena) {
      toast.error("Las contrasenas no coinciden");
      return;
    }

    setCargando(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: correoNormalizado,
        password: contrasena,
        options: {
          data: {
            nombre: primerNombre,
            nombre_completo: nombreLimpio,
            segundo_nombre: segundoNombre,
            pais: paisSeleccionado.pais,
            codigo_pais: paisSeleccionado.codigo,
            celular: celularLimpio,
            celular_completo: celularCompleto,
            telefono: telefonoSinMas,
            etiqueta_contacto: ETIQUETA_DEFAULT,
          },
        },
      });

      if (error) {
        toast.error(error.message);
        setCargando(false);
        return;
      }

      const user = data.user;

      if (!user) {
        toast.error("No se pudo crear el usuario");
        setCargando(false);
        return;
      }

      const perfil = {
        id: user.id,
        nombre: primerNombre,
        segundo_nombre: segundoNombre || null,
        correo: correoNormalizado,
        pais: paisSeleccionado.pais,
        codigo_pais: paisSeleccionado.codigo,
        celular: celularLimpio,
        celular_completo: celularCompleto,
        telefono: telefonoSinMas,
        etiqueta_contacto: ETIQUETA_DEFAULT,
        rol: "cliente",
        estado: "pendiente",
      };

      const { error: errorPerfil } = await supabase
        .from("usuarios")
        .upsert(perfil, { onConflict: "id" });

      if (errorPerfil) {
        toast.error(`Usuario creado en Auth, pero fallo el perfil: ${errorPerfil.message}`);
        setCargando(false);
        return;
      }

      await supabase.auth.signOut();
      toast.success("Registro enviado. Espera aprobacion del admin.");
      router.push("/login");
    } catch (error) {
      const detalle = error instanceof Error ? error.message : "Error desconocido";
      toast.error(detalle);
      setCargando(false);
      return;
    }

    setCargando(false);
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
              INICIAR SESION
            </Link>

            <a
              href={buildWhatsAppLink("Hola Jonas Stream, necesito ayuda con mi registro.")}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.topLinkPrimary}
            >
              CONTACTANOS
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
          Registrate para solicitar acceso a Jonas Stream. Tu cuenta quedara pendiente hasta que el
          administrador revise y apruebe tu solicitud.
        </p>

        <div className={styles.accessGrid}>
          <div className={styles.accessCard}>
            <span>01</span>
            <strong>Envias tu solicitud</strong>
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
          El administrador vera tu pais, codigo y numero completo para contactarte mas rapido.
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
                  placeholder="Ejemplo: Cristhian Yaipen"
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="correo">Correo electronico</label>
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
              <label htmlFor="pais">Pais</label>
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
                  placeholder="Ingresa tu numero"
                  autoComplete="tel-national"
                  required
                />
              </div>

              {celularLimpio.length > 0 && (
                <p className={styles.phonePreview}>
                  Numero completo: <strong>{telefonoSinMas}</strong>
                </p>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="contrasena">Contrasena</label>
              <div className={`${styles.inputWrap} ${styles.passwordWrap}`}>
                <input
                  id="contrasena"
                  type={mostrarContrasena ? "text" : "password"}
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  placeholder="Minimo 6 caracteres"
                  autoComplete="new-password"
                  required
                />

                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setMostrarContrasena((prev) => !prev)}
                  aria-label={mostrarContrasena ? "Ocultar contrasena" : "Mostrar contrasena"}
                >
                  {mostrarContrasena ? "OCULTAR" : "VER"}
                </button>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="confirmarContrasena">Confirmar contrasena</label>
              <div className={styles.inputWrap}>
                <input
                  id="confirmarContrasena"
                  type={mostrarContrasena ? "text" : "password"}
                  value={confirmarContrasena}
                  onChange={(e) => setConfirmarContrasena(e.target.value)}
                  placeholder="Repite tu contrasena"
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

            <span>Tu cuenta se creara como cliente y quedara pendiente de aprobacion.</span>
          </div>
        </form>
      </section>

      <footer className={styles.footerWrap}>
        <div className={styles.footerLegal}>
          © 2026 Jonas Stream. Todos los derechos reservados.

          <div className={styles.footerLinks}>
            <Link href="/terminos">Terminos y Condiciones</Link>
            <span className={styles.footerSeparator}>•</span>
            <Link href="/privacidad">Politica de Privacidad</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
