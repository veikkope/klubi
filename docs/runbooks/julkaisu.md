# Julkaisu: klubin lisälista

Skill `tyokalut:julkaisu` lukee tämän yleisen listansa lisäksi.

- **Studio- tai skeemamuutos:** `npm run savutesti:studio` läpi (kehityspalvelin käynnissä). Pakollinen ennen pushia.
- **Studion näkymä tai nimi muuttui:** ylläpito-ohjeen kortti päivitetty, `npm run ohje` ajettu ja generoitu sisältö commitissa (`npm run test:ohje` valvoo). PDF:t (`npm run ohje:pdf`) jos sisältö muuttui.
- **Skeema tai kyselyt muuttuivat:** `npm run typegen`, `sanity/sanity.types.ts` samassa commitissa.
- **Uusi tai muuttunut reitti:** polku varattu, puuttuva sisältö `ohjaaTaiEiLoydy`, vanhat osoitteet ohjautuvat (`seo.md`).
- **Tarvitaanko datamuutos productioniin?** Järjestys: deploy → patch (käyttäjä ajaa, `tuotantomuutokset.md`) → vanhan kentän poisto myöhemmin.
- **Tuotannon kaltainen tarkistus isommissa muutoksissa:** build productionin datalla lukutokenilla (`ymparistot.md`), `rm -rf .next` ensin.
- **Pushin jälkeen:** Vercelin deploy ja GitHubin tarkistukset vihreinä (`ymparistot.md`), etusivu ja muutettu kohta tuotannossa.
