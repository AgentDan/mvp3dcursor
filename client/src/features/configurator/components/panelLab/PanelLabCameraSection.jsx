import { PanelLabNumberInput } from './PanelLabNumberInput.jsx';

export function PanelLabCameraSection({ cameraFov, setCameraFov }) {
  return (
    <div>
      <PanelLabNumberInput
        label="FOV (°)"
        value={cameraFov}
        min={10}
        max={120}
        step={1}
        integer
        onChange={setCameraFov}
      />
    </div>
  );
}
