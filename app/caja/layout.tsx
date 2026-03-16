"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-client";

export default function CajaLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    const supabase = createSupabaseBrowser();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const sidebarContent = (
    <>
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center p-1">
            <Image src="/logo.png" alt="Perú on Ice" width={32} height={32} className="object-contain" />
          </div>
          <div>
            <h1 className="text-white font-bold text-sm leading-tight">Perú on Ice</h1>
            <p className="text-white/40 text-[10px] uppercase tracking-widest font-semibold">Caja</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 mt-2">
        <Link
          href="/caja"
          onClick={() => setSidebarOpen(false)}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
            pathname === "/caja" || pathname.startsWith("/caja/")
              ? "bg-burgundy text-white shadow-lg shadow-burgundy/30"
              : "text-white/60 hover:text-white hover:bg-white/5"
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          Contratos
        </Link>
      </nav>

      <div className="p-3 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/50 hover:text-burgundy-light hover:bg-white/5 rounded-xl transition-all"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Cerrar sesión
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Mobile header */}
      <header className="md:hidden flex items-center justify-between bg-dark px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center p-0.5">
            <Image src="/logo.png" alt="Perú on Ice" width={24} height={24} className="object-contain" />
          </div>
          <span className="text-white font-bold text-sm">Perú on Ice · Caja</span>
        </div>
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-white/70 hover:text-white p-1"
          aria-label="Abrir menú"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </header>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 h-full bg-dark flex flex-col">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 bg-dark flex-col shrink-0">
        {sidebarContent}
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
