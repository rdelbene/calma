/* Motor de sonido de Calma: todo se genera en el momento con Web Audio, sin archivos. */
(function () {
  const A = {};
  let ctx = null, master = null, verbIn = null, bellBus = null;
  const sounds = {};
  let masterLevel = 0.55;

  function noiseBuffer(type, secs) {
    const len = Math.floor(ctx.sampleRate * secs);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0, b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      if (type === 'brown') { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
      else if (type === 'pink') {
        b0 = 0.99765 * b0 + w * 0.0990460; b1 = 0.96300 * b1 + w * 0.2965164; b2 = 0.57000 * b2 + w * 1.0526913;
        d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.2;
      } else d[i] = w * 0.5;
    }
    // suavizar el empalme del loop
    const f = Math.min(2000, len / 4);
    for (let i = 0; i < f; i++) { const t = i / f; d[len - f + i] = d[len - f + i] * (1 - t) + d[i] * t; }
    return buf;
  }
  function loopSrc(buf) { const s = ctx.createBufferSource(); s.buffer = buf; s.loop = true; return s; }
  function filt(type, freq, q) { const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; if (q) f.Q.value = q; return f; }
  function gain(v) { const g = ctx.createGain(); g.gain.value = v; return g; }
  function lfo(freq, depth, target) {
    const o = ctx.createOscillator(); o.frequency.value = freq;
    const g = gain(depth); o.connect(g); g.connect(target); o.start(); return o;
  }
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  const rnd = (a, b) => a + Math.random() * (b - a);

  function init() {
    if (ctx) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = gain(masterLevel);
    master.connect(ctx.destination);
    // reverberación sencilla con retardos realimentados
    verbIn = gain(1); const verbOut = gain(0.45);
    [0.29, 0.43, 0.67, 0.89].forEach((t, k) => {
      const d = ctx.createDelay(2); d.delayTime.value = t;
      const fb = gain(0.42 - k * 0.06); const lp = filt('lowpass', 2000);
      verbIn.connect(d); d.connect(lp); lp.connect(fb); fb.connect(d); lp.connect(verbOut);
    });
    verbOut.connect(master);
    bellBus = gain(0.9); bellBus.connect(master); bellBus.connect(verbIn);
    return true;
  }

  /* ---------- Definición de cada sonido ---------- */
  const DEFS = {
    musica: {
      start(bus) {
        const lp = filt('lowpass', 1400); bus.connect(lp); lp.connect(master); lp.connect(verbIn);
        const CH = [[48, 55, 64, 71], [45, 52, 60, 67], [41, 48, 57, 64], [43, 50, 59, 62]];
        let ci = 0, timer = null, alive = true;
        const out = gain(1); out.connect(bus);
        function chord() {
          if (!alive) return;
          const now = ctx.currentTime, dur = 10;
          CH[ci % CH.length].forEach((m, k) => {
            [0, 4].forEach(det => {
              const o = ctx.createOscillator(); o.type = k === 0 ? 'sine' : 'triangle';
              o.frequency.value = mtof(m); o.detune.value = det - 2;
              const g = gain(0); g.gain.setValueAtTime(0, now);
              g.gain.linearRampToValueAtTime(k === 0 ? 0.09 : 0.045, now + 3.5);
              g.gain.linearRampToValueAtTime(0, now + dur + 2);
              o.connect(g); g.connect(out); o.start(now); o.stop(now + dur + 2.2);
            });
          });
          if (Math.random() < 0.75) {
            const n = CH[ci % CH.length]; const m = n[1 + Math.floor(Math.random() * 3)] + 12;
            const t = now + rnd(2, 7); const o = ctx.createOscillator(); o.frequency.value = mtof(m);
            const g = gain(0); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.035, t + 0.05);
            g.gain.exponentialRampToValueAtTime(0.0001, t + 4);
            o.connect(g); g.connect(out); o.start(t); o.stop(t + 4.2);
          }
          ci++; timer = setTimeout(chord, dur * 1000 - 1500);
        }
        chord();
        return () => { alive = false; clearTimeout(timer); setTimeout(() => { out.disconnect(); lp.disconnect(); }, 13000); };
      }
    },
    lluvia: {
      start(bus) {
        const s = loopSrc(noiseBuffer('pink', 4));
        const hp = filt('highpass', 300), lp = filt('lowpass', 5000), g = gain(1.1);
        s.connect(hp); hp.connect(lp); lp.connect(g); g.connect(bus); bus.connect(master);
        // gotas sueltas
        let alive = true, t = null;
        const drop = () => {
          if (!alive) return;
          const o = ctx.createOscillator(); const now = ctx.currentTime; const f = rnd(1800, 4200);
          o.frequency.setValueAtTime(f, now); o.frequency.exponentialRampToValueAtTime(f * 0.6, now + 0.05);
          const e = gain(0); e.gain.setValueAtTime(rnd(0.01, 0.03), now); e.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
          o.connect(e); e.connect(bus); o.start(now); o.stop(now + 0.08);
          t = setTimeout(drop, rnd(80, 600));
        };
        drop(); s.start();
        return () => { alive = false; clearTimeout(t); try { s.stop(ctx.currentTime + 4); } catch (e) {} };
      }
    },
    mar: {
      start(bus) {
        const s = loopSrc(noiseBuffer('pink', 6));
        const lp = filt('lowpass', 600, 0.7);
        const amp = gain(0.55);
        s.connect(lp); lp.connect(amp); amp.connect(bus); bus.connect(master); bus.connect(verbIn);
        const l1 = lfo(0.085, 450, lp.frequency);
        const l2 = lfo(0.085, 0.42, amp.gain);
        const s2 = loopSrc(noiseBuffer('brown', 5)); const g2 = gain(0.35); s2.connect(g2); g2.connect(bus);
        s.start(); s2.start();
        return () => { const t = ctx.currentTime + 4; [s, s2, l1, l2].forEach(n => { try { n.stop(t); } catch (e) {} }); };
      }
    },
    bosque: {
      start(bus) {
        bus.connect(master); bus.connect(verbIn);
        const s = loopSrc(noiseBuffer('pink', 5));
        const bp = filt('bandpass', 500, 0.4); const wind = gain(0.25);
        s.connect(bp); bp.connect(wind); wind.connect(bus);
        const l = lfo(0.05, 0.15, wind.gain); s.start();
        let alive = true, t = null;
        const birdBus = gain(0.5); const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        if (pan) { birdBus.connect(pan); pan.connect(bus); } else birdBus.connect(bus);
        const bird = () => {
          if (!alive) return;
          if (pan) pan.pan.value = rnd(-0.8, 0.8);
          const notes = Math.floor(rnd(2, 6)); let at = ctx.currentTime + 0.05;
          const base = rnd(2400, 4200);
          for (let i = 0; i < notes; i++) {
            const o = ctx.createOscillator(); const f = base * rnd(0.9, 1.15); const d = rnd(0.06, 0.14);
            o.frequency.setValueAtTime(f, at); o.frequency.exponentialRampToValueAtTime(f * rnd(0.75, 1.35), at + d);
            const e = gain(0); e.gain.setValueAtTime(0, at); e.gain.linearRampToValueAtTime(rnd(0.03, 0.07), at + 0.01);
            e.gain.exponentialRampToValueAtTime(0.0001, at + d);
            o.connect(e); e.connect(birdBus); o.start(at); o.stop(at + d + 0.02);
            at += d + rnd(0.03, 0.12);
          }
          t = setTimeout(bird, rnd(1500, 6500));
        };
        t = setTimeout(bird, 1200);
        return () => { alive = false; clearTimeout(t); const x = ctx.currentTime + 4; [s, l].forEach(n => { try { n.stop(x); } catch (e) {} }); };
      }
    },
    fuego: {
      start(bus) {
        bus.connect(master);
        const s = loopSrc(noiseBuffer('brown', 5)); const lp = filt('lowpass', 500); const g = gain(0.7);
        s.connect(lp); lp.connect(g); g.connect(bus); const l = lfo(0.3, 0.2, g.gain); s.start();
        const crackBuf = noiseBuffer('white', 0.05);
        let alive = true, t = null;
        const crack = () => {
          if (!alive) return;
          const c = ctx.createBufferSource(); c.buffer = crackBuf;
          const hp = filt('highpass', rnd(1200, 4000)); const e = gain(0); const now = ctx.currentTime;
          const len = rnd(0.004, 0.02);
          e.gain.setValueAtTime(rnd(0.15, 0.6), now); e.gain.exponentialRampToValueAtTime(0.0001, now + len);
          c.connect(hp); hp.connect(e); e.connect(bus); c.start(now); c.stop(now + 0.05);
          t = setTimeout(crack, Math.random() < 0.2 ? rnd(20, 60) : rnd(120, 700));
        };
        crack();
        return () => { alive = false; clearTimeout(t); const x = ctx.currentTime + 4; [s, l].forEach(n => { try { n.stop(x); } catch (e) {} }); };
      }
    },
    cuencos: {
      start(bus) {
        bus.connect(master); bus.connect(verbIn);
        let alive = true, t = null;
        const play = () => { if (!alive) return; strike(bus, [196, 220, 261.63, 293.66, 329.63][Math.floor(Math.random() * 5)], 0.5); t = setTimeout(play, rnd(11000, 19000)); };
        t = setTimeout(play, 400);
        return () => { alive = false; clearTimeout(t); };
      }
    }
  };

  function strike(dest, f, vol) {
    const now = ctx.currentTime;
    [[1, 1], [2.76, 0.5], [5.4, 0.22], [8.93, 0.1]].forEach(([r, a]) => {
      [0, rnd(1, 3)].forEach(beat => {
        const o = ctx.createOscillator(); o.frequency.value = f * r + beat;
        const e = gain(0); const decay = 10 / Math.sqrt(r);
        e.gain.setValueAtTime(0, now); e.gain.linearRampToValueAtTime(vol * a * 0.12, now + 0.015);
        e.gain.exponentialRampToValueAtTime(0.0001, now + decay);
        o.connect(e); e.connect(dest); o.start(now); o.stop(now + decay + 0.1);
      });
    });
  }

  /* ---------- API pública ---------- */
  A.LIST = [
    ['musica', 'Música suave'], ['lluvia', 'Lluvia'], ['mar', 'Mar'],
    ['bosque', 'Bosque'], ['fuego', 'Fuego'], ['cuencos', 'Cuencos']
  ];
  A.isOn = id => !!(sounds[id] && sounds[id].on);
  A.anyOn = () => Object.values(sounds).some(s => s.on);
  A.resume = () => { if (init() && ctx.state !== 'running') ctx.resume().catch(() => {}); };
  function ramp(param, to, secs) {
    const t = ctx.currentTime; param.cancelScheduledValues(t); param.setValueAtTime(param.value, t); param.linearRampToValueAtTime(to, t + secs);
  }
  A.setVolume = (id, v) => { const s = sounds[id]; if (s) { s.vol = v; if (s.on && ctx) ramp(s.bus.gain, v, 0.2); } else sounds[id] = { on: false, vol: v }; };
  A.getVolume = id => (sounds[id] && sounds[id].vol != null) ? sounds[id].vol : 0.7;
  A.set = (id, on) => {
    if (!init()) return;
    A.resume();
    const s = sounds[id] || (sounds[id] = { on: false, vol: 0.7 });
    if (on === s.on) return;
    s.on = on;
    if (on) {
      s.bus = gain(0); s.stop = DEFS[id].start(s.bus);
      ramp(s.bus.gain, s.vol, 3);
    } else if (s.bus) {
      ramp(s.bus.gain, 0, 3);
      const stop = s.stop, bus = s.bus; s.stop = null;
      setTimeout(() => { stop && stop(); setTimeout(() => { try { bus.disconnect(); } catch (e) {} }, 5000); }, 3200);
    }
  };
  A.setMaster = v => { masterLevel = v; if (master) ramp(master.gain, v, 0.2); };
  A.fadeAllOut = secs => new Promise(res => {
    if (!ctx) return res();
    ramp(master.gain, 0, secs);
    setTimeout(() => { A.LIST.forEach(([id]) => A.set(id, false)); setTimeout(() => { ramp(master.gain, masterLevel, 0.5); res(); }, 3500); }, secs * 1000);
  });
  A.bell = (times = 1) => {
    if (!init()) return; A.resume();
    for (let i = 0; i < times; i++) setTimeout(() => strike(bellBus, 261.63, 1), i * 3500);
  };
  A.tick = () => { // tono muy suave para cambios de fase
    if (!ctx || ctx.state !== 'running') return;
    const o = ctx.createOscillator(); o.frequency.value = 528; const e = gain(0); const n = ctx.currentTime;
    e.gain.setValueAtTime(0, n); e.gain.linearRampToValueAtTime(0.025, n + 0.05); e.gain.exponentialRampToValueAtTime(0.0001, n + 1.2);
    o.connect(e); e.connect(master); o.start(n); o.stop(n + 1.3);
  };
  window.CalmaAudio = A;
})();
