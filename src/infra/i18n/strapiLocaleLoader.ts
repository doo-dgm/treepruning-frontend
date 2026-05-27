import axios from 'axios'
import { i18n } from './index'
import { config } from '../config'

const STRAPI_URL = config.strapiUrl

export async function loadStrapiLocales(): Promise<void> {
  if (!STRAPI_URL) {
    console.info('[i18n] VITE_STRAPI_URL no configurado — usando traducciones estáticas.')
    return
  }

  try {
    const res = await axios.get<{ data: { es?: object; en?: object } }>(
      `${STRAPI_URL}/api/frontend-locale`,
      { timeout: 6_000 },
    )

    const data = res.data?.data
    if (!data) {
      console.warn('[i18n] Strapi devolvió data vacía para frontend-locale.')
      return
    }

    if (data.es && typeof data.es === 'object') {
      i18n.global.setLocaleMessage('es', data.es as Record<string, unknown>)
    }
    if (data.en && typeof data.en === 'object') {
      i18n.global.setLocaleMessage('en', data.en as Record<string, unknown>)
    }

    console.info('[i18n] Traducciones cargadas desde Strapi.')
  } catch (err) {
    console.warn('[i18n] No se pudieron cargar traducciones desde Strapi. Usando fallback estático.', err)
  }
}
