import { useMemo, useEffect } from 'react';
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

  const { sceneData: built } = useMemo(() => buildConfiguration(clonedScene), [clonedScene]);
  const localGroupOptions = useMemo(() => deriveGroupOptions(built.groups), [built]);

  useEffect(() => {
    // Пишем sceneData в стор только для "текущего" запроса.
    setSceneDataForRequest(requestId, built);
  }, [built, requestId, modelRequestId, setSceneDataForRequest]);

  useEffect(() => {
    // Защита от устаревших загрузок при быстрых кликах.
    if (modelRequestId !== requestId) return;

    // При каждой смене модели сначала сбрасываем окружение к дефолтам,
    // чтобы не тянуть значения от предыдущего проекта.
    resetViewerToDefaults();

    // Drei's useGLTF exposes the parsed GLTF JSON via parser.json.
    // Top-level extras (where panelLab lives) are stored there.
    const extrasPanelLab =
      gltf?.parser?.json?.extras?.panelLab ?? gltf?.userData?.gltf?.extras?.panelLab;

    if (extrasPanelLab && typeof extrasPanelLab === 'object') {
      // eslint-disable-next-line no-console
      //console.log('[Configurator] PanelLab environment for model', modelKey, extrasPanelLab);
      hydrateFromPanelLab(extrasPanelLab);
    } else {
      // eslint-disable-next-line no-console
      //console.log('[Configurator] No PanelLab extras for model', modelKey);
    }
  }, [gltf, hydrateFromPanelLab, modelKey, modelRequestId, resetViewerToDefaults, requestId]);

  useEffect(() => {
    // Важно: применяем visibility по локальному `built`, чтобы избежать рассинхрона
    // между сценой, которая сейчас отображается, и `sceneData` в сторе.
    if (modelRequestId !== requestId) return;
    updateConfiguration(selection, localGroupOptions, built);
  }, [selection, localGroupOptions, built, modelRequestId, requestId]);

  return <primitive object={clonedScene} />;
}
