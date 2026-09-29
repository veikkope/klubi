/**
 * Päivittää etusivun, navigaation ja otteluohjelman tyylioppaan "Sivut v3"
 * mukaiseksi (docs/design-handoff/, docs/04).
 *
 * Ajo:   npx tsx --env-file=.env.local scripts/migrate-etusivu-v3.ts
 * Kohde: Sanity development (production päivitetään export/import-parilla,
 *        ks. CLAUDE.md).
 *
 * Idempotentti: `set` korvaa kentät, ottelu luodaan kiinteällä _id:llä.
 * Esittelylohkon teksti ja kuva säilyvät — vain otsikko, yläotsake ja linkki
 * vaihtuvat.
 */
import { createClient } from "@sanity/client";

const DATASET = "development";

type Block = { _type: string; _key: string; [k: string]: unknown };

async function main() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!projectId || !token) {
    throw new Error("NEXT_PUBLIC_SANITY_PROJECT_ID ja SANITY_API_WRITE_TOKEN tarvitaan (.env.local).");
  }
  const client = createClient({ projectId, dataset: DATASET, token, apiVersion: "2024-10-01", useCdn: false });

  // ── Navigaatio ──────────────────────────────────────────────────────────
  const item = (key: string, label: string, href: string, children?: [string, string][]) => ({
    _key: key,
    _type: "navItem",
    label,
    href,
    highlight: false,
    ...(children && {
      children: children.map(([l, h], i) => ({ _key: `${key}-${i}`, _type: "navChild", label: l, href: h })),
    }),
  });

  const nav = await client.fetch<{ items?: { _type?: string; children?: { _type?: string }[] }[] } | null>(
    `*[_id == "navigaatio"][0]{ items[]{ _type, children[]{ _type } } }`,
  );
  // Käytetään olemassa olevia _type-nimiä, jos skeema on antanut ne.
  const itemType = nav?.items?.[0]?._type;
  const childType = nav?.items?.find((i) => i.children?.length)?.children?.[0]?._type;
  const fix = <T extends { _type?: string; children?: { _type?: string }[] }>(i: T): T => {
    const out = { ...i } as T;
    if (itemType) out._type = itemType;
    else delete out._type;
    if (out.children) {
      out.children = out.children.map((c) => {
        const cc = { ...c };
        if (childType) cc._type = childType;
        else delete cc._type;
        return cc;
      });
    }
    return out;
  };

  const items = [
    item("jalkapallo", "Jalkapallo", "/uutiset", [
      ["Kentältä ja katsomosta", "/uutiset"],
      ["Jalkapalloarkisto", "/jalkapalloarkisto"],
      ["Huuhkajat", "/jalkapalloarkisto/huuhkajat"],
      ["Arvokisat", "/jalkapalloarkisto/arvokisat"],
      ["Suomen mestarit", "/jalkapalloarkisto/mestarit"],
      ["Pelaajat", "/jalkapalloarkisto/pelaajat"],
      ["Stadionit", "/jalkapalloarkisto/stadionit"],
    ]),
    item("ottelut", "Ottelut", "/ottelut"),
    item("ravintolat", "Ravintola-arviot", "/ravintolat"),
    item("tapahtumat", "Tapahtumat", "/tapahtumat"),
    item("klubista", "Klubista", "/klubi", [
      ["Esittely", "/klubi"],
      ["Toiminta", "/klubi/toiminta"],
      ["Hallitus", "/klubi/hallitus"],
      ["Palloveikkaus", "/klubi/palloveikkaus"],
      ["Yhteystiedot", "/klubi/yhteystiedot"],
    ]),
  ].map(fix);

  await client.patch("navigaatio").set({ items }).commit();
  console.log("✓ navigaatio");

  // ── Etusivu ─────────────────────────────────────────────────────────────
  const etusivu = await client.fetch<{ blocks?: Block[] } | null>(`*[_id == "etusivu"][0]{ blocks }`);
  const oldEsittely = etusivu?.blocks?.find((b) => b._type === "esittely");

  const blocks: Block[] = [
    {
      _type: "otteluohjelma",
      _key: "otteluohjelma",
      ottelutHeading: "Tulevat ottelut",
      ottelutCount: 4,
      tapahtumatHeading: "Nähdään",
      tapahtumatCount: 3,
    },
    { _type: "uutiset", _key: "uutiset", eyebrow: "Jalkapallo", heading: "Kentältä ja katsomosta", count: 4 },
    {
      _type: "ravintolatSpotlight",
      _key: "ravintolat",
      eyebrow: "Ravintola-arviot",
      heading: "Missä pelipäivänä syödään",
      count: 3,
    },
    {
      ...(oldEsittely ?? {}),
      _type: "esittely",
      _key: oldEsittely?._key ?? "esittely",
      eyebrow: "Klubista",
      heading: "Lahtelainen klubi, jonka yhdistää suomalainen jalkapallo",
      ctaLabel: "Lue lisää klubista",
      ctaHref: "/klubi",
    },
  ];

  await client
    .patch("etusivu")
    .set({
      heroEyebrow: "Lahden Suomalainen Klubi ry",
      heroTitle: "Suomalaisen jalkapallon ystävien klubi",
      heroDescription:
        "Seuraamme kotimaista jalkapalloa kentän laidalta ja katsomosta, kirjoitamme otteluista ja kannattajakulttuurista – ja kerromme, missä pelimatkoilla kannattaa syödä.",
      heroCtas: [
        { _key: "ottelut", label: "Tulevat ottelut", href: "/ottelut", primary: true },
        { _key: "klubi", label: "Lue klubista", href: "/klubi", primary: false },
      ],
      blocks,
    })
    .commit();
  console.log("✓ etusivu");

  // ── Vanha "Seuraava ottelu" → Ottelu-dokumentti ─────────────────────────
  const seuraava = await client.fetch<{ ottelu?: string; kilpailu?: string; aika?: string } | null>(
    `*[_id == "etusivu"][0].seuraavaOttelu`,
  );
  const teams = seuraava?.ottelu?.split(/\s+[-–]\s+/);
  if (seuraava?.aika && teams?.length === 2) {
    await client.createOrReplace({
      _id: "ottelu-seuraava-etusivulta",
      _type: "ottelu",
      aika: seuraava.aika,
      koti: teams[0],
      vieras: teams[1],
      kilpailu: seuraava.kilpailu ?? null,
      stadion: "Olympiastadion, Helsinki",
      klubiPaikalla: false,
      vierasmatka: false,
    });
    console.log(`✓ ottelu: ${teams[0]} – ${teams[1]}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
