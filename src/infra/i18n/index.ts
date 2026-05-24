import { createI18n } from 'vue-i18n'
import es from './locales/es'
import en from './locales/en'

export const i18n = createI18n({
  legacy:        false,       // usa Composition API
  locale:        'es',        // idioma por defecto
  fallbackLocale: 'en',
  messages:      { es, en },
})
