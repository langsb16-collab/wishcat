// FeeZero Platform - Announcements API
import { Hono } from 'hono'
import type { Bindings, Language } from '../types'
import { queryDatabase, createApiResponse } from '../db'

const announcements = new Hono<{ Bindings: Bindings }>()

// Get active announcements
announcements.get('/api/announcements', async (c) => {
  try {
    const { DB } = c.env
    const lang = c.req.query('lang') as Language || 'ko'
    
    const results = await queryDatabase(
      DB,
      `SELECT 
        a.id,
        a.announcement_type,
        a.priority,
        a.start_date,
        a.end_date,
        at.title,
        at.content
      FROM announcements a
      LEFT JOIN announcement_translations at ON a.id = at.announcement_id AND at.language = ?
      WHERE a.is_active = 1
      AND (a.start_date IS NULL OR a.start_date <= CURRENT_TIMESTAMP)
      AND (a.end_date IS NULL OR a.end_date >= CURRENT_TIMESTAMP)
      ORDER BY a.priority DESC, a.created_at DESC
      LIMIT 10`,
      [lang]
    )
    
    return c.json(createApiResponse(true, results))
  } catch (error: any) {
    return c.json(createApiResponse(false, null, error.message), 500)
  }
})

export default announcements
