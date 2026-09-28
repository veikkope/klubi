import type { SchemaTypeDefinition } from "sanity";

import { imageWithAlt } from "./objects/imageWithAlt";
import { portableText } from "./objects/portableText";

import { sivu } from "./documents/sivu";
import { tapahtuma } from "./documents/tapahtuma";
import { ottelu } from "./documents/ottelu";
import { uutinen } from "./documents/uutinen";
import { hallitusJasen } from "./documents/hallitusJasen";
import { kaupunki } from "./documents/kaupunki";
import { ravintola } from "./documents/ravintola";
import { ravintolaKayttajaArvostelu } from "./documents/ravintolaKayttajaArvostelu";
import { stadion } from "./documents/stadion";
import { jalkapalloTilasto } from "./documents/jalkapalloTilasto";
import { galleriaAlbumi } from "./documents/galleriaAlbumi";
import { klubiToiminta } from "./documents/klubiToiminta";
import { arvokisa } from "./documents/arvokisa";
import { pelaaja } from "./documents/pelaaja";
import { kommentti } from "./documents/kommentti";

import { yhteystiedot } from "./singletons/yhteystiedot";
import { navigaatio } from "./singletons/navigaatio";
import { asetukset } from "./singletons/asetukset";
import { etusivu } from "./singletons/etusivu";
import { kommenttikoodi } from "./singletons/kommenttikoodi";

export const singletonTypes = new Set([
  "yhteystiedot",
  "navigaatio",
  "asetukset",
  "etusivu",
  "kommenttikoodi",
]);

export const schemaTypes: SchemaTypeDefinition[] = [
  imageWithAlt,
  portableText,
  sivu,
  tapahtuma,
  ottelu,
  uutinen,
  hallitusJasen,
  kaupunki,
  ravintola,
  ravintolaKayttajaArvostelu,
  stadion,
  jalkapalloTilasto,
  galleriaAlbumi,
  klubiToiminta,
  arvokisa,
  pelaaja,
  kommentti,
  yhteystiedot,
  navigaatio,
  asetukset,
  etusivu,
  kommenttikoodi,
];
