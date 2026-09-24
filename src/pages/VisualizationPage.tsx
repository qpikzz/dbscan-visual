import { scaffoldText } from '../i18n'

export function VisualizationPage() {
  return (
    <section className="page-intro" aria-labelledby="visualization-title">
      <p className="eyebrow">{scaffoldText.visualizationLabel}</p>
      <h1 id="visualization-title">{scaffoldText.visualizationTitle}</h1>
      <p>{scaffoldText.visualizationDescription}</p>
    </section>
  )
}