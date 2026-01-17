export default function MovieModal({ film, onClose, onGo }) {
  return (
    <div className="fixed inset-0 z-[70] bg-black/70 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden">
        <div className="relative h-52">
          {film.backdrop_url && (
            <img src={film.backdrop_url} alt="" className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
          <button onClick={onClose} className="absolute top-3 right-3 px-3 py-2 rounded-full bg-black/50 border border-zinc-700 hover:border-zinc-400">
            ✕
          </button>
          <div className="absolute bottom-4 left-4 right-4">
            <div className="text-2xl font-extrabold">{film.title}</div>
            <div className="text-xs text-zinc-300 mt-1">{film.release_year} • {film.duration_min} min • {film.genres}</div>
          </div>
        </div>
        <div className="p-5">
          <p className="text-zinc-200 leading-relaxed">{film.synopsis}</p>
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => onGo(`/movie/${film.id}`)}
              className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 transition font-semibold shadow-glow"
            >
              Ouvrir & réserver
            </button>
            <button
              onClick={onClose}
              className="px-5 py-3 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-zinc-500 transition"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
