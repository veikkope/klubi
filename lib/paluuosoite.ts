/**
 * Paluuosoite käyttäjän antamasta polusta (esim. `?paluu=/uutiset`), rajattuna
 * sivuston omaan originiin.
 *
 * Merkkijonotarkistus (`startsWith("/")`) ei riitä: URL-jäsennin poistaa
 * sarkaimet ja rivinvaihdot, joten `/\t/example.com` muuttuu muotoon
 * `//example.com` ja ohjaisi vieraalle sivustolle (avoin uudelleenohjaus).
 * Siksi polku jäsennetään ensin ja originia verrataan vasta sen jälkeen.
 */
export function omaPaluuosoite(paluu: string | null | undefined, pyynto: string): URL {
  const base = new URL(pyynto);
  const etusivu = new URL("/", base);
  if (!paluu || !paluu.startsWith("/")) return etusivu;
  let target: URL;
  try {
    target = new URL(paluu, base);
  } catch {
    return etusivu;
  }
  if (target.origin !== base.origin) return etusivu;
  // Vain polku, haku ja ankkuri: käyttäjätiedot ja portti tulevat aina pyynnöstä.
  return new URL(`${target.pathname}${target.search}${target.hash}`, base);
}
