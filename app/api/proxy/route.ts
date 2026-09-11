import { NextRequest, NextResponse } from 'next/server';

// Vulnerable: Server-Side Request Forgery (SSRF) via unvalidated external fetch
export async function GET(req: NextRequest) {
  const target = req.nextUrl.searchParams.get('url');
  if (!target) {
    return NextResponse.json({ error: 'url required' }, { status: 400 });
  }

  // Dangerous: Fetching arbitrary user-controlled URL
  const response = await fetch(target);
  const data = await response.text();

  return new NextResponse(data, {
    status: response.status,
    headers: { 'Content-Type': 'text/plain' },
  });
}
