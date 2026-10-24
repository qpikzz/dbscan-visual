export type FooterIconName =
  | 'visualization'
  | 'theory'
  | 'steps'
  | 'summary'
  | 'telegram'
  | 'vk'
  | 'github'
  | 'shield'
  | 'heart'

type FooterIconProps = {
  name: FooterIconName
}

export function FooterIcon({ name }: FooterIconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      {name === 'visualization' ? (
        <>
          <rect x="3.5" y="3.5" width="17" height="17" rx="2" />
          <circle cx="8" cy="8" r="1" />
          <circle cx="16" cy="10" r="1" />
          <circle cx="10" cy="16" r="1" />
          <path d="m8.8 8.8 6.4 1.4m-4.5 5 4.6-4.4" />
        </>
      ) : null}
      {name === 'theory' ? (
        <>
          <path d="M12 6.5c-2.4-1.8-5.2-1.8-8-.8v13c2.8-1 5.6-1 8 .8 2.4-1.8 5.2-1.8 8-.8v-13c-2.8-1-5.6-1-8 .8Z" />
          <path d="M12 6.5v13" />
        </>
      ) : null}
      {name === 'steps' ? (
        <>
          <path d="M9 5h11M9 12h11M9 19h11" />
          <circle cx="4.5" cy="5" r="1" />
          <circle cx="4.5" cy="12" r="1" />
          <circle cx="4.5" cy="19" r="1" />
        </>
      ) : null}
      {name === 'summary' ? (
        <>
          <path d="M6 3.5h8l4 4v13H6z" />
          <path d="M14 3.5v4h4M9 12h6m-6 4h6" />
        </>
      ) : null}
      {name === 'telegram' ? (
        <>
          <path d="m21 4-6.7 16-3.8-6.2L4 10.5 21 4Z" />
          <path d="m10.5 13.8 4.1-4.2" />
        </>
      ) : null}
      {name === 'vk' ? (
        <>
          <path d="M3 6 7.2 18 11.4 6m4.1 0v12M21 6l-5.5 6 5.5 6" />
        </>
      ) : null}
      {name === 'github' ? (
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
      ) : null}
      {name === 'shield' ? (
        <>
          <path d="M12 3 19 6v5c0 4.4-2.8 8.2-7 10-4.2-1.8-7-5.6-7-10V6l7-3Z" />
          <path d="m8.8 12.1 2.1 2.1 4.4-4.5" />
        </>
      ) : null}
      {name === 'heart' ? (
        <path d="M12 20.3 4.6 13a4.6 4.6 0 0 1 6.5-6.5l.9.9.9-.9A4.6 4.6 0 0 1 19.4 13Z" />
      ) : null}
    </svg>
  )
}
