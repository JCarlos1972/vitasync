f = open('src/App.jsx', 'r', encoding='utf-8')
c = f.read()
f.close()

old = '{slpBadge ?? (slpScore>=80?"BUENO":slpScore>=60?"REGULAR":"MEJORABLE")} \u00b7 {slpScore}/100'
new = '{slpScore>=80?"BUENO":slpScore>=60?"REGULAR":"MEJORABLE"} \u00b7 {slpScore}/100'
c2 = c.replace(old, new)

if c2 == c:
    print("NO MATCH - buscando patron...")
    idx = c.find('slpBadge')
    print(repr(c[idx-5:idx+80]))
else:
    f = open('src/App.jsx', 'w', encoding='utf-8')
    f.write(c2)
    f.close()
    print("ok - slpBadge eliminado")
