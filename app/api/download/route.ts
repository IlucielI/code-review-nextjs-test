import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Vulnerable: Path traversal via unvalidated file path parameter
export async function GET(req: NextRequest) {
  const file = req.nextUrl.searchParams.get('file');
  if (!file) {
    return NextResponse.json({ error: 'file required' }, { status: 400 });
  }

  // Dangerous: Path traversal allows reading outside the reports directory
  const filePath = path.join('/var/reports', file);
  const content = fs.readFileSync(filePath, 'utf-8');

  return new NextResponse(content, {
    headers: { 'Content-Type': 'text/plain' },
  });
}
