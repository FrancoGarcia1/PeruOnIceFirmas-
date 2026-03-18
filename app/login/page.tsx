"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createSupabaseBrowser } from "@/lib/supabase-client";

type RoleView = "admin" | "caja";

export default function LoginPage() {
  const [roleView, setRoleView] = useState<RoleView>("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createSupabaseBrowser();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Credenciales incorrectas");
      setLoading(false);
      return;
    }

    const { data: { user: loggedUser } } = await supabase.auth.getUser();
    const role = loggedUser?.app_metadata?.role;
    router.push(role === "employee" ? "/caja" : "/dashboard");
    router.refresh();
  };

  const handleRoleSwitch = (role: RoleView) => {
    setRoleView(role);
    setEmail("");
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-frost relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-burgundy/5" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-ice-dark/30" />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-burgundy/3" />
      </div>

      <div className="w-full max-w-md relative z-10 px-4">
        {/* Logo + Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white shadow-lg mb-4">
            <Image
              src="/logo.png"
              alt="Perú on Ice"
              width={56}
              height={56}
              className="object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-dark">Perú on Ice</h1>
          <p className="text-dark-soft/60 text-sm mt-1">
            Sistema de Contratos
          </p>
        </div>

        {/* Role selector */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Admin card */}
          <button
            type="button"
            onClick={() => handleRoleSwitch("admin")}
            className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all duration-200 ${
              roleView === "admin"
                ? "bg-burgundy border-burgundy shadow-xl shadow-burgundy/25 scale-[1.02]"
                : "bg-white border-ice-dark/40 hover:border-burgundy/30 hover:shadow-md"
            }`}
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
              roleView === "admin" ? "bg-white/15" : "bg-burgundy/8"
            }`}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke={roleView === "admin" ? "white" : "#B22234"}
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div className="text-center">
              <p className={`text-sm font-bold leading-tight ${roleView === "admin" ? "text-white" : "text-dark"}`}>
                Administrador
              </p>
              <p className={`text-[10px] mt-0.5 font-medium ${roleView === "admin" ? "text-white/60" : "text-dark-soft/40"}`}>
                Acceso completo
              </p>
            </div>
          </button>

          {/* Caja card */}
          <button
            type="button"
            onClick={() => handleRoleSwitch("caja")}
            className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all duration-200 ${
              roleView === "caja"
                ? "bg-burgundy border-burgundy shadow-xl shadow-burgundy/25 scale-[1.02]"
                : "bg-white border-ice-dark/40 hover:border-burgundy/30 hover:shadow-md"
            }`}
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
              roleView === "caja" ? "bg-white/15" : "bg-burgundy/8"
            }`}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke={roleView === "caja" ? "white" : "#B22234"}
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21h8M12 17v4" />
              </svg>
            </div>
            <div className="text-center">
              <p className={`text-sm font-bold leading-tight ${roleView === "caja" ? "text-white" : "text-dark"}`}>
                Caja
              </p>
              <p className={`text-[10px] mt-0.5 font-medium ${roleView === "caja" ? "text-white/60" : "text-dark-soft/40"}`}>
                Vista de contratos
              </p>
            </div>
          </button>
        </div>

        {/* Login card */}
        <div className="bg-white rounded-2xl shadow-xl border border-ice-dark/30 p-6 md:p-8">
          <div className="w-full h-1 bg-gradient-to-r from-burgundy via-burgundy-light to-burgundy rounded-full -mt-4 mb-6 mx-auto max-w-[60%]" />

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-dark-soft uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-ice-dark/40 rounded-xl focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy outline-none transition-all bg-frost text-dark placeholder:text-dark-soft/40"
                placeholder={
                  roleView === "admin"
                    ? "admin@peruonice.com"
                    : "caja@usuarioperuonice.com"
                }
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-dark-soft uppercase tracking-wider mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-ice-dark/40 rounded-xl focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy outline-none transition-all bg-frost text-dark placeholder:text-dark-soft/40"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-red-600 text-sm text-center font-medium">
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-burgundy text-white font-bold rounded-xl hover:bg-burgundy-dark transition-all disabled:opacity-50 shadow-lg shadow-burgundy/20 hover:shadow-burgundy/30 active:scale-[0.98]"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                    <path d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" fill="currentColor" className="opacity-75" />
                  </svg>
                  Ingresando...
                </span>
              ) : (
                `Ingresar como ${roleView === "admin" ? "Administrador" : "Caja"}`
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-dark-soft/40 mt-6">
          Perú on Ice S.A.C. &middot; Sistema de Contratos
        </p>
      </div>
    </div>
  );
}
