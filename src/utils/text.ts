export function normalize(str: string | null | undefined) {
  return (str ?? '').toString().trim().toLowerCase();
}

export function pad2(n: number) {
  return String(n).padStart(2, '0');
}

export function escapeICS(s: string = '') {
  return String(s)
    .replace(/([,;])/g, '\\$1')
    .replace(/\n/g, '\\n');
}
