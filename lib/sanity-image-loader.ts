"use client";

import type { ImageLoaderProps } from "next/image";

/**
 * next/image-loader: kuvat skaalataan Sanityn kuva-CDN:ssä eikä Vercelin Image
 * Optimizationissa (docs/16, suorituskyky-8). Vercelin Hobby-tason kiintiö
 * olisi ~1700 kuvalla (1 Gt) täyttynyt, ja Sanityn CDN tekee saman työn
 * (koko, formaatti AVIF/WebP, laatu) ilman lisäkustannusta.
 *
 * Sanity-URL tulee valmiina `urlForImage`-rakentajasta (sanity/lib/image.ts),
 * jossa on jo rajaus (`rect`, polttopiste) ja mittasuhde (`w` + `h`). Loader
 * vaihtaa vain leveyden srcsetin kokoon ja skaalaa korkeuden samassa suhteessa,
 * joten rajaus säilyy. Leveys rajataan lähdekuvan (tai rajauksen) leveyteen:
 * Sanity suurentaisi muuten pientä kuvaa turhaan.
 *
 * Paikalliset kuvat (public/brand/web) ovat valmiiksi oikean kokoisia
 * (`npm run brandikuvat`), joten ne palautetaan sellaisenaan.
 */

const SANITY_CDN = "https://cdn.sanity.io/";

/** Lähdekuvan mitat tiedostonimestä: …/<hash>-1200x800.jpg. */
function lahdeLeveys(pathname: string): number | null {
  const m = /-(\d+)x(\d+)\.[a-z0-9]+$/i.exec(pathname);
  return m ? Number(m[1]) : null;
}

export default function sanityImageLoader({ src, width, quality }: ImageLoaderProps): string {
  if (!src.startsWith(SANITY_CDN)) {
    // Leveys mukaan, jotta next/image ei varoita loaderista, joka ei käytä sitä.
    return `${src}${src.includes("?") ? "&" : "?"}w=${width}`;
  }

  const url = new URL(src);
  const p = url.searchParams;
  const rect = p.get("rect")?.split(",").map(Number);
  const maksimi = (rect && rect.length === 4 ? rect[2] : null) ?? lahdeLeveys(url.pathname);
  const leveys = maksimi ? Math.min(width, maksimi) : width;

  const w = Number(p.get("w"));
  const h = Number(p.get("h"));
  if (w > 0 && h > 0) p.set("h", String(Math.max(1, Math.round((h * leveys) / w))));
  p.set("w", String(leveys));
  p.set("q", String(quality ?? 75));
  if (!p.has("auto")) p.set("auto", "format");
  return url.toString();
}
