/**
 * Kuvaviittausten normalisointi.
 *
 * Vanhalla sivustolla sama kuva esiintyy eri kirjoitusasuissa: `kuva.jpg`,
 * `./kuva.jpg`, `/kuva.jpg`. Kaikki viittaavat samaan tiedostoon, joten ne on
 * normalisoitava samaksi avaimeksi ennen kuin kuvia deduplikoidaan tai
 * liitetään dokumentteihin.
 *
 * Omassa moduulissaan, koska sekä `download-images.ts` että `import-kuvat.ts`
 * tarvitsevat täsmälleen saman logiikan — jos ne eroaisivat, liitos
 * dokumenttiin epäonnistuisi hiljaa.
 */

const SEPARATORS = /[/\\]/g;

/** `./alihakemisto/kuva.jpg?v=2` → `alihakemisto_kuva.jpg` */
export function localImageName(src: string): string {
  return src
    .trim()
    .replace(/^\.?\//, "")
    .split("?")[0]
    .split("#")[0]
    .replace(SEPARATORS, "_");
}
