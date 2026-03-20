"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TEMPLATES, generateEmailHtml, type TemplateName, type TemplateFields } from "@/lib/email-templates";

export default function ComposeEmailPage() {
  // AI generation
  const [idea, setIdea] = useState("");
  const [generating, setGenerating] = useState(false);

  // Email fields (filled by AI or manually)
  const [template, setTemplate] = useState<TemplateName | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [badge, setBadge] = useState("");
  const [ctaText, setCtaText] = useState("");
  const [ctaUrl, setCtaUrl] = useState("https://peruonice.com");
  const [eventDate, setEventDate] = useState("");
  const [eventLocation, setEventLocation] = useState("");

  // Send state
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const router = useRouter();

  const generated = template !== null && title.length > 0 && body.length > 0;

  const fields: TemplateFields = {
    template: template ?? "informativo",
    title: title || "Tu título aquí",
    body: body || "Tu mensaje aquí...",
    badge, ctaText, ctaUrl, eventDate, eventLocation,
  };

  const previewHtml = generated ? generateEmailHtml(fields) : "";

  const handleGenerate = async () => {
    if (!idea.trim()) return;
    setGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/emails/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }

      setTemplate(data.template as TemplateName);
      setTitle(data.title ?? "");
      setBody(data.body ?? "");
      setBadge(data.badge ?? "");
      setCtaText(data.ctaText ?? "");
      if (data.eventDate) setEventDate(data.eventDate);
      if (data.eventLocation) setEventLocation(data.eventLocation);
    } catch {
      setError("Error de conexión con IA");
    } finally {
      setGenerating(false);
    }
  };

  const handleSend = async () => {
    setShowConfirm(false);
    setSending(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/emails/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: title, body, templateFields: fields }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Error al enviar"); return; }
      setResult({ sent: data.sent, failed: data.failed });
    } catch {
      setError("Error de conexión");
    } finally {
      setSending(false);
    }
  };

  const handleReset = () => {
    setTemplate(null); setTitle(""); setBody(""); setBadge("");
    setCtaText(""); setCtaUrl("https://peruonice.com");
    setEventDate(""); setEventLocation(""); setIdea("");
  };

  if (result) {
    return (
      <div>
        <Header />
        <div className="bg-white rounded-2xl border border-ice-dark/40 shadow-sm p-8 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-dark mb-2">Envío completado</h3>
          <p className="text-sm text-dark-soft/60 mb-1">
            <span className="font-bold text-dark">{result.sent}</span> correos enviados
          </p>
          {result.failed > 0 && <p className="text-sm text-red-500 font-medium">{result.failed} fallaron</p>}
          <button onClick={() => router.push("/dashboard/emails")} className="mt-6 px-6 py-3 bg-burgundy text-white rounded-xl font-bold text-sm hover:bg-burgundy-dark transition-all">
            Volver a Correos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />

      {!generated ? (
        /* ───── PASO 1: Describe tu idea ───── */
        <div className="max-w-xl mx-auto">
          <div className="bg-gradient-to-br from-violet-50 via-fuchsia-50 to-pink-50 border border-violet-200/60 rounded-2xl p-6 md:p-8 space-y-5">
            <div className="text-center space-y-2">
              <div className="text-4xl">✨</div>
              <h3 className="text-lg font-bold text-dark">Crea tu correo con IA</h3>
              <p className="text-sm text-dark-soft/60">
                Solo describe tu idea y la IA creará un correo completo listo para enviar
              </p>
            </div>

            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="Ej: Quiero hacer un 2x1 en entradas este fin de semana para familias con niños, y que sepan que tenemos música en vivo el sábado..."
              rows={4}
              className="w-full px-4 py-3 border-2 border-violet-200 rounded-xl focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none transition-all bg-white text-dark placeholder:text-dark-soft/35 text-sm resize-none"
            />

            {error && (
              <p className="text-xs text-red-500 font-medium text-center">{error}</p>
            )}

            <button
              onClick={handleGenerate}
              disabled={generating || !idea.trim()}
              className="w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold rounded-xl hover:from-violet-700 hover:to-fuchsia-700 transition-all disabled:opacity-50 shadow-lg shadow-violet-500/25 text-sm flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                    <path d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" fill="currentColor" className="opacity-75" />
                  </svg>
                  La IA está creando tu correo...
                </>
              ) : "✨ Crear correo con IA"}
            </button>

            <p className="text-[10px] text-center text-dark-soft/30">
              Puedes editar todo después de generar
            </p>
          </div>
        </div>
      ) : (
        /* ───── PASO 2: Editar y enviar ───── */
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Left: Editable fields */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{TEMPLATES[template].icon}</span>
                <span className="text-sm font-bold text-dark">{TEMPLATES[template].label}</span>
                <span className="text-[10px] bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full font-bold">Generado con IA</span>
              </div>
              <button onClick={handleReset} className="text-xs text-burgundy font-bold hover:text-burgundy-dark transition-colors">
                Nueva idea
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-ice-dark/40 shadow-sm p-5 space-y-4">
              {/* Badge */}
              {(template === "promocion" || template === "especial") && badge && (
                <div>
                  <label className="block text-[10px] font-bold text-dark-soft/50 uppercase tracking-wider mb-1.5">Etiqueta</label>
                  <input type="text" value={badge} onChange={(e) => setBadge(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-ice-dark/40 rounded-xl focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy outline-none transition-all bg-frost text-dark text-sm" />
                </div>
              )}

              {/* Título */}
              <div>
                <label className="block text-[10px] font-bold text-dark-soft/50 uppercase tracking-wider mb-1.5">Asunto del correo</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-ice-dark/40 rounded-xl focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy outline-none transition-all bg-frost text-dark text-sm" />
              </div>

              {/* Evento fields */}
              {template === "evento" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-dark-soft/50 uppercase tracking-wider mb-1.5">Fecha</label>
                    <input type="text" value={eventDate} onChange={(e) => setEventDate(e.target.value)} placeholder="Ej: Sábado 22"
                      className="w-full px-4 py-2.5 border-2 border-ice-dark/40 rounded-xl focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy outline-none transition-all bg-frost text-dark text-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-dark-soft/50 uppercase tracking-wider mb-1.5">Lugar</label>
                    <input type="text" value={eventLocation} onChange={(e) => setEventLocation(e.target.value)} placeholder="Ej: Mall Aventura"
                      className="w-full px-4 py-2.5 border-2 border-ice-dark/40 rounded-xl focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy outline-none transition-all bg-frost text-dark text-sm" />
                  </div>
                </div>
              )}

              {/* Mensaje */}
              <div>
                <label className="block text-[10px] font-bold text-dark-soft/50 uppercase tracking-wider mb-1.5">Mensaje</label>
                <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={6}
                  className="w-full px-4 py-2.5 border-2 border-ice-dark/40 rounded-xl focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy outline-none transition-all bg-frost text-dark text-sm resize-none" />
              </div>

              {/* CTA */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-dark-soft/50 uppercase tracking-wider mb-1.5">Botón</label>
                  <input type="text" value={ctaText} onChange={(e) => setCtaText(e.target.value)} placeholder="Ej: Reservar ahora"
                    className="w-full px-4 py-2.5 border-2 border-ice-dark/40 rounded-xl focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy outline-none transition-all bg-frost text-dark text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-dark-soft/50 uppercase tracking-wider mb-1.5">Link del botón</label>
                  <input type="url" value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-ice-dark/40 rounded-xl focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy outline-none transition-all bg-frost text-dark text-sm" />
                </div>
              </div>
            </div>

            {/* Regenerar */}
            <button
              onClick={handleGenerate}
              disabled={generating || !idea.trim()}
              className="w-full py-2.5 border-2 border-violet-300 text-violet-600 font-bold rounded-xl text-xs hover:bg-violet-50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {generating ? "Regenerando..." : "✨ Regenerar con IA"}
            </button>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-red-600 text-sm text-center font-medium">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setShowPreview(true)}
                className="xl:hidden flex-1 py-3.5 border-2 border-burgundy text-burgundy font-bold rounded-2xl text-sm hover:bg-burgundy/5 transition-all">
                Vista previa
              </button>
              <button onClick={() => setShowConfirm(true)} disabled={!generated || sending}
                className="flex-1 py-3.5 bg-burgundy text-white font-bold rounded-2xl hover:bg-burgundy-dark transition-all disabled:opacity-50 shadow-lg shadow-burgundy/20 text-sm">
                {sending ? "Enviando..." : "Enviar a todos"}
              </button>
            </div>
          </div>

          {/* Right: Live Preview */}
          <div className="hidden xl:block">
            <p className="text-[10px] font-bold text-dark-soft/40 uppercase tracking-wider mb-3">Vista previa del correo</p>
            <div className="bg-gray-100 rounded-2xl p-4 border border-ice-dark/40 overflow-hidden">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-burgundy/10 flex items-center justify-center">
                    <span className="text-burgundy text-xs font-bold">PI</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-dark">Perú on Ice</p>
                    <p className="text-[10px] text-dark-soft/40">{title}</p>
                  </div>
                </div>
                <div className="[&_*]:!max-w-full overflow-auto max-h-[600px]"
                  style={{ transform: "scale(0.85)", transformOrigin: "top left", width: "117.6%" }}
                  dangerouslySetInnerHTML={{ __html: previewHtml }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Preview (mobile) */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b border-ice-dark/30 px-4 py-3 flex items-center justify-between">
              <p className="text-sm font-bold text-dark">Vista previa</p>
              <button onClick={() => setShowPreview(false)} className="text-dark-soft/50 hover:text-dark">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
          </div>
        </div>
      )}

      {/* Modal confirmación */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-dark text-center mb-2">¿Enviar correo masivo?</h3>
            <p className="text-sm text-dark-soft/60 text-center mb-6">
              Se enviará con la plantilla <span className="font-bold">{TEMPLATES[template!].label}</span> a todos los correos registrados.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="flex-1 py-3 border-2 border-ice-dark/40 text-dark-soft/70 rounded-xl font-bold hover:bg-frost transition-all">
                Cancelar
              </button>
              <button onClick={handleSend} className="flex-1 py-3 bg-burgundy text-white rounded-xl font-bold hover:bg-burgundy-dark transition-all">
                Sí, enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Header() {
  return (
    <div className="mb-8 flex items-center gap-4">
      <Link href="/dashboard/emails" className="inline-flex items-center gap-2 text-sm text-burgundy hover:text-burgundy-dark font-medium transition-colors">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Volver
      </Link>
      <div className="hidden sm:block w-px h-6 bg-ice-dark" />
      <h2 className="text-xl md:text-2xl font-bold text-dark">Enviar correo masivo</h2>
    </div>
  );
}
