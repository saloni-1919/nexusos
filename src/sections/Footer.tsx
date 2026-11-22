import { scrollToId } from '@/lib/scroll'
import { NAV_LINKS } from '@/data/content'

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-7xl px-5 py-12 md:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="font-display text-lg font-bold tracking-tight">NexusOS</p>
            <p className="mt-2 max-w-xs text-[13.5px] leading-relaxed text-muted-foreground">
              The unified business operating platform — ERP, BI, automation and AI in one
              connected environment.
            </p>
          </div>
          <nav aria-label="Footer">
            <ul className="grid grid-cols-2 gap-x-10 gap-y-2.5 sm:grid-cols-3">
              {NAV_LINKS.map((link) => (
                <li key={link.hash}>
                  <button
                    type="button"
                    onClick={() => scrollToId(link.hash)}
                    className="cursor-pointer font-mono text-[12px] uppercase tracking-[0.1em] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
            © 2026 NexusOS — concept blueprint
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
            Built with React · Lenis · GSAP
          </p>
        </div>
      </div>
    </footer>
  )
}
