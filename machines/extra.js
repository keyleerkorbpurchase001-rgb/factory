// Extra portal machine kinds that no family file covers (see machines/KINDS.md for the conventions).
(function(){
'use strict';
// Bridge-type coordinate measuring machine (Carl Zeiss Contura G2 / Prismo): a black granite table on a steel base
// cabinet, a moving bridge (two white columns and a cross beam), the X carriage with the vertical ram and an
// articulating probe head, a workpiece on the table, the control cabinet with the joystick console and a PC desk.
MB.add('cmm',(K,s)=>{const T=K.THREE,H=MB.H(K),P=H.P,g=new T.Group();const w=Math.max(1.8,s.w||2.2),d=Math.max(1.2,s.d||1.5);
 const granite=K.mat(0x26282b,.1,.45),white=P.white,base=K.mat(0x4b5258,.3,.6);
 // base cabinet, granite table, levelling feet
 K.box(w-.3,.62,d-.3,base,0,.31,0,g);H.feet(g,w-.3,d-.3,.05,.12);K.box(w,.22,d,granite,0,.73,0,g);
 for(let i=0;i<6;i++)for(let j=0;j<4;j++)K.cyl(.008,.004,P.steel,-w/2+.25+i*(w-.5)/5,.842,-d/2+.2+j*(d-.4)/3,g,'y',8);
 // bridge: columns on guide rails along x, cross beam, X carriage, Z ram, probe head
 for(const sz of[-1,1])K.box(w-.1,.05,.06,P.alu,0,.865,sz*(d/2-.06),g);
 const bridge=new T.Group();bridge.position.set(-w*.15,0,0);g.add(bridge);
 for(const sz of[-1,1]){K.box(.16,1.05,.14,white,0,.86+.525,sz*(d/2-.07),bridge);K.box(.22,.06,.2,P.dark,0,.89,sz*(d/2-.07),bridge)}
 K.box(.16,.18,d+.1,white,0,1.86,0,bridge);K.box(.1,.02,d-.2,P.alu,.09,1.8,0,bridge);
 const car=new T.Group();car.position.z=-.1;bridge.add(car);K.box(.22,.26,.26,white,0,1.86,0,car);const ram=new T.Group();ram.position.y=0;car.add(ram);
 K.box(.07,1.0,.07,P.alu,0,1.42,0,ram);K.cyl(.03,.08,P.dark,0,.9,0,ram,'y',12);K.cyl(.012,.06,P.steel,0,.83,0,ram,'y',8);K.sphere(.008,P.red,0,.8,0,ram,8);
 K.cyl(.025,.05,P.dark,.04,.88,0,ram,'x',10);
 // workpiece (a pressed part) and the fixture plate
 K.box(.5,.03,.35,P.alu,.25,.86,.05,g);const part=K.box(.4,.09,.25,K.mat(0x7c8186,.6,.4),.25,.92,.05,g);K.box(.12,.05,.25,K.mat(0x7c8186,.6,.4),.1,.99,.05,g);
 // control cabinet with the joystick console, screen on an arm, PC desk
 const cx=w/2+.55;K.box(.6,1.1,.6,P.light,cx,.55,-.1,g);H.door(g,.5,.9,cx,.55,.2,P.light,false,1);H.grille(g,.3,.2,cx+.3,.3,-.1,Math.PI/2);
 K.box(.5,.05,.4,P.dark,cx,1.14,0,g);K.box(.3,.03,.22,P.grey,cx,1.165,.05,g);K.cyl(.012,.12,P.black,cx-.07,1.23,.08,g,'y',8);K.sphere(.02,P.red,cx-.07,1.3,.08,g,8);K.cyl(.012,.12,P.black,cx+.07,1.23,.08,g,'y',8);K.sphere(.02,P.black,cx+.07,1.3,.08,g,8);
 H.keypad(g,cx+.02,1.17,.17,4,2,.02);H.estop(g,cx+.2,.98,.31);
 K.cyl(.02,.55,P.steel,cx,1.4,-.25,g,'y',8);H.screen(g,cx,1.72,-.2,.46,.3,H.card(s));
 const desk=K.box(.9,.04,.6,P.light,cx+.95,.74,0,g);H.legs(g,.9,.6,.72,.04,P.steel);for(const o of[desk])o.position.x=cx+.95;g.children.filter(o=>o.isMesh&&o.geometry.parameters&&o.geometry.parameters.height===.72).forEach(o=>o.position.x+=cx+.95);
 H.screen(g,cx+.95,1.0,-.15,.5,.32,null);K.box(.42,.015,.16,P.dark,cx+.9,.76,.12,g);K.box(.18,.38,.42,P.dark,cx+1.3,.95,0,g);
 // nameplate and brand band on the base cabinet, warning label, cable to the floor trunking
 H.nameplate(g,s,-w*.2,.45,d/2-.14,.6,.15);H.logoBand(g,s,w-.5,0,.6,d/2-.145,.05);H.warn(g,w*.35,.25,d/2-.14);
 K.pipe([[cx,0.2,-.4],[cx,.05,-.45],[-w*.2,.05,-.45],[-w*.2,.6,-d/2+.1]],.015,P.hose,g);
 return {group:g,height:2.0,update:(t,run)=>{bridge.position.x=-w*.15+(run?Math.sin(t*.5)*w*.18:0);car.position.z=-.1+(run?Math.sin(t*.8)*d*.2:0);ram.position.y=run?-.05+Math.sin(t*1.3)*.08:0}};
});
})();
