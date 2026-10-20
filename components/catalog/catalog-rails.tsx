import { Suspense } from "react";

import { MovieCard } from "@/components/catalog/movie-card";
import { MovieSlider } from "@/components/catalog/movie-slider";
import { Container } from "@/components/layout/container";
import { Skeleton } from "@/components/ui";
import { getCatalogRails } from "@/features/catalog/rails";

/**
 * Filas del catálogo de la portada.
 *
 * El `section` con el ancla `#catalogo` vive aquí, fuera del contenido que trae
 * los datos, y no dentro de él: así el destino de la navegación —cabecera, pie y
 * el propio hero— existe aunque el catálogo tarde, falle o no haya títulos que
 * enseñar. Si TMDB no devuelve nada, no queda un hueco: queda la sección vacía,
 * sin encabezado ni marco.
 *
 * Por qué el componente trae sus propios datos en vez de recibirlos como props:
 * un `await` en la página bloquearía el envío del HTML entero, hero incluido, y
 * el hero es el elemento LCP. Pintado el hero, el catálogo se resuelve después,
 * dentro de su propio límite, y la portada deja de esperar a doce consultas.
 */
export function CatalogRails() {
  return (
    <section id="catalogo" aria-label="Catálogo" className="scroll-mt-16 py-16 sm:py-20">
      <Container className="flex flex-col gap-10 sm:gap-12">
        <Suspense fallback={<CatalogRailsFallback />}>
          <CatalogRailsContent />
        </Suspense>
      </Container>
    </section>
  );
}

/** Filas ya resueltas, en el orden que decidió la capa de datos. */
async function CatalogRailsContent() {
  const rails = await getCatalogRails();

  return rails.map((rail) => (
    <MovieSlider key={rail.key} heading={rail.heading}>
      {rail.movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </MovieSlider>
  ));
}

/**
 * Respaldo de carga: la geometría de las filas, sin contenido que leer.
 *
 * Replica el ancho de las tarjetas de `MovieSlider`; el esqueleto definitivo,
 * con su shimmer y su anuncio a lectores de pantalla, es del #15.
 */
function CatalogRailsFallback() {
  return (
    <div aria-busy="true" className="flex flex-col gap-10 sm:gap-12">
      {Array.from({ length: FALLBACK_RAILS }, (_, row) => (
        <div key={row} className="flex flex-col gap-4">
          <Skeleton className="h-7 w-40" />
          <ul className="flex gap-4">
            {Array.from({ length: FALLBACK_CARDS }, (_, card) => (
              <li key={card} className="w-36 shrink-0 sm:w-44 lg:w-48">
                <Skeleton className="aspect-[2/3] w-full" />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/** Filas que muestra el respaldo: la parte que cabe en la primera pantalla. */
const FALLBACK_RAILS = 3;

/** Tarjetas por fila en el respaldo: suficiente para llenar el ancho visible. */
const FALLBACK_CARDS = 8;
