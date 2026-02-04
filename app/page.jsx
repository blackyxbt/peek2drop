"use client";

import { useState } from "react";

/* ===== formatting helpers (ADDED) ===== */
const fmt = (value) => {
  const n = Number(value);
  if (isNaN(n)) return value;
  return n.toLocaleString("en-IN");
};

const fmtShort = (value) => {
  const n = Number(value);
  if (isNaN(n)) return value;

  if (n >= 1e9) return (n / 1e9).toFixed(2) + " B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + " M";
  if (n >= 1e3) return (n / 1e3).toFixed(2) + " K";
  return n.toString();
};

const pct = (v, total) => {
  const a = Number(v);
  const t = Number(total);
  if (!t) return "0%";
  return ((a / t) * 100).toFixed(1) + "%";
};
/* ===================================== */

export default function Home() {
  const [form, setForm] = useState({
    chain: "eth",
    tokenCA: "",
    distributorCA: "",
  });

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    setData(null);

    const res = await fetch("/api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const json = await res.json();
    setData(json);
    setLoading(false);
  };

  return (
    <main style={{ padding: 24 }}>
      <h1>Airdrop Analyzer</h1>

      <div className="form-block">

        <div className="form-row">
          <label>chain</label>
          <select
            value={form.chain}
            onChange={(e) =>
              setForm({ ...form, chain: e.target.value })
            }
          >
            <option value="eth">Ethereum</option>
            <option value="bsc">BSC</option>
            <option value="polygon">Polygon</option>
            <option value="arbitrum">Arbitrum</option>
            <option value="base">Base</option>
          </select>
        </div>

        <div className="form-row">
          <label>Token Contract Address</label>
          <input
            placeholder="0x..."
            value={form.tokenCA}
            onChange={(e) =>
              setForm({ ...form, tokenCA: e.target.value })
            }
          />
        </div>

        <div className="form-row">
          <label>Distributor contract Address</label>
          <input
            placeholder="Distributor Address"
            value={form.distributorCA}
            onChange={(e) =>
              setForm({ ...form, distributorCA: e.target.value })
            }
          />
        </div>

        <div className="acrion-row">
          <button onClick={submit} disabled={loading}>
            {loading ? "Scanning..." : "Analyze"}
          </button>
        </div>
      </div>

      {data?.error && (
        <p style={{ color: "red" }}>{data.error}</p>
      )}

      {data && !data.error && (
        <>
          <h2>📦 Airdrop Pool Status</h2>

          <div className="terminal">
            <div className="pool-status">

              <div className="row">
                <span className="label">Total Airdrop Pool:</span>{" "}
                {fmt(data.total)}{" "}
                <span className="dim">({fmtShort(data.total)})</span>
              </div>

              <div className="row">
                <span className="label">Claimed:</span>{" "}
                {fmt(data.claimed)}{" "}
                <span className="dim">
                  ({fmtShort(data.claimed)}) ({pct(data.claimed, data.total)})
                </span>
              </div>

              <div className="row">
                <span className="label">Unclaimed:</span>{" "}
                {fmt(data.unclaimed)}{" "}
                <span className="dim">
                  ({fmtShort(data.unclaimed)}) ({pct(data.unclaimed, data.total)})
                </span>
              </div>
            </div>
          </div>

          <div className="top10-box">
            <h3>🔝 Top 10 Receivers</h3>
            <ul className="top-receivers terminal">
              {data.recipients?.slice(0, 10).map((r, i) => (
                <li key={r.address}>
                  #{i + 1} {r.address} — {fmt(r.amount)}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </main>
  );
}

