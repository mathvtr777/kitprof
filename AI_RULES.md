# AI Rules

## Tech stack
- Static, multi-asset website built with semantic HTML in `index.html`.
- CSS3 styles live in `css/styles.css`; use responsive CSS and the existing custom properties and component naming conventions.
- Vanilla browser JavaScript is used for interactivity; site scripts live in `js/` and are loaded directly from the HTML.
- No frontend framework, TypeScript compiler, package manifest, or bundler is currently part of this app.
- Images and icons are local assets in `images/`; responsive image variants use `<picture>` and WebP where available.
- Google Fonts are loaded via the existing stylesheet link; the page currently uses Inter, Fraunces, Cormorant Garamond, and Space Mono.
- The site is in Brazilian Portuguese (`pt-BR`); maintain that language for user-facing content.
- External tracking scripts are integrated in `index.html` and `js/`; preserve their existing attribution and loading behavior unless explicitly asked to change them.

## Library and implementation rules
- Use native HTML, CSS, and browser JavaScript for page structure, styling, and behavior. Do not introduce React, React Router, TypeScript, Tailwind, or shadcn/ui unless the user explicitly requests a migration to that stack.
- Avoid adding dependencies or a build system for features that can be implemented with the existing browser APIs and codebase.
- Use CSS for layout, responsive behavior, animations, and visual states; keep styles in `css/styles.css` rather than adding new inline styles.
- Use semantic HTML elements and native controls. Prefer built-in browser APIs over utility libraries for simple interactions.
- Use inline SVG for small decorative/interface icons, following the existing markup style; use image assets for substantial visual content.
- Load fonts only through the existing Google Fonts integration; use system font stacks as a resilient fallback.
- Keep JavaScript in focused files under `js/`, and load them from `index.html` with the existing async/defer conventions when appropriate.
- Reuse and optimize existing assets before adding new libraries or duplicating media; provide descriptive `alt` text for meaningful images.
- Preserve accessibility, performance, responsive behavior, and existing SEO/social metadata when modifying the page.
