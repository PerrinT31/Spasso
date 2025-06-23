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
  const [selRef, setSelRef]               = useState("");
  const [selColor, setSelColor]           = useState("");
  const [stockBySize, setStockBySize]     = useState({});
  const [reapproBySize, setReapproBySize] = useState({});

  // 1. Charger les références
  useEffect(() => {
    getUniqueRefs().then(setRefs);
  }, []);

  // 2. Charger les couleurs
  useEffect(() => {
    if (!selRef) {
      setColors([]); setSelColor("");
      setSizes([]); setStockBySize({}); setReapproBySize({});
      return;
    }
    getColorsFor(selRef).then(cols => {
      setColors(cols);
      setSelColor("");
      setSizes([]); setStockBySize({}); setReapproBySize({});
    });
  }, [selRef]);

  // 3. Charger tailles, stock et réappro
  useEffect(() => {
    if (!selColor) {
      setSizes([]); setStockBySize({}); setReapproBySize({});
      return;
    }
    getSizesFor(selRef, selColor).then(szs => {
      setSizes(szs);
      Promise.all(
        szs.map(size =>
          Promise.all([
            getStock(selRef, selColor, size),
            getReappro(selRef, selColor, size)
          ]).then(([stock, reappro]) => ({ size, stock, reappro }))
        )
      ).then(results => {
        const s={}, r={};
        results.forEach(({ size, stock, reappro }) => {
          s[size] = stock;
          r[size] = reappro;
        });
        setStockBySize(s);
        setReapproBySize(r);
      });
    });
  }, [selRef, selColor]);

  return (
    <div className="app-container">
      <header className="app-header">
        <img src="/SPASSO_LOGO_PRINCIPAL.png" alt="Logo Spasso" className="app-logo" />
        <h1 className="app-title">Spasso Stock Checker</h1>
      </header>

      <div className="filters">
        <div className="filter">
          <label>Référence</label>
          <select value={selRef} onChange={e => setSelRef(e.target.value)}>
            <option value="">-- Choisir --</option>
            {refs.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div className="filter">
          <label>Couleur</label>
          <select
            value={selColor}
            onChange={e => setSelColor(e.target.value)}
            disabled={!colors.length}
          >
            <option value="">-- Choisir --</option>
            {colors.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="hero-image">
        <img src="/collection-lin.jpg" alt="Collection LIN" />
      </div>

      {sizes.length > 0 && (
        <table className="results-table">
          <thead>
            <tr>
              <th>Taille</th>
              <th>Stock dispo</th>
              <th>Réappro (date)</th>
              <th>Qté à venir</th>
            </tr>
          </thead>
          <tbody>
            {sizes.map(size => (
              <tr key={size}>
                <td>{size}</td>
                <td className="right">
                  {stockBySize[size] > 0 ? stockBySize[size] : "Rupture"}
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
    </div>
  );
}
