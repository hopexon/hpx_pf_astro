import { ActionError, defineAction } from 'astro:actions'
import { getSecret } from 'astro:env/server'
import { Resend } from 'resend'
import { contactConfig, contactInput, createContactEmail, verifyContactToken } from '../lib/contact'

export const server = {
  contact: defineAction({
    accept: 'form',
    input: contactInput,
    handler: async (input, context) => {
      if (input.website) return { ok: true }

      const config = contactConfig.safeParse({
        apiKey: getSecret('RESEND_API_KEY')?.trim(),
        from: getSecret('CONTACT_FROM')?.trim(),
        to: getSecret('CONTACT_TO')?.trim(),
        turnstileSecret: getSecret('TURNSTILE_SECRET_KEY')?.trim(),
      })
      if (!config.success) {
        throw new ActionError({
          code: 'SERVICE_UNAVAILABLE',
          message: '現在、お問い合わせの受付を休止しています。時間をおいてお試しください。',
        })
      }

      let human: boolean
      try {
        human = await verifyContactToken(
          input['cf-turnstile-response'],
          config.data.turnstileSecret,
          context.url.hostname,
          import.meta.env.DEV,
        )
      } catch {
        throw new ActionError({
          code: 'SERVICE_UNAVAILABLE',
          message: 'ボット確認に接続できませんでした。時間をおいて再度お試しください。',
        })
      }
      if (!human) {
        throw new ActionError({
          code: 'FORBIDDEN',
          message: 'ボット確認の有効期限が切れたか、確認に失敗しました。もう一度お試しください。',
        })
      }

      try {
        const resend = new Resend(config.data.apiKey)
        const { data, error } = await resend.emails.send(
          createContactEmail(input, config.data.from, config.data.to),
          { idempotencyKey: `contact/${input.submissionId}`, signal: AbortSignal.timeout(10_000) },
        )
        if (error || !data?.id) throw new Error('Mail not accepted')
      } catch {
        // アドレス、本文、APIキー、外部APIの応答をログやクライアントに出さない。
        throw new ActionError({
          code: 'BAD_GATEWAY',
          message: '送信結果を確認できませんでした。入力内容を変更せずに、時間をおいて再度お試しください。',
        })
      }

      return { ok: true }
    },
  }),
}
