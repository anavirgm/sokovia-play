import { PageHeaderSkeleton } from "@/components/catalog";
import { Container } from "@/components/layout/container";
import { SearchExperienceFallback } from "@/components/search";

/**
 * Carga de la búsqueda.
 *
 * Reproduce la página con la forma que la propia ruta usa en su `Suspense`
 * —cabecera y respaldo de la experiencia completa—, para que hasta la consulta
 * (lenta, porque resuelve en el servidor) el visitante vea el campo y la cuadrícula
 * reservados en su sitio y no un hueco.
 */
export default function Loading() {
  return (
    <main className="flex flex-1 flex-col py-10 sm:py-14">
      <Container aria-busy="true" className="flex flex-col gap-8 sm:gap-10">
        <PageHeaderSkeleton />
        <SearchExperienceFallback />
      </Container>
    </main>
  );
}
