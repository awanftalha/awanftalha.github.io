# Run from the repo root: python3 scripts/make-diagrams.py  (writes docs/diagrams/*.svg)
# Generates the three "before" diagrams as SVG in the site's light tokens.
W,H=1440,900
BG,SURF,TEXT,MUTED,BORDER,GHOST,CHIP="#FBFBFB","#FFFFFF","#1C1C1C","#6B6B6B","#E4E4E4","#CDCDCD","#EBEBEB"
FONT="'General Sans','Satoshi','Inter Display','Inter',sans-serif"
def esc(s): return s.replace("&","&amp;").replace("<","&lt;").replace(">","&gt;")
def t(x,y,s,size=16,w=400,c=TEXT,anchor="start",ls=-0.2):
    return f'<text x="{x}" y="{y}" font-family="{FONT}" font-size="{size}" font-weight="{w}" fill="{c}" text-anchor="{anchor}" letter-spacing="{ls}">{esc(s)}</text>'
def rect(x,y,w,h,fill=SURF,stroke=BORDER,r=4,sw=1,dash=None):
    d=f' stroke-dasharray="{dash}"' if dash else ''
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"{d}/>'
def bar(x,y,w,h=8,c=CHIP): return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{h/2}" fill="{c}"/>'
def window(x,y,w,h,title):
    g=rect(x,y,w,h)+f'<line x1="{x}" y1="{y+40}" x2="{x+w}" y2="{y+40}" stroke="{BORDER}"/>'
    g+=''.join(f'<circle cx="{x+20+i*14}" cy="{y+20}" r="4" fill="{GHOST}"/>' for i in range(3))
    g+=t(x+70,y+26,title,14,600,MUTED)
    return g
def arrow(x1,y1,x2,y2,label=None,dash="6 6"):
    g=f'<line x1="{x1}" y1="{y1}" x2="{x2-10}" y2="{y2}" stroke="{TEXT}" stroke-width="1.5" stroke-dasharray="{dash}"/>'
    g+=f'<path d="M{x2-12},{y2-6} L{x2},{y2} L{x2-12},{y2+6}" fill="none" stroke="{TEXT}" stroke-width="1.5"/>'
    if label: g+=t((x1+x2)/2,y1-12,label,13,600,MUTED,"middle")
    return g
def frame(body,eyebrow,caption):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">'
            f'<rect width="{W}" height="{H}" fill="{BG}"/>'
            + t(64,72,eyebrow,13,600,MUTED,ls=0.6) + body
            + f'<line x1="64" y1="{H-96}" x2="{W-64}" y2="{H-96}" stroke="{BORDER}"/>'
            + t(64,H-56,caption,20,500,TEXT) + t(W-64,H-56,"DIAGRAM",12,600,GHOST,"end",1.2) + '</svg>')

# 1 · compliance-check: two documents, two windows
b=window(64,112,560,600,"EASA reference document")
for i,code in enumerate(["GEN.110","GEN.115","GEN.120","GEN.130","GEN.140"]):
    y=180+i*100; b+=t(96,y,code,14,600,TEXT)+bar(96,y+18,440)+bar(96,y+38,360)+bar(96,y+58,400)
b+=window(816,112,560,600,"Operations manual")
for i,p in enumerate(["p. 8","p. 11","p. 14","p. 19"]):
    y=180+i*124; b+=t(848,y,p,14,600,TEXT)+bar(848,y+18,460)+bar(848,y+38,420)+bar(848,y+58,470)+bar(848,y+78,300)
b+=f'<line x1="640" y1="412" x2="800" y2="412" stroke="{TEXT}" stroke-width="1.5" stroke-dasharray="6 6"/>'
b+=f'<circle cx="720" cy="412" r="30" fill="{SURF}" stroke="{TEXT}" stroke-width="1.5"/>'+t(720,423,"?",30,500,TEXT,"middle")
b+=t(720,472,"The judgement joining them",14,600,MUTED,"middle")+t(720,492,"lives in one person's head",14,600,MUTED,"middle")
d1=frame(b,"BEFORE · CHECKING A MANUAL AGAINST THE REGULATION","Two documents, two windows, read side by side: five to six days a pass.")

# 2 · safety-report: one report, typed again three times
b=''; xs=[64,418,772,1126]; w=250
cards=[("Safety report","Free text from the reporter",[200,170,190,140,180]),
       ("Excel","Risk rated by each manager",None),
       ("Word","The record kept",[200,160,190,150]),
       ("Legacy system","ECCAIRS record for the authority",None)]
for i,(title,sub,bars) in enumerate(cards):
    x=xs[i]; b+=rect(x,200,w,400)+t(x+24,244,title,20,600)+t(x+24,270,sub,13,400,MUTED)
    if title=="Excel":
        for r in range(7):
            for c in range(3): b+=rect(x+24+c*68,300+r*38,62,30,"#FAFAFA",BORDER,2)
    elif title=="Legacy system":
        for r in range(6): b+=t(x+24,318+r*44,"Field "+str(r+1),12,400,MUTED)+rect(x+92,300+r*44,134,28,"#FAFAFA",BORDER,2)
    else:
        for j,bw in enumerate(bars): b+=bar(x+24,310+j*34,bw)
    if i<3: b+=arrow(x+w+6,400,xs[i+1]-6,400,"typed again")
b+=t(720,672,"“A normal report takes about two days.”  · safety manager, during research",16,500,MUTED,"middle")
d2=frame(b,"BEFORE · INVESTIGATING A SAFETY REPORT","The same facts typed again at every step: spreadsheet, Word, legacy system.")

# 3 · hx-insight: an email, two reminders and a sheet
b=''
mails=[("Annual leave request","To: line manager · Cc: HR"),("Reminder","Re: Annual leave request"),("Reminder","Re: Re: Annual leave request"),("Approved","Re: Re: Re: Annual leave request")]
for i,(s,meta) in enumerate(mails):
    y=150+i*120; x=64+i*18
    b+=rect(x,y,520,96)+t(x+24,y+38,s,18,600)+t(x+24,y+64,meta,13,400,MUTED)+bar(x+330,y+30,150,8)
b+=arrow(620,420,780,420,"copied by hand")
b+=window(790,150,330,540,"Subsidiary leave sheet")
for r in range(10):
    for c in range(3): b+=rect(814+c*96,210+r*44,88,32,"#FAFAFA",BORDER,2)
b+=t(955,716,"1 of 32",13,600,MUTED,"middle")
b+=arrow(1126,420,1236,420,"retyped")
b+=rect(1244,330,132,180)+t(1310,410,"Payroll",18,600,TEXT,"middle")+t(1310,436,"every month",13,400,MUTED,"middle")
d3=frame(b,"BEFORE · ASKING FOR LEAVE","An email, two reminders and a sheet: about three days for an answer.")

for name,svg in [("before-two-documents",d1),("before-three-tools",d2),("before-email-sheets",d3)]:
    open(name+".svg","w").write(svg)
print("svgs ok")

# 4 · priced-offer: the two directions tried and dropped (reconstructed lo-fi wireframes)
b=''
# Direction A: one long page, regrouped
b+=t(64,124,"A · Reorganise the dense page",18,600)+t(64,150,"Same single page, regrouped into sections",13,400,MUTED)
b+=window(64,176,600,560,"Offer · one page")
y=232
for s,(label,rows) in enumerate([("Client",3),("Flights",4),("Crew",3),("Pricing",4)]):
    if s: y+=rows_prev*24+44
    rows_prev=rows
    b+=t(92,y,label.upper(),11,600,MUTED,ls=0.8)
    for r in range(rows):
        for c in range(4): b+=rect(92+c*136,y+12+r*24,128,18,"#FAFAFA",BORDER,2)
b+=t(64,770,"Still one page serving four tasks: tidier, still unusable during the call.",14,500,MUTED)
# Direction B: a wizard
b+=t(776,124,"B · A step-by-step wizard",18,600)+t(776,150,"One question per screen, fixed order",13,400,MUTED)
b+=window(776,176,600,560,"New offer")
for i in range(9):
    cx=820+i*60; filled=i<3
    b+=f'<circle cx="{cx}" cy="250" r="12" fill="{TEXT if filled else SURF}" stroke="{TEXT if filled else GHOST}" stroke-width="1.5"/>'
    if i<8: b+=f'<line x1="{cx+12}" y1="250" x2="{cx+48}" y2="250" stroke="{GHOST}" stroke-width="1.5"/>'
b+=t(808,306,"Step 3 of 9 · Aircraft",20,600)
for r in range(3): b+=t(808,352+r*76,["Aircraft type","Registration","Seats"][r],13,400,MUTED)+rect(808,362+r*76,536,40,"#FAFAFA",BORDER,4)
b+=rect(808,660,120,44,SURF,BORDER,4)+t(868,688,"Back",15,500,TEXT,"middle")
b+=rect(1224,660,120,44,TEXT,TEXT,4)+t(1284,688,"Next",15,500,"#FFFFFF","middle")
b+=t(776,770,"Enforces an order the call doesn't have; a 40-second edit becomes a nine-screen walk.",14,500,MUTED)
d4=(f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">'
    f'<rect width="{W}" height="{H}" fill="{BG}"/>'+t(64,72,"TRIED AND DROPPED · TWO EARLY DIRECTIONS",13,600,MUTED,ls=0.6)+b
    +t(W-64,H-40,"RECONSTRUCTED WIREFRAME",12,600,GHOST,"end",1.2)+'</svg>')
open("docs/diagrams/rejected-directions.svg","w").write(d4)
print("rejected ok")

# 5 · training-record: paper in the air, Excel at a desk, roster never told
b=''
b+=rect(64,150,360,520)+t(88,192,"Printed question sheet",20,600)+t(88,218,"In the aircraft, during the session",13,400,MUTED)
for r in range(7):
    y=250+r*56; b+=t(88,y+20,f"Q{r+1}",13,600,TEXT)+bar(124,y+12,180)
    b+=f'<path d="M{316},{y+8} q12,-6 24,0 t24,0 t24,0" fill="none" stroke="{MUTED}" stroke-width="1.4"/>' if r%2==0 else ''
b+=t(244,650,"remarks in the margin",12,600,MUTED,"middle")
b+=arrow(432,410,532,410,"typed again")
b+=window(540,150,420,520,"Training record.xlsx")
for r in range(10):
    for c in range(3): b+=rect(564+c*126,206+r*44,118,32,"#FAFAFA",BORDER,2)
b+=t(750,700,"at a desk, 30–40 minutes per trainee",13,600,MUTED,"middle")
b+=f'<line x1="968" y1="410" x2="1064" y2="410" stroke="{GHOST}" stroke-width="1.5" stroke-dasharray="2 6"/>'
b+=t(1016,394,"not connected",13,600,MUTED,"middle")
b+=rect(1072,290,304,240)+t(1096,332,"Crew roster",20,600)+t(1096,358,"Who flies tomorrow",13,400,MUTED)
for r in range(3): b+=bar(1096,390+r*34,[220,180,200][r])
d5=frame(b,"BEFORE · RECORDING A TRAINING SESSION","Written twice, the first time in the air, and never connected to the roster.")
open("docs/diagrams/before-paper-excel.svg","w").write(d5)
print("training ok")
