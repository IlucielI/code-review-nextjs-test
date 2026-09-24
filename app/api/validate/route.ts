// Email validation with catastrophic backtracking
import { NextRequest, NextResponse } from 'next/server';

// Vulnerable: ReDoS via nested quantifiers
const emailRegex = /^([a-zA-Z0-9_\-\.]+)+@([a-zA-Z0-9_\-\.]+)+\.([a-zA-Z]{2,5})$/;
const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)+\.([a-z\.]{2,6})+([\/\w \.-]*)*\/?$/;

// Vulnerable: Public endpoint with expensive regex
export async function POST(request: NextRequest) {
  const { email, url, phone } = await request.json();

  // Catastrophic backtracking on malicious input
  // Example: "aaaaaaaaaaaaaaaaaaaaaaaaa!" causes exponential time
  if (emailRegex.test(email)) {
    // Email validation vulnerable to ReDoS
  }

  if (urlRegex.test(url)) {
    // URL validation vulnerable to ReDoS
  }

  // Another vulnerable pattern
  const phoneRegex = /^(\d{3}-?)+\d{4}$/;
  if (phoneRegex.test(phone)) {
    // Phone validation with nested quantifiers
  }

  return NextResponse.json({ valid: true });
}

// Vulnerable: Used in search endpoint
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q') || '';

  // Complex regex on user input
  const searchRegex = new RegExp(`(${query})+`, 'gi');
  const results = sampleData.filter(item => searchRegex.test(item));

  return NextResponse.json({ results });
}

const sampleData = ['test1', 'test2', 'test3'];
