import * as THREE from 'three';

/** Three.js constant name as in JSON, e.g. ACESFilmicToneMapping. */
export function resolveToneMapping(name) {
  const v = THREE[name];
  return typeof v === 'number' ? v : THREE.ACESFilmicToneMapping;
}

export function resolveOutputColorSpace(name) {
  const v = THREE[name];
  return typeof v === 'number' ? v : THREE.SRGBColorSpace;
}

export function resolveShadowMapType(name) {
  const v = THREE[name];
  return typeof v === 'number' ? v : THREE.PCFSoftShadowMap;
}

export function resolveMapping(name) {
  const v = THREE[name];
  return typeof v === 'number' ? v : THREE.EquirectangularReflectionMapping;
}
