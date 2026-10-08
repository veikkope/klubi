// GENEROITU: npm run ohje (scripts/ohje-koosta.ts). Älä muokkaa käsin.
// Lähde: docs/ohje/ (kirjoitusohje docs/ohje/README.md). test:ohje tarkistaa, että tämä on ajan tasalla.
import type { OhjeSisalto } from "../../lib/ohje/tyypit";

export const OHJE: OhjeSisalto = {
  "versio": "afbfad4e600e",
  "osiot": [
    {
      "id": "pikaopas",
      "otsikko": "Pikaopas",
      "kortit": [
        {
          "id": "pikaopas",
          "otsikko": "Pikaopas: päivitä sivusto",
          "osio": "pikaopas",
          "avainsanat": [
            "pikaopas",
            "muistilista",
            "alkuun",
            "ohje",
            "tulosta",
            "perusasiat",
            "hätä",
            "apua"
          ],
          "tyypit": [],
          "kesto": null,
          "paivitetty": "2026-10-08",
          "html": "<p>Studio: <a href=\"https://www.lahdensuomalainenklubi.com/studio\" target=\"_blank\" rel=\"noopener noreferrer\">https://www.lahdensuomalainenklubi.com/studio</a> · Kirjaudu omalla tunnuksellasi.</p>\n<h2 id=\"pikaopas--kolme-saantoa\">Kolme sääntöä</h2>\n<ol>\n<li>Muutos tallentuu itsestään luonnokseksi, jota kävijät eivät näe. Tee kaikki muutokset ja paina lopuksi kerran <strong>Julkaise</strong>.</li>\n<li>Kaiken voi perua: katso alta &quot;perua virheen&quot; ja &quot;Jos hätä tulee&quot;.</li>\n<li>Punainen rivi Aloituksessa ei tarkoita, että sisältö katosi. Jatka työtä normaalisti.</li>\n</ol>\n<h2 id=\"pikaopas--viisi-yleisinta-tehtavaa\">Viisi yleisintä tehtävää</h2>\n<table>\n<thead>\n<tr>\n<th>Haluan…</th>\n<th>Näin teen</th>\n<th>Ohjekortti</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>päivittää tilastotaulukon</td>\n<td><strong>Jalkapalloarkisto → Tilastot</strong> → ryhmä → taulukko → välilehti <strong>Tilastodata</strong> → kirjoita soluihin → lopuksi <strong>Julkaise</strong></td>\n<td><a href=\"/studio/ohjeet/tilastotaulukon-paivitys\" data-ohje-kortti=\"tilastotaulukon-paivitys\">Päivitä tilastotaulukko</a></td>\n</tr>\n<tr>\n<td>kirjoittaa uutisen</td>\n<td><strong>Uutiset</strong> → plus-painike → <strong>Uutinen</strong> → <strong>Otsikko</strong> → <strong>Osoite sivustolla</strong>: <strong>Luo</strong> → <strong>Sisältö</strong> → <strong>Kategoriat</strong> → <strong>Julkaise</strong></td>\n<td><a href=\"/studio/ohjeet/uutisen-kirjoittaminen\" data-ohje-kortti=\"uutisen-kirjoittaminen\">Kirjoita uutinen</a></td>\n</tr>\n<tr>\n<td>hyväksyä arvostelun</td>\n<td><strong>Tehtävät sinulle → Arvostelut odottavat hyväksyntää</strong> → avaa arvostelu → lue → <strong>Julkaise</strong>. Hylkäys: toimintovalikosta <strong>Hylkää arvostelu</strong></td>\n<td><a href=\"/studio/ohjeet/arvostelun-hyvaksynta\" data-ohje-kortti=\"arvostelun-hyvaksynta\">Hyväksy tai hylkää kävijän arvostelu</a></td>\n</tr>\n<tr>\n<td>antaa klubilaisen pisteet ravintolalle</td>\n<td><strong>Ravintolat → Klubilaisten arvosanat → Ravintoloittain</strong> → ravintola → plus-painike → <strong>Klubilainen</strong>, <strong>Ruoka</strong>, <strong>Hinta</strong>, <strong>Viihtyvyys</strong> → <strong>Julkaise</strong></td>\n<td><a href=\"/studio/ohjeet/klubilaisen-pisteet\" data-ohje-kortti=\"klubilaisen-pisteet\">Lisää klubilaisen pisteet ravintolalle</a></td>\n</tr>\n<tr>\n<td>perua virheen</td>\n<td>Ennen julkaisua: toimintovalikko → <strong>Hylkää muutokset</strong>. Julkaisun jälkeen: lomakkeen yläreunasta <strong>Julkaistu</strong> → alareunan aika → <strong>Historia</strong> → versio → <strong>Palauta</strong> → <strong>Vahvista</strong> → <strong>Luonnos</strong> → <strong>Julkaise</strong></td>\n<td><a href=\"/studio/ohjeet/luonnos-julkaisu-ja-peruminen\" data-ohje-kortti=\"luonnos-julkaisu-ja-peruminen\">Tallenna, julkaise ja peru muutos</a></td>\n</tr>\n</tbody>\n</table>\n<p>Toimintovalikko on kolmen pisteen painike (⋯) <strong>Julkaise</strong>-painikkeen vieressä oikeassa alakulmassa.</p>\n<h2 id=\"pikaopas--jos-hata-tulee\">Jos hätä tulee</h2>\n<ul>\n<li>Muutos ei näy sivustolla: painoitko <strong>Julkaise</strong>? Odota minuutti ja päivitä sivu.</li>\n<li><strong>Julkaise</strong> on harmaa: jossakin kentässä on virhe. Paina oikean yläkulman punaista huutomerkkiä (<strong>Validointi</strong>), korjaa kenttä ja paina uudelleen.</li>\n<li>Virhe on vanhempi: toimintovalikko → <strong>Palauta varmuuskopiosta</strong> → viikko → <strong>Palauta</strong> → <strong>Julkaise</strong>.</li>\n<li>Poistin vahingossa: <strong>Sivuston asetukset → Varmuuskopiot</strong> → uusin kopio → <strong>Palauta poistettu</strong>.</li>\n<li>Aloituksessa on punainen rivi: sisältösi on tallessa. Kerro tukihenkilölle rivin otsikko ja teksti.</li>\n<li>Et tiedä, mitä tehdä: jätä luonnos odottamaan ja ota yhteys tukihenkilöön (yhteystiedot annettu erikseen). Mikään ei katoa.</li>\n</ul>\n",
          "teksti": "Studio: https://www.lahdensuomalainenklubi.com/studio · Kirjaudu omalla tunnuksellasi. Kolme sääntöä Muutos tallentuu itsestään luonnokseksi, jota kävijät eivät näe. Tee kaikki muutokset ja paina lopuksi kerran Julkaise . Kaiken voi perua: katso alta \"perua virheen\" ja \"Jos hätä tulee\". Punainen rivi Aloituksessa ei tarkoita, että sisältö katosi. Jatka työtä normaalisti. Viisi yleisintä tehtävää Haluan… Näin teen Ohjekortti päivittää tilastotaulukon Jalkapalloarkisto → Tilastot → ryhmä → taulukko → välilehti Tilastodata → kirjoita soluihin → lopuksi Julkaise Päivitä tilastotaulukko kirjoittaa uutisen Uutiset → plus-painike → Uutinen → Otsikko → Osoite sivustolla : Luo → Sisältö → Kategoriat → Julkaise Kirjoita uutinen hyväksyä arvostelun Tehtävät sinulle → Arvostelut odottavat hyväksyntää → avaa arvostelu → lue → Julkaise . Hylkäys: toimintovalikosta Hylkää arvostelu Hyväksy tai hylkää kävijän arvostelu antaa klubilaisen pisteet ravintolalle Ravintolat → Klubilaisten arvosanat → Ravintoloittain → ravintola → plus-painike → Klubilainen , Ruoka , Hinta , Viihtyvyys → Julkaise Lisää klubilaisen pisteet ravintolalle perua virheen Ennen julkaisua: toimintovalikko → Hylkää muutokset . Julkaisun jälkeen: lomakkeen yläreunasta Julkaistu → alareunan aika → Historia → versio → Palauta → Vahvista → Luonnos → Julkaise Tallenna, julkaise ja peru muutos Toimintovalikko on kolmen pisteen painike (⋯) Julkaise -painikkeen vieressä oikeassa alakulmassa. Jos hätä tulee Muutos ei näy sivustolla: painoitko Julkaise ? Odota minuutti ja päivitä sivu. Julkaise on harmaa: jossakin kentässä on virhe. Paina oikean yläkulman punaista huutomerkkiä ( Validointi ), korjaa kenttä ja paina uudelleen. Virhe on vanhempi: toimintovalikko → Palauta varmuuskopiosta → viikko → Palauta → Julkaise . Poistin vahingossa: Sivuston asetukset → Varmuuskopiot → uusin kopio → Palauta poistettu . Aloituksessa on punainen rivi: sisältösi on tallessa. Kerro tukihenkilölle rivin otsikko ja teksti. Et tiedä, mitä tehdä: jätä luonnos odottamaan ja ota yhteys tukihenkilöön (yhteystiedot annettu erikseen). Mikään ei katoa.",
          "otsikot": [
            {
              "id": "pikaopas--kolme-saantoa",
              "teksti": "Kolme sääntöä",
              "taso": 2
            },
            {
              "id": "pikaopas--viisi-yleisinta-tehtavaa",
              "teksti": "Viisi yleisintä tehtävää",
              "taso": 2
            },
            {
              "id": "pikaopas--jos-hata-tulee",
              "teksti": "Jos hätä tulee",
              "taso": 2
            }
          ]
        }
      ]
    },
    {
      "id": "alkuun",
      "otsikko": "Alkuun",
      "kortit": [
        {
          "id": "studion-osat-ja-kirjautuminen",
          "otsikko": "Kirjaudu ja tutustu Studioon",
          "osio": "alkuun",
          "avainsanat": [
            "kirjautuminen",
            "kirjaudu",
            "tunnus",
            "salasana",
            "Studio",
            "sisältöeditori",
            "ylläpito",
            "valikko",
            "aloitus",
            "puhelin",
            "mistä löydän"
          ],
          "tyypit": [],
          "kesto": "noin 5 minuuttia",
          "paivitetty": "2026-10-08",
          "html": "<h2 id=\"studion-osat-ja-kirjautuminen--milloin\">Milloin</h2>\n<p>Kun avaat sivuston ylläpidon ensimmäistä kertaa tai olet ollut pitkään poissa. Kaikki sivuston tekstit, kuvat ja taulukot muokataan Studiossa.</p>\n<h2 id=\"studion-osat-ja-kirjautuminen--ennen-kuin-aloitat\">Ennen kuin aloitat</h2>\n<ul>\n<li>Sinulla on tunnus, jolla sinut on kutsuttu Studioon (Google-tili tai sähköposti).</li>\n<li>Tunnus on henkilökohtainen. Älä anna sitä muille.</li>\n</ul>\n<h2 id=\"studion-osat-ja-kirjautuminen--askeleet\">Askeleet</h2>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/studion-osat-ja-kirjautuminen-01-yleiskuva.webp\" aria-label=\"Suurenna kuva: Studion näkymä. 3: yläpalkin työkalut. 4: vasen valikko. 5: lomake. 6: alapalkki ja Julkaise-painike.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/studion-osat-ja-kirjautuminen-01-yleiskuva.webp\" alt=\"Studion näkymä. 3: yläpalkin työkalut. 4: vasen valikko. 5: lomake. 6: alapalkki ja Julkaise-painike.\" width=\"1280\" height=\"908\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol>\n<li>Avaa selaimessa osoite <a href=\"https://www.lahdensuomalainenklubi.com/studio\" target=\"_blank\" rel=\"noopener noreferrer\">https://www.lahdensuomalainenklubi.com/studio</a> ja tallenna se kirjanmerkiksi.</li>\n<li>Kirjaudu samalla tunnuksella, jolla sinut kutsuttiin.\nStudio avautuu Aloitukseen.</li>\n<li>Yläpalkin keskellä ovat <strong>Aloitus</strong>, <strong>Sisältö</strong>, <strong>Esikatselu</strong> ja <strong>Ohjeet</strong>. ③\n<strong>Aloitus</strong> kertoo sivuston tilan, <strong>Sisältö</strong> on muokkausta varten, <strong>Esikatselu</strong> näyttää sivun ennen julkaisua. <strong>Ohjeet</strong> sisältää tämän ohjeen.</li>\n<li>Paina <strong>Sisältö</strong>. Vasemmalla on valikko, esimerkiksi <strong>Uutiset</strong>, <strong>Klubi</strong> ja <strong>Ravintolat</strong>. ④</li>\n<li>Valitse valikosta kohta ja listasta sisältö. Lomake aukeaa oikealle. ⑤</li>\n<li>Lomakkeen alareunassa on alapalkki. Oikeassa alakulmassa on <strong>Julkaise</strong>. ⑥\nSen vieressä on kolmen pisteen painike (⋯), josta löytyvät muut toiminnot.</li>\n</ol>\n<h2 id=\"studion-osat-ja-kirjautuminen--tulos\">Tulos</h2>\n<ul>\n<li>Näet Studion valikon ja voit avata minkä tahansa sisällön.</li>\n<li>Kun suljet selaimen, kirjautuminen säilyy yleensä seuraavaan kertaan.</li>\n</ul>\n<h2 id=\"studion-osat-ja-kirjautuminen--lisavalinnat\">Lisävalinnat</h2>\n<ul>\n<li>Puhelimella Studio toimii samassa osoitteessa. Yläpalkin työkalut ovat silloin valikon takana.</li>\n<li>Valikon kaikki kohdat yhdellä sivulla: <a href=\"/studio/ohjeet/valikon-kartta\" data-ohje-kortti=\"valikon-kartta\">Studion valikon kartta</a></li>\n</ul>\n<div class=\"markdown-alert markdown-alert-note\">\n<p class=\"markdown-alert-title\">Hyvä tietää</p>\n<p>Yläpalkissa näkyy myös <strong>Kyselyt (tukihenkilö)</strong>. Älä käytä sitä: se on tukihenkilön työkalu.\nÄlä käytä myöskään Sanityn omia toimintoja: yläpalkin &quot;Releases&quot; ja <strong>Julkaisut</strong>, oikean yläkulman <strong>Tehtävät</strong>,\ntoimintovalikon <strong>Ajasta julkaisu</strong> ja lomakkeen valikon <strong>Luo uusi tehtävä</strong>. Ne eivät kuulu klubin ohjeisiin.\nKlubin omat tehtävät ovat valikon kohdassa <strong>Tehtävät sinulle</strong>. Oikean yläkulman valikossa pitää lukea <strong>Luonnokset</strong>.</p>\n</div>\n<h2 id=\"studion-osat-ja-kirjautuminen--jos-jokin-menee-vikaan\">Jos jokin menee vikaan</h2>\n<ul>\n<li>Kirjautuminen ei onnistu: tarkista, että käytät samaa tiliä kuin kutsussa. Kokeile toista selainta.</li>\n<li>Studio näyttää virheen tai jää tyhjäksi: päivitä sivu. Jos vika jatkuu, katso <a href=\"/studio/ohjeet/studio-nayttaa-virheen\" data-ohje-kortti=\"studio-nayttaa-virheen\">Studio näyttää virheen tai ei aukea</a>.</li>\n<li>Yläpalkki on vihreä, eikä lomakkeeseen voi kirjoittaa: paina lomakkeen yläreunasta <strong>Luonnos</strong>.</li>\n<li>Sanityn hallintasivulle (sanity.io/manage) sinun ei tarvitse mennä. Sen asiat hoitaa tukihenkilö.</li>\n</ul>\n<p>Katso myös: <a href=\"/studio/ohjeet/aloitus-ja-sivuston-tila\" data-ohje-kortti=\"aloitus-ja-sivuston-tila\">Lue Aloitus ja sivuston tila</a> · <a href=\"/studio/ohjeet/luonnos-julkaisu-ja-peruminen\" data-ohje-kortti=\"luonnos-julkaisu-ja-peruminen\">Tallenna, julkaise ja peru muutos</a></p>\n",
          "teksti": "Milloin Kun avaat sivuston ylläpidon ensimmäistä kertaa tai olet ollut pitkään poissa. Kaikki sivuston tekstit, kuvat ja taulukot muokataan Studiossa. Ennen kuin aloitat Sinulla on tunnus, jolla sinut on kutsuttu Studioon (Google-tili tai sähköposti). Tunnus on henkilökohtainen. Älä anna sitä muille. Askeleet Avaa selaimessa osoite https://www.lahdensuomalainenklubi.com/studio ja tallenna se kirjanmerkiksi. Kirjaudu samalla tunnuksella, jolla sinut kutsuttiin. Studio avautuu Aloitukseen. Yläpalkin keskellä ovat Aloitus , Sisältö , Esikatselu ja Ohjeet . ③ Aloitus kertoo sivuston tilan, Sisältö on muokkausta varten, Esikatselu näyttää sivun ennen julkaisua. Ohjeet sisältää tämän ohjeen. Paina Sisältö . Vasemmalla on valikko, esimerkiksi Uutiset , Klubi ja Ravintolat . ④ Valitse valikosta kohta ja listasta sisältö. Lomake aukeaa oikealle. ⑤ Lomakkeen alareunassa on alapalkki. Oikeassa alakulmassa on Julkaise . ⑥ Sen vieressä on kolmen pisteen painike (⋯), josta löytyvät muut toiminnot. Tulos Näet Studion valikon ja voit avata minkä tahansa sisällön. Kun suljet selaimen, kirjautuminen säilyy yleensä seuraavaan kertaan. Lisävalinnat Puhelimella Studio toimii samassa osoitteessa. Yläpalkin työkalut ovat silloin valikon takana. Valikon kaikki kohdat yhdellä sivulla: Studion valikon kartta Yläpalkissa näkyy myös Kyselyt (tukihenkilö) . Älä käytä sitä: se on tukihenkilön työkalu. Älä käytä myöskään Sanityn omia toimintoja: yläpalkin \"Releases\" ja Julkaisut , oikean yläkulman Tehtävät , toimintovalikon Ajasta julkaisu ja lomakkeen valikon Luo uusi tehtävä . Ne eivät kuulu klubin ohjeisiin. Klubin omat tehtävät ovat valikon kohdassa Tehtävät sinulle . Oikean yläkulman valikossa pitää lukea Luonnokset . Jos jokin menee vikaan Kirjautuminen ei onnistu: tarkista, että käytät samaa tiliä kuin kutsussa. Kokeile toista selainta. Studio näyttää virheen tai jää tyhjäksi: päivitä sivu. Jos vika jatkuu, katso Studio näyttää virheen tai ei aukea . Yläpalkki on vihreä, eikä lomakkeeseen voi kirjoittaa: paina lomakkeen yläreunasta Luonnos . Sanityn hallintasivulle (sanity.io/manage) sinun ei tarvitse mennä. Sen asiat hoitaa tukihenkilö. Katso myös: Lue Aloitus ja sivuston tila · Tallenna, julkaise ja peru muutos",
          "otsikot": [
            {
              "id": "studion-osat-ja-kirjautuminen--milloin",
              "teksti": "Milloin",
              "taso": 2
            },
            {
              "id": "studion-osat-ja-kirjautuminen--ennen-kuin-aloitat",
              "teksti": "Ennen kuin aloitat",
              "taso": 2
            },
            {
              "id": "studion-osat-ja-kirjautuminen--askeleet",
              "teksti": "Askeleet",
              "taso": 2
            },
            {
              "id": "studion-osat-ja-kirjautuminen--tulos",
              "teksti": "Tulos",
              "taso": 2
            },
            {
              "id": "studion-osat-ja-kirjautuminen--lisavalinnat",
              "teksti": "Lisävalinnat",
              "taso": 2
            },
            {
              "id": "studion-osat-ja-kirjautuminen--jos-jokin-menee-vikaan",
              "teksti": "Jos jokin menee vikaan",
              "taso": 2
            }
          ]
        },
        {
          "id": "aloitus-ja-sivuston-tila",
          "otsikko": "Lue Aloitus ja sivuston tila",
          "osio": "alkuun",
          "avainsanat": [
            "aloitus",
            "etusivu Studiossa",
            "sivuston tila",
            "liikennevalo",
            "punainen",
            "keltainen",
            "vihreä",
            "harmaa",
            "varmuuskopio",
            "huolto",
            "otteluhaku",
            "kiintiö",
            "odottaa sinua",
            "tehtävät",
            "perustiedot"
          ],
          "tyypit": [],
          "kesto": "noin 2 minuuttia",
          "paivitetty": "2026-10-08",
          "html": "<h2 id=\"aloitus-ja-sivuston-tila--milloin\">Milloin</h2>\n<p>Aina kun avaat Studion. Aloitus kertoo yhdellä silmäyksellä, onko sivustolla kaikki kunnossa ja mikä odottaa sinua.</p>\n<h2 id=\"aloitus-ja-sivuston-tila--askeleet\">Askeleet</h2>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/aloitus-ja-sivuston-tila-01-tila.webp\" aria-label=\"Suurenna kuva: Aloitus. 1: Aloitus yläpalkissa. 2: yhteenveto. 3: tilarivi ja tila sanana. 7: Päivitä-painike.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/aloitus-ja-sivuston-tila-01-tila.webp\" alt=\"Aloitus. 1: Aloitus yläpalkissa. 2: yhteenveto. 3: tilarivi ja tila sanana. 7: Päivitä-painike.\" width=\"1042\" height=\"393\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol>\n<li>Avaa Studio. Aloitus aukeaa ensimmäisenä. Muualta pääset sinne yläpalkin painikkeesta <strong>Aloitus</strong>. ①</li>\n<li>Katso kohdan <strong>Sivuston tila</strong> yhteenveto: <strong>Kaikki kunnossa</strong>, <strong>Huomioitavaa</strong> tai <strong>Vaatii toimia</strong>. ②</li>\n<li>Lue rivit. Rivin nimen perässä tila lukee sanana, esim. <strong>Kunnossa</strong>, <strong>Huomio</strong>, <strong>Vaatii toimia</strong> tai <strong>Ei vielä tietoa</strong>. ③</li>\n<li>Jos rivi on keltainen tai punainen, lue sen alla oleva ohje. Kerro tukihenkilölle rivin otsikko ja teksti.\nSisältösi on silti tallessa. Voit jatkaa työtä normaalisti.</li>\n</ol>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/aloitus-ja-sivuston-tila-02-odottaa.webp\" aria-label=\"Suurenna kuva: Aloituksen alaosa. 5: Odottaa sinua -kortti ja sen luku. 6: Täydennä perustiedot -lista.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/aloitus-ja-sivuston-tila-02-odottaa.webp\" alt=\"Aloituksen alaosa. 5: Odottaa sinua -kortti ja sen luku. 6: Täydennä perustiedot -lista.\" width=\"1042\" height=\"337\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol start=\"5\">\n<li>Kohdassa <strong>Odottaa sinua</strong> paina korttia, jossa on luku. ⑤\nOikea lista aukeaa. Teksti <strong>Ei odottavia</strong> tarkoittaa, ettei siinä ole tehtävää.</li>\n<li>Jos näet kohdan <strong>Täydennä perustiedot</strong>, paina riviä. ⑥\nOikea kohta aukeaa valikosta. Jos lomake ei aukea itse, valitse listasta ylin kohta, esim. <strong>Osoite, sähköposti ja some</strong>.</li>\n<li>Kun haluat tuoreet tiedot kesken työn, paina <strong>Päivitä</strong>. ⑦</li>\n</ol>\n<p>Rivit ja niiden merkitys:</p>\n<table>\n<thead>\n<tr>\n<th>Rivi</th>\n<th>Mitä se kertoo</th>\n<th>Kun se ei ole vihreä</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td><strong>Varmuuskopio</strong></td>\n<td>Viikoittainen varmuuskopio, joka tehdään maanantaiyönä</td>\n<td>Kerro tukihenkilölle. Keltainen: kopio on tallessa, palautus toimii.</td>\n</tr>\n<tr>\n<td><strong>Yöllinen huolto</strong></td>\n<td>Ravintoloiden arvosanat ja vanhojen tiedostojen siivous joka yö</td>\n<td>Kerro tukihenkilölle, jos sama toistuu useana päivänä.</td>\n</tr>\n<tr>\n<td><strong>Otteluohjelman haku</strong></td>\n<td>Veikkausliigan ottelut haetaan automaattisesti</td>\n<td>Punainen: lisää tärkeät ottelut käsin ja kerro tukihenkilölle. Keltainen talvella on normaalia.</td>\n</tr>\n<tr>\n<td><strong>Dokumenttikiintiö (arvio)</strong></td>\n<td>Arvio siitä, paljonko sisältöä sivustolle mahtuu vielä</td>\n<td>Keltainen: kerro tukihenkilölle. Tila <strong>Arvio</strong> on normaali.</td>\n</tr>\n<tr>\n<td><strong>Julkaisemattomat muutokset</strong></td>\n<td>Sisältö, jossa on muutos, jota et ole julkaissut</td>\n<td>Paina <strong>Avaa julkaisemattomat muutokset</strong>. Julkaise tai hylkää muutos.</td>\n</tr>\n</tbody>\n</table>\n<h2 id=\"aloitus-ja-sivuston-tila--tulos\">Tulos</h2>\n<ul>\n<li>Tiedät, onko sivustolla kaikki kunnossa.</li>\n<li>Näet, montako arvostelua, kommenttia ja muuta asiaa odottaa sinua.</li>\n</ul>\n<h2 id=\"aloitus-ja-sivuston-tila--lisavalinnat\">Lisävalinnat</h2>\n<ul>\n<li>Samat listat ovat aina valikon kohdassa <strong>Tehtävät sinulle</strong>.</li>\n<li>Julkaisemattomien muutosten käsittely: <a href=\"/studio/ohjeet/luonnos-julkaisu-ja-peruminen\" data-ohje-kortti=\"luonnos-julkaisu-ja-peruminen\">Tallenna, julkaise ja peru muutos</a></li>\n<li>Ottelun lisääminen käsin: <a href=\"/studio/ohjeet/ottelun-lisaaminen\" data-ohje-kortti=\"ottelun-lisaaminen\">Lisää ottelu otteluohjelmaan</a></li>\n<li>Tilamerkkien selitykset: <a href=\"/studio/ohjeet/tilamerkit\" data-ohje-kortti=\"tilamerkit\">Tilamerkit ja listojen merkinnät</a></li>\n</ul>\n<div class=\"markdown-alert markdown-alert-note\">\n<p class=\"markdown-alert-title\">Hyvä tietää</p>\n<p>Harmaa rivi ja teksti <strong>Ei vielä tietoa</strong> tarkoittavat, ettei automaattinen työ ole vielä ajanut kertaakaan. Se ei vaadi toimia.</p>\n</div>\n<h2 id=\"aloitus-ja-sivuston-tila--jos-jokin-menee-vikaan\">Jos jokin menee vikaan</h2>\n<ul>\n<li>Rivi on punainen: sisältösi ei ole kadonnut. Katso <a href=\"/studio/ohjeet/aloituksessa-punainen-rivi\" data-ohje-kortti=\"aloituksessa-punainen-rivi\">Aloituksessa lukee Vaatii toimia tai Huomioitavaa</a>.</li>\n<li>Aloitus näyttää punaisen laatikon eikä rivejä: paina <strong>Päivitä</strong>. Jos laatikko jää, kerro tukihenkilölle sen teksti.</li>\n</ul>\n<p>Katso myös: <a href=\"/studio/ohjeet/studion-osat-ja-kirjautuminen\" data-ohje-kortti=\"studion-osat-ja-kirjautuminen\">Kirjaudu ja tutustu Studioon</a> · <a href=\"/studio/ohjeet/varmuuskopiot\" data-ohje-kortti=\"varmuuskopiot\">Tarkista ja lataa varmuuskopio</a> · <a href=\"/studio/ohjeet/tarkistettavat\" data-ohje-kortti=\"tarkistettavat\">Käy läpi tarkistettavat</a></p>\n",
          "teksti": "Milloin Aina kun avaat Studion. Aloitus kertoo yhdellä silmäyksellä, onko sivustolla kaikki kunnossa ja mikä odottaa sinua. Askeleet Avaa Studio. Aloitus aukeaa ensimmäisenä. Muualta pääset sinne yläpalkin painikkeesta Aloitus . ① Katso kohdan Sivuston tila yhteenveto: Kaikki kunnossa , Huomioitavaa tai Vaatii toimia . ② Lue rivit. Rivin nimen perässä tila lukee sanana, esim. Kunnossa , Huomio , Vaatii toimia tai Ei vielä tietoa . ③ Jos rivi on keltainen tai punainen, lue sen alla oleva ohje. Kerro tukihenkilölle rivin otsikko ja teksti. Sisältösi on silti tallessa. Voit jatkaa työtä normaalisti. Kohdassa Odottaa sinua paina korttia, jossa on luku. ⑤ Oikea lista aukeaa. Teksti Ei odottavia tarkoittaa, ettei siinä ole tehtävää. Jos näet kohdan Täydennä perustiedot , paina riviä. ⑥ Oikea kohta aukeaa valikosta. Jos lomake ei aukea itse, valitse listasta ylin kohta, esim. Osoite, sähköposti ja some . Kun haluat tuoreet tiedot kesken työn, paina Päivitä . ⑦ Rivit ja niiden merkitys: Rivi Mitä se kertoo Kun se ei ole vihreä Varmuuskopio Viikoittainen varmuuskopio, joka tehdään maanantaiyönä Kerro tukihenkilölle. Keltainen: kopio on tallessa, palautus toimii. Yöllinen huolto Ravintoloiden arvosanat ja vanhojen tiedostojen siivous joka yö Kerro tukihenkilölle, jos sama toistuu useana päivänä. Otteluohjelman haku Veikkausliigan ottelut haetaan automaattisesti Punainen: lisää tärkeät ottelut käsin ja kerro tukihenkilölle. Keltainen talvella on normaalia. Dokumenttikiintiö (arvio) Arvio siitä, paljonko sisältöä sivustolle mahtuu vielä Keltainen: kerro tukihenkilölle. Tila Arvio on normaali. Julkaisemattomat muutokset Sisältö, jossa on muutos, jota et ole julkaissut Paina Avaa julkaisemattomat muutokset . Julkaise tai hylkää muutos. Tulos Tiedät, onko sivustolla kaikki kunnossa. Näet, montako arvostelua, kommenttia ja muuta asiaa odottaa sinua. Lisävalinnat Samat listat ovat aina valikon kohdassa Tehtävät sinulle . Julkaisemattomien muutosten käsittely: Tallenna, julkaise ja peru muutos Ottelun lisääminen käsin: Lisää ottelu otteluohjelmaan Tilamerkkien selitykset: Tilamerkit ja listojen merkinnät Harmaa rivi ja teksti Ei vielä tietoa tarkoittavat, ettei automaattinen työ ole vielä ajanut kertaakaan. Se ei vaadi toimia. Jos jokin menee vikaan Rivi on punainen: sisältösi ei ole kadonnut. Katso Aloituksessa lukee Vaatii toimia tai Huomioitavaa . Aloitus näyttää punaisen laatikon eikä rivejä: paina Päivitä . Jos laatikko jää, kerro tukihenkilölle sen teksti. Katso myös: Kirjaudu ja tutustu Studioon · Tarkista ja lataa varmuuskopio · Käy läpi tarkistettavat",
          "otsikot": [
            {
              "id": "aloitus-ja-sivuston-tila--milloin",
              "teksti": "Milloin",
              "taso": 2
            },
            {
              "id": "aloitus-ja-sivuston-tila--askeleet",
              "teksti": "Askeleet",
              "taso": 2
            },
            {
              "id": "aloitus-ja-sivuston-tila--tulos",
              "teksti": "Tulos",
              "taso": 2
            },
            {
              "id": "aloitus-ja-sivuston-tila--lisavalinnat",
              "teksti": "Lisävalinnat",
              "taso": 2
            },
            {
              "id": "aloitus-ja-sivuston-tila--jos-jokin-menee-vikaan",
              "teksti": "Jos jokin menee vikaan",
              "taso": 2
            }
          ]
        },
        {
          "id": "luonnos-julkaisu-ja-peruminen",
          "otsikko": "Tallenna, julkaise ja peru muutos",
          "osio": "alkuun",
          "avainsanat": [
            "tallenna",
            "tallennus",
            "julkaise",
            "julkaisu",
            "luonnos",
            "peru",
            "kumoa",
            "palauta",
            "edellinen versio",
            "historia",
            "versiohistoria",
            "hylkää muutokset",
            "vahinko",
            "poistin vahingossa linkin",
            "virhe",
            "väärin"
          ],
          "tyypit": [
            "uutinen",
            "sivu",
            "jalkapalloTilasto",
            "ravintola",
            "klubiArvio",
            "tapahtuma",
            "galleriaAlbumi",
            "klubiToiminta",
            "hallitusJasen",
            "pelaaja",
            "arvokisa",
            "stadion",
            "lehtileike",
            "etusivu",
            "navigaatio",
            "yhteystiedot"
          ],
          "kesto": "noin 3 minuuttia",
          "paivitetty": "2026-10-08",
          "html": "<h2 id=\"luonnos-julkaisu-ja-peruminen--milloin\">Milloin</h2>\n<p>Aina kun muokkaat jotain. Muutos tallentuu itsestään luonnokseksi, ja sivustolle se menee vasta, kun painat <strong>Julkaise</strong>. Tästä kortista näet myös, miten perut virheen.</p>\n<h2 id=\"luonnos-julkaisu-ja-peruminen--askeleet\">Askeleet</h2>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/luonnos-julkaisu-ja-peruminen-01-alapalkki.webp\" aria-label=\"Suurenna kuva: Lomakkeen alapalkki. 1: tallennustila. 3: Julkaise-painike. 4: kolmen pisteen painike sen vieressä.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/luonnos-julkaisu-ja-peruminen-01-alapalkki.webp\" alt=\"Lomakkeen alapalkki. 1: tallennustila. 3: Julkaise-painike. 4: kolmen pisteen painike sen vieressä.\" width=\"646\" height=\"455\" loading=\"lazy\" decoding=\"async\"></button></p>\n<h3 id=\"luonnos-julkaisu-ja-peruminen--tallenna-ja-julkaise\">Tallenna ja julkaise</h3>\n<ol>\n<li>Kirjoita tai muuta kenttää. Muutos tallentuu itsestään. ①\nAlapalkissa vasemmalla lukee hetken <strong>Tallennettu</strong>, sitten esim. &quot;Muokattu juuri nyt&quot;. Tallennuspainiketta ei ole.</li>\n<li>Tee kaikki muutokset rauhassa. Voit välillä sulkea selaimen: luonnos säilyy.</li>\n<li>Kun kaikki on valmista, paina oikeassa alakulmassa <strong>Julkaise</strong>. ③\nRuudulle tulee ilmoitus <strong>Dokumentti on julkaistu</strong>, ja painike muuttuu harmaaksi. Sivusto päivittyy noin minuutissa.</li>\n</ol>\n<div class=\"markdown-alert markdown-alert-tip\">\n<p class=\"markdown-alert-title\">Vinkki</p>\n<p>Julkaise vasta lopuksi, kerran. Esimerkiksi ottelun jälkeen päivitä kaikki taulukon solut ja paina <strong>Julkaise</strong> vasta sitten.</p>\n</div>\n<h3 id=\"luonnos-julkaisu-ja-peruminen--peru-muutos-jota-et-ole-julkaissut\">Peru muutos, jota et ole julkaissut</h3>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/luonnos-julkaisu-ja-peruminen-02-hylkaa.webp\" aria-label=\"Suurenna kuva: Avattu toimintovalikko. 5: Hylkää muutokset.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/luonnos-julkaisu-ja-peruminen-02-hylkaa.webp\" alt=\"Avattu toimintovalikko. 5: Hylkää muutokset.\" width=\"646\" height=\"238\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol start=\"4\">\n<li>Oikeassa alakulmassa paina <strong>Julkaise</strong>-painikkeen vieressä olevaa kolmen pisteen painiketta (⋯). ④\nToimintovalikko aukeaa. Painikkeen nimi on <strong>Asiakirjatoiminnot</strong>.</li>\n<li>Valitse <strong>Hylkää muutokset</strong>. ⑤ Ikkunassa <strong>Hylätäänkö muutokset?</strong> paina <strong>Hylkää muutokset</strong>.\nLomake palaa samaksi kuin sivustolla nyt.</li>\n</ol>\n<h3 id=\"luonnos-julkaisu-ja-peruminen--palauta-aiempi-versio-historiasta\">Palauta aiempi versio historiasta</h3>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/luonnos-julkaisu-ja-peruminen-03-historia.webp\" aria-label=\"Suurenna kuva: Historiapaneeli. 6: Julkaistu lomakkeen yläreunassa. 7: Historia-välilehti. 8: aiempi versio. 9: Palauta-painike.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/luonnos-julkaisu-ja-peruminen-03-historia.webp\" alt=\"Historiapaneeli. 6: Julkaistu lomakkeen yläreunassa. 7: Historia-välilehti. 8: aiempi versio. 9: Palauta-painike.\" width=\"1280\" height=\"908\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol start=\"6\">\n<li>Lomakkeen yläreunassa vasemmalla paina <strong>Julkaistu</strong>. ⑥\nYläpalkki muuttuu vihreäksi. Lomake näyttää sivustolla olevan version.</li>\n<li>Alareunassa vasemmalla paina aikatekstiä, esim. &quot;Viimeksi julkaistu 2 pv sitten&quot;. Valitse oikealle aukeavasta paneelista välilehti <strong>Historia</strong>. ⑦</li>\n<li>Valitse listasta aiempi <strong>Julkaistu</strong>-rivi, jolloin kaikki oli vielä kunnossa. ⑧\nLomake näyttää sen version.</li>\n<li>Paina alhaalla oikealla <strong>Palauta</strong> ja sitten <strong>Vahvista</strong>. ⑨\nVanha versio tulee luonnokseksi. Sivusto ei vielä muutu.</li>\n<li>Paina lomakkeen yläreunasta <strong>Luonnos</strong>. Tarkista lomake ja paina <strong>Julkaise</strong>.</li>\n</ol>\n<div class=\"markdown-alert markdown-alert-note\">\n<p class=\"markdown-alert-title\">Hyvä tietää</p>\n<p>Kun yläpalkki on vihreä, <strong>Julkaise</strong>-painikkeen paikalla on punainen <strong>Poista julkaisu</strong>. Älä paina sitä: se vie sisällön pois sivustolta. Palaa painamalla <strong>Luonnos</strong>.</p>\n</div>\n<h2 id=\"luonnos-julkaisu-ja-peruminen--tulos\">Tulos</h2>\n<ul>\n<li>Julkaisun jälkeen <strong>Julkaise</strong> on harmaa, ja alapalkissa lukee &quot;Viimeksi julkaistu juuri nyt&quot;. Muutos näkyy sivustolla noin minuutin kuluessa.</li>\n<li>Hylkäyksen tai palautuksen jälkeen lomake näyttää vanhan sisällön.</li>\n</ul>\n<h2 id=\"luonnos-julkaisu-ja-peruminen--lisavalinnat\">Lisävalinnat</h2>\n<ul>\n<li>Kirjoitusvirheen perut heti näppäimillä Ctrl + Z (Macissa Cmd + Z).</li>\n<li>Taulukosta poistetun rivin saat takaisin ilmoituksen painikkeesta <strong>Kumoa</strong>.</li>\n<li>Muutos näkyviin ennen julkaisua: <a href=\"/studio/ohjeet/esikatselu\" data-ohje-kortti=\"esikatselu\">Katso muutos ennen julkaisua</a></li>\n<li>Vanhempi virhe: <a href=\"/studio/ohjeet/vanhan-version-palautus\" data-ohje-kortti=\"vanhan-version-palautus\">Palauta vanha versio varmuuskopiosta</a></li>\n<li>Kokonaan poistettu sisältö: <a href=\"/studio/ohjeet/poistetun-palautus\" data-ohje-kortti=\"poistetun-palautus\">Palauta poistettu sisältö</a></li>\n</ul>\n<div class=\"markdown-alert markdown-alert-note\">\n<p class=\"markdown-alert-title\">Hyvä tietää</p>\n<p>Historia säilyy vain muutaman päivän. Vanhempiin virheisiin käytä varmuuskopiota. Tarkemmin: <a href=\"/studio/ohjeet/tukihenkilo\" data-ohje-kortti=\"tukihenkilo\">Mihin tarvitset tukihenkilöä</a>.</p>\n</div>\n<h2 id=\"luonnos-julkaisu-ja-peruminen--jos-jokin-menee-vikaan\">Jos jokin menee vikaan</h2>\n<ul>\n<li><strong>Julkaise</strong> on harmaa, ja välilehden nimen vieressä on punainen huutomerkki: jokin pakollinen kenttä puuttuu. Katso <a href=\"/studio/ohjeet/julkaise-ei-onnistu\" data-ohje-kortti=\"julkaise-ei-onnistu\">Julkaise on harmaa</a>.</li>\n<li><strong>Hylkää muutokset</strong> puuttuu valikosta: muutoksia ei ole, kaikki on jo julkaistu.</li>\n<li>Sisältöä ei ole koskaan julkaistu: <strong>Hylkää muutokset</strong> poistaa koko luonnoksen. Ikkuna kysyy sitä ennen varmistuksen.</li>\n<li>Historiassa lukee &quot;Emme löytäneet valittua dokumentin versiota&quot;: paina ensin lomakkeen yläreunasta <strong>Julkaistu</strong> ja valitse versio uudelleen.</li>\n<li>Historiassa ei ole tarpeeksi vanhaa versiota: käytä toimintovalikon kohtaa <strong>Palauta varmuuskopiosta</strong>.</li>\n</ul>\n<p>Katso myös: <a href=\"/studio/ohjeet/aloitus-ja-sivuston-tila\" data-ohje-kortti=\"aloitus-ja-sivuston-tila\">Lue Aloitus ja sivuston tila</a> · <a href=\"/studio/ohjeet/muutos-ei-nay-sivustolla\" data-ohje-kortti=\"muutos-ei-nay-sivustolla\">Muutos ei näy sivustolla</a></p>\n",
          "teksti": "Milloin Aina kun muokkaat jotain. Muutos tallentuu itsestään luonnokseksi, ja sivustolle se menee vasta, kun painat Julkaise . Tästä kortista näet myös, miten perut virheen. Askeleet Tallenna ja julkaise Kirjoita tai muuta kenttää. Muutos tallentuu itsestään. ① Alapalkissa vasemmalla lukee hetken Tallennettu , sitten esim. \"Muokattu juuri nyt\". Tallennuspainiketta ei ole. Tee kaikki muutokset rauhassa. Voit välillä sulkea selaimen: luonnos säilyy. Kun kaikki on valmista, paina oikeassa alakulmassa Julkaise . ③ Ruudulle tulee ilmoitus Dokumentti on julkaistu , ja painike muuttuu harmaaksi. Sivusto päivittyy noin minuutissa. Julkaise vasta lopuksi, kerran. Esimerkiksi ottelun jälkeen päivitä kaikki taulukon solut ja paina Julkaise vasta sitten. Peru muutos, jota et ole julkaissut Oikeassa alakulmassa paina Julkaise -painikkeen vieressä olevaa kolmen pisteen painiketta (⋯). ④ Toimintovalikko aukeaa. Painikkeen nimi on Asiakirjatoiminnot . Valitse Hylkää muutokset . ⑤ Ikkunassa Hylätäänkö muutokset? paina Hylkää muutokset . Lomake palaa samaksi kuin sivustolla nyt. Palauta aiempi versio historiasta Lomakkeen yläreunassa vasemmalla paina Julkaistu . ⑥ Yläpalkki muuttuu vihreäksi. Lomake näyttää sivustolla olevan version. Alareunassa vasemmalla paina aikatekstiä, esim. \"Viimeksi julkaistu 2 pv sitten\". Valitse oikealle aukeavasta paneelista välilehti Historia . ⑦ Valitse listasta aiempi Julkaistu -rivi, jolloin kaikki oli vielä kunnossa. ⑧ Lomake näyttää sen version. Paina alhaalla oikealla Palauta ja sitten Vahvista . ⑨ Vanha versio tulee luonnokseksi. Sivusto ei vielä muutu. Paina lomakkeen yläreunasta Luonnos . Tarkista lomake ja paina Julkaise . Kun yläpalkki on vihreä, Julkaise -painikkeen paikalla on punainen Poista julkaisu . Älä paina sitä: se vie sisällön pois sivustolta. Palaa painamalla Luonnos . Tulos Julkaisun jälkeen Julkaise on harmaa, ja alapalkissa lukee \"Viimeksi julkaistu juuri nyt\". Muutos näkyy sivustolla noin minuutin kuluessa. Hylkäyksen tai palautuksen jälkeen lomake näyttää vanhan sisällön. Lisävalinnat Kirjoitusvirheen perut heti näppäimillä Ctrl + Z (Macissa Cmd + Z). Taulukosta poistetun rivin saat takaisin ilmoituksen painikkeesta Kumoa . Muutos näkyviin ennen julkaisua: Katso muutos ennen julkaisua Vanhempi virhe: Palauta vanha versio varmuuskopiosta Kokonaan poistettu sisältö: Palauta poistettu sisältö Historia säilyy vain muutaman päivän. Vanhempiin virheisiin käytä varmuuskopiota. Tarkemmin: Mihin tarvitset tukihenkilöä . Jos jokin menee vikaan Julkaise on harmaa, ja välilehden nimen vieressä on punainen huutomerkki: jokin pakollinen kenttä puuttuu. Katso Julkaise on harmaa . Hylkää muutokset puuttuu valikosta: muutoksia ei ole, kaikki on jo julkaistu. Sisältöä ei ole koskaan julkaistu: Hylkää muutokset poistaa koko luonnoksen. Ikkuna kysyy sitä ennen varmistuksen. Historiassa lukee \"Emme löytäneet valittua dokumentin versiota\": paina ensin lomakkeen yläreunasta Julkaistu ja valitse versio uudelleen. Historiassa ei ole tarpeeksi vanhaa versiota: käytä toimintovalikon kohtaa Palauta varmuuskopiosta . Katso myös: Lue Aloitus ja sivuston tila · Muutos ei näy sivustolla",
          "otsikot": [
            {
              "id": "luonnos-julkaisu-ja-peruminen--milloin",
              "teksti": "Milloin",
              "taso": 2
            },
            {
              "id": "luonnos-julkaisu-ja-peruminen--askeleet",
              "teksti": "Askeleet",
              "taso": 2
            },
            {
              "id": "luonnos-julkaisu-ja-peruminen--tallenna-ja-julkaise",
              "teksti": "Tallenna ja julkaise",
              "taso": 3
            },
            {
              "id": "luonnos-julkaisu-ja-peruminen--peru-muutos-jota-et-ole-julkaissut",
              "teksti": "Peru muutos, jota et ole julkaissut",
              "taso": 3
            },
            {
              "id": "luonnos-julkaisu-ja-peruminen--palauta-aiempi-versio-historiasta",
              "teksti": "Palauta aiempi versio historiasta",
              "taso": 3
            },
            {
              "id": "luonnos-julkaisu-ja-peruminen--tulos",
              "teksti": "Tulos",
              "taso": 2
            },
            {
              "id": "luonnos-julkaisu-ja-peruminen--lisavalinnat",
              "teksti": "Lisävalinnat",
              "taso": 2
            },
            {
              "id": "luonnos-julkaisu-ja-peruminen--jos-jokin-menee-vikaan",
              "teksti": "Jos jokin menee vikaan",
              "taso": 2
            }
          ]
        },
        {
          "id": "etsi-haulla",
          "otsikko": "Etsi sisältö haulla",
          "osio": "alkuun",
          "avainsanat": [
            "haku",
            "hae",
            "etsi",
            "löydä",
            "en löydä",
            "missä on",
            "vanha uutinen",
            "nimellä",
            "suurennuslasi"
          ],
          "tyypit": [],
          "kesto": "noin 1 minuutti",
          "paivitetty": "2026-10-08",
          "html": "<h2 id=\"etsi-haulla--milloin\">Milloin</h2>\n<p>Kun et löydä uutista, sivua tai muuta sisältöä valikosta. Esimerkiksi uutisia on yli 500, eikä lista näytä niitä kaikkia kerralla.</p>\n<h2 id=\"etsi-haulla--askeleet\">Askeleet</h2>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/etsi-haulla-01-ylapalkki.webp\" aria-label=\"Suurenna kuva: Studion haku. 1: suurennuslasi yläpalkissa. 3: hakutulos listassa.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/etsi-haulla-01-ylapalkki.webp\" alt=\"Studion haku. 1: suurennuslasi yläpalkissa. 3: hakutulos listassa.\" width=\"867\" height=\"360\" loading=\"lazy\" decoding=\"async\"></button></p>\n<h3 id=\"etsi-haulla--koko-studiosta\">Koko Studiosta</h3>\n<ol>\n<li>Yläpalkissa vasemmalla, plus-painikkeen vieressä, paina suurennuslasia. ①\nKun viet hiiren sen päälle, näet tekstin <strong>Etsi</strong>. Hakuikkuna aukeaa.</li>\n<li>Kirjoita otsikon tai nimen alku, esim. &quot;vuosikokous&quot;.</li>\n<li>Valitse oikea tulos listasta. ③ Lomake aukeaa.</li>\n</ol>\n<h3 id=\"etsi-haulla--yhdesta-listasta\">Yhdestä listasta</h3>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/etsi-haulla-02-lista.webp\" aria-label=\"Suurenna kuva: Uutiset-lista. 5: Etsi listalta -kenttä listan yläreunassa.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/etsi-haulla-02-lista.webp\" alt=\"Uutiset-lista. 5: Etsi listalta -kenttä listan yläreunassa.\" width=\"481\" height=\"168\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol start=\"4\">\n<li>Avaa lista valikosta, esim. <strong>Uutiset</strong>.</li>\n<li>Kirjoita listan yläreunan kenttään <strong>Etsi listalta</strong> hakusana. ⑤</li>\n<li>Valitse oikea rivi.</li>\n</ol>\n<h2 id=\"etsi-haulla--tulos\">Tulos</h2>\n<ul>\n<li>Haettu sisältö aukeaa lomakkeeksi oikealle, ja voit muokata sitä.</li>\n</ul>\n<h2 id=\"etsi-haulla--lisavalinnat\">Lisävalinnat</h2>\n<ul>\n<li>Kommentoijan tai arvostelijan nimellä haku: <a href=\"/studio/ohjeet/tietosuojapyynto\" data-ohje-kortti=\"tietosuojapyynto\">Poista henkilön tiedot pyynnöstä</a></li>\n<li>Sivuston kävijöiden uutishaku toimii itsestään, kun uutinen on julkaistu.</li>\n</ul>\n<h2 id=\"etsi-haulla--jos-jokin-menee-vikaan\">Jos jokin menee vikaan</h2>\n<ul>\n<li><strong>Tuloksia ei löytynyt</strong>: kokeile lyhyempää sanaa tai pelkkää sanan alkua.</li>\n<li>Löydät sisällön, mutta et tiedä, millä sivulla se näkyy: katso lomakkeen yläreunan kohta <strong>Käytetty yhdellä sivulla</strong>. Ohje: <a href=\"/studio/ohjeet/esikatselu\" data-ohje-kortti=\"esikatselu\">Katso muutos ennen julkaisua</a>.</li>\n</ul>\n<p>Katso myös: <a href=\"/studio/ohjeet/studion-osat-ja-kirjautuminen\" data-ohje-kortti=\"studion-osat-ja-kirjautuminen\">Kirjaudu ja tutustu Studioon</a> · <a href=\"/studio/ohjeet/valikon-kartta\" data-ohje-kortti=\"valikon-kartta\">Studion valikon kartta</a></p>\n",
          "teksti": "Milloin Kun et löydä uutista, sivua tai muuta sisältöä valikosta. Esimerkiksi uutisia on yli 500, eikä lista näytä niitä kaikkia kerralla. Askeleet Koko Studiosta Yläpalkissa vasemmalla, plus-painikkeen vieressä, paina suurennuslasia. ① Kun viet hiiren sen päälle, näet tekstin Etsi . Hakuikkuna aukeaa. Kirjoita otsikon tai nimen alku, esim. \"vuosikokous\". Valitse oikea tulos listasta. ③ Lomake aukeaa. Yhdestä listasta Avaa lista valikosta, esim. Uutiset . Kirjoita listan yläreunan kenttään Etsi listalta hakusana. ⑤ Valitse oikea rivi. Tulos Haettu sisältö aukeaa lomakkeeksi oikealle, ja voit muokata sitä. Lisävalinnat Kommentoijan tai arvostelijan nimellä haku: Poista henkilön tiedot pyynnöstä Sivuston kävijöiden uutishaku toimii itsestään, kun uutinen on julkaistu. Jos jokin menee vikaan Tuloksia ei löytynyt : kokeile lyhyempää sanaa tai pelkkää sanan alkua. Löydät sisällön, mutta et tiedä, millä sivulla se näkyy: katso lomakkeen yläreunan kohta Käytetty yhdellä sivulla . Ohje: Katso muutos ennen julkaisua . Katso myös: Kirjaudu ja tutustu Studioon · Studion valikon kartta",
          "otsikot": [
            {
              "id": "etsi-haulla--milloin",
              "teksti": "Milloin",
              "taso": 2
            },
            {
              "id": "etsi-haulla--askeleet",
              "teksti": "Askeleet",
              "taso": 2
            },
            {
              "id": "etsi-haulla--koko-studiosta",
              "teksti": "Koko Studiosta",
              "taso": 3
            },
            {
              "id": "etsi-haulla--yhdesta-listasta",
              "teksti": "Yhdestä listasta",
              "taso": 3
            },
            {
              "id": "etsi-haulla--tulos",
              "teksti": "Tulos",
              "taso": 2
            },
            {
              "id": "etsi-haulla--lisavalinnat",
              "teksti": "Lisävalinnat",
              "taso": 2
            },
            {
              "id": "etsi-haulla--jos-jokin-menee-vikaan",
              "teksti": "Jos jokin menee vikaan",
              "taso": 2
            }
          ]
        },
        {
          "id": "esikatselu",
          "otsikko": "Katso muutos ennen julkaisua",
          "osio": "alkuun",
          "avainsanat": [
            "esikatselu",
            "katso sivu",
            "miltä näyttää",
            "millä sivulla",
            "missä näkyy",
            "käytetty sivulla",
            "luonnos sivulla",
            "esikatselutila"
          ],
          "tyypit": [
            "uutinen",
            "sivu",
            "jalkapalloTilasto",
            "tapahtuma",
            "ottelu",
            "ravintola",
            "hallitusJasen",
            "klubiToiminta",
            "uutisKategoria",
            "ohjaus",
            "kommentti",
            "klubiArvio"
          ],
          "kesto": "noin 2 minuuttia",
          "paivitetty": "2026-10-08",
          "html": "<h2 id=\"esikatselu--milloin\">Milloin</h2>\n<p>Kun haluat nähdä, miltä muutos näyttää sivulla, ennen kuin julkaiset sen. Samalla näet, millä sivulla sisältö näkyy.</p>\n<h2 id=\"esikatselu--askeleet\">Askeleet</h2>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/esikatselu-01-kaytetty.webp\" aria-label=\"Suurenna kuva: Lomakkeen yläreuna. 2: Käytetty yhdellä sivulla. 3: linkki sivulle, jolla sisältö näkyy.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/esikatselu-01-kaytetty.webp\" alt=\"Lomakkeen yläreuna. 2: Käytetty yhdellä sivulla. 3: linkki sivulle, jolla sisältö näkyy.\" width=\"672\" height=\"202\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol>\n<li>Avaa muokattava sisältö, esim. uutinen.</li>\n<li>Lomakkeen yläreunassa, otsikon alla, paina kohtaa <strong>Käytetty yhdellä sivulla</strong>. ②\nKohta aukeaa, ja sen alla näkyy sivun nimi ja osoite. Monella sivulla näkyvästä lukee esim. &quot;Käytetty 2 sivulla&quot;.</li>\n<li>Paina sivun nimeä. ③ Sivu aukeaa työkaluun <strong>Esikatselu</strong>.</li>\n</ol>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/esikatselu-02-esikatselu.webp\" aria-label=\"Suurenna kuva: Esikatselu. 4: sivu luonnoksineen. 5: lomake. 6: Sisältö yläpalkissa.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/esikatselu-02-esikatselu.webp\" alt=\"Esikatselu. 4: sivu luonnoksineen. 5: lomake. 6: Sisältö yläpalkissa.\" width=\"1280\" height=\"920\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol start=\"4\">\n<li>Katso sivua. Siinä näkyvät myös julkaisemattomat muutokset. ④</li>\n<li>Muokkaa tarvittaessa lomakkeella. ⑤ Sivu päivittyy samalla.</li>\n<li>Kun sivu näyttää hyvältä, paina lomakkeen oikeasta alakulmasta <strong>Julkaise</strong>. Palaa muokkaukseen yläpalkin painikkeesta <strong>Sisältö</strong>. ⑥</li>\n</ol>\n<h2 id=\"esikatselu--tulos\">Tulos</h2>\n<ul>\n<li>Näit sivun sellaisena kuin se näkyy julkaisun jälkeen.</li>\n<li>Kävijät eivät näe luonnosta ennen kuin painat <strong>Julkaise</strong>.</li>\n</ul>\n<h2 id=\"esikatselu--lisavalinnat\">Lisävalinnat</h2>\n<ul>\n<li>Esikatselun voi avata myös suoraan yläpalkista: <strong>Esikatselu</strong> → selaa oikealle sivulle → valitse sisältö listasta <strong>Tämän sivun dokumentit</strong>.</li>\n<li>Hyväksymätön ravintola-arvostelu ei näy esikatselussakaan. Se näkyy vain hyväksyntälistassa.</li>\n</ul>\n<h2 id=\"esikatselu--jos-jokin-menee-vikaan\">Jos jokin menee vikaan</h2>\n<ul>\n<li>Kohdassa lukee <strong>Ei käytetty millään sivulla</strong>: sisältö ei vielä näy missään. Taulukon kohdalla lue sen alla oleva ohje.</li>\n<li>Kohdassa lukee <strong>Ratkaistaan sijainteja...</strong> pitkään: odota hetki tai avaa sisältö uudelleen.</li>\n<li>Sivuston tai Studion yläreunassa on palkki &quot;Esikatselutila: näet myös julkaisemattomat luonnokset&quot;. Se jää näkyviin esikatselun jälkeen. Paina palkista &quot;Poistu esikatselusta&quot;. Katso <a href=\"/studio/ohjeet/sivusto-jaa-esikatselutilaan\" data-ohje-kortti=\"sivusto-jaa-esikatselutilaan\">Sivuston yläreunassa lukee Esikatselutila</a>.</li>\n</ul>\n<p>Katso myös: <a href=\"/studio/ohjeet/luonnos-julkaisu-ja-peruminen\" data-ohje-kortti=\"luonnos-julkaisu-ja-peruminen\">Tallenna, julkaise ja peru muutos</a> · <a href=\"/studio/ohjeet/muutos-ei-nay-sivustolla\" data-ohje-kortti=\"muutos-ei-nay-sivustolla\">Muutos ei näy sivustolla</a></p>\n",
          "teksti": "Milloin Kun haluat nähdä, miltä muutos näyttää sivulla, ennen kuin julkaiset sen. Samalla näet, millä sivulla sisältö näkyy. Askeleet Avaa muokattava sisältö, esim. uutinen. Lomakkeen yläreunassa, otsikon alla, paina kohtaa Käytetty yhdellä sivulla . ② Kohta aukeaa, ja sen alla näkyy sivun nimi ja osoite. Monella sivulla näkyvästä lukee esim. \"Käytetty 2 sivulla\". Paina sivun nimeä. ③ Sivu aukeaa työkaluun Esikatselu . Katso sivua. Siinä näkyvät myös julkaisemattomat muutokset. ④ Muokkaa tarvittaessa lomakkeella. ⑤ Sivu päivittyy samalla. Kun sivu näyttää hyvältä, paina lomakkeen oikeasta alakulmasta Julkaise . Palaa muokkaukseen yläpalkin painikkeesta Sisältö . ⑥ Tulos Näit sivun sellaisena kuin se näkyy julkaisun jälkeen. Kävijät eivät näe luonnosta ennen kuin painat Julkaise . Lisävalinnat Esikatselun voi avata myös suoraan yläpalkista: Esikatselu → selaa oikealle sivulle → valitse sisältö listasta Tämän sivun dokumentit . Hyväksymätön ravintola-arvostelu ei näy esikatselussakaan. Se näkyy vain hyväksyntälistassa. Jos jokin menee vikaan Kohdassa lukee Ei käytetty millään sivulla : sisältö ei vielä näy missään. Taulukon kohdalla lue sen alla oleva ohje. Kohdassa lukee Ratkaistaan sijainteja... pitkään: odota hetki tai avaa sisältö uudelleen. Sivuston tai Studion yläreunassa on palkki \"Esikatselutila: näet myös julkaisemattomat luonnokset\". Se jää näkyviin esikatselun jälkeen. Paina palkista \"Poistu esikatselusta\". Katso Sivuston yläreunassa lukee Esikatselutila . Katso myös: Tallenna, julkaise ja peru muutos · Muutos ei näy sivustolla",
          "otsikot": [
            {
              "id": "esikatselu--milloin",
              "teksti": "Milloin",
              "taso": 2
            },
            {
              "id": "esikatselu--askeleet",
              "teksti": "Askeleet",
              "taso": 2
            },
            {
              "id": "esikatselu--tulos",
              "teksti": "Tulos",
              "taso": 2
            },
            {
              "id": "esikatselu--lisavalinnat",
              "teksti": "Lisävalinnat",
              "taso": 2
            },
            {
              "id": "esikatselu--jos-jokin-menee-vikaan",
              "teksti": "Jos jokin menee vikaan",
              "taso": 2
            }
          ]
        }
      ]
    },
    {
      "id": "tekstit",
      "otsikko": "Tekstit ja kuvat",
      "kortit": [
        {
          "id": "kuva",
          "otsikko": "Lisää tai vaihda kuva",
          "osio": "tekstit",
          "avainsanat": [
            "kuva",
            "valokuva",
            "kansikuva",
            "vaihda kuva",
            "lisää kuva",
            "rajaa",
            "rajaus",
            "tarkennuspiste",
            "kasvot",
            "alt",
            "kuvaus",
            "kuvateksti",
            "vanha kuva",
            "ladattu kuva",
            "kuvasarja",
            "monta kuvaa"
          ],
          "tyypit": [
            "uutinen",
            "sivu",
            "tapahtuma",
            "klubiToiminta",
            "galleriaAlbumi",
            "ravintola",
            "pelaaja",
            "stadion",
            "hallitusJasen",
            "etusivu"
          ],
          "kesto": "noin 3 minuuttia",
          "paivitetty": "2026-10-08",
          "html": "<h2 id=\"kuva--milloin\">Milloin</h2>\n<p>Kun lisäät kuvan uutiseen, sivulle tai muuhun sisältöön, tai vaihdat vanhan kuvan. Kuva näkyy sivulla ja usein myös silloin, kun linkki jaetaan.</p>\n<h2 id=\"kuva--ennen-kuin-aloitat\">Ennen kuin aloitat</h2>\n<ul>\n<li>Kuva on tietokoneella tai puhelimessa. Puhelimen kuvan voi ladata sellaisenaan, sivusto pienentää sen itse.</li>\n</ul>\n<h2 id=\"kuva--askeleet\">Askeleet</h2>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/kuva-01-kentta.webp\" aria-label=\"Suurenna kuva: Kansikuva-kenttä. 2: kuva. 3: Vaihtoehtoinen teksti. 4: Kuvateksti. 5: rajauspainike.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/kuva-01-kentta.webp\" alt=\"Kansikuva-kenttä. 2: kuva. 3: Vaihtoehtoinen teksti. 4: Kuvateksti. 5: rajauspainike.\" width=\"659\" height=\"693\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol>\n<li>Avaa sisältö ja etsi kuvakenttä, esim. <strong>Kansikuva</strong>.\nTekstin sekaan: napsauta tekstiin kohtaan ja paina työkalupalkista <strong>Kuva</strong>.</li>\n<li>Raahaa kuva kenttään, tai paina <strong>Lataa</strong> ja valitse kuva. ②</li>\n<li>Kirjoita <strong>Vaihtoehtoinen teksti (alt)</strong>: mitä kuvassa näkyy, 1–2 lausetta. ③\nEsim. &quot;Klubilaiset Lahden torilla vappuna&quot;. Ruudunlukija lukee tämän näkövammaiselle.</li>\n<li>Halutessasi kirjoita <strong>Kuvateksti (valinnainen)</strong>. ④ Se näkyy kuvan alla.</li>\n<li>Kuvan oikeassa yläkulmassa on kaksi pientä painiketta. Paina vasemmanpuoleista, <strong>Rajaa kuva</strong>. ⑤\nIkkuna <strong>Muokkaa hotspotia ja rajaa</strong> aukeaa.</li>\n</ol>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/kuva-02-rajaus.webp\" aria-label=\"Suurenna kuva: Rajausikkuna. 6: ympyrä, joka merkitsee kuvan tärkeimmän kohdan.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/kuva-02-rajaus.webp\" alt=\"Rajausikkuna. 6: ympyrä, joka merkitsee kuvan tärkeimmän kohdan.\" width=\"638\" height=\"602\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol start=\"6\">\n<li>Vedä ympyrä kuvan tärkeimmän kohdan päälle, esim. kasvojen. ⑥\nKehyksen kulmista voit lisäksi rajata reunoja pois. Sulje ikkuna oikean yläkulman rastista (×).</li>\n<li>Lopuksi paina <strong>Julkaise</strong>.</li>\n</ol>\n<h2 id=\"kuva--tulos\">Tulos</h2>\n<ul>\n<li>Kuva näkyy lomakkeella, ja <strong>Vaihtoehtoinen teksti (alt)</strong> on täytetty.</li>\n<li>Sivulla kuvan tärkein kohta pysyy näkyvissä, vaikka kuva rajataan eri kokoon.</li>\n</ul>\n<h2 id=\"kuva--lisavalinnat\">Lisävalinnat</h2>\n<ul>\n<li>Vaihda kuva: paina kuvan oikean yläkulman kolmea pistettä. Valitse ylin <strong>Lataa</strong> ja uusi kuva koneelta. Tarkista kuvaus.</li>\n<li>Käytä aiemmin ladattua kuvaa: paina kentässä <strong>Valitse</strong> (tai kuvan kolmen pisteen valikosta <strong>Valitse</strong>). Kuvat ovat uusimmasta vanhimpaan, ja lisää saat painikkeesta <strong>Lataa lisää</strong>. Kirjoita kuvaus tähän käyttöön sopivaksi.</li>\n<li>Poista kuva: kuvan kolmen pisteen valikosta <strong>Tyhjennä kenttä</strong>.</li>\n<li>Useita kuvia kerralla tekstiin: valitse työkalupalkista <strong>Kuvasarja (useita kuvia)</strong>. Raahaa kuvat kenttään <strong>Kuvat</strong> ja kirjoita <strong>Mitä kuvissa on (yhteinen kuvaus)</strong>. Kohdassa <strong>Kuvien muoto</strong> voit valita, rajataanko kuvat neliöiksi.</li>\n<li>Iso kuvajoukko omaksi albumiksi: <a href=\"/studio/ohjeet/galleria-albumi\" data-ohje-kortti=\"galleria-albumi\">Lisää kuva-albumi galleriaan</a></li>\n<li>Kuva linkin jakoon: <a href=\"/studio/ohjeet/jakokuva\" data-ohje-kortti=\"jakokuva\">Valitse kuva, joka näkyy jaossa</a></li>\n</ul>\n<h2 id=\"kuva--jos-jokin-menee-vikaan\">Jos jokin menee vikaan</h2>\n<ul>\n<li>Kentän <strong>Vaihtoehtoinen teksti (alt)</strong> nimen vieressä on punainen huutomerkki. Vie hiiri sen päälle: &quot;Alt-teksti on pakollinen (3–200 merkkiä).&quot; Kirjoita kuvaus kenttään.</li>\n<li>Uutisessa keltainen &quot;Uutisessa ei ole kansikuvaa eikä isoa kuvaa tekstissä&quot;: uutisen voi julkaista silti. Listassa näkyy silloin pelkkä teksti.</li>\n<li>Sivulla kuvasta leikkautuu tärkeä kohta pois: siirrä ympyrää rajausikkunassa ja julkaise uudelleen.</li>\n</ul>\n<p>Katso myös: <a href=\"/studio/ohjeet/linkit\" data-ohje-kortti=\"linkit\">Lisää linkki</a> · <a href=\"/studio/ohjeet/uutisen-kirjoittaminen\" data-ohje-kortti=\"uutisen-kirjoittaminen\">Kirjoita uutinen</a></p>\n",
          "teksti": "Milloin Kun lisäät kuvan uutiseen, sivulle tai muuhun sisältöön, tai vaihdat vanhan kuvan. Kuva näkyy sivulla ja usein myös silloin, kun linkki jaetaan. Ennen kuin aloitat Kuva on tietokoneella tai puhelimessa. Puhelimen kuvan voi ladata sellaisenaan, sivusto pienentää sen itse. Askeleet Avaa sisältö ja etsi kuvakenttä, esim. Kansikuva . Tekstin sekaan: napsauta tekstiin kohtaan ja paina työkalupalkista Kuva . Raahaa kuva kenttään, tai paina Lataa ja valitse kuva. ② Kirjoita Vaihtoehtoinen teksti (alt) : mitä kuvassa näkyy, 1–2 lausetta. ③ Esim. \"Klubilaiset Lahden torilla vappuna\". Ruudunlukija lukee tämän näkövammaiselle. Halutessasi kirjoita Kuvateksti (valinnainen) . ④ Se näkyy kuvan alla. Kuvan oikeassa yläkulmassa on kaksi pientä painiketta. Paina vasemmanpuoleista, Rajaa kuva . ⑤ Ikkuna Muokkaa hotspotia ja rajaa aukeaa. Vedä ympyrä kuvan tärkeimmän kohdan päälle, esim. kasvojen. ⑥ Kehyksen kulmista voit lisäksi rajata reunoja pois. Sulje ikkuna oikean yläkulman rastista (×). Lopuksi paina Julkaise . Tulos Kuva näkyy lomakkeella, ja Vaihtoehtoinen teksti (alt) on täytetty. Sivulla kuvan tärkein kohta pysyy näkyvissä, vaikka kuva rajataan eri kokoon. Lisävalinnat Vaihda kuva: paina kuvan oikean yläkulman kolmea pistettä. Valitse ylin Lataa ja uusi kuva koneelta. Tarkista kuvaus. Käytä aiemmin ladattua kuvaa: paina kentässä Valitse (tai kuvan kolmen pisteen valikosta Valitse ). Kuvat ovat uusimmasta vanhimpaan, ja lisää saat painikkeesta Lataa lisää . Kirjoita kuvaus tähän käyttöön sopivaksi. Poista kuva: kuvan kolmen pisteen valikosta Tyhjennä kenttä . Useita kuvia kerralla tekstiin: valitse työkalupalkista Kuvasarja (useita kuvia) . Raahaa kuvat kenttään Kuvat ja kirjoita Mitä kuvissa on (yhteinen kuvaus) . Kohdassa Kuvien muoto voit valita, rajataanko kuvat neliöiksi. Iso kuvajoukko omaksi albumiksi: Lisää kuva-albumi galleriaan Kuva linkin jakoon: Valitse kuva, joka näkyy jaossa Jos jokin menee vikaan Kentän Vaihtoehtoinen teksti (alt) nimen vieressä on punainen huutomerkki. Vie hiiri sen päälle: \"Alt-teksti on pakollinen (3–200 merkkiä).\" Kirjoita kuvaus kenttään. Uutisessa keltainen \"Uutisessa ei ole kansikuvaa eikä isoa kuvaa tekstissä\": uutisen voi julkaista silti. Listassa näkyy silloin pelkkä teksti. Sivulla kuvasta leikkautuu tärkeä kohta pois: siirrä ympyrää rajausikkunassa ja julkaise uudelleen. Katso myös: Lisää linkki · Kirjoita uutinen",
          "otsikot": [
            {
              "id": "kuva--milloin",
              "teksti": "Milloin",
              "taso": 2
            },
            {
              "id": "kuva--ennen-kuin-aloitat",
              "teksti": "Ennen kuin aloitat",
              "taso": 2
            },
            {
              "id": "kuva--askeleet",
              "teksti": "Askeleet",
              "taso": 2
            },
            {
              "id": "kuva--tulos",
              "teksti": "Tulos",
              "taso": 2
            },
            {
              "id": "kuva--lisavalinnat",
              "teksti": "Lisävalinnat",
              "taso": 2
            },
            {
              "id": "kuva--jos-jokin-menee-vikaan",
              "teksti": "Jos jokin menee vikaan",
              "taso": 2
            }
          ]
        },
        {
          "id": "linkit",
          "otsikko": "Lisää linkki",
          "osio": "tekstit",
          "avainsanat": [
            "linkki",
            "linkitä",
            "osoite",
            "toiselle sivulle",
            "toinen sivusto",
            "sähköposti",
            "puhelin",
            "tiedosto",
            "pdf",
            "uusi välilehti",
            "ketju",
            "mihin linkki vie"
          ],
          "tyypit": [
            "uutinen",
            "sivu",
            "tapahtuma",
            "klubiToiminta",
            "navigaatio",
            "etusivu",
            "ohjaus",
            "ravintola",
            "jalkapalloTilasto",
            "pelaaja",
            "arvokisa",
            "stadion",
            "lehtileike"
          ],
          "kesto": "noin 2 minuuttia",
          "paivitetty": "2026-10-08",
          "html": "<h2 id=\"linkit--milloin\">Milloin</h2>\n<p>Kun haluat, että sana tekstissä vie toiselle sivulle, toiselle sivustolle, sähköpostiin tai tiedostoon. Sama valinta <strong>Mihin linkki vie?</strong> on myös valikossa, etusivun pikalinkeissä, painikkeissa ja klubin toiminnan vuosilinkeissä.</p>\n<h2 id=\"linkit--askeleet\">Askeleet</h2>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/linkit-01-tyokalupalkki.webp\" aria-label=\"Suurenna kuva: Tekstieditori. 1: maalattu sana. 2: Linkki-painike työkalupalkissa.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/linkit-01-tyokalupalkki.webp\" alt=\"Tekstieditori. 1: maalattu sana. 2: Linkki-painike työkalupalkissa.\" width=\"628\" height=\"137\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol>\n<li>Maalaa tekstistä sana tai lause, josta linkki tehdään. ①</li>\n<li>Paina työkalupalkista <strong>Linkki</strong> (ketjun kuva). ②\nJos sitä ei näy, paina ensin luettelopainikkeiden oikealla puolella olevaa kolmea pistettä (<strong>Näytä lisää</strong>). Ikkuna <strong>Muokkaa Linkki</strong> aukeaa.</li>\n</ol>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/linkit-02-valinta.webp\" aria-label=\"Suurenna kuva: Linkin ikkuna. 3: Mihin linkki vie? -valinta. 4: Sivu-kenttä.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/linkit-02-valinta.webp\" alt=\"Linkin ikkuna. 3: Mihin linkki vie? -valinta. 4: Sivu-kenttä.\" width=\"661\" height=\"335\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol start=\"3\">\n<li>Kohdassa <strong>Mihin linkki vie?</strong> valitse <strong>Sivuston sivu</strong>, <strong>Muu osoite</strong> tai <strong>Tiedosto</strong>. ③\n<strong>Sivuston sivu</strong> on valmiiksi valittuna.</li>\n<li><strong>Sivuston sivu</strong>: kirjoita kenttään <strong>Sivu</strong> sivun, uutisen tai ravintolan nimen alkua. Valitse listasta. ④\nTämä linkki pysyy kunnossa, vaikka sivun osoite muuttuisi.</li>\n<li><strong>Muu osoite</strong>: kirjoita kenttään <strong>Osoite</strong> koko osoite.\nEsim. <a href=\"https://www.palloliitto.fi\" target=\"_blank\" rel=\"noopener noreferrer\">https://www.palloliitto.fi</a>, <a href=\"mailto:nimi@esimerkki.fi\">mailto:nimi@esimerkki.fi</a> tai tel:+358401234567.</li>\n<li><strong>Tiedosto</strong>: raahaa PDF-, Word- tai Excel-tiedosto kenttään <strong>Tiedosto</strong>.</li>\n<li>Muulle osoitteelle ja tiedostolle voit kytkeä päälle <strong>Avaa uuteen välilehteen</strong>.</li>\n<li>Sulje ikkuna oikean yläkulman rastista (×). Lopuksi paina <strong>Julkaise</strong>.</li>\n</ol>\n<div class=\"markdown-alert markdown-alert-warning\">\n<p class=\"markdown-alert-title\">Varoitus</p>\n<p>Tiedosto on julkinen. Se löytyy sivustolta, vaikka poistaisit linkin, ja myös tiedoston nimi näkyy. Älä liitä jäsenluetteloita tai muuta luottamuksellista.</p>\n</div>\n<h2 id=\"linkit--tulos\">Tulos</h2>\n<ul>\n<li>Sana näkyy tekstissä linkkinä.</li>\n<li>Julkaisun jälkeen linkki toimii sivustolla. Tiedoston perässä näkyy tyyppi ja koko, esim. &quot;(PDF, 240 kt)&quot;.</li>\n</ul>\n<h2 id=\"linkit--lisavalinnat\">Lisävalinnat</h2>\n<ul>\n<li>Valikon linkit: <a href=\"/studio/ohjeet/valikko-ja-alatunniste\" data-ohje-kortti=\"valikko-ja-alatunniste\">Muokkaa valikkoa ja alatunnistetta</a></li>\n<li>Linkki näyttävänä nappina: <a href=\"/studio/ohjeet/huomiolaatikko-painike-liite\" data-ohje-kortti=\"huomiolaatikko-painike-liite\">Lisää huomiolaatikko, painike tai liite</a></li>\n</ul>\n<div class=\"markdown-alert markdown-alert-tip\">\n<p class=\"markdown-alert-title\">Vinkki</p>\n<p>Valitse klubin omalle sivulle aina <strong>Sivuston sivu</strong>. Valitse <strong>Muu osoite</strong> vain, jos sivua ei löydy listasta.</p>\n</div>\n<h2 id=\"linkit--jos-jokin-menee-vikaan\">Jos jokin menee vikaan</h2>\n<p>Kentän nimen vieressä on keltainen kolmio tai punainen huutomerkki. Vie hiiri sen päälle, niin näet tekstin:</p>\n<ul>\n<li>Keltainen &quot;… ei ole vielä julkaistu&quot;: valitsemasi sivu on luonnos. Linkki näkyy sivustolla vasta, kun julkaiset sen sivun.</li>\n<li>Keltainen &quot;Tätä valintaa ei käytetä…&quot;: vaihdoit linkin muualle. Tyhjennä vanha sivuvalinta: paina valitun sivun rivin kolmea pistettä ja valitse <strong>Tyhjennä</strong>. Tiedostolle valinta on <strong>Tyhjennä kenttä</strong>.</li>\n<li>Punainen &quot;Valittua sivua ei enää ole. Valitse toinen sivu.&quot;: sivu on poistettu. Valitse toinen. Lisää: <a href=\"/studio/ohjeet/linkki-vie-vaaraan-paikkaan\" data-ohje-kortti=\"linkki-vie-vaaraan-paikkaan\">Linkki vie väärään paikkaan tai puuttuu sivulta</a>.</li>\n</ul>\n<p>Katso myös: <a href=\"/studio/ohjeet/kuva\" data-ohje-kortti=\"kuva\">Lisää tai vaihda kuva</a> · <a href=\"/studio/ohjeet/tekstin-muotoilu\" data-ohje-kortti=\"tekstin-muotoilu\">Muotoile teksti</a></p>\n",
          "teksti": "Milloin Kun haluat, että sana tekstissä vie toiselle sivulle, toiselle sivustolle, sähköpostiin tai tiedostoon. Sama valinta Mihin linkki vie? on myös valikossa, etusivun pikalinkeissä, painikkeissa ja klubin toiminnan vuosilinkeissä. Askeleet Maalaa tekstistä sana tai lause, josta linkki tehdään. ① Paina työkalupalkista Linkki (ketjun kuva). ② Jos sitä ei näy, paina ensin luettelopainikkeiden oikealla puolella olevaa kolmea pistettä ( Näytä lisää ). Ikkuna Muokkaa Linkki aukeaa. Kohdassa Mihin linkki vie? valitse Sivuston sivu , Muu osoite tai Tiedosto . ③ Sivuston sivu on valmiiksi valittuna. Sivuston sivu : kirjoita kenttään Sivu sivun, uutisen tai ravintolan nimen alkua. Valitse listasta. ④ Tämä linkki pysyy kunnossa, vaikka sivun osoite muuttuisi. Muu osoite : kirjoita kenttään Osoite koko osoite. Esim. https://www.palloliitto.fi , mailto:nimi@esimerkki.fi tai tel:+358401234567. Tiedosto : raahaa PDF-, Word- tai Excel-tiedosto kenttään Tiedosto . Muulle osoitteelle ja tiedostolle voit kytkeä päälle Avaa uuteen välilehteen . Sulje ikkuna oikean yläkulman rastista (×). Lopuksi paina Julkaise . Tiedosto on julkinen. Se löytyy sivustolta, vaikka poistaisit linkin, ja myös tiedoston nimi näkyy. Älä liitä jäsenluetteloita tai muuta luottamuksellista. Tulos Sana näkyy tekstissä linkkinä. Julkaisun jälkeen linkki toimii sivustolla. Tiedoston perässä näkyy tyyppi ja koko, esim. \"(PDF, 240 kt)\". Lisävalinnat Valikon linkit: Muokkaa valikkoa ja alatunnistetta Linkki näyttävänä nappina: Lisää huomiolaatikko, painike tai liite Valitse klubin omalle sivulle aina Sivuston sivu . Valitse Muu osoite vain, jos sivua ei löydy listasta. Jos jokin menee vikaan Kentän nimen vieressä on keltainen kolmio tai punainen huutomerkki. Vie hiiri sen päälle, niin näet tekstin: Keltainen \"… ei ole vielä julkaistu\": valitsemasi sivu on luonnos. Linkki näkyy sivustolla vasta, kun julkaiset sen sivun. Keltainen \"Tätä valintaa ei käytetä…\": vaihdoit linkin muualle. Tyhjennä vanha sivuvalinta: paina valitun sivun rivin kolmea pistettä ja valitse Tyhjennä . Tiedostolle valinta on Tyhjennä kenttä . Punainen \"Valittua sivua ei enää ole. Valitse toinen sivu.\": sivu on poistettu. Valitse toinen. Lisää: Linkki vie väärään paikkaan tai puuttuu sivulta . Katso myös: Lisää tai vaihda kuva · Muotoile teksti",
          "otsikot": [
            {
              "id": "linkit--milloin",
              "teksti": "Milloin",
              "taso": 2
            },
            {
              "id": "linkit--askeleet",
              "teksti": "Askeleet",
              "taso": 2
            },
            {
              "id": "linkit--tulos",
              "teksti": "Tulos",
              "taso": 2
            },
            {
              "id": "linkit--lisavalinnat",
              "teksti": "Lisävalinnat",
              "taso": 2
            },
            {
              "id": "linkit--jos-jokin-menee-vikaan",
              "teksti": "Jos jokin menee vikaan",
              "taso": 2
            }
          ]
        },
        {
          "id": "video-kartta-lomake",
          "otsikko": "Lisää video, kartta tai lomake",
          "osio": "tekstit",
          "avainsanat": [
            "video",
            "YouTube",
            "Vimeo",
            "kartta",
            "Google Maps",
            "lomake",
            "Google Forms",
            "ilmoittautuminen",
            "upota",
            "upotus",
            "upotuskoodi"
          ],
          "tyypit": [
            "uutinen",
            "sivu",
            "tapahtuma",
            "klubiToiminta",
            "ravintola",
            "jalkapalloTilasto",
            "pelaaja",
            "arvokisa",
            "stadion",
            "lehtileike"
          ],
          "kesto": "noin 5 minuuttia",
          "paivitetty": "2026-10-08",
          "html": "<h2 id=\"video-kartta-lomake--milloin\">Milloin</h2>\n<p>Kun haluat tekstiin YouTube- tai Vimeo-videon, kartan kokoontumispaikkaan tai Google Forms -ilmoittautumislomakkeen. Sivulla näkyy ensin painike, ja video tai kartta latautuu vasta, kun lukija painaa sitä.</p>\n<h2 id=\"video-kartta-lomake--ennen-kuin-aloitat\">Ennen kuin aloitat</h2>\n<ul>\n<li>YouTube-video toimii kaikissa tekstikentissä.</li>\n<li>Kartta, lomake ja Vimeo toimivat sivuilla, uutisissa, tapahtumissa ja klubin toiminnassa.</li>\n</ul>\n<h2 id=\"video-kartta-lomake--askeleet\">Askeleet</h2>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/video-kartta-lomake-01-tyokalupalkki.webp\" aria-label=\"Suurenna kuva: Tekstieditorin työkalupalkki ja avattu valikko. 2: YouTube-video sekä Kartta, lomake tai Vimeo-video.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/video-kartta-lomake-01-tyokalupalkki.webp\" alt=\"Tekstieditorin työkalupalkki ja avattu valikko. 2: YouTube-video sekä Kartta, lomake tai Vimeo-video.\" width=\"629\" height=\"358\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol>\n<li>Napsauta tekstiin kohtaan, johon video tai kartta tulee.</li>\n<li>Työkalupalkissa paina <strong>Kuva</strong>-painikkeen oikealla puolella olevaa kolmea pistettä (<strong>Näytä lisää</strong>).\nValitse <strong>YouTube-video</strong> tai <strong>Kartta, lomake tai Vimeo-video</strong>. ② Ikkuna aukeaa.</li>\n<li>YouTube: kopioi videon osoite YouTubesta selaimen osoiteriviltä. Liitä se kenttään <strong>Videon osoite</strong>.</li>\n<li>Kirjoita <strong>Videon otsikko</strong>, esim. &quot;Huuhkajien maali Unkaria vastaan 2023&quot;.</li>\n</ol>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/video-kartta-lomake-02-upotus.webp\" aria-label=\"Suurenna kuva: Upotuksen ikkuna. 5: Upotuskoodi tai osoite -kenttä. 7: Mitä upotuksessa on -kenttä.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/video-kartta-lomake-02-upotus.webp\" alt=\"Upotuksen ikkuna. 5: Upotuskoodi tai osoite -kenttä. 7: Mitä upotuksessa on -kenttä.\" width=\"649\" height=\"902\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol start=\"5\">\n<li>Kartta: avaa paikka Google Mapsissa ja valitse &quot;Jaa&quot; → &quot;Upota kartta&quot; → &quot;Kopioi HTML&quot;. Liitä koko koodi kenttään <strong>Upotuskoodi tai osoite</strong>. ⑤</li>\n<li>Lomake: avaa lomake Google Formsissa ja valitse &quot;Lähetä&quot; → &quot;&lt;&gt;&quot; → &quot;Kopioi&quot;. Vimeo: kopioi videon osoite. Liitä samaan kenttään.</li>\n<li>Kirjoita <strong>Mitä upotuksessa on</strong>, esim. &quot;Kartta: klubin kokoontumispaikka&quot;. ⑦</li>\n<li>Sulje ikkuna oikean yläkulman rastista (×). Lopuksi paina <strong>Julkaise</strong>.</li>\n</ol>\n<h2 id=\"video-kartta-lomake--tulos\">Tulos</h2>\n<ul>\n<li>Tekstissä näkyy laatikko videon tai upotuksen nimellä.</li>\n<li>Sivulla näkyy otsikko ja painike. Video tai kartta aukeaa painamalla.</li>\n</ul>\n<h2 id=\"video-kartta-lomake--lisavalinnat\">Lisävalinnat</h2>\n<ul>\n<li>Video alkamaan tietystä kohdasta: YouTuben &quot;Jaa&quot;-ikkunassa rastita &quot;Aloita kohdasta&quot; ennen kopiointia.</li>\n<li>Facebookia ja Instagramia ei voi upottaa. Lisää niihin linkki tai painike: <a href=\"/studio/ohjeet/linkit\" data-ohje-kortti=\"linkit\">Lisää linkki</a>, <a href=\"/studio/ohjeet/huomiolaatikko-painike-liite\" data-ohje-kortti=\"huomiolaatikko-painike-liite\">Lisää huomiolaatikko, painike tai liite</a></li>\n</ul>\n<h2 id=\"video-kartta-lomake--jos-jokin-menee-vikaan\">Jos jokin menee vikaan</h2>\n<ul>\n<li>Punainen &quot;Osoite ei ole YouTube-video…&quot;: kopioi osoite suoraan videon sivulta.</li>\n<li>Kenttä <strong>Upotuskoodi tai osoite</strong> on punainen: lue virheen ohje. Pelkkä jakolinkki (maps.app.goo.gl tai forms.gle) ei käy, vaan tarvitaan upotuskoodi.</li>\n<li>Muiden palveluiden upotuksia ei voi sallia itse. Kerro tarpeesta tukihenkilölle.</li>\n</ul>\n<p>Katso myös: <a href=\"/studio/ohjeet/linkit\" data-ohje-kortti=\"linkit\">Lisää linkki</a> · <a href=\"/studio/ohjeet/kuva\" data-ohje-kortti=\"kuva\">Lisää tai vaihda kuva</a></p>\n",
          "teksti": "Milloin Kun haluat tekstiin YouTube- tai Vimeo-videon, kartan kokoontumispaikkaan tai Google Forms -ilmoittautumislomakkeen. Sivulla näkyy ensin painike, ja video tai kartta latautuu vasta, kun lukija painaa sitä. Ennen kuin aloitat YouTube-video toimii kaikissa tekstikentissä. Kartta, lomake ja Vimeo toimivat sivuilla, uutisissa, tapahtumissa ja klubin toiminnassa. Askeleet Napsauta tekstiin kohtaan, johon video tai kartta tulee. Työkalupalkissa paina Kuva -painikkeen oikealla puolella olevaa kolmea pistettä ( Näytä lisää ). Valitse YouTube-video tai Kartta, lomake tai Vimeo-video . ② Ikkuna aukeaa. YouTube: kopioi videon osoite YouTubesta selaimen osoiteriviltä. Liitä se kenttään Videon osoite . Kirjoita Videon otsikko , esim. \"Huuhkajien maali Unkaria vastaan 2023\". Kartta: avaa paikka Google Mapsissa ja valitse \"Jaa\" → \"Upota kartta\" → \"Kopioi HTML\". Liitä koko koodi kenttään Upotuskoodi tai osoite . ⑤ Lomake: avaa lomake Google Formsissa ja valitse \"Lähetä\" → \"<>\" → \"Kopioi\". Vimeo: kopioi videon osoite. Liitä samaan kenttään. Kirjoita Mitä upotuksessa on , esim. \"Kartta: klubin kokoontumispaikka\". ⑦ Sulje ikkuna oikean yläkulman rastista (×). Lopuksi paina Julkaise . Tulos Tekstissä näkyy laatikko videon tai upotuksen nimellä. Sivulla näkyy otsikko ja painike. Video tai kartta aukeaa painamalla. Lisävalinnat Video alkamaan tietystä kohdasta: YouTuben \"Jaa\"-ikkunassa rastita \"Aloita kohdasta\" ennen kopiointia. Facebookia ja Instagramia ei voi upottaa. Lisää niihin linkki tai painike: Lisää linkki , Lisää huomiolaatikko, painike tai liite Jos jokin menee vikaan Punainen \"Osoite ei ole YouTube-video…\": kopioi osoite suoraan videon sivulta. Kenttä Upotuskoodi tai osoite on punainen: lue virheen ohje. Pelkkä jakolinkki (maps.app.goo.gl tai forms.gle) ei käy, vaan tarvitaan upotuskoodi. Muiden palveluiden upotuksia ei voi sallia itse. Kerro tarpeesta tukihenkilölle. Katso myös: Lisää linkki · Lisää tai vaihda kuva",
          "otsikot": [
            {
              "id": "video-kartta-lomake--milloin",
              "teksti": "Milloin",
              "taso": 2
            },
            {
              "id": "video-kartta-lomake--ennen-kuin-aloitat",
              "teksti": "Ennen kuin aloitat",
              "taso": 2
            },
            {
              "id": "video-kartta-lomake--askeleet",
              "teksti": "Askeleet",
              "taso": 2
            },
            {
              "id": "video-kartta-lomake--tulos",
              "teksti": "Tulos",
              "taso": 2
            },
            {
              "id": "video-kartta-lomake--lisavalinnat",
              "teksti": "Lisävalinnat",
              "taso": 2
            },
            {
              "id": "video-kartta-lomake--jos-jokin-menee-vikaan",
              "teksti": "Jos jokin menee vikaan",
              "taso": 2
            }
          ]
        },
        {
          "id": "huomiolaatikko-painike-liite",
          "otsikko": "Lisää huomiolaatikko, painike tai liite",
          "osio": "tekstit",
          "avainsanat": [
            "huomiolaatikko",
            "laatikko",
            "tiedote",
            "tärkeä",
            "ilmoitus",
            "nappi",
            "painike",
            "ilmoittaudu",
            "liite",
            "tiedosto",
            "pdf",
            "word",
            "excel",
            "kutsu",
            "säännöt",
            "pöytäkirja"
          ],
          "tyypit": [
            "uutinen",
            "sivu",
            "tapahtuma",
            "klubiToiminta"
          ],
          "kesto": "noin 3 minuuttia",
          "paivitetty": "2026-10-08",
          "html": "<h2 id=\"huomiolaatikko-painike-liite--milloin\">Milloin</h2>\n<ul>\n<li>Huomiolaatikko: lyhyt ilmoitus, joka erottuu tekstistä, esim. jäsenmaksun eräpäivä.</li>\n<li>Painike: selvä toiminto, esim. &quot;Ilmoittaudu&quot; tai &quot;Lue säännöt&quot;.</li>\n<li>Liite: tiedosto luettavaksi, esim. kokouskutsu tai säännöt.</li>\n</ul>\n<p>Nämä toimivat sivuilla, uutisissa, tapahtumissa ja klubin toiminnassa.</p>\n<h2 id=\"huomiolaatikko-painike-liite--askeleet\">Askeleet</h2>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/huomiolaatikko-painike-liite-01-tyokalupalkki.webp\" aria-label=\"Suurenna kuva: Tekstieditorin työkalupalkki ja avattu valikko. 2: Huomiolaatikko, Painike ja Liite.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/huomiolaatikko-painike-liite-01-tyokalupalkki.webp\" alt=\"Tekstieditorin työkalupalkki ja avattu valikko. 2: Huomiolaatikko, Painike ja Liite.\" width=\"629\" height=\"358\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol>\n<li>Napsauta tekstiin kohtaan, johon lisäys tulee.</li>\n<li>Työkalupalkissa paina <strong>Kuva</strong>-painikkeen oikealla puolella olevaa kolmea pistettä (<strong>Näytä lisää</strong>).\nValitse <strong>Huomiolaatikko</strong>, <strong>Painike</strong> tai <strong>Liite (PDF, Word, Excel)</strong>. ② Ikkuna aukeaa.</li>\n</ol>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/huomiolaatikko-painike-liite-02-huomio.webp\" aria-label=\"Suurenna kuva: Huomiolaatikon ikkuna. 3: Sävy-valinta. 4: Teksti-kenttä.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/huomiolaatikko-painike-liite-02-huomio.webp\" alt=\"Huomiolaatikon ikkuna. 3: Sävy-valinta. 4: Teksti-kenttä.\" width=\"649\" height=\"902\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol start=\"3\">\n<li>Huomiolaatikko: valitse <strong>Sävy</strong>. ③\n<strong>Tiedote (sininen)</strong> tavalliseen ilmoitukseen, <strong>Tärkeä (keltainen)</strong> vain, kun lukijan pitää toimia.</li>\n<li>Kirjoita <strong>Teksti</strong> ja halutessasi <strong>Otsikko (valinnainen)</strong>. ④ Muutama rivi riittää.</li>\n<li>Painike: kirjoita <strong>Painikkeen teksti</strong>, esim. &quot;Ilmoittaudu&quot;.</li>\n<li>Kohdassa <strong>Mihin painike vie</strong> valitse kohde samalla tavalla kuin linkissä.</li>\n<li>Liite: kirjoita <strong>Linkin teksti</strong>, esim. &quot;Vuosikokouskutsu 2027&quot;.</li>\n<li>Raahaa PDF-, Word- tai Excel-tiedosto kenttään <strong>Tiedosto</strong>.</li>\n<li>Sulje ikkuna oikean yläkulman rastista (×). Lopuksi paina <strong>Julkaise</strong>.</li>\n</ol>\n<div class=\"markdown-alert markdown-alert-warning\">\n<p class=\"markdown-alert-title\">Varoitus</p>\n<p>Liitetty tiedosto on julkinen. Se löytyy sivustolta, vaikka poistaisit liitteen, ja myös tiedoston nimi näkyy. Älä liitä jäsenluetteloita, henkilötietoja sisältäviä pöytäkirjoja tai muuta luottamuksellista.</p>\n</div>\n<h2 id=\"huomiolaatikko-painike-liite--tulos\">Tulos</h2>\n<ul>\n<li>Huomiolaatikko näkyy sivulla värillisenä laatikkona.</li>\n<li>Painike näkyy sinisenä nappina.</li>\n<li>Liite näkyy linkkinä, jonka perässä on tyyppi ja koko, esim. &quot;Klubin säännöt (PDF, 240 kt)&quot;.</li>\n</ul>\n<h2 id=\"huomiolaatikko-painike-liite--lisavalinnat\">Lisävalinnat</h2>\n<ul>\n<li>Linkin kohteen valinta: <a href=\"/studio/ohjeet/linkit\" data-ohje-kortti=\"linkit\">Lisää linkki</a></li>\n<li>Wordista saat PDF:n valitsemalla Wordissa &quot;Tallenna nimellä&quot; ja muodoksi PDF.</li>\n<li>Väärä tiedosto julkaistu: poista liite tekstistä ja julkaise. Käyttämätön tiedosto poistuu itsestään viikon kuluttua. Kiireellinen poisto: <a href=\"/studio/ohjeet/tietosuojapyynto\" data-ohje-kortti=\"tietosuojapyynto\">Poista henkilön tiedot pyynnöstä</a></li>\n</ul>\n<div class=\"markdown-alert markdown-alert-tip\">\n<p class=\"markdown-alert-title\">Vinkki</p>\n<p>Käytä keltaista <strong>Tärkeä (keltainen)</strong> säästeliäästi. Jos kaikki on tärkeää, mikään ei erotu.</p>\n</div>\n<h2 id=\"huomiolaatikko-painike-liite--jos-jokin-menee-vikaan\">Jos jokin menee vikaan</h2>\n<ul>\n<li>Painike ei näy sivulla: valittu sivu on julkaisematta tai osoite on virheellinen. Tarkista kohta <strong>Mihin painike vie</strong>.</li>\n<li>Tiedosto ei kelpaa: vain PDF, Word (.docx) ja Excel (.xlsx) käyvät. Tallenna tiedosto ensin johonkin näistä muodoista.</li>\n<li>Keltainen &quot;Tiedosto on iso…&quot;: pienennä PDF. Liitteen voi silti julkaista.</li>\n</ul>\n<p>Katso myös: <a href=\"/studio/ohjeet/video-kartta-lomake\" data-ohje-kortti=\"video-kartta-lomake\">Lisää video, kartta tai lomake</a> · <a href=\"/studio/ohjeet/taulukko-tekstissa\" data-ohje-kortti=\"taulukko-tekstissa\">Lisää taulukko tekstiin</a></p>\n",
          "teksti": "Milloin Huomiolaatikko: lyhyt ilmoitus, joka erottuu tekstistä, esim. jäsenmaksun eräpäivä. Painike: selvä toiminto, esim. \"Ilmoittaudu\" tai \"Lue säännöt\". Liite: tiedosto luettavaksi, esim. kokouskutsu tai säännöt. Nämä toimivat sivuilla, uutisissa, tapahtumissa ja klubin toiminnassa. Askeleet Napsauta tekstiin kohtaan, johon lisäys tulee. Työkalupalkissa paina Kuva -painikkeen oikealla puolella olevaa kolmea pistettä ( Näytä lisää ). Valitse Huomiolaatikko , Painike tai Liite (PDF, Word, Excel) . ② Ikkuna aukeaa. Huomiolaatikko: valitse Sävy . ③ Tiedote (sininen) tavalliseen ilmoitukseen, Tärkeä (keltainen) vain, kun lukijan pitää toimia. Kirjoita Teksti ja halutessasi Otsikko (valinnainen) . ④ Muutama rivi riittää. Painike: kirjoita Painikkeen teksti , esim. \"Ilmoittaudu\". Kohdassa Mihin painike vie valitse kohde samalla tavalla kuin linkissä. Liite: kirjoita Linkin teksti , esim. \"Vuosikokouskutsu 2027\". Raahaa PDF-, Word- tai Excel-tiedosto kenttään Tiedosto . Sulje ikkuna oikean yläkulman rastista (×). Lopuksi paina Julkaise . Liitetty tiedosto on julkinen. Se löytyy sivustolta, vaikka poistaisit liitteen, ja myös tiedoston nimi näkyy. Älä liitä jäsenluetteloita, henkilötietoja sisältäviä pöytäkirjoja tai muuta luottamuksellista. Tulos Huomiolaatikko näkyy sivulla värillisenä laatikkona. Painike näkyy sinisenä nappina. Liite näkyy linkkinä, jonka perässä on tyyppi ja koko, esim. \"Klubin säännöt (PDF, 240 kt)\". Lisävalinnat Linkin kohteen valinta: Lisää linkki Wordista saat PDF:n valitsemalla Wordissa \"Tallenna nimellä\" ja muodoksi PDF. Väärä tiedosto julkaistu: poista liite tekstistä ja julkaise. Käyttämätön tiedosto poistuu itsestään viikon kuluttua. Kiireellinen poisto: Poista henkilön tiedot pyynnöstä Käytä keltaista Tärkeä (keltainen) säästeliäästi. Jos kaikki on tärkeää, mikään ei erotu. Jos jokin menee vikaan Painike ei näy sivulla: valittu sivu on julkaisematta tai osoite on virheellinen. Tarkista kohta Mihin painike vie . Tiedosto ei kelpaa: vain PDF, Word (.docx) ja Excel (.xlsx) käyvät. Tallenna tiedosto ensin johonkin näistä muodoista. Keltainen \"Tiedosto on iso…\": pienennä PDF. Liitteen voi silti julkaista. Katso myös: Lisää video, kartta tai lomake · Lisää taulukko tekstiin",
          "otsikot": [
            {
              "id": "huomiolaatikko-painike-liite--milloin",
              "teksti": "Milloin",
              "taso": 2
            },
            {
              "id": "huomiolaatikko-painike-liite--askeleet",
              "teksti": "Askeleet",
              "taso": 2
            },
            {
              "id": "huomiolaatikko-painike-liite--tulos",
              "teksti": "Tulos",
              "taso": 2
            },
            {
              "id": "huomiolaatikko-painike-liite--lisavalinnat",
              "teksti": "Lisävalinnat",
              "taso": 2
            },
            {
              "id": "huomiolaatikko-painike-liite--jos-jokin-menee-vikaan",
              "teksti": "Jos jokin menee vikaan",
              "taso": 2
            }
          ]
        },
        {
          "id": "taulukko-tekstissa",
          "otsikko": "Lisää taulukko tekstiin",
          "osio": "tekstit",
          "avainsanat": [
            "taulukko",
            "tulokset",
            "Excel",
            "liitä",
            "sarake",
            "rivi",
            "turnaus",
            "mölkky",
            "pieni taulukko"
          ],
          "tyypit": [
            "uutinen",
            "sivu",
            "tapahtuma",
            "klubiToiminta"
          ],
          "kesto": "noin 5 minuuttia",
          "paivitetty": "2026-10-08",
          "html": "<h2 id=\"taulukko-tekstissa--milloin\">Milloin</h2>\n<p>Kun juttuun tarvitaan pieni taulukko, joka kuuluu vain tähän juttuun. Esimerkiksi mölkkyturnauksen tulokset.</p>\n<h2 id=\"taulukko-tekstissa--ennen-kuin-aloitat\">Ennen kuin aloitat</h2>\n<ul>\n<li>Tilasto, joka näkyy monella sivulla tai jota päivitetään vuosia, tehdään jalkapalloarkistoon. Katso <a href=\"/studio/ohjeet/tilastotaulukon-paivitys\" data-ohje-kortti=\"tilastotaulukon-paivitys\">Päivitä tilastotaulukko</a>.</li>\n</ul>\n<h2 id=\"taulukko-tekstissa--askeleet\">Askeleet</h2>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/taulukko-tekstissa-01-ikkuna.webp\" aria-label=\"Suurenna kuva: Taulukon ikkuna. 3: Taulukon otsikko. 4: Tuo Excelistä -painike. 6: Lisää rivi -painike.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/taulukko-tekstissa-01-ikkuna.webp\" alt=\"Taulukon ikkuna. 3: Taulukon otsikko. 4: Tuo Excelistä -painike. 6: Lisää rivi -painike.\" width=\"649\" height=\"902\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol>\n<li>Napsauta tekstiin kohtaan, johon taulukko tulee.</li>\n<li>Työkalupalkissa paina <strong>Kuva</strong>-painikkeen oikealla puolella olevaa kolmea pistettä (<strong>Näytä lisää</strong>). Valitse <strong>Taulukko</strong>. Taulukon ikkuna aukeaa.</li>\n<li>Kirjoita <strong>Taulukon otsikko</strong>, esim. &quot;Mölkkyturnauksen tulokset 2026&quot;. ③</li>\n<li>Jos tiedot ovat Excelissä, paina <strong>Tuo Excelistä</strong>. ④\nKopioi solut Excelissä ja liitä ne kohtaan <strong>Liitä solut tähän</strong>. Paina sinistä painiketta, jossa lukee &quot;Korvaa taulukko&quot;.</li>\n<li>Muuten paina <strong>Lisää sarake</strong>, anna <strong>Sarakkeen nimi</strong> ja paina <strong>Tallenna</strong>. Toista jokaiselle sarakkeelle.</li>\n<li>Lisää rivejä painikkeella <strong>Lisää rivi</strong> ja kirjoita soluihin. ⑥\nEnter siirtää alas, nuolinäppäimet solusta toiseen.</li>\n<li>Sulje ikkuna oikean yläkulman rastista (×). Lopuksi paina <strong>Julkaise</strong>.</li>\n</ol>\n<h2 id=\"taulukko-tekstissa--tulos\">Tulos</h2>\n<ul>\n<li>Tekstissä näkyy laatikko, jossa on taulukon otsikko sekä rivien ja sarakkeiden määrä.</li>\n<li>Sivulla taulukko näkyy otsikkoineen tekstin keskellä.</li>\n</ul>\n<h2 id=\"taulukko-tekstissa--lisavalinnat\">Lisävalinnat</h2>\n<ul>\n<li>Rivin lisäys väliin, siirto tai poisto: rivinumeron vieressä olevasta valikosta.</li>\n<li>Sarakkeen nimen muutos: sarakkeen otsikon valikosta <strong>Muokkaa nimeä ja tyyppiä</strong>.</li>\n<li>Koko taulukko Exceliin muokattavaksi: <strong>Kopioi Exceliin</strong>. Tuo takaisin valinnalla <strong>Korvaa koko taulukko (sarakkeet ja rivit)</strong>.</li>\n<li>Taulukkoeditorin kaikki toiminnot: <a href=\"/studio/ohjeet/tilastotaulukon-paivitys\" data-ohje-kortti=\"tilastotaulukon-paivitys\">Päivitä tilastotaulukko</a></li>\n</ul>\n<h2 id=\"taulukko-tekstissa--jos-jokin-menee-vikaan\">Jos jokin menee vikaan</h2>\n<ul>\n<li>Poistit rivin vahingossa: paina heti ilmoituksen painiketta <strong>Kumoa</strong>.</li>\n<li>Solun alla on aaltoviiva: arvo ei näytä numerolta tai päivämäärältä. Se tallentuu silti.</li>\n<li>Punainen &quot;Kirjoita taulukolle otsikko.&quot;: täytä <strong>Taulukon otsikko</strong>.</li>\n</ul>\n<p>Katso myös: <a href=\"/studio/ohjeet/huomiolaatikko-painike-liite\" data-ohje-kortti=\"huomiolaatikko-painike-liite\">Lisää huomiolaatikko, painike tai liite</a> · <a href=\"/studio/ohjeet/tekstin-muotoilu\" data-ohje-kortti=\"tekstin-muotoilu\">Muotoile teksti</a></p>\n",
          "teksti": "Milloin Kun juttuun tarvitaan pieni taulukko, joka kuuluu vain tähän juttuun. Esimerkiksi mölkkyturnauksen tulokset. Ennen kuin aloitat Tilasto, joka näkyy monella sivulla tai jota päivitetään vuosia, tehdään jalkapalloarkistoon. Katso Päivitä tilastotaulukko . Askeleet Napsauta tekstiin kohtaan, johon taulukko tulee. Työkalupalkissa paina Kuva -painikkeen oikealla puolella olevaa kolmea pistettä ( Näytä lisää ). Valitse Taulukko . Taulukon ikkuna aukeaa. Kirjoita Taulukon otsikko , esim. \"Mölkkyturnauksen tulokset 2026\". ③ Jos tiedot ovat Excelissä, paina Tuo Excelistä . ④ Kopioi solut Excelissä ja liitä ne kohtaan Liitä solut tähän . Paina sinistä painiketta, jossa lukee \"Korvaa taulukko\". Muuten paina Lisää sarake , anna Sarakkeen nimi ja paina Tallenna . Toista jokaiselle sarakkeelle. Lisää rivejä painikkeella Lisää rivi ja kirjoita soluihin. ⑥ Enter siirtää alas, nuolinäppäimet solusta toiseen. Sulje ikkuna oikean yläkulman rastista (×). Lopuksi paina Julkaise . Tulos Tekstissä näkyy laatikko, jossa on taulukon otsikko sekä rivien ja sarakkeiden määrä. Sivulla taulukko näkyy otsikkoineen tekstin keskellä. Lisävalinnat Rivin lisäys väliin, siirto tai poisto: rivinumeron vieressä olevasta valikosta. Sarakkeen nimen muutos: sarakkeen otsikon valikosta Muokkaa nimeä ja tyyppiä . Koko taulukko Exceliin muokattavaksi: Kopioi Exceliin . Tuo takaisin valinnalla Korvaa koko taulukko (sarakkeet ja rivit) . Taulukkoeditorin kaikki toiminnot: Päivitä tilastotaulukko Jos jokin menee vikaan Poistit rivin vahingossa: paina heti ilmoituksen painiketta Kumoa . Solun alla on aaltoviiva: arvo ei näytä numerolta tai päivämäärältä. Se tallentuu silti. Punainen \"Kirjoita taulukolle otsikko.\": täytä Taulukon otsikko . Katso myös: Lisää huomiolaatikko, painike tai liite · Muotoile teksti",
          "otsikot": [
            {
              "id": "taulukko-tekstissa--milloin",
              "teksti": "Milloin",
              "taso": 2
            },
            {
              "id": "taulukko-tekstissa--ennen-kuin-aloitat",
              "teksti": "Ennen kuin aloitat",
              "taso": 2
            },
            {
              "id": "taulukko-tekstissa--askeleet",
              "teksti": "Askeleet",
              "taso": 2
            },
            {
              "id": "taulukko-tekstissa--tulos",
              "teksti": "Tulos",
              "taso": 2
            },
            {
              "id": "taulukko-tekstissa--lisavalinnat",
              "teksti": "Lisävalinnat",
              "taso": 2
            },
            {
              "id": "taulukko-tekstissa--jos-jokin-menee-vikaan",
              "teksti": "Jos jokin menee vikaan",
              "taso": 2
            }
          ]
        },
        {
          "id": "tekstin-muotoilu",
          "otsikko": "Muotoile teksti",
          "osio": "tekstit",
          "avainsanat": [
            "muotoilu",
            "väliotsikko",
            "otsikko",
            "lihavointi",
            "lihava",
            "kursiivi",
            "alleviivaus",
            "luettelo",
            "lista",
            "numeroitu lista",
            "lainaus",
            "rivinvaihto",
            "kappale",
            "Word",
            "liitä tekstiä"
          ],
          "tyypit": [
            "uutinen",
            "sivu",
            "tapahtuma",
            "klubiToiminta",
            "ravintola",
            "jalkapalloTilasto",
            "pelaaja",
            "arvokisa",
            "stadion",
            "lehtileike"
          ],
          "kesto": "noin 2 minuuttia",
          "paivitetty": "2026-10-08",
          "html": "<h2 id=\"tekstin-muotoilu--milloin\">Milloin</h2>\n<p>Kun kirjoitat pidemmän tekstin ja haluat siihen väliotsikoita, lihavointeja tai luettelon. Työkalupalkki on tekstikentän yläreunassa.</p>\n<h2 id=\"tekstin-muotoilu--askeleet\">Askeleet</h2>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/tekstin-muotoilu-01-tyokalupalkki.webp\" aria-label=\"Suurenna kuva: Tekstieditorin työkalupalkki. 2: tyylivalikko. 3: Lihava, Kursiivi, Alleviivattu. 4: Luettelo ja Numeroitu.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/tekstin-muotoilu-01-tyokalupalkki.webp\" alt=\"Tekstieditorin työkalupalkki. 2: tyylivalikko. 3: Lihava, Kursiivi, Alleviivattu. 4: Luettelo ja Numeroitu.\" width=\"631\" height=\"328\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol>\n<li>Napsauta tekstikenttään, esim. uutisen <strong>Sisältö</strong>.</li>\n<li>Väliotsikko: napsauta riville ja avaa työkalupalkin vasemman reunan tyylivalikko, jossa lukee <strong>Leipäteksti</strong>. Valitse <strong>Otsikko 2</strong>. ②\nJos valikossa lukee <strong>Ei tyyliä</strong>, napsauta ensin tekstiriville.\nPienempi väliotsikko on <strong>Otsikko 3</strong>. Lainaukselle valitse <strong>Lainaus</strong>.</li>\n<li>Korostus: maalaa sana ja paina <strong>Lihava</strong> (B), <strong>Kursiivi</strong> (I) tai <strong>Alleviivattu</strong> (U). ③</li>\n<li>Luettelo: napsauta riville ja paina <strong>Luettelo</strong> tai <strong>Numeroitu</strong>. ④</li>\n<li>Rivinvaihto saman kappaleen sisällä: paina Shift + Enter. Enter aloittaa uuden kappaleen.</li>\n<li>Lopuksi paina <strong>Julkaise</strong>.</li>\n</ol>\n<h2 id=\"tekstin-muotoilu--tulos\">Tulos</h2>\n<ul>\n<li>Väliotsikot, korostukset ja luettelot näkyvät lomakkeella ja sivulla.</li>\n<li>Lyhyt ensimmäinen kappale näkyy sivulla isommalla johdantona.</li>\n</ul>\n<h2 id=\"tekstin-muotoilu--lisavalinnat\">Lisävalinnat</h2>\n<ul>\n<li>Tekstiä voi liittää Wordista tai sähköpostista (Ctrl + V). Tarkista sen jälkeen väliotsikot ja luettelot.</li>\n<li>Linkit: <a href=\"/studio/ohjeet/linkit\" data-ohje-kortti=\"linkit\">Lisää linkki</a></li>\n<li>Kuvat, videot ja muut lisäosat: <a href=\"/studio/ohjeet/kuva\" data-ohje-kortti=\"kuva\">Lisää tai vaihda kuva</a>, <a href=\"/studio/ohjeet/video-kartta-lomake\" data-ohje-kortti=\"video-kartta-lomake\">Lisää video, kartta tai lomake</a></li>\n</ul>\n<div class=\"markdown-alert markdown-alert-tip\">\n<p class=\"markdown-alert-title\">Vinkki</p>\n<p>Älä käytä väliotsikkoa korostukseen. Ruudunlukija käyttää väliotsikoita sivun rakenteena. Korosta sanalla <strong>Lihava</strong>.</p>\n</div>\n<h2 id=\"tekstin-muotoilu--jos-jokin-menee-vikaan\">Jos jokin menee vikaan</h2>\n<ul>\n<li>Muotoilu meni väärin: maalaa teksti ja valitse tyylivalikosta <strong>Leipäteksti</strong>.</li>\n<li>Liitetyssä tekstissä on outoja välejä: poista tyhjät rivit käsin.</li>\n<li>Työkalupalkista puuttuu painike, esim. <strong>Linkki</strong>: se on kolmen pisteen painikkeen (<strong>Näytä lisää</strong>) takana.</li>\n</ul>\n<p>Katso myös: <a href=\"/studio/ohjeet/uutisen-kirjoittaminen\" data-ohje-kortti=\"uutisen-kirjoittaminen\">Kirjoita uutinen</a> · <a href=\"/studio/ohjeet/taulukko-tekstissa\" data-ohje-kortti=\"taulukko-tekstissa\">Lisää taulukko tekstiin</a></p>\n",
          "teksti": "Milloin Kun kirjoitat pidemmän tekstin ja haluat siihen väliotsikoita, lihavointeja tai luettelon. Työkalupalkki on tekstikentän yläreunassa. Askeleet Napsauta tekstikenttään, esim. uutisen Sisältö . Väliotsikko: napsauta riville ja avaa työkalupalkin vasemman reunan tyylivalikko, jossa lukee Leipäteksti . Valitse Otsikko 2 . ② Jos valikossa lukee Ei tyyliä , napsauta ensin tekstiriville. Pienempi väliotsikko on Otsikko 3 . Lainaukselle valitse Lainaus . Korostus: maalaa sana ja paina Lihava (B), Kursiivi (I) tai Alleviivattu (U). ③ Luettelo: napsauta riville ja paina Luettelo tai Numeroitu . ④ Rivinvaihto saman kappaleen sisällä: paina Shift + Enter. Enter aloittaa uuden kappaleen. Lopuksi paina Julkaise . Tulos Väliotsikot, korostukset ja luettelot näkyvät lomakkeella ja sivulla. Lyhyt ensimmäinen kappale näkyy sivulla isommalla johdantona. Lisävalinnat Tekstiä voi liittää Wordista tai sähköpostista (Ctrl + V). Tarkista sen jälkeen väliotsikot ja luettelot. Linkit: Lisää linkki Kuvat, videot ja muut lisäosat: Lisää tai vaihda kuva , Lisää video, kartta tai lomake Älä käytä väliotsikkoa korostukseen. Ruudunlukija käyttää väliotsikoita sivun rakenteena. Korosta sanalla Lihava . Jos jokin menee vikaan Muotoilu meni väärin: maalaa teksti ja valitse tyylivalikosta Leipäteksti . Liitetyssä tekstissä on outoja välejä: poista tyhjät rivit käsin. Työkalupalkista puuttuu painike, esim. Linkki : se on kolmen pisteen painikkeen ( Näytä lisää ) takana. Katso myös: Kirjoita uutinen · Lisää taulukko tekstiin",
          "otsikot": [
            {
              "id": "tekstin-muotoilu--milloin",
              "teksti": "Milloin",
              "taso": 2
            },
            {
              "id": "tekstin-muotoilu--askeleet",
              "teksti": "Askeleet",
              "taso": 2
            },
            {
              "id": "tekstin-muotoilu--tulos",
              "teksti": "Tulos",
              "taso": 2
            },
            {
              "id": "tekstin-muotoilu--lisavalinnat",
              "teksti": "Lisävalinnat",
              "taso": 2
            },
            {
              "id": "tekstin-muotoilu--jos-jokin-menee-vikaan",
              "teksti": "Jos jokin menee vikaan",
              "taso": 2
            }
          ]
        }
      ]
    },
    {
      "id": "uutiset",
      "otsikko": "Uutiset",
      "kortit": [
        {
          "id": "uutisen-kirjoittaminen",
          "otsikko": "Kirjoita uutinen",
          "osio": "uutiset",
          "avainsanat": [
            "uutinen",
            "juttu",
            "kirjoitus",
            "blogi",
            "blogikirjoitus",
            "tiedote",
            "artikkeli",
            "julkaise uutinen",
            "uusi uutinen",
            "lyhenne",
            "tiivistelmä",
            "kansikuva"
          ],
          "tyypit": [
            "uutinen"
          ],
          "kesto": "noin 10 minuuttia",
          "paivitetty": "2026-10-08",
          "html": "<h2 id=\"uutisen-kirjoittaminen--milloin\">Milloin</h2>\n<p>Kun haluat kertoa klubin asioista: tapahtumasta, matkasta, ottelusta tai tiedotteesta. Uutinen näkyy etusivulla ja uutislistassa. Uudet jutut kirjoitetaan tänne, ei enää vanhaan blogiin.</p>\n<p>Vuosikokouskutsu tai palloveikkaus? Käytä valmista pohjaa: <a href=\"/studio/ohjeet/valmiit-pohjat\" data-ohje-kortti=\"valmiit-pohjat\">Aloita uutinen valmiista pohjasta</a>.</p>\n<h2 id=\"uutisen-kirjoittaminen--ennen-kuin-aloitat\">Ennen kuin aloitat</h2>\n<ul>\n<li>Otsikko ja teksti ovat valmiina, tai kirjoitat ne suoraan Studioon.</li>\n<li>Halutessasi yksi kuva tietokoneella tai puhelimessa.</li>\n</ul>\n<h2 id=\"uutisen-kirjoittaminen--askeleet\">Askeleet</h2>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/uutisen-kirjoittaminen-01-lista.webp\" aria-label=\"Suurenna kuva: Uutiset-lista. 1: Uutiset valikossa. 2: plus-painike. 3: pohja Uutinen valikossa.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/uutisen-kirjoittaminen-01-lista.webp\" alt=\"Uutiset-lista. 1: Uutiset valikossa. 2: plus-painike. 3: pohja Uutinen valikossa.\" width=\"701\" height=\"750\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol>\n<li>Vasemmasta valikosta valitse <strong>Uutiset</strong>. ①</li>\n<li>Listan yläreunassa paina plus-painiketta (+), <strong>Luo uusi asiakirja</strong>. ② Pohjien valikko aukeaa.</li>\n<li>Valitse <strong>Uutinen</strong>. ③ Tyhjä uutislomake aukeaa.</li>\n</ol>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/uutisen-kirjoittaminen-02-lomake.webp\" aria-label=\"Suurenna kuva: Uutislomake. 4: Otsikko. 5: Osoite sivustolla ja Luo. 6: Kansikuva. 7: Sisältö.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/uutisen-kirjoittaminen-02-lomake.webp\" alt=\"Uutislomake. 4: Otsikko. 5: Osoite sivustolla ja Luo. 6: Kansikuva. 7: Sisältö.\" width=\"661\" height=\"1995\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol start=\"4\">\n<li>Kirjoita kenttään <strong>Otsikko</strong> uutisen otsikko. ④</li>\n<li>Kentän <strong>Osoite sivustolla</strong> vieressä paina <strong>Luo</strong>. ⑤\nKenttään ilmestyy otsikosta tehty osoite.</li>\n<li>Halutessasi lisää kuva kenttään <strong>Kansikuva</strong> ja kirjoita <strong>Vaihtoehtoinen teksti (alt)</strong>. ⑥</li>\n<li>Vieritä alaspäin ja kirjoita tai liitä teksti kenttään <strong>Sisältö</strong>. ⑦\nKirjoita alkuun pari virkettä, jotka kertovat, mistä jutussa on kyse.</li>\n<li>Kohdassa <strong>Kategoriat</strong> rastita sopiva aihe. Lisää kohtaan <strong>Tunnisteet</strong> tarkemmat aiheet.</li>\n<li>Lue teksti läpi. Kaikki tallentuu itsestään, joten älä paina <strong>Julkaise</strong> kesken.</li>\n<li>Kun uutinen on valmis, paina oikeassa alakulmassa <strong>Julkaise</strong>.</li>\n</ol>\n<h2 id=\"uutisen-kirjoittaminen--tulos\">Tulos</h2>\n<ul>\n<li>Ruudulle tulee ilmoitus <strong>Dokumentti on julkaistu</strong>, ja <strong>Julkaise</strong> muuttuu harmaaksi.</li>\n<li>Uutinen näkyy etusivulla ja uutislistassa minuutin kuluessa: <a href=\"https://www.lahdensuomalainenklubi.com/uutiset\" target=\"_blank\" rel=\"noopener noreferrer\">https://www.lahdensuomalainenklubi.com/uutiset</a></li>\n</ul>\n<h2 id=\"uutisen-kirjoittaminen--lisavalinnat\">Lisävalinnat</h2>\n<ul>\n<li>Uutinen näkyviin myöhemmin: <a href=\"/studio/ohjeet/ajasta-uutinen\" data-ohje-kortti=\"ajasta-uutinen\">Ajasta uutinen</a></li>\n<li>Kategorian ja tunnisteen ero: <a href=\"/studio/ohjeet/kategoriat-ja-tunnisteet\" data-ohje-kortti=\"kategoriat-ja-tunnisteet\">Valitse kategoria ja tunnisteet</a></li>\n<li>Kuvia tekstin sekaan: <a href=\"/studio/ohjeet/kuva\" data-ohje-kortti=\"kuva\">Lisää tai vaihda kuva</a></li>\n<li>Video tai kartta: <a href=\"/studio/ohjeet/video-kartta-lomake\" data-ohje-kortti=\"video-kartta-lomake\">Lisää video, kartta tai lomake</a></li>\n<li>Veikkaus tai kommentit uutisen alle: <a href=\"/studio/ohjeet/veikkaus-ja-kommentit\" data-ohje-kortti=\"veikkaus-ja-kommentit\">Avaa veikkaus tai kommentointi</a></li>\n<li><strong>Lyhenne (uutislista ja etusivu)</strong>: 1–2 virkettä uutislistaan. Tyhjänä listassa näkyy tekstin alku.</li>\n<li><strong>Tiivistelmä jutun alussa (valinnainen)</strong>: isompi johdanto jutun alkuun. Tyhjänä alussa näkyy Lyhenne. Lisää: <a href=\"/studio/ohjeet/mika-teksti-nakyy-missa\" data-ohje-kortti=\"mika-teksti-nakyy-missa\">Mikä teksti näkyy missä</a></li>\n<li><strong>Lähde</strong>: jos uutinen on lainattu muualta, kirjoita <strong>Lähteen nimi</strong>, esim. palloliitto.fi.</li>\n<li>Välilehdellä <strong>Hakukoneet ja jako</strong> voit kirjoittaa Googlen tekstit: <strong>Otsikko hakutuloksissa (valinnainen)</strong> ja <strong>Kuvaus hakutuloksissa (valinnainen)</strong>.</li>\n</ul>\n<h2 id=\"uutisen-kirjoittaminen--jos-jokin-menee-vikaan\">Jos jokin menee vikaan</h2>\n<ul>\n<li><strong>Julkaise</strong> on harmaa, ja välilehden nimen vieressä on punainen huutomerkki: jokin pakollinen kenttä on tyhjä. Katso <a href=\"/studio/ohjeet/julkaise-ei-onnistu\" data-ohje-kortti=\"julkaise-ei-onnistu\">Julkaise on harmaa</a>.</li>\n<li>Uutinen ei näy sivustolla: tarkista, että painoit <strong>Julkaise</strong>. Jos <strong>Julkaisuaika</strong> on tulevaisuudessa, uutinen on ajastettu. Katso <a href=\"/studio/ohjeet/uutinen-ei-nay-ajastettu\" data-ohje-kortti=\"uutinen-ei-nay-ajastettu\">Uutinen ei näy sivustolla, ja alapalkissa lukee Ajastettu</a>.</li>\n<li>Kirjoitit väärin ja julkaisit jo: korjaa teksti ja paina <strong>Julkaise</strong> uudelleen.</li>\n</ul>\n<p>Mikään ei katoa: keskeneräinen uutinen säilyy luonnoksena, vaikka suljet selaimen.</p>\n<p>Katso myös: <a href=\"/studio/ohjeet/valmiit-pohjat\" data-ohje-kortti=\"valmiit-pohjat\">Aloita uutinen valmiista pohjasta</a> · <a href=\"/studio/ohjeet/luonnos-julkaisu-ja-peruminen\" data-ohje-kortti=\"luonnos-julkaisu-ja-peruminen\">Tallenna, julkaise ja peru muutos</a> · <a href=\"/studio/ohjeet/jakokuva\" data-ohje-kortti=\"jakokuva\">Valitse kuva, joka näkyy jaossa</a></p>\n",
          "teksti": "Milloin Kun haluat kertoa klubin asioista: tapahtumasta, matkasta, ottelusta tai tiedotteesta. Uutinen näkyy etusivulla ja uutislistassa. Uudet jutut kirjoitetaan tänne, ei enää vanhaan blogiin. Vuosikokouskutsu tai palloveikkaus? Käytä valmista pohjaa: Aloita uutinen valmiista pohjasta . Ennen kuin aloitat Otsikko ja teksti ovat valmiina, tai kirjoitat ne suoraan Studioon. Halutessasi yksi kuva tietokoneella tai puhelimessa. Askeleet Vasemmasta valikosta valitse Uutiset . ① Listan yläreunassa paina plus-painiketta (+), Luo uusi asiakirja . ② Pohjien valikko aukeaa. Valitse Uutinen . ③ Tyhjä uutislomake aukeaa. Kirjoita kenttään Otsikko uutisen otsikko. ④ Kentän Osoite sivustolla vieressä paina Luo . ⑤ Kenttään ilmestyy otsikosta tehty osoite. Halutessasi lisää kuva kenttään Kansikuva ja kirjoita Vaihtoehtoinen teksti (alt) . ⑥ Vieritä alaspäin ja kirjoita tai liitä teksti kenttään Sisältö . ⑦ Kirjoita alkuun pari virkettä, jotka kertovat, mistä jutussa on kyse. Kohdassa Kategoriat rastita sopiva aihe. Lisää kohtaan Tunnisteet tarkemmat aiheet. Lue teksti läpi. Kaikki tallentuu itsestään, joten älä paina Julkaise kesken. Kun uutinen on valmis, paina oikeassa alakulmassa Julkaise . Tulos Ruudulle tulee ilmoitus Dokumentti on julkaistu , ja Julkaise muuttuu harmaaksi. Uutinen näkyy etusivulla ja uutislistassa minuutin kuluessa: https://www.lahdensuomalainenklubi.com/uutiset Lisävalinnat Uutinen näkyviin myöhemmin: Ajasta uutinen Kategorian ja tunnisteen ero: Valitse kategoria ja tunnisteet Kuvia tekstin sekaan: Lisää tai vaihda kuva Video tai kartta: Lisää video, kartta tai lomake Veikkaus tai kommentit uutisen alle: Avaa veikkaus tai kommentointi Lyhenne (uutislista ja etusivu) : 1–2 virkettä uutislistaan. Tyhjänä listassa näkyy tekstin alku. Tiivistelmä jutun alussa (valinnainen) : isompi johdanto jutun alkuun. Tyhjänä alussa näkyy Lyhenne. Lisää: Mikä teksti näkyy missä Lähde : jos uutinen on lainattu muualta, kirjoita Lähteen nimi , esim. palloliitto.fi. Välilehdellä Hakukoneet ja jako voit kirjoittaa Googlen tekstit: Otsikko hakutuloksissa (valinnainen) ja Kuvaus hakutuloksissa (valinnainen) . Jos jokin menee vikaan Julkaise on harmaa, ja välilehden nimen vieressä on punainen huutomerkki: jokin pakollinen kenttä on tyhjä. Katso Julkaise on harmaa . Uutinen ei näy sivustolla: tarkista, että painoit Julkaise . Jos Julkaisuaika on tulevaisuudessa, uutinen on ajastettu. Katso Uutinen ei näy sivustolla, ja alapalkissa lukee Ajastettu . Kirjoitit väärin ja julkaisit jo: korjaa teksti ja paina Julkaise uudelleen. Mikään ei katoa: keskeneräinen uutinen säilyy luonnoksena, vaikka suljet selaimen. Katso myös: Aloita uutinen valmiista pohjasta · Tallenna, julkaise ja peru muutos · Valitse kuva, joka näkyy jaossa",
          "otsikot": [
            {
              "id": "uutisen-kirjoittaminen--milloin",
              "teksti": "Milloin",
              "taso": 2
            },
            {
              "id": "uutisen-kirjoittaminen--ennen-kuin-aloitat",
              "teksti": "Ennen kuin aloitat",
              "taso": 2
            },
            {
              "id": "uutisen-kirjoittaminen--askeleet",
              "teksti": "Askeleet",
              "taso": 2
            },
            {
              "id": "uutisen-kirjoittaminen--tulos",
              "teksti": "Tulos",
              "taso": 2
            },
            {
              "id": "uutisen-kirjoittaminen--lisavalinnat",
              "teksti": "Lisävalinnat",
              "taso": 2
            },
            {
              "id": "uutisen-kirjoittaminen--jos-jokin-menee-vikaan",
              "teksti": "Jos jokin menee vikaan",
              "taso": 2
            }
          ]
        },
        {
          "id": "ajasta-uutinen",
          "otsikko": "Ajasta uutinen",
          "osio": "uutiset",
          "avainsanat": [
            "ajasta",
            "ajastus",
            "myöhemmin",
            "tulevaisuudessa",
            "julkaisuaika",
            "huomenna",
            "maanantaina",
            "ajastettu",
            "kutsu etukäteen"
          ],
          "tyypit": [
            "uutinen"
          ],
          "kesto": "noin 2 minuuttia",
          "paivitetty": "2026-10-08",
          "html": "<h2 id=\"ajasta-uutinen--milloin\">Milloin</h2>\n<p>Kun uutinen pitää saada näkyviin myöhemmin, esim. vuosikokouskutsu maanantaina kello 8. Kirjoitat ja julkaiset nyt, ja uutinen tulee sivustolle itsestään valittuna aikana.</p>\n<h2 id=\"ajasta-uutinen--ennen-kuin-aloitat\">Ennen kuin aloitat</h2>\n<ul>\n<li>Uutinen on kirjoitettu valmiiksi. Katso <a href=\"/studio/ohjeet/uutisen-kirjoittaminen\" data-ohje-kortti=\"uutisen-kirjoittaminen\">Kirjoita uutinen</a>.</li>\n</ul>\n<h2 id=\"ajasta-uutinen--askeleet\">Askeleet</h2>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/ajasta-uutinen-01-julkaisuaika.webp\" aria-label=\"Suurenna kuva: Uutislomake. 2: Julkaisuaika-kenttä ja kalenteri.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/ajasta-uutinen-01-julkaisuaika.webp\" alt=\"Uutislomake. 2: Julkaisuaika-kenttä ja kalenteri.\" width=\"685\" height=\"492\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol>\n<li>Avaa uutinen.</li>\n<li>Kentän <strong>Julkaisuaika</strong> oikeassa reunassa paina kalenterin kuvaa. Valitse päivä ja kirjoita kellonaika, jolloin uutinen tulee näkyviin. ②\nAlapalkkiin tulee heti merkki <strong>Ajastettu</strong>.</li>\n<li>Paina <strong>Julkaise</strong>. ③ Ajastus alkaa vasta tästä.\nUutinen odottaa piilossa. Kävijät eivät näe sitä ennen valittua aikaa.</li>\n</ol>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/ajasta-uutinen-02-merkki.webp\" aria-label=\"Suurenna kuva: Ajastetun uutisen alapalkki. 3: Julkaise-painike. 4: Ajastettu-merkki.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/ajasta-uutinen-02-merkki.webp\" alt=\"Ajastetun uutisen alapalkki. 3: Julkaise-painike. 4: Ajastettu-merkki.\" width=\"848\" height=\"88\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol start=\"4\">\n<li>Tarkista, että alapalkissa on merkki <strong>Ajastettu</strong>. ④\nUutislistassa uutisen kohdalla lukee &quot;Ajastettu&quot; ja aika.</li>\n</ol>\n<h2 id=\"ajasta-uutinen--tulos\">Tulos</h2>\n<ul>\n<li>Uutinen tulee sivustolle noin minuutin kuluessa valitusta ajasta.</li>\n<li>Siihen asti se on listassa <strong>Tehtävät sinulle → Ajastetut uutiset</strong>.</li>\n</ul>\n<h2 id=\"ajasta-uutinen--lisavalinnat\">Lisävalinnat</h2>\n<ul>\n<li>Julkaise heti: valitse kalenterista <strong>Aseta nykyiseen aikaan</strong> ja paina <strong>Julkaise</strong>.</li>\n<li>Siirrä aikaa: muuta <strong>Julkaisuaika</strong> ja paina <strong>Julkaise</strong> uudelleen.</li>\n</ul>\n<div class=\"markdown-alert markdown-alert-warning\">\n<p class=\"markdown-alert-title\">Varoitus</p>\n<p>Älä käytä toimintovalikon Sanityn omaa toimintoa <strong>Ajasta julkaisu</strong>. Klubin ajastus tehdään aina kentällä <strong>Julkaisuaika</strong>.</p>\n</div>\n<h2 id=\"ajasta-uutinen--jos-jokin-menee-vikaan\">Jos jokin menee vikaan</h2>\n<ul>\n<li>Merkin selitys sanoo &quot;…, kun painat Julkaise.&quot;: muutit aikaa, mutta et julkaissut. Paina <strong>Julkaise</strong>.</li>\n<li>Uutinen ei näy ajan jälkeen: odota minuutti ja päivitä sivu. Katso <a href=\"/studio/ohjeet/uutinen-ei-nay-ajastettu\" data-ohje-kortti=\"uutinen-ei-nay-ajastettu\">Uutinen ei näy sivustolla, ja alapalkissa lukee Ajastettu</a>.</li>\n<li>Linkissä toiseen sivuun näkyy keltainen &quot;Uutinen tulee näkyviin …&quot;: linkki ajastettuun uutiseen näkyy sivustolla vasta sen julkaisuaikana. Tämä on normaalia.</li>\n</ul>\n<p>Katso myös: <a href=\"/studio/ohjeet/uutisen-kirjoittaminen\" data-ohje-kortti=\"uutisen-kirjoittaminen\">Kirjoita uutinen</a> · <a href=\"/studio/ohjeet/valmiit-pohjat\" data-ohje-kortti=\"valmiit-pohjat\">Aloita uutinen valmiista pohjasta</a></p>\n",
          "teksti": "Milloin Kun uutinen pitää saada näkyviin myöhemmin, esim. vuosikokouskutsu maanantaina kello 8. Kirjoitat ja julkaiset nyt, ja uutinen tulee sivustolle itsestään valittuna aikana. Ennen kuin aloitat Uutinen on kirjoitettu valmiiksi. Katso Kirjoita uutinen . Askeleet Avaa uutinen. Kentän Julkaisuaika oikeassa reunassa paina kalenterin kuvaa. Valitse päivä ja kirjoita kellonaika, jolloin uutinen tulee näkyviin. ② Alapalkkiin tulee heti merkki Ajastettu . Paina Julkaise . ③ Ajastus alkaa vasta tästä. Uutinen odottaa piilossa. Kävijät eivät näe sitä ennen valittua aikaa. Tarkista, että alapalkissa on merkki Ajastettu . ④ Uutislistassa uutisen kohdalla lukee \"Ajastettu\" ja aika. Tulos Uutinen tulee sivustolle noin minuutin kuluessa valitusta ajasta. Siihen asti se on listassa Tehtävät sinulle → Ajastetut uutiset . Lisävalinnat Julkaise heti: valitse kalenterista Aseta nykyiseen aikaan ja paina Julkaise . Siirrä aikaa: muuta Julkaisuaika ja paina Julkaise uudelleen. Älä käytä toimintovalikon Sanityn omaa toimintoa Ajasta julkaisu . Klubin ajastus tehdään aina kentällä Julkaisuaika . Jos jokin menee vikaan Merkin selitys sanoo \"…, kun painat Julkaise.\": muutit aikaa, mutta et julkaissut. Paina Julkaise . Uutinen ei näy ajan jälkeen: odota minuutti ja päivitä sivu. Katso Uutinen ei näy sivustolla, ja alapalkissa lukee Ajastettu . Linkissä toiseen sivuun näkyy keltainen \"Uutinen tulee näkyviin …\": linkki ajastettuun uutiseen näkyy sivustolla vasta sen julkaisuaikana. Tämä on normaalia. Katso myös: Kirjoita uutinen · Aloita uutinen valmiista pohjasta",
          "otsikot": [
            {
              "id": "ajasta-uutinen--milloin",
              "teksti": "Milloin",
              "taso": 2
            },
            {
              "id": "ajasta-uutinen--ennen-kuin-aloitat",
              "teksti": "Ennen kuin aloitat",
              "taso": 2
            },
            {
              "id": "ajasta-uutinen--askeleet",
              "teksti": "Askeleet",
              "taso": 2
            },
            {
              "id": "ajasta-uutinen--tulos",
              "teksti": "Tulos",
              "taso": 2
            },
            {
              "id": "ajasta-uutinen--lisavalinnat",
              "teksti": "Lisävalinnat",
              "taso": 2
            },
            {
              "id": "ajasta-uutinen--jos-jokin-menee-vikaan",
              "teksti": "Jos jokin menee vikaan",
              "taso": 2
            }
          ]
        },
        {
          "id": "valmiit-pohjat",
          "otsikko": "Aloita uutinen valmiista pohjasta",
          "osio": "uutiset",
          "avainsanat": [
            "pohja",
            "malli",
            "valmis pohja",
            "vuosikokous",
            "vuosikokouskutsu",
            "kokouskutsu",
            "palloveikkaus",
            "tilanne",
            "uusi kausi",
            "hakasulkeet",
            "täytä",
            "kopioi",
            "viime vuoden"
          ],
          "tyypit": [
            "uutinen"
          ],
          "kesto": "noin 5 minuuttia",
          "paivitetty": "2026-10-08",
          "html": "<h2 id=\"valmiit-pohjat--milloin\">Milloin</h2>\n<p>Kun kirjoitat toistuvan uutisen: vuosikokouskutsun, palloveikkauksen tilanteen tai uuden palloveikkauskauden. Pohjassa ovat valmiina otsikko, teksti, kategoriat ja tunnisteet.</p>\n<h2 id=\"valmiit-pohjat--askeleet\">Askeleet</h2>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/valmiit-pohjat-01-valikko.webp\" aria-label=\"Suurenna kuva: Uutiset-lista. 2: plus-painike. 3: pohjat Vuosikokouskutsu, Palloveikkauksen tilanne ja Palloveikkaus: uusi kausi.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/valmiit-pohjat-01-valikko.webp\" alt=\"Uutiset-lista. 2: plus-painike. 3: pohjat Vuosikokouskutsu, Palloveikkauksen tilanne ja Palloveikkaus: uusi kausi.\" width=\"480\" height=\"750\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol>\n<li>Vasemmasta valikosta valitse <strong>Uutiset</strong>.</li>\n<li>Listan yläreunassa paina plus-painiketta (+). ② Pohjien valikko aukeaa.</li>\n<li>Valitse <strong>Vuosikokouskutsu</strong>, <strong>Palloveikkauksen tilanne</strong> tai <strong>Palloveikkaus: uusi kausi</strong>. ③</li>\n</ol>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/valmiit-pohjat-02-taytettava.webp\" aria-label=\"Suurenna kuva: Pohjasta tehty uutinen. 4: hakasulkeissa oleva täytettävä kohta. 6: Osoite sivustolla ja Luo-painike.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/valmiit-pohjat-02-taytettava.webp\" alt=\"Pohjasta tehty uutinen. 4: hakasulkeissa oleva täytettävä kohta. 6: Osoite sivustolla ja Luo-painike.\" width=\"672\" height=\"894\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol start=\"4\">\n<li>Etsi hakasulkeet, esim. [täytä: kellonaika]. ④\nNiitä on esim. kentissä <strong>Lyhenne (uutislista ja etusivu)</strong> ja <strong>Sisältö</strong>, joissakin pohjissa myös <strong>Otsikko</strong>.</li>\n<li>Kirjoita tilalle oikea tieto ja poista hakasulkeet. Esim. [täytä: kellonaika] → 18.00.</li>\n<li>Kun otsikko on valmis, paina kentän <strong>Osoite sivustolla</strong> vieressä <strong>Luo</strong>. ⑥</li>\n<li>Uusi kausi: avaa välilehti <strong>Kommentit ja veikkaus</strong>. Täytä <strong>Joukkueet</strong> ja <strong>Veikkaus sulkeutuu</strong>.</li>\n<li>Tarkista <strong>Kategoriat</strong> ja <strong>Tunnisteet</strong>. Ne ovat valmiina.</li>\n<li>Lopuksi paina <strong>Julkaise</strong>.</li>\n</ol>\n<h2 id=\"valmiit-pohjat--tulos\">Tulos</h2>\n<ul>\n<li>Uutinen näkyy sivustolla kuten tavallinen uutinen.</li>\n<li>Uudessa kaudessa jäsenet voivat veikata uutisen alla.</li>\n</ul>\n<h2 id=\"valmiit-pohjat--lisavalinnat\">Lisävalinnat</h2>\n<ul>\n<li>Pohjat löytyvät myös yläpalkin vasemmasta reunasta plus-painikkeesta (<strong>Luo uusi asiakirja</strong>). Kirjoita hakuun esim. &quot;vuosi&quot;.</li>\n<li>Viime vuoden uutinen pohjaksi: avaa uutinen, toimintovalikosta valitse <strong>Kopioi pohjaksi</strong>. Kopio aukeaa samalla otsikolla. Anna uusi otsikko, paina <strong>Luo</strong> ja valitse <strong>Julkaisuaika</strong> (kalenterin <strong>Aseta nykyiseen aikaan</strong>). Veikkauksessa valitse myös <strong>Veikkaus sulkeutuu</strong>.</li>\n<li>Veikkauksen asetukset: <a href=\"/studio/ohjeet/veikkaus-ja-kommentit\" data-ohje-kortti=\"veikkaus-ja-kommentit\">Avaa veikkaus tai kommentointi</a></li>\n<li>Sarjataulukko riveinä samassa kappaleessa: Shift + Enter vaihtaa rivin.</li>\n</ul>\n<h2 id=\"valmiit-pohjat--jos-jokin-menee-vikaan\">Jos jokin menee vikaan</h2>\n<ul>\n<li>Punainen &quot;Täytä vielä hakasulkeissa olevat kohdat: …&quot;: tekstiin jäi hakasulkeet. Virhe kertoo, mitkä. Täytä ne ja paina <strong>Julkaise</strong>.</li>\n<li>Kategoria puuttuu pohjasta: kategoria on nimetty uudelleen tai poistettu. Rastita oikea käsin.</li>\n<li>Valitsit väärän pohjan: valitse toimintovalikosta <strong>Hylkää muutokset</strong> ja vahvista. Luonnos poistuu. Aloita alusta. Tavallisen uutisen saat pohjasta <strong>Uutinen</strong>.</li>\n</ul>\n<p>Katso myös: <a href=\"/studio/ohjeet/uutisen-kirjoittaminen\" data-ohje-kortti=\"uutisen-kirjoittaminen\">Kirjoita uutinen</a> · <a href=\"/studio/ohjeet/ajasta-uutinen\" data-ohje-kortti=\"ajasta-uutinen\">Ajasta uutinen</a></p>\n",
          "teksti": "Milloin Kun kirjoitat toistuvan uutisen: vuosikokouskutsun, palloveikkauksen tilanteen tai uuden palloveikkauskauden. Pohjassa ovat valmiina otsikko, teksti, kategoriat ja tunnisteet. Askeleet Vasemmasta valikosta valitse Uutiset . Listan yläreunassa paina plus-painiketta (+). ② Pohjien valikko aukeaa. Valitse Vuosikokouskutsu , Palloveikkauksen tilanne tai Palloveikkaus: uusi kausi . ③ Etsi hakasulkeet, esim. [täytä: kellonaika]. ④ Niitä on esim. kentissä Lyhenne (uutislista ja etusivu) ja Sisältö , joissakin pohjissa myös Otsikko . Kirjoita tilalle oikea tieto ja poista hakasulkeet. Esim. [täytä: kellonaika] → 18.00. Kun otsikko on valmis, paina kentän Osoite sivustolla vieressä Luo . ⑥ Uusi kausi: avaa välilehti Kommentit ja veikkaus . Täytä Joukkueet ja Veikkaus sulkeutuu . Tarkista Kategoriat ja Tunnisteet . Ne ovat valmiina. Lopuksi paina Julkaise . Tulos Uutinen näkyy sivustolla kuten tavallinen uutinen. Uudessa kaudessa jäsenet voivat veikata uutisen alla. Lisävalinnat Pohjat löytyvät myös yläpalkin vasemmasta reunasta plus-painikkeesta ( Luo uusi asiakirja ). Kirjoita hakuun esim. \"vuosi\". Viime vuoden uutinen pohjaksi: avaa uutinen, toimintovalikosta valitse Kopioi pohjaksi . Kopio aukeaa samalla otsikolla. Anna uusi otsikko, paina Luo ja valitse Julkaisuaika (kalenterin Aseta nykyiseen aikaan ). Veikkauksessa valitse myös Veikkaus sulkeutuu . Veikkauksen asetukset: Avaa veikkaus tai kommentointi Sarjataulukko riveinä samassa kappaleessa: Shift + Enter vaihtaa rivin. Jos jokin menee vikaan Punainen \"Täytä vielä hakasulkeissa olevat kohdat: …\": tekstiin jäi hakasulkeet. Virhe kertoo, mitkä. Täytä ne ja paina Julkaise . Kategoria puuttuu pohjasta: kategoria on nimetty uudelleen tai poistettu. Rastita oikea käsin. Valitsit väärän pohjan: valitse toimintovalikosta Hylkää muutokset ja vahvista. Luonnos poistuu. Aloita alusta. Tavallisen uutisen saat pohjasta Uutinen . Katso myös: Kirjoita uutinen · Ajasta uutinen",
          "otsikot": [
            {
              "id": "valmiit-pohjat--milloin",
              "teksti": "Milloin",
              "taso": 2
            },
            {
              "id": "valmiit-pohjat--askeleet",
              "teksti": "Askeleet",
              "taso": 2
            },
            {
              "id": "valmiit-pohjat--tulos",
              "teksti": "Tulos",
              "taso": 2
            },
            {
              "id": "valmiit-pohjat--lisavalinnat",
              "teksti": "Lisävalinnat",
              "taso": 2
            },
            {
              "id": "valmiit-pohjat--jos-jokin-menee-vikaan",
              "teksti": "Jos jokin menee vikaan",
              "taso": 2
            }
          ]
        },
        {
          "id": "kategoriat-ja-tunnisteet",
          "otsikko": "Valitse kategoria ja tunnisteet",
          "osio": "uutiset",
          "avainsanat": [
            "kategoria",
            "kategoriat",
            "tunniste",
            "tunnisteet",
            "aihe",
            "avainsana",
            "label",
            "luokka",
            "suodatin",
            "uusi kategoria",
            "Huuhkajat",
            "ero"
          ],
          "tyypit": [
            "uutinen",
            "uutisKategoria"
          ],
          "kesto": "noin 2 minuuttia",
          "paivitetty": "2026-10-08",
          "html": "<h2 id=\"kategoriat-ja-tunnisteet--milloin\">Milloin</h2>\n<p>Jokaisessa uutisessa. Kategoria ja tunniste ovat eri asioita:</p>\n<table>\n<thead>\n<tr>\n<th></th>\n<th>Kategoria</th>\n<th>Tunniste</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>Mikä</td>\n<td>Laaja aihe, esim. Tapahtumat tai Palloveikkaus</td>\n<td>Tarkka aihe: joukkue, paikka tai henkilö, esim. Huuhkajat</td>\n</tr>\n<tr>\n<td>Montako</td>\n<td>1–2 uutista kohden</td>\n<td>Niin monta kuin sopii, enintään 30</td>\n</tr>\n<tr>\n<td>Missä näkyy</td>\n<td>Uutislistan suodattimessa</td>\n<td>Jokaisella tunnisteella on oma sivu, jolla on kaikki sen uutiset</td>\n</tr>\n<tr>\n<td>Uusi</td>\n<td>Valikon kohdassa <strong>Uutiskategoriat</strong></td>\n<td>Kirjoitetaan suoraan kenttään</td>\n</tr>\n</tbody>\n</table>\n<h2 id=\"kategoriat-ja-tunnisteet--askeleet\">Askeleet</h2>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/kategoriat-ja-tunnisteet-01-kentat.webp\" aria-label=\"Suurenna kuva: Uutislomake. 2: Kategoriat. 3: Tunnisteet-kenttä. 5: Suosituimmat-painikkeet.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/kategoriat-ja-tunnisteet-01-kentat.webp\" alt=\"Uutislomake. 2: Kategoriat. 3: Tunnisteet-kenttä. 5: Suosituimmat-painikkeet.\" width=\"685\" height=\"536\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol>\n<li>Avaa uutinen.</li>\n<li>Kohdassa <strong>Kategoriat</strong> rastita yksi tai kaksi sopivaa aihetta. ②</li>\n<li>Kirjoita kenttään <strong>Tunnisteet</strong> pari ensimmäistä kirjainta. ③</li>\n<li>Jos sopiva tunniste on listassa, valitse se. Muuten kirjoita uusi ja paina Enter.\nListassa näkyy, montako uutista tunnisteella jo on.</li>\n<li>Yleisimmän tunnisteen saat myös rivin <strong>Suosituimmat:</strong> painikkeista. ⑤</li>\n<li>Turhan tunnisteen poistat sen vieressä olevasta rastista (×).</li>\n<li>Lopuksi paina <strong>Julkaise</strong>.</li>\n</ol>\n<h2 id=\"kategoriat-ja-tunnisteet--tulos\">Tulos</h2>\n<ul>\n<li>Uutinen löytyy uutislistalta kategorian suodattimella.</li>\n<li>Jokaisen tunnisteen sivulla näkyy tämä uutinen muiden samanaiheisten kanssa.</li>\n</ul>\n<h2 id=\"kategoriat-ja-tunnisteet--lisavalinnat\">Lisävalinnat</h2>\n<ul>\n<li>Uusi kategoria: valikosta <strong>Uutiskategoriat</strong> → listan yläreunan plus-painike → <strong>Nimi</strong> → kentän <strong>Osoite suodattimessa</strong> vieressä <strong>Luo</strong> → <strong>Julkaise</strong>. Kohdassa <strong>Järjestys suodattimessa</strong> pienin numero tulee ensin.</li>\n<li>Uuden kategorian voi tehdä myös uutisesta linkillä <strong>Lisää uusi kategoria</strong>. Se aukeaa uuteen välilehteen.</li>\n<li>Kategorian nimen voi vaihtaa milloin tahansa. Uusi nimi näkyy kaikissa uutisissa.</li>\n<li>Kategorian kohtaan <strong>Kuvaus hakukoneille (valinnainen)</strong> voit kirjoittaa lyhyen kuvauksen Googlen hakutuloksiin.</li>\n<li>Vanhan blogin kirjoituksissa välilehdellä <strong>Hakukoneet ja jako</strong> on kohta <strong>Alkuperäinen Blogspot-kirjoitus</strong>. Se on vain muisto, eikä sitä muokata.</li>\n</ul>\n<div class=\"markdown-alert markdown-alert-tip\">\n<p class=\"markdown-alert-title\">Vinkki</p>\n<p>Päätä kategoria kerran ja pidä se. Jos et ole varma, valitse yksi laaja kategoria ja lisää tarkemmat aiheet tunnisteiksi.</p>\n</div>\n<h2 id=\"kategoriat-ja-tunnisteet--jos-jokin-menee-vikaan\">Jos jokin menee vikaan</h2>\n<ul>\n<li>Tunnisteesta tuli eri muoto kuin kirjoitit, esim. &quot;huuhkajat&quot; → &quot;Huuhkajat&quot;: Studio käyttää jo vakiintunutta muotoa. Tämä on oikein.</li>\n<li>Punainen &quot;Samanniminen kategoria on jo olemassa.&quot;: käytä olemassa olevaa kategoriaa.</li>\n<li>Kategoriaa ei voi poistaa: jokin uutinen käyttää sitä. Poista rasti niistä uutisista ensin.</li>\n</ul>\n<p>Katso myös: <a href=\"/studio/ohjeet/uutisen-kirjoittaminen\" data-ohje-kortti=\"uutisen-kirjoittaminen\">Kirjoita uutinen</a> · <a href=\"/studio/ohjeet/sanasto\" data-ohje-kortti=\"sanasto\">Sanasto</a></p>\n",
          "teksti": "Milloin Jokaisessa uutisessa. Kategoria ja tunniste ovat eri asioita: Kategoria Tunniste Mikä Laaja aihe, esim. Tapahtumat tai Palloveikkaus Tarkka aihe: joukkue, paikka tai henkilö, esim. Huuhkajat Montako 1–2 uutista kohden Niin monta kuin sopii, enintään 30 Missä näkyy Uutislistan suodattimessa Jokaisella tunnisteella on oma sivu, jolla on kaikki sen uutiset Uusi Valikon kohdassa Uutiskategoriat Kirjoitetaan suoraan kenttään Askeleet Avaa uutinen. Kohdassa Kategoriat rastita yksi tai kaksi sopivaa aihetta. ② Kirjoita kenttään Tunnisteet pari ensimmäistä kirjainta. ③ Jos sopiva tunniste on listassa, valitse se. Muuten kirjoita uusi ja paina Enter. Listassa näkyy, montako uutista tunnisteella jo on. Yleisimmän tunnisteen saat myös rivin Suosituimmat: painikkeista. ⑤ Turhan tunnisteen poistat sen vieressä olevasta rastista (×). Lopuksi paina Julkaise . Tulos Uutinen löytyy uutislistalta kategorian suodattimella. Jokaisen tunnisteen sivulla näkyy tämä uutinen muiden samanaiheisten kanssa. Lisävalinnat Uusi kategoria: valikosta Uutiskategoriat → listan yläreunan plus-painike → Nimi → kentän Osoite suodattimessa vieressä Luo → Julkaise . Kohdassa Järjestys suodattimessa pienin numero tulee ensin. Uuden kategorian voi tehdä myös uutisesta linkillä Lisää uusi kategoria . Se aukeaa uuteen välilehteen. Kategorian nimen voi vaihtaa milloin tahansa. Uusi nimi näkyy kaikissa uutisissa. Kategorian kohtaan Kuvaus hakukoneille (valinnainen) voit kirjoittaa lyhyen kuvauksen Googlen hakutuloksiin. Vanhan blogin kirjoituksissa välilehdellä Hakukoneet ja jako on kohta Alkuperäinen Blogspot-kirjoitus . Se on vain muisto, eikä sitä muokata. Päätä kategoria kerran ja pidä se. Jos et ole varma, valitse yksi laaja kategoria ja lisää tarkemmat aiheet tunnisteiksi. Jos jokin menee vikaan Tunnisteesta tuli eri muoto kuin kirjoitit, esim. \"huuhkajat\" → \"Huuhkajat\": Studio käyttää jo vakiintunutta muotoa. Tämä on oikein. Punainen \"Samanniminen kategoria on jo olemassa.\": käytä olemassa olevaa kategoriaa. Kategoriaa ei voi poistaa: jokin uutinen käyttää sitä. Poista rasti niistä uutisista ensin. Katso myös: Kirjoita uutinen · Sanasto",
          "otsikot": [
            {
              "id": "kategoriat-ja-tunnisteet--milloin",
              "teksti": "Milloin",
              "taso": 2
            },
            {
              "id": "kategoriat-ja-tunnisteet--askeleet",
              "teksti": "Askeleet",
              "taso": 2
            },
            {
              "id": "kategoriat-ja-tunnisteet--tulos",
              "teksti": "Tulos",
              "taso": 2
            },
            {
              "id": "kategoriat-ja-tunnisteet--lisavalinnat",
              "teksti": "Lisävalinnat",
              "taso": 2
            },
            {
              "id": "kategoriat-ja-tunnisteet--jos-jokin-menee-vikaan",
              "teksti": "Jos jokin menee vikaan",
              "taso": 2
            }
          ]
        },
        {
          "id": "veikkaus-ja-kommentit",
          "otsikko": "Avaa veikkaus tai kommentointi",
          "osio": "uutiset",
          "avainsanat": [
            "veikkaus",
            "palloveikkaus",
            "sarjajärjestys",
            "voittajaveikkaus",
            "EM",
            "MM",
            "maalikuningas",
            "kommentti",
            "kommentointi",
            "kommentit päälle",
            "sulje kommentit",
            "joukkueet"
          ],
          "tyypit": [
            "uutinen"
          ],
          "kesto": "noin 5 minuuttia",
          "paivitetty": "2026-10-08",
          "html": "<h2 id=\"veikkaus-ja-kommentit--milloin\">Milloin</h2>\n<p>Kun jäsenet saavat veikata tai kommentoida uutisen alla, esim. palloveikkaus, EM-kisojen voittajaveikkaus tai &quot;Suomen paras avaus&quot;. Viesti näkyy sivulla heti, ja asiattomat piilotetaan jälkikäteen.</p>\n<h2 id=\"veikkaus-ja-kommentit--ennen-kuin-aloitat\">Ennen kuin aloitat</h2>\n<ul>\n<li>Uusi palloveikkauskausi on nopein valmiista pohjasta: <a href=\"/studio/ohjeet/valmiit-pohjat\" data-ohje-kortti=\"valmiit-pohjat\">Aloita uutinen valmiista pohjasta</a>.</li>\n</ul>\n<h2 id=\"veikkaus-ja-kommentit--askeleet\">Askeleet</h2>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/veikkaus-ja-kommentit-01-valilehti.webp\" aria-label=\"Suurenna kuva: Kommentit ja veikkaus -välilehti. 2: välilehti. 3: Salli kommentit. 4: Lomakkeen tyyppi. 5: Joukkueet. 7: Veikkaus sulkeutuu.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/veikkaus-ja-kommentit-01-valilehti.webp\" alt=\"Kommentit ja veikkaus -välilehti. 2: välilehti. 3: Salli kommentit. 4: Lomakkeen tyyppi. 5: Joukkueet. 7: Veikkaus sulkeutuu.\" width=\"659\" height=\"836\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol>\n<li>Avaa uutinen, tai kirjoita uusi. Kirjoita veikkauksen säännöt tekstiin.</li>\n<li>Valitse lomakkeen yläosasta välilehti <strong>Kommentit ja veikkaus</strong>. ②</li>\n<li>Kytke päälle <strong>Salli kommentit</strong>. ③ Lisää kenttiä tulee näkyviin.</li>\n<li>Kohdassa <strong>Lomakkeen tyyppi</strong> valitse yksi: ④\n<ul>\n<li><strong>Kommentti (vapaa teksti)</strong></li>\n<li><strong>Sarjajärjestys (esim. Palloveikkaus: joukkueet järjestykseen)</strong></li>\n<li><strong>Voittajaveikkaus (esim. EM/MM: parhaat sijat ja maalikuningas)</strong></li>\n</ul>\n</li>\n<li>Sarjajärjestys: lisää kohtaan <strong>Joukkueet</strong> sarjan kaikki joukkueet, yksi kerrallaan painikkeella <strong>Lisää kohde</strong>. ⑤</li>\n<li>Voittajaveikkaus: valitse <strong>Montako sijaa veikataan</strong> ja käännä tarvittaessa kytkin <strong>Kysy myös maalikuningasta</strong> päälle.</li>\n<li>Valitse <strong>Veikkaus sulkeutuu</strong>, esim. ensimmäisen kierroksen alku. ⑦ Tyhjänä veikkaus ei sulkeudu.</li>\n<li>Halutessasi kirjoita <strong>Ohje jäsenille</strong>. Se näkyy lomakkeen yläpuolella.</li>\n<li>Lopuksi paina <strong>Julkaise</strong>.</li>\n</ol>\n<h2 id=\"veikkaus-ja-kommentit--tulos\">Tulos</h2>\n<ul>\n<li>Uutisen alla on lomake, jolla jäsenet lähettävät veikkauksen tai kommentin.</li>\n<li>Viestit näkyvät Studiossa kohdassa <strong>Kommentit ja veikkaukset</strong>.</li>\n</ul>\n<h2 id=\"veikkaus-ja-kommentit--lisavalinnat\">Lisävalinnat</h2>\n<ul>\n<li>Sulje kommentointi: kytke pois <strong>Salli kommentit</strong> ja paina <strong>Julkaise</strong>.</li>\n<li>Viestien lukeminen ja piilotus: <a href=\"/studio/ohjeet/kommenttien-valvonta\" data-ohje-kortti=\"kommenttien-valvonta\">Piilota asiaton kommentti</a></li>\n<li>Viime vuoden veikkaus pohjaksi: toimintovalikosta <strong>Kopioi pohjaksi</strong>. Valitse kopioon uusi <strong>Veikkaus sulkeutuu</strong>.</li>\n</ul>\n<h2 id=\"veikkaus-ja-kommentit--jos-jokin-menee-vikaan\">Jos jokin menee vikaan</h2>\n<ul>\n<li>Punainen &quot;Lisää vähintään kaksi joukkuetta.&quot;: sarjajärjestys tarvitsee joukkueet.</li>\n<li>Punainen &quot;Sama joukkue on listalla kahdesti.&quot;: poista toinen.</li>\n<li>Jäsenet eivät pääse veikkaamaan: tarkista <strong>Veikkaus sulkeutuu</strong>. Jos aika on mennyt, siirrä sitä ja julkaise.</li>\n</ul>\n<p>Katso myös: <a href=\"/studio/ohjeet/uutisen-kirjoittaminen\" data-ohje-kortti=\"uutisen-kirjoittaminen\">Kirjoita uutinen</a> · <a href=\"/studio/ohjeet/kommenttien-valvonta\" data-ohje-kortti=\"kommenttien-valvonta\">Piilota asiaton kommentti</a></p>\n",
          "teksti": "Milloin Kun jäsenet saavat veikata tai kommentoida uutisen alla, esim. palloveikkaus, EM-kisojen voittajaveikkaus tai \"Suomen paras avaus\". Viesti näkyy sivulla heti, ja asiattomat piilotetaan jälkikäteen. Ennen kuin aloitat Uusi palloveikkauskausi on nopein valmiista pohjasta: Aloita uutinen valmiista pohjasta . Askeleet Avaa uutinen, tai kirjoita uusi. Kirjoita veikkauksen säännöt tekstiin. Valitse lomakkeen yläosasta välilehti Kommentit ja veikkaus . ② Kytke päälle Salli kommentit . ③ Lisää kenttiä tulee näkyviin. Kohdassa Lomakkeen tyyppi valitse yksi: ④ Kommentti (vapaa teksti) Sarjajärjestys (esim. Palloveikkaus: joukkueet järjestykseen) Voittajaveikkaus (esim. EM/MM: parhaat sijat ja maalikuningas) Sarjajärjestys: lisää kohtaan Joukkueet sarjan kaikki joukkueet, yksi kerrallaan painikkeella Lisää kohde . ⑤ Voittajaveikkaus: valitse Montako sijaa veikataan ja käännä tarvittaessa kytkin Kysy myös maalikuningasta päälle. Valitse Veikkaus sulkeutuu , esim. ensimmäisen kierroksen alku. ⑦ Tyhjänä veikkaus ei sulkeudu. Halutessasi kirjoita Ohje jäsenille . Se näkyy lomakkeen yläpuolella. Lopuksi paina Julkaise . Tulos Uutisen alla on lomake, jolla jäsenet lähettävät veikkauksen tai kommentin. Viestit näkyvät Studiossa kohdassa Kommentit ja veikkaukset . Lisävalinnat Sulje kommentointi: kytke pois Salli kommentit ja paina Julkaise . Viestien lukeminen ja piilotus: Piilota asiaton kommentti Viime vuoden veikkaus pohjaksi: toimintovalikosta Kopioi pohjaksi . Valitse kopioon uusi Veikkaus sulkeutuu . Jos jokin menee vikaan Punainen \"Lisää vähintään kaksi joukkuetta.\": sarjajärjestys tarvitsee joukkueet. Punainen \"Sama joukkue on listalla kahdesti.\": poista toinen. Jäsenet eivät pääse veikkaamaan: tarkista Veikkaus sulkeutuu . Jos aika on mennyt, siirrä sitä ja julkaise. Katso myös: Kirjoita uutinen · Piilota asiaton kommentti",
          "otsikot": [
            {
              "id": "veikkaus-ja-kommentit--milloin",
              "teksti": "Milloin",
              "taso": 2
            },
            {
              "id": "veikkaus-ja-kommentit--ennen-kuin-aloitat",
              "teksti": "Ennen kuin aloitat",
              "taso": 2
            },
            {
              "id": "veikkaus-ja-kommentit--askeleet",
              "teksti": "Askeleet",
              "taso": 2
            },
            {
              "id": "veikkaus-ja-kommentit--tulos",
              "teksti": "Tulos",
              "taso": 2
            },
            {
              "id": "veikkaus-ja-kommentit--lisavalinnat",
              "teksti": "Lisävalinnat",
              "taso": 2
            },
            {
              "id": "veikkaus-ja-kommentit--jos-jokin-menee-vikaan",
              "teksti": "Jos jokin menee vikaan",
              "taso": 2
            }
          ]
        },
        {
          "id": "kommenttien-valvonta",
          "otsikko": "Piilota asiaton kommentti",
          "osio": "uutiset",
          "avainsanat": [
            "kommentti",
            "kommentit",
            "veikkaukset",
            "valvonta",
            "moderointi",
            "asiaton",
            "roskaposti",
            "piilota",
            "poista kommentti",
            "näytä kommentti",
            "palauta kommentti"
          ],
          "tyypit": [
            "kommentti"
          ],
          "kesto": "noin 2 minuuttia",
          "paivitetty": "2026-10-08",
          "html": "<h2 id=\"kommenttien-valvonta--milloin\">Milloin</h2>\n<p>Kun uutisen alle on tullut asiaton viesti tai roskapostia. Kommentit näkyvät sivulla heti, joten ne luetaan jälkikäteen.</p>\n<h2 id=\"kommenttien-valvonta--askeleet\">Askeleet</h2>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/kommenttien-valvonta-01-lista.webp\" aria-label=\"Suurenna kuva: Kommenttien valikko. 1: Kommentit ja veikkaukset. 2: listat Uusimmat, Uutisittain ja Piilotetut.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/kommenttien-valvonta-01-lista.webp\" alt=\"Kommenttien valikko. 1: Kommentit ja veikkaukset. 2: listat Uusimmat, Uutisittain ja Piilotetut.\" width=\"701\" height=\"750\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol>\n<li>Vasemmasta valikosta valitse <strong>Kommentit ja veikkaukset</strong>. ①\nViikon uudet viestit löydät myös kohdasta <strong>Tehtävät sinulle → Uudet kommentit (7 päivää)</strong>.</li>\n<li>Valitse <strong>Uusimmat</strong>, <strong>Uutisittain</strong> tai <strong>Piilotetut</strong>. ②\n<strong>Uutisittain</strong> näyttää yhden uutisen kaikki viestit, esim. yhden veikkauksen vastaukset.</li>\n<li>Avaa viesti ja lue se.</li>\n</ol>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/kommenttien-valvonta-02-piilota.webp\" aria-label=\"Suurenna kuva: Avattu kommentti. 4: Piilota sivulta -painike alapalkissa.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/kommenttien-valvonta-02-piilota.webp\" alt=\"Avattu kommentti. 4: Piilota sivulta -painike alapalkissa.\" width=\"840\" height=\"858\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol start=\"4\">\n<li>Asiaton viesti: paina alareunasta <strong>Piilota sivulta</strong>. ④\nViesti katoaa sivulta heti. <strong>Julkaise</strong>-painallusta ei tarvita.</li>\n</ol>\n<h2 id=\"kommenttien-valvonta--tulos\">Tulos</h2>\n<ul>\n<li>Piilotettu viesti ei näy sivulla. Studiossa se säilyy.</li>\n<li>Listassa sen edessä on merkki 🚫, ja alapalkissa lukee <strong>Piilotettu</strong>.</li>\n</ul>\n<h2 id=\"kommenttien-valvonta--lisavalinnat\">Lisävalinnat</h2>\n<ul>\n<li>Palauta piilotettu viesti: avaa se listasta <strong>Piilotetut</strong> ja paina <strong>Näytä sivulla</strong>.</li>\n<li>Kommentoinnin sulkeminen uutiselta: <a href=\"/studio/ohjeet/veikkaus-ja-kommentit\" data-ohje-kortti=\"veikkaus-ja-kommentit\">Avaa veikkaus tai kommentointi</a></li>\n<li>Jos kirjoittaja pyytää poistamaan viestinsä kokonaan: <a href=\"/studio/ohjeet/tietosuojapyynto\" data-ohje-kortti=\"tietosuojapyynto\">Poista henkilön tiedot pyynnöstä</a></li>\n</ul>\n<div class=\"markdown-alert markdown-alert-warning\">\n<p class=\"markdown-alert-title\">Varoitus</p>\n<p>Toimintovalikon <strong>Poista pysyvästi</strong> poistaa viestin lopullisesti. Sitä ei voi palauttaa edes varmuuskopiosta. Käytä tavallisesti <strong>Piilota sivulta</strong>.</p>\n</div>\n<h2 id=\"kommenttien-valvonta--jos-jokin-menee-vikaan\">Jos jokin menee vikaan</h2>\n<ul>\n<li>Piilotus ei onnistu: odota hetki ja paina <strong>Piilota sivulta</strong> uudelleen.</li>\n<li>Piilotettu viesti näkyy yhä sivulla: päivitä sivu. Jos sivustolla on yläreunassa esikatselutilan palkki, paina &quot;Poistu esikatselusta&quot;.</li>\n</ul>\n<p>Katso myös: <a href=\"/studio/ohjeet/veikkaus-ja-kommentit\" data-ohje-kortti=\"veikkaus-ja-kommentit\">Avaa veikkaus tai kommentointi</a> · <a href=\"/studio/ohjeet/tilamerkit\" data-ohje-kortti=\"tilamerkit\">Tilamerkit ja listojen merkinnät</a></p>\n",
          "teksti": "Milloin Kun uutisen alle on tullut asiaton viesti tai roskapostia. Kommentit näkyvät sivulla heti, joten ne luetaan jälkikäteen. Askeleet Vasemmasta valikosta valitse Kommentit ja veikkaukset . ① Viikon uudet viestit löydät myös kohdasta Tehtävät sinulle → Uudet kommentit (7 päivää) . Valitse Uusimmat , Uutisittain tai Piilotetut . ② Uutisittain näyttää yhden uutisen kaikki viestit, esim. yhden veikkauksen vastaukset. Avaa viesti ja lue se. Asiaton viesti: paina alareunasta Piilota sivulta . ④ Viesti katoaa sivulta heti. Julkaise -painallusta ei tarvita. Tulos Piilotettu viesti ei näy sivulla. Studiossa se säilyy. Listassa sen edessä on merkki 🚫, ja alapalkissa lukee Piilotettu . Lisävalinnat Palauta piilotettu viesti: avaa se listasta Piilotetut ja paina Näytä sivulla . Kommentoinnin sulkeminen uutiselta: Avaa veikkaus tai kommentointi Jos kirjoittaja pyytää poistamaan viestinsä kokonaan: Poista henkilön tiedot pyynnöstä Toimintovalikon Poista pysyvästi poistaa viestin lopullisesti. Sitä ei voi palauttaa edes varmuuskopiosta. Käytä tavallisesti Piilota sivulta . Jos jokin menee vikaan Piilotus ei onnistu: odota hetki ja paina Piilota sivulta uudelleen. Piilotettu viesti näkyy yhä sivulla: päivitä sivu. Jos sivustolla on yläreunassa esikatselutilan palkki, paina \"Poistu esikatselusta\". Katso myös: Avaa veikkaus tai kommentointi · Tilamerkit ja listojen merkinnät",
          "otsikot": [
            {
              "id": "kommenttien-valvonta--milloin",
              "teksti": "Milloin",
              "taso": 2
            },
            {
              "id": "kommenttien-valvonta--askeleet",
              "teksti": "Askeleet",
              "taso": 2
            },
            {
              "id": "kommenttien-valvonta--tulos",
              "teksti": "Tulos",
              "taso": 2
            },
            {
              "id": "kommenttien-valvonta--lisavalinnat",
              "teksti": "Lisävalinnat",
              "taso": 2
            },
            {
              "id": "kommenttien-valvonta--jos-jokin-menee-vikaan",
              "teksti": "Jos jokin menee vikaan",
              "taso": 2
            }
          ]
        },
        {
          "id": "jakokuva",
          "otsikko": "Valitse kuva, joka näkyy jaossa",
          "osio": "uutiset",
          "avainsanat": [
            "jakokuva",
            "jako",
            "jaa",
            "WhatsApp",
            "Facebook",
            "some",
            "esikatselukuva",
            "linkin kuva",
            "logo näkyy",
            "väärä kuva jaossa"
          ],
          "tyypit": [
            "uutinen",
            "tapahtuma",
            "sivu",
            "galleriaAlbumi",
            "ravintola",
            "klubiToiminta",
            "pelaaja",
            "stadion"
          ],
          "kesto": "noin 3 minuuttia",
          "paivitetty": "2026-10-08",
          "html": "<h2 id=\"jakokuva--milloin\">Milloin</h2>\n<p>Kun jaat sivuston linkin WhatsAppissa tai Facebookissa. Linkin esikatselussa näkyy kuva, otsikko ja osoite. Kuva valitaan automaattisesti, mutta oma kuva näyttää parhaalta.</p>\n<h2 id=\"jakokuva--ennen-kuin-aloitat\">Ennen kuin aloitat</h2>\n<ul>\n<li>Hyvä jakokuva on vaakakuva, vähintään noin 1200 pikseliä leveä.</li>\n<li>Kuvaan ei tarvitse lisätä tekstiä tai logoa. Otsikko näkyy kuvan vieressä.</li>\n</ul>\n<h2 id=\"jakokuva--askeleet\">Askeleet</h2>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/jakokuva-01-kansikuva.webp\" aria-label=\"Suurenna kuva: Uutislomake. 2: Kansikuva-kenttä. 4: Rajaa kuva -painike.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/jakokuva-01-kansikuva.webp\" alt=\"Uutislomake. 2: Kansikuva-kenttä. 4: Rajaa kuva -painike.\" width=\"685\" height=\"651\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol>\n<li>Avaa uutinen, tapahtuma tai sivu.</li>\n<li>Lisää kuva sisällön omaan kuvakenttään. ②\nUutisessa ja tapahtumassa se on <strong>Kansikuva</strong>, sivulla <strong>Iso kuva sivun yläosassa</strong>.</li>\n<li>Kirjoita <strong>Vaihtoehtoinen teksti (alt)</strong>.</li>\n<li>Paina <strong>Rajaa kuva</strong> ja vedä ympyrä kuvan tärkeimmän kohdan päälle. ④\nJako rajaa kuvan tämän kohdan ympäriltä.</li>\n<li>Paina <strong>Julkaise</strong>.</li>\n<li>Jaa linkki vasta julkaisun jälkeen.</li>\n</ol>\n<h2 id=\"jakokuva--tulos\">Tulos</h2>\n<ul>\n<li>Jaetun linkin esikatselussa näkyy valitsemasi kuva.</li>\n</ul>\n<h2 id=\"jakokuva--lisavalinnat\">Lisävalinnat</h2>\n<ul>\n<li>Kuvan lisäys ja rajaus tarkemmin: <a href=\"/studio/ohjeet/kuva\" data-ohje-kortti=\"kuva\">Lisää tai vaihda kuva</a></li>\n</ul>\n<div class=\"markdown-alert markdown-alert-note\">\n<p class=\"markdown-alert-title\">Hyvä tietää</p>\n<p>Jos omaa kuvaa ei ole, jakoon otetaan ensin tekstin ensimmäinen riittävän iso kuva. Sen jälkeen YouTube-videon kuva ja lopuksi klubin logo.\nHyvin pieniä kuvia ei käytetä, koska ne näyttäisivät suttuisilta.</p>\n</div>\n<h2 id=\"jakokuva--jos-jokin-menee-vikaan\">Jos jokin menee vikaan</h2>\n<ul>\n<li>Jaossa näkyy klubin logo: sisällössä ei ole riittävän isoa kuvaa. Lisää isompi kuva ja julkaise.</li>\n<li>Jaossa näkyy vanha kuva: WhatsApp ja Facebook muistavat kerran jaetun linkin kuvan. Uusi kuva näkyy vasta jonkin ajan kuluttua.</li>\n<li>Kuvasta leikkautuu tärkeä kohta: siirrä ympyrää rajausikkunassa ja julkaise uudelleen.</li>\n</ul>\n<p>Katso myös: <a href=\"/studio/ohjeet/uutisen-kirjoittaminen\" data-ohje-kortti=\"uutisen-kirjoittaminen\">Kirjoita uutinen</a> · <a href=\"/studio/ohjeet/kuva\" data-ohje-kortti=\"kuva\">Lisää tai vaihda kuva</a></p>\n",
          "teksti": "Milloin Kun jaat sivuston linkin WhatsAppissa tai Facebookissa. Linkin esikatselussa näkyy kuva, otsikko ja osoite. Kuva valitaan automaattisesti, mutta oma kuva näyttää parhaalta. Ennen kuin aloitat Hyvä jakokuva on vaakakuva, vähintään noin 1200 pikseliä leveä. Kuvaan ei tarvitse lisätä tekstiä tai logoa. Otsikko näkyy kuvan vieressä. Askeleet Avaa uutinen, tapahtuma tai sivu. Lisää kuva sisällön omaan kuvakenttään. ② Uutisessa ja tapahtumassa se on Kansikuva , sivulla Iso kuva sivun yläosassa . Kirjoita Vaihtoehtoinen teksti (alt) . Paina Rajaa kuva ja vedä ympyrä kuvan tärkeimmän kohdan päälle. ④ Jako rajaa kuvan tämän kohdan ympäriltä. Paina Julkaise . Jaa linkki vasta julkaisun jälkeen. Tulos Jaetun linkin esikatselussa näkyy valitsemasi kuva. Lisävalinnat Kuvan lisäys ja rajaus tarkemmin: Lisää tai vaihda kuva Jos omaa kuvaa ei ole, jakoon otetaan ensin tekstin ensimmäinen riittävän iso kuva. Sen jälkeen YouTube-videon kuva ja lopuksi klubin logo. Hyvin pieniä kuvia ei käytetä, koska ne näyttäisivät suttuisilta. Jos jokin menee vikaan Jaossa näkyy klubin logo: sisällössä ei ole riittävän isoa kuvaa. Lisää isompi kuva ja julkaise. Jaossa näkyy vanha kuva: WhatsApp ja Facebook muistavat kerran jaetun linkin kuvan. Uusi kuva näkyy vasta jonkin ajan kuluttua. Kuvasta leikkautuu tärkeä kohta: siirrä ympyrää rajausikkunassa ja julkaise uudelleen. Katso myös: Kirjoita uutinen · Lisää tai vaihda kuva",
          "otsikot": [
            {
              "id": "jakokuva--milloin",
              "teksti": "Milloin",
              "taso": 2
            },
            {
              "id": "jakokuva--ennen-kuin-aloitat",
              "teksti": "Ennen kuin aloitat",
              "taso": 2
            },
            {
              "id": "jakokuva--askeleet",
              "teksti": "Askeleet",
              "taso": 2
            },
            {
              "id": "jakokuva--tulos",
              "teksti": "Tulos",
              "taso": 2
            },
            {
              "id": "jakokuva--lisavalinnat",
              "teksti": "Lisävalinnat",
              "taso": 2
            },
            {
              "id": "jakokuva--jos-jokin-menee-vikaan",
              "teksti": "Jos jokin menee vikaan",
              "taso": 2
            }
          ]
        }
      ]
    },
    {
      "id": "arkisto",
      "otsikko": "Jalkapalloarkisto",
      "kortit": [
        {
          "id": "tilastotaulukon-paivitys",
          "otsikko": "Päivitä tilastotaulukko",
          "osio": "arkisto",
          "avainsanat": [
            "tilasto",
            "taulukko",
            "tilastot",
            "Huuhkajat",
            "Huuhkaja-arvostelu",
            "otteluittain",
            "pelaajittain",
            "pelaajatilasto",
            "Kansojen liiga",
            "päävalmentajat",
            "pisteet",
            "sijat",
            "sijoitus",
            "järjestys",
            "prosentit",
            "prosentti",
            "solu",
            "rivi",
            "ottelu-ilta",
            "ottelun jälkeen",
            "päivitä tilasto",
            "Excel"
          ],
          "tyypit": [
            "jalkapalloTilasto"
          ],
          "kesto": "noin 10 minuuttia",
          "paivitetty": "2026-10-08",
          "html": "<h2 id=\"tilastotaulukon-paivitys--milloin\">Milloin</h2>\n<p>Ottelun jälkeen päivität taulukoita: Huuhkaja-arvostelua, pelaajatilastoja, Kansojen liigaa tai muuta tilastoa.\nMuutos näkyy sivustolla taulukon omalla sivulla, kun julkaiset sen.</p>\n<h2 id=\"tilastotaulukon-paivitys--ennen-kuin-aloitat\">Ennen kuin aloitat</h2>\n<ul>\n<li>Kokoa illan muutokset ensin yhteen, esimerkiksi paperille tai Exceliin.</li>\n<li>Kirjoittamasi tallentuu itsestään luonnokseksi. Kävijät eivät näe luonnosta.</li>\n<li>Tee kaikki taulukon muutokset ensin. Paina <strong>Julkaise</strong> vain kerran, aivan lopuksi.</li>\n</ul>\n<div class=\"markdown-alert markdown-alert-tip\">\n<p class=\"markdown-alert-title\">Vinkki</p>\n<p>Jokainen taulukko julkaistaan erikseen. Jos päivität kolme taulukkoa, painat <strong>Julkaise</strong> kolme\nkertaa: kerran kunkin taulukon lopuksi.</p>\n</div>\n<h2 id=\"tilastotaulukon-paivitys--askeleet\">Askeleet</h2>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/tilastotaulukon-paivitys-01-lista.webp\" aria-label=\"Suurenna kuva: Studion valikko. 1: Jalkapalloarkisto. 2: Tilastot ja Huuhkajat. 3: Taulukko listassa.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/tilastotaulukon-paivitys-01-lista.webp\" alt=\"Studion valikko. 1: Jalkapalloarkisto. 2: Tilastot ja Huuhkajat. 3: Taulukko listassa.\" width=\"1600\" height=\"800\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol>\n<li>Vasemmasta valikosta valitse <strong>Jalkapalloarkisto</strong>. ①</li>\n<li>Valitse <strong>Tilastot</strong> ja sitten ryhmä, esimerkiksi <strong>Huuhkajat</strong>. ②</li>\n<li>Valitse listasta taulukko, jota päivität. ③\nTaulukko avautuu oikealle.</li>\n</ol>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/tilastotaulukon-paivitys-02-editori.webp\" aria-label=\"Suurenna kuva: Taulukkoeditori. 4: Tilastodata. 5: Etsi taulukosta. 6: Muokattava solu. 7: Rivin valikko, jossa Siirrä ylös ja alas.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/tilastotaulukon-paivitys-02-editori.webp\" alt=\"Taulukkoeditori. 4: Tilastodata. 5: Etsi taulukosta. 6: Muokattava solu. 7: Rivin valikko, jossa Siirrä ylös ja alas.\" width=\"803\" height=\"1450\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol start=\"4\">\n<li>Otsikon alla valitse välilehti <strong>Tilastodata</strong>. ④</li>\n<li>Kirjoita kenttään <strong>Etsi taulukosta</strong> pelaajan tai ottelun nimi. ⑤\nNäkyviin jäävät vain ne rivit, joilla nimi on.</li>\n<li>Napsauta solua ja kirjoita uusi arvo. Paina lopuksi Enter. ⑥\nNapsautus valitsee vanhan arvon, joten uusi korvaa sen. Arvo tallentuu, kun poistut\nsolusta. Enter vie alempaan soluun.</li>\n</ol>\n<div class=\"markdown-alert markdown-alert-note\">\n<p class=\"markdown-alert-title\">Hyvä tietää</p>\n<p>Kirjoita luvut samalla tavalla joka taulukossa:</p>\n<ul>\n<li>prosentti: luku, välilyönti ja prosenttimerkki, esimerkiksi 13 % tai 40 %</li>\n<li>desimaali pilkulla: 2,5</li>\n<li>iso luku välilyönnillä: 61 035</li>\n<li>päivämäärä: 26.9.2026.</li>\n</ul>\n<p>Numerosarakkeessa prosentti ja desimaali saavat solun alle aaltoviivan. Se on normaalia.\nArvo tallentuu sellaisenaan.</p>\n</div>\n<ol start=\"7\">\n<li>Tarkista lopuksi järjestys ja sijat. Siirrä riviä rivinumeron vieressä olevasta valikosta ⋮:\n<strong>Siirrä ylös</strong> tai <strong>Siirrä alas</strong>. ⑦\n<ul>\n<li>Tyhjennä ensin hakukenttä. Haun aikana rivejä ei voi siirtää.</li>\n<li>Korjaa sitten sijanumerot ylhäältä alas.</li>\n<li>Saman pistemäärän kohdalla toimi kuten taulukossa on ennenkin tehty.</li>\n</ul>\n</li>\n</ol>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/tilastotaulukon-paivitys-03-lisatiedot.webp\" aria-label=\"Suurenna kuva: Taulukon alaosa. 8: Lisätiedot taulukon jälkeen. 9: Tiedot päivitetty. 10: Julkaise-painike oikeassa alakulmassa.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/tilastotaulukon-paivitys-03-lisatiedot.webp\" alt=\"Taulukon alaosa. 8: Lisätiedot taulukon jälkeen. 9: Tiedot päivitetty. 10: Julkaise-painike oikeassa alakulmassa.\" width=\"803\" height=\"766\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol start=\"8\">\n<li>Kirjoita tarvittaessa ottelun tiedot kenttään <strong>Lisätiedot taulukon jälkeen</strong>. ⑧\nTeksti näkyy sivulla taulukon alla.</li>\n<li>Kentän <strong>Tiedot päivitetty</strong> oikeassa reunassa paina kalenterikuvaketta ja valitse tämä päivä. ⑨</li>\n<li>Kun kaikki on valmista, paina oikeassa alakulmassa <strong>Julkaise</strong>. ⑩</li>\n</ol>\n<h2 id=\"tilastotaulukon-paivitys--tulos\">Tulos</h2>\n<ul>\n<li>Oikeaan alakulmaan tulee hetkeksi ilmoitus <strong>Dokumentti on julkaistu</strong>.\nAlapalkissa lukee &quot;Viimeksi julkaistu juuri nyt&quot;, ja <strong>Julkaise</strong> muuttuu harmaaksi.</li>\n<li>Taulukko päivittyy sivustolla noin minuutissa.</li>\n<li>Lomakkeen yläreunassa kohta <strong>Käytetty yhdellä sivulla</strong> kertoo, millä sivulla taulukko näkyy.\nAvaa se nuolesta, niin linkki vie sivulle.</li>\n</ul>\n<h2 id=\"tilastotaulukon-paivitys--lisavalinnat\">Lisävalinnat</h2>\n<ul>\n<li>Uusi rivi: paina taulukon alla <strong>Lisää rivi</strong>. Tai valitse rivin valikosta ⋮\n<strong>Lisää rivi yläpuolelle</strong> tai <strong>Lisää rivi alapuolelle</strong>.</li>\n<li>Rivin poisto: valitse rivin valikosta ⋮ <strong>Poista rivi</strong>.</li>\n<li>Monta riviä uuteen järjestykseen kerralla:\n<ol>\n<li>Paina <strong>Kopioi Exceliin</strong> ja liitä taulukko Exceliin.</li>\n<li>Järjestä ja muokkaa rivit Excelissä. Kopioi sitten kaikki solut otsikkoriveineen.</li>\n<li>Paina <strong>Tuo Excelistä</strong> ja liitä solut.</li>\n<li>Valitse <strong>Korvaa koko taulukko (sarakkeet ja rivit)</strong>. Valmiiksi on valittu\n<strong>Lisää rivit taulukon loppuun</strong>, joten vaihda valinta.</li>\n<li>Tarkista esikatselu. Paina oikeassa alakulmassa painiketta, jossa lukee esimerkiksi\n<strong>Korvaa taulukko (63 riviä, 3 saraketta)</strong>.</li>\n</ol>\n</li>\n<li>Sarakkeen nimi tai tyyppi: valitse sarakeotsikon valikosta ⋮ <strong>Muokkaa nimeä ja tyyppiä</strong>.</li>\n<li>Tarkistus illan lopuksi: valikon <strong>Tehtävät sinulle</strong> kohdasta <strong>Julkaisemattomat muutokset</strong>\nnäet, jäikö jokin taulukko julkaisematta.</li>\n<li>Uusi taulukko: <a href=\"/studio/ohjeet/uusi-tilastotaulukko\" data-ohje-kortti=\"uusi-tilastotaulukko\">Lisää uusi tilastotaulukko</a></li>\n</ul>\n<h2 id=\"tilastotaulukon-paivitys--jos-jokin-menee-vikaan\">Jos jokin menee vikaan</h2>\n<ul>\n<li>Kirjoitit soluun väärin: paina Esc ennen kuin poistut solusta. Jos ehdit jo poistua,\nkirjoita oikea arvo uudelleen.</li>\n<li>Poistit rivin vahingossa: oikeaan alakulmaan tulee ilmoitus, esimerkiksi <strong>Rivi 3 poistettu</strong>.\nPaina siinä heti <strong>Kumoa</strong>. Ilmoitus näkyy noin kahdeksan sekuntia.</li>\n<li>Lisätiedoista katosi linkki tai teksti: paina heti Ctrl+Z. Vanhemman version saat\nversiohistoriasta, katso <a href=\"/studio/ohjeet/luonnos-julkaisu-ja-peruminen\" data-ohje-kortti=\"luonnos-julkaisu-ja-peruminen\">Peru muutos</a>.</li>\n<li><strong>Julkaise</strong>-painikkeessa lukee pitkään &quot;Validoidaan dokumenttia…&quot;: päivitä selaimen sivu\n(F5) ja paina <strong>Julkaise</strong> uudelleen. Muutokset ovat tallessa.</li>\n<li>Haluat perua kaiken julkaisemattoman: avaa <strong>Julkaise</strong>-painikkeen vierestä valikko\n<strong>Asiakirjatoiminnot</strong> (⋯) ja valitse <strong>Hylkää muutokset</strong>. Vahvista ikkunassa painamalla\n<strong>Hylkää muutokset</strong>. Sivuston versio ei muutu.</li>\n</ul>\n<p>Mikään ei katoa: keskeneräinen taulukko säilyy luonnoksena, vaikka suljet selaimen.</p>\n<p>Katso myös: <a href=\"/studio/ohjeet/uusi-tilastotaulukko\" data-ohje-kortti=\"uusi-tilastotaulukko\">Lisää uusi tilastotaulukko</a> · <a href=\"/studio/ohjeet/huuhkajat-ja-kansojen-liiga\" data-ohje-kortti=\"huuhkajat-ja-kansojen-liiga\">Huuhkajat ja Kansojen liiga</a> · <a href=\"/studio/ohjeet/luonnos-julkaisu-ja-peruminen\" data-ohje-kortti=\"luonnos-julkaisu-ja-peruminen\">Luonnos, julkaisu ja peruminen</a></p>\n",
          "teksti": "Milloin Ottelun jälkeen päivität taulukoita: Huuhkaja-arvostelua, pelaajatilastoja, Kansojen liigaa tai muuta tilastoa. Muutos näkyy sivustolla taulukon omalla sivulla, kun julkaiset sen. Ennen kuin aloitat Kokoa illan muutokset ensin yhteen, esimerkiksi paperille tai Exceliin. Kirjoittamasi tallentuu itsestään luonnokseksi. Kävijät eivät näe luonnosta. Tee kaikki taulukon muutokset ensin. Paina Julkaise vain kerran, aivan lopuksi. Jokainen taulukko julkaistaan erikseen. Jos päivität kolme taulukkoa, painat Julkaise kolme kertaa: kerran kunkin taulukon lopuksi. Askeleet Vasemmasta valikosta valitse Jalkapalloarkisto . ① Valitse Tilastot ja sitten ryhmä, esimerkiksi Huuhkajat . ② Valitse listasta taulukko, jota päivität. ③ Taulukko avautuu oikealle. Otsikon alla valitse välilehti Tilastodata . ④ Kirjoita kenttään Etsi taulukosta pelaajan tai ottelun nimi. ⑤ Näkyviin jäävät vain ne rivit, joilla nimi on. Napsauta solua ja kirjoita uusi arvo. Paina lopuksi Enter. ⑥ Napsautus valitsee vanhan arvon, joten uusi korvaa sen. Arvo tallentuu, kun poistut solusta. Enter vie alempaan soluun. Kirjoita luvut samalla tavalla joka taulukossa: prosentti: luku, välilyönti ja prosenttimerkki, esimerkiksi 13 % tai 40 % desimaali pilkulla: 2,5 iso luku välilyönnillä: 61 035 päivämäärä: 26.9.2026. Numerosarakkeessa prosentti ja desimaali saavat solun alle aaltoviivan. Se on normaalia. Arvo tallentuu sellaisenaan. Tarkista lopuksi järjestys ja sijat. Siirrä riviä rivinumeron vieressä olevasta valikosta ⋮: Siirrä ylös tai Siirrä alas . ⑦ Tyhjennä ensin hakukenttä. Haun aikana rivejä ei voi siirtää. Korjaa sitten sijanumerot ylhäältä alas. Saman pistemäärän kohdalla toimi kuten taulukossa on ennenkin tehty. Kirjoita tarvittaessa ottelun tiedot kenttään Lisätiedot taulukon jälkeen . ⑧ Teksti näkyy sivulla taulukon alla. Kentän Tiedot päivitetty oikeassa reunassa paina kalenterikuvaketta ja valitse tämä päivä. ⑨ Kun kaikki on valmista, paina oikeassa alakulmassa Julkaise . ⑩ Tulos Oikeaan alakulmaan tulee hetkeksi ilmoitus Dokumentti on julkaistu . Alapalkissa lukee \"Viimeksi julkaistu juuri nyt\", ja Julkaise muuttuu harmaaksi. Taulukko päivittyy sivustolla noin minuutissa. Lomakkeen yläreunassa kohta Käytetty yhdellä sivulla kertoo, millä sivulla taulukko näkyy. Avaa se nuolesta, niin linkki vie sivulle. Lisävalinnat Uusi rivi: paina taulukon alla Lisää rivi . Tai valitse rivin valikosta ⋮ Lisää rivi yläpuolelle tai Lisää rivi alapuolelle . Rivin poisto: valitse rivin valikosta ⋮ Poista rivi . Monta riviä uuteen järjestykseen kerralla: Paina Kopioi Exceliin ja liitä taulukko Exceliin. Järjestä ja muokkaa rivit Excelissä. Kopioi sitten kaikki solut otsikkoriveineen. Paina Tuo Excelistä ja liitä solut. Valitse Korvaa koko taulukko (sarakkeet ja rivit) . Valmiiksi on valittu Lisää rivit taulukon loppuun , joten vaihda valinta. Tarkista esikatselu. Paina oikeassa alakulmassa painiketta, jossa lukee esimerkiksi Korvaa taulukko (63 riviä, 3 saraketta) . Sarakkeen nimi tai tyyppi: valitse sarakeotsikon valikosta ⋮ Muokkaa nimeä ja tyyppiä . Tarkistus illan lopuksi: valikon Tehtävät sinulle kohdasta Julkaisemattomat muutokset näet, jäikö jokin taulukko julkaisematta. Uusi taulukko: Lisää uusi tilastotaulukko Jos jokin menee vikaan Kirjoitit soluun väärin: paina Esc ennen kuin poistut solusta. Jos ehdit jo poistua, kirjoita oikea arvo uudelleen. Poistit rivin vahingossa: oikeaan alakulmaan tulee ilmoitus, esimerkiksi Rivi 3 poistettu . Paina siinä heti Kumoa . Ilmoitus näkyy noin kahdeksan sekuntia. Lisätiedoista katosi linkki tai teksti: paina heti Ctrl+Z. Vanhemman version saat versiohistoriasta, katso Peru muutos . Julkaise -painikkeessa lukee pitkään \"Validoidaan dokumenttia…\": päivitä selaimen sivu (F5) ja paina Julkaise uudelleen. Muutokset ovat tallessa. Haluat perua kaiken julkaisemattoman: avaa Julkaise -painikkeen vierestä valikko Asiakirjatoiminnot (⋯) ja valitse Hylkää muutokset . Vahvista ikkunassa painamalla Hylkää muutokset . Sivuston versio ei muutu. Mikään ei katoa: keskeneräinen taulukko säilyy luonnoksena, vaikka suljet selaimen. Katso myös: Lisää uusi tilastotaulukko · Huuhkajat ja Kansojen liiga · Luonnos, julkaisu ja peruminen",
          "otsikot": [
            {
              "id": "tilastotaulukon-paivitys--milloin",
              "teksti": "Milloin",
              "taso": 2
            },
            {
              "id": "tilastotaulukon-paivitys--ennen-kuin-aloitat",
              "teksti": "Ennen kuin aloitat",
              "taso": 2
            },
            {
              "id": "tilastotaulukon-paivitys--askeleet",
              "teksti": "Askeleet",
              "taso": 2
            },
            {
              "id": "tilastotaulukon-paivitys--tulos",
              "teksti": "Tulos",
              "taso": 2
            },
            {
              "id": "tilastotaulukon-paivitys--lisavalinnat",
              "teksti": "Lisävalinnat",
              "taso": 2
            },
            {
              "id": "tilastotaulukon-paivitys--jos-jokin-menee-vikaan",
              "teksti": "Jos jokin menee vikaan",
              "taso": 2
            }
          ]
        },
        {
          "id": "uusi-tilastotaulukko",
          "otsikko": "Lisää uusi tilastotaulukko",
          "osio": "arkisto",
          "avainsanat": [
            "uusi taulukko",
            "uusi tilasto",
            "uusi kausi",
            "mölkky",
            "palloveikkaus",
            "jouluruokailu",
            "tuo Excelistä",
            "liitä Excelistä",
            "sarake",
            "kategoria",
            "taulukko ei näy"
          ],
          "tyypit": [
            "jalkapalloTilasto"
          ],
          "kesto": "noin 15 minuuttia",
          "paivitetty": "2026-10-08",
          "html": "<h2 id=\"uusi-tilastotaulukko--milloin\">Milloin</h2>\n<p>Kun tarvitset kokonaan uuden taulukon: uusi kausi, uusi veikkaus tai uusi tilasto.\nOlemassa olevan taulukon päivitys on omassa kortissaan.</p>\n<h2 id=\"uusi-tilastotaulukko--ennen-kuin-aloitat\">Ennen kuin aloitat</h2>\n<ul>\n<li>Taulukko on helpointa tehdä ensin Excelissä tai Google Sheetsissä.</li>\n<li>Mieti, mihin ryhmään taulukko kuuluu. Ryhmä ratkaisee, millä sivulla se näkyy.</li>\n</ul>\n<h2 id=\"uusi-tilastotaulukko--askeleet\">Askeleet</h2>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/uusi-tilastotaulukko-01-ryhmat.webp\" aria-label=\"Suurenna kuva: Tilastojen ryhmät. 1: Tilastot. 2: Ryhmät. 3: Plus-painike listan yläreunassa.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/uusi-tilastotaulukko-01-ryhmat.webp\" alt=\"Tilastojen ryhmät. 1: Tilastot. 2: Ryhmät. 3: Plus-painike listan yläreunassa.\" width=\"1600\" height=\"800\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol>\n<li>Valitse <strong>Jalkapalloarkisto</strong> ja sitten <strong>Tilastot</strong>. ①</li>\n<li>Valitse ryhmä, esimerkiksi <strong>Klubin omat tilastot</strong>. ②</li>\n<li>Paina listan yläreunassa plus-painiketta (+). Sen nimi on <strong>Luo uusi asiakirja</strong>. ③\nRyhmässä <strong>Muut arkiston taulukot</strong> valitse ensin taulukon kategoria. Muissa ryhmissä se on valmiina.\nUusi taulukko avautuu oikealle. Keskimmäinen lista vaihtuu listaksi <strong>Kaikki tilastot</strong>.</li>\n<li>Kirjoita kenttään <strong>Otsikko</strong> taulukon nimi.</li>\n<li>Kentän <strong>Osoite sivustolla</strong> vieressä paina <strong>Luo</strong>.</li>\n</ol>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/uusi-tilastotaulukko-02-tuonti.webp\" aria-label=\"Suurenna kuva: Tuo taulukko Excelistä -ikkuna. 6: Tuo Excelistä -painikkeesta avautuva ikkuna. 7: Ensimmäinen rivi on sarakkeiden nimet -rasti.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/uusi-tilastotaulukko-02-tuonti.webp\" alt=\"Tuo taulukko Excelistä -ikkuna. 6: Tuo Excelistä -painikkeesta avautuva ikkuna. 7: Ensimmäinen rivi on sarakkeiden nimet -rasti.\" width=\"1280\" height=\"800\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol start=\"6\">\n<li>Valitse välilehti <strong>Tilastodata</strong> ja paina <strong>Tuo Excelistä</strong>. ⑥</li>\n<li>Kopioi solut Excelissä (Ctrl+C) ja liitä ne ikkunaan (Ctrl+V). Jätä rasti\n<strong>Ensimmäinen rivi on sarakkeiden nimet</strong>, jos ylimmällä rivillä on otsikot. ⑦</li>\n<li>Tarkista esikatselu. Paina oikeassa alakulmassa painiketta, jossa lukee esimerkiksi\n<strong>Korvaa taulukko (3 riviä, 4 saraketta)</strong>.\nTaulukko täyttyy. Sarakkeiden tyypit arvataan sisällöstä.</li>\n<li>Oikeassa alakulmassa paina <strong>Julkaise</strong>.</li>\n</ol>\n<div class=\"markdown-alert markdown-alert-note\">\n<p class=\"markdown-alert-title\">Hyvä tietää</p>\n<p>Ryhmän <strong>Klubin omat tilastot</strong> taulukot ja pelaajatilastot näkyvät vasta, kun ne on liitetty sivuun.\nLisää taulukko sivun kenttään <strong>Taulukot</strong>. Klubin toiminnassa ja pelaajalla kentän nimi on\n<strong>Tilastotaulukot</strong>. Julkaise sitten myös se sivu.</p>\n</div>\n<h2 id=\"uusi-tilastotaulukko--tulos\">Tulos</h2>\n<ul>\n<li>Oikeaan alakulmaan tulee ilmoitus <strong>Dokumentti on julkaistu</strong>.</li>\n<li>Lomakkeen yläreunassa lukee <strong>Käytetty yhdellä sivulla</strong>. Avaa se nuolesta, niin näet sivun.\nRyhmän <strong>Klubin omat tilastot</strong> taulukossa siinä on keltainen huomautus, kunnes liität\ntaulukon sivuun (katso huomautus askelten lopussa).</li>\n<li>Taulukko näkyy sivustolla noin minuutin kuluttua.</li>\n</ul>\n<h2 id=\"uusi-tilastotaulukko--lisavalinnat\">Lisävalinnat</h2>\n<ul>\n<li>Sarakkeet yksi kerrallaan: paina <strong>Lisää sarake</strong>. Anna <strong>Sarakkeen nimi</strong> ja valitse\nkohdassa <strong>Mitä sarakkeessa on?</strong> tyyppi: <strong>Teksti</strong>, <strong>Numero</strong>, <strong>Päivämäärä</strong>, <strong>Vuosi</strong> tai\n<strong>Linkki</strong>. Paina <strong>Tallenna</strong>.</li>\n<li>Prosenteille ja desimaaleille valitse <strong>Teksti</strong>. Kokonaisluvuille <strong>Numero</strong>.</li>\n<li>Rivit: paina <strong>Lisää rivi</strong> ja kirjoita solut kuten Excelissä.</li>\n<li>Teksti taulukon ylle: välilehden <strong>Perustiedot</strong> kenttä <strong>Johdanto</strong>.</li>\n<li>Monta taulukkoa samalla sivulla: pienempi luku kentässä <strong>Järjestys sivulla</strong> näkyy ylempänä.</li>\n<li>Huuhkajat-taulukko: <a href=\"/studio/ohjeet/huuhkajat-ja-kansojen-liiga\" data-ohje-kortti=\"huuhkajat-ja-kansojen-liiga\">Huuhkajat ja Kansojen liiga</a></li>\n<li>Karsintasarja: <a href=\"/studio/ohjeet/karsinnat\" data-ohje-kortti=\"karsinnat\">Lisää karsintasarja</a></li>\n</ul>\n<h2 id=\"uusi-tilastotaulukko--jos-jokin-menee-vikaan\">Jos jokin menee vikaan</h2>\n<ul>\n<li>Yläreunassa lukee &quot;Taulukko ei näy vielä millään sivulla. Täytä Osoite sivustolla…&quot;:\npaina kentän <strong>Osoite sivustolla</strong> vieressä <strong>Luo</strong> ja julkaise.</li>\n<li>Yläreunassa lukee &quot;Taulukko ei näy vielä millään sivulla. Lisää se sivun…&quot;: liitä taulukko\nsivun kenttään <strong>Taulukot</strong> tai <strong>Tilastotaulukot</strong> ja julkaise sivu.</li>\n<li>Valitsit väärän ryhmän: vaihda kenttää <strong>Kategoria</strong> välilehdellä <strong>Perustiedot</strong>.</li>\n<li>Korvasit vahingossa vanhan taulukon: palauta edellinen versio, katso\n<a href=\"/studio/ohjeet/luonnos-julkaisu-ja-peruminen\" data-ohje-kortti=\"luonnos-julkaisu-ja-peruminen\">Peru muutos</a>.</li>\n</ul>\n<p>Katso myös: <a href=\"/studio/ohjeet/tilastotaulukon-paivitys\" data-ohje-kortti=\"tilastotaulukon-paivitys\">Päivitä tilastotaulukko</a> · <a href=\"/studio/ohjeet/taulukko-tekstissa\" data-ohje-kortti=\"taulukko-tekstissa\">Taulukko tekstissä</a></p>\n",
          "teksti": "Milloin Kun tarvitset kokonaan uuden taulukon: uusi kausi, uusi veikkaus tai uusi tilasto. Olemassa olevan taulukon päivitys on omassa kortissaan. Ennen kuin aloitat Taulukko on helpointa tehdä ensin Excelissä tai Google Sheetsissä. Mieti, mihin ryhmään taulukko kuuluu. Ryhmä ratkaisee, millä sivulla se näkyy. Askeleet Valitse Jalkapalloarkisto ja sitten Tilastot . ① Valitse ryhmä, esimerkiksi Klubin omat tilastot . ② Paina listan yläreunassa plus-painiketta (+). Sen nimi on Luo uusi asiakirja . ③ Ryhmässä Muut arkiston taulukot valitse ensin taulukon kategoria. Muissa ryhmissä se on valmiina. Uusi taulukko avautuu oikealle. Keskimmäinen lista vaihtuu listaksi Kaikki tilastot . Kirjoita kenttään Otsikko taulukon nimi. Kentän Osoite sivustolla vieressä paina Luo . Valitse välilehti Tilastodata ja paina Tuo Excelistä . ⑥ Kopioi solut Excelissä (Ctrl+C) ja liitä ne ikkunaan (Ctrl+V). Jätä rasti Ensimmäinen rivi on sarakkeiden nimet , jos ylimmällä rivillä on otsikot. ⑦ Tarkista esikatselu. Paina oikeassa alakulmassa painiketta, jossa lukee esimerkiksi Korvaa taulukko (3 riviä, 4 saraketta) . Taulukko täyttyy. Sarakkeiden tyypit arvataan sisällöstä. Oikeassa alakulmassa paina Julkaise . Ryhmän Klubin omat tilastot taulukot ja pelaajatilastot näkyvät vasta, kun ne on liitetty sivuun. Lisää taulukko sivun kenttään Taulukot . Klubin toiminnassa ja pelaajalla kentän nimi on Tilastotaulukot . Julkaise sitten myös se sivu. Tulos Oikeaan alakulmaan tulee ilmoitus Dokumentti on julkaistu . Lomakkeen yläreunassa lukee Käytetty yhdellä sivulla . Avaa se nuolesta, niin näet sivun. Ryhmän Klubin omat tilastot taulukossa siinä on keltainen huomautus, kunnes liität taulukon sivuun (katso huomautus askelten lopussa). Taulukko näkyy sivustolla noin minuutin kuluttua. Lisävalinnat Sarakkeet yksi kerrallaan: paina Lisää sarake . Anna Sarakkeen nimi ja valitse kohdassa Mitä sarakkeessa on? tyyppi: Teksti , Numero , Päivämäärä , Vuosi tai Linkki . Paina Tallenna . Prosenteille ja desimaaleille valitse Teksti . Kokonaisluvuille Numero . Rivit: paina Lisää rivi ja kirjoita solut kuten Excelissä. Teksti taulukon ylle: välilehden Perustiedot kenttä Johdanto . Monta taulukkoa samalla sivulla: pienempi luku kentässä Järjestys sivulla näkyy ylempänä. Huuhkajat-taulukko: Huuhkajat ja Kansojen liiga Karsintasarja: Lisää karsintasarja Jos jokin menee vikaan Yläreunassa lukee \"Taulukko ei näy vielä millään sivulla. Täytä Osoite sivustolla…\": paina kentän Osoite sivustolla vieressä Luo ja julkaise. Yläreunassa lukee \"Taulukko ei näy vielä millään sivulla. Lisää se sivun…\": liitä taulukko sivun kenttään Taulukot tai Tilastotaulukot ja julkaise sivu. Valitsit väärän ryhmän: vaihda kenttää Kategoria välilehdellä Perustiedot . Korvasit vahingossa vanhan taulukon: palauta edellinen versio, katso Peru muutos . Katso myös: Päivitä tilastotaulukko · Taulukko tekstissä",
          "otsikot": [
            {
              "id": "uusi-tilastotaulukko--milloin",
              "teksti": "Milloin",
              "taso": 2
            },
            {
              "id": "uusi-tilastotaulukko--ennen-kuin-aloitat",
              "teksti": "Ennen kuin aloitat",
              "taso": 2
            },
            {
              "id": "uusi-tilastotaulukko--askeleet",
              "teksti": "Askeleet",
              "taso": 2
            },
            {
              "id": "uusi-tilastotaulukko--tulos",
              "teksti": "Tulos",
              "taso": 2
            },
            {
              "id": "uusi-tilastotaulukko--lisavalinnat",
              "teksti": "Lisävalinnat",
              "taso": 2
            },
            {
              "id": "uusi-tilastotaulukko--jos-jokin-menee-vikaan",
              "teksti": "Jos jokin menee vikaan",
              "taso": 2
            }
          ]
        },
        {
          "id": "huuhkajat-ja-kansojen-liiga",
          "otsikko": "Lisää Huuhkajat- tai Kansojen liiga -taulukko",
          "osio": "arkisto",
          "avainsanat": [
            "Huuhkajat",
            "maajoukkue",
            "Kansojen liiga",
            "Nations League",
            "uusi kausi",
            "lohko",
            "sarjataulukko",
            "Huuhkaja-arvostelu",
            "pelaajatilastot",
            "avauskokoonpano",
            "osio"
          ],
          "tyypit": [
            "jalkapalloTilasto"
          ],
          "kesto": "noin 10 minuuttia",
          "paivitetty": "2026-10-08",
          "html": "<h2 id=\"huuhkajat-ja-kansojen-liiga--milloin\">Milloin</h2>\n<p>Kun Huuhkajat-sivulle tarvitaan uusi taulukko, esimerkiksi uuden Kansojen liigan kauden lohko.\nHuuhkajat-sivu on jaettu aiheisiin, ja jokaisella aiheella on oma sivunsa.</p>\n<h2 id=\"huuhkajat-ja-kansojen-liiga--ennen-kuin-aloitat\">Ennen kuin aloitat</h2>\n<ul>\n<li>Kansojen liigan kaudelle tarvitaan myös saman kauden karsintasivu. Tee se ensin:\n<a href=\"/studio/ohjeet/karsinnat\" data-ohje-kortti=\"karsinnat\">Lisää karsintasarja</a>.</li>\n</ul>\n<h2 id=\"huuhkajat-ja-kansojen-liiga--askeleet\">Askeleet</h2>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/huuhkajat-ja-kansojen-liiga-01-perustiedot.webp\" aria-label=\"Suurenna kuva: Huuhkajat-taulukon perustiedot. 1: Plus-painike. 4: Osio Huuhkajat-sivulla. 5: Kauden ottelut ja tulokset. 6: Järjestys sivulla.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/huuhkajat-ja-kansojen-liiga-01-perustiedot.webp\" alt=\"Huuhkajat-taulukon perustiedot. 1: Plus-painike. 4: Osio Huuhkajat-sivulla. 5: Kauden ottelut ja tulokset. 6: Järjestys sivulla.\" width=\"973\" height=\"2260\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol>\n<li>Valitse <strong>Jalkapalloarkisto</strong> → <strong>Tilastot</strong> → <strong>Huuhkajat</strong> ja paina listan yläreunassa\nplus-painiketta (+), jonka nimi on <strong>Luo uusi asiakirja</strong>. ①\nUusi taulukko avautuu oikealle. <strong>Kategoria</strong> on valmiina.</li>\n<li>Kirjoita kenttään <strong>Otsikko</strong> taulukon nimi, esimerkiksi &quot;Kansojen liiga 2026–2027, lohko B4&quot;.</li>\n<li>Kentän <strong>Osoite sivustolla</strong> vieressä paina <strong>Luo</strong>.</li>\n<li>Kohdassa <strong>Osio Huuhkajat-sivulla</strong> valitse aihe, esimerkiksi &quot;Kansojen liiga&quot;. ④</li>\n<li>Jos valitsit Kansojen liigan, valitse kenttään <strong>Kauden ottelut ja tulokset</strong> saman kauden\nkarsintasivu. ⑤\nKirjoita nimen alkua, esimerkiksi &quot;2026&quot;, ja valitse listasta.</li>\n<li>Kirjoita kenttään <strong>Järjestys sivulla</strong> luku. Pienempi luku näkyy ylempänä. ⑥</li>\n<li>Täytä taulukko välilehdellä <strong>Tilastodata</strong>, esimerkiksi painikkeella <strong>Tuo Excelistä</strong>.</li>\n<li>Oikeassa alakulmassa paina <strong>Julkaise</strong>.</li>\n</ol>\n<h2 id=\"huuhkajat-ja-kansojen-liiga--tulos\">Tulos</h2>\n<ul>\n<li>Taulukko näkyy valitun aiheen sivulla, esimerkiksi Huuhkajat → Kansojen liiga.</li>\n<li>Kansojen liigan taulukko näkyy myös kauden karsintasivulla otteluiden yhteydessä.\nSilloin lomakkeen yläreunassa lukee &quot;Käytetty 2 sivulla&quot;.</li>\n<li>Uusi aihe ilmestyy Huuhkajat-sivulle vasta, kun siinä on julkaistu taulukko.</li>\n</ul>\n<h2 id=\"huuhkajat-ja-kansojen-liiga--lisavalinnat\">Lisävalinnat</h2>\n<ul>\n<li>Sarjataulukkoa päivitetään vain Kansojen liigan taulukkoon. Ottelut ja tulokset kirjoitetaan\nkarsintasivulle: <a href=\"/studio/ohjeet/karsinnat\" data-ohje-kortti=\"karsinnat\">Lisää karsintasarja</a>.</li>\n<li>Pisteiden ja sijojen päivitys: <a href=\"/studio/ohjeet/tilastotaulukon-paivitys\" data-ohje-kortti=\"tilastotaulukon-paivitys\">Päivitä tilastotaulukko</a></li>\n</ul>\n<h2 id=\"huuhkajat-ja-kansojen-liiga--jos-jokin-menee-vikaan\">Jos jokin menee vikaan</h2>\n<ul>\n<li><strong>Julkaise</strong> ei onnistu, ja kentässä lukee &quot;Valitse osio, jotta taulukko löytyy oikean otsikon\nalta.&quot;: valitse aihe kohdassa <strong>Osio Huuhkajat-sivulla</strong>.</li>\n<li>Keltainen &quot;Valitse kauden karsintasivu…&quot;: julkaisu onnistuu, mutta taulukko ei näy\nkarsintasivulla. Valitse karsintasivu kenttään <strong>Kauden ottelut ja tulokset</strong>.</li>\n<li>Karsintasivua ei löydy listasta: sitä ei ole vielä tehty. Katso <a href=\"/studio/ohjeet/karsinnat\" data-ohje-kortti=\"karsinnat\">Lisää karsintasarja</a>.</li>\n</ul>\n<p>Katso myös: <a href=\"/studio/ohjeet/tilastotaulukon-paivitys\" data-ohje-kortti=\"tilastotaulukon-paivitys\">Päivitä tilastotaulukko</a> · <a href=\"/studio/ohjeet/uusi-tilastotaulukko\" data-ohje-kortti=\"uusi-tilastotaulukko\">Lisää uusi tilastotaulukko</a></p>\n",
          "teksti": "Milloin Kun Huuhkajat-sivulle tarvitaan uusi taulukko, esimerkiksi uuden Kansojen liigan kauden lohko. Huuhkajat-sivu on jaettu aiheisiin, ja jokaisella aiheella on oma sivunsa. Ennen kuin aloitat Kansojen liigan kaudelle tarvitaan myös saman kauden karsintasivu. Tee se ensin: Lisää karsintasarja . Askeleet Valitse Jalkapalloarkisto → Tilastot → Huuhkajat ja paina listan yläreunassa plus-painiketta (+), jonka nimi on Luo uusi asiakirja . ① Uusi taulukko avautuu oikealle. Kategoria on valmiina. Kirjoita kenttään Otsikko taulukon nimi, esimerkiksi \"Kansojen liiga 2026–2027, lohko B4\". Kentän Osoite sivustolla vieressä paina Luo . Kohdassa Osio Huuhkajat-sivulla valitse aihe, esimerkiksi \"Kansojen liiga\". ④ Jos valitsit Kansojen liigan, valitse kenttään Kauden ottelut ja tulokset saman kauden karsintasivu. ⑤ Kirjoita nimen alkua, esimerkiksi \"2026\", ja valitse listasta. Kirjoita kenttään Järjestys sivulla luku. Pienempi luku näkyy ylempänä. ⑥ Täytä taulukko välilehdellä Tilastodata , esimerkiksi painikkeella Tuo Excelistä . Oikeassa alakulmassa paina Julkaise . Tulos Taulukko näkyy valitun aiheen sivulla, esimerkiksi Huuhkajat → Kansojen liiga. Kansojen liigan taulukko näkyy myös kauden karsintasivulla otteluiden yhteydessä. Silloin lomakkeen yläreunassa lukee \"Käytetty 2 sivulla\". Uusi aihe ilmestyy Huuhkajat-sivulle vasta, kun siinä on julkaistu taulukko. Lisävalinnat Sarjataulukkoa päivitetään vain Kansojen liigan taulukkoon. Ottelut ja tulokset kirjoitetaan karsintasivulle: Lisää karsintasarja . Pisteiden ja sijojen päivitys: Päivitä tilastotaulukko Jos jokin menee vikaan Julkaise ei onnistu, ja kentässä lukee \"Valitse osio, jotta taulukko löytyy oikean otsikon alta.\": valitse aihe kohdassa Osio Huuhkajat-sivulla . Keltainen \"Valitse kauden karsintasivu…\": julkaisu onnistuu, mutta taulukko ei näy karsintasivulla. Valitse karsintasivu kenttään Kauden ottelut ja tulokset . Karsintasivua ei löydy listasta: sitä ei ole vielä tehty. Katso Lisää karsintasarja . Katso myös: Päivitä tilastotaulukko · Lisää uusi tilastotaulukko",
          "otsikot": [
            {
              "id": "huuhkajat-ja-kansojen-liiga--milloin",
              "teksti": "Milloin",
              "taso": 2
            },
            {
              "id": "huuhkajat-ja-kansojen-liiga--ennen-kuin-aloitat",
              "teksti": "Ennen kuin aloitat",
              "taso": 2
            },
            {
              "id": "huuhkajat-ja-kansojen-liiga--askeleet",
              "teksti": "Askeleet",
              "taso": 2
            },
            {
              "id": "huuhkajat-ja-kansojen-liiga--tulos",
              "teksti": "Tulos",
              "taso": 2
            },
            {
              "id": "huuhkajat-ja-kansojen-liiga--lisavalinnat",
              "teksti": "Lisävalinnat",
              "taso": 2
            },
            {
              "id": "huuhkajat-ja-kansojen-liiga--jos-jokin-menee-vikaan",
              "teksti": "Jos jokin menee vikaan",
              "taso": 2
            }
          ]
        },
        {
          "id": "karsinnat",
          "otsikko": "Lisää karsintasarja ja päivitä sen ottelut",
          "osio": "arkisto",
          "avainsanat": [
            "karsinta",
            "karsinnat",
            "EM-karsinta",
            "MM-karsinta",
            "karsintasivu",
            "ottelut",
            "tulokset",
            "otteluraportti",
            "kokoonpano",
            "maaottelu",
            "kausi"
          ],
          "tyypit": [
            "jalkapalloTilasto"
          ],
          "kesto": "noin 10 minuuttia",
          "paivitetty": "2026-10-08",
          "html": "<h2 id=\"karsinnat--milloin\">Milloin</h2>\n<p>Uuden kauden alussa teet karsintasarjalle oman sivun. Ottelujen jälkeen päivität sen\ntulokset ja otteluraportit. Karsintasivut näkyvät Huuhkajat-sivun alaosassa uusin ensin.</p>\n<h2 id=\"karsinnat--ennen-kuin-aloitat\">Ennen kuin aloitat</h2>\n<ul>\n<li>Jos karsintasivu on jo olemassa ja vain päivität tuloksia, siirry suoraan askeleeseen 6.</li>\n</ul>\n<h2 id=\"karsinnat--askeleet\">Askeleet</h2>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/karsinnat-01-lista.webp\" aria-label=\"Suurenna kuva: Karsintasivujen lista. 1: Karsinnat. 2: Plus-painike listan yläreunassa.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/karsinnat-01-lista.webp\" alt=\"Karsintasivujen lista. 1: Karsinnat. 2: Plus-painike listan yläreunassa.\" width=\"1600\" height=\"800\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol>\n<li>Valitse <strong>Jalkapalloarkisto</strong> → <strong>Tilastot</strong> → <strong>Karsinnat</strong>. ①</li>\n<li>Paina listan yläreunassa plus-painiketta (+), jonka nimi on <strong>Luo uusi asiakirja</strong>. ②\nUusi sivu avautuu oikealle. <strong>Kategoria</strong> on valmiina.</li>\n<li>Kirjoita kenttään <strong>Otsikko</strong> sivun nimi, esimerkiksi &quot;Suomen ottelut 2026–2027 ja EM 2028 -karsinta&quot;.</li>\n<li>Kentän <strong>Osoite sivustolla</strong> vieressä paina <strong>Luo</strong>.</li>\n<li>Kirjoita halutessasi lyhyt esittely kenttään <strong>Johdanto</strong>.</li>\n<li>Välilehdellä <strong>Tilastodata</strong> kirjoita taulukkoon kauden ottelut ja tulokset.\nTaulukon käyttö: <a href=\"/studio/ohjeet/tilastotaulukon-paivitys\" data-ohje-kortti=\"tilastotaulukon-paivitys\">Päivitä tilastotaulukko</a>.</li>\n<li>Kirjoita otteluraportit ja kokoonpanot kenttään <strong>Lisätiedot taulukon jälkeen</strong>.</li>\n<li>Kun kaikki illan muutokset on tehty, paina oikeassa alakulmassa <strong>Julkaise</strong>.</li>\n</ol>\n<div class=\"markdown-alert markdown-alert-tip\">\n<p class=\"markdown-alert-title\">Vinkki</p>\n<p>Otteluiltana kirjoita tulos, raportti ja kokoonpano kaikki ensin valmiiksi. Muutokset\ntallentuvat itsestään. Paina <strong>Julkaise</strong> vasta lopuksi, yhden kerran.</p>\n</div>\n<h2 id=\"karsinnat--tulos\">Tulos</h2>\n<ul>\n<li>Sivu näkyy osoitteessa www.lahdensuomalainenklubi.com/jalkapalloarkisto/karsinnat/… ja\nHuuhkajat-sivun karsintalistassa.</li>\n<li>Lomakkeen yläreunan <strong>Käytetty yhdellä sivulla</strong> avaa sivun.</li>\n</ul>\n<h2 id=\"karsinnat--lisavalinnat\">Lisävalinnat</h2>\n<ul>\n<li>Saman kauden Kansojen liigan sarjataulukko näkyy tällä sivulla, kun se on liitetty:\n<a href=\"/studio/ohjeet/huuhkajat-ja-kansojen-liiga\" data-ohje-kortti=\"huuhkajat-ja-kansojen-liiga\">Huuhkajat ja Kansojen liiga</a></li>\n<li>Kokoonpano kenttäkuvana: <a href=\"/studio/ohjeet/kokoonpano-pelikentalle\" data-ohje-kortti=\"kokoonpano-pelikentalle\">Piirrä kokoonpano pelikentälle</a></li>\n<li>Linkki tekstiin: <a href=\"/studio/ohjeet/linkit\" data-ohje-kortti=\"linkit\">Linkit</a></li>\n</ul>\n<h2 id=\"karsinnat--jos-jokin-menee-vikaan\">Jos jokin menee vikaan</h2>\n<ul>\n<li>Linkki tai kappale katosi Lisätiedoista: paina heti Ctrl+Z. Myöhemmin palautat edellisen\nversion versiohistoriasta: <a href=\"/studio/ohjeet/luonnos-julkaisu-ja-peruminen\" data-ohje-kortti=\"luonnos-julkaisu-ja-peruminen\">Peru muutos</a>.</li>\n<li>Sivu ei näy Huuhkajat-sivulla: tarkista, että painoit <strong>Julkaise</strong> ja että\n<strong>Osoite sivustolla</strong> on täytetty.</li>\n</ul>\n<p>Katso myös: <a href=\"/studio/ohjeet/tilastotaulukon-paivitys\" data-ohje-kortti=\"tilastotaulukon-paivitys\">Päivitä tilastotaulukko</a> · <a href=\"/studio/ohjeet/huuhkajat-ja-kansojen-liiga\" data-ohje-kortti=\"huuhkajat-ja-kansojen-liiga\">Huuhkajat ja Kansojen liiga</a></p>\n",
          "teksti": "Milloin Uuden kauden alussa teet karsintasarjalle oman sivun. Ottelujen jälkeen päivität sen tulokset ja otteluraportit. Karsintasivut näkyvät Huuhkajat-sivun alaosassa uusin ensin. Ennen kuin aloitat Jos karsintasivu on jo olemassa ja vain päivität tuloksia, siirry suoraan askeleeseen 6. Askeleet Valitse Jalkapalloarkisto → Tilastot → Karsinnat . ① Paina listan yläreunassa plus-painiketta (+), jonka nimi on Luo uusi asiakirja . ② Uusi sivu avautuu oikealle. Kategoria on valmiina. Kirjoita kenttään Otsikko sivun nimi, esimerkiksi \"Suomen ottelut 2026–2027 ja EM 2028 -karsinta\". Kentän Osoite sivustolla vieressä paina Luo . Kirjoita halutessasi lyhyt esittely kenttään Johdanto . Välilehdellä Tilastodata kirjoita taulukkoon kauden ottelut ja tulokset. Taulukon käyttö: Päivitä tilastotaulukko . Kirjoita otteluraportit ja kokoonpanot kenttään Lisätiedot taulukon jälkeen . Kun kaikki illan muutokset on tehty, paina oikeassa alakulmassa Julkaise . Otteluiltana kirjoita tulos, raportti ja kokoonpano kaikki ensin valmiiksi. Muutokset tallentuvat itsestään. Paina Julkaise vasta lopuksi, yhden kerran. Tulos Sivu näkyy osoitteessa www.lahdensuomalainenklubi.com/jalkapalloarkisto/karsinnat/… ja Huuhkajat-sivun karsintalistassa. Lomakkeen yläreunan Käytetty yhdellä sivulla avaa sivun. Lisävalinnat Saman kauden Kansojen liigan sarjataulukko näkyy tällä sivulla, kun se on liitetty: Huuhkajat ja Kansojen liiga Kokoonpano kenttäkuvana: Piirrä kokoonpano pelikentälle Linkki tekstiin: Linkit Jos jokin menee vikaan Linkki tai kappale katosi Lisätiedoista: paina heti Ctrl+Z. Myöhemmin palautat edellisen version versiohistoriasta: Peru muutos . Sivu ei näy Huuhkajat-sivulla: tarkista, että painoit Julkaise ja että Osoite sivustolla on täytetty. Katso myös: Päivitä tilastotaulukko · Huuhkajat ja Kansojen liiga",
          "otsikot": [
            {
              "id": "karsinnat--milloin",
              "teksti": "Milloin",
              "taso": 2
            },
            {
              "id": "karsinnat--ennen-kuin-aloitat",
              "teksti": "Ennen kuin aloitat",
              "taso": 2
            },
            {
              "id": "karsinnat--askeleet",
              "teksti": "Askeleet",
              "taso": 2
            },
            {
              "id": "karsinnat--tulos",
              "teksti": "Tulos",
              "taso": 2
            },
            {
              "id": "karsinnat--lisavalinnat",
              "teksti": "Lisävalinnat",
              "taso": 2
            },
            {
              "id": "karsinnat--jos-jokin-menee-vikaan",
              "teksti": "Jos jokin menee vikaan",
              "taso": 2
            }
          ]
        },
        {
          "id": "kokoonpano-pelikentalle",
          "otsikko": "Piirrä kokoonpano pelikentälle",
          "osio": "arkisto",
          "avainsanat": [
            "kokoonpano",
            "avauskokoonpano",
            "pelikenttä",
            "kenttäkuva",
            "muodostelma",
            "4-4-2",
            "ketju",
            "Huuhkaja-arvostelu",
            "pelaajat"
          ],
          "tyypit": [
            "jalkapalloTilasto"
          ],
          "kesto": "noin 10 minuuttia",
          "paivitetty": "2026-10-08",
          "html": "<h2 id=\"kokoonpano-pelikentalle--milloin\">Milloin</h2>\n<p>Kun haluat näyttää avauskokoonpanon kenttäkuvana, esimerkiksi Huuhkaja-arvostelun parhaan\navauksen. Sivulla pelaajat piirretään pelikentälle riveittäin.</p>\n<h2 id=\"kokoonpano-pelikentalle--askeleet\">Askeleet</h2>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/kokoonpano-pelikentalle-01-lohko.webp\" aria-label=\"Suurenna kuva: Kokoonpanon lisäys. 2: Lisätiedot-kenttä. 3: Kokoonpano pelikentällä kolmen pisteen valikossa.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/kokoonpano-pelikentalle-01-lohko.webp\" alt=\"Kokoonpanon lisäys. 2: Lisätiedot-kenttä. 3: Kokoonpano pelikentällä kolmen pisteen valikossa.\" width=\"803\" height=\"750\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol>\n<li>Avaa taulukko ja välilehti <strong>Tilastodata</strong>. Katso tarvittaessa\n<a href=\"/studio/ohjeet/tilastotaulukon-paivitys\" data-ohje-kortti=\"tilastotaulukon-paivitys\">Päivitä tilastotaulukko</a>.</li>\n<li>Napsauta kentässä <strong>Lisätiedot taulukon jälkeen</strong> kohtaa, johon kokoonpano tulee. ②</li>\n<li>Tekstikentän työkalupalkin oikeassa reunassa paina kolmea pistettä (⋯) ja valitse\n<strong>Kokoonpano pelikentällä</strong>. ③\nLeveällä näytöllä painike näkyy suoraan työkalupalkissa. Ikkuna <strong>Kokoonpano</strong> avautuu.</li>\n</ol>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/kokoonpano-pelikentalle-02-ikkuna.webp\" aria-label=\"Suurenna kuva: Kokoonpanon ikkuna. 4: Otsikko. 5: Rivit hyökkäyksestä maalivahtiin.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/kokoonpano-pelikentalle-02-ikkuna.webp\" alt=\"Kokoonpanon ikkuna. 4: Otsikko. 5: Rivit hyökkäyksestä maalivahtiin.\" width=\"803\" height=\"659\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol start=\"4\">\n<li>Kirjoita kenttään <strong>Otsikko</strong> esimerkiksi &quot;Huuhkajat avauskokoonpano 2005–2025 (91 ottelua)&quot;. ④</li>\n<li>Kohdassa <strong>Rivit hyökkäyksestä maalivahtiin</strong> paina <strong>Lisää kohde</strong>. ⑤\nRivin ikkuna avautuu. Ensimmäinen rivi on hyökkäys, viimeinen maalivahti.</li>\n<li>Kohdassa <strong>Pelaajat</strong> paina <strong>Lisää kohde</strong>. Kirjoita pelaajan <strong>Nimi</strong> ja\n<strong>Luku (valinnainen)</strong>. Luku näkyy pelaajan pallossa.</li>\n<li>Palaa rivin ikkunaan: paina ikkunan yläreunan polusta <strong>Pelaajat</strong>. Lisää rivin\nseuraava pelaaja samoin. Lisää pelaajat vasemmalta oikealle.</li>\n<li>Kun rivi on valmis, paina yläreunan polusta kokoonpanon otsikkoa. Lisää seuraava rivi\ntoistamalla askeleet 5–7.</li>\n<li>Kirjoita halutessasi <strong>Selite (valinnainen)</strong>. Sulje ikkuna oikean yläkulman ruksista\nja paina oikeassa alakulmassa <strong>Julkaise</strong>.</li>\n</ol>\n<div class=\"markdown-alert markdown-alert-note\">\n<p class=\"markdown-alert-title\">Hyvä tietää</p>\n<p>Ruksi sulkee kaikki ikkunat kerralla. Mitään ei katoa: jatka kohdasta &quot;Muokkaa olemassa\nolevaa&quot; alla.</p>\n</div>\n<h2 id=\"kokoonpano-pelikentalle--tulos\">Tulos</h2>\n<ul>\n<li>Sivulla näkyy pelikenttä, jolla pelaajat ovat riveittäin ylhäältä alas.</li>\n<li>Studion tekstissä kokoonpano näkyy laatikkona. Siinä lukee rivien pelaajamäärät\nhyökkäyksestä alkaen, esimerkiksi &quot;2-4-4-1 (11 pelaajaa)&quot;.</li>\n</ul>\n<h2 id=\"kokoonpano-pelikentalle--lisavalinnat\">Lisävalinnat</h2>\n<ul>\n<li>Muokkaa olemassa olevaa: paina tekstissä kokoonpanon laatikon oikeasta reunasta ⋯ ja valitse\n<strong>Muokkaa</strong>. Avaa rivi napsauttamalla sitä.</li>\n<li>Järjestä pelaajia: raahaa pelaajaa rivin sisällä.</li>\n</ul>\n<h2 id=\"kokoonpano-pelikentalle--jos-jokin-menee-vikaan\">Jos jokin menee vikaan</h2>\n<ul>\n<li>Keltainen &quot;Kentällä on 10 pelaajaa (yleensä 11).&quot;: tarkista pelaajat. Julkaisu onnistuu silti.</li>\n<li>Punainen &quot;Rivillä pitää olla 1–6 pelaajaa.&quot;: rivi on tyhjä tai siinä on liikaa pelaajia.</li>\n<li>Punainen &quot;Kokoonpanossa pitää olla 1–6 riviä.&quot;: poista ylimääräinen rivi tai lisää puuttuva.</li>\n</ul>\n<p>Katso myös: <a href=\"/studio/ohjeet/tilastotaulukon-paivitys\" data-ohje-kortti=\"tilastotaulukon-paivitys\">Päivitä tilastotaulukko</a> · <a href=\"/studio/ohjeet/karsinnat\" data-ohje-kortti=\"karsinnat\">Lisää karsintasarja</a></p>\n",
          "teksti": "Milloin Kun haluat näyttää avauskokoonpanon kenttäkuvana, esimerkiksi Huuhkaja-arvostelun parhaan avauksen. Sivulla pelaajat piirretään pelikentälle riveittäin. Askeleet Avaa taulukko ja välilehti Tilastodata . Katso tarvittaessa Päivitä tilastotaulukko . Napsauta kentässä Lisätiedot taulukon jälkeen kohtaa, johon kokoonpano tulee. ② Tekstikentän työkalupalkin oikeassa reunassa paina kolmea pistettä (⋯) ja valitse Kokoonpano pelikentällä . ③ Leveällä näytöllä painike näkyy suoraan työkalupalkissa. Ikkuna Kokoonpano avautuu. Kirjoita kenttään Otsikko esimerkiksi \"Huuhkajat avauskokoonpano 2005–2025 (91 ottelua)\". ④ Kohdassa Rivit hyökkäyksestä maalivahtiin paina Lisää kohde . ⑤ Rivin ikkuna avautuu. Ensimmäinen rivi on hyökkäys, viimeinen maalivahti. Kohdassa Pelaajat paina Lisää kohde . Kirjoita pelaajan Nimi ja Luku (valinnainen) . Luku näkyy pelaajan pallossa. Palaa rivin ikkunaan: paina ikkunan yläreunan polusta Pelaajat . Lisää rivin seuraava pelaaja samoin. Lisää pelaajat vasemmalta oikealle. Kun rivi on valmis, paina yläreunan polusta kokoonpanon otsikkoa. Lisää seuraava rivi toistamalla askeleet 5–7. Kirjoita halutessasi Selite (valinnainen) . Sulje ikkuna oikean yläkulman ruksista ja paina oikeassa alakulmassa Julkaise . Ruksi sulkee kaikki ikkunat kerralla. Mitään ei katoa: jatka kohdasta \"Muokkaa olemassa olevaa\" alla. Tulos Sivulla näkyy pelikenttä, jolla pelaajat ovat riveittäin ylhäältä alas. Studion tekstissä kokoonpano näkyy laatikkona. Siinä lukee rivien pelaajamäärät hyökkäyksestä alkaen, esimerkiksi \"2-4-4-1 (11 pelaajaa)\". Lisävalinnat Muokkaa olemassa olevaa: paina tekstissä kokoonpanon laatikon oikeasta reunasta ⋯ ja valitse Muokkaa . Avaa rivi napsauttamalla sitä. Järjestä pelaajia: raahaa pelaajaa rivin sisällä. Jos jokin menee vikaan Keltainen \"Kentällä on 10 pelaajaa (yleensä 11).\": tarkista pelaajat. Julkaisu onnistuu silti. Punainen \"Rivillä pitää olla 1–6 pelaajaa.\": rivi on tyhjä tai siinä on liikaa pelaajia. Punainen \"Kokoonpanossa pitää olla 1–6 riviä.\": poista ylimääräinen rivi tai lisää puuttuva. Katso myös: Päivitä tilastotaulukko · Lisää karsintasarja",
          "otsikot": [
            {
              "id": "kokoonpano-pelikentalle--milloin",
              "teksti": "Milloin",
              "taso": 2
            },
            {
              "id": "kokoonpano-pelikentalle--askeleet",
              "teksti": "Askeleet",
              "taso": 2
            },
            {
              "id": "kokoonpano-pelikentalle--tulos",
              "teksti": "Tulos",
              "taso": 2
            },
            {
              "id": "kokoonpano-pelikentalle--lisavalinnat",
              "teksti": "Lisävalinnat",
              "taso": 2
            },
            {
              "id": "kokoonpano-pelikentalle--jos-jokin-menee-vikaan",
              "teksti": "Jos jokin menee vikaan",
              "taso": 2
            }
          ]
        },
        {
          "id": "uusi-arvokisa",
          "otsikko": "Lisää uusi arvokisa",
          "osio": "arkisto",
          "avainsanat": [
            "arvokisa",
            "arvokisat",
            "MM-kisat",
            "EM-kisat",
            "olympialaiset",
            "turnaus",
            "mitalit",
            "voittaja",
            "uusi kisa",
            "lohkot"
          ],
          "tyypit": [
            "arvokisa"
          ],
          "kesto": "noin 15 minuuttia",
          "paivitetty": "2026-10-08",
          "html": "<h2 id=\"uusi-arvokisa--milloin\">Milloin</h2>\n<p>Kun alkaa uusi MM- tai EM-turnaus tai muu arvokisa, esimerkiksi EM 2028.\nKisa saa oman sivunsa arkiston arvokisoihin.</p>\n<h2 id=\"uusi-arvokisa--ennen-kuin-aloitat\">Ennen kuin aloitat</h2>\n<ul>\n<li>Lohkojen taulukot tehdään erikseen ryhmään <strong>Arvokisat</strong>:\n<a href=\"/studio/ohjeet/uusi-tilastotaulukko\" data-ohje-kortti=\"uusi-tilastotaulukko\">Lisää uusi tilastotaulukko</a>. Ne voi liittää kisaan myöhemmin.</li>\n</ul>\n<h2 id=\"uusi-arvokisa--askeleet\">Askeleet</h2>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/uusi-arvokisa-01-lomake.webp\" aria-label=\"Suurenna kuva: Uusi arvokisa. 1: Arvokisat. 3: Kisan nimi. 5: Kisatyyppi ja Vuosi. 7: Välilehti Tulokset.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/uusi-arvokisa-01-lomake.webp\" alt=\"Uusi arvokisa. 1: Arvokisat. 3: Kisan nimi. 5: Kisatyyppi ja Vuosi. 7: Välilehti Tulokset.\" width=\"1600\" height=\"1261\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol>\n<li>Valitse <strong>Jalkapalloarkisto</strong> ja sitten <strong>Arvokisat</strong>. ①</li>\n<li>Paina listan yläreunassa plus-painiketta (+).</li>\n<li>Kirjoita kenttään <strong>Kisan nimi</strong> esimerkiksi &quot;EM-kisat 2028&quot;. ③</li>\n<li>Kentän <strong>Osoite sivustolla</strong> vieressä paina <strong>Luo</strong>.</li>\n<li>Valitse <strong>Kisatyyppi</strong> ja kirjoita <strong>Vuosi</strong>. ⑤</li>\n<li>Täytä halutessasi <strong>Isäntämaa(t)</strong>, <strong>Alkupäivä</strong>, <strong>Loppupäivä</strong> ja <strong>Kuvaus</strong>.\nIsäntämaat kirjoitetaan yksi kerrallaan: kirjoita nimi ja paina Enter.</li>\n<li>Kun kisa on pelattu, valitse välilehti <strong>Tulokset</strong>. ⑦\nTäytä <strong>Voittaja</strong>, <strong>Hopea</strong>, <strong>Pronssi</strong> ja <strong>Suomen sijoitus</strong>.</li>\n<li>Liitä lohkotaulukot kenttään <strong>Tilastotaulukot</strong>: paina <strong>Lisää kohde</strong> ja valitse taulukko.</li>\n<li>Oikeassa alakulmassa paina <strong>Julkaise</strong>.</li>\n</ol>\n<h2 id=\"uusi-arvokisa--tulos\">Tulos</h2>\n<ul>\n<li>Kisa näkyy sivustolla arvokisojen listassa ja omalla sivullaan.</li>\n<li>Lomakkeen yläreunan <strong>Käytetty yhdellä sivulla</strong> avaa sivun.</li>\n</ul>\n<h2 id=\"uusi-arvokisa--lisavalinnat\">Lisävalinnat</h2>\n<ul>\n<li>Kuvat kisaan: välilehden <strong>Perustiedot</strong> kenttä <strong>Kuvat</strong>. Katso <a href=\"/studio/ohjeet/kuva\" data-ohje-kortti=\"kuva\">Kuva</a>.</li>\n<li>Tuloksia voi täydentää myöhemmin. Muista julkaista jokaisen muutoksen jälkeen.</li>\n</ul>\n<h2 id=\"uusi-arvokisa--jos-jokin-menee-vikaan\">Jos jokin menee vikaan</h2>\n<ul>\n<li>Punainen &quot;Loppupäivä ei voi olla ennen alkupäivää.&quot;: tarkista päivämäärät.</li>\n<li><strong>Julkaise</strong> ei onnistu: <strong>Kisan nimi</strong>, <strong>Osoite sivustolla</strong>, <strong>Kisatyyppi</strong> ja <strong>Vuosi</strong>\novat pakollisia.</li>\n</ul>\n<p>Katso myös: <a href=\"/studio/ohjeet/uusi-tilastotaulukko\" data-ohje-kortti=\"uusi-tilastotaulukko\">Lisää uusi tilastotaulukko</a> · <a href=\"/studio/ohjeet/tilastotaulukon-paivitys\" data-ohje-kortti=\"tilastotaulukon-paivitys\">Päivitä tilastotaulukko</a></p>\n",
          "teksti": "Milloin Kun alkaa uusi MM- tai EM-turnaus tai muu arvokisa, esimerkiksi EM 2028. Kisa saa oman sivunsa arkiston arvokisoihin. Ennen kuin aloitat Lohkojen taulukot tehdään erikseen ryhmään Arvokisat : Lisää uusi tilastotaulukko . Ne voi liittää kisaan myöhemmin. Askeleet Valitse Jalkapalloarkisto ja sitten Arvokisat . ① Paina listan yläreunassa plus-painiketta (+). Kirjoita kenttään Kisan nimi esimerkiksi \"EM-kisat 2028\". ③ Kentän Osoite sivustolla vieressä paina Luo . Valitse Kisatyyppi ja kirjoita Vuosi . ⑤ Täytä halutessasi Isäntämaa(t) , Alkupäivä , Loppupäivä ja Kuvaus . Isäntämaat kirjoitetaan yksi kerrallaan: kirjoita nimi ja paina Enter. Kun kisa on pelattu, valitse välilehti Tulokset . ⑦ Täytä Voittaja , Hopea , Pronssi ja Suomen sijoitus . Liitä lohkotaulukot kenttään Tilastotaulukot : paina Lisää kohde ja valitse taulukko. Oikeassa alakulmassa paina Julkaise . Tulos Kisa näkyy sivustolla arvokisojen listassa ja omalla sivullaan. Lomakkeen yläreunan Käytetty yhdellä sivulla avaa sivun. Lisävalinnat Kuvat kisaan: välilehden Perustiedot kenttä Kuvat . Katso Kuva . Tuloksia voi täydentää myöhemmin. Muista julkaista jokaisen muutoksen jälkeen. Jos jokin menee vikaan Punainen \"Loppupäivä ei voi olla ennen alkupäivää.\": tarkista päivämäärät. Julkaise ei onnistu: Kisan nimi , Osoite sivustolla , Kisatyyppi ja Vuosi ovat pakollisia. Katso myös: Lisää uusi tilastotaulukko · Päivitä tilastotaulukko",
          "otsikot": [
            {
              "id": "uusi-arvokisa--milloin",
              "teksti": "Milloin",
              "taso": 2
            },
            {
              "id": "uusi-arvokisa--ennen-kuin-aloitat",
              "teksti": "Ennen kuin aloitat",
              "taso": 2
            },
            {
              "id": "uusi-arvokisa--askeleet",
              "teksti": "Askeleet",
              "taso": 2
            },
            {
              "id": "uusi-arvokisa--tulos",
              "teksti": "Tulos",
              "taso": 2
            },
            {
              "id": "uusi-arvokisa--lisavalinnat",
              "teksti": "Lisävalinnat",
              "taso": 2
            },
            {
              "id": "uusi-arvokisa--jos-jokin-menee-vikaan",
              "teksti": "Jos jokin menee vikaan",
              "taso": 2
            }
          ]
        },
        {
          "id": "pelaaja",
          "otsikko": "Lisää tai päivitä pelaaja",
          "osio": "arkisto",
          "avainsanat": [
            "pelaaja",
            "pelaajat",
            "pelaajaprofiili",
            "ura",
            "seurat",
            "saavutukset",
            "palkinnot",
            "maaottelut",
            "maalit",
            "pelaajasivu"
          ],
          "tyypit": [
            "pelaaja"
          ],
          "kesto": "noin 15 minuuttia",
          "paivitetty": "2026-10-08",
          "html": "<h2 id=\"pelaaja--milloin\">Milloin</h2>\n<p>Kun arkistoon tulee uusi pelaaja tai pelaajan tiedot muuttuvat, esimerkiksi maaottelujen määrä.\nPelaajalla on oma sivunsa arkiston pelaajissa.</p>\n<h2 id=\"pelaaja--askeleet\">Askeleet</h2>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/pelaaja-01-lomake.webp\" aria-label=\"Suurenna kuva: Pelaajan lomake. 1: Pelaajat. 3: Nimi. 6: Välilehti Ura.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/pelaaja-01-lomake.webp\" alt=\"Pelaajan lomake. 1: Pelaajat. 3: Nimi. 6: Välilehti Ura.\" width=\"1600\" height=\"800\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol>\n<li>Valitse <strong>Jalkapalloarkisto</strong> ja sitten <strong>Pelaajat</strong>. ①</li>\n<li>Valitse pelaaja listasta. Uutta varten paina listan yläreunassa plus-painiketta (+).</li>\n<li>Kirjoita <strong>Nimi</strong>. ③ Uudelle pelaajalle paina kentän <strong>Osoite sivustolla</strong> vieressä <strong>Luo</strong>.</li>\n<li>Täytä välilehdellä <strong>Perustiedot</strong> tarvittavat kentät: <strong>Syntymäaika</strong>, <strong>Syntymäpaikka</strong>,\n<strong>Pituus (cm)</strong>, <strong>Pelipaikka</strong> ja <strong>Esittely</strong>.</li>\n<li>Lisää kuva kenttään <strong>Kuvat</strong>. Ensimmäinen kuva on pelaajan pääkuva.</li>\n<li>Valitse välilehti <strong>Ura</strong>. ⑥ Päivitä <strong>Maaottelut</strong> ja <strong>Maalit maajoukkueessa</strong>.</li>\n<li>Lisää seura kohdassa <strong>Seurat</strong>: paina <strong>Lisää kohde</strong> ja täytä <strong>Seura</strong>, <strong>Alkuvuosi</strong> ja <strong>Loppuvuosi</strong>.</li>\n<li>Lisää saavutus kohdassa <strong>Saavutukset ja palkinnot</strong>: valitse <strong>Ryhmä</strong> ja kirjoita\n<strong>Saavutus</strong> ja <strong>Vuodet</strong>.</li>\n<li>Oikeassa alakulmassa paina <strong>Julkaise</strong>.</li>\n</ol>\n<h2 id=\"pelaaja--tulos\">Tulos</h2>\n<ul>\n<li>Pelaajasivu päivittyy sivustolla noin minuutissa.</li>\n<li>Lomakkeen yläreunan <strong>Käytetty yhdellä sivulla</strong> avaa sivun.</li>\n</ul>\n<h2 id=\"pelaaja--lisavalinnat\">Lisävalinnat</h2>\n<ul>\n<li>Pelaajan uutiset sivulle: kirjoita kenttään <strong>Uutisten tunniste</strong> uutisten tunniste,\nesimerkiksi litmanen. Katso <a href=\"/studio/ohjeet/kategoriat-ja-tunnisteet\" data-ohje-kortti=\"kategoriat-ja-tunnisteet\">Kategoriat ja tunnisteet</a>.</li>\n<li>Pelaajan taulukot: välilehden <strong>Ura</strong> kenttä <strong>Tilastotaulukot</strong>.</li>\n<li>Järjestys: seuroja ja saavutuksia voi järjestää raahaamalla.</li>\n<li>Jari Litmasen osio: <a href=\"/studio/ohjeet/litmanen\" data-ohje-kortti=\"litmanen\">Litmanen</a></li>\n</ul>\n<h2 id=\"pelaaja--jos-jokin-menee-vikaan\">Jos jokin menee vikaan</h2>\n<ul>\n<li>Punainen virhe kentässä <strong>Pituus (cm)</strong>: kirjoita pituus senttimetreinä, esimerkiksi 182.</li>\n<li><strong>Osoite sivustolla</strong> on harmaa eikä muutu: Litmasen osoite on lukittu tarkoituksella.</li>\n</ul>\n<p>Katso myös: <a href=\"/studio/ohjeet/kuva\" data-ohje-kortti=\"kuva\">Kuva</a> · <a href=\"/studio/ohjeet/uusi-tilastotaulukko\" data-ohje-kortti=\"uusi-tilastotaulukko\">Lisää uusi tilastotaulukko</a></p>\n",
          "teksti": "Milloin Kun arkistoon tulee uusi pelaaja tai pelaajan tiedot muuttuvat, esimerkiksi maaottelujen määrä. Pelaajalla on oma sivunsa arkiston pelaajissa. Askeleet Valitse Jalkapalloarkisto ja sitten Pelaajat . ① Valitse pelaaja listasta. Uutta varten paina listan yläreunassa plus-painiketta (+). Kirjoita Nimi . ③ Uudelle pelaajalle paina kentän Osoite sivustolla vieressä Luo . Täytä välilehdellä Perustiedot tarvittavat kentät: Syntymäaika , Syntymäpaikka , Pituus (cm) , Pelipaikka ja Esittely . Lisää kuva kenttään Kuvat . Ensimmäinen kuva on pelaajan pääkuva. Valitse välilehti Ura . ⑥ Päivitä Maaottelut ja Maalit maajoukkueessa . Lisää seura kohdassa Seurat : paina Lisää kohde ja täytä Seura , Alkuvuosi ja Loppuvuosi . Lisää saavutus kohdassa Saavutukset ja palkinnot : valitse Ryhmä ja kirjoita Saavutus ja Vuodet . Oikeassa alakulmassa paina Julkaise . Tulos Pelaajasivu päivittyy sivustolla noin minuutissa. Lomakkeen yläreunan Käytetty yhdellä sivulla avaa sivun. Lisävalinnat Pelaajan uutiset sivulle: kirjoita kenttään Uutisten tunniste uutisten tunniste, esimerkiksi litmanen. Katso Kategoriat ja tunnisteet . Pelaajan taulukot: välilehden Ura kenttä Tilastotaulukot . Järjestys: seuroja ja saavutuksia voi järjestää raahaamalla. Jari Litmasen osio: Litmanen Jos jokin menee vikaan Punainen virhe kentässä Pituus (cm) : kirjoita pituus senttimetreinä, esimerkiksi 182. Osoite sivustolla on harmaa eikä muutu: Litmasen osoite on lukittu tarkoituksella. Katso myös: Kuva · Lisää uusi tilastotaulukko",
          "otsikot": [
            {
              "id": "pelaaja--milloin",
              "teksti": "Milloin",
              "taso": 2
            },
            {
              "id": "pelaaja--askeleet",
              "teksti": "Askeleet",
              "taso": 2
            },
            {
              "id": "pelaaja--tulos",
              "teksti": "Tulos",
              "taso": 2
            },
            {
              "id": "pelaaja--lisavalinnat",
              "teksti": "Lisävalinnat",
              "taso": 2
            },
            {
              "id": "pelaaja--jos-jokin-menee-vikaan",
              "teksti": "Jos jokin menee vikaan",
              "taso": 2
            }
          ]
        },
        {
          "id": "stadion",
          "otsikko": "Lisää stadion",
          "osio": "arkisto",
          "avainsanat": [
            "stadion",
            "stadionit",
            "kenttä",
            "areena",
            "kapasiteetti",
            "katsomo",
            "karttapaikka"
          ],
          "tyypit": [
            "stadion"
          ],
          "kesto": "noin 10 minuuttia",
          "paivitetty": "2026-10-08",
          "html": "<h2 id=\"stadion--milloin\">Milloin</h2>\n<p>Kun arkistoon tulee uusi stadion, esimerkiksi klubin matkan kohde. Stadionilla on oma sivunsa.</p>\n<h2 id=\"stadion--askeleet\">Askeleet</h2>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/stadion-01-lomake.webp\" aria-label=\"Suurenna kuva: Uusi stadion. 1: Stadionit. 3: Nimi. 5: Kaupunki.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/stadion-01-lomake.webp\" alt=\"Uusi stadion. 1: Stadionit. 3: Nimi. 5: Kaupunki.\" width=\"1600\" height=\"1112\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol>\n<li>Valitse <strong>Jalkapalloarkisto</strong> ja sitten <strong>Stadionit</strong>. ①</li>\n<li>Paina listan yläreunassa plus-painiketta (+).</li>\n<li>Kirjoita <strong>Nimi</strong>. ③</li>\n<li>Kentän <strong>Osoite sivustolla</strong> vieressä paina <strong>Luo</strong>.</li>\n<li>Kirjoita kenttään <strong>Kaupunki</strong> nimen alkua ja valitse listasta. ⑤</li>\n<li>Täytä halutessasi <strong>Osoite</strong>, <strong>Kapasiteetti</strong>, <strong>Rakennusvuosi</strong> ja <strong>Kuvaus</strong>.</li>\n<li>Lisää kuvat kenttään <strong>Kuvat</strong>.</li>\n<li>Oikeassa alakulmassa paina <strong>Julkaise</strong>.</li>\n</ol>\n<h2 id=\"stadion--tulos\">Tulos</h2>\n<ul>\n<li>Stadion näkyy arkiston stadioneissa ja omalla sivullaan.</li>\n<li>Lomakkeen yläreunan <strong>Käytetty yhdellä sivulla</strong> avaa sivun.</li>\n</ul>\n<h2 id=\"stadion--lisavalinnat\">Lisävalinnat</h2>\n<ul>\n<li><strong>Karttapaikka</strong> on stadionin sijainti kartalla. Kenttä on valinnainen. Jätä se tyhjäksi, jos et\ntiedä koordinaatteja. Kenttien nimet ovat englanniksi: Latitude on leveysaste (esimerkiksi\n60.98) ja Longitude pituusaste (esimerkiksi 25.66). Jätä Altitude tyhjäksi.</li>\n<li>Kuvan lisäys ja kuvaus: <a href=\"/studio/ohjeet/kuva\" data-ohje-kortti=\"kuva\">Kuva</a></li>\n</ul>\n<h2 id=\"stadion--jos-jokin-menee-vikaan\">Jos jokin menee vikaan</h2>\n<ul>\n<li>Kaupunkia ei löydy listasta: lisää se ensin, katso <a href=\"/studio/ohjeet/uusi-kaupunki\" data-ohje-kortti=\"uusi-kaupunki\">Lisää uusi kaupunki</a>.\nSamat kaupungit ovat käytössä ravintoloilla.</li>\n<li>Punainen virhe kentässä <strong>Rakennusvuosi</strong>: kirjoita nelinumeroinen vuosi, esimerkiksi 1981.</li>\n</ul>\n<p>Katso myös: <a href=\"/studio/ohjeet/uusi-kaupunki\" data-ohje-kortti=\"uusi-kaupunki\">Lisää uusi kaupunki</a> · <a href=\"/studio/ohjeet/kuva\" data-ohje-kortti=\"kuva\">Kuva</a></p>\n",
          "teksti": "Milloin Kun arkistoon tulee uusi stadion, esimerkiksi klubin matkan kohde. Stadionilla on oma sivunsa. Askeleet Valitse Jalkapalloarkisto ja sitten Stadionit . ① Paina listan yläreunassa plus-painiketta (+). Kirjoita Nimi . ③ Kentän Osoite sivustolla vieressä paina Luo . Kirjoita kenttään Kaupunki nimen alkua ja valitse listasta. ⑤ Täytä halutessasi Osoite , Kapasiteetti , Rakennusvuosi ja Kuvaus . Lisää kuvat kenttään Kuvat . Oikeassa alakulmassa paina Julkaise . Tulos Stadion näkyy arkiston stadioneissa ja omalla sivullaan. Lomakkeen yläreunan Käytetty yhdellä sivulla avaa sivun. Lisävalinnat Karttapaikka on stadionin sijainti kartalla. Kenttä on valinnainen. Jätä se tyhjäksi, jos et tiedä koordinaatteja. Kenttien nimet ovat englanniksi: Latitude on leveysaste (esimerkiksi 60.98) ja Longitude pituusaste (esimerkiksi 25.66). Jätä Altitude tyhjäksi. Kuvan lisäys ja kuvaus: Kuva Jos jokin menee vikaan Kaupunkia ei löydy listasta: lisää se ensin, katso Lisää uusi kaupunki . Samat kaupungit ovat käytössä ravintoloilla. Punainen virhe kentässä Rakennusvuosi : kirjoita nelinumeroinen vuosi, esimerkiksi 1981. Katso myös: Lisää uusi kaupunki · Kuva",
          "otsikot": [
            {
              "id": "stadion--milloin",
              "teksti": "Milloin",
              "taso": 2
            },
            {
              "id": "stadion--askeleet",
              "teksti": "Askeleet",
              "taso": 2
            },
            {
              "id": "stadion--tulos",
              "teksti": "Tulos",
              "taso": 2
            },
            {
              "id": "stadion--lisavalinnat",
              "teksti": "Lisävalinnat",
              "taso": 2
            },
            {
              "id": "stadion--jos-jokin-menee-vikaan",
              "teksti": "Jos jokin menee vikaan",
              "taso": 2
            }
          ]
        },
        {
          "id": "litmanen",
          "otsikko": "Lisää Litmasen lehtijuttu tai patsaskuva",
          "osio": "arkisto",
          "avainsanat": [
            "Litmanen",
            "Jari Litmanen",
            "Litti",
            "lehtijuttu",
            "lehtileike",
            "juttu",
            "artikkeli",
            "patsas",
            "patsaskuva",
            "loukkaantuminen",
            "terveys"
          ],
          "tyypit": [
            "lehtileike",
            "pelaaja"
          ],
          "kesto": "noin 10 minuuttia",
          "paivitetty": "2026-10-08",
          "html": "<h2 id=\"litmanen--milloin\">Milloin</h2>\n<p>Litmanen-osiossa on neljä sivua: Jari Litmanen, Lehtileikkeet, Patsas ja Litmasen loukkaantumiset.\nTällä kortilla lisäät uuden lehtijutun tai patsaskuvan.</p>\n<h2 id=\"litmanen--askeleet\">Askeleet</h2>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/litmanen-01-lehtileike.webp\" aria-label=\"Suurenna kuva: Uusi lehtileike. 1: Lehtileikkeet. 4: Sivu-valinta. 5: Julkaisupäivä.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/litmanen-01-lehtileike.webp\" alt=\"Uusi lehtileike. 1: Lehtileikkeet. 4: Sivu-valinta. 5: Julkaisupäivä.\" width=\"1600\" height=\"1042\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol>\n<li>Valitse <strong>Jalkapalloarkisto</strong> ja sitten <strong>Lehtileikkeet</strong>. ①</li>\n<li>Paina listan yläreunassa plus-painiketta (+).\n<strong>Pelaaja</strong> on valmiina: Jari Litmanen.</li>\n<li>Kirjoita jutun <strong>Otsikko</strong>.</li>\n<li>Valitse <strong>Sivu</strong>: <strong>Lehtileikkeet (ura ja elämä)</strong>, <strong>Patsas</strong> tai <strong>Terveys ja loukkaantumiset</strong>. ④</li>\n<li>Valitse <strong>Julkaisupäivä</strong>: päivä, jolloin juttu alun perin julkaistiin. ⑤</li>\n<li>Kirjoita <strong>Lähde</strong>, esimerkiksi is.fi, ja halutessasi <strong>Linkki alkuperäiseen juttuun (valinnainen)</strong>.</li>\n<li>Kirjoita tai liitä jutun <strong>Teksti</strong> ja paina oikeassa alakulmassa <strong>Julkaise</strong>.</li>\n</ol>\n<h2 id=\"litmanen--tulos\">Tulos</h2>\n<ul>\n<li>Juttu näkyy valitulla sivulla. Jutut ovat julkaisupäivän mukaan uusin ensin.</li>\n<li>Sivulla näkyy jutun ensimmäinen kappale. Loput avautuvat &quot;Lue koko juttu&quot; -painikkeesta.</li>\n</ul>\n<h2 id=\"litmanen--lisavalinnat\">Lisävalinnat</h2>\n<p>Uusi patsaskuva:</p>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/litmanen-02-patsas.webp\" aria-label=\"Suurenna kuva: Jari Litmasen lomake. 2: Välilehti Patsas. 3: Kuvat-kenttä.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/litmanen-02-patsas.webp\" alt=\"Jari Litmasen lomake. 2: Välilehti Patsas. 3: Kuvat-kenttä.\" width=\"840\" height=\"1908\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol>\n<li>Valitse <strong>Jalkapalloarkisto</strong> → <strong>Pelaajat</strong> → Jari Litmanen.</li>\n<li>Valitse välilehti <strong>Patsas</strong>. ②</li>\n<li>Lisää kuva kenttään <strong>Kuvat</strong>. ③</li>\n<li>Kirjoita <strong>Vaihtoehtoinen teksti (alt)</strong> ja valitse <strong>Kuvauspäivä</strong>.</li>\n<li>Oikeassa alakulmassa paina <strong>Julkaise</strong>.\nPatsaskuvat näkyvät sivulla kuvauspäivän mukaan uusin ensin.</li>\n</ol>\n<p>Muut:</p>\n<ul>\n<li>Uusi loukkaantuminen: lisää rivi Litmasen loukkaantumistaulukkoon. Taulukko on Jari Litmasen\nlomakkeella välilehden <strong>Ura</strong> kentässä <strong>Tilastotaulukot</strong>. Katso\n<a href=\"/studio/ohjeet/tilastotaulukon-paivitys\" data-ohje-kortti=\"tilastotaulukon-paivitys\">Päivitä tilastotaulukko</a>. Yhteenveto ja kaavio päivittyvät itsestään.</li>\n<li>Yleiskatsaus: Jari Litmasen perustiedot, seurat ja saavutukset, katso <a href=\"/studio/ohjeet/pelaaja\" data-ohje-kortti=\"pelaaja\">Pelaaja</a>.</li>\n</ul>\n<h2 id=\"litmanen--jos-jokin-menee-vikaan\">Jos jokin menee vikaan</h2>\n<ul>\n<li><strong>Julkaise</strong> ei onnistu: <strong>Otsikko</strong>, <strong>Sivu</strong>, <strong>Julkaisupäivä</strong> ja <strong>Teksti</strong> ovat pakollisia.</li>\n<li>Keltainen &quot;Ilman päivämäärää kuva näytetään listan lopussa.&quot;: valitse kuvalle <strong>Kuvauspäivä</strong>.</li>\n<li>Lehtijuttuja voi lisätä vain Litmaselle. Muiden pelaajien juttusivua varten ota yhteyttä\n<a href=\"/studio/ohjeet/tukihenkilo\" data-ohje-kortti=\"tukihenkilo\">tukihenkilöön</a>.</li>\n</ul>\n<p>Katso myös: <a href=\"/studio/ohjeet/pelaaja\" data-ohje-kortti=\"pelaaja\">Pelaaja</a> · <a href=\"/studio/ohjeet/kuva\" data-ohje-kortti=\"kuva\">Kuva</a></p>\n",
          "teksti": "Milloin Litmanen-osiossa on neljä sivua: Jari Litmanen, Lehtileikkeet, Patsas ja Litmasen loukkaantumiset. Tällä kortilla lisäät uuden lehtijutun tai patsaskuvan. Askeleet Valitse Jalkapalloarkisto ja sitten Lehtileikkeet . ① Paina listan yläreunassa plus-painiketta (+). Pelaaja on valmiina: Jari Litmanen. Kirjoita jutun Otsikko . Valitse Sivu : Lehtileikkeet (ura ja elämä) , Patsas tai Terveys ja loukkaantumiset . ④ Valitse Julkaisupäivä : päivä, jolloin juttu alun perin julkaistiin. ⑤ Kirjoita Lähde , esimerkiksi is.fi, ja halutessasi Linkki alkuperäiseen juttuun (valinnainen) . Kirjoita tai liitä jutun Teksti ja paina oikeassa alakulmassa Julkaise . Tulos Juttu näkyy valitulla sivulla. Jutut ovat julkaisupäivän mukaan uusin ensin. Sivulla näkyy jutun ensimmäinen kappale. Loput avautuvat \"Lue koko juttu\" -painikkeesta. Lisävalinnat Uusi patsaskuva: Valitse Jalkapalloarkisto → Pelaajat → Jari Litmanen. Valitse välilehti Patsas . ② Lisää kuva kenttään Kuvat . ③ Kirjoita Vaihtoehtoinen teksti (alt) ja valitse Kuvauspäivä . Oikeassa alakulmassa paina Julkaise . Patsaskuvat näkyvät sivulla kuvauspäivän mukaan uusin ensin. Muut: Uusi loukkaantuminen: lisää rivi Litmasen loukkaantumistaulukkoon. Taulukko on Jari Litmasen lomakkeella välilehden Ura kentässä Tilastotaulukot . Katso Päivitä tilastotaulukko . Yhteenveto ja kaavio päivittyvät itsestään. Yleiskatsaus: Jari Litmasen perustiedot, seurat ja saavutukset, katso Pelaaja . Jos jokin menee vikaan Julkaise ei onnistu: Otsikko , Sivu , Julkaisupäivä ja Teksti ovat pakollisia. Keltainen \"Ilman päivämäärää kuva näytetään listan lopussa.\": valitse kuvalle Kuvauspäivä . Lehtijuttuja voi lisätä vain Litmaselle. Muiden pelaajien juttusivua varten ota yhteyttä tukihenkilöön . Katso myös: Pelaaja · Kuva",
          "otsikot": [
            {
              "id": "litmanen--milloin",
              "teksti": "Milloin",
              "taso": 2
            },
            {
              "id": "litmanen--askeleet",
              "teksti": "Askeleet",
              "taso": 2
            },
            {
              "id": "litmanen--tulos",
              "teksti": "Tulos",
              "taso": 2
            },
            {
              "id": "litmanen--lisavalinnat",
              "teksti": "Lisävalinnat",
              "taso": 2
            },
            {
              "id": "litmanen--jos-jokin-menee-vikaan",
              "teksti": "Jos jokin menee vikaan",
              "taso": 2
            }
          ]
        },
        {
          "id": "jarkytykset-ja-maailman-parhaat",
          "otsikko": "Päivitä järkytykset, maailman parhaat tai ulkomaiset mestarit",
          "osio": "arkisto",
          "avainsanat": [
            "järkytykset",
            "TOP 10",
            "maailman paras avaus",
            "maailman parhaat",
            "kenttäkaavio",
            "ulkomaiset mestarit",
            "Englanti",
            "Venäjä",
            "mestarit",
            "muut taulukot"
          ],
          "tyypit": [
            "jalkapalloTilasto"
          ],
          "kesto": "noin 10 minuuttia",
          "paivitetty": "2026-10-08",
          "html": "<h2 id=\"jarkytykset-ja-maailman-parhaat--milloin\">Milloin</h2>\n<p>Kolmella arkiston aiheella on oma sivunsa: TOP 10 järkytykset, Maailman parhaat ja Ulkomaiset mestarit.\nNiiden taulukot ovat ryhmässä <strong>Muut arkiston taulukot</strong>.</p>\n<h2 id=\"jarkytykset-ja-maailman-parhaat--askeleet\">Askeleet</h2>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/jarkytykset-ja-maailman-parhaat-01-muut.webp\" aria-label=\"Suurenna kuva: Studion valikko. 1: Muut arkiston taulukot. 2: Taulukko listassa.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/jarkytykset-ja-maailman-parhaat-01-muut.webp\" alt=\"Studion valikko. 1: Muut arkiston taulukot. 2: Taulukko listassa.\" width=\"1600\" height=\"800\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol>\n<li>Valitse <strong>Jalkapalloarkisto</strong> → <strong>Tilastot</strong> → <strong>Muut arkiston taulukot</strong>. ①</li>\n<li>Valitse taulukko listasta, esimerkiksi &quot;Maailman paras avaus vuosittain&quot;. ②</li>\n<li>Päivitä taulukko välilehdellä <strong>Tilastodata</strong>. Katso <a href=\"/studio/ohjeet/tilastotaulukon-paivitys\" data-ohje-kortti=\"tilastotaulukon-paivitys\">Päivitä tilastotaulukko</a>.</li>\n<li>Maailman parhaissa lisää uuden vuoden kenttäkaavio välilehden <strong>Perustiedot</strong> kenttään <strong>Kuvat</strong>.\nRaahaa uusi kuva listan alkuun.</li>\n<li>Oikeassa alakulmassa paina <strong>Julkaise</strong>.</li>\n</ol>\n<h2 id=\"jarkytykset-ja-maailman-parhaat--tulos\">Tulos</h2>\n<ul>\n<li>TOP 10 järkytykset ja Maailman parhaat näkyvät arkiston valikossa omina sivuinaan.</li>\n<li>Ulkomaisten mestareiden taulukko näkyy valitun maan sivulla.</li>\n</ul>\n<h2 id=\"jarkytykset-ja-maailman-parhaat--lisavalinnat\">Lisävalinnat</h2>\n<ul>\n<li>Uusi taulukko jollekin sivulle: paina listan yläreunassa plus-painiketta (+) ja valitse kategoria.\n<ul>\n<li>Järkytykset: &quot;Suomen jalkapallon järkytykset&quot;.</li>\n<li>Maailman parhaat: &quot;Maailman paras avaus&quot;.</li>\n<li>Ulkomaiset mestarit: &quot;Ulkomaiden mestarit (Englanti, Venäjä …)&quot;. Valitse sitten maa kohdassa\n<strong>Maa Ulkomaiset mestarit -sivulla</strong>.</li>\n</ul>\n</li>\n<li>Kaikki saman kategorian taulukot näkyvät samalla sivulla. Järjestys: <strong>Järjestys sivulla</strong>.</li>\n</ul>\n<h2 id=\"jarkytykset-ja-maailman-parhaat--jos-jokin-menee-vikaan\">Jos jokin menee vikaan</h2>\n<ul>\n<li>Keltainen &quot;Valitse maa, jotta taulukko löytyy oikean valikon alta.&quot;: valitse maa kohdassa\n<strong>Maa Ulkomaiset mestarit -sivulla</strong>.</li>\n<li>Uusi maa puuttuu valinnoista: uuden maan sivu tarvitsee <a href=\"/studio/ohjeet/tukihenkilo\" data-ohje-kortti=\"tukihenkilo\">tukihenkilön</a>.</li>\n</ul>\n<p>Katso myös: <a href=\"/studio/ohjeet/tilastotaulukon-paivitys\" data-ohje-kortti=\"tilastotaulukon-paivitys\">Päivitä tilastotaulukko</a> · <a href=\"/studio/ohjeet/uusi-tilastotaulukko\" data-ohje-kortti=\"uusi-tilastotaulukko\">Lisää uusi tilastotaulukko</a></p>\n",
          "teksti": "Milloin Kolmella arkiston aiheella on oma sivunsa: TOP 10 järkytykset, Maailman parhaat ja Ulkomaiset mestarit. Niiden taulukot ovat ryhmässä Muut arkiston taulukot . Askeleet Valitse Jalkapalloarkisto → Tilastot → Muut arkiston taulukot . ① Valitse taulukko listasta, esimerkiksi \"Maailman paras avaus vuosittain\". ② Päivitä taulukko välilehdellä Tilastodata . Katso Päivitä tilastotaulukko . Maailman parhaissa lisää uuden vuoden kenttäkaavio välilehden Perustiedot kenttään Kuvat . Raahaa uusi kuva listan alkuun. Oikeassa alakulmassa paina Julkaise . Tulos TOP 10 järkytykset ja Maailman parhaat näkyvät arkiston valikossa omina sivuinaan. Ulkomaisten mestareiden taulukko näkyy valitun maan sivulla. Lisävalinnat Uusi taulukko jollekin sivulle: paina listan yläreunassa plus-painiketta (+) ja valitse kategoria. Järkytykset: \"Suomen jalkapallon järkytykset\". Maailman parhaat: \"Maailman paras avaus\". Ulkomaiset mestarit: \"Ulkomaiden mestarit (Englanti, Venäjä …)\". Valitse sitten maa kohdassa Maa Ulkomaiset mestarit -sivulla . Kaikki saman kategorian taulukot näkyvät samalla sivulla. Järjestys: Järjestys sivulla . Jos jokin menee vikaan Keltainen \"Valitse maa, jotta taulukko löytyy oikean valikon alta.\": valitse maa kohdassa Maa Ulkomaiset mestarit -sivulla . Uusi maa puuttuu valinnoista: uuden maan sivu tarvitsee tukihenkilön . Katso myös: Päivitä tilastotaulukko · Lisää uusi tilastotaulukko",
          "otsikot": [
            {
              "id": "jarkytykset-ja-maailman-parhaat--milloin",
              "teksti": "Milloin",
              "taso": 2
            },
            {
              "id": "jarkytykset-ja-maailman-parhaat--askeleet",
              "teksti": "Askeleet",
              "taso": 2
            },
            {
              "id": "jarkytykset-ja-maailman-parhaat--tulos",
              "teksti": "Tulos",
              "taso": 2
            },
            {
              "id": "jarkytykset-ja-maailman-parhaat--lisavalinnat",
              "teksti": "Lisävalinnat",
              "taso": 2
            },
            {
              "id": "jarkytykset-ja-maailman-parhaat--jos-jokin-menee-vikaan",
              "teksti": "Jos jokin menee vikaan",
              "taso": 2
            }
          ]
        }
      ]
    },
    {
      "id": "ravintolat",
      "otsikko": "Ravintolat",
      "kortit": [
        {
          "id": "klubilaisen-pisteet",
          "otsikko": "Lisää klubilaisen pisteet ravintolalle",
          "osio": "ravintolat",
          "avainsanat": [
            "pisteet",
            "arvosana",
            "ravintola",
            "klubilainen",
            "ruokailu",
            "ruokailutaulukko",
            "ruoka",
            "hinta",
            "viihtyvyys",
            "uusintakäynti",
            "arvio",
            "tähdet"
          ],
          "tyypit": [
            "klubiArvio",
            "ravintola"
          ],
          "kesto": "noin 3 minuuttia",
          "paivitetty": "2026-10-08",
          "html": "<h2 id=\"klubilaisen-pisteet--milloin\">Milloin</h2>\n<p>Kun klubilainen on antanut pisteet ravintolalle, mutta ei lähettänyt niitä arvostelulomakkeella.\nRavintolan arvosana lasketaan klubilaisten pisteistä itsestään. Sitä ei kirjoiteta käsin.</p>\n<h2 id=\"klubilaisen-pisteet--askeleet\">Askeleet</h2>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/klubilaisen-pisteet-01-ravintoloittain.webp\" aria-label=\"Suurenna kuva: Klubilaisten arvosanat. 1: Ravintolat. 2: Ravintoloittain. 3: Ravintola listassa. 4: Plus-painike.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/klubilaisen-pisteet-01-ravintoloittain.webp\" alt=\"Klubilaisten arvosanat. 1: Ravintolat. 2: Ravintoloittain. 3: Ravintola listassa. 4: Plus-painike.\" width=\"1920\" height=\"800\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol>\n<li>Vasemmasta valikosta valitse <strong>Ravintolat</strong>. ①</li>\n<li>Valitse <strong>Klubilaisten arvosanat</strong> ja sitten <strong>Ravintoloittain</strong>. ②</li>\n<li>Listassa <strong>Valitse ravintola</strong> kirjoita ravintolan nimi kenttään <strong>Etsi listalta</strong> ja valitse ravintola. ③\nNäet ravintolan kaikki klubilaisten arvosanat, uusin ensin.</li>\n<li>Paina oikeanpuoleisimman listan <strong>Klubilaisten arvosanat</strong> yläreunassa plus-painiketta (+). ④\nÄlä paina listan <strong>Valitse ravintola</strong> plussaa: se tekee uuden ravintolan.\n<strong>Ravintola</strong> ja tämä päivä ovat valmiina.</li>\n</ol>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/klubilaisen-pisteet-02-lomake.webp\" aria-label=\"Suurenna kuva: Arvosanan lomake. 5: Klubilainen. 6: Ruoka, Hinta ja Viihtyvyys. 7: Päivä. 8: Julkaise.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/klubilaisen-pisteet-02-lomake.webp\" alt=\"Arvosanan lomake. 5: Klubilainen. 6: Ruoka, Hinta ja Viihtyvyys. 7: Päivä. 8: Julkaise.\" width=\"803\" height=\"1058\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol start=\"5\">\n<li>Kirjoita kenttään <strong>Klubilainen</strong> nimen alkua ja valitse nimi listasta. ⑤</li>\n<li>Kirjoita pisteet kenttiin <strong>Ruoka</strong>, <strong>Hinta</strong> ja <strong>Viihtyvyys</strong>. ⑥\nPisteet ovat 1–5. Desimaalin voi kirjoittaa pilkulla tai pisteellä, esimerkiksi 3,5.</li>\n<li>Muuta tarvittaessa <strong>Päivä</strong> käyntipäiväksi. ⑦</li>\n<li>Oikeassa alakulmassa paina <strong>Julkaise</strong>. ⑧</li>\n</ol>\n<h2 id=\"klubilaisen-pisteet--tulos\">Tulos</h2>\n<ul>\n<li>Ravintolan arvosana päivittyy itsestään hetken kuluttua.</li>\n<li>Ravintola näkyy sivustolla, kun vähintään kaksi klubilaista on arvioinut sen.</li>\n<li>Ravintolan sivulla taulukko Klubilaisten arvosanat näyttää uudet pisteet.</li>\n</ul>\n<h2 id=\"klubilaisen-pisteet--lisavalinnat\">Lisävalinnat</h2>\n<ul>\n<li>Sama klubilainen kävi uudelleen: älä tee uutta arvosanaa. Avaa hänen vanha arvosanansa\nsamasta listasta, muuta pisteet ja <strong>Päivä</strong>, ja paina <strong>Julkaise</strong>. Uusin arvosana on voimassa.</li>\n<li>Uusi klubilainen: valitse <strong>Ravintolat</strong> → <strong>Klubilaiset</strong>, paina plus-painiketta (+),\nkirjoita <strong>Nimi</strong> ja paina <strong>Julkaise</strong>.</li>\n<li>Ravintolaa ei ole listassa: lisää se ensin, katso <a href=\"/studio/ohjeet/ravintolan-tiedot\" data-ohje-kortti=\"ravintolan-tiedot\">Täydennä ravintolan tiedot</a>.</li>\n<li>Väärin kirjattu arvosana: <a href=\"/studio/ohjeet/klubilaisen-arvosanan-poisto\" data-ohje-kortti=\"klubilaisen-arvosanan-poisto\">Poista klubilaisen arvosana</a></li>\n<li>Kaikki arvosanat yhdessä listassa: <strong>Klubilaisten arvosanat</strong> → <strong>Kaikki (uusin ensin)</strong>.</li>\n</ul>\n<h2 id=\"klubilaisen-pisteet--jos-jokin-menee-vikaan\">Jos jokin menee vikaan</h2>\n<ul>\n<li>Punainen &quot;Tällä klubilaisella on jo arvosana tähän ravintolaan…&quot;: muokkaa vanhaa\narvosanaa, älä lisää uutta. Poista tämä keskeneräinen arvosana: <strong>Asiakirjatoiminnot</strong> →\n<strong>Poista</strong> → <strong>Poista nyt</strong>.</li>\n<li>Punainen &quot;Arvosana on 1,0–5,0.&quot;: pisteet ovat liian suuret tai pienet. Tarkista luku.</li>\n<li>Ravintola ei näy sivustolla: katso <a href=\"/studio/ohjeet/ravintola-ei-nay\" data-ohje-kortti=\"ravintola-ei-nay\">Ravintola ei näy</a>.</li>\n</ul>\n<p>Katso myös: <a href=\"/studio/ohjeet/arvostelun-hyvaksynta\" data-ohje-kortti=\"arvostelun-hyvaksynta\">Hyväksy tai hylkää arvostelu</a> · <a href=\"/studio/ohjeet/arvostelulomake-klubilaisille\" data-ohje-kortti=\"arvostelulomake-klubilaisille\">Jaa arvostelulomake klubilaisille</a></p>\n",
          "teksti": "Milloin Kun klubilainen on antanut pisteet ravintolalle, mutta ei lähettänyt niitä arvostelulomakkeella. Ravintolan arvosana lasketaan klubilaisten pisteistä itsestään. Sitä ei kirjoiteta käsin. Askeleet Vasemmasta valikosta valitse Ravintolat . ① Valitse Klubilaisten arvosanat ja sitten Ravintoloittain . ② Listassa Valitse ravintola kirjoita ravintolan nimi kenttään Etsi listalta ja valitse ravintola. ③ Näet ravintolan kaikki klubilaisten arvosanat, uusin ensin. Paina oikeanpuoleisimman listan Klubilaisten arvosanat yläreunassa plus-painiketta (+). ④ Älä paina listan Valitse ravintola plussaa: se tekee uuden ravintolan. Ravintola ja tämä päivä ovat valmiina. Kirjoita kenttään Klubilainen nimen alkua ja valitse nimi listasta. ⑤ Kirjoita pisteet kenttiin Ruoka , Hinta ja Viihtyvyys . ⑥ Pisteet ovat 1–5. Desimaalin voi kirjoittaa pilkulla tai pisteellä, esimerkiksi 3,5. Muuta tarvittaessa Päivä käyntipäiväksi. ⑦ Oikeassa alakulmassa paina Julkaise . ⑧ Tulos Ravintolan arvosana päivittyy itsestään hetken kuluttua. Ravintola näkyy sivustolla, kun vähintään kaksi klubilaista on arvioinut sen. Ravintolan sivulla taulukko Klubilaisten arvosanat näyttää uudet pisteet. Lisävalinnat Sama klubilainen kävi uudelleen: älä tee uutta arvosanaa. Avaa hänen vanha arvosanansa samasta listasta, muuta pisteet ja Päivä , ja paina Julkaise . Uusin arvosana on voimassa. Uusi klubilainen: valitse Ravintolat → Klubilaiset , paina plus-painiketta (+), kirjoita Nimi ja paina Julkaise . Ravintolaa ei ole listassa: lisää se ensin, katso Täydennä ravintolan tiedot . Väärin kirjattu arvosana: Poista klubilaisen arvosana Kaikki arvosanat yhdessä listassa: Klubilaisten arvosanat → Kaikki (uusin ensin) . Jos jokin menee vikaan Punainen \"Tällä klubilaisella on jo arvosana tähän ravintolaan…\": muokkaa vanhaa arvosanaa, älä lisää uutta. Poista tämä keskeneräinen arvosana: Asiakirjatoiminnot → Poista → Poista nyt . Punainen \"Arvosana on 1,0–5,0.\": pisteet ovat liian suuret tai pienet. Tarkista luku. Ravintola ei näy sivustolla: katso Ravintola ei näy . Katso myös: Hyväksy tai hylkää arvostelu · Jaa arvostelulomake klubilaisille",
          "otsikot": [
            {
              "id": "klubilaisen-pisteet--milloin",
              "teksti": "Milloin",
              "taso": 2
            },
            {
              "id": "klubilaisen-pisteet--askeleet",
              "teksti": "Askeleet",
              "taso": 2
            },
            {
              "id": "klubilaisen-pisteet--tulos",
              "teksti": "Tulos",
              "taso": 2
            },
            {
              "id": "klubilaisen-pisteet--lisavalinnat",
              "teksti": "Lisävalinnat",
              "taso": 2
            },
            {
              "id": "klubilaisen-pisteet--jos-jokin-menee-vikaan",
              "teksti": "Jos jokin menee vikaan",
              "taso": 2
            }
          ]
        },
        {
          "id": "klubilaisen-arvosanan-poisto",
          "otsikko": "Poista klubilaisen arvosana",
          "osio": "ravintolat",
          "avainsanat": [
            "poista arvosana",
            "väärä arvosana",
            "väärä ravintola",
            "väärä klubilainen",
            "kahdesti",
            "tuplana",
            "pisteet pois",
            "arvio pois"
          ],
          "tyypit": [
            "klubiArvio"
          ],
          "kesto": "noin 2 minuuttia",
          "paivitetty": "2026-10-08",
          "html": "<h2 id=\"klubilaisen-arvosanan-poisto--milloin\">Milloin</h2>\n<p>Kun arvosana on kirjattu väärälle ravintolalle tai klubilaiselle, tai sama arvosana on kahdesti.\nJos vain pisteet ovat väärin, korjaa pisteet. Poistoa ei silloin tarvita.</p>\n<h2 id=\"klubilaisen-arvosanan-poisto--askeleet\">Askeleet</h2>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/klubilaisen-arvosanan-poisto-01-valikko.webp\" aria-label=\"Suurenna kuva: Arvosanan valikko. 2: Arvosana listassa. 3: Asiakirjatoiminnot. 4: Poista.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/klubilaisen-arvosanan-poisto-01-valikko.webp\" alt=\"Arvosanan valikko. 2: Arvosana listassa. 3: Asiakirjatoiminnot. 4: Poista.\" width=\"1920\" height=\"908\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol>\n<li>Valitse <strong>Ravintolat</strong> → <strong>Klubilaisten arvosanat</strong> → <strong>Ravintoloittain</strong>. Kirjoita ravintolan\nnimi kenttään <strong>Etsi listalta</strong> ja valitse ravintola.</li>\n<li>Avaa poistettava arvosana. ②</li>\n<li>Avaa <strong>Julkaise</strong>-painikkeen vierestä valikko <strong>Asiakirjatoiminnot</strong>. ③</li>\n<li>Valitse <strong>Poista</strong>. ④</li>\n<li>Ikkunassa <strong>Poista dokumentti?</strong> paina <strong>Poista nyt</strong>.</li>\n</ol>\n<h2 id=\"klubilaisen-arvosanan-poisto--tulos\">Tulos</h2>\n<ul>\n<li>Arvosana katoaa listasta.</li>\n<li>Ravintolan arvosana lasketaan uudelleen itsestään.</li>\n<li>Jos ravintolalle jää alle kaksi klubilaisen arvosanaa, se piiloutuu sivustolta. Alapalkissa näkyy\nsilloin merkki <strong>Odottaa toista arvioijaa</strong>.</li>\n<li>Vanhan sivuston ravintolalla palautuu vanha arvosana, jos kaikki klubilaisten arvosanat poistetaan.\nSen näet välilehden <strong>Arvostelu</strong> kohdasta <strong>Aiempi arvosana</strong>.</li>\n</ul>\n<h2 id=\"klubilaisen-arvosanan-poisto--lisavalinnat\">Lisävalinnat</h2>\n<ul>\n<li>Klubilaisen lomakkeelta lähettämä arvostelu ei ole tässä listassa. Avaa se kohdasta\n<strong>Ravintolat</strong> → <strong>Arvostelut: kaikki</strong>. Jos arvostelu ei saa vaikuttaa arvosanaan, tyhjennä kenttä\n<strong>Klubilainen</strong> ja paina <strong>Julkaise</strong>. Koko arvostelun poisto: <a href=\"/studio/ohjeet/arvostelun-hyvaksynta\" data-ohje-kortti=\"arvostelun-hyvaksynta\">Hyväksy tai hylkää arvostelu</a>.</li>\n</ul>\n<h2 id=\"klubilaisen-arvosanan-poisto--jos-jokin-menee-vikaan\">Jos jokin menee vikaan</h2>\n<ul>\n<li>Poistit väärän arvosanan: kirjaa pisteet uudelleen, katso <a href=\"/studio/ohjeet/klubilaisen-pisteet\" data-ohje-kortti=\"klubilaisen-pisteet\">Lisää klubilaisen pisteet</a>.</li>\n<li>Ravintola katosi sivustolta: sillä on nyt alle kaksi arvioijaa. Katso <a href=\"/studio/ohjeet/ravintola-ei-nay\" data-ohje-kortti=\"ravintola-ei-nay\">Ravintola ei näy</a>.</li>\n</ul>\n<p>Katso myös: <a href=\"/studio/ohjeet/klubilaisen-pisteet\" data-ohje-kortti=\"klubilaisen-pisteet\">Lisää klubilaisen pisteet</a> · <a href=\"/studio/ohjeet/poistetun-palautus\" data-ohje-kortti=\"poistetun-palautus\">Poistetun palautus</a></p>\n",
          "teksti": "Milloin Kun arvosana on kirjattu väärälle ravintolalle tai klubilaiselle, tai sama arvosana on kahdesti. Jos vain pisteet ovat väärin, korjaa pisteet. Poistoa ei silloin tarvita. Askeleet Valitse Ravintolat → Klubilaisten arvosanat → Ravintoloittain . Kirjoita ravintolan nimi kenttään Etsi listalta ja valitse ravintola. Avaa poistettava arvosana. ② Avaa Julkaise -painikkeen vierestä valikko Asiakirjatoiminnot . ③ Valitse Poista . ④ Ikkunassa Poista dokumentti? paina Poista nyt . Tulos Arvosana katoaa listasta. Ravintolan arvosana lasketaan uudelleen itsestään. Jos ravintolalle jää alle kaksi klubilaisen arvosanaa, se piiloutuu sivustolta. Alapalkissa näkyy silloin merkki Odottaa toista arvioijaa . Vanhan sivuston ravintolalla palautuu vanha arvosana, jos kaikki klubilaisten arvosanat poistetaan. Sen näet välilehden Arvostelu kohdasta Aiempi arvosana . Lisävalinnat Klubilaisen lomakkeelta lähettämä arvostelu ei ole tässä listassa. Avaa se kohdasta Ravintolat → Arvostelut: kaikki . Jos arvostelu ei saa vaikuttaa arvosanaan, tyhjennä kenttä Klubilainen ja paina Julkaise . Koko arvostelun poisto: Hyväksy tai hylkää arvostelu . Jos jokin menee vikaan Poistit väärän arvosanan: kirjaa pisteet uudelleen, katso Lisää klubilaisen pisteet . Ravintola katosi sivustolta: sillä on nyt alle kaksi arvioijaa. Katso Ravintola ei näy . Katso myös: Lisää klubilaisen pisteet · Poistetun palautus",
          "otsikot": [
            {
              "id": "klubilaisen-arvosanan-poisto--milloin",
              "teksti": "Milloin",
              "taso": 2
            },
            {
              "id": "klubilaisen-arvosanan-poisto--askeleet",
              "teksti": "Askeleet",
              "taso": 2
            },
            {
              "id": "klubilaisen-arvosanan-poisto--tulos",
              "teksti": "Tulos",
              "taso": 2
            },
            {
              "id": "klubilaisen-arvosanan-poisto--lisavalinnat",
              "teksti": "Lisävalinnat",
              "taso": 2
            },
            {
              "id": "klubilaisen-arvosanan-poisto--jos-jokin-menee-vikaan",
              "teksti": "Jos jokin menee vikaan",
              "taso": 2
            }
          ]
        },
        {
          "id": "arvostelun-hyvaksynta",
          "otsikko": "Hyväksy tai hylkää kävijän arvostelu",
          "osio": "ravintolat",
          "avainsanat": [
            "arvostelu",
            "arvio",
            "hyväksy",
            "hyväksyntä",
            "hylkää",
            "hylkäys",
            "moderointi",
            "kävijän arvostelu",
            "ravintola-arvostelu",
            "kuva",
            "sopimaton kuva",
            "poista kuva",
            "jono",
            "odottaa"
          ],
          "tyypit": [
            "ravintolaKayttajaArvostelu"
          ],
          "kesto": "noin 3 minuuttia",
          "paivitetty": "2026-10-08",
          "html": "<h2 id=\"arvostelun-hyvaksynta--milloin\">Milloin</h2>\n<p>Kävijän tai klubilaisen lomakkeella lähettämä arvostelu odottaa hyväksyntääsi. Se ei näy\nsivustolla ennen kuin hyväksyt sen. Aloituksessa näet, montako arvostelua odottaa.</p>\n<div class=\"markdown-alert markdown-alert-tip\">\n<p class=\"markdown-alert-title\">Vinkki</p>\n<p>Käy jono läpi mieluiten samana päivänä. Klubilaiset odottavat näkevänsä arvostelunsa sivulla.</p>\n</div>\n<h2 id=\"arvostelun-hyvaksynta--askeleet\">Askeleet</h2>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/arvostelun-hyvaksynta-01-jono.webp\" aria-label=\"Suurenna kuva: Odottavat arvostelut. 1: Arvostelut odottavat hyväksyntää. 2: Arvostelu listassa. 3: Klubilainen. 4: Kuvat.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/arvostelun-hyvaksynta-01-jono.webp\" alt=\"Odottavat arvostelut. 1: Arvostelut odottavat hyväksyntää. 2: Arvostelu listassa. 3: Klubilainen. 4: Kuvat.\" width=\"1600\" height=\"2047\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol>\n<li>Valitse <strong>Tehtävät sinulle</strong> → <strong>Arvostelut odottavat hyväksyntää</strong>. ①\nSama lista löytyy myös kohdasta <strong>Ravintolat</strong> → <strong>Arvostelut: odottavat hyväksyntää</strong>.</li>\n<li>Avaa arvostelu listasta. ②\nRivillä näkyy arvostelija, ravintola, arvosana ja kuvien määrä.\nJos rivillä lukee UUSI ja ravintolan nimi, katso <a href=\"/studio/ohjeet/uusi-ravintola-arvostelusta\" data-ohje-kortti=\"uusi-ravintola-arvostelusta\">Uusi ravintola arvostelusta</a>.</li>\n<li>Tarkista kohta <strong>Klubilainen</strong>. ③\nJos se on tyhjä mutta arvostelija on klubilainen, valitse hänen nimensä. Muuten jätä tyhjäksi.</li>\n<li>Lue <strong>Arvostelu</strong> ja katso <strong>Kuvat</strong>. ④</li>\n<li>Jos jokin kuva on sopimaton, paina kuvan rivin oikeasta reunasta kolmea pistettä (⋯) ja\nvalitse <strong>Poista</strong>. Kuva poistuu heti, ilman kysymystä.</li>\n</ol>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/arvostelun-hyvaksynta-02-julkaise.webp\" aria-label=\"Suurenna kuva: Arvostelun alapalkki. 6: Julkaise-painike. Vieressä valikko, jossa Hylkää arvostelu.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/arvostelun-hyvaksynta-02-julkaise.webp\" alt=\"Arvostelun alapalkki. 6: Julkaise-painike. Vieressä valikko, jossa Hylkää arvostelu.\" width=\"848\" height=\"201\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol start=\"6\">\n<li>Hyväksy arvostelu: paina oikeassa alakulmassa <strong>Julkaise</strong>. ⑥</li>\n</ol>\n<h2 id=\"arvostelun-hyvaksynta--tulos\">Tulos</h2>\n<ul>\n<li>Arvostelu ja sen kuvat näkyvät ravintolan sivulla noin minuutin kuluttua.</li>\n<li>Arvostelu poistuu jonosta. Avoinna oleva lista päivittyy, kun avaat sen uudelleen.</li>\n<li>Klubilaisen arvostelu korvaa hänen aiemmat pisteensä. Ravintolan arvosana päivittyy itsestään.</li>\n</ul>\n<h2 id=\"arvostelun-hyvaksynta--lisavalinnat\">Lisävalinnat</h2>\n<p>Hylkää koko arvostelu:</p>\n<ol>\n<li>Avaa <strong>Julkaise</strong>-painikkeen vierestä valikko <strong>Asiakirjatoiminnot</strong>.</li>\n<li>Valitse <strong>Hylkää arvostelu</strong>.</li>\n<li>Oikeaan alakulmaan avautuu kysymys. Lue teksti ja paina <strong>Vahvista</strong>.</li>\n</ol>\n<div class=\"markdown-alert markdown-alert-warning\">\n<p class=\"markdown-alert-title\">Varoitus</p>\n<p>Yksittäisen kuvan poisto ennen julkaisua on turvallinen. Sen sijaan <strong>Hylkää arvostelu</strong> ja\n<strong>Poista arvostelu</strong> poistavat arvostelun ja kaikki sen kuvat pysyvästi. Niitä ei voi palauttaa.</p>\n</div>\n<p>Muut:</p>\n<ul>\n<li>Jo julkaistun arvostelun poisto: avaa se kohdasta <strong>Ravintolat</strong> → <strong>Arvostelut: kaikki</strong>.\nValikossa lukee silloin <strong>Poista arvostelu</strong>.</li>\n<li>Kuvan kuvaus: kentän <strong>Kuvaus (alt-teksti)</strong> lukee ruudunlukija näkövammaiselle. Voit tarkentaa\nsitä, esimerkiksi &quot;Paahdettu lohi&quot;.</li>\n</ul>\n<h2 id=\"arvostelun-hyvaksynta--jos-jokin-menee-vikaan\">Jos jokin menee vikaan</h2>\n<ul>\n<li><strong>Julkaise</strong>-painiketta ei ole, vain vihreä <strong>Hyväksy ja luo ravintola</strong>: kävijä ehdotti uutta\nravintolaa. Katso <a href=\"/studio/ohjeet/uusi-ravintola-arvostelusta\" data-ohje-kortti=\"uusi-ravintola-arvostelusta\">Uusi ravintola arvostelusta</a>.</li>\n<li>Keltainen &quot;Arvostelijaa ei ole liitetty klubilaiseen…&quot;: normaali, jos arvostelija ei ole\nklubilainen. Julkaisu onnistuu.</li>\n<li>Ravintola ei näy sivustolla hyväksynnän jälkeen: katso <a href=\"/studio/ohjeet/ravintola-ei-nay\" data-ohje-kortti=\"ravintola-ei-nay\">Ravintola ei näy</a>.</li>\n<li>Sivustolla on keltainen Esikatselutila-palkki: paina palkista &quot;Poistu esikatselusta&quot;.\nNäet sivun kuten kävijät.</li>\n</ul>\n<p>Katso myös: <a href=\"/studio/ohjeet/klubilaisen-pisteet\" data-ohje-kortti=\"klubilaisen-pisteet\">Lisää klubilaisen pisteet</a> · <a href=\"/studio/ohjeet/uusi-ravintola-arvostelusta\" data-ohje-kortti=\"uusi-ravintola-arvostelusta\">Uusi ravintola arvostelusta</a></p>\n",
          "teksti": "Milloin Kävijän tai klubilaisen lomakkeella lähettämä arvostelu odottaa hyväksyntääsi. Se ei näy sivustolla ennen kuin hyväksyt sen. Aloituksessa näet, montako arvostelua odottaa. Käy jono läpi mieluiten samana päivänä. Klubilaiset odottavat näkevänsä arvostelunsa sivulla. Askeleet Valitse Tehtävät sinulle → Arvostelut odottavat hyväksyntää . ① Sama lista löytyy myös kohdasta Ravintolat → Arvostelut: odottavat hyväksyntää . Avaa arvostelu listasta. ② Rivillä näkyy arvostelija, ravintola, arvosana ja kuvien määrä. Jos rivillä lukee UUSI ja ravintolan nimi, katso Uusi ravintola arvostelusta . Tarkista kohta Klubilainen . ③ Jos se on tyhjä mutta arvostelija on klubilainen, valitse hänen nimensä. Muuten jätä tyhjäksi. Lue Arvostelu ja katso Kuvat . ④ Jos jokin kuva on sopimaton, paina kuvan rivin oikeasta reunasta kolmea pistettä (⋯) ja valitse Poista . Kuva poistuu heti, ilman kysymystä. Hyväksy arvostelu: paina oikeassa alakulmassa Julkaise . ⑥ Tulos Arvostelu ja sen kuvat näkyvät ravintolan sivulla noin minuutin kuluttua. Arvostelu poistuu jonosta. Avoinna oleva lista päivittyy, kun avaat sen uudelleen. Klubilaisen arvostelu korvaa hänen aiemmat pisteensä. Ravintolan arvosana päivittyy itsestään. Lisävalinnat Hylkää koko arvostelu: Avaa Julkaise -painikkeen vierestä valikko Asiakirjatoiminnot . Valitse Hylkää arvostelu . Oikeaan alakulmaan avautuu kysymys. Lue teksti ja paina Vahvista . Yksittäisen kuvan poisto ennen julkaisua on turvallinen. Sen sijaan Hylkää arvostelu ja Poista arvostelu poistavat arvostelun ja kaikki sen kuvat pysyvästi. Niitä ei voi palauttaa. Muut: Jo julkaistun arvostelun poisto: avaa se kohdasta Ravintolat → Arvostelut: kaikki . Valikossa lukee silloin Poista arvostelu . Kuvan kuvaus: kentän Kuvaus (alt-teksti) lukee ruudunlukija näkövammaiselle. Voit tarkentaa sitä, esimerkiksi \"Paahdettu lohi\". Jos jokin menee vikaan Julkaise -painiketta ei ole, vain vihreä Hyväksy ja luo ravintola : kävijä ehdotti uutta ravintolaa. Katso Uusi ravintola arvostelusta . Keltainen \"Arvostelijaa ei ole liitetty klubilaiseen…\": normaali, jos arvostelija ei ole klubilainen. Julkaisu onnistuu. Ravintola ei näy sivustolla hyväksynnän jälkeen: katso Ravintola ei näy . Sivustolla on keltainen Esikatselutila-palkki: paina palkista \"Poistu esikatselusta\". Näet sivun kuten kävijät. Katso myös: Lisää klubilaisen pisteet · Uusi ravintola arvostelusta",
          "otsikot": [
            {
              "id": "arvostelun-hyvaksynta--milloin",
              "teksti": "Milloin",
              "taso": 2
            },
            {
              "id": "arvostelun-hyvaksynta--askeleet",
              "teksti": "Askeleet",
              "taso": 2
            },
            {
              "id": "arvostelun-hyvaksynta--tulos",
              "teksti": "Tulos",
              "taso": 2
            },
            {
              "id": "arvostelun-hyvaksynta--lisavalinnat",
              "teksti": "Lisävalinnat",
              "taso": 2
            },
            {
              "id": "arvostelun-hyvaksynta--jos-jokin-menee-vikaan",
              "teksti": "Jos jokin menee vikaan",
              "taso": 2
            }
          ]
        },
        {
          "id": "uusi-ravintola-arvostelusta",
          "otsikko": "Hyväksy arvostelu, joka tuo uuden ravintolan",
          "osio": "ravintolat",
          "avainsanat": [
            "uusi ravintola",
            "ehdotus",
            "UUSI",
            "hyväksy ja luo",
            "arvostelu",
            "ravintola puuttuu",
            "sama ravintola",
            "kaksi arvostelua"
          ],
          "tyypit": [
            "ravintolaKayttajaArvostelu"
          ],
          "kesto": "noin 5 minuuttia",
          "paivitetty": "2026-10-08",
          "html": "<h2 id=\"uusi-ravintola-arvostelusta--milloin\">Milloin</h2>\n<p>Kävijä arvosteli ravintolan, jota hakemistossa ei vielä ole. Listassa rivillä lukee UUSI ja\nravintolan nimi. Hyväksyntä luo samalla ravintolan.</p>\n<h2 id=\"uusi-ravintola-arvostelusta--askeleet\">Askeleet</h2>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/uusi-ravintola-arvostelusta-01-ehdotus.webp\" aria-label=\"Suurenna kuva: Uuden ravintolan ehdotus. 1: UUSI-rivi listassa. 2: Ehdotuksen tiedot. 4: Ravintola-kenttä. 5: Hyväksy ja luo ravintola.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/uusi-ravintola-arvostelusta-01-ehdotus.webp\" alt=\"Uuden ravintolan ehdotus. 1: UUSI-rivi listassa. 2: Ehdotuksen tiedot. 4: Ravintola-kenttä. 5: Hyväksy ja luo ravintola.\" width=\"1600\" height=\"1578\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol>\n<li>Valitse <strong>Tehtävät sinulle</strong> → <strong>Arvostelut odottavat hyväksyntää</strong> ja avaa UUSI-rivi. ①</li>\n<li>Tarkista laatikosta <strong>Kävijän ehdottama uusi ravintola</strong> kentät <strong>Nimi</strong>, <strong>Kaupunki</strong> ja <strong>Maa</strong>. ②\nKorjaa kirjoitusvirheet suoraan kenttiin.</li>\n<li>Lisää halutessasi <strong>Osoite tai verkkosivu</strong>.</li>\n<li>Onko ravintola jo hakemistossa toisella nimellä? Valitse se kenttään <strong>Ravintola</strong>. ④\nPaina silloin <strong>Julkaise</strong> ja lopeta tähän.</li>\n<li>Muuten paina oikeassa alakulmassa vihreää <strong>Hyväksy ja luo ravintola</strong>. ⑤</li>\n<li>Lue ikkunan teksti ja paina <strong>Vahvista</strong>.</li>\n<li>Jos ikkuna kertoi uudesta kaupungista, valitse sille maakunta.\nKatso <a href=\"/studio/ohjeet/uusi-kaupunki\" data-ohje-kortti=\"uusi-kaupunki\">Lisää uusi kaupunki</a>.</li>\n</ol>\n<h2 id=\"uusi-ravintola-arvostelusta--tulos\">Tulos</h2>\n<ul>\n<li>Ravintola on luotu, ja arvostelu on julkaistu sen sivulle.</li>\n<li>Ravintola näkyy sivustolla vasta, kun kaksi klubilaista on arvioinut sen. Siihen asti ravintolan\nalapalkissa on merkki <strong>Odottaa toista arvioijaa</strong>.</li>\n</ul>\n<h2 id=\"uusi-ravintola-arvostelusta--lisavalinnat\">Lisävalinnat</h2>\n<ul>\n<li>Saman illan toinen arvostelu samasta ravintolasta: paina taas <strong>Hyväksy ja luo ravintola</strong>.\nIkkuna kertoo, että ravintola on jo hakemistossa. Arvostelu liitetään siihen, eikä uutta synny.</li>\n<li>Jos nimet poikkeavat selvästi, esimerkiksi &quot;Savu&quot; ja &quot;Bistro Savu&quot;, hyväksy ensimmäinen.\nValitse toiselle kenttään <strong>Ravintola</strong> juuri luotu ravintola ja paina <strong>Julkaise</strong>.</li>\n<li>Ravintolan kuva, osoite ja muut tiedot: <a href=\"/studio/ohjeet/ravintolan-tiedot\" data-ohje-kortti=\"ravintolan-tiedot\">Täydennä ravintolan tiedot</a></li>\n</ul>\n<h2 id=\"uusi-ravintola-arvostelusta--jos-jokin-menee-vikaan\">Jos jokin menee vikaan</h2>\n<ul>\n<li>Keltainen &quot;Uusi ravintola … paina alareunan vihreää…&quot; kentässä <strong>Ravintola</strong>: normaali. Se\npoistuu, kun hyväksyt.</li>\n<li>Ikkunassa lukee &quot;Ravintolan luonti epäonnistui…&quot;: mitään ei julkaistu. Yritä hetken päästä\nuudelleen.</li>\n<li>Ravintola ei näy sivustolla: katso <a href=\"/studio/ohjeet/ravintola-ei-nay\" data-ohje-kortti=\"ravintola-ei-nay\">Ravintola ei näy</a>.</li>\n</ul>\n<p>Katso myös: <a href=\"/studio/ohjeet/arvostelun-hyvaksynta\" data-ohje-kortti=\"arvostelun-hyvaksynta\">Hyväksy tai hylkää arvostelu</a> · <a href=\"/studio/ohjeet/uusi-kaupunki\" data-ohje-kortti=\"uusi-kaupunki\">Lisää uusi kaupunki</a></p>\n",
          "teksti": "Milloin Kävijä arvosteli ravintolan, jota hakemistossa ei vielä ole. Listassa rivillä lukee UUSI ja ravintolan nimi. Hyväksyntä luo samalla ravintolan. Askeleet Valitse Tehtävät sinulle → Arvostelut odottavat hyväksyntää ja avaa UUSI-rivi. ① Tarkista laatikosta Kävijän ehdottama uusi ravintola kentät Nimi , Kaupunki ja Maa . ② Korjaa kirjoitusvirheet suoraan kenttiin. Lisää halutessasi Osoite tai verkkosivu . Onko ravintola jo hakemistossa toisella nimellä? Valitse se kenttään Ravintola . ④ Paina silloin Julkaise ja lopeta tähän. Muuten paina oikeassa alakulmassa vihreää Hyväksy ja luo ravintola . ⑤ Lue ikkunan teksti ja paina Vahvista . Jos ikkuna kertoi uudesta kaupungista, valitse sille maakunta. Katso Lisää uusi kaupunki . Tulos Ravintola on luotu, ja arvostelu on julkaistu sen sivulle. Ravintola näkyy sivustolla vasta, kun kaksi klubilaista on arvioinut sen. Siihen asti ravintolan alapalkissa on merkki Odottaa toista arvioijaa . Lisävalinnat Saman illan toinen arvostelu samasta ravintolasta: paina taas Hyväksy ja luo ravintola . Ikkuna kertoo, että ravintola on jo hakemistossa. Arvostelu liitetään siihen, eikä uutta synny. Jos nimet poikkeavat selvästi, esimerkiksi \"Savu\" ja \"Bistro Savu\", hyväksy ensimmäinen. Valitse toiselle kenttään Ravintola juuri luotu ravintola ja paina Julkaise . Ravintolan kuva, osoite ja muut tiedot: Täydennä ravintolan tiedot Jos jokin menee vikaan Keltainen \"Uusi ravintola … paina alareunan vihreää…\" kentässä Ravintola : normaali. Se poistuu, kun hyväksyt. Ikkunassa lukee \"Ravintolan luonti epäonnistui…\": mitään ei julkaistu. Yritä hetken päästä uudelleen. Ravintola ei näy sivustolla: katso Ravintola ei näy . Katso myös: Hyväksy tai hylkää arvostelu · Lisää uusi kaupunki",
          "otsikot": [
            {
              "id": "uusi-ravintola-arvostelusta--milloin",
              "teksti": "Milloin",
              "taso": 2
            },
            {
              "id": "uusi-ravintola-arvostelusta--askeleet",
              "teksti": "Askeleet",
              "taso": 2
            },
            {
              "id": "uusi-ravintola-arvostelusta--tulos",
              "teksti": "Tulos",
              "taso": 2
            },
            {
              "id": "uusi-ravintola-arvostelusta--lisavalinnat",
              "teksti": "Lisävalinnat",
              "taso": 2
            },
            {
              "id": "uusi-ravintola-arvostelusta--jos-jokin-menee-vikaan",
              "teksti": "Jos jokin menee vikaan",
              "taso": 2
            }
          ]
        },
        {
          "id": "ravintolan-tiedot",
          "otsikko": "Täydennä ravintolan tiedot",
          "osio": "ravintolat",
          "avainsanat": [
            "ravintola",
            "ravintolan tiedot",
            "kuva",
            "osoite",
            "puhelin",
            "verkkosivu",
            "tuomio",
            "plussat",
            "miinukset",
            "käynti",
            "käynnit",
            "lopettanut",
            "suljettu",
            "toiminta loppunut",
            "kartta",
            "hintaluokka"
          ],
          "tyypit": [
            "ravintola"
          ],
          "kesto": "noin 10 minuuttia",
          "paivitetty": "2026-10-08",
          "html": "<h2 id=\"ravintolan-tiedot--milloin\">Milloin</h2>\n<p>Kun ravintolan kortti tarvitsee kuvan, osoitteen tai sanallisen arvion. Tai kun ravintola on\nlopettanut. Arvosanaa et kirjoita tähän: se lasketaan klubilaisten pisteistä.</p>\n<h2 id=\"ravintolan-tiedot--askeleet\">Askeleet</h2>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/ravintolan-tiedot-01-valilehdet.webp\" aria-label=\"Suurenna kuva: Ravintolan lomake. 1: Kaikki ravintolat. 2: Perustiedot. 4: Arvostelu. 5: Sijainti.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/ravintolan-tiedot-01-valilehdet.webp\" alt=\"Ravintolan lomake. 1: Kaikki ravintolat. 2: Perustiedot. 4: Arvostelu. 5: Sijainti.\" width=\"1600\" height=\"800\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol>\n<li>Valitse <strong>Ravintolat</strong> → <strong>Kaikki ravintolat</strong> ja avaa ravintola. ①</li>\n<li>Välilehdellä <strong>Perustiedot</strong> täytä tarvittaessa <strong>Puhelin</strong>, <strong>Verkkosivut</strong> ja <strong>Hintaluokka</strong>. ②</li>\n<li>Lisää kuvat kenttään <strong>Kuvat</strong>. Ensimmäinen kuva näkyy kortissa.</li>\n<li>Välilehdellä <strong>Arvostelu</strong> kirjoita <strong>Tuomio yhdellä rivillä</strong> ja tarvittaessa\n<strong>Sanallinen arvostelu</strong>, <strong>Plussat</strong> ja <strong>Miinukset</strong>. ④</li>\n<li>Välilehdellä <strong>Sijainti</strong> tarkista <strong>Kaupunki</strong> ja täytä <strong>Katuosoite</strong> ja <strong>Postinumero</strong>. ⑤</li>\n<li>Oikeassa alakulmassa paina <strong>Julkaise</strong>.</li>\n</ol>\n<h2 id=\"ravintolan-tiedot--tulos\">Tulos</h2>\n<ul>\n<li>Ravintolan kortti ja sivu päivittyvät sivustolla noin minuutissa.</li>\n<li>Jos ravintola odottaa toista arvioijaa, tiedot näkyvät vasta, kun se tulee näkyviin.</li>\n</ul>\n<h2 id=\"ravintolan-tiedot--lisavalinnat\">Lisävalinnat</h2>\n<ul>\n<li>Ravintola on lopettanut: välilehdellä <strong>Perustiedot</strong> valitse <strong>Toiminta loppunut</strong>. Kirjoita\nhalutessasi <strong>Lisätieto lopettamisesta</strong>. Sivu säilyy, mutta se merkitään päättyneeksi.</li>\n<li>Klubin käynti: välilehdellä <strong>Arvostelu</strong> lisää päivä kohdan <strong>Käynnit</strong> alkuun. Uusin käynti\non ylimpänä. Kirjoita tarvittaessa <strong>Käynnin yhteys</strong>, esimerkiksi &quot;Jouluruokailu&quot;.</li>\n<li>Korttiin lyhyt otteluvinkki: <strong>Matka stadionille tai ottelu-yhteys</strong>, esimerkiksi &quot;15 min stadionille&quot;.</li>\n<li>Vinkit ottelupäivälle: <strong>Ottelupäivänä</strong>.</li>\n<li>Uusi ravintola ilman arvostelua: paina <strong>Kaikki ravintolat</strong> -listan yläreunassa plus-painiketta (+).\nTäytä <strong>Nimi</strong> ja paina kentän <strong>Osoite sivustolla</strong> vieressä <strong>Luo</strong>. Valitse välilehdellä\n<strong>Sijainti</strong> kenttään <strong>Kaupunki</strong> kaupunki: kirjoita nimen alkua ja valitse listasta.\nJulkaise ja lisää sitten <a href=\"/studio/ohjeet/klubilaisen-pisteet\" data-ohje-kortti=\"klubilaisen-pisteet\">klubilaisten pisteet</a>.</li>\n<li>Kartta: välilehden <strong>Sijainti</strong> kenttä <strong>Karttapaikka</strong> on valinnainen. Sen kenttien nimet ovat\nenglanniksi: Latitude on leveysaste ja Longitude pituusaste. Jätä Altitude tyhjäksi.</li>\n<li>Kuvan rajaus ja kuvaus: <a href=\"/studio/ohjeet/kuva\" data-ohje-kortti=\"kuva\">Kuva</a></li>\n</ul>\n<h2 id=\"ravintolan-tiedot--jos-jokin-menee-vikaan\">Jos jokin menee vikaan</h2>\n<ul>\n<li>Arvosanakentät ovat harmaita: ne lasketaan klubilaisten pisteistä. Muuta pisteitä kohdassa\n<strong>Ravintolat</strong> → <strong>Klubilaisten arvosanat</strong>.</li>\n<li>Punainen &quot;Järjestä käynnit uusin ensin: vedä uusin käynti listan alkuun.&quot;: raahaa uusin päivä\nlistan ylimmäksi.</li>\n<li>Keltainen &quot;Pidä tuomio lyhyenä…&quot;: tuomio on yli 90 merkkiä. Lyhennä sitä.</li>\n</ul>\n<p>Katso myös: <a href=\"/studio/ohjeet/klubilaisen-pisteet\" data-ohje-kortti=\"klubilaisen-pisteet\">Lisää klubilaisen pisteet</a> · <a href=\"/studio/ohjeet/uusi-kaupunki\" data-ohje-kortti=\"uusi-kaupunki\">Lisää uusi kaupunki</a></p>\n",
          "teksti": "Milloin Kun ravintolan kortti tarvitsee kuvan, osoitteen tai sanallisen arvion. Tai kun ravintola on lopettanut. Arvosanaa et kirjoita tähän: se lasketaan klubilaisten pisteistä. Askeleet Valitse Ravintolat → Kaikki ravintolat ja avaa ravintola. ① Välilehdellä Perustiedot täytä tarvittaessa Puhelin , Verkkosivut ja Hintaluokka . ② Lisää kuvat kenttään Kuvat . Ensimmäinen kuva näkyy kortissa. Välilehdellä Arvostelu kirjoita Tuomio yhdellä rivillä ja tarvittaessa Sanallinen arvostelu , Plussat ja Miinukset . ④ Välilehdellä Sijainti tarkista Kaupunki ja täytä Katuosoite ja Postinumero . ⑤ Oikeassa alakulmassa paina Julkaise . Tulos Ravintolan kortti ja sivu päivittyvät sivustolla noin minuutissa. Jos ravintola odottaa toista arvioijaa, tiedot näkyvät vasta, kun se tulee näkyviin. Lisävalinnat Ravintola on lopettanut: välilehdellä Perustiedot valitse Toiminta loppunut . Kirjoita halutessasi Lisätieto lopettamisesta . Sivu säilyy, mutta se merkitään päättyneeksi. Klubin käynti: välilehdellä Arvostelu lisää päivä kohdan Käynnit alkuun. Uusin käynti on ylimpänä. Kirjoita tarvittaessa Käynnin yhteys , esimerkiksi \"Jouluruokailu\". Korttiin lyhyt otteluvinkki: Matka stadionille tai ottelu-yhteys , esimerkiksi \"15 min stadionille\". Vinkit ottelupäivälle: Ottelupäivänä . Uusi ravintola ilman arvostelua: paina Kaikki ravintolat -listan yläreunassa plus-painiketta (+). Täytä Nimi ja paina kentän Osoite sivustolla vieressä Luo . Valitse välilehdellä Sijainti kenttään Kaupunki kaupunki: kirjoita nimen alkua ja valitse listasta. Julkaise ja lisää sitten klubilaisten pisteet . Kartta: välilehden Sijainti kenttä Karttapaikka on valinnainen. Sen kenttien nimet ovat englanniksi: Latitude on leveysaste ja Longitude pituusaste. Jätä Altitude tyhjäksi. Kuvan rajaus ja kuvaus: Kuva Jos jokin menee vikaan Arvosanakentät ovat harmaita: ne lasketaan klubilaisten pisteistä. Muuta pisteitä kohdassa Ravintolat → Klubilaisten arvosanat . Punainen \"Järjestä käynnit uusin ensin: vedä uusin käynti listan alkuun.\": raahaa uusin päivä listan ylimmäksi. Keltainen \"Pidä tuomio lyhyenä…\": tuomio on yli 90 merkkiä. Lyhennä sitä. Katso myös: Lisää klubilaisen pisteet · Lisää uusi kaupunki",
          "otsikot": [
            {
              "id": "ravintolan-tiedot--milloin",
              "teksti": "Milloin",
              "taso": 2
            },
            {
              "id": "ravintolan-tiedot--askeleet",
              "teksti": "Askeleet",
              "taso": 2
            },
            {
              "id": "ravintolan-tiedot--tulos",
              "teksti": "Tulos",
              "taso": 2
            },
            {
              "id": "ravintolan-tiedot--lisavalinnat",
              "teksti": "Lisävalinnat",
              "taso": 2
            },
            {
              "id": "ravintolan-tiedot--jos-jokin-menee-vikaan",
              "teksti": "Jos jokin menee vikaan",
              "taso": 2
            }
          ]
        },
        {
          "id": "uusi-kaupunki",
          "otsikko": "Lisää uusi kaupunki",
          "osio": "ravintolat",
          "avainsanat": [
            "kaupunki",
            "paikkakunta",
            "maakunta",
            "maa",
            "ulkomaat",
            "suodatin",
            "alue",
            "uusi kaupunki"
          ],
          "tyypit": [
            "kaupunki"
          ],
          "kesto": "noin 3 minuuttia",
          "paivitetty": "2026-10-08",
          "html": "<h2 id=\"uusi-kaupunki--milloin\">Milloin</h2>\n<p>Kun ravintola tai stadion on kaupungissa, jota listassa ei vielä ole. Kaupunki näkyy ravintolasivun\nsuodattimissa, kun sinne on julkaistu ensimmäinen ravintola.</p>\n<h2 id=\"uusi-kaupunki--askeleet\">Askeleet</h2>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/uusi-kaupunki-01-lomake.webp\" aria-label=\"Suurenna kuva: Uusi kaupunki. 1: Kaupungit. 3: Nimi. 4: Osoite suodattimessa ja Luo. 5: Maa. 6: Maakunta.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/uusi-kaupunki-01-lomake.webp\" alt=\"Uusi kaupunki. 1: Kaupungit. 3: Nimi. 4: Osoite suodattimessa ja Luo. 5: Maa. 6: Maakunta.\" width=\"1600\" height=\"1000\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol>\n<li>Valitse <strong>Ravintolat</strong> ja sitten <strong>Kaupungit</strong>. ①</li>\n<li>Paina listan yläreunassa plus-painiketta (+).</li>\n<li>Kirjoita <strong>Nimi</strong> suomeksi, esimerkiksi &quot;Jyväskylä&quot; tai &quot;Tukholma&quot;. ③</li>\n<li>Kentän <strong>Osoite suodattimessa</strong> vieressä paina <strong>Luo</strong>. ④</li>\n<li>Tarkista <strong>Maa</strong>. Valmiina on &quot;Suomi&quot;. ⑤\nKirjoita maa aina samalla tavalla: &quot;Saksa&quot;, &quot;Alankomaat&quot;, &quot;Iso-Britannia&quot;, &quot;Tšekki&quot;.</li>\n<li>Suomen kaupungille valitse <strong>Maakunta</strong>. ⑥\nKylälle valitaan sen kunnan maakunta, esimerkiksi Vääksy: Päijät-Häme.</li>\n<li>Oikeassa alakulmassa paina <strong>Julkaise</strong>.</li>\n</ol>\n<h2 id=\"uusi-kaupunki--tulos\">Tulos</h2>\n<ul>\n<li>Kaupunki on valittavissa ravintolan ja stadionin kentässä <strong>Kaupunki</strong>.</li>\n<li>Ravintolasivun alue- ja kaupunkivalikot päivittyvät itsestään.</li>\n</ul>\n<h2 id=\"uusi-kaupunki--lisavalinnat\">Lisävalinnat</h2>\n<ul>\n<li>Ravintola, jonka kaupunkia ei tiedetä, esimerkiksi laivalla: tee kaupunki maan nimellä, esimerkiksi &quot;Ruotsi&quot;.</li>\n<li><strong>Hyväksy ja luo ravintola</strong> voi luoda kaupungin itse. Avaa se silloin tästä listasta ja valitse maakunta.</li>\n</ul>\n<h2 id=\"uusi-kaupunki--jos-jokin-menee-vikaan\">Jos jokin menee vikaan</h2>\n<ul>\n<li>Keltainen &quot;Valitse maakunta, jotta kaupungin ravintolat löytyvät maakuntasuodattimella.&quot;:\nvalitse <strong>Maakunta</strong>.</li>\n<li>Punainen &quot;Kirjoita maan nimi isolla alkukirjaimella…&quot;: korjaa maan nimi, esimerkiksi &quot;Saksa&quot;.</li>\n<li>Kaupunki puuttuu maakuntavalikosta: tarkista kaupungin <strong>Maakunta</strong>.</li>\n</ul>\n<p>Katso myös: <a href=\"/studio/ohjeet/ravintolan-tiedot\" data-ohje-kortti=\"ravintolan-tiedot\">Täydennä ravintolan tiedot</a> · <a href=\"/studio/ohjeet/stadion\" data-ohje-kortti=\"stadion\">Lisää stadion</a></p>\n",
          "teksti": "Milloin Kun ravintola tai stadion on kaupungissa, jota listassa ei vielä ole. Kaupunki näkyy ravintolasivun suodattimissa, kun sinne on julkaistu ensimmäinen ravintola. Askeleet Valitse Ravintolat ja sitten Kaupungit . ① Paina listan yläreunassa plus-painiketta (+). Kirjoita Nimi suomeksi, esimerkiksi \"Jyväskylä\" tai \"Tukholma\". ③ Kentän Osoite suodattimessa vieressä paina Luo . ④ Tarkista Maa . Valmiina on \"Suomi\". ⑤ Kirjoita maa aina samalla tavalla: \"Saksa\", \"Alankomaat\", \"Iso-Britannia\", \"Tšekki\". Suomen kaupungille valitse Maakunta . ⑥ Kylälle valitaan sen kunnan maakunta, esimerkiksi Vääksy: Päijät-Häme. Oikeassa alakulmassa paina Julkaise . Tulos Kaupunki on valittavissa ravintolan ja stadionin kentässä Kaupunki . Ravintolasivun alue- ja kaupunkivalikot päivittyvät itsestään. Lisävalinnat Ravintola, jonka kaupunkia ei tiedetä, esimerkiksi laivalla: tee kaupunki maan nimellä, esimerkiksi \"Ruotsi\". Hyväksy ja luo ravintola voi luoda kaupungin itse. Avaa se silloin tästä listasta ja valitse maakunta. Jos jokin menee vikaan Keltainen \"Valitse maakunta, jotta kaupungin ravintolat löytyvät maakuntasuodattimella.\": valitse Maakunta . Punainen \"Kirjoita maan nimi isolla alkukirjaimella…\": korjaa maan nimi, esimerkiksi \"Saksa\". Kaupunki puuttuu maakuntavalikosta: tarkista kaupungin Maakunta . Katso myös: Täydennä ravintolan tiedot · Lisää stadion",
          "otsikot": [
            {
              "id": "uusi-kaupunki--milloin",
              "teksti": "Milloin",
              "taso": 2
            },
            {
              "id": "uusi-kaupunki--askeleet",
              "teksti": "Askeleet",
              "taso": 2
            },
            {
              "id": "uusi-kaupunki--tulos",
              "teksti": "Tulos",
              "taso": 2
            },
            {
              "id": "uusi-kaupunki--lisavalinnat",
              "teksti": "Lisävalinnat",
              "taso": 2
            },
            {
              "id": "uusi-kaupunki--jos-jokin-menee-vikaan",
              "teksti": "Jos jokin menee vikaan",
              "taso": 2
            }
          ]
        },
        {
          "id": "arvostelulomake-klubilaisille",
          "otsikko": "Jaa arvostelulomake klubilaisille",
          "osio": "ravintolat",
          "avainsanat": [
            "arvostelulomake",
            "lomake",
            "arvostele",
            "puhelin",
            "kotinäyttö",
            "sovellus",
            "kuvake",
            "linkki",
            "klubilainen",
            "uusi klubilainen",
            "nimi lomakkeella",
            "lopettanut"
          ],
          "tyypit": [
            "klubilainen"
          ],
          "kesto": "noin 5 minuuttia",
          "paivitetty": "2026-10-08",
          "html": "<h2 id=\"arvostelulomake-klubilaisille--milloin\">Milloin</h2>\n<p>Klubilaiset arvostelevat ravintolat puhelimella sivuston lomakkeella. Lähetä heille linkki, ja\npidä klubilaisten nimilista ajan tasalla. Lomakkeelta tulleet arvostelut odottavat hyväksyntääsi.</p>\n<h2 id=\"arvostelulomake-klubilaisille--askeleet\">Askeleet</h2>\n<ol>\n<li>Lähetä klubilaisille osoite <a href=\"https://www.lahdensuomalainenklubi.com/ravintolat/arvostele\" target=\"_blank\" rel=\"noopener noreferrer\">https://www.lahdensuomalainenklubi.com/ravintolat/arvostele</a>\nesimerkiksi sähköpostilla tai viestillä.</li>\n<li>Neuvo heitä lisäämään lomake puhelimen kotinäyttöön. Lomake aukeaa silloin kuin sovellus.\n<ul>\n<li>Androidissa: lähetetyn arvostelun jälkeen lomake näyttää painikkeen &quot;Lisää kotinäyttöön&quot;.</li>\n<li>iPhonessa: Safarin Jaa-painike ja sitten &quot;Lisää Koti-valikkoon&quot;.</li>\n</ul>\n</li>\n<li>Klubilainen valitsee ensimmäisellä kerralla nimensä listasta. Puhelin muistaa sen.</li>\n</ol>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/arvostelulomake-klubilaisille-01-klubilaiset.webp\" aria-label=\"Suurenna kuva: Klubilaisen lomake. 4: Klubilaiset. 5: Nimi. 6: Näytä arvostelulomakkeella.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/arvostelulomake-klubilaisille-01-klubilaiset.webp\" alt=\"Klubilaisen lomake. 4: Klubilaiset. 5: Nimi. 6: Näytä arvostelulomakkeella.\" width=\"1600\" height=\"800\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol start=\"4\">\n<li>Uusi klubilainen: valitse Studiossa <strong>Ravintolat</strong> → <strong>Klubilaiset</strong> ja paina plus-painiketta (+). ④</li>\n<li>Kirjoita <strong>Nimi</strong>, esimerkiksi &quot;Mikko K.&quot;. ⑤</li>\n<li>Varmista, että kytkin <strong>Näytä arvostelulomakkeella</strong> on päällä (tumma). Se on valmiiksi päällä.\nPaina oikeassa alakulmassa <strong>Julkaise</strong>. ⑥</li>\n</ol>\n<h2 id=\"arvostelulomake-klubilaisille--tulos\">Tulos</h2>\n<ul>\n<li>Uusi nimi näkyy heti lomakkeen nimilistassa.</li>\n<li>Lähetetyt arvostelut tulevat Studioon kohtaan <strong>Tehtävät sinulle</strong> → <strong>Arvostelut odottavat hyväksyntää</strong>.</li>\n</ul>\n<h2 id=\"arvostelulomake-klubilaisille--lisavalinnat\">Lisävalinnat</h2>\n<ul>\n<li>Klubilainen lopettaa: avaa hänet, käännä kytkin <strong>Näytä arvostelulomakkeella</strong> pois päältä ja paina\n<strong>Julkaise</strong>. Nimi poistuu lomakkeelta, mutta vanhat arvosanat säilyvät.</li>\n<li>Klubilaista ei voi poistaa, koska ravintoloiden arvosanat viittaavat häneen.</li>\n<li>Ravintolasivulla on myös painike &quot;Lähetä oma arvostelu&quot;. Toista arvioijaa odottavat paikat näkyvät\nosoitteessa <a href=\"https://www.lahdensuomalainenklubi.com/ravintolat/odottavat\" target=\"_blank\" rel=\"noopener noreferrer\">https://www.lahdensuomalainenklubi.com/ravintolat/odottavat</a>.</li>\n</ul>\n<h2 id=\"arvostelulomake-klubilaisille--jos-jokin-menee-vikaan\">Jos jokin menee vikaan</h2>\n<ul>\n<li>Punainen &quot;Samanniminen klubilainen on jo olemassa…&quot;: lisää sukunimen alkukirjain, esimerkiksi &quot;Mikko K.&quot;.</li>\n<li>Klubilainen valitsi lomakkeella väärän nimen: korjaa kenttä <strong>Klubilainen</strong> arvostelussa ennen\nhyväksyntää. Katso <a href=\"/studio/ohjeet/arvostelun-hyvaksynta\" data-ohje-kortti=\"arvostelun-hyvaksynta\">Hyväksy tai hylkää arvostelu</a>.</li>\n</ul>\n<p>Katso myös: <a href=\"/studio/ohjeet/arvostelun-hyvaksynta\" data-ohje-kortti=\"arvostelun-hyvaksynta\">Hyväksy tai hylkää arvostelu</a> · <a href=\"/studio/ohjeet/klubilaisen-pisteet\" data-ohje-kortti=\"klubilaisen-pisteet\">Lisää klubilaisen pisteet</a></p>\n",
          "teksti": "Milloin Klubilaiset arvostelevat ravintolat puhelimella sivuston lomakkeella. Lähetä heille linkki, ja pidä klubilaisten nimilista ajan tasalla. Lomakkeelta tulleet arvostelut odottavat hyväksyntääsi. Askeleet Lähetä klubilaisille osoite https://www.lahdensuomalainenklubi.com/ravintolat/arvostele esimerkiksi sähköpostilla tai viestillä. Neuvo heitä lisäämään lomake puhelimen kotinäyttöön. Lomake aukeaa silloin kuin sovellus. Androidissa: lähetetyn arvostelun jälkeen lomake näyttää painikkeen \"Lisää kotinäyttöön\". iPhonessa: Safarin Jaa-painike ja sitten \"Lisää Koti-valikkoon\". Klubilainen valitsee ensimmäisellä kerralla nimensä listasta. Puhelin muistaa sen. Uusi klubilainen: valitse Studiossa Ravintolat → Klubilaiset ja paina plus-painiketta (+). ④ Kirjoita Nimi , esimerkiksi \"Mikko K.\". ⑤ Varmista, että kytkin Näytä arvostelulomakkeella on päällä (tumma). Se on valmiiksi päällä. Paina oikeassa alakulmassa Julkaise . ⑥ Tulos Uusi nimi näkyy heti lomakkeen nimilistassa. Lähetetyt arvostelut tulevat Studioon kohtaan Tehtävät sinulle → Arvostelut odottavat hyväksyntää . Lisävalinnat Klubilainen lopettaa: avaa hänet, käännä kytkin Näytä arvostelulomakkeella pois päältä ja paina Julkaise . Nimi poistuu lomakkeelta, mutta vanhat arvosanat säilyvät. Klubilaista ei voi poistaa, koska ravintoloiden arvosanat viittaavat häneen. Ravintolasivulla on myös painike \"Lähetä oma arvostelu\". Toista arvioijaa odottavat paikat näkyvät osoitteessa https://www.lahdensuomalainenklubi.com/ravintolat/odottavat . Jos jokin menee vikaan Punainen \"Samanniminen klubilainen on jo olemassa…\": lisää sukunimen alkukirjain, esimerkiksi \"Mikko K.\". Klubilainen valitsi lomakkeella väärän nimen: korjaa kenttä Klubilainen arvostelussa ennen hyväksyntää. Katso Hyväksy tai hylkää arvostelu . Katso myös: Hyväksy tai hylkää arvostelu · Lisää klubilaisen pisteet",
          "otsikot": [
            {
              "id": "arvostelulomake-klubilaisille--milloin",
              "teksti": "Milloin",
              "taso": 2
            },
            {
              "id": "arvostelulomake-klubilaisille--askeleet",
              "teksti": "Askeleet",
              "taso": 2
            },
            {
              "id": "arvostelulomake-klubilaisille--tulos",
              "teksti": "Tulos",
              "taso": 2
            },
            {
              "id": "arvostelulomake-klubilaisille--lisavalinnat",
              "teksti": "Lisävalinnat",
              "taso": 2
            },
            {
              "id": "arvostelulomake-klubilaisille--jos-jokin-menee-vikaan",
              "teksti": "Jos jokin menee vikaan",
              "taso": 2
            }
          ]
        }
      ]
    },
    {
      "id": "ottelut",
      "otsikko": "Ottelut ja tapahtumat",
      "kortit": [
        {
          "id": "ottelun-lisaaminen",
          "otsikko": "Lisää ottelu otteluohjelmaan",
          "osio": "ottelut",
          "avainsanat": [
            "ottelu",
            "otteluohjelma",
            "peli",
            "maaottelu",
            "Huuhkajat",
            "Suomi",
            "laskuri",
            "klubi paikalla",
            "vierasmatka",
            "matka",
            "cup",
            "FC Lahti"
          ],
          "tyypit": [
            "ottelu"
          ],
          "kesto": "noin 3 minuuttia",
          "paivitetty": "2026-10-08",
          "html": "<h2 id=\"ottelun-lisaaminen--milloin\">Milloin</h2>\n<p>Veikkausliigan ottelut tulevat otteluohjelmaan itsestään. Lisää käsin maajoukkueen ottelut ja\nottelut, joihin klubi lähtee. Ottelut näkyvät etusivulla ja Ottelut-sivulla.</p>\n<h2 id=\"ottelun-lisaaminen--askeleet\">Askeleet</h2>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/ottelun-lisaaminen-01-lomake.webp\" aria-label=\"Suurenna kuva: Uusi ottelu. 1: Ottelut. 2: Plus-painike. 3: Alkamisaika. 4: Kotijoukkue. 7: Klubi paikalla ja Vierasmatka.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/ottelun-lisaaminen-01-lomake.webp\" alt=\"Uusi ottelu. 1: Ottelut. 2: Plus-painike. 3: Alkamisaika. 4: Kotijoukkue. 7: Klubi paikalla ja Vierasmatka.\" width=\"1600\" height=\"1414\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol>\n<li>Vasemmasta valikosta valitse <strong>Ottelut</strong>. ①</li>\n<li>Paina listan yläreunassa plus-painiketta (+). ②</li>\n<li>Kentän <strong>Alkamisaika</strong> oikeassa reunassa paina kalenterikuvaketta. Valitse päivä ja kirjoita\nkellonaika kalenterin alareunaan. ③\nVoit myös kirjoittaa ajan suoraan kenttään muodossa 2026-10-20 19:00. Muoto 20.10.2026 ei käy.</li>\n<li>Kirjoita kenttään <strong>Kotijoukkue</strong> nimen alkua ja valitse ehdotus listasta. ④\nSuomen miesten maajoukkue on tasan &quot;Suomi&quot;.</li>\n<li>Tee samoin kentässä <strong>Vierasjoukkue</strong>.</li>\n<li>Täytä halutessasi <strong>Kilpailu</strong> ja <strong>Stadion</strong>.</li>\n<li>Jos klubi on katsomossa, käännä kytkin <strong>Klubi paikalla</strong> päälle. Yhteiselle matkalle käännä\npäälle <strong>Vierasmatka</strong>. ⑦</li>\n<li>Oikeassa alakulmassa paina <strong>Julkaise</strong>.</li>\n</ol>\n<h2 id=\"ottelun-lisaaminen--tulos\">Tulos</h2>\n<ul>\n<li>Ottelu näkyy etusivulla ja Ottelut-sivulla noin minuutissa.</li>\n<li>Huuhkajien ottelu korostetaan. Etusivun laskuri siirtyy siihen itsestään, jos se on seuraava.</li>\n<li>Suomen kotiottelu saa merkinnän Klubi paikalla itsestään.</li>\n<li>Pelattu ottelu poistuu otteluohjelmasta pari tuntia alkamisen jälkeen.</li>\n</ul>\n<h2 id=\"ottelun-lisaaminen--lisavalinnat\">Lisävalinnat</h2>\n<ul>\n<li>Merkintä Veikkausliigan otteluun: lisää ottelu samalla päivällä ja samoilla joukkueilla ja\nvalitse <strong>Klubi paikalla</strong> tai <strong>Vierasmatka</strong>. Merkintä yhdistyy automaattiseen otteluun.</li>\n<li>Ajan muutos: avaa ottelu listasta, muuta <strong>Alkamisaika</strong> ja paina <strong>Julkaise</strong>.</li>\n<li>Peruttu ottelu: avaa <strong>Julkaise</strong>-painikkeen vierestä valikko <strong>Asiakirjatoiminnot</strong> ja valitse <strong>Poista</strong>.\nVahvista painamalla <strong>Poista nyt</strong>.</li>\n<li>Muiden seurojen ottelut etusivulle: katso <a href=\"/studio/ohjeet/etusivu-ylaosa\" data-ohje-kortti=\"etusivu-ylaosa\">Etusivu</a>.</li>\n</ul>\n<h2 id=\"ottelun-lisaaminen--jos-jokin-menee-vikaan\">Jos jokin menee vikaan</h2>\n<ul>\n<li>Keltainen &quot;Tarkoititko &quot;FC Lahti&quot;?…&quot;: korjaa nimi ehdotuksen mukaiseksi. Muuten merkintä ei\nyhdisty oikeaan otteluun. Muiden maiden nimet, esimerkiksi &quot;Albania&quot;, ovat kunnossa.</li>\n<li><strong>Alkamisaika</strong> on punainen: aika on väärässä muodossa. Valitse se kalenterista.</li>\n<li>Ottelu ei näy: tarkista, että painoit <strong>Julkaise</strong>. Lomakkeen yläreunassa lukee\n&quot;Ottelu on jo pelattu…&quot;, jos aika on mennyt.</li>\n<li>Muut Suomen joukkueet: kirjoita tarkenne, esimerkiksi &quot;Suomi (naiset)&quot; tai &quot;Suomi U21&quot;.</li>\n</ul>\n<p>Katso myös: <a href=\"/studio/ohjeet/tapahtuman-lisaaminen\" data-ohje-kortti=\"tapahtuman-lisaaminen\">Lisää tapahtuma</a> · <a href=\"/studio/ohjeet/muutos-ei-nay-sivustolla\" data-ohje-kortti=\"muutos-ei-nay-sivustolla\">Muutos ei näy sivustolla</a></p>\n",
          "teksti": "Milloin Veikkausliigan ottelut tulevat otteluohjelmaan itsestään. Lisää käsin maajoukkueen ottelut ja ottelut, joihin klubi lähtee. Ottelut näkyvät etusivulla ja Ottelut-sivulla. Askeleet Vasemmasta valikosta valitse Ottelut . ① Paina listan yläreunassa plus-painiketta (+). ② Kentän Alkamisaika oikeassa reunassa paina kalenterikuvaketta. Valitse päivä ja kirjoita kellonaika kalenterin alareunaan. ③ Voit myös kirjoittaa ajan suoraan kenttään muodossa 2026-10-20 19:00. Muoto 20.10.2026 ei käy. Kirjoita kenttään Kotijoukkue nimen alkua ja valitse ehdotus listasta. ④ Suomen miesten maajoukkue on tasan \"Suomi\". Tee samoin kentässä Vierasjoukkue . Täytä halutessasi Kilpailu ja Stadion . Jos klubi on katsomossa, käännä kytkin Klubi paikalla päälle. Yhteiselle matkalle käännä päälle Vierasmatka . ⑦ Oikeassa alakulmassa paina Julkaise . Tulos Ottelu näkyy etusivulla ja Ottelut-sivulla noin minuutissa. Huuhkajien ottelu korostetaan. Etusivun laskuri siirtyy siihen itsestään, jos se on seuraava. Suomen kotiottelu saa merkinnän Klubi paikalla itsestään. Pelattu ottelu poistuu otteluohjelmasta pari tuntia alkamisen jälkeen. Lisävalinnat Merkintä Veikkausliigan otteluun: lisää ottelu samalla päivällä ja samoilla joukkueilla ja valitse Klubi paikalla tai Vierasmatka . Merkintä yhdistyy automaattiseen otteluun. Ajan muutos: avaa ottelu listasta, muuta Alkamisaika ja paina Julkaise . Peruttu ottelu: avaa Julkaise -painikkeen vierestä valikko Asiakirjatoiminnot ja valitse Poista . Vahvista painamalla Poista nyt . Muiden seurojen ottelut etusivulle: katso Etusivu . Jos jokin menee vikaan Keltainen \"Tarkoititko \"FC Lahti\"?…\": korjaa nimi ehdotuksen mukaiseksi. Muuten merkintä ei yhdisty oikeaan otteluun. Muiden maiden nimet, esimerkiksi \"Albania\", ovat kunnossa. Alkamisaika on punainen: aika on väärässä muodossa. Valitse se kalenterista. Ottelu ei näy: tarkista, että painoit Julkaise . Lomakkeen yläreunassa lukee \"Ottelu on jo pelattu…\", jos aika on mennyt. Muut Suomen joukkueet: kirjoita tarkenne, esimerkiksi \"Suomi (naiset)\" tai \"Suomi U21\". Katso myös: Lisää tapahtuma · Muutos ei näy sivustolla",
          "otsikot": [
            {
              "id": "ottelun-lisaaminen--milloin",
              "teksti": "Milloin",
              "taso": 2
            },
            {
              "id": "ottelun-lisaaminen--askeleet",
              "teksti": "Askeleet",
              "taso": 2
            },
            {
              "id": "ottelun-lisaaminen--tulos",
              "teksti": "Tulos",
              "taso": 2
            },
            {
              "id": "ottelun-lisaaminen--lisavalinnat",
              "teksti": "Lisävalinnat",
              "taso": 2
            },
            {
              "id": "ottelun-lisaaminen--jos-jokin-menee-vikaan",
              "teksti": "Jos jokin menee vikaan",
              "taso": 2
            }
          ]
        },
        {
          "id": "tapahtuman-lisaaminen",
          "otsikko": "Lisää tapahtuma",
          "osio": "ottelut",
          "avainsanat": [
            "tapahtuma",
            "tilaisuus",
            "juhla",
            "vuosijuhla",
            "kokous",
            "ilmoittautuminen",
            "kutsu",
            "kalenteri",
            "matka",
            "illanvietto"
          ],
          "tyypit": [
            "tapahtuma"
          ],
          "kesto": "noin 10 minuuttia",
          "paivitetty": "2026-10-08",
          "html": "<h2 id=\"tapahtuman-lisaaminen--milloin\">Milloin</h2>\n<p>Kun klubi järjestää tilaisuuden, esimerkiksi illanvieton, matkan tai vuosijuhlan.\nTapahtuma näkyy etusivulla ja Tapahtumat-sivulla, kunnes se on ohi.</p>\n<h2 id=\"tapahtuman-lisaaminen--askeleet\">Askeleet</h2>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/tapahtuman-lisaaminen-01-lomake.webp\" aria-label=\"Suurenna kuva: Uusi tapahtuma. 1: Tapahtumat. 3: Tapahtuman nimi. 5: Alkamisaika. 9: Välilehti Ilmoittautuminen.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/tapahtuman-lisaaminen-01-lomake.webp\" alt=\"Uusi tapahtuma. 1: Tapahtumat. 3: Tapahtuman nimi. 5: Alkamisaika. 9: Välilehti Ilmoittautuminen.\" width=\"1600\" height=\"1101\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol>\n<li>Vasemmasta valikosta valitse <strong>Tapahtumat</strong>. ①</li>\n<li>Paina listan yläreunassa plus-painiketta (+).</li>\n<li>Kirjoita <strong>Tapahtuman nimi</strong>. ③</li>\n<li>Kentän <strong>Osoite sivustolla</strong> vieressä paina <strong>Luo</strong>.</li>\n<li>Valitse <strong>Alkamisaika</strong> kentän kalenterikuvakkeesta. Halutessasi valitse myös <strong>Päättymisaika</strong>. ⑤</li>\n<li>Kirjoita <strong>Paikka</strong>, esimerkiksi &quot;Klubin tila, Lahti&quot;.</li>\n<li>Kohdassa <strong>Kansikuva</strong> paina <strong>Lataa</strong> ja valitse kuva tietokoneelta. Kirjoita kuvalle\n<strong>Vaihtoehtoinen teksti (alt)</strong>.</li>\n<li>Kirjoita kenttään <strong>Kuvaus</strong> kutsun teksti.</li>\n<li>Jos ilmoittautuminen tarvitaan, valitse välilehti <strong>Ilmoittautuminen</strong>. ⑨\nTäytä <strong>Ilmoittautumislinkki</strong> tai <strong>Ilmoittautumis-sähköposti</strong>.</li>\n<li>Oikeassa alakulmassa paina <strong>Julkaise</strong>.</li>\n</ol>\n<h2 id=\"tapahtuman-lisaaminen--tulos\">Tulos</h2>\n<ul>\n<li>Tapahtuma näkyy etusivulla ja Tapahtumat-sivulla noin minuutissa.</li>\n<li>Tapahtuman sivulla on painike &quot;Lisää kalenteriin&quot;. Kävijä saa tapahtuman omaan kalenteriinsa.</li>\n<li>Tapahtuma poistuu tulevista, kun se on ohi.</li>\n</ul>\n<h2 id=\"tapahtuman-lisaaminen--lisavalinnat\">Lisävalinnat</h2>\n<ul>\n<li><strong>Juhlatapahtuma</strong>: valitse vain juhlille ja merkkipäiville. Kortti saa messinginvärisen korostuksen. Käytä harvoin.</li>\n<li>Jaettava kuva: kansikuva näkyy, kun linkki jaetaan WhatsAppissa tai Facebookissa. Käytä\nvaakakuvaa, jonka tärkein kohta on keskellä. Katso <a href=\"/studio/ohjeet/jakokuva\" data-ohje-kortti=\"jakokuva\">Jakokuva</a>.</li>\n<li>Ensimmäinen tapahtuma: Tapahtumat näkyy valikossa vasta, kun lisäät sen sinne. Katso\n<a href=\"/studio/ohjeet/valikko-ja-alatunniste\" data-ohje-kortti=\"valikko-ja-alatunniste\">Valikko ja alatunniste</a>.</li>\n</ul>\n<h2 id=\"tapahtuman-lisaaminen--jos-jokin-menee-vikaan\">Jos jokin menee vikaan</h2>\n<ul>\n<li><strong>Julkaise</strong> ei onnistu: <strong>Tapahtuman nimi</strong>, <strong>Osoite sivustolla</strong>, <strong>Alkamisaika</strong> ja\n<strong>Kuvaus</strong> ovat pakollisia.</li>\n<li>Punainen &quot;Päättymisaika ei voi olla ennen alkamisaikaa.&quot;: tarkista ajat.</li>\n<li>Punainen &quot;Alt-teksti on pakollinen (3–200 merkkiä).&quot;: kirjoita kansikuvalle kuvaus.</li>\n</ul>\n<p>Katso myös: <a href=\"/studio/ohjeet/kuva\" data-ohje-kortti=\"kuva\">Kuva</a> · <a href=\"/studio/ohjeet/galleria-albumi\" data-ohje-kortti=\"galleria-albumi\">Lisää kuva-albumi</a> · <a href=\"/studio/ohjeet/ottelun-lisaaminen\" data-ohje-kortti=\"ottelun-lisaaminen\">Lisää ottelu</a></p>\n",
          "teksti": "Milloin Kun klubi järjestää tilaisuuden, esimerkiksi illanvieton, matkan tai vuosijuhlan. Tapahtuma näkyy etusivulla ja Tapahtumat-sivulla, kunnes se on ohi. Askeleet Vasemmasta valikosta valitse Tapahtumat . ① Paina listan yläreunassa plus-painiketta (+). Kirjoita Tapahtuman nimi . ③ Kentän Osoite sivustolla vieressä paina Luo . Valitse Alkamisaika kentän kalenterikuvakkeesta. Halutessasi valitse myös Päättymisaika . ⑤ Kirjoita Paikka , esimerkiksi \"Klubin tila, Lahti\". Kohdassa Kansikuva paina Lataa ja valitse kuva tietokoneelta. Kirjoita kuvalle Vaihtoehtoinen teksti (alt) . Kirjoita kenttään Kuvaus kutsun teksti. Jos ilmoittautuminen tarvitaan, valitse välilehti Ilmoittautuminen . ⑨ Täytä Ilmoittautumislinkki tai Ilmoittautumis-sähköposti . Oikeassa alakulmassa paina Julkaise . Tulos Tapahtuma näkyy etusivulla ja Tapahtumat-sivulla noin minuutissa. Tapahtuman sivulla on painike \"Lisää kalenteriin\". Kävijä saa tapahtuman omaan kalenteriinsa. Tapahtuma poistuu tulevista, kun se on ohi. Lisävalinnat Juhlatapahtuma : valitse vain juhlille ja merkkipäiville. Kortti saa messinginvärisen korostuksen. Käytä harvoin. Jaettava kuva: kansikuva näkyy, kun linkki jaetaan WhatsAppissa tai Facebookissa. Käytä vaakakuvaa, jonka tärkein kohta on keskellä. Katso Jakokuva . Ensimmäinen tapahtuma: Tapahtumat näkyy valikossa vasta, kun lisäät sen sinne. Katso Valikko ja alatunniste . Jos jokin menee vikaan Julkaise ei onnistu: Tapahtuman nimi , Osoite sivustolla , Alkamisaika ja Kuvaus ovat pakollisia. Punainen \"Päättymisaika ei voi olla ennen alkamisaikaa.\": tarkista ajat. Punainen \"Alt-teksti on pakollinen (3–200 merkkiä).\": kirjoita kansikuvalle kuvaus. Katso myös: Kuva · Lisää kuva-albumi · Lisää ottelu",
          "otsikot": [
            {
              "id": "tapahtuman-lisaaminen--milloin",
              "teksti": "Milloin",
              "taso": 2
            },
            {
              "id": "tapahtuman-lisaaminen--askeleet",
              "teksti": "Askeleet",
              "taso": 2
            },
            {
              "id": "tapahtuman-lisaaminen--tulos",
              "teksti": "Tulos",
              "taso": 2
            },
            {
              "id": "tapahtuman-lisaaminen--lisavalinnat",
              "teksti": "Lisävalinnat",
              "taso": 2
            },
            {
              "id": "tapahtuman-lisaaminen--jos-jokin-menee-vikaan",
              "teksti": "Jos jokin menee vikaan",
              "taso": 2
            }
          ]
        },
        {
          "id": "galleria-albumi",
          "otsikko": "Lisää kuva-albumi galleriaan",
          "osio": "ottelut",
          "avainsanat": [
            "galleria",
            "albumi",
            "kuvat",
            "valokuvat",
            "kuva-albumi",
            "kuvagalleria",
            "tapahtuman kuvat",
            "matkan kuvat"
          ],
          "tyypit": [
            "galleriaAlbumi"
          ],
          "kesto": "noin 10 minuuttia",
          "paivitetty": "2026-10-08",
          "html": "<h2 id=\"galleria-albumi--milloin\">Milloin</h2>\n<p>Kun haluat näyttää tapahtuman tai matkan kuvat sivuston galleriassa. Albumi saa oman sivunsa.</p>\n<h2 id=\"galleria-albumi--ennen-kuin-aloitat\">Ennen kuin aloitat</h2>\n<ul>\n<li>Kokoa albumin kuvat yhteen kansioon tietokoneelle.</li>\n</ul>\n<h2 id=\"galleria-albumi--askeleet\">Askeleet</h2>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/galleria-albumi-01-lomake.webp\" aria-label=\"Suurenna kuva: Uusi albumi. 1: Galleria-albumit. 3: Albumin nimi. 6: Kansikuva. 7: Kuvat-kenttä.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/galleria-albumi-01-lomake.webp\" alt=\"Uusi albumi. 1: Galleria-albumit. 3: Albumin nimi. 6: Kansikuva. 7: Kuvat-kenttä.\" width=\"1600\" height=\"2063\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol>\n<li>Vasemmasta valikosta valitse <strong>Galleria-albumit</strong>. ①</li>\n<li>Paina listan yläreunassa plus-painiketta (+).</li>\n<li>Kirjoita <strong>Albumin nimi</strong>, esimerkiksi &quot;Vappu 2026&quot;. ③</li>\n<li>Kentän <strong>Osoite sivustolla</strong> vieressä paina <strong>Luo</strong>.</li>\n<li>Valitse <strong>Päivämäärä</strong>. Halutessasi valitse <strong>Liittyvä tapahtuma (valinnainen)</strong>.</li>\n<li>Kohdassa <strong>Kansikuva</strong> paina <strong>Lataa</strong> ja valitse kuva. Kirjoita sille <strong>Vaihtoehtoinen teksti (alt)</strong>. ⑥</li>\n<li>Raahaa kaikki kuvat kansiosta kerralla kenttään <strong>Kuvat</strong>. ⑦\nKuvat latautuvat hetken. Järjestä ne tarvittaessa raahaamalla.</li>\n<li>Oikeassa alakulmassa paina <strong>Julkaise</strong>.</li>\n</ol>\n<h2 id=\"galleria-albumi--tulos\">Tulos</h2>\n<ul>\n<li>Albumi näkyy galleriassa ja omalla sivullaan noin minuutissa.</li>\n<li>Kuvaa napsauttamalla kävijä näkee sen suurena.</li>\n</ul>\n<h2 id=\"galleria-albumi--lisavalinnat\">Lisävalinnat</h2>\n<ul>\n<li>Kuvan kuvaus: napsauta kuvaa. Avautuvassa ikkunassa kirjoita <strong>Mitä kuvassa on (alt)</strong>. Se on suositeltava, ei pakollinen.\nIlman sitä sivu nimeää kuvan albumin mukaan, esimerkiksi &quot;Vappu 2026, kuva 3/40&quot;.</li>\n<li>Kuvateksti suurennetun kuvan alle: <strong>Kuvateksti (valinnainen)</strong>.</li>\n<li>Kuvauksia voi lisätä myöhemmin. Julkaise muutosten jälkeen uudelleen.</li>\n<li>Ensimmäinen albumi: Galleria näkyy valikossa vasta, kun lisäät sen sinne. Katso\n<a href=\"/studio/ohjeet/valikko-ja-alatunniste\" data-ohje-kortti=\"valikko-ja-alatunniste\">Valikko ja alatunniste</a>.</li>\n</ul>\n<h2 id=\"galleria-albumi--jos-jokin-menee-vikaan\">Jos jokin menee vikaan</h2>\n<ul>\n<li><strong>Julkaise</strong> ei onnistu: <strong>Albumin nimi</strong>, <strong>Osoite sivustolla</strong>, <strong>Päivämäärä</strong> ja\n<strong>Kansikuva</strong> ovat pakollisia, ja kuvia pitää olla vähintään yksi.</li>\n<li>Keltainen &quot;Kuvaus auttaa näkövammaisia kävijöitä. Voit julkaista myös ilman sitä.&quot;:\njulkaisu onnistuu silti.</li>\n</ul>\n<p>Katso myös: <a href=\"/studio/ohjeet/kuva\" data-ohje-kortti=\"kuva\">Kuva</a> · <a href=\"/studio/ohjeet/tapahtuman-lisaaminen\" data-ohje-kortti=\"tapahtuman-lisaaminen\">Lisää tapahtuma</a></p>\n",
          "teksti": "Milloin Kun haluat näyttää tapahtuman tai matkan kuvat sivuston galleriassa. Albumi saa oman sivunsa. Ennen kuin aloitat Kokoa albumin kuvat yhteen kansioon tietokoneelle. Askeleet Vasemmasta valikosta valitse Galleria-albumit . ① Paina listan yläreunassa plus-painiketta (+). Kirjoita Albumin nimi , esimerkiksi \"Vappu 2026\". ③ Kentän Osoite sivustolla vieressä paina Luo . Valitse Päivämäärä . Halutessasi valitse Liittyvä tapahtuma (valinnainen) . Kohdassa Kansikuva paina Lataa ja valitse kuva. Kirjoita sille Vaihtoehtoinen teksti (alt) . ⑥ Raahaa kaikki kuvat kansiosta kerralla kenttään Kuvat . ⑦ Kuvat latautuvat hetken. Järjestä ne tarvittaessa raahaamalla. Oikeassa alakulmassa paina Julkaise . Tulos Albumi näkyy galleriassa ja omalla sivullaan noin minuutissa. Kuvaa napsauttamalla kävijä näkee sen suurena. Lisävalinnat Kuvan kuvaus: napsauta kuvaa. Avautuvassa ikkunassa kirjoita Mitä kuvassa on (alt) . Se on suositeltava, ei pakollinen. Ilman sitä sivu nimeää kuvan albumin mukaan, esimerkiksi \"Vappu 2026, kuva 3/40\". Kuvateksti suurennetun kuvan alle: Kuvateksti (valinnainen) . Kuvauksia voi lisätä myöhemmin. Julkaise muutosten jälkeen uudelleen. Ensimmäinen albumi: Galleria näkyy valikossa vasta, kun lisäät sen sinne. Katso Valikko ja alatunniste . Jos jokin menee vikaan Julkaise ei onnistu: Albumin nimi , Osoite sivustolla , Päivämäärä ja Kansikuva ovat pakollisia, ja kuvia pitää olla vähintään yksi. Keltainen \"Kuvaus auttaa näkövammaisia kävijöitä. Voit julkaista myös ilman sitä.\": julkaisu onnistuu silti. Katso myös: Kuva · Lisää tapahtuma",
          "otsikot": [
            {
              "id": "galleria-albumi--milloin",
              "teksti": "Milloin",
              "taso": 2
            },
            {
              "id": "galleria-albumi--ennen-kuin-aloitat",
              "teksti": "Ennen kuin aloitat",
              "taso": 2
            },
            {
              "id": "galleria-albumi--askeleet",
              "teksti": "Askeleet",
              "taso": 2
            },
            {
              "id": "galleria-albumi--tulos",
              "teksti": "Tulos",
              "taso": 2
            },
            {
              "id": "galleria-albumi--lisavalinnat",
              "teksti": "Lisävalinnat",
              "taso": 2
            },
            {
              "id": "galleria-albumi--jos-jokin-menee-vikaan",
              "teksti": "Jos jokin menee vikaan",
              "taso": 2
            }
          ]
        }
      ]
    },
    {
      "id": "klubi",
      "otsikko": "Klubi",
      "kortit": [
        {
          "id": "esittely",
          "otsikko": "Muokkaa Klubi-sivun esittelyä",
          "osio": "klubi",
          "avainsanat": [
            "klubi",
            "esittely",
            "klubista",
            "yleisesittely",
            "historia",
            "kuva",
            "klubin esittely",
            "Klubi-sivu"
          ],
          "tyypit": [
            "sivu"
          ],
          "kesto": "noin 5 minuuttia",
          "paivitetty": "2026-10-08",
          "html": "<h2 id=\"esittely--milloin\">Milloin</h2>\n<p>Kun haluat muuttaa klubin esittelytekstiä tai sen kuvaa. Teksti näkyy sivulla\n<a href=\"https://www.lahdensuomalainenklubi.com/klubi\" target=\"_blank\" rel=\"noopener noreferrer\">https://www.lahdensuomalainenklubi.com/klubi</a>.</p>\n<p><a href=\"/studio/structure/klubi;esittely\" data-ohje-studio=\"1\">Avaa Esittely</a></p>\n<h2 id=\"esittely--askeleet\">Askeleet</h2>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/esittely-01-lomake.webp\" aria-label=\"Suurenna kuva: Esittelyn lomake. 1: Klubi valikossa. 2: Esittely. 5: Pääsisältö. 6: Iso kuva sivun yläosassa.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/esittely-01-lomake.webp\" alt=\"Esittelyn lomake. 1: Klubi valikossa. 2: Esittely. 5: Pääsisältö. 6: Iso kuva sivun yläosassa.\" width=\"1600\" height=\"2081\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol>\n<li>Vasemmasta valikosta valitse <strong>Klubi</strong>. ①</li>\n<li>Valitse <strong>Esittely</strong>. ②\nLomake avautuu oikealle. Välilehtien alla on sininen laatikko <strong>Tietoa sivusta</strong>. Se kertoo,\nmitä sivulla muokataan.</li>\n<li>Halutessasi muuta kenttää <strong>Otsikko</strong>.</li>\n<li>Kirjoita lyhyt johdanto kenttään <strong>Tiivistelmä sivun alussa</strong>. Kaksi tai kolme virkettä riittää.</li>\n<li>Muokkaa esittelyä kentässä <strong>Pääsisältö</strong>. ⑤</li>\n<li>Halutessasi vaihda kuva kentässä <strong>Iso kuva sivun yläosassa</strong>. ⑥\nKirjoita kuvalle <strong>Vaihtoehtoinen teksti (alt)</strong>: mitä kuvassa näkyy.</li>\n<li>Oikeassa alakulmassa paina <strong>Julkaise</strong>.</li>\n</ol>\n<h2 id=\"esittely--tulos\">Tulos</h2>\n<ul>\n<li>Oikeaan alakulmaan tulee hetkeksi ilmoitus <strong>Dokumentti on julkaistu</strong>.</li>\n<li>Muutos näkyy sivulla /klubi viimeistään minuutin kuluttua.</li>\n</ul>\n<h2 id=\"esittely--lisavalinnat\">Lisävalinnat</h2>\n<ul>\n<li>Kuvan lisääminen ja rajaus: <a href=\"/studio/ohjeet/kuva\" data-ohje-kortti=\"kuva\">Lisää kuva</a></li>\n<li>Linkki tekstiin: <a href=\"/studio/ohjeet/linkit\" data-ohje-kortti=\"linkit\">Tee linkki</a></li>\n<li>Googlen hakutuloksen teksti: välilehti <strong>Hakukoneet ja jako</strong>, kenttä <strong>Kuvaus hakutuloksissa (valinnainen)</strong>.</li>\n</ul>\n<h2 id=\"esittely--jos-jokin-menee-vikaan\">Jos jokin menee vikaan</h2>\n<ul>\n<li><strong>Julkaise</strong> ei onnistu, ja kuvan kohdalla on punaista: kuvasta puuttuu kuvaus. Kirjoita <strong>Vaihtoehtoinen teksti (alt)</strong>.</li>\n<li>Poisto ja kopiointi ovat harmaina, eikä osoitetta voi muuttaa. Tämä on tarkoituksellista: sivusto hakee tämän sivun aina samasta osoitteesta. Sisältöä saat muokata vapaasti.</li>\n</ul>\n<p>Katso myös: <a href=\"/studio/ohjeet/osioiden-sivut\" data-ohje-kortti=\"osioiden-sivut\">Muokkaa listasivun otsikkoa ja johdantoa</a> · <a href=\"/studio/ohjeet/julkaise-ei-onnistu\" data-ohje-kortti=\"julkaise-ei-onnistu\">Julkaisu ei onnistu</a></p>\n",
          "teksti": "Milloin Kun haluat muuttaa klubin esittelytekstiä tai sen kuvaa. Teksti näkyy sivulla https://www.lahdensuomalainenklubi.com/klubi . Avaa Esittely Askeleet Vasemmasta valikosta valitse Klubi . ① Valitse Esittely . ② Lomake avautuu oikealle. Välilehtien alla on sininen laatikko Tietoa sivusta . Se kertoo, mitä sivulla muokataan. Halutessasi muuta kenttää Otsikko . Kirjoita lyhyt johdanto kenttään Tiivistelmä sivun alussa . Kaksi tai kolme virkettä riittää. Muokkaa esittelyä kentässä Pääsisältö . ⑤ Halutessasi vaihda kuva kentässä Iso kuva sivun yläosassa . ⑥ Kirjoita kuvalle Vaihtoehtoinen teksti (alt) : mitä kuvassa näkyy. Oikeassa alakulmassa paina Julkaise . Tulos Oikeaan alakulmaan tulee hetkeksi ilmoitus Dokumentti on julkaistu . Muutos näkyy sivulla /klubi viimeistään minuutin kuluttua. Lisävalinnat Kuvan lisääminen ja rajaus: Lisää kuva Linkki tekstiin: Tee linkki Googlen hakutuloksen teksti: välilehti Hakukoneet ja jako , kenttä Kuvaus hakutuloksissa (valinnainen) . Jos jokin menee vikaan Julkaise ei onnistu, ja kuvan kohdalla on punaista: kuvasta puuttuu kuvaus. Kirjoita Vaihtoehtoinen teksti (alt) . Poisto ja kopiointi ovat harmaina, eikä osoitetta voi muuttaa. Tämä on tarkoituksellista: sivusto hakee tämän sivun aina samasta osoitteesta. Sisältöä saat muokata vapaasti. Katso myös: Muokkaa listasivun otsikkoa ja johdantoa · Julkaisu ei onnistu",
          "otsikot": [
            {
              "id": "esittely--milloin",
              "teksti": "Milloin",
              "taso": 2
            },
            {
              "id": "esittely--askeleet",
              "teksti": "Askeleet",
              "taso": 2
            },
            {
              "id": "esittely--tulos",
              "teksti": "Tulos",
              "taso": 2
            },
            {
              "id": "esittely--lisavalinnat",
              "teksti": "Lisävalinnat",
              "taso": 2
            },
            {
              "id": "esittely--jos-jokin-menee-vikaan",
              "teksti": "Jos jokin menee vikaan",
              "taso": 2
            }
          ]
        },
        {
          "id": "hallitus",
          "otsikko": "Vaihda hallituksen jäseniä",
          "osio": "klubi",
          "avainsanat": [
            "hallitus",
            "hallituksen jäsen",
            "uusi jäsen",
            "puheenjohtaja",
            "sihteeri",
            "rahastonhoitaja",
            "jää pois",
            "eroaa",
            "vuosikokous",
            "entinen jäsen",
            "johdanto"
          ],
          "tyypit": [
            "hallitusJasen"
          ],
          "kesto": "noin 5 minuuttia",
          "paivitetty": "2026-10-08",
          "html": "<h2 id=\"hallitus--milloin\">Milloin</h2>\n<p>Kun hallitus vaihtuu, esimerkiksi vuosikokouksen jälkeen. Hallituksen jäsenet näkyvät\nsivulla <a href=\"https://www.lahdensuomalainenklubi.com/klubi/hallitus\" target=\"_blank\" rel=\"noopener noreferrer\">https://www.lahdensuomalainenklubi.com/klubi/hallitus</a>.</p>\n<p><a href=\"/studio/structure/klubi;hallitus;nykyinen\" data-ohje-studio=\"1\">Avaa Nykyinen hallitus</a></p>\n<h2 id=\"hallitus--ennen-kuin-aloitat\">Ennen kuin aloitat</h2>\n<ul>\n<li>Jos kukaan ei jää pois, aloita askeleesta 7.</li>\n</ul>\n<h2 id=\"hallitus--askeleet\">Askeleet</h2>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/hallitus-01-lista.webp\" aria-label=\"Suurenna kuva: Hallituksen jäsenlista. 1: Klubi. 2: Hallitus. 3: Nykyinen hallitus. 7: Plus-painike listan yläreunassa.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/hallitus-01-lista.webp\" alt=\"Hallituksen jäsenlista. 1: Klubi. 2: Hallitus. 3: Nykyinen hallitus. 7: Plus-painike listan yläreunassa.\" width=\"1600\" height=\"800\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol>\n<li>Vasemmasta valikosta valitse <strong>Klubi</strong>. ①</li>\n<li>Valitse <strong>Hallitus</strong>. ②</li>\n<li>Valitse <strong>Nykyinen hallitus</strong>. ③</li>\n<li>Avaa listasta jäsen, joka jää pois.</li>\n<li>Käännä kytkin <strong>Nykyinen jäsen</strong> pois päältä. Kytkin muuttuu vaaleaksi. ⑤</li>\n<li>Oikeassa alakulmassa paina <strong>Julkaise</strong>.\nJäsen siirtyy listaan <strong>Klubi → Hallitus → Entiset jäsenet</strong>. Hän ei enää näy hallitussivulla.</li>\n<li>Uusi jäsen: listan <strong>Nykyinen hallitus</strong> yläreunassa paina plus-painiketta (+). ⑦</li>\n</ol>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/hallitus-02-lomake.webp\" aria-label=\"Suurenna kuva: Hallituksen jäsenen lomake. 5: Nykyinen jäsen -kytkin. 8: Nimi ja Rooli. 9: Järjestys hallitussivulla.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/hallitus-02-lomake.webp\" alt=\"Hallituksen jäsenen lomake. 5: Nykyinen jäsen -kytkin. 8: Nimi ja Rooli. 9: Järjestys hallitussivulla.\" width=\"803\" height=\"1570\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol start=\"8\">\n<li>Kirjoita <strong>Nimi</strong> ja <strong>Rooli</strong>, esimerkiksi Sihteeri. ⑧</li>\n<li>Kirjoita <strong>Järjestys hallitussivulla</strong>: 1 näkyy ensimmäisenä, yleensä puheenjohtaja. ⑨</li>\n<li>Oikeassa alakulmassa paina <strong>Julkaise</strong>.</li>\n</ol>\n<h2 id=\"hallitus--tulos\">Tulos</h2>\n<ul>\n<li>Uusi jäsen on listassa <strong>Nykyinen hallitus</strong>.</li>\n<li>Hallitussivu päivittyy viimeistään minuutin kuluttua.</li>\n</ul>\n<div class=\"markdown-alert markdown-alert-note\">\n<p class=\"markdown-alert-title\">Hyvä tietää</p>\n<p>Älä poista jäsentä, joka jää pois. Käännä vain kytkin <strong>Nykyinen jäsen</strong> pois päältä.\nNäin hänen tietonsa säilyvät listassa <strong>Entiset jäsenet</strong>.</p>\n</div>\n<h2 id=\"hallitus--lisavalinnat\">Lisävalinnat</h2>\n<ul>\n<li>Kuva, esittely ja yhteystiedot ovat valinnaisia: <strong>Profiilikuva</strong>, <strong>Lyhyt esittely</strong>, <strong>Sähköposti</strong> ja <strong>Puhelin</strong>.</li>\n<li>Entinen jäsen palaa hallitukseen: avaa hänet listasta <strong>Entiset jäsenet</strong>, käännä kytkin <strong>Nykyinen jäsen</strong> päälle ja julkaise.</li>\n<li>Hallitussivun johdanto: <strong>Klubi → Hallitus → Hallitus-sivun otsikko ja johdanto</strong>, kenttä <strong>Tiivistelmä sivun alussa</strong>. Ohje: <a href=\"/studio/ohjeet/osioiden-sivut\" data-ohje-kortti=\"osioiden-sivut\">Muokkaa listasivun otsikkoa ja johdantoa</a>.</li>\n</ul>\n<h2 id=\"hallitus--jos-jokin-menee-vikaan\">Jos jokin menee vikaan</h2>\n<ul>\n<li><strong>Julkaise</strong> ei onnistu: <strong>Nimi</strong>, <strong>Rooli</strong> ja <strong>Järjestys hallitussivulla</strong> ovat pakollisia. Täytä punaiset kentät.</li>\n<li>Kahdella jäsenellä on sama järjestysnumero: sivusto näyttää heidät silti. Vaihda numerot, jos järjestys on väärä.</li>\n</ul>\n<p>Katso myös: <a href=\"/studio/ohjeet/yhteystiedot\" data-ohje-kortti=\"yhteystiedot\">Päivitä klubin yhteystiedot</a> · <a href=\"/studio/ohjeet/julkaise-ei-onnistu\" data-ohje-kortti=\"julkaise-ei-onnistu\">Julkaisu ei onnistu</a></p>\n",
          "teksti": "Milloin Kun hallitus vaihtuu, esimerkiksi vuosikokouksen jälkeen. Hallituksen jäsenet näkyvät sivulla https://www.lahdensuomalainenklubi.com/klubi/hallitus . Avaa Nykyinen hallitus Ennen kuin aloitat Jos kukaan ei jää pois, aloita askeleesta 7. Askeleet Vasemmasta valikosta valitse Klubi . ① Valitse Hallitus . ② Valitse Nykyinen hallitus . ③ Avaa listasta jäsen, joka jää pois. Käännä kytkin Nykyinen jäsen pois päältä. Kytkin muuttuu vaaleaksi. ⑤ Oikeassa alakulmassa paina Julkaise . Jäsen siirtyy listaan Klubi → Hallitus → Entiset jäsenet . Hän ei enää näy hallitussivulla. Uusi jäsen: listan Nykyinen hallitus yläreunassa paina plus-painiketta (+). ⑦ Kirjoita Nimi ja Rooli , esimerkiksi Sihteeri. ⑧ Kirjoita Järjestys hallitussivulla : 1 näkyy ensimmäisenä, yleensä puheenjohtaja. ⑨ Oikeassa alakulmassa paina Julkaise . Tulos Uusi jäsen on listassa Nykyinen hallitus . Hallitussivu päivittyy viimeistään minuutin kuluttua. Älä poista jäsentä, joka jää pois. Käännä vain kytkin Nykyinen jäsen pois päältä. Näin hänen tietonsa säilyvät listassa Entiset jäsenet . Lisävalinnat Kuva, esittely ja yhteystiedot ovat valinnaisia: Profiilikuva , Lyhyt esittely , Sähköposti ja Puhelin . Entinen jäsen palaa hallitukseen: avaa hänet listasta Entiset jäsenet , käännä kytkin Nykyinen jäsen päälle ja julkaise. Hallitussivun johdanto: Klubi → Hallitus → Hallitus-sivun otsikko ja johdanto , kenttä Tiivistelmä sivun alussa . Ohje: Muokkaa listasivun otsikkoa ja johdantoa . Jos jokin menee vikaan Julkaise ei onnistu: Nimi , Rooli ja Järjestys hallitussivulla ovat pakollisia. Täytä punaiset kentät. Kahdella jäsenellä on sama järjestysnumero: sivusto näyttää heidät silti. Vaihda numerot, jos järjestys on väärä. Katso myös: Päivitä klubin yhteystiedot · Julkaisu ei onnistu",
          "otsikot": [
            {
              "id": "hallitus--milloin",
              "teksti": "Milloin",
              "taso": 2
            },
            {
              "id": "hallitus--ennen-kuin-aloitat",
              "teksti": "Ennen kuin aloitat",
              "taso": 2
            },
            {
              "id": "hallitus--askeleet",
              "teksti": "Askeleet",
              "taso": 2
            },
            {
              "id": "hallitus--tulos",
              "teksti": "Tulos",
              "taso": 2
            },
            {
              "id": "hallitus--lisavalinnat",
              "teksti": "Lisävalinnat",
              "taso": 2
            },
            {
              "id": "hallitus--jos-jokin-menee-vikaan",
              "teksti": "Jos jokin menee vikaan",
              "taso": 2
            }
          ]
        },
        {
          "id": "toiminta-uusi-vuosi",
          "otsikko": "Lisää toimintaan uusi vuosi",
          "osio": "klubi",
          "avainsanat": [
            "toiminta",
            "vuosi",
            "mölkky",
            "vappu",
            "jouluruokailu",
            "matka",
            "talkoot",
            "vuosikokous",
            "osallistujat",
            "monesko kerta",
            "matkakuvaus"
          ],
          "tyypit": [
            "klubiToiminta"
          ],
          "kesto": "noin 5 minuuttia",
          "paivitetty": "2026-10-08",
          "html": "<h2 id=\"toiminta-uusi-vuosi--milloin\">Milloin</h2>\n<p>Kun klubin toiminta on taas pidetty, esimerkiksi mölkkyturnaus tai jouluruokailu.\nVuosimerkinnät näkyvät toiminnan omalla sivulla, uusin ensin. Kaikki toiminnot ovat sivulla\n<a href=\"https://www.lahdensuomalainenklubi.com/klubi/toiminta\" target=\"_blank\" rel=\"noopener noreferrer\">https://www.lahdensuomalainenklubi.com/klubi/toiminta</a>.</p>\n<p><a href=\"/studio/structure/klubi;toiminta;toimintamuodot\" data-ohje-studio=\"1\">Avaa Toimintamuodot</a></p>\n<h2 id=\"toiminta-uusi-vuosi--askeleet\">Askeleet</h2>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/toiminta-uusi-vuosi-01-lista.webp\" aria-label=\"Suurenna kuva: Toimintamuotojen lista. 1: Klubi valikossa. 2: Toiminta. 3: Toimintamuodot.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/toiminta-uusi-vuosi-01-lista.webp\" alt=\"Toimintamuotojen lista. 1: Klubi valikossa. 2: Toiminta. 3: Toimintamuodot.\" width=\"1600\" height=\"800\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol>\n<li>Vasemmasta valikosta valitse <strong>Klubi</strong>. ①</li>\n<li>Valitse <strong>Toiminta</strong>. ②</li>\n<li>Valitse <strong>Toimintamuodot</strong>. ③</li>\n<li>Valitse listasta toiminta, esimerkiksi Mölkky.</li>\n</ol>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/toiminta-uusi-vuosi-02-vuosittain.webp\" aria-label=\"Suurenna kuva: Toimintamuodon lomake. 5: välilehti Vuosittain. 6: Lisää kohde -painike vuosimerkintöjen alla.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/toiminta-uusi-vuosi-02-vuosittain.webp\" alt=\"Toimintamuodon lomake. 5: välilehti Vuosittain. 6: Lisää kohde -painike vuosimerkintöjen alla.\" width=\"803\" height=\"1534\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol start=\"5\">\n<li>Lomakkeen yläreunasta valitse välilehti <strong>Vuosittain</strong>. ⑤</li>\n<li>Kohdan <strong>Vuosittaiset merkinnät</strong> alla paina <strong>Lisää kohde</strong>. ⑥\nUuden vuoden ikkuna avautuu. Uusi vuosi tulee listan loppuun.</li>\n<li>Kirjoita <strong>Vuosi</strong>. Se on ainoa pakollinen kenttä.</li>\n<li>Halutessasi täytä <strong>Päivämäärä</strong>, <strong>Otsikko</strong>, <strong>Paikka</strong>, <strong>Osallistujat</strong> ja <strong>Kuvaus</strong>.\nOsallistujat kirjoitetaan yksi kerrallaan: kirjoita etunimi ja paina Enter.\n<strong>Monesko kerta</strong> kirjoitetaan tavallisena lukuna, esimerkiksi 37. Sivulla se näkyy muodossa (37.).</li>\n<li>Sulje ikkuna oikean yläkulman ruksista ja paina oikeassa alakulmassa <strong>Julkaise</strong>.</li>\n</ol>\n<h2 id=\"toiminta-uusi-vuosi--tulos\">Tulos</h2>\n<ul>\n<li>Listassa näkyy uusi rivi, esimerkiksi &quot;2026&quot;.</li>\n<li>Toiminnan sivulla uusi vuosi on ensimmäisenä viimeistään minuutin kuluttua.</li>\n</ul>\n<h2 id=\"toiminta-uusi-vuosi--lisavalinnat\">Lisävalinnat</h2>\n<ul>\n<li>Linkki matkakuvaukseen tai videoon: avaa vuoden kohta <strong>Linkki</strong>. Kirjoita <strong>Linkin teksti</strong>, esimerkiksi &quot;Matkakuvaus&quot;. Valitse sitten <strong>Mihin linkki vie?</strong>. Ohje: <a href=\"/studio/ohjeet/linkit\" data-ohje-kortti=\"linkit\">Tee linkki</a>.</li>\n<li>Vuoden kuvat: kohta <strong>Kuvat</strong> vuoden kentissä.</li>\n<li>Taulukot, esimerkiksi mölkyn pisteet: välilehden <strong>Vuosittain</strong> kenttä <strong>Tilastotaulukot</strong>. Taulukko tehdään ensin jalkapalloarkistoon: <a href=\"/studio/ohjeet/uusi-tilastotaulukko\" data-ohje-kortti=\"uusi-tilastotaulukko\">Tee uusi taulukko</a>.</li>\n<li>Uusi toimintamuoto: <a href=\"/studio/ohjeet/uusi-toimintamuoto\" data-ohje-kortti=\"uusi-toimintamuoto\">Lisää uusi toimintamuoto</a>.</li>\n</ul>\n<h2 id=\"toiminta-uusi-vuosi--jos-jokin-menee-vikaan\">Jos jokin menee vikaan</h2>\n<ul>\n<li>Keltainen &quot;Linkin teksti on kirjoitettu, mutta kohde puuttuu.&quot;: valitse <strong>Mihin linkki vie?</strong> ja kohde, tai poista linkin teksti.</li>\n<li><strong>Julkaise</strong> ei onnistu, ja kohdassa <strong>Vuosi</strong> on punaista: kirjoita vuosi numeroina, esimerkiksi 2026.</li>\n</ul>\n<p>Katso myös: <a href=\"/studio/ohjeet/uusi-toimintamuoto\" data-ohje-kortti=\"uusi-toimintamuoto\">Lisää uusi toimintamuoto</a> · <a href=\"/studio/ohjeet/linkki-vie-vaaraan-paikkaan\" data-ohje-kortti=\"linkki-vie-vaaraan-paikkaan\">Linkki vie väärään paikkaan</a></p>\n",
          "teksti": "Milloin Kun klubin toiminta on taas pidetty, esimerkiksi mölkkyturnaus tai jouluruokailu. Vuosimerkinnät näkyvät toiminnan omalla sivulla, uusin ensin. Kaikki toiminnot ovat sivulla https://www.lahdensuomalainenklubi.com/klubi/toiminta . Avaa Toimintamuodot Askeleet Vasemmasta valikosta valitse Klubi . ① Valitse Toiminta . ② Valitse Toimintamuodot . ③ Valitse listasta toiminta, esimerkiksi Mölkky. Lomakkeen yläreunasta valitse välilehti Vuosittain . ⑤ Kohdan Vuosittaiset merkinnät alla paina Lisää kohde . ⑥ Uuden vuoden ikkuna avautuu. Uusi vuosi tulee listan loppuun. Kirjoita Vuosi . Se on ainoa pakollinen kenttä. Halutessasi täytä Päivämäärä , Otsikko , Paikka , Osallistujat ja Kuvaus . Osallistujat kirjoitetaan yksi kerrallaan: kirjoita etunimi ja paina Enter. Monesko kerta kirjoitetaan tavallisena lukuna, esimerkiksi 37. Sivulla se näkyy muodossa (37.). Sulje ikkuna oikean yläkulman ruksista ja paina oikeassa alakulmassa Julkaise . Tulos Listassa näkyy uusi rivi, esimerkiksi \"2026\". Toiminnan sivulla uusi vuosi on ensimmäisenä viimeistään minuutin kuluttua. Lisävalinnat Linkki matkakuvaukseen tai videoon: avaa vuoden kohta Linkki . Kirjoita Linkin teksti , esimerkiksi \"Matkakuvaus\". Valitse sitten Mihin linkki vie? . Ohje: Tee linkki . Vuoden kuvat: kohta Kuvat vuoden kentissä. Taulukot, esimerkiksi mölkyn pisteet: välilehden Vuosittain kenttä Tilastotaulukot . Taulukko tehdään ensin jalkapalloarkistoon: Tee uusi taulukko . Uusi toimintamuoto: Lisää uusi toimintamuoto . Jos jokin menee vikaan Keltainen \"Linkin teksti on kirjoitettu, mutta kohde puuttuu.\": valitse Mihin linkki vie? ja kohde, tai poista linkin teksti. Julkaise ei onnistu, ja kohdassa Vuosi on punaista: kirjoita vuosi numeroina, esimerkiksi 2026. Katso myös: Lisää uusi toimintamuoto · Linkki vie väärään paikkaan",
          "otsikot": [
            {
              "id": "toiminta-uusi-vuosi--milloin",
              "teksti": "Milloin",
              "taso": 2
            },
            {
              "id": "toiminta-uusi-vuosi--askeleet",
              "teksti": "Askeleet",
              "taso": 2
            },
            {
              "id": "toiminta-uusi-vuosi--tulos",
              "teksti": "Tulos",
              "taso": 2
            },
            {
              "id": "toiminta-uusi-vuosi--lisavalinnat",
              "teksti": "Lisävalinnat",
              "taso": 2
            },
            {
              "id": "toiminta-uusi-vuosi--jos-jokin-menee-vikaan",
              "teksti": "Jos jokin menee vikaan",
              "taso": 2
            }
          ]
        },
        {
          "id": "uusi-toimintamuoto",
          "otsikko": "Lisää uusi toimintamuoto",
          "osio": "klubi",
          "avainsanat": [
            "toiminta",
            "uusi toiminta",
            "toimintamuoto",
            "harrastus",
            "tapahtuma joka vuosi",
            "kerho",
            "turnaus",
            "järjestys"
          ],
          "tyypit": [
            "klubiToiminta"
          ],
          "kesto": "noin 10 minuuttia",
          "paivitetty": "2026-10-08",
          "html": "<h2 id=\"uusi-toimintamuoto--milloin\">Milloin</h2>\n<p>Kun klubi aloittaa uuden, toistuvan toiminnan. Toimintamuoto saa oman sivunsa, ja se näkyy\nToiminta-sivulla <a href=\"https://www.lahdensuomalainenklubi.com/klubi/toiminta\" target=\"_blank\" rel=\"noopener noreferrer\">https://www.lahdensuomalainenklubi.com/klubi/toiminta</a>.</p>\n<p><a href=\"/studio/structure/klubi;toiminta;toimintamuodot\" data-ohje-studio=\"1\">Avaa Toimintamuodot</a></p>\n<h2 id=\"uusi-toimintamuoto--askeleet\">Askeleet</h2>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/uusi-toimintamuoto-01-lista.webp\" aria-label=\"Suurenna kuva: Toimintamuotojen lista. 1: Klubi. 2: Toiminta. 3: Toimintamuodot. 4: Plus-painike listan yläreunassa.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/uusi-toimintamuoto-01-lista.webp\" alt=\"Toimintamuotojen lista. 1: Klubi. 2: Toiminta. 3: Toimintamuodot. 4: Plus-painike listan yläreunassa.\" width=\"1600\" height=\"800\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol>\n<li>Vasemmasta valikosta valitse <strong>Klubi</strong>. ①</li>\n<li>Valitse <strong>Toiminta</strong>. ②</li>\n<li>Valitse <strong>Toimintamuodot</strong>. ③</li>\n<li>Listan yläreunassa paina plus-painiketta (+). ④\nTyhjä lomake avautuu oikealle.</li>\n</ol>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/uusi-toimintamuoto-02-lomake.webp\" aria-label=\"Suurenna kuva: Uusi toimintamuoto. 5: Toimintamuodon nimi. 6: Osoite sivustolla ja Luo. 8: Kuvaus. 9: Järjestys listassa.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/uusi-toimintamuoto-02-lomake.webp\" alt=\"Uusi toimintamuoto. 5: Toimintamuodon nimi. 6: Osoite sivustolla ja Luo. 8: Kuvaus. 9: Järjestys listassa.\" width=\"803\" height=\"1332\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol start=\"5\">\n<li>Kirjoita <strong>Toimintamuodon nimi</strong>, esimerkiksi &quot;Keilailu&quot;. ⑤</li>\n<li>Kentän <strong>Osoite sivustolla</strong> vieressä paina <strong>Luo</strong>. ⑥\nKenttään tulee nimestä tehty osoite, esimerkiksi keilailu.</li>\n<li>Kirjoita lyhyt johdanto kenttään <strong>Tiivistelmä</strong>. Kaksi tai kolme virkettä riittää.</li>\n<li>Kirjoita kenttään <strong>Kuvaus</strong>, mistä toiminnassa on kyse ja miten mukaan pääsee. ⑧</li>\n<li>Kirjoita <strong>Järjestys listassa</strong>. Pienempi luku näkyy Toiminta-sivulla ylempänä. ⑨</li>\n<li>Oikeassa alakulmassa paina <strong>Julkaise</strong>.</li>\n</ol>\n<h2 id=\"uusi-toimintamuoto--tulos\">Tulos</h2>\n<ul>\n<li>Toimintamuoto näkyy Studion listassa samassa järjestyksessä kuin sivustolla.</li>\n<li>Toimintamuodolla on oma sivu, esimerkiksi /klubi/toiminta/keilailu.</li>\n</ul>\n<h2 id=\"uusi-toimintamuoto--lisavalinnat\">Lisävalinnat</h2>\n<ul>\n<li>Kuvia: kenttä <strong>Kuvat</strong> välilehdellä <strong>Perustiedot</strong>.</li>\n<li>Ensimmäinen vuosi: <a href=\"/studio/ohjeet/toiminta-uusi-vuosi\" data-ohje-kortti=\"toiminta-uusi-vuosi\">Lisää toimintaan uusi vuosi</a>.</li>\n<li>Pohjaksi olemassa oleva toiminta: avaa samankaltainen toimintamuoto. Valitse <strong>Julkaise</strong>-painikkeen vieressä olevasta valikosta <strong>Kopioi pohjaksi</strong>. Anna kopiolle uusi nimi ja paina osoitteen kohdalla <strong>Luo</strong>.</li>\n</ul>\n<h2 id=\"uusi-toimintamuoto--jos-jokin-menee-vikaan\">Jos jokin menee vikaan</h2>\n<ul>\n<li><strong>Julkaise</strong> ei onnistu: <strong>Toimintamuodon nimi</strong> ja <strong>Osoite sivustolla</strong> ovat pakollisia.</li>\n<li>Toiminta on listassa väärässä kohdassa: muuta lukua <strong>Järjestys listassa</strong>. Katso muiden toimintojen luvut ja valitse luku niiden väliltä.</li>\n</ul>\n<p>Katso myös: <a href=\"/studio/ohjeet/toiminta-uusi-vuosi\" data-ohje-kortti=\"toiminta-uusi-vuosi\">Lisää toimintaan uusi vuosi</a> · <a href=\"/studio/ohjeet/osoitteen-muuttaminen\" data-ohje-kortti=\"osoitteen-muuttaminen\">Muuta sivun osoitetta</a></p>\n",
          "teksti": "Milloin Kun klubi aloittaa uuden, toistuvan toiminnan. Toimintamuoto saa oman sivunsa, ja se näkyy Toiminta-sivulla https://www.lahdensuomalainenklubi.com/klubi/toiminta . Avaa Toimintamuodot Askeleet Vasemmasta valikosta valitse Klubi . ① Valitse Toiminta . ② Valitse Toimintamuodot . ③ Listan yläreunassa paina plus-painiketta (+). ④ Tyhjä lomake avautuu oikealle. Kirjoita Toimintamuodon nimi , esimerkiksi \"Keilailu\". ⑤ Kentän Osoite sivustolla vieressä paina Luo . ⑥ Kenttään tulee nimestä tehty osoite, esimerkiksi keilailu. Kirjoita lyhyt johdanto kenttään Tiivistelmä . Kaksi tai kolme virkettä riittää. Kirjoita kenttään Kuvaus , mistä toiminnassa on kyse ja miten mukaan pääsee. ⑧ Kirjoita Järjestys listassa . Pienempi luku näkyy Toiminta-sivulla ylempänä. ⑨ Oikeassa alakulmassa paina Julkaise . Tulos Toimintamuoto näkyy Studion listassa samassa järjestyksessä kuin sivustolla. Toimintamuodolla on oma sivu, esimerkiksi /klubi/toiminta/keilailu. Lisävalinnat Kuvia: kenttä Kuvat välilehdellä Perustiedot . Ensimmäinen vuosi: Lisää toimintaan uusi vuosi . Pohjaksi olemassa oleva toiminta: avaa samankaltainen toimintamuoto. Valitse Julkaise -painikkeen vieressä olevasta valikosta Kopioi pohjaksi . Anna kopiolle uusi nimi ja paina osoitteen kohdalla Luo . Jos jokin menee vikaan Julkaise ei onnistu: Toimintamuodon nimi ja Osoite sivustolla ovat pakollisia. Toiminta on listassa väärässä kohdassa: muuta lukua Järjestys listassa . Katso muiden toimintojen luvut ja valitse luku niiden väliltä. Katso myös: Lisää toimintaan uusi vuosi · Muuta sivun osoitetta",
          "otsikot": [
            {
              "id": "uusi-toimintamuoto--milloin",
              "teksti": "Milloin",
              "taso": 2
            },
            {
              "id": "uusi-toimintamuoto--askeleet",
              "teksti": "Askeleet",
              "taso": 2
            },
            {
              "id": "uusi-toimintamuoto--tulos",
              "teksti": "Tulos",
              "taso": 2
            },
            {
              "id": "uusi-toimintamuoto--lisavalinnat",
              "teksti": "Lisävalinnat",
              "taso": 2
            },
            {
              "id": "uusi-toimintamuoto--jos-jokin-menee-vikaan",
              "teksti": "Jos jokin menee vikaan",
              "taso": 2
            }
          ]
        },
        {
          "id": "palloveikkauksen-sivut",
          "otsikko": "Päivitä palloveikkauksen sivuja",
          "osio": "klubi",
          "avainsanat": [
            "palloveikkaus",
            "veikkaus",
            "uusi kausi",
            "säännöt",
            "tulokset",
            "taulukko",
            "Veikkausliigan palloveikkaus",
            "arvokisaveikkaus",
            "maaottelujen tulosveikkaus",
            "alasivu"
          ],
          "tyypit": [
            "sivu"
          ],
          "kesto": "noin 10 minuuttia",
          "paivitetty": "2026-10-08",
          "html": "<h2 id=\"palloveikkauksen-sivut--milloin\">Milloin</h2>\n<p>Kun palloveikkauksen uusi kausi alkaa tai säännöt muuttuvat. Jokaisella veikkauksella on\noma sivunsa. Palloveikkaus-sivu <a href=\"https://www.lahdensuomalainenklubi.com/klubi/palloveikkaus\" target=\"_blank\" rel=\"noopener noreferrer\">https://www.lahdensuomalainenklubi.com/klubi/palloveikkaus</a>\nlistaa ne itsestään.</p>\n<p><a href=\"/studio/structure/klubi;palloveikkaus;veikkausten-alasivut\" data-ohje-studio=\"1\">Avaa Veikkausten alasivut</a></p>\n<h2 id=\"palloveikkauksen-sivut--ennen-kuin-aloitat\">Ennen kuin aloitat</h2>\n<ul>\n<li>Uuden kauden taulukko on tehty kohtaan <strong>Jalkapalloarkisto → Tilastot → Klubin omat tilastot</strong> ja julkaistu. Ohje: <a href=\"/studio/ohjeet/uusi-tilastotaulukko\" data-ohje-kortti=\"uusi-tilastotaulukko\">Tee uusi taulukko</a>.</li>\n<li>Pelkkä tulosten päivitys ei vaadi tätä korttia: päivitä taulukko suoraan. Ohje: <a href=\"/studio/ohjeet/tilastotaulukon-paivitys\" data-ohje-kortti=\"tilastotaulukon-paivitys\">Päivitä tilastotaulukko</a>.</li>\n</ul>\n<h2 id=\"palloveikkauksen-sivut--askeleet\">Askeleet</h2>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/palloveikkauksen-sivut-01-lista.webp\" aria-label=\"Suurenna kuva: Veikkausten alasivujen lista. 1: Klubi valikossa. 2: Palloveikkaus. 3: Veikkausten alasivut.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/palloveikkauksen-sivut-01-lista.webp\" alt=\"Veikkausten alasivujen lista. 1: Klubi valikossa. 2: Palloveikkaus. 3: Veikkausten alasivut.\" width=\"1600\" height=\"800\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol>\n<li>Vasemmasta valikosta valitse <strong>Klubi</strong>. ①</li>\n<li>Valitse <strong>Palloveikkaus</strong>. ②</li>\n<li>Valitse <strong>Veikkausten alasivut</strong>. ③</li>\n<li>Valitse veikkaus, esimerkiksi Veikkausliigan palloveikkaus.</li>\n</ol>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/palloveikkauksen-sivut-02-taulukot.webp\" aria-label=\"Suurenna kuva: Veikkauksen alasivu. 5: Pääsisältö. 6: Lisää kohde Taulukot-kohdassa. 8: taulukon kahva järjestämistä varten.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/palloveikkauksen-sivut-02-taulukot.webp\" alt=\"Veikkauksen alasivu. 5: Pääsisältö. 6: Lisää kohde Taulukot-kohdassa. 8: taulukon kahva järjestämistä varten.\" width=\"803\" height=\"1538\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol start=\"5\">\n<li>Muokkaa sääntöjä tarvittaessa kentässä <strong>Pääsisältö</strong>. ⑤</li>\n<li>Kohdan <strong>Taulukot</strong> alla paina <strong>Lisää kohde</strong>. ⑥</li>\n<li>Listan loppuun tulee tyhjä rivi. Kirjoita sen kenttään uuden taulukon nimen alkua ja valitse\ntaulukko listasta.</li>\n<li>Vedä uusi taulukko kahvasta (⋮⋮) listan alkuun. ⑧\nYlin taulukko näkyy sivulla ensimmäisenä.</li>\n<li>Oikeassa alakulmassa paina <strong>Julkaise</strong>.</li>\n</ol>\n<h2 id=\"palloveikkauksen-sivut--tulos\">Tulos</h2>\n<ul>\n<li>Uuden kauden taulukko näkyy veikkauksen sivulla ylimpänä viimeistään minuutin kuluttua.</li>\n<li>Vanhat kaudet näkyvät sen alla.</li>\n</ul>\n<h2 id=\"palloveikkauksen-sivut--lisavalinnat\">Lisävalinnat</h2>\n<ul>\n<li>Uusi veikkaus omalle sivulleen: avaa <strong>Veikkausten alasivut</strong> ja paina listan yläreunassa plus-painiketta (+). Kirjoita <strong>Otsikko</strong>. Kirjoita kenttään <strong>Osoite sivustolla</strong> alku klubi/palloveikkaus/ ja perään veikkauksen nimi, esimerkiksi klubi/palloveikkaus/mestarisarja. Julkaise.</li>\n<li>Palloveikkaus-pääsivun teksti ja kuva: <strong>Klubi → Palloveikkaus → Palloveikkaus-sivu</strong>.</li>\n<li>Veikkauslomake uutisen alle (jäsenet veikkaavat sarjajärjestyksen): <a href=\"/studio/ohjeet/veikkaus-ja-kommentit\" data-ohje-kortti=\"veikkaus-ja-kommentit\">Veikkaus ja kommentit</a>.</li>\n</ul>\n<h2 id=\"palloveikkauksen-sivut--jos-jokin-menee-vikaan\">Jos jokin menee vikaan</h2>\n<ul>\n<li>Taulukkoa ei löydy listasta: taulukkoa ei ole julkaistu, tai kirjoitit nimen eri tavalla. Avaa taulukko ja julkaise se ensin.</li>\n<li>Uusi veikkaus ei näy listassa <strong>Veikkausten alasivut</strong>: osoitteen alusta puuttuu klubi/palloveikkaus/. Sivu on silloin listassa <strong>Sivut</strong>. Korjaa osoite ja julkaise.</li>\n<li>Punainen &quot;Tämä osoite on sivuston oma osio, joten sivu ei näkyisi siinä. Valitse toinen osoite.&quot;: osoitteessa on liian monta osaa. Käytä muotoa klubi/palloveikkaus/nimi.</li>\n</ul>\n<p>Katso myös: <a href=\"/studio/ohjeet/tilastotaulukon-paivitys\" data-ohje-kortti=\"tilastotaulukon-paivitys\">Päivitä tilastotaulukko</a> · <a href=\"/studio/ohjeet/uusi-sivu\" data-ohje-kortti=\"uusi-sivu\">Tee uusi sivu</a></p>\n",
          "teksti": "Milloin Kun palloveikkauksen uusi kausi alkaa tai säännöt muuttuvat. Jokaisella veikkauksella on oma sivunsa. Palloveikkaus-sivu https://www.lahdensuomalainenklubi.com/klubi/palloveikkaus listaa ne itsestään. Avaa Veikkausten alasivut Ennen kuin aloitat Uuden kauden taulukko on tehty kohtaan Jalkapalloarkisto → Tilastot → Klubin omat tilastot ja julkaistu. Ohje: Tee uusi taulukko . Pelkkä tulosten päivitys ei vaadi tätä korttia: päivitä taulukko suoraan. Ohje: Päivitä tilastotaulukko . Askeleet Vasemmasta valikosta valitse Klubi . ① Valitse Palloveikkaus . ② Valitse Veikkausten alasivut . ③ Valitse veikkaus, esimerkiksi Veikkausliigan palloveikkaus. Muokkaa sääntöjä tarvittaessa kentässä Pääsisältö . ⑤ Kohdan Taulukot alla paina Lisää kohde . ⑥ Listan loppuun tulee tyhjä rivi. Kirjoita sen kenttään uuden taulukon nimen alkua ja valitse taulukko listasta. Vedä uusi taulukko kahvasta (⋮⋮) listan alkuun. ⑧ Ylin taulukko näkyy sivulla ensimmäisenä. Oikeassa alakulmassa paina Julkaise . Tulos Uuden kauden taulukko näkyy veikkauksen sivulla ylimpänä viimeistään minuutin kuluttua. Vanhat kaudet näkyvät sen alla. Lisävalinnat Uusi veikkaus omalle sivulleen: avaa Veikkausten alasivut ja paina listan yläreunassa plus-painiketta (+). Kirjoita Otsikko . Kirjoita kenttään Osoite sivustolla alku klubi/palloveikkaus/ ja perään veikkauksen nimi, esimerkiksi klubi/palloveikkaus/mestarisarja. Julkaise. Palloveikkaus-pääsivun teksti ja kuva: Klubi → Palloveikkaus → Palloveikkaus-sivu . Veikkauslomake uutisen alle (jäsenet veikkaavat sarjajärjestyksen): Veikkaus ja kommentit . Jos jokin menee vikaan Taulukkoa ei löydy listasta: taulukkoa ei ole julkaistu, tai kirjoitit nimen eri tavalla. Avaa taulukko ja julkaise se ensin. Uusi veikkaus ei näy listassa Veikkausten alasivut : osoitteen alusta puuttuu klubi/palloveikkaus/. Sivu on silloin listassa Sivut . Korjaa osoite ja julkaise. Punainen \"Tämä osoite on sivuston oma osio, joten sivu ei näkyisi siinä. Valitse toinen osoite.\": osoitteessa on liian monta osaa. Käytä muotoa klubi/palloveikkaus/nimi. Katso myös: Päivitä tilastotaulukko · Tee uusi sivu",
          "otsikot": [
            {
              "id": "palloveikkauksen-sivut--milloin",
              "teksti": "Milloin",
              "taso": 2
            },
            {
              "id": "palloveikkauksen-sivut--ennen-kuin-aloitat",
              "teksti": "Ennen kuin aloitat",
              "taso": 2
            },
            {
              "id": "palloveikkauksen-sivut--askeleet",
              "teksti": "Askeleet",
              "taso": 2
            },
            {
              "id": "palloveikkauksen-sivut--tulos",
              "teksti": "Tulos",
              "taso": 2
            },
            {
              "id": "palloveikkauksen-sivut--lisavalinnat",
              "teksti": "Lisävalinnat",
              "taso": 2
            },
            {
              "id": "palloveikkauksen-sivut--jos-jokin-menee-vikaan",
              "teksti": "Jos jokin menee vikaan",
              "taso": 2
            }
          ]
        },
        {
          "id": "yhteystiedot",
          "otsikko": "Päivitä klubin yhteystiedot",
          "osio": "klubi",
          "avainsanat": [
            "yhteystiedot",
            "osoite",
            "sähköposti",
            "puhelin",
            "y-tunnus",
            "IBAN",
            "tilinumero",
            "some",
            "Facebook",
            "Instagram",
            "YouTube",
            "alatunniste"
          ],
          "tyypit": [
            "yhteystiedot"
          ],
          "kesto": "noin 5 minuuttia",
          "paivitetty": "2026-10-08",
          "html": "<h2 id=\"yhteystiedot--milloin\">Milloin</h2>\n<p>Kun klubin osoite, sähköposti, puhelin tai someosoite muuttuu. Tiedot näkyvät jokaisen sivun\nalareunassa ja sivulla <a href=\"https://www.lahdensuomalainenklubi.com/klubi/yhteystiedot\" target=\"_blank\" rel=\"noopener noreferrer\">https://www.lahdensuomalainenklubi.com/klubi/yhteystiedot</a>.</p>\n<p><a href=\"/studio/intent/edit/id=yhteystiedot\" data-ohje-studio=\"1\">Avaa yhteystiedot</a></p>\n<h2 id=\"yhteystiedot--askeleet\">Askeleet</h2>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/yhteystiedot-01-lomake.webp\" aria-label=\"Suurenna kuva: Yhteystietojen lomake. 1: Klubi. 2: Yhteystiedot. 3: Osoite, sähköposti ja some. 5: Yleinen sähköposti. 7: Sosiaaliset mediat.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/yhteystiedot-01-lomake.webp\" alt=\"Yhteystietojen lomake. 1: Klubi. 2: Yhteystiedot. 3: Osoite, sähköposti ja some. 5: Yleinen sähköposti. 7: Sosiaaliset mediat.\" width=\"1600\" height=\"1400\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol>\n<li>Vasemmasta valikosta valitse <strong>Klubi</strong>. ①</li>\n<li>Valitse <strong>Yhteystiedot</strong>. ②</li>\n<li>Valitse <strong>Osoite, sähköposti ja some</strong>. ③</li>\n<li>Muuta tarvittaessa <strong>Katuosoite</strong>, <strong>Postinumero</strong> ja <strong>Kaupunki</strong>.</li>\n<li>Muuta tarvittaessa <strong>Yleinen sähköposti</strong> ja <strong>Puhelin</strong>. ⑤</li>\n<li>Halutessasi täytä <strong>Y-tunnus</strong> ja <strong>IBAN</strong>.</li>\n<li>Uusi someosoite: kohdan <strong>Sosiaaliset mediat</strong> alla paina <strong>Lisää kohde</strong>. ⑦\nValitse <strong>Alusta</strong>, esimerkiksi Facebook. Kirjoita <strong>Verkko-osoite</strong>, joka alkaa https://.</li>\n<li>Oikeassa alakulmassa paina <strong>Julkaise</strong>.</li>\n</ol>\n<h2 id=\"yhteystiedot--tulos\">Tulos</h2>\n<ul>\n<li>Uudet tiedot näkyvät sivujen alareunassa ja yhteystietosivulla viimeistään minuutin kuluttua.</li>\n<li>Aloituksen kohta <strong>Täydennä perustiedot</strong> ei enää muistuta puuttuvasta tiedosta.</li>\n</ul>\n<h2 id=\"yhteystiedot--lisavalinnat\">Lisävalinnat</h2>\n<ul>\n<li>Yhteystietosivun otsikko ja johdanto: <strong>Klubi → Yhteystiedot → Yhteystiedot-sivun otsikko ja johdanto</strong>. Ohje: <a href=\"/studio/ohjeet/osioiden-sivut\" data-ohje-kortti=\"osioiden-sivut\">Muokkaa listasivun otsikkoa ja johdantoa</a>.</li>\n<li>Kokoontumispaikan kartta: kenttä <strong>Karttapaikka</strong>.</li>\n<li>Someosoitteen poisto: vie osoitin rivin päälle, avaa rivin valikko ja valitse <strong>Poista</strong>.</li>\n</ul>\n<h2 id=\"yhteystiedot--jos-jokin-menee-vikaan\">Jos jokin menee vikaan</h2>\n<ul>\n<li>Keltainen teksti, esimerkiksi &quot;Täytä sähköposti — näkyy yhteystietosivulla.&quot;: tieto puuttuu. Voit silti julkaista.</li>\n<li><strong>Julkaise</strong> ei onnistu, ja <strong>Kaupunki</strong> on punainen: kaupunki on pakollinen. Kirjoita esimerkiksi Lahti.</li>\n<li>Someosoite ei kelpaa: kirjoita koko osoite alusta asti, esimerkiksi <a href=\"https://www.facebook.com/%E2%80%A6\" target=\"_blank\" rel=\"noopener noreferrer\">https://www.facebook.com/…</a></li>\n</ul>\n<p>Katso myös: <a href=\"/studio/ohjeet/valikko-ja-alatunniste\" data-ohje-kortti=\"valikko-ja-alatunniste\">Muokkaa valikkoa ja alatunnistetta</a> · <a href=\"/studio/ohjeet/hallitus\" data-ohje-kortti=\"hallitus\">Vaihda hallituksen jäseniä</a></p>\n",
          "teksti": "Milloin Kun klubin osoite, sähköposti, puhelin tai someosoite muuttuu. Tiedot näkyvät jokaisen sivun alareunassa ja sivulla https://www.lahdensuomalainenklubi.com/klubi/yhteystiedot . Avaa yhteystiedot Askeleet Vasemmasta valikosta valitse Klubi . ① Valitse Yhteystiedot . ② Valitse Osoite, sähköposti ja some . ③ Muuta tarvittaessa Katuosoite , Postinumero ja Kaupunki . Muuta tarvittaessa Yleinen sähköposti ja Puhelin . ⑤ Halutessasi täytä Y-tunnus ja IBAN . Uusi someosoite: kohdan Sosiaaliset mediat alla paina Lisää kohde . ⑦ Valitse Alusta , esimerkiksi Facebook. Kirjoita Verkko-osoite , joka alkaa https://. Oikeassa alakulmassa paina Julkaise . Tulos Uudet tiedot näkyvät sivujen alareunassa ja yhteystietosivulla viimeistään minuutin kuluttua. Aloituksen kohta Täydennä perustiedot ei enää muistuta puuttuvasta tiedosta. Lisävalinnat Yhteystietosivun otsikko ja johdanto: Klubi → Yhteystiedot → Yhteystiedot-sivun otsikko ja johdanto . Ohje: Muokkaa listasivun otsikkoa ja johdantoa . Kokoontumispaikan kartta: kenttä Karttapaikka . Someosoitteen poisto: vie osoitin rivin päälle, avaa rivin valikko ja valitse Poista . Jos jokin menee vikaan Keltainen teksti, esimerkiksi \"Täytä sähköposti — näkyy yhteystietosivulla.\": tieto puuttuu. Voit silti julkaista. Julkaise ei onnistu, ja Kaupunki on punainen: kaupunki on pakollinen. Kirjoita esimerkiksi Lahti. Someosoite ei kelpaa: kirjoita koko osoite alusta asti, esimerkiksi https://www.facebook.com/… Katso myös: Muokkaa valikkoa ja alatunnistetta · Vaihda hallituksen jäseniä",
          "otsikot": [
            {
              "id": "yhteystiedot--milloin",
              "teksti": "Milloin",
              "taso": 2
            },
            {
              "id": "yhteystiedot--askeleet",
              "teksti": "Askeleet",
              "taso": 2
            },
            {
              "id": "yhteystiedot--tulos",
              "teksti": "Tulos",
              "taso": 2
            },
            {
              "id": "yhteystiedot--lisavalinnat",
              "teksti": "Lisävalinnat",
              "taso": 2
            },
            {
              "id": "yhteystiedot--jos-jokin-menee-vikaan",
              "teksti": "Jos jokin menee vikaan",
              "taso": 2
            }
          ]
        }
      ]
    },
    {
      "id": "sivusto",
      "otsikko": "Sivusto",
      "kortit": [
        {
          "id": "etusivu-ylaosa",
          "otsikko": "Muuta etusivun yläosaa",
          "osio": "sivusto",
          "avainsanat": [
            "etusivu",
            "yläosa",
            "pääjuttu",
            "nosto",
            "taustakuva",
            "pikalinkit",
            "laskuri",
            "Huuhkajat",
            "seuraava ottelu",
            "Seuraavaksi",
            "kansikuva",
            "hakukoneet"
          ],
          "tyypit": [
            "etusivu"
          ],
          "kesto": "noin 5 minuuttia",
          "paivitetty": "2026-10-08",
          "html": "<h2 id=\"etusivu-ylaosa--milloin\">Milloin</h2>\n<p>Etusivun yläosa päivittyy itsestään. Siinä näkyy uusin juttu isona. Oikealla olevassa\nSeuraavaksi-kortissa näkyvät seuraava Huuhkajien ottelu laskurin kanssa ja seuraava tapahtuma.\nMuokkaa yläosaa, kun haluat nostaa tietyn jutun, vaihtaa taustakuvan tai pikalinkit.</p>\n<p><a href=\"/studio/intent/edit/id=etusivu\" data-ohje-studio=\"1\">Avaa Etusivu</a></p>\n<h2 id=\"etusivu-ylaosa--askeleet\">Askeleet</h2>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/etusivu-ylaosa-01-lomake.webp\" aria-label=\"Suurenna kuva: Etusivun Yläosa-välilehti. 1: Sivuston asetukset. 2: Etusivu. 3: Pääjuttu. 5: Taustakuva. 6: Pikalinkit.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/etusivu-ylaosa-01-lomake.webp\" alt=\"Etusivun Yläosa-välilehti. 1: Sivuston asetukset. 2: Etusivu. 3: Pääjuttu. 5: Taustakuva. 6: Pikalinkit.\" width=\"1600\" height=\"1920\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol>\n<li>Vasemmasta valikosta valitse <strong>Sivuston asetukset</strong>. ①</li>\n<li>Valitse <strong>Etusivu</strong>. ②\nLomake avautuu välilehdelle <strong>Yläosa</strong>.</li>\n<li>Halutessasi nosta juttu kenttään <strong>Pääjuttu (valinnainen)</strong>: kirjoita jutun otsikon alkua ja valitse listasta. ③</li>\n<li>Valitse päivä kenttään <strong>Pääjuttu näkyy asti</strong>. Kenttä tulee näkyviin, kun pääjuttu on valittu.\nSen jälkeen yläosassa näkyy taas uusin juttu itsestään.</li>\n<li>Halutessasi vaihda kuva kentässä <strong>Taustakuva (valinnainen)</strong>. ⑤\nKirjoita kuvalle <strong>Vaihtoehtoinen teksti (alt)</strong>.</li>\n<li>Halutessasi muokkaa kohtaa <strong>Pikalinkit</strong>: avaa linkki ja muuta <strong>Teksti</strong> tai <strong>Mihin linkki vie?</strong>. ⑥</li>\n<li>Oikeassa alakulmassa paina <strong>Julkaise</strong>.</li>\n</ol>\n<h2 id=\"etusivu-ylaosa--tulos\">Tulos</h2>\n<ul>\n<li>Etusivun yläosa muuttuu viimeistään minuutin kuluttua.</li>\n<li>Pikalinkit näkyvät yläosan Seuraavaksi-kortissa.</li>\n</ul>\n<h2 id=\"etusivu-ylaosa--lisavalinnat\">Lisävalinnat</h2>\n<ul>\n<li>Uusi pikalinkki: kohdan <strong>Pikalinkit</strong> alla paina <strong>Lisää kohde</strong>. Pikalinkkejä voi olla enintään neljä.</li>\n<li>Laskuri pois: käännä kytkin <strong>Näytä seuraava Huuhkajien ottelu ja laskuri</strong> pois päältä.</li>\n<li>Pieni rivi yläreunassa: <strong>Klubin nimi yläosassa</strong>.</li>\n<li>Googlen hakutuloksen teksti: välilehti <strong>Hakukoneet ja jako</strong>, kenttä <strong>Etusivun kuvaus hakukoneille</strong>. Teksti ei näy itse sivulla.</li>\n<li>Etusivun alempana olevat osiot: <a href=\"/studio/ohjeet/etusivun-lohkot\" data-ohje-kortti=\"etusivun-lohkot\">Järjestä, piilota tai lisää etusivun lohkoja</a>.</li>\n</ul>\n<div class=\"markdown-alert markdown-alert-tip\">\n<p class=\"markdown-alert-title\">Vinkki</p>\n<p>Hyvä taustakuva on vaakakuva, esimerkiksi katsomosta. Kuva näkyy mustavalkoisena tumman\nsävyn alla, joten tekstit erottuvat aina.</p>\n</div>\n<h2 id=\"etusivu-ylaosa--jos-jokin-menee-vikaan\">Jos jokin menee vikaan</h2>\n<ul>\n<li>Pääjuttu ei näy: juttua ei ole julkaistu, sen julkaisuaika on tulevaisuudessa tai päivä <strong>Pääjuttu näkyy asti</strong> on jo mennyt.</li>\n<li><strong>Julkaise</strong> ei onnistu: kuvalta puuttuu <strong>Vaihtoehtoinen teksti (alt)</strong>, tai <strong>Etusivun kuvaus hakukoneille</strong> on tyhjä.</li>\n<li>Laskuria ei näy: seuraavaa Huuhkajien ottelua ei ole tiedossa. Lisää ottelu: <a href=\"/studio/ohjeet/ottelun-lisaaminen\" data-ohje-kortti=\"ottelun-lisaaminen\">Lisää ottelu</a>.</li>\n</ul>\n<p>Katso myös: <a href=\"/studio/ohjeet/etusivun-lohkot\" data-ohje-kortti=\"etusivun-lohkot\">Järjestä, piilota tai lisää etusivun lohkoja</a> · <a href=\"/studio/ohjeet/linkit\" data-ohje-kortti=\"linkit\">Tee linkki</a></p>\n",
          "teksti": "Milloin Etusivun yläosa päivittyy itsestään. Siinä näkyy uusin juttu isona. Oikealla olevassa Seuraavaksi-kortissa näkyvät seuraava Huuhkajien ottelu laskurin kanssa ja seuraava tapahtuma. Muokkaa yläosaa, kun haluat nostaa tietyn jutun, vaihtaa taustakuvan tai pikalinkit. Avaa Etusivu Askeleet Vasemmasta valikosta valitse Sivuston asetukset . ① Valitse Etusivu . ② Lomake avautuu välilehdelle Yläosa . Halutessasi nosta juttu kenttään Pääjuttu (valinnainen) : kirjoita jutun otsikon alkua ja valitse listasta. ③ Valitse päivä kenttään Pääjuttu näkyy asti . Kenttä tulee näkyviin, kun pääjuttu on valittu. Sen jälkeen yläosassa näkyy taas uusin juttu itsestään. Halutessasi vaihda kuva kentässä Taustakuva (valinnainen) . ⑤ Kirjoita kuvalle Vaihtoehtoinen teksti (alt) . Halutessasi muokkaa kohtaa Pikalinkit : avaa linkki ja muuta Teksti tai Mihin linkki vie? . ⑥ Oikeassa alakulmassa paina Julkaise . Tulos Etusivun yläosa muuttuu viimeistään minuutin kuluttua. Pikalinkit näkyvät yläosan Seuraavaksi-kortissa. Lisävalinnat Uusi pikalinkki: kohdan Pikalinkit alla paina Lisää kohde . Pikalinkkejä voi olla enintään neljä. Laskuri pois: käännä kytkin Näytä seuraava Huuhkajien ottelu ja laskuri pois päältä. Pieni rivi yläreunassa: Klubin nimi yläosassa . Googlen hakutuloksen teksti: välilehti Hakukoneet ja jako , kenttä Etusivun kuvaus hakukoneille . Teksti ei näy itse sivulla. Etusivun alempana olevat osiot: Järjestä, piilota tai lisää etusivun lohkoja . Hyvä taustakuva on vaakakuva, esimerkiksi katsomosta. Kuva näkyy mustavalkoisena tumman sävyn alla, joten tekstit erottuvat aina. Jos jokin menee vikaan Pääjuttu ei näy: juttua ei ole julkaistu, sen julkaisuaika on tulevaisuudessa tai päivä Pääjuttu näkyy asti on jo mennyt. Julkaise ei onnistu: kuvalta puuttuu Vaihtoehtoinen teksti (alt) , tai Etusivun kuvaus hakukoneille on tyhjä. Laskuria ei näy: seuraavaa Huuhkajien ottelua ei ole tiedossa. Lisää ottelu: Lisää ottelu . Katso myös: Järjestä, piilota tai lisää etusivun lohkoja · Tee linkki",
          "otsikot": [
            {
              "id": "etusivu-ylaosa--milloin",
              "teksti": "Milloin",
              "taso": 2
            },
            {
              "id": "etusivu-ylaosa--askeleet",
              "teksti": "Askeleet",
              "taso": 2
            },
            {
              "id": "etusivu-ylaosa--tulos",
              "teksti": "Tulos",
              "taso": 2
            },
            {
              "id": "etusivu-ylaosa--lisavalinnat",
              "teksti": "Lisävalinnat",
              "taso": 2
            },
            {
              "id": "etusivu-ylaosa--jos-jokin-menee-vikaan",
              "teksti": "Jos jokin menee vikaan",
              "taso": 2
            }
          ]
        },
        {
          "id": "etusivun-lohkot",
          "otsikko": "Järjestä, piilota tai lisää etusivun lohkoja",
          "osio": "sivusto",
          "avainsanat": [
            "etusivu",
            "lohko",
            "osio",
            "järjestys",
            "piilota",
            "otteluohjelma",
            "FC Lahti",
            "seurat",
            "ravintola-arviot",
            "galleria",
            "klubista",
            "esittelyteksti",
            "jalkapalloarkisto"
          ],
          "tyypit": [
            "etusivu"
          ],
          "kesto": "noin 5 minuuttia",
          "paivitetty": "2026-10-08",
          "html": "<h2 id=\"etusivun-lohkot--milloin\">Milloin</h2>\n<p>Etusivulla on yläosan alla lohkoja, esimerkiksi jutut, otteluohjelma ja ravintola-arviot.\nTässä muutat niiden järjestystä, piilotat lohkon tai lisäät uuden. Lohkon sisältö,\nesimerkiksi jutut ja ottelut, tulee itsestään.</p>\n<p><a href=\"/studio/intent/edit/id=etusivu\" data-ohje-studio=\"1\">Avaa Etusivu</a></p>\n<h2 id=\"etusivun-lohkot--askeleet\">Askeleet</h2>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/etusivun-lohkot-01-lista.webp\" aria-label=\"Suurenna kuva: Etusivun Lohkot-välilehti. 3: välilehti Lohkot. 4: lohkon kahva. 6: Lisää kohde -painike listan alla.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/etusivun-lohkot-01-lista.webp\" alt=\"Etusivun Lohkot-välilehti. 3: välilehti Lohkot. 4: lohkon kahva. 6: Lisää kohde -painike listan alla.\" width=\"677\" height=\"568\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol>\n<li>Vasemmasta valikosta valitse <strong>Sivuston asetukset</strong>.</li>\n<li>Valitse <strong>Etusivu</strong>.</li>\n<li>Lomakkeen yläreunasta valitse välilehti <strong>Lohkot</strong>. ③\nLohkot ovat listassa samassa järjestyksessä kuin etusivulla.</li>\n<li>Järjestys: tartu lohkon kahvaan (⋮⋮) ja vedä lohko uuteen kohtaan. ④</li>\n</ol>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/etusivun-lohkot-02-lohko.webp\" aria-label=\"Suurenna kuva: Avattu otteluohjelman lohko. 5: Piilota lohko sivulta. 7: Näytä myös näiden seurojen ottelut.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/etusivun-lohkot-02-lohko.webp\" alt=\"Avattu otteluohjelman lohko. 5: Piilota lohko sivulta. 7: Näytä myös näiden seurojen ottelut.\" width=\"649\" height=\"902\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol start=\"5\">\n<li>Piilotus: avaa lohko napsauttamalla sitä ja käännä kytkin <strong>Piilota lohko sivulta</strong> päälle. ⑤\nLohkon kohdalla listassa lukee Piilotettu. Asetukset säilyvät.</li>\n<li>Uusi lohko: listan alla paina <strong>Lisää kohde...</strong> ja valitse avautuvasta listasta lohkon tyyppi. ⑥\nUusi lohko tulee listan loppuun.</li>\n<li>Muokkaa lohkon asetuksia. Ne on lueteltu alla kohdassa Lisävalinnat. ⑦</li>\n<li>Oikeassa alakulmassa paina <strong>Julkaise</strong>.</li>\n</ol>\n<h2 id=\"etusivun-lohkot--tulos\">Tulos</h2>\n<ul>\n<li>Etusivu muuttuu viimeistään minuutin kuluttua.</li>\n<li>Piilotettu lohko palaa, kun käännät kytkimen pois päältä ja julkaiset.</li>\n</ul>\n<h2 id=\"etusivun-lohkot--lisavalinnat\">Lisävalinnat</h2>\n<p>Lohkojen tyypit ja asetukset:</p>\n<table>\n<thead>\n<tr>\n<th>Lohko</th>\n<th>Mitä etusivulla näkyy</th>\n<th>Asetukset</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td><strong>Jutut (uusimmat uutiset)</strong></td>\n<td>Uusin juttu isona, seuraavat listana</td>\n<td><strong>Yläotsake</strong>, <strong>Otsikko</strong>, <strong>Näytettävien määrä</strong></td>\n</tr>\n<tr>\n<td><strong>Otteluohjelma ja tapahtumat</strong></td>\n<td>Tulevat ottelut vasemmalla, klubin tapahtumat oikealla</td>\n<td><strong>Otteluiden otsikko</strong>, <strong>Otteluiden määrä</strong>, <strong>Näytä vain Huuhkajien ja valittujen seurojen ottelut</strong>, <strong>Näytä myös näiden seurojen ottelut</strong>, <strong>Tapahtumien otsikko</strong>, <strong>Tapahtumien määrä</strong></td>\n</tr>\n<tr>\n<td><strong>Tulevat tapahtumat</strong></td>\n<td>Klubin seuraavat tapahtumat</td>\n<td><strong>Otsikko</strong>, <strong>Näytettävien määrä</strong></td>\n</tr>\n<tr>\n<td><strong>Esittelyteksti (Klubista)</strong></td>\n<td>Kuva vasemmalla, teksti oikealla</td>\n<td><strong>Yläotsake</strong>, <strong>Otsikko</strong>, <strong>Teksti</strong>, <strong>Kuva</strong>, <strong>Linkin teksti</strong>, <strong>Linkin kohde</strong></td>\n</tr>\n<tr>\n<td><strong>Ravintola-arviot</strong></td>\n<td>Tuoreimmin arvioidut ravintolat</td>\n<td><strong>Yläotsake</strong>, <strong>Otsikko</strong>, <strong>Kaupunki (suodatin, valinnainen)</strong>, <strong>Näytettävien määrä</strong></td>\n</tr>\n<tr>\n<td><strong>Jalkapalloarkisto-nosto</strong></td>\n<td>Lyhyt esittely ja nappi arkistoon</td>\n<td><strong>Otsikko</strong>, <strong>Teksti</strong>, <strong>Napin teksti</strong>, <strong>Napin kohde</strong></td>\n</tr>\n<tr>\n<td><strong>Galleria-nosto</strong></td>\n<td>Uusimmat kuva-albumit</td>\n<td><strong>Otsikko</strong>, <strong>Näytettävien albumien määrä</strong></td>\n</tr>\n</tbody>\n</table>\n<ul>\n<li>Seurat: kirjoita kohtaan <strong>Näytä myös näiden seurojen ottelut</strong> seuran nimi kuten Veikkausliigan sivuilla, esimerkiksi FC Lahti, ja paina Enter. Lista ohjaa myös Ottelut-sivua, vaikka lohko olisi piilotettu.</li>\n<li><strong>Napin kohde</strong> on valinnainen. Tyhjänä nappi vie jalkapalloarkiston etusivulle.</li>\n</ul>\n<div class=\"markdown-alert markdown-alert-note\">\n<p class=\"markdown-alert-title\">Hyvä tietää</p>\n<p>Lohkon rivin valikon ⋯ kohta <strong>Poista</strong> poistaa lohkon asetuksineen. Jos haluat lohkon pois vain\nhetkeksi, käytä kytkintä <strong>Piilota lohko sivulta</strong>. Vahingossa poistetun lohkon saat takaisin aiemmasta\nversiosta: <a href=\"/studio/ohjeet/luonnos-julkaisu-ja-peruminen\" data-ohje-kortti=\"luonnos-julkaisu-ja-peruminen\">Luonnos, julkaisu ja peruminen</a>.</p>\n</div>\n<h2 id=\"etusivun-lohkot--jos-jokin-menee-vikaan\">Jos jokin menee vikaan</h2>\n<ul>\n<li>Keltainen &quot;Lisää linkin kohde tai poista linkin teksti.&quot;: esittelytekstin linkiltä puuttuu kohde. Valitse <strong>Linkin kohde</strong> tai poista <strong>Linkin teksti</strong>.</li>\n<li>Aloituksessa lukee &quot;Etusivun Klubista-lohkosta puuttuu kuva (Etusivu → Lohkot).&quot;: avaa lohko <strong>Esittelyteksti (Klubista)</strong> ja lisää <strong>Kuva</strong>.</li>\n<li>Seuran ottelut eivät näy: otteluita haetaan itsestään vain Veikkausliigasta. Lisää muut ottelut käsin: <a href=\"/studio/ohjeet/ottelun-lisaaminen\" data-ohje-kortti=\"ottelun-lisaaminen\">Lisää ottelu</a>.</li>\n</ul>\n<p>Katso myös: <a href=\"/studio/ohjeet/etusivu-ylaosa\" data-ohje-kortti=\"etusivu-ylaosa\">Muuta etusivun yläosaa</a> · <a href=\"/studio/ohjeet/muutos-ei-nay-sivustolla\" data-ohje-kortti=\"muutos-ei-nay-sivustolla\">Muutos ei näy sivustolla</a></p>\n",
          "teksti": "Milloin Etusivulla on yläosan alla lohkoja, esimerkiksi jutut, otteluohjelma ja ravintola-arviot. Tässä muutat niiden järjestystä, piilotat lohkon tai lisäät uuden. Lohkon sisältö, esimerkiksi jutut ja ottelut, tulee itsestään. Avaa Etusivu Askeleet Vasemmasta valikosta valitse Sivuston asetukset . Valitse Etusivu . Lomakkeen yläreunasta valitse välilehti Lohkot . ③ Lohkot ovat listassa samassa järjestyksessä kuin etusivulla. Järjestys: tartu lohkon kahvaan (⋮⋮) ja vedä lohko uuteen kohtaan. ④ Piilotus: avaa lohko napsauttamalla sitä ja käännä kytkin Piilota lohko sivulta päälle. ⑤ Lohkon kohdalla listassa lukee Piilotettu. Asetukset säilyvät. Uusi lohko: listan alla paina Lisää kohde... ja valitse avautuvasta listasta lohkon tyyppi. ⑥ Uusi lohko tulee listan loppuun. Muokkaa lohkon asetuksia. Ne on lueteltu alla kohdassa Lisävalinnat. ⑦ Oikeassa alakulmassa paina Julkaise . Tulos Etusivu muuttuu viimeistään minuutin kuluttua. Piilotettu lohko palaa, kun käännät kytkimen pois päältä ja julkaiset. Lisävalinnat Lohkojen tyypit ja asetukset: Lohko Mitä etusivulla näkyy Asetukset Jutut (uusimmat uutiset) Uusin juttu isona, seuraavat listana Yläotsake , Otsikko , Näytettävien määrä Otteluohjelma ja tapahtumat Tulevat ottelut vasemmalla, klubin tapahtumat oikealla Otteluiden otsikko , Otteluiden määrä , Näytä vain Huuhkajien ja valittujen seurojen ottelut , Näytä myös näiden seurojen ottelut , Tapahtumien otsikko , Tapahtumien määrä Tulevat tapahtumat Klubin seuraavat tapahtumat Otsikko , Näytettävien määrä Esittelyteksti (Klubista) Kuva vasemmalla, teksti oikealla Yläotsake , Otsikko , Teksti , Kuva , Linkin teksti , Linkin kohde Ravintola-arviot Tuoreimmin arvioidut ravintolat Yläotsake , Otsikko , Kaupunki (suodatin, valinnainen) , Näytettävien määrä Jalkapalloarkisto-nosto Lyhyt esittely ja nappi arkistoon Otsikko , Teksti , Napin teksti , Napin kohde Galleria-nosto Uusimmat kuva-albumit Otsikko , Näytettävien albumien määrä Seurat: kirjoita kohtaan Näytä myös näiden seurojen ottelut seuran nimi kuten Veikkausliigan sivuilla, esimerkiksi FC Lahti, ja paina Enter. Lista ohjaa myös Ottelut-sivua, vaikka lohko olisi piilotettu. Napin kohde on valinnainen. Tyhjänä nappi vie jalkapalloarkiston etusivulle. Lohkon rivin valikon ⋯ kohta Poista poistaa lohkon asetuksineen. Jos haluat lohkon pois vain hetkeksi, käytä kytkintä Piilota lohko sivulta . Vahingossa poistetun lohkon saat takaisin aiemmasta versiosta: Luonnos, julkaisu ja peruminen . Jos jokin menee vikaan Keltainen \"Lisää linkin kohde tai poista linkin teksti.\": esittelytekstin linkiltä puuttuu kohde. Valitse Linkin kohde tai poista Linkin teksti . Aloituksessa lukee \"Etusivun Klubista-lohkosta puuttuu kuva (Etusivu → Lohkot).\": avaa lohko Esittelyteksti (Klubista) ja lisää Kuva . Seuran ottelut eivät näy: otteluita haetaan itsestään vain Veikkausliigasta. Lisää muut ottelut käsin: Lisää ottelu . Katso myös: Muuta etusivun yläosaa · Muutos ei näy sivustolla",
          "otsikot": [
            {
              "id": "etusivun-lohkot--milloin",
              "teksti": "Milloin",
              "taso": 2
            },
            {
              "id": "etusivun-lohkot--askeleet",
              "teksti": "Askeleet",
              "taso": 2
            },
            {
              "id": "etusivun-lohkot--tulos",
              "teksti": "Tulos",
              "taso": 2
            },
            {
              "id": "etusivun-lohkot--lisavalinnat",
              "teksti": "Lisävalinnat",
              "taso": 2
            },
            {
              "id": "etusivun-lohkot--jos-jokin-menee-vikaan",
              "teksti": "Jos jokin menee vikaan",
              "taso": 2
            }
          ]
        },
        {
          "id": "valikko-ja-alatunniste",
          "otsikko": "Muokkaa valikkoa ja alatunnistetta",
          "osio": "sivusto",
          "avainsanat": [
            "valikko",
            "navigaatio",
            "päävalikko",
            "alavalikko",
            "linkki valikkoon",
            "alatunniste",
            "sivun alareuna",
            "footer",
            "järjestys",
            "Galleria",
            "Tapahtumat"
          ],
          "tyypit": [
            "navigaatio"
          ],
          "kesto": "noin 10 minuuttia",
          "paivitetty": "2026-10-08",
          "html": "<h2 id=\"valikko-ja-alatunniste--milloin\">Milloin</h2>\n<p>Kun haluat lisätä valikkoon sivun, nimetä kohdan uudelleen tai muuttaa järjestystä.\nSama valikko näkyy sivuston yläreunassa ja alatunnisteessa sivun alareunassa.</p>\n<p><a href=\"/studio/intent/edit/id=navigaatio\" data-ohje-studio=\"1\">Avaa Navigaatio</a></p>\n<h2 id=\"valikko-ja-alatunniste--askeleet\">Askeleet</h2>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/valikko-ja-alatunniste-01-lista.webp\" aria-label=\"Suurenna kuva: Navigaation lomake. 1: Sivuston asetukset. 2: Navigaatio. 4: Lisää kohde -painike. 7: kohdan kahva.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/valikko-ja-alatunniste-01-lista.webp\" alt=\"Navigaation lomake. 1: Sivuston asetukset. 2: Navigaatio. 4: Lisää kohde -painike. 7: kohdan kahva.\" width=\"1600\" height=\"1200\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol>\n<li>Vasemmasta valikosta valitse <strong>Sivuston asetukset</strong>. ①</li>\n<li>Valitse <strong>Navigaatio</strong>. ②</li>\n<li>Vanhan kohdan muutos: avaa kohta ja muuta <strong>Otsikko</strong> tai valittu <strong>Sivu</strong>. Siirry sitten askeleeseen 7.</li>\n<li>Uusi kohta: kohdan <strong>Päänavigaation linkit</strong> alla paina <strong>Lisää kohde</strong>. ④</li>\n</ol>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/valikko-ja-alatunniste-02-kohta.webp\" aria-label=\"Suurenna kuva: Avattu valikon kohta. 5: Otsikko. 6: Mihin linkki vie? ja Sivu. 8: Alavalikko.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/valikko-ja-alatunniste-02-kohta.webp\" alt=\"Avattu valikon kohta. 5: Otsikko. 6: Mihin linkki vie? ja Sivu. 8: Alavalikko.\" width=\"649\" height=\"1231\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol start=\"5\">\n<li>Kirjoita <strong>Otsikko</strong>, esimerkiksi Historia. ⑤</li>\n<li>Kohdassa <strong>Mihin linkki vie?</strong> on valmiina <strong>Sivuston sivu</strong>. Kirjoita kenttään <strong>Sivu</strong> sivun nimen alkua ja valitse listasta. ⑥\nKohdan alla näkyy osoite, esimerkiksi &quot;→ /klubi/historia&quot;.</li>\n<li>Järjestys: tartu kohdan kahvaan (⋮⋮) ja vedä se paikalleen. ⑦</li>\n<li>Alavalikko: avaa kohta, ja kohdan <strong>Alavalikko</strong> alla paina <strong>Lisää kohde</strong>. Täytä kuten askeleissa 5 ja 6. ⑧</li>\n<li>Oikeassa alakulmassa paina <strong>Julkaise</strong>.</li>\n</ol>\n<h2 id=\"valikko-ja-alatunniste--tulos\">Tulos</h2>\n<ul>\n<li>Valikko muuttuu viimeistään minuutin kuluttua.</li>\n<li>Alatunniste muuttuu samalla. Kohdat, joilla on alavalikko, näkyvät alatunnisteessa omina sarakkeinaan. Muut kohdat ovat sarakkeessa Sivusto.</li>\n<li>Yhteystiedot sekä linkit Tietosuojaseloste ja Ylläpito ovat alatunnisteessa aina.</li>\n</ul>\n<h2 id=\"valikko-ja-alatunniste--lisavalinnat\">Lisävalinnat</h2>\n<ul>\n<li>Linkki toiselle sivustolle: valitse <strong>Mihin linkki vie?</strong> -kohdasta <strong>Muu osoite</strong> ja kirjoita osoite, joka alkaa https://. Ohje: <a href=\"/studio/ohjeet/linkit\" data-ohje-kortti=\"linkit\">Tee linkki</a>.</li>\n<li>Tyhjät osiot piiloutuvat valikosta itsestään, esimerkiksi Tapahtumat ilman yhtään tapahtumaa. Kun julkaiset ensimmäisen tapahtuman tai albumin, lisää Tapahtumat tai Galleria valikkoon.</li>\n<li>Jos alavalikossa ei ole pääkohdan omaa sivua, alatunnisteen sarakkeen alkuun tulee linkki Yleisesittely.</li>\n</ul>\n<h2 id=\"valikko-ja-alatunniste--jos-jokin-menee-vikaan\">Jos jokin menee vikaan</h2>\n<ul>\n<li>Keltainen &quot;Enintään 7 päälinkkiä, jotta valikko mahtuu puhelimen näytölle.&quot;: valikossa on yli seitsemän pääkohtaa. Siirrä osa jonkin kohdan alavalikkoon.</li>\n<li>Kohta puuttuu sivustolta ja kentän alla lukee &quot;… ei ole vielä julkaistu.&quot;: julkaise ensin sivu, johon kohta vie.</li>\n<li><strong>Julkaise</strong> ei onnistu, ja kentän alla lukee &quot;Valitse sivu, johon linkki vie.&quot;: valitse sivu kenttään <strong>Sivu</strong>.</li>\n</ul>\n<p>Katso myös: <a href=\"/studio/ohjeet/uusi-sivu\" data-ohje-kortti=\"uusi-sivu\">Tee uusi sivu</a> · <a href=\"/studio/ohjeet/linkki-vie-vaaraan-paikkaan\" data-ohje-kortti=\"linkki-vie-vaaraan-paikkaan\">Linkki vie väärään paikkaan</a></p>\n",
          "teksti": "Milloin Kun haluat lisätä valikkoon sivun, nimetä kohdan uudelleen tai muuttaa järjestystä. Sama valikko näkyy sivuston yläreunassa ja alatunnisteessa sivun alareunassa. Avaa Navigaatio Askeleet Vasemmasta valikosta valitse Sivuston asetukset . ① Valitse Navigaatio . ② Vanhan kohdan muutos: avaa kohta ja muuta Otsikko tai valittu Sivu . Siirry sitten askeleeseen 7. Uusi kohta: kohdan Päänavigaation linkit alla paina Lisää kohde . ④ Kirjoita Otsikko , esimerkiksi Historia. ⑤ Kohdassa Mihin linkki vie? on valmiina Sivuston sivu . Kirjoita kenttään Sivu sivun nimen alkua ja valitse listasta. ⑥ Kohdan alla näkyy osoite, esimerkiksi \"→ /klubi/historia\". Järjestys: tartu kohdan kahvaan (⋮⋮) ja vedä se paikalleen. ⑦ Alavalikko: avaa kohta, ja kohdan Alavalikko alla paina Lisää kohde . Täytä kuten askeleissa 5 ja 6. ⑧ Oikeassa alakulmassa paina Julkaise . Tulos Valikko muuttuu viimeistään minuutin kuluttua. Alatunniste muuttuu samalla. Kohdat, joilla on alavalikko, näkyvät alatunnisteessa omina sarakkeinaan. Muut kohdat ovat sarakkeessa Sivusto. Yhteystiedot sekä linkit Tietosuojaseloste ja Ylläpito ovat alatunnisteessa aina. Lisävalinnat Linkki toiselle sivustolle: valitse Mihin linkki vie? -kohdasta Muu osoite ja kirjoita osoite, joka alkaa https://. Ohje: Tee linkki . Tyhjät osiot piiloutuvat valikosta itsestään, esimerkiksi Tapahtumat ilman yhtään tapahtumaa. Kun julkaiset ensimmäisen tapahtuman tai albumin, lisää Tapahtumat tai Galleria valikkoon. Jos alavalikossa ei ole pääkohdan omaa sivua, alatunnisteen sarakkeen alkuun tulee linkki Yleisesittely. Jos jokin menee vikaan Keltainen \"Enintään 7 päälinkkiä, jotta valikko mahtuu puhelimen näytölle.\": valikossa on yli seitsemän pääkohtaa. Siirrä osa jonkin kohdan alavalikkoon. Kohta puuttuu sivustolta ja kentän alla lukee \"… ei ole vielä julkaistu.\": julkaise ensin sivu, johon kohta vie. Julkaise ei onnistu, ja kentän alla lukee \"Valitse sivu, johon linkki vie.\": valitse sivu kenttään Sivu . Katso myös: Tee uusi sivu · Linkki vie väärään paikkaan",
          "otsikot": [
            {
              "id": "valikko-ja-alatunniste--milloin",
              "teksti": "Milloin",
              "taso": 2
            },
            {
              "id": "valikko-ja-alatunniste--askeleet",
              "teksti": "Askeleet",
              "taso": 2
            },
            {
              "id": "valikko-ja-alatunniste--tulos",
              "teksti": "Tulos",
              "taso": 2
            },
            {
              "id": "valikko-ja-alatunniste--lisavalinnat",
              "teksti": "Lisävalinnat",
              "taso": 2
            },
            {
              "id": "valikko-ja-alatunniste--jos-jokin-menee-vikaan",
              "teksti": "Jos jokin menee vikaan",
              "taso": 2
            }
          ]
        },
        {
          "id": "uusi-sivu",
          "otsikko": "Tee uusi sivu",
          "osio": "sivusto",
          "avainsanat": [
            "sivu",
            "uusi sivu",
            "säännöt",
            "historia",
            "alasivu",
            "tekstisivu",
            "tietosuoja",
            "englanniksi",
            "osoite"
          ],
          "tyypit": [
            "sivu"
          ],
          "kesto": "noin 10 minuuttia",
          "paivitetty": "2026-10-08",
          "html": "<h2 id=\"uusi-sivu--milloin\">Milloin</h2>\n<p>Kun tarvitset uuden tekstisivun, esimerkiksi säännöt tai klubin historian. Uutinen ei ole\nsivu: uutisen ohje on erikseen.</p>\n<p><a href=\"/studio/structure/sivut\" data-ohje-studio=\"1\">Avaa Sivut</a></p>\n<h2 id=\"uusi-sivu--askeleet\">Askeleet</h2>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/uusi-sivu-01-lista.webp\" aria-label=\"Suurenna kuva: Sivujen lista. 1: Sivut vasemmassa valikossa. 2: Plus-painike listan yläreunassa.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/uusi-sivu-01-lista.webp\" alt=\"Sivujen lista. 1: Sivut vasemmassa valikossa. 2: Plus-painike listan yläreunassa.\" width=\"701\" height=\"750\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol>\n<li>Vasemmasta valikosta valitse <strong>Sivut</strong>. ①</li>\n<li>Listan yläreunassa paina plus-painiketta (+). ②\nTyhjä lomake avautuu oikealle.</li>\n</ol>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/uusi-sivu-02-lomake.webp\" aria-label=\"Suurenna kuva: Uuden sivun lomake. 3: Otsikko. 4: Osoite sivustolla ja Luo. 5: Tiivistelmä sivun alussa. 6: Pääsisältö.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/uusi-sivu-02-lomake.webp\" alt=\"Uuden sivun lomake. 3: Otsikko. 4: Osoite sivustolla ja Luo. 5: Tiivistelmä sivun alussa. 6: Pääsisältö.\" width=\"661\" height=\"1745\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol start=\"3\">\n<li>Kirjoita <strong>Otsikko</strong>, esimerkiksi Klubin säännöt. ③</li>\n<li>Kentän <strong>Osoite sivustolla</strong> vieressä paina <strong>Luo</strong>. ④\nKenttään tulee otsikosta tehty osoite, esimerkiksi klubin-saannot.\nAlasivulle kirjoita alkuun yläsivun osoite ja kauttaviiva, esimerkiksi klubi/historia.</li>\n<li>Kirjoita <strong>Tiivistelmä sivun alussa</strong>: kaksi tai kolme virkettä. ⑤</li>\n<li>Kirjoita teksti kenttään <strong>Pääsisältö</strong>. ⑥</li>\n<li>Oikeassa alakulmassa paina <strong>Julkaise</strong>.</li>\n</ol>\n<h2 id=\"uusi-sivu--tulos\">Tulos</h2>\n<ul>\n<li>Sivu näkyy osoitteessa, jonka annoit, esimerkiksi <a href=\"https://www.lahdensuomalainenklubi.com/klubi/historia\" target=\"_blank\" rel=\"noopener noreferrer\">https://www.lahdensuomalainenklubi.com/klubi/historia</a>.</li>\n<li>Sivu ei tule valikkoon itsestään. Lisää se valikkoon: <a href=\"/studio/ohjeet/valikko-ja-alatunniste\" data-ohje-kortti=\"valikko-ja-alatunniste\">Muokkaa valikkoa ja alatunnistetta</a>.</li>\n</ul>\n<h2 id=\"uusi-sivu--lisavalinnat\">Lisävalinnat</h2>\n<ul>\n<li>Kuva sivun yläosaan: <strong>Iso kuva sivun yläosassa</strong>.</li>\n<li>Taulukot sivun loppuun: kohta <strong>Taulukot</strong>. Taulukko tehdään ensin: <a href=\"/studio/ohjeet/uusi-tilastotaulukko\" data-ohje-kortti=\"uusi-tilastotaulukko\">Tee uusi taulukko</a>.</li>\n<li>Tekstin lisäosat, kuten kuva, liite, painike ja kartta: <a href=\"/studio/ohjeet/kuva\" data-ohje-kortti=\"kuva\">Lisää kuva</a> · <a href=\"/studio/ohjeet/linkit\" data-ohje-kortti=\"linkit\">Tee linkki</a>.</li>\n<li>Muun kuin suomenkielinen sivu: valitse <strong>Sisällön kieli</strong>. Ruudunlukija ääntää tekstin silloin oikein.</li>\n<li>Pohjaksi olemassa oleva sivu: avaa sivu ja valitse <strong>Julkaise</strong>-painikkeen vieressä olevasta valikosta <strong>Kopioi pohjaksi</strong>.</li>\n</ul>\n<h2 id=\"uusi-sivu--jos-jokin-menee-vikaan\">Jos jokin menee vikaan</h2>\n<ul>\n<li>&quot;Tämä osoite on sivuston oma osio, joten sivu ei näkyisi siinä. Valitse toinen osoite.&quot;: osoite kuuluu sivuston omalle osiolle, esimerkiksi uutiset. Valitse toinen osoite.</li>\n<li>&quot;Tämä osoite kuuluu sivuston omalle sivulle (Studiossa kohdassa Osioiden sivut tai Klubi). Muokkaa sitä siellä, tai valitse tälle sivulle toinen osoite.&quot;: sivu on jo olemassa. Muokkaa sitä: <a href=\"/studio/ohjeet/osioiden-sivut\" data-ohje-kortti=\"osioiden-sivut\">Muokkaa listasivun otsikkoa ja johdantoa</a>.</li>\n<li>Punainen &quot;Virheellinen osoitteen osa …&quot;: käytä osoitteessa vain pieniä kirjaimia, numeroita ja yhdysmerkkejä. Kirjoita ä:n tilalle a ja ö:n tilalle o.</li>\n</ul>\n<div class=\"markdown-alert markdown-alert-note\">\n<p class=\"markdown-alert-title\">Hyvä tietää</p>\n<p>Uusi Klubi-osion alasivu, esimerkiksi klubi/jasenyys, ei näy Klubi-sivun välilehdissä.\nLisää siihen linkki valikkoon tai toisen sivun tekstiin.</p>\n</div>\n<p>Katso myös: <a href=\"/studio/ohjeet/osoitteen-muuttaminen\" data-ohje-kortti=\"osoitteen-muuttaminen\">Muuta sivun osoitetta</a> · <a href=\"/studio/ohjeet/valikko-ja-alatunniste\" data-ohje-kortti=\"valikko-ja-alatunniste\">Muokkaa valikkoa ja alatunnistetta</a></p>\n",
          "teksti": "Milloin Kun tarvitset uuden tekstisivun, esimerkiksi säännöt tai klubin historian. Uutinen ei ole sivu: uutisen ohje on erikseen. Avaa Sivut Askeleet Vasemmasta valikosta valitse Sivut . ① Listan yläreunassa paina plus-painiketta (+). ② Tyhjä lomake avautuu oikealle. Kirjoita Otsikko , esimerkiksi Klubin säännöt. ③ Kentän Osoite sivustolla vieressä paina Luo . ④ Kenttään tulee otsikosta tehty osoite, esimerkiksi klubin-saannot. Alasivulle kirjoita alkuun yläsivun osoite ja kauttaviiva, esimerkiksi klubi/historia. Kirjoita Tiivistelmä sivun alussa : kaksi tai kolme virkettä. ⑤ Kirjoita teksti kenttään Pääsisältö . ⑥ Oikeassa alakulmassa paina Julkaise . Tulos Sivu näkyy osoitteessa, jonka annoit, esimerkiksi https://www.lahdensuomalainenklubi.com/klubi/historia . Sivu ei tule valikkoon itsestään. Lisää se valikkoon: Muokkaa valikkoa ja alatunnistetta . Lisävalinnat Kuva sivun yläosaan: Iso kuva sivun yläosassa . Taulukot sivun loppuun: kohta Taulukot . Taulukko tehdään ensin: Tee uusi taulukko . Tekstin lisäosat, kuten kuva, liite, painike ja kartta: Lisää kuva · Tee linkki . Muun kuin suomenkielinen sivu: valitse Sisällön kieli . Ruudunlukija ääntää tekstin silloin oikein. Pohjaksi olemassa oleva sivu: avaa sivu ja valitse Julkaise -painikkeen vieressä olevasta valikosta Kopioi pohjaksi . Jos jokin menee vikaan \"Tämä osoite on sivuston oma osio, joten sivu ei näkyisi siinä. Valitse toinen osoite.\": osoite kuuluu sivuston omalle osiolle, esimerkiksi uutiset. Valitse toinen osoite. \"Tämä osoite kuuluu sivuston omalle sivulle (Studiossa kohdassa Osioiden sivut tai Klubi). Muokkaa sitä siellä, tai valitse tälle sivulle toinen osoite.\": sivu on jo olemassa. Muokkaa sitä: Muokkaa listasivun otsikkoa ja johdantoa . Punainen \"Virheellinen osoitteen osa …\": käytä osoitteessa vain pieniä kirjaimia, numeroita ja yhdysmerkkejä. Kirjoita ä:n tilalle a ja ö:n tilalle o. Uusi Klubi-osion alasivu, esimerkiksi klubi/jasenyys, ei näy Klubi-sivun välilehdissä. Lisää siihen linkki valikkoon tai toisen sivun tekstiin. Katso myös: Muuta sivun osoitetta · Muokkaa valikkoa ja alatunnistetta",
          "otsikot": [
            {
              "id": "uusi-sivu--milloin",
              "teksti": "Milloin",
              "taso": 2
            },
            {
              "id": "uusi-sivu--askeleet",
              "teksti": "Askeleet",
              "taso": 2
            },
            {
              "id": "uusi-sivu--tulos",
              "teksti": "Tulos",
              "taso": 2
            },
            {
              "id": "uusi-sivu--lisavalinnat",
              "teksti": "Lisävalinnat",
              "taso": 2
            },
            {
              "id": "uusi-sivu--jos-jokin-menee-vikaan",
              "teksti": "Jos jokin menee vikaan",
              "taso": 2
            }
          ]
        },
        {
          "id": "osioiden-sivut",
          "otsikko": "Muokkaa listasivun otsikkoa ja johdantoa",
          "osio": "sivusto",
          "avainsanat": [
            "osion sivu",
            "listasivu",
            "johdanto",
            "otsikko",
            "ingressi",
            "hakukoneet",
            "Google",
            "Tapahtumat-sivu",
            "Uutiset-sivu",
            "Ravintola-arviot",
            "arkiston kortti",
            "Hallitus-sivu",
            "Toiminta-sivu"
          ],
          "tyypit": [
            "sivu"
          ],
          "kesto": "noin 5 minuuttia",
          "paivitetty": "2026-10-08",
          "html": "<h2 id=\"osioiden-sivut--milloin\">Milloin</h2>\n<p>Sivuston listasivuilla, kuten Uutiset, Tapahtumat ja Ravintola-arviot, lista tai taulukot\ntulevat itsestään. Otsikon, sen alla näkyvän johdannon ja Googlen tekstin muokkaat itse.</p>\n<p><a href=\"/studio/structure/osiosivut\" data-ohje-studio=\"1\">Avaa Osioiden sivut</a></p>\n<h2 id=\"osioiden-sivut--askeleet\">Askeleet</h2>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/osioiden-sivut-01-lomake.webp\" aria-label=\"Suurenna kuva: Osion sivun lomake. 1: Osioiden sivut. 2: Uutiset ja tapahtumat. 3: Tapahtumat. 5: Tiivistelmä. 6: Hakukoneet ja jako.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/osioiden-sivut-01-lomake.webp\" alt=\"Osion sivun lomake. 1: Osioiden sivut. 2: Uutiset ja tapahtumat. 3: Tapahtumat. 5: Tiivistelmä. 6: Hakukoneet ja jako.\" width=\"1600\" height=\"1264\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol>\n<li>Vasemmasta valikosta valitse <strong>Osioiden sivut</strong>. ①</li>\n<li>Valitse ryhmä, esimerkiksi <strong>Uutiset ja tapahtumat</strong>. ②</li>\n<li>Valitse sivu, esimerkiksi <strong>Tapahtumat</strong>. ③\nVälilehtien alla sininen laatikko <strong>Tietoa sivusta</strong> kertoo, mitä sivulle tulee itsestään.</li>\n<li>Muokkaa tarvittaessa <strong>Otsikko</strong>.</li>\n<li>Muokkaa johdantoa kentässä <strong>Tiivistelmä sivun alussa</strong>. ⑤</li>\n<li>Halutessasi valitse välilehti <strong>Hakukoneet ja jako</strong> ja kirjoita <strong>Kuvaus hakutuloksissa (valinnainen)</strong>. ⑥\nJos jätät sen tyhjäksi, Google näyttää johdannon.</li>\n<li>Oikeassa alakulmassa paina <strong>Julkaise</strong>.</li>\n</ol>\n<h2 id=\"osioiden-sivut--tulos\">Tulos</h2>\n<ul>\n<li>Uusi otsikko ja johdanto näkyvät sivulla viimeistään minuutin kuluttua.</li>\n<li>Valikon ja välilehtien nimet eivät muutu otsikon mukana.</li>\n</ul>\n<h2 id=\"osioiden-sivut--lisavalinnat\">Lisävalinnat</h2>\n<ul>\n<li>Klubin sivut ovat kohdassa <strong>Klubi</strong>: <strong>Klubi → Hallitus → Hallitus-sivun otsikko ja johdanto</strong>, <strong>Klubi → Toiminta → Toiminta-sivun otsikko ja johdanto</strong> ja <strong>Klubi → Yhteystiedot → Yhteystiedot-sivun otsikko ja johdanto</strong>. Muokkaa niitä samalla tavalla.</li>\n<li>Jalkapalloarkiston osiolla on lisäksi kenttä <strong>Teksti arkiston etusivun kortissa</strong>: yksi lyhyt virke arkiston etusivun korttiin.</li>\n<li>Ravintola-arviot: jos jätät johdannon tyhjäksi, sivusto kirjoittaa sen itse ravintoloiden määrästä. Oma tekstisi korvaa sen, eikä määrä silloin päivity itsestään.</li>\n<li>Uutiset-sivulla kävijä voi valita kategorian. Silloin otsikko ja kuvaus tulevat kategoriasta: <a href=\"/studio/ohjeet/kategoriat-ja-tunnisteet\" data-ohje-kortti=\"kategoriat-ja-tunnisteet\">Kategoriat ja tunnisteet</a>.</li>\n<li>Kaikki osioiden sivut: <a href=\"/studio/ohjeet/valikon-kartta\" data-ohje-kortti=\"valikon-kartta\">Studion valikon kartta</a>.</li>\n</ul>\n<h2 id=\"osioiden-sivut--jos-jokin-menee-vikaan\">Jos jokin menee vikaan</h2>\n<ul>\n<li><strong>Julkaise</strong> ei onnistu, ja kentän alla lukee &quot;Tiivistelmä on tällä sivulla pakollinen: se näkyy otsikon alla johdantona ja hakukoneissa.&quot;: kirjoita johdanto.</li>\n<li>Poisto ja kopiointi ovat harmaina, ja <strong>Osoite sivustolla</strong> on lukittu. Tämä on tarkoituksellista: sivusto hakee sivun aina samasta osoitteesta. Sisällön saat muokata vapaasti.</li>\n</ul>\n<p>Katso myös: <a href=\"/studio/ohjeet/mika-teksti-nakyy-missa\" data-ohje-kortti=\"mika-teksti-nakyy-missa\">Mikä teksti näkyy missä</a> · <a href=\"/studio/ohjeet/esittely\" data-ohje-kortti=\"esittely\">Muokkaa Klubi-sivun esittelyä</a></p>\n",
          "teksti": "Milloin Sivuston listasivuilla, kuten Uutiset, Tapahtumat ja Ravintola-arviot, lista tai taulukot tulevat itsestään. Otsikon, sen alla näkyvän johdannon ja Googlen tekstin muokkaat itse. Avaa Osioiden sivut Askeleet Vasemmasta valikosta valitse Osioiden sivut . ① Valitse ryhmä, esimerkiksi Uutiset ja tapahtumat . ② Valitse sivu, esimerkiksi Tapahtumat . ③ Välilehtien alla sininen laatikko Tietoa sivusta kertoo, mitä sivulle tulee itsestään. Muokkaa tarvittaessa Otsikko . Muokkaa johdantoa kentässä Tiivistelmä sivun alussa . ⑤ Halutessasi valitse välilehti Hakukoneet ja jako ja kirjoita Kuvaus hakutuloksissa (valinnainen) . ⑥ Jos jätät sen tyhjäksi, Google näyttää johdannon. Oikeassa alakulmassa paina Julkaise . Tulos Uusi otsikko ja johdanto näkyvät sivulla viimeistään minuutin kuluttua. Valikon ja välilehtien nimet eivät muutu otsikon mukana. Lisävalinnat Klubin sivut ovat kohdassa Klubi : Klubi → Hallitus → Hallitus-sivun otsikko ja johdanto , Klubi → Toiminta → Toiminta-sivun otsikko ja johdanto ja Klubi → Yhteystiedot → Yhteystiedot-sivun otsikko ja johdanto . Muokkaa niitä samalla tavalla. Jalkapalloarkiston osiolla on lisäksi kenttä Teksti arkiston etusivun kortissa : yksi lyhyt virke arkiston etusivun korttiin. Ravintola-arviot: jos jätät johdannon tyhjäksi, sivusto kirjoittaa sen itse ravintoloiden määrästä. Oma tekstisi korvaa sen, eikä määrä silloin päivity itsestään. Uutiset-sivulla kävijä voi valita kategorian. Silloin otsikko ja kuvaus tulevat kategoriasta: Kategoriat ja tunnisteet . Kaikki osioiden sivut: Studion valikon kartta . Jos jokin menee vikaan Julkaise ei onnistu, ja kentän alla lukee \"Tiivistelmä on tällä sivulla pakollinen: se näkyy otsikon alla johdantona ja hakukoneissa.\": kirjoita johdanto. Poisto ja kopiointi ovat harmaina, ja Osoite sivustolla on lukittu. Tämä on tarkoituksellista: sivusto hakee sivun aina samasta osoitteesta. Sisällön saat muokata vapaasti. Katso myös: Mikä teksti näkyy missä · Muokkaa Klubi-sivun esittelyä",
          "otsikot": [
            {
              "id": "osioiden-sivut--milloin",
              "teksti": "Milloin",
              "taso": 2
            },
            {
              "id": "osioiden-sivut--askeleet",
              "teksti": "Askeleet",
              "taso": 2
            },
            {
              "id": "osioiden-sivut--tulos",
              "teksti": "Tulos",
              "taso": 2
            },
            {
              "id": "osioiden-sivut--lisavalinnat",
              "teksti": "Lisävalinnat",
              "taso": 2
            },
            {
              "id": "osioiden-sivut--jos-jokin-menee-vikaan",
              "teksti": "Jos jokin menee vikaan",
              "taso": 2
            }
          ]
        },
        {
          "id": "osoitteen-muuttaminen",
          "otsikko": "Muuta sivun osoitetta",
          "osio": "sivusto",
          "avainsanat": [
            "osoite",
            "polku",
            "osoite sivustolla",
            "kirjoitusvirhe osoitteessa",
            "nimeä uudelleen",
            "vanha osoite",
            "vanhat linkit",
            "aiemmat osoitteet",
            "ohjaus"
          ],
          "tyypit": [
            "sivu",
            "uutinen",
            "tapahtuma",
            "ravintola",
            "galleriaAlbumi",
            "klubiToiminta",
            "arvokisa",
            "pelaaja",
            "stadion",
            "jalkapalloTilasto",
            "uutisKategoria",
            "kaupunki"
          ],
          "kesto": "noin 3 minuuttia",
          "paivitetty": "2026-10-08",
          "html": "<h2 id=\"osoitteen-muuttaminen--milloin\">Milloin</h2>\n<p>Kun osoitteessa on kirjoitusvirhe tai sivun nimi muuttuu. Vanha osoite ohjautuu uuteen\nitsestään. Vanhat linkit Googlessa, Facebookissa ja esitteissä toimivat siis edelleen.</p>\n<h2 id=\"osoitteen-muuttaminen--ennen-kuin-aloitat\">Ennen kuin aloitat</h2>\n<ul>\n<li>Osoitteen voi muuttaa sivuilta, uutisilta, tapahtumilta, ravintoloilta, galleria-albumeilta, toimintamuodoilta, arvokisoilta, pelaajilta, stadioneilta, taulukoilta, uutiskategorioilta ja kaupungeilta.</li>\n<li>Lukittujen sivujen osoitetta ei voi muuttaa. Niitä ovat osioiden sivut, Klubin pääsivut, tietosuojaseloste ja Jari Litmanen.</li>\n</ul>\n<h2 id=\"osoitteen-muuttaminen--askeleet\">Askeleet</h2>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/osoitteen-muuttaminen-01-tieto.webp\" aria-label=\"Suurenna kuva: Uutisen lomake. 2: Osoite sivustolla ja sininen i-merkki. 3: Julkaise-painike oikeassa alakulmassa.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/osoitteen-muuttaminen-01-tieto.webp\" alt=\"Uutisen lomake. 2: Osoite sivustolla ja sininen i-merkki. 3: Julkaise-painike oikeassa alakulmassa.\" width=\"1280\" height=\"908\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol>\n<li>Avaa sivu, uutinen tai muu, jonka osoitteen haluat muuttaa. Ohje: <a href=\"/studio/ohjeet/etsi-haulla\" data-ohje-kortti=\"etsi-haulla\">Etsi haulla</a>.</li>\n<li>Kirjoita uusi osoite kenttään <strong>Osoite sivustolla</strong>. ②\nKentän nimen viereen tulee sininen i-merkki. Vie hiiri sen päälle: tieto kertoo, että vanha\nosoite ohjautuu uuteen, kun julkaiset.</li>\n<li>Oikeassa alakulmassa paina <strong>Julkaise</strong>. ③</li>\n<li>Kokeile vanhaa osoitetta selaimessa. Sen pitäisi viedä uuteen osoitteeseen.</li>\n</ol>\n<h2 id=\"osoitteen-muuttaminen--tulos\">Tulos</h2>\n<ul>\n<li>Sivu näkyy uudessa osoitteessa heti.</li>\n<li>Vanha osoite ohjautuu uuteen muutaman sekunnin kuluttua.</li>\n<li>Vanha osoite näkyy kentässä <strong>Aiemmat osoitteet</strong>, yleensä välilehdellä <strong>Hakukoneet ja jako</strong>. Kenttä täyttyy itsestään, etkä voi muuttaa sitä.</li>\n<li>Kaikki muuttuneet osoitteet ovat koottuina kohdassa <strong>Sivuston asetukset → Ohjaukset ja lyhytosoitteet → Muuttuneet osoitteet (automaattiset)</strong>.</li>\n</ul>\n<h2 id=\"osoitteen-muuttaminen--lisavalinnat\">Lisävalinnat</h2>\n<ul>\n<li>Sivun alasivujen osoitteet eivät muutu mukana. Sinisen i-merkin tieto kertoo, montako alasivua sivulla on. Muuta niiden osoitteet erikseen.</li>\n<li>Jos palautat osoitteen ennalleen, se poistuu kentästä <strong>Aiemmat osoitteet</strong> itsestään.</li>\n<li>Valikon ja tekstien linkit, joissa on valittu <strong>Sivuston sivu</strong>, seuraavat uutta osoitetta itsestään.</li>\n<li>Taulukon osoite: taulukko näkyy samalla sivulla kuin ennenkin. Vain suora linkki taulukkoon vie jatkossa sivun alkuun.</li>\n</ul>\n<h2 id=\"osoitteen-muuttaminen--jos-jokin-menee-vikaan\">Jos jokin menee vikaan</h2>\n<ul>\n<li><strong>Osoite sivustolla</strong> on harmaa, eikä siihen voi kirjoittaa: sivu on lukittu. Jos osoite on pakko muuttaa, kerro tukihenkilölle.</li>\n<li>Uutisessa punainen &quot;Osoite “arkisto” on varattu uutisosion omalle sivulle. Valitse toinen.&quot;: valitse toinen osoite.</li>\n<li>Keltainen teksti &quot;… Jos muutat sen, vanhat linkit tähän sivuun lakkaavat toimimasta …&quot;: tämän sivun vanha osoite ei ohjaudu itsestään. Palauta vanha osoite tai tee ohjaus: <a href=\"/studio/ohjeet/lyhytosoite\" data-ohje-kortti=\"lyhytosoite\">Tee lyhytosoite esitteeseen</a>.</li>\n</ul>\n<p>Katso myös: <a href=\"/studio/ohjeet/lyhytosoite\" data-ohje-kortti=\"lyhytosoite\">Tee lyhytosoite esitteeseen</a> · <a href=\"/studio/ohjeet/linkki-vie-vaaraan-paikkaan\" data-ohje-kortti=\"linkki-vie-vaaraan-paikkaan\">Linkki vie väärään paikkaan</a></p>\n",
          "teksti": "Milloin Kun osoitteessa on kirjoitusvirhe tai sivun nimi muuttuu. Vanha osoite ohjautuu uuteen itsestään. Vanhat linkit Googlessa, Facebookissa ja esitteissä toimivat siis edelleen. Ennen kuin aloitat Osoitteen voi muuttaa sivuilta, uutisilta, tapahtumilta, ravintoloilta, galleria-albumeilta, toimintamuodoilta, arvokisoilta, pelaajilta, stadioneilta, taulukoilta, uutiskategorioilta ja kaupungeilta. Lukittujen sivujen osoitetta ei voi muuttaa. Niitä ovat osioiden sivut, Klubin pääsivut, tietosuojaseloste ja Jari Litmanen. Askeleet Avaa sivu, uutinen tai muu, jonka osoitteen haluat muuttaa. Ohje: Etsi haulla . Kirjoita uusi osoite kenttään Osoite sivustolla . ② Kentän nimen viereen tulee sininen i-merkki. Vie hiiri sen päälle: tieto kertoo, että vanha osoite ohjautuu uuteen, kun julkaiset. Oikeassa alakulmassa paina Julkaise . ③ Kokeile vanhaa osoitetta selaimessa. Sen pitäisi viedä uuteen osoitteeseen. Tulos Sivu näkyy uudessa osoitteessa heti. Vanha osoite ohjautuu uuteen muutaman sekunnin kuluttua. Vanha osoite näkyy kentässä Aiemmat osoitteet , yleensä välilehdellä Hakukoneet ja jako . Kenttä täyttyy itsestään, etkä voi muuttaa sitä. Kaikki muuttuneet osoitteet ovat koottuina kohdassa Sivuston asetukset → Ohjaukset ja lyhytosoitteet → Muuttuneet osoitteet (automaattiset) . Lisävalinnat Sivun alasivujen osoitteet eivät muutu mukana. Sinisen i-merkin tieto kertoo, montako alasivua sivulla on. Muuta niiden osoitteet erikseen. Jos palautat osoitteen ennalleen, se poistuu kentästä Aiemmat osoitteet itsestään. Valikon ja tekstien linkit, joissa on valittu Sivuston sivu , seuraavat uutta osoitetta itsestään. Taulukon osoite: taulukko näkyy samalla sivulla kuin ennenkin. Vain suora linkki taulukkoon vie jatkossa sivun alkuun. Jos jokin menee vikaan Osoite sivustolla on harmaa, eikä siihen voi kirjoittaa: sivu on lukittu. Jos osoite on pakko muuttaa, kerro tukihenkilölle. Uutisessa punainen \"Osoite “arkisto” on varattu uutisosion omalle sivulle. Valitse toinen.\": valitse toinen osoite. Keltainen teksti \"… Jos muutat sen, vanhat linkit tähän sivuun lakkaavat toimimasta …\": tämän sivun vanha osoite ei ohjaudu itsestään. Palauta vanha osoite tai tee ohjaus: Tee lyhytosoite esitteeseen . Katso myös: Tee lyhytosoite esitteeseen · Linkki vie väärään paikkaan",
          "otsikot": [
            {
              "id": "osoitteen-muuttaminen--milloin",
              "teksti": "Milloin",
              "taso": 2
            },
            {
              "id": "osoitteen-muuttaminen--ennen-kuin-aloitat",
              "teksti": "Ennen kuin aloitat",
              "taso": 2
            },
            {
              "id": "osoitteen-muuttaminen--askeleet",
              "teksti": "Askeleet",
              "taso": 2
            },
            {
              "id": "osoitteen-muuttaminen--tulos",
              "teksti": "Tulos",
              "taso": 2
            },
            {
              "id": "osoitteen-muuttaminen--lisavalinnat",
              "teksti": "Lisävalinnat",
              "taso": 2
            },
            {
              "id": "osoitteen-muuttaminen--jos-jokin-menee-vikaan",
              "teksti": "Jos jokin menee vikaan",
              "taso": 2
            }
          ]
        },
        {
          "id": "lyhytosoite",
          "otsikko": "Tee lyhytosoite esitteeseen",
          "osio": "sivusto",
          "avainsanat": [
            "lyhytosoite",
            "lyhyt osoite",
            "ohjaus",
            "uudelleenohjaus",
            "esite",
            "kirje",
            "jäsenmaksu",
            "poistettu sivu",
            "yhdistetty sivu",
            "ohjaa toiseen sivuun"
          ],
          "tyypit": [
            "ohjaus"
          ],
          "kesto": "noin 5 minuuttia",
          "paivitetty": "2026-10-08",
          "html": "<h2 id=\"lyhytosoite--milloin\">Milloin</h2>\n<p>Kun tarvitset lyhyen osoitteen esitteeseen tai kirjeeseen, esimerkiksi /jasenmaksu.\nKohteen voi vaihtaa myöhemmin, jolloin vanha esite vie uuteen kohteeseen. Samalla tavalla\nohjaat poistetun sivun osoitteen toiselle sivulle.</p>\n<p><a href=\"/studio/structure/asetukset;ohjaukset;lyhytosoitteet\" data-ohje-studio=\"1\">Avaa Lyhytosoitteet ja ohjaukset</a></p>\n<h2 id=\"lyhytosoite--askeleet\">Askeleet</h2>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/lyhytosoite-01-lista.webp\" aria-label=\"Suurenna kuva: Ohjausten lista. 1: Sivuston asetukset. 2: Ohjaukset ja lyhytosoitteet. 3: Lyhytosoitteet ja ohjaukset. 4: Plus-painike.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/lyhytosoite-01-lista.webp\" alt=\"Ohjausten lista. 1: Sivuston asetukset. 2: Ohjaukset ja lyhytosoitteet. 3: Lyhytosoitteet ja ohjaukset. 4: Plus-painike.\" width=\"1600\" height=\"800\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol>\n<li>Vasemmasta valikosta valitse <strong>Sivuston asetukset</strong>. ①</li>\n<li>Valitse <strong>Ohjaukset ja lyhytosoitteet</strong>. ②</li>\n<li>Valitse <strong>Lyhytosoitteet ja ohjaukset</strong>. ③</li>\n<li>Listan yläreunassa paina plus-painiketta (+). ④</li>\n</ol>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/lyhytosoite-02-lomake.webp\" aria-label=\"Suurenna kuva: Uusi ohjaus. 5: Osoite sivustolla. 6: Minne ohjataan. 7: Muistiinpano (ei näy sivuilla).\"><img class=\"ohje-kuva\" src=\"/studio-ohje/lyhytosoite-02-lomake.webp\" alt=\"Uusi ohjaus. 5: Osoite sivustolla. 6: Minne ohjataan. 7: Muistiinpano (ei näy sivuilla).\" width=\"803\" height=\"983\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol start=\"5\">\n<li>Kirjoita kenttään <strong>Osoite sivustolla</strong> lyhyt osoite, esimerkiksi /jasenmaksu. ⑤\nKäytä pieniä kirjaimia. Kirjoita ä:n tilalle a ja ö:n tilalle o. Välilyönnin tilalle tulee yhdysmerkki.</li>\n<li>Kohdassa <strong>Minne ohjataan</strong> valitse kohde. ⑥\n<strong>Sivuston sivu</strong>: kirjoita kenttään <strong>Sivu</strong> sivun nimen alkua ja valitse. <strong>Muu osoite</strong>: toinen sivusto, osoite alkaa https://. <strong>Tiedosto</strong>: esimerkiksi PDF.</li>\n<li>Kirjoita <strong>Muistiinpano (ei näy sivuilla)</strong>, esimerkiksi &quot;Jäsenmaksukirje 2027&quot;. ⑦</li>\n<li>Oikeassa alakulmassa paina <strong>Julkaise</strong>.</li>\n<li>Kokeile osoitetta selaimessa: <a href=\"https://www.lahdensuomalainenklubi.com/jasenmaksu\" target=\"_blank\" rel=\"noopener noreferrer\">https://www.lahdensuomalainenklubi.com/jasenmaksu</a>.</li>\n</ol>\n<h2 id=\"lyhytosoite--tulos\">Tulos</h2>\n<ul>\n<li>Osoite vie valitsemaasi kohteeseen muutaman sekunnin kuluttua.</li>\n<li>Listassa ohjauksen nimenä on osoite. Sen alla näkyvät kohde ja muistiinpano.</li>\n</ul>\n<div class=\"markdown-alert markdown-alert-warning\">\n<p class=\"markdown-alert-title\">Varoitus</p>\n<p>Muistiinpano ei näy sivuilla, mutta sen voi lukea sivuston tietokannasta. Älä kirjoita\nsiihen nimiä tai muita henkilötietoja.</p>\n</div>\n<h2 id=\"lyhytosoite--lisavalinnat\">Lisävalinnat</h2>\n<ul>\n<li>Kohteen vaihto: avaa ohjaus, vaihda <strong>Minne ohjataan</strong> ja julkaise.</li>\n<li>Ohjauksen poisto: avaa ohjaus ja valitse <strong>Julkaise</strong>-painikkeen vieressä olevasta valikosta <strong>Poista</strong>. Osoite näyttää sen jälkeen Sivua ei löytynyt -sivun.</li>\n<li>Poistetun sivun osoite toiselle sivulle: poista ensin vanha sivu. Poiston ikkuna näyttää kohdassa <strong>Nykyinen osoite:</strong> osoitteen, josta ohjaus tehdään. Tee ohjaus siitä osoitteesta heti poiston jälkeen. Yksi ohjaus riittää.</li>\n</ul>\n<h2 id=\"lyhytosoite--jos-jokin-menee-vikaan\">Jos jokin menee vikaan</h2>\n<ul>\n<li>Punainen tai keltainen teksti kentän alla: <a href=\"/studio/ohjeet/ohjauksen-ilmoitukset\" data-ohje-kortti=\"ohjauksen-ilmoitukset\">Lyhytosoitteessa punainen teksti</a>.</li>\n<li>Osoite ei ohjaa: ohjaus toimii vain osoitteessa, jossa ei ole sivua. Sivu voittaa aina. Tarkista myös, että painoit <strong>Julkaise</strong>.</li>\n</ul>\n<p>Katso myös: <a href=\"/studio/ohjeet/osoitteen-muuttaminen\" data-ohje-kortti=\"osoitteen-muuttaminen\">Muuta sivun osoitetta</a> · <a href=\"/studio/ohjeet/et-ehka-voi-poistaa\" data-ohje-kortti=\"et-ehka-voi-poistaa\">Et ehkä voi poistaa</a></p>\n",
          "teksti": "Milloin Kun tarvitset lyhyen osoitteen esitteeseen tai kirjeeseen, esimerkiksi /jasenmaksu. Kohteen voi vaihtaa myöhemmin, jolloin vanha esite vie uuteen kohteeseen. Samalla tavalla ohjaat poistetun sivun osoitteen toiselle sivulle. Avaa Lyhytosoitteet ja ohjaukset Askeleet Vasemmasta valikosta valitse Sivuston asetukset . ① Valitse Ohjaukset ja lyhytosoitteet . ② Valitse Lyhytosoitteet ja ohjaukset . ③ Listan yläreunassa paina plus-painiketta (+). ④ Kirjoita kenttään Osoite sivustolla lyhyt osoite, esimerkiksi /jasenmaksu. ⑤ Käytä pieniä kirjaimia. Kirjoita ä:n tilalle a ja ö:n tilalle o. Välilyönnin tilalle tulee yhdysmerkki. Kohdassa Minne ohjataan valitse kohde. ⑥ Sivuston sivu : kirjoita kenttään Sivu sivun nimen alkua ja valitse. Muu osoite : toinen sivusto, osoite alkaa https://. Tiedosto : esimerkiksi PDF. Kirjoita Muistiinpano (ei näy sivuilla) , esimerkiksi \"Jäsenmaksukirje 2027\". ⑦ Oikeassa alakulmassa paina Julkaise . Kokeile osoitetta selaimessa: https://www.lahdensuomalainenklubi.com/jasenmaksu . Tulos Osoite vie valitsemaasi kohteeseen muutaman sekunnin kuluttua. Listassa ohjauksen nimenä on osoite. Sen alla näkyvät kohde ja muistiinpano. Muistiinpano ei näy sivuilla, mutta sen voi lukea sivuston tietokannasta. Älä kirjoita siihen nimiä tai muita henkilötietoja. Lisävalinnat Kohteen vaihto: avaa ohjaus, vaihda Minne ohjataan ja julkaise. Ohjauksen poisto: avaa ohjaus ja valitse Julkaise -painikkeen vieressä olevasta valikosta Poista . Osoite näyttää sen jälkeen Sivua ei löytynyt -sivun. Poistetun sivun osoite toiselle sivulle: poista ensin vanha sivu. Poiston ikkuna näyttää kohdassa Nykyinen osoite: osoitteen, josta ohjaus tehdään. Tee ohjaus siitä osoitteesta heti poiston jälkeen. Yksi ohjaus riittää. Jos jokin menee vikaan Punainen tai keltainen teksti kentän alla: Lyhytosoitteessa punainen teksti . Osoite ei ohjaa: ohjaus toimii vain osoitteessa, jossa ei ole sivua. Sivu voittaa aina. Tarkista myös, että painoit Julkaise . Katso myös: Muuta sivun osoitetta · Et ehkä voi poistaa",
          "otsikot": [
            {
              "id": "lyhytosoite--milloin",
              "teksti": "Milloin",
              "taso": 2
            },
            {
              "id": "lyhytosoite--askeleet",
              "teksti": "Askeleet",
              "taso": 2
            },
            {
              "id": "lyhytosoite--tulos",
              "teksti": "Tulos",
              "taso": 2
            },
            {
              "id": "lyhytosoite--lisavalinnat",
              "teksti": "Lisävalinnat",
              "taso": 2
            },
            {
              "id": "lyhytosoite--jos-jokin-menee-vikaan",
              "teksti": "Jos jokin menee vikaan",
              "taso": 2
            }
          ]
        }
      ]
    },
    {
      "id": "turvaverkko",
      "otsikko": "Turvaverkko",
      "kortit": [
        {
          "id": "varmuuskopiot",
          "otsikko": "Tarkista ja lataa varmuuskopio",
          "osio": "turvaverkko",
          "avainsanat": [
            "varmuuskopio",
            "backup",
            "kopio",
            "talteen",
            "lataa",
            "tallenna koneelle",
            "pilvi",
            "turvaan",
            "viikkokopio"
          ],
          "tyypit": [
            "varmuuskopio"
          ],
          "kesto": "noin 3 minuuttia",
          "paivitetty": "2026-10-08",
          "html": "<h2 id=\"varmuuskopiot--milloin\">Milloin</h2>\n<p>Kun haluat varmistaa, että sivuston sisältö on tallessa, tai ladata kopion klubin omaan pilveen. Kerran kuussa riittää. Sivusto tekee kopion joka maanantaiyö itse.</p>\n<h2 id=\"varmuuskopiot--askeleet\">Askeleet</h2>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/varmuuskopiot-01-lista.webp\" aria-label=\"Suurenna kuva: Varmuuskopioiden lista. 1: Varmuuskopiot valikossa. 2: uusin kopio listan ylimpänä.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/varmuuskopiot-01-lista.webp\" alt=\"Varmuuskopioiden lista. 1: Varmuuskopiot valikossa. 2: uusin kopio listan ylimpänä.\" width=\"701\" height=\"750\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol>\n<li>Vasemmasta valikosta valitse <strong>Sivuston asetukset → Varmuuskopiot</strong>. ①\nLista <strong>Varmuuskopiot (viikoittain, automaattinen)</strong> aukeaa.</li>\n<li>Tarkista, että ylimmän kopion päivä on alle viikon vanha. ②\nSaman näet Aloituksen rivillä <strong>Varmuuskopio</strong>.</li>\n<li>Avaa uusin kopio. Välilehdellä <strong>Tiedot</strong> näkyvät päivä ja tiedosto.</li>\n</ol>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/varmuuskopiot-02-lataa.webp\" aria-label=\"Suurenna kuva: Avattu varmuuskopio. 4: Tiedosto-kentän valikko, jossa on Lataa.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/varmuuskopiot-02-lataa.webp\" alt=\"Avattu varmuuskopio. 4: Tiedosto-kentän valikko, jossa on Lataa.\" width=\"840\" height=\"750\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol start=\"4\">\n<li>Kentässä <strong>Tiedosto</strong> paina tiedoston oikean reunan kolmea pistettä. ④\nValikossa on kaksi kohtaa <strong>Lataa</strong>. Valitse alempi, jossa on alaspäin osoittava nuoli. Ylempi on harmaa.</li>\n<li>Tallenna tiedosto klubin omaan pilvikansioon.</li>\n</ol>\n<h2 id=\"varmuuskopiot--tulos\">Tulos</h2>\n<ul>\n<li>Kopio on tallessa myös klubin omassa pilvessä.</li>\n<li>Studiossa säilyy 12 viimeisintä viikkokopiota, eli noin kolme kuukautta.</li>\n</ul>\n<h2 id=\"varmuuskopiot--lisavalinnat\">Lisävalinnat</h2>\n<ul>\n<li>Yksittäisen sisällön vanha versio: <a href=\"/studio/ohjeet/vanhan-version-palautus\" data-ohje-kortti=\"vanhan-version-palautus\">Palauta vanha versio varmuuskopiosta</a></li>\n<li>Poistetun sisällön palautus: <a href=\"/studio/ohjeet/poistetun-palautus\" data-ohje-kortti=\"poistetun-palautus\">Palauta poistettu sisältö</a></li>\n</ul>\n<div class=\"markdown-alert markdown-alert-note\">\n<p class=\"markdown-alert-title\">Hyvä tietää</p>\n<p>Kopiossa ovat kaikki julkaistut tekstit ja tiedot, mutta ei kuvia. Kuvat säilyvät Sanityssa, ja tukihenkilö ottaa niistä erillisen kopion isompien muutosten yhteydessä.\nKopioita ei voi muokata eikä poistaa käsin.</p>\n</div>\n<h2 id=\"varmuuskopiot--jos-jokin-menee-vikaan\">Jos jokin menee vikaan</h2>\n<ul>\n<li>Ylin kopio on yli viikon vanha tai Aloituksen rivi <strong>Varmuuskopio</strong> on punainen: kerro tukihenkilölle rivin teksti. Sisältösi on tallessa.</li>\n<li>Lataus ei ala: kokeile toista selainta tai tietokonetta.</li>\n<li>Koko sivuston palautus kopiosta: sen tekee tukihenkilö.</li>\n</ul>\n<p>Katso myös: <a href=\"/studio/ohjeet/aloitus-ja-sivuston-tila\" data-ohje-kortti=\"aloitus-ja-sivuston-tila\">Lue Aloitus ja sivuston tila</a> · <a href=\"/studio/ohjeet/tukihenkilo\" data-ohje-kortti=\"tukihenkilo\">Mihin tarvitset tukihenkilöä</a></p>\n",
          "teksti": "Milloin Kun haluat varmistaa, että sivuston sisältö on tallessa, tai ladata kopion klubin omaan pilveen. Kerran kuussa riittää. Sivusto tekee kopion joka maanantaiyö itse. Askeleet Vasemmasta valikosta valitse Sivuston asetukset → Varmuuskopiot . ① Lista Varmuuskopiot (viikoittain, automaattinen) aukeaa. Tarkista, että ylimmän kopion päivä on alle viikon vanha. ② Saman näet Aloituksen rivillä Varmuuskopio . Avaa uusin kopio. Välilehdellä Tiedot näkyvät päivä ja tiedosto. Kentässä Tiedosto paina tiedoston oikean reunan kolmea pistettä. ④ Valikossa on kaksi kohtaa Lataa . Valitse alempi, jossa on alaspäin osoittava nuoli. Ylempi on harmaa. Tallenna tiedosto klubin omaan pilvikansioon. Tulos Kopio on tallessa myös klubin omassa pilvessä. Studiossa säilyy 12 viimeisintä viikkokopiota, eli noin kolme kuukautta. Lisävalinnat Yksittäisen sisällön vanha versio: Palauta vanha versio varmuuskopiosta Poistetun sisällön palautus: Palauta poistettu sisältö Kopiossa ovat kaikki julkaistut tekstit ja tiedot, mutta ei kuvia. Kuvat säilyvät Sanityssa, ja tukihenkilö ottaa niistä erillisen kopion isompien muutosten yhteydessä. Kopioita ei voi muokata eikä poistaa käsin. Jos jokin menee vikaan Ylin kopio on yli viikon vanha tai Aloituksen rivi Varmuuskopio on punainen: kerro tukihenkilölle rivin teksti. Sisältösi on tallessa. Lataus ei ala: kokeile toista selainta tai tietokonetta. Koko sivuston palautus kopiosta: sen tekee tukihenkilö. Katso myös: Lue Aloitus ja sivuston tila · Mihin tarvitset tukihenkilöä",
          "otsikot": [
            {
              "id": "varmuuskopiot--milloin",
              "teksti": "Milloin",
              "taso": 2
            },
            {
              "id": "varmuuskopiot--askeleet",
              "teksti": "Askeleet",
              "taso": 2
            },
            {
              "id": "varmuuskopiot--tulos",
              "teksti": "Tulos",
              "taso": 2
            },
            {
              "id": "varmuuskopiot--lisavalinnat",
              "teksti": "Lisävalinnat",
              "taso": 2
            },
            {
              "id": "varmuuskopiot--jos-jokin-menee-vikaan",
              "teksti": "Jos jokin menee vikaan",
              "taso": 2
            }
          ]
        },
        {
          "id": "vanhan-version-palautus",
          "otsikko": "Palauta vanha versio varmuuskopiosta",
          "osio": "turvaverkko",
          "avainsanat": [
            "palauta",
            "vanha versio",
            "edellinen versio",
            "varmuuskopio",
            "viikko sitten",
            "kuukausi sitten",
            "virhe",
            "peru",
            "muutin väärin",
            "historia ei riitä"
          ],
          "tyypit": [
            "uutinen",
            "sivu",
            "jalkapalloTilasto",
            "ravintola",
            "tapahtuma",
            "galleriaAlbumi",
            "klubiToiminta",
            "hallitusJasen",
            "pelaaja",
            "arvokisa",
            "stadion",
            "lehtileike",
            "ottelu",
            "kaupunki",
            "uutisKategoria",
            "ohjaus",
            "etusivu",
            "navigaatio",
            "yhteystiedot"
          ],
          "kesto": "noin 5 minuuttia",
          "paivitetty": "2026-10-08",
          "html": "<h2 id=\"vanhan-version-palautus--milloin\">Milloin</h2>\n<p>Kun huomaat virheen, joka on tehty niin kauan sitten, ettei historia enää ulotu siihen. Esimerkiksi taulukosta on kadonnut rivi pari viikkoa sitten.</p>\n<h2 id=\"vanhan-version-palautus--ennen-kuin-aloitat\">Ennen kuin aloitat</h2>\n<ul>\n<li>Tuoreen virheen perut nopeammin historiasta: <a href=\"/studio/ohjeet/luonnos-julkaisu-ja-peruminen\" data-ohje-kortti=\"luonnos-julkaisu-ja-peruminen\">Tallenna, julkaise ja peru muutos</a>.</li>\n</ul>\n<h2 id=\"vanhan-version-palautus--askeleet\">Askeleet</h2>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/vanhan-version-palautus-01-valikko.webp\" aria-label=\"Suurenna kuva: Toimintovalikko. 2: valikon painike Julkaise-painikkeen vieressä. 3: Palauta varmuuskopiosta.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/vanhan-version-palautus-01-valikko.webp\" alt=\"Toimintovalikko. 2: valikon painike Julkaise-painikkeen vieressä. 3: Palauta varmuuskopiosta.\" width=\"646\" height=\"238\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol>\n<li>Avaa sisältö, jossa virhe on, esim. uutinen tai taulukko.</li>\n<li>Oikeassa alakulmassa paina <strong>Julkaise</strong>-painikkeen vieressä olevaa kolmen pisteen painiketta (⋯). ②</li>\n<li>Valitse <strong>Palauta varmuuskopiosta</strong>. ③ Ikkuna aukeaa.</li>\n</ol>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/vanhan-version-palautus-02-ikkuna.webp\" aria-label=\"Suurenna kuva: Palauta varmuuskopiosta -ikkuna. 4: viikon rivi tietoineen. 5: Palauta-painike.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/vanhan-version-palautus-02-ikkuna.webp\" alt=\"Palauta varmuuskopiosta -ikkuna. 4: viikon rivi tietoineen. 5: Palauta-painike.\" width=\"669\" height=\"603\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol start=\"4\">\n<li>Lue viikot, uusin ensin. ④\nRivillä on kopion päivä, sisällön nimi ja milloin sitä oli muokattu, esim. &quot;muokattu 4.10.2026&quot;. Jos versio on sama kuin nyt, rivillä lukee &quot;sama kuin nykyinen julkaistu&quot;.</li>\n<li>Paina sopivan viikon kohdalla <strong>Palauta</strong>. ⑤\nVanha versio tulee luonnokseksi. Sivusto ei vielä muutu.</li>\n<li>Tarkista lomakkeelta, että sisältö on oikea.</li>\n<li>Paina <strong>Julkaise</strong>.</li>\n</ol>\n<h2 id=\"vanhan-version-palautus--tulos\">Tulos</h2>\n<ul>\n<li>Sivustolla näkyy palautettu versio noin minuutin kuluessa.</li>\n</ul>\n<h2 id=\"vanhan-version-palautus--lisavalinnat\">Lisävalinnat</h2>\n<ul>\n<li>Valitsit väärän viikon: palauta toinen viikko, tai valitse toimintovalikosta <strong>Hylkää muutokset</strong>. Silloin kaikki jää ennalleen.</li>\n<li>Kokonaan poistettu sisältö: <a href=\"/studio/ohjeet/poistetun-palautus\" data-ohje-kortti=\"poistetun-palautus\">Palauta poistettu sisältö</a></li>\n</ul>\n<div class=\"markdown-alert markdown-alert-note\">\n<p class=\"markdown-alert-title\">Hyvä tietää</p>\n<p>Kommentteja ja kävijöiden ravintola-arvosteluja ei palauteta varmuuskopiosta.</p>\n</div>\n<h2 id=\"vanhan-version-palautus--jos-jokin-menee-vikaan\">Jos jokin menee vikaan</h2>\n<ul>\n<li>Rivillä ei ole <strong>Palauta</strong>-painiketta: versio on sama kuin nykyinen tai jokin uudempi. Valitse vanhempi viikko.</li>\n<li>Rivillä lukee &quot;Ei mukana: dokumenttia ei silloin ollut julkaistuna.&quot;: sisältöä ei ollut vielä sinä viikkona.</li>\n<li>Ilmoitus kertoo, että tiedosto tai kuva puuttuu: se on ehditty poistaa. Lisää tiedosto uudelleen ennen julkaisua.</li>\n</ul>\n<p>Katso myös: <a href=\"/studio/ohjeet/varmuuskopiot\" data-ohje-kortti=\"varmuuskopiot\">Tarkista ja lataa varmuuskopio</a> · <a href=\"/studio/ohjeet/poistin-vahingossa\" data-ohje-kortti=\"poistin-vahingossa\">Poistin vahingossa</a></p>\n",
          "teksti": "Milloin Kun huomaat virheen, joka on tehty niin kauan sitten, ettei historia enää ulotu siihen. Esimerkiksi taulukosta on kadonnut rivi pari viikkoa sitten. Ennen kuin aloitat Tuoreen virheen perut nopeammin historiasta: Tallenna, julkaise ja peru muutos . Askeleet Avaa sisältö, jossa virhe on, esim. uutinen tai taulukko. Oikeassa alakulmassa paina Julkaise -painikkeen vieressä olevaa kolmen pisteen painiketta (⋯). ② Valitse Palauta varmuuskopiosta . ③ Ikkuna aukeaa. Lue viikot, uusin ensin. ④ Rivillä on kopion päivä, sisällön nimi ja milloin sitä oli muokattu, esim. \"muokattu 4.10.2026\". Jos versio on sama kuin nyt, rivillä lukee \"sama kuin nykyinen julkaistu\". Paina sopivan viikon kohdalla Palauta . ⑤ Vanha versio tulee luonnokseksi. Sivusto ei vielä muutu. Tarkista lomakkeelta, että sisältö on oikea. Paina Julkaise . Tulos Sivustolla näkyy palautettu versio noin minuutin kuluessa. Lisävalinnat Valitsit väärän viikon: palauta toinen viikko, tai valitse toimintovalikosta Hylkää muutokset . Silloin kaikki jää ennalleen. Kokonaan poistettu sisältö: Palauta poistettu sisältö Kommentteja ja kävijöiden ravintola-arvosteluja ei palauteta varmuuskopiosta. Jos jokin menee vikaan Rivillä ei ole Palauta -painiketta: versio on sama kuin nykyinen tai jokin uudempi. Valitse vanhempi viikko. Rivillä lukee \"Ei mukana: dokumenttia ei silloin ollut julkaistuna.\": sisältöä ei ollut vielä sinä viikkona. Ilmoitus kertoo, että tiedosto tai kuva puuttuu: se on ehditty poistaa. Lisää tiedosto uudelleen ennen julkaisua. Katso myös: Tarkista ja lataa varmuuskopio · Poistin vahingossa",
          "otsikot": [
            {
              "id": "vanhan-version-palautus--milloin",
              "teksti": "Milloin",
              "taso": 2
            },
            {
              "id": "vanhan-version-palautus--ennen-kuin-aloitat",
              "teksti": "Ennen kuin aloitat",
              "taso": 2
            },
            {
              "id": "vanhan-version-palautus--askeleet",
              "teksti": "Askeleet",
              "taso": 2
            },
            {
              "id": "vanhan-version-palautus--tulos",
              "teksti": "Tulos",
              "taso": 2
            },
            {
              "id": "vanhan-version-palautus--lisavalinnat",
              "teksti": "Lisävalinnat",
              "taso": 2
            },
            {
              "id": "vanhan-version-palautus--jos-jokin-menee-vikaan",
              "teksti": "Jos jokin menee vikaan",
              "taso": 2
            }
          ]
        },
        {
          "id": "poistetun-palautus",
          "otsikko": "Palauta poistettu sisältö",
          "osio": "turvaverkko",
          "avainsanat": [
            "poistin vahingossa",
            "poistettu",
            "palauta poistettu",
            "katosi",
            "hävisi",
            "kadonnut sivu",
            "kadonnut uutinen",
            "roskakori",
            "takaisin"
          ],
          "tyypit": [
            "varmuuskopio"
          ],
          "kesto": "noin 5 minuuttia",
          "paivitetty": "2026-10-08",
          "html": "<h2 id=\"poistetun-palautus--milloin\">Milloin</h2>\n<p>Kun olet poistanut vahingossa uutisen, sivun tai muun sisällön. Poistetun saa takaisin viikoittaisesta varmuuskopiosta.</p>\n<h2 id=\"poistetun-palautus--askeleet\">Askeleet</h2>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/poistetun-palautus-01-valilehti.webp\" aria-label=\"Suurenna kuva: Varmuuskopion Palauta poistettu -välilehti. 3: välilehti. 4: hakukenttä. 5: Palauta-painike.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/poistetun-palautus-01-valilehti.webp\" alt=\"Varmuuskopion Palauta poistettu -välilehti. 3: välilehti. 4: hakukenttä. 5: Palauta-painike.\" width=\"863\" height=\"750\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol>\n<li>Vasemmasta valikosta valitse <strong>Sivuston asetukset → Varmuuskopiot</strong>.</li>\n<li>Avaa uusin kopio, joka on tehty ennen poistoa.</li>\n<li>Valitse yläreunasta välilehti <strong>Palauta poistettu</strong>. ③\nListassa ovat kaikki kopion jälkeen poistetut sisällöt.</li>\n<li>Kirjoita hakukenttään nimen osa, esim. &quot;vuosikokous&quot;. ④</li>\n<li>Paina oikean rivin kohdalla <strong>Palauta</strong>. ⑤\nSisältö palautuu luonnokseksi.</li>\n<li>Paina saman rivin painiketta <strong>Avaa</strong>.</li>\n<li>Tarkista sisältö ja paina <strong>Julkaise</strong>.</li>\n</ol>\n<h2 id=\"poistetun-palautus--tulos\">Tulos</h2>\n<ul>\n<li>Palautettu sisältö näkyy taas Studion listassa ja julkaisun jälkeen sivustolla.</li>\n</ul>\n<h2 id=\"poistetun-palautus--lisavalinnat\">Lisävalinnat</h2>\n<ul>\n<li>Heti poiston jälkeen: paina selaimen Takaisin-nuolta. Lomake aukeaa, ja yläreunassa lukee <strong>Tämä asiakirja on poistettu.</strong> Paina <strong>Palauta viimeisin versio</strong>, tarkista ja julkaise.</li>\n<li>Olemassa olevan sisällön vanha versio: <a href=\"/studio/ohjeet/vanhan-version-palautus\" data-ohje-kortti=\"vanhan-version-palautus\">Palauta vanha versio varmuuskopiosta</a></li>\n</ul>\n<div class=\"markdown-alert markdown-alert-note\">\n<p class=\"markdown-alert-title\">Hyvä tietää</p>\n<p>Kommentteja ja kävijöiden ravintola-arvosteluja ei palauteta. Niiden poisto on tarkoituksellista.\nSisältöä, joka tehtiin ja poistettiin saman viikon aikana, ei ole missään kopiossa. Kerro silloin tukihenkilölle.</p>\n</div>\n<h2 id=\"poistetun-palautus--jos-jokin-menee-vikaan\">Jos jokin menee vikaan</h2>\n<ul>\n<li>Listassa lukee &quot;Kopion jälkeen ei ole poistettu yhtään dokumenttia.&quot;: avaa vanhempi kopio.</li>\n<li>Ilmoitus kertoo, että tiedosto tai kuva puuttuu: lisää se uudelleen ennen julkaisua.</li>\n<li>Koko sivuston sisältö on kadonnut: älä yritä palauttaa itse. Kerro tukihenkilölle heti.</li>\n</ul>\n<p>Katso myös: <a href=\"/studio/ohjeet/varmuuskopiot\" data-ohje-kortti=\"varmuuskopiot\">Tarkista ja lataa varmuuskopio</a> · <a href=\"/studio/ohjeet/poistin-vahingossa\" data-ohje-kortti=\"poistin-vahingossa\">Poistin vahingossa</a></p>\n",
          "teksti": "Milloin Kun olet poistanut vahingossa uutisen, sivun tai muun sisällön. Poistetun saa takaisin viikoittaisesta varmuuskopiosta. Askeleet Vasemmasta valikosta valitse Sivuston asetukset → Varmuuskopiot . Avaa uusin kopio, joka on tehty ennen poistoa. Valitse yläreunasta välilehti Palauta poistettu . ③ Listassa ovat kaikki kopion jälkeen poistetut sisällöt. Kirjoita hakukenttään nimen osa, esim. \"vuosikokous\". ④ Paina oikean rivin kohdalla Palauta . ⑤ Sisältö palautuu luonnokseksi. Paina saman rivin painiketta Avaa . Tarkista sisältö ja paina Julkaise . Tulos Palautettu sisältö näkyy taas Studion listassa ja julkaisun jälkeen sivustolla. Lisävalinnat Heti poiston jälkeen: paina selaimen Takaisin-nuolta. Lomake aukeaa, ja yläreunassa lukee Tämä asiakirja on poistettu. Paina Palauta viimeisin versio , tarkista ja julkaise. Olemassa olevan sisällön vanha versio: Palauta vanha versio varmuuskopiosta Kommentteja ja kävijöiden ravintola-arvosteluja ei palauteta. Niiden poisto on tarkoituksellista. Sisältöä, joka tehtiin ja poistettiin saman viikon aikana, ei ole missään kopiossa. Kerro silloin tukihenkilölle. Jos jokin menee vikaan Listassa lukee \"Kopion jälkeen ei ole poistettu yhtään dokumenttia.\": avaa vanhempi kopio. Ilmoitus kertoo, että tiedosto tai kuva puuttuu: lisää se uudelleen ennen julkaisua. Koko sivuston sisältö on kadonnut: älä yritä palauttaa itse. Kerro tukihenkilölle heti. Katso myös: Tarkista ja lataa varmuuskopio · Poistin vahingossa",
          "otsikot": [
            {
              "id": "poistetun-palautus--milloin",
              "teksti": "Milloin",
              "taso": 2
            },
            {
              "id": "poistetun-palautus--askeleet",
              "teksti": "Askeleet",
              "taso": 2
            },
            {
              "id": "poistetun-palautus--tulos",
              "teksti": "Tulos",
              "taso": 2
            },
            {
              "id": "poistetun-palautus--lisavalinnat",
              "teksti": "Lisävalinnat",
              "taso": 2
            },
            {
              "id": "poistetun-palautus--jos-jokin-menee-vikaan",
              "teksti": "Jos jokin menee vikaan",
              "taso": 2
            }
          ]
        },
        {
          "id": "tarkistettavat",
          "otsikko": "Käy läpi tarkistettavat",
          "osio": "turvaverkko",
          "avainsanat": [
            "tarkistettavat",
            "tarkista",
            "vaatii tarkistuksen",
            "mitä tarkistaa",
            "varoitusmerkki",
            "kolmio",
            "epävarma tieto",
            "vanha sivusto",
            "siirto"
          ],
          "tyypit": [
            "uutinen",
            "ravintola",
            "jalkapalloTilasto",
            "stadion",
            "klubiToiminta",
            "pelaaja",
            "lehtileike",
            "arvokisa",
            "sivu",
            "tapahtuma",
            "galleriaAlbumi"
          ],
          "kesto": "noin 5 minuuttia kerrallaan",
          "paivitetty": "2026-10-08",
          "html": "<h2 id=\"tarkistettavat--milloin\">Milloin</h2>\n<p>Kun vanhan sivuston sisältö siirrettiin, osa tiedoista jäi epävarmaksi. Ne on merkitty tarkistettaviksi. Käy niitä läpi muutama kerrallaan, esim. viisi joka kerta, kun avaat Studion.</p>\n<h2 id=\"tarkistettavat--askeleet\">Askeleet</h2>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/tarkistettavat-01-lista.webp\" aria-label=\"Suurenna kuva: Tarkistettavat. 1: Tarkistettavat valikossa. 2: tyypin valinta, esim. Uutiset.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/tarkistettavat-01-lista.webp\" alt=\"Tarkistettavat. 1: Tarkistettavat valikossa. 2: tyypin valinta, esim. Uutiset.\" width=\"1600\" height=\"800\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol>\n<li>Vasemmasta valikosta valitse <strong>Tarkistettavat</strong>. ①\nKaikki yhdessä listassa: <strong>Tehtävät sinulle → Vaatii tarkistuksen (kaikki)</strong>.</li>\n<li>Valitse tyyppi, esim. <strong>Uutiset</strong> tai <strong>Tilastot</strong>. ②\nListan rivien edessä on merkki ⚠.</li>\n</ol>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/tarkistettavat-02-lomake.webp\" aria-label=\"Suurenna kuva: Tarkistettava sisältö. 3: Mitä tarkistaa -teksti. 5: Vaatii tarkistuksen -kytkin.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/tarkistettavat-02-lomake.webp\" alt=\"Tarkistettava sisältö. 3: Mitä tarkistaa -teksti. 5: Vaatii tarkistuksen -kytkin.\" width=\"661\" height=\"750\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol start=\"3\">\n<li>Avaa rivi. Vieritä lomakkeen loppuun ja lue kohta <strong>Mitä tarkistaa</strong>. ③</li>\n<li>Korjaa tieto, tai totea se oikeaksi.</li>\n<li>Kytke pois <strong>Vaatii tarkistuksen</strong>. ⑤ Kytkin on heti <strong>Mitä tarkistaa</strong> -kohdan yläpuolella.</li>\n<li>Paina <strong>Julkaise</strong>.</li>\n</ol>\n<h2 id=\"tarkistettavat--tulos\">Tulos</h2>\n<ul>\n<li>Merkki <strong>Tarkistettava</strong> katoaa alapalkista, ja rivi poistuu listalta.</li>\n<li>Aloituksen kortin <strong>Vaatii tarkistuksen (kaikki)</strong> luku pienenee.</li>\n</ul>\n<h2 id=\"tarkistettavat--lisavalinnat\">Lisävalinnat</h2>\n<ul>\n<li>Merkin selitys: <a href=\"/studio/ohjeet/tilamerkit\" data-ohje-kortti=\"tilamerkit\">Tilamerkit ja listojen merkinnät</a></li>\n</ul>\n<div class=\"markdown-alert markdown-alert-tip\">\n<p class=\"markdown-alert-title\">Vinkki</p>\n<p>Et voi rikkoa mitään tarkistamalla. Jos et ole varma oikeasta tiedosta, jätä kytkin <strong>Vaatii tarkistuksen</strong> päälle ja siirry seuraavaan.</p>\n</div>\n<h2 id=\"tarkistettavat--jos-jokin-menee-vikaan\">Jos jokin menee vikaan</h2>\n<ul>\n<li>Rivi ei poistu listalta: painoitko <strong>Julkaise</strong>? Lista päivittyy vasta julkaisun jälkeen.</li>\n<li>Kohta <strong>Mitä tarkistaa</strong> puuttuu: syytä ei ole kirjattu. Lue sisältö kokonaan. Jos et löydä virhettä, käännä kytkin <strong>Vaatii tarkistuksen</strong> pois päältä ja julkaise.</li>\n</ul>\n<p>Katso myös: <a href=\"/studio/ohjeet/aloitus-ja-sivuston-tila\" data-ohje-kortti=\"aloitus-ja-sivuston-tila\">Lue Aloitus ja sivuston tila</a> · <a href=\"/studio/ohjeet/luonnos-julkaisu-ja-peruminen\" data-ohje-kortti=\"luonnos-julkaisu-ja-peruminen\">Tallenna, julkaise ja peru muutos</a></p>\n",
          "teksti": "Milloin Kun vanhan sivuston sisältö siirrettiin, osa tiedoista jäi epävarmaksi. Ne on merkitty tarkistettaviksi. Käy niitä läpi muutama kerrallaan, esim. viisi joka kerta, kun avaat Studion. Askeleet Vasemmasta valikosta valitse Tarkistettavat . ① Kaikki yhdessä listassa: Tehtävät sinulle → Vaatii tarkistuksen (kaikki) . Valitse tyyppi, esim. Uutiset tai Tilastot . ② Listan rivien edessä on merkki ⚠. Avaa rivi. Vieritä lomakkeen loppuun ja lue kohta Mitä tarkistaa . ③ Korjaa tieto, tai totea se oikeaksi. Kytke pois Vaatii tarkistuksen . ⑤ Kytkin on heti Mitä tarkistaa -kohdan yläpuolella. Paina Julkaise . Tulos Merkki Tarkistettava katoaa alapalkista, ja rivi poistuu listalta. Aloituksen kortin Vaatii tarkistuksen (kaikki) luku pienenee. Lisävalinnat Merkin selitys: Tilamerkit ja listojen merkinnät Et voi rikkoa mitään tarkistamalla. Jos et ole varma oikeasta tiedosta, jätä kytkin Vaatii tarkistuksen päälle ja siirry seuraavaan. Jos jokin menee vikaan Rivi ei poistu listalta: painoitko Julkaise ? Lista päivittyy vasta julkaisun jälkeen. Kohta Mitä tarkistaa puuttuu: syytä ei ole kirjattu. Lue sisältö kokonaan. Jos et löydä virhettä, käännä kytkin Vaatii tarkistuksen pois päältä ja julkaise. Katso myös: Lue Aloitus ja sivuston tila · Tallenna, julkaise ja peru muutos",
          "otsikot": [
            {
              "id": "tarkistettavat--milloin",
              "teksti": "Milloin",
              "taso": 2
            },
            {
              "id": "tarkistettavat--askeleet",
              "teksti": "Askeleet",
              "taso": 2
            },
            {
              "id": "tarkistettavat--tulos",
              "teksti": "Tulos",
              "taso": 2
            },
            {
              "id": "tarkistettavat--lisavalinnat",
              "teksti": "Lisävalinnat",
              "taso": 2
            },
            {
              "id": "tarkistettavat--jos-jokin-menee-vikaan",
              "teksti": "Jos jokin menee vikaan",
              "taso": 2
            }
          ]
        },
        {
          "id": "tayta-itse",
          "otsikko": "Täydennä puuttuvat perustiedot",
          "osio": "turvaverkko",
          "avainsanat": [
            "täytä itse",
            "puuttuu",
            "perustiedot",
            "yhteystiedot",
            "sähköposti",
            "osoite",
            "puhelin",
            "y-tunnus",
            "IBAN",
            "some",
            "hallitus",
            "taustakuva",
            "tietosuojaseloste",
            "tarkistuslista"
          ],
          "tyypit": [
            "yhteystiedot",
            "etusivu",
            "hallitusJasen",
            "sivu"
          ],
          "kesto": "noin 20 minuuttia",
          "paivitetty": "2026-10-08",
          "html": "<h2 id=\"tayta-itse--milloin\">Milloin</h2>\n<p>Kun Aloituksessa näkyy kohta <strong>Täydennä perustiedot</strong>, tai kun haluat tarkistaa, että sivuston perustiedot ovat kunnossa. Osaa tiedoista ei ollut vanhalla sivustolla.</p>\n<h2 id=\"tayta-itse--askeleet\">Askeleet</h2>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/tayta-itse-01-yhteystiedot.webp\" aria-label=\"Suurenna kuva: Yhteystietojen lomake. 2: osoitekentät. 3: sähköposti ja puhelin. 4: Y-tunnus, IBAN ja Sosiaaliset mediat.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/tayta-itse-01-yhteystiedot.webp\" alt=\"Yhteystietojen lomake. 2: osoitekentät. 3: sähköposti ja puhelin. 4: Y-tunnus, IBAN ja Sosiaaliset mediat.\" width=\"840\" height=\"1450\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol>\n<li>Avaa <strong>Klubi → Yhteystiedot → Osoite, sähköposti ja some</strong>.\nAloituksen <strong>Täydennä perustiedot</strong> -rivi vie kohtaan <strong>Klubi → Yhteystiedot</strong>. Valitse sieltä <strong>Osoite, sähköposti ja some</strong>.</li>\n<li>Täytä <strong>Katuosoite</strong>, <strong>Postinumero</strong> ja <strong>Kaupunki</strong>. ②</li>\n<li>Täytä <strong>Yleinen sähköposti</strong> ja <strong>Puhelin</strong>. ③</li>\n<li>Täytä <strong>Y-tunnus</strong>, <strong>IBAN</strong> ja <strong>Sosiaaliset mediat</strong>. ④ Paina <strong>Julkaise</strong>.</li>\n<li>Lisää hallituksen jäsenet: <strong>Klubi → Hallitus → Nykyinen hallitus</strong>. Ohje: <a href=\"/studio/ohjeet/hallitus\" data-ohje-kortti=\"hallitus\">Vaihda hallituksen jäseniä</a>.</li>\n<li>Avaa <strong>Sivuston asetukset → Etusivu</strong>. Lisää välilehdellä <strong>Yläosa</strong> kuva kohtaan <strong>Taustakuva (valinnainen)</strong>.</li>\n<li>Välilehdellä <strong>Lohkot</strong> avaa klubin esittelylohko, esim. &quot;Lahtelainen klubi, …&quot;. Lisää <strong>Kuva</strong> ja sulje ikkuna. Paina <strong>Julkaise</strong>.</li>\n<li>Halutessasi kirjoita johdannot: <strong>Klubi → Hallitus → Hallitus-sivun otsikko ja johdanto</strong> ja <strong>Klubi → Toiminta → Toiminta-sivun otsikko ja johdanto</strong>.</li>\n<li>Pyydä hallitusta vahvistamaan tietosuojaseloste. Avaa se valikon kohdasta <strong>Sivut</strong> ja lisää alla olevat kaksi kappaletta.</li>\n</ol>\n<p>Valmiit kappaleet tietosuojaselosteeseen:</p>\n<blockquote>\n<p>Sivuilla voi olla Google Maps -karttoja, Google Forms -lomakkeita ja Vimeo-videoita. Ne ladataan vasta, kun painat niiden painiketta. Silloin Google tai Vimeo voi tallentaa evästeitä laitteellesi.</p>\n</blockquote>\n<blockquote>\n<p>Sivustolle ladatut tiedostot ja kuvat ovat julkisia. Liitetiedosto (PDF, Word, Excel) poistetaan automaattisesti, kun mikään sivu ei ole käyttänyt sitä 7 päivään.</p>\n</blockquote>\n<h2 id=\"tayta-itse--tulos\">Tulos</h2>\n<ul>\n<li>Aloituksessa ei enää näy kohtaa <strong>Täydennä perustiedot</strong>.</li>\n<li>Yhteystiedot näkyvät sivuston alareunassa ja yhteystietosivulla.</li>\n</ul>\n<h2 id=\"tayta-itse--lisavalinnat\">Lisävalinnat</h2>\n<ul>\n<li>Tulevat tapahtumat: <a href=\"/studio/ohjeet/tapahtuman-lisaaminen\" data-ohje-kortti=\"tapahtuman-lisaaminen\">Lisää tapahtuma</a></li>\n<li>Yhteystietosivun teksti: <a href=\"/studio/ohjeet/yhteystiedot\" data-ohje-kortti=\"yhteystiedot\">Päivitä klubin yhteystiedot</a></li>\n</ul>\n<h2 id=\"tayta-itse--jos-jokin-menee-vikaan\">Jos jokin menee vikaan</h2>\n<ul>\n<li><strong>Täydennä perustiedot</strong> näkyy yhä: paina Aloituksessa <strong>Päivitä</strong>. Tarkista, että painoit <strong>Julkaise</strong>.</li>\n<li>Hallituksen jäsen ei näy: tarkista, että kytkin <strong>Nykyinen jäsen</strong> on päällä ja jäsen on julkaistu.</li>\n</ul>\n<p>Katso myös: <a href=\"/studio/ohjeet/aloitus-ja-sivuston-tila\" data-ohje-kortti=\"aloitus-ja-sivuston-tila\">Lue Aloitus ja sivuston tila</a> · <a href=\"/studio/ohjeet/kuva\" data-ohje-kortti=\"kuva\">Lisää tai vaihda kuva</a></p>\n",
          "teksti": "Milloin Kun Aloituksessa näkyy kohta Täydennä perustiedot , tai kun haluat tarkistaa, että sivuston perustiedot ovat kunnossa. Osaa tiedoista ei ollut vanhalla sivustolla. Askeleet Avaa Klubi → Yhteystiedot → Osoite, sähköposti ja some . Aloituksen Täydennä perustiedot -rivi vie kohtaan Klubi → Yhteystiedot . Valitse sieltä Osoite, sähköposti ja some . Täytä Katuosoite , Postinumero ja Kaupunki . ② Täytä Yleinen sähköposti ja Puhelin . ③ Täytä Y-tunnus , IBAN ja Sosiaaliset mediat . ④ Paina Julkaise . Lisää hallituksen jäsenet: Klubi → Hallitus → Nykyinen hallitus . Ohje: Vaihda hallituksen jäseniä . Avaa Sivuston asetukset → Etusivu . Lisää välilehdellä Yläosa kuva kohtaan Taustakuva (valinnainen) . Välilehdellä Lohkot avaa klubin esittelylohko, esim. \"Lahtelainen klubi, …\". Lisää Kuva ja sulje ikkuna. Paina Julkaise . Halutessasi kirjoita johdannot: Klubi → Hallitus → Hallitus-sivun otsikko ja johdanto ja Klubi → Toiminta → Toiminta-sivun otsikko ja johdanto . Pyydä hallitusta vahvistamaan tietosuojaseloste. Avaa se valikon kohdasta Sivut ja lisää alla olevat kaksi kappaletta. Valmiit kappaleet tietosuojaselosteeseen: Sivuilla voi olla Google Maps -karttoja, Google Forms -lomakkeita ja Vimeo-videoita. Ne ladataan vasta, kun painat niiden painiketta. Silloin Google tai Vimeo voi tallentaa evästeitä laitteellesi. Sivustolle ladatut tiedostot ja kuvat ovat julkisia. Liitetiedosto (PDF, Word, Excel) poistetaan automaattisesti, kun mikään sivu ei ole käyttänyt sitä 7 päivään. Tulos Aloituksessa ei enää näy kohtaa Täydennä perustiedot . Yhteystiedot näkyvät sivuston alareunassa ja yhteystietosivulla. Lisävalinnat Tulevat tapahtumat: Lisää tapahtuma Yhteystietosivun teksti: Päivitä klubin yhteystiedot Jos jokin menee vikaan Täydennä perustiedot näkyy yhä: paina Aloituksessa Päivitä . Tarkista, että painoit Julkaise . Hallituksen jäsen ei näy: tarkista, että kytkin Nykyinen jäsen on päällä ja jäsen on julkaistu. Katso myös: Lue Aloitus ja sivuston tila · Lisää tai vaihda kuva",
          "otsikot": [
            {
              "id": "tayta-itse--milloin",
              "teksti": "Milloin",
              "taso": 2
            },
            {
              "id": "tayta-itse--askeleet",
              "teksti": "Askeleet",
              "taso": 2
            },
            {
              "id": "tayta-itse--tulos",
              "teksti": "Tulos",
              "taso": 2
            },
            {
              "id": "tayta-itse--lisavalinnat",
              "teksti": "Lisävalinnat",
              "taso": 2
            },
            {
              "id": "tayta-itse--jos-jokin-menee-vikaan",
              "teksti": "Jos jokin menee vikaan",
              "taso": 2
            }
          ]
        },
        {
          "id": "tietosuojapyynto",
          "otsikko": "Poista henkilön tiedot pyynnöstä",
          "osio": "turvaverkko",
          "avainsanat": [
            "tietosuoja",
            "tietosuojapyyntö",
            "GDPR",
            "poista tietoni",
            "poista kommentti",
            "poista arvostelu",
            "henkilötiedot",
            "pysyvä poisto",
            "väärä tiedosto",
            "liite pois"
          ],
          "tyypit": [
            "kommentti",
            "ravintolaKayttajaArvostelu"
          ],
          "kesto": "noin 5 minuuttia",
          "paivitetty": "2026-10-08",
          "html": "<h2 id=\"tietosuojapyynto--milloin\">Milloin</h2>\n<p>Kun joku pyytää poistamaan kirjoittamansa kommentin, veikkauksen tai ravintola-arvostelun kuvineen. Tietosuojaseloste on sivustolla osoitteessa <a href=\"https://www.lahdensuomalainenklubi.com/tietosuoja\" target=\"_blank\" rel=\"noopener noreferrer\">https://www.lahdensuomalainenklubi.com/tietosuoja</a>.</p>\n<h2 id=\"tietosuojapyynto--askeleet\">Askeleet</h2>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/tietosuojapyynto-01-poista.webp\" aria-label=\"Suurenna kuva: Kommentin toiminnot. 1: haku yläpalkissa. 3: toimintovalikon painike. 4: Poista pysyvästi.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/tietosuojapyynto-01-poista.webp\" alt=\"Kommentin toiminnot. 1: haku yläpalkissa. 3: toimintovalikon painike. 4: Poista pysyvästi.\" width=\"1280\" height=\"908\" loading=\"lazy\" decoding=\"async\"></button></p>\n<ol>\n<li>Etsi henkilön nimi yläpalkin haulla. ① Ohje: <a href=\"/studio/ohjeet/etsi-haulla\" data-ohje-kortti=\"etsi-haulla\">Etsi sisältö haulla</a>.</li>\n<li>Avaa hänen kommenttinsa tai arvostelunsa.</li>\n<li>Oikeassa alakulmassa paina kolmen pisteen painiketta (⋯). ③ Toimintovalikko aukeaa.</li>\n<li>Kommentti tai veikkaus: valitse <strong>Poista pysyvästi</strong> ja vahvista. ④</li>\n<li>Arvostelu: valitse <strong>Poista arvostelu</strong> ja vahvista. Hyväksymättömässä arvostelussa kohta on <strong>Hylkää arvostelu</strong>.\nArvostelun kuvat poistuvat samalla.</li>\n<li>Toista jokaiselle henkilön viestille.</li>\n<li>Vastaa pyytäjälle, että tiedot on poistettu.</li>\n</ol>\n<div class=\"markdown-alert markdown-alert-warning\">\n<p class=\"markdown-alert-title\">Varoitus</p>\n<p>Pysyvää poistoa ei voi perua, eikä viestiä palauteta varmuuskopiosta. Piilottaminen ei riitä tietosuojapyyntöön: piilotettu viesti säilyy järjestelmässä.</p>\n</div>\n<h2 id=\"tietosuojapyynto--tulos\">Tulos</h2>\n<ul>\n<li>Viesti ei näy sivulla eikä Studiossa.</li>\n<li>Haku henkilön nimellä ei löydä enää hänen viestejään.</li>\n</ul>\n<h2 id=\"tietosuojapyynto--lisavalinnat\">Lisävalinnat</h2>\n<ul>\n<li>Asiaton viesti, jota ei pyydetty poistamaan: <a href=\"/studio/ohjeet/kommenttien-valvonta\" data-ohje-kortti=\"kommenttien-valvonta\">Piilota asiaton kommentti</a></li>\n<li>Liite, jossa on henkilötietoja: poista liite tekstistä ja julkaise. Tiedosto poistuu itsestään 7 päivän kuluttua.</li>\n<li>Jos liite pitää saada pois heti, kerro tukihenkilölle tiedoston nimi.</li>\n</ul>\n<h2 id=\"tietosuojapyynto--jos-jokin-menee-vikaan\">Jos jokin menee vikaan</h2>\n<ul>\n<li>Ilmoitus &quot;Poisto epäonnistui&quot;: odota hetki ja yritä uudelleen.</li>\n<li>Henkilöä ei löydy haulla: kokeile pelkkää etunimeä tai sukunimeä. Kommentissa nimi on kentässä <strong>Nimi</strong>, arvostelussa kentässä <strong>Arvostelijan nimi</strong>.</li>\n</ul>\n<p>Katso myös: <a href=\"/studio/ohjeet/etsi-haulla\" data-ohje-kortti=\"etsi-haulla\">Etsi sisältö haulla</a> · <a href=\"/studio/ohjeet/arvostelun-hyvaksynta\" data-ohje-kortti=\"arvostelun-hyvaksynta\">Hyväksy tai hylkää kävijän arvostelu</a></p>\n",
          "teksti": "Milloin Kun joku pyytää poistamaan kirjoittamansa kommentin, veikkauksen tai ravintola-arvostelun kuvineen. Tietosuojaseloste on sivustolla osoitteessa https://www.lahdensuomalainenklubi.com/tietosuoja . Askeleet Etsi henkilön nimi yläpalkin haulla. ① Ohje: Etsi sisältö haulla . Avaa hänen kommenttinsa tai arvostelunsa. Oikeassa alakulmassa paina kolmen pisteen painiketta (⋯). ③ Toimintovalikko aukeaa. Kommentti tai veikkaus: valitse Poista pysyvästi ja vahvista. ④ Arvostelu: valitse Poista arvostelu ja vahvista. Hyväksymättömässä arvostelussa kohta on Hylkää arvostelu . Arvostelun kuvat poistuvat samalla. Toista jokaiselle henkilön viestille. Vastaa pyytäjälle, että tiedot on poistettu. Pysyvää poistoa ei voi perua, eikä viestiä palauteta varmuuskopiosta. Piilottaminen ei riitä tietosuojapyyntöön: piilotettu viesti säilyy järjestelmässä. Tulos Viesti ei näy sivulla eikä Studiossa. Haku henkilön nimellä ei löydä enää hänen viestejään. Lisävalinnat Asiaton viesti, jota ei pyydetty poistamaan: Piilota asiaton kommentti Liite, jossa on henkilötietoja: poista liite tekstistä ja julkaise. Tiedosto poistuu itsestään 7 päivän kuluttua. Jos liite pitää saada pois heti, kerro tukihenkilölle tiedoston nimi. Jos jokin menee vikaan Ilmoitus \"Poisto epäonnistui\": odota hetki ja yritä uudelleen. Henkilöä ei löydy haulla: kokeile pelkkää etunimeä tai sukunimeä. Kommentissa nimi on kentässä Nimi , arvostelussa kentässä Arvostelijan nimi . Katso myös: Etsi sisältö haulla · Hyväksy tai hylkää kävijän arvostelu",
          "otsikot": [
            {
              "id": "tietosuojapyynto--milloin",
              "teksti": "Milloin",
              "taso": 2
            },
            {
              "id": "tietosuojapyynto--askeleet",
              "teksti": "Askeleet",
              "taso": 2
            },
            {
              "id": "tietosuojapyynto--tulos",
              "teksti": "Tulos",
              "taso": 2
            },
            {
              "id": "tietosuojapyynto--lisavalinnat",
              "teksti": "Lisävalinnat",
              "taso": 2
            },
            {
              "id": "tietosuojapyynto--jos-jokin-menee-vikaan",
              "teksti": "Jos jokin menee vikaan",
              "taso": 2
            }
          ]
        }
      ]
    },
    {
      "id": "vianetsinta",
      "otsikko": "Vianetsintä",
      "kortit": [
        {
          "id": "en-loyda",
          "otsikko": "En löydä valikon kohtaa, painiketta tai kenttää",
          "osio": "vianetsinta",
          "avainsanat": [
            "en löydä",
            "missä on",
            "kadonnut",
            "puuttuu",
            "valikko",
            "painike",
            "kenttä",
            "välilehti",
            "kolme pistettä",
            "poista",
            "kopioi",
            "ei näy Studiossa"
          ],
          "tyypit": [],
          "kesto": null,
          "paivitetty": "2026-10-08",
          "html": "<p><strong>Mitä näet:</strong> Ohjeessa mainitaan nimi, mutta et löydä sitä ruudulta.</p>\n<p><strong>Miksi:</strong> Kohta on usein toisen valikon alla, toisella välilehdellä tai valikon takana.</p>\n<p><strong>Näin korjaat:</strong></p>\n<ol>\n<li>Valikon kohta: katso <a href=\"/studio/ohjeet/valikon-kartta\" data-ohje-kortti=\"valikon-kartta\">Studion valikon kartta</a>. Esimerkiksi etusivu on kohdassa <strong>Sivuston asetukset → Etusivu</strong>, ja hallitus kohdassa <strong>Klubi → Hallitus</strong>.</li>\n<li>Tietty uutinen, sivu tai ravintola: hae se nimellä. Paina yläpalkin vasemmasta reunasta suurennuslasia (<strong>Etsi</strong>). Ohje: <a href=\"/studio/ohjeet/etsi-haulla\" data-ohje-kortti=\"etsi-haulla\">Etsi haulla</a>.</li>\n<li>Kenttä: lomakkeen yläreunassa on välilehtiä, esimerkiksi <strong>Sisältö</strong> ja <strong>Hakukoneet ja jako</strong>. Valitse <strong>Kaikki kentät</strong>, niin näet kaikki kentät kerralla.</li>\n<li>Osa kentistä tulee näkyviin vasta valinnan jälkeen. Esimerkiksi <strong>Pääjuttu näkyy asti</strong> näkyy vasta, kun <strong>Pääjuttu (valinnainen)</strong> on valittu.</li>\n<li>Toiminnot, kuten <strong>Poista</strong>, <strong>Kopioi pohjaksi</strong>, <strong>Hylkää muutokset</strong> ja <strong>Palauta varmuuskopiosta</strong>: oikeassa alakulmassa <strong>Julkaise</strong>-painikkeen vieressä on kolmen pisteen painike (⋯). Paina sitä, niin toiminnot näkyvät listana.</li>\n<li>Tekstikentän lisäosat, kuten <strong>Kuvasarja (useita kuvia)</strong> tai <strong>Liite (PDF, Word, Excel)</strong>, ja <strong>Linkki</strong>: ne ovat työkalupalkin kolmen pisteen painikkeen (<strong>Näytä lisää</strong>) takana.</li>\n<li>Plus-painike (+) uuden lisäämiseen on listan yläreunassa. Joissakin listoissa sitä ei ole, koska niihin ei lisätä käsin. Näitä ovat <strong>Entiset jäsenet</strong>, <strong>Varmuuskopiot</strong> ja <strong>Muuttuneet osoitteet (automaattiset)</strong>.</li>\n</ol>\n<div class=\"markdown-alert markdown-alert-note\">\n<p class=\"markdown-alert-title\">Hyvä tietää</p>\n<p><strong>Etusivu</strong>, <strong>Navigaatio</strong> ja yhteystiedot eivät ole yläpalkin plus-painikkeen (<strong>Luo uusi asiakirja</strong>) valikossa. Niitä on\nvain yksi kappale, ja ne avataan vasemmasta valikosta.</p>\n</div>\n<p><strong>Ei auttanut?</strong> Ota kuvakaappaus koko ruudusta ja kerro tukihenkilölle, mitä etsit. Ohje: <a href=\"/studio/ohjeet/tukihenkilo\" data-ohje-kortti=\"tukihenkilo\">Mihin tarvitset tukihenkilöä</a>.</p>\n",
          "teksti": "Mitä näet: Ohjeessa mainitaan nimi, mutta et löydä sitä ruudulta. Miksi: Kohta on usein toisen valikon alla, toisella välilehdellä tai valikon takana. Näin korjaat: Valikon kohta: katso Studion valikon kartta . Esimerkiksi etusivu on kohdassa Sivuston asetukset → Etusivu , ja hallitus kohdassa Klubi → Hallitus . Tietty uutinen, sivu tai ravintola: hae se nimellä. Paina yläpalkin vasemmasta reunasta suurennuslasia ( Etsi ). Ohje: Etsi haulla . Kenttä: lomakkeen yläreunassa on välilehtiä, esimerkiksi Sisältö ja Hakukoneet ja jako . Valitse Kaikki kentät , niin näet kaikki kentät kerralla. Osa kentistä tulee näkyviin vasta valinnan jälkeen. Esimerkiksi Pääjuttu näkyy asti näkyy vasta, kun Pääjuttu (valinnainen) on valittu. Toiminnot, kuten Poista , Kopioi pohjaksi , Hylkää muutokset ja Palauta varmuuskopiosta : oikeassa alakulmassa Julkaise -painikkeen vieressä on kolmen pisteen painike (⋯). Paina sitä, niin toiminnot näkyvät listana. Tekstikentän lisäosat, kuten Kuvasarja (useita kuvia) tai Liite (PDF, Word, Excel) , ja Linkki : ne ovat työkalupalkin kolmen pisteen painikkeen ( Näytä lisää ) takana. Plus-painike (+) uuden lisäämiseen on listan yläreunassa. Joissakin listoissa sitä ei ole, koska niihin ei lisätä käsin. Näitä ovat Entiset jäsenet , Varmuuskopiot ja Muuttuneet osoitteet (automaattiset) . Etusivu , Navigaatio ja yhteystiedot eivät ole yläpalkin plus-painikkeen ( Luo uusi asiakirja ) valikossa. Niitä on vain yksi kappale, ja ne avataan vasemmasta valikosta. Ei auttanut? Ota kuvakaappaus koko ruudusta ja kerro tukihenkilölle, mitä etsit. Ohje: Mihin tarvitset tukihenkilöä .",
          "otsikot": []
        },
        {
          "id": "muutos-ei-nay-sivustolla",
          "otsikko": "Muutos ei näy sivustolla",
          "osio": "vianetsinta",
          "avainsanat": [
            "ei näy",
            "ei päivity",
            "vanha versio",
            "muutos puuttuu",
            "tallennus",
            "julkaise",
            "luonnos",
            "sivu ei muutu",
            "välimuisti"
          ],
          "tyypit": [],
          "kesto": null,
          "paivitetty": "2026-10-08",
          "html": "<p><strong>Mitä näet:</strong> Muutit jotain Studiossa, mutta sivustolla näkyy yhä vanha versio.</p>\n<p><strong>Miksi:</strong> Yleensä muutos on vielä luonnos: sivusto näyttää vain julkaistun version.</p>\n<p><strong>Näin korjaat:</strong></p>\n<ol>\n<li>Avaa muokkaamasi sivu tai uutinen Studiossa.</li>\n<li>Katso oikeaa alakulmaa. Jos <strong>Julkaise</strong>-painiketta voi painaa, paina sitä.\nJos painike on harmaa, vie hiiri sen päälle. Teksti &quot;Julkaistu … sitten&quot; tarkoittaa, että muutos on jo julkaistu.\nJos tekstinä on &quot;Ennen tämän dokumentin julkaisemista on korjattava validointivirheet&quot;, katso <a href=\"/studio/ohjeet/julkaise-ei-onnistu\" data-ohje-kortti=\"julkaise-ei-onnistu\">Julkaise on harmaa</a>.</li>\n<li>Odota minuutti. Päivitä sitten sivu selaimessa painamalla F5 tai selaimen pyöreää nuolta.</li>\n<li>Uutinen puuttuu yhä: tarkista, onko alapalkissa merkki <strong>Ajastettu</strong>. Ohje: <a href=\"/studio/ohjeet/uutinen-ei-nay-ajastettu\" data-ohje-kortti=\"uutinen-ei-nay-ajastettu\">Uutinen ei näy, ja alapalkissa lukee Ajastettu</a>.</li>\n<li>Ravintola puuttuu: tarkista, onko alapalkissa merkki <strong>Odottaa toista arvioijaa</strong>. Ohje: <a href=\"/studio/ohjeet/ravintola-ei-nay\" data-ohje-kortti=\"ravintola-ei-nay\">Ravintola ei näy</a>.</li>\n<li>Etusivun osio puuttuu: tarkista, onko lohkon kytkin <strong>Piilota lohko sivulta</strong> päällä. Ohje: <a href=\"/studio/ohjeet/etusivun-lohkot\" data-ohje-kortti=\"etusivun-lohkot\">Järjestä, piilota tai lisää etusivun lohkoja</a>.</li>\n<li>Linkki tai valikon kohta puuttuu: kohdesivua ei ehkä ole julkaistu. Ohje: <a href=\"/studio/ohjeet/linkki-vie-vaaraan-paikkaan\" data-ohje-kortti=\"linkki-vie-vaaraan-paikkaan\">Linkki vie väärään paikkaan</a>.</li>\n</ol>\n<div class=\"markdown-alert markdown-alert-tip\">\n<p class=\"markdown-alert-title\">Vinkki</p>\n<p>Kaikki julkaisemattomat muutokset ovat yhdessä listassa: <strong>Tehtävät sinulle → Julkaisemattomat muutokset</strong>.</p>\n</div>\n<p>Näetkö sivuston yläreunassa keltaisen palkin, jossa lukee &quot;Esikatselutila&quot;? Silloin näet\nmyös luonnokset, mutta kävijät eivät näe niitä. Ohje: <a href=\"/studio/ohjeet/sivusto-jaa-esikatselutilaan\" data-ohje-kortti=\"sivusto-jaa-esikatselutilaan\">Sivusto jää esikatselutilaan</a>.</p>\n<p><strong>Ei auttanut?</strong> Kerro tukihenkilölle sivun osoite ja mitä muutit. Muutoksesi on tallessa Studiossa.</p>\n",
          "teksti": "Mitä näet: Muutit jotain Studiossa, mutta sivustolla näkyy yhä vanha versio. Miksi: Yleensä muutos on vielä luonnos: sivusto näyttää vain julkaistun version. Näin korjaat: Avaa muokkaamasi sivu tai uutinen Studiossa. Katso oikeaa alakulmaa. Jos Julkaise -painiketta voi painaa, paina sitä. Jos painike on harmaa, vie hiiri sen päälle. Teksti \"Julkaistu … sitten\" tarkoittaa, että muutos on jo julkaistu. Jos tekstinä on \"Ennen tämän dokumentin julkaisemista on korjattava validointivirheet\", katso Julkaise on harmaa . Odota minuutti. Päivitä sitten sivu selaimessa painamalla F5 tai selaimen pyöreää nuolta. Uutinen puuttuu yhä: tarkista, onko alapalkissa merkki Ajastettu . Ohje: Uutinen ei näy, ja alapalkissa lukee Ajastettu . Ravintola puuttuu: tarkista, onko alapalkissa merkki Odottaa toista arvioijaa . Ohje: Ravintola ei näy . Etusivun osio puuttuu: tarkista, onko lohkon kytkin Piilota lohko sivulta päällä. Ohje: Järjestä, piilota tai lisää etusivun lohkoja . Linkki tai valikon kohta puuttuu: kohdesivua ei ehkä ole julkaistu. Ohje: Linkki vie väärään paikkaan . Kaikki julkaisemattomat muutokset ovat yhdessä listassa: Tehtävät sinulle → Julkaisemattomat muutokset . Näetkö sivuston yläreunassa keltaisen palkin, jossa lukee \"Esikatselutila\"? Silloin näet myös luonnokset, mutta kävijät eivät näe niitä. Ohje: Sivusto jää esikatselutilaan . Ei auttanut? Kerro tukihenkilölle sivun osoite ja mitä muutit. Muutoksesi on tallessa Studiossa.",
          "otsikot": []
        },
        {
          "id": "uutinen-ei-nay-ajastettu",
          "otsikko": "Uutinen ei näy sivustolla, ja alapalkissa lukee Ajastettu",
          "osio": "vianetsinta",
          "avainsanat": [
            "uutinen ei näy",
            "ajastettu",
            "ajastus",
            "julkaisuaika",
            "tulevaisuudessa",
            "myöhemmin",
            "piilossa",
            "julkaise heti"
          ],
          "tyypit": [
            "uutinen"
          ],
          "kesto": null,
          "paivitetty": "2026-10-08",
          "html": "<p><strong>Mitä näet:</strong> Julkaisit uutisen, mutta se puuttuu uutislistasta ja etusivulta. Uutisen\nalapalkissa on merkki <strong>Ajastettu</strong>. Studion listassa uutisen alla lukee &quot;Ajastettu&quot; ja aika.</p>\n<p><strong>Miksi:</strong> Uutisen <strong>Julkaisuaika</strong> on tulevaisuudessa, joten uutinen odottaa piilossa siihen asti.</p>\n<p><strong>Näin korjaat:</strong></p>\n<ol>\n<li>Jos ajastus on tarkoituksellinen, älä tee mitään. Uutinen tulee näkyviin noin minuutin kuluttua valitusta ajasta.</li>\n<li>Haluat uutisen näkyviin heti: paina kentän <strong>Julkaisuaika</strong> oikean reunan kalenterin kuvaa.</li>\n<li>Paina kalenterissa <strong>Aseta nykyiseen aikaan</strong>.</li>\n<li>Oikeassa alakulmassa paina <strong>Julkaise</strong>.</li>\n</ol>\n<p>Merkin selite kertoo, milloin uutinen tulee sivustolle. Jos selitteen lopussa lukee\n&quot;kun painat Julkaise&quot;, uusi aika on vasta luonnoksessa. Paina silloin <strong>Julkaise</strong>.</p>\n<div class=\"markdown-alert markdown-alert-note\">\n<p class=\"markdown-alert-title\">Hyvä tietää</p>\n<p>Ajasta uutinen aina kentällä <strong>Julkaisuaika</strong>. Älä käytä Studion omaa toimintoa\n<strong>Ajasta julkaisu</strong>: se lakkaa toimimasta 26.10.2026 jälkeen.\nOhje: <a href=\"/studio/ohjeet/ajasta-uutinen\" data-ohje-kortti=\"ajasta-uutinen\">Ajasta uutinen</a>.</p>\n</div>\n<p>Kaikki ajastetut uutiset ovat listassa <strong>Tehtävät sinulle → Ajastetut uutiset</strong>.</p>\n<p><strong>Ei auttanut?</strong> Jos julkaisuaika on mennyt jo yli kymmenen minuuttia sitten, eikä uutinen näy,\nkerro tukihenkilölle uutisen otsikko. Uutinen on tallessa.</p>\n",
          "teksti": "Mitä näet: Julkaisit uutisen, mutta se puuttuu uutislistasta ja etusivulta. Uutisen alapalkissa on merkki Ajastettu . Studion listassa uutisen alla lukee \"Ajastettu\" ja aika. Miksi: Uutisen Julkaisuaika on tulevaisuudessa, joten uutinen odottaa piilossa siihen asti. Näin korjaat: Jos ajastus on tarkoituksellinen, älä tee mitään. Uutinen tulee näkyviin noin minuutin kuluttua valitusta ajasta. Haluat uutisen näkyviin heti: paina kentän Julkaisuaika oikean reunan kalenterin kuvaa. Paina kalenterissa Aseta nykyiseen aikaan . Oikeassa alakulmassa paina Julkaise . Merkin selite kertoo, milloin uutinen tulee sivustolle. Jos selitteen lopussa lukee \"kun painat Julkaise\", uusi aika on vasta luonnoksessa. Paina silloin Julkaise . Ajasta uutinen aina kentällä Julkaisuaika . Älä käytä Studion omaa toimintoa Ajasta julkaisu : se lakkaa toimimasta 26.10.2026 jälkeen. Ohje: Ajasta uutinen . Kaikki ajastetut uutiset ovat listassa Tehtävät sinulle → Ajastetut uutiset . Ei auttanut? Jos julkaisuaika on mennyt jo yli kymmenen minuuttia sitten, eikä uutinen näy, kerro tukihenkilölle uutisen otsikko. Uutinen on tallessa.",
          "otsikot": []
        },
        {
          "id": "ravintola-ei-nay",
          "otsikko": "Ravintola ei näy sivustolla, ja alapalkissa lukee Odottaa toista arvioijaa",
          "osio": "vianetsinta",
          "avainsanat": [
            "ravintola ei näy",
            "odottaa toista arvioijaa",
            "kaksi klubilaista",
            "arvosana",
            "uusi ravintola",
            "piilossa",
            "kahden klubilaisen sääntö"
          ],
          "tyypit": [
            "ravintola",
            "klubiArvio"
          ],
          "kesto": null,
          "paivitetty": "2026-10-08",
          "html": "<p><strong>Mitä näet:</strong> Ravintola on julkaistu, mutta se ei näy ravintolalistassa. Ravintolan\nalapalkissa on merkki <strong>Odottaa toista arvioijaa</strong>.</p>\n<p><strong>Miksi:</strong> Ravintola näkyy sivustolla vasta, kun vähintään kaksi klubilaista on arvioinut sen.</p>\n<p><strong>Näin korjaat:</strong></p>\n<ol>\n<li>Tarkista merkin selite: vie osoitin merkin päälle. Selite kertoo, montako klubilaisen arvosanaa ravintolalla on.</li>\n<li>Jos toinen klubilainen on käynyt ravintolassa, lisää hänen arvosanansa. Ohje: <a href=\"/studio/ohjeet/klubilaisen-pisteet\" data-ohje-kortti=\"klubilaisen-pisteet\">Lisää klubilaisen pisteet ravintolalle</a>.</li>\n<li>Muuten odota. Kun toinen klubilainen lähettää arvostelun ja hyväksyt sen, ravintola tulee sivulle itsestään.</li>\n</ol>\n<p>Kaikki odottavat ravintolat ovat listassa <strong>Ravintolat → Ravintolat: odottavat toista arvioijaa</strong>.\nKlubilaiset näkevät samat paikat sivulla <a href=\"https://www.lahdensuomalainenklubi.com/ravintolat/odottavat\" target=\"_blank\" rel=\"noopener noreferrer\">https://www.lahdensuomalainenklubi.com/ravintolat/odottavat</a>.</p>\n<div class=\"markdown-alert markdown-alert-note\">\n<p class=\"markdown-alert-title\">Hyvä tietää</p>\n<p>Jos poistat klubilaisen arvosanan, ravintola voi pudota takaisin piiloon. Kahden klubilaisen\nsääntö on klubin päätös. Sen muuttaminen vaatii tukihenkilön.</p>\n</div>\n<p><strong>Ei auttanut?</strong> Jos ravintolalla on jo kaksi arvosanaa, mutta merkki ei poistu, odota\nseuraavaan päivään. Yöllinen huolto laskee arvosanat uudelleen. Jos merkki on yhä\npaikallaan, kerro tukihenkilölle ravintolan nimi.</p>\n",
          "teksti": "Mitä näet: Ravintola on julkaistu, mutta se ei näy ravintolalistassa. Ravintolan alapalkissa on merkki Odottaa toista arvioijaa . Miksi: Ravintola näkyy sivustolla vasta, kun vähintään kaksi klubilaista on arvioinut sen. Näin korjaat: Tarkista merkin selite: vie osoitin merkin päälle. Selite kertoo, montako klubilaisen arvosanaa ravintolalla on. Jos toinen klubilainen on käynyt ravintolassa, lisää hänen arvosanansa. Ohje: Lisää klubilaisen pisteet ravintolalle . Muuten odota. Kun toinen klubilainen lähettää arvostelun ja hyväksyt sen, ravintola tulee sivulle itsestään. Kaikki odottavat ravintolat ovat listassa Ravintolat → Ravintolat: odottavat toista arvioijaa . Klubilaiset näkevät samat paikat sivulla https://www.lahdensuomalainenklubi.com/ravintolat/odottavat . Jos poistat klubilaisen arvosanan, ravintola voi pudota takaisin piiloon. Kahden klubilaisen sääntö on klubin päätös. Sen muuttaminen vaatii tukihenkilön. Ei auttanut? Jos ravintolalla on jo kaksi arvosanaa, mutta merkki ei poistu, odota seuraavaan päivään. Yöllinen huolto laskee arvosanat uudelleen. Jos merkki on yhä paikallaan, kerro tukihenkilölle ravintolan nimi.",
          "otsikot": []
        },
        {
          "id": "sivusto-jaa-esikatselutilaan",
          "otsikko": "Sivuston yläreunassa lukee \"Esikatselutila: näet myös julkaisemattomat luonnokset.\"",
          "osio": "vianetsinta",
          "avainsanat": [
            "esikatselutila",
            "keltainen palkki",
            "luonnokset näkyvät",
            "sivusto näyttää luonnoksen",
            "kävijät",
            "poistu esikatselusta"
          ],
          "tyypit": [],
          "kesto": null,
          "paivitetty": "2026-10-08",
          "html": "<p><strong>Mitä näet:</strong> Sivuston yläreunassa on keltainen palkki: &quot;Esikatselutila: näet myös\njulkaisemattomat luonnokset. Kävijät eivät näe niitä.&quot; Sivulla näkyy keskeneräisiä juttuja.\nSama palkki voi näkyä myös Studion yläpuolella.</p>\n<p><strong>Miksi:</strong> Käytit Studion esikatselua, ja selaimesi muistaa sen.</p>\n<p><strong>Näin korjaat:</strong></p>\n<ol>\n<li>Paina palkista <strong>Poistu esikatselusta</strong>.</li>\n<li>Sivu latautuu uudelleen. Näet sen nyt kuten kävijät.</li>\n</ol>\n<p>Kävijät eivät näe luonnoksia missään vaiheessa. Palkki näkyy vain sinulle.</p>\n<p><strong>Ei auttanut?</strong> Sulje selain kokonaan ja avaa sivusto uudelleen. Jos palkki on yhä\nnäkyvissä, kerro tukihenkilölle.</p>\n",
          "teksti": "Mitä näet: Sivuston yläreunassa on keltainen palkki: \"Esikatselutila: näet myös julkaisemattomat luonnokset. Kävijät eivät näe niitä.\" Sivulla näkyy keskeneräisiä juttuja. Sama palkki voi näkyä myös Studion yläpuolella. Miksi: Käytit Studion esikatselua, ja selaimesi muistaa sen. Näin korjaat: Paina palkista Poistu esikatselusta . Sivu latautuu uudelleen. Näet sen nyt kuten kävijät. Kävijät eivät näe luonnoksia missään vaiheessa. Palkki näkyy vain sinulle. Ei auttanut? Sulje selain kokonaan ja avaa sivusto uudelleen. Jos palkki on yhä näkyvissä, kerro tukihenkilölle.",
          "otsikot": []
        },
        {
          "id": "linkki-vie-vaaraan-paikkaan",
          "otsikko": "Linkki vie väärään paikkaan tai puuttuu sivulta",
          "osio": "vianetsinta",
          "avainsanat": [
            "linkki ei toimi",
            "rikkinäinen linkki",
            "sivua ei löytynyt",
            "väärä sivu",
            "linkki puuttuu",
            "valikon kohta puuttuu",
            "https",
            "Sivuston sivu",
            "Muu osoite"
          ],
          "tyypit": [
            "navigaatio",
            "etusivu",
            "sivu",
            "uutinen",
            "klubiToiminta"
          ],
          "kesto": null,
          "paivitetty": "2026-10-08",
          "html": "<p><strong>Mitä näet:</strong> Linkki vie Sivua ei löytynyt -sivulle tai väärälle sivulle. Tai linkin sana\nnäkyy ilman linkkiä, tai valikon kohta puuttuu kokonaan.</p>\n<p><strong>Miksi:</strong> Linkin kohde on valittu väärin, osoitteessa on kirjoitusvirhe tai kohdesivua ei ole julkaistu.</p>\n<p><strong>Näin korjaat:</strong></p>\n<ol>\n<li>Avaa Studiossa kohta, jossa linkki on. Valikon linkit ovat kohdassa <strong>Sivuston asetukset → Navigaatio</strong>.</li>\n<li>Avaa linkki. Valikon kohdan ja painikkeen rivillä näkyy, mihin se vie, esimerkiksi &quot;→ /klubi/historia&quot;. Tekstin linkissä napsauta linkkisanaa ja paina kynän kuvaa.</li>\n<li>Jos linkki vie klubin omalle sivulle, valitse <strong>Mihin linkki vie?</strong> -kohdasta <strong>Sivuston sivu</strong>. Kirjoita kenttään <strong>Sivu</strong> sivun nimen alkua ja valitse listasta.</li>\n<li>Kentän nimen vieressä on keltainen kolmio tai punainen huutomerkki. Vie hiiri sen päälle, lue teksti ja toimi alla olevan taulukon mukaan.</li>\n<li>Oikeassa alakulmassa paina <strong>Julkaise</strong>.</li>\n</ol>\n<table>\n<thead>\n<tr>\n<th>Teksti</th>\n<th>Mitä teet</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>&quot;“…” ei ole vielä julkaistu. Linkki näkyy sivustolla vasta, kun julkaiset sen.&quot;</td>\n<td>Avaa kohdesivu ja julkaise se.</td>\n</tr>\n<tr>\n<td>&quot;Uutinen tulee näkyviin …. Linkki näkyy sivustolla siitä alkaen.&quot;</td>\n<td>Ei tarvitse tehdä mitään. Linkki tulee näkyviin uutisen kanssa.</td>\n</tr>\n<tr>\n<td>&quot;Valittua sivua ei enää ole. Valitse toinen sivu.&quot;</td>\n<td>Sivu on poistettu. Valitse toinen sivu.</td>\n</tr>\n<tr>\n<td>&quot;Sivustolla ei ole sivua osoitteessa …&quot;</td>\n<td>Osoitteessa on kirjoitusvirhe, tai sivua ei ole julkaistu. Valitse mieluummin <strong>Sivuston sivu</strong>.</td>\n</tr>\n<tr>\n<td>&quot;Tälle sivulle on parempi valinta: …&quot;</td>\n<td>Vaihda kohdaksi <strong>Sivuston sivu</strong> ja valitse tekstissä mainittu sivu.</td>\n</tr>\n<tr>\n<td>&quot;Lisää alkuun &quot;https://&quot;, esim. …&quot;</td>\n<td>Kirjoita toisen sivuston osoitteen alkuun https://.</td>\n</tr>\n<tr>\n<td>&quot;Tätä valintaa ei käytetä, koska linkki vie nyt muualle. …&quot;</td>\n<td>Paina valitun sivun rivin kolmea pistettä ja valitse <strong>Tyhjennä</strong>.</td>\n</tr>\n</tbody>\n</table>\n<div class=\"markdown-alert markdown-alert-note\">\n<p class=\"markdown-alert-title\">Hyvä tietää</p>\n<p>Linkki ravintolaan näkyy vasta, kun ravintola näkyy sivustolla. Ohje:\n<a href=\"/studio/ohjeet/ravintola-ei-nay\" data-ohje-kortti=\"ravintola-ei-nay\">Ravintola ei näy</a>.</p>\n</div>\n<p><strong>Ei auttanut?</strong> Kerro tukihenkilölle sivun osoite, jolla linkki on, ja linkin teksti.</p>\n",
          "teksti": "Mitä näet: Linkki vie Sivua ei löytynyt -sivulle tai väärälle sivulle. Tai linkin sana näkyy ilman linkkiä, tai valikon kohta puuttuu kokonaan. Miksi: Linkin kohde on valittu väärin, osoitteessa on kirjoitusvirhe tai kohdesivua ei ole julkaistu. Näin korjaat: Avaa Studiossa kohta, jossa linkki on. Valikon linkit ovat kohdassa Sivuston asetukset → Navigaatio . Avaa linkki. Valikon kohdan ja painikkeen rivillä näkyy, mihin se vie, esimerkiksi \"→ /klubi/historia\". Tekstin linkissä napsauta linkkisanaa ja paina kynän kuvaa. Jos linkki vie klubin omalle sivulle, valitse Mihin linkki vie? -kohdasta Sivuston sivu . Kirjoita kenttään Sivu sivun nimen alkua ja valitse listasta. Kentän nimen vieressä on keltainen kolmio tai punainen huutomerkki. Vie hiiri sen päälle, lue teksti ja toimi alla olevan taulukon mukaan. Oikeassa alakulmassa paina Julkaise . Teksti Mitä teet \"“…” ei ole vielä julkaistu. Linkki näkyy sivustolla vasta, kun julkaiset sen.\" Avaa kohdesivu ja julkaise se. \"Uutinen tulee näkyviin …. Linkki näkyy sivustolla siitä alkaen.\" Ei tarvitse tehdä mitään. Linkki tulee näkyviin uutisen kanssa. \"Valittua sivua ei enää ole. Valitse toinen sivu.\" Sivu on poistettu. Valitse toinen sivu. \"Sivustolla ei ole sivua osoitteessa …\" Osoitteessa on kirjoitusvirhe, tai sivua ei ole julkaistu. Valitse mieluummin Sivuston sivu . \"Tälle sivulle on parempi valinta: …\" Vaihda kohdaksi Sivuston sivu ja valitse tekstissä mainittu sivu. \"Lisää alkuun \"https://\", esim. …\" Kirjoita toisen sivuston osoitteen alkuun https://. \"Tätä valintaa ei käytetä, koska linkki vie nyt muualle. …\" Paina valitun sivun rivin kolmea pistettä ja valitse Tyhjennä . Linkki ravintolaan näkyy vasta, kun ravintola näkyy sivustolla. Ohje: Ravintola ei näy . Ei auttanut? Kerro tukihenkilölle sivun osoite, jolla linkki on, ja linkin teksti.",
          "otsikot": []
        },
        {
          "id": "julkaise-ei-onnistu",
          "otsikko": "Julkaise on harmaa: \"Ennen tämän dokumentin julkaisemista on korjattava validointivirheet\"",
          "osio": "vianetsinta",
          "avainsanat": [
            "julkaise ei toimi",
            "julkaisu ei onnistu",
            "punainen kenttä",
            "pakollinen",
            "vaadittu",
            "validointivirheet",
            "virhe",
            "alt-teksti",
            "hakasulkeet",
            "täytä"
          ],
          "tyypit": [
            "sivu",
            "uutinen",
            "tapahtuma",
            "galleriaAlbumi",
            "klubiToiminta",
            "ravintola",
            "jalkapalloTilasto",
            "etusivu",
            "navigaatio",
            "hallitusJasen"
          ],
          "kesto": null,
          "paivitetty": "2026-10-08",
          "html": "<p><strong>Mitä näet:</strong> <strong>Julkaise</strong> on harmaa, eikä sitä voi painaa. Kun viet hiiren sen päälle, lukee\n&quot;Ennen tämän dokumentin julkaisemista on korjattava validointivirheet&quot;. Välilehden nimen ja\nkentän nimen vieressä on punainen huutomerkki, ja kenttä on punertava.</p>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/julkaise-ei-onnistu-01-virhe.webp\" aria-label=\"Suurenna kuva: Lomake, jossa on virhe. 1: Validointi-painike. 2: virheen rivi paneelissa. 4: harmaa Julkaise-painike.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/julkaise-ei-onnistu-01-virhe.webp\" alt=\"Lomake, jossa on virhe. 1: Validointi-painike. 2: virheen rivi paneelissa. 4: harmaa Julkaise-painike.\" width=\"1280\" height=\"908\" loading=\"lazy\" decoding=\"async\"></button></p>\n<p><strong>Miksi:</strong> Pakollinen kenttä on tyhjä, tai jossakin kentässä on virhe.</p>\n<p><strong>Näin korjaat:</strong></p>\n<ol>\n<li>Lomakkeen oikeassa yläkulmassa paina punaista huutomerkkiä (<strong>Validointi</strong>). ①\nOikealle aukeaa lista: kentän nimi ja virheen teksti.</li>\n<li>Paina listan riviä. ② Lomake siirtyy punaiseen kenttään.</li>\n<li>Korjaa kenttä alla olevan taulukon mukaan. Kun virhe on korjattu, rivi katoaa listasta.</li>\n<li>Kun lista on tyhjä, oikeassa alakulmassa paina <strong>Julkaise</strong>. ④</li>\n</ol>\n<p>Saman tekstin näet, kun viet hiiren kentän nimen vieressä olevan huutomerkin päälle.</p>\n<table>\n<thead>\n<tr>\n<th>Virheen teksti</th>\n<th>Mitä teet</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>&quot;Vaadittu&quot;</td>\n<td>Kenttä on pakollinen. Täytä se.</td>\n</tr>\n<tr>\n<td>&quot;Alt-teksti on pakollinen (3–200 merkkiä).&quot;</td>\n<td>Kirjoita kuvalle <strong>Vaihtoehtoinen teksti (alt)</strong>: mitä kuvassa näkyy.</td>\n</tr>\n<tr>\n<td>&quot;Täytä vielä hakasulkeissa olevat kohdat: …&quot;</td>\n<td>Pohjasta tehtyyn tekstiin jäi kohta [täytä: …]. Kirjoita tilalle oikea tieto ja poista hakasulkeet.</td>\n</tr>\n<tr>\n<td>&quot;Sisältö on pakollinen.&quot;</td>\n<td>Kirjoita uutisen teksti kenttään <strong>Sisältö</strong>.</td>\n</tr>\n<tr>\n<td>&quot;Tiivistelmä on tällä sivulla pakollinen: …&quot;</td>\n<td>Kirjoita johdanto kenttään <strong>Tiivistelmä sivun alussa</strong>.</td>\n</tr>\n<tr>\n<td>&quot;Valitse sivu, johon linkki vie.&quot;</td>\n<td>Valitse linkin kenttään <strong>Sivu</strong> sivu listasta.</td>\n</tr>\n<tr>\n<td>&quot;Valitse, mihin linkki vie.&quot;</td>\n<td>Valitse <strong>Mihin linkki vie?</strong> ja täytä kohde.</td>\n</tr>\n<tr>\n<td>&quot;Valittua sivua ei enää ole. Valitse toinen sivu.&quot;</td>\n<td>Linkin sivu on poistettu. Valitse toinen sivu.</td>\n</tr>\n</tbody>\n</table>\n<p>Keltaiset tekstit ovat vain huomautuksia. Ne eivät estä julkaisua.</p>\n<p>Jos <strong>Julkaise</strong> on harmaa ja sen kohdalla lukee &quot;Julkaistu … sitten&quot;, kaikki on jo julkaistu.</p>\n<p><strong>Ei auttanut?</strong> Ota kuvakaappaus punaisesta kentästä ja lähetä se tukihenkilölle.\nLuonnoksesi säilyy sillä välin, vaikka suljet selaimen.</p>\n",
          "teksti": "Mitä näet: Julkaise on harmaa, eikä sitä voi painaa. Kun viet hiiren sen päälle, lukee \"Ennen tämän dokumentin julkaisemista on korjattava validointivirheet\". Välilehden nimen ja kentän nimen vieressä on punainen huutomerkki, ja kenttä on punertava. Miksi: Pakollinen kenttä on tyhjä, tai jossakin kentässä on virhe. Näin korjaat: Lomakkeen oikeassa yläkulmassa paina punaista huutomerkkiä ( Validointi ). ① Oikealle aukeaa lista: kentän nimi ja virheen teksti. Paina listan riviä. ② Lomake siirtyy punaiseen kenttään. Korjaa kenttä alla olevan taulukon mukaan. Kun virhe on korjattu, rivi katoaa listasta. Kun lista on tyhjä, oikeassa alakulmassa paina Julkaise . ④ Saman tekstin näet, kun viet hiiren kentän nimen vieressä olevan huutomerkin päälle. Virheen teksti Mitä teet \"Vaadittu\" Kenttä on pakollinen. Täytä se. \"Alt-teksti on pakollinen (3–200 merkkiä).\" Kirjoita kuvalle Vaihtoehtoinen teksti (alt) : mitä kuvassa näkyy. \"Täytä vielä hakasulkeissa olevat kohdat: …\" Pohjasta tehtyyn tekstiin jäi kohta [täytä: …]. Kirjoita tilalle oikea tieto ja poista hakasulkeet. \"Sisältö on pakollinen.\" Kirjoita uutisen teksti kenttään Sisältö . \"Tiivistelmä on tällä sivulla pakollinen: …\" Kirjoita johdanto kenttään Tiivistelmä sivun alussa . \"Valitse sivu, johon linkki vie.\" Valitse linkin kenttään Sivu sivu listasta. \"Valitse, mihin linkki vie.\" Valitse Mihin linkki vie? ja täytä kohde. \"Valittua sivua ei enää ole. Valitse toinen sivu.\" Linkin sivu on poistettu. Valitse toinen sivu. Keltaiset tekstit ovat vain huomautuksia. Ne eivät estä julkaisua. Jos Julkaise on harmaa ja sen kohdalla lukee \"Julkaistu … sitten\", kaikki on jo julkaistu. Ei auttanut? Ota kuvakaappaus punaisesta kentästä ja lähetä se tukihenkilölle. Luonnoksesi säilyy sillä välin, vaikka suljet selaimen.",
          "otsikot": []
        },
        {
          "id": "et-ehka-voi-poistaa",
          "otsikko": "Et ehkä voi poistaa \"…\", koska seuraavat asiakirjat viittaavat siihen",
          "osio": "vianetsinta",
          "avainsanat": [
            "poisto ei onnistu",
            "ei voi poistaa",
            "viittaavat",
            "asiakirjat viittaavat",
            "poista joka tapauksessa",
            "poista julkaisu",
            "piilota sivu",
            "kategoria",
            "klubilainen"
          ],
          "tyypit": [
            "sivu",
            "uutinen",
            "tapahtuma",
            "ravintola",
            "uutisKategoria",
            "klubilainen",
            "kaupunki",
            "jalkapalloTilasto"
          ],
          "kesto": null,
          "paivitetty": "2026-10-08",
          "html": "<p><strong>Mitä näet:</strong> Yritit poistaa sivun tai perua sen julkaisun. Ikkunassa lukee\n&quot;Et ehkä voi poistaa “…”, koska seuraavat asiakirjat viittaavat siihen:&quot; ja alla on lista.\nTai ruudulle tulee ilmoitus &quot;Virhe tapahtui yrittäessä poistaa tätä dokumenttia. Tämä yleensä\ntarkoittaa, että muut dokumentit viittaavat siihen.&quot;</p>\n<p><strong>Miksi:</strong> Jokin toinen sivu, valikon kohta tai linkki käyttää sitä, jota yrität poistaa.</p>\n<p><strong>Näin korjaat:</strong></p>\n<ol>\n<li>Älä paina <strong>Poista joka tapauksessa</strong>. Poisto ei onnistu silti.</li>\n<li>Paina listassa olevaa nimeä. Se avautuu Studiossa.</li>\n<li>Etsi siitä linkki tai valinta, joka vie poistettavaan. Se voi olla valikon kohta, pikalinkki, tekstin linkki tai uutisen kategoria.</li>\n<li>Valitse linkille toinen sivu tai poista linkki.</li>\n<li>Jos kentän vieressä on keltainen kolmio ja teksti &quot;Tätä valintaa ei käytetä, koska linkki vie nyt muualle …&quot;, paina valitun sivun rivin kolmea pistettä ja valitse <strong>Tyhjennä</strong>.</li>\n<li>Oikeassa alakulmassa paina <strong>Julkaise</strong>.</li>\n<li>Palaa poistettavaan ja poista se uudelleen.</li>\n</ol>\n<table>\n<thead>\n<tr>\n<th>Mitä poistat</th>\n<th>Mitä teet ensin</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>Uutiskategoria</td>\n<td>Poista kategorian rasti uutisista, jotka on lueteltu ikkunassa.</td>\n</tr>\n<tr>\n<td>Klubilainen</td>\n<td>Klubilaista ei voi poistaa, koska arvosanat viittaavat häneen. Käännä sen sijaan kytkin <strong>Näytä arvostelulomakkeella</strong> pois päältä.</td>\n</tr>\n<tr>\n<td>Hallituksen jäsen</td>\n<td>Älä poista. Käännä kytkin <strong>Nykyinen jäsen</strong> pois päältä: <a href=\"/studio/ohjeet/hallitus\" data-ohje-kortti=\"hallitus\">Vaihda hallituksen jäseniä</a>.</td>\n</tr>\n</tbody>\n</table>\n<div class=\"markdown-alert markdown-alert-note\">\n<p class=\"markdown-alert-title\">Hyvä tietää</p>\n<p>Joskus ennen tätä ikkunaa tulee toinen ikkuna, jossa lukee <strong>Nykyinen osoite:</strong> ja lista\nvanhoja osoitteita. Se muistuttaa, että vanhat linkit lakkaavat toimimasta. Paina siinä\n<strong>Poista silti</strong> ja sen jälkeen <strong>Poista nyt</strong>. Tee sitten ohjaus: <a href=\"/studio/ohjeet/lyhytosoite\" data-ohje-kortti=\"lyhytosoite\">Tee lyhytosoite esitteeseen</a>.</p>\n</div>\n<p><strong>Ei auttanut?</strong> Ota kuvakaappaus ikkunasta ja lähetä se tukihenkilölle. Mitään ei ole\npoistettu, joten kiirettä ei ole.</p>\n",
          "teksti": "Mitä näet: Yritit poistaa sivun tai perua sen julkaisun. Ikkunassa lukee \"Et ehkä voi poistaa “…”, koska seuraavat asiakirjat viittaavat siihen:\" ja alla on lista. Tai ruudulle tulee ilmoitus \"Virhe tapahtui yrittäessä poistaa tätä dokumenttia. Tämä yleensä tarkoittaa, että muut dokumentit viittaavat siihen.\" Miksi: Jokin toinen sivu, valikon kohta tai linkki käyttää sitä, jota yrität poistaa. Näin korjaat: Älä paina Poista joka tapauksessa . Poisto ei onnistu silti. Paina listassa olevaa nimeä. Se avautuu Studiossa. Etsi siitä linkki tai valinta, joka vie poistettavaan. Se voi olla valikon kohta, pikalinkki, tekstin linkki tai uutisen kategoria. Valitse linkille toinen sivu tai poista linkki. Jos kentän vieressä on keltainen kolmio ja teksti \"Tätä valintaa ei käytetä, koska linkki vie nyt muualle …\", paina valitun sivun rivin kolmea pistettä ja valitse Tyhjennä . Oikeassa alakulmassa paina Julkaise . Palaa poistettavaan ja poista se uudelleen. Mitä poistat Mitä teet ensin Uutiskategoria Poista kategorian rasti uutisista, jotka on lueteltu ikkunassa. Klubilainen Klubilaista ei voi poistaa, koska arvosanat viittaavat häneen. Käännä sen sijaan kytkin Näytä arvostelulomakkeella pois päältä. Hallituksen jäsen Älä poista. Käännä kytkin Nykyinen jäsen pois päältä: Vaihda hallituksen jäseniä . Joskus ennen tätä ikkunaa tulee toinen ikkuna, jossa lukee Nykyinen osoite: ja lista vanhoja osoitteita. Se muistuttaa, että vanhat linkit lakkaavat toimimasta. Paina siinä Poista silti ja sen jälkeen Poista nyt . Tee sitten ohjaus: Tee lyhytosoite esitteeseen . Ei auttanut? Ota kuvakaappaus ikkunasta ja lähetä se tukihenkilölle. Mitään ei ole poistettu, joten kiirettä ei ole.",
          "otsikot": []
        },
        {
          "id": "ohjauksen-ilmoitukset",
          "otsikko": "Lyhytosoitteessa punainen teksti, esimerkiksi \"Osoitteessa … on jo sivu\"",
          "osio": "vianetsinta",
          "avainsanat": [
            "lyhytosoite",
            "ohjaus",
            "on jo sivu",
            "on jo ohjaus",
            "kiinteä ohjaus",
            "ei voi ohjata",
            "lyhytosoite ei toimi",
            "punainen",
            "keltainen"
          ],
          "tyypit": [
            "ohjaus"
          ],
          "kesto": null,
          "paivitetty": "2026-10-08",
          "html": "<p><strong>Mitä näet:</strong> Teet lyhytosoitetta tai ohjausta. Kentän <strong>Osoite sivustolla</strong> tai\n<strong>Minne ohjataan</strong> vieressä on punainen huutomerkki tai keltainen kolmio.</p>\n<p><strong>Miksi:</strong> Osoite on jo käytössä, tai se on kirjoitettu muodossa, joka ei kelpaa.</p>\n<p><strong>Näin korjaat:</strong></p>\n<ol>\n<li>Vie hiiri huutomerkin tai kolmion päälle ja lue teksti. Saman listan näet oikean yläkulman punaisesta huutomerkistä (<strong>Validointi</strong>).</li>\n<li>Etsi sama teksti alla olevista taulukoista ja tee, kuten neuvotaan.</li>\n<li>Kun punaista tekstiä ei enää ole, paina oikeassa alakulmassa <strong>Julkaise</strong>.</li>\n</ol>\n<p>Punaiset tekstit estävät julkaisun:</p>\n<table>\n<thead>\n<tr>\n<th>Teksti</th>\n<th>Mitä teet</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>&quot;Osoitteessa … on jo sivu. Ohjaus toimii vain osoitteissa, joissa ei ole sivua. Valitse toinen osoite.&quot;</td>\n<td>Osoitteessa on jo sivu. Valitse toinen osoite. Jos sivu on tarkoitus poistaa, poista se ensin ja tee ohjaus sen jälkeen.</td>\n</tr>\n<tr>\n<td>&quot;Osoitteessa … on jo sivu. Valitse toinen osoite.&quot;</td>\n<td>Osoite kuuluu sivuston omalle sivulle. Valitse toinen osoite.</td>\n</tr>\n<tr>\n<td>&quot;Osoitteelle … on jo ohjaus. Avaa se listasta ja muuta sen kohdetta.&quot;</td>\n<td>Avaa vanha ohjaus listasta <strong>Lyhytosoitteet ja ohjaukset</strong> ja vaihda sen kohde.</td>\n</tr>\n<tr>\n<td>&quot;Osoitteella … on jo kiinteä ohjaus (vanhan sivuston osoite). Valitse toinen osoite.&quot;</td>\n<td>Vanhan sivuston osoite ohjautuu jo muualle. Valitse toinen osoite. Jos kohde on pakko vaihtaa, kerro tukihenkilölle.</td>\n</tr>\n<tr>\n<td>&quot;Osoite /… on sivuston oma, eikä sitä voi ohjata.&quot;</td>\n<td>Valitse toinen osoite.</td>\n</tr>\n<tr>\n<td>&quot;Etusivua ei voi ohjata.&quot;</td>\n<td>Kirjoita osoite kauttaviivan perään, esimerkiksi /jasenmaksu.</td>\n</tr>\n<tr>\n<td>&quot;Ohjaus ei voi osoittaa itseensä.&quot;</td>\n<td>Valitse kohteeksi toinen sivu.</td>\n</tr>\n<tr>\n<td>&quot;Kirjoita vain sivuston osoitteen loppuosa, esim. /jasenmaksu, ei koko osoitetta.&quot;</td>\n<td>Poista alusta <a href=\"https://www.lahdensuomalainenklubi.com\" target=\"_blank\" rel=\"noopener noreferrer\">https://www.lahdensuomalainenklubi.com</a>.</td>\n</tr>\n<tr>\n<td>&quot;Osoite alkaa kauttaviivalla, esim. /jasenmaksu.&quot;</td>\n<td>Lisää alkuun kauttaviiva /.</td>\n</tr>\n<tr>\n<td>&quot;Käytä pieniä kirjaimia: …&quot;</td>\n<td>Kirjoita osoite pienillä kirjaimilla, kuten tekstissä näytetään.</td>\n</tr>\n<tr>\n<td>&quot;Poista kauttaviiva osoitteen lopusta.&quot;</td>\n<td>Poista viimeinen /.</td>\n</tr>\n<tr>\n<td>&quot;Osoitteessa ei voi olla ?- tai #-merkkiä.&quot;</td>\n<td>Poista merkit ? ja # ja kaikki niiden jälkeen.</td>\n</tr>\n<tr>\n<td>&quot;Virheellinen kohta &quot;…&quot;. Käytä vain kirjaimia a–z, numeroita ja yksittäisiä yhdysmerkkejä (ä → a, ö → o).&quot;</td>\n<td>Kirjoita ä:n tilalle a ja ö:n tilalle o. Vaihda välilyönnit yhdysmerkeiksi.</td>\n</tr>\n<tr>\n<td>&quot;Valitse, mihin linkki vie.&quot;</td>\n<td>Valitse kohde kohtaan <strong>Minne ohjataan</strong>.</td>\n</tr>\n</tbody>\n</table>\n<p>Keltaiset tekstit eivät estä julkaisua:</p>\n<table>\n<thead>\n<tr>\n<th>Teksti</th>\n<th>Mitä se tarkoittaa</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>&quot;Tämä osoite ohjautuu nyt automaattisesti sivulle &quot;…&quot;. Ohjauksesi korvaa sen.&quot;</td>\n<td>Osoite on jonkin sivun vanha osoite. Kun julkaiset, sinun ohjauksesi voittaa.</td>\n</tr>\n<tr>\n<td>&quot;Kohde … on itsekin ohjaus. Valitse suoraan lopullinen sivu.&quot;</td>\n<td>Valitse kohteeksi se sivu, johon toinen ohjaus vie.</td>\n</tr>\n</tbody>\n</table>\n<p><strong>Ei auttanut?</strong> Lyhytosoite ei ohjaa, vaikka tekstejä ei ole: tarkista, että painoit\n<strong>Julkaise</strong>. Kokeile sitten minuutin kuluttua uudelleen. Jos osoite ei vieläkään ohjaa,\nkerro tukihenkilölle osoite ja kohde.</p>\n",
          "teksti": "Mitä näet: Teet lyhytosoitetta tai ohjausta. Kentän Osoite sivustolla tai Minne ohjataan vieressä on punainen huutomerkki tai keltainen kolmio. Miksi: Osoite on jo käytössä, tai se on kirjoitettu muodossa, joka ei kelpaa. Näin korjaat: Vie hiiri huutomerkin tai kolmion päälle ja lue teksti. Saman listan näet oikean yläkulman punaisesta huutomerkistä ( Validointi ). Etsi sama teksti alla olevista taulukoista ja tee, kuten neuvotaan. Kun punaista tekstiä ei enää ole, paina oikeassa alakulmassa Julkaise . Punaiset tekstit estävät julkaisun: Teksti Mitä teet \"Osoitteessa … on jo sivu. Ohjaus toimii vain osoitteissa, joissa ei ole sivua. Valitse toinen osoite.\" Osoitteessa on jo sivu. Valitse toinen osoite. Jos sivu on tarkoitus poistaa, poista se ensin ja tee ohjaus sen jälkeen. \"Osoitteessa … on jo sivu. Valitse toinen osoite.\" Osoite kuuluu sivuston omalle sivulle. Valitse toinen osoite. \"Osoitteelle … on jo ohjaus. Avaa se listasta ja muuta sen kohdetta.\" Avaa vanha ohjaus listasta Lyhytosoitteet ja ohjaukset ja vaihda sen kohde. \"Osoitteella … on jo kiinteä ohjaus (vanhan sivuston osoite). Valitse toinen osoite.\" Vanhan sivuston osoite ohjautuu jo muualle. Valitse toinen osoite. Jos kohde on pakko vaihtaa, kerro tukihenkilölle. \"Osoite /… on sivuston oma, eikä sitä voi ohjata.\" Valitse toinen osoite. \"Etusivua ei voi ohjata.\" Kirjoita osoite kauttaviivan perään, esimerkiksi /jasenmaksu. \"Ohjaus ei voi osoittaa itseensä.\" Valitse kohteeksi toinen sivu. \"Kirjoita vain sivuston osoitteen loppuosa, esim. /jasenmaksu, ei koko osoitetta.\" Poista alusta https://www.lahdensuomalainenklubi.com . \"Osoite alkaa kauttaviivalla, esim. /jasenmaksu.\" Lisää alkuun kauttaviiva /. \"Käytä pieniä kirjaimia: …\" Kirjoita osoite pienillä kirjaimilla, kuten tekstissä näytetään. \"Poista kauttaviiva osoitteen lopusta.\" Poista viimeinen /. \"Osoitteessa ei voi olla ?- tai #-merkkiä.\" Poista merkit ? ja # ja kaikki niiden jälkeen. \"Virheellinen kohta \"…\". Käytä vain kirjaimia a–z, numeroita ja yksittäisiä yhdysmerkkejä (ä → a, ö → o).\" Kirjoita ä:n tilalle a ja ö:n tilalle o. Vaihda välilyönnit yhdysmerkeiksi. \"Valitse, mihin linkki vie.\" Valitse kohde kohtaan Minne ohjataan . Keltaiset tekstit eivät estä julkaisua: Teksti Mitä se tarkoittaa \"Tämä osoite ohjautuu nyt automaattisesti sivulle \"…\". Ohjauksesi korvaa sen.\" Osoite on jonkin sivun vanha osoite. Kun julkaiset, sinun ohjauksesi voittaa. \"Kohde … on itsekin ohjaus. Valitse suoraan lopullinen sivu.\" Valitse kohteeksi se sivu, johon toinen ohjaus vie. Ei auttanut? Lyhytosoite ei ohjaa, vaikka tekstejä ei ole: tarkista, että painoit Julkaise . Kokeile sitten minuutin kuluttua uudelleen. Jos osoite ei vieläkään ohjaa, kerro tukihenkilölle osoite ja kohde.",
          "otsikot": []
        },
        {
          "id": "studio-nayttaa-virheen",
          "otsikko": "Studio näyttää virheen tai ei aukea",
          "osio": "vianetsinta",
          "avainsanat": [
            "virhe",
            "kaatui",
            "jumissa",
            "Studio ei aukea",
            "tyhjä sivu",
            "valkoinen sivu",
            "odottamaton virhe",
            "rakenteen lukemisessa",
            "lataa uudelleen",
            "kirjautuminen"
          ],
          "tyypit": [],
          "kesto": null,
          "paivitetty": "2026-10-08",
          "html": "<p><strong>Mitä näet:</strong> Studion tilalla on virheruutu tai tyhjä sivu. Ruudulla voi lukea esimerkiksi\n&quot;Rakenteen lukemisessa havaittiin virhe&quot; tai kentän kohdalla &quot;Odottamaton virhe: …&quot;.</p>\n<p><strong>Miksi:</strong> Studiossa on vika, tai verkkoyhteys katkesi. Sisältösi on tallessa.</p>\n<p><strong>Näin korjaat:</strong></p>\n<ol>\n<li>Ota kuvakaappaus virheestä ennen kuin teet mitään muuta.</li>\n<li>Jos ruudulla on painike <strong>Lataa uudelleen</strong>, paina sitä. Muuten päivitä sivu painamalla F5.</li>\n<li>Tarkista verkkoyhteys: avaa jokin muu verkkosivu.</li>\n<li>Jos vain yksi sivu tai uutinen aiheuttaa virheen, avaa jokin toinen. Muut toimivat yleensä normaalisti.</li>\n<li>Kokeile toisella selaimella tai toisella laitteella.</li>\n<li>Jos Studio pyytää kirjautumaan, kirjaudu omalla tunnuksellasi.</li>\n</ol>\n<div class=\"markdown-alert markdown-alert-note\">\n<p class=\"markdown-alert-title\">Hyvä tietää</p>\n<p>Sivusto toimii kävijöille, vaikka Studio ei aukeaisi. Kesken jäänyt muutos on tallessa\nluonnoksena.</p>\n</div>\n<p><strong>Ei auttanut?</strong> Lähetä tukihenkilölle kuvakaappaus, kellonaika ja kuvaus siitä, mitä olit\ntekemässä. Ohje: <a href=\"/studio/ohjeet/tukihenkilo\" data-ohje-kortti=\"tukihenkilo\">Mihin tarvitset tukihenkilöä</a>.</p>\n",
          "teksti": "Mitä näet: Studion tilalla on virheruutu tai tyhjä sivu. Ruudulla voi lukea esimerkiksi \"Rakenteen lukemisessa havaittiin virhe\" tai kentän kohdalla \"Odottamaton virhe: …\". Miksi: Studiossa on vika, tai verkkoyhteys katkesi. Sisältösi on tallessa. Näin korjaat: Ota kuvakaappaus virheestä ennen kuin teet mitään muuta. Jos ruudulla on painike Lataa uudelleen , paina sitä. Muuten päivitä sivu painamalla F5. Tarkista verkkoyhteys: avaa jokin muu verkkosivu. Jos vain yksi sivu tai uutinen aiheuttaa virheen, avaa jokin toinen. Muut toimivat yleensä normaalisti. Kokeile toisella selaimella tai toisella laitteella. Jos Studio pyytää kirjautumaan, kirjaudu omalla tunnuksellasi. Sivusto toimii kävijöille, vaikka Studio ei aukeaisi. Kesken jäänyt muutos on tallessa luonnoksena. Ei auttanut? Lähetä tukihenkilölle kuvakaappaus, kellonaika ja kuvaus siitä, mitä olit tekemässä. Ohje: Mihin tarvitset tukihenkilöä .",
          "otsikot": []
        },
        {
          "id": "aloituksessa-punainen-rivi",
          "otsikko": "Aloituksessa lukee Vaatii toimia tai Huomioitavaa",
          "osio": "vianetsinta",
          "avainsanat": [
            "aloitus",
            "punainen rivi",
            "keltainen rivi",
            "vaatii toimia",
            "huomioitavaa",
            "varmuuskopio",
            "yöllinen huolto",
            "otteluohjelman haku",
            "kiintiö",
            "sivuston tila"
          ],
          "tyypit": [],
          "kesto": null,
          "paivitetty": "2026-10-08",
          "html": "<p><strong>Mitä näet:</strong> Aloituksen kohdassa <strong>Sivuston tila</strong> yhteenveto on punainen ja siinä lukee\n<strong>Vaatii toimia</strong>, tai se on keltainen ja siinä lukee <strong>Huomioitavaa</strong>. Jollakin rivillä lukee\n<strong>Vaatii toimia</strong> tai <strong>Huomio</strong>.</p>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/aloituksessa-punainen-rivi-01-tila.webp\" aria-label=\"Suurenna kuva: Aloituksen Sivuston tila. 2: Päivitä-painike. 3: punainen rivi, jossa otsikko, teksti ja ohje.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/aloituksessa-punainen-rivi-01-tila.webp\" alt=\"Aloituksen Sivuston tila. 2: Päivitä-painike. 3: punainen rivi, jossa otsikko, teksti ja ohje.\" width=\"1042\" height=\"338\" loading=\"lazy\" decoding=\"async\"></button></p>\n<p><strong>Miksi:</strong> Jokin automaattinen työ ei ole onnistunut. Sisältösi ei katoa, vaikka rivi on punainen.</p>\n<p><strong>Näin korjaat:</strong></p>\n<ol>\n<li>Jatka työtä normaalisti. Voit kirjoittaa ja julkaista.</li>\n<li>Paina <strong>Päivitä</strong>. ② Joskus tieto on vain vanhentunut.</li>\n<li>Lue rivin otsikko, teksti ja ohje. ③</li>\n<li>Toimi alla olevan taulukon mukaan.</li>\n</ol>\n<table>\n<thead>\n<tr>\n<th>Rivi</th>\n<th>Mitä teet</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td><strong>Varmuuskopio</strong>, Vaatii toimia</td>\n<td>Kerro tukihenkilölle. Vanhaa versiota ei voi palauttaa varmuuskopiosta ennen uutta kopiota.</td>\n</tr>\n<tr>\n<td><strong>Varmuuskopio</strong>, Huomio</td>\n<td>Kopio on tallessa. Kerro tukihenkilölle, jos sama toistuu ensi viikolla.</td>\n</tr>\n<tr>\n<td><strong>Yöllinen huolto</strong>, Vaatii toimia</td>\n<td>Kerro tukihenkilölle. Ravintoloiden arvosanat ja siivous odottavat.</td>\n</tr>\n<tr>\n<td><strong>Yöllinen huolto</strong>, Huomio</td>\n<td>Kerro tukihenkilölle, jos sama toistuu useana yönä.</td>\n</tr>\n<tr>\n<td><strong>Otteluohjelman haku</strong>, Vaatii toimia tai Huomio</td>\n<td>Lisää tärkeät ottelut käsin: <a href=\"/studio/ohjeet/ottelun-lisaaminen\" data-ohje-kortti=\"ottelun-lisaaminen\">Lisää ottelu</a>. Kerro tukihenkilölle.</td>\n</tr>\n<tr>\n<td><strong>Julkaisemattomat muutokset</strong>, Huomio</td>\n<td>Paina <strong>Avaa julkaisemattomat muutokset</strong>. Julkaise muutokset tai hylkää ne: <a href=\"/studio/ohjeet/luonnos-julkaisu-ja-peruminen\" data-ohje-kortti=\"luonnos-julkaisu-ja-peruminen\">Luonnos, julkaisu ja peruminen</a>.</td>\n</tr>\n<tr>\n<td><strong>Dokumenttikiintiö (arvio)</strong>, Huomio</td>\n<td>Kerro tukihenkilölle. Kun raja täyttyy, uutta sisältöä ei voi tallentaa.</td>\n</tr>\n</tbody>\n</table>\n<p>Harmaa rivi, jossa lukee <strong>Ei vielä tietoa</strong>, ei vaadi toimia. Kiintiön rivillä lukee\ntavallisesti <strong>Arvio</strong>. Talvella otteluhaun rivillä voi lukea &quot;Talvitauko&quot;, mikä on normaalia.</p>\n<p>Jos Aloituksessa lukee &quot;Sivuston tilaa ei saatu haettua. Yritä hetken kuluttua uudelleen\nPäivitä-painikkeesta.&quot;, odota hetki ja paina <strong>Päivitä</strong>.</p>\n<p><strong>Ei auttanut?</strong> Kerro tukihenkilölle rivin otsikko ja teksti sanatarkasti, tai lähetä\nkuvakaappaus. Ohje: <a href=\"/studio/ohjeet/aloitus-ja-sivuston-tila\" data-ohje-kortti=\"aloitus-ja-sivuston-tila\">Aloitus ja sivuston tila</a>.</p>\n",
          "teksti": "Mitä näet: Aloituksen kohdassa Sivuston tila yhteenveto on punainen ja siinä lukee Vaatii toimia , tai se on keltainen ja siinä lukee Huomioitavaa . Jollakin rivillä lukee Vaatii toimia tai Huomio . Miksi: Jokin automaattinen työ ei ole onnistunut. Sisältösi ei katoa, vaikka rivi on punainen. Näin korjaat: Jatka työtä normaalisti. Voit kirjoittaa ja julkaista. Paina Päivitä . ② Joskus tieto on vain vanhentunut. Lue rivin otsikko, teksti ja ohje. ③ Toimi alla olevan taulukon mukaan. Rivi Mitä teet Varmuuskopio , Vaatii toimia Kerro tukihenkilölle. Vanhaa versiota ei voi palauttaa varmuuskopiosta ennen uutta kopiota. Varmuuskopio , Huomio Kopio on tallessa. Kerro tukihenkilölle, jos sama toistuu ensi viikolla. Yöllinen huolto , Vaatii toimia Kerro tukihenkilölle. Ravintoloiden arvosanat ja siivous odottavat. Yöllinen huolto , Huomio Kerro tukihenkilölle, jos sama toistuu useana yönä. Otteluohjelman haku , Vaatii toimia tai Huomio Lisää tärkeät ottelut käsin: Lisää ottelu . Kerro tukihenkilölle. Julkaisemattomat muutokset , Huomio Paina Avaa julkaisemattomat muutokset . Julkaise muutokset tai hylkää ne: Luonnos, julkaisu ja peruminen . Dokumenttikiintiö (arvio) , Huomio Kerro tukihenkilölle. Kun raja täyttyy, uutta sisältöä ei voi tallentaa. Harmaa rivi, jossa lukee Ei vielä tietoa , ei vaadi toimia. Kiintiön rivillä lukee tavallisesti Arvio . Talvella otteluhaun rivillä voi lukea \"Talvitauko\", mikä on normaalia. Jos Aloituksessa lukee \"Sivuston tilaa ei saatu haettua. Yritä hetken kuluttua uudelleen Päivitä-painikkeesta.\", odota hetki ja paina Päivitä . Ei auttanut? Kerro tukihenkilölle rivin otsikko ja teksti sanatarkasti, tai lähetä kuvakaappaus. Ohje: Aloitus ja sivuston tila .",
          "otsikot": []
        },
        {
          "id": "poistin-vahingossa",
          "otsikko": "Poistin vahingossa: \"Tämä asiakirja on poistettu.\"",
          "osio": "vianetsinta",
          "avainsanat": [
            "poistin vahingossa",
            "poistettu",
            "palauta",
            "katosi",
            "hävisi",
            "kumoa",
            "virhe",
            "vahinko",
            "tein virheen",
            "vanha versio"
          ],
          "tyypit": [],
          "kesto": null,
          "paivitetty": "2026-10-08",
          "html": "<p><strong>Mitä näet:</strong> Poistit sivun, uutisen tai muun vahingossa. Lomake sulkeutui. Kun palaat siihen\nselaimen Takaisin-nuolella, sen yläreunassa lukee &quot;Tämä asiakirja on poistettu.&quot;</p>\n<p><strong>Miksi:</strong> Poisto vie sisällön pois sivustolta ja Studion listoista. Sisältö on silti\npalautettavissa.</p>\n<p><strong>Näin korjaat:</strong></p>\n<ol>\n<li>Heti poiston jälkeen paina selaimen Takaisin-nuolta. Lomakkeen yläreunassa paina <strong>Palauta viimeisin versio</strong>.</li>\n<li>Tarkista sisältö ja paina oikeassa alakulmassa <strong>Julkaise</strong>.</li>\n<li>Jos lomake ei aukea enää, palauta se varmuuskopiosta: <strong>Sivuston asetukset → Varmuuskopiot</strong> → uusin kopio → välilehti <strong>Palauta poistettu</strong>. Ohje: <a href=\"/studio/ohjeet/poistetun-palautus\" data-ohje-kortti=\"poistetun-palautus\">Palauta poistettu</a>.</li>\n</ol>\n<p>Poistitko vain osan, esimerkiksi kappaleen, kuvan tai lohkon?</p>\n<ul>\n<li>Alle kolme päivää sitten: palauta aiempi versio historiasta. Ohje: <a href=\"/studio/ohjeet/luonnos-julkaisu-ja-peruminen\" data-ohje-kortti=\"luonnos-julkaisu-ja-peruminen\">Luonnos, julkaisu ja peruminen</a>.</li>\n<li>Aiemmin: valitse <strong>Julkaise</strong>-painikkeen vieressä olevasta valikosta <strong>Palauta varmuuskopiosta</strong>. Ohje: <a href=\"/studio/ohjeet/vanhan-version-palautus\" data-ohje-kortti=\"vanhan-version-palautus\">Palauta vanha versio</a>.</li>\n</ul>\n<div class=\"markdown-alert markdown-alert-note\">\n<p class=\"markdown-alert-title\">Hyvä tietää</p>\n<p>Kommentteja ja kävijöiden arvosteluja ei palauteta varmuuskopiosta. Niiden poisto on\ntarkoituksellista.</p>\n</div>\n<p><strong>Ei auttanut?</strong> Jos poistettu oli tehty saman viikon aikana, se ei ehkä ole vielä\nvarmuuskopiossa. Kerro tukihenkilölle heti poistetun nimi ja poiston aika.</p>\n",
          "teksti": "Mitä näet: Poistit sivun, uutisen tai muun vahingossa. Lomake sulkeutui. Kun palaat siihen selaimen Takaisin-nuolella, sen yläreunassa lukee \"Tämä asiakirja on poistettu.\" Miksi: Poisto vie sisällön pois sivustolta ja Studion listoista. Sisältö on silti palautettavissa. Näin korjaat: Heti poiston jälkeen paina selaimen Takaisin-nuolta. Lomakkeen yläreunassa paina Palauta viimeisin versio . Tarkista sisältö ja paina oikeassa alakulmassa Julkaise . Jos lomake ei aukea enää, palauta se varmuuskopiosta: Sivuston asetukset → Varmuuskopiot → uusin kopio → välilehti Palauta poistettu . Ohje: Palauta poistettu . Poistitko vain osan, esimerkiksi kappaleen, kuvan tai lohkon? Alle kolme päivää sitten: palauta aiempi versio historiasta. Ohje: Luonnos, julkaisu ja peruminen . Aiemmin: valitse Julkaise -painikkeen vieressä olevasta valikosta Palauta varmuuskopiosta . Ohje: Palauta vanha versio . Kommentteja ja kävijöiden arvosteluja ei palauteta varmuuskopiosta. Niiden poisto on tarkoituksellista. Ei auttanut? Jos poistettu oli tehty saman viikon aikana, se ei ehkä ole vielä varmuuskopiossa. Kerro tukihenkilölle heti poistetun nimi ja poiston aika.",
          "otsikot": []
        }
      ]
    },
    {
      "id": "hakuteos",
      "otsikko": "Hakuteos",
      "kortit": [
        {
          "id": "valikon-kartta",
          "otsikko": "Studion valikon kartta",
          "osio": "hakuteos",
          "avainsanat": [
            "valikko",
            "kartta",
            "missä on",
            "mistä löytyy",
            "sisältö",
            "yläpalkki",
            "työkalut",
            "rakenne",
            "kaikki kohdat"
          ],
          "tyypit": [],
          "kesto": null,
          "paivitetty": "2026-10-08",
          "html": "<p>Tässä ovat Studion kaikki valikon kohdat samassa järjestyksessä kuin ruudulla.</p>\n<h2 id=\"valikon-kartta--ylapalkki\">Yläpalkki</h2>\n<table>\n<thead>\n<tr>\n<th>Kohta</th>\n<th>Mitä siellä on</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td><strong>Aloitus</strong></td>\n<td>Studio avautuu tähän: sivuston tila, odottavat tehtävät ja puuttuvat perustiedot.</td>\n</tr>\n<tr>\n<td><strong>Sisältö</strong></td>\n<td>Kaikki muokattava sisältö. Vasemmalla valikko, oikealla lomake.</td>\n</tr>\n<tr>\n<td><strong>Esikatselu</strong></td>\n<td>Sivuston sivut luonnoksineen ennen julkaisua.</td>\n</tr>\n<tr>\n<td><strong>Ohjeet</strong></td>\n<td>Tämä ohje. Haku ja kaikki kortit.</td>\n</tr>\n<tr>\n<td><strong>Kyselyt (tukihenkilö)</strong></td>\n<td>Tukihenkilön työkalu. Älä käytä sitä.</td>\n</tr>\n<tr>\n<td>Releases</td>\n<td>Englanninkielinen lisätyökalu. Älä käytä sitä.</td>\n</tr>\n<tr>\n<td>Plus-painike (+), <strong>Luo uusi asiakirja</strong></td>\n<td>Yläpalkin vasemmassa reunassa. Uuden sisällön teko suoraan. Sama onnistuu listan plus-painikkeella.</td>\n</tr>\n</tbody>\n</table>\n<p>Yläpalkissa on myös haku (suurennuslasi, <strong>Avaa haku</strong>). Ohje: <a href=\"/studio/ohjeet/etsi-haulla\" data-ohje-kortti=\"etsi-haulla\">Etsi haulla</a>.\nOikealla oleva valinta <strong>Luonnokset</strong> näyttää, mitä versiota katselet. Älä muuta sitä.</p>\n<h2 id=\"valikon-kartta--sisalto-vasen-valikko\">Sisältö: vasen valikko</h2>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/valikon-kartta-01-valikko.webp\" aria-label=\"Suurenna kuva: Studion vasen valikko. 1: Tehtävät sinulle. 2: Sivuston asetukset. 3: Uutiset. 4: Klubi. 5: Ravintolat.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/valikon-kartta-01-valikko.webp\" alt=\"Studion vasen valikko. 1: Tehtävät sinulle. 2: Sivuston asetukset. 3: Uutiset. 4: Klubi. 5: Ravintolat.\" width=\"415\" height=\"750\" loading=\"lazy\" decoding=\"async\"></button></p>\n<p><strong>Tehtävät sinulle</strong>: kaikki, mikä odottaa sinua. Tyhjä lista tarkoittaa, ettei tehtävää ole.</p>\n<ul>\n<li><strong>Arvostelut odottavat hyväksyntää</strong>: kävijöiden ravintola-arvostelut</li>\n<li><strong>Uudet kommentit (7 päivää)</strong>: jäsenten kommentit ja veikkaukset</li>\n<li><strong>Julkaisemattomat muutokset</strong>: muutokset, joita ei ole julkaistu</li>\n<li><strong>Ajastetut uutiset</strong>: uutiset, joiden julkaisuaika on tulevaisuudessa</li>\n<li><strong>Vaatii tarkistuksen (kaikki)</strong>: siirrossa tarkistettaviksi merkityt</li>\n</ul>\n<p><strong>Sivuston asetukset</strong></p>\n<ul>\n<li><strong>Etusivu</strong>: yläosa, lohkot ja hakukoneteksti</li>\n<li><strong>Navigaatio</strong>: valikko ja alatunniste</li>\n<li><strong>Ohjaukset ja lyhytosoitteet</strong>: <strong>Lyhytosoitteet ja ohjaukset</strong> ja <strong>Muuttuneet osoitteet (automaattiset)</strong></li>\n<li><strong>Varmuuskopiot</strong>: viikoittaiset varmuuskopiot ja poistettujen palautus</li>\n</ul>\n<p><strong>Tarkistettavat</strong>: siirrossa tarkistettaviksi merkityt tyypeittäin: Uutiset, Ravintolat,\nTilastot, Stadionit, Klubin toiminta, Pelaajat, Lehtileikkeet, Arvokisat, Sivut, Tapahtumat\nja Galleria-albumit.</p>\n<p><strong>Uutiset</strong>: kaikki uutiset ja vanhan blogin kirjoitukset, uusin ensin.</p>\n<p><strong>Uutiskategoriat</strong>: uutisten aiheet ja uutislistan suodatin.</p>\n<p><strong>Kommentit ja veikkaukset</strong>: <strong>Uusimmat</strong>, <strong>Uutisittain</strong> ja <strong>Piilotetut</strong>.</p>\n<p><strong>Ottelut</strong>: käsin lisätyt ottelut otteluohjelmaan.</p>\n<p><strong>Tapahtumat</strong>: klubin tapahtumat.</p>\n<p><strong>Galleria-albumit</strong>: kuva-albumit.</p>\n<p><strong>Sivut</strong>: omat tekstisivut, esimerkiksi säännöt ja tietosuojaseloste.</p>\n<p><strong>Klubi</strong>: sama rakenne kuin sivuston Klubi-osiossa.</p>\n<ul>\n<li><strong>Esittely</strong>: Klubi-sivun teksti ja kuva</li>\n<li><strong>Toiminta</strong>: <strong>Toiminta-sivun otsikko ja johdanto</strong> ja <strong>Toimintamuodot</strong></li>\n<li><strong>Hallitus</strong>: <strong>Hallitus-sivun otsikko ja johdanto</strong>, <strong>Nykyinen hallitus</strong> ja <strong>Entiset jäsenet</strong></li>\n<li><strong>Palloveikkaus</strong>: <strong>Palloveikkaus-sivu</strong> ja <strong>Veikkausten alasivut</strong></li>\n<li><strong>Yhteystiedot</strong>: <strong>Osoite, sähköposti ja some</strong> ja <strong>Yhteystiedot-sivun otsikko ja johdanto</strong></li>\n</ul>\n<p><strong>Ravintolat</strong></p>\n<ul>\n<li><strong>Kaikki ravintolat</strong></li>\n<li><strong>Ravintolat: odottavat toista arvioijaa</strong>: ravintolat, joilla on alle kahden klubilaisen arvosanat</li>\n<li><strong>Arvostelut: odottavat hyväksyntää</strong></li>\n<li><strong>Arvostelut: kaikki</strong></li>\n<li><strong>Klubilaisten arvosanat</strong>: <strong>Ravintoloittain</strong> ja <strong>Kaikki (uusin ensin)</strong></li>\n<li><strong>Klubilaiset</strong></li>\n<li><strong>Kaupungit</strong></li>\n</ul>\n<p><strong>Jalkapalloarkisto</strong></p>\n<ul>\n<li><strong>Tilastot</strong>: <strong>Klubin omat tilastot</strong>, <strong>Huuhkajat</strong>, <strong>Karsinnat</strong>, <strong>Arvokisat</strong>, <strong>Muut arkiston taulukot</strong> ja <strong>Kaikki tilastot</strong></li>\n<li><strong>Arvokisat</strong></li>\n<li><strong>Pelaajat</strong></li>\n<li><strong>Lehtileikkeet</strong>: Litmasen lehtijutut</li>\n<li><strong>Stadionit</strong></li>\n</ul>\n<p><strong>Osioiden sivut</strong>: listasivujen otsikot, johdannot ja hakukonetekstit.</p>\n<ul>\n<li><strong>Uutiset ja tapahtumat</strong>: Uutiset, Uutisarkisto, Uutisten tunnisteet, Tapahtumat, Galleria ja Ottelut</li>\n<li><strong>Ravintolat</strong>: Ravintola-arviot ja Odottavat toista arvioijaa</li>\n<li><strong>Jalkapalloarkisto</strong>: arkiston etusivu ja sen 16 osiota, esimerkiksi Huuhkajat, Suomen mestarit ja Stadionit</li>\n</ul>\n<h2 id=\"valikon-kartta--mista-loydan\">Mistä löydän…</h2>\n<table>\n<thead>\n<tr>\n<th>Haluan muuttaa</th>\n<th>Mene kohtaan</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>Etusivun pääjutun tai taustakuvan</td>\n<td><strong>Sivuston asetukset → Etusivu</strong></td>\n</tr>\n<tr>\n<td>Valikon tai alatunnisteen</td>\n<td><strong>Sivuston asetukset → Navigaatio</strong></td>\n</tr>\n<tr>\n<td>Klubin sähköpostin tai osoitteen</td>\n<td><strong>Klubi → Yhteystiedot → Osoite, sähköposti ja some</strong></td>\n</tr>\n<tr>\n<td>Hallituksen jäsenet</td>\n<td><strong>Klubi → Hallitus → Nykyinen hallitus</strong></td>\n</tr>\n<tr>\n<td>Tapahtumat-sivun johdannon</td>\n<td><strong>Osioiden sivut → Uutiset ja tapahtumat</strong></td>\n</tr>\n<tr>\n<td>Palloveikkauksen taulukot</td>\n<td><strong>Jalkapalloarkisto → Tilastot → Klubin omat tilastot</strong></td>\n</tr>\n<tr>\n<td>Klubilaisen pisteet ravintolalle</td>\n<td><strong>Ravintolat → Klubilaisten arvosanat → Ravintoloittain</strong></td>\n</tr>\n<tr>\n<td>Lyhytosoitteen esitteeseen</td>\n<td><strong>Sivuston asetukset → Ohjaukset ja lyhytosoitteet → Lyhytosoitteet ja ohjaukset</strong></td>\n</tr>\n<tr>\n<td>Vahingossa poistetun</td>\n<td><strong>Sivuston asetukset → Varmuuskopiot</strong></td>\n</tr>\n</tbody>\n</table>\n",
          "teksti": "Tässä ovat Studion kaikki valikon kohdat samassa järjestyksessä kuin ruudulla. Yläpalkki Kohta Mitä siellä on Aloitus Studio avautuu tähän: sivuston tila, odottavat tehtävät ja puuttuvat perustiedot. Sisältö Kaikki muokattava sisältö. Vasemmalla valikko, oikealla lomake. Esikatselu Sivuston sivut luonnoksineen ennen julkaisua. Ohjeet Tämä ohje. Haku ja kaikki kortit. Kyselyt (tukihenkilö) Tukihenkilön työkalu. Älä käytä sitä. Releases Englanninkielinen lisätyökalu. Älä käytä sitä. Plus-painike (+), Luo uusi asiakirja Yläpalkin vasemmassa reunassa. Uuden sisällön teko suoraan. Sama onnistuu listan plus-painikkeella. Yläpalkissa on myös haku (suurennuslasi, Avaa haku ). Ohje: Etsi haulla . Oikealla oleva valinta Luonnokset näyttää, mitä versiota katselet. Älä muuta sitä. Sisältö: vasen valikko Tehtävät sinulle : kaikki, mikä odottaa sinua. Tyhjä lista tarkoittaa, ettei tehtävää ole. Arvostelut odottavat hyväksyntää : kävijöiden ravintola-arvostelut Uudet kommentit (7 päivää) : jäsenten kommentit ja veikkaukset Julkaisemattomat muutokset : muutokset, joita ei ole julkaistu Ajastetut uutiset : uutiset, joiden julkaisuaika on tulevaisuudessa Vaatii tarkistuksen (kaikki) : siirrossa tarkistettaviksi merkityt Sivuston asetukset Etusivu : yläosa, lohkot ja hakukoneteksti Navigaatio : valikko ja alatunniste Ohjaukset ja lyhytosoitteet : Lyhytosoitteet ja ohjaukset ja Muuttuneet osoitteet (automaattiset) Varmuuskopiot : viikoittaiset varmuuskopiot ja poistettujen palautus Tarkistettavat : siirrossa tarkistettaviksi merkityt tyypeittäin: Uutiset, Ravintolat, Tilastot, Stadionit, Klubin toiminta, Pelaajat, Lehtileikkeet, Arvokisat, Sivut, Tapahtumat ja Galleria-albumit. Uutiset : kaikki uutiset ja vanhan blogin kirjoitukset, uusin ensin. Uutiskategoriat : uutisten aiheet ja uutislistan suodatin. Kommentit ja veikkaukset : Uusimmat , Uutisittain ja Piilotetut . Ottelut : käsin lisätyt ottelut otteluohjelmaan. Tapahtumat : klubin tapahtumat. Galleria-albumit : kuva-albumit. Sivut : omat tekstisivut, esimerkiksi säännöt ja tietosuojaseloste. Klubi : sama rakenne kuin sivuston Klubi-osiossa. Esittely : Klubi-sivun teksti ja kuva Toiminta : Toiminta-sivun otsikko ja johdanto ja Toimintamuodot Hallitus : Hallitus-sivun otsikko ja johdanto , Nykyinen hallitus ja Entiset jäsenet Palloveikkaus : Palloveikkaus-sivu ja Veikkausten alasivut Yhteystiedot : Osoite, sähköposti ja some ja Yhteystiedot-sivun otsikko ja johdanto Ravintolat Kaikki ravintolat Ravintolat: odottavat toista arvioijaa : ravintolat, joilla on alle kahden klubilaisen arvosanat Arvostelut: odottavat hyväksyntää Arvostelut: kaikki Klubilaisten arvosanat : Ravintoloittain ja Kaikki (uusin ensin) Klubilaiset Kaupungit Jalkapalloarkisto Tilastot : Klubin omat tilastot , Huuhkajat , Karsinnat , Arvokisat , Muut arkiston taulukot ja Kaikki tilastot Arvokisat Pelaajat Lehtileikkeet : Litmasen lehtijutut Stadionit Osioiden sivut : listasivujen otsikot, johdannot ja hakukonetekstit. Uutiset ja tapahtumat : Uutiset, Uutisarkisto, Uutisten tunnisteet, Tapahtumat, Galleria ja Ottelut Ravintolat : Ravintola-arviot ja Odottavat toista arvioijaa Jalkapalloarkisto : arkiston etusivu ja sen 16 osiota, esimerkiksi Huuhkajat, Suomen mestarit ja Stadionit Mistä löydän… Haluan muuttaa Mene kohtaan Etusivun pääjutun tai taustakuvan Sivuston asetukset → Etusivu Valikon tai alatunnisteen Sivuston asetukset → Navigaatio Klubin sähköpostin tai osoitteen Klubi → Yhteystiedot → Osoite, sähköposti ja some Hallituksen jäsenet Klubi → Hallitus → Nykyinen hallitus Tapahtumat-sivun johdannon Osioiden sivut → Uutiset ja tapahtumat Palloveikkauksen taulukot Jalkapalloarkisto → Tilastot → Klubin omat tilastot Klubilaisen pisteet ravintolalle Ravintolat → Klubilaisten arvosanat → Ravintoloittain Lyhytosoitteen esitteeseen Sivuston asetukset → Ohjaukset ja lyhytosoitteet → Lyhytosoitteet ja ohjaukset Vahingossa poistetun Sivuston asetukset → Varmuuskopiot",
          "otsikot": [
            {
              "id": "valikon-kartta--ylapalkki",
              "teksti": "Yläpalkki",
              "taso": 2
            },
            {
              "id": "valikon-kartta--sisalto-vasen-valikko",
              "teksti": "Sisältö: vasen valikko",
              "taso": 2
            },
            {
              "id": "valikon-kartta--mista-loydan",
              "teksti": "Mistä löydän…",
              "taso": 2
            }
          ]
        },
        {
          "id": "tilamerkit",
          "otsikko": "Tilamerkit ja listojen merkinnät",
          "osio": "hakuteos",
          "avainsanat": [
            "merkki",
            "tilamerkki",
            "ajastettu",
            "tarkistettava",
            "odottaa toista arvioijaa",
            "piilotettu",
            "kolmio",
            "alapalkki",
            "kunnossa",
            "huomio",
            "vaatii toimia"
          ],
          "tyypit": [
            "uutinen",
            "ravintola",
            "kommentti"
          ],
          "kesto": null,
          "paivitetty": "2026-10-08",
          "html": "<p>Merkit kertovat tilan, jota et muuten näkisi. Ne eivät vaadi aina toimia.</p>\n<h2 id=\"tilamerkit--merkit-lomakkeen-alapalkissa\">Merkit lomakkeen alapalkissa</h2>\n<p>Merkit ovat lomakkeen alareunassa, <strong>Julkaise</strong>-painikkeen vasemmalla puolella. Kun viet\nosoittimen merkin päälle, näet selityksen.</p>\n<p><button type=\"button\" class=\"ohje-kuvanappi\" data-ohje-kuva=\"/studio-ohje/tilamerkit-01-alapalkki.webp\" aria-label=\"Suurenna kuva: Uutisen alapalkki. 1: merkki Ajastettu. 2: Julkaise-painike oikeassa alakulmassa.\"><img class=\"ohje-kuva\" src=\"/studio-ohje/tilamerkit-01-alapalkki.webp\" alt=\"Uutisen alapalkki. 1: merkki Ajastettu. 2: Julkaise-painike oikeassa alakulmassa.\" width=\"848\" height=\"88\" loading=\"lazy\" decoding=\"async\"></button></p>\n<table>\n<thead>\n<tr>\n<th>Merkki</th>\n<th>Missä</th>\n<th>Mitä se tarkoittaa</th>\n<th>Mitä teet</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td><strong>Ajastettu</strong></td>\n<td>Uutinen</td>\n<td>Julkaisuaika on tulevaisuudessa. Uutinen tulee sivustolle itsestään.</td>\n<td>Ei mitään. Ohje: <a href=\"/studio/ohjeet/uutinen-ei-nay-ajastettu\" data-ohje-kortti=\"uutinen-ei-nay-ajastettu\">Uutinen ei näy, ja alapalkissa lukee Ajastettu</a>.</td>\n</tr>\n<tr>\n<td><strong>Tarkistettava</strong></td>\n<td>Monet tyypit</td>\n<td>Siirrossa tieto merkittiin tarkistettavaksi.</td>\n<td>Lue kohta <strong>Mitä tarkistaa</strong>. Korjaa tai totea oikeaksi, käännä kytkin <strong>Vaatii tarkistuksen</strong> pois päältä ja julkaise. Ohje: <a href=\"/studio/ohjeet/tarkistettavat\" data-ohje-kortti=\"tarkistettavat\">Käy läpi tarkistettavat</a>.</td>\n</tr>\n<tr>\n<td><strong>Odottaa toista arvioijaa</strong></td>\n<td>Ravintola</td>\n<td>Ravintola ei näy sivustolla, koska sillä on alle kahden klubilaisen arvosanat.</td>\n<td>Ohje: <a href=\"/studio/ohjeet/ravintola-ei-nay\" data-ohje-kortti=\"ravintola-ei-nay\">Ravintola ei näy</a>.</td>\n</tr>\n<tr>\n<td><strong>Piilotettu</strong></td>\n<td>Kommentti</td>\n<td>Kommentti ei näy sivulla.</td>\n<td>Palautus: paina alareunasta <strong>Näytä sivulla</strong>.</td>\n</tr>\n</tbody>\n</table>\n<p>Lisäksi alapalkissa näkyy Studion oma tieto siitä, onko muutos vielä luonnos vai julkaistu.</p>\n<h2 id=\"tilamerkit--merkinnat-listoissa\">Merkinnät listoissa</h2>\n<table>\n<thead>\n<tr>\n<th>Merkintä</th>\n<th>Missä</th>\n<th>Mitä se tarkoittaa</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>⚠ nimen edessä</td>\n<td>Uutiset, ravintolat, taulukot ym.</td>\n<td>Sama kuin merkki <strong>Tarkistettava</strong>.</td>\n</tr>\n<tr>\n<td>Kieltomerkki nimen edessä</td>\n<td>Kommentit</td>\n<td>Kommentti on piilotettu sivulta.</td>\n</tr>\n<tr>\n<td>Ajastettu ja aika nimen alla</td>\n<td>Uutiset</td>\n<td>Uutinen tulee sivustolle tuolloin.</td>\n</tr>\n<tr>\n<td>UUSI: ja ravintolan nimi</td>\n<td>Arvostelut</td>\n<td>Kävijä ehdottaa ravintolaa, jota ei vielä ole listassa.</td>\n</tr>\n<tr>\n<td>Ei klubilainen</td>\n<td>Arvostelut</td>\n<td>Arvostelija ei valinnut nimeään klubilaisten joukosta.</td>\n</tr>\n<tr>\n<td>Piilotettu</td>\n<td>Etusivun lohkot</td>\n<td>Lohkossa on kytkin <strong>Piilota lohko sivulta</strong> päällä.</td>\n</tr>\n<tr>\n<td>Osion sivu ja osoite</td>\n<td>Sivut</td>\n<td>Sivu on osion sivu, jota ei voi poistaa.</td>\n</tr>\n<tr>\n<td>Entinen ja rooli</td>\n<td>Hallitus</td>\n<td>Jäsen ei enää ole hallituksessa.</td>\n</tr>\n</tbody>\n</table>\n<h2 id=\"tilamerkit--aloituksen-tilat\">Aloituksen tilat</h2>\n<p>Aloituksen kohdassa <strong>Sivuston tila</strong> jokaisella rivillä on tila sanoin ja värinä:</p>\n<table>\n<thead>\n<tr>\n<th>Tila</th>\n<th>Väri</th>\n<th>Mitä se tarkoittaa</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td><strong>Kunnossa</strong></td>\n<td>Vihreä</td>\n<td>Kaikki toimii.</td>\n</tr>\n<tr>\n<td><strong>Huomio</strong></td>\n<td>Keltainen</td>\n<td>Jotain kannattaa tarkistaa. Sisältö on tallessa.</td>\n</tr>\n<tr>\n<td><strong>Vaatii toimia</strong></td>\n<td>Punainen</td>\n<td>Kerro tukihenkilölle. Sisältö on tallessa.</td>\n</tr>\n<tr>\n<td><strong>Ei vielä tietoa</strong></td>\n<td>Harmaa</td>\n<td>Työ ei ole vielä ajanut kertaakaan. Ei vaadi toimia.</td>\n</tr>\n<tr>\n<td><strong>Arvio</strong></td>\n<td>Harmaa</td>\n<td>Kiintiön arvio on alle rajan. Ei vaadi toimia.</td>\n</tr>\n</tbody>\n</table>\n<p>Yhteenveto ylimpänä: <strong>Kaikki kunnossa</strong>, <strong>Huomioitavaa</strong>, <strong>Vaatii toimia</strong> tai\n<strong>Tilaa ei vielä tiedetä</strong>. Ohje: <a href=\"/studio/ohjeet/aloituksessa-punainen-rivi\" data-ohje-kortti=\"aloituksessa-punainen-rivi\">Aloituksessa lukee Vaatii toimia tai Huomioitavaa</a>.</p>\n",
          "teksti": "Merkit kertovat tilan, jota et muuten näkisi. Ne eivät vaadi aina toimia. Merkit lomakkeen alapalkissa Merkit ovat lomakkeen alareunassa, Julkaise -painikkeen vasemmalla puolella. Kun viet osoittimen merkin päälle, näet selityksen. Merkki Missä Mitä se tarkoittaa Mitä teet Ajastettu Uutinen Julkaisuaika on tulevaisuudessa. Uutinen tulee sivustolle itsestään. Ei mitään. Ohje: Uutinen ei näy, ja alapalkissa lukee Ajastettu . Tarkistettava Monet tyypit Siirrossa tieto merkittiin tarkistettavaksi. Lue kohta Mitä tarkistaa . Korjaa tai totea oikeaksi, käännä kytkin Vaatii tarkistuksen pois päältä ja julkaise. Ohje: Käy läpi tarkistettavat . Odottaa toista arvioijaa Ravintola Ravintola ei näy sivustolla, koska sillä on alle kahden klubilaisen arvosanat. Ohje: Ravintola ei näy . Piilotettu Kommentti Kommentti ei näy sivulla. Palautus: paina alareunasta Näytä sivulla . Lisäksi alapalkissa näkyy Studion oma tieto siitä, onko muutos vielä luonnos vai julkaistu. Merkinnät listoissa Merkintä Missä Mitä se tarkoittaa ⚠ nimen edessä Uutiset, ravintolat, taulukot ym. Sama kuin merkki Tarkistettava . Kieltomerkki nimen edessä Kommentit Kommentti on piilotettu sivulta. Ajastettu ja aika nimen alla Uutiset Uutinen tulee sivustolle tuolloin. UUSI: ja ravintolan nimi Arvostelut Kävijä ehdottaa ravintolaa, jota ei vielä ole listassa. Ei klubilainen Arvostelut Arvostelija ei valinnut nimeään klubilaisten joukosta. Piilotettu Etusivun lohkot Lohkossa on kytkin Piilota lohko sivulta päällä. Osion sivu ja osoite Sivut Sivu on osion sivu, jota ei voi poistaa. Entinen ja rooli Hallitus Jäsen ei enää ole hallituksessa. Aloituksen tilat Aloituksen kohdassa Sivuston tila jokaisella rivillä on tila sanoin ja värinä: Tila Väri Mitä se tarkoittaa Kunnossa Vihreä Kaikki toimii. Huomio Keltainen Jotain kannattaa tarkistaa. Sisältö on tallessa. Vaatii toimia Punainen Kerro tukihenkilölle. Sisältö on tallessa. Ei vielä tietoa Harmaa Työ ei ole vielä ajanut kertaakaan. Ei vaadi toimia. Arvio Harmaa Kiintiön arvio on alle rajan. Ei vaadi toimia. Yhteenveto ylimpänä: Kaikki kunnossa , Huomioitavaa , Vaatii toimia tai Tilaa ei vielä tiedetä . Ohje: Aloituksessa lukee Vaatii toimia tai Huomioitavaa .",
          "otsikot": [
            {
              "id": "tilamerkit--merkit-lomakkeen-alapalkissa",
              "teksti": "Merkit lomakkeen alapalkissa",
              "taso": 2
            },
            {
              "id": "tilamerkit--merkinnat-listoissa",
              "teksti": "Merkinnät listoissa",
              "taso": 2
            },
            {
              "id": "tilamerkit--aloituksen-tilat",
              "teksti": "Aloituksen tilat",
              "taso": 2
            }
          ]
        },
        {
          "id": "mika-teksti-nakyy-missa",
          "otsikko": "Mikä teksti näkyy missä",
          "osio": "hakuteos",
          "avainsanat": [
            "tiivistelmä",
            "lyhenne",
            "ingressi",
            "johdanto",
            "hakukoneet",
            "Google",
            "kuvaus hakutuloksissa",
            "uutislista",
            "etusivun kortti",
            "somejako",
            "jakokuva"
          ],
          "tyypit": [
            "uutinen",
            "sivu"
          ],
          "kesto": null,
          "paivitetty": "2026-10-08",
          "html": "<p>Uutisessa ja sivulla on useita lyhyitä tekstejä. Tämä taulukko kertoo, missä kukin näkyy.</p>\n<h2 id=\"mika-teksti-nakyy-missa--uutinen\">Uutinen</h2>\n<table>\n<thead>\n<tr>\n<th>Paikka sivustolla</th>\n<th>Mikä teksti näkyy</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>Jutun alussa isommalla</td>\n<td><strong>Tiivistelmä jutun alussa (valinnainen)</strong>. Jos se on tyhjä, <strong>Lyhenne (uutislista ja etusivu)</strong>.</td>\n</tr>\n<tr>\n<td>Uutislistassa ja etusivun kortissa</td>\n<td><strong>Lyhenne (uutislista ja etusivu)</strong>. Jos se on tyhjä, Tiivistelmä. Jos molemmat ovat tyhjiä, tekstin alku.</td>\n</tr>\n<tr>\n<td>Googlen hakutuloksessa ja somejaossa</td>\n<td><strong>Kuvaus hakutuloksissa (valinnainen)</strong> välilehdellä <strong>Hakukoneet ja jako</strong>. Jos se on tyhjä, Tiivistelmä, sitten Lyhenne ja lopuksi tekstin alku.</td>\n</tr>\n<tr>\n<td>Googlen hakutuloksen otsikkona</td>\n<td><strong>Otsikko hakutuloksissa (valinnainen)</strong>. Jos se on tyhjä, <strong>Otsikko</strong>.</td>\n</tr>\n<tr>\n<td>Kuvana listassa ja jaossa</td>\n<td><strong>Kansikuva</strong>. Jos se on tyhjä, tekstin ensimmäinen iso kuva.</td>\n</tr>\n</tbody>\n</table>\n<div class=\"markdown-alert markdown-alert-tip\">\n<p class=\"markdown-alert-title\">Vinkki</p>\n<p>Uudessa uutisessa riittää yleensä <strong>Lyhenne (uutislista ja etusivu)</strong>. Se näkyy silloin\nsekä listassa että jutun alussa.</p>\n</div>\n<h2 id=\"mika-teksti-nakyy-missa--sivu-ja-osion-sivu\">Sivu ja osion sivu</h2>\n<table>\n<thead>\n<tr>\n<th>Paikka sivustolla</th>\n<th>Mikä teksti näkyy</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>Sivun alussa isommalla</td>\n<td><strong>Tiivistelmä sivun alussa</strong>. Jos se on tyhjä, <strong>Ingressi (vanha kenttä)</strong>.</td>\n</tr>\n<tr>\n<td>Googlen hakutuloksessa</td>\n<td><strong>Kuvaus hakutuloksissa (valinnainen)</strong>. Jos se on tyhjä, Tiivistelmä.</td>\n</tr>\n<tr>\n<td>Jalkapalloarkiston etusivun kortissa</td>\n<td><strong>Teksti arkiston etusivun kortissa</strong> (vain arkiston osioiden sivuilla).</td>\n</tr>\n</tbody>\n</table>\n<p>Kenttä <strong>Ingressi (vanha kenttä)</strong> näkyy vain sivuilla, joilla se on jo täytetty. Kirjoita\njohdanto aina kenttään <strong>Tiivistelmä sivun alussa</strong>.</p>\n<h2 id=\"mika-teksti-nakyy-missa--muut\">Muut</h2>\n<table>\n<thead>\n<tr>\n<th>Mitä</th>\n<th>Kenttä</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>Etusivun teksti Googlessa ja somejaossa</td>\n<td><strong>Sivuston asetukset → Etusivu</strong>, välilehti <strong>Hakukoneet ja jako</strong>, kenttä <strong>Etusivun kuvaus hakukoneille</strong>. Ei näy itse sivulla.</td>\n</tr>\n<tr>\n<td>Uutiskategorian teksti Googlessa</td>\n<td><strong>Uutiskategoriat</strong> → kategoria → <strong>Kuvaus hakukoneille (valinnainen)</strong>.</td>\n</tr>\n<tr>\n<td>Toimintamuodon johdanto</td>\n<td><strong>Tiivistelmä</strong></td>\n</tr>\n</tbody>\n</table>\n<p>Sivusto tekee osan itse: uutisen ensimmäinen kappale näkyy isommalla, jos se on lyhyt.\nPidemmissä jutuissa näkyy lukuaika.</p>\n",
          "teksti": "Uutisessa ja sivulla on useita lyhyitä tekstejä. Tämä taulukko kertoo, missä kukin näkyy. Uutinen Paikka sivustolla Mikä teksti näkyy Jutun alussa isommalla Tiivistelmä jutun alussa (valinnainen) . Jos se on tyhjä, Lyhenne (uutislista ja etusivu) . Uutislistassa ja etusivun kortissa Lyhenne (uutislista ja etusivu) . Jos se on tyhjä, Tiivistelmä. Jos molemmat ovat tyhjiä, tekstin alku. Googlen hakutuloksessa ja somejaossa Kuvaus hakutuloksissa (valinnainen) välilehdellä Hakukoneet ja jako . Jos se on tyhjä, Tiivistelmä, sitten Lyhenne ja lopuksi tekstin alku. Googlen hakutuloksen otsikkona Otsikko hakutuloksissa (valinnainen) . Jos se on tyhjä, Otsikko . Kuvana listassa ja jaossa Kansikuva . Jos se on tyhjä, tekstin ensimmäinen iso kuva. Uudessa uutisessa riittää yleensä Lyhenne (uutislista ja etusivu) . Se näkyy silloin sekä listassa että jutun alussa. Sivu ja osion sivu Paikka sivustolla Mikä teksti näkyy Sivun alussa isommalla Tiivistelmä sivun alussa . Jos se on tyhjä, Ingressi (vanha kenttä) . Googlen hakutuloksessa Kuvaus hakutuloksissa (valinnainen) . Jos se on tyhjä, Tiivistelmä. Jalkapalloarkiston etusivun kortissa Teksti arkiston etusivun kortissa (vain arkiston osioiden sivuilla). Kenttä Ingressi (vanha kenttä) näkyy vain sivuilla, joilla se on jo täytetty. Kirjoita johdanto aina kenttään Tiivistelmä sivun alussa . Muut Mitä Kenttä Etusivun teksti Googlessa ja somejaossa Sivuston asetukset → Etusivu , välilehti Hakukoneet ja jako , kenttä Etusivun kuvaus hakukoneille . Ei näy itse sivulla. Uutiskategorian teksti Googlessa Uutiskategoriat → kategoria → Kuvaus hakukoneille (valinnainen) . Toimintamuodon johdanto Tiivistelmä Sivusto tekee osan itse: uutisen ensimmäinen kappale näkyy isommalla, jos se on lyhyt. Pidemmissä jutuissa näkyy lukuaika.",
          "otsikot": [
            {
              "id": "mika-teksti-nakyy-missa--uutinen",
              "teksti": "Uutinen",
              "taso": 2
            },
            {
              "id": "mika-teksti-nakyy-missa--sivu-ja-osion-sivu",
              "teksti": "Sivu ja osion sivu",
              "taso": 2
            },
            {
              "id": "mika-teksti-nakyy-missa--muut",
              "teksti": "Muut",
              "taso": 2
            }
          ]
        },
        {
          "id": "sanasto",
          "otsikko": "Sanasto",
          "osio": "hakuteos",
          "avainsanat": [
            "sanasto",
            "mitä tarkoittaa",
            "käsite",
            "luonnos",
            "julkaisu",
            "versiohistoria",
            "osoite",
            "ohjaus",
            "lyhytosoite",
            "tunniste",
            "kategoria",
            "lohko",
            "pohja"
          ],
          "tyypit": [],
          "kesto": null,
          "paivitetty": "2026-10-08",
          "html": "<p>Oppaan sanat aakkosjärjestyksessä.</p>\n<table>\n<thead>\n<tr>\n<th>Sana</th>\n<th>Mitä se tarkoittaa</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>Aiemmat osoitteet</td>\n<td>Sivun vanhat osoitteet. Ne ohjautuvat uuteen osoitteeseen itsestään. Studio täyttää kentän <strong>Aiemmat osoitteet</strong> itse.</td>\n</tr>\n<tr>\n<td>Ajastus</td>\n<td>Uutinen tulee sivustolle myöhemmin. Tehdään kentällä <strong>Julkaisuaika</strong>.</td>\n</tr>\n<tr>\n<td>Alatunniste</td>\n<td>Jokaisen sivun alareuna. Se seuraa valikkoa ja näyttää yhteystiedot.</td>\n</tr>\n<tr>\n<td>Alavalikko</td>\n<td>Valikon kohdan alla avautuva lista.</td>\n</tr>\n<tr>\n<td>Aloitus</td>\n<td>Studion ensimmäinen näkymä: sivuston tila ja odottavat tehtävät.</td>\n</tr>\n<tr>\n<td>Dokumentti, asiakirja</td>\n<td>Studion sana yhdelle sisällölle, esimerkiksi yhdelle uutiselle, sivulle tai ravintolalle.</td>\n</tr>\n<tr>\n<td>Esikatselu</td>\n<td>Näet sivun luonnoksineen ennen julkaisua. Kävijät eivät näe luonnoksia.</td>\n</tr>\n<tr>\n<td>Hylkää muutokset</td>\n<td>Peruu kaikki julkaisemattomat muutokset. Sivustolla näkyvä versio jää ennalleen.</td>\n</tr>\n<tr>\n<td>Julkaisu</td>\n<td>Muutos menee sivustolle, kun painat <strong>Julkaise</strong>.</td>\n</tr>\n<tr>\n<td>Kahva</td>\n<td>Kuusi pistettä (⋮⋮) rivin reunassa. Siitä vetämällä muutat järjestystä.</td>\n</tr>\n<tr>\n<td>Kahden klubilaisen sääntö</td>\n<td>Ravintola näkyy sivustolla vasta, kun kaksi klubilaista on arvioinut sen.</td>\n</tr>\n<tr>\n<td>Kategoria</td>\n<td>Uutisen aihe, esimerkiksi Tapahtumat. Kävijä voi suodattaa uutislistaa kategorian mukaan.</td>\n</tr>\n<tr>\n<td>Klubilainen</td>\n<td>Klubin jäsen, joka antaa ravintoloille arvosanoja.</td>\n</tr>\n<tr>\n<td>Kopioi pohjaksi</td>\n<td>Tekee kopion ilman osoitetta. Hyvä, kun uusi on samanlainen kuin vanha.</td>\n</tr>\n<tr>\n<td>Kytkin</td>\n<td>Pieni liukukytkin kentän vieressä, esimerkiksi <strong>Nykyinen jäsen</strong>. Tummana se on päällä, vaaleana pois päältä. Napsauta sitä.</td>\n</tr>\n<tr>\n<td>Lisäosa</td>\n<td>Tekstin sekaan lisättävä osa, esimerkiksi kuva, liite, painike tai kartta.</td>\n</tr>\n<tr>\n<td>Lohko</td>\n<td>Etusivun osa, esimerkiksi jutut tai otteluohjelma.</td>\n</tr>\n<tr>\n<td>Lukittu sivu</td>\n<td>Sivu, jota sivusto käyttää kiinteällä osoitteella. Sitä ei voi poistaa eikä sen osoitetta muuttaa, mutta tekstiä voi muokata.</td>\n</tr>\n<tr>\n<td>Luonnos</td>\n<td>Muutos, jota ei ole julkaistu. Tallentuu itsestään. Vain Studion käyttäjät näkevät sen.</td>\n</tr>\n<tr>\n<td>Lyhytosoite</td>\n<td>Lyhyt osoite esitteeseen, esimerkiksi /jasenmaksu. Se vie valitsemaasi kohteeseen.</td>\n</tr>\n<tr>\n<td>Ohjaus</td>\n<td>Sääntö, joka vie osoitteesta toiseen. Lyhytosoite on ohjaus.</td>\n</tr>\n<tr>\n<td>Osion sivu</td>\n<td>Listasivu, jonka sisältö tulee itsestään, esimerkiksi Uutiset tai Tapahtumat. Otsikko ja johdanto muokataan kohdassa <strong>Osioiden sivut</strong>.</td>\n</tr>\n<tr>\n<td>Osoite sivustolla</td>\n<td>Sivun osoitteen loppuosa, esimerkiksi klubi/historia.</td>\n</tr>\n<tr>\n<td>Pohja</td>\n<td>Valmis uutinen, jossa teksti on valmiina, esimerkiksi <strong>Vuosikokouskutsu</strong>.</td>\n</tr>\n<tr>\n<td>Tarkistettava</td>\n<td>Siirrossa vanhalta sivustolta epävarmaksi merkitty tieto.</td>\n</tr>\n<tr>\n<td>Tilamerkki</td>\n<td>Merkki lomakkeen alapalkissa, esimerkiksi <strong>Ajastettu</strong>. Ohje: <a href=\"/studio/ohjeet/tilamerkit\" data-ohje-kortti=\"tilamerkit\">Tilamerkit</a>.</td>\n</tr>\n<tr>\n<td>Tukihenkilö</td>\n<td>Henkilö, joka auttaa, kun Studio ei riitä. Ohje: <a href=\"/studio/ohjeet/tukihenkilo\" data-ohje-kortti=\"tukihenkilo\">Mihin tarvitset tukihenkilöä</a>.</td>\n</tr>\n<tr>\n<td>Tunniste</td>\n<td>Uutisen aihe, esimerkiksi joukkue, paikka tai henkilö. Jokaisella tunnisteella on oma sivunsa.</td>\n</tr>\n<tr>\n<td>Vaihtoehtoinen teksti</td>\n<td>Kuvan kuvaus näkövammaiselle. Ruudunlukija lukee sen ääneen. Pakollinen.</td>\n</tr>\n<tr>\n<td>Varmuuskopio</td>\n<td>Sivusto tallentaa kaiken julkaistun joka maanantaiyö. Kopiosta voi palauttaa vanhan version tai poistetun.</td>\n</tr>\n<tr>\n<td>Versiohistoria</td>\n<td>Studion lista sisällön aiemmista versioista. Sieltä palautat tuoreen virheen.</td>\n</tr>\n<tr>\n<td>Välilehti</td>\n<td>Lomakkeen yläreunan osa, esimerkiksi <strong>Hakukoneet ja jako</strong>. Kentät on jaettu välilehdille.</td>\n</tr>\n</tbody>\n</table>\n",
          "teksti": "Oppaan sanat aakkosjärjestyksessä. Sana Mitä se tarkoittaa Aiemmat osoitteet Sivun vanhat osoitteet. Ne ohjautuvat uuteen osoitteeseen itsestään. Studio täyttää kentän Aiemmat osoitteet itse. Ajastus Uutinen tulee sivustolle myöhemmin. Tehdään kentällä Julkaisuaika . Alatunniste Jokaisen sivun alareuna. Se seuraa valikkoa ja näyttää yhteystiedot. Alavalikko Valikon kohdan alla avautuva lista. Aloitus Studion ensimmäinen näkymä: sivuston tila ja odottavat tehtävät. Dokumentti, asiakirja Studion sana yhdelle sisällölle, esimerkiksi yhdelle uutiselle, sivulle tai ravintolalle. Esikatselu Näet sivun luonnoksineen ennen julkaisua. Kävijät eivät näe luonnoksia. Hylkää muutokset Peruu kaikki julkaisemattomat muutokset. Sivustolla näkyvä versio jää ennalleen. Julkaisu Muutos menee sivustolle, kun painat Julkaise . Kahva Kuusi pistettä (⋮⋮) rivin reunassa. Siitä vetämällä muutat järjestystä. Kahden klubilaisen sääntö Ravintola näkyy sivustolla vasta, kun kaksi klubilaista on arvioinut sen. Kategoria Uutisen aihe, esimerkiksi Tapahtumat. Kävijä voi suodattaa uutislistaa kategorian mukaan. Klubilainen Klubin jäsen, joka antaa ravintoloille arvosanoja. Kopioi pohjaksi Tekee kopion ilman osoitetta. Hyvä, kun uusi on samanlainen kuin vanha. Kytkin Pieni liukukytkin kentän vieressä, esimerkiksi Nykyinen jäsen . Tummana se on päällä, vaaleana pois päältä. Napsauta sitä. Lisäosa Tekstin sekaan lisättävä osa, esimerkiksi kuva, liite, painike tai kartta. Lohko Etusivun osa, esimerkiksi jutut tai otteluohjelma. Lukittu sivu Sivu, jota sivusto käyttää kiinteällä osoitteella. Sitä ei voi poistaa eikä sen osoitetta muuttaa, mutta tekstiä voi muokata. Luonnos Muutos, jota ei ole julkaistu. Tallentuu itsestään. Vain Studion käyttäjät näkevät sen. Lyhytosoite Lyhyt osoite esitteeseen, esimerkiksi /jasenmaksu. Se vie valitsemaasi kohteeseen. Ohjaus Sääntö, joka vie osoitteesta toiseen. Lyhytosoite on ohjaus. Osion sivu Listasivu, jonka sisältö tulee itsestään, esimerkiksi Uutiset tai Tapahtumat. Otsikko ja johdanto muokataan kohdassa Osioiden sivut . Osoite sivustolla Sivun osoitteen loppuosa, esimerkiksi klubi/historia. Pohja Valmis uutinen, jossa teksti on valmiina, esimerkiksi Vuosikokouskutsu . Tarkistettava Siirrossa vanhalta sivustolta epävarmaksi merkitty tieto. Tilamerkki Merkki lomakkeen alapalkissa, esimerkiksi Ajastettu . Ohje: Tilamerkit . Tukihenkilö Henkilö, joka auttaa, kun Studio ei riitä. Ohje: Mihin tarvitset tukihenkilöä . Tunniste Uutisen aihe, esimerkiksi joukkue, paikka tai henkilö. Jokaisella tunnisteella on oma sivunsa. Vaihtoehtoinen teksti Kuvan kuvaus näkövammaiselle. Ruudunlukija lukee sen ääneen. Pakollinen. Varmuuskopio Sivusto tallentaa kaiken julkaistun joka maanantaiyö. Kopiosta voi palauttaa vanhan version tai poistetun. Versiohistoria Studion lista sisällön aiemmista versioista. Sieltä palautat tuoreen virheen. Välilehti Lomakkeen yläreunan osa, esimerkiksi Hakukoneet ja jako . Kentät on jaettu välilehdille.",
          "otsikot": []
        },
        {
          "id": "tukihenkilo",
          "otsikko": "Mihin tarvitset tukihenkilöä",
          "osio": "hakuteos",
          "avainsanat": [
            "tukihenkilö",
            "apu",
            "tuki",
            "yhteys",
            "en osaa",
            "logo",
            "sarja",
            "Ykkösliiga",
            "tiedote",
            "banneri",
            "Sanityn taso",
            "maksu",
            "26.10.",
            "domain",
            "kuvakaappaus"
          ],
          "tyypit": [],
          "kesto": null,
          "paivitetty": "2026-10-08",
          "html": "<p>Lähes kaiken sisällön voit päivittää itse. Tällä sivulla ovat asiat, joihin tarvitset\ntukihenkilöä, ja ohje siitä, miten kerrot ongelmasta. Tukihenkilön yhteystiedot on annettu\nsinulle erikseen.</p>\n<h2 id=\"tukihenkilo--nain-kerrot-ongelmasta\">Näin kerrot ongelmasta</h2>\n<ol>\n<li>Ota kuvakaappaus koko ruudusta. Windowsissa paina yhtä aikaa Windows-näppäintä, vaihtonäppäintä (Shift) ja S-kirjainta.</li>\n<li>Kirjoita ylös virheen tai Aloituksen rivin otsikko ja teksti sanatarkasti.</li>\n<li>Kerro, mitä olit tekemässä ja mihin aikaan.</li>\n<li>Kerro sivun osoite, jos vika näkyy sivustolla.</li>\n</ol>\n<p>Sisältösi on tallessa sillä välin. Luonnos säilyy, vaikka suljet selaimen.</p>\n<h2 id=\"tukihenkilo--mita-et-voi-tehda-itse\">Mitä et voi tehdä itse</h2>\n<table>\n<thead>\n<tr>\n<th>Asia</th>\n<th>Miksi</th>\n<th>Mitä voit tehdä sillä välin</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>Logon vaihto</td>\n<td>Logo on osa sivuston ulkoasua, ei Studiota.</td>\n<td>Ei mitään.</td>\n</tr>\n<tr>\n<td>Seuran sarjan vaihto otteluohjelmassa, esimerkiksi FC Lahti Ykkösliigaan</td>\n<td>Ottelut haetaan itsestään vain Veikkausliigasta.</td>\n<td>Lisää ottelut käsin: <a href=\"/studio/ohjeet/ottelun-lisaaminen\" data-ohje-kortti=\"ottelun-lisaaminen\">Lisää ottelu</a>.</td>\n</tr>\n<tr>\n<td>Uusi jalkapalloarkiston osio tai tekstisivu arkiston alle</td>\n<td>Arkiston rakenne on sivuston koodissa.</td>\n<td>Tee taulukko kategorialla Muu tilasto: se saa oman sivunsa arkistossa.</td>\n</tr>\n<tr>\n<td>Uusi pelaajaosio Litmasen tapaan</td>\n<td>Lehtileikkeet toimivat vain Litmasella.</td>\n<td>Pelaajan sivu onnistuu, mutta ilman lehtileikkeitä.</td>\n</tr>\n<tr>\n<td>Tiedote jokaisen sivun yläreunaan</td>\n<td>Sivustolla ei ole tiedotebanneria.</td>\n<td>Nosta uutinen etusivun pääjutuksi: <a href=\"/studio/ohjeet/etusivu-ylaosa\" data-ohje-kortti=\"etusivu-ylaosa\">Muuta etusivun yläosaa</a>.</td>\n</tr>\n<tr>\n<td>Lukitun sivun osoitteen muutos tai poisto</td>\n<td>Sivusto hakee lukitun sivun aina samasta osoitteesta.</td>\n<td>Muokkaa sivun tekstiä vapaasti.</td>\n</tr>\n<tr>\n<td>Vanhan sivuston osoitteen ohjauksen muutos</td>\n<td>Vanhojen osoitteiden ohjaukset ovat kiinteitä.</td>\n<td>Valitse lyhytosoitteelle toinen osoite.</td>\n</tr>\n<tr>\n<td>Tunnisteen nimen muutos kaikkiin uutisiin kerralla</td>\n<td>Muutos koskee satoja uutisia.</td>\n<td>Muuta tunniste yksittäisissä uutisissa.</td>\n</tr>\n<tr>\n<td>Facebook- tai Instagram-julkaisun upotus</td>\n<td>Vain Google Maps, Google Forms ja Vimeo ovat sallittuja.</td>\n<td>Lisää tekstiin linkki tai painike.</td>\n</tr>\n<tr>\n<td>Huuhkajat-osioiden, eurocupien ja mestaruusmaiden alasivujen johdannot</td>\n<td>Tekstit ovat sivuston koodissa.</td>\n<td>Ei mitään.</td>\n</tr>\n<tr>\n<td>Uusi Klubi-osion alasivu Klubi-sivun välilehtiin</td>\n<td>Välilehdet ovat sivuston koodissa.</td>\n<td>Lisää sivu valikkoon: <a href=\"/studio/ohjeet/valikko-ja-alatunniste\" data-ohje-kortti=\"valikko-ja-alatunniste\">Muokkaa valikkoa ja alatunnistetta</a>.</td>\n</tr>\n<tr>\n<td>Kahden klubilaisen säännön muutos</td>\n<td>Sääntö on sivuston koodissa.</td>\n<td>Ei mitään.</td>\n</tr>\n<tr>\n<td>Aloituksen punaiset rivit: varmuuskopio, yöllinen huolto, otteluhaku, kiintiö</td>\n<td>Ajastetut työt ovat sivuston palvelimella.</td>\n<td>Jatka työtä normaalisti: <a href=\"/studio/ohjeet/aloituksessa-punainen-rivi\" data-ohje-kortti=\"aloituksessa-punainen-rivi\">Aloituksessa lukee Vaatii toimia</a>.</td>\n</tr>\n<tr>\n<td>Koko sivuston palautus ja kuvien varmuuskopio</td>\n<td>Studion varmuuskopiossa ovat tekstit ja tiedot, eivät kuvat.</td>\n<td>Yksittäisen sivun palautat itse: <a href=\"/studio/ohjeet/vanhan-version-palautus\" data-ohje-kortti=\"vanhan-version-palautus\">Palauta vanha versio</a>.</td>\n</tr>\n<tr>\n<td>Studio kaatuu tai ei aukea</td>\n<td>Vika on Studiossa tai palvelimessa.</td>\n<td><a href=\"/studio/ohjeet/studio-nayttaa-virheen\" data-ohje-kortti=\"studio-nayttaa-virheen\">Studio näyttää virheen</a>.</td>\n</tr>\n<tr>\n<td>Liitetiedoston pikapoisto ei onnistu</td>\n<td>Studio ei poista tiedostoa, jota jokin vielä käyttää.</td>\n<td>Poista liite tekstistä ja julkaise. Tiedosto poistuu itsestään viikon kuluttua.</td>\n</tr>\n<tr>\n<td>Sanityn hallintasivun asetukset (sanity.io/manage)</td>\n<td>Sivusto toimii niiden varassa.</td>\n<td>Älä muuta niitä.</td>\n</tr>\n</tbody>\n</table>\n<h2 id=\"tukihenkilo--sanityn-taso-vaihtuu-26-10-2026\">Sanityn taso vaihtuu 26.10.2026</h2>\n<p>Studion palveluntarjoaja on Sanity. Klubin projekti on maksuttomassa kokeilussa 26.10.2026 asti.\nHallitus päättää, jatketaanko maksullisella tasolla vai siirrytäänkö ilmaiselle tasolle.</p>\n<p>Jos projekti siirtyy ilmaiselle tasolle:</p>\n<ul>\n<li>Versiohistoria ulottuu vain kolme päivää taaksepäin. Vanhemmat virheet korjaat varmuuskopiosta: <a href=\"/studio/ohjeet/vanhan-version-palautus\" data-ohje-kortti=\"vanhan-version-palautus\">Palauta vanha versio</a>.</li>\n<li>Studion omat kommentit, Sanityn <strong>Tehtävät</strong> ja toiminto <strong>Ajasta julkaisu</strong> lakkaavat toimimasta. Älä siis käytä niitä nyt.</li>\n<li>Uutisen ajastat aina kentällä <strong>Julkaisuaika</strong>: <a href=\"/studio/ohjeet/ajasta-uutinen\" data-ohje-kortti=\"ajasta-uutinen\">Ajasta uutinen</a>.</li>\n<li>Tukihenkilö tarkistaa samana iltana, että kommentit, arvostelut ja varmuuskopiot toimivat.</li>\n</ul>\n<h2 id=\"tukihenkilo--muut-asiat\">Muut asiat</h2>\n<ul>\n<li>Domain lahdensuomalainenklubi.com uusitaan viimeistään 28.8.2027 domainin rekisteröijän kautta, ei Studiossa. Kysy tukihenkilöltä, kuka sen hoitaa.</li>\n<li>Uuden Studion käyttäjän kutsuminen tehdään Sanityn hallintasivulla. Pyydä tukihenkilö avuksi.</li>\n<li>Älä anna Studion tunnuksiasi kenellekään. Uusi käyttäjä kutsutaan omalla sähköpostillaan.</li>\n</ul>\n<h2 id=\"tukihenkilo--jos-tukihenkilo-ei-vastaa\">Jos tukihenkilö ei vastaa</h2>\n<p>Sivusto toimii ilman ylläpitoa. Kiireettömät asiat voivat odottaa.</p>\n<ul>\n<li>Virhe sisällössä: korjaa se Studiossa, tai palauta vanha versio.</li>\n<li>Sivusto ei aukea: kokeile toisella laitteella tai toisessa verkossa. Jos vika jatkuu yli päivän, ota uudelleen yhteyttä tukihenkilöön.</li>\n</ul>\n",
          "teksti": "Lähes kaiken sisällön voit päivittää itse. Tällä sivulla ovat asiat, joihin tarvitset tukihenkilöä, ja ohje siitä, miten kerrot ongelmasta. Tukihenkilön yhteystiedot on annettu sinulle erikseen. Näin kerrot ongelmasta Ota kuvakaappaus koko ruudusta. Windowsissa paina yhtä aikaa Windows-näppäintä, vaihtonäppäintä (Shift) ja S-kirjainta. Kirjoita ylös virheen tai Aloituksen rivin otsikko ja teksti sanatarkasti. Kerro, mitä olit tekemässä ja mihin aikaan. Kerro sivun osoite, jos vika näkyy sivustolla. Sisältösi on tallessa sillä välin. Luonnos säilyy, vaikka suljet selaimen. Mitä et voi tehdä itse Asia Miksi Mitä voit tehdä sillä välin Logon vaihto Logo on osa sivuston ulkoasua, ei Studiota. Ei mitään. Seuran sarjan vaihto otteluohjelmassa, esimerkiksi FC Lahti Ykkösliigaan Ottelut haetaan itsestään vain Veikkausliigasta. Lisää ottelut käsin: Lisää ottelu . Uusi jalkapalloarkiston osio tai tekstisivu arkiston alle Arkiston rakenne on sivuston koodissa. Tee taulukko kategorialla Muu tilasto: se saa oman sivunsa arkistossa. Uusi pelaajaosio Litmasen tapaan Lehtileikkeet toimivat vain Litmasella. Pelaajan sivu onnistuu, mutta ilman lehtileikkeitä. Tiedote jokaisen sivun yläreunaan Sivustolla ei ole tiedotebanneria. Nosta uutinen etusivun pääjutuksi: Muuta etusivun yläosaa . Lukitun sivun osoitteen muutos tai poisto Sivusto hakee lukitun sivun aina samasta osoitteesta. Muokkaa sivun tekstiä vapaasti. Vanhan sivuston osoitteen ohjauksen muutos Vanhojen osoitteiden ohjaukset ovat kiinteitä. Valitse lyhytosoitteelle toinen osoite. Tunnisteen nimen muutos kaikkiin uutisiin kerralla Muutos koskee satoja uutisia. Muuta tunniste yksittäisissä uutisissa. Facebook- tai Instagram-julkaisun upotus Vain Google Maps, Google Forms ja Vimeo ovat sallittuja. Lisää tekstiin linkki tai painike. Huuhkajat-osioiden, eurocupien ja mestaruusmaiden alasivujen johdannot Tekstit ovat sivuston koodissa. Ei mitään. Uusi Klubi-osion alasivu Klubi-sivun välilehtiin Välilehdet ovat sivuston koodissa. Lisää sivu valikkoon: Muokkaa valikkoa ja alatunnistetta . Kahden klubilaisen säännön muutos Sääntö on sivuston koodissa. Ei mitään. Aloituksen punaiset rivit: varmuuskopio, yöllinen huolto, otteluhaku, kiintiö Ajastetut työt ovat sivuston palvelimella. Jatka työtä normaalisti: Aloituksessa lukee Vaatii toimia . Koko sivuston palautus ja kuvien varmuuskopio Studion varmuuskopiossa ovat tekstit ja tiedot, eivät kuvat. Yksittäisen sivun palautat itse: Palauta vanha versio . Studio kaatuu tai ei aukea Vika on Studiossa tai palvelimessa. Studio näyttää virheen . Liitetiedoston pikapoisto ei onnistu Studio ei poista tiedostoa, jota jokin vielä käyttää. Poista liite tekstistä ja julkaise. Tiedosto poistuu itsestään viikon kuluttua. Sanityn hallintasivun asetukset (sanity.io/manage) Sivusto toimii niiden varassa. Älä muuta niitä. Sanityn taso vaihtuu 26.10.2026 Studion palveluntarjoaja on Sanity. Klubin projekti on maksuttomassa kokeilussa 26.10.2026 asti. Hallitus päättää, jatketaanko maksullisella tasolla vai siirrytäänkö ilmaiselle tasolle. Jos projekti siirtyy ilmaiselle tasolle: Versiohistoria ulottuu vain kolme päivää taaksepäin. Vanhemmat virheet korjaat varmuuskopiosta: Palauta vanha versio . Studion omat kommentit, Sanityn Tehtävät ja toiminto Ajasta julkaisu lakkaavat toimimasta. Älä siis käytä niitä nyt. Uutisen ajastat aina kentällä Julkaisuaika : Ajasta uutinen . Tukihenkilö tarkistaa samana iltana, että kommentit, arvostelut ja varmuuskopiot toimivat. Muut asiat Domain lahdensuomalainenklubi.com uusitaan viimeistään 28.8.2027 domainin rekisteröijän kautta, ei Studiossa. Kysy tukihenkilöltä, kuka sen hoitaa. Uuden Studion käyttäjän kutsuminen tehdään Sanityn hallintasivulla. Pyydä tukihenkilö avuksi. Älä anna Studion tunnuksiasi kenellekään. Uusi käyttäjä kutsutaan omalla sähköpostillaan. Jos tukihenkilö ei vastaa Sivusto toimii ilman ylläpitoa. Kiireettömät asiat voivat odottaa. Virhe sisällössä: korjaa se Studiossa, tai palauta vanha versio. Sivusto ei aukea: kokeile toisella laitteella tai toisessa verkossa. Jos vika jatkuu yli päivän, ota uudelleen yhteyttä tukihenkilöön.",
          "otsikot": [
            {
              "id": "tukihenkilo--nain-kerrot-ongelmasta",
              "teksti": "Näin kerrot ongelmasta",
              "taso": 2
            },
            {
              "id": "tukihenkilo--mita-et-voi-tehda-itse",
              "teksti": "Mitä et voi tehdä itse",
              "taso": 2
            },
            {
              "id": "tukihenkilo--sanityn-taso-vaihtuu-26-10-2026",
              "teksti": "Sanityn taso vaihtuu 26.10.2026",
              "taso": 2
            },
            {
              "id": "tukihenkilo--muut-asiat",
              "teksti": "Muut asiat",
              "taso": 2
            },
            {
              "id": "tukihenkilo--jos-tukihenkilo-ei-vastaa",
              "teksti": "Jos tukihenkilö ei vastaa",
              "taso": 2
            }
          ]
        },
        {
          "id": "mita-ei-saa-tehda",
          "otsikko": "Mitä ei kannata tehdä",
          "osio": "hakuteos",
          "avainsanat": [
            "kielletty",
            "älä",
            "varoitus",
            "vaara",
            "henkilötiedot",
            "julkinen",
            "poista",
            "Kyselyt",
            "kommentit Studiossa",
            "ajasta julkaisu",
            "tunnukset"
          ],
          "tyypit": [],
          "kesto": null,
          "paivitetty": "2026-10-08",
          "html": "<p>Lähes kaiken voi perua. Luonnos ei näy kävijöille, ja aiemman version saat takaisin\nhistoriasta tai varmuuskopiosta. Alla ovat asiat, joissa kannattaa olla tarkkana.</p>\n<h2 id=\"mita-ei-saa-tehda--tavallinen-tyo\">Tavallinen työ</h2>\n<table>\n<thead>\n<tr>\n<th>Älä</th>\n<th>Tee näin</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>Älä paina <strong>Julkaise</strong> kesken työn tallentaaksesi.</td>\n<td>Muutokset tallentuvat itsestään luonnokseksi. Julkaise vasta, kun olet valmis.</td>\n</tr>\n<tr>\n<td>Älä poista hallituksen jäsentä, joka jää pois.</td>\n<td>Käännä kytkin <strong>Nykyinen jäsen</strong> pois päältä.</td>\n</tr>\n<tr>\n<td>Älä yritä poistaa klubilaista.</td>\n<td>Käännä kytkin <strong>Näytä arvostelulomakkeella</strong> pois päältä.</td>\n</tr>\n<tr>\n<td>Älä paina <strong>Poista joka tapauksessa</strong>.</td>\n<td>Poista ensin linkit, jotka vievät poistettavaan: <a href=\"/studio/ohjeet/et-ehka-voi-poistaa\" data-ohje-kortti=\"et-ehka-voi-poistaa\">Et ehkä voi poistaa</a>.</td>\n</tr>\n<tr>\n<td>Älä poista etusivun lohkoa (⋯ → <strong>Poista</strong>), jos haluat sen pois vain hetkeksi.</td>\n<td>Käännä kytkin <strong>Piilota lohko sivulta</strong> päälle.</td>\n</tr>\n<tr>\n<td>Älä kopioi sivuston tiedoston osoitetta linkin <strong>Muu osoite</strong> -kenttään.</td>\n<td>Valitse <strong>Mihin linkki vie?</strong> -kohdasta <strong>Tiedosto</strong> ja sama tiedosto.</td>\n</tr>\n<tr>\n<td>Älä tee tavallista sivua osion osoitteeseen, esimerkiksi uutiset/…</td>\n<td>Studio estää sen. Muokkaa osion sivua kohdassa <strong>Osioiden sivut</strong>.</td>\n</tr>\n</tbody>\n</table>\n<p>Kentät <strong>Vanha osoite</strong>, <strong>Muut vanhat osoitteet</strong>, <strong>Alkuperäinen Blogspot-kirjoitus</strong> ja\n<strong>Aiemmat osoitteet</strong> ovat vain luettavia. Vanhat linkit ohjautuvat niiden avulla.</p>\n<h2 id=\"mita-ei-saa-tehda--henkilotiedot\">Henkilötiedot</h2>\n<div class=\"markdown-alert markdown-alert-warning\">\n<p class=\"markdown-alert-title\">Varoitus</p>\n<p>Sivustolle ladatut tiedostot ja kuvat ovat julkisia. Ne löytyvät, vaikka niihin ei\nlinkitettäisi, ja tiedoston nimi näkyy. Älä lataa jäsenluetteloita, pöytäkirjoja, joissa\non henkilötietoja, tai muuta luottamuksellista.</p>\n</div>\n<ul>\n<li>Älä kirjoita henkilötietoja lyhytosoitteen kenttään <strong>Muistiinpano (ei näy sivuilla)</strong>. Sen voi lukea sivuston tietokannasta.</li>\n<li>Kun joku pyytää poistamaan tietonsa, piilottaminen ei riitä. Ohje: <a href=\"/studio/ohjeet/tietosuojapyynto\" data-ohje-kortti=\"tietosuojapyynto\">Tietosuojapyyntö</a>.</li>\n</ul>\n<h2 id=\"mita-ei-saa-tehda--studion-lisatoiminnot\">Studion lisätoiminnot</h2>\n<table>\n<thead>\n<tr>\n<th>Älä käytä</th>\n<th>Miksi</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>Työkalua <strong>Kyselyt (tukihenkilö)</strong></td>\n<td>Se on tukihenkilön työkalu.</td>\n</tr>\n<tr>\n<td>Studion omia kommentteja (puhekupla lomakkeen reunassa)</td>\n<td>Ne lakkaavat toimimasta, jos Sanity siirtyy ilmaiselle tasolle 26.10.2026.</td>\n</tr>\n<tr>\n<td>Sanityn paneelia <strong>Tehtävät</strong></td>\n<td>Sama syy. Käytä valikon kohtaa <strong>Tehtävät sinulle</strong>.</td>\n</tr>\n<tr>\n<td>Toimintoa <strong>Ajasta julkaisu</strong></td>\n<td>Sama syy. Ajasta uutinen kentällä <strong>Julkaisuaika</strong>: <a href=\"/studio/ohjeet/ajasta-uutinen\" data-ohje-kortti=\"ajasta-uutinen\">Ajasta uutinen</a>.</td>\n</tr>\n</tbody>\n</table>\n<h2 id=\"mita-ei-saa-tehda--tunnukset-ja-asetukset\">Tunnukset ja asetukset</h2>\n<ul>\n<li>Älä anna Studion tunnuksiasi kenellekään. Uusi käyttäjä kutsutaan omalla sähköpostillaan.</li>\n<li>Älä muuta Sanityn hallintasivun (sanity.io/manage) asetuksia. Sivusto toimii niiden varassa. Ohje: <a href=\"/studio/ohjeet/tukihenkilo\" data-ohje-kortti=\"tukihenkilo\">Mihin tarvitset tukihenkilöä</a>.</li>\n</ul>\n",
          "teksti": "Lähes kaiken voi perua. Luonnos ei näy kävijöille, ja aiemman version saat takaisin historiasta tai varmuuskopiosta. Alla ovat asiat, joissa kannattaa olla tarkkana. Tavallinen työ Älä Tee näin Älä paina Julkaise kesken työn tallentaaksesi. Muutokset tallentuvat itsestään luonnokseksi. Julkaise vasta, kun olet valmis. Älä poista hallituksen jäsentä, joka jää pois. Käännä kytkin Nykyinen jäsen pois päältä. Älä yritä poistaa klubilaista. Käännä kytkin Näytä arvostelulomakkeella pois päältä. Älä paina Poista joka tapauksessa . Poista ensin linkit, jotka vievät poistettavaan: Et ehkä voi poistaa . Älä poista etusivun lohkoa (⋯ → Poista ), jos haluat sen pois vain hetkeksi. Käännä kytkin Piilota lohko sivulta päälle. Älä kopioi sivuston tiedoston osoitetta linkin Muu osoite -kenttään. Valitse Mihin linkki vie? -kohdasta Tiedosto ja sama tiedosto. Älä tee tavallista sivua osion osoitteeseen, esimerkiksi uutiset/… Studio estää sen. Muokkaa osion sivua kohdassa Osioiden sivut . Kentät Vanha osoite , Muut vanhat osoitteet , Alkuperäinen Blogspot-kirjoitus ja Aiemmat osoitteet ovat vain luettavia. Vanhat linkit ohjautuvat niiden avulla. Henkilötiedot Sivustolle ladatut tiedostot ja kuvat ovat julkisia. Ne löytyvät, vaikka niihin ei linkitettäisi, ja tiedoston nimi näkyy. Älä lataa jäsenluetteloita, pöytäkirjoja, joissa on henkilötietoja, tai muuta luottamuksellista. Älä kirjoita henkilötietoja lyhytosoitteen kenttään Muistiinpano (ei näy sivuilla) . Sen voi lukea sivuston tietokannasta. Kun joku pyytää poistamaan tietonsa, piilottaminen ei riitä. Ohje: Tietosuojapyyntö . Studion lisätoiminnot Älä käytä Miksi Työkalua Kyselyt (tukihenkilö) Se on tukihenkilön työkalu. Studion omia kommentteja (puhekupla lomakkeen reunassa) Ne lakkaavat toimimasta, jos Sanity siirtyy ilmaiselle tasolle 26.10.2026. Sanityn paneelia Tehtävät Sama syy. Käytä valikon kohtaa Tehtävät sinulle . Toimintoa Ajasta julkaisu Sama syy. Ajasta uutinen kentällä Julkaisuaika : Ajasta uutinen . Tunnukset ja asetukset Älä anna Studion tunnuksiasi kenellekään. Uusi käyttäjä kutsutaan omalla sähköpostillaan. Älä muuta Sanityn hallintasivun (sanity.io/manage) asetuksia. Sivusto toimii niiden varassa. Ohje: Mihin tarvitset tukihenkilöä .",
          "otsikot": [
            {
              "id": "mita-ei-saa-tehda--tavallinen-tyo",
              "teksti": "Tavallinen työ",
              "taso": 2
            },
            {
              "id": "mita-ei-saa-tehda--henkilotiedot",
              "teksti": "Henkilötiedot",
              "taso": 2
            },
            {
              "id": "mita-ei-saa-tehda--studion-lisatoiminnot",
              "teksti": "Studion lisätoiminnot",
              "taso": 2
            },
            {
              "id": "mita-ei-saa-tehda--tunnukset-ja-asetukset",
              "teksti": "Tunnukset ja asetukset",
              "taso": 2
            }
          ]
        },
        {
          "id": "mita-uutta",
          "otsikko": "Mitä uutta",
          "osio": "hakuteos",
          "avainsanat": [
            "mitä uutta",
            "muutokset",
            "versio",
            "päivitys",
            "muutosloki"
          ],
          "tyypit": [],
          "kesto": null,
          "paivitetty": "2026-10-08",
          "html": "<p>Oppaan muutokset, uusin ensin.</p>\n<table>\n<thead>\n<tr>\n<th>Versio</th>\n<th>Päiväys</th>\n<th>Muutos</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>3.0</td>\n<td>10/2026</td>\n<td>Uusi opas kuvineen. Ohjeet ovat nyt Studiossa kohdassa Ohjeet ja tulostettavana. Jokainen tehtävä on omalla kortillaan, ja vianetsintä on järjestetty sen mukaan, mitä näet ruudulla.</td>\n</tr>\n</tbody>\n</table>\n",
          "teksti": "Oppaan muutokset, uusin ensin. Versio Päiväys Muutos 3.0 10/2026 Uusi opas kuvineen. Ohjeet ovat nyt Studiossa kohdassa Ohjeet ja tulostettavana. Jokainen tehtävä on omalla kortillaan, ja vianetsintä on järjestetty sen mukaan, mitä näet ruudulla.",
          "otsikot": []
        }
      ]
    }
  ]
};
