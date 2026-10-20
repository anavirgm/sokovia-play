import Link from "next/link";

import { MOVIE_GENRES } from "@/constants/genres";
import { cn } from "@/utils/cn";

/**
 * Filtro por género del catálogo.
 *
 * Cada género es un enlace de verdad a su página (`/genres/[slug]`), no un botón
 * que dispara una consulta: la vista filtrada tiene URL propia, se puede
 * compartir y abrir en otra pestaña, y el navegador la cachea como cualquier otra
 * página. Este componente no necesita JavaScript.
 *
 * El género activo se pinta como texto y no como enlace a la página en la que ya
 * estamos: un enlace que recarga lo mismo es ruido para quien navega con teclado
 * o lector de pantalla. «Todas» lleva a `/explore` porque el catálogo completo es
 * el estado sin filtro, no una página aparte.
 */

const CHIP_BASE =
  "inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-medium transition-colors duration-200 ease-out-quart outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const CHIP_INACTIVE =
  "border-border bg-surface/60 text-muted hover:border-brand/60 hover:bg-surface-hover hover:text-foreground";

const CHIP_ACTIVE = "border-transparent bg-brand-strong text-white";

export function GenreNav({ currentSlug = null }: { currentSlug?: string | null }) {
  return (
    <nav aria-label="Filtrar por género" className="flex flex-col gap-3">
      <ul className="flex flex-wrap gap-2">
        <li>
          {currentSlug === null ? (
            <span aria-current="page" className={cn(CHIP_BASE, CHIP_ACTIVE)}>
              Todas
            </span>
          ) : (
            <Link href="/explore" className={cn(CHIP_BASE, CHIP_INACTIVE)}>
              Todas
            </Link>
          )}
        </li>

        {MOVIE_GENRES.map((genre) => {
          const isCurrent = genre.slug === currentSlug;

          return (
            <li key={genre.id}>
              {isCurrent ? (
                <span aria-current="page" className={cn(CHIP_BASE, CHIP_ACTIVE)}>
                  {genre.label}
                </span>
              ) : (
                <Link href={`/genres/${genre.slug}`} className={cn(CHIP_BASE, CHIP_INACTIVE)}>
                  {genre.label}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
