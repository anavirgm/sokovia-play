/**
 * Contenido editorial de la portada pública.
 *
 * La portada es hoy un catálogo: el hero y las filas de títulos. Sus decisiones
 * de contenido —qué destaca, qué géneros abren fila— viven aquí y no en
 * `constants/navigation.ts`, que describe la navegación de todo el sitio.
 */

import { genreById } from "./genres";

/** Repositorio público: el destino real del proyecto durante el Sprint 1. */
export const PROJECT_URL = "https://github.com/anavirgm/sokovia-play";

/**
 * Ancla a la sección del catálogo dentro de la portada.
 *
 * Es el destino de la acción principal del hero mientras la ficha de película
 * (#18) no existe: saltar a una sección que sí está en la página es preferible
 * a un enlace roto. Se reapunta a la ficha cuando esa ruta exista.
 */
export const CATALOG_ANCHOR = "#catalogo";

/** Género de TMDB que abre una fila del catálogo. */
export type CatalogGenreRail = {
  /** Id permanente del género: los ids de TMDB no cambian, los nombres sí. */
  id: number;
  /** Título de la fila, en el idioma de la interfaz. */
  label: string;
};

/**
 * Géneros que abren fila en la portada.
 *
 * Son ocho de los diecinueve de la taxonomía, elegidos a mano. La portada es
 * idéntica para todo el mundo —todavía no hay datos de cada usuario— y ahí una
 * selección fija rinde más que volcar la lista completa: las filas flojas
 * (documental, western, película de TV) y la repetición de los mismos títulos en
 * cinco filas desgastan más de lo que suman. La taxonomía entera se recorre en
 * `/explore` y en cada `/genres/[slug]`.
 *
 * El nombre lo pone la taxonomía, no TMDB: el título de una fila es una decisión
 * editorial, no un dato de la API. Los ids sí son los de TMDB, que son fijos.
 */
const CATALOG_GENRE_IDS = [28, 35, 18, 27, 878, 16, 53, 12] as const;

export const CATALOG_GENRE_RAILS: readonly CatalogGenreRail[] = CATALOG_GENRE_IDS.flatMap((id) => {
  const genre = genreById(id);

  // Un id que no exista en la taxonomía es un error de edición, no una razón
  // para romper la portada: se omite la fila y el resto sigue en pie.
  return genre ? [{ id: genre.id, label: genre.label }] : [];
});
