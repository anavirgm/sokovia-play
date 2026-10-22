import Link from "next/link";
import { CirclePlay, Play, Star } from "lucide-react";

import { buttonVariants } from "@/components/ui";
import type { HeroContent } from "@/features/catalog/hero";
import { tmdbImageUrl } from "@/lib/tmdb/image";
import { cn } from "@/utils/cn";

/**
 * Portada: la película destacada del catálogo, a tamaño de cartel.
 *
 * Es una tarjeta, no una banda a sangre: conserva el marco redondeado de la
 * marca y deja respirar el fondo por los cuatro lados. La fotografía de TMDB
 * (el `backdrop`, apaisado y en 1280 px porque en móvil se recorta en vertical)
 * llena la tarjeta entera; encima, abajo a la izquierda, van el titular, la
 * línea de metadatos, la sinopsis y las dos acciones.
 *
 * La legibilidad no se confía a la fotografía: `scrim-hero` oscurece de abajo
 * arriba lo necesario para que el texto rinda AA incluso sobre el fotograma más
 * claro que traiga TMDB (9,9:1 sobre blanco puro en el peor punto, medido). El
 * velo lateral solo entra en pantallas anchas y solo compone, ya no sostiene
 * contraste. El texto va a opacidad plena a propósito: sobre una imagen, bajarle
 * opacidad resta legibilidad en lugar de suavizarla.
 *
 * La entrada es escalonada (titular, metadatos, sinopsis, acciones) y la
 * fotografía respira con el bucle lento del sistema. La imagen no se anima al
 * entrar: es el elemento que pinta primero la pantalla.
 */
export function Hero({ content }: { content: HeroContent }) {
  const backdrop = tmdbImageUrl(content.backdropPath, "w1280");
  const trailer = content.trailerKey
    ? `https://www.youtube.com/watch?v=${content.trailerKey}`
    : null;

  return (
    <section
      id="inicio"
      aria-labelledby="portada-titulo"
      className="scroll-mt-16 px-4 pt-6 sm:px-6"
    >
      <div className="relative isolate flex min-h-[62svh] flex-col justify-end overflow-hidden rounded-xl sm:min-h-[68svh] lg:min-h-[76svh]">
        {backdrop ? (
          <img
            src={backdrop}
            alt=""
            width={1280}
            height={720}
            fetchPriority="high"
            decoding="async"
            className="drift absolute inset-0 size-full object-cover"
          />
        ) : null}

        <div aria-hidden="true" className="absolute inset-0 scrim-hero" />
        <div aria-hidden="true" className="absolute inset-0 hidden scrim-hero-left lg:block" />

        <div className="relative z-10 flex w-full flex-col items-start gap-4 p-6 sm:gap-5 sm:p-10 lg:max-w-[62%] lg:p-14">
          <h1
            id="portada-titulo"
            className="animate-enter text-[clamp(2rem,7vw,4.5rem)] leading-[0.95] font-semibold tracking-[-0.03em] text-balance [animation-delay:80ms]"
          >
            {content.title}
          </h1>

          <p className="animate-enter flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-foreground [animation-delay:160ms] sm:text-base">
            {content.year ? <span>{content.year}</span> : null}

            {/* Icono + cifra como una sola imagen accesible: se lee "nota media
                8,4 sobre 10" en vez de un número suelto que no dice de qué. */}
            <span
              role="img"
              aria-label={`Nota media: ${content.rating.toFixed(1)} sobre 10`}
              className="inline-flex items-center gap-1.5"
            >
              <Star aria-hidden="true" className="size-4 text-brand-soft" />
              <span aria-hidden="true">{content.rating.toFixed(1)}</span>
            </span>

            {content.genres.length > 0 ? <span>{content.genres.join(", ")}</span> : null}
          </p>

          <p className="animate-enter line-clamp-2 max-w-[54ch] text-base leading-relaxed text-pretty text-foreground [animation-delay:240ms] sm:text-lg">
            {content.overview}
          </p>

          <div className="animate-enter flex flex-wrap items-center gap-3 pt-1 [animation-delay:320ms]">
            <Link
              href={`/movies/${content.id}`}
              className={cn(buttonVariants({ size: "lg" }), "h-13 text-base sm:text-lg")}
            >
              <Play aria-hidden="true" />
              Ver película
            </Link>

            {trailer ? (
              <a
                href={trailer}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-13 border border-white/25 bg-surface/80 px-7 text-base hover:bg-surface-hover/90 sm:text-lg",
                )}
              >
                <CirclePlay aria-hidden="true" />
                Ver tráiler
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
