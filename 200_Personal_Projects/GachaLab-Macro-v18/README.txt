GACHA LAB MACRO v18 - AutoHotkey v2

START HERE
1. Keep GachaLab.ahk and GachaLab.js in the same folder.
2. Run GachaLab.ahk with AutoHotkey v2.
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
- Farm without shipping: tapping, Sprint, repairs and purchases on; active-value
  regular upgrade selection; auto-shipping off.
- Fast generations: all activities/purchases on; earliest shipping on; no extra
  minimum payout; no extra balance spending; all-affordable regular buying.
  This explicitly enables automatic generation resets.
- Only tap: tapping on; typing, repairs, purchases and shipping off.
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

UPGRADE PURCHASES
Buy Lab upgrades
  Uses Food Bits to buy regular levels. One action waits for the previous game
  response; there is no fixed purchase cooldown or unsupported bulk API call.
What to buy
  All affordable: buys every unlocked affordable level, including offline-only
  upgrades. Largest affordable purchases go first. Useful when very rich.
  Best active value: estimates additional active income per Food Bit. It skips
  Night Shift/Nap Pods and zero-income upgrades. It can wait up to 30 seconds for
  a better target instead of immediately buying a weaker affordable one.
Buy useful Breakthroughs
  Uses Transistors for permanent upgrades with estimated benefits for your setup.
  It may save for a much better future upgrade. It does not blindly spend the
  entire balance, buy cosmetics, or fill newly unlocked pet/mentor slots for you.
Keep this many Transistors
  Reserves that amount from automatic Breakthrough purchases. 0 means no reserve.
  Requires Breakthrough buying. It does not change your shipping payout target.
Consider faster rebuilds
  Requires both Breakthrough buying and auto-shipping. Includes next-generation
  rebuilding benefits, notably Cache Memory and Fab Plant, in upgrade ranking.
  It is a heuristic, not a guarantee of an optimal long-term purchase order.

How usefulness is estimated
  The saved game's own pure rate calculator is evaluated on copies of your Lab.
  Active estimates assume a x10 maintained Sprint when typing is enabled and
  15 credited manual taps per second (or the configured game cap) when tapping
  is enabled. These are planning estimates, not measurements of server credit.
  Robotic Arm is evaluated independently of manual tapping. Spending Transistors
  accounts for the resulting loss of Transistor Interest. Empty extra slots do
  not count as production until equipped. Extra Sprint time/offline/cosmetic
  bonuses are skipped when they add no modeled benefit for the macro.
  With rebuilds enabled, ranking weights current benefit 65% and rebuilt benefit
  35%, with an allowance for Fab Plant's lower shipping spending requirement.

GENERATION SHIPPING
Ship generations automatically
  Explicitly allows generation resets. Shipping resets Food Bits, most regular
  upgrades, and the run's leaderboard score. Pets, cards, mentors, Transistors,
  Bytes and Breakthroughs stay. Cache Memory retains some regular levels.
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
Spend extra Food Bits before shipping
  OFF (default): buys only until the chosen target is reached, then ships.
  ON: continues buying all currently affordable regular upgrades before shipping,
  including offline upgrades. This intentionally delays an already eligible reset.
  Upgrade prices can leave an unspendable remainder; exact zero is not guaranteed.
  The macro does not wait to earn funds for future purchases during spend-down.
Pause at generation
  0 means no generation limit. Otherwise ALL automation pauses at or beyond that
  generation while auto-shipping is on. Starting again at the same generation
  remains paused until you raise/clear the limit or turn auto-shipping off.
  Example: 1900 permits the shipment from 1899 to 1900, then pauses.
  This is an optional stopping point, not a guarantee against earlier overflow.

Important interaction: shipping eligibility is based on FOOD BITS SPENT on
regular upgrades, not simply the current balance. Auto-shipping can buy the
upgrades needed to meet its target even if normal Lab buying is off. Once its
target is ready, shipping takes priority over ordinary purchases and the
Breakthrough queue. Useful Breakthrough buying continues afterward.

TYPING AND TAPPING SPEED
Minimum seconds per Sprint line / repair line
  Minimum duration for the WHOLE line. Characters are spread across that time.
  Long lines and learned speed-warning timing can require longer. Repair timing
  is separate because the game can use different repair checks. Reducing Sprint
  time does not reduce repair time. Both fields allow 0.1 to 60 seconds.
Seconds between taps
  0 = fastest browser timer rate; 0.1 = at most 10 attempts/second.
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
Active-value purchasing may still be unable to rank upgrades with invalid rates.
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
Panel layouts are inspected at normal and short viewports.
No live account purchases or shipments were used for these checks. Future game
updates can change selectors, rates or rules and require another macro update.
