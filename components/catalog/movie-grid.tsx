import type { ComponentProps } from "react";

import { cn } from "@/utils/cn";

/**
 * Cuadrícula de tarjetas del catálogo.
 *
 * La geometría vive aquí y no en cada pantalla: la portada, la búsqueda y la
 * exploración por género deben romper en las mismas columnas, y el esqueleto de
 * carga debe medir exactamente lo mismo que el contenido que sustituye. Los
 * hijos son `<li>`; el espaciado lo pone el `gap`, no la tarjeta.
 */
const MOVIE_GRID_CLASS =
  "grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";

export function MovieGrid({ className, ...props }: ComponentProps<"ul">) {
  return <ul data-slot="movie-grid" className={cn(MOVIE_GRID_CLASS, className)} {...props} />;
}
