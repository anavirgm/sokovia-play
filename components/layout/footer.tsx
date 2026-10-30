import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { Container } from "@/components/layout/container";
import { PROJECT_URL } from "@/constants/landing";

/** Enlaces de servicio: los mismos destinos que la barra superior, más el código. */
const footerLinks: { label: string; href: string; external?: boolean }[] = [
  { label: "Catálogo", href: "/#catalogo" },
  { label: "Explorar", href: "/explore" },
  { label: "GitHub", href: PROJECT_URL, external: true },
  { label: "Iniciar sesión", href: "/login" },
];

const legalLinks: { label: string; href: string }[] = [
  { label: "Aviso Legal", href: "/legal/aviso-legal" },
  { label: "Política de Privacidad", href: "/legal/privacidad" },
  { label: "Términos y Condiciones", href: "/legal/terminos" },
  { label: "DMCA", href: "/legal/dmca" },
];

/**
 * Pie del sitio.
 *
 * Cierra con el mismo gesto que abre la portada: el nombre a ancho completo,
 * ahora invirtiendo campo y tinta. Encima van los datos que hay que poder leer
 * —qué es esto, qué queda por hacer, la atribución de TMDB, que es obligatoria
 * al usar sus datos e imágenes— en el margen de la página y a tamaño de texto,
 * no en columnas de enlaces.
 */
export function Footer() {
  return (
    <footer>
      {/* El nombre entero, a ancho completo: la misma firma que abre la portada. */}
      <div className="bg-foreground text-background">
        <div className="@container mx-auto w-full max-w-[88rem] px-4 pt-10 pb-4 sm:px-6">
          <p className="text-right text-[17cqw] leading-[0.85] font-semibold tracking-[-0.05em]">
            VesperFlix
          </p>
        </div>
      </div>

      <div className="bg-surface/30">
        <Container className="grid gap-10 py-14 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-16">
          <div className="flex max-w-[52ch] flex-col gap-4">
            <p className="flex items-center gap-2">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand/15 text-brand-soft">
                <ShieldCheck className="size-4" aria-hidden="true" />
              </span>
              <span className="text-base font-semibold">VesperFlix</span>
            </p>

            <p className="text-sm leading-relaxed text-muted">
              Agregador cinematográfico impulsado por TMDB. Los contenidos se muestran a través de
              iframes de terceros. No alojamos, almacenamos ni distribuimos archivos multimedia.
            </p>

            <p className="text-sm leading-relaxed text-muted">
              Vista previa construida con datos e imágenes de TMDB. Este producto usa la API de
              TMDB, pero no está respaldado ni certificado por TMDB.
            </p>
          </div>

          <nav aria-label="Secundaria">
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm sm:flex-col sm:gap-y-3 sm:text-right">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noreferrer" : undefined}
                    className="text-muted transition-colors duration-200 hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </Container>

        <Container className="flex flex-col items-center gap-4 pb-12 text-center">
          <nav aria-label="Legal" className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted transition-colors duration-200 hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <p className="text-sm text-muted">
            © VesperFlix. Proyecto de portafolio, datos de catálogo por TMDB.
          </p>
        </Container>
      </div>
    </footer>
  );
}
