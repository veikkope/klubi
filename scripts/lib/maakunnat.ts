/**
 * Kunta → maakunta -taulukko ravintolaputkelle (ja muille kaupunkeja luoville putkille).
 *
 * Lähde: Tilastokeskuksen kuntien ja maakuntien luokitus (Kuntaliiton
 * kuntaluettelo), tilanne 2025. Luokitus on ollut voimassa 1.1.2021 lähtien,
 * jolloin Kuhmoinen siirtyi Pirkanmaalle, Iitti Päijät-Hämeeseen, Heinävesi
 * Pohjois-Karjalaan ja Joroinen Pohjois-Savoon, ja Honkajoki liitettiin
 * Kankaanpäähän. Kuntia 309, maakuntia 19 (ks. tarkistus tiedoston lopussa).
 *
 * Kunnan nimi on suomenkielinen virallinen nimi. Kaksikielisten kuntien
 * ruotsinkielisiä nimiä ei tarvita, koska vanha sivusto käytti suomea.
 *
 * TAAJAMAT: ravintolan kaupunki johdetaan postitoimipaikasta, joka voi olla
 * kylä tai taajama (Sirkka, Vääksy). Ne kartoitetaan kuntaansa nimetysti.
 * Uusi paikkakunta, jota kumpikaan taulukko ei tunne, kaataa ajon
 * (`maakuntaFor` heittää): hiljainen aukko maakuntasuodattimessa olisi pahempi.
 */
import { MAAKUNNAT, type MaakuntaValue } from "../../lib/maakunnat";

const KUNNAT: Record<MaakuntaValue, string[]> = {
  uusimaa: [
    "Askola", "Espoo", "Hanko", "Helsinki", "Hyvinkää", "Inkoo", "Järvenpää", "Karkkila",
    "Kauniainen", "Kerava", "Kirkkonummi", "Lapinjärvi", "Lohja", "Loviisa", "Myrskylä",
    "Mäntsälä", "Nurmijärvi", "Pornainen", "Porvoo", "Pukkila", "Raasepori", "Sipoo",
    "Siuntio", "Tuusula", "Vantaa", "Vihti",
  ],
  "varsinais-suomi": [
    "Aura", "Kaarina", "Kemiönsaari", "Koski Tl", "Kustavi", "Laitila", "Lieto", "Loimaa",
    "Marttila", "Masku", "Mynämäki", "Naantali", "Nousiainen", "Oripää", "Paimio", "Parainen",
    "Pyhäranta", "Pöytyä", "Raisio", "Rusko", "Salo", "Sauvo", "Somero", "Taivassalo", "Turku",
    "Uusikaupunki", "Vehmaa",
  ],
  satakunta: [
    "Eura", "Eurajoki", "Harjavalta", "Huittinen", "Jämijärvi", "Kankaanpää", "Karvia",
    "Kokemäki", "Merikarvia", "Nakkila", "Pomarkku", "Pori", "Rauma", "Siikainen", "Säkylä",
    "Ulvila",
  ],
  "kanta-hame": [
    "Forssa", "Hattula", "Hausjärvi", "Humppila", "Hämeenlinna", "Janakkala", "Jokioinen",
    "Loppi", "Riihimäki", "Tammela", "Ypäjä",
  ],
  pirkanmaa: [
    "Akaa", "Hämeenkyrö", "Ikaalinen", "Juupajoki", "Kangasala", "Kihniö", "Kuhmoinen",
    "Lempäälä", "Mänttä-Vilppula", "Nokia", "Orivesi", "Parkano", "Pirkkala", "Punkalaidun",
    "Pälkäne", "Ruovesi", "Sastamala", "Tampere", "Urjala", "Valkeakoski", "Vesilahti",
    "Virrat", "Ylöjärvi",
  ],
  "paijat-hame": [
    "Asikkala", "Hartola", "Heinola", "Hollola", "Iitti", "Kärkölä", "Lahti", "Orimattila",
    "Padasjoki", "Sysmä",
  ],
  kymenlaakso: ["Hamina", "Kotka", "Kouvola", "Miehikkälä", "Pyhtää", "Virolahti"],
  "etela-karjala": [
    "Imatra", "Lappeenranta", "Lemi", "Luumäki", "Parikkala", "Rautjärvi", "Ruokolahti",
    "Savitaipale", "Taipalsaari",
  ],
  "etela-savo": [
    "Enonkoski", "Hirvensalmi", "Juva", "Kangasniemi", "Mikkeli", "Mäntyharju", "Pertunmaa",
    "Pieksämäki", "Puumala", "Rantasalmi", "Savonlinna", "Sulkava",
  ],
  "pohjois-savo": [
    "Iisalmi", "Joroinen", "Kaavi", "Keitele", "Kiuruvesi", "Kuopio", "Lapinlahti",
    "Leppävirta", "Pielavesi", "Rautalampi", "Rautavaara", "Siilinjärvi", "Sonkajärvi",
    "Suonenjoki", "Tervo", "Tuusniemi", "Varkaus", "Vesanto", "Vieremä",
  ],
  "pohjois-karjala": [
    "Heinävesi", "Ilomantsi", "Joensuu", "Juuka", "Kitee", "Kontiolahti", "Lieksa", "Liperi",
    "Nurmes", "Outokumpu", "Polvijärvi", "Rääkkylä", "Tohmajärvi",
  ],
  "keski-suomi": [
    "Hankasalmi", "Joutsa", "Jyväskylä", "Jämsä", "Kannonkoski", "Karstula", "Keuruu",
    "Kinnula", "Kivijärvi", "Konnevesi", "Kyyjärvi", "Laukaa", "Luhanka", "Multia", "Muurame",
    "Petäjävesi", "Pihtipudas", "Saarijärvi", "Toivakka", "Uurainen", "Viitasaari", "Äänekoski",
  ],
  "etela-pohjanmaa": [
    "Alajärvi", "Alavus", "Evijärvi", "Ilmajoki", "Isojoki", "Isokyrö", "Karijoki", "Kauhajoki",
    "Kauhava", "Kuortane", "Kurikka", "Lappajärvi", "Lapua", "Seinäjoki", "Soini", "Teuva",
    "Vimpeli", "Ähtäri",
  ],
  pohjanmaa: [
    "Kaskinen", "Korsnäs", "Kristiinankaupunki", "Kruunupyy", "Laihia", "Luoto", "Maalahti",
    "Mustasaari", "Närpiö", "Pedersören kunta", "Pietarsaari", "Uusikaarlepyy", "Vaasa", "Vöyri",
  ],
  "keski-pohjanmaa": [
    "Halsua", "Kannus", "Kaustinen", "Kokkola", "Lestijärvi", "Perho", "Toholampi", "Veteli",
  ],
  "pohjois-pohjanmaa": [
    "Alavieska", "Haapajärvi", "Haapavesi", "Hailuoto", "Ii", "Kalajoki", "Kempele", "Kuusamo",
    "Kärsämäki", "Liminka", "Lumijoki", "Merijärvi", "Muhos", "Nivala", "Oulainen", "Oulu",
    "Pudasjärvi", "Pyhäjoki", "Pyhäjärvi", "Pyhäntä", "Raahe", "Reisjärvi", "Sievi", "Siikajoki",
    "Siikalatva", "Taivalkoski", "Tyrnävä", "Utajärvi", "Vaala", "Ylivieska",
  ],
  kainuu: [
    "Hyrynsalmi", "Kajaani", "Kuhmo", "Paltamo", "Puolanka", "Ristijärvi", "Sotkamo",
    "Suomussalmi",
  ],
  lappi: [
    "Enontekiö", "Inari", "Kemi", "Kemijärvi", "Keminmaa", "Kittilä", "Kolari", "Muonio",
    "Pelkosenniemi", "Pello", "Posio", "Ranua", "Rovaniemi", "Salla", "Savukoski", "Simo",
    "Sodankylä", "Tervola", "Tornio", "Utsjoki", "Ylitornio",
  ],
  ahvenanmaa: [
    "Brändö", "Eckerö", "Finström", "Föglö", "Geta", "Hammarland", "Jomala", "Kumlinge", "Kökar",
    "Lemland", "Lumparland", "Maarianhamina", "Saltvik", "Sottunga", "Sund", "Vårdö",
  ],
};

/**
 * Postitoimipaikka tai taajama, joka ei ole kunta → kunta, johon se kuuluu.
 * Jokainen rivi on tarkistettu lähteen osoitteesta ja postinumerosta.
 */
const TAAJAMAT: Record<string, string> = {
  Hillosensalmi: "Kouvola", // 47910, Valkealan kylä (Kouvola vuodesta 2009)
  Myllykoski: "Kouvola", // 46800, Anjalankosken taajama (Kouvola vuodesta 2009)
  Härmä: "Kauhava", // 62300, Alahärmä (Kauhava vuodesta 2009)
  Ylihärmä: "Kauhava", // 62375 (Kauhava vuodesta 2009)
  Pentinmäki: "Kurikka", // 61710, Jalasjärven kylä (Kurikka vuodesta 2016), Juustoportti
  Sirkka: "Kittilä", // 99130, Levin taajama
  Vääksy: "Asikkala", // 17200, kuntakeskus
  Vierumäki: "Heinola", // 19110
};

const byKunta = new Map<string, MaakuntaValue>();
for (const [maakunta, kunnat] of Object.entries(KUNNAT) as [MaakuntaValue, string[]][]) {
  for (const kunta of kunnat) {
    if (byKunta.has(kunta)) throw new Error(`maakunnat.ts: kunta ${kunta} kahdesti`);
    byKunta.set(kunta, maakunta);
  }
}

// Luokituksen eheys: 19 maakuntaa, 309 kuntaa, taajamat osoittavat oikeisiin kuntiin.
if (Object.keys(KUNNAT).length !== MAAKUNNAT.length || MAAKUNNAT.length !== 19) {
  throw new Error("maakunnat.ts: maakuntia pitää olla 19");
}
if (byKunta.size !== 309) {
  throw new Error(`maakunnat.ts: kuntia ${byKunta.size}, odotettiin 309`);
}
for (const [taajama, kunta] of Object.entries(TAAJAMAT)) {
  if (!byKunta.has(kunta)) throw new Error(`maakunnat.ts: taajaman ${taajama} kunta ${kunta} puuttuu`);
  if (byKunta.has(taajama)) throw new Error(`maakunnat.ts: ${taajama} on kunta, ei taajama`);
}

/**
 * Suomalaisen paikkakunnan (kunta tai taajama) maakunta.
 * Heittää virheen, jos paikkakuntaa ei tunneta — lisää se `KUNNAT`- tai
 * `TAAJAMAT`-taulukkoon lähteen kanssa.
 */
export function maakuntaFor(paikkakunta: string): MaakuntaValue {
  const kunta = TAAJAMAT[paikkakunta] ?? paikkakunta;
  const maakunta = byKunta.get(kunta);
  if (!maakunta) {
    throw new Error(
      `Paikkakunnan "${paikkakunta}" maakunta ei ole tiedossa. Lisää se scripts/lib/maakunnat.ts:n ` +
        "KUNNAT- (kunta) tai TAAJAMAT-taulukkoon (kylä/taajama → kunta).",
    );
  }
  return maakunta;
}
