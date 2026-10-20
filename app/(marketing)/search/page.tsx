import type { Metadata } from "next";
import { Suspense } from "react";

import { Container } from "@/components/layout/container";
import { SearchExperience, SearchExperienceFallback } from "@/components/search";

/**
 * Búsqueda del catálogo.
 *
 * La página solo declara el marco —título, descripción y ancho—; el campo y los
 * resultados dependen de `searchParams` y llegan detrás de un `Suspense`. Esa
 * frontera es lo que permite servir la cáscara con HTML estático y resolver la
 * consulta en la petición, sin que la URL dinámica convierta la ruta entera en
 * una página sin primer pintado.
 *
 * `metadata` es estática a propósito: el título del documento no persigue a cada
 * tecleo. Lo que se está buscando se lee en la página, no en la pestaña.
 */
export const metadata: Metadata = {
  title: "Buscar",
  description: "Busca películas por título en el catálogo de SokoviaPlay.",
};

export default function SearchPage({ searchParams }: PageProps<"/search">) {
  return (
    <main className="flex flex-1 flex-col py-10 sm:py-14">
      <Container className="flex flex-col gap-8 sm:gap-10">
        <header className="flex flex-col gap-2">
          <p className="text-sm font-medium tracking-wide text-brand-soft uppercase">Catálogo</p>
          <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">Buscar</h1>
          <p className="max-w-2xl text-pretty text-muted">
            Encuentra una película por su título. Los resultados aparecen mientras escribes; si
            prefieres, también puedes recorrer el catálogo por género desde la portada.
          </p>
        </header>

        <Suspense fallback={<SearchExperienceFallback />}>
          <SearchExperience searchParams={searchParams} />
        </Suspense>
      </Container>
    </main>
  );
}
