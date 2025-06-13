// src/App.jsx

import React, { useState, useEffect } from "react"
import {
  getUniqueRefs,
  getColorsFor,
  getSizesFor,
  getStock
} from "./api/stockCsvApi"

export default function App() {
  const [refs, setRefs]       = useState([])
  const [colors, setColors]   = useState([])
  const [sizes, setSizes]     = useState([])

  const [selectedRef, setRef]         = useState("")
  const [selectedColor, setColor]     = useState("")
  const [selectedSize, setSize]       = useState("")
  const [currentStock, setCurrentStock] = useState(null)

  // Charge les références au démarrage
  useEffect(() => {
    getUniqueRefs().then(setRefs)
  }, [])

  // À la sélection d’une référence, on recharge les couleurs
  useEffect(() => {
    if (!selectedRef) {
      setColors([]); setColor("")
      setSizes([]);  setSize("")
      setCurrentStock(null)
      return
    }
    getColorsFor(selectedRef).then((cols) => {
      setColors(cols)
      setColor("")
      setSizes([]); setSize("")
      setCurrentStock(null)
    })
  }, [selectedRef])

  // À la sélection d’une couleur, on recharge les tailles
  useEffect(() => {
    if (!selectedColor) {
      setSizes([]); setSize("")
      setCurrentStock(null)
      return
    }
    getSizesFor(selectedRef, selectedColor).then((szs) => {
      setSizes(szs)
      setSize("")
      setCurrentStock(null)
    })
  }, [selectedColor, selectedRef])

  // Dès que Ref + Color + Size sont choisis, on récupère le stock
  useEffect(() => {
    if (selectedRef && selectedColor && selectedSize) {
      getStock(selectedRef, selectedColor, selectedSize).then((s) => {
        setCurrentStock(s)
      })
    }
  }, [selectedRef, selectedColor, selectedSize])

  return (
    <div style={{ maxWidth: 480, margin: "2rem auto", padding: "1rem" }}>
      <h1 style={{ textAlign: "center" }}>
        📦 Spasso – Checker de stock
      </h1>
      <div style={{ display: "grid", gap: "1rem" }}>
        <select
          value={selectedRef}
          onChange={(e) => setRef(e.target.value)}
        >
          <option value="">Sélectionnez la référence</option>
          {refs.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        <select
          value={selectedColor}
          onChange={(e) => setColor(e.target.value)}
          disabled={!colors.length}
        >
          <option value="">Sélectionnez la couleur</option>
          {colors.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={selectedSize}
          onChange={(e) => setSize(e.target.value)}
          disabled={!sizes.length}
        >
          <option value="">Sélectionnez la taille</option>
          {sizes.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {currentStock !== null && (
        <div
          style={{
            marginTop: "1.5rem",
            padding: "1rem",
            background: "#f9f9f9",
            borderRadius: 6,
            textAlign: "center"
          }}
        >
          <strong>Stock disponible :</strong>{" "}
          {currentStock > 0 ? currentStock : "Rupture de stock"}
        </div>
      )}
    </div>
  )
}
