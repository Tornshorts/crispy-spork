/** Format a number as Kenyan Shillings. */
export function kes(value: number | null | undefined): string {
  if (value == null) return 'KES 0';
  return `KES ${Math.abs(value).toLocaleString('en-KE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Format ISO date string to a readable date. */
export function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** Format ISO date string to a readable date + time. */
export function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
