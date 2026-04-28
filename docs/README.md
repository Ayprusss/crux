# Crux — Development Roadmap & Technical Reference

> A live climbing map that starts with OpenStreetMap data and grows into a hybrid platform with user submissions, moderation, and curated high-quality listings for indoor gyms, outdoor boulders, crags, and more.

---

## Table of Contents

1. [Project Vision](#1-project-vision)
2. [Tech Stack](#2-tech-stack)
3. [Architecture Overview](#3-architecture-overview)
4. [Project Structure](#4-project-structure)
5. [Phase 1 — Read-Only Live Map (MVP)](#5-phase-1--read-only-live-map-mvp)
6. [Phase 2 — Place Details & Filters](#6-phase-2--place-details--filters)
7. [Phase 3 — User Suggestions](#7-phase-3--user-suggestions)
8. [Phase 4 — Moderation & Quality](#8-phase-4--moderation--quality)
9. [Phase 5 — Expanded Enrichment](#9-phase-5--expanded-enrichment)
10. [Data Strategy](#10-data-strategy)
11. [Navigation Integration](#11-navigation-integration)
12. [Design System & UI Guidelines](#12-design-system--ui-guidelines)
13. [Environment Variables](#13-environment-variables)
14. [Development Workflow](#14-development-workflow)
15. [Appendix — File-Level Breakdown by Phase](#15-appendix--file-level-breakdown-by-phase)

---

## 1. Project Vision

Crux answers one question well: **"What climbing places exist near me, and how do I get there?"**

The product starts as a read-only map seeded with OpenStreetMap / Overpass data and grows through five phases into a community-driven, moderated climbing directory. The initial geographic scope is **Ottawa / Ontario**, expanding later.

### Success Criteria (MVP)

- A polished landing page showcases the product and drives users to the map.
- Interactive map renders clustered climbing markers across the viewport.
- Users can search, pan, zoom, and click markers to see details.
- A detail panel shows name, type, location notes, and a "Navigate" button.
- The OSM / Overpass ingestion pipeline seeds the database.
- Indoor/outdoor and discipline filters narrow the results.

---

## 2. Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 16 (App Router) | Server/client rendering, routing, API routes |
| **Language** | TypeScript | Type safety across the entire codebase |
| **Styling** | Tailwind CSS v4 | Utility-first CSS with `@theme` design tokens |
| **UI Components** | Shadcn UI (v4) | Pre-built accessible components (cards, drawers, dialogs, filters) |
| **Map Rendering** | MapLibre GL JS + react-map-gl | Interactive web map with clustering, viewport loading |
| **Backend** | Supabase | Auth, PostgreSQL database, storage, edge functions |
| **Database** | PostgreSQL + PostGIS | Geospatial storage, distance queries, viewport bounding |
| **Icons** | Lucide React | Consistent icon system |
| **Animations** | tw-animate-css | Micro-animations via Tailwind |

### Installed Dependencies (package.json)

**Runtime:**
- `next`, `react`, `react-dom`
- `@supabase/supabase-js` — Supabase client
- `maplibre-gl`, `react-map-gl` — Map rendering
- `@base-ui/react` — Shadcn primitive layer
- `class-variance-authority`, `clsx`, `tailwind-merge` — Shadcn utility chain
- `lucide-react` — Icons
- `shadcn`, `tw-animate-css` — UI system

**Dev:**
- `tailwindcss@4`, `@tailwindcss/postcss` — Styling engine
- `typescript`, `@types/react`, `@types/react-dom`, `@types/node`
- `eslint`, `eslint-config-next`

---

## 3. Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                     BROWSER                         │
│  ┌───────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │  Map View  │  │  Search  │  │  Detail Panel    │  │
│  │ (MapLibre) │  │  Bar     │  │  (Shadcn Cards)  │  │
│  └─────┬─────┘  └────┬─────┘  └────────┬─────────┘  │
│        │              │                 │            │
│        └──────────────┼─────────────────┘            │
│                       │                              │
│               ┌───────▼────────┐                     │
│               │  React State   │                     │
│               │  (viewport,    │                     │
│               │   filters,     │                     │
│               │   selected)    │                     │
│               └───────┬────────┘                     │
└───────────────────────┼──────────────────────────────┘
                        │  HTTP / RPC
                ┌───────▼────────┐
                │   Supabase     │
                │  (API + Auth)  │
                └───────┬────────┘
                        │
                ┌───────▼────────┐
                │  PostgreSQL    │
                │  + PostGIS     │
                │  (places,      │
                │   profiles,    │
                │   suggestions) │
                └────────────────┘
```

**Data flow:** The frontend sends the current map viewport bounds + active filters → Supabase returns lightweight place records within those bounds → the map renders them as clustered markers.

---

## 4. Project Structure

```
crux/
├── docs/                          # Project documentation
│   ├── README.md                  # This file — full roadmap
│   ├── climbmap_project_brief.pdf # Original product brief
│   └── climbmap_project_brief.docx
├── public/                        # Static assets (logos, map icons, landing images)
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── globals.css            # Tailwind v4 + Shadcn theme tokens
│   │   ├── layout.tsx             # Root layout (fonts, metadata, providers)
│   │   ├── page.tsx               # Landing page (marketing / feature showcase)
│   │   ├── map/                   # Map experience
│   │   │   └── page.tsx           # Full-viewport map page
│   │   ├── api/                   # API routes (future: ingestion, moderation)
│   │   └── admin/                 # Phase 4: admin/moderation pages
│   ├── components/
│   │   ├── ui/                    # Shadcn UI primitives (button, card, etc.)
│   │   ├── landing/               # Landing page sections
│   │   │   ├── Hero.tsx           # Hero banner with CTA
│   │   │   ├── FeatureGrid.tsx    # Feature highlights grid
│   │   │   ├── HowItWorks.tsx     # Step-by-step explainer
│   │   │   ├── MapPreview.tsx     # Static or animated map teaser
│   │   │   ├── Testimonials.tsx   # Social proof / community quotes
│   │   │   └── Footer.tsx         # Site-wide footer
│   │   ├── map/                   # Map-specific components
│   │   │   ├── MapContainer.tsx   # Main MapLibre wrapper
│   │   │   ├── ClusterLayer.tsx   # Marker clustering logic
│   │   │   └── MarkerPopup.tsx    # Popup on marker click
│   │   ├── places/                # Place-related UI
│   │   │   ├── DetailPanel.tsx    # Slide-out place details
│   │   │   ├── PlaceCard.tsx      # Compact place summary
│   │   │   └── FilterBar.tsx      # Indoor/outdoor, discipline filters
│   │   ├── search/                # Search components
│   │   │   └── SearchBar.tsx      # Location/place search input
│   │   ├── suggestions/           # Phase 3: user submission forms
│   │   └── layout/                # App shell (header, sidebar, nav)
│   ├── lib/
│   │   ├── utils.ts               # Shadcn cn() utility
│   │   ├── supabase/
│   │   │   ├── client.ts          # Browser Supabase client
│   │   │   ├── server.ts          # Server-side Supabase client
│   │   │   └── types.ts           # Generated database types
│   │   ├── map/
│   │   │   ├── config.ts          # Map default center, zoom, style URL
│   │   │   └── helpers.ts         # Viewport bounds → query helpers
│   │   └── overpass/
│   │       ├── fetcher.ts         # Overpass API query builder
│   │       └── normalizer.ts      # OSM → internal schema transformer
│   ├── hooks/
│   │   ├── useMapViewport.ts      # Track map bounds & zoom
│   │   ├── usePlaces.ts           # Fetch places within viewport
│   │   └── useFilters.ts          # Filter state management
│   └── types/
│       ├── place.ts               # Place, Gym, Crag, Boulder types
│       ├── suggestion.ts          # User suggestion types
│       └── filters.ts             # Filter option types
├── scripts/
│   └── seed-osm.ts                # CLI script: pull OSM data → Supabase
├── components.json                # Shadcn UI configuration
├── postcss.config.mjs             # PostCSS → @tailwindcss/postcss
├── tsconfig.json                  # TypeScript configuration
├── next.config.ts                 # Next.js configuration
└── package.json
```

---

## 5. Phase 1 — Read-Only Live Map (MVP)

> **Goal:** Ship a landing page, a working map that displays climbing locations from OSM data, and a foundational user system.

### 5.1 Landing Page [X]

The landing page is the first thing visitors see at `/`. It showcases the product's value, highlights core features, and funnels users to the map experience at `/map`. This page should feel **premium, modern, and visually striking** — it sets the tone for the entire product.

| Task | Details |
|---|---|
| Create `src/app/page.tsx` | Landing page route — assembles all landing sections |
| Build `Hero.tsx` | Full-width hero banner with headline, subtitle, and prominent CTA button ("Explore the Map") linking to `/map`. Include a background image or stylized map graphic. |
| Build `FeatureGrid.tsx` | 3–4 feature cards highlighting core capabilities: live map, search & filters, community submissions, navigation handoff. Use Lucide icons and concise copy. |
| Build `HowItWorks.tsx` | 3-step visual explainer: (1) Search your area → (2) Discover climbing spots → (3) Navigate there. Use numbered steps with icons or illustrations. |
| Build `MapPreview.tsx` | Static screenshot or animated preview of the map in action. Gives visitors a taste of the product before they click through. |
| Build `Testimonials.tsx` | Social proof section — placeholder quotes from "climbers" for now, replaced with real community feedback later. |
| Build `Footer.tsx` | Site-wide footer with links: About, GitHub, Contact, legal. Reused across landing and map pages. |
| Create navigation bar | Top nav with logo, "Features" and "How It Works" anchor links, and a "Open Map" CTA button. On map page, this becomes the map header. |
| Responsive design | Landing page must look great on mobile, tablet, and desktop. |
| SEO metadata | Title: "Crux — Find Climbing Near You", meta description, Open Graph tags. |

**Landing page section order:**

```
┌─────────────────────────────┐
│  Navigation Bar             │
├─────────────────────────────┤
│  Hero (headline + CTA)      │
├─────────────────────────────┤
│  Feature Grid (4 cards)     │
├─────────────────────────────┤
│  How It Works (3 steps)     │
├─────────────────────────────┤
│  Map Preview (screenshot)   │
├─────────────────────────────┤
│  Testimonials               │
├─────────────────────────────┤
│  Final CTA ("Start Exploring") │
├─────────────────────────────┤
│  Footer                     │
└─────────────────────────────┘
```

### 5.2 Supabase Setup [X]

| Task | Details |
|---|---|
| Create Supabase project | Provision a new project; save URL + anon key |
| Enable PostGIS | Run `CREATE EXTENSION postgis;` in SQL editor |
| Create `places` table | See schema below |
| Create `profiles` table | See schema below — extends `auth.users` with role and display info |
| Set up Row-Level Security | Read-only public access for `places` in Phase 1; users can read/update own profile |
| Generate TypeScript types | `npx supabase gen types typescript` |

**`profiles` table schema:**

This table extends Supabase's built-in `auth.users` with application-specific data. It is created automatically when a user signs up (via a database trigger).

```sql
CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  display_name  TEXT,
  avatar_url    TEXT,
  role          TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
  is_admin      BOOLEAN GENERATED ALWAYS AS (role = 'admin') STORED,
  bio           TEXT,
  favorite_disciplines TEXT[] DEFAULT '{}',
  location_city TEXT,
  location_region TEXT,
  suggestions_count INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_profiles_role ON profiles (role);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);
```

**Key design decisions for `profiles`:**

| Field | Purpose |
|---|---|
| `role` | Enum string: `user`, `moderator`, `admin`. Controls access to admin dashboard and moderation tools. |
| `is_admin` | Computed boolean column — always in sync with `role`. Simplifies RLS policies and UI checks. |
| `suggestions_count` | Denormalized counter for gamification and trust signals (incremented via trigger when suggestions are approved). |
| `favorite_disciplines` | User preferences — can power personalized map defaults in the future. |

**`places` table schema:**

```sql
CREATE TABLE places (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  slug          TEXT UNIQUE,
  type          TEXT NOT NULL CHECK (type IN ('gym', 'boulder', 'crag', 'wall', 'other')),
  environment   TEXT NOT NULL CHECK (environment IN ('indoor', 'outdoor')),
  location      GEOGRAPHY(POINT, 4326) NOT NULL,
  latitude      DOUBLE PRECISION NOT NULL,
  longitude     DOUBLE PRECISION NOT NULL,
  address       TEXT,
  city          TEXT,
  region        TEXT,
  country       TEXT DEFAULT 'CA',
  disciplines   TEXT[] DEFAULT '{}',
  amenities     TEXT[] DEFAULT '{}',
  description   TEXT,
  osm_id        BIGINT UNIQUE,
  submitted_by  UUID REFERENCES profiles(id),
  source        TEXT DEFAULT 'osm' CHECK (source IN ('osm', 'user', 'curated')),
  verified      BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_places_location ON places USING GIST (location);
CREATE INDEX idx_places_type ON places (type);
CREATE INDEX idx_places_environment ON places (environment);
```

### 5.3 OSM / Overpass Ingestion Pipeline [X]

| Task | Details |
|---|---|
| Build Overpass query | Query for `sport=climbing`, `leisure=sports_centre` + climbing tags, `natural=cliff` within Ontario bounding box |
| Create `scripts/seed-osm.ts` | CLI script that fetches from Overpass API, normalizes records, upserts into `places` |
| Build normalizer | `src/lib/overpass/normalizer.ts` — maps OSM tags → internal place schema |
| Handle deduplication | Use `osm_id` as unique constraint; upsert on conflict |
| Run initial seed | Execute script to populate database |

**Overpass query (Ontario bounding box):**

```
[out:json][timeout:60];
(
  node["sport"="climbing"](41.6,-95.2,56.9,-74.3);
  way["sport"="climbing"](41.6,-95.2,56.9,-74.3);
  node["leisure"="sports_centre"]["sport"="climbing"](41.6,-95.2,56.9,-74.3);
  node["natural"="cliff"]["climbing"="yes"](41.6,-95.2,56.9,-74.3);
);
out center;
```

### 5.4 Map Component [X]

| Task | Details |
|---|---|
| Create `MapContainer.tsx` | Wrap `react-map-gl` with MapLibre, set default center to Ottawa (45.4215, -75.6972) |
| Configure map style | Use a free MapLibre style (e.g., `https://basemaps.cartocdn.com/gl/positron-gl-style/style.json`) |
| Implement viewport tracking | `useMapViewport` hook — debounce bounds changes, trigger data fetch |
| Build `ClusterLayer.tsx` | Use MapLibre's built-in clustering via GeoJSON source with `cluster: true` |
| Create `MarkerPopup.tsx` | On marker click, show a small popup with place name + type |
| Wire data fetching | `usePlaces` hook — calls Supabase RPC `places_in_bounds(west, south, east, north)` |

**Supabase RPC function:**

```sql
CREATE OR REPLACE FUNCTION places_in_bounds(
  west DOUBLE PRECISION,
  south DOUBLE PRECISION,
  east DOUBLE PRECISION,
  north DOUBLE PRECISION
)
RETURNS SETOF places AS $$
  SELECT *
  FROM places
  WHERE location && ST_MakeEnvelope(west, south, east, north, 4326)::geography
$$ LANGUAGE SQL STABLE;
```

### 5.5 Detail Panel [X]

| Task | Details |
|---|---|
| Create `DetailPanel.tsx` | Slide-out drawer (Shadcn Sheet) showing full place info |
| Display fields | Name, type badge, environment badge, address, description, disciplines |
| Navigation button | "Open in Google Maps" link using `https://www.google.com/maps/dir/?api=1&destination={lat},{lng}` |
| Close behavior | Click outside or X button dismisses |

### 5.6 Search Bar [X]

| Task | Details |
|---|---|
| Create `SearchBar.tsx` | Text input at top of map for location search |
| Geocoding | Use a free geocoding service (Nominatim) to convert text → lat/lng |
| Pan on search | On result selection, fly the map to the coordinates |

### 5.7 App Shell & Layout [X]

| Task | Details |
|---|---|
| Update `layout.tsx` | Add metadata (title: "Crux — Climbing Map"), import fonts (Outfit from Google Fonts) |
| Create header | Logo + "Crux" wordmark, search bar integration |
| Route structure | `/` = landing page, `/map` = full map experience |
| Full-viewport map | Map fills the screen below the header on `/map` |
| Responsive | Works on desktop and mobile viewports |

### Phase 1 Deliverables Checklist

- [x] **Landing page** with hero, features, how-it-works, map preview, testimonials, footer
- [x] Landing page fully responsive and SEO-optimized
- [x] Supabase project created with PostGIS enabled
- [x] `profiles` table with role/admin field and auto-creation trigger
- [x] `places` table with geospatial index
- [x] `places_in_bounds` RPC function
- [x] OSM seed script works and populates real data
- [x] MapLibre renders with clustering at `/map`
- [x] Viewport-based data loading (debounced)
- [x] Marker click opens detail panel
- [x] Detail panel has "Navigate" button → Google Maps
- [x] Search bar geocodes and pans map
- [x] App shell with header and full-viewport map
- [x] Mobile responsive

---

## 6. Phase 2 — Place Details & Filters

> **Goal:** Enrich the experience with filtering, richer detail cards, and save/favorite actions.

### 6.1 Filter System

| Task | Details |
|---|---|
| Create `FilterBar.tsx` | Horizontal bar below header with toggle chips |
| Indoor/Outdoor filter | Toggle between indoor, outdoor, or both |
| Discipline tags | Multi-select: bouldering, sport, trad, top-rope, etc. |
| `useFilters` hook | Manages filter state, integrates with `usePlaces` query params |
| Update Supabase query | Pass filter params to `places_in_bounds` or add a new RPC |

### 6.2 Enhanced Detail Cards

| Task | Details |
|---|---|
| Redesign `DetailPanel.tsx` | Richer layout with photo placeholder, amenities list, discipline badges |
| Amenities display | Parking, showers, rental gear, café, etc. |
| Hours placeholder | Structured field ready for Phase 5 data |
| Share action | Copy link to clipboard |

### 6.3 Favorites / Save

| Task | Details |
|---|---|
| Local favorites | Store saved place IDs in `localStorage` for unauthenticated users |
| Heart icon toggle | On place cards and detail panel |
| Saved places view | Optional sidebar/page listing saved places |

### Phase 2 Deliverables Checklist

- [x] Filter bar with indoor/outdoor toggle
- [x] Discipline tag multi-select filters
- [x] Filters modify the map query in real time
- [x] Enhanced detail panel with amenities + disciplines
- [x] Favorite/save action with localStorage persistence
- [x] Saved places accessible from UI

---

## 7. Phase 3 — User Suggestions

> **Goal:** Allow authenticated users to suggest new climbing spots or propose edits.

### 7.1 Authentication [X]

| Task | Details |
|---|---|
| Supabase Auth setup | Enable email/password + OAuth (Google) providers |
| Create auth pages | `/login`, `/signup`, `/callback` routes |
| Auth context | React context wrapping `supabase.auth` session state |
| Profile integration | On login, fetch user's `profiles` row to get role + display info |
| Protected routes | Middleware to guard suggestion/edit pages |
| Authenticated Navbar | Dynamic navbar layout that switches when logged in, revealing links to Profile, Saved Places, and Social Media integration |

### 7.2 Suggestion Form

| Task | Details |
|---|---|
| Create `SuggestionForm.tsx` | Multi-step form: location picker → details → photo upload |
| Map pin placement | User clicks map to set coordinates for new place |
| Photo upload | Supabase Storage bucket for user images |
| Create `suggestions` table | Stores pending suggestions with status (pending/approved/rejected) |

**`suggestions` table schema:**

```sql
CREATE TABLE suggestions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES profiles(id) NOT NULL,
  place_id      UUID REFERENCES places(id),          -- NULL for new places
  action        TEXT NOT NULL CHECK (action IN ('add', 'edit')),
  data          JSONB NOT NULL,                       -- Proposed place fields
  photos        TEXT[] DEFAULT '{}',                   -- Storage URLs
  notes         TEXT,
  status        TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by   UUID REFERENCES profiles(id),
  reviewed_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Increment user's suggestions_count when a suggestion is approved
CREATE OR REPLACE FUNCTION increment_suggestion_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    UPDATE profiles SET suggestions_count = suggestions_count + 1 WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_suggestion_approved
  AFTER UPDATE ON suggestions
  FOR EACH ROW EXECUTE FUNCTION increment_suggestion_count();
```

### 7.3 Edit Proposals

| Task | Details |
|---|---|
| "Suggest Edit" button | On detail panel for existing places |
| Pre-filled form | Opens suggestion form with existing place data loaded |
| Diff display | Show what the user is changing vs. current data |

### Phase 3 Deliverables Checklist

- [x] Supabase Auth with email + Google OAuth
- [x] Login/signup pages
- [x] Auth context and session management
- [x] "Suggest a Place" form with map pin + photo upload
- [x] "Suggest Edit" for existing places
- [x] Suggestions stored in `suggestions` table with pending status
- [x] RLS policies: users can create/read own suggestions
- [x] Authenticated Navbar UI (Profile, Saved Places, Social Media Integration)

---

## 8. Phase 4 — Moderation & Quality

> **Goal:** Admin workflow to review suggestions, detect duplicates, and verify listings.

### 8.1 Admin Dashboard

| Task | Details |
|---|---|
| Create `/admin` route group | Protected layout, admin-only access |
| Suggestion queue | Table/list of pending suggestions with approve/reject actions |
| Review detail view | Side-by-side comparison of suggestion vs. existing data |
| Bulk actions | Multi-select approve/reject |

### 8.2 Duplicate Detection

| Task | Details |
|---|---|
| Proximity check | On suggestion submit, query for places within ~100m radius |
| Flag potential dupes | Show admin a "possible duplicate" warning with nearby places |
| Merge flow | Admin can merge suggestion into existing place |

### 8.3 Verification System

| Task | Details |
|---|---|
| Verified badge | Places can be marked as verified by admins |
| Confidence score | Based on source (OSM → user → curated), number of confirmations |
| Visual indicator | Verified checkmark on map markers and detail cards |

### 8.4 User Roles (built on `profiles` table)

| Task | Details |
|---|---|
| Role checks | Use `profiles.role` and `profiles.is_admin` columns (created in Phase 1) |
| RLS policies | Admins/moderators can update suggestions + places; regular users read-only on places, create-only on suggestions |
| Role-based UI | Admin nav items only visible when `profile.role === 'admin'` or `profile.role === 'moderator'` |
| Admin promotion | Manual SQL or admin UI to set `UPDATE profiles SET role = 'admin' WHERE id = '...'` |

### Phase 4 Deliverables Checklist

- [x] Admin route group with protected access
- [x] Suggestion review queue with approve/reject
- [x] Duplicate detection on submission
- [x] Verification badge system
- [x] User roles and RLS policies
- [x] Admin-only UI elements

---

## 9. Phase 5 — Expanded Enrichment

> **Goal:** Manual curation for key areas, user condition reports, richer metadata, and stronger search.

### 9.1 Manual Curation

| Task | Details |
|---|---|
| Curated place conversion | Admin workflow to convert an existing entry (e.g., a gym) into a curated entry by surfacing a form to add operating hours, high-res photos, list of amenities, and route info. |
| Feature flags | Mark curated places with `source = 'curated'` upon completing the curation conversion. |
| Priority regions | Focus on Ottawa, Toronto, and major Ontario outdoor areas first |

### 9.2 Condition Reports

| Task | Details |
|---|---|
| `conditions` table | User-submitted reports: dry/wet, crowded, access notes, date |
| Condition feed | Show recent reports on place detail panel |
| Seasonal indicators | Aggregate conditions to show best seasons |

### 9.3 Enhanced Search

| Task | Details |
|---|---|
| Full-text search | Supabase full-text search on place name + description |
| Autocomplete | Debounced search results dropdown |
| Search by discipline | "Show me all bouldering near Ottawa" |

### 9.4 Richer Metadata

| Task | Details |
|---|---|
| Operating hours | Structured hours for indoor gyms |
| Route/problem counts | For crags and bouldering areas |
| Difficulty ranges | Grade ranges (V-scale, YDS) |
| Photo galleries | Multiple photos per place from Supabase Storage |

### Phase 5 Deliverables Checklist

- [x] Curated place editing for admins
- [x] User condition reports
- [x] Full-text search with autocomplete
- [x] Operating hours for gyms
- [x] Route/problem counts and difficulty ranges
- [x] Photo galleries

---

## 10. Data Strategy

The data lifecycle follows a trust escalation model:

```
OSM Import (bulk, low quality)
       │
       ▼
User Suggestions (moderate, needs review)
       │
       ▼
Moderator Approved (higher confidence)
       │
       ▼
Manually Curated (highest quality)
```

**Key principles:**

1. **Seed fast** — OSM/Overpass gets the map populated immediately.
2. **Normalize everything** — All sources write to the same `places` schema.
3. **Queue, don't publish** — User suggestions go to `suggestions` table, not directly to `places`.
4. **Track provenance** — Every place has a `source` field (`osm`, `user`, `curated`).
5. **Curate strategically** — Manual enrichment only for high-value locations.

---

## 11. Navigation Integration

Every place detail panel includes a navigation handoff:

| Platform | Implementation |
|---|---|
| **Google Maps (web)** | `https://www.google.com/maps/dir/?api=1&destination={lat},{lng}` |
| **Google Maps (mobile)** | `comgooglemaps://?daddr={lat},{lng}` (future) |
| **Apple Maps** | `https://maps.apple.com/?daddr={lat},{lng}` (future) |
| **Waze** | `https://waze.com/ul?ll={lat},{lng}&navigate=yes` (future) |

**Phase 1** ships only the Google Maps web link. Mobile deep links are added in later phases.

---

## 12. Design System & UI Guidelines

### Color Palette

The Shadcn theme tokens in `globals.css` define the color system using `oklch`. We use the **neutral** base with accent colors to be defined as the brand evolves.

### Component Library

Use Shadcn components exclusively for UI primitives. Install as needed:

```bash
npx shadcn@latest add sheet        # Detail panel drawer
npx shadcn@latest add card         # Place cards
npx shadcn@latest add badge        # Type/discipline badges
npx shadcn@latest add input        # Search bar
npx shadcn@latest add dialog       # Modals
npx shadcn@latest add toggle-group # Filter chips
npx shadcn@latest add dropdown-menu # Actions menus
npx shadcn@latest add avatar       # User avatars (Phase 3+)
npx shadcn@latest add table        # Admin tables (Phase 4+)
```

### Typography

- **Heading font**: Outfit (via Next.js `next/font`)
- **Body font**: Outfit
- **Monospace**: Geist Mono (for data/code displays)

### Map Styling

- **Base tiles**: CartoDB Positron (clean, light, doesn't compete with markers)
- **Marker colors**: Teal for outdoor, indigo for indoor
- **Cluster style**: Circular with count, scaling by cluster size
- **Selected marker**: Elevated with ring highlight

---

## 13. Environment Variables

Create a `.env.local` file (git-ignored) with:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Map (optional — MapLibre free styles don't need a key)
NEXT_PUBLIC_MAP_STYLE_URL=https://basemaps.cartocdn.com/gl/positron-gl-style/style.json
NEXT_PUBLIC_MAP_DEFAULT_CENTER_LAT=45.4215
NEXT_PUBLIC_MAP_DEFAULT_CENTER_LNG=-75.6972
NEXT_PUBLIC_MAP_DEFAULT_ZOOM=10
```

---

## 14. Development Workflow

### Running Locally

```bash
npm run dev         # Start Next.js dev server (http://localhost:3000)
npm run build       # Production build
npm run lint        # ESLint check
```

### Adding Shadcn Components

```bash
npx shadcn@latest add <component-name>
```

### Database Migrations

Manage schema changes through the Supabase dashboard SQL editor or via the Supabase CLI:

```bash
npx supabase migration new <migration-name>
npx supabase db push
```

### Seeding Data

```bash
npx tsx scripts/seed-osm.ts
```

### Branch Strategy

- `main` — production-ready code
- `develop` — integration branch
- `feature/<phase>-<description>` — feature branches per task

---

## 15. Appendix — File-Level Breakdown by Phase

### Phase 1 Files to Create

| File | Purpose |
|---|---|
| **Landing Page** | |
| `src/app/page.tsx` | Landing page — assembles all landing sections |
| `src/components/landing/Hero.tsx` | Hero banner with headline + CTA |
| `src/components/landing/FeatureGrid.tsx` | 4-card feature highlights |
| `src/components/landing/HowItWorks.tsx` | 3-step explainer |
| `src/components/landing/MapPreview.tsx` | Map teaser screenshot/animation |
| `src/components/landing/Testimonials.tsx` | Social proof quotes |
| `src/components/landing/Footer.tsx` | Site-wide footer |
| `src/components/layout/Navbar.tsx` | Top navigation bar (shared across landing + map) |
| **Supabase & Data** | |
| `src/lib/supabase/client.ts` | Browser-side Supabase client |
| `src/lib/supabase/server.ts` | Server-side Supabase client |
| `src/lib/supabase/types.ts` | Auto-generated DB types |
| `src/types/place.ts` | Core `Place` TypeScript interface |
| `src/types/profile.ts` | Profile / user role TypeScript types |
| `src/types/filters.ts` | Filter types |
| **Map Experience** | |
| `src/app/map/page.tsx` | Full-viewport map page |
| `src/lib/map/config.ts` | Map defaults (center, zoom, style) |
| `src/lib/map/helpers.ts` | Bounds → query param conversion |
| `src/lib/overpass/fetcher.ts` | Overpass API HTTP client |
| `src/lib/overpass/normalizer.ts` | OSM record → `Place` type |
| `src/hooks/useMapViewport.ts` | Debounced viewport tracking |
| `src/hooks/usePlaces.ts` | Viewport-aware place fetching |
| `src/components/map/MapContainer.tsx` | MapLibre + react-map-gl wrapper |
| `src/components/map/ClusterLayer.tsx` | GeoJSON clustering |
| `src/components/map/MarkerPopup.tsx` | Click popup |
| `src/components/places/DetailPanel.tsx` | Slide-out place details |
| `src/components/places/PlaceCard.tsx` | Compact card summary |
| `src/components/search/SearchBar.tsx` | Geocoded search |
| `src/components/layout/Header.tsx` | Map page header bar |
| `src/app/layout.tsx` | Root layout with fonts + metadata |
| **Scripts** | |
| `scripts/seed-osm.ts` | OSM → Supabase seeder |

### Phase 2 Files to Create

| File | Purpose |
|---|---|
| `src/components/places/FilterBar.tsx` | Filter toggles and chips |
| `src/hooks/useFilters.ts` | Filter state management |
| `src/components/places/AmenityList.tsx` | Amenity icons + labels |
| `src/components/places/DisciplineBadges.tsx` | Discipline tag badges |

### Phase 3 Files to Create

| File | Purpose |
|---|---|
| `src/app/login/page.tsx` | Login page |
| `src/app/signup/page.tsx` | Signup page |
| `src/app/auth/callback/route.ts` | OAuth callback handler |
| `src/components/suggestions/SuggestionForm.tsx` | Multi-step submission form |
| `src/components/suggestions/MapPinPicker.tsx` | Click-to-place coordinate picker |
| `src/types/suggestion.ts` | Suggestion TypeScript types |
| `src/lib/supabase/auth.ts` | Auth helper utilities |
| `src/hooks/useProfile.ts` | Fetch and cache current user's profile |

### Phase 4 Files to Create

| File | Purpose |
|---|---|
| `src/app/admin/layout.tsx` | Admin layout with nav |
| `src/app/admin/page.tsx` | Admin dashboard overview |
| `src/app/admin/suggestions/page.tsx` | Suggestion review queue |
| `src/components/admin/SuggestionReviewCard.tsx` | Approve/reject UI |
| `src/components/admin/DuplicateWarning.tsx` | Proximity dupe alert |

### Phase 5 Files to Create

| File | Purpose |
|---|---|
| `src/app/admin/curate/page.tsx` | Curated place editor |
| `src/components/places/ConditionReport.tsx` | User condition input |
| `src/components/places/PhotoGallery.tsx` | Multi-image gallery |
| `src/components/search/Autocomplete.tsx` | Search autocomplete dropdown |

---

> **Last updated:** April 2026
>
> This document is the single source of truth for the Crux project roadmap. Update it as decisions are made and phases are completed.
