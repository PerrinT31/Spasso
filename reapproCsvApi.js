// src/reapproCsvApi.js

// URL publique de votre CSV
const REAPPRO_CSV_URL = "/SPASSO_REAPPRO_SP.csv";

let cache = null;

/**
 * Charge et parse le CSV de réappro en mémoire (une seule fois)
 */
async function loadReappro() {
  if (cache) return cache;
  const res  = await fetch(REAPPRO_CSV_URL);
  const text = await res.text();

  // On coupe les lignes et on enlève l'entête
  const lines = text
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter((l, i) => l && i > 0);

  cache = lines.map(line => {
    const cols = line.split(";");
    return {
      ref        : cols[0],
      color      : cols[2],
      size       : cols[3],
      dateToRec  : cols[6],              // format "DD/MM/YYYY"
      quantity   : parseInt(cols[7], 10) // quantité à venir
    };
  });

  return cache;
}

/**
 * Pour une combo ref+color+size, renvoie la date et la quantité de réappro
 */
export async function getReappro(ref, color, size) {
  const data = await loadReappro();
  const found = data.find(
    r =>
      r.ref   === ref &&
      r.color === color &&
      r.size  === size
  );
  return found
    ? { dateToRec: found.dateToRec, quantity: found.quantity }
    : null;
}
