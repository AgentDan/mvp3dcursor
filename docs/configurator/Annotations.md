# Configurator — Annotations

> **Статус:** реализовано. Схема `panelLab.annotations`, UI в Panel Lab, маркеры в `ConfiguratorAnnotations.jsx` (Billboard + `Text` «i», всплывающий блок через `Html` + **Markdown** через `react-markdown`). Лимит: **`ANNOTATIONS_MAX_ITEMS` (10)** в `shared/panelLabSchema.mjs`.

## Цель продукта

- В сцене у точки в пространстве показывается **маркер с буквой «i»** (информация).
- По **клику** открывается **компактное окно** (popover / modal) с **текстом аннотации**.
- Глобально функция **по умолчанию выключена** (`enabled: false`), чтобы не засорять вьюер.
- В данных по умолчанию заведён **один элемент** аннотации (чтобы сразу можно было настроить пример), но пока глобальный флаг выключен — в рантайме **ничего не показывается**.
- Кнопка **«+»** добавляет новые аннотации (список растёт).
- У **каждой** аннотации редактируемые **координаты X, Y, Z** в мировом пространстве (как у светов/камеры в Panel Lab).

---

## Поведение UX (черновик)

| Элемент | Поведение |
|--------|------------|
| Главный переключатель | В Panel Lab: «Annotations — On»; без него маркеры и клики не активны. |
| Маркер | Иконка «i» в 3D (billboard по камере или фиксированный спрайт — решить на этапе реализации). |
| Клик | Открывает мини-окно рядом с маркером или у курсора; закрытие по клику вне / по Esc. |
| Список | Секция в Panel Lab: карточки аннотаций; у каждой поля текста, X/Y/Z, опционально имя, удаление. |
| Добавление | «+» создаёт новую запись с дефолтной позицией (например `[0,0,0]` или копия последней) и пустым текстом. |

---

## Модель данных (предложение)

Ветка в **`extras.panelLab`** (рядом с `lighting`, `camera`, `controls`), версия схемы при необходимости поднять во **`shared/panelLabSchema.mjs`**:

```text
annotations: {
  enabled: false,           // мастер-выключатель
  items: [
    {
      id: string,           // стабильный id (uuid или slug) для ключей в React
      label?: string,       // короткий заголовок в UI списка (опционально)
      text: string,         // HTML или plain text — решить (начать с plain / markdown-safe)
      position: [x, y, z],  // world space, числа
      visible?: boolean,    // опционально: скрыть одну точку без удаления
    },
    // по умолчанию в DEFAULT_PANEL_LAB — ровно один объект в items
  ],
}
```

**Дефолты:**

- `annotations.enabled === false`
- `annotations.items.length === 1` с `text: ''` (или короткий placeholder) и `position: [0, 0, 0]` (или согласовать с центром модели позже)

**Сохранение:** тот же поток, что у остального `panelLab` — merge в glTF при **Save to S3** (`ConfiguratorModel` / сервер).

---

## Panel Lab (UI-план)

1. Новая сворачиваемая секция **«Annotations»** в `PanelLabPanelBody.jsx` (как Lighting / Camera).
2. Чекбокс **Enabled** → `patchPanelLab({ annotations: { ...ann, enabled } })`.
3. Список **items**: для каждого — `PanelLabNumberInput` для X, Y, Z; текстовое поле для **text** (и при необходимости **label**).
4. Кнопка **«+»** → append в `items` с новым `id`.
5. Кнопка удаления строки (кроме минимального количества — решить: разрешить 0 items или минимум 1).

Переиспользовать существующие паттерны: `patchTopSection`, `DEFAULT_PANEL_LAB`, `normalizePanelLabToEmbedded`.

---

## Сцена 3D (рантайм-план)

1. Новый компонент, например `ConfiguratorAnnotations.jsx` или `PanelLabAnnotationsMarkers.jsx`, подключается из **`ConfiguratorScene.jsx`** (или рядом с моделью), читает `panelLab.annotations`.
2. Если `!annotations.enabled` — **не рендерить** группу маркеров.
3. Для каждого `item` с `visible !== false` — mesh/plane с материалом «i», `position` из данных.
4. **Hit-testing:** `onClick` на маркер (R3F `mesh` + `stopPropagation` при необходимости), состояние «какая аннотация открыта» — React state или zustand slice (лучше локальный state в обёртке, если не нужен persist).
5. **Мини-окно:** портал в DOM (`createPortal`) или HTML overlay поверх canvas — удобнее для текста и доступности; позиционировать от экранных координат маркера (`vector.project(camera)`).

Лаб-режим: при желании дублировать тонкие оси/линии к точке (как у light helpers) — опционально, не в MVP.

---

## Порядок внедрения (чеклист)

1. **Схема:** `DEFAULT_PANEL_LAB.annotations`, `normalizePanelLabToEmbedded` (merge, валидация массива, обязательные поля).
2. **Стор:** убедиться, что `patchPanelLab` / deep-merge корректно обновляет вложенный `annotations`.
3. **Panel Lab UI:** секция + список + **+** + XYZ + текст.
4. **Сцена:** маркеры «i» + клик + мини-окно с текстом.
5. **Полировка:** стили, закрытие по Esc, z-index overlay, мобильный тач.
6. **Документация:** обновить `Panel-Lab.md` (оглавление + таблица полей) после появления кода.

---

## Открытые решения

- Текст: plain only vs безопасный подмножество HTML / markdown.
- Один маркер в `[0,0,0]` при пустом тексте — показывать ли маркер до заполнения текста.
- Нужен ли **look-at** billboard для «i» при произвольной камере (рекомендуется да).
- Лимит числа аннотаций (например 50) для защиты от раздувания glTF.

---

## Связанные файлы (текущий проект)

| Назначение | Путь |
|------------|------|
| Схема panelLab | `shared/panelLabSchema.mjs` |
| Сцена | `client/src/features/configurator/components/ConfiguratorScene.jsx` |
| Тело Panel Lab | `client/src/features/configurator/components/panelLab/PanelLabPanelBody.jsx` |
| Числовые поля XYZ | `client/src/features/configurator/components/panelLab/PanelLabNumberInput.jsx` |
| Справка по Panel Lab | `docs/configurator/Panel-Lab.md` |

*После реализации фичи этот документ стоит сократить до «reference» или перенести описание полей в `Panel-Lab.md`.*
