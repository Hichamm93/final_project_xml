import React, { useEffect, useMemo, useState } from "react";
import { api, getUser } from "../api";

export default function FilmOwner({ toast }) {
  const user = useMemo(() => getUser(), []);
  const [films, setFilms] = useState([]);
  const [programmed, setProgrammed] = useState([]);

  const [form, setForm] = useState({
    title: "", synopsis: "", poster_url: "", backdrop_url: "",
    duration_min: 100, release_year: 2024, genres: "Drama", language: "FR", rating: "PG-13", featured: false
  });

  const load = async () => {
    const f = await api.ownerFilms();
    const p = await api.ownerProgrammed();
    setFilms(f);
    setProgrammed(p);
  };

  useEffect(() => {
    (async () => {
      try {
        if (!user) return;
        if (user.role !== "proprio_film") return;
        await load();
      } catch (e) {
        toast(e.message);
      }
    })();
  }, []);

  if (!user) return <div className="max-w-6xl mx-auto px-4 py-10 text-zinc-300">Connecte-toi.</div>;
  if (user.role !== "proprio_film") return <div className="max-w-6xl mx-auto px-4 py-10 text-zinc-300">Accès proprio film uniquement.</div>;

  const create = async () => {
    try {
      await api.ownerCreateFilm({
        ...form,
        duration_min: Number(form.duration_min),
        release_year: Number(form.release_year),
        featured: Boolean(form.featured)
      });
      toast("Film ajouté ✅");
      setForm({ ...form, title: "", synopsis: "" });
      await load();
    } catch (e) {
      toast(e.message);
    }
  };

  const del = async (id) => {
    try {
      await api.ownerDeleteFilm(id);
      toast("Film supprimé (et programmations associées) ✅");
      await load();
    } catch (e) {
      toast(e.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-extrabold">Mon tableau de bord</h1>

      <div className="mt-6 grid lg:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-950">
          <div className="font-semibold">Ajouter un film</div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <input className="col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3"
              placeholder="Titre" value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})}/>
            <textarea className="col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 min-h-24"
              placeholder="Synopsis" value={form.synopsis} onChange={(e)=>setForm({...form,synopsis:e.target.value})}/>
            <input className="col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3"
              placeholder="Poster URL (optionnel)" value={form.poster_url} onChange={(e)=>setForm({...form,poster_url:e.target.value})}/>
            <input className="col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3"
              placeholder="Backdrop URL (optionnel)" value={form.backdrop_url} onChange={(e)=>setForm({...form,backdrop_url:e.target.value})}/>
            <input className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3"
              placeholder="Durée (min)" type="number" value={form.duration_min} onChange={(e)=>setForm({...form,duration_min:e.target.value})}/>
            <input className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3"
              placeholder="Année" type="number" value={form.release_year} onChange={(e)=>setForm({...form,release_year:e.target.value})}/>
            <input className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3"
              placeholder="Genres (CSV)" value={form.genres} onChange={(e)=>setForm({...form,genres:e.target.value})}/>
            <input className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3"
              placeholder="Langue" value={form.language} onChange={(e)=>setForm({...form,language:e.target.value})}/>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <label className="text-sm text-zinc-300 flex items-center gap-2">
              <input type="checkbox" checked={form.featured} onChange={(e)=>setForm({...form,featured:e.target.checked})}/>
              À la une
            </label>
          </div>

          <button onClick={create} className="mt-4 w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 font-semibold shadow-glow">
            Ajouter
          </button>
        </div>

        <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-950">
          <div className="font-semibold">Mes films</div>
          <div className="mt-4 space-y-3">
            {films.map((f) => (
              <div key={f.id} className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="h-20 w-14 flex-shrink-0 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
                    {f.poster_url ? (
                      <img src={f.poster_url} alt={`Affiche ${f.title}`} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-[10px] text-zinc-500 px-1 text-center">
                        Pas d&apos;affiche
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{f.title}</div>
                    <div className="text-xs text-zinc-400">{f.release_year} • {f.duration_min} min • {f.genres}</div>
                  </div>
                </div>
                <button onClick={()=>del(f.id)} className="px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 hover:border-red-500 text-sm">
                  Supprimer
                </button>
              </div>
            ))}
            {films.length === 0 && <div className="text-zinc-400 text-sm">Aucun film.</div>}
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-950">
          <div className="font-semibold">La programmation de mes films</div>
          <div className="mt-4 space-y-3">
            {programmed.map((s) => {
              const filmTitle = s.film?.title || "Film inconnu";
              const poster = s.film?.poster_url;
              return (
                <div key={s.id} className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-start gap-3">
                  <div className="h-20 w-14 flex-shrink-0 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
                    {poster ? (
                      <img src={poster} alt={`Affiche ${filmTitle}`} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-[10px] text-zinc-500 px-1 text-center">
                        Pas d&apos;affiche
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{filmTitle}</div>
                    <div className="text-xs text-zinc-400">
                      {new Date(s.starts_at).toLocaleString()} • {s.cinema.city.name} • {s.cinema.name} • {s.room}
                    </div>
                  </div>
                </div>
              );
            })}
            {programmed.length === 0 && <div className="text-zinc-400 text-sm">Aucune programmation.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
