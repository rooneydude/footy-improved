# FootyTracker - Complete Event Tracker PWA

## Overview

Build the complete Event Tracker PWA with all 5 event types (Soccer, Basketball, Baseball, Tennis, Concerts), full API integrations, media attachments, achievements system, year-in-review generator, event recommendations, and multi-user support. Deploy to Railway with PostgreSQL database.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                          RAILWAY                                 │
│                                                                  │
│   ┌─────────────────────┐         ┌─────────────────────────┐   │
│   │    Next.js 14 App   │ ◄─────► │   PostgreSQL Database   │   │
│   │    (App Router)     │         │   (All user data)       │   │
│   │                     │         │                         │   │
│   │  - React Frontend   │         │  - Users & Auth         │   │
│   │  - API Routes       │         │  - Events & Stats       │   │
│   │  - NextAuth.js      │         │  - Media metadata       │   │
│   └─────────────────────┘         └─────────────────────────┘   │
│             │                                                    │
│             ▼                                                    │
│   ┌─────────────────────┐                                       │
│   │  Cloudflare R2 /    │  (Optional: for media file storage)   │
│   │  Railway Volume     │                                       │
│   └─────────────────────┘                                       │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
      ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
      │ Football-   │ │ balldontlie │ │ Setlist.fm  │
      │ Data.org    │ │ .io         │ │ API         │
      │ API         │ │ API         │ │             │
      └─────────────┘ └─────────────┘ └─────────────┘
              │               │               │
              └───────────────┼───────────────┘
                              │
                              ▼
        ┌──────────────────────────────────────┐
        │  📱 Phone    💻 Laptop    🖥️ Any PC   │
        │     All users access same app        │
        │     Each user sees only their data   │
        └──────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 14 (App Router) |
| **Database** | PostgreSQL (hosted on Railway) |
| **ORM** | Prisma |
| **Authentication** | NextAuth.js (Email + OAuth providers) |
| **Styling** | Tailwind CSS + custom dark sports theme |
| **UI Components** | shadcn/ui (customized) |
| **State** | Zustand (client) + React Query (server) |
| **Maps** | Mapbox GL JS |
| **Charts** | Recharts |
| **Animations** | Framer Motion |
| **File Storage** | Cloudflare R2 or Railway Volume |
| **PWA** | next-pwa + Workbox |
| **Deployment** | Railway |

---

## Database Schema (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============== AUTH ==============

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Auth relations
  accounts Account[]
  sessions Session[]

  // App data relations
  events           Event[]
  achievements     UserAchievement[]
  companions       Companion[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// ============== CORE ENTITIES ==============

model Event {
  id        String   @id @default(cuid())
  userId    String
  type      EventType
  date      DateTime
  venueId   String
  notes     String?  @db.Text
  rating    Int?     // 1-5 stars
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  venue       Venue         @relation(fields: [venueId], references: [id])
  companions  EventCompanion[]
  media       Media[]

  // Sport-specific relations (only one will be populated)
  soccerMatch     SoccerMatch?
  basketballGame  BasketballGame?
  baseballGame    BaseballGame?
  tennisMatch     TennisMatch?
  concert         Concert?

  // Achievement trigger
  triggeredAchievements UserAchievement[]

  @@index([userId, date])
  @@index([userId, type])
}

enum EventType {
  SOCCER
  BASKETBALL
  BASEBALL
  TENNIS
  CONCERT
}

model Venue {
  id        String    @id @default(cuid())
  name      String
  city      String
  country   String
  latitude  Float?
  longitude Float?
  type      VenueType
  createdAt DateTime  @default(now())

  events Event[]

  @@unique([name, city, country])
}

enum VenueType {
  STADIUM
  ARENA
  THEATER
  OTHER
}

model Companion {
  id        String   @id @default(cuid())
  userId    String
  name      String
  createdAt DateTime @default(now())

  user   User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  events EventCompanion[]

  @@unique([userId, name])
}

model EventCompanion {
  eventId     String
  companionId String

  event     Event     @relation(fields: [eventId], references: [id], onDelete: Cascade)
  companion Companion @relation(fields: [companionId], references: [id], onDelete: Cascade)

  @@id([eventId, companionId])
}

model Media {
  id            String    @id @default(cuid())
  eventId       String
  type          MediaType
  url           String    // URL to stored file
  thumbnailUrl  String?   // URL to thumbnail
  caption       String?
  createdAt     DateTime  @default(now())

  event Event @relation(fields: [eventId], references: [id], onDelete: Cascade)
}

enum MediaType {
  PHOTO
  VIDEO
  TICKET
}

// ============== PLAYERS & ARTISTS ==============

model Player {
  id          String  @id @default(cuid())
  name        String
  sport       Sport
  team        String?
  nationality String?
  externalId  String? // API ID for lookups
  photoUrl    String?

  soccerAppearances     SoccerAppearance[]
  basketballAppearances BasketballAppearance[]
  baseballAppearances   BaseballAppearance[]
  tennisAppearances     TennisAppearance[]

  @@unique([name, sport])
  @@index([sport])
}

enum Sport {
  SOCCER
  BASKETBALL
  BASEBALL
  TENNIS
}

model Artist {
  id         String  @id @default(cuid())
  name       String  @unique
  genre      String?
  mbid       String? // MusicBrainz ID
  photoUrl   String?

  concerts Concert[]
}

// ============== SOCCER ==============

model SoccerMatch {
  id              String @id @default(cuid())
  eventId         String @unique
  homeTeam        String
  awayTeam        String
  homeScore       Int?
  awayScore       Int?
  competition     String?
  externalMatchId String? // Football-Data.org match ID

  event       Event              @relation(fields: [eventId], references: [id], onDelete: Cascade)
  appearances SoccerAppearance[]
}

model SoccerAppearance {
  id            String  @id @default(cuid())
  matchId       String
  playerId      String
  team          String  // Which team they played for
  goals         Int     @default(0)
  assists       Int     @default(0)
  cleanSheet    Boolean @default(false)
  yellowCard    Boolean @default(false)
  redCard       Boolean @default(false)
  minutesPlayed Int?

  match  SoccerMatch @relation(fields: [matchId], references: [id], onDelete: Cascade)
  player Player      @relation(fields: [playerId], references: [id])

  @@unique([matchId, playerId])
}

// ============== BASKETBALL ==============

model BasketballGame {
  id             String @id @default(cuid())
  eventId        String @unique
  homeTeam       String
  awayTeam       String
  homeScore      Int?
  awayScore      Int?
  competition    String?
  externalGameId String? // balldontlie.io game ID

  event       Event                  @relation(fields: [eventId], references: [id], onDelete: Cascade)
  appearances BasketballAppearance[]
}

model BasketballAppearance {
  id       String @id @default(cuid())
  gameId   String
  playerId String
  team     String
  points   Int    @default(0)
  rebounds Int    @default(0)
  assists  Int    @default(0)

  game   BasketballGame @relation(fields: [gameId], references: [id], onDelete: Cascade)
  player Player         @relation(fields: [playerId], references: [id])

  @@unique([gameId, playerId])
}

// ============== BASEBALL ==============

model BaseballGame {
  id             String @id @default(cuid())
  eventId        String @unique
  homeTeam       String
  awayTeam       String
  homeScore      Int?
  awayScore      Int?
  competition    String?
  externalGameId String? // MLB Stats API game ID

  event       Event                @relation(fields: [eventId], references: [id], onDelete: Cascade)
  appearances BaseballAppearance[]
}

model BaseballAppearance {
  id       String @id @default(cuid())
  gameId   String
  playerId String
  team     String
  homeRuns Int    @default(0)
  hits     Int    @default(0)
  rbis     Int    @default(0)

  game   BaseballGame @relation(fields: [gameId], references: [id], onDelete: Cascade)
  player Player       @relation(fields: [playerId], references: [id])

  @@unique([gameId, playerId])
}

// ============== TENNIS ==============

model TennisMatch {
  id         String  @id @default(cuid())
  eventId    String  @unique
  player1    String  // Name (may not be in Player table)
  player2    String
  winner     String?
  score      String? // e.g., "6-4, 3-6, 7-5"
  tournament String?
  round      String? // e.g., "Final", "Semi-Final"

  event       Event              @relation(fields: [eventId], references: [id], onDelete: Cascade)
  appearances TennisAppearance[]
}

model TennisAppearance {
  id         String  @id @default(cuid())
  matchId    String
  playerId   String
  won        Boolean @default(false)
  setsWon    Int     @default(0)

  match  TennisMatch @relation(fields: [matchId], references: [id], onDelete: Cascade)
  player Player      @relation(fields: [playerId], references: [id])

  @@unique([matchId, playerId])
}

// ============== CONCERTS ==============

model Concert {
  id               String   @id @default(cuid())
  eventId          String   @unique
  artistId         String
  tourName         String?
  openingActs      String[] // Array of opening act names
  externalSetlistId String? // Setlist.fm ID

  event   Event         @relation(fields: [eventId], references: [id], onDelete: Cascade)
  artist  Artist        @relation(fields: [artistId], references: [id])
  setlist SetlistItem[]
}

model SetlistItem {
  id        String  @id @default(cuid())
  concertId String
  songName  String
  order     Int
  isEncore  Boolean @default(false)
  notes     String?

  concert Concert @relation(fields: [concertId], references: [id], onDelete: Cascade)

  @@unique([concertId, order])
}

// ============== ACHIEVEMENTS ==============

model Achievement {
  id          String          @id @default(cuid())
  key         String          @unique // e.g., "FIRST_EVENT", "CENTURY"
  name        String
  description String
  icon        String          // Icon name or emoji
  tier        AchievementTier
  criteria    Json            // Flexible criteria definition

  users UserAchievement[]
}

enum AchievementTier {
  BRONZE
  SILVER
  GOLD
  PLATINUM
}

model UserAchievement {
  id            String   @id @default(cuid())
  userId        String
  achievementId String
  unlockedAt    DateTime @default(now())
  triggerEventId String?

  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  achievement Achievement @relation(fields: [achievementId], references: [id])
  triggerEvent Event?     @relation(fields: [triggerEventId], references: [id])

  @@unique([userId, achievementId])
}
```

---

## Project Structure

```
footy-improved/
├── app/
│   ├── layout.tsx                    # Root layout, providers, fonts
│   ├── page.tsx                      # Landing/Dashboard (auth-gated)
│   ├── globals.css                   # Global styles
│   │
│   ├── (auth)/                       # Auth routes (public)
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── layout.tsx
│   │
│   ├── (app)/                        # Protected app routes
│   │   ├── layout.tsx                # App shell with nav
│   │   ├── dashboard/page.tsx        # User dashboard
│   │   ├── events/
│   │   │   ├── page.tsx              # Timeline view
│   │   │   ├── [id]/page.tsx         # Event detail
│   │   │   └── new/
│   │   │       ├── page.tsx          # Event type selector
│   │   │       ├── soccer/page.tsx
│   │   │       ├── basketball/page.tsx
│   │   │       ├── baseball/page.tsx
│   │   │       ├── tennis/page.tsx
│   │   │       └── concert/page.tsx
│   │   ├── stats/
│   │   │   ├── page.tsx              # Stats dashboard
│   │   │   ├── leaderboards/page.tsx
│   │   │   ├── players/[id]/page.tsx
│   │   │   └── artists/[id]/page.tsx
│   │   ├── map/page.tsx
│   │   ├── achievements/page.tsx
│   │   ├── year-review/
│   │   │   ├── page.tsx
│   │   │   └── [year]/page.tsx
│   │   └── settings/page.tsx
│   │
│   └── api/
│       ├── auth/[...nextauth]/route.ts  # NextAuth handler
│       ├── events/
│       │   ├── route.ts                  # CRUD events
│       │   └── [id]/route.ts
│       ├── stats/route.ts
│       ├── achievements/route.ts
│       ├── upload/route.ts               # Media upload
│       │
│       └── external/                     # API proxies
│           ├── football/route.ts
│           ├── basketball/route.ts
│           ├── baseball/route.ts
│           └── concerts/route.ts
│
├── components/
│   ├── ui/                           # shadcn/ui components
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── BottomNav.tsx
│   │   ├── Sidebar.tsx
│   │   └── UserMenu.tsx
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── SocialButtons.tsx
│   ├── events/
│   │   ├── EventCard.tsx
│   │   ├── EventTimeline.tsx
│   │   ├── EventDetail.tsx
│   │   └── forms/
│   │       ├── SoccerForm.tsx
│   │       ├── BasketballForm.tsx
│   │       ├── BaseballForm.tsx
│   │       ├── TennisForm.tsx
│   │       └── ConcertForm.tsx
│   ├── stats/
│   │   ├── StatCard.tsx
│   │   ├── Leaderboard.tsx
│   │   └── charts/
│   ├── achievements/
│   │   ├── AchievementCard.tsx
│   │   ├── AchievementGrid.tsx
│   │   └── UnlockToast.tsx
│   ├── map/
│   │   └── VenueMap.tsx
│   └── shared/
│       ├── MediaUploader.tsx
│       ├── CompanionPicker.tsx
│       ├── RatingStars.tsx
│       └── VenueAutocomplete.tsx
│
├── lib/
│   ├── prisma.ts                     # Prisma client singleton
│   ├── auth.ts                       # NextAuth configuration
│   ├── api/
│   │   ├── football-data.ts
│   │   ├── balldontlie.ts
│   │   ├── mlb.ts
│   │   └── setlist-fm.ts
│   ├── achievements/
│   │   ├── definitions.ts
│   │   └── checker.ts
│   ├── stats/
│   │   ├── calculations.ts
│   │   └── leaderboards.ts
│   └── utils/
│       ├── dates.ts
│       └── formatting.ts
│
├── hooks/
│   ├── useEvents.ts
│   ├── useStats.ts
│   └── useAchievements.ts
│
├── stores/
│   └── app.ts                        # Zustand store
│
├── prisma/
│   ├── schema.prisma                 # Database schema
│   ├── seed.ts                       # Seed achievements
│   └── migrations/                   # Auto-generated
│
├── public/
│   ├── manifest.json
│   └── icons/
│
├── types/
│   └── index.ts
│
├── .env.example
├── .env.local                        # Local env (not committed)
├── next.config.js
├── tailwind.config.ts
├── package.json
└── README.md
```

---

## Environment Variables

```bash
# .env.example

# Database (Railway provides this)
DATABASE_URL="postgresql://user:password@host:5432/database"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# OAuth Providers (optional - can start with email only)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# External APIs
FOOTBALL_DATA_API_KEY=""
BALLDONTLIE_API_KEY=""
SETLIST_FM_API_KEY=""

# Maps
NEXT_PUBLIC_MAPBOX_TOKEN=""

# File Storage (optional - can use Railway volume initially)
CLOUDFLARE_R2_ACCESS_KEY=""
CLOUDFLARE_R2_SECRET_KEY=""
CLOUDFLARE_R2_BUCKET=""
```

---

## Authentication Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   User      │────►│  NextAuth   │────►│  PostgreSQL │
│   Browser   │     │  (login)    │     │  (users)    │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   Session   │
                    │   Cookie    │
                    └─────────────┘

Supported Login Methods:
- Email + Password (credentials)
- Google OAuth
- GitHub OAuth
- (More can be added)
```

---

## Multi-User Data Isolation

Every query filters by `userId`:

```typescript
// Example: Get user's events
const events = await prisma.event.findMany({
  where: { userId: session.user.id },
  orderBy: { date: 'desc' }
});

// Example: Get user's stats
const goalsWitnessed = await prisma.soccerAppearance.aggregate({
  where: { match: { event: { userId: session.user.id } } },
  _sum: { goals: true }
});
```

---

## Implementation Phases

### Phase 1: Foundation & Auth ✦
- [x] Initialize Next.js 14 with TypeScript
- [ ] Set up Tailwind + shadcn/ui
- [ ] Configure Prisma with PostgreSQL
- [ ] Implement NextAuth.js (email + Google)
- [ ] Create auth pages (login/register)
- [ ] Build app shell layout

### Phase 2: Core Event System
- [ ] Event CRUD API routes
- [ ] Event type selector page
- [ ] Soccer match form + detail view
- [ ] Venue autocomplete component
- [ ] Basic event timeline

### Phase 3: All Event Types
- [ ] Basketball form + API integration
- [ ] Baseball form + API integration  
- [ ] Tennis form (manual entry)
- [ ] Concert form + Setlist.fm integration

### Phase 4: Stats & Leaderboards
- [ ] Stats calculation service
- [ ] Leaderboard components
- [ ] Player profile pages
- [ ] Artist profile pages
- [ ] Stats dashboard with charts

### Phase 5: Map & Timeline
- [ ] Mapbox integration
- [ ] Venue pins + clustering
- [ ] Map filters
- [ ] Enhanced timeline with filters

### Phase 6: Media System
- [ ] File upload API (Railway volume or R2)
- [ ] Photo upload component
- [ ] Media gallery
- [ ] Thumbnail generation

### Phase 7: Achievements
- [ ] Seed achievement definitions
- [ ] Achievement checker service
- [ ] Unlock notifications
- [ ] Achievements page

### Phase 8: Year Review & Polish
- [ ] Year in review generator
- [ ] Shareable image export
- [ ] PWA manifest + service worker
- [ ] Performance optimization

### Phase 9: Deploy
- [ ] Railway PostgreSQL setup
- [ ] Environment variables
- [ ] Production deployment
- [ ] Custom domain (optional)

---

## Railway Deployment

### Services Needed:

1. **Web Service** - Next.js app
2. **PostgreSQL** - Database

### Setup Steps:

```bash
# 1. Create Railway project
# 2. Add PostgreSQL service
# 3. Connect GitHub repo
# 4. Set environment variables
# 5. Deploy
```

### Estimated Costs:

| Service | Free Tier | Paid |
|---------|-----------|------|
| Railway Hobby | $5/month credit | ~$5-20/month |
| PostgreSQL | Included | Included |
| **Total** | Often free for small apps | ~$10-20/month |

---

## Design System

### Colors (Dark Sports Theme)

```css
:root {
  --background: #0a0a0b;
  --card: #121214;
  --card-hover: #1a1a1d;
  --border: #2a2a2d;
  
  --text-primary: #fafafa;
  --text-secondary: #a1a1aa;
  
  --accent-green: #22c55e;   /* goals, wins */
  --accent-yellow: #eab308;  /* cards, warnings */
  --accent-blue: #3b82f6;    /* assists, info */
  --accent-red: #ef4444;     /* red cards, losses */
  --accent-purple: #a855f7;  /* concerts */
  --accent-orange: #f97316;  /* basketball */
}
```

### Typography

- **Headings**: Inter (bold)
- **Body**: Inter (regular)  
- **Stats/Numbers**: JetBrains Mono

---

## Achievements System (30+ Badges)

### Event Milestones
- 🎫 **First Memory** - Log your first event
- 🔟 **Getting Started** - Log 10 events
- 💯 **Century** - Log 100 events
- 🏆 **Dedicated Fan** - Log 500 events

### Geographic
- 🌍 **Globe Trotter** - Events in 5+ countries
- ✈️ **World Traveler** - Events in 10+ countries
- 🏠 **Home Ground** - 10+ events at same venue

### Soccer
- ⚽ **Goal Machine** - Witness 100+ goals
- 🧤 **Clean Sheet Club** - 10+ clean sheets
- 🟥 **Red Mist** - Witness a red card

### Basketball
- 🏀 **Triple Double** - Witness a triple-double

### Tennis
- 🎾 **Grand Slam** - Attend all 4 majors

### Concerts
- 🎤 **Superfan** - Same artist 5+ times
- 🎸 **Encore** - Attend 50+ concerts

### Special
- 📅 **Triple Header** - 3 events in one day
- 🔥 **Streak Master** - Events every month for 6 months

---

## Success Criteria

- [ ] Users can sign up and log in
- [ ] Log any of 5 event types with API auto-fill
- [ ] All data isolated per user
- [ ] View personal leaderboards ("players I've seen most")
- [ ] Browse events on interactive map
- [ ] Track progress on 30+ achievements
- [ ] Generate Year in Review
- [ ] Works on mobile and desktop
- [ ] Deployed and accessible on Railway


