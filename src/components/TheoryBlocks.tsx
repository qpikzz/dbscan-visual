import { Highlight } from 'prism-react-renderer'
import type { PrismTheme } from 'prism-react-renderer'
import type { TheoryBlock } from '../data/theory'
import { useLanguage } from '../i18n'
import { TheoryIcon } from './TheoryIcons'

type LeafTheoryBlock = Exclude<TheoryBlock, { type: 'sections' }>

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
  }
}
