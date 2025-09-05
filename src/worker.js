import handler from '../.open-next/worker.js'
import api from './api/index.js'
import { scheduled } from './cron/schedule.js'

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    if (url.pathname.startsWith('/api/')) {
      // strip /api prefix
      const newUrl = new URL(url.pathname.substring(4), url.origin)
      const newRequest = new Request(newUrl, request)
      return api.fetch(newRequest, env, ctx)
    }
    return handler.fetch(request, env, ctx)
  },

  async scheduled(event, env, ctx) {
    return scheduled(event, env, ctx)
  },
}