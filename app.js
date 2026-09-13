/* ============================================================
   INSURANCE DRUG LIST - Main Application Logic
   قائمة أدوية التأمين الصحي
============================================================ */

'use strict';

// ─── STATE ─────────────────────────────────────────────────
const state = {
  drugs: [],
  filtered: [],
  searchQuery: '',
  filterSheet: 'all',
  filterAuthority: 'all',
  filterGroup: 'all',
  renderOffset: 0,
  PAGE_SIZE: 60,
  renderToken: 0,
  renderTimer: null,
};

// ─── DOM REFS ──────────────────────────────────────────────
const $ = id => document.getElementById(id);
const searchInput       = $('searchInput');
const clearBtn          = $('clearBtn');
const resultsGrid       = $('resultsGrid');
const resultsMeta       = $('resultsMeta');
const noResults         = $('noResults');
const loadingState      = $('loadingState');
const modalOverlay      = $('modalOverlay');
const modalBody         = $('modalBody');
const modalClose        = $('modalClose');
const filterSheetEl     = $('filterSheet');
const filterAuthEl      = $('filterAuthority');
const filterGroupEl     = $('filterGroup');
const statTotal         = $('statTotal');
const iosGroupTrigger   = $('iosGroupTrigger');
const iosGroupValue     = $('iosGroupValue');
const groupSheetOverlay = $('groupSheetOverlay');
const groupSheetClose   = $('groupSheetClose');
const groupSheetSearch  = $('groupSheetSearch');
const groupSheetList    = $('groupSheetList');
const authorityFilterGroup = $('authorityFilterGroup');

// ─── AUTHORITY / COMMITTEE DISPLAY MAP ────────────────────
const AUTHORITY_DISPLAY = {
  'gp':  { label: 'GP',  arLabel: 'ممارس عام',   badge: 'badge-gp',  full: 'General Practitioner' },
  'sp':  { label: 'SP',  arLabel: 'متخصص',        badge: 'badge-sp',  full: 'Specialist' },
  'con': { label: 'CON', arLabel: 'استشاري',      badge: 'badge-con', full: 'Consultant' },
};

const COMMITTEE_DISPLAY = {
  'لجنة عليا':  { label: 'لجنة عليا',  badge: 'badge-committee' },
  'لجنة القلب': { label: 'لجنة القلب', badge: 'badge-committee-heart' },
  'لجنة MS':    { label: 'لجنة MS',    badge: 'badge-committee-ms' },
};

// ─── GROUP METADATA (35 Groups with English Primary & Arabic Subtitle) ───
const GROUP_META = {
  '1':  { emoji: '💊', en: 'Antipyretic Analgesic, Antirheumatic Drugs', ar: 'مسكنات ومضادات روماتيزم وخافض حرارة' },
  '2':  { emoji: '🧘', en: 'Central Muscle Relaxant Drugs', ar: 'أدوية باسطة للعضلات' },
  '3':  { emoji: '🦠', en: 'Anti-Microbial Drugs', ar: 'مضادات الميكروبات والمضادات الحيوية' },
  '4':  { emoji: '🍄', en: 'Antifungal Drugs', ar: 'مضادات الفطريات' },
  '5':  { emoji: '🔬', en: 'Antiviral Drugs', ar: 'مضادات الفيروسات' },
  '6':  { emoji: '🧫', en: 'Anti-Amoebic, Anti-Giardial Drugs', ar: 'مضادات الأميبا والجيارديا والطفيليات' },
  '7':  { emoji: '🪱', en: 'Anthelmintic Drugs', ar: 'طاردات ومضادات الديدان' },
  '8':  { emoji: '🦟', en: 'Anti-Malarial Drugs', ar: 'مضادات الملاريا' },
  '9':  { emoji: '🧠', en: 'Psychotropic Drugs', ar: 'أدوية نفسية وعصبية ومهدئات' },
  '10': { emoji: '⚡', en: 'Anti-Epileptic Drugs', ar: 'مضادات الصرع والتشنجات' },
  '11': { emoji: '🦯', en: 'Anti-Parkinsonian Drugs', ar: 'أدوية الشلل الرعاش (باركنسون)' },
  '12': { emoji: '❤️', en: 'Cardiovascular Drugs', ar: 'أدوية القلب والأوعية الدموية والضغط' },
  '13': { emoji: '💧', en: 'Diuretics', ar: 'مدرات البول' },
  '14': { emoji: '🩸', en: 'Anti-Coagulant Drugs', ar: 'مضادات التجلط والسيولة' },
  '15': { emoji: '🩹', en: 'Haemostatic Drugs', ar: 'أدوية إيقاف النزيف والتخثر' },
  '16': { emoji: '💉', en: 'Anti-Diabetics Drugs', ar: 'أدوية علاج السكر والأنسولين' },
  '17': { emoji: '🧬', en: 'Hormones Drugs', ar: 'أدوية الهرمونات والغدد الصماء' },
  '18': { emoji: '🌸', en: 'Anti-Allergic Drugs', ar: 'مضادات الحساسية والهستامين' },
  '19': { emoji: '🫁', en: 'Drugs For Respiratory System', ar: 'أدوية الجهاز التنفسي والصدر' },
  '20': { emoji: '🧴', en: 'Dermatological Drugs', ar: 'أدوية الأمراض الجلدية' },
  '21': { emoji: '👁️', en: 'Ophthalmic Drugs', ar: 'أدوية وقطرات العيون' },
  '22': { emoji: '👂', en: 'Ear, Nose & Throat Drugs (ENT)', ar: 'أدوية الأنف والأذن والحنجرة' },
  '23': { emoji: '🦷', en: 'Dental & Buccal Drugs', ar: 'أدوية الفم والأسنان واللثة' },
  '24': { emoji: '🩺', en: 'Drugs For Haemorrhoids', ar: 'أدوية علاج البواسير والشرخ' },
  '25': { emoji: '🫄', en: 'Gastro-Intestinal Drugs', ar: 'أدوية الجهاز الهضمي والمعدة والقولون' },
  '26': { emoji: '🛑', en: 'Antidiarrheal Drugs', ar: 'أدوية علاج الإسهال' },
  '27': { emoji: '🌿', en: 'Laxative Drugs', ar: 'أدوية الملينات والإمساك' },
  '28': { emoji: '🟤', en: 'Drugs For Hepatic Diseases', ar: 'أدوية أمراض الكبد والجهاز المراري' },
  '29': { emoji: '🚻', en: 'Drugs For Urinary & Prostatic Diseases', ar: 'أدوية المسالك البولية والبروستاتا' },
  '30': { emoji: '🫧', en: 'Effervescent & Antispasmodic Drugs', ar: 'الفوارات ومضادات التقلص والمغص' },
  '31': { emoji: '🛡️', en: 'Cytotoxic, Immunosuppressive & Complimentary Drugs', ar: 'أدوية الأورام ومثبطات المناعة والمكملات' },
  '32': { emoji: '💊', en: 'Vitamins Drugs', ar: 'الفيتامينات والمعادن والمقويات' },
  '33': { emoji: '📦', en: 'Miscellaneous Drugs', ar: 'أدوية متنوعة وأخرى' },
  '34': { emoji: '🎗️', en: 'Higher Committee - Oncology Drugs', ar: 'أدوية اللجنة العليا للأورام' },
  '35': { emoji: '🩺', en: 'Higher Committee - Drug Committee', ar: 'أدوية اللجنة العليا للدواء' },
};

// ─── DATA NORMALIZATION & HIDDEN SEARCH ALIASES ────────────
const ARABIC_SEARCH_NAMES = {
  paracetamol: 'باراسيتامول بنادول', amoxicillin: 'أموكسيسيلين',
  diclofenac: 'ديكلوفيناك فولتارين', ibuprofen: 'إيبوبروفين',
  aspirin: 'أسبرين', acetylsalicylic: 'أسيتيل ساليسيليك',
  insulin: 'إنسولين', metformin: 'ميتفورمين', gliclazide: 'جليكلازيد',
  amlodipine: 'أملوديبين', losartan: 'لوسارتان', valsartan: 'فالسارتان',
  bisoprolol: 'بيسوبرولول', atenolol: 'أتينولول', warfarin: 'وارفارين',
  apixaban: 'أبيكسابان', rivaroxaban: 'ريفاروكسابان',
  omeprazole: 'أوميبرازول', esomeprazole: 'إيزوميبرازول',
  pantoprazole: 'بانتوبرازول', azithromycin: 'أزيثروميسين',
  ciprofloxacin: 'سيبروفلوكساسين', cefixime: 'سيفيكسيم',
  salbutamol: 'سالبوتامول', budesonide: 'بوديزونيد',
  prednisolone: 'بريدنيزولون', gabapentin: 'جابابنتين',
  pregabalin: 'بريجابالين', levetiracetam: 'ليفيتيراسيتام',
  atorvastatin: 'أتورفاستاتين', rosuvastatin: 'روزوفاستاتين',
  furosemide: 'فوروسيميد', spironolactone: 'سبيرونولاكتون',
  nintedanib: 'نينتيدانيب', ofev: 'أوفيف', entresto: 'إنتريستو',
  xarelto: 'كساريلتو', eliquis: 'إليكويس', plavix: 'بلافِكس',
  norvasc: 'نورفاسك', nexium: 'نيكسيوم', janumet: 'جانوميت',
  singulair: 'سينجولير', tresiba: 'تريسيبا', toujeo: 'توجيو',
};

function titleCaseDrugName(value) {
  return String(value || '').trim().toLowerCase().replace(/(^|[\s+()/,-])([a-z])/g, (_, sep, ch) => sep + ch.toUpperCase())
    .replace(/\b(mr|sr|cr|ret|ls)\b/gi, m => m.toUpperCase());
}

function normalizeUnit(value) {
  const raw = String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
  const aliases = { tab: 'tablet', tabs: 'tablet', yab: 'tablet', cap: 'capsule', caps: 'capsule', amp: 'ampoule', vail: 'vial', cartidge: 'cartridge', spary: 'spray', film: 'film', films: 'film', pen: 'pen', vial: 'vial', tube: 'tube', syrup: 'syrup', susp: 'suspension', oint: 'ointment' };
  return aliases[raw] || raw;
}

function pluralUnit(unit, count) {
  const plural = { tablet: 'tablets', capsule: 'capsules', ampoule: 'ampoules', vial: 'vials', film: 'films', pen: 'pens', tube: 'tubes', syrup: 'syrups', suspension: 'suspensions', ointment: 'ointments', cartridge: 'cartridges', spray: 'sprays' };
  return count === 1 ? unit : (plural[unit] || unit);
}

function parsePackage(value) {
  const raw = String(value || '').trim();
  const match = raw.match(/^(\d+)\s*([a-z]+)\b/i);
  if (!match) return { label: titleCaseDrugName(raw), count: null, unit: normalizeUnit(raw), concentration: null, form: null };
  const count = Number(match[1]);
  const unit = normalizeUnit(match[2]);
  return { label: `${count} ${pluralUnit(unit, count)}`, count, unit, concentration: null, form: unit };
}

function normalizeDrug(drug) {
  const display_name = titleCaseDrugName(drug.drug_name);
  const key = display_name.toLowerCase();
  const aliases = Object.entries(ARABIC_SEARCH_NAMES).filter(([needle]) => key.includes(needle)).map(([, alias]) => alias).join(' ');
  return { ...drug, display_name, drug_name: display_name, trade_name: drug.trade_name ? titleCaseDrugName(drug.trade_name) : null, search_aliases: aliases };
}

// ─── LOAD DATA ─────────────────────────────────────────────
function loadData() {
  try {
    const data = window.DRUGS_DATA;
    if (!data) throw new Error('DRUGS_DATA not found');

    // Normalize the three lists once at startup. Search aliases stay hidden from cards.
    const freeDrugs = (data.free_drugs || []).map(d => normalizeDrug({
      ...d,
      sheet_label: 'مجاني',
    }));

    // Commercial rows contain a trade/brand name and a package description only.
    const commDrugs = (data.commercial_drugs || []).map(d => {
      const pack = parsePackage(d.unit);
      return normalizeDrug({
        drug_name: d.drug_name,
        trade_name: d.drug_name,
        pack_label: pack.label,
        concentration: pack.concentration,
        drug_form: null,
        package_count: pack.count,
        package_unit: pack.unit,
        authority_raw: null,
        authority: null,
        committee: null,
        group_num: null,
        group_name: 'أدوية تجارية',
        subgroup: null,
        sheet: 'commercial',
        sheet_label: 'تجاري',
      });
    });

    // Special drugs: keep the trade name and show its package/form information.
    const specDrugs = (data.special_drugs || []).map(d => normalizeDrug({
      drug_name: d.drug_name,
      trade_name: d.trade_name || null,
      concentration: null,
      drug_form: d.drug_form || null,
      authority_raw: null,
      authority: null,
      committee: null,
      group_num: null,
      group_name: 'أدوية خاصة',
      subgroup: null,
      sheet: 'special',
      sheet_label: 'خاص',
    }));

    state.drugs = [...freeDrugs, ...commDrugs, ...specDrugs]
      .sort((a, b) => a.display_name.localeCompare(b.display_name, 'en', { sensitivity: 'base' }));
    state.filtered = state.drugs;

    populateGroups(freeDrugs);
    statTotal.textContent = state.drugs.length.toLocaleString('ar-EG');
    loadingState.classList.add('hidden');
    applyFilters();

  } catch (err) {
    loadingState.innerHTML = `
      <div style="color:#fb7185;font-size:1rem;font-weight:700;">
        ⚠️ خطأ في تحميل البيانات<br>
        <small style="color:#94a3b8;font-weight:400;">${err.message}</small>
      </div>`;
    console.error('Load error:', err);
  }
}

// ─── POPULATE GROUPS & iOS SHEET ───────────────────────────
let groupsListCache = [];

function populateGroups(freeDrugs) {
  const groups = {};
  freeDrugs.forEach(d => {
    if (d.group_num != null && d.group_name) {
      groups[d.group_num] = d.group_name;
    }
  });

  const sortedNums = Object.keys(groups).sort((a, b) => +a - +b);

  // Clear native select
  filterGroupEl.innerHTML = '<option value="all">كل المجموعات</option>';

  // Cache rich list data (English name as primary title, Arabic translation as subtitle)
  groupsListCache = [
    { value: 'all', num: '', emoji: '✨', titleEn: '— All Drug Groups / كل المجموعات —', titleAr: 'عرض جميع الأصناف الدوائية في القائمة' },
    ...sortedNums.map(num => {
      const origName = groups[num];
      const meta = GROUP_META[num] || { emoji: '💊', en: origName, ar: '' };
      return {
        value: String(num),
        num: String(num),
        emoji: meta.emoji,
        titleEn: `${num}. ${meta.en || origName}`,
        titleAr: meta.ar || '',
      };
    })
  ];

  // Populate native select for accessibility
  sortedNums.forEach(num => {
    const opt = document.createElement('option');
    opt.value = num;
    const meta = GROUP_META[num];
    opt.textContent = `${num}. ${meta ? meta.en : groups[num]}`;
    filterGroupEl.appendChild(opt);
  });

  renderGroupSheetItems();
}

function renderGroupSheetItems(filterText = '') {
  const query = (filterText || '').trim().toLowerCase();
  const filtered = groupsListCache.filter(item => {
    if (!query) return true;
    if (item.value === 'all') return true;
    return item.num === query ||
           item.titleEn.toLowerCase().includes(query) ||
           item.titleAr.toLowerCase().includes(query);
  });

  if (filtered.length === 0) {
    groupSheetList.innerHTML = `
      <div style="text-align:center;padding:2.5rem 1rem;color:#64748b;">
        <div style="font-size:2rem;margin-bottom:0.5rem;opacity:0.6;">🔍</div>
        <p style="font-weight:700;font-size:0.95rem;color:#94a3b8;">لا توجد مجموعة مطابقة لـ "${escHtml(filterText)}"</p>
      </div>
    `;
    return;
  }

  groupSheetList.innerHTML = filtered.map(item => {
    const isSelected = String(state.filterGroup) === String(item.value);
    return `
      <div class="ios-sheet-item${isSelected ? ' selected' : ''}" data-value="${item.value}" role="option" aria-selected="${isSelected}">
        <div class="ios-item-content">
          <span class="ios-item-emoji">${item.emoji}</span>
          <div class="ios-item-text">
            <span class="ios-item-title">${escHtml(item.titleEn)}</span>
            ${item.titleAr ? `<span class="ios-item-subtitle">${escHtml(item.titleAr)}</span>` : ''}
          </div>
        </div>
        <span class="ios-item-check">✓</span>
      </div>
    `;
  }).join('');

  groupSheetList.querySelectorAll('.ios-sheet-item').forEach(itemEl => {
    itemEl.addEventListener('click', () => {
      const val = itemEl.getAttribute('data-value');
      selectGroup(val);
      closeGroupSheet();
    });
  });
}

function selectGroup(val) {
  state.filterGroup = val;
  filterGroupEl.value = val;

  const found = groupsListCache.find(x => String(x.value) === String(val));
  if (found) {
    if (val === 'all') {
      iosGroupValue.textContent = '— اختر المجموعة الدوائية —';
      iosGroupValue.style.color = '#38bdf8';
    } else {
      iosGroupValue.textContent = `${found.emoji} ${found.titleEn}`;
      iosGroupValue.style.color = '#f1f5f9';
    }
  }

  // Update checkmarks
  groupSheetList.querySelectorAll('.ios-sheet-item').forEach(el => {
    const isSel = el.getAttribute('data-value') === String(val);
    el.classList.toggle('selected', isSel);
    el.setAttribute('aria-selected', isSel);
  });

  applyFilters();
}

function openGroupSheet() {
  groupSheetOverlay.classList.remove('hidden');
  iosGroupTrigger.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
  if (groupSheetSearch) {
    groupSheetSearch.value = '';
    renderGroupSheetItems();
    setTimeout(() => groupSheetSearch.focus(), 120);
  }
}

function closeGroupSheet() {
  groupSheetOverlay.classList.add('hidden');
  iosGroupTrigger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

// ─── SEARCH & FILTER ──────────────────────────────────────
function applyFilters() {
  const q     = state.searchQuery.trim().toLowerCase();
  const sheet = state.filterSheet;
  const auth  = state.filterAuthority;
  const grp   = state.filterGroup;

  state.filtered = state.drugs.filter(d => {
    if (sheet !== 'all' && d.sheet !== sheet) return false;

    if (auth !== 'all') {
      // Special authority filters
      if (auth === 'committee') {
        if (!d.committee) return false;
      } else {
        if (d.authority !== auth) return false;
      }
    }

    if (grp !== 'all') {
      if (String(d.group_num) !== String(grp)) return false;
    }

    if (q) {
      const haystack = [
        d.drug_name, d.concentration, d.drug_form,
        d.authority_raw, d.group_name, d.subgroup,
        d.trade_name, d.committee, d.search_aliases, d.pack_label,
      ].filter(Boolean).join(' ').toLowerCase();
      return q.split(/\s+/).every(w => haystack.includes(w));
    }
    return true;
  });

  state.filtered.sort((a, b) => a.display_name.localeCompare(b.display_name, 'en', { sensitivity: 'base' }));
  state.renderOffset = 0;
  renderResults();
}

// ─── RENDER ────────────────────────────────────────────────
function renderResults() {
  state.renderToken += 1;
  const token = state.renderToken;
  if (state.renderTimer) {
    clearTimeout(state.renderTimer);
    state.renderTimer = null;
  }
  resultsGrid.innerHTML = '';

  if (state.filtered.length === 0) {
    noResults.classList.remove('hidden');
    resultsMeta.innerHTML = '';
    return;
  }

  noResults.classList.add('hidden');
  state.renderOffset = 0;
  renderNextChunk(token);
}

function renderNextChunk(token) {
  if (token !== state.renderToken) return;
  const oldLoadMore = resultsGrid.querySelector('.load-more-btn');
  if (oldLoadMore) oldLoadMore.remove();
  const start = state.renderOffset;
  const end = Math.min(start + state.PAGE_SIZE, state.filtered.length);
  const frag = document.createDocumentFragment();
  for (let idx = start; idx < end; idx += 1) {
    frag.appendChild(createCard(state.filtered[idx], idx));
  }
  resultsGrid.appendChild(frag);
  state.renderOffset = end;
  resultsMeta.innerHTML = `عرض <strong>${end.toLocaleString('ar-EG')}</strong> من أصل <strong>${state.filtered.length.toLocaleString('ar-EG')}</strong> نتيجة`;

  if (end < state.filtered.length) {
    resultsGrid.appendChild(makeLoadMoreBtn(state.filtered.length - end, token));
    state.renderTimer = null;
  } else {
    state.renderTimer = null;
  }
}

function makeLoadMoreBtn(remaining, token) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'load-more-btn';
  btn.textContent = `تحميل المزيد (${remaining.toLocaleString('ar-EG')} نتيجة متبقية)`;
  btn.addEventListener('click', () => {
    if (token !== state.renderToken) return;
    renderNextChunk(token);
  });
  return btn;
}

// ─── SVG ICONS ────────────────────────────────────────────
const ICONS = {
  conc:  '<svg class="chip-icon" viewBox="0 0 16 16" fill="none"><path d="M6 2h4M7 2v3L4.5 9.5A3.5 3.5 0 008 14a3.5 3.5 0 003.5-4.5L9 5V2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  form:  '<svg class="chip-icon" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="3" stroke="currentColor" stroke-width="1.3"/><path d="M5 8h6M8 5v6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
  trade: '<svg class="chip-icon" viewBox="0 0 16 16" fill="none"><path d="M2 4.5A1.5 1.5 0 013.5 3h9A1.5 1.5 0 0114 4.5v7a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 012 11.5v-7z" stroke="currentColor" stroke-width="1.3"/><path d="M5 7.5h6M5 10h4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
  unit:  '<svg class="chip-icon" viewBox="0 0 16 16" fill="none"><path d="M4 2h8l1 4H3L4 2z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M3 6v8h10V6" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>',
  group: '<svg viewBox="0 0 16 16" fill="none"><path d="M2 5h12M2 8h8M2 11h10" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
};

// ─── CREATE CARD ─────────────────────────────────────────────
function createCard(drug, idx) {
  const card = document.createElement('div');
  card.className = 'drug-card';
  card.style.animationDelay = `${Math.min(idx * 0.03, 0.4)}s`;
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-label', drug.drug_name || '');

  const badges = [];
  badges.push(`<span class="badge badge-${drug.sheet}">${drug.sheet_label}</span>`);
  if (drug.committee) {
    const ci = COMMITTEE_DISPLAY[drug.committee] || { label: drug.committee, badge: 'badge-committee' };
    badges.push(`<span class="badge ${ci.badge}">${ci.label}</span>`);
  } else if (drug.authority) {
    const ai = AUTHORITY_DISPLAY[drug.authority];
    if (ai) badges.push(`<span class="badge ${ai.badge}">${ai.label}</span>`);
  }

  const highlightedName = highlightQuery(drug.drug_name || '-', state.searchQuery);

  const chips = [];
  if (drug.concentration) chips.push(`<span class="card-chip chip-conc" dir="ltr">${ICONS.conc}<span>${highlightQuery(drug.concentration, state.searchQuery)}</span></span>`);
  if (drug.drug_form)     chips.push(`<span class="card-chip chip-form">${ICONS.form}<span>${highlightQuery(drug.drug_form, state.searchQuery)}</span></span>`);
  if (drug.trade_name && drug.trade_name !== drug.drug_name) chips.push(`<span class="card-chip chip-trade">${ICONS.trade}<span>${escHtml(drug.trade_name)}</span></span>`);
  if (drug.pack_label)    chips.push(`<span class="card-chip chip-unit">${ICONS.unit}<span>${escHtml(drug.pack_label)}</span></span>`);
  const chipsHtml = chips.length ? `<div class="card-chips">${chips.join('')}</div>` : '';

  let subgroupHtml = '';
  if (drug.subgroup) {
    const parts = drug.subgroup.split(' > ');
    subgroupHtml = '<div class="card-subgroup">' +
      parts.map(p => `<span class="sub-item">${escHtml(p)}</span>`).join('<span class="sub-sep">&#8250;</span>') +
      '</div>';
  }

  const groupFooter = drug.group_name
    ? `<div class="card-group-footer">${ICONS.group}<span class="card-group-footer-text">${escHtml(drug.group_name)}</span></div>`
    : '';

  card.innerHTML =
    '<div class="card-body">' +
      '<div class="card-header">' +
        '<div class="card-badges">' + badges.join('') + '</div>' +
      '</div>' +
      '<div class="card-name" dir="ltr">' + highlightedName + '</div>' +
      chipsHtml +
      subgroupHtml +
    '</div>' +
    groupFooter;

  card.addEventListener('click',   () => openModal(drug));
  card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openModal(drug); });

  return card;
}


// ─── HIGHLIGHT & ESCAPE ────────────────────────────────────
function highlightQuery(text, query) {
  if (!query || !text) return escHtml(text);
  const words = query.trim().split(/\s+/).filter(Boolean);
  let result = escHtml(text);
  words.forEach(word => {
    if (word.length < 2) return;
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    result = result.replace(new RegExp(`(${escaped})`, 'gi'), '<mark>$1</mark>');
  });
  return result;
}

function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── MODAL ─────────────────────────────────────────────────
function openModal(drug) {
  const authInfo = drug.authority ? AUTHORITY_DISPLAY[drug.authority] : null;

  // Top badges
  const badges = [];
  const sheetLabels = { free: 'قائمة مجانية', commercial: 'قائمة تجارية', special: 'أدوية خاصة' };
  badges.push(`<span class="badge badge-${drug.sheet}" style="font-size:0.78rem;padding:0.25rem 0.8rem;">${sheetLabels[drug.sheet] || drug.sheet}</span>`);

  if (drug.committee) {
    const ci = COMMITTEE_DISPLAY[drug.committee] || { label: drug.committee, badge: 'badge-committee' };
    badges.push(`<span class="badge ${ci.badge}" style="font-size:0.78rem;padding:0.25rem 0.8rem;">${ci.label}</span>`);
  }
  if (authInfo) {
    badges.push(`<span class="badge ${authInfo.badge}" style="font-size:0.78rem;padding:0.25rem 0.8rem;">${authInfo.label} – ${authInfo.full}</span>`);
  }

  // Fields grid
  const fields = [];
  if (drug.concentration)  fields.push(['التركيز / الجرعة',     drug.concentration,  true]);
  if (drug.drug_form)      fields.push(['الشكل الدوائي',         drug.drug_form,      false]);
  if (drug.authority_raw)  fields.push(['السلطة الوصفية',        drug.authority_raw,  false]);
  if (drug.trade_name)     fields.push(['الاسم التجاري',          drug.trade_name,     true]);
  if (drug.pack_label)     fields.push(['العبوة',                 drug.pack_label,      false]);

  const fieldsHtml = fields.map(([label, value, hl]) => `
    <div class="modal-field">
      <div class="modal-field-label">${label}</div>
      <div class="modal-field-value${hl ? ' highlight' : ''}">${escHtml(value)}</div>
    </div>
  `).join('');

  // Group / subgroup
  let groupHtml = '';
  if (drug.group_name) {
    groupHtml = `
      <div class="modal-group-strip">
        <span>المجموعة: </span>${escHtml(drug.group_name)}
        ${drug.group_num ? `<span style="color:#4b5563"> (Group ${drug.group_num})</span>` : ''}
      </div>`;
  }
  if (drug.subgroup) {
    const parts = drug.subgroup.split(' > ');
    groupHtml += `
      <div class="modal-subgroup-strip">
        <span class="modal-subgroup-icon">📑</span>
        ${parts.map(p => `<span>${escHtml(p)}</span>`).join('<span style="color:#4b5563;margin:0 4px;">›</span>')}
      </div>`;
  }

  // In-list status
  const statusHtml = `
    <div class="modal-status-ok">
      <span>✅</span>
      هذا الدواء موجود في قائمة التأمين الصحي
    </div>
  `;

  modalBody.innerHTML = `
    <div class="modal-drug-name">${escHtml(drug.trade_name || drug.drug_name || '—')}</div>
    <div class="modal-badges">${badges.join('')}</div>
    ${statusHtml}
    ${fields.length ? `<div class="modal-grid">${fieldsHtml}</div>` : ''}
    ${groupHtml}
  `;

  modalOverlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  modalClose.focus();
}

function closeModal() {
  modalOverlay.classList.add('hidden');
  document.body.style.overflow = '';
  searchInput.focus();
}

// ─── EVENT LISTENERS ──────────────────────────────────────

// Search
let searchTimeout;
searchInput.addEventListener('input', () => {
  state.searchQuery = searchInput.value;
  clearBtn.classList.toggle('visible', !!searchInput.value);
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(applyFilters, 40);
});

clearBtn.addEventListener('click', () => {
  searchInput.value = '';
  state.searchQuery = '';
  clearBtn.classList.remove('visible');
  searchInput.focus();
  applyFilters();
});

// Sheet filter
filterSheetEl.addEventListener('click', e => {
  const pill = e.target.closest('.pill');
  if (!pill) return;
  filterSheetEl.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
  pill.classList.add('active');
  state.filterSheet = pill.dataset.value;

  // Authority data exists only in the free list, so hide this filter completely elsewhere.
  const hideAuthority = state.filterSheet === 'commercial' || state.filterSheet === 'special';
  authorityFilterGroup.classList.toggle('hidden', hideAuthority);
  if (hideAuthority) {
    state.filterAuthority = 'all';
    filterAuthEl.querySelectorAll('.pill').forEach(p => p.classList.toggle('active', p.dataset.value === 'all'));
  }
  applyFilters();
});

// Authority filter
filterAuthEl.addEventListener('click', e => {
  const pill = e.target.closest('.pill');
  if (!pill) return;
  filterAuthEl.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
  pill.classList.add('active');
  state.filterAuthority = pill.dataset.value;
  applyFilters();
});

// Group filter (Native change fallback)
filterGroupEl.addEventListener('change', () => {
  selectGroup(filterGroupEl.value);
});

// iOS Group Picker Sheet listeners
if (iosGroupTrigger) {
  iosGroupTrigger.addEventListener('click', openGroupSheet);
}
if (groupSheetClose) {
  groupSheetClose.addEventListener('click', closeGroupSheet);
}
if (groupSheetOverlay) {
  groupSheetOverlay.addEventListener('click', e => {
    if (e.target === groupSheetOverlay) closeGroupSheet();
  });
}
if (groupSheetSearch) {
  groupSheetSearch.addEventListener('input', e => {
    renderGroupSheetItems(e.target.value);
  });
}

// Modal close
modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });

// Global keyboard navigation
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (groupSheetOverlay && !groupSheetOverlay.classList.contains('hidden')) {
      closeGroupSheet();
    } else if (!modalOverlay.classList.contains('hidden')) {
      closeModal();
    }
  }
});

// ─── BOOT ──────────────────────────────────────────────────
loadData();
