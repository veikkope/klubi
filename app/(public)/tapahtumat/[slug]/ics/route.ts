import { NextResponse } from "next/server";
import { toPlainText, type PortableTextBlock } from "@portabletext/react";
import { sanityFetch } from "@/sanity/lib/fetch";
import { tapahtumaBySlugQuery } from "@/sanity/lib/queries";
import { buildIcs } from "@/lib/ics";
import type { TapahtumaFull } from "@/lib/types";

const SITE_URL = "https://www.lahdensuomalainenklubi.com";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const event = await sanityFetch<TapahtumaFull | null>({
    query: tapahtumaBySlugQuery,
    params: { slug },
    tags: ["tapahtuma", `tapahtuma:${slug}`],
    fallback: null,
  });

  if (!event) {
    return new NextResponse("Tapahtumaa ei löydy.", { status: 404 });
  }

  const description = event.description
    ? toPlainText(event.description as PortableTextBlock[]).slice(0, 1000)
    : undefined;

  const ics = buildIcs({
    uid: `${event._id}@lahdensuomalainenklubi.com`,
    url: `${SITE_URL}/tapahtumat/${event.slug}`,
    title: event.title,
    description,
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
