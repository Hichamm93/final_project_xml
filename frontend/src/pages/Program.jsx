import React, { useEffect, useState } from "react";
import { api } from "../api";
import CityPicker from "../components/CityPicker";

export default function Program({ go, toast, user }) {
  const [cities, setCities] = useState([]);
  const [city, setCity] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        if (user && user.role !== "client") return;
        const c = await api.cities();
        setCities(c);
      } catch (e) {
        toast(e.message);
      }
    })();
  }, [user]);

  useEffect(() => {
    (async () => {
      try {
        if (user && user.role !== "client") return;
        const p = await api.program(city || undefined);
        setItems(p);
      } catch (e) {
        toast(e.message);
      }
    })();
  }, [city, user]);

  if (user && user.role !== "client") {
    return <div className="max-w-6xl mx-auto px-4 py-10 text-zinc-300">Accès client uniquement.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-extrabold">Programmation à venir</h1>
        <CityPicker cities={cities} value={city} onChange={setCity} />
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
                </div>

                <div className="text-xs text-zinc-400">
                  {s.booked_seats}/{s.total_seats}
                </div>
              </div>
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
