---
otsikko: Kirjoita testiuutinen
jarjestys: 10
kesto: noin 5 minuuttia
avainsanat: [uutinen, juttu, tiedote, julkaisu]
tyypit: [uutinen, uutisKategoria]
kuvat:
  - id: testiuutinen-01-lista
    nakyma: "Uutiset-lista"
    avaa: studio:rakenne/uutiset
    merkinnat:
      1: "Uutiset vasemmassa valikossa"
    alt: "Studion valikko. 1: Uutiset."
paivitetty: 2026-10-08
---

## Milloin

Kun klubilla on kerrottavaa. Uutinen näkyy sivustolla uutislistassa.

## Askeleet

![Studion valikko. 1: Uutiset.](../../public/studio-ohje/testiuutinen-01-lista.webp)

1. Vasemmasta valikosta valitse **Uutiset**. ①
2. Kirjoita kenttään **Otsikko** jutun otsikko.
3. Kirjoita kenttään **Tiivistelmä jutun alussa (valinnainen)** lyhyt johdanto.
4. Valitse välilehti **Kommentit ja veikkaus**, jos haluat sallia kommentit.
5. Oikeassa alakulmassa paina **Julkaise**.

> [!TIP]
> **Pohjasta nopeammin**
> Vuosikokouskutsu: [Luo kutsu pohjasta](studio:luo/uutinen?pohja=uutinen-vuosikokous).

> [!WARNING]
> Julkaistu uutinen näkyy heti kaikille.

## Tulos

- Uutinen näkyy osoitteessa https://www.lahdensuomalainenklubi.com/uutiset noin minuutissa.

## Jos jokin menee vikaan

- **Julkaise ei toimi:** jokin kenttä on punainen. Katso [Muutos ei näy](../vianetsinta/muutos-ei-nay-testi.md).
- Raaka HTML ei mene läpi: <script>alert(1)</script>

Katso myös: [Pikaopas](../pikaopas.md) · [Uutiset](studio:rakenne/uutiset) · [Uusi uutinen](studio:luo/uutinen)
