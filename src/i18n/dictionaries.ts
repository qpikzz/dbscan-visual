export const supportedLanguages = ['ru', 'en'] as const

export type Language = (typeof supportedLanguages)[number]

export const defaultLanguage: Language = 'ru'

export const ru = {
  logo: '# DB SCAN',
  languageLabel: 'Переключить язык',
  languageRu: 'Ru',
  languageEn: 'En',
  themeToggleLabel: 'Переключить тему',
  pageSwitcherLabel: 'Переключение страниц',
  visualLabel: 'Визуализация',
  theoryLabel: 'Теория',
  canvasAria: 'Область визуализации',
  codeTitle: 'Код',
  codeTabsLabel: 'Язык кода',
  plotsTitle: 'Сценарии',
  scenarioCircles: 'Круги',
  scenarioBlobs: 'Шарики',
  scenarioHalfMoons: 'Полумесяцы',
  scenarioCreate: 'Создать',
  paramR: 'R',
  paramMinPts: 'minPts',
  paramHelpLabel: (label: string) => `Показать справку: ${label}`,
  paramRHelp: 'R — радиус, в пределах которого точки считаются соседями.',
  paramMinPtsHelp:
    'minPts — минимальное количество точек рядом, которое считается кластером.',
  startButton: 'Начать',
  nextButton: 'Далее',
  drawToolLabel: 'Рисование',
  eraseToolLabel: 'Стирание',
  stepTitle: (n: number) => `Шаг ${n}`,
  steps: [
    'Нажмите на кнопку выше.',
    'Выбираем произвольную точку.',
    'Забираем все соседние точки: расстояние до них меньше R.',
    'Выбираем следующую точку в закрашенной области.',
    'Забираем все новые точки, которые являются её соседями.',
    'Продолжаем так, пока кластер не перестанет расти.',
    'Выбираем случайную точку, не принадлежащую ни одному кластеру.',
    'Забираем все соседние для неё точки.',
    'Повторяем, пока все точки не попадут в кластеры.',
    'Всё получилось! Всего кластеров: {count}. Точек шума: {noise}.',
  ] ,
  footerAuthor: 'Создатель: Nikita Shvedov',
  footerTelegram: 'Telegram',
  footerGithub: 'GitHub',
  footerLove: 'Создано с любовью для школьников и студентов',
  footerNote:
    'Это упрощённая визуализация DBSCAN. Кластеры растут по радиусу соседства R, а группы меньше minPts считаются шумом. Оригинальный алгоритм дополнительно различает core- и border-точки.',
}

export type Dictionary = typeof ru

export const en: Dictionary = {
  logo: '# DB SCAN',
  languageLabel: 'Switch language',
  languageRu: 'Ru',
  languageEn: 'En',
  themeToggleLabel: 'Toggle theme',
  pageSwitcherLabel: 'Page switcher',
  visualLabel: 'Visualization',
  theoryLabel: 'Theory',
  canvasAria: 'Visualization area',
  codeTitle: 'Code',
  codeTabsLabel: 'Code language',
  plotsTitle: 'Plots',
  scenarioCircles: 'Circles',
  scenarioBlobs: 'Blobs',
  scenarioHalfMoons: 'Half-moons',
  scenarioCreate: 'Create',
  paramR: 'R',
  paramMinPts: 'minPts',
  paramHelpLabel: (label: string) => `Show help: ${label}`,
  paramRHelp:
    'R is the radius within which points are considered neighbors.',
  paramMinPtsHelp:
    'minPts is the minimum number of points nearby that counts as a cluster.',
  startButton: 'Start',
  nextButton: 'Next',
  drawToolLabel: 'Draw',
  eraseToolLabel: 'Erase',
  stepTitle: (n: number) => `Step ${n}`,
  steps: [
    'Press the button above.',
    'Pick an arbitrary point.',
    'Take all its neighbors: points closer than R.',
    'Pick the next point inside the painted area.',
    'Take all new points that are neighbors of it.',
    'Continue the same way until the cluster stops growing.',
    'Pick a random point that does not belong to any cluster.',
    'Take all its neighbors.',
    'Repeat until every point belongs to a cluster.',
    'Done! Total clusters: {count}. Noise points: {noise}.',
  ],
  footerAuthor: 'Created by Nikita Shvedov',
  footerTelegram: 'Telegram',
  footerGithub: 'GitHub',
  footerLove: 'Made with love for school and university students',
  footerNote:
    'This is a simplified visualization of DBSCAN. Clusters grow by the neighbor radius R, and groups smaller than minPts are treated as noise. The original algorithm also distinguishes core and border points.',
}

export const dictionaries = { ru, en } as const