"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";

import { lahetaJasenhakemus } from "./actions";
import {
  ALKUTILA,
  HONEYPOT_KENTTA,
  KENTTA_OTSIKOT,
  TYHJAT_ARVOT,
  type HakemusArvot,
  type HakemusKentta,
  type HakemusVirheet,
} from "./hakemus";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

/**
 * Jäsenhakemuslomake.
 *
 * Ainoa asiakaskomponentti klubi-osiossa: lomake tarvitsee lähetystilan ja
 * virheiden näyttämisen ilman sivulatausta. Kaikki validointi tehdään silti
 * palvelimella — tämä komponentti vain esittää tuloksen.
 *
 * Saavutettavuus:
 *  - jokaisella kentällä `<label>`, ei placeholder-labeleita
 *  - virheet sekä pysyvässä `aria-live`-alueessa että kentän vieressä
 *    (`aria-invalid` + `aria-describedby`)
 *  - tilaviesti saa fokuksen lähetyksen jälkeen, jotta ruudunlukija ja
 *    näppäimistökäyttäjä löytävät sen ilman etsimistä
 */

const kentanTyyppi: Partial<Record<HakemusKentta, string>> = {
  sahkoposti: "email",
  puhelin: "tel",
  syntymavuosi: "number",
};

const kentanAutocomplete: Partial<Record<HakemusKentta, string>> = {
  etunimi: "given-name",
  sukunimi: "family-name",
  sahkoposti: "email",
  puhelin: "tel",
  paikkakunta: "address-level2",
};

const inputClass =
  "min-h-11 w-full rounded-xl border border-border bg-background px-4 py-2 text-base text-foreground " +
  "focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

function Kentta({
  nimi,
  pakollinen,
  vihje,
  arvot,
  virheet,
  monirivinen,
}: {
  nimi: HakemusKentta;
  pakollinen?: boolean;
  vihje?: string;
  arvot: HakemusArvot;
  virheet: HakemusVirheet;
  monirivinen?: boolean;
}) {
  const virhe = virheet[nimi];
  const virheId = `${nimi}-virhe`;
  const vihjeId = `${nimi}-vihje`;
  const describedBy =
    [virhe ? virheId : null, vihje ? vihjeId : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={nimi} className="text-sm font-medium text-foreground">
        {KENTTA_OTSIKOT[nimi]}
        {pakollinen ? (
          <span className="ml-1 text-accent" aria-hidden>
            *
          </span>
        ) : (
          <span className="ml-1 font-normal text-muted">(valinnainen)</span>
        )}
      </label>

      {vihje && (
        <p id={vihjeId} className="text-sm text-muted">
          {vihje}
        </p>
      )}

      {monirivinen ? (
        <textarea
          id={nimi}
          name={nimi}
          rows={5}
          maxLength={1500}
          required={pakollinen}
          defaultValue={arvot[nimi]}
          aria-invalid={virhe ? true : undefined}
          aria-describedby={describedBy}
          className={`${inputClass} py-3`}
        />
      ) : (
        <input
          id={nimi}
          name={nimi}
          type={kentanTyyppi[nimi] ?? "text"}
          inputMode={nimi === "syntymavuosi" ? "numeric" : undefined}
          min={nimi === "syntymavuosi" ? 1900 : undefined}
          max={nimi === "syntymavuosi" ? new Date().getFullYear() : undefined}
          autoComplete={kentanAutocomplete[nimi]}
          required={pakollinen}
          defaultValue={arvot[nimi]}
          aria-invalid={virhe ? true : undefined}
          aria-describedby={describedBy}
          className={inputClass}
        />
      )}

      {virhe && (
        <p id={virheId} className="text-sm font-medium text-danger">
          {virhe}
        </p>
      )}
    </div>
  );
}

export function JasenhakemusForm() {
  const [tila, formAction, odottaa] = useActionState(
    lahetaJasenhakemus,
    ALKUTILA,
  );
  const tilaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tila.status !== "idle") {
      tilaRef.current?.focus();
    }
  }, [tila]);

  const arvot = "arvot" in tila ? tila.arvot : TYHJAT_ARVOT;
  const virheet = tila.status === "virhe" ? tila.virheet : {};
  const virhelista = Object.entries(virheet) as [HakemusKentta, string][];

  return (
    <div className="mt-10 max-w-2xl">
      {/*
        Pysyvä tila-alue: se on DOM:issa jo ennen lähetystä, jotta
        ruudunlukija ilmoittaa muutoksen eikä vain uuden elementin.
      */}
      <div
        ref={tilaRef}
        tabIndex={-1}
        role="status"
        aria-live="polite"
        className="focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
      >
        {tila.status !== "idle" && (
          <div
            className={cn(
              "rounded-2xl border p-5",
              tila.status === "onnistui" && "border-success bg-success-soft",
              tila.status === "virhe" && "border-danger-border bg-danger-soft",
              // "Ei käytössä" ei ole käyttäjän virhe vaan palvelun tila.
              tila.status === "eiKaytossa" && "border-warning bg-warning-soft",
            )}
          >
            <p className="font-medium text-foreground">{tila.viesti}</p>

            {virhelista.length > 0 && (
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-foreground">
                {virhelista.map(([kentta, viesti]) => (
                  <li key={kentta}>
                    <a href={`#${kentta}`} className="text-accent underline">
                      {KENTTA_OTSIKOT[kentta]}
                    </a>
                    : {viesti}
                  </li>
                ))}
              </ul>
            )}

            {tila.status === "eiKaytossa" && (
              <p className="mt-3 text-sm text-muted">
                Löydät kaikki yhteystiedot{" "}
                <Link
                  href="/klubi/yhteystiedot"
                  className="text-accent underline"
                >
                  yhteystiedot-sivulta
                </Link>
                .
              </p>
            )}
          </div>
        )}
      </div>

      {tila.status === "onnistui" ? (
        <p className="mt-6">
          <Link href="/klubi" className="text-accent hover:underline">
            Palaa klubin etusivulle
          </Link>
        </p>
      ) : (
        <form action={formAction} noValidate className="mt-6 flex flex-col gap-6">
          <p className="text-sm text-muted">
            Tähdellä <span aria-hidden>*</span> merkityt kentät ovat pakollisia.
          </p>

          <div className="grid gap-6 sm:grid-cols-2">
            <Kentta nimi="etunimi" pakollinen arvot={arvot} virheet={virheet} />
            <Kentta nimi="sukunimi" pakollinen arvot={arvot} virheet={virheet} />
          </div>

          <Kentta nimi="sahkoposti" pakollinen arvot={arvot} virheet={virheet} />

          <div className="grid gap-6 sm:grid-cols-2">
            <Kentta nimi="puhelin" arvot={arvot} virheet={virheet} />
            <Kentta nimi="syntymavuosi" arvot={arvot} virheet={virheet} />
          </div>

          <Kentta nimi="paikkakunta" arvot={arvot} virheet={virheet} />

          <Kentta
            nimi="perustelu"
            monirivinen
            vihje="Esimerkiksi mikä klubin toiminnassa kiinnostaa tai kuka sinut suositteli."
            arvot={arvot}
            virheet={virheet}
          />

          <div className="flex flex-col gap-1.5">
            <div className="flex items-start gap-3">
              <input
                id="suostumus"
                name="suostumus"
                type="checkbox"
                value="kylla"
                defaultChecked={arvot.suostumus === "kylla"}
                aria-invalid={virheet.suostumus ? true : undefined}
                aria-describedby={
                  virheet.suostumus ? "suostumus-virhe" : undefined
                }
                className="mt-1 size-5 shrink-0 rounded border-border-strong text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              />
              <label
                htmlFor="suostumus"
                className="min-h-11 text-sm leading-relaxed text-foreground"
              >
                Annan Lahden Suomalainen Klubi ry:lle luvan käsitellä yllä
                antamiani tietoja jäsenhakemuksen käsittelyä varten.
                <span className="ml-1 text-accent" aria-hidden>
                  *
                </span>
              </label>
            </div>
            {virheet.suostumus && (
              <p
                id="suostumus-virhe"
                className="text-sm font-medium text-danger"
              >
                {virheet.suostumus}
              </p>
            )}
          </div>

          {/*
            Hunajapurkki. Piilotettu sekä katseelta, näppäimistöltä että
            ruudunlukijalta — vain automaatti täyttää tämän.
          */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-[9999px] size-px overflow-hidden"
          >
            <label htmlFor={HONEYPOT_KENTTA}>Kotisivu</label>
            <input
              id={HONEYPOT_KENTTA}
              name={HONEYPOT_KENTTA}
              type="text"
              tabIndex={-1}
              autoComplete="off"
              defaultValue=""
            />
          </div>

          <div>
            <Button type="submit" size="lg" disabled={odottaa}>
              {odottaa ? "Lähetetään…" : "Lähetä hakemus"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
