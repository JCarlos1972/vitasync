import { useState, useRef, useEffect, createContext, useContext } from "react";
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList, ReferenceLine, Cell
} from "recharts";
import {
  Heart, Moon, Activity, Leaf, UtensilsCrossed, Settings, LayoutDashboard,
  CalendarDays, ChevronLeft
} from "lucide-react";

const G = {
  bg:"#07070F", surface:"#0F0F1A", card:"#141426", border:"#1E1E35",
  accent:"#00E5A0", blue:"#4D9EFF", purple:"#9B7FFF", coral:"#FF6B6B",
  amber:"#FFB347", text:"#E8E8FF", muted:"#5A5A7A", dim:"#2A2A45",
  red:"#FF3B30", green:"#30D158", garnet:"#C0395A",
};
const font = `'Outfit','Segoe UI',sans-serif`;
const mono = `'DM Mono','Courier New',monospace`;

const isMobile = () => typeof window !== "undefined" && window.innerWidth < 768;

const S = {
  app:{ background:G.bg, minHeight:"100vh", display:"flex", fontFamily:font, color:G.text },
  sidebar:{ width:72, background:G.surface, borderRight:`1px solid ${G.border}`, display:"flex", flexDirection:"column", alignItems:"center", padding:"20px 0", gap:6, position:"fixed", top:0, left:0, height:"100vh", zIndex:100 },
  bottomNav:{ position:"fixed", bottom:0, left:0, right:0, height:64, background:G.surface, borderTop:`1px solid ${G.border}`, display:"flex", alignItems:"center", justifyContent:"space-around", zIndex:100, paddingBottom:"env(safe-area-inset-bottom)" },
  main:{ marginLeft:72, flex:1, padding:"28px 32px", maxWidth:1120, overflowY:"auto", overflowX:"hidden", height:"100vh" },
  mainMobile:{ marginLeft:0, flex:1, padding:"16px 16px 80px 16px", overflowY:"auto", overflowX:"hidden", height:"100vh", WebkitOverflowScrolling:"touch" },
  card:{ background:G.card, border:`1px solid ${G.border}`, borderRadius:20, padding:24 },
  mc:{ background:G.card, border:`1px solid ${G.border}`, borderRadius:20, padding:20, display:"flex", flexDirection:"column", gap:8 },
  lbl:{ fontSize:11, letterSpacing:"0.12em", textTransform:"uppercase", color:G.muted, fontWeight:600 },
  badge:(c)=>({ background:c+"20", color:c, borderRadius:8, padding:"3px 10px", fontSize:11, fontWeight:700, letterSpacing:"0.08em" }),
  navBtn:(a,ac)=>({ width:44, height:44, borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", background:a?(ac||G.accent)+"22":"transparent", border:a?`1px solid ${(ac||G.accent)}50`:"1px solid transparent", cursor:"pointer", transition:"all 0.2s", color:ac?ac:(a?G.accent:G.muted) }),
  inp:{ background:G.dim, border:`1px solid ${G.border}`, borderRadius:12, padding:"10px 16px", color:G.text, fontFamily:font, fontSize:14, outline:"none", width:"100%" },
  btn:(c=G.accent)=>({ background:c, color:"#000", border:"none", borderRadius:12, padding:"12px 24px", fontFamily:font, fontWeight:700, fontSize:14, cursor:"pointer", letterSpacing:"0.02em" }),
};

// ── DATA ──────────────────────────────────────────────────────────────────────
const weeklyDatasets = {
  pasos:          { label:"Pasos",    unit:"pasos", color:G.accent, icon:"◈", data:[{d:"L",v:7840},{d:"M",v:10200},{d:"X",v:6300},{d:"J",v:9100},{d:"V",v:11400},{d:"S",v:14200},{d:"D",v:8900}], summary:"8.900 pasos hoy",       badge:"ACTIVO",   chartType:"bar"  },
  sueño:          { label:"Sueño",    unit:"h",     color:G.blue,   icon:"🌙",data:[{d:"L",v:6.2},{d:"M",v:7.1},{d:"X",v:5.8},{d:"J",v:7.4},{d:"V",v:8.0},{d:"S",v:6.9},{d:"D",v:7.3}],         summary:"7h 20m anoche",         badge:"BUENO",    chartType:"bar"  },
  entrenamientos: { label:"Entrenos", unit:"min",   color:G.amber,  icon:"🏃",data:[{d:"L",v:32},{d:"M",v:0},{d:"X",v:55},{d:"J",v:0},{d:"V",v:40},{d:"S",v:70},{d:"D",v:0}],                   summary:"3 sesiones · 197 min",  badge:"EN RACHA", chartType:"bar"  },
  calorias:       { label:"Calorías", unit:"kcal",  color:G.coral,  icon:"◉", data:[{d:"L",v:1820},{d:"M",v:2100},{d:"X",v:1650},{d:"J",v:1980},{d:"V",v:2240},{d:"S",v:2580},{d:"D",v:1900}],   summary:"1.840 kcal hoy",        badge:"OBJETIVO", chartType:"bar"  },
  hrv:            { label:"HRV",      unit:"ms",    color:G.purple, icon:"∿", data:[{d:"L",v:42},{d:"M",v:38},{d:"X",v:45},{d:"J",v:41},{d:"V",v:48},{d:"S",v:52},{d:"D",v:49}],                 summary:"49ms media",            badge:"BUENO",    chartType:"area" },
};

const hrData     = [{t:"00",v:58},{t:"03",v:55},{t:"06",v:60},{t:"09",v:82},{t:"12",v:91},{t:"15",v:78},{t:"18",v:95},{t:"21",v:70},{t:"24",v:62}];
const sleepWeek  = [{d:"L",h:6.2},{d:"M",h:7.1},{d:"X",h:5.8},{d:"J",h:7.4},{d:"V",h:8.0},{d:"S",h:6.9},{d:"D",h:7.3}];
const hypnogramData = [
  {t:"23:00",fase:0},{t:"23:30",fase:1},{t:"00:00",fase:2},{t:"00:45",fase:1},
  {t:"01:00",fase:0},{t:"02:00",fase:1},{t:"02:30",fase:2},{t:"03:00",fase:3},
  {t:"03:10",fase:1},{t:"03:45",fase:2},{t:"04:30",fase:1},{t:"04:45",fase:3},
  {t:"04:50",fase:1},{t:"05:20",fase:2},{t:"06:00",fase:1},{t:"06:20",fase:3},{t:"06:32",fase:3},
];
const sleepPhaseSummary = [
  {fase:"Profundo",min:95,color:G.accent},
  {fase:"REM",min:85,color:G.purple},
  {fase:"Ligero",min:148,color:G.blue},
  {fase:"Despierto",min:12,color:G.coral},
];
const stressData = [{t:"06",v:25},{t:"08",v:40},{t:"10",v:65},{t:"12",v:55},{t:"14",v:72},{t:"16",v:48},{t:"18",v:35},{t:"20",v:20},{t:"22",v:18}];
const hrvData    = [{d:"L",v:42},{d:"M",v:38},{d:"X",v:45},{d:"J",v:41},{d:"V",v:48},{d:"S",v:52},{d:"D",v:49}];
const spo2Data   = [{t:"00",v:97},{t:"04",v:96},{t:"08",v:98},{t:"12",v:97},{t:"16",v:98},{t:"20",v:97},{t:"24",v:96}];
const dietData   = [
  {name:"Carbohidratos",topic:"Carbohidratos",g:210,max:280,color:G.amber},
  {name:"Proteínas",    topic:"Proteínas",    g:85, max:120,color:G.blue},
  {name:"Grasas",       topic:"Grasas",       g:52, max:80, color:G.purple},
  {name:"Fibra",        topic:"Fibra",        g:22, max:35, color:G.accent},
];
const activities = [
  {name:"Carrera matutina",type:"run", duration:"32 min",cal:287,hr:148,time:"Hoy 07:15",   steps:4820,km:3.8, route:true},
  {name:"Ciclismo",        type:"bike",duration:"55 min",cal:412,hr:135,time:"Ayer 18:30",  steps:null,km:22.4,route:true},
  {name:"Yoga",            type:"yoga",duration:"40 min",cal:95, hr:88, time:"Ayer 07:00",  steps:null,km:null,route:false},
];

const workoutDetails = {
  run:{
    name:"Carrera matutina",type:"run",date:"Hoy · 07:15",duration:"32 min",cal:287,
    km:3.8,avgHr:126,maxHr:148,avgSpeed:7.1,maxSpeed:10.2,steps:4820,load:95,cadence:172,
    hrChart:[{t:"0",v:88},{t:"4",v:108},{t:"8",v:126},{t:"12",v:138},{t:"16",v:145},{t:"20",v:148},{t:"24",v:140},{t:"28",v:132},{t:"32",v:120}],
    speedChart:[{t:"0",v:0},{t:"4",v:6.2},{t:"8",v:7.0},{t:"12",v:7.5},{t:"16",v:7.8},{t:"20",v:8.1},{t:"24",v:7.2},{t:"28",v:6.8},{t:"32",v:5.0}],
    zones:[{z:"Z1 Rec.",pct:8,c:G.blue},{z:"Z2 Base",pct:35,c:G.accent},{z:"Z3 Aeróbico",pct:42,c:G.amber},{z:"Z4 Umbral",pct:15,c:G.coral}],
  },
  bike:{
    name:"Ciclismo",type:"bike",date:"Ayer · 18:30",duration:"55 min",cal:412,
    km:22.4,avgHr:121,maxHr:138,avgSpeed:24.4,maxSpeed:38.6,steps:null,load:142,cadence:88,
    hrChart:[{t:"0",v:80},{t:"11",v:115},{t:"22",v:125},{t:"33",v:130},{t:"44",v:122},{t:"55",v:105}],
    speedChart:[{t:"0",v:12},{t:"11",v:26},{t:"22",v:28},{t:"33",v:24},{t:"44",v:30},{t:"55",v:18}],
    zones:[{z:"Z1 Rec.",pct:18,c:G.blue},{z:"Z2 Base",pct:55,c:G.accent},{z:"Z3 Aeróbico",pct:22,c:G.amber},{z:"Z4 Umbral",pct:5,c:G.coral}],
  },
  yoga:{
    name:"Yoga",type:"yoga",date:"Ayer · 07:00",duration:"40 min",cal:95,
    km:null,avgHr:78,maxHr:92,avgSpeed:null,maxSpeed:null,steps:null,load:40,cadence:null,
    hrChart:[{t:"0",v:70},{t:"10",v:82},{t:"20",v:88},{t:"30",v:85},{t:"40",v:78}],
    speedChart:null,
    zones:[{z:"Z1 Rec.",pct:72,c:G.blue},{z:"Z2 Base",pct:28,c:G.accent},{z:"Z3 Aeróbico",pct:0,c:G.amber},{z:"Z4 Umbral",pct:0,c:G.coral}],
  },
};

const infoMap = {
  "FC":"Número de veces que tu corazón late por minuto. Normal en reposo: 60–100 bpm.",
  "SpO₂":"Saturación de oxígeno en sangre. >95% es normal. Valores bajos pueden indicar apnea.",
  "HRV":"Variabilidad entre latidos en ms. Alto HRV = mejor recuperación y menor estrés.",
  "Disponibilidad":"Puntuación 0–100. Combina sueño, HRV y FC en reposo. >70 = listo para entrenar.",
  "Estrés":"Estimado desde el HRV. 0–25: relajado · 26–50: bajo · 51–75: medio · >75: alto.",
  "Cansancio":"Fatiga acumulada. >60% indica necesidad de recuperación o descanso.",
  "Sueño":"Horas y calidad. Se recomienda 7–9h con >1h profundo y >1.5h REM.",
  "FC Reposo":"FC mínima nocturna. Valor bajo y estable = buena forma cardiovascular.",
  "FC Nocturna":"FC más baja durante el sueño. Indica recuperación cardíaca nocturna.",
  "Recuperación":"Combina HRV, sueño y FC. >75/100 = recuperación excelente.",
  "Pasos":"Se recomiendan 7.500–10.000 pasos/día para buena salud cardiovascular.",
  "Calorías":"Calorías activas quemadas. No incluye metabolismo basal.",
  "Agua":"Ingesta diaria. Recomendación: 35 ml/kg. Más si entrenas o hace calor.",
  "UA":"Unidad Arbitraria de carga. Combina duración, intensidad y FC.",
  "Carga Aguda":"Carga de los últimos 7 días. Refleja el estrés reciente.",
  "Carga Crónica":"Media de los últimos 28 días. Representa tu nivel de forma habitual.",
  "Ratio AC":"Aguda/Crónica. Óptimo: 0.8–1.3. >1.5 = riesgo de lesión.",
  "Carbohidratos":"Principal fuente de energía. Objetivo: 45–65% del total calórico.",
  "Proteínas":"Esenciales para reparar músculo. Objetivo: 1.6–2.2g/kg/día.",
  "Grasas":"Grasas saludables imprescindibles. Objetivo: 20–35% del total.",
  "Fibra":"Mejora tránsito y saciedad. Objetivo: 25–38g/día.",
  "Pisos":"Subir escaleras mejora la salud cardiorrespiratoria.",
  "De Pie":"Estar de pie activa la musculatura postural. Objetivo: alternar cada 30–60 min.",
};

// ── GRADIENT RING ─────────────────────────────────────────────────────────────
let _gid = 0;
function GradientRing({value,max,colorFrom,colorTo,size=100,label,sublabel,strokeWidth}) {
  const id = useRef(`gr${++_gid}`).current;
  const sw = strokeWidth || size * 0.1;
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(Math.max(value / max, 0), 1);
  const cx = size / 2, cy = size / 2;
  const isPercent = sublabel === "%";
  const fs = isPercent ? size * 0.17 : size * 0.19;
  return (
    <div style={{position:"relative",width:size,height:size,flexShrink:0}}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{overflow:"visible"}}>
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colorFrom}/>
            <stop offset="100%" stopColor={colorTo}/>
          </linearGradient>
        </defs>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={G.dim} strokeWidth={sw} opacity={0.6}/>
        {pct>0&&(
          <circle cx={cx} cy={cy} r={r} fill="none"
            stroke={`url(#${id})`} strokeWidth={sw}
            strokeDasharray={`${pct*circ} ${circ}`}
            strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{filter:`drop-shadow(0 0 ${sw*0.8}px ${colorFrom}A0)`}}
          />
        )}
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
        {label!==undefined&&(
          <div style={{display:"flex",alignItems:"baseline",gap:1}}>
            <span style={{fontFamily:mono,fontSize:fs,fontWeight:800,color:G.text,lineHeight:1.05,letterSpacing:"-0.02em"}}>{label}</span>
            {isPercent&&<span style={{fontFamily:mono,fontSize:fs*0.58,fontWeight:700,color:colorFrom}}>%</span>}
          </div>
        )}
        {sublabel&&!isPercent&&<span style={{fontSize:size*0.1,color:G.muted,lineHeight:1.2,textAlign:"center"}}>{sublabel}</span>}
      </div>
    </div>
  );
}

const grad = {
  accent: ["#00FF9F","#00C9FF"],
  blue:   ["#4D9EFF","#7B5CFF"],
  purple: ["#A855FF","#EC4899"],
  coral:  ["#FF6B6B","#FF8E53"],
  amber:  ["#FFB347","#FFDB4D"],
  red:    ["#FF3B30","#FF6B6B"],
  green:  ["#30D158","#00E5A0"],
  garnet: ["#C0395A","#E05C89"],
};

// ── INFOTIP ───────────────────────────────────────────────────────────────────
function InfoTip({topic}) {
  const [show,setShow] = useState(false);
  const text = infoMap[topic] || "";
  if (!text) return null;
  return (
    <span style={{position:"relative",display:"inline-flex",alignItems:"center"}}>
      <span
        onMouseEnter={()=>setShow(true)}
        onMouseLeave={()=>setShow(false)}
        style={{width:15,height:15,borderRadius:"50%",background:show?G.accent+"20":G.dim,border:`1px solid ${show?G.accent:G.border}`,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:8,color:show?G.accent:G.muted,cursor:"default",fontWeight:700,flexShrink:0,userSelect:"none",transition:"all 0.2s"}}
      >ℹ</span>
      {show&&(
        <span style={{position:"absolute",bottom:"calc(100% + 8px)",left:"50%",transform:"translateX(-50%)",background:G.surface,border:`1px solid ${G.accent}40`,borderRadius:12,padding:"10px 14px",fontSize:12,color:G.text,lineHeight:1.6,width:220,zIndex:999,boxShadow:"0 8px 24px #00000080",pointerEvents:"none",whiteSpace:"normal"}}>
          <span style={{fontWeight:700,color:G.accent,display:"block",marginBottom:4}}>{topic}</span>{text}
        </span>
      )}
    </span>
  );
}

const Tip = ({active,payload,unit=""}) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{background:G.surface,border:`1px solid ${G.border}`,borderRadius:10,padding:"8px 14px",fontFamily:mono,fontSize:13,boxShadow:"0 4px 16px #00000060"}}>
      <span style={{color:G.accent,fontWeight:700}}>{payload[0].value}</span>
      <span style={{color:G.muted}}> {unit}</span>
    </div>
  );
};

const Bar2H = (props) => {
  const {x,y,width,value} = props;
  if (!value) return null;
  return <text x={x+width/2} y={y-5} fill={G.muted} textAnchor="middle" fontSize={10} fontFamily={mono} fontWeight={600}>{value}h</text>;
};

const BarLabel = (props) => {
  const {x,y,width,value} = props;
  if (!value) return null;
  return <text x={x+width/2} y={y-5} fill={G.muted} textAnchor="middle" fontSize={9} fontFamily={mono} fontWeight={600}>{value>=1000?`${(value/1000).toFixed(1)}K`:value}</text>;
};

const Prog = ({pct,color}) => (
  <div style={{background:G.dim,borderRadius:99,height:5,overflow:"hidden"}}>
    <div style={{width:`${Math.min(pct,100)}%`,height:"100%",background:color,borderRadius:99,transition:"width 0.5s ease"}}/>
  </div>
);

// ── SECTION HERO (Bevel-inspired atmospheric header) ──────────────────────────
// Rings float on a themed sky that fades into the page bg below
function SectionHero({accentColor, bgColor, children, minH=220}) {
  return (
    <div style={{
      position:"relative",
      borderRadius:24,
      overflow:"hidden",
      border:`1px solid ${accentColor}22`,
      marginBottom:0,
    }}>
      {/* Main atmospheric glow at top */}
      <div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse at 50% -20%, ${accentColor}80 0%, ${bgColor}60 40%, transparent 75%)`,zIndex:0,pointerEvents:"none"}}/>
      {/* Secondary depth glow */}
      <div style={{position:"absolute",inset:0,background:`linear-gradient(180deg, ${bgColor}55 0%, ${G.surface}CC 60%, ${G.bg}FF 100%)`,zIndex:0,pointerEvents:"none"}}/>
      {/* Subtle side glow for depth */}
      <div style={{position:"absolute",top:0,left:0,right:0,height:"60%",background:`radial-gradient(ellipse at 20% 0%, ${accentColor}20 0%, transparent 60%)`,zIndex:0,pointerEvents:"none"}}/>
      {/* Bottom hard fade to bg */}
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:40,background:`linear-gradient(to bottom, transparent, ${G.bg})`,zIndex:1,pointerEvents:"none"}}/>
      {/* Star-like subtle texture */}
      <div style={{position:"absolute",inset:0,opacity:0.04,backgroundImage:"radial-gradient(circle, #fff 1px, transparent 1px)",backgroundSize:"40px 40px",zIndex:0,pointerEvents:"none"}}/>
      <div style={{position:"relative",zIndex:2,padding:28,minHeight:minH}}>
        {children}
      </div>
    </div>
  );
}

// ── HYPNOGRAM ─────────────────────────────────────────────────────────────────
function Hypnogram({compact=false}) {
  const phaseColors = {0:G.accent, 1:G.blue, 2:G.purple, 3:G.coral};
  const phaseLabels = {0:"Profundo", 1:"Ligero", 2:"REM", 3:"Despierto"};
  const laneOrder = [3,2,1,0];
  const toMin = (t) => { const [h,m] = t.split(":").map(Number); let min = h*60+m; if (min<23*60) min+=24*60; return min-23*60; };
  const totalMin = 452;
  const chartH = compact ? 70 : 120;
  const laneH = chartH / 4;
  const segments = hypnogramData.slice(0,-1).map((d,i) => ({fase:d.fase, from:toMin(d.t), to:toMin(hypnogramData[i+1].t)}));
  const timeLbls = compact ? ["23:00","01:30","03:30","06:00"] : ["23:00","00:00","01:00","02:00","03:00","04:00","05:00","06:00","06:32"];
  return (
    <div>
      {!compact&&(
        <div style={{display:"flex",gap:18,marginBottom:10,flexWrap:"wrap"}}>
          {[0,1,2,3].map(n=>(
            <div key={n} style={{display:"flex",alignItems:"center",gap:7,fontSize:12}}>
              <div style={{width:12,height:5,borderRadius:2,background:phaseColors[n]}}/>
              <span style={{color:G.muted}}>{phaseLabels[n]}</span>
            </div>
          ))}
        </div>
      )}
      <div style={{display:"flex",gap:compact?4:8}}>
        {!compact&&(
          <div style={{width:52,flexShrink:0,display:"flex",flexDirection:"column",justifyContent:"space-around",paddingBottom:18}}>
            {laneOrder.map(n=><div key={n} style={{fontSize:9,color:phaseColors[n],textAlign:"right",fontWeight:600,lineHeight:1}}>{phaseLabels[n]}</div>)}
          </div>
        )}
        <div style={{flex:1}}>
          <svg width="100%" height={chartH} viewBox={`0 0 400 ${chartH}`} preserveAspectRatio="none" style={{display:"block"}}>
            {laneOrder.map((n,li)=><rect key={n} x={0} y={li*laneH} width={400} height={laneH} fill={phaseColors[n]+"08"}/>)}
            {segments.map((seg,i)=>{
              const li = laneOrder.indexOf(seg.fase);
              const x = (seg.from/totalMin)*400;
              const w = Math.max(((seg.to-seg.from)/totalMin)*400, 2);
              return <rect key={i} x={x} y={li*laneH+2} width={w} height={laneH-4} fill={phaseColors[seg.fase]} rx={2} opacity={0.85}/>;
            })}
          </svg>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:3}}>
            {timeLbls.map(t=><span key={t} style={{fontSize:compact?7:9,color:G.muted}}>{t}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ROUTE MAP ─────────────────────────────────────────────────────────────────
function RouteMap({type}) {
  // GPS-style color-coded route segments by intensity
  const runSegs = [
    {d:"M38,215 C38,215 36,190 38,170 C40,150 42,125 46,100 C50,75 48,55 48,55",   c:G.blue},
    {d:"M48,55 C60,48 80,44 108,44 C136,44 158,46 170,50",                          c:G.accent},
    {d:"M170,50 C195,54 225,52 258,54 C285,56 305,58 318,64",                       c:G.amber},
    {d:"M318,64 C340,74 358,92 362,118 C366,144 358,168 348,188",                   c:G.coral},
    {d:"M348,188 C338,204 318,215 295,220 C270,225 242,224 215,222",                c:G.amber},
    {d:"M215,222 C190,220 165,218 140,214 C112,210 84,210 62,212 C50,212 40,214 38,215", c:G.accent},
  ];
  const bikeSegs = [
    {d:"M30,190 C38,178 55,162 78,146 C100,130 126,120 152,114",                    c:G.blue},
    {d:"M152,114 C180,108 210,108 240,108 C265,108 288,114 308,124",                c:G.accent},
    {d:"M308,124 C328,134 344,150 354,170 C362,188 360,210 350,228",                c:G.amber},
    {d:"M350,228 C336,244 312,252 282,254 C252,256 222,252 196,244",                c:G.accent},
    {d:"M196,244 C168,236 146,222 128,204 C110,186 98,164 88,142",                  c:G.blue},
    {d:"M88,142 C78,122 66,102 52,86 C42,74 32,62 30,52",                           c:G.blue},
  ];

  const segs = type === "bike" ? bikeSegs : runSegs;
  const startPt = type === "bike" ? {x:30,y:190} : {x:38,y:215};
  const endPt   = type === "bike" ? {x:30,y:52}  : {x:38,y:215};

  const kmMarkers = type === "run"
    ? [{x:108,y:40,label:"1km"},{x:360,y:116,label:"2km"},{x:216,y:218,label:"3km"}]
    : [{x:240,y:104,label:"5km"},{x:352,y:168,label:"10km"},{x:198,y:250,label:"15km"},{x:90,y:138,label:"20km"}];

  const legend = type === "run"
    ? [{c:G.blue,l:"Calentamiento"},{c:G.accent,l:"Ritmo"},{c:G.amber,l:"Intenso"},{c:G.coral,l:"Sprint"}]
    : [{c:G.blue,l:"Calentamiento"},{c:G.accent,l:"Ritmo moderado"},{c:G.amber,l:"Intenso"}];

  return (
    <div style={{borderRadius:16,overflow:"hidden",border:`1px solid ${G.border}35`,background:"#0A1210"}}>
      <svg width="100%" viewBox="0 0 400 270" style={{display:"block"}}>
        {/* Base map */}
        <rect x={0} y={0} width={400} height={270} fill="#091210"/>
        {/* Street grid */}
        {[40,80,120,160,200,240].map(y=><line key={`h${y}`} x1={0} y1={y} x2={400} y2={y} stroke="#141E14" strokeWidth={7}/>)}
        {[60,120,180,240,300,360].map(x=><line key={`v${x}`} x1={x} y1={0} x2={x} y2={270} stroke="#141E14" strokeWidth={7}/>)}
        {/* Park blocks */}
        <rect x={130} y={42} width={160} height={82} fill="#0A1A0A" rx={4}/>
        <rect x={185} y={195} width={95} height={55} fill="#0A1A0A" rx={4}/>
        {/* Route glow (blur effect via wide transparent stroke) */}
        {segs.map((s,i)=>(
          <path key={`g${i}`} d={s.d} fill="none" stroke={s.c} strokeWidth={14} strokeOpacity={0.12} strokeLinecap="round" strokeLinejoin="round"/>
        ))}
        {/* Route main */}
        {segs.map((s,i)=>(
          <path key={`r${i}`} d={s.d} fill="none" stroke={s.c} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round"/>
        ))}
        {/* Km markers */}
        {kmMarkers.map((m,i)=>(
          <g key={i}>
            <circle cx={m.x} cy={m.y} r={9} fill="#07070F" stroke={type==="run"?G.accent:G.blue} strokeWidth={1.5}/>
            <text x={m.x} y={m.y+3.5} fill={type==="run"?G.accent:G.blue} fontSize={6} textAnchor="middle" fontFamily={mono} fontWeight={700}>{m.label}</text>
          </g>
        ))}
        {/* Start dot */}
        <circle cx={startPt.x} cy={startPt.y} r={10} fill={G.accent} opacity={0.92}/>
        <text x={startPt.x} y={startPt.y+4} fill="#000" fontSize={8} textAnchor="middle" fontFamily={mono} fontWeight={800}>S</text>
        {/* End dot (same as start for loop runs, different for bike) */}
        {type==="bike"&&<>
          <circle cx={endPt.x} cy={endPt.y} r={10} fill={G.coral} opacity={0.92}/>
          <text x={endPt.x} y={endPt.y+4} fill="#fff" fontSize={8} textAnchor="middle" fontFamily={mono} fontWeight={800}>F</text>
        </>}
        <text x={392} y={264} fill={G.muted} fontSize={7} textAnchor="end" fontFamily={font} opacity={0.4}>GPS Trace</text>
      </svg>
      <div style={{display:"flex",gap:14,padding:"10px 16px",borderTop:`1px solid ${G.border}`,flexWrap:"wrap"}}>
        {legend.map((l,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:6,fontSize:11,color:G.muted}}>
            <div style={{width:16,height:3,borderRadius:2,background:l.c}}/>
            {l.l}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── WORKOUT DETAIL ─────────────────────────────────────────────────────────────
function WorkoutDetail({type,onBack}) {
  const d = workoutDetails[type] || workoutDetails.run;
  const icons = {run:"🏃",bike:"🚴",yoga:"🧘"};
  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <div onClick={onBack} style={{width:38,height:38,borderRadius:12,background:G.dim,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>
          <ChevronLeft size={18} color={G.muted}/>
        </div>
        <div style={{flex:1}}>
          <div style={{fontSize:18,fontWeight:800}}>{icons[d.type]} {d.name}</div>
          <div style={{fontSize:12,color:G.muted,marginTop:1}}>{d.date}</div>
        </div>
        <span style={S.badge(G.amber)}>{d.load} UA</span>
      </div>

      {/* Stats grid */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
        {[
          {label:"Duración",   value:d.duration,                      color:G.blue,   icon:"⏱"},
          {label:"Calorías",   value:`${d.cal} kcal`,                 color:G.amber,  icon:"🔥"},
          {label:"FC Media",   value:`${d.avgHr} bpm`,                color:G.red,    icon:"♥"},
          {label:"FC Máx.",    value:`${d.maxHr} bpm`,                color:G.coral,  icon:"🔺"},
          ...(d.km?[{label:"Distancia",  value:`${d.km} km`,           color:G.accent, icon:"📍"}]:[]),
          ...(d.avgSpeed?[{label:"Vel. Media", value:`${d.avgSpeed} km/h`, color:G.green,  icon:"⚡"}]:[]),
          ...(d.steps?[{label:"Pasos",       value:d.steps.toLocaleString("es"), color:G.accent, icon:"👟"}]:[]),
          ...(d.cadence?[{label:"Cadencia",   value:`${d.cadence} spm`, color:G.purple, icon:"↻"}]:[]),
        ].slice(0,8).map((s,i)=>(
          <div key={i} style={{background:G.surface,borderRadius:14,padding:"12px 12px",border:`1px solid ${s.color}22`}}>
            <div style={{fontSize:11,color:G.muted,marginBottom:4}}>{s.icon} {s.label}</div>
            <div style={{fontFamily:mono,fontSize:14,fontWeight:700,color:s.color}}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Route map */}
      {d.km&&(
        <div style={S.card}>
          <div style={{...S.lbl,marginBottom:12}}>Recorrido GPS</div>
          <RouteMap type={d.type}/>
        </div>
      )}

      {/* FC chart */}
      <div style={S.card}>
        <div style={{...S.lbl,marginBottom:10}}>Frecuencia Cardíaca</div>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={d.hrChart}>
            <defs><linearGradient id="whr" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={G.red} stopOpacity={0.4}/><stop offset="100%" stopColor={G.red} stopOpacity={0}/></linearGradient></defs>
            <XAxis dataKey="t" tick={{fill:G.muted,fontSize:10}} axisLine={false} tickLine={false} unit="min"/>
            <YAxis tick={{fill:G.muted,fontSize:10,fontFamily:mono}} axisLine={false} tickLine={false} domain={[60,165]} tickCount={5}/>
            <Tooltip content={<Tip unit="bpm"/>} cursor={{stroke:G.muted+"40",strokeWidth:1}}/>
            <ReferenceLine y={d.avgHr} stroke={G.coral} strokeDasharray="4 2" strokeWidth={1.5}/>
            <Area type="monotone" dataKey="v" stroke={G.red} strokeWidth={2.5} fill="url(#whr)" dot={{fill:G.red,r:3,strokeWidth:0}}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Speed chart */}
      {d.speedChart&&(
        <div style={S.card}>
          <div style={{...S.lbl,marginBottom:10}}>Velocidad</div>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={d.speedChart}>
              <defs><linearGradient id="wspd" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={G.accent} stopOpacity={0.4}/><stop offset="100%" stopColor={G.accent} stopOpacity={0}/></linearGradient></defs>
              <XAxis dataKey="t" tick={{fill:G.muted,fontSize:10}} axisLine={false} tickLine={false} unit="min"/>
              <YAxis tick={{fill:G.muted,fontSize:10,fontFamily:mono}} axisLine={false} tickLine={false} domain={[0,"auto"]}/>
              <Tooltip content={<Tip unit="km/h"/>} cursor={{stroke:G.muted+"40",strokeWidth:1}}/>
              <Area type="monotone" dataKey="v" stroke={G.accent} strokeWidth={2.5} fill="url(#wspd)" dot={{fill:G.accent,r:3,strokeWidth:0}}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Zones + load */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <div style={S.card}>
          <div style={{...S.lbl,marginBottom:14}}>Zonas FC</div>
          {d.zones.filter(z=>z.pct>0).map((z,i)=>(
            <div key={i} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <span style={{fontSize:12,color:z.c,fontWeight:600}}>{z.z}</span>
                <span style={{fontFamily:mono,fontSize:12,color:z.c}}>{z.pct}%</span>
              </div>
              <Prog pct={z.pct} color={z.c}/>
            </div>
          ))}
        </div>
        <div style={{...S.card,background:G.amber+"0D",border:`1px solid ${G.amber}30`,display:"flex",flexDirection:"column",justifyContent:"center",gap:10}}>
          <div style={{fontSize:13,color:G.amber,fontWeight:700}}>⚡ Carga de entrenamiento</div>
          <div style={{fontFamily:mono,fontSize:42,fontWeight:800,color:G.amber,lineHeight:1}}>{d.load}</div>
          <div style={{fontSize:11,color:G.muted}}>UA · {d.load<60?"Ligero — recuperación activa":d.load<120?"Moderado — buen trabajo aeróbico":d.load<160?"Intenso — 24–48h recuperación":"Muy intenso — descanso necesario"}</div>
        </div>
      </div>
    </div>
  );
}

// ── SECTION CUSTOMIZER ────────────────────────────────────────────────────────
function SectionCustomizer({allWidgets,activeWidgets,onToggle,extra}) {
  const [open,setOpen] = useState(false);
  return (
    <div style={{marginTop:8}}>
      <div onClick={()=>setOpen(o=>!o)} style={{background:G.surface,border:`1px dashed ${G.border}`,borderRadius:16,padding:"14px 20px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",userSelect:"none"}}>
        <span style={{fontSize:12,color:G.muted,fontWeight:600,letterSpacing:"0.08em"}}>⊞ PERSONALIZAR SECCIÓN</span>
        <span style={{fontSize:12,color:G.muted}}>{open?"▲ Cerrar":"▼ Mostrar opciones"}</span>
      </div>
      {open&&(
        <div style={{background:G.surface,border:`1px solid ${G.border}`,borderRadius:"0 0 16px 16px",padding:"16px 20px",marginTop:-1,display:"flex",flexDirection:"column",gap:10}}>
          <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
            {allWidgets.map(w=>{
              const on = activeWidgets.includes(w.id);
              return (
                <div key={w.id} onClick={()=>onToggle(w.id)}
                  style={{display:"flex",alignItems:"center",gap:8,padding:"7px 14px",borderRadius:10,cursor:"pointer",border:`1px solid ${on?G.accent:G.border}`,background:on?G.accent+"12":"transparent",transition:"all 0.18s"}}>
                  <div style={{width:18,height:18,borderRadius:5,background:on?G.accent:G.dim,border:`1px solid ${on?G.accent:G.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:on?"#000":G.muted}}>{on?"✓":""}</div>
                  <span style={{fontSize:12,color:on?G.text:G.muted,fontWeight:on?600:400}}>{w.label}</span>
                </div>
              );
            })}
          </div>
          {extra}
          <div style={{fontSize:11,color:G.muted}}>Los cambios se aplican inmediatamente.</div>
        </div>
      )}
    </div>
  );
}

// ── NOTIF MODAL ───────────────────────────────────────────────────────────────
function NotifModal({onClose,notifTime,setNotifTime,morningTime,setMorningTime}) {
  const [tab,setTab] = useState("night");
  const [sentN,setSentN] = useState(false);
  const [schedN,setSchedN] = useState(false);
  const [schedM,setSchedM] = useState(false);
  const tabSt = (a) => ({flex:1,padding:"9px 0",fontSize:12,fontWeight:700,fontFamily:font,cursor:"pointer",border:"none",borderRadius:10,background:a?G.accent+"18":"transparent",color:a?G.accent:G.muted,transition:"all 0.18s"});
  return (
    <div style={{position:"fixed",inset:0,background:"#00000090",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:G.card,border:`1px solid ${G.border}`,borderRadius:24,padding:24,width:390,maxWidth:"94vw"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div style={{fontWeight:800,fontSize:16}}>📱 Notificaciones Automáticas</div>
          <span onClick={onClose} style={{cursor:"pointer",color:G.muted,fontSize:18}}>✕</span>
        </div>
        <div style={{display:"flex",gap:6,marginBottom:18,background:G.surface,borderRadius:12,padding:4}}>
          <button style={tabSt(tab==="night")} onClick={()=>setTab("night")}>🌙 Noche</button>
          <button style={tabSt(tab==="morning")} onClick={()=>setTab("morning")}>☀️ Mañana</button>
        </div>
        {tab==="night"&&<>
          <div style={{background:G.surface,border:`1px solid ${G.border}`,borderRadius:14,padding:"12px 16px",marginBottom:14}}>
            <div style={{...S.lbl,marginBottom:8}}>🕐 Hora del resumen nocturno</div>
            <div style={{display:"flex",gap:10}}>
              <input type="time" value={notifTime} onChange={e=>setNotifTime(e.target.value)} style={{...S.inp,fontFamily:mono,fontSize:16,fontWeight:700,color:G.accent,flex:1}}/>
              <button onClick={()=>setSchedN(true)} style={{...S.btn(G.blue),padding:"8px 14px",fontSize:12}}>{schedN?"✓":"Programar"}</button>
            </div>
          </div>
          <button style={{...S.btn(G.accent),width:"100%"}} onClick={()=>setSentN(true)}>{sentN?"✓ Enviada":"📱 Enviar resumen ahora"}</button>
        </>}
        {tab==="morning"&&<>
          <div style={{background:G.surface,border:`1px solid ${G.border}`,borderRadius:14,padding:"12px 16px",marginBottom:14}}>
            <div style={{...S.lbl,marginBottom:8}}>☀️ Hora de notificación matutina</div>
            <div style={{display:"flex",gap:10}}>
              <input type="time" value={morningTime} onChange={e=>setMorningTime(e.target.value)} style={{...S.inp,fontFamily:mono,fontSize:16,fontWeight:700,color:G.amber,flex:1}}/>
              <button onClick={()=>setSchedM(true)} style={{...S.btn(G.amber),padding:"8px 14px",fontSize:12}}>{schedM?"✓":"Programar"}</button>
            </div>
          </div>
          <button style={{...S.btn(G.amber),width:"100%"}}>☀️ Enviar ahora</button>
        </>}
      </div>
    </div>
  );
}

// ── AI ASSISTANT ──────────────────────────────────────────────────────────────
function AIAssistant() {
  const [open,setOpen] = useState(false);
  const [msgs,setMsgs] = useState([{role:"assistant",content:"¡Hola! Soy tu asistente de salud. Puedo analizar tus datos de sueño, actividad, FC, HRV y más. ¿En qué puedo ayudarte hoy?"}]);
  const [input,setInput] = useState("");
  const [loading,setLoading] = useState(false);
  const endRef = useRef(null);
  useEffect(()=>{ if (open) endRef.current?.scrollIntoView({behavior:"smooth"}); },[msgs,open]);
  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim(); setInput("");
    const newMsgs = [...msgs,{role:"user",content:userMsg}];
    setMsgs(newMsgs); setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json","anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
        body:JSON.stringify({
          model:"claude-haiku-4-5-20251001", max_tokens:500,
          system:`Eres el asistente de salud de VitaSync. Responde SIEMPRE en español.
DATOS HOY: Sueño 7h20m/84pts · FC 68bpm/máx147 · SpO₂ 97% · HRV 49ms · Estrés 28/100 · Pasos 8900/12000 · De pie 9h/12h · Agua 1.6L.
REGLAS: emojis+bullets · cita datos reales · da acción concreta · máx 150 palabras.
FORMATO: **📊 Análisis:** bullets \n**✅ Hoy puedes:** acción concreta`,
          messages:newMsgs.map(m=>({role:m.role,content:m.content}))
        })
      });
      const d = await res.json();
      setMsgs(m=>[...m,{role:"assistant",content:d.content?.[0]?.text||`Error: ${JSON.stringify(d.error||d)}`}]);
    } catch(e) {
      setMsgs(m=>[...m,{role:"assistant",content:`Error de conexión: ${e.message}`}]);
    }
    setLoading(false);
  };
  const sugs = ["¿Cómo estuvo mi sueño?","¿Debería entrenar hoy?","¿Cómo mejorar mi HRV?","Resumen del día"];
  return (
    <>
      <div onClick={()=>setOpen(o=>!o)} style={{position:"fixed",bottom:28,right:28,width:54,height:54,borderRadius:"50%",background:G.accent,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",boxShadow:`0 4px 20px ${G.accent}60`,zIndex:200,fontSize:22,transition:"transform 0.2s",transform:open?"rotate(45deg)":"none"}}>{open?"✕":"✦"}</div>
      {open&&(
        <div style={{position:"fixed",bottom:96,right:28,width:340,maxHeight:"70vh",background:G.card,border:`1px solid ${G.border}`,borderRadius:24,display:"flex",flexDirection:"column",zIndex:200,boxShadow:"0 12px 48px #00000080",overflow:"hidden"}}>
          <div style={{padding:"16px 20px",borderBottom:`1px solid ${G.border}`,display:"flex",alignItems:"center",gap:12,background:G.surface}}>
            <div style={{width:36,height:36,borderRadius:"50%",background:G.accent+"20",border:`1px solid ${G.accent}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>✦</div>
            <div><div style={{fontWeight:700,fontSize:14}}>Asistente VitaSync</div><div style={{fontSize:11,color:G.accent}}>● Activo · IA con tus datos</div></div>
          </div>
          <div style={{flex:1,overflowY:"auto",padding:16,display:"flex",flexDirection:"column",gap:10}}>
            {msgs.map((m,i)=>{
              const formatted = m.role==="assistant"
                ? m.content.replace(/\*\*(.*?)\*\*/g,'<strong style="color:#00E5A0">$1</strong>').replace(/\n/g,'<br/>')
                : m.content;
              return (
                <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
                  <div style={{maxWidth:"88%",padding:"10px 14px",borderRadius:m.role==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px",background:m.role==="user"?G.accent:G.surface,color:m.role==="user"?"#000":G.text,fontSize:13,lineHeight:1.65}} dangerouslySetInnerHTML={{__html:formatted}}/>
                </div>
              );
            })}
            {loading&&<div style={{display:"flex",gap:5,padding:"10px 14px",background:G.surface,borderRadius:"16px 16px 16px 4px",width:"fit-content"}}>
              {[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:G.accent,animation:`pulse 1.2s ${i*0.2}s infinite`}}/>)}
            </div>}
            <div ref={endRef}/>
          </div>
          {msgs.length<=1&&<div style={{padding:"8px 14px",display:"flex",gap:6,flexWrap:"wrap",borderTop:`1px solid ${G.border}`}}>
            {sugs.map(s=><button key={s} onClick={()=>setInput(s)} style={{padding:"5px 10px",borderRadius:99,fontSize:11,background:G.dim,border:`1px solid ${G.border}`,color:G.muted,cursor:"pointer",fontFamily:font}}>{s}</button>)}
          </div>}
          <div style={{padding:"12px 14px",borderTop:`1px solid ${G.border}`,display:"flex",gap:8}}>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Pregunta sobre tu salud…" style={{...S.inp,fontSize:13,padding:"9px 14px",flex:1}}/>
            <button onClick={send} style={{...S.btn(G.accent),padding:"9px 14px",fontSize:14,flexShrink:0}}>↑</button>
          </div>
        </div>
      )}
    </>
  );
}

// ── WIDGET REGISTRY ───────────────────────────────────────────────────────────
const defaultWidgets = {
  dashboard:{
    all:[
      {id:"rings",       label:"Anillos vitales"},
      {id:"importantData",label:"Progreso objetivos"},
      {id:"sleepCard",   label:"Sueño anoche"},
      {id:"kpis",        label:"FC + Panel vitals"},
      {id:"weekChart",   label:"Gráfico semanal"},
      {id:"wellness",    label:"Estrés/HRV/Cansancio"},
    ],
    active:["rings","importantData","sleepCard","kpis","weekChart"]
  },
  heart:{
    all:[{id:"rings",label:"Anillos FC/SpO₂/HRV"},{id:"hrChart",label:"Gráfica FC diaria"},{id:"spo2hrv",label:"SpO₂ y HRV"},{id:"zones",label:"Zonas de FC"}],
    active:["rings","hrChart","spo2hrv","zones"]
  },
  sleep:{
    all:[{id:"rings",label:"Anillo puntuación"},{id:"hypno",label:"Hipnograma fases"},{id:"weekBars",label:"Sueño semanal"},{id:"timings",label:"Horarios y latencia"}],
    active:["rings","hypno","weekBars","timings"]
  },
  activity:{
    all:[{id:"rings",label:"Anillos objetivos"},{id:"stepsChart",label:"Gráfica pasos"},{id:"actLog",label:"Registro actividades"},{id:"trainLoad",label:"Carga Entrenamiento"}],
    active:["rings","stepsChart","actLog","trainLoad"]
  },
  wellness:{
    all:[{id:"rings",label:"Anillos bienestar"},{id:"stressDetail",label:"Detalle Estrés"},{id:"hrv",label:"HRV semana"},{id:"recs",label:"Recomendaciones"}],
    active:["rings","stressDetail","hrv","recs"]
  },
  diet:{
    all:[{id:"rings",label:"Anillos nutrición"},{id:"macros",label:"Macronutrientes"},{id:"mealLog",label:"Registro comidas"}],
    active:["rings","macros","mealLog"]
  },
};

function useWidgets(sec) {
  const [active,setActive] = useState(defaultWidgets[sec].active);
  const toggle = (id) => setActive(a=>a.includes(id)?a.filter(x=>x!==id):[...a,id]);
  const has = (id) => active.includes(id);
  return {active,toggle,has,all:defaultWidgets[sec].all};
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function Dashboard({weekMetric,setWeekMetric,profile,onNavigate}) {
  const W = useWidgets("dashboard");
  const ds = weeklyDatasets[weekMetric];
  const name = profile.name || "Usuario";
  const rd = useRealData();
  const steps    = rd?.activity?.steps    ?? 8900;
  const cals     = rd?.activity?.calories ?? 420;
  const stands   = rd?.activity?.stands   ?? 9;
  const slpHrs   = rd?.sleep?.totalHrs    ?? 7.3;
  const slpDeep  = rd?.sleep?.deepMin     ?? 95;
  const slpScore = rd?.sleep?.score       ?? 84;
  const hrRate   = rd?.heart?.rate        ?? 68;
  const hrRest   = rd?.heart?.resting     ?? 52;
  const hrMax    = rd?.heart?.max         ?? 147;
  const spo2     = rd?.heart?.spo2        ?? 97;
  const stress   = rd?.wellness?.stress   ?? 28;
  const pai      = rd?.wellness?.pai      ?? 13;
  const battery  = rd?.wellness?.battery  ?? 25;
  const readiness = Math.round(Math.min(100, Math.max(0,
    (slpScore * 0.4) + ((100 - stress) * 0.35) + (spo2 * 0.25)
  )));
  const recovery = Math.round(Math.min(100, Math.max(0,
    (slpScore * 0.5) + ((100 - stress) * 0.3) + (pai * 0.2 * 5)
  )));

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <div>
        <div style={{fontSize:13,color:G.muted,marginBottom:4}}>Jueves, 12 de marzo · 2026</div>
        <h1 style={{fontSize:28,fontWeight:800,letterSpacing:"-0.02em",margin:0}}>Buenos días, {name} ✦</h1>
      </div>

      {/* TOP RINGS */}
      {W.has("rings")&&<div style={S.card}>
        <div style={{...S.lbl,marginBottom:16}}>Estado General de Hoy</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
          {[
            {label:"Disponibilidad",topic:"Disponibilidad",value:readiness,max:100,  sublabel:"%",from:grad.accent[0],to:grad.accent[1],nav:"wellness"},
            {label:"Pasos",         topic:"Pasos",         value:steps,   max:12000,sublabel:"", from:grad.green[0], to:grad.green[1], nav:"activity"},
            {label:"Sueño",         topic:"Sueño",         value:slpHrs,  max:9,    sublabel:"h",from:grad.blue[0],  to:grad.blue[1],  nav:"sleep"},
            {label:"Recuperación",  topic:"Recuperación",  value:recovery,max:100,  sublabel:"%",from:grad.purple[0],to:grad.purple[1],nav:"wellness"},
          ].map(r=>(
            <div key={r.label} onClick={()=>onNavigate(r.nav)}
              style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8,padding:"8px 0",cursor:"pointer"}}
              onMouseEnter={e=>e.currentTarget.style.opacity="0.85"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
              <GradientRing value={r.value} max={r.max} colorFrom={r.from} colorTo={r.to} size={88}
                label={r.sublabel===""?`${Math.round(r.value/1000*10)/10}K`:r.value}
                sublabel={r.sublabel}/>
              <div style={{display:"flex",gap:4,alignItems:"center"}}><span style={{fontSize:11,color:G.muted,textAlign:"center"}}>{r.label}</span><InfoTip topic={r.topic}/></div>
            </div>
          ))}
        </div>
      </div>}

      {/* PROGRESO OBJETIVOS */}
      {W.has("importantData")&&<div style={S.card}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <span style={S.lbl}>Progreso de Objetivos</span>
          <span style={S.badge(G.accent)}>HOY</span>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {[
            {label:"Pasos",           topic:"Pasos",         value:steps, max:12000, unit:"/ 12K pasos", color:G.accent, nav:"activity"},
            {label:"Calorías activas",topic:"Calorías",      value:cals, max:600, unit:"/ 600 kcal",  color:G.amber,  nav:"activity"},
            {label:"Horas de pie",    topic:"De Pie",        value:stands, max:12, unit:"/ 12 h",      color:G.green,  nav:"activity"},
            {label:"HRV",             topic:"HRV",           value:49,   max:80,    unit:"/ 80 ms",     color:G.purple, nav:"heart"},
            {label:"Sueño anoche",    topic:"Sueño",         value:slpHrs, max:9, unit:"/ 9 h",       color:G.blue,   nav:"sleep"},
            {label:"Disponibilidad",  topic:"Disponibilidad",value:readiness, max:100, unit:"%",           color:G.accent, nav:"wellness"},
            {label:"Pisos subidos",   topic:"Pisos",         value:8,    max:10,    unit:"/ 10",        color:G.blue,   nav:"activity"},
            {label:"Agua",            topic:"Agua",          value:1600, max:2500,  unit:"/ 2.5 L",     color:G.garnet, nav:"diet"},
          ].map(g=>(
            <div key={g.label} onClick={()=>onNavigate(g.nav)} style={{cursor:"pointer"}}
              onMouseEnter={e=>e.currentTarget.style.opacity="0.8"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                <div style={{display:"flex",gap:5,alignItems:"center"}}><span style={{fontSize:12}}>{g.label}</span><InfoTip topic={g.topic}/></div>
                <span style={{fontFamily:mono,fontSize:12,color:g.color}}>
                  {g.label==="Agua"?`${(g.value/1000).toFixed(1)}L`:g.value>=1000?`${(g.value/1000).toFixed(1)}K`:g.value}
                  <span style={{color:G.muted,marginLeft:2}}>{g.unit}</span>
                </span>
              </div>
              <Prog pct={(g.value/g.max)*100} color={g.color}/>
            </div>
          ))}
        </div>
      </div>}

      {/* SUEÑO ANOCHE */}
      {W.has("sleepCard")&&(
        <div onClick={()=>onNavigate("sleep")} style={{...S.card,cursor:"pointer"}}
          onMouseEnter={e=>e.currentTarget.style.opacity="0.9"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
            <div style={{display:"flex",gap:5,alignItems:"center"}}><span style={S.lbl}>Sueño Anoche</span><InfoTip topic="Sueño"/></div>
            <span style={S.badge(G.blue)}>{slpScore>=80?"BUENO":slpScore>=60?"REGULAR":"MEJORABLE"} · {slpScore}/100</span>
          </div>
          <div style={{fontFamily:mono,fontSize:26,fontWeight:700,color:G.blue,marginBottom:10}}>{Math.floor(slpHrs)}h {Math.round((slpHrs%1)*60)}<span style={{fontSize:13,color:G.muted,fontFamily:font}}> min</span></div>
          <div style={{display:"flex",gap:8,marginBottom:12}}>
            {sleepPhaseSummary.map(s=>(
              <div key={s.fase} style={{flex:1}}>
                <div style={{fontSize:10,color:s.color,fontWeight:700,marginBottom:3}}>{s.fase}</div>
                <div style={{fontFamily:mono,fontSize:13,fontWeight:700,color:G.text}}>{s.min}<span style={{fontSize:9,color:G.muted}}>m</span></div>
              </div>
            ))}
          </div>
          <Hypnogram compact={true}/>
        </div>
      )}

      {/* FC + BEVEL PANEL — now 8 rows including Estrés + HRV + Disponibilidad */}
      {W.has("kpis")&&<div style={{display:"grid",gridTemplateColumns:"1fr 310px",gap:16}}>
        <div onClick={()=>onNavigate("heart")} style={{...S.card,cursor:"pointer"}}
          onMouseEnter={e=>e.currentTarget.style.opacity="0.9"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{display:"flex",gap:5,alignItems:"center"}}><span style={S.lbl}>Frecuencia Cardíaca</span><InfoTip topic="FC"/></div>
            <span style={S.badge(G.coral)}>ÓPTIMO</span>
          </div>
          <div style={{display:"flex",alignItems:"baseline",gap:6,marginBottom:10}}>
            <span style={{fontFamily:mono,fontSize:40,fontWeight:800,color:G.coral,letterSpacing:"-0.03em"}}>{hrRate}</span>
            <span style={{fontSize:14,color:G.muted}}>bpm · reposo</span>
          </div>
          <div style={{display:"flex",gap:16,marginBottom:10}}>
            {[{l:"Máx.",v:`${hrMax} bpm`,c:G.amber},{l:"Mín.",v:`${hrRest} bpm`,c:G.blue},{l:"Media",v:`${hrRate} bpm`,c:G.coral}].map(x=>(
              <div key={x.l}><div style={{fontSize:10,color:G.muted,marginBottom:2}}>{x.l}</div><div style={{fontFamily:mono,fontSize:13,fontWeight:700,color:x.c}}>{x.v}</div></div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={72}>
            <AreaChart data={hrData}>
              <defs><linearGradient id="hg0" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={G.coral} stopOpacity={0.3}/><stop offset="100%" stopColor={G.coral} stopOpacity={0}/></linearGradient></defs>
              <XAxis dataKey="t" tick={{fill:G.muted,fontSize:9}} axisLine={false} tickLine={false}/>
              <Tooltip content={<Tip unit="bpm"/>} cursor={{stroke:G.muted+"40",strokeWidth:1}}/>
              <Area type="monotone" dataKey="v" stroke={G.coral} strokeWidth={2} fill="url(#hg0)" dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Bevel vertical vitals — compact */}
        <div style={{background:G.card,border:`1px solid ${G.border}`,borderRadius:20,overflow:"hidden",display:"flex",flexDirection:"column"}}>
          {[
            {abbr:"PPM",    value:hrRate, unit:"bpm", color:G.red,    nav:"heart",    spark:[58,62,70,85,91,78,72,hrRate]},
            {abbr:"VFC",    value:49,    unit:"ms",   color:G.purple, nav:"wellness", spark:[42,38,45,41,48,52,49,49]},
            {abbr:"ESTRÉS", value:stress, unit:"/100",color:G.amber,  nav:"wellness", spark:[45,55,38,65,28,22,35,stress]},
            {abbr:"SpO₂",   value:97,    unit:"%",    color:G.garnet, nav:"heart",    spark:[97,96,97,98,97,98,97,97]},
            {abbr:"SUEÑO",  value:"7.3", unit:"h",    color:G.blue,   nav:"sleep",    spark:[6.2,7.1,5.8,7.4,8.0,6.9,7.3,7.3]},
            {abbr:"PASOS",  value:"8.9K",unit:"/12K", color:G.accent, nav:"activity", spark:[7840,10200,6300,9100,11400,14200,8900,8900]},
            {abbr:"DE PIE", value:"9",   unit:"/12h", color:G.green,  nav:"activity", spark:[1,2,3,2,3,4,2,3]},
            {abbr:"DISP.",  value:"78",  unit:"%",    color:G.accent, nav:"wellness", spark:[65,70,72,68,75,78,76,78]},
          ].map((m,i,arr)=>{
            const mn = Math.min(...m.spark), mx = Math.max(...m.spark);
            const pts = m.spark.map((v,j)=>{
              const x = (j/(m.spark.length-1))*44+1;
              const y = mx===mn ? 8 : 14-((v-mn)/(mx-mn))*12;
              return `${x},${y}`;
            }).join(" ");
            return (
              <div key={m.abbr} onClick={()=>onNavigate(m.nav)}
                style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 14px",borderBottom:i<arr.length-1?`1px solid ${G.border}`:"none",gap:6,cursor:"pointer",transition:"background 0.15s"}}
                onMouseEnter={e=>e.currentTarget.style.background=G.dim+"80"}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <div style={{display:"flex",alignItems:"center",gap:8,flex:1,minWidth:0}}>
                  <span style={{width:3,height:22,borderRadius:2,background:m.color,flexShrink:0,display:"block"}}/>
                  <div style={{display:"flex",alignItems:"baseline",gap:4,minWidth:0}}>
                    <span style={{fontSize:7,letterSpacing:"0.1em",textTransform:"uppercase",color:G.muted,fontWeight:700,flexShrink:0}}>{m.abbr}</span>
                    <span style={{fontFamily:mono,fontSize:14,fontWeight:800,color:m.color,letterSpacing:"-0.02em",lineHeight:1}}>{m.value}</span>
                    <span style={{fontSize:8,color:G.muted,lineHeight:1}}>{m.unit}</span>
                  </div>
                </div>
                <svg width="46" height="16" viewBox="0 0 46 16" style={{flexShrink:0}}>
                  <polyline fill="none" stroke={m.color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" points={pts} opacity="0.85"/>
                </svg>
              </div>
            );
          })}
        </div>
      </div>}

      {/* GRÁFICO SEMANAL */}
      {W.has("weekChart")&&<div style={S.card}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
          <div>
            <span style={S.lbl}>Semana · {ds.label}</span>
            <div style={{fontFamily:mono,fontSize:14,fontWeight:700,color:ds.color,marginTop:4}}>{ds.icon} {ds.summary}</div>
          </div>
          <span style={S.badge(ds.color)}>{ds.badge}</span>
        </div>
        <ResponsiveContainer width="100%" height={130}>
          {ds.chartType==="area"?(
            <AreaChart data={ds.data}>
              <defs><linearGradient id="wg0" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={ds.color} stopOpacity={0.35}/><stop offset="100%" stopColor={ds.color} stopOpacity={0}/></linearGradient></defs>
              <XAxis dataKey="d" tick={{fill:G.muted,fontSize:11}} axisLine={false} tickLine={false}/>
              <Tooltip content={<Tip unit={ds.unit}/>} cursor={{stroke:G.muted+"40",strokeWidth:1}}/>
              <Area type="monotone" dataKey="v" stroke={ds.color} strokeWidth={2} fill="url(#wg0)" dot={false}/>
            </AreaChart>
          ):(
            <BarChart data={ds.data} barSize={22}>
              <XAxis dataKey="d" tick={{fill:G.muted,fontSize:11}} axisLine={false} tickLine={false}/>
              <Tooltip content={<Tip unit={ds.unit}/>} cursor={{fill:G.dim+"80"}}/>
              <Bar dataKey="v" fill={ds.color} radius={[4,4,0,0]}/>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>}

      {/* WELLNESS STRIP */}
      {W.has("wellness")&&<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
        {[
          {label:"Nivel de Estrés",topic:"Estrés",   value:28,max:100,color:G.amber, unit:"/100",note:"Bajo"},
          {label:"HRV",           topic:"HRV",        value:49,max:80, color:G.purple,unit:"ms",  note:"Bueno"},
          {label:"Cansancio",     topic:"Cansancio",  value:35,max:100,color:G.coral, unit:"%",   note:"Descansado"},
        ].map(w=>(
          <div key={w.label} onClick={()=>onNavigate("wellness")} style={{...S.mc,cursor:"pointer"}}
            onMouseEnter={e=>e.currentTarget.style.opacity="0.85"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              <div style={{display:"flex",gap:5,alignItems:"center"}}><span style={S.lbl}>{w.label}</span><InfoTip topic={w.topic}/></div>
              <span style={S.badge(w.color)}>{w.note}</span>
            </div>
            <div style={{fontFamily:mono,fontSize:26,fontWeight:700,color:w.color}}>{w.value}<span style={{fontSize:12,color:G.muted,fontFamily:font}}>{w.unit}</span></div>
            <Prog pct={(w.value/w.max)*100} color={w.color}/>
          </div>
        ))}
      </div>}

      <SectionCustomizer allWidgets={W.all} activeWidgets={W.active} onToggle={W.toggle}
        extra={
          <div style={{borderTop:`1px solid ${G.border}`,paddingTop:12,marginTop:4}}>
            <div style={{...S.lbl,marginBottom:8}}>Gráfico semanal — métrica</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {Object.entries(weeklyDatasets).map(([key,val])=>{
                const act = weekMetric===key;
                return <button key={key} onClick={()=>setWeekMetric(key)} style={{padding:"6px 12px",borderRadius:99,fontSize:11,fontWeight:700,fontFamily:font,cursor:"pointer",border:`1px solid ${act?val.color:G.border}`,background:act?val.color+"22":"transparent",color:act?val.color:G.muted,transition:"all 0.18s"}}>{val.icon} {val.label}</button>;
              })}
            </div>
          </div>
        }
      />
    </div>
  );
}

// ── HEART VIEW ────────────────────────────────────────────────────────────────
function HeartView() {
  const W = useWidgets("heart");
  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <SectionHero accentColor="#FF3B30" bgColor="#3A0010">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
          <div>
            <div style={{fontSize:12,letterSpacing:"0.1em",textTransform:"uppercase",color:"#FF7070",fontWeight:600,marginBottom:6}}>Salud Cardíaca</div>
            <h2 style={{fontSize:26,fontWeight:800,margin:0}}>Corazón & Circulación</h2>
          </div>
          <Heart size={34} color="#FF3B30" style={{opacity:0.85}}/>
        </div>
        {W.has("rings")&&<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
          {[
            {label:"FC Reposo",topic:"FC Reposo",value:58,  max:100,sublabel:"bpm",from:grad.red[0],   to:grad.red[1]},
            {label:"SpO₂",    topic:"SpO₂",     value:97,  max:100,sublabel:"%",  from:grad.garnet[0],to:grad.garnet[1]},
            {label:"HRV",     topic:"HRV",       value:49,  max:80, sublabel:"ms", from:grad.purple[0],to:grad.purple[1]},
            {label:"FC Máx.", topic:"FC",        value:147, max:200,sublabel:"bpm",from:grad.amber[0], to:grad.amber[1]},
          ].map(r=>(
            <div key={r.label} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8,padding:"8px 0"}}>
              <GradientRing value={r.value} max={r.max} colorFrom={r.from} colorTo={r.to} size={94} label={r.value} sublabel={r.sublabel}/>
              <div style={{display:"flex",gap:4,alignItems:"center"}}><span style={{fontSize:11,color:"#A07070",textAlign:"center"}}>{r.label}</span><InfoTip topic={r.topic}/></div>
            </div>
          ))}
        </div>}
      </SectionHero>

      {W.has("hrChart")&&<div style={S.card}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
          <div style={{display:"flex",gap:5,alignItems:"center"}}><span style={S.lbl}>Frecuencia Cardíaca — Hoy</span><InfoTip topic="FC"/></div>
          <span style={S.badge(G.coral)}>ACTIVO</span>
        </div>
        <div style={{display:"flex",gap:28,marginBottom:14,flexWrap:"wrap"}}>
          {[{l:"Actual",v:"68",u:"bpm",c:G.coral},{l:"Máx.",v:"147",u:"bpm",c:G.amber},{l:"Mín.",v:"52",u:"bpm",c:G.blue},{l:"Media",v:"78",u:"bpm",c:G.muted}].map(x=>(
            <div key={x.l}>
              <div style={{fontSize:10,color:G.muted,marginBottom:2}}>{x.l}</div>
              <div style={{fontFamily:mono,fontSize:22,fontWeight:800,color:x.c}}>{x.v}<span style={{fontSize:11,color:G.muted,fontWeight:400}}> {x.u}</span></div>
            </div>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={hrData}>
            <defs><linearGradient id="hg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={G.coral} stopOpacity={0.35}/><stop offset="100%" stopColor={G.coral} stopOpacity={0}/></linearGradient></defs>
            <XAxis dataKey="t" tick={{fill:G.muted,fontSize:11}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fill:G.muted,fontSize:12,fontFamily:mono}} axisLine={false} tickLine={false} domain={[45,110]} tickCount={5}/>
            <Tooltip content={<Tip unit="bpm"/>} cursor={{stroke:G.muted+"40",strokeWidth:1}}/>
            <Area type="monotone" dataKey="v" stroke={G.coral} strokeWidth={3} fill="url(#hg2)" dot={{fill:G.coral,r:3,strokeWidth:0}}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>}

      {W.has("spo2hrv")&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <div style={S.card}>
          <div style={{display:"flex",gap:5,alignItems:"center",marginBottom:4}}><span style={S.lbl}>SpO₂ — 24h</span><InfoTip topic="SpO₂"/></div>
          <div style={{display:"flex",gap:20,marginBottom:12}}>
            {[{l:"Actual",v:"97",c:G.garnet},{l:"Mín.",v:"94",c:G.coral},{l:"Media",v:"97",c:G.muted}].map(x=>(
              <div key={x.l}>
                <div style={{fontSize:9,color:G.muted,marginBottom:1}}>{x.l}</div>
                <div style={{fontFamily:mono,fontSize:20,fontWeight:800,color:x.c}}>{x.v}<span style={{fontSize:10,color:G.muted}}>%</span></div>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={130}>
            <LineChart data={spo2Data}>
              <XAxis dataKey="t" tick={{fill:G.muted,fontSize:10}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:G.muted,fontSize:11,fontFamily:mono}} axisLine={false} tickLine={false} domain={[93,100]} tickCount={4}/>
              <Tooltip content={<Tip unit="%"/>} cursor={{stroke:G.muted+"40",strokeWidth:1}}/>
              <Line type="monotone" dataKey="v" stroke={G.garnet} strokeWidth={3} dot={{fill:G.garnet,r:3,strokeWidth:0}}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={S.card}>
          <div style={{display:"flex",gap:5,alignItems:"center",marginBottom:4}}><span style={S.lbl}>HRV — Semana</span><InfoTip topic="HRV"/></div>
          <div style={{display:"flex",gap:20,marginBottom:12}}>
            {[{l:"Hoy",v:"49",c:G.purple},{l:"Media",v:"45",c:G.muted},{l:"Mejor",v:"52",c:G.accent}].map(x=>(
              <div key={x.l}>
                <div style={{fontSize:9,color:G.muted,marginBottom:1}}>{x.l}</div>
                <div style={{fontFamily:mono,fontSize:20,fontWeight:800,color:x.c}}>{x.v}<span style={{fontSize:10,color:G.muted}}>ms</span></div>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={hrvData} barSize={24}>
              <XAxis dataKey="d" tick={{fill:G.muted,fontSize:10}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:G.muted,fontSize:11,fontFamily:mono}} axisLine={false} tickLine={false} domain={[30,60]} tickCount={4}/>
              <Tooltip content={<Tip unit="ms"/>} cursor={{fill:G.dim+"80"}}/>
              <Bar dataKey="v" radius={[4,4,0,0]}>
                {hrvData.map((e,i)=><Cell key={i} fill={e.d==="D"?G.purple:G.purple+"90"}/>)}
                <LabelList dataKey="v" content={(p)=>{const{x,y,width,value}=p;return <text x={x+width/2} y={y-5} fill={G.purple} textAnchor="middle" fontSize={10} fontFamily={mono} fontWeight={700}>{value}</text>;}}/>
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>}

      {W.has("zones")&&<div style={S.card}>
        <div style={{...S.lbl,marginBottom:16}}>Zonas de FC — Sesión de Hoy</div>
        {[{zona:"Z1 Recuperación",pct:15,rng:"< 108 bpm",color:G.blue},{zona:"Z2 Base Aeróbica",pct:48,rng:"108–126 bpm",color:G.accent},{zona:"Z3 Aeróbico",pct:28,rng:"126–144 bpm",color:G.amber},{zona:"Z4 Umbral",pct:9,rng:"144–162 bpm",color:G.coral}].map(z=>(
          <div key={z.zona} style={{marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><span style={{fontSize:13}}>{z.zona}</span><span style={{fontFamily:mono,fontSize:13,color:z.color}}>{z.pct}% · <span style={{color:G.muted}}>{z.rng}</span></span></div>
            <Prog pct={z.pct} color={z.color}/>
          </div>
        ))}
      </div>}
      <SectionCustomizer allWidgets={W.all} activeWidgets={W.active} onToggle={W.toggle}/>
    </div>
  );
}

// ── SLEEP VIEW ────────────────────────────────────────────────────────────────
function SleepView() {
  const W = useWidgets("sleep");
  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      {/* Deep blue night sky — like Bevel screenshot */}
      <SectionHero accentColor="#4D9EFF" bgColor="#0D1540">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
          <div>
            <div style={{fontSize:12,letterSpacing:"0.1em",textTransform:"uppercase",color:"#6080C0",fontWeight:600,marginBottom:6}}>Sueño & Recuperación</div>
            <h2 style={{fontSize:26,fontWeight:800,margin:0}}>Anoche · 7h 20m</h2>
          </div>
          <Moon size={34} color="#4D9EFF" style={{opacity:0.85}}/>
        </div>
        {W.has("rings")&&(
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:20}}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
              <GradientRing value={84} max={100} colorFrom={grad.blue[0]} colorTo={grad.blue[1]} size={130} label={84} sublabel="%"/>
              <div style={{display:"flex",gap:4,alignItems:"center"}}><span style={{fontSize:12,color:"#6080C0"}}>Puntuación de sueño</span><InfoTip topic="Sueño"/></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,width:"100%"}}>
              {[...sleepPhaseSummary,{fase:"FC Mín",min:null,bpm:52,color:G.coral}].map(s=>(
                <div key={s.fase} style={{padding:"10px 8px",background:"#FFFFFF0A",borderRadius:12,border:`1px solid ${s.color}28`,textAlign:"center"}}>
                  <div style={{display:"flex",gap:5,alignItems:"center",justifyContent:"center",marginBottom:5}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:s.color}}/>
                    <InfoTip topic={s.fase==="FC Mín"?"FC Nocturna":"Sueño"}/>
                  </div>
                  <div style={{fontSize:9,color:"#7080A0",marginBottom:3}}>{s.fase}</div>
                  <div style={{fontFamily:mono,fontSize:16,fontWeight:700,color:s.color}}>
                    {s.bpm?<>{s.bpm}<span style={{fontSize:9,color:"#7080A0"}}>bpm</span></>:<>{s.min}<span style={{fontSize:9,color:"#7080A0"}}>m</span></>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </SectionHero>

      {W.has("hypno")&&<div style={S.card}>
        <div style={{display:"flex",gap:5,alignItems:"center",marginBottom:16}}><span style={S.lbl}>Fases de Sueño — Anoche</span><InfoTip topic="Sueño"/></div>
        <Hypnogram/>
      </div>}

      {W.has("weekBars")&&<div style={S.card}>
        <div style={{display:"flex",gap:5,alignItems:"center",marginBottom:16}}><span style={S.lbl}>Sueño Esta Semana</span><InfoTip topic="Sueño"/></div>
        <ResponsiveContainer width="100%" height={190}>
          <BarChart data={sleepWeek} barSize={28} margin={{top:22,right:0,left:0,bottom:0}}>
            <XAxis dataKey="d" tick={{fill:G.muted,fontSize:11}} axisLine={false} tickLine={false}/>
            <YAxis domain={[0,10]} hide/>
            <Tooltip content={<Tip unit="h"/>} cursor={{fill:G.dim+"80"}}/>
            <Bar dataKey="h" fill={G.blue} radius={[6,6,0,0]}><LabelList content={<Bar2H/>}/></Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>}

      {W.has("timings")&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        {[{label:"Hora de Dormir",value:"23:12",note:"Ideal: 22:30–23:30 ✓",color:G.accent},{label:"Hora de Despertar",value:"06:32",note:"Ciclo completo ✓",color:G.accent},{label:"Latencia de Sueño",value:"8 min",note:"Normal < 20m ✓",color:G.blue},{label:"Despertares",value:"2",note:"Bajo (< 3 óptimo) ✓",color:G.purple}].map(m=>(
          <div key={m.label} style={S.mc}>
            <span style={S.lbl}>{m.label}</span>
            <span style={{fontFamily:mono,fontSize:26,fontWeight:700,color:m.color}}>{m.value}</span>
            <span style={{fontSize:12,color:G.muted}}>{m.note}</span>
          </div>
        ))}
      </div>}
      <SectionCustomizer allWidgets={W.all} activeWidgets={W.active} onToggle={W.toggle}/>
    </div>
  );
}

// ── ACTIVITY VIEW ─────────────────────────────────────────────────────────────
function ActivityView() {
  const W = useWidgets("activity");
  const [workout,setWorkout] = useState(null);
  const actGoals = [
    {label:"Pasos",       topic:"Pasos",    value:8900,max:12000,from:grad.accent[0],to:grad.accent[1]},
    {label:"Cal. activas",topic:"Calorías", value:420, max:600,  from:grad.amber[0], to:grad.amber[1]},
    {label:"De Pie",      topic:"De Pie",   value:9,   max:12,   from:grad.green[0], to:grad.green[1]},
    {label:"Pisos",       topic:"Pisos",    value:8,   max:10,   from:grad.purple[0],to:grad.purple[1]},
  ];
  const actIcons = {run:"🏃",bike:"🚴",yoga:"🧘"};
  if (workout) return <WorkoutDetail type={workout} onBack={()=>setWorkout(null)}/>;

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      {/* Outdoor amber/orange energy */}
      <SectionHero accentColor="#FFB347" bgColor="#3A1A00">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
          <div>
            <div style={{fontSize:12,letterSpacing:"0.1em",textTransform:"uppercase",color:"#C08040",fontWeight:600,marginBottom:6}}>Movimiento & Ejercicio</div>
            <h2 style={{fontSize:26,fontWeight:800,margin:0}}>Actividad Física</h2>
          </div>
          <Activity size={34} color={G.amber} style={{opacity:0.85}}/>
        </div>
        {W.has("rings")&&<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
          {actGoals.map(g=>{
            const val = g.value>=1000?`${(g.value/1000).toFixed(1)}K`:g.value;
            const maxLabel = g.max>=1000?`${g.max/1000}K`:g.max;
            return (
              <div key={g.label} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8,padding:"8px 0"}}>
                <GradientRing value={g.value} max={g.max} colorFrom={g.from} colorTo={g.to} size={94} label={val} sublabel={`/${maxLabel}`}/>
                <div style={{display:"flex",gap:4,alignItems:"center"}}><span style={{fontSize:11,color:"#A07030"}}>{g.label}</span><InfoTip topic={g.topic}/></div>
              </div>
            );
          })}
        </div>}
      </SectionHero>

      {W.has("stepsChart")&&<div style={S.card}>
        <div style={{display:"flex",gap:5,alignItems:"center",marginBottom:14}}><span style={S.lbl}>Pasos — Esta Semana</span><InfoTip topic="Pasos"/></div>
        <ResponsiveContainer width="100%" height={175}>
          <BarChart data={weeklyDatasets.pasos.data} barSize={26} margin={{top:20,right:0,left:0,bottom:0}}>
            <XAxis dataKey="d" tick={{fill:G.muted,fontSize:11}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fill:G.muted,fontSize:11}} axisLine={false} tickLine={false} domain={[0,16000]}/>
            <Tooltip content={<Tip unit="pasos"/>} cursor={{fill:G.dim+"80"}}/>
            <ReferenceLine y={12000} stroke={G.accent} strokeDasharray="4 2" strokeWidth={1.5} label={{value:"Obj",fill:G.accent,fontSize:9,position:"insideTopRight"}}/>
            <Bar dataKey="v" radius={[5,5,0,0]}>
              {weeklyDatasets.pasos.data.map((e,i)=><Cell key={i} fill={e.v>=12000?G.accent:G.accent+"70"}/>)}
              <LabelList dataKey="v" content={<BarLabel/>}/>
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>}

      {W.has("actLog")&&<div style={S.card}>
        <div style={{...S.lbl,marginBottom:16}}>Registro de Actividades</div>
        {activities.map((a,i)=>(
          <div key={i} onClick={()=>setWorkout(a.type)}
            style={{display:"flex",alignItems:"center",gap:16,padding:"14px 0",borderBottom:i<activities.length-1?`1px solid ${G.border}`:"none",cursor:"pointer",transition:"opacity 0.15s"}}
            onMouseEnter={e=>e.currentTarget.style.opacity="0.8"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
            <div style={{width:48,height:48,borderRadius:14,background:G.dim,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{actIcons[a.type]||"🏋️"}</div>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:14}}>{a.name}</div>
              <div style={{fontSize:12,color:G.muted,marginTop:2}}>{a.time}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontFamily:mono,fontSize:14,color:G.amber}}>{a.cal} kcal</div>
              <div style={{fontSize:12,marginTop:3,display:"flex",gap:8,justifyContent:"flex-end",flexWrap:"wrap"}}>
                <span style={{color:G.red}}>♥ {a.hr}</span>
                <span style={{color:G.muted}}>· {a.duration}</span>
                {a.steps&&<span style={{color:G.accent}}>◈ {a.steps.toLocaleString("es")}</span>}
                {a.km&&<span style={{color:G.blue}}>📍 {a.km} km</span>}
              </div>
            </div>
            <div style={{color:G.muted,fontSize:18}}>›</div>
          </div>
        ))}
      </div>}

      {W.has("trainLoad")&&<div style={S.card}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div>
            <div style={{display:"flex",gap:5,alignItems:"center",marginBottom:4}}><span style={S.lbl}>Carga de Entrenamiento</span><InfoTip topic="UA"/></div>
            <div style={{fontFamily:mono,fontSize:28,fontWeight:800,color:G.amber}}>342 <span style={{fontSize:13,color:G.muted,fontFamily:font}}>UA · Esta semana</span></div>
          </div>
          <span style={S.badge(G.amber)}>PRODUCTIVO</span>
        </div>
        <ResponsiveContainer width="100%" height={110}>
          <BarChart data={[{d:"L",v:95},{d:"M",v:0},{d:"X",v:142},{d:"J",v:0},{d:"V",v:105},{d:"S",v:178},{d:"D",v:0}]} barSize={28} margin={{top:18,right:0,left:0,bottom:0}}>
            <XAxis dataKey="d" tick={{fill:G.muted,fontSize:11}} axisLine={false} tickLine={false}/>
            <YAxis hide/><Tooltip content={<Tip unit="UA"/>} cursor={{fill:G.dim+"80"}}/>
            <Bar dataKey="v" radius={[5,5,0,0]} fill={G.amber}>
              <LabelList dataKey="v" content={(p)=>{const{x,y,width,value}=p;if(!value)return null;return <text x={x+width/2} y={y-5} fill={G.amber} textAnchor="middle" fontSize={9} fontFamily={mono}>{value}</text>;}}/>
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginTop:16}}>
          {[{label:"Carga aguda",topic:"Carga Aguda",value:342,color:G.amber,sub:"Últ. 7 días"},{label:"Carga crónica",topic:"Carga Crónica",value:298,color:G.blue,sub:"Últ. 28 días"},{label:"Ratio AC",topic:"Ratio AC",value:"1.15",color:G.accent,sub:"Óptimo: 0.8–1.3"}].map(c=>(
            <div key={c.label} style={{background:G.surface,borderRadius:14,padding:"12px 14px"}}>
              <div style={{display:"flex",gap:4,alignItems:"center",marginBottom:3}}><span style={{fontSize:10,color:G.muted}}>{c.label}</span><InfoTip topic={c.topic}/></div>
              <div style={{fontFamily:mono,fontSize:20,fontWeight:800,color:c.color}}>{c.value}</div>
              <div style={{fontSize:10,color:G.muted,marginTop:2}}>{c.sub}</div>
            </div>
          ))}
        </div>
        <div style={{marginTop:14,padding:"12px 16px",background:G.amber+"10",border:`1px solid ${G.amber}30`,borderRadius:12,fontSize:12,color:G.amber,lineHeight:1.6}}>
          ⚡ Tu ratio AC es 1.15 — zona óptima. Si superas 1.3, aumenta el descanso para evitar lesiones.
        </div>
      </div>}
      <SectionCustomizer allWidgets={W.all} activeWidgets={W.active} onToggle={W.toggle}/>
    </div>
  );
}

// ── WELLNESS VIEW ─────────────────────────────────────────────────────────────
function WellnessView() {
  const W = useWidgets("wellness");
  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      {/* Deep forest green calm */}
      <SectionHero accentColor="#00C875" bgColor="#003018">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
          <div>
            <div style={{fontSize:12,letterSpacing:"0.1em",textTransform:"uppercase",color:"#40A060",fontWeight:600,marginBottom:6}}>Mente & Cuerpo</div>
            <h2 style={{fontSize:26,fontWeight:800,margin:0}}>Bienestar & Estrés</h2>
          </div>
          <Leaf size={34} color={G.green} style={{opacity:0.85}}/>
        </div>
        {W.has("rings")&&<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
          {[
            {label:"Disponibilidad",topic:"Disponibilidad",value:78,max:100,sublabel:"%",from:grad.accent[0],to:grad.accent[1],badge:"PREPARADO"},
            {label:"Estrés",       topic:"Estrés",        value:28,max:100,sublabel:"%",from:grad.amber[0], to:grad.amber[1], badge:"BAJO"},
            {label:"Cansancio",    topic:"Cansancio",     value:35,max:100,sublabel:"%",from:grad.blue[0],  to:grad.blue[1],  badge:"DESCANSADO"},
            {label:"Recuperación", topic:"Recuperación",  value:82,max:100,sublabel:"%",from:grad.purple[0],to:grad.purple[1],badge:"MUY BUENA"},
          ].map(r=>(
            <div key={r.label} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,padding:"8px 0"}}>
              <GradientRing value={r.value} max={r.max} colorFrom={r.from} colorTo={r.to} size={94} label={r.value} sublabel={r.sublabel}/>
              <div style={{display:"flex",gap:4,alignItems:"center"}}><span style={{fontSize:11,color:"#508060"}}>{r.label}</span><InfoTip topic={r.topic}/></div>
              <span style={{fontSize:10,color:r.from,fontWeight:700}}>{r.badge}</span>
            </div>
          ))}
        </div>}
      </SectionHero>

      {W.has("stressDetail")&&<div style={S.card}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{display:"flex",gap:5,alignItems:"center"}}><span style={S.lbl}>Nivel de Estrés — Hoy</span><InfoTip topic="Estrés"/></div>
          <span style={S.badge(G.accent)}>BAJO</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:24,marginBottom:12,flexWrap:"wrap"}}>
          <div>
            <div style={{fontFamily:mono,fontSize:36,fontWeight:800,color:G.amber,letterSpacing:"-0.02em",lineHeight:1}}>28</div>
            <div style={{fontSize:12,color:G.muted,marginTop:3}}>/ 100 · <span style={{color:G.accent,fontWeight:600}}>Zona óptima</span></div>
          </div>
          <div style={{display:"flex",gap:16,flex:1,minWidth:180}}>
            {[{label:"Pico hoy",value:"72",sub:"14:00",color:G.amber},{label:"Mejor momento",value:"18",sub:"22:00",color:G.accent},{label:"Promedio",value:"38",sub:"/100",color:G.muted}].map(s=>(
              <div key={s.label}>
                <div style={{fontSize:9,color:G.muted,marginBottom:2}}>{s.label}</div>
                <div style={{fontFamily:mono,fontSize:18,fontWeight:700,color:s.color}}>{s.value}<span style={{fontSize:10,color:G.muted}}> {s.sub}</span></div>
              </div>
            ))}
          </div>
        </div>
        <div style={{display:"flex",marginBottom:4,borderRadius:6,overflow:"hidden",height:6}}>
          {[G.blue,G.accent,G.amber,G.coral].map((c,i)=><div key={i} style={{flex:1,height:"100%",background:c}}/>)}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:G.muted,marginBottom:12}}>
          <span>0 Relajado</span><span>25 Bajo</span><span>50 Medio</span><span>75 Alto</span><span>100</span>
        </div>
        <ResponsiveContainer width="100%" height={120}>
          <AreaChart data={stressData}>
            <defs><linearGradient id="sg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={G.amber} stopOpacity={0.4}/><stop offset="100%" stopColor={G.amber} stopOpacity={0}/></linearGradient></defs>
            <XAxis dataKey="t" tick={{fill:G.muted,fontSize:10}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fill:G.muted,fontSize:10}} axisLine={false} tickLine={false} domain={[0,100]}/>
            <Tooltip content={<Tip unit="/100"/>} cursor={{stroke:G.muted+"40",strokeWidth:1}}/>
            <ReferenceLine y={25} stroke={G.accent} strokeDasharray="3 2" strokeWidth={1}/>
            <ReferenceLine y={50} stroke={G.amber} strokeDasharray="3 2" strokeWidth={1}/>
            <Area type="monotone" dataKey="v" stroke={G.amber} strokeWidth={2} fill="url(#sg2)" dot={false}/>
          </AreaChart>
        </ResponsiveContainer>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginTop:12}}>
          {[{label:"Promedio semana",value:40,color:G.amber},{label:"Días bajo estrés",value:"6/7",color:G.accent},{label:"Días pico alto",value:"1/7",color:G.coral}].map(s=>(
            <div key={s.label} style={{background:G.surface,borderRadius:10,padding:"9px 12px"}}>
              <div style={{fontSize:9,color:G.muted,marginBottom:2}}>{s.label}</div>
              <div style={{fontFamily:mono,fontSize:17,fontWeight:700,color:s.color}}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>}

      {W.has("hrv")&&<div style={S.card}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{display:"flex",gap:5,alignItems:"center"}}><span style={S.lbl}>HRV — Semana</span><InfoTip topic="HRV"/></div>
          <div style={{display:"flex",gap:16}}>
            {[{l:"Hoy",v:"49",c:G.purple},{l:"Media",v:"45",c:G.muted},{l:"Mejor",v:"52",c:G.accent}].map(x=>(
              <div key={x.l} style={{textAlign:"right"}}>
                <div style={{fontSize:9,color:G.muted}}>{x.l}</div>
                <div style={{fontFamily:mono,fontSize:16,fontWeight:700,color:x.c}}>{x.v}<span style={{fontSize:9,color:G.muted}}>ms</span></div>
              </div>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={hrvData} barSize={30} margin={{top:22,right:0,left:0,bottom:0}}>
            <XAxis dataKey="d" tick={{fill:G.muted,fontSize:11}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fill:G.muted,fontSize:10,fontFamily:mono}} axisLine={false} tickLine={false} domain={[30,60]} tickCount={4}/>
            <Tooltip content={<Tip unit="ms"/>} cursor={{fill:G.dim+"80"}}/>
            <Bar dataKey="v" radius={[5,5,0,0]}>
              {hrvData.map((e,i)=><Cell key={i} fill={e.d==="D"?G.purple:G.purple+"90"}/>)}
              <LabelList dataKey="v" content={(p)=>{const{x,y,width,value}=p;return <text x={x+width/2} y={y-6} fill={G.purple} textAnchor="middle" fontSize={11} fontFamily={mono} fontWeight={700}>{value}</text>;}}/>
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>}

      {W.has("recs")&&<div style={S.card}>
        <div style={{...S.lbl,marginBottom:16}}>Recomendaciones de Hoy</div>
        {[{icon:"✦",text:"Tu HRV está por encima de tu media semanal (+8%). Buen día para entrenar fuerte.",color:G.accent},{icon:"◎",text:"Estrés bajo todo el día. Mantén descansos activos por la tarde para seguir así.",color:G.blue},{icon:"◈",text:"Llevas 4 días consecutivos superando tu objetivo de pasos. ¡Sigue así!",color:G.purple}].map((r,i)=>(
          <div key={i} style={{display:"flex",gap:14,padding:"14px 0",borderBottom:i<2?`1px solid ${G.border}`:"none"}}>
            <span style={{color:r.color,fontSize:18,flexShrink:0,marginTop:1}}>{r.icon}</span>
            <span style={{fontSize:13,lineHeight:1.6}}>{r.text}</span>
          </div>
        ))}
      </div>}
      <SectionCustomizer allWidgets={W.all} activeWidgets={W.active} onToggle={W.toggle}/>
    </div>
  );
}

// ── DIET VIEW ─────────────────────────────────────────────────────────────────
function DietView() {
  const W = useWidgets("diet");
  const [meals,setMeals] = useState([{name:"Avena con frutas",cal:380,time:"08:15",cat:"Desayuno"},{name:"Pollo a la plancha + arroz",cal:520,time:"14:00",cat:"Comida"},{name:"Yogur griego + nueces",cal:210,time:"17:30",cat:"Merienda"}]);
  const [form,setForm] = useState({name:"",cal:"",cat:"Cena"});
  const [waterMl,setWaterMl] = useState(1600);
  const [waterInput,setWaterInput] = useState("");
  const total = meals.reduce((s,m)=>s+m.cal,0);
  const calGoal=2200, waterGoal=2500, burned=420;
  const addMeal = () => { if(form.name&&form.cal){setMeals([...meals,{...form,cal:Number(form.cal),time:new Date().toTimeString().slice(0,5)}]);setForm({name:"",cal:"",cat:"Cena"});} };
  const addWater = (ml) => setWaterMl(p=>Math.min(p+ml,waterGoal+500));

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      {/* Warm purple/gold food tones */}
      <SectionHero accentColor="#FFB347" bgColor="#2A1540">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
          <div>
            <div style={{fontSize:12,letterSpacing:"0.1em",textTransform:"uppercase",color:"#9060C0",fontWeight:600,marginBottom:6}}>Alimentación & Nutrición</div>
            <h2 style={{fontSize:26,fontWeight:800,margin:0}}>Nutrición & Dieta</h2>
          </div>
          <UtensilsCrossed size={34} color={G.amber} style={{opacity:0.85}}/>
        </div>
        {W.has("rings")&&<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8,padding:"8px 0"}}>
            <GradientRing value={total} max={calGoal} colorFrom={grad.amber[0]} colorTo={grad.amber[1]} size={94} label={total} sublabel={`/${calGoal}`} strokeWidth={9}/>
            <div style={{display:"flex",gap:4,alignItems:"center"}}><span style={{fontSize:11,color:"#A07040"}}>Cal. ingeridas</span><InfoTip topic="Calorías"/></div>
          </div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8,padding:"8px 0"}}>
            <GradientRing value={waterMl} max={waterGoal} colorFrom={grad.blue[0]} colorTo={grad.blue[1]} size={94} label={`${(waterMl/1000).toFixed(1)}L`} sublabel={`/${(waterGoal/1000).toFixed(1)}L`} strokeWidth={9}/>
            <div style={{display:"flex",gap:4,alignItems:"center"}}><span style={{fontSize:11,color:"#4060A0"}}>Agua</span><InfoTip topic="Agua"/></div>
          </div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8,padding:"8px 0"}}>
            <GradientRing value={burned} max={600} colorFrom={grad.coral[0]} colorTo={grad.coral[1]} size={94} label={burned} sublabel="/600" strokeWidth={9}/>
            <div style={{display:"flex",gap:4,alignItems:"center"}}><span style={{fontSize:11,color:"#A06040"}}>Kcal quemadas</span><InfoTip topic="Calorías"/></div>
          </div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8,padding:"8px 0"}}>
            <GradientRing value={Math.max(calGoal-total-burned,0)} max={calGoal} colorFrom={grad.accent[0]} colorTo={grad.accent[1]} size={94} label={Math.max(calGoal-total-burned,0)} sublabel="rest." strokeWidth={9}/>
            <span style={{fontSize:11,color:"#408060"}}>Balance kcal</span>
          </div>
        </div>}
        {/* Quick water */}
        <div style={{marginTop:18,paddingTop:14,borderTop:"1px solid #FFFFFF12"}}>
          <div style={{fontSize:11,letterSpacing:"0.1em",textTransform:"uppercase",color:"#6040A0",fontWeight:600,marginBottom:8}}>Añadir Agua</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {[150,250,500].map(ml=><button key={ml} onClick={()=>addWater(ml)} style={{background:G.blue+"20",border:`1px solid ${G.blue}35`,borderRadius:10,color:G.blue,fontFamily:font,fontWeight:700,fontSize:13,cursor:"pointer",padding:"7px 14px"}}>+{ml}ml</button>)}
            <input style={{...S.inp,fontSize:13,padding:"7px 12px",width:80,background:"#FFFFFF0C"}} placeholder="Otro" type="number" value={waterInput} onChange={e=>setWaterInput(e.target.value)}/>
            <button onClick={()=>{if(waterInput){addWater(Number(waterInput));setWaterInput("");}}} style={{...S.btn(G.blue),padding:"7px 14px",fontSize:13}}>+</button>
          </div>
        </div>
      </SectionHero>

      {W.has("macros")&&<div style={S.card}>
        <div style={{...S.lbl,marginBottom:16}}>Macronutrientes</div>
        {dietData.map(d=>(
          <div key={d.name} style={{marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
              <div style={{display:"flex",gap:5,alignItems:"center"}}><span style={{fontSize:13}}>{d.name}</span><InfoTip topic={d.topic}/></div>
              <span style={{fontFamily:mono,fontSize:13,color:d.color}}>{d.g}g / {d.max}g</span>
            </div>
            <Prog pct={(d.g/d.max)*100} color={d.color}/>
          </div>
        ))}
      </div>}

      {W.has("mealLog")&&<div style={S.card}>
        <div style={{...S.lbl,marginBottom:16}}>Registro de Comidas</div>
        {meals.map((m,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:i<meals.length-1?`1px solid ${G.border}`:"none"}}>
            <div><div style={{fontWeight:600,fontSize:14}}>{m.name}</div><div style={{fontSize:12,color:G.muted,marginTop:2}}>{m.cat} · {m.time}</div></div>
            <span style={{fontFamily:mono,fontSize:15,color:G.amber,fontWeight:700}}>{m.cal} kcal</span>
          </div>
        ))}
        <div style={{marginTop:20,padding:16,background:G.surface,borderRadius:14,display:"flex",gap:10,flexWrap:"wrap"}}>
          <input style={{...S.inp,flex:2}} placeholder="Nombre del alimento" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
          <input style={{...S.inp,flex:1,minWidth:80}} placeholder="kcal" type="number" value={form.cal} onChange={e=>setForm({...form,cal:e.target.value})}/>
          <select style={{...S.inp,flex:1,minWidth:100}} value={form.cat} onChange={e=>setForm({...form,cat:e.target.value})}>
            {["Desayuno","Almuerzo","Comida","Merienda","Cena"].map(c=><option key={c}>{c}</option>)}
          </select>
          <button style={S.btn(G.accent)} onClick={addMeal}>+ Añadir</button>
        </div>
      </div>}
      <SectionCustomizer allWidgets={W.all} activeWidgets={W.active} onToggle={W.toggle}/>
    </div>
  );
}

// ── SETTINGS VIEW ─────────────────────────────────────────────────────────────
function SettingsView({profile,setProfile,onNotif,notifTime,morningTime}) {
  const [connected,setConnected] = useState(false);
  const [user,setUser] = useState("");
  const [pass,setPass] = useState("");
  const [loading,setLoading] = useState(false);
  const [region,setRegion] = useState("EU");
  const [ep,setEp] = useState({...profile});
  const [saved,setSaved] = useState(false);
  const [calConnected,setCalConnected] = useState(false);
  const calEvents = [
    {title:"Carrera matutina",date:"Lun 10 mar · 07:00",color:G.accent},
    {title:"Ciclismo con Juan",date:"Mié 12 mar · 18:30",color:G.blue},
    {title:"Yoga — Recuperación",date:"Jue 13 mar · 07:00",color:G.purple},
    {title:"Revisión médica",date:"Vie 14 mar · 10:00",color:G.coral},
  ];
  const connect = () => { if(!user||!pass) return; setLoading(true); setTimeout(()=>{setLoading(false);setConnected(true);},1800); };
  const save = () => { setProfile({...ep}); setSaved(true); setTimeout(()=>setSaved(false),2500); };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      {/* Cool blue/slate settings */}
      <SectionHero accentColor="#4D9EFF" bgColor="#0A1A3A" minH={120}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:12,letterSpacing:"0.1em",textTransform:"uppercase",color:"#5070A0",fontWeight:600,marginBottom:6}}>Preferencias & Conexiones</div>
            <h2 style={{fontSize:26,fontWeight:800,margin:0}}>Ajustes</h2>
          </div>
          <Settings size={34} color={G.blue} style={{opacity:0.7}}/>
        </div>
      </SectionHero>

      <div style={S.card}>
        <div style={{...S.lbl,marginBottom:16}}>Datos Personales</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          {[{k:"name",label:"Nombre",type:"text",ph:"Tu nombre"},{k:"age",label:"Edad",type:"number",ph:"—"},{k:"weight",label:"Peso (kg)",type:"number",ph:"—"},{k:"height",label:"Altura (cm)",type:"number",ph:"—"}].map(f=>(
            <div key={f.k}><div style={{...S.lbl,marginBottom:8}}>{f.label}</div><input style={S.inp} type={f.type} placeholder={f.ph} value={ep[f.k]||""} onChange={e=>setEp({...ep,[f.k]:e.target.value})}/></div>
          ))}
          <div><div style={{...S.lbl,marginBottom:8}}>Sexo</div><select style={S.inp} value={ep.gender||""} onChange={e=>setEp({...ep,gender:e.target.value})}>{["","Hombre","Mujer","Otro"].map(o=><option key={o} value={o}>{o||"Seleccionar…"}</option>)}</select></div>
          <div><div style={{...S.lbl,marginBottom:8}}>Objetivo</div><select style={S.inp} value={ep.goal||""} onChange={e=>setEp({...ep,goal:e.target.value})}>{["","Perder peso","Ganar músculo","Mejorar resistencia","Mantener forma"].map(o=><option key={o} value={o}>{o||"Seleccionar…"}</option>)}</select></div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12,marginTop:16}}>
          <button style={S.btn(G.accent)} onClick={save}>Guardar perfil</button>
          {saved&&<span style={{fontSize:12,color:G.accent}}>✓ Guardado</span>}
        </div>
      </div>

      <div style={S.card}>
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16}}>
          <div style={{width:44,height:44,borderRadius:14,background:G.blue+"20",border:`2px solid ${G.blue}40`,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <CalendarDays size={22} color={G.blue}/>
          </div>
          <div>
            <div style={{fontWeight:700,fontSize:15}}>Calendario del iPhone</div>
            <div style={{fontSize:12,color:G.muted,marginTop:2}}>Abre el evento directamente en tu app Calendario</div>
          </div>
        </div>
        <div style={{background:G.dim,borderRadius:12,padding:14,marginBottom:14}}>
          <div style={{fontSize:12,color:G.amber,fontWeight:700,marginBottom:6}}>⚠ Limitación técnica</div>
          <p style={{fontSize:12,color:G.muted,lineHeight:1.7}}>Las apps web (PWA) no pueden leer ni escribir directamente en el Calendario del iPhone por restricciones de seguridad de Apple. Solo es posible desde una app nativa.</p>
        </div>
        <div style={{...S.lbl,marginBottom:10}}>Lo que sí puedes hacer:</div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          <button style={S.btn(G.blue)} onClick={()=>{
            const date = new Date(); date.setDate(date.getDate()+1); date.setHours(7,30,0);
            const end  = new Date(date); end.setMinutes(end.getMinutes()+45);
            const fmt  = d=>d.toISOString().replace(/[-:]/g,"").split(".")[0]+"Z";
            const ics  = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART:${fmt(date)}\nDTEND:${fmt(end)}\nSUMMARY:Entrenamiento VitaSync\nDESCRIPTION:Sesión programada desde VitaSync\nEND:VEVENT\nEND:VCALENDAR`;
            const blob = new Blob([ics],{type:"text/calendar"});
            const url  = URL.createObjectURL(blob);
            const a    = document.createElement("a"); a.href=url; a.download="entrenamiento.ics"; a.click();
          }}>📅 Exportar evento .ics al Calendario</button>
          <button style={{...S.btn(G.dim),color:G.text,fontSize:13}} onClick={()=>window.open("calshow://","_blank")}>
            📱 Abrir app Calendario
          </button>
        </div>
      </div>

      <div style={S.card}>
        <div style={{...S.lbl,marginBottom:6}}>Notificaciones iPhone</div>
        <div style={{display:"flex",gap:12,marginBottom:16}}>
          <span style={{fontSize:12,color:G.muted}}>🌙 Noche: <span style={{color:G.accent,fontWeight:700}}>{notifTime}</span></span>
          <span style={{fontSize:12,color:G.muted}}>☀️ Mañana: <span style={{color:G.amber,fontWeight:700}}>{morningTime}</span></span>
        </div>
        <button style={S.btn(G.blue)} onClick={onNotif}>📱 Configurar notificaciones</button>
      </div>

      <div style={S.card}>
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16}}>
          <div style={{width:48,height:48,borderRadius:14,background:G.dim,border:`2px solid ${G.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>⌚</div>
          <div>
            <div style={{fontWeight:700,fontSize:16}}>Amazfit BIP 6 + Zepp</div>
            <div style={{fontSize:12,color:G.muted,marginTop:2}}>Importa tus datos desde la app Zepp</div>
          </div>
        </div>
        <div style={{background:G.dim,borderRadius:12,padding:14,marginBottom:14}}>
          <div style={{fontSize:12,color:G.amber,fontWeight:700,marginBottom:6}}>⚠ Sin API pública oficial</div>
          <p style={{fontSize:12,color:G.muted,lineHeight:1.7}}>Zepp/Amazfit no ofrece una API pública para conectar apps de terceros. No es posible acceder a tus datos con usuario y contraseña desde aquí sin violar sus términos de uso.</p>
        </div>
        <div style={{...S.lbl,marginBottom:10}}>Cómo importar tus datos reales:</div>
        <div style={{fontSize:12,color:G.muted,lineHeight:1.9,marginBottom:14}}>
          1. Abre la app <strong style={{color:G.text}}>Zepp</strong> en tu iPhone<br/>
          2. Ve a <strong style={{color:G.text}}>Perfil → Exportar datos</strong><br/>
          3. Descarga el archivo CSV o JSON<br/>
          4. Impórtalo aquí con el botón de abajo
        </div>
        <label style={{...S.btn(G.accent),display:"block",textAlign:"center",cursor:"pointer"}}>
          📂 Importar CSV de Zepp
          <input type="file" accept=".csv,.json,.zip" style={{display:"none"}} onChange={e=>{
            const f=e.target.files[0]; if(!f) return;
            alert(`Archivo recibido: ${f.name}\n\nEn la siguiente versión procesaremos los datos reales de Zepp.`);
          }}/>
        </label>
        <button style={{...S.btn(G.dim),color:G.text,fontSize:12,marginTop:8,width:"100%"}} onClick={()=>window.open("zepp://","_blank")}>
          Abrir app Zepp
        </button>
      </div>
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
const navItems = [
  {id:"dashboard",Icon:LayoutDashboard,label:"Inicio",   color:null   },
  {id:"heart",    Icon:Heart,          label:"Corazón",  color:G.red  },
  {id:"sleep",    Icon:Moon,           label:"Sueño",    color:G.blue },
  {id:"activity", Icon:Activity,       label:"Actividad",color:G.amber},
  {id:"wellness", Icon:Leaf,           label:"Bienestar",color:G.green},
  {id:"diet",     Icon:UtensilsCrossed,label:"Dieta",    color:G.amber},
  {id:"settings", Icon:Settings,       label:"Ajustes",  color:null   },
];

const RealDataCtx = createContext(null);
export const useRealData = () => useContext(RealDataCtx);

export default function HealthApp() {
  const [view,setView] = useState("dashboard");
  const [weekMetric,setWeekMetric] = useState("pasos");
  const [profile,setProfile] = useState({name:"Pablo",age:"",weight:"",height:"",gender:"",goal:""});
  const [showNotif,setShowNotif] = useState(false);
  const [notifTime,setNotifTime] = useState("21:00");
  const [morningTime,setMorningTime] = useState("07:30");
  const [mobile,setMobile] = useState(isMobile());
  const [realData,setRealData] = useState(null);
  const [dataStatus,setDataStatus] = useState("loading"); // loading | ok | error

  useEffect(()=>{
    const fn = ()=>setMobile(window.innerWidth<768);
    window.addEventListener("resize",fn);
    return ()=>window.removeEventListener("resize",fn);
  },[]);

  // Fetch datos reales del reloj
  useEffect(()=>{
    const load = async ()=>{
      try {
        const res = await fetch("/api/health");
        if(!res.ok) throw new Error("no data");
        const d = await res.json();
        setRealData(d);
        setDataStatus("ok");
      } catch {
        setDataStatus("error");
      }
    };
    load();
    const t = setInterval(load, 5*60*1000); // refresca cada 5 min
    return ()=>clearInterval(t);
  },[]);

  const views = {
    dashboard:<Dashboard weekMetric={weekMetric} setWeekMetric={setWeekMetric} profile={profile} onNavigate={setView}/>,
    heart:    <HeartView/>,
    sleep:    <SleepView/>,
    activity: <ActivityView/>,
    wellness: <WellnessView/>,
    diet:     <DietView/>,
    settings: <SettingsView profile={profile} setProfile={setProfile} onNotif={()=>setShowNotif(true)} notifTime={notifTime} morningTime={morningTime}/>,
  };

  // Indicador de datos en vivo
  const LiveDot = ()=>(
    <div style={{position:"fixed",top:12,right:16,zIndex:200,display:"flex",alignItems:"center",gap:5,background:G.card,border:`1px solid ${G.border}`,borderRadius:20,padding:"4px 10px",fontSize:10,color:dataStatus==="ok"?G.accent:dataStatus==="loading"?G.amber:G.muted}}>
      <span style={{width:6,height:6,borderRadius:"50%",background:dataStatus==="ok"?G.accent:dataStatus==="loading"?G.amber:G.muted,display:"inline-block",animation:dataStatus==="loading"?"pulse 1.5s infinite":"none"}}/>
      {dataStatus==="ok"?"⌚ En vivo":dataStatus==="loading"?"Conectando…":"Sin datos del reloj"}
    </div>
  );

  return (
    <RealDataCtx.Provider value={realData}>
    <div style={S.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=DM+Mono:wght@400;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;scrollbar-width:thin;scrollbar-color:${G.dim} transparent;}
        html,body{background:${G.bg};height:100%;overflow:hidden;}
        input,select{transition:border 0.2s;color-scheme:dark;}
        input:focus,select:focus{border-color:${G.accent}60 !important;}
        button:hover{opacity:0.85;transform:scale(0.98);transition:all 0.15s;}
        @keyframes pulse{0%,100%{opacity:0.3;transform:scale(0.8)}50%{opacity:1;transform:scale(1.1)}}
      `}</style>

      {/* SIDEBAR — solo en escritorio */}
      {!mobile&&<nav style={S.sidebar}>
        <div style={{color:G.accent,marginBottom:20,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <Heart size={20} fill={G.accent} color={G.accent}/>
        </div>
        {navItems.map(n=>{
          const active = view===n.id;
          return (
            <div key={n.id} title={n.label} onClick={()=>setView(n.id)}
              style={{...S.navBtn(active,n.color),flexDirection:"column",gap:2}}>
              <n.Icon size={18} strokeWidth={active?2.5:1.8}/>
            </div>
          );
        })}
      </nav>}

      {/* MAIN CONTENT */}
      <main style={mobile?S.mainMobile:S.main}>{views[view]}</main>

      {/* BOTTOM NAV — solo en móvil */}
      {mobile&&<nav style={S.bottomNav}>
        {navItems.map(n=>{
          const active = view===n.id;
          const col = n.color||(active?G.accent:G.muted);
          return (
            <div key={n.id} onClick={()=>setView(n.id)}
              style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"6px 10px",borderRadius:12,background:active?(n.color||G.accent)+"18":"transparent",cursor:"pointer"}}>
              <n.Icon size={20} strokeWidth={active?2.5:1.8} color={active?col:G.muted}/>
              <span style={{fontSize:9,color:active?col:G.muted,fontWeight:active?700:400,letterSpacing:"0.04em"}}>{n.label}</span>
            </div>
          );
        })}
      </nav>}

      <LiveDot/>
      <AIAssistant/>
      {showNotif&&<NotifModal onClose={()=>setShowNotif(false)} notifTime={notifTime} setNotifTime={setNotifTime} morningTime={morningTime} setMorningTime={setMorningTime}/>}
    </div>
    </RealDataCtx.Provider>
  );
}
