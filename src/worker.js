import handler from '../.open-next/worker.js'
import api from './api/index.js'
import Services from './rpc/index.js'

// Export the Services class directly for RPC bindings
export { Services }

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    if (url.pathname.startsWith('/api/')) {
      // strip /api prefix
      const newUrl = new URL(url.pathname.substring(4), url.origin)
      const newRequest = new Request(newUrl, request)
      return api.fetch(newRequest, env, ctx)
    }
    
    // try to serve static assets from the ASSETS binding
    const assetResponse = await env.ASSETS.fetch(request);
    if (assetResponse.ok) {
      return assetResponse;
    }

    return handler.fetch(request, env, ctx)
  },
}