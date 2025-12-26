import Image from "next/image";
import styles from "./page.module.css";

export default function Page() {
  return (
    <main className={styles.page}>
      <div>
        <section className={styles.hero}>
          <div className={styles.content}>
            <h1 className={styles.title}>
              El error no está en la cancha.
              <br />
              Está en lo que tu hijo aprende de ti cuando juega.
            </h1>
            <h2 className={styles.subtitle}>
              Un programa para padres que quieren apoyar a sus hijos
              <br />
              pero no siempre saben qué decir, qué hacer o cuándo callar.
            </h2>
            <button className={styles.cta}>Quiero acompañar mejor</button>
            <p className={styles.micro}>
              Basado en experiencia real, evidencia científica y vida de cancha.
            </p>
          </div>
          <div className={styles.media} aria-hidden="true">
            <Image
              src="/images/hero-padres-formadores.png"
              alt="Padres acompañando a niños en el fútbol formativo"
              fill
              priority
              sizes="100vw"
              className={styles.image}
            />
          </div>
        </section>
        <section className={styles.blockTwo}>
          <div className={styles.blockInner}>
            <h3 className={styles.blockTitle}>Cuando el amor también puede pesar</h3>
            <p className={styles.blockText}>
              <span className={styles.anchorBlue}>
                Nadie llega al fútbol formativo queriendo hacer daño.
              </span>
              <br />
              <br />
              Llegamos con amor.
              <br />
              Con ganas de ayudar.
              <br />
              Con el deseo de ver a nuestros hijos disfrutar.
              <br />
              <br />
              Pero sin darnos cuenta, <strong>muchas veces transmitimos algo más.</strong>
            </p>
            <p className={styles.blockText}>
              <strong>Quizás te ha pasado:</strong>
            </p>
            <ul className={styles.blockList}>
              <li>No sabes si hablar después del partido… o callar</li>
              <li>Sientes que cualquier palabra puede ser malinterpretada</li>
              <li>Te preguntas si estás apoyando… o presionando</li>
              <li>Te llevas el partido a la casa, aunque el niño ya lo dejó atrás</li>
            </ul>
            <p className={styles.blockText}>
              <strong>Nada de esto te convierte en mal padre.</strong>
              <br />
              Te convierte en{" "}
              <strong className={styles.errorRed}>un padre sin guía</strong>.
            </p>
            <p className={styles.blockText}>
              Y cuando no hay guía, aparecen{" "}
              <strong className={styles.errorRed}>Errores silenciosos.</strong>
              <br />
              Errores que no siempre se notan en la cancha…
              <br />
              <br />
              pero sí en cómo el niño se valora, se equivoca y se exige.
              <br />
              <br />
              De eso trata este libro.
            </p>
          </div>
        </section>
        <section className={styles.blockTwo}>
          <div className={styles.blockInner}>
            <h3 className={styles.blockTitle}>
              Los errores <strong>no son evidentes</strong>.
              <br />
              <span className={styles.titleSubline}>Por eso se repiten.</span>
            </h3>
            <p className={styles.blockText}>
              La mayoría de los errores que cometen los padres en el fútbol formativo
              <br />
              <strong>no nacen de la desinformación, sino de la buena intención.</strong>
              <br />
              <br />
              <strong>Aparecen en momentos cotidianos.</strong>
              <br />
              <strong>En frases dichas con cariño.</strong>
              <br />
              <strong>En silencios que parecen prudentes.</strong>
              <br />
              <strong>En gestos que nadie cuestiona.</strong>
              <br />
              <br />
              Por eso son tan difíciles de detectar.
            </p>
            <p className={styles.blockText}>
              No se trata de gritar, exigir o presionar de forma explícita.
              <br />
              Eso es fácil de ver.
              <br />
              <br />
              <span className={styles.listLead}>
                <strong>Los errores más frecuentes son más sutiles</strong>:
              </span>
            </p>
            <ul className={styles.blockList}>
              <li>
                <strong>confundir</strong> apoyo con intervención
              </li>
              <li>
                <strong>confundir</strong> motivación con expectativa
              </li>
              <li>
                <strong>confundir</strong> acompañar con dirigir
              </li>
              <li>
                <strong>confundir</strong> el proceso del niño con nuestras propias
                emociones
              </li>
            </ul>
            <p className={styles.blockText}>
              Y cuando nadie los nombra, se normalizan.
              <br />
              <br />
              <strong>Este libro identifica 10 errores específicos</strong>
              <br />
              que aparecen una y otra vez en el fútbol formativo.
              <br />
              <br />
              No para señalar culpables.
              <br />
              <strong>Sino para que puedas reconocerlos, entenderlos</strong>
              <br />
              y empezar a acompañar con más claridad.
            </p>
          </div>
        </section>
        <section className={styles.blockFour}>
          <div className={styles.blockInner}>
            <h3 className={styles.blockTitle}>
              ¿Qué incluye el Sistema Padres Formadores?
            </h3>
            <p className={styles.blockText}>
              No es un curso de fútbol. Es un sistema de acompañamiento para
              padres que quieren estar presentes sin invadir el proceso de sus
              hijos.
            </p>
            <div className={styles.pillars}>
              <div className={styles.pillar}>
                <h4 className={styles.pillarTitle}>Comprender</h4>
                <p className={styles.pillarText}>
                  Entender qué está en juego para un niño cuando compite y cómo
                  interpreta lo que oye y ve.
                </p>
              </div>
              <div className={styles.pillar}>
                <h4 className={styles.pillarTitle}>Escuchar</h4>
                <p className={styles.pillarText}>
                  Aprender a leer señales sutiles y elegir el momento correcto
                  para hablar o simplemente acompañar.
                </p>
              </div>
              <div className={styles.pillar}>
                <h4 className={styles.pillarTitle}>Ordenar</h4>
                <p className={styles.pillarText}>
                  Poner claridad en lo que sí ayuda, lo que confunde y lo que
                  puede dejar huella sin querer.
                </p>
              </div>
              <div className={styles.pillar}>
                <h4 className={styles.pillarTitle}>Acompañar</h4>
                <p className={styles.pillarText}>
                  Construir una presencia que da seguridad, calma y guía sin
                  exigir perfección.
                </p>
              </div>
            </div>
            <p className={styles.blockText}>
              No todos aprendemos de la misma manera.
              <br />
              Algunos necesitamos leer con calma.
              <br />
              Otros necesitamos escuchar para entender.
              <br />
              Otros necesitamos ver las ideas ordenadas y resumidas.
              <br />
              <br />
              Por eso este material no se entrega en un solo formato.
              <br />
              Cada error puede leerse, escucharse y mirarse,
              <br />
              para que puedas volver a él las veces que necesites
              <br />
              y comprenderlo desde distintos ángulos.
              <br />
              <br />
              No para consumir más contenido.
              <br />
              Sino para comprender mejor.
            </p>
            <p className={styles.blockText}>
              Incluye un libro digital, audios tipo podcast, videos breves e
              infografías que ordenan cada idea con claridad.
            </p>
            <p className={styles.blockText}>
              La intención no es hacerlo perfecto, sino hacerlo consciente.
              Acompañar con calma también es una decisión.
            </p>
          </div>
        </section>
        <section className={styles.blockFive}>
          <div className={styles.blockInner}>
            <h3 className={styles.blockTitle}>¿Es este sistema para ti?</h3>
            <p className={styles.blockText}>
              No se trata de juzgar ni culpar. Se trata de reconocer en qué
              momento estás y si este camino puede ayudarte.
            </p>
            <div className={styles.compareGrid}>
              <div className={styles.compareCol}>
                <h4 className={styles.compareTitle}>Sí es para ti si…</h4>
                <ul className={styles.blockList}>
                  <li>Quieres acompañar sin invadir el proceso de tu hijo</li>
                  <li>Te preguntas si lo que dices ayuda o suma presión</li>
                  <li>Buscas claridad para saber cuándo hablar y cuándo callar</li>
                  <li>Quieres entender mejor lo que tu hijo vive al competir</li>
                  <li>Te importa el vínculo, no solo el rendimiento</li>
                </ul>
              </div>
              <div className={styles.compareCol}>
                <h4 className={styles.compareTitle}>No es para ti si…</h4>
                <ul className={styles.blockList}>
                  <li>Buscas fórmulas rápidas para corregir a tu hijo</li>
                  <li>Crees que el niño debe adaptarse sin guía emocional</li>
                  <li>Prefieres que el resultado esté por encima del proceso</li>
                  <li>Quieres instrucciones estrictas sin espacio para escuchar</li>
                  <li>No estás dispuesto a revisar tu forma de acompañar</li>
                </ul>
              </div>
            </div>
            <p className={styles.blockText}>
              Si hoy no es tu momento, está bien. Acompañar también es un
              proceso y cada familia lo recorre a su ritmo.
            </p>
          </div>
        </section>
        <section className={styles.blockSix}>
          <div className={styles.blockInner}>
            <h3 className={styles.blockTitle}>
              Tomar la decisión con calma también es parte del proceso
            </h3>
            <p className={styles.blockText}>
              Si esto resuena contigo, aquí puedes empezar con tranquilidad.
            </p>
            <div className={styles.ctaRow}>
              <a
                className={styles.cta}
                href="https://pay.hotmart.com/L103355578D?sck=HOTMART_PRODUCT_PAGE&off=xlrnwxcl"
                target="_blank"
                rel="noopener noreferrer"
              >
                Acceder con calma al sistema
              </a>
              <p className={styles.micro}>
                Compra segura • Acceso inmediato • Sin plazos
              </p>
            </div>
            <ul className={styles.blockList}>
              <li>Libro digital con los 10 errores explicados</li>
              <li>Audios tipo podcast para profundizar cada tema</li>
              <li>Videos breves para comprender con ejemplos claros</li>
              <li>Infografías para ordenar lo aprendido</li>
            </ul>
            <p className={styles.blockText}>
              Puedes avanzar a tu propio ritmo, sin exigencias ni prisa.
            </p>
            <p className={styles.blockText}>
              Acompañar mejor no es un destino. Es una forma de estar.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
