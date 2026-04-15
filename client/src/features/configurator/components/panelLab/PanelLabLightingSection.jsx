import { PanelLabNumberInput } from './PanelLabNumberInput.jsx';
import { DEFAULT_PANEL_LAB } from '@repo/panelLabSchema';

const DEF_SHADOW = DEFAULT_PANEL_LAB.lighting.shadows;
const DEF_POINT = {
  enabled: true,
  color: '#ffffff',
  intensity: 1,
  position: [0, 3, 0],
  distance: 0,
  decay: 2,
  castShadow: false,
  shadowIntensity: 1,
};
const DEF_SPOT = {
  enabled: true,
  color: '#ffffff',
  intensity: 1,
  position: [0, 5, 0],
  target: [0, 0, 0],
  angle: Math.PI / 6,
  penumbra: 0,
  distance: 0,
  decay: 2,
  castShadow: false,
  shadowIntensity: 1,
};

export function PanelLabAmbientLightingSection({ lighting, patchLighting }) {
  const amb = lighting.ambient;

  return (
    <div className="space-y-2">
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
    </div>
  );
}

export function PanelLabHemisphereLightingSection({ lighting, patchLighting }) {
  const hem = lighting.hemisphere;

  return (
    <div className="space-y-2">
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
    </div>
  );
}

export function PanelLabDirectionalLightingSection({ lighting, patchLighting }) {
  const dir = lighting.directional;
  const extraDirectional = Array.isArray(lighting.directionalLights) ? lighting.directionalLights : [];

  const patchExtraDirectional = (idx, patch) => {
    const next = extraDirectional.map((item, i) => (i === idx ? { ...item, ...patch } : item));
    patchLighting({ directionalLights: next });
  };
  const removeExtraDirectional = (idx) => {
    patchLighting({ directionalLights: extraDirectional.filter((_, i) => i !== idx) });
  };
  const addExtraDirectional = () => {
    patchLighting({
      directionalLights: [
        ...extraDirectional,
        {
          ...DEFAULT_PANEL_LAB.lighting.directional,
          castShadow: false,
        },
      ],
    });
  };

  return (
    <div className="space-y-2">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-600">Default directional</div>
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
          checked={dir.castShadow !== false}
          onChange={(e) => patchLighting({ directional: { ...dir, castShadow: e.target.checked } })}
        />
        Casts shadows
      </label>
      {dir.castShadow !== false ? (
        <PanelLabNumberInput
          label="Shadow intensity"
          value={typeof dir.shadowIntensity === 'number' ? dir.shadowIntensity : 1}
          min={0}
          max={1}
          step={0.01}
          onChange={(v) => patchLighting({ directional: { ...dir, shadowIntensity: v } })}
        />
      ) : null}
      <button
        type="button"
        className="rounded border border-gray-500/60 bg-white/90 px-2 py-1 text-[11px] text-gray-900 hover:bg-white"
        onClick={addExtraDirectional}
      >
        + Add directional
      </button>
      {extraDirectional.map((item, idx) => (
        <div key={`dir-extra-${idx}`} className="space-y-2 rounded border border-gray-500/35 bg-white/35 p-2">
          <div className="flex items-center justify-between gap-2">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-600">
              Directional {idx + 1}
            </div>
            <button
              type="button"
              className="rounded border border-rose-500/60 bg-white/90 px-2 py-0.5 text-[10px] text-rose-700 hover:bg-rose-50"
              onClick={() => removeExtraDirectional(idx)}
            >
              Delete
            </button>
          </div>
          <label className="flex items-center gap-2 text-[11px] text-gray-700">
            <input
              type="checkbox"
              checked={item.enabled}
              onChange={(e) => patchExtraDirectional(idx, { enabled: e.target.checked })}
            />
            On
          </label>
          <PanelLabNumberInput
            label="Intensity"
            value={item.intensity}
            min={0}
            max={10}
            step={0.1}
            onChange={(v) => patchExtraDirectional(idx, { intensity: v })}
          />
          <div className="grid grid-cols-3 gap-1">
            {['X', 'Y', 'Z'].map((axis, i) => (
              <PanelLabNumberInput
                key={axis}
                label={`Pos ${axis}`}
                value={item.position?.[i] ?? DEFAULT_PANEL_LAB.lighting.directional.position[i]}
                min={-50}
                max={50}
                step={0.5}
                onChange={(v) => {
                  const next = Array.isArray(item.position)
                    ? [...item.position]
                    : [...DEFAULT_PANEL_LAB.lighting.directional.position];
                  next[i] = v;
                  patchExtraDirectional(idx, { position: next });
                }}
              />
            ))}
          </div>
          <label className="flex items-center gap-2 text-[11px] text-gray-700">
            <input
              type="checkbox"
              checked={item.castShadow !== false}
              onChange={(e) => patchExtraDirectional(idx, { castShadow: e.target.checked })}
            />
            Casts shadows
          </label>
          {item.castShadow !== false ? (
            <PanelLabNumberInput
              label="Shadow intensity"
              value={typeof item.shadowIntensity === 'number' ? item.shadowIntensity : 1}
              min={0}
              max={1}
              step={0.01}
              onChange={(v) => patchExtraDirectional(idx, { shadowIntensity: v })}
            />
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function PanelLabShadowsSection({ lighting, patchLighting, renderer, patchRenderer }) {
  const shadows = lighting.shadows ?? DEF_SHADOW;
  const sm = renderer?.shadowMap;
  const shadowType = sm?.type ?? 'VSMShadowMap';
  const vsmActive = shadowType === 'VSMShadowMap';
  const showUseVsmHint =
    shadows.enabled && sm?.enabled && (shadowType === 'PCFSoftShadowMap' || shadowType === 'PCFShadowMap');

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-[11px] text-gray-700">
        <input
          type="checkbox"
          checked={shadows.enabled}
          onChange={(e) => patchLighting({ shadows: { ...shadows, enabled: e.target.checked } })}
        />
        Enabled
      </label>
      {showUseVsmHint ? (
        <div className="rounded border border-amber-500/40 bg-amber-500/10 px-2 py-1.5 text-[10px] leading-snug text-amber-950">
          <div className="font-medium text-amber-900">Soft shadow edges (Three.js r182)</div>
          <div className="mt-0.5 text-amber-900/90">
            <code className="text-[10px]">PCFSoftShadowMap</code> is downgraded to plain PCF —{' '}
            <strong>Shadow blur (radius)</strong> has almost no effect. Use <strong>VSM (Variance)</strong> in
            Renderer → Shadow type, then tune <strong>radius</strong> and <strong>VSM blur samples</strong> here.
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
      {shadows.enabled ? (
        <label className="flex flex-col gap-0.5 text-[11px] text-gray-700">
          <span>Shadow map size</span>
          <select
            value={shadows.mapSize?.[0] ?? DEF_SHADOW.mapSize[0]}
            onChange={(e) => {
              const n = Number(e.target.value);
              patchLighting({ shadows: { ...shadows, mapSize: [n, n] } });
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
      {shadows.enabled ? (
        <>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-600">Shadow edge blur (VSM)</div>
          <PanelLabNumberInput
            label="Blur radius"
            value={typeof shadows.radius === 'number' ? shadows.radius : DEF_SHADOW.radius}
            min={0}
            max={100}
            step={0.5}
            onChange={(v) => patchLighting({ shadows: { ...shadows, radius: v } })}
          />
          {vsmActive ? (
            <PanelLabNumberInput
              label="VSM blur samples"
              value={typeof shadows.blurSamples === 'number' ? shadows.blurSamples : DEF_SHADOW.blurSamples}
              min={1}
              max={32}
              step={1}
              onChange={(v) => patchLighting({ shadows: { ...shadows, blurSamples: v } })}
            />
          ) : null}
        </>
      ) : null}
      {shadows.enabled ? (
        <div className="grid grid-cols-2 gap-1">
          <PanelLabNumberInput
            label="Depth bias"
            value={typeof shadows.bias === 'number' ? shadows.bias : DEF_SHADOW.bias}
            min={-0.02}
            max={0.02}
            step={0.0001}
            onChange={(v) => patchLighting({ shadows: { ...shadows, bias: v } })}
          />
          <PanelLabNumberInput
            label="Normal bias"
            value={typeof shadows.normalBias === 'number' ? shadows.normalBias : DEF_SHADOW.normalBias}
            min={0}
            max={1}
            step={0.001}
            onChange={(v) => patchLighting({ shadows: { ...shadows, normalBias: v } })}
          />
        </div>
      ) : null}
      {shadows.enabled ? (
        <div className="grid grid-cols-2 gap-1">
          <PanelLabNumberInput
            label="Cam near"
            value={typeof shadows.camera?.near === 'number' ? shadows.camera.near : DEF_SHADOW.camera.near}
            min={0.01}
            max={50}
            step={0.01}
            onChange={(v) =>
              patchLighting({
                shadows: { ...shadows, camera: { ...shadows.camera, near: v } },
              })
            }
          />
          <PanelLabNumberInput
            label="Cam far"
            value={typeof shadows.camera?.far === 'number' ? shadows.camera.far : DEF_SHADOW.camera.far}
            min={1}
            max={300}
            step={0.5}
            onChange={(v) =>
              patchLighting({
                shadows: { ...shadows, camera: { ...shadows.camera, far: v } },
              })
            }
          />
          <PanelLabNumberInput
            label="Cam left"
            value={typeof shadows.camera?.left === 'number' ? shadows.camera.left : DEF_SHADOW.camera.left}
            min={-200}
            max={0}
            step={0.1}
            onChange={(v) =>
              patchLighting({
                shadows: { ...shadows, camera: { ...shadows.camera, left: v } },
              })
            }
          />
          <PanelLabNumberInput
            label="Cam right"
            value={typeof shadows.camera?.right === 'number' ? shadows.camera.right : DEF_SHADOW.camera.right}
            min={0}
            max={200}
            step={0.1}
            onChange={(v) =>
              patchLighting({
                shadows: { ...shadows, camera: { ...shadows.camera, right: v } },
              })
            }
          />
          <PanelLabNumberInput
            label="Cam top"
            value={typeof shadows.camera?.top === 'number' ? shadows.camera.top : DEF_SHADOW.camera.top}
            min={0}
            max={200}
            step={0.1}
            onChange={(v) =>
              patchLighting({
                shadows: { ...shadows, camera: { ...shadows.camera, top: v } },
              })
            }
          />
          <PanelLabNumberInput
            label="Cam bottom"
            value={typeof shadows.camera?.bottom === 'number' ? shadows.camera.bottom : DEF_SHADOW.camera.bottom}
            min={-200}
            max={0}
            step={0.1}
            onChange={(v) =>
              patchLighting({
                shadows: { ...shadows, camera: { ...shadows.camera, bottom: v } },
              })
            }
          />
        </div>
      ) : null}
    </div>
  );
}

export function PanelLabPointLightsSection({ lighting, patchLighting }) {
  const pointLights = Array.isArray(lighting.pointLights) ? lighting.pointLights : [];
  const updatePoint = (idx, patch) => {
    patchLighting({ pointLights: pointLights.map((item, i) => (i === idx ? { ...item, ...patch } : item)) });
  };
  const removePoint = (idx) => patchLighting({ pointLights: pointLights.filter((_, i) => i !== idx) });
  const addPoint = () => patchLighting({ pointLights: [...pointLights, { ...DEF_POINT }] });

  return (
    <div className="space-y-2">
      <button
        type="button"
        className="rounded border border-gray-500/60 bg-white/90 px-2 py-1 text-[11px] text-gray-900 hover:bg-white"
        onClick={addPoint}
      >
        + Add point light
      </button>
      {pointLights.map((pl, idx) => (
        <div key={`pl-${idx}`} className="space-y-2 rounded border border-gray-500/35 bg-white/35 p-2">
          <div className="flex items-center justify-between gap-2">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-600">Point {idx + 1}</div>
            <button
              type="button"
              className="rounded border border-rose-500/60 bg-white/90 px-2 py-0.5 text-[10px] text-rose-700 hover:bg-rose-50"
              onClick={() => removePoint(idx)}
            >
              Delete
            </button>
          </div>
          <label className="flex items-center gap-2 text-[11px] text-gray-700">
            <input type="checkbox" checked={pl.enabled !== false} onChange={(e) => updatePoint(idx, { enabled: e.target.checked })} />
            On
          </label>
          <PanelLabNumberInput label="Intensity" value={pl.intensity ?? DEF_POINT.intensity} min={0} max={20} step={0.1} onChange={(v) => updatePoint(idx, { intensity: v })} />
          <label className="flex flex-col gap-0.5 text-[11px] text-gray-700">
            <span>Color</span>
            <input
              type="color"
              value={pl.color ?? DEF_POINT.color}
              onChange={(e) => updatePoint(idx, { color: e.target.value })}
              className="h-6 w-16 rounded border border-gray-500/60 bg-white/90"
            />
          </label>
          <div className="grid grid-cols-3 gap-1">
            {['X', 'Y', 'Z'].map((axis, i) => (
              <PanelLabNumberInput
                key={axis}
                label={`Pos ${axis}`}
                value={pl.position?.[i] ?? DEF_POINT.position[i]}
                min={-50}
                max={50}
                step={0.5}
                onChange={(v) => {
                  const next = Array.isArray(pl.position) ? [...pl.position] : [...DEF_POINT.position];
                  next[i] = v;
                  updatePoint(idx, { position: next });
                }}
              />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-1">
            <PanelLabNumberInput label="Distance" value={pl.distance ?? DEF_POINT.distance} min={0} max={500} step={0.5} onChange={(v) => updatePoint(idx, { distance: v })} />
            <PanelLabNumberInput label="Decay" value={pl.decay ?? DEF_POINT.decay} min={0} max={4} step={0.1} onChange={(v) => updatePoint(idx, { decay: v })} />
          </div>
          <label className="flex items-center gap-2 text-[11px] text-gray-700">
            <input type="checkbox" checked={!!pl.castShadow} onChange={(e) => updatePoint(idx, { castShadow: e.target.checked })} />
            Casts shadows
          </label>
          {pl.castShadow ? (
            <PanelLabNumberInput
              label="Shadow intensity"
              value={typeof pl.shadowIntensity === 'number' ? pl.shadowIntensity : 1}
              min={0}
              max={1}
              step={0.01}
              onChange={(v) => updatePoint(idx, { shadowIntensity: v })}
            />
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function PanelLabSpotLightsSection({ lighting, patchLighting }) {
  const spotLights = Array.isArray(lighting.spotLights) ? lighting.spotLights : [];
  const updateSpot = (idx, patch) => {
    patchLighting({ spotLights: spotLights.map((item, i) => (i === idx ? { ...item, ...patch } : item)) });
  };
  const removeSpot = (idx) => patchLighting({ spotLights: spotLights.filter((_, i) => i !== idx) });
  const addSpot = () => patchLighting({ spotLights: [...spotLights, { ...DEF_SPOT }] });

  return (
    <div className="space-y-2">
      <button
        type="button"
        className="rounded border border-gray-500/60 bg-white/90 px-2 py-1 text-[11px] text-gray-900 hover:bg-white"
        onClick={addSpot}
      >
        + Add spot light
      </button>
      {spotLights.map((sl, idx) => (
        <div key={`sl-${idx}`} className="space-y-2 rounded border border-gray-500/35 bg-white/35 p-2">
          <div className="flex items-center justify-between gap-2">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-600">Spot {idx + 1}</div>
            <button
              type="button"
              className="rounded border border-rose-500/60 bg-white/90 px-2 py-0.5 text-[10px] text-rose-700 hover:bg-rose-50"
              onClick={() => removeSpot(idx)}
            >
              Delete
            </button>
          </div>
          <label className="flex items-center gap-2 text-[11px] text-gray-700">
            <input type="checkbox" checked={sl.enabled !== false} onChange={(e) => updateSpot(idx, { enabled: e.target.checked })} />
            On
          </label>
          <PanelLabNumberInput label="Intensity" value={sl.intensity ?? DEF_SPOT.intensity} min={0} max={20} step={0.1} onChange={(v) => updateSpot(idx, { intensity: v })} />
          <label className="flex flex-col gap-0.5 text-[11px] text-gray-700">
            <span>Color</span>
            <input
              type="color"
              value={sl.color ?? DEF_SPOT.color}
              onChange={(e) => updateSpot(idx, { color: e.target.value })}
              className="h-6 w-16 rounded border border-gray-500/60 bg-white/90"
            />
          </label>
          <div className="grid grid-cols-3 gap-1">
            {['X', 'Y', 'Z'].map((axis, i) => (
              <PanelLabNumberInput
                key={axis}
                label={`Pos ${axis}`}
                value={sl.position?.[i] ?? DEF_SPOT.position[i]}
                min={-50}
                max={50}
                step={0.5}
                onChange={(v) => {
                  const next = Array.isArray(sl.position) ? [...sl.position] : [...DEF_SPOT.position];
                  next[i] = v;
                  updateSpot(idx, { position: next });
                }}
              />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-1">
            {['X', 'Y', 'Z'].map((axis, i) => (
              <PanelLabNumberInput
                key={`t-${axis}`}
                label={`Target ${axis}`}
                value={sl.target?.[i] ?? DEF_SPOT.target[i]}
                min={-50}
                max={50}
                step={0.5}
                onChange={(v) => {
                  const next = Array.isArray(sl.target) ? [...sl.target] : [...DEF_SPOT.target];
                  next[i] = v;
                  updateSpot(idx, { target: next });
                }}
              />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-1">
            <PanelLabNumberInput label="Angle (rad)" value={sl.angle ?? DEF_SPOT.angle} min={0.01} max={Math.PI / 2} step={0.01} onChange={(v) => updateSpot(idx, { angle: v })} />
            <PanelLabNumberInput label="Penumbra" value={sl.penumbra ?? DEF_SPOT.penumbra} min={0} max={1} step={0.01} onChange={(v) => updateSpot(idx, { penumbra: v })} />
            <PanelLabNumberInput label="Distance" value={sl.distance ?? DEF_SPOT.distance} min={0} max={500} step={0.5} onChange={(v) => updateSpot(idx, { distance: v })} />
            <PanelLabNumberInput label="Decay" value={sl.decay ?? DEF_SPOT.decay} min={0} max={4} step={0.1} onChange={(v) => updateSpot(idx, { decay: v })} />
          </div>
          <label className="flex items-center gap-2 text-[11px] text-gray-700">
            <input type="checkbox" checked={!!sl.castShadow} onChange={(e) => updateSpot(idx, { castShadow: e.target.checked })} />
            Casts shadows
          </label>
          {sl.castShadow ? (
            <PanelLabNumberInput
              label="Shadow intensity"
              value={typeof sl.shadowIntensity === 'number' ? sl.shadowIntensity : 1}
              min={0}
              max={1}
              step={0.01}
              onChange={(v) => updateSpot(idx, { shadowIntensity: v })}
            />
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function PanelLabLightingSection({ lighting, patchLighting, renderer, patchRenderer }) {
  return (
    <div className="space-y-2">
      <PanelLabAmbientLightingSection lighting={lighting} patchLighting={patchLighting} />
      <PanelLabHemisphereLightingSection lighting={lighting} patchLighting={patchLighting} />
      <PanelLabDirectionalLightingSection
        lighting={lighting}
        patchLighting={patchLighting}
        renderer={renderer}
        patchRenderer={patchRenderer}
      />
    </div>
  );
}
