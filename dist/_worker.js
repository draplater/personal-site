/**
 * @file Cloudflare Pages _worker.js — 静态文件服务 + 广告优化中间件
 * @brief 放在 dist/ 根目录，CF Pages 自动识别为主入口
 *
 * 功能：
 * 1. 静态文件服务（代理到 CF 默认的 ASSETS 绑定）
 * 2. 爬虫检测 → 跳过广告渲染（节省 AdSense 展示配额）
 * 3. A/B 测试分组（基于 IP 哈希，同一用户始终同组）
 * 4. 地理标记（检测国内 IP）
 */

const BOT_PATTERNS = [
  'bot', 'crawler', 'spider', 'scraper', 'archive',
  'googlebot', 'bingbot', 'slurp', 'duckduckbot',
  'baiduspider', 'yandexbot', 'facebookexternalhit',
  'twitterbot', 'discordbot', 'telegrambot',
]

function isBot(ua) {
  if (!ua) return false
  return BOT_PATTERNS.some(bot => ua.toLowerCase().includes(bot))
}

function isChinaIP(ip) {
  if (!ip || ip === '127.0.0.1' || ip === '::1') return false
  return true // 简化：实际用 cf-ipcountry 更准
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const ua = request.headers.get('user-agent') || ''
    const cfIP = request.headers.get('cf-connecting-ip') || ''
    const country = request.cf?.country || ''

    // 只处理 HTML 请求
    const isHTML = url.pathname.endsWith('.html') ||
      url.pathname === '/' ||
      !url.pathname.includes('.')

    // 静态资源直接返回
    if (!isHTML) {
      return env.ASSETS.fetch(request)
    }

    // 先获取静态 HTML
    const response = await env.ASSETS.fetch(request)
    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('text/html')) {
      return response
    }

    // 是爬虫 → 原样返回，不注入广告代码
    if (isBot(ua)) {
      return response
    }

    // A/B 测试分组
    const hash = cfIP.split('').reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 0)
    const variant = Math.abs(hash) % 2 === 0 ? 'A' : 'B'

    // 注入广告配置到页面
    const html = await response.text()
    const config = {
      variant,
      country,
      isChina: country === 'CN',
      isBot: false,
    }

    const modified = html.replace(
      '</body>',
      `<script>window.__AD_CONFIG=${JSON.stringify(config)}</script></body>`
    )

    return new Response(modified, {
      ...response,
      headers: {
        ...response.headers,
        'content-type': 'text/html; charset=utf-8',
        'x-ad-variant': variant,
        'x-ad-geo': country || 'unknown',
      },
    })
  }
}
