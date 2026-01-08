// Search Utilities
// 🔍 Smart search matching for team/player names across all sports
// ✅ Code Quality Agent: Prioritizes exact matches, uses word boundaries

export interface SearchMatch<T> {
  item: T;
  score: number;
  matchType: 'exact' | 'exact_word' | 'word_start' | 'partial' | 'none';
}

/**
 * Calculates a relevance score for a search query against a team name
 * Higher scores = better matches
 * 
 * Scoring:
 * - 100: Exact match (query === name)
 * - 90: Exact word match (name contains the exact query as a complete word)
 * - 70: Word start match (a word in the name starts with the query)
 * - 30: Partial match (query is contained anywhere in name)
 * - 0: No match
 * 
 * This prevents "Manchester" from equally matching "Manchester United" and "Manchester City"
 * Instead, "Manchester United" will score higher when searching "Manchester United"
 */
export function getSearchScore(query: string, name: string): { score: number; matchType: SearchMatch<unknown>['matchType'] } {
  if (!query || !name) {
    return { score: 0, matchType: 'none' };
  }

  const normalizedQuery = normalizeForSearch(query);
  const normalizedName = normalizeForSearch(name);

  // Exact match - highest priority
  if (normalizedName === normalizedQuery) {
    return { score: 100, matchType: 'exact' };
  }

  // Check if query matches as a complete word or words in the name
  // E.g., "Manchester United" should match better than "Manchester City" when searching "Manchester United"
  const queryWords = normalizedQuery.split(/\s+/);
  const nameWords = normalizedName.split(/\s+/);

  // Check for exact word sequence match
  // "Manchester United" in "Manchester United FC" = high score
  if (containsWordSequence(nameWords, queryWords)) {
    return { score: 90, matchType: 'exact_word' };
  }

  // Check if all query words appear as word starts in name
  // "man utd" should match "Manchester United" better than "Manchester City"
  const allWordsMatchStart = queryWords.every(qWord => 
    nameWords.some(nWord => nWord.startsWith(qWord))
  );

  if (allWordsMatchStart) {
    // Count how many words match completely vs just starting with
    const exactWordMatches = queryWords.filter(qWord => 
      nameWords.includes(qWord)
    ).length;
    
    // Bonus for exact word matches
    const bonus = (exactWordMatches / queryWords.length) * 15;
    return { score: 70 + bonus, matchType: 'word_start' };
  }

  // Simple partial match (fallback)
  if (normalizedName.includes(normalizedQuery)) {
    return { score: 30, matchType: 'partial' };
  }

  // Check if any query word partially matches
  const anyWordPartialMatch = queryWords.some(qWord => 
    normalizedName.includes(qWord)
  );

  if (anyWordPartialMatch) {
    return { score: 20, matchType: 'partial' };
  }

  return { score: 0, matchType: 'none' };
}

/**
 * Normalizes a string for search comparison
 * - Converts to lowercase
 * - Removes common prefixes/suffixes (FC, AFC, CF, etc.)
 * - Normalizes whitespace
 * - Removes accents
 */
export function normalizeForSearch(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/\b(fc|afc|cf|sc|ac|as|ss|us|rc|cd|ud|rcd|ca|club|atletico|athletic|sporting|real)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Checks if a sequence of words appears in order within another array of words
 */
function containsWordSequence(haystack: string[], needle: string[]): boolean {
  if (needle.length === 0) return true;
  if (needle.length > haystack.length) return false;

  for (let i = 0; i <= haystack.length - needle.length; i++) {
    let matches = true;
    for (let j = 0; j < needle.length; j++) {
      if (!haystack[i + j].startsWith(needle[j])) {
        matches = false;
        break;
      }
    }
    if (matches) return true;
  }
  return false;
}

/**
 * Filters and sorts an array of items based on search relevance
 * Only returns items with a score above the threshold
 */
export function filterBySearchRelevance<T>(
  items: T[],
  query: string,
  getSearchableFields: (item: T) => string[],
  minScore: number = 20
): T[] {
  if (!query || query.length < 2) {
    return items;
  }

  const scored: SearchMatch<T>[] = items.map(item => {
    const fields = getSearchableFields(item);
    
    // Get the best score across all searchable fields
    let bestScore = 0;
    let bestMatchType: SearchMatch<T>['matchType'] = 'none';
    
    for (const field of fields) {
      const { score, matchType } = getSearchScore(query, field);
      if (score > bestScore) {
        bestScore = score;
        bestMatchType = matchType;
      }
    }
    
    return { item, score: bestScore, matchType: bestMatchType };
  });

  // Filter by minimum score and sort by score descending
  return scored
    .filter(match => match.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .map(match => match.item);
}

/**
 * Checks if a team name matches a search query with smart matching
 * Returns true if the match score is above the threshold
 */
export function matchesSearch(query: string, ...names: (string | undefined | null)[]): boolean {
  if (!query || query.length < 2) return true;
  
  const validNames = names.filter((n): n is string => !!n);
  
  for (const name of validNames) {
    const { score } = getSearchScore(query, name);
    if (score >= 20) {
      return true;
    }
  }
  
  return false;
}

/**
 * Gets the best match score for a team against a query
 * Used for sorting results by relevance
 */
export function getBestMatchScore(query: string, ...names: (string | undefined | null)[]): number {
  if (!query) return 0;
  
  const validNames = names.filter((n): n is string => !!n);
  let bestScore = 0;
  
  for (const name of validNames) {
    const { score } = getSearchScore(query, name);
    if (score > bestScore) {
      bestScore = score;
    }
  }
  
  return bestScore;
}
