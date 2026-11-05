// The plant page, ported from the old index.html: the plant header (eyebrow, name, description, counts and three
// catalogue photos) and the sub-tabs of SUBS, each a component below:
//   Overview           the halls (cards with the 3D preview) and every production line
//   Plant layout       the site plan: each hall's top view from its 3D model with its lines (renderSite)
//   2D station map     the floor plan of a hall drawn to scale from its 3D model (render2D in drawings.js)
//   Flow               each line as a row of station tiles in process order (renderFlows)
//   3D halls           the hall cards that open the 3D halls
//   Equipment categories, Machines & photos, Machine list, Brochure (renderCats, renderMachines, renderList, Viewer)
// The page keeps every tab's state (the hall on the map and flow tabs, the filters) while the visitor moves between
// tabs; App mounts one Plant per plant (key = plant), so opening another plant starts afresh, as the old page did.
// Every station, model and lot opens the machine sheet (Sheet.jsx).
import React,{useEffect,useMemo,useRef,useState} from 'react';
import {D,F,H,FILES,MAP2D,SUBS,ST,SHEETS,catBy,lineRows,placed,lineName,heroPh,fStats,hash3D,hashSub,PREV,TOPV,pad2} from './data.js';
import {render2D,unplaced2D} from './drawings.js';
import {openRow,openModel,openLot} from './Sheet.jsx';

const go=hash=>{location.hash=hash};
const plural=(n,w,ws)=>n+' '+(n===1?w:(ws||w+'s'));

// ---------- shared pieces ----------
function HallCard({fk,h,mode}){const m=H[h];const rs=lineRows.filter(r=>r.hall===h);const na=rs.filter(r=>r.kind==='na').length;
 return <article className="card hc"><a className="shot" href={hash3D(h)}><img src={PREV(h)} alt={'3D view of '+m.name} loading="lazy"/><span className="tag">{plural(m.lines.length,'line')} · {rs.length} stations</span>{na?<span className="tag r">{na} not available</span>:null}</a>
  <div className="hb"><h3>{m.name}</h3><p>{mode==='3d'?m.desc:m.short}</p><div className="row"><a className="btn" href={hash3D(h)}>Open in 3D →</a>{mode==='3d'?null:<>
   <button className="btn2" type="button" onClick={()=>go(hashSub(fk,'flow',h))}>Flow</button><button className="btn2" type="button" onClick={()=>go(hashSub(fk,'map',h))}>2D map</button><button className="btn2" type="button" onClick={()=>go(hashSub(fk,'machines',h))}>Machines</button></>}</div></div></article>}

function HallChips({f,cur,set,label='Hall'}){return <div className="chips" role="group" aria-label={label}>{f.halls.map(h=><button key={h} type="button" className="chip" aria-pressed={h===cur} onClick={()=>set(h)}>{H[h].name}</button>)}</div>}

// A file card's download link. The files sit next to the app (public/), so a plain download link is enough; the
// status line confirms the click.
export function DlLink({file,cls='btn',children}){const [st,setSt]=useState('');
 return <><a className={cls} href={encodeURI(file)} download={file} onClick={()=>setSt('Downloading '+file+'…')}>{children}</a>{st?<div className="status ok">{st}</div>:null}</>}

// The brochure viewer: the pages are stored as sprite sheets of ten pages each (one image per sheet, SHEETS); a page is
// shown by shifting its sheet inside a page-sized frame (--y). Thumbnails down the side, the page, prev / next.
export function Viewer({m,label='Brochure pages'}){const [pg,setPg]=useState(1);const n=m.pages;
 useEffect(()=>{setPg(1)},[m]);
 const loc=i=>{const j=i-1,si=Math.floor(j/m.per),s=m.sheets[si];return {src:'photos/'+s.id+'.jpg',y:`${-100*(j-si*m.per)/s.count}%`}};
 const cur=loc(Math.min(n,Math.max(1,pg))),show=p=>setPg(Math.min(n,Math.max(1,p)));
 const th=useRef(null);
 useEffect(()=>{const b=th.current&&th.current.querySelector('[aria-current="true"]');if(b&&b.scrollIntoView&&th.current.scrollHeight>th.current.clientHeight)b.scrollIntoView({block:'nearest',inline:'nearest'})},[pg]);
 return <div className="viewer">
  <div className="thumbs" aria-label={label} ref={th}>{Array.from({length:n},(_,i)=>{const l=loc(i+1);return <button key={i} type="button" aria-label={'Page '+(i+1)} aria-current={pg===i+1} onClick={()=>show(i+1)}><span className="pv"><img loading="lazy" src={l.src} style={{'--y':l.y}} alt=""/></span><span>{i+1}</span></button>})}</div>
  <div className="stage">
   <div className="pv" role="img" aria-label={'Brochure page '+pg}><img alt="" src={cur.src} style={{'--y':cur.y}}/></div>
   <div className="pager"><button className="btn2" type="button" aria-label="Previous page" disabled={pg<=1} onClick={()=>show(pg-1)}>←</button><span>{pg} / {n}</span><button className="btn2" type="button" aria-label="Next page" disabled={pg>=n} onClick={()=>show(pg+1)}>→</button></div>
  </div>
 </div>}

// ---------- Overview ----------
function Overview({fk,f,s}){
 return <div className="sub col">
  <div className="sechead"><h2>Halls and departments</h2><p className="lede">{`${f.source}. ${s.halls} halls with ${s.lines} lines and areas; ${s.placed} stations have a listed machine and ${s.na} are not available.`}</p></div>
  <div className="halls">{f.halls.map(h=><HallCard key={h} fk={fk} h={h} mode="ov"/>)}</div>
  <div className="sechead" style={{marginTop:8}}><h2>Production lines</h2><p className="lede">Every line of the plant. Open a line in 3D to see it built station by station, follow its flow with the original machine photos, or find it on the 2D station map.</p></div>
  <div className="card ltable">{f.halls.map(h=><React.Fragment key={h}>
   <div className="lhall"><span>{H[h].name}</span><a className="btn2 sm" href={hash3D(h)}>Hall in 3D</a></div>
   {H[h].lines.map((l,i)=>{const rs=lineRows.filter(r=>r.hall===h&&r.line===i+1);const na=rs.filter(r=>r.kind==='na').length;
    return <div className="lrow" key={i}><div><b>{l.name}</b></div><div className="s">{l.sub||''}</div><div className="st">{rs.length} stations{na?<> · <em>{na} n/a</em></>:null}</div>
     <div className="row"><a className="btn sm" href={hash3D(h,i+1)}>Open line in 3D</a><button className="btn2 sm" type="button" onClick={()=>go(hashSub(fk,'flow',h))}>Flow</button><button className="btn2 sm" type="button" onClick={()=>go(hashSub(fk,'map',h))}>2D map</button></div></div>})}
  </React.Fragment>)}</div>
 </div>}

// ---------- Plant layout: the site plan of top views ----------
function Layout({f}){
 return <div className="sub col">
  <div className="sechead"><h2>Plant layout</h2><p className="lede">Site plan of the plant: every hall is shown as a top-down view of its 3D model, with its lines listed underneath. Tap a hall or a line to open it in 3D; the 2D station map and the flow tabs show each hall station by station.</p></div>
  <div className="site">
   <div className="sl"><span>{f.name} · {f.place} · site plan from the 3D models (not to scale)</span><span>Goods in ← → Dispatch</span></div>
   <div className="sgrid">{f.halls.map(h=>{const m=H[h],t=m.top||{};
    return <div className="hall2" key={h}><div className="hh"><b>{m.name}</b><a href={hash3D(h)}>OPEN 3D ↗</a></div>
     <a className="tv" href={hash3D(h)} aria-label={'Plan view of '+m.name}><img src={TOPV(h)} alt={'Plan view of '+m.name} loading="lazy" width={t.w||undefined} height={t.h||undefined}/>{t.W?<span className="dim">≈ {t.W} × {t.D} m</span>:null}</a>
     <div className="ll">{m.lines.map((l,i)=>{const na=lineRows.filter(r=>r.hall===h&&r.line===i+1&&r.kind==='na').length;return <a key={i} href={hash3D(h,i+1)} className={na?'na':''} title={'Open '+l.name+' in 3D'}>{l.name}{na?' · '+na+' n/a':''}</a>})}</div></div>})}</div>
   <div className="aisle">MAIN AISLE · GOODS IN ← → DISPATCH</div>
  </div>
 </div>}

// ---------- 2D station map ----------
function MapTab({f,h,setH}){const m=H[h];
 const {svg}=useMemo(()=>render2D(h),[h]);const rest=useMemo(()=>unplaced2D(h),[h]);
 // the drawing is injected markup: a click (or Enter / Space) on a station with a row opens its sheet
 const act=e=>{const g=e.target.closest&&e.target.closest('[data-r]');if(!g)return;if(e.type==='keydown'){if(e.key!=='Enter'&&e.key!==' ')return;e.preventDefault()}openRow(+g.dataset.r)};
 return <div className="sub col">
  <div className="sechead"><h2>2D station map</h2><p className="lede">Floor plan of each hall drawn to scale from its 3D model: every station sits where its machine stands, numbered in process order, with arrows showing the flow along each line. Tap a station for the machine sheet with its photos.</p></div>
  <HallChips f={f} cur={h} set={setH}/>
  <div className="mapbar"><div className="legend"><span><i className="pl"/>Machine placed</span><span><i className="sh"/>Shared with another line</span><span><i className="na"/>Not available</span><span><i className="sp"/>Support equipment</span><span><i className="fw"/>Flow direction</span><span><i className="wl"/>Wall, columns, services</span><span><i className="dr"/>Roll-up door</span><span><i className="ex"/>Fire exit / door</span><span><i className="zn"/>Zone</span></div><a className="btn2 sm" href={hash3D(h)}>Open {m.name} in 3D →</a></div>
  <p className="count maphint">Scroll sideways to see the whole hall.</p>
  {svg?<div className="map2d" onClick={act} onKeyDown={act} dangerouslySetInnerHTML={{__html:svg}}/>:<div className="map2d"><p className="count" style={{padding:16}}>No floor plan for this hall.</p></div>}
  {svg&&rest.length?<div className="unplaced"><span>Not drawn on the floor:</span>{rest.map(([r,i])=><button key={i} type="button" onClick={()=>openRow(i)}>{r.station}{r.name?' · '+r.name.slice(0,40):''}</button>)}</div>:null}
 </div>}

// ---------- Flow ----------
function Tile({r,i,support}){const n=support?'SUPPORT':'STEP '+pad2(r.step);
 if(r.kind==='na')return <div className="tile na"><div className="nai">NOT AVAILABLE</div><div className="tb"><span className="n">{n}</span><span className="t">{r.station}</span><span className="m">No machine in the listing</span></div></div>;
 const lot=r.lot||'';
 return <button type="button" className={'tile '+(r.kind==='shared'?'shared':'')} onClick={()=>openRow(i)}>{r.ph[0]?<img className="ti" src={r.ph[0]} alt="" loading="lazy"/>:<span className="ti"/>}<span className="tb"><span className="n">{n}</span><span className="t">{r.station}</span><span className="m">{r.name}</span><span className="l">{r.kind==='shared'?'SHARED · ':''}{lot.split(/[,+]/)[0]}{/[,+]/.test(lot)?' +':''}</span></span></button>}
function FlowTab({f,h,setH}){const m=H[h];
 const sup=D.rows.map((r,i)=>[r,i]).filter(([r])=>r.hall===h&&!r.line);
 return <div className="sub col">
  <div className="sechead"><h2>Flow</h2><p className="lede">Each line as a row of stations in process order, with the original photograph of the machine at every step. Tap a station for the machine sheet with all its photos, or open the line in 3D.</p></div>
  <HallChips f={f} cur={h} set={setH}/>
  <div className="lines">
   {m.lines.map((l,li)=>{const rs=D.rows.map((r,i)=>[r,i]).filter(([r])=>r.hall===h&&r.line===li+1).sort((a,b)=>a[0].step-b[0].step);const na=rs.filter(([r])=>r.kind==='na').length;
    return <article className="card line" key={li}><div className="lhead"><b>{l.name}</b><span className="s">{l.sub||''}</span>{na?<span className="c">{na} not available</span>:null}<a className="btn2 sm" href={hash3D(h,li+1)}>Open line in 3D →</a></div>
     <div className="flow">{rs.map(([r,i],k)=><React.Fragment key={i}><Tile r={r} i={i}/>{k<rs.length-1?<span className="arrow" aria-hidden="true">→</span>:null}</React.Fragment>)}</div></article>})}
   {sup.length?<article className="card line"><div className="lhead"><b>Support equipment</b><span className="s">shared by the hall</span></div><div className="flow">{sup.map(([r,i],k)=><React.Fragment key={i}>{k?<span className="arrow"/>:null}<Tile r={r} i={i} support/></React.Fragment>)}</div></article>:null}
   <div className="row"><a className="btn" href={hash3D(h)}>Open {m.name} in 3D →</a></div>
  </div>
 </div>}

// ---------- 3D halls ----------
function Halls3D({fk,f}){return <div className="sub col">
 <div className="sechead"><h2>3D halls</h2><p className="lede">Each hall opens as a live 3D floor with its lines set up station by station. Drag to orbit, tap any machine for its details and original photo, and run the process tour for a line. Red bays mark stations that are not available.</p></div>
 <div className="halls">{f.halls.map(h=><HallCard key={h} fk={fk} h={h} mode="3d"/>)}</div></div>}

// ---------- Equipment categories ----------
function Cats({fk,cur,setCur}){const cs=D.cats[fk];const lots=D.catalog.filter(c=>c.f===fk);const units=lots.reduce((a,c)=>a+(c.qty||1),0);
 const groups=[...new Set(cs.map(c=>c.group))];const head=useRef(null),picked=useRef(false);
 const c=cur!=null?cs[cur]:null;
 // a category picked here scrolls its lot list into view (not when the tab is reopened with a category chosen)
 useEffect(()=>{if(picked.current&&c&&head.current)head.current.scrollIntoView({behavior:'smooth',block:'start'});picked.current=false},[cur]);// eslint-disable-line
 return <div className="sub col">
  <div className="sechead"><h2>Equipment categories</h2><p className="lede">{fk==='f1'?'Category-wise machinery summary of the plant catalogue: the 10 SMT / PCB equipment categories list every lot with its catalogue sheet and photographs; the other plant equipment follows in 9 further categories.':'Every lot of the plant grouped by equipment category. Tap a category to list its lots with photographs.'}</p></div>
  <div className="kpis">{[[cs.length,'Categories'],[lots.length,'Lots'],[units,'Units'],[lots.filter(c=>c.sheet).length,'Catalogue sheets']].map(([b,t])=><div className="kpi" key={t}><b>{b}</b><span>{t}</span></div>)}</div>
  <div>{groups.map(g=><div className="col" style={{gap:10}} key={g}><div className="cgroup">{g}</div><div className="cats">{cs.map((c,i)=>[c,i]).filter(([c])=>c.group===g).map(([c,i])=>{const ph=c.lots.map(l=>catBy[fk+':'+l]).filter(x=>x&&x.ph[0]).slice(0,3).map(x=>x.ph[0]);
   return <button key={i} type="button" className="cc" aria-pressed={i===cur} onClick={()=>{picked.current=true;setCur(i)}}><div className="strip">{ph.map((u,j)=><img key={j} src={u} alt="" loading="lazy"/>)}</div><div className="cb"><b>{c.name}</b><span>{plural(c.lots.length,'lot')} · {plural(c.units,'unit')}</span></div></button>})}</div></div>)}</div>
  {c?<div className="sechead" ref={head}><h2>{c.name}</h2><p className="lede">{c.lots.length} lots · {c.units} units · {c.group}</p></div>:null}
  {c?<div className="catlist">{c.lots.map(l=>{const x=catBy[fk+':'+l];if(!x)return null;const i=D.catalog.indexOf(x);const q=x.qty||1;
   return <button key={l} type="button" className="lot" onClick={()=>openLot(i)}>{x.ph[0]?<img src={x.ph[0]} alt="" loading="lazy"/>:<span/>}<span className="lb"><b>{x.title}</b><span>{x.desc}</span><span className="u">{x.lot}{x.year?' · '+x.year:''}{x.use.length?' · '+x.use.join('; '):''}</span></span><span className="q">{plural(q,'unit')}<br/>{plural(x.ph.length,'photo')}{x.sheet?<><br/>+ sheet</>:null}</span></button>})}</div>:null}
 </div>}

// ---------- Machines & photos ----------
function Machines({fk,f,q,setQ,h,setH}){const [shown,setShown]=useState(36);
 useEffect(()=>{setShown(36)},[q,h]);
 const ms=useMemo(()=>{const s=q.trim().toLowerCase();return D.models.map((m,i)=>[m,i]).filter(([m])=>m.f===fk&&(!h||m.hall===h)&&(!s||(m.name+' '+m.station+' '+m.refs.join(' ')+' '+H[m.hall].name).toLowerCase().includes(s)))},[fk,q,h]);
 return <div className="sub col">
  <div className="sechead"><h2>Machines and photos</h2><p className="lede">Every machine model in this plant with its original listing photographs. Tap a card for all photos, the 3D render, specifications, lots and the lines it serves.</p></div>
  <div className="filters">
   <input type="search" placeholder="Search machine, maker, model or lot" aria-label="Search machines" value={q} onChange={e=>setQ(e.target.value)}/>
   <select aria-label="Hall" value={h} onChange={e=>setH(e.target.value)}><option value="">All halls</option>{f.halls.map(k=><option key={k} value={k}>{H[k].name}</option>)}</select>
   <span className="count">{ms.length} machine models</span>
  </div>
  <div className="grid">{ms.length?ms.slice(0,shown).map(([m,i])=><button key={i} type="button" className="mc" onClick={()=>openModel(i)}>
   <div className="im">{m.ph[0]?<img src={m.ph[0]} alt={'Photo of '+m.name} loading="lazy"/>:(m.img?<img src={`img/${m.img}.jpg`} alt={'3D render of '+m.name} loading="lazy"/>:null)}<span className="lt">{(m.refs[0]||'').split(' ')[0]}</span><span className="np">{plural(m.ph.length,'photo')}{m.img?' · 3D':''}</span></div>
   <div className="b"><div className="t">{m.name}</div><div className="s">{H[m.hall].name} · {m.station}{m.year?' · '+m.year:''}</div><div className="f"><span className={'pill '+(ST[m.kind]?ST[m.kind][0]:'ok')}>{m.qty>1?m.qty+' lots':'1 lot'}</span>{m.lines.length?<span className="pill">{m.lines.length>1?m.lines.length+' lines':'Line '+m.lines[0]}</span>:<span className="pill">Support</span>}</div></div>
  </button>):<p className="count">No machines match these filters.</p>}</div>
  <div className="more">{ms.length>shown?<button className="btn2" type="button" onClick={()=>setShown(shown+36)}>Show more machines</button>:null}</div>
 </div>}

// ---------- Machine list ----------
function List({fk,f,st,set}){const {type,h,k,q}=st;const s=q.trim().toLowerCase();
 const rows=useMemo(()=>type==='st'
  ?D.rows.map((r,i)=>[r,i]).filter(([r])=>r.f===fk&&(!h||r.hall===h)&&(!k||(k==='placed'?placed(r):r.kind===k))&&(!s||(r.station+' '+r.name+' '+r.lot+' '+r.supply).toLowerCase().includes(s)))
  :D.catalog.map((c,i)=>[c,i]).filter(([c])=>c.f===fk&&(!h||D.rows.some(r=>r.hall===h&&(r.lots||[]).includes(c.lot)))&&(!s||(c.lot+' '+c.title+' '+c.cat+' '+c.desc).toLowerCase().includes(s)))
    .sort((a,b)=>a[0].cat===b[0].cat?0:(D.cats[fk].findIndex(x=>x.name===a[0].cat)-D.cats[fk].findIndex(x=>x.name===b[0].cat))),[type,fk,h,k,s]);
 const xf=FILES.xlsx[fk];
 return <div className="sub col">
  <div className="card dl">
   <div className="fi"><div className="fileicon">XLSX</div><div><b>{xf}</b><span>7 sheets: Summary (live counts per line), Plant, Stations, Machine models, Categories, Not available, Lot index</span></div></div>
   <div className="row"><DlLink file={xf}>Download Excel</DlLink></div>
  </div>
  <div className="sechead"><h2>Machine list</h2><p className="lede">Every station of every line with the machine placed or NOT AVAILABLE, and the full lot list of the plant. The Excel workbook holds the same data with live summary counts.</p></div>
  <div className="filters">
   <div className="chips" role="group" aria-label="List type"><button type="button" className="chip" aria-pressed={type==='st'} onClick={()=>set({type:'st'})}>Stations by line</button><button type="button" className="chip" aria-pressed={type==='lots'} onClick={()=>set({type:'lots'})}>All lots by category</button></div>
   <select aria-label="Hall" value={h} onChange={e=>set({h:e.target.value})}><option value="">All halls</option>{f.halls.map(x=><option key={x} value={x}>{H[x].name}</option>)}</select>
   <select aria-label="Status" value={k} hidden={type!=='st'} onChange={e=>set({k:e.target.value})}><option value="">All statuses</option><option value="placed">Machine placed</option><option value="shared">Shared</option><option value="na">Not available</option></select>
   <input type="search" placeholder="Search" aria-label="Search list" value={q} onChange={e=>set({q:e.target.value})}/>
   <span className="count">{rows.length} {type==='st'?'rows':'lots'}</span>
  </div>
  <div className="tbl"><table>
   {type==='st'?<>
    <thead><tr><th>Hall</th><th>Line</th><th>#</th><th>Station</th><th>Status</th><th>Lots</th><th>Machine</th><th>Year</th><th>Key specs</th></tr></thead>
    <tbody>{rows.map(([r,i])=><tr key={i} className={r.kind==='na'?'na':'clk'} onClick={r.kind==='na'?undefined:()=>openRow(i)}><td>{H[r.hall].name}</td><td>{r.line?lineName(r.hall,r.line):'Support'}</td><td className="mono">{r.step??''}</td><td><b>{r.station}</b></td><td><span className={'pill '+ST[r.kind][0]}>{ST[r.kind][1]}</span></td><td className="mono">{r.lot}</td><td>{r.kind==='na'?<b style={{color:'var(--miss)'}}>NOT AVAILABLE</b>:r.name}</td><td className="mono">{r.year}</td><td>{[r.supply,r.weight].filter(Boolean).join(' · ')}</td></tr>)}</tbody></>
   :<>
    <thead><tr><th>Category</th><th>Lot</th><th>Machine / item</th><th>Year</th><th>Units</th><th>Photos</th><th>Used in</th></tr></thead>
    <tbody>{rows.map(([c,i])=><tr key={i} className="clk" onClick={()=>openLot(i)}><td>{c.cat}</td><td className="mono">{c.lot}</td><td><b>{c.title}</b></td><td className="mono">{c.year}</td><td className="mono">{c.qty||1}</td><td className="mono">{c.ph.length}</td><td>{c.use.length?c.use.join('; '):<span style={{color:'var(--muted)'}}>Not in a line</span>}</td></tr>)}</tbody></>}
  </table></div>
 </div>}

// ---------- Brochure ----------
function Brochure({fk}){const bf=FILES.pdf[fk];
 return <div className="sub col">
  <div className="card dl">
   <div className="fi"><div className="fileicon p">PDF</div><div><b>{bf.name}</b><span>{bf.pages} pages · A4 landscape · {bf.mb} MB</span></div></div>
   <div className="row"><DlLink file={bf.name}>Download PDF</DlLink></div>
  </div>
  <p className="count">The complete brochure and Excel workbook for all three plants are under <a href="#downloads">all downloads</a>.</p>
  <Viewer m={SHEETS[fk]}/>
 </div>}

// ---------- the page ----------
export default function Plant({fk,sub='overview',arg=null}){
 const f=F[fk],s=useMemo(()=>fStats(fk),[fk]);
 const own=x=>x&&f.halls.includes(x)?x:null;
 const [mapHall,setMapHall]=useState(()=>own(arg)||f.halls[0]);
 const [flowHall,setFlowHall]=useState(()=>own(arg)||f.halls[0]);
 const [cat,setCat]=useState(null);
 const [mq,setMq]=useState(''),[mh,setMh]=useState(()=>sub==='machines'&&own(arg)||'');
 const [ls,setLs]=useState({type:'st',h:'',k:'',q:''});
 const subRef=useRef(null);
 // A hall in the route (#f1/map/smt, from a hall card, a line row or the home page) selects that hall on its tab.
 useEffect(()=>{const h=own(arg);if(!h)return;
  if(sub==='map')setMapHall(h);else if(sub==='flow')setFlowHall(h);else if(sub==='machines')setMh(h);else if(sub==='list')setLs(x=>({...x,h}))},[sub,arg]);// eslint-disable-line
 // A new tab starts at its top: when the page is scrolled past the sub-tab bar (which then sticks under the nav), it
 // goes back to where the bar sits, so the tab opens right under it; above that the position is kept.
 useEffect(()=>{const bar=subRef.current,head=bar&&bar.previousElementSibling;if(!head)return;
  const gap=parseFloat(getComputedStyle(bar.parentNode).rowGap)||0,y=Math.round(head.getBoundingClientRect().bottom+gap+scrollY-(parseFloat(getComputedStyle(bar).top)||60));if(scrollY>y+2)scrollTo({top:y})},[sub,arg]);
 // choosing a hall on a tab keeps the address in step (without a history entry), so a reload shows the same hall
 const pickHall=(tab,set)=>h=>{set(h);history.replaceState(null,'',hashSub(fk,tab,h))};
 let body;
 switch(sub){
  case 'layout':body=<Layout f={f}/>;break;
  case 'map':body=<MapTab f={f} h={mapHall} setH={pickHall('map',setMapHall)}/>;break;
  case 'flow':body=<FlowTab f={f} h={flowHall} setH={pickHall('flow',setFlowHall)}/>;break;
  case '3d':body=<Halls3D fk={fk} f={f}/>;break;
  case 'categories':body=<Cats fk={fk} cur={cat} setCur={setCat}/>;break;
  case 'machines':body=<Machines fk={fk} f={f} q={mq} setQ={setMq} h={mh} setH={setMh}/>;break;
  case 'list':body=<List fk={fk} f={f} st={ls} set={p=>setLs(x=>({...x,...p}))}/>;break;
  case 'brochure':body=<Brochure fk={fk}/>;break;
  default:body=<Overview fk={fk} f={f} s={s}/>}
 return <section className="page col">
  <div className="fhead">
   <div>
    <div className="eyebrow">{f.tag} · {f.place}</div>
    <h1>{f.name}</h1>
    <p className="lede">{f.desc}</p>
    <div className="kpis" style={{marginTop:16}}>{[[s.halls,'Halls'],[s.lines,'Lines & areas'],[s.stations,'Stations'],[s.placed,'Machines placed'],[s.lots,'Catalogue lots'],[s.units,'Units'],[s.photos,'Original photos'],[s.na,'Not available','miss']].map(([b,t,c])=><div key={t} className={'kpi '+(c||'')}><b>{b}</b><span>{t}</span></div>)}</div>
   </div>
   <div className="fmos">{heroPh(fk).map(u=><img key={u} src={u} alt="" loading="lazy"/>)}</div>
  </div>
  <nav className="subtabs" aria-label="Plant sections" ref={subRef}>{SUBS.map(([k,t])=><a key={k} href={hashSub(fk,k)} aria-current={k===sub?'true':undefined}>{t}</a>)}</nav>
  {body}
 </section>}
