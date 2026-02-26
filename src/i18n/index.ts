import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { getLocales } from 'expo-localization'
import zhTW from './locales/zh-TW'
import en from './locales/en'
import ja from './locales/ja'
import { mmkv, STORAGE_KEYS } from '../stores/mmkvStorage'

const savedLanguage = mmkv.getString(STORAGE_KEYS.LANGUAGE)
const deviceLanguage = getLocales()[0]?.languageCode ?? 'zh'

function getDefaultLanguage(): string {
  if (deviceLanguage.startsWith('en')) return 'en'
  if (deviceLanguage.startsWith('ja')) return 'ja'
  return 'zh-TW'
}

const initialLanguage = savedLanguage ?? getDefaultLanguage()

i18n
  .use(initReactI18next)
  .init({
    resources: {
      'zh-TW': { translation: zhTW },
      en: { translation: en },
      ja: { translation: ja },
    },
    lng: initialLanguage,
    fallbackLng: 'zh-TW',
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
