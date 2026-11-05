# Portal machine kinds (window.MB builders)

Each kind is built by `MB.add(kind,(K,s)=>({group,height,update?,lamps?}))` in machines/<family>.js, at the origin, floor y=0, operator front towards +z, length along x. Sizes are typical real footprints in metres (w × d × h); hall-kit.js scales the group uniformly to its station, so build at the real size. `s` carries the catalogue name, lot, year, weight, power, the station name, the count of units in the lot and `s.opts` (defaults below). Photos listed are the real catalogue photographs of the machines this kind stands for (relative to the portal root): look at them and copy their shape, colours, controls and proportions.


## machines/handling.js

### pcbConveyor  (0.5–1.5 × 0.9 × 0.95)
In-line SMT PCB conveyor: an aluminium-profile frame on four levelling feet, two parallel edge-belt rails (one adjustable, with a width lead-screw and hand wheel), a small motor under the rails, a sensor bracket, a slim side control box with a 3-button panel and a flat top cover. opts.type: "connect" (plain), "gateway" (with a lifting gate section and side guards), "shuttle" (two-level with a lifting carriage), "dual" (two lanes of rails side by side).
opts default: {"type":"connect"}
Stations:
  - smt: "Line conveyors & spares" — 10 × KI HEUNG KCC-600SC connection conveyors — photo photos/d3bf6280f28587f78b7fb8b466ccd31a.jpg
  - smt: "Line conveyors & spares" — 8 × KI HEUNG KGC gateway conveyors — photo photos/fccc8a95067dbaa33990970bb3b1d9d6.jpg
  - smt: "Line conveyors & spares" — Shuttle conveyors (KSC-6000SC, KDSC-500SC, Samsung FSC-400AS) — photo photos/29cc11c1640bf4b6278514f4e4b407ff.jpg
  - smt: "Line conveyors & spares" — Dual connecting conveyors, 2 Morel dual-rail conveyors, KCBB-900S conveyor — photo photos/348cae18eacfe72b9423875a32e4818b.jpg

### magazineLoader  (1.2 × 1.1 × 1.6)
SMT magazine loader (KI HEUNG KFL-900SC style): a white sheet-metal cabinet with a hinged lower door, on top an open frame with a magazine elevator holding a PCB magazine (aluminium rack with slotted green boards) that rises/lowers, a pusher, a short outfeed conveyor at the right at belt height 0.9 m, a side control box with screen and lamp tower, a 2nd empty magazine on a shelf. opts.dual (two magazine positions), opts.direction: "unload" mirrors the conveyor to the left.
opts default: {"dual":false}
Stations:
  - led: "Loading & unloading" — KDUSVP-900SA unloaders (3), KDLSVL-900SA dual multi loader — photo photos/d46886c285955a4552cd7e5c3fcad126.jpg
  - smt: "Line conveyors & spares" — KI HEUNG FA KFL-900SC magazine loader (spare) — photo photos/4ed161dc017b4698a693709fbcec277c.jpg

### magazineUnloader  (1.2 × 1.1 × 1.6)
SMT magazine unloader: same family as magazineLoader but boards come in from the left and are pushed into the magazine; the magazine elevator on the right, lower cabinet with door, control box, lamp tower.
opts default: {}
Stations:
  - led: "Magazine unloading" — KI HEUNG FA KFU-900SC magazine unloader (CoB M/G) — photo photos/597933af875ded1e68e8e0755fab264d.jpg
  - led: "Magazine unloading" — KI HEUNG FA KFU-900SC magazine unloader — photo photos/f0731c504f78e04095772a0e9b4f19f6.jpg
  - led: "Loading & unloading" — KVL-520-S + KVL-900SC vacuum loaders, KVU-520SA vacuum unloader — photo photos/06c621f9d518dff9abb433c4212956b3.jpg
  - led: "Loading & unloading" — KDUSVP-900SA unloaders (3), KDLSVL-900SA dual multi loader — photo photos/d46886c285955a4552cd7e5c3fcad126.jpg
  - smt: "PCB Unloading" — KI HEUNG FA KFU-900SC — photo photos/22d8d1d3b93823bdcf1b53bb9ea54d9f.jpg

### ngSorter  (1.0 × 1.0 × 1.5)
Good/NG board sorter (KI HEUNG KGNB-900 style): a white cabinet with an infeed conveyor at 0.9 m, two stacked output lanes (good boards straight through, NG boards diverted into a side NG magazine/rack), a vertical lift with a visible slide, a red "NG" label, control box with screen, a lamp tower.
opts default: {}
Stations:
  - smt: "Good / NG Sorting" — KI HEUNG FA KGNB-900SC — photo photos/4e8e733e0cdaa367cf03c8b2a901a63a.jpg
  - smt: "Good / NG Sorting" — KI HEUNG FA KGNB-900S — photo photos/75a017dd75578e9a9785998f3b5b0fab.jpg
  - smt: "Good / NG Sorting" — Famecs FRNB-750SA-8E-SV — photo photos/19de46c0cdcd6abb0f16f4fdbfba0fc9.jpg

### boardFlipper  (0.7 × 1.0 × 1.4)
PCB flipper/inverter (KI HEUNG KIV-420 style): a slim white cabinet with a rotating cage/drum (two clamps) at belt height that turns the board 180°, infeed/outfeed rail stubs, a transparent guard, control box, lamp tower. Must animate the drum rotating in update().
opts default: {}
Stations:
  - smt: "Board Flip (Double-Sided)" — KI HEUNG FA KIV-420C — photo photos/f44c281247d5a366cbc2bce5a8916484.jpg
  - smt: "Board Flip (Double-Sided)" — KI HEUNG FA KIV-420SA — photo photos/423c2e9da7f7b1673de1f05fd0da9b91.jpg

### pcbBuffer  (1.0 × 1.0 × 1.6)
SMT board buffer: a cabinet with a vertical rack of ~15 horizontal belt shelves behind a clear door, boards stacked inside, infeed/outfeed rails, control screen, lamp tower. opts.weigh adds a weighing station (load cell platform, display) at the infeed.
opts default: {"weigh":false}
Stations:
  - led: "Weight measurement buffer" — Weight measurement buffer conveyor (The Wall) — photo photos/d2b8ec8263f0b63bf808a846a0b86ed8.jpg
  - led: "Weight measurement buffer" — CNT weight measurement buffer conveyor (The Wall) — photo photos/32ebe1225a13976e3ec19539c87a31f8.jpg
  - led: "Buffers & conveyors" — CNT buffer + weight measurement buffer conveyors (The Wall) — photo photos/5d89fb1849f37fb3c0bc62e4a73dd663.jpg
  - smt: "Line conveyors & spares" — 3 belt buffers, buffer conveyor, Famecs PCB buffer, NG buffer — photo photos/fb53185e08478f5a0f55566f70c8b71f.jpg

### coolingConveyor  (1.8 × 0.9 × 1.1)
Post-reflow cooling conveyor: an open frame conveyor with 3–4 fan units mounted over the rails (grilles visible), rails, feet, a small control box.
opts default: {}
Stations:
  - led: "Buffers & conveyors" — KI HEUNG FA KHC-1800SC cooling conveyor — photo photos/b68f4c0594ceb25c4fbfe955983fdb03.jpg

### turntable  (0.9 × 0.9 × 1.0)
Pneumatic turntable conveyor: a square frame with a round rotating platform carrying a short rail section; control box; animated rotation.
opts default: {}
Stations:
  - led: "Handling" — Light-curtain process conveyor, pneumatic turntable, fan blower unit — photo photos/9c247300ad7dac46e651f6b734ecdb88.jpg

### lifterConveyor  (1.2 × 1.0 × 3.0)
Glass-enclosed vertical lifter conveyor: a tall aluminium-profile tower with clear polycarbonate panels, a carriage with a roller section that rises on a belt, infeed/outfeed roller stubs at 0.8 m and ~2.4 m, safety stickers, control cabinet.
opts default: {}
Stations:
  - pack: "Vertical lifting" — 3 × glass-enclosed lifter conveyor systems — photo photos/f0314c51e9bbd2c906793b5edcf7235b.jpg

### beltConveyor  (2.5 × 0.6 × 0.8)
Factory belt conveyor (foam belt / Eurotherm type): a blue or grey steel frame on adjustable legs, a flat belt with end rollers, drive motor with gearbox on one end, side guides, an emergency-stop box on a leg; opts.incline makes the out-feed end rise (take-off conveyor for moulded parts, with a hopper box under the low end).
opts default: {"incline":false}
Stations:
  - pack: "Belt conveying" — Foam belt conveyor system + 8 Eurotherm belt conveyors — photo photos/8aaa81293ca3311586edb2daa428475b.jpg
  - imm: "Part conveyor" — Belt conveyor (1 of 3 in lot) — photo photos/0395c06ffcd0da6e7077401c1eb83c26.jpg
  - imm: "Part conveyor" — Foam belt conveyor (1 of 5 in lot) — photo photos/2b43c6e03fcc67bce034651907a59cd8.jpg

### rollerConveyor  (2.0 × 0.6 × 0.7)
Motor-driven roller conveyor: grey steel frame on legs, a bed of ~20 steel rollers, chain drive cover along one side, motor under the bed, end stops.
opts default: {}
Stations:
  - pack: "Roller conveying" — 10 × motor-driven roller conveyors — photo photos/dcf36fadbd9c57d2383eeed370181cc6.jpg
  - pack: "Chain conveying" — 38 × chain roller conveyors (approx. 1,400 × 2,050 mm) — photo photos/a6054282eb3786455398735946d07f4e.jpg
  - wh: "Shelving" — Steel shelving, racking components, roller conveyor sections — photo photos/afe40aa33a33ac15cbe9c1d7c8317859.jpg

### chainConveyor  (2.05 × 1.4 × 0.5)
Pallet chain conveyor: a low heavy steel frame (1,400 × 2,050 mm) with two parallel roller chains / heavy rollers, drive motor, a pallet sitting on it.
opts default: {}
Stations:
  - pack: "Chain conveying" — 38 × chain roller conveyors (approx. 1,400 × 2,050 mm) — photo photos/a6054282eb3786455398735946d07f4e.jpg

### transferConveyor  (2.2 × 1.2 × 2.2)
Transfer conveyor with an overhead gantry gripper: a conveyor at 0.85 m plus a portal frame over it carrying a travelling carriage with suction/finger grippers on a vertical axis, cable chain, light-curtain posts (yellow/black) at both ends. Animate the carriage.
opts default: {}
Stations:
  - led: "Handling" — 2 × transfer conveyors with overhead suction/finger grippers — photo photos/58954b876db47e0108147c8010946df3.jpg
  - led: "Handling" — Light-curtain process conveyor, pneumatic turntable, fan blower unit — photo photos/9c247300ad7dac46e651f6b734ecdb88.jpg

## machines/logistics.js

### stretchWrapper  (2.4 × 1.6 × 2.4)
Pallet stretch wrapper (SIAT SW2 style): a blue/grey round turntable (1.5 m) at floor level with a ramp, a vertical mast with the film carriage (roll of clear film) that rides up and down, a control box with keypad on the mast, a pallet with boxes on the turntable. Animate the turntable and carriage.
opts default: {}
Stations:
  - pack: "Pallet stretch wrapping" — 24 × SIAT SW2M / SW2 pallet stretch wrappers — photo photos/198ec0c130c10f29301bc5bd02def77a.jpg

### shrinkHoodPacker  (3.0 × 2.4 × 3.6)
Shrink-hood pallet packaging machine (Thimon Coverpal 1250): a tall blue/grey portal frame over an infeed roller conveyor, film reel on top, a hood frame with a heating ring that descends over the pallet, side control cabinet with screen, safety fencing panels, a wrapped pallet inside.
opts default: {}
Stations:
  - f2fa: "Shrink-hood packing" — Thimon Coverpal 1250 shrink-hood packaging machine — photo photos/7b037b4ae84226f94888caae7fc91cbe.jpg

### shrinkWrapper  (2.0 × 0.9 × 1.6)
L-sealer shrink wrapping machine (smipack SL 45): a stainless/white cabinet on castors, a sealing frame (L-shaped hinged bar with handle) over a work table at 0.9 m, a film reel on a side arm, a shrink tunnel section with a hood, control panel.
opts default: {}
Stations:
  - pack: "Shrink wrapping" — smipack SL 45 shrink wrapping machine — photo photos/33bf8fb23cb246974dad525265ed4ed7.jpg

### strappingMachine  (1.4 × 0.6 × 0.9)
Semi-automatic strapping machine (FEIFER TP 410 style): a grey/beige box-shaped unit on castors, a table top with a strap slot and an arch at the back (opts.arch true = full arch for automatic banding), strap coil in a side drawer, control panel.
opts default: {"arch":false}
Stations:
  - pack: "Strapping" — FEIFER TP 410 strapping machine, DAE EUN DE-960AS banding (defective), strapping tools, PP band — photo photos/13509a0e3257c119afc7351ca1f12e24.jpg

### floorScale  (1.5 × 1.5 × 1.0)
Industrial floor scale: a low square steel platform (checker plate, 1.5 × 1.5 m, 10 cm high) with a ramp, and a post-mounted weight indicator (display with red digits) on a steel column beside it; a pallet on the platform.
opts default: {}
Stations:
  - pack: "Weighing" — 2 × KRAJSPOL 1,500 kg floor scales, 5 × TScale 150 kg platform scales — photo photos/71a82666c5642b4ac8b482fb29c0a1a8.jpg

### platformScale  (0.6 × 0.5 × 1.2)
Bench platform scale: a stainless platform (0.5 m) on the floor or a low frame, a column with the indicator head with digits.
opts default: {}
Stations:
  - pack: "Weighing" — 2 × KRAJSPOL 1,500 kg floor scales, 5 × TScale 150 kg platform scales — photo photos/71a82666c5642b4ac8b482fb29c0a1a8.jpg

### labelPrinterStation  (1.6 × 0.7 × 1.4)
Labelling workstation: a steel/ESD bench with 3–4 Zebra industrial label printers (grey boxes with a window and a label roll visible), a monitor, a barcode scanner on a stand, boxes of labels under the bench. opts.count sets how many printers (≤4).
opts default: {"count":3}
Stations:
  - prog: "Labeling" — Zebra ZT411/ZT420/ZT410/ZM400 label printers — photo photos/4bc42e5c09cb9ce6971eca0f66f504fb.jpg
  - rob: "Vision labeling" — KUKA KR 12 R850 SCARA with Keyence SR-5000 + Zebra ZT411 — photo photos/dd8a2a46e42227b8143fca947f4bf2a5.jpg
  - pack: "Labeling" — 9 × datamax H-4408, 51 × Zebra ZT4xx/ZM400, Honeywell/Avery printers — photo photos/01aceaffdb8b57cdcd68d9218a88239a.jpg

### palletTruck  (1.6 × 0.6 × 1.2)
Hand pallet truck (Pallet jack): orange/red forks, hydraulic pump unit, steering handle tilted, two steering wheels and load rollers. Several trucks in a row when opts.count > 1 (max 4).
opts default: {"count":3}
Stations:
  - wh: "Pallet moving" — 61 × hand pallet trucks — photo photos/032f8041ecf6f7a678ffb1c10c60283e.jpg

### reachStacker  (1.6 × 3.0 × 3.6)
Jungheinrich EKX 514 man-up high-rack stacker (VNA truck): a long yellow/black battery body on four wheels, a tall mast (two sections) with the operator cabin and swivel fork carriage raised, overhead guard, guide rollers, a pallet on the forks.
opts default: {}
Stations:
  - wh: "High-rack stacking" — 9 × Jungheinrich EKX 514 high-rack stackers — photo photos/03d5b3c8a3ee31ab361139f703bcbe86.jpg

### yardTractor  (5.8 × 2.5 × 2.9)
Kalmar terminal tractor: a red cab-forward tractor with a single-person cab on the left, a flat deck with a raised fifth-wheel coupling plate, big wheels (4), exhaust stack, steps, mirrors, headlights.
opts default: {}
Stations:
  - wh: "Yard tractor" — Kalmar ST122 terminal tractor — photo photos/2ddf3a03fd98131f4167adebbd814d71.jpg

### trolleySet  (1.2 × 0.8 × 1.0)
A set of steel transport trolleys with castors and a mobile lifting frame (A-frame gantry on wheels with a beam and chain hoist); opts.count trolleys (≤4) arranged in a row.
opts default: {"count":3}
Stations:
  - wh: "Trolleys & lifting" — 8 steel trolleys, 2 mobile lifting frames, container, castors — photo photos/6b51cec0910e830eb286e7f0c1db12e3.jpg

### spillTray  (1.3 × 0.8 × 0.4)
Denios spill containment trays: galvanised sump pallets with grating tops, drums (blue 200 l) standing on them; opts.count trays.
opts default: {"count":3}
Stations:
  - wh: "Containment" — 3 × Denios spill containment trays + spill sump — photo photos/cf372ebdcea6f9614a9f438c7c06016b.jpg

### attachmentSet  (1.6 × 1.2 × 1.0)
Forklift attachments on a pallet: KAUP clamp (two large steel clamp arms), spare fork tines, fork extensions (long sleeves) lying on pallets.
opts default: {}
Stations:
  - wh: "Attachments" — 3 × KAUP clamp attachments, forks and extensions — photo photos/67c6d00d6957991a52e46c611faf3983.jpg

## machines/metal.js

### shotBlast  (6 × 3 × 4)
Shot blasting system (Schlick Roto-Jet / Spencer & Halstead monorail): a large dark green/grey rectangular blast cabinet with rubber curtain openings, 4–12 blast wheel motors (blue round motors with guards) on the sides and top, a bucket elevator tower, an abrasive separator and hopper on top, dust collector cabinet with ducting, a monorail (I-beam) through the cabinet with hanging hooks/workpieces, access platform with stairs and handrails. opts.wheels number of blast wheels.
opts default: {"wheels":8}
Stations:
  - phs: "Shot blasting" — Schlick Roto-jet shot blasting system — photo photos/e40e356fa29ce2ff00366aa6e3f0727d.jpg
  - phs: "Shot blasting" — Spencer & Halstead 12-wheel monorail shot blasting system — photo photos/55ccda64a7e577710828e38ef3b01a93.jpg

### laserCell  (9 × 5 × 3.4)
Trumpf TruLaser Cell 8030/7040 5-axis 3D laser cutting cell: a long enclosed light grey cabin with blue (Trumpf) accents, a large sliding door with a green-tinted viewing window on the front, a rotary / shuttle table with a fixture, a gantry inside with a 5-axis cutting head, a separate laser source cabinet (TruDisk) and chiller at the back, control console with screen and keypad on the front corner, extraction ducting on the roof, warning labels. opts.count 2 = two cells side by side.
opts default: {"count":1}
Stations:
  - phs: "3D laser trimming" — 2 × Trumpf TruLaser Cell 8030 L45 — photo photos/00c4c3561b506b091177bf15162b87e8.jpg
  - phs: "3D laser trimming" — 2 × Trumpf TruLaser Cell 8030 L45 / TruLaser Cell 7040 L31 — photo photos/3878e2ef56746465e4de7063f0bb614a.jpg
  - phs: "3D laser trimming" — 2 × Trumpf TruLaser Cell 7040 L31 — photo photos/71f8fe1ac33a783c9d8af26a3400966e.jpg

### bandSaw  (1.6 × 0.8 × 1.5)
Horizontal metal band saw (Pilous ARG 300 style): a cast base cabinet, a pivoting saw bow with the band wheels covers (two round guard housings), a vice with hand wheel, a roller stand feed, coolant tank, control panel. opts.count copies in a row (≤3).
opts default: {"count":1}
Stations:
  - shop: "Milling & drilling" — 2 × Bernardo KF 25 mill-drills, 2 × Holzmann ZS 50APS, PROMA bench drill — photo photos/bf3fb0e51bf152f05ae5107cec5a894a.jpg
  - shop: "Sawing" — PROMA PPK-200U, 3 × Optimum band saws, Milwaukee CHS 355 — photo photos/0f9045cbac5c85e36302709d19ff441a.jpg
  - phs: "Tool shop" — Pilous ARG 300 plus F automatic band saw — photo photos/dbdff542bf013d53e71cb26efa1705a4.jpg

### millDrill  (0.9 × 0.8 × 1.9)
Bench mill-drill machines (Bernardo KF 25 / pillar drill): a column on a cast base, a head with motor and belt cover, a quill with a chuck, an XY table with hand wheels, a stand cabinet; opts.count machines in a row (≤4).
opts default: {"count":2}
Stations:
  - shop: "Milling & drilling" — 2 × Bernardo KF 25 mill-drills, 2 × Holzmann ZS 50APS, PROMA bench drill — photo photos/bf3fb0e51bf152f05ae5107cec5a894a.jpg

### qmcSystem  (2.6 × 1.4 × 1.6)
Quick mould change system (Solutech C&C): a mould change cart/table on rails (steel frame with roller bed, a mould block on it), hydraulic clamps, a control pendant, a cable chain and hydraulic power unit cabinet.
opts default: {}
Stations:
  - imm: "Quick mold change" — QMC quick mold change control box — photo photos/332ef0160242126855831d56677d61f4.jpg
  - imm: "Quick mold change" — Solutech C&C QMC system — photo photos/09d87bfb4a188941d39a53368c524b0f.jpg
  - imm: "Quick mold change" — Quick mold change panel — photo photos/6597f40a56e8a8bb241f45651e0136f7.jpg

### filterUnit  (0.9 × 0.9 × 2.0)
Moretto central vacuum filter unit: a tall cylindrical steel filter body with a conical bottom and a dust bin, a blower/side-channel pump on top or beside, inlet/outlet pipes, pressure gauge, control box.
opts default: {}
Stations:
  - imm: "Vacuum conveying filter" — Moretto FC40CPB filter unit — photo photos/3f6a3e5a527f081bec50fae4fc332932.jpg
  - imm: "Vacuum conveying filter" — Moretto filter unit — photo photos/163b8818598dcdadce6ab8279ebde9b4.jpg

### workBench  (2.0 × 0.8 × 1.9)
Workshop bench with tools: a steel bench with a beech top and drawers, a vice on the corner, a pegboard back panel with tools (spanners, hammers), shelf with boxes, a bench lamp; opts.count benches.
opts default: {"count":2}
Stations:
  - shop: "Benches & spares" — Work benches, tool sets, spare parts and electrical components — photo photos/4e2160d2501df6aede6d396fc1473e81.jpg
  - fac: "IT" — Servers, firewalls, PCs, SSD/HDD stock, IT spare parts — photo photos/a82924ade11ef1588bbca373997802ed.jpg

### surfacePlate  (1.6 × 1.0 × 1.0)
Granite surface plates on steel stands: a dark speckled granite slab on a welded stand, a height gauge standing on it, a linear positioning rail beside; opts.count plates in a row (≤3).
opts default: {"count":2}
Stations:
  - qa: "Dimensional metrology" — 9 granite surface plates, MATEOS linear positioning system — photo photos/74d674f89730ef586c7e96d3257a839f.jpg

## machines/lab.js

### instrumentRack  (0.7 × 0.8 × 1.9)
19-inch instrument rack: an open black/grey rack frame full of bench instruments (oscilloscopes with screens, digital power meters with red LED digits, signal generators, rack amplifiers) stacked with ventilation gaps, BNC cables, a top cover, castors. opts.units number of instruments (3–12), opts.style "scope" | "meter" | "gen".
opts default: {"units":8,"style":"scope"}
Stations:
  - test: "LVDS pattern" — 3 × Master MSPG-5400QL + 3 × MSPG-5100 pattern generators — photo photos/c2dfe7ea69b6ab92bc719aa14114251a.jpg
  - test: "Broadcast signal" — ShibaSoku TG39AC, R&S SFE100, 2 × Eiden SSR5000A, Eiden 198B — photo photos/249b6785e309d8838dc2d8698e126a62.jpg
  - test: "RF amplification" — 12 × Eiden 4013A wide band boost amplifiers — photo photos/b6f24c230556cdd8d93d01b63d16df6d.jpg
  - test: "Stream playback" — 11 × Tektronix MTX100 MPEG recorders & players — photo photos/f3c41c1ea07839a7b51cb4cadd0392ff.jpg
  - test: "Power measurement" — 19 × Yokogawa WT210 digital power meters — photo photos/cd2af8cf1962d7cf59ac46c8557b1acd.jpg
  - test: "Waveform analysis" — Tektronix TDS5054, 3 × TDS3032C, 2 × TDS2012B, 4 × TDS3032B — photo photos/f08610afcb442cfb151dec0e10527d93.jpg

### tripodMeter  (1.4 × 0.9 × 1.6)
Display measurement station: a tripod with a spectroradiometer / imaging photometer (a black camera body with a lens hood) aimed at a sample display on a bench, a laptop, a colour analyzer with probe; dark bench.
opts default: {}
Stations:
  - test: "Color analysis" — 91 × Konica Minolta CA-210 display color analyzers — photo photos/0bb85867d94d94429dffe748d5190fe1.jpg
  - test: "Color analysis" — Konica Minolta CA-310 analyzers (12) and probes (8) — photo photos/956db6e4ebd5af989e8c65ef10bcfa0c.jpg
  - test: "Spectroradiometry" — Konica Minolta CS-3000HDR spectroradiometer, CS-100A chroma meter — photo photos/2e291dce948ed9aafd7680d6f4bbc101.jpg
  - test: "Imaging photometry" — Radiant ProMetric IP-PMY16 photometer, LAON PEOPLE industrial camera — photo photos/de23d08e9b5e74d4ee292bdce287fd94.jpg
  - qa: "Infrared spectroscopy" — Shimadzu IRAffinity-1S FTIR spectrophotometer — photo photos/761d8964c7f2df102e288c5e46c0c310.jpg

### ftir  (1.6 × 0.8 × 1.4)
Benchtop FTIR spectrophotometer (Shimadzu IRAffinity): a white/beige box instrument with a sample compartment lid open and a hinged cover, on a lab bench with a PC and monitor, nitrogen purge line.
opts default: {}
Stations:
  - qa: "Infrared spectroscopy" — Shimadzu IRAffinity-1S FTIR spectrophotometer — photo photos/761d8964c7f2df102e288c5e46c0c310.jpg

### microscopeStation  (1.6 × 0.8 × 1.5)
Inspection microscope station: an ESD bench with a stereo microscope (Olympus SZ61 style: a stand, head with two eyepieces, ring light) and a digital microscope with a monitor (Hirox: column stand, camera head, screen), a ring lamp; opts.count microscopes (≤3).
opts default: {"count":2}
Stations:
  - led: "Black color inspection" — Vary Induced Technology BCI-022 black color inspector — photo photos/bf99e90f58756e055565cd6315ab6617.jpg
  - led: "Module inspection" — Na & Na ECT-OFF-303 LED module inspection rack — photo photos/32c68dadefba92f45918c9360a693c7e.jpg
  - led: "Module inspection" — Na & Na ECT-OFF-303 inspection rack — photo photos/32c68dadefba92f45918c9360a693c7e.jpg
  - prep: "Inspection" — HiROX RX-100, Hirox KH-7700 digital microscopes, 5 × Olympus SZ61 — photo photos/6839578b07672b787a4d90126386b436.jpg
  - prep: "Nozzle inspection" — BOSUNG ENI-12AP vision inspection tool — photo photos/c60df82b0280077f8e0c438db8d0aaff.jpg
  - qa: "Inspection" — Olympus IV8420L2 industrial videoscope — photo photos/2f1014e7008db04d600cd0038780b18f.jpg

### calibrationBench  (1.6 × 0.8 × 1.4)
Calibration bench: a lab bench with a handheld calibrator in a stand, a strain recorder (box with knobs and a chart window), a charged plate monitor (plate on a tripod), leads.
opts default: {}
Stations:
  - test: "Calibration" — Yokogawa CA71 calibrator, DC-204R strain recorder, charged plate monitors — photo photos/6508dca5e787da5fcd706897714212b1.jpg
  - rob: "Robot calibration" — 2 × KUKA SEMD/MEMD electronic mastering sets — photo photos/8ee0081fc332f4f3385e3ca6603914d2.jpg

### reballingStation  (1.4 × 0.8 × 1.4)
BGA reballing station: a bench with a small preheater / reballing fixture (stencil frame), a hot-air station with a handpiece, a magnifier lamp, trays of components.
opts default: {}
Stations:
  - prep: "BGA rework" — 2 × KUKJETRADING TR3000-IRV BGA rework systems — photo photos/79fb9224fa9fbca128ee3e5e17eb76c9.jpg
  - prep: "Reballing" — WON-TECH BRK-2001 BGA reballing kit — photo photos/98cd13e6ddc0cae378b2039dd1a18293.jpg

### pasteThawer  (0.6 × 0.6 × 1.4)
Solder paste thawing / stirring unit (SEILIECO SCR-3100): a white floor-standing box with a round turntable lid on top holding paste jars, a control panel with timer and display.
opts default: {}
Stations:
  - prep: "Paste thawing" — SEILIECO SCR-3100CLS solder paste thawing unit — photo photos/182342e6982976209f72a2a4ce557e25.jpg
  - prep: "Paste control" — SEILIECO SCR-3100SLS solder paste check-right system — photo photos/2c5bb1e3e19a7f066ddaee2d5724bfe2.jpg

### vacuumSealer  (0.9 × 0.7 × 1.0)
Vacuum packing machine (chamber type): a stainless steel box with a clear domed hinged lid over the chamber, a sealing bar, a control panel with gauges, on a stand with castors; opts.count machines.
opts default: {"count":2}
Stations:
  - prep: "Vacuum sealing" — CM KOREA VAC CM600 (2), MAGICSEAL SM600-L vacuum packing machines — photo photos/9254c72d4b231ee22005493ebb7a5926.jpg

### duplicatorStation  (1.2 × 0.7 × 1.3)
Media duplication station: a bench with 3 tower USB/disc duplicators (black towers with many slots and a small LCD), a monitor.
opts default: {"count":3}
Stations:
  - prog: "Media duplication" — 3 × MultiBurn USB duplicators — photo photos/1514e947731cf6f69210c0bc9339398b.jpg

### splicingStation  (1.2 × 0.7 × 1.3)
SMT feeder splicing station: a bench with a splicing device (small press with a lever), reels of components, splice tape dispensers, a feeder rack beside it.
opts default: {}
Stations:
  - prep: "Feeder splicing" — M.O.A splicing device + 10 SMT splicing devices — photo photos/80966058cb751d0e419a3c557be1da3f.jpg

### barcodeStation  (1.2 × 0.7 × 1.2)
Barcode reader test station: a bench with a row of Keyence SR-2000 code readers (small black boxes with a lens) on brackets over a conveyor stub, and a monitor.
opts default: {}
Stations:
  - rob: "Code reading" — 26 × Keyence SR-2000W barcode readers — photo photos/435a1b5cf78ff67cff94f23feba37da5.jpg

### esdRack  (1.2 × 0.6 × 1.8)
ESD PCB storage: black ESD shelving racks with PCB magazines on the shelves and aluminium cabinets beside.
opts default: {}
Stations:
  - prep: "ESD storage" — ESD PCB and magazine racks, 4 aluminium cabinets — photo photos/981a27030e883827c1024926f4f6420c.jpg

### inspectionRack  (1.6 × 0.9 × 2.0)
LED module inspection rack (Na & Na ECT-OFF-303): a dark upright frame with rows of LED modules lit on a panel, a power cabinet, a monitor and keyboard tray, light curtains.
opts default: {}
Stations:
  - led: "Module inspection" — Na & Na ECT-OFF-303 LED module inspection rack — photo photos/32c68dadefba92f45918c9360a693c7e.jpg
  - led: "Module inspection" — Na & Na ECT-OFF-303 inspection rack — photo photos/32c68dadefba92f45918c9360a693c7e.jpg
