"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-client";

export default function PdfDownloadGate({ contractId }: { contractId: string }) {
  const [email, setEmail] = useState("");
  const [hasEmail, setHasEmail] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    createSupabaseBrowser()
      .from("contract_emails")
      .select("email")
      .eq("contract_id", contractId)
      .maybeSingle()
      .then(({ data }) => {
        setHasEmail(!!data);
      });
  }, [contractId]);

  const handleDownload = () => {
    if (hasEmail) {
      window.open(`/api/pdf/${contractId}`, "_blank");
    } else {
      setShowInput(true);
    }
  };

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Ingresa un correo válido");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/contract-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractId, email: trimmed }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Error al guardar el correo");
        return;
      }

      setHasEmail(true);
      setShowInput(false);
      window.open(`/api/pdf/${contractId}`, "_blank");
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (hasEmail === null) {
    return (
      <div className="w-full py-4 bg-ice-dark/30 text-dark-soft/40 rounded-2xl text-center text-sm font-medium animate-pulse">
        Cargando...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {!showInput ? (
        <button
          onClick={handleDownload}
          className="flex items-center justify-center gap-2 w-full py-4 bg-burgundy text-white rounded-2xl font-bold text-sm shadow-lg shadow-burgundy/25 hover:bg-burgundy-dark transition-all active:scale-[0.98]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Descargar mi contrato en PDF
        </button>
      ) : (
        <form onSubmit={handleSubmitEmail} className="bg-white rounded-2xl border border-ice-dark/40 p-5 shadow-sm space-y-4">
          <div>
            <p className="text-sm font-semibold text-dark mb-1">
              Ingresa tu correo para descargar
            </p>
            <p className="text-xs text-dark-soft/50">
              Tu correo se usará únicamente para enviarte información de Perú on Ice.
            </p>
          </div>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tucorreo@ejemplo.com"
            className="w-full px-4 py-3 border-2 border-ice-dark/40 rounded-xl focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy outline-none transition-all bg-frost text-dark placeholder:text-dark-soft/40 text-sm"
            required
            autoFocus
          />

          {error && (
            <p className="text-xs text-red-500 font-medium">{error}</p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowInput(false)}
              className="flex-1 py-3 border-2 border-ice-dark/40 text-dark-soft/60 rounded-xl font-bold text-sm hover:bg-frost transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-burgundy text-white rounded-xl font-bold text-sm hover:bg-burgundy-dark transition-all disabled:opacity-50 shadow-lg shadow-burgundy/20"
            >
              {loading ? "Enviando..." : "Descargar PDF"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
