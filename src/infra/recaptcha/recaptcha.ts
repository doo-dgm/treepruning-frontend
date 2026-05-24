function loadRecaptcha(): Promise<void> {
  return new Promise((resolve) => {
    if (window.grecaptcha) return resolve()

    const script  = document.createElement('script')
    script.src    = `https://www.google.com/recaptcha/api.js?render=${import.meta.env.VITE_RECAPTCHA_SITE_KEY}`
    script.async  = true
    script.onload = () => resolve()
    document.head.appendChild(script)
  })
}

export async function getRecaptchaToken(action: string): Promise<string> {
  await loadRecaptcha()
  return new Promise((resolve) => {
    window.grecaptcha.ready(() => {
      window.grecaptcha
        .execute(import.meta.env.VITE_RECAPTCHA_SITE_KEY, { action })
        .then(resolve)
    })
  })
}
