/**
 * Sovellusnäkymät (ravintola-arvostelu): koko ruutu ilman sivuston ylä- ja
 * alapalkkia, jotta puhelimella näkymä tuntuu sovellukselta. Kotinäytöltä
 * avattuna (app/manifest.ts) selaimen palkitkin puuttuvat. Näkymä tuo oman
 * kehyksensä (takaisin, sulje, alapalkki).
 */
export default function SovellusLayout({ children }: { children: React.ReactNode }) {
  return (
    // id vastaa juurilayoutin "Siirry sisältöön" -linkkiä.
    <main id="sisalto" className="flex flex-1 flex-col">
      {children}
    </main>
  );
}
