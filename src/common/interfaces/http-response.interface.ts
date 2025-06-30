export interface HttpResponse<T = null> {
  status: 'success' | 'error';
  message: string;
  data: T;
  error: Record<string, string> | null;
}
