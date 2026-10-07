/**
 * Sanityn tilauksen ja käyttöoikeuksien tarkistus (docs/23 Y1–Y2).
 *
 * Growth-kokeilu päättyy 26.10.2026, ja projekti siirtyy ilmaistasolle
 * (päätös 7.10.2026). Silloin muut kuin Administrator-käyttäjät muuttuvat
 * Viewereiksi ja yksityinen datasetti julkiseksi. Robottitokenin Editor-rooli
 * on sallittu myös ilmaistasolla, mutta Sanityn siirto-ohje ei kerro, säilyykö
 * se automaattisesti. Tämä tarkistus ajetaan siirron jälkeen (ja aina, kun
 * kommentit tai arvostelut lakkaavat tulemasta).
 *
 * Tarkistaa:
 *  1. tilauksen tason ja tilan
 *  2. datasetin näkyvyyden (julkinen/yksityinen)
 *  3. lomakkeiden robottitokenin roolin (kirjoitusoikeus: kommentit, arvostelut,
 *     arvosanojen laskenta, yöllinen huolto, viikkovarmuuskopio)
 *  4. käyttäjien roolit (määrät, ei nimiä)
 *  5. kirjoituksen kuivaharjoituksena (dryRun, mitään ei tallenneta), jos
 *     `.env.local`-tiedostossa on SANITY_API_WRITE_TOKEN
 *  6. sivuston etusivun
 *
 * Vaatii Sanity CLI:n kirjautumisen (`npx sanity login`). Vain luku.
 *
 * Ajo: npm run tarkista:sanity-taso
 */
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const SIVUSTO = "https://www.lahdensuomalainenklubi.com";
const LOMAKETOKEN = "Vercel - lomakkeet";
const KIRJOITTAVAT_ROOLIT = new Set(["editor", "developer", "administrator"]);

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.SANITY_TARKISTA_DATASET || "production";

function cliToken(): string | undefined {
  const polku = join(homedir(), ".config", "sanity", "config.json");
  if (!existsSync(polku)) return undefined;
  try {
    return (JSON.parse(readFileSync(polku, "utf-8")) as { authToken?: string }).authToken;
  } catch {
    return undefined;
  }
}

let virheita = 0;
function tulos(ok: boolean, kuvaus: string) {
  console.log(`${ok ? "✓" : "✗"} ${kuvaus}`);
  if (!ok) virheita++;
}
const huomio = (kuvaus: string) => console.log(`  ${kuvaus}`);

async function hallinta<T>(polku: string, token: string): Promise<T> {
  const vastaus = await fetch(`https://api.sanity.io/v2021-06-07${polku}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!vastaus.ok) throw new Error(`${polku}: HTTP ${vastaus.status}`);
  return vastaus.json() as Promise<T>;
}

type Tilaus = { planId?: string; status?: string; trialUntil?: string | null; plan?: { name?: string } };
type Datasetti = { name: string; aclMode: string };
type Token = { label: string; roles: { name: string }[] };
type Jasen = { isRobot?: boolean; roles: { name: string }[] };

async function main() {
  if (!projectId) throw new Error("NEXT_PUBLIC_SANITY_PROJECT_ID puuttuu (.env.local).");
  const token = cliToken();
  if (!token) throw new Error("Sanity CLI:n kirjautuminen puuttuu: aja ensin `npx sanity login`.");

  console.log(`Projekti ${projectId}, datasetti ${dataset}\n`);

  // 1. Tilaus
  const tilaus = await hallinta<Tilaus>(`/subscriptions/project/${projectId}`, token);
  const kokeilu = tilaus.status === "trialing";
  console.log(`Taso: ${tilaus.plan?.name ?? tilaus.planId} (${tilaus.status ?? "?"})`);
  if (kokeilu && tilaus.trialUntil) {
    huomio(`Kokeilu päättyy ${new Date(tilaus.trialUntil).toLocaleString("fi-FI", { timeZone: "Europe/Helsinki" })}.`);
  }

  // 2. Datasetin näkyvyys
  const datasetit = await hallinta<Datasetti[]>(`/projects/${projectId}/datasets`, token);
  const kohde = datasetit.find((d) => d.name === dataset);
  tulos(Boolean(kohde), `Datasetti ${dataset} on olemassa`);
  if (kohde) huomio(`Näkyvyys: ${kohde.aclMode === "public" ? "julkinen" : kohde.aclMode === "private" ? "yksityinen" : kohde.aclMode}`);

  // 3. Lomakkeiden robottitoken
  const tokenit = await hallinta<Token[]>(`/projects/${projectId}/tokens`, token);
  const lomake = tokenit.find((t) => t.label === LOMAKETOKEN);
  const lomakeRoolit = lomake?.roles.map((r) => r.name) ?? [];
  tulos(
    lomakeRoolit.some((r) => KIRJOITTAVAT_ROOLIT.has(r)),
    lomake
      ? `Token "${LOMAKETOKEN}" saa kirjoittaa (rooli: ${lomakeRoolit.join(", ") || "ei roolia"})`
      : `Token "${LOMAKETOKEN}" löytyy`,
  );
  if (lomake && !lomakeRoolit.some((r) => KIRJOITTAVAT_ROOLIT.has(r))) {
    huomio("Korjaus: sanity.io/manage → API → Tokens → Add API token, oikeus Editor. Vaihda uusi arvo");
    huomio("Verceliin muuttujaan SANITY_API_WRITE_TOKEN, julkaise uudelleen ja poista vasta sitten vanha token.");
  }
  for (const muu of tokenit.filter((t) => t !== lomake)) {
    huomio(`Muu token "${muu.label}": ${muu.roles.map((r) => r.name).join(", ") || "ei roolia"}`);
  }

  // 4. Käyttäjät
  const jasenet = await hallinta<Jasen[]>(`/projects/${projectId}/acl`, token).catch(() => null);
  if (jasenet) {
    const roolit = new Map<string, number>();
    for (const jasen of jasenet.filter((j) => !j.isRobot)) {
      for (const rooli of jasen.roles) roolit.set(rooli.name, (roolit.get(rooli.name) ?? 0) + 1);
    }
    tulos((roolit.get("administrator") ?? 0) > 0, "Projektilla on vähintään yksi Administrator");
    huomio(`Käyttäjien roolit: ${[...roolit].map(([r, n]) => `${r} ${n}`).join(", ")}`);
  }

  // 5. Kirjoitus kuivaharjoituksena
  const kirjoitus = process.env.SANITY_API_WRITE_TOKEN;
  if (kirjoitus) {
    const vastaus = await fetch(
      `https://${projectId}.api.sanity.io/v2025-08-15/data/mutate/${dataset}?dryRun=true&returnIds=true`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${kirjoitus}`, "Content-Type": "application/json" },
        body: JSON.stringify({ mutations: [{ create: { _type: "tarkistus.kuivaharjoitus", nimi: "ei tallennu" } }] }),
      },
    );
    tulos(vastaus.ok, `Kirjoitus .env.local-tokenilla onnistuu (kuivaharjoitus, HTTP ${vastaus.status})`);
  } else {
    huomio("Kirjoituksen kuivaharjoitus ohitettu: .env.local-tiedostossa ei ole SANITY_API_WRITE_TOKEN.");
  }

  // 6. Sivusto
  const sivu = await fetch(SIVUSTO, { redirect: "follow" }).catch(() => null);
  tulos(sivu?.ok === true, `Sivusto vastaa (${SIVUSTO}, HTTP ${sivu?.status ?? "ei yhteyttä"})`);

  console.log(
    virheita === 0
      ? "\nKaikki kunnossa. Testaa vielä käsin: lähetä testikommentti ja aja Vercelissä Cron Jobs → /api/varmuuskopio → Run."
      : `\n${virheita} ongelmaa. Katso korjausohjeet yllä ja docs/23 Y2.`,
  );
  process.exitCode = virheita === 0 ? 0 : 1;
}

main().catch((error) => {
  console.error(`✗ ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
