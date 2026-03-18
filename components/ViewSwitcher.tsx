"use client";

import Link from "next/link";

interface ViewSwitcherProps {
  active: "admin" | "caja";
}

export default function ViewSwitcher({ active }: ViewSwitcherProps) {
  return (
    <div className="px-3 pt-4 pb-1">
      <p className="text-[9px] text-white/25 uppercase tracking-[0.15em] font-bold mb-2 px-1">
        Vista actual
      </p>
      <div className="flex p-1 bg-white/5 rounded-2xl border border-white/8 gap-1">
        {/* Admin tab */}
        <Link
          href="/dashboard"
          className={`relative flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
            active === "admin"
              ? "bg-burgundy text-white shadow-lg shadow-burgundy/40"
              : "text-white/35 hover:text-white/70 hover:bg-white/5"
          }`}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          Admin
          {active === "admin" && (
            <span className="absolute -top-px left-1/2 -translate-x-1/2 w-6 h-px bg-white/30 rounded-full" />
          )}
        </Link>

        {/* Caja tab */}
        <Link
          href="/caja"
          className={`relative flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
            active === "caja"
              ? "bg-burgundy text-white shadow-lg shadow-burgundy/40"
              : "text-white/35 hover:text-white/70 hover:bg-white/5"
          }`}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" />
          </svg>
          Caja
          {active === "caja" && (
            <span className="absolute -top-px left-1/2 -translate-x-1/2 w-6 h-px bg-white/30 rounded-full" />
          )}
        </Link>
      </div>
    </div>
  );
}
