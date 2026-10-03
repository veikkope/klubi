"""
Ruokailutaulukko (Excel .xls) → data/normalized/klubiarviot.json (docs/21).

Kertaluonteinen muunnos tuontia varten (npm run tuo:klubiarviot). Taulukossa
on jäsenten nimet ja arvosanat, joten se ja tulos ovat gitignoressa.

Ajo:  pip install xlrd   (vanha .xls-muoto)
      python scripts/klubiarviot-excel.py ruokailu2026.xls
"""
import sys
import xlrd, json, re, datetime
b=xlrd.open_workbook(sys.argv[1] if len(sys.argv) > 1 else "ruokailu2026.xls")
outliers=[]
def pvm(v, ctx=None):
    if isinstance(v,float) and 30000<v<50000:
        return (datetime.date(1899,12,30)+datetime.timedelta(days=int(v))).isoformat()
    if isinstance(v,float) and v and ctx: outliers.append((ctx,v))
    return None
def pvmt(v, ctx):
    out=[]
    if isinstance(v,float):
        p=pvm(v, ctx); out+= [p] if p else []
    elif isinstance(v,str):
        for m in re.finditer(r'(\d{1,2})\.(\d{1,2})\.(\d{4})',v):
            out.append(f"{m.group(3)}-{int(m.group(2)):02d}-{int(m.group(1)):02d}")
    return out
pa=b.sheet_by_name('Painot')
jasenet=[{"numero":int(pa.cell_value(r,0)),"nimi":str(pa.cell_value(r,1)).strip().capitalize()} for r in range(1,pa.nrows)]
ru=b.sheet_by_name('Ruokailu'); hdr=ru.row_values(0)
slots=[int(h[1:]) for h in hdr if re.fullmatch(r'R\d+',str(h))]
rivit=[]; ongelmat=[]
for r in range(1,ru.nrows):
    row=dict(zip(hdr,ru.row_values(r)))
    nimi=str(row['Ravintola']).strip()
    if not nimi: continue
    arviot=[]
    for n in slots:
        R,H,V=row.get(f'R{n}'),row.get(f'H{n}'),row.get(f'V{n}')
        if all(isinstance(x,float) for x in (R,H,V)) and (R or H or V):
            paivat=sorted(set(pvmt(row.get(f'Alku {n}'),(nimi,n,'alku'))+pvmt(row.get(f'PVM{n}'),(nimi,n,'pvm'))))
            arviot.append({"numero":n,"ruoka":R,"hinta":H,"viihtyvyys":V,"paivat":paivat})
        elif any(isinstance(x,float) and x for x in (R,H,V)):
            ongelmat.append((nimi,n,R,H,V))
    posti=row.get('Posti','')
    posti=str(int(posti)).zfill(5) if isinstance(posti,float) else str(posti).strip()
    rivit.append({"rivi":r+1,"nimi":nimi,"kaupunki":str(row['Kaupunki']).strip(),"maa":str(row['Maa']).strip(),
        "alku":pvm(row['Alku pvm'],(nimi,'alku')),"viimeisin":pvm(row['Viim. Pvm'],(nimi,'viim')),"lkm":row['Lkm'],
        "katu":str(row.get('Katu','')).strip(),"posti":posti,
        "tapahtuma":str(row.get('Tapahtuma','')).strip(),"tl":str(row.get('T/L','')).strip(),"arviot":arviot})
json.dump({"jasenet":jasenet,"ravintolat":rivit},open('data/normalized/klubiarviot.json','w',encoding='utf-8'),ensure_ascii=False,indent=1)
n_arv=sum(len(x['arviot']) for x in rivit)
print("jäseniä",len(jasenet),[j['nimi'] for j in jasenet])
print("ravintoloita",len(rivit),"arvioita",n_arv)
print("lkm-sarake ≠ arvioita:",[ (x['nimi'],x['lkm'],len(x['arviot'])) for x in rivit if x['lkm']!=len(x['arviot'])][:10])
print("osittaiset arviot:",ongelmat[:10])
print("ilman päivää:",sum(1 for x in rivit for a in x['arviot'] if not a['paivat']))
print("outlier-päivät:",outliers[:10])
print("T/L arvot:",sorted({x['tl'] for x in rivit}))
print("slotit:",slots)
