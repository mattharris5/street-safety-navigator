'use client';

import { motion, AnimatePresence } from 'framer-motion';
import SVGFilters from './SVGFilters';
import SketchyRoad from './SketchyRoad';
import SketchyCrosswalk from './SketchyCrosswalk';
import SketchyParking from './SketchyParking';
import SketchyMarkings from './SketchyMarkings';
import SketchySigns from './SketchySigns';
import InterventionOverlay from './InterventionOverlay';
import { getIntersectionDetail } from '@/data/intersection-details';
import type { Project, Intersection } from '@/lib/types';

interface IntersectionViewProps {
  intersection: Intersection;
  intersectionIndex: number;
  projects: Project[];
  selectedProjectId?: string | null;
  onSelectProject: (project: Project) => void;
}

export default function IntersectionView({
  intersection,
  intersectionIndex,
  projects,
  selectedProjectId,
  onSelectProject,
}: IntersectionViewProps) {
  const detail = getIntersectionDetail(intersection, intersectionIndex);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Shared SVG filter defs — render once outside animated children */}
      <svg className="absolute" style={{ width: 0, height: 0 }}>
        <SVGFilters />
      </svg>

      <AnimatePresence mode="wait">
        <motion.div
          key={intersection.name}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          {/* Road surfaces — bottom layer */}
          <SketchyRoad />

          {/* Parking spaces */}
          <SketchyParking
            parkingNorth={detail.parkingNorth}
            parkingSouth={detail.parkingSouth}
          />

          {/* Crosswalks */}
          <SketchyCrosswalk crosswalks={detail.crosswalks} />

          {/* Road markings (stop bars) */}
          <SketchyMarkings markings={detail.roadMarkings} />

          {/* Signs */}
          <SketchySigns
            stopSigns={detail.stopSigns}
            signals={detail.signals}
          />

          {/* Interventions — top layer, pointer-events enabled */}
          <div className="absolute inset-0" style={{ pointerEvents: 'all' }}>
            <InterventionOverlay
              projects={projects}
              intersection={intersection}
              selectedId={selectedProjectId}
              onSelect={onSelectProject}
            />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
