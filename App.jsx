// App.jsx

import React, { useState, useEffect } from "react";
import {
  getUniqueRefs,
  getColorsFor,
  getSizesFor,
  getStock
} from "./stockCsvApi.js";
import { getReappro } from "./reapproCsvApi.js";
import "./index.css";

export default function App() {
  // États pour les filtres et les données
  const [refs, setRefs]                     = useState([]);
  const [colors, setColors]                 = useState([]);
  const [sizes, setSizes]                   = useState([]);
  const [selectedRef, setSelectedRef]       = useState("");
  const [selectedColor, setSelectedColor]   = useState("");
  const [stockBySize, setStockBySize]       = useState({});
  const [reapproBySize, setReapproBySize]   = useState({});

  // Au montage, on charge la liste des références
  useEffect(() => {
    getUniqueRefs().then(setRefs);
  }, []);

  // Quand on change de référence, on recharge les couleurs
  useEffect(() => {
    if (!selectedRef) {
      setColors([]); setSelectedColor("");
      setSizes([]); setStockBySize({}); setReapproBySize({});
      return;
    }
    getColorsFor(selectedRef).then(cols => {
      setColors(cols);
      setSelectedColor("");
      setSizes([]); setStockBySize({}); setReapproBySize({});
    });
  }, [selectedRef]);

  // Quand on change de couleur, on recharge les tailles, les stocks et les réappros
  useEffect(() => {
    if (!selectedColor) {
      setSizes([]); setStockBySize({}); setReapproBySize({});
      return;
    }
    getSizesFor(selectedRef, selectedColor).then(szs => {
      setSizes(szs);
      Promise.all(
        szs.map(size =>
          Promise.all([
            getStock(selectedRef, selectedColor, size),
            getReappro(selectedRef, selectedColor, size)
          ]).then(([stock, reappro]) => ({
            size,
            stock,
            reappro   // { dateToRec, quantity } ou null
          }))
        )
      ).then(results => {
        const stockMap = {}, reappMap = {};
        results.forEach(({ size, stock, reappro }) => {
          stockMap[size]   = stock;
          reappMap[size]   = reappro;
        });
        setStockBySize(stockMap);
        setReapproBySize(reappMap);
      });
    });
  }, [selectedRef, selectedColor]);

  return (
    <div className="app-container">
      {/* Logo Spasso */}
      <img
        src="/SPASSO_LOGO_PRINCIPAL.png"
        alt="Logo Spasso"
        className="app-logo"
      />

      {/* Titre */}
      <h1 className="app-title">📦 Spasso Stock Checker</h1>

      {/* Filtres : référence & couleur */}
      <div className="selectors">
        <select
          value={selectedRef}
          onChange={e => setSelectedRef(e.target.value)}
        >
          <option value="">Sélectionnez la référence</option>
          {refs.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        <select
          value={selectedColor}
          onChange={e => setSelectedColor(e.target.value)}
          disabled={!colors.length}
        >
          <option value="">Sélectionnez la couleur</option>
          {colors.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Visuel promotionnel */}
      <div className="hero-image">
        <img src="/collection-lin.jpg" alt="Collection LIN" />
      </div>

      {/* Tableau des stocks et réappros */}
      {sizes.length > 0 && (
        <table className="results-table">
          <thead>
            <tr>
              <th>Taille</th>
              <th style={{ textAlign: "right" }}>Stock dispo</th>
              <th style={{ textAlign: "center" }}>Réappro (date)</th>
              <th style={{ textAlign: "right" }}>Qté à venir</th>
            </tr>
          </thead>
          <tbody>
            {sizes.map(size => (
              <tr key={size}>
                <td>{size}</td>
                <td style={{ textAlign: "right" }}>
                  {stockBySize[size] > 0 ? stockBySize[size] : "Rupture"}
                </td>
                <td style={{ textAlign: "center" }}>
                  {reapproBySize[size]?.dateToRec ?? "-"}
                </td>
                <td style={{ textAlign: "right" }}>
                  {reapproBySize[size]?.quantity ?? "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
