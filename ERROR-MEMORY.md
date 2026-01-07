# Error Memory Database

> **Purpose:** Track recurring errors and their resolutions to prevent repeating mistakes
> **Maintained by:** Error Memory Agent
> **Last Updated:** 2026-01-06

---

## 📊 Error Statistics

| Metric | Count |
|--------|-------|
| Total Errors Recorded | 7 |
| Errors Resolved | 7 |
| Recurring Errors | 0 |

---

## 🔴 Critical Errors

*No current critical errors.*

---

## 🟡 High Priority Errors

*No current high priority errors.*

---

## 🟢 Resolved Errors

### ERR-007: Railway Node.js Version Mismatch
- **First Occurrence:** 2026-01-07
- **Occurrence Count:** 1
- **Error Type:** Deployment/Railway
- **Error Message:** 
```
App requires Node.js >=20.9.0 but environment is using v18
npm ci failing - preact@10.11.3 missing from lockfile
```
- **Context:** Railway deployment failed due to Node.js version and lockfile sync issues
- **Root Cause:** Railway's default Nixpacks uses Node 18, and package-lock.json was out of sync
- **Resolution:** 
```json
// package.json - add engines
"engines": {
  "node": ">=20.9.0"
}
```
```toml
# .nixpacks.toml - force Node 20
[phases.setup]
nixPkgs = ["nodejs_20", "npm"]
```
```bash
# Sync lockfile
npm install
```
- **Files Updated:** `package.json`, `.nixpacks.toml`, `package-lock.json`
- **Prevention:** Always specify Node version in package.json engines and create .nixpacks.toml for Railway deployments

---

### ERR-006: Prisma Transaction Timeout with Many Players
- **First Occurrence:** 2026-01-07
- **Occurrence Count:** 1
- **Error Type:** Database/Prisma
- **Error Message:** 
```
Transaction API error: Transaction not found. Transaction ID is invalid, refers to an old closed transaction
```
- **Context:** Basketball event creation with 35+ players timed out because transaction was too slow
- **Root Cause:** Default Prisma transaction timeout is too short for many sequential DB operations
- **Resolution:** 
```typescript
// Add timeout options to $transaction
await prisma.$transaction(async (tx) => {
  // ... operations
}, {
  timeout: 60000, // 60 second timeout
  maxWait: 10000, // Max 10 seconds to acquire connection
});
```
- **Files Updated:** 
  - `app/api/events/basketball/route.ts`
  - `app/api/events/soccer/route.ts`
  - `app/api/events/baseball/route.ts`
- **Prevention:** Always add timeout options when creating many records in a transaction

---

### ERR-005: Database Schema Out of Sync (Missing columns)
- **First Occurrence:** 2026-01-07
- **Occurrence Count:** 1
- **Error Type:** Database/Prisma
- **Error Message:** 
```
The column `steals` does not exist in the current database.
Invalid `prisma.basketballAppearance.create()` invocation
```
- **Context:** Basketball event creation failed because new columns (steals, blocks, turnovers, minutes) were added to Prisma schema but not migrated to DB
- **Root Cause:** Schema updated in `prisma/schema.prisma` but `npx prisma db push` or `prisma migrate` was not run
- **Resolution:** 
```bash
# Run database sync
npx prisma db push

# Regenerate Prisma client
npx prisma generate
```
- **Files Updated:** Database schema synced
- **Prevention:** Always run `npx prisma db push` after modifying `schema.prisma`

---

### ERR-004: Frontend-Backend Type Mismatch (externalId in appearances)
- **First Occurrence:** 2026-01-06
- **Occurrence Count:** 1
- **Error Type:** Validation/Type
- **Error Message:** 
```
Validation failed
Expected string, received number at path: appearances[0].externalId
```
- **Context:** Form submission failed after fixing ERR-003 because player `externalId` was sent as number
- **Root Cause:** Backend schema defined `externalId: z.string().optional()` but frontend sent numbers from API
- **Resolution:** 
```javascript
// Changed backend schema in appearances array from:
externalId: z.string().optional()

// To accept both types:
externalId: z.union([z.string(), z.number()]).transform(v => v?.toString()).optional()
```
- **Files Updated:** 
  - `app/api/events/soccer/route.ts`
  - `app/api/events/basketball/route.ts`
  - `app/api/events/baseball/route.ts`
- **Prevention:** 
  - When using external API IDs, always accept both string and number types
  - Use `.transform()` to normalize types consistently
  - Test form submission end-to-end with API-populated data
- **Related Errors:** ERR-003 (same pattern, different field)
- **Last Updated:** 2026-01-06

### ERR-003: Frontend-Backend Type Mismatch (externalMatchId number vs string)
- **First Occurrence:** 2026-01-06
- **Occurrence Count:** 1
- **Error Type:** Validation/Type
- **Error Message:** 
```
Validation failed
at onSubmit (app\events\new\soccer\page.tsx:145:15)
```
- **Context:** Soccer form submission failed with "Validation failed" when selecting a match from API search
- **Root Cause:** Frontend Zod schema defined `externalMatchId: z.number()` but backend expected `z.string()`
- **Resolution:** 
```javascript
// Changed backend schema from:
externalMatchId: z.string().optional()

// To accept both types:
externalMatchId: z.union([z.string(), z.number()]).transform(v => v?.toString()).optional()
```
- **Files Updated:** 
  - `app/api/events/soccer/route.ts`
  - `app/api/events/basketball/route.ts`
  - `app/api/events/baseball/route.ts`
- **Prevention:** 
  - Use shared types between frontend and backend
  - API routes should be flexible with input types (accept both string and number for IDs)
  - Always test form submission end-to-end after API integration
- **Related Errors:** ERR-002 (similar frontend-backend mismatch pattern)
- **Last Updated:** 2026-01-06

### ERR-002: Form-API Field Name Mismatch (players vs appearances)
- **First Occurrence:** 2026-01-06
- **Occurrence Count:** 1
- **Error Type:** Logic/Data Flow
- **Error Message:** 
```
Players not being saved when creating events - validation passed but players array was empty in database
```
- **Context:** Event forms were sending `players` array but API routes expected `appearances` array. Also `name` field was used instead of `playerName`
- **Root Cause:** Inconsistent naming between frontend form submission and backend API schema
- **Resolution:** 
```
1. Changed form submissions from `players:` to `appearances:`
2. Changed `name:` field to `playerName:` to match Zod schema
3. Files updated: app/events/new/soccer/page.tsx, basketball/page.tsx, baseball/page.tsx
```
- **Prevention:** 
  - Always verify frontend payload matches backend Zod schema
  - Use TypeScript types shared between frontend and backend
  - Add API integration tests to catch mismatches
- **Related Errors:** None
- **Last Updated:** 2026-01-06

### ERR-001: Missing Auth Error Page
- **First Occurrence:** 2026-01-06
- **Occurrence Count:** 1
- **Error Type:** Build
- **Error Message:** 
```
Cannot find module '../../../app/auth/error/page.js' or its corresponding type declarations.
```
- **Context:** NextAuth.js configuration references `/auth/error` in `pages.error` but the page didn't exist
- **Root Cause:** NextAuth.js auth config specifies error page but component wasn't created
- **Resolution:** 
```
1. Create app/auth/error/page.tsx
2. Add proper error handling UI with error message display
3. Use Suspense for useSearchParams() hook
```
- **Prevention:** When configuring NextAuth pages, always create all referenced pages
- **Related Errors:** None
- **Last Updated:** 2026-01-06

---

## 🔍 Error Patterns

### Pattern Group: Type Mismatches with External APIs
- **Related Errors:** ERR-003, ERR-004
- **Common Root Cause:** External APIs (Football-Data.org, etc.) return numeric IDs but backend expects strings
- **Prevention Strategy:** Always use flexible Zod schemas that accept both string and number for external IDs: `z.union([z.string(), z.number()]).transform(v => v?.toString())`

---

## 📋 API Limitations Discovered

### Football-Data.org API - Lineup Availability
- **Discovery Date:** 2026-01-06
- **Issue:** "Free + 3" tier does NOT return full starting lineups
- **Data Available:**
  - ✅ Goals (scorers + assisters)
  - ✅ Bookings (yellow/red cards)
  - ✅ Substitutions (players in/out)
  - ❌ Full starting 11 lineups
- **Impact:** Can only capture players involved in match events, not all players who played
- **Workaround:** Process substitutions to capture additional players (implemented)
- **Upgrade Path:** "Standard" tier (€49/month) or higher includes lineup data
- **Files Affected:** `lib/api/football-data.ts` - added substitution processing

---

## 📝 Notes

- This file is automatically updated by the Error Memory Agent
- Errors are grouped by severity and type
- Pattern recognition helps identify systemic issues
- Always check this file FIRST when encountering errors

---

*Maintained by Error Memory Agent - Part of the Background Agents System*

