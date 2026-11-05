// KIND_RULES from factory-line src/maynards.js (text → model kind).
export const KIND_RULES=[
 [/magazine loader|vacuum loader|auto pcb stacker|^loader/i,'loader'],[/unloader/i,'unloader'],[/laser mark/i,'marker'],[/particle clean|pcb clean|metal mask clean|nozzle clean|plasma/i,'cleaner'],
 [/screen print|stencil print/i,'printer'],[/\bspi\b|solder paste insp/i,'spi'],[/chip mounter|pick.?and.?place|placement|mounter/i,'pnp'],[/reflow/i,'reflow'],[/\baoi\b|optical insp|vision insp|3d insp|x-?ray/i,'aoi'],
 [/optical sorter|sorter|sorting|screen(ing)? machine|\bscreen\b|trommel|separator/i,'sorter'],[/conveyor|buffer|flip station|gateway|shuttle/i,'buffer'],[/programmer|programming|rom writer/i,'programmer'],[/flux spray|dotting|cob remov|uv mo(u)?ld|dispens|plasma/i,'process'],[/electric tester|\bict\b|in-?circuit|function test|bond tester|tester|rework|check-right|leak test|\btest(?!\s*(bench|stand|rig))\b/i,'tester'],
 [/colou?r analy[sz]er/i,'colour'],[/signal generator/i,'signal'],[/safety analy[sz]er/i,'safety'],[/injection mo(u)?ld|husky|hypet|thermo?forming|foaming/i,'press'],[/baler|baling|bale press/i,'baler'],
 [/stamping|presses|press line|hydraulic press|mechanical press|servo press|c-frame press|eccentric press|crank press|frame press|straight.?side|press hardening|deep draw|blanking|transfer press|schuler|forming line|sheet forming|punch/i,'stampingPress'],[/\bpress\b/i,'stampingPress'],
 [/resin dryer|material dryer|dehumidif/i,'dryer'],[/extrud/i,'extruder'],[/granulat|pelletiz|crusher|regrind|washing line|recycling line/i,'granulator'],[/shredder|bale breaker|bale opener/i,'shredder'],
 [/industrial robot|kuka|fanuc|abb irb|yaskawa|robot/i,'robot'],[/\bagv\b|mobile robot/i,'agv'],
 [/machining cent|vertical machining|horizontal machining|5-axis|makino|sw ba|\bdmg\b|hermle|heller|grob/i,'machiningCenter'],[/hobbing|gear grind|gear shap|gear hon|deburr|gleason|liebherr lc|reishauer|kapp/i,'hobbing'],
 [/cnc lathe|turning|lathe/i,'lathe'],[/roll grinder|grinding|grinder|honing/i,'grinder'],[/cnc router|depanel|\bcnc\b|cutting machine|slitting|cutting and/i,'cnc'],[/welding|weld cell|laser weld/i,'welding'],[/fiber laser|laser source|laser cutt|\bipg\b/i,'laser'],
 [/turbine|genset|generator set/i,'genset'],[/strip mill|rolling mill|rolling cell|mill stand|skin.?pass|cold mill|coil processing|decoiler|straightener|straightening|coil line/i,'mill'],[/annealing|furnace|bell furnace|heat treat|kiln/i,'furnace'],[/transformer|switchgear|mv cabinet/i,'transformer'],
 [/compressor|air dryer|refrigerant dryer|vacuum pump/i,'compressor'],[/test bench|test stand|dyno|teststand|horiba|digatron|battery tester|cycler|measurement station|tensile test/i,'testbench'],[/coater|coating/i,'coater'],
 [/bioreactor|fermenter|fermentor|wave bag|cell culture system/i,'bioreactor'],[/incubator|shaker/i,'incubator'],[/-\s?(80|86|150)\s?°?\s?c\b|\bult\b|ultra.?low|freezer|cryo|liquid nitrogen|dewar/i,'freezer'],[/biosafety|laminar|flow hood|fume hood|safety cabinet|clean bench|isolator/i,'hood'],
 [/centrifuge/i,'centrifuge'],[/3d scan|\bcmm\b|coordinate measuring/i,'tester'],
 [/cytomet|hplc|uplc|chromatograph|spectro|microscope|analy[sz]er|plate reader|\bpcr\b|sequenc|nucleofector|incucyte|balance|pipett|osmomet|counter|flow cytom|\blab\b|laborator|imager|reader|scanner|homogeni|thermocycler|autoclave|washer|sterili|water bath|ph meter|titrat|microplate|qpcr|luminomet|electrophoresis|vi-cell|dropsense|\bensp\b|chromium|kinexa|\bfacs\b/i,'bench'],
 [/tank|vessel|silo|hopper|reactor|wastewater|water treatment|steam generator|boiler/i,'tank'],[/\bracks?\b|shelving|racking|mezzanine/i,'rack'],[/forklift|fork lift|stacker|pallet truck|reach truck/i,'forklift'],
 [/oven|curing|\bcure\b|dry cabinet|drying/i,'oven'],[/cabinet|control panel|electrical panel|\bplc\b|chiller|cooling unit|cooler|frigel|temperature control|hot runner controller/i,'cabinet'],
 [/measuring/i,'tester'],[/\bland\b|real estate|\bsite\b|\bbuilding\b|\bplot\b|property/i,'site'],
];
export const kindOf=text=>{for(const [re,k] of KIND_RULES)if(re.test(text))return k;return null};
