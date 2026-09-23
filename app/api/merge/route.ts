import { NextResponse } from 'next/server';

// Vulnerable: unsafe recursive merge vulnerable to Prototype Pollution
function unsafeMerge(target: any, source: any) {
  for (const key in source) {
    if (typeof source[key] === 'object' && source[key] !== null) {
      if (!target[key]) target[key] = {};
      unsafeMerge(target[key], source[key]); // BUG: allows prototype pollution via __proto__ or constructor.prototype
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

export async function POST(req: Request) {
  const body = await req.json();
  const config = unsafeMerge({}, body);
  return NextResponse.json({ success: true, config });
}
