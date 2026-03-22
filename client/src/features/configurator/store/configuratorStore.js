import { create } from 'zustand';

/**
 * @typedef {import('../domain/types.js').Selection} Selection
 */

/**
 * Состояние конфигуратора (только выбор вариантов).
 *
 * sceneData хранится в общем useSceneStore и переиспользуется Panel Lab.
 *
 * @type {import('zustand').Store<{
 *   selection: Selection,
 *   setSelection: (v: Partial<Selection> | ((p: Selection) => Partial<Selection>)) => void,
 * }>}
 */
export const useConfiguratorStore = create((set) => ({
  selection: {},
  setSelection: (v) =>
    set((state) => ({
      selection: {
        ...state.selection,
        ...(typeof v === 'function' ? v(state.selection) : v),
      },
    })),
  resetSelection: () => set({ selection: {} }),
}));
