import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import * as XLSX from "xlsx";

export async function GET() {
  const supabase = await createSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { data: emails } = await supabase
    .from("contract_emails")
    .select("email, created_at, contracts(adult_name, adult_dni, adult_age)")
    .order("created_at", { ascending: false });

  if (!emails || emails.length === 0) {
    return new Response("No hay correos para exportar", { status: 404 });
  }

  const rows = emails.map((row) => {
    const contract = row.contracts as unknown as { adult_name: string; adult_dni: string; adult_age: number | null } | null;
    const date = new Date(row.created_at).toLocaleString("es-PE", {
      timeZone: "America/Lima",
      day: "2-digit", month: "2-digit", year: "numeric",
    });
    return {
      Email: row.email,
      Nombre: contract?.adult_name ?? "",
      DNI: contract?.adult_dni ?? "",
      Edad: contract?.adult_age ?? "",
      "Fecha de registro": date,
    };
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);

  // Anchos de columna
  ws["!cols"] = [
    { wch: 30 }, // Email
    { wch: 35 }, // Nombre
    { wch: 12 }, // DNI
    { wch: 8 },  // Edad
    { wch: 18 }, // Fecha
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Correos");

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="correos-peru-on-ice.xlsx"`,
    },
  });
}
