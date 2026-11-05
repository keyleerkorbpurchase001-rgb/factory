# Industrial robots (machines/robots.js and machines/takeout.js)

Same conventions as KINDS.md: `MB.add(kind,(K,s)=>({group,height,update}))`, origin at the floor centre, front towards +z,
real metres. `s` carries name (e.g. "KUKA KR 120 R3100-2 / FLR"), station, lot, year, info.weight, info.power
(e.g. "210 kg payload · approx. 1,090 kg", "3×400 V · KR C4"), note (e.g. "Payload 50 kg, reach 2501 mm, comes with a
Schmalz vacuum gripper"), count, opts. The portal's photos of these very robots (relative to the portal root) are
listed below: READ THEM and copy what they show. Every small detail counts: the user judges by the photos.

## machines/robots.js

### robotArm  (footprint about 1.4–2.2 m square, height 1.6–2.6 m, posed upright so the arm's box stays compact)
A six-axis articulated industrial robot on its base, with its controller cabinet beside it. Parse make, series,
payload and reach from s.name / s.info / s.note (KR 10 R1440 → 10 kg, 1440 mm; KR 120 R3100 → 120 kg, 3100 mm;
R-2000iC/210F → 210 kg, 2655 mm; R-2000iB/125L → 125 kg, 3005 mm; KR 3 R540 → 3 kg, 541 mm; KR 16 R2010 → 16 kg;
KR 30-3 / KR 60-3 → 2033 mm; KR 50 R2500 → 2501 mm; KR210 L180 → 210 kg class; ABB IRB → 2.5 m class). Scale every
link from the reach, and the thickness from the payload class (3–16 kg slim, 30–60 kg medium, 120–210 kg heavy).
Geometry (all robots): a cast base plate with four bolt lugs and anchor bolts and a cable connector box at the back;
the A1 carousel (rotating column) with the A1 motor housing; the A2 rocker / link arm with the A2 motor on the side
and, on 50 kg and heavier KUKA robots, the counterbalance cylinder (hydro-pneumatic balancer) from the carousel to the
link arm (FANUC R-2000 has a balancer too); the A3 arm with the three A4–A6 drive motors stacked at its rear end (the
characteristic block of cylinders), the in-line wrist (A4 cylinder, A5 tilting part, A6 flange), the tool flange and
an end effector (vacuum gripper plate with 6–8 suction cups and a Schmalz-type ejector block for palletizing robots;
a two-jaw gripper for pick & place; nothing but the flange when the name says nothing); the energy supply / dress pack:
corrugated black hoses from the base connector box up the carousel, along the link arm with hose clamps, over the A3
arm with a spring retractor, to the wrist; motor covers, cover plates with hex bolts, the brake-release panel; stickers
(yellow/black warning triangles on the base and carousel, axis numbers A1…A6, the maker logo on the A3 arm and the type
plate "KR 120 R3100-2" etc. with H.nameplate / K.plate). Colours and shapes by make: KUKA orange (0xf26522) with black
motor housings and black hoses, slim rounded castings (QUANTEC for 120–210 kg, KR CYBERTECH for 16–60 kg, AGILUS small
white-grey body for KR 3 as the photo shows, KR 10 R1440-2 orange); FANUC yellow (0xf7d117) with red J4–J6 motor covers
and a black/grey base, chunkier castings, the "FANUC Robot R-2000iC" lettering on the arm; ABB graphite white (0xe6e3dc)
with red-orange (0xe8552b) accents. Joint animation in update(t, running): slow A1 sweep, A2/A3 nodding, wrist roll,
coordinated like a pick-and-place or palletizing cycle; stop when not running.
Controller beside the base (opts.controller or parsed from the name): "KR C4" = large light grey cabinet (0.8 × 0.55 ×
0.96 m, KUKA logo plate, cooling grille, connector panel at the bottom) with the KUKA smartPAD (grey tablet pendant with
an e-stop) hanging on a bracket; "KR C5" = slimmer grey cabinet; "KR C5 micro" / "KR C4 compact" = small dark box
(0.5 × 0.47 × 0.27 m) with fans, standing on the floor or a pallet; "R-30iB Plus" / "R-30iA" = FANUC beige/grey A-cabinet
on castors with a fan grille, the yellow e-stop and the iPendant (teach pendant with a screen, yellow e-stop) on its
door; "IRC5" = ABB grey cabinet with the FlexPendant. Cable bundle from the controller to the base connector. When
opts.pallet is true (the catalogue photos show them like this) robot and controller stand on wooden pallets (H.pallet).
Stations and photos:
  - rob "Heavy handling" FANUC R-2000iC/210F with R-30iB Plus — photos/b1ebd3e95ed3d92cbdf3998ac1557922.jpg
  - rob "Heavy handling" FANUC R-2000iB/125L with R-30iA — photos/2ab27a08d7dbdf180920c86897d8a0cf.jpg
  - rob "Assembly robots" 3 × KUKA KR 10 R1440-2 with KR C5 micro — photos/5dc159a67a6c0608d2fd91128b19d744.jpg
  - rob "Pick & place" 6 × KUKA KR 3 R540 with KR C4 compact — photos/428378e651582d876d63e751d5715100.jpg
  - imm "Stacking / palletizing robot" KUKA KR 50 R2500 / SEL (Schmalz vacuum gripper) — photos/bdea3f11803218641b16d348457d1165.jpg
  - imm KUKA KR 60-3 — photos/ad3ff50e8de2893d9eb190370a511132.jpg, photos/091131224d5e010f263ee84e07f813dc.jpg
  - imm KUKA KR 30-3 (energy supply hose package) — photos/a4fe480e5d8255bf50a98da14fa5f559.jpg
  - imm KUKA KR 16 R2010-2 / SEL — photos/19e5fd68b809f029bf1e150e3e4e7a12.jpg
  - imm KUKA KR 120 R3100-2 / FLR (QUANTEC-2, KR C5) — photos/3fa6618815a2b45eaa0bd54fea3d9d19.jpg, photos/ec66e6e2e0afe38eaee79df4eaf5c4a3.jpg
  - f2evp KUKA KR210 L180-2 vacuum insulation panel pressing workstation (robot + press table 2.5 × 1 m) — photos/0bdf4fda9b54b55c9b1807d5ae6d871a.jpg
  - f2met 2 × KUKA pick-and-place robots (part of COSMA line) — photos/bf18b938f1ddf521449835fcdf995cfc.jpg
opts: {controller:'auto', gripper:'auto'|'vacuum'|'jaw'|'none', pallet:false, count:1 (2–3 → robots in a row), fence:false}

### robotCell  (3–7 m × 3–5 m)
One to four robotArms inside a safety cell: yellow-post / black-mesh fence panels (2 m high) with a hinged access door
with a safety interlock switch, a light-curtain pair (yellow/black posts) at the loading opening, a control panel
with screen outside the fence, floor marking. opts.robots (1–4), opts.purpose: 'grinding' (each robot holds a grinding
spindle, with a workpiece table, a dust extraction duct and a tool rack: the ABB grinding cell, 4 robots),
'laser' (an ABB robot holding a laser cutting head over a rotary turning table, enclosure walls instead of mesh, air
extraction, "ELEN Blade" laser source cabinet: f2pla), 'press' (a KUKA KR210 beside a pressing table with a lift
table), 'handling' (robots along a conveyor stub).
  - phs "Robot grinding" ABB automated grinding robot cell (4 robots) — photos/73e9aa107e37833ef02ca32a1b5afc81.jpg
  - f2pla "Laser punching of liners" ELEN Blade RF 333 laser cutting cell on ABB robot — photos/5af7904d53e547b30d23dba659df4e70.jpg

### scaraRobot  (bench 1.8 × 0.9 × 1.9)
Labeling cell: a KUKA KR 12 R850 SCARA (white-grey column on a bench, two horizontal arm links, the vertical quill with
a label applicator) on an aluminium-profile bench with a Keyence SR-5000 code reader on a bracket, a Zebra ZT411 label
printer, a product conveyor stub through the cell, a small KR C4 compact controller under the bench, light curtain.
  - rob "Vision labeling" — photos/dd8a2a46e42227b8143fca947f4bf2a5.jpg

### masteringSet  (bench 1.6 × 0.8 × 1.4)
Robot calibration station: a bench with two KUKA EMD/SEMD electronic mastering tool cases open (foam inserts with the
dial tool and cables), a laptop, and a small KR 3-size robot on a pedestal beside the bench being mastered.
  - rob "Robot calibration" 2 × KUKA SEMD/MEMD electronic mastering sets — photos/8ee0081fc332f4f3385e3ca6603914d2.jpg

## machines/takeout.js

### takeoutRobot  (traverse 2.4–3.6 m along x, depth 1.2–1.8 m, height 2.6–3.2 m)
Yudo-Star MEGA-2000-2P / MEGA-2500-2P / Giga 3525 4P cartesian take-out robot of an injection moulding machine, built
free-standing on a riser frame (two yellow-green or grey steel legs with a mounting plate, as it would sit on the fixed
platen) so it stands next to the press in the hall: a long horizontal traverse beam (aluminium profile with a linear
rail and a toothed belt cover) carrying the traverse carriage; the kick (crosswise) axis carriage with its own short
beam; the vertical arm (telescopic square profile) with the gripper head at the bottom (an aluminium EOAT plate with
vacuum cups, a sprue chuck and a swivel unit) and, for the "-2P" models, a second (sprue) arm; big grey plastic energy
chains for each axis in their trays; the servo motors with their covers at the ends of the axes; a cable to the YUCON
control cabinet (a slim grey cabinet at the leg) and the YUCON-400/500/700 handheld terminal (pendant with a screen and
a yellow e-stop) on a hook at the leg; yellow/black stripes on the beam ends; a maintenance platform with railings and a
ladder when the name mentions the gantry frame, platform and ladder. Animate the traverse carriage, the kick carriage
and the vertical arm in a take-out cycle.
opts: {arms: 2 (the "-2P" sprue + part arms) | 4 (Giga 4P: two main arms + two sprue arms), platform:false}
  - imm "Part take-out robot" Yudo-Star MEGA-2000-2P + YUCON-400 — photos/09d87bfb4a188941d39a53368c524b0f.jpg (the robot is on top of the press)
  - imm Yudo-Star MEGA-2000-2P + Yudo control cabinets — photos/188b47b1a49bd62898c06e75b86dca8c.jpg
  - imm YUDO-STAR MEGA-2500-2P + YUCON-400 + YUCON-500 pendant — photos/6597f40a56e8a8bb241f45651e0136f7.jpg
  - imm Yudo Giga 3525 4P + Yucon 700 (largest) — photos/621ff617f90d40a0efca857f585ac695.jpg
  - imm Yudo-Star MEGA-2500-2P gantry frame, platform and ladder — photos/929f37a468d2c6d41b5098ae71a9cebf.jpg

## Detail checklist (every item is expected; the reviewer rejects a robot that lacks them)

### Articulated arm, common to every make
1. **Base**: cast base frame 0.5–0.9 m square (from the payload class), 0.2–0.3 m high, with four corner bolt lugs each
   carrying an anchor bolt (hex head + washer), chamfered edges, a rear connector plate with two rectangular Harting
   connectors (motor cable X1 and data cable X2, black with silver levers) and the type plate; the whole base stands on
   a 20 mm steel adapter plate.
2. **A1 carousel / rotating column**: a cast housing on the base's turntable ring (visible gap ring, dark), the A1 drive
   motor as a vertical black cylinder at the back with its resolver cap, a junction box with a cover plate and bolts
   on one side, yellow/black warning stickers (triangle "crush hazard", "no step"), the maker logo.
3. **A2 link arm**: a long I-section / box casting 0.9–1.5 m long (from the reach), pinned to the column's fork with two
   large bearing caps (round end plates with 8 bolts each), the A2 motor as a black cylinder bolted on the outside of
   the fork (its axis along the A2 joint), and the **counterbalance** on 30 kg and heavier robots: a hydro-pneumatic
   cylinder (silver tube, black end caps, 0.1–0.16 m diameter) pivoted at the rear top of the column and on the link
   arm about a third of the way up, so it leans with the arm (KUKA mounts it on the left, FANUC's yellow balancer sits
   on the J2 axis side); cable clamps along the arm.
4. **A3 arm (forearm)**: a tapered casting 0.8–1.4 m long starting at the elbow (A3) with the elbow bearing caps, and at
   its rear end the **A4–A6 drive block**: three motors side by side (black cylinders with caps on KUKA, red-and-black
   covers on FANUC), under a cover; the arm carries the big maker lettering ("KUKA" white on orange; "FANUC Robot
   R-2000iC 210F" black on yellow; "ABB" red on white) and the type plate (H.nameplate with s).
5. **Wrist**: the A4 rotating tube (a cylinder along the arm), the A5 tilting fork (two cheeks) with its black motor cap,
   the A6 flange (disc with 6 bolt holes on a pitch circle and a centring boss) and the tool adapter.
6. **End effector**: palletizing / stacking robots (KR 50, KR 60, KR 30, KR 16, KR 120) carry a vacuum gripper: an
   aluminium plate 0.4–0.8 m with 6–8 bellows suction cups (black rubber, ribbed), a Schmalz blue ejector block with
   fittings and a vacuum gauge, a swivel unit; pick-and-place and assembly robots (KR 3, KR 10) carry a pneumatic
   two-jaw gripper (silver body, two black fingers) on a small adapter; heavy handling FANUCs carry a fork / clamp
   gripper or just the flange (the photo shows bare flange: keep bare with a protective cap).
7. **Dress pack** (energy supply): two corrugated black hoses 25–40 mm from the base connector plate, up the column
   held by a ring clamp, along the link arm in two bracket clamps, over the elbow in a loop, along the A3 arm through a
   spring-loaded retraction unit (a silver spring tube with a sliding bracket) to the wrist, plus a thinner pneumatic
   hose and a blue valve terminal (Festo type, with 4 small cylinders and LEDs) on the A3 arm.
8. **Finish**: KUKA RAL 2003 orange body, RAL 9005 black motors, hoses and joint covers; FANUC yellow body, black base,
   red J4–J6 motor covers and J1 cover; ABB graphite white body (0xe6e3dc) with red-orange (0xe8552b) accent covers.
   Bolted cover plates with hex bolts on the joints, brake release button box on the column, a red/green status LED.
9. **Pose**: upright park pose (A2 at ~ -20°, A3 at ~ +60°, wrist pointing down) so the robot's bounding box is
   compact, as in the photos; the animated cycle swings A1 ±45°, A2 ±25°, A3 ±30°, A5 ±40°, A6 spinning.

### Sizes by series (reach is the distance from A1 axis to the flange centre with the arm stretched)
| series | payload | reach | base footprint | height folded | notes |
|---|---|---|---|---|---|
| KR 3 R540 (AGILUS) | 3 kg | 541 mm | 0.18 m | 0.65 m | white-grey body, black covers, KUKA logo orange, 26 kg; KR C4 compact |
| KR 10 R1440-2 (AGILUS-2) | 10 kg | 1440 mm | 0.3 m | 1.2 m | orange, slim, in-line wrist, KR C5 micro |
| KR 12 R850 SCARA | 12 kg | 850 mm | 0.25 m | 0.8 m | column + two horizontal links + quill, white-grey |
| KR 16 R2010-2 (CYBERTECH) | 16 kg | 2013 mm | 0.45 m | 1.7 m | orange, 261 kg, KR C4; vacuum gripper |
| KR 30-3 / KR 60-3 | 30 / 60 kg | 2033 mm | 0.55 m | 1.9 m | orange, classic series with balancer, 665 kg, KR C4; vacuum gripper |
| KR 50 R2500 | 50 kg | 2501 mm | 0.55 m | 2.1 m | orange, 566 kg, Schmalz vacuum gripper |
| KR 120 R3100-2 (QUANTEC-2) | 120 kg | 3100 mm | 0.75 m | 2.4 m | orange, 1,148 kg, big balancer, KR C5 (slim grey cabinet) |
| KR 210 L180-2 | 180 kg | 3100 mm | 0.75 m | 2.4 m | orange, heavy, KR C4 |
| FANUC R-2000iC/210F | 210 kg | 2655 mm | 0.8 m | 2.3 m | yellow, 1,090 kg, R-30iB Plus A-cabinet |
| FANUC R-2000iB/125L | 125 kg | 3005 mm | 0.8 m | 2.5 m | yellow, long arm, R-30iA cabinet |
| ABB IRB 6700 class | 150 kg | 2600 mm | 0.75 m | 2.3 m | graphite white, IRC5 |

### Controllers and pendants (real sizes)
- **KR C4** cabinet: 0.79 w × 0.56 d × 0.96 h m plus 0.06 m castors; light grey RAL 7035 with a dark grey door frame;
  the door carries the orange KUKA logo plate top left, the red/yellow rotary mains switch top right, a ventilation
  grille with two fans at the bottom, the smartPAD holder (a hook bracket) on the right edge; a connector panel
  (X1, X11, X19, X21: rectangular Harting sockets) along the bottom front; cable entry on top; a stack of the robot's
  motor and data cables coiled on top (as in the photos).
- **KR C5**: 0.58 w × 0.56 d × 0.87 h m slim grey cabinet, small KUKA logo, grille at the bottom.
- **KR C5 micro**: 0.5 w × 0.47 d × 0.27 h m black box with two fans on the front, connector face on one side, handle on top.
- **KR C4 compact**: 0.6 w × 0.56 d × 0.27 h m black box with two fans and the connector face; the smartPAD in its holder.
- **smartPAD**: 0.3 × 0.23 × 0.04 m grey tablet with a black bezel, 8.4" screen, the red e-stop top right, six keys on
  each side, a handle strip at the bottom, a coiled grey cable to the cabinet.
- **R-30iB Plus / R-30iA A-cabinet**: 0.47 w × 0.55 d × 1.0 h m beige-grey cabinet on four castors, a door with the mode
  switch, a yellow e-stop, a fan grille top right, the iPendant on a holder on the door (0.3 × 0.2 m, beige with a
  colour screen, yellow e-stop, deadman at the back, coiled cable), a cable bundle coiled on top.
- **IRC5**: 0.97 w × 0.73 d × 0.71 h m grey cabinet with the FlexPendant (white with a joystick and touchscreen).
- Cabinet details common to all: door hinges (3), handle, a ventilation grille, a type plate, warning stickers
  (electric hazard triangle), levelling feet or castors, the cable bundle to the robot base running along the floor.

### Yudo take-out robot checklist
1. Riser frame: two steel legs (0.12 m square tube) 2.2–2.6 m high with 0.4 m base plates and anchor bolts, cross-braced,
   a mounting plate on top; yellow/black stripes on the lower legs.
2. Traverse beam: black anodised aluminium profile 0.2 × 0.3 m section, 2.4 m (MEGA-2000), 2.9 m (MEGA-2500) or 3.5 m
   (Giga 3525) long, with a linear guide rail along its front face, a toothed belt cover strip, end caps, the blue/white
   "YUDO-STAR" / "YUDO" logo plate and the model name, a servo motor with its cover at one end.
3. Traverse carriage: a plate carriage on the rail with a kick-axis beam (0.9–1.2 m) crosswise, its servo motor, limit
   switches, and the vertical arm(s) hanging from the kick carriage: a telescopic square profile (0.1 m, two stages)
   with a linear guide, 1.2–1.6 m stroke; "-2P" = main arm + sprue arm (slimmer), "4P" = two main arms + two sprue arms.
4. Gripper head (EOAT): an aluminium cross plate with 4–8 bellows suction cups, a sprue chuck (pneumatic clamp), a
   swivel / flip unit (90° pneumatic rotary) and the air fittings with blue hoses.
5. Energy chains: a black plastic chain in a tray along the traverse beam, one along the kick beam, one on the vertical
   arm; the chains must follow the carriages when they move.
6. Controls: a YUCON control cabinet (slim grey cabinet 0.4 × 0.3 × 0.9 m on the leg) with a cable duct up to the beam;
   the YUCON-400/500/700 handheld terminal (0.25 × 0.18 m, colour screen, keypad, yellow e-stop) on a hook; a signal
   tower lamp on the beam end.
7. Platform variant (opts.platform): a grating maintenance platform 2 m long on the riser frame with yellow handrails
   and a vertical ladder with a safety cage.
8. Cycle: the vertical arm descends into the "mould" position (between the legs), closes, rises, the traverse carriage
   moves to the drop end, the head swivels 90°, descends to the conveyor height, releases, returns.

### Cell checklist
Fence: yellow (0xe3b82e) 60 mm square posts on base plates every 1–1.5 m, black welded mesh panels 2 m high (use a
canvas texture of a mesh grid, transparent), a hinged door with a yellow frame, a Euchner-style safety switch (black box
with a red actuator) and a handle, a light-curtain pair (yellow/black posts 1.2 m with a slim black sensor strip) at the
loading opening, a yellow/black floor marking around the cell, a control pedestal outside with a screen, keypad, e-stop
and a 3-colour signal tower, a fire extinguisher. Grinding cell: 4 ABB robots each holding a pneumatic grinding spindle
(black housing, abrasive disc), 2 workpiece tables with clamping fixtures and a die block, an extraction hood with a
duct up to a dust collector, a tool-change rack with spare discs, sparks sprite not needed. Laser cell: enclosure walls
(grey panels) with a tinted window, an ABB robot holding a laser cutting head (black with a nozzle and a red fibre),
a rotary turning table with two liner fixtures, the laser source cabinet "ELEN Blade RF 333" (grey, with a screen),
the air extraction unit with a duct. Press workstation: KR210 beside a pressing table 2.5 × 1 m with a lift table,
panel stack on a pallet, and a two-hand control stand.

### The f2evp KR210 L180-2 panel pressing workstation, exactly as photographed (photos/0bdf4fda9b54b55c9b1807d5ae6d871a.jpg)
robotCell with opts.purpose 'press': the fence is GREEN (0x3e8a3a) welded-mesh panels on green posts, 2 m high, with a
yellow-framed sliding door; the KUKA KR210 (orange, classic KR 210-2 series: big balancer cylinder on the left of the
column, A4–A6 motor block at the rear of the arm, black dress hoses) stands on a grey cast base on the concrete floor
with a cable trench cover; its end effector is a large RED steel vacuum frame (about 1.2 × 0.6 m, red RAL 3000 box
section with a column of 6 suction cups on the underside and a pneumatic cylinder), hanging from the wrist; next to the
robot a grey KR C2 edition cabinet (0.8 × 0.55 × 1.4 m, tall, grey) with the KCP pendant; a pressing table 2.5 × 1 m
(dark grey steel plate on a frame, yellow/black edge stripes) with the panel stack; a light curtain at the opening and
a signal lamp on a post. Build it in this configuration whenever the name contains "KR210" and "panel pressing".
