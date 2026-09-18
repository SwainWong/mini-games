'use strict';

// Pass a Playwright page already opened on the game URL. All game interaction
// uses real touch input; snapshots are read-only. No game state/seed is injected.
module.exports = async function browserRecoveryCheck(page) {
  const assert = require('node:assert/strict');
  const M = require('../match.js');
  const context = await page.context().browser().newContext({
    viewport: { width: 390, height: 844 }, deviceScaleFactor: 2,
    isMobile: true, hasTouch: true,
  });
  const mobile = await context.newPage(), errors = [];
  mobile.on('pageerror', error => errors.push(error.message));
  const read = () => mobile.evaluate(() => kingGame.snapshot({ geometry: true }));
  const tap = async index => {
    const b = await mobile.locator('#game').boundingBox();
    await mobile.touchscreen.tap(
      b.x + (24 + (index % 8 + .5) * 48) * b.width / 432,
      b.y + (398 + (Math.floor(index / 8) + .5) * 48) * b.height / 780,
    );
  };
  const input = async (a, b) => { await tap(a); await tap(b); };
  const compact = s => ({
    state: s.state, reason: s.reason, time: s.time, mechanicalTime: s.mechanicalTime,
    hp: s.hp, actions: s.actions, remaining: s.remaining, recoveries: s.recoveries,
    recovery: s.recovery, phase: s.phase, main: s.mainActive, crushed:s.crushed,
    active: s.active, spawned: s.spawned, collected: s.collected,
    overlap: s.geometry.maxOverlap,
  });
  // Sample inside the browser so IPC latency does not miss a short recovery.
  const settled = () => mobile.evaluate(() => new Promise((resolve, reject) => {
    const samples = [], began = performance.now();
    function tick() {
      const s = kingGame.snapshot({ geometry: true });
      samples.push({ state:s.state,reason:s.reason,time:s.time,mechanicalTime:s.mechanicalTime,
        hp:s.hp,actions:s.actions,remaining:s.remaining,recovery:s.recovery,
        recoveries:s.recoveries,phase:s.phase,main:s.mainActive,crushed:s.crushed,proofs:s.crushLog,
        active:s.active,spawned:s.spawned,collected:s.collected,overlap:s.geometry.maxOverlap,
        uniqueIds:new Set(s.geometry.stones.map(p=>p.id)).size });
      if (!s.phase || s.state !== 'playing') return resolve(samples);
      if (performance.now() - began > 15000) return reject(Error('Settlement did not return control in 15 wall seconds'));
      requestAnimationFrame(tick);
    }
    tick();
  }));
  const checkSamples = samples => {
    for (let i = 0; i < samples.length; i++) {
      const s = samples[i], prior = samples[i - 1];
      assert.notEqual(s.reason, 'jam');
      assert.equal(s.spawned, s.active + s.collected + s.crushed, 'Particle conservation');
      assert.equal(s.main, s.active, 'All surviving gold remains in the physical world');
      for(const proof of s.proofs){assert.ok(proof.duration>=.05);assert.ok(proof.blockedDuration>=.05);assert.ok(proof.chain.includes(proof.id));assert.notEqual(proof.upper,proof.lower);}
      assert.equal(s.uniqueIds, s.active, 'Unique particle IDs');
      assert.ok(s.overlap < .05, 'Same-depth solid penetration');
      if (s.recovery) assert.ok(s.recovery.elapsed < 8, 'Recovery must be bounded');
      if (prior?.recovery && s.recovery?.batch === prior.recovery.batch) {
        assert.equal(s.time, prior.time, 'Danger clock moved during recovery');
        assert.equal(s.hp, prior.hp, 'HP changed during recovery');
      }
    }
  };
  const route = [[15,23],[34,42],[44,52],[40,48]], runs = [];
  try {
    // First reproduce the actual historical route; then verify user pause
    // during live settling at a safer ten-second starting time.
    for (const idle of [30, 10]) {
      await mobile.goto(page.url());
      await mobile.locator('#start').click();
      await mobile.waitForFunction(t => kingGame.snapshot().time >= t, idle, { timeout: 90000 });
      const moves = [];
      for (let n = 0; n < route.length; n++) {
        const [a,b] = route[n], before = await read();
        await input(a,b);
        let pauseEvidence = null;
        if (idle === 10 && n === 3) {
          assert.ok((await read()).phase, 'Pause during a real exchange/settlement');
          await mobile.locator('#pause').click();
          const frozen = await read();
          await mobile.waitForTimeout(300);
          const after = await read();
          assert.ok(frozen.paused && frozen.phase, 'Pause must catch live settlement');
          assert.equal(after.time, frozen.time);
          assert.equal(after.mechanicalTime, frozen.mechanicalTime);
          assert.deepEqual(after.geometry.stones, frozen.geometry.stones);
          assert.equal(after.crushed,frozen.crushed);
          pauseEvidence = { before:compact(frozen), after:compact(after) };
          await mobile.locator('#resume').click();
        }
        const samples = await settled(); checkSamples(samples);
        const after = await read();
        assert.equal(after.state, 'playing', 'Historical route must remain playable');
        assert.equal(after.phase, null);
        assert.equal(after.actions, before.actions + 1, 'Real touch exchange accepted');
        moves.push({input:[a,b],before:compact(before),samples,after:compact(after),pauseEvidence});
      }
      const beforeNext = await read(), next = M.legal(beforeNext.board)[0];
      assert.ok(beforeNext.recoveries >= 1, 'Historical obstruction must exercise recovery');
      assert.ok(next, 'This route has a visible legal continuation');
      await input(next.a,next.b);
      const accepted = await read();
      assert.equal(accepted.actions, beforeNext.actions + 1, 'Recovery must return usable touch control');
      runs.push({idle,moves,continuation:{input:[next.a,next.b],before:compact(beforeNext),accepted:compact(accepted)}});
    }
    assert.deepEqual(errors, []);
    return { runs, errors };
  } finally {
    await context.close();
  }
};
