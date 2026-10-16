# 002: FIFA-rankingin kuvaaja piirretään tilastotaulukosta

**Tila:** Hyväksytty · **Päivä:** 2026-10-16 · **Päättäjä:** kehittäjä (Veikko hyväksyi suunnitelman)

## Konteksti
Vanhalla sivustolla FIFA-rankinghistoria oli kuva (`FIFAranking202604.png`), jonka sihteeri teki Excelin kaaviosta (`Suomi_Fifa_ranking 2026 October.xlsx`, välilehdet TIEDOT ja PIVOT_KUVAT) ja latasi uudelleen joka kuukausi. Kuvan alla oli käsin kirjoitettu nykyinen sija ja keskiarvo, ja luku vanheni ("2026 / Huhtikuu -> 73", vaikka sija oli jo 75). Kuvasta ei voi lukea dataa (WCAG, GEO), eikä sitä voi päivittää ilman Exceliä.

## Päätös
Data on tavallinen Jalkapallotilasto `jalkapalloTilasto-fifa-ranking`, jossa on sarakkeet Kuukausi (VVVV/KK), Sija ja Valmentaja, yksi rivi kuukaudessa. Valmentajan vaihtokuukausi kuuluu uudelle valmentajalle. Uusi kenttä `kaavio: "sijoitushistoria"` (Tilastodata-välilehti, näkyy FIFA-ranking-kategoriassa) kytkee päälle laskennan `lib/sijoitushistoria.ts` ja komponentin `components/kaaviot/`. Sivu laskee riveistä tunnusluvut, palvelimella piirretyn SVG-kuvaajan valmentajakausineen ja päävalmentajittaisen taulukon. Koko kuukausitaulukko on avattavana sivun lopussa. Studio tarkistaa rivit tiukasti vain, kun kuvaaja on valittu.

## Seuraukset
- Sihteeri lisää kuukausittain yhden rivin ja julkaisee. Kuvia ja lukuja ei enää päivitetä käsin (ohjekortti `docs/ohje/arkisto/fifa-ranking.md`).
- Excelistä voi liittää koko taulukon (Tuo Excelistä). Otsikko Aika tunnistetaan kuukaudeksi.
- Kuvaaja on SVG ilman kaaviokirjastoa: ei riippuvuutta eikä palveluun lukitsemista, ja palvelin renderöi sen. Selaimessa se saa aikavälin rajauksen (kaikki, 10 v, 5 v), osoittimen ja näppäimistöselauksen. Data on myös HTML-taulukkona.
- Kenttä on yleinen (`kaavio`), mutta näkyy toistaiseksi vain FIFA-rankingissa. Uusi kuvaajatyyppi lisätään samaan listaan, kun sille on tarve.
- Valmentajat-sivun sarake "FIFA-rankingin keskiarvo" on yhä käsin kirjoitettu. Sen voisi myöhemmin laskea samasta datasta.

## Hylätyt vaihtoehdot
- Oma sisältötyyppi, jossa on 386 tyypitettyä objektia: tiukempi, mutta raskas muokata Studion listaeditorissa, eikä Excelistä voi liittää.
- Kaaviokirjasto (Recharts, Chart.js): satoja kilotavuja JavaScriptiä yhteen kuvaajaan, ja kuvaaja piirtyy vasta selaimessa.
- Kuvan lataus kuten ennen: ei saavutettava, vanhenee, ja vaatii Exceliä.
