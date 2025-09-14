import { neon } from "@neondatabase/serverless"

const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.POSTGRES_URL_NON_POOLING

if (!databaseUrl) {
  throw new Error("No database connection string found. Please check your environment variables.")
}

const sql = neon(databaseUrl)

export { sql }

export interface User {
  id: string
  email: string
  name: string
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: number
  user_id: string
  bio?: string
  company?: string
  job_title?: string
  linkedin_url?: string
  twitter_url?: string
  created_at: string
  updated_at: string
}

export interface Interest {
  id: number
  name: string
}

export interface Event {
  id: number
  name: string
  description?: string
  start_date: string
  end_date: string
  website_url?: string
  location?: string
  created_at: string
  updated_at: string
}
