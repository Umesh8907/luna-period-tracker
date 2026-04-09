export function addDays(isoDate: string, days: number) {
  const dateStr = isoDate.split('T')[0];
  const date = new Date(`${dateStr}T00:00:00`);
  date.setDate(date.getDate() + days);
  return formatISO(date);
}

export function daysBetween(startIso: string, endIso: string) {
  const sDate = startIso.split('T')[0];
  const eDate = endIso.split('T')[0];
  const start = new Date(`${sDate}T00:00:00`).getTime();
  const end = new Date(`${eDate}T00:00:00`).getTime();
  return Math.round((end - start) / (1000 * 60 * 60 * 24));
}

export function formatLongDate(isoDate: string) {
  const dateStr = isoDate.split('T')[0];
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(`${dateStr}T00:00:00`));
}

export function getTodayISO() {
  const d = new Date();
  return formatISO(d);
}

export function formatISO(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
