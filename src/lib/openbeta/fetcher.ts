/**
 * OpenBeta GraphQL client for fetching Canadian climbing areas and routes.
 *
 * Uses the public OpenBeta API at https://api.openbeta.io
 * Fetches leaf areas (crags/boulders) directly using leaf_status + path_tokens
 * filters to avoid expensive recursive tree walking.
 */

const OPENBETA_API = "https://api.openbeta.io"

// ── GraphQL Queries ──────────────────────────────────────────────

/**
 * Fetch leaf areas under a given path token hierarchy.
 * The leaf_status filter directly targets crags/boulders,
 * eliminating the need for recursive tree traversal.
 */
const LEAF_AREAS_QUERY = `
  query FetchLeafAreas($tokens: [String!]!, $limit: Int, $offset: Int) {
    areas(
      filter: {
        path_tokens: { tokens: $tokens, exactMatch: false }
        leaf_status: { isLeaf: true }
      }
      limit: $limit
      offset: $offset
    ) {
      uuid
      area_name
      metadata {
        lat
        lng
        leaf
        isBoulder
      }
      totalClimbs
      content {
        description
      }
      pathTokens
      ancestors
      aggregate {
        byDiscipline {
          sport { total }
          trad { total }
          bouldering { total }
          tr { total }
          ice { total }
          alpine { total }
          aid { total }
        }
      }
    }
  }
`

/**
 * Fetch climbs for a specific area by UUID.
 */
const CLIMBS_QUERY = `
  query FetchClimbs($uuid: ID) {
    area(uuid: $uuid) {
      uuid
      area_name
      climbs {
        uuid
        name
        fa
        length
        grades {
          yds
          vscale
          font
          french
          ewbank
          uiaa
        }
        type {
          sport
          trad
          bouldering
          tr
          ice
          alpine
          aid
          mixed
          deepwatersolo
          snow
        }
        content {
          description
          protection
        }
      }
    }
  }
`

// ── Types ────────────────────────────────────────────────────────

export interface OpenBetaArea {
  uuid: string
  area_name: string
  metadata: {
    lat: number | null
    lng: number | null
    leaf: boolean
    isBoulder: boolean | null
  }
  totalClimbs: number
  content?: {
    description: string | null
  }
  pathTokens: string[]
  ancestors?: string[]
  aggregate?: {
    byDiscipline: {
      sport?: { total: number }
      trad?: { total: number }
      bouldering?: { total: number }
      tr?: { total: number }
      ice?: { total: number }
      alpine?: { total: number }
      aid?: { total: number }
    }
  }
}

export interface OpenBetaClimb {
  uuid: string
  name: string
  fa: string | null
  length: number
  grades: {
    yds?: string | null
    vscale?: string | null
    font?: string | null
    french?: string | null
    ewbank?: string | null
    uiaa?: string | null
  } | null
  type: {
    sport?: boolean
    trad?: boolean
    bouldering?: boolean
    tr?: boolean
    ice?: boolean
    alpine?: boolean
    aid?: boolean
    mixed?: boolean
    deepwatersolo?: boolean
    snow?: boolean
  }
  content: {
    description: string | null
    protection: string | null
  }
}

export interface OpenBetaAreaWithClimbs {
  uuid: string
  area_name: string
  climbs: OpenBetaClimb[]
}

// ── Fetch helpers ────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function graphqlFetch<T>(query: string, variables: Record<string, unknown>, retries = 3): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(OPENBETA_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables }),
      })

      if (!response.ok) {
        // Retry on transient server errors
        if ((response.status === 502 || response.status === 503 || response.status === 429) && attempt < retries) {
          const backoff = attempt * 5000
          console.warn(`   ⚠️  API returned ${response.status}, retrying in ${backoff / 1000}s… (attempt ${attempt}/${retries})`)
          await sleep(backoff)
          continue
        }
        throw new Error(`OpenBeta API error: ${response.status} ${response.statusText}`)
      }

      const json = await response.json()

      if (json.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`)
      }

      return json.data as T
    } catch (err) {
      if (attempt < retries && err instanceof TypeError) {
        // Network errors (fetch failed, connection reset, etc.)
        const backoff = attempt * 5000
        console.warn(`   ⚠️  Network error, retrying in ${backoff / 1000}s… (attempt ${attempt}/${retries})`)
        await sleep(backoff)
        continue
      }
      throw err
    }
  }

  throw new Error("Unreachable: exhausted retries")
}

// ── Public API ───────────────────────────────────────────────────

/**
 * Fetch all leaf areas under the given path tokens from OpenBeta.
 * Uses pagination — no recursion needed since we filter by leaf_status directly.
 */
export async function fetchAllLeafAreas(
  tokens: string[],
  rateDelayMs = 1500
): Promise<OpenBetaArea[]> {
  const allAreas: OpenBetaArea[] = []
  let offset = 0
  const limit = 100
  let page = 1

  while (true) {
    console.log(`   📄 Fetching leaf areas page ${page} (offset ${offset})…`)

    await sleep(rateDelayMs)
    const data = await graphqlFetch<{ areas: OpenBetaArea[] }>(LEAF_AREAS_QUERY, {
      tokens,
      limit,
      offset,
    })

    const areas = data.areas ?? []
    if (areas.length === 0) break

    // Filter to only areas with valid coordinates
    const valid = areas.filter((a) => a.metadata.lat != null && a.metadata.lng != null)
    allAreas.push(...valid)

    console.log(`      → ${valid.length} valid areas (${areas.length} total on page)`)

    if (areas.length < limit) break
    offset += limit
    page++
  }

  // Deduplicate by UUID
  const seen = new Set<string>()
  return allAreas.filter((a) => {
    if (seen.has(a.uuid)) return false
    seen.add(a.uuid)
    return true
  })
}

/**
 * Fetch all climbs for a specific area by UUID.
 */
export async function fetchClimbsForArea(
  uuid: string
): Promise<OpenBetaClimb[]> {
  const data = await graphqlFetch<{ area: OpenBetaAreaWithClimbs | null }>(CLIMBS_QUERY, {
    uuid,
  })

  return data.area?.climbs ?? []
}
