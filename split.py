import subprocess
import re
import sys
import os

try:
    text = subprocess.check_output('git show HEAD:app.html', shell=True).decode('utf-8', errors='ignore')
except Exception as e:
    print("Could not get git show HEAD:app.html", e)
    sys.exit(1)

script_match = re.search(r'<script>(.*?)</script>', text, re.DOTALL)
if not script_match:
    print("Could not find <script> in git output")
    sys.exit(1)

script_text = script_match.group(1)

# The original file has these headers with ═ characters
blocks = re.split(r'// [═]{40,}\s*//\s*([A-Z0-9_\- ]+)\s*// [═]{40,}', script_text)

print(f"Found {len(blocks)//2} sections")

# First block is before any header, which is the pushToProduction
with open('js/api.js', 'w', encoding='utf-8') as f:
    f.write(blocks[0].strip() + '\n\n')

for i in range(1, len(blocks), 2):
    title = blocks[i].strip()
    content = blocks[i+1].strip()
    
    fname = ''
    if 'STATE' in title: fname = 'js/state.js'
    elif 'CORE' in title: fname = 'js/ui.js'
    elif 'PROGRESS' in title: fname = 'js/ui.js'
    elif 'POSE' in title: fname = 'js/api.js'
    elif 'DIRECTOR' in title: fname = 'js/ui.js'
    elif 'RESIZABLE' in title: fname = 'js/ui.js'
    else: fname = 'js/renderer.js'
    
    with open(fname, 'a', encoding='utf-8') as f:
        f.write(f"\n// ═══════════════════════════════════════════════════════════════════════════\n// {title}\n// ═══════════════════════════════════════════════════════════════════════════\n{content}\n\n")

print("Done splitting")
