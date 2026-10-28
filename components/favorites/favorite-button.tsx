"use client";

import { useOptimistic, useTransition } from "react";
import { Heart } from "lucide-react";

import { toggleFavorite } from "@/actions/favorites";
import { buttonVariants } from "@/components/ui";
import { cn } from "@/utils/cn";

type FavoriteButtonProps = {
  tmdbId: number;
  isFavoriteInitial: boolean;
  className?: string;
};

export function FavoriteButton({ tmdbId, isFavoriteInitial, className }: FavoriteButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticFavorite, setOptimisticFavorite] = useOptimistic(
    isFavoriteInitial,
    (state) => !state,
  );

  const handleToggle = () => {
    startTransition(async () => {
      setOptimisticFavorite(null);
      try {
        await toggleFavorite(tmdbId);
      } catch (error) {
        // Rollback automático por useOptimistic
        console.error("Error al actualizar favoritos:", error);
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      className={cn(
        buttonVariants({ size: "lg" }),
        "h-13 border border-white/25 bg-surface/80 px-6 text-base hover:bg-surface-hover/90 sm:text-lg",
        optimisticFavorite && "border-brand/50 bg-brand/10 text-brand-soft hover:bg-brand/20",
        className,
      )}
      aria-pressed={optimisticFavorite}
    >
      <Heart aria-hidden="true" className={cn("size-5", optimisticFavorite && "fill-current")} />
      {optimisticFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
    </button>
  );
}
