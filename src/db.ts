// FeeZero Platform Database Utilities
import type { Bindings, Language, ApiResponse, PaginatedResponse } from './types';

export async function queryDatabase<T = any>(
  db: D1Database,
  query: string,
  params: any[] = []
): Promise<T[]> {
  try {
    const stmt = db.prepare(query);
    const result = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();
    return (result.results as T[]) || [];
  } catch (error) {
    console.error('Database query error:', error);
    throw new Error('Database query failed');
  }
}

export async function executeDatabase(
  db: D1Database,
  query: string,
  params: any[] = []
): Promise<D1Result> {
  try {
    const stmt = db.prepare(query);
    return params.length > 0 ? await stmt.bind(...params).run() : await stmt.run();
  } catch (error) {
    console.error('Database execution error:', error);
    throw new Error('Database execution failed');
  }
}

export async function getCategoriesWithTranslations(
  db: D1Database,
  lang: Language,
  parentId?: number | null
): Promise<any[]> {
  let query = `
    SELECT 
      c.id,
      c.parent_id,
      c.slug,
      c.icon,
      c.display_order,
      ct.name,
      ct.description
    FROM categories c
    LEFT JOIN category_translations ct ON c.id = ct.category_id AND ct.language = ?
    WHERE c.is_active = 1
  `;
  
  const params: any[] = [lang];
  
  if (parentId === null) {
    query += ' AND c.parent_id IS NULL';
  } else if (parentId !== undefined) {
    query += ' AND c.parent_id = ?';
    params.push(parentId);
  }
  
  query += ' ORDER BY c.display_order ASC, ct.name ASC';
  
  return queryDatabase(db, query, params);
}

export async function getSkillsWithTranslations(
  db: D1Database,
  lang: Language,
  categoryId?: number
): Promise<any[]> {
  let query = `
    SELECT 
      s.id,
      s.slug,
      s.category_id,
      st.name
    FROM skills s
    LEFT JOIN skill_translations st ON s.id = st.skill_id AND st.language = ?
  `;
  
  const params: any[] = [lang];
  
  if (categoryId) {
    query += ' WHERE s.category_id = ?';
    params.push(categoryId);
  }
  
  query += ' ORDER BY st.name ASC';
  
  return queryDatabase(db, query, params);
}

export function createApiResponse<T>(
  success: boolean,
  data?: T,
  error?: string,
  message?: string
): ApiResponse<T> {
  return {
    success,
    data,
    error,
    message
  };
}

export function createPaginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): PaginatedResponse<T> {
  return {
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

export async function hashPassword(password: string): Promise<string> {
  // In production, use a proper password hashing library
  // For now, we'll use a simple base64 encoding (NOT SECURE FOR PRODUCTION)
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

export function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export function getPaginationParams(url: URL): PaginationParams {
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = parseInt(url.searchParams.get('limit') || '20', 10);
  
  return {
    page: Math.max(1, page),
    limit: Math.min(100, Math.max(1, limit))
  };
}

export function calculateOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}
