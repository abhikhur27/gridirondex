async page => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const check = (value, message) => { if (!value) throw new Error(message); };
  const base = 'http://127.0.0.1:5173/';
  await page.setViewportSize({ width: 1440, height: 1050 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(base);
  await page.getByRole('button', { name: 'GridironDex home' }).waitFor();
  const lessons = await page.evaluate(async () => {
    const { concepts } = await import('/src/data/concepts.ts');
    const { pageHash, conceptPage } = await import('/src/data/navigation.ts');
    return concepts.map(c => ({ id: c.id, hash: pageHash(conceptPage(c)) }));
  });
  const open = async id => {
    const lesson = lessons.find(c => c.id === id);
    await page.evaluate(hash => { location.hash = hash; }, lesson.hash);
    await page.locator(`.preview-field svg[data-blueprint="${id}"]`).waitFor();
  };
  const actorPositions = () => page.locator('.preview-field .blueprint-node:not(.blueprint-origin):not(.blueprint-endpoint)').evaluateAll(nodes => nodes.map(n => [n.getAttribute('data-player'), n.getAttribute('data-team'), n.getAttribute('transform')]));
  const stage = async name => {
    await page.getByRole('button', { name, exact: true }).click();
    await page.locator(`.preview-field svg[data-play-phase="${name}"]`).waitFor();
  };
  const scrub = async seconds => {
    await page.getByRole('slider', { name: 'Play progress', exact: true }).evaluate((el, value) => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, value);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }, String(seconds / 4.2 * 100));
  };
  for (const [index, lesson] of lessons.entries()) {
    await open(lesson.id);
    const before = await actorPositions();
    check(before.filter(n => n[1] === 'defense').length >= 7, `${lesson.id}: defensive context`);
    check(before.filter(n => n[1] !== 'defense').length >= 7, `${lesson.id}: offensive context`);
    const captions = new Set([await page.locator('.preview-caption p').innerText()]);
    for (const name of ['SNAP', 'DEVELOPMENT', 'RESULT']) {
      await stage(name);
      captions.add(await page.locator('.preview-caption p').innerText());
    }
    const after = await actorPositions();
    check(captions.size >= 4, `${lesson.id}: four contextual captions`);
    for (const defense of [false, true]) check(after.some(n => (n[1] === 'defense') === defense && before.find(b => b[0] === n[0])?.[2] !== n[2]), `${lesson.id}: ${defense ? 'defense' : 'offense'} moves`);
    await stage('PRE-SNAP');
    check(JSON.stringify(await actorPositions()) === JSON.stringify(before), `${lesson.id}: backward scrub restores alignment`);
    if ((index + 1) % 25 === 0) console.log(`Context checks passed: ${index + 1}/${lessons.length}`);
  }
  for (const id of ['chip', 'inside-zone', 'personnel-12', 'cover-3', 'stunt-tex']) {
    await open(id);
    if (id === 'chip') {
      await scrub(.9);
      await page.locator('.preview-field [data-contact="Y:ER"]').waitFor();
      check(Number(await page.locator('.preview-field svg').getAttribute('data-play-seconds')) > .8, 'Precise slider scrub');
    } else await stage('DEVELOPMENT');
    await page.screenshot({ path: `output/playwright/context-${id}-desktop.png`, animations: 'disabled' });
  }
  for (const width of [320, 375, 414, 768]) {
    await page.setViewportSize({ width, height: 900 });
    await open('chip'); await scrub(.9);
    const metrics = await page.getByRole('dialog').evaluate(el => ({ width: el.getBoundingClientRect().width, right: el.getBoundingClientRect().right, viewport: innerWidth, scroll: document.documentElement.scrollWidth }));
    check(metrics.width <= width && metrics.right <= width && metrics.scroll <= width, `No overflow at ${width}px`);
    check(await page.getByRole('button', { name: 'RESULT', exact: true }).isVisible(), `Stages visible at ${width}px`);
    await page.screenshot({ path: `output/playwright/context-chip-${width}.png`, animations: 'disabled' });
  }
  await page.setViewportSize({ width: 1440, height: 1050 });
  await page.getByRole('button', { name: 'Close breakdown' }).click();
  await page.evaluate(() => { location.hash = '#offense/blocking'; });
  const tile = page.locator('.toy-tile').filter({ has: page.locator('svg[data-blueprint="chip"]') });
  await tile.waitFor();
  const pre = await tile.locator('.blueprint-node:not(.blueprint-origin):not(.blueprint-endpoint)').evaluateAll(nodes => nodes.map(n => [n.getAttribute('data-player'), n.getAttribute('data-team'), n.getAttribute('transform')]));
  await tile.hover();
  await page.waitForFunction(() => Number(document.querySelector('.toy-tile svg[data-blueprint="chip"]').getAttribute('data-play-seconds')) > 1.5);
  const moved = await tile.locator('.blueprint-node:not(.blueprint-origin):not(.blueprint-endpoint)').evaluateAll(nodes => nodes.map(n => [n.getAttribute('data-player'), n.getAttribute('data-team'), n.getAttribute('transform')]));
  for (const defense of [false, true]) check(moved.some(n => (n[1] === 'defense') === defense && pre.find(b => b[0] === n[0])?.[2] !== n[2]), `Hover ${defense ? 'defense' : 'offense'} animation`);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open('chip');
  await page.getByRole('button', { name: 'Play diagram', exact: true }).click();
  await page.locator('.preview-field svg[data-play-phase="RESULT"]').waitFor();
  await page.getByRole('button', { name: 'Close breakdown' }).click();
  await page.evaluate(() => { location.hash = '#draft'; });
  await page.locator('svg.play-canvas.draft-field').waitFor();
  await page.setViewportSize({ width: 375, height: 900 });
  const game = await page.locator('svg.play-canvas.draft-field').boundingBox();
  check(game.width > 250, 'Game SVG retains full mobile width');
  await page.screenshot({ path: 'output/playwright/context-game-mobile.png', fullPage: true, animations: 'disabled' });
  check(errors.length === 0, `No runtime errors: ${errors.join('; ')}`);
  return { lessons: lessons.length, phases: 4, viewports: [320, 375, 414, 768, 1440], reducedMotion: true, gameSharedCanvas: true, errors };
}
