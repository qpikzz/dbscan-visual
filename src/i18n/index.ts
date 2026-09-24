export const supportedLanguages = ['ru', 'en'] as const

export type Language = (typeof supportedLanguages)[number]

export const defaultLanguage: Language = 'ru'

export const scaffoldText = {
	logo: '# DB SCAN',
	status: 'Каркас проекта',
	visualizationLabel: 'Визуализация',
	visualizationTitle: 'DBSCAN Visual',
	visualizationDescription:
		'Интерактивная визуализация будет создана на следующем шаге разработки.',
	theoryTitle: 'Теория',
} as const