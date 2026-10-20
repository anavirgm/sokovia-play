"use client";

import { useEffect } from "react";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Button, Notice, buttonVariants } from "@/components/ui";
import { cn } from "@/utils/cn";

/**
 * Frontera de error de todas las rutas bajo el marco raíz.
 *
 * Existe para que un fallo inesperado no se vea como una pantalla en blanco:
 * el sitio conserva su cabecera y su pie, y dentro hay un estado con explicación
 * y salidas. El mensaje del error no se enseña al visitante —en producción
 * además viene genérico—; lo que se muestra es qué hacer, no qué falló.
 *
 * `retry` vuelve a renderizar el segmento en el servidor, que es la vía real de
 * recuperación: si el fallo fue de red o de TMDB, el reintento trae la página
 * entera. Si el fallo persiste, el estado se vuelve a pintar sin romper nada.
 */
export default function RouteError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    // El registro va al navegador: en producción el mensaje no viaja en el
    // HTML, pero la consola es donde se ve el error completo al depurar.
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col py-10 sm:py-14">
      <Container>
        <div role="alert">
          <Notice
            icon={<TriangleAlert className="size-6" />}
            title="No pudimos cargar esta página"
            description="El contenido no pudo prepararse. Casi siempre es un fallo temporal: reintenta; si vuelve a fallar, vuelve al catálogo y prueba otro camino."
          >
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button onClick={retry}>Reintentar</Button>
              <Link href="/" className={cn(buttonVariants({ variant: "secondary" }))}>
                Volver al catálogo
              </Link>
            </div>
          </Notice>
        </div>
      </Container>
    </main>
  );
}
