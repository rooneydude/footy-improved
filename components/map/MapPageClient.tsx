'use client';

// Map Page Client Component
// Syncs venue list selection with the interactive map

import { useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { VenueMap, type VenueMapData } from './VenueMap';

interface MapPageClientProps {
  venues: VenueMapData[];
  unmappedCount: number;
}

// Event type color/emoji mapping
const EVENT_TYPE_DISPLAY: Record<string, { emoji: string; label: string }> = {
  SOCCER: { emoji: '⚽', label: 'Soccer' },
  BASKETBALL: { emoji: '🏀', label: 'Basketball' },
  BASEBALL: { emoji: '⚾', label: 'Baseball' },
  TENNIS: { emoji: '🎾', label: 'Tennis' },
  CONCERT: { emoji: '🎤', label: 'Concert' },
};

export function MapPageClient({ venues, unmappedCount }: MapPageClientProps) {
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Interactive Map */}
      <VenueMap
        venues={venues}
        selectedVenueId={selectedVenueId}
        onVenueSelect={setSelectedVenueId}
      />

      {/* Legend */}
      {venues.length > 0 && (
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          {Object.entries(EVENT_TYPE_DISPLAY).map(([type, { emoji, label }]) => (
            <span key={type} className="flex items-center gap-1">
              {emoji} {label}
            </span>
          ))}
        </div>
      )}

      {/* Unmapped venues notice */}
      {unmappedCount > 0 && (
        <div className="text-sm text-muted-foreground bg-secondary/30 rounded-lg px-4 py-3">
          <Navigation className="h-4 w-4 inline mr-1.5" />
          {unmappedCount} venue{unmappedCount !== 1 ? 's' : ''} couldn&apos;t be mapped (missing coordinates).
          New events will be automatically geocoded.
        </div>
      )}

      {/* Venue List */}
      {venues.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">All Venues</h2>
          <div className="space-y-2">
            {venues.map((venue) => (
              <Card
                key={venue.id}
                className={`cursor-pointer transition-all duration-200 ${
                  selectedVenueId === venue.id
                    ? 'ring-2 ring-primary bg-primary/5'
                    : 'hover:bg-card/80'
                }`}
                onClick={() => setSelectedVenueId(venue.id === selectedVenueId ? null : venue.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{venue.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {venue.city}, {venue.country}
                      </p>
                      {/* Event type breakdown */}
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {Object.entries(venue.eventTypes).map(([type, count]) => {
                          const display = EVENT_TYPE_DISPLAY[type];
                          return (
                            <span
                              key={type}
                              className="text-xs bg-secondary/50 px-1.5 py-0.5 rounded"
                            >
                              {display?.emoji || '📍'} {count}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-mono font-bold text-lg">{venue.eventCount}</p>
                      <p className="text-xs text-muted-foreground">event{venue.eventCount !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
