"use client";

import { useActionState, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { cn } from "@/lib/cn";
import { PHOTO_ALT_FIELD, PHOTO_CONSENT_FIELD, PHOTO_FIELD } from "@/lib/arvostelukuvat";
import type { KlubilainenOption, RavintolaOption } from "@/sanity/lib/queries/ravintolat";
import { submitReview } from "./actions";
import { ArvostelijaValinta } from "./arvostelija-valinta";
import {
  ARVOSTELIJA_AVAIN,
  INITIAL_REVIEW_STATE,
  RATING_FIELDS,
  REVIEW_FIELDS,
  REVIEW_FIELD_LABELS,
  reviewFieldId,
  type Arvostelija,
  type ReviewField,
  type ReviewFormState,
} from "./form-state";
import { CommentField, KayntipaivaField, RatingsField } from "./kentat";
import { KotinayttoVinkki } from "./kotinaytto-vinkki";
import { PhotoPicker, type PhotoDraft } from "./photo-picker";
import { RestaurantPicker, type RavintolaValinta } from "./restaurant-picker";
import {
  KENTAN_VAIHE,
  LUONNOS_AVAIN,
  VAIHEEN_OTSIKKO,
  lueArvostelija,
  lueLuonnos,
  luonnoksenArvot,
  luonnosLomakkeesta,
  luonnosTyhja,
  naytettavat,
  onVaihe,
  parseScore,
  sallittuVaihe,
  vaiheValmis,
  virheenVaihe,
  type Edistyminen,
  type Vaihe,
} from "./vaiheet";

/**
 * Ravintola-arvostelu puhelimen sovelluksena: yksi asia näkymää kohden.
 *
 * Vaiheet: (kuka →) ravintola → arvosanat → kerro lisää. Nimi kysytään vain,
 * kun laite ei muista sitä. Ravintolan tai klubilaisen napautus vie suoraan
 * eteenpäin; muuten alapalkin painike (aina samassa paikassa peukalon alla).
 * Säännöt (valmius, rajaus, luonnos) ovat vaiheet.ts:ssä, testit:
 * npm run test:arvostelu.
 *
 * Ratkaisuja:
 * - Vaihe on osoitteessa (?vaihe=arvosanat, `history.pushState`), joten
 *   puhelimen takaisin-ele siirtyy edelliseen vaiheeseen eikä pois sivulta.
 *   Eteenpäin ei pääse keskeneräisen vaiheen yli (`sallittuVaihe`).
 * - Kaikki vaiheet ovat koko ajan lomakkeessa (näkymättömät `hidden`-tilassa),
 *   joten yksi lähetys vie kaikki kentät Server Actionille (actions.ts), joka
 *   validoi kaiken uudelleen. Palvelimen virhe vie vaiheeseen, jossa virhe on.
 * - Keskeneräinen arvostelu tallentuu laitteelle (luonnos) jokaisesta
 *   muutoksesta ja sivulta poistuttaessa, ja se jatkuu samasta kohdasta.
 *   Kuvat eivät tallennu (liian suuria laitteen muistiin).
 * - Näkymä piirretään vasta selaimessa: luonnos ja muistettu nimi ovat vain
 *   siellä, eikä palvelimen piirtämä väliversio välähdä.
 *
 * Saavutettavuus (WCAG 2.2 AA): fokus siirtyy vaiheen otsikkoon, vaihe ja sen
 * numero luetaan otsikosta ("Vaihe 2/3"), virheyhteenvedon linkit vievät
 * oikeaan vaiheeseen ja kenttään, ja siirtymäanimaatio jää pois, kun käyttäjä
 * on pyytänyt vähemmän liikettä.
 */

const eiTilausta = () => () => {};

function lue(avain: string): string | null {
  try {
    return localStorage.getItem(avain);
  } catch {
    return null;
  }
}

function kirjoita(avain: string, arvo: string | null) {
  try {
    if (arvo === null) localStorage.removeItem(avain);
    else localStorage.setItem(avain, arvo);
  } catch {
    // Yksityinen selaus tms.: arvostelu toimii ilman muistia.
  }
}

function muista(arvostelija: Arvostelija | null) {
  if (arvostelija && arvostelija.nimi.trim().length >= 2) {
    kirjoita(ARVOSTELIJA_AVAIN, JSON.stringify({ klubilainen: arvostelija.klubilainen, nimi: arvostelija.nimi.trim() }));
  }
}

/** Virheet ilman yhtä kenttää (kenttää on muutettu). */
const ilman =
  (kentta: ReviewField) =>
  (virheet: Partial<Record<ReviewField, string>>): Partial<Record<ReviewField, string>> =>
    Object.fromEntries(Object.entries(virheet).filter(([k]) => k !== kentta));

/** Osoite, jossa on vaihe ja josta kertakäyttöinen ?ravintola= on poistettu. */
function osoite(vaihe: Vaihe): string {
  const p = new URLSearchParams(window.location.search);
  p.set("vaihe", vaihe);
  p.delete("ravintola");
  return `?${p.toString()}`;
}

type Props = {
  restaurants: RavintolaOption[];
  klubilaiset: KlubilainenOption[];
  defaultRestaurantId?: string;
};

export function ReviewForm(props: Props) {
  const selaimessa = useSyncExternalStore(eiTilausta, () => true, () => false);
  // "Aloita alusta": uusi avain piirtää arvostelun tyhjästä ilman sivun latausta.
  const [kierros, setKierros] = useState(0);
  if (!selaimessa) {
    return (
      <Kuori otsikko="Arvostelu">
        <div className="grid flex-1 place-items-center py-24" role="status">
          <span className="flex items-center gap-2 text-muted">
            <Spinner />
            Ladataan…
          </span>
        </div>
      </Kuori>
    );
  }
  return (
    <Arvostelu
      key={kierros}
      {...props}
      // ?ravintola= on jo käytetty; alusta aloitettaessa ei valita uudelleen.
      defaultRestaurantId={kierros === 0 ? props.defaultRestaurantId : undefined}
      onAlusta={() => {
        kirjoita(LUONNOS_AVAIN, null);
        window.history.replaceState(null, "", window.location.pathname);
        setKierros((k) => k + 1);
      }}
    />
  );
}

function Arvostelu({
  restaurants,
  klubilaiset,
  defaultRestaurantId,
  onAlusta,
}: Props & { onAlusta: () => void }) {
  const [state, formAction] = useActionState<ReviewFormState, FormData>(submitReview, INITIAL_REVIEW_STATE);
  const formRef = useRef<HTMLFormElement>(null);
  const haku = useSearchParams();

  // Alkutila laitteelta kerran: luonnos ja muistettu nimi. ?ravintola= (esim.
  // odottavien listalta) aloittaa uuden arvostelun, ellei luonnos ole samasta.
  const [alku] = useState(() => {
    const ravintolaIdt = new Set(restaurants.map((r) => r._id));
    let luonnos = lueLuonnos(lue(LUONNOS_AVAIN), ravintolaIdt);
    const pyydetty = defaultRestaurantId && ravintolaIdt.has(defaultRestaurantId) ? defaultRestaurantId : undefined;
    if (pyydetty && luonnos && luonnos.arvot.ravintola !== pyydetty) luonnos = null;
    const arvot = luonnoksenArvot(luonnos);
    if (pyydetty && !luonnos) arvot.ravintola = pyydetty;
    return { luonnos, arvot, arvostelija: lueArvostelija(lue(ARVOSTELIJA_AVAIN), klubilaiset) };
  });

  const [arvostelija, setArvostelija] = useState<Arvostelija | null>(alku.arvostelija);
  const [kysyNimi, setKysyNimi] = useState(alku.arvostelija === null);
  const [ravintola, setRavintola] = useState<RavintolaValinta>(
    alku.arvot.uusi === "1" ? "uusi" : alku.arvot.ravintola ? "valittu" : null,
  );
  const [ravintolanNimi, setRavintolanNimi] = useState<string | null>(
    () => restaurants.find((r) => r._id === alku.arvot.ravintola)?.name ?? null,
  );
  const [arvosanat, setArvosanat] = useState<Record<string, number | null>>(() =>
    Object.fromEntries(RATING_FIELDS.map(({ field }) => [field, parseScore(alku.arvot[field])])),
  );
  const [photos, setPhotos] = useState<PhotoDraft[]>([]);
  const [photoConsent, setPhotoConsent] = useState(false);
  const [luonnosIlmoitus, setLuonnosIlmoitus] = useState(alku.luonnos !== null);
  // Vaiheen omat tarkistukset (Seuraava) ja palvelimen virheet, jotka on jo korjattu.
  const [paikalliset, setPaikalliset] = useState<Partial<Record<ReviewField, string>>>({});
  const [kuitatut, setKuitatut] = useState<{ tila: ReviewFormState; vaiheet: Vaihe[] }>({
    tila: state,
    vaiheet: [],
  });
  const processingPhotos = photos.some((p) => p.status === "processing");

  const vaiheet = naytettavat(kysyNimi);
  const edistyminen: Edistyminen = { arvostelija, ravintola, arvosanat };
  const pyydetty = haku.get("vaihe");
  const toivottu = onVaihe(pyydetty) ? pyydetty : (alku.luonnos?.vaihe ?? vaiheet[0]);
  const vaihe = sallittuVaihe(vaiheet.includes(toivottu) ? toivottu : vaiheet[0], vaiheet, edistyminen);
  const indeksi = vaiheet.indexOf(vaihe);

  // Kulkusuunta animaatiota varten ja vaiheen omat virheet pois vaihtuessa
  // (tila edellisestä piirrosta, Reactin suosittelema tapa ilman efektiä).
  const [edellinen, setEdellinen] = useState(vaihe);
  // Ensimmäisellä latauksella ei animaatiota (null).
  const [suunta, setSuunta] = useState<"eteen" | "taakse" | null>(null);
  if (edellinen !== vaihe) {
    setEdellinen(vaihe);
    setSuunta(vaiheet.indexOf(vaihe) >= vaiheet.indexOf(edellinen) ? "eteen" : "taakse");
    setPaikalliset({});
  }

  // Palvelimen virheet, joita ei ole vielä korjattu, ja vaiheen omat.
  const kuitattu = kuitatut.tila === state ? kuitatut.vaiheet : [];
  const palvelimenVirheet = Object.fromEntries(
    Object.entries(state.fieldErrors).filter(([k]) => !kuitattu.includes(KENTAN_VAIHE[k as ReviewField])),
  ) as Partial<Record<ReviewField, string>>;
  const virheet = { ...palvelimenVirheet, ...paikalliset };

  // Omat historiamerkinnät: takaisin-painike käyttää selaimen historiaa niin
  // kauan kuin niitä on, jotta painike ja takaisin-ele toimivat samoin.
  const syvyys = useRef(0);
  const vaiheRef = useRef(vaihe);
  const vaiheetRef = useRef(vaiheet);
  useEffect(() => {
    vaiheRef.current = vaihe;
    vaiheetRef.current = vaiheet;
  });

  useEffect(() => {
    function onPop() {
      const uusi = new URLSearchParams(window.location.search).get("vaihe");
      const i = vaiheetRef.current.indexOf(uusi as Vaihe);
      const j = vaiheetRef.current.indexOf(vaiheRef.current);
      if (i < j) syvyys.current = Math.max(0, syvyys.current - 1);
      else if (i > j) syvyys.current += 1;
    }
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Osoite vastaamaan näytettyä vaihetta (ensimmäinen lataus, rajattu vaihe).
  useEffect(() => {
    if (state.status === "success") return;
    if (haku.get("vaihe") !== vaihe || haku.has("ravintola")) {
      window.history.replaceState(null, "", osoite(vaihe));
    }
  }, [haku, vaihe, state.status]);

  // Uusi vaihe: alkuun ja fokus otsikkoon (ei ensimmäisellä latauksella).
  const ensimmainen = useRef(true);
  useEffect(() => {
    if (ensimmainen.current) {
      ensimmainen.current = false;
      return;
    }
    window.scrollTo({ top: 0 });
    document.getElementById(`vaihe-${vaihe}-otsikko`)?.focus({ preventScroll: true });
  }, [vaihe]);

  // Luonnos laitteelle jokaisen piirron jälkeen (piilokentät ovat silloin ajan
  // tasalla), kirjoitettaessa ja sivulta poistuttaessa (puhelu, sovelluksen vaihto).
  function tallennaLuonnos() {
    const form = formRef.current;
    if (!form || state.status === "success") return;
    const luonnos = luonnosLomakkeesta(new FormData(form), vaiheRef.current);
    kirjoita(LUONNOS_AVAIN, luonnosTyhja(luonnos.arvot) ? null : JSON.stringify(luonnos));
  }
  const tallennaRef = useRef(tallennaLuonnos);
  useEffect(() => {
    tallennaRef.current = tallennaLuonnos;
    tallennaLuonnos();
  });
  useEffect(() => {
    const tallenna = () => tallennaRef.current();
    const piilossa = () => document.visibilityState === "hidden" && tallenna();
    window.addEventListener("pagehide", tallenna);
    document.addEventListener("visibilitychange", piilossa);
    return () => {
      window.removeEventListener("pagehide", tallenna);
      document.removeEventListener("visibilitychange", piilossa);
    };
  }, []);
  const ajastin = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Palvelimen vastaus: onnistuessa luonnos pois, virheessä vaiheeseen, jossa virhe on.
  useEffect(() => {
    if (state.status === "success") {
      kirjoita(LUONNOS_AVAIN, null);
      window.scrollTo({ top: 0 });
      document.getElementById("arvostelu-kiitos")?.focus({ preventScroll: true });
      return;
    }
    if (state.status !== "error") return;
    const kohde = virheenVaihe(state.fieldErrors, vaiheetRef.current) ?? "lisaa";
    if (kohde !== vaiheRef.current) {
      window.history.pushState(null, "", osoite(kohde));
      syvyys.current += 1;
    }
    requestAnimationFrame(() => document.getElementById(`virheet-${kohde}`)?.focus());
  }, [state]);

  function siirry(kohde: Vaihe) {
    if (kohde === vaihe) return;
    window.history.pushState(null, "", osoite(kohde));
    syvyys.current += 1;
  }

  function takaisin() {
    if (indeksi <= 0) return;
    if (syvyys.current > 0) window.history.back();
    else window.history.replaceState(null, "", osoite(vaiheet[indeksi - 1]));
  }

  /** Vaiheen tarkistus ennen siirtymistä; palauttaa virheet (tyhjä = kunnossa). */
  function tarkista(v: Vaihe): Partial<Record<ReviewField, string>> {
    const tulos: Partial<Record<ReviewField, string>> = {};
    if (v === "kuka" && !vaiheValmis("kuka", edistyminen)) {
      tulos.nimi = "Valitse nimesi tai kirjoita se (vähintään 2 merkkiä).";
    }
    if (v === "ravintola") {
      if (ravintola === null) tulos.ravintola = "Valitse ravintola listasta tai lisää uusi.";
      if (ravintola === "uusi" && formRef.current) {
        const data = new FormData(formRef.current);
        const teksti = (k: string) => String(data.get(k) ?? "").trim();
        if (teksti("uusiNimi").length < 2) tulos.uusiNimi = "Kirjoita ravintolan nimi.";
        if (teksti("uusiKaupunki").length < 2) tulos.uusiKaupunki = "Kirjoita kaupunki, jossa ravintola on.";
        if (teksti("uusiMaa").length < 2) tulos.uusiMaa = "Kirjoita maa, esim. Suomi.";
      }
    }
    if (v === "arvosanat") {
      for (const { field } of RATING_FIELDS) {
        if (arvosanat[field] == null) tulos[field] = "Anna arvosana 1,0–5,0.";
      }
    }
    return tulos;
  }

  function seuraava() {
    const tulos = tarkista(vaihe);
    const ensimmainenVirhe = REVIEW_FIELDS.find((f) => tulos[f]);
    if (ensimmainenVirhe) {
      setPaikalliset(tulos);
      requestAnimationFrame(() => document.getElementById(reviewFieldId(ensimmainenVirhe))?.focus());
      return;
    }
    setKuitatut((k) => ({ tila: state, vaiheet: [...(k.tila === state ? k.vaiheet : []), vaihe] }));
    if (vaihe === "kuka") muista(arvostelija);
    const kohde = vaiheet[indeksi + 1];
    if (kohde) siirry(kohde);
  }

  function submit(formData: FormData) {
    // Esim. osoitteella ?vaihe=lisaa: keskeneräinen vaihe ensin.
    const kesken = vaiheet.find((v) => Object.keys(tarkista(v)).length > 0);
    if (kesken) {
      if (kesken === vaihe) seuraava();
      else siirry(kesken);
      return;
    }
    formData.delete(PHOTO_FIELD);
    formData.delete(PHOTO_ALT_FIELD);
    formData.delete(PHOTO_CONSENT_FIELD);
    photos.forEach((photo, index) => {
      if (!photo.blob) return;
      formData.append(PHOTO_FIELD, photo.blob, `kuva-${index + 1}.jpg`);
      formData.append(PHOTO_ALT_FIELD, photo.alt);
    });
    if (photoConsent) formData.set(PHOTO_CONSENT_FIELD, "1");
    muista(arvostelija);
    formAction(formData);
  }

  if (state.status === "success") {
    return (
      <Kuori otsikko="Arvostelu lähetetty">
        <div className="mx-auto flex w-full max-w-xl flex-col gap-8 px-4 py-10">
          <div id="arvostelu-kiitos" tabIndex={-1} role="status" className="focus:outline-none">
            <svg aria-hidden viewBox="0 0 24 24" className="size-14 text-success">
              <path
                fill="currentColor"
                d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20Zm4.2 6.3a1 1 0 0 0-1.4 0l-4.1 4.1-1.5-1.5a1 1 0 1 0-1.4 1.4l2.2 2.2a1 1 0 0 0 1.4 0l4.8-4.8a1 1 0 0 0 0-1.4Z"
              />
            </svg>
            <h1 className="mt-4 font-display text-[2rem] leading-tight text-heading">Kiitos arvostelusta!</h1>
            <p className="mt-3 text-[17px] leading-relaxed text-muted">
              {state.restaurantName && (
                <>
                  Arviosi ravintolasta <strong className="text-foreground">{state.restaurantName}</strong>{" "}
                  on vastaanotettu.{" "}
                </>
              )}
              {state.message}
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {/* Tavallinen linkki: täysi lataus aloittaa puhtaalta pöydältä. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/ravintolat/arvostele" className={ensisijainen}>
              Arvostele toinen ravintola
            </a>
            <Link href="/ravintolat" className={toissijainen}>
              Valmis
            </Link>
          </div>
          <KotinayttoVinkki />
        </div>
      </Kuori>
    );
  }

  const virheLista = REVIEW_FIELDS.filter((f) => palvelimenVirheet[f]);
  // Yhteenveto ensimmäiseen virheelliseen vaiheeseen; tekninen virhe tai
  // piilotetun vaiheen virhe (nimi muistettu) viimeiseen.
  const yhteenvedonVaihe = virheenVaihe(palvelimenVirheet, vaiheet) ?? "lisaa";
  const naytaYhteenveto = (v: Vaihe) =>
    state.status === "error" && v === yhteenvedonVaihe && (virheLista.length > 0 || kuitattu.length === 0);

  const otsikko =
    vaihe === "kuka" ? "Arvostelu" : (ravintolanNimi ?? (ravintola === "uusi" ? "Uusi ravintola" : "Arvostelu"));

  const vaiheenSisalto: Record<Vaihe, React.ReactNode> = {
    kuka: (
      <ArvostelijaValinta
        klubilaiset={klubilaiset}
        arvostelija={arvostelija}
        onChange={(a) => {
          setArvostelija(a);
          setPaikalliset(ilman("nimi"));
        }}
        onValittu={(valinta) => {
          // Muistetaan heti: keskeytynyt arvostelu jatkuu kysymättä nimeä uudelleen.
          muista(valinta);
          // Tila päivittyy samassa erässä, joten rajaus päästää eteenpäin.
          setKuitatut((k) => ({ tila: state, vaiheet: [...(k.tila === state ? k.vaiheet : []), "kuka"] }));
          siirry(vaiheet[indeksi + 1]);
        }}
        error={virheet.nimi}
      />
    ),
    ravintola: (
      <RestaurantPicker
        restaurants={restaurants}
        values={alku.arvot}
        errors={virheet}
        klubilainenId={arvostelija?.klubilainen || undefined}
        onChange={(valinta, nimi) => {
          setRavintola(valinta);
          setRavintolanNimi(nimi);
          setPaikalliset(ilman("ravintola"));
        }}
        onValittu={() => {
          setKuitatut((k) => ({ tila: state, vaiheet: [...(k.tila === state ? k.vaiheet : []), "ravintola"] }));
          siirry(vaiheet[indeksi + 1]);
        }}
      />
    ),
    arvosanat: (
      <RatingsField
        values={alku.arvot}
        errors={virheet}
        scores={arvosanat}
        onScore={(field, value) => {
          setArvosanat((prev) => ({ ...prev, [field]: value }));
          // Annettu arvosana poistaa kentän "Anna arvosana" -huomautuksen.
          setPaikalliset(ilman(field));
        }}
      />
    ),
    lisaa: (
      <div className="flex flex-col gap-4">
        <CommentField error={virheet.kommentti} defaultValue={alku.arvot.kommentti} />
        <PhotoPicker
          photos={photos}
          setPhotos={setPhotos}
          consent={photoConsent}
          setConsent={setPhotoConsent}
          error={virheet.kuvat}
        />
        <div className="flex flex-col gap-2">
          <KayntipaivaField error={virheet.kayntipaiva} defaultValue={alku.arvot.kayntipaiva} />
          {arvostelija && (
            <div className="flex min-h-12 items-center justify-between gap-3 rounded-sm border border-border bg-surface px-4 py-1">
              <p className="min-w-0 truncate text-[15px] text-foreground">
                <span className="text-muted">Arvostelija </span>
                <strong className="font-semibold">{arvostelija.nimi}</strong>
              </p>
              <button
                type="button"
                onClick={() => {
                  setKysyNimi(true);
                  siirry("kuka");
                }}
                aria-label={`Vaihda arvostelija, nyt ${arvostelija.nimi}`}
                className="-mr-2 min-h-11 shrink-0 rounded-sm px-3 text-sm font-semibold text-accent underline underline-offset-4 hover:text-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Vaihda
              </button>
            </div>
          )}
        </div>
        <p className="text-sm text-muted">
          Luemme arvostelut ennen julkaisua.{" "}
          <Link href="/tietosuoja" className="text-accent underline underline-offset-4">
            Tietosuoja
          </Link>
        </p>
      </div>
    ),
  };

  return (
    <form
      ref={formRef}
      action={submit}
      noValidate
      onInput={() => {
        clearTimeout(ajastin.current);
        ajastin.current = setTimeout(() => tallennaRef.current(), 400);
      }}
      onKeyDown={(e) => {
        // Enter tekstikentässä vie eteenpäin eikä lähetä keskeneräistä arvostelua.
        if (e.key !== "Enter" || e.defaultPrevented || !(e.target instanceof HTMLInputElement)) return;
        if (["button", "submit", "checkbox", "radio"].includes(e.target.type)) return;
        e.preventDefault();
        if (vaihe !== "lisaa") seuraava();
      }}
      className="contents"
    >
      {/* Lomakkeelle lähtevä arvostelija; vaihdettavissa ensimmäisestä ja viimeisestä vaiheesta. */}
      <input type="hidden" name="nimi" value={arvostelija?.nimi ?? ""} />
      <input type="hidden" name="klubilainen" value={arvostelija?.klubilainen ?? ""} />

      {/* Hunajapurkki. Piilotettu ruudunlukijalta ja näppäimistöltä, joten
          ainoastaan lomakkeita automaattisesti täyttävä botti osuu siihen. */}
      <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="arvostelu-verkkosivu">Verkkosivu</label>
        <input id="arvostelu-verkkosivu" name="verkkosivu" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <Kuori
        otsikko={otsikko}
        vaihe={{ nro: indeksi + 1, yhteensa: vaiheet.length }}
        onTakaisin={indeksi > 0 ? takaisin : undefined}
        alapalkki={
          vaihe === "lisaa" ? (
            <SubmitButton processingPhotos={processingPhotos} />
          ) : (
            <button type="button" onClick={seuraava} className={ensisijainen}>
              Seuraava
            </button>
          )
        }
      >
        {vaiheet.map((v, i) => (
          <section
            key={v}
            hidden={v !== vaihe}
            aria-labelledby={`vaihe-${v}-otsikko`}
            className={cn(
              "mx-auto w-full max-w-xl px-4 pb-4 pt-4",
              v === vaihe && suunta && (suunta === "eteen" ? "vaihe-eteen" : "vaihe-taakse"),
            )}
          >
            <h1
              id={`vaihe-${v}-otsikko`}
              tabIndex={-1}
              className="font-display text-[1.65rem] leading-tight text-heading focus:outline-none"
            >
              <span className="sr-only">
                Vaihe {i + 1}/{vaiheet.length}:{" "}
              </span>
              {VAIHEEN_OTSIKKO[v]}
            </h1>

            {luonnosIlmoitus && v === vaihe && (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-sm bg-blue-tint px-4 py-2.5 text-[15px] text-foreground">
                <span>Jatkat keskeneräistä arvostelua.</span>
                <span className="flex gap-4">
                  <button
                    type="button"
                    onClick={onAlusta}
                    className="min-h-11 font-semibold text-accent underline underline-offset-4"
                  >
                    Aloita alusta
                  </button>
                  <button
                    type="button"
                    onClick={() => setLuonnosIlmoitus(false)}
                    aria-label="Sulje ilmoitus"
                    className="min-h-11 px-1 font-semibold text-muted"
                  >
                    ✕
                  </button>
                </span>
              </div>
            )}

            {naytaYhteenveto(v) && (
              <div
                id={`virheet-${v}`}
                tabIndex={-1}
                role="alert"
                className="mt-4 rounded-sm border border-danger-border border-l-[3px] border-l-danger bg-danger-soft p-4 focus:outline-none"
              >
                <p className="font-semibold text-danger">{state.message}</p>
                {virheLista.length > 0 && (
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                    {virheLista.map((field) => (
                      <li key={field}>
                        <button
                          type="button"
                          onClick={() => {
                            const kohde = KENTAN_VAIHE[field];
                            if (kohde === "kuka") setKysyNimi(true);
                            siirry(kohde);
                            requestAnimationFrame(() => document.getElementById(reviewFieldId(field))?.focus());
                          }}
                          className="text-left text-danger underline underline-offset-4"
                        >
                          {REVIEW_FIELD_LABELS[field]}: {palvelimenVirheet[field]}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div className="mt-4">{vaiheenSisalto[v]}</div>
          </section>
        ))}
      </Kuori>
    </form>
  );
}

const ensisijainen =
  "inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-sm bg-primary px-6 text-base font-semibold " +
  "text-on-primary shadow-sm transition hover:bg-primary-hover hover:text-on-primary active:bg-primary-hover " +
  "disabled:cursor-wait disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
  "focus-visible:ring-offset-2";

const toissijainen =
  "inline-flex min-h-13 w-full items-center justify-center rounded-sm border border-border-strong bg-surface px-6 " +
  "text-base font-semibold text-foreground transition hover:border-accent hover:text-accent focus-visible:outline-none " +
  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

/**
 * Sovelluksen kehys: yläpalkki (takaisin, otsikko, vaihe, sulje) ja alapalkki
 * pysyvät paikallaan, sisältö niiden välissä. Puhelimen lovi ja kotipalkki
 * huomioidaan (safe-area, viewport-fit=cover sivulla).
 */
function Kuori({
  otsikko,
  vaihe,
  onTakaisin,
  alapalkki,
  children,
}: {
  otsikko: string;
  vaihe?: { nro: number; yhteensa: number };
  onTakaisin?: () => void;
  alapalkki?: React.ReactNode;
  children: React.ReactNode;
}) {
  const ikoni =
    "grid size-11 shrink-0 place-items-center rounded-full text-heading transition hover:bg-surface-strong " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 border-b border-border bg-surface pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex h-14 w-full max-w-xl items-center gap-1 px-2">
          {onTakaisin ? (
            <button type="button" onClick={onTakaisin} aria-label="Edellinen vaihe" className={ikoni}>
              <svg aria-hidden viewBox="0 0 24 24" className="size-6">
                <path
                  fill="currentColor"
                  d="M15.7 4.3a1 1 0 0 1 0 1.4L9.4 12l6.3 6.3a1 1 0 0 1-1.4 1.4l-7-7a1 1 0 0 1 0-1.4l7-7a1 1 0 0 1 1.4 0Z"
                />
              </svg>
            </button>
          ) : (
            <span aria-hidden className="size-11 shrink-0" />
          )}
          <div className="min-w-0 flex-1 text-center">
            <p className="truncate text-[15px] font-semibold text-heading">{otsikko}</p>
            {vaihe && (
              <p aria-hidden className="text-xs text-muted">
                Vaihe {vaihe.nro}/{vaihe.yhteensa}
              </p>
            )}
          </div>
          <Link href="/ravintolat" aria-label="Sulje arvostelu" className={ikoni}>
            <svg aria-hidden viewBox="0 0 24 24" className="size-6">
              <path
                fill="currentColor"
                d="M6.3 6.3a1 1 0 0 1 1.4 0L12 10.6l4.3-4.3a1 1 0 1 1 1.4 1.4L13.4 12l4.3 4.3a1 1 0 0 1-1.4 1.4L12 13.4l-4.3 4.3a1 1 0 0 1-1.4-1.4l4.3-4.3-4.3-4.3a1 1 0 0 1 0-1.4Z"
              />
            </svg>
          </Link>
        </div>
        {vaihe && (
          <div aria-hidden className="h-1 bg-border">
            <div
              className="h-full bg-brass transition-[width] duration-300 motion-reduce:transition-none"
              style={{ width: `${(vaihe.nro / vaihe.yhteensa) * 100}%` }}
            />
          </div>
        )}
      </header>

      {/* clip: liukuva vaihe ei saa levittää sivua (puhelin loitontaisi näkymän).
          Toisin kuin hidden, clip ei riko yläpalkin ja alapalkin kiinnitystä. */}
      <div className="flex flex-1 flex-col overflow-x-clip">{children}</div>

      {alapalkki && (
        <footer className="sticky bottom-0 z-20 border-t border-border bg-surface px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="mx-auto w-full max-w-xl">{alapalkki}</div>
        </footer>
      )}
    </div>
  );
}

function SubmitButton({ processingPhotos }: { processingPhotos: boolean }) {
  const { pending } = useFormStatus();
  const busy = pending || processingPhotos;
  return (
    <button type="submit" disabled={busy} aria-disabled={busy} className={ensisijainen}>
      {busy && <Spinner />}
      {pending ? "Lähetetään…" : processingPhotos ? "Käsitellään kuvia…" : "Lähetä arvostelu"}
    </button>
  );
}

function Spinner() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="size-4 animate-spin motion-reduce:animate-none">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeOpacity=".3" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
