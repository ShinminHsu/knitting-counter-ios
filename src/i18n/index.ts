import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { getLocales } from 'expo-localization'
import zhTW from './locales/zh-TW'
import en from './locales/en'
import { mmkv, STORAGE_KEYS } from '../stores/mmkvStorage'

const savedLanguage = mmkv.getString(STORAGE_KEYS.LANGUAGE)
const deviceLanguage = getLocales()[0]?.languageCode ?? 'zh'
const initialLanguage = savedLanguage ?? (deviceLanguage.startsWith('en') ? 'en' : 'zh-TW')

i18n
  .use(initReactI18next)
  .init({
    resources: {
      'zh-TW': { translation: zhTW },
      en: { translation: en },
    },
    lng: initialLanguage,
    fallbackLng: 'zh-TW',
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
