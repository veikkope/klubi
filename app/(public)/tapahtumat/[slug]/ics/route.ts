import { NextResponse } from "next/server";
import { stegaClean } from "next-sanity";
import { toPlainText, type PortableTextBlock } from "@portabletext/react";

import { buildIcs } from "@/lib/ics";
import { absoluteUrl } from "@/lib/site";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  tapahtumaDetailQuery,
  type TapahtumaDetail,
} from "@/sanity/lib/queries/uutiset";

/**
 * Tapahtuma kalenteritiedostona. Linkitetty tapahtumasivulta
 * ("Lisää kalenteriin") — vastaus on aina liite, ei selattava sivu.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  // Kalenteritiedosto ei ole React-näkymä: luonnosnäkymän stega-merkit pois.
  const event = stegaClean(
    await sanityFetch<TapahtumaDetail | null>({
      query: tapahtumaDetailQuery,
      params: { slug },
      tags: ["tapahtuma", `tapahtuma:${slug}`],
      fallback: null,
    }),
  );

  if (!event) {
    return new NextResponse("Tapahtumaa ei löydy.", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const body = event.description
    ? toPlainText(event.description as PortableTextBlock[])
    : (event.tiivistelma ?? "");

  const ics = buildIcs({
    uid: `${event._id}@lahdensuomalainenklubi.com`,
    url: absoluteUrl(`/tapahtumat/${event.slug}`),
    title: event.title,
    description: body ? body.slice(0, 1000) : undefined,
    location: event.location ?? undefined,
    startsAt: event.startsAt,
    endsAt: event.endsAt ?? undefined,
  });

  return new NextResponse(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${event.slug}.ics"`,
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
