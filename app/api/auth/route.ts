// API route without rate limiting
import { NextRequest, NextResponse } from 'next/server';

// Vulnerable: No rate limiting on authentication endpoint
export async function POST(request: NextRequest) {
  const { username, password } = await request.json();

  // No rate limiting - allows brute force attacks
  const isValid = await authenticateUser(username, password);

  if (isValid) {
    return NextResponse.json({ token: 'jwt_token_here' });
  }

  return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
}

// Vulnerable: Password reset without rate limiting
export async function PUT(request: NextRequest) {
  const { email } = await request.json();

  // No rate limiting - allows email enumeration and spam
  await sendPasswordResetEmail(email);

  return NextResponse.json({ message: 'Reset email sent' });
}

async function authenticateUser(username: string, password: string): Promise<boolean> {
  // Stub: expensive bcrypt comparison
  return username === 'admin' && password === 'secret';
}

async function sendPasswordResetEmail(email: string): Promise<void> {
  // Stub: sends email
}
