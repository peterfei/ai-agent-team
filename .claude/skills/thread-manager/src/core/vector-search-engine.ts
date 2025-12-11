import { cosineSimilarity } from './vector-utils';

export interface SearchResult<T> {
  id: string;
  score: number;
  payload?: T;
}

export interface SearchOptions<T> {
  topK?: number;
  minScore?: number;
  filter?: (item: SearchItem<T>) => boolean;
}

export interface SearchItem<T> {
  id: string;
  vector: number[];
  payload?: T;
}

/**
 * Vector Search Engine (In-memory implementation for Phase 1)
 */
export class VectorSearchEngine {
  /**
   * Brute-force search for Top-K similar vectors
   */
  search<T>(
    query: number[],
    corpus: SearchItem<T>[],
    options: SearchOptions<T> = {}
  ): SearchResult<T>[] {
    const { topK = 10, minScore = 0, filter } = options;

    // 1. Calculate similarities
    let scored = corpus.map(item => ({
      ...item,
      score: cosineSimilarity(query, item.vector)
    }));

    // 2. Apply filter
    if (filter) {
      scored = scored.filter(filter);
    }

    // 3. Apply min score threshold
    scored = scored.filter(item => item.score >= minScore);

    // 4. Sort and take Top-K
    scored.sort((a, b) => b.score - a.score);
    
    const topResults = scored.slice(0, topK);

    return topResults.map(({ id, score, payload }) => ({
      id,
      score,
      payload
    }));
  }
}
