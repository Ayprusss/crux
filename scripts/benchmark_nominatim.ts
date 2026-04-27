
async function simulateSearch(queries: string[], searchFn: (q: string) => Promise<void>) {
  for (const q of queries) {
    await searchFn(q);
  }
}

async function runBenchmark() {
  console.log("Running Nominatim Geocoding Benchmark...");

  const queries = ["Toronto", "Vancouver", "Toronto", "Montreal", "Vancouver", "Toronto"];

  // Baseline (No Cache)
  let baselineCalls = 0;
  async function baselineSearch(q: string) {
    if (q.length < 3) return;
    baselineCalls++;
    // Simulate API call
    // await fetch(...)
  }

  await simulateSearch(queries, baselineSearch);
  console.log(`Baseline (No Cache) calls for ${queries.length} searches (${new Set(queries).size} unique): ${baselineCalls}`);

  // Optimized (With Cache)
  let optimizedCalls = 0;
  const cache: Record<string, any> = {};
  async function optimizedSearch(q: string) {
    if (q.length < 3) return;
    if (cache[q]) {
      return;
    }
    optimizedCalls++;
    cache[q] = [{ place_id: 1, display_name: "Mock Result" }];
  }

  await simulateSearch(queries, optimizedSearch);
  console.log(`Optimized (With Cache) calls for ${queries.length} searches (${new Set(queries).size} unique): ${optimizedCalls}`);

  if (optimizedCalls < baselineCalls) {
    console.log(`Improvement: ${((baselineCalls - optimizedCalls) / baselineCalls * 100).toFixed(2)}% fewer API calls.`);
  } else {
    console.log("No improvement detected.");
  }
}

runBenchmark().catch(console.error);
