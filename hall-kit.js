// hall-kit.js — the factory-line design for every 3D hall page (loaded before the page's own script, which
// calls HK.dress() after it has built the hall and HK.ui() once the scene is ready).
//
// 3D: the hall gets the detailed walls of the factory-line project — white sandwich-panel cladding over a
// concrete plinth, steel I-section columns every bay with striped guards, a window in each bay, louvres, a fascia
// beam, cable tray, sprinkler main (red) and compressed-air line (blue) on brackets, floodlights, electrical
// boards with conduit, fire points, first aid, ESD / PPE signs, a wall clock, roll-up loading doors with bollards
// and hatched aprons, a fire exit with its sign and a personnel door. The front stays open. A yellow zone is
// painted round the machines with the hall's name on the floor in front of it.
//
// Page: the view sits in a card with a toolbar (previous / next view, the list of views, whole hall, process
// tour, labels, production, render quality, full screen), a legend, the machine sheet, a stats strip, every
// station of every line as chips, a machine details table and the other halls of the plant.
//
// ?top=1 renders the hall from straight above (the plan view used on the plant layout tab); ?shot=1 hides the
// page chrome for the preview photograph.
window.HKrr=function(x,X,Y,W,H,r){x.beginPath();x.moveTo(X+r,Y);x.arcTo(X+W,Y,X+W,Y+H,r);x.arcTo(X+W,Y+H,X,Y+H,r);x.arcTo(X,Y+H,X,Y,r);x.arcTo(X,Y,X+W,Y,r);x.closePath()};
window.HK=(function(){
'use strict';
const K={};
const MODE=/[?&]top=/.test(location.search)?'top':/[?&]shot=/.test(location.search)?'shot':'';
if(MODE)window.FORCE_QUALITY='standard';
// No photo panels on the machines (they read as television screens stuck to the housings); the photos stay in the machine sheet.
window.NO_PHOTOS=true;
const own=[];const keep=o=>{own.push(o);return o};
const mat=(color,metalness=.15,roughness=.6,extra={})=>keep(new THREE.MeshStandardMaterial(Object.assign({color,metalness,roughness},extra)));
const add=(m,x,y,z,parent)=>{m.position.set(x,y,z);parent.add(m);return m};
const bx=(w,h,d,material,x,y,z,parent,cast=false)=>{const m=new THREE.Mesh(keep(new THREE.BoxGeometry(w,h,d)),material);m.castShadow=cast;m.receiveShadow=true;return add(m,x,y,z,parent)};
const cy=(r,h,material,x,y,z,parent,axis='y',seg=16)=>{const g=keep(new THREE.CylinderGeometry(r,r,h,seg));if(axis==='x')g.rotateZ(Math.PI/2);if(axis==='z')g.rotateX(Math.PI/2);const m=new THREE.Mesh(g,material);m.castShadow=false;m.receiveShadow=true;return add(m,x,y,z,parent)};
const ctex=(w,h,draw)=>{const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=keep(new THREE.CanvasTexture(c));t.encoding=THREE.sRGBEncoding;t.anisotropy=4;return t};
const FONT='"IBM Plex Sans", system-ui, sans-serif';

// ---------- painted surfaces: cladding, shutter, hazard stripes, louvres, floor hatching, signs ----------
const T={};
function textures(){if(T.clad)return;
 T.clad=ctex(512,512,(x,W,H)=>{x.fillStyle='#f6f6f3';x.fillRect(0,0,W,H);for(let y=0;y<H;y+=16){x.fillStyle=y%128===0?'rgba(40,44,48,.16)':'rgba(40,44,48,.035)';x.fillRect(0,y,W,y%128===0?3:1)}for(let i=0;i<300;i++){x.fillStyle='rgba(0,0,0,.02)';x.fillRect((i*137)%W,(i*271)%H,3,1)}});
 T.shutter=ctex(256,256,(x,W,H)=>{x.fillStyle='#b9bec2';x.fillRect(0,0,W,H);for(let y=0;y<H;y+=16){x.fillStyle='rgba(255,255,255,.35)';x.fillRect(0,y,W,2);x.fillStyle='rgba(0,0,0,.22)';x.fillRect(0,y+12,W,3)}});
 T.hazard=ctex(128,128,(x,W,H)=>{x.fillStyle='#e3b82e';x.fillRect(0,0,W,H);x.fillStyle='#1c1b18';for(let k=-W;k<W*2;k+=48){x.beginPath();x.moveTo(k,0);x.lineTo(k+24,0);x.lineTo(k+24-H,H);x.lineTo(k-H,H);x.closePath();x.fill()}});
 T.louvre=ctex(128,128,(x,W,H)=>{x.fillStyle='#8b9196';x.fillRect(0,0,W,H);for(let y=8;y<H-8;y+=14){x.fillStyle='#4b5560';x.fillRect(8,y,W-16,6);x.fillStyle='rgba(255,255,255,.3)';x.fillRect(8,y+6,W-16,2)}x.strokeStyle='#5f6e78';x.lineWidth=8;x.strokeRect(4,4,W-8,H-8)});
 T.hatch=ctex(256,128,(x,W,H)=>{x.clearRect(0,0,W,H);x.fillStyle='rgba(227,184,46,.9)';for(let k=-H;k<W+H;k+=32){x.beginPath();x.moveTo(k,0);x.lineTo(k+14,0);x.lineTo(k+14+H,H);x.lineTo(k+H,H);x.closePath();x.fill()}x.strokeStyle='rgba(227,184,46,.95)';x.lineWidth=8;x.strokeRect(4,4,W-8,H-8)});
 T.exit=ctex(512,192,(x,W,H)=>{x.fillStyle='#1f8a4c';x.fillRect(0,0,W,H);x.fillStyle='#ffffff';x.font='700 84px '+FONT;x.textBaseline='middle';x.fillText('EXIT',190,H/2);x.beginPath();x.moveTo(40,H/2);x.lineTo(120,H/2-44);x.lineTo(120,H/2+44);x.closePath();x.fill();x.fillRect(110,H/2-14,50,28)});
 T.fire=ctex(128,128,(x,W,H)=>{x.fillStyle='#c8312a';x.fillRect(0,0,W,H);x.fillStyle='#fff';HKrr(x,48,40,32,70,10);x.fill();x.fillRect(56,24,16,18);x.fillRect(70,28,26,8)});
 T.aid=ctex(128,128,(x,W,H)=>{x.fillStyle='#1f8a4c';x.fillRect(0,0,W,H);x.fillStyle='#fff';x.fillRect(50,22,28,84);x.fillRect(22,50,84,28)});
 T.volt=ctex(128,128,(x,W,H)=>{x.fillStyle='#f2f1ec';x.fillRect(0,0,W,H);x.fillStyle='#e3b82e';x.strokeStyle='#1c1b18';x.lineWidth=7;x.beginPath();x.moveTo(64,14);x.lineTo(116,108);x.lineTo(12,108);x.closePath();x.fill();x.stroke();x.fillStyle='#1c1b18';x.beginPath();x.moveTo(70,40);x.lineTo(50,72);x.lineTo(64,72);x.lineTo(56,98);x.lineTo(80,62);x.lineTo(66,62);x.closePath();x.fill()});
 T.esd=ctex(512,256,(x,W,H)=>{x.fillStyle='#e3b82e';x.fillRect(0,0,W,H);x.strokeStyle='#1c1b18';x.lineWidth=14;x.strokeRect(7,7,W-14,H-14);x.fillStyle='#1c1b18';x.font='700 54px '+FONT;x.fillText('ESD',230,110);x.font='600 34px '+FONT;x.fillText('protected area',230,165);x.lineWidth=10;x.beginPath();x.moveTo(110,40);x.lineTo(190,190);x.lineTo(30,190);x.closePath();x.stroke();x.beginPath();x.moveTo(80,165);x.quadraticCurveTo(110,70,140,165);x.stroke()});
 T.ppe=ctex(512,256,(x,W,H)=>{x.fillStyle='#2c4f8a';x.fillRect(0,0,W,H);x.fillStyle='#fff';x.font='600 40px '+FONT;x.textBaseline='middle';x.fillText('Safety shoes and',40,96);x.fillText('glasses required',40,150);x.beginPath();x.arc(W-80,H/2,48,0,Math.PI*2);x.lineWidth=10;x.strokeStyle='#fff';x.stroke()});
 T.clock=ctex(256,256,(x,W,H)=>{x.clearRect(0,0,W,H);x.fillStyle='#fafaf7';x.beginPath();x.arc(128,128,120,0,Math.PI*2);x.fill();x.lineWidth=10;x.strokeStyle='#1c1b18';x.stroke();for(let k=0;k<12;k++){const a=k*Math.PI/6;x.lineWidth=k%3?4:8;x.beginPath();x.moveTo(128+Math.sin(a)*96,128-Math.cos(a)*96);x.lineTo(128+Math.sin(a)*110,128-Math.cos(a)*110);x.stroke()}x.lineCap='round';x.lineWidth=9;x.beginPath();x.moveTo(128,128);x.lineTo(128+52,128-30);x.stroke();x.lineWidth=6;x.beginPath();x.moveTo(128,128);x.lineTo(128-20,128-86);x.stroke()});
 T.hatch.transparent=true;T.clock.transparent=true}
const repeatOf=(t,rx,ry)=>{const c=keep(t.clone());c.wrapS=c.wrapT=THREE.RepeatWrapping;c.repeat.set(rx,ry);c.needsUpdate=true;return c};
const M={};
function materials(){if(M.steel)return;textures();
 Object.assign(M,{concrete:mat(0xbdbcb6,.02,.92),trim:mat(0xe6e6e1,.1,.5),steel:mat(0x4b5560,.5,.45),lightSteel:mat(0xb4b8bc,.75,.3),dark:mat(0x2b2d30,.3,.6),red:mat(0xc8312a,.15,.45),green:mat(0x1f8a4c,.1,.5),blue:mat(0x2c6fb8,.3,.45),
  board:mat(0xc9ccce,.35,.45),pane:mat(0xd6e4ec,.1,.15,{emissive:0xe8f1f6,emissiveIntensity:.5}),lamp:mat(0xffffff,0,.3,{emissive:0xfff3dc,emissiveIntensity:1.4}),door:mat(0x6f7c86,.3,.5),yellow:mat(0xe3b82e,.1,.5),
  shutter:mat(0xffffff,.4,.45,{map:T.shutter}),louvre:mat(0xffffff,.3,.5,{map:T.louvre}),hazard:mat(0xffffff,.1,.55,{map:T.hazard}),glass:mat(0xa9bcc6,.1,.05,{transparent:true,opacity:.22,depthWrite:false})})}
const decal=(key,w,h,x,y,z,parent,glow=0)=>{const t=T[key];const m=new THREE.Mesh(keep(new THREE.PlaneGeometry(w,h)),mat(0xffffff,0,.6,Object.assign({map:t,transparent:!!t.transparent},glow?{emissive:0xffffff,emissiveMap:t,emissiveIntensity:glow}:{})));m.castShadow=false;m.position.set(x,y,z);parent.add(m);return m};

// One wall, in its own frame: it runs along +x from 0 to len and faces +z (into the hall), H high.
// doors=[{at: 0..1 along the wall, kind:'rollup'|'exit'|'door'}] snapped to the middle of a bay; clock: a wall clock in the middle bay.
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
K.wall=wall;

// Take the page's own plain walls and wall furniture away where a detailed wall goes: wall planes, windows, old
// columns with their stripe rings, the roller door with its frame, the personnel door, exit sign, cable tray,
// fire points and bollards. Machines, props and the roof stay.
function strip(b,H,sides){const inPick=new Set();(typeof pickables!=='undefined'?pickables:[]).forEach(g=>g.traverse(o=>inPick.add(o)));const roof=new Set([...(window._roof||[]),...(RL.roof||[])]);
 const bb=new THREE.Box3(),sz=new THREE.Vector3(),ce=new THREE.Vector3();const dead=[];
 scene.traverse(o=>{if(!o.isMesh||o.isSprite||inPick.has(o)||roof.has(o)||o===RL.floor||o.name==='contact'||o.name==='merged')return;bb.setFromObject(o);if(bb.isEmpty())return;bb.getSize(sz);bb.getCenter(ce);
  const near=[];if(sides.back&&ce.z-b.minZ<=.8)near.push('z');if(sides.left&&ce.x-b.minX<=.8)near.push('x');if(sides.right&&b.maxX-ce.x<=.8)near.push('x');if(!near.length)return;
  const thin=near.some(a=>sz[a]<=.36),tall=sz.y>=H*.85,ring=sz.y<=.15&&sz.x<=.7&&sz.z<=.7,small=sz.y<=1.2&&/Cylinder/.test(o.geometry.type);
  if(o.geometry.isPlaneGeometry||thin||tall||ring||small)dead.push(o)});
 dead.forEach(o=>o.parent&&o.parent.remove(o));return dead.length}

// Zone: yellow lane marks round the machines and the hall's name painted on the floor in front.
function zone(box,name,parent){const g=new THREE.Group(),pad=1.1,x0=box.x0-pad,x1=box.x1+pad,z0=box.z0-pad,z1=box.z1+pad,yellow=mat(0xe3b82e,.05,.6);
 const strip=(w,d,x,z)=>{const m=new THREE.Mesh(keep(new THREE.PlaneGeometry(w,d)),yellow);m.rotation.x=-Math.PI/2;m.position.set(x,.004,z);m.receiveShadow=true;g.add(m)};
 strip(x1-x0,.1,(x0+x1)/2,z0);strip(x1-x0,.1,(x0+x1)/2,z1);strip(.1,z1-z0,x0,(z0+z1)/2);strip(.1,z1-z0,x1,(z0+z1)/2);
 if(name){const t=ctex(2048,128,(x,W,H)=>{x.fillStyle='rgba(40,42,40,.62)';x.font='700 84px '+FONT;x.textAlign='center';x.textBaseline='middle';x.fillText(name.toUpperCase(),W/2,H/2,W-16)});
  const w=Math.min(14.4,(x1-x0)*.8);const m=new THREE.Mesh(keep(new THREE.PlaneGeometry(w,w/16)),keep(new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false})));m.rotation.x=-Math.PI/2;m.position.set((x0+x1)/2,.006,z1+.75);g.add(m)}
 parent.add(g);return g}

function hallName(){const h=document.querySelector('#ctrl h1');return (h?h.textContent:document.title).split(/ — | – | - /)[0].trim()}

// ---------- 3D: called by the page after its hall, lines and dressing are built ----------
K.dress=function(){if(K.dressed||typeof RL==='undefined'||!RL.bounds)return;K.dressed=true;
 const b=RL.bounds,H=(typeof hallH==='number'&&hallH>3)?hallH:8;const cam=camera.position;
 // a wall is built where the overview camera is not: it looks in through the open side(s)
 const sides={back:cam.z>b.minZ+.5,left:cam.x>b.minX+.5,right:cam.x<b.maxX-.5};
 strip(b,H,sides);
 const g=new THREE.Group();g.name='hk-walls';scene.add(g);
 if(sides.back){const w=wall(b.W,{clock:true,height:H});w.position.set(b.minX,0,b.minZ);g.add(w)}
 if(sides.left){const w=wall(b.D,{doors:[{at:.08,kind:'exit'},{at:.55,kind:'rollup'}],height:H});w.position.set(b.minX,0,b.maxZ);w.rotation.y=Math.PI/2;g.add(w)}
 if(sides.right){const w=wall(b.D,{doors:[{at:.45,kind:'rollup'},{at:.92,kind:'door'}],height:H});w.position.set(b.maxX,0,b.minZ);w.rotation.y=-Math.PI/2;g.add(w)}
 bx(b.W,.12,.12,M.dark,b.cx,.06,b.maxZ,g);
 // the zone round the machines
 const bb=new THREE.Box3(),u=new THREE.Box3();(typeof pickables!=='undefined'?pickables:[]).forEach(p=>{bb.setFromObject(p);if(!bb.isEmpty())u.union(bb)});
 if(!u.isEmpty()){const box={x0:Math.max(b.minX+1.4,u.min.x),x1:Math.min(b.maxX-1.4,u.max.x),z0:Math.max(b.minZ+1.4,u.min.z),z1:Math.min(b.maxZ-2.2,u.max.z)};K.zone=box;zone(box,hallName(),g)}
 K.sides=sides;K.walls={x0:b.minX+.6,x1:b.maxX-.6,z0:b.minZ+.6};
 try{K.models()}catch(e){console.warn('hall-kit models',e)}
 try{K.detail()}catch(e){console.warn('hall-kit detail',e)}
 // the camera stays inside the walls that were built
 if(typeof animated!=='undefined')animated.push(()=>{const p=camera.position;if(sides.left&&p.x<K.walls.x0)p.x=K.walls.x0;if(sides.right&&p.x>K.walls.x1)p.x=K.walls.x1;if(sides.back&&p.z<K.walls.z0)p.z=K.walls.z0;if(p.y<.4)p.y=.4})};

// ---------- the factory-line machine models ----------
// Every placed machine whose kind the factory-line library models (SMT loader, printer, SPI, pick-and-place, reflow,
// AOI, X-ray, LED process machines and testers, curing oven, autoclave, injection press with its take-out robot,
// resin dryer, TV test benches, CNC, programming handler, robot arm, AGV; lab benches, bioreactors, incubators,
// freezers, hoods, centrifuges; compressors, lasers, test benches, grinders, hobbing and machining centres, lathes,
// welding cells, racks, forklifts, cabinets, coaters, transformers, gensets, mills, furnaces, stamping presses,
// shredders, sorters, balers, extruders, granulators, tanks) is rebuilt from that library in place of the page's
// own housing, sized to its station, carrying its catalogue details on its screen, and animated when the line runs.
// Which model stands for which machine is decided by machine-rules.js (window.MR): a plant / line model, a factory-line
// builder, one of the portal's own builders (machines/*.js) or the page's own housing.
K.models=function(){if(K.modelled||!window.FL||!window.MR)return;K.modelled=true;const picks=(typeof pickables!=='undefined'?pickables:[]);const H=(typeof hallH==='number'&&hallH>3)?hallH:8;
 const models=FL.createPlantModels(THREE),kit=FL.createKit(THREE),bb=new THREE.Box3(),mb=new THREE.Box3(),sz=new THREE.Vector3(),ms=new THREE.Vector3(),ce=new THREE.Vector3();let n=0;K.models.list=[];K.models.rows=[];
 for(const g of picks.slice()){const info=infoOf(g),d=placedOf(info);if(!d||g.userData.hkModel)continue;
  const station=info.station||(info.r&&info.r.station)||info.title||'';const row=rowOf(info)||{station,name:d.name,lot:d.lot,year:d.year,weight:'',supply:'',ph:'',kind:''};
  const hit=MR.resolve(Object.assign({},row,{station:row.station||station,name:row.name||d.name}));K.models.rows.push([station,d.name,hit?hit.src+':'+hit.kind:'-']);if(!hit||hit.src==='none')continue;
  const meshes=[];bb.makeEmpty();g.traverse(o=>{if(!o.isMesh||!o.visible||o.isSprite)return;meshes.push(o);mb.setFromObject(o);if(mb.isEmpty())return;mb.getSize(ms);if(ms.x*ms.y*ms.z>=.012&&ms.y<4)bb.union(mb)});
  if(bb.isEmpty())continue;bb.getSize(sz);bb.getCenter(ce);if(sz.x<.4||sz.z<.3)continue;
  const s={x:ce.x,z:ce.z,w:Math.max(.8,sz.x),d:Math.max(.6,sz.z),h:sz.y,type:station,name:d.name,title:d.name,lot:d.lot,year:d.year,status:'in',make:hit.make,model:hit.model,count:hit.count,opts:hit.opts,photo:row.ph||'',
   payload:/kuka|fanuc|abb|robot/i.test(d.name)?(/kr ?(\d+)/i.test(d.name)?+RegExp.$1:20):undefined,info:{weight:row.weight||'',power:row.supply||'',size:'',supplied:'',category:station,area:'',status:'In sale'}};
  let u=null;try{u=hit.src==='plant'?models.machine(hit.kind,s,true):hit.src==='fl'?FL.builders[hit.kind](kit,s):MB.build(hit.kind,kit,s)}catch(e){console.warn('model',hit.src,hit.kind,d.name,e);u=null}
  if(!u||!u.group)continue;const mg=u.group;if(hit.src!=='plant')mg.position.set(ce.x,0,ce.z);
  // the detail pass of the library models (machines/dress.js): doors, controls, labels, nameplate on the plain bodies
  if(hit.src!=='mb'&&window.MB&&MB.dress){try{MB.dress(hit.kind,mg,s,kit)}catch(e){console.warn('dress',hit.kind,e)}}
  // sized to the station it stands in (uniformly, so the model keeps its proportions)
  const pg=new THREE.Group();pg.name='fl-machine';pg.add(mg);scene.add(pg);pg.updateMatrixWorld(true);mb.setFromObject(mg);if(mb.isEmpty()){scene.remove(pg);continue}mb.getSize(ms);
  const sc=Math.max(.45,Math.min(1.7,Math.min(sz.x/Math.max(.3,ms.x),(sz.z*1.3)/Math.max(.3,ms.z),(H-.8)/Math.max(.5,ms.y))));
  if(Math.abs(sc-1)>.04){mg.scale.setScalar(sc);mg.position.set(ce.x+(mg.position.x-ce.x)*sc,0,ce.z+(mg.position.z-ce.z)*sc)}
  // the page's housing gives way; the new model is picked, lit and animated like it
  for(const o of meshes)o.visible=false;
  pg.traverse(o=>{if(o.isMesh){o.userData.info=info;o.castShadow=true;o.receiveShadow=true}});pg.userData={hkFL:true,kind:hit.kind,src:hit.src,info,orig:g};g.userData.hkModel=pg;picks.push(pg);
  if(u.lamps&&u.lamps[0]&&u.lamps[0].material){u.lamps[0].material.emissiveIntensity=1.4}
  if(typeof u.update==='function'&&typeof animated!=='undefined')animated.push((t,run)=>{try{u.update(t,run!==false,t)}catch(e){}});
  K.models.list.push(hit.src+':'+hit.kind);n++}
 K.modelsBuilt=n};

// ---------- machine detail: the real make and model on every placed machine ----------
// Each placed machine (a pickable group with catalogue details) gets what the original carries: a maker nameplate
// with its make, model and lot, a brand colour band, a framed glass front window on tall cabinets, ventilation
// grilles on the sides, a warning label, a cable drop from the ceiling tray; feeder banks on placement machines,
// exhaust stacks on ovens and furnaces. Everything is placed on a surface found by probing the machine, so
// nothing floats in front of an open frame.
const BRAND=[[/koh ?young/i,0x0e5aa7],[/ekra/i,0x1a4f9c],[/heller/i,0xb0202a],[/samsung|hanwha/i,0x1428a0],[/parmi/i,0x2a7fbd],[/yamaha/i,0x5b2e91],[/panasonic/i,0x1b4ea3],[/juki/i,0x1f6fb5],[/fuji/i,0x1c7c3c],[/engel/i,0x2f7a3a],[/kuka/i,0xe8772e],[/fanuc/i,0xe9c12f],[/\bsts\b/i,0x8a2a2a],[/mpm|itw|speedline/i,0x1e5fa8],[/hephzibah/i,0x1d7448],[/schuler|müller|mueller/i,0x1f3f6e],[/trumpf/i,0x2b7fbd],[/zeiss/i,0x0f4c81],[/\bmak\b/i,0x6a3f9c],[/ki ?heung/i,0x0b6e8a],[/shini/i,0x2f6fb0],[/yudo/i,0xc14a2b],[/tsm/i,0x4f5b66],[/nordson|dage/i,0x1d5fa6],[/dek|asm/i,0x1a4f9c],[/omron/i,0x1d5fa6],[/jot|automation/i,0x3b5bab]];
const brandOf=n=>{for(const [re,c] of BRAND)if(re.test(n))return c;return 0x3b5bab};
const infoOf=g=>{let i=null;g.traverse(o=>{if(!i&&o.userData&&o.userData.info)i=o.userData.info});return i};
const placedOf=i=>{if(!i||i.shared===true&&!i.e)return null;const d=i.data?{name:i.data[1],lot:i.data[0],year:i.data[2]}:i.e?{name:i.e.name,lot:i.e.lot,year:i.e.year}:i.r?(i.r.kind==='na'?null:{name:i.r.name,lot:(i.r.lot||'').split(/[,+]/)[0].trim(),year:i.r.year}):null;return d&&d.name?d:null};
const plateTex=new Map();
function nameplate(name,lot){const key=name+'|'+lot;if(plateTex.has(key))return plateTex.get(key);
 const words=name.replace(/\s+/g,' ').trim().split(' ');let brand=words[0],model=words.slice(1).join(' ');if(/^(ki|koh|the|itw|samsung|carl|müller|mueller|ta|ts)$/i.test(brand)&&words[1]){brand=words.slice(0,2).join(' ');model=words.slice(2).join(' ')}
 const t=ctex(512,128,(x,W,H)=>{x.fillStyle='#2b2d30';HKrr(x,0,0,W,H,10);x.fill();x.fillStyle='#d9824a';x.fillRect(0,0,10,H);x.strokeStyle='rgba(255,255,255,.18)';x.lineWidth=3;HKrr(x,4,4,W-8,H-8,8);x.stroke();
  x.fillStyle='#f2f1ec';x.textBaseline='middle';x.font='700 44px '+FONT;x.fillText(brand.toUpperCase(),28,40,W-50);x.fillStyle='#c9ccce';x.font='500 30px '+FONT;x.fillText(model||' ',28,88,W-170);
  if(lot){x.fillStyle='#9aa3ab';x.font='500 22px "IBM Plex Mono", ui-monospace, monospace';x.textAlign='right';x.fillText(String(lot),W-22,92);x.textAlign='left'}});
 plateTex.set(key,t);return t}
let grilleTex=null,warnTex=null;
const grille=()=>grilleTex||(grilleTex=ctex(128,128,(x,W,H)=>{x.fillStyle='#b9bec2';x.fillRect(0,0,W,H);for(let y=10;y<H-8;y+=12){x.fillStyle='#4b5560';x.fillRect(10,y,W-20,5);x.fillStyle='rgba(255,255,255,.35)';x.fillRect(10,y+5,W-20,2)}x.strokeStyle='#8b9196';x.lineWidth=6;x.strokeRect(3,3,W-6,H-6)}));
const warn=()=>warnTex||(warnTex=ctex(128,128,(x,W,H)=>{x.fillStyle='#e3b82e';x.beginPath();x.moveTo(64,8);x.lineTo(122,116);x.lineTo(6,116);x.closePath();x.fill();x.strokeStyle='#1c1b18';x.lineWidth=7;x.stroke();x.fillStyle='#1c1b18';x.fillRect(58,40,12,42);x.fillRect(58,90,12,12)}));

// The station row (hall-data.js) of a machine: by line and step, or by station name for support equipment.
const rowOf=info=>{if(!info)return null;const HD=window.HALL_DATA,key=location.pathname.split('/').pop().replace(/\.html$/,''),hall=HD&&HD.halls[key];if(!hall)return null;
 if(info.r&&info.r.station){const r=hall.rows.find(r=>r.station===info.r.station&&(r.line||0)===(info.r.line||0)&&(r.step||0)===(info.r.step||0));if(r)return r}
 const L=info.line!=null?info.line:null,S=info.si!=null?info.si+1:null;if(L!=null&&S!=null){const r=hall.rows.find(r=>r.line===L&&r.step===S);if(r)return r}
 const nm=info.title||info.station;return nm?hall.rows.find(r=>r.station===nm)||null:null};
// The photograph of each machine, loaded in the background, is painted over the flat front of its housing (the
// real control panels, doors, screens and colours), and the housing takes the body and accent colours measured
// from the photograph, so each machine looks like the one in the catalogue.
K.skins=function(jobs){if(!jobs||!jobs.length)return;let busy=0;const q=jobs.slice();K.skinned=0;
 const palette=(x,W,H)=>{const d=x.getImageData(0,0,W,H).data;let body=[0,0,0,0],acc=[0,0,0,0];const bins=new Map();
  for(let i=0;i<d.length;i+=16){const r=d[i],g=d[i+1],b=d[i+2],mx=Math.max(r,g,b),mn=Math.min(r,g,b),sat=mx?(mx-mn)/mx:0,l=(mx+mn)/510;
   if(sat<.22&&l>.42){body[0]+=r;body[1]+=g;body[2]+=b;body[3]++}
   else if(sat>.45&&l>.18&&l<.85){const k=((r>>5)<<6)|((g>>5)<<3)|(b>>5);const e=bins.get(k)||[0,0,0,0];e[0]+=r;e[1]+=g;e[2]+=b;e[3]++;bins.set(k,e)}}
  let top=null;for(const e of bins.values())if(!top||e[3]>top[3])top=e;const n=d.length/16;
  return {body:body[3]>n*.08?body.slice(0,3).map(v=>v/body[3]/255):null,accent:top&&top[3]>n*.02?top.slice(0,3).map(v=>v/top[3]/255):null}};
 const one=job=>new Promise(res=>{const im=new Image();im.onload=()=>{try{const {skin,put,g,meshes}=job,w=skin.x1-skin.x0,h=skin.y1-skin.y0;const W=512,Hc=Math.max(128,Math.min(1024,Math.round(512*h/w)));
   const c=document.createElement('canvas');c.width=W;c.height=Hc;const x=c.getContext('2d');const s=Math.max(W/im.naturalWidth,Hc/im.naturalHeight),dw=im.naturalWidth*s,dh=im.naturalHeight*s;x.drawImage(im,(W-dw)/2,(Hc-dh)*.4,dw,dh);
   const pal=palette(x,W,Hc);
   const v=x.createLinearGradient(0,0,0,Hc);v.addColorStop(0,'rgba(0,0,0,.18)');v.addColorStop(.12,'rgba(0,0,0,0)');v.addColorStop(.9,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.22)');x.fillStyle=v;x.fillRect(0,0,W,Hc);
   x.strokeStyle='rgba(20,22,24,.55)';x.lineWidth=6;x.strokeRect(3,3,W-6,Hc-6);
   const t=keep(new THREE.CanvasTexture(c));t.encoding=THREE.sRGBEncoding;t.anisotropy=8;
   const m=new THREE.Mesh(keep(new THREE.PlaneGeometry(w,h)),mat(0xffffff,.05,.55,{map:t}));put(m,(skin.x0+skin.x1)/2,(skin.y0+skin.y1)/2,skin.z);m.userData.info=infoOf(g);
   // the housing takes the body colour of the real machine; its accent colour goes on the parts that carry colour
   if(pal.body){const count=new Map();for(const o of meshes){const mm=o.material;if(mm&&mm.isMeshStandardMaterial&&!mm.map&&!mm.transparent)count.set(mm,(count.get(mm)||0)+1)}
    let main=null;for(const [mm,k] of count)if(!main||k>main[1])main=[mm,k];
    if(main){const src=main[0],col=src.color,lum=col.r*.3+col.g*.59+col.b*.11;if(lum>.35){const nm=src.clone();keep(nm);nm.color.setRGB(col.r*.45+pal.body[0]*.55,col.g*.45+pal.body[1]*.55,col.b*.45+pal.body[2]*.55);for(const o of meshes)if(o.material===src)o.material=nm}}}
   K.skinned++}catch(e){console.warn('skin',e)}res()};im.onerror=()=>res();im.src=job.url});
 const pump=()=>{while(busy<4&&q.length){busy++;one(q.shift()).then(()=>{busy--;pump()})}};
 if(document.readyState==='complete')setTimeout(pump,300);else addEventListener('load',()=>setTimeout(pump,300),{once:true})};
K.detail=function(){if(K.detailed)return;K.detailed=true;materials();const picks=(typeof pickables!=='undefined'?pickables:[]);const H=(typeof hallH==='number'&&hallH>3)?hallH:8;
 const ray=new THREE.Raycaster(),bb=new THREE.Box3(),sz=new THREE.Vector3(),ce=new THREE.Vector3(),dirZ=new THREE.Vector3(0,0,-1),dirX=new THREE.Vector3(1,0,0),dirXn=new THREE.Vector3(-1,0,0);
 const glassM=keep(new THREE.MeshPhysicalMaterial({color:0x223340,transparent:true,opacity:.42,roughness:.08,metalness:.1,depthWrite:false})),alu=M.lightSteel,dark=M.dark;
 let n=0;const skins=[];const DR=new THREE.Group();DR.name='hk-detail';scene.add(DR);K.detailRoot=DR;
 const mb=new THREE.Box3(),ms=new THREE.Vector3();
 for(const g of picks){const info=infoOf(g),d=placedOf(info);if(!d||g.userData.hkFL||g.userData.hkModel)continue;
  // the body of the machine: its solid parts, not the rods, cables, label sprites and screens that reach above it
  const meshes=[];bb.makeEmpty();g.traverse(o=>{if(!o.isMesh||!o.visible||o.isSprite||(o.material&&o.material.transparent&&o.material.opacity<.5))return;meshes.push(o);mb.setFromObject(o);if(mb.isEmpty())return;mb.getSize(ms);if(ms.x*ms.y*ms.z>=.012&&ms.y<4)bb.union(mb)});
  if(bb.isEmpty()||!meshes.length)continue;bb.getSize(sz);bb.getCenter(ce);if(sz.y<.7||sz.x<.5||sz.x>12||sz.z>8)continue;
  // probe the front (+z) at a point: the z of the machine's own surface there, if it is near its front plane
  const front=(x,y,depth=.7)=>{ray.set(new THREE.Vector3(x,y,bb.max.z+1),dirZ);ray.far=1+depth;const h=ray.intersectObjects(meshes,false)[0];return h?h.point.z:null};
  const side=(sgn,z,y)=>{ray.set(new THREE.Vector3(sgn>0?bb.max.x+1:bb.min.x-1,y,z),sgn>0?dirXn:dirX);ray.far=1.5;const h=ray.intersectObjects(meshes,false)[0];return h&&Math.abs(h.point.x-(sgn>0?bb.max.x:bb.min.x))<.5?h.point.x:null};
  const det=DR,toLocal=v=>v.clone();
  const put=(mesh,wx,wy,wz,ry=0)=>{mesh.position.set(wx,wy,wz);mesh.rotation.y=ry;mesh.castShadow=false;mesh.receiveShadow=true;det.add(mesh);return mesh};
  const plane=(w,h,material)=>new THREE.Mesh(keep(new THREE.PlaneGeometry(w,h)),material);
  const name=d.name,col=brandOf(name),wide=Math.min(sz.x,4);
  // the machine's own photograph goes edge to edge on the largest flat part of its front
  const row=rowOf(info),url=row&&row.ph;let skin=null;
  if(url&&MODE!=='top'&&!g.userData.hkFL){const NX=12,NY=8,x0=bb.min.x+.04,x1=bb.max.x-.04,y0=bb.min.y+.12,y1=bb.max.y-.04,cw=(x1-x0)/NX,ch=(y1-y0)/NY,cell=[];const zs=new Map();
   for(let j=0;j<NY;j++)for(let i=0;i<NX;i++){const z=front(x0+(i+.5)*cw,y0+(j+.5)*ch,.9);const k=z==null?null:Math.round(z*25)/25;cell.push(k);if(k!=null)zs.set(k,(zs.get(k)||0)+1)}
   let best=null;for(const [k,c] of zs)if(!best||c>best[1])best=[k,c];
   if(best&&best[1]>=NX*NY*.3){const on=cell.map(k=>k!=null&&Math.abs(k-best[0])<.03);let rect=null;
    for(let r0=0;r0<NY;r0++)for(let r1=r0;r1<NY;r1++){let run=0;for(let i=0;i<=NX;i++){let ok=i<NX;for(let r=r0;ok&&r<=r1;r++)ok=on[r*NX+i];if(ok)run++;else{const area=run*(r1-r0+1);if(run>0&&(!rect||area>rect.area))rect={area,i0:i-run,i1:i-1,r0,r1};run=0}}}
    if(rect&&rect.area>=NX*NY*.28&&(rect.i1-rect.i0+1)*cw>=.6&&(rect.r1-rect.r0+1)*ch>=.5){let z=null;const cx=x0+((rect.i0+rect.i1+1)/2)*cw,cy=y0+((rect.r0+rect.r1+1)/2)*ch;z=front(cx,cy,.9);
     if(z!=null)skin={x0:x0+rect.i0*cw+.02,x1:x0+(rect.i1+1)*cw-.02,y0:y0+rect.r0*ch+.02,y1:y0+(rect.r1+1)*ch-.02,z:z+.009}}}}
  if(skin){skins.push({g:g,det,skin,url,put,meshes,toLocal});K.skinQueue=skins}
  // nameplate on the top band of the front, where the front is flat
  {const pw=Math.max(.5,Math.min(wide*.55,1.3)),ph=pw/4,py=Math.min(bb.max.y-ph/2-.1,bb.min.y+sz.y*.86),px=ce.x-wide*.5+pw/2+.15;const z=front(px,py);
   if(z!=null&&front(px-pw/2+.05,py)!=null&&front(px+pw/2-.05,py)!=null){put(plane(pw,ph,mat(0xffffff,.1,.5,{map:nameplate(name,d.lot)})),px,py,z+.012);n++}}
  // brand colour band across the front
  if(!skin){const by=bb.min.y+sz.y*.64,z=front(ce.x,by);if(z!=null&&front(ce.x-wide*.4,by)!=null&&front(ce.x+wide*.4,by)!=null)put(plane(wide*.86,.06,mat(col,.2,.5)),ce.x,by,z+.01)}
  // framed glass window on tall cabinets: tinted pane, aluminium frame, two handles
  if(!skin&&sz.y>=1.3&&sz.x>=.9){const gw=wide*.56,gh=Math.min(sz.y*.34,.9),gy=bb.min.y+sz.y*.42,z=front(ce.x,gy),ok=z!=null&&[[-1,-1],[1,-1],[-1,1],[1,1]].every(([a,b])=>{const zz=front(ce.x+a*gw/2*.9,gy+b*gh/2*.9);return zz!=null&&Math.abs(zz-z)<.05});
   if(ok){put(plane(gw,gh,glassM),ce.x,gy,z+.012);const f=.035;for(const [w,h,dx,dy] of [[gw+f*2,f,0,gh/2+f/2],[gw+f*2,f,0,-gh/2-f/2],[f,gh,-gw/2-f/2,0],[f,gh,gw/2+f/2,0]]){const m=new THREE.Mesh(keep(new THREE.BoxGeometry(w,h,.03)),alu);put(m,ce.x+dx,gy+dy,z+.015)}
    for(const dx of [-gw*.22,gw*.22]){const hd=new THREE.Mesh(keep(new THREE.BoxGeometry(.03,.16,.04)),dark);put(hd,ce.x+dx,gy-gh*.35,z+.045)}}}
  // ventilation grilles on both sides, a warning label by the front corner
  for(const sgn of [-1,1]){const gy=bb.min.y+Math.min(.55,sz.y*.3),gz=ce.z+sz.z*.1,x=side(sgn,gz,gy);if(x!=null){const m=plane(.42,.3,mat(0xffffff,.3,.5,{map:grille()}));put(m,x+sgn*.008,gy,gz,sgn>0?Math.PI/2:-Math.PI/2)}}
  {const wy=bb.min.y+.28,wx=ce.x+wide*.42,z=front(wx,wy);if(z!=null)put(plane(.12,.12,mat(0xffffff,0,.6,{map:warn(),transparent:true})),wx,wy,z+.01)}
  const text=(name+' '+(info.station||(info.r&&info.r.station)||'')).toLowerCase();
  // feeder bank along the front of placement machines
  if(/pick|place|mounter|chip shooter|mounting/.test(text)&&sz.x>=1.4){const fy=bb.min.y+.72,z=front(ce.x,fy);if(z!=null){const k=Math.max(4,Math.floor(wide*.8/.09));for(let i=0;i<k;i++){const x=ce.x-wide*.4+i*.09+.045;const f=new THREE.Mesh(keep(new THREE.BoxGeometry(.07,.16,.3)),i%2?M.lightSteel:M.board);put(f,x,fy-.1,z+.16);const r=new THREE.Mesh(keep(new THREE.CylinderGeometry(.075,.075,.02,14)),i%3?mat(0xe9e8e3,.05,.5):mat(0x2c4f8a,.1,.5));r.geometry.rotateZ(Math.PI/2);put(r,x,fy+.05,z+.3)}
   const rail=new THREE.Mesh(keep(new THREE.BoxGeometry(wide*.82,.04,.34)),alu);put(rail,ce.x,fy-.2,z+.17)}}
  // exhaust stacks on ovens, furnaces and dryers
  if(/reflow|oven|furnace|curing|dryer|wave/.test(text)&&bb.max.y<H-1.5){for(const fx of [-.3,.3]){const x=ce.x+sz.x*fx,top=bb.max.y,L=H-.5-top;const st=new THREE.Mesh(keep(new THREE.CylinderGeometry(.11,.11,L,14)),M.lightSteel);put(st,x,top+L/2,ce.z);const fl=new THREE.Mesh(keep(new THREE.CylinderGeometry(.16,.16,.05,14)),dark);put(fl,x,top+.1,ce.z)}}
 }
 K.details=n;K.skins(skins)};

// ---------- page chrome ----------
const el=(tag,cls,html)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e};
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const KIND={ok:['green','Machine placed'],shared:['blue','Shared with another line'],na:['red','Not available'],sup:['grey','Support equipment']};
const kindOf=r=>r.kind==='na'?'na':r.kind==='shared'?'shared':r.line?'ok':'sup';
const findPick=(line,step)=>{for(const g of (typeof pickables!=='undefined'?pickables:[])){let info=null;g.traverse(o=>{if(!info&&o.userData&&o.userData.info)info=o.userData.info});if(!info)continue;
 const L=info.line!=null?info.line:info.r&&info.r.line,S=info.si!=null?info.si+1:info.r&&info.r.step;if(L===line&&S===step)return {g,info}}return null};
const findSupport=station=>{for(const g of (typeof pickables!=='undefined'?pickables:[])){let info=null;g.traverse(o=>{if(!info&&o.userData&&o.userData.info)info=o.userData.info});if(!info)continue;
 const name=info.r?info.r.station:info.title||info.station;if(name===station&&(info.shared||!info.line||(info.r&&!info.r.line)))return {g,info}}return null};
function flyToGroup(g){const bb=new THREE.Box3().setFromObject(g);if(bb.isEmpty())return;const sz=bb.getSize(new THREE.Vector3()),ce=bb.getCenter(new THREE.Vector3());
 const t=[ce.x,Math.min(ce.y,1.2),ce.z],d=Math.max(5,sz.x*1.6,sz.z*1.6,sz.y*2.2),dir=new THREE.Vector3(.05,.55,.84).normalize().multiplyScalar(d),p=[t[0]+dir.x,t[1]+dir.y,t[2]+dir.z];
 if(typeof flyTo==='function')flyTo(p,t);else if(typeof fly!=='undefined')fly={from:camera.position.clone(),to:new THREE.Vector3(...p),tf:controls.target.clone(),tt:new THREE.Vector3(...t),t:0};else{camera.position.set(...p);controls.target.set(...t)}}
function pickRow(r){if(typeof tour!=='undefined'&&tour.active&&typeof stopTour==='function')stopTour();
 const hit=r.line?findPick(r.line,r.step):findSupport(r.station);
 if(r.line&&typeof go==='function')go('L'+r.line);
 if(hit){if(typeof show==='function')show(hit.info,hit.g);flyToGroup(hit.g);return true}return false}


// ---------- the process tour: click a machine to pause the tour and read its details ----------
// During a line tour the camera follows the board and the page ignores clicks; here a click on a machine pauses the
// tour (the line stops, the camera is released), shows the machine's sheet and marks it; "Resume tour" (or closing
// the sheet) carries on from where the board stopped. Exit tour clears the pause.
K.tourPick=function(){if(K.tourPickDone||typeof tour==='undefined'||typeof updateTour!=='function')return;K.tourPickDone=true;
 const strip=document.getElementById('tour'),head=strip&&strip.querySelector('.tourhead'),canvasEl=document.getElementById('scene');if(!strip||!head||!canvasEl)return;
 const hint=document.createElement('span');hint.className='hk-tourhint';hint.textContent='Click a machine for its details';const res=document.createElement('button');res.className='stop hk-resume';res.textContent='▶ Resume tour';res.hidden=true;
 head.insertBefore(hint,head.querySelector('.stop'));head.insertBefore(res,head.querySelector('.stop'));
 const setRun=v=>{try{run=v}catch(e){}};
 const pause=()=>{if(tour.paused)return;tour.paused=true;setRun(false);controls.enabled=true;res.hidden=false;hint.textContent='Tour paused — look around, then resume';strip.classList.add('paused')};
 const resume=()=>{if(!tour.paused)return;tour.paused=false;setRun(true);controls.enabled=false;res.hidden=true;hint.textContent='Click a machine for its details';strip.classList.remove('paused');
  const info=document.getElementById('info');if(info)info.hidden=true;if(typeof selBox!=='undefined')selBox.visible=false};
 res.onclick=resume;
 const origUpdate=updateTour;window.updateTour=function(){if(tour.paused){controls.update();return}return origUpdate.apply(this,arguments)};
 const origStop=stopTour;window.stopTour=function(){tour.paused=false;res.hidden=true;hint.textContent='Click a machine for its details';strip.classList.remove('paused');return origStop.apply(this,arguments)};
 const closeBtn=document.getElementById('close');if(closeBtn){const oc=closeBtn.onclick;closeBtn.onclick=e=>{if(oc)oc.call(closeBtn,e);if(tour.active&&tour.paused)resume()}}
 const ray=new THREE.Raycaster(),ptr=new THREE.Vector2();let down=null;
 canvasEl.addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY]},true);
 canvasEl.addEventListener('pointerup',e=>{if(!tour.active||!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>6)return;const r=canvasEl.getBoundingClientRect();
  ptr.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(ptr,camera);
  const picks=(typeof pickables!=='undefined'?pickables:[]);const hits=ray.intersectObjects(picks,true).filter(h=>h.object.userData.info&&h.object.visible);if(!hits.length)return;
  let o=hits[0].object;while(o.parent&&!picks.includes(o))o=o.parent;pause();if(typeof show==='function')show(hits[0].object.userData.info,o)},true);
 // keyboard: space pauses / resumes the tour
 addEventListener('keydown',e=>{if(e.code!=='Space'||!tour.active||/input|textarea|select|button/i.test(e.target.tagName))return;e.preventDefault();tour.paused?resume():pause()})};
K.ui=function(){if(K.uiDone)return;K.uiDone=true;try{K.tourPick()}catch(e){console.warn('tourPick',e)}
 const $=s=>document.querySelector(s);const ctrl=$('#ctrl'),info=$('#info'),tour=$('#tour'),canvas=$('#scene');if(!canvas)return;
 const key=location.pathname.split('/').pop().replace(/\.html$/,'');const HD=window.HALL_DATA||{halls:{},factories:[]};const hall=HD.halls[key];const fac=HD.factories.find(f=>f.halls.includes(key));
 const title=(ctrl&&ctrl.querySelector('h1')||{}).textContent||document.title,eyebrow=(ctrl&&ctrl.querySelector('.eyebrow')||{}).textContent||'',sub=(ctrl&&ctrl.querySelector('.sub')||{}).textContent||'';
 const back=(ctrl&&ctrl.querySelector('a.back')||{}).getAttribute?ctrl.querySelector('a.back').getAttribute('href'):'index.html';
 const rows=hall?hall.rows:[];const na=hall?rows.filter(r=>r.kind==='na').length:+((($('#k-miss')||{}).textContent)||0);
 const main=el('main','line-page hk');
 const head=el('header','line-head');head.innerHTML=`<a class="button small" href="${esc(back)}">&#8249; Back to plant</a><h1>${esc(title)}</h1><p class="muted">${esc([eyebrow.replace(/ · live 3D$/i,''),sub].filter(Boolean).join(' · '))}</p>`;main.appendChild(head);
 const sec=el('section','factory line-card');sec.id='hk-factory';main.appendChild(sec);
 // toolbar: previous / next view, the views, whole hall, tour, legend switches, full screen
 const bar=el('div','factory-bar');sec.appendChild(bar);
 const hi=fac?fac.halls.indexOf(key):-1;const hallLink=(i,cls,lab,txt)=>{if(!fac||fac.halls.length<2)return;const k=fac.halls[(i+fac.halls.length)%fac.halls.length];const a=el('a','icon-button',txt);a.href=k+'.html';a.title=lab+': '+(HD.halls[k]?HD.halls[k].name:k);a.setAttribute('aria-label',a.title);bar.appendChild(a)};
 hallLink(hi-1,'prev','Previous hall','&#171;');
 const prev=el('button','button small','&#8249; Previous');prev.type='button';bar.appendChild(prev);
 const pick=el('select','plant-pick');pick.setAttribute('aria-label','View');bar.appendChild(pick);
 const next=el('button','button small','Next &#8250;');next.type='button';bar.appendChild(next);
 hallLink(hi+1,'next','Next hall','&#187;');
 const time=el('span','factory-time','');bar.appendChild(time);
 const lbs=[...document.querySelectorAll('#linebtns .lb')];lbs.forEach((b,i)=>{const o=document.createElement('option');o.value=b.dataset.k;const s=b.querySelector('span'),m=b.querySelector('small');o.textContent=`${i+1}. ${s?s.textContent:b.textContent}${m&&m.textContent?' · '+m.textContent:''}`;pick.appendChild(o)});
 const whole=el('button','button small','&#9635; Whole hall');whole.type='button';whole.title='Fit the whole hall in the view';bar.appendChild(whole);
 const tb=$('#tourbtn');if(tb){tb.classList.add('button','small','tour');bar.appendChild(tb)}
 const badge=el('span','badge '+(na?'red':'green'),`<span></span>${na?na+' not available':'Complete'}`);bar.appendChild(badge);
 const row=ctrl&&ctrl.querySelector('.row');if(row){row.classList.add('hk-segs');bar.appendChild(row)}
 const full=el('button','icon-button factory-full','&#x26F6;');full.type='button';full.title='Full screen';full.setAttribute('aria-label','Full screen');bar.appendChild(full);
 const warn=ctrl&&ctrl.querySelector('.warn');
 // the view: canvas, legend, machine sheet, tour strip, hint
 const view=el('div','board-view factory-view plant-view');view.id='hk-view';sec.appendChild(view);view.appendChild(canvas);
 const lg=ctrl&&ctrl.querySelector('.legend');const legend=el('ul','plant-legend');legend.setAttribute('aria-label','Legend');
 if(lg){legend.innerHTML=[...lg.querySelectorAll('span')].map(s=>{const i=s.querySelector('i');return `<li><i style="background:${i?i.style.background:'var(--green)'}"></i>${esc(s.textContent)}</li>`}).join('');lg.remove()}
 else legend.innerHTML='<li><i class="run"></i>Machine placed</li><li><i class="missing"></i>Not available</li>';
 view.appendChild(legend);
 if(info){info.classList.add('plant-card');view.appendChild(info)}
 if(tour){tour.classList.add('hk-tour');view.appendChild(tour)}
 const hint=ctrl&&ctrl.querySelector('.hint');if(hint){hint.classList.add('factory-hint');view.appendChild(hint)}
 if(warn){warn.classList.add('factory-note');sec.appendChild(warn)}
 // stats strip from the page's KPIs
 const kp=ctrl&&ctrl.querySelector('.kpis');if(kp){const dl=el('dl','factory-stats');[...kp.querySelectorAll('.kpi')].forEach(k=>{const d=el('div');const dt=el('dt',null,esc((k.querySelector('span')||{}).textContent||''));const dd=el('dd',(k.classList.contains('miss')?'is-red':''));const b=k.querySelector('b');if(b)dd.appendChild(b);d.appendChild(dt);d.appendChild(dd);dl.appendChild(d)});sec.appendChild(dl)}
 // every station of every line as chips, then the machine details table
 if(hall&&rows.length){const lines=el('div','plant-lines');const byLine=new Map();rows.forEach(r=>{const k=r.line||0;if(!byLine.has(k))byLine.set(k,[]);byLine.get(k).push(r)});
  const chip=r=>{const k=kindOf(r);const lot=(r.lot||'').split(/[,+]/)[0].trim();return `<li><button type="button" class="plant-chip ${k==='na'?'missing':k}" data-ri="${r._i}"><b>${r.line?String(r.step).padStart(2,'0'):'S'}</b><strong>${esc(r.station)}</strong><span>${k==='na'?'Not available: source separately':esc(r.name||'')}</span><small>${k==='na'?'':esc([lot,r.year].filter(Boolean).join(' · '))}</small></button></li>`};
  [...byLine.keys()].sort((a,b)=>(a||99)-(b||99)).forEach(ln=>{const rs=byLine.get(ln).slice().sort((a,b)=>(a.step||0)-(b.step||0));const nm=ln?(hall.lines[ln-1]||{}).name||('Line '+ln):'Support equipment';const miss=rs.filter(r=>r.kind==='na').length;
   const d=el('div','plant-line');d.innerHTML=`<h3>${esc(nm)}${ln&&hall.lines[ln-1]&&hall.lines[ln-1].sub?` <small>${esc(hall.lines[ln-1].sub)}</small>`:''}<span class="badge ${miss?'red':'green'}"><span></span>${miss?miss+' not available':'Complete'}</span>${ln?`<button type="button" class="button small" data-line="${ln}">Fly to line</button>`:''}</h3><ol class="plant-chips">${rs.map(chip).join('')}</ol>`;lines.appendChild(d)});
  sec.appendChild(lines);
  const cols=[['Year',r=>r.year],['Serial no.',r=>r.serial],['Key specs',r=>r.supply],['Size / weight',r=>r.weight],['Note',r=>r.note]].filter(([,f])=>rows.some(r=>f(r)));
  const det=el('div','plant-details');det.innerHTML=`<h3>Machine details</h3><div class="table-scroll"><table><thead><tr><th>Line</th><th>Step</th><th>Station</th><th>Status</th><th>Machine</th><th>Lot</th>${cols.map(([k])=>`<th>${k}</th>`).join('')}</tr></thead><tbody>${rows.slice().sort((a,b)=>(a.line||99)-(b.line||99)||(a.step||0)-(b.step||0)).map(r=>{const k=kindOf(r);return `<tr class="${k==='na'?'missing':k}" data-ri="${r._i}"><td class="nowrap">${r.line?esc((hall.lines[r.line-1]||{}).name||'Line '+r.line):'Support'}</td><td class="numeric">${r.line?r.step:'—'}</td><td class="nowrap">${esc(r.station)}</td><td><span class="badge ${KIND[k][0]}"><span></span>${KIND[k][1]}</span></td>${k==='na'?`<td colspan="${cols.length+2}">No machine in the catalogue: source separately</td>`:`<td><div class="w-m">${esc(r.name||'')}</div></td><td class="numeric">${esc(r.lot||'')}</td>${cols.map(([,f])=>`<td>${f(r)?`<div class="w-m">${esc(f(r))}</div>`:'—'}</td>`).join('')}`}</tr>`}).join('')}</tbody></table></div>`;sec.appendChild(det);
  const sel=i=>{document.querySelectorAll('[data-ri]').forEach(e=>e.classList.toggle('is-sel',+e.dataset.ri===i))};
  sec.querySelectorAll('[data-ri]').forEach(e=>e.addEventListener('click',()=>{const r=rows.find(x=>x._i===+e.dataset.ri);if(!r)return;sel(r._i);pickRow(r);view.scrollIntoView({behavior:'smooth',block:'start'})}));
  sec.querySelectorAll('[data-line]').forEach(e=>e.onclick=()=>{if(typeof tour!=='undefined'&&tour.active&&typeof stopTour==='function')stopTour();if(typeof go==='function')go('L'+e.dataset.line);view.scrollIntoView({behavior:'smooth',block:'start'})})}
 // the other halls of this plant
 if(fac){const s2=el('section','line-card plant-section');s2.setAttribute('aria-label','Halls of this plant');
  s2.innerHTML=`<header><h2>${esc(fac.name)}: all halls</h2><p class="muted">${fac.halls.length} halls in 3D · ${fac.halls.reduce((n,k)=>n+((HD.halls[k]||{}).rows||[]).length,0)} stations</p></header><div class="table-scroll"><table class="plant-table"><thead><tr><th>Hall</th><th>Lines</th><th>Stations</th><th>Not available</th><th></th></tr></thead><tbody>${fac.halls.map(k=>{const h=HD.halls[k]||{name:k,lines:[],rows:[]};const m=h.rows.filter(r=>r.kind==='na').length;return `<tr class="${k===key?'is-here':''}"><td><a class="plant-link" href="${k}.html">${esc(h.name)}</a></td><td class="numeric">${h.lines.length}</td><td class="numeric">${h.rows.length}</td><td class="${m?'is-red':''}">${m||'—'}</td><td><a class="button small" href="${k}.html">Open in 3D</a></td></tr>`}).join('')}</tbody></table></div><p class="plant-foot muted"><a class="plant-link" href="${esc(back)}">Back to the plant page</a> for the plant layout, the 2D station map, the flow and the machine list.</p>`;main.appendChild(s2)}
 document.body.insertBefore(main,document.body.firstChild);if(ctrl)ctrl.hidden=true;const tg=$('#toggle');if(tg)tg.hidden=true;
 // behaviour
 const current=()=>{const on=document.querySelector('#linebtns .lb.on');return on?on.dataset.k:'all'};
 const sync=()=>{const k=current();pick.value=k;const i=[...pick.options].findIndex(o=>o.value===k);time.textContent=`${i+1} / ${pick.options.length}`};
 const goTo=k=>{if(typeof tour!=='undefined'&&tour.active&&typeof stopTour==='function')stopTour();if(typeof go==='function')go(k);sync()};
 if(typeof window.go==='function'){const _go=window.go;window.go=function(){const r=_go.apply(this,arguments);try{sync()}catch(e){}return r}}
 pick.onchange=()=>goTo(pick.value);
 const step=d=>{const n=pick.options.length;if(!n)return;const i=[...pick.options].findIndex(o=>o.value===current());goTo(pick.options[(i+d+n)%n].value)};
 prev.onclick=()=>step(-1);next.onclick=()=>step(1);whole.onclick=()=>goTo('all');
 addEventListener('keydown',e=>{if(e.target.closest&&e.target.closest('input,select,textarea')||e.metaKey||e.ctrlKey||e.altKey)return;if(e.key==='ArrowRight')step(1);else if(e.key==='ArrowLeft')step(-1)});
 const fs=()=>document.fullscreenElement||document.webkitFullscreenElement;
 full.onclick=()=>{if(fs())(document.exitFullscreen||document.webkitExitFullscreen).call(document);else (sec.requestFullscreen||sec.webkitRequestFullscreen).call(sec)};
 const onFs=()=>{sec.classList.toggle('is-full',fs()===sec);full.title=fs()===sec?'Exit full screen':'Full screen';setTimeout(()=>dispatchEvent(new Event('resize')),50)};document.addEventListener('fullscreenchange',onFs);document.addEventListener('webkitfullscreenchange',onFs);
 sync();if(MODE)K.mode(MODE);dispatchEvent(new Event('resize'));if(typeof resize==='function')resize()};

// ---------- ?top=1: the plan view; ?shot=1: the preview photograph ----------
K.mode=function(mode){document.documentElement.classList.add('hk-'+mode);const view=document.getElementById('hk-view');if(!view)return;
 if(mode==='top'&&typeof RL!=='undefined'&&RL.bounds){const b=RL.bounds,W=b.W+1.6,D=b.D+1.6;let w=1400,h=Math.round(w*D/W);if(h>1800){w=Math.round(w*1800/h);h=1800}view.style.width=w+'px';view.style.height=h+'px';
  scene.fog=null;(typeof labels!=='undefined'?labels:[]).forEach(l=>l.visible=false);camera.fov=10;const dist=(Math.max(D,W*h/w)/2)/Math.tan(camera.fov/2*Math.PI/180)*1.02;camera.far=dist*2+100;camera.near=1;camera.updateProjectionMatrix();
  controls.enabled=false;controls.minDistance=0;controls.maxDistance=Infinity;controls.minPolarAngle=0;controls.target.set(b.cx,0,b.cz);camera.position.set(b.cx,dist,b.cz+.001);camera.up.set(0,0,-1);camera.lookAt(controls.target);
  if(typeof fly!=='undefined')fly=null;K.topSize={w,h,W:+b.W.toFixed(1),D:+b.D.toFixed(1)};if(typeof animated!=='undefined')animated.push(()=>{camera.position.set(b.cx,dist,b.cz+.001);camera.up.set(0,0,-1);camera.lookAt(controls.target)})}
 if(mode==='shot'){view.style.width='1440px';view.style.height='960px'}
 setTimeout(()=>dispatchEvent(new Event('resize')),0);setTimeout(()=>{K.ready=true},2500)};
return K})();
