"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// =========================================================
// NAV ITEMS — un solo punto dove aggiungere una nuova sezione
// admin in futuro (es. /admin/proposals, /admin/partners):
// basta aggiungere una riga qui, sidebar e dashboard la
// prendono automaticamente.
// =========================================================

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: DashboardIcon, exact: true },
  { href: "/admin/experiences", label: "Experiences", icon: ExperiencesIcon },
  { href: "/admin/enhancements", label: "Enhancements", icon: EnhancementsIcon },
  { href: "/admin/leads", label: "Leads", icon: LeadsIcon },
];

// =========================================================
// ICONS — SVG inline, stroke coerente (currentColor, 1.5),
// cosi' ereditano il colore del testo senza dover importare
// una libreria di icone.
// =========================================================

function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 shrink-0">
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  );
}

function ExperiencesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 shrink-0">
      <circle cx="12" cy="12" r="9" />
      <path d="M15 9l-2 5-5 2 2-5 5-2z" />
    </svg>
  );
}

function EnhancementsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 shrink-0">
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
      <path d="M12 8a4 4 0 100 8 4 4 0 000-8z" />
    </svg>
  );
}

function LeadsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 shrink-0">
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="17" cy="8" r="2.3" />
      <path d="M15.5 14.2c2.4.4 4.5 2.5 4.5 5.8" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 shrink-0">
      <path d="M9 3H5a2 2 0 00-2 2v14a2 2 0 002 2h4" />
      <path d="M16 17l5-5-5-5M21 12H9" />
    </svg>
  );
}

function ChevronIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={`w-4 h-4 transition-transform ${collapsed ? "rotate-180" : ""}`}
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

// =========================================================
// SIDEBAR
// =========================================================

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  // Desktop: sidebar espansa/collassata (larga con label, o
  // stretta con solo icone — come il "collapse menu" di WP).
  const [collapsed, setCollapsed] = useState(false);

  // Mobile: sidebar nascosta di default, si apre come overlay
  // a comparsa sopra il contenuto (stesso spirito, adattato a
  // schermi stretti dove non c'e' spazio per una colonna fissa).
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(item: (typeof NAV_ITEMS)[number]) {
    if (item.exact) return pathname === item.href;
    return pathname?.startsWith(item.href);
  }

  async function handleLogout() {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* HEADER — logo + toggle collapse (solo desktop) */}
      <div className="flex items-center justify-between px-4 py-6">
        <Link href="/admin" className="flex items-center gap-3 min-w-0">
          <img src="/logo-white.png" alt="PV" className="h-8 w-auto shrink-0" />
          {!collapsed && (
            <span className="text-sm text-white/70 truncate">
              Portovenere Admin
            </span>
          )}
        </Link>

        <button
          onClick={() => setCollapsed((c) => !c)}
          className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg border border-white/10 text-white/50 hover:text-white hover:bg-white/5 transition-all shrink-0"
          aria-label="Toggle sidebar"
        >
          <ChevronIcon collapsed={collapsed} />
        </button>
      </div>

      {/* NAV */}
      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all ${
                active
                  ? "bg-white text-black font-medium"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* LOGOUT */}
      <div className="px-3 pb-6 pt-3 border-t border-white/[0.08]">
        <button
          onClick={handleLogout}
          title={collapsed ? "Logout" : undefined}
          className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/5 transition-all w-full"
        >
          <LogoutIcon />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* MOBILE TOP BAR — solo l'hamburger, la sidebar vera resta
          nascosta finche' non viene aperta */}
      <div className="lg:hidden flex items-center justify-between px-4 py-4 border-b border-white/[0.08] bg-black text-white sticky top-0 z-30">
        <Link href="/admin" className="flex items-center gap-3">
          <img src="/logo-white.png" alt="PV" className="h-7 w-auto" />
        </Link>

        <button
          onClick={() => setMobileOpen(true)}
          className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/10 text-white/70"
          aria-label="Open menu"
        >
          <MenuIcon />
        </button>
      </div>

      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 bg-black border-r border-white/[0.08] text-white">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR — sempre visibile, larghezza variabile
          in base a collapsed */}
      <aside
        className={`hidden lg:flex flex-col bg-black border-r border-white/[0.08] text-white h-screen sticky top-0 transition-all duration-200 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}