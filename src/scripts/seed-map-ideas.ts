// Seed ideas from the "Safer Streets Bernal Projects" Google My Maps KML export.
// All items added as status: 'idea'.
//
// Run with:
//   npx dotenv-cli -e .env.local -- npx tsx src/scripts/seed-map-ideas.ts

import { createClient } from '@supabase/supabase-js';

async function main() {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
  );

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
    // ── Daylighting — Cortland commercial corridor (west→east) ────────────────
    {
      id: 'map-daylight-barberella',
      name: 'Daylighting — Barberella',
      type: 'daylighting',
      status: 'idea',
      description: 'Add Muni boarding island (or bike corral or planters) to enforce AB413.',
      lng: -122.4179027, lat: 37.739173, side: 'both',
      span_meters: null, images: [], links: [], date: null,
      tags: ['daylighting', 'ab413'], sponsor: null,
    },
    {
      id: 'map-daylight-epicurean',
      name: 'Daylighting — Epicurean',
      type: 'daylighting',
      status: 'idea',
      description: 'Add either bike corral or planters, red paint at minimum to enforce AB413.',
      lng: -122.417731, lat: 37.7392207, side: 'both',
      span_meters: null, images: [], links: [], date: null,
      tags: ['daylighting', 'ab413'], sponsor: null,
    },
    {
      id: 'map-daylight-new-wheel',
      name: 'Daylighting — New Wheel Bike Shop',
      type: 'daylighting',
      status: 'idea',
      description: 'Add planters or bike corral to protect crosswalk. Existing red paint.',
      lng: -122.4172025, lat: 37.7391254, side: 'both',
      span_meters: null, images: [], links: [], date: null,
      tags: ['daylighting', 'ab413'], sponsor: null,
    },
    {
      id: 'map-daylight-go-duck',
      name: 'Daylighting — Go Duck Yourself',
      type: 'daylighting',
      status: 'idea',
      description: 'Add either bike corral or planters, red paint at minimum to enforce AB413.',
      lng: -122.4171099, lat: 37.7391481, side: 'both',
      span_meters: null, images: [], links: [], date: null,
      tags: ['daylighting', 'ab413'], sponsor: null,
    },
    {
      id: 'map-daylight-goodlife',
      name: 'Daylighting — GoodLife Grocery',
      type: 'daylighting',
      status: 'idea',
      description: 'Add Muni boarding island (or bike corral or planters) to enforce AB413.',
      lng: -122.4165136, lat: 37.739061, side: 'both',
      span_meters: null, images: [], links: [], date: null,
      tags: ['daylighting', 'ab413'], sponsor: null,
    },
    {
      id: 'map-daylight-architecture',
      name: 'Daylighting — Architecture Firm',
      type: 'daylighting',
      status: 'idea',
      description: 'Add Muni boarding island (or bike corral or planters) to enforce AB413.',
      lng: -122.4165015, lat: 37.7390926, side: 'both',
      span_meters: null, images: [], links: [], date: null,
      tags: ['daylighting', 'ab413'], sponsor: null,
    },
    {
      id: 'map-daylight-zipcar',
      name: 'Daylighting — ZipCar Parking Space',
      type: 'daylighting',
      status: 'idea',
      description: 'Eliminate ZipCar parking space. Add bike corral for daylighting. SFMTA has already promised to do this in the next batch of ZipCar parking daylighting.',
      lng: -122.416453, lat: 37.7390186, side: 'both',
      span_meters: null, images: [], links: [], date: null,
      tags: ['daylighting', 'ab413', 'sfmta-committed'], sponsor: null,
    },
    {
      id: 'map-daylight-library',
      name: 'Daylighting — Bernal Library',
      type: 'daylighting',
      status: 'idea',
      description: 'Add rain garden or planters to enforce AB413, red paint at minimum.',
      lng: -122.4158936, lat: 37.7390007, side: 'both',
      span_meters: null, images: [], links: [], date: null,
      tags: ['daylighting', 'ab413'], sponsor: null,
    },
    {
      id: 'map-daylight-residential-1',
      name: 'Daylighting — Residential (near Library)',
      type: 'daylighting',
      status: 'idea',
      description: 'Add rain garden, bike corral or planters to enforce AB413, red paint at minimum.',
      lng: -122.415886, lat: 37.7390279, side: 'both',
      span_meters: null, images: [], links: [], date: null,
      tags: ['daylighting', 'ab413'], sponsor: null,
    },
    {
      id: 'map-daylight-construction',
      name: 'Daylighting — Construction Firm',
      type: 'daylighting',
      status: 'idea',
      description: 'Add either bike corral or planters, red paint at minimum to enforce AB413.',
      lng: -122.4152815, lat: 37.7389715, side: 'both',
      span_meters: null, images: [], links: [], date: null,
      tags: ['daylighting', 'ab413'], sponsor: null,
    },
    {
      id: 'map-daylight-moonlight',
      name: 'Daylighting — Moonlight Cafe',
      type: 'daylighting',
      status: 'idea',
      description: 'Add either bike corral or planters to enforce AB413.',
      lng: -122.4152744, lat: 37.7389248, side: 'both',
      span_meters: null, images: [], links: [], date: null,
      tags: ['daylighting', 'ab413'], sponsor: null,
    },
    {
      id: 'map-daylight-tequila',
      name: 'Daylighting — Tequila Shop',
      type: 'daylighting',
      status: 'idea',
      description: 'Add Muni boarding island (or bike corral or planters) to enforce AB413. Existing flex posts.',
      lng: -122.4146539, lat: 37.7389132, side: 'both',
      span_meters: null, images: [], links: [], date: null,
      tags: ['daylighting', 'ab413'], sponsor: null,
    },
    {
      id: 'map-daylight-church',
      name: 'Daylighting — Church',
      type: 'daylighting',
      status: 'idea',
      description: 'Add Muni boarding island (or bike corral or planters) to enforce AB413.',
      lng: -122.4146602, lat: 37.7388637, side: 'both',
      span_meters: null, images: [], links: [], date: null,
      tags: ['daylighting', 'ab413'], sponsor: null,
    },
    {
      id: 'map-daylight-andis',
      name: "Daylighting — Andi's",
      type: 'daylighting',
      status: 'idea',
      description: 'Add either bike corral or planters to protect the crosswalk. Existing red paint.',
      lng: -122.414185, lat: 37.7389086, side: 'both',
      span_meters: null, images: [], links: [], date: null,
      tags: ['daylighting', 'ab413'], sponsor: null,
    },
    {
      id: 'map-daylight-nutes',
      name: 'Daylighting — Nutes / Massage',
      type: 'daylighting',
      status: 'idea',
      description: 'Add either bike corral or planters, red paint at minimum to enforce AB413.',
      lng: -122.4139965, lat: 37.7389626, side: 'both',
      span_meters: null, images: [], links: [], date: null,
      tags: ['daylighting', 'ab413'], sponsor: null,
    },
    {
      id: 'map-daylight-piqueos',
      name: "Daylighting — Piqueo's",
      type: 'daylighting',
      status: 'idea',
      description: 'Add either bike corral or planters to protect the crosswalk. Existing red paint.',
      lng: -122.4140804, lat: 37.7389129, side: 'both',
      span_meters: null, images: [], links: [], date: null,
      tags: ['daylighting', 'ab413'], sponsor: null,
    },
    {
      id: 'map-daylight-boarding-island',
      name: 'Daylighting — Muni Boarding Island (67 Bernal Heights)',
      type: 'daylighting',
      status: 'idea',
      description: 'Add Muni boarding island for the 67 Bernal Heights bus in the daylighting zone.',
      lng: -122.413313, lat: 37.7388982, side: 'both',
      span_meters: null, images: [], links: [], date: null,
      tags: ['daylighting', 'ab413', 'muni', 'transit'], sponsor: null,
    },
    {
      id: 'map-daylight-residential-1001',
      name: 'Daylighting — Residential (1001 Cortland)',
      type: 'daylighting',
      status: 'idea',
      description: 'Add either bike corral or planters, red paint at minimum to enforce AB413.',
      lng: -122.4133796, lat: 37.7390154, side: 'both',
      span_meters: null, images: [], links: [], date: null,
      tags: ['daylighting', 'ab413'], sponsor: null,
    },
    {
      id: 'map-daylight-residential-east',
      name: 'Daylighting — Residential (east end)',
      type: 'daylighting',
      status: 'idea',
      description: 'Add Muni boarding island (or bike corral or planters) to enforce AB413.',
      lng: -122.4121452, lat: 37.7395941, side: 'both',
      span_meters: null, images: [], links: [], date: null,
      tags: ['daylighting', 'ab413'], sponsor: null,
    },
    {
      id: 'map-daylight-holly-court',
      name: 'Daylighting — Holly Court Apartments',
      type: 'daylighting',
      status: 'idea',
      description: "Add planters for daylighting in children's travel path.",
      lng: -122.420994, lat: 37.7376221, side: 'both',
      span_meters: null, images: [], links: [], date: null,
      tags: ['daylighting', 'school-route'], sponsor: null,
    },
    {
      id: 'map-daylight-highland',
      name: 'Daylighting — Highland Ave',
      type: 'daylighting',
      status: 'idea',
      description: "Add planters for daylighting in children's path.",
      lng: -122.4211549, lat: 37.7372456, side: 'both',
      span_meters: null, images: [], links: [], date: null,
      tags: ['daylighting', 'school-route'], sponsor: null,
    },

    // ── Crosswalks ────────────────────────────────────────────────────────────
    {
      id: 'map-crosswalk-beacons',
      name: 'Crosswalk Flashing Beacons — East Gateway',
      type: 'crosswalk',
      status: 'idea',
      description: 'Install Rectangular Rapid Flashing Beacon (RRFB) for increased pedestrian safety at the beginning of the commercial corridor.',
      lng: -122.4132982, lat: 37.7390393, side: 'center',
      span_meters: null, images: [], links: [], date: null,
      tags: ['rrfb', 'crosswalk'], sponsor: null,
    },
    {
      id: 'map-crosswalk-tompkins',
      name: 'Crosswalk — Tompkins Pedestrian Path',
      type: 'crosswalk',
      status: 'idea',
      description: 'Add crosswalk by the pedestrian path/stairs connecting to Tompkins Ave.',
      lng: -122.414384, lat: 37.7424814, side: 'center',
      span_meters: null, images: [], links: [], date: null,
      tags: ['crosswalk', 'school-route'], sponsor: null,
    },
    {
      id: 'map-crosswalk-holly-park',
      name: 'Crosswalk — Holly Park Pedestrian Path',
      type: 'crosswalk',
      status: 'idea',
      description: 'Add crosswalk connecting to the pedestrian path in Holly Park. Make accessible curb cut. Pedestrian path currently ends into the street.',
      lng: -122.4209304, lat: 37.737594, side: 'center',
      span_meters: null, images: [], links: [], date: null,
      tags: ['crosswalk', 'school-route', 'accessibility'], sponsor: null,
    },

    // ── Signals ───────────────────────────────────────────────────────────────
    {
      id: 'map-stop-sign-tompkins',
      name: 'Stop Sign — Tompkins Crosswalk',
      type: 'signal',
      status: 'idea',
      description: 'Add a stop sign at the crosswalk near Tompkins Ave.',
      lng: -122.4123248, lat: 37.7436325, side: 'center',
      span_meters: null, images: [], links: [], date: null,
      tags: ['signal', 'school-route'], sponsor: null,
    },

    // ── Bike Share ────────────────────────────────────────────────────────────
    {
      id: 'map-baywheels-gates',
      name: 'Bay Wheels Station — Cortland & Gates',
      type: 'bike-share',
      status: 'idea',
      description: 'Proposed Bay Wheels bike share station near Cortland & Gates St.',
      lng: -122.4134256, lat: 37.7371012, side: 'center',
      span_meters: null, images: [], links: [], date: null,
      tags: ['bay-wheels', 'bike-share'], sponsor: null,
    },
    {
      id: 'map-baywheels-holly-park',
      name: 'Bay Wheels Station — Holly Park / Appleton',
      type: 'bike-share',
      status: 'idea',
      description: 'Proposed Bay Wheels bike share station near Holly Park Circle and Appleton Ave.',
      lng: -122.4210312, lat: 37.7375261, side: 'center',
      span_meters: null, images: [], links: [], date: null,
      tags: ['bay-wheels', 'bike-share'], sponsor: null,
    },
    {
      id: 'map-baywheels-bonview',
      name: 'Bay Wheels Station — Bonview / Precita',
      type: 'bike-share',
      status: 'idea',
      description: 'Proposed Bay Wheels bike share station near Bonview and Precita Ave.',
      lng: -122.4087835, lat: 37.7397441, side: 'center',
      span_meters: null, images: [], links: [], date: null,
      tags: ['bay-wheels', 'bike-share'], sponsor: null,
    },
    {
      id: 'map-baywheels-cortland-anderson',
      name: 'Bay Wheels Station — Cortland & Anderson',
      type: 'bike-share',
      status: 'idea',
      description: 'Proposed Bay Wheels bike share station near Cortland & Anderson St.',
      lng: -122.4142113, lat: 37.7388975, side: 'center',
      span_meters: null, images: [], links: [], date: null,
      tags: ['bay-wheels', 'bike-share'], sponsor: null,
    },
    {
      id: 'map-baywheels-precita-park',
      name: 'Bay Wheels Station — Precita Park',
      type: 'bike-share',
      status: 'idea',
      description: 'Proposed Bay Wheels bike share station near Precita Park.',
      lng: -122.4190274, lat: 37.7468498, side: 'center',
      span_meters: null, images: [], links: [], date: null,
      tags: ['bay-wheels', 'bike-share'], sponsor: null,
    },
    {
      id: 'map-baywheels-cesar-chavez',
      name: 'Bay Wheels Station — Cesar Chavez / Folsom',
      type: 'bike-share',
      status: 'idea',
      description: 'Proposed Bay Wheels bike share station near Cesar Chavez & Folsom.',
      lng: -122.4075463, lat: 37.7450261, side: 'center',
      span_meters: null, images: [], links: [], date: null,
      tags: ['bay-wheels', 'bike-share'], sponsor: null,
    },
    {
      id: 'map-baywheels-holly-park-2',
      name: 'Bay Wheels Station — Holly Park Circle (south)',
      type: 'bike-share',
      status: 'idea',
      description: 'Proposed Bay Wheels bike share station on the south side of Holly Park Circle.',
      lng: -122.4157859, lat: 37.7421565, side: 'center',
      span_meters: null, images: [], links: [], date: null,
      tags: ['bay-wheels', 'bike-share'], sponsor: null,
    },

    // ── Flex Posts / Modal Filters ────────────────────────────────────────────
    {
      id: 'map-modal-filter-precita-west',
      name: 'Modal Filter — Precita Triangle (west entry)',
      type: 'flex-post',
      status: 'idea',
      description: 'Use bollards and planters to prohibit cars from entering the southern segment of Precita triangle from the west. Bikes and pedestrians pass through.',
      lng: -122.4105785, lat: 37.7471458, side: 'center',
      span_meters: null, images: [], links: [], date: null,
      tags: ['modal-filter', 'precita'], sponsor: null,
    },
    {
      id: 'map-modal-filter-appleton',
      name: 'Modal Filter — Appleton Ave',
      type: 'flex-post',
      status: 'idea',
      description: 'Use bollards and planters to block through traffic for vehicles; allow bikes and pedestrians.',
      lng: -122.4227777, lat: 37.7383741, side: 'center',
      span_meters: null, images: [], links: [], date: null,
      tags: ['modal-filter', 'school-route', 'appleton'], sponsor: null,
    },
    {
      id: 'map-modal-filter-ellsworth',
      name: 'Modal Filter — Ellsworth / Cortland area',
      type: 'flex-post',
      status: 'idea',
      description: 'Modal filter to reduce cut-through traffic.',
      lng: -122.4189101, lat: 37.7410161, side: 'center',
      span_meters: null, images: [], links: [], date: null,
      tags: ['modal-filter'], sponsor: null,
    },

    // ── Traffic Calming — School Routes ───────────────────────────────────────
    {
      id: 'map-slow-appleton',
      name: 'Slow Street — Appleton Ave',
      type: 'other',
      status: 'idea',
      description: 'Traffic calm Appleton Ave for the safety of students at JSerra High School Annex.',
      lng: -122.4224, lat: 37.7382, side: 'center',
      span_meters: 350, images: [], links: [], date: null,
      tags: ['slow-street', 'school-route', 'jserra'], sponsor: null,
    },
    {
      id: 'map-slow-tompkins',
      name: 'Slow Street — Tompkins Ave',
      type: 'other',
      status: 'idea',
      description: 'Traffic calm Tompkins Ave for the safety of students at Revere Elementary School.',
      lng: -122.4141, lat: 37.73713, side: 'center',
      span_meters: 550, images: [], links: [], date: null,
      tags: ['slow-street', 'school-route', 'revere'], sponsor: null,
    },
    {
      id: 'map-slow-harrison',
      name: 'Slow Street — Harrison St (near Flynn)',
      type: 'other',
      status: 'idea',
      description: 'Traffic calm Harrison St for the safety of students at James Lick / Flynn Elementary.',
      lng: -122.4115, lat: 37.7477, side: 'center',
      span_meters: 100, images: [], links: [], date: null,
      tags: ['slow-street', 'school-route', 'flynn'], sponsor: null,
    },
    {
      id: 'map-slow-holly-park',
      name: 'Slow Street — Holly Park Circle',
      type: 'other',
      status: 'idea',
      description: 'Traffic calm Holly Park Circle for the safety of students at JSerra Elementary School.',
      lng: -122.4199, lat: 37.7372, side: 'center',
      span_meters: null, images: [], links: [], date: null,
      tags: ['slow-street', 'school-route', 'jserra'], sponsor: null,
    },

    // ── Precita Triangle ──────────────────────────────────────────────────────
    {
      id: 'map-precita-pedestrianize',
      name: 'Pedestrianize Precita Triangle (south segment)',
      type: 'other',
      status: 'idea',
      description: 'Pedestrianize the south section of Precita triangle, allowing residents access to their garages but prohibiting through traffic.',
      lng: -122.4103, lat: 37.7472, side: 'center',
      span_meters: null, images: [], links: [], date: null,
      tags: ['precita', 'pedestrianization'], sponsor: null,
    },
    {
      id: 'map-precita-resident-sign',
      name: 'Resident-Only Entry Sign — Precita Triangle (east)',
      type: 'other',
      status: 'idea',
      description: 'Add modal filters and signs allowing only resident access to the south segment of Precita triangle from the east.',
      lng: -122.4100557, lat: 37.7473734, side: 'center',
      span_meters: null, images: [], links: [], date: null,
      tags: ['precita', 'modal-filter'], sponsor: null,
    },

    // ── Cycling Infrastructure ────────────────────────────────────────────────
    {
      id: 'map-precita-bike-twoway',
      name: 'Two-Way Bike Route — Precita Ave',
      type: 'other',
      status: 'idea',
      description: 'Add sharrow paint and signage to legally allow bikes to travel both directions on this segment of Precita Ave.',
      lng: -122.418284, lat: 37.7467202, side: 'center',
      span_meters: null, images: [], links: [], date: null,
      tags: ['bike-route', 'sharrow', 'precita'], sponsor: null,
    },
    {
      id: 'map-bernal-wiggle',
      name: 'Bernal Wiggle Bike Route',
      type: 'other',
      status: 'idea',
      description: 'Promote the Bernal Wiggle route over the hill with sharrow paint and wayfinding signage.',
      lng: -122.4105551, lat: 37.7481988, side: 'center',
      span_meters: null, images: [], links: [], date: null,
      tags: ['bike-route', 'sharrow', 'bernal-wiggle'], sponsor: null,
    },
    {
      id: 'map-elsie-bike-route',
      name: 'Elsie Ave Bike Route',
      type: 'other',
      status: 'idea',
      description: 'Add sharrows and traffic calming on Elsie Ave to create a safe cycling connection.',
      lng: -122.4204993, lat: 37.738066, side: 'center',
      span_meters: null, images: [], links: [], date: null,
      tags: ['bike-route', 'sharrow', 'elsie'], sponsor: null,
    },
  ];

  console.log(`Upserting ${rows.length} map idea projects…`);

  const { error } = await supabase
    .from('projects')
    .upsert(rows, { onConflict: 'id' });

  if (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }

  console.log(`✓ ${rows.length} projects seeded successfully.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
