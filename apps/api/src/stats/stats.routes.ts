import { Hono } from 'hono'
import type { AppEnv } from '../env'

/** `GET /api/stats`: total and per-status counts computed from persisted tickets. */
export const statsRoutes = new Hono<AppEnv>().get('/', async (c) => c.json(await c.var.tickets.stats()))
