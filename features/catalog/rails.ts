import { CATALOG_GENRE_RAILS } from "@/constants/landing";
import { getDiscoverMovies, getMoviesByList, getTrendingMovies, type TmdbResult } from "@/lib/tmdb";
import type { TmdbMovieListItem, TmdbPaginatedResponse } from "@/types/tmdb";

import { toMovieSummary, type MovieSummary } from "./movie";

/**
 * Filas del catálogo de la portada.
 *
 * Cada fila es una consulta a TMDB ya convertida en tarjetas. La política de
 * caché es de cada consulta (`lib/tmdb/queries.ts`), así que este módulo no
 * cachea nada: compone. Al no tener caché propia, si TMDB falla en un
 * revalidado la fila desaparece de la portada en lugar de enseñar datos
 * caducados que nadie puede distinguir de los buenos.
 *
 * Las doce filas se piden a la vez: en serie, la portada tardaría la suma de
 * las doce consultas en lugar de la de la más lenta.
 */

/** Votos mínimos para que una fila de género enseñe títulos reconocibles. */
const GENRE_MIN_VOTES = 200;

/** Una fila del catálogo: su título y los títulos que la pueblan. */
export type CatalogRail = {
  /** Identificador estable de la fila; es también la `key` de React. */
  key: string;
  /** Título visible de la fila. */
  heading: string;
  /** Hasta veinte títulos: una página completa de TMDB. */
  movies: MovieSummary[];
};

/**
 * Convierte una página de TMDB en las tarjetas de una fila.
 *
 * Descarta lo que una fila no puede enseñar: entradas para adultos (el endpoint
 * de tendencias no admite `include_adult`) y títulos sin póster, que en un
 * carril quedarían como un hueco gris entre carteles reales. Si el filtro se
 * llevara todo, la fila sale vacía y la vista no la pinta.
 */
function titlesOf(result: TmdbResult<TmdbPaginatedResponse<TmdbMovieListItem>>): MovieSummary[] {
  if (!result.ok) return [];

  return result.data.results
    .filter((item) => !item.adult && item.poster_path !== null)
    .map(toMovieSummary);
}

/** Filas que no dependen de un género: tendencias, populares y mejor valoradas. */
async function getEditorialRails(): Promise<CatalogRail[]> {
  const [trending, popular, topRated] = await Promise.all([
    getTrendingMovies("week"),
    getMoviesByList("popular"),
    getMoviesByList("top_rated"),
  ]);

  return [
    { key: "tendencias", heading: "Tendencias de la semana", movies: titlesOf(trending) },
    { key: "populares", heading: "Populares ahora", movies: titlesOf(popular) },
    { key: "valoradas", heading: "Mejor valoradas", movies: titlesOf(topRated) },
  ].filter((rail) => rail.movies.length > 0);
}

/** Una fila por género de la lista fija de la portada. */
async function getGenreRails(): Promise<CatalogRail[]> {
  const rails = await Promise.all(
    CATALOG_GENRE_RAILS.map(async (genre): Promise<CatalogRail> => {
      const result = await getDiscoverMovies({
        genreId: genre.id,
        // Por popularidad, no por nota: una fila del catálogo enseña lo que se
        // está viendo. Ordenar por nota deja películas antiguas y poco conocidas
        // que nadie entra a buscar.
        sortBy: "popularity.desc",
        minVoteCount: GENRE_MIN_VOTES,
      });

      return { key: `genero-${genre.id}`, heading: genre.label, movies: titlesOf(result) };
    }),
  );

  return rails.filter((rail) => rail.movies.length > 0);
}

/**
 * Filas de la portada, en el orden en que se pintan.
 *
 * Una fila sin títulos no se devuelve: la vista no pinta un encabezado sobre un
 * hueco vacío, y la fila siguiente sube a su sitio. Si TMDB no responde para
 * nada, el resultado es `[]` y la portada se queda solo con el hero.
 */
export async function getCatalogRails(): Promise<CatalogRail[]> {
  const [editorial, genres] = await Promise.all([getEditorialRails(), getGenreRails()]);

  return [...editorial, ...genres];
}
