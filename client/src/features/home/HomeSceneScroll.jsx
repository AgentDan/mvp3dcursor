import React, {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const SceneScrollContext = createContext(null);

export function useSceneScroll() {
  const ctx = useContext(SceneScrollContext);
  if (!ctx) {
    throw new Error('useSceneScroll must be used inside SceneScrollProvider');
  }
  return { offsetRef: ctx.offsetRef };
}

function useSceneScrollContext() {
  const ctx = useContext(SceneScrollContext);
  if (!ctx) {
    throw new Error('Scene scroll components must be inside SceneScrollProvider');
  }
  return ctx;
}

/**
 * One document scroll for the whole page: VanquishHero + tall scene block.
 * Scene progress 0–1 is derived from window scroll through `SceneSection` height (pageCount × 100vh).
 */
export function SceneScrollProvider({ pageCount, children }) {
  const sceneRef = useRef(null);
  const offsetRef = useRef(0);
  const [sceneMounted, setSceneMounted] = useState(false);

  const registerScene = useCallback((node) => {
    sceneRef.current = node;
    setSceneMounted(!!node);
  }, []);

  useLayoutEffect(() => {
    const update = () => {
      const el = sceneRef.current;
      if (!el) return;
      const total = el.offsetHeight - window.innerHeight;
      if (total <= 0) {
        offsetRef.current = 0;
        return;
      }
      const rect = el.getBoundingClientRect();
      const scrolled = Math.min(total, Math.max(0, -rect.top));
      offsetRef.current = scrolled / total;
    };

    const onResize = () => {
      update();
      ScrollTrigger.refresh();
    };

    update();
    const onScroll = () => {
      update();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    const ro =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => update()) : null;
    if (ro && sceneRef.current) ro.observe(sceneRef.current);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      ro?.disconnect();
    };
  }, [pageCount, sceneMounted]);

  useLayoutEffect(() => {
    if (sceneMounted) ScrollTrigger.refresh();
  }, [sceneMounted]);

  const value = { registerScene, offsetRef, pageCount };

  return (
    <SceneScrollContext.Provider value={value}>{children}</SceneScrollContext.Provider>
  );
}

export function SceneSection({ pageCount, className = '', children }) {
  const { registerScene } = useSceneScrollContext();
  return (
    <section
      ref={registerScene}
      className={`relative w-full ${className}`.trim()}
      style={{ minHeight: `${pageCount * 100}vh` }}
    >
      {children}
    </section>
  );
}
