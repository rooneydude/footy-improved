// Dexie.js Offline Cache
// 📚 Library Research Agent: dexie/Dexie.js (13,891 ⭐, Apache-2.0)
// Pattern from: https://dexie.org/docs/Tutorial/Getting-started
// ✅ Code Quality Agent: Type-safe IndexedDB wrapper with sync queue

import Dexie, { type Table } from 'dexie';
import type { EventType } from '@/types';

// Cached event structure (mirrors database but for offline use)
export interface CachedEvent {
  id: string;
  type: EventType;
  date: string;
  venueId: string;
  venueName: string;
  venueCity: string;
  venueCountry: string;
  userId: string;
  notes?: string;
  rating?: number;
  companions: string[];
  // Sport-specific data stored as JSON
  sportData?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  // Sync metadata
  syncStatus: 'synced' | 'pending' | 'error';
  lastSyncedAt?: string;
}

// Cached venue for quick lookup
export interface CachedVenue {
  id: string;
  name: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
  type: string;
}

// Sync queue item for offline changes
export interface SyncQueueItem {
  id?: number; // Auto-increment
  operation: 'create' | 'update' | 'delete';
  entityType: 'event' | 'venue';
  entityId: string;
  data: Record<string, unknown>;
  createdAt: string;
  attempts: number;
  lastError?: string;
}

// Dexie database class
class FootyTrackerDB extends Dexie {
  events!: Table<CachedEvent, string>;
  venues!: Table<CachedVenue, string>;
  syncQueue!: Table<SyncQueueItem, number>;

  constructor() {
    super('FootyTrackerDB');
    
    // Schema versioning for migrations
    this.version(1).stores({
      events: 'id, type, date, venueId, userId, syncStatus, [userId+type], [userId+date]',
      venues: 'id, name, city, country, [name+city+country]',
      syncQueue: '++id, entityType, entityId, operation, createdAt',
    });
  }
}

// Singleton database instance
export const db = new FootyTrackerDB();

// Helper functions for cache operations
export async function cacheEvent(event: CachedEvent): Promise<void> {
  await db.events.put(event);
}

export async function getCachedEvent(id: string): Promise<CachedEvent | undefined> {
  return db.events.get(id);
}

export async function getCachedEvents(userId: string, limit = 50): Promise<CachedEvent[]> {
  return db.events
    .where('userId')
    .equals(userId)
    .reverse()
    .sortBy('date')
    .then((events) => events.slice(0, limit));
}

export async function getCachedEventsByType(
  userId: string,
  type: EventType
): Promise<CachedEvent[]> {
  return db.events.where({ userId, type }).toArray();
}

export async function deleteCachedEvent(id: string): Promise<void> {
  await db.events.delete(id);
}

export async function clearCache(): Promise<void> {
  await db.events.clear();
  await db.venues.clear();
}

// Venue cache helpers
export async function cacheVenue(venue: CachedVenue): Promise<void> {
  await db.venues.put(venue);
}

export async function getCachedVenue(id: string): Promise<CachedVenue | undefined> {
  return db.venues.get(id);
}

export async function searchCachedVenues(query: string): Promise<CachedVenue[]> {
  const lowerQuery = query.toLowerCase();
  return db.venues
    .filter(
      (venue) =>
        venue.name.toLowerCase().includes(lowerQuery) ||
        venue.city.toLowerCase().includes(lowerQuery)
    )
    .toArray();
}

// Sync queue helpers
export async function addToSyncQueue(item: Omit<SyncQueueItem, 'id'>): Promise<void> {
  await db.syncQueue.add(item as SyncQueueItem);
}

export async function getSyncQueueItems(): Promise<SyncQueueItem[]> {
  return db.syncQueue.orderBy('createdAt').toArray();
}

export async function removeSyncQueueItem(id: number): Promise<void> {
  await db.syncQueue.delete(id);
}

export async function clearSyncQueue(): Promise<void> {
  await db.syncQueue.clear();
}

export async function updateSyncQueueItem(
  id: number,
  updates: Partial<SyncQueueItem>
): Promise<void> {
  await db.syncQueue.update(id, updates);
}

// Sync status helpers
export async function getPendingSyncCount(): Promise<number> {
  return db.events.where('syncStatus').equals('pending').count();
}

export async function getSyncQueueCount(): Promise<number> {
  return db.syncQueue.count();
}

// Background sync function
export async function syncWithServer(
  syncFn: (item: SyncQueueItem) => Promise<boolean>
): Promise<{ success: number; failed: number }> {
  const items = await getSyncQueueItems();
  let success = 0;
  let failed = 0;

  for (const item of items) {
    try {
      const result = await syncFn(item);
      if (result && item.id) {
        await removeSyncQueueItem(item.id);
        success++;
      } else {
        if (item.id) {
          await updateSyncQueueItem(item.id, {
            attempts: item.attempts + 1,
            lastError: 'Sync function returned false',
          });
        }
        failed++;
      }
    } catch (error) {
      if (item.id) {
        await updateSyncQueueItem(item.id, {
          attempts: item.attempts + 1,
          lastError: error instanceof Error ? error.message : 'Unknown error',
        });
      }
      failed++;
    }
  }

  return { success, failed };
}

export default db;
