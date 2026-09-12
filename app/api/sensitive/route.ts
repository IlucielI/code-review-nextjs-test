// API route with dangerous CORS configuration
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const data = {
    userId: 123,
    email: 'user@example.com',
    ssn: '123-45-6789',
    balance: 10000
  };

  const response = NextResponse.json(data);

  // Vulnerable: Wildcard CORS with credentials
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  return response;
}

export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 });

  // Dangerous: Reflects any origin
  const origin = request.headers.get('origin');
  response.headers.set('Access-Control-Allow-Origin', origin || '*');
  response.headers.set('Access-Control-Allow-Credentials', 'true');

  return response;
}
