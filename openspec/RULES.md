# RULES

Rules for the agent. They apply throughout the entire development process. Project type: educational.

## 1. Project

A mini-site with an interactive step-by-step visualization of a simplified DBSCAN algorithm and a large number of smooth animations. Two pages: "Visualization" and "Theory". The site is static; all code runs in the browser.

## 2. Tech Stack

- Build tool: Vite
- Language: TypeScript (strict)
- UI: React
- Routing: react-router, HashRouter (hosting-independent)
- Styling: Tailwind CSS, themes via CSS variables
- UI animations: Motion (`motion` package)
- Visualization animations: Canvas 2D + requestAnimationFrame, custom interpolation functions
- Localization: i18next + react-i18next (ru, en)
- Code highlighting: prism-react-renderer
- Fonts: `@fontsource` packages (Nunito, Roboto Mono), self-hosted
- Package manager: npm
- No backend. Network requests to external APIs are forbidden.
- Tests, linter, and formatter are not used.
- Add new dependencies only after approval from the user.

## 3. Project Structure

```
src/
  app/            app root, router, providers
  pages/          VisualizationPage, TheoryPage
  components/     reusable UI components
  features/
    dbscan/       algorithm, step frame generation, seeded PRNG, types
    canvas/       Canvas rendering, zoom/pan, drawing tools, animations
  data/           prepared scenario datasets, code templates
  i18n/           config and dictionaries ru.json, en.json
  styles/         global styles, theme variables
  hooks/          custom hooks
openspec/
  RULES.md
  specs/
```

## 4. Code Rules

- All components are functional and typed. `any` is forbidden.
- The algorithm core is a pure TS module with no dependencies on React or Canvas. It takes points, R, minPts, and a seed, and returns a sequence of step frames. The UI only plays these frames back.
- Randomness in the algorithm uses a seeded PRNG implemented in the project (no external dependency), so that the same seed reproduces the same frames.
- Algorithm logic, rendering, and UI are separated into layers and are not mixed in a single file.
- No hardcoded user-facing strings: all text goes through i18n keys, and both locales are filled in simultaneously.
- No hardcoded colors in components: only theme tokens from CSS variables.
- Constants (point limit, R range, minPts range) live in a single constants module.
- Comments only where the logic is non-obvious.
- Files are small, one responsibility per file.

## 5. Canvas Rules

- Account for devicePixelRatio; the canvas scales correctly on resize and orientation change.
- One requestAnimationFrame loop per canvas, stopped when there is no animation.
- Mouse and touch are supported (pointer events), including wheel zoom and pinch zoom.
- Point colors are taken from the current theme's tokens and updated when the theme changes.

## 6. Animations

- Allowed: animated transitions between algorithm steps; smooth appearance of blocks on scroll; animations of the visualization itself.
- Forbidden: micro-interactions (scale-on-hover, button pulsing, and the like).
- Animations are smooth, without jerks; animate only transform and opacity where possible.
- Respect `prefers-reduced-motion`: animations are simplified when it is enabled.

## 7. Responsiveness and Themes

- Mobile-first, full support for both mobile and desktop.
- Two themes: light and dark. The initial theme is taken from system settings; the user's choice is saved in localStorage.
- Language: ru and en; the user's choice is saved in localStorage.

## 8. Working with Specs

- The source of truth is the files in `openspec/specs/`. Before any task, read the relevant specs.
- Spec set: `PRODUCT.md`, `DESIGN.md`, `FUNCTIONALITY.md`.
- Do not invent requirements. If the specs do not provide an answer, ask the user.
- If a spec conflicts with the user's request, follow the request, report the conflict, and then suggest updating the spec.
- Changes to behavior, design, or stack are accompanied by an update to the corresponding spec in the same task.
- Specs are clean documents: no questions, reasoning, or draft notes inside.
- Specs do not contain coordinates of the prepared scenario datasets. Creating those datasets is a separate task.

## 9. Workflow

- Work in small steps; each step ends with the project in a working state.
- For every task, create a note in `openspec/tasks/` before implementation. The filename format is `T[day]-[taskNumber]-[description].md`: `[day]` is the day of the month, `[taskNumber]` is the task's sequential number for that day, and `[description]` is a concise description of up to five words.
- Each task note must contain a detailed work plan describing how the agent will solve the task, a todo list, and a final report. Update todo statuses as work progresses and fill in the final report before finishing the task.
- Before major changes, briefly describe the plan and wait for confirmation.
- Do not add functionality that is not described in the specs.
- Do not refactor code outside the scope of the current task.
- Verification is done with `npm run build` (tsc + vite build). Do not start a background dev server and poll it with curl/Invoke-WebRequest to smoke-test pages: spawning servers in the background hangs the session. Check the code statically and rely on the production build.
- Keep responses brief and to the point.
