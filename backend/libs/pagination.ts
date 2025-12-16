/**
 * Pagination Helper Utilities
 * 
 * The backend supports cursor-based pagination for efficient queries on large datasets.
 * All list endpoints (invoices, clients) support the following query parameters:
 * 
 * - limit: number (1-100, default: 50) - Number of items to return per page
 * - lastKey: string (base64 encoded) - Cursor key from previous response for fetching next page
 * 
 * Response format:
 * {
 *   items: T[],
 *   count: number,
 *   lastKey?: string  // Present if more items exist
 * }
 * 
 * FRONTEND IMPLEMENTATION NOTES:
 * 
 * 1. Track the lastKey from each response
 * 2. Pass lastKey in next request to fetch subsequent pages
 * 3. Stop pagination when response does NOT contain lastKey (end of data)
 * 4. Use state management (e.g., Zustand) to maintain:
 *    - currentItems: T[]
 *    - pageStack: string[] (array of lastKeys for back navigation)
 *    - currentPageIndex: number
 * 
 * Example flow:
 * - Request 1: GET /invoices?limit=10
 *   Response: { items: [inv1...inv10], lastKey: "abc123" }
 * - Request 2: GET /invoices?limit=10&lastKey=abc123
 *   Response: { items: [inv11...inv20], lastKey: "def456" }
 * - Request 3: GET /invoices?limit=10&lastKey=def456
 *   Response: { items: [inv21...inv25], count: 5 }  // No lastKey = last page
 */

export interface PaginationParams {
  limit?: number;
  lastKey?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  count: number;
  lastKey?: string;
}

export const DEFAULT_PAGE_SIZE = 50;
export const MAX_PAGE_SIZE = 100;

/**
 * Encode pagination key for safe URL transmission
 */
export const encodePaginationKey = (key: any): string => {
  return Buffer.from(JSON.stringify(key)).toString('base64');
};

/**
 * Decode pagination key from URL
 */
export const decodePaginationKey = (encoded: string): any => {
  try {
    return JSON.parse(Buffer.from(encoded, 'base64').toString('utf-8'));
  } catch (error) {
    console.error('Failed to decode pagination key:', error);
    return undefined;
  }
};

/**
 * Validate and normalize pagination parameters
 */
export const validatePaginationParams = (limit?: string, lastKeyEncoded?: string) => {
  let parsedLimit = DEFAULT_PAGE_SIZE;
  
  if (limit) {
    const num = parseInt(limit, 10);
    if (isNaN(num) || num < 1) {
      parsedLimit = DEFAULT_PAGE_SIZE;
    } else if (num > MAX_PAGE_SIZE) {
      parsedLimit = MAX_PAGE_SIZE;
    } else {
      parsedLimit = num;
    }
  }

  let decodedLastKey: any = undefined;
  if (lastKeyEncoded) {
    decodedLastKey = decodePaginationKey(lastKeyEncoded);
  }

  return { limit: parsedLimit, lastKey: decodedLastKey };
};
