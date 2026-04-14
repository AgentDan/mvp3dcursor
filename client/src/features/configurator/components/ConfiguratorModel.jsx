import { useMemo, useEffect, useLayoutEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useGLTF } from '@react-three/drei';
import { buildConfiguration } from '../application/buildConfiguration.js';
import { updateConfiguration } from '../application/updateConfiguration.js';
import { useConfigurator } from '../hooks/useConfigurator.js';
import { useViewerSettingsStore } from '../../../shared/scene/viewerSettingsStore.js';
import { deriveGroupOptions } from '../domain/groupOptions.js';

export function ConfiguratorModel({ modelKey, requestId }) {
  const {
    setSceneDataForRequest,
    modelRequestId,
    selection,
  } = useConfigurator();

  const modelUrl = `/api/s3/model/${encodeURIComponent(modelKey)}`;
  const gltf = useGLTF(modelUrl);
  const { scene } = gltf;

  const hydrateFromPanelLab = useViewerSettingsStore((s) => s.hydrateFromPanelLab);
  const resetViewerToDefaults = useViewerSettingsStore((s) => s.resetToDefaults);

  // important:
  // `useGLTF` caches and may reuse the same `scene` instance across switches.
  // If we reuse the same object reference, R3F can keep an old attachment/visibility state.
  // Cloning guarantees that each switch renders a fresh object in the scene graph.
  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  const meshShadowsOn = useViewerSettingsStore(
    useShallow((s) => {
      const pl = s.panelLab;
      return (
        !!pl.renderer?.shadowMap?.enabled &&
        !!pl.lighting?.directional?.enabled &&
        !!pl.lighting?.directional?.shadow?.enabled
      );
    }),
  );

  // Apply embedded panelLab before paint so mesh shadow flags (useEffect below) see the hydrated store.
  useLayoutEffect(() => {
    if (modelRequestId !== requestId) return;

    resetViewerToDefaults();

    const extrasPanelLab =
      gltf?.parser?.json?.extras?.panelLab ?? gltf?.userData?.gltf?.extras?.panelLab;

    if (extrasPanelLab && typeof extrasPanelLab === 'object') {
      hydrateFromPanelLab(extrasPanelLab);
    }
  }, [gltf, hydrateFromPanelLab, modelKey, modelRequestId, resetViewerToDefaults, requestId]);

  useEffect(() => {
    clonedScene.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = meshShadowsOn;
        obj.receiveShadow = meshShadowsOn;
      }
    });
  }, [clonedScene, meshShadowsOn]);

  const { sceneData: built } = useMemo(() => buildConfiguration(clonedScene), [clonedScene]);
  const localGroupOptions = useMemo(() => deriveGroupOptions(built.groups), [built]);

  useEffect(() => {
    // Write sceneData only for the current load request.
    setSceneDataForRequest(requestId, built);
  }, [built, requestId, modelRequestId, setSceneDataForRequest]);

  useEffect(() => {
    // Apply visibility from local `built` to avoid desync between the rendered scene and store sceneData.
    if (modelRequestId !== requestId) return;
    updateConfiguration(selection, localGroupOptions, built);
  }, [selection, localGroupOptions, built, modelRequestId, requestId]);

  return <primitive object={clonedScene} />;
}
