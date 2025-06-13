// api/proxyStockCsv.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const external = await fetch(
      "https://files.karibanbrands.com/documents/SPASSO_STOCKWEB_SP.csv"
    );
    const text = await external.text();
    // On autorise notre front à lire ce CSV sans CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "text/csv");
    res.send(text);
  } catch (err) {
    res.status(500).json({ error: "Impossible de récupérer le CSV" });
  }
}
