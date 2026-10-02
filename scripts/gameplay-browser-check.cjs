async page => {
  // Run with playwright-cli run-code --filename scripts/gameplay-browser-check.cjs.
  // Seed only the public random source. Calls are drawn/applied through UI controls;
  // simulation state, outcomes, downs and yardage are never injected into React.
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const check = (condition, message) => { if (!condition) throw new Error(message); };
  const near = (a, b, epsilon = .15) => Math.abs(a - b) < epsilon;
  const base = 'http://127.0.0.1:5173/';
  const game = () => page.locator('.tactical-draft:visible');
  const field = () => game().locator('.draft-field');
  const node = id => game().locator(`.draft-receiver[data-receiver-id="${id}"]`);
  const selectedPath = () => game().locator('.draft-route.selected > path');
  const packageName = id => id === 'empty' ? '5-wide' : `${id} personnel`;
  const origin = path => (path.match(/^M\s+([-\d.]+)[ ,]+([-\d.]+)/) || []).slice(1).map(Number);
  const point = async locator => locator.evaluate(element => ({ x: +element.getAttribute('cx'), y: +element.getAttribute('cy') }));
  const playerPoint = id => point(node(id).locator('.draft-o'));
  const screen = async p => field().evaluate((svg, p) => { const v = new DOMPoint(p.x, p.y).matrixTransform(svg.getScreenCTM()); return { x: v.x, y: v.y }; }, p);
  async function drag(from, to) {
    await field().scrollIntoViewIfNeeded();
    const start = await screen(from), end = await screen(to);
    await page.mouse.move(start.x, start.y); await page.mouse.down();
    await page.mouse.move(end.x, end.y, { steps: 12 }); await page.mouse.up();
  }
  async function open(mode = 'draft', seed = 42) {
    const url = `${base}?qaSeed=${seed}&qaMode=${mode}#${mode}`;
    if (page.url() === url) await page.reload();
    else await page.goto(url);
    await game().getByRole('combobox', { name: 'Offensive formation' }).waitFor();
  }
  async function choosePackage(id, formation) {
    await game().getByRole('group', { name: 'Offensive personnel' }).getByRole('button', { name: new RegExp(`^${packageName(id)}`) }).click();
    if (formation) await game().getByRole('combobox', { name: 'Offensive formation' }).selectOption(formation);
  }
  async function choosePlayer(id) { await game().getByRole('group', { name: 'Select a receiver' }).getByRole('button', { name: id, exact: true }).click(); }
  async function preset(id, name) {
    await choosePlayer(id);
    await game().getByRole('button', { name: name === 'Block' ? 'Stay in' : name, exact: true }).click();
  }
  async function snap() {
    await game().getByRole('button', { name: 'SNAP', exact: true }).click();
    await game().locator('.draft-result').waitFor();
  }
  async function setTimeline(value) {
    const slider = game().getByRole('slider', { name: 'Game play progress' });
    await slider.focus();
    await page.keyboard.press(value === 0 ? 'Home' : 'End');
  }
  async function resultState() {
    return { strip: await game().locator('.drive-strip').getAttribute('aria-label'), history: await game().locator('.drive-history').innerText() };
  }
  async function controlsFit(width) {
    const clipped = await game().locator('button, input, select, .draft-context-caption, .draft-context-caption > span, .route-depth').evaluateAll(nodes => nodes.filter(n => n.getClientRects().length).map(n => ({ label: n.getAttribute('aria-label') || n.textContent.slice(0, 60), left: n.getBoundingClientRect().left, right: n.getBoundingClientRect().right })).filter(n => n.left < -1 || n.right > document.documentElement.clientWidth + 1));
    check(clipped.length === 0, `${width}px visible controls/captions are clipped: ${JSON.stringify(clipped)}`);
  }
  await page.addInitScript(() => {
    const params = new URL(location.href).searchParams, seed = Number(params.get('qaSeed'));
    if (params.has('qaSeed')) Math.random = () => (seed + .25) / (params.get('qaMode') === 'drive' ? 4294967296 : 2147483647);
  });
  await page.setViewportSize({ width: 1440, height: 1050 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open();

  const formations = await page.evaluate(async () => {
    const engine = await import('/src/game/engine.ts');
    return ['10', '11', '12', 'empty'].flatMap(personnel => engine.formationsFor(personnel).map(formation => ({ personnel, formation: formation.id, receivers: engine.receiversFor(personnel, formation.id), qb: engine.qbStartFor(personnel, formation.id) })));
  });
  for (const expected of formations) {
    await choosePackage(expected.personnel, expected.formation);
    const shown = await game().locator('.draft-receiver').evaluateAll(nodes => nodes.map(n => ({ id: n.getAttribute('data-receiver-id'), role: n.getAttribute('aria-label'), x: +n.querySelector('.draft-o').getAttribute('cx'), y: +n.querySelector('.draft-o').getAttribute('cy') })));
    check(shown.length === 6 && await game().locator('.draft-line .draft-position').count() === 5, `${expected.personnel}/${expected.formation}: eleven offensive players`);
    check(await game().locator('[aria-label="Eleven defenders"] .draft-position').count() === 11, `${expected.personnel}/${expected.formation}: eleven defenders`);
    for (const receiver of expected.receivers) {
      const actual = shown.find(n => n.id === receiver.id);
      check(actual.role.includes(receiver.role) && near(actual.x, receiver.start.x) && near(actual.y, receiver.start.y), `${expected.personnel}/${expected.formation}/${receiver.id}: role and alignment match`);
    }
    check(shown.filter(n => n.y === 379).length === 2, `${expected.personnel}/${expected.formation}: two eligible ends plus five linemen`);
    const qb = shown.find(n => n.id === 'QB');
    check(near(qb.x, expected.qb.x) && near(qb.y, expected.qb.y), `${expected.personnel}/${expected.formation}: quarterback alignment`);
  }

  await choosePackage('10', 'bunch-left');
  const bunchLeft = await Promise.all(['Y', 'Z', 'H'].map(playerPoint));
  await game().getByRole('combobox', { name: 'Offensive formation' }).selectOption('bunch-right');
  const bunchRight = await Promise.all(['Y', 'Z', 'H'].map(playerPoint));
  check(bunchLeft.every((p, i) => near(p.x + bunchRight[i].x, 720)), 'Bunch left and right mirror all three receivers');
  await choosePackage('11', 'spread');
  const frozen = await playerPoint('X');
  for (const name of ['Out', 'Comeback']) {
    await preset('X', name);
    const initial = await selectedPath().getAttribute('d');
    const handle = game().locator('.route-handles [data-route-handle]').first();
    const before = await point(handle.locator('.route-handle-dot'));
    await drag(before, { x: before.x + 24, y: before.y - 36 });
    const after = await selectedPath().getAttribute('d');
    check(initial !== after, `${name} bend drag changes the rendered route`);
    check(origin(after).every((v, i) => near(v, [frozen.x, frozen.y][i])), `${name} handle preserves route origin`);
    const slider = game().getByRole('slider', { name: 'Route depth' });
    await slider.focus();
    for (let i = 0; i < 6; i++) await page.keyboard.press('ArrowRight');
    const depthPath = await selectedPath().getAttribute('d');
    check(depthPath !== after && origin(depthPath).every((v, i) => near(v, [frozen.x, frozen.y][i])), `${name} depth control changes route and preserves origin`);
  }

  await choosePlayer('QB');
  await game().getByRole('button', { name: 'Roll right', exact: true }).click();
  check(await game().locator('.rollout-restriction').count() === 1, 'QB preset shows across-body restriction');
  const qbOrigin = await playerPoint('QB');
  const qbPresetPath = await selectedPath().getAttribute('d');
  check(origin(qbPresetPath).every((v, i) => near(v, [qbOrigin.x, qbOrigin.y][i])), 'QB preset starts at actual quarterback');
  await drag(qbOrigin, { x: qbOrigin.x - 135, y: qbOrigin.y - 32 });
  const qbDrawn = await selectedPath().getAttribute('d');
  check(qbDrawn !== qbPresetPath, 'Quarterback can draw a custom rollout');
  await snap();
  const qbAfter = await playerPoint('QB');
  check(qbAfter.x < qbOrigin.x - 35, 'Simulated quarterback follows the custom left rollout');
  await setTimeline(0);
  const resetQB = await playerPoint('QB');
  check(near(resetQB.x, qbOrigin.x) && near(resetQB.y, qbOrigin.y), 'Review scrub restores quarterback to pre-snap origin');

  await open('draft', 9);
  await game().getByRole('button', { name: 'Run', exact: true }).click();
  await game().getByRole('combobox', { name: 'Run scheme' }).selectOption('Power');
  const powerPath = await selectedPath().getAttribute('d');
  await game().getByRole('combobox', { name: 'Run scheme' }).selectOption('Counter');
  check(await selectedPath().getAttribute('d') !== powerPath, 'Counter changes the run path');
  await game().getByRole('button', { name: 'Undo last route', exact: true }).click();
  check(await game().getByRole('combobox', { name: 'Run scheme' }).inputValue() === 'Power' && await selectedPath().getAttribute('d') === powerPath, 'Undo restores run scheme and path together');
  const rbHandle = await point(game().locator('.route-handles [data-route-handle]').last().locator('.route-handle-dot'));
  await drag(rbHandle, { x: rbHandle.x + 20, y: rbHandle.y - 16 });
  const customBack = await selectedPath().getAttribute('d');
  await game().getByRole('button', { name: 'Run', exact: true }).click();
  await game().getByRole('group', { name: 'Run direction', exact: true }).getByRole('button', { name: 'Right', exact: true }).click();
  check(await selectedPath().getAttribute('d') === customBack, 'Current Run/direction controls preserve the custom running-back path');
  await game().getByRole('checkbox', { name: 'RPO', exact: true }).check();
  await choosePlayer('RB');
  check(await selectedPath().getAttribute('d') === customBack, 'Enabling RPO preserves the custom running-back path');
  await game().getByRole('checkbox', { name: 'RPO', exact: true }).uncheck();

  await game().getByRole('button', { name: 'Pass', exact: true }).click();
  await preset('X', 'Out');
  await field().scrollIntoViewIfNeeded();
  const bend = await point(game().locator('[data-route-handle="1"] .route-handle-dot'));
  const end = await point(game().locator('.route-handles [data-route-handle]').last().locator('.route-handle-dot'));
  const start = await playerPoint('X');
  const a = await screen(bend), b = await screen({ x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 });
  await page.mouse.move(a.x, a.y); await page.mouse.down();
  await page.mouse.move(b.x, b.y, { steps: 8 });
  check(await game().locator('[data-route-handle="1"]').count() === 0, 'Flattening the bend can remove its edit handle');
  const bounds = await field().boundingBox();
  await page.mouse.move(bounds.x + bounds.width + 35, bounds.y + 30, { steps: 6 });
  await page.mouse.up();
  const released = await selectedPath().getAttribute('d');
  const revisit = await screen({ x: 310, y: 240 });
  await page.mouse.move(revisit.x, revisit.y, { steps: 8 });
  check(await selectedPath().getAttribute('d') === released, 'Flattened-handle release outside the field leaves no stranded drawing gesture');

  const coverages = [];
  for (const [coverage, seed] of [[2, 2], [3, 3], [4, 9], [6, 0]]) {
    await open('draft', seed);
    check((await game().locator('.draft-matchup h2').innerText()).includes(`Cover ${coverage}`), `Seed ${seed}: visible Cover ${coverage}`);
    const expected = await page.evaluate(async seed => {
      const e = await import('/src/game/engine.ts');
      return e.defenseFor(e.lookForLevel(seed, 1), '11', 'spread').filter(d => d.zone).map(d => d.zone.label);
    }, seed);
    const labels = await game().locator('[data-zone]').evaluateAll(nodes => nodes.map(n => n.getAttribute('data-zone')));
    check(JSON.stringify(labels) === JSON.stringify(expected), `Cover ${coverage}: actual zone landmarks match the shell`);
    check(await game().locator('[aria-label="Eleven defenders"] .draft-position').count() === 11, `Cover ${coverage}: eleven defenders`);
    const before = await game().locator('[aria-label="Eleven defenders"] .draft-position-hit').evaluateAll(nodes => nodes.map(n => `${n.getAttribute('cx')},${n.getAttribute('cy')}`));
    await preset('Y', 'Slant');
    check(await game().locator('.route-select-hit').evaluateAll(paths => paths.every(p => getComputedStyle(p).fill === 'none')), 'Route selection hit paths do not fill a black wedge');
    await snap();
    const after = await game().locator('[aria-label="Eleven defenders"] .draft-position-hit').evaluateAll(nodes => nodes.map(n => `${n.getAttribute('cx')},${n.getAttribute('cy')}`));
    check(after.length === 11 && after.filter((p, i) => p !== before[i]).length >= 7, `Cover ${coverage}: defenders execute post-snap assignments`);
    coverages.push(coverage);
  }

  const rpoDecisions = [];
  for (const [seed, decision] of [[2, 'GIVE'], [9, 'PULL']]) {
    await open('draft', seed);
    await game().getByRole('checkbox', { name: 'RPO', exact: true }).check();
    await preset('Y', 'Slant');
    await snap();
    check(await game().locator('.rpo-conflict text').textContent() === decision, `RPO ${decision}: marked read makes the expected decision`);
    const ball = await point(game().locator('.draft-ball'));
    const carrier = await playerPoint(decision === 'GIVE' ? 'RB' : 'Y');
    check(near(ball.x, carrier.x) && near(ball.y, carrier.y), `RPO ${decision}: animated ball reaches the actual carrier`);
    await game().getByRole('button', { name: 'READ', exact: true }).click();
    const read = await point(game().locator('.rpo-conflict circle'));
    const actors = await game().locator('[aria-label="Eleven defenders"] .draft-position-hit').evaluateAll(nodes => nodes.map(n => ({ x: +n.getAttribute('cx'), y: +n.getAttribute('cy') })));
    check(actors.some(p => near(p.x, read.x) && near(p.y, read.y)), `RPO ${decision}: read ring follows a real defender`);
    rpoDecisions.push(decision);
    await page.screenshot({ path: `output/playwright/gameplay-rpo-${decision.toLowerCase()}.png`, fullPage: true });
  }

  // Record a real run, then a real completion. Replay and navigation must not
  // apply their gains twice or reset either mode's independent play state.
  await open('drive', 42);
  check((await game().locator('.drive-strip').getAttribute('aria-label')).includes('1ST & 10, Own 25'), 'Drive begins first-and-10 on Own 25');
  await game().getByRole('button', { name: 'Run', exact: true }).click();
  await game().getByRole('combobox', { name: 'Run scheme' }).selectOption('Power');
  await snap();
  check(await game().locator('.drive-history li').count() === 1, 'A run records exactly one drive play');
  check((await game().locator('.drive-history li').last().textContent()).includes('run'), 'Run outcome is in drive history');
  const runState = await resultState();
  await game().getByRole('button', { name: 'Replay', exact: true }).click();
  await game().locator('.draft-result').waitFor();
  check(JSON.stringify(await resultState()) === JSON.stringify(runState), 'Replaying a run does not apply its gain twice');
  await game().getByRole('button', { name: 'NEXT DOWN', exact: true }).click();
  check(await game().locator('.drive-history li').count() === 1, 'Next Down commits one run, not a second copy');
  await game().getByRole('button', { name: 'Pass', exact: true }).click();
  for (const [id, name] of [['X', 'Slant'], ['Z', 'Post'], ['Y', 'Out'], ['RB', 'Block'], ['H', 'Drag']]) await preset(id, name);
  await snap();
  check(await game().locator('.drive-history li').count() === 2, 'Next pass records a second drive play');
  const driveState = await resultState();
  await game().getByRole('button', { name: 'TACTICAL DRAFT', exact: true }).click();
  await choosePackage('10', 'bunch-left');
  await preset('Z', 'Comeback');
  const preservedPath = await selectedPath().getAttribute('d');
  await game().getByRole('button', { name: 'THE DRIVE', exact: true }).click();
  check(JSON.stringify(await resultState()) === JSON.stringify(driveState), 'Drive result survives a visit to Tactical Draft');
  await node('QB').click();
  await page.getByRole('heading', { name: 'Quarterback', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Back to your drive', exact: true }).click();
  check(JSON.stringify(await resultState()) === JSON.stringify(driveState), 'Drive survives its position-page round trip');
  await game().getByRole('button', { name: 'TACTICAL DRAFT', exact: true }).click();
  check(await selectedPath().getAttribute('d') === preservedPath && await game().getByRole('combobox', { name: 'Offensive formation' }).inputValue() === 'bunch-left', 'Draft formation and edited route survive a visit to Drive');

  // A deliberately blank pass with only a rollout cannot gain a first down.
  // The QB ends behind the LOS; four misses must end in turnover, not a score loss.
  await open('drive', 1);
  for (let down = 1; down <= 4; down++) {
    await choosePlayer('QB');
    await game().getByRole('button', { name: 'Roll right', exact: true }).click();
    await snap();
    check(await game().locator('.drive-history li').count() === down, `Failed down ${down} records one play`);
    if (down < 4) await game().getByRole('button', { name: 'NEXT DOWN', exact: true }).click();
  }
  check((await game().locator('.drive-strip').getAttribute('aria-label')).includes('TURNOVER ON DOWNS'), 'Fourth-down failure ends the drive');
  const turnover = await resultState();
  await game().getByRole('button', { name: 'Replay', exact: true }).click();
  await game().locator('.draft-result').waitFor();
  check(JSON.stringify(await resultState()) === JSON.stringify(turnover), 'Terminal turnover remains unchanged on replay');

  // Ordinary preset calls, chosen before the snap, construct a full 75-yard drive.
  await open('drive', 1);
  let touchdownPlays = 0;
  let yardsToGoal = 75;
  for (let play = 0; play < 12; play++) {
    const plan = await page.evaluate(async play => {
      const e = await import('/src/game/engine.ts'), d = await import('/src/game/drive.ts');
      const look = e.lookForLevel(d.driveLookSeed({ seed: 1, plays: play }), 1 + Math.floor(play / 3));
      return { name: look.name, protection: look.rushSide };
    }, play);
    check(await game().locator('.draft-matchup h2').innerText() === plan.name, `Scoring drive play ${play + 1} has its generated look`);
    for (const [id, name] of [['X', 'Slant'], ['Z', 'Post'], ['Y', 'Out'], ['RB', 'Block'], ['H', 'Drag']]) await preset(id, name);
    await game().getByRole('button', { name: plan.protection === 'balanced' ? 'Balanced' : `Slide ${plan.protection}`, exact: true }).click();
    await snap();
    touchdownPlays = play + 1;
    check(await game().locator('.drive-history li').count() === touchdownPlays, `Scoring drive play ${touchdownPlays} records once`);
    const actualBall = await point(game().locator('.draft-ball'));
    const visualGain = (365 - actualBall.y) / 12;
    check(visualGain <= yardsToGoal + 10 + .15, `Scoring play ${touchdownPlays} cannot complete beyond the back of the end zone`);
    const creditedGain = parseFloat(await game().locator('.draft-result-title h2').textContent());
    yardsToGoal -= creditedGain;
    const status = await game().locator('.drive-strip').getAttribute('aria-label');
    check(!status.includes('TURNOVER') && !status.includes('SAFETY'), 'The ordinary scoring-drive strategy remains alive');
    if (status.includes('TOUCHDOWN')) {
      const proseGain = (await game().locator('.draft-feedback').textContent()).match(/completion gains (\d+(?:\.\d+)?) yards/);
      check(!proseGain || near(Number(proseGain[1]), creditedGain, .2), 'Touchdown feedback agrees with the credited goal-line gain');
      break;
    }
    await game().getByRole('button', { name: 'NEXT DOWN', exact: true }).click();
  }
  check((await game().locator('.drive-strip').getAttribute('aria-label')).includes('TOUCHDOWN, Opp 0'), 'Real UI play calls complete a touchdown drive');
  await game().locator('.drive-history summary').click();
  const credited = await game().locator('.drive-history li strong').evaluateAll(nodes => nodes.reduce((sum, n) => sum + parseFloat(n.textContent), 0));
  check(near(credited, 75, .5), 'Drive history credits 75 yards to the end zone, allowing displayed rounding');
  await page.screenshot({ path: 'output/playwright/gameplay-touchdown-desktop.png', fullPage: true });

  // Normal motion: one pause freezes the receivers, quarterback, defenders and ball.
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await open('draft', 2);
  await preset('X', 'Go');
  await choosePlayer('QB'); await game().getByRole('button', { name: 'Roll left', exact: true }).click();
  await game().getByRole('button', { name: 'SNAP', exact: true }).click();
  await game().getByRole('button', { name: 'Pause game animation', exact: true }).click();
  const paused = await field().innerHTML();
  await page.waitForTimeout(300);
  check(await field().innerHTML() === paused, 'Pause freezes all actors on the shared clock');
  await game().getByRole('combobox', { name: 'Game playback speed' }).selectOption('1');
  await game().getByRole('button', { name: 'Resume game animation', exact: true }).click();
  await game().locator('.draft-result').waitFor();
  check(await field().innerHTML() !== paused, 'Resuming advances the same field state');
  await page.emulateMedia({ reducedMotion: 'reduce' });

  const cdp = await page.context().newCDPSession(page);
  const viewports = [320, 375, 768, 1440];
  for (const width of viewports) {
    await page.setViewportSize({ width, height: 1000 });
    await open('draft', 9);
    await choosePackage('10', 'bunch-right');
    await preset('X', 'Out');
    check(!await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), `${width}px editor has no horizontal overflow`);
    await controlsFit(width);
    await field().scrollIntoViewIfNeeded();
    const handle = game().locator('.route-handles [data-route-handle]').first();
    const from = await point(handle.locator('.route-handle-dot'));
    const before = await selectedPath().getAttribute('d');
    const fromScreen = await screen(from), toScreen = await screen({ x: from.x + 24, y: from.y - 30 });
    if (width <= 375) {
      await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: fromScreen.x, y: fromScreen.y, id: 1 }] });
      for (let step = 1; step <= 8; step++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: fromScreen.x + (toScreen.x - fromScreen.x) * step / 8, y: fromScreen.y + (toScreen.y - fromScreen.y) * step / 8, id: 1 }] });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: false });
    } else await drag(from, { x: from.x + 24, y: from.y - 30 });
    const edited = await selectedPath().getAttribute('d');
    check(edited !== before && origin(edited).every((v, i) => near(v, origin(before)[i])), `${width}px ${width <= 375 ? 'native touch' : 'mouse'} handle edit preserves frozen origin`);
    await page.screenshot({ path: `output/playwright/gameplay-editor-${width}.png`, fullPage: true });
    await game().getByRole('button', { name: 'THE DRIVE', exact: true }).click();
    check(!await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), `${width}px Drive has no horizontal overflow`);
    await controlsFit(width);
  }
  await cdp.detach();
  check(errors.length === 0, errors.join('; '));
  return { formations: formations.length, routeEditing: ['Out', 'Comeback'], quarterback: 'preset + custom path + replay', coverages, rpoDecisions, drive: { actualRunAndPass: true, replayIdempotent: true, modesRetained: true, fourDownTurnover: true, touchdownPlays }, clock: 'pause/resume', viewports, touch: [320, 375], errors };
}
