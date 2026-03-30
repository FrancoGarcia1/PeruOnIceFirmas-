"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

interface Minor {
  id: string;
  minor_name: string;
  minor_age: number;
}

interface Contract {
  id: string;
  adult_name: string;
  adult_dni: string;
  signed_at: string;
  deleted_at: string;
  minors: Minor[];
}

interface TrashTableProps {
  contracts: Contract[];
  search: string;
  currentPage: number;
  totalPages: number;
}

export default function TrashTable({ contracts, search, currentPage, totalPages }: TrashTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState(search);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleRestore = async (contractId: string) => {
    setRestoring(contractId);
    try {
      const res = await fetch(`/api/contracts/${contractId}`, { method: "PATCH" });
      if (res.ok) router.refresh();
    } catch {
      // silencioso
    } finally {
      setRestoring(null);
    }
  };

  const handlePermanentDelete = async (contractId: string) => {
    setConfirmDelete(null);
    setDeleting(contractId);
    try {
      const res = await fetch(`/api/contracts/${contractId}`, { method: "PUT" });
      if (res.ok) router.refresh();
    } catch {
      // silencioso
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("es-PE", {
      timeZone: "America/Lima",
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  return (
    <div className="bg-white rounded-2xl border border-ice-dark/40 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-ice-dark/30">
        <form onSubmit={handleSearch} className="flex gap-3">
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre o DNI..."
            className="flex-1 px-4 py-2.5 border-2 border-ice-dark/40 rounded-xl focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy outline-none transition-all bg-frost text-dark placeholder:text-dark-soft/40 text-sm"
          />
          <button type="submit" className="px-5 py-2.5 bg-burgundy text-white rounded-xl text-sm font-bold hover:bg-burgundy-dark transition-all">
            Buscar
          </button>
        </form>
      </div>

      {/* Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-ice-dark/30">
              <th className="text-left px-5 py-3 text-[10px] font-bold text-dark-soft/40 uppercase tracking-wider">Nombre</th>
              <th className="text-left px-5 py-3 text-[10px] font-bold text-dark-soft/40 uppercase tracking-wider">DNI</th>
              <th className="text-left px-5 py-3 text-[10px] font-bold text-dark-soft/40 uppercase tracking-wider">Fecha firma</th>
              <th className="text-left px-5 py-3 text-[10px] font-bold text-dark-soft/40 uppercase tracking-wider">Eliminado</th>
              <th className="text-left px-5 py-3 text-[10px] font-bold text-dark-soft/40 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {contracts.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-dark-soft/40 text-sm">
                  La papelera está vacía
                </td>
              </tr>
            ) : (
              contracts.map((c) => (
                <tr key={c.id} className="border-b border-ice-dark/20 hover:bg-frost/50 transition-colors">
                  <td className="px-5 py-3.5 text-sm font-semibold text-dark">{c.adult_name}</td>
                  <td className="px-5 py-3.5 text-sm text-dark-soft font-mono">{c.adult_dni}</td>
                  <td className="px-5 py-3.5 text-sm text-dark-soft/60">{formatDate(c.signed_at)}</td>
                  <td className="px-5 py-3.5 text-sm text-red-400">{formatDate(c.deleted_at)}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRestore(c.id)}
                        disabled={restoring === c.id}
                        className="px-3 py-1.5 bg-green-50 text-green-600 border border-green-200 rounded-lg text-xs font-bold hover:bg-green-100 transition-all disabled:opacity-50"
                      >
                        {restoring === c.id ? "..." : "Restaurar"}
                      </button>
                      <button
                        onClick={() => setConfirmDelete(c.id)}
                        disabled={deleting === c.id}
                        className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-100 transition-all disabled:opacity-50"
                      >
                        {deleting === c.id ? "..." : "Eliminar"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="md:hidden divide-y divide-ice-dark/20">
        {contracts.length === 0 ? (
          <div className="text-center py-12 text-dark-soft/40 text-sm">La papelera está vacía</div>
        ) : (
          contracts.map((c) => (
            <div key={c.id} className="p-4 space-y-2">
              <p className="text-sm font-bold text-dark">{c.adult_name}</p>
              <p className="text-xs text-dark-soft">{c.adult_dni} · Firmado: {formatDate(c.signed_at)}</p>
              <p className="text-xs text-red-400">Eliminado: {formatDate(c.deleted_at)}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleRestore(c.id)}
                  disabled={restoring === c.id}
                  className="px-3 py-1.5 bg-green-50 text-green-600 border border-green-200 rounded-lg text-xs font-bold hover:bg-green-100 transition-all disabled:opacity-50"
                >
                  {restoring === c.id ? "..." : "Restaurar"}
                </button>
                <button
                  onClick={() => setConfirmDelete(c.id)}
                  disabled={deleting === c.id}
                  className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-100 transition-all disabled:opacity-50"
                >
                  {deleting === c.id ? "..." : "Eliminar"}
                </button>
              </div>
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
      {/* Modal confirmación borrado permanente */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-50 mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-dark text-center mb-2">¿Eliminar permanentemente?</h3>
            <p className="text-sm text-dark-soft/60 text-center mb-6">
              Se borrará el contrato, los menores, la firma y el correo asociado. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-3 border-2 border-ice-dark/40 text-dark-soft/70 rounded-xl font-bold hover:bg-frost transition-all">
                Cancelar
              </button>
              <button onClick={() => handlePermanentDelete(confirmDelete)} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all">
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
