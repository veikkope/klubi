import { cn } from "@/lib/cn";

/**
 * Linkin suuntanuoli, joka liikahtaa 3 px osoittamaansa suuntaan, kun
 * linkkiä tai korttia osoitetaan. Sama liike kaikissa nuolilinkeissä.
 *
 * Liike laukeaa nimetystä Tailwind-ryhmästä, jonka kutsuja lisää linkkiin:
 * - `ryhma="linkki"`: linkillä luokka `group/linkki` (tekstilinkit, listat)
 * - `ryhma="kortti"`: kortilla luokka `group/kortti` (`Card`, `RestaurantCard`)
 *
 * Nuoli on `inline-block`, joten linkin alleviivaus ei jatku sen alle.
 * Koriste: ruudunlukija kuulee pelkän linkin tekstin.
 */
const siirto = {
  oikea: {
    linkki: "group-hover/linkki:translate-x-[3px]",
    kortti: "group-hover/kortti:translate-x-[3px]",
  },
  vasen: {
    linkki: "group-hover/linkki:-translate-x-[3px]",
    kortti: "group-hover/kortti:-translate-x-[3px]",
  },
} as const;

export function Nuoli({
  ryhma = "linkki",
  suunta = "oikea",
  className,
}: {
  ryhma?: "linkki" | "kortti";
  suunta?: "oikea" | "vasen";
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block transition-transform duration-200 ease-out",
        siirto[suunta][ryhma],
        className,
      )}
    >
      {suunta === "oikea" ? "→" : "←"}
    </span>
  );
}
