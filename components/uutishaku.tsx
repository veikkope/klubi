import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { HAKU_MAX_PITUUS } from "@/lib/haku";

/**
 * Uutishaku (lib/haku.ts). GET-lomake kuten kategoriasuodatin: haku päätyy
 * URL:iin (`/uutiset?q=…`), toimii ilman JavaScriptiä ja on jaettavissa.
 * Aktiivinen kategoria säilyy, jolloin haku rajautuu siihen.
 */
export function Uutishaku({ haku, kategoria }: { haku: string; kategoria: string | null }) {
  return (
    <form role="search" method="get" action="/uutiset" className="flex max-w-2xl flex-col gap-2">
      <label htmlFor="uutishaku" className="text-sm font-semibold text-foreground">
        Hae uutisista
      </label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search
            aria-hidden
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-soft"
          />
          <input
            id="uutishaku"
            type="search"
            name="q"
            defaultValue={haku}
            maxLength={HAKU_MAX_PITUUS}
            autoComplete="off"
            enterKeyHint="search"
            placeholder="esim. mölkky, Huuhkajat tai FC Lahti"
            aria-describedby="uutishaku-ohje"
            className="h-12 w-full rounded-sm border border-border-input bg-background pl-10 pr-3 text-base text-foreground placeholder:text-muted-soft focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          />
        </div>
        {kategoria && <input type="hidden" name="kategoria" value={kategoria} />}
        <Button type="submit" size="lg">
          Hae
        </Button>
      </div>
      <p id="uutishaku-ohje" className="text-sm text-muted">
        Hakee otsikoista ja teksteistä, myös taivutusmuodoista. Useamman sanan haussa kaikkien pitää löytyä.
      </p>
    </form>
  );
}
