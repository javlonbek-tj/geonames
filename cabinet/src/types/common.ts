export interface ApiResponse<T> {
  status: 'success' | 'fail' | 'error';
  data: T;
}

export interface ApiMessage {
  status: 'success' | 'fail' | 'error';
  message: string;
}

export interface PaginatedResponse<T> {
  status: 'success' | 'fail' | 'error';
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
