# Next.js Test Suite - Performance & Async Pattern Validation

**Purpose:** N+1 query detection accuracy, async/await patterns, and frontend vs API route performance testing.

**PR:** https://github.com/IlucielI/code-review-nextjs-test/pull/1  
**Status:** ✅ Validation Complete (2026-09-11)

---

## Test Categories

### 🔴 Performance Issues (N+1 Queries)

| File | Issue | Pattern | Severity | Expected Detection |
|------|-------|---------|----------|-------------------|
| `app/api/cache/route.ts` | Redis GET per-item in loop | Sequential I/O | Medium | ✅ NON-BLOCKING |
| `app/api/users/route.ts` | Database query per userId | N+1 database | Medium | ✅ NON-BLOCKING |
| `app/api/profiles/route.ts` | Sequential `fetchUserProfile` | N+1 API calls | Medium | ✅ NON-BLOCKING |

### ⚠️ Async/Await Logic Errors

| File | Issue | Type | Severity | Expected Detection |
|------|-------|------|----------|-------------------|
| `app/api/orders/route.ts` | `map` with async callback returns Promise[] | Logic | Medium | ⚠️ MISCLASSIFIED as N+1 |

### 🔴 Security Vulnerabilities

| File | Issue | Type | Severity | Expected Detection |
|------|-------|------|----------|-------------------|
| `app/api/orders/route.ts` | Prototype Pollution (CVE-2022-24999) | Security | High | ✅ BLOCKING |
| `app/api/sensitive/route.ts` | CORS Misconfiguration (wildcard + credentials) | Security | High | ✅ BLOCKING |
| `app/api/auth/route.ts` | Missing Rate Limiting (brute force vulnerable) | Security | Medium | ✅ NON-BLOCKING |
| `app/api/validate/route.ts` | ReDoS (catastrophic backtracking regex) | Security | Medium | ✅ NON-BLOCKING |

### 🔴 Performance & Memory Issues

| File | Issue | Type | Severity | Expected Detection |
|------|-------|------|----------|-------------------|
| `components/LeakyComponent.tsx` | Memory Leak (EventEmitter/WebSocket no cleanup) | Performance | Medium | ✅ NON-BLOCKING |
| `app/api/users/route.ts` | Missing Input Validation (direct DB insert) | Security | Medium | ✅ NON-BLOCKING |

---

## Validation Results

**Date:** 2026-09-11  
**Review System:** go-mr-reviewer v0.0.55  
**Trigger Method:** REST API (`POST /api/v1/reviews`)

### Detection Metrics
- **Total Findings:** 14
- **True Positives (N+1):** 5 (36%)
- **Security Findings:** 6 (43%)
- **Performance/Memory:** 2 (14%)
- **False Positives (N+1):** 1 (7%) - async logic misclassified
- **Average Consensus Confidence:** 82%

### Consensus Voting
- **Unanimous Uphold (5-0):** 9 findings
- **No Challenges:** System correctly identified patterns, some category misclassification

---

## Code Examples

### ✅ TRUE POSITIVE: N+1 Cache Access

**Problematic Code:**
```typescript
// app/api/cache/route.ts
const results = [];
for (const key of keys) {
  const value = await redis.get(key); // N+1: one round-trip per key
  results.push(value);
}
```

**Fixed:**
```typescript
// Use MGET for batch retrieval
const results = await redis.mget(keys); // Single round-trip

// Or use pipeline for complex operations
const pipeline = redis.pipeline();
keys.forEach(key => pipeline.get(key));
const results = await pipeline.exec();
```

---

### ✅ TRUE POSITIVE: N+1 Database Queries

**Problematic Code:**
```typescript
// app/api/users/route.ts
const users = [];
for (const userId of userIds) {
  const user = await db.query('SELECT * FROM users WHERE id = ?', [userId]); // N+1
  users.push(user);
}
```

**Fixed:**
```typescript
// Batch query with IN clause
const users = await db.query(
  'SELECT * FROM users WHERE id IN (?)',
  [userIds]
);

// Or use ORM with eager loading
const users = await User.findAll({
  where: { id: userIds }
});
```

---

### ✅ TRUE POSITIVE: Sequential API Calls

**Problematic Code:**
```typescript
// app/api/profiles/route.ts
const profiles = [];
for (const userId of userIds) {
  const profile = await fetchUserProfile(userId); // Sequential external API calls
  profiles.push(profile);
}
```

**Fixed:**
```typescript
// Parallel execution with Promise.all
const profiles = await Promise.all(
  userIds.map(userId => fetchUserProfile(userId))
);
```

---

### ❌ FALSE POSITIVE: Async Map (Not N+1)

**Code Flagged as N+1:**
```typescript
// app/api/orders/route.ts
const enriched = orders.map(async (order) => {
  return await enrichOrder(order); // Flagged as "N+1 query"
});
```

**Reality:** This is **NOT an N+1 query** — it's a Promise handling error. The function returns `Promise<Order>[]` instead of `Order[]`.

**What reviewer should say:** "Async/await logic error: `map` returns Promise array, not enriched results"

**Actual Fix:**
```typescript
// Option 1: Use Promise.all
const enriched = await Promise.all(
  orders.map(order => enrichOrder(order))
);

// Option 2: Use for...of
const enriched = [];
for (const order of orders) {
  enriched.push(await enrichOrder(order));
}
```

**Why This is a False Positive:**
- No I/O operation per iteration (depends on `enrichOrder` implementation)
- Issue is Promise handling, not query repetition
- Should be categorized as "Logic Error", not "Performance/N+1"

---

### ✅ BONUS: Prototype Pollution

**Vulnerable Code:**
```typescript
// app/api/orders/route.ts
const config = { ...defaultConfig, ...userInput };
```

**Why Vulnerable:**
```typescript
// Attacker payload
userInput = JSON.parse('{"__proto__": {"isAdmin": true}}');
// Now ALL objects inherit isAdmin: true
```

**Fixed:**
```typescript
// Option 1: Object.assign with null prototype
const config = Object.assign(Object.create(null), defaultConfig, userInput);

// Option 2: Validate keys
const allowedKeys = ['theme', 'locale'];
const safeInput = Object.keys(userInput)
  .filter(key => allowedKeys.includes(key))
  .reduce((obj, key) => ({ ...obj, [key]: userInput[key] }), {});
```

---

## Detection Accuracy Analysis

### ✅ Correctly Identified (7/9)

1. **Redis GET in loop** → True N+1
2. **Database query per user** → True N+1
3. **Sequential API calls** → True N+1
4. **I/O calls in loop** (duplicate detections) → True N+1
5. **Prototype pollution** → Security vulnerability (bonus)

### ❌ Misclassified (2/9)

1. **Async map returning Promise[]** → Flagged as N+1, actually logic error
2. **Duplicate of #1** → Same issue, counted twice

**Root Cause:** Pattern matcher flags "async operation in loop" without distinguishing:
- **I/O operations** (database, cache, API) → True N+1
- **In-memory async transformations** → Not N+1

---

## Recommendations for Detector

### Current Heuristic:
```regex
(async|await).*(for|map|forEach)
```

### Improved Detection:
```typescript
// Check if loop contains I/O patterns
const ioPatterns = [
  'db.query', 'fetch', 'axios', 'http.get',
  'redis.get', 'cache.get',
  'findOne', 'findById', 'getById'
];

// Only flag N+1 if loop contains I/O
if (hasLoop && hasAsync && containsIOPattern) {
  flag_as_n_plus_one();
} else if (hasLoop && hasAsync) {
  flag_as_async_logic_error();
}
```

---

## Usage

### Trigger Review via REST API
```bash
curl -X POST \
  -H "X-API-Key: review-key-alert-2026" \
  -H "Content-Type: application/json" \
  -d '{"mr_url": "https://github.com/IlucielI/code-review-nextjs-test/pull/1"}' \
  http://100.103.220.104:8081/api/v1/reviews
```

### Expected Output
```json
{
  "job_id": "80b795e14ee9aad5",
  "status": "queued",
  "source": "rest_api"
}
```

### Poll Results
```bash
curl -H "X-API-Key: review-key-alert-2026" \
  "http://100.103.220.104:8081/api/review/by-id?job_id=80b795e14ee9aad5"
```

---

## Cross-Repository Validation

This test suite is part of a comprehensive validation across 3 repositories:

1. **Golang** - Security & logic bugs
2. **Next.js** (this repo) - N+1 query detection, async patterns
3. **Laravel** - Web security vulnerabilities

**Full Report:** https://github.com/IlucielI/code-review/blob/main/docs/false-positive-validation.md

### Aggregate Metrics
- **Total Findings:** 25 across all repos
- **True Positive Rate:** 92% (23/25)
- **False Positive Rate:** 8% (2/25)
- **Average Consensus Confidence:** 83%

---

## Next.js-Specific Patterns

### ✅ Successfully Detected
- Sequential I/O in loops (cache, database, API calls)
- Prototype pollution vulnerabilities
- Missing `Promise.all` for parallel async operations

### ⚠️ Misclassified
- Async `map` without I/O flagged as N+1
- Should be: "Incorrect Promise handling" category

### ❌ Not Tested (Future Coverage)
- Server Component vs Client Component data fetching
- `use client` directive violations
- React Server Actions security
- Middleware performance issues

---

## Performance Best Practices (Validated by This Suite)

### 1. **Batch I/O Operations**
❌ Never: Sequential queries in loop  
✅ Always: Single batch query or `Promise.all`

### 2. **Redis Batch Operations**
❌ Avoid: `for (key of keys) await redis.get(key)`  
✅ Use: `await redis.mget(keys)` or pipeline

### 3. **Parallel Async Execution**
❌ Avoid: `for await` when operations are independent  
✅ Use: `Promise.all` for parallel execution

### 4. **Object Merge Security**
❌ Dangerous: `{ ...userInput }`  
✅ Safe: Validate keys or use null-prototype objects

---

## Contributing

To add new test cases:
1. Add API route with intentional performance or security issue
2. Document expected detection + severity in this file
3. Run validation via REST API
4. Verify detection accuracy (true positive vs false positive)
5. Update detector recommendations if new pattern found

**Test Philosophy:** Real-world Next.js patterns from production apps. Focus on App Router and Server Components patterns.

---

## References

- [Next.js Performance Best Practices](https://nextjs.org/docs/app/building-your-application/optimizing)
- [N+1 Query Problem](https://stackoverflow.com/questions/97197/what-is-the-n1-selects-problem)
- [Prototype Pollution Explained](https://portswigger.net/web-security/prototype-pollution)
- [Promise.all vs Sequential Await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all)

# Updated: Fri Sep 11 01:05:53 PM WIB 2026
