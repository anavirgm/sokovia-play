import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout/container";

const legalPages = {
  "aviso-legal": {
    title: "Aviso Legal",
    description: "Aviso legal de VesperFlix",
    content: (
      <>
        <h1>Aviso Legal</h1>
        <p>
          <strong>Última actualización:</strong> Octubre 2025
        </p>

        <h2>1. Identificación del sitio</h2>
        <p>
          VesperFlix es un sitio web de agregador de contenido audiovisual que muestra películas a
          través de iframes de terceros. No alojamos, almacenamos ni distribuimos archivos de video,
          audio o cualquier tipo de contenido multimedia en nuestros servidores.
        </p>

        <h2>2. Naturaleza del servicio</h2>
        <p>
          VesperFlix es únicamente un índice o agregador que proporciona enlaces e iframes a
          servidores de terceros. Todo el contenido mostrado proviene de sitios web ajenos a
          VesperFlix sobre los cuales no tenemos control, responsabilidad ni propiedad.
        </p>

        <h2>3. Propiedad intelectual</h2>
        <p>
          Los títulos, pósters, sinopsis y metadatos mostrados provienen de{" "}
          <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer">
            The Movie Database (TMDB)
          </a>
          , utilizado bajo su licencia. Los vídeos son propiedad de sus respectivos titulares de
          derechos.
        </p>

        <h2>4. Responsabilidad</h2>
        <p>
          VesperFlix no se hace responsable del contenido, legalidad, exactitud o disponibilidad de
          los sitios web de terceros enlazados. El acceso y uso de dichos contenidos es
          responsabilidad exclusiva del usuario.
        </p>

        <h2>5. Uso del sitio</h2>
        <p>
          El uso de este sitio es bajo tu propia responsabilidad. Al acceder a VesperFlix, aceptas
          estos términos y reconoces que el contenido se encuentra alojado en servidores externos.
        </p>
      </>
    ),
  },
  privacidad: {
    title: "Política de Privacidad",
    description: "Política de privacidad de VesperFlix",
    content: (
      <>
        <h1>Política de Privacidad</h1>
        <p>
          <strong>Última actualización:</strong> Octubre 2025
        </p>

        <h2>1. Información que recopilamos</h2>
        <p>VesperFlix recopila la mínima información necesaria para su funcionamiento:</p>
        <ul>
          <li>
            <strong>Datos de autenticación:</strong> Si inicias sesión como administrador,
            utilizamos Supabase Auth para gestionar la autenticación.
          </li>
          <li>
            <strong>Historial de visualización:</strong> Almacenamos tu progreso de reproducción en
            nuestra base de datos únicamente si estás autenticado.
          </li>
          <li>
            <strong>Datos locales:</strong> Utilizamos localStorage para guardar preferencias como
            el último servidor seleccionado o el progreso de visualización anónimo.
          </li>
        </ul>

        <h2>2. Servicios de terceros</h2>
        <ul>
          <li>
            <strong>TMDB:</strong> Para obtener información de películas. Consulta su{" "}
            <a
              href="https://www.themoviedb.org/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
            >
              política de privacidad
            </a>
            .
          </li>
          <li>
            <strong>Supabase:</strong> Para autenticación y almacenamiento de datos. Consulta su{" "}
            <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">
              política de privacidad
            </a>
            .
          </li>
          <li>
            <strong>Servidores de streaming:</strong> Los iframes provienen de terceros con sus
            propias políticas de privacidad.
          </li>
        </ul>

        <h2>3. Cookies</h2>
        <p>
          Utilizamos cookies técnicas necesarias para la autenticación y funcionamiento del sitio.
          No utilizamos cookies de seguimiento publicitario.
        </p>

        <h2>4. Tus derechos</h2>
        <p>
          Puedes solicitar la eliminación de tus datos contactando con nosotros. Los datos
          almacenados localmente pueden eliminarse desde la configuración de tu navegador.
        </p>
      </>
    ),
  },
  terminos: {
    title: "Términos y Condiciones",
    description: "Términos y condiciones de uso de VesperFlix",
    content: (
      <>
        <h1>Términos y Condiciones</h1>
        <p>
          <strong>Última actualización:</strong> Octubre 2025
        </p>

        <h2>1. Aceptación de los términos</h2>
        <p>
          Al acceder y utilizar VesperFlix, aceptas estar sujeto a estos términos y condiciones. Si
          no estás de acuerdo con alguno de ellos, no debes usar este sitio.
        </p>

        <h2>2. Descripción del servicio</h2>
        <p>
          VesperFlix es un agregador que muestra contenido audiovisual a través de iframes de
          terceros. <strong>NO alojamos, almacenamos ni distribuimos ningún archivo</strong> de
          video en nuestros servidores.
        </p>

        <h2>3. Uso permitido</h2>
        <ul>
          <li>Uso personal y no comercial</li>
          <li>Acceso a contenido disponible públicamente</li>
          <li>Respeto a las leyes aplicables en tu jurisdicción</li>
        </ul>

        <h2>4. Uso prohibido</h2>
        <ul>
          <li>Uso con fines comerciales o publicitarios no autorizados</li>
          <li>Intentar eludir medidas de seguridad</li>
          <li>Usar el sitio para cualquier actividad ilegal</li>
          <li>Realizar scraping masivo o automatización abusiva</li>
        </ul>

        <h2>5. Limitación de responsabilidad</h2>
        <p>
          VesperFlix no se hace responsable de daños directos, indirectos, incidentales o
          consecuentes derivados del uso del sitio. El usuario asume toda la responsabilidad por el
          acceso y uso de los contenidos de terceros.
        </p>

        <h2>6. Modificaciones</h2>
        <p>
          Nos reservamos el derecho de modificar estos términos en cualquier momento. El uso
          continuado del sitio tras dichas modificaciones implica la aceptación de los nuevos
          términos.
        </p>
      </>
    ),
  },
  dmca: {
    title: "Política DMCA",
    description: "Procedimiento de notificación DMCA de VesperFlix",
    content: (
      <>
        <h1>Política DMCA</h1>
        <p>
          <strong>Última actualización:</strong> Octubre 2025
        </p>

        <h2>1. Declaración</h2>
        <p>
          VesperFlix respeta los derechos de propiedad intelectual de terceros. Como agregador que
          solo muestra iframes de terceros, no alojamos contenido protegido por derechos de autor en
          nuestros servidores.
        </p>

        <h2>2. Procedimiento de notificación</h2>
        <p>
          Si eres titular de derechos de autor o su representante autorizado y consideras que algún
          contenido accesible a través de VesperFlix infringe tus derechos, envía una notificación
          por escrito con la siguiente información:
        </p>
        <ul>
          <li>Identificación de la obra protegida que se alega infringida</li>
          <li>URL exacta de la página donde se encuentra el contenido supuestamente infractor</li>
          <li>Datos de contacto (nombre, dirección, email, teléfono)</li>
          <li>
            Declaración de buena fe de que el uso no está autorizado por el titular, su agente o la
            ley
          </li>
          <li>
            Declaración de que la información es correcta y que eres el titular o estás autorizado a
            actuar en su nombre
          </li>
          <li>Firma física o electrónica</li>
        </ul>

        <h2>3. Contacto DMCA</h2>
        <p>
          Envía tu notificación a: <strong>dmca@VesperFlix.com</strong>
        </p>

        <h2>4. Acción tras la notificación</h2>
        <p>
          Tras recibir una notificación válida conforme a la DMCA, tomaremos las medidas razonables
          para eliminar o deshabilitar el acceso al contenido, siempre que sea posible desde nuestra
          plataforma.
        </p>

        <h2>5. Contranotificación</h2>
        <p>
          Si consideras que tu contenido fue eliminado por error, puedes enviarnos una
          contranotificación con la información requerida por la DMCA.
        </p>
      </>
    ),
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = legalPages[slug as keyof typeof legalPages];

  if (!page) {
    return {
      title: "Página no encontrada | VesperFlix",
    };
  }

  return {
    title: `${page.title} | VesperFlix`,
    description: page.description,
  };
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = legalPages[slug as keyof typeof legalPages];

  if (!page) {
    notFound();
  }

  return (
    <main className="flex flex-1 flex-col py-10 sm:py-14">
      <Container className="max-w-4xl">
        <article className="prose prose-invert prose-headings:tracking-tight prose-headings:text-foreground prose-p:text-muted prose-li:text-muted prose-a:text-brand-soft prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground max-w-none">
          {page.content}
        </article>
      </Container>
    </main>
  );
}
