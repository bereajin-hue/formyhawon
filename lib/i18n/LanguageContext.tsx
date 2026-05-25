'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import type { Lang } from './translations'

interface LangCtx {
  lang: Lang
  setLang: (l: Lang) => void
}

const Ctx = createContext<LangCtx>({ lang: 'ko', setLang: () => {} })

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('ko')

  useEffect(() => {
    const saved = localStorage.getItem('sq_lang') as Lang | null
    if (saved === 'en' || saved === 'ko') setLangState(saved)
  }, [])

  function setLang(l: Lang) {
    setLangState(l)
    localStorage.setItem('sq_lang', l)
  }

  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>
}

export function useLanguage() {
  return useContext(Ctx)
}

export function useT() {
  const { lang, setLang } = useLanguage()
  const i = lang === 'en' ? 1 : 0
  return {
    t: (pair: [string, string]) => pair[i],
    lang,
    setLang,
  }
}
