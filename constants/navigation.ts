/**
 * Navegación principal del sitio.
 *
 * En el Sprint 1 solo existen la home y el design system. Las rutas de catálogo
 * (`/peliculas`, `/series`, `/mi-lista`) se añadirán junto a sus páginas para no
 * dejar enlaces rotos.
 */
export type NavItem = {
  label: string;
  href: string;
};

export const navItems: NavItem[] = [
  { label: "Inicio", href: "/" },
  { label: "Catálogo", href: "/#catalogo" },
  { label: "Design system", href: "/design" },
];
