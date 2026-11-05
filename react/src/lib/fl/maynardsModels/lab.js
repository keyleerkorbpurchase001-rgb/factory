// Laboratory / biotech equipment of the Maynards cell & gene therapy sales, as detailed low-poly models: lab benches
// carrying the analytical instruments (flow cytometers, HPLC stacks, microscopes, plate readers and PCR cyclers,
// balances, generic analyzers), stirred-tank bioreactors and wave rockers, CO2 and shaker incubators, -80 °C
// freezers and cryo dewars, biosafety cabinets and centrifuges. Each builder: (K, item) → {group, height,
// update(t, clock)}; the group's origin is the centre of the item's footprint on the floor, +x along the row, +z the
// front; everything stays inside item.w × item.d and rises to about item.h. Materials come from K.M or are made
// once per call with K.mat; the only DOM use is K.plate's canvas.
const WHITE=0xeeeeea;
const grp=(K,parent,x=0,y=0,z=0)=>{const g=new K.THREE.Group();g.position.set(x,y,z);parent.add(g);return g};
// Per-call lab palette: white lab finish, the blue-grey glow of a screen, status LEDs and the soft lamp of a work zone.
const palette=K=>({white:K.mat(WHITE,.1,.5),cream:K.mat(0xdcdbd4,.1,.6),glow:K.mat(0x16191b,.2,.4,{emissive:0x5a87b0,emissiveIntensity:.6}),
 led:K.mat(0x3fa66b,.1,.4,{emissive:0x3fa66b,emissiveIntensity:1}),ledR:K.mat(0xd2453b,.1,.4,{emissive:0xd2453b,emissiveIntensity:.8}),lamp:K.mat(0xf4f6ff,0,.4,{emissive:0xdfe8ff,emissiveIntensity:.7}),
 rubber:K.mat(0x26292c,.1,.8),blue:K.mat(0x2c4f8a,.15,.5),teal:K.mat(0x2f7f86,.15,.5),orange:K.mat(0xd9824a,.15,.5),liquid:K.mat(0xc9a44a,.1,.2,{transparent:true,opacity:.6}),
 pink:K.mat(0xe3a1b8,.1,.3,{transparent:true,opacity:.7}),grey:K.mat(0x8e9aa0,.4,.5)});
// Operator screen: dark bezel with a glowing face; LED: a small emissive button (its material is pulsed by update).
const screen=(K,P,parent,w,h,x,y,z,rotY=0)=>{const g=grp(K,parent,x,y,z);g.rotation.y=rotY;K.box(w,h,.03,K.M.black,0,0,0,g);K.box(w-.03,h-.03,.004,P.glow,0,0,.017,g);return g};
const led=(K,m,parent,x,y,z,axis='z',r=.01)=>K.cyl(r,.012,m,x,y,z,parent,axis,10);
// A monitor on a pole-and-arm stand, screen facing +z (turned by rotY), with its keyboard in front.
const monitor=(K,P,parent,x,y,z,rotY=0,wide=.42)=>{const g=grp(K,parent,x,y,z);g.rotation.y=rotY;K.cyl(.1,.015,K.M.dark,0,.008,0,g);K.cyl(.015,.3,K.M.steel,0,.16,0,g);K.box(.03,.03,.1,K.M.dark,0,.3,-.04,g);
 const s=screen(K,P,g,wide,wide*.6,0,.3+wide*.3,-.09);s.rotation.x=-.12;K.box(.3,.015,.1,K.M.dark,0,.008,.16,g);K.box(.28,.005,.08,K.M.black,0,.018,.16,g);return g};
// Four levelling feet or castors under a cabinet of w × d.
const feet=(K,parent,w,d,h=.06,castor=false)=>{for(const sx of [-1,1])for(const sz of [-1,1]){if(castor){K.box(.05,.03,.07,K.M.steel,sx*(w/2-.1),h-.015,sz*(d/2-.1),parent);K.cyl(.035,.03,K.M.black,sx*(w/2-.1),.035,sz*(d/2-.1),parent,'x',12)}else K.cyl(.025,h,K.M.steel,sx*(w/2-.08),h/2,sz*(d/2-.08),parent,'y',10)}};
// Hinged door handle: a bar on two brackets.
const handle=(K,parent,len,x,y,z,vertical=true,m=K.M.steel)=>{if(vertical){K.cyl(.012,len,m,x,y,z,parent,'y',10);for(const s of [-1,1])K.box(.024,.024,.04,m,x,y+s*(len/2-.03),z-.02,parent)}else{K.cyl(.012,len,m,x,y,z,parent,'x',10);for(const s of [-1,1])K.box(.024,.024,.04,m,x+s*(len/2-.03),y,z-.02,parent)}};
const text=item=>`${item.type||''} ${item.name||''} ${item.make||''} ${item.model||''}`;
const label=item=>[item.make,item.model].filter(Boolean).join(' ')||item.type||item.name||'';
const pulse=(mats,base=.35,amp=.65,rate=2.2)=>(t,clock)=>{const v=base+amp*(.5+.5*Math.sin(clock*rate));for(const m of mats)m.emissiveIntensity=v};

// Lab bench (steel frame, white worktop, drawer unit) carrying an instrument picked by keyword from the lot's type and
// title, a monitor beside it, the make / model on the apron.
export function buildBench(K,item){
 const T=K.THREE,M=K.M,P=palette(K),g=new T.Group(),w=item.w,d=item.d,top=.87,s=text(item),anim=[],leds=[];
 for(const sx of [-1,1])for(const sz of [-1,1])K.box(.05,top-.04,.05,M.steel,sx*(w/2-.08),(top-.04)/2,sz*(d/2-.08),g);
 K.box(w-.1,.05,.05,M.steel,0,.12,-d/2+.08,g);K.box(w-.1,.05,.05,M.steel,0,.12,d/2-.08,g);K.box(w-.25,.02,d-.3,M.grating,0,.14,0,g);
 K.box(w,.04,d,P.white,0,top-.02,0,g);K.box(w,.03,.02,M.dark,0,top-.03,d/2-.01,g);
 const du=grp(K,g,-w/2+.38,0,0);K.box(.7,.56,d-.26,P.cream,0,top-.33,-.02,du);for(let i=0;i<3;i++){K.box(.66,.16,.02,P.white,0,top-.14-i*.18,d/2-.13,du);handle(K,du,.24,0,top-.14-i*.18,d/2-.1,false,M.dark)}
 K.plate(g,label(item),.6,.09,.1,top-.1,d/2+.002);leds.push(led(K,P.led,g,w/2-.2,top-.1,d/2-.003));
 const ix=-.15,iz=-.05;let h=top+.6;
 if(/cytomet|facs|sorter|cytoflex|attune|canto|fortessa|aria|verse|lyric|symphony/i.test(s)){
  // Flow cytometer: a boxy optics bench with the sample injection port and tube holder on the front, a loader door.
  const ih=.5;K.box(.6,ih,.55,P.white,ix,top+ih/2,iz,g);K.box(.6,.06,.55,P.teal,ix,top+ih-.03,iz,g);K.box(.2,.14,.02,M.dark,ix-.14,top+.26,iz+.28,g);
  K.cyl(.035,.06,M.steel,ix+.12,top+.12,iz+.29,g,'z',14);K.cyl(.012,.09,P.pink,ix+.12,top+.07,iz+.3,g);K.box(.22,.1,.12,P.grey,ix+.12,top+ih+.05,iz+.15,g);
  for(let i=0;i<4;i++)K.cyl(.01,.07,P.glow,ix+.03+i*.06,top+ih+.13,iz+.15,g,'y',8);screen(K,P,g,.16,.1,ix+.17,top+.33,iz+.29);
  K.box(.18,.4,.3,P.white,ix-.43,top+.2,iz,g);K.cyl(.05,.25,M.glass,ix-.43,top+.52,iz+.05,g,'y',14);K.cyl(.05,.25,M.glass,ix-.43,top+.52,iz-.1,g,'y',14);
  leds.push(led(K,P.led,g,ix+.26,top+.42,iz+.29));K.pipe([[ix-.34,top+.3,iz+.1],[ix-.3,top+.15,iz+.2],[ix-.3,top+.05,iz+.27]],.008,P.rubber,g);h=top+ih+.15;
 }else if(/hplc|uplc|chromatograph|acquity|agilent 1[12]|shimadzu|nexera|dionex|äkta|akta|prominence/i.test(s)){
  // HPLC / UPLC stack: pump, autosampler, column oven and detector modules stacked, solvent bottles on the top tray.
  const mw=.44,mh=.14,md=.52;for(let k=0;k<4;k++){const y=top+mh/2+k*(mh+.01);K.box(mw,mh,md,P.white,ix,y,iz,g);K.box(mw-.04,mh-.03,.01,P.cream,ix,y,iz+md/2+.005,g);
   leds.push(led(K,P.led,g,ix-mw/2+.05,y+.04,iz+md/2+.012));if(k===1){K.box(.2,.08,.01,M.dark,ix+.05,y,iz+md/2+.012,g);K.box(.18,.06,.004,P.glow,ix+.05,y,iz+md/2+.02,g)}
   if(k===0)for(let i=0;i<3;i++)K.cyl(.012,.03,M.steel,ix-.12+i*.12,y-.02,iz+md/2+.02,g,'z',10)}
  const ty=top+4*(mh+.01)+.02;K.box(mw,.03,md,P.grey,ix,ty,iz,g);for(let i=0;i<4;i++){const bx=ix-.15+i*.1;K.cyl(.045,.16,M.glass,bx,ty+.095,iz,g,'y',14);K.cyl(.035,.08,i<2?P.liquid:M.glass,bx,ty+.055,iz,g,'y',14);K.cyl(.02,.03,P.blue,bx,ty+.19,iz,g,'y',10);
   K.pipe([[bx,ty+.2,iz],[bx,ty+.23,iz+.14],[ix+mw/2-.05,ty-.05,iz+.27],[ix+mw/2-.05,top+mh/2,iz+md/2]],.004,P.rubber,g)}h=ty+.23;
 }else if(/microscop|imager|incucyte|celldiscoverer|evos|axio|eclipse|leica|olympus|zeiss|nikon|confocal/i.test(s)){
  // Microscope: base with the focus knobs, column, stage with specimen clips, nosepiece with objectives, binocular head.
  const bx=ix+.1;K.box(.3,.07,.42,M.dark,bx,top+.035,iz,g);K.box(.12,.42,.14,M.dark,bx,top+.28,iz-.14,g);for(const sx of [-1,1])K.cyl(.03,.02,P.grey,bx+sx*.07,top+.16,iz-.14,g,'x',16);
  K.box(.28,.015,.22,P.grey,bx,top+.22,iz+.02,g);K.box(.1,.01,.1,M.glass,bx,top+.23,iz+.02,g);K.cyl(.02,.03,P.lamp,bx,top+.12,iz+.02,g,'y',12);
  K.box(.08,.06,.26,M.dark,bx,top+.46,iz,g);K.cyl(.05,.03,M.dark,bx,top+.4,iz+.05,g,'y',16);for(let i=0;i<4;i++){const a=i/4*Math.PI*2;K.cyl(.012,.05,P.grey,bx+.035*Math.cos(a),top+.36,iz+.05+.035*Math.sin(a),g,'y',8)}
  const head=grp(K,g,bx,top+.5,iz+.1);head.rotation.x=.5;for(const sx of [-1,1]){K.cyl(.02,.12,M.dark,sx*.03,.06,0,head,'y',12);K.cyl(.025,.015,M.black,sx*.03,.125,0,head,'y',12)}
  K.box(.09,.06,.08,M.dark,0,-.01,0,head);K.box(.12,.1,.12,M.dark,bx,top+.46,iz-.2,g);K.box(.26,.16,.34,P.white,bx-.42,top+.08,iz,g);leds.push(led(K,P.led,g,bx-.5,top+.1,iz+.175));
  K.pipe([[bx-.3,top+.1,iz-.1],[bx-.12,top+.1,iz-.25],[bx,top+.3,iz-.21]],.006,P.rubber,g);h=top+.72;
 }else if(/plate reader|microplate|pcr|thermocycler|cycler|quantstudio|lightcycler|luminomet|spectro|envision|spark|synergy|clariostar|absorbance|nucleofector|vi-cell|counter|dropsense|osmomet/i.test(s)){
  // Plate reader / thermal cycler: a flat instrument with a heated lid propped open and the plate tray drawn out.
  const ih=.24,pcr=/pcr|cycler/i.test(s);K.box(.5,ih,.44,P.white,ix,top+ih/2,iz,g);K.box(.5,.04,.44,pcr?P.orange:P.blue,ix,top+.02,iz,g);
  const lid=grp(K,g,ix,top+ih,iz-.2);lid.rotation.x=-.9;K.box(.46,.05,.3,P.white,0,.025,.15,lid);K.box(.3,.02,.2,M.steel,0,.055,.15,lid);
  K.box(.3,.1,.22,M.dark,ix,top+ih-.05,iz-.05,g);for(let i=0;i<6;i++)for(let k=0;k<4;k++)K.cyl(.012,.02,P.white,ix-.1+i*.04,top+ih+.005,iz-.11+k*.04,g,'y',8);
  if(!pcr){K.box(.26,.04,.24,M.dark,ix-.12,top+.1,iz+.3,g);K.box(.24,.02,.16,P.grey,ix-.12,top+.13,iz+.3,g)}
  const sc=screen(K,P,g,.18,.11,ix+.12,top+.14,iz+.225);sc.rotation.x=-.3;leds.push(led(K,P.led,g,ix+.22,top+.06,iz+.225));for(let i=0;i<3;i++)K.cyl(.012,.01,M.dark,ix+.06+i*.04,top+.06,iz+.225,g,'z',8);h=top+.5;
 }else if(/balance|scale|weigh|mettler|sartorius/i.test(s)){
  // Analytical balance: base, glass draft shield with sliding doors, weighing pan, display at the front.
  K.box(.24,.08,.36,P.white,ix,top+.04,iz,g);K.box(.24,.03,.34,M.dark,ix,top+.095,iz-.02,g);K.cyl(.05,.006,M.steel,ix,top+.13,iz-.03,g,'y',20);
  K.box(.24,.26,.28,M.glass,ix,top+.24,iz-.03,g).castShadow=false;for(const sx of [-1,1])K.box(.012,.26,.012,M.steel,ix+sx*.115,top+.24,iz+.1,g);K.box(.24,.012,.28,M.steel,ix,top+.37,iz-.03,g);
  K.cyl(.01,.08,M.steel,ix+.12,top+.3,iz+.1,g,'z',8);screen(K,P,g,.16,.05,ix,top+.05,iz+.185);leds.push(led(K,P.led,g,ix+.09,top+.02,iz+.185));
  K.box(.08,.05,.04,P.grey,ix-.3,top+.025,iz,g);K.cyl(.025,.1,M.glass,ix-.3,top+.1,iz,g,'y',12);K.cyl(.02,.12,M.glass,ix+.24,top+.07,iz+.1,g,'y',12);h=top+.4;
 }else{
  // Generic analyzer: a cabinet instrument with a reagent door, keypad and status strip.
  const ih=.55;K.box(.55,ih,.52,P.white,ix,top+ih/2,iz,g);K.box(.55,.05,.52,P.teal,ix,top+ih-.025,iz,g);K.box(.3,.3,.015,P.cream,ix-.08,top+.2,iz+.265,g);handle(K,g,.1,ix+.03,top+.2,iz+.28,true,M.dark);
  screen(K,P,g,.18,.12,ix+.16,top+.42,iz+.265);for(let i=0;i<3;i++)for(let k=0;k<2;k++)K.box(.025,.015,.01,M.dark,ix+.1+i*.04,top+.3-k*.03,iz+.27,g);leds.push(led(K,P.led,g,ix-.2,top+.48,iz+.265));
  K.box(.14,.1,.3,P.grey,ix,top+ih+.05,iz-.05,g);K.pipe([[ix+.28,top+.3,iz-.15],[ix+.4,top+.5,iz-.3],[ix+.07,top+.6,iz-.1]],.006,P.rubber,g);h=top+ih+.1;
 }
 const mon=monitor(K,P,g,w/2-.3,top,iz-.1,-.3);h=Math.max(h,top+.3+.42*.6);anim.push(pulse(leds.map(m=>m.material).filter((m,i,a)=>a.indexOf(m)===i),.45,.55,2.4));
 K.pipe([[w/2-.3,top,iz-.3],[w/2-.2,top-.05,-d/2+.05],[w/2-.2,.2,-d/2+.05]],.006,P.rubber,g);
 return {group:g,height:h,update:(t,clock=t)=>anim.forEach(f=>f(t,clock))};
}

// Stirred-tank bioreactor: a jacketed stainless vessel on a skid with its head plate, agitator motor, ports, exhaust
// filter, sight glass and sample valve, hoses to the control cabinet with its screen; a rocking wave-bag platform when
// the lot is a wave / rocker system.
export function buildBioreactor(K,item){
 const T=K.THREE,M=K.M,P=palette(K),g=new T.Group(),w=item.w,d=item.d,s=text(item),anim=[],leds=[];let h;
 if(/wave|rocker|rocking|xuri|biostat rm|readytoprocess/i.test(s)){
  // Wave rocker: base unit with the drive, a rocking heated tray carrying the translucent cell bag, gas / control tower.
  const bw=1.1,bd=.9;K.box(bw,.45,bd,P.white,-.15,.3,0,g);K.box(bw,.1,bd,M.dark,-.15,.12,0,g);feet(K,g,bw,bd,.07,true);K.box(.5,.2,.02,P.cream,-.15,.33,bd/2+.01,g);
  screen(K,P,g,.2,.12,-.3,.33,bd/2+.025);for(let i=0;i<3;i++)K.cyl(.015,.02,M.dark,-.05+i*.06,.3,bd/2+.03,g,'z',10);leds.push(led(K,P.led,g,.1,.38,bd/2+.03));
  for(const sx of [-1,1])K.box(.08,.14,.3,M.steel,-.15+sx*.35,.6,0,g);const tray=grp(K,g,-.15,.66,0);K.cyl(.025,.9,M.steel,0,0,0,tray,'x',12);
  K.box(1,.03,.75,P.grey,0,.02,0,tray);K.box(1,.05,.02,P.grey,0,.05,-.37,tray);K.box(1,.05,.02,P.grey,0,.05,.37,tray);const bag=K.box(.86,.18,.6,P.pink,0,.13,0,tray);bag.castShadow=false;
  K.box(.84,.08,.58,P.liquid,0,.08,0,tray).castShadow=false;for(const sx of [-1,1])K.box(.06,.05,.6,P.grey,sx*.45,.07,0,tray);for(let i=0;i<3;i++)K.cyl(.015,.06,P.blue,-.3+i*.3,.25,.2,tray,'y',8);
  K.pipe([[.3,.26,.2],[.5,.4,.3],[.65,.3,.3],[.66,.5,.1]],.008,P.rubber,tray);K.pipe([[0,.27,.2],[-.2,.32,.3],[-.1,.26,.42],[.3,.25,.42]],.008,P.rubber,tray);
  const tower=grp(K,g,w/2-.22,0,-.1);K.box(.36,1.5,.4,P.white,0,.8,0,tower);K.box(.3,.06,.3,M.dark,0,.03,0,tower);screen(K,P,tower,.26,.18,0,1.2,.21);leds.push(led(K,P.led,tower,-.1,1.4,.21),led(K,P.ledR,tower,-.04,1.4,.21));
  for(let i=0;i<4;i++){K.cyl(.02,.06,M.steel,-.1+i*.07,.8,.21,tower,'z',10);K.cyl(.018,.01,P.glow,-.1+i*.07,.8,.245,tower,'z',10)}K.cyl(.012,.6,M.steel,0,1.85,0,tower);K.box(.3,.02,.3,P.grey,0,2.15,0,tower);
  K.pipe([[-.45,.93,.2],[-.3,1.15,.35],[.2,1.25,.3],[.45,1.3,.1]],.008,P.rubber,g);
  anim.push((t,clock)=>{tray.rotation.x=.14*Math.sin(clock*1.6)});h=2.17;
 }else{
  // Skid with castors and a toe plate; the vessel on four struts; head plate with its bolt ring and ports.
  const sw=w-.2,sd=d-.2,vx=-.2,vz=.05,r=Math.min(.36,sd*.24),y0=.55,vh=1.05;K.box(sw,.08,sd,M.steel,0,.14,0,g);K.box(sw-.1,.06,sd-.1,M.dark,0,.07,0,g);feet(K,g,sw,sd,.1,true);
  for(const a of [0,1,2,3]){const an=a*Math.PI/2+Math.PI/4;K.cyl(.025,y0-.08,M.steel,vx+(r+.03)*Math.cos(an),.18+(y0-.08)/2,vz+(r+.03)*Math.sin(an),g,'y',10)}
  K.cyl(r,vh,M.steel,vx,y0+vh/2,vz,g,'y',32);K.cyl(r+.03,.5,P.grey,vx,y0+vh*.5,vz,g,'y',32);const dish=K.sphere(r,M.steel,vx,y0,vz,g,24);dish.scale.y=.35;K.cyl(.03,.2,M.steel,vx,y0-.2,vz,g,'y',10);K.cyl(.045,.06,P.blue,vx,y0-.23,vz,g,'y',12);
  K.cyl(r+.06,.05,M.steel,vx,y0+vh+.025,vz,g,'y',32);for(let i=0;i<12;i++){const an=i/12*Math.PI*2;K.cyl(.012,.02,M.dark,vx+(r+.045)*Math.cos(an),y0+vh+.06,vz+(r+.045)*Math.sin(an),g,'y',8)}
  K.cyl(.05,.08,M.glass,vx+r,y0+.6,vz,g,'x',14);K.torus(.055,.01,M.steel,vx+r+.03,y0+.6,vz,g,'x',16);K.box(.04,.03,.04,M.steel,vx+r+.02,y0+.3,vz+.1,g);K.cyl(.012,.1,M.steel,vx+r+.07,y0+.3,vz+.1,g,'x',8);K.cyl(.02,.03,P.orange,vx+r+.12,y0+.3,vz+.1,g,'x',10);
  // Ports, exhaust filter and the agitator: motor on a bridge, the coupling turns in update.
  const py=y0+vh+.05,ports=[[.15,0,.1],[-.14,.1,.05],[0,-.16,.08],[.12,-.12,.06],[-.1,-.1,.06]];for(const [px,pz,ph] of ports){K.cyl(.02,ph+.04,M.steel,vx+px,py+(ph+.04)/2,vz+pz,g,'y',10);K.cyl(.028,.015,M.steel,vx+px,py+ph+.04,vz+pz,g,'y',10)}
  K.cyl(.045,.16,P.white,vx-.14,py+.22,vz+.05,g,'y',14);K.cyl(.012,.06,M.steel,vx-.14,py+.33,vz+.05,g,'y',8);K.box(.3,.04,.1,M.steel,vx,py+.08,vz-.02,g);const mot=grp(K,g,vx,py+.1,vz-.02);
  K.cyl(.03,.1,M.steel,0,.05,0,mot,'y',12);K.cyl(.11,.3,P.blue,0,.28,0,mot,'y',20);K.cyl(.08,.06,M.dark,0,.46,0,mot,'y',16);K.box(.14,.1,.1,M.dark,0,.3,.14,mot);const cp=grp(K,mot,0,.1,0);K.box(.1,.02,.02,P.orange,0,0,0,cp);
  anim.push((t,clock)=>{cp.rotation.y=clock*5});h=py+.6;
  // Control cabinet with screen, buttons, hoses and tubing from the ports, a gas rack and the harvest hose.
  const cx=w/2-.27,cz=d/2-.3;K.box(.46,1.2,.42,P.white,cx,.78,cz,g);K.box(.46,.05,.42,P.teal,cx,1.4,cz,g);screen(K,P,g,.3,.2,cx,1.1,cz+.215);for(let i=0;i<4;i++)K.cyl(.015,.02,i===3?P.ledR:M.dark,cx-.12+i*.08,.85,cz+.22,g,'z',10);
  leds.push(led(K,P.led,g,cx-.15,1.3,cz+.22));for(let i=0;i<3;i++){K.cyl(.025,.05,M.steel,cx-.12+i*.1,.6,cz+.22,g,'z',12);K.cyl(.02,.01,P.glow,cx-.12+i*.1,.6,cz+.25,g,'z',12)}handle(K,g,.3,cx+.18,.5,cz+.22,true,M.dark);
  K.plate(g,label(item),.36,.07,cx,1.25,cz+.216);for(const [px,pz,ph] of [ports[0],ports[3]])K.pipe([[vx+px,py+ph+.04,vz+pz],[vx+px+.1,py+.3,vz+pz+.2],[cx-.1,1.2,cz-.22],[cx-.1,.9,cz-.22]],.009,P.rubber,g);
  K.pipe([[vx+r+.12,y0+.3,vz+.1],[vx+r+.3,y0+.1,vz+.2],[cx-.25,.3,cz]],.01,P.rubber,g);K.pipe([[vx,y0-.26,vz],[vx+.1,.3,vz+.3],[vx+.1,.19,d/2-.2]],.012,P.rubber,g);
  const gx=-w/2+.22,gz=-d/2+.25;K.box(.4,.9,.12,P.grey,gx,.63,gz,g);for(let i=0;i<4;i++){K.cyl(.025,.06,M.steel,gx-.15+i*.1,1.1,gz+.08,g,'z',12);K.cyl(.012,.3,M.steel,gx-.15+i*.1,.95,gz+.08,g,'y',8)}
  K.pipe([[gx,1.1,gz+.1],[gx+.2,1.3,gz+.2],[vx-.1,py+.1,vz-.1]],.007,P.rubber,g);
 }
 anim.push(pulse(leds.map(m=>m.material).filter((m,i,a)=>a.indexOf(m)===i),.4,.6,2));
 return {group:g,height:h,update:(t,clock=t)=>anim.forEach(f=>f(t,clock))};
}

// Incubator: an upright CO2 incubator (white cabinet on feet, outer door slightly open on the inner glass door and the
// shelves, control panel with screen, CO2 inlet) or, for shaker lots, two stacked shaking incubators with platforms
// of Erlenmeyer flasks that sway.
export function buildIncubator(K,item){
 const T=K.THREE,M=K.M,P=palette(K),g=new T.Group(),w=item.w,d=item.d,s=text(item),anim=[],leds=[];let h;
 if(/shaker|shaking|orbital|multitron|innova|kuhner/i.test(s)){
  const bw=w-.12,bd=d-.12,tiers=[0,.77];for(const y of tiers){const b=grp(K,g,0,y,0);K.box(bw,.46,bd,P.white,0,.3,0,b);K.box(bw,.05,bd,P.teal,0,.55,0,b);if(y===0)feet(K,g,bw,bd,.07);else for(const sx of [-1,1])for(const sz of [-1,1])K.box(.06,.07,.06,M.dark,sx*(bw/2-.08),.035,sz*(bd/2-.08),b);
   K.box(.4,.14,.015,M.black,-.1,.38,bd/2+.005,b);screen(K,P,b,.16,.08,-.18,.38,bd/2+.02);for(let i=0;i<3;i++)K.cyl(.012,.02,M.dark,.02+i*.05,.36,bd/2+.02,b,'z',10);leds.push(led(K,P.led,b,.17,.42,bd/2+.02));
   K.box(bw-.1,.2,bd-.1,M.glass,0,.67,0,b).castShadow=false;const pl=grp(K,b,0,.57,0);K.box(bw-.2,.02,bd-.2,M.steel,0,0,0,pl);
   for(let i=0;i<3;i++)for(let k=0;k<2;k++){const fx=-.22+i*.22,fz=-.15+k*.3,fl=grp(K,pl,fx,.01,fz);K.cyl(.03,.17,M.glass,0,.085,0,fl,'y',12,.075);K.cyl(.06,.05,P.liquid,0,.03,0,fl,'y',12,.07);K.cyl(.032,.02,P.orange,0,.18,0,fl,'y',10);K.box(.14,.012,.14,M.dark,0,0,0,fl)}
   anim.push((t,clock)=>{pl.position.x=.015*Math.sin(clock*8+y);pl.position.z=.015*Math.cos(clock*8+y)})}
  K.plate(g,label(item),.4,.07,.05,.18,bd/2+.01);h=.77+.8;
 }else{
  // Cabinet in a sub-group set back so the ajar door and its handle stay inside the footprint: back, sides, plinth and
  // head leave the chamber open at the front, with its steel liner and shelves behind the gasketed inner glass door.
  const bw=w-.1,bd=d-.14,bh=item.h-.2,c=grp(K,g,0,0,-.07),yc=.1+(bh-.1)/2,dy=.1+(bh-.48)/2,dh=bh-.52,dw=bw-.06,sh=dh/4.5,gz=bd/2-.03;feet(K,c,bw,bd,.1);
  K.box(bw,bh-.1,.06,P.white,0,yc,-bd/2+.03,c);for(const sx of [-1,1])K.box(.06,bh-.1,bd,P.white,sx*(bw/2-.03),yc,0,c);K.box(bw,.1,bd,P.white,0,.15,0,c);K.box(bw,.4,bd,P.white,0,bh-.2,0,c);K.box(bw-.04,.04,bd-.04,M.dark,0,bh+.01,0,c);
  K.box(bw-.12,bh-.6,.01,M.steel,0,(bh-.2)/2,-bd/2+.065,c);K.box(bw-.12,.02,bd-.1,M.steel,0,.21,-.02,c);for(let i=0;i<4;i++){const y=.3+i*sh;K.box(dw-.14,.01,bd-.2,M.steel,0,y,-.04,c);K.box(dw-.14,.03,.012,M.steel,0,y+.01,-.04+(bd-.2)/2,c)}
  K.box(.3,.06,.2,P.grey,.1,.335,-.1,c);K.cyl(.045,.08,P.liquid,-.15,.3+sh+.045,-.1,c,'y',12);for(const k of [-1,1]){K.box(dw-.02,.04,.015,M.dark,0,dy+k*(dh/2-.03),gz,c);K.box(.04,dh-.02,.015,M.dark,k*(dw/2-.03),dy,gz,c)}K.box(dw-.1,dh-.1,.008,M.glass,0,dy,gz,c).castShadow=false;
  // Outer door on a hinge at the left, ajar, with its handle, hinges and labels.
  const door=grp(K,c,-dw/2,dy,bd/2);door.rotation.y=-.1;K.box(dw,dh,.045,P.white,dw/2,0,.0225,door);K.box(dw-.06,dh-.06,.005,P.cream,dw/2,0,.047,door);handle(K,door,.5,dw-.08,0,.06);
  for(const hy of [-dh/2+.1,0,dh/2-.1])K.box(.03,.08,.05,M.steel,.015,hy,.02,door);K.plate(door,'CO2 INCUBATOR',.3,.05,dw/2,dh/2-.08,.052);K.plate(door,'BIOHAZARD',.14,.05,dw/2-.2,-dh/2+.1,.052,'#e3b82e','#1c1b18');
  // Control panel above the door, CO2 inlet and the sampling port at the back, the make / model plate.
  const py=bh-.2;K.box(dw,.3,.01,M.black,0,py,bd/2+.005,c);screen(K,P,c,.22,.14,-.15,py,bd/2+.02);for(let i=0;i<4;i++)K.cyl(.012,.02,M.dark,.1+i*.05,py-.06,bd/2+.02,c,'z',10);
  leds.push(led(K,P.led,c,.1,py+.08,bd/2+.02));led(K,P.ledR,c,.16,py+.08,bd/2+.02);K.plate(c,label(item),.3,.06,.15,py+.08,bd/2+.016);
  K.cyl(.015,.2,M.steel,.2,bh+.1,-bd/2+.1,c);K.cyl(.03,.04,M.steel,.2,bh+.22,-bd/2+.1,c,'y',10);K.pipe([[.2,bh+.24,-bd/2+.1],[.3,bh+.2,-bd/2+.002],[.3,.6,-bd/2+.002]],.006,P.rubber,c);
  K.cyl(.02,.06,M.steel,-.2,bh+.04,-bd/2+.1,c,'y',10);K.cyl(.01,.1,M.steel,bw/2+.005,.6,0,c,'x',8);h=bh+.26;
 }
 anim.push(pulse(leds.map(m=>m.material).filter((m,i,a)=>a.indexOf(m)===i),.4,.6,1.8));
 return {group:g,height:h,update:(t,clock=t)=>anim.forEach(f=>f(t,clock))};
}

// Freezer: an upright -80 °C freezer (tall white cabinet on castors, big door handle, control panel, compressor grille
// at the bottom, warning labels) or a cryo / liquid-nitrogen dewar (stainless drum with its lid, level monitor, hoses
// and a wheeled base) for cryo lots.
export function buildFreezer(K,item){
 const T=K.THREE,M=K.M,P=palette(K),g=new T.Group(),w=item.w,d=item.d,s=text(item),anim=[],leds=[];let h;
 if(/cryo|nitrogen|dewar|-150|-190|ln2|cryogenic|biobank|cryostor/i.test(s)){
  const r=Math.min(.42,w*.4,d*.4),y0=.14,dh=1.15;K.box(w-.2,.06,d-.2,M.dark,0,.11,0,g);feet(K,g,w-.2,d-.2,.08,true);for(const px of [-w/2+.12,-w/2+.12+w*.6])K.box(.08,.9,.06,M.steel,px,.6,d/2-.1,g);K.cyl(.015,w*.6,M.steel,-w/2+.12+w*.3,1.05,d/2-.1,g,'x',10);
  K.cyl(r,dh,M.steel,0,y0+dh/2,0,g,'y',32);K.cyl(r+.02,.06,P.grey,0,y0+.1,0,g,'y',32);K.cyl(r+.02,.06,P.grey,0,y0+dh-.1,0,g,'y',32);K.cyl(r-.1,.08,M.steel,0,y0+dh+.04,0,g,'y',24);
  const lid=K.cyl(r*.75,.09,P.white,0,y0+dh+.125,0,g,'y',28);K.torus(r*.6,.012,M.steel,0,y0+dh+.18,0,g,'y',24);K.box(.1,.03,.04,M.dark,0,y0+dh+.19,0,g);
  K.plate(g,'LIQUID NITROGEN',.3,.045,0,y0+dh*.75,r+.005);K.plate(g,label(item),.3,.05,0,y0+dh*.6,r+.005);K.plate(g,'CRYOGENIC',.2,.06,0,y0+.35,r+.005,'#e3b82e','#1c1b18');
  const cx=w/2-.1,cz=-d/2+.14;K.box(.16,.9,.16,P.white,cx,.6,cz,g);screen(K,P,g,.13,.09,cx,.9,cz+.09);leds.push(led(K,P.led,g,cx-.04,.78,cz+.09));led(K,P.ledR,g,cx+.03,.78,cz+.09);for(let i=0;i<2;i++)K.cyl(.012,.02,M.dark,cx-.03+i*.06,.7,cz+.09,g,'z',10);
  K.cyl(.025,.1,M.steel,r*.5,y0+dh+.17,.1,g,'y',10);K.pipe([[r*.5,y0+dh+.22,.1],[r*.9,y0+dh+.26,0],[cx,1.1,cz+.03],[cx,1.05,cz]],.012,P.rubber,g);K.pipe([[-r*.4,y0+dh+.17,.1],[-r*.7,y0+dh+.25,.3],[-r*.6,.3,d/2-.08]],.01,P.rubber,g);
  K.cyl(.05,.3,P.grey,-r*.6,.26,d/2-.08,g,'y',14);K.cyl(.035,.03,M.steel,-r*.6,.42,d/2-.08,g,'y',10);h=y0+dh+.25;
 }else{
  // Cabinet in a sub-group set back so the door handle stays inside the footprint.
  const bw=w-.1,bd=d-.12,bh=item.h-.1,c=grp(K,g,0,0,-.04);feet(K,c,bw,bd,.08,true);K.box(bw,bh-.08,bd,P.white,0,.08+(bh-.08)/2,0,c);K.box(bw-.04,.04,bd-.04,M.dark,0,bh+.01,0,c);
  // Compressor grille, door with its hinges, big handle and lock, control panel with display and alarm LED.
  K.box(bw-.08,.24,.02,M.dark,0,.25,bd/2+.005,c);for(let i=0;i<7;i++)K.box(bw-.14,.012,.015,P.grey,0,.16+i*.03,bd/2+.015,c);K.box(bw-.1,.012,.012,P.grey,0,.09,bd/2+.01,c);
  const dy=.42+(bh-.85)/2,dh=bh-.85,dw=bw-.04;K.box(dw,dh,.04,P.white,0,dy,bd/2+.02,c);K.box(dw-.05,dh-.05,.005,P.cream,0,dy,bd/2+.043,c);for(const hy of [-dh/2+.12,0,dh/2-.12])K.box(.03,.1,.05,M.steel,-dw/2+.02,dy+hy,bd/2+.03,c);
  const hx=dw/2-.1;K.box(.04,.7,.05,M.dark,hx,dy,bd/2+.07,c);for(const s2 of [-1,1])K.box(.05,.04,.06,M.dark,hx,dy+s2*.32,bd/2+.05,c);K.cyl(.015,.02,M.steel,hx,dy-.45,bd/2+.045,c,'z',10);K.box(.03,.03,.01,P.ledR,hx,dy+.45,bd/2+.045,c);
  K.plate(c,'-80 °C',.3,.1,-.05,dy+dh/2-.12,bd/2+.047);K.plate(c,label(item),.4,.07,-.05,dy+dh/2-.25,bd/2+.047);K.plate(c,'ULTRA LOW',.2,.05,-.05,dy-dh/2+.1,bd/2+.047,'#e3b82e','#1c1b18');K.plate(c,'BIOHAZARD',.14,.05,-dw/2+.14,dy-dh/2+.3,bd/2+.047,'#c8312a');
  const py=bh-.22;K.box(dw,.3,.015,M.black,0,py,bd/2+.008,c);screen(K,P,c,.24,.14,-.12,py,bd/2+.022);for(let i=0;i<4;i++)K.cyl(.012,.02,M.dark,.14+i*.05,py-.07,bd/2+.022,c,'z',10);leds.push(led(K,P.led,c,.15,py+.07,bd/2+.022));led(K,P.ledR,c,.22,py+.07,bd/2+.022);
  // Side: the access port with its plug, the back-up CO2 / LN2 fitting, the rear vent and power cable.
  K.cyl(.035,.03,M.steel,bw/2+.01,1.2,0,c,'x',12);K.cyl(.02,.02,M.dark,bw/2+.035,1.2,0,c,'x',10);K.box(.3,.5,.02,M.dark,0,.6,-bd/2-.005,c);for(let i=0;i<5;i++)K.box(.26,.01,.01,P.grey,0,.42+i*.09,-bd/2-.012,c);
  K.pipe([[.2,1,-bd/2-.01],[.3,.5,-bd/2-.012],[.3,.03,-bd/2-.01]],.007,P.rubber,c);K.box(.2,.14,.08,P.grey,-.2,bh+.08,-.2,c);K.cyl(.01,.16,M.steel,-.2,bh+.23,-.2,c);h=bh+.31;
 }
 anim.push(pulse(leds.map(m=>m.material).filter((m,i,a)=>a.indexOf(m)===i),.4,.6,1.5));
 return {group:g,height:h,update:(t,clock=t)=>anim.forEach(f=>f(t,clock))};
}

// Biosafety cabinet / laminar flow bench: stainless work surface on a leg frame, white side walls and back, the glass
// sash raised over the lit work zone (soft emissive back panel and lamp), the HEPA / blower housing on top with its
// control panel, a pipette rack and waste bottle in the work zone.
export function buildHood(K,item){
 const T=K.THREE,M=K.M,P=palette(K),g=new T.Group(),w=item.w,d=item.d,bw=w-.1,bd=d-.1,top=.78,wy=top+.06,wh=Math.max(1,item.h-top-.4),hy=wy+wh,hh=.34,anim=[],leds=[];
 for(const sx of [-1,1]){for(const sz of [-1,1])K.box(.05,top-.05,.05,M.steel,sx*(bw/2-.05),(top+.05)/2,sz*(bd/2-.05),g);K.box(.05,.05,bd-.1,M.steel,sx*(bw/2-.05),.12,0,g);K.box(.05,.05,bd-.1,M.steel,sx*(bw/2-.05),top-.1,0,g)}
 K.box(bw-.1,.05,.05,M.steel,0,.12,-bd/2+.05,g);feet(K,g,bw,bd,.08);K.box(bw-.2,.02,bd-.4,M.grating,0,.15,0,g);
 K.box(bw,.06,bd,M.steel,0,top+.03,0,g);K.box(bw-.1,.012,.12,M.dark,0,top+.066,bd/2-.1,g);for(let i=0;i<12;i++)K.box(.06,.014,.1,M.steel,-bw/2+.12+i*(bw-.24)/11,top+.07,bd/2-.1,g);
 for(const sx of [-1,1])K.box(.04,wh,bd,P.white,sx*(bw/2-.02),top+.06+wh/2,0,g);K.box(bw,wh,.04,P.white,0,top+.06+wh/2,-bd/2+.02,g);K.box(bw-.08,wh-.02,.012,P.lamp,0,top+.06+wh/2,-bd/2+.05,g).castShadow=false;
 for(let i=0;i<8;i++)for(let k=0;k<2;k++)K.cyl(.01,.005,M.dark,-bw/2+.2+i*(bw-.4)/7,top+.2+k*.1,-bd/2+.058,g,'z',6);K.box(bw-.1,.04,.3,M.steel,0,hy-.02,-bd/2+.2,g);K.box(bw-.3,.015,.06,P.lamp,0,hy-.0075,-bd/2+.4,g);
 // Sash: glass pane in its frame raised .22 in the front channel to .9 above the work surface, the fixed front panel
 // above it; the sash counterweight rails on the sides.
 const sy=wy+.22,sh=.66;K.box(bw-.12,sh-.04,.012,M.glass,0,sy+sh/2,bd/2-.03,g).castShadow=false;K.box(bw-.1,.04,.03,M.dark,0,sy,bd/2-.03,g);K.box(bw-.1,.04,.03,M.dark,0,sy+sh,bd/2-.03,g);K.box(bw-.1,wh-.22-sh,.02,P.white,0,sy+sh+(wh-.22-sh)/2,bd/2-.03,g);
 for(const sx of [-1,1]){K.box(.03,wh,.05,M.dark,sx*(bw/2-.05),wy+wh/2,bd/2-.03,g);K.box(.03,.03,.14,M.dark,sx*(bw/2-.05),sy,bd/2-.08,g)}K.plate(g,'KEEP SASH AT LINE',.34,.04,0,sy+.05,bd/2-.022,'#e3b82e','#1c1b18');
 // HEPA / blower housing on top with the control panel, filter bay door, exhaust stack and the lot plate.
 K.box(bw,hh,bd,P.white,0,hy+hh/2,0,g);K.box(bw-.06,hh-.08,.01,P.cream,0,hy+hh/2,bd/2+.005,g);for(const sx of [-1,1])K.cyl(.012,.04,M.steel,sx*(bw/2-.2),hy+hh/2,bd/2+.02,g,'z',8);
 screen(K,P,g,.22,.12,-bw/2+.3,hy+hh/2,bd/2+.02);for(let i=0;i<5;i++)K.cyl(.013,.02,M.dark,-bw/2+.5+i*.05,hy+hh/2-.06,bd/2+.02,g,'z',10);leds.push(led(K,P.led,g,-bw/2+.5,hy+hh/2+.08,bd/2+.02));led(K,P.ledR,g,-bw/2+.56,hy+hh/2+.08,bd/2+.02);
 K.plate(g,label(item),.5,.08,bw*.22,hy+hh/2,bd/2+.016);K.plate(g,'CLASS II',.24,.06,bw/2-.3,hy+hh/2-.1,bd/2+.016,'#2c4f8a');K.box(bw*.5,.02,bd*.6,M.dark,0,hy+hh+.01,-.05,g);for(let i=0;i<8;i++)K.box(bw*.46,.006,.02,P.grey,0,hy+hh+.02,-.05-bd*.27+i*bd*.08,g);
 K.cyl(.07,.06,M.steel,-bw/2+.3,hy+hh+.03,-bd/2+.2,g,'y',16);K.cyl(.02,.08,M.steel,bw/2-.25,hy+hh+.04,-bd/2+.15,g,'y',10);K.cyl(.035,.02,M.dark,bw/2-.25,hy+hh+.09,-bd/2+.15,g,'y',10);
 // Work zone: pipette stand, tube rack, waste bottle, a flask and a pack of plates; the gas tap on the side wall.
 K.box(.12,.02,.1,M.dark,-bw/2+.3,wy+.01,-.1,g);K.cyl(.01,.3,M.steel,-bw/2+.3,wy+.15,-.1,g);for(let i=0;i<3;i++){K.cyl(.012,.2,P.blue,-bw/2+.26+i*.04,wy+.26,-.14,g,'y',8);K.cyl(.014,.03,P.white,-bw/2+.26+i*.04,wy+.37,-.14,g,'y',8)}
 K.box(.24,.04,.1,P.white,-bw/2+.65,wy+.02,-.12,g);for(let i=0;i<6;i++)K.cyl(.012,.09,M.glass,-bw/2+.55+i*.04,wy+.07,-.12,g,'y',8);K.cyl(.07,.22,M.glass,bw/2-.3,wy+.11,-.15,g,'y',16);K.cyl(.035,.03,P.orange,bw/2-.3,wy+.235,-.15,g,'y',10);K.cyl(.05,.12,P.liquid,bw/2-.3,wy+.07,-.15,g,'y',16);
 K.cyl(.04,.1,M.glass,bw/2-.5,wy+.05,-.05,g,'y',12,.09);K.cyl(.025,.02,P.blue,bw/2-.5,wy+.11,-.05,g,'y',10);for(let k=0;k<3;k++)K.box(.13,.016,.09,P.white,-.1,wy+.01+k*.018,-.2,g);K.cyl(.012,.05,M.steel,-.4,wy+.03,-.25,g,'y',8);
 K.cyl(.012,.06,M.steel,bw/2-.04,wy+.3,-.1,g,'x',8);K.cyl(.02,.02,P.blue,bw/2-.07,wy+.3,-.1,g,'x',10);K.pipe([[bw/2-.01,wy+.3,-.1],[bw/2+.02,wy,-.2],[bw/2+.02,.2,-.2]],.005,P.rubber,g);
 anim.push(pulse(leds.map(m=>m.material),.4,.6,1.6));const lampM=P.lamp;anim.push((t,clock)=>{lampM.emissiveIntensity=.65+.05*Math.sin(clock*7)});
 return {group:g,height:hy+hh+.1,update:(t,clock=t)=>anim.forEach(f=>f(t,clock))};
}

// Centrifuge: a floor centrifuge (white body on castors, rounded lid propped open over the glass window and the rotor
// with its swing-out buckets, control panel) or a benchtop / micro centrifuge on a small cart for the benchtop lots; the
// rotor spins while the lid is up.
export function buildCentrifuge(K,item){
 const T=K.THREE,M=K.M,P=palette(K),g=new T.Group(),w=item.w,d=item.d,s=text(item),bench=/benchtop|bench-?top|micro|mini|tabletop|table-?top|5[48]\d\d|5424|allegra x-?1|megafuge/i.test(s),anim=[],leds=[];
 let bw=w-.1,bd=d-.1,y0=0,body;
 if(bench){
  // A small stainless cart carries the benchtop machine.
  const cw=w-.15,cd=d-.15;for(const sx of [-1,1])for(const sz of [-1,1])K.cyl(.02,.5,M.steel,sx*(cw/2-.04),.3,sz*(cd/2-.04),g,'y',10);K.box(cw,.03,cd,M.steel,0,.55,0,g);K.box(cw-.1,.02,cd-.1,M.steel,0,.2,0,g);feet(K,g,cw,cd,.06,true);
  K.cyl(.03,.12,M.glass,-cw/2+.1,.62,cd/2-.1,g,'y',10);K.box(.14,.1,.1,P.grey,cw/2-.12,.61,-cd/2+.06,g);bw=Math.min(.5,cw-.15);bd=Math.min(.42,cd-.1);y0=.565;
 }else feet(K,g,bw,bd,.08,true);
 body=grp(K,g,0,y0,0);const bh=bench?.3:item.h-.42,base=bench?0:.08;K.box(bw,bh-base,bd,P.white,0,base+(bh-base)/2,0,body);K.box(bw,.04,bd,P.teal,0,base+.02,0,body);
 const rt=bh,r=Math.min(bw,bd)*.34;K.cyl(r+.03,.02,M.steel,0,rt+.01,-.02,body,'y',32);K.cyl(r,.2,M.dark,0,rt-.09,-.02,body,'y',32);K.cyl(r-.02,.03,M.black,0,rt-.17,-.02,body,'y',32);
 // Rotor: hub, four swing-out buckets with tube holes, the drive nut.
 const rot=grp(K,body,0,rt-.08,-.02);K.cyl(r*.3,.03,M.steel,0,0,0,rot,'y',20);K.cyl(.015,.05,M.dark,0,.03,0,rot,'y',10);const nb=bench?6:4;for(let i=0;i<nb;i++){const a=i/nb*Math.PI*2,bx=r*.6*Math.cos(a),bz=r*.6*Math.sin(a);
  if(bench)K.cyl(.016,.05,P.grey,bx,.01,bz,rot,'y',10);else{K.box(.04,.03,.04,M.steel,bx,.01,bz,rot);const bk=K.box(r*.45,.1,r*.42,P.grey,bx,-.03,bz,rot);bk.rotation.y=-a;for(let k=0;k<2;k++)K.cyl(.012,.012,M.dark,bx+(k-.5)*.05*Math.sin(a),.025,bz+(k-.5)*.05*Math.cos(a),rot,'y',8)}}
 K.box(r*2.2,.015,.08,M.steel,0,-.04,0,rot);K.box(.08,.015,r*2.2,M.steel,0,-.04,0,rot);anim.push((t,clock)=>{rot.rotation.y=clock*9});
 // Lid: hinged at the back and propped open, its glass window, latch; the handle strip on the front.
 const lid=grp(K,body,0,rt+.02,-bd/2+.05);lid.rotation.x=-.95;const lw=bw-.06,ld=bd-.1;K.box(lw,.05,ld,P.white,0,.025,ld/2,lid);K.box(lw-.08,.012,ld-.1,P.cream,0,.055,ld/2,lid);K.cyl(r*.75,.02,M.glass,0,.06,ld/2,lid,'y',28).castShadow=false;
 K.torus(r*.75,.01,M.steel,0,.062,ld/2,lid,'y',28);K.box(lw-.1,.03,.05,M.dark,0,.03,ld-.03,lid);for(const sx of [-1,1])K.box(.05,.04,.08,M.steel,sx*(lw/2-.1),.02,.02,lid);K.cyl(.02,.02,M.steel,0,-.01,ld-.03,lid,'z',10);
 // Control panel on the front, status LEDs and knobs, feet for the balance switch, the make / model plate.
 const py=bh*.5;K.box(bw-.1,bh*.42,.012,M.black,0,py,bd/2+.006,body);screen(K,P,body,bench?.14:.22,bench?.08:.12,-bw*.16,py+bh*.05,bd/2+.02);
 for(let i=0;i<3;i++)K.cyl(bench?.012:.02,.02,M.dark,bw*.15+i*(bench?.05:.08),py+bh*.05,bd/2+.02,body,'z',12);for(let i=0;i<4;i++)K.box(.03,.015,.01,P.grey,-bw*.3+i*.05,py-bh*.12,bd/2+.02,body);
 leds.push(led(K,P.led,body,bw*.3,py-bh*.12,bd/2+.02));led(K,P.ledR,body,bw*.36,py-bh*.12,bd/2+.02);K.plate(body,label(item),bw*.6,bench?.05:.07,0,py+bh*.3,bd/2+.014);if(!bench)K.plate(body,'ROTOR MAX 4,000 rpm',.4,.05,0,.16,bd/2+.007,'#e3b82e','#1c1b18');
 K.box(.2,.12,.05,P.grey,bw/2-.15,bh-.06,-bd/2-.02,body);K.pipe([[bw/2-.15,bh-.12,-bd/2-.03],[bw/2-.1,.3,-bd/2-.04],[bw/2-.1,.03,-bd/2-.02]],.006,P.rubber,body);
 anim.push(pulse(leds.map(m=>m.material),.4,.6,3));const lidTop=y0+rt+.02+ld*Math.sin(.95)+.06;
 return {group:g,height:lidTop,update:(t,clock=t)=>anim.forEach(f=>f(t,clock))};
}
