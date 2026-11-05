// Industrial robots for the portal (window.MB builders): six-axis articulated robots (KUKA QUANTEC / CYBERTECH /
// AGILUS / classic KR series, FANUC R-2000, ABB IRB) built as a joint hierarchy with their controller cabinets and
// teach pendants, fenced robot cells (grinding, laser cutting, panel pressing, handling), the SCARA labeling cell
// and the robot mastering bench. Built at the origin in metres, floor y=0, operator front towards +z, length along x
// (see machines/ROBOTS.md for the kinds, the catalogue photos and the options).
(function(){
'use strict';
const PI=Math.PI,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const FONT='"IBM Plex Sans", system-ui, sans-serif';
const setup=(K,s,def)=>{const H=MB.H(K);return {H,P:H.P,M:K.M,T:K.THREE,g:new K.THREE.Group(),o:Object.assign({},def,s.opts||{})}};
const rotX=(a,p)=>[p[0],p[1]*Math.cos(a)-p[2]*Math.sin(a),p[1]*Math.sin(a)+p[2]*Math.cos(a)];
const add3=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
// --- decals and textures used only in this family ---------------------------------------------------------------
const plane=(K,parent,w,h,material,x,y,z,ry=0,rx=0,rz=0)=>{const m=new K.THREE.Mesh(K.keep(new K.THREE.PlaneGeometry(w,h)),material);m.position.set(x,y,z);m.rotation.set(rx,ry,rz);parent.add(m);return m};
// text sticker / lettering w×h on a face (facing +z before ry/rx/rz); bg and fg are CSS colours
const decal=(K,parent,text,w,h,x,y,z,bg='#1c1b18',fg='#ecebe5',ry=0,rx=0,rz=0,size=.55,weight=700)=>{const t=K.canvasTex(512,Math.max(16,Math.round(512*h/w)),(c,W,Hh)=>{c.fillStyle=bg;c.fillRect(0,0,W,Hh);c.fillStyle=fg;c.font=`${weight} ${Math.round(Hh*size)}px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText(text,W/2,Hh/2+1,W-24)});
 return plane(K,parent,w,h,t?K.mat(0xffffff,.05,.6,{map:t}):K.mat(0x888888,0,.6),x,y,z,ry,rx,rz)};
// a sticker on a vertical cylinder of radius r (parent axis y) at angle ang round the axis
const onCyl=(K,parent,text,r,y,ang,size,bg='#f2f1ec',fg='#1c1b18')=>decal(K,parent,text,size,size*.62,Math.sin(ang)*(r+.006),y,Math.cos(ang)*(r+.006),bg,fg,ang,0,0,.6,800);
// yellow/black hazard stripe material (box faces) and plane
let hazT=null;const hazMat=K=>{hazT=hazT||K.canvasTex(128,128,(c,W,Hh)=>{c.fillStyle='#e3b82e';c.fillRect(0,0,W,Hh);c.fillStyle='#1c1b18';for(let x0=-Hh;x0<W+Hh;x0+=Hh/2){c.beginPath();c.moveTo(x0,0);c.lineTo(x0+Hh/4,0);c.lineTo(x0-Hh/4,Hh);c.lineTo(x0-Hh/2,Hh);c.closePath();c.fill()}});return K.mat(0xffffff,.1,.6,{map:hazT})};
// black wire-mesh fence panel (transparent grid, double sided)
const mesh=(K,parent,w,h,x,y,z,ry=0)=>{const t=K.canvasTex(128,128,(c,W,Hh)=>{c.clearRect(0,0,W,Hh);c.strokeStyle='#2f3337';c.lineWidth=5;for(let i=0;i<=W;i+=16){c.beginPath();c.moveTo(i,0);c.lineTo(i,Hh);c.stroke();c.beginPath();c.moveTo(0,i);c.lineTo(W,i);c.stroke()}});
 if(t){t.wrapS=t.wrapT=K.THREE.RepeatWrapping;t.repeat.set(w*3,h*3)}return plane(K,parent,w,h,K.mat(0xffffff,.4,.5,{map:t,transparent:true,side:K.THREE.DoubleSide}),x,y,z,ry)};
// egg-crate foam texture for the mastering cases
const foamMat=K=>{const t=K.canvasTex(128,128,(c,W,Hh)=>{c.fillStyle='#2a2b2d';c.fillRect(0,0,W,Hh);for(let i=0;i<8;i++)for(let j=0;j<8;j++){const gr=c.createRadialGradient(i*16+8,j*16+8,1,i*16+8,j*16+8,9);gr.addColorStop(0,'#4a4c50');gr.addColorStop(1,'#232426');c.fillStyle=gr;c.fillRect(i*16,j*16,16,16)}});return K.mat(0xffffff,0,.95,{map:t})};

// --- name parsing: make, series, payload (kg), reach (m), controller and gripper out of the catalogue text ----------
function parseRobot(s,o){
 const t=[s.name,s.note,s.info&&s.info.power,s.info&&s.info.weight,s.type].filter(Boolean).join(' ').replace(/\s+/g,' ');
 const make=/fanuc/i.test(t)?'fanuc':/\babb\b|\birb\b/i.test(t)?'abb':/yaskawa|motoman/i.test(t)?'yaskawa':'kuka';
 let payload=0,reach=0,series='',model='',m;
 if(make==='kuka'){
  if((m=/KR\s?(\d+)\s?R\s?(\d{3,4})(-\d)?/i.exec(t))){payload=+m[1];reach=+m[2];model=`KR ${m[1]} R${m[2]}${m[3]||''}`}
  else if((m=/KR\s?(\d+)\s?L\s?(\d{2,3})(-\d)?/i.exec(t))){payload=+m[2];reach=payload>=150?2900:2700;model=`KR ${m[1]} L${m[2]}${m[3]||''}`}
  else if((m=/KR\s?(\d+)(-\d)?\b/i.exec(t))){payload=+m[1];reach=payload<=16?1611:payload<=60?2033:2700;model=`KR ${m[1]}${m[2]||''}`}
  series=/agilus|KR\s?[36]\s?R\d/i.test(t)?'agilus':/quantec|KR\s?(90|120|150|180|210|240|270|300)\s?R\d/i.test(t)?'quantec':/KR\s?\d+\s?R\d/i.test(t)?'cybertech':'classic';
 }else if(make==='fanuc'){
  if((m=/R-?\s?2000\s?i([A-C])\s?\/\s?(\d+)([A-Z]?)/i.exec(t))){payload=+m[2];const v=(m[3]||'').toUpperCase();reach=v==='L'?3005:v==='S'?2050:2655;model=`R-2000i${m[1].toUpperCase()}/${m[2]}${v}`}
  else if((m=/\b(M|LR|R)-?(\d+)\s?i([A-D])\b(?:\s?\/\s?(\d+))?/i.exec(t))){payload=m[4]?+m[4]:20;reach=payload<10?900:payload<50?1800:2600;model=m[0]}
  series='fanuc';
 }else if(make==='abb'){
  if((m=/IRB\s?(\d{3,4})(?:-(\d+))?/i.exec(t))){const n=+m[1];payload=m[2]?+m[2]:n>=6000?150:n>=4000?60:n>=2000?20:10;reach=n>=6000?2550:n>=4000?2500:n>=2000?1650:1200;model=`IRB ${m[1]}`}
  series='abb';
 }else series='yaskawa';
 if((m=/(\d+(?:[.,]\d+)?)\s?kg\s?payload|payload\s?(?:of\s?)?(\d+(?:[.,]\d+)?)\s?kg/i.exec(t))){const v=parseFloat(String(m[1]||m[2]).replace(',','.'));if(v&&!payload)payload=v}
 if((m=/reach\s?(?:of\s?)?(\d{3,4})\s?mm/i.exec(t))&&!reach)reach=+m[1];
 if(!payload)payload=make==='fanuc'?165:make==='abb'?150:50;
 if(!reach)reach=make==='abb'?2550:payload<5?600:payload<20?1500:payload<80?2100:2800;
 let ctl=(o&&o.controller)||'auto';
 if(ctl==='auto')ctl=/KR\s?C5\s?micro/i.test(t)?'c5micro':/KR\s?C4\s?compact/i.test(t)?'c4compact':/KR\s?C5/i.test(t)?'c5':/KR\s?C[24]/i.test(t)?'c4':/R-?\s?30\s?iB/i.test(t)?'r30ib':/R-?\s?30\s?iA|R-?J3/i.test(t)?'r30ia':/IRC5|S4C/i.test(t)?'irc5':make==='fanuc'?'r30ib':make==='abb'?'irc5':payload<=6?'c4compact':payload<=10?'c5micro':(series==='quantec'&&/-2$/.test(model))?'c5':'c4';
 let grip=(o&&o.gripper)||'auto';
 if(grip==='auto')grip=/vacuum|schmalz|palletiz|stacking/i.test(t)?'vacuum':/pick|place|assembly|gripper/i.test(t)?'jaw':'none';
 return {make,series,payload,reach:reach/1000,model,ctl,grip,text:t};
}
const COL={
 kuka:{body:0xf26522,motor:0x222326,base:0x232426,cover:0x2a2b2d,bg:'#f26522',fg:'#ffffff'},
 agilus:{body:0xe3e1db,motor:0xcfcdc7,base:0xd8d6d0,cover:0x8e8f8b,bg:'#e3e1db',fg:'#f26522'},
 fanuc:{body:0xf7d117,motor:0xcc2b24,base:0x3b3d40,cover:0x3b3d40,bg:'#f7d117',fg:'#1c1b18'},
 abb:{body:0xe8552b,motor:0x4a4c50,base:0x3a3c3e,cover:0xe6e3dc,bg:'#e8552b',fg:'#ffffff'},
 yaskawa:{body:0x2f6fb5,motor:0x2a2c2f,base:0x2a2c2f,cover:0xd9dad6,bg:'#2f6fb5',fg:'#ffffff'}};

// --- end effectors on the A6 flange (tool group: origin on the flange face, tool axis +z) --------------------------
function buildTool(K,H,parent,grip,tk,R){const P=H.P,M=K.M,steel=M.steel,dark=M.dark,k=clamp(tk*3.2,.3,1.1);
 if(grip==='vacuum'){const gw=clamp(R*.2,.26,.62),gd=gw*.62,blue=K.mat(0x2b5fb5,.1,.7);
  K.box(k*.12,k*.12,.02,dark,0,0,.01,parent);K.cyl(k*.03,.09,steel,0,0,.062,parent,'z',12);K.box(gw,gd,.025,P.alu,0,0,.115,parent);K.box(gw*.96,gd*.9,.05,blue,0,0,.152,parent);
  for(let i=0;i<4;i++)for(let j=0;j<2;j++)K.cyl(k*.028,.016,P.rubber,(i-1.5)*gw*.23,(j-.5)*gd*.46,.184,parent,'z',14);
  K.box(.13,.06,.085,dark,gw*.28,0,.06,parent);decal(K,parent,'SCHMALZ',.1,.03,gw*.28,.031,.06,'#1c1b18','#4a90e2',0,-PI/2,0,.5,800);
  for(const sx of[-1,1])K.pipe([[gw*.28+sx*.04,.03,.035],[gw*.1+sx*.03,.09,.02],[0,tk*.22,-.03]],.007,P.hose,parent);return null}
 if(grip==='jaw'){K.cyl(k*.05,.02,dark,0,0,.01,parent,'z',16);K.box(k*.1,k*.08,k*.12,dark,0,0,k*.06+.015,parent);for(const sx of[-1,1])K.cyl(k*.012,k*.03,steel,sx*k*.03,k*.04+k*.012,k*.04,parent,'z',8);
  const f=[-1,1].map(sx=>K.box(k*.016,k*.06,k*.1,steel,sx*k*.035,0,k*.12+k*.045,parent));return t=>{const o=k*.035+k*.012*(.5+.5*Math.sin(t*1.8));f[0].position.x=-o;f[1].position.x=o}}
 if(grip==='spindle'){K.cyl(k*.05,.02,dark,0,0,.01,parent,'z',16);K.box(k*.1,k*.12,k*.08,dark,0,-k*.02,k*.04+.015,parent);K.cyl(k*.055,k*.3,K.mat(0x8b9196,.5,.45),0,-k*.06,k*.08+k*.15,parent,'z',18);K.cyl(k*.02,k*.05,steel,0,-k*.06,k*.08+k*.3+k*.025,parent,'z',10);
  const disc=K.cyl(k*.11,.012,K.mat(0x4a4540,.1,.9),0,-k*.06,k*.08+k*.3+k*.05,parent,'z',28);K.pipe([[0,k*.04,k*.06],[0,k*.1,0],[0,k*.2,-.08]],.008,P.hose,parent);return t=>{disc.rotation.z=t*20}}
 if(grip==='laser'){K.cyl(k*.05,.02,dark,0,0,.01,parent,'z',16);K.box(k*.12,k*.14,k*.22,dark,0,0,k*.11+.015,parent);K.cyl(k*.012,k*.1,K.mat(0xb8893a,.6,.4),0,0,k*.22+k*.05+.01,parent,'z',12,k*.04);
  K.pipe([[0,k*.07,k*.08],[0,k*.16,0],[0,k*.25,-.1]],.009,K.mat(0xd8822e,.1,.7),parent);K.pipe([[k*.03,k*.07,k*.14],[k*.05,k*.18,.02],[k*.06,k*.25,-.1]],.007,P.hose,parent);return null}
 return null}

// --- the six-axis robot: base → A1 carousel → A2 link arm → A3 arm → A4/A5/A6 in-line wrist → tool ------------------
// q: {make, series, payload, reach (m), grip, x, y, z, ry, pose:{a1,a2,a3}, phase}; every link scales from the reach,
// the casting thickness from the payload class. Returns {group, B (base width), conn (connector box, parent coords), update}.
function buildArm(K,H,parent,q,s){
 const P=H.P,M=K.M,steel=M.steel,dark=M.dark;
 const R=q.reach,Pk=q.payload,make=q.make,fan=make==='fanuc',abb=make==='abb',agil=q.series==='agilus',classic=q.series==='classic';
 const tk=Math.max(.08+.18*Math.sqrt(Pk/210),R*.065);
 const h2=.18*R+.18,L2=.37*R+.03,L3=.36*R+.02,w4=.05*R+.03,w6=.06*R+.03,zo=.1*R;
 const B=clamp(.27*R,.24,.95),bh=clamp(.05*R,.04,.12),cr=clamp(.1*R+.05,.09,.4),bc=fan?.12+.06*R:classic?.2+.04*R:.05+.05*R;
 const col=COL[agil?'agilus':make]||COL.kuka;
 const body=K.mat(col.body,.25,.42),motor=K.mat(col.motor,.35,.55),base=K.mat(col.base,.45,.55),cover=K.mat(col.cover,.3,.55),hoseM=K.mat(0x1f2022,.1,.8);
 const g=H.grp(parent,q.x||0,q.y||0,q.z||0,q.ry||0);
 const pose=Object.assign(fan?{a1:0,a2:-.2,a3:.05}:{a1:0,a2:-.5,a3:.1},q.pose||{});
 const grip=q.grip||'none',tilt=grip==='none'?1.0:grip==='spindle'||grip==='laser'?1.3:1.45;pose.a5=clamp(tilt-(pose.a2+pose.a3),-2.1,2.1);
 const hr=clamp(tk*.14,.012,.034);
 // ---- base: cast plate, four bolt lugs with anchor bolts, the A1 bearing column, the connector box at the back
 K.box(B,bh,B,base,0,bh/2,0,g);
 for(const sx of[-1,1])for(const sz of[-1,1]){const lx=sx*(B/2-B*.1),lz=sz*(B/2+B*.09-.004);K.box(B*.2,bh,B*.2,base,lx,bh/2,lz,g);K.cyl(B*.045,.006,steel,lx,bh+.003,lz,g,'y',12);K.cyl(B*.028,.028,steel,lx,bh+.02,lz,g,'y',6)}
 const bz=fan?B*.43:cr*1.05;
 if(fan){K.box(B*.86,bc,B*.86,base,0,bh+bc/2,0,g);K.box(B*.7,.02,B*.7,base,0,bh+bc+.01,0,g)}else K.cyl(cr*1.05,bc,base,0,bh+bc/2,0,g,'y',32);
 const y0=bh+bc+.02;K.cyl(cr*1.1,.025,cover,0,bh+bc+.012,0,g,'y',32);
 const cbw=B*.42,cbh=Math.max(.07,bc*.8),cbd=Math.max(.05,B*.14),cbz=-bz-cbd/2+.012;
 K.box(cbw,cbh,cbd,cover,0,bh+bc*.5,cbz,g);for(let i=0;i<3;i++)K.cyl(cbh*.17,.024,dark,(i-1)*cbw*.3,bh+bc*.5-cbh*.1,cbz-cbd/2-.01,g,'z',12);
 decal(K,g,'X11',cbw*.4,cbh*.22,cbw*.1,bh+bc*.5+cbh*.32,cbz-cbd/2-.004,'#d8d8d2','#1c1b18',PI,0,0,.6,500);
 H.warn(g,0,bh+bc*.5,bz+.006,0,clamp(bc*.6,.06,.12));
 // ---- A1 carousel: the drum, the casting rising to the A2 pivot, the A1 motor housing, the A2 motor, stickers
 const a1=H.grp(g,0,y0,0);const ch=h2*.48,uw=tk*2.0,uh=h2-ch-tk*.3+.02,ud=cr*1.5,uz=zo*.5;
 K.cyl(cr,ch,body,0,ch/2,0,a1,'y',32);if(fan)K.box(cr*2.3,ch*.9,cr*1.5,body,0,ch*.45,0,a1);
 K.box(uw,uh,ud,body,0,ch-.02+uh/2,uz,a1);K.torus(cr+.002,.006,cover,0,.03,0,a1,'y',40);
 if(fan){const mr=tk*.4;K.cyl(mr,tk*.8,motor,0,ch-.02+uh+tk*.38,uz-ud/2+mr+.02,a1,'y',18);K.cyl(mr*1.04,.02,cover,0,ch-.02+uh+tk*.78,uz-ud/2+mr+.02,a1,'y',18)}
 else{const mr=tk*.4,mx=cr*.3,mz=-cr*.72;K.cyl(mr,h2*.42,motor,mx,ch*.35+h2*.21,mz,a1,'y',18);K.cyl(mr*1.05,.024,cover,mx,ch*.35+h2*.42+.01,mz,a1,'y',18);K.box(mr*1.1,mr*.7,mr*.8,cover,mx,ch*.35+h2*.42-mr*.4,mz-mr*.95,a1)}
 if(!fan){K.cyl(tk*.5,tk*1.1,motor,tk*.95+tk*.54,h2,zo,a1,'x',20);K.cyl(tk*.52,.02,cover,tk*.95+tk*1.09,h2,zo,a1,'x',20);K.box(tk*.45,tk*.5,tk*.45,cover,tk*.95+tk*.75,h2+tk*.55,zo-tk*.1,a1)}
 onCyl(K,a1,'A1',cr,ch*.55,.55,clamp(tk*.3,.05,.1));H.warn(a1,0,ch*.5,-cr-.006,PI,clamp(ch*.35,.05,.1));
 // ---- hydro-pneumatic counterbalance (KUKA ≥ 30 kg, FANUC R-2000): anchored on the carousel, aimed at the link arm
 const bal=Pk>=30&&!agil;const bx=fan?-tk*1.2:-tk*.5;const balT=[bx,L2*.48,-tk*.85];
 const balA=[bx,ch*.6,fan?-cr*.75-tk*.25:-cr*.95-tk*.2];let balG=null,rodG=null,balLc=0;
 if(bal){K.box(tk*.55,tk*.6,tk*.5,body,bx,ch*.6,fan?-cr*.75-tk*.1:-cr*.95,a1);balG=H.grp(a1,balA[0],balA[1],balA[2]);K.sphere(tk*.3,dark,0,0,0,balG,14);
  const tgt=add3([0,h2,zo],rotX(pose.a2,balT));balLc=Math.hypot(tgt[1]-balA[1],tgt[2]-balA[2])*.62;
  K.cyl(tk*.5,balLc,body,0,tk*.2+balLc/2,0,balG,'y',22);K.cyl(tk*.53,.03,cover,0,tk*.2+.015,0,balG,'y',22);K.cyl(tk*.53,.03,cover,0,tk*.2+balLc-.015,0,balG,'y',22);
  rodG=H.grp(balG,0,tk*.2+balLc-.02,0);K.cyl(tk*.14,1,steel,0,.5,0,rodG,'y',12)}
 const updBal=()=>{if(!balG)return;const tgt=add3([0,h2,zo],rotX(a2.rotation.x,balT)),dy=tgt[1]-balA[1],dz=tgt[2]-balA[2];balG.rotation.x=Math.atan2(dz,dy);rodG.scale.y=Math.max(.05,Math.hypot(dy,dz)-balLc-tk*.2+.04)};
 // ---- A2 link arm (rocker): the slab with the big round bosses, cover lids with hex bolts, the A3 motor at the top
 const a2=H.grp(a1,0,h2,zo);
 K.cyl(tk*.95,tk*1.9,body,0,0,0,a2,'x',28);K.box(tk*1.5,L2,tk*1.05,body,0,L2/2,0,a2);K.cyl(tk*.7,tk*1.4,body,0,L2,0,a2,'x',28);
 for(const sx of[-1,1]){K.cyl(tk*.72,.012,cover,sx*(tk*.95+.004),0,0,a2,'x',28);for(let i=0;i<8;i++){const a=i/8*PI*2;K.cyl(tk*.045,.012,steel,sx*(tk*.95+.016),Math.cos(a)*tk*.58,Math.sin(a)*tk*.58,a2,'x',6)}}
 decal(K,a2,'A2',tk*.3,tk*.18,tk*.95+.017,0,0,'#f2f1ec','#1c1b18',PI/2,0,0,.6,800);
 // the flat sides of the slab between the bosses: maker logo, type plate and warning, the bolted cover plate above
 {const y0s=tk*.95+.012,y1s=L2-tk*.7-.012,span=y1s-y0s;if(span>.05){const lw=Math.min(tk*1.3,span*.9,L2*.5),lh=Math.min(lw*.32,span*.4);
  if(!fan)for(const sx of[-1,1])decal(K,a2,abb?'ABB':'KUKA',lw,lh,sx*(tk*.75+.006),y0s+lh/2,0,col.bg,col.fg,sx*PI/2,0,0,.62,800);
  const pw=clamp(tk*1.0,.1,.24),ph=pw*.26,py=y0s+(fan?0:lh)+ph/2+.02;
  if(span>.3){if(s)H.nameplate(a2,s,tk*.75+.006,py,0,pw,ph,PI/2);H.warn(a2,-(tk*.75+.006),py,0,-PI/2,clamp(tk*.4,.06,.1));
   const cy0=py+ph/2+.05,cy1=y1s;if(cy1-cy0>.15)for(const sx of[-1,1]){K.box(.008,cy1-cy0,tk*.62,cover,sx*(tk*.75+.002),(cy0+cy1)/2,0,a2);for(let i=0;i<6;i++)K.cyl(tk*.035,.01,steel,sx*(tk*.75+.011),cy0+.03+(i%3)*(cy1-cy0-.06)/2,(i<3?-1:1)*tk*.22,a2,'x',6)}}}}
 const m3=fan?1:-1;K.cyl(tk*.45,tk*1.0,motor,m3*(tk*.75+tk*.49),L2,0,a2,'x',20);K.cyl(tk*.47,.02,cover,m3*(tk*.75+tk*.99),L2,0,a2,'x',20);K.box(tk*.4,tk*.45,tk*.4,cover,m3*(tk*.75+tk*.7),L2+tk*.5,0,a2);
 if(bal){K.box(fan?tk*1.1:tk*.5,tk*.5,tk*.6,body,fan?-tk*.9:bx,L2*.48,-tk*.62,a2);K.sphere(tk*.22,dark,balT[0],balT[1],balT[2],a2,12)}
 // ---- A3 arm: elbow casting, shoulder block, tapered tube, the A4–A6 motor block at the rear, logo, retractor
 const a3=H.grp(a2,0,L2,0);const rear=tk*1.25,ty=tk*.05;
 K.cyl(tk*.85,tk*1.5,body,0,0,0,a3,'x',28);K.box(tk*1.4,tk*1.3,L3*.42+rear,body,0,ty,(L3*.42-rear)/2,a3);K.cyl(tk*.5,L3*.62,body,0,ty,L3*.69,a3,'z',24,tk*.62);
 for(const sx of[-1,1]){K.cyl(tk*.62,.012,cover,sx*(tk*.75+.004),0,0,a3,'x',24);for(let i=0;i<6;i++){const a=i/6*PI*2+.3;K.cyl(tk*.04,.012,steel,sx*(tk*.75+.016),Math.cos(a)*tk*.5,Math.sin(a)*tk*.5,a3,'x',6)}}
 decal(K,a3,'A3',tk*.28,tk*.17,tk*.75+.017,0,0,'#f2f1ec','#1c1b18',PI/2,0,0,.6,800);
 const mr=tk*.3,mz=-rear,mp=fan?[[-tk*.33,tk*.5],[tk*.33,tk*.5],[0,-tk*.15]]:[[-tk*.38,tk*.4],[tk*.38,tk*.4],[0,-tk*.32]];
 for(const [mx,my] of mp){K.cyl(mr,tk*.9,motor,mx,my,mz-tk*.35,a3,'z',18);if(fan)K.box(mr*2.1,mr*2.1,tk*.25,motor,mx,my,mz-tk*.85,a3);else K.cyl(mr*1.05,.02,cover,mx,my,mz-tk*.79,a3,'z',18)}
 K.box(tk*.5,tk*.28,tk*.55,cover,-tk*.1,ty+tk*.65+tk*.14-.004,-rear*.2,a3);K.cyl(tk*.05,tk*.5,steel,-tk*.1,ty+tk*.65+tk*.2,-rear*.2+tk*.5,a3,'z',8);
 if(fan){const rz=tk*(.62-.12*((.62-.38)/.62));for(const sx of[-1,1])decal(K,a3,`FANUC Robot ${q.model||'R-2000iC'}`,L3*.36,tk*.26,sx*(rz+.006),ty+tk*.02,L3*.62,col.bg,col.fg,sx*PI/2,0,0,.5,600)}
 else{const lw=Math.min(tk*1.2,L3*.3);decal(K,a3,abb?'ABB':'KUKA',lw,lw*.32,tk*.1,ty+tk*.65+.006,L3*.24,col.bg,col.fg,0,-PI/2,0,.62,800);
  const sw=Math.min(tk*1.2,L3*.42-tk*.62-.03);if(sw>.06)for(const sx of[-1,1])decal(K,a3,abb?'ABB':'KUKA',sw,sw*.32,sx*(tk*.7+.006),ty+tk*.1,tk*.62+.015+sw/2,col.bg,col.fg,sx*PI/2,0,0,.62,800)}
 H.warn(a3,tk*.7+.006,ty-tk*.3,L3*.3,PI/2,clamp(tk*.35,.05,.1));
 // ---- in-line wrist: A4 roll cylinder, the A5 tilt housing (fork on FANUC/ABB, asymmetric on KUKA), A6 flange
 const a4=H.grp(a3,0,ty,L3);K.cyl(tk*.45,w4,body,0,0,w4/2,a4,'z',24);K.torus(tk*.455,.006,cover,0,0,.012,a4,'z',24);
 const a5z=w4+tk*.42;if(fan||abb)for(const sx of[-1,1])K.box(tk*.2,tk*.8,tk*.52,body,sx*tk*.5,0,w4+tk*.21,a4);else K.box(tk*.72,tk*.86,tk*.52,body,tk*.2,0,w4+tk*.21,a4);
 decal(K,a4,'A4',tk*.22,tk*.14,0,tk*.45+.006,w4*.5,'#f2f1ec','#1c1b18',0,-PI/2,0,.6,800);
 const a5=H.grp(a4,0,0,a5z);K.cyl(tk*.38,tk*1.0,body,0,0,0,a5,'x',22);K.cyl(tk*.3,w6-.01,body,0,0,(w6-.01)/2,a5,'z',22);
 if(!(fan||abb))K.cyl(tk*.4,.012,cover,-tk*.5-.004,0,0,a5,'x',22);
 const a6=H.grp(a5,0,0,w6);K.cyl(tk*.3,.02,steel,0,0,.01,a6,'z',24);for(let i=0;i<6;i++){const a=i/6*PI*2;K.cyl(tk*.028,.006,dark,Math.cos(a)*tk*.22,Math.sin(a)*tk*.22,.023,a6,'z',8)}
 const tool=H.grp(a6,0,0,.02);const toolU=buildTool(K,H,tool,grip,tk,R);
 // ---- energy supply / dress pack: corrugated hoses from the base connector box up the carousel, along the link arm
 // with clamps, over the A3 arm (spring retractor) and the tube to the wrist; split per joint, joined at the pose
 const p2=[-tk*.42,-tk*.25,-tk*1.05],p2a=add3([0,h2,zo],rotX(pose.a2,p2));
 const p3=[-tk*.45,-tk*.3,-tk*.9],p3a=add3([0,L2,0],rotX(pose.a3,p3));
 const p4=[-tk*.12,tk*.45+hr,w4*.4],p4a=[p4[0],ty+p4[1],L3+p4[2]];
 K.pipe([[cbw*.1,bh+bc*.5+cbh*.5-.01,cbz],[cbw*.1,bh+bc*.5+cbh*.5+hr*2.5,cbz-hr*1.5],[0,y0+ch*.3,-cr*.86]],hr,hoseM,g);
 K.pipe([[-tk*.3,ch*.3,-cr*.86],[-tk*.35,ch+.04,-cr*.9-hr],[-tk*.42,h2-tk*.8,uz-ud/2-hr],p2a],hr,hoseM,a1);
 K.pipe([p2,[-tk*.45,L2*.22,-tk*.72],[-tk*.45,L2*.62,-tk*.72],p3],hr,hoseM,a2);
 for(const yy of[L2*.22,L2*.62])K.box(hr*3,hr*2.4,hr*2.4,cover,-tk*.45,yy,-tk*.62,a2);
 K.pipe([p3,[-tk*.45,tk*.45,-rear*.6],[-tk*.12,ty+tk*.98,-rear*.2],[0,ty+tk*.9,L3*.3],[0,ty+tk*.62+hr,L3*.6],[-tk*.1,ty+tk*.5+hr,L3*.92],p4a],hr,hoseM,a3);
 for(const zz of[L3*.55,L3*.85]){const rr=tk*(.62-.12*((zz/L3-.38)/.62));K.torus(rr+.004,hr*.5,cover,0,ty,zz,a3,'z',24)}
 K.pipe([p4,[-tk*.15,tk*.4,w4+tk*.2],[-tk*.3,tk*.2,w4+tk*.42]],hr,hoseM,a4);
 // ---- pose and the joint animation (a palletizing / pick-and-place cycle)
 a1.rotation.y=pose.a1;a2.rotation.x=pose.a2;a3.rotation.x=pose.a3;a5.rotation.x=pose.a5;updBal();
 const phs=q.phase||0;
 const update=(t,running)=>{if(!running)return;const c=t*.45+phs,s1=Math.sin(c),s2=Math.sin(c*2+.6);
  a1.rotation.y=pose.a1+.5*s1;a2.rotation.x=pose.a2+.1*s2;a3.rotation.x=pose.a3-.16*s2+.05*Math.sin(c*3);a4.rotation.z=.35*Math.sin(c*1.3);
  a5.rotation.x=clamp(tilt-(a2.rotation.x+a3.rotation.x)+.1*Math.sin(c*2.2),-2.1,2.1);a6.rotation.z=.7*Math.sin(c*.9);updBal();if(toolU)toolU(t)};
 return {group:g,B,tk,conn:[q.x||0,(q.y||0)+bh+bc*.5,(q.z||0)+cbz-cbd/2],update};
}

// --- teach pendants: KUKA smartPAD, FANUC iPendant, ABB FlexPendant (centre at x,y,z; flat=true lies on its back) -------
function pendant(K,H,parent,style,x,y,z,ry=0,flat=false){const P=H.P,M=K.M,g=H.grp(parent,x,y,z,ry);if(flat)g.rotation.x=-PI/2;const w=.24,h=.3,t=.035;
 const bm=style==='ipendant'?K.mat(0xe3dfd2,.2,.5):style==='flex'?K.mat(0xeeede7,.2,.5):K.mat(0xc6c8c4,.2,.5);
 K.box(w,h,t,bm,0,0,0,g);K.box(w-.03,h-.03,.006,M.dark,0,0,-t/2-.001,g);H.screen(g,0,.025,t/2+.012,.17,.12,null);
 if(style==='smartpad'){for(const sx of[-1,1])K.box(.03,.2,.045,M.dark,sx*(w/2+.012),0,0,g);H.estop(g,.085,.115,t/2+.006);H.keypad(g,-.02,-.095,t/2+.006,5,2,.016);decal(K,g,'KUKA',.07,.022,-.075,.12,t/2+.003,'#c6c8c4','#f26522',0,0,0,.65,800)}
 else if(style==='ipendant'){K.cyl(.027,.006,P.yellow,-.085,.115,t/2+.003,g,'z',16);K.cyl(.018,.018,P.red,-.085,.115,t/2+.012,g,'z',14);H.keypad(g,0,-.095,t/2+.006,6,3,.014);decal(K,g,'FANUC',.08,.022,.075,.12,t/2+.003,'#e3dfd2','#e9c12f',0,0,0,.65,800);K.box(.06,.04,.015,M.dark,0,-h/2+.03,-t/2-.006,g)}
 else{H.estop(g,.08,.115,t/2+.006);K.cyl(.007,.04,M.dark,.075,-.09,t/2+.02,g,'z',10);K.sphere(.013,M.dark,.075,-.09,t/2+.04,g,10);H.keypad(g,-.04,-.095,t/2+.006,4,2,.016);decal(K,g,'ABB',.06,.022,-.08,.12,t/2+.003,'#eeede7','#ff000f',0,0,0,.7,900)}
 K.pipe(flat?[[0,-h/2+.01,0],[0,-h/2-.1,0],[.1,-h/2-.22,0],[.3,-h/2-.25,0]]:[[0,-h/2+.01,0],[0,-h/2-.08,-.02],[0,-h/2-.14,-.1]],.006,P.black,g);return g}

// --- controller cabinets ----------------------------------------------------------------------------------------------
const CTL={c4:[.8,.55,1.0],c5:[.8,.55,.98],c4compact:[.5,.47,.28],c5micro:[.5,.47,.28],r30ib:[.5,.45,.78],r30ia:[.6,.5,1.17],irc5:[.73,.7,1.0]};
function buildController(K,H,parent,type,s,x,y,z,ry){
 const P=H.P,M=K.M,dark=M.dark,steel=M.steel,g=H.grp(parent,x,y,z,ry);const [w,d,h]=CTL[type]||CTL.c4;let cable=[0,.1,d/2];
 if(type==='c4'){// KR C4: anthracite cabinet with the orange door, KUKA logo, connector strip, side grille, smartPAD hung on the side
  const an=K.mat(0x393c3f,.4,.55),orange=K.mat(0xf26522,.2,.5),bh=h-.05;
  K.box(w,bh,d,an,0,.05+bh/2,0,g);H.feet(g,w,d,.05,.08,M.dark);
  K.box(w*.86,bh*.72,.006,M.dark,0,.05+bh*.56,d/2+.001,g);K.box(w*.82,bh*.68,.024,orange,0,.05+bh*.56,d/2+.014,g);
  H.handle(g,w*.3,.05+bh*.5,d/2+.027,.26,true,M.dark);H.hinge(g,-w*.39,.05+bh*.56,d/2+.02,2,bh*.5);
  decal(K,g,'KUKA',.28,.075,-w*.12,.05+bh*.3,d/2+.027,'#f26522','#ffffff',0,0,0,.62,800);
  H.warn(g,-w*.28,.05+bh*.8,d/2+.027,0,.07);decal(K,g,'WARNING',.1,.03,-w*.28,.05+bh*.72,d/2+.027,'#f2c230','#1c1b18',0,0,0,.5);
  K.box(w*.86,bh*.12,.012,P.black,0,.05+bh*.1,d/2+.004,g);for(let i=0;i<6;i++)K.cyl(.014,.02,steel,-w*.35+i*w*.14,.05+bh*.1,d/2+.016,g,'z',10);
  K.box(w+.02,.03,d+.02,M.dark,0,.05+bh+.015,0,g);H.grille(g,.3,.25,w/2+.006,.05+bh*.75,0,PI/2);H.nameplate(g,s,-(w/2+.006),.05+bh*.4,0,.3,.08,-PI/2);
  K.box(.03,.02,.28,steel,w/2+.03,.05+bh*.9,.05,g);K.box(.02,.1,.01,dark,w/2+.05,.05+bh*.86,.05,g);pendant(K,H,g,'smartpad',w/2+.05,.05+bh*.72,.05,PI/2);
  cable=[w*.1,.05+bh*.1,d/2+.02];
 }else if(type==='c5'){// KR C5: light grey cabinet on a plinth, slotted vents, orange KUKA logo, smartPAD on the front
  const lg=K.mat(0xd8d9d5,.25,.5),dg=K.mat(0x5b5e62,.4,.55),bh=h-.08;
  K.box(w,bh,d,lg,0,.08+bh/2,0,g);K.box(w-.06,.08,d-.06,M.dark,0,.04,0,g);
  for(const sx of[-1,1])K.box(.004,bh*.86,.006,dg,sx*w*.44,.08+bh*.5,d/2+.002,g);K.box(w*.9,.004,.006,dg,0,.08+bh*.93,d/2+.002,g);
  for(let i=0;i<12;i++)K.box(.007,bh*.16,.006,dg,-w*.33+i*w*.06,.08+bh*.84,d/2+.003,g);
  K.box(w*.9,bh*.1,.012,dg,0,.08+bh*.08,d/2+.004,g);for(let i=0;i<5;i++)K.cyl(.014,.02,steel,-w*.3+i*w*.15,.08+bh*.08,d/2+.016,g,'z',10);
  decal(K,g,'KUKA',.3,.08,-w*.15,.08+bh*.5,d/2+.006,'#d8d9d5','#f26522',0,0,0,.62,800);H.warn(g,-w*.3,.08+bh*.65,d/2+.006,0,.07);decal(K,g,'KR C5',.12,.03,-w*.3,.08+bh*.3,d/2+.006,'#1c1b18','#ecebe5',0,0,0,.55);
  H.grille(g,.3,.3,w/2+.006,.08+bh*.7,0,PI/2);H.nameplate(g,s,-(w/2+.006),.08+bh*.4,0,.3,.08,-PI/2);
  K.box(.28,.02,.03,steel,w*.3,.08+bh*.92,d/2+.03,g);K.box(.02,.1,.01,dark,w*.3,.08+bh*.88,d/2+.045,g);pendant(K,H,g,'smartpad',w*.3,.08+bh*.74,d/2+.06,0);
  cable=[-w*.2,.08+bh*.08,d/2+.02];
 }else if(type==='c4compact'||type==='c5micro'){// small box controller: fans and vents in front, handles and connectors on top, pendant beside
  const micro=type==='c5micro',bm=micro?K.mat(0xd3d4d0,.25,.5):K.mat(0x26282b,.35,.6),fr=micro?K.mat(0x2e3033,.35,.6):K.mat(0x1e2022,.35,.6);
  K.box(w,h-.02,d,bm,0,.02+(h-.02)/2,0,g);K.box(w-.04,.02,d-.04,M.dark,0,.01,0,g);K.box(w*.96,(h-.02)*.9,.008,fr,0,.02+(h-.02)*.5,d/2+.002,g);
  for(const yy of[.19,.09])H.fan(g,-w*.3,yy,d/2+.012,.038);H.grille(g,.2,.18,w*.14,.15,d/2+.008);
  decal(K,g,'KUKA',.1,.03,w*.38,.24,d/2+.008,micro?'#2e3033':'#1e2022','#f26522',0,0,0,.6,800);decal(K,g,micro?'KR C5 micro':'KR C4 compact',.16,.025,w*.3,.05,d/2+.008,'#e8e8e2','#1c1b18',0,0,0,.5,600);
  for(const sx of[-1,1]){K.box(.14,.012,.012,steel,sx*w*.3,h+.035,-d*.25,g);for(const dx of[-1,1])K.box(.012,.04,.012,steel,sx*w*.3+dx*.064,h+.015,-d*.25,g)}
  for(let i=0;i<4;i++)K.cyl(.013,.02,dark,-w*.3+i*.07,h+.008,d*.2,g,'y',10);K.box(.09,.012,.05,steel,w*.3,h+.004,d*.2,g);
  decal(K,g,'X11  X19  X65',.18,.03,-w*.15,h+.003,d*.05,'#e8c228','#1c1b18',0,-PI/2,0,.5,600);K.box(.1,.004,.06,K.mat(0xe4e4df,.1,.6),-w*.3,h+.002,-d*.05,g);
  H.warn(g,-w*.35,.26-.004,d/2+.008,0,.045);pendant(K,H,g,'smartpad',w/2+.22,.024,.02,0,true);
  cable=[-w*.3,h+.01,-d*.1];
 }else if(type==='r30ib'){// FANUC R-30iB Plus A-cabinet on castors: beige door with the fan, e-stop, iPendant hung on the door, cable coil on top
  const beige=K.mat(0xd0cdc1,.25,.5),lt=K.mat(0xe3e0d6,.2,.5),fy=.14,bh=h-fy;
  K.box(w+.04,.05,d+.04,M.dark,0,fy-.025,0,g);H.castors(g,w+.04,d+.04,.07,.045);K.box(w,bh,d,beige,0,fy+bh/2,0,g);
  K.box(w*.92,bh*.9,.006,M.dark,0,fy+bh*.5,d/2+.001,g);K.box(w*.88,bh*.86,.02,lt,0,fy+bh*.5,d/2+.012,g);
  H.hinge(g,-w*.42,fy+bh*.5,d/2+.018,2,bh*.6);H.handle(g,w*.4,fy+bh*.3,d/2+.022,.12,true,M.dark);
  H.fan(g,-w*.2,fy+bh*.7,d/2+.025,.065);K.torus(.09,.006,M.dark,-w*.2,fy+bh*.7,d/2+.024,g,'z',28);
  H.estop(g,w*.33,fy+bh*.88,d/2+.024);K.cyl(.012,.02,M.dark,w*.15,fy+bh*.88,d/2+.03,g,'z',10);K.box(.06,.04,.004,K.mat(0xe8c228,.1,.6),-w*.3,fy+bh*.86,d/2+.024,g);
  decal(K,g,'FANUC',.16,.045,-w*.28,fy+bh*.94,d/2+.024,'#e3e0d6','#e9c12f',0,0,0,.62,800);H.warn(g,-w*.3,fy+bh*.22,d/2+.024,0,.06);decal(K,g,'R-30iB Plus',.16,.03,-w*.3,fy+bh*.12,d/2+.024,'#1c1b18','#ecebe5',0,0,0,.5);
  H.grille(g,.2,.15,w/2+.006,fy+bh*.75,0,PI/2);H.nameplate(g,s,-(w/2+.006),fy+bh*.5,0,.28,.08,-PI/2);
  for(let i=0;i<3;i++)K.torus(.1+i*.02,.01,P.black,0,fy+bh+.014+i*.004,0,g,'y',32);K.pipe([[.08,fy+bh+.02,-.1],[.2,fy+bh+.04,-.22],[.26,fy+bh-.3,-.26]],.009,P.black,g);
  K.box(.03,.02,.22,steel,w*.3,fy+bh*.68,d/2+.03,g);K.box(.02,.08,.01,dark,w*.3,fy+bh*.64,d/2+.045,g);pendant(K,H,g,'ipendant',w*.3,fy+bh*.48,d/2+.05,0);
  cable=[0,fy+.05,d/2+.02];
 }else if(type==='r30ia'){// FANUC R-30iA B-cabinet: tall grey cabinet with a beige door on castors, pendant on the door
  const dg=K.mat(0x55585c,.4,.55),bg=K.mat(0xd7d3c7,.2,.5),fy=.14,bh=h-fy;
  K.box(w+.04,.05,d+.04,M.dark,0,fy-.025,0,g);H.castors(g,w+.04,d+.04,.07,.045);K.box(w,bh,d,dg,0,fy+bh/2,0,g);
  K.box(w*.92,bh*.92,.006,M.dark,0,fy+bh*.5,d/2+.001,g);K.box(w*.88,bh*.88,.02,bg,0,fy+bh*.5,d/2+.012,g);
  H.hinge(g,-w*.42,fy+bh*.5,d/2+.018,3,bh*.7);H.handle(g,w*.38,fy+bh*.42,d/2+.022,.16,true,M.dark);
  H.grille(g,.3,.2,-w*.1,fy+bh*.86,d/2+.023);H.estop(g,w*.33,fy+bh*.74,d/2+.024);K.cyl(.012,.02,M.dark,w*.2,fy+bh*.74,d/2+.03,g,'z',10);
  decal(K,g,'FANUC',.16,.045,-w*.3,fy+bh*.72,d/2+.024,'#d7d3c7','#e9c12f',0,0,0,.62,800);H.warn(g,-w*.3,fy+bh*.2,d/2+.024,0,.06);decal(K,g,'R-30iA',.14,.03,-w*.3,fy+bh*.12,d/2+.024,'#1c1b18','#ecebe5',0,0,0,.5);
  H.grille(g,.25,.2,w/2+.006,fy+bh*.8,0,PI/2);H.nameplate(g,s,-(w/2+.006),fy+bh*.5,0,.3,.08,-PI/2);
  K.box(.03,.02,.22,steel,w*.25,fy+bh*.56,d/2+.03,g);K.box(.02,.08,.01,dark,w*.25,fy+bh*.52,d/2+.045,g);pendant(K,H,g,'ipendant',w*.25,fy+bh*.36,d/2+.05,0);
  cable=[0,fy+.05,d/2+.02];
 }else if(type==='irc5'){// ABB IRC5: grey cabinet with the dark top band, operator panel (mode switch, buttons), FlexPendant hung in front
  const lg=K.mat(0xc9ccc9,.3,.5),dg=K.mat(0x4a4d50,.4,.55),bh=h-.06;
  K.box(w,bh,d,lg,0,.06+bh/2,0,g);K.box(w-.08,.06,d-.08,M.dark,0,.03,0,g);K.box(w+.004,.08,d+.004,dg,0,.06+bh-.04,0,g);
  K.box(w*.9,bh*.8,.006,dg,0,.06+bh*.46,d/2+.001,g);K.box(w*.86,bh*.76,.02,lg,0,.06+bh*.46,d/2+.011,g);H.hinge(g,-w*.42,.06+bh*.46,d/2+.018,2,bh*.5);H.handle(g,w*.36,.06+bh*.4,d/2+.022,.2,true,M.dark);
  K.box(.22,.12,.01,dg,w*.22,.06+bh*.9,d/2+.005,g);H.keypad(g,w*.17,.06+bh*.9,d/2+.012,3,1,.022);K.cyl(.012,.02,M.dark,w*.3,.06+bh*.9,d/2+.015,g,'z',10);H.estop(g,-w*.3,.06+bh*.9,d/2+.012);
  decal(K,g,'ABB',.16,.06,0,.06+bh*.9,d/2+.012,'#c9ccc9','#ff000f',0,0,0,.7,900);H.warn(g,-w*.3,.06+bh*.65,d/2+.022,0,.06);decal(K,g,'IRC5',.12,.03,-w*.3,.06+bh*.2,d/2+.022,'#1c1b18','#ecebe5',0,0,0,.5);
  H.grille(g,.3,.25,w/2+.006,.06+bh*.6,0,PI/2);H.nameplate(g,s,-(w/2+.006),.06+bh*.45,0,.3,.08,-PI/2);
  K.box(.03,.02,.22,steel,-w*.28,.06+bh*.7,d/2+.03,g);K.box(.02,.08,.01,dark,-w*.28,.06+bh*.66,d/2+.045,g);pendant(K,H,g,'flex',-w*.28,.06+bh*.52,d/2+.05,0);
  cable=[0,.06+.05,d/2+.02];
 }
 return {group:g,w,d,h,cable:[x+cable[0]*Math.cos(ry)+cable[2]*Math.sin(ry),y+cable[1],z-cable[0]*Math.sin(ry)+cable[2]*Math.cos(ry)]};
}
// cable bundle on the floor from the controller to the robot base connector (parent coords)
function robotCable(K,H,parent,from,to){const P=H.P;for(const dx of[-.02,.02])K.pipe([[from[0]+dx,from[1],from[2]],[from[0]+dx,.03,from[2]+.15],[to[0]+dx,.03,to[2]-.3],[to[0]+dx,to[1],to[2]-.02]],.012,P.black,parent)}

// --- safety fence: yellow posts, black mesh (or beige enclosure walls), a door with its interlock, a light-curtain opening --
function fence(K,H,parent,W,D,hF,opt){const P=H.P,M=K.M,post=K.mat(0xe3b82e,.2,.55),frameM=K.mat(0x2b2d30,.4,.6),wallM=K.mat(0xd8d4c4,.2,.6),haz=hazMat(K);
 const sides=[{n:'front',len:W,x:0,z:D/2,ry:0},{n:'back',len:W,x:0,z:-D/2,ry:PI},{n:'left',len:D,x:-W/2,z:0,ry:-PI/2},{n:'right',len:D,x:W/2,z:0,ry:PI/2}];
 for(const sd of sides){const g=H.grp(parent,sd.x,0,sd.z,sd.ry),n=Math.ceil(sd.len/1.6),pw=sd.len/n;
  for(let i=0;i<n;i++){const x0=-sd.len/2+i*pw,x1=x0+pw,xc=(x0+x1)/2;K.box(.06,hF,.06,post,x0,hF/2,0,g);K.box(.14,.01,.14,M.dark,x0,.005,0,g);
   const gap=sd.n==='front'&&opt.gap&&x1>opt.gap[0]+.01&&x0<opt.gap[1]-.01,door=sd.n==='front'&&opt.door!=null&&opt.door>=x0&&opt.door<x1;
   if(gap){for(const gx of[x0,x1]){K.box(.07,1.3,.07,haz,gx,.65,.0,g);K.box(.02,1.1,.03,M.dark,gx+(gx===x0?.045:-.045),.7,0,g);K.box(.1,.02,.1,M.dark,gx,.01,0,g)}continue}
   if(door){const dw=Math.min(.95,pw-.1);K.box(dw,hF-.2,.04,frameM,xc,hF/2+.02,.03,g);mesh(K,g,dw-.08,hF-.3,xc,hF/2+.02,.052);K.box(dw-.06,.03,.03,frameM,xc,hF-.1,.03,g);K.box(dw-.06,.03,.03,frameM,xc,.15,.03,g);
    H.handle(g,xc+dw/2-.1,1.05,.06,.2,true);K.box(.06,.12,.05,K.mat(0xe8c228,.2,.5),xc-dw/2-.03,1.2,.06,g);K.box(.03,.04,.03,M.dark,xc-dw/2+.03,1.2,.055,g);continue}
   if(opt.walls){K.box(pw-.06,hF-.1,.04,wallM,xc,.1+(hF-.1)/2,0,g);K.box(pw-.06,.03,.05,frameM,xc,hF-.03,0,g);if(sd.n==='front'&&i===Math.floor(n/2))K.box(pw*.6,.8,.012,P.tint,xc,1.4,.023,g)}
   else{K.box(pw-.06,.035,.035,frameM,xc,hF-.03,0,g);K.box(pw-.06,.035,.035,frameM,xc,.15,0,g);mesh(K,g,pw-.06,hF-.2,xc,hF/2+.02,0)}}}}
// cell operator panel: a pedestal with screen, keypad, e-stop, lamp tower; floor marking round the cell
function cellPanel(K,H,parent,s,x,z){const P=H.P,M=K.M,g=H.grp(parent,x,0,z);K.box(.42,1.1,.32,K.mat(0x8f969b,.4,.55),0,.55,0,g);K.box(.46,.04,.36,M.dark,0,.02,0,g);
 const t=H.grp(g,0,1.1,.02);t.rotation.x=-.35;K.box(.42,.3,.3,K.mat(0xd7d9d6,.2,.55),0,.15,0,t);H.screen(t,0,.17,.151,.3,.18,H.card(s));H.keypad(t,-.12,.04,.151,3,1,.02);H.estop(t,.14,.04,.151);
 H.lampTower(g,.16,1.3,-.1);return g}
function floorMarks(K,H,parent,W,D,inset=.45){const P=H.P;for(const sz of[-1,1])K.box(W+inset*2,.004,.07,P.yellow,0,.004,sz*(D/2+inset),parent);for(const sx of[-1,1])K.box(.07,.004,D+inset*2,P.yellow,sx*(W/2+inset),.004,0,parent)}

// === robotArm: a six-axis robot with its controller (opts: controller, gripper, pallet, count, fence) ==================
MB.add('robotArm',(K,s)=>{const {H,P,M,T,g,o}=setup(K,s,{controller:'auto',gripper:'auto',pallet:false,count:0,fence:false});
 const q=parseRobot(s,o),n=clamp(o.count||s.count||1,1,3),py=o.pallet?.16:0,small=q.ctl==='c4compact'||q.ctl==='c5micro';
 const [cw,cd]=CTL[q.ctl]||CTL.c4,arms=[];
 if(n===1){const Bw=clamp(.27*q.reach,.24,.95),gap=o.pallet?Math.max(.3,1.3-Bw/2-cw/2):.3;
  const rx=-(gap+cw)/2+(small?-.15:0),cx=rx+Bw/2+gap+cw/2+(small?.25:0);
  if(o.pallet){H.pallet(g,rx,0,0,Math.max(1.2,Bw+.3),Math.max(.8,Bw+.3));H.pallet(g,cx+(small?.2:0),0,0,1.2,.8)}
  const arm=buildArm(K,H,g,Object.assign({},q,{x:rx,y:py,z:0}),s);arms.push(arm);
  const c=buildController(K,H,g,q.ctl,s,cx,py,small?-.1:0,0);robotCable(K,H,g,c.cable,arm.conn)}
 else{const sp=clamp(q.reach*.55+.6,.9,2.4);
  for(let i=0;i<n;i++){const x=(i-(n-1)/2)*sp;if(o.pallet)H.pallet(g,x,0,small?0:.1,Math.min(sp-.1,1.2),small?1.0:.8);
   const arm=buildArm(K,H,g,Object.assign({},q,{x,y:py,z:small?.12:.1,phase:i*1.1}),s);arms.push(arm);
   const cz=small?-.32:-(clamp(.27*q.reach,.24,.95)/2+.35+cd/2),c=buildController(K,H,g,q.ctl,s,small?x-.05:x,py,cz,small?PI:0);
   if(!small)robotCable(K,H,g,c.cable,[arm.conn[0],arm.conn[1],arm.conn[2]+.3])}}
 if(o.fence){const bb=new T.Box3().setFromObject(g),sz=bb.getSize(new T.Vector3());const W=sz.x+1.2,D=sz.z+1.2;const fg=H.grp(g,(bb.min.x+bb.max.x)/2,0,(bb.min.z+bb.max.z)/2);fence(K,H,fg,W,D,2.0,{door:-W/2+.8});floorMarks(K,H,fg,W,D,.3)}
 const height=new T.Box3().setFromObject(g).max.y;
 return {group:g,height,update:(t,running)=>{for(const a of arms)a.update(t,running)}};
});

// === robotCell: robots inside a safety cell (opts: robots 1–4, purpose grinding|laser|press|handling) ===================
MB.add('robotCell',(K,s)=>{const {H,P,M,T,g,o}=setup(K,s,{robots:0,purpose:'auto'});
 const text=[s.name,s.type,s.note].filter(Boolean).join(' ');
 const purpose=o.purpose&&o.purpose!=='auto'?o.purpose:/grind/i.test(text)?'grinding':/laser/i.test(text)?'laser':/press|panel/i.test(text)?'press':'handling';
 const q=parseRobot(s,o);if((purpose==='grinding'||purpose==='laser')&&!/kuka|fanuc/i.test(text)){q.make='abb';q.series='abb';q.ctl='irc5';if(q.reach<2)q.reach=2.55;q.payload=Math.max(q.payload,150)}
 const n=clamp(o.robots||(purpose==='grinding'?4:1),1,4);
 const W=clamp(s.w||(n>=3?7:purpose==='press'?6:5),3.5,9),D=clamp(s.d||(purpose==='press'?4.5:4),3,6),FH=purpose==='laser'?2.4:2.0;
 const sp=W/(n+1),reach=clamp(Math.min(q.reach,sp*1.05,D*.55),.6,3.1);
 q.grip=purpose==='grinding'?'spindle':purpose==='laser'?'laser':purpose==='press'?'vacuum':'jaw';
 const [cw,cd]=CTL[q.ctl]||CTL.c4,arms=[],rz=purpose==='press'?-D*.05:-D*.12,steelM=K.mat(0x6d7378,.5,.5),tableM=K.mat(0x55595d,.4,.6);
 const xs=[];for(let i=0;i<n;i++)xs.push(purpose==='press'?-W/2+1.6:(i-(n-1)/2)*sp);
 xs.forEach((x,i)=>{arms.push(buildArm(K,H,g,Object.assign({},q,{reach,x,z:rz,pose:{a1:0,a2:-.15,a3:.15},phase:i*1.3}),s));
  const cz=-D/2+cd/2+.15,cx=n===1?x-1.4:x,c=buildController(K,H,g,q.ctl,s,cx,0,cz,0);robotCable(K,H,g,c.cable,arms[i].conn)});
 if(purpose==='grinding'){// workpiece tables, the extraction duct with a hood over each table, the abrasive disc rack
  xs.forEach(x=>{const tz=rz+reach*.55;K.box(.8,.06,.8,tableM,x,.82,tz,g);for(const sx of[-1,1])for(const sz of[-1,1])K.box(.05,.79,.05,steelM,x+sx*.36,.395,tz+sz*.36,g);K.box(.3,.12,.2,K.mat(0x8a8d90,.6,.4),x,.91,tz,g);
   K.cyl(.09,.5,steelM,x,2.0,tz,g,'y',16);K.cyl(.22,.2,steelM,x,1.65,tz,g,'y',20,.09);K.cyl(.09,.3,steelM,x,2.4,tz,g,'y',16);K.pipe([[x,2.5,tz],[x,2.6,tz-.3],[x,2.6,-D/2+.6]],.09,steelM,g)});
  K.box(W-.8,.3,.3,steelM,0,2.6,-D/2+.6,g);K.cyl(.2,1.0,steelM,-W/2+.6,3.1,-D/2+.6,g,'y',20);K.cyl(.28,.12,steelM,-W/2+.6,3.62,-D/2+.6,g,'y',20);
  const rk=H.grp(g,W/2-.7,0,D/2-.9);K.box(.06,1.3,.06,steelM,0,.65,0,rk);K.box(.3,.02,.3,M.dark,0,.01,0,rk);for(let i=0;i<4;i++){K.cyl(.012,.12,M.steel,0,.5+i*.22,.06,rk,'z',8);K.cyl(.1,.012,K.mat(0x4a4540,.1,.9),0,.5+i*.22,.1,rk,'z',24)}}
 else if(purpose==='laser'){// rotary turning table with the divider, the ELEN Blade laser source, fume extraction
  const x=xs[0],tz=rz+reach*.6;K.cyl(.25,.78,M.dark,x,.39,tz,g,'y',20);const rt=H.grp(g,x,.8,tz);K.cyl(.7,.05,tableM,0,0,0,rt,'y',40);K.box(1.4,.6,.04,K.mat(0x8f969b,.4,.5),0,.32,0,rt);
  for(const sz of[-1,1]){K.box(.5,.25,.3,K.mat(0x6b5a4a,.2,.7),0,.15,sz*.38,rt);K.box(.48,.02,.28,M.steel,0,.035,sz*.38,rt)}
  const lc=H.grp(g,W/2-.75,0,-D/2+.8);K.box(.7,1.5,.7,K.mat(0xd8442a,.3,.5),0,.75,0,lc);K.box(.74,.06,.74,M.dark,0,.03,0,lc);K.box(.6,.4,.02,M.dark,0,1.1,.36,lc);H.screen(lc,0,1.1,.37,.42,.26,H.card(s));
  decal(K,lc,'ELEN Blade RF 333',.5,.08,0,.55,.361,'#d8442a','#ffffff',0,0,0,.5,800);H.keypad(lc,-.2,.3,.361,3,2,.02);H.estop(lc,.25,.3,.361);H.grille(lc,.4,.3,.351,.5,0,PI/2);
  K.pipe([[W/2-.75,1.5,-D/2+.8],[W/2-.8,2.2,-D/2+.8],[x+.3,2.3,rz-.3],[x+.2,1.6,rz-.25]],.015,K.mat(0xd8822e,.1,.7),g);
  K.pipe([[x,2.3,tz],[x,2.5,tz],[x,2.6,-D/2+.5],[x,3.5,-D/2+.5]],.1,steelM,g);K.cyl(.26,.14,steelM,x,2.3,tz,g,'y',24,.12);
  g.userData.rt=rt}
 else if(purpose==='press'){// pressing table 2.5 × 1 m with the top beam and two cylinders, a scissor lift table, control cabinet
  const px=W/2-1.7,pz=rz+.3,orange=K.mat(0xf26522,.2,.5);K.box(2.5,.1,1.0,tableM,px,.85,pz,g);K.box(2.6,.08,1.1,M.dark,px,.05,pz,g);
  for(const sx of[-1,1]){K.box(.12,.75,1.0,steelM,px+sx*1.18,.46,pz,g);K.box(.1,1.4,.1,orange,px+sx*1.2,1.6,pz-.45,g);K.box(.1,1.4,.1,orange,px+sx*1.2,1.6,pz+.45,g)}
  K.box(2.5,.2,1.0,orange,px,2.3,pz,g);for(const sx of[-1,1]){K.cyl(.09,.5,steelM,px+sx*.6,2.0,pz,g,'y',16);K.cyl(.05,.5,M.steel,px+sx*.6,1.55,pz,g,'y',12)}K.box(2.3,.08,.9,K.mat(0x8f969b,.4,.5),px,1.3,pz,g);
  K.box(1.2,.03,.5,K.mat(0xdedbd2,.1,.6),px,1.1,pz,g);
  const lt=H.grp(g,px-.2,0,pz+1.2);K.box(1.2,.06,.8,tableM,0,.6,0,lt);K.box(1.2,.05,.8,M.dark,0,.025,0,lt);for(const sx of[-1,1]){const b=K.box(.05,.75,.04,steelM,sx*.25,.32,.35,lt);b.rotation.z=sx*.6;const b2=K.box(.05,.75,.04,steelM,-sx*.25,.32,-.35,lt);b2.rotation.z=sx*.6}
  const cb=H.grp(g,W/2-.6,0,D/2-.9);K.box(.6,1.6,.4,K.mat(0x8f969b,.4,.55),0,.8,0,cb);H.door(cb,.5,1.2,0,.75,.2,P.light,false,1);H.screen(cb,0,1.45,.21,.3,.18,H.card(s))}
 else{// handling: a roller conveyor stub through the loading opening, parts boxes on it
  const cx=W/2-1.4,cz=D*.1;for(const sx of[-1,1])K.box(.08,.1,3.0,K.mat(0x3d7ab8,.3,.5),cx+sx*.33,.72,cz,g);for(let i=0;i<22;i++)K.cyl(.03,.6,M.steel,cx,.74,cz-1.4+i*.133,g,'x',12);
  for(const z of[cz-1.2,cz-.2,cz+.8])for(const sx of[-1,1])K.box(.05,.7,.05,steelM,cx+sx*.3,.35,z,g);K.box(.4,.3,.5,K.mat(0xb58a52,0,.85),cx,.92,cz-.3,g);K.box(.4,.3,.5,K.mat(0xb58a52,0,.85),cx,.92,cz+.5,g)}
 const gapX=purpose==='handling'?[W/2-2.0,W/2-.8]:[W/2-2.2,W/2-1.0];
 fence(K,H,g,W,D,FH,{door:-W/2+.9,gap:purpose==='laser'?null:gapX,walls:purpose==='laser'});
 cellPanel(K,H,g,s,W/2-.3,D/2+.45);floorMarks(K,H,g,W,D,.4);
 const height=new T.Box3().setFromObject(g).max.y;
 return {group:g,height,update:(t,running)=>{for(const a of arms)a.update(t,running);if(g.userData.rt&&running)g.userData.rt.rotation.y=t*.25}};
});

// === scaraRobot: KUKA SCARA labeling cell on an aluminium-profile bench ==================================================
MB.add('scaraRobot',(K,s)=>{const {H,P,M,T,g,o}=setup(K,s,{});
 const W=1.8,D=.9,cream=K.mat(0xd9d0b6,.2,.6),white=K.mat(0xe8e6e0,.25,.45),orange=K.mat(0xf26522,.2,.5),dk=M.dark;
 // bench: aluminium profile frame with a top plate, an upper frame carrying the printer shelf, levelling feet
 H.frame(g,W,.85,D,0,.0,0,.04);K.box(W,.02,D,P.light,0,.86,0,g);H.feet(g,W,D,.04,.06);
 H.frame(g,.7,1.0,.5,-W/2+.4,.87,-D/2+.3,.04);K.box(.66,.015,.46,P.light,-W/2+.4,1.5,-D/2+.3,g);
 // product conveyor stub through the cell at belt height .95 with side rails, a drive motor, boxes on the belt
 for(const sz of[-1,1])K.box(W+.2,.05,.02,P.alu,0,.97,.2+sz*.13,g);K.box(W+.2,.012,.22,P.belt,0,.955,.2,g);for(let i=0;i<4;i++)K.box(.04,.08,.03,P.alu,-W/2+.2+i*(W-.4)/3,.9,.2,g);
 K.cyl(.035,.12,dk,W/2+.05,.94,.4,g,'z',12);K.box(.16,.1,.12,K.mat(0xb58a52,0,.85),-.3,1.012,.2,g);K.box(.16,.1,.12,K.mat(0xb58a52,0,.85),.45,1.012,.2,g);
 // SCARA pedestal (cream cast column with a foot plate) and the KR 12 R850 SCARA on it
 K.box(.34,.03,.34,cream,.35,.885,-.2,g);K.box(.26,.5,.26,cream,.35,1.13,-.2,g);K.box(.3,.03,.3,cream,.35,1.385,-.2,g);
 const sb=H.grp(g,.35,1.4,-.2);K.cyl(.09,.24,white,0,.12,0,sb,'y',24);K.cyl(.095,.02,orange,0,.25,0,sb,'y',24);decal(K,sb,'KUKA',.1,.03,0,.1,.096,'#e8e6e0','#f26522',0,0,0,.6,800);
 const l1=H.grp(sb,0,.3,0);K.box(.4,.1,.14,white,.2,0,0,l1);K.cyl(.07,.1,white,0,0,0,l1,'y',20);K.cyl(.065,.1,white,.4,0,0,l1,'y',20);K.cyl(.055,.03,orange,0,.065,0,l1,'y',20);decal(K,l1,'A1',.04,.025,.1,.0,.071,'#f2f1ec','#1c1b18',0,0,0,.6,800);
 const l2=H.grp(l1,.4,-.11,0);K.box(.38,.09,.13,white,.19,0,0,l2);K.cyl(.065,.09,white,0,0,0,l2,'y',20);K.box(.1,.12,.13,white,.4,.02,0,l2);K.box(.06,.03,.08,orange,.43,.085,0,l2);
 const qg=H.grp(l2,.4,0,0);K.cyl(.02,.5,M.steel,0,-.08,0,qg,'y',12);K.cyl(.032,.14,dk,0,.17,0,qg,'y',12);K.box(.08,.04,.07,dk,0,-.34,0,qg);K.box(.06,.012,.05,white,0,-.365,0,qg);
 K.pipe([[0,.18,-.08],[.2,.3,-.12],[.4,.28,-.1],[.55,.1,-.06]],.01,P.hose,l1);
 // Keyence SR-5000 code reader on an aluminium post over the conveyor, Zebra ZT411 label printer on the shelf
 K.box(.03,.55,.03,P.alu,-.3,1.15,.0,g);K.box(.2,.03,.03,P.alu,-.21,1.41,.0,g);K.box(.07,.05,.09,K.mat(0x2a2c2f,.3,.6),-.12,1.38,.1,g);K.cyl(.016,.02,K.mat(0x3d6fa8,.6,.2),-.12,1.36,.155,g,'z',12);decal(K,g,'KEYENCE SR-5000',.07,.014,-.12,1.4,.146,'#2a2c2f','#ecebe5',0,0,0,.5,700);
 const pr=H.grp(g,-W/2+.4,1.51,-D/2+.3);K.box(.27,.32,.46,K.mat(0x3a3c3e,.3,.55),0,.16,0,pr);K.box(.27,.06,.46,K.mat(0x55585b,.3,.55),0,.35,0,pr);K.box(.012,.16,.2,P.tint,.137,.2,-.05,pr);K.cyl(.07,.1,K.mat(0xe3b82e,.1,.6),.1,.22,-.05,pr,'x',20);
 decal(K,pr,'ZEBRA',.1,.03,-.02,.08,.231,'#3a3c3e','#ecebe5',0,0,0,.6,900);K.box(.2,.004,.02,P.light,0,.12,.235,pr);H.screen(pr,.05,.26,.231,.09,.06,null);
 // KR C4 compact controller under the bench with its smartPAD, an HMI, light-curtain posts at both ends of the conveyor
 buildController(K,H,g,'c4compact',s,.3,0,-.1,0);
 const hm=H.grp(g,W/2-.25,0,D/2+.15);K.box(.05,1.3,.05,P.alu,0,.65,0,hm);H.screen(hm,0,1.45,.03,.28,.18,H.card(s));H.estop(hm,.12,1.25,.04);
 for(const sx of[-1,1]){K.box(.05,.5,.05,hazMat(K),sx*(W/2+.1),1.2,.42,g);K.box(.02,.4,.025,dk,sx*(W/2+.07),1.2,.42,g)}
 H.nameplate(g,s,0,.5,D/2+.03,.5,.13);H.warn(g,-.6,.3,D/2+.03,0,.08);
 return {group:g,height:2.0,update:(t,running)=>{if(!running)return;l1.rotation.y=.4*Math.sin(t*.7);l2.rotation.y=.6*Math.sin(t*.7+1.2);qg.position.y=-.06*(.5+.5*Math.sin(t*1.4))}};
});

// === masteringSet: KUKA EMD mastering cases on a bench, laptop, a small robot on a pedestal being mastered ===============
MB.add('masteringSet',(K,s)=>{const {H,P,M,T,g,o}=setup(K,s,{});
 const W=1.6,D=.8,top=.85,black=K.mat(0x1f2022,.3,.6),foam=foamMat(K),dkf=K.mat(0x2a2b2d,0,.95),steel=M.steel;
 K.box(W,.04,D,P.light,0,top-.02,0,g);H.legs(g,W,D,top-.04,.04,steel);for(const sz of[-1,1])K.box(W-.1,.04,.04,steel,0,.2,sz*(D/2-.06),g);
 const kase=(x,z,ry)=>{const c=H.grp(g,x,top,z,ry);K.box(.5,.1,.4,black,0,.05,0,c);K.box(.46,.03,.36,dkf,0,.1,0,c);for(const sx of[-1,1])K.box(.05,.015,.012,K.mat(0xc8312a,.2,.5),sx*.15,.1,.2,c);
  const lid=H.grp(c,0,.1,-.2);lid.rotation.x=-1.9;K.box(.5,.09,.4,black,0,.045,.2,lid);plane(K,lid,.46,.36,foam,0,.091,.2,0,-PI/2);
  // foam insert with the cut-outs: the EMD measuring tool, its electronic box, the coiled cable, a plug
  K.box(.2,.02,.07,dkf,.08,.11,.1,c);K.box(.12,.02,.08,dkf,.08,.11,-.08,c);K.box(.2,.02,.2,dkf,-.12,.11,0,c);
  K.cyl(.012,.14,steel,.08,.118,.1,c,'x',12);K.cyl(.016,.03,M.dark,.16,.118,.1,c,'x',12);K.box(.11,.03,.05,K.mat(0x2e3033,.3,.6),.08,.125,-.08,c);decal(K,c,'KUKA EMD',.07,.016,.08,.141,-.08,'#2e3033','#ecebe5',0,-PI/2,0,.5,700);
  for(let i=0;i<3;i++)K.torus(.06,.005,P.black,-.12,.112+i*.006,0,c,'y',24);K.box(.03,.02,.02,M.dark,-.12,.12,.09,c);return c};
 kase(-.42,-.08,.05);kase(.12,-.08,-.04);
 // KUKA brochures on the bench front, the laptop at the right
 decal(K,g,'ELECTRONIC MASTERING SET',.3,.21,-.3,top+.003,.25,'#f4f2ec','#f26522',0,-PI/2,.1,.14,800);decal(K,g,'KUKA',.26,.19,.05,top+.003,.26,'#f26522','#ffffff',0,-PI/2,-.08,.3,900);
 const lp=H.grp(g,.55,top,.18,-.3);K.box(.33,.018,.23,M.dark,0,.009,0,lp);K.box(.2,.003,.08,K.mat(0x55585b,.3,.6),0,.019,.02,lp);const sc=H.grp(lp,0,.018,-.115);sc.rotation.x=-1.25;K.box(.33,.22,.01,M.dark,0,.11,0,sc);K.box(.3,.19,.004,P.glow,0,.11,.007,sc);
 // small KR 3 AGILUS on a cream pedestal beside the bench, with the mastering tool on its A1 reference mark
 const px=W/2+.55;K.box(.36,.03,.36,K.mat(0xd9d0b6,.2,.6),px,.015,0,g);K.box(.26,.7,.26,K.mat(0xd9d0b6,.2,.6),px,.36,0,g);K.box(.32,.03,.32,K.mat(0xd9d0b6,.2,.6),px,.725,0,g);
 const arm=buildArm(K,H,g,{make:'kuka',series:'agilus',payload:3,reach:.541,grip:'none',x:px,y:.74,z:0,pose:{a1:-.4,a2:-.2,a3:-.1}},{name:'KUKA KR 3 R540',lot:s.lot});
 K.cyl(.012,.09,steel,px-.1,.74+.2,-.1,g,'y',10);K.cyl(.016,.03,M.dark,px-.1,.74+.26,-.1,g,'y',10);K.pipe([[px-.1,1.02,-.1],[px-.3,1.05,-.2],[px-.6,.9,-.1],[.6,top+.02,.1]],.005,P.black,g);
 H.nameplate(g,s,0,.6,D/2+.03,.5,.13);
 return {group:g,height:1.5,update:(t,running)=>{arm.update(t,running)}};
});
})();
