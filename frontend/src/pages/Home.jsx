import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import Hero from "../components/Hero";
import Rail from "../components/Rail";
import MovieModal from "../components/MovieModal";

function getQueryQ() {
  const h = window.location.hash;
  const i = h.indexOf("?q=");
  if (i === -1) return null;
  return decodeURIComponent(h.slice(i + 3));
}

export default function Home({ go, toast, user }) {
  const [featured, setFeatured] = useState([]);
  const [all, setAll] = useState([]);
  const [open, setOpen] = useState(null);
  const q = useMemo(getQueryQ, [window.location.hash]);

  useEffect(() => {
    (async () => {
      try {
        const f = await api.featured();
        setFeatured(f);
        const a = await api.films(q || undefined);
        setAll(a);
      } catch (e) {
        toast(e.message);
      }
    })();
  }, [q]);

  const hero = featured[0] || all[0];

  return (
    <div>
      <Hero
        film={hero}
        onOpen={() => hero && setOpen(hero)}
        onPlay={() => go("/program")}
        user={user}
      />

      <Rail title={q ? `Résultats pour “${q}”` : "Nouveautés"} items={all.slice(0, 18)} onOpen={setOpen} />
      <Rail title="À la une" items={featured} onOpen={setOpen} />

      {open && <MovieModal film={open} onClose={() => setOpen(null)} onGo={go} />}
      <div className="h-16" />
    </div>
  );
}
