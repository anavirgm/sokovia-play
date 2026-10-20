"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import { PROJECT_URL } from "@/constants/landing";
import { LANDING_SOURCES } from "@/features/catalog/data/landing-roles";
import { tmdbImageUrl } from "@/lib/tmdb/image";
import { cn } from "@/utils/cn";

/** Las tres fuentes del producto, en el orden en que entran en una ficha. */
const SOURCES = [
  {
    label: "TMDB",
    title: "El catálogo",
    body: "Título, sinopsis, póster, estreno y nota llegan de TMDB. Los géneros se normalizan en su propia tabla y se cruzan con los títulos.",
  },
  {
    label: "YouTube",
    title: "Los tráilers",
    body: "El tráiler oficial entra como una fuente más de la ficha, con su tipo y su orden, para incrustarlo sin salir de SokoviaPlay.",
  },
  {
    label: "VidSrc",
    title: "La reproducción",
    body: "Cada título guarda sus reproductores con su calidad y su prioridad. Si una fuente falla, se cambia a la siguiente sin perder el minuto.",
  },
] as const;

const INDICES = [0, 1, 2] as const;

/**
 * Reproductor: una placa cuadrada a la izquierda y, a la derecha, las tres
 * fuentes como pestañas reales.
 *
 * Es el único punto interactivo de la portada que no es un enlace: al elegir
 * una fuente cambian el fotograma y el texto, que es exactamente lo que hace la
 * ficha de una película.
 */
export function SourceShowcase() {
  const [active, setActive] = useState<(typeof INDICES)[number]>(0);
  const current = SOURCES[active];

  return (
    <section
      id="reproductor"
      aria-labelledby="reproductor-titulo"
      className="scroll-mt-16 bg-surface/40 px-4 py-20 sm:px-6 sm:py-28"
    >
      <div className="mx-auto grid w-full max-w-[80rem] items-center gap-12 lg:min-h-[78svh] lg:grid-cols-2 lg:gap-20">
        {/* Placa cuadrada: el fotograma con el anillo y el triángulo encima. */}
        <div className="reveal relative aspect-square overflow-hidden rounded-xl bg-surface">
          {INDICES.map((index) => {
            const image = tmdbImageUrl(LANDING_SOURCES[index].backdropPath, "w1280");

            return image ? (
              <img
                key={LANDING_SOURCES[index].tmdbId}
                src={image}
                alt={`Fotograma de ${LANDING_SOURCES[index].title}`}
                width={1280}
                height={720}
                loading="lazy"
                className={cn(
                  "absolute inset-0 size-full object-cover transition-opacity duration-500 ease-out-quart",
                  index === active ? "opacity-100" : "opacity-0",
                )}
              />
            ) : null;
          })}

          <span aria-hidden="true" className="absolute inset-0 bg-background/30" />

          <span
            aria-hidden="true"
            className="absolute inset-0 grid place-items-center text-foreground"
          >
            <svg viewBox="0 0 100 100" className="w-[52%]" fill="none" aria-hidden="true">
              <circle
                cx="50"
                cy="50"
                r="46"
                stroke="currentColor"
                strokeWidth="1.1"
                opacity="0.8"
              />
              <path d="M41 33.5 70 50 41 66.5Z" fill="currentColor" />
            </svg>
          </span>
        </div>

        <div className="flex min-w-0 flex-col">
          <div
            role="tablist"
            aria-label="Fuentes del reproductor"
            className="reveal flex flex-wrap gap-x-8 gap-y-2"
          >
            {INDICES.map((index) => (
              <button
                key={SOURCES[index].label}
                type="button"
                role="tab"
                id={`fuente-${index}`}
                aria-selected={index === active}
                aria-controls={`panel-${index}`}
                tabIndex={index === active ? 0 : -1}
                onClick={() => setActive(index)}
                className={cn(
                  "cursor-pointer border-b-2 pb-1 text-lg transition-colors duration-200 ease-out-quart",
                  index === active
                    ? "border-foreground font-medium text-foreground"
                    : "border-transparent text-muted hover:text-foreground",
                )}
              >
                {SOURCES[index].label}
              </button>
            ))}
          </div>

          <div
            id={`panel-${active}`}
            role="tabpanel"
            aria-labelledby={`fuente-${active}`}
            className="mt-8"
          >
            <h3 className="reveal text-[2rem] leading-tight font-semibold tracking-[-0.025em] text-foreground">
              {current.title}
            </h3>
            <p className="reveal mt-4 max-w-[36ch] text-base leading-relaxed text-muted [animation-delay:60ms]">
              {current.body}
            </p>
          </div>

          <div className="mt-auto grid gap-3 pt-12 sm:grid-cols-2">
            <Link
              href="#catalogo"
              className="reveal flex h-18 items-center justify-between gap-4 rounded-xl bg-foreground px-6 text-base font-medium text-background transition-colors duration-200 ease-out-quart hover:bg-foreground/85"
            >
              Explorar el catálogo
              <ArrowRight className="size-5" aria-hidden="true" />
            </Link>
            <Link
              href={PROJECT_URL}
              target="_blank"
              rel="noreferrer"
              className="reveal flex h-18 items-center justify-between gap-4 rounded-xl bg-surface px-6 text-base font-medium text-foreground transition-colors duration-200 ease-out-quart [animation-delay:80ms] hover:bg-surface-hover"
            >
              Ver el proyecto
              <ArrowUpRight className="size-5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
