# FUNCTIONALITY

Functional specification for the "Visualization" page.

## 1. Parameters

| Parameter | Meaning | Range | Step |
|---|---|---|---|
| R | Neighbor radius, in Canvas units | 0.1 to 20 | 0.1 |
| minPts | Minimum number of points in a group for it to count as a cluster | 0 to 100 | 1 |

- Both parameters are controlled by sliders in the Canvas panel, each with a "?" popover (see DESIGN.md) and a reset button. The reset button restores that parameter to the optimal value set for the currently selected scenario.
- Resetting either parameter changes its value when needed and follows the normal reset-to-step-0 rule in section 7.
- One Canvas unit equals one grid cell at zoom level 1.
- Two points are neighbors if the Euclidean distance between them is strictly less than R.
- Each prepared scenario defines its own optimal R (and minPts). Selecting a scenario sets these values. The values are chosen when the scenario data is created.

## 2. Canvas

### 2.1. Zoom and Pan

- Zoom in and out: mouse wheel on desktop, pinch on touch devices.
- The grid scales together with the zoom; one grid cell always equals one Canvas unit.
- Pan: dragging the Canvas moves the view. Left-click-drag pans only when no drawing tool is active. Middle mouse button (MMB) drag pans always, regardless of whether a drawing tool (Draw/Erase) is active, so the user does not have to deselect the tool to pan.

### 2.2. Drawing Mode

- Drawing tools are available only in the "Create" scenario.
- When the "Draw" tool is active, a click places a point; holding the pointer places points periodically along the pointer path.
- When the "Erase" tool is active, points under the pointer are removed.
- When no tool is active, the pointer pans the Canvas.
- In the "Create" scenario, a "Clear canvas" control removes all points. Clearing the Canvas follows the reset-to-step-0 rule in section 7.

### 2.3. Point Limit

- The Canvas holds at most 1024 points.
- When the limit is reached, further points are not added and an error toast is shown: "Point limit reached: 1024" (RU: "Достигнут лимит точек: 1024").

## 3. Scenarios

Four scenarios, shown as cards: Circles, Blobs, Half-moons, Create.

- Circles, Blobs, and Half-moons are prepared datasets with fixed point positions. The number of points in each is whatever the dataset requires, not exceeding 1024.
- Creating the datasets is a separate task and is not defined in this document.
- Create lets the user draw their own points (see 2.2).
- Selecting a scenario:
  1. resets the algorithm to step 0;
  2. resets all point colors to gray;
  3. animates points flying from their current positions to the new positions;
  4. sets R and minPts to the scenario's optimal values.

## 4. Algorithm

### 4.1. Variant

A simplified DBSCAN variant:

1. A cluster starts from a randomly chosen point that is not assigned to any cluster.
2. The cluster grows by repeatedly taking all unassigned neighbors (distance < R) of points already in the cluster.
3. When the cluster stops growing, a new cluster starts from another random unassigned point.
4. The process repeats until every point belongs to a cluster.
5. Every resulting group with fewer than minPts points is marked as noise.

Core and border points are not distinguished.

### 4.2. Randomness

- Random choices use a seeded PRNG.
- The seed is fixed when the run starts (Start pressed at step 0) so that rolling back to a step reproduces the same state.
- Every new run from step 0 uses a new seed.

### 4.3. Frames

- On Start, the algorithm core computes the frames for all steps for the current points, R, minPts, and seed.
- The UI plays frames back with animations; rolling back to a step displays that step's frame.

## 5. Steps

There are always 9 steps after the initial step 0. One press of "Next" performs one entire step: all points that belong to the step are colored during that press, with animation.

| Step | EN text | RU text | Effect on the Canvas |
|---|---|---|---|
| 0 | Press the button above. | Нажмите на кнопку выше. | Initial state. All points gray. |
| 1 | Pick an arbitrary point. | Выбираем произвольную точку. | A random point is selected and colored with the first cluster color. |
| 2 | Take all its neighbors: points closer than R. | Забираем все соседние точки: расстояние до них меньше R. | The R circle is drawn around the point; all points within R are colored with the cluster color. |
| 3 | Pick the next point inside the painted area. | Выбираем следующую точку в закрашенной области. | A random point of the cluster that has not been expanded yet is selected; the R circle moves to it. |
| 4 | Take all new points that are neighbors of it. | Забираем все новые точки, которые являются её соседями. | Unassigned points within R of the selected point are colored with the cluster color. |
| 5 | Continue the same way until the cluster stops growing. | Продолжаем так, пока кластер не перестанет расти. | Steps 3 and 4 repeat, animated in sequence, until no unexpanded points remain in the cluster. |
| 6 | Pick a random point that does not belong to any cluster. | Выбираем случайную точку, не принадлежащую ни одному кластеру. | A random unassigned point is selected and colored with the next cluster color. If no unassigned points remain, nothing changes. |
| 7 | Take all its neighbors. | Забираем все соседние для неё точки. | Unassigned points within R of the selected point are colored with the new cluster color. If no new cluster was started, nothing changes. |
| 8 | Repeat until every point belongs to a cluster. | Повторяем, пока все точки не попадут в кластеры. | Steps 5 to 7 repeat for all remaining clusters, animated in sequence, until no unassigned points remain. |
| 9 | Done! Total clusters: {count}. Noise points: {noise}. | Всё получилось! Всего кластеров: {count}. Точек шума: {noise}. | Groups with fewer than minPts points are recolored with the noise color. |

- `{count}` is the number of clusters that are not noise.
- `{noise}` is the number of points marked as noise.
- Cluster colors follow the palette in DESIGN.md, in the order clusters are created.
- A point with no neighbors forms a group of one point.
- Autoplay and "jump to end" are not provided.

## 6. Steps Panel Behavior

- Initially the panel shows the "Start" button and step 0.
- After the first press the button becomes "Next"; each press adds the next step to the list and performs it.
- The active step is the last one; passed steps are above it. The list scrolls down automatically.
- On mobile and tablet, the step history remains in an inner scrollable list; automatic scrolling keeps the active step and the most recent preceding steps visible.
- Only the active step's description is expanded.
- Clicking a passed step rolls the state back to that step; steps after it are removed from the list.
- After step 9, the "Next" button is disabled.
- If the Canvas has no points, the "Start" button is disabled.

## 7. Reset Rules

The algorithm resets to step 0 (all points gray, step list cleared to step 0, button "Start") when any of the following changes:

- R;
- minPts;
- the set of points (adding or erasing a point);
- the selected scenario.

## 8. Code Block

- Tabs: Python, JavaScript, C++.
- Each tab shows a copyable implementation of the same simplified variant as a function that takes points, R, and minPts and returns clusters and noise. It contains no visualization code.
- Syntax highlighting is applied; lines are numbered.
- The code is not synchronized with algorithm steps.
- The code text is static and identical in both interface languages.

## 9. Localization

- All texts on this page, including step texts, tooltips, and error messages, exist in Russian and English.
- Switching the language updates the texts immediately, including the texts of steps already shown.

## 10. Footer Note

- The footer contains a note that the visualization is a simplified version of DBSCAN (text in DESIGN.md).
