import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";

export async function GET() {
  const supabase = await createSupabaseServer();

  // Verificar admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { data: emails } = await supabase
    .from("contract_emails")
    .select("email, created_at, contracts(adult_name, adult_dni)")
    .order("created_at", { ascending: false });

  if (!emails || emails.length === 0) {
    return new Response("No hay correos para exportar", { status: 404 });
  }

  const header = "Email,Nombre,DNI,Fecha de registro";
  const rows = emails.map((row) => {
    const contracts = row.contracts as { adult_name: string; adult_dni: string }[] | null;
    const contract = contracts?.[0] ?? null;
    const date = new Date(row.created_at).toLocaleString("es-PE", {
      timeZone: "America/Lima",
      day: "2-digit", month: "2-digit", year: "numeric",
    });
    return `"${row.email}","${contract?.adult_name ?? ""}","${contract?.adult_dni ?? ""}","${date}"`;
  });

  const csv = [header, ...rows].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="correos-peru-on-ice.csv"`,
    },
  });
}
