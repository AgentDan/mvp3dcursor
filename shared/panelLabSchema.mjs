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
      color: '#ffffff',
      intensity: 2,
      position: [5, 10, 5],
      target: [0, 0, 0],
      shadow: {
        enabled: true,
        mapSize: [2048, 2048],
        bias: -0.0002,
        normalBias: 0.02,
        radius: 4,
        camera: {
          near: 0.5,
          far: 50,
          left: -10,
          right: 10,
          top: 10,
          bottom: -10,
        },
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
      type: 'PCFSoftShadowMap',
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
  return merged;
}

/** Persistable glTF payload: full tree, no missing branches. */
export function toCleanEmbeddedPanelLab(panelLab) {
  return normalizePanelLabToEmbedded(panelLab);
}

/** Legacy export name for imports expecting SCHEMA_VERSION. */
export const SCHEMA_VERSION = PANEL_LAB_VERSION;
