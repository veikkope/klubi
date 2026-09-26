"use server";

import {
  lueArvot,
  muotoileHakemus,
  onHunajapurkkiTaytetty,
  validoiHakemus,
  type HakemusArvot,
  type HakemusTila,
} from "./hakemus";
import { defaultContact } from "@/lib/defaults";
import type { ContactData } from "@/lib/types";
import { sanityFetch } from "@/sanity/lib/fetch";
import { contactQuery } from "@/sanity/lib/queries";

/**
 * Jäsenhakemuksen vastaanotto.
 *
 * **Lähetyskanava on tietoisesti kytkettävissä ympäristömuuttujilla.**
 * Sähköpostipalvelua ei ole vielä valittu eikä konfiguroitu, joten oletustila
 * on "ei käytössä": lomake kertoo sen suoraan ja ohjaa sähköpostiin. Hakemusta
 * ei kuitata vastaanotetuksi, jos sitä ei tosiasiassa toimiteta kenellekään.
 *
 * Kanava otetaan käyttöön asettamalla kaikki kolme:
 *   RESEND_API_KEY            API-avain (https://resend.com)
 *   JASENHAKEMUS_VASTAANOTTAJA  mihin hakemus lähetetään, esim. sihteerin osoite
 *   JASENHAKEMUS_LAHETTAJA      varmennettu lähettäjäosoite, esim. "Klubi <no-reply@…>"
 *
 * Integraatio on tavallinen HTTP-kutsu ilman asiakaskirjastoa: uusia
 * riippuvuuksia ei tarvita eikä palveluntarjoajan vaihto edellytä muuta kuin
 * tämän funktion sisuksen vaihtamista.
 */

function haeYhteystiedot() {
  return sanityFetch<ContactData>({
    query: contactQuery,
    tags: ["yhteystiedot"],
    fallback: defaultContact,
  });
}

async function eiKaytossaTila(arvot: HakemusArvot): Promise<HakemusTila> {
  const yhteystiedot = await haeYhteystiedot();
  const osoite = yhteystiedot.email || defaultContact.email;
  return {
    status: "eiKaytossa",
    viesti:
      `Hakemusten vastaanotto ei ole vielä käytössä — ota yhteyttä sähköpostitse: ${osoite}. ` +
      "Voit kopioida kirjoittamasi tiedot alta viestiisi.",
    arvot,
  };
}

async function lahetaSahkoposti(
  arvot: HakemusArvot,
  apiKey: string,
  vastaanottaja: string,
  lahettaja: string,
): Promise<boolean> {
  try {
    const vastaus = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: lahettaja,
        to: [vastaanottaja],
        reply_to: arvot.sahkoposti,
        subject: `Jäsenhakemus: ${arvot.etunimi} ${arvot.sukunimi}`,
        // Pelkkä teksti: hakijan syöte ei päädy HTML:ksi tulkittavaksi.
        text: muotoileHakemus(arvot),
      }),
    });
    if (!vastaus.ok) {
      console.error(
        "[jasenhakemus] lähetys epäonnistui:",
        vastaus.status,
        await vastaus.text(),
      );
      return false;
    }
    return true;
  } catch (error) {
    console.error("[jasenhakemus] lähetys epäonnistui:", error);
    return false;
  }
}

export async function lahetaJasenhakemus(
  _edellinen: HakemusTila,
  formData: FormData,
): Promise<HakemusTila> {
  const arvot = lueArvot(formData);

  // Hunajapurkki: botti täytti piilokentän. Kerrotaan onnistuminen ilman
  // että mitään lähetetään — roskaposti ei saa palautetta suodattimesta.
  if (onHunajapurkkiTaytetty(formData)) {
    return { status: "onnistui", viesti: "Kiitos! Hakemuksesi on vastaanotettu." };
  }

  const virheet = validoiHakemus(arvot);
  if (Object.keys(virheet).length > 0) {
    return {
      status: "virhe",
      viesti: "Hakemusta ei lähetetty. Korjaa alla merkityt kohdat.",
      virheet,
      arvot,
    };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const vastaanottaja = process.env.JASENHAKEMUS_VASTAANOTTAJA;
  const lahettaja = process.env.JASENHAKEMUS_LAHETTAJA;

  if (!apiKey || !vastaanottaja || !lahettaja) {
    return eiKaytossaTila(arvot);
  }

  const onnistui = await lahetaSahkoposti(arvot, apiKey, vastaanottaja, lahettaja);
  if (!onnistui) {
    const yhteystiedot = await haeYhteystiedot();
    return {
      status: "virhe",
      viesti:
        "Hakemuksen lähetys epäonnistui teknisen virheen vuoksi. Yritä hetken " +
        `kuluttua uudelleen tai lähetä tiedot sähköpostitse: ${
          yhteystiedot.email || defaultContact.email
        }.`,
      virheet: {},
      arvot,
    };
  }

  return {
    status: "onnistui",
    viesti:
      "Kiitos! Hakemuksesi on lähetetty. Otamme sinuun yhteyttä antamaasi " +
      "sähköpostiosoitteeseen.",
  };
}
