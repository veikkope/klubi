import { permanentRedirect, redirect } from "next/navigation";

import { siistiHaku } from "@/lib/haku";
import { documentHref } from "@/lib/path";
import { bloginTunniste, tunnisteHref, tunnisteSlug } from "@/lib/tunnisteet";
import { sanityFetch } from "@/sanity/lib/fetch";

import { haeTunniste } from "../../(public)/uutiset/_lib/tunnisteet";

/**
 * Vanhat blogiosoitteet, joita next.config-ohjauksissa ei ole (docs/14 §5):
 *  - kirjoitukset, jotka on tuotu `npm run redirects` -ajon jälkeen
 *    (`sync:blogspot:production`): haetaan Sanitystä `blogspot.polku`-kentällä,
 *    joten ohjaus toimii heti ilman deployta
 *  - blogin tunnistesivu /search/label/Huuhkajat → /uutiset/tunniste/huuhkajat
 *    (308), jos tunniste on sivustolla; muuten uutislistaan
 *  - blogin haku /search?q=… → uutishaku /uutiset?q=…
 *  - blogin muut sivut (etusivu, arkistot) → uutislista
 *
 * Bloggerin teema ohjaa kävijän osoitteeseen /blogspot/<blogin polku>.
 */
export async function GET(request: Request, { params }: { params: Promise<{ polku?: string[] }> }) {
  // Valinnainen catch-all: myös pelkkä /blogspot (blogin etusivu).
  const { polku = [] } = await params;
  // Next.js antaa segmentit jo purettuina; uusi purku kaatuisi yksinäiseen
  // %-merkkiin (500). Purku vain, jos segmentti on yhä koodattu ja kelvollinen.
  const blogPolku = `/${polku.map(purettu).join("/")}`;
  // Tunnisteen nimi alkuperäisestä, koodatusta polusta: näin nimen %- ja +-merkit säilyvät.
  const koodattu = new URL(request.url).pathname.replace(/^\/blogspot/, "") || "/";

  if (blogPolku.endsWith(".html")) {
    const uutinen = await sanityFetch<{ _id: string; slug: string } | null>({
      query: /* groq */ `*[_type == "uutinen" && blogspot.polku == $polku][0]{ _id, "slug": slug.current }`,
      params: { polku: blogPolku },
      tags: ["uutinen"],
      fallback: null,
    });
    const kohde = uutinen?.slug ? documentHref({ _id: uutinen._id, _type: "uutinen", slug: uutinen.slug }) : null;
    if (kohde) permanentRedirect(kohde);
  }

  const tunniste = bloginTunniste(koodattu);
  if (tunniste) {
    const loytyi = await haeTunniste(tunnisteSlug(tunniste));
    const kohde = loytyi ? tunnisteHref(loytyi.nimi) : null;
    if (kohde) permanentRedirect(kohde);
  }

  if (blogPolku === "/search" || blogPolku === "/search/") {
    const haku = siistiHaku(new URL(request.url).searchParams.get("q"));
    if (haku) redirect(`/uutiset?${new URLSearchParams({ q: haku })}`);
  }

  // Tuntematon kirjoitus tai blogin muu sivu. Väliaikainen (307): jos kirjoitus
  // tuodaan myöhemmin, selain ei ole tallentanut pysyvää ohjausta uutislistaan.
  redirect("/uutiset");
}

function purettu(segmentti: string): string {
  if (!/%[0-9a-f]{2}/i.test(segmentti)) return segmentti;
  try {
    return decodeURIComponent(segmentti);
  } catch {
    return segmentti;
  }
}
