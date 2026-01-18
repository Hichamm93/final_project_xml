import React, { useMemo, useState } from "react";
import logo from "../assets/logo.png";
import { clearAuth, setAuth } from "../api";
import AuthModal from "./AuthModal";

export default function Navbar({ route, go, user, setUser, toast }) {
  const [q, setQ] = useState("");
  const [authOpen, setAuthOpen] = useState(false);

  const links = useMemo(() => {
    const base = [
      { label: "Accueil", path: "/" },
      { label: "Programmation", path: "/program" }
    ];
    if (user?.role === "client") base.push({ label: "Mes résas", path: "/me" });
    if (user?.role === "proprio_film") base.push({ label: "Proprio Film", path: "/film-owner" });
    if (user?.role === "proprio_cinema") base.push({ label: "Proprio Cinéma", path: "/cinema-owner" });
    return base;
  }, [user]);

  const onSearch = (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    window.location.hash = `/?q=${encodeURIComponent(q.trim())}`;
  };

  const logout = () => {
    clearAuth();
    setUser(null); // ✅ update UI instantly
    toast("Déconnecté.");
    go("/");
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/90 to-black/30 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">
          <button onClick={() => go("/")} className="flex items-center gap-2">
            <img src={logo} alt="LouLa" className="h-12 w-12 object-contain" />
            <span className="font-semibold tracking-wide">LouLa Cinema</span>
          </button>

          <nav className="hidden md:flex items-center gap-4 text-sm text-zinc-200">
            {links.map((l) => (
              <button
                key={l.path}
                onClick={() => go(l.path)}
                className={`hover:text-white transition ${route === l.path ? "text-white" : ""}`}
              >
                {l.label}
              </button>
            ))}
          </nav>

          <div className="flex-1" />

          <form onSubmit={onSearch} className="hidden md:block">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher un film..."
              className="w-72 bg-zinc-900/70 border border-zinc-700 rounded-full px-4 py-2 text-sm outline-none focus:border-red-500"
            />
          </form>

          {!user ? (
            <button
              onClick={() => setAuthOpen(true)}
              className="px-4 py-2 rounded-full bg-red-600 hover:bg-red-500 transition text-sm font-medium shadow-glow"
            >
              Se connecter
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <div className="hidden md:block text-sm text-zinc-300">
                <div className="font-medium text-white">{user.display_name}</div>
                <div className="text-xs uppercase tracking-widest text-zinc-400">{user.role}</div>
              </div>
              <button
                onClick={logout}
                className="px-3 py-2 rounded-full bg-zinc-900 border border-zinc-700 hover:border-zinc-500 transition text-sm"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {authOpen && (
        <AuthModal
          onClose={() => setAuthOpen(false)}
          onAuthed={(auth) => {
            setAuth(auth);
            setUser(auth.user); // ✅ update UI instantly
            toast("Connecté ✅");
            setAuthOpen(false);
            go("/");
          }}
        />
      )}
    </>
  );
}
