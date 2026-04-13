import { PanelLabNumberInput } from './PanelLabNumberInput.jsx';

export function PanelLabOrbitSection({
  minDistance,
  maxDistance,
  dampingFactor,
  setMinDistance,
  setMaxDistance,
  setDampingFactor,
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
        <PanelLabNumberInput
          label="Min distance"
          value={minDistance}
          min={0.1}
          max={50}
          step={0.1}
          onChange={setMinDistance}
        />
        <PanelLabNumberInput
          label="Max distance"
          value={maxDistance}
          min={0.1}
          max={100}
          step={0.1}
          onChange={setMaxDistance}
        />
        <PanelLabNumberInput
          label="Damping"
          value={dampingFactor}
          min={0}
          max={1}
          step={0.01}
          onChange={setDampingFactor}
        />
    </div>
  );
}
