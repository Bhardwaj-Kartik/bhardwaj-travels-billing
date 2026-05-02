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

export default function SummaryPage({ bills, onBack, onView, calcBill }) {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const [appliedFrom, setAppliedFrom] = useState("");
  const [appliedTo, setAppliedTo] = useState("");
  const [appliedClient, setAppliedClient] = useState("");

  function applyFilter() {
    setAppliedFrom(fromDate);
    setAppliedTo(toDate);
    setAppliedClient(clientSearch);
  }

  const summaryBills = useMemo(() => {
    return bills.filter(b => {
      let ok = true;
      if (appliedFrom) ok = ok && b.date >= appliedFrom;
      if (appliedTo) ok = ok && b.date <= appliedTo;
      if (appliedClient) ok = ok && (b.client_name || "").toLowerCase().includes(appliedClient.toLowerCase());
      return ok;
    });
  }, [bills, appliedFrom, appliedTo, appliedClient]);

  const stats = useMemo(() => {
    return summaryBills.reduce((acc, b) => {
      const c = calcBill(b);
      (b.gstLines || []).filter(g => g.enabled).forEach(g => {
        const amt = c.subtotal * (parseFloat(g.pct) || 0) / 100;
        acc.tax += amt;
      });
      acc.count++;
      acc.grand += c.grand;
      acc.subtotal += c.subtotal;
      return acc;
    }, { count: 0, grand: 0, subtotal: 0, tax: 0 });
  }, [summaryBills, calcBill]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');

        .sp-root *, .sp-root *::before, .sp-root *::after {
          box-sizing: border-box; margin: 0; padding: 0;
        }
        .sp-root {
          --navy-deep:    #050d1f;
          --text-primary: #e8edf8;
          --text-muted:   #8a9bbf;
          --accent-gold:  #f5c842;
          --accent-blue:  #4a9eff;
          --accent-orange:#ff8c38;
          --accent-green: #2ed573;
          --accent-purple:#b47dff;
          font-family: 'DM Sans', sans-serif;
          color: var(--text-primary);
          background: var(--navy-deep);
          min-height: 100vh;
          overflow-x: hidden;
          position: relative;
        }

        /* ─── BACKGROUND ─── */
        .sp-bg {
          position: fixed;
          inset: 0;
          z-index: 0;
          overflow: hidden;
          pointer-events: none;
        }
        .sp-bg::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 80% 60% at 50% 0%, #1a2a6c 0%, #0a1530 40%, #050d1f 100%);
        }
        .sp-stars {
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
        .sp-moon {
          position: absolute;
          top: 5%; right: 12%;
          width: 44px; height: 44px;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 35%, #fffbe6, #f5d76e 60%, #e8b84b);
          box-shadow: 0 0 30px 10px rgba(245,200,66,0.25), 0 0 60px 20px rgba(245,200,66,0.10);
        }
        .sp-cityscape { position: absolute; bottom: 0; left: 0; width: 100%; }
        .sp-ground-glow {
          position: absolute; bottom: 55px; left: 50%; transform: translateX(-50%);
          width: 80%; height: 80px;
          background: radial-gradient(ellipse at center, rgba(245,200,66,0.08) 0%, transparent 70%);
        }
        .sp-taxi {
          position: absolute; bottom: 14px;
          animation: sp-drive 22s linear infinite;
        }
        .sp-taxi2 { animation-delay: -11s; animation-duration: 28s; }
        @keyframes sp-drive {
          from { left: -120px; }
          to   { left: calc(100% + 120px); }
        }

        /* ─── PAGE ─── */
        .sp-page {
          position: relative; z-index: 1;
          min-height: 100vh;
          display: flex; flex-direction: column;
        }

        /* ─── NAVBAR ─── */
        .sp-navbar {
          position: sticky; top: 0; z-index: 100;
          height: 56px;
          display: flex; align-items: center; gap: 14px;
          padding: 0 20px;
          background: rgba(5,13,31,0.90);
          backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px);
          border-bottom: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 2px 24px rgba(0,0,0,0.45);
        }
        .sp-back-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 7px 14px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.07);
          color: var(--text-primary);
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 500;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s;
          white-space: nowrap;
        }
        .sp-back-btn:hover {
          background: rgba(255,255,255,0.13);
          border-color: rgba(255,255,255,0.25);
        }
        .sp-navbar-title { font-size: 18px; font-weight: 700; letter-spacing: 0.02em; color: #fff; }
        .sp-navbar-brand {
          margin-left: auto;
          font-size: 11px; font-weight: 500;
          color: var(--accent-gold);
          letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.8;
        }

        /* ─── MAIN ─── */
        .sp-main {
          flex: 1;
          padding: 20px 20px 100px;
          display: flex; flex-direction: column; gap: 18px;
          max-width: 900px; width: 100%; margin: 0 auto;
        }

        /* ─── GLASS PANEL ─── */
        .sp-glass-panel {
          background: rgba(255,255,255,0.055);
          border: 1px solid rgba(255,255,255,0.13);
          border-radius: 16px;
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          padding: 18px 20px;
        }

        /* ─── SECTION LABEL ─── */
        .sp-section-label {
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--accent-gold);
          margin-bottom: 14px;
          display: flex; align-items: center; gap: 8px;
        }
        .sp-section-label::after {
          content: ''; flex: 1; height: 1px;
          background: rgba(255,255,255,0.08);
        }

        /* ─── FILTER ─── */
        .sp-filter-row {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 12px; margin-bottom: 12px;
        }
        .sp-filter-full { grid-column: 1 / -1; }
        .sp-field-wrap { display: flex; flex-direction: column; gap: 6px; }
        .sp-field-label {
          font-size: 11px; font-weight: 600;
          color: var(--text-muted);
          letter-spacing: 0.05em; text-transform: uppercase;
        }
        .sp-field-label span { font-weight: 400; opacity: 0.6; text-transform: none; }
        .sp-input-wrap {
          display: flex; align-items: center; gap: 8px;
          padding: 0 13px; height: 42px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 10px;
          transition: border-color 0.2s, background 0.2s;
        }
        .sp-input-wrap:focus-within {
          border-color: rgba(74,158,255,0.5);
          background: rgba(74,158,255,0.07);
        }
        .sp-input {
          flex: 1; background: transparent; border: none;
          color: var(--text-primary);
          font-family: 'DM Sans', sans-serif; font-size: 14px;
          outline: none; min-width: 0;
        }
        .sp-input::placeholder { color: var(--text-muted); }
        .sp-input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(0.6) sepia(1) saturate(0.5) hue-rotate(180deg);
          cursor: pointer; opacity: 0.7;
        }
        .sp-filter-btn {
          display: flex; align-items: center; justify-content: center; gap: 7px;
          padding: 0 20px; height: 42px;
          border-radius: 10px;
          border: 1px solid rgba(74,158,255,0.35);
          background: rgba(74,158,255,0.12);
          color: var(--accent-blue);
          font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s, transform 0.1s;
          white-space: nowrap;
        }
        .sp-filter-btn:hover {
          background: rgba(74,158,255,0.22);
          border-color: rgba(74,158,255,0.6);
        }
        .sp-filter-btn:active { transform: scale(0.97); }

        /* ─── STAT CARDS ─── */
        .sp-stat-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 14px;
        }
        .sp-stat-card {
          background: rgba(255,255,255,0.055);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 16px;
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          padding: 20px 20px 18px;
          display: flex; flex-direction: column; gap: 6px;
          position: relative; overflow: hidden;
          transition: border-color 0.2s, background 0.2s, transform 0.15s;
        }
        .sp-stat-card:hover { transform: translateY(-2px); background: rgba(255,255,255,0.08); }
        .sp-stat-card::before {
          content: ''; position: absolute;
          top: 0; left: 0; right: 0; height: 3px;
          border-radius: 16px 16px 0 0;
        }
        .sp-stat-card::after {
          content: ''; position: absolute;
          bottom: -20px; right: -20px;
          width: 90px; height: 90px;
          border-radius: 50%; opacity: 0.12; pointer-events: none;
        }
        .sp-card-blue::before   { background: linear-gradient(90deg, var(--accent-blue), transparent); }
        .sp-card-blue::after    { background: var(--accent-blue); }
        .sp-card-green::before  { background: linear-gradient(90deg, var(--accent-green), transparent); }
        .sp-card-green::after   { background: var(--accent-green); }
        .sp-card-orange::before { background: linear-gradient(90deg, var(--accent-orange), transparent); }
        .sp-card-orange::after  { background: var(--accent-orange); }
        .sp-card-purple::before { background: linear-gradient(90deg, var(--accent-purple), transparent); }
        .sp-card-purple::after  { background: var(--accent-purple); }

        .sp-stat-icon {
          width: 32px; height: 32px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 4px; flex-shrink: 0;
        }
        .sp-card-blue   .sp-stat-icon { background: rgba(74,158,255,0.15);  color: var(--accent-blue); }
        .sp-card-green  .sp-stat-icon { background: rgba(46,213,115,0.15);  color: var(--accent-green); }
        .sp-card-orange .sp-stat-icon { background: rgba(255,140,56,0.15);  color: var(--accent-orange); }
        .sp-card-purple .sp-stat-icon { background: rgba(180,125,255,0.15); color: var(--accent-purple); }

        .sp-stat-value {
          font-size: 26px; font-weight: 700;
          line-height: 1; letter-spacing: -0.01em;
        }
        .sp-card-blue   .sp-stat-value { color: var(--accent-blue); }
        .sp-card-green  .sp-stat-value { color: var(--accent-green); }
        .sp-card-orange .sp-stat-value { color: var(--accent-orange); }
        .sp-card-purple .sp-stat-value { color: var(--accent-purple); }

        .sp-stat-label { font-size: 12px; font-weight: 500; color: var(--text-muted); }

        /* ─── BILLS LIST ─── */
        .sp-bills-section { display: flex; flex-direction: column; gap: 10px; }
        .sp-bills-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 18px;
          background: rgba(74,158,255,0.09);
          border: 1px solid rgba(74,158,255,0.18);
          border-radius: 12px;
          backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
        }
        .sp-bills-title { font-size: 14px; font-weight: 700; color: var(--accent-blue); letter-spacing: 0.03em; }
        .sp-bills-count {
          font-size: 12px; font-weight: 600; color: var(--text-muted);
          background: rgba(74,158,255,0.12);
          padding: 3px 10px; border-radius: 20px;
          border: 1px solid rgba(74,158,255,0.2);
        }

        .sp-bill-row {
          display: flex; align-items: center; gap: 14px;
          padding: 14px 18px; border-radius: 14px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.09);
          backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
          transition: background 0.2s, border-color 0.2s, transform 0.15s;
        }
        .sp-bill-row:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.16);
          transform: translateY(-1px);
        }

        .sp-avatar {
          flex-shrink: 0; width: 40px; height: 40px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700; color: #fff;
        }

        .sp-bill-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
        .sp-bill-client {
          font-size: 14px; font-weight: 700; color: #fff;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .sp-bill-meta { font-size: 12px; color: var(--text-muted); }

        .sp-bill-right { flex-shrink: 0; display: flex; align-items: center; gap: 12px; }
        .sp-bill-amount { font-size: 15px; font-weight: 700; color: var(--text-primary); white-space: nowrap; }

        .sp-view-btn {
          display: flex; align-items: center; gap: 5px;
          padding: 6px 14px; border-radius: 8px;
          border: 1px solid rgba(74,158,255,0.35);
          background: rgba(74,158,255,0.12);
          color: var(--accent-blue);
          font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s, transform 0.1s;
          white-space: nowrap;
        }
        .sp-view-btn:hover { background: rgba(74,158,255,0.22); border-color: rgba(74,158,255,0.55); }
        .sp-view-btn:active { transform: scale(0.96); }

        .sp-empty {
          text-align: center; padding: 48px 20px;
          color: var(--text-muted); font-size: 14px;
        }

        @media (max-width: 600px) {
          .sp-main { padding: 14px 12px 80px; gap: 14px; }
          .sp-filter-row { grid-template-columns: 1fr; }
          .sp-stat-grid { gap: 10px; }
          .sp-stat-value { font-size: 20px; }
          .sp-stat-label { font-size: 11px; }
          .sp-bill-row { padding: 12px 13px; gap: 10px; }
          .sp-bill-right { flex-direction: column; align-items: flex-end; gap: 6px; }
          .sp-bill-meta { font-size: 11px; }
          .sp-navbar-brand { display: none; }
          .sp-glass-panel { padding: 15px 14px; }
        }
        @media (max-width: 380px) {
          .sp-stat-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="sp-root">
        {/* Background */}
        <div className="sp-bg">
          <div className="sp-stars" />
          <div className="sp-moon" />

          <svg className="sp-cityscape" viewBox="0 0 1440 420" preserveAspectRatio="xMidYMax meet" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="spG1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1a2a5e"/><stop offset="100%" stopColor="#0c1535"/>
              </linearGradient>
              <linearGradient id="spG2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0f1c4a"/><stop offset="100%" stopColor="#080e28"/>
              </linearGradient>
              <linearGradient id="spG3" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#142050"/><stop offset="100%" stopColor="#090e24"/>
              </linearGradient>
              <filter id="spGlow">
                <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>
            {/* Far bg buildings */}
            {[0,55,95,145,180,245,290,320,375,415,490,525,575,615,675,720,755,820,870,910,965,1010,1040,1110,1150,1205,1250,1285,1345,1395].map((x,i)=>(
              <rect key={i} x={x} y={200+i%5*10} width={40+i%4*10} height={200-i%5*10} fill="url(#spG2)" opacity="0.5"/>
            ))}
            {/* Mid buildings */}
            <rect x="0"    y="180" width="55"  height="240" fill="url(#spG1)"/>
            <rect x="50"   y="150" width="70"  height="270" fill="url(#spG1)"/>
            <rect x="115"  y="170" width="50"  height="250" fill="url(#spG3)"/>
            <rect x="160"  y="130" width="80"  height="290" fill="url(#spG1)"/>
            <rect x="235"  y="165" width="45"  height="255" fill="url(#spG3)"/>
            <rect x="275"  y="145" width="60"  height="275" fill="url(#spG1)"/>
            <rect x="340"  y="100" width="55"  height="320" fill="url(#spG1)"/>
            <rect x="390"  y="140" width="80"  height="280" fill="url(#spG3)"/>
            <rect x="465"  y="120" width="50"  height="300" fill="url(#spG1)"/>
            <rect x="510"  y="155" width="65"  height="265" fill="url(#spG3)"/>
            <rect x="570"  y="90"  width="90"  height="330" fill="url(#spG1)"/>
            <rect x="655"  y="130" width="55"  height="290" fill="url(#spG3)"/>
            <rect x="705"  y="110" width="70"  height="310" fill="url(#spG1)"/>
            <rect x="770"  y="145" width="60"  height="275" fill="url(#spG3)"/>
            <rect x="825"  y="115" width="75"  height="305" fill="url(#spG1)"/>
            <rect x="895"  y="140" width="55"  height="280" fill="url(#spG3)"/>
            <rect x="945"  y="125" width="65"  height="295" fill="url(#spG1)"/>
            <rect x="1005" y="155" width="50"  height="265" fill="url(#spG3)"/>
            <rect x="1050" y="105" width="80"  height="315" fill="url(#spG1)"/>
            <rect x="1125" y="135" width="60"  height="285" fill="url(#spG3)"/>
            <rect x="1180" y="115" width="55"  height="305" fill="url(#spG1)"/>
            <rect x="1230" y="140" width="70"  height="280" fill="url(#spG3)"/>
            <rect x="1295" y="100" width="65"  height="320" fill="url(#spG1)"/>
            <rect x="1355" y="130" width="55"  height="290" fill="url(#spG3)"/>
            <rect x="1405" y="150" width="40"  height="270" fill="url(#spG1)"/>
            {/* Gold windows */}
            <g fill="rgba(245,200,66,0.7)" filter="url(#spGlow)">
              {[58,68,78,98].map(x=><rect key={x} x={x} y="160" width="5" height="5"/>)}
              {[58,88].map(x=><rect key={x} x={x} y="190" width="5" height="5"/>)}
              {[168,188,218].map(x=><rect key={x} x={x} y="140" width="5" height="5"/>)}
              {[578,593,608,623].map(x=><rect key={x} x={x} y="100" width="5" height="5"/>)}
              {[578,618].map(x=><rect key={x} x={x} y="115" width="5" height="5"/>)}
              {[578,613,633].map(x=><rect key={x} x={x} y="130" width="5" height="5"/>)}
              {[1058,1073,1103,1118].map(x=><rect key={x} x={x} y="115" width="5" height="5"/>)}
              {[1058,1098].map(x=><rect key={x} x={x} y="130" width="5" height="5"/>)}
              {[1300,1315,1330].map(x=><rect key={x} x={x} y="110" width="5" height="5"/>)}
              {[1300,1340,1315].map(x=><rect key={x} x={x} y="125" width="5" height="5"/>)}
            </g>
            {/* Blue windows */}
            <g fill="rgba(150,200,255,0.5)">
              {[275,290,305].map(x=><rect key={x} x={x} y="155" width="5" height="5"/>)}
              {[345,360,385].map(x=><rect key={x} x={x} y="110" width="5" height="5"/>)}
              {[705,720,755].map(x=><rect key={x} x={x} y="120" width="5" height="5"/>)}
              {[705,745].map(x=><rect key={x} x={x} y="135" width="5" height="5"/>)}
              {[828,843,858,888].map(x=><rect key={x} x={x} y="125" width="5" height="5"/>)}
              {[828,868].map(x=><rect key={x} x={x} y="140" width="5" height="5"/>)}
            </g>
            {/* Road */}
            <rect x="0" y="370" width="1440" height="50" fill="#07101f"/>
            <g fill="rgba(245,200,66,0.45)">
              {[0,100,200,300,400,500,600,700,800,900,1000,1100,1200,1300,1400].map(x=>(
                <rect key={x} x={x} y="385" width={x===1400?40:60} height="3"/>
              ))}
            </g>
          </svg>

          {/* Taxis */}
          <div className="sp-taxi">
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
          <div className="sp-taxi sp-taxi2">
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
          <div className="sp-ground-glow" />
        </div>

        {/* Page */}
        <div className="sp-page">
          {/* Navbar */}
          <nav className="sp-navbar">
            <button className="sp-back-btn" onClick={onBack}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back
            </button>
            <span className="sp-navbar-title">Summary</span>
            <span className="sp-navbar-brand">Bhardwaj Travels</span>
          </nav>

          <div className="sp-main">
            {/* Filter */}
            <div className="sp-glass-panel">
              <div className="sp-section-label">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{flexShrink:0}}>
                  <path d="M1 2.5h11M3 6.5h7M5 10.5h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                Filter
              </div>

              <div className="sp-filter-row">
                <div className="sp-field-wrap">
                  <span className="sp-field-label">From Date</span>
                  <div className="sp-input-wrap">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{color:"var(--text-muted)",flexShrink:0}}>
                      <rect x="1.5" y="2.5" width="11" height="10" rx="2" stroke="currentColor" strokeWidth="1.4"/>
                      <path d="M1.5 6h11" stroke="currentColor" strokeWidth="1.4"/>
                      <path d="M4.5 1v2M9.5 1v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                    <input className="sp-input" type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
                  </div>
                </div>
                <div className="sp-field-wrap">
                  <span className="sp-field-label">To Date</span>
                  <div className="sp-input-wrap">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{color:"var(--text-muted)",flexShrink:0}}>
                      <rect x="1.5" y="2.5" width="11" height="10" rx="2" stroke="currentColor" strokeWidth="1.4"/>
                      <path d="M1.5 6h11" stroke="currentColor" strokeWidth="1.4"/>
                      <path d="M4.5 1v2M9.5 1v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                    <input className="sp-input" type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="sp-filter-row" style={{marginBottom:14}}>
                <div className="sp-field-wrap sp-filter-full">
                  <span className="sp-field-label">Client Name <span>(optional)</span></span>
                  <div className="sp-input-wrap">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{color:"var(--text-muted)",flexShrink:0}}>
                      <circle cx="7" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
                      <path d="M2 12.5c0-2.5 2.2-4 5-4s5 1.5 5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                    <input
                      className="sp-input"
                      type="text"
                      placeholder="Leave blank for all"
                      value={clientSearch}
                      onChange={e => setClientSearch(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && applyFilter()}
                    />
                  </div>
                </div>
              </div>

              <div style={{display:"flex",justifyContent:"flex-end"}}>
                <button className="sp-filter-btn" onClick={applyFilter}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M9.5 9.5L12.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  Apply Filter
                </button>
              </div>
            </div>

            {/* Stat cards */}
            <div className="sp-stat-grid">
              <div className="sp-stat-card sp-card-blue">
                <div className="sp-stat-icon">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="2" y="1.5" width="12" height="13" rx="2" stroke="currentColor" strokeWidth="1.4"/>
                    <path d="M5 5.5h6M5 8h4M5 10.5h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="sp-stat-value">{stats.count}</div>
                <div className="sp-stat-label">Total Bills</div>
              </div>

              <div className="sp-stat-card sp-card-green">
                <div className="sp-stat-icon">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 2v12M5 4.5c0-1.1.9-2 2.5-2s2.5.9 2.5 2c0 2.5-5 2-5 4.5 0 1.4 1.1 2.5 2.5 2.5s2.5-.9 2.5-2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="sp-stat-value">₹{stats.grand.toFixed(2)}</div>
                <div className="sp-stat-label">Grand Total</div>
              </div>

              <div className="sp-stat-card sp-card-orange">
                <div className="sp-stat-icon">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 13L13 3M10 3h3v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="5" cy="11" r="1.5" stroke="currentColor" strokeWidth="1.3"/>
                    <circle cx="11" cy="5"  r="1.5" stroke="currentColor" strokeWidth="1.3"/>
                  </svg>
                </div>
                <div className="sp-stat-value">₹{stats.subtotal.toFixed(2)}</div>
                <div className="sp-stat-label">Taxable Amount</div>
              </div>

              <div className="sp-stat-card sp-card-purple">
                <div className="sp-stat-icon">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 4h10M3 8h7M3 12h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    <circle cx="12.5" cy="11.5" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
                    <path d="M12.5 10.5v1l.7.7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="sp-stat-value">₹{stats.tax.toFixed(2)}</div>
                <div className="sp-stat-label">Tax Collected</div>
              </div>
            </div>

            {/* Bills list */}
            <div className="sp-bills-section">
              <div className="sp-bills-header">
                <span className="sp-bills-title">Bills in Range</span>
                <span className="sp-bills-count">{summaryBills.length} {summaryBills.length === 1 ? "bill" : "bills"}</span>
              </div>
              {summaryBills.length === 0 && (
                <div className="sp-empty">No bills match the selected filters.</div>
              )}
              {summaryBills.map(b => {
                const c = calcBill(b);
                const ini = initials(b.client_name);
                const color = avatarColor(b.client_name || "");
                return (
                  <div key={b.id} className="sp-bill-row">
                    <div className="sp-avatar" style={{background: color}}>{ini}</div>
                    <div className="sp-bill-info">
                      <div className="sp-bill-client">{b.client_name}</div>
                      <div className="sp-bill-meta">#{b.invoice_no} &middot; {b.date}</div>
                    </div>
                    <div className="sp-bill-right">
                      <div className="sp-bill-amount">₹{c.grand.toFixed(2)}</div>
                      <button className="sp-view-btn" onClick={() => onView(b)}>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <circle cx="6" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
                          <path d="M1 6s2-4 5-4 5 4 5 4-2 4-5 4-5-4-5-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                        </svg>
                        View
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
