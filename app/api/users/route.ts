// API route with missing input validation
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// Vulnerable: No input validation before database insert
export async function POST(request: NextRequest) {
  const body = await request.json();

  // Dangerous: Direct database insert without validation
  // No checks for: type, length, format, malicious content
  await sql`
    INSERT INTO users (name, email, age, bio)
    VALUES (${body.name}, ${body.email}, ${body.age}, ${body.bio})
  `;

  return NextResponse.json({ success: true });
}

// Vulnerable: No sanitization on user-generated content
export async function PUT(request: NextRequest) {
  const { userId, comment } = await request.json();

  // No XSS protection, length limits, or content filtering
  await sql`
    UPDATE comments SET content = ${comment} WHERE user_id = ${userId}
  `;

  return NextResponse.json({ updated: true });
}

// Vulnerable: Numeric input without bounds checking
export async function PATCH(request: NextRequest) {
  const { orderId, quantity } = await request.json();

  // No validation: quantity could be negative, zero, or enormous
  await sql`
    UPDATE orders SET quantity = ${quantity} WHERE id = ${orderId}
  `;

  return NextResponse.json({ success: true });
}

// Vulnerable: Array input without validation
export async function DELETE(request: NextRequest) {
  const { userIds } = await request.json();

  // No checks: userIds could be empty, malformed, or contain SQL
  for (const id of userIds) {
    await sql`DELETE FROM users WHERE id = ${id}`;
  }

  return NextResponse.json({ deleted: userIds.length });
}
