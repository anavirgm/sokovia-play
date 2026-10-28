import { Suspense } from "react";

import { CatalogRails, Hero } from "@/components/catalog";
import { ContinueWatchingRail } from "@/components/catalog/continue-watching-rail";
import { getHeroContent } from "@/features/catalog/hero";

/**
 * Portada.
 *
 * Es un catálogo, no un folleto: la portada enseña la película que ahora mismo
 * destaca en el catálogo (dato real de TMDB, cacheado) y, debajo, las filas de
 * títulos con las que se sigue explorando.
 *
 * El hero no espera al catálogo: es el elemento LCP de la página, y las doce
 * consultas que alimentan las filas se resuelven después, dentro de su propio
 * límite de `Suspense`. Por eso la página solo espera al destacado.
 *
 * Si no hay destacado (TMDB no responde), no deja un hueco: la portada empieza
 * directamente en el catálogo.
 *
 * La cabecera y el pie los pone el marco raíz: son los mismos de todo el sitio.
 */
export default async function HomePage() {
  const hero = await getHeroContent();

  return (
    <main className="flex flex-1 flex-col">
      {hero ? <Hero content={hero} /> : null}
      <Suspense fallback={null}>
        <ContinueWatchingRail />
      </Suspense>
      <CatalogRails />
    </main>
  );
}
