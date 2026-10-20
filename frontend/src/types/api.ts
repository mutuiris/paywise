export type ApiErrorKind =
  | 'config'
  | 'network'
  | 'unauthorized'
  | 'forbidden'
  | 'notfound'
  | 'validation'
  | 'conflict'
  | 'server'
  | 'unknown';

export type FieldErrors = Record<string, string[]>;

export interface ResultsEnvelope<T> {
  count: number;
  results: T[];
}

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type Collection<T> = T[] | ResultsEnvelope<T> | Paginated<T>;
