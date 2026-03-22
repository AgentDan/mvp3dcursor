/**
 * Разбирает имя узла в доменную структуру. Чистая функция, без побочных эффектов.
 * Конвенция: default_* = всегда видно; XY_Label = группа X, вариант Y (например, 11_Cone).
 *
 * @param {string} [name]
 * @returns {import('./types.js').ParsedNodeName}
 */
export function parseNodeName(name) {
  if (!name || typeof name !== 'string') return null;
  if (name.toLowerCase().startsWith('default_')) return { type: 'default' };
  const m = name.match(/^(\d)(\d)_([^_]+)$/);
  return m ? { type: 'group', groupId: +m[1], variantIndex: +m[2], label: m[3] } : null;
}
