import { useState, useEffect } from "react";
import {
  Heart,
  Moon,
  Activity as ActivityIcon,
  Leaf,
  UtensilsCrossed,
  Settings,
  LayoutDashboard,
} from "lucide-react";

const G = {
  bg: "#07070F",
  surface: "#0F0F1A",
  card: "#141426",
  border: "#1E1E35",
  accent: "#00E5A0",
  blue: "#4D9EFF",
  purple: "#9B7FFF",
  coral: "#FF6B6B",
  amber: "#FFB347",
  text: "#E8E8FF",
  muted: "#5A5A7A",
  dim: "#2A2A45",
  red: "#FF3B30",
  green: "#30D158",
  garnet: "#C0395A",
};

const font = `'Outfit','Segoe UI',sans-serif`;
const mono = `'DM Mono','Courier New',monospace`;

const isMobile = () =>
  typeof window !== "undefined" && window.innerWidth < 768;

const S = {
  app: {
    background: G.bg,
    minHeight: "100vh",
    display: "flex",
    fontFamily: font,
    color: G.text,
  },
  sidebar: {
    width: 72,
    background: G.surface,
    borderRight: `1px solid ${G.border}`,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px 0",
    gap: 6,
    position: "fixed",
    top: 0,
    left: 0,
    height: "100vh",
    zIndex: 100,
  },
  bottomNav: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    background: G.surface,
    borderTop: `1px solid ${G.border}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    zIndex: 100,
    paddingBottom: "env(safe-area-inset-bottom)",
  },
  main: {
    marginLeft: 72,
    flex: 1,
    padding: "28px 32px",
    maxWidth: 1120,
    overflowY: "auto",
    overflowX: "hidden",
    height: "100vh",
  },
  mainMobile: {
    marginLeft: 0,
    flex: 1,
    padding: "16px 16px 80px 16px",
    overflowY: "auto",
    overflowX: "hidden",
    height: "100vh",
    WebkitOverflowScrolling: "touch",
  },
  card: {
    background: G.card,
    border: `1px solid ${G.border}`,
    borderRadius: 20,
    padding: 20,
  },
  lbl: {
    fontSize: 11,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: G.muted,
    fontWeight: 600,
  },
  inp: {
    background: G.dim,
    border: `1px solid ${G.border}`,
    borderRadius: 12,
    padding: "10px 16px",
    color: G.text,
    fontFamily: font,
    fontSize: 14,
    outline: "none",
    width: "100%",
  },
  btn: (c = G.accent) => ({
    background: c,
    color: "#000",
    border: "none",
    borderRadius: 12,
    padding: "10px 18px",
    fontFamily: font,
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    letterSpacing: "0.02em",
  }),
  navBtn: (active, color) => ({
    width: 44,
    height: 44,
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: active ? (color || G.accent) + "22" : "transparent",
    border: active
      ? `1px solid ${(color || G.accent)}50`
      : "1px solid transparent",
    cursor: "pointer",
    transition: "all 0.2s",
    color: color ? color : active ? G.accent : G.muted,
  }),
};

function GradientRing({ value, max, colorFrom, colorTo, size = 80, label, sublabel }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100 || 0));
  const r = (size - 12) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;

  return (
    <svg width={size} height={size} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`grad-${colorFrom}-${colorTo}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colorFrom} />
          <stop offset="100%" stopColor={colorTo} />
        </linearGradient>
      </defs>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={G.dim}
        strokeWidth={8}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={`url(#grad-${colorFrom}-${colorTo})`}
        strokeWidth={8}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fill: G.text, fontFamily: mono, fontSize: 16 }}
      >
        {label}
      </text>
      {sublabel && (
        <text
          x="50%"
          y="62%"
          textAnchor="middle"
          style={{ fill: G.muted, fontFamily: font, fontSize: 11 }}
        >
          {sublabel}
        </text>
      )}
    </svg>
  );
}

function Prog({ pct, color }) {
  const clamp = Math.max(0, Math.min(100, pct || 0));
  return (
    <div
      style={{
        width: "100%",
        height: 6,
        borderRadius: 999,
        background: G.dim,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${clamp}%`,
          height: "100%",
          borderRadius: 999,
          background: color,
          transition: "width 0.3s ease",
        }}
      />
    </div>
  );
}

function useRealData() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/health");
        if (!res.ok) throw new Error("HTTP " + res.status);
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch (e) {
        console.error("Error cargando /api/health", e);
      }
    }
    load();
    const id = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return data;
}

function useProfile() {
  const [profile, setProfile] = useState(() => {
    if (typeof window === "undefined") return {};
    try {
      const raw = localStorage.getItem("vitasync-profile");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("vitasync-profile", JSON.stringify(profile));
  }, [profile]);

  return [profile, setProfile];
}

function useGoals() {
  const [goals, setGoals] = useState(() => {
    if (typeof window === "undefined") return {};
    try {
      const raw = localStorage.getItem("vitasync-goals");
      return raw
        ? JSON.parse(raw)
        : {
            steps: 8000,
            caloriesActive: 500,
            sleepHours: 7.5,
            standsHours: 10,
          };
    } catch {
      return {
        steps: 8000,
        caloriesActive: 500,
        sleepHours: 7.5,
        standsHours: 10,
      };
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("vitasync-goals", JSON.stringify(goals));
  }, [goals]);

  return [goals, setGoals];
}

function SectionHeader({ icon, title, subtitle, color }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: 999,
            background: color + "22",
            border: `1px solid ${color}55`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color,
          }}
        >
          {icon}
        </div>
        <h2
          style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </h2>
      </div>
      {subtitle && (
        <div style={{ fontSize: 13, color: G.muted }}>{subtitle}</div>
      )}
    </div>
  );
}

function CardKpi({ label, value, unit, color }) {
  const text =
    value || value === 0 ? `${value} ${unit || ""}`.trim() : "Sin datos";
  return (
    <div
      style={{
        background: G.card,
        borderRadius: 18,
        padding: 14,
        border: `1px solid ${G.border}`,
      }}
    >
      <div style={{ ...S.lbl, marginBottom: 6 }}>{label}</div>
      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          fontFamily: mono,
          color,
        }}
      >
        {text}
      </div>
    </div>
  );
}

/* DASHBOARD */

function Dashboard({ profile, goals, onNavigate, mobile }) {
  const rd = useRealData();
  const name = profile.name || "Usuario";

  const steps = rd?.activity?.steps ?? 0;
  const cals = rd?.activity?.caloriesActive ?? 0;
  const stands = rd?.activity?.standsHours ?? 0;

  const sleepMinutes = rd?.sleep?.lastNight?.durationMinutes ?? null;
  const sleepHours = sleepMinutes ? sleepMinutes / 60 : null;
  const sleepScore = rd?.sleep?.lastNight?.score ?? null;

  const hrRate = rd?.heart?.rate ?? 0;
  const spo2 = rd?.heart?.spo2 ?? 0;

  const readiness = rd?.readiness?.score ?? 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <div style={{ fontSize: 13, color: G.muted, marginBottom: 4 }}>
          {new Date().toLocaleDateString("es-ES", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            margin: 0,
          }}
        >
          Buenos días, {name} ✦
        </h1>
      </div>

      <div style={S.card}>
        <div style={{ ...S.lbl, marginBottom: 16 }}>Estado general de hoy</div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: mobile ? "repeat(2,1fr)" : "repeat(4,1fr)",
            gap: 10,
          }}
        >
          <DashboardRing
            label="Disponibilidad"
            value={readiness}
            max={100}
            unit="%"
            colorFrom={G.accent}
            colorTo={G.green}
            onClick={() => onNavigate("wellness")}
          />
          <DashboardRing
            label="Pasos"
            value={steps}
            max={goals.steps || 8000}
            format="steps"
            colorFrom={G.green}
            colorTo={G.accent}
            onClick={() => onNavigate("activity")}
          />
          <DashboardRing
            label="Sueño"
            value={sleepHours || goals.sleepHours || 7.5}
            max={goals.sleepHours || 7.5}
            format="hours"
            colorFrom={G.blue}
            colorTo={G.purple}
            onClick={() => onNavigate("sleep")}
          />
          <DashboardRing
            label="Pulso ahora"
            value={hrRate}
            max={180}
            unit="bpm"
            colorFrom={G.coral}
            colorTo={G.red}
            onClick={() => onNavigate("heart")}
          />
        </div>
      </div>

      <div style={S.card}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <span style={S.lbl}>Progreso de objetivos</span>
          <span
            style={{
              background: G.accent + "20",
              color: G.accent,
              borderRadius: 8,
              padding: "3px 10px",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.08em",
            }}
          >
            HOY
          </span>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
          }}
        >
          <GoalRow
            label="Pasos"
            value={steps}
            max={goals.steps || 8000}
            unit="pasos"
            color={G.accent}
            onClick={() => onNavigate("activity")}
          />
          <GoalRow
            label="Calorías activas"
            value={cals}
            max={goals.caloriesActive || 500}
            unit="kcal"
            color={G.amber}
            onClick={() => onNavigate("activity")}
          />
          <GoalRow
            label="Horas de pie"
            value={stands}
            max={goals.standsHours || 10}
            unit="h"
            color={G.green}
            onClick={() => onNavigate("activity")}
          />
          <GoalRow
            label="SpO₂"
            value={spo2}
            max={100}
            unit="%"
            color={G.garnet}
            onClick={() => onNavigate("heart")}
          />
        </div>
      </div>

      <div style={S.card}>
        <div style={{ ...S.lbl, marginBottom: 12 }}>Resumen rápido</div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: mobile ? "1fr" : "repeat(3,1fr)",
            gap: 10,
          }}
        >
          <MiniStat
            title="Pulso actual"
            value={hrRate ? `${hrRate} bpm` : "Sin datos"}
            detail="Lectura en tiempo casi real del reloj."
          />
          <MiniStat
            title="Actividad"
            value={`${steps} pasos`}
            detail={`${cals} kcal activas · ${stands} h de pie`}
          />
          <MiniStat
            title="Sueño anoche"
            value={
              sleepHours ? `${sleepHours.toFixed(1)} h` : "Sin datos de sueño"
            }
            detail={
              sleepScore
                ? `Puntuación ${sleepScore}/100`
                : "Añade datos de sueño en el bridge cuando puedas"
            }
          />
        </div>
      </div>
    </div>
  );
}

function DashboardRing({
  label,
  value,
  max,
  unit,
  format,
  colorFrom,
  colorTo,
  onClick,
}) {
  let displayLabel = "";
  if (format === "steps") {
    displayLabel = value >= 1000 ? `${(value / 1000).toFixed(1)}K` : `${value}`;
  } else if (format === "hours") {
    displayLabel = `${value.toFixed ? value.toFixed(1) : value}`;
  } else if (unit === "%") {
    displayLabel = `${Math.round(value)}`;
  } else {
    displayLabel = `${value}`;
  }

  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        cursor: "pointer",
      }}
    >
      <GradientRing
        value={value}
        max={max}
        colorFrom={colorFrom}
        colorTo={colorTo}
        label={displayLabel}
        sublabel={unit}
        size={86}
      />
      <div style={{ fontSize: 11, color: G.muted }}>{label}</div>
    </div>
  );
}

function GoalRow({ label, value, max, unit, color, onClick }) {
  const pct = max ? (value / max) * 100 : 0;
  const main =
    value >= 1000 && unit === "pasos"
      ? `${(value / 1000).toFixed(1)}K`
      : `${value}`;
  return (
    <div onClick={onClick} style={{ cursor: "pointer" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 4,
        }}
      >
        <span style={{ fontSize: 12 }}>{label}</span>
        <span style={{ fontSize: 12, fontFamily: mono, color }}>
          {main}
          <span style={{ color: G.muted, marginLeft: 4 }}>
            / {max} {unit}
          </span>
        </span>
      </div>
      <Prog pct={pct} color={color} />
    </div>
  );
}

function MiniStat({ title, value, detail }) {
  return (
    <div
      style={{
        background: G.surface,
        borderRadius: 16,
        padding: 14,
        border: `1px solid ${G.border}`,
      }}
    >
      <div style={{ ...S.lbl, marginBottom: 8 }}>{title}</div>
      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          marginBottom: 4,
          fontFamily: mono,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 12, color: G.muted }}>{detail}</div>
    </div>
  );
}

/* CORAZÓN */

function HeartView() {
  const rd = useRealData();
  const hrRate = rd?.heart?.rate ?? 0;
  const hrRest = rd?.heart?.resting ?? null;
  const hrMax = rd?.heart?.max ?? null;
  const spo2 = rd?.heart?.spo2 ?? 0;
  const hrv = rd?.heart?.hrv?.rmssd ?? null;
  const stress = rd?.heart?.stress?.score ?? null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <SectionHeader
        icon={<Heart size={18} />}
        title="Corazón"
        subtitle="Pulso, reposo, HRV y oxígeno en sangre"
        color={G.red}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 10,
        }}
      >
        <CardKpi label="FC actual" value={hrRate} unit="bpm" color={G.coral} />
        <CardKpi
          label="Reposo"
          value={hrRest ?? "–"}
          unit={hrRest ? "bpm" : ""}
          color={G.green}
        />
        <CardKpi
          label="Máxima"
          value={hrMax ?? "–"}
          unit={hrMax ? "bpm" : ""}
          color={G.amber}
        />
        <CardKpi label="SpO₂" value={spo2 ?? "–"} unit="%" color={G.garnet} />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 10,
        }}
      >
        <CardKpi
          label="HRV (RMSSD)"
          value={hrv ?? "–"}
          unit={hrv ? "ms" : ""}
          color={G.purple}
        />
        <CardKpi
          label="Estrés cardiaco"
          value={stress ?? "–"}
          unit={stress ? "/ 100" : ""}
          color={G.amber}
        />
      </div>

      <div style={S.card}>
        <div style={S.lbl}>Notas</div>
        <p style={{ fontSize: 13, marginTop: 10, color: G.muted }}>
          Aquí se resumen las métricas que llegan desde Zepp/Home Assistant.
          Si algún valor aparece vacío, es que el bridge aún no lo está
          enviando en el JSON de /api/health.
        </p>
      </div>
    </div>
  );
}

/* SUEÑO */

function SleepView() {
  const rd = useRealData();
  const ln = rd?.sleep?.lastNight || null;
  const durationMinutes = ln?.durationMinutes ?? null;
  const durationHours = durationMinutes ? durationMinutes / 60 : null;
  const score = ln?.score ?? null;
  const awakenings = ln?.awakenings ?? null;
  const deep = ln?.deepMinutes ?? null;
  const light = ln?.lightMinutes ?? null;
  const rem = ln?.remMinutes ?? null;
  const asleep = ln?.start ?? null;
  const wake = ln?.end ?? null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <SectionHeader
        icon={<Moon size={18} />}
        title="Sueño"
        subtitle="Resumen de la última noche"
        color={G.blue}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 10,
        }}
      >
        <CardKpi
          label="Duración"
          value={durationHours ? durationHours.toFixed(1) : "–"}
          unit={durationHours ? "h" : ""}
          color={G.blue}
        />
        <CardKpi
          label="Puntuación"
          value={score ?? "–"}
          unit={score ? "/ 100" : ""}
          color={G.accent}
        />
        <CardKpi
          label="Despertares"
          value={awakenings ?? "–"}
          unit={awakenings != null ? "veces" : ""}
          color={G.coral}
        />
      </div>

      <div style={S.card}>
        <div style={S.lbl}>Fases</div>
        <p style={{ fontSize: 13, marginTop: 8, color: G.muted }}>
          Profundo:{" "}
          <span style={{ color: G.text }}>
            {deep != null ? `${Math.round(deep / 60)} h` : "sin datos"}
          </span>{" "}
          · Ligero:{" "}
          <span style={{ color: G.text }}>
            {light != null ? `${Math.round(light / 60)} h` : "sin datos"}
          </span>{" "}
          · REM:{" "}
          <span style={{ color: G.text }}>
            {rem != null ? `${Math.round(rem / 60)} h` : "sin datos"}
          </span>
        </p>
        <p style={{ fontSize: 13, marginTop: 4, color: G.muted }}>
          Hora dormir:{" "}
          <span style={{ color: G.text }}>
            {asleep
              ? new Date(asleep).toLocaleTimeString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "sin datos"}
          </span>{" "}
          · Despertar:{" "}
          <span style={{ color: G.text }}>
            {wake
              ? new Date(wake).toLocaleTimeString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "sin datos"}
          </span>
        </p>
      </div>
    </div>
  );
}

/* ACTIVIDAD */

function ActivityView() {
  const rd = useRealData();
  const a = rd?.activity || null;
  const steps = a?.steps ?? 0;
  const cals = a?.caloriesActive ?? 0;
  const dist = a?.distanceMeters ?? 0;
  const stands = a?.standsHours ?? 0;
  const workouts = a?.workoutCount ?? 0;
  const last = a?.lastWorkout || null;
  const load = a?.trainingLoad?.today ?? null;
  const pai = a?.pai?.today ?? null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <SectionHeader
        icon={<ActivityIcon size={18} />}
        title="Actividad"
        subtitle="Movimiento diario y carga"
        color={G.accent}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 10,
        }}
      >
        <CardKpi label="Pasos" value={steps} unit="pasos" color={G.accent} />
        <CardKpi label="Calorías" value={cals} unit="kcal" color={G.amber} />
        <CardKpi
          label="Distancia"
          value={dist ? (dist / 1000).toFixed(2) : 0}
          unit="km"
          color={G.blue}
        />
        <CardKpi label="Horas de pie" value={stands} unit="h" color={G.green} />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 10,
        }}
      >
        <CardKpi
          label="Entrenamientos"
          value={workouts}
          unit="sesiones"
          color={G.accent}
        />
        <CardKpi
          label="Carga hoy"
          value={load ?? "–"}
          unit={load != null ? "UA" : ""}
          color={G.coral}
        />
        <CardKpi
          label="PAI hoy"
          value={pai ?? "–"}
          unit={pai != null ? "" : ""}
          color={G.purple}
        />
      </div>

      <div style={S.card}>
        <div style={S.lbl}>Último entrenamiento</div>
        {last ? (
          <p style={{ fontSize: 13, marginTop: 10, color: G.muted }}>
            {last.name || "Entrenamiento"} ·{" "}
            <span style={{ color: G.text }}>
              {last.durationMinutes
                ? `${last.durationMinutes} min`
                : "duración desconocida"}
            </span>{" "}
            ·{" "}
            <span style={{ color: G.text }}>
              {last.calories ? `${last.calories} kcal` : "sin calorías"}
            </span>
          </p>
        ) : (
          <p style={{ fontSize: 13, marginTop: 10, color: G.muted }}>
            No hay entrenamientos registrados todavía en el JSON de actividad.
            Cuando el bridge los envíe, aparecerán aquí automáticamente.
          </p>
        )}
      </div>
    </div>
  );
}

/* BIENESTAR */

function WellnessView() {
  const rd = useRealData();
  const readiness = rd?.readiness?.score ?? null;
  const stress = rd?.wellness?.stress?.score ?? null;
  const effort = rd?.wellness?.effort?.score ?? null;
  const bodyBattery = rd?.wellness?.bodyBattery?.value ?? null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <SectionHeader
        icon={<Leaf size={18} />}
        title="Bienestar"
        subtitle="Estrés, energía y recuperación"
        color={G.green}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 10,
        }}
      >
        <CardKpi
          label="Disponibilidad"
          value={readiness ?? "–"}
          unit={readiness != null ? "/ 100" : ""}
          color={G.accent}
        />
        <CardKpi
          label="Estrés"
          value={stress ?? "–"}
          unit={stress != null ? "/ 100" : ""}
          color={G.amber}
        />
        <CardKpi
          label="Esfuerzo"
          value={effort ?? "–"}
          unit={effort != null ? "/ 10" : ""}
          color={G.coral}
        />
        <CardKpi
          label="Batería corporal"
          value={bodyBattery ?? "–"}
          unit={bodyBattery != null ? "%" : ""}
          color={G.green}
        />
      </div>

      <div style={S.card}>
        <div style={S.lbl}>Notas</div>
        <p style={{ fontSize: 13, marginTop: 10, color: G.muted }}>
          Este panel usa directamente los campos readiness y wellness del JSON.
          No hay gráficas históricas: se centra en cómo estás hoy.
        </p>
      </div>
    </div>
  );
}

/* DIETA */

function DietView() {
  const rd = useRealData();
  const n = rd?.nutrition || null;
  const goal = n?.goalCalories ?? null;
  const intake = n?.intakeCalories ?? null;
  const remaining =
    n?.remainingCalories ??
    (goal != null && intake != null ? goal - intake : null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <SectionHeader
        icon={<UtensilsCrossed size={18} />}
        title="Dieta"
        subtitle="Resumen básico y registros manuales"
        color={G.purple}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 10,
        }}
      >
        <CardKpi
          label="Objetivo"
          value={goal ?? "–"}
          unit={goal != null ? "kcal" : ""}
          color={G.blue}
        />
        <CardKpi
          label="Ingerido"
          value={intake ?? "–"}
          unit={intake != null ? "kcal" : ""}
          color={G.coral}
        />
        <CardKpi
          label="Restante"
          value={remaining ?? "–"}
          unit={remaining != null ? "kcal" : ""}
          color={G.accent}
        />
      </div>

      <div style={S.card}>
        <div style={{ ...S.lbl, marginBottom: 10 }}>Añadir registro rápido</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <input
            style={S.inp}
            placeholder="Descripción (ej. Desayuno, 2 tostadas con aceite)"
          />
          <input style={S.inp} placeholder="Calorías estimadas (kcal)" />
          <div style={{ display: "flex", gap: 8 }}>
            <button style={S.btn(G.accent)}>Guardar comida</button>
            <button style={S.btn(G.green)}>Añadir vaso de agua</button>
          </div>
          <p style={{ fontSize: 11, color: G.muted, marginTop: 6 }}>
            Más adelante se puede conectar esto a almacenamiento local o una
            base de datos para llevar histórico de comidas.
          </p>
        </div>
      </div>
    </div>
  );
}

/* LAYOUT PRINCIPAL */

function App() {
  const [tab, setTab] = useState("dashboard");
  const [profile, setProfile] = useProfile();
  const [goals] = useGoals();
  const mobile = isMobile();

  const Main = () => {
    if (tab === "heart") return <HeartView />;
    if (tab === "sleep") return <SleepView />;
    if (tab === "activity") return <ActivityView />;
    if (tab === "wellness") return <WellnessView />;
    if (tab === "diet") return <DietView />;
    return (
      <Dashboard
        profile={profile}
        goals={goals}
        onNavigate={setTab}
        mobile={mobile}
      />
    );
  };

  return (
    <div style={S.app}>
      {!mobile && (
        <div style={S.sidebar}>
          <div style={{ marginBottom: 16, fontSize: 18 }}>VS</div>
          <button
            style={S.navBtn(tab === "dashboard")}
            onClick={() => setTab("dashboard")}
          >
            <LayoutDashboard size={18} />
          </button>
          <button
            style={S.navBtn(tab === "heart", G.red)}
            onClick={() => setTab("heart")}
          >
            <Heart size={18} />
          </button>
          <button
            style={S.navBtn(tab === "sleep", G.blue)}
            onClick={() => setTab("sleep")}
          >
            <Moon size={18} />
          </button>
          <button
            style={S.navBtn(tab === "activity", G.accent)}
            onClick={() => setTab("activity")}
          >
            <ActivityIcon size={18} />
          </button>
          <button
            style={S.navBtn(tab === "wellness", G.green)}
            onClick={() => setTab("wellness")}
          >
            <Leaf size={18} />
          </button>
          <button
            style={S.navBtn(tab === "diet", G.purple)}
            onClick={() => setTab("diet")}
          >
            <UtensilsCrossed size={18} />
          </button>
          <div style={{ flex: 1 }} />
          <button style={S.navBtn(false, G.muted)}>
            <Settings size={18} />
          </button>
        </div>
      )}

      <main style={mobile ? S.mainMobile : S.main}>
        <Main />
      </main>

      {mobile && (
        <div style={S.bottomNav}>
          <button
            style={S.navBtn(tab === "dashboard")}
            onClick={() => setTab("dashboard")}
          >
            <LayoutDashboard size={20} />
          </button>
          <button
            style={S.navBtn(tab === "heart", G.red)}
            onClick={() => setTab("heart")}
          >
            <Heart size={20} />
          </button>
          <button
            style={S.navBtn(tab === "sleep", G.blue)}
            onClick={() => setTab("sleep")}
          >
            <Moon size={20} />
          </button>
          <button
            style={S.navBtn(tab === "activity", G.accent)}
            onClick={() => setTab("activity")}
          >
            <ActivityIcon size={20} />
          </button>
          <button
            style={S.navBtn(tab === "wellness", G.green)}
            onClick={() => setTab("wellness")}
          >
            <Leaf size={20} />
          </button>
          <button
            style={S.navBtn(tab === "diet", G.purple)}
            onClick={() => setTab("diet")}
          >
            <UtensilsCrossed size={20} />
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
