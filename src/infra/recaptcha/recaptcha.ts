import { config } from '@/infra/config'

// El script de reCAPTCHA lo carga el plugin VueReCaptcha en main.ts.
// Esta funcion solo espera a que el objeto global este listo y ejecuta.
export async function getRecaptchaToken(action: string): Promise<string> {
  await new Promise<void>((resolve, reject) => {
    if (!window.grecaptcha) {
      reject(new Error('reCAPTCHA no cargado'))
      return
    }
    window.grecaptcha.ready(resolve)
  })
  return window.grecaptcha.execute(config.recaptchaSiteKey, { action })
}
