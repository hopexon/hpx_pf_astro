import astroWorker from '@astrojs/cloudflare/entrypoints/server'

const encoder = new TextEncoder()

function safeEqual(actual, expected) {
  const actualBytes = encoder.encode(actual)
  const expectedBytes = encoder.encode(expected)

  if(actualBytes.byteLength !== expectedBytes.byteLength) {
    crypto.subtle.timingSafeEqual(expectedBytes, expectedBytes)
    return false
  }

  return crypto.subtle.timingSafeEqual(actualBytes, expectedBytes)
}

function unauthorized() {
  return new Response('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Staging", charset="UTF-8"',
      'Cache-Control': 'no-store',
    },
  })
}

export default {
  async fetch(request, env, ctx) {
    // 認証は既定で必須。production では BASIC_AUTH_REQUIRED=false を設定する
    const authRequired = env.BASIC_AUTH_REQUIRED !== 'false'

    if(authRequired) {
      const expectedUsername = env.BASIC_AUTH_USERNAME
      const expectedPassword = env.BASIC_AUTH_PASSWORD

      // staging の設定漏れで認証なし公開とならないよう、未設定ならFailさせる
      if(!expectedUsername || !expectedPassword) {
        return new Response('Basic authentication is not configured', {
          status: 503,
          headers: { 'Cache-Control': 'no-store' }
        })
      }

      const authorization = request.headers.get('Authorization') ?? ''
      const match = /^Basic\s+([A-Za-z0-9+/]+={0,2})$/i.exec(authorization)

      if(!match) return unauthorized()

      let credentials
      try {
        const binary = atob(match[1])
        const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
        credentials = new TextDecoder('utf-8', { fatal: true }).decode(bytes)
      } catch {
        return unauthorized()
      }

      const separator = credentials.indexOf(':')
      if(separator < 0) return unauthorized()

      const username = credentials.slice(0, separator)
      const password = credentials.slice(separator + 1)
      const validUsername = safeEqual(username, expectedUsername)
      const validPassword = safeEqual(password, expectedPassword)

      if(!validUsername || !validPassword) return unauthorized()
    }

    const response = await astroWorker.fetch(request, env, ctx)

    if(!authRequired) return response

    //staging のページや静的ファイルが共有キャッシュされないようにする
    const headers = new Headers(response.headers)
    headers.set('Cache-Control', 'private, no-store')

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    })
  },
}