import Link from "next/link";
import { Film, TriangleAlert } from "lucide-react";

import { loadBrowsePage } from "@/actions/catalog";
import { Button, Notice, Skeleton, buttonVariants } from "@/components/ui";
import type { BrowseOutcome } from "@/features/catalog/browse";
import { cn } from "@/utils/cn";

import { InfiniteScrollGrid } from "./infinite-scroll-grid";
import { MovieGrid } from "./movie-grid";
import { MovieCardSkeleton } from "./skeletons";

/**
 * Bloque de resultados de la exploración.
 *
 * Traduce el estado de la consulta a interfaz y, si hay tarjetas, monta la
 * cuadrícula con scroll infinito. La acción que pide las páginas siguientes se
 * enlaza aquí —con el filtro de esta vista— para que la cuadrícula siga siendo
 * agnóstica: no sabe si está en `/explore` o en un género.
 *
 * El error de la primera página se pinta dentro de la página, no como un error
 * de ruta: el resto del catálogo (cabecera, filtros, otras secciones) sigue
 * siendo útil aunque TMDB no responda.
 */

type BrowseResultsProps = {
  outcome: BrowseOutcome;
  /** Slug del género, o `null` para el catálogo completo. */
  genreSlug: string | null;
};

export function BrowseResults({ outcome, genreSlug }: BrowseResultsProps) {
  if (outcome.status === "error") {
    return (
      <Notice
        icon={<TriangleAlert className="size-6" aria-hidden="true" />}
        title="No pudimos cargar el catálogo"
        description={outcome.message}
      >
        <Link href="/explore" className={cn(buttonVariants({ variant: "secondary" }))}>
          Volver a explorar
        </Link>
      </Notice>
    );
  }

  if (outcome.movies.length === 0) {
    return (
      <Notice
        icon={<Film className="size-6" aria-hidden="true" />}
        title="Este género aún no tiene títulos"
        description="TMDB no devolvió películas para este filtro. Prueba con otro género o vuelve al catálogo completo."
      >
        <Link href="/explore" className={cn(buttonVariants({ variant: "secondary" }))}>
          Ver todo el catálogo
        </Link>
      </Notice>
    );
  }

  // `.bind` fija el filtro en el servidor: el navegador solo puede pedir «la
  // página N de este género», no inventarse otro género ni otro orden.
  const loadPage = loadBrowsePage.bind(null, genreSlug);

  return (
    <InfiniteScrollGrid
      initialMovies={outcome.movies}
      initialPage={outcome.page}
      totalPages={outcome.totalPages}
      totalResults={outcome.totalResults}
      capped={outcome.capped}
      loadPage={loadPage}
    />
  );
}

/** Tarjetas del esqueleto: dos filas completas en escritorio. */
const FALLBACK_CARDS = 12;

/**
 * Respaldo mientras llega la primera página.
 *
 * Son los esqueletos del catálogo (#15) sobre la cuadrícula real: reservan la
 * misma altura que las tarjetas definitivas para que el scroll no salte, y el
 * botón bloqueado ocupa el sitio que luego ocupa «Cargar más».
 */
export function BrowseResultsFallback() {
  return (
    <div aria-busy="true" className="flex flex-col gap-3">
      <MovieGrid>
        {Array.from({ length: FALLBACK_CARDS }, (_, card) => (
          <li key={card}>
            <MovieCardSkeleton />
          </li>
        ))}
      </MovieGrid>

      <div className="flex justify-center py-6">
        <Button variant="secondary" disabled>
          Cargar más títulos
        </Button>
      </div>
    </div>
  );
}

/** Cabecera de una página de género mientras se resuelve el parámetro. */
export function GenreHeaderFallback() {
  return (
    <div aria-busy="true" className="flex flex-col gap-3">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-10 w-72 max-w-full" />
      <Skeleton className="h-5 w-full max-w-xl" />
    </div>
  );
}
