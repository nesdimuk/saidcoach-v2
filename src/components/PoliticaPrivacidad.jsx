import React from "react";
import styles from "../../styles/Politica.module.css";

const PoliticaDePrivacidad = () => {
  return (
    <div className={styles["page-container"]}>
      <h1 className={styles.title}>
        Política de Privacidad
        <br />
        SaidCoach Asistente (Marcelo Said SpA)
      </h1>

      <p className={styles.paragraph}>
        <strong>Fecha de última actualización: 03/12/2025</strong>
      </p>

      <p className={styles.paragraph}>
        En <strong>Marcelo Said SpA</strong> nos comprometemos a proteger la
        privacidad de nuestros usuarios y clientes. Esta política describe cómo
        recopilamos, utilizamos, almacenamos y protegemos la información
        personal cuando interactúas con nuestros servicios digitales, incluidas
        aplicaciones conectadas a WhatsApp Cloud API, plataformas de
        automatización, sistemas de entrenamiento online y aplicaciones propias.
      </p>

      <hr />

      <h2 className={styles.subtitle}>1. Información que recopilamos</h2>
      <p className={styles.paragraph}>Podemos recopilar los siguientes datos:</p>

      <h3 className={styles.subtitle}>1.1. Información de contacto</h3>
      <ul className={styles.list}>
        <li>Nombre y apellido</li>
        <li>Dirección de correo electrónico</li>
        <li>Número de teléfono (incluido WhatsApp)</li>
      </ul>

      <h3 className={styles.subtitle}>1.2. Datos proporcionados voluntariamente</h3>
      <ul className={styles.list}>
        <li>Mensajes enviados a través de WhatsApp, formularios web o apps</li>
        <li>Preferencias y hábitos relacionados con salud, ejercicio y bienestar</li>
        <li>Datos ingresados en programas de entrenamiento, cuestionarios o sistemas de seguimiento</li>
      </ul>

      <h3 className={styles.subtitle}>1.3. Datos técnicos</h3>
      <ul className={styles.list}>
        <li>Información del dispositivo</li>
        <li>Dirección IP</li>
        <li>Registros de acceso a la aplicación</li>
        <li>Cookies y datos de navegación cuando accedes a nuestros sitios</li>
      </ul>

      <h3 className={styles.subtitle}>1.4. Información generada automáticamente por la API de WhatsApp</h3>
      <ul className={styles.list}>
        <li>Mensajes entrantes y salientes</li>
        <li>Estados de entrega (sent, delivered, read)</li>
        <li>Información técnica necesaria para el funcionamiento de la integración</li>
      </ul>

      <hr />

      <h2 className={styles.subtitle}>2. Cómo utilizamos la información</h2>
      <p className={styles.paragraph}>Usamos tus datos únicamente para:</p>
      <ul className={styles.list}>
        <li>Prestar servicios de entrenamiento, coaching y seguimiento de hábitos</li>
        <li>Comunicar recordatorios, pautas, rutinas y mensajes de soporte</li>
        <li>Proveer asistencia y soporte técnico</li>
        <li>Optimizar nuestros programas y mejorar la experiencia del usuario</li>
        <li>Automatizar procesos mediante sistemas como n8n o integraciones de IA</li>
        <li>Cumplir con normativa legal y solicitudes oficiales</li>
      </ul>
      <p className={styles.paragraph}>
        Nunca vendemos ni cedemos tus datos a terceros con fines comerciales.
      </p>

      <hr />

      <h2 className={styles.subtitle}>3. Compartición de datos con terceros</h2>
      <p className={styles.paragraph}>
        Podemos compartir información solo cuando es necesario para operar nuestros servicios:
      </p>
      <ul className={styles.list}>
        <li>
          <strong>Meta / WhatsApp Cloud API:</strong> para el envío y recepción de mensajes
        </li>
        <li>
          <strong>Proveedores tecnológicos:</strong> como servidores, plataformas de automatización o almacenamiento
          en la nube
        </li>
        <li>
          <strong>Herramientas analíticas:</strong> usadas solo para mejorar la experiencia del usuario
        </li>
      </ul>
      <p className={styles.paragraph}>
        Todos estos proveedores cumplen con normativas de protección de datos.
      </p>

      <hr />

      <h2 className={styles.subtitle}>4. Conservación de datos</h2>
      <p className={styles.paragraph}>Los datos se mantienen únicamente durante el tiempo necesario para:</p>
      <ul className={styles.list}>
        <li>Cumplir el servicio contratado</li>
        <li>Cumplir obligaciones legales</li>
        <li>Mantener registros operativos estrictamente necesarios</li>
      </ul>
      <p className={styles.paragraph}>
        Puedes solicitar la eliminación total de tus datos en cualquier momento.
      </p>

      <hr />

      <h2 className={styles.subtitle}>5. Seguridad</h2>
      <p className={styles.paragraph}>Implementamos medidas técnicas y organizativas para proteger tus datos:</p>
      <ul className={styles.list}>
        <li>Cifrado de comunicaciones</li>
        <li>Acceso restringido</li>
        <li>Servidores seguros</li>
        <li>Protocolos de respaldo y auditoría</li>
      </ul>

      <hr />

      <h2 className={styles.subtitle}>6. Derechos del usuario</h2>
      <p className={styles.paragraph}>Puedes solicitar:</p>
      <ul className={styles.list}>
        <li>Acceso a tus datos</li>
        <li>Rectificación</li>
        <li>Eliminación</li>
        <li>Portabilidad</li>
        <li>Limitación del tratamiento</li>
      </ul>
      <p className={styles.paragraph}>
        Para ejercer estos derechos, envía un mensaje a:
        <br />
        <strong>
          <a className={styles.link} href="mailto:marcelosaid.ep@gmail.com">
            marcelosaid.ep@gmail.com
          </a>
        </strong>
      </p>

      <hr />

      <h2 className={styles.subtitle}>7. Eliminación de datos</h2>
      <p className={styles.paragraph}>
        Si deseas eliminar tus datos, visita:
        <br />
        <strong>
          <a className={styles.link} href="https://saidcoach.com/eliminacion-de-datos">
            https://saidcoach.com/eliminacion-de-datos
          </a>
        </strong>
        <br />
        (o solicita la eliminación directamente por WhatsApp o correo).
      </p>

      <hr />

      <h2 className={styles.subtitle}>8. Cambios en esta política</h2>
      <p className={styles.paragraph}>
        Podemos actualizar esta política para reflejar ajustes en nuestros servicios o requisitos legales.
        Notificaremos cualquier cambio relevante.
      </p>

      <hr />

      <h2 className={styles.subtitle}>9. Contacto</h2>
      <p className={styles.paragraph}>
        Titular: <strong>Marcelo Said SpA</strong>
        <br />
        Correo:{" "}
        <strong>
          <a className={styles.link} href="mailto:marcelosaid.ep@gmail.com">
            marcelosaid.ep@gmail.com
          </a>
        </strong>
        <br />
        País: Chile
      </p>

      <hr />

      <p className={styles.paragraph}>
        Gracias por confiar en SaidCoach Asistente.
        <br />
        Tu privacidad y seguridad siempre serán prioridad.
      </p>
    </div>
  );
};

export default PoliticaDePrivacidad;
