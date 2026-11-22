import { useEffect, useRef, useState } from 'react'
import { Menu } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { gsap } from '@/lib/gsapSetup'
import { scrollToId } from '@/lib/scroll'
import { NAV_LINKS } from '@/data/content'
import { cn } from '@/lib/utils'

function Logo() {
  return (
    <button
      type="button"
      onClick={() => scrollToId('#top')}
      className="flex cursor-pointer items-center gap-2.5"
      aria-label="NexusOS — back to top"
    >
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
        <rect x="1" y="1" width="24" height="24" rx="6" className="stroke-primary" strokeWidth="1.5" />
        <path d="M8 18V8l10 10V8" className="stroke-primary" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="font-display text-[17px] font-bold tracking-tight">NexusOS</span>
    </button>
  )
}

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const progressRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const el = progressRef.current
    if (!el) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.3 },
        },
      )
    })
    return () => ctx.revert()
  }, [])

  const go = (hash: string) => {
    setOpen(false)
    // Wait for the sheet to finish closing before scrolling on mobile
    setTimeout(() => scrollToId(hash), open ? 250 : 0)
  }

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 transition-[background-color,border-color,backdrop-filter] duration-300',
        scrolled ? 'border-b border-border bg-background/80 backdrop-blur-md' : 'border-b border-transparent',
      )}
    >
      {/* scroll progress */}
      <div
        ref={progressRef}
        className="absolute inset-x-0 top-0 h-[2px] origin-left bg-primary"
        style={{ transform: 'scaleX(0)' }}
        aria-hidden="true"
      />
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8" aria-label="Main">
        <Logo />

        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.hash}>
              <button
                type="button"
                onClick={() => go(link.hash)}
                className="cursor-pointer rounded-md px-3.5 py-2 font-mono text-[12.5px] uppercase tracking-[0.08em] text-muted-foreground transition-colors duration-200 hover:bg-secondary hover:text-foreground"
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => go('#pilot')}
            className="hidden h-10 cursor-pointer rounded-md bg-primary px-5 font-mono text-[12.5px] font-medium uppercase tracking-[0.08em] text-primary-foreground transition-colors duration-200 hover:bg-primary/85 sm:inline-flex"
          >
            Book a pilot
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-md border border-border text-foreground transition-colors hover:bg-secondary lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] border-border bg-background p-0">
              <SheetTitle className="sr-only">Navigation menu</SheetTitle>
              <div className="flex h-full flex-col gap-1 p-6 pt-14">
                {NAV_LINKS.map((link) => (
                  <button
                    key={link.hash}
                    type="button"
                    onClick={() => go(link.hash)}
                    className="cursor-pointer rounded-md px-4 py-3.5 text-left font-display text-lg font-medium text-foreground transition-colors hover:bg-secondary"
                  >
                    {link.label}
                  </button>
                ))}
                <Button
                  onClick={() => go('#pilot')}
                  className="mt-4 h-12 cursor-pointer rounded-md bg-primary font-mono text-[13px] font-medium uppercase tracking-[0.08em] text-primary-foreground hover:bg-primary/85"
                >
                  Book a pilot
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  )
}
