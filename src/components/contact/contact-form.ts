import { actions, isInputError } from 'astro:actions'

interface Turnstile {
  render(container: HTMLElement, options: {
    sitekey: string
    action: string
    theme: 'light' | 'dark' | 'auto'
    size: 'compact' | 'flexible'
    'response-field': false
    retry: 'never'
    callback: () => void
    'error-callback': () => void
    'expired-callback': () => void
  }): string
  getResponse(widgetId: string): string
  reset(widgetId: string): void
  remove(widgetId: string): void
}

declare global {
  interface Window {
    turnstile?: Turnstile
    onContactTurnstileLoad?: () => void
  }
}

let turnstileLoading: Promise<Turnstile> | undefined

function loadTurnstile(): Promise<Turnstile> {
  if (turnstileLoading) return turnstileLoading
  if (window.turnstile) return Promise.resolve(window.turnstile)

  turnstileLoading = new Promise<Turnstile>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onContactTurnstileLoad'
    script.async = true
    const fail = () => {
      clearTimeout(timeout)
      delete window.onContactTurnstileLoad
      script.remove()
      reject(new Error('Turnstile failed to load'))
    }
    const timeout = window.setTimeout(fail, 15_000)
    script.addEventListener('error', fail, { once: true })
    // asyncで読み込む場合はready()ではなく、APIのonloadコールバックを使う。
    window.onContactTurnstileLoad = () => {
      if (!window.turnstile) return fail()
      clearTimeout(timeout)
      delete window.onContactTurnstileLoad
      resolve(window.turnstile)
    }
    document.head.append(script)
  }).catch((error) => {
    turnstileLoading = undefined
    throw error
  })
  return turnstileLoading
}

class ContactForm extends HTMLElement {
  #events?: AbortController
  #api?: Turnstile
  #widgetId?: string
  #generation = 0
  #sending = false
  #defaultErrors = new WeakMap<HTMLElement, string>()
  #submissionId = crypto.randomUUID()
  #form!: HTMLFormElement
  #fieldset!: HTMLFieldSetElement
  #submitButton!: HTMLButtonElement
  #submitLabel!: HTMLElement
  #status!: HTMLElement
  #retry!: HTMLButtonElement

  connectedCallback() {
    this.#generation++
    this.#form = this.querySelector('form')!
    this.#fieldset = this.querySelector('fieldset')!
    this.#submitButton = this.querySelector('button[type="submit"]')!
    this.#submitLabel = this.querySelector('[data-submit-label]')!
    this.#status = this.querySelector('[role="status"]')!
    this.#retry = this.querySelector('[data-retry-turnstile]')!
    this.#events = new AbortController()
    const { signal } = this.#events
    this.#form.addEventListener('submit', this.#submit, { signal })
    this.#form.addEventListener('input', this.#input, { signal })
    this.#form.addEventListener('focusout', this.#syncValidity, { signal })
    this.#form.addEventListener('invalid', this.#invalid, { signal, capture: true })
    this.#retry.addEventListener('click', () => void this.#initializeTurnstile(), { signal })
    if (this.dataset.siteKey) void this.#initializeTurnstile()
  }

  disconnectedCallback() {
    this.#generation++
    this.#events?.abort()
    if (this.#widgetId !== undefined) this.#api?.remove(this.#widgetId)
    this.#widgetId = undefined
  }

  async #initializeTurnstile() {
    const generation = this.#generation
    const container = this.querySelector<HTMLElement>('[data-turnstile]')!
    this.#retry.hidden = true
    this.#status.textContent = ''
    delete this.#status.dataset.state
    try {
      const api = await loadTurnstile()
      if (!this.isConnected || generation !== this.#generation) return
      if (this.#widgetId !== undefined) api.remove(this.#widgetId)
      this.#api = api
      this.#widgetId = api.render(container, {
        sitekey: this.dataset.siteKey!,
        action: 'contact',
        theme: 'light',
        size: container.clientWidth < 300 ? 'compact' : 'flexible',
        'response-field': false,
        retry: 'never',
        callback: () => { this.#retry.hidden = true },
        'error-callback': () => this.#verificationIssue('ボットチェックに失敗しました。確認をやり直してください。'),
        'expired-callback': () => this.#verificationIssue('ボットチェックの有効期限が切れました。確認をやり直してください。'),
      })
      this.#submitButton.disabled = false
    } catch {
      if (this.isConnected && generation === this.#generation) {
        this.#verificationIssue('ボットチェックの読込に失敗しました。通信状況を確認し、確認をやり直してください。')
      }
    }
  }

  #verificationIssue(message: string) {
    if (this.#sending) return
    this.#retry.hidden = false
    this.#setStatus(message, 'error')
  }

  #setStatus(message: string, state: 'success' | 'error' | 'sending') {
    this.#status.textContent = message
    this.#status.dataset.state = state
  }

  #invalid = (event: Event) => {
    const field = event.target
    if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
      field.setAttribute('aria-invalid', 'true')
    }
  }

  #syncValidity = (event: Event) => {
    const field = event.target
    if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) return
    if (field.matches(':user-invalid')) field.setAttribute('aria-invalid', 'true')
    else field.removeAttribute('aria-invalid')
  }

  #input = (event: Event) => {
    const field = event.target
    if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) return
    field.setCustomValidity('')
    const hint = this.querySelector<HTMLElement>(`[data-field-error="${field.name}"]`)
    const defaultMessage = hint && this.#defaultErrors.get(hint)
    if (hint && defaultMessage !== undefined) {
      hint.textContent = defaultMessage
      this.#defaultErrors.delete(hint)
    }
    this.#syncValidity(event)
    this.#submissionId = crypto.randomUUID()
  }

  #submit = async (event: SubmitEvent) => {
    event.preventDefault()
    if (this.#sending || !this.#form.reportValidity()) return

    const token = this.#widgetId === undefined ? '' : this.#api?.getResponse(this.#widgetId)
    if (!token) {
      this.#setStatus('ボットチェックが完了していません。確認を完了してから送信してください。', 'error')
      return
    }

    const data = new FormData(this.#form)
    data.set('cf-turnstile-response', token)
    data.set('submissionId', this.#submissionId)
    const generation = this.#generation
    this.#sending = true
    this.#fieldset.disabled = true
    this.#form.setAttribute('aria-busy', 'true')
    this.#submitLabel.textContent = '送信中…'
    this.#setStatus('メッセージを送信しています。', 'sending')

    try {
      const { data: result, error } = await actions.contact(data)
      if (!this.isConnected || generation !== this.#generation) return
      if (error) {
        if (isInputError(error)) {
          let firstInvalid: HTMLInputElement | HTMLTextAreaElement | undefined
          for (const [name, messages] of Object.entries(error.fields)) {
            const field = this.#form.elements.namedItem(name)
            const message = messages?.[0]
            if (!message || !(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) continue
            const hint = this.querySelector<HTMLElement>(`[data-field-error="${name}"]`)
            if (hint) {
              if (!this.#defaultErrors.has(hint)) this.#defaultErrors.set(hint, hint.textContent ?? '')
              hint.textContent = message
            }
            field.setCustomValidity(message)
            field.setAttribute('aria-invalid', 'true')
            firstInvalid ??= field
          }
          this.#setStatus('入力内容をご確認ください。', 'error')
          // disabled のままではフォーカスできないため、先に入力欄を戻す。
          this.#fieldset.disabled = false
          firstInvalid?.focus()
        } else {
          this.#setStatus(error.message || '送信できませんでした。時間をおいてお試しください。', 'error')
        }
      } else if (result?.ok) {
        this.#form.reset()
        this.querySelectorAll('[aria-invalid]').forEach((field) => field.removeAttribute('aria-invalid'))
        this.#submissionId = crypto.randomUUID()
        this.#setStatus('メッセージを受け付けました。ご連絡ありがとうございます。', 'success')
      } else {
        throw new Error('Unexpected action response')
      }
    } catch {
      if (this.isConnected && generation === this.#generation) {
        this.#setStatus('送信結果を確認できませんでした。通信状況を確認し、入力内容を変更せずに再度お試しください。', 'error')
      }
    } finally {
      this.#sending = false
      if (this.isConnected && generation === this.#generation) {
        this.#fieldset.disabled = false
        this.#form.removeAttribute('aria-busy')
        this.#submitLabel.textContent = 'メッセージを送る'
        if (this.#widgetId !== undefined) this.#api?.reset(this.#widgetId)
      }
    }
  }
}

customElements.define('contact-form', ContactForm)
