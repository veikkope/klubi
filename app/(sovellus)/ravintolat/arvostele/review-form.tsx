"use client";

import { useActionState, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";

import { cn } from "@/lib/cn";
import { PHOTO_ALT_FIELD, PHOTO_CONSENT_FIELD, PHOTO_FIELD } from "@/lib/arvostelukuvat";
import type { KlubilainenOption, RavintolaOption, TuoreArvostelu } from "@/sanity/lib/queries/ravintolat";
import { paivitaTuoreet, submitReview } from "./actions";
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
import { KayntipaivaField } from "./kayntipaiva";
import { CommentField, formatScore, RatingsField, yhteenvetoRivi } from "./kentat";
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
import { TIETOSUOJA_PATH } from "@/lib/path";

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
 * - Vaihe on tämän komponentin oma tila. Osoite (?vaihe=arvosanat) ja selaimen
 *   historia (`pushState`, `popstate`) vain heijastavat sitä, joten puhelimen
 *   takaisin-ele siirtyy edelliseen vaiheeseen eikä pois sivulta. Vaihe ei
 *   riipu Next.js:n reitittimen tilasta (useSearchParams): reitittimen omat
 *   päivitykset eivät voi palauttaa sitä vanhaksi kesken vaihdon.
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

/** Valinnan korostus ennen siirtymää: käyttäjä näkee, mitä napautti. */
const VAHVISTUS_MS = 180;

/**
 * Lähetys palvelimelle. Verkkokatkos ei kaada näkymää virhesivulle: arvostelu
 * (ja kuvat muistissa) säilyy, ja käyttäjä voi yrittää uudelleen samasta kohdasta.
 */
async function laheta(edellinen: ReviewFormState, data: FormData): Promise<ReviewFormState> {
  const katkos: ReviewFormState = {
    status: "error",
    message:
      "Ei verkkoyhteyttä. Arvostelusi on tallessa: lähetä uudelleen, kun yhteys toimii.",
    fieldErrors: {},
    values: edellinen.values,
  };
  if (!navigator.onLine) return katkos;
  try {
    return await submitReview(edellinen, data);
  } catch (error) {
    console.error("[arvostelu] lähetys epäonnistui:", error);
    return katkos;
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
  /** Viimeksi arvostellut ravintolat, uusin ensin (page.tsx). */
  tuoreet: TuoreArvostelu[];
  /** Klubilaisten odottavat uuden ravintolan ehdotukset (haku löytää ne). */
  ehdotukset: TuoreArvostelu[];
  defaultRestaurantId?: string;
};

export function ReviewForm(props: Props) {
  const selaimessa = useSyncExternalStore(eiTilausta, () => true, () => false);
  // "Aloita alusta": uusi avain piirtää arvostelun tyhjästä ilman sivun latausta.
  const [kierros, setKierros] = useState(0);

  // Sovellusnäkymä alkaa aina ylhäältä. Tultaessa alas vieritetyltä sivulta
  // (esim. odottavien listan Arvostele) Next.js:n oma vieritys alkuun ehti
  // tapahtua ennen kuin selaimessa piirretty näkymä oli paikallaan, ja sivu
  // jäi vieritetyksi (productionissa 4.10.2026). Ennen piirtoa, ei animaatiota.
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);
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
  tuoreet,
  ehdotukset,
  defaultRestaurantId,
  onAlusta,
}: Props & { onAlusta: () => void }) {
  const [state, formAction] = useActionState<ReviewFormState, FormData>(laheta, INITIAL_REVIEW_STATE);
  const formRef = useRef<HTMLFormElement>(null);

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

  // Pyydetty vaihe: osoitteesta latauksessa, sitten siirtymistä ja takaisin-eleistä.
  const [pyydetty, setPyydetty] = useState<Vaihe | null>(() => {
    const osoitteessa = new URLSearchParams(window.location.search).get("vaihe");
    return onVaihe(osoitteessa) ? osoitteessa : (alku.luonnos?.vaihe ?? null);
  });

  const vaiheet = naytettavat(kysyNimi);
  const edistyminen: Edistyminen = { arvostelija, ravintola, arvosanat };
  const toivottu = pyydetty ?? vaiheet[0];
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

  // Palvelimen virhe: vaiheeseen, jossa virhe on (tila edellisestä piirrosta).
  const [kasitelty, setKasitelty] = useState(state);
  if (kasitelty !== state) {
    setKasitelty(state);
    if (state.status === "error") setPyydetty(virheenVaihe(state.fieldErrors, vaiheet) ?? "lisaa");
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

  // Selaimen takaisin- ja eteen-ele: vaihe osoitteesta omaan tilaan.
  useEffect(() => {
    function onPop() {
      const uusi = new URLSearchParams(window.location.search).get("vaihe");
      const i = vaiheetRef.current.indexOf(uusi as Vaihe);
      const j = vaiheetRef.current.indexOf(vaiheRef.current);
      if (i < j) syvyys.current = Math.max(0, syvyys.current - 1);
      else if (i > j) syvyys.current += 1;
      setPyydetty(onVaihe(uusi) ? uusi : null);
    }
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Osoite vastaamaan näytettyä vaihetta (ensimmäinen lataus, rajattu vaihe,
  // palvelimen virhe). Korvaa nykyisen merkinnän; uudet merkinnät tekee siirry().
  useEffect(() => {
    if (state.status === "success") return;
    const nyt = new URLSearchParams(window.location.search);
    if (nyt.get("vaihe") !== vaihe || nyt.has("ravintola")) {
      window.history.replaceState(null, "", osoite(vaihe));
    }
  }, [vaihe, state.status]);

  // Ravintolavaiheen lista (viimeksi arvioidut, ehdotukset) ajan tasalle, kun
  // vaiheeseen tullaan tai puhelin palaa taustalta: saman illan muiden juuri
  // lähettämät arvostelut näkyvät ilman sivun latausta. Palvelintoiminto
  // palauttaa pelkän datan eikä koske reitittimeen tai osoitteeseen.
  // Korkeintaan kerran 15 sekunnissa; virhe jättää vanhan listan.
  const [lista, setLista] = useState({ tuoreet, ehdotukset });
  const paivitetty = useRef(0);
  useEffect(() => {
    const paivita = () => {
      if (vaiheRef.current !== "ravintola" || Date.now() - paivitetty.current < 15_000) return;
      paivitetty.current = Date.now();
      paivitaTuoreet()
        .then(setLista)
        .catch((error) => console.warn("[arvostelu] listan päivitys epäonnistui:", error));
    };
    if (vaihe === "ravintola") {
      // Ensimmäinen lataus toi tuoreen datan jo mukanaan.
      if (paivitetty.current === 0) paivitetty.current = Date.now();
      else paivita();
    }
    const nakyvissa = () => document.visibilityState === "visible" && paivita();
    document.addEventListener("visibilitychange", nakyvissa);
    return () => document.removeEventListener("visibilitychange", nakyvissa);
  }, [vaihe]);

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
    // Vaihe vaihtui jo piirrossa (kasitelty); osoite päivittyy omassa efektissään.
    const kohde = virheenVaihe(state.fieldErrors, vaiheetRef.current) ?? "lisaa";
    requestAnimationFrame(() => document.getElementById(`virheet-${kohde}`)?.focus());
  }, [state]);

  /** Uuteen vaiheeseen: oma tila heti, osoitteeseen uusi historiamerkintä. */
  function siirry(kohde: Vaihe) {
    if (kohde === vaiheRef.current) return;
    setPyydetty(kohde);
    window.history.pushState(null, "", osoite(kohde));
    syvyys.current += 1;
  }

  /** Edelliseen vaiheeseen: selaimen historian kautta, jos tämä sivu teki merkinnän. */
  function takaisin() {
    if (indeksi <= 0) return;
    if (syvyys.current > 0) {
      window.history.back();
    } else {
      const kohde = vaiheet[indeksi - 1];
      setPyydetty(kohde);
      window.history.replaceState(null, "", osoite(kohde));
    }
  }

  /** Aiempaan vaiheeseen (yhteenvedon "Muuta"): edellinen historian kautta. */
  function palaa(kohde: Vaihe) {
    if (vaiheet.indexOf(kohde) === indeksi - 1) takaisin();
    else siirry(kohde);
  }

  /**
   * Nimivaiheeseen. Nimivaihe lisätään vaiheisiin vasta nyt (muistettu nimi),
   * joten siirrytään aina uudella historiamerkinnällä: takaisin palaa siihen
   * vaiheeseen, josta Vaihda painettiin.
   */
  function vaihdaArvostelija() {
    setKysyNimi(true);
    siirry("kuka");
  }

  // Napautuksella valittu (nimi, ravintola) korostuu hetken ennen siirtymää.
  const etenee = useRef(false);
  function etene(valmis: Vaihe) {
    if (etenee.current) return;
    etenee.current = true;
    setKuitatut((k) => ({ tila: state, vaiheet: [...(k.tila === state ? k.vaiheet : []), valmis] }));
    const kohde = vaiheet[vaiheet.indexOf(valmis) + 1];
    setTimeout(() => {
      etenee.current = false;
      if (kohde) siirry(kohde);
    }, VAHVISTUS_MS);
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
    if (vaihe === "ravintola" && ravintola === "uusi" && formRef.current) {
      const nimi = String(new FormData(formRef.current).get("uusiNimi") ?? "").trim();
      setRavintolanNimi(nimi || null);
    }
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
    const keskiarvoLahetetty = RATING_FIELDS.every(({ field }) => arvosanat[field] != null)
      ? RATING_FIELDS.reduce((summa, { field }) => summa + (arvosanat[field] ?? 0), 0) / RATING_FIELDS.length
      : null;
    return (
      <Kuori otsikko="Arvostelu lähetetty">
        <div className="mx-auto flex w-full max-w-xl flex-col gap-8 px-4 py-10">
          <div id="arvostelu-kiitos" tabIndex={-1} role="status" className="focus:outline-none">
            <svg aria-hidden viewBox="0 0 24 24" className="kuittaus size-16 text-success">
              <path
                fill="currentColor"
                d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20Zm4.2 6.3a1 1 0 0 0-1.4 0l-4.1 4.1-1.5-1.5a1 1 0 1 0-1.4 1.4l2.2 2.2a1 1 0 0 0 1.4 0l4.8-4.8a1 1 0 0 0 0-1.4Z"
              />
            </svg>
            <h1 className="mt-5 font-display text-[2rem] leading-tight text-heading">Kiitos, arvostelu on perillä</h1>
            {/* Vahvistus siitä, mitä lähti. */}
            <div className="mt-6 flex items-center justify-between gap-4 rounded-sm border border-border border-l-[3px] border-l-brass bg-surface px-4 py-3">
              <div className="min-w-0">
                <p className="truncate font-semibold text-heading">{state.restaurantName ?? ravintolanNimi}</p>
                {arvostelija && <p className="text-sm text-muted">Arvostelija {arvostelija.nimi}</p>}
              </div>
              {keskiarvoLahetetty !== null && (
                <p className="shrink-0 font-display text-2xl font-semibold tabular-nums text-brass-text">
                  {formatScore(keskiarvoLahetetty)}
                  <span className="font-sans text-sm font-normal text-muted"> / 5</span>
                </p>
              )}
            </div>
            <p className="mt-5 text-[17px] leading-relaxed text-muted">{state.message}</p>
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

  const keskiarvo = RATING_FIELDS.every(({ field }) => arvosanat[field] != null)
    ? RATING_FIELDS.reduce((summa, { field }) => summa + (arvosanat[field] ?? 0), 0) / RATING_FIELDS.length
    : null;

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
          etene("kuka");
        }}
        error={virheet.nimi}
      />
    ),
    ravintola: (
      <>
        {arvostelija && (
          // Väärän nimen napautus huomataan heti: nimi näkyy ja sen voi vaihtaa.
          <p className="-mt-2 mb-3 flex flex-wrap items-center gap-x-1 text-[15px] text-muted">
            Arvostelijana <strong className="font-semibold text-foreground">{arvostelija.nimi}</strong>
            <span aria-hidden>·</span>
            <button
              type="button"
              onClick={vaihdaArvostelija}
              aria-label={`Vaihda arvostelija, nyt ${arvostelija.nimi}`}
              className="-my-2 min-h-11 rounded-sm px-1 font-semibold text-accent underline underline-offset-4 hover:text-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Vaihda
            </button>
          </p>
        )}
        <RestaurantPicker
          restaurants={restaurants}
          tuoreet={lista.tuoreet}
          ehdotukset={lista.ehdotukset}
          values={alku.arvot}
          errors={virheet}
          klubilainenId={arvostelija?.klubilainen || undefined}
          onChange={(valinta, nimi) => {
            setRavintola(valinta);
            setRavintolanNimi(nimi);
            setPaikalliset(ilman("ravintola"));
          }}
          onValittu={() => etene("ravintola")}
        />
      </>
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
      <div className="flex flex-col gap-3.5">
        <CommentField error={virheet.kommentti} defaultValue={alku.arvot.kommentti} />
        <PhotoPicker
          photos={photos}
          setPhotos={setPhotos}
          consent={photoConsent}
          setConsent={setPhotoConsent}
          error={virheet.kuvat}
        />
        {/* Tarkistus ennen lähetystä: mitä lähtee, ja jokaista voi muuttaa. */}
        <section aria-labelledby="yhteenveto-otsikko">
          <h2 id="yhteenveto-otsikko" className="sr-only">
            Yhteenveto
          </h2>
          <div className="divide-y divide-border overflow-hidden rounded-sm border border-border bg-surface">
            <button type="button" onClick={() => palaa("ravintola")} className={yhteenvetoRivi}>
              <span className="w-24 shrink-0 text-sm text-muted">Ravintola</span>
              <span className="min-w-0 flex-1 truncate text-[15px] font-semibold text-foreground">
                {ravintolanNimi ?? "Uusi ravintola"}
                {ravintola === "uusi" && <span className="font-normal text-muted"> (uusi)</span>}
              </span>
              <Muuta mita="ravintolaa" />
            </button>
            <button type="button" onClick={() => palaa("arvosanat")} className={yhteenvetoRivi}>
              <span className="w-24 shrink-0 text-sm text-muted">Arvosana</span>
              <span className="min-w-0 flex-1">
                <span className="font-display text-lg font-semibold tabular-nums text-brass-text">
                  {keskiarvo !== null ? formatScore(keskiarvo) : "–"}
                </span>
                <span className="text-sm text-muted"> / 5</span>
                {/* Osa-arvosanat ruudunlukijalle; näkyvissä Muuta-napautuksella. */}
                <span className="sr-only">
                  {RATING_FIELDS.map(({ field }) =>
                    `, ${REVIEW_FIELD_LABELS[field]} ${arvosanat[field] != null ? formatScore(arvosanat[field]) : "–"}`,
                  ).join("")}
                </span>
              </span>
              <Muuta mita="arvosanoja" />
            </button>
            <KayntipaivaField error={virheet.kayntipaiva} defaultValue={alku.arvot.kayntipaiva} />
            {arvostelija && (
              <button type="button" onClick={vaihdaArvostelija} className={yhteenvetoRivi}>
                <span className="w-24 shrink-0 text-sm text-muted">Arvostelija</span>
                <span className="min-w-0 flex-1 truncate text-[15px] font-semibold text-foreground">
                  {arvostelija.nimi}
                </span>
                <Muuta mita="arvostelijaa" />
              </button>
            )}
          </div>
        </section>
        <p className="text-sm text-muted">
          Luemme arvostelut ennen julkaisua.{" "}
          <Link href={TIETOSUOJA_PATH} className="text-accent underline underline-offset-4">
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

function Muuta({ mita }: { mita: string }) {
  return (
    <span className="shrink-0 text-sm font-semibold text-accent">
      Muuta<span className="sr-only"> {mita}</span>
    </span>
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
