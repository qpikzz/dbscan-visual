import type { MouseEvent } from 'react'
import { Highlight } from 'prism-react-renderer'
import type { PrismTheme } from 'prism-react-renderer'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Reveal } from '../components/Reveal'
import { useMotionSettings } from '../hooks/useMotionSettings'
import { useLanguage } from '../i18n'
import '../styles/visualization.css'

const theoryCodeTheme: PrismTheme = {
  plain: { color: 'var(--text)', backgroundColor: 'transparent' },
  styles: [
    {
      types: ['comment', 'prolog', 'doctype', 'cdata'],
      style: { color: 'var(--code-comment)', fontStyle: 'italic' },
    },
    {
      types: ['keyword', 'atrule', 'rule', 'important'],
      style: { color: 'var(--code-keyword)' },
    },
    {
      types: ['string', 'char', 'attr-value', 'inserted'],
      style: { color: 'var(--code-string)' },
    },
    {
      types: ['number', 'boolean', 'constant'],
      style: { color: 'var(--code-number)' },
    },
    {
      types: ['function', 'method', 'selector', 'tag'],
      style: { color: 'var(--code-function)' },
    },
    {
      types: ['class-name', 'title', 'attr-name', 'builtin'],
      style: { color: 'var(--code-class)' },
    },
    {
      types: ['operator', 'punctuation', 'symbol', 'url'],
      style: { color: 'var(--code-operator)' },
    },
  ],
}

const pseudocode = {
  pick: 'seed = choose(unassigned)',
  neighbors: 'neighbors = {p in unassigned | distance(seed, p) < R}',
  grow: [
    'frontier = {seed}',
    'while frontier is not empty:',
    '    fresh = neighbors of frontier in unassigned',
    '    group = group union fresh',
    '    unassigned = unassigned minus fresh',
    '    frontier = fresh',
  ].join('\n'),
  nextCluster: [
    'if unassigned is empty:',
    '    stop',
    'seed = choose(unassigned)',
    'start a new group',
  ].join('\n'),
  finish: [
    'if size(group) < minPts:',
    '    mark group as noise',
    'else:',
    '    save group as a cluster',
  ].join('\n'),
}

type TheoryCodeProps = {
  code: string
  label: string
}

function TheoryCode({ code, label }: TheoryCodeProps) {
  return (
    <figure className="theory-code">
      <figcaption>{label}</figcaption>
      <Highlight code={code} language="javascript" theme={theoryCodeTheme}>
        {({ tokens, getLineProps, getTokenProps }) => (
          <pre className="code-pre">
            <ol className="code-gutter" aria-hidden="true">
              {tokens.map((_, index) => (
                <li key={index}>{index + 1}</li>
              ))}
            </ol>
            <code className="code-lines">
              {tokens.map((line, index) => (
                <div key={index} {...getLineProps({ line })}>
                  {line.map((token, tokenIndex) => (
                    <span key={tokenIndex} {...getTokenProps({ token })} />
                  ))}
                </div>
              ))}
            </code>
          </pre>
        )}
      </Highlight>
    </figure>
  )
}

export function TheoryPage() {
  const { t } = useLanguage()
  const location = useLocation()
  const navigate = useNavigate()
  const { reduced } = useMotionSettings()
  const sections = [
    { id: 'theory-why', title: t.theoryWhyTitle },
    { id: 'theory-idea', title: t.theoryIdeaTitle },
    { id: 'theory-parameters', title: t.theoryParametersTitle },
    { id: 'theory-walkthrough', title: t.theoryStepsTitle },
    { id: 'theory-original', title: t.theoryOriginalTitle },
    { id: 'theory-tradeoffs', title: t.theoryTradeoffsTitle },
    { id: 'theory-summary', title: t.theorySummaryTitle },
  ]

  function goToSection(event: MouseEvent<HTMLAnchorElement>, id: string) {
    event.preventDefault()
    navigate(
      { pathname: location.pathname, hash: `#${id}` },
      { preventScrollReset: true },
    )
    document.getElementById(id)?.scrollIntoView({
      behavior: reduced ? 'instant' : 'smooth',
      block: 'start',
    })
  }

  return (
    <section className="theory-page" aria-labelledby="theory-page-title">
      <nav className="theory-toc viz-card" aria-labelledby="theory-toc-title">
        <h2 id="theory-toc-title">{t.theoryTocTitle}</h2>
        <ol>
          {sections.map((section) => (
            <li key={section.id}>
              <Link
                to={{ pathname: location.pathname, hash: `#${section.id}` }}
                onClick={(event) => goToSection(event, section.id)}
              >
                {section.title}
              </Link>
            </li>
          ))}
        </ol>
      </nav>

      <div className="theory-content">
        <Reveal>
          <header className="theory-intro">
            <p className="theory-eyebrow">{t.theoryLabel}</p>
            <h1 id="theory-page-title">{t.theoryPageTitle}</h1>
            <p>{t.theoryIntro}</p>
          </header>
        </Reveal>

        <Reveal>
          <article className="theory-card viz-card" id="theory-why">
            <h2>{t.theoryWhyTitle}</h2>
            {t.theoryWhyParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <blockquote className="theory-callout">
              <p>{t.theoryWhyCallout}</p>
            </blockquote>
          </article>
        </Reveal>

        <Reveal>
          <article className="theory-card viz-card" id="theory-idea">
            <h2>{t.theoryIdeaTitle}</h2>
            {t.theoryIdeaParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <ul className="theory-bullet-list">
              <li>{t.theoryIdeaRadius}</li>
              <li>{t.theoryIdeaGrowth}</li>
              <li>{t.theoryIdeaNoise}</li>
            </ul>
          </article>
        </Reveal>

        <Reveal>
          <article className="theory-card viz-card" id="theory-parameters">
            <h2>{t.theoryParametersTitle}</h2>
            <div className="theory-parameter-grid">
              <section className="theory-parameter">
                <h3>{t.theoryRadiusTitle}</h3>
                <p>{t.theoryRadiusText}</p>
                <p className="theory-example">
                  <strong>{t.theoryExampleLabel}</strong> {t.theoryRadiusExample}
                </p>
              </section>
              <section className="theory-parameter">
                <h3>{t.theoryMinPtsTitle}</h3>
                <p>{t.theoryMinPtsText}</p>
                <p className="theory-example">
                  <strong>{t.theoryExampleLabel}</strong> {t.theoryMinPtsExample}
                </p>
              </section>
            </div>
          </article>
        </Reveal>

        <Reveal>
          <article className="theory-card viz-card" id="theory-walkthrough">
            <h2>{t.theoryStepsTitle}</h2>
            <p>{t.theoryStepsIntro}</p>
            <ol className="theory-steps">
              {t.theorySteps.map((step) => (
                <li key={step.title}>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </li>
              ))}
            </ol>
            <div className="theory-pseudocode">
              <TheoryCode code={pseudocode.pick} label={t.theoryCodePickLabel} />
              <TheoryCode code={pseudocode.neighbors} label={t.theoryCodeNeighborsLabel} />
              <TheoryCode code={pseudocode.grow} label={t.theoryCodeGrowLabel} />
              <TheoryCode code={pseudocode.nextCluster} label={t.theoryCodeNextLabel} />
              <TheoryCode code={pseudocode.finish} label={t.theoryCodeFinishLabel} />
            </div>
          </article>
        </Reveal>

        <Reveal>
          <article className="theory-card viz-card" id="theory-original">
            <h2>{t.theoryOriginalTitle}</h2>
            <p>{t.theoryOriginalText}</p>
            <dl className="theory-point-types">
              <div>
                <dt>{t.theoryCoreTitle}</dt>
                <dd>{t.theoryCoreText}</dd>
              </div>
              <div>
                <dt>{t.theoryBorderTitle}</dt>
                <dd>{t.theoryBorderText}</dd>
              </div>
              <div>
                <dt>{t.theoryNoiseTitle}</dt>
                <dd>{t.theoryNoiseText}</dd>
              </div>
            </dl>
            <blockquote className="theory-callout">
              <p>{t.theoryDifferenceCallout}</p>
            </blockquote>
          </article>
        </Reveal>

        <Reveal>
          <article className="theory-card viz-card" id="theory-tradeoffs">
            <h2>{t.theoryTradeoffsTitle}</h2>
            <div className="theory-tradeoff-grid">
              <section>
                <h3>{t.theoryStrengthsTitle}</h3>
                <ul className="theory-bullet-list">
                  {t.theoryStrengths.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
              <section>
                <h3>{t.theoryLimitationsTitle}</h3>
                <ul className="theory-bullet-list">
                  {t.theoryLimitations.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            </div>
          </article>
        </Reveal>

        <Reveal>
          <article className="theory-card theory-summary viz-card" id="theory-summary">
            <h2>{t.theorySummaryTitle}</h2>
            <dl>
              {t.theoryTerms.map((item) => (
                <div key={item.term}>
                  <dt>{item.term}</dt>
                  <dd>{item.definition}</dd>
                </div>
              ))}
            </dl>
          </article>
        </Reveal>
      </div>
    </section>
  )
}