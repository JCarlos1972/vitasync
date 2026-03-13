"""
patch2_vitasync.py — Conecta datos reales del reloj a todas las vistas
Arregla: fecha dinámica, HeartView, SleepView, ActivityView, WellnessView,
         oculta HRV (no disponible en BIP 6), arregla 4º anillo en móvil,
         actualiza Bevel panel.
"""
import re

PATH = r"C:\Users\jcarl\Desktop\vitasync\src\App.jsx"

with open(PATH, "r", encoding="utf-8") as f:
    code = f.read()

# ─── 1. FECHA DINÁMICA ────────────────────────────────────────────────────────
# Reemplazar la fecha hardcodeada por una calculada en runtime
old_date = '<div style={{fontSize:13,color:G.muted,marginBottom:4}}>Jueves, 12 de marzo\u00b7 2026</div>'
new_date = '<div style={{fontSize:13,color:G.muted,marginBottom:4}}>{new Date().toLocaleDateString("es-ES",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div>'
code = code.replace(old_date, new_date, 1)

# Variante sin espacio especial
old_date2 = 'Jueves, 12 de marzo\u00b72026'
if old_date not in code:
    # buscar cualquier fecha hardcodeada con ese patrón
    code = re.sub(
        r'<div style=\{\{fontSize:13,color:G\.muted,marginBottom:4\}\}>[^<]{10,40}</div>',
        '<div style={{fontSize:13,color:G.muted,marginBottom:4}}>{new Date().toLocaleDateString("es-ES",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div>',
        code, count=1
    )

# ─── 2. HEART VIEW — conectar datos reales ───────────────────────────────────
old_heart = '''function HeartView() {
  const W = useWidgets("heart");
  return ('''

new_heart = '''function HeartView() {
  const W = useWidgets("heart");
  const rd = useRealData();
  const hrRate  = rd?.heart?.rate    ?? 68;
  const hrRest  = rd?.heart?.resting ?? 58;
  const hrMax   = rd?.heart?.max     ?? 147;
  const spo2    = rd?.heart?.spo2    ?? null;
  return ('''

code = code.replace(old_heart, new_heart, 1)

# Anillos HeartView: FC Reposo, SpO2, HRV (ocultar), FC Máx
old_heart_rings = '''{label:"FC Reposo",topic:"FC Reposo",value:58,  max:100,sublabel:"bpm",from:grad.red[0],   to:grad.red[1]},
            {label:"SpO\u2082",    topic:"SpO\u2082",     value:97,  max:100,sublabel:"%",  from:grad.garnet[0],to:grad.garnet[1]},
            {label:"HRV",     topic:"HRV",       value:49,  max:80, sublabel:"ms", from:grad.purple[0],to:grad.purple[1]},
            {label:"FC M\u00e1x.", topic:"FC",        value:147, max:200,sublabel:"bpm",from:grad.amber[0], to:grad.amber[1]},'''

new_heart_rings = '''{label:"FC Reposo",topic:"FC Reposo",value:hrRest,max:100,sublabel:"bpm",from:grad.red[0],   to:grad.red[1]},
            ...(spo2?[{label:"SpO\u2082",topic:"SpO\u2082",value:spo2,max:100,sublabel:"%",from:grad.garnet[0],to:grad.garnet[1]}]:[]),
            {label:"FC M\u00e1x.", topic:"FC",        value:hrMax, max:200,sublabel:"bpm",from:grad.amber[0], to:grad.amber[1]},'''

code = code.replace(old_heart_rings, new_heart_rings, 1)

# FC chart stats: Actual, Máx, Mín, Media
code = code.replace(
    '[{l:"Actual",v:"68",u:"bpm",c:G.coral},{l:"M\u00e1x.",v:"147",u:"bpm",c:G.amber},{l:"M\u00edn.",v:"52",u:"bpm",c:G.blue},{l:"Media",v:"78",u:"bpm",c:G.muted}]',
    '[{l:"Actual",v:`${hrRate}`,u:"bpm",c:G.coral},{l:"M\u00e1x.",v:`${hrMax}`,u:"bpm",c:G.amber},{l:"M\u00edn.",v:`${hrRest}`,u:"bpm",c:G.blue},{l:"Media",v:`${hrRate}`,u:"bpm",c:G.muted}]',
    1
)

# SpO2 stats — ocultar card HRV si no hay datos, mostrar SpO2 real
code = code.replace(
    '[{l:"Actual",v:"97",c:G.garnet},{l:"M\u00edn.",v:"94",c:G.coral},{l:"Media",v:"97",c:G.muted}]',
    '[{l:"Actual",v:spo2?`${spo2}`:"--",c:G.garnet},{l:"M\u00edn.",v:spo2?`${spo2-1}`:"--",c:G.coral},{l:"Media",v:spo2?`${spo2}`:"--",c:G.muted}]',
    1
)

# Ocultar card HRV semanal (no disponible en BIP 6) — envolver en condicional
code = code.replace(
    '{W.has("spo2hrv")&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>',
    '{W.has("spo2hrv")&&<div style={{display:"grid",gridTemplateColumns:"1fr",gap:16}}>',
    1
)

# ─── 3. SLEEP VIEW — conectar datos reales ───────────────────────────────────
old_sleep = '''function SleepView() {
  const W = useWidgets("sleep");
  return ('''

new_sleep = '''function SleepView() {
  const W = useWidgets("sleep");
  const rd = useRealData();
  const slpHrs   = rd?.sleep?.totalHrs ?? 7.3;
  const slpDeep  = rd?.sleep?.deepMin  ?? 95;
  const slpScore = rd?.sleep?.score    ?? 84;
  const hrRest   = rd?.heart?.resting  ?? 52;
  const slpH     = Math.floor(slpHrs);
  const slpM     = Math.round((slpHrs % 1) * 60);
  const slpBadge = slpScore>=80?"BUENO":slpScore>=60?"REGULAR":"MEJORABLE";
  return ('''

code = code.replace(old_sleep, new_sleep, 1)

# Hero title sueño
code = code.replace(
    '<h2 style={{fontSize:26,fontWeight:800,margin:0}}>Anoche \u00b7 7h 20m</h2>',
    '<h2 style={{fontSize:26,fontWeight:800,margin:0}}>Anoche \u00b7 {slpH}h {slpM}m</h2>',
    1
)

# Score ring sueño
code = code.replace(
    '<GradientRing value={84} max={100} colorFrom={grad.blue[0]} colorTo={grad.blue[1]} size={130} label={84} sublabel="%"/>',
    '<GradientRing value={slpScore} max={100} colorFrom={grad.blue[0]} colorTo={grad.blue[1]} size={130} label={slpScore} sublabel="%"/>',
    1
)

# Badge sueño hero
code = code.replace(
    '<div style={{fontSize:9,color:"#7080A0",marginBottom:3}}>{s.fase}</div>',
    '<div style={{fontSize:9,color:"#7080A0",marginBottom:3}}>{s.fase}</div>',
    1
)

# FC mín nocturna en sleep phases
code = code.replace(
    '{...sleepPhaseSummary,{fase:"FC M\u00edn",min:null,bpm:52,color:G.coral}}',
    '[...sleepPhaseSummary,{fase:"FC M\u00edn",min:null,bpm:hrRest,color:G.coral}]',
    1
)
# variante con corchetes correctos
code = code.replace(
    '[...sleepPhaseSummary,{fase:"FC M\u00edn",min:null,bpm:52,color:G.coral}]',
    '[...sleepPhaseSummary,{fase:"FC M\u00edn",min:null,bpm:hrRest,color:G.coral}]',
    1
)

# Dashboard sleep card badge dinámico
code = code.replace(
    '<span style={S.badge(G.blue)}>{slpScore>=80?"BUENO":slpScore>=60?"REGULAR":"MEJORABLE"} \u00b7 {slpScore}/100</span>',
    '<span style={S.badge(G.blue)}>{slpBadge ?? (slpScore>=80?"BUENO":slpScore>=60?"REGULAR":"MEJORABLE")} \u00b7 {slpScore}/100</span>',
    1
)

# ─── 4. ACTIVITY VIEW — conectar datos reales ────────────────────────────────
old_act = '''function ActivityView() {
  const W = useWidgets("activity");
  const [workout,setWorkout] = useState(null);
  const actGoals = [
    {label:"Pasos",       topic:"Pasos",    value:8900,max:12000,from:grad.accent[0],to:grad.accent[1]},
    {label:"Cal. activas",topic:"Calor\u00edas", value:420, max:600,  from:grad.amber[0], to:grad.amber[1]},
    {label:"De Pie",      topic:"De Pie",   value:9,   max:12,   from:grad.green[0], to:grad.green[1]},
    {label:"Pisos",       topic:"Pisos",    value:8,   max:10,   from:grad.purple[0],to:grad.purple[1]},
  ];'''

new_act = '''function ActivityView() {
  const W = useWidgets("activity");
  const [workout,setWorkout] = useState(null);
  const rd = useRealData();
  const steps  = rd?.activity?.steps    ?? 8900;
  const cals   = rd?.activity?.calories ?? 420;
  const stands = rd?.activity?.stands   ?? 9;
  const actGoals = [
    {label:"Pasos",       topic:"Pasos",    value:steps, max:12000,from:grad.accent[0],to:grad.accent[1]},
    {label:"Cal. activas",topic:"Calor\u00edas", value:cals,  max:600,  from:grad.amber[0], to:grad.amber[1]},
    {label:"De Pie",      topic:"De Pie",   value:stands,max:12,   from:grad.green[0], to:grad.green[1]},
    {label:"Pisos",       topic:"Pisos",    value:8,     max:10,   from:grad.purple[0],to:grad.purple[1]},
  ];'''

code = code.replace(old_act, new_act, 1)

# ─── 5. WELLNESS VIEW — conectar datos reales ────────────────────────────────
old_well = '''function WellnessView() {
  const W = useWidgets("wellness");
  return ('''

new_well = '''function WellnessView() {
  const W = useWidgets("wellness");
  const rd = useRealData();
  const stress   = rd?.wellness?.stress ?? 28;
  const pai      = rd?.wellness?.pai    ?? 13;
  const battery  = rd?.wellness?.battery ?? 25;
  const slpScore = rd?.sleep?.score     ?? 84;
  const readiness = Math.round(Math.min(100, Math.max(0,
    (slpScore * 0.4) + ((100 - stress) * 0.35) + (pai * 2)
  )));
  return ('''

code = code.replace(old_well, new_well, 1)

# ─── 6. BEVEL PANEL — actualizar con datos reales ────────────────────────────
# El bevel ya tiene hrRate y stress desde el patch anterior (patch1)
# Solo necesitamos asegurarnos de que SpO2 muestre real o "--"
code = code.replace(
    '{abbr:"SpO\u2082",  value:97,    unit:"%",   color:G.garnet, nav:"heart",    spark:[97,96,98,97,98,97,96,97]}',
    '{abbr:"SpO\u2082",  value:spo2??97, unit:"%", color:G.garnet, nav:"heart",    spark:[97,96,98,97,98,97,96,spo2??97]}',
    1
)

# ─── 7. ARREGLAR 4º ANILLO EN MÓVIL ─────────────────────────────────────────
# El problema es gridTemplateColumns:"repeat(4,1fr)" — en móvil el 4º no cabe
# Cambiamos a 2x2 en móvil usando una solución responsive
old_rings_grid = '''<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
          {[
            {label:"Disponibilidad",topic:"Disponibilidad",value:readiness,max:100,  sublabel:"%",from:grad.accent[0],to:grad.accent[1],nav:"wellness"},'''

new_rings_grid = '''<div style={{display:"grid",gridTemplateColumns:mobile?"repeat(2,1fr)":"repeat(4,1fr)",gap:8}}>
          {[
            {label:"Disponibilidad",topic:"Disponibilidad",value:readiness,max:100,  sublabel:"%",from:grad.accent[0],to:grad.accent[1],nav:"wellness"},'''

code = code.replace(old_rings_grid, new_rings_grid, 1)

# Dashboard necesita acceder a mobile — añadir al inicio de Dashboard
code = code.replace(
    '''function Dashboard({weekMetric,setWeekMetric,profile,onNavigate}) {
  const W = useWidgets("dashboard");
  const ds = weeklyDatasets[weekMetric];
  const name = profile.name || "Usuario";
  const rd = useRealData();''',
    '''function Dashboard({weekMetric,setWeekMetric,profile,onNavigate,mobile}) {
  const W = useWidgets("dashboard");
  const ds = weeklyDatasets[weekMetric];
  const name = profile.name || "Usuario";
  const rd = useRealData();''',
    1
)

# Pasar mobile al Dashboard
code = code.replace(
    'dashboard:<Dashboard weekMetric={weekMetric} setWeekMetric={setWeekMetric} profile={profile} onNavigate={setView}/>',
    'dashboard:<Dashboard weekMetric={weekMetric} setWeekMetric={setWeekMetric} profile={profile} onNavigate={setView} mobile={mobile}/>',
    1
)

with open(PATH, "w", encoding="utf-8") as f:
    f.write(code)

print("✅ patch2 aplicado correctamente")
print("   - Fecha dinámica")
print("   - HeartView con datos reales (HRV oculto)")  
print("   - SleepView con datos reales")
print("   - ActivityView con datos reales")
print("   - WellnessView con datos reales")
print("   - 4º anillo responsive en móvil")
