// stockCsvApi.js

const CSV_URL = "/SPASSO_STOCKWEB_SP.csv";
let cache = null;

async function loadCsv() {
  if (cache) return cache;

  const text = await (await fetch(CSV_URL)).text();
  const lines = text
    .split(/\r?\n/)
    .filter((l) => l.trim() !== "");
  // On saute la ligne d'en-tête
  const [, ...rows] = lines;

  cache = rows.map((line) => {
    // Passez au séparateur ',', pas ';'
    const [ref, , color, size, qty] = line.split(",");
    return {
      ref_catalog: ref,
      color:       color,
      size:        size,
      stock:       parseInt(qty, 10)
    };
  });

  return cache;
}

export async function getUniqueRefs() {
  const rows = await loadCsv();
  return Array.from(new Set(rows.map((r) => r.ref_catalog)));
}

export async function getColorsFor(ref) {
  const rows = await loadCsv();
  return Array.from(new Set(
    rows.filter((r) => r.ref_catalog === ref).map((r) => r.color)
  ));
}

export async function getSizesFor(ref, color) {
  const rows = await loadCsv();
  return Array.from(new Set(
    rows
      .filter((r) => r.ref_catalog === ref && r.color === color)
      .map((r) => r.size)
  ));
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
