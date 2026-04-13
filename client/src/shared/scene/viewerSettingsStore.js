import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

const DEFAULT_SETTINGS = {
  backgroundColor: '#1a1a2e',
  exposure: 1.0,
  ambientIntensity: 0.6,
  directionalIntensity: 0.8,
  directionalPosition: [5, 8, 5],
  minDistance: 2.0,
  maxDistance: 10.0,
  dampingFactor: 0.05,
  cameraPosition: [4, 3, 4],
  cameraFov: 50,
};

/**
 * Общие настройки вьюера/сцены, которыми управляет Panel Lab.
 * Эти параметры используются в ConfiguratorScene и могут быть изменены админом.
 */
export const useViewerSettingsStore = create((set) => ({
  ...DEFAULT_SETTINGS,

  setBackgroundColor: (backgroundColor) => set({ backgroundColor }),
  setExposure: (exposure) => set({ exposure }),
  setAmbientIntensity: (ambientIntensity) => set({ ambientIntensity }),
  setDirectionalIntensity: (directionalIntensity) => set({ directionalIntensity }),
  setDirectionalPosition: (directionalPosition) => set({ directionalPosition }),
  setMinDistance: (minDistance) => set({ minDistance }),
  setMaxDistance: (maxDistance) => set({ maxDistance }),
  setDampingFactor: (dampingFactor) => set({ dampingFactor }),
  setCameraPosition: (cameraPosition) => set({ cameraPosition }),
  setCameraFov: (cameraFov) => set({ cameraFov }),

  /** Сброс к дефолтам (при открытии нового файла в Lab, чтобы не тянуть кэш от предыдущего). */
  resetToDefaults: () => set((state) => ({ ...state, ...DEFAULT_SETTINGS })),

  hydrateFromPanelLab: (panelLab) =>
    set((state) => ({
      ...state,
      ...panelLab,
    })),
}));

