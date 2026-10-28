import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import "@/styles/globals.css";

/*
 * Tipografía: una sola familia, Geist.
 *
 * Se mantiene Geist de forma deliberada aunque el detector de impeccable la
 * marque como `overused-font`: es la fuente del stack Next.js/Vercel, ya viene
 * precargada por el scaffold y cubre todo lo que la interfaz necesita.
 *
 * El par monoespaciado se retiró: la norma del design system reserva la mono
 * para código literal, y no había ni un solo uso en la interfaz. El código
 * hereda la pila monoespaciada del sistema.
 */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "VesperFlix: streaming cinematográfico",
    template: "%s · VesperFlix",
  },
  description:
    "Plataforma de streaming híbrida: catálogo TMDB, reproductor multi-servidor y panel de administración en tiempo real.",
  applicationName: "VesperFlix",
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  colorScheme: "dark",
};

/**
 * Marco raíz: el documento y el marco que comparten todas las páginas.
 *
 * La cabecera y el pie viven aquí, no en un grupo de rutas, para que la portada
 * y las páginas interiores tengan el mismo armazón: la barra superior con la
 * marca, la navegación y la búsqueda, y un pie que cierra con el nombre.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${geistSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:rounded-xl focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:ring-2 focus:ring-ring"
        >
          Saltar al contenido
        </a>

        <Header />

        <div id="contenido" tabIndex={-1} className="flex flex-1 flex-col">
          {children}
        </div>

        <Footer />
      </body>
    </html>
  );
}
