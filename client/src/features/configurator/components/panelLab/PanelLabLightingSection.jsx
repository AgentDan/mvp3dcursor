import { PanelLabNumberInput } from './PanelLabNumberInput.jsx';
import { DEFAULT_PANEL_LAB } from '@repo/panelLabSchema';

const DEF_SHADOW = DEFAULT_PANEL_LAB.lighting.directional.shadow;

export function PanelLabLightingSection({ lighting, patchLighting, renderer, patchRenderer }) {
  const amb = lighting.ambient;
  const hem = lighting.hemisphere;
  const dir = lighting.directional;
  const sm = renderer?.shadowMap;
  const shadowType = sm?.type ?? 'VSMShadowMap';
  const vsmActive = shadowType === 'VSMShadowMap';
  const showUseVsmHint =
    dir.shadow.enabled &&
    sm?.enabled &&
    (shadowType === 'PCFSoftShadowMap' || shadowType === 'PCFShadowMap');

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
      {showUseVsmHint ? (
        <div className="rounded border border-amber-500/40 bg-amber-500/10 px-2 py-1.5 text-[10px] leading-snug text-amber-950">
          <div className="font-medium text-amber-900">Soft shadow edges (Three.js r182)</div>
          <div className="mt-0.5 text-amber-900/90">
            <code className="text-[10px]">PCFSoftShadowMap</code> is downgraded to plain PCF —{' '}
            <strong>Shadow blur (radius)</strong> has almost no effect. Use{' '}
            <strong>VSM (Variance)</strong> in Renderer → Shadow type, then tune <strong>radius</strong> and{' '}
            <strong>VSM blur samples</strong> here.
          </div>
          {patchRenderer ? (
            <button
              type="button"
              className="mt-1.5 rounded border border-amber-600/50 bg-white/90 px-2 py-0.5 text-[10px] font-medium text-amber-950 hover:bg-amber-50"
              onClick={() =>
                patchRenderer({
                  shadowMap: { ...sm, enabled: true, type: 'VSMShadowMap' },
                })
              }
            >
              Switch renderer to VSM
            </button>
          ) : null}
        </div>
      ) : null}
      {dir.shadow.enabled ? (
        <label className="flex flex-col gap-0.5 text-[11px] text-gray-700">
          <span>Shadow map size</span>
          <select
            value={dir.shadow.mapSize?.[0] ?? DEF_SHADOW.mapSize[0]}
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
        <>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-600">Shadow edge blur (VSM)</div>
          <p className="text-[10px] leading-snug text-gray-500">
            With <strong>VSM</strong>, increase <strong>radius</strong> (try {'>'} 1) for softer borders and{' '}
            <strong>blur samples</strong> for smoother filtering (heavier GPU). Bias controls only contact artefacts,
            not blur.
          </p>
          <PanelLabNumberInput
            label="Blur radius"
            value={typeof dir.shadow.radius === 'number' ? dir.shadow.radius : DEF_SHADOW.radius}
            min={0}
            max={100}
            step={0.5}
            onChange={(v) =>
              patchLighting({
                directional: { ...dir, shadow: { ...dir.shadow, radius: v } },
              })
            }
          />
          {vsmActive ? (
            <PanelLabNumberInput
              label="VSM blur samples"
              value={
                typeof dir.shadow.blurSamples === 'number' ? dir.shadow.blurSamples : DEF_SHADOW.blurSamples
              }
              min={1}
              max={32}
              step={1}
              onChange={(v) =>
                patchLighting({
                  directional: { ...dir, shadow: { ...dir.shadow, blurSamples: v } },
                })
              }
            />
          ) : null}
        </>
      ) : null}
      {dir.shadow.enabled ? (
        <>
          <div className="pt-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-600">
            Shadow contact (bias)
          </div>
          <div className="grid grid-cols-2 gap-1">
            <PanelLabNumberInput
              label="Depth bias"
              value={typeof dir.shadow.bias === 'number' ? dir.shadow.bias : DEF_SHADOW.bias}
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
              value={typeof dir.shadow.normalBias === 'number' ? dir.shadow.normalBias : DEF_SHADOW.normalBias}
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
        </>
      ) : null}
      {dir.shadow.enabled ? (
        <div className="grid grid-cols-2 gap-1">
          <PanelLabNumberInput
            label="Cam near"
            value={typeof dir.shadow.camera?.near === 'number' ? dir.shadow.camera.near : DEF_SHADOW.camera.near}
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
            value={typeof dir.shadow.camera?.far === 'number' ? dir.shadow.camera.far : DEF_SHADOW.camera.far}
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
            value={typeof dir.shadow.camera?.left === 'number' ? dir.shadow.camera.left : DEF_SHADOW.camera.left}
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
            value={typeof dir.shadow.camera?.right === 'number' ? dir.shadow.camera.right : DEF_SHADOW.camera.right}
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
            value={typeof dir.shadow.camera?.top === 'number' ? dir.shadow.camera.top : DEF_SHADOW.camera.top}
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
            value={typeof dir.shadow.camera?.bottom === 'number' ? dir.shadow.camera.bottom : DEF_SHADOW.camera.bottom}
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
          Tighter shadow camera bounds improve resolution. Tune depth/normal bias if you see acne or gaps on surfaces.
        </p>
      ) : null}
    </div>
  );
}
