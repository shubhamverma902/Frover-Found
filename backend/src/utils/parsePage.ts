const MAX_PAGE  = 500;
const MAX_LIMIT = 100;

/**
 * Parse and clamp pagination query params.
 * @param query  req.query object
 * @param defaultLimit  per-endpoint default (e.g. 20 for events, 10 for guests)
 * @param maxLimit      per-endpoint hard cap (e.g. 500 for guests used by seating)
 */
export const parsePage = (
  query: Record<string, unknown>,
  defaultLimit = 20,
  maxLimit     = MAX_LIMIT,
): { page: number; limit: number; skip: number } => {
  const page  = Math.min(Math.max(1, Number(query.page)  || 1), MAX_PAGE);
  const limit = Math.min(Math.max(1, Number(query.limit) || defaultLimit), maxLimit);
  return { page, limit, skip: (page - 1) * limit };
};
