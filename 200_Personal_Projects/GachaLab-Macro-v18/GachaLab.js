/* Gacha Lab v18: optional bypass of invalid-number pauses. */
((readGame) => {
  'use strict';
  const VERSION = 18;
  if (window.__gachaLabMacro?.version === VERSION) return;
  window.__gachaLabMacro?.stop();
  document.querySelectorAll('[data-gacha-macro]').forEach(el => el.remove());
  const config = { lineMs: 1000, referenceMsPerChar: 45, timingMarginMs: 150,
    repairLineMs: 1500, repairMsPerChar: 60, repairMarginMs: 200, repairFocusMs: 120,
    beforeEnterMs: 0, betweenLinesMs: 0,
    rateCooldownMs: 5000, maxRateRetries: 2,
    tapMs: 0, upgradeMs: 100, acceptanceMs: 2500,
    activeTapEstimate: 15, activeSprintEstimate: 10, maxUpgradeSaveSeconds: 30 };
  const timingKey = '__gachaLabMacroTimingV9';
  const regularUpgradeIds = new Set(['kb','tap','snack','shift','vend','chair','phones','pizza',
    'gloves','clone','polish','squadup','lounge','nap','cloud','quantum','trophy']);
  const offlineUpgradeIds = new Set(['shift', 'nap']);
  const breakthroughIds = new Set(['cores','arm','clock','noc','gold','clone','neural','lowpower',
    'firewall','cache','fab','fiveg','interest','mentor4','lucky','museum']);
  const defaults = { autoClick: true, autoType: true, autoRepair: true, autoLab: true,
    autoBreakthrough: true, autoShip: false, shipMode: 'percent', shipPercent: 50,
    minShipPayout: 0, reserveTransistors: 0, rebuildHelpers: true, labBuyMode: 'all', spendBeforeShip: false,
    sprintMinMs: config.lineMs, repairMinMs: config.repairLineMs, tapIntervalMs: 0,
    stopGeneration: 0, panelCompact: false, ignoreInvalidNumbers: false };
  const optionsKey = '__gachaLabMacroOptionsV13';
  const options = loadOptions();
  function loadOptions() {
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(optionsKey) || '{}') || {}; } catch {}
    const result = { ...defaults };
    for (const [key, fallback] of Object.entries(defaults)) {
      if (typeof fallback === 'boolean' && typeof saved[key] === 'boolean') result[key] = saved[key];
    }
    if (['percent','early'].includes(saved.shipMode)) result.shipMode = saved.shipMode;
    if (['all','active'].includes(saved.labBuyMode)) result.labBuyMode = saved.labBuyMode;
    const ranges = { shipPercent: [1,100], minShipPayout: [0,1e9], reserveTransistors: [0,1e9],
      sprintMinMs: [100,60000], repairMinMs: [100,60000], tapIntervalMs: [0,60000], stopGeneration: [0,1000000] };
    for (const [key,[min,max]] of Object.entries(ranges)) if (Number.isFinite(saved[key])) result[key] = Math.round(Math.max(min,Math.min(max,saved[key])));
    return result;
  }
  const learnedTiming = loadTiming();
  function loadTiming() {
    const clean = { sprint: {}, repair: {}, repairMinimum: 0 };
    try {
      const saved = JSON.parse(localStorage.getItem(timingKey) || '{}');
      if (Number.isFinite(saved?.repairMinimum) && saved.repairMinimum >= 1000 && saved.repairMinimum <= 15000) clean.repairMinimum = saved.repairMinimum;
      for (const mode of ['sprint', 'repair']) {
        for (const [bucket, value] of Object.entries(saved?.[mode] || {}).slice(0, 125)) {
          if (/^[1-9]\d{0,2}$/.test(bucket) && +bucket <= 125 && Number.isFinite(value) && value >= 1000 && value <= 15000) clean[mode][bucket] = value;
        }
      }
    } catch { /* Storage is optional; timing still learns for this session. */ }
    return clean;
  }
  const state = { running: false, timer: 0, phase: 'idle', due: 0, started: 0,
    code: '', chars: [], index: 0, input: null, lastTap: 0, lastBuy: 0,
    lastScan: -Infinity, lastUi: -Infinity, generation: 0, controls: {}, taps: 0,
    submissions: 0, attempts: 0, buyCursor: 0, mode: 'sprint', busySince: 0,
    lastRepairScan: -Infinity, repairPending: null, repairInput: null, repairReadyAt: 0,
    repairLines: 0, completeAfter: 0,
    lineDurationMs: 1000, charIntervalMs: 0,
    lineBucket: '1', lastAttempt: null, rateFailures: { sprint: 0, repair: 0 },
    cooldownUntil: 0, warningDeadline: 0, pending: null, shipping: null, ships: 0,
    breakthroughBuys: 0, lastManage: -Infinity, shipRetryAt: 0,
    observedLab: null, observedBits: null, observedAt: 0,
    manageNote: '', btNote: '', shipNote: '', lastPaint: -Infinity,
    healthKey: null, healthAt: -Infinity, healthIssue: '', healthDetail: '' };
  const text = el => (el?.textContent || '').replace(/\s+/g, ' ').trim();
  const visible = el => !!el?.isConnected && !!el.getClientRects().length &&
    getComputedStyle(el).visibility !== 'hidden' && !el.closest('[data-gacha-macro]');
  const enabled = el => !el.disabled && el.getAttribute('aria-disabled') !== 'true' &&
    !el.closest('[inert]') && getComputedStyle(el).pointerEvents !== 'none';
  const all = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const buttons = root => all('button,[role="button"]', root).filter(visible);
  const letters = value => value.replace(/[^a-z]/gi, '').toLowerCase();
  const label = name => all('h1,h2,h3,h4,h5,strong,b,span,p,div,[role="heading"]')
    .find(el => el.children.length < 3 && visible(el) && letters(text(el)) === name);
  function exactButton(name) {
    return buttons(document).find(el => letters(text(el)) === name) || label(name);
  }
  function findInput() {
    const known = document.getElementById('spInput');
    if (visible(known)) return known;
    const inputs = all('input,textarea').filter(el => visible(el) &&
      (el.tagName === 'TEXTAREA' || /^(text|search)?$/.test(el.type)));
    const byPlaceholder = inputs.find(el => /type it here|type.*(?:code|enter)/i.test(el.placeholder || ''));
    if (byPlaceholder) return byPlaceholder;
    const heading = label('codesprint');
    for (let root = heading?.parentElement, i = 0; root && i < 6; root = root.parentElement, i++) {
      if (root === document.body) break;
      const local = inputs.filter(el => root.contains(el));
      if (local.length === 1) return local[0];
    }
    return null;
  }
  function sprintCard(input) {
    for (let root = input?.parentElement, i = 0; root && i < 6; root = root.parentElement, i++) {
      if (root === document.body) break;
      if (/code sprint/i.test(text(root))) return root;
    }
    return input?.parentElement;
  }
  function findPrompt(input) {
    if (!input) return null;
    const known = document.getElementById(input.id === 'bugInput' ? 'bugPrompt' : 'spPrompt');
    if (visible(known)) return known;
    const rect = input.getBoundingClientRect();
    const root = sprintCard(input);
    const candidates = all('pre,code,div,span,p', root).filter(el => {
      if (!visible(el) || el.contains(input) || el.querySelector('input,textarea,button')) return false;
      const value = text(el), box = el.getBoundingClientRect();
      if (!value || value.length > 1000 || /code sprint|best combo|combo over/i.test(value)) return false;
      if (!(el.compareDocumentPosition(input) & Node.DOCUMENT_POSITION_FOLLOWING)) return false;
      const mono = /mono|consolas|courier|menlo|code/i.test(getComputedStyle(el).fontFamily) ||
        el.matches('pre,code,[class*="font-mono"],[class*="monospace"]');
      return mono && box.width >= rect.width * 0.45 && box.bottom <= rect.top + 3;
    });
    candidates.sort((a, b) => b.getBoundingClientRect().bottom - a.getBoundingClientRect().bottom ||
      a.getBoundingClientRect().width - b.getBoundingClientRect().width);
    if (candidates.length) return candidates[0];
    for (let node = input, i = 0; node && node !== root && i < 4; node = node.parentElement, i++) {
      const previous = node.previousElementSibling;
      if (visible(previous) && text(previous) && text(previous).length <= 1000 &&
          !/code sprint|best combo|combo over/i.test(text(previous)) &&
          !previous.querySelector('input,textarea,button')) return previous;
    }
    return null;
  }
  function findPanel(input) {
    const known = document.getElementById('labStore');
    if (visible(known)) return known;
    const heading = label('labupgrades');
    for (let root = heading?.parentElement, i = 0; root && i < 7; root = root.parentElement, i++) {
      if (root === document.body || (input && root.contains(input))) break;
      if (/spend food bits/i.test(text(root)) && buttons(root).some(b => /\d/.test(text(b)))) return root;
    }
    return null;
  }
  function detect(now, force = false) {
    if (!force && now - state.lastScan < 300 && visible(state.controls.input) && visible(state.controls.prompt)) return state.controls;
    const input = findInput();
    const knownTap = document.getElementById('typeKey');
    state.controls = { input, prompt: findPrompt(input), tap: visible(knownTap) ? knownTap : exactButton('tap'), panel: findPanel(input) };
    state.lastScan = now;
    return state.controls;
  }
  const host = document.createElement('div');
  host.dataset.gachaMacro = 'true';
  host.style.cssText = 'position:fixed;left:12px;top:20px;z-index:2147483647;font:13px/1.45 Arial,sans-serif;width:min(420px,calc(100vw - 24px));';
  const ui = host.attachShadow({ mode: 'open' });
  const switchSetting = (key,title,help) => `<div class="setting"><label class="switch-row" for="opt-${key}"><span>${title}</span><input id="opt-${key}" type="checkbox" data-option="${key}" aria-describedby="help-${key}"></label><small id="help-${key}">${help}</small></div>`;
  const numberSetting = (key,title,help,min,max,step=1,scale=1) => `<div class="setting"><label class="number-row" for="opt-${key}"><span>${title}</span><input id="opt-${key}" type="number" data-option="${key}" data-scale="${scale}" min="${min}" max="${max}" step="${step}" aria-describedby="help-${key}"></label><small id="help-${key}">${help}</small></div>`;
  ui.innerHTML = `<style>
    *{box-sizing:border-box}section{background:#18162c;color:#f8f6ff;border:1px solid #9b7ae0;border-radius:14px;box-shadow:0 8px 30px #0007;overflow:hidden}
    header{padding:13px 15px 12px;background:#211c37;border-bottom:1px solid #413650}.title-row,.actions,.number-row,.switch-row{display:flex;align-items:center;justify-content:space-between;gap:10px}
    #dragHandle{display:block;flex:1;cursor:grab;user-select:none;touch-action:none;font-size:14px}#dragHandle.dragging{cursor:grabbing}
    #runBadge{font-size:11px;padding:3px 8px;border-radius:20px;background:#463c59;color:#e9e0f7}#runBadge.on{background:#174d40;color:#a4f5d4}
    #status{font-weight:bold;margin:10px 0 7px;overflow-wrap:anywhere}.actions{justify-content:flex-start}.actions button{flex:1}
    button,input,select{font:inherit}button{padding:7px 11px;border:1px solid #5a4d72;border-radius:7px;background:#332b49;color:#fff;cursor:pointer}button:hover{background:#46385f}#toggle{background:#9867ef;border-color:#b18aff;font-weight:bold;color:#fff}button:focus-visible,input:focus-visible,select:focus-visible,summary:focus-visible{outline:2px solid #d4b8ff;outline-offset:3px}
    small{display:block;color:#c9bddf;font-size:11px;line-height:1.5;margin:5px 0 0}.body{max-height:calc(100vh - 205px);overflow-y:auto;overscroll-behavior:contain;padding:0 15px 13px;scrollbar-width:thin;scrollbar-color:#66517e #211c37}
    #counts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin:12px 0}.stat{background:#251f38;border-radius:7px;padding:7px;color:#bfb1d8;font-size:10px}.stat strong{display:block;color:#fff;font-size:14px;font-variant-numeric:tabular-nums}
    #overview{font-size:11px;color:#d6cbeb;overflow-wrap:anywhere}#overview>div{margin:5px 0}#shippingStatus{color:#b8eaff}.hint{padding:8px 9px;background:#29223e;border-radius:7px;font-size:11px;color:#d5c6ec;line-height:1.5;margin-top:9px}
    #healthBox{padding:10px;border:1px solid #dd9c67;background:#422b29;border-radius:8px;margin-top:10px;color:#ffe0c4;font-size:12px}#healthBox strong{display:block}#healthBox p{margin:5px 0 7px}#healthBox[hidden],[hidden]{display:none!important}
    details{border:1px solid #4a3d60;border-radius:9px;margin-top:10px;background:#1e1930}summary{cursor:pointer;padding:10px 11px;font-weight:bold;color:#eee4ff}details>.group{padding:0 11px 10px}.setting{padding:8px 0;border-top:1px solid #393047}.setting:first-child{border-top:0}label{cursor:pointer}.switch-row span,.number-row span{font-weight:600;font-size:12px}.setting[data-disabled=true]{opacity:.58}.setting[data-disabled=true] label{cursor:default}
    input[type=checkbox]{appearance:none;flex:none;position:relative;width:34px;height:20px;border:1px solid #81728e;border-radius:20px;background:#51485e;cursor:pointer;margin:0}input[type=checkbox]::after{content:'';position:absolute;width:14px;height:14px;border-radius:50%;background:#eee8f6;left:2px;top:2px;transition:transform .12s}input[type=checkbox]:checked{background:#8b5be1;border-color:#b590fa}input[type=checkbox]:checked::after{transform:translateX(14px);background:#fff}
    input[type=number]{width:86px;flex:none}input[type=number],select{color:#fff;background:#2c243e;border:1px solid #746187;border-radius:6px;padding:6px;min-width:0}select{width:100%;margin-top:6px}input:disabled,select:disabled{cursor:default}#setupRow{display:flex;gap:7px;align-items:center}#setupRow select{flex:1;margin:0}#applySetup{flex:none}#setupDescription{min-height:32px}#saveState{text-align:center;color:#b9aace;margin-top:10px}.warning{color:#ffd19f}.help-list{padding-left:17px;margin:6px 0;font-size:12px;color:#ddd2ec}.help-list li{margin:8px 0}#compactNote{font-size:11px;color:#bcadd2}
    @media(prefers-reduced-motion:reduce){input[type=checkbox]::after{transition:none}}@media(max-height:520px){header{padding:8px 12px}.body{max-height:calc(100vh - 175px)}}
  </style><section aria-label="Gacha Lab automation controls"><header>
    <div class="title-row"><b id="dragHandle" title="Drag this title to move the panel">Gacha Lab Macro <span style="color:#bd9df5">v18</span></b><span id="runBadge">Paused</span></div>
    <div id="status" role="status" aria-live="polite">Paused — choose your settings, then Start</div>
    <div class="actions"><button id="toggle">Start</button><button id="compact" aria-expanded="true">Compact view</button><button id="close" title="Stop automation and remove this panel">Close</button></div>
    <small>F8 start / pause · F9 pause · Drag title to move</small>
  </header><div class="body">
    <div id="healthBox" role="alert" hidden><strong id="healthTitle"></strong><p id="healthDetail"></p><button id="checkHealth">Check numbers again</button></div>
    <div id="counts" aria-label="This session's activity"></div>
    <div id="overview"><div id="upgrade"></div><div id="breakthroughStatus"></div><div id="shippingStatus"></div></div>
    <small id="compactNote" hidden>Compact view. Select Show settings to change your options.</small>
    <div id="settings">
      <details><summary>Quick setup</summary><div class="group">
        <div id="setupRow"><select id="setup" aria-label="Choose a quick setup"><option value="">Choose a setup…</option><option value="farm">Farm without shipping</option><option value="ship">Fast generations · automatic resets</option><option value="tap">Only tap</option></select><button id="applySetup" disabled>Apply</button></div>
        <small id="setupDescription">Optional shortcuts. Applying one changes the activity and shipping switches below. It does not start a paused macro.</small>
      </div></details>
      <details open><summary>Activities <span id="activitiesSummary" style="color:#b69bd7;font-size:11px"></span></summary><div class="group">
        ${switchSetting('autoClick','Tap automatically','Presses Tap! continuously. The game may credit fewer taps than the macro sends; the counter shows attempts.')}
        ${switchSetting('autoType','Type Code Sprint','Types each displayed line and submits it. Timing adjusts when the game reports a speed warning.')}
        ${switchSetting('autoRepair','Repair broken pets','Opens Squash me!, completes the repair code, then returns to Sprint. Works even when Sprint typing is off. Repairs can interrupt a combo.')}
      </div></details>
      <details><summary>Upgrade purchases <span id="purchasesSummary" style="color:#b69bd7;font-size:11px"></span></summary><div class="group">
        ${switchSetting('autoLab','Buy Lab upgrades','Spends Food Bits on regular upgrades. Each purchase waits only for the game to confirm it.')}
        <div class="setting"><label for="opt-labBuyMode">What to buy</label><select id="opt-labBuyMode" data-option="labBuyMode" aria-describedby="help-labBuyMode"><option value="all">All affordable upgrades · fast bulk buying</option><option value="active">Best value for active farming</option></select><small id="help-labBuyMode"></small></div>
        ${switchSetting('autoBreakthrough','Buy useful Breakthroughs','Spends Transistors on permanent upgrades that improve the current setup. It may save for a better upgrade. It does not fill new pet or mentor slots for you.')}
        ${numberSetting('reserveTransistors','Keep this many Transistors','Reserved Transistors are not spent by automatic Breakthrough buying. 0 lets it use the full balance.',0,1000000000)}
        ${switchSetting('rebuildHelpers','Consider faster rebuilds','While auto-shipping, also values upgrades such as Cache Memory and Fab Plant for faster future generations. Requires both Breakthrough buying and auto-shipping.')}
        <small id="purchaseDependency"></small>
      </div></details>
      <details id="shippingGroup"><summary>Generation shipping <span id="shippingSummary" style="color:#b69bd7;font-size:11px"></span></summary><div class="group">
        ${switchSetting('autoShip','Ship generations automatically','Shipping resets Food Bits, most regular upgrade levels, and this run’s leaderboard score. Pets, cards, mentors, Transistors and Breakthroughs stay. Cache Memory can retain some regular levels.')}
        <div class="setting"><label for="opt-shipMode">When to ship</label><select id="opt-shipMode" data-option="shipMode" aria-describedby="help-shipMode"><option value="early">As soon as eligible · fastest resets</option><option value="percent">At a percentage of the Transistor cap</option></select><small id="help-shipMode"></small></div>
        <div id="percentRow">${numberSetting('shipPercent','Percentage of the cap','Example: 50% of a cap of 30 means at least 15 Transistors. Higher percentages can take much longer. If the cap exceeds the game’s number range, use earliest shipping instead.',1,100)}</div>
        ${numberSetting('minShipPayout','Minimum Transistors per shipment','An extra condition in either mode. Example: 20 means wait for at least 20 even in earliest mode. 0 adds no extra minimum.',0,1000000000)}
        ${switchSetting('spendBeforeShip','Spend extra Food Bits before shipping','OFF: stop buying as soon as the target is reached. ON: delay shipping until all affordable regular upgrades are bought, including offline upgrades. Some Bits may remain when nothing else is affordable.')}
        <div class="hint">Shipping requires upgrade spending. Auto-shipping may buy the upgrades needed to reach its target even when Buy Lab upgrades is off. A ready shipment takes priority over other purchases.</div>
        ${numberSetting('stopGeneration','Pause at generation','Optional stopping point for all automation while auto-shipping is on. 0 means no generation limit. Starting at or beyond this number stays paused. This does not guarantee the game will avoid number overflow before that point.',0,1000000)}
        <small id="shippingDependency"></small>
      </div></details>
      <details><summary>Typing and tapping speed</summary><div class="group">
        ${numberSetting('sprintMinMs','Minimum seconds per Sprint line','A minimum for the entire line, not a delay per character. Long lines and learned warning limits can take longer. Lower values may trigger speed warnings.',0.1,60,0.001,1000)}
        ${numberSetting('repairMinMs','Minimum seconds per repair line','Repairs have separate timing because the game can apply a different speed check. Lowering Sprint time does not change this value.',0.1,60,0.001,1000)}
        ${numberSetting('tapIntervalMs','Seconds between taps','0 sends taps at the fastest browser timer rate. 0.1 means at most 10 attempts per second. The game can still limit credited taps.',0,60,0.001,1000)}
        <div class="hint">Timing changes apply to the next line. No fixed pause between accepted code lines. A speed warning makes the macro wait and learn a slower timing. Purchases and submissions briefly wait for other game requests to finish.</div>
      </div></details>
      <details><summary>Help and game-number limits</summary><div class="group">
        ${switchSetting('ignoreInvalidNumbers','Ignore invalid numbers','OFF by default. ON skips automatic pauses for invalid balances/rates and predicted purchase or shipping overflow. It does not fix the game, restore zero rates, or bypass game buttons, payout requirements, your generation pause point, or request timeouts. If already paused, select Start to continue.')}
        <ul class="help-list">
        <li>Switches take effect immediately while running. Select Pause first if you want to change several settings before actions resume.</li>
        <li>Settings and learned typing delays stay in this browser after refresh. Session counters restart when the helper reloads.</li>
        <li>Pause stops new actions. A purchase or shipment already sent to the game can still finish. Close also removes this panel.</li>
        <li>Keep the game tab visible. Other game popups block automation; close them to continue.</li>
        <li>With Ignore invalid numbers off, the macro pauses if production or balances are invalid, or a proposed purchase or shipment would produce invalid rates. Ignoring these checks may allow the game’s number overflow to worsen.</li>
        <li>If Food Bits and rates show 0 despite huge pet output, pause, reduce the active pets or boosts, and check the numbers again. The game owner may need to repair the save.</li>
        <li>A huge shipping cap alone is allowed in earliest mode. Actual production and payouts must still be valid.</li>
      </ul></div></details>
      <small id="saveState" role="status">Changes save automatically. Leave a number field to apply its edit.</small>
    </div>
  </div></section>`;
  document.documentElement.append(host);
  const dragHandle = ui.getElementById('dragHandle');
  let drag = null;
  dragHandle.onpointerdown = event => {
    if (event.button !== 0) return;
    event.preventDefault(); event.stopPropagation();
    const rect = host.getBoundingClientRect();
    drag = { pointer: event.pointerId, x: event.clientX, y: event.clientY, left: rect.left, top: rect.top };
    dragHandle.setPointerCapture(event.pointerId); dragHandle.classList.add('dragging');
  };
  dragHandle.onpointermove = event => {
    if (!drag || event.pointerId !== drag.pointer) return;
    const rect = host.getBoundingClientRect();
    const width = document.documentElement.clientWidth || innerWidth;
    const height = document.documentElement.clientHeight || innerHeight;
    host.style.left = Math.max(0, Math.min(Math.max(0, width - rect.width), drag.left + event.clientX - drag.x)) + 'px';
    host.style.top = Math.max(0, Math.min(Math.max(0, height - rect.height), drag.top + event.clientY - drag.y)) + 'px';
  };
  const endDrag = event => {
    if (!drag || event.pointerId !== drag.pointer) return;
    drag = null; dragHandle.classList.remove('dragging');
    if (dragHandle.hasPointerCapture(event.pointerId)) dragHandle.releasePointerCapture(event.pointerId);
  };
  dragHandle.onpointerup = endDrag;
  dragHandle.onpointercancel = endDrag;
  dragHandle.onlostpointercapture = endDrag;
  const status = message => { ui.getElementById('status').textContent = message; };
  function updateOptionControls() {
    ui.getElementById('activitiesSummary').textContent = '· ' + ['autoClick','autoType','autoRepair'].filter(key => options[key]).length + ' on';
    ui.getElementById('purchasesSummary').textContent = '· ' + ['autoLab','autoBreakthrough'].filter(key => options[key]).length + ' on';
    ui.getElementById('shippingSummary').textContent = options.autoShip ? '· ON' : '· off';
    ui.getElementById('percentRow').hidden = options.shipMode !== 'percent';
    ui.getElementById('settings').hidden = options.panelCompact;
    ui.getElementById('compactNote').hidden = !options.panelCompact;
    ui.getElementById('compact').textContent = options.panelCompact ? 'Show settings' : 'Compact view';
    ui.getElementById('compact').setAttribute('aria-expanded',String(!options.panelCompact));
    for (const input of ui.querySelectorAll('[data-option]')) {
      const key = input.dataset.option;
      if (input.type === 'checkbox') {
        input.checked = options[key]; input.setAttribute('role','switch'); input.setAttribute('aria-checked',String(input.checked));
      } else input.value = input.tagName === 'SELECT' ? options[key] : options[key] / (Number(input.dataset.scale) || 1);
      if (['shipMode','minShipPayout','spendBeforeShip','stopGeneration'].includes(key)) input.disabled = !options.autoShip;
      if (key === 'shipPercent') input.disabled = !options.autoShip || options.shipMode !== 'percent';
      if (key === 'reserveTransistors') input.disabled = !options.autoBreakthrough;
      if (key === 'rebuildHelpers') input.disabled = !options.autoBreakthrough || !options.autoShip;
      if (key === 'labBuyMode') input.disabled = !options.autoLab;
      if (key === 'sprintMinMs') input.disabled = !options.autoType;
      if (key === 'repairMinMs') input.disabled = !options.autoRepair;
      if (key === 'tapIntervalMs') input.disabled = !options.autoClick;
      const row = input.closest('.setting'); if (row) row.dataset.disabled = String(input.disabled);
    }
    ui.getElementById('help-labBuyMode').textContent = !options.autoLab ? 'Enable Buy Lab upgrades to use this setting.' : options.labBuyMode === 'all' ?
      'Buys every affordable unlocked level, including offline upgrades. Starts with the largest affordable purchase and continues after each game response.' :
      'Chooses estimated active income gained per Food Bit. Skips offline-only upgrades and may save briefly for a better purchase. Estimates assume a maintained Sprint combo and credited taps when those activities are on.';
    ui.getElementById('help-shipMode').textContent = options.shipMode === 'early' ?
      'Ships when the game unlocks a payout and your optional minimum is met. With extra spending off, stops buying at that point.' :
      'Waits for your percentage target and the optional minimum. Both conditions must be met.';
    ui.getElementById('purchaseDependency').textContent = !options.autoBreakthrough ? 'Enable Buy useful Breakthroughs to set a reserve or consider rebuilds.' :
      !options.autoShip ? 'Consider faster rebuilds is available when auto-shipping is on.' : '';
    ui.getElementById('shippingDependency').textContent = options.autoShip ?
      'Automatic resets are ON. Check the target and pause point before starting.' : 'Auto-shipping is OFF. Enable it to use these settings. Other selected activities can still run.';
  }
  function optionsChanged() {
    if ((!options.autoType && state.mode === 'sprint') || (!options.autoRepair && state.mode === 'repair')) { state.generation++; resetLine(performance.now()); }
    if (!options.autoShip && state.pending?.kind !== 'ship') state.shipping = null;
    state.lastManage = -Infinity; state.lastPaint = -Infinity; state.healthAt = -Infinity;
    if (options.ignoreInvalidNumbers || ui.getElementById('healthTitle').textContent === 'Invalid-number pauses are OFF') {
      const now = performance.now(), issue = gameNumberIssue(getGame(now),now);
      showHealth(issue,issue ? 'Number checks are enabled again. Select Start only after correcting the game numbers.' : '');
    }
    try { localStorage.setItem(optionsKey,JSON.stringify(options)); ui.getElementById('saveState').textContent = 'Settings saved. Leave a number field to apply its edit.'; }
    catch { ui.getElementById('saveState').textContent = 'Settings apply now, but this browser could not save them for next time.'; }
    updateOptionControls();
    if (!state.running) paint(performance.now());
  }
  for (const input of ui.querySelectorAll('[data-option]')) input.onchange = () => {
    const key = input.dataset.option;
    if (input.type === 'checkbox') options[key] = input.checked;
    else if (input.tagName === 'SELECT') options[key] = input.value;
    else {
      if (input.value.trim() === '') { updateOptionControls(); return; }
      const value = Number(input.value), scale = Number(input.dataset.scale) || 1;
      if (!Number.isFinite(value)) { updateOptionControls(); return; }
      options[key] = Math.round(Math.max(Number(input.min),Math.min(Number(input.max),value)) * scale);
    }
    optionsChanged();
  };
  ui.getElementById('compact').onclick = () => { options.panelCompact = !options.panelCompact; optionsChanged(); ui.querySelector('.body').scrollTop = 0; };
  const setups = {
    farm: { values:{autoClick:true,autoType:true,autoRepair:true,autoLab:true,autoBreakthrough:true,autoShip:false,labBuyMode:'active'},
      help:'Turns on tapping, Sprint, repairs and useful purchases. Selects active-value Lab buying and turns OFF shipping. Keeps your timing, reserve and pause point.' },
    ship: { values:{autoClick:true,autoType:true,autoRepair:true,autoLab:true,autoBreakthrough:true,autoShip:true,shipMode:'early',minShipPayout:0,spendBeforeShip:false,labBuyMode:'all'},
      help:'Enables automatic resets as soon as eligible, with no extra minimum or balance spending. Turns on all activities and purchases. Keeps your timing, reserve and generation pause point.' },
    tap: { values:{autoClick:true,autoType:false,autoRepair:false,autoLab:false,autoBreakthrough:false,autoShip:false},
      help:'Only presses Tap!. Turns OFF typing, repairs, both purchase types and shipping. Keeps your tap speed.' }
  };
  ui.getElementById('setup').onchange = event => {
    const setup = setups[event.target.value]; ui.getElementById('applySetup').disabled = !setup;
    ui.getElementById('setupDescription').textContent = setup?.help || 'Choose a setup to see what Apply will change. Applying it does not start a paused macro.';
  };
  ui.getElementById('applySetup').onclick = () => {
    const setup = setups[ui.getElementById('setup').value]; if (!setup) return;
    Object.assign(options,setup.values); optionsChanged();
    ui.getElementById('setupDescription').textContent = 'Applied. ' + (state.running ? 'The running macro now uses these options.' : 'Review the switches below, then select Start.');
  };
  ui.getElementById('checkHealth').onclick = () => {
    state.healthAt = -Infinity; const now = performance.now(), game = getGame(now);
    if (!game) { status('Open The Lab so the game’s numbers can be checked.'); return; }
    const issue = gameNumberIssue(game,now);
    showHealth(issue,issue ? 'Reduce active pets or boosts and try again. An already damaged save may need the game owner to repair it.' : '');
    if (!issue) status(options.ignoreInvalidNumbers ? 'Current numbers look valid. Invalid-number pauses remain off.' :
      state.running ? 'Current numbers look valid; automation is running.' : 'Current numbers look valid. Proposed actions are checked separately. Select Start when ready.');
  };
  updateOptionControls();
  ui.getElementById('shippingGroup').open = options.autoShip;
  function stop(message = 'Paused') {
    state.running = false; state.generation++; state.phase = 'idle'; clearInterval(state.timer); state.timer = 0;
    ui.getElementById('runBadge').textContent = 'Paused'; ui.getElementById('runBadge').classList.remove('on');
    ui.getElementById('toggle').textContent = 'Start'; status(message);
  }
  function start() {
    if (state.running) return;
    state.running = true; state.generation++; state.phase = 'idle'; state.due = performance.now();
    state.healthAt = -Infinity;
    showHealth('');
    state.mode = 'sprint'; state.repairPending = null; state.lastRepairScan = -Infinity;
    state.repairInput = null; state.repairReadyAt = 0;
    state.lastScan = -Infinity;
    ui.getElementById('toggle').textContent = 'Pause';
    ui.getElementById('runBadge').textContent = 'Running'; ui.getElementById('runBadge').classList.add('on');
    state.timer = setInterval(tick, 4); tick();
  }
  function toggle() { state.running ? stop() : start(); }
  function setInput(input, value, char = null) {
    const proto = input instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(input, value);
    input.dispatchEvent(new InputEvent('input', { bubbles: true,
      inputType: char === null ? 'deleteContentBackward' : 'insertText', data: char }));
  }
  function enter(input) {
    input.dispatchEvent(new Event('change', { bubbles: true }));
    for (const type of ['keydown', 'keypress', 'keyup']) input.dispatchEvent(new KeyboardEvent(type,
      { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, charCode: type === 'keypress' ? 13 : 0,
        bubbles: true, cancelable: true }));
    state.submissions++;
  }
  function resetLine(now) { state.phase = 'idle'; state.input = null; state.busySince = 0; state.due = now + config.betweenLinesMs; }
  function handleWarning(message, now) {
    if (state.cooldownUntil) {
      if (now < state.cooldownUntil || message) {
        if (now > state.warningDeadline) stop('The game still shows its speed warning. Paused.');
        else status('Waiting for the game cooldown and speed warning to clear');
        return true;
      }
      state.cooldownUntil = 0; state.generation++; resetLine(now);
      return false;
    }
    if (!message) return false;
    if (!/too fast|slow down|rate limit/i.test(message)) { stop('Game message: ' + message); return true; }
    if (state.rateFailures[state.mode] >= config.maxRateRetries) {
      stop('Repeated speed warnings. Paused after two slower retries.'); return true;
    }
    state.rateFailures[state.mode]++;
    const attempt = state.lastAttempt?.mode === state.mode ? state.lastAttempt :
      { bucket: state.lineBucket, elapsed: state.lineDurationMs, length: state.chars.length };
    const previous = learnedTiming[state.mode][attempt.bucket] || 0;
    learnedTiming[state.mode][attempt.bucket] = Math.min(15000,
      Math.ceil(Math.max(previous, attempt.elapsed, state.lineDurationMs) * 1.25 + 150));
    if (state.mode === 'repair' && attempt.length * config.repairMsPerChar + config.repairMarginMs <=
        Math.max(options.repairMinMs, learnedTiming.repairMinimum)) {
      /* A floor-limited repair warning applies to other short repairs, too. */
      learnedTiming.repairMinimum = Math.max(learnedTiming.repairMinimum, learnedTiming.repair[attempt.bucket]);
    }
    try { localStorage.setItem(timingKey, JSON.stringify(learnedTiming)); } catch { /* Keep session learning. */ }
    state.generation++; resetLine(now);
    state.cooldownUntil = now + config.rateCooldownMs;
    state.warningDeadline = state.cooldownUntil + 15000;
    status('Game asked to slow down. Cooling down before a slower retry.');
    return true;
  }
  function typeLine(input, prompt, now) {
    const code = (prompt.textContent || '').trim();
    if (!code || code.length > 1000 || !enabled(input)) return;
    /* The saved game auto-submits on input and marks the field read-only during the request. */
    if (input.readOnly) {
      if (!state.busySince) state.busySince = now;
      if (now - state.busySince > 15000) stop('The game is still processing this line. Paused.');
      return;
    }
    state.busySince = 0;
    if (state.phase === 'awaiting') {
      if (code !== state.code || input.value === '') { state.rateFailures[state.mode] = 0; resetLine(now); }
      else {
        if (now >= state.due) stop('The line was not accepted. Paused; no repeated Enter attempts.');
        return;
      }
    }
    if (now < state.due) return;
    if (state.phase === 'idle') {
      state.input = input; state.code = code; state.chars = Array.from(code); state.index = 0;
      state.lastAttempt = null;
      state.phase = 'typing';
      input.focus({ preventScroll: true }); setInput(input, '');
      /* Start after clearing/rendering, not from the earlier scan's timestamp. */
      state.started = performance.now();
      state.lineBucket = String(Math.ceil(state.chars.length / 8));
      const repairing = state.mode === 'repair';
      state.lineDurationMs = Math.max(repairing ? Math.max(options.repairMinMs, learnedTiming.repairMinimum) : options.sprintMinMs,
        state.chars.length * (repairing ? config.repairMsPerChar : config.referenceMsPerChar) +
          (repairing ? config.repairMarginMs : config.timingMarginMs),
        learnedTiming[state.mode][state.lineBucket] || 0);
      state.charIntervalMs = state.lineDurationMs / Math.max(1, state.chars.length - 1);
      state.completeAfter = state.started + state.lineDurationMs;
      state.due = state.chars.length > 1 ? state.started : state.completeAfter; return;
    }
    if (input !== state.input || code !== state.code) { resetLine(now); return; }
    if (state.phase === 'typing') {
      const previous = state.chars.slice(0, state.index).join('');
      if (input.value !== previous) { resetLine(now); return; }
      if (state.index === state.chars.length - 1 && (state.pending || nativeBusy())) { state.due = now + 20; return; }
      if (state.index === 0 && state.chars.length > 1) {
        /* Anchor the total line duration to actual first input. */
        state.started = performance.now(); state.completeAfter = state.started + state.lineDurationMs;
      }
      /* Completion auto-submits in this game: hold the final character, not Enter. */
      if (state.index === state.chars.length - 1 && now < state.completeAfter) {
        state.due = state.completeAfter; return;
      }
      input.focus({ preventScroll: true });
      const char = state.chars[state.index++];
      setInput(input, previous + char, char);
      if (state.index === state.chars.length) {
        state.lastAttempt = { mode: state.mode, bucket: state.lineBucket,
          elapsed: performance.now() - state.started, length: state.chars.length };
        if (state.mode === 'repair') state.repairLines++;
        if (input.readOnly) {
          state.submissions++; state.phase = 'awaiting'; state.due = now + config.acceptanceMs; return;
        }
        if (!input.isConnected) { resetLine(now); return; }
        /* Wait only for the page to commit its input state before Enter. */
        state.phase = 'committing';
        state.due = Math.max(now + config.beforeEnterMs, state.completeAfter);
        const generation = state.generation;
        requestAnimationFrame(() => requestAnimationFrame(() => {
          if (state.running && generation === state.generation && state.phase === 'committing') state.phase = 'enter';
        }));
      } else {
        /* If rendering stalls, extend this line instead of catching up in a burst. */
        state.due = performance.now() + state.charIntervalMs;
      }
      return;
    }
    if (state.phase === 'enter') {
      if (state.pending || nativeBusy()) { state.due = now + 20; return; }
      if (input.value !== state.code) { resetLine(now); return; }
      enter(input); state.phase = 'awaiting'; state.due = now + config.acceptanceMs;
    }
  }
  function changeMode(mode, now) {
    if (state.mode === mode) return;
    if (state.mode === 'repair' && state.index === state.chars.length && state.index > 0) state.rateFailures.repair = 0;
    state.generation++; state.mode = mode; resetLine(now); state.lastScan = -Infinity;
  }
  function handleRepairs(now) {
    const input = document.getElementById('bugInput');
    if (visible(input)) {
      state.repairPending = null; changeMode('repair', now);
      if (state.repairInput !== input) {
        state.repairInput = input; state.repairReadyAt = now + config.repairFocusMs;
        if (!input.readOnly) input.focus({ preventScroll: true });
      }
      if (now < state.repairReadyAt) { status('Letting the repair popup focus settle'); return true; }
      const prompt = document.getElementById('bugPrompt');
      if (visible(prompt)) typeLine(input, prompt, now);
      if (state.running) status(input.readOnly ? 'Waiting for the pet repair to finish' :
        state.phase === 'typing' && state.index === state.chars.length - 1 && now < state.completeAfter ?
          'Repair: allowing enough total typing time before completion' :
          'Repairing pet: ' + state.index + '/' + state.chars.length +
            ' · target ' + (state.lineDurationMs / 1000).toFixed(2) + 's');
      return true;
    }
    state.repairInput = null; state.repairReadyAt = 0;
    changeMode('sprint', now);
    if (state.repairPending) {
      if (!visible(state.repairPending.button)) state.repairPending = null;
      else {
        if (now - state.repairPending.at > 15000) stop('Pet repair did not open or finish. Paused.');
        else status('Waiting for the pet repair to open or finish');
        return true;
      }
    }
    /* Do not click through unrelated game dialogs. */
    if (all('.modal,[role="dialog"],dialog[open]').some(visible)) {
      status('Waiting for the open game popup to close'); return true;
    }
    if (document.getElementById('spInput')?.readOnly) return false;
    if (now - state.lastRepairScan < 150) return false;
    state.lastRepairScan = now;
    const button = all('#desks [data-bug],button.desk-bug,[data-bug]').find(el => visible(el) && enabled(el)) ||
      exactButton('squashme') || exactButton('clicktosquash');
    if (!button || !enabled(button)) return false;
    state.generation++; resetLine(now);
    state.repairPending = { button, at: now };
    button.click(); status('Opening pet repair'); return true;
  }
  function tapControl(button) {
    const rect = button.getBoundingClientRect();
    const options = { bubbles: true, cancelable: true, pointerId: 1, pointerType: 'mouse',
      isPrimary: true, button: 0, clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2 };
    button.dispatchEvent(new PointerEvent('pointerdown', { ...options, buttons: 1 }));
    button.dispatchEvent(new PointerEvent('pointerup', { ...options, buttons: 0 }));
    button.click();
  }
  function chooseActiveUpgrade(panel, game) {
    if (!game?.lab || !game.inventory || !game.settings?.UPGRADES || typeof game.model !== 'function') {
      return { buy: null, note: 'Waiting for current Lab upgrade stats' };
    }
    const income = stats => activeIncome(stats, game);
    const baseline = income(game.model(game.lab, game.inventory, game.context));
    if (!Number.isFinite(baseline) || baseline < 0) return { buy: null, note: 'Waiting for income stats' };
    const choices = [];
    for (const button of all('button[data-up][data-cost]', panel)) {
      const id = button.dataset.up, cost = Number(button.dataset.cost);
      if (!visible(button) || !regularUpgradeIds.has(id) || offlineUpgradeIds.has(id) ||
          button.dataset.max === '1' || !Number.isFinite(cost) || cost <= 0) continue;
      const definition = game.settings.UPGRADES.find(upgrade => upgrade.id === id);
      const level = Number(game.lab.lv?.[id] || 0);
      if (!definition || !Number.isInteger(level) || level < 0 || level >= definition.max ||
          cost !== Math.round(definition.cost * Math.pow(definition.grow, level))) continue;
      /* Copy the candidate level; never alter the game's actual Lab or inventory. */
      const trial = { ...game.lab, lv: { ...game.lab.lv, [id]: level + 1 } };
      const gain = income(game.model(trial, game.inventory, game.context)) - baseline;
      if (!Number.isFinite(gain) || gain <= Math.max(1e-9, baseline * 1e-12)) continue;
      choices.push({ button, cost, score: gain / cost, name: definition.name });
    }
    choices.sort((a, b) => b.score - a.score || a.cost - b.cost);
    if (!choices.length) return { buy: null, note: 'No useful active upgrade available' };
    const bank = Math.max(0, Number(game.lab.bits) || 0);
    const best = choices[0], affordable = choices.find(choice => enabled(choice.button) && choice.cost <= bank);
    if (enabled(best.button) && best.cost <= bank) return { buy: best.button, note: 'Best active value: ' + best.name };
    const wait = baseline > 0 ? Math.max(0, best.cost - bank) / baseline : Infinity;
    if (!affordable || wait <= config.maxUpgradeSaveSeconds) {
      return { buy: null, note: 'Saving for ' + best.name };
    }
    return { buy: affordable.button, note: 'Best affordable active value: ' + affordable.name };
  }
  function getGame(now) {
    let game;
    try { game = readGame(); } catch { return null; }
    if (!game?.lab) return null;
    if (state.observedLab !== game.lab || state.observedBits !== game.lab.bits) {
      state.observedLab = game.lab; state.observedBits = game.lab.bits; state.observedAt = now;
    }
    const received = Number(game.receivedAt);
    game.stamp = game.receivedAt !== null && Number.isFinite(received) && received >= 0 && received <= now ? received : state.observedAt;
    /* The published stats can contain leaderboard position even when lab.ahead is omitted. */
    game.lab = { ...game.lab, ahead: game.lab.ahead ?? game.lab.stats?.ahead ?? 0 };
    return game;
  }
  function nativeBusy() { try { return !!readGame()?.networkBusy; } catch { return false; } }
  function rateIssue(stats, lab, elapsedMs = 0) {
    if (!stats) return '';
    for (const key of ['total','tap','autoRate','mult','moore']) {
      if (key in stats && (typeof stats[key] !== 'number' || !Number.isFinite(stats[key]))) return 'The game’s production or tap rate is invalid or too large.';
    }
    const total = Number(stats.total) || 0, auto = Number(stats.autoRate) || 0;
    const sprint = lab.sprint || {}, multiplier = Number(sprint.left) > elapsedMs ? Math.max(1,Number(sprint.mult) || 1) : 1;
    if (!Number.isFinite(total + auto) || !Number.isFinite(total * multiplier + auto)) return 'Combined production exceeds the game’s number range.';
    return '';
  }
  function gameNumberIssue(game, now) {
    if (!game?.lab) return '';
    if (state.healthKey === state.observedLab && now - state.healthAt < 500) return state.healthIssue;
    state.healthKey = state.observedLab; state.healthAt = now;
    let issue = '';
    for (const key of ['bits','made','spent']) {
      if (key in game.lab && (typeof game.lab[key] !== 'number' || !Number.isFinite(game.lab[key]))) { issue = 'The game returned an invalid Food Bit balance or spending total.'; break; }
    }
    const pp = game.lab.pp;
    if (!issue && pp && (typeof pp.gen !== 'number' || !Number.isSafeInteger(pp.gen) || pp.gen < 0)) issue = 'The game returned an invalid generation number.';
    if (!issue && pp && 'transistors' in pp && (typeof pp.transistors !== 'number' || !Number.isFinite(pp.transistors))) issue = 'The game returned an invalid Transistor balance.';
    const elapsed = Math.max(0,now - game.stamp);
    if (!issue) issue = rateIssue(game.lab.stats,game.lab,elapsed);
    if (!issue && typeof game.model === 'function') {
      try { issue = rateIssue(gameStats(game),game.lab,elapsed); }
      catch { issue = 'Current game rates could not be checked. Refresh the game and reopen The Lab.'; }
    }
    state.healthIssue = issue; return issue;
  }
  function showHealth(issue, detail = '') {
    state.healthDetail = detail;
    const ignored = options.ignoreInvalidNumbers, box = ui.getElementById('healthBox'); box.hidden = !issue && !ignored;
    ui.getElementById('healthTitle').textContent = ignored ? 'Invalid-number pauses are OFF' : issue ? 'Automation needs attention' : '';
    ui.getElementById('healthDetail').textContent = ignored ? (issue ? issue + ' ' : '') +
      'Ignore invalid numbers is on. Automation can continue despite broken numbers; the game may still reject actions or show zero income. This does not repair the save.' : issue ? issue + ' ' + detail : '';
  }
  function blockInvalidProposal(game, lab, action) {
    if (options.ignoreInvalidNumbers) return false;
    if (typeof game.model !== 'function') return false;
    let issue;
    try { issue = rateIssue(gameStats(game,lab),lab,Math.max(0,performance.now() - game.stamp)); }
    catch { issue = 'The resulting game rates could not be checked.'; }
    if (!issue) return false;
    showHealth(action + ' would produce invalid game rates.','Paused before sending it. Reduce pets or boosts, then check the numbers again. The macro cannot repair the game’s arithmetic.');
    stop('Paused before ' + action.toLowerCase() + ': game-number limit'); return true;
  }
  function activeIncome(stats, game) {
    const taps = options.autoClick ? Math.max(0, Math.min(config.activeTapEstimate,game.settings.MAX_TAPS_PER_SEC || 15)) : 0;
    const sprint = options.autoType ? Math.max(1,Math.min(config.activeSprintEstimate,game.settings.SPRINT_MAX_MULT || 10)) : 1;
    return stats.total * sprint + stats.tap * taps + (stats.autoRate || 0);
  }
  function gameStats(game, lab = game.lab) { return game.model(lab,game.inventory,game.context); }
  function payoutInfo(game, bank = 0) {
    if (!game?.payout || !game.lab.pp) return null;
    const value = game.payout(game.settings,Math.max(0,Number(game.lab.spent) || 0) + Math.max(0,bank),game.lab.pp);
    /* At generation 1743 the native cap becomes +Infinity, while actual spending
       and payout can remain finite. An earliest shipment does not need that cap. */
    if (!value || !Number.isFinite(value.pay) || value.pay < 0 || !(value.cap >= 1)) return null;
    const capOverflow = value.cap === Infinity;
    /* Multiply by the fraction first to avoid overflowing an otherwise finite cap. */
    const target = Math.max(1,options.minShipPayout,options.shipMode === 'percent' ? Math.ceil(value.cap * (options.shipPercent / 100)) : 1);
    return { ...value, target, capOverflow, eligible: Number.isFinite(target) && value.pay >= target };
  }
  function estimatedBank(game, now) {
    const stats = game.lab.stats || gameStats(game), seconds = Math.max(0,(now - game.stamp) / 1000);
    const sp = game.lab.sprint || {}, boost = Math.min(seconds,Math.max(0,Number(sp.left) || 0) / 1000);
    return Math.max(0,Number(game.lab.bits) || 0) + stats.total * seconds +
      stats.total * (Math.max(1,Number(sp.mult) || 1) - 1) * boost + (stats.autoRate || 0) * seconds;
  }
  function ensureStore(tab, now) {
    const store = document.getElementById('labStore');
    if (!visible(store)) {
      const open = document.getElementById('storeBtn');
      if (visible(open) && enabled(open)) { open.click(); state.lastScan = -Infinity; }
      else state.manageNote = 'Open The Lab to continue';
      return null;
    }
    const button = store.querySelector('button[data-ltab="' + tab + '"]');
    if (button && button.getAttribute('aria-pressed') !== 'true') {
      if (visible(button) && enabled(button)) button.click();
      state.lastScan = -Infinity;
      if (store.querySelector('button[data-ltab="' + tab + '"]')?.getAttribute('aria-pressed') !== 'true') return null;
    }
    return store;
  }
  function regularCandidates(game, store) {
    return all('button[data-up][data-cost]',store).map(button => {
      const id = button.dataset.up, cost = Number(button.dataset.cost);
      const definition = game.settings.UPGRADES.find(upgrade => upgrade.id === id);
      const level = Number(game.lab.lv?.[id] || 0);
      if (!visible(button) || !regularUpgradeIds.has(id) || !definition || button.dataset.max === '1' ||
          !Number.isInteger(level) || level < 0 || level >= definition.max || !Number.isFinite(cost) || cost <= 0 ||
          cost !== Math.round(definition.cost * Math.pow(definition.grow,level))) return null;
      return { button,id,cost,level,name:definition.name };
    }).filter(Boolean);
  }
  function startPurchase(kind, choice, game, now) {
    if (state.pending || !enabled(choice.button)) return false;
    const trial = kind === 'lab' ? { ...game.lab,lv:{ ...game.lab.lv,[choice.id]:choice.level + 1 } } :
      { ...game.lab,pp:{ ...game.lab.pp,transistors:Number(game.lab.pp.transistors) - choice.cost,lv:{ ...game.lab.pp.lv,[choice.id]:choice.level + 1 } } };
    if (blockInvalidProposal(game,trial,'Buying ' + choice.name)) return false;
    state.pending = { kind,id:choice.id,level:choice.level,gen:game.lab.pp?.gen || 0,at:now };
    state.manageNote = 'Buying ' + choice.name;
    if (state.shipping) state.shipping.finalSynced = false;
    choice.button.click(); return true;
  }
  function requestSync(game, now, final = false) {
    if (!game.sync) {
      if (now - game.stamp <= 1500) { if (final && state.shipping) state.shipping.finalSynced = true; return false; }
      state.manageNote = 'Waiting for the game balance to update'; return false;
    }
    const ticket = { kind:'sync',at:now,gen:game.lab.pp?.gen || 0,stamp:game.stamp,done:false,final };
    state.pending = ticket; state.manageNote = 'Refreshing the Food Bit balance';
    try {
      Promise.resolve(game.sync()).then(() => { ticket.done = true; }).catch(error => {
        if (state.pending === ticket) { state.pending = null; stop('Balance refresh failed: ' + error.message); }
      });
    } catch (error) { state.pending = null; stop('Balance refresh failed: ' + error.message); }
    return true;
  }
  function pollPending(game, now) {
    const pending = state.pending;
    if (!pending) return false;
    if (!game) { if (now - pending.at > 15000) stop('Waiting for game data after the last action. Paused.'); return true; }
    const gen = game.lab.pp?.gen || 0;
    let done = false;
    if (pending.kind === 'ship') done = gen > pending.gen;
    else if (gen !== pending.gen) done = true;
    else if (pending.kind === 'lab') done = Number(game.lab.lv?.[pending.id] || 0) > pending.level;
    else if (pending.kind === 'breakthrough') done = Number(game.lab.pp?.lv?.[pending.id] || 0) > pending.level;
    else if (pending.kind === 'sync') done = pending.done && (game.stamp > pending.stamp || now - game.stamp <= 1500);
    if (done) {
      if (pending.kind === 'lab') state.attempts++;
      if (pending.kind === 'breakthrough') state.breakthroughBuys++;
      if (pending.kind === 'ship') {
        state.ships++; state.shipping = null; state.generation++; resetLine(now);
        state.repairInput = null; state.repairPending = null; state.lastScan = -Infinity;
        state.manageNote = 'New generation ready; resuming farming';
      }
      if (pending.kind === 'sync' && pending.final && state.shipping) state.shipping.finalSynced = true;
      if (gen !== pending.gen && pending.kind !== 'ship') { state.shipping = null; state.generation++; resetLine(now); }
      /* A confirmed response unlocks the next action immediately, without an idle scan delay. */
      state.pending = null; state.lastManage = -Infinity; return false;
    }
    if (now - pending.at > 15000) {
      stop(pending.kind === 'ship' ? 'Shipping was not confirmed. Check the game before restarting.' :
        'The game has not confirmed the last action. Paused.');
    }
    return true;
  }
  function rebuildLab(lab, pp) {
    const keep = pp.lv?.cache || 0, levels = {};
    for (const [id,level] of Object.entries(lab.lv || {})) if (id !== 'trophy' && level > 0 && keep > 0) levels[id] = Math.min(level,keep);
    return { ...lab,lv:levels,pp,bug:null };
  }
  function chooseBreakthrough(game) {
    const definitions = game.settings.BREAKTHROUGHS;
    if (!definitions || !game.lab.pp) return { choice:null,note:'Waiting for Breakthrough stats' };
    const pp = game.lab.pp, balance = Math.max(0,Number(pp.transistors) || 0), budget = Math.max(0,balance - options.reserveTransistors);
    const base = activeIncome(gameStats(game),game);
    if (!(base > 0)) return { choice:null,note:'Waiting for production stats' };
    const helpers = options.autoShip && options.rebuildHelpers;
    const rebuildBase = helpers ? activeIncome(gameStats(game,rebuildLab(game.lab,pp)),game) : 0;
    const choices = [];
    for (const definition of definitions) {
      if (!breakthroughIds.has(definition.id) || ['neural','lowpower','museum','firewall'].includes(definition.id)) continue;
      if (['cache','fab'].includes(definition.id) && !helpers) continue;
      const level = Number(pp.lv?.[definition.id] || 0);
      if (!Number.isInteger(level) || level < 0 || level >= definition.max) continue;
      const cost = Math.round(definition.cost * Math.pow(definition.grow,level));
      if (!(cost > 0)) continue;
      const trialPp = { ...pp,transistors:Math.max(0,balance - cost),lv:{ ...pp.lv,[definition.id]:level + 1 } };
      const trial = { ...game.lab,pp:trialPp };
      const currentGain = activeIncome(gameStats(game,trial),game) / base - 1;
      const rebuildGain = helpers && rebuildBase > 0 ? activeIncome(gameStats(game,rebuildLab(game.lab,trialPp)),game) / rebuildBase - 1 : currentGain;
      let benefit = helpers ? currentGain * 0.65 + rebuildGain * 0.35 : currentGain;
      if (definition.id === 'fab') {
        const oldMinimum = 1 - 0.1 * level, newMinimum = 1 - 0.1 * (level + 1);
        benefit += 0.5 * (oldMinimum / newMinimum - 1);
      }
      if (!Number.isFinite(benefit) || benefit <= 1e-10) continue;
      choices.push({ id:definition.id,level,cost,name:definition.name,score:benefit / cost });
    }
    choices.sort((a,b) => b.score - a.score || a.cost - b.cost);
    const best = choices[0], affordable = choices.find(choice => choice.cost <= budget);
    if (!best) return { choice:null,note:'No useful Breakthrough for the current setup' };
    if (!affordable || (best.cost > budget && affordable.score < best.score * 0.7)) {
      return { choice:null,note:'Saving Transistors for ' + best.name };
    }
    return { choice:affordable,note:'Best Breakthrough value: ' + affordable.name };
  }
  function shipDialog() {
    const cancel = document.getElementById('shipNo');
    if (!visible(cancel)) return null;
    const root = cancel.closest('.modal,[role="dialog"],dialog') || cancel.closest('.modal-card');
    const confirm = root?.querySelector('#shipYes'), title = text(root?.querySelector('h2,[role="heading"]'));
    const generation = title.match(/ship\s+generation\s+(\d+)\s*\?/i);
    return confirm && generation ? { cancel,confirm,generation:Number(generation[1]) } : null;
  }
  function affordableDrain(game, store) {
    return regularCandidates(game,store).filter(choice => enabled(choice.button) && choice.cost <= Number(game.lab.bits) + 1e-6)
      .sort((a,b) => b.cost - a.cost)[0] || null;
  }
  function abortShipping(now, message) {
    const dialog = shipDialog(); if (dialog && enabled(dialog.cancel)) dialog.cancel.click();
    state.shipping = null; state.shipRetryAt = now + 2000; state.manageNote = message; state.lastScan = -Infinity;
  }
  function manageShipping(game, now) {
    const shipping = state.shipping;
    if (!shipping || state.pending) return;
    if (!options.autoShip) { abortShipping(now,'Auto-shipping disabled'); return; }
    if ((game.lab.pp?.gen || 0) !== shipping.gen) { state.shipping = null; state.generation++; resetLine(now); return; }
    if (game.networkBusy) { state.manageNote = 'Waiting for the current game action before shipping'; return; }
    /* Eligibility is checked after every confirmed purchase, even if a spend-down was already running. */
    if (shipping.stage === 'drain' && !options.spendBeforeShip && payoutInfo(game)?.eligible) shipping.stage = 'open';
    if (shipping.stage === 'drain') {
      state.manageNote = options.spendBeforeShip ? 'Spending remaining Food Bits before shipping' : 'Buying enough upgrades to reach the shipping target';
      const store = ensureStore('up',now); if (!store) return;
      if (now - game.stamp > 1500) { requestSync(game,now); return; }
      const choice = affordableDrain(game,store);
      if (choice) { startPurchase('lab',choice,game,now); return; }
      if (!shipping.finalSynced) {
        if (requestSync(game,now,true) || !shipping.finalSynced) return;
      }
      const payout = payoutInfo(game);
      if (!payout?.eligible) { abortShipping(now,'More upgrade spending is needed; continuing farming'); return; }
      shipping.stage = 'open';
      state.manageNote = 'Balance spent; preparing to ship'; return;
    }
    if (shipping.stage === 'open') {
      const store = ensureStore('bt',now); if (!store) return;
      const button = store.querySelector('#shipBtn'), payout = payoutInfo(game);
      if (!payout?.eligible) { abortShipping(now,'Shipping target changed; continuing farming'); return; }
      if (visible(button) && enabled(button)) { shipping.stage = 'confirm'; button.click(); state.manageNote = 'Checking the shipping confirmation'; }
      return;
    }
    const dialog = shipDialog();
    if (!dialog) { shipping.stage = 'open'; return; }
    if (dialog.generation !== shipping.gen + 1 || !payoutInfo(game)?.eligible) { abortShipping(now,'Shipping target is not ready'); return; }
    if (now - game.stamp > 1500) { requestSync(game,now,true); return; }
    const store = document.getElementById('labStore');
    if (options.spendBeforeShip && store && affordableDrain(game,store)) { dialog.cancel.click(); shipping.stage = 'drain'; shipping.finalSynced = false; return; }
    if (options.autoShip && enabled(dialog.confirm)) {
      const trial = { ...rebuildLab(game.lab,{ ...game.lab.pp,gen:shipping.gen + 1,transistors:Number(game.lab.pp.transistors) + payoutInfo(game).pay }),bits:0,made:0,spent:0 };
      if (blockInvalidProposal(game,trial,'Shipping the next generation')) { dialog.cancel.click(); state.shipping = null; return; }
      state.pending = { kind:'ship',gen:shipping.gen,at:now };
      state.manageNote = 'Shipping Generation ' + (shipping.gen + 1);
      dialog.confirm.click();
    }
  }
  function manageAutomation(game, now) {
    if (!game || !state.running || state.pending || game.networkBusy) return;
    if (state.shipping) { manageShipping(game,now); return; }
    const payout = payoutInfo(game);
    if (options.autoShip && (payout?.eligible || now >= state.shipRetryAt)) {
      const possible = payoutInfo(game,estimatedBank(game,now));
      if (payout?.eligible || possible?.eligible) {
        state.generation++; resetLine(now);
        state.shipping = { gen:game.lab.pp.gen,stage:'drain',finalSynced:false };
        manageShipping(game,now); return;
      }
    }
    /* Spend/invest after checking shipment eligibility so a long Breakthrough queue cannot delay a ready reset. */
    if (options.autoBreakthrough) {
      const result = chooseBreakthrough(game); state.btNote = result.note;
      if (result.choice) {
        const store = ensureStore('bt',now); if (!store) return;
        const button = all('button[data-bt]',store).find(el => el.dataset.bt === result.choice.id);
        if (visible(button) && enabled(button)) startPurchase('breakthrough',{ ...result.choice,button },game,now);
        return;
      }
    } else state.btNote = 'Breakthrough buying off';
    if (!options.autoLab) { state.manageNote = 'Lab upgrade buying off'; return; }
    const store = ensureStore('up',now); if (!store) return;
    if (options.labBuyMode === 'all') {
      const choice = affordableDrain(game,store);
      state.manageNote = choice ? 'Bulk buying: ' + choice.name : 'No affordable Lab upgrade';
      if (choice) startPurchase('lab',choice,game,now);
      return;
    }
    const purchase = chooseActiveUpgrade(store,game); state.manageNote = purchase.note;
    if (purchase.buy) {
      const choice = regularCandidates(game,store).find(item => item.button === purchase.buy);
      if (choice && choice.cost <= Number(game.lab.bits)) startPurchase('lab',choice,game,now);
    }
  }
  function paint(now, fallback = 'Running') {
    if (now - state.lastPaint < 150) return;
    state.lastPaint = now;
    const game = getGame(now), payout = payoutInfo(game);
    if (options.ignoreInvalidNumbers) showHealth(gameNumberIssue(game,now));
    state.shipNote = !options.autoShip ? 'Auto-shipping off' : !payout ?
      (game?.payout ? 'The game returned invalid shipping numbers; check the shipping panel' : 'Waiting for shipping stats') :
      payout.capOverflow && options.shipMode === 'percent' ? 'Percentage target exceeds the browser number range. Choose "as soon as eligible" to keep shipping.' :
      'Ship target: ' + payout.pay + ' / ' + payout.target + ' Transistors · cap ' + (payout.capOverflow ? 'beyond browser number range' : payout.cap) +
      (payout.target > payout.cap ? ' (minimum exceeds this cap)' : '');
    if (state.running) status(state.shipping || state.pending ? state.manageNote || 'Waiting for the game' :
      !['autoClick','autoType','autoRepair','autoLab','autoBreakthrough','autoShip'].some(key => options[key]) ? 'Idle — enable an activity below' : fallback);
    const counts = [[state.taps,'Tap attempts'],[state.submissions,'Sprint attempts'],[state.repairLines,'Repair attempts'],[state.attempts,'Lab purchases'],[state.breakthroughBuys,'Breakthroughs'],[state.ships,'Shipments']];
    ui.getElementById('counts').innerHTML = counts.map(([n,label]) => '<div class="stat"><strong>' + n.toLocaleString() + '</strong>' + label + '</div>').join('');
    ui.getElementById('upgrade').textContent = state.running || state.pending ? state.manageNote :
      'Lab purchases: ' + (!options.autoLab ? 'off' : options.labBuyMode === 'all' ? 'all affordable upgrades' : 'best active value');
    ui.getElementById('breakthroughStatus').textContent = !options.autoBreakthrough ? 'Breakthrough buying off' : state.running ? state.btNote :
      'Breakthroughs: useful upgrades · keep ' + options.reserveTransistors + ' Transistors';
    ui.getElementById('shippingStatus').textContent = state.shipNote;
  }
  function tick() {
    if (!state.running) return;
    const now = performance.now();
    if (document.hidden) {
      state.generation++; resetLine(now); status('Waiting for the game tab to be visible'); return;
    }
    try {
      const game = getGame(now);
      pollPending(game,now); if (!state.running) return;
      const numberIssue = gameNumberIssue(game,now);
      if (numberIssue && !options.ignoreInvalidNumbers) {
        showHealth(numberIssue,'Automation is paused. Reduce active pets or boosts, then use Check numbers again. The game owner may need to repair an invalid save.');
        stop('Paused: the game’s numbers are invalid'); return;
      }
      if (options.autoShip && options.stopGeneration > 0 && Number(game?.lab.pp?.gen) >= options.stopGeneration) {
        stop('Reached generation ' + game.lab.pp.gen + ' — your pause point is ' + options.stopGeneration); return;
      }
      const dialog = shipDialog();
      if (dialog && !(options.autoShip && state.shipping && state.shipping.stage === 'confirm') && state.pending?.kind !== 'ship') {
        if (enabled(dialog.cancel)) dialog.cancel.click(); state.lastScan = -Infinity;
        paint(now,'Shipping cancelled; continuing farming'); return;
      }
      if (state.pending?.kind === 'ship' || state.shipping) {
        if (game) manageShipping(game,now);
        paint(now,'Preparing to ship'); return;
      }
      const repairInput = document.getElementById('bugInput');
      if (visible(repairInput)) changeMode('repair',now);
      const toast = document.getElementById('toast');
      const activeInput = visible(repairInput) ? repairInput : state.controls.input;
      const root = activeInput?.closest('.modal-card,[role="dialog"]') || (activeInput && sprintCard(activeInput));
      const local = root && all('p,small,span,div',root).find(el => visible(el) && !el.children.length && /too fast|slow down|rate limit|automation detected|bot detected/i.test(text(el)));
      const warning = visible(toast) && /too fast|slow down|rate limit|automation detected|bot detected/i.test(text(toast)) ? text(toast) : text(local);
      if (handleWarning(warning,now) || !state.running) return;
      if (options.autoRepair) {
        if (handleRepairs(now) || !state.running) { paint(now,'Repairing pet'); return; }
      } else {
        if (visible(repairInput) || all('.modal,[role="dialog"],dialog[open]').some(visible)) { paint(now,'Close the game popup to continue'); return; }
        changeMode('sprint',now);
      }
      const { input,prompt,tap } = detect(now);
      if (!state.pending && now - state.lastManage >= config.upgradeMs) {
        const fresh = getGame(performance.now());
        if (fresh && !fresh.networkBusy) { state.lastManage = now; manageAutomation(fresh,now); }
      }
      if (state.shipping || state.pending?.kind === 'ship') { paint(now,'Preparing to ship'); return; }
      if (options.autoType && input && prompt) typeLine(input,prompt,now);
      if (!state.running) return;
      if (options.autoClick && !state.pending && !nativeBusy() && visible(tap) && enabled(tap) && now - state.lastTap >= options.tapIntervalMs) {
        tapControl(tap); state.lastTap = now; state.taps++;
      }
      paint(now,options.autoType && state.phase === 'typing' ? 'Typing ' + state.index + '/' + state.chars.length : 'Running');
    } catch (error) { stop('Stopped: ' + error.message); }
  }

  ui.getElementById('toggle').onclick = toggle;
  ui.getElementById('close').onclick = () => { stop(); host.remove(); delete window.__gachaLabMacro; };
  window.__gachaLabMacro = { version: VERSION, toggle, stop, config };
  const initialNow = performance.now(), initialIssue = gameNumberIssue(getGame(initialNow),initialNow);
  if (initialIssue || options.ignoreInvalidNumbers) showHealth(initialIssue,'The macro cannot repair game-number overflow. Reduce active pets or boosts, or ask the game owner to repair the save.');
  paint(initialNow);
})(() => {
  /* This reader is outside the macro's scope so state/CFG refer to the game.
     Only read published Lab/inventory data and the game's pure rate calculator. */
  try {
    if (typeof state === 'undefined' || !state?.lab || typeof CFG === 'undefined' ||
        typeof LABX === 'undefined' || typeof labStats_ !== 'function') return null;
    return { lab: state.lab, inventory: state.inventory, settings: CFG.lab, context: LABX, model: labStats_,
      payout: typeof labTransistorsFor_ === 'function' ? labTransistorsFor_ : null,
      sync: typeof labFlush === 'function' ? labFlush : null,
      receivedAt: typeof Lab !== 'undefined' ? Lab.recv : null,
      networkBusy: typeof Lab !== 'undefined' ? !!(Lab.busy || Lab.sprintBusy || Lab.squashing) : false };
  } catch { return null; }
});
