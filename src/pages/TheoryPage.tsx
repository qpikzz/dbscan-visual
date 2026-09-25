import { useLanguage } from '../i18n'
import { Reveal } from '../components/Reveal'

export function TheoryPage() {
  const { t } = useLanguage()

  return (
    <section aria-labelledby="theory-title">
      <Reveal>
        <h1 id="theory-title">{t.theoryLabel}</h1>
      </Reveal>
    </section>
  )
}