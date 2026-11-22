import { useEffect } from 'react'
import { useLenis } from '@/hooks/useLenis'
import { ScrollTrigger } from '@/lib/gsapSetup'
import { Nav } from '@/sections/Nav'
import { Hero } from '@/sections/Hero'
import { Pillars } from '@/sections/Pillars'
import { Loop } from '@/sections/Loop'
import { Engine } from '@/sections/Engine'
import { Scorecard } from '@/sections/Scorecard'
import { DataStudio } from '@/sections/DataStudio'
import { Automation } from '@/sections/Automation'
import { Flaws } from '@/sections/Flaws'
import { Roadmap } from '@/sections/Roadmap'
import { Assessment } from '@/sections/Assessment'
import { Pilot } from '@/sections/Pilot'
import { Footer } from '@/sections/Footer'

export default function Home() {
  useLenis()

  // Recalculate trigger positions after everything (fonts included) has laid out.
  useEffect(() => {
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 300)
    return () => window.clearTimeout(t)
  }, [])

  return (
    <div className="relative">
      <Nav />
      <main>
        <Hero />
        <Pillars />
        <Loop />
        <Engine />
        <Scorecard />
        <DataStudio />
        <Automation />
        <Flaws />
        <Roadmap />
        <Assessment />
        <Pilot />
      </main>
      <Footer />
    </div>
  )
}
