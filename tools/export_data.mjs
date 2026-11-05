// Export the portal's embedded data (index.html: const D, FILES, MAP2D, HOMEIMG, KEYPLAN, HERO, HXH, HXT, HOMEP, HVIEWS,
// SUBS, ST) to react/src/data/portal.json for the React app.   node tools/export_data.mjs
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import vm from 'node:vm';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=join(dirname(fileURLToPath(import.meta.url)),'..');
const s=readFileSync(join(root,'index.html'),'utf8');
const names=['D','FILES','MAP2D','HOMEIMG','KEYPLAN','HERO','HXH','HXT','HOMEP','HVIEWS','SUBS','ST','HXF'];
const lines=s.split('\n').filter(l=>names.some(n=>l.startsWith(`const ${n}=`)));
const ctx={};vm.createContext(ctx);
for(const l of lines){try{vm.runInContext(l.replace(/^const /,'var ').replace(/;const STANDALONE=true;?$/,';'),ctx)}catch(e){console.warn('skip',l.slice(0,30),e.message)}}
const out={};for(const n of names)if(ctx[n]!==undefined)out[n]=ctx[n];
mkdirSync(join(root,'react/src/data'),{recursive:true});
writeFileSync(join(root,'react/src/data/portal.json'),JSON.stringify(out));
console.log('portal.json:',Object.keys(out).join(' '),'| rows',out.D.rows.length,'halls',Object.keys(out.D.halls).length,'map halls',Object.keys(out.MAP2D).length,'items',Object.values(out.MAP2D).reduce((n,m)=>n+m.items.length,0));
