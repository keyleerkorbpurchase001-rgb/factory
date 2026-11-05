// Hall3D — one hall of a plant in 3D: the React page round the three.js engine (lib/hallScene.js), with the chrome the
// old hall pages got from hall-kit.js (K.ui): the header with the way back to the plant; the factory card with its
// toolbar (previous / next hall, previous / next line, the views, whole hall, process tour, not-available badge,
// labels / production / render quality switches, full screen); the view with the legend, the machine sheet (the old
// #info card: eyebrow, station, status pill, photo gallery, catalogue rows, note), the process-tour strip and the hint;
// under it the stats strip, the station chips and the machine details of the current line (every line on the whole
// hall view), and the other halls of the plant.
//
// Props: hallKey (or hall, as App passes it), line (number | null), onNavigate(hash) (optional: without it the page
// sets location.hash, which App's router hears). The hall is built once per hallKey; a new line only flies the camera.
// Keyboard: ← / → previous / next view, Esc closes the sheet, Space pauses / resumes a running tour.
import React,{useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {D,F,H,MAP2D,ST,hash3D,hashSub} from './data.js';
import {openRow} from './Sheet.jsx';
import {layoutHall,pad2} from './lib/layout.js';
import {createHallScene} from './lib/hallScene.js';
import './hall.css';

const store={get:k=>{try{return localStorage.getItem('pmp.'+k)}catch(e){return null}},set:(k,v)=>{try{localStorage.setItem('pmp.'+k,v)}catch(e){}}};
const KIND={ok:['green','Machine placed'],shared:['blue','Shared with another line'],na:['red','Not available'],sup:['grey','Support equipment']};
const kindOf=r=>r.kind==='na'?'na':r.kind==='shared'?'shared':r.line?'ok':'sup';
const firstLot=r=>String(r.lot||'').split(/[,+]/)[0].trim();

export default function Hall3D({hallKey,hall,line=null,onNavigate}){
 const key=hallKey||hall;
 const L=useMemo(()=>layoutHall(key,{D,MAP2D}),[key]);
 const fac=useMemo(()=>D.factories.find(f=>f.halls.includes(key)),[key]);
 const go=useCallback(h=>{if(onNavigate)onNavigate(h);else if(location.hash!==h)location.hash=h},[onNavigate]);
 const host=useRef(null),eng=useRef(null),card=useRef(null);
 const [progress,setProgress]=useState([0,1]);const [ready,setReady]=useState(false);
 const [sel,setSel]=useState(null);const [ph,setPh]=useState(0);
 const [tour,setTour]=useState({active:false,paused:false,line:null,idx:-1});
 const [labels,setLabels]=useState(()=>store.get('labels')||'miss');
 const [run,setRun]=useState(()=>store.get('run')!=='off');
 const [quality,setQuality]=useState(()=>store.get('quality')||'std');
 const [full,setFull]=useState(false);
 const cur=line&&L&&L.lines[line-1]&&!L.lines[line-1].empty?line:null;
 const curRef=useRef(cur);curRef.current=cur;

 // ---- the engine: built once per hall, freed on the way out ----
 useEffect(()=>{if(!L||!host.current)return;setReady(false);setSel(null);setTour({active:false,paused:false,line:null,idx:-1});
  let e;try{e=createHallScene({host:host.current,layout:L,line:curRef.current,quality,labels,run,on:{}})}catch(err){console.error('3D hall',err);return}
  eng.current=e;return()=>{eng.current=null;e.dispose()}},[L]);// eslint-disable-line react-hooks/exhaustive-deps
 // its callbacks, kept current without rebuilding the hall
 useEffect(()=>{const e=eng.current;if(!e)return;e.setHandlers({progress:(a,b)=>setProgress([a,b]),ready:()=>setReady(true),pick:ref=>{setSel(ref);setPh(0)},tour:s=>setTour(s)})});
 // a new line (route) flies the camera there
 useEffect(()=>{const e=eng.current;if(e&&e.line!==cur)e.showLine(cur)},[cur]);
 useEffect(()=>{eng.current?.setLabels(labels);store.set('labels',labels)},[labels]);
 useEffect(()=>{eng.current?.setRun(run);store.set('run',run?'on':'off')},[run]);
 useEffect(()=>{eng.current?.setQuality(quality);store.set('quality',quality)},[quality]);

 // ---- views: whole hall + the lines ----
 const views=useMemo(()=>L?[null,...L.lines.filter(l=>!l.empty).map(l=>l.index)]:[null],[L]);
 const vi=Math.max(0,views.indexOf(cur));
 const showView=useCallback(n=>{if(eng.current&&tour.active)eng.current.stopTour(false);setSel(null);eng.current?.select(null);if(n===cur)eng.current?.showLine(n);go(hash3D(key,n||undefined))},[cur,key,go,tour.active]);
 const step=useCallback(d=>showView(views[(vi+d+views.length)%views.length]),[views,vi,showView]);
 const closeSheet=useCallback(()=>{setSel(null);eng.current?.select(null);if(tour.active&&tour.paused)eng.current?.resumeTour()},[tour]);
 const pickRow=useCallback(ri=>{const r=D.rows[ri];if(!r)return;if(tour.active)eng.current?.stopTour(false);setSel({rowIndex:ri,line:r.line||0,step:r.step||0});setPh(0);
  if(r.line&&r.line!==cur){go(hash3D(key,r.line));setTimeout(()=>eng.current?.flyToRow(ri),60)}else eng.current?.flyToRow(ri);
  host.current?.closest('.factory')?.scrollIntoView({behavior:'smooth',block:'start'})},[cur,key,go,tour.active]);

 // ---- keyboard ----
 useEffect(()=>{const fn=e=>{if(e.target.closest&&e.target.closest('input,select,textarea,dialog')||e.metaKey||e.ctrlKey||e.altKey)return;
  if(e.key==='ArrowRight'){step(1);e.preventDefault()}else if(e.key==='ArrowLeft'){step(-1);e.preventDefault()}
  else if(e.key==='Escape'){if(sel)closeSheet();else if(tour.active)eng.current?.stopTour()}
  else if(e.code==='Space'&&tour.active&&!/button/i.test(e.target.tagName)){e.preventDefault();tour.paused?(setSel(null),eng.current?.resumeTour()):eng.current?.pauseTour()}};
  addEventListener('keydown',fn);return()=>removeEventListener('keydown',fn)},[step,sel,tour,closeSheet]);

 // ---- full screen ----
 const sec=useRef(null);
 useEffect(()=>{const fs=()=>document.fullscreenElement||document.webkitFullscreenElement;const fn=()=>{setFull(fs()===sec.current);setTimeout(()=>eng.current?.resize(),50)};
  document.addEventListener('fullscreenchange',fn);document.addEventListener('webkitfullscreenchange',fn);return()=>{document.removeEventListener('fullscreenchange',fn);document.removeEventListener('webkitfullscreenchange',fn)}},[]);
 const toggleFull=()=>{const s=sec.current;if(!s)return;if(document.fullscreenElement||document.webkitFullscreenElement)(document.exitFullscreen||document.webkitExitFullscreen).call(document);else (s.requestFullscreen||s.webkitRequestFullscreen)?.call(s)};

 if(!L)return <main className="hk"><p className="muted">No 3D model for this hall.</p></main>;
 const hd=H[key];const curLine=cur?L.lines[cur-1]:null;const tourLine=tour.active?L.lines[tour.line-1]:null;
 const hi=fac?fac.halls.indexOf(key):-1;const hallAt=d=>fac&&fac.halls.length>1?fac.halls[(hi+d+fac.halls.length)%fac.halls.length]:null;
 const missing=cur?curLine.missing:L.stats.missing;
 const hallRows=D.rows.map((r,i)=>({...r,_i:i})).filter(r=>r.hall===key);
 const shownRows=(cur?hallRows.filter(r=>r.line===cur):hallRows).slice().sort((a,b)=>(a.line||99)-(b.line||99)||(a.step||0)-(b.step||0));
 const byLine=new Map();shownRows.forEach(r=>{const k=r.line||0;if(!byLine.has(k))byLine.set(k,[]);byLine.get(k).push(r)});
 const cols=[['Year',r=>r.year],['Serial no.',r=>r.serial],['Key specs',r=>r.supply],['Size / weight',r=>r.weight],['Note',r=>r.note]].filter(([,f])=>shownRows.some(r=>f(r)));
 const selRow=sel&&sel.rowIndex!=null?D.rows[sel.rowIndex]:null;
 const pct=progress[1]?Math.round(progress[0]/progress[1]*100):0;

 return <main className="hk">
  <header className="line-head">
   {fac?<a className="button small" href={hashSub(fac.key,'3d')}>&#8249; Back to plant</a>:null}
   <h1>{hd.name}</h1>
   <p className="muted">{[fac&&fac.name,fac&&fac.place,hd.short].filter(Boolean).join(' · ')}</p>
  </header>

  <section className={'factory line-card'+(full?' is-full':'')} ref={sec} aria-label={hd.name+' in 3D'}>
   <div className="factory-bar">
    {hallAt(-1)?<a className="icon-button" href={hash3D(hallAt(-1))} title={'Previous hall: '+H[hallAt(-1)].name} aria-label={'Previous hall: '+H[hallAt(-1)].name}>&#171;</a>:null}
    <button type="button" className="button small" onClick={()=>step(-1)}>&#8249; Previous</button>
    <select className="plant-pick" aria-label="View" value={cur||'all'} onChange={e=>showView(e.target.value==='all'?null:+e.target.value)}>
     <option value="all">Whole hall · overview</option>
     {L.lines.filter(l=>!l.empty).map(l=><option key={l.index} value={l.index}>{`${l.index}. ${l.name}${l.sub?' · '+l.sub:''}`}</option>)}
    </select>
    <button type="button" className="button small" onClick={()=>step(1)}>Next &#8250;</button>
    {hallAt(1)?<a className="icon-button" href={hash3D(hallAt(1))} title={'Next hall: '+H[hallAt(1)].name} aria-label={'Next hall: '+H[hallAt(1)].name}>&#187;</a>:null}
    <span className="factory-time">{vi+1} / {views.length}</span>
    <button type="button" className="button small" onClick={()=>showView(null)} title="Fit the whole hall in the view">&#9635; Whole hall</button>
    <button type="button" className="button small tour" disabled={!cur||!ready} onClick={()=>tour.active?eng.current?.stopTour():eng.current?.startTour(cur)}>
     {tour.active?'■ Exit tour':cur?`▶ Process tour · Line ${cur}`:'Select a line for the process tour'}</button>
    <span className={'badge '+(missing?'red':'green')}><span/>{missing?missing+' not available':'Complete'}</span>
    <div className="hk-segs">
     <Seg label="Labels" value={labels} set={setLabels} opts={[['all','All'],['miss','Not available'],['off','Off']]}/>
     <Seg label="Production" value={run?'on':'off'} set={v=>setRun(v==='on')} opts={[['on','Running'],['off','Paused']]}/>
     <Seg label="Render quality" value={quality} set={setQuality} opts={[['std','Standard'],['high','High']]}/>
    </div>
    <button type="button" className="icon-button factory-full" onClick={toggleFull} title={full?'Exit full screen':'Full screen'} aria-label={full?'Exit full screen':'Full screen'}>&#x26F6;</button>
   </div>

   <div className="board-view factory-view" ref={host}>
    {!ready?<div className="hk-loading" role="status"><span>Building {hd.name.toLowerCase()}… {pct}%</span><i style={{width:pct+'%'}}/></div>:null}
    <ul className="plant-legend" aria-label="Legend">
     <li><i/>Machine placed</li><li><i className="missing"/>Not available</li>{L.stats.shared?<li><i className="shared"/>Shared with another line</li>:null}<li><i className="board"/>{L.lines.some(l=>l.board)?'Boards':'Parts'} in flow</li>
    </ul>
    {sel?<InfoCard key={sel.rowIndex??sel.prop} sel={sel} row={selRow} L={L} ph={ph} setPh={setPh} close={closeSheet} tour={tour} resume={()=>{setSel(null);eng.current?.resumeTour()}} cardRef={card}/>:null}
    {tour.active&&tourLine?<TourStrip L={tourLine} tour={tour} stop={()=>{setSel(null);eng.current?.stopTour()}} resume={()=>{setSel(null);eng.current?.resumeTour()}}/>:null}
    {!tour.active?<p className="factory-hint">Drag to orbit · scroll or pinch to zoom · right-drag to pan · click a machine for its details · ← → change the view. Red outlined bays are stations with no machine in the catalogue.</p>:null}
   </div>

   <dl className="factory-stats">
    <div><dt>Lines</dt><dd>{L.stats.lines}</dd></div>
    <div><dt>Machines placed</dt><dd>{L.stats.placed}</dd></div>
    <div><dt>Not available</dt><dd className={L.stats.missing?'is-red':''}>{L.stats.missing}</dd></div>
    {L.stats.shared?<div><dt>Shared</dt><dd className="is-blue">{L.stats.shared}</dd></div>:null}
    <div><dt>Support items</dt><dd>{L.stats.support}</dd></div>
    <div><dt>Floor</dt><dd>{L.bounds.W.toFixed(0)} × {L.bounds.D.toFixed(0)} m</dd></div>
   </dl>

   <div className="plant-lines">
    {[...byLine.keys()].sort((a,b)=>(a||99)-(b||99)).map(ln=>{const rs=byLine.get(ln);const meta=ln?L.lines[ln-1]:null;const miss=rs.filter(r=>r.kind==='na').length;
     return <div className="plant-line" key={ln}>
      <h3>{ln?meta.name:'Support equipment'}{meta&&meta.sub?<small> {meta.sub}</small>:null}
       <span className={'badge '+(miss?'red':'green')}><span/>{miss?miss+' not available':'Complete'}</span>
       {ln&&ln!==cur?<button type="button" className="button small" onClick={()=>showView(ln)}>Fly to line</button>:null}</h3>
      <ol className="plant-chips">{rs.map(r=>{const k=kindOf(r);return <li key={r._i}>
       <button type="button" className={'plant-chip '+(k==='na'?'missing':k)+(sel&&sel.rowIndex===r._i?' is-sel':'')} onClick={()=>pickRow(r._i)}>
        <b>{r.line?pad2(r.step):'S'}</b><strong>{r.station}</strong><span>{k==='na'?'Not available: source separately':r.name}</span><small>{k==='na'?'':[firstLot(r),r.year].filter(Boolean).join(' · ')}</small></button></li>})}</ol>
     </div>})}
   </div>

   <div className="plant-details">
    <h3>Machine details{cur?' · '+curLine.name:''}</h3>
    <div className="table-scroll"><table>
     <thead><tr><th>Line</th><th>Step</th><th>Station</th><th>Status</th><th>Machine</th><th>Lot</th>{cols.map(([k])=><th key={k}>{k}</th>)}</tr></thead>
     <tbody>{shownRows.map(r=>{const k=kindOf(r);return <tr key={r._i} className={(k==='na'?'missing':k)+(sel&&sel.rowIndex===r._i?' is-sel':'')} onClick={()=>pickRow(r._i)}>
      <td className="nowrap">{r.line?(L.lines[r.line-1]||{}).name||'Line '+r.line:'Support'}</td><td className="numeric">{r.line?r.step:'—'}</td><td className="nowrap">{r.station}</td>
      <td><span className={'badge '+KIND[k][0]}><span/>{KIND[k][1]}</span></td>
      {k==='na'?<td colSpan={cols.length+2}>No machine in the catalogue: source separately</td>:<><td><div className="w-m">{r.name}</div></td><td className="numeric">{r.lot}</td>{cols.map(([c,f])=><td key={c}>{f(r)?<div className="w-m">{f(r)}</div>:'—'}</td>)}</>}
     </tr>})}</tbody></table></div>
   </div>
  </section>

  {fac?<section className="line-card plant-section" aria-label="Halls of this plant">
   <header><h2>{fac.name}: all halls</h2><p className="muted">{fac.halls.length} halls in 3D · {D.rows.filter(r=>fac.halls.includes(r.hall)).length} stations</p></header>
   <div className="table-scroll"><table className="plant-table"><thead><tr><th>Hall</th><th>Lines</th><th>Stations</th><th>Not available</th><th/></tr></thead>
    <tbody>{fac.halls.map(k=>{const rs=D.rows.filter(r=>r.hall===k);const m=rs.filter(r=>r.kind==='na').length;return <tr key={k} className={k===key?'is-here':''}>
     <td><a className="plant-link" href={hash3D(k)}>{H[k].name}</a></td><td className="numeric">{H[k].lines.length}</td><td className="numeric">{rs.length}</td><td className={m?'is-red':''}>{m||'—'}</td>
     <td>{k===key?<span className="subtle-tag">You are here</span>:<a className="button small" href={hash3D(k)}>Open in 3D</a>}</td></tr>})}</tbody></table></div>
   <p className="plant-foot muted"><a className="plant-link" href={hashSub(fac.key,'overview')}>Back to the plant page</a> for the plant layout, the 2D station map, the flow and the machine list.</p>
  </section>:null}
 </main>;
}

// A segmented switch with its small label (Labels / Production / Render quality).
function Seg({label,value,set,opts}){return <div><div className="lbl">{label}</div><div className="seg" role="group" aria-label={label}>
 {opts.map(([v,t])=><button key={v} type="button" className={value===v?'on':''} aria-pressed={value===v} onClick={()=>set(v)}>{t}</button>)}</div></div>}

// The machine sheet over the view (the old #info card).
function InfoCard({sel,row,L,ph,setPh,close,tour,resume,cardRef}){
 if(!row)return <aside className="hk-info" ref={cardRef}><button type="button" className="x" onClick={close} aria-label="Close details">×</button>
  <div className="eyebrow">Loose equipment</div><h2>{sel.prop}</h2><p className="note">Placed in the hall by the old page; it has no catalogue row.</p></aside>;
 const line=row.line?L.lines[row.line-1]:null;const N=line?line.stations.length||(D.rows.filter(r=>r.hall===row.hall&&r.line===row.line).length):0;const na=row.kind==='na';const st=ST[row.kind]||['ok','Machine placed'];
 const photos=row.ph||[];const i=Math.min(ph,Math.max(0,photos.length-1));
 const rows=na?[['Catalogue ref.','None in the catalogue'],['Action','Source separately']]:[['Catalogue ref.',row.lot],['Machine',row.name],['Year',row.year],['Serial no.',row.serial],['Supply',row.supply],['Weight',row.weight]].filter(r=>r[1]);
 const note=na?(row.note||`No ${String(row.station).toLowerCase()} unit is in the catalogue for ${line?line.name:'this hall'}. Source an additional machine or share one between lines.`):row.note;
 return <aside className="hk-info" ref={cardRef} aria-label={'Details of '+row.station}>
  <button type="button" className="x" onClick={close} aria-label="Close details">×</button>
  <div className="eyebrow">{row.line?`Line ${row.line} · Step ${pad2(row.step)} of ${N}`:'Support equipment'}</div>
  <h2>{row.station}</h2>
  <div className="hk-pills"><span className={'pill '+(na?'miss':st[0])}>{na?'Not available':st[1]}</span>{tour.active&&tour.paused?<button type="button" className="button small hk-resume" onClick={resume}>▶ Resume tour</button>:null}</div>
  {photos.length?<div className="hk-gal"><img className="main" src={photos[i]} alt={'Photo of '+row.name}/>{photos.length>1?<div className="thumbs">{photos.map((u,k)=><button type="button" key={u+k} aria-current={k===i} aria-label={'Photo '+(k+1)} onClick={()=>setPh(k)}><img src={u} alt="" loading="lazy"/></button>)}</div>:null}</div>:null}
  <dl>{rows.map(([a,b])=><React.Fragment key={a}><dt>{a}</dt><dd>{b}</dd></React.Fragment>)}</dl>
  {note?<div className={'note'+(na?' miss':'')}>{note}</div>:null}
  {sel.rowIndex!=null?<button type="button" className="hk-more" onClick={()=>openRow(sel.rowIndex)}>Full sheet with the catalogue description →</button>:null}
 </aside>}

// The process-tour strip: the current step, its machine, the steps of the line, pause / resume / exit.
function TourStrip({L:l,tour,stop,resume}){const s=l.stations[Math.max(0,tour.idx)];if(!s)return null;const r=s.row,na=r.kind==='na';
 return <section className={'hk-tour'+(tour.paused?' paused':'')} aria-label="Process tour">
  <div className="tourhead"><b>Step {pad2(s.step)} · {r.station}</b>
   <span className={na?'miss':''}>{na?'NOT AVAILABLE — no machine in the catalogue; the line passes it on a bridge conveyor':[firstLot(r),r.name,r.year].filter(Boolean).join(' · ')}</span>
   <span className="hint">{tour.paused?'Tour paused — look around, then resume':'Click a machine for its details · Space pauses'}</span>
   {tour.paused?<button type="button" className="stop resume" onClick={resume}>▶ Resume tour</button>:null}
   <button type="button" className="stop" onClick={stop}>Exit tour</button></div>
  <div className="steps" style={{gridTemplateColumns:`repeat(${Math.min(12,l.stations.length)},minmax(0,1fr))`}}>
   {l.stations.map((x,k)=><div key={x.rowIndex} className={'st'+(x.row.kind==='na'?' miss':'')+(k===tour.idx?' now':k<tour.idx?' done':'')} title={x.row.station}>{pad2(x.step)} {x.row.station}</div>)}
  </div></section>}
