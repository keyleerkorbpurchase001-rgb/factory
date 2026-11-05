// Screenshot one machine model on the test bench from several views with headless Chrome:
//   node tools/model_shot.mjs "kind=laserCell&src=mb&w=3&d=2&h=2.2&name=Trumpf+TruLaser+Cell+8030" out/laser [iso,front,side,top,close]
// Writes out/laser-iso.png, out/laser-front.png … and prints the model's bounding box and any build error.
// The site must be served on http://127.0.0.1:8080 (python3 -m http.server 8080 --bind 127.0.0.1 in the portal folder).
import {spawn} from 'node:child_process';
import {writeFileSync,mkdtempSync,mkdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
const [query,out,viewsArg='iso,front,side,close']=process.argv.slice(2);const views=viewsArg.split(',');
const base=process.env.BASE||'http://127.0.0.1:8080';const port=9500+Math.floor(Math.random()*400);
mkdirSync(dirname(out),{recursive:true});
const chrome=spawn(process.env.CHROME||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--disable-gpu-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--hide-scrollbars',`--remote-debugging-port=${port}`,`--user-data-dir=${mkdtempSync(join(tmpdir(),'mshot-'))}`,'--window-size=1000,800','about:blank'],{stdio:'ignore'});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
let tabs;for(let i=0;i<60;i++){try{tabs=await (await fetch(`http://127.0.0.1:${port}/json`)).json();if(tabs.length)break}catch{}await wait(250)}
const ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
let id=0;const pending=new Map(),errors=[];ws.onmessage=e=>{const m=JSON.parse(e.data);if(pending.has(m.id)){pending.get(m.id)(m);pending.delete(m.id)}
 if(m.method==='Runtime.exceptionThrown')errors.push((m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text||'').slice(0,400));
 if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error')errors.push(m.params.args.map(a=>a.value||a.description).join(' ').slice(0,400))};
const send=(method,params={})=>new Promise(r=>{pending.set(++id,r);ws.send(JSON.stringify({id,method,params}))});
const evaluate=async expr=>{const r=await send('Runtime.evaluate',{expression:expr,returnByValue:true});return r.result?.result?.value};
await send('Runtime.enable');await send('Emulation.setDeviceMetricsOverride',{width:1000,height:800,deviceScaleFactor:1,mobile:false});
await send('Page.navigate',{url:`${base}/tools/model_test.html?${query}&t=${Date.now()}`});
let ok=false;for(let i=0;i<60;i++){await wait(500);if(await evaluate('!!window.READY')){ok=true;break}}
if(!ok){console.log('page did not get ready',errors.slice(0,3));chrome.kill();process.exit(1)}
console.log('INFO',JSON.stringify(await evaluate('window.INFO')));
for(const v of views){await evaluate(`setView(${JSON.stringify(v)})`);await wait(700);const shot=await send('Page.captureScreenshot',{format:'png'});writeFileSync(`${out}-${v}.png`,Buffer.from(shot.result.data,'base64'));console.log('saved',`${out}-${v}.png`)}
if(errors.length)console.log('ERRORS',errors.slice(0,3).join('\n'));
ws.close();chrome.kill();
