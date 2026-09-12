import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Insecure cookie: setting authentication token with httpOnly: false and secure: false
export async function POST(req: NextRequest) {
    const { token } = await req.json();
    cookies().set('session_token', token, {
        httpOnly: false,
        secure: false,
    });
    return NextResponse.json({ status: 'cookie_set' });
}
