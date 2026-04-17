export const PANEL_LAB_VERSION = 1;

function isPlainObject(v) {
  return v != null && typeof v === 'object' && !Array.isArray(v);
}

export const DEFAULT_PANEL_LAB = {
  version: PANEL_LAB_VERSION,

  environment: {
    background: {
      type: 'color',
      color: '#e5e7eb',
      blur: 0,
      intensity: 1,
    },
    hdri: {
      enabled: false,
      url: '/hdri/studio_small_09.hdr',
      mapping: 'EquirectangularReflectionMapping',
      intensity: 1.2,
      rotation: [0, 0, 0],
      background: false,
      blur: 0,
      lod: 0,
    },
    fog: {
      enabled: false,
      type: 'linear',
      color: '#ffffff',
      near: 10,
      far: 100,
    },
  },

  lighting: {
    ambient: {
      enabled: true,
      intensity: 0.6,
      color: '#ffffff',
    },
    hemisphere: {
      enabled: false,
      skyColor: '#ffffff',
      groundColor: '#444444',
      intensity: 0.5,
    },
    directional: {
      enabled: true,
      /** Viewport overlay in Lab (position → target). */
      sceneHelper: true,
      castShadow: true,
      shadowIntensity: 1,
      color: '#ffffff',
      intensity: 2,
      position: [5, 10, 5],
      target: [0, 0, 0],
    },
    directionalLights: [],
    shadows: {
      enabled: true,
      mapSize: [2048, 2048],
      /** VSM: small depth bias; rely more on normalBias for contact artefacts. */
      bias: -0.00005,
      /** Higher default reduces self-shadow acne when meshes both cast and receive. */
      normalBias: 0.06,
      /** VSM blur strength; Three docs: values > 1 visibly soften edges. */
      radius: 8,
      blurSamples: 16,
      camera: {
        near: 0.5,
        far: 50,
        /** Tighter ortho frustum → better texel density (less blocky edges). */
        left: -6,
        right: 6,
        top: 6,
        bottom: -6,
      },
    },
    pointLights: [],
    spotLights: [],
  },

  ground: {
    enabled: false,
    type: 'shadowReceiver',
    size: 20,
    material: {
      color: '#ffffff',
      opacity: 0.4,
      roughness: 1,
    },
  },

  renderer: {
    physicallyCorrectLights: true,
    toneMapping: 'ACESFilmicToneMapping',
    toneMappingExposure: 1.2,
    outputColorSpace: 'SRGBColorSpace',
    shadowMap: {
      enabled: true,
      /** PCFSoft is deprecated in Three r182 (treated as PCF). VSM enables radius + blurSamples. */
      type: 'VSMShadowMap',
    },
    antialias: true,
  },

  postprocessing: {
    enabled: false,
    bloom: {
      enabled: false,
      strength: 0.5,
      radius: 0.4,
      threshold: 0.8,
    },
    ssao: {
      enabled: false,
      radius: 0.5,
      intensity: 10,
      luminanceInfluence: 0.6,
    },
    colorGrading: {
      enabled: false,
      contrast: 1,
      saturation: 1,
      brightness: 1,
    },
    vignette: {
      enabled: false,
      offset: 0.5,
      darkness: 0.5,
    },
  },

  camera: {
    position: [4, 3, 4],
    fov: 50,
    near: 0.1,
    far: 1000,
  },

  controls: {
    minDistance: 2,
    maxDistance: 10,
    dampingFactor: 0.05,
    enableDamping: true,
    enablePan: true,
    enableZoom: true,
    enableRotate: true,
  },
};

export function cloneDefaultPanelLab() {
  return JSON.parse(JSON.stringify(DEFAULT_PANEL_LAB));
}

/** Deep merge objects recursively; arrays and primitives from patch replace. */
export function deepMerge(base, patch) {
  if (!isPlainObject(patch)) return base;
  if (!isPlainObject(base)) return JSON.parse(JSON.stringify(patch));
  const out = { ...base };
  for (const key of Object.keys(patch)) {
    const pv = patch[key];
    const bv = base[key];
    if (Array.isArray(pv)) {
      out[key] = pv.slice();
    } else if (isPlainObject(pv) && isPlainObject(bv)) {
      out[key] = deepMerge(bv, pv);
    } else {
      out[key] = pv;
    }
  }
  return out;
}

const REQUIRED_TOP = [
  'environment',
  'lighting',
  'ground',
  'renderer',
  'postprocessing',
  'camera',
  'controls',
];

function isValidPanelLabShape(raw) {
  if (!isPlainObject(raw)) return false;
  // Treat missing version as legacy (merge with defaults). Only reject explicitly older integers.
  const ver = raw.version;
  if (ver != null && ver !== '' && Number(ver) < PANEL_LAB_VERSION) return false;
  for (const k of REQUIRED_TOP) {
    if (!isPlainObject(raw[k])) return false;
  }
  return true;
}

/**
 * Normalize extras.panelLab: invalid or legacy shape → defaults; otherwise deep-merge with defaults.
 */
export function normalizePanelLabToEmbedded(raw) {
  const defaults = cloneDefaultPanelLab();
  if (!isValidPanelLabShape(raw)) return defaults;
  const merged = deepMerge(defaults, raw);
  merged.version = PANEL_LAB_VERSION;
  if (merged.renderer?.shadowMap?.type === 'PCFSoftShadowMap') {
    merged.renderer = {
      ...merged.renderer,
      shadowMap: { ...merged.renderer.shadowMap, type: 'VSMShadowMap' },
    };
  }
  // BasicShadowMap is very blocky; embedded files often ship it by mistake.
  if (merged.renderer?.shadowMap?.enabled && merged.renderer?.shadowMap?.type === 'BasicShadowMap') {
    merged.renderer = {
      ...merged.renderer,
      shadowMap: { ...merged.renderer.shadowMap, type: 'VSMShadowMap' },
    };
  }
  if (typeof merged.lighting?.directional?.castShadow !== 'boolean') {
    const oldEnabled = merged.lighting?.directional?.shadow?.enabled;
    merged.lighting.directional.castShadow = typeof oldEnabled === 'boolean' ? oldEnabled : true;
  }
  if (!isPlainObject(merged.lighting?.shadows)) {
    merged.lighting.shadows = JSON.parse(JSON.stringify(defaults.lighting.shadows));
  }
  const oldShadow = merged.lighting?.directional?.shadow;
  if (isPlainObject(oldShadow)) {
    merged.lighting.shadows = deepMerge(merged.lighting.shadows, oldShadow);
    const { directional } = merged.lighting;
    const { shadow: _legacyShadow, ...restDirectional } = directional;
    merged.lighting.directional = restDirectional;
  }
  const gsh = merged.lighting?.shadows;
  if (gsh?.enabled && Array.isArray(gsh.mapSize)) {
    const w = Number(gsh.mapSize[0]);
    const h = Number(gsh.mapSize[1]);
    if (!Number.isFinite(w) || !Number.isFinite(h) || w < 512 || h < 512) {
      gsh.mapSize = [2048, 2048];
    }
  }
  if (Array.isArray(merged.lighting?.pointLights)) {
    merged.lighting.pointLights = merged.lighting.pointLights.map((pl) =>
      isPlainObject(pl)
        ? {
            ...pl,
            castShadow: typeof pl.castShadow === 'boolean' ? pl.castShadow : false,
            shadowIntensity: Number.isFinite(Number(pl.shadowIntensity))
              ? Math.max(0, Math.min(1, Number(pl.shadowIntensity)))
              : 1,
          }
        : pl,
    );
  }
  if (Array.isArray(merged.lighting?.spotLights)) {
    merged.lighting.spotLights = merged.lighting.spotLights.map((sl) =>
      isPlainObject(sl)
        ? {
            ...sl,
            castShadow: typeof sl.castShadow === 'boolean' ? sl.castShadow : false,
            shadowIntensity: Number.isFinite(Number(sl.shadowIntensity))
              ? Math.max(0, Math.min(1, Number(sl.shadowIntensity)))
              : 1,
          }
        : sl,
    );
  }
  if (!Array.isArray(merged.lighting?.directionalLights)) {
    merged.lighting.directionalLights = [];
  } else {
    merged.lighting.directionalLights = merged.lighting.directionalLights.map((dl) =>
      isPlainObject(dl)
        ? {
            ...defaults.lighting.directional,
            ...dl,
            castShadow: typeof dl.castShadow === 'boolean' ? dl.castShadow : false,
            shadowIntensity: Number.isFinite(Number(dl.shadowIntensity))
              ? Math.max(0, Math.min(1, Number(dl.shadowIntensity)))
              : 1,
          }
        : JSON.parse(JSON.stringify(defaults.lighting.directional)),
    );
  }
  if (Number.isFinite(Number(merged.lighting?.directional?.shadowIntensity))) {
    merged.lighting.directional.shadowIntensity = Math.max(0, Math.min(1, Number(merged.lighting.directional.shadowIntensity)));
  } else if (merged.lighting?.directional) {
    merged.lighting.directional.shadowIntensity = 1;
  }
  return merged;
}

/** Persistable glTF payload: full tree, no missing branches. */
export function toCleanEmbeddedPanelLab(panelLab) {
  return normalizePanelLabToEmbedded(panelLab);
}

/** Legacy export name for imports expecting SCHEMA_VERSION. */
export const SCHEMA_VERSION = PANEL_LAB_VERSION;
