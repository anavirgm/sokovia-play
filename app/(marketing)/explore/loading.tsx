import { BrowseResultsFallback, GenreNavSkeleton, PageHeaderSkeleton } from "@/components/catalog";
import { Container } from "@/components/layout/container";

/**
 * Carga de Explorar.
 *
 * Replica la estructura de la página —cabecera, filtros y cuadrícula— para que
 * la llegada del contenido no mueva nada. Los filtros se reservan porque en
 * esta ruta son estáticos y aparecen con la cáscara; los resultados, que son la
 * parte lenta, llegan detrás del `Suspense` de la propia página.
 */
export default function Loading() {
  return (
    <main className="flex flex-1 flex-col py-10 sm:py-14">
      <Container aria-busy="true" className="flex flex-col gap-8 sm:gap-10">
        <PageHeaderSkeleton />
        <GenreNavSkeleton />
        <BrowseResultsFallback />
      </Container>
    </main>
  );
}
