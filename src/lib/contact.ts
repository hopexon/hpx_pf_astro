import { z } from 'astro/zod'

const singleLine = (limit: number) => z.string().trim().max(limit)
  .refine((value) => !/[\r\n\u0000]/.test(value), '改行を含めずに入力してください。')

export const contactInput = z.object({
  name: singleLine(100).refine((value) => value.length > 0, 'お名前を入力してください。'),
  email: z.string().trim().max(254).pipe(z.email('メールアドレスの形式をご確認ください。')),
  subject: singleLine(150).default(''),
  message: z.string().trim().min(1, 'メッセージを入力してください。').max(5000, 'メッセージは5,000文字以内で入力してください。'),
  website: z.string().max(1000).optional(),
  'cf-turnstile-response': z.string().min(1, 'ボット確認を完了してください。').max(2048),
  submissionId: z.uuid(),
})

export const contactConfig = z.object({
  apiKey: z.string().min(1),
  from: z.email(),
  to: z.email(),
  turnstileSecret: z.string().min(1),
})

export const TURNSTILE_TEST_SECRET = '1x0000000000000000000000000000000AA'

interface TurnstileResult {
  success?: boolean
  hostname?: string
  action?: string
}

export async function verifyContactToken(
  token: string,
  secret: string,
  hostname: string,
  development = false,
): Promise<boolean> {
  // テスト用キーを誤って本番で使っても、メールは送信しない。
  const testSecret = /^[123]x0{20,}/.test(secret)
  if (testSecret && !development) return false

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: new URLSearchParams({ secret, response: token }),
    signal: AbortSignal.timeout(10_000),
  })
  if (!response.ok) throw new Error('Turnstile unavailable')

  const result: TurnstileResult = await response.json()
  if (result?.success !== true) return false
  // Cloudflare の公式テスト用キーは実際の hostname / action を返さない。
  if (development && secret === TURNSTILE_TEST_SECRET) return true
  return result.hostname === hostname && result.action === 'contact'
}

export function createContactEmail(input: z.infer<typeof contactInput>, from: string, to: string) {
  return {
    from: `HPX Portfolio <${from}>`,
    to: [to],
    replyTo: input.email,
    subject: `[HPX Portfolio] ${input.subject || 'お問い合わせ'}`,
    text: [
      `お名前: ${input.name}`,
      `返信先: ${input.email}`,
      `件名: ${input.subject || 'お問い合わせ'}`,
      '',
      input.message,
    ].join('\n'),
  }
}
