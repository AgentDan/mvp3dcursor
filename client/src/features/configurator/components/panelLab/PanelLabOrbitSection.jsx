import { PanelLabNumberInput } from './PanelLabNumberInput.jsx';

export function PanelLabOrbitSection({ controls, patchControls }) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <PanelLabNumberInput
          label="Min distance"
          value={controls.minDistance}
          min={0.1}
          max={50}
          step={0.1}
          onChange={(v) => patchControls({ minDistance: v })}
        />
        <PanelLabNumberInput
          label="Max distance"
          value={controls.maxDistance}
          min={0.1}
          max={200}
          step={0.1}
          onChange={(v) => patchControls({ maxDistance: v })}
        />
        <PanelLabNumberInput
          label="Damping"
          value={controls.dampingFactor}
          min={0}
          max={1}
          step={0.01}
          onChange={(v) => patchControls({ dampingFactor: v })}
        />
      </div>
      <div className="flex flex-col gap-1 text-[11px] text-gray-700">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={controls.enableDamping}
            onChange={(e) => patchControls({ enableDamping: e.target.checked })}
          />
          enableDamping
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={controls.enablePan}
            onChange={(e) => patchControls({ enablePan: e.target.checked })}
          />
          enablePan
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={controls.enableZoom}
            onChange={(e) => patchControls({ enableZoom: e.target.checked })}
          />
          enableZoom
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={controls.enableRotate}
            onChange={(e) => patchControls({ enableRotate: e.target.checked })}
          />
          enableRotate
        </label>
      </div>
    </div>
  );
}
