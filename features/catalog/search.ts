import { SEARCH_MAX_PAGE, SEARCH_MAX_QUERY_LENGTH } from "@/constants/search";
import { searchMovies } from "@/lib/tmdb/queries";

import { toMovieSummary, type MovieSummary } from "./movie";

/**
 * Búsqueda de títulos del catálogo.
 *
 * La página `/search` no habla con TMDB: pide un resultado ya decidido a este
 * módulo, igual que la portada pide sus filas a `rails.ts`. Aquí se normalizan
 * los parámetros de la URL —que llegan como texto libre— y se traduce la
 * respuesta a la vista que consume la cuadrícula de tarjetas.
 *
 * La política de caché es de `searchMovies` (`cacheLife("minutes")`), así que
 * este módulo compone y no cachea: repetir una búsqueda dentro de esa ventana
 * no vuelve a llamar a TMDB y el resultado se comparte entre visitantes.
 */

/** Consulta ya normalizada: el texto que se busca y la página pedida. */
export type SearchQuery = {
  /** Texto recortado (sin espacios sobrantes), o cadena vacía si no hay búsqueda. */
  text: string;
  /** Página solicitada, entre 1 y `SEARCH_MAX_PAGE`. */
  page: number;
};

/**
 * Resultado de una búsqueda, como estado cerrado.
 *
 * `idle` no es lo mismo que "sin resultados": sin texto no se consulta TMDB y
 * la vista enseña una invitación a buscar; con texto y cero coincidencias se
 * enseña el vacío de resultados. Mezclarlos dejaría al usuario sin saber si su
 * búsqueda falló o si aún no ha escrito nada.
 */
export type SearchOutcome =
  | { status: "idle" }
  | { status: "error"; text: string; message: string }
  | {
      status: "ready";
      text: string;
      movies: MovieSummary[];
      page: number;
      totalPages: number;
      totalResults: number;
    };

/**
 * Parámetros de URL tal y como los entrega Next (`string` o lista de `string`).
 * Es la forma del `searchParams` de una página, sin acotar a las claves que esta
 * vista entiende: la URL es libre y el normalizador es quien la acota.
 */
export type RawSearchParams = { [key: string]: string | string[] | undefined };

/**
 * Next tipa cada parámetro como `string | string[]` porque `?q=a&q=b` es legal.
 * La búsqueda solo entiende un término, así que se queda con el primero.
 */
function firstValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

/**
 * Normaliza los parámetros de la URL.
 *
 * Es deliberadamente tolerante: una página no numérica, negativa o gigante cae
 * en la primera o en el tope en vez de romper la vista. Una URL manipulada no
 * debe poder provocar un error de render.
 */
export function readSearchQuery(params: RawSearchParams): SearchQuery {
  const text = firstValue(params.q).trim().slice(0, SEARCH_MAX_QUERY_LENGTH);
  const rawPage = Number.parseInt(firstValue(params.page), 10);
  const page = Number.isNaN(rawPage) || rawPage < 1 ? 1 : Math.min(rawPage, SEARCH_MAX_PAGE);

  return { text, page };
}

/**
 * Ejecuta la búsqueda y la devuelve como estado.
 *
 * A diferencia de las filas de la portada, aquí no se descarta ninguna película
 * sin póster: el usuario ha pedido un título concreto y esconderlo sería
 * mentirle. La tarjeta ya sabe dibujar su respaldo cuando falta el cartel.
 */
export async function getSearchOutcome(query: SearchQuery): Promise<SearchOutcome> {
  if (query.text.length === 0) return { status: "idle" };

  const result = await searchMovies(query.text, query.page);

  if (!result.ok) {
    return { status: "error", text: query.text, message: result.error.userMessage };
  }

  const { results, page, total_pages, total_results } = result.data;

  return {
    status: "ready",
    text: query.text,
    movies: results.map(toMovieSummary),
    page,
    // `total_pages` puede superar el tope de TMDB; el paginador no debe ofrecerlo.
    totalPages: Math.min(total_pages, SEARCH_MAX_PAGE),
    totalResults: total_results,
  };
}
