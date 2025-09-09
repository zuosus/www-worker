import { Hono } from 'hono'
import paddle from './paddle'
import paddleSandbox from './paddle-sandbox'
import { Bindings } from '@/types/types'
import { Variables } from 'hono/types'

const webhook = new Hono<{ Bindings: Bindings; Variables: Variables }>()

webhook.route('/', paddle)
webhook.route('/sandbox', paddleSandbox)

export default webhook
