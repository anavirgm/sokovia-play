import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";

import { Container } from "@/components/layout/container";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Input } from "@/components/ui";
import { navItems } from "@/constants/navigation";

/** Barra superior fija, translúcida, con navegación, búsqueda y acceso. */
export function Header() {
  return (
    /* Sin línea inferior: el vidrio y la sombra de superposición ya la separan. */
    <header className="sticky top-0 z-50 glass">
      <Container className="flex h-16 items-center gap-3">
        <Link
          href="/"
          aria-label="VesperFlix, inicio"
          className="flex shrink-0 items-center gap-2.5 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Image
            src="/brand/vesper-mark.png"
            alt="VesperFlix"
            width={36}
            height={36}
            className="size-9 rounded-lg"
            priority
          />
          <span className="text-lg font-semibold tracking-tight">VesperFlix</span>
        </Link>

        {/* La navegación de escritorio entra en `lg`, no en `md`: entre 768 y
            1024 los cuatro enlaces, la búsqueda y el acceso no caben en una
            sola fila y desbordaban el ancho de la página. */}
        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors duration-200 hover:bg-surface hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {/* Formulario GET puro: sin JavaScript, busca igual. La búsqueda con
              debounce vive en la propia página `/search`; aquí basta con llegar. */}
          <form
            role="search"
            aria-label="Búsqueda rápida"
            action="/search"
            className="relative hidden sm:block"
          >
            <label htmlFor="site-search" className="sr-only">
              Buscar títulos
            </label>
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <Input
              id="site-search"
              name="q"
              type="search"
              enterKeyHint="search"
              placeholder="Buscar títulos…"
              className="h-10 w-52 pl-9 xl:w-72 [&::-webkit-search-cancel-button]:appearance-none"
            />
          </form>

          <MobileNav />
        </div>
      </Container>
    </header>
  );
}
