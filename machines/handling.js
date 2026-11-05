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
 const L=lib(K),{H,P,M,T}=L,g=new T.Group(),type=(s.opts&&s.opts.type)||'connect',lamps=[];
 const w={connect:.6,gateway:1.0,shuttle:1.5,dual:1.1}[type]||.6,d=.9,cd=.8,hc=.6,hb=.9;
 // Lower ivory cabinet with door(s), MAIN POWER and the maker plate.
 const c=L.cab(g,w,hc,cd,0,0),zf=c.userData.zf;
 if(type==='shuttle'){for(const sx of[-1,1])L.door(c,.56,.42,sx*.36,.33,zf,sx);L.mainPower(c,.0,.4,zf+.02);L.sightBox(c,0,.18,zf+.01)}
 else{L.door(c,w-.24,.42,-.06,.33,zf,1);L.mainPower(c,w/2-.08,.42,zf+.02);L.sightBox(c,w/2-.08,.2,zf+.01)}
 H.logoBand(c,s,w-.1,0,hc-.045,zf+.01,.035);H.nameplate(c,s,-w/2+.2,.12,zf+.02,.3,.07);L.lot(c,s,w/2-.12,hc-.05,zf+.02);
 // Aluminium profile frame above the cabinet, with the flat top cover over the back half and the drive.
 for(const sx of[-1,1])for(const sz of[-1,1])K.box(.04,hb-hc-.07,.04,P.alu,sx*(w/2-.05),hc+(hb-hc-.07)/2,sz*(cd/2-.05),g);
 for(const sz of[-1,1])K.box(w-.06,.04,.04,P.alu,0,hb-.09,sz*(cd/2-.05),g);for(const sx of[-1,1])K.box(.04,.04,cd-.06,P.alu,sx*(w/2-.05),hb-.09,0,g);
 K.box(w-.14,.012,cd*.42,L.cream,0,hb-.064,-cd*.27,g);K.box(w-.14,.012,.1,L.cream,0,hb-.064,cd/2-.1,g);
 L.motor(g,w*.1,hb-.17,-.02,.035,.11);K.box(.08,.06,.08,M.dark,-w*.2,hb-.17,-.02,g);H.hose(g,[[w*.1,hb-.2,-.06],[w*.1,hc+.05,-.2],[w*.1,hc-.01,-.2]],.008);
 // Rails (one lane, or two for the dual conveyor) and the lifting gate / shuttle carriage.
 const lanes=type==='dual'?[-.2,.2]:[0.02],lw=type==='dual'?.3:.4,parts=[],movers=[];
 const gate=new T.Group();g.add(gate);const carriage=new T.Group();g.add(carriage);
 for(const z of lanes){
  if(type==='gateway'){const a=L.rails(g,.3,-w/2+.17,hb,z,lw,{lead:false});const b=L.rails(g,.3,w/2-.17,hb,z,lw);parts.push(a,b);
   gate.position.set(.19,hb,z);const sec=L.rails(gate,.36,-.19,0,0,lw,{lead:false,sensor:false,pcb:false});K.cyl(.012,lw+.06,M.steel,0,-.03,0,gate,'z',8);
   K.cyl(.008,.3,M.steel,-.2,hb-.16,lw/2+.04,g,'y',8);K.cyl(.014,.14,M.dark,-.2,hb-.3,lw/2+.04,g,'y',10)}
  else parts.push(L.rails(g,w-.1,0,hb,z,lw));
 }
 if(type==='gateway'){for(const sx of[-1,1])L.lcPost(g,sx*(w/2-.02),cd/2+.05,1.05);K.box(.35,.02,.2,K.mat(0xd8d2bd,.3,.6),0,.01,cd/2+.12,g);K.box(.35,.012,.03,P.yellow,0,.026,cd/2+.21,g)}
 if(type==='shuttle'){for(const sx of[-1,1]){K.box(.04,.36,.04,P.alu,sx*.5,hb+.1,-cd/2+.1,g);K.cyl(.008,.32,M.steel,sx*.5,hb+.1,-cd/2+.16,g,'y',8)}
  K.box(1.1,.04,.04,P.alu,0,hb+.26,-cd/2+.1,g);L.motor(g,.0,hb+.26,-cd/2+.1,.03,.1,Math.PI/2);
  carriage.position.set(0,hb+.06,0);K.box(1.06,.03,.05,P.alu,0,.0,-cd/2+.16,carriage);for(const sx of[-1,1])K.box(.05,.05,.3,P.alu,sx*.5,.0,-cd/2+.3,carriage);
  parts.push(L.rails(carriage,1.1,0,.06,.02,lw,{lead:false}))}
 // Side control box (3 buttons), e-stop, sensor cable and the lamp tower.
 L.btnBox(g,w/2-.1,hb-.15,cd/2+.02);H.estop(g,-w/2+.1,hb-.12,cd/2+.004);H.warn(g,-w/2+.1,hb-.25,cd/2+.004,0,.08);
 H.hose(g,[[w*.2-.2,hb+.01,-lw/2-.03-.15*(type==='dual'?1:0)],[w*.2-.2,hb-.1,-cd/2-.02],[w*.2-.2,hc+.02,-cd/2-.02]],.005,P.cableB);
 if(type!=='connect')L.lamp(g,-w/2+.1,hc-.1,-cd/2+.1,lamps);
 const height=type==='shuttle'?hb+.28:type==='connect'?hb+.02:hc+.52;
 return {group:g,height,lamps,update:(t,run)=>{if(run===false)return;for(const p of parts)if(p.pcb)p.pcb.position.x=((t*.25+p.len)%(p.len-.3))-(p.len-.3)/2;
  if(type==='gateway'){const ph=(t*.5)%4;gate.rotation.z=-(ph<1?ph:ph<2?1:ph<3?3-ph:0)*.55}
  if(type==='shuttle')carriage.position.y=hb+.06+.08*(.5+.5*Math.sin(t*.9))}};
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
 K.box(mw-.06,uh-.06,.012,L.cream,mx,hc+uh/2,D/2-.03,g);K.box(mw-.06,uh-.06,.012,L.cream,mx,hc+uh/2,-D/2+.03,g);K.box(.012,uh-.06,D-.06,L.cream,mx+X(-mw/2+.03),hc+uh/2,0,g);K.box(mw-.06,.012,D-.06,L.cream,mx,hc+uh-.046,0,g);
 L.win(g,.2,.3,mx-.14,hc+.42,D/2-.024,true);L.win(g,.2,.3,mx+.14,hc+.42,D/2-.024,true);K.box(.012,.3,.3,P.dark,mx+X(-mw/2+.034),hc+.4,0,g);K.box(.004,.26,.26,P.glass,mx+X(-mw/2+.023),hc+.4,0,g).castShadow=false;
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
 const L=lib(K),{H,P,M,T}=L,g=new T.Group(),lamps=[],hb=.9,hc=.75,W=1.0,D=1.0;
 // Lower cabinet with two doors, MAIN POWER and the filter window.
 const c=L.cab(g,W,hc,D,0,0),zf=c.userData.zf;L.door(c,.5,.56,.2,.4,zf,1);L.door(c,.26,.56,-.3,.4,zf,-1);L.mainPower(c,-.3,.6,zf+.02);L.sightBox(c,-.3,.2,zf+.01);
 H.nameplate(c,s,.2,.16,zf+.02,.34,.08);L.lot(c,s,.42,hc-.07,zf+.02);
 // Control column (left) with the console, lamp tower.
 const cx=-.33,cw=.32;K.box(cw,.75,.36,L.cream,cx,hc+.375,.17,g);for(const sx of[-1,1])for(const sz of[-1,1])K.box(.042,.76,.042,L.trim,cx+sx*(cw/2-.015),hc+.375,.17+sz*.165,g);
 L.door(g,.22,.3,cx,hc+.5,.35,-1);L.console(g,s,cx,1.0,.37,.3);K.box(cw,.06,.1,L.cream,cx,.93,.37,g);K.box(.06,.04,.1,M.dark,cx,1.08,-.04,g);L.lamp(g,cx,1.1,-.08,lamps);
 // Upper housing (right) with windows: inside the lift column and the two output lanes.
 const ux=.17,uw=.64,uh=.72;for(const sx of[-1,1])for(const sz of[-1,1])K.box(.04,uh,.04,P.alu,ux+sx*(uw/2-.02),hc+uh/2,sz*(D/2-.02),g);
 for(const sz of[-1,1])K.box(uw-.04,.04,.04,P.alu,ux,hc+uh-.02,sz*(D/2-.02),g);for(const sx of[-1,1])K.box(.04,.04,D-.04,P.alu,ux+sx*(uw/2-.02),hc+uh-.02,0,g);
 K.box(uw-.06,uh-.06,.012,L.cream,ux,hc+uh/2,D/2-.03,g);K.box(uw-.06,uh-.06,.012,L.cream,ux,hc+uh/2,-D/2+.03,g);K.box(.012,uh-.06,D-.06,L.cream,ux+uw/2-.03,hc+uh/2,0,g);K.box(uw-.06,.012,D-.06,L.cream,ux,hc+uh-.046,0,g);
 L.win(g,.22,.3,ux-.14,hc+.4,D/2-.024,true);L.win(g,.22,.3,ux+.14,hc+.4,D/2-.024,true);for(const sx of[-1,1])H.warn(g,ux+sx*.14,hc+uh-.1,D/2-.016,0,.07);
 K.plate(g,'NG',.14,.08,ux+uw/2-.001,hc+.55,0,'#c8312a','#ffffff',Math.PI/2);K.plate(g,'GOOD',.14,.06,ux+uw/2-.001,hc+.45,0,'#3fa66b','#ffffff',Math.PI/2);
 // Lift: profile column with a slide rail, the carriage with the rail pair; two fixed output lanes stacked.
 K.box(.05,uh-.06,.05,P.alu,ux-.05,hc+uh/2,-.3,g);K.box(.02,uh-.1,.03,M.steel,ux-.05,hc+uh/2,-.26,g);
 const lz=-.2;const car=new T.Group();g.add(car);car.position.set(ux,hb,lz);K.box(.06,.1,.05,M.dark,-.05,-.03,-.08,car);K.box(.3,.03,.2,P.alu,0,-.07,-.0,car);L.rails(car,.3,0,0,.0,.3,{lead:false,sensor:false});
 L.rails(g,.3,ux+.0,hb+.28,lz,.3,{lead:false,pcb:false,sensor:false});
 const inr=L.rails(g,.16,-W/2+.02,hb,lz,.3,{lead:false});L.rails(g,.16,W/2-.02,hb,lz,.3,{lead:false,pcb:false});
 K.box(.26,.012,.26,P.alu,ux+.1,hb+.12,.22,g);H.magazine(g,ux+.1,hb+.13,.22,.22,.26,.24,5);K.plate(g,'NG',.1,.06,ux+.14,hc+.18,D/2-.016,'#c8312a','#ffffff');
 return {group:g,height:1.72,lamps,update:(t,run)=>{if(run===false)return;car.position.y=hb+.14*(.5+.5*Math.sin(t*.8));if(inr.pcb)inr.pcb.position.x=((t*.15)%.2)-.1}};
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
 K.box(.16,.25,.012,M.dark,-.28,1.3,D/2-.02,g);H.estop(g,.2,1.4,D/2-.012);K.cyl(.009,.012,P.green,.3,1.4,D/2-.012,g,'z',10);
 // Monitor box on the upper right of the front.
 K.box(.3,.24,.08,K.mat(0x9ea3a6,.5,.45),.3,1.22,D/2+.02,g);H.screen(g,.3,1.22,D/2+.06+.0125,.26,.17,H.card(s));
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
 H.nameplate(c,s,-.45,.56,zf+.02,.3,.07);L.lot(c,s,.75,.56,zf+.02);K.plate(c,'CE',.05,.05,.8,.2,zf+.02,'#ecebe5','#1c1b18');
 // Control box at the left end with the screen and the e-stop.
 K.box(.34,.14,.1,L.cream,-W/2+.17,Hc+.07,D/2-.05,g);K.box(.35,.15,.004,P.dark,-W/2+.17,Hc+.07,D/2-.003,g);H.screen(g,-W/2+.14,Hc+.075,D/2+.0125,.14,.08,H.card(s));H.estop(g,-W/2+.3,Hc+.07,D/2+.006);K.cyl(.009,.012,M.dark,-W/2+.04,Hc+.07,D/2+.006,g,'z',10);
 // Rails through, on the deck, boards; the row of eight fan units over them with their guard rings.
 const r=L.rails(g,W-.1,0,hb,-.18,.36,{sensor:false});const boards=[];for(let i=0;i<3;i++)boards.push(H.pcb(g,-.6+i*.6,hb+.004,-.18,.28,.28));
 const fans=[];for(let i=0;i<8;i++){const x=-W/2+.16+i*(W-.32)/7;K.cyl(.095,.02,M.dark,x,Hc+.01,.17,g,'y',24);K.cyl(.09,.012,M.steel,x,Hc+.026,.17,g,'y',24);
  const hold=H.grp(g,x,Hc+.03,.17);hold.rotation.x=-Math.PI/2;fans.push(H.fan(hold,0,0,0,.075,'z'));for(let k=0;k<2;k++)K.torus(.035+k*.03,.004,M.dark,x,Hc+.062,.17,g,'y',24)}
 for(const x of[-.45,.45])K.box(.8,.02,.3,L.creamD,x,Hc+.0,.17,g);H.hose(g,[[-W/2+.1,Hc,-.05],[-W/2-.03,Hc-.2,0],[-W/2-.03,.1,0]],.006,P.cableB);
 return {group:g,height:hb+.02,lamps,update:(t,run)=>{if(run===false)return;for(const f of fans)f.rotation.y=t*14;for(let i=0;i<3;i++)boards[i].position.x=((t*.25+i*.6+W)%(W-.3))-(W-.3)/2}};
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
 const L=lib(K),{H,P,M,T}=L,g=new T.Group(),lamps=[],W=1.0,D=.9,Ht=2.95;
 // Ivory steel portal: four posts, head frame, mid rails; polycarbonate panels on three sides.
 for(const sx of[-1,1])for(const sz of[-1,1])K.box(.07,Ht,.07,L.white,sx*(W/2-.035),Ht/2,sz*(D/2-.035),g);
 for(const y of[.4,1.65,Ht-.035]){for(const sz of[-1,1])K.box(W-.14,.07,.07,L.white,0,y,sz*(D/2-.035),g);for(const sx of[-1,1])K.box(.07,.07,D-.14,L.white,sx*(W/2-.035),y,0,g)}
 for(const sx of[-1,1])K.box(.1,.02,.1,M.dark,sx*(W/2-.035),.01,0,g);L.pads(g,W,D,.035);
 for(const sz of[-1,1])K.box(W-.14,Ht-.5,.006,L.tealGlass,0,.4+(Ht-.5)/2+.03,sz*(D/2-.035+.04*sz),g).castShadow=false;
 K.box(.006,Ht-.5,D-.14,L.tealGlass,-(W/2-.035)-.04,.4+(Ht-.5)/2+.03,0,g).castShadow=false;
 // Lift: belts from top pulleys to the floor, the drive motor on the head, the carriage with its roller bed.
 const bz=-D/2+.12;for(const sx of[-1,1]){K.cyl(.05,.05,M.dark,sx*.3,Ht-.1,bz,g,'x',16);K.cyl(.05,.05,M.dark,sx*.3,.2,bz,g,'x',16);K.box(.03,Ht-.3,.006,P.belt,sx*.3,Ht/2+.05,bz+.05,g);K.box(.03,Ht-.3,.006,P.belt,sx*.3,Ht/2+.05,bz-.05,g)}
 K.cyl(.02,.7,M.steel,0,Ht-.1,bz,g,'x',10);L.motor(g,0,Ht-.1,bz-.15,.04,.14,Math.PI/2);K.box(.06,Ht-.5,.06,P.alu,0,Ht/2,bz+.14,g);
 const car=new T.Group();g.add(car);car.position.set(0,.8,0);K.box(.7,.08,.08,L.white,0,0,bz+.05,car);for(const sz of[-1,1])K.box(.72,.06,.04,L.frameGrey,0,.02,sz*.3,car);
 const rollers=[];for(let i=0;i<7;i++)rollers.push(K.cyl(.025,.58,M.steel,-.3+i*.1,.04,0,car,'z',12));K.box(.08,.12,.06,M.dark,0,-.02,bz+.12,car);
 // Infeed / outfeed roller stubs through the front (low) and the right side (high); safety stickers; control cabinet.
 const stub=(x,y,z,ry)=>{const gg=H.grp(g,x,y,z,ry);for(const sz of[-1,1])K.box(.3,.06,.04,L.frameGrey,0,0,sz*.3,gg);for(let i=0;i<3;i++)K.cyl(.025,.58,M.steel,-.1+i*.1,.02,0,gg,'z',12);return gg};
 stub(0,.8,D/2+.1,Math.PI/2);stub(W/2+.1,2.4,0,0);
 for(const y of[1.0,2.0])H.warn(g,W/2-.035,y,D/2-.0,0,.09);K.plate(g,'LIFT',.3,.1,0,Ht-.1,D/2+.002,'#1c1b18','#e3b82e');
 const cb=H.grp(g,W/2+.08,1.3,-.1,Math.PI/2);K.box(.34,.5,.16,L.cream,0,0,0,cb);K.box(.31,.47,.004,P.dark,0,0,-.081,cb);H.screen(cb,0,.1,.08+.0125,.22,.14,H.card(s));H.keypad(cb,-.05,-.12,.086,4,2,.022);
 H.estop(cb,.09,-.12,.086);H.nameplate(cb,s,0,-.22,.086,.28,.07);L.lot(g,s,.3,2.6,D/2+.002);K.box(.06,.04,.1,M.dark,-W/2+.1,Ht-.5,-D/2-.05,g);L.lamp(g,-W/2+.1,Ht-.48,-D/2-.08,lamps);
 return {group:g,height:Ht+.15,lamps,update:(t,run)=>{if(run===false)return;const ph=(t*.25)%2,e=ph<1?(1-Math.cos(ph*Math.PI))/2:1-(1-Math.cos((ph-1)*Math.PI))/2;car.position.y=.8+1.6*e;for(const r of rollers)r.rotation.z=t*4}};
});

// ───────────────────────────── beltConveyor ─────────────────────────────
MB.add('beltConveyor',(K,s)=>{
 const L=lib(K),{H,P,M,T}=L,g=new T.Group(),incline=!!(s.opts&&s.opts.incline),Lx=2.5,bw=.46,ang=incline?.21:0,y0=incline?.36:.76;
 // The belt unit (side profiles, belt, end rollers, guides, drive) pivots about the low end for the incline.
 const u=new T.Group();g.add(u);u.position.set(-Lx/2,y0,0);u.rotation.z=ang;
 for(const sz of[-1,1]){K.box(Lx,.08,.04,P.alu,Lx/2,0,sz*(bw/2+.03),u);K.box(Lx-.1,.03,.02,P.alu,Lx/2,.065,sz*(bw/2+.02),u)}
 const belt=L.belt(u,Lx-.08,bw,Lx/2,.04,0,.03);for(const sx of[0,1])K.cyl(.045,bw+.02,M.dark,.04+sx*(Lx-.08),.0,0,u,'z',16);
 for(let i=0;i<5;i++)K.box(.03,.03,bw+.06,P.alu,.3+i*(Lx-.6)/4,-.055,0,u);
 L.motor(u,Lx-.3,-.12,-(bw/2+.12),.045,.16);K.box(.06,.1,.06,M.dark,Lx-.08,-.09,-(bw/2+.05),u);H.hose(u,[[Lx-.3,-.08,-(bw/2+.2)],[Lx-.6,-.2,-(bw/2+.1)],[Lx/2,-.2,-(bw/2+.05)]],.006,P.cableB);
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
 for(const sx of[-1,1])K.box(.06,.06,Dz-.12,L.white,sx*(Lx/2-.15),.3,0,g);L.motor(g,.6,hb-.2,-(Dz/2+.08),.045,.14);
 // Portal: posts, head beams and the x beam carrying the carriage; cable chain in its trough.
 for(const sx of[-1,1])for(const sz of[-1,1])K.box(.08,Hp,.08,L.white,sx*(Lx/2-.1),Hp/2,sz*(Dz/2+.15),g);for(const sx of[-1,1])K.box(.08,.12,Dz+.38,L.white,sx*(Lx/2-.1),Hp+.06,0,g);
 K.box(Lx-.12,.14,.14,L.white,0,Hp+.06,0,g);K.box(Lx-.3,.03,.03,M.steel,0,Hp+.06,.085,g);K.box(Lx-.2,.03,.1,M.dark,0,Hp+.14,-.1,g);
 const car=new T.Group();g.add(car);car.position.set(0,Hp+.06,0);K.box(.28,.22,.12,L.white,0,0,.14,car);for(const sy of[-1,1])K.box(.3,.02,.14,M.dark,0,sy*.12,.14,car);
 const zax=new T.Group();car.add(zax);zax.position.set(0,0,.3);K.box(.08,.9,.08,P.alu,0,-.3,0,zax);K.box(.12,.06,.12,M.dark,0,.1,0,zax);
 K.box(.34,.03,.26,P.alu,0,-.76,0,zax);for(const sx of[-1,1])for(const sz of[-1,1]){K.cyl(.012,.06,M.steel,sx*.12,-.8,sz*.09,zax,'y',8);K.cyl(.028,.015,M.black,sx*.12,-.835,sz*.09,zax,'y',14)}
 for(const sx of[-1,1]){K.box(.03,.12,.04,M.dark,sx*.19,-.82,0,zax);K.box(.012,.08,.03,M.steel,sx*.21,-.9,0,zax)}
 const chainG=new T.Group();car.add(chainG);H.cableChain(chainG,.0,-.7,.14,-.1);H.hose(g,[[-.8,Hp+.14,-.1],[-.95,Hp-.2,-.4],[-.95,1.0,-.5],[-.8,hb-.1,-.5]],.008,P.cableB);
 // Light-curtain posts at both ends, lamp tower, control box on a post, labels.
 for(const sx of[-1,1])for(const sz of[-1,1])L.lcPost(g,sx*(Lx/2+.05),sz*(Dz/2+.05),1.1,sz<0?Math.PI:0);
 K.box(.1,.04,.06,M.dark,-(Lx/2-.1)-.07,Hp-.42,-(Dz/2+.15),g);L.lamp(g,-(Lx/2-.1)-.1,Hp-.4,-(Dz/2+.15),lamps);K.box(.3,.4,.14,L.cream,Lx/2-.1,1.3,Dz/2+.17,g);K.box(.31,.41,.004,P.dark,Lx/2-.1,1.3,Dz/2+.099,g);H.screen(g,Lx/2-.1,1.38,Dz/2+.24+.0125,.22,.14,H.card(s));
 H.estop(g,Lx/2-.02,1.18,Dz/2+.24);H.keypad(g,Lx/2-.16,1.18,Dz/2+.24,3,2,.022);H.nameplate(g,s,-.5,hb-.05,Dz/2+.001,.3,.07);L.lot(g,s,.3,hb-.05,Dz/2+.001);H.warn(g,.7,hb-.05,Dz/2+.001,0,.06);
 return {group:g,height:Hp+.24,lamps,update:(t,run)=>{if(run===false)return;const ph=(t*.3)%2,e=ph<1?(1-Math.cos(ph*Math.PI))/2:1-(1-Math.cos((ph-1)*Math.PI))/2;car.position.x=-.6+1.2*e;
  zax.position.y=-.25*Math.max(0,Math.sin(t*.6*Math.PI));for(const b of belts)b.scroll(t*.4);chainG.position.x=0}};
});
})();
