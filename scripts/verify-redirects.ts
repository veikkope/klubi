/**
 * Todentaa että jokainen vanha URL ohjautuu.
 *
 * Ajo paikallista kehityspalvelinta vasten:
 *   npm run dev            (toisessa terminaalissa)
 *   npm run verify:redirects
 *
 * Ajo preview- tai tuotantodeployta vasten:
 *   BASE_URL=https://klubi.vercel.app npm run verify:redirects
 *
 * Tarkistaa kolme asiaa:
 *  1. Jokainen lähde palauttaa 301 tai 308 (Next.js käyttää 308:aa)
 *  2. Kohde on se mitä lib/redirects.ts lupaa
 *  3. Kohde itse ei palauta 404:ää — ohjaus kuolleeseen sivuun on yhtä paha
 *     kuin puuttuva ohjaus
 */
import { legacyRedirects } from "../lib/redirects";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const CONCURRENCY = 8;

/**
 * Kaksi eri vikaluokkaa, jotka on pidettävä erillään:
 *
 *  - `redirect`  Ohjaus itse on rikki. Aina vakava.
 *  - `content`   Ohjaus toimii, mutta kohdesivulle ei ole vielä sisältöä.
 *                Ennen sisältömigraatiota tämä on odotettu tila; ennen
 *                julkaisua sen on oltava nolla.
 */
type FailureKind = "redirect" | "content";

interface Failure {
  source: string;
  reason: string;
  kind: FailureKind;
}

async function head(url: string): Promise<{ status: number; location: string | null }> {
  const res = await fetch(url, {
    redirect: "manual",
    headers: { "User-Agent": "KlubiRedirectVerifier/1.0" },
    signal: AbortSignal.timeout(15_000),
  });
  return { status: res.status, location: res.headers.get("location") };
}

/** Vertaa polkuja jättäen huomiotta isäntänimen ja ankkurin. */
function samePath(actual: string, expected: string): boolean {
  const normalise = (value: string) =>
    value.replace(/^https?:\/\/[^/]+/, "").split("#")[0];
  return normalise(actual) === normalise(expected);
}

async function checkOne(
  source: string,
  destination: string,
  checkedTargets: Map<string, number>,
): Promise<Failure | null> {
  try {
    const { status, location } = await head(`${BASE_URL}${source}`);

    if (status !== 301 && status !== 308) {
      return { source, kind: "redirect", reason: `odotettiin 301/308, saatiin ${status}` };
    }
    if (!location) {
      return { source, kind: "redirect", reason: "ohjaus ilman Location-otsaketta" };
    }
    if (!samePath(location, destination)) {
      return {
        source,
        kind: "redirect",
        reason: `ohjaa osoitteeseen ${location}, odotettiin ${destination}`,
      };
    }

    // Tarkistetaan kohde kerran per uniikki osoite, ei kerran per lähde.
    if (!checkedTargets.has(destination)) {
      const target = await head(`${BASE_URL}${destination}`);
      checkedTargets.set(destination, target.status);
    }
    const targetStatus = checkedTargets.get(destination)!;
    if (targetStatus === 404) {
      return { source, kind: "content", reason: `kohteella ${destination} ei ole sisältöä` };
    }

    return null;
  } catch (error) {
    return {
      source,
      kind: "redirect",
      reason: error instanceof Error ? error.message : String(error),
    };
  }
}

async function main() {
  console.log(`Todennetaan ${legacyRedirects.length} ohjausta osoitetta ${BASE_URL} vasten\n`);

  const failures: Failure[] = [];
  const checkedTargets = new Map<string, number>();
  const queue = [...legacyRedirects];

  async function worker() {
    while (queue.length > 0) {
      const entry = queue.shift();
      if (!entry) break;
      const source = String(entry.source);
      const destination = String(entry.destination);
      const failure = await checkOne(source, destination, checkedTargets);
      if (failure) {
        failures.push(failure);
        process.stdout.write("x");
      } else {
        process.stdout.write(".");
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  console.log("\n");

  const broken = failures.filter((f) => f.kind === "redirect");
  const missingContent = failures.filter((f) => f.kind === "content");
  const bySource = (a: Failure, b: Failure) => a.source.localeCompare(b.source, "fi");

  console.log(
    `Ohjauksia ............... ${legacyRedirects.length}\n` +
      `Toimii .................. ${legacyRedirects.length - broken.length}\n` +
      `Rikki ................... ${broken.length}\n` +
      `Kohteella ei sisältöä ... ${missingContent.length}\n`,
  );

  if (missingContent.length > 0) {
    console.warn(
      `HUOM: ${missingContent.length} ohjausta osoittaa sivulle jota ei vielä ole.\n` +
        `Ennen sisältömigraatiota tämä on odotettua. ENNEN JULKAISUA sen on oltava 0.\n`,
    );
    for (const failure of missingContent.sort(bySource)) {
      console.warn(`  ${failure.source} → ${failure.reason}`);
    }
    console.warn("");
  }

  if (broken.length === 0) {
    console.log("Jokainen ohjaus palauttaa 301/308 oikeaan osoitteeseen.");
    // Sisällön puuttuminen ei kaada ajoa: se on migraation tila, ei ohjausvika.
    return;
  }

  console.error(`${broken.length} ohjausta on rikki:\n`);
  for (const failure of broken.sort(bySource)) {
    console.error(`  ${failure.source}\n    ${failure.reason}`);
  }
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
