import { useState, useMemo } from "react";

const AVATAR_COLORS = [
  "#2563eb", "#7c3aed", "#059669", "#dc2626",
  "#d97706", "#0891b2", "#be185d", "#65a30d",
];

function avatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initials(name) {
  return (name || "?").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

function groupByMonth(list, calcBill) {
  const g = {};
  list.forEach(b => {
    const d = new Date(b.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleString("default", { month: "long", year: "numeric" });
    if (!g[key]) g[key] = { label, bills: [], total: 0 };
    g[key].bills.push(b);
    g[key].total += calcBill(b).grand;
  });
  return Object.entries(g).sort((a, b) => b[0].localeCompare(a[0])).map(([, v]) => v);
}

export default function BillHistoryPage({ bills, onBack, onView, onEdit, onDelete, calcBill }) {
  const [clientFilter, setClientFilter] = useState("");
  const [search, setSearch] = useState("");

  const uniqueClients = useMemo(
    () => [...new Set(bills.map(b => b.client_name).filter(Boolean))].sort(),
    [bills]
  );

  const filtered = useMemo(() => {
    return bills.filter(b => {
      const matchClient = !clientFilter || b.client_name === clientFilter;
      const s = search.toLowerCase();
      const matchSearch = !s ||
        (b.client_name || "").toLowerCase().includes(s) ||
        (b.invoice_no || "").toLowerCase().includes(s) ||
        (b.cab_no || "").toLowerCase().includes(s);
      return matchClient && matchSearch;
    });
  }, [bills, clientFilter, search]);

  const groups = useMemo(() => groupByMonth(filtered, calcBill), [filtered, calcBill]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');

        .bh-root *, .bh-root *::before, .bh-root *::after {
          box-sizing: border-box; margin: 0; padding: 0;
        }
        .bh-root {
          --navy-deep:    #050d1f;
          --navy-mid:     #0a1530;
          --navy-light:   #0f1f45;
          --glass-bg:     rgba(255,255,255,0.06);
          --glass-border: rgba(255,255,255,0.12);
          --text-primary: #e8edf8;
          --text-muted:   #8a9bbf;
          --accent-gold:  #f5c842;
          --accent-blue:  #4a9eff;
          --accent-orange:#ff8c38;
          --accent-red:   #ff4757;
          --accent-green: #2ed573;
          font-family: 'DM Sans', sans-serif;
          color: var(--text-primary);
          background: var(--navy-deep);
          min-height: 100vh;
          overflow-x: hidden;
          position: relative;
        }

        /* ─── BACKGROUND ─── */
        .bh-bg {
          position: fixed;
          inset: 0;
          z-index: 0;
          overflow: hidden;
          pointer-events: none;
        }
        .bh-bg::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 80% 60% at 50% 0%, #1a2a6c 0%, #0a1530 40%, #050d1f 100%);
        }
        .bh-stars {
          position: absolute;
          inset: 0;
          background-image:
            radial-gradient(1px 1px at 10% 8%,  rgba(255,255,255,0.9) 0%, transparent 100%),
            radial-gradient(1px 1px at 25% 5%,  rgba(255,255,255,0.7) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 38% 12%, rgba(255,255,255,0.8) 0%, transparent 100%),
            radial-gradient(1px 1px at 52% 4%,  rgba(255,255,255,0.6) 0%, transparent 100%),
            radial-gradient(1px 1px at 63% 9%,  rgba(255,255,255,0.9) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 74% 3%, rgba(255,255,255,0.7) 0%, transparent 100%),
            radial-gradient(1px 1px at 88% 7%,  rgba(255,255,255,0.8) 0%, transparent 100%),
            radial-gradient(1px 1px at 15% 18%, rgba(255,255,255,0.5) 0%, transparent 100%),
            radial-gradient(1px 1px at 45% 16%, rgba(255,255,255,0.6) 0%, transparent 100%),
            radial-gradient(1px 1px at 78% 14%, rgba(255,255,255,0.5) 0%, transparent 100%),
            radial-gradient(1px 1px at 31% 25%, rgba(255,255,255,0.3) 0%, transparent 100%),
            radial-gradient(1px 1px at 67% 22%, rgba(255,255,255,0.3) 0%, transparent 100%);
        }
        .bh-moon {
          position: absolute;
          top: 5%;
          right: 12%;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 35%, #fffbe6, #f5d76e 60%, #e8b84b);
          box-shadow: 0 0 30px 10px rgba(245,200,66,0.25), 0 0 60px 20px rgba(245,200,66,0.10);
        }
        .bh-cityscape {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
        }
        .bh-ground-glow {
          position: absolute;
          bottom: 55px;
          left: 50%;
          transform: translateX(-50%);
          width: 80%;
          height: 80px;
          background: radial-gradient(ellipse at center, rgba(245,200,66,0.08) 0%, transparent 70%);
        }

        /* Taxis */
        .bh-taxi {
          position: absolute;
          bottom: 14px;
          animation: bh-drive 22s linear infinite;
        }
        .bh-taxi2 {
          animation-delay: -11s;
          animation-duration: 28s;
        }
        @keyframes bh-drive {
          from { left: -120px; }
          to   { left: calc(100% + 120px); }
        }

        /* ─── PAGE ─── */
        .bh-page {
          position: relative;
          z-index: 1;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        /* ─── NAVBAR ─── */
        .bh-navbar {
          position: sticky;
          top: 0;
          z-index: 100;
          height: 56px;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 0 20px;
          background: rgba(5,13,31,0.88);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 2px 24px rgba(0,0,0,0.4);
        }
        .bh-back-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.07);
          color: var(--text-primary);
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s;
          white-space: nowrap;
        }
        .bh-back-btn:hover {
          background: rgba(255,255,255,0.13);
          border-color: rgba(255,255,255,0.25);
        }
        .bh-navbar-title {
          font-size: 18px;
          font-weight: 700;
          letter-spacing: 0.02em;
          color: #fff;
        }
        .bh-navbar-brand {
          margin-left: auto;
          font-size: 11px;
          font-weight: 500;
          color: var(--accent-gold);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          opacity: 0.8;
        }

        /* ─── FILTER BAR ─── */
        .bh-filter-bar {
          display: flex;
          gap: 12px;
          padding: 14px 20px;
          flex-wrap: wrap;
        }
        .bh-glass-ctrl {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 14px;
          height: 42px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 10px;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          color: var(--text-primary);
          font-size: 14px;
          transition: background 0.2s, border-color 0.2s;
        }
        .bh-glass-ctrl:focus-within,
        .bh-glass-ctrl:hover {
          background: rgba(255,255,255,0.11);
          border-color: rgba(74,158,255,0.4);
        }
        .bh-glass-select {
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          outline: none;
          cursor: pointer;
          min-width: 150px;
          appearance: none;
          -webkit-appearance: none;
        }
        .bh-glass-select option { background: #0f1f45; color: #e8edf8; }
        .bh-select-arrow { color: var(--text-muted); pointer-events: none; }
        .bh-search-wrap { flex: 1; min-width: 180px; max-width: 340px; }
        .bh-glass-input {
          width: 100%;
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          outline: none;
        }
        .bh-glass-input::placeholder { color: var(--text-muted); }

        /* ─── CONTENT ─── */
        .bh-content {
          flex: 1;
          padding: 0 20px 120px;
          display: flex;
          flex-direction: column;
        }

        /* ─── MONTH GROUP ─── */
        .bh-month-group { margin-bottom: 24px; }
        .bh-month-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 16px;
          margin-bottom: 10px;
          border-radius: 10px;
          background: rgba(74,158,255,0.1);
          border: 1px solid rgba(74,158,255,0.2);
          backdrop-filter: blur(8px);
        }
        .bh-month-label {
          font-size: 14px;
          font-weight: 700;
          color: var(--accent-blue);
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .bh-month-total {
          font-size: 14px;
          font-weight: 600;
          color: var(--accent-gold);
        }

        /* ─── BILL CARD ─── */
        .bh-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 16px;
          margin-bottom: 8px;
          border-radius: 14px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.10);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          transition: background 0.2s, border-color 0.2s, transform 0.15s;
        }
        .bh-card:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.18);
          transform: translateY(-1px);
        }

        .bh-avatar {
          flex-shrink: 0;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          font-weight: 700;
          color: #fff;
          letter-spacing: 0.01em;
        }

        .bh-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
        .bh-client {
          font-size: 14px;
          font-weight: 700;
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .bh-meta {
          font-size: 12px;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .bh-tags { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 2px; }
        .bh-tag {
          padding: 2px 9px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          border: 1px solid;
        }
        .bh-tag-local, .bh-tag-outstation {
          color: #ff8c38; border-color: rgba(255,140,56,0.5); background: rgba(255,140,56,0.12);
        }
        .bh-tag-paid   { color: #2ed573; border-color: rgba(46,213,115,0.4);  background: rgba(46,213,115,0.10); }
        .bh-tag-unpaid { color: #ff4757; border-color: rgba(255,71,87,0.4);   background: rgba(255,71,87,0.10); }

        .bh-right {
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
        }
        .bh-amount { font-size: 15px; font-weight: 700; color: #fff; white-space: nowrap; }
        .bh-actions { display: flex; gap: 6px; }

        .bh-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 5px 11px;
          border-radius: 7px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid;
          transition: filter 0.15s, transform 0.1s;
          white-space: nowrap;
          background: none;
        }
        .bh-btn:hover  { filter: brightness(1.15); transform: translateY(-1px); }
        .bh-btn:active { transform: translateY(0);  filter: brightness(0.9); }
        .bh-btn-view   { color: var(--accent-blue);   border-color: rgba(74,158,255,0.4);  background: rgba(74,158,255,0.12); }
        .bh-btn-edit   { color: var(--accent-orange); border-color: rgba(255,140,56,0.4);  background: rgba(255,140,56,0.12); }
        .bh-btn-delete { color: var(--accent-red);    border-color: rgba(255,71,87,0.4);   background: rgba(255,71,87,0.10); }

        .bh-empty {
          text-align: center;
          padding: 60px 20px;
          color: var(--text-muted);
          font-size: 15px;
        }

        @media (max-width: 600px) {
          .bh-card { flex-wrap: wrap; gap: 10px; padding: 12px; }
          .bh-right { align-items: flex-start; width: 100%; flex-direction: row; justify-content: space-between; }
          .bh-actions { gap: 5px; }
          .bh-btn { padding: 4px 9px; font-size: 11px; }
          .bh-amount { font-size: 14px; }
          .bh-navbar-brand { display: none; }
        }
      `}</style>

      <div className="bh-root">
        {/* Background */}
        <div className="bh-bg">
          <div className="bh-stars" />
          <div className="bh-moon" />

          <svg className="bh-cityscape" viewBox="0 0 1440 420" preserveAspectRatio="xMidYMax meet" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bhG1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1a2a5e"/>
                <stop offset="100%" stopColor="#0c1535"/>
              </linearGradient>
              <linearGradient id="bhG2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0f1c4a"/>
                <stop offset="100%" stopColor="#080e28"/>
              </linearGradient>
              <linearGradient id="bhG3" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#142050"/>
                <stop offset="100%" stopColor="#090e24"/>
              </linearGradient>
              <filter id="bhGlow">
                <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>
            {/* Background buildings */}
            {[0,55,95,145,180,245,290,320,375,415,490,525,575,615,675,720,755,820,870,910,965,1010,1040,1110,1150,1205,1250,1285,1345,1395].map((x,i) => (
              <rect key={i} x={x} y={200+i%5*10} width={40+i%4*10} height={200-i%5*10} fill="url(#bhG2)" opacity="0.5"/>
            ))}
            {/* Mid buildings */}
            <rect x="0"   y="180" width="55" height="240" fill="url(#bhG1)"/>
            <rect x="50"  y="150" width="70" height="270" fill="url(#bhG1)"/>
            <rect x="115" y="170" width="50" height="250" fill="url(#bhG3)"/>
            <rect x="160" y="130" width="80" height="290" fill="url(#bhG1)"/>
            <rect x="235" y="165" width="45" height="255" fill="url(#bhG3)"/>
            <rect x="275" y="145" width="60" height="275" fill="url(#bhG1)"/>
            <rect x="340" y="100" width="55" height="320" fill="url(#bhG1)"/>
            <rect x="390" y="140" width="80" height="280" fill="url(#bhG3)"/>
            <rect x="465" y="120" width="50" height="300" fill="url(#bhG1)"/>
            <rect x="510" y="155" width="65" height="265" fill="url(#bhG3)"/>
            <rect x="570" y="90"  width="90" height="330" fill="url(#bhG1)"/>
            <rect x="655" y="130" width="55" height="290" fill="url(#bhG3)"/>
            <rect x="705" y="110" width="70" height="310" fill="url(#bhG1)"/>
            <rect x="770" y="145" width="60" height="275" fill="url(#bhG3)"/>
            <rect x="825" y="115" width="75" height="305" fill="url(#bhG1)"/>
            <rect x="895" y="140" width="55" height="280" fill="url(#bhG3)"/>
            <rect x="945" y="125" width="65" height="295" fill="url(#bhG1)"/>
            <rect x="1005" y="155" width="50" height="265" fill="url(#bhG3)"/>
            <rect x="1050" y="105" width="80" height="315" fill="url(#bhG1)"/>
            <rect x="1125" y="135" width="60" height="285" fill="url(#bhG3)"/>
            <rect x="1180" y="115" width="55" height="305" fill="url(#bhG1)"/>
            <rect x="1230" y="140" width="70" height="280" fill="url(#bhG3)"/>
            <rect x="1295" y="100" width="65" height="320" fill="url(#bhG1)"/>
            <rect x="1355" y="130" width="55" height="290" fill="url(#bhG3)"/>
            <rect x="1405" y="150" width="40" height="270" fill="url(#bhG1)"/>
            {/* Glowing windows */}
            <g fill="rgba(245,200,66,0.7)" filter="url(#bhGlow)">
              {[58,68,78,88,100].map(x => <rect key={x} x={x} y="160" width="5" height="5"/>)}
              {[58,78,98].map(x => <rect key={x} x={x} y="175" width="5" height="5"/>)}
              {[168,178,198,218].map(x => <rect key={x} x={x} y="140" width="5" height="5"/>)}
              {[578,593,608,623,638].map(x => <rect key={x} x={x} y="100" width="5" height="5"/>)}
              {[578,598,618,638].map(x => <rect key={x} x={x} y="115" width="5" height="5"/>)}
              {[1058,1073,1088,1103,1118].map(x => <rect key={x} x={x} y="115" width="5" height="5"/>)}
              {[1058,1078,1098,1118].map(x => <rect key={x} x={x} y="130" width="5" height="5"/>)}
              {[1300,1315,1330,1345].map(x => <rect key={x} x={x} y="110" width="5" height="5"/>)}
            </g>
            <g fill="rgba(150,200,255,0.5)">
              {[275,290,305].map(x => <rect key={x} x={x} y="155" width="5" height="5"/>)}
              {[345,360,375,385].map(x => <rect key={x} x={x} y="110" width="5" height="5"/>)}
              {[705,720,735,755].map(x => <rect key={x} x={x} y="120" width="5" height="5"/>)}
              {[828,843,858,873,888].map(x => <rect key={x} x={x} y="125" width="5" height="5"/>)}
            </g>
            {/* Road */}
            <rect x="0" y="370" width="1440" height="50" fill="#07101f"/>
            <rect x="0" y="380" width="1440" height="4"  fill="#0d1426"/>
            <g fill="rgba(245,200,66,0.45)">
              {[0,100,200,300,400,500,600,700,800,900,1000,1100,1200,1300,1400].map(x => (
                <rect key={x} x={x} y="385" width={x===1400?40:60} height="3"/>
              ))}
            </g>
          </svg>

          {/* Taxis */}
          <div className="bh-taxi">
            <svg width="88" height="36" viewBox="0 0 88 36" xmlns="http://www.w3.org/2000/svg">
              <rect x="8"  y="14" width="72" height="18" rx="4" fill="#f5c842"/>
              <rect x="18" y="6"  width="48" height="14" rx="4" fill="#e8b830"/>
              <rect x="22" y="8"  width="12" height="10" rx="2" fill="rgba(180,220,255,0.7)"/>
              <rect x="38" y="8"  width="12" height="10" rx="2" fill="rgba(180,220,255,0.7)"/>
              <rect x="52" y="8"  width="10" height="10" rx="2" fill="rgba(180,220,255,0.7)"/>
              <circle cx="20" cy="32" r="5" fill="#1a1a2e"/><circle cx="20" cy="32" r="2.5" fill="#3a3a5e"/>
              <circle cx="68" cy="32" r="5" fill="#1a1a2e"/><circle cx="68" cy="32" r="2.5" fill="#3a3a5e"/>
              <rect x="4"  y="20" width="6" height="4" rx="2" fill="rgba(255,230,100,0.9)"/>
              <rect x="78" y="20" width="6" height="4" rx="2" fill="rgba(255,100,80,0.8)"/>
            </svg>
          </div>
          <div className="bh-taxi bh-taxi2">
            <svg width="74" height="30" viewBox="0 0 74 30" xmlns="http://www.w3.org/2000/svg">
              <rect x="6"  y="12" width="62" height="15" rx="3" fill="#f5c842"/>
              <rect x="14" y="5"  width="42" height="12" rx="3" fill="#e8b830"/>
              <rect x="17" y="7"  width="10" height="8"  rx="1.5" fill="rgba(180,220,255,0.7)"/>
              <rect x="31" y="7"  width="10" height="8"  rx="1.5" fill="rgba(180,220,255,0.7)"/>
              <rect x="44" y="7"  width="9"  height="8"  rx="1.5" fill="rgba(180,220,255,0.7)"/>
              <circle cx="17" cy="27" r="4" fill="#1a1a2e"/><circle cx="17" cy="27" r="2" fill="#3a3a5e"/>
              <circle cx="57" cy="27" r="4" fill="#1a1a2e"/><circle cx="57" cy="27" r="2" fill="#3a3a5e"/>
              <rect x="2"  y="17" width="5" height="3" rx="1.5" fill="rgba(255,230,100,0.9)"/>
              <rect x="67" y="17" width="5" height="3" rx="1.5" fill="rgba(255,100,80,0.8)"/>
            </svg>
          </div>

          <div className="bh-ground-glow" />
        </div>

        {/* Page */}
        <div className="bh-page">
          {/* Navbar */}
          <nav className="bh-navbar">
            <button className="bh-back-btn" onClick={onBack}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back
            </button>
            <span className="bh-navbar-title">Bill History</span>
            <span className="bh-navbar-brand">Bhardwaj Travels</span>
          </nav>

          {/* Filter bar */}
          <div className="bh-filter-bar">
            <div className="bh-glass-ctrl">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{color:"var(--text-muted)",flexShrink:0}}>
                <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M9.5 9.5L12.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <select
                className="bh-glass-select"
                value={clientFilter}
                onChange={e => setClientFilter(e.target.value)}
              >
                <option value="">All Clients</option>
                {uniqueClients.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <svg className="bh-select-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            <div className="bh-glass-ctrl bh-search-wrap">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{color:"var(--text-muted)",flexShrink:0}}>
                <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M9.5 9.5L12.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input
                className="bh-glass-input"
                type="text"
                placeholder="Search bills…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Bill list */}
          <div className="bh-content">
            {groups.length === 0 && (
              <div className="bh-empty">No bills found.</div>
            )}
            {groups.map((g, gi) => (
              <div key={gi} className="bh-month-group">
                <div className="bh-month-header">
                  <span className="bh-month-label">{g.label}</span>
                  <span className="bh-month-total">Total: ₹{g.total.toFixed(2)}</span>
                </div>
                {g.bills.map(b => {
                  const c = calcBill(b);
                  const ini = initials(b.client_name);
                  const color = avatarColor(b.client_name || "");
                  const isLocal = b.duty_type === "local";
                  const dutyLabel = isLocal ? "Local" : b.duty_type === "outstation" ? "Outstation" : (b.duty_type || "");
                  return (
                    <div key={b.id} className="bh-card">
                      <div className="bh-avatar" style={{background: color}}>{ini}</div>
                      <div className="bh-info">
                        <div className="bh-client">{b.client_name}</div>
                        <div className="bh-meta">#{b.invoice_no} · {b.date} · {b.cab_no}</div>
                        <div className="bh-tags">
                          <span className={`bh-tag ${isLocal ? "bh-tag-local" : "bh-tag-outstation"}`}>{dutyLabel}</span>
                          <span className={`bh-tag ${b.paid ? "bh-tag-paid" : "bh-tag-unpaid"}`}>{b.paid ? "Paid" : "Unpaid"}</span>
                        </div>
                      </div>
                      <div className="bh-right">
                        <div className="bh-amount">₹{c.grand.toFixed(2)}</div>
                        <div className="bh-actions">
                          <button className="bh-btn bh-btn-view" onClick={() => onView(b)}>
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <circle cx="6" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
                              <path d="M1 6s2-4 5-4 5 4 5 4-2 4-5 4-5-4-5-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                            </svg>
                            View
                          </button>
                          <button className="bh-btn bh-btn-edit" onClick={() => onEdit(b)}>
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M8.5 1.5l2 2-7 7H1.5v-2l7-7z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                            </svg>
                            Edit
                          </button>
                          <button className="bh-btn bh-btn-delete" onClick={() => onDelete(b.id)}>
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M1.5 3h9M5 3V1.5h2V3M4.5 5v4M7.5 5v4M2.5 3l.8 7.5h5.4L9.5 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
