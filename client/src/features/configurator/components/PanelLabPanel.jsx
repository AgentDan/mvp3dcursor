import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useViewerSettingsStore } from '../../../shared/scene/viewerSettingsStore.js';
import { useLabKeyFromLocation, PanelLabPanelBody, PanelLabSaveSection } from './panelLab/index.js';

const PANEL_W = 'min(21.6rem,calc(100% - 2rem))';

export function PanelLabPanel() {
  const labKey = useLabKeyFromLocation();
  const [panelExpanded, setPanelExpanded] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState(null);

  const {
    backgroundColor,
    exposure,
    ambientIntensity,
    directionalIntensity,
    minDistance,
    maxDistance,
    dampingFactor,
    cameraFov,
    setBackgroundColor,
    setExposure,
    setAmbientIntensity,
    setDirectionalIntensity,
    setMinDistance,
    setMaxDistance,
    setDampingFactor,
    setCameraFov,
  } = useViewerSettingsStore(
    useShallow((s) => ({
      backgroundColor: s.backgroundColor,
      exposure: s.exposure,
      ambientIntensity: s.ambientIntensity,
      directionalIntensity: s.directionalIntensity,
      minDistance: s.minDistance,
      maxDistance: s.maxDistance,
      dampingFactor: s.dampingFactor,
      cameraFov: s.cameraFov,
      setBackgroundColor: s.setBackgroundColor,
      setExposure: s.setExposure,
      setAmbientIntensity: s.setAmbientIntensity,
      setDirectionalIntensity: s.setDirectionalIntensity,
      setMinDistance: s.setMinDistance,
      setMaxDistance: s.setMaxDistance,
      setDampingFactor: s.setDampingFactor,
      setCameraFov: s.setCameraFov,
    })),
  );

  if (!labKey) {
    return null;
  }

  const handleSave = async () => {
    if (!labKey || isSaving) return;

    setIsSaving(true);
    setStatus(null);

    try {
      const s = useViewerSettingsStore.getState();
      const res = await fetch('/api/admin/lab/save-to-s3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: labKey,
          settings: {
            backgroundColor: s.backgroundColor,
            exposure: s.exposure,
            ambientIntensity: s.ambientIntensity,
            directionalIntensity: s.directionalIntensity,
            directionalPosition: s.directionalPosition,
            minDistance: s.minDistance,
            maxDistance: s.maxDistance,
            dampingFactor: s.dampingFactor,
            cameraPosition: s.cameraPosition,
            cameraFov: s.cameraFov,
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

  const panelChromeExpanded =
    'rounded-lg border border-gray-500 bg-gray-400/95 text-gray-950 shadow-lg shadow-black/25 pointer-events-auto transition-[width,max-width] duration-200 ease-out';
  const panelChromeCollapsed =
    'rounded-lg border border-white/15 bg-gray-400/25 backdrop-blur-md backdrop-saturate-150 ' +
    'supports-[backdrop-filter]:bg-gray-400/20 shadow-none pointer-events-auto transition-[width,max-width] duration-200 ease-out';

  return (
    <aside
      className={`
        absolute z-20 left-4 top-24 bottom-auto
        flex flex-col items-stretch
        ${panelExpanded ? 'gap-3 max-h-[min(72vh,calc(100%-7rem))] overflow-y-auto overflow-x-hidden' : 'overflow-hidden p-0'}
        ${panelExpanded ? 'px-3 pt-3 pb-3' : ''}
        ${panelExpanded ? panelChromeExpanded : panelChromeCollapsed}
      `}
      style={
        panelExpanded
          ? { width: PANEL_W, maxWidth: PANEL_W }
          : { width: '2.75rem', minWidth: '2.75rem', maxWidth: '2.75rem', height: '2.75rem', minHeight: '2.75rem' }
      }
    >
      <button
        type="button"
        onClick={() => setPanelExpanded((v) => !v)}
        aria-expanded={panelExpanded}
        aria-controls="panel-lab-panel-body"
        aria-label={panelExpanded ? 'Свернуть панель Lab' : 'Развернуть панель Lab'}
        className={`
          flex shrink-0 items-center justify-center focus:outline-none focus-visible:ring-2
          ${panelExpanded
            ? 'rounded-md text-gray-800 hover:bg-gray-500/35 focus-visible:ring-gray-600 mx-auto mb-0 h-8 w-8'
            : 'h-full w-full min-h-0 rounded-lg text-slate-100 hover:bg-white/15 focus-visible:ring-white/40'}
        `}
      >
        {panelExpanded ? (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        ) : (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
            />
          </svg>
        )}
      </button>

      {panelExpanded ? (
        <>
          <PanelLabPanelBody
            labKey={labKey}
            backgroundColor={backgroundColor}
            setBackgroundColor={setBackgroundColor}
            exposure={exposure}
            setExposure={setExposure}
            ambientIntensity={ambientIntensity}
            setAmbientIntensity={setAmbientIntensity}
            directionalIntensity={directionalIntensity}
            setDirectionalIntensity={setDirectionalIntensity}
            minDistance={minDistance}
            maxDistance={maxDistance}
            dampingFactor={dampingFactor}
            setMinDistance={setMinDistance}
            setMaxDistance={setMaxDistance}
            setDampingFactor={setDampingFactor}
            cameraFov={cameraFov}
            setCameraFov={setCameraFov}
          />
          <PanelLabSaveSection labKey={labKey} isSaving={isSaving} onSave={handleSave} status={status} />
        </>
      ) : null}
    </aside>
  );
}
