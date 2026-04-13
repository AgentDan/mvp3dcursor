import { PanelLabIntro } from './PanelLabIntro.jsx';
import { PanelLabKeyBadge } from './PanelLabKeyBadge.jsx';
import { PanelLabCollapsibleSection } from './PanelLabCollapsibleSection.jsx';
import { PanelLabEnvironmentSection } from './PanelLabEnvironmentSection.jsx';
import { PanelLabOrbitSection } from './PanelLabOrbitSection.jsx';
import { PanelLabCameraSection } from './PanelLabCameraSection.jsx';

export function PanelLabPanelBody({
  labKey,
  backgroundColor,
  setBackgroundColor,
  exposure,
  setExposure,
  ambientIntensity,
  setAmbientIntensity,
  directionalIntensity,
  setDirectionalIntensity,
  minDistance,
  maxDistance,
  dampingFactor,
  setMinDistance,
  setMaxDistance,
  setDampingFactor,
  cameraFov,
  setCameraFov,
}) {
  return (
    <div id="panel-lab-panel-body" className="flex min-w-0 flex-col gap-3 text-xs">
      <PanelLabIntro />
      <PanelLabKeyBadge labKey={labKey} />

      <div className="flex flex-col gap-2">
        <PanelLabCollapsibleSection title="Environment" defaultOpen={false}>
          <PanelLabEnvironmentSection
            backgroundColor={backgroundColor}
            setBackgroundColor={setBackgroundColor}
            exposure={exposure}
            setExposure={setExposure}
            ambientIntensity={ambientIntensity}
            setAmbientIntensity={setAmbientIntensity}
            directionalIntensity={directionalIntensity}
            setDirectionalIntensity={setDirectionalIntensity}
          />
        </PanelLabCollapsibleSection>
        <PanelLabCollapsibleSection title="Orbit" defaultOpen={false}>
          <PanelLabOrbitSection
            minDistance={minDistance}
            maxDistance={maxDistance}
            dampingFactor={dampingFactor}
            setMinDistance={setMinDistance}
            setMaxDistance={setMaxDistance}
            setDampingFactor={setDampingFactor}
          />
        </PanelLabCollapsibleSection>
        <PanelLabCollapsibleSection title="Camera" defaultOpen={false}>
          <PanelLabCameraSection cameraFov={cameraFov} setCameraFov={setCameraFov} />
        </PanelLabCollapsibleSection>
      </div>
    </div>
  );
}
