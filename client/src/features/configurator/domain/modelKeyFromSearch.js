export const DEFAULT_CONFIGURATOR_MODEL_KEY = 'cube.gltf';

/**
 * Какой ключ модели грузит конфигуратор из query (labKey приоритетнее modelKey).
 *
 * @param {string} search
 * @returns {string}
 */
export function getModelKeyFromLocationSearch(search) {
  const params = new URLSearchParams(search);
  const labKey = params.get('labKey');
  if (labKey && labKey.trim()) return labKey.trim();

  const modelKey = params.get('modelKey');
  if (modelKey && modelKey.trim()) return modelKey.trim();

  return DEFAULT_CONFIGURATOR_MODEL_KEY;
}
