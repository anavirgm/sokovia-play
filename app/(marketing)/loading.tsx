import { CatalogRailsFallback, HeroSkeleton } from "@/components/catalog";
import { Container } from "@/components/layout/container";

/**
 * Carga de la portada.
 *
 * La portada es la página que más espera —el destacado de TMDB y las filas del
 * catálogo—, así que es la que más se ve a medio camino. El esqueleto replica
 * su estructura completa: la tarjeta del destacado a su altura exacta y, debajo,
 * la sección del catálogo con sus filas. El ancla `#catalogo` ya existe durante
 * la carga, para que un enlace a la portada no apunte al vacío mientras llega.
 */
export default function Loading() {
  return (
    <main className="flex flex-1 flex-col">
      <HeroSkeleton />

      <section id="catalogo" aria-label="Catálogo" className="scroll-mt-16 py-16 sm:py-20">
        <Container className="flex flex-col gap-10 sm:gap-12">
          <CatalogRailsFallback />
        </Container>
      </section>
    </main>
  );
}
