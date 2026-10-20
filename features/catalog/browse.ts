import { BROWSE_MAX_PAGE } from "@/constants/catalog";
import { getDiscoverMovies } from "@/lib/tmdb/queries";

import { toMovieSummary, type MovieSummary } from "./movie";

/**
 * Exploración del catálogo: la lista paginada que alimenta la cuadrícula con
 * scroll infinito (#14).
 *
 * `/explore` y `/genres/[slug]` comparten esta pieza. La página pide la primera
 * página en el servidor —así llega HTML con tarjetas, no un esqueleto vacío— y
 * el resto lo pide el navegador a la acción de `actions/catalog.ts`, que vuelve
 * a entrar aquí. Hay una sola definición de «qué es una página del catálogo»,
 * así que una página pedida desde el cliente y la misma pedida al recargar
 * devuelven exactamente lo mismo.
 *
 * La caché es la de `getDiscoverMovies` (`cacheLife("hours")` + etiqueta de
 * descubrir): este módulo compone y traduce, no decide caducidades.
 */

/** Página del catálogo ya resuelta, lista para pintar. */
export type BrowsePage = {
  status: "ready";
  movies: MovieSummary[];
  /** Página que devolvió TMDB, ya acotada. */
  page: number;
  /** Última página alcanzable por esta vista (nunca más de `BROWSE_MAX_PAGE`). */
  totalPages: number;
  /** Total real de coincidencias en TMDB, para el copy del final. */
  totalResults: number;
  /** `true` si TMDB tiene más páginas de las que esta vista carga. */
  capped: boolean;
};

/** El catálogo no se pudo consultar. */
export type BrowseFailure = { status: "error"; message: string };

/** Resultado de pedir una página: o trae tarjetas, o trae un motivo. */
export type BrowseOutcome = BrowsePage | BrowseFailure;

/** Qué se está explorando y desde dónde. */
export type BrowseQuery = {
  /** Id de TMDB del género, o `null` para el catálogo completo. */
  genreId: number | null;
  /** Página pedida; se acota aquí porque puede venir del cliente. */
  page: number;
};

/**
 * Acota una página al rango que entiende el catálogo.
 *
 * Es la frontera de confianza: la acción de servidor es un endpoint público y
 * el número llega del navegador. Un valor no numérico, negativo o gigante cae en
 * la primera página o en el techo en vez de llegar a TMDB.
 */
export function clampBrowsePage(page: number): number {
  if (!Number.isFinite(page)) return 1;

  return Math.min(Math.max(Math.trunc(page), 1), BROWSE_MAX_PAGE);
}

/**
 * Pide una página del catálogo.
 *
 * Ordena por popularidad, que es el orden por defecto razonable para «todo el
 * catálogo» y para un género: lo primero que aparece es lo que la gente está
 * viendo, no lo último que entró en la base de datos. No se filtra por número de
 * votos —a diferencia de las filas de la portada— porque aquí el usuario ha
 * venido a explorar, no a que le escojan ocho títulos; los sin póster tampoco se
 * descartan: la tarjeta ya sabe dibujar su respaldo.
 */
export async function getBrowsePage({ genreId, page }: BrowseQuery): Promise<BrowseOutcome> {
  const requestedPage = clampBrowsePage(page);

  const result = await getDiscoverMovies({
    genreId: genreId ?? undefined,
    page: requestedPage,
    sortBy: "popularity.desc",
  });

  if (!result.ok) {
    return { status: "error", message: result.error.userMessage };
  }

  const { results, page: currentPage, total_pages, total_results } = result.data;

  return {
    status: "ready",
    movies: results.map(toMovieSummary),
    page: currentPage,
    totalPages: Math.min(total_pages, BROWSE_MAX_PAGE),
    totalResults: total_results,
    capped: total_pages > BROWSE_MAX_PAGE,
  };
}
