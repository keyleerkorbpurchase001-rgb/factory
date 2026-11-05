// Shared helpers for the portal's own machine builders (machines/*.js). Every builder is registered on window.MB:
//   MB.add('kindName', (K, s) => ({group, height, update?, lamps?}))
// K is the factory-line kit (FL.createKit(THREE): box, cyl, sphere, torus, pipe, canvasTex, plate, mat, M palette).
// s is the station spec: {x,z,w,d,h,type (station name),name (catalogue name),make,model,lot,year,info:{weight,power},
// photo (url of the catalogue photo or ''), count (units in the lot), opts (from machine-rules.js)}. Builders build at the
// origin, floor at y=0, FRONT (operator side) towards +z, length along x. hall-kit.js positions and scales the group.
(function(){
'use strict';
const MB=window.MB=window.MB||{kinds:{},add(k,f){this.kinds[k]=f},has(k){return !!this.kinds[k]},build(k,K,s){return this.kinds[k](K,Object.assign({opts:{}},s))}};
const FONT='"IBM Plex Sans", system-ui, sans-serif',MONO='"IBM Plex Mono", ui-monospace, monospace';
// Helpers bound to a kit: MB.H(K) → {P (palette), grp, handle, hinge, feet, castors, screen, keypad, estop, lampTower,
// grille, warn, nameplate, logoBand, cableChain, hose, pallet, pcb, magazine, frame, door, fan, legs, label}
MB.H=function(K){const T=K.THREE,M=K.M;
 const P={alu:K.mat(0xc9ccce,.6,.4),white:K.mat(0xe9e9e4,.1,.55),light:K.mat(0xd7d9d6,.2,.55),grey:K.mat(0x8f969b,.4,.55),dark:K.mat(0x2e3134,.4,.6),black:K.mat(0x1c1d1f,.3,.7),steel:K.mat(0x9aa0a4,.7,.35),
  kick:K.mat(0x3a3d40,.3,.7),glass:K.mat(0x8fb4c8,.1,.1,{transparent:true,opacity:.42,depthWrite:false}),tint:K.mat(0x30414c,.1,.1,{transparent:true,opacity:.6,depthWrite:false}),yellow:K.mat(0xe3b82e,.2,.55),
  red:K.mat(0xc8312a,.2,.5),green:K.mat(0x3fa66b,.2,.5),blue:K.mat(0x3d7ab8,.3,.5),orange:K.mat(0xe8772e,.2,.5),belt:K.mat(0x27292b,.1,.8),rubber:K.mat(0x1f2022,.05,.9),copper:K.mat(0xc27a3e,.6,.35),
  pcb:K.mat(0x1f6b3a,.1,.5),hose:K.mat(0x3b3f43,.2,.6),cableB:K.mat(0x222a44,.1,.7),wood:K.mat(0xc9a46a,0,.8),led:K.mat(0x1d1f22,.2,.4,{emissive:0x3fa66b,emissiveIntensity:1}),
  screenBack:K.mat(0x1b1d1f,.3,.6),glow:K.mat(0x1a2a36,0,.6,{emissive:0x8fd1ff,emissiveIntensity:.35}),lampOff:K.mat(0xcfd4d8,.1,.4),lampG:K.mat(0x3fa66b,0,.4,{emissive:0x3fa66b,emissiveIntensity:.9}),lampA:K.mat(0xd8a531,0,.4,{emissive:0xd8a531,emissiveIntensity:.6})};
 const grp=(parent,x,y,z,ry=0)=>{const g=new T.Group();g.position.set(x,y,z);g.rotation.y=ry;parent.add(g);return g};
 const handle=(parent,x,y,z,len=.2,vertical=true,material=M.steel)=>{const g=grp(parent,x,y,z);const a=vertical?'y':'x';K.cyl(.012,len,material,0,0,.03,g,a,8);K.cyl(.01,.035,material,vertical?0:-len/2+.02,vertical?len/2-.02:0,.015,g,'z',8);K.cyl(.01,.035,material,vertical?0:len/2-.02,vertical?-len/2+.02:0,.015,g,'z',8);return g};
 const hinge=(parent,x,y,z,n=2,span=.6)=>{for(let i=0;i<n;i++)K.cyl(.012,.06,M.dark,x,y-span/2+i*span/(Math.max(1,n-1)),z,parent,'y',8)};
 const feet=(parent,w,d,h=.06,inset=.08,material=M.dark)=>{for(const sx of[-1,1])for(const sz of[-1,1])K.cyl(.035,h,material,sx*(w/2-inset),h/2,sz*(d/2-inset),parent,'y',10);};
 const castors=(parent,w,d,inset=.1,r=.045)=>{for(const sx of[-1,1])for(const sz of[-1,1]){const x=sx*(w/2-inset),z=sz*(d/2-inset);K.cyl(r,.03,P.rubber,x,r,z,parent,'x',12);K.box(.03,.05,.05,M.steel,x,r*2+.02,z,parent)}};
 const legs=(parent,w,d,h,size=.04,material=M.steel,inset=.04)=>{for(const sx of[-1,1])for(const sz of[-1,1])K.box(size,h,size,material,sx*(w/2-inset-size/2),h/2,sz*(d/2-inset-size/2),parent)};
 // A screen (dark bezel, lit panel) on a face at +z; draw(ctx,W,H) paints the content, default a catalogue card.
 const screen=(parent,x,y,z,w=.32,h=.21,draw=null,ry=0)=>{const g=grp(parent,x,y,z,ry);K.box(w,h,.025,P.screenBack,0,0,0,g);const t=draw?K.canvasTex(512,Math.round(512*h/w),draw):null;
  K.box(w-.03,h-.03,.004,t?K.mat(0xffffff,0,.6,{map:t,emissive:0xffffff,emissiveMap:t,emissiveIntensity:.55}):P.glow,0,0,.014,g);return g};
 const card=s=>(x,W,H)=>{const i=s.info||{};x.fillStyle='#16191b';x.fillRect(0,0,W,H);x.fillStyle='#3fa66b';x.fillRect(0,0,W,12);x.fillStyle='#ecebe5';x.font='600 36px '+FONT;x.textBaseline='top';x.fillText(s.type||'',22,26,W-44);
  x.font='500 24px '+MONO;[['Lot',s.lot||'—'],['Year',s.year||'—'],['Weight',i.weight||'—'],['Power',i.power||'—']].forEach(([k,v],n)=>{x.fillStyle='#b9b7b0';x.fillText(k,22,86+n*44);x.fillStyle='#ecebe5';x.fillText(String(v),150,86+n*44,W-170)})};
 const keypad=(parent,x,y,z,cols=4,rows=3,size=.025)=>{for(let i=0;i<cols;i++)for(let j=0;j<rows;j++)K.box(size,size,.012,j==0&&i==0?P.green:j==0&&i==1?P.red:P.light,x+(i-(cols-1)/2)*size*1.5,y+(j-(rows-1)/2)*size*1.5,z,parent)};
 const estop=(parent,x,y,z,ry=0)=>{const g=grp(parent,x,y,z,ry);K.cyl(.035,.012,P.yellow,0,0,0,g,'z',16);K.cyl(.022,.025,P.red,0,0,.012,g,'z',16);return g};
 const lampTower=(parent,x,y,z,state='g')=>{const g=grp(parent,x,y,z);K.cyl(.012,.3,M.steel,0,.15,0,g,'y',8);K.cyl(.028,.03,M.dark,0,.31,0,g,'y',12);const lamps=[];
  [[P.lampG,state==='g'],[P.lampA,state==='a'],[P.lampOff,false]].forEach(([m,on],i)=>{const l=K.cyl(.028,.07,on?m:P.lampOff,0,.36+i*.075,0,g,'y',12);lamps.push(l)});K.cyl(.028,.02,M.dark,0,.6,0,g,'y',12);return {group:g,lamps}};
 let grilleT=null,warnT=null;
 const grille=(parent,w,h,x,y,z,ry=0)=>{grilleT=grilleT||K.canvasTex(128,128,(c,W,H)=>{c.fillStyle='#b9bec2';c.fillRect(0,0,W,H);for(let yy=10;yy<H-8;yy+=12){c.fillStyle='#4b5560';c.fillRect(10,yy,W-20,5);c.fillStyle='rgba(255,255,255,.35)';c.fillRect(10,yy+5,W-20,2)}c.strokeStyle='#8b9196';c.lineWidth=6;c.strokeRect(3,3,W-6,H-6)});
  const m=new T.Mesh(K.keep(new T.PlaneGeometry(w,h)),K.mat(0xffffff,.3,.5,{map:grilleT}));m.position.set(x,y,z);m.rotation.y=ry;parent.add(m);return m};
 const warn=(parent,x,y,z,ry=0,size=.12)=>{warnT=warnT||K.canvasTex(128,128,(c,W,H)=>{c.fillStyle='#e3b82e';c.beginPath();c.moveTo(64,8);c.lineTo(122,116);c.lineTo(6,116);c.closePath();c.fill();c.strokeStyle='#1c1b18';c.lineWidth=7;c.stroke();c.fillStyle='#1c1b18';c.fillRect(58,40,12,42);c.fillRect(58,90,12,12)});
  const m=new T.Mesh(K.keep(new T.PlaneGeometry(size,size)),K.mat(0xffffff,0,.6,{map:warnT,transparent:true}));m.position.set(x,y,z);m.rotation.y=ry;parent.add(m);return m};
 // Maker nameplate: MAKE big, model under it, lot number right. w×h metres on a face at +z (ry rotates it).
 const nameplate=(parent,s,x,y,z,w=.6,h=.15,ry=0)=>{const words=String(s.name||'').replace(/\s+/g,' ').trim().split(' ');let make=s.make||words[0]||'',model=s.model||words.slice(1).join(' ');
  if(/^(ki|koh|the|itw|samsung|carl|müller|mueller|ta|ts|na|cm|won|vary)$/i.test(make)&&words[1]){make=words.slice(0,2).join(' ');model=words.slice(2).join(' ')}
  const t=K.canvasTex(512,Math.round(512*h/w),(c,W,H)=>{c.fillStyle='#2b2d30';c.fillRect(0,0,W,H);c.fillStyle='#d9824a';c.fillRect(0,0,10,H);c.strokeStyle='rgba(255,255,255,.18)';c.lineWidth=3;c.strokeRect(4,4,W-8,H-8);
   c.fillStyle='#f2f1ec';c.textBaseline='middle';c.font=`700 ${Math.round(H*.34)}px ${FONT}`;c.fillText(make.toUpperCase(),28,H*.32,W-50);c.fillStyle='#c9ccce';c.font=`500 ${Math.round(H*.24)}px ${FONT}`;c.fillText(model||' ',28,H*.7,W-170);
   if(s.lot){c.fillStyle='#9aa3ab';c.font=`500 ${Math.round(H*.18)}px ${MONO}`;c.textAlign='right';c.fillText(String(s.lot),W-22,H*.72);c.textAlign='left'}});
  const m=new T.Mesh(K.keep(new T.PlaneGeometry(w,h)),K.mat(0xffffff,.1,.5,{map:t}));m.position.set(x,y,z);m.rotation.y=ry;parent.add(m);return m};
 const BRAND=[[/koh ?young/i,0x0e5aa7],[/ekra/i,0x1a4f9c],[/heller/i,0xb0202a],[/samsung|hanwha/i,0x1428a0],[/parmi/i,0x2a7fbd],[/yamaha/i,0x5b2e91],[/panasonic/i,0x1b4ea3],[/juki/i,0x1f6fb5],[/fuji/i,0x1c7c3c],[/engel/i,0x2f7a3a],[/kuka/i,0xe8772e],[/fanuc/i,0xe9c12f],[/trumpf/i,0x2b7fbd],[/zeiss/i,0x0f4c81],[/ki ?heung/i,0x0b6e8a],[/shini/i,0x2f6fb0],[/yudo/i,0xc14a2b],[/tektronix/i,0x1f5fa8],[/yokogawa/i,0xf0a61a],[/keyence/i,0x1a3f8c],[/zebra/i,0x1c1d1f],[/jungheinrich/i,0xe8a000],[/kalmar/i,0xb9233a],[/siat|smipack|feifer/i,0x2b5fb3],[/thimon/i,0x1d7448],[/schlick|spencer/i,0x4f5b66],[/moretto/i,0x1f6fb5],[/olympus|hirox/i,0x2b2d30],[/konica/i,0x0a4e9c],[/shimadzu/i,0xb3202a],[/famecs/i,0x2a7fbd]];
 const brand=name=>{for(const[re,c]of BRAND)if(re.test(name||''))return c;return 0x3b5bab};
 const logoBand=(parent,s,w,x,y,z,h=.06)=>K.box(w,h,.012,K.mat(brand(s.name),.2,.5),x,y,z,parent);
 // Cable chain (energy chain) along x between two points, with links.
 const cableChain=(parent,x0,x1,y,z,material=P.black)=>{const n=Math.max(3,Math.round(Math.abs(x1-x0)/.08));for(let i=0;i<n;i++)K.box(.07,.035,.05,material,x0+(x1-x0)*(i+.5)/n,y,z,parent);return parent};
 const hose=(parent,points,r=.018,material=P.hose)=>K.pipe(points,r,material,parent);
 const pallet=(parent,x,y,z,w=1.2,d=.8)=>{const g=grp(parent,x,y,z);for(const sz of[-1,0,1])K.box(w,.08,.1,P.wood,0,.04,sz*(d/2-.05),g);for(let i=0;i<5;i++)K.box(.1,.06,d,P.wood,-w/2+.05+i*(w-.1)/4,.11,0,g);for(const sz of[-1,1])K.box(w,.02,.1,P.wood,0,.15,sz*(d/2-.05),g);return g};
 const pcb=(parent,x,y,z,w=.3,d=.2)=>{const m=K.box(w,.004,d,P.pcb,x,y,z,parent);m.castShadow=false;return m};
 // Magazine rack of PCBs: an aluminium frame with slots and n green boards.
 const magazine=(parent,x,y,z,w=.36,h=.56,d=.32,n=12)=>{const g=grp(parent,x,y,z);for(const sx of[-1,1]){K.box(.015,h,d,P.alu,sx*(w/2-.008),h/2,0,g)}K.box(w,.015,d,P.alu,0,h-.008,0,g);K.box(w,.015,d,P.alu,0,.008,0,g);
  for(let i=0;i<n;i++)pcb(g,0,.05+i*(h-.1)/n,0,w-.04,d-.04);return g};
 // Aluminium profile frame (open box of struts) w×h×d at (x,y,z) with y the floor.
 const frame=(parent,w,h,d,x,y,z,size=.04,material=P.alu)=>{const g=grp(parent,x,y,z);for(const sx of[-1,1])for(const sz of[-1,1])K.box(size,h,size,material,sx*(w/2-size/2),h/2,sz*(d/2-size/2),g);
  for(const sy of[size/2,h-size/2])for(const sz of[-1,1])K.box(w,size,size,material,0,sy,sz*(d/2-size/2),g);for(const sy of[size/2,h-size/2])for(const sx of[-1,1])K.box(size,size,d,material,sx*(w/2-size/2),sy,0,g);return g};
 // Hinged door panel on a face at +z: panel, seam lines, handle; glass=true shows a window.
 const door=(parent,w,h,x,y,z,material=P.white,glass=false,handleSide=1)=>{const g=grp(parent,x,y,z);K.box(w,h,.02,material,0,0,0,g);K.box(w+.01,h+.01,.004,P.dark,0,0,-.012,g);
  if(glass){K.box(w*.78,h*.6,.012,P.tint,0,h*.08,.012,g);K.box(w*.8,h*.62,.006,P.dark,0,h*.08,.008,g)}handle(g,handleSide*(w/2-.07),-h*.1,.03,.18,true);hinge(g,-handleSide*(w/2-.015),0,.012,2,h*.7);return g};
 const fan=(parent,x,y,z,r=.12,axis='z')=>{const g=grp(parent,x,y,z);K.cyl(r+.02,.02,P.dark,0,0,0,g,axis,20);const rot=new T.Group();g.add(rot);for(let i=0;i<5;i++){const b=K.box(r*.9,.03,.01,P.grey,0,0,0,rot);b.position.set(Math.cos(i*1.257)*r*.45,Math.sin(i*1.257)*r*.45,.012);b.rotation.z=i*1.257}
  for(let i=0;i<3;i++)K.torus(r*.3+i*r*.28,.006,P.dark,0,0,.022,g,'z',24);return rot};
 const label=(parent,text,w,h,x,y,z,bg='#1c1b18',fg='#ecebe5',ry=0)=>K.plate(parent,text,w,h,x,y,z,bg,fg,ry);
 return {P,grp,handle,hinge,feet,castors,legs,screen,card,keypad,estop,lampTower,grille,warn,nameplate,brand,logoBand,cableChain,hose,pallet,pcb,magazine,frame,door,fan,label};
};
})();
