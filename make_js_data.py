import sys
import io
import json
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Read the generated JSON
with open('drugs_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Write as a JS file with window.DRUGS_DATA
js_content = 'window.DRUGS_DATA = ' + json.dumps(data, ensure_ascii=False, indent=2) + ';\n'

with open('drugs_data.js', 'w', encoding='utf-8') as f:
    f.write(js_content)

total = len(data['free_drugs']) + len(data['commercial_drugs']) + len(data['special_drugs'])
print(f"Generated drugs_data.js with {total} drugs total")
print(f"  Free: {len(data['free_drugs'])}")
print(f"  Commercial: {len(data['commercial_drugs'])}")
print(f"  Special: {len(data['special_drugs'])}")
