import { stegaClean } from "next-sanity";

import { formatDate, formatDateTime } from "@/lib/format";
import { sanityFetch } from "@/sanity/lib/fetch";
import { kommentitQuery } from "@/sanity/lib/queries/kommentit";
import { kommentitTag, kommentointiAuki, type KommenttiItem, type Kommentointi } from "./form-state";
import { KommenttiLomake } from "./kommentti-lomake";

/**
 * Uutisen kommentit ja veikkaukset (docs/15 §2).
 *
 * Näytetään, kun kommentointi on päällä tai uutisella on kommentteja (vanhat
 * blogista tuodut veikkaukset näkyvät, vaikka uusia ei voi jättää). Lista
 * haetaan ohi Sanityn CDN:n ja omalla tagillaan, jotta Server Actionin
 * `updateTag` näyttää uuden viestin lähettäjälle heti.
 */
export async function KommentitOsio({
  uutinenId,
  kommentointi: raaka,
}: {
  uutinenId: string;
  kommentointi: Kommentointi | null | undefined;
}) {
  // Esikatselussa (draft mode) merkkijonoissa on näkymätön stega-koodaus: ilman
  // siivousta tyyppi "kommentti" ei vastaisi vertailua (lomake luuli sitä
  // veikkaukseksi), ja joukkueiden nimet menisivät lomakkeen arvoihin koodattuina.
  const kommentointi = stegaClean(raaka);
  const kommentit = await sanityFetch<KommenttiItem[]>({
    query: kommentitQuery,
    params: { uutinenId },
    tags: ["kommentti", kommentitTag(uutinenId)],
    fallback: [],
    // Buildissa CDN: satoja uutissivuja rinnakkain suoraan API:in ylitti Sanityn
    // pyyntörajan ja kaatoi buildin (4.10.2026). Ajon aikana ohi CDN:n, jotta
    // updateTag näyttää uuden viestin heti.
    useCdn: process.env.NEXT_PHASE === "phase-production-build",
  });

  const kaytossa = Boolean(kommentointi?.kaytossa);
  if (!kaytossa && kommentit.length === 0) return null;

  const auki = kommentointiAuki(kommentointi);
  const onVeikkaus = kommentointi?.tyyppi === "sarjajarjestys" || kommentointi?.tyyppi === "voittajaveikkaus"
    || kommentit.some((k) => k.veikkaus?.jarjestys?.length);
  const otsikko = onVeikkaus ? "Veikkaukset" : "Kommentit";

  return (
    <section aria-labelledby="kommentit-otsikko" className="mt-16 border-t border-border pt-10">
      <h2 id="kommentit-otsikko" className="font-display text-2xl sm:text-3xl">
        {otsikko} <span className="text-muted">({kommentit.length})</span>
      </h2>

      {kaytossa && auki && kommentointi && (
        <div className="mt-6">
          {kommentointi.sulkeutuu && (
            <p className="mb-4 text-sm text-muted">
              {onVeikkaus ? "Veikkaus" : "Kommentointi"} sulkeutuu{" "}
              <time dateTime={kommentointi.sulkeutuu}>{formatDateTime(kommentointi.sulkeutuu)}</time>.
            </p>
          )}
          <KommenttiLomake uutinenId={uutinenId} kommentointi={kommentointi} />
        </div>
      )}

      {kaytossa && !auki && kommentointi?.sulkeutuu && (
        <p className="mt-6 rounded-2xl border border-border bg-surface p-5 text-muted">
          {onVeikkaus ? "Veikkaus" : "Kommentointi"} sulkeutui{" "}
          <time dateTime={kommentointi.sulkeutuu}>{formatDateTime(kommentointi.sulkeutuu)}</time>.
        </p>
      )}

      {kommentit.length > 0 ? (
        <ol className="mt-8 list-none space-y-4 p-0">
          {kommentit.map((k) => (
            <li key={k._id}>
              <Kommentti kommentti={k} />
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-6 text-muted">
          {onVeikkaus ? "Ei vielä veikkauksia. Ole ensimmäinen!" : "Ei vielä kommentteja."}
        </p>
      )}
    </section>
  );
}

function Kommentti({ kommentti }: { kommentti: KommenttiItem }) {
  const jarjestys = kommentti.veikkaus?.jarjestys ?? [];
  // Vanhoissa blogikommenteissa kellonaika on blogin palvelimen aika: pelkkä päivä riittää.
  const aika = kommentti.lahde === "blogspot" ? formatDate(kommentti.lahetetty) : formatDateTime(kommentti.lahetetty);

  return (
    <article className="rounded-xl border border-border bg-background p-4 sm:p-5">
      <header className="flex flex-wrap items-baseline gap-x-2 text-sm">
        <span className="font-semibold text-foreground">{kommentti.nimi}</span>
        <span aria-hidden className="text-muted-soft">·</span>
        <time dateTime={kommentti.lahetetty} className="text-muted">
          {aika}
        </time>
      </header>

      {jarjestys.length > 0 && (
        <ol aria-label="Veikkaus" className="mt-3 flex list-none flex-wrap gap-x-4 gap-y-1 p-0 text-foreground">
          {jarjestys.map((joukkue, i) => (
            <li key={`${i}-${joukkue}`} className="tabular-nums">
              <span className="text-muted">{i + 1}.</span> {joukkue}
            </li>
          ))}
        </ol>
      )}

      {kommentti.veikkaus?.maalikuningas && (
        <p className="mt-2 text-sm">
          <span className="text-muted">Maalikuningas:</span> {kommentti.veikkaus.maalikuningas}
        </p>
      )}

      {kommentti.teksti && (
        <p className="mt-3 whitespace-pre-line leading-relaxed text-foreground">{kommentti.teksti}</p>
      )}
    </article>
  );
}
