import { useEffect, useId, useState } from "react";
import { useClient, type StringInputProps } from "sanity";

import { apiVersion } from "../../env";
import { haeJoukkueet } from "./joukkueet";

/**
 * Ottelun joukkuekenttä: tavallinen tekstikenttä, jossa on ehdotuslista
 * (selaimen datalist). Ehdotuksina ovat automaattisen otteluohjelman joukkueet
 * ja Studion otteluissa aiemmin käytetyt nimet, joten oikea kirjoitusasu
 * löytyy kirjoittamalla pari ensimmäistä kirjainta.
 */
export function JoukkueInput(props: StringInputProps) {
  const listaId = `joukkueet-${useId().replace(/:/g, "")}`;
  const client = useClient({ apiVersion });
  const [ehdotukset, setEhdotukset] = useState<string[]>([]);

  useEffect(() => {
    let voimassa = true;
    Promise.all([
      haeJoukkueet(),
      client
        .fetch<string[]>(`array::unique(*[_type == "ottelu"].koti + *[_type == "ottelu"].vieras)`)
        .catch(() => [] as string[]),
    ]).then(([automaattiset, kaytetyt]) => {
      if (!voimassa) return;
      const nimet = new Map<string, string>();
      for (const nimi of [...automaattiset, ...kaytetyt]) {
        const siisti = nimi?.trim();
        if (siisti && !nimet.has(siisti.toLocaleLowerCase("fi"))) nimet.set(siisti.toLocaleLowerCase("fi"), siisti);
      }
      setEhdotukset([...nimet.values()].sort((a, b) => a.localeCompare(b, "fi")));
    });
    return () => {
      voimassa = false;
    };
  }, [client]);

  return (
    <>
      {props.renderDefault({
        ...props,
        // `list` kulkee Sanityn tekstikentän kautta <input>-elementille.
        elementProps: { ...props.elementProps, list: listaId, autoComplete: "off" } as StringInputProps["elementProps"],
      })}
      <datalist id={listaId}>
        {ehdotukset.map((nimi) => (
          <option key={nimi} value={nimi} />
        ))}
      </datalist>
    </>
  );
}
