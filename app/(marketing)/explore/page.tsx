import type { Metadata } from "next";
import { Suspense } from "react";

import { BrowseResults, BrowseResultsFallback, GenreNav } from "@/components/catalog";
import { Container } from "@/components/layout/container";
import { getBrowsePage } from "@/features/catalog/browse";

/**
 * Explorar el catálogo completo.
 *
 * Es el índice de géneros y, a la vez, la lista de todo lo que hay: los filtros
 * llevan a la página del género y «Todas» devuelve aquí. No recibe parámetros de
 * URL, así que la ruta se prerenderiza entera y el filtro no reescribe la misma
 * página con estado distinto.
 *
 * La primera página se resuelve en el servidor: el HTML sale con tarjetas y el
 * scroll infinito solo añade lo que falta. El `Suspense` mantiene la cabecera y
 * los filtros en la cáscara estática aunque TMDB tarde.
 */
export const metadata: Metadata = {
  title: "Explorar",
  description: "Recorre el catálogo de VesperFlix por género y descubre qué ver a continuación.",
};

export default function ExplorePage() {
  return (
    <main className="flex flex-1 flex-col py-10 sm:py-14">
      <Container className="flex flex-col gap-8 sm:gap-10">
        <header className="flex flex-col gap-2">
          <p className="text-sm font-medium tracking-wide text-brand-soft uppercase">Catálogo</p>
          <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Explorar
          </h1>
          <p className="max-w-2xl text-pretty text-muted">
            Todo el catálogo, ordenado por lo que más se está viendo. Filtra por género para acotar
            la lista; las películas se cargan a medida que bajas.
          </p>
        </header>

        <GenreNav />

        <Suspense fallback={<BrowseResultsFallback />}>
          <ExploreResults />
        </Suspense>
      </Container>
    </main>
  );
}

/**
 * Primera página del catálogo completo.
 *
 * Vive separada de la página para que el `Suspense` tenga algo que esperar sin
 * arrastrar la cabecera. No es un componente exportado: solo lo usa esta ruta.
 */
async function ExploreResults() {
  const outcome = await getBrowsePage({ genreId: null, page: 1 });

  return <BrowseResults outcome={outcome} genreSlug={null} />;
}
