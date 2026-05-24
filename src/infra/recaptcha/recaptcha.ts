function loadRecaptcha(): Promise<void> {
  return new Promise((resolve, reject) => {

    // Ya está listo → resuelve inmediatamente
    if (window.grecaptcha?.ready) {
      window.grecaptcha.ready(() => resolve())
      return
    }

    // Script ya insertado pero aún cargando → espera
    const existing = document.querySelector(
      `script[src*="recaptcha/api.js"]`
    )
    if (existing) {
      existing.addEventListener('load', () => {
        window.grecaptcha.ready(() => resolve())
      })
      return
    }

    // Primera vez → inserta el script
    const script  = document.createElement('script')
    script.src    = `https://www.google.com/recaptcha/api.js?render=${import.meta.env.VITE_RECAPTCHA_SITE_KEY}`
    script.async  = true
    script.defer  = true
    script.onload = () => window.grecaptcha.ready(() => resolve())
    script.onerror = () => reject(new Error('Error al cargar reCAPTCHA'))
    document.head.appendChild(script)
  })
}

export async function getRecaptchaToken(action: string): Promise<string> {
  await loadRecaptcha()
  return window.grecaptcha.execute(
    import.meta.env.VITE_RECAPTCHA_SITE_KEY,
    { action }
  )
}
