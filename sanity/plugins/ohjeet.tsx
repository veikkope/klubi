import { HelpCircleIcon } from "@sanity/icons";
import { defineDocumentInspector, definePlugin } from "sanity";
import { route } from "sanity/router";

import { OhjePaneeliLadattava, OhjeetTyokaluLadattava } from "../components/ohjeet/lataus";
import { OHJE_TYYPEILLE } from "../ohje/tyypit.generated";

/**
 * Ylläpito-ohje Studiossa (docs/25). Lähde docs/ohje/, koostus `npm run ohje`.
 *
 * - Yläpalkin työkalu Ohjeet (/studio/ohjeet/<kortti>): haku, sisällysluettelo, kortti.
 * - Dokumentin Ohje-paneeli: kortit, joiden `tyypit` sisältää dokumentin tyypin.
 *   Piilossa tyypeiltä, joille ei ole korttia. Valikon tila lasketaan kevyestä
 *   hakemistosta (tyypit.generated.ts) ilman hookeja; kortit ladataan vasta avattaessa.
 *
 * Kuvat ovat public/studio-ohje/-kansiossa eivätkä Studion importteja: `sanity
 * schema extract` lataa tämän tiedoston Nodessa.
 */
const ohjeInspector = defineDocumentInspector({
  name: "klubi-ohje",
  component: OhjePaneeliLadattava,
  useMenuItem: ({ documentType }) => ({
    title: "Ohje",
    icon: HelpCircleIcon,
    hidden: !OHJE_TYYPEILLE[documentType]?.length,
    showAsAction: true,
  }),
});

export const ohjeet = definePlugin({
  name: "klubi-ohjeet",
  tools: [
    {
      name: "ohjeet",
      title: "Ohjeet",
      icon: HelpCircleIcon,
      component: OhjeetTyokaluLadattava,
      router: route.create("/", [route.create("/:kortti")]),
    },
  ],
  document: {
    inspectors: (prev) => [...prev, ohjeInspector],
  },
});
