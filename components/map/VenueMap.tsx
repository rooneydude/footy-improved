'use client';

// Interactive Venue Map Component
// Uses react-map-gl (Uber's React wrapper for Mapbox GL JS)
// Features: dark theme, venue markers, clustering, popups, fly-to

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import Map, { Marker, Popup, NavigationControl, Source, Layer } from 'react-map-gl/mapbox';
import type { MapRef, ViewStateChangeEvent } from 'react-map-gl/mapbox';
import { MapPin, Music, Trophy, Dribbble, Circle, X } from 'lucide-react';
import Link from 'next/link';
import 'mapbox-gl/dist/mapbox-gl.css';

// Event type colors matching the app theme
const EVENT_TYPE_COLORS: Record<string, string> = {
  SOCCER: '#22c55e',     // green
  BASKETBALL: '#f97316', // orange
  BASEBALL: '#ef4444',   // red
  TENNIS: '#eab308',     // yellow
  CONCERT: '#a855f7',    // purple
};

export interface VenueMapData {
  id: string;
  name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  eventCount: number;
  eventTypes: Record<string, number>; // e.g. { SOCCER: 3, CONCERT: 1 }
}

interface VenueMapProps {
  venues: VenueMapData[];
  selectedVenueId?: string | null;
  onVenueSelect?: (venueId: string | null) => void;
}

// Get the dominant event type for a venue (used for marker color)
function getDominantEventType(eventTypes: Record<string, number>): string {
  let max = 0;
  let dominant = 'SOCCER';
  for (const [type, count] of Object.entries(eventTypes)) {
    if (count > max) {
      max = count;
      dominant = type;
    }
  }
  return dominant;
}

// Get icon for event type
function EventTypeIcon({ type, size = 14 }: { type: string; size?: number }) {
  switch (type) {
    case 'SOCCER':
      return <Circle size={size} />;
    case 'BASKETBALL':
      return <Dribbble size={size} />;
    case 'CONCERT':
      return <Music size={size} />;
    default:
      return <Trophy size={size} />;
  }
}

// Convert venues to GeoJSON for clustering
function venuesToGeoJSON(venues: VenueMapData[]) {
  return {
    type: 'FeatureCollection' as const,
    features: venues.map((venue) => ({
      type: 'Feature' as const,
      properties: {
        id: venue.id,
        name: venue.name,
        city: venue.city,
        country: venue.country,
        eventCount: venue.eventCount,
        eventTypes: JSON.stringify(venue.eventTypes),
        dominantType: getDominantEventType(venue.eventTypes),
        cluster: false,
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [venue.longitude, venue.latitude],
      },
    })),
  };
}

// Calculate bounds to fit all venues
function calculateBounds(venues: VenueMapData[]): {
  longitude: number;
  latitude: number;
  zoom: number;
} {
  if (venues.length === 0) {
    return { longitude: 0, latitude: 20, zoom: 1.5 };
  }

  if (venues.length === 1) {
    return {
      longitude: venues[0].longitude,
      latitude: venues[0].latitude,
      zoom: 12,
    };
  }

  const lngs = venues.map((v) => v.longitude);
  const lats = venues.map((v) => v.latitude);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);

  const centerLng = (minLng + maxLng) / 2;
  const centerLat = (minLat + maxLat) / 2;

  // Estimate zoom level based on bounding box size
  const lngRange = maxLng - minLng;
  const latRange = maxLat - minLat;
  const range = Math.max(lngRange, latRange);

  let zoom = 1.5;
  if (range < 0.5) zoom = 12;
  else if (range < 1) zoom = 10;
  else if (range < 5) zoom = 7;
  else if (range < 10) zoom = 5;
  else if (range < 30) zoom = 4;
  else if (range < 60) zoom = 3;
  else if (range < 120) zoom = 2;

  return { longitude: centerLng, latitude: centerLat, zoom };
}

export function VenueMap({ venues, selectedVenueId, onVenueSelect }: VenueMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [popupVenue, setPopupVenue] = useState<VenueMapData | null>(null);

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  // Calculate initial viewport to fit all venues
  const initialViewState = useMemo(() => calculateBounds(venues), [venues]);

  const [viewState, setViewState] = useState({
    ...initialViewState,
    pitch: 0,
    bearing: 0,
  });

  // GeoJSON data for clustering
  const geojsonData = useMemo(() => venuesToGeoJSON(venues), [venues]);

  // Fly to selected venue when selectedVenueId changes
  useEffect(() => {
    if (!selectedVenueId || !mapRef.current) return;

    const venue = venues.find((v) => v.id === selectedVenueId);
    if (!venue) return;

    mapRef.current.flyTo({
      center: [venue.longitude, venue.latitude],
      zoom: 14,
      duration: 1500,
    });

    setPopupVenue(venue);
  }, [selectedVenueId, venues]);

  const handleMarkerClick = useCallback(
    (venue: VenueMapData) => {
      setPopupVenue(venue);
      onVenueSelect?.(venue.id);

      mapRef.current?.flyTo({
        center: [venue.longitude, venue.latitude],
        zoom: Math.max(viewState.zoom, 12),
        duration: 800,
      });
    },
    [onVenueSelect, viewState.zoom]
  );

  const handleClosePopup = useCallback(() => {
    setPopupVenue(null);
    onVenueSelect?.(null);
  }, [onVenueSelect]);

  // Handle cluster click - zoom into cluster
  const handleMapClick = useCallback(
    (event: { features?: Array<GeoJSON.Feature>; lngLat: { lng: number; lat: number } }) => {
      const features = event.features;
      if (!features || features.length === 0) return;

      const feature = features[0];
      if (feature.properties?.cluster) {
        // Zoom into the cluster
        const coords = (feature.geometry as GeoJSON.Point).coordinates;
        mapRef.current?.flyTo({
          center: [coords[0], coords[1]],
          zoom: (viewState.zoom || 2) + 2,
          duration: 500,
        });
      }
    },
    [viewState.zoom]
  );

  if (!mapboxToken) {
    return (
      <div className="aspect-video rounded-xl bg-card border border-border flex items-center justify-center">
        <div className="text-center p-6">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold mb-2">Map Not Configured</h3>
          <p className="text-sm text-muted-foreground mb-3">
            To enable the interactive map, add your Mapbox token:
          </p>
          <code className="text-xs bg-secondary/50 px-3 py-1.5 rounded-lg block">
            NEXT_PUBLIC_MAPBOX_TOKEN=&quot;your-token-here&quot;
          </code>
          <p className="text-xs text-muted-foreground mt-2">
            Get a free token at{' '}
            <a
              href="https://account.mapbox.com/auth/signup/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              mapbox.com
            </a>
          </p>
        </div>
      </div>
    );
  }

  if (venues.length === 0) {
    return (
      <div className="aspect-video rounded-xl bg-card border border-border flex items-center justify-center">
        <div className="text-center p-6">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold mb-1">No Venues on Map</h3>
          <p className="text-sm text-muted-foreground">
            Add events to see your venues appear on the map.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden border border-border" style={{ height: '60vh', minHeight: '400px' }}>
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt: ViewStateChangeEvent) => setViewState(evt.viewState)}
        mapboxAccessToken={mapboxToken}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        interactiveLayerIds={['cluster-circles']}
        onClick={handleMapClick}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
      >
        <NavigationControl position="top-right" showCompass={false} />

        {/* Cluster source */}
        <Source
          id="venues"
          type="geojson"
          data={geojsonData}
          cluster={true}
          clusterMaxZoom={12}
          clusterRadius={50}
        >
          {/* Cluster circles */}
          <Layer
            id="cluster-circles"
            type="circle"
            filter={['has', 'point_count']}
            paint={{
              'circle-color': [
                'step',
                ['get', 'point_count'],
                '#3b82f6', // blue for small clusters
                5,
                '#a855f7', // purple for medium
                10,
                '#22c55e', // green for large
              ],
              'circle-radius': [
                'step',
                ['get', 'point_count'],
                18,
                5,
                24,
                10,
                30,
              ],
              'circle-stroke-width': 2,
              'circle-stroke-color': 'rgba(255,255,255,0.3)',
            }}
          />

          {/* Cluster count labels */}
          <Layer
            id="cluster-count"
            type="symbol"
            filter={['has', 'point_count']}
            layout={{
              'text-field': '{point_count_abbreviated}',
              'text-font': ['DIN Pro Medium', 'Arial Unicode MS Bold'],
              'text-size': 13,
            }}
            paint={{
              'text-color': '#ffffff',
            }}
          />
        </Source>

        {/* Individual venue markers (non-clustered) */}
        {venues.map((venue) => (
          <Marker
            key={venue.id}
            longitude={venue.longitude}
            latitude={venue.latitude}
            anchor="bottom"
            onClick={(e: { originalEvent: MouseEvent }) => {
              e.originalEvent.stopPropagation();
              handleMarkerClick(venue);
            }}
          >
            <div
              className="cursor-pointer transition-transform hover:scale-110"
              title={venue.name}
            >
              <div
                className="relative flex items-center justify-center rounded-full shadow-lg border-2 border-white/20"
                style={{
                  width: 32,
                  height: 32,
                  backgroundColor: EVENT_TYPE_COLORS[getDominantEventType(venue.eventTypes)] || '#3b82f6',
                }}
              >
                <MapPin className="h-4 w-4 text-white" strokeWidth={2.5} />
                {venue.eventCount > 1 && (
                  <span
                    className="absolute -top-1.5 -right-1.5 bg-white text-black text-[10px] font-bold rounded-full flex items-center justify-center"
                    style={{ width: 18, height: 18 }}
                  >
                    {venue.eventCount}
                  </span>
                )}
              </div>
            </div>
          </Marker>
        ))}

        {/* Popup for selected venue */}
        {popupVenue && (
          <Popup
            longitude={popupVenue.longitude}
            latitude={popupVenue.latitude}
            anchor="bottom"
            offset={40}
            closeButton={false}
            closeOnClick={false}
            onClose={handleClosePopup}
            className="venue-popup"
          >
            <div className="p-1 min-w-[200px]">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="font-bold text-sm text-gray-900 leading-tight">
                    {popupVenue.name}
                  </h3>
                  <p className="text-xs text-gray-600">
                    {popupVenue.city}, {popupVenue.country}
                  </p>
                </div>
                <button
                  onClick={handleClosePopup}
                  className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Event type breakdown */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {Object.entries(popupVenue.eventTypes).map(([type, count]) => (
                  <span
                    key={type}
                    className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-full text-white font-medium"
                    style={{ backgroundColor: EVENT_TYPE_COLORS[type] || '#6b7280' }}
                  >
                    <EventTypeIcon type={type} size={10} />
                    {count}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-700">
                  {popupVenue.eventCount} event{popupVenue.eventCount !== 1 ? 's' : ''}
                </span>
                <Link
                  href={`/events?venue=${encodeURIComponent(popupVenue.name)}`}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  View Events &rarr;
                </Link>
              </div>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
