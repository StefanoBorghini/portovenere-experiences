"use client";

import { usePathname } from "next/navigation";
import AdminSidebar from "./components/AdminSidebar";

// =========================================================
// ADMIN LAYOUT
// Avvolge tutte le pagine sotto /admin con la sidebar.
// La pagina di login resta full-screen, senza sidebar:
// non avrebbe senso mostrare la navigazione prima del login,
// e finche' non c'e' sessione i link porterebbero comunque
// al redirect che ogni pagina gia' fa in autonomia.
//
// NOTA: il check di sessione resta per ora dentro ogni singola
// pagina (pattern gia' in uso in experiences/leads/enhancements).
// Se in futuro si aggiungono altre sezioni admin, vale la pena
// centralizzare quel check qui nel layout — evita di duplicarlo
// in ogni nuova pagina — ma non l'ho spostato ora per non
// rischiare regressioni sulle pagine gia' funzionanti.
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
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}