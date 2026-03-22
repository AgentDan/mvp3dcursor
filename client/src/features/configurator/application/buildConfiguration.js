import { traverseSceneAndBuildRawGroups } from '../infrastructure/sceneTraverse.js';

/**
 * Данные сцены: единый источник правды для структуры сцены. Содержит ссылки на узлы Three.js.
 *
 * @typedef {Object} SceneData
 * @property {import('three').Object3D[]} defaultNodes
 * @property {Object.<number, { label: string, nodes: import('three').Object3D[] }>} groups
 */

/**
 * Формирует данные сцены из сцены Three.js.
 *
 * @param {import('three').Object3D} scene
 * @returns {{ sceneData: SceneData }}
 */
export function buildConfiguration(scene) {
  const { defaultNodes, groups } = traverseSceneAndBuildRawGroups(scene);
  return { sceneData: { defaultNodes, groups } };
}
