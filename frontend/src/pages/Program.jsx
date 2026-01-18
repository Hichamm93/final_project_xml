import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import CityPicker from "../components/CityPicker";

export default function Program({ go, toast, user }) {
  const [cities, setCities] = useState([]);
  const [city, setCity] = useState(null);
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    starts_at: "",
    room: "",
    price_cents: "",
    total_seats: ""
  });

  const isCinemaOwner = useMemo(() => user?.role === "proprio_cinema", [user]);

  useEffect(() => {
    (async () => {
      try {
        if (isCinemaOwner) return;
        const c = await api.cities();
        setCities(c);
      } catch (e) {
        toast(e.message);
      }
    })();
  }, [isCinemaOwner]);

  useEffect(() => {
    (async () => {
      try {
        if (isCinemaOwner) {
          const p = await api.cinemaScreenings();
          setItems(p);
          return;
        }
        const p = await api.program(city || undefined);
        setItems(p);
      } catch (e) {
        toast(e.message);
      }
    })();
  }, [city, isCinemaOwner]);

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
      setItems(p);
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
      setItems(p);
      toast("Programmation supprimée ✅");
    } catch (e) {
      toast(e.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-extrabold">Programmation à venir</h1>
        {isCinemaOwner ? (
          <div className="text-sm text-zinc-400">Vos programmations uniquement.</div>
        ) : (
          <CityPicker cities={cities} value={city} onChange={setCity} />
        )}
      </div>

      <div className="mt-6 grid md:grid-cols-2 gap-3">
        {items.map((s) => {
          const dt = new Date(s.starts_at);
          const filmTitle = s.film?.title || "Film inconnu";
          const poster = s.film?.poster_url;
          return (
            <button
              key={s.id}
              onClick={() => {
                const fid = Number(s.film?.id ?? s.film_id);
                if (!Number.isFinite(fid)) {
                  toast("Cette séance n'a pas de film associé (film_id manquant).");
                  return;
                }
                go(`/movie/${fid}`);
              }}
              className="text-left p-4 rounded-2xl border border-zinc-800 bg-zinc-950 hover:border-red-500 transition"
            >
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
                  {s.film?.duration_min && (
                    <div className="text-xs text-zinc-400 mt-1">
                      Durée : {s.film.duration_min} min
                    </div>
                  )}
                  {isCinemaOwner && (
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEdit(s);
                        }}
                        className="px-3 py-1 rounded-full border border-zinc-700 hover:border-red-500"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeScreening(s.id);
                        }}
                        className="px-3 py-1 rounded-full border border-red-600 text-red-400 hover:text-red-300"
                      >
                        Supprimer
                      </button>
                    </div>
                  )}
                </div>

                <div className="text-xs text-zinc-400">
                  {s.booked_seats}/{s.total_seats}
                </div>
              </div>
              {isCinemaOwner && editingId === s.id && (
                <div className="mt-4 grid md:grid-cols-2 gap-3" onClick={(e) => e.stopPropagation()}>
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
                      onClick={(e) => {
                        e.stopPropagation();
                        saveEdit(s.id);
                      }}
                      className="px-4 py-2 rounded-full bg-red-600 hover:bg-red-500 text-sm font-semibold"
                    >
                      Enregistrer
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingId(null);
                      }}
                      className="px-4 py-2 rounded-full border border-zinc-700 text-sm"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </button>
          );
        })}
        {items.length === 0 && (
          <div className="text-sm text-zinc-400">Aucune programmation disponible.</div>
        )}
      </div>
    </div>
  );
}
