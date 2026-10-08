import { Card, Stack, Text } from "@sanity/ui";
import { useFormValue } from "sanity";

import { osioSivu } from "../../../lib/osiosivut";

/**
 * Osion sivun ohjelaatikko lomakkeen alussa (docs/24 askel 3). Kenttä
 * `osionOhje` ei tallenna mitään: tämä vain kertoo, mitä sivulla muokataan ja
 * mikä tulee sivulle automaattisesti. Näkyy vain osioiden sivuilla
 * (sivu.ts, `hidden`).
 */
export function OsioSivunOhje() {
  const slug = useFormValue(["slug", "current"]) as string | undefined;
  const o = osioSivu(slug);
  if (!o) return null;
  return (
    <Card tone="primary" padding={3} radius={2} border>
      <Stack space={3}>
        <Text size={1}>
          Tämä on sivuston osion sivu osoitteessa /{o.slug}. Sivun lista tai taulukot tulevat
          automaattisesti. Tässä muokkaat otsikkoa, Tiivistelmää (näkyy otsikon alla johdantona) ja
          hakukonetekstejä (välilehti Hakukoneet ja jako). Sivua ei voi poistaa eikä sen osoitetta
          muuttaa.
        </Text>
        {o.ohje && <Text size={1}>{o.ohje}</Text>}
      </Stack>
    </Card>
  );
}
