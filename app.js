(() => {
  const SYMBOLS = ['jeep', 'umbrella'];
  const LABELS = { jeep: 'Jeep', umbrella: 'Umbrella' };
  const FILES = { jeep: 'images/jeep.webp', umbrella: 'images/umbrella.png' };
  const COLORS = ['#1d4ed8', '#b91c1c'];
  const STORE_KEY = 'classElection.v2';

  const $ = (id) => document.getElementById(id);
  const screens = { setup: $('screen-setup'), vote: $('screen-vote'), result: $('screen-result') };

  // state: phase, candidates [{name, symbol}], votes [n, n]
  let state = load() || { phase: 'setup', candidates: [{}, {}], votes: [0, 0] };
  const picked = [state.candidates[0].symbol || SYMBOLS[0], state.candidates[1].symbol || SYMBOLS[1]];

  function load() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)); } catch { return null; }
  }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch { /* storage unavailable */ }
  }
  function show(name) {
    Object.entries(screens).forEach(([k, el]) => el.classList.toggle('active', k === name));
    document.body.dataset.screen = name;
  }

  // ---------- sound ----------
  let audioCtx;
  function tone(freq, start, dur, type = 'sine', vol = 0.35) {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const t = audioCtx.currentTime + start;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + dur);
  }
  const beep = () => tone(1000, 0, 0.25, 'square', 0.25);
  const fanfare = () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.16, 0.4, 'triangle'));

  // ---------- setup ----------
  function buildSymbolPickers() {
    [0, 1].forEach((i) => {
      const box = $('symbols-' + i);
      box.innerHTML = '';
      SYMBOLS.forEach((s) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.dataset.sym = s;
        b.append(badge(s));
        b.setAttribute('aria-label', 'Symbol ' + s);
        b.addEventListener('click', () => {
          picked[i] = s;
          picked[1 - i] = SYMBOLS.find((x) => x !== s); // only two symbols: the other candidate gets the other one
          refreshPickers();
        });
        box.appendChild(b);
      });
    });
    refreshPickers();
  }
  function refreshPickers() {
    [0, 1].forEach((i) => {
      [...$('symbols-' + i).children].forEach((b) => {
        b.classList.toggle('selected', b.dataset.sym === picked[i]);
      });
    });
  }

  $('btn-start').addEventListener('click', () => {
    const names = [$('name-0').value.trim(), $('name-1').value.trim()];
    let err = '';
    if (!names[0] || !names[1]) err = 'Please enter both names.';
    else if (names[0].toLowerCase() === names[1].toLowerCase()) err = 'The two candidates need different names.';
    $('setup-error').textContent = err;
    if (err) return;
    state = {
      phase: 'vote',
      candidates: names.map((name, i) => ({ name, symbol: picked[i] })),
      votes: [0, 0],
    };
    save();
    beep(); // also unlocks audio
    renderVote();
  });

  // ---------- voting ----------
  let locked = false;
  function renderVote() {
    [0, 1].forEach((i) => {
      const c = state.candidates[i];
      const card = $('cand-' + i);
      card.innerHTML = '';
      const sym = badge(c.symbol, 'xl');
      const nm = el('span', 'nm', c.name);
      const go = el('span', 'go', 'VOTE');
      card.append(sym, nm, go);
      card.setAttribute('aria-label', 'Vote for ' + c.name);
    });
    $('count').textContent = state.votes[0] + state.votes[1];
    show('vote');
  }
  function badge(sym, size = '') {
    const img = document.createElement('img');
    img.className = ('badge ' + size).trim();
    img.src = FILES[sym];
    img.alt = LABELS[sym];
    return img;
  }
  function el(tag, cls, text) {
    const e = document.createElement(tag);
    e.className = cls;
    e.textContent = text;
    return e;
  }

  [0, 1].forEach((i) => {
    $('cand-' + i).addEventListener('click', () => {
      if (locked) return;
      locked = true; // prevents double-clicks / the next student seeing the pick
      state.votes[i]++;
      save();
      beep();
      $('count').textContent = state.votes[0] + state.votes[1];
      $('thanks').classList.add('show');
      setTimeout(() => {
        $('thanks').classList.remove('show');
        locked = false;
      }, 1500);
    });
  });

  $('btn-end').addEventListener('click', () => $('confirm').showModal());
  $('confirm-no').addEventListener('click', () => $('confirm').close());
  $('confirm-yes').addEventListener('click', () => {
    $('confirm').close();
    state.phase = 'result';
    save();
    renderResult();
  });

  // ---------- result ----------
  function renderResult() {
    const [a, b] = state.votes;
    const tie = a === b;
    const w = a > b ? 0 : 1;
    const total = a + b;

    $('btn-revote').hidden = !tie;
    if (total === 0) {
      $('result-title').textContent = 'No votes were cast';
      $('winner').style.display = 'none';
      $('result-note').textContent = 'Start a new election and vote again.';
      $('btn-revote').hidden = true;
    } else if (tie) {
      $('result-title').textContent = "It's a tie";
      $('winner').style.display = 'none';
      $('result-note').textContent = 'Both candidates got the same number of votes. Vote again to decide!';
    } else {
      $('result-title').textContent = 'Congratulations!';
      const win = $('winner');
      win.style.display = '';
      win.innerHTML = '';
      win.append(el('span', 'label', 'Winner'), badge(state.candidates[w].symbol, 'xl'), el('span', 'nm', state.candidates[w].name));
      $('result-note').textContent = 'The candidate with the most votes wins.';
    }

    const bars = $('bars');
    bars.innerHTML = '';
    const fills = [0, 1].map((i) => {
      const row = el('div', 'bar-row', '');
      const track = el('div', 'bar-track', '');
      const fill = el('div', 'bar-fill', '');
      fill.style.background = COLORS[i];
      track.append(fill);
      const label = el('span', 'bar-label', '');
      label.append(badge(state.candidates[i].symbol, 'sm'), el('span', '', state.candidates[i].name));
      row.append(
        label,
        track,
        el('span', 'bar-num', String(state.votes[i]))
      );
      bars.append(row);
      return fill;
    });

    show('result');
    requestAnimationFrame(() => requestAnimationFrame(() => {
      fills.forEach((f, i) => { f.style.width = total ? (state.votes[i] / total) * 100 + '%' : '0'; });
    }));
    if (total && !tie) fanfare();
  }

  $('btn-new').addEventListener('click', () => {
    state = { phase: 'setup', candidates: [{}, {}], votes: [0, 0] };
    picked[0] = SYMBOLS[0];
    picked[1] = SYMBOLS[1];
    $('name-0').value = $('name-1').value = '';
    $('setup-error').textContent = '';
    save();
    refreshPickers();
    show('setup');
  });
  $('btn-revote').addEventListener('click', () => {
    state.votes = [0, 0];
    state.phase = 'vote';
    save();
    renderVote();
  });

  // ---------- init ----------
  buildSymbolPickers();
  if (state.candidates[0].name) {
    $('name-0').value = state.candidates[0].name;
    $('name-1').value = state.candidates[1].name;
  }
  if (state.phase === 'vote') renderVote();
  else if (state.phase === 'result') renderResult();
})();
