export default function CityPicker({ cities, value, onChange }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-sm text-zinc-300">Ville</div>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-red-500"
      >
        <option value="">Toutes</option>
        {cities.map((c) => (
          <option key={c.id} value={c.name}>{c.name}</option>
        ))}
      </select>
    </div>
  );
}
