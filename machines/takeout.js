// Yudo-Star MEGA / Giga cartesian take-out robots of the injection moulding machines (window.MB builder, kind
// takeoutRobot, see machines/ROBOTS.md). The robot is built free-standing on a riser frame (two Engel-green gusseted
// steel legs with mounting plates and a cross tie, as it would sit on the fixed platen): the traverse beam (aluminium
// profile with grooves, two linear rails, a toothed-belt cover, hazard-striped end caps, rubber end stops, the servo
// at the -x end and the idler cover at +x), the big grey energy chain in its tray on top of the beam, the traverse
// carriage (bearing blocks, riser column, chain bracket) carrying the crosswise kick beam with its own rails, chain
// tray, chain and front servo, the C-shaped kick carriage, the telescopic vertical arms (a main arm with the belt
// housing, a sliding inner arm on rails, the swivel unit and the aluminium EOAT with six bellows vacuum cups, ejector
// block and hoses; a sprue arm with a pneumatic sprue chuck) each with a vertical energy chain, the YUCON control
// cabinet (door, nameplate, main switch, e-stop, grille, lamp) and the YUCON handheld pendant with screen and yellow
// e-stop on a hook at the leg, cables and hoses, stickers and hazard stripes, and an optional maintenance platform
// with yellow railings and a ladder. Giga 4P = two traverse carriages (two main + two sprue arms). update() runs a
// take-out cycle (dive into the mould, lift, kick out and traverse to the drop position, swivel, release, return)
// and lays the three energy chains every frame. Origin at the floor centre, front towards +z, metres.
(function(){
'use strict';
const PI=Math.PI;
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const ease=u=>u<=0?0:u>=1?1:u*u*(3-2*u);
// keyframe channel [[t,v],...] → value at t with smoothstep between the keys
const chan=(kf,t)=>{if(t<=kf[0][0])return kf[0][1];for(let i=1;i<kf.length;i++){if(t<=kf[i][0]){const [t0,v0]=kf[i-1],[t1,v1]=kf[i];return v0+(v1-v0)*ease((t-t0)/Math.max(1e-6,t1-t0))}}return kf[kf.length-1][1]};
const LIB=new WeakMap();
// Helpers and materials made once per kit.
function lib(K){
 if(LIB.has(K))return LIB.get(K);
 const H=MB.H(K),P=H.P,M=K.M,T=K.THREE;
 const C={green:K.mat(0x8fc43c,.25,.55),greyFrame:K.mat(0x9da3a6,.5,.5),alu:K.mat(0xc4c8cb,.6,.42),aluDk:K.mat(0x4a5055,.4,.6),white:K.mat(0xeef0ef,.15,.5),
  cover:K.mat(0xe2e5e4,.2,.5),black:K.mat(0x1e2022,.3,.65),chain:K.mat(0x3a3d40,.08,.85),chainDk:K.mat(0x2a2c2f,.08,.85),tray:K.mat(0x7c8389,.6,.45),rail:K.mat(0xb8bdc0,.85,.3),
  belt:K.mat(0x202224,.05,.9),red:K.mat(0xc8322b,.2,.5),cab:K.mat(0xd9dcd9,.2,.5),cabDk:K.mat(0xb9bdbb,.2,.55),hoseB:K.mat(0x2f6fb0,.1,.6),rubber:K.mat(0x202123,.05,.9),
  yellow:K.mat(0xe3b82e,.2,.55),part:K.mat(0xf1efe6,.05,.5),cast:K.mat(0x8d9397,.5,.5),pendant:K.mat(0x3a3d41,.3,.6),lampG:P.lampG,steel:M.steel,dark:M.dark,bolt:K.mat(0x6b7075,.7,.4)};
 const grp=(parent,x,y,z)=>{const g=new T.Group();g.position.set(x,y,z);parent.add(g);return g};
 const plane=(parent,w,h,material,x,y,z,ry=0,rx=0)=>{const m=new T.Mesh(K.keep(new T.PlaneGeometry(w,h)),material);m.position.set(x,y,z);m.rotation.set(rx,ry,0);parent.add(m);return m};
 // yellow/black hazard stripes (texture per aspect ratio)
 const hazM={};const hazard=(parent,w,h,x,y,z,ry=0,rx=0)=>{const a=Math.max(1,Math.round(w/h*2)/2);if(!hazM[a]){const t=K.canvasTex(Math.round(64*a),64,(c,W,Hh)=>{c.fillStyle='#e3b82e';c.fillRect(0,0,W,Hh);c.fillStyle='#1c1b18';for(let x0=-Hh;x0<W+Hh;x0+=Hh){c.beginPath();c.moveTo(x0,0);c.lineTo(x0+Hh/2,0);c.lineTo(x0-Hh/2,Hh);c.lineTo(x0-Hh,Hh);c.closePath();c.fill()}});hazM[a]=K.mat(0xffffff,.1,.6,{map:t})}
  return plane(parent,w,h,hazM[a],x,y,z,ry,rx)};
 // the red YUDO logo on a white label
 const logoT=K.canvasTex(256,96,(c,W,Hh)=>{c.fillStyle='#f4f4f1';c.fillRect(0,0,W,Hh);c.fillStyle='#c8322b';c.font='800 62px "IBM Plex Sans", system-ui, sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('YUDO',W/2,Hh/2+2);c.fillRect(14,Hh-12,W-28,5)});
 const logoM=K.mat(0xffffff,.05,.55,{map:logoT});const logo=(parent,w,x,y,z,ry=0,rx=0)=>plane(parent,w,w*.375,logoM,x,y,z,ry,rx);
 // perforated cable tray texture
 const perfT=K.canvasTex(128,64,(c,W,Hh)=>{c.fillStyle='#8a9096';c.fillRect(0,0,W,Hh);c.fillStyle='#3a3f44';for(let x=8;x<W;x+=16)for(let y=8;y<Hh;y+=16)c.fillRect(x,y,8,5)});perfT.wrapS=perfT.wrapT=T.RepeatWrapping;
 const perfM=K.mat(0xffffff,.5,.5,{map:perfT});
 // Servo motor: square flange, housing, encoder cap, connector box with gland; built along +y from the flange and
 // turned by dir ('x+','x-','y+','y-','z+','z-').
 const motor=(parent,x,y,z,dir,r=.05,len=.16)=>{const g=grp(parent,x,y,z);K.box(r*2.3,.03,r*2.3,C.black,0,.015,0,g);K.cyl(r,len,C.black,0,.03+len/2,0,g,'y',20);K.cyl(r*.72,.035,C.dark,0,.03+len+.017,0,g,'y',16);
  K.box(r*1.2,.05,r*.9,C.dark,0,.03+len-.06,r*1.2,g);K.cyl(.009,.05,C.dark,0,.03+len-.06,r*1.65+.02,g,'z',8);K.box(r*1.2,.05,r*.9,C.dark,0,.03+len-.14,r*1.2,g);K.cyl(.009,.05,C.dark,0,.03+len-.14,r*1.65+.02,g,'z',8);
  for(const sx of[-1,1])for(const sz of[-1,1])K.cyl(.006,.012,C.bolt,sx*r*.9,.036,sz*r*.9,g,'y',6);
  g.rotation.set(...({'y+':[0,0,0],'y-':[0,0,PI],'x+':[0,0,-PI/2],'x-':[0,0,PI/2],'z+':[PI/2,0,0],'z-':[-PI/2,0,0]})[dir]);return g};
 // Energy chain: links along local x, the loop rising in local +y; lay(xf,xm,Lc) places the links for a fixed end at
 // xf, the moving end at xm (on the upper run) and a straight length Lc (lower + upper run).
 const chain=(parent,x,y,z,rot,pitch,w,hh,r,cap)=>{const g=grp(parent,x,y,z);g.rotation.set(rot[0],rot[1],rot[2]);const n=Math.ceil(cap/pitch)+2,links=[];
  for(let i=0;i<n;i++){const l=new T.Group();g.add(l);K.box(pitch*.9,hh*1.25,w*.14,C.chain,0,0,w*.43,l);K.box(pitch*.9,hh*1.25,w*.14,C.chain,0,0,-w*.43,l);K.box(pitch*.42,hh*.6,w*.9,C.chainDk,0,hh*.3,0,l);K.box(pitch*.42,hh*.6,w*.9,C.chainDk,0,-hh*.3,0,l);links.push(l)}
  const lay=(xf,xm,Lc)=>{const xb=xm+(Lc-(xm-xf))/2,lower=xb-xf,arc=PI*r;let i=0;for(const l of links){const s=(i+.5)*pitch;i++;if(s>Lc+arc){l.visible=false;continue}l.visible=true;
   if(s<lower){l.position.set(xf+s,0,0);l.rotation.z=0}else if(s<lower+arc){const th=(s-lower)/r;l.position.set(xb+r*Math.sin(th),r-r*Math.cos(th),0);l.rotation.z=th}else{l.position.set(xb-(s-lower-arc),2*r,0);l.rotation.z=PI}}};
  return {g,lay}};
 // U-channel tray along local x (floor under the lower run, walls at ±w/2), same rotation convention as chain.
 const tray=(parent,len,x,y,z,rot,w,hh)=>{const g=grp(parent,x,y,z);g.rotation.set(rot[0],rot[1],rot[2]);K.box(len,.012,w,C.tray,len/2,-hh/2-.012,0,g);for(const sz of[-1,1])K.box(len,hh*1.5,.012,C.tray,len/2,hh*.25-.006,sz*(w/2+.006),g);return g};
 // Bellows vacuum cup on a fitting, pointing to -z from the plate face at z=0.
 const cup=(parent,x,y,z)=>{K.cyl(.008,.03,C.steel,x,y,z-.015,parent,'z',8);K.cyl(.012,.012,C.bolt,x,y,z-.032,parent,'z',8);K.cyl(.02,.03,C.rubber,x,y,z-.052,parent,'z',14);K.torus(.02,.006,C.rubber,x,y,z-.046,parent,'z',16);K.torus(.02,.006,C.rubber,x,y,z-.06,parent,'z',16);K.cyl(.028,.006,C.rubber,x,y,z-.07,parent,'z',16,.022)};
 // A pendant-screen drawing (YUCON style)
 const pendantUI=label=>(c,W,Hh)=>{c.fillStyle='#10233b';c.fillRect(0,0,W,Hh);c.fillStyle='#1f6fb5';c.fillRect(0,0,W,Hh*.16);c.fillStyle='#ffffff';c.font=`700 ${Math.round(Hh*.11)}px "IBM Plex Sans", system-ui, sans-serif`;c.textBaseline='middle';c.fillText(label+'  AUTO',16,Hh*.08);
  const rows=[['X TRAVERSE','1250.0'],['Y KICK','320.5'],['Z VERTICAL','880.0'],['CYCLE','24.8 s']];c.font=`500 ${Math.round(Hh*.1)}px ui-monospace, monospace`;rows.forEach(([k,v],i)=>{c.fillStyle='#8fb4d8';c.fillText(k,16,Hh*.28+i*Hh*.15);c.fillStyle='#f2f2ee';c.textAlign='right';c.fillText(v,W-16,Hh*.28+i*Hh*.15);c.textAlign='left'});
  c.fillStyle='#3fa66b';c.fillRect(16,Hh*.88,W*.3,Hh*.09);c.fillStyle='#d8a531';c.fillRect(W*.37,Hh*.88,W*.3,Hh*.09);c.fillStyle='#c8312a';c.fillRect(W*.7,Hh*.88,W*.25,Hh*.09)};
 const L={H,P,M,T,C,grp,plane,hazard,logo,perfM,motor,chain,tray,cup,pendantUI};LIB.set(K,L);return L;
}

// ───────────────────────────── takeoutRobot ─────────────────────────────
MB.add('takeoutRobot',(K,s)=>{
 const Lb0=lib(K),{H,P,M,T,C,grp,plane,hazard,logo,perfM,motor,chain,tray,cup,pendantUI}=Lb0,g=new T.Group(),lamps=[];
 const name=String(s.name||''),txt=name+' '+String(s.note||'')+' '+String(s.type||'');
 const giga=/giga/i.test(txt);
 const o=Object.assign({arms:/4\s*p\b/i.test(txt)?4:2,platform:/platform|ladder|gantry frame/i.test(txt),frame:'green',cabinets:/cabinets/i.test(txt)?2:1},s.opts||{});
 const yuc=(txt.match(/yucon[-\s]?(\d{3})/ig)||[]).map(m=>'YUCON-'+m.replace(/\D/g,''));const cabModel=yuc[0]||(giga?'YUCON-700':'YUCON-400'),penModel=yuc[1]||yuc[0]||(giga?'YUCON-700':'YUCON-400');
 const modelM=txt.match(/(mega|giga)[-\s]?(\d{2,4})(?:[-\s]?(\d)\s*p)?/i);const model=modelM?`${modelM[1].toUpperCase()}-${modelM[2]}${modelM[3]?'-'+modelM[3]+'P':''}`:(giga?'GIGA':'MEGA');
 // sizes (metres): traverse length L along x, depth D along z, overall height Hh
 const L=clamp(+s.w||(modelM&&modelM[2].length===4?+modelM[2]/1000+.9:3),2.2,4.4),D=clamp(+s.d||1.5,1.1,2.2),Hh=clamp(+s.h||2.9,2.4,3.5);
 const zb=-D/2+.2,yb=Hh-1.35,Lb=L-.6,xl=L/2-.6,Vs=clamp(yb-.8,.4,.75),Vq=Math.max(.3,Vs-.2);
 const frameM=o.frame==='grey'?C.greyFrame:C.green;
 const nCar=o.arms>=4?2:1,offs=nCar===2?[-.62,.62]:[0],range=Math.max(.1,Lb/2-.3-(nCar===2?.62:0)),xH=-range*.85,xD=range*.85;
 const Dk=D-.25,zM=.3,zD=D-.75;

 // ── riser frame: two gusseted legs on base plates with anchor bolts, mounting plates, beam brackets, cross tie ──
 for(const sx of[-1,1]){const x=sx*xl,lg=grp(g,x,0,zb);
  K.box(.5,.03,.42,frameM,0,.015,0,lg);for(const ax of[-1,1])for(const az of[-1,1]){K.cyl(.014,.03,C.bolt,ax*.2,.04,az*.16,lg,'y',6);K.cyl(.02,.012,C.bolt,ax*.2,.03,az*.16,lg,'y',6)}
  K.box(.16,yb-.21,.16,frameM,0,.03+(yb-.21)/2,0,lg);K.box(.2,.02,.2,C.dark,0,.04,0,lg);
  K.box(.5,.03,.46,frameM,0,yb-.195,0,lg);K.box(.34,.03,.3,C.cast,0,yb-.165,0,lg);for(const ax of[-1,1])for(const az of[-1,1])K.cyl(.01,.012,C.bolt,ax*.14,yb-.144,az*.12,lg,'y',6);
  for(const ax of[-1,1]){const gu=K.box(.03,.42,.12,frameM,ax*.17,yb-.4,0,lg);gu.rotation.z=-ax*.42}for(const az of[-1,1]){const gu=K.box(.12,.4,.03,frameM,0,yb-.4,az*.17,lg);gu.rotation.x=az*.42}
  hazard(lg,.16,.34,0,.4,.087);hazard(lg,.16,.34,sx*.087,.4,0,sx*PI/2);H.warn(lg,0,1.05,.087,0,.1);K.plate(lg,'DO NOT STEP',.14,.04,0,.85,.087,'#e3b82e','#1c1b18')}
 K.box(2*xl-.16,.08,.06,frameM,0,yb-.7,zb,g);K.box(2*xl-.4,.06,.1,perfM,0,yb-.63,zb-.08,g);K.box(2*xl-.4,.03,.012,C.tray,0,yb-.615,zb-.136,g);
 H.hose(g,[[-xl+.1,yb-.6,zb-.08],[0,yb-.6,zb-.08],[xl-.1,yb-.6,zb-.08]],.01,P.black);

 // ── traverse beam ──
 const bm=grp(g,0,yb,zb);
 K.box(Lb,.26,.26,C.alu,0,0,0,bm);
 for(const sy of[-.045,.045])K.box(Lb-.02,.012,.008,C.aluDk,0,sy,.133,bm);for(const sy of[-.06,.06])K.box(Lb-.02,.012,.008,C.aluDk,0,sy,-.133,bm);for(const sz of[-.06,.06])K.box(Lb-.02,.008,.012,C.aluDk,0,-.133,sz,bm);
 for(const sy of[-.085,.085])K.box(Lb-.1,.024,.024,C.rail,0,sy,.142,bm);K.box(Lb-.2,.07,.016,C.belt,0,0,.138,bm);
 for(const sx of[-1,1]){K.box(.02,.28,.28,C.alu,sx*(Lb/2+.01),0,0,bm);hazard(bm,.26,.26,sx*(Lb/2+.027),0,0,sx*PI/2);K.cyl(.025,.04,C.rubber,sx*(range+.27),0,.17,bm,'x',12);K.box(.03,.06,.03,C.dark,sx*(range+.3),-.11,.17,bm)}
 // chain tray on the top (back half) with the big traverse chain, the fixed-end box and the end sensors
 K.box(Lb-.1,.012,.13,C.tray,0,.1365,-.065,bm);K.box(Lb-.1,.06,.012,C.tray,0,.172,-.121,bm);K.box(Lb-.1,.06,.012,C.tray,0,.172,-.003,bm);
 const xf=-(Lb/2-.1),Lc=range+Lb/2-.08+.25;const tc=chain(bm,0,.1665,-.065,[0,0,0],.07,.09,.035,.06,Lc+PI*.06+.1);
 K.box(.12,.1,.1,C.dark,xf-.05,.19,-.065,bm);K.cyl(.012,.06,C.dark,xf-.05,.19,-.14,bm,'z',8);
 for(const sx of[-1,1]){K.box(.03,.04,.03,C.dark,sx*(Lb/2-.35),.15,.09,bm);K.cyl(.006,.04,C.dark,sx*(Lb/2-.35),.17,.09,bm,'y',6)}
 // servo at the -x end (gearbox block + motor), idler cover at +x, junction box at the back
 K.box(.08,.2,.2,C.cast,-Lb/2-.05,0,0,bm);motor(bm,-Lb/2-.09,0,0,'x-',.055,.12);K.box(.06,.3,.22,C.cast,Lb/2+.05,0,0,bm);
 K.box(.2,.22,.1,C.dark,-Lb/2+.25,-.02,-.19,bm);for(let i=0;i<3;i++)K.cyl(.012,.04,C.steel,-Lb/2+.19+i*.06,-.15,-.19,bm,'y',8);K.plate(bm,'X1',.08,.03,-Lb/2+.25,.06,-.247,'#1c1b18','#ecebe5',PI);
 logo(bm,.26,-Lb/2+.5,.137,.06,0,-PI/2);logo(bm,.26,Lb/2-.5,.137,.06,0,-PI/2);logo(bm,.3,0,-.05,-.14,PI);K.plate(bm,'TRAVERSE  X',.3,.05,.6,.06,-.14,'#1c1b18','#ecebe5',PI);
 H.warn(bm,-Lb/2+.3,.137,.06,0,.08).rotation.x=-PI/2;H.warn(bm,Lb/2-.3,.137,.06,0,.08).rotation.x=-PI/2;

 // ── carriages: traverse carriage + kick beam + C carriage + arms ──
 const cars=[];
 for(const off of offs){const car=grp(g,off,yb,zb);
  K.box(.5,.34,.06,C.cast,0,0,.19,car);for(const sx of[-1,1])for(const sy of[-1,1]){K.box(.1,.05,.05,C.dark,sx*.17,sy*.085,.155,car);K.cyl(.006,.01,C.bolt,sx*.17,sy*.085,.225,car,'z',6)}
  K.box(.1,.05,.02,C.dark,0,0,.15,car);K.box(.44,.18,.2,C.cast,0,.26,.26,car);for(const sx of[-1,1])K.box(.02,.16,.26,C.cast,sx*.21,.26,.3,car);
  K.box(.06,.02,.31,C.dark,0,.33,.045,car);K.box(.06,.1,.02,C.dark,0,.3,-.08,car);H.warn(car,.16,-.08,.226,0,.07);K.plate(car,'A',.05,.04,-.16,-.08,.226,'#1c1b18','#ecebe5');
  // kick beam (along z) with grooves, side rails, belt cover, chain tray + chain, end caps, front gearbox and servo
  const zk=-.2+Dk/2;K.box(.18,.2,Dk,C.alu,0,.45,zk,car);for(const sy of[-.03,.03])for(const sx of[-1,1])K.box(.008,.012,Dk-.02,C.aluDk,sx*.093,.45+sy,zk,car);
  for(const sx of[-1,1])K.box(.024,.024,Dk-.1,C.rail,sx*.102,.45,zk,car);K.box(.06,.016,Dk-.2,C.belt,-.05,.558,zk,car);
  K.box(.12,.012,Dk-.1,C.tray,.035,.556,zk,car);for(const sx of[-.02,.09])K.box(.012,.05,Dk-.1,C.tray,sx,.585,zk,car);
  const zf=-.12,Lk=zD+.25;const kc0=chain(car,.035,.584,zf,[0,-PI/2,0],.06,.08,.03,.05,Lk+PI*.05+.1);
  K.box(.2,.22,.02,C.alu,0,.45,-.21,car);hazard(car,.18,.18,0,.45,-.227,PI);K.box(.14,.16,.06,C.cast,0,.45,-.2+Dk+.03,car);motor(car,0,.45,-.2+Dk+.06,'z+',.05,.11);
  for(const sx of[-1,1])hazard(car,.2,.06,sx*.099,.52,-.2+Dk-.16,sx*PI/2);K.plate(car,`YUDO-STAR ${model}`,.4,.05,.099,.52,zk,'#eceeee','#c8322b',PI/2);logo(car,.16,-.099,.52,zk,-PI/2);
  for(const z of[-.1,-.2+Dk-.3]){K.box(.03,.03,.04,C.dark,-.105,.52,z,car);K.cyl(.006,.03,C.dark,-.12,.52,z,car,'x',6)}
  H.hose(car,[[0,.33,-.1],[0,.36,-.16],[.0,.5,-.26],[.06,.56,-.16]],.009,P.black);
  // C carriage straddling the kick beam
  const kc=grp(car,0,.45,zM);
  for(const sx of[-1,1]){K.box(.03,.415,.3,C.cast,sx*.145,.0775,0,kc);for(const sz of[-1,1]){K.box(.04,.05,.08,C.dark,sx*.118,0,sz*.1,kc);K.cyl(.006,.01,C.bolt,sx*.165,.06+sz*.06,.1,kc,'x',6)}}
  K.box(.32,.03,.3,C.cast,0,.27,0,kc);K.box(.06,.07,.02,C.dark,.035,.225,-.13,kc);H.warn(kc,-.167,.18,.09,-PI/2,.06);K.plate(kc,'Y',.04,.04,.167,.2,.09,'#1c1b18','#ecebe5',PI/2);
  // main arm: outer frame with grooves and the belt housing on top, fixed bearing blocks at its foot, the inner arm
  // carrying its own rails, the swivel unit and the EOAT
  const ax=.23;K.box(.14,1.05,.14,C.alu,ax,.175,0,kc);for(const sz of[-.045,.045])K.box(.008,1.03,.012,C.aluDk,ax+.073,.175,sz,kc);for(const sx of[-.045,.045])K.box(.012,1.03,.008,C.aluDk,ax+sx,.175,-.073,kc);
  for(const sy of[-.3,-.22])K.box(.1,.06,.05,C.dark,ax,sy,.095,kc);for(const sx of[-1,1])for(const sy of[-.3,-.22])K.cyl(.006,.01,C.bolt,ax+sx*.035,sy,.125,kc,'z',6);
  K.box(.2,.2,.2,C.cover,ax,.8,0,kc);K.box(.21,.21,.004,C.dark,ax,.8,-.104,kc);K.cyl(.035,.05,C.black,ax,.925,0,kc,'y',16);K.cyl(.009,.05,C.dark,ax,.9,.12,kc,'z',8);H.hose(kc,[[ax,.9,.145],[ax+.1,.95,.12],[ax+.2,.9,.0]],.008,P.black);
  logo(kc,.14,ax,.8,.107);K.plate(kc,'YUDO-STAR',.16,.035,ax,.73,.107,'#1c1b18','#ecebe5');K.plate(kc,'Z',.04,.04,ax-.107,.8,0,'#1c1b18','#ecebe5',-PI/2);
  const inA=grp(kc,ax,0,.17);K.box(.1,1.15,.1,C.white,0,-.025,0,inA);for(const sx of[-.03,.03])K.box(.02,1.13,.012,C.rail,sx,-.025,-.056,inA);K.box(.12,.05,.12,C.cast,0,.525,0,inA);K.box(.12,.05,.12,C.cast,0,-.575,0,inA);
  K.cyl(.045,.14,C.cast,0,-.65,0,inA,'x',18);K.box(.06,.08,.06,C.cast,0,-.61,0,inA);K.cyl(.03,.02,C.dark,.08,-.65,0,inA,'x',12);K.cyl(.008,.04,C.hoseB,.1,-.65,.02,inA,'x',6);
  const sw=grp(inA,0,-.65,0);K.box(.06,.2,.04,C.cast,0,-.1,0,sw);K.box(.36,.3,.012,C.alu,0,-.3,-.03,sw);for(const sy of[-.2,-.4])K.box(.36,.02,.02,C.aluDk,0,sy,-.016,sw);K.box(.02,.3,.02,C.aluDk,0,-.3,-.016,sw);
  for(const cx of[-.12,0,.12])for(const cy of[-.24,-.36])cup(sw,cx,cy,-.036);
  K.box(.06,.05,.04,C.dark,-.15,-.19,.0,sw);K.cyl(.008,.03,C.steel,-.15,-.19,.03,sw,'z',8);K.cyl(.006,.01,P.lampG,-.12,-.19,.021,sw,'z',8);
  H.hose(sw,[[-.15,-.19,-.03],[-.16,-.22,-.045],[-.12,-.24,-.048],[.12,-.24,-.048]],.004,C.hoseB);H.hose(sw,[[-.14,-.19,-.03],[-.17,-.3,-.045],[-.12,-.36,-.048],[.12,-.36,-.048]],.004,C.hoseB);
  H.hose(inA,[[0,-.4,.05],[-.04,-.55,.06],[-.1,-.61,.03],[-.15,-.67,-.02]],.006,C.hoseB);
  const part=K.box(.24,.18,.1,C.part,0,-.3,-.14,sw);K.box(.2,.14,.02,C.part,0,-.3,-.198,sw);
  // vertical chain of the main arm in a tray on the +x face of the outer frame, its bracket riding with the inner arm
  const vc=chain(kc,ax+.1,.65,0,[0,0,-PI/2],.05,.07,.03,.05,.125+Vs+.25+PI*.05+.1);tray(kc,1.0,ax+.1,.65,0,[0,0,-PI/2],.07,.03);
  const vBr=K.box(.15,.03,.2,C.cast,0,0,0,kc);
  // sprue arm on the -x side: outer with fixed bearing blocks, belt housing, inner with rails, sprue chuck with two
  // fingers, its chain on the -x face
  const sx0=-.21;K.box(.1,.8,.1,C.alu,sx0,.05,0,kc);for(const sz of[-.03,.03])K.box(.008,.78,.01,C.aluDk,sx0-.053,.05,sz,kc);for(const sy of[-.28,-.2])K.box(.07,.05,.045,C.dark,sx0,sy,.07,kc);
  K.box(.15,.15,.15,C.cover,sx0,.52,0,kc);K.cyl(.028,.045,C.black,sx0,.615,0,kc,'y',14);K.cyl(.008,.04,C.dark,sx0,.55,.09,kc,'z',8);K.plate(kc,'SPRUE',.1,.03,sx0,.52,.082,'#1c1b18','#ecebe5');
  const inS=grp(kc,sx0,0,.13);K.box(.07,.9,.07,C.white,0,-.15,0,inS);for(const sx of[-.02,.02])K.box(.014,.88,.012,C.rail,sx,-.15,-.041,inS);K.box(.09,.04,.09,C.cast,0,.28,0,inS);
  K.box(.09,.05,.09,C.cast,0,-.62,0,inS);K.cyl(.024,.08,C.alu,0,-.68,0,inS,'y',14);K.cyl(.008,.03,C.hoseB,.03,-.65,0,inS,'x',6);
  const fg=[-1,1].map(f=>K.box(.012,.06,.02,C.steel,f*.02,-.75,0,inS));K.box(.012,.04,.012,C.dark,0,-.77,0,inS);
  const sc=chain(kc,sx0-.072,.45,0,[0,PI,-PI/2],.04,.05,.024,.04,.17+Vq+.25+PI*.04+.1);tray(kc,.78,sx0-.072,.45,0,[0,PI,-PI/2],.05,.024);
  const sBr=K.box(.17,.025,.14,C.cast,0,0,0,kc);
  cars.push({car,kc,inA,sw,part,inS,fg,vc,vBr,sc,sBr,kc0,Lk,off})}

 // ── YUCON control cabinet(s) ──
 const cabinet=(x,z,label)=>{const c=grp(g,x,0,z);K.box(.5,1.3,.32,C.cab,0,.69,0,c);H.feet(c,.5,.32,.04,.06,M.dark);
  H.door(c,.44,1.08,0,.74,.165,C.cab,false,1);K.box(.48,.03,.3,C.cabDk,0,1.355,0,c);K.cyl(.03,.05,P.lampG,.15,1.395,0,c,'y',12);K.cyl(.032,.012,C.dark,.15,1.376,0,c,'y',12);
  H.nameplate(c,s,0,1.2,.182,.36,.09);K.plate(c,label,.3,.06,0,1.1,.182,'#1f3a5f','#ffffff');logo(c,.16,-.12,.99,.182);
  K.cyl(.03,.02,C.red,.13,.99,.182,c,'z',16);K.box(.012,.05,.012,C.red,.13,.99,.195,c);H.estop(c,.0,.86,.186);K.plate(c,'MAIN',.08,.025,.13,.94,.182,'#1c1b18','#ecebe5');
  H.grille(c,.3,.12,0,.42,.182);H.grille(c,.3,.12,0,.26,.182);K.box(.3,.04,.012,C.dark,0,.6,.18,c);for(let i=0;i<4;i++)K.cyl(.006,.014,P.lampG,-.1+i*.06,.6,.188,c,'z',6);
  for(let i=0;i<3;i++)K.cyl(.012,.03,C.dark,-.12+i*.1,.12,-.17,c,'z',8);for(const sx of[-1,1])for(let i=0;i<6;i++)K.box(.008,.012,.2,C.dark,sx*.254,.5+i*.1,0,c);
  return c};
 const cab=cabinet(-L/2+.27,zb+.5,cabModel);if(o.cabinets>1)cabinet(L/2-.27,zb+.5,cabModel.replace(/\d+/,m=>String(+m+100)));
 lamps.push(cab.children.find(m=>m.material===P.lampG));
 // cables: cabinet → leg → beam junction box (power + signal), a pneumatic hose, clamps on the leg
 H.hose(g,[[-L/2+.27,1.37,zb+.42],[-L/2+.3,1.5,zb+.3],[-xl-.09,1.45,zb+.0],[-xl-.09,yb-.3,zb-.05],[-Lb/2+.25,yb-.17,zb-.21]],.012,P.black);
 H.hose(g,[[-L/2+.22,1.37,zb+.44],[-L/2+.24,1.52,zb+.32],[-xl-.11,1.47,zb+.02],[-xl-.11,yb-.32,zb-.03],[-Lb/2+.31,yb-.17,zb-.21]],.007,C.hoseB);
 for(const y of[yb-.5,1.0,.6])K.box(.04,.03,.03,C.dark,-xl-.095,y,zb-.02,g);
 H.hose(g,[[-L/2+.35,.06,zb+.34],[-L/2+.35,.06,zb+.1],[-xl-.09,.06,zb-.02],[-xl-.09,yb-.6,zb-.02]],.012,P.black);
 // ── YUCON pendant on a hook at the -x leg ──
 const hk=grp(g,-xl,1.2,zb+.08);K.box(.06,.03,.06,C.dark,0,.03,.03,hk);K.box(.06,.012,.03,C.dark,0,.045,.07,hk);K.box(.06,.04,.012,C.dark,0,.06,.08,hk);
 const pd=grp(g,-xl,1.0,zb+.125);K.box(.2,.3,.035,C.pendant,0,0,0,pd);K.box(.17,.26,.006,C.dark,0,0,.019,pd);H.screen(pd,0,.02,.012,.15,.11,pendantUI(penModel));H.estop(pd,.06,.115,.022);
 H.keypad(pd,-.0,-.085,.024,4,3,.018);K.box(.04,.08,.03,C.dark,.1,-.02,-.01,pd);K.box(.04,.1,.012,C.yellow,-.1,.0,-.01,pd);K.plate(pd,penModel,.11,.025,-.03,.115,.0235,'#1c1b18','#ecebe5');
 K.cyl(.012,.03,C.dark,0,-.16,0,pd,'y',8);const coil=[];for(let i=0;i<30;i++)coil.push([-xl+.03*Math.cos(i*.9),.82-i*.012,zb+.13+.03*Math.sin(i*.9)]);coil.push([-xl,.45,zb+.2],[-L/2+.55,.4,zb+.45]);H.hose(g,coil,.005,P.black);

 // ── maintenance platform behind the beam with railings, support posts and a ladder (gantry frame lots) ──
 if(o.platform){const Wp=2*xl-.3,zp=zb-.13-.45,yp=yb-.55;K.platform(g,Wp,.8,0,yp,zp,'nw');
  const er=grp(g,Wp/2,yp,zp);for(const z of[-.4,.4])K.box(.04,1.1,.04,M.yellow,0,.55,z,er);K.box(.04,.04,.5,M.yellow,0,1.05,-.15,er);K.box(.03,.03,.5,M.yellow,0,.55,-.15,er);K.box(.02,.12,.8,M.yellow,0,.06,0,er);
  for(const sx of[-1,1]){K.box(.1,yp-.08,.1,frameM,sx*(Wp/2-.1),(yp-.08)/2,zp-.3,g);K.box(.3,.02,.3,frameM,sx*(Wp/2-.1),.01,zp-.3,g);K.box(.3,.08,.44,frameM,sx*(xl-.1),yp-.1,zb-.3,g)}
  K.box(Wp-.2,.06,.06,frameM,0,yp-.11,zp-.37,g);K.box(Wp-.2,.06,.06,frameM,0,yp-.11,zp+.37,g);
  const lx=Wp/2+.12,lz=zp+.2;for(const sz of[-1,1])K.cyl(.02,yp+1.0,M.steel,lx,(yp+1.0)/2,lz+sz*.2,g,'y',10);for(let y=.3;y<yp;y+=.28)K.cyl(.012,.4,M.steel,lx,y,lz,g,'z',8);
  K.cyl(.012,.4,M.steel,lx,yp+1.0,lz,g,'z',8);K.box(.1,.02,.5,C.dark,lx,.01,lz,g);K.box(.16,.04,.44,M.steel,Wp/2+.06,yp-.04,lz,g);K.plate(g,'MAX 1 PERSON',.3,.05,lx+.021,1.2,lz,'#e3b82e','#1c1b18',PI/2)}

 // ── pose and animation ──
 const T0=12;
 const KX=[[0,xH],[3.8,xH],[6,xD],[8.3,xD],[11,xH],[12,xH]],KZ=[[0,zM],[3.8,zM],[5.6,zD],[8.3,zD],[10.5,zM],[12,zM]],
  KV=[[0,0],[.3,0],[1.6,1],[2.3,1],[3.6,0],[6,0],[6.8,.35],[7.6,.35],[8.3,0],[12,0]],KS=[[0,0],[5.2,0],[6.2,1],[7.6,1],[8.6,0],[12,0]],KF=[[0,0],[1.9,0],[2.2,1],[7.2,1],[7.5,0],[12,0]];
 const pose=t=>{const X=chan(KX,t),Z=chan(KZ,t),V=chan(KV,t),S=chan(KS,t),F=chan(KF,t);
  for(const c of cars){c.car.position.x=X+c.off;c.kc.position.z=Z;c.inA.position.y=-V*Vs;c.sw.rotation.x=-PI/2*S;c.part.visible=F>.5;c.inS.position.y=-V*Vq;
   c.fg[0].position.x=-.012-.012*(1-F);c.fg[1].position.x=.012+.012*(1-F);
   tc.lay(xf,X+c.off,Lc);c.kc0.lay(0,Z,c.Lk);c.vc.lay(0,.125+V*Vs,.125+Vs+.25);c.sc.lay(0,.17+V*Vq,.17+Vq+.25);
   c.vBr.position.set(.23+.14,.525-V*Vs,.09);c.sBr.position.set(-.21-.085,.28-V*Vq,.07)}};
 if(nCar===2)tc.lay(xf,xH+.62,Lc);pose(0);
 return {group:g,height:yb+1.35,lamps:lamps.filter(Boolean),update:(t,running)=>{if(running===false)return;pose(t%T0)}};
});
})();
