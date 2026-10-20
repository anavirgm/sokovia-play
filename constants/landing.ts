/**
 * Contenido y enlaces de la portada pública.
 *
 * La portada es una sola página de anclas (`#catalogo`, `#reproductor`,
 * `#funciones`), así que sus destinos viven aquí y no en
 * `constants/navigation.ts`, que describe la navegación de todo el sitio.
 */

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
