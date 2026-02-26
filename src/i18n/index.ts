import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { getLocales } from 'expo-localization'
import zhTW from './locales/zh-TW'
import en from './locales/en'

const deviceLanguage = getLocales()[0]?.languageCode ?? 'zh'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      'zh-TW': { translation: zhTW },
      en: { translation: en },
    },
    lng: deviceLanguage.startsWith('en') ? 'en' : 'zh-TW',
    fallbackLng: 'zh-TW',
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
