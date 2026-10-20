import { BrowseResultsFallback, GenreHeaderFallback, GenreNavSkeleton } from "@/components/catalog";
import { Container } from "@/components/layout/container";

/**
 * Carga de una página de género.
 *
 * Copia pieza por pieza el respaldo del `Suspense` interior de la página
 * —cabecera, filtros y resultados— con las mismas clases y separaciones. Así la
 * transición es invisible: lo que enseja el archivo de carga es exactamente lo
 * que enseña el propio segmento cuando la ruta llega al servidor, y solo cambian
 * las tarjetas de sitio de esqueleto a contenido.
 */
export default function Loading() {
  return (
    <main className="flex flex-1 flex-col py-10 sm:py-14">
      <Container aria-busy="true" className="flex flex-col gap-8 sm:gap-10">
        <GenreHeaderFallback />
        <GenreNavSkeleton />
        <BrowseResultsFallback />
      </Container>
    </main>
  );
}
