import React, { useState, useEffect } from "react";
import {
  getUniqueRefs,
  getColorsFor,
  getSizesFor,
  getStock
} from "./stockCsvApi";
import "./index.css";

export default function App() {
  const [refs, setRefs] = useState([]);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [selectedRef, setRef] = useState("");
  const [selectedColor, setColor] = useState("");
  const [stockBySize, setStockBySize] = useState({});

  useEffect(() => {
    getUniqueRefs().then(setRefs);
  }, []);

  useEffect(() => {
    if (!selectedRef) {
      setColors([]); setColor("");
      setSizes([]); setStockBySize({});
      return;
    }
    getColorsFor(selectedRef).then(cols => {
      setColors(cols);
      setColor("");
      setSizes([]); setStockBySize({});
    });
  }, [selectedRef]);

  useEffect(() => {
    if (!selectedColor) {
      setSizes([]); setStockBySize({});
      return;
    }
    getSizesFor(selectedRef, selectedColor).then(szs => {
      setSizes(szs);
      Promise.all(
        szs.map(size =>
          getStock(selectedRef, selectedColor, size)
            .then(stock => ({ size, stock }))
        )
      ).then(results => {
        const map = {};
        results.forEach(({ size, stock }) => {
          map[size] = stock;
        });
        setStockBySize(map);
      });
    });
  }, [selectedColor, selectedRef]);

  return (
    <div style={{
      maxWidth: 480,
      margin: "2rem auto",
      padding: "1rem",
      textAlign: "center"
    }}>
      {/* Logo toujours agrandi */}
      <img
        src="/SPASSO_LOGO_PRINCIPAL.png"
        alt="Spasso logo"
        style={{ width: 200, marginBottom: 24 }}
      />

      {/* Titre */}
      <h1 style={{
        margin: 0,
        fontFamily: "'Montserrat Alternates', sans-serif",
        fontWeight: 700,
        fontSize: "25pt",
        color: "#000"
      }}>
        📦 Stock Checker
      </h1>

      {/* Sélecteurs à 50% de largeur */}
      <div style={{ marginTop: "1.5rem" }}>
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
          style={{ marginTop: "1rem" }}
        >
          <option value="">Select color</option>
          {colors.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Visuel */}
      <div style={{ marginTop: "1.5rem" }}>
        <img
          src="/collection-lin.jpg"
          alt="Collection LIN"
          style={{ width: "100%", borderRadius: 8 }}
        />
      </div>

      {/* Tableau */}
      {sizes.length > 0 && (
        <table style={{
          width: "100%",
          marginTop: 20,
          borderCollapse: "collapse",
          textAlign: "left"
        }}>
          <thead>
            <tr>
              <th style={{ borderBottom: "2px solid #ccc", padding: "8px 0" }}>
                Size
              </th>
              <th style={{
                borderBottom: "2px solid #ccc",
                padding: "8px 0",
                textAlign: "right"
              }}>
                Available Stock
              </th>
            </tr>
          </thead>
          <tbody>
            {sizes.map(size => (
              <tr key={size}>
                <td style={{ padding: "6px 0" }}>{size}</td>
                <td style={{
                  padding: "6px 0",
                  textAlign: "right"
                }}>
                  {stockBySize[size] > 0 ? stockBySize[size] : "Out of stock"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
