"use client";

import { useEffect, useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { UusiValilehti } from "@/components/ui/uusi-valilehti";
import { ilmanStegaa } from "@/lib/stega";
import type { Upotus, UpotusPalvelu } from "@/lib/upotus";

type Props = Upotus & {
  otsikko: string;
  kuvateksti: string | null;
  tekstit: { nayta: string; avaa: string; latausteksti: string };
};

/** Iframen oikeudet palveluittain: suppea `allow`, `sandbox` lisäturvana. */
const OIKEUDET: Record<UpotusPalvelu, { sandbox: string; allow: string }> = {
  // "Näytä isompi kartta" avaa Google Mapsin uuteen välilehteen ilman sandboxia.
  "google-maps": {
    sandbox: "allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox",
    allow: "",
  },
  "google-forms": { sandbox: "allow-scripts allow-same-origin allow-forms allow-popups", allow: "" },
  // Video alkaa heti, koska lukija on jo painanut "Näytä video".
  vimeo: {
    sandbox: "allow-scripts allow-same-origin allow-forms allow-popups",
    allow: "autoplay; fullscreen; picture-in-picture",
  },
};

/**
 * Upotuksen selainosa (YouTube-lohkon malli): ensin kortti ja painike,
 * palvelu (skriptit, evästeet) ladataan vasta painalluksesta. Saa vain
 * palvelimella tulkitun osoitteen (components/upotus.tsx), ei liitettyä
 * tekstiä.
 *
 * Säiliö varaa iframen tilan valmiiksi (kuvasuhde tai lomakkeen korkeus),
 * joten sivu ei hyppää latauksessa. "Avaa palvelussa" -linkki toimii myös
 * ilman JavaScriptiä. Painikkeen nimessä on otsikko, jotta saman sivun
 * useat upotukset erottuvat ruudunlukijalla ("Näytä kartta: …").
 */
export function UpotusKehys({ palvelu, src, avaaOsoite, suhde, korkeus, otsikko, kuvateksti, tekstit }: Props) {
  const [ladattu, setLadattu] = useState(false);
  const kehys = useRef<HTMLIFrameElement>(null);
  const kuvausId = useId();

  // Painike korvautuu upotuksella: fokus siihen, ettei näppäimistön käyttäjä
  // putoa sivun alkuun.
  useEffect(() => {
    if (ladattu) kehys.current?.focus();
  }, [ladattu]);

  const koko = suhde === "4/3" ? "aspect-[4/3]" : suhde === "16/9" ? "aspect-video" : "";
  const oikeudet = OIKEUDET[palvelu];
  const nimi = ilmanStegaa(otsikko);

  return (
    <figure className="mt-8">
      <div
        className={`relative min-h-64 w-full overflow-hidden rounded-xl ${koko}`}
        style={suhde ? undefined : { height: korkeus ?? undefined }}
      >
        {ladattu ? (
          <iframe
            ref={kehys}
            src={src}
            title={nimi}
            className="absolute inset-0 h-full w-full border-0 bg-surface"
            loading="lazy"
            referrerPolicy={palvelu === "google-maps" ? "no-referrer-when-downgrade" : "strict-origin-when-cross-origin"}
            sandbox={oikeudet.sandbox}
            allow={oikeudet.allow}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-start justify-center gap-4 overflow-auto rounded-xl border border-border-strong bg-surface p-6">
            <p className="font-display text-lg leading-snug text-heading">{otsikko}</p>
            <p id={kuvausId} className="text-sm text-muted">
              {tekstit.latausteksti}
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <Button type="button" onClick={() => setLadattu(true)} aria-describedby={kuvausId}>
                {tekstit.nayta}
                <span className="sr-only">: {nimi}</span>
              </Button>
              <a
                href={avaaOsoite}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-accent underline decoration-1 underline-offset-4 hover:decoration-2"
              >
                {tekstit.avaa}
                <UusiValilehti />
              </a>
            </div>
          </div>
        )}
      </div>
      {kuvateksti && <figcaption className="mt-2 text-sm text-muted">{kuvateksti}</figcaption>}
    </figure>
  );
}
