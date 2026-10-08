'use strict';
/* Animações das metaheurísticas (Aula 8) -- problema da mochila 0/1.
 * Cada algoritmo é um gerador: cada `yield` produz um passo visível.
 * O desenho (p5.js) é independente dos algoritmos e só lê os passos. */

/* ---------- utilidades ---------- */

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function fmt(v, d) {
  return Number(v).toLocaleString('pt-BR', { maximumFractionDigits: d === undefined ? 2 : d });
}

function shuffle(a, rnd) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const items = (idx) => idx.map((i) => i + 1).join(', ');

/* ---------- instâncias ---------- */

function knapsackOptimum(p, b, C) {
  const dp = new Array(C + 1).fill(0);
  for (let i = 0; i < p.length; i++)
    for (let c = C; c >= p[i]; c--) dp[c] = Math.max(dp[c], dp[c - p[i]] + b[i]);
  return dp[C];
}

function makeInstance(key) {
  let inst;
  if (key === 'aula') {
    inst = { key, nome: 'Aula 7 (n = 7, C = 18)', p: [4, 7, 2, 7, 2, 9, 9], b: [7, 6, 27, 27, 19, 30, 9], C: 18 };
  } else {
    const r = mulberry32(2024), n = 30, p = [], b = [];
    for (let i = 0; i < n; i++) {
      p.push(3 + Math.floor(r() * 23));
      b.push(p[i] + 5 + Math.floor(r() * 11));
    }
    inst = { key, nome: 'Maior (n = 30)', p, b, C: Math.floor(0.4 * p.reduce((s, v) => s + v, 0)) };
  }
  inst.n = inst.p.length;
  inst.opt = knapsackOptimum(inst.p, inst.b, inst.C);
  inst.meanB = inst.b.reduce((s, v) => s + v, 0) / inst.n;
  if (inst.n <= 12) {
    // Enumeração: paisagem completa, ordenada por código de Gray
    const N = 1 << inst.n;
    inst.sols = [];
    inst.posOf = new Array(N);
    for (let i = 0; i < N; i++) {
      const mask = i ^ (i >> 1);
      let w = 0, f = 0;
      for (let k = 0; k < inst.n; k++) if (mask & (1 << k)) { w += inst.p[k]; f += inst.b[k]; }
      inst.sols.push({ mask, feasible: w <= inst.C, f });
      inst.posOf[mask] = i;
    }
  }
  return inst;
}

const INSTANCES = { aula: makeInstance('aula'), grande: makeInstance('grande') };

/* ---------- operações sobre soluções ---------- */

function evalSol(inst, x) {
  let w = 0, f = 0;
  for (let i = 0; i < inst.n; i++) if (x[i]) { w += inst.p[i]; f += inst.b[i]; }
  return { w, f };
}

function step(inst, x, msg, changed, extra) {
  const { w, f } = evalSol(inst, x);
  return Object.assign({ x: x.slice(), w, f, msg, changed: changed || [] }, extra || {});
}

function greedy(inst) {
  const order = [...Array(inst.n).keys()].sort((i, j) => inst.b[j] / inst.p[j] - inst.b[i] / inst.p[i]);
  const x = new Array(inst.n).fill(0);
  let w = 0;
  for (const i of order) if (w + inst.p[i] <= inst.C) { x[i] = 1; w += inst.p[i]; }
  return x;
}

function applyMove(x, m) {
  if (m.out != null) x[m.out] = 0;
  if (m.in != null) x[m.in] = 1;
}

function describe(m) {
  if (m.out == null) return `insere o item ${m.in + 1}`;
  if (m.in == null) return `remove o item ${m.out + 1}`;
  return `troca (sai ${m.out + 1}, entra ${m.in + 1})`;
}

const changedOf = (m) => [m.out, m.in].filter((v) => v != null);

/* Melhor vizinho de x em N1 (inserção), N2 (troca) ou ambas. */
function bestMove(inst, x, kind) {
  const { p, b, C, n } = inst;
  const w = evalSol(inst, x).w;
  let best = null, bd = 0;
  if (kind !== 'swap')
    for (let i = 0; i < n; i++)
      if (!x[i] && w + p[i] <= C && b[i] > bd) { bd = b[i]; best = { in: i, delta: b[i] }; }
  if (kind !== 'insert')
    for (let i = 0; i < n; i++) {
      if (!x[i]) continue;
      for (let j = 0; j < n; j++) {
        if (x[j] || w - p[i] + p[j] > C) continue;
        const d = b[j] - b[i];
        if (d > bd) { bd = d; best = { out: i, in: j, delta: d }; }
      }
    }
  return best;
}

/* Vizinho aleatório viável (inserção, remoção ou troca). */
function randomMove(inst, x, rnd) {
  const { p, b, C, n } = inst;
  const w = evalSol(inst, x).w;
  for (let t = 0; t < 30; t++) {
    const i = Math.floor(rnd() * n);
    if (!x[i]) {
      if (w + p[i] <= C) return { in: i, delta: b[i] };
      const cand = [];
      for (let j = 0; j < n; j++) if (x[j] && w - p[j] + p[i] <= C) cand.push(j);
      if (cand.length) { const j = cand[Math.floor(rnd() * cand.length)]; return { out: j, in: i, delta: b[i] - b[j] }; }
    } else if (rnd() < 0.5) {
      return { out: i, delta: -b[i] };
    } else {
      const cand = [];
      for (let j = 0; j < n; j++) if (!x[j] && w - p[i] + p[j] <= C) cand.push(j);
      if (cand.length) { const j = cand[Math.floor(rnd() * cand.length)]; return { out: i, in: j, delta: b[j] - b[i] }; }
    }
  }
  return null;
}

/* Busca local de melhor melhora com inserção e troca. Retorna o ótimo local. */
function* localSearch(inst, x, tag) {
  x = x.slice();
  for (;;) {
    const m = bestMove(inst, x, 'both');
    if (!m) return x;
    applyMove(x, m);
    yield step(inst, x, `${tag}: ${describe(m)} (+${m.delta})`, changedOf(m));
  }
}

/* ---------- algoritmos ---------- */

function* ils(inst, P, rnd) {
  let x = greedy(inst);
  yield step(inst, x, 'Solução inicial gulosa');
  x = yield* localSearch(inst, x, 'Busca local inicial');
  yield step(inst, x, `Ótimo local inicial: benefício ${evalSol(inst, x).f}`);
  for (let it = 1; it <= P.iter; it++) {
    const y = x.slice();
    const ins = shuffle([...Array(inst.n).keys()].filter((i) => y[i]), rnd).slice(0, P.k);
    ins.forEach((i) => (y[i] = 0));
    yield step(inst, y, `Iteração ${it}: perturbação remove os itens ${items(ins)}`, ins);
    const z = yield* localSearch(inst, y, `Iteração ${it}: busca local`);
    const fx = evalSol(inst, x).f, fz = evalSol(inst, z).f;
    let ok;
    if (P.crit === 'melhor') ok = fz > fx;
    else if (P.crit === 'sempre') ok = true;
    else ok = fz >= 0.95 * fx;
    if (ok) x = z;
    yield step(inst, x, `Iteração ${it}: f(x'') = ${fz}, f(x) = ${fx}; ${ok ? 'aceita x\'\'' : 'rejeita, mantém x'}`);
  }
}

function* grasp(inst, P, rnd) {
  for (let it = 1; it <= P.iter; it++) {
    const x = new Array(inst.n).fill(0);
    let w = 0;
    yield step(inst, x, `Iteração ${it}: construção semigulosa (α = ${fmt(P.alpha)})`);
    for (;;) {
      const cand = [];
      for (let i = 0; i < inst.n; i++) if (!x[i] && w + inst.p[i] <= inst.C) cand.push(i);
      if (!cand.length) break;
      const g = (i) => inst.b[i] / inst.p[i];
      const gmax = Math.max(...cand.map(g)), gmin = Math.min(...cand.map(g));
      const lrc = cand.filter((i) => g(i) >= gmax - P.alpha * (gmax - gmin) - 1e-12);
      const i = lrc[Math.floor(rnd() * lrc.length)];
      x[i] = 1; w += inst.p[i];
      yield step(inst, x, `Iteração ${it}: LRC = {${items(lrc)}}, insere o item ${i + 1}`, [i]);
    }
    const y = yield* localSearch(inst, x, `Iteração ${it}: busca local`);
    yield step(inst, y, `Iteração ${it}: solução final com benefício ${evalSol(inst, y).f}`);
  }
}

function* sa(inst, P, rnd) {
  const x = greedy(inst);
  let T = P.T0;
  yield step(inst, x, 'Solução inicial gulosa', [], { T });
  for (let t = 1; t <= P.steps; t++) {
    const m = randomMove(inst, x, rnd);
    if (m) {
      let acc = m.delta >= 0, prob = 1;
      if (!acc) { prob = Math.exp(m.delta / T); acc = rnd() < prob; }
      if (acc) applyMove(x, m);
      const pr = m.delta < 0 ? `p = ${fmt(prob)}; ` : '';
      yield step(inst, x, `T = ${fmt(T)}: ${describe(m)}, Δ = ${m.delta}; ${pr}${acc ? 'aceita' : 'rejeita'}`, acc ? changedOf(m) : [], { T });
    }
    T *= P.beta;
  }
}

function* ga(inst, P, rnd) {
  const { n, p, b, C } = inst;
  const repair = (x) => {
    let w = evalSol(inst, x).w, r = 0;
    const order = [...Array(n).keys()].filter((i) => x[i]).sort((i, j) => b[i] / p[i] - b[j] / p[j]);
    for (const i of order) { if (w <= C) break; x[i] = 0; w -= p[i]; r = 1; }
    return r;
  };
  const indiv = (x) => ({ x, f: evalSol(inst, x).f });
  const snap = (pop, msg) => {
    const best = pop.reduce((a, c) => (c.f > a.f ? c : a));
    return step(inst, best.x, msg, [], { pop: pop.map((q) => ({ x: q.x.slice(), f: q.f })) });
  };
  let pop = [];
  for (let k = 0; k < P.pop; k++) {
    const x = Array.from({ length: n }, () => (rnd() < 0.5 ? 1 : 0));
    repair(x);
    pop.push(indiv(x));
  }
  yield snap(pop, 'População inicial aleatória (com reparo)');
  const tour = () => {
    const a = pop[Math.floor(rnd() * pop.length)], c = pop[Math.floor(rnd() * pop.length)];
    return a.f >= c.f ? a : c;
  };
  for (let g = 1; g <= P.gen; g++) {
    const elite = pop.reduce((a, c) => (c.f > a.f ? c : a));
    const next = [{ x: elite.x.slice(), f: elite.f }];
    let rep = 0;
    while (next.length < P.pop) {
      const c1 = tour().x.slice(), c2 = tour().x.slice();
      if (rnd() < 0.9) {
        const cut = 1 + Math.floor(rnd() * (n - 1));
        for (let i = cut; i < n; i++) { const t = c1[i]; c1[i] = c2[i]; c2[i] = t; }
      }
      for (const c of [c1, c2]) {
        for (let i = 0; i < n; i++) if (rnd() < P.pmut) c[i] ^= 1;
        rep += repair(c);
        if (next.length < P.pop) next.push(indiv(c));
      }
    }
    pop = next;
    const avg = pop.reduce((s, q) => s + q.f, 0) / pop.length;
    const best = pop.reduce((a, c) => (c.f > a.f ? c : a));
    yield snap(pop, `Geração ${g}: melhor = ${best.f}, média = ${fmt(avg, 1)}, ${rep} reparo(s)`);
  }
}

function* vns(inst, P, rnd) {
  let x = greedy(inst);
  yield step(inst, x, 'Solução inicial gulosa');
  x = yield* localSearch(inst, x, 'Busca local inicial');
  yield step(inst, x, `Ótimo local inicial: benefício ${evalSol(inst, x).f}`);
  let k = 1;
  for (let it = 1; it <= P.iter; it++) {
    const y = x.slice(), ch = [];
    for (let j = 0; j < k; j++) {
      const m = randomMove(inst, y, rnd);
      if (m) { applyMove(y, m); ch.push(...changedOf(m)); }
    }
    yield step(inst, y, `Iteração ${it}: agitação em N${k} (${k} movimento(s) aleatório(s))`, ch);
    const z = yield* localSearch(inst, y, `Iteração ${it}: busca local`);
    const fx = evalSol(inst, x).f, fz = evalSol(inst, z).f;
    if (fz > fx) {
      x = z; k = 1;
      yield step(inst, x, `Iteração ${it}: melhora (${fx} → ${fz}); k ← 1`);
    } else {
      k = k >= P.kmax ? 1 : k + 1;
      yield step(inst, x, `Iteração ${it}: sem melhora (${fz} ≤ ${fx}); mantém x, k ← ${k}`);
    }
  }
}

function* vnd(inst) {
  const x = greedy(inst);
  yield step(inst, x, 'Solução inicial gulosa');
  const kinds = ['insert', 'swap'], names = ['N1 (inserção)', 'N2 (troca)'];
  let k = 0;
  while (k < kinds.length) {
    const m = bestMove(inst, x, kinds[k]);
    if (m) {
      applyMove(x, m);
      yield step(inst, x, `${names[k]}: ${describe(m)} (+${m.delta}); volta a N1`, changedOf(m));
      k = 0;
    } else {
      yield step(inst, x, `${names[k]}: nenhum vizinho melhor; passa à próxima vizinhança`);
      k++;
    }
  }
  yield step(inst, x, `Ótimo local em N1 e N2: benefício ${evalSol(inst, x).f}. A descida termina.`);
}

const ALGS = [
  { id: 'ils', nome: 'ILS', make: ils,
    desc: 'Busca local iterada: perturba o ótimo local atual (remove itens ao acaso), reaplica a busca local e decide, pelo critério de aceitação, se adota a nova solução.',
    params: [
      { id: 'iter', label: 'Iterações', min: 5, max: 100, step: 1, def: () => 30 },
      { id: 'k', label: 'Itens removidos na perturbação (k)', min: 1, max: 4, step: 1, def: () => 2 },
      { id: 'crit', label: 'Critério de aceitação', options: [['melhor', 'melhor'], ['sempre', 'sempre'], ['interm', 'intermediário (até 5% pior)']], def: () => 'melhor' },
    ] },
  { id: 'grasp', nome: 'GRASP', make: grasp,
    desc: 'Construção semigulosa com lista restrita de candidatos (LRC) seguida de busca local; cada iteração parte do zero. α = 0 é guloso; α = 1 é aleatório. Na instância da aula, valores baixos de α reproduzem apenas o ótimo local (83).',
    params: [
      { id: 'iter', label: 'Iterações', min: 5, max: 100, step: 1, def: () => 20 },
      { id: 'alpha', label: 'α', min: 0, max: 1, step: 0.05, def: (i) => (i.n <= 12 ? 0.9 : 0.3) },
    ] },
  { id: 'sa', nome: 'Recozimento simulado', make: sa,
    desc: 'A cada passo sorteia um vizinho; aceita sempre se melhora e, se piora, com probabilidade e^(Δ/T). A temperatura decai geometricamente (T ← βT).',
    params: [
      { id: 'T0', label: 'Temperatura inicial T₀', min: 1, max: 100, step: 1, def: (i) => Math.round(1.5 * i.meanB) },
      { id: 'beta', label: 'Fator de resfriamento β', min: 0.9, max: 0.999, step: 0.001, def: () => 0.992 },
      { id: 'steps', label: 'Passos', min: 100, max: 2000, step: 50, def: () => 800 },
    ] },
  { id: 'ga', nome: 'Algoritmo genético', make: ga,
    desc: 'Mantém uma população de soluções; seleção por torneio, cruzamento de um ponto, mutação bit a bit, reparo de soluções inviáveis e elitismo.',
    params: [
      { id: 'pop', label: 'Tamanho da população', min: 4, max: 40, step: 1, def: (i) => (i.n <= 12 ? 8 : 20) },
      { id: 'gen', label: 'Gerações', min: 5, max: 100, step: 1, def: () => 25 },
      { id: 'pmut', label: 'Probabilidade de mutação por bit', min: 0, max: 0.3, step: 0.01, def: () => 0.03 },
    ] },
  { id: 'vns', nome: 'VNS', make: vns,
    desc: 'Busca em vizinhança variável: agita a solução em N_k (k movimentos aleatórios), aplica busca local e, se melhora, volta a k = 1; senão, aumenta k.',
    params: [
      { id: 'iter', label: 'Iterações', min: 5, max: 100, step: 1, def: () => 30 },
      { id: 'kmax', label: 'k máximo', min: 1, max: 6, step: 1, def: () => 3 },
    ] },
  { id: 'vnd', nome: 'VND', make: vnd,
    desc: 'Descida em vizinhança variável: percorre N1 (inserção) e N2 (troca) deterministicamente. Termina em um ótimo local para ambas, sem mecanismo de escape.',
    params: [] },
];

/* ---------- estado e interface ---------- */

const $ = (id) => document.getElementById(id);
const state = {
  alg: ALGS[0], inst: INSTANCES.aula, vals: {}, seed: 1,
  gen: null, steps: [], best: null, optAt: null, done: false, playing: false,
  acc: 0, visited: [],
};

function defaultsFor(alg, inst) {
  const v = {};
  alg.params.forEach((q) => (v[q.id] = q.def(inst)));
  return v;
}

function buildTabs() {
  const tabs = $('tabs');
  ALGS.forEach((a) => {
    const btn = document.createElement('button');
    btn.className = 'tab'; btn.textContent = a.nome; btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', a === state.alg);
    btn.onclick = () => { state.alg = a; state.vals = defaultsFor(a, state.inst); buildTabsSel(); buildParams(); reset(); };
    tabs.appendChild(btn);
  });
}

function buildTabsSel() {
  [...$('tabs').children].forEach((b, i) => b.setAttribute('aria-selected', ALGS[i] === state.alg));
  $('desc').textContent = state.alg.desc;
}

function buildParams() {
  const box = $('params');
  box.innerHTML = '';
  state.alg.params.forEach((q) => {
    const lab = document.createElement('label');
    const out = document.createElement('output');
    const title = document.createElement('span');
    title.textContent = q.label + ': ';
    let input;
    if (q.options) {
      input = document.createElement('select');
      q.options.forEach(([v, t]) => { const o = document.createElement('option'); o.value = v; o.textContent = t; input.appendChild(o); });
      input.value = state.vals[q.id];
      input.onchange = () => { state.vals[q.id] = input.value; reset(); };
    } else {
      input = document.createElement('input');
      input.type = 'range'; input.min = q.min; input.max = q.max; input.step = q.step;
      input.value = state.vals[q.id]; out.textContent = fmt(state.vals[q.id], 3);
      input.oninput = () => { state.vals[q.id] = Number(input.value); out.textContent = fmt(input.value, 3); };
      input.onchange = () => reset();
      title.appendChild(out);
    }
    lab.appendChild(title); lab.appendChild(input);
    box.appendChild(lab);
  });
}

function buildInstTable() {
  const I = state.inst;
  let h = `<table class="table"><tr><th>item</th>${I.p.map((_, i) => `<th>${i + 1}</th>`).join('')}</tr>`;
  h += `<tr><th>peso</th>${I.p.map((v) => `<td>${v}</td>`).join('')}</tr>`;
  h += `<tr><th>benefício</th>${I.b.map((v) => `<td>${v}</td>`).join('')}</tr></table>`;
  h += `<p style="margin:8px 0 0;color:var(--muted)">Capacidade C = ${I.C}. Benefício ótimo = ${I.opt} (programação dinâmica${I.sols ? ' e enumeração das ' + I.sols.length + ' soluções' : ''}).</p>`;
  $('insttable').innerHTML = h;
}

function log(msg, idx) {
  const li = document.createElement('li');
  li.innerHTML = `<span class="n">${idx === undefined ? '' : idx}</span>`;
  li.appendChild(document.createTextNode(msg));
  const ol = $('log');
  ol.insertBefore(li, ol.firstChild);
  while (ol.children.length > 300) ol.removeChild(ol.lastChild);
}

function updateStats() {
  const s = state.steps[state.steps.length - 1];
  const I = state.inst;
  const found = state.optAt === null ? 'ainda não' : `no passo ${state.optAt}`;
  $('stats').innerHTML =
    `<span>Passo <b>${state.steps.length - 1}</b></span>` +
    `<span>Atual <b>${s ? s.f : '-'}</b></span>` +
    `<span>Melhor encontrado <b>${state.best ? state.best.f : '-'}</b></span>` +
    `<span>Ótimo global <b>${I.opt}</b></span>` +
    `<span>Ótimo alcançado: <b>${found}</b></span>` +
    `<span>${state.done ? '<b>Execução concluída</b>' : ''}</span>`;
}

function advance() {
  if (state.done) return false;
  const r = state.gen.next();
  if (r.done) {
    state.done = true; state.playing = false;
    $('play').textContent = 'Executar';
    log(`Execução concluída: melhor benefício = ${state.best.f} (ótimo global = ${state.inst.opt}).`);
    updateStats();
    return false;
  }
  const s = r.value;
  s.t = performance.now();
  state.steps.push(s);
  const idx = state.steps.length - 1;
  const cand = s.pop ? s.pop : [s];
  cand.forEach((c) => { if (state.visited.length < 4000) state.visited.push([c.w !== undefined ? c.w : evalSol(state.inst, c.x).w, c.f]); });
  if (!state.best || s.f > state.best.f) state.best = { f: s.f, x: s.x };
  if (state.optAt === null && state.best.f >= state.inst.opt) {
    state.optAt = idx;
    log(`Ótimo global (${state.inst.opt}) alcançado no passo ${idx}.`, idx);
  }
  log(s.msg, idx);
  updateStats();
  return true;
}

function reset() {
  const rnd = mulberry32(state.seed);
  state.gen = state.alg.make(state.inst, state.vals, rnd);
  state.steps = []; state.best = null; state.optAt = null; state.done = false;
  state.playing = false; state.acc = 0; state.visited = [];
  $('play').textContent = 'Executar';
  $('log').innerHTML = '';
  advance();
}

function initUI() {
  Object.values(INSTANCES).forEach((I) => {
    const o = document.createElement('option'); o.value = I.key; o.textContent = I.nome; $('inst').appendChild(o);
  });
  state.vals = defaultsFor(state.alg, state.inst);
  buildTabs(); buildTabsSel(); buildParams(); buildInstTable();
  $('inst').onchange = () => {
    state.inst = INSTANCES[$('inst').value];
    state.vals = defaultsFor(state.alg, state.inst);
    buildParams(); buildInstTable(); reset();
  };
  $('seed').onchange = () => { state.seed = Math.max(0, parseInt($('seed').value, 10) || 0); reset(); };
  $('newseed').onclick = () => { state.seed = Math.floor(Math.random() * 100000); $('seed').value = state.seed; reset(); };
  $('speed').oninput = () => { $('speedout').textContent = `${$('speed').value} passos/s`; };
  $('play').onclick = () => {
    if (state.done) reset();
    state.playing = !state.playing;
    $('play').textContent = state.playing ? 'Pausar' : 'Executar';
  };
  $('step').onclick = () => { state.playing = false; $('play').textContent = 'Executar'; advance(); };
  $('finish').onclick = () => { state.playing = false; $('play').textContent = 'Executar'; for (let i = 0; i < 5000 && advance(); i++); };
  $('reset').onclick = reset;
  reset();
}

/* ---------- desenho (p5.js) ---------- */

new p5((p) => {
  const PAD = 12, CELL_W = 40, CELL_H = 60, PB = 190, PC = 190;
  let holder, K;

  function readColors() {
    const cs = getComputedStyle(document.documentElement);
    const g = (n) => p.color(cs.getPropertyValue(n).trim());
    return { bg: g('--bg'), surface: g('--surface'), text: g('--text'), muted: g('--muted'), border: g('--border'),
      accent: g('--accent'), soft: g('--accent-soft'), good: g('--good'), warn: g('--warn'), bad: g('--bad') };
  }

  const txt = (s, x, y, col, size, h, v) => {
    p.noStroke(); p.fill(col); p.textSize(size || 12);
    p.textAlign(h || p.LEFT, v || p.TOP); p.text(s, x, y);
  };

  function dashed(on) { p.drawingContext.setLineDash(on ? [6, 4] : []); }

  function panelAHeight(s) {
    const I = state.inst, W = p.width;
    if (s && s.pop) return 18 + s.pop.length * (rowSize(I, W) + 4) + 40;
    const cols = Math.max(1, Math.floor((W - 2 * PAD) / CELL_W));
    return 18 + Math.ceil(I.n / cols) * CELL_H + 44;
  }

  function rowSize(I, W) { return Math.max(6, Math.min(18, Math.floor((W - 2 * PAD - 70) / I.n) - 1)); }

  function capacityBar(s, y) {
    const I = state.inst, W = p.width;
    p.stroke(K.border); p.fill(K.surface); p.rect(PAD, y, W - 2 * PAD, 12, 6);
    p.noStroke(); p.fill(K.accent);
    p.rect(PAD, y, Math.max(0, (W - 2 * PAD) * s.w / I.C), 12, 6);
    txt(`peso ${s.w} / ${I.C} · benefício ${s.f}`, PAD, y + 16, K.text, 12);
  }

  function drawA(s, y0) {
    const I = state.inst, W = p.width;
    let y = y0;
    if (s.pop) {
      txt('População (uma linha por indivíduo; a linha destacada é o melhor)', PAD, y, K.muted, 12);
      y += 18;
      const sq = rowSize(I, W), bestF = Math.max(...s.pop.map((q) => q.f));
      let marked = false;
      s.pop.forEach((q) => {
        const isBest = !marked && q.f === bestF; if (isBest) marked = true;
        if (isBest) { p.noStroke(); p.fill(K.soft); p.rect(PAD - 4, y - 2, W - 2 * PAD + 8, sq + 4, 4); }
        for (let i = 0; i < I.n; i++) {
          p.stroke(K.border); p.fill(q.x[i] ? K.accent : K.surface);
          p.rect(PAD + i * (sq + 1), y, sq, sq, 2);
        }
        txt(String(q.f), PAD + I.n * (sq + 1) + 8, y, isBest ? K.good : K.text, 12);
        y += sq + 4;
      });
      capacityBar(s, y + 8);
      return;
    }
    txt('Solução atual (1 = item na mochila; contorno laranja = alterado no último passo)', PAD, y, K.muted, 12);
    y += 18;
    const cols = Math.max(1, Math.floor((W - 2 * PAD) / CELL_W));
    for (let i = 0; i < I.n; i++) {
      const cx = PAD + (i % cols) * CELL_W, cy = y + Math.floor(i / cols) * CELL_H;
      txt(String(i + 1), cx + CELL_W / 2, cy, K.muted, 11, p.CENTER);
      const changed = s.changed.includes(i);
      p.stroke(changed ? K.warn : K.border); p.strokeWeight(changed ? 3 : 1);
      p.fill(s.x[i] ? K.accent : K.surface);
      p.rect(cx + (CELL_W - 26) / 2, cy + 14, 26, 26, 4);
      p.strokeWeight(1);
      txt(s.x[i] ? '1' : '0', cx + CELL_W / 2, cy + 20, s.x[i] ? p.color(255) : K.muted, 13, p.CENTER);
      txt(`p${I.p[i]} b${I.b[i]}`, cx + CELL_W / 2, cy + 43, K.muted, 10, p.CENTER);
    }
    y += Math.ceil(I.n / cols) * CELL_H + 4;
    capacityBar(s, y);
  }

  function frame(y, title) {
    p.stroke(K.border); p.line(0, y, p.width, y);
    txt(title, PAD, y + 6, K.muted, 12);
  }

  function drawB(s, y0) {
    const I = state.inst, W = p.width;
    const L = PAD + 30, R = W - PAD, T = y0 + 28, B = y0 + PB - 24;
    const ymax = I.opt * 1.1;
    const ys = (f) => B - (f / ymax) * (B - T);
    let xs, xOf;
    if (I.sols) {
      frame(y0, 'Paisagem: as 2ⁿ soluções em ordem de código de Gray (traço inferior = inviável)');
      xs = (pos) => L + ((pos + 0.5) / I.sols.length) * (R - L);
      xOf = (x) => { let m = 0; for (let i = 0; i < I.n; i++) if (x[i]) m |= 1 << i; return xs(I.posOf[m]); };
    } else {
      frame(y0, 'Soluções visitadas (peso × benefício)');
      xs = (w) => L + (w / I.C) * (R - L);
      xOf = (x) => xs(evalSol(I, x).w);
    }
    p.stroke(K.border); p.line(L, B, R, B); p.line(L, T, L, B);
    txt('0', L - 6, B - 6, K.muted, 10, p.RIGHT); txt(String(I.opt), L - 6, ys(I.opt) - 6, K.muted, 10, p.RIGHT);
    if (I.sols) {
      I.sols.forEach((q, pos) => {
        if (q.feasible) { p.noStroke(); p.fill(p.red(K.muted), p.green(K.muted), p.blue(K.muted), 140); p.circle(xs(pos), ys(q.f), 4); }
        else { p.stroke(K.border); p.line(xs(pos), B + 2, xs(pos), B + 8); }
      });
    } else {
      state.visited.forEach(([w, f]) => { p.noStroke(); p.fill(p.red(K.accent), p.green(K.accent), p.blue(K.accent), 60); p.circle(xs(w), ys(f), 5); });
      txt('peso', R, B + 8, K.muted, 10, p.RIGHT);
    }
    p.stroke(K.warn); p.strokeWeight(1); dashed(true); p.line(L, ys(I.opt), R, ys(I.opt)); dashed(false);
    // trajetória recente
    const rec = state.steps.slice(-12);
    p.noFill();
    for (let i = 1; i < rec.length; i++) {
      p.stroke(p.red(K.accent), p.green(K.accent), p.blue(K.accent), 40 + 160 * i / rec.length);
      p.line(xOf(rec[i - 1].x), ys(rec[i - 1].f), xOf(rec[i].x), ys(rec[i].f));
    }
    if (s.pop) s.pop.forEach((q) => { p.stroke(K.accent); p.fill(K.surface); p.circle(xOf(q.x), ys(q.f), 7); });
    if (state.best) { p.stroke(K.good); p.strokeWeight(2); p.noFill(); p.circle(xOf(state.best.x), ys(state.best.f), 14); p.strokeWeight(1); }
    p.stroke(K.surface); p.fill(K.accent); p.circle(xOf(s.x), ys(s.f), 10);
    txt('ótimo global', R, ys(I.opt) - 14, K.warn, 10, p.RIGHT);
    // legenda
    p.noStroke(); p.fill(K.accent); p.circle(W - 200, y0 + 12, 8); txt('atual', W - 192, y0 + 6, K.muted, 10);
    p.noFill(); p.stroke(K.good); p.strokeWeight(2); p.circle(W - 140, y0 + 12, 10); p.strokeWeight(1);
    txt('melhor', W - 130, y0 + 6, K.muted, 10);
  }

  function drawC(y0) {
    const I = state.inst, W = p.width, S = state.steps;
    const L = PAD + 30, R = W - PAD, T = y0 + 28, B = y0 + PC - 26;
    frame(y0, 'Convergência');
    const ymax = I.opt * 1.08, n = Math.max(30, S.length - 1);
    const xs = (i) => L + (i / n) * (R - L), ys = (f) => B - (f / ymax) * (B - T);
    p.stroke(K.border); p.line(L, B, R, B); p.line(L, T, L, B);
    txt('0', L - 6, B - 6, K.muted, 10, p.RIGHT); txt(String(I.opt), L - 6, ys(I.opt) - 6, K.muted, 10, p.RIGHT);
    txt(`passo (0 a ${n})`, R, B + 8, K.muted, 10, p.RIGHT);
    p.stroke(K.warn); dashed(true); p.line(L, ys(I.opt), R, ys(I.opt)); dashed(false);
    p.noFill();
    p.stroke(K.accent); p.strokeWeight(1.5);
    p.beginShape(); S.forEach((s, i) => p.vertex(xs(i), ys(s.f))); p.endShape();
    p.stroke(K.good); p.strokeWeight(2);
    let b = -1; p.beginShape();
    S.forEach((s, i) => { b = Math.max(b, s.f); p.vertex(xs(i), ys(b)); });
    p.endShape(); p.strokeWeight(1);
    const lg = [['atual', K.accent], ['melhor encontrado', K.good], ['ótimo global', K.warn]];
    let x = W - PAD;
    for (let i = lg.length - 1; i >= 0; i--) {
      p.textSize(10); const w = p.textWidth(lg[i][0]);
      txt(lg[i][0], x - w, y0 + 6, K.muted, 10);
      p.stroke(lg[i][1]); p.strokeWeight(2); p.line(x - w - 22, y0 + 12, x - w - 6, y0 + 12); p.strokeWeight(1);
      x -= w + 34;
    }
  }

  p.setup = () => {
    holder = $('holder');
    p.createCanvas(holder.clientWidth, 600).parent(holder);
    p.frameRate(30);
    p.textFont('sans-serif');
  };

  p.windowResized = () => p.resizeCanvas(holder.clientWidth, p.height);

  p.draw = () => {
    if (state.playing && !state.done) {
      state.acc += (p.deltaTime / 1000) * Number($('speed').value);
      for (let k = 0; state.acc >= 1 && k < 10; k++) { advance(); state.acc -= 1; }
      if (state.acc > 10) state.acc = 0;
    }
    const s = state.steps[state.steps.length - 1];
    if (!s) return;
    const hA = panelAHeight(s), total = hA + PB + PC;
    if (Math.abs(p.height - total) > 1) { p.resizeCanvas(holder.clientWidth, total); }
    K = readColors();
    p.clear();
    p.background(K.surface);
    drawA(s, 0);
    drawB(s, hA);
    drawC(hA + PB);
  };
}, document.body);

initUI();
