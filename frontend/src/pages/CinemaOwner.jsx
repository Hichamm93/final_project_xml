import React, { useEffect, useMemo, useState } from "react";
import { api, getUser } from "../api";

export default function CinemaOwner({ toast }) {
  const user = useMemo(() => getUser(), []);
  const [cinemas, setCinemas] = useState([]);
  const [films, setFilms] = useState([]);
  const [cinemaId, setCinemaId] = useState(null);

  const [form, setForm] = useState({
    film_id: "",
    starts_at: "",
    room: "Salle 1",
    price_cents: 1200,
    total_seats: 80
  });

  const load = async () => {
    const c = await api.myCinemas();
    setCinemas(c);
    setCinemaId(c[0]?.id || null);
    const f = await api.films();
    setFilms(f);
  };

  useEffect(() => {
    (async () => {
      try {
        if (!user) return;
        if (user.role !== "proprio_cinema") return;
        await load();
      } catch (e) {
        toast(e.message);
      }
    })();
  }, []);

  if (!user) return <div className="max-w-6xl mx-auto px-4 py-10 text-zinc-300">Connecte-toi.</div>;
  if (user.role !== "proprio_cinema") return <div className="max-w-6xl mx-auto px-4 py-10 text-zinc-300">Accès proprio cinéma uniquement.</div>;

  const create = async () => {
    try {
      if (!cinemaId) return toast("Aucun cinéma.");
      if (!form.film_id) return toast("Choisis un film.");
      if (!form.starts_at) return toast("Choisis une date.");
      await api.cinemaCreateScreening({
        cinema_id: Number(cinemaId),
        film_id: Number(form.film_id),
        starts_at: new Date(form.starts_at).toISOString(),
        room: form.room,
        price_cents: Number(form.price_cents),
        total_seats: Number(form.total_seats)
      });
      toast("Programmation ajoutée ✅");
    } catch (e) {
      toast(e.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-extrabold">Espace Proprio Cinéma</h1>

      <div className="mt-6 p-5 rounded-2xl border border-zinc-800 bg-zinc-950">
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <div className="text-sm text-zinc-300 mb-2">Mon cinéma</div>
            <select
              value={cinemaId || ""}
              onChange={(e) => setCinemaId(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3"
            >
              {cinemas.map((c) => (
                <option key={c.id} value={c.id}>{c.city.name} • {c.name}</option>
              ))}
            </select>
            {cinemas.length === 0 && <div className="text-sm text-zinc-400 mt-2">Aucun cinéma en base.</div>}
          </div>

          <div>
            <div className="text-sm text-zinc-300 mb-2">Film disponible</div>
            <select
              value={form.film_id}
              onChange={(e)=>setForm({...form, film_id: e.target.value})}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3"
            >
              <option value="">— choisir —</option>
              {films.map((f)=> <option key={f.id} value={f.id}>{f.title} ({f.release_year})</option>)}
            </select>
          </div>

          <div>
            <div className="text-sm text-zinc-300 mb-2">Date / heure</div>
            <input
              type="datetime-local"
              value={form.starts_at}
              onChange={(e)=>setForm({...form, starts_at: e.target.value})}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3"
            />
          </div>

          <div>
            <div className="text-sm text-zinc-300 mb-2">Salle</div>
            <input
              value={form.room}
              onChange={(e)=>setForm({...form, room: e.target.value})}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3"
            />
          </div>

          <div>
            <div className="text-sm text-zinc-300 mb-2">Prix (centimes)</div>
            <input
              type="number"
              value={form.price_cents}
              onChange={(e)=>setForm({...form, price_cents: e.target.value})}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3"
            />
          </div>

          <div>
            <div className="text-sm text-zinc-300 mb-2">Places totales</div>
            <input
              type="number"
              value={form.total_seats}
              onChange={(e)=>setForm({...form, total_seats: e.target.value})}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3"
            />
          </div>
        </div>

        <button onClick={create} className="mt-4 w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 font-semibold shadow-glow">
          Programmer
        </button>

        <div className="mt-4 text-xs text-zinc-400">
          Programmez vos films dan svotre cinéma 
        </div>
      </div>
    </div>
  );
}
