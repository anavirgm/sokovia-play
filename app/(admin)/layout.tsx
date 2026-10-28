import type { ReactNode } from "react";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/features/admin/guards";

/**
 * Layout del área de administración.
 * El guard server-side se aplica aquí para proteger todas las rutas /admin.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin();

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <Header />
      <AdminNav />
      <div className="flex flex-1 flex-col">{children}</div>
      <Footer />
    </div>
  );
}
