import React, { useEffect, useMemo, useState } from "react";
import { api, getUser } from "../api";

export default function Movie({ id, go, toast }) {
  const [data, setData] = useState(null);
  const [seats, setSeats] = useState(1);
  const [loading, setLoading] = useState(false);
  const user = useMemo(() => getUser(), []);

  // garde-fou id invalide
  if (!Number.isFinite(Number(id))) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10 text-zinc-300">
        <div className="text-xl font-semibold">Film introuvable</div>
        <div className="mt-2 text-zinc-400">Identifiant invalide.</div>
        <button
          onClick={() => go("/")}
          className="mt-5 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-zinc-500 transition"
        >
          Retour accueil
        </button>
      </div>
    );
  }

  const load = async () => {
    const d = await api.filmDetail(id);
    setData(d);
  };

  useEffect(() => {
    (async () => {
      try {
        await load();
      } catch (e) {
        toast(e.message);
      }
    })();
  }, [id]);

  const reserve = async (screening_id) => {
    if (!user) return toast("Connecte-toi en client pour réserver.");
    if (user.role !== "client") return toast("Seuls les clients peuvent réserver.");

    setLoading(true);
    try {
      await api.reserve({ screening_id, seats: Number(seats) });
      toast("Réservation confirmée ✅");
      await load(); // refresh places
    } catch (e) {
      toast(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!data) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10 text-zinc-400">
        Chargement…
      </div>
    );
  }

  const { film, screenings_by_city } = data;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <button onClick={() => go("/")} className="text-sm text-zinc-300 hover:text-white">
        ← Retour
      </button>

      <div className="mt-5 grid md:grid-cols-[220px,1fr] gap-6">
        <div className="rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 aspect-[2/3]">
          {film.poster_url ? (
            <img src={film.poster_url} alt={film.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-500">
              No poster
            </div>
          )}
        </div>

        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold">{film.title}</h1>
          <div className="mt-2 text-sm text-zinc-400">
            {film.release_year} • {film.duration_min} min • {film.genres} • {film.language}
          </div>

          <p className="mt-4 text-zinc-200 leading-relaxed">{film.synopsis}</p>

          <div className="mt-6 flex items-center gap-3">
            <div className="text-sm text-zinc-300">Places</div>
            <input
              type="number"
              min="1"
              value={seats}
              onChange={(e) => setSeats(e.target.value)}
              className="w-24 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-red-500"
            />
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold">Séances (par ville)</h2>

            {Object.keys(screenings_by_city).length === 0 && (
              <div className="mt-4 text-zinc-400">
                Aucune séance à venir pour ce film.  
                <div className="mt-2 text-sm">
                  👉 Il faut qu’un **proprio cinéma** le programme d’abord.
                </div>
              </div>
            )}

            <div className="mt-4 space-y-6">
              {Object.entries(screenings_by_city).map(([city, screenings]) => (
                <div key={city} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                  <div className="font-semibold text-lg">{city}</div>
                  <div className="mt-3 grid md:grid-cols-2 gap-3">
                    {screenings.map((s) => {
                      const dt = new Date(s.starts_at);
                      const remaining = s.total_seats - s.booked_seats;

                      return (
                        <div key={s.id} className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="font-medium">{s.cinema.name}</div>
                              <div className="text-xs text-zinc-400">
                                {s.cinema.address} • {s.room}
                              </div>
                              <div className="mt-2 text-sm">
                                {dt.toLocaleString()} • {(s.price_cents / 100).toFixed(2)}€
                              </div>
                              <div className="text-xs text-zinc-400 mt-1">
                                Places restantes: {remaining}
                              </div>
                            </div>

                            <button
                              disabled={loading || remaining <= 0}
                              onClick={() => reserve(s.id)}
                              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 transition text-sm font-semibold disabled:opacity-60"
                            >
                              Réserver
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
      <div className="h-10" />
    </div>
  );
}
