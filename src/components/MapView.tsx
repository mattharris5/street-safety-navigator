'use client';

import { useEffect, useRef, useCallback } from 'react';
import Map, { type MapRef } from 'react-map-gl/mapbox';
import {
  CORTLAND_BEARING,
  CORTLAND_CENTER,
  MIN_ZOOM,
  MAX_ZOOM,
  MAPBOX_STYLE_MAP,
  MAPBOX_STYLE_SATELLITE,
} from '@/lib/constants';
import type { Feature, LineString } from 'geojson';
import type { Intersection, ViewMode } from '@/lib/types';
import 'mapbox-gl/dist/mapbox-gl.css';

const INTERSECTION_ZOOM = 19.5;

interface MapViewProps {
  intersection: Intersection | null;
  viewMode: ViewMode;
  cortlandLine: Feature<LineString> | null;
  children?: React.ReactNode;
}

export default function MapView({
  intersection,
  viewMode,
  cortlandLine: _cortlandLine,
  children,
}: MapViewProps) {
  const mapRef = useRef<MapRef>(null);
  const prevIntersectionRef = useRef<Intersection | null>(null);
  const userZoomRef = useRef(INTERSECTION_ZOOM);

  const updateCamera = useCallback((int: Intersection) => {
    if (!mapRef.current) return;
    mapRef.current.easeTo({
      center: [int.lng, int.lat],
      bearing: CORTLAND_BEARING,
      pitch: 0,
      zoom: userZoomRef.current,
      duration: 500,
      easing: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    });
  }, []);

  useEffect(() => {
    if (!intersection) return;
    const prev = prevIntersectionRef.current;
    if (!prev || prev.name !== intersection.name) {
      updateCamera(intersection);
      prevIntersectionRef.current = intersection;
    }
  }, [intersection, updateCamera]);

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

  const initialCenter = intersection ?? CORTLAND_CENTER;

  return (
    <Map
      ref={mapRef}
      mapboxAccessToken={mapboxToken}
      initialViewState={{
        longitude: initialCenter.lng,
        latitude: initialCenter.lat,
        zoom: INTERSECTION_ZOOM,
        bearing: CORTLAND_BEARING,
        pitch: 0,
      }}
      mapStyle={viewMode === 'satellite' ? MAPBOX_STYLE_SATELLITE : MAPBOX_STYLE_MAP}
      style={{ width: '100%', height: '100%' }}
      scrollZoom={false}
      dragPan={false}
      dragRotate={false}
      keyboard={false}
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
