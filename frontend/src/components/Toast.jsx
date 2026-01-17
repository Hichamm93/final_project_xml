export default function Toast({ text }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60]">
      <div className="px-4 py-2 rounded-full bg-zinc-900/90 border border-zinc-700 shadow-glow">
        <span className="text-sm">{text}</span>
      </div>
    </div>
  );
}
