// Setlist.fm API Client
// 📚 Library Research Agent: Using Setlist.fm REST API
// API Docs: https://api.setlist.fm/docs/1.0/index.html
// ✅ Code Quality Agent: Proper error handling, type safety

const API_BASE = 'https://api.setlist.fm/rest/1.0';

// Types for API responses
export interface SetlistSearchResult {
  type: string;
  itemsPerPage: number;
  page: number;
  total: number;
  setlist: Setlist[];
}

export interface Setlist {
  id: string;
  versionId: string;
  eventDate: string;
  lastUpdated: string;
  artist: SetlistArtist;
  venue: SetlistVenue;
  tour?: { name: string };
  sets: {
    set: SetlistSet[];
  };
  url: string;
}

export interface SetlistArtist {
  mbid: string;
  name: string;
  sortName: string;
  disambiguation?: string;
  url: string;
}

export interface SetlistVenue {
  id: string;
  name: string;
  city: {
    id: string;
    name: string;
    state?: string;
    stateCode?: string;
    coords?: { lat: number; long: number };
    country: { code: string; name: string };
  };
  url: string;
}

export interface SetlistSet {
  name?: string;
  encore?: number;
  song: SetlistSong[];
}

export interface SetlistSong {
  name: string;
  info?: string;
  cover?: { mbid: string; name: string };
  tape?: boolean;
}

// Helper to fetch from API with error handling
async function fetchFromApi<T>(endpoint: string): Promise<T> {
  const apiKey = process.env.SETLIST_FM_API_KEY;
  
  if (!apiKey) {
    throw new Error('SETLIST_FM_API_KEY not configured');
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'x-api-key': apiKey,
      'Accept': 'application/json',
    },
    next: { revalidate: 300 }, // Cache for 5 minutes
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    if (response.status === 403) {
      throw new Error('API key invalid or quota exceeded.');
    }
    if (response.status === 404) {
      throw new Error('Not found');
    }
    throw new Error(`Setlist.fm API error: ${response.status}`);
  }

  return response.json();
}

// Search for setlists by artist name
export async function searchSetlists(
  artistName: string,
  cityName?: string,
  year?: number,
  page: number = 1
): Promise<SetlistSearchResult> {
  const params = new URLSearchParams();
  params.append('artistName', artistName);
  if (cityName) params.append('cityName', cityName);
  if (year) params.append('year', year.toString());
  params.append('p', page.toString());
  
  return fetchFromApi<SetlistSearchResult>(`/search/setlists?${params}`);
}

// Search for artists
export interface ArtistSearchResult {
  type: string;
  itemsPerPage: number;
  page: number;
  total: number;
  artist: SetlistArtist[];
}

export async function searchArtists(
  artistName: string,
  page: number = 1
): Promise<ArtistSearchResult> {
  const params = new URLSearchParams();
  params.append('artistName', artistName);
  params.append('p', page.toString());
  params.append('sort', 'relevance');
  
  return fetchFromApi<ArtistSearchResult>(`/search/artists?${params}`);
}

// Get setlist by ID
export async function getSetlist(setlistId: string): Promise<Setlist> {
  return fetchFromApi<Setlist>(`/setlist/${setlistId}`);
}

// Get artist by MBID
export async function getArtist(mbid: string): Promise<SetlistArtist> {
  return fetchFromApi<SetlistArtist>(`/artist/${mbid}`);
}

// Get artist's setlists
export async function getArtistSetlists(
  mbid: string,
  page: number = 1
): Promise<SetlistSearchResult> {
  return fetchFromApi<SetlistSearchResult>(`/artist/${mbid}/setlists?p=${page}`);
}

// Get venue by ID
export async function getVenue(venueId: string): Promise<SetlistVenue> {
  return fetchFromApi<SetlistVenue>(`/venue/${venueId}`);
}

// Process setlist into our format
export interface ProcessedSetlist {
  id: string;
  artistName: string;
  artistMbid: string;
  venueName: string;
  venueCity: string;
  venueCountry: string;
  latitude?: number;
  longitude?: number;
  eventDate: string;
  tourName?: string;
  songs: ProcessedSong[];
  encoreSongs: ProcessedSong[];
  totalSongs: number;
}

export interface ProcessedSong {
  name: string;
  order: number;
  isEncore: boolean;
  isCover: boolean;
  coverArtist?: string;
  isTape: boolean;
  notes?: string;
}

export function processSetlist(setlist: Setlist): ProcessedSetlist {
  const songs: ProcessedSong[] = [];
  const encoreSongs: ProcessedSong[] = [];
  let order = 1;
  
  for (const set of setlist.sets.set) {
    const isEncore = !!set.encore;
    const targetArray = isEncore ? encoreSongs : songs;
    
    for (const song of set.song) {
      targetArray.push({
        name: song.name,
        order: order++,
        isEncore,
        isCover: !!song.cover,
        coverArtist: song.cover?.name,
        isTape: !!song.tape,
        notes: song.info,
      });
    }
  }
  
  return {
    id: setlist.id,
    artistName: setlist.artist.name,
    artistMbid: setlist.artist.mbid,
    venueName: setlist.venue.name,
    venueCity: setlist.venue.city.name,
    venueCountry: setlist.venue.city.country.name,
    latitude: setlist.venue.city.coords?.lat,
    longitude: setlist.venue.city.coords?.long,
    eventDate: setlist.eventDate,
    tourName: setlist.tour?.name,
    songs,
    encoreSongs,
    totalSongs: songs.length + encoreSongs.length,
  };
}

// Format setlist date (dd-MM-yyyy) to ISO format
export function parseSetlistDate(dateStr: string): Date {
  const [day, month, year] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}
