import { Canvas } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useConfigurator } from '../hooks/useConfigurator.js';
import { ConfiguratorScene } from './ConfiguratorScene.jsx';
import { VariantsPanel } from './VariantsPanel.jsx';
import { PanelLabPanel } from './PanelLabPanel.jsx';
import { ConfiguratorModelsPanel } from './ConfiguratorModelsPanel.jsx';
import { useViewerSettingsStore } from '../../../shared/scene/viewerSettingsStore.js';
import { getModelKeyFromLocationSearch } from '../domain/modelKeyFromSearch.js';

export function Configurator3D() {
  const { sceneData, setSceneData, resetSelection, modelRequestId, setModelRequestId } = useConfigurator();
  const location = useLocation();
  const modelKey = useMemo(() => getModelKeyFromLocationSearch(location.search), [location.search]);
  const isLoading = sceneData == null;
  const { cameraPosition, cameraFov, resetToDefaults } = useViewerSettingsStore();

  const requestIdRef = useRef(0);
  useLayoutEffect(() => {
    // Сразу переводим интерфейс в "режим переключения" — скрываем старую модель
    // и показываем индикатор загрузки, пока новая модель не соберется в sceneData.
    requestIdRef.current += 1;
    const nextId = requestIdRef.current;

    setModelRequestId(nextId);
    setSceneData(null);
    resetSelection();

    // Чтобы фон/окружение не "тащились" от предыдущей модели,
    // сразу сбрасываем их в дефолтные значения.
    resetToDefaults();
  }, [modelKey, resetSelection, setModelRequestId, setSceneData, resetToDefaults]);

  return (
    <div className="relative h-full w-full min-h-0 flex bg-slate-900">
      {isLoading && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-100 text-base z-30 pointer-events-none">
          Loading model…
        </div>
      )}
      <div className="configurator-canvas relative flex-1 min-w-0 min-h-0">
        <Canvas camera={{ position: cameraPosition, fov: cameraFov }} gl={{ antialias: true }}>
          <ConfiguratorScene modelKey={modelKey} requestId={modelRequestId} />
        </Canvas>
        <ConfiguratorModelsPanel />
        <VariantsPanel />
      </div>
      <PanelLabPanel />
    </div>
  );
}
