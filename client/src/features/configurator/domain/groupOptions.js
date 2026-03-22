/**
 * @typedef {import('./types.js').GroupOptionsMap} GroupOptionsMap
 */

/**
 * Структура групп (без Three.js): для UI достаточно label и длины массива.
 * @typedef {Object.<number, { label: string, nodes: Array<unknown> }>} GroupsLike
 */

/**
 * Получает опции групп для UI из "сырых" данных групп. Чистая функция; единственный источник правды — sceneData.groups.
 *
 * @param {GroupsLike} groups
 * @returns {GroupOptionsMap}
 */
export function deriveGroupOptions(groups) {
  const map = /** @type {GroupOptionsMap} */ ({});
  for (const [id, g] of Object.entries(groups)) {
    if (g && typeof g.label === 'string' && Array.isArray(g.nodes)) {
      map[+id] = { label: g.label, count: g.nodes.length };
    }
  }
  return map;
}
