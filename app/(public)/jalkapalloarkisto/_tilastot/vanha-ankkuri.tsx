"use client";

import { useEffect } from "react";

/**
 * Ennen osiosivuja kaikki Huuhkajien (ja ulkomaisten mestareiden) taulukot
 * olivat yhdellä sivulla, ja vanhat ohjaukset sekä kirjanmerkit osoittavat
 * muotoon `/jalkapalloarkisto/huuhkajat#<slug>`. Ankkuri ei kulje
 * palvelimelle, joten 301-ohjaus ei tavoita sitä: selain siirtää lukijan
 * taulukon osiosivulle.
 */
export function VanhaAnkkuriOhjaus({ kohteet }: { kohteet: Record<string, string> }) {
  useEffect(() => {
    const ankkuri = decodeURIComponent(window.location.hash.slice(1));
    const kohde = ankkuri ? kohteet[ankkuri] : undefined;
    if (kohde) window.location.replace(`${kohde}#${ankkuri}`);
  }, [kohteet]);

  return null;
}
