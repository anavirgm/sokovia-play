"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User } from "lucide-react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { cn } from "@/utils/cn";

/**
 * Navegación de autenticación para el header.
 *
 * Cliente porque lee la sesión desde el navegador (cookies de @supabase/ssr).
 * Esto mantiene el resto de las páginas estáticas: solo este componente es
 * dinámico en el cliente, sin convertir toda la ruta en SSR.
 */
export function AuthNav({ className }: { className?: string }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Mientras carga, mostramos un placeholder neutro para evitar layout shift.
  if (!ready) {
    return (
      <div className={cn("flex items-center gap-2", className)} aria-hidden="true">
        <div className="h-9 w-24 rounded-xl bg-surface/60" />
      </div>
    );
  }

  if (user) {
    const label = user.email ?? "Mi cuenta";
    return (
      <Link
        href="/account"
        className={cn(
          "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover",
          className,
        )}
      >
        <User className="size-4" aria-hidden="true" />
        <span className="hidden max-w-[180px] truncate sm:inline">{label}</span>
        <span className="sm:hidden">Mi cuenta</span>
      </Link>
    );
  }

  return (
    <Link
      href="/login"
      className={cn(
        "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-hover hover:text-foreground",
        className,
      )}
    >
      Iniciar sesión
    </Link>
  );
}
