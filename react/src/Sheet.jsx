// The machine / lot sheet: a <dialog> with the photo gallery (original photographs, the catalogue sheet, the 3D
// render; thumbnails and prev / next), the eyebrow, title, status pills, the specification rows, the note, the
// catalogue description and the links to the line in 3D. One SheetHost is mounted by App; the pages and the 3D
// engine open it through the imperative Sheet API below (openRow / openModel / openLot take an index into D.rows /
// D.models / D.catalog), so no React context is needed by non-React code such as the three.js hall.
import React,{useEffect,useRef,useState} from 'react';
import {D,F,H,ST,lineName,lotOf,hash3D} from './data.js';

const reg={open:null,close:null};

// A sheet spec: {eb, title, pills:[[cls,text]], rows:[[label,value]], note, naNote, desc, ph:[url], sheet, render,
// links:[[href,text]]} — the same fields the old openSheet took.
export function rowSheet(i){const r=D.rows[i];if(!r)return null;const m=D.models.find(m=>m.hall===r.hall&&m.name===r.name);const lots=r.lots||[];const c=lotOf(r.f,lots[0]);
 return {eb:`${F[r.f].short_name} · ${H[r.hall].name} · ${r.line?lineName(r.hall,r.line)+' · step '+r.step:'Support'}`,title:r.station,pills:[[ST[r.kind][0],ST[r.kind][1]]],
  rows:[['Machine',r.name],['Lots',r.lot+(lots.length&&lots.join(', ')!==r.lot?' (lot '+lots.join(', ')+')':'')],['Year',r.year],['Serial',r.serial],['Key specs',r.supply],['Size / weight',r.weight]],
  note:r.note,naNote:r.kind==='na',desc:c?c.desc:'',ph:r.ph||[],sheet:c&&c.sheet,render:m&&m.img?`img/${m.img}.jpg`:null,
  links:[[hash3D(r.hall,r.line||undefined),`Open ${r.line?'line':'hall'} in 3D →`]]}}
export function modelSheet(i){const m=D.models[i];if(!m)return null;const row=D.rows.find(r=>r.hall===m.hall&&r.name===m.name)||{lots:[]};const c=lotOf(m.f,(row.lots||[])[0]);
 return {eb:`${F[m.f].short_name} · ${H[m.hall].name}`,title:m.name,pills:[[ST[m.kind]?ST[m.kind][0]:'ok',m.qty>1?m.qty+' lots':'1 lot']],
  rows:[['Station',m.station],['Lots',m.refs.join(', ')],['Lines',m.lines.length?m.lines.map(l=>lineName(m.hall,l)).join(', '):'Support equipment'],['Year',m.year],['Key specs',m.supply],['Size / weight',m.weight]],
  note:m.note,desc:c?c.desc:'',ph:m.ph||[],sheet:c&&c.sheet,render:m.img?`img/${m.img}.jpg`:null,
  links:[[hash3D(m.hall,m.lines[0]),'Open in 3D →']]}}
export function lotSheet(i){const c=D.catalog[i];if(!c)return null;
 return {eb:`${F[c.f].short_name} · ${c.cat}`,title:c.title,pills:[c.use.length?['ok',`In ${c.use.length>1?c.use.length+' lines':'a line'}`]:['','Not in a line']],
  rows:[['Lot',c.lot],['Category',c.cat],['Year',c.year],['Units',c.qty||1],['Photos',c.ph.length],['Used in',c.use.join('; ')]],
  note:'',desc:c.desc,ph:c.ph||[],sheet:c.sheet,render:null,links:[]}}

export const Sheet={
 openSheet:spec=>{if(spec&&reg.open)reg.open(spec)},
 openRow:i=>Sheet.openSheet(rowSheet(i)),
 openModel:i=>Sheet.openSheet(modelSheet(i)),
 openLot:i=>Sheet.openSheet(lotSheet(i)),
 close:()=>reg.close&&reg.close()};
export const {openSheet,openRow,openModel,openLot}=Sheet;

// The dialog itself. It opens with showModal() when a spec arrives, and clears its spec on the dialog's close event
// (Escape, the × button, a click on the backdrop, or a link that navigates away).
export function SheetHost(){
 const [spec,setSpec]=useState(null),[cur,setCur]=useState(0),dlg=useRef(null);
 useEffect(()=>{reg.open=s=>{setCur(0);setSpec(s)};reg.close=()=>dlg.current&&dlg.current.open&&dlg.current.close();return()=>{reg.open=null;reg.close=null}},[]);
 useEffect(()=>{const d=dlg.current;if(!d)return;if(spec&&!d.open)d.showModal()},[spec]);
 if(!spec)return <dialog ref={dlg} aria-label="Machine sheet"/>;
 const items=spec.ph.map(u=>({u,c:'Original photograph from the plant listing'}));
 if(spec.sheet)items.push({u:spec.sheet,c:'Catalogue sheet from the plant equipment catalogue',s:1});
 if(spec.render)items.push({u:spec.render,c:'3D render from the plant model',r:1});
 const it=items[cur];
 const close=()=>dlg.current&&dlg.current.close();
 return <dialog ref={dlg} aria-labelledby="d-title" onClose={()=>setSpec(null)} onClick={e=>{if(e.target===dlg.current)close()}}>
  <div className="sheet">
   <div className="gal">
    <img className="main" src={it?it.u:''} alt={it?(it.r?'3D render of ':it.s?'Catalogue sheet of ':'Photo of ')+spec.title:''}/>
    <div className="gthumbs">{items.map((x,i)=><button key={x.u+i} type="button" aria-current={i===cur} aria-label={x.r?'3D render':x.s?'Catalogue sheet':'Photo '+(i+1)} onClick={()=>setCur(i)}><img src={x.u} alt="" loading="lazy"/>{x.r?<em>3D</em>:x.s?<em>SHEET</em>:null}</button>)}</div>
    <div className="nav"><button type="button" disabled={cur<=0} onClick={()=>setCur(cur-1)} aria-label="Previous photo">←</button><span className="cap">{it?it.c:'No photograph in the listing'}{items.length>1?` · ${cur+1} / ${items.length}`:''}</span><button type="button" disabled={cur>=items.length-1} onClick={()=>setCur(cur+1)} aria-label="Next photo">→</button></div>
   </div>
   <div className="sb">
    <button className="close" type="button" onClick={close} aria-label="Close">×</button>
    <div className="eyebrow">{spec.eb}</div><h3 id="d-title">{spec.title}</h3>
    <div className="row">{spec.pills.map(([cls,t],i)=><span key={i} className={'pill '+cls}>{t}</span>)}</div>
    <dl>{spec.rows.filter(r=>r[1]!==''&&r[1]!=null).map(([a,b])=><React.Fragment key={a}><dt>{a}</dt><dd>{String(b)}</dd></React.Fragment>)}</dl>
    {spec.note?<div className={'note'+(spec.naNote?' na':'')}>{spec.note}</div>:null}
    {spec.desc?<div><div className="eyebrow" style={{marginBottom:6}}>Description</div><p className="desc">{spec.desc}</p></div>:null}
    {spec.links.length?<div className="row">{spec.links.map(([href,t])=><a key={href} className="btn" href={href} onClick={close}>{t}</a>)}</div>:null}
   </div>
  </div>
 </dialog>;
}
export default SheetHost;
