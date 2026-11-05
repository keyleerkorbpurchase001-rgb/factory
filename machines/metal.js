// Metal / tool shop / mould shop machines for the portal (window.MB builders): monorail shot blasting system, Trumpf
// TruLaser Cell 3D laser cells, horizontal band saws, bench mill-drills, quick mould change system, Moretto vacuum
// filter unit, workshop benches and granite surface plates.
// Built at the origin in metres, floor y=0, operator front towards +z, length along x (see machines/KINDS.md).
(function(){
'use strict';
const PI=Math.PI;
const setup=(K,s,def)=>{const H=MB.H(K);return {H,P:H.P,M:K.M,T:K.THREE,g:new K.THREE.Group(),o:Object.assign({},def,s.opts||{})}};
// how many units stand in the row: opts.count when the rules set one, else the lot count (at least the kind's default)
const units=(s,o,def,max)=>{const v=(s.opts&&s.opts.count!=null)?+s.opts.count:Math.max(def,+s.count||1);return Math.min(max,Math.max(1,v||def))};
// --- decals and textures used only in this family ---------------------------------------------------------------
const plane=(K,parent,w,h,material,x,y,z,ry=0,rx=0)=>{const m=new K.THREE.Mesh(K.keep(new K.THREE.PlaneGeometry(w,h)),material);m.position.set(x,y,z);m.rotation.set(rx,ry,0);parent.add(m);return m};
// yellow/black hazard stripes on a face (plane facing +z; ry/rx rotate it)
const hazard=(K,parent,w,h,x,y,z,ry=0,rx=0)=>{const a=Math.max(1,w/h),t=K.canvasTex(Math.round(64*a),64,(c,W,Hh)=>{c.fillStyle='#e3b82e';c.fillRect(0,0,W,Hh);c.fillStyle='#1c1b18';for(let x0=-Hh;x0<W+Hh;x0+=Hh){c.beginPath();c.moveTo(x0,0);c.lineTo(x0+Hh/2,0);c.lineTo(x0-Hh/2,Hh);c.lineTo(x0-Hh,Hh);c.closePath();c.fill()}});
 return plane(K,parent,w,h,K.mat(0xffffff,.1,.6,{map:t}),x,y,z,ry,rx)};
// a lit digit display on a face at +z
const disp=(K,parent,text,w,h,x,y,z,fg='#5cf07a',bg='#141516',ry=0)=>{const t=K.canvasTex(256,Math.round(256*h/w),(c,W,Hh)=>{c.fillStyle=bg;c.fillRect(0,0,W,Hh);c.fillStyle=fg;c.font=`700 ${Math.round(Hh*.62)}px ui-monospace, monospace`;c.textAlign='right';c.textBaseline='middle';c.fillText(text,W-14,Hh/2+2)});
 return plane(K,parent,w,h,K.mat(0xffffff,0,.5,{map:t,emissive:0xffffff,emissiveMap:t,emissiveIntensity:.7}),x,y,z,ry)};
// panel seam: a thin dark line on a face (vertical by default), rotated ry about its centre
const seam=(K,parent,len,x,y,z,material,vertical=true,ry=0)=>{const m=K.box(vertical?.012:len,vertical?len:.012,.006,material,x,y,z,parent);m.rotation.y=ry;m.castShadow=false;return m};
// bolt heads on a face at +z (local), points [[x,y],…]
const bolts=(K,parent,pts,z,material,r=.012)=>{for(const [x,y] of pts)K.cyl(r,.012,material,x,y,z,parent,'z',6)};
// speckled stone / cast material
const speckle=(K,base,dots,n=900,size=3)=>{const t=K.canvasTex(256,256,(c,W,Hh)=>{c.fillStyle=base;c.fillRect(0,0,W,Hh);for(let i=0;i<n;i++){c.fillStyle=dots[i%dots.length];const r=1+Math.random()*size;c.fillRect(Math.random()*W,Math.random()*Hh,r,r)}});t.wrapS=t.wrapT=K.THREE.RepeatWrapping;return K.mat(0xffffff,.05,.5,{map:t})};
// perforated pegboard material
const pegboard=(K,color='#2e62b3')=>{const t=K.canvasTex(256,128,(c,W,Hh)=>{c.fillStyle=color;c.fillRect(0,0,W,Hh);c.fillStyle='#17305c';for(let y=8;y<Hh;y+=16)for(let x=8;x<W;x+=16){c.beginPath();c.arc(x,y,3,0,PI*2);c.fill()}});t.wrapS=t.wrapT=K.THREE.RepeatWrapping;t.repeat.set(4,2);return K.mat(0xffffff,.3,.55,{map:t})};
// square hopper (inverted pyramid) with half-side a at the top and b at the bottom, built with its corners on the diagonals
// so its bounding box stays tight (a rotated 4-segment cone would inflate the station's size estimate)
const hopper=(K,parent,a,b,h,material,x,y,z)=>{const T=K.THREE,m=new T.Mesh(K.keep(new T.CylinderGeometry(a*Math.SQRT2,b*Math.SQRT2,h,4,1,false,PI/4)),material);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;parent.add(m);return m};
// an electric motor along an axis: body with cooling fins, terminal box, fan cowl at the far end; returns the fan group
const motor=(K,H,parent,r,len,material,x,y,z,axis='z',dark)=>{const g=H.grp(parent,x,y,z);if(axis==='x')g.rotation.y=PI/2;if(axis==='y')g.rotation.x=-PI/2;
 K.cyl(r,len,material,0,0,0,g,'z',20);for(let i=0;i<4;i++)K.torus(r+.004,.006,material,0,0,-len/2+.15*len+i*len*.2,g,'z',20);K.box(r*.7,r*.5,r*.8,dark,0,r+r*.2,-len*.1,g);
 K.cyl(r*1.05,.04,dark,0,0,len/2+.02,g,'z',20);const f=H.fan(g,0,0,len/2+.05,r*.75,'z');return {group:g,fan:f}};

// === shotBlast: Spencer & Halstead / Schlick monorail shot blasting system (opts.wheels blast wheels) ==============
MB.add('shotBlast',(K,s)=>{const {H,P,M,T,g,o}=setup(K,s,{wheels:8});const n=Math.min(12,Math.max(4,Math.round(+o.wheels||8)));
 const body=K.mat(0x4b5b53,.35,.6),dk=K.mat(0x30393a,.4,.6),blue=K.mat(0x2f5fa6,.4,.5),guard=K.mat(0x454b50,.5,.5),galv=K.mat(0xaab0b4,.6,.45),rub=P.rubber,cast=K.mat(0x5a5f63,.5,.6);
 const cw=3.2,cd=1.8,ch=2.6,y0=.7,yt=y0+ch;const cab=H.grp(g,0,0,0);
 // --- blast cabinet on four legs, the abrasive hopper and screw conveyor under its floor
 K.box(cw,ch,cd,body,0,y0+ch/2,0,cab);
 for(const sx of[-1,1])for(const sz of[-1,1]){K.box(.18,y0,.18,dk,sx*(cw/2-.25),y0/2,sz*(cd/2-.25),cab);K.box(.34,.03,.34,dk,sx*(cw/2-.25),.015,sz*(cd/2-.25),cab)}
 hopper(K,cab,.78,.13,.48,dk,0,y0-.24,0);K.cyl(.12,.3,dk,0,.2,0,cab,'y',12);
 K.pipe([[0,.2,0],[-1.3,.2,0],[-2.0,.2,-.45],[-2.45,.25,-.6]],.09,dk,cab);K.cyl(.1,.2,galv,-2.5,.25,-.6,cab,'x',12);
 // panel seams, bolt rows and the kick band on both long faces
 for(const sz of[-1,1]){const z=sz*(cd/2+.004);for(const x of[-.8,0,.8])seam(K,cab,ch-.1,x,y0+ch/2,z,dk);seam(K,cab,cw-.1,0,2.1,z,dk,false);
  const pts=[];for(let i=0;i<9;i++){pts.push([-1.5+i*.375,y0+.08]);pts.push([-1.5+i*.375,yt-.08])}bolts(K,cab,pts,z,M.steel);}
 for(const sx of[-1,1]){const x=sx*(cw/2+.004);for(const z of[-.45,.45])seam(K,cab,ch-.1,x,y0+ch/2,z,dk,true,PI/2);}
 // vestibules at both ends: the monorail tunnel closed by rubber curtain strips
 for(const sx of[-1,1]){const vx=sx*(cw/2+.25);K.box(.5,1.65,.9,body,vx,2.725,0,cab);K.box(.52,.06,.94,dk,vx,3.55,0,cab);
  const fx=sx*(cw/2+.5);K.box(.04,1.65,.06,dk,fx+sx*.01,2.725,.46,cab);K.box(.04,1.65,.06,dk,fx+sx*.01,2.725,-.46,cab);K.box(.04,.08,.98,dk,fx+sx*.01,3.5,0,cab);
  for(let i=0;i<9;i++)K.box(.02,1.5,.092,rub,fx+sx*(.03+(i%2)*.022),2.74,-.4+i*.1,cab);}
 // --- monorail I-beam through the tunnel housing on the roof, on two portal frames
 K.box(cw,.4,.5,body,0,3.5,0,cab);for(const sz of[-1,1])seam(K,cab,cw-.1,0,3.5,sz*.254,dk,false);
 for(const y of[3.52,3.28])K.box(5.8,.03,.18,galv,0,y,0,g);K.box(5.8,.21,.03,galv,0,3.4,0,g);
 for(const sx of[-1,1]){for(const sz of[-1,1]){K.box(.12,3.16,.12,galv,sx*2.9,1.58,sz*.65,g);K.box(.3,.02,.3,dk,sx*2.9,.01,sz*.65,g)}K.box(.12,.12,1.42,galv,sx*2.9,3.22,0,g);
  K.box(.14,.14,.3,galv,sx*2.9,3.4,0,g)}
 // hanging work on hook bars: two trolleys outside the vestibules travel on the beam
 const trolleys=[];for(const sx of[-1,1]){const tr=H.grp(g,sx*2.5,0,0);trolleys.push(tr);
  K.box(.2,.12,.24,dk,0,3.6,0,tr);for(const sz of[-1,1])K.cyl(.045,.03,M.steel,0,3.6,sz*.12,tr,'z',12);K.cyl(.015,1.2,M.steel,0,2.9,0,tr,'y',8);
  K.box(.7,.04,.04,M.steel,0,2.3,0,tr);for(let i=0;i<3;i++){const x=-.3+i*.3;K.cyl(.01,.3,M.steel,x,2.15,0,tr,'y',6);K.torus(.03,.008,M.steel,x,2.02,0,tr,'z',10);
   if(i%2)K.box(.18,.4,.12,cast,x,1.78,0,tr);else K.cyl(.09,.36,cast,x,1.8,0,tr,'y',14)}}
 // --- blast wheels: blue motors with their guards on the sides and the roof, fed from the separator
 const fans=[];const wheel=(x,y,z,face)=>{const w=H.grp(cab,x,y,z);if(face==='b')w.rotation.y=PI;if(face==='t')w.rotation.x=-PI/2;
  K.cyl(.27,.24,guard,0,0,.12,w,'z',20);K.cyl(.3,.03,dk,0,0,.255,w,'z',20);const pts=[];for(let i=0;i<8;i++)pts.push([Math.cos(i*PI/4)*.285,Math.sin(i*PI/4)*.285]);bolts(K,w,pts,.272,M.steel);
  K.cyl(.2,.05,dk,0,0,.295,w,'z',16);const m=motor(K,H,w,.165,.4,blue,0,0,.52,'z',dk);fans.push(m.fan);
  K.plate(w,'WHEEL',.14,.05,0,-.1,.245,'#1c1b18','#e3b82e');
  if(face!=='t')K.pipe([[0,.62,-.02],[0,.5,.1],[0,.33,.12]],.035,galv,w);return w};
 const nSide=Math.min(3,Math.floor(n/3)),nRoof=n-2*nSide,sideX={1:[0],2:[-.7,.7],3:[-1.0,0,1.0]}[nSide]||[];
 for(const x of sideX){wheel(x,1.35,cd/2,'f');wheel(x,1.35,-cd/2,'b')}
 const roofX=[-.4,.4,1.2],roofPos=[];for(let i=0;i<nRoof;i++)roofPos.push([roofX[i%3],i<3?.55:-.55]);for(const [x,z] of roofPos)wheel(x,yt,z,'t');
 // --- bucket elevator tower (back left), separator on the roof, abrasive manifold to the roof wheels
 const ex=-2.45,ez=-.6;K.box(.5,3.9,.5,body,ex,1.95,ez,g);K.box(.62,.42,.62,dk,ex,3.79,ez,g);K.box(.7,.4,.6,dk,ex,.2,ez,g);
 for(let i=0;i<3;i++)seam(K,g,.46,ex,1.0+i*1.0,ez+.254,dk,false);H.door(g,.3,.4,ex,2.3,ez+.254,body,false,1).scale.set(1,1,.5);
 for(const y of[1.5,3.0]){const pts=[];for(let i=0;i<3;i++)pts.push([-.2+i*.2,y]);bolts(K,g,pts,ez+.254,M.steel)}
 K.box(.1,2.6,.08,dk,ex+.3,2.0,ez,g);K.cyl(.05,.05,dk,ex,3.79,ez+.33,g,'z',10);
 const sx0=-1.1,sz0=-.6;K.box(.8,.55,.6,dk,sx0,yt+.275,sz0,g);K.box(.84,.04,.64,body,sx0,yt+.55,sz0,g);K.cyl(.1,.12,galv,sx0+.25,yt+.6,sz0,g,'y',12);
 K.pipe([[ex,3.95,ez],[-1.9,4.0,ez],[sx0,4.0,sz0],[sx0,yt+.56,sz0]],.08,galv,g);
 if(roofPos.length){K.pipe([[sx0+.4,yt+.3,sz0],[sx0+.6,yt+.55,sz0+.2],[sx0+.7,yt+.55,0],[1.3,yt+.55,0]],.05,galv,g);
  for(const [x,z] of roofPos)K.pipe([[x,yt+.55,0],[x,yt+.55,z*.6],[x,yt+.3,z],[x,yt+.15,z]],.03,galv,g)}
 // --- dust collector cabinet behind the right end: cartridge housing on legs, hopper, dust drum, fan and stack
 const dx=2.1,dz=-1.35,dc=H.grp(g,dx,0,dz);K.box(1.0,2.4,.9,body,0,1.9,0,dc);for(const sx of[-1,1])for(const sz of[-1,1])K.box(.08,.7,.08,dk,sx*.42,.35,sz*.37,dc);
 hopper(K,dc,.43,.1,.35,dk,0,.525,0);K.cyl(.2,.35,galv,0,.175,0,dc,'y',18);K.torus(.2,.01,dk,0,.33,0,dc,'y',18);
 K.box(.5,.35,.5,dk,0,3.27,0,dc);const dm=motor(K,H,dc,.12,.3,blue,.1,3.6,0,'y',dk);fans.push(dm.fan);
 K.cyl(.1,.5,galv,-.3,3.7,0,dc,'y',14);K.cyl(.16,.06,dk,-.3,3.96,0,dc,'y',14,.08);
 const df=H.grp(dc,0,0,.454);H.door(df,.4,1.2,-.25,1.7,0,body,false,1);H.door(df,.4,1.2,.25,1.7,0,body,false,-1);K.cyl(.05,.02,P.white,-.3,2.75,.01,df,'z',14);K.cyl(.055,.01,dk,-.3,2.75,.004,df,'z',14);
 H.warn(df,.3,2.75,.012,0,.12);K.plate(df,'DUST COLLECTOR',.7,.08,0,2.95,.01,'#1c1b18','#ecebe5');
 for(let i=0;i<4;i++)seam(K,dc,.96,-.36+i*.24,2.5,-.454,dk);K.pipe([[-.45,2.95,-.3],[-.45,2.95,.3]],.025,galv,dc);
 K.pipe([[.8,yt+.02,-.82],[.8,3.6,-.82],[.8,3.6,dz],[dx-.7,3.6,dz],[dx-.5,3.3,dz],[dx-.24,3.27,dz]],.14,galv,g);
 // --- maintenance platform along the back face with a stair at the left end
 K.platform(g,cw,.6,0,2.0,-cd/2-.3,'new');const st=K.stair(g,-3.1,0,-cd/2-.3,2.0,.6);st.scale.x=.7;
 // --- control cabinet at the front left with the cable tray and drops to the front wheels
 const cc=H.grp(g,-2.4,0,.95);K.box(.8,1.75,.35,P.light,0,.975,0,cc);K.box(.84,.1,.39,dk,0,.05,0,cc);H.door(cc,.7,1.3,0,1.0,.176,P.light,false,1);
 H.screen(cc,0,1.45,.19,.32,.21,H.card(s));H.keypad(cc,-.12,1.08,.19,4,3,.024);H.estop(cc,.22,1.08,.2);H.lampTower(cc,.25,1.85,-.05);
 H.logoBand(cc,s,.76,0,1.72,.182,.06);H.nameplate(cc,s,0,.55,.182,.6,.15);H.warn(cc,-.25,1.08,.19,0,.1);
 K.box(cw,.08,.1,galv,0,2.9,cd/2+.05,cab);
 K.pipe([[-2.0,1.8,.95],[-2.0,2.4,.9],[-1.6,2.86,.98]],.02,P.black,g);for(const x of sideX)K.pipe([[x,2.86,cd/2+.06],[x,2.0,cd/2+.15],[x,1.55,cd/2+.5]],.015,P.black,cab);
 // --- plates and labels on the cabinet front
 H.nameplate(cab,s,.2,2.25,cd/2+.01,1.1,.26);K.plate(cab,'SHOT BLAST',.9,.1,.2,2.55,cd/2+.01,'#e3b82e','#1c1b18');H.logoBand(cab,s,cw-.2,0,yt-.14,cd/2+.004,.1);
 H.warn(cab,-1.3,2.3,cd/2+.01,0,.16);H.warn(cab,1.4,2.3,cd/2+.01,0,.16);H.door(cab,.6,.8,-1.0,2.6,cd/2+.01,body,true,1);
 hazard(K,g,.6,.08,0,.05,-cd/2-.6+.005);
 return {group:g,height:4.0,update:(t,running)=>{if(!running)return;for(const f of fans)f.rotation.z=t*9;const d=.25*Math.sin(t*.3);trolleys[0].position.x=-2.5+d;trolleys[1].position.x=2.5-d}};
});

// === laserCell: Trumpf TruLaser Cell 8030 / 7040 5-axis 3D laser cell (opts.count cells side by side) ==============
function laserCell(K,s,H,P,M,root,x0,anim){
 const g=H.grp(root,x0,0,0);const pan=K.mat(0xdad9d2,.2,.55),pan2=K.mat(0xcbcbc4,.2,.55),blue=K.mat(0x2b7fbd,.3,.5),dk=P.dark,inner=K.mat(0x3a3e42,.3,.7),steel=M.steel,
  green=K.mat(0x7fb08a,.1,.1,{transparent:true,opacity:.5,depthWrite:false}),fibre=K.mat(0xf2c21b,.1,.5),lt=K.mat(0xb9bec2,.4,.5);
 const W=8,D=3.4,Hh=3.1,zc=.2,zf=zc+D/2,zb=zc-D/2,xl=-4.2,xr=3.8,th=.08,ox0=-1.0,ox1=2.6;
 // --- cabin: back wall, end walls, roof, the front wall round the door opening, the inner floor plate
 K.box(W,Hh,th,pan,-.2,Hh/2,zb+th/2,g);for(const sx of[-1,1])K.box(th,Hh,D,pan,sx>0?xr-th/2:xl+th/2,Hh/2,zc,g);K.box(W,th,D,pan2,-.2,Hh-th/2,zc,g);K.box(W-.2,.02,D-.2,inner,-.2,.02,zc,g);
 K.box(ox0-xl,Hh,th,pan,(xl+ox0)/2,Hh/2,zf-th/2,g);K.box(xr-ox1,Hh,th,pan,(ox1+xr)/2,Hh/2,zf-th/2,g);K.box(ox1-ox0,Hh-2.6,th,pan,(ox0+ox1)/2,(Hh+2.6)/2,zf-th/2,g);K.box(ox1-ox0,.3,th,pan,(ox0+ox1)/2,.15,zf-th/2,g);
 K.box(.06,2.3,.1,dk,ox0-.03,1.45,zf-.04,g);K.box(.06,2.3,.1,dk,ox1+.03,1.45,zf-.04,g);K.box(ox1-ox0+.12,.06,.1,dk,(ox0+ox1)/2,2.63,zf-.04,g);
 // seams, kick band, bolt rows on the outside faces
 for(const x of[-3.2,-2.2,3.2])seam(K,g,Hh-.4,x,Hh/2,zf+.004,dk);for(let i=1;i<8;i++)seam(K,g,Hh-.4,xl+i*1.0,Hh/2,zb-.004,dk);
 for(const sx of[-1,1])for(const z of[-.9,.2,1.3])seam(K,g,Hh-.4,sx>0?xr+.004:xl-.004,Hh/2,z,dk,true,PI/2);
 K.box(W,.25,.006,dk,-.2,.13,zf+.004,g);K.box(W,.25,.006,dk,-.2,.13,zb-.004,g);for(const sx of[-1,1])K.box(.006,.25,D,dk,sx>0?xr+.004:xl-.004,.13,zc,g);
 // --- sliding door on its top rail, slid open to the left; green viewing window, handle, model plate
 const dxc=(ox0+ox1)/2-2.0,door=H.grp(g,dxc,0,zf+.05);K.box(3.6,2.3,.06,pan,0,1.45,0,door);K.box(3.62,.06,.08,dk,0,2.59,0,door);K.box(3.62,.06,.08,dk,0,.31,0,door);
 K.box(1.6,.8,.02,green,.3,1.75,.035,door);K.box(1.66,.86,.012,dk,.3,1.75,.028,door);K.box(1.5,.7,.004,K.mat(0x1c2a22,.2,.5),.3,1.75,.044,door).castShadow=false;
 H.handle(door,1.65,1.3,.03,.3,true);H.warn(door,1.4,1.95,.034,0,.14);K.plate(door,s.model||'TruLaser Cell',1.5,.14,-.9,1.1,.034,'#dad9d2','#2b7fbd');K.plate(door,'LASER CLASS 1',.7,.07,-.9,.9,.034,'#e3b82e','#1c1b18');
 for(const x of[-1.5,-.2,1.5])K.box(.12,.1,.12,dk,x,2.68,-.02,door);for(const x of[-1.5,-.2,1.5])K.cyl(.045,.03,steel,x,2.75,.0,door,'z',12);
 K.box(7.2,.1,.14,lt,-.6,2.77,zf+.09,g);K.box(7.2,.04,.06,dk,-.6,.3,zf+.07,g);
 // --- interior: fixture table, gantry on two rails, cross bridge, saddle, z-ram and the 5-axis head; ceiling lamps
 K.box(.9,.72,.8,inner,1.4,.36,.4,g);K.box(2.0,.08,1.0,steel,1.4,.76,.4,g);for(let i=0;i<4;i++)K.box(1.9,.004,.02,dk,1.4,.803,.1+i*.2,g);
 K.box(1.0,.25,.55,dk,1.4,.925,.4,g);K.box(.9,.03,.45,K.mat(0x8a8f94,.6,.4),1.4,1.065,.4,g);for(const sx of[-1,1])for(const sz of[-1,1])K.box(.08,.1,.06,M.red,1.4+sx*.42,1.1,.4+sz*.2,g);
 for(const z of[zb+.35,zf-.35]){K.box(W-.6,.15,.15,steel,-.2,2.3,z,g);for(const x of[-3.5,-1.5,.5,2.5])K.box(.3,.35,.14,lt,x,2.15,z+(z>zc?.12:-.12),g)}
 const bridge=H.grp(g,1.3,0,0);for(const z of[zb+.35,zf-.35])K.box(.5,.1,.25,dk,0,2.425,z,bridge);K.box(.35,.32,3.0,lt,0,2.635,zc,bridge);
 H.cableChain(bridge,-.1,.1,2.82,zc,P.black).rotation.y=0;K.box(.08,.06,2.6,P.black,.2,2.82,zc,bridge);
 const sad=H.grp(bridge,0,0,.4);K.box(.5,.5,.45,lt,0,2.63,0,sad);K.box(.16,1.1,.16,steel,0,1.95,0,sad);K.box(.2,.12,.2,dk,0,1.45,0,sad);
 const cax=H.grp(sad,0,1.33,0);K.cyl(.09,.12,dk,0,0,0,cax,'y',16);K.box(.14,.12,.1,lt,0,-.1,0,cax);K.cyl(.035,.1,steel,0,-.21,0,cax,'y',12,.012);K.box(.02,.3,.02,P.black,.1,-.05,0,cax);
 for(const x of[-1.6,1.6])K.box(2.4,.04,.12,M.lamp,x,Hh-th-.02,zc,g).castShadow=false;
 // --- front wall: fan on the lintel, swing-arm monitor, nameplate, brand band, warning labels, light-curtain posts
 const fan=H.fan(g,1.6,2.85,zf+.012,.17,'z');K.torus(.2,.01,dk,1.6,2.85,zf+.015,g,'z',24);
 K.box(.06,.06,.3,steel,3.2,2.15,zf+.14,g);H.screen(g,3.2,2.15,zf+.3,.42,.27,H.card(s));
 H.logoBand(g,s,3.4,(ox0+ox1)/2,2.9,zf+.004,.14);H.nameplate(g,s,3.2,1.3,zf+.004,.9,.22);H.warn(g,3.0,1.8,zf+.004,0,.14);H.warn(g,-3.6,1.8,zf+.004,0,.14);
 K.plate(g,'TRUMPF',.8,.2,-3.4,2.5,zf+.004,'#2b7fbd','#ffffff');H.estop(g,3.5,1.0,zf+.01);
 for(const x of[.4,2.9]){K.box(.08,1.3,.08,P.yellow,x,.65,2.3,g);hazard(K,g,.08,1.3,x,.65,2.345);K.box(.02,1.1,.03,P.black,x+(x<1?.05:-.05),.7,2.3,g);K.box(.14,.02,.14,dk,x,.01,2.3,g)}
 // --- control console at the front left corner
 const con=H.grp(g,-3.9,0,2.35);K.box(.55,.95,.45,dk,0,.475,0,con);K.box(.57,.06,.47,P.black,0,.03,0,con);const tilt=H.grp(con,0,1.2,0);tilt.rotation.x=-.4;
 K.box(.62,.52,.1,pan,0,0,0,tilt);H.screen(tilt,0,.07,.055,.42,.26,H.card(s));H.keypad(tilt,-.08,-.16,.055,6,2,.024);H.estop(tilt,.22,-.16,.06);K.torus(.06,.012,dk,.34,0,0,tilt,'x',16);
 H.logoBand(tilt,s,.5,0,.22,.052,.04);H.hose(g,[[-3.9,.5,2.12],[-3.9,.4,2.0],[-3.9,.4,zf+.02]],.015,P.black);
 // --- roof: extraction duct to the dust extractor, cable tray, fan hoods, lamp tower
 K.pipe([[1.0,Hh+.02,0],[1.0,3.55,0],[1.0,3.55,-2.0],[3.0,3.55,-2.0],[3.0,2.52,-2.0]],.18,lt,g);K.box(7.0,.06,.2,lt,-.3,Hh+.03,zb+.3,g);
 for(const x of[-2.5,-.5])K.cyl(.22,.16,lt,x,Hh+.08,zc+.4,g,'y',16);const lampT=H.lampTower(g,3.4,Hh,1.5);
 // --- behind the cabin: TruDisk laser source, chiller, electrical cabinet, dust extractor
 const src=H.grp(g,-2.6,0,-2.42,PI);K.box(1.8,2.0,.9,pan,0,1.0,-.45,src);K.box(1.8,.12,.012,blue,0,1.92,.004,src);H.door(src,.8,1.6,-.45,.95,.006,pan,false,1);H.door(src,.8,1.6,.45,.95,.006,pan,false,-1);
 K.plate(src,'TruDisk',.5,.09,0,1.86,.012,'#dad9d2','#2b7fbd');disp(K,src,'LASER ON',.3,.07,-.45,1.72,.012);H.warn(src,.45,1.72,.012,0,.1);
 for(const sx of[-1,1])H.grille(src,.5,.5,sx*.9+sx*.004,1.0,-.45,sx*PI/2);K.pipe([[-2.6,2.0,-1.97],[-2.6,2.5,-1.97],[-2.6,2.5,-1.46]],.012,fibre,g);K.box(.08,.5,.08,lt,-2.6,2.25,-1.52,g);
 const chz=-1.95,ch=H.grp(g,-.3,0,chz-.4,PI);K.box(1.1,1.6,.8,P.white,0,.8,-.4,ch);K.box(1.1,.08,.84,dk,0,.04,-.4,ch);H.grille(ch,.7,.6,0,.55,.006);H.screen(ch,-.3,1.3,.006,.2,.12);K.plate(ch,'CHILLER',.5,.07,.2,1.3,.006,'#1c1b18','#ecebe5');
 H.grille(ch,.5,.6,.554,.9,-.4,PI/2);for(const z of[-2.2,-2.0])K.pipe([[-.6,1.6,z],[-.9,1.9,z],[-1.6,1.9,z],[-1.72,1.5,z]],.018,P.hose,g);
 const ec=H.grp(g,1.3,0,-2.03,PI);K.box(1.0,2.1,.5,pan,0,1.05,-.25,ec);H.door(ec,.9,1.9,0,1.05,.006,pan,false,1);H.warn(ec,.3,1.9,.012,0,.1);K.box(.5,.06,.4,lt,1.3,2.12,-1.7,g);
 const dxt=H.grp(g,3.0,0,-2.43,PI);K.box(.9,2.5,.9,pan,0,1.25,-.45,dxt);K.box(.92,.6,.92,blue,0,2.2,-.45,dxt);H.door(dxt,.7,1.0,0,1.1,.006,pan,false,1);K.box(.6,.5,.5,dk,0,.25,-.25,dxt);
 H.grille(dxt,.4,.4,0,1.9,.006);K.plate(dxt,'FILTER',.4,.07,0,2.3,.006,'#2b7fbd','#ffffff');
 anim.push((t)=>{bridge.position.x=1.3+.6*Math.sin(t*.35);sad.position.z=.4+.25*Math.sin(t*.55);cax.rotation.y=t*.8;fan.rotation.z=t*5});
 return lampT.lamps;
}
MB.add('laserCell',(K,s)=>{const {H,P,M,T,g,o}=setup(K,s,{count:1});const n=Math.min(2,Math.max(1,+o.count||1)),anim=[];let lamps;
 for(let i=0;i<n;i++)lamps=laserCell(K,s,H,P,M,g,(i-(n-1)/2)*8.6,anim)||lamps;
 return {group:g,height:3.75,lamps,update:(t,running)=>{if(!running)return;for(const f of anim)f(t)}};
});

// === bandSaw: horizontal metal band saw (Pilous ARG 300 / PROMA / Optimum), opts.count in a row ====================
MB.add('bandSaw',(K,s)=>{const {H,P,M,T,g,o}=setup(K,s,{count:1});const n=units(s,o,1,3),name=s.name||'';
 const pilous=/pilous/i.test(name),proma=/proma/i.test(name);const bowM=K.mat(pilous?0x2d63b8:proma?0x3a3d41:0x5f7d6b,.3,.5),baseM=K.mat(pilous?0x2d63b8:0x3a3d41,.3,.55),cast=K.mat(0x9a9ea2,.5,.5),dk=P.dark,steel=M.steel;
 const bows=[];
 for(let i=0;i<n;i++){const m=H.grp(g,(i-(n-1)/2)*1.75,0,0);
  // base cabinet on feet with the coolant tank door, drawer and plates
  K.box(.8,.72,.62,baseM,-.1,.42,0,m);H.feet(m,.8,.62,.06,.1);K.box(.82,.04,.64,dk,-.1,.08,0,m);H.door(m,.5,.42,-.1,.36,.311,baseM,false,1);
  K.box(.5,.1,.012,P.light,-.1,.66,.311,m);H.handle(m,-.1,.66,.32,.14,false);H.nameplate(m,s,-.1,.2,.33,.4,.1);H.logoBand(m,s,.7,-.1,.74,.31,.04);
  H.warn(m,.2,.5,.312,0,.08);K.pipe([[.2,.7,.25],[.35,.6,.4],[.35,.2,.42],[.3,.1,.31]],.012,P.hose,m);
  // table top, fixed and moving jaw with the lead screw and hand wheel, the bar under the saw
  K.box(1.1,.06,.64,cast,-.05,.81,0,m);for(const z of[-.2,.2])K.box(1.0,.004,.02,dk,-.05,.833,z,m);
  K.box(.32,.12,.05,cast,-.1,.9,-.1,m);K.box(.32,.12,.05,cast,-.1,.9,.1,m);K.cyl(.012,.3,steel,-.1,.9,.25,m,'z',8);K.torus(.07,.012,dk,-.1,.9,.4,m,'z',18);K.cyl(.01,.06,dk,-.03,.9,.43,m,'z',8);
  K.cyl(.04,1.15,K.mat(0x7d8286,.7,.4),-.55,.9,0,m,'x',14);
  // roller stand feeding the bar from the left
  K.box(.3,.04,.4,dk,-.95,.02,0,m);K.box(.05,.72,.05,dk,-.95,.4,0,m);K.box(.1,.03,.36,dk,-.95,.78,0,m);for(const sz of[-1,1])K.box(.03,.1,.03,dk,-.95,.83,sz*.17,m);K.cyl(.035,.34,steel,-.95,.86,0,m,'z',14);
  // pivot column, down-feed cylinder, control panel on its stalk, lamp
  K.box(.2,.5,.2,baseM,.38,1.09,-.22,m);K.cyl(.035,.26,steel,-.2,.97,-.25,m,'y',12);K.cyl(.015,.14,steel,-.2,1.15,-.25,m,'y',8);
  K.box(.04,.36,.04,dk,.45,1.02,-.25,m);K.box(.22,.28,.08,P.light,.45,1.3,-.25,m);H.keypad(m,.42,1.33,-.204,2,2,.03);H.estop(m,.5,1.22,-.204);disp(K,m,'300',.1,.05,.45,1.4,-.207);
  K.cyl(.012,.03,P.lampG,.52,1.41,-.204,m,'z',8);K.pipe([[.45,1.16,-.25],[.45,1.0,-.1],[.4,1.26,-.02]],.01,P.black,m);
  // the saw bow pivoting on the column: body, two band wheel housings, guides, blade, motor and gearbox
  const bow=H.grp(m,.38,1.0,-.05);bows.push(bow);K.box(1.0,.22,.14,bowM,-.5,.02,0,bow);K.box(.9,.06,.1,bowM,-.5,-.1,0,bow);
  for(const x of[-.95,-.05]){K.cyl(.19,.16,bowM,x,0,0,bow,'z',24);K.cyl(.14,.012,P.light,x,0,.085,bow,'z',24);bolts(K,bow,[[x-.1,.0],[x+.1,.0],[x,.1],[x,-.1]],.092,steel,.008)}
  K.box(.9,.01,.004,dk,-.5,-.19,0,bow);K.box(.9,.01,.004,dk,-.5,.19,0,bow);for(const x of[-.72,-.28]){K.box(.05,.2,.06,dk,x,-.2,0,bow);K.box(.02,.03,.03,steel,x,-.3,.0,bow)}
  const mo=motor(K,H,bow,.085,.26,P.black,-.05,.3,0,'y',dk);K.cyl(.02,.1,steel,.1,0,0,bow,'z',8);K.box(.1,.12,.08,dk,-.05,.14,-.06,bow);
  K.plate(bow,(s.make||'SAW').toUpperCase(),.5,.09,-.5,.04,.072,'#ffffff','#1c1b18');K.plate(bow,s.model||'ARG 300',.4,.05,-.5,-.05,.072,'#ffffff','#2d63b8');H.warn(bow,-.9,-.02,.09,0,.06);
  bow.rotation.z=.2;}
 return {group:g,height:1.55,update:(t,running)=>{if(!running)return;const a=.21+.09*Math.sin(t*.4);for(const b of bows)b.rotation.z=a}};
});

// === millDrill: Bernardo KF 25 bench mill-drill on its stand, opts.count in a row ===================================
MB.add('millDrill',(K,s)=>{const {H,P,M,T,g,o}=setup(K,s,{count:2});const n=units(s,o,2,4);
 const blue=K.mat(0x6b7fb5,.3,.5),cream=K.mat(0xe4e0d4,.1,.55),cast=K.mat(0x8d9397,.5,.5),dk=P.dark,steel=M.steel;const chucks=[];
 for(let i=0;i<n;i++){const m=H.grp(g,(i-(n-1)/2)*.95,0,0);
  // stand cabinet with the drawer and cupboard door, the cast base on top
  K.box(.5,.9,.55,blue,0,.45,0,m);K.box(.52,.05,.57,dk,0,.025,0,m);K.box(.36,.14,.012,cream,0,.78,.28,m);H.handle(m,0,.78,.288,.12,false);H.door(m,.36,.46,0,.42,.276,cream,false,1);
  H.nameplate(m,s,0,.12,.282,.36,.09);H.logoBand(m,s,.48,0,.88,.278,.03);
  K.box(.6,.08,.5,cast,0,.94,0,m);K.box(.6,.004,.5,dk,0,.981,0,m);
  // column with its rack, the head with motor, belt cover and the quill with chuck
  K.cyl(.055,1.02,cast,.05,1.49,-.15,m,'y',18);K.box(.02,.9,.02,steel,.05,1.45,-.09,m);K.cyl(.07,.04,dk,.05,2.0,-.15,m,'y',18);
  K.box(.28,.36,.34,blue,.05,1.62,-.06,m);K.box(.3,.02,.36,dk,.05,1.81,-.06,m);K.box(.2,.1,.08,cream,.05,1.67,.115,m);disp(K,m,'1250',.1,.04,.05,1.7,.157);H.keypad(m,.0,1.64,.157,2,1,.02);
  const mo=motor(K,H,m,.085,.28,P.black,.05,1.94,-.1,'y',dk);K.box(.1,.08,.12,dk,.05,1.84,.1,m);
  K.cyl(.048,.18,steel,.05,1.35,.02,m,'y',16);const ch=H.grp(m,.05,1.23,.02);chucks.push(ch);K.cyl(.032,.08,dk,0,0,0,ch,'y',14);K.cyl(.02,.02,steel,0,-.05,0,ch,'y',8);K.cyl(.005,.08,steel,0,-.09,0,ch,'y',6);
  // feed handles, fine feed hand wheel, depth stop, lot label, warning
  const hub=H.grp(m,.21,1.6,.0);K.cyl(.03,.04,dk,0,0,0,hub,'x',12);for(let k=0;k<3;k++){const a=k*PI*2/3,sp=K.cyl(.007,.2,steel,0,Math.sin(a)*.1,Math.cos(a)*.1,hub,'y',6);sp.rotation.x=a;K.sphere(.018,P.black,0,Math.sin(a)*.2,Math.cos(a)*.2,hub,8)}
  K.torus(.045,.008,dk,.21,1.76,-.1,m,'x',16);K.cyl(.008,.3,steel,-.1,1.4,.06,m,'y',6);K.plate(m,String(s.lot||''),.1,.05,.05,1.84,-.06-.18-.006,'#e3b82e','#1c1b18').rotation.y=PI;H.warn(m,-.08,1.62,.111,0,.06);
  K.plate(m,(s.make||'').toUpperCase(),.2,.05,-.05,1.76,.111,'#6b7fb5','#ffffff');
  // cross table on its saddle with the x / y hand wheels and the clamped workpiece
  K.box(.3,.06,.3,cast,0,1.01,.02,m);K.box(.5,.06,.18,cast,0,1.07,.02,m);for(const z of[-.03,.02,.07])K.box(.48,.004,.012,dk,0,1.103,z,m);
  K.torus(.05,.008,dk,.3,1.07,.02,m,'x',16);K.cyl(.008,.05,steel,.3,1.1,.05,m,'y',6);K.torus(.05,.008,dk,0,1.04,.2,m,'z',16);K.cyl(.008,.05,steel,.03,1.04,.23,m,'z',6);
  K.box(.08,.06,.06,K.mat(0x7d8286,.7,.4),.05,1.13,.02,m);for(const sx of[-1,1])K.box(.03,.02,.06,dk,.05+sx*.055,1.17,.02,m);
  // control box on the left with display, start/stop and the e-stop, cable to the head
  K.box(.04,.04,.1,dk,-.24,1.55,-.05,m);K.box(.14,.2,.08,cream,-.3,1.62,0,m);disp(K,m,'850',.09,.04,-.3,1.68,.041);H.keypad(m,-.3,1.6,.041,2,1,.022);H.estop(m,-.3,1.545,.045).scale.setScalar(.7);
  K.pipe([[-.3,1.52,0],[-.3,1.3,.1],[-.2,1.05,.25],[0,.9,.27]],.006,P.black,m);}
 return {group:g,height:2.1,update:(t,running)=>{if(!running)return;for(const c of chucks)c.rotation.y=t*12}};
});

// === qmcSystem: Solutech C&C quick mould change cart on rails with hydraulic clamps and power unit ===================
MB.add('qmcSystem',(K,s)=>{const {H,P,M,T,g,o}=setup(K,s,{});
 const green=K.mat(0x8fcf46,.2,.55),frame=K.mat(0x3a3f44,.4,.55),steel=M.steel,dk=P.dark,mould=K.mat(0x5e6367,.6,.45),plateM=K.mat(0x9aa0a4,.6,.4),orange=P.orange,brass=K.mat(0xc8a44a,.7,.35);
 // rails on their base plates with the hazard end stops
 for(const z of[-.38,.38]){K.box(2.6,.04,.1,dk,0,.02,z,g);K.box(2.6,.03,.05,steel,0,.055,z,g);for(const sx of[-1,1]){K.box(.1,.16,.12,dk,sx*1.25,.08,z,g);hazard(K,g,.12,.16,sx*1.25,.08,z+.061)}}
 for(let i=0;i<6;i++)K.box(.08,.02,.9,dk,-1.2+i*.48,.01,0,g);
 // the cart: posts, beams, deck with the roller bed and side guides, flanged wheels, push handle
 const cart=H.grp(g,0,0,0);for(const sx of[-1,1])for(const sz of[-1,1])K.box(.06,.7,.06,frame,sx*.75,.49,sz*.42,cart);
 for(const sz of[-1,1]){K.box(1.56,.06,.06,frame,0,.17,sz*.42,cart);K.box(1.56,.06,.06,frame,0,.81,sz*.42,cart)}for(const sx of[-1,1]){K.box(.06,.06,.84,frame,sx*.75,.17,0,cart);K.box(.06,.06,.84,frame,sx*.75,.81,0,cart)}
 K.box(1.6,.04,.9,steel,0,.86,0,cart);for(let i=0;i<12;i++)K.cyl(.03,.84,K.mat(0x7d8286,.7,.4),-.66+i*.12,.9,0,cart,'z',12);for(const sz of[-1,1])K.box(1.6,.08,.03,frame,0,.92,sz*.44,cart);
 const wheels=[];for(const sx of[-1,1])for(const sz of[-1,1]){const w=K.cyl(.08,.05,dk,sx*.6,.14,sz*.38,cart,'z',18);wheels.push(w);K.cyl(.095,.012,dk,sx*.6,.14,sz*.38+(sz>0?.03:-.03),cart,'z',18);K.box(.14,.08,.04,frame,sx*.6,.2,sz*.42,cart)}
 K.box(.5,.03,.05,dk,0,.125,0,cart);for(const sz of[-1,1])K.cyl(.015,.5,steel,-.86,.95,sz*.3,cart,'y',8).position.y=.95;K.cyl(.015,.64,steel,-.86,1.2,0,cart,'z',8);for(const sz of[-1,1])K.box(.08,.03,.03,frame,-.8,.78,sz*.3,cart);
 // the mould on the rollers: two halves with clamp plates, locating ring, eye bolt, hydraulic clamps and water nipples
 const md=H.grp(cart,0,.93,0);K.box(.46,.66,.62,mould,-.25,.33,0,md);K.box(.46,.66,.62,mould,.25,.33,0,md);K.box(.03,.6,.56,dk,0,.33,0,md);
 for(const sx of[-1,1])K.box(.06,.72,.7,plateM,sx*.51,.36,0,md);K.cyl(.08,.03,steel,0,.675,0,md,'y',20);K.cyl(.03,.03,dk,0,.675,0,md,'y',12);K.torus(.04,.01,steel,0,.73,0,md,'z',14);K.cyl(.012,.04,steel,0,.69,0,md,'y',8);
 for(const sx of[-1,1])for(const sy of[.1,.62])for(const sz of[-1,1]){K.box(.1,.08,.1,orange,sx*.58,sy,sz*.26,md);K.cyl(.025,.06,steel,sx*.6,sy,sz*.26,md,'x',10)}
 for(let i=0;i<6;i++)K.cyl(.012,.04,brass,-.35+i*.14,.2,.33,md,'z',8);K.plate(md,'MOULD '+(s.lot||''),.3,.06,-.25,.5,.313,'#1c1b18','#ecebe5');H.warn(md,.25,.5,.313,0,.08);
 // cable chain along the rails to the junction box under the cart
 H.cableChain(g,-.9,.5,.1,-.56,P.black);K.box(.16,.12,.1,dk,.55,.1,-.56,g);K.box(.12,.08,.08,dk,-.9,.1,-.56,g);
 // hydraulic power unit: tank, pump motor, valve manifold, gauge, hoses, lamp tower
 const hpu=H.grp(g,.55,0,-.9);K.box(.8,.5,.5,frame,0,.35,0,hpu);H.feet(hpu,.8,.5,.1,.08);K.box(.1,.1,.012,P.light,.3,.3,.255,hpu);K.box(.08,.08,.004,K.mat(0xc8a44a,.1,.3,{transparent:true,opacity:.6}),.3,.3,.263,hpu);
 const pm=motor(K,H,hpu,.13,.32,P.blue,-.2,.78,0,'y',dk);K.box(.3,.12,.3,dk,.2,.66,0,hpu);for(let i=0;i<4;i++){K.box(.05,.06,.08,dk,.08+i*.07,.75,0,hpu);K.cyl(.02,.06,P.black,.08+i*.07,.81,0,hpu,'y',8)}
 K.cyl(.05,.02,P.white,.2,.72,.16,hpu,'z',16);K.cyl(.055,.012,dk,.2,.72,.152,hpu,'z',16);K.cyl(.03,.12,steel,-.3,.63,.18,hpu,'y',10);
 H.nameplate(hpu,s,-.1,.15,.256,.5,.12);H.warn(hpu,-.3,.4,.256,0,.08);K.plate(hpu,'HYDRAULIC UNIT',.4,.06,-.1,.45,.256,'#1c1b18','#ecebe5');H.lampTower(hpu,.3,.6,-.15);
 H.hose(g,[[.75,.7,-.78],[.9,.6,-.6],[.6,.3,-.56],[.55,.16,-.56]],.014,P.hose);H.hose(g,[[.7,.7,-.8],[.95,.5,-.65],[.62,.25,-.5],[.55,.16,-.55]],.014,P.hose);
 // control panel on its stand: four screens, keypads, e-stop, pendant on its cable
 const st=H.grp(g,-.5,0,-.9);K.box(.5,.03,.4,dk,0,.015,0,st);for(const sx of[-1,1])K.box(.05,1.0,.05,frame,sx*.2,.5,0,st);K.box(.62,.56,.12,green,0,1.28,0,st);K.box(.64,.58,.006,dk,0,1.28,-.063,st);
 for(const sx of[-1,1])for(const sy of[0,1]){H.screen(st,sx*.15,1.42-sy*.2,.064,.22,.14,sy==0&&sx<0?H.card(s):null);}
 H.keypad(st,-.15,1.1,.064,4,1,.022);H.keypad(st,.15,1.1,.064,4,1,.022);H.estop(st,.26,1.06,.07);H.logoBand(st,s,.6,0,1.53,.062,.04);H.warn(st,-.26,1.06,.064,0,.06);
 K.plate(st,'QMC',.16,.06,0,1.06,.064,'#1c1b18','#8fcf46');K.box(.08,.18,.05,dk,.36,.9,0,st);H.keypad(st,.36,.92,.026,2,3,.014);K.pipe([[.36,.99,0],[.36,1.1,-.02],[.31,1.2,-.05]],.006,P.black,st);
 K.pipe([[-.5,.8,-.9],[-.5,.3,-.85],[-.2,.12,-.6]],.01,P.black,g);
 return {group:g,height:1.6,update:(t,running)=>{if(!running)return;const x=.3*Math.sin(t*.35);cart.position.x=x;for(const w of wheels)w.rotation.z=-x/.08;pm.fan.rotation.z=t*8}};
});

// === filterUnit: Moretto central vacuum filter with its side-channel blower ========================================
MB.add('filterUnit',(K,s)=>{const {H,P,M,T,g,o}=setup(K,s,{});
 const ss=K.mat(0xe3e6e8,.45,.3),lb=K.mat(0x5b9bd5,.3,.55),cast=K.mat(0x8d9397,.55,.5),dk=P.dark,steel=M.steel;
 // filter stand: skids, two uprights behind the body, band clamps round it
 const fx=.25;for(const sz of[-1,1])K.box(.5,.05,.08,lb,fx,.025,sz*.28,g);for(const sx of[-1,1])K.box(.05,1.6,.05,lb,fx+sx*.22,.8,-.2,g);K.box(.5,.05,.05,lb,fx,.05,-.2,g);
 for(const y of[.6,1.2]){K.torus(.275,.018,lb,fx,y,0,g,'y',24);for(const sx of[-1,1])K.box(.06,.05,.1,lb,fx+sx*.22,y,-.19,g)}
 // stainless body with bands, lid, gauge and the inlet stub; cone and dust bin with latches
 K.cyl(.24,1.2,ss,fx,1.15,0,g,'y',28);for(const y of[.8,1.15,1.5])K.torus(.245,.012,steel,fx,y,0,g,'y',28);K.cyl(.25,.04,ss,fx,1.77,0,g,'y',28);K.cyl(.1,.1,ss,fx,1.84,0,g,'y',24,.24);K.cyl(.06,.06,ss,fx,1.92,0,g,'y',16);
 K.cyl(.04,.025,P.white,fx-.08,1.78,.18,g,'z',14);K.cyl(.045,.012,dk,fx-.08,1.78,.17,g,'z',14);K.cyl(.045,.1,ss,fx,1.3,-.26,g,'z',14);K.cyl(.06,.012,ss,fx,1.3,-.31,g,'z',14);
 H.hose(g,[[fx,1.3,-.31],[fx,1.3,-.42],[fx,.9,-.44],[fx,.4,-.44]],.035,P.hose);
 K.cyl(.24,.2,ss,fx,.45,0,g,'y',28,.12);K.cyl(.2,.33,ss,fx,.17,0,g,'y',24);K.torus(.2,.008,steel,fx,.33,0,g,'y',24);for(const sx of[-1,1]){K.box(.03,.08,.02,dk,fx+sx*.2,.36,.0,g);K.box(.04,.03,.03,steel,fx+sx*.21,.3,0,g)}
 K.plate(g,'MORETTO',.22,.06,fx,1.42,.245,'#c8312a','#ffffff');H.nameplate(g,s,fx,1.0,.245,.32,.08);H.warn(g,fx,1.25,.245,0,.06);K.plate(g,'FILTER',.16,.04,fx,1.62,.245,'#ffffff','#1c1b18');
 // blower on its own frame: cast side-channel blower, motor with fan cowl, outlet pipe up to the filter lid, control box
 const bx=-.3;K.box(.5,.05,.45,lb,bx,.025,0,g);for(const sx of[-1,1])K.box(.05,1.15,.05,lb,bx+sx*.2,.6,-.2,g);K.box(.5,.05,.05,lb,bx,.7,-.2,g);K.box(.5,.05,.3,lb,bx,.12,.1,g);
 K.cyl(.18,.18,cast,bx,.32,.12,g,'z',24);for(let i=0;i<3;i++)K.torus(.18,.008,cast,bx,.32,.05+i*.06,g,'z',24);K.cyl(.1,.02,dk,bx,.32,.22,g,'z',16);bolts(K,g,[[bx-.08,.32],[bx+.08,.32],[bx,.4],[bx,.24]],.232,steel,.008);
 const mo=motor(K,H,g,.12,.28,cast,bx,.32,-.12,'z',dk);mo.group.rotation.y=PI;K.box(.3,.06,.26,cast,bx,.17,.0,g);
 K.pipe([[bx,.5,.12],[bx,.9,.12],[bx,1.95,.1],[fx-.1,1.98,.02],[fx,1.95,0]],.035,ss,g);K.cyl(.05,.012,ss,bx,.52,.12,g,'y',14);
 K.box(.3,.35,.12,lb,bx,1.0,-.2,g);K.box(.32,.37,.006,dk,bx,1.0,-.26,g);disp(K,g,'0.52',.12,.05,bx-.05,1.1,-.137);K.plate(g,'BLOWER',.14,.04,bx-.05,1.03,-.137,'#1c1b18','#ecebe5');H.estop(g,bx+.1,1.04,-.135);
 H.keypad(g,bx-.06,.92,-.137,2,1,.022);H.logoBand(g,s,.28,bx,1.15,-.136,.03);H.warn(g,bx+.1,.92,-.137,0,.05);K.pipe([[bx,.82,-.2],[bx,.6,-.3],[bx,.4,-.22]],.008,P.black,g);
 return {group:g,height:2.0,update:(t,running)=>{if(!running)return;mo.fan.rotation.z=t*10}};
});

// === workBench: steel workshop bench with drawers, cupboard, pegboard of tools, trays and a lamp (opts.count) =========
MB.add('workBench',(K,s)=>{const {H,P,M,T,g,o}=setup(K,s,{count:2});const n=units(s,o,2,3);
 const blue=K.mat(0x2e62b3,.3,.55),ltg=K.mat(0xd9d9d4,.2,.55),wood=P.wood,mat=K.mat(0x2f5f4a,.05,.85),dk=P.dark,steel=M.steel,peg=pegboard(K),tray=K.mat(0x8a8f93,.4,.6),parts=speckle(K,'#9a9d9f',['#5c6063','#d0d3d5','#7a7e81'],500,4);
 for(let i=0;i<n;i++){const b=H.grp(g,(i-(n-1)/2)*2.1,0,0);
  // frame and top with the mat, feet pads
  for(const sx of[-1,1])for(const sz of[-1,1]){K.box(.05,.84,.05,blue,sx*.97,.42,sz*.37,b);K.box(.08,.02,.08,dk,sx*.97,.01,sz*.37,b)}
  for(const sz of[-1,1]){K.box(1.94,.05,.05,blue,0,.815,sz*.37,b);K.box(1.94,.04,.04,blue,0,.3,sz*.37,b)}for(const sx of[-1,1])K.box(.05,.05,.74,blue,sx*.97,.815,0,b);
  K.box(2.0,.04,.8,wood,0,.86,0,b);K.box(1.9,.006,.7,mat,0,.883,0,b);
  // drawer unit, open shelf and cupboard under the top
  K.box(.5,.5,.7,blue,-.65,.59,0,b);for(let k=0;k<3;k++){K.box(.42,.13,.012,ltg,-.65,.42+k*.15,.356,b);H.handle(b,-.65,.42+k*.15,.364,.14,false)}K.box(.04,.04,.012,dk,-.65,.77,.356,b);
  K.box(.9,.03,.7,blue,0,.33,0,b);K.box(.9,.03,.7,blue,0,.58,0,b);K.box(.03,.5,.7,blue,-.38,.59,0,b);K.box(.03,.5,.7,blue,.38,.59,0,b);
  K.box(.5,.5,.7,blue,.65,.59,0,b);H.door(b,.42,.46,.65,.59,.356,ltg,false,-1);H.nameplate(b,s,.65,.37,.36,.4,.1);
  // pegboard on two uprights with the shelf and bins above, tools on hooks
  for(const sx of[-1,1])K.box(.04,1.0,.04,blue,sx*.8,1.38,-.36,b);K.box(1.9,.45,.02,peg,0,1.55,-.37,b);K.box(1.9,.03,.02,blue,0,1.32,-.37,b);H.logoBand(b,s,.6,-.6,1.34,-.355,.03);
  K.box(1.9,.03,.25,blue,0,1.87,-.25,b);for(const [x,c] of[[-.6,P.red],[-.2,P.blue],[.3,tray]]){K.box(.3,.14,.2,c,x,1.955,-.25,b);K.box(.26,.004,.16,dk,x,2.027,-.25,b)}
  const hooks=[-.7,-.45,-.2,.05,.3,.55,.75];for(const x of hooks)K.cyl(.006,.05,steel,x,1.68,-.335,b,'z',6);
  K.box(.02,.18,.006,steel,-.7,1.58,-.355,b);K.torus(.02,.006,steel,-.7,1.48,-.355,b,'z',10);K.torus(.02,.006,steel,-.7,1.68,-.355,b,'z',10);
  K.box(.025,.2,.02,wood,-.45,1.56,-.35,b);K.box(.09,.03,.03,dk,-.45,1.67,-.35,b);K.box(.02,.16,.006,steel,-.2,1.57,-.355,b);K.box(.02,.16,.006,steel,-.17,1.57,-.355,b);
  for(const x of[.05,.12])K.cyl(.005,.14,steel,x,1.56,-.35,b,'y',6);for(const x of[.05,.12])K.cyl(.012,.06,P.red,x,1.46,-.35,b,'y',8);K.box(.3,.03,.006,steel,.4,1.62,-.355,b);K.box(.08,.06,.006,wood,.57,1.62,-.355,b);
  K.box(.02,.2,.012,steel,.75,1.57,-.35,b);K.torus(.025,.006,steel,.75,1.46,-.35,b,'z',10);
  // trays of parts, the vice and the bench lamp
  for(const [x,z] of[[-.55,-.1],[-.2,-.05],[.15,-.1]]){K.box(.3,.06,.22,tray,x,.915,z,b);K.box(.26,.03,.18,parts,x,.945,z,b)}
  const v=H.grp(b,.75,.88,.25);K.box(.14,.04,.14,dk,0,.02,0,v);K.box(.16,.1,.08,dk,0,.1,-.03,v);K.box(.14,.1,.04,dk,0,.1,.05,v);K.cyl(.012,.16,steel,0,.1,.12,v,'z',8);K.cyl(.008,.14,steel,0,.1,.2,v,'x',6);
  K.box(.05,.06,.06,dk,-.8,.91,-.3,b);K.cyl(.012,.5,dk,-.8,1.16,-.3,b,'y',8);K.cyl(.012,.45,dk,-.6,1.4,-.2,b,'y',8).rotation.z=-.9;K.cyl(.07,.1,dk,-.42,1.44,-.1,b,'y',14,.03).rotation.z=.6;K.cyl(.04,.01,M.lamp,-.39,1.4,-.08,b,'y',12).rotation.z=.6;
  H.warn(b,-.9,.75,.36,0,.05);}
 return {group:g,height:2.03};
});

// === surfacePlate: granite surface plate on a steel stand with a height gauge and a linear positioning rail ==========
MB.add('surfacePlate',(K,s)=>{const {H,P,M,T,g,o}=setup(K,s,{count:2});const n=units(s,o,2,3);
 const grey=K.mat(0x8d9398,.4,.55),granite=speckle(K,'#1f2224',['#8a8d90','#5b5e61','#b9bcbf','#3a3d40'],1400,3),dk=P.dark,steel=M.steel,alu=P.alu,red=K.mat(0xc8312a,.2,.5);const cars=[];
 for(let i=0;i<n;i++){const p=H.grp(g,(i-(n-1)/2)*1.65,0,0);
  // welded stand: legs, stretchers, top frame, castors and levelling feet
  for(const sx of[-1,1])for(const sz of[-1,1])K.box(.06,.68,.06,grey,sx*.47,.42,sz*.3,p);for(const sz of[-1,1]){K.box(.94,.05,.05,grey,0,.74,sz*.3,p);K.box(.94,.04,.04,grey,0,.22,sz*.3,p)}
  for(const sx of[-1,1]){K.box(.05,.05,.6,grey,sx*.47,.74,0,p);K.box(.04,.04,.6,grey,sx*.47,.22,0,p)}K.box(.9,.02,.5,grey,0,.765,0,p);
  for(const sx of[-1,1])for(const sz of[-1,1]){K.box(.03,.06,.05,steel,sx*.45,.11,sz*.3,p);K.cyl(.05,.03,red,sx*.45,.05,sz*.3,p,'x',14);K.cyl(.02,.05,steel,sx*.45,.05,sz*.3,p,'x',8);K.cyl(.03,.08,steel,sx*.4,.04,sz*.22,p,'y',10)}
  // the granite slab with its maker label and lot sticker; a gauge block on it
  K.box(1.0,.13,.63,granite,0,.84,0,p);K.plate(p,(s.make||'').toUpperCase(),.3,.06,.3,.84,.318,'#c8312a','#ffffff');K.plate(p,String(s.lot||''),.08,.04,-.4,.84,.318,'#e3b82e','#1c1b18');
  K.box(.1,.05,.06,steel,.1,.93,.1,p);
  // height gauge: base, column with scale, slider with dial and scriber
  const hg=H.grp(p,-.25,.905,.02);K.box(.12,.04,.08,dk,0,.02,0,hg);K.box(.02,.24,.03,steel,0,.16,-.01,hg);K.box(.004,.2,.012,P.white,.012,.16,-.01,hg);K.box(.05,.07,.05,dk,0,.17,.0,hg);K.cyl(.03,.012,P.white,0,.17,.03,hg,'z',16);
  K.box(.14,.012,.02,steel,.09,.14,0,hg);K.box(.03,.004,.012,dk,.16,.135,0,hg);K.cyl(.012,.02,dk,.03,.17,-.02,hg,'x',8);
  // linear positioning rail on brackets along the back of the stand, with its carriage and drive motor
  for(const sx of[-1,1])K.box(.05,.18,.05,grey,sx*.45,.86,-.38,p);K.box(1.4,.08,.08,alu,0,.98,-.38,p);for(const sx of[-1,1])K.box(.03,.11,.11,dk,sx*.715,.98,-.38,p);
  K.box(.02,.01,.08,dk,0,1.025,-.38,p);const car=H.grp(p,0,.98,-.38);cars.push(car);K.box(.14,.11,.11,alu,0,0,0,car);K.box(.1,.03,.08,dk,0,.07,0,car);
  const mo=motor(K,H,p,.035,.12,dk,.8,.98,-.38,'x',dk);K.pipe([[.86,.98,-.38],[.95,.85,-.4],[.6,.6,-.42],[.47,.55,-.32]],.006,P.black,p);
  K.plate(p,'LINEAR',.2,.04,-.4,.98,-.339,'#1c1b18','#ecebe5');H.nameplate(p,s,.25,.5,.33,.34,.08);H.warn(p,-.3,.5,.33,0,.06);}
 return {group:g,height:1.1,update:(t,running)=>{if(!running)return;const x=.45*Math.sin(t*.5);for(const c of cars)c.position.x=x}};
});
})();
