import { NextRequest, NextResponse } from 'next/server'

// Mock Redis client
const redis = {
  async get(key: string) {
    // Simulate cache lookup
    return `cached_value_${key}`
  }
}

export async function GET(request: NextRequest) {
  const keys = ['product:1', 'product:2', 'product:3', 'product:4']
  
  // N+1 PROBLEM: Redis.get per-item in loop
  // This SHOULD be detected as cache N+1
  const values = []
  for (const key of keys) {
    const value = await redis.get(key)
    values.push(value)
  }
  
  return NextResponse.json({ values })
}
