// src/App.jsx
import React, { useState, useEffect } from "react";
import {
  getUniqueRefs,
  getColorsFor,
  getSizesFor,
  getStock
} from "./api/stockCsvApi";

export default function App() {
  const [refs, setRefs]         = useState([]);
  const [colors, setColors]     = useState([]);
  const [sizes, setSizes]       = useState([]);

  const [selectedRef, setRef]       = useState("");
  const [selectedColor, setColor]   = useState("");
  const [selectedSize, setSize]     = useState("");
  const [currentStock, setCurrentStock] = useState(null);

  // 1️⃣ Charge la liste des références au démarrage
  useEffect(() => {
    getUniqueRefs().then(setRefs);
  }, []);

  // 2️⃣ Quand on choisit une ref, on reset couleur/size et on charge les couleurs
  useEffect(() => {
    if (!selectedRef) {
      setColors([]); setColor(""); setSizes([]); setSize("");
      setCurrentStock(null);
      return;
    }
    getColorsFor(selectedRef).then(cols => {
      setColors(cols);
      setColor("");
      setSizes([]); setSize("");
      setCurrentStock(null);
    });
  }, [selectedRef]);

  // 3️⃣ Quand on choisit une couleur, on reset taille puis charge les tailles
  useEffect(() => {
    if (!selectedColor) {
      setSizes([]); setSize("");
      setCurrentStock(null);
      return;
    }
    getSizesFor(selectedRef, selectedColor).then(szs => {
      setSizes(szs);
      setSize("");
      setCurrentStock(null);
    });
  }, [selectedColor, selectedRef]);

  // 4️⃣ Dès qu’on a ref+color+size, on va chercher le stock
  useEffect(() => {
    if (selectedRef && selectedColor && selectedSize) {
      getStock(selectedRef, selectedColor, selectedSize).then(stock => {
        setCurrentStock(stock);
      });
    }
  }, [selectedRef, selectedColor, selectedSize]);

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: 16 }}>
      <h1 style={{ textAlign: "center" }}>
        📦 Spasso – Checker de stock
      </h1>

      <div style={{ display: "grid", gap: 12 }}>
        {/* Sélection Référence */}
        <select
          value={selectedRef}
          onChange={e => setRef(e.target.value)}
        >
          <option value="">Sélectionnez la référence</option>
          {refs.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        {/* Sélection Couleur */}
        <select
          value={selectedColor}
          onChange={e => setColor(e.target.value)}
          disabled={!colors.length}
        >
          <option value="">Sélectionnez la couleur</option>
          {colors.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Sélection Taille */}
        <select
          value={selectedSize}
          onChange={e => setSize(e.target.value)}
          disabled={!sizes.length}
        >
          <option value="">Sélectionnez la taille</option>
          {sizes.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {currentStock !== null && (
        <div
          style={{
            marginTop: 24,
            padding: 12,
            backgroundColor: "#f0f0f0",
            borderRadius: 6,
            textAlign: "center"
          }}
        >
          <strong>Stock disponible :</strong>{" "}
          {currentStock > 0 ? currentStock : "Rupture de stock"}
        </div>
      )}
    </div>
  );
}

