import { PanelLabNumberInput } from './PanelLabNumberInput.jsx';

export function PanelLabLightingSection({ lighting, patchLighting }) {
  const amb = lighting.ambient;
  const hem = lighting.hemisphere;
  const dir = lighting.directional;

  return (
    <div className="space-y-2">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-600">Ambient</div>
      <label className="flex items-center gap-2 text-[11px] text-gray-700">
        <input
          type="checkbox"
          checked={amb.enabled}
          onChange={(e) => patchLighting({ ambient: { ...amb, enabled: e.target.checked } })}
        />
        On
      </label>
      <PanelLabNumberInput
        label="Intensity"
        value={amb.intensity}
        min={0}
        max={5}
        step={0.05}
        onChange={(v) => patchLighting({ ambient: { ...amb, intensity: v } })}
      />
      <label className="flex flex-col gap-0.5 text-[11px] text-gray-700">
        <span>Color</span>
        <input
          type="color"
          value={amb.color}
          onChange={(e) => patchLighting({ ambient: { ...amb, color: e.target.value } })}
          className="h-6 w-16 rounded border border-gray-500/60 bg-white/90"
        />
      </label>

      <div className="pt-1 text-[10px] font-semibold uppercase tracking-wide text-gray-600">Hemisphere</div>
      <label className="flex items-center gap-2 text-[11px] text-gray-700">
        <input
          type="checkbox"
          checked={hem.enabled}
          onChange={(e) => patchLighting({ hemisphere: { ...hem, enabled: e.target.checked } })}
        />
        On
      </label>
      <PanelLabNumberInput
        label="Intensity"
        value={hem.intensity}
        min={0}
        max={5}
        step={0.05}
        onChange={(v) => patchLighting({ hemisphere: { ...hem, intensity: v } })}
      />

      <div className="pt-1 text-[10px] font-semibold uppercase tracking-wide text-gray-600">Directional</div>
      <label className="flex items-center gap-2 text-[11px] text-gray-700">
        <input
          type="checkbox"
          checked={dir.enabled}
          onChange={(e) => patchLighting({ directional: { ...dir, enabled: e.target.checked } })}
        />
        On
      </label>
      <PanelLabNumberInput
        label="Intensity"
        value={dir.intensity}
        min={0}
        max={10}
        step={0.1}
        onChange={(v) => patchLighting({ directional: { ...dir, intensity: v } })}
      />
      <div className="grid grid-cols-3 gap-1">
        {['X', 'Y', 'Z'].map((axis, i) => (
          <PanelLabNumberInput
            key={axis}
            label={`Pos ${axis}`}
            value={dir.position[i]}
            min={-50}
            max={50}
            step={0.5}
            onChange={(v) => {
              const next = [...dir.position];
              next[i] = v;
              patchLighting({ directional: { ...dir, position: next } });
            }}
          />
        ))}
      </div>
      <label className="flex items-center gap-2 text-[11px] text-gray-700">
        <input
          type="checkbox"
          checked={dir.shadow.enabled}
          onChange={(e) =>
            patchLighting({
              directional: { ...dir, shadow: { ...dir.shadow, enabled: e.target.checked } },
            })
          }
        />
        Shadows
      </label>
    </div>
  );
}
