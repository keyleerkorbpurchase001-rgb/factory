// The logic that decides what every placed machine looks like. For a catalogue row (station, machine name, weight,
// supply, year, note, photo) MR.resolve() returns {kind, src, opts, count, make, model, size} where
//   src 'plant' = factory-line SMT / LED / IMM line model (FL.createPlantModels().machine),
//   src 'fl'    = factory-line builder (FL.builders[kind]),
//   src 'mb'    = the portal's own builder (machines/*.js, window.MB),
//   src 'none'  = keep the page's own housing (dressed by hall-kit's detail pass).
// Rules are tried in order: 1. station role rules (what the station does on the line), 2. machine make / model
// rules (what the catalogue name says), 3. the factory-line text rules (auction titles), 4. a weight-class fallback.
// The first matching rule wins, so put specific rules before general ones. Every rule: [regex on "station | name", kind, src, opts?]
(function(){
'use strict';
const MR=window.MR={};
const R=(re,kind,src,opts)=>[re,kind,src,opts||{}];
// 1. station roles (portal station names)
MR.STATION=[
 R(/evaporator line|tube wrapping|compartment forming|sheet check|overhead conveyor|washing machine|part of line|partner online/i,'none','none'),
 R(/co-?extrusion|extrusion/i,'extruder','fl'),R(/coil|decoil|uncoiler|slitting|cut-to-length/i,'mill','fl'),R(/painting booth|powder paint|paint line|coating line/i,'coater','fl'),
 R(/ftir|infrared spectro|spectrophotometer/i,'ftir','mb'),R(/\bups\b|backup power|servers|firewall|^it$/i,'cabinet','fl'),R(/monitors|displays|lockers/i,'rack','fl'),R(/\bcmm\b|coordinate measuring|zeiss (contura|prismo)/i,'cmm','mb'),
 R(/^(pcb|magazine) loading|magazine load(er)?$/i,'loader','plant'),R(/dual multi loader|KDLSVL/i,'magazineLoader','mb',{dual:true}),
 R(/pcb unloading|magazine unload|KFU-|KDUSVP|unloaders?\b/i,'magazineUnloader','mb'),
 R(/document print|line matrix|office print/i,'cabinet','fl'),R(/paste print|screen print|stencil print|solder paste printing/i,'printer','plant'),R(/paste insp|\bspi\b/i,'spi','plant'),R(/optical insp|\baoi\b|x-?ray/i,'aoi','plant'),
 R(/pick ?& ?place|placement|mounter/i,'pnp','plant'),R(/reflow/i,'reflow','plant'),R(/laser mark/i,'marker','plant'),R(/clean/i,'cleaner','plant'),
 R(/ng sort|good ?\/ ?ng|sorting/i,'ngSorter','mb'),R(/board flip|\bflip/i,'boardFlipper','mb'),
 R(/weight measurement buffer/i,'pcbBuffer','mb',{weigh:true}),R(/pcb buffer|ng buffer|belt buffer|buffer conveyor|\bbuffers?\b/i,'pcbBuffer','mb'),
 R(/cooling conveyor/i,'coolingConveyor','mb'),R(/turntable/i,'turntable','mb'),R(/lifter|vertical lifting/i,'lifterConveyor','mb'),
 R(/transfer conveyor|overhead suction|finger gripper|light-curtain/i,'transferConveyor','mb'),
 R(/shuttle conveyor|KSC-|KDSC/i,'pcbConveyor','mb',{type:'shuttle'}),R(/gateway conveyor|KGC/i,'pcbConveyor','mb',{type:'gateway'}),R(/dual(-| )rail|dual connecting/i,'pcbConveyor','mb',{type:'dual'}),
 R(/connect(ion|ing) conveyor|KCC-|KCBB|line conveyors/i,'pcbConveyor','mb',{type:'connect'}),
 R(/chain roller|chain convey/i,'chainConveyor','mb'),R(/roller convey|roller conveyor/i,'rollerConveyor','mb'),
 R(/take-?off|incline/i,'beltConveyor','mb',{incline:true}),R(/belt convey|foam belt|part conveyor|eurotherm/i,'beltConveyor','mb'),
 R(/hopper loader|vacuum loader|material loader|resin loader/i,'cabinet','fl'),R(/mo(u)?ld temperature|temperature controller|chiller|cooling unit/i,'cabinet','fl'),
 R(/injection mo(u)?ld|engel/i,'press','plant'),R(/resin dry|dryer/i,'dryer','plant'),R(/take-?out robot|robot/i,'robot','plant'),R(/granulat|regrind/i,'granulator','fl'),
 R(/quick mo(u)?ld change|QMC/i,'qmcSystem','mb'),R(/filter unit|vacuum conveying/i,'filterUnit','mb'),
 R(/shot blast|roto-?jet|monorail/i,'shotBlast','mb'),R(/laser cell|trulaser cell|3d laser/i,'laserCell','mb'),
 R(/band ?saw|sawing|pilous/i,'bandSaw','mb'),R(/mill-?drill|milling & drilling|bench drill/i,'millDrill','mb'),R(/work ?bench|benches & spares|tool sets/i,'workBench','mb'),R(/granite|surface plate|dimensional metrology/i,'surfacePlate','mb'),
 R(/stretch wrap/i,'stretchWrapper','mb'),R(/shrink-?hood|coverpal/i,'shrinkHoodPacker','mb'),R(/shrink wrap/i,'shrinkWrapper','mb'),R(/strapping|banding/i,'strappingMachine','mb'),
 R(/floor scale/i,'floorScale','mb'),R(/platform scale|weighing|\bscales?\b/i,'platformScale','mb'),R(/label(l)?ing|label printer/i,'labelPrinterStation','mb'),
 R(/hand pallet truck|pallet moving/i,'palletTruck','mb'),R(/high-rack stack|EKX|reach truck/i,'reachStacker','mb'),R(/yard tractor|terminal tractor/i,'yardTractor','mb'),
 R(/trolleys|lifting frame/i,'trolleySet','mb'),R(/spill|containment/i,'spillTray','mb'),R(/attachments|clamp attachment/i,'attachmentSet','mb'),
 R(/pallet racking|racking/i,'rack','fl'),R(/shelving/i,'rack','fl'),R(/forklift|fork ?lift|stacker/i,'forklift','fl'),R(/autonomous transport|\bagv\b|guided vehicle/i,'agv','plant'),
 R(/waveform|oscilloscope|tektronix/i,'instrumentRack','mb',{style:'scope'}),R(/power measurement|power meter|yokogawa wt/i,'instrumentRack','mb',{style:'meter'}),
 R(/pattern gen|stream playback|broadcast signal|rf amplif|generator|amplifier/i,'instrumentRack','mb',{style:'gen'}),
 R(/spectroradiomet|photomet|chroma meter|color analysis|colour analysis/i,'tripodMeter','mb'),R(/ftir|infrared spectro|spectrophotometer/i,'ftir','mb'),
 R(/microscope|videoscope|^inspection$/i,'microscopeStation','mb'),R(/calibrat|strain recorder|charged plate/i,'calibrationBench','mb'),
 R(/reball|bga/i,'reballingStation','mb'),R(/paste thaw/i,'pasteThawer','mb'),R(/vacuum seal|vacuum pack/i,'vacuumSealer','mb'),
 R(/duplicat|media duplication/i,'duplicatorStation','mb'),R(/splicing/i,'splicingStation','mb'),R(/barcode|code reading/i,'barcodeStation','mb'),
 R(/esd storage|esd pcb|magazine rack/i,'esdRack','mb'),R(/inspection rack|ECT-OFF/i,'inspectionRack','mb'),
 R(/black color|colour inspect|color inspect|electric test|in-line test|module test|^test/i,'tester','plant'),R(/visual insp|final insp/i,'tester','plant'),
 R(/autoclave/i,'autoclave','plant'),R(/curing oven|\boven\b/i,'oven','plant'),R(/programming|programmer/i,'programmer','plant'),
 R(/gauges & meters|calipers|micrometer/i,'calibrationBench','mb'),
];
// 2. make / model rules (the catalogue name)
MR.MAKE=[
 R(/KI ?HEUNG.*KFL|famecs.*loader/i,'magazineLoader','mb'),R(/KI ?HEUNG.*KFU/i,'magazineUnloader','mb'),R(/KGNB|FRNB/i,'ngSorter','mb'),R(/KIV-/i,'boardFlipper','mb'),R(/KHC-/i,'coolingConveyor','mb'),
 R(/trumpf.*cell/i,'laserCell','mb'),R(/trumpf|bystronic|amada/i,'laser','fl'),R(/schlick|spencer & halstead|wheelabrator/i,'shotBlast','mb'),
 R(/schuler|m[üu]ller weingarten|\bphs\b|stamping press|press line/i,'stampingPress','fl'),R(/furnace|roller hearth/i,'furnace','fl'),
 R(/\bdmg\b|mazak|haas|okuma|hermle|machining cent/i,'machiningCenter','fl'),R(/grinder|grinding/i,'grinder','fl'),R(/lathe/i,'lathe','fl'),R(/hobbing/i,'hobbing','fl'),R(/welding|welder/i,'welding','fl'),
 R(/compressor|kaeser|atlas copco/i,'compressor','fl'),R(/extruder/i,'extruder','fl'),R(/transformer/i,'transformer','fl'),R(/genset|generator set|diesel generator/i,'genset','fl'),R(/coater|coating/i,'coater','fl'),
 R(/\btank\b|silo/i,'tank','fl'),R(/shredder/i,'shredder','fl'),R(/baler/i,'baler','fl'),R(/incubator/i,'incubator','fl'),R(/freezer/i,'freezer','fl'),R(/centrifuge/i,'centrifuge','fl'),R(/fume hood|laminar/i,'hood','fl'),
 R(/kuka|fanuc|abb irb|yaskawa|motoman|robot/i,'robot','plant'),R(/engel|arburg|krauss|husky|injection/i,'press','plant'),R(/shini|moretto.*dry|motan.*dry|dehumidif/i,'dryer','plant'),
 R(/zebra|datamax|label printer/i,'labelPrinterStation','mb'),R(/siat|stretch/i,'stretchWrapper','mb'),R(/smipack/i,'shrinkWrapper','mb'),R(/feifer|strapping/i,'strappingMachine','mb'),
 R(/jungheinrich|linde|toyota.*truck|still\b/i,'forklift','fl'),R(/kalmar|terberg/i,'yardTractor','mb'),R(/denios/i,'spillTray','mb'),R(/kaup/i,'attachmentSet','mb'),
 R(/tektronix|oscilloscope/i,'instrumentRack','mb',{style:'scope'}),R(/yokogawa|power meter/i,'instrumentRack','mb',{style:'meter'}),R(/eiden|shibasoku|r&s|rohde|MSPG|MTX100/i,'instrumentRack','mb',{style:'gen'}),
 R(/konica|radiant|photometer/i,'tripodMeter','mb'),R(/shimadzu|ftir/i,'ftir','mb'),R(/hirox|olympus|keyence vhx|microscope/i,'microscopeStation','mb'),R(/keyence sr|barcode/i,'barcodeStation','mb'),
 R(/cabinet|control panel|switchboard|electrical panel|controller/i,'cabinet','fl'),R(/bench|table|desk/i,'workBench','mb'),R(/rack|shelv/i,'rack','fl'),R(/conveyor/i,'beltConveyor','mb'),R(/cart|trolley/i,'trolleySet','mb'),
];
const FL_SKIP=new Set(['site','bench','sorter']);
const num=s=>{const m=String(s||'').replace(/,/g,'').match(/(\d+(\.\d+)?)/);return m?+m[1]:0};
// how many units the lot holds: "3 × ...", "(2)", "12 × ..." at the start of the name
MR.count=name=>{const n=String(name||'');let m=n.match(/^\s*(\d+)\s*[×x]\s/i);if(m)return Math.max(1,Math.min(99,+m[1]));m=n.match(/\((\d+)\s*(of|units|pcs)?\)/i);if(m&&+m[1]>1)return +m[1];m=n.match(/^(\d+)\s+(steel|hand|motor)/i);return m?+m[1]:1};
MR.makeModel=name=>{const words=String(name||'').replace(/^\s*\d+\s*[×x]\s*/i,'').replace(/\s+/g,' ').trim().split(' ');let make=words[0]||'',model=words.slice(1).join(' ');
 if(/^(ki|koh|the|itw|samsung|carl|müller|mueller|ta|ts|na|cm|won|vary|spencer|solutech|konica|c&c)$/i.test(make)&&words[1]){make=words.slice(0,2).join(' ');model=words.slice(2).join(' ')}return {make,model}};
MR.resolve=function(row){const station=row.station||'',name=row.name||'',text=station+' | '+name;
 if(!name||row.kind==='na')return null;
 let hit=null;for(const rules of [MR.STATION,MR.MAKE]){for(const [re,kind,src,opts] of rules)if(re.test(text)){hit={kind,src,opts:Object.assign({},opts),rule:re.source};break}if(hit)break}
 if(!hit&&window.FL&&FL.kindOf){const k=FL.kindOf(text);if(k&&!FL_SKIP.has(k)){const PLANT=['safety','colour','signal','loader','unloader','marker','cleaner','printer','spi','pnp','reflow','aoi','buffer','programmer','tester','process','press','dryer','robot','agv','cnc','oven','autoclave'];hit={kind:k,src:PLANT.includes(k)?'plant':FL.builders&&FL.builders[k]?'fl':'none',opts:{},rule:'fl'}}}
 if(!hit){const w=num(row.weight);hit=w>=3000?{kind:'cabinet',src:'fl',opts:{},rule:'weight'}:w>=200?{kind:'cabinet',src:'fl',opts:{},rule:'weight'}:{kind:'workBench',src:'mb',opts:{},rule:'fallback'}}
 // the portal's own builders need machines/*.js; if a kind is not registered yet, fall back to the page body
 if(hit.src==='mb'&&!(window.MB&&MB.has&&MB.has(hit.kind)))hit={kind:hit.kind,src:'none',opts:hit.opts,rule:hit.rule+' (no builder)'};
 if(hit.src==='none')hit.rule='keep page body';
 if(hit.src==='fl'&&!(window.FL&&FL.builders&&FL.builders[hit.kind]))hit.src='none';
 const mm=MR.makeModel(name);hit.count=MR.count(name);hit.make=mm.make;hit.model=mm.model;
 if(hit.opts.count===undefined&&hit.count>1)hit.opts.count=Math.min(4,hit.count);hit.opts.units=hit.opts.units||(hit.kind==='instrumentRack'?Math.min(12,Math.max(3,hit.count*2)):undefined);
 return hit};
// coverage of the whole catalogue: {plant, fl, mb, none, na} and the unresolved rows
MR.audit=function(HD){const c={plant:0,fl:0,mb:0,none:0,na:0},none=[];for(const [h,hall] of Object.entries(HD.halls))for(const r of hall.rows){const x=MR.resolve(r);if(!x){c.na++;continue}c[x.src]++;if(x.src==='none')none.push([h,r.station,r.name,x.kind,x.rule].join(' | '))}return {counts:c,none}};
})();
