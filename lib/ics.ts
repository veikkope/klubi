/**
 * iCalendar-(RFC 5545)-muotoinen VEVENT-generaattori.
 *
 * Tärkeää:
 * - Rivinpäätökset CRLF (\r\n)
 * - Pitkät rivit foldataan 75-merkin kohdalta välilyönnillä
 * - Erikoismerkit (\, ;, ,, \n) escapataan tekstikentissä
 * - Päivämäärät UTC-muodossa "Z"-suffiksilla (esim. 20260101T180000Z)
 */

type EventInput = {
  uid: string;
  url: string;
  title: string;
  description?: string;
  location?: string;
  startsAt: string;
  endsAt?: string;
};

function escape(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

function toIcsDate(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    "Z"
  );
}

/** Foldaa rivit ICS-spesifikaation 75-oktetin rajan mukaan. */
function fold(line: string): string {
  if (line.length <= 75) return line;
  const out: string[] = [];
  let i = 0;
  while (i < line.length) {
    if (i === 0) {
      out.push(line.slice(0, 75));
      i = 75;
    } else {
      out.push(" " + line.slice(i, i + 74));
      i += 74;
    }
  }
  return out.join("\r\n");
}

export function buildIcs(event: EventInput): string {
  const dtEnd = event.endsAt
    ? event.endsAt
    : new Date(new Date(event.startsAt).getTime() + 2 * 60 * 60 * 1000).toISOString();

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Lahden Suomalainen Klubi ry//FI",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.uid}`,
    `DTSTAMP:${toIcsDate(new Date().toISOString())}`,
    `DTSTART:${toIcsDate(event.startsAt)}`,
    `DTEND:${toIcsDate(dtEnd)}`,
    `SUMMARY:${escape(event.title)}`,
    event.location ? `LOCATION:${escape(event.location)}` : "",
    event.description ? `DESCRIPTION:${escape(event.description)}` : "",
    `URL:${event.url}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);

  return lines.map(fold).join("\r\n") + "\r\n";
}
