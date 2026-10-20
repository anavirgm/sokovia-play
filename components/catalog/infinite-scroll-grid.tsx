"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui";
import type { BrowseOutcome } from "@/features/catalog/browse";
import type { MovieSummary } from "@/features/catalog/movie";

import { MovieCard } from "./movie-card";
import { MovieGrid } from "./movie-grid";
import { MovieCardSkeleton } from "./skeletons";

/**
 * Cuadrícula del catálogo que crece al hacer scroll.
 *
 * La primera página llega renderizada desde el servidor: el HTML inicial ya
 * tiene tarjetas y el póster del primer título puede empezar a cargar sin
 * esperar a JavaScript. Las siguientes se piden a una acción de servidor cuando
 * el centinela del final entra en pantalla.
 *
 * Decisiones que no se ven en el código:
 *
 * - **Se añade, no se sustituye.** Cada página se concatena a la lista y se
 *   deduplica por id: TMDB puede repetir un título entre dos páginas si la
 *   popularidad se mueve, y una clave repetida de React rompería la lista.
 * - **Nada de `scrollIntoView`.** El scroll del usuario no se toca: las tarjetas
 *   nuevas aparecen debajo y el esqueleto reserva su altura, así que la posición
 *   en la que estaba leyendo no se mueve.
 * - **Un botón, además del observador.** El `IntersectionObserver` es una
 *   comodidad; el botón «Cargar más» es la vía real cuando el observador no
 *   existe, cuando el navegador ahorra datos o cuando alguien navega con teclado
 *   y no quiere depender de que el centinela se vea.
 * - **El error se queda en la lista.** Si falla una página, se ofrece reintentar
 *   sin perder las anteriores. No se reintenta solo: un error de TMDB suele
 *   repetirse y un bucle de peticiones empeoraría la espera.
 */

/** Tarjetas fantasma mientras llega la página siguiente. */
const SKELETON_CARDS = 6;

/**
 * Margen con el que se adelanta la carga.
 *
 * Se pide la página siguiente cuando el final está a media pantalla de
 * distancia, no cuando ya se ve: así, con una conexión normal, el hueco del
 * esqueleto dura poco. El `rootMargin` también hace que la carga se dispare en
 * pantallas altas sin que el usuario llegue a tocar el fondo.
 */
const PRELOAD_MARGIN = "600px 0px";

type InfiniteScrollGridProps = {
  /** Primera página, ya resuelta por el servidor. */
  initialMovies: MovieSummary[];
  /** Página de la que salieron esas tarjetas. */
  initialPage: number;
  /** Última página alcanzable en esta vista (nunca más de `BROWSE_MAX_PAGE`). */
  totalPages: number;
  /** Total real de coincidencias en TMDB, para explicar el límite de la vista. */
  totalResults: number;
  /** `true` si TMDB tiene más páginas de las que esta vista carga. */
  capped: boolean;
  /**
   * Pide una página. La página la enlaza con el filtro que corresponda, así que
   * esta cuadrícula no sabe si explora un género o el catálogo entero.
   */
  loadPage: (page: number) => Promise<BrowseOutcome>;
};

/** Une dos páginas sin repetir títulos. */
function appendUnique(current: MovieSummary[], incoming: MovieSummary[]): MovieSummary[] {
  const seen = new Set(current.map((movie) => movie.id));

  return [...current, ...incoming.filter((movie) => !seen.has(movie.id))];
}

export function InfiniteScrollGrid({
  initialMovies,
  initialPage,
  totalPages,
  totalResults,
  capped,
  loadPage,
}: InfiniteScrollGridProps) {
  const [movies, setMovies] = useState(initialMovies);
  const [page, setPage] = useState(initialPage);
  const [lastPage, setLastPage] = useState(totalPages);
  const [isCapped, setCapped] = useState(capped);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sentinelRef = useRef<HTMLDivElement>(null);
  // El estado de React llega un render tarde para decidir si ya hay una
  // petición en vuelo: el observador puede dispararse varias veces antes de que
  // `isLoading` se pinte. El ref es la única puerta fiable.
  const isLoadingRef = useRef(false);

  const isEnd = page >= lastPage;

  const loadMore = useCallback(
    async (force = false) => {
      if (isLoadingRef.current || isEnd) return;
      // Un error exige un gesto explícito: sin `force`, el observador no debe
      // reintentar en bucle mientras el mensaje sigue en pantalla.
      if (!force && error !== null) return;

      isLoadingRef.current = true;
      setLoading(true);

      try {
        const outcome = await loadPage(page + 1);

        if (outcome.status === "error") {
          setError(outcome.message);
          return;
        }

        setMovies((current) => appendUnique(current, outcome.movies));
        setPage(outcome.page);
        // Una página vacía antes del final anunciado es un final de facto:
        // seguir pidiendo devolvería lo mismo y el observador no pararía.
        setLastPage(outcome.movies.length === 0 ? outcome.page : outcome.totalPages);
        setCapped(outcome.capped);
        setError(null);
      } catch {
        // Una acción de servidor también puede rechazar (sin conexión, un
        // despliegue nuevo que invalidó la acción). No es «TMDB falló», pero
        // para quien está leyendo es el mismo callejón: mensaje y reintento.
        setError("No pudimos cargar más títulos. Comprueba tu conexión e inténtalo de nuevo.");
      } finally {
        isLoadingRef.current = false;
        setLoading(false);
      }
    },
    [error, isEnd, loadPage, page],
  );

  const retry = useCallback(() => {
    setError(null);
    void loadMore(true);
  }, [loadMore]);

  useEffect(() => {
    const node = sentinelRef.current;

    // Al final o con un error visible el observador sobra: el botón es la única
    // salida y así no se pide una página que ya sabemos que no existe.
    if (node === null || isEnd || error !== null) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) void loadMore();
      },
      { rootMargin: PRELOAD_MARGIN },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [error, isEnd, loadMore]);

  const announcement = isLoading
    ? "Cargando más títulos"
    : error !== null
      ? "No se pudieron cargar más títulos"
      : isEnd
        ? `Fin de la lista. ${movies.length} títulos cargados.`
        : "";

  return (
    <div className="flex flex-col gap-3">
      <MovieGrid aria-busy={isLoading || undefined}>
        {movies.map((movie) => (
          <li key={movie.id}>
            <MovieCard movie={movie} />
          </li>
        ))}

        {isLoading
          ? Array.from({ length: SKELETON_CARDS }, (_, card) => (
              <li key={`skeleton-${card}`}>
                <MovieCardSkeleton />
              </li>
            ))
          : null}
      </MovieGrid>

      {/* Un solo anuncio para toda la vida de la lista: encadenar regiones vivas
          haría que un lector de pantalla celebrara cada página como un cambio
          de página entero. */}
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>

      <div ref={sentinelRef} className="flex flex-col items-center gap-3 py-6 text-center">
        {isEnd ? (
          <p className="max-w-xl text-sm text-pretty text-muted">
            {isCapped
              ? `Límite de esta vista: ${movies.length} de ${totalResults.toLocaleString("es-ES")} títulos. Cambia de género para seguir explorando.`
              : `Has llegado al final · ${movies.length} ${movies.length === 1 ? "título" : "títulos"}.`}
          </p>
        ) : error !== null ? (
          <div role="alert" className="flex flex-col items-center gap-3">
            <p className="flex items-center gap-2 text-sm text-danger">
              <TriangleAlert className="size-4 shrink-0" aria-hidden="true" />
              {error}
            </p>
            <Button variant="secondary" onClick={retry}>
              Reintentar
            </Button>
          </div>
        ) : (
          <>
            <Button variant="secondary" isLoading={isLoading} onClick={() => void loadMore()}>
              Cargar más títulos
            </Button>
            <p className="text-xs text-muted">
              Los títulos también se cargan solos al llegar al final.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
