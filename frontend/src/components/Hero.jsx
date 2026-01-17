import background from "../assets/background.png";

export default function Hero({ onPlay }) {
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
            Découvrez les films à l’affiche et réservez vos places en quelques clics.
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
