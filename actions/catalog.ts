"use server";

import { genreBySlug } from "@/constants/genres";
import { getBrowsePage, type BrowseOutcome } from "@/features/catalog/browse";

/**
 * Página siguiente para la cuadrícula con scroll infinito.
 *
 * Es una acción de servidor y, por tanto, un endpoint público: cualquiera puede
 * invocarla con lo que quiera. Por eso no recibe ids de TMDB ni páginas ya
 * «limpias» —recibe el slug y el número tal cual, y aquí se valida— y jamás
 * devuelve un error lanzado: o trae tarjetas o trae un motivo que la cuadrícula
 * pinta dentro de la lista, sin tumbar el resto de la página.
 *
 * La acción no cachea por su cuenta: delega en `getDiscoverMovies`, que ya
 * declara `cacheLife("hours")` y su etiqueta. El resultado de cada página se
 * comparte entre visitantes igual que si se hubiera pedido al renderizar.
 */
export async function loadBrowsePage(
  genreSlug: string | null,
  page: number,
): Promise<BrowseOutcome> {
  const genre = genreSlug === null ? null : genreBySlug(genreSlug);

  if (genreSlug !== null && genre === undefined) {
    return { status: "error", message: "Ese género no existe en el catálogo." };
  }

  return getBrowsePage({ genreId: genre?.id ?? null, page });
}
