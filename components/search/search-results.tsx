import Link from "next/link";

import { MovieCard } from "@/components/catalog/movie-card";
import { Skeleton, buttonVariants } from "@/components/ui";
import { getSearchOutcome } from "@/features/catalog/search";
import { cn } from "@/utils/cn";

import { SearchError, SearchIdle, SearchNoResults } from "./search-states";

/**
 * Resultados de la búsqueda.
 *
 * Es un componente de servidor que resuelve su propia consulta: así el campo de
 * búsqueda y su estado inicial llegan al navegador antes que la respuesta de
 * TMDB, y la lista se rellena cuando está lista en lugar de retrasar la página
 * entera. La cuadrícula y la paginación son enlaces de verdad —compartibles y
 * navegables sin JavaScript—; el scroll infinito llega en el #14 sobre esta
 * misma base.
 */

/** Geometría compartida por la cuadrícula real y su esqueleto de carga. */
const GRID_CLASS =
  "grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";

/** Tarjetas del esqueleto: dos filas completas en escritorio. */
const FALLBACK_CARDS = 12;

type SearchResultsProps = {
  /** Texto ya normalizado por la página. */
  query: string;
  /** Página solicitada, ya acotada. */
  page: number;
};

export async function SearchResults({ query, page }: SearchResultsProps) {
  const outcome = await getSearchOutcome({ text: query, page });

  if (outcome.status === "idle") return <SearchIdle />;
  if (outcome.status === "error") return <SearchError message={outcome.message} />;
  if (outcome.movies.length === 0) {
    return (
      <SearchNoResults
        text={outcome.text}
        page={outcome.page}
        totalResults={outcome.totalResults}
      />
    );
  }

  return (
    <section
      aria-label={`Resultados para ${outcome.text}`}
      className="flex flex-col gap-8 sm:gap-10"
    >
      {/* Región viva: al cambiar de consulta, un lector de pantalla oye cuántos
          títulos han llegado sin tener que salir del campo de búsqueda. */}
      <p aria-live="polite" className="text-sm text-muted">
        {outcome.totalResults.toLocaleString("es-ES")}{" "}
        {outcome.totalResults === 1 ? "resultado" : "resultados"} para{" "}
        <span className="font-medium text-foreground">«{outcome.text}»</span>
      </p>

      <ul className={GRID_CLASS}>
        {outcome.movies.map((movie) => (
          <li key={movie.id}>
            <MovieCard movie={movie} />
          </li>
        ))}
      </ul>

      {outcome.totalPages > 1 ? (
        <SearchPagination text={outcome.text} page={outcome.page} totalPages={outcome.totalPages} />
      ) : null}
    </section>
  );
}

type SearchPaginationProps = {
  text: string;
  page: number;
  totalPages: number;
};

/**
 * Paginación con enlaces, no con botones.
 *
 * Cada página es una URL (`?q=…&page=…`): se puede compartir, abrir en otra
 * pestaña y recorrer con el historial. `totalPages` ya viene acotado al tope de
 * TMDB, así que el enlace «Siguiente» siempre existe de verdad.
 */
function SearchPagination({ text, page, totalPages }: SearchPaginationProps) {
  const hrefFor = (target: number) => {
    const params = new URLSearchParams({ q: text });
    // La primera página es la URL canónica de la búsqueda: sin `page=1`.
    if (target > 1) params.set("page", String(target));

    return `/search?${params.toString()}`;
  };

  return (
    <nav
      aria-label="Paginación de resultados"
      className="flex flex-wrap items-center justify-center gap-4 pt-2"
    >
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className={cn(buttonVariants({ variant: "secondary" }))}>
          Anterior
        </Link>
      ) : (
        // Sin acción disponible: ocupa su sitio, pero no se anuncia ni se enfoca.
        <span
          aria-hidden="true"
          className={cn(buttonVariants({ variant: "secondary" }), "pointer-events-none opacity-40")}
        >
          Anterior
        </span>
      )}

      <p className="text-sm text-muted tabular-nums">
        Página {page} de {Math.max(totalPages, page)}
      </p>

      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} className={cn(buttonVariants({ variant: "secondary" }))}>
          Siguiente
        </Link>
      ) : (
        <span
          aria-hidden="true"
          className={cn(buttonVariants({ variant: "secondary" }), "pointer-events-none opacity-40")}
        >
          Siguiente
        </span>
      )}
    </nav>
  );
}

/**
 * Respaldo de carga de los resultados.
 *
 * Replica la geometría de la cuadrícula para que el contenido no salte cuando
 * llega. El esqueleto definitivo —con el anuncio a lectores de pantalla— es del
 * #15, igual que en la portada.
 */
export function SearchResultsFallback() {
  return (
    <div aria-busy="true" className="flex flex-col gap-8 sm:gap-10">
      <Skeleton className="h-5 w-56" />

      <ul className={GRID_CLASS}>
        {Array.from({ length: FALLBACK_CARDS }, (_, card) => (
          <li key={card} className="flex flex-col gap-2.5">
            <Skeleton className="aspect-[2/3] w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-3.5 w-1/3" />
          </li>
        ))}
      </ul>
    </div>
  );
}
