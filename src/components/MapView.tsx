'use client';

import { useEffect, useRef, useCallback } from 'react';
import Map, { type MapRef } from 'react-map-gl/mapbox';
import {
  CORTLAND_BEARING,
  CORTLAND_CENTER,
  DEFAULT_ZOOM,
  MIN_ZOOM,
  MAX_ZOOM,
  MAPBOX_STYLE_MAP,
  MAPBOX_STYLE_SATELLITE,
} from '@/lib/constants';
import { interpolateAlongLine } from '@/lib/geo';
import type { Feature, LineString } from 'geojson';
import type { ViewMode } from '@/lib/types';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapViewProps {
  progress: number;
  viewMode: ViewMode;
  cortlandLine: Feature<LineString> | null;
  children?: React.ReactNode;
}

export default function MapView({
  progress,
  viewMode,
  cortlandLine,
  children,
}: MapViewProps) {
  const mapRef = useRef<MapRef>(null);
  const prevProgressRef = useRef(progress);
  // Track user-adjusted zoom separately so pinch-to-zoom is preserved
  const userZoomRef = useRef(DEFAULT_ZOOM);

  const updateCamera = useCallback(
    (prog: number) => {
      if (!mapRef.current || !cortlandLine) return;
      const [lng, lat] = interpolateAlongLine(cortlandLine, prog);
      mapRef.current.easeTo({
        center: [lng, lat],
        bearing: CORTLAND_BEARING,
        pitch: 0,
        zoom: userZoomRef.current,
        duration: 120,
        easing: (t) => t,
      });
    },
    [cortlandLine]
  );

  useEffect(() => {
    if (Math.abs(progress - prevProgressRef.current) > 0.001) {
      updateCamera(progress);
      prevProgressRef.current = progress;
    }
  }, [progress, updateCamera]);

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  if (!mapboxToken) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-100">
        <div className="text-center p-8 max-w-sm">
          <div className="text-4xl mb-3">🗺️</div>
          <h3 className="text-slate-700 font-semibold mb-2">Mapbox token required</h3>
          <p className="text-slate-500 text-sm">
            Add <code className="bg-slate-200 px-1 rounded">NEXT_PUBLIC_MAPBOX_TOKEN</code> to{' '}
            <code className="bg-slate-200 px-1 rounded">.env.local</code> to enable the map.
          </p>
          <p className="text-slate-400 text-xs mt-2">
            Free tokens available at mapbox.com
          </p>
        </div>
      </div>
    );
  }

  return (
    <Map
      ref={mapRef}
      mapboxAccessToken={mapboxToken}
      initialViewState={{
        longitude: CORTLAND_CENTER.lng,
        latitude: CORTLAND_CENTER.lat,
        zoom: DEFAULT_ZOOM,
        bearing: CORTLAND_BEARING,
        pitch: 0,
      }}
      mapStyle={viewMode === 'satellite' ? MAPBOX_STYLE_SATELLITE : MAPBOX_STYLE_MAP}
      style={{ width: '100%', height: '100%' }}
      scrollZoom={false}
      dragPan={false}
      dragRotate={false}
      keyboard={false}
      // Allow pinch-to-zoom on mobile; capture zoom changes to preserve level
      touchZoomRotate={{ around: 'center' }}
      doubleClickZoom={false}
      minZoom={MIN_ZOOM}
      maxZoom={MAX_ZOOM}
      onZoom={(e) => { userZoomRef.current = e.viewState.zoom; }}
    >
      {children}
    </Map>
  );
}
