/**
 * Taxonomía de géneros de película.
 *
 * Es la lista completa de TMDB —diecinueve géneros— con nombre y descripción
 * propios. Igual que en la portada, el texto es una decisión editorial y no un
 * dato de la API: TMDB da los nombres en el idioma que se le pida, pero un
 * título de página no debería cambiar porque cambie el catálogo.
 *
 * Los `id` son los de TMDB y no cambian nunca; los `slug` son nuestros y sí
 * pueden cambiar, así que la URL de un género no depende de cómo se llame hoy
 * en TMDB.
 *
 * La portada usa un subconjunto (`CATALOG_GENRE_RAILS`); `/explore` y
 * `/genres/[slug]` recorren la lista entera.
 */

/** Género de película con su identidad de URL y su copy de cabecera. */
export type MovieGenre = {
  /** Id permanente de TMDB (`with_genres`). */
  id: number;
  /** Fragmento de URL estable e independiente del idioma: `/genres/ciencia-ficcion`. */
  slug: string;
  /** Nombre visible en español. */
  label: string;
  /** Una línea editorial para la cabecera de su página. */
  description: string;
};

/**
 * Los diecinueve géneros de TMDB, en orden alfabético español.
 *
 * El orden importa: es el de los filtros de `/explore` y las páginas de género,
 * y ahí buscar por orden alfabético funciona mejor que reproducir el orden
 * interno de TMDB, que no significa nada para quien navega.
 */
export const MOVIE_GENRES: readonly MovieGenre[] = [
  {
    id: 28,
    slug: "accion",
    label: "Acción",
    description:
      "Persecuciones, peleas y relojes que no paran. El género que convierte una tarde tranquila en una montaña rusa.",
  },
  {
    id: 16,
    slug: "animacion",
    label: "Animación",
    description:
      "Dibujo, stop-motion y CGI: historias donde el único límite es lo que el estudio se atreve a imaginar.",
  },
  {
    id: 12,
    slug: "aventura",
    label: "Aventura",
    description:
      "Mapas, tesoros y mundos por descubrir. Películas que se miden en kilómetros recorridos.",
  },
  {
    id: 10752,
    slug: "belica",
    label: "Bélica",
    description:
      "El conflicto armado como escenario. No siempre heroísmo; casi siempre consecuencias.",
  },
  {
    id: 878,
    slug: "ciencia-ficcion",
    label: "Ciencia ficción",
    description:
      "Futuros posibles, tecnologías imposibles y las preguntas que ninguna época termina de responder.",
  },
  {
    id: 35,
    slug: "comedia",
    label: "Comedia",
    description:
      "El género más difícil de presentar sin arruinar el chiste. Aquí va la risa, no el spoiler.",
  },
  {
    id: 80,
    slug: "crimen",
    label: "Crimen",
    description: "Mafias, detectives y planes que casi salen bien. Cine negro en todas sus épocas.",
  },
  {
    id: 99,
    slug: "documental",
    label: "Documental",
    description:
      "Historias reales contadas con herramientas de cine, sin renunciar a la mirada de quien las firma.",
  },
  {
    id: 18,
    slug: "drama",
    label: "Drama",
    description:
      "Conflictos humanos sin atajos: el género donde el cine se toma su tiempo y lo pide a cambio.",
  },
  {
    id: 10751,
    slug: "familia",
    label: "Familia",
    description: "Películas para ver juntos, con la edad como única advertencia.",
  },
  {
    id: 14,
    slug: "fantasia",
    label: "Fantasía",
    description:
      "Magia, criaturas y reglas propias: el mundo donde todo lo imposible tiene su propia lógica.",
  },
  {
    id: 36,
    slug: "historia",
    label: "Historia",
    description:
      "Reconstrucciones de épocas y personajes que cambiaron algo, con mayor o menor licencia.",
  },
  {
    id: 9648,
    slug: "misterio",
    label: "Misterio",
    description: "Preguntas antes que respuestas: el placer está en no saberlo todavía.",
  },
  {
    id: 10402,
    slug: "musica",
    label: "Música",
    description:
      "Biografías de artistas, conciertos y películas donde la banda sonora es parte de la trama.",
  },
  {
    id: 10770,
    slug: "pelicula-de-tv",
    label: "Película de TV",
    description:
      "Producciones pensadas para la pantalla pequeña, donde el guion suele llevar todo el peso.",
  },
  {
    id: 10749,
    slug: "romance",
    label: "Romance",
    description: "Encuentros, desencuentros y todo lo que ocurre entre ambos.",
  },
  {
    id: 53,
    slug: "suspense",
    label: "Suspense",
    description:
      "Tensión sostenida: el género que te hace mirar el reloj y el borde de la butaca a la vez.",
  },
  {
    id: 27,
    slug: "terror",
    label: "Terror",
    description:
      "Miedo dosificado, desde el sobresalto hasta la incomodidad que se queda después de los créditos.",
  },
  {
    id: 37,
    slug: "western",
    label: "Western",
    description:
      "Fronteras, polvo y revólveres: el género que fundó buena parte de la gramática del cine.",
  },
];

/** Índices para resolver sin recorrer la lista en cada petición. */
const BY_SLUG = new Map(MOVIE_GENRES.map((genre) => [genre.slug, genre]));
const BY_ID = new Map(MOVIE_GENRES.map((genre) => [genre.id, genre]));

/** Género por su slug de URL, o `undefined` si el slug no es de la taxonomía. */
export function genreBySlug(slug: string): MovieGenre | undefined {
  return BY_SLUG.get(slug);
}

/** Género por su id de TMDB, o `undefined` si no está en la taxonomía. */
export function genreById(id: number): MovieGenre | undefined {
  return BY_ID.get(id);
}
