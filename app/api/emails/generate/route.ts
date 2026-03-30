import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { idea } = await req.json();

  if (!idea?.trim()) {
    return NextResponse.json({ error: "Describe tu idea" }, { status: 400 });
  }

  const prompt = `Eres un experto en email marketing especializado en negocios de entretenimiento familiar. Trabajas para "Perú on Ice", una pista de patinaje sobre hielo en Perú.

El administrador quiere enviar un correo masivo a sus clientes. Solo te ha dado esta idea:

"${idea.trim()}"

Tu trabajo es crear un correo COMPLETO que convierta. Debes generar TODOS estos campos:

1. **template**: Elige la mejor plantilla entre: "promocion" (descuentos, ofertas), "evento" (fechas especiales, shows), "informativo" (noticias, horarios), "especial" (celebraciones, temporadas)
2. **title**: Un asunto de email irresistible, máximo 60 caracteres. Debe generar curiosidad o urgencia.
3. **badge**: Una etiqueta corta y llamativa (ej: "50% OFF", "2x1", "GRATIS", "⭐ VIP", "🎄"). Si no aplica, déjalo vacío.
4. **body**: El cuerpo del correo. SIEMPRE empieza con "Hola {{nombre}}," (esto se reemplazará automáticamente con el nombre real del cliente). 3-5 párrafos cortos. Tono cercano, entusiasta, persuasivo. Español peruano natural. Incluye: gancho emocional, beneficio claro, sentido de urgencia. NO incluyas links, saludos formales al final, ni firma.
5. **ctaText**: Texto del botón de acción (ej: "Reservar ahora", "Quiero ir", "Ver horarios"). Corto y con verbo de acción.

RESPONDE SOLO CON UN JSON VÁLIDO, sin markdown, sin backticks, sin explicación. Ejemplo:
{"template":"promocion","title":"2x1 en entradas este fin de semana","badge":"2x1","body":"Párrafo 1\\n\\nPárrafo 2\\n\\nPárrafo 3","ctaText":"Reservar ahora"}`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-pro-preview" });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Limpiar posibles backticks de markdown
    const cleaned = text.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    const parsed = JSON.parse(cleaned);

    // Validar campos mínimos
    if (!parsed.template || !parsed.title || !parsed.body) {
      return NextResponse.json({ error: "La IA no generó un resultado válido. Intenta de nuevo." }, { status: 500 });
    }

    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ error: "Error generando el correo. Intenta de nuevo." }, { status: 500 });
  }
}
