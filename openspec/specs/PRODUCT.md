# PRODUCT

## 1. Product Essence

An educational project: an interactive mini-site that visually explains a simplified version of the DBSCAN clustering algorithm. The user walks through the algorithm step by step on real points and sees how clusters grow from neighbors and how small groups are treated as noise.

## 2. Algorithm Variant

The site visualizes a simplified variant of DBSCAN:

- Two points are neighbors if the distance between them is less than R.
- A cluster grows from a starting point by repeatedly taking neighbors of the points already in the cluster.
- A resulting group with fewer than minPts points is considered noise.
- The variant does not distinguish core and border points. The original DBSCAN does.

This simplification is stated explicitly on the site (see the footer note in DESIGN.md).

## 3. Target Audience

Beginners encountering DBSCAN for the first time. A basic understanding of points on a plane and of clustering is assumed. Knowledge of the R and minPts parameters is not assumed.

## 4. Main Goal

After visiting the site, a beginner understands the essence of density-based clustering as shown by DBSCAN: how the radius R and the minimum group size minPts determine which points form clusters and which are treated as noise.

## 5. Site Structure

Two pages, switchable via navigation.

### 5.1. "Visualization" Page

The main page. Contents:

- an interactive Canvas visualization of the algorithm with step-by-step controls;
- parameter controls: R and minPts;
- scenario selection: three prepared datasets and the ability to draw a custom one;
- a DBSCAN code template in Python, JavaScript, and C++.

### 5.2. "Theory" Page

A text description of DBSCAN: the idea of the algorithm, parameters, point types, how it works, strengths and limitations. The wording is aimed at beginners.

## 6. Key Scenarios

1. The user opens the "Visualization" page, selects a scenario, and walks through the algorithm step by step, watching animated transitions between steps.
2. The user draws their own set of points and runs the algorithm on it.
3. The user changes R and minPts and sees how the result changes.
4. The user zooms and pans the Canvas.
5. The user views the code template in the selected language and copies it.
6. The user reads the "Theory" page, whose blocks appear smoothly on scroll.

## 7. Non-Functional Requirements

- The entire algorithm runs in the browser; there is no backend.
- The site is static and hosted on free static hosting.
- Two interface languages: Russian and English.
- Two themes: light and dark.
- Full support for mobile devices and desktop.
- A large number of smooth animations: transitions between algorithm steps, block appearance on scroll. Micro-interactions are not used.
- Visual and animation smoothness is a quality priority.
- The number of points on the Canvas is limited to 1024.

## 8. Out of Scope

- Backend, accounts, server-side data storage.
- Loading external datasets from files.
- Comparing DBSCAN with other clustering algorithms.
- Distinguishing core and border points.
- Autoplay and "jump to end" controls for the algorithm.
- Automatic deployment.
- Tests, linter, formatter.

## 9. Timeline

Less than one week.
