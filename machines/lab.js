// Test and lab stations for the plant portal (window.MB builders, see machines/KINDS.md).
// Kinds: instrumentRack (opts.units, opts.style scope|meter|gen), tripodMeter, ftir, microscopeStation (opts.count),
// calibrationBench, reballingStation, pasteThawer, vacuumSealer (opts.count), duplicatorStation (opts.count),
// splicingStation, barcodeStation, esdRack, inspectionRack. Built at the origin, floor y=0, operator front +z,
// length along x, real metres. The benches are ESD benches (dark green / grey mats on a laminate top, grey
// square-tube steel frames with levelling feet, a lower shelf, drawers, an earth stud) with the instruments on them.
(function(){
'use strict';
const H0=window.MB.H;
const FONT='"IBM Plex Sans", system-ui, sans-serif',MONO='"IBM Plex Mono", ui-monospace, monospace';
const LIB=new WeakMap();
function lib(K){
 if(LIB.has(K))return LIB.get(K);
 const H=H0(K),P=H.P,M=K.M,T=K.THREE;
 const L={H,P,M,T,
  esd:K.mat(0x2f4a40,.05,.85),esdGrey:K.mat(0x4e585b,.05,.85),lam:K.mat(0xd3d5d1,.1,.6),frame:K.mat(0x7a8185,.55,.5),beige:K.mat(0xd8d2c1,.1,.6),cream:K.mat(0xe6e3da,.1,.6),
  maroon:K.mat(0x5c2130,.3,.5),grey:K.mat(0x9ca1a5,.4,.55),slate:K.mat(0x5a6167,.4,.55),dgrey:K.mat(0x3b4044,.4,.55),blackP:K.mat(0x1e2022,.3,.6),knob:K.mat(0xd9d7d0,.2,.5),knobD:K.mat(0x34373a,.3,.5),
  btn:K.mat(0xe8e6df,.1,.6),btnG:K.mat(0x878c90,.2,.6),ledR:K.mat(0x3a0f0c,0,.5,{emissive:0xff3b24,emissiveIntensity:1}),ledG:K.mat(0x0d2a14,0,.5,{emissive:0x3ee06a,emissiveIntensity:1}),
  lcdM:K.mat(0x8aa05a,0,.5,{emissive:0xa9c56a,emissiveIntensity:.45}),ss:K.mat(0xd6dadd,.5,.32),blue:K.mat(0x1f63b4,.3,.5),cable:K.mat(0x45494d,.2,.7),lens:K.mat(0x15171a,.3,.35),lensG:K.mat(0x2f4f86,.5,.15),
  foam:K.mat(0x2b2c2e,0,.95),olive:K.mat(0x4f5448,.3,.6),purple:K.mat(0x7a4aa8,.2,.5),vent:K.mat(0x2a2d30,.3,.7),panelG:K.mat(0x2e7d4f,.1,.6),lit:K.mat(0xf6f1dc,0,.5,{emissive:0xfff2c8,emissiveIntensity:.9}),
  film:K.mat(0xdfe6ea,.1,.2,{transparent:true,opacity:.35,depthWrite:false}),jar:K.mat(0xb9bcbe,.2,.5),cardboard:K.mat(0xb58a52,0,.85)};
 // ---------- textured planes and small lit windows
 const texC=new Map(),matC=new Map();
 const cached=(key,mk)=>{if(!texC.has(key))texC.set(key,mk());return texC.get(key)};
 const litMat=t=>{if(!t)return L.ledR;if(!matC.has(t))matC.set(t,K.mat(0x202020,0,.6,{map:t,emissive:0xffffff,emissiveMap:t,emissiveIntensity:.9}));return matC.get(t)};
 L.plane=(parent,w,h,x,y,z,draw,ry=0,rx=0)=>{const t=K.canvasTex(512,Math.max(32,Math.round(512*h/w)),draw);const m=new T.Mesh(K.keep(new T.PlaneGeometry(w,h)),t?K.mat(0xffffff,.1,.6,{map:t}):L.grey);m.position.set(x,y,z);m.rotation.set(rx,ry,0);parent.add(m);return m};
 // Legend painter: bg colour, outlined boxes [x,y,w,h] (fractions, y from the top) and texts [t,x,y,size,colour].
 L.legend=(bg,boxes,texts,fg='#3b3f44')=>(c,W,Hh)=>{c.fillStyle=bg;c.fillRect(0,0,W,Hh);c.strokeStyle='rgba(0,0,0,.3)';c.lineWidth=2;boxes.forEach(([x,y,w,h])=>c.strokeRect(x*W,y*Hh,w*W,h*Hh));
  texts.forEach(([t,x,y,sz,col])=>{c.fillStyle=col||fg;c.font=`600 ${Math.round(Hh*sz)}px ${FONT}`;c.fillText(t,x*W,y*Hh)})};
 // Red / green LED digit window on a face whose front surface is z (lines of text, right aligned).
 L.led=(parent,x,y,z,w,h,lines,color='#ff3b24')=>{K.box(w+.014,h+.014,.006,L.blackP,x,y,z+.003,parent);
  const t=cached('led'+lines.join('|')+color,()=>K.canvasTex(256,64*lines.length,(c,W,Hh)=>{c.fillStyle='#120e0e';c.fillRect(0,0,W,Hh);c.font=`700 46px ${MONO}`;c.textBaseline='middle';c.textAlign='right';c.shadowColor=color;c.shadowBlur=14;c.fillStyle=color;lines.forEach((s,i)=>c.fillText(s,W-14,32+i*64))}));
  return K.box(w,h,.004,litMat(t),x,y,z+.008,parent)};
 // Green LCD window with dark text.
 L.lcd=(parent,x,y,z,w,h,text)=>{K.box(w+.012,h+.012,.006,L.blackP,x,y,z+.003,parent);
  const t=cached('lcd'+text,()=>K.canvasTex(256,Math.max(32,Math.round(256*h/w)),(c,W,Hh)=>{c.fillStyle='#9fb85c';c.fillRect(0,0,W,Hh);c.fillStyle='#1f2a14';c.font=`600 ${Math.round(Hh*.55)}px ${MONO}`;c.textBaseline='middle';c.fillText(text,10,Hh/2,W-20)}));
  return K.box(w,h,.004,t?K.mat(0x9fb85c,0,.6,{map:t,emissive:0xffffff,emissiveMap:t,emissiveIntensity:.3}):L.lcdM,x,y,z+.008,parent)};
 // Knobs, buttons, BNC sockets on a face whose front surface is z.
 L.knob=(parent,x,y,z,r=.011,h=.012,m=L.knob,mark=L.knobD)=>{K.cyl(r,h,m,x,y,z+h/2,parent,'z',16);K.box(r*.25,r*1.1,.002,mark,x,y+r*.35,z+h+.001,parent)};
 L.btn=(parent,x,y,z,w=.011,h=.008,m=L.btn,d=.005)=>K.box(w,h,d,m,x,y,z+d/2,parent);
 L.btns=(parent,x,y,z,cols,rows,px,py,w,h,m=L.btn)=>{for(let i=0;i<cols;i++)for(let j=0;j<rows;j++)L.btn(parent,x+(i-(cols-1)/2)*px,y+(j-(rows-1)/2)*py,z,w,h,m)};
 L.rbtns=(parent,x,y,z,cols,rows,px,py,r,m=L.btn)=>{for(let i=0;i<cols;i++)for(let j=0;j<rows;j++)K.cyl(r,.004,m,x+(i-(cols-1)/2)*px,y+(j-(rows-1)/2)*py,z+.002,parent,'z',8)};
 L.bnc=(parent,x,y,z,ring=null)=>{K.cyl(.0065,.012,M.steel,x,y,z+.006,parent,'z',10);K.torus(.0065,.0022,M.dark,x,y,z+.011,parent,'z',12);if(ring)K.torus(.011,.002,ring,x,y,z+.002,parent,'z',14)};
 L.cableTo=(parent,pts,r=.006,m=L.cable)=>K.pipe(pts,r,m,parent);
 // ---------- screen contents
 L.wave=(c,W,Hh)=>{c.fillStyle='#0b1a26';c.fillRect(0,0,W,Hh);c.strokeStyle='#1f3a4c';c.lineWidth=1;for(let i=1;i<10;i++){c.beginPath();c.moveTo(W*i/10,0);c.lineTo(W*i/10,Hh);c.stroke()}for(let i=1;i<8;i++){c.beginPath();c.moveTo(0,Hh*i/8);c.lineTo(W,Hh*i/8);c.stroke()}
  c.strokeStyle='#f2d14a';c.lineWidth=3;c.beginPath();for(let x=0;x<=W;x+=4)c.lineTo(x,Hh*.45+Math.sin(x/W*Math.PI*6)*Hh*.2);c.stroke();c.strokeStyle='#5ad0f0';c.beginPath();for(let x=0;x<=W;x+=4)c.lineTo(x,Hh*.74+((Math.floor(x/W*12)%2)?Hh*.08:-Hh*.08));c.stroke();
  c.fillStyle='#d8dde2';c.font=`500 ${Math.round(Hh*.075)}px ${MONO}`;c.fillText('Ch1 1.00V  Ch2 500mV  M 4.0µs  5.0GS/s  Trig Ch1 ↑ 120mV',8,Hh*.95)};
 L.bars=(c,W,Hh)=>{['#ffffff','#ffff00','#00ffff','#00ff00','#ff00ff','#ff0000','#0000ff','#101010'].forEach((k,i)=>{c.fillStyle=k;c.fillRect(W*i/8,0,W/8+1,Hh*.75)});c.fillStyle='#202020';c.fillRect(0,Hh*.75,W,Hh*.25);c.fillStyle='#dddddd';c.font=`500 ${Math.round(Hh*.1)}px ${MONO}`;c.fillText('1920×1080  60Hz  LVDS 2ch',10,Hh*.9)};
 L.mpeg=(c,W,Hh)=>{c.fillStyle='#10161c';c.fillRect(0,0,W,Hh);c.fillStyle='#2a3f55';c.fillRect(0,0,W,Hh*.14);c.fillStyle='#e8eef2';c.font=`600 ${Math.round(Hh*.09)}px ${FONT}`;c.fillText('MPEG Player   TS 19.39 Mbps',10,Hh*.1);c.font=`500 ${Math.round(Hh*.08)}px ${MONO}`;
  ['PID 0x100  Video  H.264','PID 0x101  Audio  AAC','PID 0x1FFF Null','Loop: ON   Clock: 27 MHz'].forEach((s,i)=>{c.fillStyle=i%2?'#1a222b':'#151c24';c.fillRect(0,Hh*(.2+i*.18),W,Hh*.16);c.fillStyle='#cfd6dc';c.fillText(s,10,Hh*(.32+i*.18))});c.fillStyle='#3ee06a';c.fillRect(W*.05,Hh*.93,W*.6,Hh*.04)};
 L.pattern=(c,W,Hh)=>{['#ffffff','#f2d14a','#3fc1e8','#3fa66b','#c84ab8','#d2453b','#3d7ab8'].forEach((k,i)=>{c.fillStyle=k;c.fillRect(W*i/7,0,W/7+1,Hh)});c.fillStyle='#ffffff';c.fillRect(W*.35,Hh*.3,W*.3,Hh*.4);c.strokeStyle='#111';c.lineWidth=3;c.strokeRect(W*.35,Hh*.3,W*.3,Hh*.4)};
 L.spectrum=(c,W,Hh)=>{c.fillStyle='#f4f4f1';c.fillRect(0,0,W,Hh);c.strokeStyle='#c9ccce';c.lineWidth=1;for(let i=1;i<8;i++){c.beginPath();c.moveTo(W*i/8,Hh*.1);c.lineTo(W*i/8,Hh*.9);c.stroke()}c.strokeStyle='#b3202a';c.lineWidth=2;c.beginPath();
  for(let x=0;x<=W;x+=3){const u=x/W;let y=.2+.05*Math.sin(u*40);[[.18,.3],[.42,.5],[.55,.25],[.7,.6],[.82,.35]].forEach(([p,d])=>{y+=d*Math.exp(-((u-p)*(u-p))/.0006)});c.lineTo(x,Hh*(.1+y*.8))}c.stroke();c.fillStyle='#2b2d30';c.font=`500 ${Math.round(Hh*.07)}px ${FONT}`;c.fillText('LabSolutions IR   4000 – 400 cm⁻¹   %T',10,Hh*.97)};
 L.live=(c,W,Hh)=>{c.fillStyle='#2b2f33';c.fillRect(0,0,W,Hh);const g=c.createRadialGradient(W/2,Hh/2,10,W/2,Hh/2,W*.5);g.addColorStop(0,'#5c6b4a');g.addColorStop(1,'#1d2a1a');c.fillStyle=g;c.fillRect(W*.05,Hh*.08,W*.9,Hh*.84);c.fillStyle='#d9c27a';for(let i=0;i<6;i++)for(let j=0;j<4;j++)c.fillRect(W*(.2+i*.11),Hh*(.25+j*.16),W*.04,Hh*.06);c.strokeStyle='#3fe06a';c.lineWidth=2;c.strokeRect(W*.4,Hh*.35,W*.2,Hh*.3);c.fillStyle='#e8e8e4';c.font=`500 ${Math.round(Hh*.07)}px ${MONO}`;c.fillText('x35   LIVE',10,Hh*.97)};
 L.keysTex=()=>cached('keys',()=>K.canvasTex(256,96,(c,W,Hh)=>{c.fillStyle='#2a2d30';c.fillRect(0,0,W,Hh);c.fillStyle='#4a4e52';for(let y=6;y<Hh-6;y+=15)for(let x=6;x<W-6;x+=16)c.fillRect(x,y,12,11)}));
 L.meshTex=()=>cached('mesh',()=>K.canvasTex(128,128,(c,W,Hh)=>{c.fillStyle='#141618';c.fillRect(0,0,W,Hh);c.strokeStyle='#4a4f54';c.lineWidth=2;for(let i=0;i<=W;i+=8){c.beginPath();c.moveTo(i,0);c.lineTo(i,Hh);c.stroke();c.beginPath();c.moveTo(0,i);c.lineTo(W,i);c.stroke()}}));
 L.railTex=()=>cached('rail',()=>K.canvasTex(32,1024,(c,W,Hh)=>{c.fillStyle='#232527';c.fillRect(0,0,W,Hh);c.fillStyle='#6b7075';for(let y=6;y<Hh;y+=18)c.fillRect(11,y,10,9)}));
 // ---------- ESD bench: laminate top with the mat, square-tube frame, feet, shelf, rear cable trough, earth stud, label, drawers.
 L.bench=(parent,w,d,x,z,h=.76,top=L.esd,drawers=true)=>{const g=H.grp(parent,x,0,z);K.box(w,.03,d,L.lam,0,h-.03,0,g);K.box(w-.02,.012,d-.02,top,0,h-.009,0,g);
  const lh=h-.045;for(const sx of[-1,1])for(const sz of[-1,1]){K.box(.05,lh-.03,.05,L.frame,sx*(w/2-.07),.03+(lh-.03)/2,sz*(d/2-.07),g);K.cyl(.028,.03,M.dark,sx*(w/2-.07),.015,sz*(d/2-.07),g,'y',10)}
  for(const sz of[-1,1])K.box(w-.14,.04,.04,L.frame,0,lh-.02,sz*(d/2-.07),g);for(const sx of[-1,1])K.box(.04,.04,d-.14,L.frame,sx*(w/2-.07),lh-.02,0,g);
  K.box(w-.19,.02,d-.19,L.dgrey,0,.2,0,g);for(const sz of[-1,1])K.box(w-.14,.03,.03,L.frame,0,.185,sz*(d/2-.07),g);for(const sx of[-1,1])K.box(.03,.03,d-.19,L.frame,sx*(w/2-.07),.185,0,g);
  K.box(w-.3,.05,.06,L.dgrey,0,lh-.025,-(d/2-.1),g);K.cyl(.006,.014,P.yellow,-(w/2-.12),h-.03,d/2+.007,g,'z',8);K.plate(g,'ESD PROTECTED AREA',.2,.022,w/2-.18,h-.03,d/2+.006,'#e3b82e','#1c1b18');
  if(drawers){for(const sx of[-1,1]){const dx=sx*(w/2-.33);K.box(.42,.1,d-.2,L.frame,dx,lh-.09,0,g);K.box(.46,.11,.02,L.lam,dx,lh-.09,d/2-.01,g);K.box(.47,.115,.004,M.dark,dx,lh-.09,d/2-.021,g);H.handle(g,dx,lh-.09,d/2+.004,.16,false)}}
  g.userData={h,w,d,lh};return g};
 // Nameplate and brand band on the bench's right drawer front (facing +z).
 L.benchName=(b,s)=>{const {w,d,lh}=b.userData;H.nameplate(b,s,-(w/2-.33),lh-.085,d/2+.007,.36,.07);H.logoBand(b,s,.4,w/2-.33,lh-.06,d/2+.007,.03);K.plate(b,'LOT '+(s.lot||''),.1,.03,w/2-.33,lh-.11,d/2+.007,'#e3b82e','#1c1b18')};
 // Monitor on a foot (card on the screen), keyboard, mouse, laptop, PC tower.
 L.monitor=(parent,s,x,y,z,w=.5,h=.3,draw=null,ry=0)=>{const g=H.grp(parent,x,y,z,ry);K.box(.24,.012,.16,L.blackP,0,.006,0,g);K.box(.05,.14,.03,L.blackP,0,.08,-.02,g);H.screen(g,0,.13+h/2,0,w,h,draw||H.card(s));K.box(.006,.006,.003,L.ledG,w/2-.008,.142,.015,g);
  L.cableTo(g,[[0,.08,-.035],[0,.02,-.1],[0,-.02,-.25]],.005);return g};
 L.keyboard=(parent,x,y,z,ry=0,w=.42,d=.14)=>{const t=L.keysTex();const m=K.box(w,.014,d,t?K.mat(0xffffff,.1,.7,{map:t}):L.dgrey,x,y+.007,z,parent);m.rotation.y=ry;return m};
 L.mouse=(parent,x,y,z)=>{K.box(.06,.03,.1,L.dgrey,x,y+.015,z,parent);K.box(.062,.004,.03,L.blackP,x,y+.031,z-.02,parent);L.cableTo(parent,[[x,y+.01,z-.05],[x-.02,y+.004,z-.12],[x-.06,y+.004,z-.22]],.003)};
 L.laptop=(parent,s,x,y,z,ry=0)=>{const g=H.grp(parent,x,y,z,ry);K.box(.34,.018,.24,L.dgrey,0,.009,0,g);L.keyboard(g,0,.018,-.01,0,.28,.1);K.box(.08,.002,.05,L.grey,0,.019,.08,g);const lid=H.grp(g,0,.018,-.12);lid.rotation.x=-1.75;K.box(.34,.23,.012,L.dgrey,0,.115,0,lid);H.screen(lid,0,.12,.0125,.3,.19,H.card(s));return g};
 L.tower=(parent,s,x,y,z)=>{const g=H.grp(parent,x,y,z);K.box(.18,.4,.42,L.dgrey,0,.2,0,g);K.box(.17,.39,.012,L.blackP,0,.2,.216,g);K.box(.12,.012,.004,L.grey,0,.34,.224,g);K.cyl(.006,.005,L.ledG,-.05,.3,.224,g,'z',8);K.cyl(.006,.005,L.ledR,-.03,.3,.224,g,'z',8);H.nameplate(g,s,0,.12,.225,.16,.05);return g};
 // Tripod (three legs on rubber feet, centre column, pan head) at x,z; returns the top of the head.
 L.tripod=(parent,x,z,hubY=.95,spread=.28)=>{const g=H.grp(parent,x,0,z);for(let i=0;i<3;i++){const a=Math.PI/2+i*Math.PI*2/3,ex=Math.cos(a)*spread,ez=Math.sin(a)*spread;K.pipe([[ex*.12,hubY-.02,ez*.12],[ex,.02,ez]],.012,L.blackP,g);K.sphere(.02,P.rubber,ex,.02,ez,g,10);K.pipe([[ex*.1,hubY*.55,ez*.1],[0,hubY*.6,0]],.005,M.steel,g)}
  K.cyl(.04,.05,L.blackP,0,hubY,0,g,'y',12);K.cyl(.014,.2,M.steel,0,hubY+.1,0,g,'y',10);K.box(.09,.05,.09,L.blackP,0,hubY+.225,0,g);K.cyl(.012,.014,L.knobD,.055,hubY+.21,0,g,'x',10);K.pipe([[0,hubY+.23,.045],[.02,hubY+.2,.22]],.008,L.blackP,g);K.sphere(.012,P.rubber,.02,hubY+.2,.22,g,8);return {g,top:hubY+.25}};
 // Olympus SZ61 style stereo microscope standing on yb.
 L.stereo=(parent,x,z,yb)=>{const g=H.grp(parent,x,yb,z);K.box(.24,.025,.32,P.white,0,.0125,0,g);K.cyl(.05,.006,L.blackP,0,.028,.05,g,'y',20);K.cyl(.022,.3,P.white,0,.175,-.11,g,'y',14);
  const car=H.grp(g,0,.3,-.11);K.box(.07,.07,.08,P.white,0,0,0,car);for(const sx of[-1,1])K.cyl(.026,.016,L.blackP,sx*.045,0,0,car,'x',16);K.box(.09,.09,.11,P.white,0,.03,.1,car);K.cyl(.032,.05,L.blackP,0,-.05,.1,car,'y',14);K.torus(.038,.008,L.lit,0,-.078,.1,car,'y',20);
  for(const sx of[-1,1]){const e=H.grp(car,sx*.03,.07,.12);e.rotation.x=.8;K.cyl(.016,.1,L.blackP,0,.05,0,e,'y',12);K.cyl(.018,.012,L.knobD,0,.1,0,e,'y',12)}K.plate(g,'OLYMPUS',.06,.012,-.05,.013,.161,'#f2f1ec','#2b2d30');K.cyl(.004,.004,L.ledG,.08,.012,.161,g,'z',6);return g};
 // Hirox digital microscope: XY stage on a black base, column with the focus knob, camera head with the lens, control box.
 L.hirox=(parent,x,z,yb)=>{const g=H.grp(parent,x,yb,z);K.box(.46,.06,.42,L.blackP,0,.03,0,g);K.box(.36,.03,.3,L.dgrey,-.03,.075,.03,g);K.box(.3,.025,.24,L.blackP,-.03,.1025,.03,g);K.cyl(.018,.03,L.knobD,.17,.075,.03,g,'x',14);K.cyl(.018,.03,L.knobD,-.03,.075,.19,g,'z',14);
  K.box(.1,.6,.1,L.blackP,.16,.36,-.14,g);K.cyl(.035,.03,L.knobD,.23,.5,-.14,g,'x',16);K.box(.25,.05,.06,L.blackP,.065,.47,-.1,g);const head=H.grp(g,-.03,.45,.03);K.box(.06,.1,.07,M.steel,0,0,0,head);K.cyl(.02,.14,L.blackP,0,-.12,0,head,'y',12);K.cyl(.025,.03,L.knobD,0,-.2,0,head,'y',12);K.box(.06,.02,.08,L.blackP,0,0,-.07,head);
  L.cableTo(g,[[-.03,.5,.03],[0,.62,-.05],[.16,.68,-.14],[.2,.5,-.2]],.008,L.blackP);K.box(.12,.08,.1,L.grey,.22,.17,.12,g);K.cyl(.004,.004,L.ledG,.18,.19,.172,g,'z',6);K.cyl(.004,.004,L.ledR,.2,.19,.172,g,'z',6);K.plate(g,'HIROX',.07,.016,.0,.03,.211,'#1e2022','#f2f1ec');return g};
 // Articulated magnifier ring lamp clamped at x,z (arm reaches towards +x).
 L.magLamp=(parent,x,z,yb,ry=0,post=.3)=>{const g=H.grp(parent,x,yb,z,ry);K.box(.06,.1,.06,L.dgrey,0,.05,0,g);K.cyl(.012,post,P.white,0,.1+post/2,0,g,'y',10);const a1=H.grp(g,0,.1+post,0);a1.rotation.z=.6;K.cyl(.012,.3,P.white,0,.15,0,a1,'y',10);K.pipe([[.02,.05,0],[.02,.26,0]],.004,M.steel,a1);
  const a2=H.grp(a1,0,.3,0);a2.rotation.z=-1.6;K.cyl(.012,.27,P.white,0,.135,0,a2,'y',10);K.sphere(.02,L.dgrey,0,0,0,a2,10);const hd=H.grp(a2,0,.27,0);hd.rotation.x=.9;K.torus(.075,.022,P.white,0,0,0,hd,'y',24);K.cyl(.06,.006,P.glass,0,0,0,hd,'y',20).castShadow=false;K.torus(.07,.01,L.lit,0,-.012,0,hd,'y',24);return g};
 // ---------- 19-inch instruments: chassis + front panels by style. Each face paints on a plane .006 proud of the panel.
 L.faceScope=(g,s,w,h,fz)=>{const sw=w*.46,sh=h*.7;L.plane(g,w,h,0,h/2,fz+.006,L.legend('#d9d3c1',[[.56,.08,.42,.3],[.56,.42,.42,.28],[.56,.74,.42,.2]],[['Tektronix  TDS 5054  Digital Phosphor Oscilloscope',.03,.09,.085],['HORIZONTAL',.58,.07,.06],['TRIGGER',.8,.07,.06],['VERTICAL',.58,.41,.06],['CH1',.58,.98,.05],['CH2',.68,.98,.05],['CH3',.78,.98,.05],['CH4',.88,.98,.05]]));
  H.screen(g,-w/2+.03+sw/2,h*.57,fz+.006+.0125,sw,sh,L.wave);const kx=w*.08;
  for(let i=0;i<4;i++){L.knob(g,kx+i*w*.1,h*.33,fz+.007,.011,.012);L.knob(g,kx+i*w*.1,h*.5,fz+.007,.008,.01,L.knobD,L.knob);L.btn(g,kx+i*w*.1,h*.19,fz+.007,.014,.009,[P.yellow,L.lensG,P.red,P.green][i]);L.bnc(g,kx+i*w*.1,h*.085,fz+.007,[P.yellow,L.lensG,P.red,P.green][i])}
  L.knob(g,kx,h*.8,fz+.007,.012,.012);L.knob(g,kx+w*.12,h*.8,fz+.007,.009,.01,L.knobD,L.knob);L.knob(g,w/2-.04,h*.8,fz+.007,.012,.012);L.knob(g,w/2-.04,h*.52,fz+.007,.009,.01,L.knobD,L.knob);
  L.btns(g,kx+w*.25,h*.74,fz+.007,4,3,.016,.016,.011,.008);L.btns(g,kx+w*.1,h*.62,fz+.007,8,1,.02,.016,.011,.008,L.btnG);L.bnc(g,-w/2+.05,h*.085,fz+.007);K.box(.07,.006,.008,L.blackP,w/2-.06,h*.93,fz+.01,g);K.cyl(.006,.004,L.ledG,-w/2+.025,h*.085,fz+.009,g,'z',8)};
 L.faceMeter=(g,s,w,h,fz)=>{L.plane(g,w,h,0,h/2,fz+.006,L.legend('#e2ded2',[[.58,.1,.4,.8]],[['YOKOGAWA  WT210  DIGITAL POWER METER',.03,.1,.1],['V',.46,.3,.14],['A',.46,.55,.14],['W',.46,.8,.14],['VOLTAGE  CURRENT  HOLD',.6,.2,.07],['START  STOP  RESET',.6,.52,.07],['LOCAL  SETUP',.6,.86,.07]]));
  const lx=-w/2+.1;[['  220.3'],['  1.254'],['  276.1']].forEach((t,i)=>L.led(g,lx,h*.78-i*h*.26,fz+.006,.15,.018,t));
  L.btns(g,w*.3,h*.68,fz+.007,3,1,.03,.02,.02,.009);L.btns(g,w*.3,h*.42,fz+.007,3,1,.03,.02,.02,.009);L.btns(g,w*.28,h*.18,fz+.007,2,1,.03,.02,.02,.009);L.btns(g,w*.16,h*.4,fz+.007,2,2,.016,.02,.011,.008,L.btnG);
  K.box(.012,.008,.006,L.blue,-w/2+.03,h*.15,fz+.009,g);K.cyl(.006,.006,L.btn,-w/2+.03,h*.75,fz+.009,g,'z',10)};
 L.faceGenM=(g,s,w,h,fz)=>{L.plane(g,w,h,0,h/2,fz+.006,L.legend('#5c2130',[],[['PROGRAMMABLE VIDEO PATTERN GENERATOR',.2,.12,.075,'#f2d14a'],['MSPG - 5400QL',.4,.95,.07,'#e8e2d8'],['EASY JOG / ENTER',.78,.12,.06,'#e8e2d8'],['master',.03,.12,.09,'#e8e2d8']]));
  const sw=w*.36,sh=h*.68;H.screen(g,-w/2+.06+sw/2,h*.5,fz+.006+.0125,sw,sh,L.bars);K.cyl(.006,.004,L.ledG,-w/2+.025,h*.8,fz+.009,g,'z',8);K.box(.012,.006,.004,M.steel,-w/2+.025,h*.5,fz+.009,g);
  L.rbtns(g,w*.14,h*.7,fz+.007,7,3,.013,.013,.0045);L.rbtns(g,w*.16,h*.3,fz+.007,9,3,.013,.013,.0045);L.knob(g,w/2-.045,h*.62,fz+.007,.02,.014,L.knob,L.knobD);K.torus(.023,.003,L.knobD,w/2-.045,h*.62,fz+.008,g,'z',20);
  L.rbtns(g,w/2-.045,h*.2,fz+.007,3,1,.013,.013,.0045);K.plate(g,'EXEMPT',.04,.012,-w/2+.06+sw*.8,h*.09,fz+.007,'#e3b82e','#1c1b18')};
 L.faceGenG=(g,s,w,h,fz)=>{L.plane(g,w,h,0,h/2,fz+.006,L.legend('#dcdcd8',[[.04,.12,.42,.78],[.5,.12,.2,.25],[.72,.12,.24,.76]],[['ShibaSoku  TG39  MULTI TEST SIGNAL GENERATOR',.5,.1,.065],['VIDEO',.06,.1,.06],['SOUND MPX',.5,.45,.06],['TELETEXT',.74,.45,.06],['REMOTE   KEY',.74,.1,.06]]));
  for(const sx of[-1,1]){K.box(.016,h-.01,.012,L.blue,sx*(w/2-.012),h/2,fz+.012,g);K.cyl(.005,h*.6,M.steel,sx*(w/2-.012),h/2,fz+.03,g,'y',8);for(const sy of[-1,1])K.cyl(.005,.02,M.steel,sx*(w/2-.012),h/2+sy*h*.3,fz+.022,g,'z',8)}
  L.btns(g,-w*.27,h*.52,fz+.007,8,5,.019,.013,.012,.008,L.btnG);L.lcd(g,w*.1,h*.76,fz+.006,.13,.022,'MULTI TEST SIG  PAL 1.0V');L.btns(g,w*.12,h*.38,fz+.007,6,3,.016,.014,.011,.008,L.btnG);L.btns(g,w*.36,h*.5,fz+.007,3,5,.018,.014,.011,.008,L.btnG);
  L.bnc(g,-w/2+.045,h*.14,fz+.007);L.bnc(g,w/2-.045,h*.14,fz+.007);for(let i=0;i<4;i++)K.cyl(.003,.004,L.ledR,w*.3+i*.012,h*.18,fz+.009,g,'z',6)};
 L.faceAmp=(g,s,w,h,fz)=>{L.plane(g,w,h,0,h/2,fz+.006,L.legend('#d6d0bf',[],[['EIDEN   WIDE BAND BOOST AMP   MODEL 4013A',.1,.16,.08],['POWER',.09,.9,.06],['FAN ALM   OVER',.28,.5,.06],['LEVEL ADJ',.6,.5,.06],['RF INPUT',.82,.2,.055],['RF OUTPUT',.82,.62,.055]]));
  for(const sx of[-1,1]){K.box(.028,h,.012,M.steel,sx*(w/2-.014),h/2,fz+.012,g);K.cyl(.006,h*.7,M.steel,sx*(w/2-.014),h/2,fz+.034,g,'y',8);for(const sy of[-1,1])K.cyl(.006,.02,M.steel,sx*(w/2-.014),h/2+sy*h*.35,fz+.025,g,'z',8)}
  K.box(.022,.032,.01,L.blackP,-w/2+.07,h*.38,fz+.011,g);K.box(.012,.018,.004,L.ledG,-w/2+.07,h*.42,fz+.018,g);for(let i=0;i<2;i++)K.cyl(.003,.004,i?L.ledR:L.ledG,-w*.17+i*.025,h*.38,fz+.009,g,'z',6);
  K.plate(g,'EXEMPT',.05,.013,w*.12,h*.78,fz+.007,'#e3b82e','#1c1b18');K.plate(g,'Samsung Electronics  1500001338',.12,.03,-w*.02,h*.4,fz+.007,'#f4f3ee','#1c1b18');L.knob(g,w*.3,h*.36,fz+.007,.006,.008,L.knobD,L.knob);
  for(const y of[h*.72,h*.3]){K.cyl(.008,.014,M.steel,w/2-.08,y,fz+.013,g,'z',6);K.cyl(.0055,.016,M.steel,w/2-.08,y,fz+.02,g,'z',10);K.torus(.009,.0025,M.dark,w/2-.08,y,fz+.02,g,'z',12)}};
 L.faceMtx=(g,s,w,h,fz)=>{L.plane(g,w,h,0,h/2,fz+.006,L.legend('#4b5055',[],[['Tektronix  MTX100B  MPEG Recorder & Player',.04,.1,.07,'#e8e8e4'],['Menu',.76,.12,.06,'#e8e8e4'],['Enter',.84,.5,.05,'#e8e8e4'],['Play/Pause   Rec   Stop',.1,.97,.05,'#e8e8e4'],['USB',.86,.9,.05,'#e8e8e4']]));
  const sw=w*.44,sh=h*.6;H.screen(g,-w/2+.04+sw/2,h*.52,fz+.006+.0125,sw,sh,L.mpeg);L.btns(g,-w/2+.11,h*.1,fz+.007,4,1,.03,.02,.018,.009,L.btnG);
  const dx=w*.3,dy=h*.55;K.cyl(.024,.006,L.knobD,dx,dy,fz+.009,g,'z',24);K.cyl(.009,.004,L.btnG,dx,dy,fz+.013,g,'z',12);for(const[ax,ay]of[[0,1],[0,-1],[1,0],[-1,0]])K.box(.008,.008,.003,L.btnG,dx+ax*.016,dy+ay*.016,fz+.014,g);
  L.btns(g,dx,h*.85,fz+.007,2,1,.02,.02,.012,.008,L.btnG);L.btns(g,dx,h*.25,fz+.007,2,1,.02,.02,.012,.008,L.btnG);for(let i=0;i<2;i++)K.box(.008,.014,.006,M.steel,w/2-.04+i*.014,h*.22,fz+.009,g);K.cyl(.0035,.004,L.ledR,-w/2+.02,h*.9,fz+.009,g,'z',6)};
 L.faceCA=(g,s,w,h,fz)=>{L.plane(g,w,h,0,h/2,fz+.006,L.legend('#585f66',[],[['POWER',.05,.2,.08,'#e8e8e4'],['CA-310',.08,.92,.1,'#e8e8e4'],['0-CAL   MODE   REMOTE   HOLD   MR   MEMORY CH',.26,.92,.055,'#e8e8e4'],['KONICA MINOLTA',.7,.12,.06,'#e8e8e4']]));
  K.box(.008,.022,.012,L.blackP,-w/2+.03,h*.5,fz+.012,g);K.box(.004,.012,.004,L.btn,-w/2+.03,h*.56,fz+.02,g);L.led(g,-w/2+.1,h*.6,fz+.006,.1,.044,[' x 0.313',' y 0.329',' Lv 250.0']);
  L.lcd(g,w*.27,h*.72,fz+.006,.05,.024,'CA-310');L.btns(g,w*.27,h*.33,fz+.007,4,4,.011,.009,.008,.006);K.box(.01,.007,.004,P.orange,-w/2+.07,h*.13,fz+.009,g);L.btns(g,-w*.02,h*.13,fz+.007,4,1,.028,.01,.018,.007);
  for(let i=0;i<2;i++)K.box(.012,.006,.004,L.btn,w*.43,h*.7-i*.03,fz+.009,g)};
 L.UNIT={scope:{w:.46,h:.18,d:.44,body:L.beige,face:L.faceScope},meter:{w:.42,h:.1,d:.4,body:L.cream,face:L.faceMeter},genM:{w:.43,h:.13,d:.42,body:L.maroon,face:L.faceGenM},genG:{w:.44,h:.13,d:.45,body:L.grey,face:L.faceGenG},amp:{w:.48,h:.13,d:.45,body:L.beige,face:L.faceAmp},mtx:{w:.43,h:.19,d:.4,body:L.slate,face:L.faceMtx},ca:{w:.26,h:.1,d:.3,body:L.slate,face:L.faceCA}};
 // One instrument standing with its bottom at y0 (rubber feet below when standalone); front face at z + d/2 + .012.
 L.unit=(parent,s,style,x,y0,z,standalone=true)=>{const u=L.UNIT[style]||L.UNIT.scope,g=H.grp(parent,x,y0,z);K.box(u.w,u.h,u.d,u.body,0,u.h/2,0,g);K.box(u.w-.01,u.h-.01,.012,u.body,0,u.h/2,u.d/2+.006,g);u.face(g,s,u.w,u.h,u.d/2+.012);
  if(standalone)for(const sx of[-1,1])for(const sz of[-1,1])K.cyl(.012,.01,P.rubber,sx*(u.w/2-.03),-.005,sz*(u.d/2-.04),g,'y',8);
  for(let i=0;i<3;i++)K.cyl(.006,.01,M.dark,-u.w/2+.05+i*.04,u.h*.5,-u.d/2-.005,g,'z',8);K.box(u.w*.5,u.h*.6,.004,L.vent,u.w*.15,u.h*.5,-u.d/2-.002,g);g.userData=u;return g};
 LIB.set(K,L);return L;
}

// 19-inch instrument rack: black open frame on castors with punched front rails, trays, the instruments with their rack
// ears and vent gaps, BNC cables drooping to the side, a power strip at the back, nameplate on the top fascia.
MB.add('instrumentRack',(K,s)=>{const L=lib(K),H=L.H,P=L.P,M=L.M,T=L.T,g=new T.Group(),o=s.opts||{},name=s.name||'';
 let style=o.style||'scope';
 if(/eiden.*(amp|4013)|boost amp/i.test(name))style='amp';else if(/mtx/i.test(name))style='mtx';else if(/master|mspg/i.test(name))style='genM';else if(/shibasoku|r&s|sfe|eiden|tg39/i.test(name))style='genG';
 else if(/wt ?210|power meter/i.test(name))style='meter';else if(/tds|oscillo|scope/i.test(name))style='scope';else if(style==='gen')style='genM';
 const units=Math.max(3,Math.min(12,+(o.units||s.count||8))),RW=.62,RD=.72,RH=1.9,u=L.UNIT[style];
 K.box(RW,.1,RD,L.blackP,0,.17,0,g);H.castors(g,RW,RD,.1,.045);H.logoBand(g,s,RW-.1,0,.17,RD/2+.007,.04);
 for(const sx of[-1,1])for(const sz of[-1,1])K.box(.04,RH-.25,.04,L.blackP,sx*(RW/2-.02),.22+(RH-.25)/2,sz*(RD/2-.02),g);
 for(const sx of[-1,1]){const t=L.railTex();const m=new T.Mesh(K.keep(new T.PlaneGeometry(.04,RH-.25)),t?K.mat(0xffffff,.3,.6,{map:t}):L.blackP);m.position.set(sx*(RW/2-.02),.22+(RH-.25)/2,RD/2+.006);g.add(m)}
 for(const sz of[-1,1])K.box(RW-.08,.04,.04,L.blackP,0,.24,sz*(RD/2-.02),g);for(const sx of[-1,1]){K.box(.04,.04,RD-.08,L.blackP,sx*(RW/2-.02),RH-.08,0,g);K.box(.04,.04,RD-.08,L.blackP,sx*(RW/2-.02),.24,0,g)}
 K.box(RW+.02,.03,RD+.02,L.dgrey,0,RH-.045,0,g);K.box(RW,.1,.02,L.dgrey,0,RH-.11,RD/2-.01,g);H.nameplate(g,s,0,RH-.11,RD/2+.007,.46,.08);
 K.box(.4,.04,.05,L.blackP,0,.28,-RD/2+.06,g);for(let i=0;i<6;i++)K.cyl(.012,.004,L.dgrey,-.15+i*.06,.28,-RD/2+.087,g,'z',10);
 H.warn(g,RW/2-.08,.17,RD/2+.007,0,.06);K.plate(g,'LOT '+(s.lot||''),.1,.035,-RW/2+.1,.17,RD/2+.008,'#e3b82e','#1c1b18');
 let y=.3,n=0;const cz=RD/2-.012-u.d/2;
 for(let i=0;i<units&&y+u.h<=RH-.14;i++,n++){K.box(RW-.1,.01,u.d+.04,L.dgrey,0,y-.005,cz,g);const ug=L.unit(g,s,style,0,y,cz,false);
  for(const sx of[-1,1])K.box(RW/2-.04-u.w/2,u.h,.012,L.blackP,sx*((u.w/2+RW/2-.04)/2),u.h/2,u.d/2+.012,ug);
  if(i%3===1&&/scope|genG|amp/.test(style)){const bx=style==='amp'?u.w/2-.08:style==='scope'?u.w*.08:-u.w/2+.045,by=style==='amp'?u.h*.72:u.h*.1;L.cableTo(g,[[bx,y+by,RD/2+.012],[bx+.04,y+by-.06,RD/2+.08],[RW/2+.03,y-.1,RD/2-.1],[RW/2+.03,.32,-.1]],.005,L.blackP)}
  L.cableTo(g,[[u.w*.2,y+u.h*.5,cz-u.d/2-.01],[u.w*.25,y+u.h*.3,-RD/2+.1],[-.1+i*.03,.3,-RD/2+.08]],.004,L.cable);y+=u.h+.03}
 return {group:g,height:RH-.03,update:(t,run)=>{L.ledG.emissiveIntensity=run?.7+.3*Math.sin(t*3):.3}};
});

// Display measurement station: grey ESD bench with a black backdrop, the sample display on its stand, the CS-3000
// spectroradiometer on a tripod aimed at it, the CA-310 analyser with its probe on the panel and a laptop.
MB.add('tripodMeter',(K,s)=>{const L=lib(K),H=L.H,P=L.P,M=L.M,T=L.T,g=new T.Group();
 const bh=.76,b=L.bench(g,1.4,.6,0,-.15,bh,L.esdGrey);L.benchName(b,s);
 K.box(.9,.72,.02,L.blackP,-.2,bh+.36,-.43,g);for(const sx of[-1,1])K.box(.06,.08,.1,L.blackP,-.2+sx*.4,bh+.04,-.38,g);H.logoBand(g,s,.86,-.2,bh+.69,-.413,.03);
 const dx=-.3,dz=-.26;K.box(.26,.015,.16,L.blackP,dx,bh+.0075,dz,g);K.box(.05,.1,.03,L.blackP,dx,bh+.06,dz-.03,g);H.screen(g,dx,bh+.27,dz,.52,.32,L.pattern);
 const px=dx+.12,py=bh+.24;K.cyl(.022,.09,L.blackP,px,py,dz+.016+.045,g,'z',14);K.torus(.024,.006,P.rubber,px,py,dz+.02,g,'z',14);K.box(.03,.02,.03,L.dgrey,px,py-.02,dz+.07,g);
 const ca=L.unit(g,s,'ca',.3,bh+.01,-.2,true);L.cableTo(g,[[px,py,dz+.065],[px+.1,py-.1,dz+.15],[.22,bh+.03,.05],[.3,bh+.05,-.03]],.005,L.cable);L.cableTo(g,[[.3,bh+.06,-.355],[.3,bh-.05,-.42],[.3,.2,-.42]],.005);
 L.laptop(g,s,.52,bh,-.08,-.3);
 const tr=L.tripod(g,-.3,.2,.95,.28);const cam=H.grp(g,-.3,tr.top,.2);cam.rotation.x=-.1;K.box(.14,.17,.3,L.blackP,0,.085,0,cam);K.cyl(.035,.07,L.blackP,0,.1,-.185,cam,'z',16);K.torus(.04,.008,L.blackP,0,.1,-.225,cam,'z',16);K.cyl(.028,.004,L.lensG,0,.1,-.222,cam,'z',16);K.torus(.03,.004,M.steel,0,.1,-.2,cam,'z',16);
 for(const sz of[-1,1])K.box(.02,.05,.02,L.blackP,0,.195,sz*.06,cam);K.box(.02,.02,.14,L.blackP,0,.23,0,cam);K.plate(cam,'KONICA MINOLTA',.12,.02,.071,.13,.0,'#1e2022','#f2f1ec',Math.PI/2);K.plate(cam,'SPECTRORADIOMETER CS-3000',.12,.012,.071,.05,.0,'#1e2022','#c9ccce',Math.PI/2);
 L.plane(cam,.06,.06,.071,.1,-.09,(c,W,Hh)=>{c.fillStyle='#1e2022';c.fillRect(0,0,W,Hh);c.fillStyle='#55595e';for(let yy=14;yy<Hh;yy+=22)for(let xx=14;xx<W;xx+=22){c.beginPath();c.arc(xx,yy,6,0,7);c.fill()}},Math.PI/2);K.box(.012,.01,.006,L.blackP,.07,.06,.04,cam);K.cyl(.004,.004,L.ledG,.071,.06,.06,cam,'x',6);
 L.cableTo(g,[[-.23,tr.top+.06,.3],[-.1,1.05,.32],[.35,bh+.05,.1],[.52,bh+.02,-.02]],.005,L.cable);K.plate(g,'LOT '+(s.lot||''),.1,.035,.1,bh+.6,-.413,'#e3b82e','#1c1b18');
 return {group:g,height:1.5};
});

// Benchtop FTIR (Shimadzu IRAffinity): white instrument with the dark lower band, the MIRacle ATR with its red clamp knob
// on the sample stage, the compartment lid open, labels; PC and monitor; nitrogen purge bottle and line under the bench.
MB.add('ftir',(K,s)=>{const L=lib(K),H=L.H,P=L.P,M=L.M,T=L.T,g=new T.Group();
 const bh=.78,b=L.bench(g,1.6,.8,0,0,bh,L.esdGrey);L.benchName(b,s);
 const body=H.grp(g,-.35,bh,-.02);K.box(.62,.1,.46,L.dgrey,0,.05,0,body);K.box(.62,.17,.46,L.cream,0,.185,0,body);K.box(.624,.004,.464,M.dark,0,.1,0,body);K.box(.56,.004,.4,L.lam,0,.272,0,body);
 K.box(.26,.2,.3,L.olive,0,.2,.1,body);K.cyl(.07,.015,L.dgrey,0,.3075,.1,body,'y',24);K.cyl(.05,.008,L.blue,0,.319,.1,body,'y',24);K.cyl(.006,.06,M.steel,0,.35,.1,body,'y',8);K.cyl(.018,.03,P.red,0,.395,.1,body,'y',16);K.torus(.018,.004,M.dark,0,.41,.1,body,'y',16);
 K.box(.2,.14,.006,L.dgrey,0,.2,.253,body);K.plate(body,'MIRacle 10',.14,.03,0,.21,.257,'#3b4044','#f2f1ec');K.plate(body,'SHIMADZU',.08,.014,0,.18,.257,'#3b4044','#f2f1ec');for(const sx of[-1,1])for(const sy of[-1,1])K.cyl(.004,.004,M.steel,sx*.085,.2+sy*.055,.257,body,'z',8);
 const lid=H.grp(body,.17,.272,-.12);lid.rotation.x=-1.25;K.box(.2,.012,.24,L.cream,0,.006,.12,lid);K.box(.18,.006,.22,L.blackP,.17,.275,0,body);
 K.plate(body,'IRAffinity-1S',.17,.04,-.21,.23,.236,'#f2f1ec','#2b2d30');K.plate(body,'SHIMADZU',.09,.018,-.24,.195,.236,'#f2f1ec','#b3202a');K.plate(body,'CLASS 1 LASER PRODUCT',.09,.03,-.24,.05,.236,'#e3b82e','#1c1b18');K.plate(body,'IRAffinity-1',.1,.025,-.12,.05,.236,'#3b4044','#f2f1ec');
 H.nameplate(body,s,.03,.05,.236,.18,.06);K.plate(body,'NOTICE',.1,.03,.19,.05,.236,'#9aa0a4','#1c1b18');K.cyl(.003,.004,L.ledG,.25,.06,.233,body,'z',6);K.cyl(.003,.004,L.ledR,.27,.06,.233,body,'z',6);K.box(.016,.012,.008,L.blackP,.29,.05,.234,body);
 H.logoBand(body,s,.58,0,.262,.237,.016);K.plate(body,'LOT '+(s.lot||''),.08,.03,-.2,.13,.236,'#e3b82e','#1c1b18');
 K.cyl(.06,.5,L.grey,-.6,.21+.25,-.1,g,'y',16);K.cyl(.02,.05,M.steel,-.6,.485,-.1,g,'y',8);K.cyl(.025,.012,P.white,-.57,.5,-.1,g,'x',12);L.cableTo(g,[[-.6,.5,-.1],[-.65,.6,-.3],[-.5,bh+.05,-.35],[-.35,bh+.15,-.25]],.005,L.blue);
 L.monitor(g,s,.45,bh,-.15,.5,.3,L.spectrum);L.keyboard(g,.45,bh,.18);L.mouse(g,.75,bh,.2);L.tower(g,s,.5,.21,-.05);L.cableTo(g,[[.45,bh+.01,.1],[.45,bh-.1,-.3],[.5,.6,-.2]],.004);
 return {group:g,height:1.25};
});

// Inspection microscope station: ESD bench with the Olympus SZ61 stereo microscope(s), the Hirox digital microscope with
// its monitor, a magnifier ring lamp, sample tray; opts.count microscopes (1–3).
MB.add('microscopeStation',(K,s)=>{const L=lib(K),H=L.H,P=L.P,M=L.M,T=L.T,g=new T.Group(),n=Math.max(1,Math.min(3,+((s.opts||{}).count||2)));
 const bh=.76,b=L.bench(g,1.6,.8,0,0,bh,L.esd);L.benchName(b,s);
 if(n===1){L.stereo(g,-.25,.05,bh);L.magLamp(g,-.6,-.3,bh);L.monitor(g,s,.45,bh,-.2,.4,.25,L.live,-.3);K.box(.2,.08,.16,L.grey,.1,bh+.04,-.25,g);L.led(g,.1,bh+.05,-.17,.08,.02,['  OK 128']);L.btns(g,.1,bh+.02,-.17,3,1,.03,.01,.016,.008,L.btnG);L.cableTo(g,[[.2,bh+.04,-.25],[.3,bh+.03,-.3],[.45,bh+.08,-.235]],.004)}else{L.stereo(g,-.38,.05,bh);L.hirox(g,.18,0,bh);L.monitor(g,s,.62,bh,-.2,.4,.25,L.live,-.3);L.magLamp(g,n===3?-.05:-.62,-.33,bh)}
 if(n===3)L.stereo(g,-.68,.02,bh);
 K.box(.2,.012,.14,L.blackP,.2,bh+.006,.3,g);H.pcb(g,.2,bh+.014,.3,.16,.1);K.box(.12,.03,.08,P.white,-.6,bh+.015,.3,g);K.box(.11,.004,.07,L.foam,-.6,bh+.032,.3,g);
 L.cableTo(g,[[.4,bh+.17,.12],[.5,bh+.05,-.3],[.5,bh-.1,-.38],[.5,.21,-.38]],.005);L.cableTo(g,[[-.38,bh+.05,-.1],[-.4,bh-.08,-.38],[-.4,.21,-.38]],.004);
 return {group:g,height:1.55};
});

// Calibration bench: Yokogawa CA71 handheld calibrator in its tilted stand with test leads, DC-204R strain recorder,
// the charged plate monitor on its stand with the readout, an open KUKA mastering case with the probe, lead coil.
MB.add('calibrationBench',(K,s)=>{const L=lib(K),H=L.H,P=L.P,M=L.M,T=L.T,g=new T.Group();
 const bh=.76,b=L.bench(g,1.6,.8,0,0,bh,L.esd);L.benchName(b,s);
 const st=H.grp(g,-.5,bh,.1);K.box(.14,.02,.12,L.dgrey,0,.01,0,st);K.box(.1,.1,.02,L.dgrey,0,.06,-.05,st);const c=H.grp(st,0,.02,-.03);c.rotation.x=-.75;K.box(.12,.22,.035,L.slate,0,.11,.0175,c);
 L.lcd(c,0,.15,.035,.085,.035,'CA71  10.000 V');for(const sx of[-1,1]){K.cyl(.013,.01,P.yellow,sx*.04,.09,.04,c,'z',14);K.box(.004,.016,.003,M.dark,sx*.04,.093,.046,c)}L.btns(c,0,.045,.035,4,2,.018,.013,.012,.007);
 K.plate(c,'YOKOGAWA  CA71',.08,.012,0,.2,.036,'#4a5258','#f2f1ec');[P.red,M.dark,P.yellow,P.red].forEach((m,i)=>K.cyl(.005,.012,m,-.04+i*.025,.225,.0175,c,'y',8));
 L.cableTo(g,[[-.54,bh+.21,.05],[-.66,bh+.12,.15],[-.72,bh+.01,.25],[-.6,bh+.01,.32]],.004,P.red);L.cableTo(g,[[-.515,bh+.21,.05],[-.6,bh+.14,.2],[-.5,bh+.01,.3],[-.4,bh+.01,.33]],.004,L.blackP);
 const r=H.grp(g,-.05,bh,-.05);K.box(.3,.12,.26,L.beige,0,.06,0,r);K.box(.29,.11,.012,L.cream,0,.06,.136,r);const rf=.142;L.lcd(r,-.07,.08,rf,.12,.03,'DC-204R  CH1 1203 µε');for(let i=0;i<4;i++)L.knob(r,.06+i*.035,.085,rf,.009,.01,L.knobD,L.knob);
 L.btns(r,-.07,.035,rf,6,1,.02,.01,.014,.008,L.btnG);for(let i=0;i<4;i++){K.cyl(.006,.01,M.steel,.06+i*.035,.035,rf+.005,r,'z',8);K.torus(.007,.002,i%2?M.dark:P.red,.06+i*.035,.035,rf+.01,r,'z',10)}K.plate(r,'DC-204R  STRAIN RECORDER',.11,.012,-.085,.108,rf+.001,'#2b2d30','#f2f1ec');
 for(const sx of[-1,1])for(const sz of[-1,1])K.cyl(.01,.008,P.rubber,sx*.12,-.004,sz*.1,r,'y',8);
 const cp=H.grp(g,.5,bh,.1);K.cyl(.06,.012,L.dgrey,0,.006,0,cp,'y',20);K.cyl(.008,.3,M.steel,0,.16,0,cp,'y',10);K.box(.15,.15,.006,P.alu,0,.37,0,cp);K.box(.03,.03,.01,L.blackP,0,.37,-.008,cp);K.plate(cp,'CPM',.05,.015,0,.3,.004,'#c9ccce','#1c1b18');
 const ro=H.grp(g,.5,bh,-.25);K.box(.14,.07,.12,L.dgrey,0,.035,0,ro);L.led(ro,-.01,.04,.06,.08,.022,[' +1000 V']);L.btns(ro,.0,.015,.06,3,1,.02,.01,.012,.006,L.btnG);L.cableTo(g,[[.5,bh+.3,.1],[.55,bh+.1,-.05],[.52,bh+.04,-.19]],.003,L.cable);
 const cs=H.grp(g,.15,bh,-.3);K.box(.36,.09,.26,L.blackP,0,.045,0,cs);K.box(.34,.012,.24,L.foam,0,.085,0,cs);const cl=H.grp(cs,0,.09,-.13);cl.rotation.x=-1.5;K.box(.36,.012,.26,L.blackP,0,.006,.13,cl);K.box(.34,.006,.24,L.foam,0,.013,.13,cl);
 K.cyl(.01,.14,M.steel,.06,.098,.04,cs,'x',10);K.cyl(.016,.03,L.blackP,-.03,.1,.04,cs,'x',10);K.box(.08,.03,.05,L.blackP,-.08,.1,-.05,cs);K.torus(.035,.006,L.blackP,.08,.094,-.06,cs,'y',16);K.plate(cs,'KUKA',.06,.015,.08,.05,.131,'#1e2022','#e8772e');
 K.torus(.045,.008,P.red,-.25,bh+.008,.3,g,'y',18);K.box(.14,.012,.1,L.blackP,.1,bh+.006,.3,g);for(let i=0;i<4;i++)K.cyl(.005,.008,[P.red,M.dark,P.yellow,P.green][i],.055+i*.03,bh+.016,.3,g,'y',8);
 L.cableTo(g,[[-.05,bh+.05,-.18],[0,bh-.05,-.38],[0,.21,-.38]],.004);
 return {group:g,height:1.25};
});

// BGA rework / reballing station (TR3000-IRV): stainless bench, lower IR preheater with its mesh, PCB rail carrier,
// the body on two columns with the top IR head on its slide, two monitors, controls, vacuum pick arm, exhaust hose,
// hot-air station with its handpiece, alignment tools, component trays, magnifier lamp, lamp tower.
MB.add('reballingStation',(K,s)=>{const L=lib(K),H=L.H,P=L.P,M=L.M,T=L.T,g=new T.Group();
 const bh=.78,b=L.bench(g,1.4,.8,0,0,bh,L.ss);L.benchName(b,s);
 const m=H.grp(g,-.1,bh,-.1);K.box(.7,.08,.5,L.dgrey,0,.04,.05,m);const mt=L.meshTex();const mm=new T.Mesh(K.keep(new T.PlaneGeometry(.6,.4)),mt?K.mat(0xffffff,.4,.6,{map:mt}):L.vent);mm.rotation.x=-Math.PI/2;mm.position.set(0,.086,.05);m.add(mm);
 for(const sz of[-1,1]){K.box(.64,.02,.02,P.alu,0,.13,.05+sz*.12,m);for(const sx of[-1,1])K.box(.02,.05,.02,M.steel,sx*.3,.105,.05+sz*.12,m)}H.pcb(m,0,.13,.05,.3,.22);K.box(.03,.02,.03,L.blackP,.05,.145,.05,m);K.box(.1,.012,.1,M.steel,-.08,.146,.05,m);
 for(const sx of[-1,1])K.box(.1,.34,.1,L.beige,sx*.26,.25,-.2,m);K.box(.62,.26,.28,L.beige,0,.55,-.2,m);K.box(.63,.004,.29,M.dark,0,.42,-.2,m);
 const slide=H.grp(m,0,.42,-.02);K.box(.05,.24,.05,M.steel,0,-.12,0,slide);const head=H.grp(slide,0,-.19,0);K.box(.14,.08,.14,L.dgrey,0,-.04,0,head);K.box(.1,.004,.1,P.red,0,-.082,0,head);
 K.box(.06,.06,.2,L.beige,0,.45,-.1,m);K.box(.02,.05,.02,M.steel,-.05,.4,-.1,m);
 H.screen(m,-.18,.76,-.2,.16,.11,H.card(s));K.box(.1,.02,.08,L.dgrey,-.18,.69,-.2,m);K.box(.1,.03,.08,L.dgrey,.18,.695,-.2,m);K.box(.04,.04,.03,L.dgrey,.18,.72,-.2,m);H.screen(m,.18,.8,-.17,.22,.16,L.live);
 const bf=-.06;K.plate(m,'BGA REWORK SYSTEM',.2,.02,-.12,.635,bf+.001,'#e6e3da','#2b2d30');K.plate(m,'TR3000-IRV',.22,.04,-.12,.6,bf+.001,'#e6e3da','#1e2022');K.plate(m,'LOT '+(s.lot||''),.07,.03,-.25,.54,bf+.001,'#e3b82e','#1c1b18');
 [P.green,P.red,M.dark].forEach((c,i)=>{K.cyl(.012,.006,M.dark,.1+i*.05,.555,bf+.003,m,'z',12);K.cyl(.009,.008,c,.1+i*.05,.555,bf+.01,m,'z',12)});L.knob(m,.26,.555,bf,.009,.01,L.knobD,L.knob);L.btns(m,.14,.51,bf,6,1,.02,.01,.014,.008,L.btnG);
 L.led(m,.05,.62,bf,.08,.02,['  235']);L.led(m,.18,.62,bf,.08,.02,['  180']);H.grille(m,.1,.05,-.2,.49,bf+.006);H.nameplate(m,s,.1,.46,bf+.007,.3,.05);H.logoBand(m,s,.6,0,.665,bf+.007,.012);
 K.pipe([[-.2,.42,-.08],[-.22,.33,.0],[-.12,.2,.05]],.006,M.steel,m);K.cyl(.008,.012,L.blackP,-.12,.19,.05,m,'y',10);K.pipe([[.1,.42,-.08],[.12,.3,.02]],.006,M.steel,m);K.box(.03,.02,.03,L.blackP,.12,.29,.02,m);
 K.pipe([[-.3,.6+bh,-.3],[-.5,.7+bh,-.3],[-.66,.5+bh,-.1],[-.66,.3,.2],[-.64,.05,.3]],.03,L.blackP,g);
 const hs=H.grp(g,.5,bh,.2);K.box(.16,.1,.16,L.grey,0,.05,0,hs);L.led(hs,-.02,.06,.08,.07,.02,['  350'],'#ff3b24');L.knob(hs,.055,.035,.08,.01,.01,L.knobD,L.knob);K.box(.04,.12,.04,M.steel,.12,.06,-.04,hs);K.box(.02,.03,.08,M.steel,.12,.12,-.04,hs);
 const hp=H.grp(hs,.12,.13,0);hp.rotation.x=1.1;K.cyl(.015,.16,L.blackP,0,.08,0,hp,'y',12);K.cyl(.006,.05,M.steel,0,.18,0,hp,'y',8);L.cableTo(hs,[[.12,.1,.06],[.15,.02,.15],[.0,.0,.12],[-.06,.03,.08]],.004);
 for(let i=0;i<5;i++)K.cyl(.009,.15,L.grey,-.5,bh+.009,.2+i*.025,g,'x',10);for(let i=0;i<2;i++){K.box(.12,.02,.08,P.white,.35+i*.14,bh+.01,-.28,g);for(let a=0;a<3;a++)for(let bb=0;bb<2;bb++)K.box(.025,.004,.02,L.foam,.35+i*.14-.035+a*.035,bh+.022,-.28-.015+bb*.03,g)}
 K.box(.1,.015,.07,L.cream,.45,bh+.0075,-.05,g);L.btns(g,.45,bh+.016,-.05,3,2,.025,.02,.016,.012,L.btnG);
 L.magLamp(g,-.62,-.33,bh,0,.18);const lt=H.lampTower(g,.62,bh,-.36,'g');
 L.cableTo(g,[[.45,bh+.01,-.085],[.3,bh+.02,-.3],[.2,bh+.1,-.37]],.004);
 return {group:g,height:1.65,lamps:lt.lamps,update:(t,run)=>{head.position.y=-.19+(run?Math.sin(t*.8)*.04:0);lt.lamps[0].material=run?P.lampG:P.lampOff}};
});

// Solder paste thawing / check unit (SEILIECO SCR-3100): a white stepped unit with ten round jar positions, the vent
// slots, numbered buttons, the blue control panel with its screen and label printer, on a white steel cart.
MB.add('pasteThawer',(K,s)=>{const L=lib(K),H=L.H,P=L.P,M=L.M,T=L.T,g=new T.Group();
 const ch=.86;for(const sx of[-1,1])for(const sz of[-1,1])K.box(.04,ch-.1,.04,L.cream,sx*.26,.1+(ch-.1)/2,sz*.26,g);H.castors(g,.6,.6,.06,.04);K.box(.6,.03,.6,L.cream,0,ch-.015,0,g);K.box(.56,.02,.56,L.lam,0,.24,0,g);
 K.box(.56,.1,.02,L.cream,0,ch-.08,.29,g);H.nameplate(g,s,0,ch-.08,.301,.36,.07);K.box(.6,.04,.04,L.cream,0,.12,.26,g);H.logoBand(g,s,.56,0,.12,.281,.03);
 const u=H.grp(g,0,ch,0),jars=[];K.box(.58,.1,.18,L.cream,0,.05,.21,u);K.box(.58,.2,.18,L.cream,0,.1,.03,u);K.box(.58,.3,.2,L.cream,0,.15,-.16,u);K.box(.584,.004,.564,M.dark,0,.004,0,u);
 const hole=(x,y,z,withJar,num)=>{K.cyl(.036,.006,L.blackP,x,y+.003,z,u,'y',20);if(withJar){const j=H.grp(u,x,y+.006,z);K.cyl(.03,.07,L.jar,0,.035,0,j,'y',18);K.cyl(.031,.014,L.dgrey,0,.077,0,j,'y',18);K.plate(j,'Sn/Ag/Cu',.04,.012,0,.04,.031,'#f2f1ec','#1c1b18');jars.push(j)}
  K.cyl(.005,.004,L.btn,x,y+.002,z+.07,u,'y',8);K.plate(u,String(num),.02,.012,x+.02,y+.002,z+.07,'#e6e3da','#1c1b18').rotation.x=-Math.PI/2};
 for(let i=0;i<5;i++){hole(-.22+i*.11,.1,.19,i!==1&&i!==3,i+6);hole(-.22+i*.11,.2,.0,i===0||i===3,i+1)}
 for(let i=0;i<5;i++){K.box(.07,.012,.006,L.vent,-.22+i*.11,.185,.123,u);K.box(.07,.012,.006,L.vent,-.22+i*.11,.085,.303,u)}
 K.box(.56,.09,.012,L.blue,0,.25,-.054,u);H.screen(u,-.18,.25,-.048+.0125,.15,.07,H.card(s));K.plate(u,'Solder Paste  Check - Right',.2,.03,.05,.265,-.041,'#f2f1ec','#1c1b18');K.plate(u,'SEILIECO CORP.  CE',.1,.014,.19,.285,-.041,'#1f63b4','#f2f1ec');
 K.box(.09,.05,.01,L.blackP,.2,.24,-.043,u);K.box(.07,.02,.004,P.white,.2,.235,-.037,u);for(let i=0;i<5;i++){K.cyl(.006,.004,L.btn,-.22+i*.11,.212,-.046,u,'z',8)}
 K.plate(u,'LOT '+(s.lot||''),.08,.03,.18,.12,.125,'#e3b82e','#1c1b18');H.warn(u,-.2,.05,.306,0,.04);L.cableTo(g,[[.2,ch+.1,-.26],[.25,ch-.1,-.3],[.25,.1,-.3]],.005);
 return {group:g,height:ch+.3,update:(t,run)=>{if(run)for(const j of jars)j.rotation.y=t*1.5}};
});

// Chamber vacuum packing machines (CM KOREA VAC CM600): stainless cabinet on castors, blue maker band, green control
// panel with the vacuum gauge, LED digits and buttons, two sub-panels, e-stop, chamber with its sealing bar and the
// clear hinged lid; opts.count machines in a row. The lid opens and closes while running.
MB.add('vacuumSealer',(K,s)=>{const L=lib(K),H=L.H,P=L.P,M=L.M,T=L.T,g=new T.Group(),n=Math.max(1,Math.min(3,+((s.opts||{}).count||2))),W=.64,D=.6,HB=.78,lids=[];
 for(let i=0;i<n;i++){const u=H.grp(g,(i-(n-1)/2)*(W+.1),0,0);K.box(W,HB-.09,D,L.ss,0,.09+(HB-.09)/2,0,u);H.castors(u,W,D,.08,.045);for(const sx of[-1,1])for(const sz of[-1,1])K.cyl(.02,.012,P.red,sx*(W/2-.08),.045,sz*(D/2-.08)+(sz>0?.016:-.016),u,'z',10);
  const f=D/2;K.box(W-.02,.11,.012,L.blue,0,HB-.075,f+.006,u);K.plate(u,'CM KOREA VAC',.3,.05,0,HB-.07,f+.013,'#1f63b4','#f2f1ec');K.plate(u,'CM600',.08,.02,-.25,HB-.075,f+.013,'#1f63b4','#f2f1ec');K.plate(u,'(W635 × L600 × H170)',.14,.018,.2,HB-.075,f+.013,'#1f63b4','#f2f1ec');
  const py=HB-.22;K.box(.22,.12,.01,L.blackP,-.1,py,f+.005,u);K.box(.2,.1,.006,L.panelG,-.1,py,f+.013,u);K.cyl(.028,.006,P.white,-.17,py,f+.019,u,'z',20);K.torus(.028,.003,M.dark,-.17,py,f+.022,u,'z',20);K.box(.003,.022,.002,P.red,-.17,py+.008,f+.023,u);
  L.led(u,-.06,py+.02,f+.016,.07,.02,['  88.5']);L.rbtns(u,-.06,py-.025,f+.016,4,1,.016,.01,.005);K.plate(u,'VAC  SEAL  COOL  TIME',.08,.01,-.06,py-.04,f+.017,'#2e7d4f','#f2f1ec');
  for(const k of[0,1]){const y=py-.13-k*.075;K.box(.14,.06,.008,L.btn,-.1,y,f+.004,u);K.cyl(.018,.005,P.white,-.14,y,f+.011,u,'z',16);K.torus(.018,.002,M.dark,-.14,y,f+.014,u,'z',16);K.box(.002,.014,.002,P.red,-.14,y+.005,f+.015,u);L.led(u,-.07,y,f+.008,.05,.016,[' 30'])}
  H.estop(u,.2,py,f+.006);H.warn(u,.2,py-.1,f+.007,0,.06);K.plate(u,'CAUTION  HIGH VOLTAGE',.08,.025,.2,py-.17,f+.007,'#f2f1ec','#1c1b18');H.nameplate(u,s,.12,HB-.55,f+.007,.3,.07);H.logoBand(u,s,W-.1,0,HB-.135,f+.007,.02);
  K.plate(u,'LOT '+(s.lot||''),.08,.03,-.24,py,f+.007,'#e3b82e','#1c1b18');
  K.box(W+.02,.03,D+.02,L.ss,0,HB+.015,0,u);K.box(W-.08,.006,D-.08,L.blackP,0,HB+.033,0,u);K.box(W-.14,.015,.03,P.alu,0,HB+.044,D/2-.1,u);K.box(W-.14,.004,.006,P.rubber,0,HB+.053,D/2-.1,u);
  const lid=H.grp(u,0,HB+.036,-D/2+.02);for(const sz of[0,D-.04])K.box(W-.02,.02,.02,L.ss,0,.01,sz,lid);for(const sx of[-1,1])K.box(.02,.02,D-.04,L.ss,sx*(W/2-.02),.01,D/2-.02,lid);
  const dome=K.box(W-.08,.13,D-.1,P.tint,0,.085,D/2-.02,lid);dome.castShadow=false;K.box(W-.1,.012,D-.12,L.ss,0,.155,D/2-.02,lid);for(const sx of[-1,1])K.cyl(.008,.14,M.steel,sx*(W/2-.03),-.06,.05,lid,'y',8);
  for(const sx of[-1,1])K.cyl(.012,.05,L.blackP,sx*(W/2-.1),.0,-.005,lid,'x',10);lids.push(lid);L.cableTo(u,[[.2,.3,-D/2-.01],[.25,.1,-D/2-.05],[.3,.03,-D/2-.1]],.006)}
 return {group:g,height:HB+.25,update:(t,run)=>{const a=run?(.5-.5*Math.cos(t*.9))*-.9:0;for(const l of lids)l.rotation.x=a}};
});

// Media duplication station: ESD bench with the black tower USB duplicators (LCD, buttons, grid of USB ports),
// monitor and keyboard, a box of USB sticks; opts.count towers (≤4).
MB.add('duplicatorStation',(K,s)=>{const L=lib(K),H=L.H,P=L.P,M=L.M,T=L.T,g=new T.Group(),n=Math.max(1,Math.min(4,+((s.opts||{}).count||s.count||3)));
 const bh=.76,b=L.bench(g,1.2,.7,0,0,bh,L.esd);L.benchName(b,s);
 for(let i=0;i<n;i++){const t=H.grp(g,-.42+i*.21,bh+.008,-.08);K.box(.17,.37,.4,L.blackP,0,.185,0,t);K.box(.16,.36,.01,L.dgrey,0,.185,.205,t);const fz=.21;L.lcd(t,-.03,.33,fz,.07,.022,'COPY  OK 21');L.rbtns(t,.05,.33,fz,2,2,.014,.012,.005);
  for(let r=0;r<5;r++)for(let c=0;c<7;c++)K.box(.013,.006,.004,M.steel,-.06+c*.02,.27-r*.045,fz+.002,t);K.plate(t,'MultiBurn',.06,.012,0,.03,fz+.001,'#1e2022','#e04a2a');K.cyl(.003,.004,L.ledG,.07,.03,fz+.002,t,'z',6);
  for(const sx of[-1,1])for(const sz of[-1,1])K.cyl(.01,.008,P.rubber,sx*.06,-.004,sz*.15,t,'y',8);L.cableTo(t,[[0,.1,-.2],[0,.03,-.3],[.1,-.3,-.35]],.005);L.cableTo(t,[[-.06,.25,.213],[-.09,.16,.25],[-.1,.0,.29]],.003,L.blackP)}
 L.monitor(g,s,.38,bh,-.15,.42,.26);L.keyboard(g,.38,bh,.17);L.mouse(g,.58,bh,.2);K.box(.2,.1,.14,L.cardboard,.0,bh+.05,.22,g);for(let i=0;i<6;i++)K.box(.02,.006,.055,i%2?L.blue:M.steel,-.07+i*.028,bh+.103,.22,g);
 return {group:g,height:1.2};
});

// SMT splicing station: the black pedestal stand on castors with the splicing press (purple lever), its basket and
// tray, beside an ESD bench with component reels on a reel riser, splice tape dispenser, tools and a feeder rack.
MB.add('splicingStation',(K,s)=>{const L=lib(K),H=L.H,P=L.P,M=L.M,T=L.T,g=new T.Group();
 const px=-.4;K.box(.4,.02,.4,L.blackP,px,.075,0,g);H.castors(g,.4,.4,.08,.03);K.box(.05,.83,.05,L.blackP,px,.085+.415,0,g);K.box(.3,.015,.25,M.steel,px,.9,0,g);K.box(.12,.1,.012,L.blackP,px,.14,0,g);
 K.box(.14,.03,.18,M.steel,px,.922,0,g);K.box(.05,.1,.05,M.steel,px-.03,.985,0,g);K.box(.08,.02,.04,L.dgrey,px+.03,.945,0,g);const lever=H.grp(g,px-.03,1.03,0);lever.rotation.z=.3;K.box(.02,.16,.02,L.purple,0,.08,0,lever);K.cyl(.012,.03,L.purple,0,.17,0,lever,'y',10);
 K.box(.15,.12,.08,L.vent,px-.17,.86,-.05,g);K.box(.4,.015,.22,L.blackP,px,.55,-.02,g);K.box(.4,.03,.012,L.blackP,px,.565,.09,g);K.plate(g,'LOT '+(s.lot||''),.06,.025,px,.56,.097,'#e3b82e','#1c1b18');
 const bh=.76,b=L.bench(g,.78,.7,.21,0,bh,L.esd,false);H.nameplate(g,s,.21,bh-.09,.351,.36,.07);H.logoBand(g,s,.6,.21,bh-.045,.351,.016);
 for(const sx of[-1,1])K.box(.03,.35,.03,L.frame,.21+sx*.32,bh+.175,-.28,g);K.cyl(.01,.66,M.steel,.21,bh+.33,-.28,g,'x',8);for(let i=0;i<3;i++){K.cyl(.09,.012,i?L.dgrey:L.blue,.0+i*.14,bh+.33,-.28,g,'x',24);K.cyl(.03,.016,P.white,.0+i*.14,bh+.33,-.28,g,'x',12)}
 K.cyl(.11,.012,L.dgrey,.05,bh+.006,.12,g,'y',28);K.cyl(.035,.014,P.white,.05,bh+.007,.12,g,'y',12);K.cyl(.09,.01,L.blue,.3,bh+.005,.18,g,'y',24);K.cyl(.03,.012,P.white,.3,bh+.006,.18,g,'y',12);
 K.box(.1,.06,.08,L.blue,.35,bh+.03,-.15,g);K.cyl(.025,.03,P.white,.35,bh+.085,-.15,g,'x',16);K.box(.08,.02,.06,L.dgrey,.0,bh+.01,-.1,g);K.box(.12,.03,.04,M.steel,.12,bh+.015,-.05,g);
 const fr=H.grp(g,.42,bh,.02);K.box(.16,.03,.32,L.dgrey,0,.015,0,fr);for(let i=0;i<6;i++)K.box(.018,.12,.3,L.grey,-.065+i*.026,.09,0,fr);for(let i=0;i<6;i++)K.box(.014,.02,.04,P.yellow,-.065+i*.026,.16,.12,fr);
 return {group:g,height:1.2,update:(t,run)=>{lever.rotation.z=.3+(run?Math.max(0,Math.sin(t*1.2))*.5:0)}};
});

// Barcode reader test station: ESD bench with a conveyor stub (belt and a PCB moving on it), the portal bracket with
// Keyence SR-2000 readers aimed at the belt, a loose reader on its bracket, controller box, monitor and keyboard.
MB.add('barcodeStation',(K,s)=>{const L=lib(K),H=L.H,P=L.P,M=L.M,T=L.T,g=new T.Group();
 const bh=.76,b=L.bench(g,1.2,.7,0,0,bh,L.esd);L.benchName(b,s);
 const c=H.grp(g,-.25,bh,-.05);for(const sx of[-1,1])K.box(.04,.08,.2,P.alu,sx*.28,.04,0,c);for(const sz of[-1,1])K.box(.6,.03,.02,P.alu,0,.095,sz*.09,c);const belt=K.box(.56,.012,.15,P.belt,0,.09,0,c);
 for(const sx of[-1,1])K.cyl(.012,.16,M.steel,sx*.285,.09,0,c,'z',10);K.box(.08,.06,.06,L.dgrey,.2,.045,.14,c);const part=H.pcb(c,0,.098,0,.12,.09);K.box(.03,.02,.02,L.blackP,.02,.11,0,c);
 for(const sx of[-1,1])K.box(.03,.35,.03,P.alu,sx*.2,.28,-.12,c);K.box(.46,.03,.03,P.alu,0,.44,-.12,c);const leds=[];
 for(let i=0;i<3;i++){const r=H.grp(c,-.14+i*.14,.4,-.07);K.box(.06,.045,.07,L.blackP,0,0,0,r);K.box(.062,.012,.072,P.red,0,-.017,0,r);K.cyl(.012,.006,L.lensG,0,-.026,.01,r,'y',14);K.box(.03,.03,.012,L.blackP,0,.015,-.04,r);leds.push(K.box(.004,.004,.003,L.ledG,.02,.0,.036,r));
  K.plate(r,'KEYENCE SR-2000',.05,.01,0,.012,.036,'#1e2022','#f2f1ec');K.box(.02,.02,.012,P.alu,0,.03,-.04,r);L.cableTo(r,[[0,.02,-.035],[0,.06,-.06],[.1,.02,-.1]],.004)}
 const lr=H.grp(g,.1,bh+.01,.2);lr.rotation.y=.6;K.box(.06,.045,.07,L.blackP,0,.022,0,lr);K.box(.062,.012,.072,P.red,0,.04,0,lr);K.cyl(.012,.006,L.lensG,0,.03,.038,lr,'z',14);K.box(.012,.09,.05,P.alu,-.036,.045,0,lr);L.cableTo(lr,[[0,.02,-.035],[-.1,.005,-.1]],.004);
 K.box(.15,.08,.12,L.grey,-.45,bh+.04,.22,g);for(let i=0;i<4;i++)K.cyl(.004,.004,i<3?L.ledG:L.ledR,-.5+i*.015,bh+.065,.282,g,'z',6);K.plate(g,'SR-2000  LINK',.08,.012,-.45,bh+.03,.282,'#9ca1a5','#1c1b18');
 L.monitor(g,s,.4,bh,-.15,.42,.26);L.keyboard(g,.4,bh,.14);L.mouse(g,.62,bh,.15);L.cableTo(g,[[-.45,bh+.04,.16],[-.45,bh+.02,-.3],[-.45,bh-.1,-.38],[-.45,.21,-.38]],.005);
 const bt=L.keysTex();return {group:g,height:1.25,update:(t,run)=>{if(run){part.position.x=-.22+((t*.12)%.44);L.ledG.emissiveIntensity=.7+.3*Math.sin(t*6)}}};
});

// ESD PCB storage: black slotted-angle ESD rack on castors with PCB magazines (some film-wrapped) and ESD bins on the
// shelves, and an aluminium-framed cabinet with two doors beside it.
MB.add('esdRack',(K,s)=>{const L=lib(K),H=L.H,P=L.P,M=L.M,T=L.T,g=new T.Group();
 const r=H.grp(g,-.2,0,0),RW=.8,RD=.6,RH=1.8;H.castors(r,RW,RD,.08,.04);for(const sx of[-1,1])for(const sz of[-1,1]){K.box(.04,RH-.09,.012,L.blackP,sx*(RW/2-.02),.09+(RH-.09)/2,sz*(RD/2-.006),r);K.box(.012,RH-.09,.04,L.blackP,sx*(RW/2-.006),.09+(RH-.09)/2,sz*(RD/2-.02),r)}
 const shelves=[.1,.5,.9,1.3,1.7];for(const y of shelves){K.box(RW,.025,RD,L.dgrey,0,y,0,r);K.box(RW,.03,.012,L.blackP,0,y-.0125,RD/2-.0,r)}
 const mag=(x,y,z,wrap)=>{const m=H.magazine(r,x,y,z,.3,.36,.3,10);if(wrap){const f=K.box(.33,.37,.33,L.film,x,y+.185,z,r);f.castShadow=false;for(const yy of[.1,.25])K.box(.335,.03,.335,L.film,x,y+yy,z,r).castShadow=false}return m};
 mag(-.2,.1125,.05,true);mag(.2,.1125,.05,false);mag(-.2,.5125,.05,false);mag(.2,.5125,.05,true);mag(-.2,.9125,.05,true);mag(.2,.9125,.05,true);
 for(let i=0;i<3;i++){K.box(.22,.12,.3,L.blackP,-.26+i*.26,1.3725,0,r);K.plate(r,'ESD',.06,.02,-.26+i*.26,1.39,.151,'#e3b82e','#1c1b18')}
 K.plate(r,'ESD PROTECTED',.3,.04,0,1.76,RD/2+.007,'#e3b82e','#1c1b18');K.plate(r,'LOT '+(s.lot||''),.1,.03,-.3,.52,RD/2+.007,'#e3b82e','#1c1b18');H.logoBand(r,s,RW-.1,0,.92,RD/2+.007,.02);
 const cx=.42,c=H.grp(g,cx,0,0),CW=.42,CD=.6,CH=1.8;H.frame(c,CW,CH-.08,CD,0,.08,0,.04);H.castors(c,CW,CD,.08,.04);K.box(CW-.08,CH-.16,.02,L.lam,0,CH/2+.04,-CD/2+.03,c);for(const sx of[-1,1])K.box(.02,CH-.16,CD-.08,L.lam,sx*(CW/2-.03),CH/2+.04,0,c);K.box(CW-.08,.02,CD-.08,L.lam,0,CH-.05,0,c);
 for(const [y,h] of[[1.33,.85],[.5,.78]])H.door(c,CW-.1,h,0,y,CD/2-.03,L.lam,y>1,1);H.nameplate(c,s,0,CH-.14,CD/2-.016,.3,.06);H.warn(c,.12,.98,CD/2-.016,0,.06);
 return {group:g,height:CH};
});

// LED module inspection rack (Na & Na ECT-OFF-303): cream aluminium-framed cabinet on castors with the LED test panel
// (rows of lit modules), monitor on its bracket, module drawer, keyboard tray between light-curtain posts, lower
// cabinet with two doors; the grey power cabinet with vent, e-stop and lamp tower beside it; hoses and cables.
MB.add('inspectionRack',(K,s)=>{const L=lib(K),H=L.H,P=L.P,M=L.M,T=L.T,g=new T.Group();
 const CW=1.0,CD=.8,CH=2.0,cx=-.28,c=H.grp(g,cx,0,0);H.frame(c,CW,CH-.08,CD,0,.08,0,.04);H.castors(c,CW,CD,.08,.045);
 K.box(CW-.08,CH-.16,.02,L.cream,0,CH/2+.04,-CD/2+.03,c);for(const sx of[-1,1])K.box(.02,CH-.16,CD-.08,L.cream,sx*(CW/2-.03),CH/2+.04,0,c);K.box(CW-.08,.02,CD-.08,L.cream,0,CH-.05,0,c);
 const fz=CD/2-.03;K.box(CW-.08,CH-1.05,.02,L.cream,0,1.0+(CH-1.05)/2,fz,c);K.box(CW-.08,.04,CD-.08,L.cream,0,.98,0,c);
 const pnl=H.grp(c,-.22,1.5,fz+.01);K.box(.36,.62,.02,L.blackP,0,0,0,pnl);const mods=[];for(let r=0;r<4;r++)for(let i=0;i<5;i++){const m=K.box(.05,.04,.008,L.lit,-.14+i*.07,-.24+r*.16,.014,pnl);mods.push(m);K.box(.054,.044,.004,L.dgrey,-.14+i*.07,-.24+r*.16,.011,pnl);}
 K.box(.04,.02,.06,L.dgrey,.3,1.62,fz,c);K.box(.08,.1,.02,L.dgrey,.3,1.62,fz+.04,c);H.screen(c,.3,1.62,fz+.07,.44,.27,H.card(s));
 K.box(.35,.08,.2,L.blackP,.05,1.12,fz+.08,c);K.box(.33,.06,.012,L.vent,.05,1.12,fz+.186,c);K.box(.28,.004,.16,L.pcb,.05,1.161,fz+.08,c);
 K.box(.9,.03,.3,L.cream,0,.93,fz+.13,c);L.keyboard(c,-.1,.945,fz+.12);L.mouse(c,.3,.945,fz+.12);for(const sx of[-1,1]){K.box(.03,.5,.03,P.yellow,sx*.44,1.2,fz+.26,c);for(let i=0;i<4;i++)K.box(.032,.04,.032,L.blackP,sx*.44,1.0+i*.13,fz+.26,c)}
 for(const sx of[-1,1])H.door(c,CW/2-.1,.78,sx*(CW/4-.02),.52,fz,L.cream,false,-sx);H.nameplate(c,s,-.2,1.93,fz+.007,.4,.07);K.plate(c,'LOT '+(s.lot||''),.1,.035,-.4,1.3,fz+.007,'#e3b82e','#1c1b18');H.warn(c,.42,1.3,fz+.007,0,.06);H.logoBand(c,s,CW-.2,0,1.03,fz+.007,.025);
 const px=.5,p=H.grp(g,px,0,-.05),PW=.5,PD=.6,PH=1.3;K.box(PW,PH-.08,PD,L.grey,0,.08+(PH-.08)/2,0,p);H.castors(p,PW,PD,.08,.04);H.door(p,PW-.1,PH-.35,0,PH/2+.02,PD/2+.01,L.grey,false,1);H.grille(p,.3,.2,0,.3,PD/2+.03);
 H.estop(p,.17,PH-.18,PD/2+.016);K.cyl(.01,.006,L.ledG,-.17,PH-.18,PD/2+.015,p,'z',10);K.box(.03,.03,.006,L.blackP,-.17,PH-.25,PD/2+.015,p);K.plate(p,'POWER',.07,.014,-.17,PH-.3,PD/2+.016,'#9ca1a5','#1c1b18');
 const lt=H.lampTower(p,0,PH,-.15,'g');K.pipe([[-.1,0.02,PD/2+.2],[-.1,.3,PD/2+.1],[-.1,.5,-PD/2-.02]],.012,L.blue,p);K.pipe([[cx+CW/2-.05,.5,-.2],[px-PW/2-.01,.6,-.2]],.008,L.cable,g);K.pipe([[cx+CW/2-.05,.9,.2],[px-.1,.95,PD/2-.1]],.008,L.cable,g);
 return {group:g,height:CH,lamps:lt.lamps,update:(t,run)=>{for(let i=0;i<mods.length;i++)mods[i].material=run&&((i+Math.floor(t*4))%7!==0)?L.lit:L.dgrey;lt.lamps[0].material=run?P.lampG:P.lampOff}};
});
})();
