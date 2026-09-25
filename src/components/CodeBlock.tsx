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
  const { transition } = useMotionSettings()

  return (
    <section className="viz-card" aria-labelledby="code-title">
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
              className={language === lang.id ? 'code-tab active' : 'code-tab'}
              onClick={() => setLanguage(lang.id)}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>
      <div className="code-surface">
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
    </section>
  )
}