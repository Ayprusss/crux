# Data Strategy: OpenStreetMap & OpenBeta Integration

This document outlines the future path for expanding the Crux database by integrating **OpenBeta** data to supplement our existing **OpenStreetMap (OSM)** foundation.

## Current State
- **Primary Source**: OpenStreetMap (OSM) via Overpass API.
- **Model**: Centered around `Places` (Crags, Boulders, Gyms).
- **Strength**: High-accuracy geographic coordinates and broad community coverage for location discovery.
- **Weakness**: Limited data on individual climbing routes, grades, and specific route-level descriptions.

## Proposed Strategy: The Hybrid Model
We will move toward a hybrid model where OSM provides the **geographic foundation** (locations/navigation) and OpenBeta provides the **climb-level detail** (routes/metadata).

### 1. Data Source Comparison
| Feature | OpenStreetMap (OSM) | OpenBeta |
| :--- | :--- | :--- |
| **Primary Unit** | Geospatial Node/Way (The Place) | Climbing Area/Route (The Activity) |
| **Route Info** | Basic (if any) | Comprehensive (Grades, Length, Type) |
| **Coordinates** | High Accuracy | Moderate Accuracy (varies) |
| **Access Method** | Overpass API | GraphQL / JSON Exports |
| **License** | ODbL (Open Data Commons) | CC-BY-SA 4.0 |

### 2. Matching Strategy (Architecture)
Linking OSM `places` with OpenBeta `areas` is the core technical challenge.

#### Phase A: Spatial Joining
Use PostGIS to match OpenBeta areas to existing Crux places based on:
- **Proximity**: Points within a 50–100m radius.
- **Fuzzy Name Matching**: Comparing `name` fields (e.g., "The Gallery" vs "Gallery Crag").

#### Phase B: The `routes` Table (New)
Introduce a new table structure to store climb-level data:
- `id`: UUID (Primary Key)
- `place_id`: UUID (Foreign Key to `places`)
- `external_id`: OpenBeta UUID for future sync
- `name`: string
- `grade`: JSON/string (e.g., `{ "yds": "5.10a", "font": "6a" }`)
- `type`: Sport, Trad, Boulder, Top Rope
- `description`: text

### 3. Verification Workflow
To ensure data integrity, we must verify existing data against OpenBeta’s dataset.

#### Automated Validation
- **Coordinate Drift**: Flag places where OSM and OpenBeta coordinates differ by >200m.
- **Type Mismatches**: Flag entries where OSM says "Crag" and OpenBeta says "Boulder Area".
- **Duplicate Detection**: Identify cases where multiple OSM nodes might represent a single OpenBeta area.

#### Manual Verification (Admin Portal)
- Integrate an "Ingestion Review" screen in the [Admin Dashboard](/src/app/admin).
- Provide a side-by-side diff view for admins to "Merge" OSM and OpenBeta records.

## Next Steps
1. **Extend Type Definitions**: Update `src/types` to support Route and Grade interfaces.
2. **Draft OpenBeta Ingestor**: Create `scripts/seed-openbeta.ts` to fetch and normalize data from the OpenBeta GraphQL API.
3. **Data Audit**: Run a one-time script to report how many current `places` have a likely match in OpenBeta.
