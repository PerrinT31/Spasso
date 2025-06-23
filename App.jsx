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
  const [refs, setRefs]                   = useState([]);
  const [colors, setColors]               = useState([]);
  const [sizes, setSizes]                 = useState([]);
  const [selectedRef, setSelectedRef]     = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [stockBySize, setStockBySize]     = useState({});
  const [reapproBySize, setReapproBySize] = useState({});

  // Charger les références
  useEffect(() => {
    getUniqueRefs().then(setRefs);
  }, []);

  // Quand on change de référence, recharger les couleurs
  useEffect(() => {
    if (!selectedRef) {
      setColors([]);
      setSelectedColor("");
      setSizes([]);
      setStockBySize({});
      setReapproBySize({});
      return;
    }
    getColorsFor(selectedRef).then(cols => {
      setColors(cols);
      setSelectedColor("");
      setSizes([]);
      setStockBySize({});
      setReapproBySize({});
    });
  }, [selectedRef]);

  // Quand on change de couleur, recharger tailles + stock + réappro
  useEffect(() => {
    if (!selectedColor) {
      setSizes([]);
      setStockBySize({});
      setReapproBySize({});
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
            reappro
          }))
        )
      ).then(results => {
        const s = {}, r = {};
        results.forEach(({ size, stock, reappro }) => {
          s[size] = stock;
          r[size] = reappro;
        });
        setStockBySize(s);
        setReapproBySize(r);
      });
    });
  }, [selectedRef, selectedColor]);

  return (
    <div className="app-container">
      {/* En-tête */}
      <header className="app-header">
        <img
          src="/SPASSO_LOGO_PRINCIPAL.png"
          alt="Logo Spasso"
          className="app-logo"
        />
        <h1 className="app-title">Stock Checker</h1>
      </header>

      {/* Filtres */}
      <div className="filters">
        <div className="filter">
          <label>Reference</label>
          <select
            value={selectedRef}
            onChange={e => setSelectedRef(e.target.value)}
          >
            <option value="">-- Select --</option>
            {refs.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <div className="filter">
          <label>Color</label>
          <select
            value={selectedColor}
            onChange={e => setSelectedColor(e.target.value)}
            disabled={!colors.length}
          >
            <option value="">-- Select --</option>
            {colors.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ❶ Tableau des résultats */}
      {sizes.length > 0 && (
        <table className="results-table">
          <thead>
            <tr>
              <th>Size</th>
              <th>Stock</th>
              <th>Replenishment (Date)</th>
              <th>Qty Incoming</th>
            </tr>
          </thead>
          <tbody>
            {sizes.map(size => (
              <tr key={size}>
                <td>{size}</td>
                <td className="right">
                  {stockBySize[size] > 0
                    ? stockBySize[size]
                    : "Out of stock"}
                </td>
                <td className="center">
                  {reapproBySize[size]?.dateToRec ?? "-"}
                </td>
                <td className="right">
                  {reapproBySize[size]?.quantity ?? "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ❷ Petit espace réactif */}
      <div className="spacer" />

      {/* ❸ Visuel sous le tableau */}
      <div className="hero-image">
        <img src="/collection-lin.jpg" alt="Collection LIN" />
      </div>
    </div>
  );
}
