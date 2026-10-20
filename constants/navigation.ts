/**
 * Navegación principal del sitio.
 *
 * Solo se listan rutas que existen: un enlace roto en la cabecera se ve en todas
 * las páginas. Las rutas de series, mi lista y ficha de película (#18) se
 * añadirán junto a sus páginas.
 */
export type NavItem = {
  label: string;
  href: string;
};

export const navItems: NavItem[] = [
  { label: "Inicio", href: "/" },
  { label: "Catálogo", href: "/#catalogo" },
  { label: "Explorar", href: "/explore" },
  { label: "Design system", href: "/design" },
];
