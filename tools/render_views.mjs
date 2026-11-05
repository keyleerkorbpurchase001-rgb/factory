// Re-render every 3D hall's plan view (top/<hall>-top.jpg, shown on the plant layout tab) and preview photograph
// (<hall>-preview.jpg, shown on the hall cards) with headless Chrome, and write each plan's size into
// top/_sizes.json (tools/apply_sizes.py puts it into index.html). The site must be served locally first:
//   python3 -m http.server 8080 --bind 127.0.0.1
//   node tools/render_views.mjs [--base http://127.0.0.1:8080] [--only top|preview] [hall ...]
import {spawn, execFileSync} from 'node:child_process';
import {writeFileSync, mkdtempSync, readFileSync, existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=join(dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2);const opt=(k,d)=>{const i=args.indexOf(k);return i>=0?args[i+1]:d};
const base=opt('--base','http://127.0.0.1:8080'),only=opt('--only','');
const halls=args.filter((a,i)=>!a.startsWith('--')&&args[i-1]!=='--base'&&args[i-1]!=='--only');
const data=readFileSync(join(root,'hall-data.js'),'utf8');const HD=JSON.parse(data.slice(data.indexOf('{'),data.lastIndexOf(';')));
const list=halls.length?halls:HD.factories.flatMap(f=>f.halls);
const port=9400+Math.floor(Math.random()*50);
const chrome=spawn(process.env.CHROME||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--disable-gpu-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--hide-scrollbars',`--remote-debugging-port=${port}`,`--user-data-dir=${mkdtempSync(join(tmpdir(),'views-'))}`,'--window-size=1500,1900','about:blank'],{stdio:'ignore'});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
let tabs;for(let i=0;i<40;i++){try{tabs=await (await fetch(`http://127.0.0.1:${port}/json`)).json();if(tabs.length)break}catch{}await wait(250)}
const ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
let id=0;const pending=new Map(),errors=[];ws.onmessage=e=>{const m=JSON.parse(e.data);if(pending.has(m.id)){pending.get(m.id)(m);pending.delete(m.id)}
 if(m.method==='Runtime.exceptionThrown')errors.push((m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text||'').slice(0,300))};
const send=(method,params={})=>new Promise(r=>{pending.set(++id,r);ws.send(JSON.stringify({id,method,params}))});
const evaluate=async expr=>{const r=await send('Runtime.evaluate',{expression:expr,returnByValue:true});return r.result?.result?.value};
await send('Runtime.enable');await send('Emulation.setDeviceMetricsOverride',{width:1500,height:1900,deviceScaleFactor:1,mobile:false});
await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:'light'}]});
const sizes=existsSync(join(root,'top','_sizes.json'))?JSON.parse(readFileSync(join(root,'top','_sizes.json'),'utf8')):{};
async function render(hall,mode){errors.length=0;await send('Page.navigate',{url:`${base}/${hall}.html?${mode}=1&t=${Date.now()}`});
 let ok=false;for(let i=0;i<80;i++){await wait(500);if(await evaluate('!!(window.HK&&HK.ready)')){ok=true;break}}
 if(!ok){console.log(hall,mode,'did not get ready',errors.slice(0,2));return}
 if(mode==='shot'){for(let i=0;i<60;i++){const d=await evaluate('[(window.HK&&HK.skinQueue||[]).length,window.HK&&HK.skinned||0]');if(!d[0]||d[1]>=d[0])break;await wait(500)}await wait(1500)}
 await wait(1200);
 const r=await evaluate('(()=>{const e=document.getElementById("hk-view").getBoundingClientRect();return {x:e.left+scrollX,y:e.top+scrollY,w:e.width,h:e.height,ts:HK.topSize||null}})()');
 if(!r){console.log(hall,mode,'no view');return}
 const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:r.x,y:r.y,width:r.w,height:r.h,scale:1}});
 const png=join(tmpdir(),`${hall}-${mode}.png`);writeFileSync(png,Buffer.from(shot.result.data,'base64'));
 const out=mode==='top'?join(root,'top',`${hall}-top.jpg`):join(root,`${hall}-preview.jpg`);
 execFileSync('sips',['-s','format','jpeg','-s','formatOptions','82',png,'--out',out],{stdio:'ignore'});
 if(mode==='top'&&r.ts)sizes[hall]=r.ts;
 console.log(hall,mode,`${Math.round(r.w)}×${Math.round(r.h)}`,r.ts?`${r.ts.W} × ${r.ts.D} m`:'',errors.length?'errors: '+errors[0]:'')}
for(const h of list){if(only!=='preview')await render(h,'top');if(only!=='top')await render(h,'shot')}
writeFileSync(join(root,'top','_sizes.json'),JSON.stringify(sizes,null,1));
ws.close();chrome.kill();console.log('done:',list.length,'halls');
