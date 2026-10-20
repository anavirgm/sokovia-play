/**
 * Reparto de las imágenes del bloque de marketing del reproductor.
 *
 * `landing-preview.ts` trae los 16 títulos reales de TMDB; aquí solo se decide
 * qué arte cumple cada papel. Se resuelve por id (no por posición) para que
 * reordenar la vista previa no cambie la composición de la sección.
 */
import { PREVIEW_TITLES, type PreviewTitle } from "@/features/catalog/data/landing-preview";

function pick(tmdbId: number): PreviewTitle {
  const title = PREVIEW_TITLES.find((item) => item.tmdbId === tmdbId);

  if (!title) {
    throw new Error(`landing-roles: el título ${tmdbId} no está en PREVIEW_TITLES`);
  }

  return title;
}

/** Fotograma cuadrado de cada fuente del reproductor (TMDB, YouTube, VidSrc). */
export const LANDING_SOURCES: readonly [PreviewTitle, PreviewTitle, PreviewTitle] = [
  pick(1236045),
  pick(1148365),
  pick(1423191),
];
