import { PanelLabNumberInput } from './PanelLabNumberInput.jsx';

export function PanelLabCameraSection({ camera, patchCamera }) {
  return (
    <div className="space-y-2">
      <PanelLabNumberInput
        label="FOV (°)"
        value={camera.fov}
        min={10}
        max={120}
        step={1}
        integer
        onChange={(v) => patchCamera({ fov: v })}
      />
      <PanelLabNumberInput
        label="Near"
        value={camera.near}
        min={0.01}
        max={10}
        step={0.01}
        onChange={(v) => patchCamera({ near: v })}
      />
      <PanelLabNumberInput
        label="Far"
        value={camera.far}
        min={10}
        max={5000}
        step={10}
        integer
        onChange={(v) => patchCamera({ far: v })}
      />
      <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-600">Position</div>
      <div className="grid grid-cols-3 gap-1">
        {['X', 'Y', 'Z'].map((axis, i) => (
          <PanelLabNumberInput
            key={axis}
            label={axis}
            value={camera.position[i]}
            min={-50}
            max={50}
            step={0.5}
            onChange={(v) => {
              const next = [...camera.position];
              next[i] = v;
              patchCamera({ position: next });
            }}
          />
        ))}
      </div>
    </div>
  );
}
