# Code Review Next.js Test

Test repository for validating N+1 detection in Next.js applications.

## Purpose
- Verify frontend components (`.map()` rendering) don't trigger false positives
- Verify API routes with actual N+1 patterns are detected

## Test Scenarios
1. Frontend component rendering (should NOT detect)
2. API routes with HTTP/DB N+1 (should detect)
3. Server actions with cache per-item (should detect)
