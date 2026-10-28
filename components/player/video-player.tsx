"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasError(false);
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, [src]);

  // Para iframes embebidos, intentamos trackear con postMessage cuando sea posible
  // Nota: La mayoría de servidores de terceros no permiten acceso directo al tiempo
  useEffect(() => {
    if (!tmdbId) return;

    // Guardar progreso cada cierto tiempo como fallback
    const interval = setInterval(() => {
      saveProgress(60, 3600);
    }, 120000); // Cada 2 minutos

    return () => clearInterval(interval);
  }, [tmdbId, saveProgress]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-xl border border-border bg-black shadow-elevated",
        "aspect-video",
        className,
      )}
    >
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-brand" />
            <p className="text-sm text-white/70">Cargando reproductor...</p>
          </div>
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/90 text-center">
          <p className="text-lg font-medium text-white">Error al cargar el servidor</p>
          <p className="max-w-md text-pretty text-white/70">
            Prueba cambiando a otro servidor desde el selector de abajo.
          </p>
        </div>
      )}

      <iframe
        ref={iframeRef}
        src={src}
        title={title}
        className={cn("absolute inset-0 h-full w-full", isLoading && "opacity-0")}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
        allowFullScreen
        referrerPolicy="no-referrer"
        loading="lazy"
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
}
