// The home page, ported from the old index.html: the navy hero (.hx) with the headline, the lede, the two buttons and
// a live, to-scale drawing of the main hall of a plant (tabs Electronics / Refrigerators / Press hardening); the
// plants section (.hp) with one card per plant; the five views (.hv); the footer (.hf).
//
// The hall drawing (hxSVG in drawings.js) is the floor and every station box of MAP2D with the flow of each line, drawn
// in by CSS animation. Pointing at (or tapping) a station shows its machine on the card in the rail, with a yellow
// lead line from the station to the card; a second click on the selected station opens the machine sheet. On its own
// the drawing picks the plant's showcase station (HXF) once drawn, then walks along the plant's lines station by
// station every few seconds until the visitor points at the drawing or switches the tab.
import React,{useCallback,useEffect,useLayoutEffect,useRef,useState} from 'react';
import {D,F,H,HXH,HXT,HXF,HOMEIMG,KEYPLAN,catBy,lineName,lotPh,himg,hashSub,reduceMotion} from './data.js';
import {hxSVG,hxScale} from './drawings.js';
import {openRow} from './Sheet.jsx';

// The plant cards: the photo (a home image, or a catalogue photo of the lot), the key plan of the country, the text
// and what is inside the plant (its halls, or for the one-hall press hardening plant the areas inside the hall).
const HOMEP={
 f1:{img:'f1_main',lot:'8060065',ph:0,kp:'sk',desc:'Consumer-display electronics, from SMT assembly and LED module production to injection molding, IC programming, test and quality labs, robot cells, packing and the warehouse.',inT:'Halls'},
 f2:{img:'hero_f2',lot:'6022004',ph:0,kp:'hu',desc:'A domestic refrigerator factory laid out along the refrigerator process, from coil cutting and panel forming to liner thermoforming, evaporators, powder coating, cabinet and door foaming, and packing.',inT:'Halls'},
 f3:{img:'f3_side',lot:'HF-1',ph:1,kp:'se',desc:'Hot stamping of ultra-high-strength car body parts, from blanking through the furnace and hydraulic press to 3D laser trimming, shot blasting and CMM inspection, with a deep drawing press, tool shop and robot grinding cell.',inT:'Inside the hall',
  inside:['Blanking lines','Continuous furnaces','Hydraulic press hardening','3D laser trimming cells','Shot blasting','CMM inspection','Deep drawing press','Tool shop','Robot grinding cell']}};
// The five views, each a screenshot of the view in light and dark (HOMEIMG v_*_l / v_*_d) linking to an example.
const HVIEWS=[
 {c:'w',n:'Flow',t:'Every line as a row of stations, with the original photograph of the machine at each step.',href:hashSub('f1','flow'),img:'v_flow'},
 {c:'',n:'2D station map',t:'Each hall drawn to scale, with every station numbered in process order and the flow of each line.',href:hashSub('f1','map','smt'),img:'v_map'},
 {c:'',n:'Live 3D halls',t:'Walk through each hall, follow the process tour and tap any machine for its sheet.',href:hashSub('f1','3d'),img:'v_3d'},
 {c:'',n:'Plant layout',t:'The site plan, with every hall seen from above as it is built in 3D.',href:hashSub('f2','layout'),img:'v_layout'},
 {c:'',n:'Machine sheets',t:'Photographs, catalogue sheets and specifications for every machine, with the machine list and brochure.',href:hashSub('f1','machines'),img:'v_sheet'}];

const f1=v=>v.toFixed(1);
const CYCLE_MS=5200;

// the outline of the country with the plant's region highlighted
function KeyPlan({c,label}){const k=KEYPLAN[c],land=KEYPLAN[k.land]?KEYPLAN[k.land].land:k.land;
 return <svg className="kp" viewBox={`0 0 ${KEYPLAN.vb[0]} ${KEYPLAN.vb[1]}`} role="img" aria-label={label}><path className="l" d={land}/><path className="c" d={k.c}/></svg>}

// the caption under a plant card's photo: the line and hall the lot works in, and the lot's title
function PhotoCap({fk,lot}){const r=D.rows.find(r=>r.f===fk&&r.line&&(r.lot===lot||(r.lots||[]).includes(lot)));const c=catBy[fk+':'+lot];
 return <figcaption>{r?<><b>{lineName(r.hall,r.line)}</b>, {H[r.hall].name}<br/></>:null}{c?c.title:(r?r.name:'')}</figcaption>}

// ---------- the hero drawing ----------
function HeroDrawing(){
 const [cur,setCur]=useState('f1');
 const [draw,setDraw]=useState(null);        // {svg,S,its,height,w} of the drawing on show
 const [sel,setSel]=useState(null);          // the row index on the card
 const [lead,setLead]=useState(null);        // {vb, d, s:[x,y], t:[x,y], anim}
 const fig=useRef(null),box=useRef(null),card=useRef(null),drawn=useRef(false),auto=useRef(0),user=useRef(false),leadAnim=useRef(false),selRef=useRef(null);
 selRef.current=sel;
 const h=HXH[cur],f=F[cur];

 // Draw the hall of plant fk into the box, at the box's width (desktop: capped to the viewport height).
 const paint=useCallback((fk,anim)=>{const el=box.current;if(!el)return;const k=drawn.current?.6:1;
  const wide=innerWidth>1080,r=hxSVG(HXH[fk],anim,k,el.clientWidth,wide,innerHeight);drawn.current=true;
  setDraw({...r,anim,k,w:el.clientWidth,fk})},[]);

 // Show a station on the card; lead: animate the lead line in.
 const pick=useCallback((ri,anim)=>{leadAnim.current=!!anim;setSel(ri)},[]);
 const stopAuto=()=>{clearTimeout(auto.current);user.current=true};

 // switching the plant redraws the hall with its draw-in animation and starts the station walk again
 const show=useCallback(fk=>{clearTimeout(auto.current);user.current=false;setSel(null);setLead(null);setCur(fk);paint(fk,true)},[paint]);
 useLayoutEffect(()=>{paint('f1',true)},[paint]);

 // The showcase station once the drawing has drawn in, then a walk along the plant's lines (not under reduced motion,
 // not once the visitor has pointed at the drawing, and paused while the page is in the background or the hero is
 // scrolled away).
 useEffect(()=>{if(!draw)return;clearTimeout(auto.current);if(user.current)return;
  const reduce=reduceMotion(),first=selRef.current==null;
  const order=draw.its.filter(it=>it.r&&it.r.line&&it.r.kind!=='na'&&it.r.ph&&it.r.ph[0]).sort((a,b)=>a.r.line-b.r.line||a.r.step-b.r.step).map(it=>it.ri);
  const next=()=>{const i=order.indexOf(selRef.current);return order.length?order[(i+1)%order.length]:null};
  const tick=()=>{if(user.current)return;const vis=!document.hidden&&fig.current&&fig.current.getBoundingClientRect().bottom>0;if(vis){const n=next();if(n!=null)pick(n,true)}if(!reduce)auto.current=setTimeout(tick,CYCLE_MS)};
  if(first)auto.current=setTimeout(()=>{if(user.current)return;pick(HXF[draw.fk],true);if(!reduce)auto.current=setTimeout(tick,CYCLE_MS)},draw.anim&&!reduce?2600*draw.k:0);
  else if(!reduce)auto.current=setTimeout(tick,CYCLE_MS);
  return()=>clearTimeout(auto.current)},[draw,pick]);

 // the selected station is outlined in the drawing (the drawing is injected markup, so the class is set directly)
 useEffect(()=>{const el=box.current;if(!el)return;el.querySelectorAll('.hxt.sel').forEach(e=>e.classList.remove('sel'));if(sel!=null){const t=el.querySelector(`.hxt[data-r="${sel}"]`);if(t)t.classList.add('sel')}},[sel,draw]);

 // The lead line from the station to the card, in the figure's own pixels. Hidden (display:none) on phones, where
 // the card sits under the drawing.
 const measure=useCallback(anim=>{const fg=fig.current,el=box.current,cd=card.current&&card.current.firstElementChild;const svg=el&&el.querySelector('svg');
  const it=draw&&draw.its.find(i=>i.ri===selRef.current);
  if(!fg||!svg||!it||!cd||innerWidth<=760){setLead(null);return}
  const fr=fg.getBoundingClientRect(),gr=svg.getBoundingClientRect(),cr=cd.getBoundingClientRect(),k=gr.width/(+svg.getAttribute('width')||gr.width);
  const sx=gr.left-fr.left+it.cx*k,sy=gr.top-fr.top+it.cy*k,tx=cr.left-fr.left-6,ty=cr.top-fr.top+Math.min(60,cr.height/2),mx=Math.max(sx+12,(gr.right-fr.left+cr.left-fr.left)/2);
  setLead({vb:`0 0 ${f1(fr.width)} ${f1(fr.height)}`,d:`M${f1(sx)},${f1(sy)}H${f1(mx)}V${f1(ty)}H${f1(tx)}`,s:[sx,sy],t:[tx,ty],anim,key:selRef.current+':'+(anim?Date.now():0)})},[draw]);
 useLayoutEffect(()=>{measure(leadAnim.current)},[sel,measure]);

 // On resize: redraw at the new width (keeping the station on the card) or just move the lead line.
 useEffect(()=>{let t=0;const fn=()=>{clearTimeout(t);t=setTimeout(()=>{const el=box.current;if(!el||!draw)return;if(Math.abs(el.clientWidth-draw.w)>8){leadAnim.current=false;paint(draw.fk,false)}else measure(false)},160)};
  addEventListener('resize',fn);return()=>{removeEventListener('resize',fn);clearTimeout(t)}},[draw,paint,measure]);
 // after a redraw that kept the selection, put the lead line back without animation
 useLayoutEffect(()=>{if(draw&&!draw.anim&&selRef.current!=null)measure(false)},[draw,measure]);

 const onOver=e=>{const t=e.target.closest&&e.target.closest('.hxt[data-r]');if(t&&+t.dataset.r!==selRef.current){stopAuto();pick(+t.dataset.r,true)}};
 const onClick=e=>{const t=e.target.closest&&e.target.closest('.hxt[data-r]');if(!t)return;stopAuto();const ri=+t.dataset.r;
  if(ri===selRef.current&&matchMedia('(hover:hover)').matches){const r=D.rows[ri];if(r&&r.kind!=='na')openRow(ri)}else pick(ri,true)};
 const tabKey=(e,i)=>{const d=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0;if(!d)return;e.preventDefault();const n=D.factories[(i+d+D.factories.length)%D.factories.length].key;
  show(n);const b=fig.current&&fig.current.querySelector(`#hxt-${n}`);if(b)b.focus()};

 const r=sel!=null?D.rows[sel]:null,where=r?(r.line?`${lineName(r.hall,r.line)}, step ${r.step}`:'Support equipment of the hall'):'';
 const sc=draw?hxScale(draw.S):null;
 return <figure className="hx-fig" ref={fig}>
  <svg className={'hx-lead'+(lead&&lead.anim?' on':'')} viewBox={lead?lead.vb:undefined} aria-hidden="true">{lead?<g key={lead.key}><path pathLength="1" d={lead.d}/><circle className="s" cx={f1(lead.s[0])} cy={f1(lead.s[1])} r="3.2"/><circle cx={f1(lead.t[0])} cy={f1(lead.t[1])} r="2.4"/></g>:null}</svg>
  <div className="hx-tabs" role="tablist" aria-label="Hall drawing">{D.factories.map((p,i)=><button key={p.key} type="button" role="tab" id={'hxt-'+p.key} aria-controls="hx-draw" aria-selected={p.key===cur} tabIndex={p.key===cur?0:-1} onClick={()=>{if(cur!==p.key)show(p.key)}} onKeyDown={e=>tabKey(e,i)}>{HXT[p.key]}</button>)}</div>
  <div className="hx-draw" id="hx-draw" role="tabpanel" aria-labelledby={'hxt-'+cur} ref={box} style={draw&&draw.height?{height:draw.height}:undefined} onMouseOver={onOver} onClick={onClick} dangerouslySetInnerHTML={{__html:draw?draw.svg:''}}/>
  <figcaption className="hx-rail">
   <div className="hx-tb"><b>{H[h].name}</b><span>{f.name+', '+f.place}</span>{sc?<svg className="hx-scale" width={sc.width} height="22" viewBox={sc.viewBox} aria-hidden="true" dangerouslySetInnerHTML={{__html:sc.svg}}/>:null}</div>
   <ul className="hx-key" aria-label="Key to the drawing"><li><i className="k1"/>Machine from the listing</li><li><i className="k2"/>Not available</li><li><i className="k3"/>Flow of the line</li></ul>
   <div className="hx-card" aria-live="polite" ref={card}>{!r?null:r.kind==='na'
    ?<div className="hx-cardb"><span className="ph na">Not available</span><span className="tx"><b>{r.station}</b><span className="m">No machine in the listing</span><span className="s">{where}</span></span></div>
    :<button className="hx-cardb" type="button" onClick={()=>{stopAuto();openRow(sel)}}><span className="ph">{r.ph[0]?<img src={r.ph[0]} alt=""/>:null}</span><span className="tx"><b>{r.station}</b><span className="m">{r.name}</span><span className="s">{where}</span><span className="go">Open the machine sheet</span></span></button>}</div>
   <p className="hx-hint"><span className="p">Point at any station to see its machine.</span><span className="t">Tap any station to see its machine.</span></p>
   <a className="hx-open" href={hashSub(cur,'map',h)}>Open the station map</a>
  </figcaption>
 </figure>}

export default function Home(){
 const explore=()=>{const el=document.getElementById('plants');if(el)el.scrollIntoView({behavior:reduceMotion()?'auto':'smooth',block:'start'})};
 return <div className="page home">
  <section className="hx" aria-labelledby="hx-title">
   <div className="hin hx-grid">
    <div className="hx-copy">
     <h1 id="hx-title">Complete plants, every machine in place.</h1>
     <p className="hx-lede">Three production plants, for electronics in Slovakia, refrigerators in Hungary and automotive press hardening in Sweden, laid out hall by hall and line by line with the original photographs of every machine.</p>
     <div className="hx-cta"><button className="hbtn" type="button" onClick={explore}>Explore the plants</button><a className="hbtn2" href={hashSub('f1','3d')}>Walk through a 3D hall</a></div>
    </div>
    <HeroDrawing/>
   </div>
  </section>
  <section className="hp" id="plants" aria-labelledby="hp-title">
   <div className="hin">
    <header className="hsec"><h2 id="hp-title">Choose a plant</h2><p>Each plant opens on its overview, with the site plan, the station map and flow of every line, the 3D halls and the full machine list.</p></header>
    <div className="hp-list">{D.factories.map((f,i)=>{const p=HOMEP[f.key];const inside=p.inside||f.halls.map(h=>H[h].name);
     return <article key={f.key} className={'hpl'+(i%2?' rev':'')} aria-labelledby={'hp-'+f.key}>
      <figure className="hpl-fig"><a href={'#'+f.key} tabIndex={-1} aria-hidden="true"><img src={himg(p.img,lotPh(f.key,p.lot,p.ph))} alt="" loading="lazy"/></a><PhotoCap fk={f.key} lot={p.lot}/></figure>
      <div className="hpl-tx">
       <div className="hpl-top"><div><h3 id={'hp-'+f.key}>{f.name}</h3><p className="hpl-loc">{f.place}</p></div><KeyPlan c={p.kp} label={'Location of the plant in Europe: '+f.place}/></div>
       <p className="hpl-desc">{p.desc}</p>
       <div className="hpl-in"><h4>{p.inT}</h4><ul>{inside.map(n=><li key={n}>{n}</li>)}</ul></div>
       <div className="hpl-act"><a className="btn md" href={'#'+f.key}>Open the plant</a><a className="hl" href={hashSub(f.key,'3d')}>Walk the 3D halls</a></div>
      </div>
     </article>})}</div>
   </div>
  </section>
  <section className="hv" aria-labelledby="hv-title">
   <div className="hin">
    <header className="hsec"><h2 id="hv-title">Five views of every plant</h2><p>The same machines from the site plan down to a single station. Each view links to the others, so a station on a hall drawing is one tap away from its photographs.</p></header>
    <div className="hv-grid">{HVIEWS.map(v=>{const lt=HOMEIMG[v.img+'_l'],dk=HOMEIMG[v.img+'_d'];
     return <a key={v.n} className={'hvi '+v.c} href={v.href}><span className="hvs">{lt?<img className={'lt'+(dk?' sw':'')} src={lt} alt="" loading="lazy"/>:null}{dk?<img className="dk" src={dk} alt="" loading="lazy"/>:null}</span><b>{v.n}</b><span className="t">{v.t}</span></a>})}</div>
   </div>
  </section>
  <footer className="hf"><div className="hin hf-grid"><div><div className="brand2"><i/>Plant Machinery Portal</div><p>Machine data and photographs come from the plants' public equipment listings. Line groupings, station assignments, equipment categories and the not-available list are an engineering assessment, not part of the listings, and the hall drawings and 3D halls are drawn to scale from the portal's own 3D models. Availability, condition and terms are to be confirmed with each seller.</p></div><nav aria-label="Plants">{D.factories.map(f=><a key={f.key} href={'#'+f.key}>{f.name}</a>)}</nav></div></footer>
 </div>}
