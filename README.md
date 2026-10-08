# Monotion Studio

Monotion Studio is a web-based character animation editor. Pick a character, choose a mood, adjust the character and background colors, then export the animation as GIF, SVG, or WebM.

## Features

- Multiple characters to choose from
- Mood selection for each character (animated expressions and movements)
- Character color and background color pickers, each with a reset button
- Transparent background option
- Shape presets on supported characters
- Animation player with play/pause, loop, and playback speed (0.5x to 2x)
- Undo and redo (Ctrl+Z, Ctrl+Y or Cmd+Shift+Z)
- Light and dark mode
- Export to GIF, SVG, and WebM

## Tech stack

- Next.js 16.3.7 (App Router) with React 19.2.8
- JavaScript (no TypeScript)
- Tailwind CSS 4
- HeroUI 3.2.6 (`@heroui/react`, `@heroui/styles`)
- framer-motion for animation
- gif.js, html-to-image, and webm-muxer for export
- lucide-react for icons

## Getting started

Requirements: Node.js 20.9 or newer, and npm.

```bash
git clone https://github.com/herdinnoer/monotion-studio.git
cd monotion-studio
npm install
npm run dev
```

Open http://localhost:3000. The home page redirects to the editor at `/editor`.

`npm install` also copies `gif.worker.js` into `public/`. GIF export needs that file.

## Project structure

```
src/
  app/            Routes. The editor lives in app/editor/page.jsx
  components/
    Characters/   Character components and their moods
    Editor/       Editor panels: top bar, sidebars, workspace, player, export modal
    UI/           Shared UI pieces
  data/           Character list and templates (JSON)
  hooks/          React hooks
  lib/            Export logic and helpers
public/           Static files (logo, gif.worker.js)
```

## Status

In active development, working toward the first release.
