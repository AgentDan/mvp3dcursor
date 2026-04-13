import { Suspense, useEffect, useMemo, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import { ConfiguratorModel } from './ConfiguratorModel.jsx';
import { useViewerSettingsStore } from '../../../shared/scene/viewerSettingsStore.js';
import { PanelLabGLSync } from './PanelLabGLSync.jsx';
import { PanelLabPostFx } from './PanelLabPostFx.jsx';

export function ConfiguratorScene({ modelKey, requestId }) {
  const panelLab = useViewerSettingsStore((s) => s.panelLab);
  const { environment, lighting, ground, renderer, postprocessing, camera, controls } = panelLab;

  const { camera: threeCamera } = useThree();
  const dirLightRef = useRef(null);

  const showSolidBackground = useMemo(() => {
    const bg = environment?.background;
    const hdri = environment?.hdri;
    if (bg?.type !== 'color') return false;
    if (hdri?.enabled && hdri?.background) return false;
    return true;
  }, [environment]);

  const hdriRotation = environment?.hdri?.rotation ?? [0, 0, 0];

  // Depend on numeric camera fields only. panelLab is re-normalized on every Panel Lab patch, so
  // camera.position is a new array reference each time — syncing on that reference would reset
  // OrbitControls whenever any unrelated control (environment, lights, etc.) changes.
  const camPx = camera?.position?.[0];
  const camPy = camera?.position?.[1];
  const camPz = camera?.position?.[2];
  const camFov = camera?.fov;
  const camNear = camera?.near;
  const camFar = camera?.far;

  useEffect(() => {
    if (!threeCamera) return;

    /* eslint-disable react-hooks/immutability -- sync default camera from Panel Lab store */
    if (typeof camPx === 'number' && typeof camPy === 'number' && typeof camPz === 'number') {
      threeCamera.position.set(camPx, camPy, camPz);
    }

    if (typeof camFov === 'number') threeCamera.fov = camFov;
    if (typeof camNear === 'number') threeCamera.near = camNear;
    if (typeof camFar === 'number') threeCamera.far = camFar;

    threeCamera.updateProjectionMatrix();
    /* eslint-enable react-hooks/immutability */
  }, [threeCamera, camPx, camPy, camPz, camFov, camNear, camFar]);

  useEffect(() => {
    const L = dirLightRef.current;
    const dir = lighting?.directional;
    if (!L || !dir?.shadow?.enabled) return;

    L.shadow.mapSize.set(dir.shadow.mapSize[0] ?? 2048, dir.shadow.mapSize[1] ?? 2048);
    L.shadow.bias = dir.shadow.bias;
    L.shadow.normalBias = dir.shadow.normalBias;
    L.shadow.radius = dir.shadow.radius;

    const cam = L.shadow.camera;
    const sc = dir.shadow.camera;
    if (cam && sc) {
      cam.near = sc.near;
      cam.far = sc.far;
      cam.left = sc.left;
      cam.right = sc.right;
      cam.top = sc.top;
      cam.bottom = sc.bottom;
      cam.updateProjectionMatrix();
    }
  }, [lighting?.directional]);

  const fog = environment?.fog;
  const pointLights = lighting?.pointLights ?? [];
  const spotLights = lighting?.spotLights ?? [];

  return (
    <>
      <PanelLabGLSync renderer={renderer} />

      {showSolidBackground ? (
        <color attach="background" args={[environment.background.color]} />
      ) : null}

      {environment?.hdri?.enabled ? (
        <group rotation={hdriRotation}>
          <Suspense fallback={null}>
            <Environment
              files={environment.hdri.url}
              background={environment.hdri.background}
              environmentIntensity={environment.hdri.intensity}
            />
          </Suspense>
        </group>
      ) : null}

      {fog?.enabled && fog.type === 'linear' ? (
        <fog attach="fog" args={[fog.color, fog.near, fog.far]} />
      ) : null}

      {lighting?.ambient?.enabled ? (
        <ambientLight color={lighting.ambient.color} intensity={lighting.ambient.intensity} />
      ) : null}

      {lighting?.hemisphere?.enabled ? (
        <hemisphereLight
          skyColor={lighting.hemisphere.skyColor}
          groundColor={lighting.hemisphere.groundColor}
          intensity={lighting.hemisphere.intensity}
        />
      ) : null}

      {lighting?.directional?.enabled ? (
        <directionalLight
          ref={dirLightRef}
          color={lighting.directional.color}
          intensity={lighting.directional.intensity}
          position={lighting.directional.position}
          castShadow={!!lighting.directional.shadow?.enabled && !!renderer?.shadowMap?.enabled}
        >
          <object3D attach="target" position={lighting.directional.target} />
        </directionalLight>
      ) : null}

      {pointLights.map((pl, i) =>
        pl && pl.enabled !== false ? (
          <pointLight
            key={`pl-${i}`}
            color={pl.color ?? '#ffffff'}
            intensity={pl.intensity ?? 1}
            position={pl.position ?? [0, 0, 0]}
            distance={pl.distance}
            decay={pl.decay}
          />
        ) : null,
      )}

      {spotLights.map((sl, i) =>
        sl && sl.enabled !== false ? (
          <spotLight
            key={`sl-${i}`}
            color={sl.color ?? '#ffffff'}
            intensity={sl.intensity ?? 1}
            position={sl.position ?? [0, 5, 0]}
            angle={sl.angle ?? Math.PI / 6}
            penumbra={sl.penumbra ?? 0}
            distance={sl.distance}
            decay={sl.decay}
          >
            <object3D attach="target" position={sl.target ?? [0, 0, 0]} />
          </spotLight>
        ) : null,
      )}

      {ground?.enabled ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[ground.size, ground.size]} />
          <meshStandardMaterial
            color={ground.material?.color ?? '#ffffff'}
            transparent
            opacity={ground.material?.opacity ?? 1}
            roughness={ground.material?.roughness ?? 1}
          />
        </mesh>
      ) : null}

      <Suspense fallback={<group />}>
        <ConfiguratorModel key={`${modelKey}:${requestId}`} modelKey={modelKey} requestId={requestId} />
      </Suspense>

      <OrbitControls
        enableDamping={controls.enableDamping}
        enablePan={controls.enablePan}
        enableZoom={controls.enableZoom}
        enableRotate={controls.enableRotate}
        dampingFactor={controls.dampingFactor}
        minDistance={controls.minDistance}
        maxDistance={controls.maxDistance}
      />

      <PanelLabPostFx postprocessing={postprocessing} />
    </>
  );
}
