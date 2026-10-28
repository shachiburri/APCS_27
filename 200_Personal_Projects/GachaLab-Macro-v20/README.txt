GACHA LAB MACRO v20 - AutoHotkey v2

BOSSES WHILE WAITING FOR SHIPPING
Bosses run while the shipping target is far away, including in earliest mode.
Wait for shipping if within (seconds), in Activities, defaults to 10 seconds.
Within that estimated window, the macro defers a new fight but continues farming
and purchases. With 0, it only defers a fight when shipping can proceed now.
The estimate uses the actual spending gate and payout target, available and
unflushed earnings, current production/combo, and potential credited tap rate.
It is approximate: purchases and changing combos can change the time remaining.
If shipping becomes possible during an automated battle, the macro waits for
any submitted line, closes the fight using the game's Close button, waits for
the quit confirmation, then prepares the shipment. An abandoned fight does not
award its victory/unlock; shipping resets those gates anyway.
Unflushed tap earnings are included when checking whether available funds can
reach the target, then synced before they are spent. Game payout requirements,
extra-spending settings, generation pause points and human-check pauses remain.
Ready shipping also takes priority over opening a new optional pet repair.
The minimum payout includes Royalties. Percentage targets continue using the
game's displayed base cap before that bonus; status shows the actual reward too.

UPDATE TO v20
The original four v20 HTML saves contained the same game scripts; the current
fix also uses the latest Gacha!.html revision. The store has
Hardware, Upgrades, Breakthroughs, and Commits tabs. This version adds Hardware
batches/milestones, boss fights, languages, XP/Commit progress, the two buying
bots, optional Hackathons, optional IPOs, and automatic Patent purchases.
Hardware buying, boss fighting and Patent buying start ON for a new setting.
Automatic Hackathon starts and IPOs start OFF. Existing saved options are kept.
Relaunch GachaLab.ahk before using v20: it now supplies real mouse taps because
the game rejects scripted pointer events. Refresh the page, then press F8.

START HERE
1. Keep GachaLab.ahk and GachaLab.js in the same folder.
2. Run/relaunch GachaLab.ahk with AutoHotkey v2, including when updating from v19.
3. Refresh the game to remove an older helper, then open The Lab in Chrome or Edge.
4. Press F8 to load the panel and start the remembered activities.
5. Pause before changing several options if you want to review them first.

F8 = Start / pause. F9 = Pause with the game tab selected.
Start/Pause is also at the top of the panel. Close stops new automation and
removes the panel. A game request already sent can still finish after pausing.
Drag the title to move the panel. Compact view hides settings while keeping
status, counters, warnings and Start/Pause visible. Show settings restores them.
Groups open and close when you select their heading. Settings scroll separately
from the fixed top controls, including on short screens.

EXISTING SETTINGS
Your previous activity switches, shipping mode, budgets and learned typing
limits are preserved. Timing is now displayed in SECONDS: an existing 1500 ms
repair minimum appears as 1.5 seconds and has the same effect.
Settings save in this browser. Number edits apply when you leave the field;
switches and dropdowns apply immediately. A blank number restores its old value.
Timing edits affect the next line. Panel position and session counters reset
when the helper reloads. Compact view is remembered. Fresh installations start
with farming/purchases on, auto-shipping off, and extra pre-shipping spending off.

QUICK SETUPS
These are optional shortcuts; they are never applied automatically.
Select one to read its description, then Apply. Applying does not start a paused
macro. If already running, the new switches take effect immediately.
- Farm without shipping: tapping, Sprint, repairs, bosses and purchases on;
  active-value regular upgrade selection; shipping, IPOs and Hackathon starts off.
- Fast generations: activities/purchases on; earliest shipping on; no extra
  minimum payout; no extra balance spending; all-affordable regular buying.
  This enables chip resets, but turns IPOs and Hackathon starts off.
- Only tap: tapping on; every other activity, purchase and reset off.
All three keep your timing values, Transistor reserve and generation pause point.
Other individual controls remain available after applying a setup.

ACTIVITIES
Tap automatically
  Sends Tap! attempts continuously, subject to your seconds-between-taps setting.
  The game caps credited taps, so the attempt counter is not guaranteed income.
Type Code Sprint
  Detects and types the displayed code. Line timing adapts to speed warnings.
  It does not paste the entire line at once or use catch-up character bursts.
Repair broken pets
  Opens Squash me!, types a repair if needed, then returns to farming.
  It works independently of Sprint typing. A repair interruption can cost a combo.
  With repairs off, manual repair popups block other automation behind them.
Fight Merge Conflict bosses
  Automatically opens eligible boss fights, types every displayed line, and
  closes the result. Six bosses unlock progressively higher Hardware/upgrade
  tiers. Boss lines grant coder XP. After two failed fights the macro pauses.
  Turn it off to leave boss dialogs for manual play. A ready shipping target
  takes priority over starting or continuing an automated fight. Both earliest
  and percentage modes allow fights while the target is far away. Separate
  timing is used for boss code lines.
Wait for shipping if within (seconds)
  Requires boss fighting and auto-shipping. Default 10; allowed range 0-300.
  Defers a new boss only while shipping is estimated that close. Set 0 to allow
  fights until shipping can proceed immediately. Unknown estimates allow boss
  fights rather than waiting forever. The minimum spending gate still applies
  even if only one Transistor is requested; estimated funds do not bypass it.
Coding language
  Keep current leaves the game's language choice alone. Otherwise applies your
  selected language through its own menu. Java, Python, JavaScript, C++, C#,
  HTML/CSS, SQL, Swift, Go, Rust and Kotlin are supported. All typing reads the
  actual displayed prompt rather than assuming every activity uses Java.

REAL MOUSE TAPPING AND HUMAN CHECKS
The updated game ignores synthetic pointer events. The updated AutoHotkey file
looks for a tiny, precisely colored Tap-ready marker drawn by the page helper
at the unobstructed Tap! button. It sends a real mouse click and restores the
pointer. The marker is hidden while paused, busy, in another tab, in popups,
during No Mouse challenges, or when the game page does not have focus.
Keep the game focused and visible. Pause before doing other mouse work. The
game still limits credited taps even if more attempts are sent. The OS click
timer is not the same as the former synthetic browser click loop.
After enough credited taps, the game asks "Still coding?". The macro PAUSES
without typing or submitting that human-verification line. Complete it yourself,
then press Start/F8. Ignore invalid numbers does not disable this behavior.

UPGRADE PURCHASES
Buy Hardware
  Purchases unlocked machines using the game's native buttons. The rate model
  includes their output, Coder Power, Fiber Internet and count milestones.
  Owning 25, 50, 100, 150, 200, 300, 400 and 500 of a type doubles that type's
  output at each listed milestone. Higher types require boss gates.
Hardware per purchase
  One, up to 10, or Max. Max buys up to 1,000 affordable units per game request.
  Smaller buttons are used near a count cap or bounded pre-shipping budget.
Maximum of each machine
  0 is unlimited. A positive value caps this macro's count for each type.
  The game's Purchasing Bot can independently buy beyond this macro cap.
  Hardware is disabled during the Unplugged challenge and resets on shipping.
  In All affordable Lab mode, regular upgrades get the first purchase choice,
  and Hardware uses the remaining balance. Best active value compares regular
  upgrade gains against Hardware batch gains per Food Bit instead.
Buy Lab upgrades
  Uses Food Bits to buy regular levels. One action waits for the previous game
  response; there is no fixed purchase cooldown or unsupported bulk API call.
What to buy
  All affordable: buys every unlocked affordable level, including offline-only
  upgrades. Largest affordable purchases go first. Useful when very rich.
  Best active value: estimates additional active income per Food Bit. It skips
  Night Shift/Nap Pods and zero-income upgrades. It can wait up to 30 seconds for
  a better target instead of immediately buying a weaker affordable one.
Buy all Breakthroughs - useful first
  Buys the highest-priority affordable upgrade until every known Breakthrough
  reaches its maximum level, as long as you earn enough Transistors and retain
  the switch on. No upgrade is permanently excluded for having no income benefit.
  Estimated income improvements come first. Remaining utility/slot/rebuild
  upgrades follow, then typing-time/offline bonuses, with the cosmetic Museum
  last when everything is affordable. New slots still need pets/mentors equipped
  manually; buying a slot does not fill it for you.
  It does not idle for an unaffordable favorite while another remaining upgrade
  is affordable. If none fit the budget, it shows the next cost and available
  balance after your reserve, then resumes when more Transistors arrive.
  When all levels are maxed, other selected activities keep running.
  Purchasing Bot and Upgrade Bot are now included: 18 types / 95 total levels
  in this saved update. Their built-in purchases run independently of this
  helper's purchase switches, ordering and Hardware cap.
Keep this many Transistors
  Reserves that amount from automatic Breakthrough purchases. 0 means no reserve.
  Requires Breakthrough buying. It does not change your shipping payout target.
  The update also grants a passive bank bonus: +0.1% production per held
  Transistor, up to 1,000 counted, before the additional Transistor Interest
  bonus. The native calculator includes the lost bonus when evaluating a
  purchase. Larger reserves preserve income but delay buying remaining upgrades.
Prioritize faster rebuilds
  Requires both Breakthrough buying and auto-shipping. Includes next-generation
  rebuilding benefits, notably Cache Memory and Fab Plant, in upgrade ranking.
  Turning this off reduces their priority; they can still be bought later.
  It is a heuristic, not a guarantee of an optimal long-term purchase order.

How usefulness is estimated
  The saved game's own pure rate calculator is evaluated on copies of your Lab.
  Active estimates assume a x10 maintained Sprint when typing is enabled and
  15 credited manual taps per second (or the configured game cap) when tapping
  is enabled. These are planning estimates, not measurements of server credit.
  Robotic Arm is evaluated independently of manual tapping. Spending Transistors
  accounts for the resulting loss of Transistor Interest. Empty extra slots do
  not count as production until equipped. Upgrades with no modeled income gain
  still remain in the completion queue. If income cannot be estimated, selection
  falls back to upgrade-type priority instead of waiting for production stats.
  With rebuild priority enabled, ranking weights current benefit 65% and rebuilt benefit
  35%, with an allowance for Fab Plant's lower shipping spending requirement.

GENERATION SHIPPING
Ship generations automatically
  Explicitly allows generation resets. Shipping resets Food Bits, most regular
  upgrades, Hardware, bosses, and the run's leaderboard score. Pets, cards,
  mentors, coder XP/levels, Commits, Transistors, Bytes and Breakthroughs stay.
  Cache Memory retains some regular levels; Hardware and bosses start over.
  Turning this off cancels unconfirmed shipping popups. It cannot undo a reset
  request already sent to the game.
When to ship
  As soon as eligible: ships when the game offers a payout AND your optional
  minimum is met. This is the fastest-reset mode.
  Percentage: waits for the chosen percentage of the current Transistor cap AND
  your optional minimum. Example: 50% of a cap of 30 requires at least 15.
Percentage of the cap
  Only used in percentage mode. Targets round up to a whole Transistor.
  Higher percentages take much longer because of diminishing returns; high
  generation targets may be unreachable with the game's finite upgrade list.
Minimum Transistors per shipment
  An additional condition for either mode. 0 adds no extra minimum.
  Example: earliest + minimum 20 waits for a payout of at least 20.
  Royalties count toward this minimum. A base payout of 10 with level-4
  Royalties pays 20 and qualifies immediately. Percentage targets use the
  baseline cap displayed by the game, before the Royalties multiplier.
Spend extra Food Bits before shipping
  OFF (default): buys only until the chosen target is reached, then ships.
  ON: spends a snapshot of the available balance on Hardware and regular upgrades,
  including offline upgrades. New income does not endlessly extend that budget.
  This intentionally delays an already eligible reset.
  Upgrade prices can leave an unspendable remainder; exact zero is not guaranteed.
  The macro does not wait to earn funds for future purchases during spend-down.
Pause at generation
  0 means no generation limit. Otherwise ALL automation pauses at or beyond that
  generation while auto-shipping is on. Starting again at the same generation
  remains paused until you raise/clear the limit or turn auto-shipping off.
  Example: 1900 permits the shipment from 1899 to 1900, then pauses.
  This is an optional stopping point, not a guarantee against earlier overflow.

Important interaction: shipping eligibility is based on FOOD BITS SPENT on
Hardware and regular upgrades, not simply the current balance. Auto-shipping
can buy needed items even if normal Hardware/Lab buying switches are off. Once its
target is ready, shipping takes priority over ordinary purchases and the
Breakthrough queue. Buying all remaining Breakthroughs continues afterward.

HACKATHONS, IPOs, PATENTS, LEVELS AND COMMITS
Complete unfinished Hackathons
  OFF initially; requires auto-shipping. Starting one resets this run without
  paying Transistors. Shipping with its rule finishes it and keeps the reward.
  The macro attempts unfinished rules in this order: No Mouse, Back to Basics,
  Tiny Startup, Unplugged, Silent Lab. It skips starting a run if its current team
  would have no modeled way to earn. It does not automatically rearrange pets.
  No Mouse: no manual taps or Robotic Arm income.
  Back to Basics: the game's model filters coders to Common/Rare.
  Tiny Startup: the game limits the team to two desks.
  Unplugged: Hardware makes nothing and is not bought.
  Silent Lab: Sprint typing is disabled; other permitted activities can continue.
  Starting challenges unlocks at the configured generation (2 in this update)
  or after an IPO. Only unfinished known challenges are automatically selected.
Go public automatically (IPO)
  OFF initially. A deeper reset: generations, Transistors, Breakthroughs,
  Hardware and regular upgrades start over. Pets/cards/Bytes, XP/levels, Commits,
  Hackathon rewards, and Patents are retained according to the game's dialog.
  Keep the Bots can retain the two buying bots. Active Hackathons finish first.
IPO at or after generation / Minimum Patents from IPO
  Both requirements and the game's unlock must be met. The supplied client
  displays floor(sqrt(all-time Transistors earned)/3) Patents. The macro uses
  that displayed calculation and confirms only its own current IPO dialog.
  Your generation pause point is checked before any automatic reset.
Buy all Patents - useful first
  ON initially; independent of automatic IPOs. Buys affordable Brand Value,
  Faster Moore's Law, Royalties, Seed Funding, Headquarters and Keep the Bots.
  Uses native rate gains plus planning priority for shipping/rebuild bonuses.
  It does not automatically fill new desks. Reserve Patents sets an unspent
  balance exactly like the separate Transistor reserve.
Coder XP and Commits
  The game grants passive XP and bonus XP for Sprint, bosses and pet repairs.
  Levels reach up to 99, increase coder strength, and persist across resets.
  Commits are awarded automatically for their conditions; no claim button exists.
  Each adds the configured +2% permanent production. Progress is shown in the
  panel. Schoolwork and collection Commits still require those actual activities;
  the macro does not turn in schoolwork or buy unrelated collectibles.
Reset all Lab progress
  Never automated. No option in this macro confirms that destructive full reset.

TYPING AND TAPPING SPEED
Minimum seconds per Sprint line / repair line
  Minimum duration for the WHOLE line. Characters are spread across that time.
  Long lines and learned speed-warning timing can require longer. Repair timing
  is separate because the game can use different repair checks. Reducing Sprint
  time does not reduce repair time. Both fields allow 0.1 to 60 seconds.
Minimum seconds per boss line
  Separate minimum and separate learned warnings for timed boss fights. Long
  lines can need longer than the selected minimum. Supports 0.1 to 60 seconds.
Seconds between taps
  0 = fastest available tapping rate; 0.1 = at most 10 attempts/second.
  This does not override the game's credited-tap limit.
Speed warnings
  Cause a 5-second cooldown and slower learned timing. After two unsuccessful
  slower retries, the macro pauses. Learning is saved across page refreshes.
  The final matching character waits until the required line duration is met,
  because the game can auto-submit on input. No intentional gap is added between
  accepted lines. Server requests can still delay purchases or code submission.

GAME-NUMBER WARNINGS AND OVERRIDE
Ignore invalid numbers is in Help and game-number limits. It is OFF by default.
ON disables automatic pauses for invalid balances/production rates and skips the
predicted-overflow block before purchases or shipping. It is remembered across
refreshes. A visible reminder remains while enabled, including in compact view.
Enabling it does not restart a paused macro; select Start to continue.
It cannot repair the save, restore zero income, or make unavailable actions work.
Game-button availability, actual shipping-payout requirements, the generation
pause point, speed warnings, request confirmation and timeouts still apply.
Active-value Lab purchasing may still be unable to rank upgrades with invalid
rates. Breakthrough buying falls back to upgrade-type priority in that case.
Turn it off to restore the automatic number checks. If running with invalid
numbers, the macro will pause on its next check.

The game uses ordinary JavaScript numbers, whose largest finite value is about
1.8e308. Very high generations/boosts can exceed this. Transferred invalid values
can appear as null or 0 in the page. The macro cannot repair that save or change
the game's arithmetic.
With the override OFF, the macro checks balances and recomputes current rates. It
pauses before inputs when invalid values are found. It also checks the rates
predicted after a proposed regular purchase, Breakthrough purchase, or shipment,
and pauses before sending an action that would make those rates invalid.
These checks do not guarantee that all future accumulation or server arithmetic
will remain valid. They use the saved game's available client rate model.
Use Check numbers again after reducing active pets/boosts or repairing the save.
This only checks; it does not automatically restart. Select Start when ready.
A damaged balance may still need the game owner to repair/restore the save.

The generation cap itself overflows at generation 1743 with the saved game's
configuration. Earliest shipping can continue when its actual payout and rates
remain valid. Percentage mode explains an unrepresentable cap and waits instead
of silently switching modes. Invalid actual payouts never qualify for shipping.

STATUS AND COUNTERS
The top badge shows Running or Paused. The main status explains the current
activity, waiting condition, pause point, or error. With all activities off, the
macro is idle until you enable one. The purchase and shipping summaries show
what the macro is configured to do, including while paused.
Tap, Sprint and repair counters count input attempts. Purchase and shipment
counters require confirmed game-state changes. They cover this helper session.
A game request without confirmation after 15 seconds pauses automation to avoid
repeating a purchase or potentially irreversible reset.

Keep the game tab visible and the browser unminimized. Other game popups block
background farming. Closing AutoHotkey alone does not stop a helper already
running in the page; use F9, Pause, Close, or refresh the page.

VALIDATION
Local browser simulations use the saved game's actual rate/payout functions.
Checks cover independent activities, repairs, budgets, fast bulk purchases,
shipping targets, optional full spending, repeated/high generations, pausing,
settings migration, keyboard controls, seconds conversion, presets, compact view,
generation limits, invalid/null rate detection, blocking predicted overflowing
purchases/shipments, and the optional bypass for these number checks. Override
tests cover current errors, predicted purchases/shipments, turning it off,
persistence, and preserving payout requirements and generation pause points.
Completion tests buy all 95 levels across the 18 saved Breakthrough types,
verify useful-first ordering, resume after funding, preserve reserves, continue
other activities after completion, and handle zero/invalid income estimates.
Panel layouts are inspected at normal and short viewports.
The v20 suite uses the supplied native four-tab store, boss dialogs and reset
confirmation handlers with simulated server responses. It covers batch buying,
caps, milestones, gated purchases, new upgrades/bots, all six Patent types, all
11 languages, all six bosses, all five challenges, IPO thresholds/cancellation,
bounded spend-down and leaving human verification untouched. Native mouse input
is checked in the local browser and the AHK script is syntax-checked; real desktop
pixel scanning/clicking and live-account server behavior were not exercised.
No live account purchases or shipments were used for these checks. Future game
updates can change selectors, rates or rules and require another macro update.
