/**
 * YouTube-osoitteiden tulkinta sisällön videolohkolle (Portable Text,
 * components/youtube-video.tsx). Sihteeri liittää osoitteen sellaisenaan
 * selaimen osoiteriviltä tai YouTuben Jaa-painikkeesta, joten kaikki
 * yleiset muodot hyväksytään.
 */

export type YoutubeVideo = {
  /** 11 merkin videotunnus. */
  id: string;
  /** Aloituskohta sekunteina (osoitteen t= tai start=), tai null. */
  alku: number | null;
};

const ID = /^[A-Za-z0-9_-]{11}$/;
const YOUTUBE_HOSTIT = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
]);

/** "90", "90s", "1m30s", "1h2m3s" → sekunnit. */
function sekunnit(arvo: string | null): number | null {
  if (!arvo) return null;
  if (/^\d+s?$/.test(arvo)) return Number.parseInt(arvo, 10) || null;
  const osat = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/.exec(arvo);
  if (!osat) return null;
  const [, h = "0", m = "0", s = "0"] = osat;
  const yht = Number(h) * 3600 + Number(m) * 60 + Number(s);
  return yht > 0 ? yht : null;
}

/** Tulkitsee YouTube-osoitteen; null, jos osoite ei ole YouTube-video. */
export function tulkitseYoutube(osoite: string | null | undefined): YoutubeVideo | null {
  if (!osoite) return null;
  let url: URL;
  try {
    url = new URL(osoite.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;

  const host = url.hostname.toLowerCase();
  const polku = url.pathname.split("/").filter(Boolean);
  let id: string | undefined;
  if (host === "youtu.be") {
    id = polku[0];
  } else if (YOUTUBE_HOSTIT.has(host)) {
    if (polku[0] === "watch") id = url.searchParams.get("v") ?? undefined;
    else if (["embed", "shorts", "live", "v"].includes(polku[0])) id = polku[1];
  }
  if (!id || !ID.test(id)) return null;

  return { id, alku: sekunnit(url.searchParams.get("t") ?? url.searchParams.get("start")) };
}

/** Upotusosoite: youtube-nocookie.com ei aseta evästeitä ennen toistoa. */
export function upotusOsoite({ id, alku }: YoutubeVideo): string {
  const haku = new URLSearchParams({ autoplay: "1", rel: "0" });
  if (alku) haku.set("start", String(alku));
  return `https://www.youtube-nocookie.com/embed/${id}?${haku}`;
}

/** Katseluosoite YouTubessa (linkki ilman JavaScriptiä ja Studion esikatselu). */
export function katseluOsoite({ id, alku }: YoutubeVideo): string {
  return `https://www.youtube.com/watch?v=${id}${alku ? `&t=${alku}s` : ""}`;
}

/** Esikatselukuva. hqdefault on olemassa jokaiselle videolle (maxres ei aina). */
export function esikatselukuva(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}
