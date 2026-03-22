import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useViewerSettingsStore } from '../../../shared/scene/viewerSettingsStore.js';

function useLabKeyFromLocation() {
  const location = useLocation();

  return useMemo(() => {
    const params = new URLSearchParams(location.search);
    const key = params.get('labKey');
    return key && key.trim() ? key : null;
  }, [location.search]);
}

function NumberInput({ label, value, onChange, min, max, step = 0.1 }) {
  return (
    <label className="flex flex-col gap-0.5 text-[11px] text-slate-400">
      <span>{label}</span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-[11px] text-slate-100"
      />
    </label>
  );
}

export function PanelLabPanel() {
  const labKey = useLabKeyFromLocation();
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState(null);

  // Панель Lab доступна только при открытии из 3D Library (админский сценарий),
  // который передаёт корректный labKey в URL. Если labKey отсутствует,
  // панель не должна отображаться вовсе.
  if (!labKey) {
    return null;
  }

  const {
    backgroundColor,
    exposure,
    ambientIntensity,
    directionalIntensity,
    directionalPosition,
    minDistance,
    maxDistance,
    dampingFactor,
    cameraPosition,
    cameraFov,
    setBackgroundColor,
    setExposure,
    setAmbientIntensity,
    setDirectionalIntensity,
    setMinDistance,
    setMaxDistance,
    setDampingFactor,
    setCameraFov,
  } = useViewerSettingsStore();

  const handleSave = async () => {
    if (!labKey || isSaving) return;

    setIsSaving(true);
    setStatus(null);

    try {
      const res = await fetch('/api/admin/lab/save-to-s3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: labKey,
          settings: {
            backgroundColor,
            exposure,
            ambientIntensity,
            directionalIntensity,
            directionalPosition,
            minDistance,
            maxDistance,
            dampingFactor,
            cameraPosition,
            cameraFov,
          },
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || data.message || 'Failed to save Lab file');

      setStatus({ type: 'success', message: `Saved to S3: ${labKey}` });
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <aside className="w-[260px] p-4 bg-slate-900/90 text-slate-100 border-l border-slate-800 backdrop-blur-sm shrink-0">
      <h2 className="m-0 mb-2 text-base font-semibold">Panel Lab</h2>
      <p className="m-0 mb-3 text-xs leading-snug text-slate-400">
        Lab controls for scene environment and camera. Changes are applied live in the viewer.
      </p>

      <div className="mb-4 text-[11px]">
        <div className="text-slate-400 mb-0.5">Current Lab file (S3 key)</div>
        <div className="px-2 py-1 rounded bg-slate-800/80 border border-slate-700 font-mono break-all">
          {labKey}
        </div>
      </div>

      <div className="space-y-3 text-xs mb-4">
        <div>
          <div className="text-slate-400 mb-0.5">Environment</div>
          <div className="mt-1 space-y-2">
            <label className="flex flex-col gap-0.5 text-[11px] text-slate-400">
              <span>Background color</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-8 h-6 rounded border border-slate-700 bg-slate-900"
                />
                <input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="flex-1 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-[11px] text-slate-100 font-mono"
                />
              </div>
            </label>
            <NumberInput
              label="Exposure"
              value={exposure}
              min={0}
              max={5}
              step={0.1}
              onChange={setExposure}
            />
            <NumberInput
              label="Ambient intensity"
              value={ambientIntensity}
              min={0}
              max={5}
              step={0.1}
              onChange={setAmbientIntensity}
            />
            <NumberInput
              label="Directional intensity"
              value={directionalIntensity}
              min={0}
              max={5}
              step={0.1}
              onChange={setDirectionalIntensity}
            />
          </div>
        </div>

        <div>
          <div className="text-slate-400 mb-0.5">OrbitControls</div>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <NumberInput
              label="Min distance"
              value={minDistance}
              min={0.1}
              max={50}
              step={0.1}
              onChange={setMinDistance}
            />
            <NumberInput
              label="Max distance"
              value={maxDistance}
              min={0.1}
              max={100}
              step={0.1}
              onChange={setMaxDistance}
            />
            <NumberInput
              label="Damping factor"
              value={dampingFactor}
              min={0}
              max={1}
              step={0.01}
              onChange={setDampingFactor}
            />
          </div>
        </div>

        <div>
          <div className="text-slate-400 mb-0.5">Camera</div>
          <div className="mt-1 space-y-2">
            <NumberInput
              label="Field of view (FOV, °)"
              value={cameraFov}
              min={10}
              max={120}
              step={1}
              onChange={setCameraFov}
            />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={!labKey || isSaving}
        className="w-full px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium mb-2"
      >
        {isSaving ? 'Saving…' : 'Save Lab file to S3'}
      </button>

      {status && (
        <p
          className={`m-0 mt-1 text-[11px] ${
            status.type === 'success' ? 'text-green-400' : 'text-red-400'
          }`}
        >
          {status.message}
        </p>
      )}
    </aside>
  );
}

