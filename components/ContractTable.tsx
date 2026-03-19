"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

interface Minor {
  id: string;
  minor_name: string;
  minor_dni: string | null;
  minor_age: number;
}

interface Contract {
  id: string;
  adult_name: string;
  adult_dni: string;
  adult_age: number | null;
  signature_url: string | null;
  signed_at: string;
  minors: Minor[];
}

interface Props {
  contracts: Contract[];
  search: string;
  currentPage: number;
  totalPages: number;
  basePath?: string;
  extraParams?: Record<string, string>;
}

export default function ContractTable({
  contracts,
  search,
  currentPage,
  totalPages,
  basePath = "/dashboard",
  extraParams = {},
}: Props) {
  const router = useRouter();
  const [query, setQuery] = useState(search);

  const buildParams = (overrides: Record<string, string> = {}) => {
    const p = new URLSearchParams({ ...extraParams, ...overrides });
    return p.toString();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params: Record<string, string> = {};
    if (query) params.q = query;
    router.push(`${basePath}?${buildParams(params)}`);
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString("es-PE", {
      timeZone: "America/Lima",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div>
      {/* Search bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-soft/30"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre o DNI..."
              className="w-full pl-12 pr-4 py-3 border-2 border-ice-dark/40 rounded-xl focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy outline-none transition-all bg-white text-dark placeholder:text-dark-soft/40"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-burgundy text-white rounded-xl hover:bg-burgundy-dark transition-all font-bold shadow-md shadow-burgundy/15"
          >
            Buscar
          </button>
        </div>
      </form>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-2xl border border-ice-dark/40 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-frost border-b border-ice-dark/30">
                <th className="text-left px-6 py-4 text-[10px] font-bold text-dark-soft/60 uppercase tracking-wider">
                  Adulto responsable
                </th>
                <th className="text-left px-6 py-4 text-[10px] font-bold text-dark-soft/60 uppercase tracking-wider">
                  DNI
                </th>
                <th className="text-left px-6 py-4 text-[10px] font-bold text-dark-soft/60 uppercase tracking-wider">
                  Menores
                </th>
                <th className="text-left px-6 py-4 text-[10px] font-bold text-dark-soft/60 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="text-right px-6 py-4 text-[10px] font-bold text-dark-soft/60 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ice-dark/20">
              {contracts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <svg
                      className="mx-auto mb-3 text-dark-soft/20"
                      width="36"
                      height="36"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <p className="text-dark-soft/40 font-medium">
                      No se encontraron contratos
                    </p>
                  </td>
                </tr>
              ) : (
                contracts.map((contract) => (
                  <tr
                    key={contract.id}
                    className="hover:bg-frost/60 transition-colors"
                  >
                    <td className="px-6 py-4 font-semibold text-dark">
                      {contract.adult_name}
                    </td>
                    <td className="px-6 py-4 text-dark-soft/70 font-mono text-sm">
                      {contract.adult_dni}
                    </td>
                    <td className="px-6 py-4 text-dark-soft/70 text-sm">
                      {contract.minors.length === 0 ? (
                        <span className="text-dark-soft/30">-</span>
                      ) : (
                        contract.minors
                          .map((m) => `${m.minor_name} (${m.minor_age})`)
                          .join(", ")
                      )}
                    </td>
                    <td className="px-6 py-4 text-dark-soft/70 text-sm">
                      {formatDate(contract.signed_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <Link
                          href={`${basePath}/${contract.id}`}
                          className="px-3.5 py-1.5 text-sm bg-burgundy/10 text-burgundy rounded-lg hover:bg-burgundy/20 transition-colors font-semibold"
                        >
                          Ver
                        </Link>
                        <a
                          href={`/api/pdf/${contract.id}`}
                          className="px-3.5 py-1.5 text-sm bg-frost text-dark-soft/60 rounded-lg hover:bg-ice transition-colors font-medium border border-ice-dark/30"
                          target="_blank"
                        >
                          PDF
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {contracts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-ice-dark/40 shadow-sm px-6 py-16 text-center">
            <svg
              className="mx-auto mb-3 text-dark-soft/20"
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <p className="text-dark-soft/40 font-medium">
              No se encontraron contratos
            </p>
          </div>
        ) : (
          contracts.map((contract) => (
            <div
              key={contract.id}
              className="bg-white rounded-2xl border border-ice-dark/40 shadow-sm p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-dark">
                    {contract.adult_name}
                  </p>
                  <p className="text-sm text-dark-soft/60 font-mono">
                    DNI: {contract.adult_dni}
                  </p>
                </div>
              </div>

              {contract.minors.length > 0 && (
                <p className="text-sm text-dark-soft/70 mb-2">
                  <span className="text-[10px] font-bold text-dark-soft/50 uppercase tracking-wider">
                    Menores:{" "}
                  </span>
                  {contract.minors
                    .map((m) => `${m.minor_name} (${m.minor_age})`)
                    .join(", ")}
                </p>
              )}

              <p className="text-xs text-dark-soft/50 mb-3">
                {formatDate(contract.signed_at)}
              </p>

              <div className="flex gap-2">
                <Link
                  href={`${basePath}/${contract.id}`}
                  className="flex-1 text-center px-3 py-2 text-sm bg-burgundy/10 text-burgundy rounded-lg hover:bg-burgundy/20 transition-colors font-semibold"
                >
                  Ver
                </Link>
                <a
                  href={`/api/pdf/${contract.id}`}
                  className="flex-1 text-center px-3 py-2 text-sm bg-frost text-dark-soft/60 rounded-lg hover:bg-ice transition-colors font-medium border border-ice-dark/30"
                  target="_blank"
                >
                  PDF
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Link
              key={page}
              href={`${basePath}?${buildParams({ page: String(page), ...(search ? { q: search } : {}) })}`}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                page === currentPage
                  ? "bg-burgundy text-white shadow-md shadow-burgundy/20"
                  : "bg-white text-dark-soft/60 border border-ice-dark/40 hover:border-burgundy/30 hover:text-burgundy"
              }`}
            >
              {page}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
