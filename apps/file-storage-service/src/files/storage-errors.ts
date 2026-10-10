const MISSING = new Set(['NotFound', 'NoSuchKey', 'NotFoundException']);

export function storageFailure(err: unknown): 'missing' | 'unavailable' {
  const name = (err as { name?: string }).name ?? '';
  const code = String((err as { Code?: string }).Code ?? '');
  if (MISSING.has(name) || MISSING.has(code)) {
    return 'missing';
  }
  return 'unavailable';
}

export function safeFilename(name: string | undefined): string {
  const raw = (name ?? '').trim();
  const base = (raw.split(/[/\\]/).pop() ?? '').trim();
  const cleaned = base.replace(/[^\w.\-]+/g, '_').slice(0, 120);
  return cleaned || 'report.csv';
}

export const MAX_FILE_CHARS = 1_000_000;
