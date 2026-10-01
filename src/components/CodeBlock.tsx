import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Highlight } from 'prism-react-renderer'
import type { PrismTheme } from 'prism-react-renderer'
import { useMotionSettings } from '../hooks/useMotionSettings'
import type { CodeLanguage } from '../data/code'
import { codeLanguages, codeSamples } from '../data/code'
import { useLanguage } from '../i18n'

const codeTheme: PrismTheme = {
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

export function CodeBlock() {
  const { t } = useLanguage()
  const [language, setLanguage] = useState<CodeLanguage>('python')
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>('idle')
  const { transition } = useMotionSettings()

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(codeSamples[language])
      setCopyStatus('copied')
    } catch {
      setCopyStatus('failed')
    }
  }

  return (
    <section className="viz-card code-block" aria-labelledby="code-title">
      <div className="code-head">
        <h2 className="code-title" id="code-title">
          {t.codeTitle}
        </h2>
        <div className="code-tabs" role="tablist" aria-label={t.codeTabsLabel}>
          {codeLanguages.map((lang) => (
            <button
              key={lang.id}
              type="button"
              role="tab"
              aria-selected={language === lang.id}
              aria-controls="code-panel"
              className={language === lang.id ? 'code-tab active' : 'code-tab'}
              id={`code-tab-${lang.id}`}
              onClick={() => {
                setLanguage(lang.id)
                setCopyStatus('idle')
              }}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>
      <div className="code-panel">
        <div className="code-toolbar">
          <span className="code-status" role="status" aria-live="polite">
            {copyStatus === 'copied'
              ? t.codeCopySuccess
              : copyStatus === 'failed'
                ? t.codeCopyFailure
                : ''}
          </span>
          <button className="code-copy" type="button" onClick={copyCode}>
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <rect x="8" y="8" width="12" height="12" rx="2" />
              <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
            </svg>
            {t.codeCopyButton}
          </button>
        </div>
        <div
          className="code-surface"
          id="code-panel"
          role="tabpanel"
          aria-labelledby={`code-tab-${language}`}
          tabIndex={0}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={language}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={transition(0.2)}
            >
              <Highlight
                code={codeSamples[language]}
                language={language}
                theme={codeTheme}
              >
                {({ tokens, getLineProps, getTokenProps }) => (
                  <pre className="code-pre">
                    <ol className="code-gutter" aria-hidden="true">
                      {tokens.map((_, i) => (
                        <li key={i}>{i + 1}</li>
                      ))}
                    </ol>
                    <code className="code-lines">
                      {tokens.map((line, i) => (
                        <div key={i} {...getLineProps({ line })}>
                          {line.map((token, key) => (
                            <span key={key} {...getTokenProps({ token })} />
                          ))}
                        </div>
                      ))}
                    </code>
                  </pre>
                )}
              </Highlight>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}