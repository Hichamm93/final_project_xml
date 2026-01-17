import React, { useEffect, useMemo, useState } from "react";
import { api, getUser } from "../api";

export default function Me({ go, toast }) {
  const user = useMemo(() => getUser(), []);
  const [items, setItems] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        if (!user) return;
        const r = await api.myReservations();
        setItems(r);
      } catch (e) {
        toast(e.message);
      }
    })();
  }, []);

  if (!user) return (
    <div className="max-w-6xl mx-auto px-4 py-10 text-zinc-300">
      Connecte-toi pour voir tes réservations.
    </div>
  );

  if (user.role !== "client") return (
    <div className="max-w-6xl mx-auto px-4 py-10 text-zinc-300">
      Cette page est réservée aux clients.
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-extrabold">Mes réservations à venir</h1>

      <div className="mt-6 grid md:grid-cols-2 gap-3">
        {items.map((r) => {
          const dt = new Date(r.screening.starts_at);
          return (
            <div key={r.id} className="p-4 rounded-2xl border border-zinc-800 bg-zinc-950">
              <div className="font-semibold">{r.screening.cinema.city.name} • {r.screening.cinema.name}</div>
              <div className="text-xs text-zinc-400">{r.screening.cinema.address} • {r.screening.room}</div>
              <div className="mt-2 text-sm">{dt.toLocaleString()}</div>
              <div className="mt-1 text-sm text-zinc-300">Places: {r.seats}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
