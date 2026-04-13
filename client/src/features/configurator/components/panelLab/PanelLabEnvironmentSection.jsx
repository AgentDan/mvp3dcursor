import { PanelLabNumberInput } from './PanelLabNumberInput.jsx';

export function PanelLabEnvironmentSection({
  backgroundColor,
  setBackgroundColor,
  exposure,
  setExposure,
  ambientIntensity,
  setAmbientIntensity,
  directionalIntensity,
  setDirectionalIntensity,
}) {
  return (
    <div className="space-y-2">
        <label className="flex flex-col gap-0.5 text-[11px] text-gray-700">
          <span>Цвет фона</span>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="w-8 h-6 rounded border border-gray-500/60 bg-white/90"
            />
            <input
              type="text"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="flex-1 px-2 py-1 rounded bg-white/90 border border-gray-500/60 text-[11px] text-gray-950 font-mono"
            />
          </div>
        </label>
        <PanelLabNumberInput
          label="Экспозиция"
          value={exposure}
          min={0}
          max={5}
          step={0.1}
          onChange={setExposure}
        />
        <PanelLabNumberInput
          label="Ambient"
          value={ambientIntensity}
          min={0}
          max={5}
          step={0.1}
          onChange={setAmbientIntensity}
        />
        <PanelLabNumberInput
          label="Направленный свет"
          value={directionalIntensity}
          min={0}
          max={5}
          step={0.1}
          onChange={setDirectionalIntensity}
        />
    </div>
  );
}
