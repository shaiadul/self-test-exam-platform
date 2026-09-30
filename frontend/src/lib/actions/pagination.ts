export interface PaginationParams {
  page?: number;
  per_page?: number;
  limit?: number;
  search?: string;
  category?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  mine?: boolean;
  [key: string]: any;
}

export interface PaginationMeta {
  total_items: number;
  total_pages: number;
  current_page: number;
  per_page: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Normalizes an API response that may be either a raw array or a paginated envelope { data, meta }.
 */
export function normalizePaginatedResponse<T>(
  res: any,
  fallbackPage = 1,
  fallbackPerPage = 10
): PaginatedResponse<T> {
  if (!res) {
    return {
      data: [],
      meta: {
        total_items: 0,
        total_pages: 0,
        current_page: fallbackPage,
        per_page: fallbackPerPage,
      },
    };
  }

  if (Array.isArray(res)) {
    return {
      data: res,
      meta: {
        total_items: res.length,
        total_pages: Math.ceil(res.length / fallbackPerPage) || (res.length > 0 ? 1 : 0),
        current_page: fallbackPage,
        per_page: fallbackPerPage,
      },
    };
  }

  const data = Array.isArray(res.data) ? res.data : [];
  const meta: PaginationMeta = {
    total_items: typeof res.meta?.total_items === "number" ? res.meta.total_items : data.length,
    total_pages: typeof res.meta?.total_pages === "number" ? res.meta.total_pages : (data.length > 0 ? 1 : 0),
    current_page: typeof res.meta?.current_page === "number" ? res.meta.current_page : fallbackPage,
    per_page: typeof res.meta?.per_page === "number" ? res.meta.per_page : fallbackPerPage,
  };

  return { data, meta };
}
