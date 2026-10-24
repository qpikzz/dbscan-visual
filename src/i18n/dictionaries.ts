export const supportedLanguages = ['ru', 'en'] as const

export type Language = (typeof supportedLanguages)[number]

export const defaultLanguage: Language = 'ru'

export const ru = {
  logo: 'DB SCAN',
  languageLabel: 'Переключить язык',
  languageRu: 'Ru',
  languageEn: 'En',
  themeToggleLabel: 'Переключить тему',
  themeWarningMessage: 'Внимание! Вспышка\nчерез {count}',
  themeWarningCancel: 'Отмена',
  pageSwitcherLabel: 'Переключение страниц',
  headerMenuLabel: 'Меню',
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
  theoryCollapseLabel: (title: string) => `Свернуть раздел: ${title}`,
  theoryExpandLabel: (title: string) => `Развернуть раздел: ${title}`,
  calloutNoteLabel: 'Заметка',
  calloutImportantLabel: 'Важно',
  theoryWhyTitle: 'Что такое DBSCAN',
  theoryWhyP1:
    'Представьте карту города, на которой отмечено каждое кафе. Где-то кафе стоят по одному, а где-то собираются в целые «кварталы». Глазами вы сразу видите эти скопления. DBSCAN учит компьютер делать то же самое: находить места, где точки стоят плотно, и отделять их от одиночек.',
  theoryWhyP2:
    'Название расшифровывается как Density-Based Spatial Clustering of Applications with Noise: «пространственная кластеризация на основе плотности, устойчивая к шуму». Главное слово здесь «плотность».',
  theoryWhyMain1:
    'Кластер — это область, где точки стоят достаточно плотно. Точки, которые не вошли ни в одну такую область, считаются шумом.',
  theoryWhySubNeed: 'Зачем это нужно',
  theoryWhyNeed1:
    'Не нужно заранее говорить, сколько групп искать. Алгоритм находит их сам.',
  theoryWhyNeed2:
    'Группы могут быть любой формы: кольцо, полумесяц, вытянутая цепочка.',
  theoryWhyNeed3:
    'Одиночные точки не приписываются к чужим группам, а честно помечаются как шум.',
  theoryWhySubWhere: 'Где применяется',
  theoryWhyWhere1:
    'Геоданные: скопления происшествий, остановок, заказов на карте.',
  theoryWhyWhere2:
    'Поиск аномалий: странные операции, сбои датчиков, выбросы.',
  theoryWhyWhere3:
    'Группировка похожих объектов по двум и более признакам.',
  theoryWhyMain2:
    'Плотность — единственная идея, которую нужно унести из этого раздела.',
  theoryTermsTitle: 'Термины простыми словами',
  theoryTermsIntro:
    'Всё держится на двух числах и одной идее. Разберём их по очереди.',
  theoryTermPoint: 'Точка',
  theoryTermPointDef: 'Объект на плоскости с координатами (x, y).',
  theoryTermDistance: 'Расстояние',
  theoryTermDistanceDef:
    'Длина прямой между двумя точками. Формула — ниже, а на сетке Canvas её легко проверить линейкой.',
  theoryDistanceFormulaCaption: 'Расстояние между точками P и Q',
  theoryTermRadius: 'Радиус R',
  theoryTermRadiusDef:
    'Насколько близко должны стоять две точки, чтобы считаться соседями. Если расстояние между ними меньше R, это соседи. Представьте вокруг точки круг радиуса R: всё, что попало внутрь, её соседи. В нашей модели сравнение строгое: «меньше R», а не «не больше R».',
  theoryTermChain: 'Цепочка',
  theoryTermChainDef:
    'Соседи соседей тоже входят в группу. Если A рядом с B, а B рядом с C, то A, B и C в одной группе, даже если A и C далеко друг от друга. Так группа «растёт» вдоль скопления.',
  theoryTermMinPts: 'minPts',
  theoryTermMinPtsDef:
    'Минимальный размер группы, чтобы считаться кластером. Если в получившейся группе меньше minPts точек, она считается шумом.',
  theoryTermClusterNoise: 'Кластер и шум',
  theoryTermClusterNoiseDef:
    'Кластер — группа, в которой не меньше minPts точек. Шум — всё остальное.',
  theoryTermsImportant:
    'У minPts в оригинальном DBSCAN другой смысл: это число соседей у отдельной точки, а не размер всей группы. Об этом подробно в разделе «Чем наша модель отличается от оригинала». Пока запомните версию нашего сайта.',
  theoryTermsMain:
    'R отвечает на вопрос «кто сосед», а minPts — на вопрос «достаточно ли нас, чтобы быть кластером».',
  theoryWalkTitle: 'Алгоритм по шагам',
  theoryWalkIntro:
    'Алгоритм короткий. Весь трюк в том, что группа растёт, как пятно краски: пока есть новые соседи, пятно расползается.',
  theoryWalkStep1Title: 'Выбрать свободную точку',
  theoryWalkStep1Text:
    'Выберите любую точку, которая ещё не попала ни в одну группу. Это начало новой группы.',
  theoryWalkStep2Title: 'Найти её соседей',
  theoryWalkStep2Text:
    'Найдите всех её соседей (расстояние меньше R) среди ещё не распределённых точек и добавьте в группу.',
  theoryWalkStep3Title: 'Проверять новые точки',
  theoryWalkStep3Text:
    'Для каждой новой точки группы найдите её соседей и тоже добавьте. Повторяйте, пока новые соседи не закончатся.',
  theoryWalkStep4Title: 'Проверить размер',
  theoryWalkStep4Text:
    'Посчитайте точки в группе. Не меньше minPts: это кластер. Меньше: это шум.',
  theoryWalkStep5Title: 'Повторить для остальных',
  theoryWalkStep5Text:
    'Если остались нераспределённые точки, вернитесь к шагу 1.',
  theoryWalkNote:
    'В нашей модели результат не зависит от того, с какой точки начать. Группы получатся одни и те же. В оригинальном DBSCAN это не всегда так (см. раздел «Чем наша модель отличается от оригинала»).',
  theoryExampleFigureTitle: 'Схема группировки точек DBSCAN',
  theoryExampleClusterLabel: 'Кластер',
  theoryExampleNoiseLabel: 'Шум',
  theoryExampleBridgeLabel: 'мостик',
  theoryFormulaLoadError:
    'Не удалось загрузить отображение формулы. Показана текстовая запись.',
  theoryWalkLinkText: 'Посмотреть на настоящих точках',
  theoryParamsTitle: 'Как R и minPts меняют результат',
  theoryParamsIntro:
    'Лучший способ понять параметры — менять их по одному и смотреть, что переехало. Вот что вы увидите.',
  theoryParamsTableParam: 'Параметр',
  theoryParamsTableEffect: 'Что происходит',
  theoryParamsRow1Param: 'R слишком мал',
  theoryParamsRow1Effect:
    'Почти все точки остаются одиночками, много шума, настоящие скопления распадаются на куски.',
  theoryParamsRow2Param: 'R слишком велик',
  theoryParamsRow2Effect:
    'Разные скопления склеиваются в одно, шума почти нет.',
  theoryParamsRow3Param: 'minPts слишком мал',
  theoryParamsRow3Effect:
    'Даже случайная пара точек считается кластером, шум почти пропадает.',
  theoryParamsRow4Param: 'minPts слишком велик',
  theoryParamsRow4Effect:
    'Мелкие, но настоящие группы объявляются шумом.',
  theoryOrigTitle: 'Чем наша модель отличается от оригинала',
  theoryOrigIntro:
    'Мы специально упростили алгоритм: сначала нужно понять саму идею плотности, а детали можно добавлять потом. Вот чем оригинал сложнее.',
  theoryOrigSubKinds: 'Три вида точек в оригинале',
  theoryOrigCore: 'Основная точка (core)',
  theoryOrigCoreDef:
    'У неё в радиусе ε есть не менее minPts точек (обычно включая её саму). Только основные точки могут «расширять» кластер.',
  theoryOrigBorder: 'Граничная точка (border)',
  theoryOrigBorderDef:
    'Сама не основная, но лежит в радиусе основной точки. Её присоединяют к кластеру, но дальше через неё группа не растёт.',
  theoryOrigNoiseTerm: 'Шум',
  theoryOrigNoiseDef:
    'Не основная точка и не лежит рядом ни с одной основной.',
  theoryOrigExam:
    'В задачах ЕГЭ по информатике на кластеризацию обычно достаточно логики упрощённой модели: различать основные и граничные точки не нужно. Но всегда внимательно читайте условие — в нём могут быть заданы правила, отличающиеся от нашей модели, например строгое или нестрогое сравнение расстояния. Различие между основными и граничными точками важно для понимания оригинального DBSCAN, например в библиотеках машинного обучения.',
  theoryOrigSubDiff: 'Что у нас иначе',
  theoryOrigTableOrig: 'В оригинале',
  theoryOrigTableOurs: 'В нашей модели',
  theoryOrigRow1Orig: 'minPts — число соседей у точки.',
  theoryOrigRow1Ours: 'minPts — размер итоговой группы.',
  theoryOrigRow2Orig: 'Кластер растёт только через основные точки.',
  theoryOrigRow2Ours: 'Кластер растёт через любого соседа.',
  theoryOrigRow3Orig: 'Граничные точки есть.',
  theoryOrigRow3Ours: 'Граничных точек нет, все точки равноправны.',
  theoryOrigRow4Orig:
    'Граничная точка между двумя кластерами может достаться любому из них — зависит от порядка обхода.',
  theoryOrigRow4Ours: 'Результат один и тот же.',
  theoryOrigRow5Orig: 'Во многих реализациях сравнение «не больше ε».',
  theoryOrigRow5Ours: 'У нас сравнение строгое: «меньше R».',
  theoryOrigBridge:
    'Из-за этого на тех же точках наша модель и оригинал могут дать немного разные результаты. Цепочка тонких «мостиков» в нашей модели склеивает кластеры, а в оригинале её остановили бы требования к основным точкам.',
  theoryOrigMain:
    'Идея одна и та же — кластер — это плотная область. Различаются только детали проверки.',
  theoryTradeTitle: 'Сильные и слабые стороны',
  theoryTradeSubPros: 'Сильные стороны',
  theoryTradePro1:
    'Не нужно заранее задавать число кластеров.',
  theoryTradePro2:
    'Находит группы произвольной формы.',
  theoryTradePro3:
    'Сам выделяет шум.',
  theoryTradePro4:
    'Идея простая, всего два параметра.',
  theoryTradeSubCons: 'Слабые стороны',
  theoryTradeCon1:
    'Результат сильно зависит от R и minPts, подбор требует проб.',
  theoryTradeCon2:
    'Один R на весь набор: если одно скопление густое, а другое разреженное, одним радиусом оба хорошо не поймать.',
  theoryTradeCon3:
    '«Мостики» и цепочки: несколько точек между скоплениями могут склеить их в один кластер.',
  theoryTradeCon4:
    'Много признаков: в многомерных данных расстояния теряют смысл и плотность оценивается плохо.',
  theoryTradeCon5:
    'Скорость: наивный поиск соседей перебирает все пары точек, что медленно на больших наборах.',
  theoryTradeSubWhen: 'Когда подходит, а когда нет',
  theoryTradeWhenYes: 'Когда подходит',
  theoryTradeYes1:
    'Скопления разной формы, выбросы нужно честно отделить, а плотность везде примерно одинакова.',
  theoryTradeYes2:
    'Число групп заранее неизвестно.',
  theoryTradeNo1:
    'Плотность сильно различается от места к месту.',
  theoryTradeNo2:
    'Признаков очень много.',
  theoryTradeWhenNo: 'Когда не подходит',
  theoryTradeMain:
    'DBSCAN хорош там, где важна плотность и нужно честно отделить шум. Ни один алгоритм не лучший для всех данных.',
  theorySumTitle: 'Шпаргалка',
  theorySumIdeaSub: 'Идея в одной строке',
  theorySumIdeaText: 'Кластер — плотная область, остальное — шум.',
  theorySumTermsSub: 'Термины',
  theorySumTerm1: 'Сосед — расстояние меньше R.',
  theorySumTerm2: 'Цепочка — соседи соседей в одной группе.',
  theorySumTerm3: 'minPts — минимальный размер группы.',
  theorySumTerm4: 'Шум — группа меньше minPts.',
  theorySumAlgoSub: 'Алгоритм',
  theorySumAlgoText:
    'Выбрать точку → собрать соседей → продолжать для новых точек → проверить размер → повторить.',
  theorySumParamsSub: 'Параметры',
  theorySumParamsText:
    'R меньше — больше шума и дробления. R больше — склеивание. minPts больше — больше шума.',
  theorySumErrorsSub: 'Типичные ошибки',
  theorySumError1:
    'Путать minPts из нашей модели с minPts из оригинала.',
  theorySumError2:
    'Думать, что результат зависит от стартовой точки (у нас не зависит).',
  theorySumError3:
    'Считать шум «ошибкой» (это информация).',
  theorySumError4:
    'Менять R и minPts одновременно и не понимать, что поменялось.',
  theorySumError5:
    'Забывать, что у нас сравнение строгое (меньше R), а в условии задачи оно может быть другим.',
  theorySumQuizSub: 'Проверьте себя',
  theoryQuiz1Title:
    'Почему A и D из примера в одном кластере, хотя далеки?',
  theoryQuiz1Text:
    'Их связывает цепочка через B и C: A рядом с B, B рядом с C, а C рядом с D.',
  theoryQuiz2Title: 'Что произойдёт с шумом, если увеличить minPts?',
  theoryQuiz2Text:
    'Шума станет больше: больше групп не пройдёт проверку размера.',
  theoryQuiz3Title: 'Чем minPts в оригинале отличается от нашего?',
  theoryQuiz3Text:
    'В оригинале это число соседей у точки, а у нас — размер всей группы.',
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
    'Среди них выберем случайную, ещё не проверенную точку',
    'Найдём её соседей и тоже добавим в кластер',
    'Проверяем новые точки одну за другой. Когда ни одна из них больше не добавляет соседей — кластер готов',
    'Выберем случайную точку вне кластеров',
    'Найдём её соседей и начнём с них новый кластер',
    'Повторяем, пока все точки не окажутся в своих кластерах',
    'Готово! Всего кластеров: {count}, точек шума: {noise}. Отличная работа!',
  ] ,
  footerBrandName: 'DBSCAN',
  footerSiteTitle: 'Сайт',
  footerAuthorTitle: 'Автор',
  footerMoreTitle: 'Прочее',
  footerCopyrightAuthor: 'Шведов Никита',
  footerAvailability: 'Открыт к стажировкам и вашим проектам',
  footerExternalNewTab: 'Откроется в новой вкладке',
  footerCopyright: (year: string, name: string) =>
    `© ${year} ${name}. Все права защищены.`,
  footerTelegram: 'Telegram канал',
  footerVk: 'ВКонтакте',
  footerGithub: 'GitHub',
  footerDataInfo: 'Сбор данных',
  footerLove: 'Создано с любовью для школьников и студентов',
  footerNote:
    'Это упрощённая визуализация DBSCAN. Кластеры растут по радиусу соседства R, а группы меньше minPts считаются шумом. Оригинальный алгоритм дополнительно различает core- и border-точки.',
  dataInfoTitle: 'Сбор данных',
  dataInfoIntro: 'Коротко о том, как сайт обращается с данными.',
  dataInfoCard1Title: 'Ничего не собираем',
  dataInfoCard2Title: 'Настройки — только в браузере',
  dataInfoCard3Title: 'Возможны логи хостинга',
  dataInfoPoint1: 'Сайт не собирает сведения о посетителях и не отправляет их на сервер.',
  dataInfoPoint2:
    'Настройки интерфейса (тема и язык) сохраняются локально в браузере. Технические значения, необходимые для работы страницы, используются в браузере и не отправляются приложением на сервер. Сохранённые настройки можно удалить средствами браузера.',
  dataInfoPoint3:
    'Хостинг-провайдер может вести технические журналы обращений к сайту. Это происходит на стороне провайдера.',
  dataInfoCloseLabel: 'Закрыть окно «Сбор данных»',
  footerSupport: 'Поддержать проект',
  supportTitle: 'Поддержать проект',
  supportP1: 'Спасибо, что решили поддержать этот сайт. Для разработчика это очень важно.',
  supportP2: 'Даже небольшое пожертвование помогает сайту жить и развиваться.',
  supportNote:
    'Важно: пожертвование добровольное и ничего не открывает: платных функций на сайте нет. Взамен вы получите только искреннюю благодарность разработчика ヾ(≧▽≦*)o',
  supportSmall:
    'Оплата проходит на стороне сервиса DonationAlerts. Сайт не получает и не хранит ваши платёжные данные.',
  supportButton: 'Поддержать',
  supportButtonAria: 'Поддержать — ссылка откроется в новой вкладке',
  supportCloseLabel: 'Закрыть окно «Поддержать проект»',
}

export type Dictionary = typeof ru

export const en: Dictionary = {
  logo: 'DB SCAN',
  languageLabel: 'Switch language',
  languageRu: 'Ru',
  languageEn: 'En',
  themeToggleLabel: 'Toggle theme',
  themeWarningMessage: 'Warning! Flash incoming\nin {count}',
  themeWarningCancel: 'Cancel',
  pageSwitcherLabel: 'Page switcher',
  headerMenuLabel: 'Menu',
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
  theoryCollapseLabel: (title: string) => `Collapse section: ${title}`,
  theoryExpandLabel: (title: string) => `Expand section: ${title}`,
  calloutNoteLabel: 'Note',
  calloutImportantLabel: 'Important',
  theoryWhyTitle: 'What DBSCAN is',
  theoryWhyP1:
    'Picture a city map with every cafe marked on it. In some places cafes stand alone, in others they gather into whole “quarters”. Your eyes spot these crowds at once. DBSCAN teaches a computer to do the same: find the places where points stand close together, and separate them from loners.',
  theoryWhyP2:
    'The name stands for Density-Based Spatial Clustering of Applications with Noise. The key word here is “density”.',
  theoryWhyMain1:
    'A cluster is an area where points stand close together. Points that belong to no such area count as noise.',
  theoryWhySubNeed: 'Why you need it',
  theoryWhyNeed1:
    'You never say in advance how many groups to look for. The algorithm finds them on its own.',
  theoryWhyNeed2:
    'Groups can have any shape: a ring, a crescent, a stretched-out chain.',
  theoryWhyNeed3:
    'Lone points are not assigned to other groups; they are honestly marked as noise.',
  theoryWhySubWhere: 'Where it is used',
  theoryWhyWhere1:
    'Geo data: crowds of incidents, stops, or orders on a map.',
  theoryWhyWhere2:
    'Finding anomalies: strange transactions, sensor failures, outliers.',
  theoryWhyWhere3:
    'Grouping similar objects by two or more features.',
  theoryWhyMain2:
    'Density is the single idea to carry out of this section.',
  theoryTermsTitle: 'Terms in plain words',
  theoryTermsIntro:
    'Everything rests on two numbers and one idea. Let us take them one by one.',
  theoryTermPoint: 'Point',
  theoryTermPointDef: 'An object on a plane with coordinates (x, y).',
  theoryTermDistance: 'Distance',
  theoryTermDistanceDef:
    'The length of the straight line between two points. The formula is below, and on the Canvas grid you can easily check it with a ruler.',
  theoryDistanceFormulaCaption: 'Distance between points P and Q',
  theoryTermRadius: 'Radius R',
  theoryTermRadiusDef:
    'How close two points must stand to count as neighbors. If the distance between them is less than R, they are neighbors. Picture a circle of radius R around a point: everything inside it is its neighbor. In our model the comparison is strict: “less than R”, not “R or less”.',
  theoryTermChain: 'Chain',
  theoryTermChainDef:
    'Neighbors of neighbors join the group too. If A is next to B, and B is next to C, then A, B, and C end up in one group, even if A and C are far apart. This is how a group “grows” along a crowd.',
  theoryTermMinPts: 'minPts',
  theoryTermMinPtsDef:
    'The smallest group size that still counts as a cluster. If the finished group holds fewer than minPts points, it counts as noise.',
  theoryTermClusterNoise: 'Cluster and noise',
  theoryTermClusterNoiseDef:
    'A cluster is a group with at least minPts points. Noise is everything else.',
  theoryTermsImportant:
    'In the original DBSCAN, minPts means something else: the number of neighbors of a single point, not the size of the whole group. The section “How our model differs from the original” explains this in detail. For now, remember our site’s version.',
  theoryTermsMain:
    'R answers the question “who is a neighbor”, and minPts answers “are there enough of us to be a cluster”.',
  theoryWalkTitle: 'The algorithm step by step',
  theoryWalkIntro:
    'The algorithm is short. The whole trick is that a group grows like a drop of paint: while new neighbors keep appearing, the stain keeps spreading.',
  theoryWalkStep1Title: 'Pick a free point',
  theoryWalkStep1Text:
    'Choose any point that belongs to no group yet. This starts a new group.',
  theoryWalkStep2Title: 'Find its neighbors',
  theoryWalkStep2Text:
    'Find all of its neighbors (closer than R) among the points not assigned yet, and add them to the group.',
  theoryWalkStep3Title: 'Check each new point',
  theoryWalkStep3Text:
    'For every new point in the group, find its neighbors and add them too. Repeat until no new neighbors appear.',
  theoryWalkStep4Title: 'Check the size',
  theoryWalkStep4Text:
    'Count the points in the group. At least minPts: this is a cluster. Fewer: this is noise.',
  theoryWalkStep5Title: 'Repeat for the rest',
  theoryWalkStep5Text:
    'If points without a group remain, go back to step 1.',
  theoryWalkNote:
    'In our model, the result does not depend on which point you start from. The groups always come out the same. In the original DBSCAN this is not always true (see “How our model differs from the original”).',
  theoryExampleFigureTitle: 'DBSCAN point grouping diagram',
  theoryExampleClusterLabel: 'Cluster',
  theoryExampleNoiseLabel: 'Noise',
  theoryExampleBridgeLabel: 'bridge',
  theoryFormulaLoadError:
    'Could not load formatted math. The text version is shown instead.',
  theoryWalkLinkText: 'See it on real points',
  theoryParamsTitle: 'How R and minPts change the result',
  theoryParamsIntro:
    'The best way to understand the parameters is to change one at a time and watch what moves. Here is what you will see.',
  theoryParamsTableParam: 'Parameter',
  theoryParamsTableEffect: 'What happens',
  theoryParamsRow1Param: 'R is too small',
  theoryParamsRow1Effect:
    'Almost every point stays alone, there is lots of noise, and real crowds fall apart into pieces.',
  theoryParamsRow2Param: 'R is too large',
  theoryParamsRow2Effect:
    'Separate crowds melt into one, and there is almost no noise.',
  theoryParamsRow3Param: 'minPts is too small',
  theoryParamsRow3Effect:
    'Even a random pair of points counts as a cluster, and noise almost disappears.',
  theoryParamsRow4Param: 'minPts is too large',
  theoryParamsRow4Effect:
    'Small but genuine groups are declared noise.',
  theoryOrigTitle: 'How our model differs from the original',
  theoryOrigIntro:
    'We simplified the algorithm on purpose: first you need to feel the idea of density itself, and the details can come later. Here is what makes the original more involved.',
  theoryOrigSubKinds: 'Three kinds of points in the original',
  theoryOrigCore: 'Core point',
  theoryOrigCoreDef:
    'It has at least minPts points within radius ε (usually counting itself). Only core points can grow a cluster.',
  theoryOrigBorder: 'Border point',
  theoryOrigBorderDef:
    'Not a core point itself, but standing within radius of a core point. It joins the cluster, yet the group never grows further through it.',
  theoryOrigNoiseTerm: 'Noise',
  theoryOrigNoiseDef:
    'Neither a core point nor standing next to any core point.',
  theoryOrigExam:
    'In computer science exam clustering tasks, the simplified model is usually enough: you do not need to distinguish core and border points. Still, read each task statement carefully, since its rules may differ from our model, for example by using a strict or non-strict distance comparison. The core/border distinction matters for understanding original DBSCAN, for example in machine-learning libraries.',
  theoryOrigSubDiff: 'What is different here',
  theoryOrigTableOrig: 'In the original',
  theoryOrigTableOurs: 'In our model',
  theoryOrigRow1Orig: 'minPts is the number of neighbors of a point.',
  theoryOrigRow1Ours: 'minPts is the size of the finished group.',
  theoryOrigRow2Orig: 'A cluster grows only through core points.',
  theoryOrigRow2Ours: 'A cluster grows through any neighbor.',
  theoryOrigRow3Orig: 'Border points exist.',
  theoryOrigRow3Ours: 'No border points; every point is equal.',
  theoryOrigRow4Orig:
    'A border point between two clusters may end up in either one, depending on the visiting order.',
  theoryOrigRow4Ours: 'The result is always the same.',
  theoryOrigRow5Orig: 'Many implementations compare as “ε or less”.',
  theoryOrigRow5Ours: 'Here the comparison is strict: “less than R”.',
  theoryOrigBridge:
    'Because of this, our model and the original can give slightly different results on the same points. A chain of thin “bridges” glues clusters together in our model, while the core-point requirements would have stopped it in the original.',
  theoryOrigMain:
    'The idea is the same — a cluster is a dense area. Only the checking details differ.',
  theoryTradeTitle: 'Strengths and weaknesses',
  theoryTradeSubPros: 'Strengths',
  theoryTradePro1:
    'You never set the number of clusters in advance.',
  theoryTradePro2:
    'It finds groups of any shape.',
  theoryTradePro3:
    'It separates noise on its own.',
  theoryTradePro4:
    'The idea is simple, with only two parameters.',
  theoryTradeSubCons: 'Weaknesses',
  theoryTradeCon1:
    'The result depends heavily on R and minPts, and tuning takes some tries.',
  theoryTradeCon2:
    'One R for the whole set: if one crowd is dense and another is sparse, a single radius will not catch both well.',
  theoryTradeCon3:
    '“Bridges” and chains: a few points between crowds can melt them into one cluster.',
  theoryTradeCon4:
    'Many features: in high-dimensional data, distances lose their meaning and density is hard to judge.',
  theoryTradeCon5:
    'Speed: a naive neighbor search checks every pair of points, which is slow on large sets.',
  theoryTradeSubWhen: 'When it fits, and when it does not',
  theoryTradeWhenYes: 'A good fit',
  theoryTradeYes1:
    'Crowds of different shapes, outliers to separate honestly, and roughly the same density everywhere.',
  theoryTradeYes2:
    'The number of groups is unknown in advance.',
  theoryTradeNo1:
    'Density differs a lot from place to place.',
  theoryTradeNo2:
    'There are very many features.',
  theoryTradeWhenNo: 'A poor fit',
  theoryTradeMain:
    'DBSCAN shines where density matters and noise must be separated honestly. No single algorithm is best for every dataset.',
  theorySumTitle: 'Cheat sheet',
  theorySumIdeaSub: 'The idea in one line',
  theorySumIdeaText: 'A cluster is a dense area; everything else is noise.',
  theorySumTermsSub: 'Terms',
  theorySumTerm1: 'Neighbor: distance less than R.',
  theorySumTerm2: 'Chain: neighbors of neighbors in one group.',
  theorySumTerm3: 'minPts: the smallest group size.',
  theorySumTerm4: 'Noise: a group smaller than minPts.',
  theorySumAlgoSub: 'The algorithm',
  theorySumAlgoText:
    'Pick a point → collect neighbors → continue for new points → check the size → repeat.',
  theorySumParamsSub: 'Parameters',
  theorySumParamsText:
    'Smaller R: more noise and splitting. Larger R: merging. Larger minPts: more noise.',
  theorySumErrorsSub: 'Typical mistakes',
  theorySumError1:
    'Mixing up our model’s minPts with the original’s minPts.',
  theorySumError2:
    'Thinking the result depends on the starting point (here it does not).',
  theorySumError3:
    'Treating noise as a “mistake” (it is information).',
  theorySumError4:
    'Changing R and minPts at the same time and not knowing what changed.',
  theorySumError5:
    'Forgetting that our comparison is strict (less than R), while a task may use a different one.',
  theorySumQuizSub: 'Test yourself',
  theoryQuiz1Title:
    'Why are A and D from the example in one cluster, though far apart?',
  theoryQuiz1Text:
    'A chain links them through B and C: A is next to B, B is next to C, and C is next to D.',
  theoryQuiz2Title: 'What happens to noise if you raise minPts?',
  theoryQuiz2Text:
    'There will be more noise: more groups will fail the size check.',
  theoryQuiz3Title: 'How does the original’s minPts differ from ours?',
  theoryQuiz3Text:
    'In the original it is the number of neighbors of a point; here it is the size of the whole group.',
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
  footerBrandName: 'DBSCAN',
  footerSiteTitle: 'Site',
  footerAuthorTitle: 'Author',
  footerMoreTitle: 'More',
  footerCopyrightAuthor: 'Nikita Shvedov',
  footerAvailability: 'Open to internships and your projects',
  footerExternalNewTab: 'Opens in a new tab',
  footerCopyright: (year: string, name: string) =>
    `© ${year} ${name}. All rights reserved.`,
  footerTelegram: 'Telegram channel',
  footerVk: 'VK',
  footerGithub: 'GitHub',
  footerDataInfo: 'Data collection',
  footerLove: 'Made with love for school and university students',
  footerNote:
    'This is a simplified visualization of DBSCAN. Clusters grow by the neighbor radius R, and groups smaller than minPts are treated as noise. The original algorithm also distinguishes core and border points.',
  dataInfoTitle: 'Data collection',
  dataInfoIntro: 'A short note on how this site handles data.',
  dataInfoCard1Title: 'Nothing collected',
  dataInfoCard2Title: 'Settings stay in your browser',
  dataInfoCard3Title: 'Hosting logs may exist',
  dataInfoPoint1: 'The site does not collect visitor information or send it to a server.',
  dataInfoPoint2:
    'Interface settings (theme and language) are stored locally in your browser. Technical values needed for the page to work are used in the browser and are not sent to a server by the app. You can clear saved settings using your browser.',
  dataInfoPoint3:
    'The hosting provider may keep technical access logs. This happens on the provider’s side.',
  dataInfoCloseLabel: 'Close the “Data collection” window',
  footerSupport: 'Support the project',
  supportTitle: 'Support the project',
  supportP1: 'Thank you for wanting to support this site. It means a lot to its developer.',
  supportP2: 'Even a small donation helps the site stay alive and keep growing.',
  supportNote:
    'Please note: donations are voluntary and unlock nothing, because the site has no paid features. In return you get the developer’s sincere gratitude ヾ(≧▽≦*)o',
  supportSmall:
    'The payment is handled by DonationAlerts. This site does not receive or store your payment details.',
  supportButton: 'Support',
  supportButtonAria: 'Support — the link opens in a new tab',
  supportCloseLabel: 'Close the “Support the project” window',
}

export const dictionaries = { ru, en } as const