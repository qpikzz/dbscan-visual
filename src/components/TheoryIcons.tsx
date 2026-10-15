import type { ReactElement } from 'react'
import type { TheoryIconName } from '../data/theory'

const icons: Record<TheoryIconName, ReactElement> = {
  why: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.6 9.4a2.5 2.5 0 0 1 4.9.6c0 1.7-2.4 2.2-2.4 3.6" />
      <path d="M12 17.2h.01" />
    </>
  ),
  idea: (
    <>
      <path d="M12 3.5a5.5 5.5 0 0 0-3.2 9.95c.55.4.9 1.05.9 1.75v.3h4.6v-.3c0-.7.35-1.35.9-1.75A5.5 5.5 0 0 0 12 3.5Z" />
      <path d="M9.8 18.5h4.4" />
      <path d="M10.8 21h2.4" />
    </>
  ),
  parameters: (
    <>
      <path d="M4 7.5h8" />
      <path d="M17 7.5h3" />
      <circle cx="14.5" cy="7.5" r="2.5" />
      <path d="M4 16.5h3" />
      <path d="M12 16.5h8" />
      <circle cx="9.5" cy="16.5" r="2.5" />
    </>
  ),
  steps: <path d="M4 20h5v-5h5v-5h5V5" />,
  compare: (
    <>
      <path d="M4 8.5h13" />
      <path d="m14 5.5 3 3-3 3" />
      <path d="M20 15.5H7" />
      <path d="m10 12.5-3 3 3 3" />
    </>
  ),
  balance: (
    <>
      <path d="M12 4.5v15" />
      <path d="M7.5 19.5h9" />
      <path d="M4.75 9h14.5" />
      <path d="m4.75 9-2.5 5.5h5Z" />
      <path d="m19.25 9-2.5 5.5h5Z" />
    </>
  ),
  cheatsheet: (
    <path d="M7 4.5h10a1.5 1.5 0 0 1 1.5 1.5v14.2L12 16.4l-6.5 3.8V6A1.5 1.5 0 0 1 7 4.5Z" />
  ),
  note: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11.5v5" />
      <path d="M12 8h.01" />
    </>
  ),
  important: (
    <>
      <path d="M12 4.8L2.6 20.4h18.8Z" />
      <path d="M12 10.5v4.5" />
      <path d="M12 17.8h.01" />
    </>
  ),
  example: (
    <>
      <path d="M9.5 3.5h5" />
      <path d="M10.5 3.5v6.4L6 20.6h12L13.5 9.9V3.5" />
      <path d="M7.9 16.4h8.2" />
    </>
  ),
}

type TheoryIconProps = {
  name: TheoryIconName
}

export function TheoryIcon({ name }: TheoryIconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      {icons[name]}
    </svg>
  )
}
