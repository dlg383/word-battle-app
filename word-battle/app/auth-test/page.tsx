"use client";

import { FormEvent, useEffect, useState } from "react";

type MeResponse =
  | { user: null }
  | { user: { id: string; email: string; name: string } };

function pretty(obj: any) {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return String(obj);
  }
}

export default function AuthTestPage() {
  const [tab, setTab] = useState<"register" | "login">("register");

  // session
  const [meLoading, setMeLoading] = useState(false);
  const [me, setMe] = useState<MeResponse | null>(null);
  const [meError, setMeError] = useState<string | null>(null);

  // register
  const [rName, setRName] = useState("");
  const [rEmail, setREmail] = useState("");
  const [rPassword, setRPassword] = useState("");
  const [rLoading, setRLoading] = useState(false);

  // login
  const [lEmail, setLEmail] = useState("");
  const [lPassword, setLPassword] = useState("");
  const [lLoading, setLLoading] = useState(false);

  // last response
  const [lastOk, setLastOk] = useState<string | null>(null);
  const [lastErr, setLastErr] = useState<string | null>(null);
  const [lastJson, setLastJson] = useState<any>(null);

  const loadMe = async () => {
    setMeLoading(true);
    setMeError(null);
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      setMe(data);
    } catch (e: any) {
      setMeError(e?.message || "Error al cargar /api/auth/me");
      setMe(null);
    } finally {
      setMeLoading(false);
    }
  };

  useEffect(() => {
    loadMe();
  }, []);

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setLastOk(null);
    setLastErr(null);
    setLastJson(null);

    setRLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: rName, email: rEmail, password: rPassword }),
      });

      const data = await res.json().catch(() => ({}));
      setLastJson(data);

      if (!res.ok) {
        throw new Error(data?.error || data?.message || `Error ${res.status}`);
      }

      setLastOk("Registro OK (cookie de sesión creada)");
      setRName("");
      setREmail("");
      setRPassword("");
      await loadMe();
    } catch (e: any) {
      setLastErr(e?.message || "Error en register");
    } finally {
      setRLoading(false);
    }
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLastOk(null);
    setLastErr(null);
    setLastJson(null);

    setLLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: lEmail, password: lPassword }),
      });

      const data = await res.json().catch(() => ({}));
      setLastJson(data);

      if (!res.ok) {
        throw new Error(data?.error || data?.message || `Error ${res.status}`);
      }

      setLastOk("Login OK (cookie de sesión creada)");
      setLPassword("");
      await loadMe();
    } catch (e: any) {
      setLastErr(e?.message || "Error en login");
    } finally {
      setLLoading(false);
    }
  };

  const handleLogout = async () => {
    setLastOk(null);
    setLastErr(null);
    setLastJson(null);

    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      setLastJson(data);

      if (!res.ok) throw new Error(data?.error || data?.message || `Error ${res.status}`);

      setLastOk("Logout OK (cookie borrada)");
      await loadMe();
    } catch (e: any) {
      setLastErr(e?.message || "Error en logout");
    }
  };

  const user = (me as any)?.user ?? null;

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-10 font-sans text-zinc-900">
      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold">Pruebas Auth</h1>
          <p className="text-sm text-zinc-600">
            Endpoints: POST /api/auth/register, POST /api/auth/login, GET /api/auth/me, POST /api/auth/logout
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          {/* Session card */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xl font-semibold">Sesión actual</h2>
              <button
                onClick={loadMe}
                className="rounded-lg border border-zinc-300 px-3 py-1 text-xs font-medium transition hover:bg-zinc-100"
              >
                Refrescar
              </button>
            </div>

            <div className="mt-4">
              {meLoading && <p className="text-sm text-zinc-600">Cargando /me...</p>}
              {meError && <p className="text-sm text-red-600">{meError}</p>}

              {!meLoading && !meError && (
                <>
                  {user ? (
                    <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm">
                      <div>
                        <strong>ID:</strong> {user.id}
                      </div>
                      <div>
                        <strong>Nombre:</strong> {user.name}
                      </div>
                      <div>
                        <strong>Email:</strong> {user.email}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-600">No hay sesión (user: null)</p>
                  )}

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={handleLogout}
                      disabled={!user}
                      className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
                    >
                      Logout
                    </button>
                    <span className="self-center text-xs text-zinc-500">
                      (La cookie es httpOnly: no se ve en JS, pero el navegador la envía)
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Auth form card */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">Acciones</h2>
              <div className="flex overflow-hidden rounded-lg border border-zinc-200">
                <button
                  onClick={() => setTab("register")}
                  className={`px-3 py-1 text-sm transition ${
                    tab === "register" ? "bg-black text-white" : "bg-white hover:bg-zinc-100"
                  }`}
                >
                  Register
                </button>
                <button
                  onClick={() => setTab("login")}
                  className={`px-3 py-1 text-sm transition ${
                    tab === "login" ? "bg-black text-white" : "bg-white hover:bg-zinc-100"
                  }`}
                >
                  Login
                </button>
              </div>
            </div>

            {tab === "register" ? (
              <form className="mt-4 flex flex-col gap-3" onSubmit={handleRegister}>
                <label className="flex flex-col gap-1 text-sm">
                  Nombre
                  <input
                    className="rounded-lg border border-zinc-300 px-3 py-2 text-base outline-none focus:border-zinc-500"
                    value={rName}
                    onChange={(e) => setRName(e.target.value)}
                    required
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  Email
                  <input
                    className="rounded-lg border border-zinc-300 px-3 py-2 text-base outline-none focus:border-zinc-500"
                    type="email"
                    value={rEmail}
                    onChange={(e) => setREmail(e.target.value)}
                    required
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  Password (min 8)
                  <input
                    className="rounded-lg border border-zinc-300 px-3 py-2 text-base outline-none focus:border-zinc-500"
                    type="password"
                    value={rPassword}
                    onChange={(e) => setRPassword(e.target.value)}
                    required
                  />
                </label>
                <button
                  type="submit"
                  disabled={rLoading}
                  className="mt-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
                >
                  {rLoading ? "Creando..." : "Crear cuenta"}
                </button>
              </form>
            ) : (
              <form className="mt-4 flex flex-col gap-3" onSubmit={handleLogin}>
                <label className="flex flex-col gap-1 text-sm">
                  Email
                  <input
                    className="rounded-lg border border-zinc-300 px-3 py-2 text-base outline-none focus:border-zinc-500"
                    type="email"
                    value={lEmail}
                    onChange={(e) => setLEmail(e.target.value)}
                    required
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  Password
                  <input
                    className="rounded-lg border border-zinc-300 px-3 py-2 text-base outline-none focus:border-zinc-500"
                    type="password"
                    value={lPassword}
                    onChange={(e) => setLPassword(e.target.value)}
                    required
                  />
                </label>
                <button
                  type="submit"
                  disabled={lLoading}
                  className="mt-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
                >
                  {lLoading ? "Entrando..." : "Login"}
                </button>
              </form>
            )}

            {lastOk && <p className="mt-3 text-sm text-emerald-600">{lastOk}</p>}
            {lastErr && <p className="mt-3 text-sm text-red-600">{lastErr}</p>}
          </div>
        </section>

        {/* Last response */}
        <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-xl font-semibold">Última respuesta (debug)</h2>
            <button
              onClick={() => {
                setLastOk(null);
                setLastErr(null);
                setLastJson(null);
              }}
              className="rounded-lg border border-zinc-300 px-3 py-1 text-xs font-medium transition hover:bg-zinc-100"
            >
              Limpiar
            </button>
          </div>

          <pre className="mt-4 overflow-auto rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs">
            {lastJson ? pretty(lastJson) : "—"}
          </pre>
        </section>
      </div>
    </div>
  );
}
