// models.js — the machine that stands on every station of a hall.
//
// createModelContext(THREE) gathers the four model libraries once per hall view:
//   plant   createPlantModels(THREE): the factory-line SMT / LED / IMM line models (machine(kind, s, runs)); the SMT kinds
//           paint the catalogue card (what, lot, year, weight, power) on their operator screen;
//   FL      the factory-line builders (maynards lab / heavy / general: build<Kind>(K, item)) and its text classifier;
//   MB      the portal's own builders (machines/*.js, registered on window.MB) and their detail pass MB.dress;
//   kit     createKit(THREE), the shared kit every builder draws with (K.box, K.cyl, K.mat, K.M …).
// buildStation(row, box, ctx) resolves the row with machineRules.resolve() and builds the model it names, or, when no
// library model fits ('none'), a detailed cabinet of the footprint; a row that is not available ('na') becomes a red
// hatched ghost and a row shared with another line a blue one. The model is scaled uniformly into the station's box
// (factor .45–1.7, like hall-kit.js K.models) and centred on it. ctx.dispose() frees every geometry, material and
// texture the libraries and this module created.
//
// The machines/*.js builders are classic scripts (an IIFE each) that register on window.MB with the helpers of
// machines/common.js. They are bundled as text (import.meta.glob with ?raw) and run once, in a fixed order with
// common.js first: an eager side-effect import cannot be ordered, and a builder file that does not exist (yet) simply
// is not in the glob, so it never breaks the build. They draw with K.THREE, so no global THREE is needed.
import * as THREE from 'three';
import {createPlantModels} from './fl/plantModels.js';
import {createKit} from './fl/steelModels/kit.js';
import {buildBench,buildBioreactor,buildIncubator,buildFreezer,buildHood,buildCentrifuge} from './fl/maynardsModels/lab.js';
import {buildGenset,buildMill,buildFurnace,buildStampingPress,buildShredder,buildSorter,buildBaler,buildExtruder,buildGranulator,buildTank} from './fl/maynardsModels/heavy.js';
import {buildCompressor,buildLaser,buildTestbench,buildGrinder,buildHobbing,buildMachiningCenter,buildLathe,buildWelding,buildRack,buildForklift,buildCabinet,buildCoater,buildTransformer,buildSite} from './fl/maynardsModels/general.js';
import {kindOf} from './fl/kindRules.js';
import {resolve} from './machineRules.js';

// The factory-line builder map, as fl-models.js exposes it (FL.builders).
export const FL_BUILDERS={bench:buildBench,bioreactor:buildBioreactor,incubator:buildIncubator,freezer:buildFreezer,hood:buildHood,centrifuge:buildCentrifuge,
 genset:buildGenset,mill:buildMill,furnace:buildFurnace,stampingPress:buildStampingPress,shredder:buildShredder,sorter:buildSorter,baler:buildBaler,extruder:buildExtruder,granulator:buildGranulator,tank:buildTank,
 compressor:buildCompressor,laser:buildLaser,testbench:buildTestbench,grinder:buildGrinder,hobbing:buildHobbing,machiningCenter:buildMachiningCenter,lathe:buildLathe,welding:buildWelding,rack:buildRack,forklift:buildForklift,cabinet:buildCabinet,coater:buildCoater,transformer:buildTransformer,site:buildSite};
export const FL={kindOf,builders:FL_BUILDERS};

// ---------- the portal's own builders (machines/*.js) ----------
const MB_SRC=import.meta.glob('../../../machines/*.js',{eager:true,query:'?raw',import:'default'});
const MB_ORDER=['common','handling','logistics','metal','lab','dress','extra','robots','takeout'];
let mbLoaded=false;
export function loadMB(){
 if(typeof window==='undefined')return null;
 if(mbLoaded)return window.MB||null;mbLoaded=true;
 const files=Object.entries(MB_SRC).map(([p,src])=>({name:p.split('/').pop().replace(/\.js$/,''),src}));
 const rank=n=>{const i=MB_ORDER.indexOf(n);return i<0?MB_ORDER.length:i};
 files.sort((a,b)=>rank(a.name)-rank(b.name)||a.name.localeCompare(b.name));
 for(const f of files){try{new Function(f.src+`\n//# sourceURL=machines/${f.name}.js`)()}catch(e){console.warn('machines/'+f.name+'.js',e)}}
 return window.MB||null}

// ---------- context ----------
export function createModelContext(T=THREE,{hallH=8}={}){
 const MB=loadMB();const kit=createKit(T),plant=createPlantModels(T);
 const own=[];const keep=o=>{own.push(o);return o};
 return {THREE:T,kit,plant,MB,FL,hallH,keep,own,
  dispose(){for(const o of own)o.dispose?.();own.length=0;try{plant.dispose()}catch(e){}try{kit.dispose()}catch(e){}}}}

// The station spec every builder reads (machines/common.js documents it): footprint, station and catalogue details.
export function stationSpec(row,box,hit){const lot=String(row.lot||'').split(/[,+]/)[0].trim();
 return {x:0,z:0,w:box.w,d:box.d,h:box.h,type:row.station||'',name:row.name||'',title:row.name||'',lot,year:row.year||'',status:'in',
  make:hit?hit.make:'',model:hit?hit.model:'',count:hit?hit.count:1,opts:hit?hit.opts:{},photo:(row.ph&&row.ph[0])||'',
  payload:/kuka|fanuc|abb|robot/i.test(row.name||'')?(/kr ?(\d+)/i.test(row.name)?+RegExp.$1:20):undefined,
  info:{weight:row.weight||'',power:row.supply||'',size:'',supplied:'',category:row.station||'',area:'',status:'In sale'}}}

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const FONT='"IBM Plex Sans", system-ui, sans-serif',MONO='"IBM Plex Mono", ui-monospace, monospace';

// ---------- not available / shared: the ghost of the missing machine ----------
// A translucent box of the footprint with dashed edges, a hatched pad on the floor and a plate on its front, the way
// the old pages marked a bay with no machine in the catalogue (red) — and here also a bay whose machine is shared with
// another line (blue). update() pulses the fill.
function ghost(ctx,row,box,{color,title,sub}){const T=ctx.THREE,K=ctx.kit,keep=ctx.keep,g=new T.Group();const w=Math.max(.6,box.w-.08),d=Math.max(.5,box.d-.06),h=Math.min(1.65,Math.max(1.2,box.h*.8));
 const fill=keep(new T.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.25,transparent:true,opacity:.14,depthWrite:false,roughness:.6}));
 const geo=keep(new T.BoxGeometry(w,h,d));const b=new T.Mesh(geo,fill);b.position.y=h/2;b.userData.ghost=true;g.add(b);
 const edges=new T.LineSegments(keep(new T.EdgesGeometry(geo)),keep(new T.LineDashedMaterial({color,dashSize:.12,gapSize:.07})));edges.position.y=h/2;edges.computeLineDistances();g.add(edges);
 const css='#'+color.toString(16).padStart(6,'0');
 const hatch=K.canvasTex(128,128,(x,W,H)=>{x.fillStyle=css+'2e';x.fillRect(0,0,W,H);x.strokeStyle=css+'bf';x.lineWidth=10;for(let i=-H;i<W;i+=36){x.beginPath();x.moveTo(i,H);x.lineTo(i+H,0);x.stroke()}});
 hatch.wrapS=hatch.wrapT=T.RepeatWrapping;hatch.repeat.set(w*2,d*2);
 const pad=new T.Mesh(keep(new T.PlaneGeometry(w,d)),keep(new T.MeshBasicMaterial({map:hatch,transparent:true,depthWrite:false})));pad.rotation.x=-Math.PI/2;pad.position.y=.008;g.add(pad);
 // the plate, on the front and the back, so it reads from both sides of the line
 const pw=Math.min(w-.1,1.3),ph=pw*.2;const tex=K.canvasTex(512,Math.round(512*ph/pw),(x,W,H)=>{x.fillStyle=css;x.fillRect(0,0,W,H);x.fillStyle='#fff';x.textAlign='center';x.textBaseline='middle';
  let fs=Math.round(H*.46);x.font=`700 ${fs}px ${FONT}`;while(x.measureText(title).width>W-24&&fs>14){fs-=2;x.font=`700 ${fs}px ${FONT}`}x.fillText(title,W/2,sub?H*.38:H/2);
  if(sub){x.font=`500 ${Math.round(H*.22)}px ${MONO}`;x.fillText(sub,W/2,H*.76,W-24)}});
 const pm=keep(new T.MeshBasicMaterial({map:tex}));for(const s of [1,-1]){const p=new T.Mesh(keep(new T.PlaneGeometry(pw,ph)),pm);p.position.set(0,h+.02-ph/2-.06,s*(d/2+.012));if(s<0)p.rotation.y=Math.PI;g.add(p)}
 return {group:g,height:h,ghost:true,update:t=>{fill.opacity=.1+.07*(Math.sin(t*2.6)+1)/2}}}

// ---------- 'none': a detailed cabinet of the footprint ----------
// When no library model fits, the station still gets a machine that reads as one: a body on a kick plate with panel
// seams and doors (one per module of about 2 m), a glass inspection window on the larger modules, the operator screen
// with the catalogue card, an e-stop and keypad, a signal tower, the maker nameplate (make, model, lot), a brand colour
// band and grilles on the sides. Long, low footprints become a line of modules joined by a conveyor; very thin ones an
// overhead conveyor on posts (the hanging lines of the paint shop).
function cabinet(ctx,row,box,s){const T=ctx.THREE,K=ctx.kit,MB=ctx.MB,g=new T.Group();const H=MB&&MB.H?MB.H(K):null;const P=H?H.P:null;
 const w=Math.max(.6,box.w-.06),d=Math.max(.45,box.d-.06);const lamps=[];const moving=[];
 if(!H){K.box(w,box.h,d,K.M.white,0,box.h/2,0,g);return {group:g,height:box.h}}
 // very thin and long: overhead conveyor (posts, I-beam rail, trolleys with hanging parts that move along it)
 if(d<.55&&w>2.5){const yr=Math.min(ctx.hallH-2.5,3.2);const n=Math.max(2,Math.round(w/2.4));for(let i=0;i<=n;i++){const x=-w/2+i*w/n;K.box(.12,yr,.12,K.M.yellow,x,yr/2,0,g);K.box(.4,.03,.4,K.M.dark,x,.015,0,g)}
  K.box(w,.16,.08,K.M.steel,0,yr+.08,0,g);K.box(w,.02,.2,K.M.steel,0,yr,0,g);K.box(w,.02,.2,K.M.steel,0,yr+.16,0,g);
  const hang=new T.Group();g.add(hang);const k=Math.max(3,Math.round(w/.9));for(let i=0;i<k;i++){const x=-w/2+(i+.5)*w/k;K.cyl(.008,.7,K.M.dark,x,yr-.35,0,hang,'y',6);K.box(.5,.42,.04,i%2?P.light:P.grey,x,yr-.92,0,hang)}
  moving.push((t,run)=>{if(run)hang.position.x=((t*.25)%(w/k))-w/(2*k)});
  H.nameplate(g,s,-w/2+.5,1.4,.07,.6,.15);return {group:g,height:yr+.3,update:(t,run)=>moving.forEach(f=>f(t,run))}}
 const h=clamp(box.h,1.3,3.4),mods=Math.max(1,Math.min(6,Math.round(w/2.2))),mw=w/mods;const body=P.white,trim=P.light;
 for(let i=0;i<mods;i++){const x=-w/2+(i+.5)*mw,mh=i===0?h:h*(mods>2?.82:.92),gm=H.grp(g,x,0,0);
  K.box(mw-.04,.1,d-.06,P.kick,0,.05,0,gm);K.box(mw-.04,mh-.1,d,body,0,.1+(mh-.1)/2,0,gm);K.box(mw,.05,d+.02,trim,0,mh+.025,0,gm);
  // panel seams and doors on the front, grilles on the sides
  const nd=Math.max(1,Math.round((mw-.1)/.9)),dw=(mw-.16)/nd;for(let j=0;j<nd;j++){const dx=-mw/2+.08+(j+.5)*dw;H.door(gm,dw-.04,mh-.45,dx,.1+(mh-.1)/2-.05,d/2+.011,body,mw>1.4&&j===Math.floor(nd/2)&&mh>1.5,j%2?-1:1)}
  if(i===0||i===mods-1){const sx=i===0?-1:1;H.grille(gm,Math.min(d*.6,.6),Math.min(mh*.3,.5),sx*(mw/2+.003),mh*.55,0,sx*Math.PI/2)}
  H.logoBand(gm,s,mw-.04,0,mh-.12,d/2+.008);
  if(i<mods-1){K.box(.2,.06,.42,P.alu,mw/2,.92,0,gm);K.box(.22,.02,.36,P.belt,mw/2,.95,0,gm)}}
 // operator panel on the first module: screen with the catalogue card, keypad, e-stop; nameplate; signal tower
 const x0=-w/2+mw/2;const pz=d/2+.02;const sw=clamp(mw*.38,.3,.5);H.screen(g,x0+mw*.22,Math.min(h-.45,1.45),pz+.01,sw,sw*.66,H.card(s));
 H.keypad(g,x0+mw*.22,Math.min(h-.45,1.45)-sw*.33-.1,pz+.01,4,2);H.estop(g,x0+mw*.22+sw/2+.06,Math.min(h-.45,1.45)-sw*.33-.08,pz+.01);
 H.nameplate(g,s,x0-mw*.18,Math.min(h-.25,1.75),pz,Math.min(.62,mw*.42),.15);
 const tw=H.lampTower(g,-w/2+.12,h+.05,-d/2+.15,'g');lamps.push(...tw.lamps);
 H.warn(g,w/2-.15,h*.55,d/2+.012);
 // cable drop from the ceiling tray at the back corner
 K.cyl(.025,Math.max(.2,ctx.hallH-1.4-h),P.cableB,-w/2+.25,h+(ctx.hallH-1.4-h)/2,-d/2+.12,g,'y',8);
 return {group:g,height:h+.65,lamps,update:(t,run)=>{const on=lamps[0];if(on&&on.material&&on.material.emissiveIntensity!==undefined)on.material.emissiveIntensity=run?.9+.1*Math.sin(t*3):.3}}}

// ---------- one station ----------
// row: the catalogue row; box: {x, z, w, d, h} (centre and size of the footprint, metres); ctx: createModelContext().
// Returns {group, height, update?(t, run), src, kind, ghost?}. The group stands at (box.x, 0, box.z).
export function buildStation(row,box,ctx){const T=ctx.THREE;
 if(row.kind==='na'){const r=ghost(ctx,row,box,{color:0xd2453b,title:'NOT AVAILABLE',sub:'source separately'});r.group.position.set(box.x,0,box.z);return {...r,src:'na',kind:'na'}}
 if(row.kind==='shared'){const r=ghost(ctx,row,box,{color:0x3b6fb8,title:'SHARED',sub:'with another line'});r.group.position.set(box.x,0,box.z);return {...r,src:'shared',kind:'shared'}}
 const hit=resolve(row,{FL:ctx.FL,MB:ctx.MB});const s=stationSpec(row,box,hit);let u=null,src=hit?hit.src:'none',kind=hit?hit.kind:'cabinet';
 try{if(src==='plant')u=ctx.plant.machine(kind,s,true);else if(src==='fl')u=ctx.FL.builders[kind](ctx.kit,s);else if(src==='mb')u=ctx.MB.build(kind,ctx.kit,s)}
 catch(e){console.warn('model',src,kind,row.name,e);u=null}
 if(!u||!u.group){src='none';u=cabinet(ctx,row,box,s)}
 const mg=u.group;mg.position.set(0,0,0);
 // the detail pass of the library models (machines/dress.js): doors, controls, labels, nameplate on the plain bodies
 if((src==='plant'||src==='fl')&&ctx.MB&&ctx.MB.dress){try{ctx.MB.dress(kind,mg,s,ctx.kit)}catch(e){console.warn('dress',kind,e)}}
 // sized to the station it stands in, uniformly so the model keeps its proportions, and centred on the footprint
 const pg=new T.Group();pg.name='station';pg.add(mg);mg.updateMatrixWorld(true);const bb=new T.Box3().setFromObject(mg);
 if(!bb.isEmpty()){const ms=bb.getSize(new T.Vector3());
  const sc=clamp(Math.min(box.w/Math.max(.3,ms.x),(box.d*1.3)/Math.max(.3,ms.z),(ctx.hallH-.8)/Math.max(.5,ms.y)),.45,1.7);
  if(Math.abs(sc-1)>.04)mg.scale.setScalar(sc);mg.updateMatrixWorld(true);bb.setFromObject(mg);const c=bb.getCenter(new T.Vector3());mg.position.set(-c.x,-Math.min(0,bb.min.y),-c.z)}
 pg.position.set(box.x,0,box.z);
 pg.traverse(o=>{if(o.isMesh){o.castShadow=!o.material||!o.material.transparent;o.receiveShadow=true}});
 if(u.lamps&&u.lamps[0]&&u.lamps[0].material&&'emissiveIntensity' in u.lamps[0].material)u.lamps[0].material.emissiveIntensity=1.4;
 const fn=typeof u.update==='function'?u.update:null;
 const update=fn?(src==='fl'?(t,run)=>{if(run)fn(t,t)}:(t,run)=>fn(t,run,t)):null;
 pg.updateMatrixWorld(true);const height=new T.Box3().setFromObject(pg).max.y||u.height||1.5;
 return {group:pg,height,update,src,kind}}

// A loose prop for a placed item that has no catalogue row (MAP2D rows with index -1, e.g. "Packing"): a cabinet with
// its name on the screen.
export function buildProp(name,box,ctx){const s={x:0,z:0,w:box.w,d:box.d,h:box.h,type:name,name,title:name,lot:'',year:'',status:'in',make:name,model:'',count:1,opts:{},photo:'',info:{weight:'',power:'',category:name}};
 const u=cabinet(ctx,{station:name,name},box,s);u.group.position.set(box.x,0,box.z);u.group.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});return {...u,src:'prop',kind:'cabinet'}}

// Free a group's own geometries and materials (for objects made outside the contexts' tracking).
export function disposeGroup(g){g.traverse(o=>{if(o.geometry)o.geometry.dispose();const m=o.material;if(m){(Array.isArray(m)?m:[m]).forEach(x=>{if(x.map)x.map.dispose();x.dispose()})}})}
