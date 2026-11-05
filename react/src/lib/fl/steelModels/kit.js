// The shared kit every melt-shop model is built with (scene units = metres). Each model file exports builders
// `build<Kind>(K, item)` → {group, height, update(t, clock)}: the group's origin is the centre of the item's
// footprint on the floor (item.x, 0, item.z are applied by the caller), +x east along the process, +z towards
// the open front of the hall, y up. Everything created through the kit is disposed with it.
export function createKit(THREE){
 const owned=[];const keep=x=>{owned.push(x);return x};
 const mat=(color,metalness=.2,roughness=.6,extra={})=>keep(new THREE.MeshStandardMaterial({color,metalness,roughness,...extra}));
 const add=(m,x,y,z,parent)=>{m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;parent.add(m);return m};
 const box=(w,h,d,material,x,y,z,parent)=>add(new THREE.Mesh(keep(new THREE.BoxGeometry(w,h,d)),material),x,y,z,parent);
 // Cylinder along y (default), x or z; r1 (top) and r0 (bottom) may differ for cones and hoppers.
 const cyl=(r,h,material,x,y,z,parent,axis='y',seg=24,r0=r)=>{const g=keep(new THREE.CylinderGeometry(r,r0,h,seg));if(axis==='x')g.rotateZ(Math.PI/2);if(axis==='z')g.rotateX(Math.PI/2);return add(new THREE.Mesh(g,material),x,y,z,parent)};
 const sphere=(r,material,x,y,z,parent,seg=20)=>add(new THREE.Mesh(keep(new THREE.SphereGeometry(r,seg,seg/2)),material),x,y,z,parent);
 const torus=(r,tube,material,x,y,z,parent,axis='y',seg=28)=>{const g=keep(new THREE.TorusGeometry(r,tube,10,seg));if(axis==='y')g.rotateX(Math.PI/2);if(axis==='x')g.rotateY(Math.PI/2);return add(new THREE.Mesh(g,material),x,y,z,parent)};
 // A pipe through the points [[x,y,z],…] (straight runs, rounded at the corners).
 const pipe=(points,r,material,parent,seg=10)=>{const path=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),false,'catmullrom',.1);const m=new THREE.Mesh(keep(new THREE.TubeGeometry(path,Math.max(8,points.length*8),r,seg,false)),material);m.castShadow=m.receiveShadow=true;parent.add(m);return m};
 const canvasTex=(w,h,draw)=>{if(typeof document==='undefined')return null;const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=keep(new THREE.CanvasTexture(c));t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t};

 // Palette: the shop is painted in the grey-green of the photos, with rust and refractory browns, yellow
 // handrails, dark grating, concrete, and the glow of hot steel.
 const M={
  paint:mat(0x7f8d7c,.35,.55),paintDark:mat(0x55614f,.4,.55),steel:mat(0x9aa0a4,.7,.35),dark:mat(0x2e3134,.4,.6),black:mat(0x1c1d1f,.3,.7),
  rust:mat(0x8a5a3c,.3,.8),refractory:mat(0xb7a48a,.05,.95),concrete:mat(0xb9b7b0,.02,.92),concreteDark:mat(0x8f8d86,.02,.92),
  yellow:mat(0xe3b82e,.2,.55),grating:mat(0x3b3f43,.5,.6),panel:mat(0x8e9aa0,.6,.4),copper:mat(0xc27a3e,.6,.35),blue:mat(0x3d7ab8,.3,.5),red:mat(0xc8312a,.2,.5),
  white:mat(0xe8e8e3,.1,.55),cladding:mat(0xcfd3d2,.4,.5),electrode:mat(0x2a2a2c,.15,.5),slag:mat(0x3a3330,.1,.9),scrap:mat(0x6b665e,.6,.6),
  hot:mat(0xff7a1a,0,.8,{emissive:0xff5a00,emissiveIntensity:1.2}),hotDim:mat(0xb04a10,0,.8,{emissive:0xff4a00,emissiveIntensity:.5}),glass:mat(0xbcd4df,.1,.1,{transparent:true,opacity:.45}),
  lamp:mat(0xffffff,0,.3,{emissive:0xfff3dc,emissiveIntensity:1.2}),water:mat(0x4f8fb3,.2,.3),
 };

 // Grated platform (with a toe board) at height y; rails round the sides listed in open (e.g. 'nsew' = all).
 const platform=(parent,w,d,x,y,z,open='nsew')=>{box(w,.08,d,M.grating,x,y-.04,z,parent);const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);
  const side=(len,px,pz,rotY)=>{const r=new THREE.Group();r.position.set(px,0,pz);r.rotation.y=rotY;g.add(r);box(len,.04,.04,M.yellow,0,1.05,0,r);box(len,.03,.03,M.yellow,0,.55,0,r);box(len,.12,.02,M.yellow,0,.06,0,r);for(let s=-len/2+.1;s<=len/2;s+=1.5)box(.04,1.1,.04,M.yellow,s,.55,0,r)};
  if(open.includes('n'))side(w,0,-d/2,0);if(open.includes('s'))side(w,0,d/2,0);if(open.includes('w'))side(d,-w/2,0,Math.PI/2);if(open.includes('e'))side(d,w/2,0,Math.PI/2);return g};
 // A stair of steps from (x, y0, z) rising to y1, climbing along +x (rotate the returned group for others).
 const stair=(parent,x,y0,z,y1,width=1)=>{const g=new THREE.Group();g.position.set(x,y0,z);parent.add(g);const n=Math.max(2,Math.round((y1-y0)/.25)),run=(y1-y0)*1.1/n;
  for(let i=0;i<n;i++)box(run,.04,width,M.grating,i*run+run/2,(i+1)*(y1-y0)/n,0,g);for(const s of [-1,1]){box((y1-y0)*1.1+.2,.05,.05,M.yellow,(y1-y0)*.55,(y1-y0)/2+1,s*width/2,g).rotation.z=Math.atan2(y1-y0,(y1-y0)*1.1);
   for(let i=0;i<=n;i+=3)box(.04,1,.04,M.yellow,i*run,(i)*(y1-y0)/n+.5,s*width/2,g)}return g};
 // Steel column (I-section look) from the floor to height h.
 const column=(parent,x,z,h,size=.4,material=M.paint)=>{box(size,h,.06,material,x,h/2,z-size/2+.03,parent);box(size,h,.06,material,x,h/2,z+size/2-.03,parent);box(.06,h,size-.1,material,x,h/2,z,parent);box(size+.2,.04,size+.2,M.dark,x,.02,z,parent)};
 // Lattice truss beam along x of length len, height hh.
 const truss=(parent,len,hh,x,y,z,material=M.paint,axis='x')=>{const g=new THREE.Group();g.position.set(x,y,z);if(axis==='z')g.rotation.y=Math.PI/2;parent.add(g);
  for(const s of [-1,1]){box(len,.12,.12,material,0,s*hh/2,0,g)}for(let p=-len/2;p<=len/2;p+=hh)box(.08,hh,.08,material,p,0,0,g);for(let p=-len/2+hh/2;p<len/2;p+=hh){const d=box(.06,Math.hypot(hh,hh)-.1,.06,material,p,0,0,g);d.rotation.z=Math.PI/4*((Math.round((p+len/2)/hh))%2?1:-1)}return g};
 // Water-cooled tubular panel: horizontal tubes with a gap, as on the Tagliaferri sidewalls and the LF roof.
 const tubes=(parent,len,h,x,y,z,material=M.panel,r=.07,axis='x')=>{for(let yy=r;yy<h;yy+=r*2.6)cyl(r,len,material,x,y+yy,z,parent,axis,10)};
 // A hot glow lamp (point light) for tapping, arcs and the hot strands.
 const glow=(parent,x,y,z,color=0xff6a1a,intensity=6,dist=14)=>{const l=new THREE.PointLight(color,intensity,dist,2);l.position.set(x,y,z);parent.add(l);return l};
 // A nameplate decal (a canvas with the text) on a face.
 const plate=(parent,text,w,h,x,y,z,bg='#1c1b18',fg='#ecebe5',rotY=0)=>{const t=canvasTex(512,Math.round(512*h/w),(c,W,H)=>{c.fillStyle=bg;c.fillRect(0,0,W,H);c.fillStyle=fg;c.font=`700 ${Math.round(H*.5)}px "IBM Plex Sans", system-ui, sans-serif`;c.textAlign='center';c.textBaseline='middle';c.fillText(text,W/2,H/2,W-30)});
  const m=new THREE.Mesh(keep(new THREE.PlaneGeometry(w,h)),t?mat(0xffffff,0,.6,{map:t}):mat(0x1c1b18,0,.6));m.position.set(x,y,z);m.rotation.y=rotY;parent.add(m);return m};

 const dispose=()=>owned.forEach(x=>x.dispose?.());
 return {THREE,keep,mat,add,box,cyl,sphere,torus,pipe,canvasTex,M,platform,stair,column,truss,tubes,glow,plate,dispose};
}
