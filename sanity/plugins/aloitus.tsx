import { HomeIcon } from "@sanity/icons";
import { definePlugin } from "sanity";

import { Aloitus } from "../components/aloitus/Aloitus";

/**
 * Aloitus-työkalu (docs/24 askel 7). Ensimmäinen plugin sanity.config.ts:ssä,
 * joten /studio avautuu tähän.
 */
export const aloitus = definePlugin({
  name: "klubi-aloitus",
  tools: [{ name: "aloitus", title: "Aloitus", icon: HomeIcon, component: Aloitus }],
});
