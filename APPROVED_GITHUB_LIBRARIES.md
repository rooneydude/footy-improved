# Approved GitHub Libraries

> **Purpose:** Track all approved libraries for FootyTracker development  
> **Last Updated:** 2026-01-06  
> **Minimum Requirements:** 500+ stars, active maintenance (commits within 12 months), compatible license

---

## 📋 Approval Criteria

| Criteria | Requirement |
|----------|-------------|
| GitHub Stars | 500+ minimum, prefer 1000+ |
| Last Commit | Within 12 months |
| License | MIT, Apache 2.0, BSD preferred |
| Documentation | Clear README, examples |
| TypeScript | Support preferred |

---

## ✅ Approved Libraries

### Core Framework

| Library | Stars | License | Last Active | Purpose | Approved |
|---------|-------|---------|-------------|---------|----------|
| [Next.js](https://github.com/vercel/next.js) | 130k+ | MIT | Active | React framework with App Router | ✅ 2026-01-06 |
| [React](https://github.com/facebook/react) | 230k+ | MIT | Active | UI library | ✅ 2026-01-06 |
| [TypeScript](https://github.com/microsoft/TypeScript) | 100k+ | Apache-2.0 | Active | Type safety | ✅ 2026-01-06 |

### Database & ORM

| Library | Stars | License | Last Active | Purpose | Approved |
|---------|-------|---------|-------------|---------|----------|
| [Prisma](https://github.com/prisma/prisma) | 40k+ | Apache-2.0 | Active | PostgreSQL ORM | ✅ 2026-01-06 |
| [@prisma/client](https://github.com/prisma/prisma) | 40k+ | Apache-2.0 | Active | Prisma client | ✅ 2026-01-06 |

### Authentication

| Library | Stars | License | Last Active | Purpose | Approved |
|---------|-------|---------|-------------|---------|----------|
| [NextAuth.js](https://github.com/nextauthjs/next-auth) | 25k+ | ISC | Active | OAuth authentication | ✅ 2026-01-06 |
| [@auth/prisma-adapter](https://github.com/nextauthjs/next-auth) | 25k+ | ISC | Active | Prisma adapter for NextAuth | ✅ 2026-01-06 |

### State Management

| Library | Stars | License | Last Active | Purpose | Approved |
|---------|-------|---------|-------------|---------|----------|
| [Zustand](https://github.com/pmndrs/zustand) | 48k+ | MIT | Active | Global state management | ✅ 2026-01-06 |
| [TanStack Query](https://github.com/TanStack/query) | 42k+ | MIT | Active | Server state & caching | ✅ 2026-01-06 |

### Forms & Validation

| Library | Stars | License | Last Active | Purpose | Approved |
|---------|-------|---------|-------------|---------|----------|
| [react-hook-form](https://github.com/react-hook-form/react-hook-form) | 42k+ | MIT | Active | Form handling | ✅ 2026-01-06 |
| [Zod](https://github.com/colinhacks/zod) | 35k+ | MIT | Active | Schema validation | ✅ 2026-01-06 |
| [@hookform/resolvers](https://github.com/react-hook-form/resolvers) | 2k+ | MIT | Active | Zod integration for react-hook-form | ✅ 2026-01-06 |

### Styling & UI

| Library | Stars | License | Last Active | Purpose | Approved |
|---------|-------|---------|-------------|---------|----------|
| [Tailwind CSS](https://github.com/tailwindlabs/tailwindcss) | 85k+ | MIT | Active | Utility-first CSS | ✅ 2026-01-06 |
| [shadcn/ui](https://github.com/shadcn-ui/ui) | 75k+ | MIT | Active | UI component primitives | ✅ 2026-01-06 |
| [Lucide React](https://github.com/lucide-icons/lucide) | 12k+ | ISC | Active | Icon library | ✅ 2026-01-06 |
| [class-variance-authority](https://github.com/joe-bell/cva) | 6k+ | Apache-2.0 | Active | Component variants | ✅ 2026-01-06 |
| [clsx](https://github.com/lukeed/clsx) | 8k+ | MIT | Active | Classname utility | ✅ 2026-01-06 |
| [tailwind-merge](https://github.com/dcastil/tailwind-merge) | 4k+ | MIT | Active | Merge Tailwind classes | ✅ 2026-01-06 |

### Animation

| Library | Stars | License | Last Active | Purpose | Approved |
|---------|-------|---------|-------------|---------|----------|
| [Framer Motion](https://github.com/framer/motion) | 25k+ | MIT | Active | Animation library | ✅ 2026-01-06 |

### Offline & Caching

| Library | Stars | License | Last Active | Purpose | Approved |
|---------|-------|---------|-------------|---------|----------|
| [Dexie.js](https://github.com/dexie/Dexie.js) | 11k+ | Apache-2.0 | Active | IndexedDB wrapper | ✅ 2026-01-06 |
| [dexie-react-hooks](https://github.com/dexie/Dexie.js) | 11k+ | Apache-2.0 | Active | React hooks for Dexie | ✅ 2026-01-06 |

### Utilities

| Library | Stars | License | Last Active | Purpose | Approved |
|---------|-------|---------|-------------|---------|----------|
| [date-fns](https://github.com/date-fns/date-fns) | 35k+ | MIT | Active | Date manipulation | ✅ 2026-01-06 |

---

## 🔄 Pending Evaluation

Libraries needed but not yet evaluated:

| Category | Need | Candidates to Evaluate |
|----------|------|------------------------|
| Maps | Venue mapping | Mapbox GL JS, Leaflet, react-map-gl |
| Media Storage | R2/S3 client | @aws-sdk/client-s3 |
| Image Processing | Thumbnails | sharp, browser-image-compression |

---

## ✅ Recently Approved

### Charts - Recharts ⭐ 24k+
| Library | Stars | License | Last Active | Purpose | Approved |
|---------|-------|---------|-------------|---------|----------|
| [Recharts](https://github.com/recharts/recharts) | 24k+ | MIT | Active | Charts & data visualization | ✅ 2026-01-06 |

**Evaluation:** Best choice for React - declarative, composable, built on D3, great TypeScript support.

### PWA - Serwist ⭐ 1,295 (Verified via GitHub API)
| Library | Stars | License | Last Active | Purpose | Approved |
|---------|-------|---------|-------------|---------|----------|
| [serwist](https://github.com/serwist/serwist) | 1,295 | MIT | 2026-01-05 | PWA/Service Worker for Next.js 14+ | ✅ 2026-01-06 |
| [@serwist/next](https://github.com/serwist/serwist) | 1,295 | MIT | 2026-01-05 | Next.js integration | ✅ 2026-01-06 |

**Evaluation:** Library Research Agent verified via GitHub API. Modern replacement for next-pwa with full Next.js 14 App Router support. Code adapted from official example at `serwist/serwist/examples/next-basic/`.

---

## ❌ Rejected Libraries

| Library | Reason | Alternative |
|---------|--------|-------------|
| (none yet) | | |

---

## 📚 Learning Resources

### Node.js Best Practices
- [goldbergyoni/nodebestpractices](https://github.com/goldbergyoni/nodebestpractices) - 100k+ ⭐

### React Patterns
- [alan2207/bulletproof-react](https://github.com/alan2207/bulletproof-react) - 28k+ ⭐

### TypeScript
- [type-challenges](https://github.com/type-challenges/type-challenges) - 45k+ ⭐

### Awesome Lists
- [awesome-nextjs](https://github.com/unicodeveloper/awesome-nextjs) - 9k+ ⭐
- [awesome-prisma](https://github.com/catalinmiron/awesome-prisma) - 600+ ⭐

---

## 🔧 How to Add New Libraries

1. **Search GitHub** for libraries matching your use case
2. **Verify criteria:** 500+ stars, active maintenance, compatible license
3. **Evaluate 2-3 candidates** with pros/cons comparison
4. **Document in this file** with approval date
5. **Install and implement**

### Template for New Library Evaluation

```markdown
## Evaluation: [Feature Name]

### Candidates

#### Option 1: [Library Name]
- **Repository:** https://github.com/owner/repo
- **Stars:** X,XXX
- **License:** MIT
- **Last Commit:** YYYY-MM-DD
- **Pros:** 
  - Pro 1
  - Pro 2
- **Cons:**
  - Con 1
- **Recommendation:** ✅ Approve / ❌ Reject

#### Option 2: [Library Name]
[Same format]

### Decision
Selected [Library Name] because [reasoning]
```

---

*Maintained by Library Research Agent*

