// General factory equipment of the Maynards Europe sales (maynards.js NEW_KINDS.general): packaged compressors, fiber
// laser sources, H2 / battery test benches, roll grinders, gear hobbing machines, machining centres, CNC lathes, robot
// welding cells, pallet racking, forklifts, control cabinets and chillers, the inline coater, transformers and
// switchgear, and the land plot. Each builder: (K, item) → {group, height, update(t, clock)}; the group's origin is
// the centre of the footprint on the floor (item.w along the row = x, item.d deep = z, the front towards +z), the
// geometry stays inside the footprint and rises to about item.h.
const grp=(K,parent,x=0,y=0,z=0)=>{const g=new K.THREE.Group();g.position.set(x,y,z);parent.add(g);return g};
// The materials every builder shares, made once per call.
const pal=K=>({frame:K.mat(0xd9d8d2,.2,.55),kick:K.mat(0x23262a,.3,.7),glass:K.M.glass,screen:K.mat(0x16191b,.2,.4,{emissive:0x5a87b0,emissiveIntensity:.55}),screenBack:K.mat(0x2b2e31,.3,.6),
 led:K.mat(0x3fa66b,0,.4,{emissive:0x3fa66b,emissiveIntensity:1}),orange:K.mat(0xe8772e,.25,.45),cable:K.mat(0x26292c,.1,.8),alu:K.mat(0xc9ccd0,.8,.3),hose:K.mat(0x3b6fb8,.1,.6),warn:K.mat(0xf2c21b,.1,.6),mesh:K.mat(0x6d7378,.5,.5,{transparent:true,opacity:.35})});
// Signal tower: base, pole, green / amber / red segments and a white cap; returns the lamp meshes.
function tower(K,parent,x,y,z){const g=grp(K,parent,x,y,z);K.cyl(.035,.04,K.M.dark,0,.02,0,g,'y',12);K.cyl(.012,.22,K.M.steel,0,.15,0,g,'y',8);
 const lamps=[0x3fa66b,0xd8a531,0xd2453b].map((c,i)=>K.cyl(.042,.07,K.mat(0x55575a,.1,.4,{emissive:c,emissiveIntensity:0}),0,.3+i*.075,0,g,'y',12));K.cyl(.044,.02,K.M.white,0,.53,0,g,'y',12);return lamps}
const blink=(lamps,clock)=>{if(!lamps)return;lamps[0].material.emissiveIntensity=.9;lamps[1].material.emissiveIntensity=Math.sin(clock*3)>0?.9:0;lamps[2].material.emissiveIntensity=0};
// Operator screen (a dark frame with a glowing panel) facing +z of its own group, turned by rotY.
const screen=(K,P,parent,x,y,z,w=.32,hh=.21,rotY=0)=>{const g=grp(K,parent,x,y,z);g.rotation.y=rotY;K.box(w,hh,.03,P.screenBack,0,0,0,g);K.box(w-.04,hh-.04,.004,P.screen,0,0,.017,g);return g};
const handle=(K,parent,x,y,z,len=.3,m)=>K.box(.025,len,.03,m||K.M.steel,x,y,z,parent);
// A stack of n louvre slats on a face (facing +z of its group, turned by rotY).
const louvres=(K,parent,m,x,y,z,w,n=8,gap=.05,rotY=0)=>{const g=grp(K,parent,x,y,z);g.rotation.y=rotY;for(let i=0;i<n;i++)K.box(w,.012,.025,m,0,i*gap,0,g);return g};
// A fan under a wire grille (ring and bars); returns the spinning group (about its local y; axis z or x turns the whole fan).
const fan=(K,parent,x,y,z,r,hub,blade,grille,n=6,axis='y')=>{const g=grp(K,parent,x,y,z);if(axis==='z')g.rotation.x=Math.PI/2;if(axis==='x')g.rotation.z=-Math.PI/2;K.torus(r,.015,grille,0,.03,0,g,'y',24);for(let i=-1;i<=1;i++)K.box(r*2*Math.sqrt(1-(i*.5)**2),.01,.015,grille,0,.03,i*r*.5,g);
 const rot=grp(K,g,0,0,0);K.cyl(r*.2,.06,hub,0,0,0,rot,'y',12);for(let i=0;i<n;i++){const a=i/n*Math.PI*2,b=K.box(r*.8,.01,r*.28,blade,Math.cos(a)*r*.5,0,-Math.sin(a)*r*.5,rot);b.rotation.set(.5,a,0)}return rot};
// A six-axis arm (turret, upper arm, forearm, wrist) sized by k, standing on parent at (x, .2, z).
function robotArm(K,parent,x,z,k,paint){const turret=grp(K,parent,x,.2,z);K.cyl(.3*k,.24*k,paint,0,.12*k,0,turret);K.box(.34*k,.3*k,.4*k,paint,0,.36*k,0,turret);const upper=grp(K,turret,0,.42*k,0);K.box(.2*k,1*k,.22*k,paint,0,.5*k,0,upper);K.cyl(.12*k,.3*k,K.M.dark,0,0,0,upper,'z',14);
 const fore=grp(K,upper,0,1*k,0);K.box(.85*k,.17*k,.19*k,paint,.38*k,0,0,fore);K.cyl(.11*k,.26*k,K.M.dark,0,0,0,fore,'z',14);K.cyl(.07*k,.12*k,K.M.dark,.85*k,0,0,fore,'x');const wrist=grp(K,fore,.94*k,0,0);return {turret,upper,fore,wrist}}
// Enclosure walls for a machine tool: base, back and side walls, roof, a lower front apron; the front above the apron is left to the caller.
function enclosure(K,parent,P,w,d,h,body,apron=.9){K.box(w,.1,d,P.kick,0,.05,0,parent);K.box(w,h-.1,.06,body,0,h/2+.05,-d/2+.03,parent);for(const sx of[-1,1])K.box(.06,h-.1,d,body,sx*(w/2-.03),h/2+.05,0,parent);K.box(w,.08,d,body,0,h-.04,0,parent);
 K.box(w,apron-.1,.06,body,0,apron/2+.05,d/2-.03,parent);K.box(w,.06,.08,P.frame,0,apron,d/2-.04,parent);K.box(w,.06,.08,P.frame,0,h-.1,d/2-.04,parent)}
// A sliding door with a window in the front opening, from x0 to x1 between y0 and y1.
function door(K,parent,P,body,x0,x1,y0,y1,z,win=.6){const cx=(x0+x1)/2,dw=x1-x0,dh=y1-y0;K.box(dw,dh,.04,body,cx,y0+dh/2,z,parent);K.box(dw-.16,dh*win,.012,P.glass,cx,y0+dh*.55,z+.025,parent).castShadow=false;K.box(dw-.16,.03,.03,K.M.dark,cx,y0+dh*.55+dh*win/2,z+.03,parent);K.box(dw-.16,.03,.03,K.M.dark,cx,y0+dh*.55-dh*win/2,z+.03,parent);handle(K,parent,x1-.12,y0+dh*.45,z+.045,.3)}
// Control panel on a swivel arm reaching out of the enclosure corner at (x, z) facing +z.
function pendant(K,parent,P,x,y,z,arm=.4){K.box(.05,.05,arm,K.M.dark,x,y+.3,z-arm/2,parent);K.box(.05,.5,.05,K.M.dark,x,y+.05,z,parent);K.box(.5,.65,.12,P.frame,x,y,z,parent);screen(K,P,parent,x,y+.12,z+.07,.36,.24);for(let i=0;i<5;i++)K.cyl(.015,.02,i===4?K.M.red:K.M.dark,x-.16+i*.08,y-.18,z+.065,parent,'z',8);K.cyl(.05,.02,K.M.steel,x+.16,y-.18,z+.07,parent,'z',14)}
// Chip conveyor: an inclined trough leaving the machine towards +x, dropping into a bin.
function chipConveyor(K,parent,P,x0,x1,z,y0,y1){const len=Math.hypot(x1-x0,y1-y0),c=K.box(len,.25,.4,K.M.dark,(x0+x1)/2,(y0+y1)/2,z,parent);c.rotation.z=Math.atan2(y1-y0,x1-x0);K.box(.08,.25,.44,K.M.steel,x1,y1,z,parent);K.box(.6,.55,.7,P.frame,x1+.1,.28,z,parent);K.box(.56,.05,.66,K.M.dark,x1+.1,.56,z,parent);for(const sx of[-1,1])for(const sz of[-1,1])K.cyl(.05,.04,K.M.dark,x1+.1+sx*.22,.05,z+sz*.28,parent,'x',8)}

// Packaged screw compressor (Atlas Copco GA style): a steel canopy on a base frame with louvred panels, the display and
// make on the front, an emergency stop, the cooling fan in the roof; beside it the vertical air receiver on legs (or the
// refrigerant dryer cabinet when the lot is a dryer), piped to the canopy.
export function buildCompressor(K,item){
 const T=K.THREE,M=K.M,P=pal(K),g=new T.Group(),w=item.w,d=item.d,h=item.h,dryer=/dryer/i.test(`${item.type||''} ${item.name||''}`);
 const body=K.mat(0x4b5a66,.35,.5),trim=K.mat(0xd9d8d2,.2,.55),tank=K.mat(0x3d7ab8,.4,.4),led=K.mat(0x1d1f22,.2,.4,{emissive:0x3fa66b,emissiveIntensity:1});
 const ew=w*.6,ed=d*.9,eh=h*.87,ex=-w/2+ew/2+.05,e=grp(K,g,ex,0,0);
 K.box(ew,.1,ed,P.kick,0,.05,0,e);K.box(ew,eh-.1,ed,body,0,eh/2+.05,0,e);K.box(ew+.02,.06,ed+.02,trim,0,eh-.03,0,e);K.box(ew+.02,.06,ed+.02,trim,0,.13,0,e);for(const sx of[-1,1])K.box(.06,eh,ed+.02,trim,sx*(ew/2-.03),eh/2,0,e);K.box(.04,eh-.2,.02,trim,0,eh/2,ed/2+.01,e);
 louvres(K,e,P.kick,-ew/4,.35,ed/2+.02,ew/2-.15,10,.06);louvres(K,e,P.kick,-ew/2-.02,.45,0,ed-.3,12,.07,-Math.PI/2);louvres(K,e,P.kick,0,eh-.55,-ed/2-.02,ew-.3,6,.06,Math.PI);
 screen(K,P,e,ew/4,eh*.66,ed/2+.03,.28,.18);K.plate(e,item.make||'',ew/2-.2,.12,ew/4,eh*.86,ed/2+.012);K.box(.02,.02,.01,led,ew/4+.2,eh*.66+.14,ed/2+.025,e);
 K.cyl(.035,.015,M.yellow,ew/4+.25,eh*.45,ed/2+.02,e,'z',12);K.cyl(.022,.03,M.red,ew/4+.25,eh*.45,ed/2+.03,e,'z',10);handle(K,e,-ew/2+.12,eh*.5,ed/2+.035,.35);handle(K,e,ew/2-.12,eh*.5,ed/2+.035,.35);
 const rot=fan(K,e,-ew/4,eh+.01,0,.27,M.dark,P.alu,M.dark);K.box(ew/2-.2,.03,.4,P.kick,ew/4,eh+.015,0,e);
 const moving=[t=>{rot.rotation.y=t*7}];let height=eh+.1;
 if(dryer){
  // Refrigerant dryer: a smaller white cabinet with its condenser fan, display, copper refrigerant lines and the condensate drain.
  const dw=w*.3,dd=d*.7,dh=h*.75,dx=w/2-dw/2-.05;K.box(dw,dh-.08,dd,M.white,dx,dh/2+.04,0,g);K.box(dw-.04,.08,dd-.04,P.kick,dx,.04,0,g);K.box(dw+.01,.05,dd+.01,body,dx,dh-.03,0,g);
  const f2=fan(K,g,dx,dh+.01,0,.2,M.dark,P.alu,M.dark,5);moving.push(t=>{f2.rotation.y=t*5});screen(K,P,g,dx,dh*.75,dd/2+.03,.22,.14);K.plate(g,'DRYER',dw-.15,.1,dx,dh*.55,dd/2+.012);louvres(K,g,P.kick,dx,.3,dd/2+.02,dw-.15,7,.06);
  for(const z of[-.15,.15])K.pipe([[ex+ew/2,dh*.5,z-.2],[dx-dw/2,dh*.5,z-.2]],.02,M.copper,g);K.pipe([[dx,.3,dd/2],[dx,.05,dd/2+.1]],.012,P.hose,g);height=Math.max(height,dh+.08);
 }else{
  // Air receiver: a vertical tank with dished ends on three legs, gauge, safety valve, drain and the air line from the canopy.
  const tx=w/2-.4,r=Math.min(.3,d/2-.2),ty0=.55,L=h-.3-2*ty0+.3;for(let i=0;i<3;i++){const a=i/3*Math.PI*2+Math.PI/6;K.box(.06,.4,.06,M.dark,tx+r*.75*Math.cos(a),.2,r*.75*Math.sin(a),g)}
  K.sphere(r,tank,tx,ty0,0,g,20);K.cyl(r,L,tank,tx,ty0+L/2,0,g,'y',24);K.sphere(r,tank,tx,ty0+L,0,g,20);K.cyl(.03,.1,M.steel,tx,ty0+L+r+.03,0,g,'y',8);K.cyl(.045,.06,M.copper,tx,ty0+L+r+.1,0,g,'y',10);
  K.cyl(.055,.04,M.white,tx,ty0+L*.8,r+.02,g,'z',14);K.cyl(.02,.06,M.steel,tx,ty0+L*.8,r,g,'z',8);K.cyl(.02,.1,M.steel,tx,ty0-r+.02,0,g,'y',8);K.box(.08,.04,.04,M.red,tx,ty0-r-.02,.05,g);K.plate(g,'8 bar',r*1.4,.1,tx,ty0+L*.5,r+.005);
  K.pipe([[ex+ew/2,.6,-.3],[tx-r-.2,.6,-.3],[tx-r-.2,ty0+L*.3,-.3],[tx-r+.05,ty0+L*.3,-.1]],.03,M.steel,g);K.pipe([[tx+r-.05,ty0+L*.3,.1],[tx+r+.1,ty0+L*.3,.1],[tx+r+.1,.1,.1]],.03,M.steel,g);height=Math.max(height,ty0+L+r+.13);
 }
 return {group:g,height,update:(t,clock)=>{moving.forEach(f=>f(t));led.emissiveIntensity=.6+.4*Math.sin(clock*2)}};
}

// Fiber laser source (IPG YLS style): a 19" rack cabinet on casters with a perforated door, vent rows, status LEDs (the
// emission LED pulses), a display, class-4 warning and make labels; the process fibre on its spool on a bracket above the
// chiller unit, whose hoses run to the cabinet.
export function buildLaser(K,item){
 const T=K.THREE,M=K.M,P=pal(K),g=new T.Group(),w=item.w,d=item.d,h=item.h;
 const body=K.mat(0x2b2f33,.4,.5),doorM=K.mat(0x3a4046,.4,.45),fibre=K.mat(0xf2c21b,.1,.5),led=K.mat(0x1d1f22,.2,.4,{emissive:0xd2453b,emissiveIntensity:1});
 const cw=Math.min(.62,w*.45),cd=d*.9,ch=h*.95,cx=-w/2+cw/2+.06,c=grp(K,g,cx,0,0);
 K.box(cw,ch-.08,cd,body,0,ch/2+.04,0,c);for(const sx of[-1,1])for(const sz of[-1,1])K.cyl(.04,.06,M.dark,sx*(cw/2-.08),.04,sz*(cd/2-.08),c,'x',10);
 K.box(cw-.08,ch-.3,.02,doorM,0,ch/2+.08,cd/2+.01,c);handle(K,c,cw/2-.1,ch*.5,cd/2+.035,.25);for(let i=0;i<7;i++)K.box(cw-.22,.03,.01,M.dark,-.04,ch*.16+i*.07,cd/2+.025,c);
 for(let i=0;i<4;i++)K.box(.02,.02,.01,i?P.led:led,-cw/2+.1+i*.05,ch*.9,cd/2+.025,c);screen(K,P,c,.1,ch*.82,cd/2+.035,.2,.12);
 K.plate(c,'LASER 4',cw-.2,.09,0,ch*.7,cd/2+.025,'#f2c21b','#1c1b18');K.plate(c,item.make||'',cw-.25,.08,0,ch*.62,cd/2+.025);K.plate(c,item.model||'',cw-.25,.06,0,ch*.57,cd/2+.025,'#2b2f33','#9aa0a4');
 for(let i=0;i<5;i++)for(let k=0;k<3;k++)K.box(.01,.14,.14,M.dark,cw/2+.005,ch*.3+i*.17,-cd/2+.2+k*.25,c);for(let i=0;i<4;i++)K.cyl(.02,.03,M.steel,-cw/2+.1+i*.12,ch*.15,-cd/2-.01,c,'z',8);
 // Chiller beside the cabinet: a white unit with a condenser fan, display and the two coolant hoses; the fibre spool on a bracket over it.
 const sx=w/2-.3,uw=Math.min(.5,w-cw-.3),ud=cd*.8,uh=h*.45;K.box(uw,uh-.06,ud,M.white,sx,uh/2+.03,0,g);K.box(uw-.04,.06,ud-.04,P.kick,sx,.03,0,g);const f=fan(K,g,sx,uh*.6,ud/2+.02,.14,M.dark,P.alu,M.dark,5,'z');
 screen(K,P,g,sx,uh*.9,ud/2+.03,.18,.1);K.plate(g,'CHILLER',uw-.12,.07,sx,uh*.3,ud/2+.012);for(const z of[-.1,.1])K.pipe([[sx-.1,uh,z-.2],[sx-.1,uh+.2,z-.25],[cx+cw/2,uh+.2,z-.25]],.018,P.hose,g);
 K.box(.06,.06,ud*.6,M.steel,cx+cw/2+.03,ch*.75,0,g);K.box(sx-cx-cw/2,.06,.06,M.steel,(sx+cx+cw/2)/2,ch*.75,0,g);K.cyl(.05,.08,M.dark,sx,ch*.75,.04,g,'z',12);K.torus(.24,.035,fibre,sx,ch*.75,.0,g,'z',28);K.torus(.26,.012,M.steel,sx,ch*.75,-.05,g,'z',28);K.torus(.26,.012,M.steel,sx,ch*.75,.05,g,'z',28);
 K.pipe([[sx,ch*.75+.26,0],[sx-.15,ch*.75+.32,-.1],[cx+.15,ch+.02,-.1],[cx,ch-.05,-.1]],.012,fibre,g);K.pipe([[sx+.2,ch*.75-.1,.0],[sx+.22,.3,.2],[sx+.15,.05,cd/2]],.012,fibre,g);
 return {group:g,height:Math.max(ch,ch*.75+.33),update:(t,clock)=>{led.emissiveIntensity=.5+.5*Math.sin(clock*5);f.rotation.y=t*6}};
}

// Test bench. Horiba H2 fuel-cell bench: an aluminium-profile frame with a glass front, the stack under test on its table,
// gas panels with regulators and gauges on the back wall, cable trees from the roof, the exhaust duct, a screen on a swing
// arm, the gas / power cabinet with a hydrogen bottle. Digatron battery testers: a cabinet of test channels (rows of
// modules with LEDs and terminals) and cable bundles to a test table of battery modules.
export function buildTestbench(K,item){
 const T=K.THREE,M=K.M,P=pal(K),g=new T.Group(),w=item.w,d=item.d,h=item.h,battery=/battery|digatron|cycler/i.test(`${item.type||''} ${item.make||''} ${item.name||''}`);
 const alu=P.alu,panel=K.mat(0xdedbd3,.2,.55),cell=K.mat(0x2c4f8a,.3,.5),chan=K.mat(0x1d2024,.3,.5),led=K.mat(0x1d1f22,.2,.4,{emissive:0x3fa66b,emissiveIntensity:1});
 let lamps,height;
 if(battery){
  const cw=1.3,cd=d*.45,ch=h*.9,cx=-w/2+cw/2+.1,cz=-d/2+cd/2+.05,c=grp(K,g,cx,0,cz);K.box(cw,ch,cd,P.frame,0,ch/2,0,c);K.box(cw-.04,.08,cd-.04,P.kick,0,.04,0,c);
  for(let r=0;r<5;r++)for(let i=0;i<4;i++){const x=-cw/2+.18+i*.31,y=.35+r*.3;K.box(.28,.24,.03,chan,x,y,cd/2+.01,c);K.box(.025,.025,.01,led,x+.1,y+.08,cd/2+.03,c);for(let k=0;k<2;k++)K.cyl(.015,.02,M.copper,x-.08+k*.07,y-.06,cd/2+.03,c,'z',8)}
  screen(K,P,c,0,ch-.2,cd/2+.03,.5,.3);K.plate(c,item.make||'',.6,.12,0,ch-.45,cd/2+.02);
  const tx=w/2-.75,tz=d/2-.6,t=grp(K,g,tx,0,tz);for(const sx of[-1,1])for(const sz of[-1,1])K.box(.05,.8,.05,alu,sx*.6,.4,sz*.4,t);K.box(1.3,.05,.9,P.frame,0,.82,0,t);K.box(1.2,.03,.8,M.dark,0,.3,0,t);
  for(let i=0;i<3;i++){K.box(.3,.22,.5,cell,-.4+i*.4,.96,0,t);K.box(.28,.03,.46,M.dark,-.4+i*.4,1.08,0,t);for(const k of[-1,1])K.cyl(.02,.04,M.copper,-.4+i*.4+k*.1,1.11,.15,t,'y',8)}
  for(let i=0;i<5;i++)K.pipe([[cx+cw/2-.05,.5+i*.3,cz+cd/2-.1],[cx+cw/2+.3,.6+i*.25,cz+cd/2+.2],[tx-.4+i*.2,1.3,tz-.2],[tx-.4+i*.2,1.12,tz+.1]],.02,P.cable,g);
  lamps=tower(K,g,cx+cw/2-.15,ch,cz-cd/2+.15);height=ch+.55;
 }else{
  const fw=w*.72,fd=d*.8,fh=h*.9,fx=-w/2+fw/2+.08,f=grp(K,g,fx,0,0);
  for(const sx of[-1,1])for(const sz of[-1,1])K.box(.08,fh,.08,alu,sx*(fw/2-.04),fh/2,sz*(fd/2-.04),f);for(const y of[.04,fh-.04]){for(const sz of[-1,1])K.box(fw,.08,.08,alu,0,y,sz*(fd/2-.04),f);for(const sx of[-1,1])K.box(.08,.08,fd,alu,sx*(fw/2-.04),y,0,f)}
  K.box(fw-.1,fh-.1,.02,panel,0,fh/2,-fd/2+.04,f);K.box(fw,.04,fd,panel,0,fh,0,f);for(const sx of[-1,1])K.box(.02,fh-.1,fd-.1,P.glass,sx*(fw/2-.04),fh/2,0,f).castShadow=false;
  K.box(fw-.1,fh*.55,.012,P.glass,0,fh*.65,fd/2-.04,f).castShadow=false;K.box(fw-.1,fh*.35,.02,panel,0,fh*.175+.04,fd/2-.04,f);handle(K,f,fw/4,fh*.6,fd/2,.4);
  K.box(fw-.4,.05,fd-.5,M.steel,0,.85,0,f);for(const sx of[-1,1])K.box(.05,.85,.05,alu,sx*(fw/2-.3),.425,0,f);const stack=grp(K,f,-.2,1.03,0);for(let i=0;i<9;i++)K.box(.025,.3,.3,i%2?M.dark:M.steel,-.14+i*.035,0,0,stack);for(const sx of[-1,1])K.box(.03,.36,.36,alu,sx*.18,0,0,stack);
  K.pipe([[-.38,1.03,0],[-.5,1.03,-.2],[-.5,fh-.3,-fd/2+.1]],.02,P.hose,f);K.pipe([[0,1.03,0],[.2,1.25,-.3],[.3,fh-.3,-fd/2+.1]],.02,M.red,f);
  for(let i=0;i<4;i++){const x=-fw/2+.35+i*.3,y=fh*.62;K.box(.22,.5,.04,M.steel,x,y,-fd/2+.08,f);K.cyl(.05,.04,M.white,x,y+.14,-fd/2+.12,f,'z',14);K.cyl(.03,.08,M.dark,x,y-.05,-fd/2+.13,f,'z',10);K.cyl(.015,.06,M.red,x,y-.17,-fd/2+.12,f,'z',8);K.pipe([[x,y-.25,-fd/2+.1],[x,.9,-fd/2+.1],[x,.9,-fd/2+.3]],.012,M.steel,f)}
  for(let i=0;i<3;i++)K.pipe([[.3+i*.15,fh-.05,.2],[.3+i*.15,1.5,.2-i*.1],[.1+i*.1,1.12,.1]],.015,P.cable,f);
  K.cyl(.08,.3,M.steel,fw/2-.3,fh+.15,-fd/2+.3,f);K.torus(.08,.02,M.dark,fw/2-.3,fh+.3,-fd/2+.3,f,'y',16);
  K.box(.6,.04,.04,M.dark,fw/2+.25,fh*.7,fd/2-.1,f);K.box(.04,.12,.04,M.dark,fw/2+.5,fh*.7-.07,fd/2-.03,f);screen(K,P,f,fw/2+.5,fh*.65,fd/2+.05,.4,.28);
  const cx=w/2-.4,cz=-d*.15,cd=fd*.6;K.box(.7,h*.75,cd,P.frame,cx,h*.375,cz,g);screen(K,P,g,cx,h*.6,cz+cd/2+.03,.3,.2);handle(K,g,cx+.25,h*.4,cz+cd/2+.03,.3);K.plate(g,'H2',.2,.2,cx,h*.3,cz+cd/2+.02,'#d2453b','#ffffff');
  const bz=d/2-.3,bx=cx-.2;K.cyl(.1,1.2,M.red,bx,.6,bz,g,'y',16);K.sphere(.1,M.red,bx,1.2,bz,g,12);K.cyl(.03,.12,M.steel,bx,1.34,bz,g,'y',8);K.box(.03,.03,bz-(cz+cd/2)+.02,M.steel,bx,1.0,(bz+cz+cd/2)/2,g);
  lamps=tower(K,g,fx+fw/2-.15,fh+.04,-fd/2+.15);height=fh+.6;
 }
 return {group:g,height,update:(t,clock)=>{blink(lamps,clock);led.emissiveIntensity=.6+.4*Math.sin(clock*4)}};
}

// Roll / cylindrical grinder: the long bed with its ways, the headstock (motor, chuck) and tailstock (centre), the roll
// between them, the wheel head on a cross slide behind the roll (wheel, guard, motor, coolant nozzle), splash guards
// with windows, the coolant tank on the right and the control pendant on the left; the roll and wheel turn, the slide traverses.
export function buildGrinder(K,item){
 const T=K.THREE,M=K.M,P=pal(K),g=new T.Group(),w=item.w,d=item.d,h=item.h;
 const bed=K.mat(0x6b7d6a,.3,.55),paint=K.mat(0xdedbd3,.2,.55),guard=K.mat(0x8e9aa0,.4,.45),wheel=K.mat(0xd8d2c0,.05,.9);
 const bw=w-.5,bh=.75,bz=.15,bf=bz-.2+d*.325;K.box(bw,bh-.1,d*.65,bed,0,bh/2+.05,bz-.2,g);K.box(bw-.1,.1,d*.6,P.kick,0,.05,bz-.2,g);for(const z of[-.2,.2])K.box(bw-.2,.06,.12,M.steel,0,bh+.03,bz+z,g);
 const hx=-bw/2+.45,tx=bw/2-.35,ry=bh+.55;K.box(.8,.95,.8,paint,hx,bh+.5,bz,g);K.cyl(.2,.25,M.dark,hx+.5,ry,bz,g,'x',20);for(let i=0;i<3;i++){const a=i/3*Math.PI*2;K.box(.1,.06,.06,M.steel,hx+.65,ry+.14*Math.cos(a),bz+.14*Math.sin(a),g)}K.cyl(.18,.4,M.dark,hx,bh+1.15,bz-.1,g,'x',16);
 K.box(.5,.7,.6,paint,tx,bh+.4,bz,g);K.cyl(.05,.3,M.steel,tx-.35,ry,bz,g,'x',10);K.box(.12,.12,.12,M.dark,tx+.25,ry,bz,g);K.cyl(.03,.2,M.steel,tx+.35,ry,bz,g,'x',8);
 const roll=K.cyl(.17,tx-hx-1.1,M.steel,(hx+tx)/2+.1,ry,bz,g,'x',24);
 const slide=grp(K,g,0,bh,bz-.6);K.box(1.1,.25,.7,bed,0,.12,0,slide);K.box(.9,.5,.6,paint,0,.5,-.1,slide);const whl=K.cyl(.32,.08,wheel,0,.55,.4,slide,'x',28);K.cyl(.1,.1,M.dark,0,.55,.4,slide,'x',14);K.cyl(.12,.5,M.dark,0,.9,-.2,slide,'x',14);K.box(.5,.4,.14,guard,0,.8,.4,slide);
 K.pipe([[.3,1.0,-.1],[.3,1.1,.3],[.15,.9,.5]],.015,P.hose,slide);
 // Splash guards: the rear wall and two side walls stand on the floor outside the bed, open at the front; a window pane on posts at the front.
 const gz=-1.0,gh=bh+1.05,gx=bw/2+.1;K.box(gx*2+.04,gh,.04,guard,0,gh/2+.05,gz,g);K.box(bw*.4,.5,.01,P.glass,0,bh+.75,gz+.03,g).castShadow=false;for(const sx of[-1,1])K.box(.04,gh,.7-gz,guard,sx*gx,gh/2+.05,(gz+.7)/2,g);
 K.box(bw*.35,.6,.02,P.glass,-bw*.1,bh+.55,bf,g).castShadow=false;K.box(bw*.35,.04,.04,M.dark,-bw*.1,bh+.86,bf,g);K.box(bw*.35,.04,.04,M.dark,-bw*.1,bh+.25,bf,g);for(const sx of[-1,1])K.box(.04,.9,.04,M.dark,-bw*.1+sx*bw*.175,bh+.45,bf,g);
 K.box(.9,.5,.45,M.dark,w/2-.5,.25,d/2-.25,g);K.cyl(.06,.2,M.steel,w/2-.5,.6,d/2-.25,g,'y',10);K.pipe([[w/2-.5,.7,d/2-.25],[w/2-.5,1.0,d/2-.5],[.4,1.1,bz-.3]],.025,P.hose,g);K.plate(g,'COOLANT',.4,.08,w/2-.5,.3,d/2-.02);
 const px=-w/2+.45,pz=d/2-.3;K.box(.3,.3,.3,M.dark,px,.15,pz,g);K.box(.06,1.1,.06,M.steel,px,.7,pz,g);K.box(.5,.55,.2,P.frame,px,1.35,pz,g);screen(K,P,g,px,1.4,pz+.11,.36,.26);for(let i=0;i<3;i++)K.cyl(.02,.02,[M.red,M.yellow,P.led][i],px-.15+i*.12,1.15,pz+.11,g,'z',8);
 K.plate(g,item.make||'',1.0,.16,-bw*.1,bh*.55,bf+.005);const lamps=tower(K,g,bw/2-.5,gh+.05,gz);
 return {group:g,height:bh+1.1+.55,update:(t,clock)=>{roll.rotation.x=t*1.5;whl.rotation.x=-t*12;slide.position.x=.6*Math.sin(t*.4);blink(lamps,clock)}};
}

// Gear hobbing / grinding machine (Liebherr LC, Gleason): the enclosure with a part-open sliding door and a fixed window;
// inside the column with the hob head (the hob turns), the work spindle with a toothed gear blank under the tailstock
// arm; the chip conveyor leaving to the right into its bin, the control pendant on a swivel arm, the hydraulic cabinet.
export function buildHobbing(K,item){
 const T=K.THREE,M=K.M,P=pal(K),g=new T.Group(),w=item.w,d=item.d,h=item.h;
 const body=K.mat(0xdedbd3,.2,.55),accent=K.mat(0x2c4f8a,.3,.5),gear=K.mat(0xb8a06a,.6,.4);
 const ew=w-.9,ed=d-.3,eh=h-.4,ex=-.3,e=grp(K,g,ex,0,0);enclosure(K,e,P,ew,ed,eh,body,.9);K.box(ew+.02,.3,ed+.02,accent,0,eh-.25,0,e);K.plate(e,`${item.make||''} ${item.model||''}`.trim()||'HOBBING',1.2,.16,0,eh-.25,ed/2+.02);
 door(K,e,P,body,-ew/2+.1,-.15,.9,eh-.3,ed/2-.02,.6);K.box(ew/2-.1,eh-1.2,.04,body,ew/4+.05,.9+(eh-1.2)/2,ed/2-.04,e);K.box(ew/2-.3,(eh-1.2)*.55,.012,P.glass,ew/4+.05,.9+(eh-1.2)*.5,ed/2-.01,e).castShadow=false;
 const col=grp(K,e,-ew/4,0,-ed/4);K.box(.6,eh-.5,.6,accent,0,(eh-.5)/2+.1,0,col);K.box(.7,.2,.7,M.dark,0,.2,0,col);const head=grp(K,col,0,1.45,.5);K.box(.5,.4,.5,body,0,0,0,head);K.box(.2,.3,.2,M.dark,.2,-.25,0,head);
 // The hob (axis x) is tangent to the gear blank's outside diameter (gear r .26 + hob r .12 behind the gear axis), over the gear's middle.
 const hob=grp(K,head,0,-.3,-.17);K.cyl(.12,.45,M.steel,0,0,0,hob,'x',12);for(let i=0;i<6;i++){const a=i/6*Math.PI*2;K.box(.44,.02,.03,M.dark,0,.12*Math.cos(a),.12*Math.sin(a),hob)}
 const gx=-ew/4+.15,gz=-ed/4+.7;K.cyl(.32,.5,M.dark,gx,.45,gz,e,'y',20);const spin=grp(K,e,gx,.75,gz);K.cyl(.3,.1,M.steel,0,0,0,spin,'y',20);K.cyl(.25,.14,gear,0,.35,0,spin,'y',24);for(let i=0;i<20;i++){const a=i/20*Math.PI*2;K.box(.06,.14,.05,gear,.26*Math.cos(a),.35,.26*Math.sin(a),spin).rotation.y=-a}K.cyl(.05,.3,M.steel,0,.22,0,spin,'y',10);
 K.box(.12,1.4,.12,accent,gx,.8,gz+.42,e);K.box(.12,.12,.5,accent,gx,1.4,gz+.2,e);K.cyl(.04,.2,M.steel,gx,1.27,gz,e,'y',10);
 chipConveyor(K,g,P,ex+ew/2-.4,ex+ew/2+.25,.3,.3,.9);pendant(K,g,P,ex+ew/2-.4,1.35,ed/2+.12);
 const cx=w/2-.3;K.box(.5,1.6,.6,P.frame,cx,.8,-d/2+.4,g);handle(K,g,cx+.15,.9,-d/2+.71,.3);K.box(.4,.2,.4,M.dark,cx,1.7,-d/2+.4,g);K.pipe([[cx-.25,1.2,-d/2+.4],[ex+ew/2,1.2,-d/2+.5]],.02,P.hose,g);
 const lamps=tower(K,e,ew/2-.2,eh,-ed/2+.2);
 return {group:g,height:eh+.55,update:(t,clock)=>{hob.rotation.x=t*8;spin.rotation.y=t*.9;head.position.y=1.45+.08*Math.sin(t*.6);blink(lamps,clock)}};
}

// Machining centre: the full enclosure with two sliding doors and windows (the spindle head over the table behind them),
// the tool magazine drum bulging out of the left side, the chip conveyor and bin, the control panel on a swivel arm and
// the tower. Horizontal centres (SW BA, 'space', 'horizontal') get the pallet-changer housing on the right instead of
// the right-hand conveyor, which then leaves under the magazine on the left.
export function buildMachiningCenter(K,item){
 const T=K.THREE,M=K.M,P=pal(K),g=new T.Group(),w=item.w,d=item.d,h=item.h,horizontal=/horizontal|sw ba|space/i.test(`${item.type||''} ${item.make||''} ${item.model||''} ${item.name||''}`);
 const body=K.mat(0xe4e2dc,.2,.55),accent=K.mat(0x3a4650,.4,.5),mag=K.mat(0x8e9aa0,.4,.45);
 const ew=horizontal?w-1.6:w-1.5,ex=horizontal?0:.05,ed=d-.5,eh=h-.3,ez=-.1,e=grp(K,g,ex,0,ez);enclosure(K,e,P,ew,ed,eh,body,.8);K.box(ew+.02,.25,ed+.02,accent,0,eh-.2,0,e);K.plate(e,`${item.make||''} ${item.model||''}`.trim()||'VMC',1.4,.16,0,eh-.2,ed/2+.02);
 door(K,e,P,body,-ew/2+.1,-.05,.8,eh-.3,ed/2-.02,.55);door(K,e,P,body,0,ew/2-.1,.8,eh-.3,ed/2-.06,.55);
 // Column at the back, the head on its face: a vertical spindle over the fixture (tool tip just on it), or a horizontal one aimed at the fixture on the pallet in front of it.
 K.box(.8,eh-.4,.5,accent,0,(eh-.4)/2+.1,-ed/2+.35,e);const head=grp(K,e,0,horizontal?eh*.6:eh*.7,-ed/2+.8);K.box(.5,.6,.5,body,0,0,0,head);const spindle=horizontal?K.cyl(.08,.3,M.steel,0,-.1,.35,head,'z',16):K.cyl(.08,.4,M.steel,0,-.3,0,head,'y',16);if(horizontal)K.cyl(.04,.1,M.dark,0,-.1,.55,head,'z',8);else K.cyl(.04,.1,M.dark,0,-.5,0,head,'y',8);
 const tz=horizontal?.3:-.2;K.box(1.0,.3,.8,M.dark,0,.95,tz,e);if(horizontal){K.box(.8,.1,.8,M.steel,0,1.15,tz,e);K.box(.5,.9,.5,P.alu,0,1.65,tz,e)}else{K.box(.9,.06,.7,M.steel,0,1.13,tz,e);K.box(.5,.2,.3,P.alu,0,1.26,tz,e)}
 const mx=-ew/2-.3,my=1.6;K.box(.5,1.0,.5,mag,mx,.5,-.3,e);K.cyl(.4,1.2,mag,mx,my,-.3,e,'y',24);K.box(.4,1.2,.8,mag,mx+.2,my,-.3,e);K.cyl(.42,.05,M.dark,mx,my+.62,-.3,e,'y',24);const drum=grp(K,e,mx,my+.62,-.3);for(let i=0;i<10;i++){const a=i/10*Math.PI*2;K.cyl(.035,.14,M.dark,.33*Math.cos(a),.05,.33*Math.sin(a),drum,'y',8);K.cyl(.02,.1,M.steel,.33*Math.cos(a),.16,.33*Math.sin(a),drum,'y',6)}K.box(.3,.4,.02,P.glass,mx-.1,my,-.3+.41,e).castShadow=false;
 if(horizontal){const px=ew/2+.35;K.box(.7,1.5,1.6,body,px,.8,-.2,e);K.box(.7,.08,1.6,accent,px,1.56,-.2,e);K.cyl(.33,.1,M.dark,px,1.65,-.2,e,'y',20);for(const sz of[-1,1]){K.box(.5,.1,.5,M.steel,px,1.75,-.2+sz*.4,e);K.box(.3,.5,.3,P.alu,px,2.05,-.2+sz*.4,e)}K.box(.6,.6,.05,P.glass,px,1.0,.6,e).castShadow=false;
  const cc=grp(K,g,0,0,0);cc.rotation.y=Math.PI;chipConveyor(K,cc,P,ew/2-.3-ex,w/2-.5,-.45,.3,.85)}
 else chipConveyor(K,g,P,ex+ew/2-.3,ex+ew/2+.25,.4,.3,.85);
 pendant(K,g,P,ex+ew/2-.4,1.4,ez+ed/2+.12);const lamps=tower(K,e,ew/2-.2,eh,-ed/2+.2);
 return {group:g,height:eh+.55,update:(t,clock)=>{spindle.rotation[horizontal?'z':'y']=t*25;head.position.x=.3*Math.sin(t*.7);drum.rotation.y=Math.floor(t*.5)*Math.PI/5;blink(lamps,clock)}};
}

// CNC lathe: the slant-bed enclosure with the sliding door open on the chuck (jaws, bar) and the indexing turret with its
// tools, headstock and tailstock, the control panel on the right with its screen and keyboard, the chip bin behind it fed
// by a short conveyor, and the tower.
export function buildLathe(K,item){
 const T=K.THREE,M=K.M,P=pal(K),g=new T.Group(),w=item.w,d=item.d,h=item.h;
 const body=K.mat(0xdedbd3,.2,.55),accent=K.mat(0x2f7f86,.3,.5);
 const ew=w-.9,ed=d-.1,eh=h-.3,ex=-.3,e=grp(K,g,ex,0,0);enclosure(K,e,P,ew,ed,eh,body,.7);K.box(ew+.02,.2,ed+.02,accent,0,eh-.2,0,e);K.plate(e,`${item.make||''} ${item.model||''}`.trim()||'CNC LATHE',1.0,.14,0,eh-.2,ed/2+.02);
 const s=K.box(ew-.1,.06,.5,accent,0,eh-.3,ed/2-.2,e);s.rotation.x=.5;
 door(K,e,P,body,-ew/2+.1,-ew/2+.75,.7,eh-.3,ed/2-.06,.6);door(K,e,P,body,-ew/2+.7,ew/2-.1,.7,eh-.3,ed/2-.02,.65);
 const bed=K.box(ew-.3,.45,.8,M.dark,0,.5,-.25,e);bed.rotation.x=-.3;K.box(.5,.85,.8,accent,-ew/2+.3,.85,-.25,e);K.box(.3,.45,.3,M.dark,ew/2-.3,.9,-.25,e);K.cyl(.04,.3,M.steel,ew/2-.55,1.0,-.25,e,'x',8);
 const chuck=grp(K,e,-ew/2+.62,1.0,-.25);K.cyl(.2,.14,M.dark,0,0,0,chuck,'x',20);for(let i=0;i<3;i++){const a=i/3*Math.PI*2;K.box(.1,.07,.07,M.steel,.1,.13*Math.cos(a),.13*Math.sin(a),chuck).rotation.x=a}K.cyl(.05,.4,P.alu,.25,0,0,chuck,'x',12);
 const turret=grp(K,e,.3,1.0,-.45);K.cyl(.22,.18,M.steel,0,0,0,turret,'x',8);for(let i=0;i<8;i++){const a=i/8*Math.PI*2;K.box(.12,.05,.05,M.dark,-.02,.26*Math.cos(a),.26*Math.sin(a),turret).rotation.x=a}K.box(.3,.4,.3,accent,.5,.95,-.65,e);
 const cx=ex+ew/2+.3,cz=ed/2-.4;K.box(.5,1.4,.5,P.frame,cx,.7,cz,g);screen(K,P,g,cx,1.25,cz+.26,.36,.26);K.box(.4,.03,.18,M.dark,cx,1.0,cz+.3,g).rotation.x=.2;for(let i=0;i<4;i++)K.cyl(.015,.02,i===3?M.red:M.dark,cx-.12+i*.08,.8,cz+.26,g,'z',8);
 K.box(.5,.6,.6,M.dark,cx,.3,-.35,g);K.box(.46,.04,.56,M.steel,cx,.6,-.35,g);const cv=K.box(.55,.18,.35,M.dark,ex+ew/2+.05,.75,-.35,g);cv.rotation.z=.35;
 const lamps=tower(K,e,ew/2-.15,eh,-ed/2+.15);
 return {group:g,height:eh+.55,update:(t,clock)=>{chuck.rotation.x=t*10;turret.rotation.x=Math.floor(t*.8)*Math.PI/4;blink(lamps,clock)}};
}

// Robot welding cell: a fenced cell (posts, mesh panels) open at the front between two light-curtain posts; the six-axis
// robot on its pedestal with the torch (its arc flickers), wire feeder and the wire drum with its conduit; the positioner
// table with a clamped workpiece; the fume hood with its duct over the cell; controller, power source and the tower.
export function buildWelding(K,item){
 const T=K.THREE,M=K.M,P=pal(K),g=new T.Group(),w=item.w,d=item.d,h=item.h;
 const post=K.mat(0x3a4650,.4,.5),paint=/fanuc/i.test(`${item.make||''} ${item.name||''}`)?K.mat(0xe9c12f,.25,.45):K.mat(0xe8772e,.25,.45),arc=K.mat(0xbfe3ff,0,.5,{emissive:0x9fd6ff,emissiveIntensity:2}),curtain=K.mat(0xe3b82e,.2,.5),ir=K.mat(0x3a1a1a,0,.5,{emissive:0xd2453b,emissiveIntensity:.8});
 const fw=w-.2,fd=d-.2,fh=2.0;
 for(const [x,z] of [[-fw/2,-fd/2],[fw/2,-fd/2],[-fw/2,fd/2],[fw/2,fd/2],[0,-fd/2],[-fw/2,0],[fw/2,0]])K.box(.06,fh,.06,post,x,fh/2,z,g);
 K.box(fw,fh-.2,.015,P.mesh,0,fh/2,-fd/2,g).castShadow=false;for(const sx of[-1,1])K.box(.015,fh-.2,fd,P.mesh,sx*fw/2,fh/2,0,g).castShadow=false;for(const sx of[-1,1])for(const y of[.1,fh-.05])K.box(.03,.03,fd,post,sx*fw/2,y,0,g);for(const y of[.1,fh-.05])K.box(fw,.03,.03,post,0,y,-fd/2,g);
 for(const sx of[-1,1]){K.box(.08,1.3,.08,curtain,sx*(fw/2-.4),.75,fd/2-.05,g);K.box(.02,1.1,.02,ir,sx*(fw/2-.4)-sx*.05,.75,fd/2-.05,g);K.box(.2,.1,.2,M.dark,sx*(fw/2-.4),.05,fd/2-.05,g)}
 // Robot at the back left, the positioner table in front of it to the right: turret turned towards the table (aim), the upper arm leant forward
 // and the forearm level put the torch tip (hanging off the wrist, tilted forward) about 1.2 m out at workpiece height.
 const k=.75,rx=-.6,rz=-.5,px=.4,pz=.1,aim=-Math.atan2(pz-rz,px-rx);K.box(.6,.3,.6,M.dark,rx,.15,rz,g);const R=robotArm(K,g,rx,rz,k,paint);K.box(.22,.14,.12,M.dark,.3*k,.14*k,0,R.fore);const torch=grp(K,R.wrist,0,0,0);torch.rotation.z=.5;K.cyl(.03,.3,M.dark,0,-.1,0,torch,'y',8);K.cyl(.015,.08,M.copper,0,-.28,0,torch,'y',8);K.sphere(.03,arc,0,-.33,0,torch,8);
 K.cyl(.25,.45,M.dark,-fw/2+.4,.225,-fd/2+.45,g,'y',18);K.cyl(.26,.02,P.alu,-fw/2+.4,.46,-fd/2+.45,g,'y',18);K.pipe([[-fw/2+.4,.47,-fd/2+.45],[-fw/2+.5,1.3,-fd/2+.6],[rx,.9*k+.2,rz-.3]],.02,P.cable,g);
 const pos=grp(K,g,px,0,pz);K.box(.6,.5,.6,post,0,.25,0,pos);K.box(.5,.1,.5,M.dark,0,.55,0,pos);const table=grp(K,pos,0,.65,0);K.cyl(.45,.08,M.steel,0,0,0,table,'y',20);for(let i=0;i<4;i++)K.box(.8,.02,.03,M.dark,0,.045,0,table).rotation.y=i*Math.PI/4;K.box(.5,.12,.3,M.steel,0,.1,0,table);K.box(.08,.3,.3,M.steel,-.2,.3,0,table);K.cyl(.04,.3,M.steel,.15,.25,0,table,'y',8);K.box(.1,.08,.1,M.red,.15,.42,0,table);
 // Fume hood on two posts standing behind the table, its duct stub on top.
 for(const sx of[-1,1])K.box(.06,fh,.06,post,sx*.75,fh/2,-.9,g);K.box(1.6,.3,1.2,P.frame,0,fh+.15,-.3,g);K.box(1.4,.04,1.0,M.dark,0,fh+.02,-.3,g);K.cyl(.15,h-fh-.33,M.steel,-.3,fh+.3+(h-fh-.33)/2,-.5,g,'y',16);K.torus(.15,.025,M.dark,-.3,h-.05,-.5,g,'y',16);
 K.box(.5,1.1,.5,P.frame,fw/2-.35,.55,-fd/2+.35,g);screen(K,P,g,fw/2-.35,.8,-fd/2+.61,.3,.2);handle(K,g,fw/2-.15,.5,-fd/2+.61,.25);K.box(.45,.6,.5,M.red,fw/2-.3,.3,.7,g);K.box(.4,.1,.02,M.dark,fw/2-.3,.45,.96,g);K.pipe([[fw/2-.3,.65,.7],[.5,.5,-.7],[rx+.2,.45,rz]],.02,P.cable,g);
 const lamps=tower(K,g,fw/2-.35,1.1,-fd/2+.35);
 return {group:g,height:h,update:(t,clock)=>{R.turret.rotation.y=aim+.3*Math.sin(t*.5);const u=-.5+.12*Math.sin(t*.7);R.upper.rotation.z=u;R.fore.rotation.z=-u+.08*Math.sin(t*1.3);table.rotation.y=t*.3;arc.emissiveIntensity=1+2*Math.abs(Math.sin(clock*17));blink(lamps,clock)}};
}

// A bay of pallet racking: two blue upright frames (posts on footplates, horizontal and diagonal bracing), orange beams
// at two levels above the floor, and two pallets a level: shrink-wrapped goods, stacked cartons or a wrapped mixed load.
export function buildRack(K,item){
 const T=K.THREE,M=K.M,g=new T.Group(),w=item.w,d=item.d,h=item.h;
 const blue=K.mat(0x2456a8,.3,.5),orange=K.mat(0xe8772e,.25,.45),pallet=K.mat(0xb8915e,.05,.85),wrap=K.mat(0xe4eaec,.05,.3,{transparent:true,opacity:.85}),card=K.mat(0xc9a46a,.05,.9),card2=K.mat(0xa88550,.05,.9),goods=K.mat(0x3d7ab8,.2,.6);
 const fx=w/2-.05,fz=d/2-.05;
 for(const sx of[-1,1]){for(const sz of[-1,1]){K.box(.08,h,.08,blue,sx*fx,h/2,sz*fz,g);K.box(.14,.01,.14,blue,sx*fx,.005,sz*fz,g)}for(let y=.3;y<h;y+=.9)K.box(.04,.04,fz*2,blue,sx*fx,y,0,g);
  for(let y=.75,i=0;y<h-.4;y+=.9,i++){const b=K.box(.03,.03,Math.hypot(fz*2,.9)-.1,blue,sx*fx,y,0,g);b.rotation.x=Math.atan2(.9,fz*2)*(i%2?1:-1)}}
 const levels=[0,1.4,2.8];for(const y of levels.slice(1))for(const sz of[-1,1]){K.box(fx*2-.08,.1,.05,orange,0,y-.05,sz*(fz-.02),g);for(const sx of[-1,1])K.box(.06,.2,.03,orange,sx*(fx-.07),y-.05,sz*(fz+.015),g)}
 K.plate(g,item.name||'RACK',.5,.1,0,levels[1]-.05,fz+.01,'#e8772e','#1c1b18');
 levels.forEach((y,li)=>{for(const sx of[-1,1]){const pg=grp(K,g,sx*(fx/2-.05),y,0);for(let i=-1;i<=1;i++)K.box(1.15,.02,.1,pallet,0,.13,i*.4,pg);for(let i=-1;i<=1;i++)K.box(.1,.1,.9,pallet,i*.5,.06,0,pg);
  const kind=(li+sx+3)%3;if(kind===0){K.box(1.05,.8,.8,goods,0,.55,0,pg);K.box(1.09,.86,.84,wrap,0,.57,0,pg).castShadow=false}
  else if(kind===1){for(let r=0;r<3;r++)for(let i=0;i<2;i++)for(let k=0;k<2;k++)K.box(.5,.3,.4,(r+i+k)%2?card:card2,-.27+i*.54,.3+r*.3,-.21+k*.42,pg)}
  else{K.box(1.0,.5,.75,card,0,.4,0,pg);K.box(.9,.3,.6,card2,0,.8,0,pg);K.box(1.04,.84,.8,wrap,0,.57,0,pg).castShadow=false;K.box(.2,.12,.005,M.white,.3,.5,.405,pg)}}});
 return {group:g,height:h,update:()=>{}};
}

// Counterbalance forklift standing along the row (forks towards +x): chassis and counterweight with the LPG bottle, steps,
// the overhead guard on four posts, seat, steering column and wheel, dash, working lights, four wheels with rims, the mast
// with its lift cylinders and the carriage (backrest and forks), which rides slowly up and down.
export function buildForklift(K,item){
 const T=K.THREE,M=K.M,g=new T.Group(),w=item.w,d=item.d,h=item.h;
 const yellow=K.mat(0xe8b61c,.3,.5),black=K.mat(0x1c1d1f,.3,.7),tyre=K.mat(0x202224,.1,.9),rim=K.mat(0x8e9aa0,.6,.4),seat=K.mat(0x2b2e31,.1,.8),lamp=K.mat(0xfff3dc,0,.3,{emissive:0xfff3dc,emissiveIntensity:.8});
 // Chassis over the axles; the counterweight at the back with the LPG bottle on top, the seat deck in front of it, the operator's floor plate and the dash standing on it.
 const bx=-.45,gh=h-.05;K.box(1.5,.35,d-.3,yellow,bx,.45,0,g);K.box(.4,.75,d-.35,yellow,bx-.55,.75,0,g);K.box(.42,.1,d-.3,black,bx-.55,1.12,0,g);K.box(.5,.3,d-.35,yellow,bx-.2,.75,0,g);K.box(.7,.05,d-.4,black,bx+.3,.65,0,g);K.cyl(.14,.5,M.white,bx-.55,1.3,0,g,'z',14);K.cyl(.05,.06,M.steel,bx-.55,1.3,.28,g,'z',8);
 for(const sz of[-1,1])K.box(.4,.06,.3,black,bx-.02,.28,sz*(d/2-.15),g);
 for(const sx of[-1,1])for(const sz of[-1,1])K.box(.05,gh-.6,.05,black,bx+sx*.55,.6+(gh-.6)/2,sz*(d/2-.2),g);K.box(1.2,.05,d-.3,black,bx,gh-.025,0,g);for(let i=-2;i<=2;i++)K.box(.04,.02,d-.3,black,bx+i*.25,gh-.06,0,g);for(const sz of[-1,1])K.box(.06,.08,.12,lamp,bx+.58,gh-.15,sz*.3,g);
 K.box(.45,.12,.45,seat,bx-.15,.96,0,g);K.box(.1,.5,.45,seat,bx-.4,1.2,0,g);K.box(.3,.45,.4,black,bx+.5,.875,0,g);K.box(.05,.3,.05,black,bx+.5,1.23,0,g);K.torus(.15,.02,black,bx+.5,1.38,0,g,'x',16);K.box(.1,.08,.1,M.red,bx+.2,.71,.2,g);K.box(.2,.12,.02,M.dark,bx+.4,1.16,.12,g);
 for(const sz of[-1,1])for(const [x,r] of[[.6,.3],[-.6,.26]]){K.cyl(r,.22,tyre,bx+x,r,sz*(d/2-.12),g,'z',20);K.cyl(r*.55,.23,rim,bx+x,r,sz*(d/2-.12),g,'z',12);K.cyl(.04,.24,black,bx+x,r,sz*(d/2-.12),g,'z',8)}
 const mx=w/2-1.15;for(const sz of[-1,1])K.box(.08,h-.15,.1,black,mx,(h-.15)/2,sz*.35,g);K.box(.08,.06,.8,black,mx,h-.15,0,g);K.box(.08,.06,.8,black,mx,.5,0,g);for(const sz of[-1,1])K.cyl(.04,h-.3,M.steel,mx-.09,(h-.3)/2+.1,sz*.2,g,'y',8);K.box(.3,.2,.5,black,mx-.2,.3,0,g);
 const car=grp(K,g,mx+.15,.1,0);K.box(.06,.5,.8,black,0,.25,0,car);for(let i=-2;i<=2;i++)K.box(.04,.9,.04,black,.02,.95,i*.18,car);K.box(.04,.04,.8,black,.02,1.4,0,car);for(const sz of[-1,1]){K.box(.95,.05,.12,black,.525,.02,sz*.28,car);K.box(.06,.45,.12,black,.03,.25,sz*.28,car)}
 K.plate(g,item.make||'',.5,.1,bx-.45,.8,d/2-.17);K.plate(g,item.make||'',.5,.1,bx-.45,.8,-d/2+.17,'#1c1b18','#ecebe5',Math.PI);
 return {group:g,height:gh,update:t=>{car.position.y=.1+.4*(.5+.5*Math.sin(t*.5))}};
}

// Electrical control cabinet (grey, a door on hinges with a handle and lock, status LEDs, screen, warning and make labels,
// vent slots, cable glands on top) or, for chillers / cooling units, a white chiller with a condenser fan on top, display,
// louvres and the flow / return pipes at the back.
export function buildCabinet(K,item){
 const T=K.THREE,M=K.M,P=pal(K),g=new T.Group(),w=item.w,d=item.d,h=item.h,chiller=/chiller|cool|temperature|frigel/i.test(`${item.type||''} ${item.name||''}`);
 const grey=K.mat(0xb9bcb8,.3,.55),doorM=K.mat(0xc9ccc8,.3,.5),led=K.mat(0x1d1f22,.2,.4,{emissive:0x3fa66b,emissiveIntensity:1});let rot=null,height;
 if(chiller){
  const ch=h*.85;K.box(w,.08,d,P.kick,0,.04,0,g);K.box(w,ch-.08,d,M.white,0,ch/2+.04,0,g);K.box(w+.01,.05,d+.01,grey,0,ch-.03,0,g);rot=fan(K,g,0,ch+.01,0,Math.min(w,d)/2-.08,M.dark,P.alu,M.dark);
  screen(K,P,g,-w/4+.05,ch*.8,d/2+.03,.22,.14);for(let i=0;i<3;i++)K.box(.02,.02,.01,i?P.led:led,w/4+.02+i*.05,ch*.85,d/2+.012,g);K.plate(g,item.make||'CHILLER',w-.2,.08,0,ch*.65,d/2+.012);louvres(K,g,P.kick,0,.25,d/2+.02,w-.15,10,.05);louvres(K,g,P.kick,-w/2-.02,.25,0,d-.15,10,.05,-Math.PI/2);
  for(const x of[-.15,.15]){K.pipe([[x,ch*.4,-d/2],[x,ch*.4,-d/2-.1],[x,.1,-d/2-.1]],.025,P.hose,g);K.torus(.035,.012,M.steel,x,ch*.4,-d/2-.03,g,'z',12)}K.cyl(.03,.03,M.red,w/2-.08,ch*.5,d/2+.015,g,'z',10);K.plate(g,'!',.08,.08,-w/2+.1,ch*.5,d/2+.012,'#f2c21b','#1c1b18');
  K.cyl(.05,.06,M.white,-w/4,ch*.3,-d/2-.05,g,'z',12);K.cyl(.025,.1,M.copper,w/4,.3,-d/2-.05,g,'z',8);height=ch+.08;
 }else{
  K.box(w-.04,.1,d-.04,P.kick,0,.05,0,g);K.box(w,h-.1,d,grey,0,h/2+.05,0,g);K.box(w+.02,.04,d+.02,M.dark,0,h-.02,0,g);K.box(w-.08,h-.3,.02,doorM,0,h/2+.05,d/2+.01,g);for(const y of[h*.25,h*.75])K.box(.03,.08,.04,M.dark,-w/2+.045,y,d/2+.02,g);
  handle(K,g,w/2-.1,h*.5,d/2+.035,.3);K.cyl(.015,.03,M.steel,w/2-.1,h*.5+.2,d/2+.03,g,'z',8);screen(K,P,g,-.05,h*.72,d/2+.035,.26,.18);for(let i=0;i<4;i++)K.box(.02,.02,.01,i?P.led:led,-w/2+.12+i*.05,h*.85,d/2+.025,g);K.cyl(.025,.02,M.red,w/2-.14,h*.6,d/2+.03,g,'z',10);K.cyl(.015,.02,M.dark,w/2-.22,h*.6,d/2+.03,g,'z',8);
  K.plate(g,item.make||'',w-.25,.08,0,h*.93,d/2+.025);K.plate(g,'HV',.1,.1,-w/4,h*.35,d/2+.025,'#f2c21b','#1c1b18');K.plate(g,item.name||'',w-.3,.06,.05,h*.42,d/2+.025,'#ecebe5','#1c1b18');for(let i=0;i<5;i++)K.box(w-.3,.012,.01,M.dark,0,h*.1+i*.03,d/2+.025,g);
  for(let i=0;i<5;i++)K.cyl(.02,.06,M.dark,-w/2+.15+i*.12,h+.03,-.1,g,'y',8);K.pipe([[-w/2+.15,h+.06,-.1],[-w/2+.15,h+.2,-.2],[-w/2+.1,h+.05,-d/2-.06],[-w/2+.1,.1,-d/2-.06]],.015,P.cable,g);height=h+.22;
 }
 return {group:g,height,update:(t,clock)=>{if(rot)rot.rotation.y=t*6;led.emissiveIntensity=.6+.4*Math.sin(clock*3)}};
}

// Roll-to-roll inline coater (Inline Coater 500): the base frame, the unwinder and rewinder stands with their rolls of
// web, idlers, the coating head (backing roll with the slot die above it, fed from the pump), the drying tunnel with its
// heater windows under a glass hood with the blowers and exhaust stack, the web running through, control cabinet, screen
// and tower; every roll turns and the heaters glow.
export function buildCoater(K,item){
 const T=K.THREE,M=K.M,P=pal(K),g=new T.Group(),w=item.w,d=item.d,h=item.h;
 const frame=K.mat(0xd9d8d2,.2,.55),blue=K.mat(0x2c4f8a,.3,.5),web=K.mat(0xe9e6dd,.05,.6,{side:T.DoubleSide}),coat=K.mat(0x3a3f44,.3,.5),heat=K.mat(0x301205,0,1,{emissive:0xff6a2a,emissiveIntensity:.4});
 const bh=.7,rolls=[];K.box(w-.4,bh-.1,d*.6,frame,0,bh/2+.05,0,g);K.box(w-.5,.1,d*.55,P.kick,0,.05,0,g);K.plate(g,`${item.make||''} ${item.model||''}`.trim()||'INLINE COATER',1.4,.16,0,bh*.6,d*.3+.01);
 const stand=(x,r)=>{for(const z of[-.45,.45])K.box(.12,.9,.12,blue,x,bh+.45,z,g);K.box(.12,.1,1.02,blue,x,bh+.95,0,g);rolls.push(K.cyl(r,.7,web,x,bh+.6,0,g,'z',24));K.cyl(.04,1.0,M.steel,x,bh+.6,0,g,'z',10);K.cyl(.1,.2,M.dark,x,bh+.6,-.55,g,'z',12)};
 const idler=(x,y,r=.05)=>{rolls.push(K.cyl(r,.72,M.steel,x,y,0,g,'z',14));for(const z of[-.4,.4]){K.box(.08,.08,.06,M.dark,x,y,z,g);K.box(.06,y-bh,.06,M.dark,x,(y+bh)/2,z,g)}};
 const ux=-w/2+.6,rx=w/2-.6,cx=-.6;stand(ux,.3);stand(rx,.25);idler(ux+.45,bh+.85);idler(rx-.3,bh+.85);
 // Coating head: the backing roll between two posts that carry the top beam; the slot die hangs from the beam just over the roll.
 rolls.push(K.cyl(.18,.72,M.dark,cx,bh+.45,0,g,'z',24));for(const z of[-.42,.42])K.box(.1,1.25,.1,blue,cx,bh+.625,z,g);K.box(.4,.06,.94,blue,cx,bh+1.22,0,g);const die=grp(K,g,cx,bh+.75,0);K.box(.25,.2,.7,coat,0,0,0,die);K.box(.1,.1,.72,M.steel,-.1,-.12,0,die);for(const z of[-.3,.3])K.box(.06,.34,.06,M.steel,0,.27,z,die);
 K.box(.3,.3,.3,frame,cx-.45,bh+.15,-.5,g);K.cyl(.08,.1,M.dark,cx-.45,bh+.35,-.5,g,'y',12);K.pipe([[cx-.45,bh+.4,-.5],[cx-.3,bh+.9,-.4],[cx-.1,bh+.8,0]],.015,P.hose,g);
 const pts=[[ux,bh+.9],[ux+.45,bh+.9],[cx,bh+.63],[-.1,bh+.7],[1.1,bh+.7],[rx-.3,bh+.9],[rx,bh+.85]];for(let i=0;i<pts.length-1;i++){const [x0,y0]=pts[i],[x1,y1]=pts[i+1],s=K.box(Math.hypot(x1-x0,y1-y0),.008,.7,web,(x0+x1)/2,(y0+y1)/2,0,g);s.rotation.z=Math.atan2(y1-y0,x1-x0);s.castShadow=false}
 const tx=.5;K.box(1.2,.5,.9,frame,tx,bh+.7,0,g);for(let i=0;i<3;i++)K.box(.25,.18,.012,heat,tx-.4+i*.4,bh+.72,.456,g);K.box(1.2,.04,.9,M.dark,tx,bh+.96,0,g);for(const x of[tx-.3,tx+.3])K.cyl(.12,.3,M.dark,x,bh+1.13,-.15,g,'y',14);K.cyl(.1,.3,M.steel,tx,bh+1.13,.2,g,'y',12);
 for(const sx of[-1,1])for(const sz of[-1,1])K.box(.04,.6,.04,P.alu,tx+sx*.58,bh+1.28,sz*.43,g);K.box(1.2,.6,.9,P.glass,tx,bh+1.28,0,g).castShadow=false;K.box(1.24,.04,.94,P.alu,tx,bh+1.6,0,g);K.cyl(.1,h-bh-1.62,M.steel,tx,(h+bh+1.62)/2,0,g,'y',16);
 K.box(.6,1.6,.4,frame,w/2-.5,.8,-d/2+.25,g);screen(K,P,g,w/2-.5,1.2,-d/2+.47,.3,.2);handle(K,g,w/2-.3,.8,-d/2+.47,.3);K.box(.3,.04,.3,M.dark,.95,.02,d/2-.2,g);K.box(.05,bh+.63,.05,M.dark,.95,(bh+.63)/2,d/2-.2,g);screen(K,P,g,.95,bh+.75,d/2-.2,.36,.24);
 const lamps=tower(K,g,1.0,bh+1.6,-.3);
 return {group:g,height:bh+1.6+.55,update:(t,clock)=>{rolls.forEach(r=>{r.rotation.z=-t*2});heat.emissiveIntensity=.5+.3*Math.sin(clock*2);blink(lamps,clock)}};
}

// Oil transformer on its plinth (rails and wheels): the tank with stiffeners and lid, radiator banks with headers each
// side and the cooling fan under them, the conservator with gauge and breather on brackets, three HV bushings with
// sheds and caps, three LV bushings, tap-changer box, nameplate and earth bar. Switchgear lots instead get a row of three
// MV cubicles on a plinth: doors, handles, mimic screens, lamps, meters and the busbar duct on top.
export function buildTransformer(K,item){
 const T=K.THREE,M=K.M,P=pal(K),g=new T.Group(),w=item.w,d=item.d,h=item.h,switchgear=/switchgear|cabinet/i.test(`${item.type||''} ${item.name||''}`);
 const grey=K.mat(0x8c9496,.4,.5),tank=K.mat(0x6f7a7c,.4,.5),porcelain=K.mat(0xd8cdb4,.1,.4),led=K.mat(0x1d1f22,.2,.4,{emissive:0x3fa66b,emissiveIntensity:1});let rot=null,height;
 if(switchgear){
  const n=3,cw=(w-.2)/n,ch=h-.3,cd=d-.6;K.box(w-.1,.1,cd,P.kick,0,.05,0,g);
  for(let i=0;i<n;i++){const x=-w/2+.1+cw*(i+.5);K.box(cw-.02,ch-.1,cd,grey,x,ch/2+.05,0,g);K.box(cw-.12,ch*.45,.02,P.frame,x,ch*.62,cd/2+.01,g);K.box(cw-.12,ch*.3,.02,P.frame,x,ch*.22,cd/2+.01,g);handle(K,g,x+cw/2-.12,ch*.6,cd/2+.035,.25);handle(K,g,x+cw/2-.12,ch*.22,cd/2+.035,.2);
   screen(K,P,g,x-.08,ch*.75,cd/2+.035,.22,.14);for(let k=0;k<3;k++)K.cyl(.015,.02,[P.led,M.red,M.yellow][k],x-.15+k*.1,ch*.55,cd/2+.03,g,'z',8);K.box(.02,.02,.01,led,x+.1,ch*.55,cd/2+.03,g);K.cyl(.045,.03,M.white,x+.18,ch*.78,cd/2+.03,g,'z',14);K.box(.03,.04,.04,M.dark,x+.18,ch*.68,cd/2+.03,g);
   K.plate(g,`${i+1}`,.1,.1,x,ch*.92,cd/2+.025);K.plate(g,'HV',.1,.1,x-.2,ch*.92,cd/2+.025,'#f2c21b','#1c1b18')}
  K.box(w-.3,.25,.5,grey,0,ch+.12,-cd/2+.25,g);for(let i=0;i<n;i++)K.cyl(.03,.06,M.dark,-w/2+.1+cw*(i+.5),ch+.27,-cd/2+.25,g,'y',8);K.plate(g,item.make||'',1.2,.14,0,ch+.12,-cd/2+.51);height=ch+.3;
 }else{
  // Plinth, two rails on it, the tank's wheels on the rails, the tank bottom at the wheel tops.
  const pw=w-.2,pd=d-.2;K.box(pw,.2,pd,M.concrete,0,.1,0,g);for(const sx of[-1,1])K.box(.08,.1,pd*.5,M.steel,sx*(pw/2-.3),.25,0,g);for(const sx of[-1,1])for(const sz of[-1,1])K.cyl(.1,.1,M.dark,sx*(pw/2-.3),.35,sz*(pd*.25-.05),g,'x',12);
  const tw=1.2,td=d-.8,th=1.4,ty=.45;K.box(tw,th,td,tank,0,ty+th/2,0,g);for(let i=-1;i<=1;i++)K.box(tw+.04,.05,td+.04,M.dark,0,ty+.35+i*.4,0,g);K.box(tw+.1,.08,td+.1,M.dark,0,ty+th+.04,0,g);
  for(const sx of[-1,1]){const rx=sx*(tw/2+.3);K.cyl(.06,td-.3,M.dark,rx,ty+.15,0,g,'z',10);K.cyl(.06,td-.3,M.dark,rx,ty+th-.1,0,g,'z',10);for(let i=0;i<8;i++)K.box(.45,th-.35,.02,grey,rx,ty+th/2,-(td-.4)/2+i*(td-.4)/7,g);for(const y of[ty+.15,ty+th-.1])K.cyl(.06,.3,M.dark,sx*(tw/2+.15),y,0,g,'x',10)}
  rot=fan(K,g,-(tw/2+.3),ty,0,.2,M.dark,P.alu,M.dark);for(const sz of[-1,1])K.box(.04,ty-.2,.04,M.dark,-(tw/2+.3),(ty+.2)/2,sz*.17,g);const cz=-td/2+.15,cy=ty+th+.45;for(const sx of[-1,1])K.box(.06,.6,.06,M.dark,sx*.4,ty+th+.3,cz,g);K.cyl(.18,tw+.4,tank,0,cy,cz,g,'x',20);K.cyl(.05,.03,M.white,tw/2+.22,cy,cz,g,'x',12);K.pipe([[-(tw/2+.1),cy,cz],[-(tw/2+.35),cy-.1,cz],[-(tw/2+.35),ty+.4,cz-.1]],.02,M.steel,g);K.cyl(.06,.2,porcelain,-(tw/2+.35),ty+.3,cz-.1,g,'y',10);
  for(let i=-1;i<=1;i++){const x=i*.4,y0=ty+th+.08;K.cyl(.1,.06,M.dark,x,y0+.03,.25,g,'y',12);K.cyl(.065,.5,porcelain,x,y0+.31,.25,g,'y',14);for(let k=0;k<4;k++)K.torus(.085,.022,porcelain,x,y0+.14+k*.1,.25,g,'y',18);K.cyl(.035,.06,M.steel,x,y0+.59,.25,g,'y',10);K.cyl(.015,.2,M.steel,x,y0+.5,.25,g,'z',6);
   K.cyl(.045,.28,porcelain,x,y0+.18,-.1,g,'y',12);K.torus(.06,.015,porcelain,x,y0+.2,-.1,g,'y',14);K.cyl(.03,.05,M.copper,x,y0+.34,-.1,g,'y',8)}
  K.box(.3,.5,.15,grey,tw/2-.2,ty+th-.4,td/2+.08,g);K.cyl(.04,.04,M.dark,tw/2-.2,ty+th-.3,td/2+.17,g,'z',10);K.plate(g,item.make||'',.5,.16,-.2,ty+.9,td/2+.01);K.box(.02,.3,.04,M.copper,-tw/2+.05,ty+.2,td/2+.03,g);K.cyl(.04,.05,M.white,.2,ty+.5,td/2+.03,g,'z',12);height=ty+th+.08+.62;
 }
 return {group:g,height,update:(t,clock)=>{if(rot)rot.rotation.y=t*5;led.emissiveIntensity=.6+.4*Math.sin(clock*3)}};
}

// The Henkel Lomazzo land plot: a flat gravel plot with kerbs, a mesh fence on posts with a top rail, the gate (two leaves,
// one swung open) between heavy posts at the front, a lamp post, the for-sale sign with the lot's title, and a few trees.
export function buildSite(K,item){
 const T=K.THREE,M=K.M,P=pal(K),g=new T.Group(),w=item.w,d=item.d,h=item.h;
 const gravel=K.mat(0xa9a397,.02,.95),postM=K.mat(0x4d5a4a,.4,.5),trunk=K.mat(0x6b4a2e,.1,.9),leaf=K.mat(0x4f7a3a,.05,.85),leaf2=K.mat(0x3f6a30,.05,.85),signM=K.mat(0xeeede8,.1,.5),kerb=K.mat(0x8f8d86,.02,.9),lamp=K.mat(0xffffff,0,.3,{emissive:0xfff3dc,emissiveIntensity:1});
 K.box(w,.04,d,gravel,0,.02,0,g);for(const sx of[-1,1])K.box(.12,.08,d,kerb,sx*(w/2-.06),.04,0,g);for(const sz of[-1,1])K.box(w,.08,.12,kerb,0,.04,sz*(d/2-.06),g);
 const fh=1.8,gw=1.8,xe=w/2-.1,ze=d/2-.1;
 const run=(x0,z0,x1,z1)=>{const len=Math.hypot(x1-x0,z1-z0),n=Math.max(1,Math.round(len/1.5)),ang=Math.atan2(-(z1-z0),x1-x0),cx=(x0+x1)/2,cz=(z0+z1)/2;for(let i=0;i<=n;i++)K.box(.06,fh,.06,postM,x0+(x1-x0)*i/n,fh/2,z0+(z1-z0)*i/n,g);
  K.box(len,fh-.2,.012,P.mesh,cx,fh/2,cz,g).rotation.y=ang;K.box(len,.04,.04,postM,cx,fh-.03,cz,g).rotation.y=ang;K.box(len,.03,.03,postM,cx,.12,cz,g).rotation.y=ang};
 run(-xe,-ze,xe,-ze);run(-xe,-ze,-xe,ze);run(xe,-ze,xe,ze);run(-xe,ze,-gw/2-.2,ze);run(gw/2+.2,ze,xe,ze);
 for(const sx of[-1,1]){K.box(.14,2.0,.14,postM,sx*(gw/2+.12),1.0,ze,g);K.box(.2,.05,.2,M.dark,sx*(gw/2+.12),2.02,ze,g)}
 const leafL=gw/2-.05,gate=(hx,ang)=>{const l=grp(K,g,hx,0,ze);l.rotation.y=ang;const s=hx>0?-1:1,c=s*leafL/2;K.box(leafL,.05,.05,postM,c,1.72,0,l);K.box(leafL,.05,.05,postM,c,.12,0,l);K.box(.05,1.65,.05,postM,s*(leafL-.02),.92,0,l);K.box(leafL-.1,1.55,.01,P.mesh,c,.92,0,l).castShadow=false;const dg=K.box(Math.hypot(leafL,1.6)-.1,.03,.03,postM,c,.92,0,l);dg.rotation.z=s*Math.atan2(1.6,leafL);return l};
 gate(-(gw/2+.05),0);gate(gw/2+.05,-1.0);
 K.cyl(.05,2.7,M.dark,gw/2+.6,1.35,ze-.4,g,'y',10);K.box(.5,.05,.05,M.dark,gw/2+.38,2.7,ze-.4,g);K.sphere(.1,lamp,gw/2+.15,2.66,ze-.4,g,10);
 const sx=w/2-2.6,sz=ze-1.2;for(const o of[-.65,.65])K.box(.08,2.6,.08,postM,sx+o,1.3,sz,g);K.box(1.6,.85,.04,signM,sx,2.25,sz,g);K.plate(g,String(item.title||item.name||'LAND PLOT'),1.5,.3,sx,2.4,sz+.025,'#eeede8','#1c1b18');K.plate(g,'FOR SALE',1.5,.3,sx,2.05,sz+.025,'#c8312a','#ffffff');K.plate(g,'FOR SALE',1.5,.3,sx,2.05,sz-.025,'#c8312a','#ffffff',Math.PI);
 const canopies=[];for(const [x,z,H] of[[-4.6,-2.2,2.9],[-2.2,-2.9,2.4],[4.2,-2.4,2.75],[5.1,1.8,2.3],[-5.1,1.5,2.1]]){const r=(H-.9)/2;K.cyl(.08,.95,trunk,x,.47,z,g,'y',8);const c=grp(K,g,x,.9+r,z);K.sphere(r,leaf,0,0,0,c,14);K.sphere(r*.7,leaf2,r*.4,r*.3,-r*.3,c,12);K.sphere(r*.6,leaf2,-r*.45,-r*.1,r*.35,c,12);canopies.push([c,x])}
 K.box(1.2,.05,.4,M.dark,-3,.45,2.8,g);for(const o of[-.5,.5])K.box(.08,.4,.4,M.dark,-3+o,.25,2.8,g);K.box(1.2,.4,.05,M.dark,-3,.7,2.6,g).rotation.x=-.2;
 return {group:g,height:h,update:t=>{canopies.forEach(([c,x],i)=>{c.position.x=x+.03*Math.sin(t*.8+i)})}};
}
