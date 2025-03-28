export interface Envelope<T> {
  data: T | null;
  success: boolean;
  error: Error | null;
  pagination: Pagination | null;
}

export interface Pagination {
  page: number;
  items_per_page: number;
  total_items: number;
  total_pages: number;
}
