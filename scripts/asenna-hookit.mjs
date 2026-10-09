// postinstall: ottaa .githooks/-kansion hookit käyttöön (pre-push ajaa npm run tarkista).
// Ei kaada asennusta, jos git puuttuu tai ei olla repossa (esim. Vercelin build).
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";

if (existsSync(".git") && existsSync(".githooks")) {
  try {
    execSync("git config core.hooksPath .githooks", { stdio: "ignore" });
  } catch {
    // ei gitiä: ohitetaan
  }
}
