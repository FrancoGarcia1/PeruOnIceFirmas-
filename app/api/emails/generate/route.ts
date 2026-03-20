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

  const { template, title, context } = await req.json();

  if (!template || !title?.trim()) {
    return NextResponse.json({ error: "Plantilla y título son obligatorios" }, { status: 400 });
  }

  const templateDescriptions: Record<string, string> = {
    promocion: "una promoción o descuento para atraer clientes a la pista de patinaje",
    evento: "un evento especial o fecha importante en la pista de patinaje",
    informativo: "un aviso informativo o noticia sobre la pista de patinaje",
    especial: "una celebración, temporada festiva o ocasión especial en la pista de patinaje",
  };

  const prompt = `Eres un experto en email marketing para negocios de entretenimiento familiar. Escribe el cuerpo de un correo electrónico para "Perú on Ice", una pista de patinaje sobre hielo en Perú.

REGLAS:
- Escribe SOLO el cuerpo del mensaje (sin asunto, sin saludo tipo "Estimado cliente")
- Máximo 4-5 párrafos cortos
- Tono cercano, entusiasta pero profesional
- Incluye un sentido de urgencia o exclusividad
- Usa emojis con moderación (1-2 máximo)
- Enfócate en la experiencia y la emoción, no solo en el precio
- Escribe en español peruano natural
- NO incluyas links ni URLs
- NO incluyas "Atentamente" ni firma al final

TIPO DE CORREO: ${templateDescriptions[template] ?? "comunicación general"}
TÍTULO/ASUNTO: ${title}
${context ? `CONTEXTO ADICIONAL: ${context}` : ""}

Escribe el mensaje ahora:`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ message: text.trim() });
  } catch {
    return NextResponse.json({ error: "Error generando el mensaje" }, { status: 500 });
  }
}
