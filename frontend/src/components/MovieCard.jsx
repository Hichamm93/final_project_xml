export default function MovieCard({ movie, onOpen }) {
  return (
    <button
      onClick={onOpen}
      className="group w-[140px] md:w-[170px] flex-shrink-0 text-left"
      title={movie.title}
    >
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 group-hover:border-red-500 transition">
        {movie.poster_url ? (
          <img src={movie.poster_url} alt={movie.title} className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-500 text-sm">No poster</div>
        )}
        <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/90 to-transparent">
          <div className="text-xs text-zinc-200 line-clamp-1">{movie.title}</div>
        </div>
      </div>
    </button>
  );
}
