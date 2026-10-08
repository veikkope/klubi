import { useState } from "react";
import { Box, Stack, Text } from "@sanity/ui";
import type { DocumentActionComponent, DocumentActionProps, SanityDocumentLike } from "sanity";

import { poistonVaroitus, tyhjennaKopiosta, type PoistonVaroitus } from "../../lib/ohjaukset";

/**
 * Poiston turva ja Kopioi pohjaksi (docs/24 askel 9, docs/23 Y20).
 *
 * Kumpikin kääre kutsuu alkuperäisen toiminnon aina (sen hookit pysyvät
 * samoina, kuten lukittu-sivu.tsx). Lukitulla sivulla järjestys on
 * `lukitulleSivulle(varoitaVanhoistaOsoitteista(t))` ja
 * `lukitulleSivulle(kopioiPohjaksi(t))`, joten lukitus voittaa aina.
 */

/**
 * Sama kääre samalle toiminnolle: Sanity tunnistaa toiminnon funktion
 * perusteella, ja uusi funktio joka kutsulla nollaisi toiminnon tilan
 * (esim. avoimen dialogin).
 */
function muistettu(
  muisti: WeakMap<DocumentActionComponent, DocumentActionComponent>,
  alkuperainen: DocumentActionComponent,
  tee: () => DocumentActionComponent,
): DocumentActionComponent {
  const vanha = muisti.get(alkuperainen);
  if (vanha) return vanha;
  const uusi = tee();
  muisti.set(alkuperainen, uusi);
  return uusi;
}

const varoitukset = new WeakMap<DocumentActionComponent, DocumentActionComponent>();
const kopiot = new WeakMap<DocumentActionComponent, DocumentActionComponent>();

/* -------------------------------------------------------------------------- */
/* Poisto ja Poista julkaisu                                                  */
/* -------------------------------------------------------------------------- */

function OsoiteRivi({ osoite, lisa }: { osoite: string; lisa?: string }) {
  return (
    <Box as="li" style={{ display: "list-item" }}>
      <Text size={1}>
        <code>{osoite}</code>
        {lisa ? ` ${lisa}` : null}
      </Text>
    </Box>
  );
}

function Viesti({ varoitus, poisto }: { varoitus: PoistonVaroitus; poisto: boolean }) {
  const { nykyinen, vanhat, muita } = varoitus;
  const lista = { margin: 0, paddingLeft: "1.5em" };
  return (
    <Stack space={4}>
      <Text size={1} weight="semibold">
        Nykyinen osoite: <code>{nykyinen}</code>
      </Text>
      <Text size={1}>
        Vanhat osoitteet (alla) ohjautuvat tähän osoitteeseen. Kun tämä poistuu sivustolta, ne kaikki johtavat
        &quot;Sivua ei löytynyt&quot; -sivulle, ellet tee ohjausta.
      </Text>
      <Stack as="ul" space={2} style={{ ...lista, listStyleType: "disc" }}>
        <OsoiteRivi osoite={nykyinen} lisa="(nykyinen osoite)" />
        {vanhat.map((osoite) => (
          <OsoiteRivi key={osoite} osoite={osoite} />
        ))}
        {muita > 0 ? (
          <Box as="li" style={{ display: "list-item" }}>
            <Text size={1}>ja {muita} muuta</Text>
          </Box>
        ) : null}
      </Stack>
      <Text size={1}>Jos sisältö on siirtynyt toiselle sivulle:</Text>
      <Stack as="ol" space={2} style={{ ...lista, listStyleType: "decimal" }}>
        <Box as="li" style={{ display: "list-item" }}>
          <Text size={1}>
            {poisto
              ? "Paina Poista silti. Sanityn oma ikkuna \"Poista dokumentti?\" avautuu vielä: paina siinä Poista nyt."
              : "Paina Poista julkaisu silti. Sanityn oma ikkuna \"Peruuta dokumentin julkaisu?\" avautuu vielä: paina siinä Peruuta julkaisu nyt."}
          </Text>
        </Box>
        <Box as="li" style={{ display: "list-item" }}>
          <Text size={1}>
            Tee heti ohjaus osoitteesta <code>{nykyinen}</code> uuteen sivuun: Sivuston asetukset → Ohjaukset
            ja lyhytosoitteet → Lyhytosoitteet ja ohjaukset → +. Osoite vapautuu ohjaukselle muutamassa sekunnissa.
            Yksi ohjaus riittää, koska vanhat osoitteet kulkevat tämän osoitteen kautta.
          </Text>
        </Box>
      </Stack>
    </Stack>
  );
}

/**
 * Poisto ja Poista julkaisu varoittavat, jos dokumenttiin ohjautuu vanhoja
 * osoitteita (K3): dialogi näyttää ensin nykyisen osoitteen, koska staattiset
 * ohjaukset ja aiemmat osoitteet vievät siihen, ja ohjaus tehdään juuri siitä
 * poiston jälkeen (ennen poistoa osoitteessa on vielä sivu). Vahvistuksen
 * jälkeen Sanityn oma dialogi (viittaukset) avautuu perään.
 */
export function varoitaVanhoistaOsoitteista(alkuperainen: DocumentActionComponent): DocumentActionComponent {
  return muistettu(varoitukset, alkuperainen, () => varoitusKaare(alkuperainen));
}

function varoitusKaare(alkuperainen: DocumentActionComponent): DocumentActionComponent {
  const Kaare: DocumentActionComponent = (props: DocumentActionProps) => {
    // Dialogi on auki sille varoitukselle, jolle se avattiin. Jos toiminto
    // estyy tai osoitteet muuttuvat kesken (esim. toinen käyttäjä julkaisee),
    // dialogi sulkeutuu itsestään eikä vahvista vanhentunutta tietoa.
    const [avattu, setAvattu] = useState<string | null>(null);
    const tulos = alkuperainen(props);
    // Vain julkaistu versio: koskaan julkaisemattomaan ei ohjaudu mitään.
    const varoitus = poistonVaroitus(props.published as Record<string, unknown> | null);
    const avain = varoitus ? JSON.stringify(varoitus) : null;
    const estetty = !tulos || Boolean(tulos.disabled) || !tulos.onHandle;
    // Tilan nollaus renderöinnin aikana (Reactin suosittama tapa johdetulle
    // tilalle, ei efektiä): ei jää odottamaan uudelleen aukeamista.
    if (avattu !== null && (estetty || avattu !== avain)) setAvattu(null);
    if (!tulos || tulos.disabled || !tulos.onHandle || !varoitus || !avain) return tulos;
    const auki = avattu === avain;
    const poisto = alkuperainen.action === "delete";
    const jatka = tulos.onHandle;
    return {
      ...tulos,
      onHandle: () => setAvattu(avain),
      dialog: auki
        ? {
            type: "confirm",
            tone: "critical",
            message: <Viesti varoitus={varoitus} poisto={poisto} />,
            confirmButtonText: poisto ? "Poista silti" : "Poista julkaisu silti",
            cancelButtonText: "Peruuta",
            onCancel: () => setAvattu(null),
            onConfirm: () => {
              setAvattu(null);
              jatka();
            },
          }
        : tulos.dialog,
    };
  };
  Kaare.action = alkuperainen.action;
  Kaare.displayName = `VanhatOsoitteet(${alkuperainen.displayName ?? alkuperainen.action ?? "toiminto"})`;
  return Kaare;
}

/* -------------------------------------------------------------------------- */
/* Kopioi pohjaksi                                                            */
/* -------------------------------------------------------------------------- */

type KopioProps = DocumentActionProps & { mapDocument?: (doc: SanityDocumentLike) => SanityDocumentLike };

/** Vakaa funktio: uusi funktio joka renderöinnillä purkaisi toiminnon muistin. */
const pohjaksi = (doc: SanityDocumentLike) => tyhjennaKopiosta(doc as SanityDocumentLike & Record<string, unknown>);

/**
 * Sanityn Kopioi muodossa "Kopioi pohjaksi": kopio ei saa osoitetta, vanhan
 * sivuston tai blogin tietoja, aiempia osoitteita, tarkistuslippuja,
 * ravintolan laskettua arvosanaa eikä uutisen julkaisuaikaa
 * (`KOPIOSTA_POISTETTAVAT`, lib/ohjaukset.ts).
 *
 * `mapDocument` on Sanityn DuplicateActionin @beta-ominaisuus: tarkista se
 * Sanityn pääversiopäivityksessä (docs/07).
 */
export function kopioiPohjaksi(alkuperainen: DocumentActionComponent): DocumentActionComponent {
  return muistettu(kopiot, alkuperainen, () => kopioKaare(alkuperainen));
}

function kopioKaare(alkuperainen: DocumentActionComponent): DocumentActionComponent {
  const kopioi = alkuperainen as unknown as (props: KopioProps) => ReturnType<DocumentActionComponent>;
  const Kaare: DocumentActionComponent = (props) => {
    const tulos = kopioi({ ...props, mapDocument: pohjaksi });
    if (!tulos) return tulos;
    if (tulos.disabled) return tulos;
    return {
      ...tulos,
      label: "Kopioi pohjaksi",
      title:
        "Tekee kopion samalla sisällöllä ilman osoitetta ja vanhan sivuston tietoja. Anna kopiolle oma otsikko " +
        "ja paina osoitteen kohdalla Luo ennen julkaisua." +
        (props.type === "uutinen" ? " Valitse myös Julkaisuaika." : ""),
    };
  };
  Kaare.action = alkuperainen.action;
  Kaare.displayName = `KopioiPohjaksi(${alkuperainen.displayName ?? alkuperainen.action ?? "toiminto"})`;
  return Kaare;
}
