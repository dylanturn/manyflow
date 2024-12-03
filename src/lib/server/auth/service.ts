import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { getDb } from '../db'
import { User, validateUser } from '../validation'
import { Cache } from '../cache'
import config from '../config'

const JWT_SECRET = config.auth.jwtSecret
const JWT_EXPIRES_IN = config.auth.jwtExpiresIn

export class AuthService {
  static async createUser(userData: Omit<User, 'role'>): Promise<{ user: User; token: string }> {
    const db = await getDb()
    const validatedData = validateUser({ ...userData, role: 'user' })
    
    // Check if user exists
    const existingUser = await db.get('SELECT * FROM users WHERE username = ?', validatedData.username)
    if (existingUser) {
      throw new Error('Username already exists')
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10)
    
    // Create user
    const id = crypto.randomUUID()
    await db.run(
      'INSERT INTO users (id, username, password_hash, email, role) VALUES (?, ?, ?, ?, ?)',
      id,
      validatedData.username,
      hashedPassword,
      validatedData.email,
      validatedData.role
    )

    const user = {
      id,
      username: validatedData.username,
      email: validatedData.email,
      role: validatedData.role as 'user' | 'admin'
    }

    const token = this.generateToken(user)
    return { user, token }
  }

  static async login(username: string, password: string): Promise<{ user: User; token: string }> {
    const db = await getDb()
    
    // Get user
    const user = await db.get('SELECT * FROM users WHERE username = ?', username)
    if (!user) {
      throw new Error('Invalid credentials')
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash)
    if (!isValid) {
      throw new Error('Invalid credentials')
    }

    // Update last login
    await db.run(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      user.id
    )

    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role as 'user' | 'admin'
    }

    const token = this.generateToken(userData)
    return { user: userData, token }
  }

  static async validateToken(token: string): Promise<User> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as User & { exp: number }
      
      // Check if token is about to expire and refresh if needed
      const expirationThreshold = 3600 // 1 hour
      if (decoded.exp - Math.floor(Date.now() / 1000) < expirationThreshold) {
        const newToken = this.generateToken(decoded)
        // You might want to handle token refresh in your application
      }

      return decoded
    } catch (error) {
      throw new Error('Invalid token')
    }
  }

  private static generateToken(user: Partial<User> & { id: string }): string {
    return jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )
  }
}
