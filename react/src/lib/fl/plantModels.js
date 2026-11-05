// Plant-view models (scene units = metres). The SMT machines are the line view's own housings from
// factoryModels.js; every other machine in the auction list gets a compact model here: LED module
// process machines and testers, curing oven, autoclave, two-platen injection presses with their take-out
// robot, resin dryers, TV test benches, CNC depaneling, programming handlers, robot arms and the mobile
// robot. Plus the red ghost that holds a missing machine's place, spare machines wrapped on pallets,
// line labels, the zone round the machines with the factory's name on the floor, and the hall with its white,
// detailed walls (columns, windows, doors, services, fire points, signs).
// machine() and ghost() return {group, height, lamps, update(t, busy, clock)}; lamps = [green, amber, red]; a ghost
// also returns its name tag.
import {createLineModels,LINE_LAYOUT} from './factoryModels.js';

const SMT={loader:'loader',unloader:'loader',marker:'marker',cleaner:'cleaner',printer:'printer',spi:'spi',pnp:'pnp',reflow:'reflow',aoi:'aoi',buffer:'buffer'};
const ACCENTS=[0x2c4f8a,0x2d7a4c,0xd9824a,0x6a4f8a,0x2f7f86,0xb3261e,0x8a6a2c];
const hash=s=>[...s].reduce((h,c)=>(h*31+c.charCodeAt(0))>>>0,7);
export function createPlantModels(THREE){
 const line=createLineModels(THREE),C=line.materials,{cy:CY,depth:DEPTH}=LINE_LAYOUT;
 const owned=[];const keep=x=>{owned.push(x);return x};
 const mat=(color,metalness=.15,roughness=.6,extra={})=>keep(new THREE.MeshStandardMaterial({color,metalness,roughness,...extra}));
 const add=(m,x,y,z,parent)=>{m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;parent.add(m);return m};
 const box=(w,h,d,material,x,y,z,parent)=>add(new THREE.Mesh(keep(new THREE.BoxGeometry(w,h,d)),material),x,y,z,parent);
 const cyl=(r,h,material,x,y,z,parent,axis='y',seg=20)=>{const g=keep(new THREE.CylinderGeometry(r,r,h,seg));if(axis==='x')g.rotateZ(Math.PI/2);if(axis==='z')g.rotateX(Math.PI/2);return add(new THREE.Mesh(g,material),x,y,z,parent)};
 const canvasTex=(w,h,draw)=>{if(typeof document==='undefined')return null;const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=keep(new THREE.CanvasTexture(c));t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return {t,c}};
 const M={glow:mat(0x16191b,.2,.4,{emissive:0x5a87b0,emissiveIntensity:.55}),wrap:mat(0xe4eaec,.05,.3,{transparent:true,opacity:.88}),pallet:mat(0xb8915e,.05,.85),
  kuka:mat(0xe8772e,.25,.45),fanuc:mat(0xe9c12f,.25,.45),white:mat(0xeeede8,.15,.5),press:mat(0xdedbd3,.2,.55),pressDark:mat(0x4b5560,.4,.5),mould:mat(0x8b9196,.7,.35)};
 const accent=type=>{const c=ACCENTS[hash(type)%ACCENTS.length];return M['a'+c]||(M['a'+c]=mat(c,.15,.5))};

 // Signal tower (as in the line view): base, pole, green / amber / red segments and a white cap.
 function tower(parent,x,y,z){const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);cyl(.035,.04,C.dark,0,.02,0,g);cyl(.012,.22,C.steel,0,.15,0,g);
  const lamps=[0x3fa66b,0xd8a531,0xd2453b].map((c,i)=>cyl(.042,.07,mat(0x55575a,.1,.4,{emissive:c,emissiveIntensity:0,transparent:true,opacity:.95}),0,.3+i*.075,0,g));cyl(.044,.02,mat(0xf2f1ec,.1,.4),0,.53,0,g);return lamps}
 // Base cabinet on levelling feet with a kick plate; hood with a glass front; operator screen.
 function cabinet(g,w,d,top,material=C.frame){box(w,top-.1,d,material,0,(top-.1)/2+.1,0,g);box(w-.06,.08,d-.06,C.kick,0,.05,0,g);for(const sx of [-1,1])for(const sz of [-1,1])cyl(.03,.06,C.steel,sx*(w/2-.1),.03,sz*(d/2-.1),g)}
 function hood(g,w,d,y0,h){box(w,.04,d,C.panel,0,y0+h,0,g);box(w,h,.04,C.panel,0,y0+h/2,-d/2+.02,g);for(const sx of [-1,1])box(.04,h,d,C.panel,sx*(w/2-.02),y0+h/2,0,g);
  box(w-.1,h-.08,.012,C.glass,0,y0+h/2,d/2-.02,g).castShadow=false;box(w,.05,.03,C.dark,0,y0+.025,d/2-.015,g)}
 function screen(g,x,y,z){box(.32,.21,.03,C.screenBack,x,y,z,g);box(.28,.17,.004,M.glow,x,y,z+.017,g)}
 const legs=(g,w,d,h,material=C.steel)=>{for(const sx of [-1,1])for(const sz of [-1,1])box(.04,h,.04,material,sx*(w/2-.04),h/2,sz*(d/2-.04),g)};

 // An SMT machine's operator screen shows its catalogue details: what it is, lot, year, weight and power. The bar
 // on top is green when the line runs, amber when it waits for a missing machine.
 const plate=(screen,s,runs)=>screen.paint((x,W,H)=>{const i=s.info||{};x.fillStyle='#16191b';x.fillRect(0,0,W,H);x.fillStyle=runs?'#3fa66b':'#d8a531';x.fillRect(0,0,W,14);
  x.fillStyle='#ecebe5';x.font='600 40px "IBM Plex Sans", system-ui, sans-serif';x.textBaseline='top';x.fillText(s.type,24,30,W-48);x.font='500 28px "IBM Plex Mono", ui-monospace, monospace';
  [['Lot',s.lot+(s.unit?` ${s.unit}`:'')],['Year',s.year||'—'],['Weight',i.weight||'—'],['Power',i.power||'—']].forEach(([k,v],n)=>{x.fillStyle='#b9b7b0';x.fillText(k,24,98+n*54);x.fillStyle='#ecebe5';x.fillText(String(v),170,98+n*54,W-194)})});
 function machine(kind,s,runs=false){
  const id=SMT[kind];
  if(id){const m=line.machine(id,{x:s.x,w:s.w-.08,d:DEPTH,cy:CY,roof:false});m.group.position.z=s.z;if(kind==='unloader')m.setRemaining(0);
   plate(m.screen,s,runs);
   return {...m,height:id==='loader'?CY+1.3:CY+.75}}
  const g=new THREE.Group();g.position.set(s.x,0,s.z);const moving=[],w=s.w,d=s.d;let lamps=null,height=1.5;
  if(kind==='process'||kind==='tester'||kind==='programmer'){
   // LED module process machine / tester / programming handler: cabinet, glass hood, an XY head over the work table.
   const top=.86,hh=kind==='tester'?.48:kind==='programmer'?.42:.6,a=accent(s.type);cabinet(g,w,d,top);hood(g,w,d,top,hh);box(w,.05,.03,a,0,top+hh-.03,d/2-.01,g);height=top+hh+.6;
   box(w*.6,.04,d*.5,C.alu,0,top+.04,0,g);
   if(kind==='programmer')for(let i=0;i<3;i++)for(let k=0;k<4;k++)box(.22,.025,.16,k%2?C.dark:C.reelB,-w/2+.3+i*.3,top+.08+k*.03,-.1,g);
   if(kind==='tester')for(let i=0;i<4;i++)box(.1,.12,.18,C.dark,-w/2+.3+i*.2,top+.12,d/2-.3,g);
   const beam=new THREE.Group();g.add(beam);box(w-.3,.06,.07,C.dark,0,top+hh-.12,0,beam);const head=new THREE.Group();beam.add(head);box(.14,.16,.14,a,0,top+hh-.24,0,head);cyl(.012,.12,C.steel,0,top+hh-.37,0,head);
   moving.push((t,busy)=>{beam.position.z=busy?.25*Math.sin(t*.9):-.25;head.position.x=busy?(w/2-.35)*Math.sin(t*1.3):0});
   screen(g,w/2-.3,top+.3,d/2+.04);lamps=tower(g,w/2-.12,top+hh,-d/2+.15);
  }else if(kind==='oven'){
   // Curing oven: insulated chamber with three doors, a heated window in each, exhaust stack, control panel.
   const h=1.75;cabinet(g,w,d,h);box(w,.06,d+.01,C.copper,0,h-.1,0,g);const heat=mat(0x301205,0,1,{emissive:0xff6a2a,emissiveIntensity:.25});
   for(let i=0;i<3;i++){const x=-w/2+(i+.5)*w/3.4;box(w/3.6,h-.4,.01,C.panel,x,h/2,d/2+.006,g);box(.25,.14,.012,heat,x,h*.68,d/2+.012,g);box(.03,.3,.03,C.steel,x+w/8,h*.5,d/2+.025,g)}
   box(w*.12,h-.3,.02,C.dark,w/2-w*.08,h/2,d/2+.01,g);screen(g,w/2-w*.08,h*.62,d/2+.04);cyl(.09,.6,C.steel,-w*.3,h+.3,-d*.2,g);height=h+.6;
   lamps=tower(g,w/2-.15,h,-d/2+.15);moving.push((t,busy,clock)=>{heat.emissiveIntensity=busy?.9+.1*Math.sin(clock*2):.25});
  }else if(kind==='autoclave'){
   // Autoclave: a horizontal pressure vessel on two saddles, a domed end, the door ring, a gauge and its control cabinet.
   const r=.52,L=w-.75,vy=.35+r;for(const sx of [-.32,.32])box(.18,.42,.8,C.dark,-.2+sx*L,.21,0,g);cyl(r,L,C.steel,-.2,vy,0,g,'x',28);
   const dome=add(new THREE.Mesh(keep(new THREE.SphereGeometry(r,24,12,0,Math.PI*2,0,Math.PI/2)),C.steel),-.2-L/2,vy,0,g);dome.rotation.z=Math.PI/2;dome.scale.y=.3;
   const ring=add(new THREE.Mesh(keep(new THREE.TorusGeometry(r+.02,.06,10,28)),C.dark),-.2+L/2,vy,0,g);ring.rotation.y=Math.PI/2;cyl(r-.02,.08,C.alu,-.15+L/2,vy,0,g,'x',28);
   cyl(.07,.04,C.frame,-.2,vy+r+.02,0,g);box(.45,1.4,.5,C.frame,w/2-.25,.7,-d/2+.35,g);screen(g,w/2-.25,1.05,-d/2+.62);lamps=tower(g,w/2-.25,1.4,-d/2+.35);height=1.9;
  }else if(kind==='press'){
   // Two-platen injection moulding machine: machine bed; clamp side with the fixed and moving platens on four
   // tie bars, mould halves and a guard; injection unit with barrel, heater bands and the hopper; the Yudo
   // take-out robot on the fixed platen; control panel and tower.
   const bedH=.8,ph=1.95,py=bedH+ph/2,fx=-.6;box(w,bedH,1.7,M.press,0,bedH/2,0,g);box(w,.06,1.72,C.dark,0,bedH-.03,0,g);box(w-.2,.1,1.6,C.kick,0,.05,0,g);
   box(.5,ph,2.1,M.pressDark,fx,py,0,g);box(.45,ph-.25,1.9,M.pressDark,-w/2+.5,py,0,g);
   for(const y of [py-.68,py+.68])for(const z of [-.72,.72])cyl(.075,w/2-.5+fx,C.steel,(-w/2+.5+fx)/2,y,z,g,'x');
   const platen=new THREE.Group();g.add(platen);box(.42,ph-.1,2,M.pressDark,0,py,0,platen);box(.4,1.1,1.1,M.mould,.41,py,0,platen);box(.4,1.1,1.1,M.mould,fx-.45,py,0,g);
   box(3.3,1.6,.02,C.glass,-w/2+2.3,bedH+.85,1.12,g).castShadow=false;box(3.3,.05,.05,C.dark,-w/2+2.3,bedH+1.66,1.12,g);
   box(3.6,.45,.9,C.dark,2.4,bedH+.23,0,g);cyl(.13,3.9,C.steel,1.7,bedH+.75,0,g,'x');for(let i=0;i<6;i++)cyl(.155,.14,C.copper,.3+i*.38,bedH+.75,0,g,'x');
   cyl(.22,.5,C.steel,3.25,bedH+1.22,0,g);add(new THREE.Mesh(keep(new THREE.ConeGeometry(.22,.3,20)),C.steel),3.25,bedH+.84,0,g).rotation.x=Math.PI;box(.7,.9,1.2,M.press,w/2-.4,bedH+.45,0,g);
   // Take-out robot: a carriage on a rail across the press; its arm (with the gripper) travels raised and only
   // dips into the parting line while the mould is open.
   const top=bedH+ph,rx=-1.47;box(fx-rx-.1,.12,.3,C.alu,(rx+fx)/2,top+.06,0,g);box(.24,.2,2.9,C.alu,rx,top+.1,.2,g);const car=new THREE.Group();g.add(car);box(.3,.24,.3,C.yellow,rx,top+.26,0,car);
   const lift=new THREE.Group();lift.position.y=.9;car.add(lift);box(.1,1.3,.1,C.alu,rx,top-.4,0,lift);box(.24,.06,.36,C.dark,rx,top-1.05,0,lift);
   box(.5,1.35,.35,M.press,1.2,.68,1.25,g);screen(g,1.2,1.5,1.45);lamps=tower(g,w/2-.4,bedH+.9,-.4);height=top+.5;
   moving.push((t,busy)=>{const c=busy?(t*.25)%1:0,open=c<.35?c/.35:c<.6?1:c<.85?1-(c-.6)/.25:0;platen.position.x=fx-1.25-open*.45;
    car.position.z=busy?(c<.3?1.25*(1-c/.3):c<.6?0:1.25*(c-.6)/.4):1.25;lift.position.y=busy&&c>.35&&c<.6?.9-1.15*Math.sin((c-.35)/.25*Math.PI):.9});
  }else if(kind==='dryer'){
   // Resin dryer: a hopper with a cone bottom on a frame, its control box beside it.
   legs(g,.7,.7,1);box(.75,.04,.75,C.steel,0,1,0,g);cyl(.36,.9,M.white,0,1.47,0,g);add(new THREE.Mesh(keep(new THREE.ConeGeometry(.36,.35,20)),M.white),0,.82,0,g).rotation.x=Math.PI;cyl(.38,.06,C.dark,0,1.95,0,g);
   box(.42,.7,.32,C.frame,.58,.35+.12,.1,g);screen(g,.58,.62,.27);lamps=tower(g,.58,.82,.1);height=2.1;
  }else if(kind==='colour'||kind==='signal'||kind==='safety'){
   // TV test bench: a cart with the instrument on it. The colour analyzer's probe faces a TV panel that
   // steps through its white-balance patterns.
   const top=.82;legs(g,w,d,top);box(w,.04,d,C.dark,0,top,0,g);box(w-.1,.03,d-.1,C.steel,0,.25,0,g);height=1.4;
   if(kind==='colour'){box(.06,1.1,.06,C.steel,0,top+.55,-d/2+.12,g);box(1.05,.62,.05,C.screenBack,0,top+1.05,-d/2+.12,g);const face=mat(0xffffff,0,.4,{emissive:0xffffff,emissiveIntensity:.7});box(.99,.56,.005,face,0,top+1.05,-d/2+.148,g);
    box(.3,.12,.28,C.frame,-.3,top+.08,.2,g);box(.03,.42,.03,C.steel,0,top+.21,-.05,g);cyl(.035,.2,C.dark,0,top+.45,-.15,g,'z');height=top+1.4;
    const pattern=[0xffffff,0xff3b30,0x34c759,0x2f6fd8,0x7d7d7d];moving.push((t,busy)=>{face.emissive.setHex(busy?pattern[Math.floor(t*.6)%pattern.length]:0x2a2c2e)})}
   else if(kind==='signal')for(let k=0;k<3;k++){box(.7,.16,.45,k%2?C.frame:C.screenBack,0,top+.1+k*.17,0,g);box(.18,.05,.005,M.glow,-.18,top+.1+k*.17,.226,g);for(let i=0;i<4;i++)cyl(.012,.01,C.steel,.08+i*.06,top+.1+k*.17,.226,g,'z')}
   else{box(.48,.22,.38,C.frame,0,top+.13,0,g);box(.44,.16,.005,C.dark,0,top+.13,.191,g);box(.14,.05,.004,M.glow,-.1,top+.15,.194,g);cyl(.018,.02,C.red,.1,top+.13,.196,g,'z');cyl(.018,.02,C.dark,.16,top+.13,.196,g,'z')}
   lamps=tower(g,w/2-.1,top,-d/2+.1);
  }else if(kind==='cnc'){
   // CNC depaneling centre: enclosure with a glass door over the spindle, control panel, chiller beside it.
   const ew=w-.55,h=1.95,ex=-.27;box(ew,h,d-.3,C.frame,ex,h/2,-.1,g);box(ew-.05,.08,d-.35,C.kick,ex,.04,-.1,g);box(ew*.55,.75,.02,C.glass,ex-.1,1.25,d/2-.24,g).castShadow=false;box(ew*.6,.05,.03,C.dark,ex-.1,.86,d/2-.24,g);
   const spindle=cyl(.06,.4,C.steel,ex-.1,1.35,d/2-.6,g);box(.4,.75,.14,C.dark,ex+ew/2-.22,1.2,d/2-.2,g);screen(g,ex+ew/2-.22,1.38,d/2-.12);
   box(.45,1.05,.6,M.white,w/2-.23,.53,-.3,g);cyl(.12,.03,C.dark,w/2-.23,1.06,-.3,g);lamps=tower(g,ex+ew/2-.12,h,-d/2+.3);height=h+.6;
   moving.push((t,busy)=>{spindle.position.x=ex-.1+(busy?.35*Math.sin(t*.8):0);spindle.position.y=busy?1.3+.04*Math.sin(t*3):1.42})
  }else if(kind==='robot'){
   // Robot arm on its pedestal: KUKA orange or FANUC yellow, sized by payload; SCARA arms get two
   // horizontal links. Yellow floor marks show the cell, the controller cabinet stands in its corner.
   const p=s.payload||10,k=p>=100?1.45:p>=30?1.1:p>=10?.8:.55,paint=/fanuc/i.test(s.name)?M.fanuc:M.kuka,mark=mat(0xe3b82e,.05,.6);
   for(const [x,z,lw,ld] of [[0,-w/2+.04,w,.08],[0,w/2-.04,w,.08],[-w/2+.04,0,.08,w],[w/2-.04,0,.08,w]]){const m=new THREE.Mesh(keep(new THREE.PlaneGeometry(lw,ld)),mark);m.rotation.x=-Math.PI/2;m.position.set(x,.004,z);m.receiveShadow=true;g.add(m)}
   box(.75*k,.2,.75*k,C.dark,0,.1,0,g);box(.45,.85,.4,C.frame,w/2-.35,.43,-w/2+.32,g);screen(g,w/2-.35,.7,-w/2+.53);lamps=tower(g,w/2-.35,.86,-w/2+.32);
   const turret=new THREE.Group();turret.position.y=.2;g.add(turret);
   if(/scara/i.test(s.name)){cyl(.14,.75,paint,0,.38,0,turret);const l1=new THREE.Group();l1.position.y=.75;turret.add(l1);box(.5,.12,.16,paint,.25,0,0,l1);const l2=new THREE.Group();l2.position.x=.5;l1.add(l2);box(.4,.1,.14,paint,.2,.02,0,l2);cyl(.02,.4,C.steel,.38,-.1,0,l2);height=1.2;
    moving.push((t,busy)=>{const a=busy?t:0;turret.rotation.y=busy?.8*Math.sin(a*.6):0;l2.rotation.y=busy?1.2*Math.sin(a*.9+1):.6})}
   else{cyl(.3*k,.24*k,paint,0,.12*k,0,turret);box(.34*k,.3*k,.4*k,paint,0,.36*k,0,turret);
    const upper=new THREE.Group();upper.position.y=.42*k;turret.add(upper);box(.2*k,1*k,.22*k,paint,0,.5*k,0,upper);
    const fore=new THREE.Group();fore.position.y=1*k;upper.add(fore);box(.85*k,.17*k,.19*k,paint,.38*k,0,0,fore);cyl(.07*k,.12*k,C.dark,.85*k,0,0,fore,'x');box(.05*k,.16*k,.12*k,C.steel,.94*k,-.06*k,0,fore);height=1.75*k+.3;
    const ph=hash(s.lot+(s.unit||''))%7;moving.push((t,busy)=>{const a=busy?t:0;turret.rotation.y=busy?.9*Math.sin(a*.45+ph):ph*.3;upper.rotation.z=busy?-.25+.2*Math.sin(a*.7+ph):-.15;fore.rotation.z=busy?.3*Math.sin(a*.9+ph):.1})}
  }else if(kind==='agv'){
   // Mobile robot: low body with a coloured band, lidar on top and its touch screen.
   box(.9,.42,.62,M.white,0,.26,0,g);box(.91,.06,.63,C.copper,0,.42,0,g);for(const sx of [-1,1])for(const sz of [-1,1])cyl(.07,.05,C.dark,sx*.32,.07,sz*.32,g,'z');
   const lidar=cyl(.07,.08,C.dark,.25,.51,0,g);box(.24,.16,.02,M.glow,-.2,.55,.2,g);height=.8;moving.push((t,busy)=>{lidar.rotation.y=busy?t*4:0});
  }else{
   // Spare machine: shrink-wrapped on a pallet, with its lot tag.
   const h=/conveyor|buffer/i.test(s.type)?.95:1.45;box(w,.12,d,M.pallet,0,.06,0,g);box(w-.12,h,d-.12,C.dark,0,.12+h/2,0,g);box(w-.08,h+.04,d-.08,M.wrap,0,.12+h/2+.02,0,g).castShadow=false;
   box(.22,.14,.005,C.copper,w/2-.25,.12+h*.7,d/2-.035,g);height=h+.2;
  }
  return {group:g,height,lamps,update:(t,busy,clock=t)=>moving.forEach(f=>f(t,busy,clock))};
 }

 // The place of a machine that is not in the sale: a glowing red (or amber, when optional) outline of its
 // footprint and height, with its name above it.
 function ghost(s,height=1.5){const g=new THREE.Group();g.position.set(s.x,0,s.z);const col=s.status==='missing'?0xd2453b:0xd8a531,w=s.w-.08,d=s.d;
  const fill=keep(new THREE.MeshStandardMaterial({color:col,emissive:col,emissiveIntensity:.35,transparent:true,opacity:.16,depthWrite:false}));const b=new THREE.Mesh(keep(new THREE.BoxGeometry(w,height,d)),fill);b.position.y=height/2;g.add(b);
  const edges=new THREE.LineSegments(keep(new THREE.EdgesGeometry(keep(new THREE.BoxGeometry(w,height,d)))),keep(new THREE.LineBasicMaterial({color:col})));edges.position.y=height/2;g.add(edges);
  const pad=new THREE.Mesh(keep(new THREE.PlaneGeometry(w,d)),keep(new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.3,depthWrite:false})));pad.rotation.x=-Math.PI/2;pad.position.y=.006;g.add(pad);
  const tag=label(s.status==='missing'?'MISSING':'OPTIONAL',s.role?'Robot':s.type,s.status==='missing'?'#d2453b':'#d8a531',1.1);tag.position.set(0,height+.55,0);g.add(tag);
  return {group:g,height,lamps:null,tag,update:(t,busy,clock)=>{fill.opacity=.12+.07*Math.sin(clock*2.4)}}}

 // Floating label: a title, a smaller second line and a coloured bar (line labels, missing machines).
 // Labels with the same text share one texture and material (an SMT factory has dozens of 'MISSING · Chip mounter').
 const labels=new Map();
 function label(title,sub,color='#d9824a',scale=1){const key=`${title}|${sub}|${color}`;if(labels.has(key)){const sp=new THREE.Sprite(labels.get(key));sp.scale.set(2.4*scale,.6*scale,1);sp.renderOrder=6;return sp}
  const tex=canvasTex(640,160,(x,W,H)=>{x.fillStyle='rgba(28,27,24,.88)';x.beginPath();x.roundRect(4,8,W-8,H-16,14);x.fill();x.fillStyle=color;x.fillRect(4,8,12,H-16);
   x.fillStyle='#ecebe5';x.textAlign='left';x.textBaseline='middle';x.font='600 54px "IBM Plex Sans", system-ui, sans-serif';x.fillText(title,40,sub?58:H/2,W-60);
   if(sub){x.fillStyle=color;x.font='500 36px "IBM Plex Sans", system-ui, sans-serif';x.fillText(sub,40,112,W-60)}});
  const m=keep(new THREE.SpriteMaterial({map:tex?.t,depthTest:true}));labels.set(key,m);const sp=new THREE.Sprite(m);sp.scale.set(2.4*scale,.6*scale,1);sp.renderOrder=6;return sp}

 // Zone: yellow lane marks round the machines (box) and the factory's name painted on the floor in front.
 function zone(box,name){const g=new THREE.Group(),pad=1.1,x0=box.x0-pad,x1=box.x1+pad,z0=box.z0-pad,z1=box.z1+pad,yellow=mat(0xe3b82e,.05,.6);
  const strip=(w,d,x,z)=>{const m=new THREE.Mesh(keep(new THREE.PlaneGeometry(w,d)),yellow);m.rotation.x=-Math.PI/2;m.position.set(x,.004,z);m.receiveShadow=true;g.add(m)};
  strip(x1-x0,.1,(x0+x1)/2,z0);strip(x1-x0,.1,(x0+x1)/2,z1);strip(.1,z1-z0,x0,(z0+z1)/2);strip(.1,z1-z0,x1,(z0+z1)/2);
  // 2048×128 canvas on a 14.4 × 0.9 m decal: letters about 0.6 m high, centred in front of the zone.
  const tex=canvasTex(2048,128,(x,W,H)=>{x.fillStyle='rgba(40,42,40,.62)';x.font='700 84px "IBM Plex Sans", system-ui, sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(name.toUpperCase(),W/2,H/2,W-16)});
  if(tex){const m=new THREE.Mesh(keep(new THREE.PlaneGeometry(14.4,.9)),keep(new THREE.MeshBasicMaterial({map:tex.t,transparent:true,depthWrite:false})));m.rotation.x=-Math.PI/2;m.position.set((x0+x1)/2,.006,z1+.75);g.add(m)}
  return g}

 // The hall: epoxy floor, a green walkway in front of the machines, and three walls (back, left, right) built by
 // wall(); the front is left open so the line can be seen from outside. bounds: where the camera may go.
 function hall(layout,{height=9}={}){const {x0,x1,z0,z1}=layout.bounds,L=x1-x0,D=z1-z0,mx=(x0+x1)/2,mz=(z0+z1)/2,g=new THREE.Group();
  const floorTex=canvasTex(1024,1024,(x,W,H2)=>{x.fillStyle='#c4c7c2';x.fillRect(0,0,W,H2);for(let i=0;i<500;i++){x.fillStyle=`rgba(0,0,0,${.015+((i*37)%7)*.004})`;x.fillRect((i*131)%W,(i*197)%H2,2,2)}x.strokeStyle='rgba(40,42,40,.22)';x.lineWidth=3;for(let k=0;k<=8;k++){x.beginPath();x.moveTo(k*W/8,0);x.lineTo(k*W/8,H2);x.stroke();x.beginPath();x.moveTo(0,k*H2/8);x.lineTo(W,k*H2/8);x.stroke()}});
  if(floorTex){floorTex.t.wrapS=floorTex.t.wrapT=THREE.RepeatWrapping;floorTex.t.repeat.set(L/8,D/8)}
  const floor=new THREE.Mesh(keep(new THREE.PlaneGeometry(L,D)),mat(0xffffff,.05,.55,floorTex?{map:floorTex.t}:{}));floor.rotation.x=-Math.PI/2;floor.position.set(mx,0,mz);floor.receiveShadow=true;g.add(floor);
  const walk=mat(0x3c7d5a,.05,.7),white=mat(0xf2f1ec,.05,.6),wz=Math.min(z1-1.2,layout.box.z1+3.6);
  for(const [dd,z,m] of [[1.2,wz,walk],[.05,wz-.6,white],[.05,wz+.6,white]]){const p=new THREE.Mesh(keep(new THREE.PlaneGeometry(L-2,dd)),m);p.rotation.x=-Math.PI/2;p.position.set(mx,.003,z);p.receiveShadow=true;g.add(p)}
  // Each wall is built along its own +x facing its own +z, then turned into place: the back wall runs x0→x1, the
  // left wall z1→z0 (an exit by the open front, a loading door mid-way), the right wall z0→z1 (a loading door and
  // a personnel door by the front).
  const back=wall(L,{clock:true,height});back.position.set(x0,0,z0);
  const left=wall(D,{doors:[{at:.08,kind:'exit'},{at:.55,kind:'rollup'}],height});left.position.set(x0,0,z1);left.rotation.y=Math.PI/2;
  const right=wall(D,{doors:[{at:.45,kind:'rollup'},{at:.92,kind:'door'}],height});right.position.set(x1,0,z0);right.rotation.y=-Math.PI/2;
  g.add(back,left,right);box(L,.12,.12,C.dark,mx,.06,z1,g).castShadow=false;
  g.userData.bounds={x0:x0+.6,x1:x1-.6,z0:z0+.6};return g}

 // Painted surfaces of the walls: white insulated sandwich panels (1 m horizontal panels with fine ribs), the
 // ribbed roll-up shutter, hazard stripes, louvres, the floor hatching in front of doors, and the signs.
 const T={};const tex=(key,w,h,draw)=>T[key]!==undefined?T[key]:(T[key]=canvasTex(w,h,draw)?.t||null);
 const repeatOf=(key,rx,ry)=>{const t=T[key];if(!t)return null;const c=keep(t.clone());c.wrapS=c.wrapT=THREE.RepeatWrapping;c.repeat.set(rx,ry);c.needsUpdate=true;return c};
 const wallTextures=()=>{
  tex('clad',512,512,(x,W,H)=>{x.fillStyle='#f6f6f3';x.fillRect(0,0,W,H);for(let y=0;y<H;y+=16){x.fillStyle=y%128===0?'rgba(40,44,48,.16)':'rgba(40,44,48,.035)';x.fillRect(0,y,W,y%128===0?3:1)}for(let i=0;i<300;i++){x.fillStyle='rgba(0,0,0,.02)';x.fillRect((i*137)%W,(i*271)%H,3,1)}});
  tex('shutter',256,256,(x,W,H)=>{x.fillStyle='#b9bec2';x.fillRect(0,0,W,H);for(let y=0;y<H;y+=16){x.fillStyle='rgba(255,255,255,.35)';x.fillRect(0,y,W,2);x.fillStyle='rgba(0,0,0,.22)';x.fillRect(0,y+12,W,3)}});
  tex('hazard',128,128,(x,W,H)=>{x.fillStyle='#e3b82e';x.fillRect(0,0,W,H);x.fillStyle='#1c1b18';for(let k=-W;k<W*2;k+=48){x.beginPath();x.moveTo(k,0);x.lineTo(k+24,0);x.lineTo(k+24-H,H);x.lineTo(k-H,H);x.closePath();x.fill()}});
  tex('louvre',128,128,(x,W,H)=>{x.fillStyle='#8b9196';x.fillRect(0,0,W,H);for(let y=8;y<H-8;y+=14){x.fillStyle='#4b5560';x.fillRect(8,y,W-16,6);x.fillStyle='rgba(255,255,255,.3)';x.fillRect(8,y+6,W-16,2)}x.strokeStyle='#5f6e78';x.lineWidth=8;x.strokeRect(4,4,W-8,H-8)});
  tex('hatch',256,128,(x,W,H)=>{x.clearRect(0,0,W,H);x.fillStyle='rgba(227,184,46,.9)';for(let k=-H;k<W+H;k+=32){x.beginPath();x.moveTo(k,0);x.lineTo(k+14,0);x.lineTo(k+14+H,H);x.lineTo(k+H,H);x.closePath();x.fill()}x.strokeStyle='rgba(227,184,46,.95)';x.lineWidth=8;x.strokeRect(4,4,W-8,H-8)});
  tex('exit',512,192,(x,W,H)=>{x.fillStyle='#1f8a4c';x.fillRect(0,0,W,H);x.fillStyle='#ffffff';x.font='700 84px "IBM Plex Sans", system-ui, sans-serif';x.textBaseline='middle';x.fillText('EXIT',190,H/2);x.beginPath();x.moveTo(40,H/2);x.lineTo(120,H/2-44);x.lineTo(120,H/2+44);x.closePath();x.fill();x.fillRect(110,H/2-14,50,28)});
  tex('fire',128,128,(x,W,H)=>{x.fillStyle='#c8312a';x.fillRect(0,0,W,H);x.fillStyle='#fff';x.beginPath();x.roundRect(48,40,32,70,10);x.fill();x.fillRect(56,24,16,18);x.fillRect(70,28,26,8)});
  tex('aid',128,128,(x,W,H)=>{x.fillStyle='#1f8a4c';x.fillRect(0,0,W,H);x.fillStyle='#fff';x.fillRect(50,22,28,84);x.fillRect(22,50,84,28)});
  tex('volt',128,128,(x,W,H)=>{x.fillStyle='#f2f1ec';x.fillRect(0,0,W,H);x.fillStyle='#e3b82e';x.strokeStyle='#1c1b18';x.lineWidth=7;x.beginPath();x.moveTo(64,14);x.lineTo(116,108);x.lineTo(12,108);x.closePath();x.fill();x.stroke();x.fillStyle='#1c1b18';x.beginPath();x.moveTo(70,40);x.lineTo(50,72);x.lineTo(64,72);x.lineTo(56,98);x.lineTo(80,62);x.lineTo(66,62);x.closePath();x.fill()});
  tex('esd',512,256,(x,W,H)=>{x.fillStyle='#e3b82e';x.fillRect(0,0,W,H);x.strokeStyle='#1c1b18';x.lineWidth=14;x.strokeRect(7,7,W-14,H-14);x.fillStyle='#1c1b18';x.font='700 54px "IBM Plex Sans", system-ui, sans-serif';x.fillText('ESD',230,110);x.font='600 34px "IBM Plex Sans", system-ui, sans-serif';x.fillText('protected area',230,165);x.lineWidth=10;x.beginPath();x.moveTo(110,40);x.lineTo(190,190);x.lineTo(30,190);x.closePath();x.stroke();x.beginPath();x.moveTo(80,165);x.quadraticCurveTo(110,70,140,165);x.stroke()});
  tex('ppe',512,256,(x,W,H)=>{x.fillStyle='#2c4f8a';x.fillRect(0,0,W,H);x.fillStyle='#fff';x.font='600 40px "IBM Plex Sans", system-ui, sans-serif';x.textBaseline='middle';x.fillText('Safety shoes and',40,96);x.fillText('glasses required',40,150);x.beginPath();x.arc(W-80,H/2,48,0,Math.PI*2);x.lineWidth=10;x.strokeStyle='#fff';x.stroke()});
  tex('clock',256,256,(x,W,H)=>{x.fillStyle='#fafaf7';x.beginPath();x.arc(128,128,120,0,Math.PI*2);x.fill();x.lineWidth=10;x.strokeStyle='#1c1b18';x.stroke();for(let k=0;k<12;k++){const a=k*Math.PI/6;x.lineWidth=k%3?4:8;x.beginPath();x.moveTo(128+Math.sin(a)*96,128-Math.cos(a)*96);x.lineTo(128+Math.sin(a)*110,128-Math.cos(a)*110);x.stroke()}x.lineCap='round';x.lineWidth=9;x.beginPath();x.moveTo(128,128);x.lineTo(128+52,128-30);x.stroke();x.lineWidth=6;x.beginPath();x.moveTo(128,128);x.lineTo(128-20,128-86);x.stroke()});
 };
 const decal=(key,w,h,x,y,z,parent,glow=0)=>{if(!T[key])return null;const m=new THREE.Mesh(keep(new THREE.PlaneGeometry(w,h)),mat(0xffffff,0,.6,{map:T[key],transparent:key==='hatch',...(glow?{emissive:0xffffff,emissiveMap:T[key],emissiveIntensity:glow}:{})}));m.position.set(x,y,z);parent.add(m);return m};

 // One wall of the hall, in its own frame: it runs along +x from 0 to len and faces +z (into the hall), 9 m high.
 // White sandwich-panel cladding over a concrete plinth; steel I-section columns every bay (about 6 m) with
 // yellow and black guards at the foot; a window in each bay; a fascia beam on top; a cable tray, a sprinkler
 // main (red) and a compressed-air line (blue) on brackets along it; a floodlight on every other column and
 // louvres up high. Bay by bay it carries an electrical board (with its conduit up to the tray), a fire point
 // (extinguisher, hose reel, sign), first aid, safety signs, or the doors asked for: doors=[{at: 0..1 along the
 // wall, kind: 'rollup' | 'exit' | 'door'}], snapped to the middle of a bay. clock: a wall clock in the middle bay.
// height: 9 m by default; a taller wall (a melt shop) gets a second band of windows up high and bigger bays.
 function wall(len,{doors=[],clock=false,height=9}={}){
  if(!T.clad)wallTextures();
  const w=new THREE.Group(),H=height,tall=H>12,bays=Math.max(2,Math.round(len/(tall?8:6))),step=len/bays,mid=i=>(i+.5)*step;
  const flat=(gw,gh,gd,m,x,y,z)=>{const o=box(gw,gh,gd,m,x,y,z,w);o.castShadow=false;return o};
  if(!M.board){M.concrete=mat(0xbdbcb6,.02,.92);M.trim=mat(0xe6e6e1,.1,.5);M.steel=mat(0x4b5560,.5,.45);M.red=mat(0xc8312a,.15,.45);M.green=mat(0x1f8a4c,.1,.5);M.blue=mat(0x2c6fb8,.3,.45);
   M.board=mat(0xc9ccce,.35,.45);M.pane=mat(0xd6e4ec,.1,.15,{emissive:0xe8f1f6,emissiveIntensity:.5});M.lamp=mat(0xffffff,0,.3,{emissive:0xfff3dc,emissiveIntensity:1.4});M.door=mat(0x6f7c86,.3,.5);
   M.shutter=T.shutter?mat(0xffffff,.4,.45,{map:T.shutter}):mat(0xb9bec2,.4,.45);M.louvre=T.louvre?mat(0xffffff,.3,.5,{map:T.louvre}):mat(0x8b9196,.3,.5);M.hazard=T.hazard?mat(0xffffff,.1,.55,{map:T.hazard}):C.yellow}
  // The cladding glows faintly with its own texture, so it reads white even where the walls face away from the sun.
  const clad=repeatOf('clad',len/4,H/4);flat(len,H,.2,clad?mat(0xffffff,.05,.6,{map:clad,emissive:0xffffff,emissiveMap:clad,emissiveIntensity:.32}):mat(0xf6f6f3,.05,.6,{emissive:0xffffff,emissiveIntensity:.32}),len/2,H/2,-.1);
  flat(len,1,.25,M.concrete,len/2,.5,.025);flat(len,.05,.27,C.dark,len/2,1.02,.03);flat(len,.35,.5,M.steel,len/2,H-.17,.15);flat(len,.08,.08,M.trim,len/2,H-.4,.05);
  // Services along the wall: cable tray with side rails, the sprinkler main and the compressed-air line, on brackets.
  flat(len,.04,.32,M.board,len/2,4.3,.36);for(const z of [.2,.52])flat(len,.09,.02,M.board,len/2,4.34,z);cyl(.045,len,M.red,len/2,3.9,.24,w,'x',12).castShadow=false;cyl(.03,len,M.blue,len/2,3.62,.2,w,'x',12).castShadow=false;
  for(let x=1.5;x<len;x+=3){flat(.04,.6,.04,C.steel,x,3.95,.12);flat(.04,.04,.45,C.steel,x,4.27,.25)}
  const door=new Map(doors.map(d=>[Math.min(bays-1,Math.max(0,Math.floor(d.at*bays))),d.kind]));
  for(let i=0;i<=bays;i++){const x=i*step;
   // Steel I-section column: two flanges and the web, on a base plate, with a striped guard round its foot.
   flat(.32,H,.03,M.steel,x,H/2,.035);flat(.32,H,.03,M.steel,x,H/2,.41);flat(.03,H,.36,M.steel,x,H/2,.22);flat(.5,.03,.5,C.steel,x,.015,.22);
   flat(.46,.9,.54,M.hazard,x,.45,.24);
   if(i%2===0&&i>0&&i<bays){box(.36,.14,.26,C.dark,x,7.2,.6,w).castShadow=false;flat(.3,.012,.2,M.lamp,x,7.12,.62);flat(.04,.04,.4,C.steel,x,7.2,.4)}}
  const kit=['board','fire','sign','aid','board','sign2'];let k=0;
  for(let i=0;i<bays;i++){const x=mid(i),kind=door.get(i);
   if(kind!=='rollup'){flat(step-1.2,1.4,.04,M.pane,x,5.7,.04);flat(step-1.1,.08,.16,M.trim,x,4.96,.08);flat(step-1.1,.06,.08,M.trim,x,6.44,.05);for(let m=-1;m<=1;m++)flat(.06,1.4,.07,C.dark,x+m*(step-1.2)/4,5.7,.06)}
   if(i%2===1)flat(1.1,.75,.06,M.louvre,x,7.9,.03);
   if(tall){flat(step-1.2,2.2,.04,M.pane,x,H-3.2,.04);flat(step-1.1,.08,.16,M.trim,x,H-4.34,.08);for(let m=-1;m<=1;m++)flat(.06,2.2,.07,C.dark,x+m*(step-1.2)/4,H-3.2,.06);if(i%2===0)flat(1.1,.75,.06,M.louvre,x,H-5.3,.03)}
   if(kind==='rollup'){const dw=Math.min(4.4,step-.9),dh=4.6;
    flat(dw,dh,.06,M.shutter,x,dh/2,.2);flat(dw+.6,.55,.55,M.trim,x,dh+.3,.3);for(const sx of [-1,1]){flat(.16,dh+.1,.2,M.hazard,x+sx*(dw/2+.08),(dh+.1)/2,.24)}
    for(const sx of [-1,1])cyl(.1,1.1,C.yellow,x+sx*(dw/2+.5),.55,1.05,w,'y',14);flat(.18,.26,.12,C.dark,x+dw/2+.35,1.4,.12);flat(.06,.06,.02,M.green,x+dw/2+.35,1.45,.19);
    const h=decal('hatch',dw,1.8,x,.006,1.15,w);if(h)h.rotation.x=-Math.PI/2;continue}
   if(kind==='exit'||kind==='door'){const dx=x-.8;flat(1.08,2.2,.07,kind==='exit'?M.green:M.door,dx,1.1,.2);flat(1.2,.06,.1,C.dark,dx,2.23,.2);for(const sx of [-1,1])flat(.06,2.26,.1,C.dark,dx+sx*.57,1.13,.2);
    flat(.8,.05,.06,C.steel,dx,1.02,.27);if(kind==='door')flat(.3,.4,.02,M.pane,dx,1.6,.245);
    if(kind==='exit'){decal('exit',.9,.34,dx,2.65,.06,w,.7);flat(.3,.1,.08,M.lamp,dx+.75,2.65,.08)}
    const h=decal('hatch',1.4,1,dx,.006,.75,w);if(h)h.rotation.x=-Math.PI/2;continue}
   if(clock&&i===Math.floor(bays/2)){decal('clock',.7,.7,x,3,.03,w);continue}
   const what=kit[k++%kit.length];
   if(what==='board'){flat(.9,1.4,.3,M.board,x-.5,1.55,.15);flat(.004,1.3,.002,C.dark,x-.5,1.55,.302);flat(.02,.16,.03,C.dark,x-.12,1.55,.31);decal('volt',.18,.18,x-.5,2.05,.305,w);
     cyl(.035,2.05,C.dark,x-.75,3.27,.12,w,'y',10).castShadow=false;cyl(.035,2.05,C.dark,x-.25,3.27,.12,w,'y',10).castShadow=false;flat(.7,1.1,.25,M.board,x+.45,1.3,.13);decal('volt',.16,.16,x+.45,1.72,.256,w)}
   else if(what==='fire'){cyl(.09,.5,M.red,x-.5,.95,.14,w,'y',16);cyl(.03,.12,C.dark,x-.5,1.26,.14,w);flat(.12,.08,.06,C.dark,x-.5,1.05,.04);decal('fire',.32,.32,x-.5,1.75,.02,w);
     flat(.72,.72,.22,M.red,x+.25,1.45,.11);flat(.6,.6,.01,C.glass,x+.25,1.45,.225);cyl(.24,.08,M.red,x+.25,1.45,.15,w,'z',20)}
   else if(what==='aid'){flat(.48,.48,.16,M.green,x,1.6,.08);decal('aid',.3,.3,x,1.6,.165,w)}
   else decal(what==='sign'?'esd':'ppe',1.3,.65,x,2.5,.02,w)}
  return w}


 const dispose=()=>{owned.forEach(x=>x.dispose?.());line.dispose()};
 return {machine,ghost,label,zone,hall,link:line.link,dispose};
}
