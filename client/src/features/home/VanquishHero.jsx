import React, { useId, useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/** Шрифт маски (VQ40): Space Grotesk, подключён в index.html */
const MASK_TEXT_FONT =
  '"Manrope", ui-sans-serif, system-ui, "Segoe UI", sans-serif'

/** Фон по умолчанию — море: `client/public/video/video1.mp4` */
export const VANQUISH_HERO_VIDEO = '/video/videoOne.mp4'

/** Запасной ролик (яхта и т.п.), если передать в `videoSrc`. */
export const VANQUISH_REMOTE_VIDEO =
  'https://assets.bravoureprojects.com/videos_local/VQ40_IB.mp4'

const HERO_SCRUB_DURATION = 1

const HERO_SCRUB_SMOOTH = 3

export default function VanquishHero({
  videoSrc = VANQUISH_HERO_VIDEO,
  posterSrc,
  maskText = 'VQ40',
}) {
  const maskId = `text-mask-${useId().replace(/:/g, '')}`
  const heroRef = useRef(null)
  const pinnedRef = useRef(null)
  const maskTextGroupRef = useRef(null)
  const blackMatteRef = useRef(null)
  const videoRef = useRef(null)

  useLayoutEffect(() => {
    const hero = heroRef.current
    const pinned = pinnedRef.current
    const textGroup = maskTextGroupRef.current
    const blackMatte = blackMatteRef.current
    const videoEl = videoRef.current
    if (!hero || !pinned || !textGroup || !blackMatte || !videoEl) return

    const ctx = gsap.context(() => {
      gsap.set(textGroup, { scale: 1, svgOrigin: '600 200' })
      gsap.set(videoEl, { scale: 1, transformOrigin: 'center center' })
      gsap.set(blackMatte, { opacity: 1 })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: 'bottom bottom',
          pin: pinned,
          pinSpacing: true,
          scrub: HERO_SCRUB_SMOOTH,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })

      // Буквы + видео на всю длину scrub; мат полностью прозрачен к середине пути скролла
      tl.to(textGroup, {
        scale: 30,
        duration: HERO_SCRUB_DURATION,
        svgOrigin: '600 200',
        ease: 'none',
      })

      tl.to(
        videoEl,
        {
          scale: 1,
          duration: HERO_SCRUB_DURATION,
          ease: 'none',
          transformOrigin: 'center center',
        },
        0,
      )

      tl.to(
        blackMatte,
        {
          opacity: 0,
          duration: HERO_SCRUB_DURATION / 2,
          ease: 'none',
        },
        0,
      )
    }, hero)

    requestAnimationFrame(() => ScrollTrigger.refresh())

    const onResize = () => {
      ScrollTrigger.refresh()
    }
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      ctx.revert()
    }
  }, [])

  return (
    <section
      ref={heroRef}
      className="hero relative z-20 h-[300vh] w-full"
    >
      <div
        ref={pinnedRef}
        className="relative h-svh min-h-[500px] w-full overflow-hidden md:min-h-[600px]"
      >
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          {...(posterSrc ? { poster: posterSrc } : {})}
          aria-hidden
        >
          <source src={videoSrc} type="video/mp4" />
        </video>

        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 1200 400"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden
        >
          <defs>
            <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="1200" height="400">
              <rect width="100%" height="100%" fill="white" />
              <g ref={maskTextGroupRef}>
                <text
                  x="600"
                  y="200"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="black"
                  style={{
                    fontFamily: MASK_TEXT_FONT,
                    fontSize: 200,
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                  }}
                >
                  {maskText}
                </text>
              </g>
            </mask>
          </defs>

          <rect
            ref={blackMatteRef}
            width="100%"
            height="100%"
            fill="black"
            mask={`url(#${maskId})`}
          />
        </svg>
      </div>
    </section>
  )
}
