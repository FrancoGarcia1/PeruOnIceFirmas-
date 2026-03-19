"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

interface EmailRow {
  id: string;
  email: string;
  created_at: string;
  contract_id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  contracts: any;
}

interface EmailTableProps {
  emails: EmailRow[];
  currentPage: number;
  totalPages: number;
  search: string;
}

function getContract(row: EmailRow) {
  if (!row.contracts) return null;
  return Array.isArray(row.contracts) ? row.contracts[0] : row.contracts;
}

export default function EmailTable({ emails, currentPage, totalPages, search }: EmailTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState(search);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-2xl border border-ice-dark/40 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-ice-dark/30">
        <form onSubmit={handleSearch} className="flex gap-3">
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por correo o nombre..."
            className="flex-1 px-4 py-2.5 border-2 border-ice-dark/40 rounded-xl focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy outline-none transition-all bg-frost text-dark placeholder:text-dark-soft/40 text-sm"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-burgundy text-white rounded-xl text-sm font-bold hover:bg-burgundy-dark transition-all"
          >
            Buscar
          </button>
        </form>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-ice-dark/30">
              <th className="text-left px-5 py-3 text-[10px] font-bold text-dark-soft/40 uppercase tracking-wider">Correo</th>
              <th className="text-left px-5 py-3 text-[10px] font-bold text-dark-soft/40 uppercase tracking-wider">Nombre</th>
              <th className="text-left px-5 py-3 text-[10px] font-bold text-dark-soft/40 uppercase tracking-wider">DNI</th>
              <th className="text-left px-5 py-3 text-[10px] font-bold text-dark-soft/40 uppercase tracking-wider">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {emails.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-12 text-dark-soft/40 text-sm">
                  No se encontraron correos
                </td>
              </tr>
            ) : (
              emails.map((row) => (
                <tr key={row.id} className="border-b border-ice-dark/20 hover:bg-frost/50 transition-colors">
                  <td className="px-5 py-3.5 text-sm font-semibold text-dark">{row.email}</td>
                  <td className="px-5 py-3.5 text-sm text-dark-soft">{getContract(row)?.adult_name ?? "—"}</td>
                  <td className="px-5 py-3.5 text-sm text-dark-soft font-mono">{row.contracts?.[0]?.adult_dni ?? "—"}</td>
                  <td className="px-5 py-3.5 text-sm text-dark-soft/60">
                    {new Date(row.created_at).toLocaleString("es-PE", {
                      timeZone: "America/Lima",
                      day: "2-digit", month: "2-digit", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-ice-dark/20">
        {emails.length === 0 ? (
          <div className="text-center py-12 text-dark-soft/40 text-sm">No se encontraron correos</div>
        ) : (
          emails.map((row) => (
            <div key={row.id} className="p-4 space-y-1">
              <p className="text-sm font-bold text-dark">{row.email}</p>
              <p className="text-xs text-dark-soft">{getContract(row)?.adult_name ?? "—"} · {row.contracts?.[0]?.adult_dni ?? "—"}</p>
              <p className="text-xs text-dark-soft/50">
                {new Date(row.created_at).toLocaleString("es-PE", {
                  timeZone: "America/Lima",
                  day: "2-digit", month: "2-digit", year: "numeric",
                })}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 p-4 border-t border-ice-dark/30">
          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
            const page = i + 1;
            return (
              <a
                key={page}
                href={`${pathname}?page=${page}${search ? `&q=${encodeURIComponent(search)}` : ""}`}
                className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${
                  page === currentPage
                    ? "bg-burgundy text-white shadow-md"
                    : "text-dark-soft/50 hover:bg-frost hover:text-dark"
                }`}
              >
                {page}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
