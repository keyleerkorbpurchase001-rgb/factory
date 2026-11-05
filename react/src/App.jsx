// The app shell: the hash router, the top nav of the old site (brand, Home and the three plants) and the one machine
// sheet dialog every page opens.
//
// Routes (everything by hash, so the static build works from any folder and old links keep a meaning):
//   #home or no hash          → Home
//   #f1 | #f2 | #f3           → the plant page on its Overview; #f1/<sub> opens a sub-tab (SUBS), and #f1/<sub>/<hall>
//                               preselects a hall on the map, flow and machine tabs
//   #<hall>, #<hall>/L<n>     → the hall in 3D (Hall3D, written by the 3D engine), on one of its lines
//   #downloads                → Downloads
// The old site's plant routes were #f1-map etc.; those are rewritten to #f1/map in place.
import React,{Suspense,lazy,useEffect,useRef,useState} from 'react';
import {D,F,H,SUBS} from './data.js';
import SheetHost from './Sheet.jsx';
import Home from './Home.jsx';
import Plant from './Plant.jsx';
import Downloads from './Downloads.jsx';

// Hall3D is written by the 3D engine and may not exist yet: a glob import resolves to nothing instead of failing the
// build, and the lazy component then rejects, which the error boundary below shows as the loading note. When the file
// appears, Vite re-evaluates the glob and the page picks it up on the next reload.
const hallMods=import.meta.glob('./Hall3D.jsx');
const Hall3D=lazy(()=>hallMods['./Hall3D.jsx']?hallMods['./Hall3D.jsx']():Promise.reject(new Error('Hall3D.jsx is not built yet')));

const SUBKEYS=new Set(SUBS.map(s=>s[0]));
// hash → {page, fk, sub, arg, hall, line}
export function parseRoute(hash){const h=decodeURIComponent((hash||'').replace(/^#/,''));
 if(!h||h==='home')return {page:'home'};
 if(h==='downloads')return {page:'downloads'};
 const old=h.match(/^(f[123])-([a-z0-9]+)$/);if(old&&SUBKEYS.has(old[2]))return {page:'plant',fk:old[1],sub:old[2],redirect:'#'+old[1]+(old[2]==='overview'?'':'/'+old[2])};
 const pm=h.match(/^(f[123])(?:\/([a-z0-9]+))?(?:\/([a-z0-9]+))?$/);
 if(pm&&F[pm[1]]){const sub=SUBKEYS.has(pm[2])?pm[2]:'overview';return {page:'plant',fk:pm[1],sub,arg:pm[3]||null}}
 const hm=h.match(/^([a-z0-9]+)(?:\/L(\d+))?$/i);
 if(hm&&H[hm[1]])return {page:'hall',hall:hm[1],line:hm[2]?+hm[2]:null,fk:D.factories.find(f=>f.halls.includes(hm[1]))?.key};
 return {page:'home'}}

// Shows the loading note while Hall3D is missing or failed to load, and for any error the 3D page throws, so the
// rest of the app keeps working. It resets when the hall changes.
class HallBoundary extends React.Component{
 constructor(p){super(p);this.state={err:null}}
 static getDerivedStateFromError(err){return {err}}
 componentDidUpdate(prev){if(prev.hall!==this.props.hall&&this.state.err)this.setState({err:null})}
 componentDidCatch(err){console.info('3D hall not available yet:',err&&err.message)}
 render(){return this.state.err?<div className="hall-fallback">3D hall loading…</div>:this.props.children}}

function Nav({route}){
 const cur=route.page==='home'?'home':route.fk;
 return <nav className="nav" aria-label="Site"><div className="navin">
  <a className="brand" href="#home"><i/><span>Plant Machinery Portal</span></a>
  <div className="tabs">
   <a href="#home" aria-current={cur==='home'?'page':undefined}>Home</a>
   {D.factories.map(f=><a key={f.key} href={'#'+f.key} aria-current={cur===f.key?'page':undefined}>{f.short_name}</a>)}
  </div>
 </div></nav>}

export default function App(){
 const [route,setRoute]=useState(()=>parseRoute(location.hash));
 useEffect(()=>{const fn=()=>{const r=parseRoute(location.hash);if(r.redirect){history.replaceState(null,'',r.redirect)}setRoute(r)};addEventListener('hashchange',fn);fn();return()=>removeEventListener('hashchange',fn)},[]);
 // Scroll to the top when the page changes (home, a plant, a hall, downloads) and when a plant opens on its overview;
 // switching between the sub-tabs of a plant keeps the position, since the tabs sit below the plant header.
 const last=useRef(null);
 const pageKey=route.page+':'+(route.fk||'')+':'+(route.hall||'');
 useEffect(()=>{if(last.current!==pageKey||route.page==='plant'&&route.sub==='overview')scrollTo(0,0);last.current=pageKey},[pageKey,route.sub,route.page]);
 // the home page paints the nav and the iOS safe-area strip in the hero's navy
 useEffect(()=>{document.body.classList.toggle('is-home',route.page==='home')},[route.page]);
 useEffect(()=>{document.title=route.page==='plant'?F[route.fk].name+' · Plant Machinery Portal':route.page==='hall'?H[route.hall].name+' in 3D · Plant Machinery Portal':route.page==='downloads'?'Downloads · Plant Machinery Portal':'Plant Machinery Portal'},[route]);
 let page;
 if(route.page==='plant')page=<main className="wrap"><Plant key={route.fk} fk={route.fk} sub={route.sub} arg={route.arg}/><Foot/></main>;
 else if(route.page==='downloads')page=<main className="wrap"><Downloads/><Foot/></main>;
 else if(route.page==='hall')page=<div className="hall-page"><HallBoundary hall={route.hall}><Suspense fallback={<div className="hall-fallback">3D hall loading…</div>}><Hall3D key={route.hall} hall={route.hall} line={route.line} fk={route.fk}/></Suspense></HallBoundary></div>;
 else page=<Home/>;
 return <div className="pmp"><Nav route={route}/>{page}<SheetHost/></div>}

function Foot(){return <p className="foot">Machine data and photographs come from the plants' public equipment listings. Line groupings, station assignments, equipment categories and the not-available list are an engineering assessment, not part of the listings. Availability, condition and terms are to be confirmed with each seller.</p>}
