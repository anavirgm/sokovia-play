"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Film, LayoutDashboard, Server } from "lucide-react";

import { cn } from "@/utils/cn";

const navItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Películas",
    href: "/admin/movies",
    icon: Film,
  },
  {
    label: "Fuentes",
    href: "/admin/sources",
    icon: Server,
  },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-border bg-surface/40">
      <div className="mx-auto flex max-w-7xl items-center gap-1 px-4 sm:px-6">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "border-b-2 border-brand text-foreground"
                  : "text-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
