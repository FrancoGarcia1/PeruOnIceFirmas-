"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

interface EmailRow {
  id: string;
  email: string;
  created_at: string;
  contract_id: string | null;
  manual_name: string | null;
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

function getName(row: EmailRow): string {
  return row.manual_name ?? getContract(row)?.adult_name ?? "—";
}

function getDni(row: EmailRow): string {
  return getContract(row)?.adult_dni ?? "—";
}

export default function EmailTable({ emails, currentPage, totalPages, search }: EmailTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState(search);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [addEmail, setAddEmail] = useState("");
  const [addName, setAddName] = useState("");
  const [addDni, setAddDni] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const allSelected = emails.length > 0 && selected.size === emails.length;

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(emails.map((e) => e.id)));
    }
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setAddError(null);
    try {
      const res = await fetch("/api/emails/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: addEmail, name: addName, dni: addDni }),
      });
      const data = await res.json();
      if (!res.ok) { setAddError(data.error); return; }
      setShowAddModal(false);
      setAddEmail(""); setAddName(""); setAddDni("");
      router.refresh();
    } catch {
      setAddError("Error de conexión");
    } finally {
      setAdding(false);
    }
  };

  const handleSendSelected = () => {
    const ids = Array.from(selected).join(",");
    router.push(`/dashboard/emails/compose?selected=${ids}`);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("es-PE", {
      timeZone: "America/Lima",
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  const inputClass = "w-full px-4 py-2.5 border-2 border-ice-dark/40 rounded-xl focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy outline-none transition-all bg-frost text-dark placeholder:text-dark-soft/40 text-sm";

  return (
    <>
      <div className="bg-white rounded-2xl border border-ice-dark/40 shadow-sm overflow-hidden">
        {/* Header: búsqueda + acciones */}
        <div className="p-4 border-b border-ice-dark/30 flex flex-wrap gap-3 items-center">
          <form onSubmit={handleSearch} className="flex gap-3 flex-1 min-w-[200px]">
            <input type="text" value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por correo o nombre..."
              className="flex-1 px-4 py-2.5 border-2 border-ice-dark/40 rounded-xl focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy outline-none transition-all bg-frost text-dark placeholder:text-dark-soft/40 text-sm" />
            <button type="submit" className="px-5 py-2.5 bg-burgundy text-white rounded-xl text-sm font-bold hover:bg-burgundy-dark transition-all">
              Buscar
            </button>
          </form>
          <div className="flex gap-2">
            <button onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-green-50 text-green-700 border border-green-200 rounded-xl text-xs font-bold hover:bg-green-100 transition-all flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Agregar
            </button>
            {selected.size > 0 && (
              <button onClick={handleSendSelected}
                className="px-4 py-2.5 bg-burgundy text-white rounded-xl text-xs font-bold hover:bg-burgundy-dark transition-all flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                Enviar a {selected.size}
              </button>
            )}
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ice-dark/30">
                <th className="px-4 py-3 w-10">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll}
                    className="w-4 h-4 rounded border-gray-300 text-burgundy focus:ring-burgundy/30 cursor-pointer" />
                </th>
                <th className="text-left px-5 py-3 text-[10px] font-bold text-dark-soft/40 uppercase tracking-wider">Correo</th>
                <th className="text-left px-5 py-3 text-[10px] font-bold text-dark-soft/40 uppercase tracking-wider">Nombre</th>
                <th className="text-left px-5 py-3 text-[10px] font-bold text-dark-soft/40 uppercase tracking-wider">DNI</th>
                <th className="text-left px-5 py-3 text-[10px] font-bold text-dark-soft/40 uppercase tracking-wider">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {emails.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-dark-soft/40 text-sm">No se encontraron correos</td></tr>
              ) : (
                emails.map((row) => (
                  <tr key={row.id} className={`border-b border-ice-dark/20 hover:bg-frost/50 transition-colors ${selected.has(row.id) ? "bg-burgundy/5" : ""}`}>
                    <td className="px-4 py-3.5">
                      <input type="checkbox" checked={selected.has(row.id)} onChange={() => toggleOne(row.id)}
                        className="w-4 h-4 rounded border-gray-300 text-burgundy focus:ring-burgundy/30 cursor-pointer" />
                    </td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-dark">{row.email}</td>
                    <td className="px-5 py-3.5 text-sm text-dark-soft">{getName(row)}</td>
                    <td className="px-5 py-3.5 text-sm text-dark-soft font-mono">{getDni(row)}</td>
                    <td className="px-5 py-3.5 text-sm text-dark-soft/60">{formatDate(row.created_at)}</td>
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
              <div key={row.id} className={`p-4 flex gap-3 ${selected.has(row.id) ? "bg-burgundy/5" : ""}`}>
                <input type="checkbox" checked={selected.has(row.id)} onChange={() => toggleOne(row.id)}
                  className="w-4 h-4 mt-0.5 rounded border-gray-300 text-burgundy focus:ring-burgundy/30 cursor-pointer" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-bold text-dark">{row.email}</p>
                  <p className="text-xs text-dark-soft">{getName(row)} · {getDni(row)}</p>
                  <p className="text-xs text-dark-soft/50">{formatDate(row.created_at)}</p>
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
                <a key={page}
                  href={`${pathname}?page=${page}${search ? `&q=${encodeURIComponent(search)}` : ""}`}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${
                    page === currentPage ? "bg-burgundy text-white shadow-md" : "text-dark-soft/50 hover:bg-frost hover:text-dark"
                  }`}>
                  {page}
                </a>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal agregar correo manual */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-dark mb-4">Agregar correo</h3>
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-dark-soft/50 uppercase tracking-wider mb-1">Correo *</label>
                <input type="email" value={addEmail} onChange={(e) => setAddEmail(e.target.value)}
                  placeholder="correo@ejemplo.com" required className={inputClass} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-dark-soft/50 uppercase tracking-wider mb-1">Nombre (opcional)</label>
                <input type="text" value={addName} onChange={(e) => setAddName(e.target.value)}
                  placeholder="Nombre completo" className={inputClass} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-dark-soft/50 uppercase tracking-wider mb-1">DNI (opcional)</label>
                <input type="text" value={addDni} onChange={(e) => setAddDni(e.target.value)}
                  placeholder="DNI" maxLength={8} className={inputClass} />
              </div>
              {addError && <p className="text-xs text-red-500 font-medium">{addError}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 border-2 border-ice-dark/40 text-dark-soft/70 rounded-xl font-bold hover:bg-frost transition-all">
                  Cancelar
                </button>
                <button type="submit" disabled={adding}
                  className="flex-1 py-3 bg-burgundy text-white rounded-xl font-bold hover:bg-burgundy-dark transition-all disabled:opacity-50">
                  {adding ? "Guardando..." : "Agregar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
