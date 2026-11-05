// Detail pass over the factory-line library models the halls use (src 'plant' = FL.createPlantModels().machine(kind),
// src 'fl' = FL.builders[kind]). Those bodies are plain; MB.dress(kind, group, s, K) measures the finished group and
// stands real detail ON its surfaces: panel seams, hinged doors with handles and hinges, side grilles, keypads and
// e-stops beside the screen, the maker nameplate and a brand colour band, warning labels, feet, hoses, windows,
// exhaust stacks, safety fences, pendants, anchor pads and a cable drop, per kind (recipes below) or a generic kit.
// Nothing is rebuilt: parts are added to the group as children, placed from the group's own bounding box (front is
// +z, origin at the floor centre; children may be offset, so every position comes from the measured boxes). The
// pass never throws (each recipe and each step is wrapped) and never doubles up (group.userData.dressed).
(function(){
'use strict';
const MB=window.MB=window.MB||{kinds:{},add(k,f){this.kinds[k]=f},has(k){return !!this.kinds[k]},build(k,K,s){return this.kinds[k](K,Object.assign({opts:{}},s))}};
const R={};const PI=Math.PI;
const near=(a,b,e=.004)=>Math.abs(a-b)<e;

// ---------- measuring: every mesh's box in the group's own frame (the group may be positioned in the hall) ----------
function measure(group,K){
 const T=K.THREE;group.updateMatrixWorld(true);const inv=new T.Matrix4().copy(group.matrixWorld).invert();
 const bb=new T.Box3(),parts=[],tmp=new T.Box3();
 group.traverse(o=>{if(!o.isMesh||!o.geometry||o.visible===false)return;const geo=o.geometry;if(!geo.boundingBox)geo.computeBoundingBox();if(!geo.boundingBox||geo.boundingBox.isEmpty())return;
  tmp.copy(geo.boundingBox).applyMatrix4(o.matrixWorld).applyMatrix4(inv);const m=Array.isArray(o.material)?o.material[0]:o.material,tr=!!(m&&m.transparent&&m.opacity<.7);
  const b=tmp.clone(),sz=b.getSize(new T.Vector3());if(!isFinite(sz.x)||!isFinite(sz.y)||!isFinite(sz.z))return;
  parts.push({mesh:o,box:b,size:sz,vol:sz.x*sz.y*sz.z,tr,type:geo.type,p:geo.parameters||{},mat:m});if(!tr)bb.union(b)});
 if(bb.isEmpty())return null;return {bb,parts,size:bb.getSize(new T.Vector3())};
}

// ---------- the context: materials, face finder, and the part library bound to the group ----------
function context(K,H,g,s,m){
 const T=K.THREE,M=K.M,P=H.P,{bb,parts,size}=m;
 const solid=parts.filter(p=>!p.tr).sort((a,b)=>b.vol-a.vol),main=solid[0];
 const bodyHex=main&&main.mat&&main.mat.color?main.mat.color.getHex():0xe2dfd7;
 const shade=(hex,dl)=>{const c=new T.Color(hex);c.offsetHSL(0,0,dl);return c.getHex()};
 const mats={body:K.mat(bodyHex,.1,.6),door:K.mat(shade(bodyHex,-.03),.1,.55),trim:K.mat(0x45494e,.4,.5),seam:K.mat(0x3a3d40,.3,.7),panel:K.mat(0x34383c,.3,.6),
  console:K.mat(0xd9d9d3,.15,.55),mesh:K.mat(0x6d7378,.5,.5,{transparent:true,opacity:.4,depthWrite:false}),
  lampOn:K.mat(0x3fa66b,0,.4,{emissive:0x3fa66b,emissiveIntensity:1}),lampAmb:K.mat(0xd8a531,0,.4,{emissive:0xd8a531,emissiveIntensity:.9}),
  green:K.mat(0x2f7a3a,.2,.5),hoseR:K.mat(0x8a2e2a,.1,.7),hoseB:K.mat(0x2b4f8a,.1,.7)};
 const step=f=>{try{f()}catch(e){if(window.console)console.warn('dress step',e)}};
 // A face of the body: a solid part on that side that covers y0..y1 (or at least 60 % of it) and is at least minW wide;
 // the outermost one wins, but a much wider part within half a metre of it is preferred → {box, v, p, round}.
 const face=(y0,y1,minW=.5,side='front')=>{const pick=strict=>{const cands=[];for(const p of solid){const b=p.box;
    if(strict){if(b.min.y>y0+.03||b.max.y<y1-.03)continue}else{const ov=Math.min(b.max.y,y1)-Math.max(b.min.y,y0);if(ov<(y1-y0)*.6)continue}
    const wx=b.max.x-b.min.x,wz=b.max.z-b.min.z,wy=b.max.y-b.min.y;if(wy<.08)continue;
    if(side==='front'||side==='back'){if(wx<minW||wz<.015)continue;cands.push({v:side==='front'?b.max.z:-b.min.z,w:wx,box:b,p})}
    else{if(wz<minW||wx<.015)continue;cands.push({v:side==='right'?b.max.x:-b.min.x,w:wz,box:b,p})}}
   if(!cands.length)return null;const vmax=Math.max(...cands.map(c=>c.v));let best=null;for(const c of cands){if(c.v<vmax-.5)continue;if(!best||c.w>best.w*1.3||(c.w>best.w*.77&&c.v>best.v+.001))best=c}
   best.round=best.p.type==='CylinderGeometry'&&near(best.p.size.y,best.p.size.z,.06);return best};
  return side==='strict'?pick(true):(pick(true)||pick(false))};
 const faceStrict=(y0,y1,minW)=>{const cands=[];for(const p of solid){const b=p.box;if(b.min.y>y0+.03||b.max.y<y1-.03)continue;const wx=b.max.x-b.min.x,wz=b.max.z-b.min.z;if(b.max.y-b.min.y<.08||wx<minW||wz<.015)continue;cands.push({v:b.max.z,w:wx,box:b,p})}
  if(!cands.length)return null;const vmax=Math.max(...cands.map(c=>c.v));let best=null;for(const c of cands){if(c.v<vmax-.5)continue;if(!best||c.w>best.w*1.3||(c.w>best.w*.77&&c.v>best.v+.001))best=c}
  best.round=best.p.type==='CylinderGeometry'&&near(best.p.size.y,best.p.size.z,.06);return best};
 // A free height for a w×h plate on the face at z=fz round x: scanning down then up from the preferred y, away from
 // anything that already stands proud of that face there (windows, plates, screens, handles).
 const freeY=(fb,fz,x,w,h,prefY,extra=[])=>{const obs=parts.filter(p=>{const b=p.box;return b.max.z>fz+.004&&b.min.z<fz+.35&&b.max.x>x-w/2&&b.min.x<x+w/2&&b.max.y>fb.min.y&&b.min.y<fb.max.y}).map(p=>p.box).concat(extra);
  const lo=fb.min.y+h/2+.015,hi=fb.max.y-h/2-.015;if(lo>hi)return null;const ok=y=>!obs.some(b=>b.max.y>y-h/2-.015&&b.min.y<y+h/2+.015);
  for(let k=0;k<100;k++){const d=Math.ceil(k/2)*.025*(k%2?-1:1),y=prefY+d;if(y<lo||y>hi)continue;if(ok(y))return y}return null};
 // Tallest solid part with a real top to stand things on (boxes first).
 const topPart=(minW=.3)=>{let best=null;for(const p of solid){if(p.size.x<minW||p.size.z<minW)continue;const bx=p.type==='BoxGeometry';if(!best||(bx&&!best.bx)||(bx===best.bx&&p.box.max.y>best.box.max.y))best={bx,box:p.box,p}}return best};
 const hasTower=()=>parts.some(p=>p.type==='CylinderGeometry'&&p.p&&near(p.p.height,.07,.005)&&(near(p.p.radiusTop,.042,.003)||near(p.p.radiusTop,.028,.003)));
 const hasScreen=()=>parts.some(p=>{const mm=p.mat;return mm&&mm.emissive&&(mm.emissiveMap||[0x5a87b0,0x8fd1ff].includes(mm.emissive.getHex()))});
 const at=(x,y,z,ry=0,rx=0)=>{const f=H.grp(g,x,y,z,ry);if(rx)f.rotation.x=rx;return f};
 // Face-local parts (the face group's +z points out of the surface, its origin on the surface).
 const nameplate=(f,x,y,w,h=w/4)=>H.nameplate(f,s,x,y,.008,w,h);
 const band=(f,x,y,w,h=.06)=>H.logoBand(f,s,w,x,y,.008,h);
 const warn=(f,x,y,size=.11)=>H.warn(f,x,y,.009,0,size);
 const estop=(f,x,y)=>H.estop(f,x,y,.007);
 const keypad=(f,x,y,cols=4,rows=2,sz=.024)=>{K.box(cols*sz*1.5+.02,rows*sz*1.5+.02,.006,mats.panel,x,y,.003,f);H.keypad(f,x,y,.009,cols,rows,sz)};
 const buttons=(f,x,y,n=3)=>{const cols=[P.green,P.red,P.light,P.yellow];for(let i=0;i<n;i++){K.cyl(.016,.004,M.dark,x+i*.05,y,.004,f,'z',12);K.cyl(.012,.012,cols[i%4],x+i*.05,y,.009,f,'z',12)}};
 const keySwitch=(f,x,y)=>{K.cyl(.02,.008,M.dark,x,y,.004,f,'z',12);K.box(.006,.026,.012,M.steel,x,y,.012,f)};
 const screen=(f,x,y,w=.32,h=.21)=>H.screen(f,x,y,.014,w,h,H.card(s));
 const door=(f,w,h,x,y,glass=false,side=1)=>H.door(f,w,h,x,y,.016,mats.door,glass,side);
 const grille=(f,w,h,x,y)=>H.grille(f,w,h,x,y,.009);
 const pane=(f,w,h,x,y,m=P.tint)=>{K.box(w+.05,h+.05,.01,mats.trim,x,y,.005,f);const p=K.box(w,h,.006,m,x,y,.013,f);p.castShadow=false;return p};
 const seamH=(f,x,y,len)=>K.box(len,.006,.004,mats.seam,x,y,.002,f);
 const seamV=(f,x,y,len)=>K.box(.006,len,.004,mats.seam,x,y,.002,f);
 const plate=(f,text,w,h,x,y,bg,fg)=>K.plate(f,String(text),w,h,x,y,.009,bg,fg);
 const lampRow=(f,x,y,n,gap=.08,on=mats.lampOn)=>{K.box(n*gap+.02,.05,.008,mats.panel,x+(n-1)*gap/2,y,.004,f);for(let i=0;i<n;i++)K.box(.03,.022,.008,i%4===3?mats.lampAmb:on,x+i*gap,y,.011,f)};
 const handleV=(f,x,y,len=.2)=>H.handle(f,x,y,0,len,true);
 const vents=(f,x,y,w,n=6)=>{for(let i=0;i<n;i++)K.box(w,.01,.012,mats.seam,x,y+i*.03,.004,f)};
 // Free-standing parts.
 const pads=(box,inset=.1,r=.05)=>{for(const sx of[-1,1])for(const sz of[-1,1])K.cyl(r,.012,M.dark,sx>0?box.max.x-inset:box.min.x+inset,.006,sz>0?box.max.z-inset:box.min.z+inset,g,'y',14)};
 const anchors=(box,out=.04)=>{for(const sx of[-1,1])for(const sz of[-1,1]){const x=sx>0?box.max.x-.07+out:box.min.x+.07-out,z=sz>0?box.max.z-.07+out:box.min.z+.07-out;
   K.box(.2,.03,.2,M.steel,x,.015,z,g);K.cyl(.018,.05,M.dark,x+sx*.05,.045,z+sz*.05,g,'y',8);K.cyl(.018,.05,M.dark,x-sx*.05,.045,z-sz*.05,g,'y',8)}};
 const cableDrop=(box,r=.02)=>{const x=box.max.x-.2,z=box.min.z+.08,top=box.max.y,tx=box.max.x+.22,tz=box.min.z-.25;
  K.box(.1,.05,.12,M.dark,x,top+.025,z,g);K.pipe([[x,top+.03,z],[x,top+.28,z-.08],[tx,top+.2,tz],[tx,.3,tz],[tx,.08,tz]],r,P.hose,g);
  K.box(.34,.14,.22,M.dark,tx,.07,tz,g);K.box(.3,.02,.18,M.steel,tx,.145,tz,g);K.pipe([[tx-.16,.07,tz],[tx-.3,.07,tz],[tx-.3,.07,tz+.3]],r*.8,P.hose,g)};
 const stack=(x,y0,z,h=.6,r=.07)=>{K.cyl(r+.03,.02,M.dark,x,y0+.01,z,g,'y',16);K.cyl(r,h,M.steel,x,y0+h/2,z,g,'y',16);K.cyl(r+.025,.03,M.dark,x,y0+h-.08,z,g,'y',16);
  K.cyl(r+.06,.025,M.dark,x,y0+h+.05,z,g,'y',16,r+.02);for(let i=0;i<3;i++){const a=i/3*PI*2;K.cyl(.006,.06,M.steel,x+Math.cos(a)*(r+.02),y0+h+.02,z+Math.sin(a)*(r+.02),g,'y',6)}};
 const cap=(x,y,z,r)=>{K.cyl(r+.03,.03,M.dark,x,y+.02,z,g,'y',16);K.cyl(r+.06,.025,M.dark,x,y+.1,z,g,'y',16,r+.02);for(let i=0;i<3;i++){const a=i/3*PI*2;K.cyl(.006,.07,M.steel,x+Math.cos(a)*(r+.02),y+.065,z+Math.sin(a)*(r+.02),g,'y',6)}};
 const hose=(pts,r=.018,mm=P.hose)=>K.pipe(pts,r,mm,g);
 const towerIfNone=(x,y,z)=>hasTower()?null:H.lampTower(g,x,y,z,'g');
 // Control pendant: an arm out of a face at (x,y) carrying a panel with the catalogue screen, keypad and e-stop.
 const pendant=(f,x,y,reach=.42)=>{K.box(.05,.05,reach,M.dark,x,y+.34,reach/2,f);K.box(.08,.06,.08,M.dark,x,y+.34,.04,f);K.box(.05,.3,.05,M.dark,x,y+.18,reach-.025,f);
  const p=H.grp(f,x,y,reach+.07);K.box(.46,.6,.12,mats.console,0,0,0,p);K.box(.46,.6,.004,mats.trim,0,0,-.062,p);screen(p,-.02,.13,.34,.22);keypad(p,-.07,-.13,4,2,.022);estop(p,.15,-.13);buttons(p,-.17,-.26,3);return p};
 const text=`${s.type||''} ${s.name||''}`;
 return {K,T,M,P,H,g,s,bb,parts,solid,size,main,mats,text,step,face,faceStrict,freeY,topPart,hasTower,hasScreen,at,nameplate,band,warn,estop,keypad,buttons,keySwitch,screen,door,grille,pane,seamH,seamV,plate,lampRow,handleV,vents,pads,anchors,cableDrop,stack,cap,hose,towerIfNone,pendant};
}

// ---------- SMT line machines (FL line housings): cabinet + hood, screen on a pole, e-stop, tower ----------
const SMT=['loader','unloader','marker','cleaner','printer','spi','aoi','buffer'];
function smtCabinet(c){const {main,solid}=c;const cab=main.box,w=cab.max.x-cab.min.x,d=cab.max.z-cab.min.z,top=cab.max.y,x0=cab.min.x,x1=cab.max.x,xc=(x0+x1)/2,zf=cab.max.z,zb=cab.min.z,zc=(zf+zb)/2;
 let hoodTop=top;for(const p of solid)if(p.size.x>=w*.8&&p.box.max.y>hoodTop)hoodTop=p.box.max.y;return {cab,w,d,top,x0,x1,xc,zf,zb,zc,hoodTop}}
// The lower cabinet of every SMT / LED machine: header seam, hinged doors, side grilles, feet pads, nameplate in the header.
function smtLower(c,b,doors){const {at,step,door,seamH,grille,pads,nameplate,warn}=c;const {w,d,top,x0,x1,xc,zf,zc}=b;
 const F=at(xc,0,zf),dh=top-.38,dy=.16+dh/2;
 step(()=>{seamH(F,0,top-.2,w-.1);seamH(F,0,.12,w-.1)});
 step(()=>{const n=doors||Math.max(1,Math.round(w/.95)),dw=(w-.1)/n-.05;for(let i=0;i<n;i++){const x=x0-xc+.05+dw/2+i*(dw+.05);door(F,dw,dh,x,dy,false,n===1?1:(i<n/2?1:-1))}});
 step(()=>{const nw=Math.min(.45*w,.55);nameplate(F,x0-xc+.08+nw/2,top-.11,nw,.1);warn(F,x1-xc-.1,top-.11,.09)});
 step(()=>{for(const [x,ry] of[[x0-.009,-PI/2],[x1+.009,PI/2]]){const S=at(x,0,zc,ry);grille(S,Math.min(.4,d*.25),.26,-d*.12,top*.5);seamH(S,0,top-.2,d-.1)}});
 step(()=>pads(b.cab,.1));return F}
// Control column at the right of the hood front: e-stop, start / stop buttons, a key switch, a keypad.
function smtControls(c,b,hh){const {at,step,estop,buttons,keySwitch,keypad,K,mats}=c;const {x1,top,zf}=b;
 step(()=>{const C=at(x1-.075,top+hh/2+.02,zf);K.box(.13,hh-.08,.02,mats.console,0,0,-.004,C);K.box(.13,hh-.08,.004,mats.trim,0,0,-.014,C);
  estop(C,0,hh*.3);buttons(C,-.05,hh*.08,3);keySwitch(C,0,-hh*.12);keypad(C,0,-hh*.32,2,2,.022)})}
function smtHoodBand(c,b){const {at,step,band}=c;const {w,xc,zf,hoodTop}=b;step(()=>{const F=at(xc,0,zf);band(F,0,hoodTop-.045,w-.02,.08)})}
for(const id of SMT)R[id]=c=>{const b=smtCabinet(c),hh=id==='loader'||id==='unloader'?0:.52;
 smtLower(c,b);
 if(hh){smtControls(c,b,hh);smtHoodBand(c,b)}
 else{// loader / unloader: an open frame on the cabinet: control box on the front right post, band on the top frame beam
  c.step(()=>{const {at,K,mats,estop,buttons,keypad,band,H,s}=c;const {x1,top,zf,w,xc,hoodTop}=b;const C=at(x1-.12,top+.42,zf-.1);K.box(.18,.46,.12,mats.console,0,0,-.06,C);K.box(.18,.46,.004,mats.trim,0,0,-.122,C);
   estop(C,0,.14);buttons(C,-.05,.02,3);keypad(C,0,-.12,2,2,.022);
   const B=at(xc,0,zf-.125);band(B,0,hoodTop-.02,w-.3,.05);H.nameplate(B,s,0,hoodTop-.07,.008,Math.min(.5,w*.35),.07)})}
 if(id==='printer')c.step(()=>{const {at,pane,K,M}=c;const {x0,xc,top,zc,hoodTop}=b;
  const L=at(x0,0,zc,-PI/2);pane(L,.6,.26,.1,top+.28);K.plate(L,'STENCIL',.3,.06,.1,top+.08,.009,'#2b2d30','#ecebe5');
  const Tp=at(xc-.1,hoodTop,zc-.1,0,-PI/2);pane(Tp,.9,.5,0,0);
  K.box(.56,.05,.06,M.dark,xc-.1,hoodTop-.1,zc-.1,c.g);K.box(.5,.1,.012,M.steel,xc-.1,hoodTop-.17,zc-.07,c.g);
  for(const sx of[-1,1])K.box(.03,.03,.7,c.P.alu,xc-.1+sx*.36,top+.1,zc,c.g);for(const sz of[-1,1])K.box(.75,.03,.03,c.P.alu,xc-.1,top+.1,zc+sz*.34,c.g)});
 if(id==='spi'||id==='aoi')c.step(()=>{const {at,pane,towerIfNone,plate}=c;const {w,xc,x1,top,zf,zb,hoodTop}=b;const F=at(xc-.08,0,zf);pane(F,w-.32,.3,0,top+.3);
  plate(F,id.toUpperCase()+' · 3D',.2,.05,-w/2+.3,top+.1,'#2b2d30','#9fd0ff');towerIfNone(x1-.12,hoodTop,zb+.15)});
 if(id==='marker')c.step(()=>{const {at,plate,hose,K,M,P,warn,grille}=c;const {xc,top,zf,zb,zc,hoodTop}=b;const F=at(xc,0,zf);
  plate(F,'LASER · CLASS 4',.34,.07,-.1,top+.46,'#f2c21b','#1c1b18');warn(F,.16,top+.46,.09);
  K.cyl(.045,.06,M.dark,xc-.3,hoodTop+.03,zc-.3,c.g);hose([[xc-.3,hoodTop+.05,zc-.3],[xc-.3,hoodTop+.3,zc-.5],[xc-.3,hoodTop+.2,zb-.2],[xc-.3,.62,zb-.25]],.035,P.hose);
  K.box(.42,.6,.32,P.light,xc-.3,.3,zb-.25,c.g);K.box(.4,.06,.3,P.kick,xc-.3,.03,zb-.25,c.g);grille(at(xc-.51,0,zb-.25,-PI/2),.26,.2,0,.25);K.plate(c.g,'FUME EXTRACT',.3,.06,xc-.3,.5,zb-.42,'#2b2d30','#ecebe5',PI)});
 if(id==='cleaner')c.step(()=>{const {at,pane,hose,K,M,P,plate}=c;const {x0,x1,xc,zf,zc}=b;const F=at(xc,0,zf+.027);pane(F,.08,.3,x0-xc+.26,.42,P.glass);plate(F,'TANK',.12,.04,x0-xc+.26,.62,'#2b2d30','#ecebe5');
  K.cyl(.025,.03,M.steel,x1+.015,.5,zc+.3,c.g,'x',10);hose([[x1+.03,.5,zc+.3],[x1+.18,.42,zc+.36],[x1+.2,.05,zc+.55],[x1+.4,.04,zc+.6]],.02);K.cyl(.025,.03,M.steel,x1+.015,.42,zc+.2,c.g,'x',10);hose([[x1+.03,.42,zc+.2],[x1+.16,.32,zc+.22],[x1+.14,.05,zc+.1]],.016,c.mats.hoseB)});
 if(id==='buffer')c.step(()=>{const {at,plate,lampRow}=c;const {xc,top,zf,w}=b;const F=at(xc,0,zf);lampRow(F,-w/2+.2,top+.45,4,.07);plate(F,'BUFFER',.24,.06,-w/2+.42,top+.45,'#2b2d30','#ecebe5')});
};

// ---------- reflow oven: long body, zone window with 8 lamps, stacks, entrance / exit hoods, nitrogen panel ----------
R.reflow=c=>{const b=smtCabinet(c),{at,step,pane,lampRow,screen,keypad,estop,plate,stack,cap,parts,K,M,P,mats,grille}=c;const {w,d,top,x0,x1,xc,zf,zc,hoodTop}=b;
 const F=smtLower(c,b,Math.max(3,Math.round(w/.9)));
 step(()=>{const ww=w*.6,wx=.25;pane(F,ww,.2,wx,hoodTop-.3);lampRow(F,wx-ww/2+.08,hoodTop-.1,8,(ww-.16)/7);for(let i=0;i<8;i++)plate(F,'Z'+(i+1),.05,.035,wx-ww/2+.08+i*(ww-.16)/7,hoodTop-.155,'#2b2d30','#b9b7b0')});
 step(()=>{c.band(F,0,top-.025,w-.05,.05);const S=at(x0+.35,0,zf+.05);screen(S,0,hoodTop-.32,.36,.26);keypad(F,x0-xc+.35,top-.11,4,2,.022);estop(F,x0-xc+.62,hoodTop-.32);c.buttons(F,x0-xc+.52,hoodTop-.46,3)});
 step(()=>{const N=at(x1-.45,hoodTop-.3,zf);K.box(.34,.26,.02,mats.console,0,0,-.004,N);K.box(.34,.26,.004,mats.trim,0,0,-.014,N);for(const x of[-.09,.03]){K.cyl(.035,.012,M.white,x,.05,.012,N,'z',14);K.cyl(.03,.004,mats.trim,x,.05,.02,N,'z',14)}
  K.cyl(.02,.03,P.red,.11,.05,.012,N,'z',10);K.box(.03,.06,.01,M.dark,.11,.05,.03,N);plate(N,'N2',.1,.05,-.05,-.08,'#2b2d30','#ecebe5');K.cyl(.012,.3,M.steel,.11,-.25,.012,N,'y',8)});
 step(()=>{const old=parts.filter(p=>p.type==='CylinderGeometry'&&p.p&&near(p.p.radiusTop,.07,.003)&&near(p.p.height,.55,.01));
  if(old.length)for(const p of old){const bx=p.box;cap((bx.min.x+bx.max.x)/2,bx.max.y,(bx.min.z+bx.max.z)/2,.07)}
  else{stack(xc-w*.3,hoodTop,zc-d*.2,.6);stack(xc+w*.2,hoodTop,zc-d*.2,.6)}});
 step(()=>{for(const [x,sx] of[[x0,-1],[x1,1]]){K.box(.22,.2,1.0,mats.body,x+sx*.11,.98,zc,c.g);K.box(.24,.03,1.02,mats.trim,x+sx*.11,1.09,zc,c.g);K.box(.012,.14,.9,P.rubber,x+sx*.215,.98,zc,c.g);K.box(.2,.04,.02,P.yellow,x+sx*.11,1.04,zc+.5,c.g)}});
 step(()=>{for(const [x,ry] of[[x0-.009,-PI/2],[x1+.009,PI/2]]){const S=at(x,0,zc,ry);grille(S,.5,.3,0,hoodTop-.3);c.warn(S,.4,hoodTop-.3,.1)}});
 step(()=>{plate(F,'CAUTION · HOT',.4,.06,x1-xc-.75,hoodTop-.08,'#f2c21b','#1c1b18');c.warn(F,x1-xc-1.0,hoodTop-.08,.08)});
};

// ---------- LED hall plant kinds: process / tester / programmer (cabinet + hood with an XY head), curing oven ----------
for(const id of['process','tester','programmer'])R[id]=c=>{const b=smtCabinet(c),hh=id==='tester'?.48:id==='programmer'?.42:.6;const {at,step,H,K,M,P,plate}=c;const {w,x0,x1,xc,top,zf,zb,zc,hoodTop}=b;
 smtLower(c,b);smtControls(c,b,hh);smtHoodBand(c,b);
 step(()=>{H.cableChain(c.g,x0+.25,x1-.35,hoodTop+.02,zc-.35);K.box(.06,.05,.1,M.dark,x1-.33,hoodTop+.02,zc-.35,c.g);K.box(.06,.05,.1,M.dark,x0+.22,hoodTop+.02,zc-.35,c.g);K.pipe([[x0+.22,hoodTop+.02,zc-.35],[x0+.1,hoodTop+.02,zb-.05],[x0+.1,.3,zb-.08]],.012,P.hose,c.g)});
 step(()=>{const F=at(xc,0,zf);plate(F,{process:'PROCESS',tester:'TEST',programmer:'PROGRAMMER'}[id],.3,.06,-w/2+.3,top+hh-.1,'#2b2d30','#ecebe5');c.lampRow(F,-w/2+.5,top+hh-.1,3,.07)});
 step(()=>{if(id==='tester'){const S=at(x1+.009,0,zc,PI/2);c.pane(S,.5,.25,0,top+hh*.55)}});
};
R.oven=c=>{const b=smtCabinet(c),{at,step,H,K,M,pane,plate,cap,grille}=c;const {w,d,x0,x1,xc,top,zf,zb,zc}=b;const h=top;
 const F=at(xc,0,zf+.012);
 step(()=>{for(let i=0;i<3;i++){const x=-w/2+(i+.5)*w/3.4,dw=w/3.6;pane(F,dw*.5,.2,x,h*.42);H.hinge(F,x-dw/2+.02,h*.5,.022,3,h*.55);c.handleV(F,x+w/8,h*.5,.3);c.seamV(F,x-dw/2,h/2,h-.4);c.seamV(F,x+dw/2,h/2,h-.4);plate(F,'ZONE '+(i+1),.2,.05,x,h*.86,'#2b2d30','#ecebe5')}});
 step(()=>{const cx=w/2-w*.08;c.keypad(F,cx,h*.48,3,2,.022);c.estop(F,cx,h*.38);c.buttons(F,cx-.05,h*.3,3);const nw=Math.min(.45*w*.12+.12,.34);c.nameplate(F,cx,h*.2,nw,nw/3.2);c.warn(F,-w/2+.2,h*.25,.11);plate(F,'HOT SURFACE',.3,.05,-w/2+.45,h*.25,'#f2c21b','#1c1b18')});
 step(()=>{c.band(F,0,h-.1,w-.02,.07);c.seamH(F,0,.12,w-.1)});
 step(()=>{K.cyl(.09,.5,M.steel,xc+w*.1,h+.25,zc-d*.2,c.g,'y',16);K.cyl(.12,.02,M.dark,xc+w*.1,h+.01,zc-d*.2,c.g,'y',16);const old=c.parts.find(p=>p.type==='CylinderGeometry'&&p.p&&near(p.p.radiusTop,.09,.003)&&near(p.p.height,.6,.01));
  if(old){const bx=old.box;cap((bx.min.x+bx.max.x)/2,bx.max.y,(bx.min.z+bx.max.z)/2,.09)}
  K.pipe([[xc+w*.1,h+.45,zc-d*.2],[xc+w*.1,h+.9,zc-d*.2],[xc+w*.1,h+.9,zb-.1],[xc+w*.1,.6,zb-.12]],.07,M.steel,c.g)});
 step(()=>{for(const [x,ry] of[[x0-.009,-PI/2],[x1+.009,PI/2]]){const S=at(x,0,zc,ry);grille(S,.5,.3,0,h*.3);grille(S,.5,.3,0,h*.75)}c.pads(b.cab,.1)});
};

// ---------- IMM hall: Engel two-platen press, resin dryer, take-out / handling robot, control cabinet ----------
R.press=c=>{const {at,step,H,K,M,P,mats,hose,plate}=c;const bed=c.main.box,w=bed.max.x-bed.min.x,x0=bed.min.x,x1=bed.max.x,xc=(x0+x1)/2,zf=bed.max.z,bedH=bed.max.y,fx=xc-.6,top=bedH+1.95;
 const gx0=x0+.65,gx1=x0+3.95,gz=1.12,gm=(gx0+gx1)/2,green=mats.green;
 step(()=>{const F=at(xc,0,zf);c.band(F,0,bedH-.14,w-.2,.1);c.nameplate(F,gm-xc,bedH-.42,.9,.2);c.warn(F,x1-xc-.6,bedH-.42,.12);c.seamH(F,0,.12,w-.3);for(let i=1;i<6;i++)c.seamV(F,-w/2+i*w/6,bedH/2,bedH-.2)});
 step(()=>{// safety gate on the clamp side: posts, rails, two sliding leaves with a green lower panel and the window
  for(const x of[gx0,gm,gx1])K.box(.06,1.72,.06,mats.trim,x,bedH+.85,gz,c.g);K.box(gx1-gx0+.06,.06,.08,mats.trim,gm,bedH+1.7,gz,c.g);K.box(gx1-gx0+.06,.06,.08,mats.trim,gm,bedH+.03,gz,c.g);
  for(const [a,b2] of[[gx0,gm],[gm,gx1]]){const cx=(a+b2)/2,dw=b2-a-.1;K.box(dw,.62,.03,green,cx,bedH+.36,gz+.015,c.g);K.box(dw,.03,.03,mats.trim,cx,bedH+.68,gz+.02,c.g);K.box(dw,.03,.03,mats.trim,cx,bedH+1.62,gz+.02,c.g);
   H.handle(c.g,cx+(b2===gm?dw/2-.1:-dw/2+.1),bedH+.9,gz+.02,.3,true);c.warn(at(cx,0,gz+.03),-dw/2+.15,bedH+.5,.1);for(const y of[bedH+1.66,bedH+.07])K.cyl(.03,.04,M.dark,cx,y,gz+.05,c.g,'z',10)}
  plate(c.g,'ENGEL',.6,.14,gm,bedH+1.7,gz+.045,'#2f7a3a','#ffffff')});
 step(()=>{// pendant on an arm beside the control panel: mast, cross arm, drop, the panel with the catalogue screen
  const px=xc+1.2,pz=1.25,pt=bedH+.555;K.cyl(.025,.9,M.steel,px,pt+.45,pz,c.g,'y',10);K.box(.9,.04,.04,M.dark,px-.45,pt+.9,pz,c.g);K.cyl(.02,.35,M.dark,px-.85,pt+.72,pz,c.g,'y',8);
  const p=at(px-.85,pt+.33,pz+.06);K.box(.5,.62,.12,mats.console,0,0,0,p);K.box(.5,.62,.004,mats.trim,0,0,-.062,p);c.screen(p,-.02,.14,.36,.24);c.keypad(p,-.08,-.14,4,2,.022);c.estop(p,.16,-.14);c.buttons(p,-.19,-.26,3);
  const C=at(px,0,pz+.176);c.keypad(C,0,.95,4,3,.022);c.estop(C,.17,1.25);c.buttons(C,-.15,1.25,2);c.keySwitch(C,.17,1.1);plate(C,'CC300',.2,.05,0,.72,'#2b2d30','#ecebe5');c.warn(C,-.15,.5,.09)});
 step(()=>{// hopper lid and loader on the injection unit, sight glass, the material hose to the floor and a dryer line
  const hx=xc+3.25,hy=bedH+1.47;K.cyl(.25,.03,M.dark,hx,hy+.015,0,c.g,'y',20);K.cyl(.12,.22,M.white,hx,hy+.14,0,c.g,'y',16);K.cyl(.14,.03,M.dark,hx,hy+.26,0,c.g,'y',16);K.cyl(.06,.1,M.dark,hx,hy+.32,0,c.g,'y',10);
  const S=at(hx,hy-.25,.22);c.pane(S,.05,.3,0,0,P.glass);hose([[hx+.1,hy+.3,.05],[hx+.6,hy+.7,-.5],[hx+1.4,bedH+.6,-1.1],[hx+1.4,.1,-1.1]],.03,P.hose);
  hose([[hx-.3,hy-.15,-.15],[hx-.6,hy-.4,-.4],[hx-.6,bedH+.1,-.5]],.02,mats.hoseB)});
 step(()=>{// hydraulics: a manifold behind the bed, hoses from the clamp top down to it, pump lines along the back to the injection unit; mould clamps, cooling hoses, ejector box
  const mfx=xc+1.1;K.box(.6,.9,.35,M.dark,mfx,.45,-1.03,c.g);K.box(.56,.04,.3,M.steel,mfx,.92,-1.03,c.g);
  for(const [x,z,r,k] of[[fx+.1,-.9,.035,-.2],[fx-.1,-1.0,.035,0],[fx+.3,-.95,.025,.2]])hose([[x,top-.1,z],[x,top+.25,z-.2],[mfx+k,bedH+1.0,-1.1],[mfx+k,.9,-1.05]],r,c.mats.hoseR);
  hose([[mfx+.3,.7,-1.0],[xc+2.4,.6,-.9],[xc+3.6,.6,-.88],[xc+3.6,1.0,-.45]],.03,c.mats.hoseR);hose([[mfx+.3,.55,-1.0],[xc+2.6,.45,-.9],[xc+3.8,.45,-.88],[xc+3.8,1.0,-.45]],.03,mats.hoseB);
  const mx=fx-.45;for(const sy of[-.45,.45])for(const sz of[-.42,.42])K.box(.12,.08,.1,P.yellow,mx+.2,bedH+.975+sy,sz,c.g);for(const z of[.3,.42])hose([[mx,bedH+.6+z*.5,.56],[mx-.1,bedH+.3,.7],[mx+.3,bedH+.1,.8]],.015,z>.35?mats.hoseB:c.mats.hoseR);
  plate(c.g,'MOULD',.3,.06,mx,bedH+1.2,.561,'#2b2d30','#ecebe5');K.box(.3,.2,.12,M.dark,mx,bedH+1.4,.6,c.g)});
 step(()=>{c.anchors(bed,.02);const ix=xc+2.4;const F=at(ix,0,.456);c.band(F,0,bedH+.12,3.3,.07);plate(F,'INJECTION UNIT',.5,.06,-1.2,bedH+.3,'#2b2d30','#ecebe5');
  const E=at(x1-.4,0,.606);c.grille(E,.36,.22,0,bedH+.2);c.nameplate(E,.0,bedH+.62,.3,.075);c.cableDrop({max:{x:x1-.1,y:bedH+.9,z:.5},min:{x:x1-.8,y:0,z:-.6}},.02)});
};
R.dryer=c=>{const {at,step,H,K,M,P,mats,hose,plate,s,parts}=c;const hop=parts.filter(p=>p.type==='CylinderGeometry'&&p.size.y>.6).sort((a,b)=>b.vol-a.vol)[0];
 const hb=hop?hop.box:c.bb,hx=(hb.min.x+hb.max.x)/2,hz=(hb.min.z+hb.max.z)/2,r=(hb.max.x-hb.min.x)/2,hy0=hb.min.y,hy1=hb.max.y;
 const cb=c.solid.find(p=>p.type==='BoxGeometry'&&near(p.size.y,.7,.02)&&near(p.size.x,.42,.02));const cbx=cb?(cb.box.min.x+cb.box.max.x)/2:hx+r+.22,cby=cb?cb.box.min.y:.35,cbz=cb?cb.box.max.z:hz+.16,cbh=cb?cb.size.y:.7;
 step(()=>{K.cyl(r*.75,.08,M.white,hx,hy1+.08,hz,c.g,'y',20);K.cyl(r*.82,.02,M.dark,hx,hy1+.04,hz,c.g,'y',20);const hd=H.handle(c.g,hx,hy1+.12,hz-.18,.22,false);hd.rotation.x=-PI/2;
  K.cyl(.11,.24,M.white,hx,hy1+.25,hz,c.g,'y',16);K.cyl(.13,.03,M.dark,hx,hy1+.38,hz,c.g,'y',16);K.cyl(.05,.08,M.dark,hx,hy1+.43,hz,c.g,'y',10);
  hose([[hx+.08,hy1+.42,hz],[hx+.5,hy1+.55,hz-.3],[hx+.5,.2,hz-.5],[hx+.5,.05,hz-.7]],.028,P.hose)});
 step(()=>{const S=at(hx,(hy0+hy1)/2,hz+r);c.pane(S,.06,(hy1-hy0)*.6,0,0,P.glass);plate(S,'LEVEL',.14,.04,0,(hy1-hy0)*.36,'#2b2d30','#ecebe5');K.cyl(r+.006,.07,K.mat(H.brand(s.name),.2,.5),hx,hy0+(hy1-hy0)*.3,hz,c.g,'y',24)});
 step(()=>{K.cyl(.035,.03,M.steel,hx+r*.7,hy0+.35,hz-r*.7,c.g,'y',10);hose([[hx+r*.7,hy0+.35,hz-r*.7],[cbx,cby+cbh+.2,cbz-.3],[cbx,cby+cbh+.02,cbz-.2]],.03,mats.hoseR);
  hose([[hx+r*.75,hy1-.15,hz-r*.5],[cbx+.1,hy1+.1,cbz-.45],[cbx+.1,cby+cbh+.02,cbz-.35]],.03,mats.hoseB);K.box(.3,.12,.3,M.dark,cbx,cby+cbh+.06,cbz-.26,c.g)});
 step(()=>{const F=at(cbx,0,cbz+.012);c.screen(F,0,cby+cbh*.62,.3,.2);c.keypad(F,-.03,cby+cbh*.35,3,2,.022);c.estop(F,.14,cby+cbh*.35);c.nameplate(F,0,cby+cbh*.15,.32,.08);c.buttons(F,-.15,cby+cbh*.88,2);c.warn(F,.14,cby+cbh*.88,.07)});
 step(()=>{for(const p of c.solid)if(p.type==='BoxGeometry'&&near(p.size.y,1,.05)&&p.size.x<.06)K.cyl(.05,.012,M.dark,(p.box.min.x+p.box.max.x)/2,.006,(p.box.min.z+p.box.max.z)/2,c.g,'y',12);
  K.cyl(.02,.16,M.steel,hx-r*.6,hy0-.2,hz+r*.6,c.g,'y',8);K.cyl(.045,.03,M.white,hx-r*.6,hy0-.1,hz+r*.6,c.g,'z',12)});
};
R.robot=c=>{const {at,step,H,K,M,P,mats,hose,solid,bb}=c;const x0=bb.min.x,x1=bb.max.x,z0=bb.min.z,z1=bb.max.z;
 const ped=solid.find(p=>p.type==='BoxGeometry'&&near(p.size.y,.2,.01)&&near(p.size.x,p.size.z,.01)&&p.size.x>.3)||c.main;const pb=ped.box,px=(pb.min.x+pb.max.x)/2,pz=(pb.min.z+pb.max.z)/2,pw=pb.max.x-pb.min.x;
 const cab=solid.find(p=>p.type==='BoxGeometry'&&near(p.size.y,.85,.02)&&near(p.size.x,.45,.02));
 step(()=>{// three yellow fence panels (back, left, right): posts, rails, mesh, a sign
  const fh=1.6,post=(x,z)=>{K.box(.06,fh,.06,P.yellow,x,fh/2,z,c.g);K.box(.14,.012,.14,M.dark,x,.006,z,c.g)};
  const panel=(xa,za,xb,zb)=>{const len=Math.hypot(xb-xa,zb-za),cx=(xa+xb)/2,cz=(za+zb)/2,ry=Math.atan2(xb-xa,zb-za)-PI/2;const g2=at(cx,0,cz,ry);
   K.box(len,.04,.04,P.yellow,0,fh-.05,0,g2);K.box(len,.04,.04,P.yellow,0,.12,0,g2);K.box(len,.04,.04,P.yellow,0,fh*.5,0,g2);const m=K.box(len-.06,fh-.2,.012,mats.mesh,0,fh/2+.02,0,g2);m.castShadow=false;
   const n=Math.max(2,Math.round(len/.3));for(let i=1;i<n;i++)K.box(.012,fh-.2,.012,M.dark,-len/2+i*len/n,fh/2+.02,0,g2);return g2};
  const ix=.06,X0=x0+ix,X1=x1-ix,Z0=z0+ix,Z1=z1-ix;for(const [x,z] of[[X0,Z0],[X1,Z0],[X0,Z1],[X1,Z1]])post(x,z);post((X0+X1)/2,Z0);
  panel(X0,Z0,(X0+X1)/2,Z0);const pb2=panel((X0+X1)/2,Z0,X1,Z0);panel(X0,Z1,X0,Z0);panel(X1,Z0,X1,Z1);
  c.warn(pb2,-.1,1.25,.12);K.plate(pb2,'ROBOT CELL · KEEP OUT',.5,.08,.2,1.25,.02,'#f2c21b','#1c1b18')});
 step(()=>{// teach pendant on a hook on the controller, cable dress to the base, nameplate and band on the controller
  if(!cab)return;const cb=cab.box,cx=(cb.min.x+cb.max.x)/2,cz=cb.max.z,cy=cb.max.y;const F=at(cx,0,cz+.012);
  K.box(.04,.03,.05,M.dark,-.02,.57,.02,F);const pd=at(cx-.02,.42,cz+.035);K.box(.2,.28,.04,M.dark,0,0,0,pd);K.box(.14,.1,.004,P.glow,0,.05,.022,pd);K.cyl(.012,.02,P.red,.06,-.07,.022,pd,'z',10);K.cyl(.02,.004,P.yellow,.06,-.07,.02,pd,'z',10);H.keypad(pd,-.04,-.07,.022,3,2,.014);
  c.nameplate(F,0,.16,cab.size.x*.45,cab.size.x*.45/3);c.band(F,0,cy-.02,cab.size.x-.02,.03);c.estop(F,.15,.28);c.keySwitch(F,-.17,.28);
  K.cyl(.03,.03,M.steel,cb.min.x-.01,.35,cz-.2,c.g,'x',10);hose([[cb.min.x-.01,.35,cz-.2],[cb.min.x-.3,.1,cz-.1],[px+pw*.4,.08,pz+.1],[px+pw*.35,.21,pz+.1]],.02,P.hose);
  hose([[cb.min.x-.01,.3,cz-.25],[cb.min.x-.35,.08,cz-.3],[px+pw*.4,.06,pz-.1],[px+pw*.35,.21,pz-.1]],.016,mats.hoseB)});
 step(()=>{const F=at(px,0,pb.max.z+.012);c.nameplate(F,0,pb.max.y/2,Math.min(.5,pw*.45),Math.min(.5,pw*.45)/4.5);c.warn(at(px,0,pb.min.z-.012,PI),0,pb.max.y/2,.1);
  c.anchors(pb,.0);K.box(pw*.6,.02,pw*.6,M.dark,px,pb.max.y+.01,pz,c.g)});
};
R.cabinet=c=>{const {at,step,H,main,text}=c;const b=main.box,w=b.max.x-b.min.x,h=b.max.y,d=b.max.z-b.min.z,xc=(b.min.x+b.max.x)/2,zc=(b.min.z+b.max.z)/2,zf=b.max.z;const chiller=/chiller|cool|temperature|frigel/i.test(text);
 step(()=>{for(const [x,ry] of[[b.min.x-.009,-PI/2],[b.max.x+.009,PI/2]]){const S=at(x,0,zc,ry);c.grille(S,Math.min(.4,d*.6),.26,0,h*.3);if(!chiller)c.grille(S,Math.min(.4,d*.6),.2,0,h*.8)}});
 if(chiller)step(()=>{const F=at(xc,0,zf+.02);c.nameplate(F,0,h*.45,Math.min(.45*w,.5),Math.min(.45*w,.5)/4);c.band(F,0,h*.92,w-.04,.05);c.keypad(F,-w/4+.05,h*.68,3,2,.02);c.warn(F,w/2-.1,h*.38,.08);c.pads(b,.08)});
 else step(()=>{const F=at(xc,0,zf+.02);H.handle(F,w/2-.1,h*.5,.012,.3,true);H.hinge(F,-w/2+.055,h*.5,.012,3,h*.7);c.nameplate(F,.0,h*.55,Math.min(.45*w,.42),Math.min(.45*w,.42)/4);c.band(F,0,h*.88,w-.1,.05);
  c.keypad(F,-.05,h*.6,3,2,.02);c.vents(F,0,h*.26,w-.3,5);c.warn(F,w/2-.1,h*.72,.08);c.seamH(F,0,h-.3,w-.08);c.pads(b,.08)});
 step(()=>{c.cableDrop(b,.016)});
};

// ---------- heavy factory-line builders and anything else: the generic kit on the measured faces ----------
R.generic=c=>{const {at,step,face,faceStrict,freeY,topPart,bb,main,K,s}=c;
 const F0=faceStrict(1.0,1.45,.8)||faceStrict(.5,1.3,.5)||face(1.0,1.45,.8)||face(.5,1.3,.5)||(main&&{box:main.box,v:main.box.max.z});if(!F0)return;
 // a round body (a cylinder along x) is faced at its equator, where its surface reaches the box front
 const fb=F0.box,fw=fb.max.x-fb.min.x,fx=(fb.min.x+fb.max.x)/2,fz=fb.max.z;let fy=F0.round?(fb.min.y+fb.max.y)/2:Math.min(fb.max.y-.15,Math.max(fb.min.y+.15,1.3));
 const nw=Math.min(.45*fw,.9),nh=nw/4;
 // keep the plate clear of windows, screens, plates and handles already on that face
 if(!F0.round)fy=freeY(fb,fz,fx,nw,nh+.14,fy)||freeY(fb,fz,fx,nw,nh,fy)||fy;
 const used=[{min:{y:fy-nh/2-.02},max:{y:fy+nh/2+.02}}];// what the plate and band take on the face, kept clear by the other rows
 step(()=>{const F=at(fx,0,fz);c.nameplate(F,0,fy,nw,nh);let by=fy+nh/2+.06;if(by+.03>fb.max.y)by=fy-nh/2-.06;if(!F0.round&&by-.03>fb.min.y&&fb.max.y-fb.min.y>.5){c.band(F,0,by,fw-.08,.06);used.push({min:{y:by-.03},max:{y:by+.03}})}});
 step(()=>{const C=faceStrict(.85,1.2,.35)||face(.85,1.2,.35)||F0;const cb=C.box,cw=cb.max.x-cb.min.x,cx=(cb.min.x+cb.max.x)/2;const F=at(cx,0,cb.max.z);const ex=Math.min(cw/2-.12,.6),same=Math.abs(cb.max.z-fz)<.05&&cb.max.x>fx-nw/2&&cb.min.x<fx+nw/2;
  let ey=C.round?(cb.min.y+cb.max.y)/2:Math.min(cb.max.y-.08,Math.max(cb.min.y+.08,1.05));if(!C.round){const fy2=freeY(cb,cb.max.z,cx,2*ex+.12,.12,ey,same?used:[]);
   if(fy2===null){const ey2=freeY(cb,cb.max.z,cx,.1,.08,ey,same?used:[]);if(ey2!==null)c.estop(F,ex,ey2);return}ey=fy2}// a crowded face keeps its own controls; at most an e-stop joins them
  c.estop(F,ex,ey);c.keypad(F,ex-.22,ey,3,2,.02);c.warn(F,-ex,ey,.11);if(cw>1.6)c.buttons(F,ex-.45,ey,3)});
 step(()=>{const t=topPart(.3);if(t)c.towerIfNone(t.box.max.x-.15,t.box.max.y,t.box.min.z+.15)});
 step(()=>{const base=new c.T.Box3();for(const p of c.solid)if(p.box.min.y<.12&&p.size.x>.5&&p.size.z>.5)base.union(p.box);c.anchors(base.isEmpty()?bb:base,.03)});
 step(()=>{const t=topPart(.5)||main;c.cableDrop({max:{x:t.box.max.x,y:t.box.max.y,z:t.box.max.z},min:{x:t.box.min.x,y:0,z:Math.max(t.box.min.z,bb.min.z)}},.02)});
 step(()=>{if(c.hasScreen())return;const P2=face(1.1,1.6,.4)||F0;const pb=P2.box;let py=Math.min(1.35,pb.max.y-.45);if(Math.abs(pb.max.z-fz)<.05)py=Math.min(py,fy-nh/2-.42);py=Math.max(py,.65);c.pendant(at(pb.max.x-.3,0,pb.max.z),0,py,.42)});
 step(()=>{if(!/stampingPress|furnace|extruder|granulator|transformer|genset/.test(c.kind||''))return;if(fy-nh/2-.14<fb.min.y)return;const F=at(fx,0,fz);K.plate(F,String(s.type||'').toUpperCase()||'MACHINE',Math.min(fw-.2,nw),.08,0,fy-nh/2-.08,.009,'#2b2d30','#ecebe5')});
};
for(const k of['stampingPress','furnace','machiningCenter','grinder','cnc','lathe','welding','compressor','granulator','extruder','transformer','genset','mill','shredder','sorter','baler','tank','hobbing','coater','testbench','laser','autoclave','agv','pnp','colour','signal','safety'])if(!R[k])R[k]=R.generic;

MB.dress=function(kind,group,s,K){
 if(!group||!K||!K.THREE)return group;group.userData=group.userData||{};if(group.userData.dressed)return group;group.userData.dressed=kind||'generic';
 s=Object.assign({opts:{}},s||{});
 try{const H=MB.H(K),m=measure(group,K);if(!m)return group;const c=context(K,H,group,s,m);c.kind=kind;(R[kind]||R.generic)(c)}
 catch(e){if(window.console)console.warn('dress',kind,e)}
 return group;
};
MB.dress.kinds=Object.keys(R);
})();
