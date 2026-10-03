import { MatchCountdownTimer } from "@/components/match-countdown-timer";
import type { Ottelu } from "@/lib/ottelut";

/**
 * Laskuri seuraavaan Huuhkajien otteluun (etusivun otteluohjelmalohko).
 *
 * Ottelu tulee samasta lähteestä kuin lista (Studion Ottelut-osio,
 * lib/ottelut.ts), joten laskurille ei ole omaa kenttää ylläpidettäväksi.
 * Yönsininen kortti: ottelu, kilpailu · stadion, alkamisaika ja juokseva laskuri.
 */

const TZ = "Europe/Helsinki";
const dateFormat = new Intl.DateTimeFormat("fi-FI", {
  weekday: "short",
  day: "numeric",
  month: "numeric",
  timeZone: TZ,
});
const timeFormat = new Intl.DateTimeFormat("fi-FI", { hour: "2-digit", minute: "2-digit", timeZone: TZ });

/** "la 3.10. klo 16.00" (Helsingin aikaa). Käytössä myös etusivun yläosassa. */
export function formatStart(iso: string): string {
  const d = new Date(iso);
  return `${dateFormat.format(d)} klo ${timeFormat.format(d).replace(":", ".")}`;
}

export function MatchCountdown({ ottelu }: { ottelu: Ottelu }) {
  const meta = [ottelu.kilpailu, ottelu.stadion].filter(Boolean).join(" · ");

  return (
    <div className="flex flex-col gap-5 rounded-sm bg-chrome px-[18px] py-5 sm:gap-6 sm:px-7 sm:py-7">
      <div className="flex flex-col gap-1.5">
        <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-on-chrome-eyebrow sm:text-sm">
          Seuraava Huuhkajien ottelu
        </p>
        <p className="font-display text-2xl font-semibold text-on-chrome sm:text-[2rem]">
          {ottelu.koti} – {ottelu.vieras}
        </p>
        <p className="text-sm text-on-chrome-muted sm:text-base">
          <time dateTime={ottelu.aika}>{formatStart(ottelu.aika)}</time>
          {meta && ` · ${meta}`}
        </p>
      </div>
      <MatchCountdownTimer aika={ottelu.aika} />
    </div>
  );
}
