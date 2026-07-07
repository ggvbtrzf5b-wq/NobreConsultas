import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'
const COOKIE_NAME = 'nobre_token'
const TOKEN_EXPIRES = '7d'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export const hashPassword = async (pwd) => bcrypt.hash(pwd, 10)
export const comparePassword = async (pwd, hash) => bcrypt.compare(pwd, hash)

export const signToken = (payload) => jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRES })
export const verifyToken = (token) => {
  try { return jwt.verify(token, JWT_SECRET) } catch { return null }
}

export async function setAuthCookie(token) {
  const store = await cookies()
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  })
}

export async function clearAuthCookie() {
  const store = await cookies()
  store.set(COOKIE_NAME, '', { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 0 })
}

export async function getAuthPayload() {
  const store = await cookies()
  const token = store.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

export function publicUser(u) {
  if (!u) return null
  const { passwordHash, _id, ...rest } = u
  return rest
}
