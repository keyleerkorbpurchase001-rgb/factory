// hallScene.js — the three.js engine of one hall in 3D (the scene the old <hall>.html pages built by hand).
//
// createHallScene({host, layout, line, quality, labels, run, on}) appends its own canvas to `host` and builds:
//   the renderer (antialias, shadows, sRGB output, pixel ratio ≤ 2), a lit-hall environment map for reflections,
//   hemisphere + key + fill lights with the key's shadow camera fitted to the floor, fog, OrbitControls with damping;
//   the hall from hallKit.js (floor, walls on the sides the default camera does not look in from, roof, zone);
//   every station from models.js (built a few per frame so the hall shows at once and fills up), the loose props;
//   per line: yellow lane marks, LINE 0n painted on the floor, a hanging line sign, the overhead cable tray with
//   high-bay lamps, operators at a few machines and a pallet of parts at the end of the line;
//   tokens (PCBs on the SMT-style lines, blanks or totes elsewhere) that flow along each line and wait at every
//   machine for its cycle; label sprites over the stations (all / not available / off);
//   picking with a selection box, camera flights (ease-in-out, 1.2 s) between presets, and the process tour (the
//   camera follows a token along a line; a click on a machine pauses it, like hall-kit.js K.tourPick).
// The UI (Hall3D.jsx) drives it through the returned API and hears back through `on`:
//   on.progress(done, total), on.ready(), on.pick(ref | null), on.tour({active, paused, line, idx}).
// ref = {rowIndex, line, step} for a catalogue row, or {prop: name} for a loose item.
// dispose() stops the loop and frees everything (geometries, materials, textures, render targets, the GL context).
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {createHallKit} from './hallKit.js';
import {createModelContext,buildStation,buildProp} from './models.js';
import {pathAt,pad2} from './layout.js';

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const FONT='"IBM Plex Sans", system-ui, sans-serif',MONO='"IBM Plex Mono", ui-monospace, monospace';
const rr=(x,X,Y,W,H,r)=>{x.beginPath();x.moveTo(X+r,Y);x.arcTo(X+W,Y,X+W,Y+H,r);x.arcTo(X+W,Y+H,X,Y+H,r);x.arcTo(X,Y+H,X,Y,r);x.arcTo(X,Y,X+W,Y,r);x.closePath()};
const STATUS_COLOR={na:'#d2453b',shared:'#3b6fb8',sup:'#8a949e',ok:'#3fa66b',alt:'#3fa66b',bundled:'#d8a531',suggest:'#2f9fae'};
export const QUALITY={std:{shadow:1024,ratio:1.25},high:{shadow:2048,ratio:2}};

export function createHallScene({host,layout:L,line:startLine=null,quality='std',labels='miss',run:startRun=true,on={}}){
 const reduced=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
 const dark=typeof matchMedia==='function'&&matchMedia('(prefers-color-scheme: dark)').matches&&document.documentElement.dataset.theme!=='light'||document.documentElement.dataset.theme==='dark';
 let handlers=on;const emit=(k,...a)=>{try{handlers[k]&&handlers[k](...a)}catch(e){console.error(e)}};
 const own=[];const keep=o=>{own.push(o);return o};
 const F=L.floor,H=L.height,span=Math.max(L.bounds.W,L.bounds.D),cx=L.bounds.cx,cz=L.bounds.cz;

 // ---------- renderer, scene, camera, controls ----------
 const canvas=document.createElement('canvas');canvas.className='hk-canvas';canvas.setAttribute('aria-label',`3D view of the ${L.name}`);host.appendChild(canvas);
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;
 // PCFSoftShadowMap was removed in three r18x; PCFShadowMap with a shadow radius gives the soft edges now.
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
 const scene=new THREE.Scene();const bg=new THREE.Color(dark?0x2a3138:0xc9ced2);scene.background=bg;scene.fog=new THREE.Fog(bg,span*1.1+25,span*2.6+70);
 const camera=new THREE.PerspectiveCamera(42,1,.1,span*6+200);
 const controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.dampingFactor=.08;controls.maxPolarAngle=Math.PI*.49;controls.minDistance=1.5;controls.maxDistance=span*2.2+25;controls.screenSpacePanning=true;
 // reflections of a lit hall for the metal and glass
 const pmrem=new THREE.PMREMGenerator(renderer);const room=new RoomEnvironment();const envRT=pmrem.fromScene(room,.04);scene.environment=envRT.texture;scene.environmentIntensity=.42;room.traverse?.(o=>{o.geometry?.dispose();o.material?.dispose?.()});pmrem.dispose();
 // lights: sky / floor bounce, the key light through the roof (shadows over the whole floor), a cool fill from the back
 scene.add(new THREE.HemisphereLight(0xf4f7fa,0x5e6468,1.35));
 const R=Math.hypot(L.bounds.W,L.bounds.D)/2+2;const key=new THREE.DirectionalLight(0xfff8ef,2.3);const kdir=new THREE.Vector3(-.38,1,.48).normalize();
 key.position.set(cx+kdir.x*R*2,kdir.y*R*2,cz+kdir.z*R*2);key.target.position.set(cx,0,cz);key.castShadow=true;key.shadow.bias=-.0004;key.shadow.normalBias=.02;key.shadow.radius=3;
 Object.assign(key.shadow.camera,{left:-R,right:R,top:R,bottom:-R,near:.5,far:R*4+H});key.shadow.camera.updateProjectionMatrix();scene.add(key,key.target);
 const fill=new THREE.DirectionalLight(0xe6eefc,.65);fill.position.set(cx+R,R*.6,cz-R);scene.add(fill);

 // ---------- the hall ----------
 const all=L.presets.all;const hk=createHallKit(THREE);
 const hall=hk.buildHall(scene,F,{name:L.name,height:H,cam:{x:all.p[0],z:all.p[2]},zoneBox:L.zone});
 const overhead=new THREE.Group();overhead.name='overhead';scene.add(overhead);

 // ---------- small builders for the dressing (tracked for dispose) ----------
 const M=(c,m=.15,r=.6,x={})=>keep(new THREE.MeshStandardMaterial(Object.assign({color:c,metalness:m,roughness:r},x)));
 const mat={alu:M(0xc9ccce,.6,.35),steel:M(0x8f969b,.6,.4),dark:M(0x2b2d30,.3,.6),yellow:M(0xe3b82e,.05,.6),led:M(0xffffff,0,.3,{emissive:0xfff3dc,emissiveIntensity:1.5}),
  tray:M(0x9ea6ad,.4,.7),navy:M(0x1c1b18,.2,.6),coat:M(0x2c4f8a,.05,.8),trousers:M(0x2b2f36,.05,.85),skin:M(0xd9a684,.05,.7),cap:M(0xf2f1ec,.1,.5),
  wood:M(0xc9a46a,0,.8),carton:M(0xb98d5a,0,.85),wrap:M(0xe4eaec,.05,.3,{transparent:true,opacity:.82}),pcb:M(0x1f6b3a,.1,.5),pads:M(0xc9a649,.9,.35),
  tote:M(0x2c6fb8,.05,.6),part:M(0x9aa0a4,.6,.4),blank:M(0x8d949a,.75,.35,{emissive:0xff5a00,emissiveIntensity:0})};
 const box=(w,h,d,m,x,y,z,p,cast=true)=>{const o=new THREE.Mesh(keep(new THREE.BoxGeometry(w,h,d)),m);o.position.set(x,y,z);o.castShadow=cast;o.receiveShadow=true;p.add(o);return o};
 const cyl=(rt,rb,h,m,x,y,z,p,seg=14)=>{const o=new THREE.Mesh(keep(new THREE.CylinderGeometry(rt,rb,h,seg)),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;p.add(o);return o};
 const ctex=(w,h,draw)=>{const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=keep(new THREE.CanvasTexture(c));t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t};
 const floorText=(text,w,h,col)=>{const t=ctex(512,128,(x,W,Hh)=>{x.fillStyle=col;x.font=`700 86px ${FONT}`;x.textBaseline='middle';x.textAlign='center';x.fillText(text,W/2,Hh/2+4,W-12)});
  const m=new THREE.Mesh(keep(new THREE.PlaneGeometry(w,h)),keep(new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false})));m.rotation.x=-Math.PI/2;return m};
 const strip=(w,d,x,z,m,p)=>{const o=new THREE.Mesh(keep(new THREE.PlaneGeometry(w,d)),m);o.rotation.x=-Math.PI/2;o.position.set(x,.005,z);o.receiveShadow=true;p.add(o);return o};
 // Hanging line sign: dark board with an orange bar, LINE 0n and the line's subtitle on both faces, on two rods.
 function hangingSign(text,sub,scale){const g=new THREE.Group();const t=ctex(640,160,(x,W,Hh)=>{x.clearRect(0,0,W,Hh);x.fillStyle='rgba(28,27,24,.94)';rr(x,4,8,W-8,Hh-16,14);x.fill();x.fillStyle='#d9824a';x.fillRect(4,8,12,Hh-16);
   x.fillStyle='#ecebe5';x.textBaseline='middle';x.font=`600 58px ${FONT}`;x.fillText(text,40,sub?56:Hh/2,W-60);if(sub){x.fillStyle='#e8a06c';x.font=`500 30px ${FONT}`;x.fillText(sub,40,112,W-60)}});
  const m=keep(new THREE.MeshBasicMaterial({map:t,transparent:true}));for(const s of [1,-1]){const p=new THREE.Mesh(keep(new THREE.PlaneGeometry(2.4,.6)),m);p.rotation.y=s>0?0:Math.PI;p.position.z=s*.012;g.add(p)}
  box(2.38,.56,.02,mat.navy,0,0,0,g,false);g.scale.setScalar(scale);return g}
 // An operator in a blue coat and a white cap, turning a little now and then.
 const people=[];function person(x,z,ry,p){const g=new THREE.Group();cyl(.06,.06,.82,mat.trousers,-.08,.41,0,g,10);cyl(.06,.06,.82,mat.trousers,.08,.41,0,g,10);cyl(.19,.22,.66,mat.coat,0,1.15,0,g,16);
  const sh=new THREE.Mesh(keep(new THREE.SphereGeometry(.19,16,10)),mat.coat);sh.position.y=1.48;sh.scale.set(1,.45,.8);sh.castShadow=true;g.add(sh);
  for(const a of [-1,1]){const arm=cyl(.05,.05,.6,mat.coat,a*.24,1.13,.05,g,10);arm.rotation.x=-.35}cyl(.045,.05,.1,mat.skin,0,1.58,0,g,10);
  const hd=new THREE.Mesh(keep(new THREE.SphereGeometry(.11,18,14)),mat.skin);hd.position.y=1.72;hd.castShadow=true;g.add(hd);const c=new THREE.Mesh(keep(new THREE.SphereGeometry(.118,18,10,0,Math.PI*2,0,Math.PI/2)),mat.cap);c.position.y=1.74;g.add(c);
  g.position.set(x,0,z);g.rotation.y=ry;p.add(g);people.push({g,ry,ph:(x*7+z*13)%6});return g}
 // A pallet with shrink-wrapped cartons (finished parts waiting at the end of a line).
 function pallet(x,z,p){const g=new THREE.Group();for(const sz of [-.35,0,.35])box(1.2,.1,.1,mat.wood,0,.05,sz,g);box(1.2,.03,.8,mat.wood,0,.115,0,g);
  for(let i=0;i<2;i++)for(let j=0;j<2;j++)for(let k=0;k<2;k++)box(.56,.36,.38,mat.carton,-.29+i*.58,.32+k*.37,-.19+j*.39,g);box(1.18,.76,.8,mat.wrap,0,.51,0,g,false);g.position.set(x,0,z);p.add(g);return g}

 // ---------- line dressing: lanes, floor label, overhead tray and lamps, people, pallets ----------
 const dress=new THREE.Group();dress.name='line-dressing';scene.add(dress);
 const allBoxes=[...L.lines.flatMap(l=>l.stations||[]).map(s=>s.box),...L.support.map(s=>s.box),...L.props.map(p=>p.box)];
 const freeAt=(x,z,r)=>x-r>F.x0+.8&&x+r<F.x1-.8&&z-r>F.z0+.8&&z+r<F.z1-2.8&&!allBoxes.some(b=>x+r>b.x0-.2&&x-r<b.x1+.2&&z+r>b.z0-.2&&z-r<b.z1+.2);
 const lineScale=l=>clamp(Math.sqrt(l.stations.reduce((a,s)=>a+s.box.w*s.box.d,0)/l.stations.length)/1.6,1,3);
 for(const l of L.lines){if(l.empty)continue;const b=l.box,k=lineScale(l),yel=mat.yellow;
  if(l.dir.z===0){const lx0=b.x0-.8,lx1=b.x1+.8;strip(lx1-lx0,.07,(lx0+lx1)/2,b.z0-.45,yel,dress);strip(lx1-lx0,.07,(lx0+lx1)/2,b.z1+.45,yel,dress)}
  else{const lz0=b.z0-.8,lz1=b.z1+.8;strip(.07,lz1-lz0,b.x0-.45,(lz0+lz1)/2,yel,dress);strip(.07,lz1-lz0,b.x1+.45,(lz0+lz1)/2,yel,dress)}
  const ft=floorText('LINE '+pad2(l.index),2.6*Math.min(k,1.6),.65*Math.min(k,1.6),'rgba(242,194,48,.92)');ft.position.set(l.floorLabel.x,.007,l.floorLabel.z);ft.rotation.z=l.floorLabel.rot;dress.add(ft);
  // overhead: a cable tray over the back of the line and high-bay LED fixtures over its front, on rods from the roof
  const yT=H-1.15,yL=H-1.6;
  if(l.dir.z===0){const len=b.x1-b.x0+1.2,mx=(b.x0+b.x1)/2;box(len,.05,.3,mat.tray,mx,yT,b.z0-.2,overhead,false);for(const dz of [-.15,.15])box(len,.1,.02,mat.tray,mx,yT+.05,b.z0-.2+dz,overhead,false);
   const n=Math.max(2,Math.round(len/4.5));for(let i=0;i<n;i++){const x=b.x0-.6+(i+.5)*len/n;box(1.66,.06,.26,mat.alu,x,yL+.04,b.z1+.3,overhead,false);box(1.6,.03,.22,mat.led,x,yL,b.z1+.3,overhead,false);
    cyl(.006,.006,H-yL,mat.steel,x-.6,(H+yL)/2,b.z1+.3,overhead,6);cyl(.006,.006,H-yL,mat.steel,x+.6,(H+yL)/2,b.z1+.3,overhead,6);cyl(.008,.008,H-yT,mat.steel,x,(H+yT)/2,b.z0-.2,overhead,6)}}
  // operators at a third and two thirds of the line, in front of a machine that is there
  const st=l.stations.filter(s=>s.status!=='na'&&s.status!=='shared');const pick=[Math.floor(st.length/3),Math.floor(st.length*2/3)].filter((v,i,a)=>a.indexOf(v)===i&&st[v]);
  pick.forEach((i,j)=>{if((l.index+j)%2&&pick.length>1)return;const s=st[i];const pz=s.box.z1+.6,px=s.box.cx+.2;if(pz<F.z1-2.6)person(px,pz,Math.PI,dress)});
  // a pallet of parts after the last machine
  const last=l.stations[l.stations.length-1].box;const px=l.dir.x>0?last.x1+1.1:l.dir.x<0?last.x0-1.1:last.cx,pz=l.dir.z>0?last.z1+1.1:l.dir.z<0?last.z0-1.1:last.cz;if(freeAt(px,pz,.7))pallet(px,pz,dress)}

 // ---------- labels over the stations ----------
 const labels=[];const lscale=clamp(span/38,1,1.6);
 function labelSprite(lines,color){const t=ctex(640,190,(x,W,Hh)=>{x.fillStyle='rgba(28,27,24,.9)';rr(x,0,0,W,Hh,20);x.fill();x.fillStyle=color;x.fillRect(0,0,18,Hh);
   x.textBaseline='alphabetic';x.font=`600 30px ${MONO}`;x.fillStyle=color;x.fillText(lines[0],40,54,W-70);
   const fit=(s,y)=>{let v=s;while(x.measureText(v).width>574&&v.length>4)v=v.slice(0,-2);if(v!==s)v=v.trim()+'…';x.fillText(v,40,y)};
   x.fillStyle='#ecebe5';x.font=`600 44px ${FONT}`;fit(lines[1],112);x.fillStyle='#b9b7b0';x.font=`500 30px ${FONT}`;fit(lines[2]||'',160)});
  const sp=new THREE.Sprite(keep(new THREE.SpriteMaterial({map:t,transparent:true,depthWrite:false})));sp.scale.set(1.7*lscale,.5*lscale,1);sp.renderOrder=10;return sp}
 const applyLabels=()=>labels.forEach(l=>l.visible=!tour.active&&(labelMode==='all'||(labelMode==='miss'&&l.userData.missing)));

 // ---------- stations: built a few per frame ----------
 const ctx=createModelContext(THREE,{hallH:H});const picks=[];const updates=[];const byRow=new Map();const lineTop=new Map();
 const jobs=[];for(const l of L.lines)for(const s of (l.stations||[]))jobs.push({s,line:l.index});for(const s of L.support)jobs.push({s,line:0});for(const p of L.props)jobs.push({p});
 let built=0,ready=false;
 function buildJob(j){
  if(j.p){const b=j.p.box;const u=buildProp(j.p.name,{x:b.cx,z:b.cz,w:b.w,d:b.d,h:b.h},ctx);const ref={prop:j.p.name};u.group.userData.ref=ref;scene.add(u.group);picks.push(u.group);if(u.update)updates.push(u.update);return}
  const {s}=j,b=s.box,row=s.row;let u;try{u=buildStation(row,{x:b.cx,z:b.cz,w:b.w,d:b.d,h:b.h},ctx)}catch(e){console.warn('station',row.station,e);return}
  const ref={rowIndex:s.rowIndex,line:j.line,step:s.step};u.group.userData.ref=ref;scene.add(u.group);picks.push(u.group);byRow.set(s.rowIndex,u.group);if(u.update)updates.push(u.update);
  if(j.line)lineTop.set(j.line,Math.max(lineTop.get(j.line)||0,u.height||1.5));
  const na=row.kind==='na',sh=row.kind==='shared';const lot=String(row.lot||'').split(/[,+]/)[0].trim();
  const lb=labelSprite(na?['NOT AVAILABLE',row.station,'No machine in the catalogue']:[[j.line?`L${j.line} · ${pad2(s.step)}`:'SUPPORT',lot].filter(Boolean).join(' · '),row.station,(row.name||'')+(row.year?' · '+row.year:'')],STATUS_COLOR[na?'na':sh?'shared':j.line?row.kind:'sup']||'#3fa66b');
  lb.position.set(b.cx,(u.height||1.5)+.45*lscale,b.cz);lb.userData.missing=na;lb.userData.ref=ref;scene.add(lb);labels.push(lb)}
 function finish(){
  // hanging line signs, clear of the tallest machine of the line and under the roof
  for(const l of L.lines){if(l.empty)continue;const k=Math.min(lineScale(l),1.8);const y=clamp((lineTop.get(l.index)||2)+.9,3.4,H-1.1);const sg=hangingSign('LINE '+pad2(l.index),l.sub||l.name,k);sg.position.set(l.sign.x,y,l.sign.z);if(l.dir.z!==0)sg.rotation.y=Math.PI/2;dress.add(sg);
   for(const sx of [-1,1])cyl(.008,.008,Math.max(.1,H-y-.3*k),mat.steel,l.sign.x+(l.dir.z===0?sx*k:0),y+.3*k+(H-y-.3*k)/2,l.sign.z+(l.dir.z!==0?sx*k:0),overhead,6)}
  applyLabels();ready=true;emit('ready')}

 // ---------- tokens: boards / parts flowing along the lines ----------
 const tokens=[];const SPEED=L.key==='phs'?1.3:L.key==='smt'||L.key==='led'?.55:.8;
 for(const l of L.lines){if(l.empty||l.stations.length<2||!l.length)continue;
  l.stops=l.stations.filter(s=>s.status!=='na'&&s.status!=='shared').map(s=>({s:s.s,dwell:reduced?.6:(l.board?1.4:2)+(s.box.w>4?1:0)})).sort((a,b)=>a.s-b.s);
  const n=clamp(Math.round(l.length/(l.board?4.5:7)),2,6);
  for(let i=0;i<n;i++){const g=new THREE.Group();let glow=null;
   if(l.board){box(.32,.016,.24,mat.pcb,0,0,0,g,false);const p=box(.26,.004,.18,mat.pads,0,.01,0,g,false);p.visible=false;g.userData.pads=p}
   else if(L.key==='phs'){const m=mat.blank.clone();keep(m);glow=m;box(1.4,.04,.9,m,0,0,0,g,true)}
   else{box(.5,.04,.36,mat.tote,0,-.1,0,g,true);for(const [w,d,x,z] of [[.5,.02,0,.17],[.5,.02,0,-.17],[.02,.36,.24,0],[.02,.36,-.24,0]])box(w,.2,d,mat.tote,x,0,z,g,true);box(.3,.08,.2,mat.part,0,-.04,0,g,true)}
   g.position.y=l.tokenY;scene.add(g);tokens.push({l,g,glow,s:i*l.length/n,next:0,wait:0,wrapped:false})}
  // place each token's next stop after its start
  tokens.filter(o=>o.l===l).forEach(o=>{o.next=l.stops.findIndex(st=>st.s>o.s);if(o.next<0)o.next=l.stops.length})}
 function placeToken(o){const p=pathAt(o.l,o.s);o.g.position.x=p.x;o.g.position.z=p.z;o.g.rotation.y=Math.atan2(-p.dz,p.dx);
  if(o.g.userData.pads){const i=o.l.stations.findIndex(s=>/paste|print/i.test(s.row.station));o.g.userData.pads.visible=i>=0&&o.s>o.l.stations[i].s}
  if(o.glow){const f=o.l.stations.findIndex(s=>/furnace/i.test(s.row.station)),pr=o.l.stations.findIndex(s=>/press|forming/i.test(s.row.station)&&!/furnace/i.test(s.row.station));const hot=f>=0&&o.s>o.l.stations[f].s&&(pr<0||o.s<o.l.stations[pr].s+1);o.glow.emissiveIntensity=hot?.9:0}}
 function stepTokens(dt){const byLine=new Map();tokens.forEach(o=>{if(!byLine.has(o.l))byLine.set(o.l,[]);byLine.get(o.l).push(o)});
  for(const [l,arr] of byLine){arr.sort((a,b)=>a.s-b.s);arr.forEach((o,i)=>{const ahead=arr[(i+1)%arr.length];const gap=((ahead.s-o.s)+l.length)%l.length;
   if(o.wait>0){o.wait-=dt;return}if(arr.length>1&&gap<(l.board?.5:1.2)&&gap>0)return;const prev=o.s;o.s+=SPEED*dt;
   const st=l.stops[o.next];if(st&&prev<st.s&&o.s>=st.s){o.s=st.s;o.wait=st.dwell;o.next++}
   if(o.s>=l.length){o.s-=l.length;o.next=0;o.wrapped=true}})}
  tokens.forEach(placeToken)}
 tokens.forEach(placeToken);

 // ---------- camera flights and presets ----------
 const walls=hall.walls;let fly=null;
 const inside=p=>[clamp(p[0],walls.x0+.4,walls.x1-.4),Math.max(.6,p[1]),clamp(p[2],walls.z0+.4,walls.z1-.4)];
 function flyTo(p,t,instant=false){if(instant||reduced){camera.position.set(...p);controls.target.set(...t);controls.update();fly=null;return}
  fly={from:camera.position.clone(),to:new THREE.Vector3(...p),tf:controls.target.clone(),tt:new THREE.Vector3(...t),t:0}}
 const presetOf=n=>{const l=n&&L.lines[n-1];return l&&l.preset?{p:inside(l.preset.p),t:l.preset.t}:all};
 let curLine=null;
 function showLine(n,instant=false){if(tour.active)stopTour(false);curLine=n&&L.lines[n-1]&&!L.lines[n-1].empty?n:null;const pr=presetOf(curLine);flyTo(pr.p,pr.t,instant)}
 function flyToObject(g){const bb=new THREE.Box3().setFromObject(g);if(bb.isEmpty())return;const sz=bb.getSize(new THREE.Vector3()),ce=bb.getCenter(new THREE.Vector3());
  const t=[ce.x,Math.min(ce.y,1.2),ce.z],d=Math.max(5,sz.x*1.6,sz.z*1.6,sz.y*2.2),dir=new THREE.Vector3(.05,.55,.84).normalize().multiplyScalar(d);flyTo(inside([t[0]+dir.x,t[1]+dir.y,t[2]+dir.z]),t)}

 // ---------- selection ----------
 const selBox=new THREE.Box3Helper(new THREE.Box3(),0x2f8fe0);selBox.visible=false;scene.add(selBox);
 function select(rowIndex){const g=rowIndex==null?null:byRow.get(rowIndex);if(!g){selBox.visible=false;return null}selBox.box.setFromObject(g);selBox.visible=true;return g}

 // ---------- process tour ----------
 const tour={active:false,paused:false,line:null,token:null,last:-1,runBefore:true};
 let run=startRun&&!reduced,labelMode=labels;
 const tourState=()=>({active:tour.active,paused:tour.paused,line:tour.line,idx:tour.last});
 function startTour(n){const l=L.lines[(n||curLine||0)-1];if(!l||l.empty)return false;const cand=tokens.filter(o=>o.l===l).sort((a,b)=>a.s-b.s)[0];if(!cand)return false;
  cand.s=0;cand.next=0;cand.wait=0;cand.wrapped=false;Object.assign(tour,{active:true,paused:false,line:l.index,token:cand,last:-1,runBefore:run});curLine=l.index;run=true;fly=null;
  controls.enabled=false;selBox.visible=false;applyLabels();emit('tour',tourState());return true}
 function stopTour(back=true){if(!tour.active)return;tour.active=false;tour.paused=false;run=tour.runBefore;controls.enabled=true;applyLabels();emit('tour',tourState());if(back){const pr=presetOf(tour.line);flyTo(pr.p,pr.t)}}
 function pauseTour(){if(!tour.active||tour.paused)return;tour.paused=true;run=false;controls.enabled=true;emit('tour',tourState())}
 function resumeTour(){if(!tour.active||!tour.paused)return;tour.paused=false;run=true;controls.enabled=false;selBox.visible=false;emit('tour',tourState())}
 const tw=new THREE.Vector3(),tt=new THREE.Vector3();
 function updateTour(){if(tour.paused){controls.update();return}const o=tour.token,l=o.l,k=lineScale(l);const p=pathAt(l,o.s);const dx=l.dir.x,dz=l.dir.z;
  tw.set(p.x-dx*2*k+l.front.x*3.6*k,2.05*k,p.z-dz*2*k+l.front.z*3.6*k);camera.position.lerp(tw,.06);tt.set(p.x+dx*.5*k,1*Math.min(k,1.6),p.z+dz*.5*k);controls.target.lerp(tt,.08);camera.lookAt(controls.target);
  let idx=l.stations.findIndex(s=>o.s>=s.s0-.3&&o.s<=s.s1+.25);if(idx<0){idx=l.stations.findIndex(s=>o.s<s.s0)-1;if(idx<-1)idx=l.stations.length-1;idx=Math.max(0,idx)}
  if(idx!==tour.last){tour.last=idx;emit('tour',tourState())}
  if(o.wrapped&&tour.last>=0)stopTour()}

 // ---------- picking ----------
 const ray=new THREE.Raycaster(),ptr=new THREE.Vector2();let down=null;
 const refOf=o=>{while(o){if(o.userData&&o.userData.ref)return o.userData.ref;o=o.parent}return null};
 const onDown=e=>{down=[e.clientX,e.clientY]};
 const onUp=e=>{if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>6)return;down=null;const r=canvas.getBoundingClientRect();
  ptr.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(ptr,camera);
  const hits=ray.intersectObjects([...picks,...labels.filter(l=>l.visible)],true).filter(h=>h.object.visible&&!(h.object.isLineSegments)&&refOf(h.object));if(!hits.length)return;
  const ref=refOf(hits[0].object);if(tour.active&&!tour.paused)pauseTour();
  if(ref.rowIndex!=null)select(ref.rowIndex);else{let o=hits[0].object;while(o&&!picks.includes(o))o=o.parent;if(o){selBox.box.setFromObject(o);selBox.visible=true}}
  emit('pick',ref)};
 canvas.addEventListener('pointerdown',onDown);canvas.addEventListener('pointerup',onUp);

 // ---------- size, quality ----------
 let q=QUALITY[quality]?quality:'std';
 function applyQuality(){const Q=QUALITY[q];renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,Q.ratio));key.shadow.mapSize.set(Q.shadow,Q.shadow);if(key.shadow.map){key.shadow.map.dispose();key.shadow.map=null}resize()}
 function resize(){const w=host.clientWidth||640,h=host.clientHeight||480;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
 const ro=typeof ResizeObserver==='function'?new ResizeObserver(resize):null;if(ro)ro.observe(host);else window.addEventListener('resize',resize);
 applyQuality();

 // ---------- start ----------
 curLine=startLine&&L.lines[startLine-1]&&!L.lines[startLine-1].empty?startLine:null;{const pr=presetOf(curLine);flyTo(pr.p,pr.t,true)}
 let raf=0,last=performance.now(),t=0,dead=false;const roofAbove=()=>camera.position.y>H-.6;
 function loop(now){if(dead)return;raf=requestAnimationFrame(loop);const dt=Math.min(.05,(now-last)/1000);last=now;t+=dt;
  // build a few stations per frame (about 14 ms of work), so the hall shows at once and fills up
  if(built<jobs.length){const t0=performance.now();while(built<jobs.length&&performance.now()-t0<14)buildJob(jobs[built++]);emit('progress',built,jobs.length);if(built>=jobs.length)finish()}
  if(fly&&!tour.active){fly.t=Math.min(1,fly.t+dt/1.2);const e=fly.t<.5?2*fly.t*fly.t:1-Math.pow(-2*fly.t+2,2)/2;camera.position.lerpVectors(fly.from,fly.to,e);controls.target.lerpVectors(fly.tf,fly.tt,e);if(fly.t>=1)fly=null}
  if(run)stepTokens(dt);
  for(const f of updates){try{f(t,run)}catch(e){}}
  for(const p of people)p.g.rotation.y=p.ry+(reduced?0:Math.sin(t*.5+p.ph)*.25);
  if(tour.active)updateTour();else controls.update();
  // the camera stays inside the walls that were built
  const cp=camera.position;if(hall.sides.left&&cp.x<walls.x0)cp.x=walls.x0;if(hall.sides.right&&cp.x>walls.x1)cp.x=walls.x1;if(hall.sides.back&&cp.z<walls.z0)cp.z=walls.z0;if(hall.sides.front&&cp.z>walls.z1)cp.z=walls.z1;if(cp.y<.4)cp.y=.4;
  const above=roofAbove();hall.roof.visible=!above;overhead.visible=!above;
  renderer.render(scene,camera)}
 raf=requestAnimationFrame(loop);

 return {
  get ready(){return ready},get line(){return curLine},
  setHandlers(h){handlers=h||{}},
  showLine,flyHome:()=>showLine(null),
  flyToRow(rowIndex){const g=select(rowIndex);if(g)flyToObject(g);return !!g},
  select,
  setLabels(m){labelMode=m;applyLabels()},
  setRun(v){run=!!v;if(tour.active&&tour.paused&&v)resumeTour()},
  setQuality(v){q=QUALITY[v]?v:'std';applyQuality()},
  startTour,stopTour,pauseTour,resumeTour,tourState,
  resize,
  // for tests and screenshots
  debug:()=>({stations:picks.length,tokens:tokens.length,labels:labels.length,built,jobs:jobs.length,sides:hall.sides,calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures}),
  dispose(){dead=true;cancelAnimationFrame(raf);canvas.removeEventListener('pointerdown',onDown);canvas.removeEventListener('pointerup',onUp);if(ro)ro.disconnect();else window.removeEventListener('resize',resize);
   controls.dispose();try{ctx.dispose()}catch(e){}try{hk.dispose()}catch(e){}for(const o of own)o.dispose?.();own.length=0;selBox.geometry.dispose();selBox.material.dispose();
   envRT.dispose();if(key.shadow.map)key.shadow.map.dispose();renderer.dispose();renderer.forceContextLoss();canvas.remove()}}
}
