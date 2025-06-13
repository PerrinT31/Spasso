// stockCsvApi.js

const CSV_URL = "/SPASSO_STOCKWEB_SP.csv";
let cache = null;

async function loadCsv() {
  if (cache) return cache;

  const text  = await (await fetch(CSV_URL)).text();
  const lines = text
    .split(/\r?\n/)
    .filter((l) => l.trim() !== "");

  // 1️⃣ Parser l’en-tête pour trouver les bons indices
  const headerCols = lines[0].split(";");
  const idxRef     = headerCols.indexOf("REF");
  const idxColor   = headerCols.indexOf("COLOR");
  const idxSize    = headerCols.indexOf("SIZE");
  const idxStock   = headerCols.indexOf("QUANTITY");

  // 2️⃣ Pour chaque ligne (en sautant l’en-tête), split & extraire
  cache = lines.slice(1).map((line) => {
    const cols = line.split(";");
    return {
      ref_catalog: cols[idxRef]?.trim()   || "",
      color:       cols[idxColor]?.trim() || "",
      size:        cols[idxSize]?.trim()  || "",
      stock:       parseInt(cols[idxStock] || "0", 10)
    };
  });

  return cache;
}

export async function getUniqueRefs() {
  const rows = await loadCsv();
  // On récupère UNIQUEMENT la colonne ref_catalog
  return Array.from(new Set(rows.map((r) => r.ref_catalog)));
}

export async function getColorsFor(ref) {
  const rows = await loadCsv();
  return Array.from(
    new Set(
      rows
        .filter((r) => r.ref_catalog === ref)
        .map((r) => r.color)
        .filter(Boolean)
    )
  );
}

export async function getSizesFor(ref, color) {
  const rows = await loadCsv();
  return Array.from(
    new Set(
      rows
        .filter((r) => r.ref_catalog === ref && r.color === color)
        .map((r) => r.size)
        .filter(Boolean)
    )
  );
}

export async function getStock(ref, color, size) {
  const rows = await loadCsv();
  const found = rows.find(
    (r) =>
      r.ref_catalog === ref &&
      r.color       === color &&
      r.size        === size
  );
  return found ? found.stock : 0;
}
