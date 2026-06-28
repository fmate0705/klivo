---
name: lenis
description: This skill should be used when the user wants to add smooth scrolling to a web app, mentions "Lenis", "smooth scroll", "momentum scrolling", "inertia scroll", "scroll-based animation sync", or asks to make scrolling feel buttery/premium, or to synchronize scroll-driven animations (GSAP ScrollTrigger, Framer Motion scroll) with a smooth-scroll engine. Covers Lenis v1 setup for vanilla JS, React, and Next.js (App Router), GSAP ScrollTrigger integration, anchor-link handling, and accessibility (prefers-reduced-motion).
---

# Lenis — Smooth Scroll

[Lenis](https://lenis.dev) (by darkroom.engineering) is a lightweight (~2KB), accessible smooth-scroll library. It hijacks the native scroll to add momentum/easing while keeping real scroll position, so `position: sticky`, `IntersectionObserver`, and accessibility mostly keep working. Use it to make scrolling feel premium and to drive scroll-linked animations smoothly.

## When to use
- Marketing/landing/portfolio sites that want polished momentum scrolling.
- Any project syncing scroll-driven animation (GSAP ScrollTrigger, scroll progress) to a smooth virtual scroll.
- NOT for app-like dashboards, content-heavy docs, or anywhere users expect instant native scroll — smooth scroll can hurt UX and a11y there. Always respect `prefers-reduced-motion`.

## Install
```bash
npm i lenis
```

## Vanilla JS
```js
import Lenis from 'lenis'

const lenis = new Lenis({
  duration: 1.2,            // bigger = slower glide
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // default expo-out
  smoothWheel: true,
})

function raf(time) {
  lenis.raf(time)
  requestAnimationFrame(raf)
}
requestAnimationFrame(raf)
```
Import the stylesheet once (needed for correct behavior): `import 'lenis/dist/lenis.css'` (or add the recommended CSS — `html.lenis, html.lenis body { height: auto } .lenis.lenis-smooth { scroll-behavior: auto !important }`).

## React / Next.js (App Router) — preferred
Use the official React bindings. Wrap the app in a Client Component so `ReactLenis` runs its own RAF loop.

```tsx
// components/smooth-scroll.tsx
'use client'
import { ReactLenis } from 'lenis/react'

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis root options={{ duration: 1.2, smoothWheel: true }}>
      {children}
    </ReactLenis>
  )
}
```
```tsx
// app/layout.tsx
import SmoothScroll from '@/components/smooth-scroll'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body><SmoothScroll>{children}</SmoothScroll></body>
    </html>
  )
}
```
- `root` makes Lenis control the `<html>`/`<body>` scroll (what you want for a full page).
- `ReactLenis` runs the RAF loop for you — do **not** also add a manual `requestAnimationFrame(lenis.raf)` loop, or you'll double-drive it.
- Read scroll inside descendants with `useLenis`:
  ```tsx
  'use client'
  import { useLenis } from 'lenis/react'
  useLenis(({ scroll, progress }) => { /* runs each frame */ })
  ```

## GSAP ScrollTrigger sync (critical pattern)
When using GSAP ScrollTrigger, drive ScrollTrigger from Lenis and feed GSAP's ticker into `lenis.raf` (and disable lag smoothing) so they stay in lockstep:
```js
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((time) => lenis.raf(time * 1000)) // GSAP ticker is in seconds
gsap.ticker.lagSmoothing(0)
```
With `ReactLenis`, pass `options={{ autoRaf: false }}` and drive `raf` from GSAP's ticker instead (grab the instance via `useLenis()` / ref) so there is exactly one RAF source.

## Anchor links / programmatic scroll
```js
lenis.scrollTo('#section', { offset: -80, duration: 1.5 })
lenis.scrollTo(0, { immediate: true }) // jump to top, no animation
```
For `<a href="#id">` to work, let Lenis handle it (it intercepts same-page anchors by default) or call `scrollTo` in an onClick.

## Accessibility — required
Respect reduced-motion. Disable smoothing (or skip Lenis entirely) when the user opts out:
```js
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const lenis = new Lenis({ smoothWheel: !reduce, duration: reduce ? 0 : 1.2 })
```
With `ReactLenis`, conditionally render plain children when `reduce` is true.

## Common pitfalls
- **Stuck/short page height**: ensure the Lenis CSS is loaded and no parent has `overflow: hidden`/fixed height clipping the scroll.
- **Two RAF loops**: never run a manual `raf` loop *and* `ReactLenis`/`autoRaf` together — pick one.
- **ScrollTrigger drift**: you forgot `lenis.on('scroll', ScrollTrigger.update)` or `lagSmoothing(0)`.
- **Nested scroll areas**: use a non-`root` `<ReactLenis>` (or `new Lenis({ wrapper, content })`) for an inner scroll container, and add `data-lenis-prevent` to elements that must scroll natively (e.g. modals, code blocks).
- **SSR (Next.js)**: keep Lenis in a `'use client'` component; never instantiate during render on the server.
