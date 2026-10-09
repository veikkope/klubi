# Lahden Suomalainen Klubi ry — Claude Code -ohje

Tämä on hakemisto, ei käsikirja. Pidä alle 80 rivin. Komennot ovat `docs/runbooks/`-kansiossa, yleiset työnkulut `tyokalut`-pluginissa, klubin agentit `.claude/agents/`-kansiossa.

## Tavoite

Moderni, elegantti sivusto Lahden Suomalainen Klubi ry:lle. Yhdistyksen sihteeri (käyttäjän isä) päivittää sitä **ilman koodausta** Sanity Studiossa. Sisältö on siirretty vanhalta `lahdensuomalainenklubi.com`-sivustolta ja Blogspot-blogista.

## Pino

Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 · Sanity CMS, Studio `/studio` · Vercel · Node 25 kehitykseen. Perustelut: `docs/03-cms-decision.md`. Lue Next.js-ohjeet `node_modules/next/dist/docs/`-kansiosta ennen koodia.

## Ehdottomat säännöt

1. **Production on isän.** Kehitys ja migraatiot kirjoittavat `development`-datasettiin. Productioniin vain dokumenttikohtainen patch tai `--missing`/`createIfNotExists`, aina varmuuskopion (`npm run backup`) jälkeen, **ei koskaan `--replace`**. **Käyttäjä ajaa tuotantokomennot itse `!`-etuliitteellä**; Claude tekee kuivaharjoituksen ja valmistelee komennot (skill `tyokalut:vie-tuotantoon`, `docs/runbooks/tuotantomuutokset.md`). Huom: paikallinen `.env.local` osoittaa productioniin (`docs/runbooks/ymparistot.md`).
2. **Sisältö Sanityssa, ei koodissa.** Otsikot, tekstit, kuvat, valikot Studiosta. Vain UI-tekstit ("Lataa lisää") saa kirjoittaa komponenttiin. Sisältökuvat Sanityyn, ei `public/`-kansioon.
3. **Skeemat ovat tiukkoja.** Pakolliset kentät, validointisäännöt, suomenkieliset kenttänimet, kuvaukset ja virheilmoitukset. Isä ei saa joutua arvailemaan. Ei featurea ilman skeemaa: ensin skeema, sitten reitti.
4. **Kaikki suomeksi** käyttöliittymässä, Studion kentissä ja virheilmoituksissa.
5. **Saavutettavuus WCAG 2.1 AA.** Kaikilla kuvilla `alt`, kontrastit AA, näppäimistö toimii.
6. **Vanhat URL:t ohjataan 301:llä.** Jokainen vanha `.htm`-osoite ohjautuu järkevään kohteeseen (`lib/redirects.ts`, generoidaan Sanitysta ja `data/crawl-status.tsv`:stä). Uusi dynaaminen reitti: puuttuvalle sisällölle `return ohjaaTaiEiLoydy(polku)` (`sanity/lib/ohjaus.ts`), ei `notFound()` (`npm run test:ohjaukset` valvoo). `docs/runbooks/seo.md`.
7. **Studio- tai skeemamuutoksen jälkeen `npm run savutesti:studio` ennen pushia.** Type-check, testit, `sanity schema validate` ja build eivät näe Studion ajonaikaisia kaatumisia (8.10.2026 kaksi pääsi tuotantoon).
8. **Sääntö testiksi** (`scripts/test-*.ts`, mukaan `npm test`iin), **päätös kirjaksi** (`docs/decisions/`, skill `tyokalut:paatos`).
9. **Ei `--no-verify`:tä eikä hookkien ohitusta.** Korjaa tarkistuksen löytämä ongelma.
10. **Ei palveluun lukitsevia lisäosia** (ei Webflow-embediä, ei suljettuja widgettejä).

## Komennot

| | |
|---|---|
| Kehityspalvelin (Studio `/studio`) | `npm run dev` → http://localhost:3000 |
| Tarkistukset (sama kuin CI) | `npm run type-check`, `npm run lint`, `npm test` |
| Studion savutesti | `npm run savutesti:studio` (dev käynnissä) |
| Kaikki muut | `docs/runbooks/` (testit, tuotantomuutokset, migraatio, ylläpito, ympäristöt) |

## Työnkulku

- Klubin agentit: **studio-agent** (skeemat, Studio, ylläpito-ohjeen kortit `docs/ohje/`) ja **design-system-agent** (komponentit, tyyliopas `docs/design-handoff/`).
- Pluginista: `reviewer` (klubin lisälista `docs/runbooks/katselmointi.md`), `tyokalut:julkaisu` (lisälista `docs/runbooks/julkaisu.md`), `tyokalut:vie-tuotantoon`, `tyokalut:uusi-sisaltotyyppi`, `tyokalut:paatos`, `tyokalut:siivous`, `tyokalut:retro`.
- Muutoksen jälkeen: `reviewer` katselmoi, sitten oma varmistus (aja, katso selaimessa).
- Studion näkymä tai nimi muuttui → päivitä ylläpito-ohjeen kortti ja aja `npm run ohje` (`docs/runbooks/yllapito.md`).

## Hakemistot

```
app/(public)/    julkiset sivut        app/(sovellus)/  sovellusnäkymät ilman palkkeja (arvostelu, docs/21)
app/studio/      Studio                app/api/         webhookit, draft mode, cronit, OG-kuvat
components/      UI                    lib/             jaetut apurit
sanity/          skeemat, kyselyt, structure.ts, Studion toiminnot ja editorit, ohje
scripts/         työkalut ja testit    scripts/kerta/   kertaluonteiset (päivätty, tila: runbooks/tuotantomuutokset.md)
docs/            suunnitelmat (hakemisto docs/README.md)   docs/runbooks/  miten-tehdään   docs/ohje/  ylläpito-ohjeen lähde
```

## Linkit

- Sivusto ja domain: https://www.lahdensuomalainenklubi.com/ (vanha sivusto korvataan, domain säilyy). Repo: `veikkope/klubi`.
- Dokumentit: `docs/README.md`. Julkaisu, käyttöoikeudet, domain: `docs/17-julkaisu-domain-ja-oikeudet.md`. Vaihe 2: `docs/24-vaihe2-toteutus.md`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
