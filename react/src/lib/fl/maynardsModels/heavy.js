// Heavy plant of the Maynards sales (scene units = metres): the steam turbine genset, the strip mill stand, the
// annealing furnace, straight-side stamping presses, the shredder, optical sorters, channel balers, extruders,
// granulators and tanks. Each builder is build<Kind>(K, item) → {group, height, update(t, clock)}: the group's
// origin is the centre of the item's footprint (item.w along the row = +x, item.d deep) on the floor, +z the
// front where the camera is. K is the steelModels kit (box, cyl, pipe, platform, stair, plate, the M palette …).
const label=item=>[item.make,item.model].filter(Boolean).join(' ')||item.name||item.type||'';
const tonnage=item=>{const m=/(\d{2,5})\s*(?:t\b|to\b|ton|kn)/i.exec(`${item.model||''} ${item.name||''} ${item.type||''}`);return m?+m[1]:400};
// Per-call extras to the kit palette: screen glow, indicator lamps, rubber.
const palette=K=>({screen:K.mat(0x16191b,.2,.4,{emissive:0x5a87b0,emissiveIntensity:.55}),green:K.mat(0x3fa66b,.2,.5,{emissive:0x3fa66b,emissiveIntensity:.5}),
 redLamp:K.mat(0xd2453b,.2,.5,{emissive:0xd2453b,emissiveIntensity:.5}),rubber:K.mat(0x26282a,.05,.9),belt:K.mat(0x3a3d40,.1,.8)});
// Control cabinet (doors, a screen, lamps) standing on the floor at (x, z), its front facing rotY (0 = +z).
function cabinet(K,P,parent,x,z,w=.8,h=1.9,d=.5,rotY=0){const g=new K.THREE.Group();g.position.set(x,0,z);g.rotation.y=rotY;parent.add(g);K.box(w,h-.1,d,K.M.paintDark,0,h/2+.05,0,g);K.box(w-.08,.1,d-.06,K.M.black,0,.05,0,g);
 const n=w>1?2:1;for(let i=0;i<n;i++){const dx=-w/2+(i+.5)*w/n;K.box(w/n-.08,h-.3,.02,K.M.panel,dx,h/2+.05,d/2+.01,g);K.box(.03,.25,.03,K.M.steel,dx+w/n/2-.1,h/2,d/2+.03,g)}
 K.box(.34,.24,.04,K.M.black,-w/2+.3,h*.75,d/2+.03,g);K.box(.3,.2,.005,P.screen,-w/2+.3,h*.75,d/2+.052,g);K.cyl(.025,.02,P.green,w/2-.15,h*.82,d/2+.03,g,'z',10);K.cyl(.025,.02,P.redLamp,w/2-.15,h*.76,d/2+.03,g,'z',10);return g}
// Electric motor: finned body, fan cowl, terminal box and feet, the shaft stub pointing along axis ('x', '-x', 'z' = +z,
// '-z'); returns the shaft stub (spin it with rotation.x).
function motor(K,parent,r,len,x,y,z,axis='x',material=K.M.blue){const g=new K.THREE.Group();g.position.set(x,y,z);g.rotation.y={x:0,'-x':Math.PI,z:-Math.PI/2,'-z':Math.PI/2}[axis]||0;parent.add(g);K.cyl(r,len*.7,material,0,0,0,g,'x',20);
 for(let i=-3;i<=3;i++)K.cyl(r*1.08,len*.04,K.M.paintDark,i*len*.09,0,0,g,'x',20);K.cyl(r*.8,len*.15,K.M.paintDark,-len*.42,0,0,g,'x',20,r*.95);K.cyl(r*.85,len*.1,K.M.dark,len*.4,0,0,g,'x',20);
 K.box(r*.9,r*.6,r*.9,K.M.paintDark,0,r*1.1,0,g);K.box(len*.75,r*.25,r*1.9,K.M.dark,0,-r,0,g);return K.cyl(r*.18,len*.25,K.M.steel,len*.55,0,0,g,'x',12)}
// Yellow / black hazard stripes along x (n blocks of length len / n).
function stripes(K,parent,len,x,y,z,n=8,h=.1,d=.03){for(let i=0;i<n;i++)K.box(len/n,h,d,i%2?K.M.black:K.M.yellow,x-len/2+(i+.5)*len/n,y,z,parent)}
// Nameplate with the make and model (and a smaller one with the type under it) on a face at (x, y, z).
function plates(K,parent,item,w,x,y,z,rotY=0){K.plate(parent,label(item),w,w*.22,x,y,z,'#1c1b18','#ecebe5',rotY);if(item.type)K.plate(parent,item.type,w*.8,w*.14,x,y-w*.2,z,'#ecebe5','#1c1b18',rotY)}

// Steam turbine genset (14 × 5 m): the turbine (casing with the inlet steam chest, exhaust trunk down into the
// foundation, bearing pedestals, governor) through a gearbox to the generator (stator housing, air cooler on top,
// exciter, terminal box) on a concrete foundation with a grated walkway in front, lube oil skid and steam pipe
// behind, control cabinets at the generator end.
export function buildGenset(K,item){
 const g=new K.THREE.Group(),P=palette(K),M=K.M,moving=[],casing=K.mat(0x6f8a84,.35,.5),fy=.9;
 K.box(12.4,fy,3.2,M.concrete,-.5,fy/2,-.3,g);K.box(12.5,.06,3.3,M.concreteDark,-.5,fy-.03,-.3,g);
 K.platform(g,12.8,1,.5,fy+.1,1.9,'se');for(let x=-5.5;x<=6.5;x+=2)K.box(.1,fy+.06,.1,M.paint,x,(fy+.06)/2,1.9,g);K.stair(g,-6.95,0,1.9,fy+.1,1);
 // Turbine: front pedestal with the governor, the casing with its horizontal split flange and bolts, inlet chest and valve.
 K.box(.8,1.1,1.2,M.paintDark,-6,fy+.55,0,g);K.box(.5,.5,.6,M.dark,-6,fy+1.35,0,g);K.cyl(.1,.06,M.steel,-6,fy+1.35,.32,g,'z',12);K.cyl(.06,.4,M.steel,-6,fy+1.15,0,g,'x',12);
 K.cyl(.95,3,casing,-4.2,fy+1.15,0,g,'x',28);K.box(2.6,.3,1.6,M.paintDark,-4.2,fy+.15,0,g);K.box(3.2,.12,2.2,M.paintDark,-4.2,fy+1.15,0,g);for(let x=-5.5;x<=-2.9;x+=.4)for(const z of [-1,1])K.cyl(.06,.2,M.steel,x,fy+1.15,z,g,'y',8);
 K.cyl(.3,.6,casing,-3.6,fy+2.3,0,g);K.box(.9,.7,.9,M.paintDark,-3.6,fy+2.75,0,g);K.cyl(.12,.5,M.steel,-3.6,fy+3.35,0,g);K.cyl(.2,.12,M.dark,-3.6,fy+3.62,0,g);
 K.pipe([[-3.6,.2,-2.3],[-3.6,4.6,-2.3],[-3.6,4.6,-.6],[-3.6,fy+2.75,-.45]],.2,M.cladding,g);K.box(.12,4.4,.12,M.paint,-3.9,2.2,-2.3,g);K.cyl(.28,.1,M.dark,-3.6,2.2,-2.3,g);
 K.box(1.6,1,2.2,casing,-3,fy+.3,0,g);K.box(1.4,.9,1,casing,-3,fy+.4,-1.6,g);K.box(1.5,.1,1.1,M.dark,-3,fy+.9,-1.6,g);K.box(.6,1,1.1,M.paintDark,-2.4,fy+.5,0,g);
 K.cyl(.22,.5,M.steel,-2,fy+1.15,0,g,'x',16);K.box(1.4,1.8,1.8,M.paintDark,-1.1,fy+.9,0,g);K.box(1,.6,.05,M.panel,-1.1,fy+1.1,.92,g);K.cyl(.08,.5,M.steel,-1.1,fy+2.05,0,g);
 const coup=K.cyl(.28,.7,M.steel,0,fy+1.3,0,g,'x',16);K.box(.72,.08,.1,M.dark,0,fy+1.3,0,coup);K.box(.8,.04,1,M.yellow,0,fy+1.72,0,g);for(const z of [-.5,.5])K.box(.8,.5,.04,M.yellow,0,fy+1.5,z,g);
 // Generator: stator housing on its feet, end bells on bearing stands, cooler with louvers and fan hoods, exciter, terminal box and cables.
 K.cyl(1.25,4.2,M.paint,2.5,fy+1.3,0,g,'x',32);K.box(4,.3,2.8,M.paintDark,2.5,fy+.15,0,g);for(const x of [.15,4.85]){K.cyl(1.05,.5,M.paintDark,x,fy+1.3,0,g,'x',28);K.box(.5,1.1,1.6,M.paintDark,x,fy+.55,0,g)}
 K.cyl(.6,.9,M.paintDark,5.4,fy+1.3,0,g,'x',20);K.cyl(.3,.2,M.dark,5.9,fy+1.3,0,g,'x',16);K.box(.5,.9,.9,M.paintDark,5.4,fy+.45,0,g);
 K.box(3.6,1,2.2,M.paintDark,2.5,fy+3.05,0,g);for(let i=0;i<6;i++)K.box(3.4,.06,.04,M.panel,2.5,fy+2.65+i*.15,1.12,g);
 for(const x of [1.6,3.4]){K.cyl(.45,.3,M.dark,x,fy+3.7,0,g);const f=K.cyl(.38,.04,M.steel,x,fy+3.86,0,g);for(const a of [0,1,2])K.box(.7,.02,.06,M.steel,0,0,0,f).rotation.y=a*Math.PI/3;moving.push(t=>f.rotation.y=t*6)}
 K.cyl(.1,.5,M.steel,4,4.7,-.5,g);K.cyl(.16,.04,M.dark,4,4.97,-.5,g);K.box(1.4,1.4,.6,M.paintDark,3,fy+1,-1.35,g);K.box(1.2,.9,.02,M.panel,3,fy+1,-1.66,g);
 for(const x of [2.6,3,3.4])K.pipe([[x,fy+.3,-1.5],[x,.1,-1.9],[x,.1,-2.3]],.04,M.black,g);
 // Lube oil skid, cabinets, nameplates.
 K.box(2.4,1.1,.5,M.paint,-1.5,.55,-2.2,g);K.cyl(.1,.04,M.steel,-.6,1.12,-2.2,g);motor(K,g,.14,.5,-2.2,1.26,-2.2,'x');K.pipe([[-1,1.1,-2.2],[-1,2,-2.2],[-1,2,-.85]],.05,M.steel,g);K.pipe([[-1.6,1.1,-2.2],[-1.6,2.2,-2.2],[-1.6,2.2,-.85]],.05,M.steel,g);
 cabinet(K,P,g,6.35,-1.2,1.5,2.1,.5);cabinet(K,P,g,6.5,.9,.9,1.9,.5);plates(K,g,item,1.6,2.5,fy+1.5,1.26);K.plate(g,'STEAM TURBINE',1,.22,-4.2,fy+1.5,.9);
 moving.push(t=>coup.rotation.x=t*8);
 return {group:g,height:5,update:(t,clock=t)=>moving.forEach(f=>f(t,clock))};
}

// 4-high strip mill stand (6 × 4 m): two housings on sole plates round the work and backup rolls in their chocks
// (pass line 1.1 m), the screw-down bridge with its motor on the housing tops, spindles to the pinion stand and
// the main motor on its pedestal behind, a coil on the uncoiler and coiler mandrels at both sides with the strip
// running through the stand over deflector rolls, roll-change rails and the pulpit in front.
export function buildMill(K,item){
 const g=new K.THREE.Group(),P=palette(K),M=K.M,moving=[],pl=1.1,wr=.17,br=.36,bo=pl+.18+wr+br,housing=K.mat(0x5d6b72,.4,.55);
 for(const z of [-.85,.85]){for(const x of [-.6,.6]){K.box(.7,.15,.8,M.concreteDark,x,.075,z,g);K.box(.4,3.1,.6,housing,x,1.7,z,g)}K.box(1.6,.45,.6,housing,0,3.475,z,g);
  K.box(.7,.7,.6,M.dark,0,bo,z,g);K.box(.7,.7,.6,M.dark,0,2*pl-bo,z,g);K.box(.6,.34,.62,M.steel,0,pl+.18,z,g);K.box(.6,.34,.62,M.steel,0,pl-.18,z,g);K.cyl(.14,.3,M.steel,0,4.05,z,g);K.box(.5,.05,.4,M.yellow,0,4.22,z,g)}
 const rolls=[K.cyl(wr,2.2,M.steel,0,pl+.18,0,g,'z',24),K.cyl(wr,2.2,M.steel,0,pl-.18,0,g,'z',24),K.cyl(br,2,M.dark,0,bo,0,g,'z',28),K.cyl(br,2,M.dark,0,2*pl-bo,0,g,'z',28)];
 K.box(2.4,.2,2.4,M.paintDark,0,3.8,0,g);const sd=motor(K,g,.18,.6,-.8,4.08,0,'x');K.box(.4,.3,.3,M.dark,-.25,4.08,0,g);
 // Drive: spindles to the pinion stand on its pedestal and the main motor on its own behind the stand.
 for(const y of [pl+.18,pl-.18])K.cyl(.11,.3,M.steel,0,y,-1.25,g,'z',12);K.box(.8,1.3,.3,M.paintDark,0,pl,-1.3,g);K.box(.9,.5,.5,M.concreteDark,0,.25,-1.35,g);
 K.box(.9,pl-.45,.6,M.concreteDark,0,(pl-.45)/2,-1.8,g);const shaft=motor(K,g,.42,.6,0,pl,-1.8,'z');
 // Uncoiler (-x) and coiler (+x): a coil on the mandrel, the stand with its bearing, the motor on its plinth behind; the strip between them.
 const coils=[];for(const x of [-2.3,2.3]){const c=K.cyl(.52,1.2,M.steel,x,pl-.54,0,g,'z',32);coils.push(c);K.cyl(.2,1.6,M.dark,x,pl-.54,0,g,'z',16);K.box(.6,1.1,.4,M.paintDark,x,.55,-.95,g);K.box(1,.15,.7,M.paintDark,x,.075,-.9,g);
  motor(K,g,.3,.7,x,pl-.54,-1.55,'z');K.box(.55,.22,.55,M.paint,x,.11,-1.55,g)}
 K.box(4.6,.012,1.2,M.steel,0,pl,0,g);for(const x of [-1.4,1.4]){rolls.push(K.cyl(.12,1.3,M.steel,x,pl-.13,0,g,'z',16));for(const z of [-.6,.6])K.box(.1,pl-.13,.1,M.paintDark,x,(pl-.13)/2,z,g)}
 for(const x of [-.3,.3])K.box(.08,.06,1.3,M.steel,x,.03,1.25,g);cabinet(K,P,g,1.4,1.6,1.2,1.5,.5);K.box(.9,.7,.4,M.paint,1.2,.35,-1.75,g);K.cyl(.12,.3,M.blue,1.2,.85,-1.75,g);
 plates(K,g,item,1,0,3.52,1.16);
 moving.push(t=>{for(const c of coils)c.rotation.z=t*.8;for(const r of rolls)r.rotation.z=t*3;shaft.rotation.x=t*6;sd.rotation.x=t*4});
 return {group:g,height:4.35,update:(t,clock=t)=>moving.forEach(f=>f(t,clock))};
}

// Annealing furnace (8 × 3 m): insulated chamber on feet with rib panels, the lift door at +x in its frame with a hot
// slot, burner boxes with the gas manifold behind, recirculation fan on the roof, stack, charging roller table with
// a tray of coils and the control cabinet at -x.
export function buildFurnace(K,item){
 const g=new K.THREE.Group(),P=palette(K),M=K.M,moving=[],hot=K.mat(0x3a1a08,0,.95,{emissive:0xff6a2a,emissiveIntensity:.6}),cx=-.6,L=5.4,H=2.3,D=2.6,y0=.25;
 for(const x of [-2.4,-.8,.8,2.4])for(const z of [-1.1,1.1])K.box(.15,y0,.15,M.paintDark,cx+x,y0/2,z,g);
 K.box(L,.2,D,M.paintDark,cx,y0+.1,0,g);K.box(L,H,D,M.cladding,cx,y0+.2+H/2,0,g);for(let i=0;i<=6;i++)K.box(.1,H+.05,D+.08,M.paintDark,cx-L/2+i*L/6,y0+.2+H/2,0,g);K.box(L+.1,.1,D+.1,M.paintDark,cx,y0+.2+H+.05,0,g);
 // Door, its lifting frame and cylinder; the glow through the slot and a light on the floor.
 for(const z of [-1.2,1.2])K.box(.15,3,.15,M.paint,2.35,1.5,z,g);K.box(.15,.2,2.6,M.paint,2.35,3,0,g);K.cyl(.08,.7,M.steel,2.35,2.75,0,g);K.box(.15,2.1,2.3,M.paintDark,2.25,1.35,0,g);
 for(let i=0;i<4;i++)K.box(.04,1.9,.04,M.steel,2.34,1.35,-.9+i*.6,g);K.box(.05,.15,1.6,hot,2.33,.5,0,g);K.glow(g,2.7,.6,0,0xff6a1a,1.5,4);
 // Burners on the back wall with the yellow gas manifold, the combustion air blower.
 for(const x of [-1.6,0,1.6]){K.box(.5,.5,.3,M.paintDark,cx+x,1.2,-1.45,g);K.cyl(.06,.2,M.steel,cx+x,1.2,-1.4,g,'z',10);K.pipe([[cx+x,.9,-1.55],[cx+x,1.2,-1.55],[cx+x,1.2,-1.45]],.04,M.yellow,g)}
 K.pipe([[cx-2.2,.9,-1.55],[cx+2.2,.9,-1.55]],.05,M.yellow,g);K.cyl(.05,.9,M.yellow,cx-2.2,.45,-1.55,g);K.box(.45,.43,.3,M.paintDark,cx+2.5,.215,-1.48,g);const blower=motor(K,g,.15,.5,cx+2.5,.6,-1.48,'-x');K.pipe([[cx+2.5,.75,-1.48],[cx+2.5,1.5,-1.48],[cx+2.1,1.5,-1.35]],.07,M.steel,g);
 // Roof: recirculation fan with its motor, thermocouple wells, the stack with a rain cap.
 K.box(.9,.3,.9,M.paintDark,cx+1,2.9,0,g);const fan=K.cyl(.18,.4,M.blue,cx+1,3.25,0,g);for(let i=0;i<4;i++)K.cyl(.2,.03,M.paintDark,cx+1,3.1+i*.08,0,g);K.cyl(.05,.04,M.steel,cx+1,3.47,0,g);
 for(const x of [-.5,.5])K.cyl(.03,.4,M.steel,cx+x,2.95,.6,g);K.cyl(.22,.7,M.steel,cx-1.8,3.1,0,g);K.cyl(.3,.05,M.dark,cx-1.8,3.5,0,g);K.pipe([[cx-1.2,2.8,0],[cx-1.2,3.2,0],[cx-1.6,3.2,0]],.08,M.steel,g);
 // Charging roller table with a tray of coils, the control cabinet and the temperature recorder on the front.
 for(const x of [2.7,3.8])for(const z of [-.9,.9])K.box(.08,.8,.08,M.paintDark,x,.4,z,g);for(const z of [-.95,.95])K.box(1.3,.12,.08,M.paintDark,3.25,.85,z,g);for(let x=2.7;x<=3.85;x+=.22)K.cyl(.08,1.8,M.steel,x,.9,0,g,'z',12);
 K.box(1,.1,1.4,M.dark,3.25,1.03,0,g);for(const x of [3,3.5])K.cyl(.3,.5,M.steel,x,1.33,0,g,'y',24);
 cabinet(K,P,g,-3.7,.5,.6,1.9,.45);K.box(.6,.8,.08,M.panel,cx+1.6,1.7,D/2+.04,g);K.box(.5,.4,.01,P.screen,cx+1.6,1.8,D/2+.09,g);plates(K,g,item,1.4,cx-.6,1.9,D/2+.06);
 moving.push((t,clock)=>{hot.emissiveIntensity=.7+.25*Math.sin(clock*3)+.1*Math.sin(clock*7.3);fan.rotation.y=t*7;blower.rotation.x=t*10});
 return {group:g,height:3.5,update:(t,clock=t)=>moving.forEach(f=>f(t,clock))};
}

// Straight-side mechanical press (5 × 4 m, 7 m tall), scaled a little with the tonnage in the model / title: pit
// frame, bed and bolster with the lower die, two uprights with the tie-rod nuts on the crown, the slide with the
// upper die stroking slowly, the crown with flywheel housing, main motor and belt guard, counterbalance tank,
// guards with hazard stripes, light curtains at the front, a ladder up the back and the control pulpit.
export function buildStampingPress(K,item){
 const g=new K.THREE.Group(),P=palette(K),M=K.M,moving=[],k=Math.min(1.08,Math.max(.8,Math.pow(tonnage(item)/600,.25))),press=K.mat(0x7d8f96,.35,.5),W=3.4*k,D=2.6*k;
 K.box(W-.4,.6,D-.2,M.concreteDark,0,.3,0,g);K.box(W,.8,D,press,0,1,0,g);K.box(W-.4,.2,D-.4,M.steel,0,1.5,0,g);for(let i=0;i<5;i++)K.box(W-.5,.03,.04,M.dark,0,1.605,-D/2+.3+i*(D-.6)/4,g);
 K.box(1.6*k,.4,1.2*k,M.dark,0,1.8,0,g);for(const x of [-1,1])K.box(.7*k,3.2,D,press,x*(W/2-.35*k),3,0,g);K.box(W,1.7,D+.2,press,0,5.45,0,g);
 for(const x of [-1,1])for(const z of [-1,1]){K.cyl(.2,.3,M.dark,x*(W/2-.35*k),6.45,z*(D/2-.35),g,'y',12);K.cyl(.1,.5,M.steel,x*(W/2-.35*k),6.6,z*(D/2-.35),g,'y',8)}
 const slide=new K.THREE.Group();slide.position.y=3.2;g.add(slide);K.box(W-1.5*k,.9,D-.6,M.paintDark,0,0,0,slide);K.box(1.6*k,.35,1.2*k,M.dark,0,-.6,0,slide);K.box(.4,.6,.4,M.steel,0,.7,0,slide);
 for(const x of [-1,1])K.cyl(.12,1.6,M.steel,x*.6*k,1.3,0,slide,'y',10);
 // Crown: flywheel housing, main motor and belt guard, counterbalance tank, lube unit, nameplate.
 const fw=K.cyl(.75,.4,M.paintDark,W/2+.2,5.6,0,g,'x',32);K.cyl(.2,.5,M.steel,W/2+.2,5.6,0,g,'x',12);for(let i=0;i<4;i++)K.box(.42,.08,1.2,M.steel,0,0,0,fw).rotation.x=i*Math.PI/4;
 const mot=motor(K,g,.3,1,W/2-.6,6.65,0,'x');K.box(.9,.12,.5,M.paintDark,W/2-.6,6.3,0,g);K.box(1.4,.5,.15,M.yellow,W/2-.1,6.3,.85,g).rotation.z=-.6;
 K.cyl(.32,2.2,M.steel,-.3,6.65,0,g,'z',20);for(const z of [-1,1])K.sphere(.32,M.steel,-.3,6.65,z*1.1,g,16);for(const z of [-.7,.7])K.box(.4,.12,.5,M.paintDark,-.3,6.36,z,g);K.box(.5,.4,.35,M.paint,-1.2,6.5,0,g);K.cyl(.05,.5,M.steel,-1.2,6.75,0,g);
 K.box(.8,.5,.5,M.paintDark,-.4,6.55,-.9,g);K.pipe([[-.4,6.55,-.65],[-.4,6.95,-.65],[-.3,6.95,-.95]],.03,M.steel,g);
 // Guards: panes between the uprights with their frames, hazard stripes, light curtains at the front corners.
 for(const s of [-1,1]){K.box(W-1.4*k,2.6,.02,M.glass,0,3.1,s*(D/2+.03),g).castShadow=false;K.box(W-1.4*k,.06,.06,M.dark,0,4.4,s*(D/2+.03),g);K.box(W-1.4*k,.06,.06,M.dark,0,1.8,s*(D/2+.03),g);stripes(K,g,W-1.4*k,0,1.72,s*(D/2+.05),8)}
 for(const x of [-1,1]){const lc=K.box(.08,2.1,.08,M.yellow,x*(W/2-k),2.45,D/2+.18,g);K.box(.12,.08,.22,M.dark,x*(W/2-k),1.44,D/2+.09,g);for(let i=0;i<5;i++)K.box(.02,.06,.03,P.redLamp,.045,-.35+i*.3,0,lc)}
 for(let i=0;i<11;i++)K.box(.04,.04,.6,M.steel,-W/2-.08,.4+i*.55,-.5,g);for(const z of [-.8,-.2]){K.box(.04,6.1,.04,M.steel,-W/2-.08,3.05,z,g);for(const y of [1.2,3.5,5.8])K.box(.1,.04,.04,M.steel,-W/2-.04,y,z,g)}
 // Pulpit with its screen and buttons, foot pedal, the nameplate on the crown.
 cabinet(K,P,g,W/2+.45,1.45,.7,1.4,.5);K.box(.7,.06,.5,M.panel,W/2+.45,1.43,1.45,g);K.box(.3,.05,.2,M.dark,W/2-.2,.03,1.6,g);plates(K,g,item,1.6,0,5.6,D/2+.12);
 moving.push(t=>{slide.position.y=3.2-.4*Math.cos(t*.8);fw.rotation.x=t*5;mot.rotation.x=t*7});
 return {group:g,height:7,update:(t,clock=t)=>moving.forEach(f=>f(t,clock))};
}

// Single-shaft shredder (5 × 3 m): rotor housing on its frame with the hopper (hazard stripes round the rim) on
// top, the hydraulic pusher cylinder on the back of the hopper, gearbox and motor on the shaft at -x, screen
// basket below, the discharge conveyor stub out the front, hydraulic power unit and control cabinet at +x.
export function buildShredder(K,item){
 const g=new K.THREE.Group(),P=palette(K),M=K.M,moving=[],body=K.mat(0x4e6577,.35,.55);
 for(const x of [-1.1,1.1])for(const z of [-.85,.85])K.box(.15,.9,.15,M.paintDark,x,.45,z,g);for(const z of [-.85,.85])K.box(2.5,.15,.15,M.paintDark,0,.9,z,g);
 K.box(2.4,.9,2,body,0,1.42,0,g);K.box(2.5,.1,2.1,M.dark,0,1.92,0,g);for(const z of [-1,1])K.box(2.2,.5,.04,M.panel,0,1.4,z*1.02,g);for(let i=0;i<6;i++)K.cyl(.03,.06,M.steel,-1,1.4+(i%3)*.2,1.05,g,'z',6);
 K.box(2.4,1.3,2,body,0,2.6,0,g);K.box(2.6,.25,2.2,body,0,3.33,0,g);K.box(2.3,.05,1.9,M.black,0,3.44,0,g);stripes(K,g,2.6,0,3.4,1.11,10,.12);stripes(K,g,2.6,0,3.4,-1.11,10,.12);
 for(const x of [-1,1])K.box(.08,1.5,.08,M.paintDark,x*1.24,2.7,1.02,g);
 // Hydraulic pusher through the back wall of the hopper; its hoses to the power unit.
 K.cyl(.14,.45,M.steel,0,2.4,-1.25,g,"z",16);K.cyl(.07,.2,M.steel,0,2.4,-1.5,g,"z",10);K.box(.5,.4,.12,M.paintDark,0,2.4,-1.03,g);K.box(.6,.3,.6,M.paintDark,0,2.15,-1.25,g);
 K.pipe([[.2,2.3,-1.42],[1,1.2,-1.42],[1.6,1.2,-1.2],[1.9,.6,-.7]],.03,M.black,g);K.pipe([[-.2,2.3,-1.42],[-.2,1.4,-1.42],[1.8,.8,-1.3],[1.7,.5,-.7]],.03,M.black,g);
 // Drive: bearing housing, coupling, gearbox and motor on the rotor shaft at -x; screen basket and discharge conveyor underneath.
 K.cyl(.32,.15,M.dark,-1.27,1.45,0,g,'x',20);const coup=K.cyl(.18,.25,M.steel,-1.45,1.45,0,g,'x',12);K.box(.6,.9,.9,M.paintDark,-1.85,1.45,0,g);K.box(.7,.1,1,M.paintDark,-1.85,.95,0,g);
 motor(K,g,.33,.6,-2.3,1.5,0,'x');K.box(.5,.15,.9,M.paintDark,-2.3,1.1,0,g);K.box(1,1,.9,M.paint,-1.95,.5,0,g);
 K.cyl(.7,1.8,M.grating,0,1.1,0,g,'x',20);const belt=new K.THREE.Group();belt.position.set(0,.5,.6);belt.rotation.x=-.35;g.add(belt);K.box(1.1,.12,1.6,P.belt,0,0,0,belt);for(const x of [-.6,.6])K.box(.08,.3,1.6,M.paintDark,x,0,0,belt);
 K.cyl(.1,1.2,M.steel,0,0,.8,belt,"x",12);K.cyl(.1,1.2,M.steel,0,0,-.8,belt,"x",12);for(const x of [-.5,.5])K.box(.08,.75,.08,M.paintDark,x,.375,1.38,g);
 // Hydraulic power unit, control cabinet, the nameplate on the hopper.
 K.box(.9,.7,.7,M.paint,1.9,.35,-.5,g);K.cyl(.14,.4,M.blue,1.9,.9,-.6,g);K.cyl(.1,.06,M.dark,1.9,1.13,-.6,g);K.cyl(.08,.1,M.steel,2.2,.75,-.3,g,'z',10);K.box(.2,.3,.02,M.glass,1.7,.4,-.14,g);
 cabinet(K,P,g,2.05,.9,.8,1.9,.5);plates(K,g,item,1.3,-.2,2.8,1.02);
 moving.push(t=>{coup.rotation.x=t*2.5});
 return {group:g,height:3.5,update:(t,clock=t)=>moving.forEach(f=>f(t,clock))};
}

// Optical sorter (6 × 2.5 m): vibrating feed chute at -x onto an accelerating belt conveyor, the sensor bridge
// with its lamp box and camera housings over the belt, the air-jet valve block with its hoses at the belt end,
// two discharge chutes (eject up, pass down) into hoods at +x, control cabinet behind; the belt stripes move.
export function buildSorter(K,item){
 const g=new K.THREE.Group(),P=palette(K),M=K.M,moving=[],body=K.mat(0xd8d9d4,.3,.5),by=1.2;
 for(const x of [-2.1,-.6,.9])for(const z of [-.5,.5])K.box(.08,by-.1,.08,M.paintDark,x,(by-.1)/2,z,g);for(const z of [-.55,.55])K.box(3.2,.12,.06,body,-.5,by-.05,z,g);
 const stripesG=[];K.box(3,.05,1,P.belt,-.5,by,0,g);for(let i=0;i<5;i++)stripesG.push(K.box(.06,.012,.9,M.yellow,-1.9+i*.6,by+.03,0,g));for(const x of [-2,1])K.cyl(.14,1.08,M.steel,x,by-.02,0,g,'z',16);
 for(let x=-1.7;x<.9;x+=.4)K.cyl(.04,1.05,M.steel,x,by-.16,0,g,'z',8);for(const z of [-.5,.5])K.box(1.4,.04,.04,M.paintDark,-1.3,by-.6,z,g);motor(K,g,.12,.4,1,by-.05,.75,'-z');K.box(.3,.06,.3,M.paintDark,1,by-.2,.7,g);
 // Feed: a vibrating chute on springs over its drive box, fed from the inlet hopper on its frame at -x.
 const chute=K.box(.9,.08,1,M.steel,-2.5,by+.35,0,g);chute.rotation.z=-.3;for(const z of [-.45,.45])K.box(.9,.3,.03,M.steel,-2.5,by+.45,z,g).rotation.z=-.3;for(const x of [-2.7,-2.3])for(const z of [-.35,.35])K.cyl(.05,.45,M.dark,x,by+.075,z,g,'y',8);
 K.box(.8,1.05,1,M.paintDark,-2.5,.525,0,g);for(const z of [-.6,.6])K.box(.08,2.3,.08,body,-2.6,1.15,z,g);K.box(.1,.1,1.3,body,-2.6,2.05,0,g);K.box(.7,.6,.7,body,-2.6,by+1.1,0,g);K.cyl(.1,.4,body,-2.6,by+1.6,0,g,'y',12,.5);K.cyl(.05,.5,M.steel,-2.6,by+1.85,0,g);
 // Sensor bridge: posts, lamp box with the lamps beneath, camera housings on top, cable plenum.
 for(const z of [-.85,.85])K.box(.12,2.6,.12,body,.4,1.3,z,g);K.box(1.1,.5,1.9,body,.4,2.4,0,g);for(const x of [.1,.7])K.box(.12,.03,1.7,M.lamp,x,2.14,0,g);for(const x of [-.05,.4,.85])K.box(.3,.35,.4,M.dark,x,2.82,-.3,g);
 K.box(.1,.03,1.5,M.glass,.4,2.13,0,g).castShadow=false;K.box(1.2,.12,.5,M.paintDark,.4,2.71,.6,g);K.box(.35,.2,.3,M.black,.4,2.87,.6,g);K.pipe([[.4,2.4,-.95],[.4,2.4,-1.1],[-1,2.3,-1.1],[-1.4,1.85,-1]],.03,M.black,g);
 // Ejector valve block under the belt head with the air hoses and the air receiver on its saddle, the two discharge chutes on their posts into the hoods.
 K.box(.25,.3,1.1,M.dark,1.05,by-.35,0,g);for(let i=0;i<8;i++)K.cyl(.02,.1,M.steel,1.2,by-.35,-.42+i*.12,g,'x',6);K.pipe([[1.05,by-.35,-.55],[1.05,by-.35,-1],[2.6,.7,-1],[2.6,.7,-.6]],.04,M.steel,g);K.cyl(.22,.6,M.steel,2.6,.5,-.75,g,'x',16);K.box(.5,.3,.15,M.paintDark,2.6,.15,-.75,g);
 const sep=K.box(1.2,.04,1.1,M.steel,1.9,by+.15,0,g);sep.rotation.z=.4;const hi=K.box(1.6,.05,1.1,M.steel,2.1,by+.6,0,g);hi.rotation.z=-.5;const lo=K.box(1.3,.05,1.1,M.steel,2,.75,0,g);lo.rotation.z=.45;
 for(const z of [-.55,.55]){K.box(1.6,.5,.03,M.steel,2.1,by+.75,z,g).rotation.z=-.5;K.box(1.3,.4,.03,M.steel,2,.95,z,g).rotation.z=.45}for(const z of [-.56,.56])K.box(.06,2.1,.06,M.steel,1.45,1.05,z,g);
 K.box(.5,1.3,1.2,body,2.75,.65,0,g);K.box(.5,.6,1.2,body,2.75,by+1,0,g);for(const z of [-.55,.55])K.box(.08,.6,.08,body,2.95,1.6,z,g);for(const y of [.4,.9,by+.9])K.box(.4,.03,1.1,M.dark,2.75,y,.61,g);K.box(.1,.08,.08,M.paintDark,2.75,2.0,0,g);
 cabinet(K,P,g,-1.4,-.95,1.2,1.8,.45);plates(K,g,item,1,.4,2.45,.96);
 moving.push(t=>{for(let i=0;i<5;i++)stripesG[i].position.x=-1.9+((t*1.2+i*.6)%3)});
 return {group:g,height:3,update:(t,clock=t)=>moving.forEach(f=>f(t,clock))};
}

// Channel baling press (6 × 2.5 m): the cylinder block at -x with the visible ram rod stroking into the long
// press channel, the feed hopper with its flared rim on top, the tying unit over the channel, the outlet with
// a tied bale coming out at +x, the hydraulic power unit with pipes behind, control cabinet and nameplate.
export function buildBaler(K,item){
 const g=new K.THREE.Group(),P=palette(K),M=K.M,moving=[],body=K.mat(0x3f6d9c,.35,.5);
 for(const x of [-2.8,-1.8,-.6,.6,1.4])for(const z of [-.4,.4])K.box(.12,.7,.12,M.paintDark,x,.35,z,g);K.box(4.4,.1,1,M.paintDark,-.7,.72,0,g);
 K.box(.5,1.1,1.1,body,-2.85,1.25,0,g);for(const z of [-.5,.5])K.box(.5,.1,.08,M.steel,-2.85,1.7,z,g);const rod=K.cyl(.13,.5,M.steel,-2.5,1.25,0,g,'x',14);K.box(3.8,1,1,body,-.4,1.25,0,g);
 for(let i=0;i<5;i++)K.box(.06,1.05,1.05,M.paintDark,-2.1+i*.85,1.25,0,g);for(const z of [-.52,.52])for(let i=0;i<4;i++)K.cyl(.04,.06,M.steel,-1.9+i*1.05,.95,z,g,'z',6);
 // Hopper with its flared rim, infeed deflector, the tying unit and its needle guards, outlet channel bars.
 K.box(1.5,1.1,1.1,body,-1.1,2.3,0,g);K.box(1.75,.2,1.35,body,-1.1,2.92,0,g);K.box(1.6,.06,1.2,M.black,-1.1,3.03,0,g);stripes(K,g,1.75,-1.1,3,.69,7,.12);for(const x of [-1.9,-.3])K.box(.1,.9,1.1,M.paintDark,x,2.3,0,g);
 K.box(.9,.5,1,M.paintDark,.9,1.95,0,g);for(let i=0;i<4;i++)K.cyl(.03,.5,M.steel,.6+i*.2,2.15,.52,g,'y',6);K.box(.9,.08,.3,M.yellow,.9,2.22,.6,g);for(const z of [-.45,.45])K.box(.05,.2,.08,M.steel,.9,1.4,z,g);
 for(const z of [-.5,.5])for(let i=0;i<3;i++)K.box(1.3,.06,.04,M.steel,2.15,.95+i*.3,z,g);K.box(1.3,.06,1.04,M.steel,2.15,.78,0,g);for(const z of [-.5,.5])K.box(.08,.75,.08,M.paintDark,2.7,.375,z,g);
 K.box(1.1,.8,.85,M.rust,2.25,1.2,0,g);for(const x of [1.9,2.25,2.6])K.box(.03,.84,.89,M.steel,x,1.2,0,g);
 // Hydraulic power unit (tank, pump motor, manifold) behind, pipes to the main cylinder, control cabinet, nameplate.
 K.box(1.6,.8,.5,M.paint,-1.3,.4,-.95,g);motor(K,g,.15,.5,-1.6,.97,-.95,'x');K.box(.4,.3,.3,M.dark,-1.05,.95,-.95,g);K.box(.3,.3,.015,M.glass,-1.9,.45,-.69,g).castShadow=false;
 K.pipe([[-1.05,1.1,-.95],[-2.85,1.4,-.95],[-2.85,1.4,-.6]],.04,M.steel,g);K.pipe([[-1.4,.8,-.95],[-2.7,.9,-.95],[-2.7,1,-.6]],.04,M.steel,g);
 cabinet(K,P,g,2.55,-.9,.8,1.9,.5);plates(K,g,item,1.1,-.5,1.4,.52);
 moving.push(t=>{const L=.75+.3*Math.sin(t*.7);rod.scale.x=L/.5;rod.position.x=-2.75+L/2});
 return {group:g,height:3.06,update:(t,clock=t)=>moving.forEach(f=>f(t,clock))};
}

// Extruder (8 × 2.5 m): motor and gearbox at -x, the long barrel with heater bands and cooling fans on the machine
// bed, the hopper with its agitator motor and the dosing feeder on top, degassing dome, the die head with the strand
// water bath and the pelletizer at +x, control cabinet with its screen behind.
export function buildExtruder(K,item){
 const g=new K.THREE.Group(),P=palette(K),M=K.M,moving=[],by=1.2,body=K.mat(0xd0d3cf,.3,.5);
 K.box(7.6,.6,1.2,M.paint,0,.3,0,g);K.box(7.4,.08,1.1,M.black,0,.04,0,g);for(let i=0;i<6;i++)K.box(.6,.3,.03,M.panel,-3.2+i*1.1,.3,.62,g);
 const shaft=motor(K,g,.45,1.3,-3.1,by,0,'x');K.box(1.2,.3,1,M.paintDark,-3.1,.75,0,g);K.box(1,1.1,1,M.paintDark,-1.8,by-.1,0,g);K.box(.8,.5,.04,M.panel,-1.8,by,.52,g);K.cyl(.1,.4,M.steel,-1.8,by+.65,0,g);
 K.cyl(.28,3.2,M.steel,.3,by,0,g,'x',24);for(let i=0;i<9;i++){K.cyl(.34,.14,M.dark,-1+i*.33,by,0,g,'x',24);K.box(.3,.3,.3,M.paintDark,-1+i*.33,by-.42,0,g);K.cyl(.11,.04,M.dark,-1+i*.33,by-.42,.17,g,'z')}
 K.box(3.2,.08,.7,M.paintDark,.3,by-.32,0,g);for(const x of [-1.2,1.8])K.cyl(.36,.12,M.steel,x,by,0,g,'x',24);for(let i=0;i<8;i++)K.cyl(.025,.1,M.steel,-1.2,by+.3*Math.cos(i*Math.PI/4),.3*Math.sin(i*Math.PI/4),g,'x',6);
 // Hopper with slide gate and the agitator motor, the dosing feeder beside it, degassing dome, barrel thermocouples.
 K.cyl(.45,.6,body,-1,by+.95,0,g,'y',24);K.cyl(.45,.35,body,-1,by+.48,0,g,'y',24,.12);K.cyl(.48,.05,M.dark,-1,by+1.27,0,g,'y',24);K.box(.5,.04,.2,M.steel,-1,by+.33,0,g);
 const agit=K.cyl(.1,.25,M.blue,-1,by+1.4,0,g,'y',14);K.cyl(.03,.3,M.steel,-1,by+1.2,0,g,'y',8);K.box(.2,.15,.2,M.dark,0,-.07,0,agit);
 K.box(.5,.5,.4,body,-.3,by+1.05,-.3,g);K.cyl(.1,.4,body,-.3,by+.6,-.3,g,'y',12,.25);K.cyl(.1,.05,M.paintDark,-.3,by+.33,-.3,g);K.cyl(.3,.1,M.dark,-.3,by+1.35,-.3,g);K.cyl(.1,.2,M.blue,-.3,by+1.5,-.3,g);
 K.cyl(.18,.3,M.steel,.6,by+.4,0,g);K.cyl(.22,.05,M.dark,.6,by+.57,0,g);K.pipe([[.6,by+.6,0],[.6,by+.9,0],[1.6,by+.9,-.75],[1.6,.4,-.75]],.05,M.steel,g);K.box(.5,.4,.4,M.paintDark,1.6,.2,-.85,g);for(let i=0;i<4;i++)K.cyl(.02,.2,M.steel,-.6+i*.6,by+.38,0,g);
 // Die head, strand bath with water, pelletizer with its motor and the pellet pipe; the strands.
 K.box(.6,.7,.6,M.paintDark,2.1,by,0,g);K.cyl(.2,.1,M.steel,2.45,by,0,g,'x',16);K.box(1.6,.5,.8,M.paintDark,3.1,by-.3,0,g);K.box(1.5,.03,.7,M.water,3.1,by-.07,0,g).castShadow=false;
 for(let i=0;i<6;i++)K.box(1.4,.015,.03,M.white,3.15,by-.03,-.25+i*.1,g);for(const x of [2.4,3.2])for(const z of [-.4,.4])K.box(.08,.5,.08,M.paintDark,x,by-.8,z,g);
 K.box(.5,.9,.6,M.paintDark,3.7,by+.1,0,g);K.box(.4,.05,.5,M.steel,3.7,by-.1,0,g);motor(K,g,.14,.4,3.7,by+.4,.5,'-z');K.box(.3,.06,.3,M.paintDark,3.7,by+.22,.4,g);K.pipe([[3.7,by-.35,0],[3.9,.5,0],[3.6,.55,.95]],.05,M.steel,g);K.box(.5,.6,.5,M.paint,3.6,.3,.95,g);K.box(.3,.4,.3,M.panel,3.75,by+.75,0,g);
 cabinet(K,P,g,.4,-.98,1.4,1.9,.45);plates(K,g,item,1,-1.8,by+.35,.54);
 moving.push(t=>{agit.rotation.y=t*2;shaft.rotation.x=t*9});
 return {group:g,height:2.75,update:(t,clock=t)=>moving.forEach(f=>f(t,clock))};
}

// Granulator (3 × 2.5 m): rotor housing over the discharge bin on a frame, the feed hopper with rubber curtain on
// top, the motor at -x with the belt guard up to the rotor shaft, sound enclosure panels round the back and +x side,
// control cabinet and nameplate; the motor pulley spins.
export function buildGranulator(K,item){
 const g=new K.THREE.Group(),P=palette(K),M=K.M,moving=[],body=K.mat(0x2f5f8f,.35,.5);
 K.box(1.6,.4,1.4,M.paintDark,.1,.3,0,g);for(const x of [-.6,.8])for(const z of [-.55,.55])K.cyl(.1,.06,M.black,x,.1,z,g,'x',10);K.box(1.4,.6,1.3,M.paint,.1,.8,0,g);K.box(1,.3,.03,M.dark,.1,.75,.66,g);K.box(.5,.04,.04,M.steel,.1,.75,.7,g);
 K.box(1.4,1.1,1.3,body,.1,1.65,0,g);K.cyl(.7,1.3,body,.1,1.6,0,g,'z',28);K.cyl(.72,.1,M.dark,.1,1.6,.65,g,'z',28);K.cyl(.12,.2,M.steel,.1,1.6,.75,g,'z',12);for(let i=0;i<8;i++)K.cyl(.03,.05,M.steel,.1+.58*Math.cos(i*Math.PI/4),1.6+.58*Math.sin(i*Math.PI/4),.7,g,'z',6);
 K.box(.5,.1,1,M.yellow,.1,2.22,0,g);K.cyl(.06,1,M.steel,.1,2.2,0,g,'z',8);K.box(.9,.55,.9,body,.1,2.48,0,g);K.box(1.1,.08,1.1,M.dark,.1,2.79,0,g);K.box(1.1,.1,1.1,body,.1,2.7,0,g);
 for(const z of [-.4,.4])K.box(.8,.04,.03,P.rubber,.1,2.8,z,g);K.box(.04,.04,.8,P.rubber,-.3,2.8,0,g);K.box(.04,.04,.8,P.rubber,.5,2.8,0,g);
 // Motor at -x with the pulleys and belt guard across the front, flywheel on the back of the rotor shaft.
 const pulley=motor(K,g,.26,.7,-1,.75,.3,'z');K.box(.8,.6,.6,M.paintDark,-1,.3,.3,g);const guard=K.box(.45,1.75,.14,M.paint,-.45,1.2,.8,g);guard.rotation.z=-.65;K.box(.4,.3,.06,M.yellow,-1,.75,.83,g);
 K.cyl(.5,.12,M.dark,.1,1.6,-.7,g,'z',24);K.cyl(.06,.2,M.steel,.1,1.6,-.78,g,'z',8);
 // Sound enclosure panels (back and +x), control cabinet and nameplate.
 K.box(2.9,2.2,.08,M.cladding,0,1.1,-1.15,g);for(const x of [-1.4,0,1.4])K.box(.06,2.2,.1,M.paintDark,x,1.1,-1.15,g);K.box(.08,2.2,1.6,M.cladding,1.45,1.1,-.35,g);K.box(1.2,.1,2.3,M.paintDark,.85,2.2,-.05,g);
 for(const y of [.6,1.6])K.box(.03,.3,.03,M.steel,1.49,y,.3,g);cabinet(K,P,g,-1.1,.85,.6,1.5,.4);plates(K,g,item,.9,.1,1.2,.66);
 moving.push(t=>pulley.rotation.x=t*8);
 return {group:g,height:2.85,update:(t,clock=t)=>moving.forEach(f=>f(t,clock))};
}

// Vertical tank (3 × 3 m, 4 m tall): skirt, shell (stainless, or blue steel for wastewater by item.type), cone roof
// with vent, manway and handrail, side manway with its bolted flange, nozzles with flanges, level gauge with its
// float, ladder with cage hoops, and the pump skid at its foot with suction and discharge pipes.
export function buildTank(K,item){
 const g=new K.THREE.Group(),P=palette(K),M=K.M,moving=[],shell=/wastewater|water|effluent|sludge/i.test(`${item.type||''} ${item.name||''}`)?M.blue:M.steel,R=1.1,cz=-.2,top=3.3;
 K.cyl(R+.05,.1,M.concreteDark,0,.05,cz,g,'y',32);K.cyl(R,.3,M.dark,0,.25,cz,g,'y',32);K.cyl(R,top-.4,shell,0,.4+(top-.4)/2,cz,g,'y',32);for(const y of [1.1,2.2])K.torus(R,.03,shell,0,y,cz,g,'y',32);
 K.cyl(.12,.5,shell,0,top+.25,cz,g,'y',32,R+.02);K.cyl(.1,.3,M.steel,0,top+.65,cz,g,'y',12);K.cyl(.2,.05,M.dark,0,top+.82,cz,g,'y',12);
 K.cyl(.3,.2,shell,.5,top+.32,cz-.3,g,'y',20);K.cyl(.34,.05,M.steel,.5,top+.44,cz-.3,g,'y',20);for(let i=0;i<8;i++)K.cyl(.02,.06,M.steel,.5+.3*Math.cos(i*Math.PI/4),top+.47,cz-.3+.3*Math.sin(i*Math.PI/4),g,'y',6);
 K.cyl(.08,.4,M.steel,-.5,top+.3,cz+.4,g,'y',10);K.sphere(.12,M.steel,-.5,top+.5,cz+.4,g,12);K.cyl(.06,.15,M.yellow,-.6,top+.2,cz-.5,g,'z',10);
 // Side manway at the front with its bolted flange; nozzles with flanges; the level gauge and its float.
 K.cyl(.3,.2,shell,0,1,cz+R,g,'z',24);K.torus(.32,.04,M.steel,0,1,cz+R+.1,g,'z',24);for(let i=0;i<10;i++)K.cyl(.02,.05,M.steel,.32*Math.cos(i*Math.PI/5),1+.32*Math.sin(i*Math.PI/5),cz+R+.13,g,'z',6);
 K.box(.1,.6,.1,M.steel,.42,1,cz+R+.05,g);K.cyl(.03,.3,M.steel,.42,1,cz+R+.1,g,'x',8);
 for(const [a,y,r] of [[.9,2.6,.08],[-2.2,2.9,.06],[2.4,1.6,.07],[-1.1,.6,.1]]){const x=Math.sin(a)*R,z=cz+Math.cos(a)*R;K.cyl(r,.35,M.steel,x+Math.sin(a)*.15,y,z+Math.cos(a)*.15,g,'y',12).rotation.set(Math.PI/2,0,-a);K.cyl(r+.05,.04,M.steel,x+Math.sin(a)*.32,y,z+Math.cos(a)*.32,g,'y',12).rotation.set(Math.PI/2,0,-a)}
 K.box(.06,2.4,.06,M.steel,-.7,1.7,cz+R*.8,g);K.cyl(.035,2.2,M.glass,-.7,1.7,cz+R*.8+.08,g,'y',10).castShadow=false;for(const y of [.5,2.9]){K.cyl(.05,.08,M.steel,-.7,y,cz+R*.8+.08,g,'y',8);K.cyl(.04,.1,M.red,-.7,y,cz+R*.8+.14,g,'z',8)}
 const flt=K.box(.09,.06,.03,M.red,-.7,1.6,cz+R*.8+.13,g);
 // Ladder up the +x side with cage hoops, the top handrail round the manway.
 for(const z of [-.2,.2])K.box(.05,top+.1,.05,M.yellow,R+.18,(top+.1)/2,cz+z,g);for(let y=.35;y<top;y+=.3)K.cyl(.015,.5,M.steel,R+.18,y,cz,g,"z",8);for(let y=2;y<top+.1;y+=.6)K.torus(.32,.02,M.yellow,R+.18,y,cz,g,"y",16);
 for(const [x,z] of [[.7,.6],[-.7,.6],[-.7,-.6],[.7,-.6]])K.box(.04,1,.04,M.yellow,x,top+.6,cz+z,g);for(const z of [-.6,.6])K.box(1.44,.04,.04,M.yellow,0,top+1.08,cz+z,g);for(const x of [-.7,.7])K.box(.04,.04,1.24,M.yellow,x,top+1.08,cz,g);
 // Pump skid at the foot: base, pump and motor on their pedestals, suction from the bottom nozzle, discharge riser up the shell, valves.
 K.box(1,.1,.5,M.paintDark,.3,.05,1.2,g);K.box(.3,.25,.3,M.paintDark,.1,.22,1.2,g);K.cyl(.16,.3,M.blue,.1,.4,1.2,g,'x',16);K.cyl(.09,.2,M.blue,.1,.62,1.2,g,'y',12);K.box(.4,.17,.3,M.paintDark,.6,.185,1.2,g);motor(K,g,.13,.5,.6,.4,1.2,'-x');
 K.pipe([[-1.25,.6,.45],[-1.4,.6,.5],[-1.4,.4,1.2],[-.1,.4,1.2]],.06,M.steel,g);K.pipe([[.1,.72,1.2],[.1,1.2,1.2],[.1,1.2,cz+R+.08],[.1,2.5,cz+R+.08],[.1,2.6,cz+R-.05]],.05,M.steel,g);K.cyl(.09,.06,M.red,.1,1.6,cz+R+.08,g,'x',10);K.cyl(.09,.06,M.red,-1.4,.5,.85,g,'y',10);
 plates(K,g,item,.9,0,1.9,cz+R+.01);
 moving.push(t=>flt.position.y=1.6+.9*Math.sin(t*.1));
 return {group:g,height:top+1.1,update:(t,clock=t)=>moving.forEach(f=>f(t,clock))};
}
