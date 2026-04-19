import React from 'react';
import { Link } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import HomeR3f from './HomeScene.jsx';
import { HOME_SCENE_PAGES } from './homeSceneConstants.js';
import { SceneScrollProvider, SceneSection } from './HomeSceneScroll.jsx';
import VanquishHero from './VanquishHero.jsx';

/** Scrolls with the document; WebGL stays fixed behind this stack (see LayoutMain). */
function HomeOverlay() {
  return (
    <div className="relative z-10 w-full max-w-full min-w-0 pointer-events-none">
      <section className="relative h-screen w-full max-w-full overflow-hidden">
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <h2 className="text-[10vw] text-white font-extrabold text-center">Vicenzo BOATS</h2>
        </div>

        <div className="absolute inset-0 z-0">
          <video
            className="hidden md:block h-full w-full object-cover"
            autoPlay
            loop
            muted
            playsInline
          >
            <source src="/video/videoOne.mp4" type="video/mp4" />
          </video>

          <video
            className="md:hidden h-full w-full object-cover"
            autoPlay
            loop
            muted
            playsInline
          >
            <source src="/video/video1.mp4" type="video/mp4" />
          </video>
        </div>
      </section>

      <section
        className="relative flex h-screen w-full max-w-full flex-col items-center justify-center border border-white/30 bg-black/20 px-6 md:px-16"
        aria-labelledby="mind-tool-heading"
      >
        <div className="pointer-events-none mx-auto max-w-3xl space-y-6 text-center md:space-y-8">
          <p className="text-xs font-medium uppercase tracking-[0.35em] text-white/70 md:text-sm">
            История
          </p>
          <h2
            id="mind-tool-heading"
            className="text-[12vw] font-extrabold leading-[0.95] tracking-tight text-white sm:text-[10vw] md:text-[8vw]"
          >
            Инструмент разума
          </h2>
          <p className="mx-auto max-w-2xl text-base font-light leading-relaxed text-white/85 md:text-lg lg:text-xl">
            Дизайн и движение синхронизированы со скроллом: спокойные панели, чёткая типографика, без
            борьбы за внимание. Этот блок — передышка между открывающим роликом и тем, что ждёт
            впереди: мысль, ставшая видимой.
          </p>
        </div>
      </section>

      <section className="flex h-screen w-full max-w-full flex-col items-center justify-center border border-white">
        <h2 className="text-[10vw] font-extrabold text-white">Component 3</h2>
        <Link
          to="/configurator"
          className="pointer-events-auto mt-4 rounded bg-black/40 p-2 text-white underline"
        >
          Configurator
        </Link>
      </section>

      <section className="flex h-screen w-full max-w-full flex-col items-center justify-center border border-white">
        <h2 className="text-[10vw] font-extrabold text-white">Component 4</h2>
        <Link
          to="/configurator"
          className="pointer-events-auto mt-4 rounded bg-black/40 p-2 text-white underline"
        >
          Configurator
        </Link>
      </section>

      <section className="flex h-screen w-full max-w-full flex-col items-center justify-center border border-white">
        <h2 className="text-[10vw] font-extrabold text-white">Component 5</h2>
        <Link
          to="/configurator"
          className="pointer-events-auto mt-4 rounded bg-black/40 p-2 text-white underline"
        >
          Configurator
        </Link>
      </section>

      <section className="flex h-screen w-full max-w-full flex-col items-center justify-center border border-white">
        <h2 className="text-[10vw] font-extrabold text-white">Component 6</h2>
        <Link
          to="/configurator"
          className="pointer-events-auto mt-4 rounded bg-black/40 p-2 text-white underline"
        >
          Configurator
        </Link>
      </section>

      <section className="flex h-screen w-full max-w-full flex-col items-center justify-center border border-white">
        <h2 className="text-[10vw] font-extrabold text-white">Component 7</h2>
        <Link
          to="/configurator"
          className="pointer-events-auto mt-4 rounded bg-black/40 p-2 text-white underline"
        >
          Configurator
        </Link>
      </section>

      <section className="relative h-screen w-full max-w-full overflow-hidden">
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <h2 className="text-[10vw] font-extrabold text-white">Vicenzo 39 WA</h2>
        </div>

        <div className="absolute inset-0 z-0">
          <video
            className="hidden md:block h-full w-full object-cover"
            autoPlay
            loop
            muted
            playsInline
          >
            <source src="/video/video1.mp4" type="video/mp4" />
          </video>

          <video
            className="md:hidden h-full w-full object-cover"
            autoPlay
            loop
            muted
            playsInline
          >
            <source src="/video/videoOne.mp4" type="video/mp4" />
          </video>
        </div>
      </section>
    </div>
  )
}

export default function LayoutMain() {
  return (
    <SceneScrollProvider pageCount={HOME_SCENE_PAGES}>
      <VanquishHero />
      <SceneSection pageCount={HOME_SCENE_PAGES}>
        <div
          className="pointer-events-none fixed inset-0 z-0 min-h-svh w-full"
          aria-hidden
        >
          <Canvas
            style={{ background: '#DFEFFF', width: '100%', height: '100%' }}
            shadows
            camera={{ position: [0, 0, 0], fov: 50, far: 50000 }}
          >
            <HomeR3f />
          </Canvas>
        </div>
        <HomeOverlay />
      </SceneSection>
    </SceneScrollProvider>
  )
}
