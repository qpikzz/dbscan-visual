import { AnimatePresence } from 'motion/react'
import { useLanguage } from '../i18n'
import { SUPPORT_URL } from '../config/socialLinks'
import { ModalShell } from './ModalShell'

type SupportModalProps = {
  onClose: () => void
}

export function SupportModal({ onClose }: SupportModalProps) {
  const { t } = useLanguage()

  return (
    <ModalShell
      labelledBy="support-modal-title"
      describedBy="support-modal-intro"
      closeLabel={t.supportCloseLabel}
      onClose={onClose}
    >
      <div className="modal-head">
        <span className="modal-badge" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M12 20.3 4.6 13a4.6 4.6 0 0 1 6.5-6.5l.9.9.9-.9A4.6 4.6 0 0 1 19.4 13Z" />
          </svg>
        </span>
        <h2 className="modal-title" id="support-modal-title">
          {t.supportTitle}
        </h2>
      </div>
      <p className="support-text" id="support-modal-intro">
        {t.supportP1}
      </p>
      <p className="support-text">{t.supportP2}</p>
      <p className="support-note">{t.supportNote}</p>
      <p className="support-small">{t.supportSmall}</p>
      <a
        className="btn btn-primary support-button"
        href={SUPPORT_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t.supportButtonAria}
      >
        <span>{t.supportButton}</span>
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path d="M9 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" />
          <path d="M14 4h6v6" />
          <path d="M20 4 11 13" />
        </svg>
      </a>
    </ModalShell>
  )
}

export function SupportModalPresence({ open, onClose }: SupportModalProps & { open: boolean }) {
  return (
    <AnimatePresence>
      {open && <SupportModal onClose={onClose} />}
    </AnimatePresence>
  )
}
