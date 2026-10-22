"use client";

import { useMemo } from "react";

import { cn } from "@/utils/cn";

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

export function VideoPlayer({ url, type, title = "Reproductor", className }: VideoPlayerProps) {
  const src = useMemo(() => {
    if (type === "youtube") {
      return getYouTubeEmbedUrl(url);
    }
    return url;
  }, [type, url]);

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-xl border border-border bg-black",
        "aspect-video",
        className,
      )}
    >
      <iframe
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
