import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import {
  resolveOutputColorSpace,
  resolveShadowMapType,
  resolveToneMapping,
} from '../../../shared/scene/panelLabThree.js';

export function PanelLabGLSync({ renderer }) {
  const gl = useThree((s) => s.gl);

  useEffect(() => {
    if (!renderer || !gl) return;

    gl.toneMapping = resolveToneMapping(renderer.toneMapping);
    gl.toneMappingExposure = Number(renderer.toneMappingExposure) || 1;
    gl.outputColorSpace = resolveOutputColorSpace(renderer.outputColorSpace);

    const sm = renderer.shadowMap;
    if (sm?.enabled) {
      gl.shadowMap.enabled = true;
      gl.shadowMap.type = resolveShadowMapType(sm.type);
    } else {
      gl.shadowMap.enabled = false;
    }
  }, [gl, renderer]);

  return null;
}
