async page => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const check = (value, message) => { if (!value) throw new Error(message); };
  await page.setViewportSize({ width: 1280, height: 1000 });
  await page.goto('http://127.0.0.1:5173/#draft');
  await page.getByRole('heading', { name: 'TACTICAL DRAFT' }).waitFor();
  await page.evaluate(() => document.fonts.ready);
  const polygons = () => page.locator('.draft-route:not(.defensive) polygon');
  check(await page.getByRole('button', { name: 'SNAP', exact: true }).isDisabled(), 'No-route SNAP is disabled.');
  async function draw(points) {
    await page.locator('.draft-field').scrollIntoViewIfNeeded();
    await page.locator('.draft-receiver').first().hover();
    const matrix = await page.locator('.draft-field').evaluate(node => { const m = node.getScreenCTM(); return { a:m.a, d:m.d, e:m.e, f:m.f }; });
    await page.mouse.move(matrix.e + points[0][0] * matrix.a, matrix.f + points[0][1] * matrix.d);
    await page.mouse.down();
    for (const p of points.slice(1)) await page.mouse.move(matrix.e + p[0]*matrix.a, matrix.f+p[1]*matrix.d, { steps: 7 });
    await page.mouse.up();
  }
  await draw([[75,381],[75,333],[150,275],[217,233]]);
  check(await polygons().count() === 1, 'Pointer drawing creates a route.');
  check(await page.getByRole('button', { name:'SNAP', exact:true }).isEnabled(), 'A custom route enables SNAP.');
  await page.getByRole('button', { name:'Undo last route' }).click();
  check(await polygons().count() === 0, 'Undo restores empty assignment.');
  await page.getByRole('button', { name:'Slant', exact:true }).focus();
  await page.keyboard.press('Enter');
  check(await polygons().count() === 1, 'Keyboard preset creates route.');
  await page.getByRole('button', { name:/12 personnel/ }).click();
  check(await polygons().count() === 0, 'Changing personnel clears old routes.');
  await page.getByRole('button', { name:/5-wide/ }).click();
  check(await page.getByRole('button', { name:'Draw route for RB, slot receiver' }).count() === 1, 'Empty puts RB in the slot.');
  await page.getByRole('button', { name:/11 personnel/ }).click();
  const assignments = [['X','Slant'],['Z','Post'],['Y','Out'],['RB','Stay in'],['H','Drag']];
  for (const [id, name] of assignments) {
    await page.getByRole('group', { name:'Select a receiver', exact:true }).getByRole('button', { name:id, exact:true }).click();
    await page.getByRole('button', { name, exact:true }).click();
  }
  const name = await page.locator('.draft-matchup h2').textContent();
  await page.getByRole('button', { name:name.includes('left') ? 'Slide left' : name.includes('edge') ? 'Slide right' : 'Balanced', exact:true }).click();
  await page.screenshot({ path:'output/playwright/draft-desktop.png', fullPage:true });
  await page.getByRole('button', { name:'SNAP', exact:true }).click();
  await page.getByRole('button', { name:'NEXT LEVEL', exact:true }).waitFor({ timeout:10000 });
  check((await page.locator('.draft-feedback').textContent()).includes('completion'), 'Winning geometry produces a completion.');
  await page.screenshot({ path:'output/playwright/draft-result.png', fullPage:true });
  await page.getByRole('button', { name:'NEXT LEVEL', exact:true }).click();
  check((await page.locator('.draft-kicker').textContent()).includes('LEVEL 2'), 'Winning advances the level.');
  await page.emulateMedia({ reducedMotion:'reduce' });
  await draw([[75,381],[120,429],[170,450]]);
  for (let attempt=0;attempt<3;attempt++) {
    await page.getByRole('button', { name:'SNAP', exact:true }).click();
    const action = page.getByRole('button', { name:attempt===2 ? 'NEW RUN' : 'EDIT & RETRY', exact:true });
    await action.waitFor();
    if(attempt===2) check((await page.locator('.draft-result-title').textContent()).includes('RUN OVER'), 'Third failure ends run.');
    await action.click();
  }
  check((await page.locator('.draft-kicker').textContent()).includes('LEVEL 1'), 'New run resets level.');
  for (const width of [320,375,414,768]) {
    await page.setViewportSize({ width, height:950 });
    await page.evaluate(() => window.scrollTo(0,0));
    check(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `No horizontal overflow at ${width}.`);
    check(await page.locator('.draft-heading h1').evaluate(node => node.scrollWidth <= node.clientWidth), `Heading fits at ${width}.`);
    await page.screenshot({ path:`output/playwright/draft-${width}.png`, fullPage:true });
  }
  await page.setViewportSize({ width:375,height:950 });
  await draw([[75,381],[75,333],[150,275],[217,233]]);
  check(await polygons().count() === 1, 'Mobile-sized field drawing creates route.');
  const matrix = await page.locator('.draft-field').evaluate(node => { const m=node.getScreenCTM();return{a:m.a,d:m.d,e:m.e,f:m.f}; });
  const cdp = await page.context().newCDPSession(page);
  const touch = async (type, point) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints:point ? [{x:matrix.e+point[0]*matrix.a,y:matrix.f+point[1]*matrix.d}] : [] });
  await touch('touchStart',[645,398]);
  for (const point of [[640,360],[630,337],[615,315],[590,289],[566,262]]) await touch('touchMove',point);
  await touch('touchEnd');
  await cdp.detach();
  check(await polygons().count() === 2, 'Native touch drag creates an additional route.');
  check(errors.length === 0, errors.join('; '));
  return { passed:true, tested:['actual pointer draw','undo','keyboard preset','personnel reset','successful snap and advance','three failures and restart','reduced motion','320/375/414/768 layouts','mobile pointer draw','native touch drag'], errors };
}
