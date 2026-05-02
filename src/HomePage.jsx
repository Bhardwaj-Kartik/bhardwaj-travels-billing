import { useEffect, useRef } from "react";
import logo from "./assets/logo.png";
import "./HomePage.css";

export default function HomePage({ bills, onNavigate, onLogout }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let stars = [];
    let animFrameId;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      buildStars();
    }

    function buildStars() {
      stars = [];
      const count = Math.floor((canvas.width * canvas.height) / 3200);
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height * 0.72,
          r: Math.random() * 1.4 + 0.3,
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.8 + 0.3,
        });
      }
    }

    function draw(t) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((s) => {
        const alpha = 0.4 + 0.55 * (0.5 + 0.5 * Math.sin(t * s.speed * 0.001 + s.phase));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220,215,255,${alpha.toFixed(2)})`;
        ctx.fill();
      });
      animFrameId = requestAnimationFrame(draw);
    }

    window.addEventListener("resize", resize);
    resize();
    animFrameId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animFrameId);
    };
  }, []);

  const totalBills = bills.length;
  const paidBills = bills.filter((b) => b.paid).length;
  const unpaidBills = bills.filter((b) => !b.paid).length;

  const menuCards = [
    {
      cls: "card-create",
      page: "create",
      label: "Create Bill",
      desc: "Generate a new travel invoice",
      icon: (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#a078ff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="12" y1="18" x2="12" y2="12" />
          <line x1="9" y1="15" x2="15" y2="15" />
        </svg>
      ),
    },
    {
      cls: "card-history",
      page: "history",
      label: "History",
      desc: "View all past billing records",
      icon: (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#60d4f8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          <line x1="12" y1="11" x2="12" y2="17" />
          <polyline points="9 14 12 17 15 14" />
        </svg>
      ),
    },
    {
      cls: "card-check",
      page: "checklist",
      label: "Checklist",
      desc: "Track outstanding payments",
      icon: (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#5effa0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 11 12 14 22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      ),
    },
    {
      cls: "card-summary",
      page: "summary",
      label: "Summary",
      desc: "Monthly earnings overview",
      icon: (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ffb86c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
          <line x1="2" y1="20" x2="22" y2="20" />
        </svg>
      ),
    },
  ];

  return (
    <div className="hp-page">
      {/* ── City Background ── */}
      <div className="hp-city-bg" aria-hidden="true">
        <div className="hp-moon" />
        <canvas className="hp-stars" ref={canvasRef} />

        {/* Skyline SVG */}
        <svg className="hp-skyline-svg" viewBox="0 0 1440 600" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="winGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f5e080" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#f5c842" stopOpacity="0.3" />
            </radialGradient>
            <linearGradient id="bldA" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1a1550" />
              <stop offset="100%" stopColor="#0d0e28" />
            </linearGradient>
            <linearGradient id="bldB" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#13104a" />
              <stop offset="100%" stopColor="#0a0b22" />
            </linearGradient>
            <linearGradient id="bldC" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#200e5a" />
              <stop offset="100%" stopColor="#100c30" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <linearGradient id="groundFog" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06071a" stopOpacity="0" />
              <stop offset="100%" stopColor="#06071a" stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* Far BG buildings */}
          <rect x="0" y="340" width="80" height="260" fill="#0c0d24" rx="1"/><rect x="85" y="290" width="55" height="310" fill="#0e0f28" rx="1"/><rect x="145" y="360" width="45" height="240" fill="#0a0b20" rx="1"/><rect x="195" y="320" width="70" height="280" fill="#0d0e26" rx="1"/><rect x="270" y="280" width="50" height="320" fill="#0b0c22" rx="1"/><rect x="325" y="350" width="60" height="250" fill="#0e0f2a" rx="1"/><rect x="390" y="300" width="75" height="300" fill="#0c0d24" rx="1"/><rect x="470" y="260" width="55" height="340" fill="#0d0e28" rx="1"/><rect x="530" y="330" width="65" height="270" fill="#0b0c22" rx="1"/><rect x="600" y="290" width="50" height="310" fill="#0e0f2a" rx="1"/><rect x="655" y="360" width="80" height="240" fill="#0a0b1e" rx="1"/><rect x="740" y="300" width="60" height="300" fill="#0c0d24" rx="1"/><rect x="805" y="270" width="55" height="330" fill="#0d0e26" rx="1"/><rect x="865" y="340" width="70" height="260" fill="#0b0c22" rx="1"/><rect x="940" y="310" width="50" height="290" fill="#0e0f2a" rx="1"/><rect x="995" y="280" width="65" height="320" fill="#0d0e28" rx="1"/><rect x="1065" y="350" width="55" height="250" fill="#0a0b20" rx="1"/><rect x="1125" y="300" width="80" height="300" fill="#0c0d24" rx="1"/><rect x="1210" y="270" width="60" height="330" fill="#0e0f28" rx="1"/><rect x="1275" y="330" width="70" height="270" fill="#0b0c22" rx="1"/><rect x="1350" y="285" width="90" height="315" fill="#0d0e26" rx="1"/>

          {/* Mid buildings — tall tower left */}
          <rect x="10" y="180" width="90" height="420" fill="url(#bldB)" rx="2"/><rect x="40" y="165" width="30" height="20" fill="#1a1550" rx="1"/><rect x="50" y="155" width="10" height="12" fill="#6c4fcf" rx="1" filter="url(#glow)"/>
          <rect x="20" y="200" width="12" height="8" fill="url(#winGlow)" rx="1" opacity="0.85"/><rect x="40" y="200" width="12" height="8" fill="url(#winGlow)" rx="1" opacity="0.7"/><rect x="60" y="200" width="12" height="8" fill="url(#winGlow)" rx="1" opacity="0.9"/><rect x="80" y="200" width="12" height="8" fill="url(#winGlow)" rx="1" opacity="0.5"/><rect x="20" y="220" width="12" height="8" fill="url(#winGlow)" rx="1" opacity="0.6"/><rect x="40" y="220" width="12" height="8" fill="url(#winGlow)" rx="1" opacity="0.4"/><rect x="60" y="220" width="12" height="8" fill="url(#winGlow)" rx="1" opacity="0.85"/><rect x="80" y="220" width="12" height="8" fill="url(#winGlow)" rx="1" opacity="0.7"/><rect x="20" y="240" width="12" height="8" fill="url(#winGlow)" rx="1" opacity="0.3"/><rect x="40" y="240" width="12" height="8" fill="url(#winGlow)" rx="1" opacity="0.9"/><rect x="60" y="240" width="12" height="8" fill="url(#winGlow)" rx="1" opacity="0.5"/><rect x="80" y="240" width="12" height="8" fill="url(#winGlow)" rx="1" opacity="0.8"/>

          {/* Wide mid building */}
          <rect x="115" y="200" width="130" height="400" fill="url(#bldA)" rx="2"/>
          <rect x="135" y="210" width="14" height="10" fill="url(#winGlow)" rx="1" opacity="0.85"/><rect x="160" y="210" width="14" height="10" fill="url(#winGlow)" rx="1" opacity="0.5"/><rect x="185" y="210" width="14" height="10" fill="url(#winGlow)" rx="1" opacity="0.9"/><rect x="210" y="210" width="14" height="10" fill="url(#winGlow)" rx="1" opacity="0.65"/><rect x="135" y="232" width="14" height="10" fill="url(#winGlow)" rx="1" opacity="0.4"/><rect x="160" y="232" width="14" height="10" fill="url(#winGlow)" rx="1" opacity="0.8"/><rect x="185" y="232" width="14" height="10" fill="url(#winGlow)" rx="1" opacity="0.3"/><rect x="210" y="232" width="14" height="10" fill="url(#winGlow)" rx="1" opacity="0.75"/><rect x="135" y="254" width="14" height="10" fill="url(#winGlow)" rx="1" opacity="0.9"/><rect x="160" y="254" width="14" height="10" fill="url(#winGlow)" rx="1" opacity="0.55"/><rect x="185" y="254" width="14" height="10" fill="url(#winGlow)" rx="1" opacity="0.7"/><rect x="210" y="254" width="14" height="10" fill="url(#winGlow)" rx="1" opacity="0.45"/>

          {/* Skyscraper centre-left */}
          <rect x="260" y="120" width="75" height="480" fill="url(#bldC)" rx="2"/><rect x="282" y="105" width="30" height="18" fill="#200e5a" rx="1"/><rect x="292" y="93" width="10" height="14" fill="#9060ff" rx="1" filter="url(#glow)"/>
          <rect x="270" y="140" width="12" height="8" fill="url(#winGlow)" rx="1" opacity="0.75"/><rect x="292" y="140" width="12" height="8" fill="url(#winGlow)" rx="1" opacity="0.9"/><rect x="314" y="140" width="12" height="8" fill="url(#winGlow)" rx="1" opacity="0.4"/><rect x="270" y="162" width="12" height="8" fill="url(#winGlow)" rx="1" opacity="0.6"/><rect x="292" y="162" width="12" height="8" fill="url(#winGlow)" rx="1" opacity="0.8"/><rect x="314" y="162" width="12" height="8" fill="url(#winGlow)" rx="1" opacity="0.5"/><rect x="270" y="184" width="12" height="8" fill="url(#winGlow)" rx="1" opacity="0.85"/><rect x="292" y="184" width="12" height="8" fill="url(#winGlow)" rx="1" opacity="0.35"/><rect x="314" y="184" width="12" height="8" fill="url(#winGlow)" rx="1" opacity="0.7"/><rect x="270" y="206" width="12" height="8" fill="url(#winGlow)" rx="1" opacity="0.5"/><rect x="292" y="206" width="12" height="8" fill="url(#winGlow)" rx="1" opacity="0.9"/><rect x="314" y="206" width="12" height="8" fill="url(#winGlow)" rx="1" opacity="0.6"/>

          {/* Medium building */}
          <rect x="350" y="230" width="95" height="370" fill="url(#bldA)" rx="2"/>
          <rect x="360" y="244" width="13" height="9" fill="url(#winGlow)" rx="1" opacity="0.8"/><rect x="383" y="244" width="13" height="9" fill="url(#winGlow)" rx="1" opacity="0.5"/><rect x="406" y="244" width="13" height="9" fill="url(#winGlow)" rx="1" opacity="0.9"/><rect x="429" y="244" width="13" height="9" fill="url(#winGlow)" rx="1" opacity="0.3"/><rect x="360" y="264" width="13" height="9" fill="url(#winGlow)" rx="1" opacity="0.55"/><rect x="383" y="264" width="13" height="9" fill="url(#winGlow)" rx="1" opacity="0.85"/><rect x="406" y="264" width="13" height="9" fill="url(#winGlow)" rx="1" opacity="0.4"/><rect x="429" y="264" width="13" height="9" fill="url(#winGlow)" rx="1" opacity="0.7"/>

          {/* Central tall tower */}
          <rect x="460" y="100" width="110" height="500" fill="url(#bldC)" rx="2"/><rect x="495" y="82" width="40" height="20" fill="#1e0c55" rx="1"/><rect x="505" y="68" width="20" height="16" fill="#a060ff" rx="1" filter="url(#glow)"/><rect x="514" y="55" width="3" height="16" fill="#ff6b8a"/>
          <rect x="472" y="120" width="14" height="9" fill="url(#winGlow)" rx="1" opacity="0.8"/><rect x="496" y="120" width="14" height="9" fill="url(#winGlow)" rx="1" opacity="0.5"/><rect x="520" y="120" width="14" height="9" fill="url(#winGlow)" rx="1" opacity="0.9"/><rect x="544" y="120" width="14" height="9" fill="url(#winGlow)" rx="1" opacity="0.4"/><rect x="472" y="142" width="14" height="9" fill="url(#winGlow)" rx="1" opacity="0.6"/><rect x="496" y="142" width="14" height="9" fill="url(#winGlow)" rx="1" opacity="0.85"/><rect x="520" y="142" width="14" height="9" fill="url(#winGlow)" rx="1" opacity="0.3"/><rect x="544" y="142" width="14" height="9" fill="url(#winGlow)" rx="1" opacity="0.7"/><rect x="472" y="164" width="14" height="9" fill="url(#winGlow)" rx="1" opacity="0.9"/><rect x="496" y="164" width="14" height="9" fill="url(#winGlow)" rx="1" opacity="0.45"/><rect x="520" y="164" width="14" height="9" fill="url(#winGlow)" rx="1" opacity="0.75"/><rect x="544" y="164" width="14" height="9" fill="url(#winGlow)" rx="1" opacity="0.55"/>

          {/* Right cluster */}
          <rect x="590" y="170" width="80" height="430" fill="url(#bldB)" rx="2"/>
          <rect x="610" y="185" width="12" height="8" fill="url(#winGlow)" rx="1" opacity="0.7"/><rect x="632" y="185" width="12" height="8" fill="url(#winGlow)" rx="1" opacity="0.9"/><rect x="654" y="185" width="12" height="8" fill="url(#winGlow)" rx="1" opacity="0.4"/><rect x="610" y="206" width="12" height="8" fill="url(#winGlow)" rx="1" opacity="0.85"/><rect x="632" y="206" width="12" height="8" fill="url(#winGlow)" rx="1" opacity="0.55"/><rect x="654" y="206" width="12" height="8" fill="url(#winGlow)" rx="1" opacity="0.7"/><rect x="610" y="228" width="12" height="8" fill="url(#winGlow)" rx="1" opacity="0.3"/><rect x="632" y="228" width="12" height="8" fill="url(#winGlow)" rx="1" opacity="0.75"/><rect x="654" y="228" width="12" height="8" fill="url(#winGlow)" rx="1" opacity="0.5"/>

          <rect x="685" y="210" width="100" height="390" fill="url(#bldA)" rx="2"/>
          <rect x="698" y="224" width="14" height="9" fill="url(#winGlow)" rx="1" opacity="0.8"/><rect x="722" y="224" width="14" height="9" fill="url(#winGlow)" rx="1" opacity="0.45"/><rect x="746" y="224" width="14" height="9" fill="url(#winGlow)" rx="1" opacity="0.85"/><rect x="770" y="224" width="14" height="9" fill="url(#winGlow)" rx="1" opacity="0.6"/><rect x="698" y="246" width="14" height="9" fill="url(#winGlow)" rx="1" opacity="0.35"/><rect x="722" y="246" width="14" height="9" fill="url(#winGlow)" rx="1" opacity="0.9"/><rect x="746" y="246" width="14" height="9" fill="url(#winGlow)" rx="1" opacity="0.5"/><rect x="770" y="246" width="14" height="9" fill="url(#winGlow)" rx="1" opacity="0.7"/>

          {/* Tall centre-right tower */}
          <rect x="800" y="90" width="90" height="510" fill="url(#bldC)" rx="2"/><rect x="824" y="72" width="42" height="20" fill="#200e5a" rx="1"/><rect x="835" y="58" width="20" height="16" fill="#9060ff" rx="1" filter="url(#glow)"/><rect x="844" y="44" width="3" height="16" fill="#f5c842"/>
          <rect x="810" y="110" width="13" height="8" fill="url(#winGlow)" rx="1" opacity="0.9"/><rect x="834" y="110" width="13" height="8" fill="url(#winGlow)" rx="1" opacity="0.5"/><rect x="858" y="110" width="13" height="8" fill="url(#winGlow)" rx="1" opacity="0.7"/><rect x="875" y="110" width="10" height="8" fill="url(#winGlow)" rx="1" opacity="0.4"/><rect x="810" y="132" width="13" height="8" fill="url(#winGlow)" rx="1" opacity="0.4"/><rect x="834" y="132" width="13" height="8" fill="url(#winGlow)" rx="1" opacity="0.85"/><rect x="858" y="132" width="13" height="8" fill="url(#winGlow)" rx="1" opacity="0.6"/><rect x="810" y="154" width="13" height="8" fill="url(#winGlow)" rx="1" opacity="0.75"/><rect x="834" y="154" width="13" height="8" fill="url(#winGlow)" rx="1" opacity="0.35"/><rect x="858" y="154" width="13" height="8" fill="url(#winGlow)" rx="1" opacity="0.8"/>

          <rect x="905" y="180" width="85" height="420" fill="url(#bldB)" rx="2"/>
          <rect x="918" y="196" width="13" height="8" fill="url(#winGlow)" rx="1" opacity="0.65"/><rect x="941" y="196" width="13" height="8" fill="url(#winGlow)" rx="1" opacity="0.9"/><rect x="964" y="196" width="13" height="8" fill="url(#winGlow)" rx="1" opacity="0.4"/><rect x="918" y="218" width="13" height="8" fill="url(#winGlow)" rx="1" opacity="0.8"/><rect x="941" y="218" width="13" height="8" fill="url(#winGlow)" rx="1" opacity="0.5"/><rect x="964" y="218" width="13" height="8" fill="url(#winGlow)" rx="1" opacity="0.7"/>

          {/* Far-right cluster */}
          <rect x="1005" y="150" width="100" height="450" fill="url(#bldC)" rx="2"/><rect x="1030" y="134" width="50" height="18" fill="#1e0c55" rx="1"/><rect x="1046" y="120" width="18" height="16" fill="#a060ff" rx="1" filter="url(#glow)"/>
          <rect x="1018" y="168" width="14" height="9" fill="url(#winGlow)" rx="1" opacity="0.7"/><rect x="1042" y="168" width="14" height="9" fill="url(#winGlow)" rx="1" opacity="0.9"/><rect x="1066" y="168" width="14" height="9" fill="url(#winGlow)" rx="1" opacity="0.5"/><rect x="1090" y="168" width="12" height="9" fill="url(#winGlow)" rx="1" opacity="0.4"/><rect x="1018" y="190" width="14" height="9" fill="url(#winGlow)" rx="1" opacity="0.85"/><rect x="1042" y="190" width="14" height="9" fill="url(#winGlow)" rx="1" opacity="0.3"/><rect x="1066" y="190" width="14" height="9" fill="url(#winGlow)" rx="1" opacity="0.75"/><rect x="1090" y="190" width="12" height="9" fill="url(#winGlow)" rx="1" opacity="0.6"/>

          <rect x="1120" y="200" width="75" height="400" fill="url(#bldA)" rx="2"/>
          <rect x="1133" y="215" width="12" height="8" fill="url(#winGlow)" rx="1" opacity="0.5"/><rect x="1155" y="215" width="12" height="8" fill="url(#winGlow)" rx="1" opacity="0.8"/><rect x="1177" y="215" width="12" height="8" fill="url(#winGlow)" rx="1" opacity="0.6"/><rect x="1133" y="237" width="12" height="8" fill="url(#winGlow)" rx="1" opacity="0.9"/><rect x="1155" y="237" width="12" height="8" fill="url(#winGlow)" rx="1" opacity="0.4"/><rect x="1177" y="237" width="12" height="8" fill="url(#winGlow)" rx="1" opacity="0.7"/>

          <rect x="1210" y="170" width="95" height="430" fill="url(#bldB)" rx="2"/><rect x="1240" y="154" width="35" height="18" fill="#13104a" rx="1"/><rect x="1250" y="142" width="15" height="14" fill="#6c4fcf" rx="1" filter="url(#glow)"/>
          <rect x="1222" y="186" width="14" height="9" fill="url(#winGlow)" rx="1" opacity="0.8"/><rect x="1246" y="186" width="14" height="9" fill="url(#winGlow)" rx="1" opacity="0.5"/><rect x="1270" y="186" width="14" height="9" fill="url(#winGlow)" rx="1" opacity="0.9"/><rect x="1290" y="186" width="12" height="9" fill="url(#winGlow)" rx="1" opacity="0.35"/><rect x="1222" y="208" width="14" height="9" fill="url(#winGlow)" rx="1" opacity="0.6"/><rect x="1246" y="208" width="14" height="9" fill="url(#winGlow)" rx="1" opacity="0.85"/><rect x="1270" y="208" width="14" height="9" fill="url(#winGlow)" rx="1" opacity="0.45"/>

          <rect x="1320" y="140" width="120" height="460" fill="url(#bldC)" rx="2"/><rect x="1350" y="122" width="60" height="20" fill="#200e5a" rx="1"/><rect x="1368" y="108" width="24" height="16" fill="#b070ff" rx="1" filter="url(#glow)"/>
          <rect x="1335" y="158" width="14" height="9" fill="url(#winGlow)" rx="1" opacity="0.85"/><rect x="1359" y="158" width="14" height="9" fill="url(#winGlow)" rx="1" opacity="0.5"/><rect x="1383" y="158" width="14" height="9" fill="url(#winGlow)" rx="1" opacity="0.7"/><rect x="1407" y="158" width="14" height="9" fill="url(#winGlow)" rx="1" opacity="0.4"/><rect x="1335" y="180" width="14" height="9" fill="url(#winGlow)" rx="1" opacity="0.6"/><rect x="1359" y="180" width="14" height="9" fill="url(#winGlow)" rx="1" opacity="0.9"/><rect x="1383" y="180" width="14" height="9" fill="url(#winGlow)" rx="1" opacity="0.35"/>

          {/* Ground fog */}
          <rect x="0" y="520" width="1440" height="80" fill="url(#groundFog)" opacity="0.8" />
        </svg>

        <div className="hp-road" />

        {/* Taxis */}
        <div className="hp-taxi-wrap">
          <svg className="hp-taxi hp-taxi-1" width="120" height="44" viewBox="0 0 120 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="10" y="22" width="100" height="18" rx="5" fill="#f5c842"/>
            <rect x="30" y="12" width="60" height="16" rx="4" fill="#f5d060"/>
            <rect x="34" y="14" width="24" height="12" rx="3" fill="#a0c8f8" opacity="0.75"/>
            <rect x="62" y="14" width="24" height="12" rx="3" fill="#a0c8f8" opacity="0.75"/>
            <circle cx="30" cy="40" r="8" fill="#222" stroke="#555" strokeWidth="2"/>
            <circle cx="30" cy="40" r="3" fill="#888"/>
            <circle cx="90" cy="40" r="8" fill="#222" stroke="#555" strokeWidth="2"/>
            <circle cx="90" cy="40" r="3" fill="#888"/>
            <ellipse cx="112" cy="28" rx="5" ry="3" fill="#fffde0" opacity="0.9"/>
            <ellipse cx="114" cy="28" rx="8" ry="2" fill="#fffde0" opacity="0.3"/>
            <rect x="8" y="26" width="6" height="4" rx="1" fill="#ff4444" opacity="0.8"/>
            <rect x="52" y="8" width="16" height="7" rx="2" fill="#1a1a1a"/>
            <text x="56" y="14.5" fontSize="5" fill="#f5c842" fontFamily="sans-serif" fontWeight="bold">TAXI</text>
          </svg>

          <svg className="hp-taxi hp-taxi-2" width="100" height="42" viewBox="0 0 100 42" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="8" y="20" width="84" height="18" rx="4" fill="#f0b800"/>
            <rect x="22" y="10" width="56" height="16" rx="3" fill="#f5c842"/>
            <rect x="26" y="12" width="22" height="11" rx="2" fill="#90b8f0" opacity="0.75"/>
            <rect x="52" y="12" width="22" height="11" rx="2" fill="#90b8f0" opacity="0.75"/>
            <circle cx="24" cy="38" r="7" fill="#222" stroke="#555" strokeWidth="1.5"/>
            <circle cx="24" cy="38" r="2.5" fill="#888"/>
            <circle cx="76" cy="38" r="7" fill="#222" stroke="#555" strokeWidth="1.5"/>
            <circle cx="76" cy="38" r="2.5" fill="#888"/>
            <ellipse cx="93" cy="26" rx="4" ry="2.5" fill="#fffde0" opacity="0.85"/>
            <rect x="6" y="24" width="5" height="3" rx="1" fill="#ff4444" opacity="0.8"/>
          </svg>

          <svg className="hp-taxi hp-taxi-3" width="120" height="44" viewBox="0 0 120 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="10" y="22" width="100" height="18" rx="5" fill="#f5c842"/>
            <rect x="30" y="12" width="60" height="16" rx="4" fill="#f5d060"/>
            <rect x="34" y="14" width="24" height="12" rx="3" fill="#a0c8f8" opacity="0.75"/>
            <rect x="62" y="14" width="24" height="12" rx="3" fill="#a0c8f8" opacity="0.75"/>
            <circle cx="30" cy="40" r="8" fill="#222" stroke="#555" strokeWidth="2"/>
            <circle cx="30" cy="40" r="3" fill="#888"/>
            <circle cx="90" cy="40" r="8" fill="#222" stroke="#555" strokeWidth="2"/>
            <circle cx="90" cy="40" r="3" fill="#888"/>
            <ellipse cx="8" cy="28" rx="5" ry="3" fill="#fffde0" opacity="0.9"/>
            <ellipse cx="6" cy="28" rx="8" ry="2" fill="#fffde0" opacity="0.3"/>
            <rect x="106" y="26" width="6" height="4" rx="1" fill="#ff4444" opacity="0.8"/>
            <rect x="52" y="8" width="16" height="7" rx="2" fill="#1a1a1a"/>
            <text x="56" y="14.5" fontSize="5" fill="#f5c842" fontFamily="sans-serif" fontWeight="bold">TAXI</text>
          </svg>
        </div>
      </div>

      {/* ── Navbar ── */}
      <nav className="hp-navbar">
        <div className="hp-logo-area">
          <div className="hp-logo-icon">
            <img src={logo} alt="BT" style={{ width: 28, height: 28, objectFit: "contain" }} />
          </div>
          <div className="hp-logo-text">
            <span className="hp-brand">Bhardwaj Travels</span>
            <span className="hp-sub">Billing Software</span>
          </div>
        </div>
        <button className="hp-btn-logout" onClick={onLogout}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Logout
        </button>
      </nav>

      {/* ── Main Content ── */}
      <main className="hp-content">
        <p className="hp-welcome">✦ &nbsp; Welcome back &nbsp; ✦</p>

        <div className="hp-menu-grid">
          {menuCards.map((card) => (
            <div
              key={card.page}
              className={`hp-menu-card ${card.cls}`}
              onClick={() => onNavigate(card.page)}
            >
              <div className="hp-card-icon-wrap">{card.icon}</div>
              <span className="hp-card-label">{card.label}</span>
              <span className="hp-card-desc">{card.desc}</span>
            </div>
          ))}
        </div>
      </main>

      {/* ── Quick Stats Bar ── */}
      <div className="hp-stats-bar">
        <div className="hp-stat-item">
          <span className="hp-stat-label">Total Bills</span>
          <span className="hp-stat-number hp-stat-total">{totalBills}</span>
        </div>
        <div className="hp-stats-divider" />
        <div className="hp-stat-item">
          <span className="hp-stat-label">Paid</span>
          <span className="hp-stat-number hp-stat-paid">{paidBills}</span>
        </div>
        <div className="hp-stats-divider" />
        <div className="hp-stat-item">
          <span className="hp-stat-label">Unpaid</span>
          <span className="hp-stat-number hp-stat-unpaid">{unpaidBills}</span>
        </div>
      </div>
    </div>
  );
}
