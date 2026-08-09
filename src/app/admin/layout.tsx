"use client";

import { usePathname } from "next/navigation";
import AdminSidebar from "./components/AdminSidebar";

// =========================================================
// ADMIN LAYOUT
// Avvolge tutte le pagine sotto /admin con la sidebar.
// La pagina di login resta full-screen, senza sidebar.
//
// FIX MOBILE: la barra superiore mobile in AdminSidebar.tsx
// ora usa "fixed" (non riserva più spazio automaticamente nel
// flusso normale). Il "pt-16 lg:pt-0" qui sotto compensa
// esattamente l'altezza di quella barra solo su mobile — su
// desktop (lg+) la barra è comunque nascosta, quindi niente
// padding extra li'.
// =========================================================

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-black">
      <AdminSidebar />
      <div className="flex-1 min-w-0 pt-16 lg:pt-0">{children}</div>
    </div>
  );
}