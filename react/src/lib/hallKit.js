// hallKit.js — the hall dressing of the old hall pages (hall-kit.js) for three 0.186, as pure builders.
//
// createHallKit(THREE) returns builders that make the production hall round the machines: the concrete floor with
// its green walkways, the detailed walls of the factory-line design (white sandwich-panel cladding over a concrete
// plinth, steel I-section columns every bay with striped guards, a window in each bay, louvres, a fascia beam, the
// cable tray, the sprinkler main (red) and the compressed-air line (blue) on brackets, floodlights, electrical boards
// with conduit, fire points, first aid, ESD / PPE signs, a wall clock, roll-up loading doors with bollards and hatched
// aprons, a fire exit with its sign and a personnel door), the kerb along the open front, the roof structure (deck,
// trusses, purlins, high-bay lamps) that hides when the camera rises above it, and the yellow zone painted round the
// machines with the hall's name on the floor in front of it.
//
// Every wall is built in its own frame (it runs along +x from 0 to len and faces +z, into the hall) and turned into
// place by buildHall(). Which sides get a wall is decided by openSides(): a wall stands wherever the camera is not,
// so the default camera (in front of the hall, towards +z) looks in through the open front. Everything the kit creates
// (geometries, materials, textures) is tracked and freed by dispose().
export function createHallKit(THREE){
 const own=[];const keep=o=>{own.push(o);return o};
 const mat=(color,metalness=.15,roughness=.6,extra={})=>keep(new THREE.MeshStandardMaterial(Object.assign({color,metalness,roughness},extra)));
 const add=(m,x,y,z,parent)=>{m.position.set(x,y,z);parent.add(m);return m};
 const bx=(w,h,d,material,x,y,z,parent,cast=false)=>{const m=new THREE.Mesh(keep(new THREE.BoxGeometry(w,h,d)),material);m.castShadow=cast;m.receiveShadow=true;return add(m,x,y,z,parent)};
 const cy=(r,h,material,x,y,z,parent,axis='y',seg=16)=>{const g=keep(new THREE.CylinderGeometry(r,r,h,seg));if(axis==='x')g.rotateZ(Math.PI/2);if(axis==='z')g.rotateX(Math.PI/2);const m=new THREE.Mesh(g,material);m.castShadow=false;m.receiveShadow=true;return add(m,x,y,z,parent)};
 // A canvas painted once and used as a texture (sRGB, so the painted colours come out as painted).
 const ctex=(w,h,draw)=>{const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=keep(new THREE.CanvasTexture(c));t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t};
 const rr=(x,X,Y,W,H,r)=>{x.beginPath();x.moveTo(X+r,Y);x.arcTo(X+W,Y,X+W,Y+H,r);x.arcTo(X+W,Y+H,X,Y+H,r);x.arcTo(X,Y+H,X,Y,r);x.arcTo(X,Y,X+W,Y,r);x.closePath()};
 const FONT='"IBM Plex Sans", system-ui, sans-serif';

 // ---------- painted surfaces: cladding, shutter, hazard stripes, louvres, floor hatching, signs, the floor ----------
 const T={};
 function textures(){if(T.clad)return T;
  T.clad=ctex(512,512,(x,W,H)=>{x.fillStyle='#f6f6f3';x.fillRect(0,0,W,H);for(let y=0;y<H;y+=16){x.fillStyle=y%128===0?'rgba(40,44,48,.16)':'rgba(40,44,48,.035)';x.fillRect(0,y,W,y%128===0?3:1)}for(let i=0;i<300;i++){x.fillStyle='rgba(0,0,0,.02)';x.fillRect((i*137)%W,(i*271)%H,3,1)}});
  T.shutter=ctex(256,256,(x,W,H)=>{x.fillStyle='#b9bec2';x.fillRect(0,0,W,H);for(let y=0;y<H;y+=16){x.fillStyle='rgba(255,255,255,.35)';x.fillRect(0,y,W,2);x.fillStyle='rgba(0,0,0,.22)';x.fillRect(0,y+12,W,3)}});
  T.hazard=ctex(128,128,(x,W,H)=>{x.fillStyle='#e3b82e';x.fillRect(0,0,W,H);x.fillStyle='#1c1b18';for(let k=-W;k<W*2;k+=48){x.beginPath();x.moveTo(k,0);x.lineTo(k+24,0);x.lineTo(k+24-H,H);x.lineTo(k-H,H);x.closePath();x.fill()}});
  T.louvre=ctex(128,128,(x,W,H)=>{x.fillStyle='#8b9196';x.fillRect(0,0,W,H);for(let y=8;y<H-8;y+=14){x.fillStyle='#4b5560';x.fillRect(8,y,W-16,6);x.fillStyle='rgba(255,255,255,.3)';x.fillRect(8,y+6,W-16,2)}x.strokeStyle='#5f6e78';x.lineWidth=8;x.strokeRect(4,4,W-8,H-8)});
  T.hatch=ctex(256,128,(x,W,H)=>{x.clearRect(0,0,W,H);x.fillStyle='rgba(227,184,46,.9)';for(let k=-H;k<W+H;k+=32){x.beginPath();x.moveTo(k,0);x.lineTo(k+14,0);x.lineTo(k+14+H,H);x.lineTo(k+H,H);x.closePath();x.fill()}x.strokeStyle='rgba(227,184,46,.95)';x.lineWidth=8;x.strokeRect(4,4,W-8,H-8)});
  T.exit=ctex(512,192,(x,W,H)=>{x.fillStyle='#1f8a4c';x.fillRect(0,0,W,H);x.fillStyle='#ffffff';x.font='700 84px '+FONT;x.textBaseline='middle';x.fillText('EXIT',190,H/2);x.beginPath();x.moveTo(40,H/2);x.lineTo(120,H/2-44);x.lineTo(120,H/2+44);x.closePath();x.fill();x.fillRect(110,H/2-14,50,28)});
  T.fire=ctex(128,128,(x,W,H)=>{x.fillStyle='#c8312a';x.fillRect(0,0,W,H);x.fillStyle='#fff';rr(x,48,40,32,70,10);x.fill();x.fillRect(56,24,16,18);x.fillRect(70,28,26,8)});
  T.aid=ctex(128,128,(x,W,H)=>{x.fillStyle='#1f8a4c';x.fillRect(0,0,W,H);x.fillStyle='#fff';x.fillRect(50,22,28,84);x.fillRect(22,50,84,28)});
  T.volt=ctex(128,128,(x,W,H)=>{x.fillStyle='#f2f1ec';x.fillRect(0,0,W,H);x.fillStyle='#e3b82e';x.strokeStyle='#1c1b18';x.lineWidth=7;x.beginPath();x.moveTo(64,14);x.lineTo(116,108);x.lineTo(12,108);x.closePath();x.fill();x.stroke();x.fillStyle='#1c1b18';x.beginPath();x.moveTo(70,40);x.lineTo(50,72);x.lineTo(64,72);x.lineTo(56,98);x.lineTo(80,62);x.lineTo(66,62);x.closePath();x.fill()});
  T.esd=ctex(512,256,(x,W,H)=>{x.fillStyle='#e3b82e';x.fillRect(0,0,W,H);x.strokeStyle='#1c1b18';x.lineWidth=14;x.strokeRect(7,7,W-14,H-14);x.fillStyle='#1c1b18';x.font='700 54px '+FONT;x.fillText('ESD',230,110);x.font='600 34px '+FONT;x.fillText('protected area',230,165);x.lineWidth=10;x.beginPath();x.moveTo(110,40);x.lineTo(190,190);x.lineTo(30,190);x.closePath();x.stroke();x.beginPath();x.moveTo(80,165);x.quadraticCurveTo(110,70,140,165);x.stroke()});
  T.ppe=ctex(512,256,(x,W,H)=>{x.fillStyle='#2c4f8a';x.fillRect(0,0,W,H);x.fillStyle='#fff';x.font='600 40px '+FONT;x.textBaseline='middle';x.fillText('Safety shoes and',40,96);x.fillText('glasses required',40,150);x.beginPath();x.arc(W-80,H/2,48,0,Math.PI*2);x.lineWidth=10;x.strokeStyle='#fff';x.stroke()});
  T.clock=ctex(256,256,(x,W,H)=>{x.clearRect(0,0,W,H);x.fillStyle='#fafaf7';x.beginPath();x.arc(128,128,120,0,Math.PI*2);x.fill();x.lineWidth=10;x.strokeStyle='#1c1b18';x.stroke();for(let k=0;k<12;k++){const a=k*Math.PI/6;x.lineWidth=k%3?4:8;x.beginPath();x.moveTo(128+Math.sin(a)*96,128-Math.cos(a)*96);x.lineTo(128+Math.sin(a)*110,128-Math.cos(a)*110);x.stroke()}x.lineCap='round';x.lineWidth=9;x.beginPath();x.moveTo(128,128);x.lineTo(128+52,128-30);x.stroke();x.lineWidth=6;x.beginPath();x.moveTo(128,128);x.lineTo(128-20,128-86);x.stroke()});
  // The floor of the old pages: grey-green concrete with fine noise, each tile edged by a darker seam.
  T.floor=ctex(512,512,(x,W,H)=>{x.fillStyle='#8e9a95';x.fillRect(0,0,W,H);let s=7;const rnd=()=>{s=(s*16807)%2147483647;return s/2147483647};for(let i=0;i<9000;i++){const v=120+rnd()*60|0;x.fillStyle=`rgba(${v},${v+8},${v+4},${rnd()*.25})`;x.fillRect(rnd()*W,rnd()*H,1.5,1.5)}x.strokeStyle='rgba(60,70,66,.28)';x.lineWidth=2;x.strokeRect(0,0,W,H)});
  T.arrow=ctex(128,64,(x,W,H)=>{x.clearRect(0,0,W,H);x.fillStyle='rgba(255,255,255,.75)';x.beginPath();x.moveTo(14,22);x.lineTo(70,22);x.lineTo(70,8);x.lineTo(114,32);x.lineTo(70,56);x.lineTo(70,42);x.lineTo(14,42);x.closePath();x.fill()});
  T.hatch.transparent=true;T.clock.transparent=true;T.arrow.transparent=true;return T}
 const repeatOf=(t,rx,ry)=>{const c=keep(t.clone());c.wrapS=c.wrapT=THREE.RepeatWrapping;c.repeat.set(rx,ry);c.needsUpdate=true;return c};
 const M={};
 function materials(){if(M.steel)return M;textures();
  Object.assign(M,{concrete:mat(0xbdbcb6,.02,.92),trim:mat(0xe6e6e1,.1,.5),steel:mat(0x4b5560,.5,.45),lightSteel:mat(0xb4b8bc,.75,.3),dark:mat(0x2b2d30,.3,.6),red:mat(0xc8312a,.15,.45),green:mat(0x1f8a4c,.1,.5),blue:mat(0x2c6fb8,.3,.45),
   board:mat(0xc9ccce,.35,.45),pane:mat(0xd6e4ec,.1,.15,{emissive:0xe8f1f6,emissiveIntensity:.5}),lamp:mat(0xffffff,0,.3,{emissive:0xfff3dc,emissiveIntensity:1.4}),door:mat(0x6f7c86,.3,.5),yellow:mat(0xe3b82e,.1,.5),
   shutter:mat(0xffffff,.4,.45,{map:T.shutter}),louvre:mat(0xffffff,.3,.5,{map:T.louvre}),hazard:mat(0xffffff,.1,.55,{map:T.hazard}),glass:mat(0xa9bcc6,.1,.05,{transparent:true,opacity:.22,depthWrite:false}),
   walk:mat(0x5f8c73,.05,.7),white:mat(0xf2f1ec,.05,.6),ceil:mat(0xdfe2e5,0,.9),truss:mat(0x9aa3ab,.5,.5),tray:mat(0x9ea6ad,.4,.7),led:keep(new THREE.MeshBasicMaterial({color:0xffffff})),alu:mat(0xaeb5bb,.75,.35)});return M}
 const decal=(key,w,h,x,y,z,parent,glow=0)=>{const t=T[key];const m=new THREE.Mesh(keep(new THREE.PlaneGeometry(w,h)),mat(0xffffff,0,.6,Object.assign({map:t,transparent:!!t.transparent},glow?{emissive:0xffffff,emissiveMap:t,emissiveIntensity:glow}:{})));m.castShadow=false;m.position.set(x,y,z);parent.add(m);return m};

 // One wall, in its own frame: it runs along +x from 0 to len and faces +z (into the hall), `height` m high.
 // doors=[{at: 0..1 along the wall, kind:'rollup'|'exit'|'door'}] snapped to the middle of a bay; clock: a wall clock in
 // the middle bay. The services (tray, pipes), windows and louvres are placed from the wall height so a 10 m hall gets
 // them higher than an 8 m one.
 function wall(len,{doors=[],clock=false,height=9}={}){materials();
  const w=new THREE.Group(),H=height,bays=Math.max(2,Math.round(len/6)),step=len/bays,mid=i=>(i+.5)*step;
  const yTray=Math.min(4.3,H*.42),yWin=Math.max(yTray+1.05,H-3.3),yLouvre=H-1.1,yLamp=H-1.8,winH=Math.min(1.4,Math.max(.9,(H-yWin-.9)*.9));
  const flat=(gw,gh,gd,m,x,y,z)=>bx(gw,gh,gd,m,x,y,z,w);
  const clad=repeatOf(T.clad,len/4,H/4);flat(len,H,.2,mat(0xffffff,.05,.6,{map:clad,emissive:0xffffff,emissiveMap:clad,emissiveIntensity:.32}),len/2,H/2,-.1);
  flat(len,1,.25,M.concrete,len/2,.5,.025);flat(len,.05,.27,M.dark,len/2,1.02,.03);flat(len,.35,.5,M.steel,len/2,H-.17,.15);flat(len,.08,.08,M.trim,len/2,H-.4,.05);
  // services along the wall: cable tray with side rails, the sprinkler main and the compressed-air line, on brackets
  flat(len,.04,.32,M.board,len/2,yTray,.36);for(const z of [.2,.52])flat(len,.09,.02,M.board,len/2,yTray+.04,z);cy(.045,len,M.red,len/2,yTray-.4,.24,w,'x',12);cy(.03,len,M.blue,len/2,yTray-.68,.2,w,'x',12);
  for(let x=1.5;x<len;x+=3){flat(.04,.6,.04,M.lightSteel,x,yTray-.35,.12);flat(.04,.04,.45,M.lightSteel,x,yTray-.03,.25)}
  const door=new Map(doors.map(d=>[Math.min(bays-1,Math.max(0,Math.floor(d.at*bays))),d.kind]));
  for(let i=0;i<=bays;i++){const x=i*step;
   // steel I-section column: two flanges and the web, on a base plate, with a striped guard round its foot
   flat(.32,H,.03,M.steel,x,H/2,.035);flat(.32,H,.03,M.steel,x,H/2,.41);flat(.03,H,.36,M.steel,x,H/2,.22);flat(.5,.03,.5,M.lightSteel,x,.015,.22);flat(.46,.9,.54,M.hazard,x,.45,.24);
   if(i%2===0&&i>0&&i<bays){flat(.36,.14,.26,M.dark,x,yLamp,.6);flat(.3,.012,.2,M.lamp,x,yLamp-.08,.62);flat(.04,.04,.4,M.lightSteel,x,yLamp,.4)}}
  const kit=['board','fire','sign','aid','board','sign2'];let k=0;
  for(let i=0;i<bays;i++){const x=mid(i),kind=door.get(i);
   if(kind!=='rollup'){flat(step-1.2,winH,.04,M.pane,x,yWin,.04);flat(step-1.1,.08,.16,M.trim,x,yWin-winH/2-.04,.08);flat(step-1.1,.06,.08,M.trim,x,yWin+winH/2+.04,.05);for(let m=-1;m<=1;m++)flat(.06,winH,.07,M.dark,x+m*(step-1.2)/4,yWin,.06)}
   if(i%2===1&&yLouvre>yWin+winH/2+.6)flat(1.1,.75,.06,M.louvre,x,yLouvre,.03);
   if(kind==='rollup'){const dw=Math.min(4.4,step-.9),dh=Math.min(4.6,H-1.2);
    flat(dw,dh,.06,M.shutter,x,dh/2,.2);flat(dw+.6,.55,.55,M.trim,x,dh+.3,.3);for(const sx of [-1,1])flat(.16,dh+.1,.2,M.hazard,x+sx*(dw/2+.08),(dh+.1)/2,.24);
    for(const sx of [-1,1])cy(.1,1.1,M.yellow,x+sx*(dw/2+.5),.55,1.05,w,'y',14);flat(.18,.26,.12,M.dark,x+dw/2+.35,1.4,.12);flat(.06,.06,.02,M.green,x+dw/2+.35,1.45,.19);
    const h=decal('hatch',dw,1.8,x,.006,1.15,w);h.rotation.x=-Math.PI/2;continue}
   if(kind==='exit'||kind==='door'){const dx=x-.8;flat(1.08,2.2,.07,kind==='exit'?M.green:M.door,dx,1.1,.2);flat(1.2,.06,.1,M.dark,dx,2.23,.2);for(const sx of [-1,1])flat(.06,2.26,.1,M.dark,dx+sx*.57,1.13,.2);
    flat(.8,.05,.06,M.lightSteel,dx,1.02,.27);if(kind==='door')flat(.3,.4,.02,M.pane,dx,1.6,.245);
    if(kind==='exit'){decal('exit',.9,.34,dx,2.65,.06,w,.7);flat(.3,.1,.08,M.lamp,dx+.75,2.65,.08)}
    const h=decal('hatch',1.4,1,dx,.006,.75,w);h.rotation.x=-Math.PI/2;continue}
   if(clock&&i===Math.floor(bays/2)){decal('clock',.7,.7,x,Math.min(3,yTray-.9),.03,w);continue}
   const what=kit[k++%kit.length];
   if(what==='board'){flat(.9,1.4,.3,M.board,x-.5,1.55,.15);flat(.004,1.3,.002,M.dark,x-.5,1.55,.302);flat(.02,.16,.03,M.dark,x-.12,1.55,.31);decal('volt',.18,.18,x-.5,2.05,.305,w);
    const ch=yTray-2.25;cy(.035,ch,M.dark,x-.75,2.25+ch/2,.12,w,'y',10);cy(.035,ch,M.dark,x-.25,2.25+ch/2,.12,w,'y',10);flat(.7,1.1,.25,M.board,x+.45,1.3,.13);decal('volt',.16,.16,x+.45,1.72,.256,w)}
   else if(what==='fire'){cy(.09,.5,M.red,x-.5,.95,.14,w,'y',16);cy(.03,.12,M.dark,x-.5,1.26,.14,w);flat(.12,.08,.06,M.dark,x-.5,1.05,.04);decal('fire',.32,.32,x-.5,1.75,.02,w);
    flat(.72,.72,.22,M.red,x+.25,1.45,.11);flat(.6,.6,.01,M.glass,x+.25,1.45,.225);cy(.24,.08,M.red,x+.25,1.45,.15,w,'z',20)}
   else if(what==='aid'){flat(.48,.48,.16,M.green,x,1.6,.08);decal('aid',.3,.3,x,1.6,.165,w)}
   else decal(what==='sign'?'esd':'ppe',1.3,.65,x,2.5,.02,w)}
  return w}

 // The kerb: a dark strip along the open front of the hall, where the wall would stand.
 function kerb(len,x,z,parent,rotY=0){materials();const m=bx(len,.12,.12,M.dark,x,.06,z,parent);m.rotation.y=rotY;return m}

 // Zone: yellow lane marks round the machines and the hall's name painted on the floor in front.
 function zone(box,name,parent){materials();const g=new THREE.Group(),pad=1.1,x0=box.x0-pad,x1=box.x1+pad,z0=box.z0-pad,z1=box.z1+pad,yellow=mat(0xe3b82e,.05,.6);
  const strip=(w,d,x,z)=>{const m=new THREE.Mesh(keep(new THREE.PlaneGeometry(w,d)),yellow);m.rotation.x=-Math.PI/2;m.position.set(x,.004,z);m.receiveShadow=true;g.add(m)};
  strip(x1-x0,.1,(x0+x1)/2,z0);strip(x1-x0,.1,(x0+x1)/2,z1);strip(.1,z1-z0,x0,(z0+z1)/2);strip(.1,z1-z0,x1,(z0+z1)/2);
  if(name){const t=ctex(2048,128,(x,W,H)=>{x.fillStyle='rgba(40,42,40,.62)';x.font='700 84px '+FONT;x.textAlign='center';x.textBaseline='middle';x.fillText(name.toUpperCase(),W/2,H/2,W-16)});
   const w=Math.min(14.4,(x1-x0)*.8);const m=new THREE.Mesh(keep(new THREE.PlaneGeometry(w,w/16)),keep(new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false})));m.rotation.x=-Math.PI/2;m.position.set((x0+x1)/2,.006,z1+.75);g.add(m)}
  if(parent)parent.add(g);return g}

 // The floor: concrete tiles of about 2 m, a green walkway along the open front with white edge lines and direction
 // arrows, and a second walkway along the left wall.
 function floorSlab(floor,{walkZ=null}={}){materials();const g=new THREE.Group(),W=floor.x1-floor.x0,D=floor.z1-floor.z0,cx=(floor.x0+floor.x1)/2,cz=(floor.z0+floor.z1)/2;
  const ft=repeatOf(T.floor,W/2.2,D/2.2);ft.anisotropy=8;const fl=new THREE.Mesh(keep(new THREE.PlaneGeometry(W,D)),mat(0xffffff,.02,.32,{map:ft}));fl.rotation.x=-Math.PI/2;fl.position.set(cx,0,cz);fl.receiveShadow=true;fl.name='floor';g.add(fl);
  const wz=walkZ==null?floor.z1-1.8:walkZ;
  for(const [w,d,x,z,m] of [[W-1,1.6,cx,wz,M.walk],[W-1,.05,cx,wz-.85,M.white],[W-1,.05,cx,wz+.85,M.white],[1.6,D-4,floor.x0+1.7,cz-1,M.walk]]){const p=new THREE.Mesh(keep(new THREE.PlaneGeometry(w,d)),m);p.rotation.x=-Math.PI/2;p.position.set(x,.003,z);p.receiveShadow=true;g.add(p)}
  const n=Math.max(3,Math.round(W/6));for(let i=0;i<n;i++){const a=new THREE.Mesh(keep(new THREE.PlaneGeometry(.9,.45)),keep(new THREE.MeshBasicMaterial({map:T.arrow,transparent:true,depthWrite:false})));a.rotation.x=-Math.PI/2;a.position.set(floor.x0+3+i*(W-6)/(n-1),.006,wz);g.add(a)}
  return g}

 // The roof: a light deck at height H, lattice trusses across the hall every bay with purlins along it, and the
 // overhead service runs (two round ducts with diffusers). The group is flagged roof so the viewer can hide it when
 // the camera rises above the hall. Nothing up here casts shadows (the key light comes through the roof).
 function roof(floor,H){materials();const g=new THREE.Group();g.name='roof';g.userData.roof=true;const W=floor.x1-floor.x0,D=floor.z1-floor.z0,cx=(floor.x0+floor.x1)/2,cz=(floor.z0+floor.z1)/2;
  const deck=new THREE.Mesh(keep(new THREE.PlaneGeometry(W,D)),M.ceil);deck.rotation.x=Math.PI/2;deck.position.set(cx,H,cz);g.add(deck);
  const bays=Math.max(2,Math.round(W/6));for(let i=1;i<bays;i++){const x=floor.x0+i*W/bays;bx(.14,.5,D-.4,M.truss,x,H-.3,cz,g);for(let z=floor.z0+.6;z<floor.z1-.6;z+=1.2){const d=bx(.07,.07,1.4,M.truss,x,H-.3,z+.6,g);d.rotation.x=(Math.round(z)%2?1:-1)*Math.PI/4.6}bx(.14,.1,D-.4,M.truss,x,H-.08,cz,g);bx(.14,.1,D-.4,M.truss,x,H-.55,cz,g)}
  for(let z=floor.z0+3;z<floor.z1-1;z+=6)bx(W-.4,.12,.1,M.truss,cx,H-.62,z,g);
  for(const z of [cz-D/4,cz+D/4]){cy(.38,W-2,mat(0xd3d8dc,.3,.8),cx,H-1.0,z,g,'x',24);for(let i=0;i<Math.max(4,Math.round(W/6));i++)cy(.26,.18,M.alu,floor.x0+3+i*(W-6)/Math.max(3,Math.round(W/6)-1),H-1.45,z,g,'y',16)}
  return g}

 // Where the walls go: a wall stands on every side the camera is not looking in from. With the default camera in front
 // of the hall (+z) the back, left and right walls are built and the front stays open.
 function openSides(floor,cam){return {back:cam.z>floor.z0+.5,left:cam.x>floor.x0+.5,right:cam.x<floor.x1-.5,front:cam.z<floor.z1-.5}}

 // The whole hall round a floor {x0,x1,z0,z1}: floor and walkways, the walls on the closed sides (the back wall with the
 // clock, the left wall with a fire exit by the front and a loading door, the right wall with a loading door and a
 // personnel door by the front), the kerb along the open front, the roof, and the zone when a machine box is given.
 // Returns {group, sides, walls (where the camera may go), roof, dispose-free}; the kit's dispose() frees everything.
 function buildHall(scene,floor,{name='',height=8,sides=null,cam={x:0,z:floor.z1+10},zoneBox=null,walkZ=null}={}){materials();
  const g=new THREE.Group();g.name='hall';const W=floor.x1-floor.x0,D=floor.z1-floor.z0,cx=(floor.x0+floor.x1)/2,cz=(floor.z0+floor.z1)/2;
  const s=sides||openSides(floor,cam);
  g.add(floorSlab(floor,{walkZ}));
  if(s.back){const w=wall(W,{clock:true,height});w.position.set(floor.x0,0,floor.z0);g.add(w)}else kerb(W,cx,floor.z0,g);
  if(s.left){const w=wall(D,{doors:[{at:.08,kind:'exit'},{at:.55,kind:'rollup'}],height});w.position.set(floor.x0,0,floor.z1);w.rotation.y=Math.PI/2;g.add(w)}else kerb(D,floor.x0,cz,g,Math.PI/2);
  if(s.right){const w=wall(D,{doors:[{at:.45,kind:'rollup'},{at:.92,kind:'door'}],height});w.position.set(floor.x1,0,floor.z0);w.rotation.y=-Math.PI/2;g.add(w)}else kerb(D,floor.x1,cz,g,Math.PI/2);
  if(s.front){const w=wall(W,{doors:[{at:.3,kind:'rollup'}],height});w.position.set(floor.x1,0,floor.z1);w.rotation.y=Math.PI;g.add(w)}else kerb(W,cx,floor.z1,g);
  const rf=roof(floor,height);g.add(rf);
  let zn=null;if(zoneBox)zn=zone(zoneBox,name,g);
  if(scene)scene.add(g);
  const walls={x0:s.left?floor.x0+.6:-Infinity,x1:s.right?floor.x1-.6:Infinity,z0:s.back?floor.z0+.6:-Infinity,z1:s.front?floor.z1-.6:Infinity};
  return {group:g,sides:s,walls,roof:rf,zone:zn,height}}

 const dispose=()=>{for(const o of own)o.dispose?.();own.length=0};
 return {THREE,textures,materials,mat,ctex,wall,kerb,zone,floorSlab,roof,openSides,buildHall,M,T,dispose};
}
