import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'

export interface User {
  _id: string
  email: string
  name: string
  role: string
}

export function generateToken(user: User): string {
  return jwt.sign(
    { 
      userId: user._id, 
      email: user.email, 
      name: user.name,
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const token = request.cookies.get('token')?.value
  return token || null
}

export function getUserFromRequest(request: NextRequest): any {
  const token = getTokenFromRequest(request)
  if (!token) return null
  return verifyToken(token)
}
