const dateFormatter = new Intl.DateTimeFormat("fi-FI", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("fi-FI", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const timeFormatter = new Intl.DateTimeFormat("fi-FI", {
  hour: "2-digit",
  minute: "2-digit",
});

const dayMonthFormatter = new Intl.DateTimeFormat("fi-FI", {
  day: "numeric",
  month: "long",
});

export function formatDate(iso: string | null | undefined) {
  if (!iso) return "";
  return dateFormatter.format(new Date(iso));
}

export function formatDateTime(iso: string | null | undefined) {
  if (!iso) return "";
  return dateTimeFormatter.format(new Date(iso));
}

export function formatTime(iso: string | null | undefined) {
  if (!iso) return "";
  return timeFormatter.format(new Date(iso));
}

/**
 * Älykkäs päivämääräväli tapahtumille:
 *  - vain alkuaika      → "1. tammikuuta 2026, klo 18:00"
 *  - sama päivä         → "1. tammikuuta 2026, klo 18:00–22:00"
 *  - eri päivät         → "1. tammikuuta 2026 klo 18:00 – 2. tammikuuta 2026 klo 12:00"
 *  - eri päivät & sama vuosi → "1. – 2. tammikuuta 2026, klo 18:00 alkaen"
 */
export function formatEventRange(
  startIso: string | null | undefined,
  endIso?: string | null,
) {
  if (!startIso) return "";
  const start = new Date(startIso);
  if (!endIso) return dateTimeFormatter.format(start);

  const end = new Date(endIso);
  const sameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();

  if (sameDay) {
    return `${dateTimeFormatter.format(start)}–${timeFormatter.format(end)}`;
  }

  const sameMonth =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth();

  if (sameMonth) {
    return `${start.getDate()}.–${dayMonthFormatter.format(end)} ${end.getFullYear()}, klo ${timeFormatter.format(start)} alkaen`;
  }

  return `${dateTimeFormatter.format(start)} – ${dateTimeFormatter.format(end)}`;
}
