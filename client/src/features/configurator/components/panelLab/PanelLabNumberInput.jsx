export function PanelLabNumberInput({ label, value, onChange, min, max, step = 0.1, integer = false }) {
  const handleChange = (e) => {
    const raw = e.target.value.trim();
    const v = integer ? parseInt(raw, 10) : parseFloat(raw);
    if (!Number.isNaN(v)) onChange(v);
  };

  return (
    <label className="flex flex-col gap-0.5 text-[11px] text-gray-700">
      <span>{label}</span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={handleChange}
        className="px-2 py-1 rounded bg-white/90 border border-gray-500/60 text-[11px] text-gray-950"
      />
    </label>
  );
}
