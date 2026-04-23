# TravelFlow — Complete Project Documentation

> A premium, cinematic travel planning web application built for discovering, exploring, and planning trips across India.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Tech Stack & Libraries](#3-tech-stack--libraries)
4. [Directory Structure](#4-directory-structure)
5. [Database Layer](#5-database-layer)
6. [Backend — API Routes](#6-backend--api-routes)
7. [Authentication System](#7-authentication-system)
8. [Core Library Functions](#8-core-library-functions)
9. [Data Models (Mongoose Schemas)](#9-data-models-mongoose-schemas)
10. [Frontend Pages](#10-frontend-pages)
11. [Global Components](#11-global-components)
12. [Plan Page Components](#12-plan-page-components)
13. [Static Data Layer](#13-static-data-layer)
14. [Design System & Theming](#14-design-system--theming)
15. [Utility Scripts](#15-utility-scripts)
16. [Environment Variables](#16-environment-variables)
17. [Data Flow — How Frontend Integrates with Backend](#17-data-flow--how-frontend-integrates-with-backend)
18. [Feature Summary](#18-feature-summary)

---

## 1. Project Overview

**TravelFlow** is a full-stack Next.js web application that enables users to:

- Browse a curated directory of **50+ Indian travel destinations** organized by category (Beaches, Mountains, Monuments, etc.)
- Explore **cinematic travel stories and journal posts**
- Plan trips with a structured **itinerary builder** featuring a timeline, hotels, vehicles, and guides
- Search and **book hotels** using live data from the Google Hotels API (via SerpAPI)
- **Authenticate** via Google OAuth or email/password credentials
- Manage their **user profile** (username, image, account deletion)

The aesthetic is described internally as "cinematic dark mode" — inspired by premium design tools and editorial travel media.

---

## 2. System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                        │
│                                                                │
│  Next.js App Router (React 19) — Client Components            │
│  ┌──────────┐ ┌──────────────┐ ┌────────────┐ ┌──────────┐  │
│  │  Home    │ │ Destinations │ │    Plan    │ │ Profile  │  │
│  │  (/)     │ │  (/dest/*)   │ │  (/plan)   │ │ (/prof)  │  │
│  └──────────┘ └──────────────┘ └────────────┘ └──────────┘  │
│         │               │              │              │        │
│         └───────────────┴──────────────┴──────────────┘       │
│                          fetch() calls                         │
└──────────────────────────────────────────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Next.js API Routes  │
                    │  (App Router /api/*) │
                    └──────────┬──────────┘
                               │
              ┌────────────────┴─────────────────┐
              │                                   │
   ┌──────────▼──────────┐         ┌─────────────▼──────────┐
   │   MongoDB Atlas      │         │   SerpAPI (Google       │
   │   (via Mongoose +    │         │   Hotels Engine)        │
   │    MongoClient)      │         │   External 3rd party    │
   └──────────────────────┘         └────────────────────────┘
```

### Key Architectural Decisions

| Decision | Choice | Reason |
|---|---|---|
| Framework | Next.js 16 App Router | File-based routing, server components, API routes in one codebase |
| Database | MongoDB Atlas | Flexible JSON-like documents for complex location data with arrays |
| Auth | NextAuth v4 | Handles OAuth + credentials, session/JWT strategy, MongoDB adapter |
| ORM | Mongoose | Schema validation, model-level methods, TypeScript support |
| Hotel API | SerpAPI (Google Hotels) | Provides real-time structured hotel data with `google_hotels` engine |
| Styling | Tailwind CSS v4 | Utility-first, compatible with custom CSS variables for design tokens |

---

## 3. Tech Stack & Libraries

### Core Framework

| Package | Version | Role |
|---|---|---|
| `next` | `16.1.6` | Full-stack React framework (App Router, API Routes, SSR/ISR) |
| `react` | `19.2.3` | UI component library |
| `react-dom` | `19.2.3` | React DOM renderer |
| `typescript` | `^5` | Static typing for all source files |

### Authentication

| Package | Version | Role |
|---|---|---|
| `next-auth` | `^4.24.13` | Authentication library — handles Google OAuth and Credentials provider, sessions, JWT, callbacks |
| `@auth/mongodb-adapter` | `^3.11.1` | Stores NextAuth sessions, accounts, verification tokens in MongoDB (used by the Native MongoClient, not Mongoose) |
| `bcryptjs` | `^3.0.3` | Password hashing (salt rounds: 12) for credential-based users |

### Database

| Package | Version | Role |
|---|---|---|
| `mongodb` | `^7.1.1` | Native MongoDB driver — used by `MongoDBAdapter` (NextAuth) via `clientPromise` |
| `mongoose` | `^9.3.0` | ODM layer — used for data models (`User`, `Location`) and application queries |

> **Two separate DB connections exist:**
> - `mongodb-client.ts` → raw `MongoClient` → used only by **NextAuth adapter** for session/account collections
> - `mongodb.ts` → `mongoose.connect()` → used by **all API routes** for `User` and `Location` models

### External APIs

| Package | Version | Role |
|---|---|---|
| `serpapi` | `^2.2.1` | Node.js client for SerpAPI — calls the `google_hotels` engine to fetch live hotel listings, ratings, prices, and pagination tokens |

### Styling & UI

| Package | Version | Role |
|---|---|---|
| `tailwindcss` | `^4` | Utility CSS framework (configured via `@theme` in `globals.css`) |
| `@tailwindcss/postcss` | `^4` | PostCSS integration for Tailwind v4 |
| Google Fonts | CDN | `Plus Jakarta Sans` (headlines), `Inter` (body), `JetBrains Mono` (technical labels) — loaded via `next/font/google` |
| Material Symbols Outlined | CDN | Google's variable icon font for all icons throughout the UI — loaded via `<link>` in `layout.tsx` |

### Dev Tools

| Package | Version | Role |
|---|---|---|
| `tsx` | `^4.21.0` | TypeScript executor — used to run `scripts/seed.ts` and `scripts/enrich.ts` directly |
| `eslint` | `^9` | Linting |
| `eslint-config-next` | `16.1.6` | Next.js-specific ESLint ruleset |

---

## 4. Directory Structure

```
TravelApp/
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── layout.tsx             # Root layout (fonts, providers, metadata)
│   │   ├── globals.css            # Global CSS + Tailwind theme tokens
│   │   ├── page.tsx               # Home page (landing)
│   │   ├── about/                 # About page
│   │   ├── destinations/
│   │   │   ├── page.tsx           # Destinations listing + filter page
│   │   │   └── [id]/page.tsx      # Dynamic destination detail page
│   │   ├── experiences/page.tsx   # Experiences listing page
│   │   ├── journal/page.tsx       # Travel journal blog page
│   │   ├── plan/
│   │   │   ├── page.tsx           # Trip planner shell (tab switcher)
│   │   │   └── _components/       # Plan page sub-components
│   │   │       ├── Sidebar.tsx
│   │   │       ├── TimelineTab.tsx
│   │   │       ├── HotelsTab.tsx
│   │   │       ├── HotelDetailView.tsx
│   │   │       ├── VehiclesTab.tsx
│   │   │       ├── GuidesTab.tsx
│   │   │       ├── PlanMap.tsx
│   │   │       ├── AreaModal.tsx
│   │   │       └── PropertyModal.tsx
│   │   ├── profile/page.tsx       # User profile page
│   │   ├── login/page.tsx         # Login + Signup page
│   │   └── api/                   # API Routes
│   │       ├── auth/
│   │       │   ├── [...nextauth]/  # NextAuth handler
│   │       │   ├── signup/         # POST /api/auth/signup
│   │       │   └── setup-username/ # POST /api/auth/setup-username
│   │       ├── locations/
│   │       │   ├── route.ts        # GET /api/locations
│   │       │   ├── [id]/route.ts   # GET /api/locations/:id
│   │       │   └── autocomplete/   # GET /api/locations/autocomplete
│   │       ├── hotels/
│   │       │   ├── search/         # GET /api/hotels/search
│   │       │   └── [id]/           # GET /api/hotels/:id
│   │       └── user/
│   │           ├── update/         # PATCH /api/user/update
│   │           └── delete/         # DELETE /api/user/delete
│   ├── components/                # Shared global components
│   │   ├── Navigation.tsx
│   │   ├── Providers.tsx
│   │   ├── CalendarPicker.tsx
│   │   ├── DestinationAutocomplete.tsx
│   │   └── DeleteAccountModal.tsx
│   ├── lib/                       # Core library utilities
│   │   ├── authOptions.ts         # NextAuth configuration
│   │   ├── mongodb.ts             # Mongoose connection (cached)
│   │   ├── mongodb-client.ts      # Native MongoClient (for NextAuth adapter)
│   │   └── data.ts                # Static in-memory data constants
│   └── models/                    # Mongoose models
│       ├── User.ts
│       └── Location.ts
├── scripts/
│   ├── seed.ts                    # Seeds MongoDB with 50 location documents
│   └── enrich.ts                  # Enriches location data with highlights, festivals, packing lists
├── public/images/                 # Local images (downloaded via downloadImages.js)
├── next.config.ts                 # Image domain allowlist
├── package.json
├── tsconfig.json
└── .env.local                    # Secret environment variables
```

---

## 5. Database Layer

### MongoDB Atlas

TravelFlow uses **MongoDB Atlas** (cloud-hosted MongoDB) as its primary database. The connection string is stored in `.env.local` as `MONGODB_URI`.

**Database Name:** Embedded in the Atlas URI (default: `travelflow`)

**Collections:**

| Collection | Created By | Purpose |
|---|---|---|
| `users` | Mongoose `User` model | Stores registered users (email, password hash, username, role, image) |
| `locations` | Mongoose `Location` model + `seed.ts` | Stores 50+ enriched Indian destination documents |
| `accounts` | NextAuth MongoDBAdapter | OAuth account links (Google provider tokens, providerAccountId) |
| `sessions` | NextAuth MongoDBAdapter | Session documents for database-backed sessions |
| `verification_tokens` | NextAuth MongoDBAdapter | Email verification tokens |

### Two Connection Strategies

**1. `src/lib/mongodb.ts` — Mongoose Connection**

Used by all application-level API routes. Implements a **module-level cache** stored on the `global` object to prevent connection proliferation during Next.js hot reloads in development.

```typescript
// Cached globally to survive HMR across dev reloads
const cached: MongooseCache = global.mongooseCache ?? { conn: null, promise: null };

async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;           // Return cached
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI);  // Create once
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
```

**2. `src/lib/mongodb-client.ts` — Native MongoClient**

Used exclusively by the `MongoDBAdapter` from `@auth/mongodb-adapter`. Exports a `clientPromise` (a `Promise<MongoClient>`) that is resolved once and reused.

```typescript
// In development, persist on global to survive HMR
if (process.env.NODE_ENV === 'development') {
  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production, create once per module lifecycle
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}
```

---

## 6. Backend — API Routes

All API routes live under `src/app/api/` and use the Next.js App Router `route.ts` convention with named HTTP method exports (`GET`, `POST`, `PATCH`, `DELETE`).

---

### `GET /api/locations`

**File:** `src/app/api/locations/route.ts`

Fetches all locations from MongoDB with optional filters.

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `category` | string | Single category (e.g. `"Beaches"`) or comma-separated list (e.g. `"Beaches,Mountains"`) |
| `search` | string | Full-text regex search on `title`, `subtitle`, `state`, `description` |
| `limit` | number | Max results (default: 50) |

**Logic:**
- Builds a MongoDB `filter` object dynamically
- If `category` contains a comma, uses `$in` operator
- If `search` is present, uses `$regex` with case-insensitive option across multiple fields
- Sorts by `title` ascending

**Response:** `{ locations: ILocation[], total: number }`

---

### `GET /api/locations/autocomplete`

**File:** `src/app/api/locations/autocomplete/route.ts`

Powers the home page search bar's live suggestions dropdown.

**Query Parameters:** `q` — the search string

**Logic:**
- If `q` is empty, returns `{ suggestions: [] }`
- Queries MongoDB with `$regex` on `title`, `subtitle`, `state`
- Uses `.select()` to return only needed fields (`title subtitle state category cardImage accentColor`)
- Limits to **6 results** for compact dropdown rendering
- Uses `.lean()` for faster plain JS objects

**Response:** `{ suggestions: Suggestion[] }`

---

### `GET /api/locations/:id`

**File:** `src/app/api/locations/[id]/route.ts`

Fetches a single location's full detail (used by the destination detail page `[id]/page.tsx`).

**Response:** Full `ILocation` document including `highlights`, `funFacts`, `festivals`, `packingEssentials`.

---

### `GET /api/hotels/search`

**File:** `src/app/api/hotels/search/route.ts`

Fetches hotel listings from the **SerpAPI Google Hotels engine**.

**Query Parameters:**

| Param | Type | Default | Description |
|---|---|---|---|
| `dest` | string | required | Destination name (e.g. `"Manali"`) |
| `checkin` | string | `2026-10-12` | Check-in date (ISO format) |
| `checkout` | string | `2026-10-18` | Check-out date (ISO format) |
| `next_page_token` | string | — | Pagination token from previous response |

**SerpAPI Parameters sent:**
```javascript
{
  engine: "google_hotels",
  q: dest,
  check_in_date: checkin,
  check_out_date: checkout,
  adults: 2,
  currency: "INR",
  gl: "in",      // Geolocation: India
  hl: "en",      // Language: English
  api_key: SERPAPI_KEY,
}
```

**Response Mapping:**
Each `property` item from SerpAPI is mapped to a normalized `Hotel` object:
```typescript
{
  id: p.property_token || p.name,
  name: p.name,
  image: p.images?.[0]?.original_image,
  rating: p.overall_rating,        // Out of 10
  totalReviews: p.reviews,
  reviewSummary: p.hotel_class,
  price: p.rate_per_night?.lowest, // Formatted (e.g. "₹3,200")
  priceRaw: p.rate_per_night?.extracted_lowest,  // Numeric for sorting
  address: `Near ${p.nearby_places[0].name}`,
  starRating: p.extracted_hotel_class,
  badge: p.amenities?.[0],
}
```

**Fallback:** If SerpAPI returns 0 results (e.g., API quota exceeded), 4 mock hotels are returned with fabricated data based on the destination name.

**Pagination:** Returns `nextPageToken` from `searchRes.serpapi_pagination.next_page_token` for infinite scroll ("Load More Stays").

---

### `GET /api/hotels/:id`

**File:** `src/app/api/hotels/[id]/route.ts`

Fetches detailed information for a specific hotel by its `property_token`. Used by `HotelDetailView.tsx`.

Returns amenities, room types, reviews, photos, and nearby places.

---

### `POST /api/auth/signup`

**File:** `src/app/api/auth/signup/route.ts`

Registers a new user with email/password credentials.

**Request Body:** `{ name, email, username, password }`

**Validation:**
- `email`, `password`, `username` are required
- `password` must be ≥ 6 characters
- Checks for duplicate email in `User` collection
- Checks for duplicate username in `User` collection

**Password Hashing:** Uses `bcrypt.hash(password, 12)` (12 salt rounds).

**Response (201):** `{ success: true, user: { id, email, username } }`

---

### `PATCH /api/user/update`

**File:** `src/app/api/user/update/route.ts`

Updates the authenticated user's `username` and/or `image`.

**Authentication:** Calls `getServerSession(authOptions)` — requires an active session.

**Validation:**
- `username` must be ≥ 3 characters
- Checks that the new username is not taken by another user (excludes current user's email)

**Database:** Uses `User.findOneAndUpdate()` with `{ new: true }` to return the updated document.

**Response:** `{ success: true, user: { username, image, name, email } }`

---

### `DELETE /api/user/delete`

**File:** `src/app/api/user/delete/route.ts`

Permanently deletes the authenticated user's account and all related data.

**Steps:**
1. Verifies session via `getServerSession`
2. Deletes the `User` document via Mongoose
3. Directly accesses the native MongoDB client to clean up NextAuth collections:
   - Deletes from `accounts` collection where `userId === session.user.email`
   - Deletes from `sessions` collection where `userEmail === session.user.email`

**Response:** `{ success: true }`

---

### `GET /api/auth/[...nextauth]`

The catch-all NextAuth handler. All OAuth redirects, session reads, and credential checks flow through this route.

---

## 7. Authentication System

**File:** `src/lib/authOptions.ts`

TravelFlow supports two authentication strategies configured in `authOptions`:

### Providers

**1. Google OAuth (via `GoogleProvider`)**
- Uses `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` from `.env.local`
- Google handles authentication; user is redirected back with profile data
- The `MongoDBAdapter` automatically creates a `User` document and `Account` link

**2. Email/Password Credentials (via `CredentialsProvider`)**
- User submits email + password on `/login`
- `authorize()` calls:
  1. `dbConnect()` — ensures Mongoose is connected
  2. `User.findOne({ email })` — locates user
  3. `bcrypt.compare(password, user.password)` — verifies hash
  4. Returns a normalized user object if valid

### Session Strategy: JWT

```typescript
session: { strategy: "jwt" }
```

JWT is used (not database sessions) because Credentials providers don't work with DB sessions. This allows custom fields (`username`, `role`) to be embedded directly in the JWT.

### JWT & Session Callbacks

**`jwt` callback** runs when a JWT is created/updated:
- On first sign-in: copies `id`, `username`, `role` from the user object into the token
- On session update (`trigger === "update"`): refreshes `username` in the token
- If `username` is missing (e.g., fresh Google OAuth user): fetches from DB and populates

**`session` callback** runs when `useSession()` is called:
- Copies `token.id`, `token.username`, `token.role` onto `session.user`
- This makes custom fields available everywhere via `useSession()`

### Custom Pages

```typescript
pages: { signIn: '/login' }
```

Redirects unauthenticated users to `/login` instead of NextAuth's default page.

---

## 8. Core Library Functions

### `dbConnect()` — `src/lib/mongodb.ts`

**Purpose:** Establishes and caches a Mongoose connection to MongoDB Atlas.

**How it works:**
1. Checks if a cached connection (`cached.conn`) already exists — returns it immediately if so
2. If no pending promise exists, creates `mongoose.connect(MONGODB_URI)`
3. Awaits and caches the result
4. On failure, clears the promise so the next call retries

**Used by:** Every API route that performs Mongoose queries.

---

### `clientPromise` — `src/lib/mongodb-client.ts`

**Purpose:** Provides a reusable `Promise<MongoClient>` for the NextAuth MongoDB adapter.

**How it works:**
- In **development**: stores the promise on `global._mongoClientPromise` to survive Next.js Hot Module Replacement
- In **production**: creates a fresh `MongoClient` and connects once

**Used by:** `authOptions.ts` (passed to `MongoDBAdapter(clientPromise)`)

---

### Static Data — `src/lib/data.ts`

Exports hardcoded in-memory arrays used across multiple pages:

| Export | Type | Used By | Description |
|---|---|---|---|
| `DESTINATIONS` | Array (6 items) | `data.ts` | Featured destinations for home page cards |
| `EXPERIENCES` | Array (5 items) | `/experiences` page | Adventure/cultural/wellness experience cards |
| `JOURNAL_POSTS` | Array (4 items) | `/journal` page | Travel blog post objects |
| `PLAN_HOTELS` | Array (3 items) | (legacy reference) | Static hotel placeholders for Plan page |
| `PLAN_VEHICLES` | Array (3 items) | `VehiclesTab` | Bus and vehicle options for the trip planner |
| `PLAN_GUIDES` | Array (3 items) | `GuidesTab` | Local guide profiles for the trip planner |

> Note: `DESTINATIONS` and `JOURNAL_POSTS` are static frontend data. **Real destination data** comes from MongoDB via `/api/locations`.

---

## 9. Data Models (Mongoose Schemas)

### `User` Model — `src/models/User.ts`

```typescript
{
  name: String,
  email: String (unique, required),
  password: String,          // Optional — null for Google OAuth users
  username: String (unique, sparse),  // Sparse index allows multiple null values
  image: String,             // Avatar URL
  emailVerified: Date,       // Set by NextAuth email verification
  role: String (default: "user"),     // "user" or "admin"
  timestamps: true           // Adds createdAt, updatedAt
}
```

**`sparse: true` on username index:** Allows multiple documents with no username (Google OAuth users who skip username setup), while still enforcing uniqueness when a username is set.

**Model overwrite guard:**
```typescript
const User = mongoose.models.User || mongoose.model("User", userSchema);
```
Prevents Mongoose from re-compiling the model on every hot reload in development.

---

### `Location` Model — `src/models/Location.ts`

The richest document in the app. Stores every detail for a travel destination.

```typescript
{
  title: String (required),           // e.g. "Pangong Tso"
  subtitle: String (required),        // e.g. "Ladakh"
  description: String (required),     // Short 1-2 sentence teaser
  longDescription: String,            // Detailed editorial paragraph
  bgImage: String (required),         // Full-res hero image URL
  cardImage: String (required),       // Thumbnail URL (smaller w=)
  gradient: String (required),        // Tailwind gradient classes for overlay
  accentColor: String (required),     // Hex color for badges/accents (e.g. "#0EBCDC")
  coordinates: String (required),     // "lat° N, lon° E" format
  category: Enum (required),          // One of 11 categories (see CATEGORIES)
  bestTimeToVisit: String (required), // e.g. "May - September"
  state: String (required),           // Indian state name
  highlights: [String],               // Key attractions list
  funFacts: [String],                 // Interesting trivia
  festivals: [{ name, month, description }],   // Local festivals
  packingEssentials: [{               // Season-specific packing lists
    season: String,
    months: String,
    items: [{ item: String, icon: String }]
  }],
  timestamps: true
}
```

**Valid Categories (11):**
`Beaches`, `Mountains`, `Monuments`, `Cities`, `Forests`, `Lakes`, `Deserts`, `Valleys`, `Hill Stations`, `Waterfalls`, `Islands`

---

## 10. Frontend Pages

### Home Page — `src/app/page.tsx`

The landing page. Large cinematic layout with:

- **Hero section:** Full-viewport background, animated headline, search bar with `DestinationAutocomplete` + `CalendarPicker`, vibe selector buttons (Nature / Culture / Adventure)
- **Destinations section:** 8 featured destination cards (photo cards from the landing page image set)
- **Experiences section:** Horizontal-scroll experience cards from `EXPERIENCES` in `data.ts`
- **Journal section:** Travel blog preview cards from `JOURNAL_POSTS`
- Navigation via `<Navigation />` component

The search bar on the home page integrates two custom components:
- `DestinationAutocomplete` → calls `/api/locations/autocomplete`
- `CalendarPicker` → manages start/end date locally

When the user submits the search, they are navigated to `/plan?dest=<destination>` or `/destinations?vibe=<vibe>`.

---

### Destinations Page — `src/app/destinations/page.tsx`

**Route:** `/destinations`

A fully dynamic destination browser. Client component that:

1. **On mount + filter change:** fetches from `/api/locations` with query params
2. **Supports two views:**
   - "All" view: horizontal-scrolling sections grouped by category
   - Filtered view: a 3-column responsive grid
3. **Category filter bar:** 12 pill buttons (All + 11 categories) with color-coded active states
4. **Vibe filter:** Accepts `?vibe=Nature|Culture|Adventure` from URL params; maps vibes to multiple categories using `VIBE_MAP`
5. **Search bar:** Text input with 300ms debounce; filters in real-time via API
6. **Loading state:** Spinner with animated ring
7. **Empty state:** Icon + clear filters button

Each destination card (`LocationCard` / `LocationCardGrid`) links to `/destinations/:id`.

---

### Destination Detail Page — `src/app/destinations/[id]/page.tsx`

**Route:** `/destinations/:mongoId`

Fetches a single `Location` document by MongoDB `_id` from `/api/locations/:id`. Displays:
- Hero with full background image and gradient overlay
- Title, subtitle, category badge, best time to visit
- Long description, highlights list
- Fun facts, festivals, packing essentials (seasonal)
- A "Plan This Trip" CTA button that navigates to `/plan?dest=<title>`

---

### Plan Page — `src/app/plan/page.tsx`

**Route:** `/plan`

The trip planning workspace. Two-column layout (content + map):

**Left column (content):**
- Tab bar with 4 tabs: **Timeline**, **Hotels**, **Vehicles**, **Guides**
- Header: Trip title (from `?dest=` URL param, defaults to "Manali") and Booked Amount counter
- Tab content rendered conditionally

**Right column:** `PlanMap` — a static SVG visual map with a Unsplash background

**State:**
- `activeTab` — controlled by URL param `?tab=` or sidebar click
- `budgetSpent` — cumulative price of booked items (incremented via `onBookItem` callback)

Uses `<Suspense>` wrapper because the component reads search params (requires client boundary).

---

### Login Page — `src/app/login/page.tsx`

**Route:** `/login`

A combined Login + Signup page. Single client component with shared form state.

**Login flow:**
1. User fills email + password → calls `signIn("credentials", { redirect: false, ... })`
2. On success: `router.push("/")`
3. On error: displays error message from `result.error`

**Signup flow:**
1. Extra fields: Name, Username
2. Calls `POST /api/auth/signup` with form data
3. On `201 Created`: automatically calls `signIn("credentials")` to log in
4. On error: displays server error message

**Google OAuth:** Calls `signIn("google", { callbackUrl: "/" })` — redirects to Google and back

**UI features:** Glassmorphism card, background image with luminosity blend overlay, decorative glow blob.

---

### Profile Page — `src/app/profile/page.tsx`

**Route:** `/profile`

Protected page — redirects to `/login` if `status === "unauthenticated"`.

**Sections:**
1. **Profile Header Card:** Avatar (image or initial letter), username, email, role badge, "Edit Profile" button
2. **Inline Edit Forms:** Username field + image URL field, revealed on edit click; saves via `PATCH /api/user/update`
3. **Stats Row:** 3 stat cards (Trips Planned, Destinations, Member Tier) — currently show `"—"` as placeholders
4. **Trip History:** Empty state with CTA to explore destinations
5. **Account Management:** Log Out button (`signOut({ callbackUrl: "/login" })`) + Delete Account button (opens `DeleteAccountModal`)

**Session updates:** After saving username, calls `await update({ username: newUsername })` — triggers the NextAuth `jwt` callback with `trigger === "update"` to refresh the token.

---

### Other Pages

| Route | File | Description |
|---|---|---|
| `/experiences` | `src/app/experiences/page.tsx` | Grid of experience cards from `EXPERIENCES` data |
| `/journal` | `src/app/journal/page.tsx` | Blog-style post cards from `JOURNAL_POSTS` data |
| `/about` | `src/app/about/page.tsx` | About TravelFlow |
| `/auth/setup-username` | subdirectory | Post-OAuth flow for Google users to set a username |

---

## 11. Global Components

### `Navigation.tsx` — `src/components/Navigation.tsx`

A **fixed, floating pill navbar** (glassmorphism style) shown on all pages except `/plan`.

**Features:**
- Logo with Material Symbols "explore" icon
- Desktop nav links (Destinations, Experiences, Journal, About) with active highlight via `usePathname()`
- Auth-aware right section:
  - **Loading:** pulsing skeleton circle
  - **Logged in:** Avatar (image or initial gradient pill) linking to `/profile`, with green "online" dot
  - **Not logged in:** "Sign In" pill button linking to `/login`
- Mobile hamburger menu (hidden on `md+`) with animated open/close via `useState`

**Dependencies:** `useSession` from NextAuth, `usePathname` from Next.js navigation.

---

### `Providers.tsx` — `src/components/Providers.tsx`

A thin wrapper that applies `<SessionProvider>` from NextAuth around all children. Placed in `layout.tsx` to make `useSession()` available to every client component.

```typescript
export default function Providers({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

---

### `DestinationAutocomplete.tsx` — `src/components/DestinationAutocomplete.tsx`

A **live search input with keyboard-navigable dropdown** for the home page search bar.

**Props:** `value`, `onChange`, `onSelect`

**Behavior:**
- Debounces API calls by **250ms** using `useRef<NodeJS.Timeout>`
- Calls `GET /api/locations/autocomplete?q=<value>` on each input change
- Shows dropdown with up to 6 suggestions, each showing:
  - Accent color left bar (visible on hover/highlight)
  - Location thumbnail (from `cardImage`)
  - Title, subtitle + state
  - Category badge with location's `accentColor`
- **Keyboard navigation:** ArrowDown/Up to highlight, Enter to select, Escape to close
- Click-outside-to-close via `mousedown` event listener on `document`

---

### `CalendarPicker.tsx` — `src/components/CalendarPicker.tsx`

A **custom dual-month date range picker** embedded in the home page search bar.

**Props:** `startDate`, `endDate`, `onDateChange`

**Key features:**
- Shows 2 months side-by-side in a glassmorphism dropdown
- **Date constraints:**
  - Minimum: today (past dates disabled)
  - Maximum: 2 months from today (`maxDate` computed via `useMemo`)
- **Two-step selection:** First click sets `startDate`, second click sets `endDate`; if second click is before start, resets
- Auto-closes with 400ms delay after end date is selected
- **Month navigation:** Prev/next buttons disabled at boundaries (`canGoBack`, `canGoForward`)
- Range highlighting: days between start and end show soft accent background
- Start/end days highlighted in `#B4D104` yellow-green
- "Clear dates" quick action button
- Display value formatted as `"12 Apr — 18 Apr"`

---

### `DeleteAccountModal.tsx` — `src/components/DeleteAccountModal.tsx`

A **confirmation modal** for permanent account deletion.

- Requires the user to type `"DELETE"` to enable the confirm button (safety guard)
- On confirmation: calls `DELETE /api/user/delete` → then `signOut({ callbackUrl: "/login" })`
- Shows loading spinner during deletion
- Displays error on failure

---

## 12. Plan Page Components

All live in `src/app/plan/_components/`.

### `Sidebar.tsx`

Vertical icon-based tab navigation (icon + label). Highlights the `activeTab`. Calls `setActiveTab` on click.

**Tabs:** Timeline (schedule icon), Hotels (bed icon), Vehicles (directions_bus icon), Guides (person icon)

---

### `TimelineTab.tsx`

Displays a **vertical dashed timeline** of trip events. Currently static/demo data:
- Volvo Semi-Sleeper bus (Transport event)
- The Himalayan Retreat hotel (Stay event)
- Basecamp Trek (Adventure event)

Each event card has a colored left accent bar and node dot synchronized by type (blue for transport, red for hotel, green for adventure).

---

### `HotelsTab.tsx`

The most complex tab component. Fetches real hotel data from `/api/hotels/search?dest=<destination>`.

**Features:**
- Loading: 4 animated skeleton cards
- Error: error message + "Try Again" button
- Sorted display: "Recommended" / "Price: Low to High" / "Price: High to Low" dropdown
- Hotel cards: thumbnail, name, address, rating badge (emerald), review summary, price, "View Details" CTA
- **Infinite pagination:** "Load More Stays" button that fetches with `next_page_token`
- On card click: switches to `HotelDetailView` component (drill-down view)
- `onBookItem` callback: updates `budgetSpent` in parent `PlanTripContent`

---

### `HotelDetailView.tsx`

Detailed view for a single selected hotel. Fetches from `/api/hotels/:id`.

Shows: photo gallery, amenities list, room types, reviews, nearby places, and a "Book Now" button that calls `onBookItem(priceRaw)` to increment the budget tracker.

---

### `VehiclesTab.tsx`

Static display of vehicle options from `PLAN_VEHICLES` in `data.ts`. Cards show: type, route, price per seat/day, departure time, duration.

---

### `GuidesTab.tsx`

Static display of guide profiles from `PLAN_GUIDES` in `data.ts`. Cards show: name, specialty, languages, rating, price per day.

---

### `PlanMap.tsx`

A **decorative static map panel** for the right column of the Plan page.

- Background: grayscale Unsplash aerial map photo with luminosity blend
- SVG overlay: dashed route path connecting 3 colored waypoints:
  - Blue: Delhi ISBT (bus icon) — origin
  - Pink: Hotel Retreat (bed icon) — midpoint
  - Yellow-green: Beas Summit (hiking icon) — destination
- Floating zoom controls (UI-only, not interactive)
- Bottom "Live Tracking" card: mock real-time status display

---

### `AreaModal.tsx` & `PropertyModal.tsx`

Modal overlays used within the Plan page for displaying area details and property/room information.

---

## 13. Static Data Layer

`src/lib/data.ts` is an in-memory data file exported as named constants. It is **not a database** — these are TypeScript arrays bundled into the client at build time.

### `DESTINATIONS` (6 items)
Featured curated destinations for the home page hero carousel/grid. Each has:
- `id`, `title`, `subtitle`, `image` (Unsplash URL), `gradient`, `tags`, `description`, `highlights`

Examples: Varanasi, Udaipur, Leh, Jaipur, Munnar, Hampi

### `EXPERIENCES` (5 items)
Adventure, cultural, culinary, wellness, and wildlife experiences.

Examples: White Water Rafting (Rishikesh), Sunrise Taj Mahal, Golden Temple Langar, Backwaters Houseboat, Tiger Safari

### `JOURNAL_POSTS` (4 items)
Blog-style posts authored by fictional writers.

Examples: Spiti Winter Expedition, Lucknow Food Culture, Khajuraho Architecture Photography, Meghalaya Waterfalls

### `PLAN_HOTELS` (3 items)
Static hotel cards (not real API data) used as reference/fallback.

### `PLAN_VEHICLES` (3 items)
Volvo Semi-Sleeper, Innova Crysta, Royal Enfield — with route, price, departure time.

### `PLAN_GUIDES` (3 items)
Rahul Sharma (trekking), Priya Singh (cultural), Tenzin Dorjee (monasteries) — with specialty, languages, rating, price per day.

---

## 14. Design System & Theming

Defined in `src/app/globals.css` using Tailwind v4's `@theme` directive. All design tokens are CSS custom properties.

### Color Palette

| Variable | Value | Role |
|---|---|---|
| `--color-background` | `#0a1422` | Page background (near-black deep blue) |
| `--color-surface` | `#0a1422` | Card surface base |
| `--color-surface-container` | `#16202f` | Elevated card containers |
| `--color-primary` | `#b3c5ff` | Primary blue tint |
| `--color-primary-container` | `#3b6fe8` | Solid primary blue (buttons, accents) |
| `--color-secondary` | `#ffdf9e` | Gold highlight |
| `--color-secondary-container` | `#fabd00` | Solid gold (budget tracker) |
| `--color-error` | `#ffb4ab` | Error states |

**Accent Colors used directly (not in theme):**
- `#EAED41` — Lime yellow (nav logo, active states, headings)
- `#D30C5C` — Deep pink (CTAs, hotel badges, hotel labels)
- `#DF33DF` — Magenta (gradient pair with pink)
- `#B4D104` — Yellow-green (calendar selection, autocomplete)
- `#0EBCDC` — Cyan (beach/lake destinations)
- `#3B6FE8` — Royal blue (plan page, budget tracker)

### Typography

| Variable | Font | Use Case |
|---|---|---|
| `--font-headline` | Plus Jakarta Sans | `font-headline` — All headings, titles, buttons |
| `--font-body` | Inter | `font-body` — Paragraph text, labels |
| `--font-technical` | JetBrains Mono | `font-technical` — Coordinates, timestamps, badges |

### Custom Utility Classes

| Class | Effect |
|---|---|
| `glass-nav` | Semi-transparent dark background with 24px blur using `backdrop-filter` |
| `glass-search` | Darker glass for search components |
| `glass-dropdown` | Near-opaque dark glass for dropdowns |
| `hero-gradient` | Left-to-right dark fade for hero overlays |
| `portrait-card-shadow` | Subtle blue glow shadow for cards |
| `custom-scrollbar` | Thin scrollbar styling for all scrollable content |
| `fade-in` | 0.3s fade + 8px vertical slide-in animation |

### Icon System

All icons use **Google Material Symbols Outlined** variable font (loaded from CDN). Icon size, weight, fill, and optical size are controlled via `font-variation-settings`.

---

## 15. Utility Scripts

### `scripts/seed.ts`

**Command:** `npm run seed` (runs `tsx --env-file=.env.local scripts/seed.ts`)

Seeds the MongoDB `locations` collection with **50 Indian destinations** across all 11 categories.

**What it does:**
1. Connects to MongoDB via Mongoose
2. Clears all existing location documents (`Location.deleteMany({})`)
3. Inserts all 50 location objects via `Location.insertMany()`
4. Prints a category-by-category summary
5. Disconnects

**Data includes:**
- 5 Beaches (Palolem, Varkala, Marina, Agonda, Kovalam, Om Beach)
- 6 Mountains (Gulmarg, Roopkund, Kanchenjunga, Nanda Devi, Spiti, Auli)
- 6 Monuments (Taj Mahal, Hawa Mahal, Hampi, Mysore Palace, Khajuraho, Konark, Meenakshi)
- 5 Cities (Varanasi, Udaipur, Jaisalmer, Pondicherry, Jodhpur)
- 5 Forests (Sundarbans, Silent Valley, Jim Corbett, Periyar, Kaziranga)
- 4 Lakes (Pangong Tso, Dal Lake, Chilika, Nainital, Loktak)
- 3 Deserts (Thar, Rann of Kutch, Nubra Valley)
- 3 Valleys (Mechuka, Valley of Flowers, Ziro, Dzukou, Araku)
- 5 Hill Stations (Munnar, Ooty, Shimla, Darjeeling, Manali, Coorg)
- 3 Waterfalls (Dudhsagar, Jog, Nohkalikai)
- 3 Islands (Radhanagar, Lakshadweep, Neil, Majuli)

### `scripts/enrich.ts`

**Command:** `npm run enrich`

Adds rich metadata to existing location documents: `highlights`, `funFacts`, `festivals`, and `packingEssentials` by matching on `title`. Does not overwrite if already populated.

### `downloadImages.js` & `getUnsplash.js`

Root-level utility scripts used during development to batch-download local images from Unsplash for the 8 landing page destinations (stored in `public/images/`).

---

## 16. Environment Variables

All stored in `.env.local` (not committed to git):

| Variable | Used By | Description |
|---|---|---|
| `MONGODB_URI` | `mongodb.ts`, `mongodb-client.ts` | MongoDB Atlas connection string |
| `NEXTAUTH_SECRET` | NextAuth internally | JWT signing secret (must be strong random string) |
| `NEXTAUTH_URL` | NextAuth internally | App base URL (e.g. `http://localhost:3000`) |
| `GOOGLE_CLIENT_ID` | `authOptions.ts` | Google OAuth app client ID |
| `GOOGLE_CLIENT_SECRET` | `authOptions.ts` | Google OAuth app client secret |
| `SERPAPI_KEY` | `api/hotels/search/route.ts` | SerpAPI key for Google Hotels engine |

---

## 17. Data Flow — How Frontend Integrates with Backend

### Flow 1: Destination Browsing

```
User opens /destinations
    → destinations/page.tsx mounts
    → useEffect fires fetch("/api/locations?category=All")
    → API route connects to MongoDB via dbConnect()
    → Location.find({}).limit(50).sort({title:1})
    → Returns { locations: [...], total: N }
    → Page renders location cards grouped by category
    → User clicks a card
    → Next.js navigates to /destinations/:id
    → [id]/page.tsx fetches /api/locations/:id
    → Full location document rendered
    → User clicks "Plan This Trip"
    → Navigates to /plan?dest=<locationTitle>
```

### Flow 2: Home Page Search

```
User types in search bar
    → DestinationAutocomplete onChange fires
    → 250ms debounce passes
    → fetch("/api/locations/autocomplete?q=<query>")
    → MongoDB regex search → {suggestions: [...]}
    → Dropdown shows up to 6 results
    → User selects a suggestion
    → onSelect() updates parent state + closes dropdown
    → User clicks "Plan" CTA
    → router.push("/plan?dest=" + selectedTitle)
```

### Flow 3: Hotel Search in Plan Page

```
User is on /plan?dest=Manali
    → HotelsTab mounts, reads destination="Manali"
    → useEffect fires fetch("/api/hotels/search?dest=Manali")
    → API route calls SerpAPI getJson({engine:"google_hotels", q:"Manali"...})
    → SerpAPI returns properties[]
    → API maps to Hotel[] objects, sorts by rating desc
    → HotelsTab renders hotel cards
    → User clicks a hotel card
    → selectedHotel state set → HotelDetailView renders
    → HotelDetailView fetches /api/hotels/:id
    → User clicks "Book Now"
    → onBookItem(priceRaw) → budgetSpent += priceRaw in PlanTripContent
```

### Flow 4: User Registration & Login

```
User opens /login
    → Clicks "Create Account" tab
    → Fills Name, Username, Email, Password
    → handleEmailPasswordAuth() fires
    → POST /api/auth/signup
        → Validates fields
        → bcrypt.hash(password, 12)
        → User.create({...})
        → Returns 201
    → signIn("credentials", {email, password}) → JWT created
    → router.push("/")
    → Navigation shows avatar (from session.user)
```

### Flow 5: Profile Update

```
User on /profile
    → Clicks "Edit Profile"
    → Edits username input
    → Clicks "Save Changes"
    → handleSaveProfile() fires
    → PATCH /api/user/update { username: "new_username" }
        → getServerSession(authOptions) → verifies JWT
        → Checks username uniqueness
        → User.findOneAndUpdate({email}, {$set: {username}})
    → Client calls update({ username }) → NextAuth refreshes JWT via jwt callback
    → Navigation instantly shows new username
```

---

## 18. Feature Summary

| Feature | Status | Implementation |
|---|---|---|
| Home page hero | ✅ Complete | `app/page.tsx` — full cinematic landing |
| Destination directory | ✅ Complete | `/destinations` + MongoDB + `/api/locations` |
| Destination detail page | ✅ Complete | `/destinations/[id]` + MongoDB |
| Category filtering | ✅ Complete | 11 category pills + Vibe filter system |
| Live search (Destinations) | ✅ Complete | Debounced text input → `/api/locations?search=` |
| Autocomplete search bar | ✅ Complete | `DestinationAutocomplete` → `/api/locations/autocomplete` |
| Date range picker | ✅ Complete | Custom `CalendarPicker` component |
| Experiences page | ✅ Complete | Static data from `data.ts` |
| Journal blog page | ✅ Complete | Static data from `data.ts` |
| Trip planner shell | ✅ Complete | `/plan` with 4-tab layout + SVG map |
| Hotel search (Live API) | ✅ Complete | SerpAPI Google Hotels → `/api/hotels/search` |
| Hotel detail view | ✅ Complete | `HotelDetailView` → `/api/hotels/:id` |
| Vehicles tab | ✅ Complete | Static data |
| Guides tab | ✅ Complete | Static data |
| Budget tracker | ✅ Complete | `budgetSpent` state in plan page |
| Email/password auth | ✅ Complete | Credentials provider + bcrypt |
| Google OAuth | ✅ Complete | Google provider + MongoDBAdapter |
| User profile page | ✅ Complete | Session-protected, edit username/image |
| Account deletion | ✅ Complete | Removes user + NextAuth collections |
| DB seeding (50 locations) | ✅ Complete | `scripts/seed.ts` |
| Data enrichment | ✅ Complete | `scripts/enrich.ts` |
| Dark mode theme | ✅ Complete | Full dark design system in `globals.css` |
| Responsive navigation | ✅ Complete | Mobile hamburger + desktop pills |
| Semantic SEO metadata | ✅ Complete | Title + description in `layout.tsx` |
| Trip history on profile | 🚧 Planned | Placeholder state shown |
| Real-time map | 🚧 Planned | Static SVG overlay (no real map API) |
| Saved itineraries | 🚧 Planned | No persistence layer yet |

---

*Last updated: April 2026*
*Stack: Next.js 16 · React 19 · TypeScript · MongoDB Atlas · Mongoose · NextAuth v4 · SerpAPI · Tailwind CSS v4*
