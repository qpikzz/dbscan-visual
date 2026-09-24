import { scaffoldText } from '../i18n'

export function TheoryPage() {
  return (
    <section aria-labelledby="theory-title">
      <h1 id="theory-title">{scaffoldText.theoryTitle}</h1>
    </section>
  )
}