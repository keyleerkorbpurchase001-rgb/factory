#!/usr/bin/env python3
"""Write the plan-view sizes rendered by tools/render_views.mjs (top/_sizes.json: image size and hall size in
metres per hall) into index.html (D.halls.<hall>.top) and hall-data.js."""
import json, re, os, subprocess, sys
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sizes = json.load(open(os.path.join(root, 'top', '_sizes.json')))
p = os.path.join(root, 'index.html')
s = open(p, encoding='utf-8').read()
m = re.search(r'\nconst D=(\{.*?\});\n', s, re.S)
D = json.loads(m.group(1))
n = 0
for k, t in sizes.items():
    if k in D['halls']:
        D['halls'][k]['top'] = {'w': t['w'], 'h': t['h'], 'W': t['W'], 'D': t['D']}; n += 1
s = s[:m.start(1)] + json.dumps(D, ensure_ascii=False) + s[m.end(1):]
open(p, 'w', encoding='utf-8').write(s)
subprocess.check_call([sys.executable, os.path.join(root, 'tools', 'make_hall_data.py')])
print('index.html: plan sizes of', n, 'halls updated')
