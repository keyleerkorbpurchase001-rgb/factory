// SMT board handling and factory conveyors for the plant portal (window.MB builders, see machines/KINDS.md).
// Kinds: pcbConveyor (opts.type connect|gateway|shuttle|dual), magazineLoader, magazineUnloader, ngSorter, boardFlipper,
// pcbBuffer (opts.weigh), coolingConveyor, turntable, lifterConveyor, beltConveyor (opts.incline), rollerConveyor,
// chainConveyor, transferConveyor. Built at the origin, floor y=0, operator front +z, length along x, real metres.
// The KI HEUNG FA machines are ivory sheet-metal cabinets in a silver aluminium edge frame with black recessed
// handles, a yellow MAIN POWER plate, a console with a small screen and an e-stop, levelling feet and a lamp tower.
(function(){
'use strict';
const H0=window.MB.H;
const LIB=new WeakMap();
// Helpers bound to one kit (materials are created once per kit).
function lib(K){
 if(LIB.has(K))return LIB.get(K);
 const H=H0(K),P=H.P,M=K.M,T=K.THREE;
 const cream=K.mat(0xe9e3d0,.08,.55),creamD=K.mat(0xd8d2bd,.08,.6),trim=K.mat(0xc8cbcd,.75,.3),white=K.mat(0xe6e4de,.1,.55),
  frameGrey=K.mat(0x3f454a,.45,.55),motorM=K.mat(0xb9bdc0,.7,.35),teal=K.mat(0x0b6e8a,.2,.5),tealGlass=K.mat(0x7fb7bf,.1,.1,{transparent:true,opacity:.35,depthWrite:false}),
  greenBelt=K.mat(0x2f8f6a,.05,.7),chainM=K.mat(0x6e7378,.6,.5),blackM=M.black;
 const L={H,P,M,T,cream,creamD,trim,white,frameGrey,motorM,teal,tealGlass,greenBelt,chainM};
 // Belt / chain textures (cloned per belt so each can scroll on its own).
 let beltT=null,chainT=null;
 L.beltTex=(chain=false)=>{let base=chain?chainT:beltT;
  if(!base){base=K.canvasTex(256,64,(c,W,Hh)=>{if(chain){c.fillStyle='#4a4f54';c.fillRect(0,0,W,Hh);c.fillStyle='#8d9296';for(let x=0;x<W;x+=16){c.fillRect(x+2,10,12,Hh-20);c.fillStyle='#2c2f32';c.fillRect(x+6,16,4,Hh-32);c.fillStyle='#8d9296'}}
   else{c.fillStyle='#232527';c.fillRect(0,0,W,Hh);c.strokeStyle='#30333a';c.lineWidth=2;for(let x=0;x<W;x+=16){c.beginPath();c.moveTo(x,0);c.lineTo(x,Hh);c.stroke()}c.fillStyle='#2e3134';for(let y=0;y<Hh;y+=8)c.fillRect(0,y,W,1)}});
   if(base){base.wrapS=base.wrapT=T.RepeatWrapping}if(chain)chainT=base;else beltT=base}
  if(!base)return null;const t=K.keep(base.clone());t.needsUpdate=true;t.wrapS=t.wrapT=T.RepeatWrapping;return t};
 // A scrolling belt (top face textured), len along x, w across z, top at y.
 L.belt=(parent,len,w,x,y,z,th=.03,chain=false)=>{const t=L.beltTex(chain);if(t)t.repeat.set(len/.16,Math.max(1,w/.16));
  const m=K.box(len,th,w,t?K.mat(0xffffff,.05,.85,{map:t}):(chain?chainM:P.belt),x,y-th/2,z,parent);return {mesh:m,tex:t,scroll:(v)=>{if(t)t.offset.x=-v}}};
 // Ivory cabinet in an aluminium edge frame: body w×h×d standing on levelling feet (y0 = underside height).
 L.cab=(parent,w,h,d,x,z,y0=.06,material=cream)=>{const g=H.grp(parent,x,0,z);K.box(w-.02,h-y0,d-.02,material,0,(h+y0)/2,0,g);
  for(const sx of[-1,1])for(const sz of[-1,1])K.box(.042,h-y0+.012,.042,trim,sx*(w/2-.015),(h+y0)/2,sz*(d/2-.015),g);
  for(const sy of[y0+.015,h-.015]){for(const sz of[-1,1])K.box(w-.06,.03,.03,trim,0,sy,sz*(d/2-.015),g);for(const sx of[-1,1])K.box(.03,.03,d-.06,trim,sx*(w/2-.015),sy,0,g)}
  H.feet(g,w,d,y0,.1);g.userData={w,h,d,zf:d/2-.01};return g};
 // Flat panel with a dark seam line round it on a face at +z.
 L.panel=(parent,w,h,x,y,z,material=cream)=>{K.box(w+.012,h+.012,.006,P.dark,x,y,z+.003,parent);return K.box(w,h,.012,material,x,y,z+.01,parent)};
 // KI HEUNG door: ivory panel, seam, black recessed slot handle, two hinges; win adds a tinted window.
 L.door=(parent,w,h,x,y,z,side=1,win=false,material=cream)=>{const g=H.grp(parent,x,y,z);K.box(w+.012,h+.012,.006,P.dark,0,0,.003,g);K.box(w,h,.016,material,0,0,.012,g);
  K.box(.024,.11,.012,blackM,side*(w/2-.06),-h*.05,.023,g);K.box(.012,.08,.004,K.mat(0x4a4d50,.3,.5),side*(w/2-.06),-h*.05,.031,g);
  H.hinge(g,-side*(w/2-.012),0,.026,2,Math.max(.2,h*.7));if(win){K.box(w*.6+.03,h*.45+.03,.004,P.dark,0,h*.12,.022,g);K.box(w*.6,h*.45,.008,P.tint,0,h*.12,.026,g).castShadow=false}return g};
 // Silver steel handle (the vertical swing handle of the big KFU doors).
 L.steelHandle=(parent,x,y,z)=>{K.box(.02,.16,.012,M.steel,x,y,z+.012,parent);K.cyl(.009,.03,M.steel,x,y+.06,z+.012,parent,'z',8);K.cyl(.009,.03,M.steel,x,y-.06,z+.012,parent,'z',8)};
 // MAIN POWER rotary switch on its yellow plate, with the green power lamp beside it.
 L.mainPower=(parent,x,y,z)=>{const g=H.grp(parent,x,y,z);K.box(.075,.075,.008,P.yellow,0,0,.004,g);K.cyl(.02,.014,P.red,0,0,.015,g,'z',14);K.box(.012,.034,.008,P.red,0,0,.026,g);
  K.plate(g,'MAIN POWER',.085,.022,0,-.058,.004,'#ecebe5','#1c1b18');K.cyl(.013,.008,M.dark,-.075,0,.004,g,'z',12);K.cyl(.009,.012,P.green,-.075,0,.012,g,'z',12);return g};
 // Small window box at the foot of the cabinet showing the air filter / regulator.
 L.sightBox=(parent,x,y,z)=>{const g=H.grp(parent,x,y,z);K.box(.15,.13,.06,creamD,0,0,.03,g);K.box(.11,.09,.03,P.screenBack,0,.005,.035,g);
  K.cyl(.012,.05,M.steel,-.02,0,.045,g,'y',10);K.cyl(.012,.05,M.steel,.02,0,.045,g,'y',10);K.cyl(.016,.012,M.dark,-.02,.03,.045,g,'y',10);K.cyl(.016,.012,M.dark,.02,.03,.045,g,'y',10);
  K.box(.12,.1,.006,P.glass,0,.005,.061,g).castShadow=false;K.box(.13,.11,.004,trim,0,.005,.058,g);for(const sy of[-1,1])K.cyl(.006,.02,M.dark,.07,sy*.03,.062,g,'z',8);return g};
 // Operator console: a tilted ivory box with the screen (catalogue card), e-stop and two buttons, on a face at +z.
 L.console=(parent,s,x,y,z,w=.3)=>{const g=H.grp(parent,x,y,z);g.rotation.x=-.45;K.box(w,.15,.06,cream,0,0,0,g);K.box(w+.012,.162,.004,P.dark,0,0,.03,g);
  H.screen(g,-w*.12,.005,.033+.0125,Math.min(.17,w*.5),.1,H.card(s));H.estop(g,w*.34,.0,.038);K.cyl(.009,.012,M.dark,-w*.42,.035,.038,g,'z',10);K.cyl(.0075,.014,P.green,-w*.42,.035,.04,g,'z',10);
  K.cyl(.009,.012,M.dark,-w*.42,-.035,.038,g,'z',10);K.cyl(.0075,.014,P.yellow,-w*.42,-.035,.04,g,'z',10);K.plate(g,'MASTER',.07,.016,-w*.42,-.062,.034,'#ecebe5','#1c1b18');return g};
 // 3-button conveyor control box.
 L.btnBox=(parent,x,y,z,ry=0)=>{const g=H.grp(parent,x,y,z,ry);K.box(.09,.16,.04,P.light,0,0,0,g);K.box(.096,.166,.004,P.dark,0,0,-.02,g);
  [[P.green,.045],[P.red,0],[P.yellow,-.045]].forEach(([m,yy])=>{K.cyl(.013,.01,M.dark,0,yy,.022,g,'z',12);K.cyl(.009,.012,m,0,yy,.028,g,'z',12)});return g};
 // Window with a dark frame and tinted pane on a face at +z.
 L.win=(parent,w,h,x,y,z,clear=false)=>{K.box(w+.04,h+.04,.006,P.dark,x,y,z+.003,parent);const p=K.box(w,h,.006,clear?P.glass:P.tint,x,y,z+.01,parent);p.castShadow=false;return p};
 // Sheet-metal panel w×h (centre x,y; face at +z of a group turned by ry) with real window cut-outs: wins=[{x,y,w,h}] in
 // panel coordinates, all windows in one row (same y, same h). The panel is built in pieces round the holes, each hole
 // gets a thin dark frame and a clear pane, so what is behind it stays visible.
 L.cutPanel=(parent,w,h,x,y,z,ry,wins,material=cream,th=.012)=>{const g=H.grp(parent,x,y,z,ry);if(!wins.length){K.box(w,h,th,material,0,0,0,g);return g}
  const ws=[...wins].sort((a,b)=>a.x-b.x),wy=ws[0].y,wh=ws[0].h,yb=wy-wh/2,yt=wy+wh/2;
  if(yb>-h/2+.001)K.box(w,yb+h/2,th,material,0,(yb-h/2)/2,0,g);if(yt<h/2-.001)K.box(w,h/2-yt,th,material,0,(yt+h/2)/2,0,g);
  let xe=-w/2;for(const o of ws){const xl=o.x-o.w/2;if(xl>xe+.001)K.box(xl-xe,wh,th,material,(xl+xe)/2,wy,0,g);xe=o.x+o.w/2}if(xe<w/2-.001)K.box(w/2-xe,wh,th,material,(w/2+xe)/2,wy,0,g);
  for(const o of ws){for(const sy of[-1,1])K.box(o.w+.03,.015,th+.008,P.dark,o.x,o.y+sy*(o.h/2+.0075),0,g);for(const sx of[-1,1])K.box(.015,o.h,th+.008,P.dark,o.x+sx*(o.w/2+.0075),o.y,0,g);
   K.box(o.w,o.h,.004,P.glass,o.x,o.y,0,g).castShadow=false}return g};
 // Interior light strip under a roof (emissive, so the inside of a cabinet reads through its windows).
 L.lightStrip=(parent,len,x,y,z)=>K.box(len,.01,.04,K.mat(0xf4f1e6,0,.5,{emissive:0xfff6dc,emissiveIntensity:.9}),x,y,z,parent).castShadow=false;
 // Lamp tower; lamps collected in arr.
 L.lamp=(parent,x,y,z,arr)=>{const r=H.lampTower(parent,x,y,z,'g');arr.push(...r.lamps);return r.group};
 // Two edge-belt rails along x (fixed back rail, adjustable front rail with lead screws and a hand wheel), belt top at y.
 L.rails=(parent,len,x,y,z,width=.35,opt={})=>{const g=H.grp(parent,x,y,z),hh=.06;
  for(const sz of[-1,1]){K.box(len,hh,.035,P.alu,0,-hh/2-.004,sz*width/2,g);K.box(len-.05,.01,.012,P.belt,0,-.007,sz*(width/2-.022),g);K.box(len,.008,.006,P.dark,0,-.03,sz*(width/2-.0175)+sz*.004,g);
   for(const sx of[-1,1])K.cyl(.02,.022,M.dark,sx*(len/2-.03),-.03,sz*(width/2-.03),g,'z',12)}
  for(const sx of[-1,1])K.box(.03,.03,width-.02,P.alu,sx*(len/2-.08),-hh-.019,0,g);
  if(opt.lead!==false){for(const sx of[-1,1])K.cyl(.007,width+.06,M.steel,sx*(len/2-.08),-hh/2-.004,.0,g,'z',8);
   K.cyl(.009,.1,M.steel,-(len/2-.08),-hh/2-.004,width/2+.08,g,'z',8);K.torus(.03,.006,M.dark,-(len/2-.08),-hh/2-.004,width/2+.13,g,'z',20);K.cyl(.006,.03,M.dark,-(len/2-.08)+.03,-hh/2-.004,width/2+.13,g,'z',8);
   K.box(len-.16,.012,.01,P.dark,0,-hh/2-.004,-width/2-.023,g);for(const sx of[-1,1])K.cyl(.018,.012,M.dark,sx*(len/2-.08),-hh/2-.004,-width/2-.023,g,'z',12)}
  if(opt.sensor!==false){K.box(.03,.04,.03,blackM,len*.2,.01,-width/2-.03,g);K.box(.008,.008,.006,P.led,len*.2,.018,-width/2-.046,g)}
  const pcb=opt.pcb===false?null:H.pcb(g,0,.004,0,Math.min(.3,len*.5),width-.07);return {g,pcb,len}};
 // Electric motor (grey ribbed cylinder, end cap, terminal box) with a gearbox block, along x.
 L.motor=(parent,x,y,z,r=.045,len=.14,ry=0)=>{const g=H.grp(parent,x,y,z,ry);K.cyl(r,len,motorM,0,0,0,g,'x',16);for(let i=0;i<4;i++)K.torus(r+.003,.004,M.dark,-len/2+.03+i*(len-.06)/3,0,0,g,'x',20);
  K.cyl(r*.8,.02,M.dark,len/2+.01,0,0,g,'x',14);K.box(r*1.3,r*.8,r*1.1,M.dark,0,r+.004,0,g);K.box(r*1.6,r*2.1,r*1.9,M.steel,-len/2-r*.8,0,0,g);return g};
 // Light-curtain post (yellow with black bands and the sensor strip to the front).
 L.lcPost=(parent,x,z,h,ry=0)=>{const g=H.grp(parent,x,0,z,ry);K.box(.07,.02,.07,M.dark,0,.01,0,g);K.box(.04,h-.02,.04,P.yellow,0,.01+(h-.02)/2,0,g);
  for(let i=0;i<4;i++)K.box(.046,.03,.046,blackM,0,.14+i*(h-.3)/3,0,g);K.box(.012,h-.25,.006,blackM,0,h/2+.02,.023,g);return g};
 // Levelling foot pads under a profile frame.
 L.pads=(parent,w,d,inset=.05)=>{for(const sx of[-1,1])for(const sz of[-1,1]){K.cyl(.03,.012,M.dark,sx*(w/2-inset),.006,sz*(d/2-inset),parent,'y',12);K.cyl(.01,.08,M.steel,sx*(w/2-inset),.05,sz*(d/2-inset),parent,'y',8)}};
 // Ribbed vent (slots) on a face at +z.
 L.vent=(parent,w,h,x,y,z)=>H.grille(parent,w,h,x,y,z+.007);
 // Yellow lot sticker.
 L.lot=(parent,s,x,y,z,ry=0)=>K.plate(parent,String(s.lot||''),.07,.045,x,y,z,'#f2d93a','#1c1b18',ry);
 LIB.set(K,L);return L;
}

// ───────────────────────────── pcbConveyor ─────────────────────────────
MB.add('pcbConveyor',(K,s)=>{
 const L=lib(K),{H,P,M,T}=L,g=new T.Group(),type=(s.opts&&s.opts.type)||'connect',lamps=[],parts=[];
 const cd=.8,hb=.9,gate=new T.Group(),carriage=new T.Group(),strut=new T.Group();let height=hb+.02,gl=.42,gx0=0,ax=0,ay=0;
 if(type==='gateway'){
  // KGC gateway: a tall closed ivory cabinet (lower door, board slot, two upper doors) beside the gate opening where the hinged
  // rail section lifts on a gas strut; light-curtain posts guard the opening and a yellow/black step plate lies in front of it.
  const cw=.64,cx=-.2,ch=1.3,c=L.cab(g,cw,ch,cd,cx,0),zf=c.userData.zf,px=cx+cw/2;
  L.door(c,cw-.16,.5,0,.42,zf,1);K.box(cw-.06,.012,.004,P.dark,0,.73,zf+.004,c);K.box(cw-.06,.012,.004,P.dark,0,.96,zf+.004,c);
  for(const sx of[-1,1])L.door(c,(cw-.2)/2,.26,sx*(cw-.2)/4,1.12,zf,sx);
  K.box(.3,.045,.004,P.screenBack,-.04,hb,zf+.004,c);K.box(.3,.004,.012,P.belt,-.04,hb-.02,zf+.006,c);
  L.mainPower(c,cw/2-.09,.84,zf+.02);H.nameplate(c,s,-.1,.84,zf+.02,.3,.07);L.lot(c,s,cw/2-.09,ch-.06,zf+.02);K.plate(c,'CE',.05,.05,cw/2-.08,.14,zf+.02,'#ecebe5','#1c1b18');
  H.logoBand(c,s,cw-.1,0,ch-.04,zf+.01,.03);H.warn(c,-cw/2+.1,ch-.1,zf+.02,0,.07);
  // hinge blocks on the cabinet side wall, the hinge pin, and the hinged section: rail pair, ivory tray and end lip.
  gx0=px+.025;gate.position.set(gx0,hb-.05,0);g.add(gate);
  for(const sz of[-1,1])K.box(.05,.1,.06,M.dark,px+.015,hb-.05,sz*.22,g);K.cyl(.015,.52,M.steel,gx0,hb-.05,0,g,'z',10);
  const r=L.rails(gate,gl,gl/2+.02,.05,0,.4,{lead:false,sensor:false});parts.push(r);
  K.box(gl+.02,.03,.52,L.cream,gl/2+.02,-.03,0,gate);for(const sz of[-1,1])K.box(gl+.02,.07,.012,L.cream,gl/2+.02,-.005,sz*.26,gate);K.box(.05,.1,.52,L.cream,gl+.045,0,0,gate);
  K.box(.04,.03,.44,P.alu,gl/2+.02,-.06,0,gate);K.box(.03,.04,.03,M.black,gl*.3,.06,-.23,gate);
  // gas strut: anchored on the cabinet side wall, its length and angle follow the section in update().
  ax=px+.0;ay=hb-.42;K.box(.03,.06,.05,M.dark,px+.005,ay,-.2,g);strut.position.set(ax,ay,-.2);g.add(strut);
  K.cyl(.013,.5,M.dark,0,.25,0,strut,'y',10);K.cyl(.007,1,M.steel,0,.5,0,strut,'y',8);K.sphere(.016,M.dark,0,1,0,strut,8);
  // light-curtain pair across the opening, the chequer step plate with its hazard stripe, and the sensor cable.
  L.lcPost(g,px+.04,cd/2+.07,1.1,Math.PI/2);L.lcPost(g,px+.54,cd/2+.07,1.1,-Math.PI/2);
  const plate=K.mat(0xd9d4c3,.35,.55);K.box(.5,.08,.4,plate,px+.29,.04,cd/2+.3,g);K.box(.5,.006,.4,P.light,px+.29,.083,cd/2+.3,g);
  K.box(.5,.014,.07,P.yellow,px+.29,.083,cd/2+.465,g);for(let i=0;i<4;i++)K.box(.06,.004,.07,M.black,px+.085+i*.136,.092,cd/2+.465,g);
  K.box(.5,.07,.004,P.yellow,px+.29,.045,cd/2+.502,g);for(let i=0;i<4;i++)K.box(.06,.07,.004,M.black,px+.085+i*.136,.045,cd/2+.505,g);
  H.hose(g,[[px+.54,.1,cd/2+.07],[px+.45,.08,cd/2+.2],[px+.2,.09,cd/2+.25],[px+.01,.12,cd/2+.1]],.006,P.cableB);
  height=ch;
 }else if(type==='shuttle'){
  // KSC shuttle: a long low ivory cabinet whose top deck has a recessed trough with the rails and the lifting carriage.
  const w=1.5,hc=.82,c=L.cab(g,w,hc,cd,0,0),zf=c.userData.zf;
  for(const sx of[-1,1])L.door(c,.6,.5,sx*.38,.36,zf,sx);K.box(.012,.64,.004,P.dark,0,.4,zf+.004,c);
  L.mainPower(c,-.68,.7,zf+.02);H.nameplate(c,s,-.3,.7,zf+.02,.3,.07);L.lot(c,s,.68,.7,zf+.02);L.sightBox(c,.68,.2,zf+.01);H.logoBand(c,s,.5,.2,.7,zf+.01,.03);
  const deck=K.mat(0xe9e3d0,.08,.55);for(const sz of[-1,1])K.box(w-.06,.05,.12,deck,0,hc+.025,sz*.31,g);for(const sx of[-1,1])K.box(.06,.05,.5,deck,sx*(w/2-.06),hc+.025,0,g);
  K.box(w-.18,.012,.5,P.screenBack,0,hc+.006,0,g);for(let i=0;i<3;i++)for(const sz of[-1,1])K.box(.3,.004,.07,P.screenBack,-.5+i*.5,hc+.052,sz*.31,g);
  for(const sx of[-1,1]){K.box(.04,.12,.04,P.alu,sx*.5,hc+.072,-.2,g);K.cyl(.008,.12,M.steel,sx*.5,hc+.072,-.14,g,'y',8)}
  L.motor(g,0,hc+.075,-.31,.025,.1,Math.PI/2);K.box(.06,.05,.06,M.dark,-.3,hc+.075,-.31,g);
  carriage.position.set(0,hb-.06,0);g.add(carriage);for(const sx of[-1,1])K.box(.06,.06,.07,M.dark,sx*.5,.0,-.17,carriage);K.box(1.06,.03,.05,P.alu,0,-.02,-.17,carriage);
  parts.push(L.rails(carriage,1.1,0,.06,.02,.4,{lead:false}));
  L.btnBox(g,w/2-.14,hc-.11,zf+.02);H.estop(g,-w/2+.14,hc-.11,zf+.006);H.warn(g,-w/2+.26,hc-.11,zf+.004,0,.06);
  height=hb+.06;
 }else{
  // Connection / dual conveyor: ivory cabinet, aluminium profile frame with the top covers and the drive, rails on top.
  const w=type==='dual'?1.1:.6,hc=.6,c=L.cab(g,w,hc,cd,0,0),zf=c.userData.zf;
  L.door(c,w-.24,.42,-.06,.33,zf,1);L.mainPower(c,w/2-.08,.42,zf+.02);L.sightBox(c,w/2-.08,.2,zf+.01);
  H.logoBand(c,s,w-.1,0,hc-.045,zf+.01,.035);H.nameplate(c,s,-w/2+.2,.12,zf+.02,.3,.07);L.lot(c,s,w/2-.12,hc-.05,zf+.02);H.warn(c,-w/2+.12,hc-.14,zf+.02,0,.06);
  for(const sx of[-1,1])for(const sz of[-1,1])K.box(.04,hb-hc-.07,.04,P.alu,sx*(w/2-.05),hc+(hb-hc-.07)/2,sz*(cd/2-.05),g);
  for(const sz of[-1,1])K.box(w-.06,.04,.04,P.alu,0,hb-.09,sz*(cd/2-.05),g);for(const sx of[-1,1])K.box(.04,.04,cd-.06,P.alu,sx*(w/2-.05),hb-.09,0,g);
  K.box(w-.14,.012,cd*.42,L.cream,0,hb-.064,-cd*.27,g);K.box(w-.14,.012,.1,L.cream,0,hb-.064,cd/2-.1,g);
  L.motor(g,w*.1,hb-.17,-.02,.035,.11);K.box(.08,.06,.08,M.dark,-w*.2,hb-.17,-.02,g);H.hose(g,[[w*.1,hb-.2,-.06],[w*.1,hc+.05,-.2],[w*.1,hc-.01,-.2]],.008);
  const lanes=type==='dual'?[-.2,.2]:[0.02],lw=type==='dual'?.3:.4;for(const z of lanes)parts.push(L.rails(g,w-.1,0,hb,z,lw));
  // Control box and e-stop on bracket plates screwed to the front posts; sensor cable; lamp tower on the dual conveyor.
  const zp=cd/2-.03;K.box(.13,.2,.012,L.creamD,w/2-.1,hb-.15,zp+.006,g);L.btnBox(g,w/2-.1,hb-.15,zp+.012+.02);
  K.box(.1,.12,.012,L.creamD,-w/2+.1,hb-.13,zp+.006,g);H.estop(g,-w/2+.1,hb-.13,zp+.012+.006);
  H.hose(g,[[w*.2-.2,hb+.01,-lw/2-.03-.15*(type==='dual'?1:0)],[w*.2-.2,hb-.1,-cd/2-.02],[w*.2-.2,hc+.02,-cd/2-.02]],.005,P.cableB);
  if(type==='dual')L.lamp(g,-w/2+.1,hc-.1,-cd/2+.1,lamps);
  height=type==='dual'?hc+.52:hb+.02;
 }
 const ease=u=>(1-Math.cos(Math.min(1,Math.max(0,u))*Math.PI))/2;
 const poseStrut=()=>{const lx=gl*.62,ly=-.06,cs=Math.cos(gate.rotation.z),sn=Math.sin(gate.rotation.z),dx=gx0+lx*cs-ly*sn-ax,dy=(hb-.05)+lx*sn+ly*cs-ay;strut.rotation.z=Math.atan2(-dx,dy);strut.scale.y=Math.hypot(dx,dy)};
 if(type==='gateway')poseStrut();
 const root=new T.Group();root.add(g);g.updateMatrixWorld(true);{const bb=new T.Box3().setFromObject(g);g.position.x=-(bb.min.x+bb.max.x)/2;g.position.z=-(bb.min.z+bb.max.z)/2}
 return {group:root,height,lamps,update:(t,run)=>{if(run===false)return;
  let open=0;if(type==='gateway'){const ph=(t*.4)%4;open=ph<1?ease(ph):ph<2?1:ph<3?1-ease(ph-2):0;gate.rotation.z=open*1.05;poseStrut()}
  if(open<.01)for(const p of parts){const tr=p.len-.3;if(p.pcb&&tr>.05)p.pcb.position.x=((t*.25)%tr)-tr/2}
  if(type==='shuttle')carriage.position.y=hb-.06+.05*(.5+.5*Math.sin(t*.9))}};
});

// ───────────────────────── magazine loader / unloader ─────────────────────────
function magazineMachine(K,s,unload){
 const L=lib(K),{H,P,M,T}=L,g=new T.Group(),lamps=[],dir=unload?-1:1,X=x=>dir*x,dual=!!(s.opts&&s.opts.dual);
 const hb=.9,hc=.75,D=1.0;
 // Magazine section: lower cabinet (door with the silver handle), upper frame with windows on front and outer side.
 const mw=.64,mx=X(-.29);const mc=L.cab(g,mw,hc,D,mx,0),zf=mc.userData.zf;L.door(mc,mw-.14,.56,0,.4,zf,dir,false);L.steelHandle(mc,X(mw/2-.1),.38,zf+.012);
 H.nameplate(mc,s,0,.16,zf+.02,.34,.08);L.lot(mc,s,X(-mw/2+.1),hc-.07,zf+.02);
 const uh=.8;for(const sx of[-1,1])for(const sz of[-1,1])K.box(.04,uh,.04,P.alu,mx+sx*(mw/2-.02),hc+uh/2,sz*(D/2-.02),g);
 for(const sz of[-1,1])K.box(mw-.04,.04,.04,P.alu,mx,hc+uh-.02,sz*(D/2-.02),g);for(const sx of[-1,1])K.box(.04,.04,D-.04,P.alu,mx+sx*(mw/2-.02),hc+uh-.02,0,g);
 // Front and outer side panels have real window cut-outs (clear panes), so the magazine elevator inside is seen; light strip under the roof.
 L.cutPanel(g,mw-.06,uh-.06,mx,hc+uh/2,D/2-.03,0,[{x:-.14,y:.42-uh/2,w:.2,h:.3},{x:.14,y:.42-uh/2,w:.2,h:.3}]);K.box(mw-.06,uh-.06,.012,L.cream,mx,hc+uh/2,-D/2+.03,g);
 L.cutPanel(g,D-.06,uh-.06,mx+X(-mw/2+.03),hc+uh/2,0,dir>0?-Math.PI/2:Math.PI/2,[{x:0,y:.4-uh/2,w:.3,h:.3}]);K.box(mw-.06,.012,D-.06,L.cream,mx,hc+uh-.046,0,g);
 L.lightStrip(g,mw-.2,mx,hc+uh-.06,.12);K.box(mw-.1,uh-.12,.004,P.light,mx,hc+uh/2,-D/2+.04,g);
 for(const sx of[-1,1])H.warn(g,mx+sx*.14,hc+uh-.11,D/2-.016,0,.07);
 // Magazine elevator inside: guide rods, lead screw, the elevator plate and the loaded magazine(s).
 const elev=new T.Group();g.add(elev);const mags=dual?[-.16,.16]:[0];
 for(const ox of mags){K.cyl(.008,uh-.1,M.steel,mx+ox-.1,hc+uh/2,-.15,g,'y',8);K.cyl(.008,uh-.1,M.steel,mx+ox+.1,hc+uh/2,-.15,g,'y',8);K.cyl(.012,uh-.1,M.steel,mx+ox,hc+uh/2,-.2,g,'y',8)}
 elev.position.set(mx,hc+.06,0);for(const ox of mags){K.box(dual?.3:.42,.02,.4,P.alu,ox,0,-.02,elev);K.box(.08,.06,.08,M.dark,ox,.02,-.2,elev);H.magazine(elev,ox,.01,.05,dual?.26:.36,.5,.32,dual?8:11)}
 // Pusher: a bar across the back with the push rod along x towards the conveyor.
 K.box(.04,.04,.5,P.alu,mx+X(mw/2-.06),hb+.1,-.15,g);K.cyl(.01,mw-.2,M.steel,mx,hb+.1,.1,g,'x',8);K.box(.03,.05,.03,M.dark,mx+X(.1),hb+.1,.1,g);
 // Control column with its door, MAIN POWER and the tilted console; lamp tower on top.
 const cw=.3,cx=X(.19),cdp=1.08;const cc=L.cab(g,cw,1.45,cdp,cx,0);const czf=cc.userData.zf;L.door(cc,.22,.56,0,.4,czf,-dir);L.door(cc,.22,.26,0,1.2,czf,-dir);
 L.mainPower(cc,X(.0),.78,czf+.02);L.sightBox(cc,0,.17,czf+.01);L.console(g,s,cx,1.0,cdp/2+.02,.28);K.box(cw,.06,.1,L.cream,cx,.93,cdp/2+.02,g);
 K.box(.06,.04,.12,M.dark,cx,1.2,-cdp/2-.05,g);L.lamp(g,cx,1.22,-cdp/2-.08,lamps);H.logoBand(g,s,cw-.06,cx,1.4,cdp/2+.002,.03);
 // Conveyor stub: a short ivory box with the rail pair at belt height, and the spare magazine on its shelf behind.
 const bw=.26,bx=X(.47);const bc=L.cab(g,bw,hc,.9,bx,0);L.door(bc,.18,.4,0,.33,bc.userData.zf,dir);K.box(bw-.04,.02,.5,L.creamD,bx,hc+.01,.15,g);
 const r=L.rails(g,.3,bx,hb,.18,.32,{lead:false});K.cyl(.008,.3,M.steel,bx+X(.08),hb-.1,.18,g,'y',8);
 K.box(.2,.012,.3,P.alu,bx,hc+.016,-.25,g);H.magazine(g,bx,hc+.022,-.25,.18,.34,.26,2);
 H.hose(g,[[bx,hc+.02,.4],[bx,.3,.5],[cx,.2,.5]],.006,P.cableB);
 return {group:g,height:1.84,lamps,update:(t,run)=>{if(run===false)return;elev.position.y=hc+.06+.18*(.5+.5*Math.sin(t*.5));if(r.pcb)r.pcb.position.x=dir*(((t*.2)%.3)-.15)}};
}
MB.add('magazineLoader',(K,s)=>magazineMachine(K,s,!!(s.opts&&s.opts.direction==='unload')));
MB.add('magazineUnloader',(K,s)=>magazineMachine(K,s,true));

// ───────────────────────────── ngSorter ─────────────────────────────
MB.add('ngSorter',(K,s)=>{
 const L=lib(K),{H,P,M,T}=L,g=new T.Group(),lamps=[],hb=.9,hc=.75,W=1.0,D=1.0,uh=.72;
 // Lower cabinet with two doors, MAIN POWER and the filter window.
 const c=L.cab(g,W,hc,D,0,0),zf=c.userData.zf;L.door(c,.5,.56,.2,.4,zf,1);L.door(c,.26,.56,-.3,.4,zf,-1);L.mainPower(c,-.3,.6,zf+.02);L.sightBox(c,-.3,.2,zf+.01);
 H.nameplate(c,s,.2,.16,zf+.02,.34,.08);L.lot(c,s,.42,hc-.07,zf+.02);
 // Upper structure (as the KGNB photo): a closed full-width rear housing, the control column at the left front, and on the
 // right the sorter bay – open at the front and the right at belt height – under a hood with a window. Boards enter through
 // an aperture in the column, run on the green belt and the lift carriage takes NG boards up to the rack in the hood.
 const bz=-D/2+.2,bd=.36;K.box(W-.04,uh,bd,L.cream,0,hc+uh/2,bz,g);for(const sx of[-1,1])K.box(.042,uh+.012,.042,L.trim,sx*(W/2-.015),hc+uh/2,-D/2+.015,g);
 K.box(W-.06,.03,.03,L.trim,0,hc+uh-.015,-D/2+.015,g);K.box(.03,.03,bd,L.trim,W/2-.015,hc+uh-.015,bz,g);
 const cx=-.33,cw=.32,cz=.12,cdp=.48;K.box(cw,uh,cdp,L.cream,cx,hc+uh/2,cz,g);
 K.box(.042,uh+.012,.042,L.trim,cx-cw/2+.015,hc+uh/2,cz+cdp/2-.015,g);K.box(.042,uh+.012,.042,L.trim,cx+cw/2-.015,hc+uh/2,cz+cdp/2-.015,g);K.box(cw-.03,.03,.03,L.trim,cx,hc+uh-.015,cz+cdp/2-.015,g);
 L.door(g,.22,.3,cx,hc+.52,cz+cdp/2,-1);L.console(g,s,cx,1.0,cz+cdp/2+.02,.3);K.box(cw,.06,.1,L.cream,cx,.93,cz+cdp/2+.02,g);
 K.box(.06,.04,.1,M.dark,cx,hc+uh-.32,-D/2-.05,g);L.lamp(g,cx,hc+uh-.3,-D/2-.08,lamps);H.logoBand(g,s,cw-.06,cx,hc+uh-.06,cz+cdp/2+.002,.03);
 // Hood over the bay: front panel with its window, right side panel with a window, roof, light ceiling and trims.
 const ux=.17,uw=.64,yb=hc+.4,hh=hc+uh-yb,hz=.18;L.cutPanel(g,uw-.04,hh-.02,ux,yb+hh/2,D/2-.03,0,[{x:-.1,y:0,w:.26,h:.2}]);
 L.cutPanel(g,.6,hh-.02,ux+uw/2-.03,yb+hh/2,hz,Math.PI/2,[{x:0,y:0,w:.3,h:.2}]);K.box(uw-.04,.012,.6,L.cream,ux,hc+uh-.046,hz,g);K.box(uw-.06,.012,.58,P.light,ux,yb+.006,hz,g);
 L.lightStrip(g,uw-.2,ux,hc+uh-.06,.1);K.box(.042,hh+.012,.042,L.trim,ux+uw/2-.015,yb+hh/2,D/2-.015,g);K.box(uw-.03,.03,.03,L.trim,ux,yb+hh-.015,D/2-.015,g);K.box(uw-.03,.03,.03,L.trim,ux,yb+.015,D/2-.015,g);
 K.box(.03,.03,.6,L.trim,W/2-.015,yb+hh-.015,hz,g);K.box(.03,.03,.6,L.trim,W/2-.015,yb+.015,hz,g);
 // Bay interior: dark back and left walls, the ivory deck with the green belt and side guides, a board on it.
 K.box(uw-.06,yb-hc-.02,.006,P.screenBack,ux,(hc+yb)/2,bz+bd/2+.003,g);K.box(.006,yb-hc-.02,.48,P.screenBack,cx+cw/2+.003,(hc+yb)/2,cz,g);K.box(uw-.06,.006,.58,P.screenBack,ux,hc+.003,hz,g);
 const lz=.15,belt=L.belt(g,.5,.28,.11,hb-.01,lz,.025);K.box(.54,.1,.4,L.cream,.11,hc+.056,lz,g);for(const sz of[-1,1])K.box(.5,.03,.012,P.alu,.11,hb,lz+sz*.15,g);
 const board=H.pcb(g,.0,hb-.008,lz,.26,.22);K.box(.03,.04,.03,M.black,.3,hb+.02,lz-.17,g);K.box(.008,.008,.006,P.led,.3,hb+.028,lz-.187,g);
 // Lift at the right end of the bay: profile column with a steel slide, the carriage with a rail stub (pokes out of the open side).
 const px=.43;K.box(.05,yb-hc-.04,.05,P.alu,px,(hc+yb)/2,lz-.22,g);K.box(.02,yb-hc-.08,.03,M.steel,px,(hc+yb)/2,lz-.18,g);
 const car=new T.Group();g.add(car);car.position.set(px,hb,lz);K.box(.06,.1,.05,M.dark,0,-.03,-.19,car);K.box(.18,.03,.2,P.alu,.03,-.07,-.05,car);L.rails(car,.18,.03,0,0,.28,{lead:false,sensor:false});
 K.box(.26,.012,.26,P.alu,ux-.1,yb+.04,.06,g);H.magazine(g,ux-.1,yb+.046,.06,.22,.2,.24,4);
 // Apertures where the boards pass through the column, the infeed stub outside it, labels.
 for(const x of[cx-cw/2-.003,cx+cw/2+.003])K.box(.006,.09,.36,P.screenBack,x,hb-.01,lz,g);const inr=L.rails(g,.12,cx-cw/2-.065,hb,lz,.28,{lead:false,pcb:false});
 K.plate(g,'NG',.14,.08,ux+uw/2-.03+.009,yb+hh-.07,hz-.0,'#c8312a','#ffffff',Math.PI/2);K.plate(g,'GOOD',.14,.06,ux+uw/2-.03+.009,yb+.08,hz,'#3fa66b','#ffffff',Math.PI/2);
 K.plate(g,'NG',.1,.06,ux+.15,yb+hh-.08,D/2-.03+.009,'#c8312a','#ffffff');H.warn(g,ux+.22,yb+.06,D/2-.03+.009,0,.07);H.warn(g,ux-.1,yb+hh-.06,D/2-.03+.009,0,.06);
 return {group:g,height:hc+uh+.32,lamps,update:(t,run)=>{if(run===false)return;belt.scroll(t*.3);board.position.x=((t*.15)%.4)-.2;const ph=(t*.4)%2;car.position.y=hb+.2*(ph<1?(1-Math.cos(ph*Math.PI))/2:1-(1-Math.cos((ph-1)*Math.PI))/2)}};
});

// ───────────────────────────── boardFlipper ─────────────────────────────
MB.add('boardFlipper',(K,s)=>{
 const L=lib(K),{H,P,M,T}=L,g=new T.Group(),lamps=[],W=.7,D=.8,Hc=1.3,hb=.9;
 // Cabinet shell built with a real aperture in the front panel so the drum is seen; on castors.
 const y0=.1;K.box(W-.02,Hc-y0,.02,L.cream,0,(Hc+y0)/2,-D/2+.02,g);for(const sx of[-1,1])K.box(.02,Hc-y0,D-.04,L.cream,sx*(W/2-.02),(Hc+y0)/2,0,g);
 K.box(W-.02,.02,D-.02,L.cream,0,Hc-.01,0,g);K.box(W-.02,.02,D-.02,L.cream,0,y0+.01,0,g);K.box(W-.06,.012,D-.1,P.screenBack,0,hb-.21,0,g);K.box(W-.06,.012,D-.1,P.screenBack,0,hb+.21,0,g);K.box(W-.06,.4,.012,P.screenBack,0,hb,-D/2+.05,g);
 for(const sx of[-1,1])for(const sz of[-1,1])K.box(.042,Hc-y0+.012,.042,L.trim,sx*(W/2-.015),(Hc+y0)/2,sz*(D/2-.015),g);
 for(const sy of[y0+.015,Hc-.015,.62]){for(const sz of[-1,1])K.box(W-.06,.03,.03,L.trim,0,sy,sz*(D/2-.015),g);for(const sx of[-1,1])K.box(.03,.03,D-.06,L.trim,sx*(W/2-.015),sy,0,g)}
 H.castors(g,W,D,.1,.045);
 const zf=D/2-.012;L.door(g,W-.14,.42,0,.37,zf,1);L.mainPower(g,W/2-.1,.56,zf+.02);H.nameplate(g,s,-.1,.2,zf+.02,.3,.07);
 // Upper front panel around the aperture (left, right, above, below) and the clear guard over it.
 const ay=hb,ah=.22,aw=.48;K.box((W-.02-aw)/2,Hc-.65,.012,L.cream,-(aw/2+(W-.02-aw)/4),(Hc+.64)/2,zf+.006,g);K.box((W-.02-aw)/2,Hc-.65,.012,L.cream,aw/2+(W-.02-aw)/4,(Hc+.64)/2,zf+.006,g);
 K.box(aw,Hc-.02-(ay+ah/2),.012,L.cream,0,(Hc-.02+ay+ah/2)/2,zf+.006,g);K.box(aw,ay-ah/2-.64,.012,L.cream,0,(ay-ah/2+.64)/2,zf+.006,g);
 for(const sy of[-1,1])K.box(aw+.04,.012,.004,P.dark,0,ay+sy*(ah/2+.006),zf+.013,g);for(const sx of[-1,1])K.box(.012,ah+.04,.004,P.dark,sx*(aw/2+.006),ay,zf+.013,g);
 K.box(aw+.1,ah+.1,.006,P.glass,0,ay,zf+.03,g).castShadow=false;for(const sx of[-1,1])for(const sy of[-1,1])K.cyl(.007,.02,M.dark,sx*(aw/2+.04),ay+sy*(ah/2+.04),zf+.025,g,'z',8);
 for(const sx of[-1,1])K.box(.004,.1,.36,P.dark,sx*(W/2+.001),hb,0,g);
 L.lot(g,s,-.2,1.15,zf+.013);H.logoBand(g,s,W-.06,0,Hc-.045,zf+.013,.035);H.warn(g,.22,1.15,zf+.013,0,.07);
 // Control panel on the top front: screen, e-stop, buttons; lamp tower.
 H.screen(g,-.1,1.07,zf+.0125+.013,.16,.1,H.card(s));H.estop(g,.14,1.07,zf+.018);K.cyl(.009,.012,P.green,.25,1.09,zf+.018,g,'z',10);K.cyl(.009,.012,M.dark,.25,1.05,zf+.018,g,'z',10);
 K.box(.06,.04,.1,M.dark,-.2,Hc-.3,-D/2-.05,g);L.lamp(g,-.2,Hc-.28,-D/2-.08,lamps);
 // Drum: two clamp plates in end rings, turning about x; rail stubs on both sides at belt height.
 const drum=new T.Group();g.add(drum);drum.position.set(0,hb,0);for(const sx of[-1,1])K.torus(.13,.012,P.alu,sx*.25,0,0,drum,'x',28);
 for(const sy of[-1,1])K.box(.5,.01,.26,P.alu,0,sy*.03,0,drum);for(const sx of[-1,1])K.box(.03,.07,.26,M.dark,sx*.22,0,0,drum);H.pcb(drum,0,0,0,.42,.2);
 for(const sx of[-1,1])K.cyl(.015,.06,M.steel,sx*.29,0,0,drum,'x',10);
 for(const sx of[-1,1])K.box(.04,.12,.06,M.dark,sx*(W/2-.05),hb-.03,0,g);K.box(.06,.1,.06,M.dark,-.32,hb-.12,-.2,g);
 const stubs=[L.rails(g,.14,-W/2+.03,hb,0,.3,{lead:false,sensor:false}),L.rails(g,.14,W/2-.03,hb,0,.3,{lead:false,pcb:false,sensor:false})];
 return {group:g,height:Hc+.34,lamps,update:(t,run)=>{if(run===false)return;const ph=(t*.6)%3;drum.rotation.x=ph<1?ph*Math.PI:ph<2?Math.PI:Math.PI+(ph-2)*Math.PI;
  if(stubs[0].pcb)stubs[0].pcb.position.x=((t*.1)%.12)-.06}};
});

// ───────────────────────────── pcbBuffer ─────────────────────────────
MB.add('pcbBuffer',(K,s)=>{
 const L=lib(K),{H,P,M,T}=L,g=new T.Group(),lamps=[],W=1.0,D=.9,Hf=1.55,hb=.9,weigh=!!(s.opts&&s.opts.weigh);
 // Profile frame on levelling pads; drawers below, glass cabin above.
 H.frame(g,W,Hf,D,0,.06,0,.04);L.pads(g,W,D,.04);K.box(W-.08,.04,D-.08,P.alu,0,.78,0,g);
 for(let i=0;i<2;i++){L.panel(g,W-.1,.3,0,.24+i*.34,D/2-.02,L.cream);K.box(.024,.11,.012,M.black,-.25,.22+i*.34,D/2+.004,g);K.box(.024,.11,.012,M.black,.25,.22+i*.34,D/2+.004,g)}
 K.box(W-.08,.012,D-.08,L.cream,0,.08,0,g);K.box(W-.1,.012,.012,P.dark,0,.41,D/2-.01,g);
 const tint=P.tint;K.box(W-.1,Hf-.84,.008,tint,0,.8+(Hf-.84)/2,D/2-.028,g).castShadow=false;K.box(W-.1,Hf-.84,.008,tint,0,.8+(Hf-.84)/2,-D/2+.028,g).castShadow=false;
 for(const sx of[-1,1])K.box(.008,Hf-.84,D-.1,tint,sx*(W/2-.028),.8+(Hf-.84)/2,0,g).castShadow=false;K.box(.03,Hf-.84,.03,P.alu,0,.8+(Hf-.84)/2,D/2-.028,g);
 K.box(.16,.25,.012,M.dark,-.28,1.3,D/2-.02,g);K.box(.42,.42,.012,L.cream,.25,1.29,D/2-.018,g);K.box(.43,.43,.004,P.dark,.25,1.29,D/2-.026,g);H.estop(g,.2,1.43,D/2-.012);K.cyl(.009,.012,P.green,.32,1.43,D/2-.012,g,'z',10);
 // Monitor box on the upper right of the front.
 K.box(.3,.24,.06,K.mat(0x9ea3a6,.5,.45),.27,1.22,D/2+.018,g);H.screen(g,.27,1.22,D/2+.048+.0125,.26,.17,H.card(s));
 // Inside: the rack of belt shelves with boards on them and the lift carriage at the back.
 const n=15;for(let i=0;i<n;i++){const y=.84+i*.045;for(const sz of[-1,1])K.box(.7,.008,.012,P.belt,0,y,sz*.17,g);for(const sz of[-1,1])K.box(.7,.012,.03,P.alu,0,y-.01,sz*.2,g);if(i%2)H.pcb(g,0,y+.006,0,.4,.3)}
 for(const sz of[-1,1])K.box(.04,Hf-.84,.04,P.alu,-.38,.8+(Hf-.84)/2,sz*.2,g);for(const sz of[-1,1])K.box(.04,Hf-.84,.04,P.alu,.38,.8+(Hf-.84)/2,sz*.2,g);
 const car=new T.Group();g.add(car);car.position.set(0,hb,-D/2+.14);K.box(.1,.08,.06,M.dark,0,0,0,car);K.box(.5,.02,.03,P.alu,0,0,.045,car);
 K.box(.06,Hf-.9,.06,P.alu,0,.8+(Hf-.84)/2,-D/2+.07,g);K.cyl(.012,Hf-.92,M.steel,0,.8+(Hf-.84)/2,-D/2+.14,g,'y',8);L.motor(g,0,Hf-.04,-D/2+.1,.03,.1,Math.PI/2);
 // Infeed / outfeed rail stubs; weighing station (load-cell platform with its display) at the infeed when asked.
 const inr=L.rails(g,.16,-W/2+.02,hb,0,.32,{lead:false});L.rails(g,.16,W/2-.02,hb,0,.32,{lead:false,pcb:false,sensor:false});
 if(weigh){K.box(.2,.03,.3,M.steel,-W/2+.02,hb-.09,.0,g);K.box(.08,.05,.08,M.dark,-W/2+.02,hb-.13,0,g);K.cyl(.012,.3,M.steel,-W/2+.05,hb+.15,D/2-.2,g,'y',8);
  K.box(.16,.09,.04,M.dark,-W/2+.05,hb+.32,D/2-.2,g);K.plate(g,'0.0 kg',.14,.05,-W/2+.05,hb+.32,D/2-.178,'#1c1b18','#ff5a3c');K.plate(g,'WEIGHT',.14,.03,-W/2+.05,hb+.1,D/2-.178,'#e9e3d0','#1c1b18')}
 K.box(.06,.04,.1,M.dark,-W/2+.1,Hf-.36,-D/2-.05,g);L.lamp(g,-W/2+.1,Hf-.34,-D/2-.08,lamps);H.nameplate(g,s,.25,.2,D/2+.012,.3,.07);L.lot(g,s,-.35,.72,D/2+.012);H.warn(g,-.4,1.45,D/2-.02,0,.07);H.logoBand(g,s,.5,-.2,.78,D/2+.0,.03);
 return {group:g,height:Hf+.3,lamps,update:(t,run)=>{if(run===false)return;car.position.y=hb+.5*(.5+.5*Math.sin(t*.4));if(inr.pcb)inr.pcb.position.x=((t*.1)%.14)-.07}};
});

// ───────────────────────────── coolingConveyor ─────────────────────────────
MB.add('coolingConveyor',(K,s)=>{
 const L=lib(K),{H,P,M,T}=L,g=new T.Group(),lamps=[],W=1.8,D=.8,Hc=.85,hb=.92;
 const c=L.cab(g,W,Hc,D,0,0),zf=c.userData.zf;K.box(.03,Hc-.1,.03,L.trim,0,Hc/2+.02,D/2-.012,g);
 for(const sx of[-1,1]){L.door(c,.78,.4,sx*.45,.28,zf,sx);L.panel(c,.78,.26,sx*.45,.66,zf);L.vent(c,.5,.14,sx*.45,.66,zf+.016)}
 H.nameplate(c,s,-.45,.42,zf+.03,.3,.07);L.lot(c,s,.72,.42,zf+.03);K.plate(c,'CE',.05,.05,.8,.14,zf+.03,'#ecebe5','#1c1b18');
 // Control box at the left front corner of the deck with the screen and the e-stop.
 K.box(.34,.14,.1,L.cream,-W/2+.17,Hc+.07,D/2-.05,g);K.box(.35,.15,.004,P.dark,-W/2+.17,Hc+.07,D/2-.003,g);H.screen(g,-W/2+.14,Hc+.075,D/2+.0125,.14,.08,H.card(s));H.estop(g,-W/2+.3,Hc+.07,D/2+.006);K.cyl(.009,.012,M.dark,-W/2+.04,Hc+.07,D/2+.006,g,'z',10);
 // Rails along the deck with boards on them; over the rails a fan canopy (back wall, end cheeks above board height, top
 // plate) carrying the row of eight fan units with their guard rings, blowing down on the boards.
 const rz=-.1,cz=rz,cdp=.5,ct=hb+.13;K.box(W-.14,.012,cdp+.02,P.light,0,Hc+.006,rz,g);
 const r=L.rails(g,W-.1,0,hb,rz,.36,{sensor:false});const boards=[];for(let i=0;i<3;i++)boards.push(H.pcb(g,-.6+i*.6,hb+.004,rz,.28,.28));
 K.box(W-.16,ct-Hc-.012,.012,L.cream,0,(ct+Hc)/2,cz-cdp/2+.006,g);for(const sx of[-1,1])K.box(.012,.09,cdp,L.cream,sx*(W/2-.086),ct-.055,cz,g);
 K.box(W-.16,.02,cdp,L.cream,0,ct,cz,g);for(const sx of[-1,1])K.box(.03,.03,.03,L.trim,sx*(W/2-.095),ct+.025,cz+cdp/2-.015,g);K.box(W-.16,.012,.004,P.dark,0,ct-.1,cz+cdp/2+.002,g);
 const fans=[];for(let i=0;i<8;i++){const x=-W/2+.16+i*(W-.32)/7;K.cyl(.095,.02,M.dark,x,ct+.02,cz,g,'y',24);K.cyl(.09,.012,M.steel,x,ct+.036,cz,g,'y',24);
  const hold=H.grp(g,x,ct+.04,cz);hold.rotation.x=-Math.PI/2;fans.push(H.fan(hold,0,0,0,.075,'z'));for(let k=0;k<2;k++)K.torus(.035+k*.03,.004,M.dark,x,ct+.072,cz,g,'y',24)}
 K.box(.1,.08,.2,M.dark,-W/2+.14,ct-.06,cz-cdp/2+.1,g);H.hose(g,[[-W/2+.1,ct-.06,cz-cdp/2+.1],[-W/2+.08,Hc+.14,cz+.3],[-W/2+.12,Hc+.1,D/2-.05]],.006,P.cableB);
 H.hose(g,[[-W/2+.1,Hc,-.05],[-W/2-.03,Hc-.2,0],[-W/2-.03,.1,0]],.006,P.cableB);
 return {group:g,height:ct+.11,lamps,update:(t,run)=>{if(run===false)return;for(const f of fans)f.rotation.y=t*14;for(let i=0;i<3;i++)boards[i].position.x=((t*.25+i*.6+W)%(W-.3))-(W-.3)/2}};
});

// ───────────────────────────── turntable ─────────────────────────────
MB.add('turntable',(K,s)=>{
 const L=lib(K),{H,P,M,T}=L,g=new T.Group(),lamps=[],W=.9,D=.9,hf=.78;
 H.frame(g,W-.1,hf,D-.1,0,.06,0,.04);L.pads(g,W-.1,D-.1,.04);K.box(W-.2,.012,D-.2,L.cream,0,.1,0,g);K.box(W-.14,.03,D-.14,P.alu,0,hf+.04,0,g);
 for(const sz of[-1,1])L.panel(g,W-.2,.4,0,.4,sz*(D/2-.07),L.cream);
 // Rotary actuator, air hoses and valve under the platform; the round platform with its rail section on top.
 K.cyl(.07,.16,M.dark,0,hf-.16,0,g,'y',20);K.cyl(.1,.05,M.steel,0,hf-.03,0,g,'y',24);K.box(.1,.08,.06,P.blue,.22,hf-.2,.15,g);
 H.hose(g,[[.2,hf-.2,.18],[.1,hf-.22,.1],[.06,hf-.2,.0]],.006,P.blue);H.hose(g,[[.26,hf-.2,.18],[.3,.4,.3],[.3,.15,.4]],.006,P.blue);
 const plat=new T.Group();g.add(plat);plat.position.set(0,hf+.06,0);K.cyl(.38,.025,M.steel,0,.0,0,plat,'y',36);K.torus(.38,.006,M.dark,0,.012,0,plat,'y',36);
 const r=L.rails(plat,.6,0,.08,0,.32,{lead:false});for(const sx of[-1,1])K.box(.04,.03,.04,M.dark,sx*.33,.027,0,plat);
 for(const sx of[-1,1])L.rails(g,.14,sx*(W/2-.06),hf+.14,0,.32,{lead:false,pcb:false,sensor:false});
 L.btnBox(g,.3,.55,D/2-.03);H.estop(g,-.3,.6,D/2-.03);H.nameplate(g,s,-.1,.3,D/2-.03,.3,.07);L.lot(g,s,.3,.3,D/2-.03);H.warn(g,-.3,.45,D/2-.03,0,.07);
 K.box(.04,.04,.06,M.dark,-W/2+.05,hf-.36,-D/2+.02,g);L.lamp(g,-W/2+.05,hf-.34,-D/2-.01,lamps);
 return {group:g,height:hf+.3,lamps,update:(t,run)=>{if(run===false)return;const ph=(t*.5)%2,e=ph<1?(1-Math.cos(ph*Math.PI))/2:1;plat.rotation.y=Math.floor(t*.5/2)*Math.PI/2+e*Math.PI/2}};
});

// ───────────────────────────── lifterConveyor ─────────────────────────────
MB.add('lifterConveyor',(K,s)=>{
 const L=lib(K),{H,P,M,T}=L,root=new T.Group(),g=new T.Group(),lamps=[],W=1.0,D=.9,Ht=2.95;root.add(g);
 // Ivory steel portal: four posts, head frame, mid rails; polycarbonate panels just outside the posts on three sides,
 // the front panel stops above the low infeed opening.
 for(const sx of[-1,1])for(const sz of[-1,1])K.box(.07,Ht,.07,L.white,sx*(W/2-.035),Ht/2,sz*(D/2-.035),g);
 for(const y of[.4,1.65,Ht-.035]){for(const sz of[-1,1])K.box(W-.14,.07,.07,L.white,0,y,sz*(D/2-.035),g);for(const sx of[-1,1])K.box(.07,.07,D-.14,L.white,sx*(W/2-.035),y,0,g)}
 for(const sx of[-1,1])for(const sz of[-1,1])K.box(.1,.012,.1,M.dark,sx*(W/2-.035),.006,sz*(D/2-.035),g);
 const gy0=.44,gy1=Ht-.07,fy0=1.08;K.box(W-.14,gy1-gy0,.006,L.tealGlass,0,(gy0+gy1)/2,-(D/2+.006),g).castShadow=false;K.box(W-.14,gy1-fy0,.006,L.tealGlass,0,(fy0+gy1)/2,D/2+.006,g).castShadow=false;
 K.box(.006,gy1-gy0,D-.14,L.tealGlass,-(W/2+.006),(gy0+gy1)/2,0,g).castShadow=false;K.box(W-.14,.04,.03,L.white,0,fy0,D/2-.035,g);
 for(const sz of[-1,1])for(const sx of[-1,1])for(const y of[.6,2.5])K.cyl(.008,.012,M.dark,sx*(W/2-.08),y,sz*(D/2+.01),g,'z',8);
 // Lift: belts from top pulleys to the floor, the drive motor on the head, the carriage with its roller bed.
 const bz=-D/2+.12;for(const sx of[-1,1]){K.cyl(.05,.05,M.dark,sx*.3,Ht-.1,bz,g,'x',16);K.cyl(.05,.05,M.dark,sx*.3,.2,bz,g,'x',16);K.box(.03,Ht-.3,.006,P.belt,sx*.3,Ht/2+.05,bz+.05,g);K.box(.03,Ht-.3,.006,P.belt,sx*.3,Ht/2+.05,bz-.05,g)}
 K.cyl(.02,.7,M.steel,0,Ht-.1,bz,g,'x',10);L.motor(g,0,Ht-.1,bz-.15,.04,.14,Math.PI/2);K.box(.06,Ht-.5,.06,P.alu,0,Ht/2,bz+.14,g);
 const car=new T.Group();g.add(car);car.position.set(0,.8,0);K.box(.7,.08,.08,L.white,0,0,bz+.05,car);for(const sz of[-1,1])K.box(.72,.06,.04,L.frameGrey,0,.02,sz*.3,car);
 const rollers=[];for(let i=0;i<7;i++)rollers.push(K.cyl(.025,.58,M.steel,-.3+i*.1,.04,0,car,'z',12));K.box(.08,.12,.06,M.dark,0,-.02,bz+.12,car);
 // Infeed / outfeed roller stubs through the open lower front and the open right side (high); each on a leg.
 const stub=(x,y,z,ry,len)=>{const gg=H.grp(g,x,y,z,ry);for(const sz of[-1,1])K.box(len,.06,.04,L.frameGrey,0,0,sz*.3,gg);const n=Math.max(2,Math.round(len/.1));for(let i=0;i<n;i++)K.cyl(.025,.58,M.steel,-len/2+.05+i*(len-.1)/(n-1),.02,0,gg,'z',12);return gg};
 stub(0,.8,D/2+.05,Math.PI/2,.2);for(const sx of[-1,1])K.box(.04,.77,.04,L.frameGrey,sx*.3,.385,D/2+.12,g);
 stub(W/2+.06,2.4,0,0,.22);K.box(.07,.06,D-.14,L.white,W/2-.035,2.34,0,g);
 for(const y of[1.3,2.0])H.warn(g,W/2-.035,y,D/2+.012,0,.09);K.plate(g,'LIFT',.3,.1,0,Ht-.15,D/2+.012,'#1c1b18','#e3b82e');
 // Control cabinet on the left post (the open right side carries the outfeed), lamp tower at the back.
 const cb=H.grp(g,-W/2-.088,1.62,.1,-Math.PI/2);K.box(.34,.5,.16,L.cream,0,0,0,cb);K.box(.35,.51,.004,P.dark,0,0,-.08,cb);H.screen(cb,0,.1,.08+.0125,.22,.14,H.card(s));H.keypad(cb,-.05,-.12,.086,4,2,.022);
 H.estop(cb,.09,-.12,.086);H.nameplate(cb,s,0,-.215,.081,.28,.06);K.box(.02,.08,.004,M.dark,-.17,0,.081,cb);H.logoBand(cb,s,.3,0,.22,.081,.025);
 L.lot(g,s,.3,2.55,D/2+.012);K.box(.06,.04,.1,M.dark,-W/2+.1,Ht-.5,-D/2-.05,g);L.lamp(g,-W/2+.1,Ht-.48,-D/2-.08,lamps);
 H.hose(g,[[-W/2-.09,1.37,.2],[-W/2-.03,.9,.3],[-W/2-.03,.45,.3]],.008,P.cableB);
 // Centre the footprint on the origin.
 g.updateMatrixWorld(true);const bb=new T.Box3().setFromObject(g);g.position.x=-(bb.min.x+bb.max.x)/2;g.position.z=-(bb.min.z+bb.max.z)/2;
 return {group:root,height:Ht+.15,lamps,update:(t,run)=>{if(run===false)return;const ph=(t*.25)%2,e=ph<1?(1-Math.cos(ph*Math.PI))/2:1-(1-Math.cos((ph-1)*Math.PI))/2;car.position.y=.8+1.6*e;for(const r of rollers)r.rotation.z=t*4}};
});

// ───────────────────────────── beltConveyor ─────────────────────────────
MB.add('beltConveyor',(K,s)=>{
 const L=lib(K),{H,P,M,T}=L,g=new T.Group(),incline=!!(s.opts&&s.opts.incline),Lx=2.5,bw=.46,ang=incline?.21:0,y0=incline?.36:.76;
 // The belt unit (side profiles, belt, end rollers, guides, drive) pivots about the low end for the incline.
 const u=new T.Group();g.add(u);u.position.set(-Lx/2,y0,0);u.rotation.z=ang;
 for(const sz of[-1,1]){K.box(Lx,.08,.04,P.alu,Lx/2,0,sz*(bw/2+.03),u);K.box(Lx-.1,.03,.02,P.alu,Lx/2,.065,sz*(bw/2+.02),u)}
 const belt=L.belt(u,Lx-.08,bw,Lx/2,.04,0,.03);for(const sx of[0,1])K.cyl(.045,bw+.02,M.dark,.04+sx*(Lx-.08),.0,0,u,'z',16);
 for(let i=0;i<5;i++)K.box(.03,.03,bw+.06,P.alu,.3+i*(Lx-.6)/4,-.055,0,u);
 L.motor(u,Lx-.55,-.152,-.1,.045,.16);K.box(.5,.015,.14,M.dark,Lx-.54,-.0775,-.1,u);K.box(.06,.1,.06,M.dark,Lx-.08,-.09,-(bw/2+.05),u);H.hose(u,[[Lx-.55,-.11,-.05],[Lx-.75,-.2,.0],[Lx/2+.08,-.16,.0]],.006,P.cableB);
 K.box(.16,.2,.1,P.light,Lx/2,-.16,0,u);K.box(.17,.21,.004,P.dark,Lx/2,-.16,.051,u);
 // Legs with feet and cross braces, each cut to the belt height at its station.
 const legX=incline?[.2,1.1,2.1]:[.25,2.25];for(const lx of legX){const hy=y0+Math.sin(ang)*lx-.04;for(const sz of[-1,1]){K.box(.04,hy-.02,.04,M.steel,-Lx/2+lx,hy/2+.01,sz*(bw/2+.03),g);K.box(.1,.012,.1,M.dark,-Lx/2+lx,.006,sz*(bw/2+.03),g)}
  K.box(.04,.04,bw+.1,M.steel,-Lx/2+lx,hy*.35,0,g)}
 for(const sz of[-1,1])K.box(Lx-.5,.03,.03,M.steel,0,y0*.35-.03,sz*(bw/2+.03),g);
 // E-stop box on a leg, the hopper under the low end for the incline, labels.
 const ex=-Lx/2+legX[0];K.box(.08,.1,.06,P.yellow,ex,y0*.6,bw/2+.07,g);H.estop(g,ex,y0*.6,bw/2+.1);
 if(incline){K.box(.6,.3,.6,K.mat(0x8f969b,.3,.6),-Lx/2+.5,.17,0,g);K.box(.56,.04,.56,P.dark,-Lx/2+.5,.34,0,g);for(const sz of[-1,1])K.box(.6,.04,.02,P.yellow,-Lx/2+.5,.3,sz*.29,g)}
 H.nameplate(u,s,Lx/2,0,bw/2+.051,.26,.06);L.lot(u,s,Lx/2+.3,0,bw/2+.051);H.warn(u,Lx-.5,0,bw/2+.051,0,.06);
 return {group:g,height:incline?y0+Math.sin(ang)*Lx+.1:y0+.08,update:(t,run)=>{if(run===false)return;belt.scroll(t*.5)}};
});

// ───────────────────────────── rollerConveyor ─────────────────────────────
MB.add('rollerConveyor',(K,s)=>{
 const L=lib(K),{H,P,M,T}=L,g=new T.Group(),Lx=2.0,bw=.56,hb=.68;
 for(const sz of[-1,1]){K.box(Lx,.12,.05,L.frameGrey,0,hb-.06,sz*(bw/2+.025),g);K.box(Lx-.1,.03,.012,P.yellow,0,hb-.03,sz*(bw/2+.056),g)}
 const rollers=[];for(let i=0;i<20;i++)rollers.push(K.cyl(.025,bw,M.steel,-Lx/2+.05+i*(Lx-.1)/19,hb-.025,0,g,'z',14));
 // Chain drive cover along the back, the motor and gearbox under the bed, end stops.
 K.box(Lx-.2,.07,.04,M.dark,0,hb-.1,-(bw/2+.07),g);K.box(Lx-.3,.012,.02,L.chainM,0,hb-.1,-(bw/2+.092),g);
 K.box(.2,.16,.12,M.dark,.5,hb-.2,0,g);L.motor(g,.5,hb-.26,.2,.055,.18);K.box(.3,.03,.3,M.dark,.5,hb-.12,.1,g);
 for(const sx of[-1,1])K.box(.04,.1,bw+.1,L.frameGrey,sx*(Lx/2-.02),hb+.03,0,g);
 for(const sx of[-1,1])for(const sz of[-1,1]){K.box(.05,hb-.14,.05,L.frameGrey,sx*(Lx/2-.2),(hb-.12)/2,sz*(bw/2+.025),g);K.box(.14,.012,.14,M.dark,sx*(Lx/2-.2),.006,sz*(bw/2+.025),g)}
 for(const sx of[-1,1])K.box(.04,.04,bw+.1,L.frameGrey,sx*(Lx/2-.2),.3,0,g);K.box(Lx-.5,.04,.04,L.frameGrey,0,.3,bw/2+.025,g);
 H.nameplate(g,s,-.4,hb-.06,bw/2+.051,.26,.06);L.lot(g,s,.3,hb-.06,bw/2+.051);H.warn(g,.75,hb-.06,bw/2+.051,0,.06);K.box(.1,.06,.04,P.light,-.7,hb-.18,bw/2+.03,g);H.hose(g,[[-.7,hb-.2,bw/2+.05],[-.7,.4,bw/2+.05],[-.7,.1,bw/2+.08]],.006,P.cableB);
 return {group:g,height:hb+.08,update:(t,run)=>{if(run===false)return;for(const r of rollers)r.rotation.z=t*3}};
});

// ───────────────────────────── chainConveyor ─────────────────────────────
MB.add('chainConveyor',(K,s)=>{
 const L=lib(K),{H,P,M,T}=L,g=new T.Group(),Lx=2.05,Dz=1.4,ht=.46;
 for(const sz of[-1,1])K.box(Lx,.14,.06,L.frameGrey,0,ht-.1,sz*(Dz/2-.03),g);for(const sx of[-1,1])K.box(.06,.14,Dz-.12,L.frameGrey,sx*(Lx/2-.03),ht-.1,0,g);
 for(let i=0;i<3;i++)K.box(.06,.12,Dz-.12,L.frameGrey,-Lx/4+i*Lx/4,ht-.1,0,g);
 for(const sx of[-1,1])for(const sz of[-1,1]){K.box(.06,ht-.17,.06,L.frameGrey,sx*(Lx/2-.2),(ht-.17)/2,sz*(Dz/2-.15),g);K.box(.16,.012,.16,M.dark,sx*(Lx/2-.2),.006,sz*(Dz/2-.15),g)}
 // Two chain lanes in their guides, heavy rollers between, the drive shaft with sprockets and the motor.
 const chains=[];for(const sz of[-1,1]){K.box(Lx-.1,.05,.08,M.dark,0,ht-.045,sz*.45,g);chains.push(L.belt(g,Lx-.14,.04,0,ht,sz*.45,.02,true))}
 const rollers=[];for(let i=0;i<11;i++)rollers.push(K.cyl(.03,.8,M.steel,-Lx/2+.2+i*(Lx-.4)/10,ht-.05,0,g,'z',14));
 K.cyl(.02,Dz-.2,M.steel,Lx/2-.12,ht-.08,0,g,'z',10);for(const sz of[-1,1])K.cyl(.05,.02,M.dark,Lx/2-.12,ht-.08,sz*.45,g,'z',16);
 L.motor(g,Lx/2-.12,ht-.12,-(Dz/2-.02),.05,.16,Math.PI/2);K.box(.1,.08,.08,M.dark,Lx/2-.12,ht-.1,-(Dz/2+.03),g);
 K.box(.4,.03,.4,M.dark,0,.015,0,g);H.pallet(g,0,ht+.012,0,.8,1.2);
 H.nameplate(g,s,-.6,ht-.1,Dz/2+.001,.26,.06);L.lot(g,s,.4,ht-.1,Dz/2+.001);H.warn(g,.8,ht-.1,Dz/2+.001,0,.06);
 return {group:g,height:ht+.17,update:(t,run)=>{if(run===false)return;for(const c of chains)c.scroll(t*.3);for(const r of rollers)r.rotation.z=t*2}};
});

// ───────────────────────────── transferConveyor ─────────────────────────────
MB.add('transferConveyor',(K,s)=>{
 const L=lib(K),{H,P,M,T}=L,g=new T.Group(),lamps=[],Lx=2.0,Dz=.9,hb=.85,Hp=2.0;
 // Conveyor: white steel frame on legs with two belts and the centre guide.
 for(const sz of[-1,1])K.box(Lx,.1,.06,L.white,0,hb-.05,sz*(Dz/2-.03),g);for(const sx of[-1,1])K.box(.06,.1,Dz-.12,L.white,sx*(Lx/2-.03),hb-.05,0,g);
 const belts=[];for(const sz of[-1,1]){belts.push(L.belt(g,Lx-.2,.3,0,hb+.03,sz*.24,.03));for(const sx of[-1,1])K.cyl(.035,.32,M.dark,sx*(Lx/2-.1),hb,sz*.24,g,'z',14)}
 K.box(Lx-.2,.04,.06,P.alu,0,hb,0,g);for(const sx of[-1,1])for(const sz of[-1,1]){K.box(.06,hb-.1,.06,L.white,sx*(Lx/2-.15),(hb-.1)/2,sz*(Dz/2-.03),g);K.box(.14,.012,.14,M.dark,sx*(Lx/2-.15),.006,sz*(Dz/2-.03),g)}
 for(const sx of[-1,1])K.box(.06,.06,Dz-.12,L.white,sx*(Lx/2-.15),.3,0,g);L.motor(g,.6,hb-.2,-(Dz/2+.08),.045,.14);K.box(.06,.08,.06,M.dark,.6,hb-.13,-(Dz/2+.03),g);
 // Portal: posts, head beams and the x beam carrying the carriage; the cable-chain trough on the back of the beam top.
 for(const sx of[-1,1])for(const sz of[-1,1])K.box(.08,Hp,.08,L.white,sx*(Lx/2-.1),Hp/2,sz*(Dz/2+.15),g);for(const sx of[-1,1])K.box(.08,.12,Dz+.38,L.white,sx*(Lx/2-.1),Hp+.06,0,g);
 K.box(Lx-.12,.14,.14,L.white,0,Hp+.06,0,g);K.box(Lx-.3,.03,.03,M.steel,0,Hp+.06,.085,g);const ty=Hp+.14,tz=-.1;K.box(Lx-.3,.02,.1,M.dark,0,ty-.01,tz,g);for(const sz of[-1,1])K.box(Lx-.3,.05,.006,M.dark,0,ty+.015,tz+sz*.053,g);
 const car=new T.Group();g.add(car);car.position.set(-.6,Hp+.06,0);K.box(.28,.22,.12,L.white,0,0,.14,car);for(const sy of[-1,1])K.box(.3,.02,.14,M.dark,0,sy*.12,.14,car);
 // Chain bracket: a post on the carriage and an arm over the beam to the moving end of the chain.
 const cy0=ty+.0175,cy1=cy0+.07,armY=cy1+.0175+.008-(Hp+.06);K.box(.05,armY-.11+.008,.03,M.dark,.0,(armY+.11)/2,.19,car);K.box(.05,.016,.33,M.dark,0,armY,.035,car);
 const zax=new T.Group();car.add(zax);zax.position.set(0,0,.3);K.box(.08,.9,.08,P.alu,0,-.3,0,zax);K.box(.12,.06,.12,M.dark,0,.1,0,zax);K.box(.1,.18,.06,M.dark,0,.0,.23,car);
 K.box(.34,.03,.26,P.alu,0,-.76,0,zax);for(const sx of[-1,1])for(const sz of[-1,1]){K.cyl(.012,.06,M.steel,sx*.12,-.8,sz*.09,zax,'y',8);K.cyl(.028,.015,M.black,sx*.12,-.835,sz*.09,zax,'y',14)}
 for(const sx of[-1,1]){K.box(.03,.08,.04,M.dark,sx*.185,-.8,0,zax);K.box(.012,.04,.03,M.steel,sx*.176,-.85,0,zax)}
 // Energy chain: fixed end on the beam at xa, moving end under the carriage arm; lower run in the trough, upper run on top,
 // the bend follows half the carriage stroke (constant chain length), links repositioned in update().
 const xa=-.78,Lc=1.42,rr=.035,links=[],nL=Math.round(Lc/.055);for(let i=0;i<nL;i++)links.push(K.box(.05,.032,.05,P.black,0,cy0,tz,g));K.box(.06,.05,.06,M.dark,xa-.03,cy0,tz,g);
 const poseChain=xc=>{const xb=(Lc-Math.PI*rr+xa+xc)/2,l1=xb-xa,arc=Math.PI*rr;for(let i=0;i<nL;i++){const sd=(i+.5)*Lc/nL,m=links[i];
  if(sd<l1){m.position.set(xa+sd,cy0,tz);m.rotation.z=0}else if(sd<l1+arc){const a=(sd-l1)/rr;m.position.set(xb+Math.sin(a)*rr,cy0+rr-Math.cos(a)*rr,tz);m.rotation.z=a}
  else{m.position.set(xb-(sd-l1-arc),cy1,tz);m.rotation.z=0}}};
 H.hose(g,[[xa-.03,cy0,tz],[-.95,Hp-.2,-.4],[-.95,1.0,-.5],[-.8,hb-.1,-.5]],.008,P.cableB);
 // The part being transferred (a white panel tray) on the front belt.
 const part=K.box(.3,.025,.26,K.mat(0xf1f0ea,.05,.5),-.6,hb+.03+.0125,.3,g);const S=.31;
 // Light-curtain posts at both ends, lamp tower, control box on a post, labels.
 for(const sx of[-1,1])for(const sz of[-1,1])L.lcPost(g,sx*(Lx/2+.05),sz*(Dz/2+.05),1.1,sz<0?Math.PI:0);
 K.box(.1,.04,.06,M.dark,-(Lx/2-.1)-.07,Hp-.42,-(Dz/2+.15),g);L.lamp(g,-(Lx/2-.1)-.1,Hp-.4,-(Dz/2+.15),lamps);K.box(.3,.4,.14,L.cream,Lx/2-.1,1.3,Dz/2+.17,g);K.box(.31,.41,.004,P.dark,Lx/2-.1,1.3,Dz/2+.099,g);H.screen(g,Lx/2-.1,1.38,Dz/2+.24+.0125,.22,.14,H.card(s));
 H.estop(g,Lx/2-.02,1.18,Dz/2+.24);H.keypad(g,Lx/2-.16,1.18,Dz/2+.24,3,2,.022);H.nameplate(g,s,-.5,hb-.05,Dz/2+.001,.3,.07);L.lot(g,s,.3,hb-.05,Dz/2+.001);H.warn(g,.7,hb-.05,Dz/2+.001,0,.06);
 poseChain(-.6);
 const ease=u=>(1-Math.cos(Math.min(1,Math.max(0,u))*Math.PI))/2,pyBelt=hb+.03+.0125,pyHeld=Hp+.06-.8425-.0125;
 // Cycle (8 s): lower and pick at -0.6, lift, travel to +0.6, lower and place, lift, travel back; the placed part rides off on the belt.
 return {group:g,height:Hp+.3,lamps,update:(t,run)=>{if(run===false)return;const u=(t*.8)%8;let x=-.6,dn=0;
  if(u<1)dn=Math.sin(u*Math.PI);else if(u<2)dn=0;else if(u<4)x=-.6+1.2*ease((u-2)/2);else if(u<5){x=.6;dn=Math.sin((u-4)*Math.PI)}else if(u<6)x=.6;else x=.6-1.2*ease((u-6)/2);
  car.position.x=x;zax.position.y=-S*dn;poseChain(x);
  if(u<.5)part.position.set(-.6,pyBelt,.3);else if(u<4.5)part.position.set(x,pyHeld-S*dn,.3);else part.position.set(Math.min(.85,.6+.1*(u-4.5)),pyBelt,.3);
  for(const b of belts)b.scroll(t*.4)}};
});
})();
