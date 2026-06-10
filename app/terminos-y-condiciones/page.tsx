import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Términos y Condiciones | Jonas Stream",
  description:
    "Términos y condiciones de uso de los servicios ofrecidos por Jonas Stream.",
};

export default function TerminosYCondicionesPage() {
  return (
    <main className="js-legal-page">
      <section className="js-legal-card" aria-labelledby="legal-title">
        <div className="js-legal-top">
          <div>
            <p className="js-legal-eyebrow">Documento legal</p>
            <h1 className="js-legal-title" id="legal-title">
              Términos y Condiciones
            </h1>
          </div>

          <div className="js-legal-badge">JONAS STREAM</div>
        </div>

        <div className="js-legal-meta" aria-label="Información del documento">
          <span className="js-chip">Última actualización: 2026</span>
          <span className="js-chip">Plataforma oficial</span>
        </div>

        <p className="js-legal-lead">
          Bienvenido a Jonas Stream. Al adquirir, contratar o utilizar nuestros
          servicios, usted acepta los presentes Términos y Condiciones. Si no
          está de acuerdo, no debe utilizar nuestros servicios.
        </p>

        <hr className="js-legal-hr" />

        <h2>1. Naturaleza del servicio</h2>
        <p>
          Jonas Stream ofrece servicios de gestión, activación y soporte de
          accesos a plataformas digitales de entretenimiento. No representamos
          oficialmente a las marcas de streaming mencionadas ni tenemos relación
          directa con ellas.
        </p>

        <h2>2. Condiciones de uso</h2>
        <p>El cliente acepta:</p>
        <ul className="js-legal-list">
          <li>Usar los accesos únicamente para uso personal.</li>
          <li>No compartir cuentas con terceros no autorizados.</li>
          <li>No modificar correos, contraseñas o perfiles entregados.</li>
          <li>No alterar configuraciones de seguridad.</li>
          <li>No realizar usos abusivos del servicio.</li>
        </ul>

        <div className="js-legal-note">
          El incumplimiento puede generar suspensión inmediata sin reembolso.
        </div>

        <h2>3. Entrega del servicio</h2>
        <p>
          Las activaciones se realizan dentro del horario de atención informado
          por nuestros canales oficiales. Los tiempos pueden variar según
          demanda y verificación de pago.
        </p>

        <h2>4. Pagos</h2>
        <p>
          Todos los servicios son de pago anticipado. La activación se realiza
          únicamente después de la confirmación del pago.
        </p>

        <h2>5. Garantía y soporte</h2>
        <p>
          Se brinda soporte técnico durante el período contratado. La garantía
          cubre fallas de acceso no causadas por mal uso del cliente.
        </p>
        <p>
          <strong>No cubre:</strong>
        </p>
        <ul className="js-legal-list">
          <li>Bloqueos por uso indebido.</li>
          <li>Cambios realizados por el usuario.</li>
          <li>Incumplimiento de instrucciones.</li>
          <li>Compartir accesos.</li>
        </ul>

        <h2>6. Reembolsos</h2>
        <p>
          No se realizan reembolsos una vez entregado el acceso, salvo que
          exista imposibilidad técnica definitiva de cumplir el servicio.
        </p>

        <h2>7. Suspensión del servicio</h2>
        <p>Podemos suspender el servicio si detectamos:</p>
        <ul className="js-legal-list">
          <li>Uso indebido.</li>
          <li>Compartición no autorizada.</li>
          <li>Manipulación de credenciales.</li>
          <li>Incumplimiento de reglas.</li>
        </ul>

        <h2>8. No afiliación</h2>
        <p>
          Jonas Stream no está afiliado oficialmente a las plataformas de
          streaming mencionadas. Las marcas pertenecen a sus respectivos
          propietarios.
        </p>

        <h2>9. Modificaciones</h2>
        <p>
          Nos reservamos el derecho de modificar estos términos en cualquier
          momento. Los cambios entran en vigencia al ser publicados.
        </p>

        <div className="js-legal-actions">
          <Link href="/" className="js-legal-button primary">
            Volver al inicio
          </Link>
          <Link href="/politicas-de-privacidad" className="js-legal-button">
            Ver política de privacidad
          </Link>
        </div>

        <div className="js-legal-footer">
          Para consultas o soporte, comunícate por nuestros canales oficiales.
        </div>
      </section>
    </main>
  );
}
