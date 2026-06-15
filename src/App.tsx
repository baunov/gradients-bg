import { useEffect, useRef } from 'react'

function App() {
  const interactiveRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const interBubble = interactiveRef.current

    if (!interBubble) {
      return undefined
    }

    let curX = 0
    let curY = 0
    let tgX = 0
    let tgY = 0
    let animationFrameId = 0

    const move = () => {
      curX += (tgX - curX) / 20
      curY += (tgY - curY) / 20
      interBubble.style.transform = `translate(${Math.round(curX)}px, ${Math.round(curY)}px)`
      animationFrameId = window.requestAnimationFrame(move)
    }

    const handleMouseMove = (event: MouseEvent) => {
      tgX = event.clientX
      tgY = event.clientY
    }

    window.addEventListener('mousemove', handleMouseMove)
    animationFrameId = window.requestAnimationFrame(move)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(40deg,var(--color-bg1),var(--color-bg2))] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_42%)]" />

      <main className="relative z-10 flex min-h-screen items-center justify-center p-6 sm:p-10">
        <section className="flex max-w-3xl flex-col items-center gap-5 text-center">
          <p className="rounded-full border border-white/15 bg-white/10 px-4 py-1 text-xs font-medium uppercase tracking-[0.35em] text-white/75 backdrop-blur-sm">
            Animated BG Test
          </p>
          <h1 className="text-[clamp(4rem,12vw,8rem)] font-black leading-none tracking-tight drop-shadow-[0_10px_40px_rgba(0,0,0,0.24)]">
            Bubbles
          </h1>
        </section>
      </main>

      <div className="gradient-bg pointer-events-none absolute inset-0" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true">
          <defs>
            <filter id="goo">
              <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
              <feColorMatrix
                in="blur"
                mode="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
                result="goo"
              />
              <feBlend in="SourceGraphic" in2="goo" />
            </filter>
          </defs>
        </svg>
        <div className="gradients-container">
          <div className="g1" />
          <div className="g2" />
          <div className="g3" />
          <div className="g4" />
          <div className="g5" />
          <div ref={interactiveRef} className="interactive" />
        </div>
      </div>
    </div>
  )
}

export default App