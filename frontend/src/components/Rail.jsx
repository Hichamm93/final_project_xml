import { useRef } from "react";
import MovieCard from "./MovieCard";

export default function Rail({ title, items, onOpen }) {
  const railRef = useRef(null);

  const scrollByAmount = (direction) => {
    const el = railRef.current;
    if (!el) return;
    const amount = Math.max(el.clientWidth * 0.8, 240) * direction;
    const start = el.scrollLeft;
    const target = start + amount;
    const duration = 450;
    const startTime = performance.now();

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      el.scrollLeft = start + (target - start) * eased;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  return (
    <div className="mt-10">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <div className="mt-3 relative">
        <div ref={railRef} className="overflow-x-auto no-scrollbar scroll-smooth">
          <div className="max-w-6xl mx-auto px-4 flex gap-3 pb-2">
            {items.map((m) => (
              <MovieCard key={m.id} movie={m} onOpen={() => onOpen(m)} />
            ))}
          </div>
        </div>
        <button
          type="button"
          aria-label="Faire défiler la liste"
          onClick={() => scrollByAmount(1)}
          className="hidden md:flex items-center justify-center absolute right-6 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/70 border border-white/10 text-white hover:bg-black/90 transition"
        >
          →
        </button>
      </div>
    </div>
  );
}
