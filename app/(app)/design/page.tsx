import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, CircleCheck, Info, Play, TriangleAlert } from "lucide-react";

import { MovieCard, MovieCardSkeleton, MovieSlider, SliderSkeleton } from "@/components/catalog";
import { AuthNav, LoginForm, SignOutButton } from "@/components/auth";
import { Container } from "@/components/layout/container";
import { Badge, Button, Input, Skeleton, Spinner } from "@/components/ui";
import {
  DESIGN_PREVIEW_LINKED,
  DESIGN_PREVIEW_MOVIES,
  DESIGN_PREVIEW_UNLINKED,
  DESIGN_PREVIEW_WITHOUT_POSTER,
} from "@/features/catalog/data/design-preview";
import type { MovieSummary } from "@/features/catalog/movie";

export const metadata: Metadata = {
  title: "Design system",
  description: "Tokens, primitivas y estados de la interfaz de VesperFlix.",
};

const swatches: { name: string; className: string }[] = [
  { name: "background", className: "bg-background" },
  { name: "surface", className: "bg-surface" },
  { name: "surface-hover", className: "bg-surface-hover" },
  { name: "border", className: "bg-border" },
  { name: "foreground", className: "bg-foreground" },
  { name: "muted", className: "bg-muted" },
  { name: "brand", className: "bg-brand" },
  { name: "brand-strong", className: "bg-brand-strong" },
  { name: "brand-soft", className: "bg-brand-soft" },
  { name: "success", className: "bg-success" },
  { name: "warning", className: "bg-warning" },
  { name: "danger", className: "bg-danger" },
  { name: "info", className: "bg-info" },
];

const typeScale: { name: string; className: string; sample: string }[] = [
  {
    name: "display · 4xl – 7xl",
    className: "text-5xl font-semibold tracking-tight",
    sample: "Todo tu cine",
  },
  {
    name: "h2 · 3xl – 4xl",
    className: "text-3xl font-semibold tracking-tight",
    sample: "Tendencias de la semana",
  },
  { name: "h3 · lg", className: "text-lg font-medium", sample: "Elige servidor" },
  {
    name: "body · base",
    className: "text-base",
    sample: "Reproductor nativo con calidad adaptativa.",
  },
  {
    name: "muted · sm",
    className: "text-sm text-muted",
    sample: "Catálogo actualizado desde TMDB.",
  },
  {
    name: "label · sm",
    className: "text-sm text-muted",
    sample: "Catálogo actualizado desde TMDB.",
  },
];

/**
 * Estados del `MovieCard` que la fila no enseña a simple vista: con destino,
 * sin él y sin carátula. Los ejemplos viven en el fixture de la página.
 */
const cardStates: { label: string; note: string; href?: string; movie: MovieSummary }[] = [
  {
    label: "Con enlace",
    note: "La tarjeta entera es el enlace. Al pasar el ratón o al enfocar aparece la sinopsis sobre el póster.",
    href: "/",
    movie: DESIGN_PREVIEW_LINKED,
  },
  {
    label: "Sin enlace",
    note: "Sin destino sigue siendo un bloque informativo: no tiene hover ni foco, así que tampoco enseña sinopsis.",
    movie: DESIGN_PREVIEW_UNLINKED,
  },
  {
    label: "Sin carátula",
    note: "El hueco del póster no se colapsa: conserva el aspecto 2:3 y lo ocupa el título.",
    movie: DESIGN_PREVIEW_WITHOUT_POSTER,
  },
];

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-6 py-14">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="max-w-2xl text-sm text-pretty text-muted">{description}</p>
      </div>
      {children}
    </section>
  );
}

export default function DesignSystemPage() {
  return (
    <main className="flex flex-1 flex-col py-12">
      <Container className="flex flex-col gap-4">
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-2 rounded-lg text-sm text-muted transition-colors duration-200 hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Volver al inicio
        </Link>

        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Design system</h1>
        <p className="max-w-2xl text-pretty text-muted">
          Fuente de verdad de los tokens y primitivas de VesperFlix. Cada componente se documenta
          con sus variantes y estados para mantener la interfaz coherente.
        </p>
      </Container>

      <Container className="mt-8">
        <Section
          title="Color"
          description="Paleta cinematográfica oscura. Los tokens viven en styles/globals.css y generan utilidades de Tailwind automáticamente."
        >
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {swatches.map((swatch) => (
              <li key={swatch.name} className="flex flex-col gap-2">
                <span
                  className={`h-16 rounded-xl border border-border ${swatch.className}`}
                  aria-hidden="true"
                />
                <span className="text-sm text-muted">{swatch.name}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section
          title="Tipografía"
          description="Geist Sans para toda la interfaz, con pasos evidentes de tamaño y peso. La monoespaciada queda reservada al código literal, como el token <code>--color-brand</code>."
        >
          <ul className="flex flex-col gap-6">
            {typeScale.map((item) => (
              <li key={item.name} className="flex flex-col gap-1">
                <span className="text-sm text-muted">{item.name}</span>
                <span className={item.className}>{item.sample}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section
          title="Button"
          description="Cinco variantes y cuatro tamaños. El estado de carga reemplaza al contenido con un spinner y bloquea la interacción."
        >
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-3">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
              <Button size="icon" aria-label="Reproducir">
                <Play aria-hidden="true" />
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button disabled>Deshabilitado</Button>
              <Button isLoading>Cargando</Button>
              <Button variant="outline" isLoading>
                Guardando
              </Button>
            </div>
          </div>
        </Section>

        <Section
          title="Badge"
          description="Etiquetas compactas para estados del catálogo y del panel de administración."
        >
          <div className="flex flex-wrap items-center gap-3">
            <Badge>Neutral</Badge>
            <Badge variant="brand">Nuevo</Badge>
            <Badge variant="success">
              <CircleCheck aria-hidden="true" />
              Publicado
            </Badge>
            <Badge variant="warning">
              <Info aria-hidden="true" />
              En revisión
            </Badge>
            <Badge variant="danger">
              <TriangleAlert aria-hidden="true" />
              Con errores
            </Badge>
            <Badge variant="outline">Borrador</Badge>
          </div>
        </Section>

        <Section
          title="Input"
          description="Campo de texto con estados de foco, deshabilitado y error. El error se anuncia con aria-invalid y aria-describedby."
        >
          <div className="grid gap-6 sm:max-w-md">
            <div className="flex flex-col gap-2">
              <label htmlFor="ds-input" className="text-sm font-medium">
                Título
              </label>
              <Input id="ds-input" placeholder="Dune: Parte dos" />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="ds-input-disabled" className="text-sm font-medium">
                Deshabilitado
              </label>
              <Input id="ds-input-disabled" placeholder="No editable" disabled />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="ds-input-invalid" className="text-sm font-medium">
                Con error
              </label>
              <Input
                id="ds-input-invalid"
                defaultValue="a"
                aria-invalid="true"
                aria-describedby="ds-input-error"
              />
              <p id="ds-input-error" className="text-sm text-danger">
                Escribe al menos 2 caracteres.
              </p>
            </div>
          </div>
        </Section>

        <Section
          title="Carga"
          description="Esqueletos que reservan el espacio final del contenido y spinners para acciones puntuales."
        >
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4 text-muted">
              <Spinner size="sm" />
              <Spinner />
              <Spinner size="lg" />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
            </div>

            {/* Tarjeta real frente a su esqueleto: reservan exactamente lo mismo. */}
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
              <div className="flex flex-col gap-2.5">
                <MovieCard movie={DESIGN_PREVIEW_LINKED} />
              </div>
              <MovieCardSkeleton />
              <MovieCardSkeleton />
              <MovieCardSkeleton />
              <MovieCardSkeleton />
              <MovieCardSkeleton />
            </div>

            <SliderSkeleton />
          </div>
        </Section>

        <Section
          title="MovieCard"
          description="Tarjeta del catálogo: póster 2:3, título, año y nota media. Lo esencial va siempre debajo del póster, visible también donde no hay hover; la sinopsis es un refuerzo progresivo. Con 0 votos la nota se omite en lugar de mostrar un 0 (en la fila de abajo, «The Mongoose»)."
        >
          <div className="grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-3">
            {cardStates.map((state) => (
              <figure key={state.label} className="flex flex-col gap-3">
                <MovieCard movie={state.movie} href={state.href} />
                <figcaption className="flex flex-col gap-1">
                  <span className="text-sm font-medium">{state.label}</span>
                  <span className="text-sm text-pretty text-muted">{state.note}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </Section>

        <Section
          title="MovieSlider"
          description="Fila horizontal con scroll-snap. Las flechas solo aparecen cuando quedan títulos en esa dirección, y nunca en pantallas táctiles, donde el arrastre nativo del navegador es el gesto. La fila también recibe foco y responde a las flechas del teclado."
        >
          <MovieSlider heading="Tendencias de la semana" headingLevel={3}>
            {DESIGN_PREVIEW_MOVIES.map((movie) => (
              <MovieCard key={movie.id} movie={movie} href="/" />
            ))}
          </MovieSlider>
        </Section>

        <Section
          title="Autenticación"
          description="Acceso con email/contraseña y enlace mágico. El header usa AuthNav (cliente) para mostrar 'Iniciar sesión' o 'Mi cuenta' sin convertir las páginas en dinámicas. Los formularios usan acciones de servidor con validación Zod."
        >
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface/60 p-4">
              <span className="text-sm text-muted">AuthNav (estado sin sesión):</span>
              <AuthNav />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-muted">SignOutButton:</span>
              <SignOutButton />
            </div>
            <div className="max-w-xl">
              <LoginForm mode="signin" nextPath="/account" />
            </div>
          </div>
        </Section>
      </Container>
    </main>
  );
}
