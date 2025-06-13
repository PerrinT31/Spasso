// src/api/stockCsvApi.js
import Papa from 'papaparse';

const CSV_URL = 'https://files.karibanbrands.com/documents/SPASSO_STOCKWEB_SP.csv';

let _cache = null;

/** Charge et parse le CSV une seule fois */
async function loadCsv() {
  if (_cache) return _cache;
  const res  = await fetch(CSV_URL);
  const text = await res.text();
  const { data } = Papa.parse(text, { header: true, skipEmptyLines: true });
  // On normalise le type : 
  _cache = data.map(row => ({
    ref_catalog: row.ref_catalog,
    color:       row.color,
    size:        row.size,
    stock:       parseInt(row.stock, 10)
  }));
  return _cache;
}

/** Renvoie la liste complète de lignes */
export async function getAllRows() {
  return await loadCsv();
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
    new Set(rows.filter(r => r.ref_catalog === ref).map(r => r.color))
  );
}

/** Tailles dispo pour ref+color */
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

/** Stock pour une combinaison exacte */
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

