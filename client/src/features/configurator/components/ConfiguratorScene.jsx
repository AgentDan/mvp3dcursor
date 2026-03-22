import { Suspense, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { ConfiguratorModel } from './ConfiguratorModel.jsx';
import { useViewerSettingsStore } from '../../../shared/scene/viewerSettingsStore.js';

export function ConfiguratorScene({ modelKey, requestId }) {
  const {
    backgroundColor,
    ambientIntensity,
    directionalIntensity,
    directionalPosition,
    minDistance,
    maxDistance,
    dampingFactor,
    cameraPosition,
    cameraFov,
  } = useViewerSettingsStore();

  const { camera } = useThree();

  useEffect(() => {
    if (!camera) return;

    if (Array.isArray(cameraPosition) && cameraPosition.length === 3) {
      camera.position.set(cameraPosition[0], cameraPosition[1], cameraPosition[2]);
    }

    if (typeof cameraFov === 'number') {
      camera.fov = cameraFov;
    }

    camera.updateProjectionMatrix();
  }, [camera, cameraPosition, cameraFov]);

  return (
    <>
      <color attach="background" args={[backgroundColor]} />
      <ambientLight intensity={ambientIntensity} />
      <directionalLight position={directionalPosition} intensity={directionalIntensity} />
      <Suspense fallback={<group />}>
        <ConfiguratorModel key={`${modelKey}:${requestId}`} modelKey={modelKey} requestId={requestId} />
      </Suspense>
      <OrbitControls
        enableDamping
        dampingFactor={dampingFactor}
        minDistance={minDistance}
        maxDistance={maxDistance}
      />
    </>
  );
}
