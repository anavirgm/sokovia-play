import { Suspense } from "react";

import { Skeleton } from "@/components/ui";
import { readSearchQuery, type RawSearchParams } from "@/features/catalog/search";

import { SearchInput } from "./search-input";
import { SearchResults, SearchResultsFallback } from "./search-results";

/**
 * Experiencia de búsqueda: campo y resultados.
 *
 * Este componente es quien espera a `searchParams`, y por eso vive dentro de un
 * `Suspense` de la página: la cáscara estática (título y descripción) se sirve
 * al instante mientras el resto se resuelve en la petición. Dentro, los
 * resultados tienen su propio límite: el campo se pinta en cuanto se conocen los
 * parámetros, sin esperar a TMDB, que es la parte lenta.
 *
 * La espera a los parámetros no hace ninguna petición de red, así que el
 * respaldo se ve un instante como mucho; existe para que ese instante no sea un
 * salto de layout.
 */
export async function SearchExperience({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const { text, page } = readSearchQuery(await searchParams);

  return (
    <div className="flex flex-col gap-8 sm:gap-10">
      <SearchInput initialQuery={text} />

      {/* Destino de `aria-controls` del campo: existe en todos los estados. */}
      <div id="search-results" className="flex flex-col">
        <Suspense fallback={<SearchResultsFallback />}>
          <SearchResults query={text} page={page} />
        </Suspense>
      </div>
    </div>
  );
}

/** Respaldo mientras se resuelven los parámetros de la URL. */
export function SearchExperienceFallback() {
  return (
    <div aria-busy="true" className="flex flex-col gap-8 sm:gap-10">
      <Skeleton className="h-14 w-full sm:h-16" />
      <SearchResultsFallback />
    </div>
  );
}
