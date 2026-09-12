# Next.js & React Benchmark Test Suite

[![Next.js Version](https://img.shields.io/badge/Next.js-14%2B%20App%20Router-black.svg?logo=next.js)](https://nextjs.org/)
[![React Version](https://img.shields.io/badge/React-18%2B-61DAFB.svg?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Benchmark Category](https://img.shields.io/badge/Benchmark-N%2B1%20%26%20Async%20Patterns-green.svg)](#test-case-matrix)
[![Safe Guard](https://img.shields.io/badge/JSX%20FP%20Guard-Active-brightgreen.svg)](#frontend-guard-components)

Benchmark test suite for automated code review engines on Next.js (App Router) and React full-stack applications. This repository evaluates precision in differentiating between frontend JSX array rendering and actual backend API route N+1 bottlenecks, alongside async logic bugs, memory leaks, and web security vulnerabilities.

---

## 🎯 Benchmark Purpose

1. **Frontend vs Backend Precision:** Ensures review engines do **NOT** flag React client component JSX iteration (`items.map(...)`) as N+1 database queries.
2. **True N+1 Query Detection:** Accurately catches sequential database roundtrips, iterative Redis cache queries, and chained HTTP external API calls inside loops.
3. **Async / React Traps:** Identifies broken `async` handling (unawaited `Promise.all` with `.map`), memory leaks in `useEffect` lifecycles, and prototype pollution.
4. **Full-Stack Security:** Catches SSRF, Path Traversal, ReDoS, CORS misconfiguration, and XSS via `dangerouslySetInnerHTML`.

---

## 📋 Test Case Matrix

### ⚡ Performance & Async Traps (Backend API Routes)

| File | Issue / Pattern | Subsystem | Severity | Expected Detection |
| :--- | :--- | :--- | :---: | :---: |
| `app/api/users/route.ts` | Sequential database query inside loop (`db.getUserById`) | Database N+1 | High | **Detected** |
| `app/api/profiles/route.ts` | Sequential external HTTP fetch inside loop | HTTP API N+1 | High | **Detected** |
| `app/api/cache/route.ts` | Iterative Redis `GET` per item instead of `MGET` | Cache N+1 | Medium | **Detected** |
| `app/api/orders/route.ts` | Async `.map()` callback returning unawaited `Promise[]` | Async Logic Bug | High | **Detected** |
| `components/LeakyComponent.tsx` | Uncleaned EventListeners / WebSockets in `useEffect` | React Memory Leak | Medium | **Detected** |

### 🔴 Security Vulnerabilities

| File | Issue / Pattern | CWE / Category | Severity | Expected |
| :--- | :--- | :--- | :---: | :---: |
| `app/api/orders/route.ts` | Prototype Pollution via unvalidated object merge | CWE-1321 | High | **BLOCKING** |
| `app/api/proxy/route.ts` | Server-Side Request Forgery (SSRF) via raw `fetch(url)` | CWE-918 | High | **BLOCKING** |
| `app/api/download/route.ts` | Path Traversal via unvalidated filename concatenation | CWE-22 | High | **BLOCKING** |
| `components/UserBioCard.tsx` | Cross-Site Scripting (XSS) via `dangerouslySetInnerHTML` | CWE-79 | High | **BLOCKING** |
| `app/api/sensitive/route.ts` | Insecure CORS (`*` wildcard with `credentials: include`) | CWE-942 | High | **BLOCKING** |
| `app/api/auth/route.ts` | Hardcoded JWT Secret & Missing Rate Limiting | CWE-798 / CWE-307 | High | **BLOCKING** |
| `app/api/validate/route.ts` | Catastrophic Backtracking ReDoS Regular Expression | CWE-1333 | Medium | **NON-BLOCKING** |
| `app/api/exec/route.ts` | Command Injection via \`child_process.exec\` | CWE-78 | High | **BLOCKING** |
| `app/api/cookie/route.ts` | Session cookie configured with \`httpOnly: false\` and \`secure: false\` | CWE-614 / CWE-1004 | Medium | **NON-BLOCKING** |
| `app/api/xml/route.ts` | XML parser without entity expansion controls (XXE) | CWE-611 | High | **BLOCKING** |

---

## 🛡️ Frontend Guard Components (Zero False Positive Expectation)

Standard React applications heavily utilize `.map()` to render JSX elements. Review engines must distinguish between UI rendering and data-fetching loops:

| File | Implementation Pattern | Expected Reviewer Result |
| :--- | :--- | :---: |
| `components/ProductGrid.tsx` | Pure JSX rendering with `products.map(p => <Card key={p.id} />)` | **0 False Positives** (Ignored) |
| `components/UserList.tsx` | Pure JSX rendering with `users.map(u => <Row key={u.id} />)` | **0 False Positives** (Ignored) |

---

## 🚀 How to Run the Benchmark

```bash
# View PR on GitHub
gh pr view 1 --web

# Trigger Review via API
curl -X POST http://localhost:8081/api/v1/review/trigger \
  -H "Content-Type: application/json" \
  -d '{
    "repository": "IlucielI/code-review-nextjs-test",
    "pull_request_id": 1
  }'
```

---

## 📊 Benchmark Validation Results

- **True N+1 & Performance Detections:** 5 / 5 (100%)
- **Security Vulnerability Detections:** 10 / 10 (100%)
- **False Positives on Frontend JSX `.map()`:** 0 (Clean)
