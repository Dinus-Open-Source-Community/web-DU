# DOSCOM Playful Landing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the global design-token foundation with the playful Canvas system (light-only, DynaPuff + Plus Jakarta Sans) and rebuild the landing page as a fully static, maximally playful and interactive SPA without breaking existing dashboards.

**Architecture:** Token-first in three layers: (1) foundation — deps, tokens JSON v2, `index.css`, dark-mode removal; (2) primitives + providers — playful components, illustration system, Motion/Lenis/GSAP wiring; (3) surfaces — Navbar/Footer, static landing sections incl. interactive Terminal, branching Story, hero playground, splash, then regression + gates. Later tasks consume exact export names defined by earlier tasks.

**Tech Stack:** React 19.2, Vite 8, Tailwind CSS v4 (`@theme`), TypeScript strict, `motion@13.2.0`, `gsap@3.15.0` + `@gsap/react@2.1.2`, `lenis@1.3.26`, `@fontsource/dynapuff@5.3.0`, `@fontsource/plus-jakarta-sans@5.3.0`, lucide-react, shadcn/cva.

## Global Constraints

- Workdir for all commands: `/home/zappto/Serius/Udinus/DOSCOM/web-DU/frontend`.
- No test runner exists in this repo. Every task ends with verification steps using exactly: `npm run build` (runs `tsc -b && vite build`, expected: success, no errors) and `npm run lint` (expected: no new warnings on touched files). UI tasks add the stated visual check in dev (`npm run dev`, open route, confirm checklist).
- Strict TS: explicit param/return types, no `any`/`unknown`, no `@ts-ignore`/`eslint-disable` (one documented exception in Task 16). Prefixes `I`/`T`/`G` per repo convention.
- `motion` imports come ONLY from `"motion/react"`. Never add `framer-motion` to package.json (it arrives transitively).
- Only `transform`/`opacity` may be animated. No `ScrollSmoother`. No Lottie in new landing code.
- Landing layer is FULLY STATIC: files under `src/components/landing/`, `src/components/playful/`, `src/lib/landing/` must never import from `@/hooks` or `@/services` (enforced by gate in Task 23).
- Copy strings live ONLY in `src/lib/landing/copy.ts` (terminal voice in `terminal.ts`, story nodes in `story.ts`). Banned generic phrases (spec §9.1) must never appear — enforced by gate in Task 23.
- Icon budget (spec §9.3) is binding: no decorative icons in new landing code. Sticker/doodle usage is bounded to the exact spots named in each task.
- Copy uses hook option A (spec §9); reviewer changes strings in `copy.ts` only.
- Section anchors: `#top #stack #mentor #kursus #terminal #cerita #cara-kerja #galeri #kontak`.
- Spec source of truth: `docs/superpowers/specs/2026-09-06-doscom-playful-landing-design.md`.

---

## File structure

```
Create:
  src/components/playful/StickyNote.tsx        (draggable pastel note + tape, icon optional)
  src/components/playful/HandUnderline.tsx     (SVG underline + draw-on-scroll prop)
  src/components/playful/DoodleArrow.tsx       (3 hand-drawn arrow SVGs)
  src/components/playful/SectionHeader.tsx     (eyebrow + display title + copy)
  src/components/playful/Reveal.tsx            (motion whileInView reveal)
  src/components/playful/PenguinMascot.tsx     (hand-drawn-style SVG penguin)
  src/components/playful/TickerTape.tsx        (marquee strip, duplicated + aria-hidden)
  src/components/playful/DoodleDivider.tsx     (squiggle section divider)
  src/components/playful/Stickers.tsx          (official doodle set: Star/Sparkle/Squiggle/Circle/Tape/Pin)
  src/components/playful/Footprints.tsx        (penguin footprint trail)
  src/components/playful/SplashScreen.tsx      (≤1s once-per-session overlay)
  src/components/landing/MentorCard.tsx        (initials avatar + text, zero icons)
  src/components/landing/StaticCourseCard.tsx  (pastel cover + display numeral, zero icons)
  src/components/landing/Hero.tsx              (playground: parallax + drag + draw + easter egg)
  src/components/landing/StackSection.tsx
  src/components/landing/MentorsSection.tsx
  src/components/landing/CourseSection.tsx
  src/components/landing/TerminalSection.tsx   (whiteboard replacement)
  src/components/landing/StorySection.tsx      (branching story, 9 nodes)
  src/components/landing/HowItWorksSection.tsx
  src/components/landing/GallerySection.tsx    (grid now, pinned horizontal when photos exist)
  src/components/landing/TestimonialSection.tsx
  src/components/landing/FinalCTASection.tsx
  src/lib/landing/copy.ts  stack.ts  mentors.ts  courses.ts  terminal.ts  story.ts  gallery.ts  contact.ts  testimonial.ts
  src/providers/motion-provider.tsx            (ReactLenis root + ScrollTrigger bridge)
  src/components/shared/ScrollManager.tsx      (route + hash scroll handling)
Modify:
  frontend/package.json (via npm commands only)
  frontend/src/docs/design/canvas-design-tokens.json (v2 hunks)
  frontend/src/index.css (theme hunks + keyframes incl. marquee/twinkle/splash-bar + grain class + reduced-motion, delete .dark)
  frontend/src/components/ui/sonner.tsx (drop next-themes)
  frontend/src/components/ui/*.tsx + tiptap-editor.css (strip dark: variants)
  frontend/src/components/ui/button.tsx (playful variants)
  frontend/src/main.tsx (wrap MotionProvider)
  frontend/src/App.tsx (mount ScrollManager)
  frontend/src/lib/navigation.tsx (navLinks anchors + footerLinks remap)
  frontend/src/components/shared/Navbar.tsx (editorial restyle)
  frontend/src/components/shared/Footer.tsx (ink restyle)
  frontend/src/pages/landing/Home.tsx (static composition + splash + grain + ticker + dividers + footprints)
  frontend/index.html (lang/id/title/meta)
Delete (in Task 20 after proving orphaned):
  src/components/home/Hero.tsx, Feature.tsx, Benefit.tsx, Community.tsx
  src/hooks/landing/use-featured-courses.ts, src/hooks/landing/use-landing-community-stats.ts
```

---

### Task 1: Install motion stack + fonts

**Files:**
- Modify: `frontend/package.json` (via npm only)
- Test: n/a (verification commands in steps)

**Interfaces:**
- Consumes: nothing
- Produces: `motion`, `gsap`, `@gsap/react`, `lenis`, `@fontsource/dynapuff`, `@fontsource/plus-jakarta-sans` in dependencies for Tasks 3, 5, 6, 8, 13, 16, 17, 18, 19.

- [ ] **Step 1: Install pinned versions**

Run: `npm install -S motion@13.2.0 gsap@3.15.0 @gsap/react@2.1.2 lenis@1.3.26 @fontsource/dynapuff@5.3.0 @fontsource/plus-jakarta-sans@5.3.0`
Expected: success, no peer-dependency errors (all support React 19).

- [ ] **Step 2: Verify install, prove no framer-motion direct dep**

Run: `npm ls motion gsap lenis @fontsource/dynapuff @fontsource/plus-jakarta-sans && (npm ls framer-motion || true)`
Expected: all five listed at pinned versions; `framer-motion` appears ONLY as transitive dep of `motion`, never at top level.

- [ ] **Step 3: Commit**

```bash
git add frontend/package.json frontend/package-lock.json
git commit -m "feat(landing): add motion, gsap, lenis and fontsource deps"
```

---

### Task 2: Design tokens JSON v2

**Files:**
- Modify: `frontend/src/docs/design/canvas-design-tokens.json`
- Test: n/a

**Interfaces:**
- Consumes: nothing
- Produces: token contract v2 consumed by Task 3 (exact hex/values below are reused verbatim).

- [ ] **Step 1: Bump meta block**

Old (`meta`):
```json
  "meta": {
    "name": "Canvas Landing Page — Visual Collaboration",
    "version": "1.0.0",
    "source": "Reconstructed from the six supplied 1920×954 screenshots",
    "notes": [
      "Values are screenshot-derived design tokens, not claims about the original source code.",
      "The visual language is intentionally hand-drawn, playful, editorial, and slightly imperfect.",
      "Exact font family cannot be guaranteed from screenshots alone; typography tokens therefore define roles and measurable characteristics."
    ]
  },
```
New:
```json
  "meta": {
    "name": "DOSCOM University — Playful Landing",
    "version": "2.0.0",
    "source": "Adapted from Canvas visual language for DOSCOM University (web-DU)",
    "notes": [
      "Light-only contract: there is no dark theme. The .dark block and dark: variants were removed app-wide.",
      "Display font is DynaPuff (weights 400-700 only; display uses 700). Body/UI font is Plus Jakarta Sans.",
      "Landing layer is fully static: no hooks/services imports. Maximal package: splash, hero playground, full illustration system, horizontal gallery, branching story. Locked 2026-09-06."
    ]
  },
```

- [ ] **Step 2: Replace fontFamily block with real fonts**

Old (`typography.fontFamily`):
```json
    "fontFamily": {
      "display": "'HandDisplay', 'Comic Sans MS', cursive",
      "body": "'HandBody', 'Trebuchet MS', sans-serif",
      "mono": "'HandMono', ui-monospace, SFMono-Regular, Menlo, monospace",
      "ui": "'HandBody', system-ui, sans-serif"
    },
```
New:
```json
    "fontFamily": {
      "display": "'DynaPuff', 'Comic Sans MS', cursive",
      "body": "'Plus Jakarta Sans', system-ui, sans-serif",
      "mono": "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
      "ui": "'Plus Jakarta Sans', system-ui, sans-serif"
    },
```

- [ ] **Step 3: Fix displayHero for DynaPuff (no 800 weight, less tight tracking)**

Old (`typography.roles.displayHero`): `"fontWeight": 800,` + `"letterSpacing": "-0.055em"`.
New: `"fontWeight": 700,` + `"letterSpacing": "-0.02em"`. Keep `fontSize: "clamp(4rem, 8vw, 9.5rem)"`, `lineHeight: 0.84`.
Same change for `displaySection`: `fontWeight: 800` → `700`, `letterSpacing: "-0.045em"` → `"-0.015em"`.

- [ ] **Step 4: Validate + commit**

Run: `node -e "JSON.parse(require('fs').readFileSync('src/docs/design/canvas-design-tokens.json','utf8')); console.log('JSON OK')"` (from `frontend/`)
Expected: `JSON OK`.

```bash
git add frontend/src/docs/design/canvas-design-tokens.json
git commit -m "docs(tokens): v2 light-only DOSCOM contract, DynaPuff + Jakarta Sans"
```

---

### Task 3: index.css foundation (theme, fonts, keyframes, grain, kill dark)

**Files:**
- Modify: `frontend/src/index.css`
- Test: n/a

**Interfaces:**
- Consumes: Task 2 values
- Produces: CSS vars + Tailwind v4 utilities consumed by ALL later tasks: `bg-ink-900/800`, `text-ink-900`, `bg-paper-white`, `bg-brand-blue`, `text-brand-ink`, `bg-note-*`, `font-display`, `shadow-paper`, `shadow-button`, `animate-float/wiggle/drift/bob/marquee/twinkle`, `.grain-overlay`, `motion-reduce` variant (already exists, keep).

- [ ] **Step 1: Swap font imports (lines 8-9)**

Old:
```css
@import '@fontsource/poppins/400.css';
@import '@fontsource/poppins/600.css';
```
New:
```css
@import '@fontsource/dynapuff/600.css';
@import '@fontsource/dynapuff/700.css';
@import '@fontsource/plus-jakarta-sans/400.css';
@import '@fontsource/plus-jakarta-sans/500.css';
@import '@fontsource/plus-jakarta-sans/600.css';
@import '@fontsource/plus-jakarta-sans/700.css';
@import '@fontsource/plus-jakarta-sans/800.css';
@import '@fontsource/plus-jakarta-sans/800-italic.css';
```

- [ ] **Step 2: Delete dark-mode machinery**

Delete the entire `.dark { ... }` block (lines 134-182) and the line `@custom-variant dark (&:is(.dark *));` (line 11). Keep `@custom-variant motion-reduce` (line 12).

- [ ] **Step 3: Re-point :root semantics (exact replacements)**

```
--background: #fdfdfb;            →  --background: #FBFCFD;
--foreground: #232323;            →  --foreground: #050914;
--primary: #0a84dc;               →  --primary: #13A8FF;
--primary-foreground: #ffffff;    →  --primary-foreground: #050914;
--secondary: #dcdcdc;             →  --secondary: #F1F3F5;
--secondary-foreground: #232323;  →  --secondary-foreground: #050914;
--muted: #f2f2f2;                 →  --muted: #F1F3F5;
--muted-foreground: #545454;      →  --muted-foreground: #56657A;
--accent: #e7f3fc;                →  --accent: #BCEEFF;
--accent-foreground: #0a84dc;     →  --accent-foreground: #008EFF;
--destructive: #e33127;           →  --destructive: #E34D59;
--border: #dcdcdc;                →  --border: #E5E8EC;
--input: #dcdcdc;                 →  --input: #E5E8EC;
--ring: #0a84dc;                  →  --ring: #13A8FF;
--chart-1: #0a84dc;               →  --chart-1: #13A8FF;
--chart-2: #e33127;               →  --chart-2: #E34D59;
--chart-3: #e7a41f;               →  --chart-3: #F2A900;
--chart-4: #5bade8;               →  --chart-4: #BCEEFF;
--chart-5: #075e9c;               →  --chart-5: #A991FF;
--sidebar: #fdfdfb;               →  --sidebar: #FBFCFD;
--sidebar-foreground: #333333;    →  --sidebar-foreground: #050914;
--sidebar-primary: #0a84dc;       →  --sidebar-primary: #13A8FF;
--sidebar-primary-foreground: #ffffff; → --sidebar-primary-foreground: #050914;
--sidebar-accent: #f2f2f2;        →  --sidebar-accent: #BCEEFF;
--sidebar-accent-foreground: #0a84dc;  → --sidebar-accent-foreground: #008EFF;
--sidebar-border: #dcdcdc;        →  --sidebar-border: #E5E8EC;
--sidebar-ring: #0a84dc;          →  --sidebar-ring: #13A8FF;
--font-sans: Poppins;             →  --font-sans: 'Plus Jakarta Sans', system-ui, sans-serif;
```
Keep: `--radius: 1rem`, `--font-mono`, all `--shadow-*` base vars, `--tracking-normal`, `--container-8xl`, `--animate-payment-float` (legacy payment surfaces), `@keyframes payment-float`.

- [ ] **Step 4: Append playful @theme tokens + keyframes + grain + guards**

Inside `@theme`, add the full ink/paper/brand/note/line/font/shadow block from the previous revision (unchanged), plus:
```css
  --animate-marquee: marquee-x 22s linear infinite;
  --animate-twinkle: twinkle-soft 2.6s ease-in-out infinite;
```
Append keyframes + grain + guards at end of file (playful-float/wiggle/drift/bob + selection + reduced-motion guard unchanged from previous revision), plus:
```css
@keyframes marquee-x {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
@keyframes twinkle-soft {
  0%, 100% { opacity: 0.25; }
  50% { opacity: 1; }
}
@keyframes splash-bar {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}
.grain-overlay {
  position: fixed;
  inset: 0;
  z-index: 40;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E");
}
```

- [ ] **Step 5: Verify + commit**

Run: `npm run build`
Expected: success (visual check comes in later tasks; this task only proves the stylesheet compiles and types still pass).

```bash
git add frontend/src/index.css
git commit -m "feat(tokens): light-only playful foundation, DynaPuff + Jakarta Sans"
```

---

### Task 4: Remove next-themes + strip dark: variants

**Files:**
- Modify: `frontend/src/components/ui/sonner.tsx`, 19 files containing `dark:` (button, card, dialog, input, select, tabs, checkbox, combobox, popover, calendar, avatar, alert-dialog, dropdown-menu, textarea, input-group + 5 module-viewer assignment files + `styles/tiptap-editor.css`), `frontend/package.json` (via npm only)
- Test: n/a

**Interfaces:**
- Consumes: Task 3 (no `.dark` machinery left to target)
- Produces: zero `dark:` tokens app-wide; `next-themes` gone.

- [ ] **Step 1: Enumerate every dark: occurrence with line numbers**

Run: `rg -n 'dark:[a-z]' src --glob '*.tsx' --glob '*.css'`
Expected: the known ~19 files. Save the list; every file on it must be edited below.

- [ ] **Step 2: sonner.tsx — hardcode light, drop import**

Read `src/components/ui/sonner.tsx`, then: delete line `import { useTheme } from 'next-themes'`; delete the line `const { theme = 'light' } = useTheme()`; change the `theme={theme}` prop on the Toaster element to `theme="light"`. No other logic changes.

- [ ] **Step 3: button.tsx — delete the four dark: tokens exactly**

In `src/components/ui/button.tsx`: from the base cva string delete `dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40`; from `outline` delete `dark:bg-transparent dark:hover:bg-input/30`; from `ghost` delete `dark:hover:bg-muted/50`; from `destructive` delete `dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40`. Nothing else changes.

- [ ] **Step 4: Strip remaining files mechanically**

For each remaining file from Step 1: delete ONLY the `dark:<utility>` class tokens (they are pure additive overrides; deletion is semantics-preserving now that `.dark` never matches). Do not reorder or otherwise restyle classes. In `tiptap-editor.css`, delete the dark-scoped rule block.

- [ ] **Step 5: Uninstall next-themes + verify zero + commit**

Run: `npm remove next-themes && rg -c 'dark:' src --glob '*.tsx' --glob '*.css' ; rg -rn 'next-themes' src || true`
Expected: first rg prints nothing (zero matches); second rg prints nothing.

Deviation (actual, execution Task 4): the blanket zero-match rule was refined. The lesson module viewer owns a SEPARATE, prop-driven reading theme (`LessonThemeMode`, persisted, defaults dark) that never used Tailwind's `dark:` variant or `.dark` class — it uses `isDark` ternaries + the `tiptap-editor-root--dark` BEM class + a `{light, dark}` palette map in `AssignmentPassStatusBadge.tsx`. Those stay functional (reader feature, out of app-dark-mode scope). Revised verification: `rg -n 'dark:[A-Za-z\[]' src --glob '*.tsx'` must print nothing; `rg -n 'dark:' src/styles/tiptap-editor.css` must print ONLY the pre-existing `.tiptap-editor-root--dark` selector lines (unchanged).
Run: `npm run build && npm run lint`
Expected: both green.

```bash
git add frontend/src/components/ui frontend/src/components/courses frontend/src/styles frontend/package.json frontend/package-lock.json
git commit -m "feat(tokens): remove dark mode and next-themes app-wide"
```

---

### Task 5: Playful primitives + illustration system

**Files:**
- Create: `src/components/playful/StickyNote.tsx`, `src/components/playful/HandUnderline.tsx`, `src/components/playful/DoodleArrow.tsx`, `src/components/playful/SectionHeader.tsx`, `src/components/playful/TickerTape.tsx`, `src/components/playful/DoodleDivider.tsx`, `src/components/playful/Stickers.tsx`, `src/components/playful/Footprints.tsx`
- Test: n/a

**Interfaces:**
- Consumes: Task 3 utilities (`bg-note-*`, `shadow-paper`, `animate-float/wiggle/drift/marquee/twinkle`, `font-display`, `text-brand-*`); `Reveal` from Task 6 (create Task 6 first, or create both before verifying)
- Produces: all primitives for Tasks 13-20. Sticker/divider/footprint usage is bounded to the exact spots named in those tasks — no other placements allowed.

- [ ] **Step 1: Create StickyNote.tsx (icon optional — hero passes none per icon budget)**

```tsx
import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

const NOTE_BG = [
  'bg-note-yellow',
  'bg-note-mint',
  'bg-note-peach',
  'bg-note-pink',
  'bg-note-sky',
  'bg-note-lavender',
] as const

const NOTE_ROTATE = [
  '-rotate-2',
  'rotate-1',
  '-rotate-1',
  'rotate-2',
  'rotate-[1.5deg]',
  '-rotate-[1.5deg]',
] as const

type StickyNoteProps = {
  title: string
  copy?: string
  icon?: ReactNode
  index?: number
  draggable?: boolean
  className?: string
}

export default function StickyNote({
  title,
  copy,
  icon,
  index = 0,
  draggable = false,
  className,
}: StickyNoteProps) {
  const reduceMotion = useReducedMotion()
  const slot = index % NOTE_BG.length
  return (
    <motion.div
      drag={draggable && !reduceMotion}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.6}
      whileDrag={{ scale: 1.05, rotate: 0, cursor: 'grabbing' }}
      whileHover={draggable ? { scale: 1.03 } : undefined}
      className={cn(
        'relative min-w-42.5 px-5 pt-6 pb-4 shadow-paper',
        NOTE_BG[slot],
        NOTE_ROTATE[slot],
        !reduceMotion && 'animate-float',
        draggable && !reduceMotion && 'cursor-grab touch-none',
        className,
      )}
      style={!reduceMotion ? { animationDelay: `${slot * -0.9}s` } : undefined}
    >
      <span
        aria-hidden
        className="absolute -top-2.5 left-1/2 h-[18px] w-[62px] -translate-x-1/2 -rotate-3 bg-[rgba(111,119,128,0.28)]"
      />
      <div className="flex items-center gap-2">
        {icon ? <span className="text-ink-900 [&_svg]:size-5">{icon}</span> : null}
        <p className="text-sm font-extrabold text-ink-900">{title}</p>
      </div>
      {copy ? <p className="mt-1 text-xs leading-snug text-ink-900/80">{copy}</p> : null}
    </motion.div>
  )
}
```

- [ ] **Step 2: Create HandUnderline.tsx (static + draw-on-scroll)**

```tsx
import { motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'

const PATH = 'M4 10 C 60 4, 150 4, 216 8'

type HandUnderlineProps = { className?: string; draw?: boolean }

export default function HandUnderline({ className, draw = false }: HandUnderlineProps) {
  const reduceMotion = useReducedMotion()
  if (!draw || reduceMotion) {
    return (
      <svg
        aria-hidden
        viewBox="0 0 220 14"
        preserveAspectRatio="none"
        className={cn('h-[10px] w-full text-brand-blue animate-drift', className)}
      >
        <path d={PATH} fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      </svg>
    )
  }
  return (
    <svg
      aria-hidden
      viewBox="0 0 220 14"
      preserveAspectRatio="none"
      className={cn('h-[10px] w-full text-brand-blue', className)}
    >
      <motion.path
        d={PATH}
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: 'easeOut', delay: 0.4 }}
      />
    </svg>
  )
}
```

- [ ] **Step 3: Create DoodleArrow.tsx**

```tsx
import { cn } from '@/lib/utils'

type DoodleArrowProps = {
  variant?: 'right' | 'down' | 'loop'
  className?: string
}

const PATHS: Record<NonNullable<DoodleArrowProps['variant']>, { body: string; head: string }> = {
  right: {
    body: 'M6 32 C 44 6, 82 6, 106 24',
    head: 'M94 15 L107 25 L93 33',
  },
  down: {
    body: 'M20 6 C 30 44, 30 82, 22 106',
    head: 'M13 94 L22 107 L32 95',
  },
  loop: {
    body: 'M10 60 C 10 20, 90 10, 100 50 C 106 76, 70 88, 52 70',
    head: 'M44 60 L52 71 L63 62',
  },
}

export default function DoodleArrow({ variant = 'right', className }: DoodleArrowProps) {
  const { body, head } = PATHS[variant]
  return (
    <svg
      aria-hidden
      viewBox="0 0 120 120"
      fill="none"
      className={cn('animate-wiggle text-ink-900', className)}
    >
      <path d={body} stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d={head} stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
```

- [ ] **Step 4: Create SectionHeader.tsx**

```tsx
import { cn } from '@/lib/utils'
import Reveal from './Reveal'

type SectionHeaderProps = {
  eyebrow: string
  title: string
  copy?: string
  align?: 'center' | 'left'
  dark?: boolean
  className?: string
}

export default function SectionHeader({
  eyebrow,
  title,
  copy,
  align = 'center',
  dark = false,
  className,
}: SectionHeaderProps) {
  return (
    <Reveal
      className={cn(
        'max-w-3xl',
        align === 'center' ? 'mx-auto text-center' : 'text-left',
        className,
      )}
    >
      <p
        className={cn(
          'text-sm font-extrabold tracking-[0.2em] uppercase italic',
          dark ? 'text-brand-soft' : 'text-brand-ink',
        )}
      >
        {eyebrow}
      </p>
      <h2
        className={cn(
          'mt-3 font-display text-5xl leading-[0.95] font-bold text-balance md:text-6xl',
          dark ? 'text-paper-white' : 'text-ink-900',
        )}
      >
        {title}
      </h2>
      {copy ? (
        <p className={cn('mt-4 text-lg leading-relaxed', dark ? 'text-paper-white/80' : 'text-ink-600')}>
          {copy}
        </p>
      ) : null}
    </Reveal>
  )
}
```

- [ ] **Step 5: Create TickerTape.tsx**

```tsx
import { cn } from '@/lib/utils'

type TickerTapeProps = { items: string[]; className?: string }

export default function TickerTape({ items, className }: TickerTapeProps) {
  const half = (items.join('  ✦  ') + '  ✦  ').repeat(4)
  const textClass = 'shrink-0 text-sm font-extrabold tracking-[0.15em] uppercase text-ink-900'
  return (
    <div className={cn('overflow-hidden border-y-2 border-ink-900 bg-note-yellow py-3', className)}>
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
        <span className={textClass}>{half}</span>
        <span aria-hidden className={textClass}>
          {half}
        </span>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Create DoodleDivider.tsx**

```tsx
import { cn } from '@/lib/utils'

type DoodleDividerProps = { className?: string; flip?: boolean }

export default function DoodleDivider({ className, flip = false }: DoodleDividerProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1440 40"
      preserveAspectRatio="none"
      className={cn('block h-6 w-full', flip && 'rotate-180', className)}
    >
      <path
        d="M0 22 C 120 8, 240 34, 360 22 S 600 8, 720 22 S 960 34, 1080 22 S 1320 8, 1440 22"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}
```

- [ ] **Step 7: Create Stickers.tsx (official doodle set — only these six may be used)**

```tsx
import { cn } from '@/lib/utils'

type StickerProps = { className?: string }

export function StickerStar({ className }: StickerProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={cn('animate-float text-ink-900', className)}>
      <path
        d="M12 2 L14.5 9 L22 9.5 L16 14 L18 21.5 L12 17 L6 21.5 L8 14 L2 9.5 L9.5 9 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function StickerSparkle({ className, twinkle = false }: StickerProps & { twinkle?: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={cn(twinkle ? 'animate-twinkle' : 'animate-float', 'text-brand-blue', className)}
    >
      <path
        d="M12 2 C 13 8, 16 11, 22 12 C 16 13, 13 16, 12 22 C 11 16, 8 13, 2 12 C 8 11, 11 8, 12 2 Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function StickerSquiggle({ className }: StickerProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 120 24"
      preserveAspectRatio="none"
      className={cn('animate-drift text-brand-ink', className)}
    >
      <path
        d="M4 14 C 24 4, 44 22, 64 12 S 104 6, 116 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function StickerCircle({ className }: StickerProps) {
  return (
    <svg aria-hidden viewBox="0 0 60 60" className={cn('animate-wiggle text-brand-blue', className)}>
      <path
        d="M30 5 C 45 5, 55 16, 54 31 C 53 46, 42 55, 28 54 C 14 53, 5 43, 6 29 C 7 15, 17 6, 31 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function StickerTape({ className }: StickerProps) {
  return (
    <span
      aria-hidden
      className={cn('block h-[18px] w-[62px] -rotate-3 bg-[rgba(111,119,128,0.28)]', className)}
    />
  )
}

export function StickerPin({ className }: StickerProps) {
  return (
    <svg aria-hidden viewBox="0 0 20 20" className={cn('text-destructive', className)}>
      <circle cx="10" cy="7" r="5" fill="currentColor" />
      <path d="M10 12 L10 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}
```

- [ ] **Step 8: Create Footprints.tsx (single bounded usage: Mentors → Course strip)**

```tsx
import { cn } from '@/lib/utils'

function Print({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 20 28" className={cn('w-4 text-ink-900/30', className)}>
      <ellipse cx="10" cy="17" rx="6" ry="8" fill="currentColor" />
      <circle cx="4" cy="5" r="2" fill="currentColor" />
      <circle cx="10" cy="3.5" r="2" fill="currentColor" />
      <circle cx="16" cy="5" r="2" fill="currentColor" />
    </svg>
  )
}

export default function Footprints({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn('flex items-start justify-center gap-3', className)}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Print key={i} className={i % 2 === 0 ? '-rotate-12 -translate-y-1' : 'rotate-12 translate-y-1'} />
      ))}
    </div>
  )
}
```

- [ ] **Step 9: Verify + commit**

Run: `npm run build && npm run lint`
Expected: green (unused-file warnings are fine; nothing imports these yet).

```bash
git add frontend/src/components/playful
git commit -m "feat(landing): add playful primitives and illustration system"
```

---

### Task 6: Motion primitives (Reveal, Penguin)

**Files:**
- Create: `src/components/playful/Reveal.tsx`, `src/components/playful/PenguinMascot.tsx`
- Test: n/a

**Interfaces:**
- Consumes: `motion` (Task 1), Task 3 utilities
- Produces: `Reveal`, `PenguinMascot` for Tasks 13-20. (No CursorDoodle — deleted from scope per icon-budget decision.)

- [ ] **Step 1: Create Reveal.tsx**

```tsx
import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'

type RevealProps = {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
}

export default function Reveal({ children, className, delay = 0, y = 36 }: RevealProps) {
  const reduceMotion = useReducedMotion()
  if (reduceMotion) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
```

- [ ] **Step 2: Create PenguinMascot.tsx (geometric hand-drawn-style penguin, ink strokes)**

```tsx
import { cn } from '@/lib/utils'

export default function PenguinMascot({ className }: { className?: string }) {
  return (
    <svg
      role="img"
      aria-label="Maskot pinguin DOSCOM"
      viewBox="0 0 200 230"
      className={cn('animate-bob', className)}
    >
      <ellipse cx="52" cy="130" rx="16" ry="42" fill="#101318" transform="rotate(18 52 130)" />
      <ellipse cx="148" cy="130" rx="16" ry="42" fill="#101318" transform="rotate(-18 148 130)" />
      <ellipse cx="70" cy="212" rx="24" ry="12" fill="#FFB36A" stroke="#101318" strokeWidth="5" />
      <ellipse cx="130" cy="212" rx="24" ry="12" fill="#FFB36A" stroke="#101318" strokeWidth="5" />
      <ellipse cx="100" cy="118" rx="68" ry="86" fill="#101318" />
      <ellipse cx="100" cy="140" rx="44" ry="58" fill="#FFFFFF" />
      <circle cx="78" cy="82" r="15" fill="#FFFFFF" />
      <circle cx="122" cy="82" r="15" fill="#FFFFFF" />
      <circle cx="80" cy="84" r="6" fill="#101318" />
      <circle cx="120" cy="84" r="6" fill="#101318" />
      <circle cx="82" cy="82" r="2" fill="#FFFFFF" />
      <circle cx="122" cy="82" r="2" fill="#FFFFFF" />
      <polygon points="100,94 86,108 114,108" fill="#FFB36A" stroke="#101318" strokeWidth="4" strokeLinejoin="round" />
      <circle cx="66" cy="106" r="7" fill="#F4A6CD" opacity="0.8" />
      <circle cx="134" cy="106" r="7" fill="#F4A6CD" opacity="0.8" />
      <path d="M40 60 C 30 40, 48 28, 62 36" fill="none" stroke="#101318" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}
```

- [ ] **Step 3: Verify + commit**

Run: `npm run build && npm run lint`
Expected: green.

```bash
git add frontend/src/components/playful/Reveal.tsx frontend/src/components/playful/PenguinMascot.tsx
git commit -m "feat(landing): add motion primitives (reveal, mascot)"
```

---

### Task 7: Playful button variants

**Files:**
- Modify: `frontend/src/components/ui/button.tsx`
- Test: n/a

**Interfaces:**
- Consumes: Task 3 (`--primary` = brand blue, `--primary-foreground` = ink, `shadow-button`)
- Produces: global tactile button API (same `variant`/`size` names — zero call-site changes) for Tasks 9, 10, 13, 15, 16, 17, 20.

- [ ] **Step 1: Replace the base + variant strings (keep sizes, keep component code)**

Base old: `"group/button inline-flex shrink-0 items-center justify-center rounded-4xl border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"`.
Base new: same string but `rounded-4xl` → `rounded-[10px]`, `font-medium` → `font-extrabold`, and append `active:translate-y-0.5`:
`"group/button inline-flex shrink-0 items-center justify-center rounded-[10px] border-2 border-transparent bg-clip-padding text-sm font-extrabold whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 active:translate-y-0.5 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"`.

Variant replacements:
- `default`: old `"bg-primary text-primary-foreground hover:bg-primary/80"` → new `"border-ink-900 bg-primary text-primary-foreground shadow-button hover:-translate-y-0.5 hover:shadow-button-hover"`.
- `outline`: old `"border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground"` → new `"border-ink-900 bg-paper-white text-ink-900 shadow-button hover:-translate-y-0.5 hover:bg-paper-paper hover:shadow-button-hover"`.
- `secondary`: old `"bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground"` → new `"border-ink-900 bg-secondary text-secondary-foreground shadow-button hover:-translate-y-0.5 hover:shadow-button-hover"`.
- `ghost`: unchanged. `destructive`: unchanged except already stripped of dark: in Task 4. `link`: unchanged.
- Sizes: unchanged.

- [ ] **Step 2: Verify + commit**

Run: `npm run build && npm run lint`
Expected: green. Visual: open `/auth/login` in dev — buttons now have ink borders + offset shadows (dashboard regression is Task 22's job, not this task's gate).

```bash
git add frontend/src/components/ui/button.tsx
git commit -m "feat(ui): tactile playful button variants (ink border + offset shadow)"
```

---

### Task 8: Motion wiring (Lenis provider + scroll manager)

**Files:**
- Create: `src/providers/motion-provider.tsx`, `src/components/shared/ScrollManager.tsx`
- Modify: `src/main.tsx`, `src/App.tsx`
- Test: n/a

**Interfaces:**
- Consumes: `lenis/react`, `gsap`, Task 1
- Produces: app-wide smooth scroll + ScrollTrigger sync + per-route scroll reset consumed implicitly by all routes.

- [ ] **Step 1: Create motion-provider.tsx**

```tsx
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { gsap } from 'gsap'
import { ReactLenis, useLenis } from 'lenis/react'
import { useEffect, type ReactNode } from 'react'

gsap.registerPlugin(ScrollTrigger)

function ScrollBridge() {
  useLenis(() => {
    ScrollTrigger.update()
  })
  useEffect(() => {
    void document.fonts.ready.then(() => {
      ScrollTrigger.refresh()
    })
  }, [])
  return null
}

export default function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <ReactLenis root options={{ lerp: 0.1 }}>
      <ScrollBridge />
      {children}
    </ReactLenis>
  )
}
```

- [ ] **Step 2: Create ScrollManager.tsx**

```tsx
import { useLenis } from 'lenis/react'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollManager() {
  const { pathname, hash } = useLocation()
  const lenis = useLenis()

  useEffect(() => {
    if (hash) {
      const target = document.querySelector(hash)
      if (target) {
        if (lenis) lenis.scrollTo(target as HTMLElement, { offset: -88 })
        else target.scrollIntoView()
        return
      }
    }
    if (lenis) lenis.scrollTo(0, { immediate: true })
    else window.scrollTo(0, 0)
  }, [pathname, hash, lenis])

  return null
}
```

- [ ] **Step 3: Wire into main.tsx (wrap `<App />`)**

Old:
```tsx
import App from './App.tsx'
...
      <AuthProvider>
        <App />
        <Toaster richColors position="top-right" />
      </AuthProvider>
```
New:
```tsx
import App from './App.tsx'
import MotionProvider from './providers/motion-provider.tsx'
...
      <AuthProvider>
        <MotionProvider>
          <App />
        </MotionProvider>
        <Toaster richColors position="top-right" />
      </AuthProvider>
```

- [ ] **Step 4: Mount ScrollManager inside BrowserRouter in App.tsx**

Old:
```tsx
    <BrowserRouter>
      <ErrorBoundary>
```
New:
```tsx
    <BrowserRouter>
      <ScrollManager />
      <ErrorBoundary>
```
Add import: `import ScrollManager from "./components/shared/ScrollManager.tsx";`

- [ ] **Step 5: Verify + commit**

Run: `npm run build && npm run lint`
Expected: green. Visual: `npm run dev`, open `/`, scroll feels smoothed; navigate `/` → `/course` → `/` lands at top.

```bash
git add frontend/src/providers/motion-provider.tsx frontend/src/components/shared/ScrollManager.tsx frontend/src/main.tsx frontend/src/App.tsx
git commit -m "feat(motion): add Lenis provider with ScrollTrigger sync and route scroll reset"
```

---

### Task 9: Navigation data + Navbar editorial restyle

**Files:**
- Modify: `frontend/src/lib/navigation.tsx`, `frontend/src/components/shared/Navbar.tsx`
- Test: n/a

**Interfaces:**
- Consumes: Task 7 buttons, Task 3 utilities, `ROUTES`, `GuestNavbarAuthProps`
- Produces: anchor nav consumed by new sections' ids (Task 20).

- [ ] **Step 1: Replace navLinks + footerLinks in navigation.tsx**

Old `navLinks` (Home/Course/Community/About — two targets 404):
```tsx
export const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Course', href: '/course' },
  { label: 'Community', href: '/community' },
  { label: 'About', href: '/about' },
]
```
New (anchors work from any route via ScrollManager; only real destinations):
```tsx
export const navLinks = [
  { label: 'Beranda', href: '/#top' },
  { label: 'Stack', href: '/#stack' },
  { label: 'Mentor', href: '/#mentor' },
  { label: 'Kursus', href: '/course' },
  { label: 'Galeri', href: '/#galeri' },
  { label: 'Kontak', href: '/#kontak' },
]
```
Old `footerLinks` (Product/Company/Legal, mostly dead routes) → new:
```tsx
export const footerLinks = {
  Jelajah: [
    { label: 'Kursus', href: '/course' },
    { label: 'Mentor', href: '/#mentor' },
    { label: 'Cara Kerja', href: '/#cara-kerja' },
    { label: 'Galeri', href: '/#galeri' },
  ],
  Mulai: [
    { label: 'Daftar', href: '/auth/register' },
    { label: 'Masuk', href: '/auth/login' },
    { label: 'Beranda', href: '/#top' },
    { label: 'Kontak', href: '/#kontak' },
  ],
}
```

- [ ] **Step 2: Navbar shell + logo + active logic (lines 36, 67-70)**

Line 36 old: `const { pathname } = useLocation()` → new: `const { pathname, hash } = useLocation()`.
Add after line 36:
```tsx
  const isActive = (href: string): boolean => {
    if (href.startsWith('/#')) return pathname === '/' && hash === href.slice(1)
    return pathname === href
  }
```
Line 67 old: `<nav className="bg-primary text-popover fixed top-0 left-0 z-50 w-full shadow-md">` → new: `<nav className="fixed top-0 left-0 z-50 min-h-22 w-full border-b-2 border-ink-900 bg-paper-white/95 text-ink-900 shadow-nav backdrop-blur">`.
Line 69 old: `<Link to="/" className="text-2xl font-bold text-white">` → new: `<Link to="/" className="font-display text-2xl font-bold tracking-tight text-ink-900">`.

- [ ] **Step 3: Desktop links + auth CTAs (lines 78-81, 132-139)**

Lines 78-81 old:
```tsx
                className={`flex items-center justify-center rounded-2xl py-2 text-lg font-medium transition-all ${
                  pathname === navLink.href ? 'bg-popover text-primary px-6' : 'px-4 text-white hover:text-white/80'
                }`}>
```
New:
```tsx
                className={`flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-extrabold tracking-wider uppercase transition-all ${
                  isActive(navLink.href) ? 'bg-brand-blue px-6 text-ink-900' : 'text-ink-900 hover:text-brand-ink'
                }`}>
```
Guest CTAs old (lines 132-139): Daftar `className="bg-transparent text-white hover:bg-white/10 border-white/30 rounded-2xl px-7"` + Masuk `className="bg-white text-primary hover:bg-white/90 rounded-2xl px-7"`.
New: Daftar `className="rounded-[10px] px-7"` variant outline; Masuk `className="rounded-[10px] px-7"` variant default. (Colors/borders/shadows now come from Task 7 variants.)
Authenticated dropdown trigger (lines 92-94): replace `border-white/30 bg-white/10 ... text-white ... hover:bg-white/15 focus-visible:ring-white/60` with `border-ink-900 bg-paper-white text-ink-900 shadow-button hover:-translate-y-0.5`; Avatar `ring-white/35` → `ring-ink-900/20`; AvatarFallback `bg-white/25 ... text-white` → `bg-note-yellow text-ink-900`; name span stays; ChevronDown opacity stays. Dropdown panel (line 108): `border-slate-200 bg-white ... text-slate-700 shadow-xl shadow-slate-900/10` → `border-2 border-ink-900 bg-paper-white text-ink-900 shadow-paper`. Keep all menu logic/handlers untouched.

- [ ] **Step 4: Mobile menu paper (lines 146-211)**

Toggle button (146-152): `rounded-2xl border border-white/40 ... text-white` → `rounded-[10px] border-2 border-ink-900 bg-paper-white text-ink-900 shadow-button`.
Menu container (157): `flex flex-col gap-3 px-6 pb-8 bg-primary` → `flex flex-col gap-3 border-t-2 border-ink-900 bg-paper-white px-6 pb-8`.
Account card (159): `border-white/25 bg-white/10` → `border-ink-900/15 bg-paper-paper`; Avatar ring/fallback same swap as desktop; name `text-white` → `text-ink-900`; role `text-white/75` → `text-ink-500`.
Mobile links (175): active `'bg-white text-primary rounded-2xl font-medium'` → `'bg-brand-blue text-ink-900 rounded-2xl font-extrabold'`; inactive `'text-white hover:text-white/80'` → `'text-ink-900 hover:text-brand-ink'`.
Account section (182-195): `border-white/20` → `border-ink-900/15`; label `text-white/60` → `text-ink-500`; buttons `text-white hover:text-white/85` → `text-ink-900 hover:text-brand-ink`; logout `text-red-200 hover:text-red-100` → `text-destructive hover:text-destructive/80`.
Mobile auth buttons (200, 204): Daftar → variant outline `className="w-full rounded-[10px]"`; Masuk → variant default `className="w-full rounded-[10px]"`.

- [ ] **Step 5: Verify + commit**

Run: `npm run build && npm run lint`
Expected: green. Visual: `/` shows paper navbar, uppercase links, blue active pill; Daftar/Masuk tactile; mobile menu paper; logged-in dropdown still works (logic untouched).

```bash
git add frontend/src/lib/navigation.tsx frontend/src/components/shared/Navbar.tsx
git commit -m "feat(nav): editorial paper navbar with anchor links"
```

---

### Task 10: Footer ink restyle

**Files:**
- Modify: `frontend/src/components/shared/Footer.tsx`
- Test: n/a

**Interfaces:**
- Consumes: Task 9 `footerLinks`/`socialLinks`, Task 7 buttons
- Produces: styled footer for all guest pages. Keeps: newsletter logic, `isFooterHidden` on `/course/:uid`, socials mapping.

- [ ] **Step 1: Shell + newsletter card**

Line 23 old: `<footer className="bg-secondary-foreground text-popover w-full">` → new: `<footer className="w-full bg-ink-800 text-paper-white">`.
Newsletter panel (line 26) old: `"bg-card rounded-xl border border-blue-500/20 px-8 py-12 backdrop-blur-sm sm:px-12"` → new: `"rounded-3xl border-2 border-ink-900 bg-paper-white px-8 py-12 text-ink-900 shadow-paper sm:px-12"`.
Newsletter heading (29): `text-primary` → `text-ink-900 font-display`; sub (30): `text-primary/80` → `text-ink-600`.
Input (33-39): keep props, className old `"bg-popover/5 text-secondary-foreground flex-1 rounded-md border-2 border-gray-300 py-5 placeholder:text-gray-700/40"` → new `"flex-1 rounded-[10px] border-2 border-ink-900 bg-paper-white py-5 text-ink-900 placeholder:text-ink-400"`.
Submit Button (41): keep `type="submit"`, className → `"rounded-[10px] px-7 py-5"` variant default.

- [ ] **Step 2: Brand + link columns + bottom bar**

Brand link (54): `text-primary` → `text-brand-blue font-display`. Description (57): `text-popover/80` → `text-paper-white/75`. Socials (63): `text-popover transition-colors hover:text-primary` → `text-paper-white/80 transition-colors hover:text-brand-blue`.
Column heading (74): `text-white` stays. Column links (78): `text-popover/70 hover:text-primary` → `text-paper-white/70 hover:text-brand-blue`.
Divider (88): `border-popover/10` → `border-paper-white/15`. Copyright (89): `text-popover/50` → `text-paper-white/50`.

- [ ] **Step 3: Verify + commit**

Run: `npm run build && npm run lint`
Expected: green. Visual: `/` footer ink-navy, paper newsletter card, links resolve (no new 404s beyond pre-existing).

```bash
git add frontend/src/components/shared/Footer.tsx
git commit -m "feat(footer): ink-navy editorial restyle, remapped links"
```

---

### Task 11: Landing data modules (copy, stack, mentors, courses, terminal, story, contact, gallery, testimonial)

**Files:**
- Create: `src/lib/landing/copy.ts`, `src/lib/landing/stack.ts`, `src/lib/landing/mentors.ts`, `src/lib/landing/courses.ts`, `src/lib/landing/terminal.ts`, `src/lib/landing/story.ts`, `src/lib/landing/contact.ts`, `src/lib/landing/gallery.ts`, `src/lib/landing/testimonial.ts`
- Test: n/a

**Interfaces:**
- Consumes: `ROUTES`, existing `socialLinks` values (copied verbatim into contact.ts)
- Produces: single-source STATIC content for Tasks 13-20. No hooks, no services, no fetch. Sample entries are marked SAMPEL + covered by launch gates (spec §14).

- [ ] **Step 1: Create copy.ts (hook option A + ticker + story header)**

```ts
import { ROUTES } from '@/lib/routes'

export const LANDING_COPY = {
  hero: {
    eyebrow: 'Komunitas Open Source Udinus',
    titleA: 'Ngoding sendirian',
    titleB: 'itu sepi.',
    sub: 'Belajar bareng komunitas, dibimbing mentor praktisi, pulang bawa portofolio open source.',
    primaryCta: { label: 'Gabung Komunitas', href: ROUTES.register },
    secondaryCta: { label: 'Jelajahi Kursus', href: ROUTES.courses },
  },
  ticker: [
    'open source',
    'sprint',
    'code review',
    'mentoring',
    'portofolio',
    'komunitas udinus',
    'ngoding bareng',
  ],
  notes: [
    { title: 'Proyek OSS Nyata', copy: 'Kontribusi repo komunitas' },
    { title: 'Mentor Praktisi', copy: 'Dibimbing yang sudah kerja' },
    { title: 'Sprint & Code Review', copy: 'Simulasi tim sungguhan' },
    { title: 'Sertifikat', copy: 'Bukti capstone resmi' },
    { title: 'Komunitas Udinus', copy: 'Teman seperjuangan' },
  ],
  stack: {
    eyebrow: 'Our Stack',
    title: 'Senjata yang kami pakai.',
    copy: 'Teknologi nyata yang menjalankan platform ini — yang kamu pelajari, yang kami pakai.',
  },
  mentors: {
    eyebrow: 'Our Mentors',
    title: 'Dibimbing yang sudah di lapangan.',
    copy: 'Mentor adalah praktisi dan kontributor open source yang aktif mengajar di kursus kami.',
  },
  course: {
    eyebrow: 'Course',
    title: 'Kursus yang pulangnya bawa portofolio.',
    copy: 'Materi inti yang dikembangkan bersama komunitas open source.',
    allHref: ROUTES.courses,
    allLabel: 'Lihat semua kursus',
  },
  terminal: {
    eyebrow: 'Terminal',
    title: 'Cobain ngetik dulu.',
    copy: 'Klik perintahnya atau ketik sendiri. Tidak ada yang bisa rusak di sini.',
  },
  story: {
    eyebrow: 'Cerita Interaktif',
    title: 'Hari pertamamu di DOSCOM.',
    copy: 'Pilih jalanmu. Tidak ada jawaban salah — semua berujung pada hal nyata.',
  },
  howItWorks: {
    eyebrow: 'Cara Kerja',
    title: 'Dari gabung sampai portofolio.',
    copy: 'Tiga langkah. Tanpa ribet.',
    steps: [
      { no: '01', title: 'Gabung & daftar', copy: 'Buat akun, pilih kursus atau langsung nimbrung ke komunitas.' },
      { no: '02', title: 'Sprint bareng mentor', copy: 'Belajar lewat sprint tim, code review, dan proyek nyata.' },
      { no: '03', title: 'Kontribusi & portofolio', copy: 'Kontribusimu ke repo open source jadi bukti skill.' },
    ],
  },
  gallery: {
    eyebrow: 'Gallery',
    title: 'Suasana belajar kami.',
    copy: 'Dokumentasi kegiatan, workshop, dan kumpul komunitas.',
    emptyTitle: 'Dokumentasi segera hadir.',
    emptyCopy: 'Foto kegiatan terbaru sedang dikurasi. Sementara itu, gabung dan rasakan langsung.',
  },
  testimonial: {
    eyebrow: 'Kata Mereka',
    title: 'Cerita dari komunitas.',
  },
  finalCta: {
    title: 'Siap berhenti ngoding sendirian?',
    copy: 'Gabung komunitas, ikuti sprint pertamamu, dan mulai bangun portofolio open source minggu ini juga.',
    primaryCta: { label: 'Gabung Sekarang', href: ROUTES.register },
    secondaryCta: { label: 'Lihat Kursus', href: ROUTES.courses },
  },
} as const
```

- [ ] **Step 2: Create stack.ts (factual — from repo: React 19, TS, Tailwind v4, Go/Gin, Postgres, MinIO, Docker)**

```ts
import type { LucideIcon } from 'lucide-react'
import { Atom, Braces, Container, Database, Paintbrush, Server, HardDrive } from 'lucide-react'

export type StackItem = { name: string; detail: string; icon: LucideIcon }

export const DOSCOM_STACK: StackItem[] = [
  { name: 'React 19', detail: 'Frontend interaktif', icon: Atom },
  { name: 'TypeScript', detail: 'Aman sejak ditulis', icon: Braces },
  { name: 'Tailwind CSS', detail: 'Styling utility', icon: Paintbrush },
  { name: 'Go + Gin', detail: 'Backend cepat', icon: Server },
  { name: 'PostgreSQL', detail: 'Data relasional', icon: Database },
  { name: 'MinIO', detail: 'Object storage', icon: HardDrive },
  { name: 'Docker', detail: 'Deploy konsisten', icon: Container },
]
```

- [ ] **Step 3: Create mentors.ts (static samples, launch-gated)**

```ts
export type LandingMentor = { name: string; role: string }

/** LAUNCH GATE: ganti 4 sampel dengan daftar mentor asli (nama + peran). */
export const LANDING_MENTORS: LandingMentor[] = [
  { name: 'Rizky Pratama', role: 'Mentor Web Development' },
  { name: 'Sinta Maharani', role: 'Mentor Machine Learning' },
  { name: 'Bagas Aditya', role: 'Mentor Open Source' },
  { name: 'Nadia Putri', role: 'Mentor UI Engineering' },
]

export function mentorInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
```

- [ ] **Step 4: Create courses.ts (static samples, launch-gated)**

```ts
export type StaticCourseAccent = 'yellow' | 'mint' | 'peach' | 'pink' | 'sky' | 'lavender'

export type StaticCourse = {
  title: string
  desc: string
  level: 'Pemula' | 'Menengah' | 'Semua level'
  accent: StaticCourseAccent
}

/** LAUNCH GATE: ganti 3 sampel dengan kursus unggulan asli (judul + deskripsi + level). */
export const LANDING_COURSES: StaticCourse[] = [
  {
    title: 'Web Development Fundamental',
    desc: 'HTML, CSS, JavaScript sampai React — sambil bangun proyek repo komunitas.',
    level: 'Pemula',
    accent: 'yellow',
  },
  {
    title: 'Machine Learning Dasar',
    desc: 'Python, data, dan model pertama yang benar-benar jalan.',
    level: 'Pemula',
    accent: 'mint',
  },
  {
    title: 'Kontribusi Open Source Pertama',
    desc: 'Git, pull request, dan code review sampai PR-nya di-merge.',
    level: 'Semua level',
    accent: 'sky',
  },
]
```

- [ ] **Step 5: Create terminal.ts (static command map, spec §9.4)**

```ts
import { ROUTES } from '@/lib/routes'

export type TerminalLineKind = 'cmd' | 'out' | 'link'

export type TerminalLine = {
  id: number
  text: string
  kind: TerminalLineKind
  href?: string
  label?: string
}

export type TerminalCommandDef = {
  desc: string
  out: string[]
  cta?: { label: string; href: string }
}

export const TERMINAL_BOOT: string[] = [
  'doscomOS v2.0 — terminal komunitas.',
  "ketik 'help' atau klik perintah di bawah.",
]

export const TERMINAL_COMMANDS: Record<string, TerminalCommandDef> = {
  help: {
    desc: 'lihat daftar perintah',
    out: [
      'perintah tersedia:',
      'whoami — siapa kamu di sini',
      'join — cara gabung',
      'sprint — alur sprint',
      'stack — teknologi kami',
    ],
  },
  whoami: {
    desc: 'cek identitasmu',
    out: ['calon kontributor open source.', 'status: belum merge PR pertama.'],
  },
  join: {
    desc: 'cara gabung DOSCOM',
    out: ['1. daftar akun', '2. pilih kursus atau langsung nimbrung', '3. ikut sprint pertamamu'],
    cta: { label: 'Daftar sekarang →', href: ROUTES.register },
  },
  sprint: {
    desc: 'alur sprint belajar',
    out: ['belajar → build → review → launch.', 'setiap sprint didampingi mentor dan ditutup code review.'],
  },
  stack: {
    desc: 'teknologi yang dipakai',
    out: ['react 19 · typescript · tailwind · go + gin · postgresql · minio · docker'],
  },
}

export const TERMINAL_SUDO = 'kamu belum jadi maintainer. ikut sprint dulu.'

export function unknownCommand(cmd: string): string {
  return `'${cmd}': perintah tidak dikenal. coba 'help'.`
}
```

- [ ] **Step 6: Create story.ts (9 nodes, 3 endings — full naskah, spec §9.5)**

```ts
export type StoryChoice = { label: string; next: string }

export type StoryEnding = {
  title: string
  copy: string
  ctaLabel: string
  ctaHref: string
}

export type StoryNode = {
  id: string
  text: string
  choices: StoryChoice[]
  ending?: StoryEnding
}

export const STORY_START = 'mulai'

export const STORY_NODES: Record<string, StoryNode> = {
  mulai: {
    id: 'mulai',
    text: "Hari pertama. Kamu berdiri di depan sekretariat DOSCOM — laptop di tas, penasaran di kepala. Seorang kakak tingkat menyapa: 'Mau mulai dari mana?'",
    choices: [
      { label: 'Ikut kumpul perdana', next: 'kumpul' },
      { label: 'Langsung buka laptop', next: 'laptop' },
    ],
  },
  kumpul: {
    id: 'kumpul',
    text: 'Ruangan penuh sticky notes dan tawa. Topiknya acak: error semalam, repo baru, siapa yang bawa gorengan. Kamu pulang dengan dua teman baru.',
    choices: [
      { label: 'Ulik repo yang dibahas', next: 'repo' },
      { label: 'Tanya-tanya dulu', next: 'tanya' },
    ],
  },
  laptop: {
    id: 'laptop',
    text: 'Kamu buka editor. Kursor berkedip di file kosong. Semua orang di ruangan ini pernah di titik persis ini — termasuk para mentor.',
    choices: [
      { label: 'Ikut sprint pemula', next: 'sprint' },
      { label: 'Lihat-lihat dulu', next: 'tanya' },
    ],
  },
  repo: {
    id: 'repo',
    text: "PR pertamamu: membetulkan typo di dokumentasi. Kecil? Maintainer-nya me-merge sambil bilang 'thanks!'. Rasanya keterusan.",
    choices: [{ label: 'Lanjutkan →', next: 'ending-oss' }],
  },
  tanya: {
    id: 'tanya',
    text: 'Kamu bertanya sampai paham: sprint itu apa, review itu apa, mulai dari mana. Rasa penasaranmu akhirnya dapat alamat.',
    choices: [{ label: 'Lanjutkan →', next: 'ending-jelajah' }],
  },
  sprint: {
    id: 'sprint',
    text: 'Sprint pertamamu: bikin halaman web untuk acara komunitas. Mentormu me-review tiap baris. Capek. Nagih.',
    choices: [{ label: 'Lanjutkan →', next: 'ending-web' }],
  },
  'ending-oss': {
    id: 'ending-oss',
    text: '',
    choices: [],
    ending: {
      title: 'Kontributor Open Source',
      copy: 'Enam bulan kemudian, namamu ada di daftar kontributor. Portofoliomu bukan janji — bukti yang bisa diklik.',
      ctaLabel: 'Lihat jalur kontribusi',
      ctaHref: '/#kursus',
    },
  },
  'ending-web': {
    id: 'ending-web',
    text: '',
    choices: [],
    ending: {
      title: 'Pengembang Web',
      copy: 'Halaman acaramu live dan dipakai ratusan orang. Baris kodemu ada di internet, bukan cuma di laptop.',
      ctaLabel: 'Lihat jalur web',
      ctaHref: '/#kursus',
    },
  },
  'ending-jelajah': {
    id: 'ending-jelajah',
    text: '',
    choices: [],
    ending: {
      title: 'Penjelajah Jalur',
      copy: 'Masih ragu itu normal. Mulai dari yang paling dasar, pelan-pelan, bareng-bareng.',
      ctaLabel: 'Lihat semua kursus',
      ctaHref: '/#kursus',
    },
  },
}
```

- [ ] **Step 7: Create contact.ts (values copied VERBATIM from socialLinks — incl. defects, flagged)**

```ts
import { Globe, Mail } from 'lucide-react'

export type ContactItem = { label: string; href: string; icon: typeof Globe }

/** LAUNCH GATE: ganti href generik + mailto kosong dengan kontak DOSCOM asli. */
export const CONTACTS: ContactItem[] = [
  { label: 'GitHub', href: 'https://github.com', icon: Globe },
  { label: 'LinkedIn', href: 'https://linkedin.com', icon: Globe },
  { label: 'Twitter', href: 'https://twitter.com', icon: Globe },
  { label: 'Instagram', href: 'https://instagram.com', icon: Globe },
  { label: 'Email', href: 'mailto: ', icon: Mail },
]
```

- [ ] **Step 8: Create gallery.ts + testimonial.ts**

```ts
export type GalleryImage = { src: string; alt: string }

/** LAUNCH GATE: taruh file di public/gallery/ lalu isi daftar ini. */
export const GALLERY_IMAGES: GalleryImage[] = []
```
```ts
export type Testimonial = { quote: string; name: string; role: string }

/** LAUNCH GATE: ganti sampel dengan testimoni komunitas asli sebelum launch. */
export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'Ikut sprint di DOSCOM mengubah cara saya belajar. Pertama kali code saya di-review orang lain — dan pertama kali saya punya portofolio yang berani ditunjukkan ke recruiter.',
    name: 'Alumni DOSCOM',
    role: 'Peserta program komunitas',
  },
]
```

- [ ] **Step 9: Verify + commit**

Run: `npm run build && npm run lint`
Expected: green.

```bash
git add frontend/src/lib/landing
git commit -m "feat(landing): add single-source static landing content modules"
```

---

### Task 12: MentorCard (zero icons)

**Files:**
- Create: `src/components/landing/MentorCard.tsx`
- Test: n/a

**Interfaces:**
- Consumes: `LandingMentor` + `mentorInitials` (Task 11), `Reveal` (Task 6), Task 3 pastels
- Produces: `MentorCard` for Task 14.

- [ ] **Step 1: Create MentorCard.tsx**

```tsx
import { cn } from '@/lib/utils'
import Reveal from '@/components/playful/Reveal'
import { mentorInitials, type LandingMentor } from '@/lib/landing/mentors'

const AVATAR_BG = ['bg-note-yellow', 'bg-note-mint', 'bg-note-peach', 'bg-note-pink', 'bg-note-sky', 'bg-note-lavender'] as const

type MentorCardProps = { mentor: LandingMentor; index?: number; className?: string }

export default function MentorCard({ mentor, index = 0, className }: MentorCardProps) {
  return (
    <Reveal delay={(index % 4) * 0.1} className={className}>
      <article className="flex h-full flex-col items-center rounded-[20px] border-2 border-ink-900 bg-paper-white px-6 py-8 text-center shadow-paper transition-transform hover:-translate-y-1">
        <div
          className={cn(
            'flex size-20 items-center justify-center rounded-full border-2 border-ink-900 font-display text-2xl font-bold text-ink-900',
            AVATAR_BG[index % AVATAR_BG.length],
          )}
        >
          {mentorInitials(mentor.name)}
        </div>
        <h3 className="mt-4 font-display text-xl font-bold text-ink-900">{mentor.name}</h3>
        <p className="mt-1 text-sm font-bold text-brand-ink">{mentor.role}</p>
      </article>
    </Reveal>
  )
}
```

- [ ] **Step 2: Verify + commit**

Run: `npm run build && npm run lint`
Expected: green.

```bash
git add frontend/src/components/landing/MentorCard.tsx
git commit -m "feat(landing): add static mentor card (zero icons)"
```

---

### Task 13: Hero playground (parallax + drag + draw + easter egg)

**Files:**
- Create: `src/components/landing/Hero.tsx`
- Test: n/a

**Interfaces:**
- Consumes: `LANDING_COPY` (Task 11), `StickyNote`, `HandUnderline` (draw prop), `DoodleArrow`, `PenguinMascot`, `Reveal` (Tasks 5-6), `Button` (Task 7), `motion` values/springs/animation controls
- Produces: hero playground for Task 20 composition. Anchor id `top`. Exactly 1 icon (CTA arrow). Notes are pointer-only decor inside an `aria-hidden` region (no tab stops inside — verified in Step 2).

- [ ] **Step 1: Create Hero.tsx**

```tsx
import {
  AnimatePresence,
  motion,
  useAnimation,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'motion/react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import DoodleArrow from '@/components/playful/DoodleArrow'
import HandUnderline from '@/components/playful/HandUnderline'
import PenguinMascot from '@/components/playful/PenguinMascot'
import Reveal from '@/components/playful/Reveal'
import StickyNote from '@/components/playful/StickyNote'
import { LANDING_COPY } from '@/lib/landing/copy'

const EGG_CLICKS = 5

export default function Hero() {
  const { hero, notes } = LANDING_COPY
  const reduceMotion = useReducedMotion()
  const finePointer =
    typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches
  const parallaxOn = !reduceMotion && finePointer

  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 60, damping: 20 })
  const sy = useSpring(my, { stiffness: 60, damping: 20 })
  const layerAx = useTransform(sx, (v) => v * 20)
  const layerAy = useTransform(sy, (v) => v * 14)
  const layerBx = useTransform(sx, (v) => v * -12)
  const layerBy = useTransform(sy, (v) => v * -10)

  const [boops, setBoops] = useState(0)
  const [eggOn, setEggOn] = useState(false)
  const eggControls = useAnimation()

  const onMouseMove = (e: React.MouseEvent<HTMLElement>): void => {
    if (!parallaxOn) return
    const rect = e.currentTarget.getBoundingClientRect()
    mx.set(((e.clientX - rect.left) / rect.width - 0.5) * 2)
    my.set(((e.clientY - rect.top) / rect.height - 0.5) * 2)
  }

  const boop = (): void => {
    if (reduceMotion) return
    const next = boops + 1
    if (next >= EGG_CLICKS) {
      setBoops(0)
      setEggOn(true)
      void eggControls.start({ rotate: [0, 360], transition: { duration: 0.6 } })
      window.setTimeout(() => setEggOn(false), 2500)
    } else {
      setBoops(next)
    }
  }

  return (
    <section
      id="top"
      onMouseMove={onMouseMove}
      className="relative overflow-hidden bg-paper-white pt-36 pb-24 md:pt-44"
    >
      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        <Reveal>
          <p className="text-sm font-extrabold tracking-[0.2em] uppercase italic text-brand-ink">
            {hero.eyebrow}
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <h1 className="mt-4 font-display text-[clamp(3.5rem,8vw,8rem)] leading-[0.9] font-bold text-balance text-ink-900">
            {hero.titleA}{' '}
            <span className="relative inline-block">
              {hero.titleB}
              <HandUnderline draw className="absolute -bottom-2 left-0" />
            </span>
          </h1>
        </Reveal>
        <Reveal delay={0.16}>
          <p className="mx-auto mt-6 max-w-2xl text-xl leading-relaxed text-ink-600">{hero.sub}</p>
        </Reveal>
        <Reveal delay={0.24}>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="h-14 px-8 text-base">
              <Link to={hero.primaryCta.href}>
                {hero.primaryCta.label}
                <ArrowRight className="size-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 px-8 text-base">
              <Link to={hero.secondaryCta.href}>{hero.secondaryCta.label}</Link>
            </Button>
          </div>
        </Reveal>
      </div>

      <motion.div
        aria-hidden
        style={parallaxOn ? { x: layerAx, y: layerAy } : undefined}
        className="pointer-events-none absolute inset-0 z-0 hidden lg:block"
      >
        <div className="absolute top-[22%] left-[4%]">
          <StickyNote title={notes[0].title} copy={notes[0].copy} index={0} draggable />
        </div>
        <div className="absolute top-[30%] right-[4%]">
          <StickyNote title={notes[1].title} copy={notes[1].copy} index={1} draggable />
        </div>
        <div className="absolute bottom-[16%] left-[9%]">
          <StickyNote title={notes[2].title} copy={notes[2].copy} index={2} draggable />
        </div>
        <div className="absolute right-[10%] bottom-[20%]">
          <StickyNote title={notes[3].title} copy={notes[3].copy} index={3} draggable />
        </div>
        <div className="absolute bottom-[6%] left-1/2 -translate-x-1/2">
          <StickyNote title={notes[4].title} copy={notes[4].copy} index={4} draggable />
        </div>
      </motion.div>
      <motion.div
        aria-hidden
        style={parallaxOn ? { x: layerBx, y: layerBy } : undefined}
        className="pointer-events-none absolute inset-0 z-0 hidden lg:block"
      >
        <DoodleArrow variant="right" className="absolute top-[24%] left-[22%] w-28 -rotate-12" />
        <DoodleArrow variant="loop" className="absolute top-[26%] right-[22%] w-24 rotate-12 text-brand-ink" />
      </motion.div>

      <div className="relative z-0 mx-auto mt-4 flex max-w-md justify-center lg:absolute lg:right-[6%] lg:bottom-10 lg:mt-0 lg:max-w-none">
        <div className="relative">
          <button
            type="button"
            onClick={boop}
            aria-label="Sapa pinguin"
            className="pointer-events-auto cursor-pointer bg-transparent"
          >
            <motion.div animate={eggControls}>
              <PenguinMascot className="w-40 -rotate-3 md:w-52" />
            </motion.div>
          </button>
          <AnimatePresence>
            {eggOn && (
              <motion.p
                role="status"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute -top-10 left-1/2 -translate-x-1/2 -rotate-3 rounded-xl border-2 border-ink-900 bg-note-yellow px-3 py-1 text-sm font-extrabold whitespace-nowrap text-ink-900 shadow-paper"
              >
                wark!
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify + commit**

Run: `npm run build && npm run lint`
Expected: green. Visual: headline underline draws once on load; decor parallaxes with mouse (fine pointer only); notes draggable on desktop; 5 penguin clicks (or Enter when focused) → spin + "wark!"; keyboard Tab order never lands inside the aria-hidden decor (no tab stops there — the penguin button is OUTSIDE the aria-hidden layers, verified).

```bash
git add frontend/src/components/landing/Hero.tsx
git commit -m "feat(landing): build hero playground (parallax, drag, draw, easter egg)"
```

---

### Task 14: Stack + Mentors sections (static, twinkle corners)

**Files:**
- Create: `src/components/landing/StackSection.tsx`, `src/components/landing/MentorsSection.tsx`
- Test: n/a

**Interfaces:**
- Consumes: `DOSCOM_STACK` + `LANDING_MENTORS` (Task 11), `MentorCard` (Task 12), `SectionHeader` + `Reveal` (Tasks 5-6), `StickerSparkle` twinkle (Task 5)
- Produces: sections for Task 20. Anchors `stack`, `mentor`.

- [ ] **Step 1: Create StackSection.tsx (dark navy grid + 2 twinkle stickers)**

```tsx
import Reveal from '@/components/playful/Reveal'
import SectionHeader from '@/components/playful/SectionHeader'
import { StickerSparkle } from '@/components/playful/Stickers'
import { DOSCOM_STACK } from '@/lib/landing/stack'

export default function StackSection() {
  return (
    <section id="stack" className="relative bg-ink-800 py-24 md:py-32">
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.055)_1px,transparent_1px)] bg-[size:24px_24px]"
      />
      <StickerSparkle twinkle aria-hidden={undefined} className="absolute top-10 left-[8%] hidden w-5 md:block" />
      <StickerSparkle twinkle className="absolute right-[10%] bottom-12 hidden w-4 md:block" />
      <div className="relative mx-auto max-w-6xl px-6">
        <SectionHeader
          dark
          eyebrow="Our Stack"
          title="Senjata yang kami pakai."
          copy="Teknologi nyata yang menjalankan platform ini — yang kamu pelajari, yang kami pakai."
        />
        <div className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {DOSCOM_STACK.map((item, i) => {
            const Icon = item.icon
            return (
              <Reveal key={item.name} delay={(i % 4) * 0.08}>
                <div className="flex h-full flex-col items-center rounded-[20px] border-2 border-paper-white bg-paper-white/5 px-4 py-8 text-center backdrop-blur-[1px] transition-transform hover:-translate-y-1">
                  <span className="flex size-12 items-center justify-center rounded-xl border border-paper-white/20 bg-brand-blue/15 text-brand-soft">
                    <Icon className="size-6" />
                  </span>
                  <p className="mt-3 font-display text-lg font-bold text-paper-white">{item.name}</p>
                  <p className="mt-1 text-xs text-paper-white/70">{item.detail}</p>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
```
Note: `StickerSparkle` takes only `className` + `twinkle` — remove the stray `aria-hidden={undefined}` before saving (the svg is already aria-hidden internally).

- [ ] **Step 2: Create MentorsSection.tsx (static, no skeleton)**

```tsx
import MentorCard from '@/components/landing/MentorCard'
import SectionHeader from '@/components/playful/SectionHeader'
import { LANDING_COPY } from '@/lib/landing/copy'
import { LANDING_MENTORS } from '@/lib/landing/mentors'

export default function MentorsSection() {
  const { mentors } = LANDING_COPY

  return (
    <section id="mentor" className="bg-paper-white py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader eyebrow={mentors.eyebrow} title={mentors.title} copy={mentors.copy} />
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {LANDING_MENTORS.map((mentor, i) => (
            <MentorCard key={mentor.name} mentor={mentor} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Verify + commit**

Run: `npm run build && npm run lint`
Expected: green.

```bash
git add frontend/src/components/landing/StackSection.tsx frontend/src/components/landing/MentorsSection.tsx
git commit -m "feat(landing): add stack and static mentors sections"
```

---

### Task 15: Static course cards + Course section

**Files:**
- Create: `src/components/landing/StaticCourseCard.tsx`, `src/components/landing/CourseSection.tsx`
- Test: n/a

**Interfaces:**
- Consumes: `LANDING_COURSES` + `StaticCourse` (Task 11), `LANDING_COPY.course` (Task 11), `SectionHeader` + `Reveal`
- Produces: section for Task 20. Anchor `kursus`. Zero icons in cards; 1 arrow in "Lihat semua".

- [ ] **Step 1: Create StaticCourseCard.tsx (pastel cover + display numeral, no images)**

```tsx
import { cn } from '@/lib/utils'
import Reveal from '@/components/playful/Reveal'
import type { StaticCourse } from '@/lib/landing/courses'

const ACCENT_BG: Record<StaticCourse['accent'], string> = {
  yellow: 'bg-note-yellow',
  mint: 'bg-note-mint',
  peach: 'bg-note-peach',
  pink: 'bg-note-pink',
  sky: 'bg-note-sky',
  lavender: 'bg-note-lavender',
}

type StaticCourseCardProps = { course: StaticCourse; index?: number }

export default function StaticCourseCard({ course, index = 0 }: StaticCourseCardProps) {
  const numeral = String(index + 1).padStart(2, '0')
  return (
    <Reveal delay={(index % 3) * 0.1} className="h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-[20px] border-2 border-ink-900 bg-paper-white shadow-paper transition-transform hover:-translate-y-1">
        <div className={cn('flex aspect-[16/9] items-end justify-between border-b-2 border-ink-900 p-5', ACCENT_BG[course.accent])}>
          <span className="font-display text-6xl leading-none font-bold text-ink-900">{numeral}</span>
          <span className="rounded-full border-2 border-ink-900 bg-paper-white px-3 py-1 text-xs font-extrabold text-ink-900">
            {course.level}
          </span>
        </div>
        <div className="flex flex-1 flex-col p-5">
          <h3 className="font-display text-xl leading-tight font-bold text-ink-900">{course.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-600">{course.desc}</p>
        </div>
      </article>
    </Reveal>
  )
}
```

- [ ] **Step 2: Create CourseSection.tsx (static, no skeleton)**

```tsx
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Reveal from '@/components/playful/Reveal'
import SectionHeader from '@/components/playful/SectionHeader'
import StaticCourseCard from '@/components/landing/StaticCourseCard'
import { Button } from '@/components/ui/button'
import { LANDING_COPY } from '@/lib/landing/copy'
import { LANDING_COURSES } from '@/lib/landing/courses'

export default function CourseSection() {
  const { course } = LANDING_COPY
  return (
    <section id="kursus" className="bg-paper-panel py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader eyebrow={course.eyebrow} title={course.title} copy={course.copy} />
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {LANDING_COURSES.map((item, i) => (
            <StaticCourseCard key={item.title} course={item} index={i} />
          ))}
        </div>
        <Reveal className="mt-10 text-center">
          <Button asChild variant="outline" size="lg" className="h-14 px-8 text-base">
            <Link to={course.allHref}>
              {course.allLabel}
              <ArrowRight className="size-5" />
            </Link>
          </Button>
        </Reveal>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Verify + commit**

Run: `npm run build && npm run lint`
Expected: green.

```bash
git add frontend/src/components/landing/StaticCourseCard.tsx frontend/src/components/landing/CourseSection.tsx
git commit -m "feat(landing): add static course section (no images, no icons)"
```

---

### Task 16: Terminal interaktif (whiteboard replacement)

**Files:**
- Create: `src/components/landing/TerminalSection.tsx`
- Test: n/a

**Interfaces:**
- Consumes: `TERMINAL_BOOT`, `TERMINAL_COMMANDS`, `TERMINAL_SUDO`, `unknownCommand`, `TerminalLine` (Task 11), `SectionHeader` + `Reveal`, `LANDING_COPY.terminal`, `StickerCircle` (Task 5, 1 usage)
- Produces: interactive showpiece for Task 20. Anchor id `terminal`. Zero icons (header dots are CSS circles).

- [ ] **Step 1: Create TerminalSection.tsx**

```tsx
import { useInView, useReducedMotion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Reveal from '@/components/playful/Reveal'
import SectionHeader from '@/components/playful/SectionHeader'
import { StickerCircle } from '@/components/playful/Stickers'
import { LANDING_COPY } from '@/lib/landing/copy'
import {
  TERMINAL_BOOT,
  TERMINAL_COMMANDS,
  TERMINAL_SUDO,
  unknownCommand,
  type TerminalLine,
} from '@/lib/landing/terminal'
import { cn } from '@/lib/utils'

export default function TerminalSection() {
  const { terminal } = LANDING_COPY
  const root = useRef<HTMLElement>(null)
  const inView = useInView(root, { once: true, margin: '-120px' })
  const reduceMotion = useReducedMotion()
  const [lines, setLines] = useState<TerminalLine[]>([])
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [histIndex, setHistIndex] = useState(-1)
  const idRef = useRef(0)
  const timers = useRef<number[]>([])
  const outputRef = useRef<HTMLDivElement>(null)
  const booted = useRef(false)

  const nextId = useCallback((): number => {
    idRef.current += 1
    return idRef.current
  }, [])

  const push = useCallback(
    (batch: TerminalLine[]): void => {
      if (reduceMotion) {
        setLines((prev) => [...prev, ...batch])
        return
      }
      batch.forEach((line, i) => {
        timers.current.push(
          window.setTimeout(() => {
            setLines((prev) => [...prev, line])
          }, i * 120),
        )
      })
    },
    [reduceMotion],
  )

  useEffect(() => {
    const pending = timers.current
    return () => {
      pending.forEach((t) => window.clearTimeout(t))
    }
  }, [])

  useEffect(() => {
    outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight })
  }, [lines])

  useEffect(() => {
    if (inView && !booted.current) {
      booted.current = true
      push(TERMINAL_BOOT.map((text) => ({ id: nextId(), text, kind: 'out' as const })))
    }
  }, [inView, push, nextId])

  const run = (raw: string): void => {
    const trimmed = raw.trim()
    if (!trimmed) return
    const cmd = trimmed.toLowerCase()
    const batch: TerminalLine[] = [{ id: nextId(), text: `~/doscom $ ${trimmed}`, kind: 'cmd' }]
    if (cmd === 'sudo' || cmd.startsWith('sudo ')) {
      batch.push({ id: nextId(), text: TERMINAL_SUDO, kind: 'out' })
    } else {
      const def = TERMINAL_COMMANDS[cmd]
      if (!def) {
        batch.push({ id: nextId(), text: unknownCommand(trimmed), kind: 'out' })
      } else {
        def.out.forEach((text) => batch.push({ id: nextId(), text, kind: 'out' }))
        if (def.cta) {
          batch.push({ id: nextId(), text: '', kind: 'link', href: def.cta.href, label: def.cta.label })
        }
      }
    }
    push(batch)
    setHistory((prev) => (prev[prev.length - 1] === trimmed ? prev : [...prev, trimmed]))
    setHistIndex(-1)
    setInput('')
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (history.length === 0) return
      const next = histIndex === -1 ? history.length - 1 : Math.max(0, histIndex - 1)
      setHistIndex(next)
      setInput(history[next])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (histIndex === -1) return
      const next = histIndex + 1
      if (next >= history.length) {
        setHistIndex(-1)
        setInput('')
      } else {
        setHistIndex(next)
        setInput(history[next])
      }
    }
  }

  return (
    <section ref={root} id="terminal" className="relative bg-paper-white py-24 md:py-32">
      <StickerCircle className="absolute top-10 right-[8%] hidden w-12 lg:block" />
      <div className="relative mx-auto max-w-3xl px-6">
        <SectionHeader eyebrow={terminal.eyebrow} title={terminal.title} copy={terminal.copy} />
        <Reveal className="mt-10">
          <div className="overflow-hidden rounded-[10px] border-2 border-ink-900 bg-ink-900 shadow-paper">
            <div className="flex items-center gap-2 border-b border-paper-white/15 px-4 py-3">
              <span className="size-3 rounded-full bg-note-pink" aria-hidden />
              <span className="size-3 rounded-full bg-note-yellow" aria-hidden />
              <span className="size-3 rounded-full bg-note-mint" aria-hidden />
              <p className="ml-2 text-xs font-bold text-paper-white/60">doscom — zsh</p>
            </div>
            <div
              ref={outputRef}
              role="log"
              aria-live="polite"
              aria-label="Output terminal DOSCOM"
              className="h-64 space-y-1.5 overflow-y-auto px-4 py-4 font-mono text-sm leading-relaxed"
            >
              {lines.map((line) =>
                line.kind === 'link' && line.href && line.label ? (
                  <div key={line.id}>
                    <Link to={line.href} className="font-bold text-brand-blue underline underline-offset-4 hover:text-brand-soft">
                      {line.label}
                    </Link>
                  </div>
                ) : (
                  <p key={line.id} className={cn(line.kind === 'cmd' ? 'font-bold text-brand-soft' : 'text-paper-white/85')}>
                    {line.text}
                  </p>
                ),
              )}
            </div>
            <div className="flex flex-wrap gap-2 border-t border-paper-white/15 px-4 py-3">
              {Object.entries(TERMINAL_COMMANDS).map(([name, def]) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => run(name)}
                  title={def.desc}
                  className="rounded-full border border-paper-white/25 px-3 py-1 font-mono text-xs font-bold text-paper-white/85 transition-colors hover:border-brand-blue hover:text-brand-soft"
                >
                  {name}
                </button>
              ))}
            </div>
            <form
              className="flex items-center gap-2 border-t border-paper-white/15 px-4 py-3"
              onSubmit={(e) => {
                e.preventDefault()
                run(input)
              }}
            >
              <label htmlFor="doscom-terminal-input" className="sr-only">
                Ketik perintah terminal
              </label>
              <span aria-hidden className="font-mono text-sm font-bold text-brand-soft">
                ~/doscom $
              </span>
              <input
                id="doscom-terminal-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="help"
                autoComplete="off"
                spellCheck={false}
                className="w-full bg-transparent font-mono text-sm text-paper-white outline-none placeholder:text-paper-white/30"
              />
            </form>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
```
Note on the single `eslint-disable` from the earlier draft: not needed — `nextId` is a `useCallback` in deps, so no exhaustive-deps violation. Do NOT add any disable comment.

- [ ] **Step 2: Verify + commit**

Run: `npm run build && npm run lint`
Expected: green. Visual: boot lines appear once on scroll-in; chips run commands; typing unknown + `sudo` respond; ArrowUp recalls history; output auto-scrolls; reduced-motion shows lines instantly.

```bash
git add frontend/src/components/landing/TerminalSection.tsx
git commit -m "feat(landing): add interactive static terminal (whiteboard replacement)"
```

---

### Task 17: StorySection (branching story, 9 nodes)

**Files:**
- Create: `src/components/landing/StorySection.tsx`
- Test: n/a

**Interfaces:**
- Consumes: `STORY_NODES`, `STORY_START`, `StoryNode` (Task 11), `LANDING_COPY.story` (Task 11), `SectionHeader` + `Reveal`, `AnimatePresence`/`motion`
- Produces: narrative showpiece for Task 20. Anchor id `cerita`. Exactly 1 icon (ending CTA arrow).

- [ ] **Step 1: Create StorySection.tsx**

```tsx
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Reveal from '@/components/playful/Reveal'
import SectionHeader from '@/components/playful/SectionHeader'
import { LANDING_COPY } from '@/lib/landing/copy'
import { STORY_NODES, STORY_START } from '@/lib/landing/story'

type TrailItem = { id: string; label: string }

export default function StorySection() {
  const { story } = LANDING_COPY
  const reduceMotion = useReducedMotion()
  const [currentId, setCurrentId] = useState<string>(STORY_START)
  const [trail, setTrail] = useState<TrailItem[]>([])
  const node = STORY_NODES[currentId]
  if (!node) return null

  const choose = (label: string, next: string): void => {
    setTrail((prev) => [...prev, { id: `${currentId}-${next}`, label }])
    setCurrentId(next)
  }

  const restart = (): void => {
    setTrail([])
    setCurrentId(STORY_START)
  }

  return (
    <section id="cerita" className="bg-paper-panel py-24 md:py-32">
      <div className="mx-auto max-w-3xl px-6">
        <SectionHeader eyebrow={story.eyebrow} title={story.title} copy={story.copy} />
        <Reveal className="mt-10">
          <div className="rounded-[20px] border-2 border-ink-900 bg-paper-white p-8 shadow-paper md:p-10">
            {trail.length > 0 && (
              <div className="mb-6 flex flex-wrap gap-2" aria-label="Jejak pilihanmu">
                {trail.map((t) => (
                  <span
                    key={t.id}
                    className="rounded-full bg-paper-panel px-3 py-1 text-xs font-bold text-ink-600"
                  >
                    {t.label}
                  </span>
                ))}
              </div>
            )}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentId}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >
                {node.ending ? (
                  <div className="text-center">
                    <p className="text-sm font-extrabold tracking-[0.2em] uppercase text-brand-ink">
                      Ending: {node.ending.title}
                    </p>
                    <p className="mt-3 text-xl leading-relaxed text-ink-900">{node.ending.copy}</p>
                    <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                      <Button asChild>
                        <Link to={node.ending.ctaHref}>
                          {node.ending.ctaLabel}
                          <ArrowRight className="size-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" onClick={restart}>
                        Ulangi cerita
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-xl leading-relaxed text-ink-900">{node.text}</p>
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                      {node.choices.map((c) => (
                        <Button
                          key={c.next}
                          variant="outline"
                          onClick={() => choose(c.label, c.next)}
                          className="h-auto justify-start px-5 py-3 text-left text-sm"
                        >
                          {c.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify + commit**

Run: `npm run build && npm run lint`
Expected: green. Visual: walk all three paths (kumpul→repo, kumpul/laptop→tanya, laptop→sprint); each ending shows title + CTA to `/#kursus`; restart resets; trail chips accumulate.

```bash
git add frontend/src/components/landing/StorySection.tsx
git commit -m "feat(landing): add branching story section (9 nodes, 3 endings)"
```

---

### Task 18: HowItWorks (dark, GSAP pin desktop-only)

**Files:**
- Create: `src/components/landing/HowItWorksSection.tsx`
- Test: n/a

**Interfaces:**
- Consumes: `LANDING_COPY.howItWorks` (Task 11), `useGSAP` from `@gsap/react`, `gsap`, `ScrollTrigger`, `SectionHeader`, `useReducedMotion` from motion, `StickerSparkle` twinkle (Task 5, 2 usages)
- Produces: pinned showpiece for Task 20. Anchor `cara-kerja`. Zero icons (numerals carry it).

- [ ] **Step 1: Create HowItWorksSection.tsx**

```tsx
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from 'motion/react'
import { useRef } from 'react'
import SectionHeader from '@/components/playful/SectionHeader'
import { StickerSparkle } from '@/components/playful/Stickers'
import { LANDING_COPY } from '@/lib/landing/copy'

gsap.registerPlugin(ScrollTrigger)

export default function HowItWorksSection() {
  const { howItWorks } = LANDING_COPY
  const root = useRef<HTMLElement>(null)
  const reduceMotion = useReducedMotion()

  useGSAP(
    () => {
      if (reduceMotion || !window.matchMedia('(min-width: 1024px)').matches) return
      const cards = gsap.utils.toArray<HTMLElement>('[data-step-card]')
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: 'top top+=88',
          end: '+=1200',
          scrub: 0.6,
          pin: true,
        },
      })
      cards.forEach((card, i) => {
        timeline.fromTo(
          card,
          { opacity: 0.2, y: 80 },
          { opacity: 1, y: 0, ease: 'none', duration: 1 },
          i * 0.5,
        )
      })
      ScrollTrigger.refresh()
    },
    { scope: root, dependencies: [reduceMotion] },
  )

  return (
    <section ref={root} id="cara-kerja" className="relative bg-ink-900 py-24 md:py-32">
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.055)_1px,transparent_1px)] bg-[size:24px_24px]"
      />
      <StickerSparkle twinkle className="absolute top-12 left-[12%] hidden w-5 md:block" />
      <StickerSparkle twinkle className="absolute right-[8%] bottom-16 hidden w-4 md:block" />
      <div className="relative mx-auto max-w-6xl px-6">
        <SectionHeader dark eyebrow={howItWorks.eyebrow} title={howItWorks.title} copy={howItWorks.copy} />
        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {howItWorks.steps.map((step) => (
            <article
              key={step.no}
              data-step-card
              className="rounded-[20px] border-2 border-paper-white bg-paper-white/5 p-8 backdrop-blur-[1px]"
            >
              <p className="font-display text-5xl font-bold text-brand-blue">{step.no}</p>
              <h3 className="mt-3 font-display text-2xl font-bold text-paper-white">{step.title}</h3>
              <p className="mt-2 leading-relaxed text-paper-white/75">{step.copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify + commit**

Run: `npm run build && npm run lint`
Expected: green. Visual (desktop ≥1024): section pins, cards scrub in; mobile: static stacked cards; reduced-motion: static.

```bash
git add frontend/src/components/landing/HowItWorksSection.tsx
git commit -m "feat(landing): add HowItWorks with desktop-only GSAP pin"
```

---

### Task 19: Gallery (progressive horizontal) + Testimonial

**Files:**
- Create: `src/components/landing/GallerySection.tsx`, `src/components/landing/TestimonialSection.tsx`
- Test: n/a

**Interfaces:**
- Consumes: `GALLERY_IMAGES` + `TESTIMONIALS` (Task 11), `SectionHeader` + `Reveal`, `useGSAP`/`gsap`/`ScrollTrigger`
- Produces: sections for Task 20. Anchor `galeri`. 1 icon (gallery empty state) + 5 functional stars.

- [ ] **Step 1: Create GallerySection.tsx (empty grid now; pinned horizontal auto-activates with photos)**

```tsx
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from 'motion/react'
import { useRef } from 'react'
import { ImagePlus } from 'lucide-react'
import Reveal from '@/components/playful/Reveal'
import SectionHeader from '@/components/playful/SectionHeader'
import { LANDING_COPY } from '@/lib/landing/copy'
import { GALLERY_IMAGES } from '@/lib/landing/gallery'

gsap.registerPlugin(ScrollTrigger)

export default function GallerySection() {
  const { gallery } = LANDING_COPY
  const root = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()
  const hasPhotos = GALLERY_IMAGES.length > 0

  useGSAP(
    () => {
      if (reduceMotion || !window.matchMedia('(min-width: 1024px)').matches || !hasPhotos || !track.current) return
      const el = track.current
      const distance = (): number => Math.max(0, el.scrollWidth - window.innerWidth)
      gsap.to(el, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: () => `+=${distance()}`,
          scrub: 0.6,
          pin: true,
          invalidateOnRefresh: true,
        },
      })
      ScrollTrigger.refresh()
    },
    { scope: root, dependencies: [reduceMotion, hasPhotos] },
  )

  return (
    <section ref={root} id="galeri" className="overflow-hidden bg-paper-white py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader eyebrow={gallery.eyebrow} title={gallery.title} copy={gallery.copy} />
        {!hasPhotos ? (
          <Reveal className="mx-auto mt-12 max-w-2xl">
            <div className="flex -rotate-1 flex-col items-center rounded-[20px] border-2 border-dashed border-ink-900/40 bg-paper-panel px-8 py-14 text-center">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-note-yellow text-ink-900">
                <ImagePlus className="size-7" />
              </span>
              <h3 className="mt-4 font-display text-2xl font-bold text-ink-900">{gallery.emptyTitle}</h3>
              <p className="mt-2 text-ink-600">{gallery.emptyCopy}</p>
            </div>
          </Reveal>
        ) : (
          <div
            ref={track}
            className="mt-12 flex w-max gap-6 max-lg:grid max-lg:w-full max-lg:grid-cols-1 sm:max-lg:grid-cols-2"
          >
            {GALLERY_IMAGES.map((img, i) => (
              <figure
                key={img.src}
                className={
                  'overflow-hidden rounded-[20px] border-2 border-ink-900 bg-paper-white shadow-paper lg:w-[34rem] lg:shrink-0 ' +
                  (i % 2 === 0 ? 'rotate-1' : '-rotate-1')
                }
              >
                <img src={img.src} alt={img.alt} loading="lazy" className="aspect-[4/3] w-full object-cover" />
              </figure>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Create TestimonialSection.tsx (+1 twinkle)**

```tsx
import { Star } from 'lucide-react'
import Reveal from '@/components/playful/Reveal'
import SectionHeader from '@/components/playful/SectionHeader'
import { StickerSparkle } from '@/components/playful/Stickers'
import { LANDING_COPY } from '@/lib/landing/copy'
import { TESTIMONIALS } from '@/lib/landing/testimonial'

export default function TestimonialSection() {
  const { testimonial } = LANDING_COPY
  const item = TESTIMONIALS[0]
  if (!item) return null
  return (
    <section className="relative bg-ink-800 py-24 md:py-32">
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.055)_1px,transparent_1px)] bg-[size:24px_24px]"
      />
      <StickerSparkle twinkle className="absolute top-10 right-[14%] hidden w-5 md:block" />
      <div className="relative mx-auto max-w-3xl px-6">
        <SectionHeader dark eyebrow={testimonial.eyebrow} title={testimonial.title} />
        <Reveal className="mt-10">
          <figure className="rounded-[28px] border-2 border-ink-900 bg-paper-paper px-8 py-10 text-center shadow-[0_8px_0_#07111F] md:px-14">
            <div className="flex justify-center gap-1 text-[#F2A900]" aria-label="Rating 5 dari 5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-5 fill-current" />
              ))}
            </div>
            <blockquote className="mt-5 text-xl leading-relaxed font-medium text-balance text-ink-900">
              “{item.quote}”
            </blockquote>
            <figcaption className="mt-6">
              <p className="font-display text-lg font-bold text-ink-900">{item.name}</p>
              <p className="text-sm text-ink-500">{item.role}</p>
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Verify + commit**

Run: `npm run build && npm run lint`
Expected: green.

```bash
git add frontend/src/components/landing/GallerySection.tsx frontend/src/components/landing/TestimonialSection.tsx
git commit -m "feat(landing): add gallery (progressive horizontal) and testimonial"
```

---

### Task 20: FinalCTA + SplashScreen + full Home composition

**Files:**
- Create: `src/components/landing/FinalCTASection.tsx`, `src/components/playful/SplashScreen.tsx`
- Modify: `src/pages/landing/Home.tsx` (full rewrite, zero hooks)
- Delete: `src/components/home/Hero.tsx`, `src/components/home/Feature.tsx`, `src/components/home/Benefit.tsx`, `src/components/home/Community.tsx` + orphaned hooks (verified below)
- Test: n/a

**Interfaces:**
- Consumes: everything from Tasks 11-19, `CONTACTS`, `LANDING_COPY.finalCta` + `ticker`, `StickerStar` + `StickerSquiggle` (2 usages), `DoodleDivider` (3 usages), `Footprints` (1 usage), `TickerTape`
- Produces: the complete maximal landing page. Anchor `kontak`. Final order: Splash → Navbar → Hero → Ticker → divider → Stack → Mentors → Footprints → Course → Terminal → Story → divider → HowItWorks → Gallery → Testimonial → divider → FinalCTA → Footer + grain.

- [ ] **Step 1: Create FinalCTASection.tsx (CTA + Get in Touch + 2 stickers)**

```tsx
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import DoodleArrow from '@/components/playful/DoodleArrow'
import Reveal from '@/components/playful/Reveal'
import { StickerSquiggle, StickerStar } from '@/components/playful/Stickers'
import { Button } from '@/components/ui/button'
import { CONTACTS } from '@/lib/landing/contact'
import { LANDING_COPY } from '@/lib/landing/copy'

export default function FinalCTASection() {
  const { finalCta } = LANDING_COPY
  return (
    <section id="kontak" className="relative overflow-hidden bg-paper-white py-24 md:py-32">
      <StickerStar className="absolute top-14 left-[7%] hidden w-8 lg:block" />
      <StickerSquiggle className="absolute right-[6%] bottom-16 hidden w-28 lg:block" />
      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <Reveal>
          <h2 className="font-display text-5xl leading-[0.95] font-bold text-balance text-ink-900 md:text-6xl">
            {finalCta.title}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-ink-600">{finalCta.copy}</p>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="h-14 px-8 text-base">
              <Link to={finalCta.primaryCta.href}>
                {finalCta.primaryCta.label}
                <ArrowRight className="size-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 px-8 text-base">
              <Link to={finalCta.secondaryCta.href}>{finalCta.secondaryCta.label}</Link>
            </Button>
          </div>
        </Reveal>
        <Reveal delay={0.18}>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            {CONTACTS.map((contact) => {
              const Icon = contact.icon
              return (
                <a
                  key={contact.label}
                  href={contact.href}
                  target={contact.href.startsWith('http') ? '_blank' : undefined}
                  rel={contact.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="flex items-center gap-2 rounded-full border-2 border-ink-900 bg-paper-white px-5 py-2.5 text-sm font-extrabold text-ink-900 shadow-button transition-all hover:-translate-y-0.5 hover:bg-note-yellow hover:shadow-button-hover"
                >
                  <Icon className="size-4" />
                  {contact.label}
                </a>
              )
            })}
          </div>
        </Reveal>
      </div>
      <DoodleArrow variant="loop" className="absolute top-16 left-[8%] hidden w-24 -rotate-12 lg:block" />
    </section>
  )
}
```

- [ ] **Step 2: Create SplashScreen.tsx (once per session, ≤1200ms, click-skip, absent on reduced-motion)**

```tsx
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useCallback, useEffect, useState } from 'react'
import PenguinMascot from '@/components/playful/PenguinMascot'

const SPLASH_KEY = 'du-splash-seen'
const SPLASH_MAX_MS = 1200

function shouldShow(): boolean {
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
    return sessionStorage.getItem(SPLASH_KEY) === null
  } catch {
    return false
  }
}

function markSeen(): void {
  try {
    sessionStorage.setItem(SPLASH_KEY, '1')
  } catch {
    /* private mode: splash simply shows once per mount */
  }
}

export default function SplashScreen() {
  const reduceMotion = useReducedMotion()
  const [visible, setVisible] = useState<boolean>(() => !reduceMotion && shouldShow())

  const dismiss = useCallback((): void => {
    setVisible(false)
    document.body.style.overflow = ''
    markSeen()
  }, [])

  useEffect(() => {
    if (!visible) return
    document.body.style.overflow = 'hidden'
    const timer = window.setTimeout(dismiss, SPLASH_MAX_MS)
    window.addEventListener('load', dismiss)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('load', dismiss)
      document.body.style.overflow = ''
    }
  }, [visible, dismiss])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] flex cursor-pointer flex-col items-center justify-center gap-4 bg-paper-white"
          exit={{ opacity: 0, y: -24 }}
          transition={{ duration: 0.3 }}
          onClick={dismiss}
          role="status"
          aria-label="Memuat Doscom University"
        >
          <PenguinMascot className="w-24" />
          <p className="font-display text-4xl font-bold text-ink-900">DOSCOM</p>
          <div className="h-2 w-44 overflow-hidden rounded-full border-2 border-ink-900">
            <div className="h-full origin-left animate-[splash-bar_1s_ease-out_forwards] bg-brand-blue" />
          </div>
          <p className="text-xs font-bold text-ink-500">menyiapkan kertas dan tinta…</p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

- [ ] **Step 3: Rewrite Home.tsx (full maximal composition)**

```tsx
import CourseSection from '@/components/landing/CourseSection'
import FinalCTASection from '@/components/landing/FinalCTASection'
import GallerySection from '@/components/landing/GallerySection'
import Hero from '@/components/landing/Hero'
import HowItWorksSection from '@/components/landing/HowItWorksSection'
import MentorsSection from '@/components/landing/MentorsSection'
import StackSection from '@/components/landing/StackSection'
import StorySection from '@/components/landing/StorySection'
import TerminalSection from '@/components/landing/TerminalSection'
import TestimonialSection from '@/components/landing/TestimonialSection'
import GuestLayout from '@/components/layouts/GuestLayouts'
import DoodleDivider from '@/components/playful/DoodleDivider'
import Footprints from '@/components/playful/Footprints'
import SplashScreen from '@/components/playful/SplashScreen'
import TickerTape from '@/components/playful/TickerTape'
import { LANDING_COPY } from '@/lib/landing/copy'

export default function Home() {
  return (
    <GuestLayout>
      <SplashScreen />
      <main className="w-full bg-paper-white">
        <Hero />
        <TickerTape items={[...LANDING_COPY.ticker]} />
        <div className="bg-ink-800 pt-6">
          <DoodleDivider className="text-note-yellow" />
        </div>
        <StackSection />
        <MentorsSection />
        <div className="bg-paper-white py-6">
          <Footprints />
        </div>
        <CourseSection />
        <TerminalSection />
        <StorySection />
        <div className="bg-ink-900 pt-6">
          <DoodleDivider className="text-paper-white/30" />
        </div>
        <HowItWorksSection />
        <GallerySection />
        <TestimonialSection />
        <div className="bg-paper-white pt-6">
          <DoodleDivider className="text-ink-800" />
        </div>
        <FinalCTASection />
      </main>
      <div aria-hidden className="grain-overlay" />
    </GuestLayout>
  )
}
```
Note: `[...LANDING_COPY.ticker]` spreads the readonly tuple into a mutable `string[]` for the `items: string[]` prop.

- [ ] **Step 4: Delete legacy home sections + orphaned hooks + verify + commit**

Run: `rg -l 'components/home/' src` — expected: no imports remain. Then:
```bash
git rm -q frontend/src/components/home/Hero.tsx frontend/src/components/home/Feature.tsx frontend/src/components/home/Benefit.tsx frontend/src/components/home/Community.tsx
```
Run: `rg -l 'useFeaturedCourses|useLandingCommunityStats' frontend/src || true` — expected: no importers (landing no longer uses them; Course page uses `useCombinedCourseCategoriesAndTypes`, not these). If empty, delete:
```bash
git rm -q frontend/src/hooks/landing/use-featured-courses.ts frontend/src/hooks/landing/use-landing-community-stats.ts
```
(If either file still has importers, keep it and note the exception in the commit message instead of deleting.)
Run: `npm run build && npm run lint`
Expected: green. Visual: full page top-to-bottom on desktop + 360px wide; splash shows once, click skips; marquee runs; dividers/footprints/grain visible; story + terminal functional.

```bash
git add frontend/src/components/landing/FinalCTASection.tsx frontend/src/components/playful/SplashScreen.tsx frontend/src/pages/landing/Home.tsx
git commit -m "feat(landing): compose maximal static homepage, remove legacy sections"
```

---

### Task 21: index.html (lang, title, meta)

**Files:**
- Modify: `frontend/index.html`
- Test: n/a

**Interfaces:**
- Consumes: nothing. Produces: correct document metadata.

- [ ] **Step 1: Apply exact edits**

`<html lang="en">` → `<html lang="id">`.
`<title>frontend-react</title>` → `<title>Doscom University — Belajar Bareng, Pulang Bawa Portofolio</title>`.
After the viewport meta, insert:
```html
    <meta name="description" content="Doscom University — komunitas open source Udinus. Belajar bareng mentor praktisi lewat sprint dan proyek nyata." />
    <meta name="theme-color" content="#FBFCFD" />
```

- [ ] **Step 2: Verify + commit**

Run: `npm run build`
Expected: green.

```bash
git add frontend/index.html
git commit -m "feat(landing): set Indonesian metadata and title"
```

---

### Task 22: Global regression pass (dashboards, auth, course)

**Files:**
- Modify: only files where token re-point visibly breaks contrast/readability (unforeseen; list them in the commit)
- Test: n/a

**Interfaces:**
- Consumes: all previous tasks. Produces: a uniformly readable app.

- [ ] **Step 1: Serve and walk the route matrix (dev, logged out + each role)**

Routes: `/`, `/course`, `/course/:uid` (pick one active uid from dev data), `/auth/login`, `/auth/register`, `/student/dashboard`, `/student/browse`, `/mentor/dashboard`, `/mentor/courses`, `/admin/dashboard`, `/admin/courses`, `/profile`, 404 route. For each: confirm no unreadable text (esp. white-on-electric-blue small text, muted text on panel), no invisible borders, charts legible, TipTap toolbar usable.

- [ ] **Step 2: Fix only what the walk proves broken**

Allowed fixes: swap a hardcoded `text-white`/`bg-*` class to the matching ink/paper token class, or adjust a single component class. Forbidden: redesigning dashboard layouts, touching business logic, re-adding dark mode. Keep each fix to the smallest class change that restores contrast.

- [ ] **Step 3: Verify + commit**

Run: `npm run build && npm run lint`
Expected: green.

```bash
git add -A frontend/src
git commit -m "fix(ui): contrast follow-ups from global token re-point"
```
(Inspect `git status` before committing — only regression fixes may be included.)

---

### Task 23: Acceptance gates (motion, a11y, static, anti-slop, maximal)

**Files:**
- Modify: only files proven broken by a gate below
- Test: n/a

**Interfaces:**
- Consumes: everything. Produces: shippable state per spec §15.

- [ ] **Step 1: Reduced-motion gate**

OS/browser: enable prefers-reduced-motion. Reload `/`. Expected: zero floating/wiggling/drifting/bobbing/twinkle/marquee (static), zero drag, terminal + story output instant, HowItWorks static, splash absent, scroll 1:1 (Lenis auto), all content immediately visible. Fix any element still animating.

- [ ] **Step 2: Keyboard + touch gate (incl. terminal, story, egg, splash)**

Tab through `/` top-to-bottom: every CTA, link, contact pill, terminal chip, terminal input, story choice, penguin button, mobile-menu button reachable with visible focus; mobile menu opens/closes via keyboard. In terminal: type `help` + Enter, ArrowUp recalls, click each chip, submit empty (nothing), type `sudo please` (joke). In story: walk all three endings from start, restart resets, trail chips accumulate. Penguin: focus + Enter counts toward the 5 (spin + bubble, `role="status"` announced). Splash: appears on first load of session, click skips, absent on repeat navigation. On 360px: no horizontal scroll, decor hidden, terminal chips wrap, CTAs stack. Fix violations.

- [ ] **Step 3: Static + anti-slop + hygiene gates (commands must print empty)**

Run: `rg -n "from '@/hooks|from '@/services" frontend/src/components/landing frontend/src/components/playful frontend/src/lib/landing || true`
Expected: no output (landing layer is fully static).
Run: `rg -in 'jelajahi dunia|unlock|cutting-edge|cutting edge|revolution|delve|vibrant|seamless|elevate|supercharge|gateway|game-changer|dunia digital tanpa batas|membuka potensi|luar biasa|terbaik|terdepan|inovatif|Lorem' frontend/src/components/landing frontend/src/lib/landing || true`
Expected: no output (ban-list clean — note `terbaik`/`luar biasa` hit common words, so rephrase any legitimate use first; the gate is intentionally strict).
Run: `rg -n 'dark:|next-themes|poppins|lottie|picsum|unsplash' frontend/src/components/landing frontend/src/components/playful frontend/src/lib/landing || true`
Expected: no output (landing layer is Lottie/dark/Poppins/stock-free).
Run: `rg -n 'from "framer-motion"' frontend/src || true`
Expected: no output (only `motion/react` imports).
Eyeball icon budget (spec §9.3): count lucide imports in new landing files — expected: Hero 1, Stack 7, CourseSection 1, StorySection 1, Gallery 1, Testimonial 1 (stars), FinalCTA 1 + 5 contact glyphs, all others 0. Illustration components (Stickers/Divider/Footprints/Penguin/Ticker) must contain zero lucide imports. Remove any decorative extra.

- [ ] **Step 4: Maximal gates (splash, marquee, horizontal, draw, egg, story)**

Splash: fresh profile → splash ≤1200ms, click skips instantly, `sessionStorage` set, second visit none, content interactive immediately after.
Marquee: second half has `aria-hidden`, pauses on hover, static under reduced-motion.
Draw: hero underline draws once on load (pathLength), static under reduced-motion.
Egg: exactly 5 activations → spin + bubble; bubble disappears; repeatable; keyboard-operable.
Parallax: mousemove shifts decor layers differentially (fine pointer); touch/static otherwise.
Horizontal gallery: with zero photos → grid empty-state (current). Temporary check: copy 3 local images to `public/gallery-test/`, point `GALLERY_IMAGES` at them, verify desktop pin + horizontal scrub + mobile grid, then revert both. Never commit test images or picsum URLs.
Story: all 3 endings reachable, restart works, recap chips correct, no dead-end node (every non-ending node has ≥1 choice — verify by reading `story.ts`).

- [ ] **Step 5: Perf gate + conditional commit**

Run: `npm run build && ls -lh dist/assets/*.js | sort -k5 -h | tail -5`
Expected: build green; note the largest chunk (informational — motion+gsap weight was accepted in spec §10).
If any gate required fixes:
```bash
git add -A frontend/src
git commit -m "fix(a11y): acceptance-gate follow-ups for playful landing"
```
Otherwise record pass in the review reply (no empty commit).

---

## Self-review

**1. Spec coverage:** §4 tokens→T2/T3; §5 fonts→T2/T3/T21; §6 color discipline→T5-T7/T13-T20 class choices; §7 inventory→every file in File structure has an owning task (incl. TickerTape/DoodleDivider/Stickers/Footprints/SplashScreen/StorySection/story.ts); §8 lineup/order/anchors/ids→T9/T13-T20 (ticker + `#cerita` + dividers + footprints + grain + splash placement in T20); §9 copy/ban-list/budget/terminal-voice/story-naskah/splash-ticker→T11/T16/T17 + T23 Step 3 gates; §10 motion arch→T3 (keyframes/grain)/T5 (draw/marquee/twinkle)/T6/T8/T13 (parallax/egg)/T16/T17/T18/T19 (pins) + T23 Steps 1-2/4; §11 responsive→T13-T20 classes + T23 Step 2; §12 deviations→T4 note (Lottie stays), T3 (radius/mono kept); §13 migration→T4/T20/T22; §14 content debts→T11 flagged files + T20 hook deletion; §15 checklist→T23. No orphan requirement.

**2. Placeholder scan:** no TBD/TODO/"similar to"/unshown code — every code step carries its block; mechanical steps (T4) carry enumerate + rule + verify commands; the T16 `eslint-disable` from the earlier draft is GONE (replaced by `useCallback` deps); hook-file deletion in T20 is conditional on a verification command with the keep-and-note fallback; the temporary gallery-photo check in T23 Step 4 includes explicit revert.

**3. Type consistency:** `LandingMentor`/`StaticCourse`/`TerminalLine`/`TerminalCommandDef`/`StoryNode`/`StoryChoice`/`StoryEnding` shapes identical at definition (T11) and use sites (T12/T14/T15/T16/T17); `LANDING_COPY` shape consumed verbatim by T13-T20 (incl. `ticker` by T20, `story` header by T17, `terminal` by T16); component prop names identical at definition and use (`draw`, `twinkle`, `flip` defaulted); `CONTACTS`/`GALLERY_IMAGES`/`TESTIMONIALS` shapes match render code; `Reveal` imported by `SectionHeader` created in the preceding task as instructed; `useInView` margin strings typed; `AnimatePresence mode="wait"` single keyed child.
