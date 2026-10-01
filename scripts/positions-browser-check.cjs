async page => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const check = (value, message) => { if (!value) throw new Error(message); };
  const base = 'http://127.0.0.1:5173/';
  await page.setViewportSize({ width: 1440, height: 1050 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(base + '#offense/blocking/chip');
  await page.getByRole('dialog').waitFor();
  await page.locator('.preview-field .blueprint-node[data-player="Y"]:not(.blueprint-origin):not(.blueprint-endpoint)').click();
  await page.getByRole('heading', { name: 'Tight end', exact: true }).waitFor();
  check(page.url().endsWith('#positions/tight-end'), 'TE opens its position URL');
  check(await page.getByRole('heading', { name: 'Alignment', exact: true }).isVisible(), 'Position has alignment notes');
  check(await page.getByRole('combobox', { name: 'Position playback speed' }).inputValue() === '0.5', 'Position shares default half speed');
  check(await page.locator('.position-canvas-wrap .blueprint-node.focused').count() > 0, 'Example highlights the position');
  await page.screenshot({ path: 'output/playwright/position-tight-end-desktop.png', fullPage: true });
  await page.getByRole('button', { name: 'Back to the play', exact: true }).click();
  await page.getByRole('dialog').waitFor();
  check(page.url().endsWith('#offense/blocking/chip'), 'Position breadcrumb restores exact originating lesson');
  await page.getByRole('button', { name: 'RESULT', exact: true }).click();
  const end = page.locator('.preview-field .blueprint-node[data-player="SS"]:not(.blueprint-origin):not(.blueprint-endpoint)');
  await end.focus(); await page.keyboard.press('Enter');
  await page.getByRole('heading', { name: 'Outside linebacker', exact: true }).waitFor();
  check(page.url().endsWith('#positions/outside-linebacker'), 'Post-snap keyboard navigation respects OLB label override');
  await page.getByRole('button', { name: 'Back to the play', exact: true }).click();
  await page.getByRole('button', { name: 'Close breakdown' }).click();
  check(await page.locator('.toy-tile button .blueprint-node[role="button"]').count() === 0, 'Thumbnail players are not nested in buttons');
  await page.locator('.toy-tile[data-concept="chip"] .blueprint-node[data-player="LT"]:not(.blueprint-origin):not(.blueprint-endpoint)').focus();
  await page.keyboard.press('Space');
  await page.getByRole('heading', { name: 'Left tackle', exact: true }).waitFor();
  const profiles = await page.evaluate(async () => (await import('/src/data/positionProfiles.ts')).positionProfiles.map(p => ({ slug: p.slug, name: p.name })));
  for (const profile of profiles) {
    await page.evaluate(slug => { location.hash = `#positions/${slug}`; }, profile.slug);
    await page.getByRole('heading', { name: profile.name, exact: true }).waitFor();
    check(await page.locator('.position-canvas-wrap .blueprint-node.focused').count() > 0, `${profile.slug} highlights a real actor`);
    check(await page.locator('.position-notes p').count() === 3, `${profile.slug} complete notes`);
  }
  await page.goto(base + 'positions/tight-end');
  await page.getByRole('heading', { name: 'Tight end', exact: true }).waitFor();
  await page.getByRole('button', { name: 'GridironDex home', exact: true }).click();
  check(new URL(page.url()).pathname === '/' && !new URL(page.url()).hash, 'Direct pathname resets cleanly on Home');
  await page.goto(base + '#draft');
  await page.getByRole('heading', { name: 'TACTICAL DRAFT', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Slant', exact: true }).click();
  const route = await page.locator('.draft-route:not(.defensive)').first().innerHTML();
  const look = await page.locator('.draft-matchup h2').innerText();
  await page.locator('.draft-receiver').first().click();
  await page.getByRole('heading', { name: 'X receiver', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Back to your draft', exact: true }).click();
  await page.getByRole('heading', { name: 'TACTICAL DRAFT', exact: true }).waitFor();
  check(await page.locator('.draft-route:not(.defensive)').first().innerHTML() === route, 'Draft routes survive position visit');
  check(await page.locator('.draft-matchup h2').innerText() === look, 'Draft run survives position visit');
  await page.locator('.draft-receiver').first().click();
  await page.getByRole('heading', { name: 'X receiver', exact: true }).waitFor();
  await page.goBack();
  await page.getByRole('heading', { name: 'TACTICAL DRAFT', exact: true }).waitFor();
  check(await page.locator('.draft-route:not(.defensive)').first().innerHTML() === route, 'Browser Back preserves draft routes');
  for (const width of [320, 375, 768]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => { location.hash = '#positions/tight-end'; });
    await page.getByRole('heading', { name: 'Tight end', exact: true }).waitFor();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    check(!overflow, `${width}px profile has no overflow`);
    await page.screenshot({ path: `output/playwright/position-tight-end-${width}.png`, fullPage: true });
  }
  check(errors.length === 0, errors.join('; '));
  return { profiles: profiles.length, playerNavigation: 'click + Enter + Space', sourceRestored: true, gameStatePreserved: true, browserBack: true, viewports: [320, 375, 768, 1440], errors };
}
