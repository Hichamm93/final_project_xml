import React, { useState } from "react";
import { api } from "../api";

export default function AuthModal({ onClose, onAuthed }) {
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [display, setDisplay] = useState("");
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setErr(null);
    setLoading(true);
    try {
      if (tab === "login") {
        const auth = await api.login({ email, password });
        onAuthed(auth);
      } else {
        const auth = await api.registerClient({ email, password, display_name: display });
        onAuthed(auth);
      }
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] bg-black/70 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-zinc-950 border border-zinc-800 shadow-xl overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between border-b border-zinc-800">
          <div className="font-semibold">Authentification</div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">✕</button>
        </div>

        <div className="p-5">
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setTab("login")}
              className={`flex-1 py-2 rounded-xl text-sm border ${tab==="login" ? "bg-zinc-900 border-zinc-700" : "border-zinc-800 text-zinc-400"}`}
            >
              Connexion
            </button>
            <button
              onClick={() => setTab("register")}
              className={`flex-1 py-2 rounded-xl text-sm border ${tab==="register" ? "bg-zinc-900 border-zinc-700" : "border-zinc-800 text-zinc-400"}`}
            >
              Créer compte client
            </button>
          </div>

          {tab === "register" && (
            <input
              value={display}
              onChange={(e) => setDisplay(e.target.value)}
              placeholder="Nom affiché"
              className="w-full mb-3 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-red-500"
            />
          )}

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full mb-3 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-red-500"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            type="password"
            className="w-full mb-3 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-red-500"
          />

          {err && <div className="text-sm text-red-400 mb-3">{err}</div>}

          <button
            disabled={loading}
            onClick={submit}
            className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 transition font-medium shadow-glow disabled:opacity-60"
          >
            {loading ? "..." : tab === "login" ? "Se connecter" : "Créer le compte"}
          </button>

        </div>
      </div>
    </div>
  );
}
