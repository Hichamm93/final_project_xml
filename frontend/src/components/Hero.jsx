import { useEffect, useState } from "react";
import { api } from "../api";
import background from "../assets/background.png";

const CLIENT_TAGLINE = "Découvrez les films à l’affiche et réservez vos places en quelques clics.";

export default function Hero({ onPlay, user }) {
  const [ownerCity, setOwnerCity] = useState(null);

  useEffect(() => {
    let active = true;
    const loadOwnerCity = async () => {
      if (!user || user.role === "client") {
        setOwnerCity(null);
        return;
      }
      try {
        if (user.role === "proprio_cinema") {
          const cinemas = await api.myCinemas();
          if (!active) return;
          setOwnerCity(cinemas[0]?.city?.name || null);
        } else if (user.role === "proprio_film") {
          const screenings = await api.ownerProgrammed();
          if (!active) return;
          setOwnerCity(screenings[0]?.cinema?.city?.name || null);
        } else {
          setOwnerCity(null);
        }
      } catch (error) {
        if (active) setOwnerCity(null);
      }
    };

    loadOwnerCity();
    return () => {
      active = false;
    };
  }, [user]);

  const cityLabel = ownerCity ? `à ${ownerCity}` : "dans votre ville";
  const tagline = (() => {
    if (!user || user.role === "client") return CLIENT_TAGLINE;
    if (user.role === "proprio_cinema") {
      return `Pilotez la programmation ${cityLabel} et planifiez vos séances depuis votre tableau de bord.`;
    }
    if (user.role === "proprio_film") {
      return `Suivez la diffusion de vos films ${cityLabel} et mettez à jour votre catalogue.`;
    }
    return CLIENT_TAGLINE;
  })();

  return (
    <div
      className="relative h-[60vh] w-full bg-cover bg-center"
      style={{ backgroundImage: `url(${background})` }}
    >
      {/* overlay sombre */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 h-full flex items-end pb-16">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold">
            Bienvenue chez LouLa Cinema
          </h1>
          <p className="mt-3 text-zinc-200 max-w-xl">
            {tagline}
          </p>

          <div className="mt-6">
            <button
              onClick={onPlay}
              className="px-6 py-3 rounded-full bg-red-600 hover:bg-red-500 transition font-semibold shadow-glow"
            >
              Voir la programmation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
