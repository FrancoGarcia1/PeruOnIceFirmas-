"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TEMPLATES, generateEmailHtml, type TemplateName, type TemplateFields } from "@/lib/email-templates";

export default function ComposeEmailPage() {
  const [template, setTemplate] = useState<TemplateName | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [badge, setBadge] = useState("");
  const [ctaText, setCtaText] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [aiContext, setAiContext] = useState("");
  const router = useRouter();

  const fields: TemplateFields = {
    template: template ?? "informativo",
    title: title || "Tu título aquí",
    body: body || "Tu mensaje aquí...",
    badge,
    ctaText,
    ctaUrl,
    eventDate,
    eventLocation,
  };

  const previewHtml = template ? generateEmailHtml(fields) : "";

  const handleSend = async () => {
    setShowConfirm(false);
    setSending(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/emails/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: title,
          body,
          templateFields: fields,
        }),
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

  const canSend = template && title.trim().length > 0 && body.trim().length > 0;

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

      {/* Step 1: Elegir plantilla */}
      {!template ? (
        <div>
          <p className="text-sm text-dark-soft/60 mb-5">Elige una plantilla para tu correo:</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {(Object.entries(TEMPLATES) as [TemplateName, typeof TEMPLATES[TemplateName]][]).map(([key, t]) => (
              <button
                key={key}
                onClick={() => setTemplate(key)}
                className="group bg-white rounded-2xl border-2 border-ice-dark/40 hover:border-burgundy/50 p-5 text-center transition-all hover:shadow-lg hover:shadow-burgundy/10 hover:scale-[1.02]"
              >
                <div className="text-3xl mb-3">{t.icon}</div>
                <p className="text-sm font-bold text-dark mb-1">{t.label}</p>
                <p className="text-[11px] text-dark-soft/50">{t.description}</p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Left: Form */}
          <div className="space-y-4">
            {/* Template badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{TEMPLATES[template].icon}</span>
                <span className="text-sm font-bold text-dark">{TEMPLATES[template].label}</span>
              </div>
              <button
                onClick={() => { setTemplate(null); setTitle(""); setBody(""); setBadge(""); setCtaText(""); setCtaUrl(""); setEventDate(""); setEventLocation(""); }}
                className="text-xs text-burgundy font-bold hover:text-burgundy-dark transition-colors"
              >
                Cambiar plantilla
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-ice-dark/40 shadow-sm p-5 space-y-4">
              {/* Badge (Promoción y Especial) */}
              {(template === "promocion" || template === "especial") && (
                <div>
                  <label className="block text-[10px] font-bold text-dark-soft/50 uppercase tracking-wider mb-1.5">
                    {template === "promocion" ? "Etiqueta de oferta" : "Emoji o etiqueta"}
                  </label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder={template === "promocion" ? "Ej: 50% OFF" : "Ej: 🎄 o 🎂"}
                    className="w-full px-4 py-2.5 border-2 border-ice-dark/40 rounded-xl focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy outline-none transition-all bg-frost text-dark placeholder:text-dark-soft/40 text-sm"
                  />
                </div>
              )}

              {/* Título */}
              <div>
                <label className="block text-[10px] font-bold text-dark-soft/50 uppercase tracking-wider mb-1.5">
                  Título / Asunto
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Ven a disfrutar del hielo"
                  className="w-full px-4 py-2.5 border-2 border-ice-dark/40 rounded-xl focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy outline-none transition-all bg-frost text-dark placeholder:text-dark-soft/40 text-sm"
                />
              </div>

              {/* Evento: fecha y lugar */}
              {template === "evento" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-dark-soft/50 uppercase tracking-wider mb-1.5">Fecha</label>
                    <input
                      type="text"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      placeholder="Ej: Sábado 22 de Marzo"
                      className="w-full px-4 py-2.5 border-2 border-ice-dark/40 rounded-xl focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy outline-none transition-all bg-frost text-dark placeholder:text-dark-soft/40 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-dark-soft/50 uppercase tracking-wider mb-1.5">Lugar</label>
                    <input
                      type="text"
                      value={eventLocation}
                      onChange={(e) => setEventLocation(e.target.value)}
                      placeholder="Ej: Mall Aventura"
                      className="w-full px-4 py-2.5 border-2 border-ice-dark/40 rounded-xl focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy outline-none transition-all bg-frost text-dark placeholder:text-dark-soft/40 text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Generador IA */}
              <div className="bg-gradient-to-r from-violet-50 to-fuchsia-50 border border-violet-200/60 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm">✨</span>
                  <p className="text-xs font-bold text-violet-700">Generar mensaje con IA</p>
                </div>
                <input
                  type="text"
                  value={aiContext}
                  onChange={(e) => setAiContext(e.target.value)}
                  placeholder="Contexto extra (opcional): Ej: 2x1 en entrada, válido solo este fin de semana"
                  className="w-full px-3 py-2 border border-violet-200 rounded-lg focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none transition-all bg-white text-dark placeholder:text-dark-soft/40 text-xs"
                />
                <button
                  type="button"
                  onClick={async () => {
                    if (!title.trim()) { setError("Escribe un título primero"); return; }
                    setGenerating(true);
                    setError(null);
                    try {
                      const res = await fetch("/api/emails/generate", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ template, title, context: aiContext }),
                      });
                      const data = await res.json();
                      if (!res.ok) { setError(data.error); return; }
                      setBody(data.message);
                    } catch { setError("Error de conexión con IA"); }
                    finally { setGenerating(false); }
                  }}
                  disabled={generating || !title.trim()}
                  className="w-full py-2.5 bg-violet-600 text-white rounded-lg text-xs font-bold hover:bg-violet-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {generating ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                        <path d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" fill="currentColor" className="opacity-75" />
                      </svg>
                      Generando...
                    </>
                  ) : "✨ Generar mensaje"}
                </button>
              </div>

              {/* Mensaje */}
              <div>
                <label className="block text-[10px] font-bold text-dark-soft/50 uppercase tracking-wider mb-1.5">Mensaje</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Escribe el contenido o genera uno con IA..."
                  rows={5}
                  className="w-full px-4 py-2.5 border-2 border-ice-dark/40 rounded-xl focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy outline-none transition-all bg-frost text-dark placeholder:text-dark-soft/40 text-sm resize-none"
                />
              </div>

              {/* CTA */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-dark-soft/50 uppercase tracking-wider mb-1.5">
                    Botón (opcional)
                  </label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="Ej: Reservar ahora"
                    className="w-full px-4 py-2.5 border-2 border-ice-dark/40 rounded-xl focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy outline-none transition-all bg-frost text-dark placeholder:text-dark-soft/40 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-dark-soft/50 uppercase tracking-wider mb-1.5">
                    Link del botón
                  </label>
                  <input
                    type="url"
                    value={ctaUrl}
                    onChange={(e) => setCtaUrl(e.target.value)}
                    placeholder="https://peruonice.com"
                    className="w-full px-4 py-2.5 border-2 border-ice-dark/40 rounded-xl focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy outline-none transition-all bg-frost text-dark placeholder:text-dark-soft/40 text-sm"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-red-600 text-sm text-center font-medium">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              {/* Preview mobile */}
              <button
                onClick={() => setShowPreview(true)}
                className="xl:hidden flex-1 py-3.5 border-2 border-burgundy text-burgundy font-bold rounded-2xl text-sm hover:bg-burgundy/5 transition-all"
              >
                Vista previa
              </button>
              <button
                onClick={() => setShowConfirm(true)}
                disabled={!canSend || sending}
                className="flex-1 py-3.5 bg-burgundy text-white font-bold rounded-2xl hover:bg-burgundy-dark transition-all disabled:opacity-50 shadow-lg shadow-burgundy/20 text-sm"
              >
                {sending ? "Enviando..." : "Enviar a todos"}
              </button>
            </div>
          </div>

          {/* Right: Live Preview (desktop) */}
          <div className="hidden xl:block">
            <p className="text-[10px] font-bold text-dark-soft/40 uppercase tracking-wider mb-3">Vista previa del correo</p>
            <div className="bg-gray-100 rounded-2xl p-4 border border-ice-dark/40 overflow-hidden">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Fake email header */}
                <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-burgundy/10 flex items-center justify-center">
                    <span className="text-burgundy text-xs font-bold">PI</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-dark">Perú on Ice</p>
                    <p className="text-[10px] text-dark-soft/40">{title || "Asunto del correo"}</p>
                  </div>
                </div>
                {/* Email content */}
                <div
                  className="[&_*]:!max-w-full overflow-auto max-h-[600px]"
                  style={{ transform: "scale(0.85)", transformOrigin: "top left", width: "117.6%" }}
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
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
