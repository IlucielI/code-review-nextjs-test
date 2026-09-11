import { NextRequest, NextResponse } from 'next/server'

// Mock external API
async function fetchUserProfile(userId: string) {
  // Simulates HTTP call to external service
  const response = await fetch(`https://api.example.com/users/${userId}`)
  return response.json()
}

export async function GET(request: NextRequest) {
  const userIds = ['user1', 'user2', 'user3', 'user4']
  
  // N+1 PROBLEM: HTTP call inside loop
  // This SHOULD be detected as external API N+1
  const profiles = []
  for (const userId of userIds) {
    const profile = await fetchUserProfile(userId)
    profiles.push(profile)
  }
  
  return NextResponse.json({ profiles })
}
