export const fmt$ = (n) => {
  if (n === null || n === undefined || n === '') return '$0';
  const v = Number(n);
  if (!isFinite(v)) return '$0';
  return '$' + v.toLocaleString('en-AU', { maximumFractionDigits: 0 });
};

export const fmtDate = (d) => {
  if (!d) return '';
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return String(d);
  return dt.toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' });
};

export const fmtDateShort = (d) => {
  if (!d) return '';
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return String(d);
  return dt.toLocaleDateString('en-AU', { month: 'short', day: 'numeric' });
};

export const daysBetween = (start, end) => {
  if (!start || !end) return 0;
  const a = new Date(start);
  const b = new Date(end);
  if (isNaN(a.getTime()) || isNaN(b.getTime())) return 0;
  const ms = b - a;
  if (ms <= 0) return 0;
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
};
