"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ComposeEmailPage() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const handleSend = async () => {
    setShowConfirm(false);
    setSending(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/emails/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, body }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al enviar");
        return;
      }

      setResult({ sent: data.sent, failed: data.failed });
    } catch {
      setError("Error de conexión");
    } finally {
      setSending(false);
    }
  };

  const canSend = subject.trim().length > 0 && body.trim().length > 0;

  return (
    <div>
      <div className="mb-8 flex items-center gap-4">
        <Link
          href="/dashboard/emails"
          className="inline-flex items-center gap-2 text-sm text-burgundy hover:text-burgundy-dark font-medium transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Volver
        </Link>
        <div className="hidden sm:block w-px h-6 bg-ice-dark" />
        <h2 className="text-xl md:text-2xl font-bold text-dark">Enviar correo masivo</h2>
      </div>

      {result ? (
        <div className="bg-white rounded-2xl border border-ice-dark/40 shadow-sm p-8 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-dark mb-2">Envío completado</h3>
          <p className="text-sm text-dark-soft/60 mb-1">
            <span className="font-bold text-dark">{result.sent}</span> correos enviados correctamente
          </p>
          {result.failed > 0 && (
            <p className="text-sm text-red-500 font-medium">
              {result.failed} fallaron
            </p>
          )}
          <button
            onClick={() => router.push("/dashboard/emails")}
            className="mt-6 px-6 py-3 bg-burgundy text-white rounded-xl font-bold text-sm hover:bg-burgundy-dark transition-all"
          >
            Volver a Correos
          </button>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white rounded-2xl border border-ice-dark/40 shadow-sm p-6 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-dark-soft uppercase tracking-wider mb-2">
                Asunto
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ej: Promoción especial Perú on Ice"
                className="w-full px-4 py-3 border-2 border-ice-dark/40 rounded-xl focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy outline-none transition-all bg-frost text-dark placeholder:text-dark-soft/40 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-dark-soft uppercase tracking-wider mb-2">
                Mensaje
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Escribe el contenido del correo..."
                rows={8}
                className="w-full px-4 py-3 border-2 border-ice-dark/40 rounded-xl focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy outline-none transition-all bg-frost text-dark placeholder:text-dark-soft/40 text-sm resize-none"
              />
            </div>

            <p className="text-xs text-dark-soft/40">
              Se enviará a todos los correos únicos recopilados. El envío se realiza en lotes.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-red-600 text-sm text-center font-medium">{error}</p>
            </div>
          )}

          <button
            onClick={() => setShowConfirm(true)}
            disabled={!canSend || sending}
            className="w-full py-4 bg-burgundy text-white font-bold rounded-2xl hover:bg-burgundy-dark transition-all disabled:opacity-50 shadow-lg shadow-burgundy/20 text-sm"
          >
            {sending ? "Enviando..." : "Enviar a todos los correos"}
          </button>
        </div>
      )}

      {/* Modal de confirmación */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-dark text-center mb-2">
              ¿Enviar correo masivo?
            </h3>
            <p className="text-sm text-dark-soft/60 text-center mb-6">
              Se enviará a todos los correos únicos registrados. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 border-2 border-ice-dark/40 text-dark-soft/70 rounded-xl font-bold hover:bg-frost transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleSend}
                className="flex-1 py-3 bg-burgundy text-white rounded-xl font-bold hover:bg-burgundy-dark transition-all"
              >
                Sí, enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
