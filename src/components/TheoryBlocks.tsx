import { useEffect, useMemo, useState } from 'react'
import { Highlight } from 'prism-react-renderer'
import type { PrismTheme } from 'prism-react-renderer'
import { Link } from 'react-router-dom'
import type { TheoryBlock, TheoryTableCell } from '../data/theory'
import { theoryExamplePoints } from '../data/theoryExample'
import { useLanguage } from '../i18n'
import { DbscanExampleFigure } from './DbscanExampleFigure'
import { TheoryIcon } from './TheoryIcons'

type LeafTheoryBlock = Exclude<TheoryBlock, { type: 'sections' }>
type KatexModule = typeof import('katex')
type KatexApi = KatexModule['default']

type TheoryFormulaProps = {
  formula: string
  fallback: string
  captionKey: Extract<TheoryBlock, { type: 'formula' }>['captionKey']
}

function TheoryFormula({ formula, fallback, captionKey }: TheoryFormulaProps) {
  const { t } = useLanguage()
  const [katex, setKatex] = useState<KatexApi | null>(null)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    let active = true
    void Promise.all([
      import('katex'),
      import('katex/dist/katex.min.css'),
    ])
      .then(([module]) => {
        if (active) {
          setKatex(() => module.default)
        }
      })
      .catch((error: unknown) => {
        console.error('Failed to load KaTeX for the Theory page', error)
        if (active) {
          setLoadError(true)
        }
      })
    return () => {
      active = false
    }
  }, [])

  const renderedFormula = useMemo(
    () =>
      katex?.renderToString(formula, {
        displayMode: true,
        throwOnError: false,
        output: 'htmlAndMathml',
        trust: false,
      }) ?? null,
    [formula, katex],
  )

  return (
    <figure className="theory-formula">
      <figcaption>{t[captionKey]}</figcaption>
      <div className="theory-formula__content">
        {renderedFormula ? (
          <div
            className="theory-formula__rendered"
            dangerouslySetInnerHTML={{ __html: renderedFormula }}
          />
        ) : (
          <code className="theory-formula__fallback">{fallback}</code>
        )}
      </div>
      {loadError ? (
        <p className="theory-formula__error" role="alert">
          {t.theoryFormulaLoadError}
        </p>
      ) : null}
    </figure>
  )
}

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

type TheoryBlockContentProps = {
  block: LeafTheoryBlock
  level: number
}

export function TheoryBlockContent({ block, level }: TheoryBlockContentProps) {
  const { t } = useLanguage()

  switch (block.type) {
    case 'paragraph':
      return <p className="theory-text">{t[block.textKey]}</p>

    case 'bullets':
      return (
        <ul className="theory-bullet-list">
          {block.textKeys.map((textKey) => (
            <li key={textKey}>{t[textKey]}</li>
          ))}
        </ul>
      )

    case 'numbered':
      return (
        <ol className="theory-numbered-list">
          {block.items.map((item) => (
            <li key={item.titleKey}>
              <strong className="theory-list-title">{t[item.titleKey]}</strong>
              <span className="theory-list-text">{t[item.textKey]}</span>
            </li>
          ))}
        </ol>
      )

    case 'subheading': {
      const Heading = level <= 0 ? 'h3' : level === 1 ? 'h4' : 'h5'
      return <Heading className="theory-subheading">{t[block.textKey]}</Heading>
    }

    case 'callout':
      return (
        <div className={`theory-callout theory-callout--${block.tone}`}>
          {block.labelKey ? (
            <p className="theory-callout-label">
              <span className="theory-callout-icon">
                <TheoryIcon name={block.tone} />
              </span>
              {t[block.labelKey]}
            </p>
          ) : null}
          <p className="theory-callout-text">{t[block.textKey]}</p>
        </div>
      )

    case 'code':
      return <TheoryCode code={block.code} label={t[block.labelKey]} />

    case 'code-group':
      return (
        <div className="theory-pseudocode">
          {block.items.map((item) => (
            <TheoryCode key={item.labelKey} code={item.code} label={t[item.labelKey]} />
          ))}
        </div>
      )

    case 'terms':
      return (
        <dl className="theory-terms">
          {block.items.map((item) => (
            <div key={item.termKey}>
              <dt>{t[item.termKey]}</dt>
              <dd>{t[item.definitionKey]}</dd>
            </div>
          ))}
        </dl>
      )

    case 'highlight':
      return <p className="theory-highlight">{t[block.textKey]}</p>

    case 'formula':
      return (
        <TheoryFormula
          formula={block.formula}
          fallback={block.fallback}
          captionKey={block.captionKey}
        />
      )

    case 'table':
      return (
        <div className="theory-table-wrap">
          <table className="theory-table">
            <thead>
              <tr>
                {block.headerKeys.map((headerKey) => (
                  <th key={headerKey} scope="col">
                    {t[headerKey]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell: TheoryTableCell, cellIndex: number) => (
                    <td key={cellIndex}>
                      {'textKey' in cell ? t[cell.textKey] : cell.text}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )

    case 'link':
      return (
        <p className="theory-link-row">
          <Link
            className={`theory-link${block.fullWidth ? ' theory-link--full-width' : ''}`}
            to={block.to}
          >
            {t[block.textKey]}
          </Link>
        </p>
      )

    case 'example-figure-group':
      return (
        <div className="theory-example-figure-group">
          {block.figures.map((figure) => (
            <DbscanExampleFigure
              key={`${figure.radius}-${figure.minPts}`}
              points={theoryExamplePoints}
              {...figure}
            />
          ))}
        </div>
      )

  }
}
