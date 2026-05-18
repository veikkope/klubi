import type { SchemaTypeDefinition } from "sanity";

import { imageWithAlt } from "./objects/imageWithAlt";
import { portableText } from "./objects/portableText";

import { sivu } from "./documents/sivu";
import { tapahtuma } from "./documents/tapahtuma";
import { uutinen } from "./documents/uutinen";
import { hallitusJasen } from "./documents/hallitusJasen";
import { kaupunki } from "./documents/kaupunki";
import { ravintola } from "./documents/ravintola";
import { ravintolaKayttajaArvostelu } from "./documents/ravintolaKayttajaArvostelu";
import { stadion } from "./documents/stadion";
import { jalkapalloTilasto } from "./documents/jalkapalloTilasto";
import { galleriaAlbumi } from "./documents/galleriaAlbumi";

import { yhteystiedot } from "./singletons/yhteystiedot";
import { navigaatio } from "./singletons/navigaatio";
import { asetukset } from "./singletons/asetukset";
import { etusivu } from "./singletons/etusivu";

export const singletonTypes = new Set([
  "yhteystiedot",
  "navigaatio",
  "asetukset",
  "etusivu",
]);

export const schemaTypes: SchemaTypeDefinition[] = [
  imageWithAlt,
  portableText,
  sivu,
  tapahtuma,
  uutinen,
  hallitusJasen,
  kaupunki,
  ravintola,
  ravintolaKayttajaArvostelu,
  stadion,
  jalkapalloTilasto,
  galleriaAlbumi,
  yhteystiedot,
  navigaatio,
  asetukset,
  etusivu,
];
