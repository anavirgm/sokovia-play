/**
 * Límites de la búsqueda, compartidos por cliente y servidor.
 *
 * Viven fuera de `features/` para que el campo (cliente) y el normalizador de la
 * URL (servidor) apliquen el mismo tope sin que el navegador arrastre la capa de
 * datos de TMDB solo para leer una constante.
 */

/** Longitud máxima de una consulta; evita URLs y claves de caché absurdas. */
export const SEARCH_MAX_QUERY_LENGTH = 100;

/**
 * TMDB no sirve páginas más allá de la 500 aunque `total_pages` anuncie más:
 * el tope es de la API, no del catálogo. Se recorta para que el paginador nunca
 * ofrezca un enlace que TMDB rechazaría.
 */
export const SEARCH_MAX_PAGE = 500;
