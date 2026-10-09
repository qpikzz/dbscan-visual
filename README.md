<div align="center">

# DBSCAN Visual

**Интерактивная визуализация упрощённого алгоритма кластеризации DBSCAN в браузере**

Пошагово покажите, как из точек вырастают кластеры, а небольшие группы становятся шумом.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/license-MIT-9AA3B2)](#)

</div>

---

## О проекте

**DBSCAN Visual** — это образовательный мини-сайт, который наглядно объясняет суть
density-based кластеризации. Пользователь проходит алгоритм шаг за шагом на реальных
точках и видит, как кластеры растут от соседей, а маленькие группы помечаются как шум.

Проект состоит из двух страниц:

| Страница | Назначение |
| --- | --- |
| **Визуализация** | Интерактивный Canvas с пошаговым управлением, слайдерами параметров, готовыми сценариями, инструментами рисования и шаблонами кода на Python, JavaScript и C++. |
| **Теория** | Текстовое описание алгоритма: идея, параметры, типы точек, сильные и слабые стороны. Материал рассчитан на новичков. |

### Возможности

- **Пошаговый разбор алгоритма** с плавной анимацией переходов между шагами.
- **Параметры `R` и `minPts`** — интерактивные слайдеры с подсказками и сбросом.
- **Четыре сценария**: «Круги», «Шарики», «Полумесяцы» и «Создать» (рисование своих точек).
- **Интерактивный холст**: зум колесом и жестами, панорамирование, рисование и удаление точек.
- **Шаблоны кода** на Python, JavaScript и C++ с подсветкой синтаксиса и копированием.
- **Локализация** на русский и английский языки.
- **Светлая и тёмная темы** с сохранением выбора.
- **Полная адаптивность** под мобильные устройства и десктоп.

> Это упрощённая визуализация DBSCAN. Кластеры растут по радиусу соседства `R`,
> а группы меньше `minPts` считаются шумом. Оригинальный алгоритм дополнительно
> различает core- и border-точки.

---

## Стек технологий

| Категория | Технология |
| --- | --- |
| Сборка | [Vite](https://vite.dev/) |
| Язык | [TypeScript](https://www.typescriptlang.org/) (strict) |
| UI | [React](https://react.dev/) 19 |
| Маршрутизация | `react-router-dom` (HashRouter) |
| Стилизация | [Tailwind CSS](https://tailwindcss.com/) 4, темы через CSS-переменные |
| UI-анимации | [Motion](https://motion.dev/) |
| Анимации визуализации | Canvas 2D + `requestAnimationFrame`, собственные функции интерполяции |
| Локализация | `i18next` + `react-i18next` (ru, en) |
| Подсветка кода | [prism-react-renderer](https://github.com/FormidableLabs/prism-react-renderer) |
| Шрифты | `@fontsource` (Nunito, Roboto Mono), self-hosted |
| Менеджер пакетов | npm |

Вся логика работает в браузере, серверной части нет. Внешние сетевые запросы не используются.

---

## Установка

Понадобятся установленные [Node.js](https://nodejs.org/) и npm.
Команды выполняются из корневой папки проекта.

```powershell
npm ci
```

Команда `npm ci` устанавливает зависимости строго по зафиксированным версиям из `package-lock.json`.

---

## Запуск

### Сервер разработки

```powershell
npm run dev
```

Vite запустит локальный сервер (по умолчанию [http://localhost:5173](http://localhost:5173)).
Остановить его можно сочетанием `Ctrl+C`.

### Проверка production-сборки

```powershell
npm run build
```

Команда выполняет проверку типов (`tsc -b`), собирает проект (`vite build`) и копирует
лицензии шрифтов в папку сборки.

### Предпросмотр сборки

```powershell
npm run preview
```

### Скрипты npm

| Скрипт | Что делает |
| --- | --- |
| `npm run dev` | Запускает сервер разработки Vite. |
| `npm run build` | Проверка типов, production-сборка и копирование лицензий шрифтов. |
| `npm run preview` | Локальный предпросмотр собранной версии. |

---

## Структура проекта

```
dbscan-visual/
├── public/                     статика: favicon и SVG-иконки
│   ├── favicon.svg
│   └── icons.svg
├── scripts/
│   └── copy-font-licenses.mjs  копирование лицензий шрифтов при сборке
├── src/
│   ├── app/                    корень приложения и маршрутизация
│   │   └── App.tsx
│   ├── pages/                  страницы «Визуализация» и «Теория»
│   │   ├── VisualizationPage.tsx
│   │   └── TheoryPage.tsx
│   ├── components/             переиспользуемые UI-компоненты
│   │   ├── AppShell.tsx
│   │   ├── CanvasPanel.tsx
│   │   ├── CodeBlock.tsx
│   │   ├── DataInfoModal.tsx
│   │   ├── DrawingTools.tsx
│   │   ├── ParameterSlider.tsx
│   │   ├── Reveal.tsx
│   │   ├── ScenarioCards.tsx
│   │   ├── ScenarioPreview.tsx
│   │   ├── StepsPanel.tsx
│   │   └── VisualizationBlock.tsx
│   ├── features/
│   │   ├── canvas/             отрисовка Canvas, зум/пан, анимации
│   │   │   ├── animation.ts
│   │   │   ├── CanvasView.tsx
│   │   │   ├── drawing.ts
│   │   │   └── scenarioTransition.ts
│   │   └── dbscan/             ядро алгоритма, генерация кадров, PRNG
│   │       ├── cluster.ts
│   │       ├── constants.ts
│   │       ├── distance.ts
│   │       ├── frames.ts
│   │       ├── index.ts
│   │       ├── neighbors.ts
│   │       ├── noise.ts
│   │       ├── prng.ts
│   │       ├── scenarios.ts
│   │       └── types.ts
│   ├── data/                   подготовленные датасеты и шаблоны кода
│   │   ├── code.ts
│   │   ├── index.ts
│   │   └── preparedScenarios.ts
│   ├── i18n/                   конфигурация локализации и словари
│   │   ├── dictionaries.ts
│   │   ├── index.ts
│   │   └── LanguageProvider.tsx
│   ├── hooks/                  кастомные хуки
│   │   ├── useLocalStorage.ts
│   │   └── useMotionSettings.ts
│   ├── config/
│   │   └── socialLinks.ts
│   ├── styles/                 глобальные стили и переменные тем
│   │   ├── global.css
│   │   └── visualization.css
│   ├── assets/
│   │   ├── hero.png
│   │   ├── react.svg
│   │   └── vite.svg
│   └── main.tsx                точка входа приложения
├── openspec/                   правила и спецификации проекта
│   ├── RULES.md
│   └── specs/
├── .gitignore
├── AGENTS.md
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

Каталоги `node_modules`, `dist`, `temp` и `openspec/tasks` создаются локально и в репозиторий не попадают (см. `.gitignore`).

---

## Автор

**Nikita Shvedov**

- Telegram: [@qpikzz](https://t.me/qpikzz)
- ВКонтакте: [vk.ru/qpikzz](https://vk.ru/qpikzz)
- GitHub: [github.com/qpikzz](https://github.com/qpikzz)

<div align="center">

Создано с любовью для школьников и студентов.

</div>
