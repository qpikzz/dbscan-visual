export const supportedLanguages = ['ru', 'en'] as const

export type Language = (typeof supportedLanguages)[number]

export const defaultLanguage: Language = 'ru'

export const ru = {
  logo: 'DB SCAN',
  languageLabel: 'Переключить язык',
  languageRu: 'Ru',
  languageEn: 'En',
  themeToggleLabel: 'Переключить тему',
  themeWarningMessage: 'Внимание! Вспышка через {count}',
  themeWarningCancel: 'Отмена',
  pageSwitcherLabel: 'Переключение страниц',
  visualLabel: 'Визуализация',
  theoryLabel: 'Теория',
  canvasAria: 'Область визуализации',
  codeTitle: 'Код',
  codeTabsLabel: 'Язык кода',
  codeCopyButton: 'Копировать',
  codeCopySuccess: 'Скопировано',
  codeCopyFailure: 'Не удалось скопировать код',
  theoryPageTitle: 'DBSCAN: как находить группы по плотности',
  theoryIntro:
    'Краткая памятка о том, как точки объединяются в кластеры, что означают R и minPts и чем учебная модель отличается от полного алгоритма.',
  theoryTocTitle: 'Содержание',
  theoryWhyTitle: 'Зачем группировать данные по плотности',
  theoryWhyParagraphs: [
    'Представьте карту кафе: одни места стоят по одному, а другие образуют оживлённые улицы. Если отметить каждое кафе точкой, плотные скопления подскажут, где находятся популярные районы, а отдельные точки останутся в стороне.',
    'Методам плотностной кластеризации не нужно заранее сообщать, сколько групп искать. Они находят области, где точки расположены достаточно близко, и могут выделять группы разной формы, разделённые редкими участками.',
  ],
  theoryWhyCallout:
    'В отличие от разбиения на заранее заданное число групп, плотностный подход сначала ищет скопления точек, а не назначает каждой точке место в одной из заранее выбранных групп.',
  theoryIdeaTitle: 'Идея упрощённого DBSCAN на этом сайте',
  theoryIdeaParagraphs: [
    'Алгоритм начинает с одной ещё не распределённой точки. Он добавляет к группе её близких соседей, затем ищет соседей уже добавленных точек и продолжает расширение, пока новые точки не закончатся.',
    'Когда группа завершена, её размер сравнивается с minPts. Достаточно большая группа считается кластером, а маленькая целиком помечается как шум.',
  ],
  theoryIdeaRadius: 'Соседи находятся ближе, чем радиус R.',
  theoryIdeaGrowth: 'Связанные цепочкой соседей точки могут вырасти в одну группу.',
  theoryIdeaNoise: 'Группа меньше minPts становится шумом.',
  theoryParametersTitle: 'Два параметра, которые меняют результат',
  theoryRadiusTitle: 'R — радиус соседства',
  theoryRadiusText:
    'Две точки считаются соседями, если расстояние между ними строго меньше R. Представьте вокруг точки круг: увеличение R расширяет область, в которой можно найти соседей.',
  theoryExampleLabel: 'Пример.',
  theoryRadiusExample:
    'при слишком маленьком R цепочки связей распадаются; образуются крошечные группы, и после проверки minPts многие или почти все точки могут стать шумом. С большим R раздельные скопления, наоборот, могут соединиться.',
  theoryMinPtsTitle: 'minPts — минимальный размер группы',
  theoryMinPtsText:
    'После того как группа перестала расти, её размер сравнивается с minPts. В этой учебной версии порог применяется ко всей группе, а не к каждой точке отдельно.',
  theoryMinPtsExample:
    'если в группе 5 точек, а minPts равен 6, вся группа будет отмечена как шум. Чем выше порог, тем больше завершённых групп не пройдут проверку.',
  theoryStepsTitle: 'Алгоритм по шагам',
  theoryStepsIntro:
    'На странице визуализации шаги сгруппированы в девять нажатий. Внутри нажатия роста алгоритм может несколько раз выбрать очередную точку группы и забрать её новых соседей.',
  theorySteps: [
    { title: '1. Выбрать точку', text: 'Среди точек, которые ещё не входят ни в одну группу, случайно выбирается начальная точка.' },
    { title: '2. Найти соседей', text: 'Все ещё не распределённые точки на расстоянии меньше R добавляются к группе.' },
    { title: '3. Выбрать точку группы', text: 'Из уже добавленных точек выбирается та, чьи соседи ещё не проверялись.' },
    { title: '4. Забрать новых соседей', text: 'Нераспределённые точки в пределах R от выбранной точки добавляются к той же группе.' },
    { title: '5. Продолжать рост', text: 'Пункты 3 и 4 повторяются, пока ни одна точка группы не добавит новых соседей.' },
    { title: '6. Начать следующую группу', text: 'Если остались нераспределённые точки, одна из них становится начальной точкой нового кластера.' },
    { title: '7. Найти соседей новой точки', text: 'Нераспределённые точки в её радиусе присоединяются к новой группе.' },
    { title: '8. Повторить для остальных точек', text: 'Рост каждой новой группы продолжается так же, пока распределять больше нечего.' },
    { title: '9. Проверить размер', text: 'Каждая завершённая группа меньше minPts перекрашивается как шум; остальные остаются кластерами.' },
  ],
  theoryCodePickLabel: 'Выбор начальной точки',
  theoryCodeNeighborsLabel: 'Проверка радиуса',
  theoryCodeGrowLabel: 'Расширение группы',
  theoryCodeNextLabel: 'Переход к следующей группе',
  theoryCodeFinishLabel: 'Кластер или шум',
  theoryOriginalTitle: 'Чем модель отличается от оригинального DBSCAN',
  theoryOriginalText:
    'В классическом DBSCAN minPts проверяется локально для каждой точки. По числу соседей точку относят к одному из типов:',
  theoryCoreTitle: 'Core-точка',
  theoryCoreText:
    'имеет не меньше minPts точек в своей окрестности радиуса R.',
  theoryBorderTitle: 'Border-точка',
  theoryBorderText:
    'сама не набирает minPts соседей, но находится рядом с core-точкой и может войти в её кластер.',
  theoryNoiseTitle: 'Шумовая точка',
  theoryNoiseText:
    'не является core-точкой и не присоединяется к кластеру через соседнюю core-точку.',
  theoryDifferenceCallout:
    'Эта визуализация использует более простое правило: сначала растит связную группу по радиусу R, а затем проверяет размер всей группы. Она не различает core- и border-точки и не является полной реализацией классического DBSCAN.',
  theoryTradeoffsTitle: 'Сильные стороны и ограничения',
  theoryStrengthsTitle: 'Сильные стороны',
  theoryStrengths: [
    'Не нужно задавать число кластеров заранее.',
    'Плотностные методы могут находить группы сложной формы.',
    'Отдельные точки можно оставить за пределами кластеров как шум.',
  ],
  theoryLimitationsTitle: 'Ограничения',
  theoryLimitations: [
    'Результат чувствителен к выбору R: слишком малый радиус дробит группы, слишком большой — сливает их.',
    'Одно значение радиуса может плохо подходить группам с сильно разной плотностью.',
    'Параметры часто приходится подбирать под масштаб и устройство данных.',
  ],
  theorySummaryTitle: 'Шпаргалка перед ответом',
  theoryTerms: [
    { term: 'R', definition: 'максимальное расстояние для соседства; здесь расстояние должно быть строго меньше R.' },
    { term: 'minPts', definition: 'минимальное число точек в завершённой группе, чтобы она считалась кластером в этой упрощённой модели.' },
    { term: 'Кластер', definition: 'группа точек, связанная цепочками соседей и прошедшая проверку minPts.' },
    { term: 'Шум', definition: 'в этой модели — все точки группы, размер которой меньше minPts.' },
  ],
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
  resetButton: 'Сбросить',
  resetParamLabel: (label: string) => `Сбросить ${label}`,
  clearCanvasButton: 'Очистить холст',
  startButton: 'Начать',
  nextButton: 'Далее',
  drawToolLabel: 'Рисование',
  eraseToolLabel: 'Стирание',
  pointLimitReached: 'Достигнут лимит точек: 1024',
  stepTitle: (n: number) => `Шаг ${n}`,
  noClusterSteps: [
    'Нажмите на кнопку выше.',
    'Выбираем произвольную точку.',
    'Ищем все соседние точки... Хм, странно. Кажется, эта точка — шум.',
    'Ну ладно, бывает. Выбираем другую точку.',
    'Ищем соседей... И тут пусто. Что же такое?',
    'Пробуем ещё раз, вдруг повезёт.',
    'Не повезло. Проверяем остальные точки: та же история.',
    'Может, дело не в точках. Не слишком ли большой minPts?',
    'Проверяем все точки до последней: кластеров нет.',
    'Готово! Кластеров: 0, шум: {countNoise} точек. Попробуйте уменьшить minPts или увеличить R.',
  ],
  singleClusterSummary: (noiseCount: number) =>
    noiseCount === 0
      ? 'Вот и всё: один кластер, точек шума нет.'
      : `Вот и всё: один кластер, точек шума — ${noiseCount}.`,
  steps: [
    'Нажмите кнопку выше, чтобы начать изучение',
    'Выбираем случайную точку и добавляем её в первый кластер',
    'Найдём всех её соседей — точки, расстояние до которых меньше R',
    'Среди них выберем случайную ещё не проверенную точку',
    'Найдём её соседей и тоже добавим в кластер',
    'Проверяем новые точки одну за другой. Когда ни одна из них больше не добавляет соседей — кластер готов',
    'Выберем случайную точку вне кластеров',
    'Найдём её соседей и начнём с них новый кластер',
    'Повторяем, пока все точки не окажутся в своих кластерах',
    'Готово! Всего кластеров: {count}, точек шума: {noise}. Отличная работа!',
  ] ,
  footerAuthor: 'Создатель: Nikita Shvedov',
  footerTelegram: 'Telegram канал',
  footerVk: 'ВКонтакте',
  footerGithub: 'GitHub',
  footerLove: 'Создано с любовью для школьников и студентов',
  footerNote:
    'Это упрощённая визуализация DBSCAN. Кластеры растут по радиусу соседства R, а группы меньше minPts считаются шумом. Оригинальный алгоритм дополнительно различает core- и border-точки.',
}

export type Dictionary = typeof ru

export const en: Dictionary = {
  logo: 'DB SCAN',
  languageLabel: 'Switch language',
  languageRu: 'Ru',
  languageEn: 'En',
  themeToggleLabel: 'Toggle theme',
  themeWarningMessage: 'Warning! Flash incoming in {count}',
  themeWarningCancel: 'Cancel',
  pageSwitcherLabel: 'Page switcher',
  visualLabel: 'Visualization',
  theoryLabel: 'Theory',
  canvasAria: 'Visualization area',
  codeTitle: 'Code',
  codeTabsLabel: 'Code language',
  codeCopyButton: 'Copy code',
  codeCopySuccess: 'Copied',
  codeCopyFailure: 'Could not copy code',
  theoryPageTitle: 'DBSCAN: finding groups by density',
  theoryIntro:
    'A quick reference to how points join clusters, what R and minPts mean, and how this teaching model differs from the full algorithm.',
  theoryTocTitle: 'Contents',
  theoryWhyTitle: 'Why group data by density?',
  theoryWhyParagraphs: [
    'Imagine a map of coffee shops: some stand alone, while others line a busy street. Mark each shop as a point, and dense patches reveal popular areas while isolated places sit apart.',
    'Density-based methods do not need to know the number of groups in advance. They look for regions where points are close together and can find groups of different shapes separated by sparse areas.',
  ],
  theoryWhyCallout:
    'Unlike splitting data into a preset number of groups, a density-based approach looks for concentrations first instead of assigning every point to one of a fixed set of groups.',
  theoryIdeaTitle: 'The simplified DBSCAN used on this site',
  theoryIdeaParagraphs: [
    'The algorithm starts with one point that has not been assigned yet. It adds nearby points, then checks the neighbors of those newly added points, growing the group until no new points are found.',
    'When a group is complete, its size is compared with minPts. A group large enough counts as a cluster; a smaller group is marked entirely as noise.',
  ],
  theoryIdeaRadius: 'Points closer than radius R are neighbors.',
  theoryIdeaGrowth: 'Points connected through chains of neighbors can grow into one group.',
  theoryIdeaNoise: 'A group smaller than minPts becomes noise.',
  theoryParametersTitle: 'Two parameters that shape the result',
  theoryRadiusTitle: 'R: the neighborhood radius',
  theoryRadiusText:
    'Two points are neighbors when their distance is strictly less than R. Picture a circle around a point: increasing R widens the area where neighbors can be found.',
  theoryExampleLabel: 'Example.',
  theoryRadiusExample:
    'if R is too small, chains of connections break into tiny groups; after the minPts check, many or nearly all points may become noise. A larger R can instead join separate patches.',
  theoryMinPtsTitle: 'minPts: the minimum group size',
  theoryMinPtsText:
    'After a group stops growing, its size is compared with minPts. In this teaching version, the threshold applies to the whole group, not to each point individually.',
  theoryMinPtsExample:
    'if a group has 5 points and minPts is 6, the entire group is marked as noise. The higher the threshold, the more finished groups fail the check.',
  theoryStepsTitle: 'The algorithm, step by step',
  theoryStepsIntro:
    'The visualization presents the process as nine button presses. During a growth press, the algorithm may repeatedly pick another group point and collect its new neighbors.',
  theorySteps: [
    { title: '1. Pick a point', text: 'Choose a starting point at random from the points not yet assigned to a group.' },
    { title: '2. Find its neighbors', text: 'Add every unassigned point less than R away to the group.' },
    { title: '3. Pick a point in the group', text: 'Choose an added point whose neighbors have not been checked yet.' },
    { title: '4. Collect new neighbors', text: 'Add unassigned points within R of the chosen point to the same group.' },
    { title: '5. Keep growing', text: 'Repeat steps 3 and 4 until no point in the group adds new neighbors.' },
    { title: '6. Start another group', text: 'If unassigned points remain, choose one as the starting point of a new cluster.' },
    { title: '7. Find the new point’s neighbors', text: 'Add unassigned points within its radius to the new group.' },
    { title: '8. Repeat for the remaining points', text: 'Grow each new group in the same way until nothing remains unassigned.' },
    { title: '9. Check group size', text: 'Recolor each finished group smaller than minPts as noise; the others remain clusters.' },
  ],
  theoryCodePickLabel: 'Pick a starting point',
  theoryCodeNeighborsLabel: 'Check the radius',
  theoryCodeGrowLabel: 'Grow the group',
  theoryCodeNextLabel: 'Move to the next group',
  theoryCodeFinishLabel: 'Cluster or noise',
  theoryOriginalTitle: 'How this differs from original DBSCAN',
  theoryOriginalText:
    'In classic DBSCAN, minPts is checked locally for each point. The number of neighbors determines its type:',
  theoryCoreTitle: 'Core point',
  theoryCoreText:
    'has at least minPts points in its neighborhood of radius R.',
  theoryBorderTitle: 'Border point',
  theoryBorderText:
    'does not reach minPts neighbors itself, but lies near a core point and may join its cluster.',
  theoryNoiseTitle: 'Noise point',
  theoryNoiseText:
    'is not a core point and cannot join a cluster through a nearby core point.',
  theoryDifferenceCallout:
    'This visualization uses a simpler rule: it first grows a connected group by radius R, then checks the size of the whole group. It does not distinguish core and border points and is not a full implementation of classic DBSCAN.',
  theoryTradeoffsTitle: 'Strengths and limitations',
  theoryStrengthsTitle: 'Strengths',
  theoryStrengths: [
    'You do not need to choose the number of clusters in advance.',
    'Density-based methods can find groups with complex shapes.',
    'Isolated points can be left outside clusters as noise.',
  ],
  theoryLimitationsTitle: 'Limitations',
  theoryLimitations: [
    'The result depends on R: too small can fragment groups; too large can merge them.',
    'One radius may not fit groups with very different densities.',
    'Parameters often need tuning for the scale and structure of the data.',
  ],
  theorySummaryTitle: 'Cram sheet',
  theoryTerms: [
    { term: 'R', definition: 'the neighborhood distance limit; here, distance must be strictly less than R.' },
    { term: 'minPts', definition: 'the minimum number of points in a finished group for it to count as a cluster in this simplified model.' },
    { term: 'Cluster', definition: 'a group connected through chains of neighbors that passes the minPts check.' },
    { term: 'Noise', definition: 'in this model, every point in a group smaller than minPts.' },
  ],
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
  resetButton: 'Reset',
  resetParamLabel: (label: string) => `Reset ${label}`,
  clearCanvasButton: 'Clear canvas',
  startButton: 'Start',
  nextButton: 'Next',
  drawToolLabel: 'Draw',
  eraseToolLabel: 'Erase',
  pointLimitReached: 'Point limit reached: 1024',
  stepTitle: (n: number) => `Step ${n}`,
  noClusterSteps: [
    'Press the button above.',
    'Pick an arbitrary point.',
    'Looking for all its neighbors... Hmm, odd. This point looks like noise.',
    'Well, it happens. Let\'s pick another point.',
    'Looking for neighbors... Nothing here either. What\'s going on?',
    'One more try, maybe we\'ll get lucky.',
    'No luck. Checking the rest of the points: same story.',
    'Maybe it\'s not the points. Is minPts too high?',
    'Checking every last point: no clusters found.',
    'Done! Clusters: 0, noise: {countNoise} points. Try lowering minPts or increasing R.',
  ],
  singleClusterSummary: (noiseCount: number) =>
    noiseCount === 0
      ? "That's it: one cluster, and no noise points."
      : noiseCount === 1
        ? "That's it: one cluster, and one point marked as noise."
        : `That's it: one cluster, and ${noiseCount} points marked as noise.`,
  steps: [
    'Hit the button above to see it in action',
    'We pick a random point and put it in cluster 1',
    "Let's find its neighbors: points closer than R",
    "Now pick a random point from the cluster we haven't checked yet",
    'Find its neighbors and add them to the cluster too',
    'We keep checking new points one by one. Once none of them add new neighbors, the cluster is done',
    "Let's pick a random point outside any cluster",
    'Find its neighbors and start a new cluster with them',
    'We repeat this until every point has a cluster',
    'Done! Total clusters: {count}, noise points: {noise}. Nice work!',
  ],
  footerAuthor: 'Created by Nikita Shvedov',
  footerTelegram: 'Telegram channel',
  footerVk: 'VK',
  footerGithub: 'GitHub',
  footerLove: 'Made with love for school and university students',
  footerNote:
    'This is a simplified visualization of DBSCAN. Clusters grow by the neighbor radius R, and groups smaller than minPts are treated as noise. The original algorithm also distinguishes core and border points.',
}

export const dictionaries = { ru, en } as const