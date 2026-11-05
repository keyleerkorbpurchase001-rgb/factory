// Packing & warehouse machines for the portal (window.MB builders): stretch wrapper, shrink-hood packer, L-sealer,
// strapping machine, floor and bench scales, label printer bench, hand pallet trucks, EKX high-rack stacker, Kalmar
// terminal tractor, trolleys with a mobile gantry, Denios spill containers and KAUP forklift attachments.
// Built at the origin in metres, floor y=0, operator front towards +z, length along x (see machines/KINDS.md).
(function(){
'use strict';
const PI=Math.PI;
const setup=(K,s,def)=>{const H=MB.H(K);return {H,P:H.P,M:K.M,T:K.THREE,g:new K.THREE.Group(),o:Object.assign({},def,s.opts||{})}};
// --- decals and textures used only in this family ---------------------------------------------------------------
const plane=(K,parent,w,h,material,x,y,z,ry=0,rx=0)=>{const m=new K.THREE.Mesh(K.keep(new K.THREE.PlaneGeometry(w,h)),material);m.position.set(x,y,z);m.rotation.set(rx,ry,0);parent.add(m);return m};
// yellow/black hazard stripes on a face (plane facing +z; ry/rx rotate it)
const hazard=(K,parent,w,h,x,y,z,ry=0,rx=0)=>{const a=Math.max(1,w/h),t=K.canvasTex(Math.round(64*a),64,(c,W,Hh)=>{c.fillStyle='#e3b82e';c.fillRect(0,0,W,Hh);c.fillStyle='#1c1b18';for(let x0=-Hh;x0<W+Hh;x0+=Hh){c.beginPath();c.moveTo(x0,0);c.lineTo(x0+Hh/2,0);c.lineTo(x0-Hh/2,Hh);c.lineTo(x0-Hh,Hh);c.closePath();c.fill()}});
 return plane(K,parent,w,h,K.mat(0xffffff,.1,.6,{map:t}),x,y,z,ry,rx)};
// a lit digit display (red by default) on a face at +z
const disp=(K,parent,text,w,h,x,y,z,fg='#ff3a2e',bg='#141516',ry=0)=>{const t=K.canvasTex(256,Math.round(256*h/w),(c,W,Hh)=>{c.fillStyle=bg;c.fillRect(0,0,W,Hh);c.fillStyle=fg;c.font=`700 ${Math.round(Hh*.68)}px ui-monospace, monospace`;c.textAlign='right';c.textBaseline='middle';c.fillText(text,W-14,Hh/2+2)});
 return plane(K,parent,w,h,K.mat(0xffffff,0,.5,{map:t,emissive:0xffffff,emissiveMap:t,emissiveIntensity:.7}),x,y,z,ry)};
// wire mesh fence panel (transparent grid), double sided
const mesh=(K,parent,w,h,x,y,z,ry=0,rx=0)=>{const t=K.canvasTex(128,128,(c,W,Hh)=>{c.clearRect(0,0,W,Hh);c.strokeStyle='#5f666b';c.lineWidth=4;for(let i=0;i<=W;i+=16){c.beginPath();c.moveTo(i,0);c.lineTo(i,Hh);c.stroke();c.beginPath();c.moveTo(0,i);c.lineTo(W,i);c.stroke()}});
 t.wrapS=t.wrapT=K.THREE.RepeatWrapping;t.repeat.set(w*3,h*3);return plane(K,parent,w,h,K.mat(0xffffff,.4,.5,{map:t,transparent:true,side:K.THREE.DoubleSide}),x,y,z,ry,rx)};
// checker (tread) plate material in a colour
const checker=(K,color='#2d3f66')=>{const t=K.canvasTex(256,256,(c,W,Hh)=>{c.fillStyle=color;c.fillRect(0,0,W,Hh);c.save();c.translate(W/2,Hh/2);c.rotate(PI/4);c.strokeStyle='rgba(255,255,255,.28)';c.lineWidth=5;for(let i=-6;i<6;i++)for(let j=-6;j<6;j++){const x=i*36+(j%2?18:0),y=j*36;c.beginPath();c.moveTo(x-10,y);c.lineTo(x+10,y);c.stroke()}c.restore()});
 t.wrapS=t.wrapT=K.THREE.RepeatWrapping;t.repeat.set(3,3);return K.mat(0xffffff,.45,.55,{map:t})};
// OSB chipboard material
const osb=K=>{const t=K.canvasTex(256,256,(c,W,Hh)=>{c.fillStyle='#c9a66b';c.fillRect(0,0,W,Hh);for(let i=0;i<420;i++){c.fillStyle=`hsl(${32+Math.random()*12},${40+Math.random()*25}%,${40+Math.random()*30}%)`;c.save();c.translate(Math.random()*W,Math.random()*Hh);c.rotate(Math.random()*PI);c.fillRect(-14,-3,28,6);c.restore()}});
 return K.mat(0xffffff,0,.85,{map:t})};
// a carton box
const carton=(K,parent,w,h,d,x,y,z,material)=>{const b=K.box(w,h,d,material,x,y+h/2,z,parent);K.box(w*.3,.004,d+.006,K.mat(0x9a7a4e,0,.8),x,y+h+.004,z,parent);return b};
// a tyre with a hub, axis x or z
const wheel=(K,parent,r,w,x,y,z,axis='x',hub=K.M.steel,tyre=null)=>{K.cyl(r,w,tyre||K.mat(0x1f2022,.05,.9),x,y,z,parent,axis,28);K.cyl(r*.45,w+.02,hub,x,y,z,parent,axis,16);K.cyl(r*.12,w+.04,K.M.dark,x,y,z,parent,axis,8)};

// === stretchWrapper: SIAT SW2 turntable stretch wrapper =======================================================
MB.add('stretchWrapper',(K,s)=>{const {H,P,M,T,g}=setup(K,s,{});
 const body=K.mat(0x3a3d41,.4,.55),dk=K.mat(0x25282b,.4,.6),film=K.mat(0xdfe8ee,.05,.2,{transparent:true,opacity:.45,depthWrite:false}),box=K.mat(0xb58a52,0,.85);
 // base plate, turntable with its yellow rim and the ramp
 K.box(2.3,.06,1.6,dk,0,.03,0,g);hazard(K,g,2.3,.05,0,.03,.806);hazard(K,g,1.6,.05,-1.156,.03,0,-PI/2);
 const tx=-.5;K.cyl(.78,.05,P.yellow,tx,.085,0,g,'y',48);
 const tt=H.grp(g,tx,0,0);K.cyl(.72,.05,body,0,.115,0,tt,'y',48);for(let i=0;i<12;i++){const a=i/12*PI*2;K.box(.12,.006,.04,P.yellow,Math.cos(a)*.62,.143,Math.sin(a)*.62,tt).rotation.y=-a}
 const ramp=K.box(1.1,.02,.62,dk,tx,.085,1.05,g);ramp.rotation.x=Math.atan2(.14,.6);hazard(K,g,1.1,.08,tx,.07,1.07,0,-PI/2+Math.atan2(.14,.6)).position.y=.092;
 // pallet with cartons on the table, the lower layers already wrapped
 H.pallet(tt,0,.14,0,1.2,.8);for(let l=0;l<3;l++)for(const sx of[-1,1])for(const sz of[-1,1])carton(K,tt,.56,.36,.38,sx*.3,.3+l*.37,sz*.2,box);
 K.box(1.24,.8,.84,film,0,.7,0,tt);
 // mast: drive base, column, guide rails, chain
 const mx=.85,mast=H.grp(g,mx,0,0);K.box(.5,.5,.62,body,.1,.31,0,mast);K.box(.52,.06,.64,dk,.1,.09,0,mast);hazard(K,mast,.5,.1,.1,.2,.316);
 K.box(.32,1.9,.36,body,0,1.45,-.05,mast);K.box(.36,.04,.4,dk,0,2.42,-.05,mast);for(let i=0;i<4;i++)K.box(.33,.008,.37,dk,0,.9+i*.4,-.05,mast);
 for(const sz of[-1,1])K.box(.02,1.8,.03,M.steel,-.165,1.4,-.05+sz*.12,mast);K.box(.01,1.8,.02,P.black,-.17,1.4,-.05,mast);
 K.cyl(.07,.22,P.blue,.1,.3,-.42,mast,'z',16);K.cyl(.05,.08,M.dark,.1,.3,-.56,mast,'z',12);H.hose(g,[[mx+.1,.3,-.58],[mx+.3,.18,-.72],[mx+.55,.03,-.78]],.012,P.black);
 // control panel on the front face of the mast
 K.box(.26,.6,.03,dk,0,1.55,.145,mast);H.screen(mast,0,1.7,.165,.2,.13,H.card(s));H.keypad(mast,0,1.48,.165,3,3,.028);H.estop(mast,.08,1.33,.17);H.warn(mast,-.07,1.33,.17,0,.08);
 H.logoBand(mast,s,.28,0,2.0,.137,.06);H.nameplate(mast,s,0,1.9,.137,.28,.08);K.plate(mast,'SW2',.2,.06,0,1.1,.137,'#e3b82e','#1c1b18');
 const bracket=K.box(.06,.04,.12,dk,0,1.78,-.3,mast),lt=H.lampTower(mast,0,1.8,-.33);
 // film carriage on the turntable side of the mast
 const c=H.grp(g,mx-.38,1.1,-.05);K.box(.36,.55,.42,body,0,0,0,c);K.box(.3,.02,.5,dk,-.2,.285,0,c);K.box(.3,.02,.5,dk,-.2,-.285,0,c);
 K.cyl(.125,.5,K.mat(0xe4ecf0,.1,.25,{transparent:true,opacity:.85}),-.3,0,0,c,'y',24);K.cyl(.04,.54,P.white,-.3,0,0,c,'y',12);for(const sz of[-1,1])K.cyl(.03,.5,P.black,-.2,0,sz*.22,c,'y',12);
 K.box(.1,.3,.06,dk,.19,0,0,c);K.box(.08,.02,.02,P.red,-.1,.2,.22,c);
 return {group:g,height:2.44,lamps:lt.lamps,update:(t,running)=>{if(!running)return;tt.rotation.y=t*.6;c.position.y=1.15+.6*Math.sin(t*.5)}};
});

// === shrinkHoodPacker: Thimon Coverpal stretch-hood portal ======================================================
MB.add('shrinkHoodPacker',(K,s)=>{const {H,P,M,T,g}=setup(K,s,{});
 const beige=K.mat(0xcfc8b4,.2,.55),grey=K.mat(0x8c9196,.4,.5),film=K.mat(0xe8ecee,.05,.3,{transparent:true,opacity:.85}),heat=K.mat(0x4a2e2a,.3,.6,{emissive:0xff4a1a,emissiveIntensity:.3}),box=K.mat(0xb58a52,0,.85);
 const W=2.4,D=1.8,Hh=3.6,py=2.3;
 for(const sx of[-1,1])for(const sz of[-1,1]){K.box(.16,Hh,.16,grey,sx*W/2,Hh/2,sz*D/2,g);K.box(.3,.03,.3,P.dark,sx*W/2,.015,sz*D/2,g);hazard(K,g,.16,.6,sx*W/2,.3,sz*D/2+.081)}
 for(const sz of[-1,1])K.box(W+.16,.16,.16,grey,0,Hh-.08,sz*D/2,g);for(const sx of[-1,1])K.box(.16,.16,D-.16,grey,sx*W/2,Hh-.08,0,g);
 // service platform with its rails, the film reel and the hood former up there
 K.platform(g,W+.4,D+.4,0,py,0,'nsew');
 for(const x of[-1.15,-.05])K.box(.06,.45,.1,grey,x,py+.225,0,g);K.cyl(.03,1.2,M.steel,-.6,py+.45,0,g,'x',10);K.cyl(.32,1.0,P.white,-.6,py+.45,0,g,'x',28);K.torus(.32,.01,P.light,-.1,py+.45,0,g,'x',28);
 for(const sx of[-1,1])K.cyl(.04,.4,M.steel,.6,py+.2,sx*.3,g,'y',10);K.box(.9,.06,.9,grey,.6,py+.43,0,g);K.box(.6,.3,.6,beige,.6,py+.6,0,g);K.plate(g,'HOOD FORMER',.5,.07,.6,py+.6,.31,'#1c1b18','#ecebe5');
 // guide rods and the hood frame with the heating ring that descends over the pallet
 for(const sx of[-1,1])for(const sz of[-1,1])K.cyl(.02,py-.6,M.steel,sx*.8,.6+(py-.6)/2,sz*.62,g,'y',10);
 const hf=H.grp(g,0,1.8,0);for(const sz of[-1,1])K.box(1.7,.08,.08,grey,0,0,sz*.62,hf);for(const sx of[-1,1])K.box(.08,.08,1.32,grey,sx*.8,0,0,hf);
 for(const sz of[-1,1])K.box(1.5,.05,.05,heat,0,-.07,sz*.52,hf);for(const sx of[-1,1])K.box(.05,.05,1.1,heat,sx*.7,-.07,0,hf);for(const sx of[-1,1])for(const sz of[-1,1])K.cyl(.045,.12,P.dark,sx*.8,0,sz*.62,hf,'y',12);
 // infeed roller conveyor through the portal
 for(const sz of[-1,1])K.box(3.0,.1,.06,P.blue,0,.5,sz*.56,g);for(const x of[-1.35,-.45,.45,1.35])for(const sz of[-1,1]){K.box(.05,.45,.05,grey,x,.225,sz*.56,g);K.box(.14,.02,.12,P.dark,x,.01,sz*.56,g)}
 for(let i=0;i<22;i++)K.cyl(.035,1.06,M.steel,-1.4+i*.1333,.52,0,g,'z',12);K.box(.06,.08,1.0,M.dark,-1.45,.56,0,g);
 // wrapped pallet inside
 H.pallet(g,0,.555,0,1.2,.8);carton(K,g,1.1,.5,.72,0,.715,0,box);carton(K,g,1.1,.48,.72,0,1.22,0,box);K.box(1.24,1.06,.84,film,0,1.22,0,g);
 // control cabinet on the right with the screen, keypad, document pocket and lamp tower
 const cx=1.63,cz=.45,cab=H.grp(g,cx,0,cz);K.box(.7,2.0,.5,beige,0,1.0,0,cab);K.box(.72,.06,.52,P.kick,0,.03,0,cab);
 K.box(.62,1.75,.006,P.dark,0,1.05,.251,cab);K.box(.6,1.73,.012,beige,0,1.05,.26,cab);H.handle(cab,.24,1.0,.272,.25);H.hinge(cab,-.29,1.05,.262,3,1.5);
 H.screen(cab,0,1.6,.275,.32,.21,H.card(s));H.keypad(cab,-.12,1.3,.27,4,3,.025);H.estop(cab,.17,1.3,.275);H.warn(cab,.17,1.12,.275,0,.1);
 K.box(.3,.22,.01,P.white,-.08,.75,.268,cab);K.plate(cab,'COVERPAL',.3,.05,-.08,.82,.275,'#ffffff','#1d7448');
 H.nameplate(cab,s,0,1.88,.268,.5,.12);H.logoBand(cab,s,.7,0,.42,.268,.06);const lt=H.lampTower(cab,0,2.0,-.1);
 K.pipe([[cx,2.0,cz-.1],[cx,2.7,cz-.1],[1.3,2.7,cz-.1],[1.3,3.5,0]],.02,grey,g);K.box(.14,.12,.08,grey,1.3,3.45,.1,g);
 // mesh fencing on the back and the left
 mesh(K,g,W+.4,2.0,0,1.05,-D/2-.14);for(const x of[-W/2-.2,0,W/2+.2])K.box(.05,2.05,.05,grey,x,1.03,-D/2-.14,g);K.box(W+.4,.04,.04,grey,0,2.05,-D/2-.14,g);
 mesh(K,g,D+.3,2.0,-W/2-.14,1.05,0,PI/2);for(const z of[-D/2-.15,D/2+.15])K.box(.05,2.05,.05,grey,-W/2-.14,1.03,z,g);K.box(.04,.04,D+.3,grey,-W/2-.14,2.05,0,g);
 // operator desk with the fire extinguisher in front
 const dx=-.9,dz=1.35,desk=H.grp(g,dx,0,dz);H.legs(desk,.9,.5,.74,.04,P.grey,.03);K.box(.9,.04,.5,P.wood,dx,.76,dz,g);K.box(.3,.02,.22,P.dark,dx+.1,.79,dz,g);
 K.cyl(.06,.45,P.red,dx-.6,.235,dz-.1,g,'y',14);K.cyl(.02,.06,M.dark,dx-.6,.49,dz-.1,g,'y',8);K.box(.03,.08,.02,M.dark,dx-.6,.5,dz-.07,g);
 return {group:g,height:Hh,lamps:lt.lamps,update:(t,running)=>{if(!running)return;hf.position.y=1.55+.55*Math.sin(t*.4)}};
});

// === shrinkWrapper: smipack SL 45 L-sealer with hood =============================================================
MB.add('shrinkWrapper',(K,s)=>{const {H,P,M,T,g}=setup(K,s,{});
 const white=K.mat(0xe6e5df,.2,.5),blk=P.black,chrome=M.steel,film=K.mat(0xdfe8ee,.05,.2,{transparent:true,opacity:.5,depthWrite:false});
 const st=H.grp(g,-.45,0,0);
 // black stand on castors with a base frame
 H.castors(st,1.0,.7,.1,.05);for(const sx of[-1,1])for(const sz of[-1,1])K.box(.05,.42,.05,blk,sx*.42,.34,sz*.27,st);
 for(const sz of[-1,1])K.box(.94,.04,.04,blk,0,.16,sz*.27,st);for(const sx of[-1,1])K.box(.04,.04,.58,blk,sx*.42,.16,0,st);
 // cabinet, sealing table with its grid and the front controls
 K.box(1.0,.42,.7,white,0,.76,0,st);K.box(1.0,.03,.7,P.light,0,.985,0,st);K.box(.8,.02,.56,P.dark,-.05,1.0,0,st);mesh(K,st,.78,.54,-.05,1.012,0,0,-PI/2);
 K.cyl(.012,1.0,chrome,0,1.01,.35,st,'x',8);K.cyl(.012,1.0,chrome,0,1.01,-.35,st,'x',8);
 K.box(.95,.2,.015,K.mat(0xd5d3cc,.2,.5),0,.86,.357,st);K.box(.14,.14,.008,P.dark,-.36,.86,.367,st);H.estop(st,-.36,.86,.372);
 K.box(.34,.13,.01,P.dark,-.05,.86,.368,st);disp(K,st,'180°C  1.5s',.16,.05,-.1,.875,.375,'#9fd6a3','#1e2a22');H.keypad(st,.08,.85,.375,3,2,.02);
 K.plate(st,'smipack',.5,.1,-.2,.66,.357,'#f2c21b','#1c3f8c');K.plate(st,'SL 45',.25,.08,.3,.66,.357,'#1c3f8c','#ffffff');H.logoBand(st,s,1.0,0,.575,.357,.03);
 K.plate(st,'CE',.06,.05,-.45,.86,.372,'#ffffff','#1c1b18');H.warn(st,.4,.86,.372,0,.07);H.nameplate(st,s,.507,.8,0,.4,.1,PI/2);
 // film reel under the table at the front, the black cable loop
 for(const x of[-.56,-.04])K.box(.03,.4,.06,blk,x,.36,.38,st);K.cyl(.02,.6,chrome,-.3,.3,.42,st,'x',10);K.cyl(.1,.5,film,-.3,.3,.42,st,'x',20);K.cyl(.1,.5,P.white,-.3,.3,.42,st,'x',20).scale.set(.98,.98,.98);
 H.hose(st,[[-.4,.78,.37],[-.62,.6,.55],[-.5,.36,.56]],.008,blk);
 // hinged hood: steel frame, clear panel, sealing bar and the roller handle; it rocks open and shut
 const hd=H.grp(st,-.05,1.0,-.3);hd.rotation.x=-1.0;for(const sx of[-1,1])K.box(.025,.025,.6,chrome,sx*.4,0,.3,hd);K.box(.8,.025,.025,chrome,0,0,.6,hd);K.box(.8,.025,.025,chrome,0,0,.0,hd);
 K.box(.76,.006,.56,P.glass,0,.016,.3,hd).castShadow=false;K.box(.8,.03,.04,P.dark,0,-.025,.58,hd);K.box(.04,.03,.6,P.dark,.38,-.025,.3,hd);
 for(const sx of[-.42,.42])K.box(.03,.08,.04,blk,sx,.0,.63,hd);K.cyl(.022,.9,blk,0,.0,.66,hd,'x',12);K.cyl(.01,.1,chrome,0,0,0,hd,'x',8);
 K.plate(hd,'CE',.06,.05,-.3,.022,.1,'#ffffff','#1c1b18').rotation.x=-PI/2;
 // side table with its guide bar
 K.box(.4,.88,.4,blk,.6,.44,-.05,g);K.box(.8,.03,.55,P.light,.5,.92,.05,g);K.box(.8,.02,.04,P.light,.5,.95,.33,g);K.box(.3,.04,.04,blk,.12,.9,0,g);
 K.pipe([[.14,.96,.28],[.14,1.08,.28],[.85,1.08,.28],[.85,.96,.28]],.01,chrome,g);H.warn(g,.75,.6,.151,0,.09);
 return {group:g,height:1.55,update:(t,running)=>{hd.rotation.x=running?-.95+.15*Math.sin(t*.8):-1.0}};
});

// === strappingMachine: FEIFER TP 410 semi-automatic strapper (opts.arch adds the banding arch) ==================
MB.add('strappingMachine',(K,s)=>{const {H,P,M,T,g,o}=setup(K,s,{arch:false});
 const body=K.mat(0x8f9398,.35,.55),top=K.mat(0xd9d6cc,.2,.5),band=K.mat(0x1f2a2a,.1,.6);
 H.castors(g,1.0,.55,.1,.045);K.box(1.0,.02,.5,P.dark,.2,.12,0,g);K.box(1.0,.6,.55,body,.2,.43,0,g);
 K.box(1.4,.04,.6,top,0,.75,0,g);K.box(.03,.006,.6,P.black,.05,.773,0,g);K.box(.25,.006,.12,P.dark,.05,.773,.12,g);K.box(1.4,.02,.02,P.dark,0,.76,.305,g);
 for(let i=0;i<3;i++)K.box(.95,.004,.01,P.dark,.2,.2+i*.18,.276,g);
 // front controls: panel with dials, keypad, main switch, e-stop, nameplate and band
 K.box(.4,.2,.012,P.dark,-.1,.6,.282,g);for(let i=0;i<2;i++){K.cyl(.025,.02,P.black,-.22+i*.1,.63,.29,g,'z',14);K.box(.004,.03,.01,P.white,-.22+i*.1,.645,.3,g)}
 H.keypad(g,.0,.6,.29,3,2,.022);K.box(.05,.05,.01,P.green,-.05,.53,.29,g);K.box(.05,.05,.01,P.red,.02,.53,.29,g);
 K.box(.08,.08,.012,P.yellow,.45,.6,.288,g);K.cyl(.02,.02,P.black,.45,.6,.3,g,'z',12);K.box(.012,.06,.015,P.red,.45,.6,.312,g).rotation.z=.6;K.plate(g,'0  I',.07,.02,.45,.65,.295,'#e3b82e','#1c1b18');H.estop(g,.6,.6,.282);
 H.nameplate(g,s,.3,.4,.282,.42,.09);H.logoBand(g,s,.95,.2,.17,.282,.04);K.plate(g,'TP 410',.2,.06,.55,.4,.282,'#1c1b18','#ecebe5');H.warn(g,-.55,.5,.282,0,.08);
 // strap coil on an axle in the open compartment on the left, the strap running up to the table slot
 K.box(.02,.55,.5,body,-.3,.45,0,g);K.cyl(.025,.3,M.steel,-.46,.42,0,g,'x',10);K.cyl(.19,.17,band,-.5,.42,0,g,'x',32);K.cyl(.08,.19,P.light,-.5,.42,0,g,'x',16);
 K.pipe([[-.5,.61,0],[-.45,.7,0],[-.2,.735,0],[.05,.74,0]],.005,band,g);
 // foot pedal and its cable
 K.box(.15,.03,.1,P.black,.2,.015,.42,g);K.box(.15,.01,.08,P.grey,.2,.035,.41,g).rotation.x=-.3;H.hose(g,[[.2,.02,.37],[.2,.02,.3],[.2,.1,.28]],.006,P.black);
 let height=.8;
 if(o.arch){for(const sx of[-1,1]){K.box(.08,.75,.08,body,sx*.55,1.145,-.12,g);K.box(.05,.72,.03,P.dark,sx*.55,1.13,-.06,g)}K.box(1.18,.08,.08,body,0,1.48,-.12,g);K.box(1.1,.03,.05,P.dark,0,1.43,-.06,g);
  K.box(.06,.04,.04,P.black,-.45,1.1,-.06,g);K.box(.01,.01,.01,P.led,-.45,1.1,-.035,g);hazard(K,g,1.18,.04,0,1.52,-.079);height=1.52}
 return {group:g,height};
});

// === floorScale: KRAJSPOL 1.5 t checker-plate floor scale with its indicator column ============================
MB.add('floorScale',(K,s)=>{const {H,P,M,T,g}=setup(K,s,{});
 const chk=checker(K,'#2d3f66'),box=K.mat(0xb58a52,0,.85);
 K.box(1.5,.08,1.5,chk,0,.06,0,g);for(const sx of[-1,1])for(const sz of[-1,1])K.cyl(.05,.02,P.dark,sx*.6,.01,sz*.6,g,'y',12);
 hazard(K,g,1.5,.07,0,.06,.756);hazard(K,g,1.5,.07,0,.06,-.756,PI);hazard(K,g,1.5,.07,.756,.06,0,PI/2);hazard(K,g,1.5,.07,-.756,.06,0,-PI/2);
 const a=Math.atan2(.1,.46);const ramp=K.box(1.5,.02,.47,chk,0,.058,.975,g);ramp.rotation.x=a;hazard(K,g,1.5,.06,0,.065,.97,0,-PI/2+a).position.y=.07;
 H.pallet(g,0,.1,0,1.2,.8);carton(K,g,.55,.4,.7,-.3,.26,0,box);carton(K,g,.55,.3,.7,.3,.26,0,box);
 // indicator column behind the platform
 const cx=.5,cz=-1.0;K.box(.25,.02,.25,P.dark,cx,.01,cz,g);K.cyl(.03,1.0,M.steel,cx,.52,cz,g,'y',14);
 const hd=H.grp(g,cx,1.05,cz);hd.rotation.x=-.3;K.box(.34,.18,.09,P.light,0,0,0,hd);K.box(.3,.1,.006,P.dark,-.02,.02,.047,hd);disp(K,hd,'0.0 kg',.22,.07,-.04,.02,.052);
 H.keypad(hd,.12,-.05,.047,3,1,.02);K.box(.02,.02,.008,P.led,-.14,-.05,.047,hd);H.logoBand(hd,s,.34,0,-.08,.047,.02);
 K.box(.3,.1,.02,P.dark,cx,.6,cz+.04,g);H.nameplate(g,s,cx,.6,cz+.052,.3,.08);
 H.hose(g,[[cx,.98,cz+.02],[cx,.3,cz+.03],[cx,.05,cz+.1],[cx-.1,.05,cz+.2]],.008,P.black);K.box(.5,.03,.3,P.dark,cx,.015,cz+.06,g);
 return {group:g,height:1.15};
});

// === platformScale: TScale 150 kg bench scale ==================================================================
MB.add('platformScale',(K,s)=>{const {H,P,M,T,g}=setup(K,s,{});
 const ss=K.mat(0xd7dadb,.8,.3),box=K.mat(0xb58a52,0,.85);
 K.box(.5,.05,.4,P.dark,0,.045,0,g);H.feet(g,.5,.4,.02,.06,M.steel);K.box(.14,.04,.12,M.steel,0,.09,0,g);K.box(.46,.02,.36,ss,0,.12,0,g);
 K.box(.04,1.0,.03,ss,0,.57,-.17,g);K.box(.1,.03,.05,ss,0,.085,-.17,g);
 const hd=H.grp(g,0,1.08,-.15);hd.rotation.x=-.35;K.box(.28,.15,.07,K.mat(0xe4e6e3,.2,.5),0,0,0,hd);K.box(.2,.07,.006,P.dark,0,.02,.037,hd);disp(K,hd,'0.000 kg',.18,.055,0,.02,.042,'#2ddc6a','#1a2a1f');
 H.keypad(hd,0,-.045,.037,5,1,.018);H.logoBand(hd,s,.28,0,-.065,.037,.012);K.box(.2,.06,.012,P.dark,0,.5,-.16,g);H.nameplate(g,s,0,.5,-.152,.2,.05);
 H.hose(g,[[0,1.0,-.14],[0,.3,-.13],[0,.1,-.05]],.006,P.black);carton(K,g,.18,.14,.14,.06,.13,.03,box);
 return {group:g,height:1.16};
});

// === labelPrinterStation: bench of Zebra ZT4xx printers with monitor and scanner (opts.count printers) =========
MB.add('labelPrinterStation',(K,s)=>{const {H,P,M,T,g,o}=setup(K,s,{count:3});const n=Math.min(4,Math.max(1,+o.count||3));
 const pm=K.mat(0x3b3e42,.3,.6),pm2=K.mat(0x4a4e53,.3,.55),box=K.mat(0xb58a52,0,.85);
 K.box(1.6,.04,.7,P.light,0,.85,0,g);K.box(1.6,.03,.02,P.dark,0,.85,.345,g);H.legs(g,1.6,.7,.83,.05,P.grey,.04);K.box(1.5,.03,.6,P.grey,0,.25,0,g);
 for(let i=0;i<3;i++)carton(K,g,.35,.25,.4,-.55+i*.42,.265,-.05,box);for(let i=0;i<3;i++)K.cyl(.08,.1,P.white,.55,.315+i*.0,.1-i*.15,g,'y',16);
 K.box(.42,.1,.01,P.dark,-.1,.76,.33,g);H.nameplate(g,s,-.1,.76,.336,.4,.08);H.logoBand(g,s,1.6,0,.825,.351,.03);H.warn(g,.4,.76,.336,0,.08);
 for(let i=0;i<n;i++){const p=H.grp(g,-.62+i*.32,.87,.05);
  K.box(.2,.3,.48,pm,-.04,.15,0,p);K.box(.08,.02,.48,pm,.1,.29,0,p);K.box(.08,.02,.48,pm,.1,.01,0,p);K.box(.08,.3,.02,pm,.1,.15,-.23,p);K.box(.08,.3,.02,pm,.1,.15,.23,p);
  K.cyl(.09,.08,P.white,.1,.15,-.04,p,'x',20);K.cyl(.02,.09,P.dark,.1,.15,-.04,p,'x',8);K.box(.006,.26,.44,P.tint,.143,.15,0,p);
  for(const y of[.03,.27])K.box(.01,.02,.46,pm2,.144,y,0,p);for(const z of[-.22,.22])K.box(.01,.26,.02,pm2,.144,.15,z,p);H.handle(p,.15,.2,.0,.06,true,P.dark).rotation.y=PI/2;
  K.box(.28,.12,.008,P.dark,0,.2,.244,p);H.screen(p,-.07,.21,.25,.07,.05,null);for(let k=0;k<3;k++)K.box(.02,.012,.006,P.light,.02+k*.03,.16,.249,p);
  K.box(.2,.006,.008,P.black,0,.09,.249,p);K.box(.16,.002,.06,P.white,0,.085,.27,p);K.plate(p,'ZEBRA',.1,.03,.08,.26,.249,'#1c1d1f','#ffffff');K.box(.28,.004,.48,pm2,0,.302,0,p);
  H.hose(p,[[0,.05,-.24],[0,.0,-.3],[0,-.02,-.4]],.006,P.black)}
 // monitor on a post, keyboard and the barcode scanner in its stand
 K.box(.2,.02,.15,P.dark,.66,.88,-.15,g);K.box(.04,.35,.04,P.dark,.66,1.04,-.15,g);H.screen(g,.66,1.22,-.12,.34,.22,H.card(s));K.box(.3,.015,.12,P.dark,.6,.878,.2,g);
 K.cyl(.05,.01,P.dark,.72,.875,.25,g,'y',14);K.cyl(.01,.2,P.dark,.72,.975,.25,g,'y',8);K.box(.03,.08,.03,P.black,.72,1.03,.23,g);const gun=K.box(.05,.04,.1,P.black,.72,1.09,.26,g);gun.rotation.x=.4;K.box(.04,.03,.004,P.red,.72,1.1,.31,g).rotation.x=.4;
 return {group:g,height:1.33};
});

// === palletTruck: hand pallet trucks in a row (opts.count) =====================================================
MB.add('palletTruck',(K,s)=>{const {H,P,M,T,g,o}=setup(K,s,{count:3});const n=Math.min(4,Math.max(1,+o.count||1));
 const yel=K.mat(0xd8b52a,.3,.55),blk=P.black,handles=[];
 for(let i=0;i<n;i++){const t=H.grp(g,(i-(n-1)/2)*.75,0,0);
  for(const sx of[-1,1]){K.box(.16,.06,1.1,yel,sx*.18,.09,.33,t);K.box(.16,.035,.1,yel,sx*.18,.078,.93,t);K.box(.1,.02,.14,blk,sx*.18,.035,.78,t);K.cyl(.035,.07,P.rubber,sx*.18,.035,.78,t,'x',14);K.cyl(.012,.1,M.steel,sx*.18,.035,.78,t,'x',8)}
  K.box(.52,.24,.2,yel,0,.24,-.25,t);const sl=K.box(.52,.03,.31,yel,0,.24,-.05,t);sl.rotation.x=.876;K.box(.5,.08,.13,yel,0,.16,-.085,t);K.box(.5,.08,.06,yel,0,.24,-.12,t);K.box(.5,.06,.02,yel,0,.31,-.14,t);
  for(const sx of[-1,1]){K.cyl(.09,.05,P.rubber,sx*.12,.09,-.28,t,'x',18);K.cyl(.03,.06,M.steel,sx*.12,.09,-.28,t,'x',8)}K.cyl(.035,.22,M.steel,.18,.42,-.36,t,'y',10);K.cyl(.045,.06,blk,.18,.55,-.36,t,'y',10);
  H.warn(t,0,.25,-.148,0,.08).rotation.x=0;K.plate(t,'2.5 t',.12,.04,-.15,.31,-.148,'#1c1b18','#ecebe5');
  const hg=H.grp(t,0,.3,-.33);hg.rotation.x=-.5;K.cyl(.02,1.0,blk,0,.5,0,hg,'y',10);K.torus(.12,.022,blk,0,1.1,0,hg,'z',24);K.box(.03,.12,.02,P.red,.1,.95,.02,hg);K.box(.06,.1,.06,blk,0,.02,0,hg);handles.push(hg)}
 return {group:g,height:1.2};
});

// === reachStacker: Jungheinrich EKX 514 man-up VNA truck (length along z, forks to +z) =========================
MB.add('reachStacker',(K,s)=>{const {H,P,M,T,g}=setup(K,s,{});
 const yel=K.mat(0xe8b61c,.3,.5),dk=K.mat(0x2a2c2f,.4,.55),mastM=K.mat(0x4a4e52,.5,.45),box=K.mat(0xb58a52,0,.85),beacon=K.mat(0xffb020,0,.4,{emissive:0xffa000,emissiveIntensity:.8});
 // chassis: dark lower frame, yellow battery body, rear hazard stripes, wheels and guide rollers
 K.box(1.34,.3,1.44,dk,0,.3,-.8,g);K.box(1.3,.7,1.4,yel,0,.8,-.8,g);K.box(1.32,.01,1.42,dk,0,1.0,-.8,g);K.box(1.1,.08,1.2,dk,0,1.19,-.9,g);
 hazard(K,g,1.3,.22,0,.56,-1.506,PI);K.box(.3,.2,.02,P.dark,.4,.85,-1.51,g);K.plate(g,'EKX 514',.5,.08,-.2,.9,-1.51,'#1c1b18','#ecebe5',PI);
 for(const sx of[-1,1]){wheel(K,g,.2,.2,sx*.6,.2,-1.3,'x');wheel(K,g,.2,.2,sx*.6,.2,-.3,'x');for(const z of[-1.42,-.18])K.cyl(.06,.1,P.rubber,sx*.72,.32,z,g,'y',12)}
 H.nameplate(g,s,.656,.85,-.8,.7,.16,PI/2);H.nameplate(g,s,-.656,.85,-.8,.7,.16,-PI/2);for(const sx of[-1,1])K.box(.012,.08,1.3,K.mat(H.brand(s.name),.2,.5),sx*.656,1.1,-.8,g);
 K.box(.2,.12,.08,P.dark,-.5,.95,-.1,g);K.box(.04,.04,.03,P.red,-.5,.95,-.05,g);
 // two-section mast with lift cylinder and chains
 for(const sx of[-1,1])K.box(.14,3.2,.3,mastM,sx*.55,1.75,0,g);for(const y of[.5,3.3])K.box(1.24,.12,.3,mastM,0,y,0,g);
 for(const sx of[-1,1])K.box(.1,3.1,.14,M.steel,sx*.4,1.9,.08,g);K.box(.9,.1,.14,M.steel,0,3.5,.08,g);K.cyl(.06,2.4,dk,0,1.35,-.05,g,'y',14);for(const sx of[-1,1])K.box(.02,2.6,.01,P.black,sx*.2,1.8,.16,g);
 // man-up cab with overhead guard, seat, console and the swivel fork carriage in front
 const cab=H.grp(g,0,1.1,.2);K.box(1.1,.9,.1,dk,0,.5,-.02,cab);for(const sx of[-1,1])for(const y of[.1,.9])K.cyl(.05,.06,M.steel,sx*.47,y,-.04,cab,'x',12);K.box(1.3,.08,1.0,dk,0,0,.5,cab);K.box(1.3,1.0,.06,yel,0,.5,.97,cab);K.box(1.3,.9,.06,dk,0,.5,.03,cab);hazard(K,cab,1.3,.1,0,.1,1.002);
 for(const sx of[-1,1]){K.box(.06,.9,.9,yel,sx*.62,.5,.5,cab);K.box(.05,1.1,.05,dk,sx*.6,1.5,.08,cab);K.box(.05,1.1,.05,dk,sx*.6,1.5,.92,cab);K.box(.012,.9,.8,P.glass,sx*.62,1.5,.5,cab).castShadow=false}
 K.box(1.3,.06,.95,dk,0,2.03,.5,cab);mesh(K,cab,1.2,.85,0,2.0,.5,0,-PI/2);K.box(1.2,.8,.012,P.glass,0,1.45,.95,cab).castShadow=false;K.cyl(.06,.12,beacon,.5,2.12,.3,cab,'y',14);
 K.box(.4,.3,.4,dk,-.2,.17,.4,cab);K.box(.5,.1,.45,P.black,-.2,.37,.4,cab);K.box(.5,.5,.08,P.black,-.2,.65,.2,cab);K.box(.5,.3,.3,dk,.25,.9,.75,cab);H.screen(cab,.25,1.12,.9,.14,.1,null);K.torus(.12,.015,P.black,.25,1.2,.6,cab,'z',24);H.estop(cab,.45,1.0,.91);
 K.box(.9,.6,.1,dk,0,.4,1.08,cab);K.box(.5,.5,.06,M.steel,0,.4,1.16,cab);const fk=H.grp(cab,0,.1,1.13);for(const sx of[-1,1])K.box(.1,.05,1.0,dk,sx*.3,0,.5,fk);for(const sx of[-1,1])K.box(.1,.35,.05,dk,sx*.3,.2,.02,fk);
 H.pallet(fk,0,.025,.55,.8,1.0);carton(K,fk,.7,.6,.9,0,.185,.55,box);K.box(.74,.62,.94,K.mat(0xdfe8ee,.05,.2,{transparent:true,opacity:.4,depthWrite:false}),0,.5,.55,fk);
 return {group:g,height:3.55,update:(t,running)=>{if(!running)return;cab.position.y=1.1+.25*Math.sin(t*.35);beacon.emissiveIntensity=.4+.6*Math.abs(Math.sin(t*4))}};
});

// === yardTractor: Kalmar terminal tractor (front towards -x, cab on the +z side) ===============================
MB.add('yardTractor',(K,s)=>{const {H,P,M,T,g}=setup(K,s,{});
 const red=K.mat(0xc4322c,.35,.45),blk=P.black,chas=K.mat(0x222426,.4,.6),glass=P.tint,lamp=K.mat(0xfff6d8,0,.3,{emissive:0xfff0c0,emissiveIntensity:.9}),tail=K.mat(0xc8312a,0,.4,{emissive:0xc8312a,emissiveIntensity:.8}),beacon=K.mat(0xffb020,0,.4,{emissive:0xffa000,emissiveIntensity:.8});
 K.box(5.0,.35,1.9,chas,0,.75,0,g);K.box(1.9,.5,2.5,red,-1.95,1.15,0,g);K.box(3.5,.08,2.3,chas,.75,.97,0,g);
 for(const sx of[-1,1])for(const sz of[-1,1])wheel(K,g,.5,.35,sx*1.7,.5,sz*1.05,'z');for(const sz of[-1,1])K.box(1.3,.06,.45,blk,1.7,1.06,sz*1.05,g);
 // cab (left side) with windows, door, roof, beacon, mirrors and steps
 K.box(1.4,1.35,1.2,red,-2.2,2.075,.65,g);K.box(1.5,.08,1.3,red,-2.2,2.79,.65,g);K.cyl(.06,.12,beacon,-2.2,2.89,.65,g,'y',14);
 K.box(.012,.8,1.0,glass,-2.906,2.2,.65,g).castShadow=false;K.box(.012,.7,1.0,glass,-1.494,2.25,.65,g).castShadow=false;K.box(1.2,.7,.012,glass,-2.2,2.25,1.256,g).castShadow=false;
 K.box(.65,.012,.008,P.dark,-1.85,1.45,1.254,g);K.box(.012,1.2,.008,P.dark,-2.17,2.0,1.254,g);K.box(.012,1.2,.008,P.dark,-1.53,2.0,1.254,g);H.handle(g,-1.75,1.85,1.27,.15,false);
 for(const z of[-1.4,1.5]){K.box(.03,.03,.3,blk,-2.95,2.3,z-(z>0?.1:-.1),g);K.box(.15,.3,.04,blk,-2.95,2.3,z,g)}K.box(.5,.04,.25,M.grating,-2.2,.55,1.35,g);K.box(.5,.04,.25,M.grating,-2.2,.95,1.3,g);for(const sx of[-1,1])K.box(.04,.5,.12,blk,-2.2+sx*.23,.75,1.31,g);
 // hood (right side) with grille, nameplate and brand band, the exhaust stack and the rear post with a work lamp
 K.box(1.4,.7,1.3,red,-2.2,1.75,-.6,g);H.grille(g,.9,.4,-2.906,1.7,-.6,-PI/2);H.nameplate(g,s,-2.906,2.0,-.6,.6,.12,-PI/2);const hs=H.grp(g,-2.2,0,-1.256,PI);H.logoBand(hs,s,1.3,0,1.5,0,.05);K.plate(hs,'KALMAR',.6,.1,0,1.7,0,'#ffffff','#b9233a');H.nameplate(hs,s,.0,1.92,0,.6,.12);const cs=H.grp(g,-2.2,0,1.256);K.plate(cs,'KALMAR',.5,.08,-.35,2.62,0,'#ffffff','#b9233a');H.logoBand(cs,s,1.4,0,1.48,0,.05);
 K.cyl(.05,1.1,M.steel,-1.3,2.1,-.9,g,'y',12);K.cyl(.06,.1,M.dark,-1.3,2.7,-.9,g,'y',12);K.box(.15,1.45,.15,blk,-1.3,2.125,.5,g);K.box(.12,.1,.08,blk,-1.3,2.75,.6,g);K.box(.08,.06,.006,lamp,-1.3,2.75,.645,g);
 // front bumper with hazard stripes and headlights; rear deck with the fifth wheel on its lift frame; rear bumper
 K.box(.25,.4,2.5,blk,-3.0,.9,0,g);for(const sz of[-1,1]){hazard(K,g,.8,.3,-3.126,.9,sz*.85,-PI/2);K.cyl(.08,.03,lamp,-3.13,1.0,sz*.5,g,'x',14)}
 K.box(1.1,.2,1.0,blk,.9,1.11,0,g);K.cyl(.55,.08,K.mat(0x4b4f53,.6,.4),.9,1.25,0,g,'y',32);K.box(.55,.09,.14,P.black,1.2,1.25,0,g);for(const sz of[-1,1])K.cyl(.05,.5,M.steel,.4,1.1,sz*.4,g,'x',10);
 K.box(.25,.35,2.4,blk,2.65,.8,0,g);for(const sz of[-1,1]){hazard(K,g,.8,.28,2.776,.8,sz*.8,PI/2);K.box(.006,.08,.15,tail,2.78,.95,sz*.4,g)}
 K.box(.8,.3,.3,blk,-.3,.5,1.0,g);K.box(.8,.3,.3,blk,-.3,.5,-1.0,g);H.warn(g,-1.7,1.3,1.256,0,.12);
 return {group:g,height:2.95,update:(t,running)=>{beacon.emissiveIntensity=running?.4+.6*Math.abs(Math.sin(t*4)):.2}};
});

// === trolleySet: blue steel trolleys with OSB decks (opts.count) under a mobile lifting gantry ==================
MB.add('trolleySet',(K,s)=>{const {H,P,M,T,g,o}=setup(K,s,{count:3});const n=Math.min(4,Math.max(1,+o.count||1));
 const blue=K.mat(0x2f5fa6,.3,.55),wood=osb(K),red=K.mat(0xc8312a,.1,.6),dk=P.dark;
 for(let i=0;i<n;i++){const t=H.grp(g,(i-(n-1)/2)*.9,0,0);
  for(const sx of[-1,1])for(const sz of[-1,1]){K.box(.03,.06,.06,M.steel,sx*.32,.13,sz*.22,t);K.box(.08,.02,.08,M.steel,sx*.32,.165,sz*.22,t);K.cyl(.05,.03,red,sx*.32,.05,sz*.22,t,'x',16);K.cyl(.015,.05,M.steel,sx*.32,.05,sz*.22,t,'x',8);K.box(.03,.8,.03,blue,sx*.385,.57,sz*.285,t)}
  for(const sz of[-1,1]){K.box(.8,.03,.03,blue,0,.185,sz*.285,t);K.box(.8,.025,.025,blue,0,.55,sz*.285,t);K.box(.8,.03,.03,blue,0,.955,sz*.285,t)}for(const sx of[-1,1]){K.box(.03,.03,.6,blue,sx*.385,.185,0,t);K.box(.03,.03,.6,blue,sx*.385,.955,0,t)}
  K.box(.74,.015,.54,wood,0,.21,0,t);K.box(.8,.018,.6,wood,0,.98,0,t);K.plate(t,String(s.lot||''),.08,.04,.2,.56,.3,'#e3b82e','#1c1b18')}
 // mobile A-frame gantry over the row with a chain hoist
 const L=n*.9+.6,a=Math.atan2(.5,1.8),yel=P.yellow;
 for(const sx of[-1,1]){const x=sx*L/2;for(const sz of[-1,1]){const leg=K.cyl(.03,1.87,yel,x,1.0,sz*.25,g,'y',10);leg.rotation.x=-sz*a;K.cyl(.06,.05,P.rubber,x,.06,sz*.5,g,'x',14);K.box(.04,.08,.06,M.steel,x,.1,sz*.5,g)}
  K.cyl(.025,.5,yel,x,.95,0,g,'z',8);K.box(.3,.06,.1,yel,x,1.93,0,g)}
 K.box(L,.14,.06,yel,0,2.0,0,g);K.box(L,.02,.14,yel,0,2.08,0,g);K.box(L,.02,.14,yel,0,1.92,0,g);
 const hx=.3;K.box(.15,.1,.2,dk,hx,1.86,0,g);K.cyl(.012,.5,P.black,hx,1.56,0,g,'y',8);K.box(.1,.15,.06,red,hx,1.24,0,g);K.torus(.04,.012,M.steel,hx,1.1,0,g,'z',16);K.cyl(.008,.7,P.black,hx+.08,1.5,.05,g,'y',6);
 return {group:g,height:2.09};
});

// === spillTray: Denios blue tilting spill containers on castor frames (opts.count) with a sump and drum ===========
MB.add('spillTray',(K,s)=>{const {H,P,M,T,g,o}=setup(K,s,{count:3});const n=Math.min(4,Math.max(1,+o.count||1));
 const blue=K.mat(0x1f4fb0,.25,.5),blk=P.black,galv=K.mat(0xaeb4b6,.7,.35),drum=K.mat(0x2a56b8,.3,.5);
 const pitch=.85;for(let i=0;i<n;i++){const t=H.grp(g,(i-(n-1)/2)*pitch-.4,0,0);
  for(const sx of[-1,1])for(const sz of[-1,1]){K.cyl(.05,.03,M.steel,sx*.32,.05,sz*.24,t,'x',16);K.box(.03,.06,.06,blk,sx*.32,.09,sz*.24,t);K.box(.08,.02,.08,blk,sx*.32,.125,sz*.24,t)}
  for(const sz of[-1,1])K.box(.8,.04,.04,blk,0,.155,sz*.28,t);for(const sx of[-1,1])K.box(.04,.04,.6,blk,sx*.38,.155,0,t);for(let k=0;k<3;k++)K.box(.04,.03,.56,blk,-.2+k*.2,.155,0,t);
  for(const z of[-.2,.2])K.cyl(.015,.55,blk,-.42,.44,z,t,'y',8);K.cyl(.015,.43,blk,-.42,.71,0,t,'z',8);K.cyl(.015,.43,blk,-.42,.3,0,t,'z',8);
  K.box(.6,.03,.42,blue,0,.19,0,t);for(const sz of[-1,1]){const w=K.box(.78,.4,.025,blue,0,.37,sz*.27,t);w.rotation.x=sz*.29}for(const sx of[-1,1]){const w=K.box(.025,.4,.6,blue,sx*.34,.37,0,t);w.rotation.z=-sx*.2}
  for(const sz of[-1,1])K.box(.8,.02,.03,blue,0,.58,sz*.335,t);for(const sx of[-1,1])K.box(.03,.02,.7,blue,sx*.39,.58,0,t);
  K.plate(t,'DENIOS',.14,.05,.1,.37,.302,'#ffffff','#1f4fb0');K.plate(t,String(s.lot||''),.08,.04,-.1,.37,.302,'#e3b82e','#1c1b18')}
 const sx=(n-1)/2*pitch+.45;K.box(.8,.15,.6,galv,sx,.075,0,g);H.grille(g,.76,.56,sx,.156,0).rotation.x=-PI/2;for(const a of[-1,1])for(const b of[-1,1])K.box(.08,.02,.08,P.dark,sx+a*.34,.01,b*.24,g);
 K.cyl(.29,.88,drum,sx,.6,0,g,'y',28);for(const y of[.38,.82])K.torus(.295,.012,P.dark,sx,y,0,g,'y',28);K.cyl(.26,.02,P.dark,sx,1.045,0,g,'y',24);K.cyl(.03,.015,P.yellow,sx+.15,1.06,0,g,'y',10);
 K.plate(g,'UN 1263',.2,.06,sx,.6,.296,'#ffffff','#1c1b18');H.warn(g,sx+.18,.7,.292,0,.08);H.nameplate(g,s,sx,.1,.306,.4,.06);
 return {group:g,height:1.06};
});

// === attachmentSet: KAUP clamp on a pallet, spare fork tines and fork extensions on another ======================
MB.add('attachmentSet',(K,s)=>{const {H,P,M,T,g}=setup(K,s,{});
 const dk=K.mat(0x2a2c2f,.4,.55),stl=K.mat(0x4b4f53,.5,.45);
 H.pallet(g,-.45,0,0,.8,1.2);H.pallet(g,.45,0,0,.8,1.2);
 // clamp: carriage plate with hooks, cylinder and hoses, two arm plates with their thick bases
 const c=H.grp(g,-.45,.16,0);K.box(.8,.7,.08,dk,0,.35,-.4,c);for(const sx of[-1,1]){K.box(.12,.15,.1,dk,sx*.3,.75,-.42,c);K.box(.12,.08,.08,dk,sx*.3,.04,-.44,c)}K.box(.9,.06,.4,dk,0,.03,-.2,c);
 K.cyl(.05,.7,M.steel,0,.3,-.33,c,'x',14);for(const sx of[-1,1])K.cyl(.03,.12,M.steel,sx*.4,.3,-.33,c,'x',10);
 H.hose(c,[[-.3,.3,-.3],[-.2,.5,-.25],[.1,.55,-.3]],.012,P.hose);H.hose(c,[[.3,.3,-.3],[.2,.2,-.22],[-.1,.15,-.3]],.012,P.hose);
 for(const sx of[-1,1]){K.box(.1,.5,.25,dk,sx*.4,.33,-.25,c);K.box(.04,.6,.9,dk,sx*.43,.36,.09,c);K.box(.02,.5,.8,P.rubber,sx*.4,.36,.1,c);K.box(.04,.04,.9,P.yellow,sx*.43,.67,.09,c)}
 H.nameplate(c,s,0,.55,-.354,.4,.1);H.logoBand(c,s,.7,0,.68,-.354,.04);H.warn(c,-.3,.28,-.354,0,.09);hazard(K,c,.8,.05,0,.03,-.354);
 // fork tines and extension sleeves on the second pallet
 for(const x of[.2,.35]){K.box(.12,.05,1.0,dk,x,.185,.1,g);K.box(.12,.5,.05,dk,x,.41,-.42,g);K.box(.12,.06,.06,dk,x,.63,-.42,g)}
 for(const x of[.55,.72]){K.box(.15,.012,1.5,stl,x,.246,0,g);K.box(.15,.012,1.5,stl,x,.166,0,g);for(const sx of[-1,1])K.box(.012,.08,1.5,stl,x+sx*.069,.206,0,g);K.box(.15,.012,.1,stl,x,.246,-.7,g)}
 K.plate(g,'FORK EXT. 1500',.3,.05,.45,.26,.76,'#e3b82e','#1c1b18').rotation.x=-PI/2;
 return {group:g,height:.95};
});
})();
