import { defineConfig, type DocumentActionComponent } from "sanity";
import { structureTool } from "sanity/structure";
import { presentationTool } from "sanity/presentation";
import { visionTool } from "@sanity/vision";
import { fiFILocale } from "@sanity/locale-fi-fi";

import { apiVersion, dataset, projectId } from "./sanity/env";
import { schemaTypes, singletonTypes } from "./sanity/schemas";
import { defaultDocumentNode, structure } from "./sanity/structure";
import { locations } from "./sanity/presentation";
import { HylkaaArvostelu } from "./sanity/actions/hylkaa-arvostelu";
import { HyvaksyJaLuoRavintola, ilmanJulkaisuaEhdotukselle } from "./sanity/actions/hyvaksy-ja-luo-ravintola";
import { PiilotaKommentti, PoistaKommentti } from "./sanity/actions/kommentin-moderointi";
import { PalautaVarmuuskopiosta } from "./sanity/actions/palauta-varmuuskopiosta";
import { lukitulleSivulle } from "./sanity/actions/lukittu-sivu";
import { kopioiPohjaksi, varoitaVanhoistaOsoitteista } from "./sanity/actions/vanhat-osoitteet";
import { PIILOTETUT_POHJAT, pohjat } from "./sanity/pohjat";
import { merkitTyypille } from "./sanity/merkit";
import { aloitus } from "./sanity/plugins/aloitus";
import { ohjeet } from "./sanity/plugins/ohjeet";

export default defineConfig({
  name: "klubi",
  title: "Lahden Suomalainen Klubi ry",
  basePath: "/studio",
  projectId: projectId || "",
  dataset,
  schema: {
    types: schemaTypes,
    // Singletoneja, varmuuskopioita ja sivuston tilaa ei luoda käsin; osion sivun ja valmiit pohjat (sanity/pohjat.ts).
    templates: pohjat,
  },
  document: {
    // Tilamerkit (Ajastettu, Tarkistettava, Odottaa toista arvioijaa, Piilotettu)
    // Sanityn omien perään (docs/24 askel 10, sanity/merkit.ts).
    badges: (prev, { schemaType }) => [...prev, ...merkitTyypille(schemaType)],
    actions: (input, context) => {
      if (context.schemaType === "ravintolaKayttajaArvostelu") {
        // Ensisijainen toiminto, kun kävijä ehdotti uutta ravintolaa. "Hylkää
        // arvostelu" korvaa tavallisen Poista-toiminnon, koska se poistaa myös
        // kuvat (docs/18). Sijoitetaan heti julkaisun jälkeen; ehdotukselta
        // Julkaise on piilossa, joten Hylkää on silloin valikon ensimmäisenä.
        const actions = input
          .filter(({ action }) => action !== "delete")
          .map((toiminto) => (toiminto.action === "publish" ? ilmanJulkaisuaEhdotukselle(toiminto) : toiminto));
        const publishAt = actions.findIndex(({ action }) => action === "publish");
        // Jos julkaisutoimintoa ei ole, loppuun: hylkäys ei saa olla päätoiminto.
        actions.splice(publishAt === -1 ? actions.length : publishAt + 1, 0, HylkaaArvostelu);
        return [HyvaksyJaLuoRavintola, ...actions];
      }
      if (context.schemaType === "kommentti") {
        // Piilotus ensisijaisena: muuttaa julkaistua versiota suoraan, joten
        // erillistä Julkaise-painallusta ei tarvita. Pysyvä poisto omalla
        // vahvistuksellaan tavallisen Poista-toiminnon tilalle.
        const actions = input.filter(({ action }) => action !== "delete" && action !== "duplicate");
        return [PiilotaKommentti, ...actions, PoistaKommentti];
      }
      // Varmuuskopio on vain luettava: ladataan, ei muokata, julkaista eikä poisteta käsin.
      if (context.schemaType === "varmuuskopio") return [];
      // Sivuston tila on ajastusten kirjoittama loki (docs/24 askel 7): ei toimintoja.
      if (context.schemaType === "sivustonTila") return [];
      if (singletonTypes.has(context.schemaType)) {
        // Julkaisun peruminen veisi etusivulta, valikosta ym. sisällön ja
        // korvaisi sen koodin oletuksilla, joten se on poissa kuten poisto.
        return [
          ...input.filter(({ action }) => action !== "duplicate" && action !== "delete" && action !== "unpublish"),
          PalautaVarmuuskopiosta,
        ];
      }
      // Poisto ja Poista julkaisu varoittavat vanhoista osoitteista, ja Kopioi
      // on "Kopioi pohjaksi" (docs/24 askel 9, sanity/actions/vanhat-osoitteet.tsx).
      const turvallinen = (toiminto: DocumentActionComponent) =>
        toiminto.action === "duplicate"
          ? kopioiPohjaksi(toiminto)
          : toiminto.action === "delete" || toiminto.action === "unpublish"
            ? varoitaVanhoistaOsoitteista(toiminto)
            : toiminto;
      // Lukittujen sivujen poisto, julkaisun peruminen ja kopiointi pois käytöstä
      // (docs/23 Y21, docs/24 askel 3). Lukitus kääritään uloimmaksi.
      if (context.schemaType === "sivu") {
        return [
          ...input.map((toiminto) =>
            toiminto.action === "duplicate" || toiminto.action === "delete" || toiminto.action === "unpublish"
              ? lukitulleSivulle(turvallinen(toiminto))
              : toiminto,
          ),
          PalautaVarmuuskopiosta,
        ];
      }
      // Vanhemman kuin 3 päivän virheen korjaus ilman kehittäjää (ilmaistason
      // historia on 3 päivää, docs/23 Y32). Toiminto piilottaa itsensä tyypeiltä,
      // joita ei palauteta (lib/palautus.ts).
      return [...input.map(turvallinen), PalautaVarmuuskopiosta];
    },
    newDocumentOptions: (prev, { creationContext }) => {
      // Parametria vaativat pohjat (osion sivu, ravintolan arvosana) avataan vain Studion rakenteesta.
      const nakyvat = prev.filter((templateItem) => !PIILOTETUT_POHJAT.has(templateItem.templateId));
      if (creationContext.type === "global") {
        return nakyvat.filter((templateItem) => !singletonTypes.has(templateItem.templateId));
      }
      return nakyvat;
    },
  },
  plugins: [
    // Aloitus on ensimmäinen näkymä: sivuston tila, odottavat tehtävät ja
    // puuttuvat perustiedot (docs/24 askel 7). Sisältö on sen rinnalla, ja
    // esikatselussa jokaisella dokumentilla on linkki sivulle, jolla se näkyy
    // (sanity/presentation.ts).
    aloitus(),
    structureTool({ title: "Sisältö", structure, defaultDocumentNode }),
    presentationTool({
      title: "Esikatselu",
      // Funktiomuotoinen sijaintien ratkaisija (docs/24 askel 11, sanity/presentation.ts).
      resolve: { locations },
      previewUrl: {
        preview: "/",
        previewMode: {
          enable: "/api/draft-mode/enable",
          disable: "/api/draft-mode/disable",
        },
      },
    }),
    // Ylläpito-ohje: yläpalkin Ohjeet ja dokumentin Ohje-paneeli (docs/25, lähde docs/ohje/).
    ohjeet(),
    visionTool({ defaultApiVersion: apiVersion, title: "Kyselyt (tukihenkilö)" }),
    // Studion käyttöliittymä suomeksi (CLAUDE.md: kaikki käyttöliittymäteksti suomeksi).
    fiFILocale(),
  ],
  // Kyselytyökalu vain ylläpitäjille: sihteerin (Editor) valikko pysyy selkeänä.
  tools: (prev, { currentUser }) =>
    currentUser?.roles.some((role) => role.name === "administrator")
      ? prev
      : prev.filter((tool) => tool.name !== "vision"),
});
