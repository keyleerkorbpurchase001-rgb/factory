// The two to-scale drawings of a hall, ported from the old index.html: the home hero's line drawing (hxSVG) and the
// 2D station map (render2D with its hall envelope). Both read MAP2D, the footprint of every placed row as laid out
// by the hall's 3D model, and return SVG markup as a string: the drawings are several hundred elements with
// animation delays per element, and the old routines are kept verbatim so the React pages draw exactly what the
// old site drew. The pages inject the string and delegate clicks on [data-r] (a row index) to the machine sheet.
import {D,H,MAP2D,lineName,hash3D} from './data.js';

export const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const f1=v=>v.toFixed(1);
const med=a=>{const s=a.slice().sort((x,y)=>x-y);return s[s.length>>1]};

// ---------- home hero: the hall of a plant drawn like a blueprint ----------
// fk: plant, h: its hall (HXH), anim: draw the walls, boxes and flows in; k: animation speed factor (1 the first
// time, .6 afterwards); cw: the width of the drawing box; wide: a desktop layout (the drawing is capped to the
// viewport height); vh: innerHeight. Returns {svg, S (px per metre), its (station boxes in drawing space), height}.
export function hxSVG(h,anim,k,cw,wide,vh){const M=MAP2D[h],fl=M.floor;
 cw=Math.max(260,cw||640);
 const hw=fl.x1-fl.x0,hd=fl.z1-fl.z0,rot=hd>hw*1.25,Wm=rot?hd:hw,Dm=rot?hw:hd;
 const PL=30,PT=30,PR=4,PB=4;const maxH=wide?Math.max(450,Math.min(620,vh-63-230)):1e9;
 const S=Math.min((cw-PL-PR)/Wm,(maxH-PT-PB)/Dm),DW=Wm*S,DH=Dm*S,VW=Math.ceil(PL+DW+PR),VH=Math.ceil(PT+DH+PB);
 const P=(x,z)=>rot?[PL+(z-fl.z0)*S,PT+(fl.x1-x)*S]:[PL+(x-fl.x0)*S,PT+(z-fl.z0)*S];
 let s=`<svg class="hxs${anim?' anim':''}" style="--k:${k}" width="${VW}" height="${VH}" viewBox="0 0 ${VW} ${VH}" role="img" aria-label="Floor plan of the ${esc(H[h].name)}, drawn to scale from the 3D model: ${f1(Wm)} by ${f1(Dm)} metres">`;
 const iw=Math.max(2.5,.28*S);
 s+=`<rect class="hxw" x="${PL}" y="${PT}" width="${f1(DW)}" height="${f1(DH)}" pathLength="1"/><rect class="hxw2" x="${f1(PL+iw)}" y="${f1(PT+iw)}" width="${f1(DW-2*iw)}" height="${f1(DH-2*iw)}" pathLength="1"/>`;
 const dy=PT-14,dx=PL-14,R=PL+DW,B=PT+DH;
 s+=`<g class="hxd"><path d="M${PL},${PT-4}V${dy-4}M${f1(R)},${PT-4}V${dy-4}M${PL-4},${dy}H${f1(R+4)}M${PL-3},${dy+3}l6,-6M${f1(R-3)},${dy+3}l6,-6M${PL-4},${PT}H${dx-4}M${PL-4},${f1(B)}H${dx-4}M${dx},${PT-4}V${f1(B+4)}M${dx-3},${PT+3}l6,-6M${dx-3},${f1(B+3)}l6,-6"/>`;
 s+=`<text x="${f1(PL+DW/2)}" y="${dy-5}" text-anchor="middle">${f1(Wm)} m</text><text transform="translate(${dx-5},${f1(PT+DH/2)}) rotate(-90)" text-anchor="middle">${f1(Dm)} m</text></g>`;
 const its=M.items.map(([ri,x0,x1,z0,z1])=>{const a=P(x0,z0),c=P(x1,z1);const x=Math.min(a[0],c[0]),y=Math.min(a[1],c[1]),w=Math.abs(c[0]-a[0]),hh=Math.abs(c[1]-a[1]);return {ri,r:ri>=0?D.rows[ri]:null,x,y,w,h:hh,cx:x+w/2,cy:y+hh/2}});
 const lines={};its.forEach(it=>{if(it.r&&it.r.line)(lines[it.r.line]=lines[it.r.line]||[]).push(it)});
 const lk=Object.keys(lines).map(Number).sort((a,b)=>a-b);
 const dl=it=>it.r&&it.r.line?.55+lk.indexOf(it.r.line)*.12+it.r.step*.05:1.4+((it.cx*7+it.cy*3)%40)/100;
 its.slice().sort((a,b)=>b.w*b.h-a.w*a.h).forEach(it=>{const r=it.r,kc=!r||!r.line?'sup':r.kind==='na'?'na':r.kind==='shared'?'sh':'ok';const g=Math.min(1,it.w*.08,it.h*.08);
  s+=`<rect class="hxt ${kc}"${r?` data-r="${it.ri}"`:''} x="${f1(it.x+g)}" y="${f1(it.y+g)}" width="${f1(Math.max(2,it.w-2*g))}" height="${f1(Math.max(2,it.h-2*g))}" rx="1.5" style="--d:${dl(it).toFixed(2)}s"/>`});
 // the flow of each line in step order, routed like a conveyor: straight along the line's axis, square steps between
 // stations that sit slightly off it, and a dashed branch to a station that stands clear of the axis
 lk.forEach((ln,li)=>{const arr=lines[ln].slice().sort((a,b)=>a.r.step-b.r.step);if(arr.length<2)return;
  const xs=arr.map(a=>a.cx),ys=arr.map(a=>a.cy),hz=(Math.max(...xs)-Math.min(...xs))>=(Math.max(...ys)-Math.min(...ys));
  // work in "along/across" coordinates so one routine serves horizontal and vertical lines
  const A=it=>hz?{u:it.cx,v:it.cy,du:it.w/2,dv:it.h/2}:{u:it.cy,v:it.cx,du:it.h/2,dv:it.w/2};
  const XY=(u,v)=>hz?[u,v]:[v,u];
  const q=arr.map(A),axis=med(q.map(o=>o.v));
  const on=arr.filter((it,i)=>Math.abs(q[i].v-axis)<=q[i].dv+.5||Math.abs(q[i].v-axis)<6),off=arr.filter(it=>!on.includes(it));
  if(on.length<2)return;
  const Q=on.map(A),dir=Math.sign(Q[Q.length-1].u-Q[0].u)||1;
  // a station that contains the axis is passed straight through on it
  const vv=Q.map(o=>Math.abs(o.v-axis)<=o.dv-1?axis:o.v);
  let pts=[XY(Q[0].u-dir*(Q[0].du+3),vv[0])];
  for(let i=0;i<Q.length;i++){const p=XY(Q[i].u,vv[i]);if(i>0&&Math.abs(vv[i]-vv[i-1])>1.5){const gap0=Q[i-1].u+dir*Q[i-1].du,gap1=Q[i].u-dir*Q[i].du;const m=(gap0+gap1)/2;pts.push(XY(m,vv[i-1]),XY(m,vv[i]))}pts.push(p)}
  const L=Q[Q.length-1],end=XY(L.u+dir*(L.du+3),vv[vv.length-1]);pts.push(end);
  const d0=(.75+li*.12+arr[arr.length-1].r.step*.05).toFixed(2);
  s+=`<polyline class="hxf" points="${pts.map(p=>f1(p[0])+','+f1(p[1])).join(' ')}" pathLength="1" style="--d:${d0}s"/>`;
  const [ux,uy]=hz?[dir,0]:[0,dir],tx=end[0]+ux*7,ty=end[1]+uy*7,nx=-uy,ny=ux;
  s+=`<path class="hxa" style="--d:${d0}s" d="M${f1(tx)},${f1(ty)}L${f1(end[0]+nx*3.6)},${f1(end[1]+ny*3.6)}L${f1(end[0]-nx*3.6)},${f1(end[1]-ny*3.6)}Z"/>`;
  off.forEach(it=>{const o=A(it),sgn=Math.sign(o.v-axis)||1,a0=XY(o.u,axis),a1=XY(o.u,o.v-sgn*o.dv);s+=`<path class="hxb" style="--d:${d0}s" d="M${f1(a0[0])},${f1(a0[1])}L${f1(a1[0])},${f1(a1[1])}"/>`})});
 return {svg:s+'</svg>',S,its,height:wide?Math.round(maxH):0}}

// the 0–5–10 m scale bar of the hero rail, for S px per metre
export function hxScale(S){const L=10*S,M5=5*S,w=Math.ceil(L+22);
 return {width:w,viewBox:`-1 0 ${w} 22`,svg:`<rect x="0" y="5" width="${f1(M5)}" height="3.5"/><path d="M0,5h${f1(L)}v3.5h-${f1(L)}zM${f1(M5)},5v3.5"/><text x="0" y="20">0</text><text x="${f1(M5)}" y="20" text-anchor="middle">5</text><text x="${f1(L)}" y="20" text-anchor="middle">10 m</text>`}}

// ---------- 2D station map (footprints taken from the 3D hall models, drawn to scale) ----------
const wrap2=(s,max,lines)=>{const w=s.split(/\s+/);const out=[];let cur='';for(const x of w){const nx=cur?cur+' '+x:x;if(nx.length<=max)cur=nx;else{if(cur)out.push(cur);cur=x}}if(cur)out.push(cur);
 const res=out.slice(0,lines).map(l=>l.length>max?l.slice(0,Math.max(2,max-1))+'…':l);if(out.length>lines){const l=res[lines-1];res[lines-1]=(l.length>=max?l.slice(0,max-1):l)+'…'}return res};
const KCLS=r=>!r?'sup':r.kind==='na'?'na':r.kind==='shared'?'shared':!r.line?'sup':'ok';

// Hall envelope, drawn like the 3D hall (hall-kit.js): back, left and right walls with a steel column and its striped
// guard every bay, the cable tray, sprinkler main and air line along them, roll-up loading doors with hatched aprons
// and bollards, the fire exit, the personnel door, electrical boards, fire points, first aid, the wall clock, the open
// front, and the yellow zone round the machines with the hall's name on the floor.
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

// The map of hall h: returns {svg} or {svg:null} when the hall has no floor plan. Stations with a row carry data-r;
// the line-name pills are links to the line in 3D.
export function render2D(h){const m=H[h],M=MAP2D[h];
 if(!M||!M.floor)return {svg:null};
 const fl=M.floor;const ext={x0:Math.min(...M.items.map(i=>i[1])),x1:Math.max(...M.items.map(i=>i[2])),z0:Math.min(...M.items.map(i=>i[3])),z1:Math.max(...M.items.map(i=>i[4]))};
 const big=(fl.x1-fl.x0)>(ext.x1-ext.x0)+26||(fl.z1-fl.z0)>(ext.z1-ext.z0)+26;const cb=big?{x0:Math.max(fl.x0,ext.x0-2.5),x1:Math.min(fl.x1,ext.x1+2.5),z0:Math.max(fl.z0,ext.z0-3),z1:Math.min(fl.z1,ext.z1+2.5)}:{x0:fl.x0-.45,x1:fl.x1+.45,z0:fl.z0-.45,z1:fl.z1+.45};
 const rot=(cb.z1-cb.z0)>(cb.x1-cb.x0)*1.3;
 const Wm=rot?cb.z1-cb.z0:cb.x1-cb.x0,Dm=rot?cb.x1-cb.x0:cb.z1-cb.z0,HW=fl.x1-fl.x0,HD=fl.z1-fl.z0;
 const S=Math.max(15,Math.min(60,1240/Wm)),PX=40,PT=66,PB=50;
 const P=(x,z)=>rot?[PX+(z-cb.z0)*S,PT+(cb.x1-x)*S]:[PX+(x-cb.x0)*S,PT+(z-cb.z0)*S];
 const VW=Math.round(PX*2+Wm*S),VH=Math.round(PT+Dm*S+PB),fx=v=>v.toFixed(1);
 const its=M.items.map(([ri,x0,x1,z0,z1,nm])=>{const a=P(x0,z0),c=P(x1,z1);const x=Math.min(a[0],c[0])+1.5,y=Math.min(a[1],c[1])+1.5,w=Math.max(6,Math.abs(c[0]-a[0])-3),hh=Math.max(6,Math.abs(c[1]-a[1])-3);
  const r=ri>=0?D.rows[ri]:null;return {ri,r,nm:r?r.station:nm,x,y,w,h:hh,cx:x+w/2,cy:y+hh/2,k:KCLS(r)}});
 let s=`<svg class="m2" width="${VW}" height="${VH}" viewBox="0 0 ${VW} ${VH}" role="img" aria-label="2D station map of ${esc(m.name)}"><defs><pattern id="hatch2d" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect class="hp1" width="7" height="7"/><line class="hp2" x1="0" y1="0" x2="0" y2="7"/></pattern><pattern id="hatchYel" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" fill="#e3b82e" opacity=".85"/><line x1="0" y1="0" x2="0" y2="8" stroke="#1c1b18" stroke-width="3"/></pattern></defs>`;
 s+=`<text class="t2" x="${PX}" y="28">${esc(m.name)}</text><text class="dm" x="${PX}" y="48">Hall ${HW.toFixed(1)} m × ${HD.toFixed(1)} m · drawn to scale from the 3D model · grid 5 m${rot?' · turned 90° to fit the page':''}</text>`;
 s+=`<svg x="${PX}" y="${PT}" width="${fx(Wm*S)}" height="${fx(Dm*S)}" overflow="hidden">`;{const a=P(fl.x0,fl.z0),c=P(fl.x1,fl.z1);s+=`<rect class="fl" x="${fx(Math.min(a[0],c[0])-PX)}" y="${fx(Math.min(a[1],c[1])-PT)}" width="${fx(Math.abs(c[0]-a[0]))}" height="${fx(Math.abs(c[1]-a[1]))}" rx="2"/>`;s+=envelope2D(fl,ext,P,S,PX,PT,fx,m.name)}s+=`</svg>`;
 // 5 m grid, numbered in metres from the hall corner
 const ax=rot?['z',fl.z0,cb.z0,cb.z1]:['x',fl.x0,cb.x0,cb.x1],ay=rot?['x',fl.x0,cb.x0,cb.x1]:['z',fl.z0,cb.z0,cb.z1];
 for(let g=Math.ceil((ax[2]-ax[1])/5)*5;ax[1]+g<ax[3]-.3;g+=5){const x=PX+(ax[1]+g-ax[2])*S;s+=`<line class="gd" x1="${fx(x)}" y1="${PT}" x2="${fx(x)}" y2="${fx(PT+Dm*S)}"/><text class="gl" x="${fx(x)}" y="${PT-5}" text-anchor="middle">${g} m</text>`}
 for(let g=Math.ceil((ay[2]-ay[1])/5)*5;ay[1]+g<ay[3]-.3;g+=5){const y=rot?PT+(ay[3]-(ay[1]+g))*S:PT+(ay[1]+g-ay[2])*S;s+=`<line class="gd" x1="${PX}" y1="${fx(y)}" x2="${fx(PX+Wm*S)}" y2="${fx(y)}"/><text class="gl" x="${PX-5}" y="${fx(y+3)}" text-anchor="end">${g}</text>`}
 const sb=PT+Dm*S+26;s+=`<line class="sc" x1="${PX}" y1="${fx(sb)}" x2="${fx(PX+10*S)}" y2="${fx(sb)}"/><line class="sc" x1="${PX}" y1="${fx(sb-5)}" x2="${PX}" y2="${fx(sb+5)}"/><line class="sc" x1="${fx(PX+5*S)}" y1="${fx(sb-4)}" x2="${fx(PX+5*S)}" y2="${fx(sb+4)}"/><line class="sc" x1="${fx(PX+10*S)}" y1="${fx(sb-5)}" x2="${fx(PX+10*S)}" y2="${fx(sb+5)}"/><text class="dm" x="${fx(PX+10*S+8)}" y="${fx(sb+4)}">10 m</text>`;
 // stations
 s+=its.slice().sort((a,b)=>b.w*b.h-a.w*a.h).map(it=>{const r=it.r;const n=r&&r.line?String(r.step).padStart(2,'0'):'S';const fs=Math.max(9,Math.min(13,Math.min(it.w,it.h)*.3)),fs2=Math.max(8.5,Math.min(11,fs*.86));
  const room=it.w-8,maxc=Math.floor(room/(fs2*.6));const showName=it.h>=fs+fs2+10&&maxc>=4;const nm=it.k==='na'?(maxc>=13?'NOT AVAILABLE':'N/A'):(it.nm||'');
  const nl=showName?Math.max(1,Math.min(3,Math.floor((it.h-fs-8)/(fs2*1.2)))):0;const [l1='',l2='',l3='']=showName?wrap2(nm,maxc,nl):[];
  const ty=showName?it.y+fs+4:it.cy+fs*.36;const tip=r?`${r.line?lineName(r.hall,r.line)+' · step '+r.step:'Support equipment'}: ${r.station}\n${r.kind==='na'?'NOT AVAILABLE':r.name+(r.lot?' ('+r.lot+')':'')}`:(it.nm||'Support equipment');
  const clk=r&&r.kind!=='na';
  return `<g class="st ${it.k}"${clk?` data-r="${it.ri}" tabindex="0" role="button" aria-label="${esc(tip.replace('\n',' — '))}"`:''}><title>${esc(tip)}</title><rect x="${fx(it.x)}" y="${fx(it.y)}" width="${fx(it.w)}" height="${fx(it.h)}" rx="3"/><text class="sn" x="${fx(showName?it.x+5:it.cx)}" y="${fx(ty)}" ${showName?'':'text-anchor="middle"'} style="font-size:${fs.toFixed(1)}px">${n}</text>${showName?`<text class="sx" x="${fx(it.x+5)}" y="${fx(ty+fs2+3)}" style="font-size:${fs2.toFixed(1)}px">${esc(l1)}</text>`+(l2?`<text class="sx" x="${fx(it.x+5)}" y="${fx(ty+2*fs2+5)}" style="font-size:${fs2.toFixed(1)}px">${esc(l2)}</text>`:'')+(l3?`<text class="sx" x="${fx(it.x+5)}" y="${fx(ty+3*fs2+7)}" style="font-size:${fs2.toFixed(1)}px">${esc(l3)}</text>`:''):''}</g>`}).join('');
 // flow arrows in the gaps between consecutive stations, and line names
 const segHits=(p,q,o)=>{for(let k=1;k<10;k++){const x=p[0]+(q[0]-p[0])*k/10,y=p[1]+(q[1]-p[1])*k/10;if(x>o.x+1&&x<o.x+o.w-1&&y>o.y+1&&y<o.y+o.h-1)return true}return false};
 const exitPt=(b,dx,dy)=>{const tx=dx?(b.w/2)/Math.abs(dx):1e9,ty=dy?(b.h/2)/Math.abs(dy):1e9,t=Math.min(tx,ty);return [b.cx+dx*t,b.cy+dy*t]};
 const lines={};its.forEach(it=>{if(it.r&&it.r.line)(lines[it.r.line]=lines[it.r.line]||[]).push(it)});
 Object.entries(lines).forEach(([ln,arr])=>{arr.sort((a,b)=>a.r.step-b.r.step);
  for(let i=0;i<arr.length-1;i++){const a=arr[i],b=arr[i+1];let dx=b.cx-a.cx,dy=b.cy-a.cy;const L=Math.hypot(dx,dy);if(L<1)continue;dx/=L;dy/=L;
   const p=exitPt(a,dx,dy),q=exitPt(b,-dx,-dy);let gx=(p[0]+q[0])/2,gy=(p[1]+q[1])/2;const gap=(q[0]-p[0])*dx+(q[1]-p[1])*dy;
   if(gap<-2)continue;if(gap>10&&its.some(o=>o!==a&&o!==b&&segHits(p,q,o)))continue;
   if(gap>10)s+=`<line class="ar" x1="${fx(p[0]+dx*2)}" y1="${fx(p[1]+dy*2)}" x2="${fx(q[0]-dx*7)}" y2="${fx(q[1]-dy*7)}"/>`;
   const tip=gap>10?[q[0]-dx*1.5,q[1]-dy*1.5]:[gx+dx*5,gy+dy*5],nx=-dy,ny=dx;s+=`<path class="ah" d="M${fx(tip[0])},${fx(tip[1])}L${fx(tip[0]-dx*8+nx*4.5)},${fx(tip[1]-dy*8+ny*4.5)}L${fx(tip[0]-dx*8-nx*4.5)},${fx(tip[1]-dy*8-ny*4.5)}Z"/>`}
  const x0=Math.min(...arr.map(a=>a.x)),y0=Math.min(...arr.map(a=>a.y));const nm=lineName(h,+ln),tw=nm.length*7+14;const ly=Math.max(PT+2,y0-21);
  s+=`<a href="${hash3D(h,+ln)}"><title>Open ${esc(nm)} in 3D</title><rect class="lnb" x="${fx(x0)}" y="${fx(ly)}" width="${tw}" height="17" rx="8.5"/><text class="ln" x="${fx(x0+7)}" y="${fx(ly+12.5)}">${esc(nm)}</text></a>`});
 return {svg:s+'</svg>'}}

// the rows of hall h that the map does not draw (no footprint in MAP2D)
export function unplaced2D(h){const M=MAP2D[h];if(!M)return [];const placedIdx=new Set(M.items.map(i=>i[0]));return D.rows.map((r,i)=>[r,i]).filter(([r,i])=>r.hall===h&&!placedIdx.has(i))}
