import type { SchemaTypeDefinition } from "sanity";

import { imageWithAlt } from "./objects/imageWithAlt";
import { galleriaKuva } from "./objects/galleriaKuva";
import { portableText } from "./objects/portableText";
import { kokoonpano } from "./objects/kokoonpano";
import { youtubeVideo } from "./objects/youtubeVideo";
import { paivattyKuva } from "./objects/paivattyKuva";

import { sivu } from "./documents/sivu";
import { tapahtuma } from "./documents/tapahtuma";
import { ottelu } from "./documents/ottelu";
import { uutinen } from "./documents/uutinen";
import { uutisKategoria } from "./documents/uutisKategoria";
import { hallitusJasen } from "./documents/hallitusJasen";
import { kaupunki } from "./documents/kaupunki";
import { ravintola } from "./documents/ravintola";
import { ravintolaKayttajaArvostelu } from "./documents/ravintolaKayttajaArvostelu";
import { klubilainen } from "./documents/klubilainen";
import { klubiArvio } from "./documents/klubiArvio";
import { stadion } from "./documents/stadion";
import { jalkapalloTilasto } from "./documents/jalkapalloTilasto";
import { galleriaAlbumi } from "./documents/galleriaAlbumi";
import { klubiToiminta } from "./documents/klubiToiminta";
import { arvokisa } from "./documents/arvokisa";
import { pelaaja } from "./documents/pelaaja";
import { lehtileike } from "./documents/lehtileike";
import { kommentti } from "./documents/kommentti";
import { varmuuskopio } from "./documents/varmuuskopio";

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
  galleriaKuva,
  portableText,
  kokoonpano,
  youtubeVideo,
  paivattyKuva,
  sivu,
  tapahtuma,
  ottelu,
  uutinen,
  uutisKategoria,
  hallitusJasen,
  kaupunki,
  ravintola,
  ravintolaKayttajaArvostelu,
  klubilainen,
  klubiArvio,
  stadion,
  jalkapalloTilasto,
  galleriaAlbumi,
  klubiToiminta,
  arvokisa,
  pelaaja,
  lehtileike,
  kommentti,
  varmuuskopio,
  yhteystiedot,
  navigaatio,
  asetukset,
  etusivu,
];
