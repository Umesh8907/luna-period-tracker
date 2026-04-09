export function addDays(isoDate: string, days: number) {
  const date = new Date(`${isoDate}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function daysBetween(startIso: string, endIso: string) {
  const start = new Date(`${startIso}T00:00:00`).getTime();
  const end = new Date(`${endIso}T00:00:00`).getTime();
  return Math.round((end - start) / (1000 * 60 * 60 * 24));
}

export function formatLongDate(isoDate: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(`${isoDate}T00:00:00`));
}

export function formatISO(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function subMonths(isoDate: string, months: number) {
  const date = new Date(`${isoDate}T00:00:00`);
  date.setMonth(date.getMonth() - months);
  return formatISO(date);
}

export function addMonths(isoDate: string, months: number) {
  const date = new Date(`${isoDate}T00:00:00`);
  date.setMonth(date.getMonth() + months);
  return formatISO(date);
}
