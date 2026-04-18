# Panel Lab — reference

> **Panel Lab** — дерево настроек вьюера, хранится в **`extras.panelLab`** внутри glTF 2.0 и в Zustand (`useViewerSettingsStore().panelLab`). Схема: **`version: 1`**, источник правды — `shared/panelLabSchema.mjs`.

| | Meaning |
|---|--------|
| **Load** | При открытии модели: сброс к дефолтам → слияние с `extras.panelLab` из файла (`ConfiguratorModel.jsx`). |
| **Save** | Кнопка **Save to S3** шлёт текущий `panelLab` на сервер и патчит `.gltf`. |
| **Reset** | Клик по **Lab file (S3 key)** — полный сброс к дефолтам схемы (только в памяти, пока не сохраните). |

### Легенда применения в рантайме

| Tag | Meaning |
|-----|--------|
| **Applied** | Значение реально влияет на сцену / рендер. |
| **Partial** | Часть полей объекта используется, часть — нет. |
| **Stored** | Пишется в JSON и панель, но **код сцены это не читает** (кандидат на доработку). |
| **UI only** | Есть только в данных; **в Panel Lab нет контрола** (можно править в JSON / добавить UI). |

---

## Оглавление

1. [Environment](#1-environment)  
2. [Lighting — Ambient](#2-lighting--ambient)  
3. [Lighting — Hemisphere](#3-lighting--hemisphere)  
4. [Lighting — Directional](#4-lighting--directional)  
5. [Lighting — Point](#5-lighting--point)  
6. [Lighting — Spot](#6-lighting--spot)  
7. [Shadows](#7-shadows)  
8. [Ground](#8-ground)  
9. [Renderer](#9-renderer)  
10. [Postprocessing](#10-postprocessing)  
11. [Camera](#11-camera)  
12. [Controls (Orbit)](#12-controls-orbit)  
13. [В схеме и движке, но без контролов в панели](#13-в-схеме-и-движке-но-без-контролов-в-панели)  
14. [В панели или схеме, но не подключено к рантайму](#14-в-панели-или-схеме-но-не-подключено-к-рантайму)  
15. [Идеи расширения (ещё не в проекте)](#15-идеи-расширения-ещё-не-в-проекте)  
16. [Файлы](#16-файлы)

---

## 1. Environment

**Секция панели:** `Environment` → `PanelLabEnvironmentSection.jsx`

| Control | JSON path | Typical UI range / type | Runtime |
|---------|-----------|-------------------------|---------|
| Color + hex | `environment.background.color` | color picker, text | **Applied** — `<color attach="background">` если нет HDRI как фона |
| Background blur | `environment.background.blur` | 0…1, step 0.01 | **Stored** — в сцене не используется |
| Background intensity | `environment.background.intensity` | 0…5 | **Stored** — в сцене не используется |
| Enable HDRI | `environment.hdri.enabled` | checkbox | **Applied** |
| URL (.hdr) | `environment.hdri.url` | text | **Applied** — `Environment files={url}` |
| HDRI intensity | `environment.hdri.intensity` | 0…5 | **Applied** — `environmentIntensity` |
| HDRI as visible background | `environment.hdri.background` | checkbox | **Applied** |
| HDRI rotation | `environment.hdri.rotation` | *(только JSON / дефолт схемы)* | **Applied** — `group rotation` вокруг `Environment` |
| HDRI mapping | `environment.hdri.mapping` | *(UI only)* | **Stored** — не проброшено в `Environment` |
| HDRI blur / lod | `environment.hdri.blur`, `lod` | *(UI only)* | **Stored** |
| Fog on | `environment.fog.enabled` | checkbox | **Applied** — линейный туман |
| Fog color | `environment.fog.color` | color | **Applied** |
| Fog near / far | `environment.fog.near`, `far` | 0…200 / 0…500, step **0.1** | **Applied** |

---

## 2. Lighting — Ambient

**Секция:** `Lighting Ambient`

| Control | JSON path | Range | Runtime |
|---------|-----------|-------|---------|
| On | `lighting.ambient.enabled` | checkbox | **Applied** |
| Intensity | `lighting.ambient.intensity` | 0…5 | **Applied** |
| Color | `lighting.ambient.color` | color | **Applied** |

---

## 3. Lighting — Hemisphere

**Секция:** `Lighting Hemisphere`

| Control | JSON path | Range | Runtime |
|---------|-----------|-------|---------|
| On | `lighting.hemisphere.enabled` | checkbox | **Applied** |
| Intensity | `lighting.hemisphere.intensity` | 0…5 | **Applied** |

| Field (schema) | In panel? | Runtime |
|----------------|-----------|---------|
| `skyColor`, `groundColor` | **UI only** (есть в `DEFAULT_PANEL_LAB`, правка только JSON) | **Applied** — берутся из данных, дефолты с серым/тёмным |

---

## 4. Lighting — Directional

**Секция:** `Lighting Directional` — основной + карточки **+ Add directional**

### Default directional

| Control | JSON path | Range | Runtime |
|---------|-----------|-------|---------|
| On | `lighting.directional.enabled` | checkbox | **Applied** |
| hlp | `lighting.directional.sceneHelper` | checkbox | **Applied** — оверлей в Lab (`PanelLabLightHelpers`) |
| Intensity | `lighting.directional.intensity` | 0…10 | **Applied** |
| Pos X/Y/Z | `lighting.directional.position` | −50…50 | **Applied** |
| Target X/Y/Z | `lighting.directional.target` | −50…50 | **Applied** |
| Casts shadows | `lighting.directional.castShadow` | checkbox | **Applied** |
| Shadow intensity | `lighting.directional.shadowIntensity` | 0…1 | **Applied** |

| Field | In panel? | Runtime |
|-------|-----------|---------|
| `color` | **UI only** | **Applied** — из glTF/дефолта `#ffffff` |

### Extra directionals (`lighting.directionalLights[]`)

Те же контролы по смыслу: **On**, **hlp**, **Intensity**, **Pos**, **Target**, **Casts shadows**, **Shadow intensity**. Карточка удаляется кнопкой **trash**.

---

## 5. Lighting — Point

**Секция:** `Lighting Point` — кнопка **+**, подсущности с **On**, **hlp**, именем, удалением.

| Control | JSON path | Range | Runtime |
|---------|-----------|-------|---------|
| Name | `pointLights[].name` | text | **Stored** (для UI) |
| On | `pointLights[].enabled` | checkbox | **Applied** |
| hlp | `pointLights[].sceneHelper` | checkbox | **Applied** |
| Intensity | `pointLights[].intensity` | 0…20 | **Applied** |
| Color | `pointLights[].color` | color | **Applied** |
| Pos X/Y/Z | `pointLights[].position` | −50…50 | **Applied** |
| Distance | `pointLights[].distance` | 0…500 | **Applied** |
| Decay | `pointLights[].decay` | 0…4 | **Applied** |
| Casts shadows | `pointLights[].castShadow` | checkbox | **Applied** |
| Shadow intensity | `pointLights[].shadowIntensity` | 0…1 | **Applied** |

---

## 6. Lighting — Spot

**Секция:** `Lighting Spot` — аналогично point, плюс угол и пенумбра.

| Control | JSON path | Range | Runtime |
|---------|-----------|-------|---------|
| *(same as point for name, on, hlp, intensity, color, pos, shadow flags)* | | | **Applied** |
| Target X/Y/Z | `spotLights[].target` | −50…50 | **Applied** |
| Angle (rad) | `spotLights[].angle` | 0.01…π/2 | **Applied** |
| Penumbra | `spotLights[].penumbra` | 0…1 | **Applied** |
| Distance / Decay | `spotLights[].distance`, `decay` | как у point | **Applied** |

---

## 7. Shadows

**Секция:** `Shadows` — глобальные настройки теней + орто-«камера» для directional shadow map.

| Control | JSON path | Range / options | Runtime |
|---------|-----------|-----------------|---------|
| Enabled | `lighting.shadows.enabled` | checkbox | **Applied** |
| Shadow map size | `lighting.shadows.mapSize` | 1024 / 2048 / 4096 (квадрат) | **Applied** |
| Blur radius | `lighting.shadows.radius` | 0…100 | **Applied** (VSM) |
| VSM blur samples | `lighting.shadows.blurSamples` | 1…32 | **Applied** (если тип VSM) |
| Depth bias | `lighting.shadows.bias` | −0.02…0.02 | **Applied** |
| Normal bias | `lighting.shadows.normalBias` | 0…1 | **Applied** |
| Cam near/far/left/right/top/bottom | `lighting.shadows.camera.*` | см. UI | **Applied** — frustum теневой ортокамеры |

Подсказка в UI про **PCFSoft** в Three r182 и кнопка переключения рендерера на **VSM** — см. `PanelLabShadowsSection.jsx`.

### Тени в рантайме (аудит)

**Отражения ≠ карты теней.** Отражения в глянце и HDRI (`Environment`) — это окружение/зонды; **динамические тени** — отдельный проход shadow map. В глянцевом материале может быть сильный зеркальный блик от HDRI при этом тени на диффузной части всё равно видны.

**Общая цепочка (все типы света):**

1. **Renderer → Shadow map** (`renderer.shadowMap.enabled`) — иначе `Canvas`/`WebGLRenderer` не держит shadow map включённым согласованно с R3F.
2. **Lighting → Shadows → Enabled** (`lighting.shadows.enabled`).
3. Хотя бы один источник с **включённым** светом и **`castShadow !== false`** (directional / extra directional / point / spot).
4. На мешах модели выставляются **`castShadow` / `receiveShadow`** через `ConfiguratorModel.jsx`, когда выполнены п.1–3 (`meshShadowsOn`).

**Directional:** теневая «камера» — ортогональная; поля **`lighting.shadows.camera.*`** задают frustum. **Spot:** перспективная теневая камера привязана к углу конуса; из Panel Lab на неё явно пробрасываются в основном **near** и **far** из того же блока `lighting.shadows.camera` — если тень «обрезается», увеличьте **far**. **Point:** кубические shadow maps (дороже по GPU).

**Исправление несогласованности spot/point (раньше):** для point/spot использовалось **`!!castShadow`** и дефолт **`false`**, из‑за чего при включённых глобальных тенях меши не получали `castShadow`, хотя свет мог казаться включённым. Сейчас логика как у directional: **`castShadow !== false`**, дефолты для новых point/spot и нормализация glTF — **каст включён по умолчанию**, снять можно чекбоксом «Casts shadows».

---

## 8. Ground

**Секция:** `Ground`

| Control | JSON path | Range | Runtime |
|---------|-----------|-------|---------|
| Ground plane | `ground.enabled` | checkbox | **Applied** |
| Size | `ground.size` | 1…200 | **Applied** |
| Material color | `ground.material.color` | color | **Applied** |
| Opacity | `ground.material.opacity` | 0…1 | **Applied** |

| Field | In panel? | Runtime |
|-------|-----------|---------|
| `ground.type` | **UI only** | **Partial** — в сцене плоскость зашита как shadow receiver |
| `ground.material.roughness` | **UI only** | **Applied** — из данных (дефолт 1), в UI не редактируется |

---

## 9. Renderer

**Секция:** `Renderer` → синхрон с WebGL через `PanelLabGLSync.jsx` + тип теней для `Canvas` в `Configurator3D.jsx`.

| Control | JSON path | Options / range | Runtime |
|---------|-----------|-----------------|---------|
| Tone mapping exposure | `renderer.toneMappingExposure` | 0…5 | **Applied** — `gl.toneMappingExposure` |
| Tone mapping | `renderer.toneMapping` | select: No / Linear / Reinhard / … / ACES / AgX / Neutral | **Applied** — `gl.toneMapping` |
| Output color space | `renderer.outputColorSpace` | SRGB / LinearSRGB / NoColorSpace | **Applied** — `gl.outputColorSpace` |
| Shadow map | `renderer.shadowMap.enabled` | checkbox | **Applied** |
| Shadow type | `renderer.shadowMap.type` | Basic / PCF / PCFSoft / VSM | **Applied** — `gl.shadowMap` + маппинг на проп `Canvas shadows` |
| Antialias | `renderer.antialias` | checkbox | **Applied** — при создании контекста; в UI указано «reload» |
| physicallyCorrectLights | `renderer.physicallyCorrectLights` | checkbox | **Stored** — см. [§14](#14-в-панели-или-схеме-но-не-подключено-к-рантайму) |

---

## 10. Postprocessing

**Секция:** `Postprocessing` → `PanelLabPostFx.jsx` (`@react-three/postprocessing`).

| Control | JSON path | Range | Runtime |
|---------|-----------|-------|---------|
| Post-processing (composer) | `postprocessing.enabled` | checkbox | **Partial** — без него эффекты не монтируются |
| Bloom on | `postprocessing.bloom.enabled` | checkbox | **Applied** |
| Bloom strength / radius / threshold | `postprocessing.bloom.*` | см. UI | **Applied** |
| Vignette on | `postprocessing.vignette.enabled` | checkbox | **Applied** |
| Vignette offset / darkness | `postprocessing.vignette.*` | 0…1 | **Applied** |

| Block | In panel? | Runtime |
|-------|-----------|---------|
| `postprocessing.ssao` | **UI only** | **Stored** — нет пасса SSAO в `PanelLabPostFx` |
| `postprocessing.colorGrading` | **UI only** | **Stored** — нет эффекта в композере |

---

## 11. Camera

**Секция:** `Camera` — `Configurator3D` (инициализация `Canvas camera`) + `ConfiguratorScene` (`useEffect`).

| Control | JSON path | Range | Runtime |
|---------|-----------|-------|---------|
| Location X/Y/Z | `camera.position` | −50…50 | **Applied** |
| FOV (°) | `camera.fov` | 10…120 | **Applied** |
| Near | `camera.near` | 0.01…10 | **Applied** |
| Far | `camera.far` | 10…5000 | **Applied** |

**`finalizeCameraOrbit`:** если `camera.position` совпадает с `controls.target`, после нормализации позиция смещается на `[0, 0, 6]`, чтобы орбита работала (`panelLabSchema.mjs`).

---

## 12. Controls (Orbit)

**Секция:** `Controls (Orbit)` — часть полей в панели, часть только в JSON.

### В панели

| Control | JSON path | Range / notes | Runtime |
|---------|-----------|---------------|---------|
| Orbit center X/Y/Z | `controls.target` | −50…50 | **Applied** — `OrbitControls.target` |
| Min distance | `controls.minDistance` | 0…500 | **Applied** |
| Max distance | `controls.maxDistance` | 0.1…5000 | **Applied** |
| Min / Max polar (°) | `controls.minPolarAngle`, `maxPolarAngle` | 0…180° → rad | **Applied** |
| Min / Max azimuth (°) | `controls.minAzimuthAngle`, `maxAzimuthAngle` | −720…720° → rad | **Applied** |

### Только в данных (нет полей в этой секции панели)

| Field | Runtime |
|-------|---------|
| `controls.lookTarget` | **Applied** — `camera.lookAt` в `useFrame` (до тика OrbitControls с приоритетом 0) |
| `enableDamping`, `dampingFactor`, `enablePan`, `enableZoom`, `enableRotate` | **Applied** — проброшены в `<OrbitControls>` из `panelLab.controls` |

Рекомендация: держать **`lookTarget`** согласованным с **`target`**, если не нужен отдельный «угол обзора».

---

## 13. В схеме и движке, но без контролов в панели

Поля **есть в `DEFAULT_PANEL_LAB` / glTF**, сцена их **может** читать, но **в Panel Lab нет виджетов**:

| Area | Fields (examples) |
|------|-------------------|
| Hemisphere | `skyColor`, `groundColor` |
| Directional (default + extras) | `color` |
| Ground | `type`, `material.roughness` |
| Environment / HDRI | `hdri.mapping`, `hdri.blur`, `hdri.lod`; `background.blur`, `background.intensity` |
| Postprocessing | весь блок **`ssao`**, **`colorGrading`** |
| Controls | флаги и демпфирование уже в рантайме, но **в Orbit-секции нет слайдеров** для `lookTarget`, `enableDamping`, `dampingFactor`, `enablePan` / `Zoom` / `Rotate` — правка через JSON или расширение UI |

---

## 14. В панели или схеме, но не подключено к рантайму

Настройки **сохраняются**, пользователь их видит в панели, но **текущий код не применяет** к `gl` / сцене:

| What | Detail |
|------|--------|
| `renderer.physicallyCorrectLights` | Чекбокс в Renderer; `PanelLabGLSync` **не** выставляет это на рендерере. |
| `environment.background.blur` / `intensity` | Поля Background в Environment — **не** используются в `ConfiguratorScene`. |
| `environment.hdri.mapping`, `blur`, `lod` | Не проброшены в `<Environment />` из drei. |

Имеет смысл либо подключить, либо убрать из UI, чтобы не вводить в заблуждение.

---

## 15. Идеи расширения (ещё не в проекте)

**Аннотации в конфигураторе** — `panelLab.annotations` (Markdown, billboard «i», max 10): [Annotations.md](./Annotations.md).

**OrbitControls (Three.js)** — можно добавить в схему и в `ConfiguratorScene`:

- `rotateSpeed`, `zoomSpeed`, `panSpeed`
- `autoRotate`, `autoRotateSpeed`
- `screenSpacePanning`
- `mouseButtons`, `touches`
- для ортокамеры: `minZoom` / `maxZoom`

Документация: [OrbitControls](https://threejs.org/docs/#examples/en/controls/OrbitControls).

**Постобработка:** SSAO, цветокор (LUT / матрица), другие passes из `@react-three/postprocessing`.

**Окружение:** смена типа фона (не только `color`), экспозиция HDRI через расширенные пропы `Environment`.

---

## 16. Файлы

| Назначение | Путь |
|------------|------|
| Схема и нормализация | `shared/panelLabSchema.mjs` |
| Стор | `client/src/shared/scene/viewerSettingsStore.js` |
| Гидратация из glTF | `client/src/features/configurator/components/ConfiguratorModel.jsx` |
| Сцена, камера, орбита, свет | `client/src/features/configurator/components/ConfiguratorScene.jsx` |
| Canvas, тени, камера | `client/src/features/configurator/components/Configurator3D.jsx` |
| Синхрон `gl` | `client/src/features/configurator/components/PanelLabGLSync.jsx` |
| Постэффекты | `client/src/features/configurator/components/PanelLabPostFx.jsx` |
| Разметка секций панели | `client/src/features/configurator/components/panelLab/PanelLabPanelBody.jsx` |
| Секции по файлам | `client/src/features/configurator/components/panelLab/*.jsx` |
| Аннотации (сцена) | `client/src/features/configurator/components/ConfiguratorAnnotations.jsx` |

---

*Документ синхронизирован с кодовой базой как справочник; при добавлении контролов обновляйте таблицы.*
