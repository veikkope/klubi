/**
 * Kirjoitustoken migraatioskripteille: `.env.local`-tiedoston
 * `SANITY_API_WRITE_TOKEN`, tai sen puuttuessa Sanity CLI:n kirjautuminen
 * (`npx sanity login` → ~/.config/sanity/config.json). Tokenia ei tulosteta.
 */
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export function sanityWriteToken(): string | undefined {
  if (existsSync(".env.local")) process.loadEnvFile(".env.local");
  if (process.env.SANITY_API_WRITE_TOKEN) return process.env.SANITY_API_WRITE_TOKEN;
  const cli = join(homedir(), ".config", "sanity", "config.json");
  if (!existsSync(cli)) return undefined;
  try {
    return (JSON.parse(readFileSync(cli, "utf-8")) as { authToken?: string }).authToken || undefined;
  } catch {
    return undefined;
  }
}
