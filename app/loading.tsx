import { MovieCardSkeleton, PageHeaderSkeleton } from "@/components/catalog";
import { MovieGrid } from "@/components/catalog/movie-grid";
import { Container } from "@/components/layout/container";

/**
 * Carga genérica de toda ruta bajo el marco raíz.
 *
 * Es la red de seguridad del sitio: cualquier página sin su propio `loading.tsx`
 * —la de diseño, y las que vengan— cae aquí en vez de dejar la pantalla vacía.
 * Muestra la forma más común del sitio (cabecera de página y cuadrícula de
 * tarjetas), que es con lo que un fallo raro se ve coherente, no con un
 * marcador genérico.
 *
 * Las rutas del catálogo tienen su propia carga con su propia geometría; este
 * archivo solo actúa donde esas no llegan.
 */
export default function Loading() {
  return (
    <main className="flex flex-1 flex-col py-10 sm:py-14">
      <Container aria-busy="true" className="flex flex-col gap-8 sm:gap-10">
        <PageHeaderSkeleton />

        <MovieGrid>
          {Array.from({ length: 12 }, (_, card) => (
            <li key={card}>
              <MovieCardSkeleton />
            </li>
          ))}
        </MovieGrid>
      </Container>
    </main>
  );
}
