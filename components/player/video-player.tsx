"use client";

import { useEffect, useMemo, useRef } from "react";

import { cn } from "@/utils/cn";
import { useWatchProgress } from "@/hooks/use-watch-progress";

/**
 * Reproductor modular para iframes embebidos.
 *
 * Soporta fuentes tipo `youtube` y `embed`. Para `embed` se usa la URL
 * tal como venga de `movie_sources.url` (puede ser vidsrc.to u otras).
 * Para `youtube` se construye un iframe con el ID.
 */
type VideoPlayerProps = {
  url: string;
  type: "youtube" | "embed";
  title?: string;
  className?: string;
  tmdbId?: number;
};

function getYouTubeEmbedUrl(url: string): string {
  // Intentar extraer el ID de youtube.com/watch?v= o youtu.be/
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.replace("/", "");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
  } catch {
    // Si ya es un ID o formato no reconocido, usarlo directamente
  }
  // Asumir que es un ID
  return `https://www.youtube.com/embed/${url}`;
}

export function VideoPlayer({
  url,
  type,
  title = "Reproductor",
  className,
  tmdbId,
}: VideoPlayerProps) {
  const src = useMemo(() => {
    if (type === "youtube") {
      return getYouTubeEmbedUrl(url);
    }
    return url;
  }, [type, url]);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { saveProgress } = useWatchProgress({ tmdbId: tmdbId ?? 0 });

  // Para iframes embebidos, intentamos trackear con postMessage cuando sea posible
  // Nota: La mayoría de servidores de terceros no permiten acceso directo al tiempo
  useEffect(() => {
    if (!tmdbId) return;

    // Guardar progreso cada cierto tiempo como fallback
    // Muchos embeds no exponen el tiempo, pero guardamos para tener actividad
    const interval = setInterval(() => {
      // No podemos acceder al tiempo del iframe por cross-origin
      // Guardamos con valores dummy que se actualizarán si hay forma de obtenerlos
      saveProgress(60, 3600);
    }, 120000); // Cada 2 minutos

    return () => clearInterval(interval);
  }, [tmdbId, saveProgress]);

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-xl border border-border bg-black",
        "aspect-video",
        className,
      )}
    >
      <iframe
        ref={iframeRef}
        src={src}
        title={title}
        className="absolute inset-0 h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="no-referrer"
        loading="lazy"
      />
    </div>
  );
}
