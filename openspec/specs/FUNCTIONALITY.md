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
- On initial load and when selecting a scenario, the camera automatically fits the full point set in the Canvas with a margin. Subsequent user zooming and panning are preserved until the next scenario selection.
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

- Circles, Blobs, and Half-moons are prepared datasets with fixed point positions. Each dataset contains at least 128 points and no more than 1024. Their points are irregularly distributed within the intended shape boundaries, with visible spacing within each shape and clear gaps between separate shapes at default Canvas zoom. Circles use two or three layers per ring. Half-moons are two interlocking crescent arcs, each using two or three point layers. The recommended R for every prepared scenario is at least 1 and keeps each intended shape connected without joining separate shapes.
- Creating the datasets is a separate task and is not defined in this document.
- Create lets the user draw their own points (see 2.2).
- Selecting a scenario:
  1. resets the algorithm to step 0;
  2. resets all point colors to gray;
  3. animates points flying from their current positions to the new positions;
  4. sets R and minPts to the scenario's optimal values.
  5. selecting Create starts with an empty Canvas; points drawn in a previous Create session are cleared.

## 4. Algorithm

### 4.1. Variant

A simplified DBSCAN variant:

1. A cluster starts from a randomly chosen point in a pre-run group with at least minPts points.
2. The cluster grows by repeatedly taking all unassigned neighbors (distance < R) of points already in the cluster.
3. When the cluster stops growing, another cluster starts from a random point in a remaining group with at least minPts points.
4. The process repeats until every eligible group has been processed; groups smaller than minPts are recorded as noise without being started.
5. Every resulting group with fewer than minPts points is marked as noise.

Core and border points are not distinguished.

### 4.2. Pre-run Partition and Randomness

- Before playback, the algorithm core partitions the input points into connected groups using the neighbor relation (Euclidean distance strictly less than R). A group with at least minPts points is eligible to start a cluster; every smaller group is known to be noise and is never a starting-point candidate.
- Random choices within each not-yet-found group use a seeded PRNG. The seed is fixed when the run starts (Start pressed at step 0), so rolling back to a step reproduces the same event sequence and state. Every new run from step 0 uses a new seed.
- In the standard scenario, steps 1 and 6 choose a random group only from the remaining groups with at least minPts points, then choose a point only from that group's members. In single-cluster scenarios, only step 1 selects a cluster-start point. The eligible-group pool is filtered once from the pre-run component sizes before playback; undersized noise groups are excluded, then recorded as noise without a starting-point selection. This enforces the invariant that cluster-start selections never pick noise points.
- The core picks a random starting point from the first eligible group at step 1, then from each not-yet-found eligible group when the previous group has finished. Expansion processes each newly discovered neighbor in a deterministic order recorded in the frame events.
- A point already assigned to the current cluster is selected for expansion only if it has at least one unassigned neighbor within R. Members with no unassigned neighbors are marked processed by the core without emitting selection, retraction, radius-growth, or expansion animation events. They remain members of the group and count toward minPts.
- A completed group is checked against minPts as soon as no unexpanded member can reach an unassigned neighbor. If it is smaller than minPts, every point in that group becomes noise immediately in that step's final state and its completion event. Summary steps do not recolor groups.
- Pre-run groups smaller than minPts are excluded from cluster-start selection and recorded as noise during step 5, without selecting or expanding any of their points.

### 4.3. Frames

- On Start, the algorithm core computes the frames for all steps for the current points, R, minPts, and seed. Frames include the ordered point captures, current-point selections, and group-completion events needed to animate each step.
- The UI plays frames back with animations; rolling back to a step displays that step's frame.

## 5. Steps

### 5.1. Standard Scenario

The standard scenario has 9 steps after the initial step 0. One press of "Next" performs one entire step: all points that belong to the step are colored during that press, with animation. Under standard motion settings, each step takes at least 300ms so its events can be seen and analyzed. Each individual step's Canvas playback is capped at 30 seconds; if a step's scheduled animation exceeds the cap, playback snaps to that step's exact final visual state without changing the active step or step history. There is no total runtime limit across steps 1-9. Only the current point pulses, by smoothly growing from its normal size up to 1.5 times that size and back while it remains current. The starting-point selections in steps 1 and 6 get a single white, converging ring ping; intra-group point selections do not. The 5-second acceleration timer resets at the start of each step. Within a step and before 5 seconds elapse, point captures are sequential, with fades of at least 200ms and linearly decreasing start intervals. After the threshold, captures continue one at a time while their intervals and fade durations decrease exponentially by a factor of 0.97 per captured point, without a lower limit and approaching zero. Internal point selections have no delay; starting-point selection rings retain their normal duration. Radius growth/retraction also accelerates after the threshold: each subsequent transition uses its normal base duration multiplied by 0.97^n, where n counts accelerated radius transitions in that step starting at 1, without a lower limit. The timer does not reset during repeated events or group transitions inside steps 5 and 8.

| Step | EN text | RU text | Effect on the Canvas |
|---|---|---|---|
| 0 | Hit the button above to see it in action | Нажмите кнопку выше, чтобы начать изучение | Initial state. All points gray. |
| 1 | We pick a random point and put it in cluster 1 | Выбираем случайную точку и добавляем её в первый кластер | A random point from the first pre-run group with at least minPts points is chosen. A single white converging selection-ring ping marks it, then it moves to the top rendering layer, fades to the first cluster color, and starts pulsing in size up to 1.5 times its normal size. |
| 2 | Let's find its neighbors: points closer than R | Найдём всех её соседей — точки, расстояние до которых меньше R | The R circle grows from zero to R over 0.6 seconds unless 5 seconds have elapsed in this step. Before the threshold, unassigned neighbors are captured one at a time with fades of at least 0.2 seconds and linearly decreasing start intervals; after it, captures remain one at a time while start intervals and fade durations decrease exponentially toward zero. |
| 3 | Now pick a random point from the cluster we haven't checked yet | Среди них выберем случайную ещё не проверенную точку | The current R circle retracts to its point and its size pulse stops. The next unexpanded point in the group becomes current, moves to the top layer and starts pulsing in size; its full R circle appears around it. No selection ring is shown. |
| 4 | Find its neighbors and add them to the cluster too | Найдём её соседей и тоже добавим в кластер | The R circle grows from the new current point, with its duration shortened exponentially if 5 seconds have elapsed in this step. Newly discovered neighbors are captured sequentially; after the threshold their start intervals and fade durations shrink exponentially toward zero. |
| 5 | We keep checking new points one by one. Once none of them add new neighbors, the cluster is done | Проверяем новые точки одну за другой. Когда ни одна из них больше не добавляет соседей — кластер готов | The step 3-4 cycle repeats only for points that still have unassigned neighbors within R. Other members are marked processed without animation. This step starts with a fresh 5-second timer: captures remain sequential and radius transitions use 600ms growth / 300ms retraction until the threshold. After it, internal selections have no delay, capture intervals and fade durations decrease by 0.97 per point toward zero, and each subsequent radius transition uses its base duration multiplied by 0.97^n without a minimum. The timer does not reset between repeated events. No selection ring is shown. When no expandable members remain, the group is checked immediately against minPts and, if too small, all its points turn to noise. |
| 6 | Let's pick a random point outside any cluster | Выберем случайную точку вне кластеров | A random point from the next not-yet-found pre-run group with at least minPts points is chosen by a single white converging ring ping, moves to the top layer, is colored with the next cluster color, and pulses in size. If no eligible group remains, nothing changes. |
| 7 | Find its neighbors and start a new cluster with them | Найдём её соседей и начнём с них новый кластер | The R circle grows from the current point, with its duration shortened exponentially if 5 seconds have elapsed in this step. Unassigned neighbors are captured sequentially; after the threshold their start intervals and fade durations shrink exponentially toward zero. If no new group was started, nothing changes. |
| 8 | We repeat this until every point has a cluster | Повторяем, пока все точки не окажутся в своих кластерах | Steps 3-5 repeat within each remaining group, processing only points with unassigned neighbors within R; members without new neighbors are skipped without animation. Step 8 starts its own fresh 5-second timer; within step 8, acceleration does not reset for new groups or repeated events. After its threshold, internal selections have no delay, capture intervals and fades decrease by 0.97 per point toward zero, and each subsequent radius transition uses its base duration multiplied by 0.97^n. Each group is checked against minPts as soon as no expandable members remain and any undersized group is recolored as noise then; the cycle continues until no groups remain. |
| 9 | Done! Total clusters: {count}, noise points: {noise}. Nice work! | Готово! Всего кластеров: {count}, точек шума: {noise}. Отличная работа! | The last R circle retracts. No points are recolored; the step finalizes the summary and clears the R-circle, pulsing, and top-layer state. |

- `{count}` is the number of clusters that are not noise.
- `{noise}` is the number of points marked as noise.
- Cluster colors follow the palette in DESIGN.md, in the order clusters are created.
- A point with no neighbors forms a group of one point.
- Autoplay and "jump to end" are not provided.

### 5.2. No-Clusters Scenario

Used when no cluster exists after the pre-run partition (every group has fewer than minPts points, so every point is noise). The step texts are humorous. The step count stays 9.

| Step | EN text | RU text | Effect on the Canvas |
|---|---|---|---|
| 0 | Press the button above. | Нажмите на кнопку выше. | Initial state. All points gray. |
| 1 | Pick an arbitrary point. | Выбираем произвольную точку. | A random point is highlighted with a `--primary` outline; its fill stays gray. |
| 2 | Looking for all its neighbors... Hmm, odd. This point looks like noise. | Ищем все соседние точки... Хм, странно. Кажется, эта точка — шум. | The R circle is drawn; points within R are briefly highlighted with a `--primary` outline, then the highlight fades. |
| 3 | Well, it happens. Let's pick another point. | Ну ладно, бывает. Выбираем другую точку. | Another random point is highlighted; the R circle moves to it. |
| 4 | Looking for neighbors... Nothing here either. What's going on? | Ищем соседей... И тут пусто. Что же такое? | Points within R are briefly highlighted, then the highlight fades. |
| 5 | One more try, maybe we'll get lucky. | Пробуем ещё раз, вдруг повезёт. | A third random point is highlighted; the R circle moves to it and neighbors are briefly highlighted. |
| 6 | No luck. Checking the rest of the points: same story. | Не повезло. Проверяем остальные точки: та же история. | The R circle sweeps across the remaining points in sequence. |
| 7 | Maybe it's not the points. Is minPts too high? | Может, дело не в точках. Не слишком ли большой minPts? | The R circle disappears. No other change. |
| 8 | Checking every last point: no clusters found. | Проверяем все точки до последней: кластеров нет. | The R circle sweeps across all points again, faster. |
| 9 | Done! Clusters: 0, noise: {countNoise} points. Try lowering minPts or increasing R. | Готово! Кластеров: 0, шум: {countNoise} точек. Попробуйте уменьшить minPts или увеличить R. | All points are recolored with the noise color. |

### 5.3. Single-Cluster Scenarios

These cases apply when exactly one pre-run group has at least minPts points. They contain the initial step 0 and steps 1-6. Steps 1-5 select and grow that cluster using the standard-scenario actions above. Step 6 combines the closing note and summary; there are no redundant no-op steps. The last R circle retracts, and the summary is finalized while the circle, pulse, and top-layer state are cleared. No points are recolored in this closing step.

| Step | EN text | RU text | Effect on the Canvas |
|---:|---|---|---|
| 0 | Hit the button above to see it in action | Нажмите кнопку выше, чтобы начать изучение | Initial state. All points gray. |
| 1 | We pick a random point and put it in cluster 1 | Выбираем случайную точку и добавляем её в первый кластер | A random point from the eligible group is selected, marked by a white ring, colored with the first cluster color, and starts pulsing. |
| 2 | Let's find its neighbors: points closer than R | Найдём всех её соседей — точки, расстояние до которых меньше R | The R circle grows; unassigned neighbors are captured sequentially. |
| 3 | Now pick a random point from the cluster we haven't checked yet | Среди них выберем случайную ещё не проверенную точку | The current circle retracts; the next unexpanded group member becomes current and its R circle appears. |
| 4 | Find its neighbors and add them to the cluster too | Найдём её соседей и тоже добавим в кластер | The R circle grows from the new current point; newly discovered neighbors are captured. |
| 5 | We keep checking new points one by one. Once none of them add new neighbors, the cluster is done | Проверяем новые точки одну за другой. Когда ни одна из них больше не добавляет соседей — кластер готов | The group finishes growing. In the with-noise case, undersized pre-run groups are recorded as noise during this step. |
| 6 (no noise) | That's it: one cluster, and no noise points. | Вот и всё: один кластер, точек шума нет. | The final R circle retracts and the summary is finalized. No points are recolored. |
| 6 (with noise) | That's it: one cluster, and {noise} points marked as noise. | Вот и всё: один кластер, точек шума — {noise}. | The final R circle retracts and the summary is finalized. Existing noise points are not recolored. |

When that one group contains every point, the no-noise closing text is shown. When other pre-run groups exist, each is smaller than minPts and is recorded as noise during step 5 without being selected as a starting point. The with-noise closing text substitutes the actual noise count.

### 5.4. General Rules

- The standard and no-clusters scenarios show steps 0-9. The single-cluster scenarios show steps 0-6, with the closing summary at step 6.
- The no-clusters script's point probes are explanatory highlights, not cluster-start selections. No point is assigned to a cluster during steps 1-8 in that scenario.
- The final step reports the final cluster and noise counts. The no-clusters scenario colors all points as noise in step 9; standard and single-cluster scenarios record undersized pre-run groups as noise during step 5.

## 6. Steps Panel Behavior

- Initially the panel shows the "Start" button and step 0.
- After the first press the button becomes "Next"; each press adds the next step to the list and performs it.
- The active step is the last one; passed steps are above it. The list scrolls down automatically.
- On mobile and tablet, the step history remains in an inner scrollable list; automatic scrolling keeps the active step and the most recent preceding steps visible.
- Only the active step's description is expanded.
- Clicking a passed step rolls the state back to that step; steps after it are removed from the list.
- After the final step for the active scenario, the "Next" button is disabled.
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
