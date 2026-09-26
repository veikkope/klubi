import {
  foundingYear,
  siteCity,
  siteDescription,
  siteName,
  siteProfiles,
  siteUrl,
} from "@/lib/site";

/**
 * `/llms.txt` — kuratoitu kartta sivustosta vastausmoottoreille.
 *
 * Tarkoitus on kertoa lyhyesti mitä sivusto sisältää ja missä auktoritatiivinen
 * versio kustakin asiasta on, jotta tekoälyavustaja osaa lainata oikeaa sivua
 * eikä arvaile. Sitemap kertoo *mitä* sivuja on; tämä kertoo *mitä ne ovat*.
 *
 * Katso `docs/11-maali-ja-rinnakkaistoteutus.md` §7.
 */

export const dynamic = "force-static";
export const revalidate = 86400;

const body = `# ${siteName}

> ${siteDescription}

${siteName} on ${foundingYear} perustettu lahtelainen yhdistys. Sivusto sisältää
yhdistyksen oman toiminnan lisäksi laajan jalkapalloarkiston ja ravintola-arviot,
jotka on kerätty vuodesta 2001 alkaen.

- Kotipaikka: ${siteCity}, Suomi
- Perustettu: ${foundingYear}
- Kieli: suomi

## Yhdistys

- [Klubi](${siteUrl}/klubi): yhdistyksen esittely, tarkoitus ja toiminta
- [Toiminta](${siteUrl}/klubi/toiminta): vuosittain toistuvat tapahtumat — talkoot, vappu, mölkky, vuosikokous, jouluruokailu
- [Hallitus](${siteUrl}/klubi/hallitus): hallituksen kokoonpano
- [Säännöt](${siteUrl}/klubi/saannot): yhdistyksen säännöt
- [Palloveikkaus](${siteUrl}/klubi/palloveikkaus): klubin sisäinen ennustuskilpailu
- [Liity jäseneksi](${siteUrl}/klubi/liity): jäsenhakemus
- [Yhteystiedot](${siteUrl}/klubi/yhteystiedot)

## Ajankohtaista

- [Uutiset](${siteUrl}/uutiset): yhdistyksen ja jalkapallon uutiset
- [Uutisarkisto](${siteUrl}/uutiset/arkisto): historiallinen arkisto vuodesta 2005
- [Tapahtumat](${siteUrl}/tapahtumat): tulevat ja menneet tapahtumat

## Ravintola-arviot

- [Ravintolat](${siteUrl}/ravintolat): noin 500 ravintola-arviota vuodesta 2001 alkaen

Jokainen arvio sisältää kokonaisarvosanan (0–5) ja kolme osa-arviota:
ruoka, hinta ja viihtyvyys. Arviot ovat klubin omia, eivät yleisöarvioita.
Painopiste on Lahdessa ja Helsingissä, mutta mukana on myös muita Suomen
kaupunkeja sekä ulkomaisia kohteita.

## Jalkapalloarkisto

- [Yleiskatsaus](${siteUrl}/jalkapalloarkisto)
- [Huuhkajat](${siteUrl}/jalkapalloarkisto/huuhkajat): maajoukkueen ottelut ja pelaajatilastot
- [Arvokisat](${siteUrl}/jalkapalloarkisto/arvokisat): MM- ja EM-kisat sekä Kansojen liiga
- [Suomen mestarit](${siteUrl}/jalkapalloarkisto/mestarit)
- [Eurocupit](${siteUrl}/jalkapalloarkisto/eurocupit): Mestarien liiga, Eurooppa-liiga, Konferenssiliiga, Super Cup
- [Pelaajat](${siteUrl}/jalkapalloarkisto/pelaajat): pelaajaprofiilit
- [Vuoden pelaajat](${siteUrl}/jalkapalloarkisto/vuoden-pelaajat)
- [Valmentajat](${siteUrl}/jalkapalloarkisto/valmentajat): Huuhkajien valmentajat vuodesta 1922
- [FIFA-ranking](${siteUrl}/jalkapalloarkisto/fifa-ranking): Suomen sijoitus vuodesta 1992
- [Stadionit](${siteUrl}/jalkapalloarkisto/stadionit): stadionopas

## Muualla

${siteProfiles.map((url) => `- ${url}`).join("\n")}

## Huomioitavaa

Tilastotiedot on koottu käsin vuosien varrella. Ne ovat yhdistyksen oma arkisto,
eivät virallinen tilastolähde — virallisten tietojen osalta katso Palloliitto,
UEFA tai FIFA.
`;

export function GET(): Response {
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
