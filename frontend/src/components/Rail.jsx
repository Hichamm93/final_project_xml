import MovieCard from "./MovieCard";

export default function Rail({ title, items, onOpen }) {
  return (
    <div className="mt-10">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <div className="mt-3 overflow-x-auto no-scrollbar">
        <div className="max-w-6xl mx-auto px-4 flex gap-3 pb-2">
          {items.map((m) => (
            <MovieCard key={m.id} movie={m} onOpen={() => onOpen(m)} />
          ))}
        </div>
      </div>
    </div>
  );
}
