// layout.js — where everything stands in a hall, from the data alone (no three.js).
//
// layoutHall(hallKey, {D, MAP2D}) reads the hall's floor and the exact footprint of every placed row (MAP2D, as the old
// hall pages laid them out) and groups them into the hall's production lines:
//   {key, name, short, height, floor, zone, bounds, presets:{all, lines}, lines:[line], support:[station], props:[prop],
//    unplaced:[{row, rowIndex}], stats}
// line = {index (1-based), name, sub, stations, box, zBand:[z0,z1], xBand:[x0,x1], dir:{x,z} (flow direction, unit),
//         front:{x,z} (the side the operators and the camera stand on), straight, path:[{x,z}] (the conveyor the boards
//         or parts flow along), length, tokenY, preset:{p,t}, floorLabel:{x,z,rot}, sign:{x,z}, missing, shared}
// station = {row, rowIndex, box:{x0,x1,z0,z1,w,d,h,cx,cz}, step, status, s0, s1, s (position along the line's path)}
// The camera presets copy the old pages: a line is seen along its length from its front-left, at an angle and from
// above, so the whole line fits; the whole hall from the front-right, high (from the front-left for deep, narrow halls,
// like the old injection moulding page).
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
// The old pages' hall heights: SMT 7.2 m, injection moulding 10 m, press hardening 11 m, the others 8–11 m by width.
const HALL_HEIGHT={smt:7.2,imm:10,phs:11};
export const hallHeight=(key,floor)=>HALL_HEIGHT[key]||clamp(6+(floor.x1-floor.x0)*.06,8,11);
// Halls whose lines carry PCBs on an SMT-height conveyor (boards as tokens); the others move parts in totes.
export const BOARD_HALLS=new Set(['smt','led','prep','prog']);
// A station's height for the builders (they rise to about item.h): from the footprint, inside the hall.
const boxHeight=(w,d,H)=>clamp(1.2+Math.sqrt(w*d)*.35,1.7,H-1.6);
export const pad2=n=>String(n).padStart(2,'0');

export function layoutHall(key,{D,MAP2D}){
 const hall=D.halls[key],map=MAP2D[key];if(!hall||!map)return null;
 const floor={...map.floor},H=hallHeight(key,floor),W=floor.x1-floor.x0,Dp=floor.z1-floor.z0,cx=(floor.x0+floor.x1)/2,cz=(floor.z0+floor.z1)/2;
 const mkBox=(x0,x1,z0,z1)=>{const w=x1-x0,d=z1-z0;return {x0,x1,z0,z1,w,d,h:boxHeight(w,d,H),cx:(x0+x1)/2,cz:(z0+z1)/2}};
 const placedIdx=new Set();const stations=[],props=[];
 for(const it of map.items){const [ri,x0,x1,z0,z1,nm]=it;const box=mkBox(x0,x1,z0,z1);
  if(ri<0||!D.rows[ri]){props.push({name:nm||'Equipment',box});continue}
  const row=D.rows[ri];placedIdx.add(ri);stations.push({row,rowIndex:ri,box,step:row.step||0,status:row.kind,line:row.line||0})}
 // ---- lines ----
 const lines=hall.lines.map((ln,i)=>{const n=i+1;const st=stations.filter(s=>s.line===n).sort((a,b)=>a.step-b.step||a.box.cx-b.box.cx);
  if(!st.length)return {index:n,name:ln.name,sub:ln.sub||'',stations:[],missing:0,shared:0,empty:true};
  const x0=Math.min(...st.map(s=>s.box.x0)),x1=Math.max(...st.map(s=>s.box.x1)),z0=Math.min(...st.map(s=>s.box.z0)),z1=Math.max(...st.map(s=>s.box.z1));
  const a=st[0].box,b=st[st.length-1].box;let dx=b.cx-a.cx,dz=b.cz-a.cz;const dl=Math.hypot(dx,dz);
  if(dl<.5){dx=x1-x0>=z1-z0?1:0;dz=dx?0:1}else{dx/=dl;dz/=dl}
  // lines run along x in every hall; a line that runs along z keeps its direction and is seen from +x
  const alongX=Math.abs(dx)>=Math.abs(dz);const dir=alongX?{x:Math.sign(dx)||1,z:0}:{x:0,z:Math.sign(dz)||1};const front=alongX?{x:0,z:1}:{x:1,z:0};
  const zc=(z0+z1)/2,xc=(x0+x1)/2;
  // straight: every station centre on one axis (the SMT, LED, prep lines); otherwise the path visits each centre
  const straight=alongX?st.every(s=>Math.abs(s.box.cz-zc)<.8):st.every(s=>Math.abs(s.box.cx-xc)<.8);
  const pts=[];const lead=.7;
  if(straight){if(alongX){const sx=dir.x>0?x0-lead:x1+lead,ex=dir.x>0?x1+lead:x0-lead;pts.push({x:sx,z:zc},{x:ex,z:zc})}else{const sz=dir.z>0?z0-lead:z1+lead,ez=dir.z>0?z1+lead:z0-lead;pts.push({x:xc,z:sz},{x:xc,z:ez})}}
  else{const f=st[0].box,l=st[st.length-1].box;pts.push({x:f.cx-dir.x*(f.w/2+lead),z:f.cz-dir.z*(f.d/2+lead)});st.forEach(s=>pts.push({x:s.box.cx,z:s.box.cz}));pts.push({x:l.cx+dir.x*(l.w/2+lead),z:l.cz+dir.z*(l.d/2+lead)})}
  // arc length of each path vertex, and each station's interval along the path
  const cum=[0];for(let k=1;k<pts.length;k++)cum.push(cum[k-1]+Math.hypot(pts[k].x-pts[k-1].x,pts[k].z-pts[k-1].z));const length=cum[cum.length-1];
  st.forEach((s,k)=>{const half=(alongX?s.box.w:s.box.d)/2;let sc;
   if(straight)sc=alongX?(dir.x>0?s.box.cx-pts[0].x:pts[0].x-s.box.cx):(dir.z>0?s.box.cz-pts[0].z:pts[0].z-s.box.cz);else sc=cum[k+1];
   s.s=sc;s.s0=Math.max(0,sc-half);s.s1=Math.min(length,sc+half)});
  // the camera preset: from the front-left of the line, at an angle and from above, looking at the middle of the line
  const len=alongX?x1-x0:z1-z0,L=Math.max(len,8),depth=alongX?z1-z0:x1-x0;const start=alongX?{x:dir.x>0?x0:x1,z:zc}:{x:xc,z:dir.z>0?z0:z1};
  const back=Math.max(7.5,L*.42)+depth*.5,up=Math.max(4.8,L*.3);
  const p=[start.x+dir.x*len*.1+front.x*back,up,start.z+dir.z*len*.1+front.z*back],t=[start.x+dir.x*len*.52,1,start.z+dir.z*len*.52];
  if(alongX){t[2]=zc}else{t[0]=xc}
  // the floor label LINE 0n: on the floor before the first machine, along the line (or in front of it if the wall is near)
  let floorLabel;if(alongX){const fx=dir.x>0?x0-1.5:x1+1.5;floorLabel=(dir.x>0?fx-.4>floor.x0+.6:fx+.4<floor.x1-.6)?{x:fx,z:zc,rot:Math.PI/2}:{x:start.x+dir.x*1.4,z:z1+.75,rot:0}}
  else floorLabel={x:xc,z:dir.z>0?z0-1.5:z1+1.5,rot:0};
  const sign={x:start.x+dir.x*1.3,z:alongX?zc:start.z+dir.z*1.3};
  return {index:n,name:ln.name,sub:ln.sub||'',stations:st,box:{x0,x1,z0,z1},zBand:[z0,z1],xBand:[x0,x1],dir,front,straight,path:pts,cum,length,
   tokenY:BOARD_HALLS.has(key)?.95:1.05,board:BOARD_HALLS.has(key),preset:{p,t},floorLabel,sign,
   missing:st.filter(s=>s.status==='na').length,shared:st.filter(s=>s.status==='shared').length}});
 // ---- support equipment (rows without a line) ----
 const support=stations.filter(s=>!s.line).sort((a,b)=>a.box.cx-b.box.cx);
 const hallRows=D.rows.map((r,i)=>[r,i]).filter(([r])=>r.hall===key);
 const unplaced=hallRows.filter(([,i])=>!placedIdx.has(i)).map(([row,rowIndex])=>({row,rowIndex}));
 // ---- the zone round the machines (inside the walls, clear of the front walkway) ----
 let zone=null;if(stations.length||props.length){const all=[...stations.map(s=>s.box),...props.map(p=>p.box)];
  zone={x0:Math.max(floor.x0+1.4,Math.min(...all.map(b=>b.x0))),x1:Math.min(floor.x1-1.4,Math.max(...all.map(b=>b.x1))),z0:Math.max(floor.z0+1.4,Math.min(...all.map(b=>b.z0))),z1:Math.min(floor.z1-2.2,Math.max(...all.map(b=>b.z1)))}}
 // ---- the whole-hall preset ----
 const span=Math.max(W,Dp);const deep=Dp>W*1.6;
 const all=deep?{p:[floor.x0-W*.45,span*.42,floor.z1+Dp*.08],t:[cx,0,cz]}:{p:[cx+W*.2,Math.max(12,span*.62),floor.z1+span*.3],t:[cx,0,cz+Dp*.04]};
 const lineStations=stations.filter(s=>s.line);
 const stats={lines:hall.lines.length,stations:lineStations.length,placed:lineStations.filter(s=>s.status!=='na'&&s.status!=='shared').length,
  missing:lineStations.filter(s=>s.status==='na').length,shared:lineStations.filter(s=>s.status==='shared').length,support:hallRows.filter(([r])=>!r.line).length+props.length};
 return {key,name:hall.name,short:hall.short,desc:hall.desc,height:H,floor,zone,bounds:{...floor,W,D:Dp,cx,cz},presets:{all,lines:lines.map(l=>l.preset||null)},lines,support,props,unplaced,stats}}

// The point and direction at arc length s along a line's path (s wraps round the path's length).
export function pathAt(line,s){const P=line.path,C=line.cum;if(!P||P.length<2)return {x:0,z:0,dx:1,dz:0};s=((s%line.length)+line.length)%line.length;
 let k=1;while(k<C.length-1&&C[k]<s)k++;const a=P[k-1],b=P[k],seg=Math.max(1e-6,C[k]-C[k-1]),f=clamp((s-C[k-1])/seg,0,1);
 return {x:a.x+(b.x-a.x)*f,z:a.z+(b.z-a.z)*f,dx:(b.x-a.x)/seg,dz:(b.z-a.z)/seg}}
