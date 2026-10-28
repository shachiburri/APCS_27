/* Gacha Lab Macro v20: four store tabs, Hardware, bosses, challenges and IPOs. */
((readGame) => {
  'use strict';
  const VERSION = 20;
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
    'gloves','clone','polish','squadup','lounge','nap','cloud','quantum','fiber','pair','trophy']);
  const offlineUpgradeIds = new Set(['shift', 'nap']);
  const breakthroughIds = new Set(['cores','arm','clock','noc','gold','clone','neural','lowpower',
    'firewall','cache','fab','fiveg','interest','mentor4','lucky','museum','autohw','autoup']);
  const hardwareIds = new Set(['monitor','laptop','tower','rack','dc','super','ai','orbit','dyson','multi']);
  const patentIds = new Set(['brand','law','royalty','seed','hq','keepbots']);
  const hackIds = ['notap','commons','twodesk','nohw','nosprint'];
  const languageIds = ['keep','java','python','javascript','cpp','csharp','html','sql','swift','go','rust','kotlin'];
  const defaults = { autoClick: true, autoType: true, autoRepair: true, autoLab: true,
    autoBreakthrough: true, autoShip: false, shipMode: 'percent', shipPercent: 50,
    minShipPayout: 0, reserveTransistors: 0, rebuildHelpers: true, labBuyMode: 'all', spendBeforeShip: false,
    sprintMinMs: config.lineMs, repairMinMs: config.repairLineMs, tapIntervalMs: 0,
    stopGeneration: 0, panelCompact: false, ignoreInvalidNumbers: false,
    autoHardware:true, hardwareBatch:'max', hardwareCap:0, autoBoss:true, bossMinMs:1500, bossShipWaitSeconds:10,
    language:'keep', autoHackathons:false, autoIpo:false, ipoGeneration:10, minIpoPatents:1,
    autoPatents:true, reservePatents:0 };
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
    if (['1','10','max'].includes(saved.hardwareBatch)) result.hardwareBatch = saved.hardwareBatch;
    if (languageIds.includes(saved.language)) result.language = saved.language;
    const ranges = { shipPercent: [1,100], minShipPayout: [0,1e9], reserveTransistors: [0,1e9],
      sprintMinMs: [100,60000], repairMinMs: [100,60000], tapIntervalMs: [0,60000], stopGeneration: [0,1000000],
      bossMinMs:[100,60000], bossShipWaitSeconds:[0,300], hardwareCap:[0,1000000], ipoGeneration:[1,1000000], minIpoPatents:[1,1e9], reservePatents:[0,1e9] };
    for (const [key,[min,max]] of Object.entries(ranges)) if (Number.isFinite(saved[key])) result[key] = Math.round(Math.max(min,Math.min(max,saved[key])));
    return result;
  }
  const learnedTiming = loadTiming();
  function loadTiming() {
    const clean = { sprint: {}, repair: {}, boss:{}, repairMinimum: 0 };
    try {
      const saved = JSON.parse(localStorage.getItem(timingKey) || '{}');
      if (Number.isFinite(saved?.repairMinimum) && saved.repairMinimum >= 1000 && saved.repairMinimum <= 15000) clean.repairMinimum = saved.repairMinimum;
      for (const mode of ['sprint', 'repair','boss']) {
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
    lineBucket: '1', lastAttempt: null, rateFailures: { sprint: 0, repair: 0, boss:0 },
    cooldownUntil: 0, warningDeadline: 0, pending: null, shipping: null, ships: 0,
    breakthroughBuys: 0, lastManage: -Infinity, shipRetryAt: 0,
    observedLab: null, observedBits: null, observedAt: 0,
    manageNote: '', btNote: '', shipNote: '', lastPaint: -Infinity,
    healthKey: null, healthAt: -Infinity, healthIssue: '', healthDetail: '',
    hardwareBuys:0, hardwareUnits:0, bossLines:0, bosses:0, bossFailures:0,
    patentBuys:0, ipos:0, hackStarts:0, resetFlow:null, nativeMarker:null };
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
    <div class="title-row"><b id="dragHandle" title="Drag this title to move the panel">Gacha Lab Macro <span style="color:#bd9df5">v20</span></b><span id="runBadge">Paused</span></div>
    <div id="status" role="status" aria-live="polite">Paused — choose your settings, then Start</div>
    <div class="actions"><button id="toggle">Start</button><button id="compact" aria-expanded="true">Compact view</button><button id="close" title="Stop automation and remove this panel">Close</button></div>
    <small>F8 start / pause · F9 pause · Drag title to move</small>
  </header><div class="body">
    <div id="healthBox" role="alert" hidden><strong id="healthTitle"></strong><p id="healthDetail"></p><button id="checkHealth">Check numbers again</button></div>
    <div id="counts" aria-label="This session's activity"></div>
    <div id="overview"><div id="upgrade"></div><div id="breakthroughStatus"></div><div id="shippingStatus"></div><div id="progressStatus"></div></div>
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
        ${switchSetting('autoBoss','Fight Merge Conflict bosses','Fights for unlocks and XP while shipping is still far away, including in earliest mode. Defers new fights near the target and leaves an active fight when shipping can proceed. Uses separate timing; two failed fights pause automation.')}
        ${numberSetting('bossShipWaitSeconds','Wait for shipping if within (seconds)','While auto-shipping, skips a new boss if the target is estimated this close at the current earning rate. Default 10 seconds. 0 only defers when shipping can proceed now. This estimate changes with upgrades, combos, and credited taps.',0,300)}
        <div class="setting"><label for="opt-language">Coding language</label><select id="opt-language" data-option="language" aria-describedby="help-language"><option value="keep">Keep the game’s current language</option><option value="java">Java</option><option value="python">Python</option><option value="javascript">JavaScript</option><option value="cpp">C++</option><option value="csharp">C#</option><option value="html">HTML &amp; CSS</option><option value="sql">SQL</option><option value="swift">Swift</option><option value="go">Go</option><option value="rust">Rust</option><option value="kotlin">Kotlin</option></select><small id="help-language">Applies through the game’s language menu. Sprint, bosses and repairs read the actual displayed code. Keep current leaves your choice alone.</small></div>
      </div></details>
      <details><summary>Upgrade purchases <span id="purchasesSummary" style="color:#b69bd7;font-size:11px"></span></summary><div class="group">
        ${switchSetting('autoHardware','Buy Hardware','Buys unlocked machines and accounts for milestones that double their output. Hardware can be bought indefinitely. Bosses unlock higher tiers. Disabled automatically in the Unplugged Hackathon.')}
        <div class="setting"><label for="opt-hardwareBatch">Hardware per purchase</label><select id="opt-hardwareBatch" data-option="hardwareBatch" aria-describedby="help-hardwareBatch"><option value="max">Max affordable · fastest</option><option value="10">Up to 10</option><option value="1">One at a time</option></select><small id="help-hardwareBatch">Uses the game’s 1 / ×10 / Max buttons. Max buys up to the game’s 1,000-unit limit per request. Near a cap or spend-down budget, smaller buttons keep spending bounded.</small></div>
        ${numberSetting('hardwareCap','Maximum of each machine','0 means unlimited. Otherwise stops buying that Hardware type at this count. Hardware and its milestones reset when shipping. The game’s own Purchasing Bot can buy independently of this macro cap.',0,1000000)}
        ${switchSetting('autoLab','Buy Lab upgrades','Spends Food Bits on regular upgrades. Each purchase waits only for the game to confirm it.')}
        <div class="setting"><label for="opt-labBuyMode">What to buy</label><select id="opt-labBuyMode" data-option="labBuyMode" aria-describedby="help-labBuyMode"><option value="all">All affordable upgrades · fast bulk buying</option><option value="active">Best value for active farming</option></select><small id="help-labBuyMode"></small></div>
        ${switchSetting('autoBreakthrough','Buy all Breakthroughs · useful first','Buys the highest-priority affordable upgrade, eventually including extra slots, offline bonuses and cosmetics. Current income improvements come first. It waits only when none are affordable within your reserve. New slots still need pets or mentors equipped manually.')}
        ${numberSetting('reserveTransistors','Keep this many Transistors','Reserved Transistors are not spent by automatic Breakthrough buying. Held Transistors now boost production too, so keeping a reserve can help income but delay purchases. 0 lets it use the full balance.',0,1000000000)}
        ${switchSetting('rebuildHelpers','Prioritize faster rebuilds','While auto-shipping, gives Cache Memory, Fab Plant and other rebuild benefits more priority. OFF still allows buying them later. Requires both Breakthrough buying and auto-shipping.')}
        <small id="purchaseDependency"></small>
      </div></details>
      <details id="shippingGroup"><summary>Generation shipping <span id="shippingSummary" style="color:#b69bd7;font-size:11px"></span></summary><div class="group">
        ${switchSetting('autoShip','Ship generations automatically','Shipping resets Food Bits, Hardware, bosses, most regular upgrades, and the run’s score. Pets, cards, mentors, coder XP, Commits, Transistors and Breakthroughs stay. Cache Memory retains some regular levels.')}
        <div class="setting"><label for="opt-shipMode">When to ship</label><select id="opt-shipMode" data-option="shipMode" aria-describedby="help-shipMode"><option value="early">As soon as eligible · fastest resets</option><option value="percent">At a percentage of the Transistor cap</option></select><small id="help-shipMode"></small></div>
        <div id="percentRow">${numberSetting('shipPercent','Percentage of the cap','Uses the game’s displayed cap before Royalties. Example: 50% of a cap of 30 means a base payout of at least 15. Higher percentages take longer. If the cap exceeds the number range, use earliest shipping.',1,100)}</div>
        ${numberSetting('minShipPayout','Minimum Transistors per shipment','An extra condition in either mode, including your Royalties bonus. Example: 20 means wait for at least 20 actual Transistors even in earliest mode. 0 adds no extra minimum.',0,1000000000)}
        ${switchSetting('spendBeforeShip','Spend extra Food Bits before shipping','OFF: ship once the target is met. ON: spends a snapshot of the available balance on Hardware and regular upgrades first, including offline ones. New income does not extend this budget forever; some Bits may remain.')}
        <div class="hint">Both Hardware and regular upgrades count toward shipping. Auto-shipping can make needed purchases even when their farming switches are off. A ready shipment takes priority over ordinary purchases.</div>
        ${numberSetting('stopGeneration','Pause at generation','Optional stopping point for all automation while auto-shipping is on. 0 means no generation limit. Starting at or beyond this number stays paused. This does not guarantee the game will avoid number overflow before that point.',0,1000000)}
        <small id="shippingDependency"></small>
      </div></details>
      <details><summary>Hackathons, IPOs and Patents</summary><div class="group">
        ${switchSetting('autoHackathons','Complete unfinished Hackathons','OFF by default. Starting a challenge restarts the run without paying Transistors. Completes each unfinished rule by shipping a chip. Requires auto-shipping; respects No Mouse, Unplugged, Silent Lab, two-desk and Common/Rare rules. Does not rearrange your team.')}
        ${switchSetting('autoIpo','Go public automatically (IPO)','OFF by default. A larger reset: clears chip generations, Transistors, Breakthroughs, Hardware and regular upgrades. Keeps pets/cards, coder XP, Commits, Hackathon rewards and Patents. Waits until no Hackathon is active.')}
        ${numberSetting('ipoGeneration','IPO at or after generation','Must also meet the game’s IPO unlock and the Patent minimum below. Auto-shipping needs to be on if you want generations to keep advancing automatically.',1,1000000)}
        ${numberSetting('minIpoPatents','Minimum Patents from IPO','Waits until the game’s displayed IPO payout reaches this amount. This is separate from the Transistor shipping minimum.',1,1000000000)}
        ${switchSetting('autoPatents','Buy all Patents · useful first','Spends Patents on permanent upgrades, prioritizing estimated benefits and future resets. Includes Royalties, Seed Funding, Headquarters and Keep the Bots; does not fill new desks. Purchases remain available even with automatic IPOs off.')}
        ${numberSetting('reservePatents','Keep this many Patents','Reserved Patents are not spent by this macro. 0 allows spending the full available Patent balance.',0,1000000000)}
        <div class="hint">Commits award their permanent +2% boosts automatically; there is no claim button. The status tracks Commits, coder levels and boss gates. Purchasing Bot and Upgrade Bot are included in Breakthrough buying, but their game-driven purchases run independently of these switches.</div>
      </div></details>
      <details><summary>Typing and tapping speed</summary><div class="group">
        ${numberSetting('sprintMinMs','Minimum seconds per Sprint line','A minimum for the entire line, not a delay per character. Long lines and learned warning limits can take longer. Lower values may trigger speed warnings.',0.1,60,0.001,1000)}
        ${numberSetting('repairMinMs','Minimum seconds per repair line','Repairs have separate timing because the game can apply a different speed check. Lowering Sprint time does not change this value.',0.1,60,0.001,1000)}
        ${numberSetting('bossMinMs','Minimum seconds per boss line','Bosses have their own learned timing and countdown. Longer code may take more time. This setting does not change Sprint or repair timing.',0.1,60,0.001,1000)}
        ${numberSetting('tapIntervalMs','Seconds between taps','0 uses the fastest available tapping rate. 0.1 means at most 10 attempts per second. The game can still limit credited taps.',0,60,0.001,1000)}
        <div class="hint">Timing changes apply to the next line. No fixed pause between accepted code lines. A speed warning makes the macro wait and learn a slower timing. Purchases and submissions briefly wait for other game requests to finish.</div>
      </div></details>
      <details><summary>Help and game-number limits</summary><div class="group">
        ${switchSetting('ignoreInvalidNumbers','Ignore invalid numbers','OFF by default. ON skips automatic pauses for invalid balances/rates and predicted purchase or shipping overflow. It does not fix the game, restore zero rates, or bypass game buttons, payout requirements, your generation pause point, or request timeouts. If already paused, select Start to continue.')}
        <ul class="help-list">
        <li>Switches take effect immediately while running. Select Pause first if you want to change several settings before actions resume.</li>
        <li>Settings and learned typing delays stay in this browser after refresh. Session counters restart when the helper reloads.</li>
        <li>Pause stops new actions. A purchase or shipment already sent to the game can still finish. Close also removes this panel.</li>
        <li>Keep the game tab visible. Other game popups block automation; close them to continue.</li>
        <li>The update requires real mouse input for taps. Run the v20 AutoHotkey file: it clicks only while the tiny Tap-ready marker is visible, then restores the pointer. Keep the game focused. Pause before using the mouse for other work.</li>
        <li>“Still coding?” is a human verification check. The macro pauses without entering that line. Complete it yourself, then press Start. Ignore invalid numbers does not skip this check.</li>
        <li>Reset all Lab progress is never automated. Hackathons and IPOs only start when their separate options are enabled.</li>
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
    ui.getElementById('activitiesSummary').textContent = '· ' + ['autoClick','autoType','autoRepair','autoBoss'].filter(key => options[key]).length + ' on';
    ui.getElementById('purchasesSummary').textContent = '· ' + ['autoHardware','autoLab','autoBreakthrough','autoPatents'].filter(key => options[key]).length + ' on';
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
      if (['hardwareBatch','hardwareCap'].includes(key)) input.disabled = !options.autoHardware;
      if (key === 'bossMinMs') input.disabled = !options.autoBoss;
      if (key === 'bossShipWaitSeconds') input.disabled = !options.autoBoss || !options.autoShip;
      if (key === 'autoHackathons') input.disabled = !options.autoShip;
      if (['ipoGeneration','minIpoPatents'].includes(key)) input.disabled = !options.autoIpo;
      if (key === 'reservePatents') input.disabled = !options.autoPatents;
      const row = input.closest('.setting'); if (row) row.dataset.disabled = String(input.disabled);
    }
    ui.getElementById('help-labBuyMode').textContent = !options.autoLab ? 'Enable Buy Lab upgrades to use this setting.' : options.labBuyMode === 'all' ?
      'Buys every affordable unlocked level, including offline upgrades. Starts with the largest affordable purchase and continues after each game response.' :
      'Chooses estimated active income gained per Food Bit. Skips offline-only upgrades and may save briefly for a better purchase. Estimates assume a maintained Sprint combo and credited taps when those activities are on.';
    ui.getElementById('help-shipMode').textContent = options.shipMode === 'early' ?
      'Ships when the game unlocks a payout and your optional minimum is met. With extra spending off, stops buying at that point.' :
      'Waits for your percentage target and the optional minimum. Both conditions must be met.';
    ui.getElementById('purchaseDependency').textContent = !options.autoBreakthrough ? 'Enable Buy all Breakthroughs to set a reserve or prioritize rebuilds.' :
      !options.autoShip ? 'Prioritize faster rebuilds is available when auto-shipping is on.' : '';
    ui.getElementById('shippingDependency').textContent = options.autoShip ?
      'Automatic resets are ON. Check the target and pause point before starting.' : 'Auto-shipping is OFF. Enable it to use these settings. Other selected activities can still run.';
  }
  function optionsChanged() {
    if ((!options.autoType && state.mode === 'sprint') || (!options.autoRepair && state.mode === 'repair') || (!options.autoBoss && state.mode === 'boss')) { state.generation++; resetLine(performance.now()); }
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
    farm: { values:{autoClick:true,autoType:true,autoRepair:true,autoBoss:true,autoHardware:true,autoPatents:true,autoLab:true,autoBreakthrough:true,autoShip:false,autoIpo:false,autoHackathons:false,labBuyMode:'active'},
      help:'Enables activities, bosses and purchases with active-value Lab buying. Turns OFF shipping, Hackathons and IPOs. Keeps timing, reserves and pause point.' },
    ship: { values:{autoClick:true,autoType:true,autoRepair:true,autoBoss:true,autoHardware:true,autoPatents:true,autoLab:true,autoBreakthrough:true,autoShip:true,autoIpo:false,autoHackathons:false,shipMode:'early',minShipPayout:0,spendBeforeShip:false,labBuyMode:'all'},
      help:'Enables automatic shipping as soon as eligible, with no extra minimum or balance spending. Turns on activities and purchases, but turns OFF Hackathon starts and IPOs. Keeps timing, reserves and generation pause point.' },
    tap: { values:{autoClick:true,autoType:false,autoRepair:false,autoBoss:false,autoHardware:false,autoPatents:false,autoLab:false,autoBreakthrough:false,autoShip:false,autoIpo:false,autoHackathons:false},
      help:'Only presses Tap!. Turns OFF all other activities, purchases and resets. Keeps your tap speed.' }
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
    if (state.nativeMarker) state.nativeMarker.hidden = true;
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
    if (state.mode === 'sprint') state.submissions++;
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
      state.lineDurationMs = Math.max(repairing ? Math.max(options.repairMinMs, learnedTiming.repairMinimum) : state.mode === 'boss' ? options.bossMinMs : options.sprintMinMs,
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
        if (state.mode === 'boss') state.bossLines++;
        if (input.readOnly) {
          if (state.mode === 'sprint') state.submissions++;
          state.phase = 'awaiting'; state.due = now + config.acceptanceMs; return;
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
  function nativeTapMarker(button,now,game) {
    if(!document.hasFocus())return;
    if (now - state.lastTap < options.tapIntervalMs) return;
    const rect = button.getBoundingClientRect(), x = rect.left + rect.width / 2, y = rect.top + rect.height / 2;
    const hit = document.elementFromPoint(x,y);
    if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight || !(hit === button || button.contains(hit))) return;
    if (!state.nativeMarker) {
      const marker = document.createElement('canvas'); marker.width = marker.height = 9;
      marker.dataset.gachaNativeTap = 'true'; marker.setAttribute('aria-hidden','true');
      marker.style.cssText = 'position:fixed;pointer-events:none;z-index:2147483646;image-rendering:pixelated;';
      const ctx = marker.getContext('2d'); ctx.fillStyle = '#635081'; ctx.fillRect(0,0,9,9);
      for (const [cx,cy,color] of [[0,0,'#13C7A5'],[1,0,'#D32B79'],[0,1,'#F4C842'],[1,1,'#6752D1']]) { ctx.fillStyle=color; ctx.fillRect(cx,cy,1,1); }
      document.documentElement.append(marker); state.nativeMarker = marker;
    }
    const ratio = devicePixelRatio || 1, marker = state.nativeMarker;
    marker.style.width = marker.style.height = 9 / ratio + 'px';
    marker.style.left = (Math.floor(x * ratio) - 4) / ratio + 'px'; marker.style.top = (Math.floor(y * ratio) - 4) / ratio + 'px'; marker.hidden = false;
  }
  function recordNativeTap(event) {
    const tap = document.getElementById('typeKey');
    if (state.running && options.autoClick && event.isTrusted && tap?.contains(event.target)) { state.lastTap=performance.now(); state.taps++; if (state.nativeMarker) state.nativeMarker.hidden=true; }
  }
  document.addEventListener('pointerdown',recordNativeTap,true);
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
    const rule = game.lab.hack?.on || '';
    const taps = options.autoClick && rule !== 'notap' ? Math.max(0, Math.min(config.activeTapEstimate,game.settings.MAX_TAPS_PER_SEC || 15)) : 0;
    const sprint = options.autoType && rule !== 'nosprint' ? Math.max(1,Math.min(config.activeSprintEstimate,game.settings.SPRINT_MAX_MULT || 10)) : 1;
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
    const royalty=1 + .25 * Number(game.lab.ipo?.lv?.royalty || 0), reward=Math.floor(value.pay * royalty);
    if(!Number.isFinite(royalty)||royalty<1||!Number.isFinite(reward))return null;
    /* Multiply by the fraction first to avoid overflowing an otherwise finite cap. */
    const target = Math.max(1,Math.ceil(options.minShipPayout / royalty),options.shipMode === 'percent' ? Math.ceil(value.cap * (options.shipPercent / 100)) : 1);
    return { ...value, target, reward, royalty, capOverflow, eligible: Number.isFinite(target) && value.pay >= target };
  }
  function estimatedBank(game, now) {
    const stats = game.lab.stats || gameStats(game), seconds = Math.max(0,(now - game.stamp) / 1000);
    const sp = game.lab.sprint || {}, boost = Math.min(seconds,Math.max(0,Number(sp.left) || 0) / 1000);
    return Math.max(0,Number(game.lab.bits) || 0) + stats.total * seconds +
      stats.total * (Math.max(1,Number(sp.mult) || 1) - 1) * boost + (stats.autoRate || 0) * seconds +
      Math.max(0,Number(game.uncreditedTaps)||0) * Math.max(0,Number(stats.tap)||0);
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
      return { button,id,cost,level,name:definition.name,kind:'lab',tab:'up' };
    }).filter(Boolean);
  }
  function hardwareCandidates(game,store,budget = Number(game.lab.bits),spendingDown = false) {
    if (!game.settings.HARDWARE || game.lab.hack?.on === 'nohw') return [];
    const bank = Math.max(0,Math.min(Number(game.lab.bits),budget)), results=[];
    for (const definition of game.settings.HARDWARE) {
      const id=definition.id, level=Number(game.lab.hw?.[id] || 0);
      const need=(game.settings.GATES || []).filter(g=>definition.cost>=g.at).length;
      if (!hardwareIds.has(id) || !Number.isSafeInteger(level) || level<0 || Number(game.lab.gate || 0)<need) continue;
      const room=options.hardwareCap>0 ? Math.max(0,options.hardwareCap-level) : 1000;
      const single=store.querySelector('button[data-hw="'+id+'"][data-q="1"]');
      if (!visible(single) || single.dataset.off==='1' || Number(single.dataset.cost)!==Math.round(definition.cost*Math.pow(game.settings.HW_GROW,level))) continue;
      const maxBatch=options.hardwareBatch==='1'?1:options.hardwareBatch==='10'?10:1000;
      let units=0,cost=0;
      while (units<Math.min(room,maxBatch)) {
        const next=Math.round(definition.cost*Math.pow(game.settings.HW_GROW,level+units));
        if (!Number.isFinite(next) || !(next>0) || cost+next>bank) break;
        cost+=next; units++;
      }
      if (!units) continue;
      /* Max is unbounded by a UI count cap; use deterministic 10/1 buttons when bounded. */
      const q=options.hardwareBatch==='max' && options.hardwareCap===0 && !spendingDown ? 'max' : units>=10?'10':'1';
      const button=store.querySelector('button[data-hw="'+id+'"][data-q="'+q+'"]');
      const actualUnits=q==='max'?units:Number(q);
      let actualCost=0; for(let k=0;k<actualUnits;k++)actualCost+=Math.round(definition.cost*Math.pow(game.settings.HW_GROW,level+k));
      if (!visible(button) || !enabled(button) || actualCost>bank || (q!=='max' && Number(button.dataset.cost)!==actualCost)) continue;
      let score=0;
      try {
        const before=activeIncome(gameStats(game),game),trial={...game.lab,hw:{...game.lab.hw,[id]:level+actualUnits}};
        const gain=activeIncome(gameStats(game,trial),game)-before;
        if (Number.isFinite(gain) && gain>0)score=gain/actualCost;
      } catch {}
      results.push({kind:'hardware',tab:'hw',button,id,q,level,units:actualUnits,cost:actualCost,name:definition.name,score});
    }
    return results;
  }
  function foodCandidates(game,store,budget,spendingDown=false) {
    return [...regularCandidates(game,store).filter(c=>enabled(c.button)&&c.cost<=Math.min(Number(game.lab.bits),budget)),
      ...hardwareCandidates(game,store,budget,spendingDown)];
  }
  function activateFoodChoice(choice,game,now) {
    const store=ensureStore(choice.tab,now); if (!store) return false;
    const button=choice.kind==='hardware'?store.querySelector('button[data-hw="'+choice.id+'"][data-q="'+choice.q+'"]'):store.querySelector('button[data-up="'+choice.id+'"]');
    if (!visible(button)||!enabled(button)||!choice.button.isConnected)return false;
    return startPurchase(choice.kind,{...choice,button},game,now);
  }
  function buyFood(game,now) {
    const store=ensureStore(options.autoLab?'up':'hw',now); if(!store)return;
    const hw=options.autoHardware?hardwareCandidates(game,store).sort((a,b)=>b.score-a.score||a.cost-b.cost)[0]:null;
    let regular=null;
    if(options.autoLab){
      if(options.labBuyMode==='all')regular=regularCandidates(game,store).filter(c=>enabled(c.button)&&c.cost<=Number(game.lab.bits)).sort((a,b)=>b.cost-a.cost)[0];
      else {
        const result=chooseActiveUpgrade(store,game); state.manageNote=result.note;
        regular=regularCandidates(game,store).find(c=>c.button===result.buy);
        if(regular){const trial={...game.lab,lv:{...game.lab.lv,[regular.id]:regular.level+1}};regular.score=(activeIncome(gameStats(game,trial),game)-activeIncome(gameStats(game),game))/regular.cost;}
      }
    }
    const choice=regular && (options.labBuyMode==='all'||!hw||(regular.score||0)>=hw.score)?regular:hw;
    if(choice){state.manageNote='Buying '+choice.name+(choice.kind==='hardware'?' ×'+choice.units:'');activateFoodChoice(choice,game,now);}
    else if(options.autoLab||options.autoHardware)state.manageNote='No affordable unlocked Hardware or Lab upgrade';
    else state.manageNote='Food Bit purchases off';
  }
  function choosePatent(game) {
    const ipo=game.lab.ipo, definitions=game.settings.PATENTS;
    if(!ipo?.n||!definitions)return null;
    const balance=Number(ipo.patents)||0,budget=Math.max(0,balance-options.reservePatents),choices=[];
    const order={brand:0,law:1,royalty:1,seed:1,hq:2,keepbots:2};
    for(const d of definitions){
      const level=Number(ipo.lv?.[d.id]||0),cost=Math.round(d.cost*Math.pow(d.grow,level));
      if(!patentIds.has(d.id)||!Number.isInteger(level)||level<0||level>=d.max||!Number.isFinite(cost)||cost<=0||cost>budget)continue;
      let gain=0;
      try {const base=activeIncome(gameStats(game),game),trial={...game.lab,ipo:{...ipo,patents:balance-cost,lv:{...ipo.lv,[d.id]:level+1}}};gain=(activeIncome(gameStats(game,trial),game)-base)/Math.max(1,base);}catch{}
      const planning=d.id==='royalty'&&options.autoShip ? .25 : d.id==='seed'&&options.autoShip ? .2 : d.id==='keepbots'&&options.autoIpo ? .15 : 0;
      choices.push({id:d.id,level,cost,name:d.name,score:(Number.isFinite(gain)?Math.max(0,gain):0)/cost+planning/cost,priority:order[d.id]});
    }
    return choices.sort((a,b)=>b.score-a.score||a.priority-b.priority||a.cost-b.cost)[0]||null;
  }
  function startPurchase(kind, choice, game, now) {
    if (state.pending || !enabled(choice.button)) return false;
    const trial = kind === 'lab' ? { ...game.lab,lv:{ ...game.lab.lv,[choice.id]:choice.level + 1 } } : kind==='hardware'?
      {...game.lab,hw:{...game.lab.hw,[choice.id]:choice.level+choice.units}} : kind==='patent'?
      {...game.lab,ipo:{...game.lab.ipo,patents:Number(game.lab.ipo.patents)-choice.cost,lv:{...game.lab.ipo.lv,[choice.id]:choice.level+1}}}:
      { ...game.lab,pp:{ ...game.lab.pp,transistors:Number(game.lab.pp.transistors) - choice.cost,lv:{ ...game.lab.pp.lv,[choice.id]:choice.level + 1 } } };
    if (blockInvalidProposal(game,trial,'Buying ' + choice.name)) return false;
    state.pending = { kind,id:choice.id,level:choice.level,gen:game.lab.pp?.gen || 0,at:now,spent:Number(game.lab.spent)||0 };
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
    else if(pending.kind==='ipo')done=Number(game.lab.ipo?.n||0)>pending.ipo;
    else if(pending.kind==='hack')done=game.lab.hack?.on===pending.id;
    else if(pending.kind==='language')done=game.lab.lang===pending.id;
    else if(pending.kind==='bossStart')done=!!game.lab.boss||visible(document.getElementById('bossInput'));
    else if(pending.kind==='bossQuit')done=!game.lab.boss;
    else if (gen !== pending.gen) done = true;
    else if (pending.kind === 'lab') done = Number(game.lab.lv?.[pending.id] || 0) > pending.level;
    else if (pending.kind === 'breakthrough') done = Number(game.lab.pp?.lv?.[pending.id] || 0) > pending.level;
    else if(pending.kind==='hardware')done=Number(game.lab.hw?.[pending.id]||0)>pending.level;
    else if(pending.kind==='patent')done=Number(game.lab.ipo?.lv?.[pending.id]||0)>pending.level;
    else if (pending.kind === 'sync') done = pending.done && (game.stamp > pending.stamp || now - game.stamp <= 1500);
    if (done) {
      if (pending.kind === 'lab') state.attempts++;
      if (pending.kind === 'breakthrough') state.breakthroughBuys++;
      if(pending.kind==='hardware'){state.hardwareBuys++;state.hardwareUnits+=Math.max(0,Number(game.lab.hw?.[pending.id]||0)-pending.level);}
      if(pending.kind==='patent')state.patentBuys++;
      if(pending.kind==='ipo'){state.ipos++;state.resetFlow=null;state.shipping=null;state.generation++;resetLine(now);state.lastScan=-Infinity;state.bossFailures=0;}
      if(pending.kind==='hack'){state.hackStarts++;state.resetFlow=null;state.generation++;resetLine(now);state.lastScan=-Infinity;}
      if(pending.kind==='language'){state.generation++;resetLine(now);}
      if(state.shipping && ['lab','hardware'].includes(pending.kind) && state.shipping.remainingBudget!==undefined)
        state.shipping.remainingBudget=Math.max(0,state.shipping.remainingBudget-Math.max(0,Number(game.lab.spent)-pending.spent));
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
    const seed=Number(lab.ipo?.lv?.seed||0);
    return { ...lab,lv:levels,pp,hw:{},gate:0,boss:null,bug:null,bits:seed?1000*Math.pow(10,seed-1):0,made:0,spent:0 };
  }
  function handleBosses(game,now) {
    const input=document.getElementById('bossInput'),win=document.getElementById('bossOk'),lost=document.getElementById('bossNo');
    if(visible(win)||visible(lost)){
      if(!options.autoBoss){status('Close the boss result to continue');return true;}
      if(visible(win)){state.bosses++;state.bossFailures=0;win.click();}
      else {state.bossFailures++;lost.click();if(state.bossFailures>=2)stop('Two boss fights failed. Check the timing and try again.');}
      changeMode('sprint',now);return true;
    }
    if(!visible(input))return false;
    if(!options.autoBoss){status('Boss typing is off — finish or close this fight manually');return true;}
    changeMode('boss',now);
    const toast=document.getElementById('toast'),warning=visible(toast)&&/too fast|slow down|rate limit/i.test(text(toast))?text(toast):'';
    if(handleWarning(warning,now)||!state.running)return true;
    const prompt=document.getElementById('bossPrompt');if(visible(prompt))typeLine(input,prompt,now);
    if(state.running)status('Boss: '+state.index+'/'+state.chars.length+' characters');return true;
  }
  function shippingOpportunity(game,now) {
    return !!(options.autoShip && game && (payoutInfo(game)?.eligible || payoutInfo(game,estimatedBank(game,now))?.eligible));
  }
  function secondsUntilShipping(game,now) {
    if(!options.autoShip||!game)return Infinity;
    if(shippingOpportunity(game,now))return 0;
    const payout=payoutInfo(game);if(!payout||!Number.isFinite(payout.target))return Infinity;
    const cap=game.settings.PRESTIGE_CAP*Math.pow(game.settings.PRESTIGE_CAP_GROW,game.lab.pp.gen),half=cap/2;
    let raw=payout.target;
    if(Number.isFinite(cap)&&raw>half){if(raw>=cap)return Infinity;raw=half-half*Math.log((cap-raw)/half);}
    const minimum=Number(payout.min),scale=Number(game.settings.PRESTIGE_SCALE);
    if(!(minimum>0)||!(scale>0))return Infinity;
    /* Even a one-Transistor target must meet the game's minimum spending gate. */
    const required=Math.max(minimum,minimum*Math.pow(raw/scale,2));
    const gap=Math.max(0,required-(Number(game.lab.spent)||0)-estimatedBank(game,now));
    let stats;try{stats=game.lab.stats||gameStats(game);}catch{return Infinity;}if(!stats)return Infinity;
    const sp=game.lab.sprint||{},rule=game.lab.hack?.on||'';
    const boost=rule!=='nosprint'&&Number(sp.left)>Math.max(0,now-game.stamp)?Math.max(1,Number(sp.mult)||1):1;
    const taps=options.autoClick&&rule!=='notap'&&document.hasFocus()?Math.max(0,Number(game.settings.MAX_TAPS_PER_SEC)||10):0;
    const rate=Number(stats.total)*boost+(Number(stats.autoRate)||0)+Number(stats.tap)*taps;
    return Number.isFinite(gap)&&Number.isFinite(rate)&&rate>0?gap/rate:Infinity;
  }
  function leaveBossForShipping(game,now) {
    if(!options.autoBoss || !shippingOpportunity(game,now) || !game.lab.boss)return false;
    const input=document.getElementById('bossInput');if(!visible(input))return false;
    if(state.pending || game.networkBusy || input.readOnly){status('Waiting for the boss action before shipping');return true;}
    const close=input.closest('.boss-modal,.modal,[role="dialog"]')?.querySelector('button.close[aria-label="Close"],button.close');
    if(!visible(close)||!enabled(close)){status('Close this boss fight to continue shipping');return true;}
    state.generation++;resetLine(now);state.mode='sprint';
    state.pending={kind:'bossQuit',at:now,gen:game.lab.pp.gen};state.manageNote='Leaving optional boss fight to ship';
    close.click();return true;
  }
  function beginBoss(game,now) {
    if(!options.autoBoss||state.pending||game.networkBusy||game.lab.boss)return false;
    if(options.autoShip && (shippingOpportunity(game,now) || secondsUntilShipping(game,now)<=options.bossShipWaitSeconds))return false;
    const gate=game.settings.GATES?.[game.lab.gate||0];
    if(!gate||Number(game.lab.made)<gate.at)return false;
    let button=all('[data-boss]').find(el=>visible(el)&&enabled(el));
    if(!button){const store=ensureStore('hw',now);if(store)button=all('[data-boss]',store).find(el=>visible(el)&&enabled(el));}
    if(!button)return false;
    state.generation++;resetLine(now);state.pending={kind:'bossStart',at:now,gen:game.lab.pp.gen};state.manageNote='Starting '+gate.name;button.click();return true;
  }
  function ipoReady(game) {
    const payout=Math.floor(Math.sqrt(Math.max(0,Number(game.lab.pp?.earned)||0))/3);
    return options.autoIpo && !game.lab.hack?.on && Number(game.lab.pp?.gen)>=Math.max(game.settings.IPO_MIN_GEN||10,options.ipoGeneration) && Number.isFinite(payout)&&payout>=options.minIpoPatents;
  }
  function beginReset(kind,id,game,now) {
    const store=ensureStore('bt',now);if(!store)return false;
    const button=kind==='ipo'?store.querySelector('#ipoBtn'):all('[data-hack]',store).find(el=>el.dataset.hack===id);
    if(!visible(button)||!enabled(button)){if(typeof game.refresh==='function')game.refresh();return false;}
    state.generation++;resetLine(now);state.resetFlow={kind,id,gen:game.lab.pp.gen,ipo:Number(game.lab.ipo?.n||0),at:now};
    state.manageNote=kind==='ipo'?'Opening IPO confirmation':'Opening Hackathon confirmation';button.click();return true;
  }
  function manageResetFlow(game,now) {
    const flow=state.resetFlow;if(!flow||state.pending)return;
    const yes=document.getElementById(flow.kind==='ipo'?'iYes':'hYes'),no=document.getElementById(flow.kind==='ipo'?'iNo':'hNo');
    const allowed=flow.kind==='ipo'?ipoReady(game):options.autoHackathons&&options.autoShip&&!game.lab.hack?.on&&!game.lab.hack?.done?.[flow.id];
    if(!allowed||game.lab.pp.gen!==flow.gen||Number(game.lab.ipo?.n||0)!==flow.ipo){if(visible(no)&&enabled(no))no.click();state.resetFlow=null;return;}
    if(now-flow.at>15000){stop('The reset confirmation did not become ready. Check the game.');return;}
    if(!visible(yes)||!enabled(yes)||game.networkBusy)return;
    if(flow.kind==='hack'){
      const definition=game.settings.HACKATHONS?.find(h=>h.id===flow.id),root=yes.closest('.modal-card,[role="dialog"]');
      if(!definition||!text(root).includes(definition.name)){stop('Hackathon confirmation does not match the selected challenge.');return;}
    }else{
      const keep=game.lab.ipo?.lv?.keepbots,levels=keep?{autohw:game.lab.pp.lv?.autohw||0,autoup:game.lab.pp.lv?.autoup||0}:{};
      const trial={...game.lab,pp:{...game.lab.pp,gen:0,transistors:0,lv:levels},lv:{},hw:{},gate:0,bug:null,boss:null};
      if(blockInvalidProposal(game,trial,'Going public')){if(visible(no))no.click();state.resetFlow=null;return;}
    }
    state.pending={kind:flow.kind,id:flow.id,at:now,gen:flow.gen,ipo:flow.ipo};state.manageNote=flow.kind==='ipo'?'Going public':'Starting Hackathon';yes.click();
  }
  function nextHack(game) {
    if(!options.autoHackathons||!options.autoShip||game.lab.hack?.on||!game.settings.HACKATHONS)return null;
    if(Number(game.lab.pp?.gen)<(game.settings.HACK_MIN_GEN||2)&&!(game.lab.ipo?.n>0))return null;
    for(const id of hackIds){
      if(game.lab.hack?.done?.[id]||!game.settings.HACKATHONS.some(h=>h.id===id))continue;
      const trial=rebuildLab(game.lab,game.lab.pp);trial.hack={...game.lab.hack,on:id};
      try {const stats=gameStats(game,trial),potential=stats.total+(stats.autoRate||0)+(id!=='notap'&&options.autoClick?stats.tap:0);
        if(potential>0&&Number.isFinite(potential))return id;
      }catch{}
    }
    return null;
  }
  function chooseBreakthrough(game) {
    const definitions = game.settings.BREAKTHROUGHS;
    if (!definitions || !game.lab.pp) return { choice:null,note:'Waiting for Breakthrough stats' };
    const pp = game.lab.pp, balance = Math.max(0,Number(pp.transistors) || 0), budget = Math.max(0,balance - options.reserveTransistors);
    const estimate = lab => {
      try { const value = activeIncome(gameStats(game,lab),game); return Number.isFinite(value) && value >= 0 ? value : null; }
      catch { return null; }
    };
    const gain = (value,baseline) => value !== null && baseline !== null ? (value - baseline) / Math.max(1,baseline) : 0;
    const base = estimate(game.lab);
    const helpers = options.autoShip && options.rebuildHelpers;
    const rebuildBase = helpers ? estimate(rebuildLab(game.lab,pp)) : null;
    /* Every known, unmaxed upgrade remains eligible. These tiers only order
       candidates without a measured income gain; cosmetics finish last. */
    const laterPriority = { arm:1,clock:1,gold:1,clone:1,interest:1,lucky:1,firewall:1,
      noc:2,fiveg:2,cores:2,mentor4:2,cache:2,fab:2,autohw:1,autoup:1,neural:3,lowpower:3,museum:4 };
    const choices = [];
    for (const definition of definitions) {
      if (!breakthroughIds.has(definition.id)) continue;
      const level = Number(pp.lv?.[definition.id] || 0);
      if (!Number.isInteger(level) || level < 0 || level >= definition.max) continue;
      const cost = Math.round(definition.cost * Math.pow(definition.grow,level));
      if (!Number.isFinite(cost) || !(cost > 0)) continue;
      const trialPp = { ...pp,transistors:Math.max(0,balance - cost),lv:{ ...pp.lv,[definition.id]:level + 1 } };
      const trial = { ...game.lab,pp:trialPp };
      const currentGain = gain(estimate(trial),base);
      const rebuildGain = helpers ? gain(estimate(rebuildLab(game.lab,trialPp)),rebuildBase) : currentGain;
      let benefit = helpers ? currentGain * 0.65 + rebuildGain * 0.35 : currentGain;
      if (definition.id === 'fab' && helpers) {
        const oldMinimum = 1 - 0.1 * level, newMinimum = 1 - 0.1 * (level + 1);
        benefit += 0.5 * (oldMinimum / newMinimum - 1);
      }
      const useful = Number.isFinite(benefit) && benefit > 1e-10;
      choices.push({ id:definition.id,level,cost,name:definition.name,
        priority:useful ? 0 : laterPriority[definition.id],score:useful ? benefit / cost : 0 });
    }
    choices.sort((a,b) => a.priority - b.priority || b.score - a.score || a.cost - b.cost);
    if (!choices.length) return { choice:null,note:'All Breakthroughs maxed — continuing other activities' };
    const affordable = choices.find(choice => choice.cost <= budget);
    if (!affordable) {
      const next = choices.reduce((best,choice) => choice.cost < best.cost ? choice : best);
      return { choice:null,note:'Waiting for Transistors: ' + next.name + ' costs ' + next.cost.toLocaleString() +
        ' · available ' + budget.toLocaleString() + ' after reserve' };
    }
    return { choice:affordable,note:(affordable.priority === 0 ? 'Useful first: ' : 'Completing Breakthroughs: ') + affordable.name };
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
    const budget=state.shipping?.remainingBudget ?? Number(game.lab.bits);
    return foodCandidates(game,store,budget,options.spendBeforeShip)
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
      const projectedOnly=!payoutInfo(game,Math.max(0,Number(game.lab.bits)||0))?.eligible;
      const syncBudget=shipping.remainingBudget===undefined && !shipping.budgetPrepared &&
        (Number(game.uncreditedTaps)>0 || projectedOnly);
      if (now - game.stamp > 1500 || syncBudget) { shipping.budgetPrepared=true;requestSync(game,now); return; }
      if(shipping.remainingBudget===undefined)shipping.remainingBudget=Math.max(0,Number(game.lab.bits)||0);
      const choice = affordableDrain(game,store);
      if (choice) { activateFoodChoice(choice,game,now); return; }
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
      else if(typeof game.refresh==='function')game.refresh();
      return;
    }
    const dialog = shipDialog();
    if (!dialog) { shipping.stage = 'open'; return; }
    if (dialog.generation !== shipping.gen + 1 || !payoutInfo(game)?.eligible) { abortShipping(now,'Shipping target is not ready'); return; }
    if (now - game.stamp > 1500) { requestSync(game,now,true); return; }
    const store = document.getElementById('labStore');
    if (options.spendBeforeShip && store && affordableDrain(game,store)) { dialog.cancel.click(); shipping.stage = 'drain'; shipping.finalSynced = false; return; }
    if (options.autoShip && enabled(dialog.confirm)) {
      const trial = rebuildLab(game.lab,{ ...game.lab.pp,gen:shipping.gen + 1,transistors:Number(game.lab.pp.transistors) + payoutInfo(game).reward });
      if(game.lab.hack?.on)trial.hack={...game.lab.hack,on:'',done:{...game.lab.hack.done,[game.lab.hack.on]:true}};
      if (blockInvalidProposal(game,trial,'Shipping the next generation')) { dialog.cancel.click(); state.shipping = null; return; }
      state.pending = { kind:'ship',gen:shipping.gen,at:now };
      state.manageNote = 'Shipping Generation ' + (shipping.gen + 1);
      dialog.confirm.click();
    }
  }
  function manageAutomation(game, now) {
    if (!game || !state.running || state.pending || game.networkBusy) return;
    if (state.shipping) { manageShipping(game,now); return; }
    if(ipoReady(game)&&beginReset('ipo','',game,now))return;
    const payout = payoutInfo(game);
    if (options.autoShip && (payout?.eligible || now >= state.shipRetryAt)) {
      const possible = payoutInfo(game,estimatedBank(game,now));
      if (payout?.eligible || possible?.eligible) {
        state.generation++; resetLine(now);
        state.shipping = { gen:game.lab.pp.gen,stage:'drain',finalSynced:false };
        manageShipping(game,now); return;
      }
    }
    const hack=nextHack(game);if(hack&&beginReset('hack',hack,game,now))return;
    if(options.language!=='keep'&&game.lab.lang!==options.language){
      const select=document.getElementById('spLang');
      if(visible(select)&&enabled(select)&&Array.from(select.options).some(o=>o.value===options.language)){
        state.generation++;resetLine(now);state.pending={kind:'language',id:options.language,gen:game.lab.pp.gen,at:now};
        state.manageNote='Changing coding language';select.value=options.language;select.dispatchEvent(new Event('change',{bubbles:true}));return;
      }
    }
    if(beginBoss(game,now))return;
    if(options.autoPatents){
      const choice=choosePatent(game);
      if(choice){const store=ensureStore('bt',now);if(!store)return;const button=all('[data-pat]',store).find(b=>b.dataset.pat===choice.id);
        if(visible(button)&&enabled(button))startPurchase('patent',{...choice,button},game,now);return;}
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
    if(options.autoHardware||options.autoLab)buyFood(game,now);else state.manageNote='Food Bit purchases off';
  }
  function paint(now, fallback = 'Running') {
    if (now - state.lastPaint < 150) return;
    state.lastPaint = now;
    const game = getGame(now), payout = payoutInfo(game);
    if (options.ignoreInvalidNumbers) showHealth(gameNumberIssue(game,now));
    state.shipNote = !options.autoShip ? 'Auto-shipping off' : !payout ?
      (game?.payout ? 'The game returned invalid shipping numbers; check the shipping panel' : 'Waiting for shipping stats') :
      payout.capOverflow && options.shipMode === 'percent' ? 'Percentage target exceeds the browser number range. Choose "as soon as eligible" to keep shipping.' :
      (payout.royalty>1?'Ship target before Royalties: ':'Ship target: ') + payout.pay + ' / ' + payout.target + ' Transistors · cap ' + (payout.capOverflow ? 'beyond browser number range' : payout.cap) +
      (payout.royalty>1?' · actual payout '+payout.reward:'') +
      (payout.target > payout.cap ? ' (minimum exceeds this cap)' : '');
    if (state.running) status(state.shipping || state.pending ? state.manageNote || 'Waiting for the game' :
      !['autoClick','autoType','autoRepair','autoBoss','autoHardware','autoLab','autoBreakthrough','autoShip','autoPatents','autoIpo','autoHackathons'].some(key => options[key]) ? 'Idle — enable an activity below' : fallback);
    const counts = [[state.taps,'Tap attempts'],[state.submissions,'Sprint attempts'],[state.repairLines,'Repair attempts'],[state.hardwareUnits,'Hardware bought'],[state.attempts,'Lab purchases'],[state.breakthroughBuys,'Breakthroughs'],[state.bosses,'Bosses won'],[state.ships,'Shipments'],[state.patentBuys,'Patents bought']];
    ui.getElementById('counts').innerHTML = counts.map(([n,label]) => '<div class="stat"><strong>' + n.toLocaleString() + '</strong>' + label + '</div>').join('');
    ui.getElementById('upgrade').textContent = state.running || state.pending ? state.manageNote :
      'Lab purchases: ' + (!options.autoLab ? 'off' : options.labBuyMode === 'all' ? 'all affordable upgrades' : 'best active value');
    ui.getElementById('breakthroughStatus').textContent = !options.autoBreakthrough ? 'Breakthrough buying off' : state.running ? state.btNote :
      'Breakthroughs: buy all, useful first · keep ' + options.reserveTransistors + ' Transistors';
    ui.getElementById('shippingStatus').textContent = state.shipNote;
    const level=game?.lab.stats?.coders?.reduce((best,c)=>Math.max(best,c.level||1),1)||1;
    ui.getElementById('progressStatus').textContent=game?.lab ? 'Gen '+game.lab.pp.gen+' · bosses '+(game.lab.gate||0)+'/'+(game.settings.GATES?.length||0)+
      ' · Commits '+(game.lab.commits?.length||0)+'/'+(game.settings.COMMITS?.length||0)+' · top coder Lv '+level+
      (game.lab.hack?.on?' · challenge: '+game.lab.hack.on:'')+' · IPOs '+(game.lab.ipo?.n||0)+' · Patents '+(game.lab.ipo?.patents||0):'Open The Lab to read progress';
    if(game?.settings.HACKATHONS)ui.getElementById('progressStatus').textContent+=' · Hackathons '+Object.values(game.lab.hack?.done||{}).filter(Boolean).length+'/'+game.settings.HACKATHONS.length;
  }
  function tick() {
    if (!state.running) return;
    if(state.nativeMarker)state.nativeMarker.hidden=true;
    const now = performance.now();
    if (document.hidden) {
      state.generation++; resetLine(now); status('Waiting for the game tab to be visible'); return;
    }
    try {
      const game = getGame(now);
      pollPending(game,now); if (!state.running) return;
      if(game?.lab.hc?.need || visible(document.getElementById('hcInput'))){
        stop('Human check: complete “Still coding?” yourself, then Start');
        ui.getElementById('healthBox').hidden=false;ui.getElementById('healthTitle').textContent='Human verification needs you';
        ui.getElementById('healthDetail').textContent='The game paused taps for its Still coding? check. Enter that line yourself; the macro will not type or submit it. Select Start afterward.';return;
      }
      const numberIssue = gameNumberIssue(game,now);
      if (numberIssue && !options.ignoreInvalidNumbers) {
        showHealth(numberIssue,'Automation is paused. Reduce active pets or boosts, then use Check numbers again. The game owner may need to repair an invalid save.');
        stop('Paused: the game’s numbers are invalid'); return;
      }
      if (options.autoShip && options.stopGeneration > 0 && Number(game?.lab.pp?.gen) >= options.stopGeneration) {
        stop('Reached generation ' + game.lab.pp.gen + ' — your pause point is ' + options.stopGeneration); return;
      }
      if(state.resetFlow){if(game)manageResetFlow(game,now);paint(now,'Preparing reset');return;}
      if(leaveBossForShipping(game,now)){paint(now,'Leaving boss fight for shipping');return;}
      if(handleBosses(game,now)){paint(now,'Boss fight');return;}
      if(game && !state.pending && !state.shipping && !game.networkBusy && shippingOpportunity(game,now) &&
          !all('.modal,[role="dialog"],dialog[open]').some(visible)){
        state.lastManage=now;manageAutomation(game,now);
        if(state.resetFlow){paint(now,'Preparing reset');return;}
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
      if (options.autoType && game?.lab.hack?.on!=='nosprint' && input && prompt) typeLine(input,prompt,now);
      if (!state.running) return;
      if (options.autoClick && game?.lab.hack?.on!=='notap' && !state.pending && !nativeBusy() && visible(tap) && enabled(tap) && now - state.lastTap >= options.tapIntervalMs) {
        if(game?.requiresNativeTap)nativeTapMarker(tap,now,game);
        else {tapControl(tap); state.lastTap = now; state.taps++;}
      }
      paint(now,options.autoType && state.phase === 'typing' ? 'Typing ' + state.index + '/' + state.chars.length : 'Running');
    } catch (error) { stop('Stopped: ' + error.message); }
  }

  ui.getElementById('toggle').onclick = toggle;
  ui.getElementById('close').onclick = () => { stop();state.nativeMarker?.remove();document.removeEventListener('pointerdown',recordNativeTap,true);host.remove();delete window.__gachaLabMacro; };
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
      refresh:typeof labRefresh==='function'?labRefresh:null,
      receivedAt: typeof Lab !== 'undefined' ? Lab.recv : null,
      networkBusy: typeof Lab !== 'undefined' ? !!(Lab.busy || Lab.sprintBusy || Lab.squashing) : false,
      uncreditedTaps:typeof Lab!=='undefined'?Math.max(0,Number(Lab.pending)||0)+Math.max(0,Number(Lab.inflight)||0):0,
      requiresNativeTap:typeof labTap==='function'&&/\.\s*isTrusted\b/.test(Function.prototype.toString.call(labTap)) };
  } catch { return null; }
});
