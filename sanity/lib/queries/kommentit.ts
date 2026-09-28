/**
 * Uutisen alla näkyvät kommentit ja veikkaukset (docs/15). Piilotetut eivät näy.
 * Vanhimmasta uusimpaan, kuten blogissa.
 */
import { defineQuery } from "next-sanity";

export const kommentitQuery = defineQuery(`
  *[_type == "kommentti" && uutinen._ref == $uutinenId && piilotettu != true]
    | order(lahetetty asc){
      _id,
      nimi,
      teksti,
      veikkaus{ jarjestys, maalikuningas },
      lahetetty,
      lahde
    }
`);
