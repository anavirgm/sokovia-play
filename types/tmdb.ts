/**
 * Tipos de la API de TMDB (The Movie Database) — API v3.
 *
 * Solo se declaran las formas que consume VesperFlix (listados, detalles,
 * géneros, vídeos, créditos, imágenes y configuración). Son tipos de solo
 * lectura: describen exactamente la respuesta JSON de TMDB, sin añadir lógica.
 *
 * Convención: todos los identificadores llevan prefijo `Tmdb` para no
 * colisionar con los tipos de dominio de `types/database.types.ts`.
 *
 * Referencia: https://developer.themoviedb.org/reference/introduction
 */

/* ---------------------------------------------------------------------------
 * Genéricos de respuesta
 * ------------------------------------------------------------------------ */

/** Respuesta paginada estándar de TMDB (`page`, `results`, totales). */
export type TmdbPaginatedResponse<T> = {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
};

/** Rango de fechas de los endpoints `now_playing` / `upcoming` / `airing_today`. */
export type TmdbDateRange = {
  maximum: string;
  minimum: string;
};

/** Respuesta paginada que además incluye un `dates` (estrenos cercanos). */
export type TmdbDatedResponse<T> = TmdbPaginatedResponse<T> & {
  dates: TmdbDateRange;
};

/* ---------------------------------------------------------------------------
 * Géneros
 * ------------------------------------------------------------------------ */

/** Género tal y como lo devuelve TMDB. */
export type TmdbGenre = {
  id: number;
  name: string;
};

/** Respuesta de `/genre/movie/list`. */
export type TmdbGenreListResponse = {
  genres: TmdbGenre[];
};

/* ---------------------------------------------------------------------------
 * Películas — listados (popular / trending / discover / search)
 * ------------------------------------------------------------------------ */

/**
 * Película en un listado o resultado de búsqueda.
 *
 * En los listados TMDB no incluye los géneros completos, solo `genre_ids`.
 */
export type TmdbMovieListItem = {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  /** Formato `YYYY-MM-DD`; puede venir vacío si aún no hay fecha. */
  release_date: string;
  adult: boolean;
  /** IDs de género (ver `TmdbGenre`). */
  genre_ids: number[];
  original_language: string;
  popularity: number;
  video: boolean;
  vote_average: number;
  vote_count: number;
};

/** Elemento de `/trending/{media_type}/{window}`; `media_type` solo llega con `all`. */
export type TmdbTrendingItem = TmdbMovieListItem & {
  media_type?: TmdbMediaType;
};

/* ---------------------------------------------------------------------------
 * Películas — detalles (`/movie/{id}`)
 * ------------------------------------------------------------------------ */

/** Colección a la que pertenece una película (sagas). */
export type TmdbCollection = {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
};

/** Compañía productora. */
export type TmdbProductionCompany = {
  id: number;
  logo_path: string | null;
  name: string;
  origin_country: string;
};

/** País de producción. */
export type TmdbProductionCountry = {
  iso_3166_1: string;
  name: string;
};

/** Idioma hablado. */
export type TmdbSpokenLanguage = {
  english_name: string;
  iso_639_1: string;
  name: string;
};

/**
 * Detalles completos de una película, sin los bloques opcionales.
 *
 * Los bloques que solo llegan con `append_to_response` (vídeos, créditos,
 * imágenes, recomendaciones…) se añaden en `TmdbMovieDetails`.
 */
export type TmdbMovieDetailsBase = {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  tagline: string | null;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  adult: boolean;
  genres: TmdbGenre[];
  original_language: string;
  popularity: number;
  video: boolean;
  vote_average: number;
  vote_count: number;
  belongs_to_collection: TmdbCollection | null;
  budget: number;
  revenue: number;
  /** Minutos de duración; `null` si TMDB no lo tiene. */
  runtime: number | null;
  homepage: string | null;
  imdb_id: string | null;
  status: string;
  production_companies: TmdbProductionCompany[];
  production_countries: TmdbProductionCountry[];
  spoken_languages: TmdbSpokenLanguage[];
};

/**
 * Detalles de película con los bloques opcionales que se piden vía
 * `append_to_response` (p. ej. `?append_to_response=videos,credits`).
 *
 * Todos son opcionales porque su presencia depende de lo solicitado.
 */
export type TmdbMovieDetails = TmdbMovieDetailsBase & {
  videos?: TmdbVideosResponse;
  credits?: TmdbCredits;
  images?: TmdbImagesResponse;
  keywords?: TmdbKeywordsResponse;
  external_ids?: TmdbExternalIds;
  recommendations?: TmdbPaginatedResponse<TmdbMovieListItem>;
  similar?: TmdbPaginatedResponse<TmdbMovieListItem>;
};

/* ---------------------------------------------------------------------------
 * Vídeos (tráilers de YouTube, etc.)
 * ------------------------------------------------------------------------ */

/** Plataformas de vídeo que expone TMDB. */
export type TmdbVideoSite = "YouTube" | "Vimeo";

/** Tipos de vídeo de TMDB. */
export type TmdbVideoType =
  | "Trailer"
  | "Teaser"
  | "Clip"
  | "Featurette"
  | "Behind the Scenes"
  | "Bloopers"
  | "Opening Credits"
  | "Ending Credits"
  | "Recap"
  | "Other";

/**
 * Vídeo asociado a una película.
 *
 * Para YouTube, la URL reproducible es `https://www.youtube.com/watch?v={key}`.
 */
export type TmdbVideo = {
  id: string;
  name: string;
  /** Identificador del vídeo dentro de `site` (p. ej. el `v` de YouTube). */
  key: string;
  site: TmdbVideoSite;
  size: number;
  type: TmdbVideoType;
  official: boolean;
  /** Formato ISO-8601 (`YYYY-MM-DDTHH:MM:SS.sssZ`). */
  published_at: string;
  /** Código ISO-639-1. */
  iso_639_1: string;
  /** Código ISO-3166-1. */
  iso_3166_1: string;
};

/** Respuesta de `/movie/{id}/videos`. */
export type TmdbVideosResponse = {
  id: number;
  results: TmdbVideo[];
};

/* ---------------------------------------------------------------------------
 * Créditos (reparto y equipo)
 * ------------------------------------------------------------------------ */

/** Miembro del reparto. */
export type TmdbCastMember = {
  id: number;
  cast_id?: number;
  credit_id: string;
  name: string;
  original_name: string;
  character: string;
  order: number;
  gender: number;
  popularity: number;
  profile_path: string | null;
  known_for_department?: string;
  adult?: boolean;
};

/** Miembro del equipo técnico. */
export type TmdbCrewMember = {
  id: number;
  credit_id: string;
  name: string;
  original_name: string;
  department: string;
  job: string;
  gender: number;
  popularity: number;
  profile_path: string | null;
  known_for_department?: string;
  adult?: boolean;
};

/** Respuesta de `/movie/{id}/credits` (o vía `append_to_response=credits`). */
export type TmdbCredits = {
  id: number;
  cast: TmdbCastMember[];
  crew: TmdbCrewMember[];
};

/* ---------------------------------------------------------------------------
 * Palabras clave e IDs externos
 * ------------------------------------------------------------------------ */

/** Palabra clave (tag) de TMDB. */
export type TmdbKeyword = {
  id: number;
  name: string;
};

/** Respuesta de `/movie/{id}/keywords`. */
export type TmdbKeywordsResponse = {
  id: number;
  keywords: TmdbKeyword[];
};

/** Respuesta de `/movie/{id}/external_ids`. */
export type TmdbExternalIds = {
  id: number;
  imdb_id: string | null;
  facebook_id: string | null;
  instagram_id: string | null;
  twitter_id: string | null;
};

/* ---------------------------------------------------------------------------
 * Imágenes y configuración
 * ------------------------------------------------------------------------ */

/** Tamaños válidos de póster. */
export type TmdbPosterSize = "w92" | "w154" | "w185" | "w342" | "w500" | "w780" | "original";

/** Tamaños válidos de backdrop. */
export type TmdbBackdropSize = "w300" | "w780" | "w1280" | "original";

/** Tamaños válidos de logo. */
export type TmdbLogosSize = "w45" | "w92" | "w154" | "w185" | "w300" | "w500" | "original";

/** Tamaños válidos de foto de perfil. */
export type TmdbProfileSize = "w45" | "w185" | "h632" | "original";

/** Tamaños válidos de still (fotograma). */
export type TmdbStillSize = "w92" | "w185" | "w300" | "original";

/** Unión de todos los tamaños de imagen soportados por TMDB. */
export type TmdbImageSize =
  TmdbPosterSize | TmdbBackdropSize | TmdbLogosSize | TmdbProfileSize | TmdbStillSize;

/** Imagen individual dentro de `/movie/{id}/images`. */
export type TmdbImage = {
  file_path: string;
  width: number;
  height: number;
  aspect_ratio: number;
  vote_average: number;
  vote_count: number;
  iso_639_1: string | null;
};

/** Respuesta de `/movie/{id}/images`. */
export type TmdbImagesResponse = {
  id: number;
  backdrops: TmdbImage[];
  logos: TmdbImage[];
  posters: TmdbImage[];
};

/** Bloque `images` de `/configuration`, base para construir URLs de imagen. */
export type TmdbConfigurationImages = {
  base_url: string;
  secure_base_url: string;
  backdrop_sizes: TmdbBackdropSize[];
  logo_sizes: TmdbLogosSize[];
  poster_sizes: TmdbPosterSize[];
  profile_sizes: TmdbProfileSize[];
  still_sizes: TmdbStillSize[];
};

/** Respuesta de `/configuration`. */
export type TmdbConfiguration = {
  images: TmdbConfigurationImages;
  change_keys: string[];
};

/* ---------------------------------------------------------------------------
 * Parámetros y enums de listados / descubrimiento
 * ------------------------------------------------------------------------ */

/** Tipos de medio de TMDB. */
export type TmdbMediaType = "movie" | "tv" | "person";

/** Media para `/trending/{media_type}/{window}`. */
export type TmdbTrendingMediaType = "all" | TmdbMediaType;

/** Ventana temporal de tendencias. */
export type TmdbTimeWindow = "day" | "week";

/** Listas de películas predefinidas de TMDB. */
export type TmdbMovieListType = "popular" | "top_rated" | "upcoming" | "now_playing";

/** Criterios de ordenación de `/discover/movie` (subconjunto usado por la app). */
export type TmdbDiscoverSortBy =
  | "popularity.desc"
  | "popularity.asc"
  | "vote_average.desc"
  | "vote_average.asc"
  | "vote_count.desc"
  | "vote_count.asc"
  | "primary_release_date.desc"
  | "primary_release_date.asc"
  | "revenue.desc"
  | "revenue.asc"
  | "original_title.desc"
  | "original_title.asc";
