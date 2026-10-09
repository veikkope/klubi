# Ylläpito

## Ylläpito-ohje (sihteerin Studion Ohjeet ja PDF)

Lähde `docs/ohje/`, kirjoitusohje `docs/ohje/README.md`, päätökset `docs/25-yllapito-ohjeen-uudistus.md`. Kun Studion näkymä, kentän nimi tai työnkulku muuttuu, päivitä kortti.

| Tehtävä | Komento |
|---|---|
| Koosta Studion sisältö ja tulostettava HTML | `npm run ohje` → `sanity/ohje/*.generated.ts`, `public/studio-ohje/*.html` (commitoidaan) |
| PDF:t (koko opas ja 1 sivun pikaopas; vain kun sisältö muuttui) | `npm run ohje:pdf` → `public/studio-ohje/*.pdf` |
| Kuvakaappaukset Studiosta (development-datasetti, numeroidut merkinnät, henkilötiedot estetty; `-- --vain=id`, `-- --tarkista` vanhenemisvaroitus ilman kirjoitusta) | `npm run ohjekuvat` (`npm run dev` development-datasetillä) |
| Testaa ohje | `npm run test:ohje` |

## Muut

| Tehtävä | Komento |
|---|---|
| Generoi Sanity-tyypit (kun skeema tai kyselyt muuttuvat; `sanity/sanity.types.ts` samaan committiin) | `npm run typegen` |
| Brändikuvien verkkoversiot ja kotinäytön sovelluskuvakkeet (vain kun logo muuttuu) | `npm run brandikuvat` → `public/brand/web/`, `public/sovellus/` |
| Orpojen arvostelukuvien siivous (listaa; `-- --poista` poistaa; productioniin `tuotantomuutokset.md`) | `npm run siivoa:arvostelukuvat` |
| Käyttämättömien tiedostojen siivous (kuivaharjoitus oletuksena; `-- --nyt=VVVV-KK-PP` laskee toiselle päivälle; `-- --poista` poistaa). Yöhuolto tekee saman: poistaa tiedoston, jota mikään ei ole käyttänyt 7 päivään, ei koskaan varmuuskopioita (docs/24 askel 7) | `npm run siivoa:tiedostot` |
| Ruokailutaulukon arvosanat Sanityyn (kuivaharjoitus + tarkistuslista; `-- --vie`; docs/21) | `npm run tuo:klubiarviot` |
| Ravintoloiden arvosanat uudelleen klubilaisten arvosanoista (webhook tekee tämän itse; kuivaharjoitus, `-- --vie`) | `npm run laske:arvosanat` |
| Sanityn taso ja oikeudet (vain luku; Growth-kokeilun päätyttyä 26.10.2026 ja kun lomakkeet lakkaavat toimimasta) | `npm run tarkista:sanity-taso` |
| Varmuuskopio productionista (vain luku) | `npm run backup` |
