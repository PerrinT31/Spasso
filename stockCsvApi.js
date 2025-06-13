// src/api/stockCsvApi.js

/** 
 * Charge et parse SPASSO_STOCKWEB_SP.csv (séparateur `;`, header inclus) 
 * Colonnes attendues : REF;DESIGNATION;COLOR;SIZE;QUANTITY
 */
const CSV_URL = "/SPASSO_STOCKWEB_SP.csv";

let cache = null

async function loadCsv() {
  if (cache) return cache
  const res  = await fetch(CSV_URL)
  const text = await res.text()
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "")
  const [, ...rows] = lines
  cache = rows.map((line) => {
    const [ref, , color, size, qty] = line.split(";")
    return {
      ref_catalog: ref,
      color:       color,
      size:        size,
      stock:       parseInt(qty, 10)
    }
  })
  return cache
}

export async function getUniqueRefs() {
  const rows = await loadCsv()
  return Array.from(new Set(rows.map((r) => r.ref_catalog)))
}

export async function getColorsFor(ref) {
  const rows = await loadCsv()
  return Array.from(
    new Set(rows.filter((r) => r.ref_catalog === ref).map((r) => r.color))
  )
}

export async function getSizesFor(ref, color) {
  const rows = await loadCsv()
  return Array.from(
    new Set(
      rows
        .filter((r) => r.ref_catalog === ref && r.color === color)
        .map((r) => r.size)
    )
  )
}

export async function getStock(ref, color, size) {
  const rows = await loadCsv()
  const found = rows.find(
    (r) =>
      r.ref_catalog === ref &&
      r.color       === color &&
      r.size        === size
  )
  return found ? found.stock : 0
}
