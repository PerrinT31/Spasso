// src/api/stockCsvApi.js

/** 
 * Service natif pour charger et parser le CSV SPASSO_STOCKWEB_SP.csv 
 * Le CSV utilise le séparateur `;` avec en‐tête :
 * REF;DESIGNATION;COLOR;SIZE;QUANTITY
 */

const CSV_URL =
  'https://files.karibanbrands.com/documents/SPASSO_STOCKWEB_SP.csv';

let cache = null;

/** Charge et parse le CSV une seule fois */
async function loadCsv() {
  if (cache) return cache;

  const res  = await fetch(CSV_URL);
  const text = await res.text();

  // Découpage en lignes non-vides
  const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
  
  // En-tête
  const [header, ...rows] = lines;
  
  // Pour chaque ligne, on split sur `;`
  cache = rows.map(line => {
    const [ref, designation, color, size, quantity] = line.split(';');
    return {
      ref_catalog: ref,
      designation: designation,
      color:       color,
      size:        size,
      stock:       parseInt(quantity, 10)
    };
  });

  return cache;
}

/** Toutes les références uniques */
export async function getUniqueRefs() {
  const rows = await loadCsv();
  return Array.from(new Set(rows.map(r => r.ref_catalog)));
}

/** Couleurs disponibles pour une référence */
export async function getColorsFor(ref) {
  const rows = await loadCsv();
  return Array.from(
    new Set(
      rows
        .filter(r => r.ref_catalog === ref)
        .map(r => r.color)
    )
  );
}

/** Tailles disponibles pour une référence + couleur */
export async function getSizesFor(ref, color) {
  const rows = await loadCsv();
  return Array.from(
    new Set(
      rows
        .filter(r => r.ref_catalog === ref && r.color === color)
        .map(r => r.size)
    )
  );
}

/** Stock pour une combinaison exacte ref + color + size */
export async function getStock(ref, color, size) {
  const rows = await loadCsv();
  const found = rows.find(
    r =>
      r.ref_catalog === ref &&
      r.color       === color &&
      r.size        === size
  );
  return found ? found.stock : 0;
}
