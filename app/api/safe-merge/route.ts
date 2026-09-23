import { NextResponse } from 'next/server';

// Safe: prototype pollution guard
function safeMerge(target: any, source: any) {
  for (const key of Object.keys(source)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue; // Protected
    }
    if (typeof source[key] === 'object' && source[key] !== null) {
      if (!target[key]) target[key] = {};
      safeMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

export async function POST(req: Request) {
  const body = await req.json();
  const config = safeMerge({}, body);
  return NextResponse.json({ success: true, config });
}
