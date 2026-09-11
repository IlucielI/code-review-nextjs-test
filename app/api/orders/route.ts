import { NextRequest, NextResponse } from 'next/server'

// Mock database
const db = {
  orders: {
    async find(query: any) {
      return [{ id: 1, total: 100 }, { id: 2, total: 200 }]
    }
  },
  users: {
    async findById(id: string) {
      return { id, name: `User ${id}` }
    }
  }
}

export async function GET(request: NextRequest) {
  const orders = await db.orders.find({ status: 'pending' })
  
  // N+1 PROBLEM: async map without Promise.all
  // This SHOULD be detected - sequential async operations
  const enriched = orders.map(async (order: any) => {
    const user = await db.users.findById(order.userId)
    return { ...order, user }
  })
  
  // Missing: await Promise.all(enriched)
  
  return NextResponse.json({ orders: enriched })
}
