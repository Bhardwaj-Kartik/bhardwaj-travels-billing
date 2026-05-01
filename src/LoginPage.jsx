import { useState } from 'react';
import './LoginPage.css';

function CityBackground() {
  return (
    <svg
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="lp-skyGrad" cx="50%" cy="20%" r="70%">
          <stop offset="0%"  stopColor="#2a1a5e" />
          <stop offset="45%" stopColor="#1a0f3d" />
          <stop offset="100%" stopColor="#0c0820" />
        </radialGradient>
        <radialGradient id="lp-moonGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f5efc0" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#f5efc0" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="lp-streetGlow1" cx="50%" cy="0%" r="100%">
          <stop offset="0%" stopColor="#ffd97a" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#ffd97a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="lp-streetGlow2" cx="50%" cy="0%" r="100%">
          <stop offset="0%" stopColor="#ffd97a" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#ffd97a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="lp-headlightL" cx="100%" cy="50%" r="100%">
          <stop offset="0%" stopColor="#fff8d0" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#fff8d0" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="lp-roadGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a1630" />
          <stop offset="100%" stopColor="#0e0c1e" />
        </linearGradient>
        <linearGradient id="lp-sidewalkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#221d3a" />
          <stop offset="100%" stopColor="#1a162e" />
        </linearGradient>
        <filter id="lp-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="lp-softglow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="8" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <clipPath id="lp-sceneClip">
          <rect width="1440" height="900" />
        </clipPath>
      </defs>

      <g clipPath="url(#lp-sceneClip)">
        {/* Sky */}
        <rect width="1440" height="900" fill="url(#lp-skyGrad)" />

        {/* Moon */}
        <circle cx="1120" cy="110" r="55" fill="url(#lp-moonGlow)" />
        <circle cx="1120" cy="110" r="36" fill="#f5efc0" opacity="0.92" filter="url(#lp-softglow)" />
        <circle cx="1120" cy="110" r="34" fill="#f9f4d4" />
        <circle cx="1108" cy="100" r="10" fill="#e8e1a8" opacity="0.35" />
        <circle cx="1130" cy="120" r="6" fill="#e8e1a8" opacity="0.22" />

        {/* Stars */}
        {[
          [80,55,1.2,2.1],[160,30,0.9,3.2],[240,70,1.4,1.8],[340,22,1.0,4.1],
          [420,55,0.8,2.7],[500,18,1.3,1.5],[560,42,1.1,3.8],[640,68,0.9,2.2],
          [720,28,1.5,1.2],[800,52,0.8,4.5],[870,18,1.2,2.9],[950,65,1.0,3.3],
          [1020,35,0.9,1.7],[1200,55,1.3,2.4],[1280,28,0.8,3.6],[1360,72,1.1,1.9],
          [180,110,0.7,5.1],[380,90,1.0,2.3],[580,105,0.9,4.2],[780,85,1.2,1.6],
          [980,95,0.8,3.0],[1180,75,1.1,2.8],[1350,98,0.9,4.7],[60,130,1.0,1.4],
          [290,145,0.8,3.5],[490,125,1.1,2.0],[690,138,0.7,4.9],[890,118,1.3,1.3],
          [1050,142,0.9,3.1],[1250,128,1.0,2.6],
        ].map(([x, y, r, dur], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill="white"
            className="lp-star"
            style={{ '--dur': `${dur}s`, '--delay': `${(i * 0.37) % 3}s` }}
          />
        ))}

        {/* Clouds */}
        <ellipse cx="200" cy="80" rx="90" ry="22" fill="#2e2460" opacity="0.6" />
        <ellipse cx="250" cy="72" rx="60" ry="18" fill="#2e2460" opacity="0.5" />
        <ellipse cx="900" cy="95" rx="110" ry="20" fill="#231c52" opacity="0.55" />
        <ellipse cx="940" cy="86" rx="75" ry="16" fill="#231c52" opacity="0.45" />

        {/* Far background buildings */}
        <rect x="0"   y="340" width="60"  height="340" fill="#12102a" />
        <rect x="0"   y="300" width="40"  height="50"  fill="#12102a" />
        <rect x="58"  y="310" width="55"  height="370" fill="#13112c" />
        <rect x="60"  y="270" width="35"  height="50"  fill="#13112c" />
        <rect x="110" y="355" width="70"  height="325" fill="#161330" />
        <rect x="120" y="300" width="30"  height="60"  fill="#161330" />
        <line x1="30" y1="300" x2="30" y2="270" stroke="#12102a" strokeWidth="3" />
        <circle cx="30" cy="270" r="3" fill="#ff6b6b" opacity="0.8" filter="url(#lp-glow)" />

        {/* Center-left tall buildings */}
        <rect x="175" y="200" width="80"  height="480" fill="#191630" />
        <rect x="185" y="165" width="28"  height="42"  fill="#191630" />
        <rect x="215" y="170" width="20"  height="38"  fill="#1e1b36" />
        <rect x="250" y="240" width="95"  height="440" fill="#1c1835" />
        <rect x="255" y="195" width="50"  height="52"  fill="#1c1835" />
        <rect x="280" y="175" width="20"  height="28"  fill="#1c1835" />
        <line x1="290" y1="175" x2="290" y2="148" stroke="#1c1835" strokeWidth="2.5" />
        <circle cx="290" cy="148" r="3" fill="#ff4466" opacity="0.9" filter="url(#lp-glow)" />

        {/* Center buildings */}
        <rect x="340" y="260" width="110" height="420" fill="#1a1632" />
        <rect x="345" y="220" width="60"  height="48"  fill="#1a1632" />
        <rect x="360" y="195" width="25"  height="30"  fill="#1f1b38" />
        <rect x="445" y="280" width="85"  height="400" fill="#1d1936" />
        <rect x="450" y="245" width="45"  height="40"  fill="#1d1936" />

        {/* Windows — center buildings */}
        {[
          ...Array.from({length:8}, (_,row) => Array.from({length:5}, (_,col) => ({
            x: 348 + col*18, y: 268 + row*28, w: 10, h: 16, lit: col+row*5 > 15 || col%2===0,
          }))).flat(),
          ...Array.from({length:9}, (_,row) => Array.from({length:4}, (_,col) => ({
            x: 258 + col*18, y: 248 + row*26, w: 10, h: 14, lit: (col+row)%3 !== 0,
          }))).flat(),
        ].map((w, i) => (
          <rect key={`wc${i}`} x={w.x} y={w.y} width={w.w} height={w.h}
            fill={w.lit ? '#ffd580' : '#1a1632'} opacity={w.lit ? 0.85 : 0.1}
          />
        ))}

        {/* Center-right tall skyscraper */}
        <rect x="820" y="180" width="105" height="500" fill="#171430" />
        <rect x="830" y="145" width="55"  height="42"  fill="#171430" />
        <rect x="850" y="118" width="22"  height="32"  fill="#1b1736" />
        <line x1="861" y1="118" x2="861" y2="88" stroke="#1b1736" strokeWidth="2.5" />
        <circle cx="861" cy="88" r="3.5" fill="#ff3355" opacity="0.95" filter="url(#lp-glow)" />

        {/* Windows — skyscraper */}
        {Array.from({length:16}, (_,row) => Array.from({length:5}, (_,col) => ({
          x: 828 + col*18, y: 190 + row*22,
          fill: (row+col)%3===0 ? '#fde68a' : ((row+col)%5===0 ? '#c4b5fd' : '#171430'),
          lit: (row*col)%4 !== 0,
        }))).flat().map((w, i) => (
          <rect key={`ws${i}`} x={w.x} y={w.y} width={10} height={14}
            fill={w.fill} opacity={w.lit ? 0.75 : 0.05} />
        ))}

        {/* Right buildings */}
        <rect x="960"  y="260" width="90"  height="420" fill="#181532" />
        <rect x="965"  y="225" width="48"  height="42"  fill="#181532" />
        <rect x="1045" y="290" width="80"  height="390" fill="#1c1938" />
        <rect x="1050" y="255" width="45"  height="40"  fill="#1c1938" />
        <rect x="1120" y="310" width="100" height="370" fill="#181432" />
        <rect x="1130" y="275" width="55"  height="40"  fill="#181432" />
        <rect x="1215" y="295" width="90"  height="385" fill="#1a1735" />
        <rect x="1220" y="260" width="50"  height="40"  fill="#1a1735" />
        <rect x="1300" y="320" width="80"  height="360" fill="#161330" />
        <rect x="1350" y="300" width="90"  height="380" fill="#141130" />
        <rect x="1380" y="330" width="80"  height="350" fill="#121030" />

        {/* Windows — right side */}
        {[960,1045,1120,1215,1300].map((bx, bi) => (
          Array.from({length:10}, (_,row) => Array.from({length:4}, (_,col) => ({
            x: bx + 6 + col*17, y: 300 + bi*6 + row*24,
            lit: (row + col + bi) % 3 !== 0,
          }))).flat()
        )).flat().map((w, i) => (
          <rect key={`wr${i}`} x={w.x} y={w.y} width={9} height={13}
            fill={w.lit ? '#fde68a' : '#1a1632'} opacity={w.lit ? 0.7 : 0.05} />
        ))}

        {/* Neon signs */}
        <rect x="260" y="360" width="60" height="18" rx="4" fill="#e040fb" opacity="0.7" filter="url(#lp-glow)" />
        <text x="290" y="373" textAnchor="middle" fill="white" fontSize="9" fontFamily="monospace" opacity="0.9">HOTEL</text>
        <rect x="350" y="390" width="72" height="18" rx="4" fill="#00e5ff" opacity="0.65" filter="url(#lp-glow)" />
        <text x="386" y="403" textAnchor="middle" fill="white" fontSize="9" fontFamily="monospace" opacity="0.9">OPEN 24H</text>
        <rect x="850" y="330" width="56" height="16" rx="4" fill="#ff1744" opacity="0.6" filter="url(#lp-glow)" />
        <text x="878" y="342" textAnchor="middle" fill="white" fontSize="8" fontFamily="monospace" opacity="0.9">BAR</text>
        <rect x="970" y="375" width="64" height="16" rx="4" fill="#76ff03" opacity="0.55" filter="url(#lp-glow)" />
        <text x="1002" y="387" textAnchor="middle" fill="white" fontSize="8" fontFamily="monospace" opacity="0.9">BISTRO</text>

        {/* Bhardwaj Travels billboard */}
        <rect x="455" y="305" width="160" height="72" rx="6" fill="#1e1a40" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        <rect x="455" y="305" width="160" height="72" rx="6" fill="#3730a3" opacity="0.3" />
        <text x="535" y="333" textAnchor="middle" fill="#a5b4fc" fontSize="10" fontWeight="bold" fontFamily="DM Sans, sans-serif" letterSpacing="2" opacity="0.95">BHARDWAJ</text>
        <text x="535" y="350" textAnchor="middle" fill="white" fontSize="14" fontWeight="700" fontFamily="DM Sans, sans-serif" opacity="0.95">TRAVELS</text>
        <text x="535" y="367" textAnchor="middle" fill="#a5b4fc" fontSize="8" fontFamily="DM Sans, sans-serif" letterSpacing="1.5" opacity="0.8">BILLING SOFTWARE</text>
        <line x1="515" y1="377" x2="515" y2="415" stroke="#2a2550" strokeWidth="4" />
        <line x1="555" y1="377" x2="555" y2="415" stroke="#2a2550" strokeWidth="4" />

        {/* Road */}
        <rect x="0" y="700" width="1440" height="200" fill="url(#lp-roadGrad)" />
        <rect x="0" y="680" width="1440" height="28" fill="url(#lp-sidewalkGrad)" />
        <rect x="0" y="860" width="1440" height="20" fill="#1a162e" opacity="0.8" />

        {/* Road markings */}
        {Array.from({length:20}, (_, i) => (
          <rect key={`rd${i}`} x={i*80 - 20} y="778" width="48" height="5"
            fill="rgba(255,255,255,0.12)" rx="2" />
        ))}
        <line x1="0" y1="708" x2="1440" y2="708" stroke="rgba(255,255,255,0.07)" strokeWidth="1.5" />
        <line x1="0" y1="855" x2="1440" y2="855" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />

        {/* Streetlights */}
        {[130, 340, 560, 780, 1000, 1220, 1380].map((x, i) => (
          <g key={`sl${i}`}>
            <rect x={x - 3} y="590" width="6" height="100" fill="#2a2550" rx="3" />
            <path d={`M${x+3} 592 Q${x+30} 570 ${x+48} 572`} stroke="#2a2550" strokeWidth="4" fill="none" strokeLinecap="round" />
            <rect x={x+36} y="566" width="22" height="9" rx="4" fill="#3a3460" />
            <ellipse cx={x+47} cy="660" rx="62" ry="90"
              fill={`url(#lp-streetGlow${i%2===0?1:2})`} opacity="0.6" />
            <ellipse cx={x+47} cy="571" rx="12" ry="5" fill="#ffd97a" opacity="0.85" filter="url(#lp-glow)" />
          </g>
        ))}

        {/* Taxi 1 (left to right) */}
        <g className="lp-taxi1" style={{ transformOrigin: '80px 800px' }}>
          <rect x="10" y="790" width="120" height="38" rx="5" fill="#f5c518" />
          <rect x="25" y="768" width="85" height="26" rx="8" fill="#f5c518" />
          <rect x="30" y="771" width="36" height="20" rx="4" fill="#a8d8ea" opacity="0.85" />
          <rect x="74" y="771" width="30" height="20" rx="4" fill="#a8d8ea" opacity="0.75" />
          <rect x="52" y="760" width="36" height="12" rx="3" fill="#1a1040" />
          <text x="70" y="770" textAnchor="middle" fill="#f5c518" fontSize="7" fontWeight="bold" fontFamily="monospace">TAXI</text>
          <line x1="70" y1="790" x2="70" y2="828" stroke="#d4a800" strokeWidth="1.5" opacity="0.6" />
          <line x1="100" y1="790" x2="100" y2="828" stroke="#d4a800" strokeWidth="1.5" opacity="0.6" />
          <circle cx="32" cy="830" r="12" fill="#1a1040" />
          <circle cx="32" cy="830" r="6" fill="#2e2a50" />
          <circle cx="108" cy="830" r="12" fill="#1a1040" />
          <circle cx="108" cy="830" r="6" fill="#2e2a50" />
          <ellipse cx="135" cy="806" rx="38" ry="10" fill="url(#lp-headlightL)" />
          <rect x="126" y="800" width="8" height="12" rx="3" fill="#fffde0" opacity="0.9" />
          <rect x="6"  y="800" width="7" height="10" rx="2" fill="#ff3333" opacity="0.9" />
          <rect x="33" y="774" width="8" height="3" rx="1" fill="white" opacity="0.3" />
          <rect x="76" y="774" width="6" height="3" rx="1" fill="white" opacity="0.25" />
          <ellipse cx="70" cy="843" rx="60" ry="5" fill="#f5c518" opacity="0.12" />
        </g>

        {/* Taxi 2 (right to left) */}
        <g className="lp-taxi2" style={{ transformOrigin: '80px 760px' }}>
          <rect x="10" y="748" width="110" height="35" rx="5" fill="#f5c518" />
          <rect x="22" y="728" width="76" height="24" rx="7" fill="#f5c518" />
          <rect x="27" y="731" width="32" height="18" rx="4" fill="#a8d8ea" opacity="0.8" />
          <rect x="65" y="731" width="26" height="18" rx="4" fill="#a8d8ea" opacity="0.7" />
          <rect x="47" y="720" width="32" height="11" rx="3" fill="#1a1040" />
          <text x="63" y="730" textAnchor="middle" fill="#f5c518" fontSize="6.5" fontWeight="bold" fontFamily="monospace">TAXI</text>
          <line x1="65" y1="748" x2="65" y2="783" stroke="#d4a800" strokeWidth="1.5" opacity="0.6" />
          <circle cx="28" cy="786" r="11" fill="#1a1040" />
          <circle cx="28" cy="786" r="5" fill="#2e2a50" />
          <circle cx="98" cy="786" r="11" fill="#1a1040" />
          <circle cx="98" cy="786" r="5" fill="#2e2a50" />
          <rect x="122" y="756" width="7" height="10" rx="2" fill="#fffde0" opacity="0.9" />
          <rect x="5"  y="756" width="6" height="9" rx="2" fill="#ff3333" opacity="0.9" />
          <ellipse cx="65" cy="798" rx="52" ry="4" fill="#f5c518" opacity="0.1" />
        </g>

        {/* Ground fog */}
        <rect x="0" y="670" width="1440" height="40" fill="url(#lp-skyGrad)" opacity="0.35" />

        {/* Puddle reflections */}
        <ellipse cx="300"  cy="820" rx="70" ry="6"  fill="#2a2060" opacity="0.5" />
        <ellipse cx="750"  cy="835" rx="90" ry="7"  fill="#2a2060" opacity="0.45" />
        <ellipse cx="1150" cy="825" rx="65" ry="6"  fill="#2a2060" opacity="0.5" />

        <rect x="0" y="0" width="1440" height="200" fill="url(#lp-skyGrad)" opacity="0.2" />
      </g>
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}

function EyeIcon({ crossed }) {
  return crossed ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
      className="lp-spinner">
      <path d="M21 12a9 9 0 1 1-6.22-8.56" />
    </svg>
  );
}

function InputField({ label, type, value, onChange, icon, rightSlot, placeholder, error }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="lp-input-group">
      <label className="lp-input-label">{label}</label>
      <div className={`lp-input-wrap${error ? ' error' : ''}`}>
        <span style={{ color: focused ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)', display: 'flex', transition: 'color 0.15s' }}>
          {icon}
        </span>
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {rightSlot}
      </div>
      {error && <span className="lp-error-msg">{error}</span>}
    </div>
  );
}

export default function LoginPage({ logo, onSubmit }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [errors, setErrors]     = useState({});
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading]   = useState(false);
  const [shake, setShake]           = useState(false);

  function triggerShake() {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }

  function validate() {
    const e = {};
    if (!username.trim()) e.username = 'Username is required';
    if (!password)        e.password = 'Password is required';
    return e;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      triggerShake();
      return;
    }
    setErrors({});
    setLoginError('');
    setIsLoading(true);
    const errorMsg = await onSubmit(username, password);
    setIsLoading(false);
    if (errorMsg) {
      setLoginError(errorMsg);
      triggerShake();
    }
  }

  return (
    <div style={{
      position: 'relative', width: '100%', height: '100dvh', overflow: 'hidden',
      fontFamily: "'DM Sans', sans-serif",
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <CityBackground />

      {/* Overlay tint */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'linear-gradient(to bottom, rgba(12,8,32,0.25) 0%, rgba(12,8,32,0.5) 100%)',
        pointerEvents: 'none',
      }} />

      <div className={`lp-glass-card lp-card-wrap${shake ? ' shake' : ''}`}>
        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 30 }}>
          <img
            src={logo}
            width={52}
            height={52}
            alt="Bhardwaj Travels"
            style={{ filter: 'invert(1) brightness(2)', objectFit: 'contain', display: 'block' }}
          />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'white', lineHeight: 1.2 }}>
              Bhardwaj Travels
            </div>
            <div style={{ fontSize: 12, color: 'rgba(165,180,252,0.85)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 3, fontWeight: 500 }}>
              Billing Software
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <InputField
            label="Username"
            type="text"
            value={username}
            onChange={e => { setUsername(e.target.value); setErrors(p => ({ ...p, username: null })); setLoginError(''); }}
            icon={<UserIcon />}
            placeholder="Enter your username"
            error={errors.username}
          />
          <InputField
            label="Password"
            type={showPw ? 'text' : 'password'}
            value={password}
            onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: null })); setLoginError(''); }}
            icon={<LockIcon />}
            placeholder="Enter your password"
            error={errors.password}
            rightSlot={
              <button type="button" className="lp-eye-btn" onClick={() => setShowPw(v => !v)} aria-label={showPw ? 'Hide password' : 'Show password'}>
                <EyeIcon crossed={showPw} />
              </button>
            }
          />

          {loginError && (
            <div style={{ fontSize: 13, color: 'rgba(255,140,120,0.95)', fontWeight: 500, textAlign: 'center' }}>
              {loginError}
            </div>
          )}

          <button type="submit" className="lp-login-btn" disabled={isLoading} style={{ marginTop: 6 }}>
            {isLoading ? <><SpinnerIcon /> Signing in…</> : 'Login'}
          </button>
        </form>

        {/* Footer */}
        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.35)', fontWeight: 400 }}>
          © 2026 Bhardwaj Travels · All rights reserved
        </div>
      </div>
    </div>
  );
}
