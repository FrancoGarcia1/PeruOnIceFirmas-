export interface TemplateFields {
  template: TemplateName;
  title: string;
  body: string;
  badge?: string;
  ctaText?: string;
  ctaUrl?: string;
  eventDate?: string;
  eventLocation?: string;
}

export type TemplateName = "promocion" | "evento" | "informativo" | "especial";

export const TEMPLATES: Record<TemplateName, { label: string; description: string; icon: string; color: string }> = {
  promocion: { label: "Promoción", description: "Descuentos, ofertas, 2x1", icon: "🏷️", color: "#B22234" },
  evento: { label: "Evento", description: "Fechas especiales, shows", icon: "🎉", color: "#7C3AED" },
  informativo: { label: "Informativo", description: "Noticias, horarios, avisos", icon: "📢", color: "#0369A1" },
  especial: { label: "Especial", description: "Fiestas, temporadas, celebraciones", icon: "⭐", color: "#D97706" },
};

const HEADER = `
<div style="text-align: center; padding: 28px 24px 20px;">
  <h1 style="color: #B22234; font-size: 22px; margin: 0; font-weight: 800; letter-spacing: 0.5px;">PERÚ ON ICE</h1>
  <p style="color: #9ca3af; font-size: 11px; margin: 6px 0 0; letter-spacing: 2px; text-transform: uppercase;">Pista de patinaje sobre hielo</p>
</div>`;

const FOOTER = `
<div style="text-align: center; padding: 24px; border-top: 1px solid #e5e7eb;">
  <p style="color: #9ca3af; font-size: 11px; margin: 0 0 4px;">Perú on Ice S.A.C.</p>
  <p style="color: #d1d5db; font-size: 10px; margin: 0;">Si no deseas recibir más correos, responde con "DESUSCRIBIR"</p>
</div>`;

function wrap(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
      ${content}
    </div>
    ${FOOTER}
  </div>
</body>
</html>`;
}

function bodyToHtml(text: string): string {
  return text
    .trim()
    .split("\n")
    .map((line) => `<p style="color: #374151; font-size: 15px; line-height: 1.7; margin: 0 0 12px;">${line || "&nbsp;"}</p>`)
    .join("");
}

function ctaButton(text: string, url: string, color: string): string {
  return `
<div style="text-align: center; padding: 8px 0 16px;">
  <a href="${url}" style="display: inline-block; background: ${color}; color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 12px; font-size: 15px; font-weight: 700; letter-spacing: 0.3px;">${text}</a>
</div>`;
}

export function generatePromocion(fields: TemplateFields): string {
  return wrap(`
    ${HEADER}
    <div style="background: linear-gradient(135deg, #B22234 0%, #8B1A2B 100%); padding: 32px 24px; text-align: center;">
      ${fields.badge ? `<div style="display: inline-block; background: #ffffff; color: #B22234; font-size: 28px; font-weight: 900; padding: 8px 24px; border-radius: 12px; margin-bottom: 16px; letter-spacing: 1px;">${fields.badge}</div>` : ""}
      <h2 style="color: #ffffff; font-size: 26px; margin: 0; font-weight: 800; line-height: 1.3;">${fields.title}</h2>
    </div>
    <div style="padding: 28px 24px;">
      ${bodyToHtml(fields.body)}
      ${fields.ctaText && fields.ctaUrl ? ctaButton(fields.ctaText, fields.ctaUrl, "#B22234") : ""}
    </div>
  `);
}

export function generateEvento(fields: TemplateFields): string {
  return wrap(`
    ${HEADER}
    <div style="background: linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%); padding: 32px 24px; text-align: center;">
      <h2 style="color: #ffffff; font-size: 24px; margin: 0 0 16px; font-weight: 800; line-height: 1.3;">${fields.title}</h2>
      ${fields.eventDate ? `
      <div style="display: inline-block; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.25); border-radius: 12px; padding: 12px 20px; margin-top: 4px;">
        <p style="color: rgba(255,255,255,0.7); font-size: 10px; margin: 0 0 2px; text-transform: uppercase; letter-spacing: 2px;">Fecha</p>
        <p style="color: #ffffff; font-size: 16px; margin: 0; font-weight: 700;">${fields.eventDate}</p>
        ${fields.eventLocation ? `<p style="color: rgba(255,255,255,0.8); font-size: 13px; margin: 6px 0 0;">📍 ${fields.eventLocation}</p>` : ""}
      </div>` : ""}
    </div>
    <div style="padding: 28px 24px;">
      ${bodyToHtml(fields.body)}
      ${fields.ctaText && fields.ctaUrl ? ctaButton(fields.ctaText, fields.ctaUrl, "#7C3AED") : ""}
    </div>
  `);
}

export function generateInformativo(fields: TemplateFields): string {
  return wrap(`
    ${HEADER}
    <div style="padding: 4px 24px 0;">
      <div style="height: 3px; background: linear-gradient(90deg, #B22234, #D4424F, #B22234); border-radius: 2px;"></div>
    </div>
    <div style="padding: 28px 24px;">
      <h2 style="color: #1A1A2E; font-size: 22px; margin: 0 0 20px; font-weight: 800; line-height: 1.3;">${fields.title}</h2>
      ${bodyToHtml(fields.body)}
      ${fields.ctaText && fields.ctaUrl ? ctaButton(fields.ctaText, fields.ctaUrl, "#1A1A2E") : ""}
    </div>
  `);
}

export function generateEspecial(fields: TemplateFields): string {
  return wrap(`
    ${HEADER}
    <div style="background: linear-gradient(135deg, #D97706 0%, #B45309 100%); padding: 36px 24px; text-align: center;">
      ${fields.badge ? `<div style="font-size: 48px; margin-bottom: 12px;">${fields.badge}</div>` : `<div style="font-size: 48px; margin-bottom: 12px;">⭐</div>`}
      <h2 style="color: #ffffff; font-size: 26px; margin: 0; font-weight: 800; line-height: 1.3;">${fields.title}</h2>
    </div>
    <div style="padding: 28px 24px;">
      ${bodyToHtml(fields.body)}
      ${fields.ctaText && fields.ctaUrl ? ctaButton(fields.ctaText, fields.ctaUrl, "#D97706") : ""}
    </div>
  `);
}

export function generateEmailHtml(fields: TemplateFields): string {
  switch (fields.template) {
    case "promocion": return generatePromocion(fields);
    case "evento": return generateEvento(fields);
    case "informativo": return generateInformativo(fields);
    case "especial": return generateEspecial(fields);
  }
}
