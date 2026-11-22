<div align="center">

# 🧭 NexusOS

**Run the whole business from one platform.**

A scroll-driven product site for a unified business operating platform —
ERP · Business Intelligence · Workflow Automation · AI decision support —
featuring a **fully working in-browser CSV Data Studio**.

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-saloni--1919.github.io%2Fnexusos-e8a93d?style=for-the-badge)](https://saloni-1919.github.io/nexusos/)
[![React](https://img.shields.io/badge/React_19-61dafb?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-646cff?style=flat-square&logo=vite&logoColor=white)](https://vite.dev)
[![GSAP](https://img.shields.io/badge/GSAP-88ce02?style=flat-square&logo=greensock&logoColor=black)](https://gsap.com)
[![Lenis](https://img.shields.io/badge/Lenis-smooth_scroll-e8a93d?style=flat-square)](https://lenis.darkroom.engineering)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

</div>

---

## 📑 Table of contents

- [Live demo](#-live-demo)
- [What's inside](#-whats-inside)
- [The Data Studio — try it](#-the-data-studio--try-it)
- [Quick start](#-quick-start)
- [How the scroll engine works](#-how-the-scroll-engine-works)
- [Project structure](#-project-structure)
- [Design principles](#-design-principles)
- [Tech stack](#-tech-stack)
- [License](#-license)

## 🚀 Live demo

**👉 [saloni-1919.github.io/nexusos](https://saloni-1919.github.io/nexusos/)**

Scroll it. Every section is choreographed — and the **Studio** section in the nav is a real tool, not a mockup.

![NexusOS hero](docs/assets/hero.jpg)

## ✨ What's inside

| Section | What it does |
| --- | --- |
| **Hero** | Split-text character reveal, live scorecard strip with count-up KPIs, infinite module marquee |
| **The Platform** | Six spotlight cards with cursor-tracking radial highlights |
| **The Operating Loop** | A **pinned, scroll-scrubbed** sequence: Operate → Data → Insight → Action, with a progress spine |
| **Analytics Engine** | Four analytics levels + a semantic-layer metric registry |
| **KPI Scorecard** | Count-up KPIs, animated SVG revenue chart, and ⓘ popovers exposing each metric's formula, owner, source and refresh cadence |
| **Data Studio** | Working CSV profiling, validation and charting — see below |
| **Automation** | Workflow timeline whose spine draws itself as you scroll |
| **Flaws** | Accordion of the five classic ERP/BI failure modes and their mitigations |
| **Roadmap & Assessment** | Phase plan with exit criteria; animated score bars |
| **Pilot CTA** | Validating intake form with success state |

<details>
<summary><b>🎞️ The pinned Operating Loop in action — click to expand</b></summary>
<br>

![The Operating Loop — pinned scroll sequence](docs/assets/loop.jpg)

The section pins to the viewport for ~2600px of scroll; a GSAP timeline crossfades
the four stages and fills the spine in proportion to scroll position. On mobile or
with reduced motion, it degrades to a static, fully readable card stack.
</details>

## 🧪 The Data Studio — try it

The site's centerpiece demo: a real slice of the platform's data-preparation module,
running **100% client-side**. No upload, no server — your file never leaves the tab.

![Data Studio](docs/assets/studio.jpg)

1. Open the [live demo](https://saloni-1919.github.io/nexusos/) → **Studio** in the nav
2. Drop any CSV — or click **Try sample data** (120 orders with deliberate defects)
3. Get instant **column profiling**: type detection, missing / unique / invalid counts
4. See the **data quality center**: quarantined rows with exact reasons — never silently changed
5. Build a chart: **group by** any column, pick a **measure**, switch **sum / avg / count**
6. Export a **cleaned CSV** with quarantined rows removed

## ⚡ Quick start

```bash
git clone https://github.com/saloni-1919/nexusos.git
cd nexusos
npm install
npm run dev       # dev server with HMR
```

```bash
npm run build     # production build → dist/
npm run preview   # serve the production build locally
```

Requires Node.js 18+.

## 🛠️ How the scroll engine works

<details>
<summary><b>Lenis + GSAP, sharing one clock — click for the details</b></summary>
<br>

```ts
const lenis = new Lenis({ lerp: 0.11, smoothWheel: true })
lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((time) => lenis.raf(time * 1000))
gsap.ticker.lagSmoothing(0)
```

- **Lenis** smooths wheel input and owns the scroll position — all anchor
  navigation routes through `lenis.scrollTo()`
- **ScrollTrigger** is notified on every Lenis frame, so scrubbed animations track
  the smoothed position with zero lag or drift
- Every effect is created inside `gsap.context()` and reverted on unmount, so
  React StrictMode double-mounting can't duplicate triggers
- Animations only touch `transform` / `opacity` — everything stays on the compositor

</details>

<details>
<summary><b>♿ Reduced-motion contract — click for the details</b></summary>
<br>

Content is **never gated on animation**. If `prefers-reduced-motion: reduce` is set:

- Lenis smoothing is skipped entirely
- SplitText / CountUp / Reveal render their final state instantly
- The pinned Loop renders as a static card stack instead of absolute-positioned panels
- Marquee, glow and scroll-hint CSS animations are disabled via media query

</details>

## 📁 Project structure

```
src/
├── data/content.ts          # all copy & data — edit here to change content
├── lib/
│   ├── gsapSetup.ts         # GSAP + ScrollTrigger registration
│   ├── scroll.ts            # Lenis singleton + smooth anchor scrolling
│   └── csvProfile.ts        # CSV profiling / validation / quarantine engine
├── hooks/
│   ├── useLenis.ts          # smooth-scroll lifecycle
│   └── useReducedMotion.ts
├── components/
│   ├── reactbits/           # SplitText · CountUp · SpotlightCard · Marquee
│   ├── Reveal.tsx           # generic scroll-in reveal
│   └── ui/                  # shadcn/ui components
├── sections/                # one file per page section
│   ├── Nav.tsx      Hero.tsx       Pillars.tsx   Loop.tsx
│   ├── Engine.tsx   Scorecard.tsx  DataStudio.tsx
│   ├── Automation.tsx  Flaws.tsx   Roadmap.tsx
│   └── Assessment.tsx  Pilot.tsx   Footer.tsx
└── pages/Home.tsx           # section composition
```

## 🎨 Design principles

- **Governance as content** — every KPI card carries its semantic-layer definition; quarantined CSV rows are explained, never silently modified
- **Transform-only motion** — no layout thrash; UI transitions stay under 300 ms
- **Responsive by default** — verified at 375 / 768 / 1024 / 1440 px with zero console errors and zero horizontal scroll
- **No dead controls** — every button, link, accordion, popover and form does something real

## 🧰 Tech stack

| Layer | Choice |
| --- | --- |
| Framework | React 19 · TypeScript · Vite |
| Styling | Tailwind CSS · shadcn/ui (Radix primitives) |
| Scroll | Lenis |
| Animation | GSAP + ScrollTrigger |
| Charts | Recharts · custom SVG |
| CSV | Papa Parse |
| Type | Space Grotesk · IBM Plex Mono (self-hosted via Fontsource) |
| Hosting | GitHub Pages |

## 📄 License

MIT — see [LICENSE](LICENSE). All business figures on the site are illustrative demo data.
