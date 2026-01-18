import React, { useEffect, useMemo, useState } from "react";
import { api, getUser } from "../api";

export default function CinemaOwner({ toast }) {
  const user = useMemo(() => getUser(), []);
  const [cinemas, setCinemas] = useState([]);
  const [films, setFilms] = useState([]);
  const [cinemaId, setCinemaId] = useState(null);
  const [screenings, setScreenings] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    starts_at: "",
    room: "",
    price_cents: "",
    total_seats: ""
  });

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
    const p = await api.cinemaScreenings();
    setScreenings(p);
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
      await load();
    } catch (e) {
      toast(e.message);
    }
  };

  const toLocalInput = (value) => {
    const d = new Date(value);
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().slice(0, 16);
  };

  const startEdit = (screening) => {
    setEditingId(screening.id);
    setEditForm({
      starts_at: toLocalInput(screening.starts_at),
      room: screening.room,
      price_cents: screening.price_cents,
      total_seats: screening.total_seats
    });
  };

  const saveEdit = async (id) => {
    try {
      if (!editForm.starts_at) return toast("Choisis une date.");
      await api.cinemaUpdateScreening(id, {
        starts_at: new Date(editForm.starts_at).toISOString(),
        room: editForm.room,
        price_cents: Number(editForm.price_cents),
        total_seats: Number(editForm.total_seats)
      });
      const p = await api.cinemaScreenings();
      setScreenings(p);
      setEditingId(null);
      toast("Programmation mise à jour ✅");
    } catch (e) {
      toast(e.message);
    }
  };

  const removeScreening = async (id) => {
    try {
      await api.cinemaDeleteScreening(id);
      const p = await api.cinemaScreenings();
      setScreenings(p);
      toast("Programmation supprimée ✅");
    } catch (e) {
      toast(e.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-extrabold">Mon tableau de bord</h1>

      <div className="mt-6 p-5 rounded-2xl border border-zinc-800 bg-zinc-950">
        <div className="font-semibold mb-4">Programmer</div>
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
          Programmez vos films dans votre cinéma.
        </div>
      </div>

      <div className="mt-6 p-5 rounded-2xl border border-zinc-800 bg-zinc-950">
        <div className="font-semibold">Mes programmations</div>
        <div className="mt-4 grid md:grid-cols-2 gap-3">
          {screenings.map((s) => {
            const dt = new Date(s.starts_at);
            const filmTitle = s.film?.title || "Film inconnu";
            const poster = s.film?.poster_url;
            return (
              <div key={s.id} className="p-4 rounded-2xl border border-zinc-800 bg-zinc-950">
                <div className="flex items-start justify-between gap-4">
                  <div className="h-24 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
                    {poster ? (
                      <img src={poster} alt={`Affiche ${filmTitle}`} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-[10px] text-zinc-500 px-1 text-center">
                        Pas d&apos;affiche
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="font-semibold">{filmTitle}</div>
                    <div className="text-xs text-zinc-400">
                      {s.cinema.city.name} • {s.cinema.name} • {s.room}
                    </div>
                    <div className="mt-2 text-sm">
                      Séance : {dt.toLocaleString()} • {(s.price_cents / 100).toFixed(2)}€
                    </div>
                  </div>

                  <div className="text-xs text-zinc-400">
                    {s.booked_seats}/{s.total_seats}
                  </div>
                </div>

                {editingId === s.id ? (
                  <div className="mt-4 grid md:grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-zinc-400 mb-1">Date / heure</div>
                      <input
                        type="datetime-local"
                        value={editForm.starts_at}
                        onChange={(e) => setEditForm({ ...editForm, starts_at: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <div className="text-xs text-zinc-400 mb-1">Salle</div>
                      <input
                        value={editForm.room}
                        onChange={(e) => setEditForm({ ...editForm, room: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <div className="text-xs text-zinc-400 mb-1">Prix (centimes)</div>
                      <input
                        type="number"
                        value={editForm.price_cents}
                        onChange={(e) => setEditForm({ ...editForm, price_cents: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <div className="text-xs text-zinc-400 mb-1">Places totales</div>
                      <input
                        type="number"
                        value={editForm.total_seats}
                        onChange={(e) => setEditForm({ ...editForm, total_seats: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="md:col-span-2 flex flex-wrap gap-2">
                      <button
                        onClick={() => saveEdit(s.id)}
                        className="px-4 py-2 rounded-full bg-red-600 hover:bg-red-500 text-sm font-semibold"
                      >
                        Enregistrer
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-4 py-2 rounded-full border border-zinc-700 text-sm"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                    <button
                      onClick={() => startEdit(s)}
                      className="px-3 py-1 rounded-full border border-zinc-700 hover:border-red-500"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => removeScreening(s.id)}
                      className="px-3 py-1 rounded-full border border-red-600 text-red-400 hover:text-red-300"
                    >
                      Supprimer
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          {screenings.length === 0 && (
            <div className="text-sm text-zinc-400">Aucune programmation disponible.</div>
          )}
        </div>
      </div>
    </div>
  );
}
