import { Skeleton } from "@/components/ui";

/**
 * Esqueletos del catálogo: la geometría del contenido real, sin el contenido.
 *
 * Cada esqueleto replica una a una las medidas de la pieza que sustituye
 * (póster 2:3, título a dos líneas, botones de 52 px) para que cuando lleguen
 * los datos no se mueva nada: el cambio es de forma, no de posición. Todos
 * reservan su espacio con la misma retícula que el componente definitivo y se
 * ocultan a los lectores de pantalla; el estado lo anuncia quien los envuelve,
 * con `aria-busy`.
 */

/**
 * Tarjeta del catálogo mientras carga.
 *
 * Reserva lo mismo que `MovieCard`: póster 2:3, el bloque de dos líneas del
 * título (`min-h-10`) y la línea de metadatos. La segunda barra del título es
 * más corta que la primera porque así se lee «texto» y no «rectángulo»: la
 * forma importa para que el ojo reconozca el patrón antes de que llegue.
 */
export function MovieCardSkeleton() {
  return (
    <div className="flex flex-col gap-2.5">
      <Skeleton className="aspect-[2/3] w-full" />

      <div className="flex flex-col gap-1">
        <div className="flex min-h-10 flex-col gap-2">
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-3/5" />
        </div>

        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  );
}

/**
 * Tarjetas por fila del esqueleto: suficientes para llenar el ancho visible
 * del carril en escritorio, incluido el asomar de la tarjeta siguiente.
 */
const SLIDER_CARDS = 8;

/**
 * Fila del catálogo mientras carga: un encabezado y una tira de tarjetas.
 *
 * Mantiene el mismo ancho de tarjeta que `MovieSlider` (`w-36`/`w-44`/`w-48`) y
 * recorta la tira con `overflow-hidden`: la fila definitiva desborda dentro de
 * su propio carril, y el esqueleto tiene que desbordar igual, no empujar la
 * página hacia los lados mientras carga.
 */
export function SliderSkeleton() {
  return (
    <section aria-busy="true" className="flex flex-col gap-4">
      <Skeleton className="h-8 w-48" />

      <ul className="flex gap-4 overflow-hidden pb-4">
        {Array.from({ length: SLIDER_CARDS }, (_, card) => (
          <li key={card} className="w-36 shrink-0 sm:w-44 lg:w-48">
            <MovieCardSkeleton />
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * Portada mientras carga el destacado.
 *
 * Reproduce la tarjeta de `Hero` a su altura exacta (62/68/76 svh) y su bloque
 * de contenido abajo a la izquierda. El área de la fotografía queda quieta —un
 * campo de shimmer de esa magnitud distraería más de lo que tranquiliza— y el
 * pulso vive solo en las líneas de texto, que son las que cambian de tamaño
 * cuando entra el fotograma del día.
 */
export function HeroSkeleton() {
  return (
    <section aria-busy="true" className="px-4 pt-6 sm:px-6">
      <div className="flex min-h-[62svh] flex-col justify-end overflow-hidden rounded-xl bg-surface-hover/40 sm:min-h-[68svh] lg:min-h-[76svh]">
        <div className="flex w-full flex-col items-start gap-4 p-6 sm:gap-5 sm:p-10 lg:max-w-[62%] lg:p-14">
          <Skeleton className="h-8 w-3/4 max-w-2xl sm:h-12 lg:h-16" />
          <Skeleton className="h-4 w-64 max-w-full" />

          <div className="flex w-full max-w-[54ch] flex-col gap-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-2/3" />
          </div>

          <div className="flex gap-3 pt-1">
            <Skeleton className="h-13 w-36" />
            <Skeleton className="h-13 w-40" />
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Cabecera de página interior: antetítulo, titular y descripción.
 *
 * Es la cabecera que comparten Explorar y Buscar (y cualquier página futura
 * con la misma estructura), así que el esqueleto vive aquí y no en cada ruta.
 */
export function PageHeaderSkeleton() {
  return (
    <div aria-busy="true" className="flex flex-col gap-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-9 w-72 max-w-full sm:h-10" />

      {/* `h-5`: la descripción va en `text-base` (20 px por línea), así que el
          esqueleto reserva esa medida y no un pelín menos. */}
      <div className="flex max-w-2xl flex-col gap-2 pt-1">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-2/3" />
      </div>
    </div>
  );
}

/**
 * Filtros de género: una tira de píldoras del mismo alto que las reales
 * (`min-h-11`, el objetivo táctil de 44 px), con anchos variados para que se
 * lea «etiquetas» y no una escalera de bloques iguales.
 */
const CHIP_WIDTHS = [
  "w-20",
  "w-28",
  "w-24",
  "w-36",
  "w-24",
  "w-32",
  "w-28",
  "w-24",
  "w-20",
] as const;

export function GenreNavSkeleton() {
  return (
    <nav aria-busy="true" aria-label="Filtrar por género" className="flex flex-col gap-3">
      <ul className="flex flex-wrap gap-2">
        {CHIP_WIDTHS.map((width, chip) => (
          <li key={chip}>
            <Skeleton className={`h-11 rounded-full ${width}`} />
          </li>
        ))}
      </ul>
    </nav>
  );
}
