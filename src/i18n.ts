import { createI18n } from 'vue-i18n'

const messages = {
  en: {
    welcome: "Welcome",
    capture: "Capture Data",
  },
  kh: {
    welcome: "សូមស្វាគមន៍",
    capture: "ថតទិន្នន័យ",
  },
}

const i18n = createI18n({
  legacy: true, // instead of false
  locale: 'en',
  fallbackLocale: 'en',
  messages,
})

export default i18n
