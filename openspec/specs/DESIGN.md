# DESIGN

Design specification for the "Visualization" page. The "Theory" page is out of scope of this document.

## 1. Visual Language

- Minimalist, modern, flat vector style.
- Thin outlines (1px), moderate corner radius, no heavy shadows.
- No raster images. Graphics are SVG or Canvas only.
- Fills are solid except for the subtle page-background gradient defined in section 4.
- Pastel palette with blue as the base hue, no dominant accent.
- References: 2026.hackjunction.com, Google Developer Community, Ollama, Claude.

## 2. Design Tokens

All colors, radii, and spacing are defined as CSS variables and switched between light and dark themes. Components never use raw values.

### 2.1. Colors

| Token | Light | Dark |
|---|---|---|
| `--bg` | `#F6F8FC` | `#0F1420` |
| `--bg-gradient` | `linear-gradient(135deg, #F6F8FC 0%, #E9ECF2 52%, #F6F8FC 100%)` | `linear-gradient(135deg, #0F1420 0%, #171D2C 52%, #0F1420 100%)` |
| `--surface` | `#FFFFFF` | `#151B2B` |
| `--line` | `#D6DDEA` | `#2A3349` |
| `--grid` | `rgba(80, 110, 170, 0.08)` | `rgba(140, 170, 230, 0.07)` |
| `--text` | `#1F2937` | `#E6EAF2` |
| `--text-muted` | `#6B7280` | `#8B94A7` |
| `--pulse` | `#FFFFFF` | `#FFFFFF` |
| `--primary` | `#6C9BF5` | `#8DB3FF` |
| `--primary-soft` | `rgba(108, 155, 245, 0.14)` | `rgba(141, 179, 255, 0.16)` |
| `--noise-1` | `#2B2F36` | `#42464D` |
| `--noise-2` | `#3A3F47` | `#4F545D` |
| `--noise-3` | `#4A5059` | `#5D636D` |
| `--noise-4` | `#5A626D` | `#6B727D` |
| `--noise-5` | `#6B7480` | `#79818D` |

### 2.2. Cluster Palette

Used for cluster coloring on the Canvas. Colors are assigned in this order, in the order clusters are created, and repeat cyclically when there are more clusters than colors.

| # | Name | Light | Dark |
|---|---|---|---|
| 1 | Red | `#EF7C7C` | `#F28B8B` |
| 2 | Blue | `#6C9BF5` | `#8DB3FF` |
| 3 | Green | `#6FCB9F` | `#7FD8AE` |
| 4 | Gold | `#E8B84A` | `#F0C560` |
| 5 | Violet | `#A88BEB` | `#B8A0F2` |
| 6 | Gray | `#9AA3B2` | `#A9B1BF` |

Points not yet assigned to a cluster use `--text-muted` (gray). Noise points use varied grayscale tones from `--noise-1` through `--noise-5`, assigned consistently per point.

### 2.3. Shape and Spacing

- Border width: 1px, color `--line`.
- Corner radius: 12px for blocks and cards, 8px for buttons and inputs.
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64 px.
- Content max width: 1200px, centered. Horizontal padding: 24px on desktop, 16px on mobile.
- Gap between blocks: 24px on desktop, 16px on mobile.

## 3. Typography

- UI and text font: Nunito (rounded terminals, no sharp parts, Cyrillic and Latin support).
- Code font: Roboto Mono.
- Fonts are self-hosted via `@fontsource` packages; no external font requests.
- Sizes: page-level labels 20-24px, block titles 18-20px, body 15-16px, code 13-14px.
- Weights: 400 body, 600 titles and buttons.
- Line height: 1.5 for text, 1.6 for code.

## 4. Background

- The page background uses the subtle, theme-specific `--bg-gradient`; it is a near-grayscale gradient tonally consistent with `--bg` and `--surface` (very low saturation, just enough tonal variation to read as a gradient rather than a flat fill), not a flat fill or grid.
- `--grid` is reserved for the Canvas panel only, where it marks Canvas units as described in section 5.3. It is not used on the page background, Code block, Plots cards, Steps panel, or footer.
- Blocks use `--surface` with a 1px `--line` border.

## 5. Page Layout (Desktop)

Vertical order of the page:

1. Header
2. Page switcher
3. Visualization block (Canvas panel + Steps panel)
4. Code block
5. Plots block
6. Footer

### 5.1. Header

- Not fixed: it scrolls away with the page.
- Left: the site title `DB SCAN` as a semantic `<h1>`, Nunito 600, 24-28px. The `#` character is not part of the title text.
- Right: language switch (`Ru` / `En`) and theme toggle (sun icon in light theme, moon icon in dark theme).
- Language switch is a compact text button; the theme toggle is an icon button. Both use a 1px outline and 8px radius.
- Icons are thin-line SVG.

### 5.2. Page Switcher

- A compact two-position vertical toggle with two labeled options: "Визуализация" (top) and "Теория" (bottom), stacked with a small arrow or connector between them indicating they are linked.
- The toggle is centered horizontally below the header (not full width) and occupies its own row without overlapping header controls.
- Selecting an option switches the entire page content to show only that page (Visualization or Theory): a full content swap, not an expand/collapse of both. There is no accordion or expand behavior.
- The selected option is visually marked as active (`--primary` text/border); the inactive one is muted (`--text-muted`). Clicking the inactive option switches to it.

### 5.3. Visualization Block

Two columns in a single row:

- Left (about 2/3 width): Canvas panel.
- Right (about 1/3 width): Steps panel.

Both are blocks with the standard border and radius, equal height.

#### Canvas Panel

- The panel contains the Canvas with a control row on top. No panel title is displayed.
- Control row: two sliders, `R` and `minPts`, left-aligned against the panel's left edge as one control row (both parameter groups). Each slider has a label, the current value displayed next to it, a "?" icon button, and an outlined reset button (`Reset` / `Сбросить`) that restores that parameter to the selected scenario's optimal value. Reset buttons use a thin outline, 8px radius, and no hover micro-interactions.
- The "?" icon opens a small popover with a short explanation. Text (EN): "R is the radius within which points are considered neighbors. minPts is the minimum number of points nearby that counts as a cluster." Text (RU): "R — радиус, в пределах которого точки считаются соседями. minPts — минимальное количество точек рядом, которое считается кластером."
- The popover is a bordered `--surface` block with 8px radius, appears with a fade and slide animation, and closes on outside click or on a second click of the icon.
- The Canvas fills the panel. Aspect ratio: 4:3 on desktop.
- Canvas background is `--surface` with a grid whose cell size equals 1 unit of R, drawn with `--grid`. The grid scales together with the Canvas zoom.
- In the "Create" scenario, an outlined "Clear canvas" button (`Очистить холст`) appears alongside the Draw and Erase buttons. It uses a thin outline, 8px radius, and no hover micro-interactions.
- Points are filled circles; their color is taken from the cluster palette, `--text-muted` for unassigned points, or `--noise` for noise points.
- The R radius around the currently processed point is drawn as a thin circle outline in `--primary` with no fill.
- The cursor is a grab cursor in pan mode and a crosshair in drawing mode.

#### Drawing Tools

- Visible only when the "Create" scenario is selected.
- Draw and Erase icon buttons, plus the "Clear canvas" button, are in the bottom right corner of the Canvas, over the Canvas.
- The Draw and Erase buttons appear with a fade and slide-up animation and disappear the same way when another scenario is selected.
- The active tool is marked with `--primary-soft` fill and `--primary` outline.
- When a tool is active, pointer input draws or erases. When no tool is active, pointer input pans the Canvas.
- "Clear canvas" removes every point and resets the algorithm to step 0.

#### Error Notification

- A toast notification is shown over the top of the Canvas, for example when the point limit is reached.
- It is a bordered `--surface` block with 8px radius and a red (`Red` cluster palette color) outline, with the message text.
- It appears with a fade and slide-down animation and disappears automatically after about 3 seconds.

#### Steps Panel

- Top: a primary button. Label "Start" (RU: "Начать") before the first step; after the first press its label becomes "Next" (RU: "Далее").
- Primary button: `--primary` fill, white text on light theme and `--bg` text on dark theme, 8px radius, 600 weight.
- Below the button: a vertical timeline of steps. Each step has a dot on a thin vertical line, a title (`Step 0`, `Step 1`, ...), and a description.
- Each dot is vertically centered against its step title's line-height, placing the dot and title on the same horizontal line.
- The active step is the last one in the list; passed steps are located above it. Future steps are not shown.
- Active step: `--primary` dot, `--text` title, description expanded and visible.
- Passed steps: dot filled with `--line` color, `--text-muted` title, description collapsed.
- Clicking a passed step rolls the algorithm back to that step.
- When a new step is added, the list scrolls down automatically and smoothly.
- New steps appear with a fade and slide-in animation; the description expands with a height transition.
- If the list exceeds the panel height, it scrolls inside the panel; the scrollbar is thin and styled with `--line`.

### 5.4. Code Block

Two-column layout on desktop: left column is narrow and fixed-width, right column fills the remaining width.
Left column: block title "Code" (RU: "Код") at the top, followed by a vertical stack of tab buttons: Python, JavaScript, C++. Tabs are bordered buttons with 8px radius, full width of the left column, stacked with a small gap. The active tab has --primary-soft fill and --primary outline; inactive tabs use the standard --surface background and --line border.
Right column: a code area with line numbers, Roboto Mono, in a bordered block with --surface background, filling the available height of the block.
Line numbers are --text-muted and are not selectable. Code text is selectable and copyable.
Syntax highlighting uses colors derived from the cluster palette and --text-muted, defined per theme.
Switching tabs fades the code content out and in.
The code area has a fixed height sized to show approximately 25 lines, identical for all three languages regardless of actual line count. Longer content scrolls vertically inside the code area (in addition to the existing horizontal overflow scroll).
The bottom edge of the visible area makes it visually clear that more content exists below: a subtle fade-out gradient (--surface-to-transparent) or a visible partial line cut off at the bottom, not an abrupt hard cut that looks like the end of the code.
Below 1024px (tablet and mobile, see DESIGN.md section 6 breakpoints), the layout switches to a single column: the tab buttons become a horizontal row above the code area instead of a vertical stack in a side column, keeping the same button styling.

### 5.5. Plots Block

- Block title: "Plots" (RU: "Сценарии").
- Four cards in one row: Circles, Blobs, Half-moons, Create (RU: Круги, Шарики, Полумесяцы, Создать).
- Each card: bordered block with `--surface` background, a subtle `--grid` background grid, a static flat SVG preview on top (individual dots in cluster palette colors), and a label below.
- Previews are static and depict the scenario: exactly 3 concentric rings made of individual dots (Circles), a small number of distinct groups of dots (Blobs), two crescent/half-moon-shaped arcs of dots (Half-moons), and a minimal cursor silhouette made entirely of dots (Create). The Create cursor is a card illustration only; selecting Create opens the main Canvas with no points.
- The selected card is not highlighted.
- The row is one line on desktop and wraps to 2x2 on tablet and mobile.

### 5.6. Footer

- Three zones in one row:
  - Left: a stacked block, top to bottom:
    1. "Created by Nikita Shvedov" (RU: "Создатель: Nikita Shvedov")
    2. "Telegram channel" (RU: "Telegram канал"), a link, on its own line, indented slightly relative to line 1
    3. "VK" (RU: "ВКонтакте"), a link, on its own line, at the same indent as line 2
    4. "GitHub" (RU: "GitHub"), a link, on its own line, at the same indent as line 2
    Lines 2-4 are links: plain text, no underline, `--text-muted` color.
  - Center: a slot for an SVG cat mark, to be supplied later. The slot is a fixed-size container of 48px height; it is empty until the asset is added.
  - Right: "Made with love for school and university students" (RU: "Создано с любовью для школьников и студентов"), wrapped across multiple lines, right-aligned, `--text-muted`.
- Below the three zones: a centered note in `--text-muted`, 13-14px, wrapped across two lines:
  - EN: "This is a simplified visualization of DBSCAN. Clusters grow by the neighbor radius R, and groups smaller than minPts are treated as noise. The original algorithm also distinguishes core and border points."
  - RU: "Это упрощённая визуализация DBSCAN. Кластеры растут по радиусу соседства R, а группы меньше minPts считаются шумом. Оригинальный алгоритм дополнительно различает core- и border-точки."
- Link URLs (Telegram, VK, GitHub) are supplied later; the links exist as placeholders until then.
- A thin `--line` separator sits above the footer.
- On mobile, per DESIGN.md 6, all three zones stack vertically and are centered; the left zone's internal stack (name + three links) stays in the same top-to-bottom order, centered.

### 5.7. Theory Page

- The Theory page starts with a bordered, immediately visible table of contents linking to each section; the reading column stays narrow and single-column at all breakpoints.
- Each main content section appears once on scroll using the shared Reveal animation. The pseudocode blocks reuse the Code block's line numbers, Roboto Mono font, and theme-based syntax colors.
- The page explains the simplified variant used by the visualization and clearly distinguishes it from classic DBSCAN. Reduced-motion preferences disable movement and use instant table-of-contents navigation.

## 6. Responsive Layout

Breakpoints: mobile below 768px, tablet 768-1023px, desktop 1024px and above.

Mobile order of blocks: Steps panel, Canvas panel, Code block, Plots block.

- Mobile: single column. Canvas aspect ratio 1:1. The R and minPts sliders stack vertically in the control row. Plots in 2x2 grid. Footer zones stack vertically and are centered.
- Tablet: single column for the visualization block (Steps panel above Canvas panel), Plots in 2x2 grid.
- Desktop: layout as described in section 5.
- On mobile and tablet, the Steps panel reserves about one-third of the viewport height (capped at 320px). Its history list scrolls inside the panel, with the active step and roughly the latest 2-3 preceding steps visible; older steps remain accessible by scrolling.
- Touch targets are at least 44x44px.

## 7. Themes

- Light and dark themes share the same layout and differ only by token values.
- The theme toggle switches all tokens at once with a 300ms color transition. The Canvas repaints with the new tokens.

## 8. Animation

Character: smooth, crisp, confident, without sagging or lag.

### 8.1. Timing

- Default easing: `cubic-bezier(0.22, 1, 0.36, 1)`.
- Durations: small elements 200-300ms, blocks and panels 400-600ms, Canvas step transitions 500-700ms.
- No spring bounce or overshoot.

### 8.2. Scroll Reveal

- Blocks (Visualization, Code, Plots, Footer) appear when they enter the viewport: opacity 0 to 1 and translateY 24px to 0, 600ms.
- Runs once per block. Children within a block (for example, Plots cards) appear with a 60ms stagger.

### 8.3. Step Transitions

- Canvas playback uses the ordered events from the algorithm frames; all selection, expansion, capture order, and group membership decisions remain in the algorithm core.
- When the initial point is selected in step 1 or step 6, a single white (`--pulse`) selection ring appears larger and semi-transparent, then smoothly converges and fades into the point (an osu!-style approach circle). A subtle `--text` outline keeps the ring visible on either theme. No ring appears for subsequent point selections within a growing group.
- Exactly one point may pulse: the current point, drawn above every other point. Its fill smoothly changes to the cluster color. While it remains current, its size smoothly oscillates from its normal radius up to at most 1.5 times that radius and back, using an ease-in-out cycle. No other point pulses, and the size pulse stops as soon as the current point changes.
- Radius growth and retraction use a smooth ease-in-out curve with no abrupt start or stop. When expansion starts, the R circle grows from zero to R around the current point over at least 600ms. Before selecting the next current point, the current circle retracts from R back into the point; the next selection begins after retraction.
- On step 3, after the previous point's circle retracts and the next point is selected, its full R circle appears around it. The circle stays in place during step 4 while newly discovered neighbors are captured.
- Newly found points are captured in the order supplied by the algorithm frame. At the start of every step, the acceleration timer and capture ramp reset. Before 5 seconds within that step, points are colored one at a time with fades of at least 200ms and start intervals that decrease linearly from 120ms toward a 20ms floor. After the threshold, captures continue one at a time; their start intervals and fade durations decay by a factor of 0.97 per captured point with no lower floor, smoothly approaching zero. Internal point selections become immediate in this mode. The step 1 and step 6 starting-point rings retain their 600ms duration. The timer does not reset during repeated events or group transitions inside steps 5 and 8.
- In repeated growth cycles, the core only emits selection and radius events for cluster members that still have an unassigned neighbor within R. Members without new neighbors are marked processed and skipped without selection, retraction, radius growth, or expansion events; they remain in the group and count toward minPts. Group completion occurs when no expandable members remain.
- The step 1 and step 6 selection pings last at least 600ms. Before 5 seconds within a step, R-circle growth lasts 600ms and retraction lasts 300ms. After the threshold, each subsequent radius transition within that step uses its normal base duration multiplied by `0.97^n`, where `n` is the count of accelerated radius transitions in that step starting at 1; there is no minimum duration. Internal point-selection delays also become zero in exponential mode. The timer and acceleration counters reset at each new step, but not between repeated events or groups inside steps 5 and 8.
- As soon as a group has no more unexpanded members that can reach unassigned neighbors, the algorithm checks its size against minPts. Undersized groups transition to the noise palette at that group-completion event, during steps 5 or 8 as applicable; step 9 does not recolor points.
- Step 9 retracts the final R circle and clears the current point's pulse and top-layer state while finalizing the summary. Rolling back to an earlier step may skip or abbreviate the animation, but must land on that frame's exact final visual state.
- Each step's Canvas playback is capped at 30 seconds. If its scheduled animation exceeds this limit, playback snaps to the exact final visual state of that same step; it does not advance the step history or impose a total runtime limit across steps 1-9.
- New step entries in the Steps panel slide and fade in; the description expands by height.
- Rolling back to a previous step animates the Canvas to that step's state.

### 8.4. Scenario Change

- When another scenario is selected, points fly from their current positions to the new positions and their colors reset to gray with a smooth transition.

### 8.5. Other Transitions

- Page switcher: opacity transition on selection.
- Drawing tools: fade and slide-up appearance.
- Popover and toast: fade and slide.
- Code tabs: content fade.
- Theme switch: color transition.

### 8.6. Restrictions

- No hover animations or micro-interactions (no scale, pulse, or movement on hover).
- Interactive elements show a pointer cursor, a visible focus outline in `--primary`, and no scale or motion on press.
- With `prefers-reduced-motion`, the step 1 and step 6 ring pings and current-point size pulse collapse to a single static white highlight; intra-group point selections have no ring. Sequential captures collapse to a single fast fade. Radius and color transitions use shortened opacity-only changes without spatial movement. The frame's final point assignments, noise state, summary, and cleared/current-point state remain identical to standard motion.
