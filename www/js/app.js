(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const AU = window.CalmaAudio;
  const Cap = window.Capacitor;
  const NATIVE = !!(Cap && Cap.isNativePlatform && Cap.isNativePlatform());
  const P = (Cap && Cap.Plugins) || {};
  const VERSION = '2.1';

  const store = {
    get(k, d) { try { const v = localStorage.getItem('calma-' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('calma-' + k, JSON.stringify(v)); } catch (e) {} }
  };

  /* ---------- utilidades ---------- */
  let toastT = null;
  function toast(msg, btn, fn) {
    $('toastText').textContent = msg;
    $('toastBtn').textContent = btn || ''; $('toastBtn').style.display = btn ? '' : 'none';
    $('toastBtn').onclick = () => { $('toast').classList.remove('on'); fn && fn(); };
    $('toast').classList.add('on'); clearTimeout(toastT);
    toastT = setTimeout(() => $('toast').classList.remove('on'), btn ? 5000 : 2600);
  }
  let wakeLock = null;
  async function keepAwake(on) {
    try {
      if (on && 'wakeLock' in navigator && !wakeLock) { wakeLock = await navigator.wakeLock.request('screen'); wakeLock.addEventListener('release', () => { wakeLock = null; }); }
      if (!on && wakeLock) { await wakeLock.release(); wakeLock = null; }
    } catch (e) {}
  }
  const ICONS = {
    leaf: '<path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15"/><path d="M5 19l7-7"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    breath: '<circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="8.5"/>',
    body: '<circle cx="12" cy="5" r="2.5"/><path d="M12 8v7M8 11h8M10 21l2-6 2 6"/>',
    timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9 2h6"/>',
    book: '<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11"/>',
    moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
    music: '<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
    rain: '<path d="M7 15a4 4 0 0 1 .5-8 5.5 5.5 0 0 1 10.5 1.5A3.5 3.5 0 0 1 17.5 15z"/><path d="M8 18l-1 3M12 18l-1 3M16 18l-1 3"/>',
    sea: '<path d="M2 9c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2M2 14c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2M2 19c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2"/>',
    tree: '<path d="M12 2l6 9h-3l4 6H5l4-6H6z"/><path d="M12 17v5"/>',
    fire: '<path d="M12 22c4 0 7-2.7 7-6.5 0-4-3-6-4-9.5-1.5 2-2 3.5-2 5-1.5-1-2.5-3-2.5-5C7 8 5 11.5 5 15.5 5 19.3 8 22 12 22z"/>',
    bowl: '<path d="M3 11h18a9 9 0 0 1-18 0z"/><path d="M9 6c0-1.5 1.5-1.5 1.5-3M14 6c0-1.5 1.5-1.5 1.5-3"/>'
  };
  const svg = (k, sw = 1.7) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${ICONS[k]}</svg>`;

  /* ---------- navegación ---------- */
  let currentView = 'frases';
  function go(v) {
    currentView = v;
    document.querySelectorAll('#nav button').forEach(b => b.classList.toggle('on', b.dataset.v === v));
    document.querySelectorAll('.view').forEach(s => s.classList.toggle('on', s.id === 'v-' + v));
    if (v === 'diario') { renderGrat(); renderFavs(); }
    if (v !== 'ejercicios') { stopBreath(); }
  }
  document.querySelectorAll('#nav button').forEach(b => b.addEventListener('click', () => go(b.dataset.v)));

  /* ---------- estado de ánimo ---------- */
  let mood = null;
  function renderMoods() {
    const g = $('moodgrid'); g.innerHTML = '';
    MOODS.forEach(m => {
      const b = document.createElement('button'); b.className = 'mood' + (mood === m.id ? ' on' : '');
      b.innerHTML = `<b>${m.label}</b><span>${m.sub}</span>`;
      b.onclick = () => setMood(m.id);
      g.append(b);
    });
  }
  function openMood() { renderMoods(); $('moodsheet').classList.remove('gone'); }
  function closeMood() { $('moodsheet').classList.add('gone'); }
  function setMood(id) {
    mood = id; closeMood(); go('frases'); buildOrder(); renderQuote(); renderSuggest(); renderMoodChip();
  }
  function renderMoodChip() {
    const m = MOODS.find(x => x.id === mood);
    $('moodchip').innerHTML = m ? `Ahora: <b>${m.label.toLowerCase()}</b> · cambiar` : '¿Cómo estás ahora?';
  }
  $('moodchip').onclick = openMood;
  $('moodSkip').onclick = () => { mood = null; closeMood(); buildOrder(); renderQuote(); renderSuggest(); renderMoodChip(); };

  function renderSuggest() {
    const box = $('suggest'); box.innerHTML = '';
    const m = MOODS.find(x => x.id === mood); if (!m) return;
    box.innerHTML = '<h4>Te puede ayudar</h4>';
    m.suggest.forEach(k => {
      const s = SUGGESTIONS[k];
      const ic = { grounding: 'eye', 'resp-caja': 'breath', 'resp-calma': 'breath', 'resp-dormir': 'breath', relajacion: 'body', meditar: 'timer', gratitud: 'book', 'modo-dormir': 'moon' }[k];
      const b = document.createElement('button'); b.className = 'card small';
      b.innerHTML = `<div class="ic">${svg(ic)}</div><div class="tx"><b>${s.label}</b><span>${s.sub}</span></div><div class="chev">›</div>`;
      b.onclick = () => runSuggestion(k);
      box.append(b);
    });
    if (m.note) { const p = document.createElement('p'); p.className = 'note'; p.textContent = m.note; box.append(p); }
  }
  function runSuggestion(k) {
    if (k === 'grounding') { go('ejercicios'); openEx('ground'); }
    else if (k.startsWith('resp-')) { go('ejercicios'); openEx('resp'); setBreathMode(k.slice(5)); }
    else if (k === 'relajacion') { go('ejercicios'); openEx('relax'); }
    else if (k === 'meditar') { go('meditar'); setMedMin(5); }
    else if (k === 'gratitud') { go('diario'); setSeg('grat'); }
    else if (k === 'modo-dormir') { go('sonidos'); if (!AU.isOn('lluvia')) toggleSound('lluvia'); setSleepMin(30); }
  }

  /* ---------- frases ---------- */
  let order = [], pos = 0, pinned = null;
  let favs = store.get('favs', []);
  function buildOrder() {
    let idx = FRASES.map((_, i) => i);
    if (mood) {
      const mine = idx.filter(i => FRASES[i][2].includes(mood));
      const rest = idx.filter(i => !FRASES[i][2].includes(mood));
      shuffle(mine); shuffle(rest);
      idx = mine.concat(rest.slice(0, 6));
    } else shuffle(idx);
    order = idx; pos = 0; pinned = null;
  }
  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function cur() { return pinned || FRASES[order[pos]]; }
  const PALETAS = [['#1d2b3a', '#2f4858', '#4a6670'], ['#1f2a33', '#3b4a52', '#6b7f78'], ['#232036', '#3a3a5c', '#5f6a8a'], ['#1b2d2a', '#2f4a44', '#5c7a6c'], ['#2a2330', '#4a3a48', '#7a6470']];
  function renderQuote() {
    const [tag, text] = cur();
    $('tag').textContent = tag; $('quote').textContent = text;
    const on = favs.includes(text);
    $('favBtn').classList.toggle('fav-on', on);
    $('favBtn').querySelector('span').textContent = on ? 'Guardada' : 'Guardar';
    const p = PALETAS[pos % PALETAS.length];
    $('sky').style.background = `linear-gradient(160deg,${p[0]},${p[1]} 55%,${p[2]})`;
  }
  let busy = false;
  function nextQuote() {
    if (busy) return; busy = true;
    $('quote').classList.add('out'); $('tag').style.opacity = 0;
    setTimeout(() => {
      if (pinned) pinned = null; else { pos++; if (pos >= order.length) buildOrder(); }
      renderQuote(); $('quote').classList.remove('out'); $('tag').style.opacity = 1; busy = false;
    }, 650);
  }
  $('quote').onclick = nextQuote; $('nextBtn').onclick = nextQuote;
  let sx = null;
  $('v-frases').addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
  $('v-frases').addEventListener('touchend', e => { if (sx === null) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 60) nextQuote(); sx = null; });
  $('favBtn').onclick = () => {
    const t = cur()[1];
    if (favs.includes(t)) favs = favs.filter(x => x !== t); else { favs = [t, ...favs]; toast('Guardada en Diario › Guardadas'); }
    store.set('favs', favs); renderQuote();
  };
  $('shareBtn').onclick = () => shareQuote(cur()[1]);

  /* ---------- compartir como imagen ---------- */
  async function quoteImage(text) {
    try { await document.fonts.load('300 64px Fraunces'); await document.fonts.load('600 30px Nunito'); } catch (e) {}
    const W = 1080, H = 1350, c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d');
    const p = PALETAS[pos % PALETAS.length];
    const gr = g.createLinearGradient(0, 0, W * 0.6, H); gr.addColorStop(0, p[0]); gr.addColorStop(0.55, p[1]); gr.addColorStop(1, p[2]);
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    const glow = g.createRadialGradient(W * 0.85, H * 0.9, 0, W * 0.85, H * 0.9, W * 0.7);
    glow.addColorStop(0, 'rgba(201,162,126,.35)'); glow.addColorStop(1, 'rgba(201,162,126,0)');
    g.fillStyle = glow; g.fillRect(0, 0, W, H);
    // sol pequeño
    const cx = W / 2, cy = 250;
    const sg = g.createRadialGradient(cx - 12, cy - 14, 4, cx, cy, 46); sg.addColorStop(0, '#f6e7cf'); sg.addColorStop(1, '#c9a27e');
    g.fillStyle = sg; g.beginPath(); g.arc(cx, cy, 44, 0, Math.PI * 2); g.fill();
    // texto
    g.fillStyle = '#f3efe6'; g.textAlign = 'center'; g.textBaseline = 'middle';
    let size = 68, lines;
    const wrap = (s) => { g.font = `300 ${s}px Fraunces, Georgia, serif`; const words = text.split(' '); const out = []; let line = '';
      words.forEach(w => { const t = line ? line + ' ' + w : w; if (g.measureText(t).width > W - 200) { out.push(line); line = w; } else line = t; }); if (line) out.push(line); return out; };
    do { lines = wrap(size); if (lines.length > 7) size -= 4; } while (lines.length > 7 && size > 40);
    const lh = size * 1.35, top = H / 2 + 40 - (lines.length - 1) * lh / 2;
    lines.forEach((l, i) => g.fillText(l, W / 2, top + i * lh));
    g.font = '600 30px Nunito, sans-serif'; g.fillStyle = 'rgba(243,239,230,.55)';
    g.fillText('C A L M A', W / 2, H - 110);
    return c.toDataURL('image/png');
  }
  async function shareQuote(text) {
    const url = await quoteImage(text);
    if (NATIVE && P.Filesystem && P.Share) {
      try {
        const res = await P.Filesystem.writeFile({ path: 'calma-frase.png', data: url.split(',')[1], directory: 'CACHE' });
        await P.Share.share({ title: 'Calma', text: text, files: [res.uri], dialogTitle: 'Compartir frase' });
        return;
      } catch (e) { if (String(e && e.message || e).toLowerCase().includes('cancel')) return; }
    }
    try {
      const blob = await (await fetch(url)).blob();
      const file = new File([blob], 'calma-frase.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], text }); return; }
    } catch (e) { if (e && e.name === 'AbortError') return; }
    $('shareImg').src = url; $('shareView').classList.remove('gone');
  }
  $('shareClose').onclick = () => $('shareView').classList.add('gone');

  /* ---------- ejercicios ---------- */
  const EXS = [
    ['resp', 'breath', 'Respiración', 'Tres ritmos: calma, caja y para dormir'],
    ['ground', 'eye', '5-4-3-2-1', 'Volver al presente usando los sentidos'],
    ['relax', 'body', 'Relajación guiada', 'Una voz te acompaña a aflojar el cuerpo · 3 min']
  ];
  EXS.forEach(([id, ic, t, s]) => {
    const b = document.createElement('button'); b.className = 'card';
    b.innerHTML = `<div class="ic">${svg(ic)}</div><div class="tx"><b>${t}</b><span>${s}</span></div><div class="chev">›</div>`;
    b.onclick = () => openEx(id); $('exlist').append(b);
  });
  let openSub = null;
  function openEx(id) {
    stopBreath(); stopRelax();
    document.querySelectorAll('#v-ejercicios .sub').forEach(s => s.classList.toggle('on', s.id === 'ex-' + id));
    openSub = id === 'menu' ? null : id;
    if (id === 'ground') startGround();
    $('v-ejercicios').scrollTop = 0;
  }
  document.querySelectorAll('[data-back]').forEach(b => b.onclick = () => openEx('menu'));

  // Respiración
  let bMode = 'calma', bRun = false, bTimer = null;
  Object.entries(BREATHING).forEach(([k, m]) => {
    const c = document.createElement('button'); c.className = 'chip'; c.textContent = m.label; c.dataset.k = k;
    c.onclick = () => setBreathMode(k); $('breathModes').append(c);
  });
  function setBreathMode(k) {
    stopBreath(); bMode = k;
    document.querySelectorAll('#breathModes .chip').forEach(c => c.classList.toggle('on', c.dataset.k === k));
    $('bDesc').textContent = BREATHING[k].desc;
  }
  setBreathMode('calma');
  function stopBreath() {
    bRun = false; clearTimeout(bTimer);
    $('circle').style.transition = 'transform 1.5s ease'; $('circle').style.transform = 'scale(1)';
    $('bLabel').textContent = 'Tocá para empezar'; $('bCount').textContent = '';
  }
  function breathStep(i, round) {
    if (!bRun) return;
    const M = BREATHING[bMode]; const [txt, secs, kind] = M.phases[i];
    $('bLabel').textContent = txt; AU.tick();
    $('circle').style.transition = `transform ${secs}s ease-in-out`;
    if (kind === 'in') $('circle').style.transform = 'scale(1.9)';
    if (kind === 'out') $('circle').style.transform = 'scale(1)';
    let left = secs; $('bCount').textContent = left;
    const tick = () => {
      if (!bRun) return; left--;
      if (left > 0) { $('bCount').textContent = left; bTimer = setTimeout(tick, 1000); return; }
      const ni = (i + 1) % M.phases.length, nr = ni === 0 ? round + 1 : round;
      if (nr >= M.rounds) { bRun = false; $('bLabel').textContent = 'Muy bien'; $('bCount').textContent = 'Tocá para otra ronda'; $('circle').style.transform = 'scale(1)'; return; }
      breathStep(ni, nr);
    };
    bTimer = setTimeout(tick, 1000);
  }
  $('breathWrap').onclick = () => { if (bRun) stopBreath(); else { AU.resume(); bRun = true; breathStep(0, 0); } };
  $('bLabel').onclick = $('breathWrap').onclick;

  // 5-4-3-2-1
  let gStep = 0, gCount = 0;
  function startGround() { gStep = 0; renderGround(); }
  function renderGround() {
    const box = $('groundBody');
    if (gStep >= GROUNDING.length) {
      box.innerHTML = `<div style="text-align:center;padding-top:30px"><div class="gnum">✓</div>
        <div class="gwhat">Volviste al presente</div>
        <p class="gtip">Tomá una respiración profunda más. Notá cómo está tu cuerpo ahora.</p>
        <div class="row" style="margin-top:28px"><button class="pill primary" id="gAgain">Hacerlo de nuevo</button></div></div>`;
      $('gAgain').onclick = startGround; return;
    }
    const s = GROUNDING[gStep]; gCount = 0;
    box.innerHTML = `<div class="gnum">${s.n}</div><div class="gwhat">${s.what}</div><p class="gtip">${s.tip}</p>
      <div class="dots">${'<button class="dot"></button>'.repeat(s.n)}</div>
      <p class="muted">Tocá un círculo por cada una que encuentres</p>
      <div class="gprog">${GROUNDING.map((_, i) => `<i class="${i <= gStep ? 'on' : ''}"></i>`).join('')}</div>`;
    box.querySelectorAll('.dot').forEach(d => d.onclick = () => {
      if (d.classList.contains('on')) return;
      d.classList.add('on'); gCount++; AU.tick();
      if (gCount >= s.n) setTimeout(() => { gStep++; renderGround(); }, 900);
    });
  }

  // Relajación guiada
  let rRun = false, rIdx = 0, rTimer = null, ttsLang = null;
  async function pickLang() {
    if (ttsLang) return ttsLang;
    ttsLang = 'es-ES';
    try {
      if (NATIVE && P.TextToSpeech) {
        const r = await P.TextToSpeech.getSupportedLanguages();
        const L = (r.languages || []).map(x => x.replace('_', '-'));
        ttsLang = ['es-AR', 'es-US', 'es-419', 'es-MX', 'es-ES'].find(x => L.includes(x)) || L.find(x => x.startsWith('es')) || 'es-ES';
      } else if (window.speechSynthesis) {
        const V = speechSynthesis.getVoices().map(v => v.lang.replace('_', '-'));
        ttsLang = ['es-AR', 'es-US', 'es-419', 'es-MX', 'es-ES'].find(x => V.includes(x)) || 'es-ES';
      }
    } catch (e) {}
    return ttsLang;
  }
  /* --- voces del celular --- */
  let voiceCache = null;
  async function listVoices() {
    if (voiceCache) return voiceCache;
    let all = [];
    try {
      if (NATIVE && P.TextToSpeech) all = (await P.TextToSpeech.getSupportedVoices()).voices || [];
      else if (window.speechSynthesis) {
        all = speechSynthesis.getVoices();
        if (!all.length) { await new Promise(r => { speechSynthesis.onvoiceschanged = r; setTimeout(r, 1500); }); all = speechSynthesis.getVoices(); }
      }
    } catch (e) {}
    // guardamos el índice original: el plugin elige la voz por índice
    voiceCache = all.map((v, i) => ({ i, uri: v.voiceURI || v.name, name: v.name || v.voiceURI, lang: (v.lang || '').replace('_', '-'), local: v.localService !== false, raw: v }))
      .filter(v => v.lang.toLowerCase().startsWith('es'));
    const rank = l => ({ 'es-AR': 0, 'es-US': 1, 'es-419': 2, 'es-MX': 3 })[l] ?? 5;
    voiceCache.sort((a, b) => rank(a.lang) - rank(b.lang) || (b.local - a.local));
    return voiceCache;
  }
  const REGION = { 'es-AR': 'Argentina', 'es-US': 'Latinoamérica', 'es-419': 'Latinoamérica', 'es-MX': 'México', 'es-ES': 'España', 'es-CO': 'Colombia', 'es-CL': 'Chile' };
  const vRate = () => store.get('vRate', 0.78), vPitch = () => store.get('vPitch', 0.85);
  async function chosenVoice() {
    const uri = store.get('vUri', null); if (!uri) return null;
    return (await listVoices()).find(v => v.uri === uri) || null;
  }
  async function sayWith(text, v) {
    const rate = vRate(), pitch = vPitch();
    if (NATIVE && P.TextToSpeech) {
      const opts = { text, lang: v ? v.lang : await pickLang(), rate, pitch, volume: 1.0, category: 'playback' };
      if (v) opts.voice = v.i;
      return P.TextToSpeech.speak(opts);
    }
    if (window.speechSynthesis) return new Promise(res => {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text); u.rate = rate; u.pitch = pitch;
      if (v) { u.voice = v.raw; u.lang = v.lang; } else u.lang = 'es-ES';
      let done = false; const fin = () => { if (!done) { done = true; res(); } };
      u.onend = fin; u.onerror = fin; setTimeout(fin, text.length * 150 + 3000);
      speechSynthesis.speak(u);
    });
  }
  function speak(text) {
    if (!store.get('voice', true)) return new Promise(r => setTimeout(r, Math.max(3500, text.length * 65)));
    return chosenVoice().then(v => {
      if (NATIVE && P.TextToSpeech) {
        return sayWith(text, v).catch(() => new Promise(r => setTimeout(r, text.length * 65)));
      }
      if (window.speechSynthesis) return sayWith(text, v);
      return new Promise(r => setTimeout(r, Math.max(3500, text.length * 65)));
    });
  }
  async function renderVoiceName() {
    const v = await chosenVoice();
    $('voiceName').textContent = v ? `${REGION[v.lang] || v.lang} · voz ${voiceCache.indexOf(v) + 1}` : 'La predeterminada del celular';
  }
  async function openVoices() {
    $('voices').classList.add('on'); $('scrim').classList.add('on');
    const L = $('voiceList'); L.innerHTML = '<p class="muted">Buscando voces…</p>';
    const list = await listVoices();
    if (!list.length) { L.innerHTML = '<p class="muted" style="text-align:left">No encontré voces en español. En el celular, andá a Ajustes → Idioma → Texto a voz (o "Salida de texto a voz") e instalá el español desde "Servicios de voz de Google".</p>'; return; }
    const sel = store.get('vUri', null);
    L.innerHTML = '';
    list.forEach((v, n) => {
      const d = document.createElement('div'); d.className = 'card small' + (v.uri === sel ? ' on' : '');
      if (v.uri === sel) d.style.borderColor = 'rgba(233,201,154,.6)';
      d.innerHTML = `<button class="iconbtn" style="width:38px;height:38px" aria-label="Escuchar">▶</button>
        <div class="tx"><b>Voz ${n + 1} · ${REGION[v.lang] || v.lang}</b><span>${v.local ? '' : 'Necesita internet · '}${v.name}</span></div>
        <div class="chev">${v.uri === sel ? '✓' : ''}</div>`;
      d.querySelector('button').onclick = e => { e.stopPropagation(); stopSpeak(); sayWith('Tomá una respiración profunda, y soltala despacio. No hay apuro.', v).catch(() => toast('No pude reproducir esta voz')); };
      d.onclick = () => { store.set('vUri', v.uri); openVoices(); renderVoiceName(); };
      L.append(d);
    });
  }
  function closeVoices() { stopSpeak(); $('voices').classList.remove('on'); if (!$('settings').classList.contains('on')) $('scrim').classList.remove('on'); }
  const updLbls = () => { $('rateLbl').textContent = Math.round(vRate() * 100) + '%'; $('pitchLbl').textContent = vPitch() < 0.95 ? 'más grave' : vPitch() > 1.02 ? 'más agudo' : 'normal'; };
  $('voiceRate').value = Math.round(vRate() * 100); $('voicePitch').value = Math.round(vPitch() * 100); updLbls();
  $('voiceRate').oninput = e => { store.set('vRate', e.target.value / 100); updLbls(); };
  $('voicePitch').oninput = e => { store.set('vPitch', e.target.value / 100); updLbls(); };
  $('voicePick').onclick = openVoices;
  $('voicesClose').onclick = closeVoices;
  renderVoiceName();

  function stopSpeak() {
    try { if (NATIVE && P.TextToSpeech) P.TextToSpeech.stop(); else if (window.speechSynthesis) speechSynthesis.cancel(); } catch (e) {}
  }
  async function relaxStep() {
    if (!rRun) return;
    if (rIdx >= RELAJACION.length) { stopRelax(true); return; }
    const [text, pause] = RELAJACION[rIdx];
    $('rText').style.opacity = 0;
    await new Promise(r => setTimeout(r, 500));
    if (!rRun) return;
    $('rText').textContent = text; $('rText').style.opacity = 1;
    $('rBar').style.width = ((rIdx + 1) / RELAJACION.length * 100) + '%';
    await speak(text);
    if (!rRun) return;
    rIdx++; rTimer = setTimeout(relaxStep, pause * 1000);
  }
  function stopRelax(finished) {
    const was = rRun; rRun = false; clearTimeout(rTimer); stopSpeak(); keepAwake(false);
    $('rPlay').style.display = ''; $('rStop').style.display = 'none';
    $('rPlay').textContent = finished ? 'Repetir' : 'Empezar';
    if (finished) { $('rText').textContent = 'Muy bien. Quedate con esta sensación un ratito más.'; AU.bell(1); }
    else if (was) { $('rText').textContent = 'Unos 3 minutos para aflojar el cuerpo de pies a cabeza.'; $('rBar').style.width = '0'; }
  }
  $('rPlay').onclick = () => {
    AU.resume(); rRun = true; rIdx = 0; keepAwake(true);
    if (!AU.anyOn()) { toggleSound('musica'); }
    $('rPlay').style.display = 'none'; $('rStop').style.display = ''; $('rBar').style.width = '0';
    relaxStep();
  };
  $('rStop').onclick = () => stopRelax(false);

  /* ---------- meditar ---------- */
  const MED_OPTS = [3, 5, 10, 15, 20];
  let medMin = store.get('medMin', 5), medEnd = 0, medTotal = 0, medInt = null;
  const RING = 2 * Math.PI * 46;
  $('medRing').style.strokeDasharray = RING;
  MED_OPTS.forEach(m => { const c = document.createElement('button'); c.className = 'chip'; c.textContent = m + ' min'; c.dataset.m = m; c.onclick = () => setMedMin(m); $('medChips').append(c); });
  const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  function setMedMin(m) {
    if (medInt) return;
    medMin = m; store.set('medMin', m);
    document.querySelectorAll('#medChips .chip').forEach(c => c.classList.toggle('on', +c.dataset.m === m));
    $('medTime').textContent = fmt(m * 60); $('medRing').style.strokeDashoffset = 0; $('medState').textContent = 'Listo para empezar';
  }
  setMedMin(medMin);
  function medTick() {
    const left = Math.max(0, (medEnd - Date.now()) / 1000);
    $('medTime').textContent = fmt(Math.ceil(left));
    $('medRing').style.strokeDashoffset = RING * (1 - left / medTotal);
    if (left <= 0) { stopMed(true); }
  }
  function stopMed(done) {
    clearInterval(medInt); medInt = null; keepAwake(false);
    $('medStart').style.display = ''; $('medStop').style.display = 'none';
    document.querySelectorAll('#medChips .chip').forEach(c => c.disabled = false);
    if (done) { AU.bell(3); $('medState').textContent = 'Terminaste. Muy bien.'; $('medTime').textContent = '0:00'; setTimeout(() => { if (!medInt) setMedMin(medMin); }, 15000); }
    else setMedMin(medMin);
  }
  $('medStart').onclick = () => {
    AU.resume(); AU.bell(1); keepAwake(true);
    medTotal = medMin * 60; medEnd = Date.now() + medTotal * 1000;
    $('medStart').style.display = 'none'; $('medStop').style.display = '';
    $('medState').textContent = 'Respirá natural';
    medInt = setInterval(medTick, 1000); medTick();
  };
  $('medStop').onclick = () => stopMed(false);

  /* ---------- sonidos ---------- */
  const SICON = { musica: 'music', lluvia: 'rain', mar: 'sea', bosque: 'tree', fuego: 'fire', cuencos: 'bowl' };
  const savedVols = store.get('vols', {});
  AU.LIST.forEach(([id, label]) => {
    if (savedVols[id] != null) AU.setVolume(id, savedVols[id]);
    const d = document.createElement('div'); d.className = 'scard'; d.id = 's-' + id;
    d.innerHTML = `<div class="top"><div class="ic">${svg(SICON[id])}</div><b>${label}</b></div><input type="range" min="0" max="100" value="${Math.round(AU.getVolume(id) * 100)}">`;
    d.onclick = e => { if (e.target.tagName !== 'INPUT') toggleSound(id); };
    const r = d.querySelector('input');
    r.oninput = () => { AU.setVolume(id, r.value / 100); savedVols[id] = r.value / 100; store.set('vols', savedVols); };
    $('sgrid').append(d);
  });
  function refreshSounds() {
    AU.LIST.forEach(([id]) => $('s-' + id).classList.toggle('on', AU.isOn(id)));
    $('musicBtn').classList.toggle('lit', AU.anyOn());
    store.set('active', AU.LIST.map(x => x[0]).filter(AU.isOn));
  }
  function toggleSound(id) { AU.set(id, !AU.isOn(id)); refreshSounds(); }
  $('masterVol').value = Math.round(store.get('master', 0.55) * 100);
  AU.setMaster(store.get('master', 0.55));
  $('masterVol').oninput = e => { AU.setMaster(e.target.value / 100); store.set('master', e.target.value / 100); };
  $('musicBtn').onclick = () => {
    if (AU.anyOn()) { AU.LIST.forEach(([id]) => AU.isOn(id) && AU.set(id, false)); }
    else { const last = store.get('lastMix', ['musica']); last.forEach(id => AU.set(id, true)); }
    refreshSounds();
  };
  // recordar la última mezcla para el botón rápido
  setInterval(() => { const a = AU.LIST.map(x => x[0]).filter(AU.isOn); if (a.length) store.set('lastMix', a); }, 5000);

  // modo dormir
  const SLEEP_OPTS = [15, 30, 45, 60];
  let sleepMin = 30, sleepEnd = 0, sleepInt = null, lastTap = 0;
  SLEEP_OPTS.forEach(m => { const c = document.createElement('button'); c.className = 'chip'; c.textContent = m + ' min'; c.dataset.m = m; c.onclick = () => setSleepMin(m); $('sleepChips').append(c); });
  function setSleepMin(m) { sleepMin = m; document.querySelectorAll('#sleepChips .chip').forEach(c => c.classList.toggle('on', +c.dataset.m === m)); }
  setSleepMin(30);
  $('sleepGo').onclick = () => {
    AU.resume();
    if (!AU.anyOn()) { AU.set('lluvia', true); refreshSounds(); }
    sleepEnd = Date.now() + sleepMin * 60000; keepAwake(true);
    $('sleepView').classList.remove('gone');
    const upd = () => {
      const left = Math.max(0, sleepEnd - Date.now());
      $('sleepText').textContent = left > 0 ? `Los sonidos se apagan en ${Math.ceil(left / 60000)} min` : 'Que descanses';
      if (left <= 0) { clearInterval(sleepInt); sleepInt = null; AU.fadeAllOut(60).then(refreshSounds); }
    };
    clearInterval(sleepInt); sleepInt = setInterval(upd, 10000); upd();
  };
  $('sleepView').onclick = () => {
    const n = Date.now();
    if (n - lastTap < 450) { $('sleepView').classList.add('gone'); keepAwake(false); if (sleepInt) toast(`Los sonidos se siguen apagando solos en ${Math.ceil((sleepEnd - n) / 60000)} min`, 'Cancelar', () => { clearInterval(sleepInt); sleepInt = null; }); }
    lastTap = n;
  };

  /* ---------- diario ---------- */
  function setSeg(k) {
    document.querySelectorAll('.seg button').forEach(b => b.classList.toggle('on', b.dataset.seg === k));
    $('seg-grat').style.display = k === 'grat' ? '' : 'none'; $('seg-favs').style.display = k === 'favs' ? '' : 'none';
    if (k === 'favs') renderFavs(); else renderGrat();
  }
  document.querySelectorAll('.seg button').forEach(b => b.onclick = () => setSeg(b.dataset.seg));
  let grat = store.get('gratitud', []);
  const dayKey = d => d.toISOString().slice(0, 10);
  function fmtDate(k) {
    const today = dayKey(new Date()), y = new Date(); y.setDate(y.getDate() - 1);
    if (k === today) return 'Hoy'; if (k === dayKey(y)) return 'Ayer';
    const [Y, M, D] = k.split('-').map(Number);
    return new Date(Y, M - 1, D).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
  }
  function renderGrat() {
    const L = $('gList'); L.innerHTML = '';
    if (!grat.length) { L.innerHTML = '<p class="empty" style="padding:10px">Lo que anotes va a quedar acá, para releerlo cuando lo necesites.</p>'; return; }
    grat.forEach((e, idx) => {
      const d = document.createElement('div'); d.className = 'entry';
      const head = document.createElement('div'); head.className = 'd';
      const s = document.createElement('span'); s.textContent = fmtDate(e.d);
      const x = document.createElement('button'); x.className = 'xbtn'; x.textContent = '×'; x.setAttribute('aria-label', 'Borrar');
      x.onclick = () => { const removed = grat.splice(idx, 1)[0]; store.set('gratitud', grat); renderGrat(); toast('Entrada borrada', 'Deshacer', () => { grat.splice(idx, 0, removed); store.set('gratitud', grat); renderGrat(); }); };
      head.append(s, x);
      const ul = document.createElement('ul'); e.items.forEach(t => { const li = document.createElement('li'); li.textContent = t; ul.append(li); });
      d.append(head, ul); L.append(d);
    });
  }
  $('gSave').onclick = () => {
    const items = ['g1', 'g2', 'g3'].map(id => $(id).value.trim()).filter(Boolean);
    if (!items.length) { toast('Escribí al menos una cosa'); return; }
    const k = dayKey(new Date());
    const ex = grat.find(e => e.d === k);
    if (ex) ex.items = ex.items.concat(items); else grat.unshift({ d: k, items });
    store.set('gratitud', grat); ['g1', 'g2', 'g3'].forEach(id => $(id).value = '');
    renderGrat(); toast('Guardado. Qué lindo.');
  };
  function renderFavs() {
    const box = $('favList'); box.innerHTML = '';
    if (!favs.length) { box.innerHTML = '<p class="empty">Todavía no guardaste ninguna frase.<br>Tocá “Guardar” en las que te hagan bien.</p>'; return; }
    favs.forEach(t => {
      const d = document.createElement('div'); d.className = 'favitem';
      const s = document.createElement('span'); s.textContent = t;
      const sh = document.createElement('button'); sh.className = 'xbtn'; sh.innerHTML = svg('leaf'); sh.style.width = '22px'; sh.setAttribute('aria-label', 'Ver');
      sh.onclick = () => { const f = FRASES.find(x => x[1] === t) || ['Guardada', t, []]; pinned = f; go('frases'); renderQuote(); };
      const x = document.createElement('button'); x.className = 'xbtn'; x.textContent = '×'; x.setAttribute('aria-label', 'Quitar');
      x.onclick = () => { favs = favs.filter(y => y !== t); store.set('favs', favs); renderFavs(); renderQuote(); };
      d.append(s, sh, x); box.append(d);
    });
  }

  /* ---------- ajustes y notificaciones ---------- */
  function openSettings() { $('settings').classList.add('on'); $('scrim').classList.add('on'); }
  function closeSettings() { $('settings').classList.remove('on'); $('scrim').classList.remove('on'); }
  $('settingsBtn').onclick = openSettings; $('scrim').onclick = () => { if ($('voices').classList.contains('on')) closeVoices(); else closeSettings(); };
  $('version').textContent = 'Versión ' + VERSION;
  const setTog = (el, on) => el.classList.toggle('on', !!on);
  setTog($('voiceTog'), store.get('voice', true));
  setTog($('askTog'), store.get('ask', true));
  setTog($('notifTog'), store.get('notif', false));
  $('notifTime').value = store.get('notifTime', '09:00');
  $('voiceTog').onclick = () => { const v = !store.get('voice', true); store.set('voice', v); setTog($('voiceTog'), v); };
  $('askTog').onclick = () => { const v = !store.get('ask', true); store.set('ask', v); setTog($('askTog'), v); };
  $('notifTog').onclick = async () => {
    const v = !store.get('notif', false);
    if (v) { const ok = await scheduleDaily(true); if (!ok) return; }
    else await cancelDaily();
    store.set('notif', v); setTog($('notifTog'), v);
    toast(v ? `Te va a llegar una frase todos los días a las ${$('notifTime').value}` : 'Frase del día desactivada');
  };
  $('notifTime').onchange = () => { store.set('notifTime', $('notifTime').value); if (store.get('notif', false)) scheduleDaily(false).then(ok => ok && toast('Hora actualizada')); };

  const NID = 1000, NDAYS = 60;
  async function cancelDaily() {
    const LN = P.LocalNotifications; if (!NATIVE || !LN) return;
    try { await LN.cancel({ notifications: Array.from({ length: NDAYS }, (_, i) => ({ id: NID + i })) }); } catch (e) {}
  }
  async function scheduleDaily(ask) {
    const LN = P.LocalNotifications;
    if (!NATIVE || !LN) { toast('Las notificaciones funcionan en la app instalada'); return false; }
    try {
      let perm = await LN.checkPermissions();
      if (perm.display !== 'granted') {
        if (!ask) return false;
        perm = await LN.requestPermissions();
        if (perm.display !== 'granted') { toast('Necesito permiso para mandarte notificaciones'); return false; }
      }
      await cancelDaily();
      const [h, m] = (store.get('notifTime', '09:00') || '09:00').split(':').map(Number);
      const start = new Date(); start.setHours(h, m, 0, 0);
      if (start <= new Date()) start.setDate(start.getDate() + 1);
      const pool = shuffle(FRASES.map((_, i) => i));
      const notifications = [];
      for (let i = 0; i < NDAYS; i++) {
        const at = new Date(start); at.setDate(start.getDate() + i);
        const f = FRASES[pool[i % pool.length]];
        notifications.push({ id: NID + i, title: 'Tu frase de hoy', body: f[1], largeBody: f[1], schedule: { at, allowWhileIdle: true }, smallIcon: 'ic_stat_calma', iconColor: '#E9C99A', extra: { text: f[1] } });
      }
      await LN.schedule({ notifications });
      return true;
    } catch (e) { toast('No pude programar las notificaciones'); return false; }
  }
  if (NATIVE && P.LocalNotifications) {
    try {
      P.LocalNotifications.addListener('localNotificationActionPerformed', ev => {
        const t = ev && ev.notification && ev.notification.extra && ev.notification.extra.text;
        if (t) { const f = FRASES.find(x => x[1] === t); if (f) { pinned = f; go('frases'); renderQuote(); } }
        $('welcome').classList.add('gone'); closeMood();
      });
    } catch (e) {}
    // renovar las próximas frases cada vez que se abre la app
    if (store.get('notif', false)) scheduleDaily(false);
  }

  /* ---------- botón atrás de Android ---------- */
  if (NATIVE && P.App) {
    try {
      P.App.addListener('backButton', () => {
        if (!$('shareView').classList.contains('gone')) return $('shareView').classList.add('gone');
        if ($('voices').classList.contains('on')) return closeVoices();
        if ($('settings').classList.contains('on')) return closeSettings();
        if (!$('moodsheet').classList.contains('gone')) return closeMood();
        if (!$('sleepView').classList.contains('gone')) return;
        if (currentView === 'ejercicios' && openSub) return openEx('menu');
        if (currentView !== 'frases') return go('frases');
        P.App.minimizeApp ? P.App.minimizeApp() : P.App.exitApp();
      });
    } catch (e) {}
  }

  /* ---------- inicio ---------- */
  function enter(withSound) {
    $('welcome').classList.add('gone');
    if (withSound) {
      AU.resume();
      const last = store.get('lastMix', ['musica']);
      last.forEach(id => AU.set(id, true)); refreshSounds();
    }
    if (store.get('ask', true)) setTimeout(openMood, 500);
  }
  $('startSound').onclick = () => enter(true);
  $('startSilent').onclick = () => enter(false);

  buildOrder(); renderQuote(); renderMoodChip();
})();
