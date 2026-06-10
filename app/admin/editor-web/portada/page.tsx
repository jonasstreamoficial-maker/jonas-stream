"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import styles from "../editor-web.module.css";

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

const initialDraft: HomeDraft = {
  brandName: "JONAS STREAM",
  brandSubtitle: "PLATAFORMA OFICIAL",
  navLoginText: "INICIAR SESIÓN",
  navContactText: "CONTÁCTANOS",
  whatsappNumber: "51900557949",
  whatsappMessage:
    "Hola Jonas Stream, quiero información sobre sus servicios.",
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

const groups = [
  "Marca",
  "Hero principal",
  "Botones",
  "Beneficios",
  "Confianza",
  "Redes sociales",
  "Footer",
  "Colores",
] as const;

type EditorGroup = (typeof groups)[number];

type PreviewMode = "desktop" | "mobile";

const iconOptions: { value: SocialIcon; label: string }[] = [
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "telegram", label: "Telegram" },
  { value: "youtube", label: "YouTube" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "web", label: "Web" },
];

export default function PortadaEditorPage() {
  const [draft, setDraft] = useState<HomeDraft>(initialDraft);
  const [activeGroup, setActiveGroup] = useState<EditorGroup>("Marca");
  const [previewMode, setPreviewMode] = useState<PreviewMode>("desktop");

  const previewClass = useMemo(
    () => `${styles.previewSite} ${previewMode === "mobile" ? styles.previewMobile : ""}`,
    [previewMode]
  );

  const whatsappUrl = useMemo(
    () => buildWhatsappUrl(draft.whatsappNumber, draft.whatsappMessage),
    [draft.whatsappNumber, draft.whatsappMessage]
  );

  const previewTheme = useMemo(
    () =>
      ({
        "--preview-primary": draft.primaryColor,
        "--preview-glow": draft.glowColor,
        "--preview-panel": draft.panelColor,
      }) as CSSProperties & Record<string, string>,
    [draft.primaryColor, draft.glowColor, draft.panelColor]
  );

  const enabledSocials = draft.socials.filter((social) => social.enabled);

  const updateDraft = <K extends keyof Omit<HomeDraft, "socials">>(key: K, value: HomeDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const updateSocial = <K extends keyof SocialLink>(id: string, key: K, value: SocialLink[K]) => {
    setDraft((current) => ({
      ...current,
      socials: current.socials.map((social) =>
        social.id === id ? { ...social, [key]: value } : social
      ),
    }));
  };

  const addSocial = () => {
    const id = `red-${Date.now()}`;

    setDraft((current) => ({
      ...current,
      socials: [
        ...current.socials,
        {
          id,
          name: "Nueva red",
          url: "https://",
          icon: "web",
          color: "#01E7EF",
          enabled: true,
        },
      ],
    }));

    toast.success("Red social agregada al borrador.");
  };

  const removeSocial = (id: string) => {
    setDraft((current) => ({
      ...current,
      socials: current.socials.filter((social) => social.id !== id),
    }));
  };

  const saveDraft = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("jonas_home_draft_preview", JSON.stringify(draft));
    }
    toast.success("Borrador guardado localmente. Luego lo conectaremos con Supabase.");
  };

  const resetDraft = () => {
    setDraft(initialDraft);
    toast.success("Valores iniciales restaurados.");
  };

  const publishDraft = () => {
    toast.error("Aún no está conectado a Supabase. Primero validamos diseño y preview.");
  };

  return (
    <main className={styles.editorShell}>
      <section className={styles.editorTopbar}>
        <div>
          <p className={styles.kicker}>EDITOR WEB / PORTADA</p>
          <h1>Editar portada</h1>
          <p>
            Cambia textos, colores, enlaces y redes a la izquierda. A la derecha verás la vista previa antes de guardar o publicar.
          </p>
        </div>

        <div className={styles.topbarActions}>
          <Link href="/admin/editor-web" className={styles.secondaryButton}>
            Volver
          </Link>
          <button type="button" className={styles.primaryButton} onClick={saveDraft}>
            Guardar borrador
          </button>
        </div>
      </section>

      <section className={styles.workspace}>
        <aside className={styles.editorPanel}>
          <div className={styles.groupTabs} aria-label="Secciones editables">
            {groups.map((group) => (
              <button
                key={group}
                type="button"
                className={activeGroup === group ? styles.activeTab : ""}
                onClick={() => setActiveGroup(group)}
              >
                {group}
              </button>
            ))}
          </div>

          <div className={styles.formCard}>
            {activeGroup === "Marca" && (
              <>
                <Field label="Nombre de marca" value={draft.brandName} onChange={(value) => updateDraft("brandName", value)} />
                <Field label="Subtítulo de marca" value={draft.brandSubtitle} onChange={(value) => updateDraft("brandSubtitle", value)} />
                <Field label="Texto botón login" value={draft.navLoginText} onChange={(value) => updateDraft("navLoginText", value)} />
                <Field label="Texto botón contacto" value={draft.navContactText} onChange={(value) => updateDraft("navContactText", value)} />
                <Field label="Número WhatsApp" value={draft.whatsappNumber} onChange={(value) => updateDraft("whatsappNumber", value)} helper="Coloca solo números. Ejemplo Perú: 51900557949." />
                <TextArea label="Mensaje automático WhatsApp" value={draft.whatsappMessage} onChange={(value) => updateDraft("whatsappMessage", value)} />
                <div className={styles.helpBox}>URL generada: {whatsappUrl}</div>
                <Field label="Ruta o URL del logo principal" value={draft.logoImage} onChange={(value) => updateDraft("logoImage", value)} helper="Por ahora usa /perfil-web.jpg. Luego subiremos imágenes a Supabase Storage." />
                <Field label="Texto lateral" value={draft.sideBrandText} onChange={(value) => updateDraft("sideBrandText", value)} helper="Este texto aparece en los laterales de la portada en PC." />
                <Toggle label="Mostrar texto lateral" checked={draft.showSideBrand} onChange={(value) => updateDraft("showSideBrand", value)} />
              </>
            )}

            {activeGroup === "Hero principal" && (
              <>
                <Field label="Texto superior" value={draft.heroBadge} onChange={(value) => updateDraft("heroBadge", value)} />
                <Field label="Título principal" value={draft.heroTitle} onChange={(value) => updateDraft("heroTitle", value)} />
                <Field label="Subtítulo" value={draft.heroSubtitle} onChange={(value) => updateDraft("heroSubtitle", value)} />
                <TextArea label="Descripción" value={draft.heroDescription} onChange={(value) => updateDraft("heroDescription", value)} />
              </>
            )}

            {activeGroup === "Botones" && (
              <>
                <Field label="Botón principal" value={draft.primaryButtonText} onChange={(value) => updateDraft("primaryButtonText", value)} />
                <Field label="Ruta botón principal" value={draft.primaryButtonHref} onChange={(value) => updateDraft("primaryButtonHref", value)} />
                <Field label="Botón secundario" value={draft.secondaryButtonText} onChange={(value) => updateDraft("secondaryButtonText", value)} />
                <Field label="Ruta botón secundario" value={draft.secondaryButtonHref} onChange={(value) => updateDraft("secondaryButtonHref", value)} />
              </>
            )}

            {activeGroup === "Beneficios" && (
              <>
                <Field label="Icono beneficio 1" value={draft.benefit1Icon} onChange={(value) => updateDraft("benefit1Icon", value)} />
                <Field label="Texto beneficio 1" value={draft.benefit1Text} onChange={(value) => updateDraft("benefit1Text", value)} />
                <Field label="Icono beneficio 2" value={draft.benefit2Icon} onChange={(value) => updateDraft("benefit2Icon", value)} />
                <Field label="Texto beneficio 2" value={draft.benefit2Text} onChange={(value) => updateDraft("benefit2Text", value)} />
                <Field label="Icono beneficio 3" value={draft.benefit3Icon} onChange={(value) => updateDraft("benefit3Icon", value)} />
                <Field label="Texto beneficio 3" value={draft.benefit3Text} onChange={(value) => updateDraft("benefit3Text", value)} />
              </>
            )}

            {activeGroup === "Confianza" && (
              <>
                <Field label="Etiqueta card 1" value={draft.stat1Kicker} onChange={(value) => updateDraft("stat1Kicker", value)} />
                <Field label="Título card 1" value={draft.stat1Title} onChange={(value) => updateDraft("stat1Title", value)} />
                <TextArea label="Texto card 1" value={draft.stat1Text} onChange={(value) => updateDraft("stat1Text", value)} />
                <Field label="Etiqueta card 2" value={draft.stat2Kicker} onChange={(value) => updateDraft("stat2Kicker", value)} />
                <Field label="Título card 2" value={draft.stat2Title} onChange={(value) => updateDraft("stat2Title", value)} />
                <TextArea label="Texto card 2" value={draft.stat2Text} onChange={(value) => updateDraft("stat2Text", value)} />
                <Field label="Etiqueta card 3" value={draft.stat3Kicker} onChange={(value) => updateDraft("stat3Kicker", value)} />
                <Field label="Título card 3" value={draft.stat3Title} onChange={(value) => updateDraft("stat3Title", value)} />
                <TextArea label="Texto card 3" value={draft.stat3Text} onChange={(value) => updateDraft("stat3Text", value)} />
              </>
            )}

            {activeGroup === "Redes sociales" && (
              <>
                <Field label="Título redes" value={draft.socialTitle} onChange={(value) => updateDraft("socialTitle", value)} />
                <TextArea label="Texto redes" value={draft.socialText} onChange={(value) => updateDraft("socialText", value)} />

                <div className={styles.socialEditorList}>
                  {draft.socials.map((social, index) => (
                    <article key={social.id} className={styles.socialEditorItem}>
                      <div className={styles.socialEditorHeader}>
                        <strong>Red {index + 1}</strong>
                        <button type="button" onClick={() => removeSocial(social.id)}>
                          Quitar
                        </button>
                      </div>

                      <Toggle label="Mostrar" checked={social.enabled} onChange={(value) => updateSocial(social.id, "enabled", value)} />
                      <Field label="Nombre" value={social.name} onChange={(value) => updateSocial(social.id, "name", value)} />
                      <Field label="URL" value={social.url} onChange={(value) => updateSocial(social.id, "url", value)} />
                      <SelectField label="Logo / icono" value={social.icon} options={iconOptions} onChange={(value) => updateSocial(social.id, "icon", value as SocialIcon)} />
                      <ColorField label="Color del logo" value={social.color} onChange={(value) => updateSocial(social.id, "color", value)} />
                    </article>
                  ))}
                </div>

                <button type="button" className={styles.fullButton} onClick={addSocial}>
                  Agregar red social
                </button>
              </>
            )}

            {activeGroup === "Footer" && (
              <>
                <Field label="Texto footer" value={draft.footerText} onChange={(value) => updateDraft("footerText", value)} />
                <div className={styles.helpBox}>
                  Términos y Política se mantienen como ventana emergente. Luego los conectaremos al editor legal.
                </div>
              </>
            )}

            {activeGroup === "Colores" && (
              <>
                <ColorField label="Color principal" value={draft.primaryColor} onChange={(value) => updateDraft("primaryColor", value)} />
                <ColorField label="Color glow" value={draft.glowColor} onChange={(value) => updateDraft("glowColor", value)} />
                <Field label="Color panel glass" value={draft.panelColor} onChange={(value) => updateDraft("panelColor", value)} helper="Puede ser rgba(3, 19, 22, 0.78). Luego lo pasaremos a selector avanzado." />
              </>
            )}
          </div>

          <div className={styles.saveBar}>
            <button type="button" className={styles.secondaryButton} onClick={resetDraft}>
              Restaurar
            </button>
            <button type="button" className={styles.secondaryButton} onClick={saveDraft}>
              Guardar borrador
            </button>
            <button type="button" className={styles.primaryButton} onClick={publishDraft}>
              Publicar
            </button>
          </div>
        </aside>

        <section className={styles.previewPanel} aria-label="Vista previa de portada">
          <div className={styles.previewToolbar}>
            <div>
              <p className={styles.kicker}>VISTA PREVIA</p>
              <h2>Portada</h2>
            </div>
            <div className={styles.previewSwitch}>
              <button
                type="button"
                className={previewMode === "desktop" ? styles.activePreview : ""}
                onClick={() => setPreviewMode("desktop")}
              >
                PC
              </button>
              <button
                type="button"
                className={previewMode === "mobile" ? styles.activePreview : ""}
                onClick={() => setPreviewMode("mobile")}
              >
                Celular
              </button>
            </div>
          </div>

          <div className={styles.previewFrameOuter}>
            <div className={previewClass} style={previewTheme}>
              {draft.showSideBrand ? (
                <>
                  <span className={styles.previewSideBrand}>{draft.sideBrandText}</span>
                  <span className={`${styles.previewSideBrand} ${styles.previewSideBrandRight}`}>{draft.sideBrandText}</span>
                </>
              ) : null}

              <div className={styles.previewTopbar}>
                <div>
                  <strong>{draft.brandName}</strong>
                  <span>{draft.brandSubtitle}</span>
                </div>
                <div className={styles.previewNav}>
                  <span>{draft.navLoginText}</span>
                  <span>{draft.navContactText}</span>
                </div>
              </div>

              <div className={styles.previewHero}>
                <div className={styles.previewHeroText}>
                  <p className={styles.previewMini}>{draft.heroBadge}</p>
                  <h3>{draft.heroTitle}</h3>
                  <p className={styles.previewSub}>{draft.heroSubtitle}</p>
                  <div className={styles.previewLine} />
                  <p className={styles.previewDescription}>{draft.heroDescription}</p>
                  <div className={styles.previewButtons}>
                    <span>{draft.primaryButtonText}</span>
                    <span>{draft.secondaryButtonText}</span>
                  </div>
                </div>

                <div className={styles.previewLogoBox}>
                  <img src={draft.logoImage || "/perfil-web.jpg"} alt="Vista previa logo" />
                </div>
              </div>

              <div className={styles.previewBenefits}>
                <div><b>{draft.benefit1Icon}</b><span>{draft.benefit1Text}</span></div>
                <div><b>{draft.benefit2Icon}</b><span>{draft.benefit2Text}</span></div>
                <div><b>{draft.benefit3Icon}</b><span>{draft.benefit3Text}</span></div>
              </div>

              <div className={styles.previewStats}>
                <article>
                  <small>{draft.stat1Kicker}</small>
                  <h4>{draft.stat1Title}</h4>
                  <p>{draft.stat1Text}</p>
                </article>
                <article>
                  <small>{draft.stat2Kicker}</small>
                  <h4>{draft.stat2Title}</h4>
                  <p>{draft.stat2Text}</p>
                </article>
                <article>
                  <small>{draft.stat3Kicker}</small>
                  <h4>{draft.stat3Title}</h4>
                  <p>{draft.stat3Text}</p>
                </article>
              </div>

              <div className={styles.previewSocial}>
                <h4>{draft.socialTitle}</h4>
                <p>{draft.socialText}</p>
                <div className={styles.previewSocialIcons}>
                  {enabledSocials.map((social) => (
                    <a
                      key={social.id}
                      href={social.url || "#"}
                      aria-label={social.name}
                      title={social.name}
                      className={styles.previewSocialIcon}
                      style={{ "--social-color": social.color } as CSSProperties & Record<string, string>}
                      onClick={(event) => event.preventDefault()}
                    >
                      <SocialSvg icon={social.icon} />
                    </a>
                  ))}
                </div>
              </div>

              <div className={styles.previewFooter}>{draft.footerText}</div>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

function buildWhatsappUrl(number: string, message: string) {
  const cleanNumber = number.replace(/\D/g, "");
  const cleanMessage = encodeURIComponent(message.trim());

  if (!cleanNumber) return "https://wa.me/";
  return `https://wa.me/${cleanNumber}${cleanMessage ? `?text=${cleanMessage}` : ""}`;
}

function Field({
  label,
  value,
  onChange,
  helper,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  helper?: string;
}) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} />
      {helper ? <small>{helper}</small> : null}
    </label>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <div className={styles.colorInputRow}>
        <input type="color" value={normalizeHexColor(value)} onChange={(event) => onChange(event.target.value)} />
        <input value={value} onChange={(event) => onChange(event.target.value)} />
      </div>
    </label>
  );
}

function normalizeHexColor(value: string) {
  return /^#[0-9A-F]{6}$/i.test(value) ? value : "#01E7EF";
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={5} />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className={styles.toggleField}>
      <span>{label}</span>
      <button type="button" className={checked ? styles.toggleOn : ""} onClick={() => onChange(!checked)}>
        {checked ? "Activo" : "Oculto"}
      </button>
    </label>
  );
}

function SocialSvg({ icon }: { icon: SocialIcon }) {
  if (icon === "facebook") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14.2 8.1h2.3V4.3c-.4-.1-1.8-.2-3.4-.2-3.4 0-5.7 2.1-5.7 6v3.4H3.7v4.3h3.7V24h4.5v-6.2h3.5l.6-4.3h-4.1v-3c0-1.2.3-2.4 2.3-2.4Z" />
      </svg>
    );
  }

  if (icon === "instagram") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2Zm0 2A3.8 3.8 0 0 0 4 7.8v8.4A3.8 3.8 0 0 0 7.8 20h8.4a3.8 3.8 0 0 0 3.8-3.8V7.8A3.8 3.8 0 0 0 16.2 4H7.8Zm8.7 2.1a1.3 1.3 0 1 1 0 2.6 1.3 1.3 0 0 1 0-2.6ZM12 7.2a4.8 4.8 0 1 1 0 9.6 4.8 4.8 0 0 1 0-9.6Zm0 2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6Z" />
      </svg>
    );
  }

  if (icon === "tiktok") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M16.6 3c.4 2.5 1.8 4.1 4.2 4.3v3.9a8.2 8.2 0 0 1-4.2-1.2v5.8c0 4.2-2.9 6.8-6.8 6.8-3.6 0-6.3-2.5-6.3-5.9 0-4 3.6-6.6 7.8-5.8v4a3.2 3.2 0 0 0-1.4-.3c-1.5 0-2.6.8-2.6 2.1 0 1.2 1 2 2.3 2 1.5 0 2.7-.9 2.7-3V3h4.3Z" />
      </svg>
    );
  }

  if (icon === "telegram") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M22 3.7 18.6 20c-.2 1.1-.9 1.4-1.9.9l-5.2-3.8-2.5 2.4c-.3.3-.5.5-1 .5l.4-5.3 9.7-8.8c.4-.4-.1-.6-.7-.2L5.4 13.2.2 11.6c-1.1-.4-1.1-1.1.2-1.6L20.7 2.2c.9-.3 1.7.2 1.3 1.5Z" />
      </svg>
    );
  }

  if (icon === "youtube") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31.3 31.3 0 0 0 0 12a31.3 31.3 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.3 31.3 0 0 0 24 12a31.3 31.3 0 0 0-.5-5.8ZM9.6 15.6V8.4L15.8 12l-6.2 3.6Z" />
      </svg>
    );
  }

  if (icon === "whatsapp") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.5 3.5A11.8 11.8 0 0 0 1.8 17.7L0 24l6.5-1.7A11.8 11.8 0 0 0 12 23.6h.1A11.8 11.8 0 0 0 20.5 3.5ZM12 21.6a9.7 9.7 0 0 1-5-1.4l-.4-.2-3.9 1 1-3.8-.2-.4A9.8 9.8 0 1 1 12 21.6Zm5.4-7.3c-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.2-1.2-.4-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.5-.6c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.6-.1-.2-.7-1.7-1-2.3-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.1 1.1-1.1 2.6s1.1 3 1.2 3.2c.2.2 2.2 3.4 5.3 4.7.7.3 1.3.5 1.8.6.8.2 1.5.2 2 .1.6-.1 1.8-.8 2-1.5.3-.7.3-1.4.2-1.5-.1-.2-.3-.3-.6-.4Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2a10 10 0 1 0 .1 0H12Zm6.9 6h-3a15.4 15.4 0 0 0-1.2-3 8.1 8.1 0 0 1 4.2 3ZM12 4.1c.8 1.1 1.4 2.4 1.8 3.9h-3.6c.4-1.5 1-2.8 1.8-3.9ZM4.3 14a7.8 7.8 0 0 1 0-4h3.4a16.9 16.9 0 0 0 0 4H4.3Zm.8 2h3c.3 1.1.7 2.1 1.2 3a8.1 8.1 0 0 1-4.2-3Zm3-8h-3a8.1 8.1 0 0 1 4.2-3c-.5.9-.9 1.9-1.2 3Zm3.9 11.9c-.8-1.1-1.4-2.4-1.8-3.9h3.6c-.4 1.5-1 2.8-1.8 3.9ZM14.2 14H9.8a14.5 14.5 0 0 1 0-4h4.4a14.5 14.5 0 0 1 0 4Zm.5 5c.5-.9.9-1.9 1.2-3h3a8.1 8.1 0 0 1-4.2 3Zm1.6-5a16.9 16.9 0 0 0 0-4h3.4a7.8 7.8 0 0 1 0 4h-3.4Z" />
    </svg>
  );
}
