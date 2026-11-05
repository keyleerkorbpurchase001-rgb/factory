// Entry point of the Plant Machinery Portal. It mounts <App/> (the hash router, the top nav and the pages) once the
// fonts the pages and the 3D halls paint with are ready, like factory-line's main.jsx: the 3D signs, floor names and
// machine screens are painted on canvases once, so they must not be painted with a fallback face. The wait is capped
// at 2 s in case the font service is blocked.
import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.jsx';
import './style.css';

// Photos: retry any image that fails to load (a busy server or a network hiccup), as the old site did. Up to four
// tries per <img>, backing off 0.7 s, 2.8 s, 6.3 s, 11.2 s; the retry fetches the file bypassing the cache and shows
// it from a blob, or as a last resort re-sets the src.
const imgTries=new WeakMap();
document.addEventListener('error',e=>{const im=e.target;if(!im||im.tagName!=='IMG')return;const src=im.getAttribute('src');if(!src||/^(data|blob):/.test(src))return;
 const n=(imgTries.get(im)||0)+1;if(n>4)return;imgTries.set(im,n);
 setTimeout(()=>{if(im.getAttribute('src')!==src)return;fetch(src,{cache:'reload'}).then(r=>{if(!r.ok)throw 0;return r.blob()}).then(b=>{if(im.getAttribute('src')===src)im.src=URL.createObjectURL(b)}).catch(()=>{if(im.getAttribute('src')===src){im.removeAttribute('src');im.src=src}})},700*n*n)},true);

const start=()=>createRoot(document.getElementById('root')).render(<App/>);
Promise.race([Promise.all(['600 54px "IBM Plex Sans"','700 84px "IBM Plex Sans"','500 28px "IBM Plex Mono"'].map(f=>document.fonts?.load(f))),new Promise(r=>setTimeout(r,2000))]).catch(()=>{}).then(start);
