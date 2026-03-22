import { create } from 'zustand';

/**
 * Хранилище общих данных 3D‑сцены.
 *
 * SceneData переиспользуется между Configurator и Panel Lab.
 *
 * @typedef {import('../../features/configurator/application/buildConfiguration.js').SceneData} SceneData
 */

export const useSceneStore = create((set) => ({
  /** @type {SceneData | null} */
  sceneData: null,
  /**
   * Уникальный id последнего запроса на загрузку модели в конфигураторе.
   * Нужен, чтобы устаревшие загрузки не перезаписывали состояние.
   * @type {number}
   */
  modelRequestId: 0,
  /** @param {SceneData | null} data */
  setSceneData: (data) => set({ sceneData: data }),
  /** @param {number} id */
  setModelRequestId: (id) => set({ modelRequestId: id }),
  /**
   * Поставить sceneData только если это "текущий" запрос на загрузку.
   * @param {number} id
   * @param {SceneData | null} data
   */
  setSceneDataForRequest: (id, data) =>
    set((state) => (state.modelRequestId === id ? { sceneData: data } : {})),
}));

