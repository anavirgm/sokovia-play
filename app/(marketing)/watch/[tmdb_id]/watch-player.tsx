"use client";

import { useState } from "react";

import { ServerSelector, VideoPlayer, type PlayerSource } from "@/components/player";

type WatchPlayerProps = {
  sources: PlayerSource[];
  title: string;
};

export function WatchPlayer({ sources, title }: WatchPlayerProps) {
  const [currentSource, setCurrentSource] = useState<PlayerSource | null>(() => {
    if (sources.length === 0) return null;
    return sources[0] ?? null;
  });

  if (!currentSource) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <VideoPlayer
        url={currentSource.url}
        type={currentSource.type}
        title={`Reproducir ${title}`}
      />
      <ServerSelector sources={sources} value={currentSource.id} onChange={setCurrentSource} />
    </div>
  );
}
