# Crux

**Crux** is a premier, community-driven climbing map platform designed to unify climbers with outdoor crags, bouldering spots, and indoor gyms across the globe. Initially seeded via OpenStreetMap (OSM) data, the platform is heavily augmented by a native community moderation loop—letting climbers pinpoint new discoveries, upload photos of beta, and continually refine global climbing data.

## 🎯 Project Goal
The primary objective of Crux is to resolve the fragmentation in modern climbing topography by merging the raw, expansive data of map tiles with a sleek, highly-interactive user interface. It puts the power in the community's hands, allowing locals to securely curate, correct, and verify their home crags.

---

## ✨ Features Currently Implemented

* **Massive-Scale Interactive Mapping:** Powered by MapLibre GL, the map effortlessly handles tens of thousands of coordinate points using native, high-performance clustering.
* **Geospatial Filtering:** Users can dynamically slice data by disciplines (Sport, Trad, Bouldering) or environment (Indoor vs Outdoor), with the viewport automatically fetching bounded limits to save bandwidth.
* **Community Suggestions:** A robust user pipeline allowing registered climbers to drop a targeting crosshair directly onto the map to submit newly discovered spots, including photo attachments.
* **Dual-Approval Administration:** A strictly-enforced admin dashboard for quality control. It leverages a side-by-side visual diff tool to verify community edits, and requires two separate Admins to approve the promotion of any new staff members.
* **PostGIS Duplicate Detection:** Running natively on the server layer, any new map submission automatically scans a ~100-meter geographic radius, flashing warnings to moderators if a duplicate submission is detected.
* **Authentication & Saved Spots:** Full Supabase Auth integration permitting users to securely 'heart' multiple locations and quickly recall them via a sliding UI panel.
* **Dynamic Confidence Scoring:** A lightweight, front-end algorithm that computes a location's trustworthiness (from 40% to 100%) based entirely on its origin (`osm`, `user`, or `curated`) and Admin Verification status, avoiding heavy database aggregations.

---

## 🛠 Tech Stack & Architecture

This application is built with an uncompromising focus on speed, modern React paradigms, and secure database interactions.

### The Stack
- **Framework:** Next.js 14+ (App Router, Server Components, Server Actions)
- **Styling:** Tailwind CSS v4 alongside Lucide-React for crisp iconography
- **Mapping:** MapLibre GL JS wrapped with `react-map-gl` for seamless React context
- **Backend & Database:** Supabase (PostgreSQL) with integrated Auth and Storage buckets
- **Geographic Computations:** PostGIS extension (`ST_DWithin`, bounding boxes)

### Architecture Notes
1. **Server Actions First:** Rather than relying exclusively on complex client-side Row Level Security (RLS) policies, all administrative moderation tasks (Approving edits, escalating users) are passed securely to Next.js strict Server Actions, effectively masking sensitive logic from the browser frontend.
2. **Component Granularity:** UI systems are heavily partitioned (e.g. `MapContainer`, `DetailPanel`, `MarkerPopup`, `FilterBar`) connected by cleanly hoisted state mechanics protecting against unnecessary re-renders when interacting with MapLibre.
3. **Storage & Assets:** User-uploaded climbing photos are routed through a strictly structured Supabase `place_photos` bucket before their public URL payloads are bound into the database schema.

---

## 🚀 Future Changes & Roadmap

While the core functionality of mapping and community curation is complete, the horizon for Crux involves turning it into a true climbing companion:

- **Condition Reports (Phase 5):** Integrating live weather APIs and allowing users to post temporary, localized warnings (e.g. "Holds are currently seeping," or "Access trail washed out").
- **Social Climbing Metrics (Phase 6):** Letting users log "Ticks" (sends) directly to a location, leaving mini-reviews, creating tick-lists, and sharing itineraries with friends.
- **Advanced Gamification:** Expanding upon the "Verification Badges" to include reputation scores for users who consistently provide highly accurate crag adjustments.
- **Offline Capabilities:** Leveraging PWA structures to allow climbers deep in the wilderness to cache standard map tiles and location primitives directly onto their devices.
