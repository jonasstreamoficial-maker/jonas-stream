"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";

type LegalModal = "terms" | "privacy" | null;

function LegalDialog({
  activeModal,
  onClose,
}: {
  activeModal: LegalModal;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!activeModal) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeModal, onClose]);

  if (!activeModal) return null;

  const isTerms = activeModal === "terms";
  const title = isTerms ? "TÉRMINOS Y CONDICIONES" : "POLÍTICA DE PRIVACIDAD";

  return (
    <div
      className="legal-modal-overlay"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        className="legal-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="legal-modal-top">
          <div>
            <p className="legal-modal-kicker">JONAS STREAM</p>
            <h2 id="legal-modal-title">{title}</h2>
          </div>

          <button
            type="button"
            className="legal-modal-close"
            onClick={onClose}
            aria-label="Cerrar ventana legal"
          >
            ×
          </button>
        </div>

        <div className="legal-modal-body">
          <div className="legal-modal-meta">
            <span>Última actualización: 2026</span>
          </div>

          {isTerms ? <TermsContent /> : <PrivacyContent />}
        </div>
      </section>
    </div>
  );
}

function TermsContent() {
  return (
    <div className="legal-copy">
      <p className="legal-lead">
        Bienvenido a Jonas Stream. Al adquirir, contratar o utilizar nuestros
        servicios, usted acepta los presentes Términos y Condiciones. Si no está
        de acuerdo, no debe utilizar nuestros servicios.
      </p>

      <hr />

      <h3>1. Naturaleza del servicio</h3>
      <p>
        Jonas Stream ofrece servicios de gestión, activación y soporte de
        accesos a plataformas digitales de entretenimiento. No representamos
        oficialmente a las marcas de streaming mencionadas ni tenemos relación
        directa con ellas.
      </p>

      <h3>2. Condiciones de uso</h3>
      <p>El cliente acepta:</p>
      <ul>
        <li>Usar los accesos únicamente para uso personal</li>
        <li>No compartir cuentas con terceros no autorizados</li>
        <li>No modificar correos, contraseñas o perfiles entregados</li>
        <li>No alterar configuraciones de seguridad</li>
        <li>No realizar usos abusivos del servicio</li>
      </ul>

      <div className="legal-note">
        El incumplimiento puede generar suspensión inmediata sin reembolso.
      </div>

      <h3>3. Entrega del servicio</h3>
      <p>
        Las activaciones se realizan dentro del horario de atención informado por
        nuestros canales oficiales. Los tiempos pueden variar según demanda y
        verificación de pago.
      </p>

      <h3>4. Pagos</h3>
      <p>
        Todos los servicios son de pago anticipado. La activación se realiza
        únicamente después de la confirmación del pago.
      </p>

      <h3>5. Garantía y soporte</h3>
      <p>
        Se brinda soporte técnico durante el período contratado. La garantía
        cubre fallas de acceso no causadas por mal uso del cliente.
      </p>
      <p>
        <b>No cubre:</b>
      </p>
      <ul>
        <li>Bloqueos por uso indebido</li>
        <li>Cambios realizados por el usuario</li>
        <li>Incumplimiento de instrucciones</li>
        <li>Compartir accesos</li>
      </ul>

      <h3>6. Reembolsos</h3>
      <p>
        No se realizan reembolsos una vez entregado el acceso, salvo que exista
        imposibilidad técnica definitiva de cumplir el servicio.
      </p>

      <h3>7. Suspensión del servicio</h3>
      <p>Podemos suspender el servicio si detectamos:</p>
      <ul>
        <li>Uso indebido</li>
        <li>Compartición no autorizada</li>
        <li>Manipulación de credenciales</li>
        <li>Incumplimiento de reglas</li>
      </ul>

      <h3>8. No afiliación</h3>
      <p>
        Jonas Stream no está afiliado oficialmente a las plataformas de streaming
        mencionadas. Las marcas pertenecen a sus respectivos propietarios.
      </p>

      <h3>9. Modificaciones</h3>
      <p>
        Nos reservamos el derecho de modificar estos términos en cualquier
        momento. Los cambios entran en vigencia al ser publicados.
      </p>

      <div className="legal-copy-footer">
        Para consultas o soporte, comunícate por nuestros canales oficiales.
      </div>
    </div>
  );
}

function PrivacyContent() {
  return (
    <div className="legal-copy">
      <p className="legal-lead">
        En Jonas Stream respetamos la privacidad de nuestros clientes y
        protegemos sus datos personales.
      </p>

      <hr />

      <h3>1. Información que recopilamos</h3>
      <p>Podemos recopilar:</p>
      <ul>
        <li>Nombre</li>
        <li>Número de WhatsApp</li>
        <li>Usuario de redes sociales</li>
        <li>Datos necesarios para activar servicios</li>
        <li>Información de contacto</li>
      </ul>

      <h3>2. Uso de la información</h3>
      <p>Usamos la información únicamente para:</p>
      <ul>
        <li>Activación de servicios</li>
        <li>Soporte técnico</li>
        <li>Comunicación con el cliente</li>
        <li>Validación de pagos</li>
        <li>Atención de consultas</li>
      </ul>

      <h3>3. Protección de datos</h3>
      <p>
        Aplicamos medidas razonables de seguridad para proteger la información
        del cliente y evitar accesos no autorizados.
      </p>

      <h3>4. No venta de datos</h3>
      <p>No vendemos, alquilamos ni compartimos datos personales con terceros.</p>

      <h3>5. Comunicaciones</h3>
      <p>Podemos contactar al cliente para:</p>
      <ul>
        <li>Entrega de accesos</li>
        <li>Soporte</li>
        <li>Avisos de servicio</li>
        <li>Renovaciones</li>
      </ul>
      <p>No enviamos publicidad masiva no solicitada.</p>

      <h3>6. Solicitud de eliminación</h3>
      <p>
        El cliente puede solicitar la eliminación de sus datos contactándonos por
        los canales oficiales.
      </p>

      <h3>7. Cambios en la política</h3>
      <p>
        Podemos actualizar esta Política de Privacidad cuando sea necesario. Los
        cambios entran en vigencia al publicarse.
      </p>

      <div className="legal-copy-footer">
        Para consultas sobre privacidad, contáctanos por nuestros canales
        oficiales.
      </div>
    </div>
  );
}


type SocialIcon =
  | "facebook"
  | "instagram"
  | "tiktok"
  | "telegram"
  | "youtube"
  | "whatsapp"
  | "web";

type SocialLink = {
  id: string;
  name: string;
  url: string;
  icon: SocialIcon;
  color: string;
  enabled: boolean;
};

type HomeDraft = {
  brandName: string;
  brandSubtitle: string;
  navLoginText: string;
  navContactText: string;
  whatsappNumber: string;
  whatsappMessage: string;
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  primaryButtonText: string;
  primaryButtonHref: string;
  secondaryButtonText: string;
  secondaryButtonHref: string;
  logoImage: string;
  sideBrandText: string;
  showSideBrand: boolean;
  primaryColor: string;
  glowColor: string;
  panelColor: string;
  benefit1Icon: string;
  benefit1Text: string;
  benefit2Icon: string;
  benefit2Text: string;
  benefit3Icon: string;
  benefit3Text: string;
  stat1Kicker: string;
  stat1Title: string;
  stat1Text: string;
  stat2Kicker: string;
  stat2Title: string;
  stat2Text: string;
  stat3Kicker: string;
  stat3Title: string;
  stat3Text: string;
  socialTitle: string;
  socialText: string;
  socials: SocialLink[];
  footerText: string;
};

const defaultHomeDraft: HomeDraft = {
  brandName: "JONAS STREAM",
  brandSubtitle: "PLATAFORMA OFICIAL",
  navLoginText: "INICIAR SESIÓN",
  navContactText: "CONTÁCTANOS",
  whatsappNumber: "51900557949",
  whatsappMessage: "Hola Jonas Stream, quiero información sobre sus servicios.",
  heroBadge: "BIENVENID@S",
  heroTitle: "JONAS STREAM",
  heroSubtitle: "PLATAFORMA OFICIAL",
  heroDescription:
    "Tu proveedor de confianza en plataformas de streaming, música y accesos digitales premium. Disfruta una experiencia moderna, rápida y segura, diseñada para clientes y revendedores que buscan calidad, soporte y confianza.",
  primaryButtonText: "QUIERO SER SOCIO",
  primaryButtonHref: "/quiero-ser-socio",
  secondaryButtonText: "VER PRECIOS",
  secondaryButtonHref: "/ver-precios",
  logoImage: "/perfil-web.jpg",
  sideBrandText: "JONAS STREAM",
  showSideBrand: true,
  primaryColor: "#01E7EF",
  glowColor: "#00FBFF",
  panelColor: "rgba(3, 19, 22, 0.78)",
  benefit1Icon: "⚡",
  benefit1Text: "Velocidad",
  benefit2Icon: "🛡️",
  benefit2Text: "Garantía",
  benefit3Icon: "💸",
  benefit3Text: "Ahorro",
  stat1Kicker: "Confianza",
  stat1Title: "+2K CLIENTES",
  stat1Text:
    "Más de dos mil usuarios ya confiaron en Jonas Stream para obtener accesos digitales premium con atención seria y servicio seguro.",
  stat2Kicker: "Atención",
  stat2Title: "SOPORTE 24/7",
  stat2Text:
    "Respuesta rápida para ventas, activaciones, consultas y soporte técnico, con acompañamiento cuando más lo necesites.",
  stat3Kicker: "Automatización",
  stat3Title: "BOT TELEGRAM",
  stat3Text:
    "Sistema automatizado para respuestas inmediatas y una experiencia mucho más profesional, ordenada y eficiente.",
  socialTitle: "Síguenos en Nuestras Redes Sociales",
  socialText:
    "Conéctate con Jonas Stream en Facebook, Instagram, TikTok, Telegram y YouTube.",
  socials: [
    {
      id: "facebook",
      name: "Facebook",
      url: "https://www.facebook.com/jonasstream.oficiall",
      icon: "facebook",
      color: "#1877F2",
      enabled: true,
    },
    {
      id: "instagram",
      name: "Instagram",
      url: "https://www.instagram.com/jonasstream.oficiall/",
      icon: "instagram",
      color: "#E4405F",
      enabled: true,
    },
    {
      id: "tiktok",
      name: "TikTok",
      url: "https://www.tiktok.com/@jonasstream.oficiall",
      icon: "tiktok",
      color: "#25F4EE",
      enabled: true,
    },
    {
      id: "telegram",
      name: "Telegram",
      url: "https://t.me/jonasstream_oficiall",
      icon: "telegram",
      color: "#229ED9",
      enabled: true,
    },
    {
      id: "youtube",
      name: "YouTube",
      url: "https://www.youtube.com/@jonasstream.oficiall",
      icon: "youtube",
      color: "#FF0000",
      enabled: true,
    },
  ],
  footerText: "© 2026 Jonas Stream. Todos los derechos reservados.",
};

function mergeHomeDraft(content: unknown): HomeDraft {
  if (!content || typeof content !== "object" || Array.isArray(content)) {
    return defaultHomeDraft;
  }

  const value = content as Partial<HomeDraft>;

  return {
    ...defaultHomeDraft,
    ...value,
    socials: Array.isArray(value.socials) ? value.socials : defaultHomeDraft.socials,
  };
}

function buildWhatsappUrl(number: string, message: string) {
  const cleanNumber = number.replace(/\D/g, "");
  const encodedMessage = encodeURIComponent(message || "Hola Jonas Stream, quiero información.");
  return `https://wa.me/${cleanNumber || "51900557949"}?text=${encodedMessage}`;
}

function normalizeHref(value: string) {
  if (!value) return "/";
  return value.startsWith("/") || value.startsWith("http") ? value : `/${value}`;
}

function SocialIconSvg({ icon }: { icon: SocialIcon }) {
  if (icon === "facebook") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.8c0-.9.2-1.6 1.6-1.6H16.7V4.3c-.3 0-1.3-.1-2.4-.1-2.4 0-4.1 1.5-4.1 4.2v2.4H7.5V14h2.7v8h3.3z" />
      </svg>
    );
  }

  if (icon === "instagram") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.8A3.95 3.95 0 0 0 3.8 7.75v8.5a3.95 3.95 0 0 0 3.95 3.95h8.5a3.95 3.95 0 0 0 3.95-3.95v-8.5a3.95 3.95 0 0 0-3.95-3.95h-8.5zm8.95 1.35a1.15 1.15 0 1 1 0 2.3 1.15 1.15 0 0 1 0-2.3zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 1.8A3.2 3.2 0 1 0 12 15.2 3.2 3.2 0 0 0 12 8.8z" />
      </svg>
    );
  }

  if (icon === "tiktok") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14.5 3c.5 2.1 1.8 3.6 3.9 4V9c-1.4 0-2.7-.4-3.9-1.2v6.5a4.8 4.8 0 1 1-4.8-4.8c.3 0 .5 0 .8.1v2.4a2.7 2.7 0 1 0 1.9 2.6V3h2.1z" />
      </svg>
    );
  }

  if (icon === "telegram") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M21.4 4.6 18.3 19c-.2 1-.8 1.2-1.6.8l-4.4-3.2-2.1 2c-.2.2-.4.4-.8.4l.3-4.5 8.3-7.5c.4-.3-.1-.5-.5-.2L7.3 13 2.9 11.6c-1-.3-1-.9.2-1.3L20.3 3.7c.8-.3 1.4.2 1.1.9z" />
      </svg>
    );
  }

  if (icon === "youtube") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M21.8 8.6c-.2-1.3-1.2-2.3-2.5-2.5C17.4 5.8 12 5.8 12 5.8s-5.4 0-7.3.3C3.4 6.3 2.4 7.3 2.2 8.6 2 10.4 2 12 2 12s0 1.6.2 3.4c.2 1.3 1.2 2.3 2.5 2.5 1.9.3 7.3.3 7.3.3s5.4 0 7.3-.3c1.3-.2 2.3-1.2 2.5-2.5.2-1.8.2-3.4.2-3.4s0-1.6-.2-3.4zM10 15.5v-7l6 3.5-6 3.5z" />
      </svg>
    );
  }

  if (icon === "whatsapp") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.5 3.5A11.8 11.8 0 0 0 1.8 17.7L0 24l6.5-1.7A11.8 11.8 0 0 0 20.5 3.5Zm-8.7 17.8a9.5 9.5 0 0 1-4.8-1.3l-.3-.2-3.8 1 1-3.7-.2-.4a9.5 9.5 0 1 1 8.1 4.6Zm5.3-7.1c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.2-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.4-2.3-1.4-.8-.7-1.4-1.7-1.5-2-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.7-1.7-.9-2.3-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.3 5.2 4.6.7.3 1.3.5 1.8.6.8.2 1.4.2 2 0 .6-.1 1.7-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.3-.6-.4Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm6.9 9h-3.1a15 15 0 0 0-1.1-5 8.04 8.04 0 0 1 4.2 5ZM12 4.1c.7 1 1.4 3 1.7 6.9h-3.4c.3-3.9 1-5.9 1.7-6.9ZM4.3 13h3.9c.1 1.8.4 3.5.9 5A8.02 8.02 0 0 1 4.3 13Zm3.9-2H4.3A8.02 8.02 0 0 1 9.1 6c-.5 1.5-.8 3.2-.9 5Zm3.8 8.9c-.7-1-1.4-3-1.7-6.9h3.4c-.3 3.9-1 5.9-1.7 6.9Zm2.9-1.9c.5-1.5.8-3.2.9-5h3.9a8.02 8.02 0 0 1-4.8 5Z" />
    </svg>
  );
}

export default function HomePage() {
  const [activeModal, setActiveModal] = useState<LegalModal>(null);
  const [draft, setDraft] = useState<HomeDraft>(defaultHomeDraft);

  useEffect(() => {
    let cancelled = false;

    async function loadPublishedContent() {
      try {
        const response = await fetch("/api/editor-web/public-portada", {
          cache: "no-store",
        });

        if (!response.ok) return;

        const data = (await response.json()) as { content?: unknown };

        if (!cancelled) {
          setDraft(mergeHomeDraft(data.content));
        }
      } catch (error) {
        console.error("No se pudo cargar la portada publicada", error);
      }
    }

    loadPublishedContent();

    return () => {
      cancelled = true;
    };
  }, []);

  const whatsappUrl = useMemo(
    () => buildWhatsappUrl(draft.whatsappNumber, draft.whatsappMessage),
    [draft.whatsappNumber, draft.whatsappMessage]
  );

  const themeStyle = useMemo(
    () =>
      ({
        "--primary": draft.primaryColor,
        "--primary-strong": draft.glowColor,
        "--panel": draft.panelColor,
      }) as CSSProperties & Record<string, string>,
    [draft.primaryColor, draft.glowColor, draft.panelColor]
  );

  const enabledSocials = draft.socials.filter((social) => social.enabled && social.url);

  return (
    <div style={themeStyle}>
      {draft.showSideBrand && (
        <>
          <div className="side-brand" aria-hidden="true">
            {draft.sideBrandText}
          </div>
          <div className="side-brand right" aria-hidden="true">
            {draft.sideBrandText}
          </div>
        </>
      )}

      <header className="container topbar-wrap">
        <div className="topbar">
          <Link href="/" className="brand-logo" aria-label="Ir al inicio">
            <strong>{draft.brandName}</strong>
            <span>{draft.brandSubtitle}</span>
          </Link>

          <nav className="topbar-right" aria-label="Accesos principales">
            <Link href="/login" className="top-link primary">
              {draft.navLoginText}
            </Link>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="top-link"
            >
              {draft.navContactText}
            </a>
          </nav>
        </div>
      </header>

      <main className="container">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-stack">
            <div className="panel hero-main">
              <div className="hero-content">
                <div className="hero-left">
                  <p className="mini">{draft.heroBadge}</p>

                  <h1 className="title" id="hero-title">
                    {draft.heroTitle}
                  </h1>

                  <p className="sub">{draft.heroSubtitle}</p>

                  <div className="shine" aria-hidden="true" />

                  <p className="text">{draft.heroDescription}</p>

                  <div className="buttons" aria-label="Acciones principales">
                    <Link href={normalizeHref(draft.primaryButtonHref)} className="btn btn1">
                      {draft.primaryButtonText}
                    </Link>

                    <Link href={normalizeHref(draft.secondaryButtonHref)} className="btn btn2">
                      {draft.secondaryButtonText}
                    </Link>
                  </div>
                </div>

                <div className="hero-right">
                  <div className="logo-box">
                    <div className="logo-frame">
                      <img
                        src={draft.logoImage || "/perfil-web.jpg"}
                        alt={`Logo oficial de ${draft.brandName}`}
                        loading="eager"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <section
              className="panel benefits-panel"
              aria-label="Beneficios principales"
            >
              <div className="benefits-joined">
                <div className="benefits">
                  <div className="benefit velocidad">
                    <div className="benefit-inner">
                      <span className="benefit-emoji" aria-hidden="true">
                        {draft.benefit1Icon}
                      </span>
                      <span className="benefit-label">{draft.benefit1Text}</span>
                    </div>
                  </div>

                  <div className="benefit garantia">
                    <div className="benefit-inner">
                      <span className="benefit-emoji" aria-hidden="true">
                        {draft.benefit2Icon}
                      </span>
                      <span className="benefit-label">{draft.benefit2Text}</span>
                    </div>
                  </div>

                  <div className="benefit ahorro">
                    <div className="benefit-inner">
                      <span className="benefit-emoji" aria-hidden="true">
                        {draft.benefit3Icon}
                      </span>
                      <span className="benefit-label">{draft.benefit3Text}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section
              className="panel stats-panel"
              aria-label="Confianza y soporte"
            >
              <div className="stats">
                <article className="card">
                  <span className="card-kicker">{draft.stat1Kicker}</span>
                  <h2>{draft.stat1Title}</h2>
                  <p>{draft.stat1Text}</p>
                </article>

                <article className="card">
                  <span className="card-kicker">{draft.stat2Kicker}</span>
                  <h2>{draft.stat2Title}</h2>
                  <p>{draft.stat2Text}</p>
                </article>

                <article className="card">
                  <span className="card-kicker">{draft.stat3Kicker}</span>
                  <h2>{draft.stat3Title}</h2>
                  <p>{draft.stat3Text}</p>
                </article>
              </div>
            </section>

            <section
              className="panel social-panel"
              aria-labelledby="social-title"
            >
              <div className="social-head">
                <h2 className="social-title" id="social-title">
                  {draft.socialTitle}
                </h2>
                <p className="social-text">{draft.socialText}</p>
              </div>

              <div className="social-icons">
                {enabledSocials.map((social) => (
                  <a
                    key={social.id}
                    className="social-link dynamic-social-link"
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${social.name} de ${draft.brandName}`}
                    style={
                      {
                        "--social-color": social.color,
                      } as CSSProperties & Record<"--social-color", string>
                    }
                  >
                    <SocialIconSvg icon={social.icon} />
                  </a>
                ))}
              </div>
            </section>

            <section className="panel footer-panel" aria-label="Pie de página">
              <div className="footer-content">
                <p>{draft.footerText}</p>

                <div className="footer-links">
                  <button
                    type="button"
                    className="footer-link-button"
                    onClick={() => setActiveModal("terms")}
                  >
                    Términos y Condiciones
                  </button>
                  <span className="footer-separator">•</span>
                  <button
                    type="button"
                    className="footer-link-button"
                    onClick={() => setActiveModal("privacy")}
                  >
                    Política de Privacidad
                  </button>
                </div>
              </div>
            </section>
          </div>
        </section>
      </main>

      <LegalDialog
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
      />

      <style jsx global>{`
        .social-link.dynamic-social-link {
          color: var(--social-color) !important;
          border-color: color-mix(in srgb, var(--social-color) 44%, transparent) !important;
          background:
            radial-gradient(circle at center, color-mix(in srgb, var(--social-color) 10%, transparent), transparent 64%),
            linear-gradient(180deg, rgba(236, 255, 255, 0.06), rgba(236, 255, 255, 0.025)) !important;
          box-shadow:
            inset 0 0 0 1px rgba(236, 255, 255, 0.035),
            0 10px 22px rgba(0, 0, 0, 0.18),
            0 0 18px color-mix(in srgb, var(--social-color) 18%, transparent) !important;
          isolation: isolate;
        }

        .social-link.dynamic-social-link::before {
          background:
            radial-gradient(circle at center, color-mix(in srgb, var(--social-color) 42%, transparent), transparent 68%) !important;
          opacity: 0;
        }

        .social-link.dynamic-social-link svg {
          filter: drop-shadow(0 0 8px color-mix(in srgb, var(--social-color) 48%, transparent));
          transition: transform 0.35s ease, filter 0.35s ease, color 0.35s ease;
        }

        .social-link.dynamic-social-link:hover {
          color: #ecffff !important;
          border-color: var(--social-color) !important;
          background:
            radial-gradient(circle at center, color-mix(in srgb, var(--social-color) 62%, transparent), rgba(3, 19, 22, 0.88) 70%),
            linear-gradient(180deg, color-mix(in srgb, var(--social-color) 28%, rgba(3, 19, 22, 0.9)), rgba(3, 19, 22, 0.92)) !important;
          box-shadow:
            0 0 0 1px color-mix(in srgb, var(--social-color) 45%, transparent),
            0 0 18px color-mix(in srgb, var(--social-color) 85%, transparent),
            0 0 42px color-mix(in srgb, var(--social-color) 48%, transparent),
            0 0 78px color-mix(in srgb, var(--social-color) 24%, transparent),
            inset 0 0 24px color-mix(in srgb, var(--social-color) 22%, transparent) !important;
        }

        .social-link.dynamic-social-link:hover::before {
          opacity: 1;
        }

        .social-link.dynamic-social-link:hover svg {
          transform: scale(1.08);
          filter:
            drop-shadow(0 0 8px rgba(236, 255, 255, 0.65))
            drop-shadow(0 0 16px var(--social-color));
        }
      `}</style>
    </div>
  );
}
