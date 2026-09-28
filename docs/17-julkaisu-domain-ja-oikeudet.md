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
4. Ensimmäinen kirjautuminen yhdessä: Studio (osoite docs/09), koodisanan asetus,
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
| `RESEND_API_KEY`, `JASENHAKEMUS_VASTAANOTTAJA`, `JASENHAKEMUS_LAHETTAJA` | ks. B1 | jäsenhakemukset |

Muutosten jälkeen: **Deployments → Redeploy** (muuttujat tulevat voimaan vasta uudessa
deployssa).

✅ Tehty 28.9.2026: Sanityyn on luotu webhook **"Sivuston päivitys (revalidate)"**
(production, create/update/delete) → `https://klubi-blond.vercel.app/api/revalidate`.
Salaisuus on kehittäjän `.env.local`-tiedostossa (`SANITY_REVALIDATE_SECRET`), mistä se
kopioidaan Verceliin. Tarkistus: Studio → julkaise muutos → sanity.io/manage → API →
Webhooks → *Attempts* näyttää 200.

### B1. Jäsenhakemukset (Resend)

Lomake lähettää hakemuksen sähköpostina eikä tallenna sitä. Ilman Resendiä lomake
kertoo rehellisesti, ettei lähetys ole käytössä. Käyttöönotto:
1. Hallitus päättää vastaanottajan (esim. sihteerin osoite).
2. resend.com → lisää domain `lahdensuomalainenklubi.com` → lisää Resendin antamat
   DKIM- ja SPF-tietueet int2000:n DNS:ään (**älä muuta olemassa olevaa SPF:ää,
   vaan lisää `include:` samaan tietueeseen**).
3. Muuttujat Verceliin, redeploy ja oma testihakemus.

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

1. Apex **A** → Vercelin antama IP (tyypillisesti `76.76.21.21`).
2. `www` **CNAME** → Vercelin antama nimi (tyypillisesti `cname.vercel-dns.com`).
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

---

## D. Sisältö ja datasetit julkaisun jälkeen

- **Isä muokkaa productionia.** Tästä eteenpäin `development` → `production` -vientiä
  **`--replace`-tilassa ei saa tehdä**: se pyyhkisi isän muutokset. Uudet migraatiot
  viedään productioniin `--missing`-tilassa tai dokumenttikohtaisesti (CLAUDE.md).
- **Varmuuskopio:** `npm run backup` ennen jokaista isompaa muutosta ja kerran
  kuukaudessa. Tiedosto: `varmuuskopiot/production-<pvm>.tar.gz` (gitignoressa).
  Säilytä kopio myös koneen ulkopuolella.
- **Sisällön jäädytys:** sovi isän kanssa päivä, jonka jälkeen vanhaa sivustoa ja blogia
  ei enää päivitetä. Sen jälkeen: `npm run crawl` ja migraatio vain muuttuneille sivuille
  (esim. Nonni-ravintola 25.9.2026) ja `npm run sync:blogspot`.

---

## E. Tarkistuslista

| # | Tehtävä | Kuka | Tila |
|---|---|---|---|
| 1 | CORS tuotanto-osoitteille | kehittäjä | ✅ 28.9. |
| 2 | Webhook Sanityyn | kehittäjä | ✅ 28.9. |
| 3 | Next.js 16.3.6 (tietoturva) | kehittäjä | ✅ 28.9. (odottaa deployta) |
| 4 | Suomenkieliset 404- ja virhesivut | kehittäjä | ✅ 28.9. (odottaa deployta) |
| 5 | Arvostelut: ei sähköpostia, luonnoksena | kehittäjä | ✅ 28.9. (odottaa deployta) |
| 6 | Tietosuojaseloste /tietosuoja + linkit | kehittäjä | ✅ 28.9. Hallitus vahvistaa sisällön |
| 7 | Studio: suomi, valikko, Tarkistettavat, syyt | kehittäjä | ✅ 28.9. (odottaa deployta) |
| 8 | Vercel: `SANITY_API_READ_TOKEN`, `SANITY_REVALIDATE_SECRET` → redeploy | kehittäjä | ☐ |
| 9 | Tokenit: "Vercel – lomakkeet" ja "Vercel – esikatselu", migraatiotokenien poisto | kehittäjä | ☐ |
| 10 | Isän kutsu (Editor) ja perehdytys | kehittäjä + isä | ☐ |
| 11 | Koodisana ja perustiedot Studiossa (docs/09 "Täytä itse") | isä + hallitus | ☐ |
| 12 | Tietosuojaselosteen vahvistus | hallitus | ☐ |
| 13 | Resend (jäsenhakemukset) | kehittäjä + hallitus | ☐ |
| 14 | DNS C1–C4 | kehittäjä + int2000 | ☐ |
| 15 | Blogin ohjaus (docs/14 §6) | kehittäjä | ☐ siirron jälkeen |
