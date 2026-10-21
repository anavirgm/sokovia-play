"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LogIn, Menu, Search, User, X } from "lucide-react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button, Input } from "@/components/ui";
import { navItems } from "@/constants/navigation";
import type { User as SupabaseUser } from "@supabase/supabase-js";

/**
 * Menú principal en móvil y tablet. El panel se monta bajo el header y cierra
 * con el botón, al navegar o con la tecla Escape.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
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

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="lg:hidden">
      <Button
        variant="ghost"
        size="icon"
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
      </Button>

      {/* Panel sólido bajo la barra: el tono lo separa y evita una segunda
          superficie con desenfoque y una línea de 1px a todo lo ancho. */}
      <div id="mobile-nav-panel" hidden={!open} className="absolute inset-x-0 top-16 bg-surface">
        <nav aria-label="Principal" className="px-4 pt-4 pb-6 sm:px-6">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-3 py-3 font-medium transition-colors duration-200 hover:bg-surface"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <form
            role="search"
            aria-label="Búsqueda rápida"
            action="/search"
            className="relative mt-4"
          >
            <label htmlFor="mobile-search" className="sr-only">
              Buscar títulos
            </label>
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <Input
              id="mobile-search"
              name="q"
              type="search"
              enterKeyHint="search"
              placeholder="Buscar títulos…"
              className="pl-9 [&::-webkit-search-cancel-button]:appearance-none"
            />
          </form>

          {user ? (
            <Link
              href="/account"
              onClick={() => setOpen(false)}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-strong px-7 py-3 text-base font-medium text-white transition-colors hover:bg-brand-deep"
            >
              <User aria-hidden="true" className="size-5" />
              Mi cuenta
            </Link>
          ) : (
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-strong px-7 py-3 text-base font-medium text-white transition-colors hover:bg-brand-deep"
            >
              <LogIn aria-hidden="true" className="size-5" />
              Iniciar sesión
            </Link>
          )}
        </nav>
      </div>
    </div>
  );
}
