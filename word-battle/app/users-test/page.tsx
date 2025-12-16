"use client";

import { FormEvent, useEffect, useState } from "react";

interface User {
    id: string;
    name: string;
    email: string;
}

export default function UsersTestPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loadingList, setLoadingList] = useState(false);
    const [listError, setListError] = useState<string | null>(null);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [createMsg, setCreateMsg] = useState<string | null>(null);
    const [createError, setCreateError] = useState<string | null>(null);

    const [userId, setUserId] = useState("");
    const [userById, setUserById] = useState<User | null>(null);
    const [getError, setGetError] = useState<string | null>(null);

    const loadUsers = async () => {
        setLoadingList(true);
        setListError(null);
        try {
            const res = await fetch("/api/users");
            if (!res.ok) {
                throw new Error(`Error ${res.status}`);
            }
            const data = await res.json();
            setUsers(
                (data || []).map((u: any) => ({
                    id: u._id || u.id,
                    name: u.name,
                    email: u.email,
                })),
            );
        } catch (err: any) {
            setListError(err.message || "Error loading users");
        } finally {
            setLoadingList(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleCreate = async (e: FormEvent) => {
        e.preventDefault();
        setCreateMsg(null);
        setCreateError(null);
        try {
            const res = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.message || "Error creating user");
            }
            setCreateMsg(`Creado: ${data.email}`);
            setName("");
            setEmail("");
            setPassword("");
            loadUsers();
        } catch (err: any) {
            setCreateError(err.message || "Error creating user");
        }
    };

    const handleGetById = async () => {
        setGetError(null);
        setUserById(null);
        if (!userId.trim()) {
            setGetError("Ingresa un id");
            return;
        }
        try {
            const res = await fetch(`/api/users/${userId.trim()}`);
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.message || "Error fetching user");
            }
            setUserById({ id: data.id, name: data.name, email: data.email });
        } catch (err: any) {
            setGetError(err.message || "Error fetching user");
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 px-6 py-10 font-sans text-zinc-900">
            <div className="mx-auto flex max-w-5xl flex-col gap-10">
                <header className="flex flex-col gap-2">
                    <h1 className="text-3xl font-semibold">Pruebas API de usuarios</h1>
                    <p className="text-sm text-zinc-600">Endpoints: GET /api/users, POST /api/users, GET /api/users/:id</p>
                </header>

                <section className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
                        <h2 className="text-xl font-semibold">Crear usuario</h2>
                        <form className="mt-4 flex flex-col gap-3" onSubmit={handleCreate}>
                            <label className="flex flex-col gap-1 text-sm">
                                Nombre
                                <input
                                    className="rounded-lg border border-zinc-300 px-3 py-2 text-base outline-none focus:border-zinc-500"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </label>
                            <label className="flex flex-col gap-1 text-sm">
                                Email
                                <input
                                    className="rounded-lg border border-zinc-300 px-3 py-2 text-base outline-none focus:border-zinc-500"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </label>
                            <label className="flex flex-col gap-1 text-sm">
                                Password
                                <input
                                    className="rounded-lg border border-zinc-300 px-3 py-2 text-base outline-none focus:border-zinc-500"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </label>
                            <button
                                type="submit"
                                className="mt-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
                            >
                                Crear
                            </button>
                        </form>
                        {createMsg && <p className="mt-3 text-sm text-emerald-600">{createMsg}</p>}
                        {createError && <p className="mt-3 text-sm text-red-600">{createError}</p>}
                    </div>

                    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
                        <h2 className="text-xl font-semibold">GET /api/users/:id</h2>
                        <div className="mt-4 flex flex-col gap-3">
                            <label className="flex flex-col gap-1 text-sm">
                                User id
                                <input
                                    className="rounded-lg border border-zinc-300 px-3 py-2 text-base outline-none focus:border-zinc-500"
                                    value={userId}
                                    onChange={(e) => setUserId(e.target.value)}
                                    placeholder="64f..."
                                />
                            </label>
                            <button
                                onClick={handleGetById}
                                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
                            >
                                Consultar
                            </button>
                            {userById && (
                                <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm">
                                    <div><strong>ID:</strong> {userById.id}</div>
                                    <div><strong>Nombre:</strong> {userById.name}</div>
                                    <div><strong>Email:</strong> {userById.email}</div>
                                </div>
                            )}
                            {getError && <p className="text-sm text-red-600">{getError}</p>}
                        </div>
                    </div>
                </section>

                <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-2">
                        <h2 className="text-xl font-semibold">GET /api/users</h2>
                        <button
                            onClick={loadUsers}
                            className="rounded-lg border border-zinc-300 px-3 py-1 text-xs font-medium transition hover:bg-zinc-100"
                        >
                            Recargar
                        </button>
                    </div>
                    <div className="mt-4">
                        {loadingList && <p className="text-sm text-zinc-600">Cargando...</p>}
                        {listError && <p className="text-sm text-red-600">{listError}</p>}
                        {!loadingList && !listError && (
                            <ul className="divide-y divide-zinc-200 text-sm">
                                {users.length === 0 && (
                                    <li className="py-3 text-zinc-500">Sin usuarios</li>
                                )}
                                {users.map((u) => (
                                    <li key={u.id} className="flex flex-col gap-1 py-3">
                                        <span className="font-medium">{u.name}</span>
                                        <span className="text-zinc-600">{u.email}</span>
                                        <span className="text-[11px] text-zinc-500">{u.id}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
