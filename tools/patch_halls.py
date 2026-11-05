#!/usr/bin/env python3
"""Wire the factory-line design into every 3D hall page (all *.html except index.html): load hall.css, hall-data.js
and hall-kit.js; size the renderer to its container instead of the window; call HK.dress() after the hall is dressed
and HK.ui() once the scene is ready; restyle the line signs and machine labels to the kit's dark labels.
Every replacement must match exactly once per page, or the script stops without writing."""
TAGS='<script src="hall-data.js"></script>\n<script src="fl-models.js"></script>\n<script src="machines/common.js"></script>\n<script src="machines/handling.js"></script>\n<script src="machines/logistics.js"></script>\n<script src="machines/metal.js"></script>\n<script src="machines/lab.js"></script>\n<script src="machines/dress.js"></script>\n<script src="machines/extra.js"></script>\n<script src="machines/robots.js"></script>\n<script src="machines/takeout.js"></script>\n<script src="machine-rules.js"></script>\n<script src="hall-kit.js"></script>'
import re, os, sys
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
pages = sorted(f for f in os.listdir(root) if f.endswith('.html') and f != 'index.html')
MARK = '<link rel="stylesheet" href="hall.css">'

def once(s, old, new, name):
    n = s.count(old)
    if n != 1:
        raise SystemExit(f'{name}: expected 1 match, found {n}: {old[:80]!r}')
    return s.replace(old, new)

def patch(s, name):
    if MARK in s:
        return None
    s = once(s, '<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">',
             '<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">\n' + MARK, name)
    s = once(s, '<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>',
             '<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>\n'+TAGS+'', name)
    # renderer and post-processing sized to the view, not the window
    s = once(s, 'function resize(){const w=innerWidth,h=innerHeight;',
             'function resize(){const w=(canvas.parentElement&&canvas.parentElement.clientWidth)||innerWidth,h=(canvas.parentElement&&canvas.parentElement.clientHeight)||innerHeight;', name)
    s = once(s, 'function buildComposer(){if(RL.composer)return RL.composer;const w=innerWidth,h=innerHeight,pr=',
             'function buildComposer(){if(RL.composer)return RL.composer;const w=canvas.parentElement.clientWidth||innerWidth,h=canvas.parentElement.clientHeight||innerHeight,pr=', name)
    s = once(s, "addEventListener('resize',()=>{if(RL.composer)RL.composer.setSize(innerWidth,innerHeight)});",
             "addEventListener('resize',()=>{if(RL.composer)RL.composer.setSize(canvas.parentElement.clientWidth||innerWidth,canvas.parentElement.clientHeight||innerHeight)});", name)
    # the kit: walls after the page's dressing, the page chrome once the scene is ready
    s = once(s, "dressHall();contactShadows()}catch(e){console.warn('realism',e)}",
             "dressHall();if(window.HK)HK.dress();contactShadows()}catch(e){console.warn('realism',e)}", name)
    s = once(s, "qualityUI();if(RL.quality==='high')setQuality('high',true);return r};",
             "qualityUI();if(window.HK){try{HK.ui()}catch(e){console.warn('hall-kit ui',e)}}if(RL.quality==='high')setQuality('high',true);return r};", name)
    # line signs: dark label with an orange bar, title and (optional) second line
    sign = re.compile(r"function hangingSign\((text(?:,sub)?)\)\{const g=new THREE\.Group\(\);const t=canvasTex\(\d+,\d+,\(x,w,h\)=>\{.*?\}\);\n")
    if len(sign.findall(s)) != 1:
        raise SystemExit(f'{name}: hangingSign not found once')
    s = sign.sub(lambda m: "function hangingSign(text,sub){const g=new THREE.Group();const t=canvasTex(640,160,(x,w,h)=>{x.clearRect(0,0,w,h);x.fillStyle='rgba(28,27,24,.92)';HKrr(x,4,8,w-8,h-16,14);x.fill();x.fillStyle='#d9824a';x.fillRect(4,8,12,h-16);x.fillStyle='#ecebe5';x.textBaseline='middle';x.font='600 58px \"IBM Plex Sans\",Arial';x.fillText(text,40,sub?56:h/2,w-60);if(sub){x.fillStyle='#d9824a';x.font='500 32px \"IBM Plex Sans\",Arial';x.fillText(sub,40,112,w-60)}});\n", s, count=1)
    # machine labels: dark with a status bar at the left
    tail = "const r=20;x.beginPath();x.moveTo(r,0);x.arcTo(640,0,640,190,r);x.arcTo(640,190,0,190,r);x.arcTo(0,190,0,0,r);x.arcTo(0,0,640,0,r);x.fill();"
    if "x.fillStyle=missing?'rgba(190,40,32,.96)':'rgba(20,32,52,.9)';" + tail in s:
        s = once(s, "x.fillStyle=missing?'rgba(190,40,32,.96)':'rgba(20,32,52,.9)';" + tail,
                 "const hkc=missing?'#d2453b':'#3fa66b';x.fillStyle='rgba(28,27,24,.9)';HKrr(x,0,0,640,190,20);x.fill();x.fillStyle=hkc;x.fillRect(0,0,18,190);", name)
    else:
        s = once(s, "x.fillStyle={miss:'rgba(190,40,32,.96)',ok:'rgba(20,32,52,.92)',bundled:'rgba(120,86,20,.94)',suggest:'rgba(12,92,104,.94)',shared:'rgba(20,32,52,.92)'}[kind];" + tail,
                 "const hkc={miss:'#d2453b',ok:'#3fa66b',bundled:'#d8a531',suggest:'#2f9aa6',shared:'#6ea8dc'}[kind]||'#3fa66b';x.fillStyle='rgba(28,27,24,.9)';HKrr(x,0,0,640,190,20);x.fill();x.fillStyle=hkc;x.fillRect(0,0,18,190);", name)
    lab = re.search(r"function label\(lines,(?:missing|kind)\)\{.*?return sp\}\n", s, re.S)
    if not lab:
        raise SystemExit(f'{name}: label() not found')
    body = lab.group(0)
    body2 = body.replace("x.fillText(lines[0],26,", "x.fillText(lines[0],40,").replace("x.fillText(s,26,y)", "x.fillText(s,40,y)").replace("measureText(s).width>590", "measureText(s).width>574")
    if body2 == body:
        raise SystemExit(f'{name}: label() text positions not found')
    s = s.replace(body, body2, 1)
    return s

changed = 0
for f in pages:
    p = os.path.join(root, f)
    s = open(p, encoding='utf-8').read()
    r = patch(s, f)
    if r is None:
        print(f, 'already patched'); continue
    open(p, 'w', encoding='utf-8').write(r); changed += 1; print(f, 'patched')
print(changed, 'pages patched')
