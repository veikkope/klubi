# 17 — Julkaisu: käyttöoikeudet, ympäristö ja domainin siirto

> **Tarkoitus:** viedä sivusto käyttöön osoitteessa www.lahdensuomalainenklubi.com
> niin, ettei sähköposti katkea, isä pääsee päivittämään sivustoa omilla
> tunnuksillaan ja kaikki salaisuudet ja oikeudet ovat hallittuja. Laadittu
> 28.9.2026 kokonaisauditoinnin (docs/16) jälkeen. Tehdään järjestyksessä A → E.

---

## A. Käyttöoikeudet (Sanity)

Periaate: **jokaisella ihmisellä oma tunnus, jokaisella palvelulla oma token,
kaikilla vain tarvittavat oikeudet.**

### A1. Ihmiset

| Kuka | Rooli | Miksi |
|---|---|---|
| Kehittäjä (Veikko) | Administrator | projektin asetukset, tokenit, CORS, webhookit |
| Sihteeri (isä) | **Editor** | muokkaa ja julkaisee sisältöä, ei pääse asetuksiin |
| Muut hallituksen jäsenet (tarvittaessa) | Editor tai Viewer | vain tarpeen mukaan |

**Isän kutsuminen:**
1. sanity.io/manage → projekti *klubi* → **Members** → **Invite members**.
   Vaihtoehtoisesti komentorivillä: `npx sanity users invite <isän-sähköposti> --role editor`.
2. Isä hyväksyy kutsun sähköpostista ja kirjautuu **omalla Google-tilillään tai
   sähköpostillaan**. Yhteistunnuksia ei käytetä, jotta versiohistoriasta näkyy, kuka muutti mitä.
3. Suositus: isän Google-tilille kaksivaiheinen tunnistautuminen.
4. Ensimmäinen kirjautuminen yhdessä: Studio (osoite docs/09),
   yksi testijulkaisu ja **Tarkistettavat**-listan läpikäynti.

✅ Tehty 28.9.2026: CORS sallii Studion osoitteista `https://klubi-blond.vercel.app`,
`https://www.lahdensuomalainenklubi.com`, `https://lahdensuomalainenklubi.com` ja
`http://localhost:3000` (credentials). Ennen tätä Studio toimi vain paikallisesti.

### A2. Tokenit (palveluiden tunnukset)

| Token | Rooli | Missä | Tila |
|---|---|---|---|
| "Vercel – lomakkeet" | Editor | Vercel: `SANITY_API_WRITE_TOKEN` | luo uusi ja korvaa nykyinen |
| "Vercel – esikatselu" | Viewer | Vercel: `SANITY_API_READ_TOKEN` | **puuttuu Vercelistä** → esikatselu antaa 501 |
| "Migration", "Migration2" | Editor | migraatioskriptit | **poista**, kun Vercelin token on vaihdettu (migraatiot ajetaan nykyään `npx sanity login` -tunnuksella) |

Luo tokenit: sanity.io/manage → *API* → **Tokens** → Add API token. Kopioi arvo
**suoraan Verceliin**, äläkä tallenna sitä muualle (ei sähköpostiin eikä chattiin).
Tokenin arvo näytetään vain kerran.

### A3. Omistajuus (päätetty 4.10.2026)

- **Sanity:** projekti `zyrukn4s` kuuluu organisaatiolle "Lahden Suomalainen Klubi ry"
  (`omn1r3j11`). Organisaation Administratorit: kehittäjä ja Simo (isä).
- **Vercel:** projekti jää kehittäjän Hobby-tilille. Hobby-tiliin ei voi lisätä jäseniä, joten
  siirto toiselle henkilölle vaatisi Pro-tiimin. Klubin omaisuus (sisältö, domain, julkinen repo)
  ei ole Vercelissä. Jos ylläpitäjä vaihtuu: uusi Vercel-tili → tuo repo `veikkope/klubi` →
  kopioi §B:n ympäristömuuttujat → lisää domainit → vaihda DNS (§C3) → päivitä Sanityn CORS ja
  webhook uuteen osoitteeseen.
- **Domain:** rekisteröijä tarkistetaan Wepardilta (pitää olla yhdistys).

---

## B. Vercelin ympäristömuuttujat

Vercel → projekti → **Settings → Environment Variables** (Production ja Preview):

| Muuttuja | Arvo | Tarkoitus |
|---|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | `zyrukn4s` | (on jo) |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` | (on jo) |
| `SANITY_API_WRITE_TOKEN` | token "Vercel – lomakkeet" | kommentit ja arvostelut |
| `SANITY_API_READ_TOKEN` | token "Vercel – esikatselu" | Studion esikatselu (draft mode) |
| `SANITY_REVALIDATE_SECRET` | arvo `.env.local`-tiedostosta | webhookin allekirjoitus |

Muutosten jälkeen: **Deployments → Redeploy** (muuttujat tulevat voimaan vasta uudessa
deployssa).

✅ Tehty 28.9.2026: Sanityyn on luotu webhook **"Sivuston päivitys (revalidate)"**
(production, create/update/delete) → `https://www.lahdensuomalainenklubi.com/api/revalidate` (vaihdettu 4.10.2026; alun perin klubi-blond.vercel.app).
Salaisuus on kehittäjän `.env.local`-tiedostossa (`SANITY_REVALIDATE_SECRET`), mistä se
kopioidaan Verceliin. Tarkistus: Studio → julkaise muutos → sanity.io/manage → API →
Webhooks → *Attempts* näyttää 200.

### B1. Jäsenhakemukset: ei käytössä

Päätetty 28.9.2026: klubi **ei ota jäsenhakemuksia vastaan sivuston kautta**.
Lomake, `/klubi/liity`-sivu ja Resend on poistettu, ja vanha osoite ohjautuu
`/klubi`-sivulle (next.config.ts). Siksi DNS:ään ei tarvita Resendin DKIM- tai
SPF-tietueita. Tietosuojaselosteen jäsenhakemusosio poistetaan skriptillä
`scripts/poista-jasenhakemus-tietosuojasta.ts` (ensin development, sitten
`--production` varmuuskopion jälkeen).

---

## C. Domainin siirto (DNS)

### C0. Nykytila (tarkistettu 28.9.2026 nslookupilla)

| Tietue | Arvo | Huomio |
|---|---|---|
| NS | ns1/ns2.int2000.net | DNS on int2000/Wepardissa. **Pidetään siellä.** |
| A `lahdensuomalainenklubi.com` | 5.44.244.222 | vanha palvelin (web **ja posti**) |
| CNAME `www` | → `lahdensuomalainenklubi.com` | |
| CNAME `mail` | → `lahdensuomalainenklubi.com` | ⚠ seuraa apexia |
| MX | 0 `lahdensuomalainenklubi.com` | ⚠ posti menee apexin IP:hen |
| TXT (SPF) | `v=spf1 ip4:5.44.244.222 include:_spf.wepardi.fi ip4:94.237.10.15 +a +mx -all` | |
| TTL | 86 400 s (1 vrk) | |

**Riski:** jos apexin A-tietue vaihdetaan Verceliin, MX ja `mail` seuraavat mukana, ja
klubin sähköposti lakkaa toimimasta. Tämä on estettävä ensin (C2).

### C1. Valmistelu (viikkoa ennen)

1. Pyydä int2000:lta/Wepardilta **koko DNS-vyöhyke** (zone export) ja varmista, ettei
   muita tietueita riipu apexista (webmail, ftp ym.).
2. Varmista hallitukselta, että `info@`-postilaatikko on käytössä ja kuka sitä lukee.
3. Varmuuskopiot: `npm run backup` (Sanity) ja vanhan sivuston tiedostot Wepardilta.
4. Vercel → **Domains** → lisää `www.lahdensuomalainenklubi.com` (ensisijainen) ja
   `lahdensuomalainenklubi.com` (ohjaus → www). Vercel näyttää tarkat DNS-arvot. Käytä
   niitä, älä tämän dokumentin esimerkkejä.
5. **Laske TTL 300 sekuntiin** vuorokautta ennen siirtoa.

### C2. Posti erilleen (ennen web-siirtoa)

1. Muuta `mail` **CNAME → A 5.44.244.222**. MX ei saa osoittaa CNAME-nimeen.
2. Muuta **MX → `mail.lahdensuomalainenklubi.com`** (prioriteetti 0).
3. Odota TTL (5 min), minkä jälkeen lähetä ja vastaanota testiposti ulkopuolisesta
   osoitteesta (esim. Gmail) molempiin suuntiin.
4. SPF: poista `+a` (se alkaisi tarkoittaa Vercelin IP:tä). `ip4:5.44.244.222` kattaa
   postipalvelimen jo.

### C3. Web Verceliin (siirtopäivä)

1. Apex **A** → `216.198.79.1` (Vercelin antama 4.10.2026; vanha `76.76.21.21` toimii myös).
2. `www` **CNAME** → `b0e6106b7627dd0d.vercel-dns-017.com` (Vercelin antama 4.10.2026; tarkista kopioimalla Vercelistä).
3. **Älä koske** NS-, MX-, `mail`-, SPF- tai DKIM-tietueisiin.
4. Odota, että Vercel näyttää domainit *Valid* ja HTTPS-varmenne on valmis.
5. Tarkista: https://www… ja apex (→ www 308), http → https, `/studio`, `/sitemap.xml`,
   `/api/og`, ja aja
   `BASE_URL=https://www.lahdensuomalainenklubi.com npm run verify:redirects` ja `verify:content`.
6. Vaihda webhookin URL: sanity.io/manage → API → Webhooks → `https://www.lahdensuomalainenklubi.com/api/revalidate`.
7. Vercel → Domains: `klubi-blond.vercel.app` → ohjaus www-osoitteeseen (ettei esikatselu-
   osoite kilpaile hakutuloksissa).

### C4. Heti siirron jälkeen

1. **Blogi** (docs/14 §6): viimeinen `npm run sync:blogspot`, tarkista
   `curl -I https://www.lahdensuomalainenklubi.com/blogspot/2019/03/milano-euroopan-renessanssin.html` → 308,
   **vasta sitten** blogiin muuttoilmoitus ja teeman ohjausskripti.
2. **Google Search Console:** Domain-omaisuus (TXT-tietue, SPF säilyy ennallaan), lähetä
   `/sitemap.xml`, URL-tarkistus 5–10 avainsivulle. Bing: tuo Search Consolesta.
3. Jakoesikatselu: Facebook Sharing Debugger ja LinkedIn Post Inspector.
4. Seuraa 2 viikkoa: Vercelin 404-loki ja Search Consolen *Sivut*-raportti.
5. **Wepardin web-palvelu irtisanotaan vasta**, kun posti on varmasti erotettu tai
   siirretty (posti on samalla palvelimella).

### C5. Paluusuunnitelma

Jos jokin menee pieleen: palauta apexin A-tietue 5.44.244.222 ja `www` CNAME → apex.
Matala TTL (300 s) tarkoittaa, että paluu on voimassa minuuteissa. Posti ei ole
riippuvainen web-muutoksesta C2:n jälkeen.


### C6. Toteutus 4.10.2026

- **Domain ja DNS jäävät Zonerille** (ent. Wepardi). DNS:ää muokataan Wepardin **cPanelissa →
  Toimialueet → Zone Editor → Hallinta** (isän tunnuksilla). Rekisteröinnin siirtoa ei tehty.
- **Posti lopetettu:** postitilejä ei ollut käytetty. MX ja `mail` poistettu, SPF `v=spf1 -all`,
  DMARC `_dmarc` TXT `v=DMARC1; p=reject`. DKIM- ja cPanelin omat tietueet jätettiin; poistuvat
  webhotellin mukana. info@ voidaan myöhemmin palauttaa ilmaisella edelleenlähetyksellä (MX + SPF).
- **Huom. ns1 on hidas:** `ns1.int2000.net` päivittyy ns2:lta vasta SOA-refreshin (1 h) mukaan, ei
  heti. Tarkista muutokset aina molemmilta (`nslookup -debug -type=soa … ns1/ns2.int2000.net`,
  serial sama). Ristiriitainen tila kaatoi Let's Encryptin http-01-tarkistuksen; varmenne syntyi,
  kun molemmat olivat ajan tasalla.
- Tarkistettu 21.08: https www 200, apex ja http 308 → www, /studio, /sitemap.xml, vanhat .htm- ja
  /blogspot-osoitteet ohjautuvat. `verify:redirects`: 4 "rikki" ovat vain pilkun koodaus `%2C`
  (sivu toimii). `verify:content`: 26 eroa = productionin siivotut otsikot vs. development.
- **Zonerin webhotelli** pidetään paluutienä noin kuukauden. Ennen irtisanomista: kotihakemiston
  varmuuskopio (cPanel → Tiedostot → Varmuuskopio) talteen kahteen paikkaan ja Zonerilta kirjallinen
  vahvistus, että domain ja DNS-vyöhyke jäävät voimaan (vyöhyke on nyt webhotellin cPanelissa).

---

## D. Sisältö ja datasetit julkaisun jälkeen

- **Isä muokkaa productionia.** Tästä eteenpäin `development` → `production` -vientiä
  **`--replace`-tilassa ei saa tehdä**: se pyyhkisi isän muutokset. Uudet migraatiot
  viedään productioniin `--missing`-tilassa tai dokumenttikohtaisesti (CLAUDE.md).
- **Varmuuskopiot** (Sanityn Free-tasolla versiohistoria säilyy vain 3 päivää, ja
  Sanityn oma Backups-palvelu on vain Enterprise-tasolla):
  - **Automaattinen viikkokopio:** Vercel Cron (`vercel.json`, maanantaisin 01 UTC)
    kutsuu `/api/varmuuskopio`. Julkaistu sisältö (ei luonnoksia eikä kuvia, koska
    dataset on julkinen) gzip-tiedostona Sanityyn, Studiossa **Sivun asetukset →
    Varmuuskopiot**. 12 uusinta säilyy. Maksuton Hobby-tasolla (1 ajastus, ~4
    funktiokutsua kuussa).
  - **Kertaluonteinen asetus:** Vercel → Settings → Environment Variables →
    `CRON_SECRET` (Production), satunnainen arvo esim. `openssl rand -hex 32` →
    redeploy. Ilman sitä reitti vastaa 501 eikä kopioita synny.
    `SANITY_API_WRITE_TOKEN` (Editor) on jo asetettu.
  - **Seuranta:** Vercel → Cron Jobs näyttää ajot; epäonnistunut ajo = HTTP 500 ja
    syy lokissa. Studiossa uusimman kopion päiväys kertoo saman.
  - **Palautus:** lataa kopio Studiosta, pura (`gunzip varmuuskopio-<pvm>.ndjson.gz`)
    ja `npx sanity dataset import varmuuskopio-<pvm>.ndjson --dataset production
    --missing` (puuttuvat dokumentit) tai poimi yksittäinen dokumentti ja
    `--replace` vain sille. Varmuuskopio ensin (`npm run backup`).
  - **Täysi kopio kuvineen:** `npm run backup` ennen jokaista isompaa muutosta.
    Tiedosto: `varmuuskopiot/production-<pvm>.tar.gz` (gitignoressa, ~1 Gt).
- **Sisällön jäädytys:** sovi isän kanssa päivä, jonka jälkeen vanhaa sivustoa ja blogia
  ei enää päivitetä. Sen jälkeen: `npm run crawl` ja migraatio vain muuttuneille sivuille
  (esim. Nonni-ravintola 25.9.2026) ja `npm run sync:blogspot`.

---

## E. Tarkistuslista

| # | Tehtävä | Kuka | Tila |
|---|---|---|---|
| 1 | CORS tuotanto-osoitteille | kehittäjä | ✅ 28.9. |
| 2 | Webhook Sanityyn | kehittäjä | ✅ 28.9. |
| 3 | Next.js 16.3.6 → 16.3.7 (tietoturva) | kehittäjä | ✅ 30.9., julkaistu |
| 4 | Suomenkieliset 404- ja virhesivut | kehittäjä | ✅ 28.9., julkaistu |
| 5 | Arvostelut: ei sähköpostia, luonnoksena | kehittäjä | ✅ 28.9., julkaistu |
| 6 | Tietosuojaseloste /tietosuoja + linkit | kehittäjä | ✅ 28.9. Hallitus vahvistaa sisällön |
| 7 | Studio: suomi, valikko, Tarkistettavat, syyt | kehittäjä | ✅ 28.9., julkaistu |
| 8 | Vercel: `SANITY_API_READ_TOKEN`, `SANITY_REVALIDATE_SECRET` → redeploy | kehittäjä | ✅ 28.9. |
| 9 | Tokenit: "Vercel – lomakkeet" ja "Vercel – esikatselu", migraatiotokenien poisto | kehittäjä | ✅ 28.9. (lomake testattu tuotannossa) |
| 10 | Isän kutsu (Editor) ja perehdytys | kehittäjä + isä | kutsu lähetetty 28.9., opas päivitetty 30.9., perehdytys ☐ |
| 11 | Perustiedot Studiossa (docs/09 "Täytä itse") | isä + hallitus | ☐ 30.9.: sähköposti, osoite, Y-tunnus, hallitus (0), tapahtumat (0), etusivun kuvat, /english-kieli |
| 12 | Tietosuojaselosteen vahvistus | hallitus | ☐ |
| 13 | Jäsenhakemukset poistettu (ei Resendiä) | kehittäjä | ✅ 28.9. koodi · ✅ tietosuojaselosteessa ei mainintaa (tarkistettu 30.9.) |
| 14 | DNS C1–C4 | kehittäjä + isä | ✅ 4.10. web Verceliin (cPanel Zone Editor), posti lopetettu (versio A, §C6), webhook → www, vercel.app → www (308). ☐ Search Console, blogin ohjaus, Zonerin webhotellin irtisanominen |
| 15 | Blogin ohjaus (docs/14 §6) | kehittäjä | ☐ siirron jälkeen (tuotantopolku ja dynaaminen /blogspot-reitti valmiit 30.9.) |
| 16 | Arvostelukuvat: tietosuojaselosteen patch (docs/18 §7) | kehittäjä | ✅ 30.9. (varmuuskopio ensin) |
| 17 | Vercel-osoitteet noindex (`X-Robots-Tag`) | kehittäjä | ✅ 30.9. |
| 18 | Blogin 29.9. kirjoitus productioniin (`sync:blogspot:production`) | kehittäjä | ✅ 30.9. |
| 19 | Viikoittainen varmuuskopio: `CRON_SECRET` Verceliin + redeploy, ensimmäisen ajon tarkistus | kehittäjä | koodi ✅ 30.9. · asetus ✅ 4.10. (`/api/varmuuskopio` vastaa 401) · ensimmäinen ajo ma 1.00 UTC ☐ |
| 20 | Yöllinen huolto `/api/huolto` (arvosanat, orvot arvostelukuvat; sama `CRON_SECRET`) | kehittäjä | koodi ✅ 4.10. · ensimmäisen ajon tarkistus Vercel → Cron Jobs ☐ |
