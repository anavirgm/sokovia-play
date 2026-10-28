import type { PlayerSource } from "@/components/player";

export function getDefaultMovieSources(tmdbId: number): PlayerSource[] {
  return [
    {
      id: "vidsrc",
      name: "Vidsrc",
      type: "embed",
      url: `https://vidsrc.to/embed/movie/${tmdbId}`,
      quality: "auto",
      sort_order: 10,
    },
    {
      id: "2embed",
      name: "2Embed",
      type: "embed",
      url: `https://www.2embed.cc/embed/${tmdbId}`,
      quality: "auto",
      sort_order: 30,
    },
  ];
}
