export function PanelLabKeyBadge({ labKey }) {
  return (
    <div className="text-[11px]">
      <div className="text-gray-700 mb-0.5">Файл Lab (S3 key)</div>
      <div className="px-2 py-1 rounded bg-white/80 border border-gray-500/50 font-mono break-all text-gray-900">
        {labKey}
      </div>
    </div>
  );
}
