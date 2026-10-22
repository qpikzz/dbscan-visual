import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useLanguage } from '../i18n'

function setMetaTag(attribute: 'name' | 'property', key: string, content: string) {
  let element = document.querySelector(`meta[${attribute}="${key}"]`) as HTMLMetaElement | null
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

export function usePageMeta() {
  const location = useLocation()
  const { language, t } = useLanguage()

  useEffect(() => {
    const isTheory = location.pathname === '/theory'
    const title = isTheory ? t.metaTitleTheory : t.metaTitleHome
    const description = isTheory ? t.metaDescriptionTheory : t.metaDescriptionHome
    const siteName = 'DBSCAN Visual'
    const url = 'https://dbscan.ru/'
    const locale = language === 'ru' ? 'ru_RU' : 'en_US'

    document.title = title
    document.documentElement.lang = language
    setMetaTag('name', 'description', description)
    setMetaTag('property', 'og:title', title)
    setMetaTag('property', 'og:description', description)
    setMetaTag('property', 'og:site_name', siteName)
    setMetaTag('property', 'og:url', url)
    setMetaTag('property', 'og:type', 'website')
    setMetaTag('property', 'og:locale', locale)
    setMetaTag('name', 'twitter:title', title)
    setMetaTag('name', 'twitter:description', description)
    setMetaTag('name', 'twitter:card', 'summary')
  }, [language, location.pathname, t])
}
