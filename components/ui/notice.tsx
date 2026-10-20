import type { ReactNode } from "react";

import { cn } from "@/utils/cn";

/**
 * Bloque de estado a página completa: vacío, error o invitación.
 *
 * Lo comparten la búsqueda (#13) y la exploración por género (#14) para que un
 * «sin resultados» se vea igual en todo el catálogo: un icono, un titular, una
 * explicación y, cuando la hay, una salida. El estado vacío no es un callejón.
 */
export type NoticeProps = {
  icon: ReactNode;
  title: string;
  description: ReactNode;
  /** Salidas del estado: enlaces o acciones. */
  children?: ReactNode;
  className?: string;
};

export function Notice({ icon, title, description, children, className }: NoticeProps) {
  return (
    <div
      data-slot="notice"
      className={cn(
        "flex flex-col items-center gap-5 rounded-xl border border-border/70 bg-surface/40 px-6 py-14 text-center sm:py-16",
        className,
      )}
    >
      <span className="grid size-14 place-items-center rounded-xl bg-brand/10 text-brand-soft ring-1 ring-brand/20 ring-inset">
        {icon}
      </span>

      <div className="flex max-w-md flex-col gap-2">
        <h2 className="text-xl font-semibold tracking-tight text-balance">{title}</h2>
        <p className="text-sm text-pretty text-muted">{description}</p>
      </div>

      {children}
    </div>
  );
}
