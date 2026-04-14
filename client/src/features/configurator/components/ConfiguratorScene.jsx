import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import { ConfiguratorModel } from './ConfiguratorModel.jsx';
import { useViewerSettingsStore } from '../../../shared/scene/viewerSettingsStore.js';
import { PanelLabGLSync } from './PanelLabGLSync.jsx';
import { PanelLabPostFx } from './PanelLabPostFx.jsx';
import { DEFAULT_PANEL_LAB } from '@repo/panelLabSchema';

const DEF_DIR = DEFAULT_PANEL_LAB.lighting.directional;

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

  const shadowMapEnabled = !!renderer?.shadowMap?.enabled;
  const shadowMapType = renderer?.shadowMap?.type;

  useLayoutEffect(() => {
    const L = dirLightRef.current;
    const dir = lighting?.directional;
    if (!L || !dir?.shadow?.enabled || !shadowMapEnabled) return;

    const ms = dir.shadow.mapSize ?? DEF_DIR.shadow.mapSize;
    L.shadow.mapSize.set(ms?.[0] ?? 2048, ms?.[1] ?? 2048);
    L.shadow.bias = typeof dir.shadow.bias === 'number' ? dir.shadow.bias : DEF_DIR.shadow.bias;
    L.shadow.normalBias =
      typeof dir.shadow.normalBias === 'number' ? dir.shadow.normalBias : DEF_DIR.shadow.normalBias;
    L.shadow.radius = typeof dir.shadow.radius === 'number' ? dir.shadow.radius : DEF_DIR.shadow.radius;
    L.shadow.blurSamples =
      typeof dir.shadow.blurSamples === 'number' ? dir.shadow.blurSamples : DEF_DIR.shadow.blurSamples;

    const cam = L.shadow.camera;
    const sc = dir.shadow.camera ?? DEF_DIR.shadow.camera;
    if (cam && sc) {
      cam.near = typeof sc.near === 'number' ? sc.near : DEF_DIR.shadow.camera.near;
      cam.far = typeof sc.far === 'number' ? sc.far : DEF_DIR.shadow.camera.far;
      cam.left = typeof sc.left === 'number' ? sc.left : DEF_DIR.shadow.camera.left;
      cam.right = typeof sc.right === 'number' ? sc.right : DEF_DIR.shadow.camera.right;
      cam.top = typeof sc.top === 'number' ? sc.top : DEF_DIR.shadow.camera.top;
      cam.bottom = typeof sc.bottom === 'number' ? sc.bottom : DEF_DIR.shadow.camera.bottom;
      cam.updateProjectionMatrix();
    }

    L.shadow.needsUpdate = true;
  }, [lighting?.directional, shadowMapEnabled, shadowMapType]);

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
          color={lighting.directional.color ?? DEF_DIR.color}
          intensity={
            typeof lighting.directional.intensity === 'number' ? lighting.directional.intensity : DEF_DIR.intensity
          }
          position={
            Array.isArray(lighting.directional.position) ? lighting.directional.position : DEF_DIR.position
          }
          castShadow={!!lighting.directional.shadow?.enabled && !!renderer?.shadowMap?.enabled}
        >
          <object3D
            attach="target"
            position={
              Array.isArray(lighting.directional.target) ? lighting.directional.target : DEF_DIR.target
            }
          />
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
