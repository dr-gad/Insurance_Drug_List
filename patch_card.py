import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('app.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find line numbers
start_line = None
end_line   = None

for i, line in enumerate(lines):
    if 'CREATE CARD' in line and start_line is None:
        start_line = i
    if start_line is not None and i > start_line:
        if line.strip() == 'return card;':
            # The closing } is 2 lines later
            end_line = i + 2  # include the } and blank line
            break

print(f'Block lines {start_line} to {end_line}')
print('First line:', repr(lines[start_line]))
print('End line:', repr(lines[end_line-1]))

# New block as list of lines (no special encoding issues)
NEW_LINES = [
    '// \u2500\u2500\u2500 SVG ICONS \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n',
    'const ICONS = {\n',
    "  conc:  '<svg class=\"chip-icon\" viewBox=\"0 0 16 16\" fill=\"none\"><path d=\"M6 2h4M7 2v3L4.5 9.5A3.5 3.5 0 008 14a3.5 3.5 0 003.5-4.5L9 5V2\" stroke=\"currentColor\" stroke-width=\"1.3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>',\n",
    "  form:  '<svg class=\"chip-icon\" viewBox=\"0 0 16 16\" fill=\"none\"><rect x=\"2\" y=\"2\" width=\"12\" height=\"12\" rx=\"3\" stroke=\"currentColor\" stroke-width=\"1.3\"/><path d=\"M5 8h6M8 5v6\" stroke=\"currentColor\" stroke-width=\"1.3\" stroke-linecap=\"round\"/></svg>',\n",
    "  trade: '<svg class=\"chip-icon\" viewBox=\"0 0 16 16\" fill=\"none\"><path d=\"M2 4.5A1.5 1.5 0 013.5 3h9A1.5 1.5 0 0114 4.5v7a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 012 11.5v-7z\" stroke=\"currentColor\" stroke-width=\"1.3\"/><path d=\"M5 7.5h6M5 10h4\" stroke=\"currentColor\" stroke-width=\"1.3\" stroke-linecap=\"round\"/></svg>',\n",
    "  unit:  '<svg class=\"chip-icon\" viewBox=\"0 0 16 16\" fill=\"none\"><path d=\"M4 2h8l1 4H3L4 2z\" stroke=\"currentColor\" stroke-width=\"1.3\" stroke-linejoin=\"round\"/><path d=\"M3 6v8h10V6\" stroke=\"currentColor\" stroke-width=\"1.3\" stroke-linejoin=\"round\"/></svg>',\n",
    "  group: '<svg viewBox=\"0 0 16 16\" fill=\"none\"><path d=\"M2 5h12M2 8h8M2 11h10\" stroke=\"currentColor\" stroke-width=\"1.4\" stroke-linecap=\"round\"/></svg>',\n",
    '};\n',
    '\n',
    '// \u2500\u2500\u2500 CREATE CARD \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n',
    'function createCard(drug, idx) {\n',
    "  const card = document.createElement('div');\n",
    "  card.className = 'drug-card';\n",
    '  card.style.animationDelay = `${Math.min(idx * 0.03, 0.4)}s`;\n',
    "  card.setAttribute('role', 'button');\n",
    "  card.setAttribute('tabindex', '0');\n",
    "  card.setAttribute('aria-label', drug.drug_name || '');\n",
    '\n',
    '  const badges = [];\n',
    '  badges.push(`<span class="badge badge-${drug.sheet}">${drug.sheet_label}</span>`);\n',
    '  if (drug.committee) {\n',
    "    const ci = COMMITTEE_DISPLAY[drug.committee] || { label: drug.committee, badge: 'badge-committee' };\n",
    '    badges.push(`<span class="badge ${ci.badge}">${ci.label}</span>`);\n',
    '  } else if (drug.authority) {\n',
    '    const ai = AUTHORITY_DISPLAY[drug.authority];\n',
    '    if (ai) badges.push(`<span class="badge ${ai.badge}">${ai.label}</span>`);\n',
    '  }\n',
    '\n',
    "  const serialStr = drug.serial ? `<span class=\"card-serial\">#${drug.serial}</span>` : '';\n",
    "  const highlightedName = highlightQuery(drug.drug_name || '-', state.searchQuery);\n",
    '\n',
    '  const chips = [];\n',
    '  if (drug.concentration) chips.push(`<span class="card-chip chip-conc">${ICONS.conc}${highlightQuery(drug.concentration, state.searchQuery)}</span>`);\n',
    '  if (drug.drug_form)     chips.push(`<span class="card-chip chip-form">${ICONS.form}${highlightQuery(drug.drug_form, state.searchQuery)}</span>`);\n',
    '  if (drug.trade_name)    chips.push(`<span class="card-chip chip-trade">${ICONS.trade}${escHtml(drug.trade_name)}</span>`);\n',
    '  if (drug.unit)          chips.push(`<span class="card-chip chip-unit">${ICONS.unit}${escHtml(drug.unit)}</span>`);\n',
    "  const chipsHtml = chips.length ? `<div class=\"card-chips\">${chips.join('')}</div>` : '';\n",
    '\n',
    "  let subgroupHtml = '';\n",
    '  if (drug.subgroup) {\n',
    "    const parts = drug.subgroup.split(' > ');\n",
    "    subgroupHtml = '<div class=\"card-subgroup\">' +\n",
    '      parts.map(p => `<span class="sub-item">${escHtml(p)}</span>`).join(\'<span class="sub-sep">&#8250;</span>\') +\n',
    "      '</div>';\n",
    '  }\n',
    '\n',
    '  const groupFooter = drug.group_name\n',
    '    ? `<div class="card-group-footer">${ICONS.group}<span class="card-group-footer-text">${escHtml(drug.group_name)}</span></div>`\n',
    "    : '';\n",
    '\n',
    "  card.innerHTML =\n",
    "    '<div class=\"card-body\">' +\n",
    "      '<div class=\"card-header\">' +\n",
    "        '<div class=\"card-badges\">' + badges.join('') + '</div>' +\n",
    "        serialStr +\n",
    "      '</div>' +\n",
    "      '<div class=\"card-name\">' + highlightedName + '</div>' +\n",
    "      chipsHtml +\n",
    "      subgroupHtml +\n",
    "    '</div>' +\n",
    "    groupFooter;\n",
    '\n',
    "  card.addEventListener('click',   () => openModal(drug));\n",
    "  card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openModal(drug); });\n",
    '\n',
    '  return card;\n',
    '}\n',
    '\n',
]

new_lines = lines[:start_line] + NEW_LINES + lines[end_line:]

with open('app.js', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print(f'Done! Old: {len(lines)} lines, New: {len(new_lines)} lines')
