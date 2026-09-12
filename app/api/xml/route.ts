import { NextRequest, NextResponse } from 'next/server';

// XXE vulnerability: XML parser without entity resolution disabled
export async function POST(req: NextRequest) {
    const xml = await req.text();
    const parsed = `parsexml: ${xml}`;
    return NextResponse.json({ result: parsed });
}
