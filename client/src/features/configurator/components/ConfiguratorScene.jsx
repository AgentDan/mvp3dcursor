import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import { ConfiguratorModel } from './ConfiguratorModel.jsx';
import { PanelLabLightHelpers } from './PanelLabLightHelpers.jsx';
import { useLabKeyFromLocation } from './panelLab/useLabKeyFromLocation.js';
import { useViewerSettingsStore } from '../../../shared/scene/viewerSettingsStore.js';
import { PanelLabGLSync } from './PanelLabGLSync.jsx';
import { PanelLabPostFx } from './PanelLabPostFx.jsx';
import { DEFAULT_PANEL_LAB } from '@repo/panelLabSchema';

const DEF_DIR = DEFAULT_PANEL_LAB.lighting.directional;
const DEF_SHADOW = DEFAULT_PANEL_LAB.lighting.shadows;

function applyCommonShadow(light, shadows, lightType = 'directional') {
  if (!light?.shadow || !shadows) return;
  const ms = shadows.mapSize ?? DEF_SHADOW.mapSize;
  light.shadow.mapSize.set(ms?.[0] ?? 2048, ms?.[1] ?? 2048);
  const defaultBias = lightType === 'directional' ? DEF_SHADOW.bias : Math.max(0, DEF_SHADOW.bias);
  const rawBias = typeof shadows.bias === 'number' ? shadows.bias : defaultBias;
  // Spot/Point lights are much more sensitive to negative bias (acne).
  light.shadow.bias = lightType === 'directional' ? rawBias : Math.max(0, rawBias);
  const defaultNormalBias = lightType === 'directional' ? DEF_SHADOW.normalBias : Math.max(0.1, DEF_SHADOW.normalBias);
  const rawNormalBias = typeof shadows.normalBias === 'number' ? shadows.normalBias : defaultNormalBias;
  light.shadow.normalBias = lightType === 'directional' ? rawNormalBias : Math.max(0.1, rawNormalBias);
  light.shadow.radius = typeof shadows.radius === 'number' ? shadows.radius : DEF_SHADOW.radius;
  light.shadow.blurSamples = typeof shadows.blurSamples === 'number' ? shadows.blurSamples : DEF_SHADOW.blurSamples;
}

function applyShadowIntensity(light, shadowIntensity) {
  if (!light?.shadow) return;
  const n = Number(shadowIntensity);
  light.shadow.intensity = Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : 1;
}

function applyDirectionalShadowCamera(light, shadows) {
  const cam = light?.shadow?.camera;
  const sc = shadows?.camera ?? DEF_SHADOW.camera;
  if (!cam || !sc) return;
  cam.near = typeof sc.near === 'number' ? sc.near : DEF_SHADOW.camera.near;
  cam.far = typeof sc.far === 'number' ? sc.far : DEF_SHADOW.camera.far;
  cam.left = typeof sc.left === 'number' ? sc.left : DEF_SHADOW.camera.left;
  cam.right = typeof sc.right === 'number' ? sc.right : DEF_SHADOW.camera.right;
  cam.top = typeof sc.top === 'number' ? sc.top : DEF_SHADOW.camera.top;
  cam.bottom = typeof sc.bottom === 'number' ? sc.bottom : DEF_SHADOW.camera.bottom;
  cam.updateProjectionMatrix();
}

function applySpotOrPointShadowCamera(light, shadows) {
  const cam = light?.shadow?.camera;
  const sc = shadows?.camera ?? DEF_SHADOW.camera;
  if (!cam || !sc) return;
  if (typeof sc.near === 'number') cam.near = sc.near;
  if (typeof sc.far === 'number') cam.far = sc.far;
  cam.updateProjectionMatrix();
}

function syncLightTarget(light, target) {
  if (!light?.target || !Array.isArray(target)) return;
  const [x = 0, y = 0, z = 0] = target;
  light.target.position.set(x, y, z);
  if (light.parent && light.target.parent !== light.parent) {
    light.parent.add(light.target);
  }
  light.target.updateMatrixWorld();
}

export function ConfiguratorScene({ modelKey, requestId }) {
  const panelLab = useViewerSettingsStore((s) => s.panelLab);
  const labKey = useLabKeyFromLocation();
  const { environment, lighting, ground, renderer, postprocessing, camera, controls } = panelLab;

  const { camera: threeCamera } = useThree();
  const dirLightRef = useRef(null);
  const extraDirRefs = useRef([]);
  const pointRefs = useRef([]);
  const spotRefs = useRef([]);

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
  const globalShadows = lighting?.shadows ?? DEF_SHADOW;

  useLayoutEffect(() => {
    const L = dirLightRef.current;
    const dir = lighting?.directional;
    if (!L || !globalShadows?.enabled || !shadowMapEnabled || dir?.castShadow === false) return;

    applyCommonShadow(L, globalShadows, 'directional');
    applyShadowIntensity(L, dir?.shadowIntensity);

    applyDirectionalShadowCamera(L, globalShadows);
    syncLightTarget(L, Array.isArray(dir?.target) ? dir.target : DEF_DIR.target);

    L.shadow.needsUpdate = true;
  }, [lighting?.directional, globalShadows, shadowMapEnabled, shadowMapType]);

  const fog = environment?.fog;
  const directionalLights = lighting?.directionalLights ?? [];
  const pointLights = lighting?.pointLights ?? [];
  const spotLights = lighting?.spotLights ?? [];

  useLayoutEffect(() => {
    syncLightTarget(
      dirLightRef.current,
      Array.isArray(lighting?.directional?.target) ? lighting.directional.target : DEF_DIR.target,
    );
    directionalLights.forEach((dl, i) => {
      syncLightTarget(extraDirRefs.current[i], Array.isArray(dl?.target) ? dl.target : DEF_DIR.target);
    });
    pointRefs.current = pointRefs.current.slice(0, pointLights.length);
    spotLights.forEach((sl, i) => {
      syncLightTarget(spotRefs.current[i], Array.isArray(sl?.target) ? sl.target : [0, 0, 0]);
    });
    spotRefs.current = spotRefs.current.slice(0, spotLights.length);
    extraDirRefs.current = extraDirRefs.current.slice(0, directionalLights.length);
  }, [lighting?.directional?.target, directionalLights, pointLights.length, spotLights]);

  useLayoutEffect(() => {
    if (!globalShadows?.enabled || !shadowMapEnabled) return;
    directionalLights.forEach((dl, i) => {
      const light = extraDirRefs.current[i];
      if (!light || dl?.enabled === false || dl?.castShadow === false) return;
      applyCommonShadow(light, globalShadows, 'directional');
      applyShadowIntensity(light, dl?.shadowIntensity);
      applyDirectionalShadowCamera(light, globalShadows);
      light.shadow.needsUpdate = true;
    });
    pointLights.forEach((pl, i) => {
      const light = pointRefs.current[i];
      if (!light || pl?.enabled === false || !pl?.castShadow) return;
      applyCommonShadow(light, globalShadows, 'point');
      applyShadowIntensity(light, pl?.shadowIntensity);
      applySpotOrPointShadowCamera(light, globalShadows);
      light.shadow.needsUpdate = true;
    });
    spotLights.forEach((sl, i) => {
      const light = spotRefs.current[i];
      if (!light || sl?.enabled === false || !sl?.castShadow) return;
      applyCommonShadow(light, globalShadows, 'spot');
      applyShadowIntensity(light, sl?.shadowIntensity);
      applySpotOrPointShadowCamera(light, globalShadows);
      light.shadow.needsUpdate = true;
    });
  }, [directionalLights, pointLights, spotLights, globalShadows, shadowMapEnabled]);

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
          castShadow={!!globalShadows?.enabled && !!renderer?.shadowMap?.enabled && lighting.directional.castShadow !== false}
          onUpdate={(light) =>
            syncLightTarget(
              light,
              Array.isArray(lighting.directional.target) ? lighting.directional.target : DEF_DIR.target,
            )
          }
        />
      ) : null}

      {directionalLights.map((dl, i) =>
        dl && dl.enabled !== false ? (
          <directionalLight
            key={`dl-${i}`}
            ref={(el) => {
              extraDirRefs.current[i] = el;
            }}
            color={dl.color ?? DEF_DIR.color}
            intensity={typeof dl.intensity === 'number' ? dl.intensity : DEF_DIR.intensity}
            position={Array.isArray(dl.position) ? dl.position : DEF_DIR.position}
            castShadow={!!globalShadows?.enabled && !!renderer?.shadowMap?.enabled && dl.castShadow !== false}
            onUpdate={(light) => {
              syncLightTarget(light, Array.isArray(dl.target) ? dl.target : DEF_DIR.target);
            }}
          />
        ) : null,
      )}

      {pointLights.map((pl, i) =>
        pl && pl.enabled !== false ? (
          <pointLight
            key={`pl-${i}`}
            ref={(el) => {
              pointRefs.current[i] = el;
            }}
            color={pl.color ?? '#ffffff'}
            intensity={pl.intensity ?? 1}
            position={pl.position ?? [0, 0, 0]}
            distance={pl.distance}
            decay={pl.decay}
            castShadow={!!globalShadows?.enabled && !!renderer?.shadowMap?.enabled && !!pl.castShadow}
          />
        ) : null,
      )}

      {spotLights.map((sl, i) =>
        sl && sl.enabled !== false ? (
          <spotLight
            key={`sl-${i}`}
            ref={(el) => {
              spotRefs.current[i] = el;
            }}
            color={sl.color ?? '#ffffff'}
            intensity={sl.intensity ?? 1}
            position={sl.position ?? [0, 5, 0]}
            angle={sl.angle ?? Math.PI / 6}
            penumbra={sl.penumbra ?? 0}
            distance={sl.distance}
            decay={sl.decay}
            castShadow={!!globalShadows?.enabled && !!renderer?.shadowMap?.enabled && !!sl.castShadow}
            onUpdate={(light) => {
              syncLightTarget(light, Array.isArray(sl.target) ? sl.target : [0, 0, 0]);
            }}
          />
        ) : null,
      )}

      {labKey ? <PanelLabLightHelpers lighting={lighting} /> : null}

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
