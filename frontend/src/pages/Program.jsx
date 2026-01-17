import React, { useEffect, useState } from "react";
import { api } from "../api";
import CityPicker from "../components/CityPicker";

export default function Program({ go, toast }) {
  const [cities, setCities] = useState([]);
  const [city, setCity] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const c = await api.cities();
        setCities(c);
        const p = await api.program();
        setItems(p);
      } catch (e) {
        toast(e.message);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const p = await api.program(city || undefined);
        setItems(p);
      } catch (e) {
        toast(e.message);
      }
    })();
  }, [city]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-extrabold">Programmation à venir</h1>
        <CityPicker cities={cities} value={city} onChange={setCity} />
      </div>

      <div className="mt-6 grid md:grid-cols-2 gap-3">
        {items.map((s) => {
          const dt = new Date(s.starts_at);
          return (
            <button
              key={s.id}
              onClick={() => {
                const fid = Number(s.film_id);
                if (!Number.isFinite(fid)) {
                  toast("Cette séance n'a pas de film associé (film_id manquant).");
                  return;
                }
                go(`/movie/${fid}`);
              }}
              className="text-left p-4 rounded-2xl border border-zinc-800 bg-zinc-950 hover:border-red-500 transition"
            >

              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{s.cinema.city.name} • {s.cinema.name}</div>
                  <div className="text-xs text-zinc-400">{s.cinema.address} • {s.room}</div>
                  <div className="mt-2 text-sm">{dt.toLocaleString()} • {(s.price_cents / 100).toFixed(2)}€</div>
                </div>
                <div className="text-xs text-zinc-400">
                  {s.booked_seats}/{s.total_seats}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
