// The downloads page, ported from the old index.html: for each plant its Excel machine list and its PDF brochure (with
// links to the list and brochure tabs of the plant), the complete workbook and brochure for all three plants, and the
// page viewer of the complete brochure. The files are served next to the app, so each download is a plain link.
import React from 'react';
import {D,FILES,SHEETS,hashSub} from './data.js';
import {DlLink,Viewer} from './Plant.jsx';

function File({kind,name,info}){return <div className="fi"><div className={'fileicon'+(kind==='pdf'?' p':'')}>{kind==='pdf'?'PDF':'XLSX'}</div><div><b>{name}</b><span>{info}</span></div></div>}

export default function Downloads(){const all=FILES.pdf.all;
 return <section className="page col">
  <div className="sechead"><div className="eyebrow">Downloads</div><h1>Machine lists and brochures</h1><p className="lede">One Excel machine list and one PDF brochure for each plant, and a complete brochure and workbook covering all three. Each Excel file has the stations of every line with live summary counts, the machine models, the equipment categories, the not-available stations and the full lot index.</p></div>
  <div className="dlgrid">
   {D.factories.map(f=>{const p=FILES.pdf[f.key];return <div className="card dlc" key={f.key}><div className="eyebrow">{f.name}</div>
    <File kind="xlsx" name={FILES.xlsx[f.key]} info="Machine list · 7 sheets with live summary counts"/>
    <div className="row"><a className="btn2 sm" href={hashSub(f.key,'list')}>View list</a><DlLink cls="btn sm" file={FILES.xlsx[f.key]}>Download Excel</DlLink></div>
    <File kind="pdf" name={p.name} info={`Brochure · ${p.pages} pages · ${p.mb} MB`}/>
    <div className="row"><a className="btn2 sm" href={hashSub(f.key,'brochure')}>View brochure</a><DlLink cls="btn sm" file={p.name}>Download PDF</DlLink></div>
   </div>})}
   <div className="card dlc"><div className="eyebrow">All three plants</div>
    <File kind="xlsx" name={FILES.xlsx.all} info="Complete machine list · all plants in one workbook"/>
    <div className="row"><DlLink cls="btn sm" file={FILES.xlsx.all}>Download Excel</DlLink></div>
    <File kind="pdf" name={all.name} info={`Complete brochure · ${all.pages} pages · ${all.mb} MB`}/>
    <div className="row"><DlLink cls="btn sm" file={all.name}>Download PDF</DlLink></div>
   </div>
  </div>
  <div className="sechead" style={{marginTop:8}}><h2>Complete brochure</h2><p className="lede">All three plants in one document: plant overviews, plant layouts, every production line with its 3D view and machines, the equipment catalogue with photographs, and the not-available list.</p></div>
  <div className="card dl">
   <File kind="pdf" name={all.name} info={`${all.pages} pages · A4 landscape · ${all.mb} MB`}/>
   <div className="row"><DlLink file={all.name}>Download complete brochure</DlLink></div>
  </div>
  <Viewer m={SHEETS.all} label="Complete brochure pages"/>
 </section>}
