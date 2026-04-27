// Seed Cortland Community Corners projects.
// Prerequisites:
//   1. Run migration.sql in Supabase SQL editor first (adds sponsor column).
//   2. SUPABASE_URL and SUPABASE_SECRET_KEY must be set in .env.local.
//
// Run with:
//   npx dotenv -e .env.local -- npx tsx src/scripts/seed-community-corners.ts

import { createClient } from '@supabase/supabase-js';

async function main() {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
  );

  // Intersection coordinates fetched from DB (sort_order west→east)
  const INT: Record<string, [number, number]> = {
    elsie:       [-122.419649, 37.739764],
    bocana:      [-122.417220, 37.739129],
    bennington:  [-122.417897, 37.739195],
    wool:        [-122.417139, 37.739121],
    ellsworth:   [-122.416403, 37.739050],
    moultrie:    [-122.415899, 37.739009],
    anderson:    [-122.415197, 37.738934],
    folsom:      [-122.415162, 37.738939],
    gates:       [-122.413191, 37.739014],
    nevada:      [-122.411395, 37.739851],
    prentiss:    [-122.411990, 37.739711],
    bradford:    [-122.409534, 37.739720],
    prospect:    [-122.410733, 37.739792],
    bonview:     [-122.408895, 37.739689],
  };

  function lng(slug: string) { return INT[slug][0]; }
  function lat(slug: string) { return INT[slug][1]; }

  type Row = {
    id: string;
    name: string;
    type: string;
    status: string;
    description: string;
    lng: number;
    lat: number;
    side: string;
    span_meters: number | null;
    images: string[];
    links: { label: string; url: string }[];
    date: string | null;
    tags: string[];
    sponsor: string | null;
  };

  const rows: Row[] = [
    // ── Elsie ──────────────────────────────────────────────────────────────────
    {
      id: 'cc-elsie-psz',
      name: 'Cortland & Elsie — Painted Safety Zone',
      type: 'painted-safety-zone',
      status: 'proposed',
      description: 'Small painted safety zone at the Cortland & Elsie intersection, creating a visible pedestrian space at the corner.',
      lng: lng('elsie'), lat: lat('elsie'), side: 'both',
      span_meters: null, images: [], links: [], date: null,
      tags: ['community-corners'], sponsor: null,
    },
    {
      id: 'cc-elsie-planters',
      name: 'Cortland & Elsie — Community Planters',
      type: 'planter',
      status: 'idea',
      description: 'Planted curb extensions or corner planters at Cortland & Elsie to calm traffic and add greenery.',
      lng: lng('elsie'), lat: lat('elsie'), side: 'both',
      span_meters: null, images: [], links: [], date: null,
      tags: ['community-corners'], sponsor: null,
    },
    {
      id: 'cc-elsie-beacon',
      name: 'Cortland & Elsie — Crosswalk Flashing Beacon',
      type: 'crosswalk',
      status: 'proposed',
      description: 'Rectangular Rapid Flash Beacon (RRFB) to improve visibility for pedestrians crossing Cortland at Elsie.',
      lng: lng('elsie'), lat: lat('elsie'), side: 'center',
      span_meters: null, images: [], links: [], date: null,
      tags: ['community-corners', 'beacon'], sponsor: null,
    },

    // ── Bocana ─────────────────────────────────────────────────────────────────
    {
      id: 'cc-bocana-island',
      name: 'Cortland & Bocana — Pedestrian Island',
      type: 'pedestrian-island',
      status: 'proposed',
      description: 'Pedestrian refuge island in the Cortland & Bocana intersection to shorten crossing distances.',
      lng: lng('bocana'), lat: lat('bocana'), side: 'center',
      span_meters: null, images: [], links: [], date: null,
      tags: ['community-corners'], sponsor: null,
    },

    // ── Bennington ─────────────────────────────────────────────────────────────
    {
      id: 'cc-bennington-psz',
      name: 'Cortland & Bennington — Painted Safety Zone',
      type: 'painted-safety-zone',
      status: 'proposed',
      description: 'Small painted safety zone at Cortland & Bennington.',
      lng: lng('bennington'), lat: lat('bennington'), side: 'both',
      span_meters: null, images: [], links: [], date: null,
      tags: ['community-corners'], sponsor: null,
    },
    {
      id: 'cc-bennington-art',
      name: 'Cortland & Bennington — Asphalt Art',
      type: 'street-mural',
      status: 'idea',
      description: 'Community-designed asphalt art at the Cortland & Bennington intersection.',
      lng: lng('bennington'), lat: lat('bennington'), side: 'both',
      span_meters: null, images: [], links: [], date: null,
      tags: ['community-corners', 'asphalt-art'], sponsor: null,
    },

    // ── Wool ───────────────────────────────────────────────────────────────────
    {
      id: 'cc-wool-psz',
      name: 'Cortland & Wool — Painted Safety Zone',
      type: 'painted-safety-zone',
      status: 'proposed',
      description: 'Painted safety zone at Cortland & Wool St.',
      lng: lng('wool'), lat: lat('wool'), side: 'both',
      span_meters: null, images: [], links: [], date: null,
      tags: ['community-corners'], sponsor: null,
    },
    {
      id: 'cc-wool-art',
      name: 'Cortland & Wool — Asphalt Art',
      type: 'street-mural',
      status: 'idea',
      description: 'Community-designed asphalt art at Cortland & Wool.',
      lng: lng('wool'), lat: lat('wool'), side: 'both',
      span_meters: null, images: [], links: [], date: null,
      tags: ['community-corners', 'asphalt-art'], sponsor: null,
    },

    // ── Ellsworth ──────────────────────────────────────────────────────────────
    {
      id: 'cc-ellsworth-psz',
      name: 'Cortland & Ellsworth — Painted Safety Zone',
      type: 'painted-safety-zone',
      status: 'proposed',
      description: 'Painted safety zone at Cortland & Ellsworth St.',
      lng: lng('ellsworth'), lat: lat('ellsworth'), side: 'both',
      span_meters: null, images: [], links: [], date: null,
      tags: ['community-corners'], sponsor: null,
    },
    {
      id: 'cc-ellsworth-planters',
      name: 'Cortland & Ellsworth — Planters',
      type: 'planter',
      status: 'idea',
      description: 'Community planters at Cortland & Ellsworth.',
      lng: lng('ellsworth'), lat: lat('ellsworth'), side: 'both',
      span_meters: null, images: [], links: [], date: null,
      tags: ['community-corners'], sponsor: null,
    },
    {
      id: 'cc-ellsworth-island',
      name: 'Cortland & Ellsworth — Pedestrian Island',
      type: 'pedestrian-island',
      status: 'proposed',
      description: 'Pedestrian refuge island at Cortland & Ellsworth.',
      lng: lng('ellsworth'), lat: lat('ellsworth'), side: 'center',
      span_meters: null, images: [], links: [], date: null,
      tags: ['community-corners'], sponsor: null,
    },

    // ── Moultrie South ─────────────────────────────────────────────────────────
    {
      id: 'cc-moultrie-south-psz',
      name: 'Cortland & Moultrie (South) — Painted Safety Zone',
      type: 'painted-safety-zone',
      status: 'proposed',
      description: 'Large painted safety zone on the south side of Cortland & Moultrie, adjacent to the Bernal Branch Library.',
      lng: lng('moultrie'), lat: lat('moultrie'), side: 'south',
      span_meters: null, images: [], links: [], date: null,
      tags: ['community-corners', 'library'], sponsor: 'Civic Joy + Greening Projects',
    },
    {
      id: 'cc-moultrie-south-planters',
      name: 'Cortland & Moultrie (South) — Planters Pilot',
      type: 'planter',
      status: 'proposed',
      description: 'Pilot planter installation on the south side of Cortland & Moultrie, adjacent to the library.',
      lng: lng('moultrie'), lat: lat('moultrie'), side: 'south',
      span_meters: null, images: [], links: [], date: null,
      tags: ['community-corners'], sponsor: 'Civic Joy + Greening Projects',
    },

    // ── Moultrie North ─────────────────────────────────────────────────────────
    {
      id: 'cc-moultrie-north-psz',
      name: 'Cortland & Moultrie (North) — Painted Safety Zone',
      type: 'painted-safety-zone',
      status: 'proposed',
      description: 'Large painted safety zone on the north side of Cortland & Moultrie.',
      lng: lng('moultrie'), lat: lat('moultrie'), side: 'north',
      span_meters: null, images: [], links: [], date: null,
      tags: ['community-corners'], sponsor: 'Greening Projects',
    },
    {
      id: 'cc-moultrie-north-planters',
      name: 'Cortland & Moultrie (North) — Planters',
      type: 'planter',
      status: 'idea',
      description: 'Community planters on the north side of Cortland & Moultrie.',
      lng: lng('moultrie'), lat: lat('moultrie'), side: 'north',
      span_meters: null, images: [], links: [], date: null,
      tags: ['community-corners'], sponsor: 'Greening Projects',
    },

    // ── Anderson South ─────────────────────────────────────────────────────────
    {
      id: 'cc-anderson-south-psz',
      name: 'Cortland & Anderson (South) — Painted Safety Zone',
      type: 'painted-safety-zone',
      status: 'proposed',
      description: 'Painted safety zone on the south side of Cortland & Anderson, adjacent to Moonlight Cafe.',
      lng: lng('anderson'), lat: lat('anderson'), side: 'south',
      span_meters: null, images: [], links: [], date: null,
      tags: ['community-corners', 'moonlight-cafe'], sponsor: null,
    },
    {
      id: 'cc-anderson-south-art',
      name: 'Cortland & Anderson (South) — Asphalt Art',
      type: 'street-mural',
      status: 'idea',
      description: 'Community-designed asphalt art on the south side of Cortland & Anderson.',
      lng: lng('anderson'), lat: lat('anderson'), side: 'south',
      span_meters: null, images: [], links: [], date: null,
      tags: ['community-corners', 'asphalt-art'], sponsor: null,
    },
    {
      id: 'cc-anderson-beacon',
      name: 'Cortland & Anderson — Crosswalk Flashing Beacon',
      type: 'crosswalk',
      status: 'proposed',
      description: 'RRFB beacon crossing at Cortland & Anderson to improve pedestrian safety.',
      lng: lng('anderson'), lat: lat('anderson'), side: 'center',
      span_meters: null, images: [], links: [], date: null,
      tags: ['community-corners', 'beacon'], sponsor: null,
    },

    // ── Anderson North ─────────────────────────────────────────────────────────
    {
      id: 'cc-anderson-north-psz',
      name: 'Cortland & Anderson (North) — Painted Safety Zone',
      type: 'painted-safety-zone',
      status: 'proposed',
      description: 'Painted safety zone on the north side of Cortland & Anderson.',
      lng: lng('anderson'), lat: lat('anderson'), side: 'north',
      span_meters: null, images: [], links: [], date: null,
      tags: ['community-corners'], sponsor: null,
    },
    {
      id: 'cc-anderson-north-art',
      name: 'Cortland & Anderson (North) — Asphalt Art',
      type: 'street-mural',
      status: 'idea',
      description: 'Community-designed asphalt art on the north side of Cortland & Anderson.',
      lng: lng('anderson'), lat: lat('anderson'), side: 'north',
      span_meters: null, images: [], links: [], date: null,
      tags: ['community-corners', 'asphalt-art'], sponsor: null,
    },

    // ── Anderson (mid-block pedestrian island — BHNC) ─────────────────────────
    {
      id: 'cc-anderson-island',
      name: 'Cortland near Anderson — Pedestrian Island',
      type: 'pedestrian-island',
      status: 'idea',
      description: 'Pedestrian refuge island near Cortland & Anderson, suggested by the Bernal Heights Neighborhood Center.',
      lng: lng('anderson'), lat: lat('anderson'), side: 'center',
      span_meters: null, images: [], links: [], date: null,
      tags: ['community-corners', 'bhnc'], sponsor: null,
    },

    // ── Gates South ────────────────────────────────────────────────────────────
    {
      id: 'cc-gates-south-psz',
      name: 'Cortland & Gates (South) — Painted Safety Zone',
      type: 'painted-safety-zone',
      status: 'proposed',
      description: 'Painted safety zone on the south side of Cortland & Gates St.',
      lng: lng('gates'), lat: lat('gates'), side: 'south',
      span_meters: null, images: [], links: [], date: null,
      tags: ['community-corners'], sponsor: null,
    },
    {
      id: 'cc-gates-south-planters',
      name: 'Cortland & Gates (South) — Planters',
      type: 'planter',
      status: 'idea',
      description: 'Community planters on the south side of Cortland & Gates.',
      lng: lng('gates'), lat: lat('gates'), side: 'south',
      span_meters: null, images: [], links: [], date: null,
      tags: ['community-corners'], sponsor: null,
    },

    // ── Gates North (Bike Share) ───────────────────────────────────────────────
    {
      id: 'cc-gates-north-bikeshare',
      name: 'Cortland & Gates (North) — Bike Share Station',
      type: 'bike-share',
      status: 'proposed',
      description: 'Bay Wheels bike share station proposed for the north side of Cortland & Gates.',
      lng: lng('gates'), lat: lat('gates'), side: 'north',
      span_meters: null, images: [], links: [], date: null,
      tags: ['community-corners', 'bay-wheels'], sponsor: null,
    },

    // ── Folsom ─────────────────────────────────────────────────────────────────
    {
      id: 'cc-folsom-psz',
      name: 'Cortland & Folsom — Painted Safety Zone',
      type: 'painted-safety-zone',
      status: 'proposed',
      description: 'Painted safety zone at the Cortland & Folsom intersection.',
      lng: lng('folsom'), lat: lat('folsom'), side: 'both',
      span_meters: null, images: [], links: [], date: null,
      tags: ['community-corners'], sponsor: null,
    },

    // ── Prentiss ───────────────────────────────────────────────────────────────
    {
      id: 'cc-prentiss-busstop',
      name: 'Cortland & Prentiss — Bus Stop Improvements',
      type: 'bus-stop',
      status: 'proposed',
      description: 'Improved bus stop amenities at Cortland & Prentiss St.',
      lng: lng('prentiss'), lat: lat('prentiss'), side: 'center',
      span_meters: null, images: [], links: [], date: null,
      tags: ['community-corners', 'transit'], sponsor: null,
    },

    // ── Bradford ───────────────────────────────────────────────────────────────
    {
      id: 'cc-bradford-psz',
      name: 'Cortland & Bradford — Painted Safety Zone',
      type: 'painted-safety-zone',
      status: 'proposed',
      description: 'Painted safety zone at the Cortland & Bradford intersection.',
      lng: lng('bradford'), lat: lat('bradford'), side: 'both',
      span_meters: null, images: [], links: [], date: null,
      tags: ['community-corners'], sponsor: null,
    },

    // ── Nevada ─────────────────────────────────────────────────────────────────
    {
      id: 'cc-nevada-psz',
      name: 'Cortland & Nevada — Painted Safety Zone',
      type: 'painted-safety-zone',
      status: 'proposed',
      description: 'Painted safety zone at the Cortland & Nevada intersection.',
      lng: lng('nevada'), lat: lat('nevada'), side: 'both',
      span_meters: null, images: [], links: [], date: null,
      tags: ['community-corners'], sponsor: null,
    },

    // ── Prospect ───────────────────────────────────────────────────────────────
    {
      id: 'cc-prospect-island',
      name: 'Cortland & Prospect — Pedestrian Island',
      type: 'pedestrian-island',
      status: 'proposed',
      description: 'Pedestrian refuge island at the Cortland & Prospect Ave intersection.',
      lng: lng('prospect'), lat: lat('prospect'), side: 'center',
      span_meters: null, images: [], links: [], date: null,
      tags: ['community-corners'], sponsor: null,
    },
  ];

  console.log(`Upserting ${rows.length} Community Corners projects…`);

  const { error } = await supabase
    .from('projects')
    .upsert(rows, { onConflict: 'id' });

  if (error) {
    if (error.message.includes('sponsor')) {
      console.error('Error: "sponsor" column not found. Run migration.sql in Supabase first, then retry.');
    } else {
      console.error('Seed failed:', error.message);
    }
    process.exit(1);
  }

  console.log(`✓ ${rows.length} projects seeded successfully.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
