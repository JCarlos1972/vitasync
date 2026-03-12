import re

path = r"C:\Users\jcarl\Desktop\vitasync\src\App.jsx"

with open(path, "r", encoding="utf-8") as f:
    code = f.read()

# 1. Añadir variables de datos reales al inicio de Dashboard
old = '''function Dashboard({weekMetric,setWeekMetric,profile,onNavigate}) {
  const W = useWidgets("dashboard");
  const ds = weeklyDatasets[weekMetric];
  const name = profile.name || "Usuario";'''

new = '''function Dashboard({weekMetric,setWeekMetric,profile,onNavigate}) {
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
  )));'''

code = code.replace(old, new, 1)

# 2. Top rings — Disponibilidad, Pasos, Sueño, Recuperación
old2 = '''            {label:"Disponibilidad",topic:"Disponibilidad",value:78,  max:100,  sublabel:"%",from:grad.accent[0],to:grad.accent[1],nav:"wellness"},
            {label:"Pasos",         topic:"Pasos",         value:8900,max:12000,sublabel:"", from:grad.green[0], to:grad.green[1], nav:"activity"},
            {label:"Sueño",         topic:"Sueño",         value:7.3, max:9,    sublabel:"h",from:grad.blue[0],  to:grad.blue[1],  nav:"sleep"},
            {label:"Recuperación",  topic:"Recuperación",  value:82,  max:100,  sublabel:"%",from:grad.purple[0],to:grad.purple[1],nav:"wellness"},'''

new2 = '''            {label:"Disponibilidad",topic:"Disponibilidad",value:readiness,max:100,  sublabel:"%",from:grad.accent[0],to:grad.accent[1],nav:"wellness"},
            {label:"Pasos",         topic:"Pasos",         value:steps,   max:12000,sublabel:"", from:grad.green[0], to:grad.green[1], nav:"activity"},
            {label:"Sueño",         topic:"Sueño",         value:slpHrs,  max:9,    sublabel:"h",from:grad.blue[0],  to:grad.blue[1],  nav:"sleep"},
            {label:"Recuperación",  topic:"Recuperación",  value:recovery,max:100,  sublabel:"%",from:grad.purple[0],to:grad.purple[1],nav:"wellness"},'''

# Handle both escaped and unescaped ñ
code = code.replace(old2, new2, 1)
# Try with escaped chars if above didn't match
if new2 not in code:
    old2b = old2.replace("Sueño", "Sue\u00f1o").replace("Recuperación", "Recuperaci\u00f3n")
    new2b = new2.replace("Sueño", "Sue\u00f1o").replace("Recuperación", "Recuperaci\u00f3n")
    code = code.replace(old2b, new2b, 1)

# 3. Progreso objetivos — reemplazar valores hardcoded
replacements = [
    # Pasos
    ('value:8900, max:12000, unit:"/ 12K pasos"', 'value:steps, max:12000, unit:"/ 12K pasos"'),
    # Calorías activas
    ('value:420,  max:600,   unit:"/ 600 kcal"', 'value:cals, max:600, unit:"/ 600 kcal"'),
    # Horas de pie
    ('value:9,    max:12,    unit:"/ 12 h"', 'value:stands, max:12, unit:"/ 12 h"'),
    # HRV — no tenemos HRV real, dejamos como está
    # Sueño anoche
    ('value:7.3,  max:9,     unit:"/ 9 h"', 'value:slpHrs, max:9, unit:"/ 9 h"'),
    # Disponibilidad
    ('value:78,   max:100,   unit:"%"', 'value:readiness, max:100, unit:"%"'),
]

for old_r, new_r in replacements:
    code = code.replace(old_r, new_r, 1)

# 4. FC card — valor principal y stats
code = code.replace(
    '<span style={{fontFamily:mono,fontSize:40,fontWeight:800,color:G.coral,letterSpacing:"-0.03em"}}>68</span>\n            <span style={{fontSize:14,color:G.muted}}>bpm · reposo</span>',
    '<span style={{fontFamily:mono,fontSize:40,fontWeight:800,color:G.coral,letterSpacing:"-0.03em"}}>{hrRate}</span>\n            <span style={{fontSize:14,color:G.muted}}>bpm · reposo</span>',
    1
)

# FC stats: Máx, Mín, Media
code = code.replace(
    '[{l:"Máx.",v:"147 bpm",c:G.amber},{l:"Mín.",v:"52 bpm",c:G.blue},{l:"Media",v:"78 bpm",c:G.coral}]',
    '[{l:"Máx.",v:`${hrMax} bpm`,c:G.amber},{l:"Mín.",v:`${hrRest} bpm`,c:G.blue},{l:"Media",v:`${hrRate} bpm`,c:G.coral}]',
    1
)

# 5. Bevel panel — PPM y ESTRÉS
code = code.replace(
    '{abbr:"PPM",    value:68,    unit:"bpm",  color:G.red,    nav:"heart",    spark:[58,62,70,85,91,78,72,68]}',
    '{abbr:"PPM",    value:hrRate, unit:"bpm", color:G.red,    nav:"heart",    spark:[58,62,70,85,91,78,72,hrRate]}',
    1
)
code = code.replace(
    '{abbr:"ESTRÉS", value:28,    unit:"/100", color:G.amber,  nav:"wellness", spark:[45,55,38,65,28,22,35,28]}',
    '{abbr:"ESTRÉS", value:stress, unit:"/100",color:G.amber,  nav:"wellness", spark:[45,55,38,65,28,22,35,stress]}',
    1
)
# Handle encoding variants
code = code.replace(
    '{abbr:"ESTR\u00c9S", value:28,    unit:"/100"',
    '{abbr:"ESTR\u00c9S", value:stress, unit:"/100"',
    1
)

# 6. Sueño card — horas y badge
code = code.replace(
    '<div style={{fontFamily:mono,fontSize:26,fontWeight:700,color:G.blue,marginBottom:10}}>7h 20<span style={{fontSize:13,color:G.muted,fontFamily:font}}> min</span></div>',
    '<div style={{fontFamily:mono,fontSize:26,fontWeight:700,color:G.blue,marginBottom:10}}>{Math.floor(slpHrs)}h {Math.round((slpHrs%1)*60)}<span style={{fontSize:13,color:G.muted,fontFamily:font}}> min</span></div>',
    1
)
code = code.replace(
    '<span style={S.badge(G.blue)}>BUENO · 84/100</span>',
    '<span style={S.badge(G.blue)}>{slpScore>=80?"BUENO":slpScore>=60?"REGULAR":"MEJORABLE"} · {slpScore}/100</span>',
    1
)

# 7. Fecha actual
from datetime import datetime
import locale
try:
    locale.setlocale(locale.LC_TIME, 'es_ES.UTF-8')
except:
    pass
now = datetime.now()
days = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"]
months = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"]
date_str = f"{days[now.weekday()]}, {now.day} de {months[now.month-1]} · {now.year}"

code = code.replace(
    '<div style={{fontSize:13,color:G.muted,marginBottom:4}}>Sábado, 7 de marzo · 2026</div>',
    f'<div style={{{{fontSize:13,color:G.muted,marginBottom:4}}}}>{date_str}</div>',
    1
)
# Handle encoding variant
code = code.replace(
    '<div style={{fontSize:13,color:G.muted,marginBottom:4}}>S\u00e1bado, 7 de marzo \u00b7 2026</div>',
    f'<div style={{{{fontSize:13,color:G.muted,marginBottom:4}}}}>{date_str}</div>',
    1
)

with open(path, "w", encoding="utf-8") as f:
    f.write(code)

print("✅ App.jsx actualizado con datos reales del reloj")
