export const supportedLanguages = ['ru', 'en'] as const

export type Language = (typeof supportedLanguages)[number]

export const defaultLanguage: Language = 'ru'

export const scaffoldText = {
	logo: '# DB SCAN',
	languageLabel: 'Переключение языка',
	themeToggleLabel: 'Переключить тему',
	pageSwitcherLabel: 'Переключение страниц',
	visualizationLabel: 'Визуализация',
	visualizationTitle: 'DBSCAN Visual',
	visualizationDescription:
		'Интерактивная визуализация будет создана на следующем шаге разработки.',
	theoryTitle: 'Теория',
	footerAuthor: 'Создатель: Nikita Shvedov',
	footerTelegram: 'Telegram',
	footerGithub: 'GitHub',
	footerLove: 'Создано с любовью для школьников и студентов',
	footerNote:
		'Это упрощённая визуализация DBSCAN. Кластеры растут по радиусу соседства R, а группы меньше minPts считаются шумом. Оригинальный алгоритм дополнительно различает core- и border-точки.',
} as const