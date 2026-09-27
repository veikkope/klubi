import https from "node:https";
import tls from "node:tls";

/**
 * veikkausliiga.com ei lähetä TLS-ketjussa välivarmennettaan (ZeroSSL ECC DV
 * SSL CA 2). Selaimet ja Windowsin curl hakevat puuttuvan varmenteen itse,
 * mutta Node (ja siten Vercel) ei, joten tavallinen fetch kaatuu virheeseen
 * UNABLE_TO_VERIFY_LEAF_SIGNATURE.
 *
 * Korjaus: lisätään puuttuva välivarmenne luotettujen juurivarmenteiden
 * rinnalle vain tätä hakua varten. Varmennusta EI ohiteta — ketju päättyy yhä
 * Noden omaan juurivarmenteeseen (Sectigo Public Server Authentication Root E46).
 *
 * Lähde: http://crt.sectigo.com/ZeroSSLECCDVSSLCA2.crt (sivuston varmenteen
 * AIA-osoite). Voimassa 23.9.2035 asti.
 * SHA-256: BE:C8:4F:CE:0D:AA:42:3F:3B:3E:ED:38:EA:48:06:6C:C5:61:8F:52:44:AD:65:CD:9F:86:24:A8:13:FA:4C:3D
 */
const ZEROSSL_ECC_DV_CA_2 = `-----BEGIN CERTIFICATE-----
MIIDNTCCArugAwIBAgIRAMThxbsA8CePNHvk+F1j/MowCgYIKoZIzj0EAwMwXzEL
MAkGA1UEBhMCR0IxGDAWBgNVBAoTD1NlY3RpZ28gTGltaXRlZDE2MDQGA1UEAxMt
U2VjdGlnbyBQdWJsaWMgU2VydmVyIEF1dGhlbnRpY2F0aW9uIFJvb3QgRTQ2MB4X
DTI1MDkyNDAwMDAwMFoXDTM1MDkyMzIzNTk1OVowRjELMAkGA1UEBhMCQVQxFTAT
BgNVBAoTDFplcm9TU0wgR21iSDEgMB4GA1UEAxMXWmVyb1NTTCBFQ0MgRFYgU1NM
IENBIDIwWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAATjn4qR1IOXAceCMsej8Qyr
4PrFw+PwjPm2vrAfijBj4u2C++Y3pZqpeLi1z05b2owKKJzQk1AtL+m1fEoFeDka
o4IBbzCCAWswHwYDVR0jBBgwFoAU0SLaTFnxS18mOKqd1u7rDcP7qWEwHQYDVR0O
BBYEFJRFn9pRR3HVc66sHasIchJtrXxiMA4GA1UdDwEB/wQEAwIBhjASBgNVHRMB
Af8ECDAGAQH/AgEAMBMGA1UdJQQMMAoGCCsGAQUFBwMBMBMGA1UdIAQMMAowCAYG
Z4EMAQIBMFQGA1UdHwRNMEswSaBHoEWGQ2h0dHA6Ly9jcmwuc2VjdGlnby5jb20v
U2VjdGlnb1B1YmxpY1NlcnZlckF1dGhlbnRpY2F0aW9uUm9vdEU0Ni5jcmwwgYQG
CCsGAQUFBwEBBHgwdjBPBggrBgEFBQcwAoZDaHR0cDovL2NydC5zZWN0aWdvLmNv
bS9TZWN0aWdvUHVibGljU2VydmVyQXV0aGVudGljYXRpb25Sb290RTQ2LnA3YzAj
BggrBgEFBQcwAYYXaHR0cDovL29jc3Auc2VjdGlnby5jb20wCgYIKoZIzj0EAwMD
aAAwZQIwXKxxvuUkvPftBuaOFx73U3FxmFtKxP1Fd/+8Jq/ut2XgDrJ1vEUDdJb3
iSDXVe9AAjEA8iUwhrRHdZrIWqfgGmDMBbuXRZ4GoQbLpwxgcPhKo3OZR7SecTp4
juWAOpuawM2n
-----END CERTIFICATE-----`;

const agent = new https.Agent({ ca: [...tls.rootCertificates, ZEROSSL_ECC_DV_CA_2] });

/** GET-pyyntö tekstinä veikkausliiga.comiin. Aikakatkaisu 10 s. */
export function fetchVeikkausliigaText(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { agent, timeout: 10_000 }, (res) => {
      if (res.statusCode !== 200) {
        res.resume();
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      res.setEncoding("utf8");
      let body = "";
      res.on("data", (chunk: string) => (body += chunk));
      res.on("end", () => resolve(body));
    });
    req.on("timeout", () => req.destroy(new Error("Aikakatkaisu")));
    req.on("error", reject);
  });
}
