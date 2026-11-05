#!/usr/bin/env python3
"""Give the 2D station map in index.html the hall envelope of the 3D halls (hall-kit.js): the three walls with a
steel column and striped guard every bay, the cable tray, sprinkler main and air line along them, roll-up loading
doors with hatched aprons and bollards, the fire exit, the personnel door, electrical boards, fire points, first
aid, the wall clock, the open front, and the yellow zone round the machines with the hall's name.
Each replacement must match exactly once, or nothing is written."""
import os
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
p = os.path.join(root, 'index.html')
s = open(p, encoding='utf-8').read()
MARK = 'function envelope2D('
if MARK in s:
    raise SystemExit('index.html already patched')

def once(old, new):
    global s
    n = s.count(old)
    if n != 1:
        raise SystemExit(f'expected 1 match, found {n}: {old[:90]!r}')
    s = s.replace(old, new)

ENV = r"""// Hall envelope, drawn like the 3D hall (hall-kit.js): back, left and right walls with a steel column and its striped guard every bay, the cable tray, sprinkler main and air line along them, roll-up loading doors with hatched aprons and bollards, the fire exit, the personnel door, electrical boards, fire points, first aid, the wall clock, the open front, and the yellow zone round the machines with the hall's name on the floor.
function envelope2D(fl,ext,P,S,PX,PT,fx,name){const o=[];const Q=(x,z)=>{const p=P(x,z);return [p[0]-PX,p[1]-PT]};
 const R=(x0,z0,x1,z1,cls)=>{const a=Q(x0,z0),c=Q(x1,z1);o.push(`<rect class="${cls}" x="${fx(Math.min(a[0],c[0]))}" y="${fx(Math.min(a[1],c[1]))}" width="${fx(Math.abs(c[0]-a[0]))}" height="${fx(Math.abs(c[1]-a[1]))}"/>`)};
 const L=(x0,z0,x1,z1,cls)=>{const a=Q(x0,z0),c=Q(x1,z1);o.push(`<line class="${cls}" x1="${fx(a[0])}" y1="${fx(a[1])}" x2="${fx(c[0])}" y2="${fx(c[1])}"/>`)};
 const C=(x,z,r,cls)=>{const a=Q(x,z);o.push(`<circle class="${cls}" cx="${fx(a[0])}" cy="${fx(a[1])}" r="${fx(r*S)}"/>`)};
 const PL=(pts,cls)=>o.push(`<polyline class="${cls}" points="${pts.map(([x,z])=>{const a=Q(x,z);return fx(a[0])+','+fx(a[1])}).join(' ')}"/>`);
 // a wall runs from a to b and faces n (into the hall); the same bays, doors and kit as the 3D wall
 const walls=[{a:[fl.x0,fl.z0],b:[fl.x1,fl.z0],n:[0,1],clock:true},{a:[fl.x0,fl.z1],b:[fl.x0,fl.z0],n:[1,0],doors:[{at:.08,kind:'exit'},{at:.55,kind:'rollup'}]},{a:[fl.x1,fl.z0],b:[fl.x1,fl.z1],n:[-1,0],doors:[{at:.45,kind:'rollup'},{at:.92,kind:'door'}]}];
 for(const w of walls){const len=Math.hypot(w.b[0]-w.a[0],w.b[1]-w.a[1]),u=[(w.b[0]-w.a[0])/len,(w.b[1]-w.a[1])/len],n=w.n,at=(t,d)=>[w.a[0]+u[0]*t+n[0]*d,w.a[1]+u[1]*t+n[1]*d];
  const box=(t0,t1,d0,d1,cls)=>{const p=at(t0,d0),q=at(t1,d1);R(p[0],p[1],q[0],q[1],cls)};
  box(0,len,-.3,0,'wl');box(0,len,.3,.62,'tr');{const p=at(0,.24),q=at(len,.24);L(p[0],p[1],q[0],q[1],'spk')}{const p=at(0,.14),q=at(len,.14);L(p[0],p[1],q[0],q[1],'air')}
  const bays=Math.max(2,Math.round(len/6)),step=len/bays,mid=i=>(i+.5)*step,door=new Map((w.doors||[]).map(d=>[Math.min(bays-1,Math.max(0,Math.floor(d.at*bays))),d.kind]));
  for(let i=0;i<=bays;i++){const t=i*step;box(t-.23,t+.23,.01,.47,'hz');box(t-.16,t+.16,.04,.4,'cl')}
  const kit=['board','fire','sign','aid','board','sign2'];let k=0;
  for(let i=0;i<bays;i++){const t=mid(i),kind=door.get(i);
   if(kind==='rollup'){const dw=Math.min(4.4,step-.9);box(t-dw/2,t+dw/2,-.32,.02,'dg');{const p=at(t-dw/2,-.15),q=at(t+dw/2,-.15);L(p[0],p[1],q[0],q[1],'dd')}box(t-dw/2,t+dw/2,.25,2.05,'ap');for(const sx of [-1,1]){const p=at(t+sx*(dw/2+.5),1.05);C(p[0],p[1],.12,'bo')}continue}
   if(kind==='exit'||kind==='door'){const d=t-.8;box(d-.54,d+.54,-.32,.02,'dg');const pts=[at(d-.54,1.08),at(d-.54,0)];for(let j=0;j<=8;j++){const a=j/8*Math.PI/2;pts.push(at(d-.54+Math.sin(a)*1.08,Math.cos(a)*1.08))}PL(pts,'lf'+(kind==='exit'?' exit':''));
    if(kind==='exit'){box(d-.45,d+.45,-.62,-.34,'fa');const tp=Q(...at(d,-.95));o.push(`<text class="ex" x="${fx(tp[0])}" y="${fx(tp[1])}" text-anchor="middle">EXIT</text>`)}continue}
   if(w.clock&&i===Math.floor(bays/2)){const p=at(t,.3);C(p[0],p[1],.3,'ck');continue}
   const what=kit[k++%kit.length];
   if(what==='board'){box(t-.95,t-.05,.02,.32,'eb');box(t+.1,t+.8,.02,.27,'eb')}
   else if(what==='fire'){const p=at(t-.5,.16);C(p[0],p[1],.12,'fp');box(t-.11,t+.61,.02,.24,'fp')}
   else if(what==='aid')box(t-.24,t+.24,.02,.18,'fa')}}
 L(fl.x0,fl.z1,fl.x1,fl.z1,'kb');
 // the zone round the machines, the hall's name in front of it (as painted on the 3D floor)
 const pad=1.1,zx0=Math.max(fl.x0+1.4,ext.x0-pad),zx1=Math.min(fl.x1-1.4,ext.x1+pad),zz0=Math.max(fl.z0+1.4,ext.z0-pad),zz1=Math.min(fl.z1-2.2,ext.z1+pad);
 R(zx0,zz0,zx1,zz1,'zn');const tp=Q((zx0+zx1)/2,zz1+.9);o.push(`<text class="zt" x="${fx(tp[0])}" y="${fx(tp[1])}" text-anchor="middle" style="font-size:${Math.max(9,Math.min(15,.55*S)).toFixed(1)}px">${esc(name).toUpperCase()}</text>`);
 return o.join('')}
"""
once('function render2D(){', ENV + 'function render2D(){')
# the whole hall is drawn (walls included) unless the floor is far larger than the machines
once(" const cb={x0:Math.max(fl.x0,ext.x0-2.5),x1:Math.min(fl.x1,ext.x1+2.5),z0:Math.max(fl.z0,ext.z0-3),z1:Math.min(fl.z1,ext.z1+2.5)};",
     " const big=(fl.x1-fl.x0)>(ext.x1-ext.x0)+26||(fl.z1-fl.z0)>(ext.z1-ext.z0)+26;const cb=big?{x0:Math.max(fl.x0,ext.x0-2.5),x1:Math.min(fl.x1,ext.x1+2.5),z0:Math.max(fl.z0,ext.z0-3),z1:Math.min(fl.z1,ext.z1+2.5)}:{x0:fl.x0-.45,x1:fl.x1+.45,z0:fl.z0-.45,z1:fl.z1+.45};")
once('''height="${fx(Math.abs(c[1]-a[1]))}" rx="2"/>`}s+=`</svg>`;''',
     '''height="${fx(Math.abs(c[1]-a[1]))}" rx="2"/>`;s+=envelope2D(fl,ext,P,S,PX,PT,fx,m.name)}s+=`</svg>`;''')
once('<line class="hp2" x1="0" y1="0" x2="0" y2="7"/></pattern></defs>',
     '<line class="hp2" x1="0" y1="0" x2="0" y2="7"/></pattern><pattern id="hatchYel" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" fill="#e3b82e" opacity=".85"/><line x1="0" y1="0" x2="0" y2="8" stroke="#1c1b18" stroke-width="3"/></pattern></defs>')
once('<span><i class="fw"></i>Flow direction</span></div>',
     '<span><i class="fw"></i>Flow direction</span><span><i class="wl"></i>Wall, columns, services</span><span><i class="dr"></i>Roll-up door</span><span><i class="ex"></i>Fire exit / door</span><span><i class="zn"></i>Zone</span></div>')
once('.m2 .fl{fill:var(--plan-hall);stroke:var(--muted);stroke-width:3}', '.m2 .fl{fill:var(--plan-hall);stroke:var(--muted);stroke-width:1}')
once('.m2 .ah{fill:var(--accent)}',
     '.m2 .ah{fill:var(--accent)}\n'
     '.m2 .wl{fill:#4b5560}.m2 .cl{fill:#2b2d30}.m2 .hz{fill:#e3b82e}.m2 .tr{fill:#9aa3ab;opacity:.5}.m2 .spk{stroke:#c8312a;stroke-width:1.4}.m2 .air{stroke:#2c6fb8;stroke-width:1.2}\n'
     '.m2 .dg{fill:var(--plan-hall)}.m2 .dd{stroke:#4b5560;stroke-width:1.2;stroke-dasharray:4 3}.m2 .ap{fill:url(#hatchYel)}.m2 .bo{fill:#e3b82e;stroke:#1c1b18;stroke-width:.8}\n'
     '.m2 .lf{stroke:#2b2d30;stroke-width:1.5;fill:none}.m2 .lf.exit{stroke:#1f8a4c}.m2 .ex{font:700 8px var(--f-ui);fill:#1f8a4c}\n'
     '.m2 .fp{fill:#c8312a}.m2 .fa{fill:#1f8a4c}.m2 .eb{fill:#b9c0c6;stroke:#4b5560;stroke-width:.6}.m2 .ck{fill:#fafaf7;stroke:#1c1b18;stroke-width:1}\n'
     '.m2 .zn{fill:none;stroke:#e3b82e;stroke-width:2;stroke-dasharray:8 5}.m2 .zt{font:700 13px var(--f-disp);fill:rgba(128,130,128,.85);letter-spacing:.08em}.m2 .kb{stroke:#2b2d30;stroke-width:2}\n'
     '.legend i.wl{background:#4b5560}.legend i.dr{background:repeating-linear-gradient(45deg,#e3b82e 0 3px,#1c1b18 3px 5px)}.legend i.ex{background:#1f8a4c}.legend i.zn{background:none;border:1.5px dashed #e3b82e}')
open(p, 'w', encoding='utf-8').write(s)
print('index.html: 2D station map now draws the hall envelope')
