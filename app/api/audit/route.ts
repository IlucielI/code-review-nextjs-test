import { NextResponse } from 'next/server';

async function logAuditRecord(action: string, userId: string) {
  // async DB write
}

export async function POST(req: Request) {
  const { action, userId } = await req.json();
  
  // Vulnerable: Floating promise without await or catch error handler
  logAuditRecord(action, userId); // BUG: floating promise; serverless lambda might terminate before execution or throw unhandled rejection!
  
  return NextResponse.json({ status: 'ok' });
}
