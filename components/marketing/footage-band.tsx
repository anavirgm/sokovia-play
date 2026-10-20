"use client";

import { useEffect, useRef } from "react";

/** Atribución obligatoria de CC BY: va pegada al metraje, no escondida. */
const FOOTAGE_CREDIT =
  "«DGB (large feed reels) - Cinema projector» de La Fonderie, CC BY 3.0, vía Wikimedia Commons.";

/**
 * Banda de metraje: el oficio del cine.
 *
 * Cierra el tramo del reproductor enseñando de dónde viene la película. El
 * fotograma es un plano real de un proyectorista cargando bobinas en el cine
 * Nova de Bruselas, en bucle silencioso: es decoración, así que se anuncia como
 * tal y con "reducir movimiento" se queda en su póster en lugar de reproducirse.
 */
export function FootageBand() {
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const element = video.current;

    if (!element) return undefined;

    const query = window.matchMedia("(prefers-reduced-motion: reduce)");

    const apply = () => {
      if (query.matches) element.pause();
      else void element.play().catch(() => undefined);
    };

    apply();
    query.addEventListener("change", apply);

    return () => {
      query.removeEventListener("change", apply);
    };
  }, []);

  return (
    <section
      aria-labelledby="metraje-titulo"
      className="relative isolate flex min-h-[62svh] flex-col justify-end px-4 pt-28 pb-10 sm:px-6 sm:pb-14"
    >
      <video
        ref={video}
        className="absolute inset-0 size-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/proyector-poster.jpg"
        width={1280}
        height={720}
        aria-hidden="true"
      >
        <source src="/proyector.webm" type="video/webm" />
      </video>

      {/* Velo: el metraje queda como atmósfera y el texto se lee siempre. Lleva
          color de fondo además del degradado para que la banda no cuente como
          un tramo vacío. */}
      <div aria-hidden="true" className="absolute inset-0 bg-background/70 scrim-band" />

      <div className="relative z-10 mx-auto w-full max-w-[80rem]">
        <h2
          id="metraje-titulo"
          className="reveal text-[2rem] leading-tight font-semibold tracking-[-0.025em] text-foreground"
        >
          Del proyector a tu pantalla.
        </h2>

        <p className="reveal mt-4 max-w-[62ch] text-base leading-relaxed text-muted [animation-delay:60ms]">
          Un proyectorista cargando bobinas en el cine Nova de Bruselas. Es el mismo oficio que
          SokoviaPlay mete en una ficha: encontrar la copia, comprobar que responde y no perder el
          minuto.
        </p>

        <p className="reveal mt-6 text-sm text-muted [animation-delay:120ms]">
          Metraje: {FOOTAGE_CREDIT}
        </p>
      </div>
    </section>
  );
}
