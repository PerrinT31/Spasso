// App.jsx

import React, { useState, useEffect } from "react"
import {
  getUniqueRefs,
  getColorsFor,
  getSizesFor,
  getStock
} from "./stockCsvApi"

export default function App() {
  const [refs, setRefs]       = useState([])
  const [colors, setColors]   = useState([])
  const [sizes, setSizes]     = useState([])

  const [selectedRef, setRef]     = useState("")
  const [selectedColor, setColor] = useState("")
  const [stockBySize, setStockBySize] = useState({})

  // 1. Charger les références au démarrage
  useEffect(() => {
    getUniqueRefs().then(setRefs)
  }, [])

  // 2. Quand la référence change → charger les couleurs
  useEffect(() => {
    if (!selectedRef) {
      setColors([]); setColor("")
      setSizes([]); setStockBySize({})
      return
    }
    getColorsFor(selectedRef).then(cols => {
      setColors(cols)
      setColor("")
      setSizes([]); setStockBySize({})
    })
  }, [selectedRef])

  // 3. Quand la couleur change → charger les tailles et leur stock
  useEffect(() => {
    if (!selectedColor) {
      setSizes([]); setStockBySize({})
      return
    }
    // Récupère d'abord les tailles
    getSizesFor(selectedRef, selectedColor).then(szs => {
      setSizes(szs)
      // Ensuite, pour chaque taille, récupérer le stock
      Promise.all(
        szs.map(size =>
          getStock(selectedRef, selectedColor, size)
            .then(stock => ({ size, stock }))
        )
      ).then(results => {
        // Transformer en objet { size: stock }
        const map = {}
        results.forEach(({ size, stock }) => {
          map[size] = stock
        })
        setStockBySize(map)
      })
    })
  }, [selectedColor, selectedRef])

  return (
    <div style={{ maxWidth: 480, margin: "2rem auto", padding: "1rem" }}>
      <h1 style={{ textAlign: "center" }}>
        📦 Spasso – Stock Checker
      </h1>

      <div style={{ display: "grid", gap: "1rem" }}>
        <select
          value={selectedRef}
          onChange={e => setRef(e.target.value)}
        >
          <option value="">Select reference</option>
          {refs.map(r => <option key={r} value={r}>{r}</option>)}
        </select>

        <select
          value={selectedColor}
          onChange={e => setColor(e.target.value)}
          disabled={!colors.length}
        >
          <option value="">Select color</option>
          {colors.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {sizes.length > 0 && (
        <table style={{ width: "100%", marginTop: 20, borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>Size</th>
              <th style={{ textAlign: "right", borderBottom: "1px solid #ccc" }}>Available Stock</th>
            </tr>
          </thead>
          <tbody>
            {sizes.map(size => (
              <tr key={size}>
                <td style={{ padding: "8px 0" }}>{size}</td>
                <td style={{ padding: "8px 0", textAlign: "right" }}>
                  {stockBySize[size] > 0
                    ? stockBySize[size]
                    : "Out of stock"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
