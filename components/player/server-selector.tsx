"use client";

import { useEffect, useState } from "react";

import { getLastSourceId, setLastSourceId } from "@/features/player/sources";
import { cn } from "@/utils/cn";

export type PlayerSource = {
  id: string;
  name: string;
  type: "youtube" | "embed";
  url: string;
  quality?: string;
  sort_order?: number;
};

type ServerSelectorProps = {
  sources: PlayerSource[];
  value?: string;
  onChange: (source: PlayerSource) => void;
  className?: string;
};

/**
 * Selector dinámico de servidores.
 * Lista sources activos ordenados por sort_order (ya vienen ordenados desde el servidor).
 * Persiste la última elección en localStorage.
 */
export function ServerSelector({ sources, value, onChange, className }: ServerSelectorProps) {
  const [selectedId, setSelectedId] = useState<string | undefined>(value);

  // Al montar, si no hay valor preseleccionado, usar el último guardado o el primero
  useEffect(() => {
    if (selectedId) return;
    if (sources.length === 0) return;
    const last = getLastSourceId();
    const found = last ? sources.find((s) => s.id === last) : null;
    const initial = found ?? sources[0];
    if (!initial) return;
    setSelectedId(initial.id);
    onChange(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sources]);

  // Sincronizar con value externo
  useEffect(() => {
    if (value && value !== selectedId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedId(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (sources.length === 0) {
    return null;
  }

  function handleChange(id: string) {
    const source = sources.find((s) => s.id === id);
    if (!source) return;
    setSelectedId(id);
    setLastSourceId(id);
    onChange(source);
  }

  return (
    <div
      className={cn("flex flex-wrap items-center gap-2", className)}
      role="group"
      aria-label="Seleccionar servidor"
    >
      <span className="text-sm text-muted">Servidor:</span>
      {sources.map((source) => {
        const isActive = selectedId === source.id;
        return (
          <button
            key={source.id}
            type="button"
            onClick={() => handleChange(source.id)}
            aria-pressed={isActive}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-brand-strong text-white"
                : "border border-border bg-surface text-muted hover:bg-surface-hover hover:text-foreground",
            )}
          >
            {source.name}
            {source.quality && source.quality !== "auto" && (
              <span className="ml-1.5 text-xs opacity-70">{source.quality}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
