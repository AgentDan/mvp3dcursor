import { useLayoutEffect } from 'react';
import { useThree } from '@react-three/fiber';
import {
  resolveOutputColorSpace,
  resolveShadowMapType,
  resolveToneMapping,
} from '../../../shared/scene/panelLabThree.js';

export function PanelLabGLSync({ renderer }) {
  const gl = useThree((s) => s.gl);
  const invalidate = useThree((s) => s.invalidate);

  useLayoutEffect(() => {
    if (!renderer || !gl) return;

    gl.toneMapping = resolveToneMapping(renderer.toneMapping);
    gl.toneMappingExposure = Number(renderer.toneMappingExposure) || 1;
    gl.outputColorSpace = resolveOutputColorSpace(renderer.outputColorSpace);

    const sm = renderer.shadowMap;
    const prevEnabled = gl.shadowMap.enabled;
    const prevType = gl.shadowMap.type;
    if (sm?.enabled) {
      gl.shadowMap.enabled = true;
      gl.shadowMap.type = resolveShadowMapType(sm.type);
    } else {
      gl.shadowMap.enabled = false;
    }
    if (prevEnabled !== gl.shadowMap.enabled || prevType !== gl.shadowMap.type) {
      gl.shadowMap.needsUpdate = true;
    }
    invalidate();
  }, [gl, invalidate, renderer]);

  return null;
}
