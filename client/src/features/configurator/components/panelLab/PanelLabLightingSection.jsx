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
      {dir.shadow.enabled ? (
        <label className="flex flex-col gap-0.5 text-[11px] text-gray-700">
          <span>Shadow map size</span>
          <select
            value={dir.shadow.mapSize?.[0] ?? 4096}
            onChange={(e) => {
              const n = Number(e.target.value);
              patchLighting({
                directional: { ...dir, shadow: { ...dir.shadow, mapSize: [n, n] } },
              });
            }}
            className="rounded border border-gray-500/60 bg-white/90 px-2 py-1 text-[11px] text-gray-950"
          >
            {[1024, 2048, 4096].map((n) => (
              <option key={n} value={n}>
                {n} × {n}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {dir.shadow.enabled ? (
        <PanelLabNumberInput
          label="Shadow blur"
          value={typeof dir.shadow.radius === 'number' ? dir.shadow.radius : 18}
          min={0}
          max={64}
          step={0.5}
          onChange={(v) =>
            patchLighting({
              directional: { ...dir, shadow: { ...dir.shadow, radius: v } },
            })
          }
        />
      ) : null}
      {dir.shadow.enabled ? (
        <div className="grid grid-cols-2 gap-1">
          <PanelLabNumberInput
            label="Bias"
            value={typeof dir.shadow.bias === 'number' ? dir.shadow.bias : -0.0002}
            min={-0.02}
            max={0.02}
            step={0.0001}
            onChange={(v) =>
              patchLighting({
                directional: { ...dir, shadow: { ...dir.shadow, bias: v } },
              })
            }
          />
          <PanelLabNumberInput
            label="Normal bias"
            value={typeof dir.shadow.normalBias === 'number' ? dir.shadow.normalBias : 0.02}
            min={0}
            max={1}
            step={0.001}
            onChange={(v) =>
              patchLighting({
                directional: { ...dir, shadow: { ...dir.shadow, normalBias: v } },
              })
            }
          />
        </div>
      ) : null}
      {dir.shadow.enabled ? (
        <div className="grid grid-cols-2 gap-1">
          <PanelLabNumberInput
            label="Cam near"
            value={typeof dir.shadow.camera?.near === 'number' ? dir.shadow.camera.near : 0.5}
            min={0.01}
            max={50}
            step={0.01}
            onChange={(v) =>
              patchLighting({
                directional: {
                  ...dir,
                  shadow: { ...dir.shadow, camera: { ...dir.shadow.camera, near: v } },
                },
              })
            }
          />
          <PanelLabNumberInput
            label="Cam far"
            value={typeof dir.shadow.camera?.far === 'number' ? dir.shadow.camera.far : 50}
            min={1}
            max={300}
            step={0.5}
            onChange={(v) =>
              patchLighting({
                directional: {
                  ...dir,
                  shadow: { ...dir.shadow, camera: { ...dir.shadow.camera, far: v } },
                },
              })
            }
          />
        </div>
      ) : null}
      {dir.shadow.enabled ? (
        <div className="grid grid-cols-2 gap-1">
          <PanelLabNumberInput
            label="Cam left"
            value={typeof dir.shadow.camera?.left === 'number' ? dir.shadow.camera.left : -6}
            min={-200}
            max={0}
            step={0.1}
            onChange={(v) =>
              patchLighting({
                directional: {
                  ...dir,
                  shadow: { ...dir.shadow, camera: { ...dir.shadow.camera, left: v } },
                },
              })
            }
          />
          <PanelLabNumberInput
            label="Cam right"
            value={typeof dir.shadow.camera?.right === 'number' ? dir.shadow.camera.right : 6}
            min={0}
            max={200}
            step={0.1}
            onChange={(v) =>
              patchLighting({
                directional: {
                  ...dir,
                  shadow: { ...dir.shadow, camera: { ...dir.shadow.camera, right: v } },
                },
              })
            }
          />
          <PanelLabNumberInput
            label="Cam top"
            value={typeof dir.shadow.camera?.top === 'number' ? dir.shadow.camera.top : 6}
            min={0}
            max={200}
            step={0.1}
            onChange={(v) =>
              patchLighting({
                directional: {
                  ...dir,
                  shadow: { ...dir.shadow, camera: { ...dir.shadow.camera, top: v } },
                },
              })
            }
          />
          <PanelLabNumberInput
            label="Cam bottom"
            value={typeof dir.shadow.camera?.bottom === 'number' ? dir.shadow.camera.bottom : -6}
            min={-200}
            max={0}
            step={0.1}
            onChange={(v) =>
              patchLighting({
                directional: {
                  ...dir,
                  shadow: { ...dir.shadow, camera: { ...dir.shadow.camera, bottom: v } },
                },
              })
            }
          />
        </div>
      ) : null}
      {dir.shadow.enabled ? (
        <p className="text-[10px] leading-snug text-gray-500">
          Tighter shadow camera bounds improve edge quality. Adjust bias/normal bias to reduce acne and peter-panning.
        </p>
      ) : null}
    </div>
  );
}
