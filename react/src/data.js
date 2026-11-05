// The portal's data and the small helpers every page shares. Everything comes from src/data/portal.json, which
// tools/export_data.mjs writes from the constants embedded in the old index.html (D, FILES, MAP2D, HOMEIMG, KEYPLAN,
// HERO, HXH, HXT, SUBS, ST, HXF), src/data/home.json (KEYPLAN, HXH, HXT, HXF, see below) and src/data/sheets.json, the
// brochure sprite-sheet index (SHEETS).
//
// Shapes: D.factories [{key,no,name,place,short,desc,source,halls:[hallKey],short_name,tag}];
// D.halls {key:{key,name,short,desc,lines:[{name,sub}],top:{w,h,W,D}}};
// D.rows [{hall,line,step,station,kind,lot,name,year,serial,supply,weight,note,f,ph:[url],lots:[lot]}] — a station of a
// line (line 0 / undefined = support equipment of the hall); kind is ok | alt | bundled | suggest | shared | na;
// D.models [{f,hall,name,station,kind,refs,lines,year,supply,weight,note,ph,img,qty}] — one card per machine model;
// D.catalog [{f,lot,title,year,desc,cat,ph,use,qty,sheet}] — the equipment catalogue; D.cats {f:[{name,group,lots,units}]};
// MAP2D {hall:{floor:{x0,x1,z0,z1}, items:[[rowIndex,x0,x1,z0,z1,(name)], …]}} — the 3D footprint of every placed row.
import P from './data/portal.json';
import SHEETS from './data/sheets.json';
// The home page's own constants (KEYPLAN: the country outlines of the plant cards; HXH / HXT / HXF: the hall drawn for
// each plant in the hero, its tab name and its showcase station) are kept in home.json as well, taken from the old
// index.html, so the home page does not depend on a regenerated portal.json still carrying them.
import HOME from './data/home.json';

const pick=k=>P[k]??HOME[k];
export const {D,FILES,MAP2D,HOMEIMG,HERO,SUBS,ST}=P;
export const KEYPLAN=pick('KEYPLAN'),HXH=pick('HXH'),HXT=pick('HXT'),HXF=pick('HXF');
export {SHEETS};
export const F=Object.fromEntries(D.factories.map(f=>[f.key,f]));
export const H=D.halls;

// Routes. The old hall pages were <hall>.html#L<n>; the app routes everything by hash: #home, #f1 (+ /<sub>, + /<hall>
// to preselect a hall on the map, flow and machines tabs), #<hall> for a hall in 3D, #<hall>/L<n> for one of its lines,
// #downloads.
export const hash3D=(hall,line)=>'#'+hall+(line?'/L'+line:'');
export const hashSub=(fk,sub,arg)=>'#'+fk+(sub&&sub!=='overview'?'/'+sub:'')+(arg?'/'+arg:'');
export const PREV=k=>k+'-preview.jpg';
export const TOPV=k=>'top/'+k+'-top.jpg';

export const lineRows=D.rows.filter(r=>r.line);
export const placed=r=>r.kind!=='na'&&r.kind!=='shared';
export const lineName=(h,l)=>(H[h].lines[l-1]||{}).name||('Line '+l);
export const catBy={};D.catalog.forEach(c=>{catBy[c.f+':'+c.lot]=c});
export const lotOf=(fk,ref)=>catBy[fk+':'+ref];
export const lotPh=(fk,l,i)=>{const c=catBy[fk+':'+l];return c?(c.ph[i]||c.ph[0]||''):''};
export const himg=(k,fb)=>HOMEIMG[k]||fb;
// the three catalogue photos shown in the plant header mosaic
export const heroPh=fk=>HERO[fk].map(l=>{const c=catBy[fk+':'+l];return c&&c.ph[0]}).filter(Boolean);
// counts for the plant header and the overview lede
export const fStats=fk=>{const rs=lineRows.filter(r=>r.f===fk);const hs=F[fk].halls;const cs=D.catalog.filter(c=>c.f===fk);
 return {halls:hs.length,lines:hs.reduce((a,h)=>a+H[h].lines.length,0),stations:rs.length,placed:rs.filter(placed).length,shared:rs.filter(r=>r.kind==='shared').length,na:rs.filter(r=>r.kind==='na').length,lots:cs.length,units:cs.reduce((a,c)=>a+(c.qty||1),0),photos:cs.reduce((a,c)=>a+c.ph.length,0),models:D.models.filter(m=>m.f===fk).length,cats:D.cats[fk].length}};
export const pad2=n=>String(n).padStart(2,'0');
export const reduceMotion=()=>typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
