import { permanentRedirect, redirect } from "next/navigation";

import { documentHref } from "@/lib/path";
import { sanityFetch } from "@/sanity/lib/fetch";

/**
 * Vanhat blogiosoitteet, joita next.config-ohjauksissa ei ole (docs/14 §5):
 *  - kirjoitukset, jotka on tuotu `npm run redirects` -ajon jälkeen
 *    (`sync:blogspot:production`): haetaan Sanitystä `blogspot.polku`-kentällä,
 *    joten ohjaus toimii heti ilman deployta
 *  - blogin muut sivut (etusivu, tunnisteet, arkistot) → uutislista
 *
 * Bloggerin teema ohjaa kävijän osoitteeseen /blogspot/<blogin polku>.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ polku?: string[] }> }) {
  // Valinnainen catch-all: myös pelkkä /blogspot (blogin etusivu).
  const { polku = [] } = await params;
  const blogPolku = `/${polku.map(decodeURIComponent).join("/")}`;

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

  // Tuntematon kirjoitus tai blogin muu sivu. Väliaikainen (307): jos kirjoitus
  // tuodaan myöhemmin, selain ei ole tallentanut pysyvää ohjausta uutislistaan.
  redirect("/uutiset");
}
