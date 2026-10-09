'use strict';
/* Animações das metaheurísticas (Aula 8) -- problema do caixeiro viajante.
 * Cada algoritmo é um gerador: cada `yield` produz um passo visível (uma rota).
 * Nos algoritmos populacionais, a rota exibida é sempre a melhor encontrada até então.
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

const city = (c) => c + 1;

/* ---------- instâncias ---------- */

function heldKarp(D, n) {
  const N = 1 << (n - 1), INF = 1e18;
  const dp = new Float64Array(N * (n - 1)).fill(INF);
  for (let j = 1; j < n; j++) dp[(1 << (j - 1)) * (n - 1) + (j - 1)] = D[j];
  for (let S = 1; S < N; S++)
    for (let j = 1; j < n; j++) {
      if (!(S & (1 << (j - 1)))) continue;
      const cur = dp[S * (n - 1) + (j - 1)];
      if (cur >= INF) continue;
      for (let k = 1; k < n; k++) {
        if (S & (1 << (k - 1))) continue;
        const T = S | (1 << (k - 1)), v = cur + D[j * n + k];
        if (v < dp[T * (n - 1) + (k - 1)]) dp[T * (n - 1) + (k - 1)] = v;
      }
    }
  let best = INF;
  for (let j = 1; j < n; j++) best = Math.min(best, dp[(N - 1) * (n - 1) + (j - 1)] + D[j * n]);
  return best;
}

function finishInstance(inst) {
  const { n, x, y } = inst;
  inst.D = new Float64Array(n * n);
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) {
      const e = Math.hypot(x[i] - x[j], y[i] - y[j]);
      inst.D[i * n + j] = inst.round ? Math.round(e) : e;  // EUC_2D do TSPLIB arredonda para o inteiro mais próximo
    }
  const minx = Math.min(...x), miny = Math.min(...y);
  inst.bb = { minx, miny, sx: Math.max(...x) - minx, sy: Math.max(...y) - miny };
  return inst;
}

function makeRandom(key, n, seed, nome) {
  const r = mulberry32(seed), x = [], y = [];
  for (let i = 0; i < n; i++) { x.push(5 + 90 * r()); y.push(5 + 90 * r()); }
  const inst = finishInstance({ key, nome, n, x, y, round: false, ref: null, optSrc: 'Held-Karp' });
  inst.ref = heldKarp(inst.D, n);
  return inst;
}

function makeTsplib(key, nome, pts, opt) {
  return finishInstance({ key, nome, n: pts.length, x: pts.map((q) => q[0]), y: pts.map((q) => q[1]), round: true, ref: opt, optSrc: 'TSPLIB' });
}

/* Coordenadas do TSPLIB (Reinelt, 1991); EUC_2D, ótimos conhecidos 7542 e 21282. */
const BERLIN52 = [[565,575],[25,185],[345,750],[945,685],[845,655],[880,660],[25,230],[525,1000],[580,1175],[650,1130],[1605,620],[1220,580],[1465,200],[1530,5],[845,680],[725,370],[145,665],[415,635],[510,875],[560,365],[300,465],[520,585],[480,415],[835,625],[975,580],[1215,245],[1320,315],[1250,400],[660,180],[410,250],[420,555],[575,665],[1150,1160],[700,580],[685,595],[685,610],[770,610],[795,645],[720,635],[760,650],[475,960],[95,260],[875,920],[700,500],[555,815],[830,485],[1170,65],[830,610],[605,625],[595,360],[1340,725],[1740,245]];
const KROA100 = [[1380,939],[2848,96],[3510,1671],[457,334],[3888,666],[984,965],[2721,1482],[1286,525],[2716,1432],[738,1325],[1251,1832],[2728,1698],[3815,169],[3683,1533],[1247,1945],[123,862],[1234,1946],[252,1240],[611,673],[2576,1676],[928,1700],[53,857],[1807,1711],[274,1420],[2574,946],[178,24],[2678,1825],[1795,962],[3384,1498],[3520,1079],[1256,61],[1424,1728],[3913,192],[3085,1528],[2573,1969],[463,1670],[3875,598],[298,1513],[3479,821],[2542,236],[3955,1743],[1323,280],[3447,1830],[2936,337],[1621,1830],[3373,1646],[1393,1368],[3874,1318],[938,955],[3022,474],[2482,1183],[3854,923],[376,825],[2519,135],[2945,1622],[953,268],[2628,1479],[2097,981],[890,1846],[2139,1806],[2421,1007],[2290,1810],[1115,1052],[2588,302],[327,265],[241,341],[1917,687],[2991,792],[2573,599],[19,674],[3911,1673],[872,1559],[2863,558],[929,1766],[839,620],[3893,102],[2178,1619],[3822,899],[378,1048],[1178,100],[2599,901],[3416,143],[2961,1605],[611,1384],[3113,885],[2597,1830],[2586,1286],[161,906],[1429,134],[742,1025],[1625,1651],[1187,706],[1787,1009],[22,987],[3640,43],[3756,882],[776,392],[1724,1642],[198,1810],[3950,1558]];

const INSTANCES = {
  pequena: makeRandom('pequena', 12, 11, 'Pequena (n = 12, ótimo exato)'),
  berlin52: makeTsplib('berlin52', 'berlin52 (TSPLIB, n = 52, ótimo 7.542)', BERLIN52, 7542),
  kroA100: makeTsplib('kroA100', 'kroA100 (TSPLIB, n = 100, ótimo 21.282)', KROA100, 21282),
};

/* ---------- operações sobre rotas ---------- */

const d = (I, a, b) => I.D[a * I.n + b];

function tourLen(I, t) {
  let s = 0;
  for (let i = 0; i < t.length; i++) s += d(I, t[i], t[(i + 1) % t.length]);
  return s;
}

function pathLen(I, t) {
  let s = 0;
  for (let i = 0; i + 1 < t.length; i++) s += d(I, t[i], t[i + 1]);
  return s;
}

/* Arestas da rota nova que não existiam na antiga (para destacar a mudança). */
function newEdges(old, nw) {
  const n = old.length, seen = new Set();
  for (let i = 0; i < n; i++) { const a = old[i], b = old[(i + 1) % n]; seen.add(a < b ? a * n + b : b * n + a); }
  const out = [];
  for (let i = 0; i < n; i++) {
    const a = nw[i], b = nw[(i + 1) % n];
    if (!seen.has(a < b ? a * n + b : b * n + a)) out.push([a, b]);
  }
  return out;
}

function step(I, t, msg, hi, extra) {
  const partial = extra && extra.partial;
  return Object.assign({ tour: t.slice(), f: partial ? pathLen(I, t) : tourLen(I, t), msg, hi: hi || [] }, extra || {});
}

function randomTour(I, rnd) { return shuffle([...Array(I.n).keys()], rnd); }

function reverseSeg(t, i, j) {
  const r = t.slice();
  for (let a = i, b = j; a < b; a++, b--) { const x = r[a]; r[a] = r[b]; r[b] = x; }
  return r;
}

/* Vizinhos de t: 'two' (2-opt), 'or' (Or-opt: realoca segmento de 1 a 3 cidades), 'swap' (troca duas cidades).
   Retornam o melhor movimento { gain, tour, desc } com ganho > 0, ou null. */
function bestTwoOpt(I, t) {
  const n = t.length;
  let best = null, bg = 1e-9;
  for (let i = 0; i < n - 2; i++)
    for (let j = i + 2; j < n; j++) {
      if (i === 0 && j === n - 1) continue;
      const a = t[i], b = t[i + 1], c = t[j], e = t[(j + 1) % n];
      const g = d(I, a, b) + d(I, c, e) - d(I, a, c) - d(I, b, e);
      if (g > bg) { bg = g; best = { i, j, gain: g }; }
    }
  if (!best) return null;
  return { gain: best.gain, tour: reverseSeg(t, best.i + 1, best.j),
    desc: `2-opt: troca as arestas (${city(t[best.i])},${city(t[best.i + 1])}) e (${city(t[best.j])},${city(t[(best.j + 1) % n])})` };
}

function bestOrOpt(I, t) {
  const n = t.length;
  let best = null, bg = 1e-9;
  for (let L = 1; L <= 3; L++)
    for (let i = 0; i < n; i++) {
      const seg = [], rem = [];
      for (let k = 0; k < L; k++) seg.push(t[(i + k) % n]);
      for (let k = L; k < n; k++) rem.push(t[(i + k) % n]);
      const p = rem[rem.length - 1], q = rem[0], s0 = seg[0], sL = seg[L - 1];
      const removeGain = d(I, p, s0) + d(I, sL, q) - d(I, p, q);
      for (let k = 0; k < rem.length - 1; k++) {  // rem[rem.length-1] -> rem[0] é a posição original
        const u = rem[k], v = rem[k + 1], base = d(I, u, v);
        const gf = removeGain - (d(I, u, s0) + d(I, sL, v) - base);
        const gr = removeGain - (d(I, u, sL) + d(I, s0, v) - base);
        if (gf > bg) { bg = gf; best = { seg, rem, k, rev: false, gain: gf }; }
        if (gr > bg) { bg = gr; best = { seg, rem, k, rev: true, gain: gr }; }
      }
    }
  if (!best) return null;
  const s = best.rev ? best.seg.slice().reverse() : best.seg;
  const tour = [...best.rem.slice(0, best.k + 1), ...s, ...best.rem.slice(best.k + 1)];
  return { gain: best.gain, tour,
    desc: `Or-opt: move ${best.seg.length === 1 ? 'a cidade' : 'o trecho'} ${best.seg.map(city).join('-')} para entre ${city(best.rem[best.k])} e ${city(best.rem[best.k + 1])}${best.rev ? ' (invertido)' : ''}` };
}

function bestSwap(I, t) {
  const n = t.length;
  let best = null, bg = 1e-9;
  for (let i = 0; i < n - 2; i++)
    for (let j = i + 2; j < n; j++) {
      if (i === 0 && j === n - 1) continue;
      const a = t[(i + n - 1) % n], b = t[i], c = t[i + 1], dd = t[j - 1], e = t[j], f = t[(j + 1) % n];
      const g = d(I, a, b) + d(I, b, c) + d(I, dd, e) + d(I, e, f) - d(I, a, e) - d(I, e, c) - d(I, dd, b) - d(I, b, f);
      if (g > bg) { bg = g; best = { i, j, gain: g }; }
    }
  if (!best) return null;
  const r = t.slice();
  r[best.i] = t[best.j]; r[best.j] = t[best.i];
  return { gain: best.gain, tour: r, desc: `troca as cidades ${city(t[best.i])} e ${city(t[best.j])} de posição` };
}

const NEIGH = { two: bestTwoOpt, or: bestOrOpt, swap: bestSwap };

/* Melhor vizinho na união das vizinhanças indicadas. */
function bestMove(I, t, kinds) {
  let best = null;
  for (const k of kinds) { const m = NEIGH[k](I, t); if (m && (!best || m.gain > best.gain)) best = m; }
  return best;
}

/* Movimento aleatório (2-opt, realocação de uma cidade ou troca), com variação de custo. */
function randomMove(I, t, rnd) {
  const n = t.length, u = rnd();
  if (u < 0.5) {
    let i = Math.floor(rnd() * n), j = Math.floor(rnd() * n);
    if (i > j) [i, j] = [j, i];
    if (j - i < 1) j = Math.min(n - 1, i + 1);
    if (i === 0 && j === n - 1) j = n - 2;
    const r = reverseSeg(t, i, j);
    return { tour: r, delta: tourLen(I, r) - tourLen(I, t), desc: `inverte o trecho das posições ${i + 1} a ${j + 1}` };
  }
  if (u < 0.75) {
    const i = Math.floor(rnd() * n), c = t[i], rem = t.filter((_, k) => k !== i);
    const k = Math.floor(rnd() * rem.length);
    const r = [...rem.slice(0, k + 1), c, ...rem.slice(k + 1)];
    return { tour: r, delta: tourLen(I, r) - tourLen(I, t), desc: `realoca a cidade ${city(c)}` };
  }
  const i = Math.floor(rnd() * n);
  let j = Math.floor(rnd() * n);
  if (j === i) j = (i + 1) % n;
  const r = t.slice(); r[i] = t[j]; r[j] = t[i];
  return { tour: r, delta: tourLen(I, r) - tourLen(I, t), desc: `troca as cidades ${city(t[i])} e ${city(t[j])}` };
}

/* Busca local de melhor melhora nas vizinhanças dadas. Retorna o ótimo local. */
function* localSearch(I, t, tag, kinds) {
  t = t.slice();
  for (;;) {
    const m = bestMove(I, t, kinds);
    if (!m) return t;
    const hi = newEdges(t, m.tour);
    t = m.tour;
    yield step(I, t, `${tag}: ${m.desc} (−${fmt(m.gain)})`, hi);
  }
}

/* Descida em vizinhança variável: N1 (2-opt), N2 (Or-opt), N3 (troca); volta a N1 após melhora. */
function* vndLocal(I, t, tag) {
  t = t.slice();
  const kinds = ['two', 'or', 'swap'], names = ['N1', 'N2', 'N3'];
  let k = 0;
  while (k < kinds.length) {
    const m = NEIGH[kinds[k]](I, t);
    if (m) {
      const hi = newEdges(t, m.tour);
      t = m.tour;
      yield step(I, t, `${tag}: VND em ${names[k]}: ${m.desc} (−${fmt(m.gain)})`, hi);
      k = 0;
    } else k++;
  }
  return t;
}

/* Perturbação "double bridge": reordena quatro trechos A B C D como A C B D. */
function doubleBridge(t, rnd) {
  const n = t.length;
  const cuts = new Set();
  while (cuts.size < 3) cuts.add(1 + Math.floor(rnd() * (n - 1)));
  const [p1, p2, p3] = [...cuts].sort((a, b) => a - b);
  return [...t.slice(0, p1), ...t.slice(p2, p3), ...t.slice(p1, p2), ...t.slice(p3)];
}

/* ---------- algoritmos ---------- */

function* nn(I, P, rnd) {
  const start = Math.floor(rnd() * I.n);
  const path = [start], used = new Array(I.n).fill(false);
  used[start] = true;
  yield step(I, path, `Cidade inicial sorteada: ${city(start)}`, [], { partial: true });
  while (path.length < I.n) {
    const cur = path[path.length - 1];
    let b = -1;
    for (let j = 0; j < I.n; j++) if (!used[j] && (b < 0 || d(I, cur, j) < d(I, cur, b))) b = j;
    path.push(b); used[b] = true;
    yield step(I, path, `Vai de ${city(cur)} à cidade não visitada mais próxima: ${city(b)} (${fmt(d(I, cur, b))})`, [[cur, b]], { partial: true });
  }
  let t = path.slice();
  yield step(I, t, `Rota completa (fecha o ciclo): custo ${fmt(tourLen(I, t))}`);
  if (P.opt === 'sim') t = yield* localSearch(I, t, 'Busca local 2-opt', ['two']);
  yield step(I, t, `Rota final: custo ${fmt(tourLen(I, t))}`);
}

function* ils(I, P, rnd) {
  let t = randomTour(I, rnd);
  yield step(I, t, 'Rota inicial aleatória');
  t = yield* localSearch(I, t, 'Busca local inicial', ['two', 'or']);
  yield step(I, t, `Ótimo local inicial: custo ${fmt(tourLen(I, t))}`);
  for (let it = 1; it <= P.iter; it++) {
    let y = t;
    for (let k = 0; k < P.k; k++) y = doubleBridge(y, rnd);
    yield step(I, y, `Iteração ${it}: perturbação (${P.k} double-bridge)`, newEdges(t, y));
    const z = yield* localSearch(I, y, `Iteração ${it}: busca local`, ['two', 'or']);
    const fx = tourLen(I, t), fz = tourLen(I, z);
    let ok;
    if (P.crit === 'melhor') ok = fz < fx - 1e-9;
    else if (P.crit === 'sempre') ok = true;
    else ok = fz <= 1.02 * fx;
    if (ok) t = z;
    yield step(I, t, `Iteração ${it}: custo(x'') = ${fmt(fz)}, custo(x) = ${fmt(fx)}; ${ok ? "aceita x''" : 'rejeita, mantém x'}`);
  }
}

function* grasp(I, P, rnd) {
  for (let it = 1; it <= P.iter; it++) {
    const start = Math.floor(rnd() * I.n);
    const path = [start], used = new Array(I.n).fill(false);
    used[start] = true;
    yield step(I, path, `Iteração ${it}: construção semigulosa (α = ${fmt(P.alpha)}), inicia em ${city(start)}`, [], { partial: true });
    while (path.length < I.n) {
      const cur = path[path.length - 1], cand = [];
      for (let j = 0; j < I.n; j++) if (!used[j]) cand.push(j);
      const dmin = Math.min(...cand.map((j) => d(I, cur, j))), dmax = Math.max(...cand.map((j) => d(I, cur, j)));
      const lrc = cand.filter((j) => d(I, cur, j) <= dmin + P.alpha * (dmax - dmin) + 1e-12);
      const j = lrc[Math.floor(rnd() * lrc.length)];
      path.push(j); used[j] = true;
      yield step(I, path, `Iteração ${it}: LRC com ${lrc.length} cidade(s); vai de ${city(cur)} a ${city(j)}`, [[cur, j]], { partial: true });
    }
    let t = path.slice();
    yield step(I, t, `Iteração ${it}: rota construída, custo ${fmt(tourLen(I, t))}`);
    t = yield* localSearch(I, t, `Iteração ${it}: busca local`, ['two', 'or']);
    yield step(I, t, `Iteração ${it}: rota final, custo ${fmt(tourLen(I, t))}`);
  }
}

function* sa(I, P, rnd) {
  let t = randomTour(I, rnd), f = tourLen(I, t), T = P.T0, rej = 0;
  yield step(I, t, 'Rota inicial aleatória', [], { T });
  for (let s = 1; s <= P.steps; s++) {
    const m = randomMove(I, t, rnd);
    let acc = m.delta <= 0, prob = 1;
    if (!acc) { prob = Math.exp(-m.delta / T); acc = rnd() < prob; }
    if (acc && Math.abs(m.delta) > 1e-9) {
      const hi = newEdges(t, m.tour);
      t = m.tour; f += m.delta;
      const pr = m.delta > 0 ? `p = ${fmt(prob)}; ` : '';
      yield step(I, t, `T = ${fmt(T)}: ${m.desc}, Δ = ${m.delta > 0 ? '+' : ''}${fmt(m.delta)}; ${pr}aceita (${rej} proposta(s) rejeitada(s) antes)`, hi, { T });
      rej = 0;
    } else rej++;
    T *= P.beta;
  }
  yield step(I, t, `Fim: temperatura final ${fmt(T, 3)}, custo ${fmt(f)}`, [], { T });
}

function* ga(I, P, rnd) {
  const n = I.n;
  const indiv = (t) => ({ t, f: tourLen(I, t) });
  let pop = Array.from({ length: P.pop }, () => indiv(randomTour(I, rnd)));
  const bestOf = (a) => a.reduce((u, c) => (c.f < u.f ? c : u));
  let gbest = bestOf(pop);
  yield step(I, gbest.t, `População inicial aleatória (${P.pop} rotas); melhor rota: ${fmt(gbest.f)}`);
  const tour = () => {
    let b = pop[Math.floor(rnd() * pop.length)];
    for (let k = 1; k < 3; k++) { const c = pop[Math.floor(rnd() * pop.length)]; if (c.f < b.f) b = c; }
    return b;
  };
  const ox = (p1, p2) => {
    let a = Math.floor(rnd() * n), b = Math.floor(rnd() * n);
    if (a > b) [a, b] = [b, a];
    const child = new Array(n).fill(-1), used = new Array(n).fill(false);
    for (let i = a; i <= b; i++) { child[i] = p1[i]; used[p1[i]] = true; }
    let pos = (b + 1) % n;
    for (let k = 0; k < n; k++) {
      const c = p2[(b + 1 + k) % n];
      if (used[c]) continue;
      child[pos] = c; pos = (pos + 1) % n;
    }
    return child;
  };
  for (let g = 1; g <= P.gen; g++) {
    const elite = bestOf(pop);
    const next = [{ t: elite.t.slice(), f: elite.f }];
    while (next.length < P.pop) {
      let c = rnd() < 0.9 ? ox(tour().t, tour().t) : tour().t.slice();
      if (rnd() < P.pmut) {  // inversão de um trecho curto (mutação local, estilo 2-opt)
        const i = Math.floor(rnd() * (n - 1)), len = 2 + Math.floor(rnd() * Math.max(2, n / 6));
        c = reverseSeg(c, i, Math.min(n - 1, i + len - 1));
      }
      next.push(indiv(c));
    }
    pop = next;
    const b = bestOf(pop), avg = pop.reduce((s, q) => s + q.f, 0) / pop.length;
    const improved = b.f < gbest.f - 1e-9;
    const old = gbest.t;
    if (improved) gbest = { t: b.t.slice(), f: b.f };
    yield step(I, gbest.t, `Geração ${g}: melhor da geração = ${fmt(b.f)}, média = ${fmt(avg, 1)}${improved ? '; nova melhor rota' : ''}`, improved ? newEdges(old, gbest.t) : []);
  }
}

function* vns(I, P, rnd) {
  let t = randomTour(I, rnd);
  yield step(I, t, 'Rota inicial aleatória');
  t = yield* localSearch(I, t, 'Busca local inicial', ['two', 'or', 'swap']);
  yield step(I, t, `Ótimo local inicial: custo ${fmt(tourLen(I, t))}`);
  let k = 1;
  for (let it = 1; it <= P.iter; it++) {
    let y = t;
    for (let j = 0; j < k; j++) y = randomMove(I, y, rnd).tour;
    yield step(I, y, `Iteração ${it}: agitação em N${k} (${k} movimento(s) aleatório(s))`, newEdges(t, y));
    const z = yield* localSearch(I, y, `Iteração ${it}: busca local`, ['two', 'or', 'swap']);
    const fx = tourLen(I, t), fz = tourLen(I, z);
    if (fz < fx - 1e-9) {
      t = z; k = 1;
      yield step(I, t, `Iteração ${it}: melhora (${fmt(fx)} → ${fmt(fz)}); k ← 1`);
    } else {
      k = k >= P.kmax ? 1 : k + 1;
      yield step(I, t, `Iteração ${it}: sem melhora (${fmt(fz)} ≥ ${fmt(fx)}); mantém x, k ← ${k}`);
    }
  }
}

function* gvns(I, P, rnd) {
  let t = randomTour(I, rnd);
  yield step(I, t, 'Rota inicial aleatória');
  t = yield* vndLocal(I, t, 'Descida inicial');
  yield step(I, t, `Ótimo local em N1, N2 e N3: custo ${fmt(tourLen(I, t))}`);
  let k = 1;
  for (let it = 1; it <= P.iter; it++) {
    let y = t;
    for (let j = 0; j < k; j++) y = randomMove(I, y, rnd).tour;
    yield step(I, y, `Iteração ${it}: agitação em N${k} (${k} movimento(s) aleatório(s))`, newEdges(t, y));
    const z = yield* vndLocal(I, y, `Iteração ${it}`);
    const fx = tourLen(I, t), fz = tourLen(I, z);
    if (fz < fx - 1e-9) {
      t = z; k = 1;
      yield step(I, t, `Iteração ${it}: melhora (${fmt(fx)} → ${fmt(fz)}); k ← 1`);
    } else {
      k = k >= P.kmax ? 1 : k + 1;
      yield step(I, t, `Iteração ${it}: sem melhora (${fmt(fz)} ≥ ${fmt(fx)}); mantém x, k ← ${k}`);
    }
  }
}

function* vnd(I, P, rnd) {
  let t = randomTour(I, rnd);
  yield step(I, t, 'Rota inicial aleatória');
  t = yield* vndLocal(I, t, 'Descida');
  yield step(I, t, `Ótimo local em N1, N2 e N3: custo ${fmt(tourLen(I, t))}. A descida termina.`);
}

function* aco(I, P, rnd) {
  const n = I.n, TMAX = 1, TMIN = 0.01;
  const tau = new Float64Array(n * n).fill(TMAX);
  let gbest = null;
  yield step(I, randomTour(I, rnd), 'Feromônio inicial uniforme (τ = 1 em todas as arestas); rota exibida: aleatória de referência', [], { tau: Float64Array.from(tau) });
  for (let it = 1; it <= P.iter; it++) {
    let ib = null;
    for (let a = 0; a < P.ants; a++) {
      const path = [Math.floor(rnd() * n)], used = new Array(n).fill(false);
      used[path[0]] = true;
      while (path.length < n) {
        const cur = path[path.length - 1], cand = [], wt = [];
        for (let j = 0; j < n; j++) if (!used[j]) { cand.push(j); wt.push(Math.pow(tau[cur * n + j], P.alpha) * Math.pow(1 / d(I, cur, j), P.beta)); }
        let r = rnd() * wt.reduce((u, v) => u + v, 0), q = 0;
        while (q < cand.length - 1 && r > wt[q]) { r -= wt[q]; q++; }
        path.push(cand[q]); used[cand[q]] = true;
      }
      const f = tourLen(I, path);
      if (!ib || f < ib.f) ib = { t: path, f };
    }
    const improved = !gbest || ib.f < gbest.f - 1e-9;
    const old = gbest ? gbest.t : ib.t;
    if (improved) gbest = { t: ib.t.slice(), f: ib.f };
    for (let k = 0; k < n * n; k++) tau[k] = Math.max(TMIN, (1 - P.rho) * tau[k]);
    const dep = P.rho * (gbest.f > 0 ? Math.min(TMAX, (I.ref || gbest.f) / gbest.f) : 0);
    for (let k = 0; k < n; k++) {
      const a = gbest.t[k], b = gbest.t[(k + 1) % n];
      tau[a * n + b] = Math.min(TMAX, tau[a * n + b] + dep); tau[b * n + a] = tau[a * n + b];
    }
    yield step(I, gbest.t, `Iteração ${it}: melhor formiga = ${fmt(ib.f)}; evapora (ρ = ${fmt(P.rho)}) e reforça a melhor rota${improved ? '; nova melhor rota' : ''}`, improved ? newEdges(old, gbest.t) : [], { tau: Float64Array.from(tau) });
  }
}

function* pso(I, P, rnd) {
  const n = I.n, VMAX = 0.5;
  const decode = (x) => [...Array(n).keys()].sort((a, b) => x[a] - x[b]);
  const parts = Array.from({ length: P.pop }, () => {
    const x = Array.from({ length: n }, () => rnd());
    const f = tourLen(I, decode(x));
    return { x, f, v: Array.from({ length: n }, () => (rnd() - 0.5) * 0.2), pb: x.slice(), pf: f };
  });
  let gb = parts.reduce((u, c) => (c.pf < u.pf ? c : u));
  gb = { x: gb.pb.slice(), f: gb.pf, t: decode(gb.pb) };
  yield step(I, gb.t, `Partículas iniciais aleatórias (${P.pop}); melhor rota: ${fmt(gb.f)}`);
  for (let it = 1; it <= P.iter; it++) {
    const old = gb.t;
    let improved = false;
    for (const q of parts) {
      for (let i = 0; i < n; i++) {
        q.v[i] = P.w * q.v[i] + P.c1 * rnd() * (q.pb[i] - q.x[i]) + P.c2 * rnd() * (gb.x[i] - q.x[i]);
        q.v[i] = Math.max(-VMAX, Math.min(VMAX, q.v[i]));
        q.x[i] += q.v[i];
      }
      q.f = tourLen(I, decode(q.x));
      if (q.f < q.pf) { q.pf = q.f; q.pb = q.x.slice(); }
      if (q.pf < gb.f - 1e-9) { gb = { x: q.pb.slice(), f: q.pf, t: decode(q.pb) }; improved = true; }
    }
    const avg = parts.reduce((s, q) => s + q.f, 0) / parts.length;
    yield step(I, gb.t, `Iteração ${it}: melhor global = ${fmt(gb.f)}, média das partículas = ${fmt(avg, 1)}${improved ? '; nova melhor rota' : ''}`, improved ? newEdges(old, gb.t) : []);
  }
}

/* Padrões por tamanho: pequena (n <= 12), média (n <= 60), grande. */
const sz = (i, a, b, c) => (i.n <= 12 ? a : i.n <= 60 ? b : c);
/* Recozimento: T0 proporcional à aresta típica (ótimo / n); T cai a ~0,3% dela ao fim. */
const saT0 = (i) => Math.round((i.n <= 12 ? 2 : 5) * i.ref / i.n * 10) / 10;
const saSteps = (i) => sz(i, 30000, 1000000, 1000000);

const ALGS = [
  { id: 'nn', nome: 'Vizinho mais próximo', make: nn,
    desc: 'Heurística construtiva: parte de uma cidade sorteada e vai sempre à cidade não visitada mais próxima; ao final fecha o ciclo e, opcionalmente, aplica a busca local 2-opt.',
    params: [{ id: 'opt', label: 'Aplicar 2-opt depois', options: [['sim', 'sim'], ['nao', 'não']], def: () => 'sim' }] },
  { id: 'ils', nome: 'ILS', make: ils,
    desc: 'Busca local iterada: perturba o ótimo local atual com movimentos double-bridge, reaplica a busca local (2-opt e Or-opt) e decide, pelo critério de aceitação, se adota a nova rota.',
    params: [
      { id: 'iter', label: 'Iterações', min: 5, max: 300, step: 1, def: (i) => sz(i, 100, 300, 300) },
      { id: 'k', label: 'Double-bridges por perturbação', min: 1, max: (i) => i.n, step: 1, def: () => 2 },
      { id: 'crit', label: 'Critério de aceitação', options: [['melhor', 'melhor'], ['sempre', 'sempre'], ['interm', 'intermediário (até 2% pior)']], def: () => 'melhor' },
    ] },
  { id: 'grasp', nome: 'GRASP', make: grasp,
    desc: 'Construção semigulosa (lista restrita de candidatos pelas cidades mais próximas) seguida de busca local (2-opt e Or-opt); cada iteração parte do zero. α = 0 é o vizinho mais próximo; α = 1 é aleatório.',
    params: [
      { id: 'iter', label: 'Iterações', min: 5, max: 100, step: 1, def: (i) => sz(i, 20, 100, 100) },
      { id: 'alpha', label: 'α', min: 0, max: 1, step: 0.05, def: (i) => sz(i, 0.2, 0.1, 0.1) },
    ] },
  { id: 'sa', nome: 'Recozimento simulado', make: sa,
    desc: 'Sorteia um vizinho (inversão de trecho, realocação ou troca); aceita sempre se encurta a rota e, se alonga, com probabilidade e^(−Δ/T). A temperatura decai geometricamente. Só as propostas aceitas aparecem como passos.',
    params: [
      { id: 'T0', label: 'Temperatura inicial T₀', min: 0.1, max: (i) => Math.ceil(3 * saT0(i)), step: 0.1, def: saT0 },
      { id: 'beta', label: 'Fator de resfriamento β', min: 0.9, max: 0.99999, step: 0.00001, dec: 5, def: (i) => Math.round(1e5 * Math.pow(0.003 * i.ref / i.n / saT0(i), 1 / saSteps(i))) / 1e5 },
      { id: 'steps', label: 'Propostas', min: 500, max: 1000000, step: 500, def: saSteps },
    ] },
  { id: 'ga', nome: 'Algoritmo genético', make: ga,
    desc: 'População de rotas (permutações); seleção por torneio de 3 rotas, cruzamento OX (ordem), mutação por inversão de trecho e elitismo. A rota exibida é a melhor encontrada até então.',
    params: [
      { id: 'pop', label: 'Tamanho da população', min: 10, max: 500, step: 5, def: (i) => sz(i, 300, 500, 500) },
      { id: 'gen', label: 'Gerações', min: 10, max: 2000, step: 10, def: (i) => sz(i, 300, 2000, 2000) },
      { id: 'pmut', label: 'Probabilidade de mutação por filho', min: 0, max: 1, step: 0.05, def: (i) => sz(i, 0.5, 0.02, 0.2) },
    ] },
  { id: 'vns', nome: 'VNS', make: vns,
    desc: 'Busca em vizinhança variável: agita a rota em N_k (k movimentos aleatórios), aplica busca local (2-opt, Or-opt e troca) e, se melhora, volta a k = 1; senão, aumenta k.',
    params: [
      { id: 'iter', label: 'Iterações', min: 5, max: 300, step: 1, def: (i) => sz(i, 100, 300, 300) },
      { id: 'kmax', label: 'k máximo', min: 1, max: (i) => i.n, step: 1, def: (i) => sz(i, 5, 10, 10) },
    ] },
  { id: 'gvns', nome: 'VNS + VND', make: gvns,
    desc: 'VNS geral (GVNS): agita a rota em N_k e usa a descida em vizinhança variável (VND, com 2-opt, Or-opt e troca) como busca local; se melhora, volta a k = 1; senão, aumenta k.',
    params: [
      { id: 'iter', label: 'Iterações', min: 5, max: 300, step: 1, def: (i) => sz(i, 100, 300, 300) },
      { id: 'kmax', label: 'k máximo', min: 1, max: (i) => i.n, step: 1, def: (i) => sz(i, 5, 15, 15) },
    ] },
  { id: 'aco', nome: 'Colônia de formigas', make: aco,
    desc: 'Cada formiga constrói uma rota escolhendo a próxima cidade com probabilidade proporcional a τ^α · η^β (η = 1/distância). O feromônio evapora e a melhor rota até então o reforça; a espessura das arestas azuis no mapa indica τ.',
    params: [
      { id: 'iter', label: 'Iterações', min: 5, max: 300, step: 1, def: (i) => sz(i, 30, 100, 100) },
      { id: 'ants', label: 'Número de formigas', min: 2, max: 500, step: 1, def: (i) => sz(i, 30, 150, 150) },
      { id: 'alpha', label: 'α (peso do feromônio)', min: 0, max: 5, step: 0.1, def: () => 1 },
      { id: 'beta', label: 'β (peso da heurística)', min: 0, max: 8, step: 0.1, def: (i) => sz(i, 4, 6, 6) },
      { id: 'rho', label: 'Taxa de evaporação ρ', min: 0.01, max: 0.9, step: 0.01, def: (i) => sz(i, 0.1, 0.2, 0.2) },
    ] },
  { id: 'pso', nome: 'Nuvem de partículas', make: pso,
    desc: 'PSO com chaves aleatórias: cada partícula tem um vetor real com uma chave por cidade; a rota é a ordenação das cidades pelas chaves. Velocidade com inércia e atração à melhor posição própria e à global.',
    params: [
      { id: 'iter', label: 'Iterações', min: 5, max: 500, step: 5, def: (i) => sz(i, 300, 500, 500) },
      { id: 'pop', label: 'Número de partículas', min: 5, max: 500, step: 1, def: (i) => sz(i, 300, 500, 500) },
      { id: 'w', label: 'Inércia w', min: 0, max: 1.2, step: 0.05, def: () => 0.7 },
      { id: 'c1', label: 'c₁ (componente cognitiva)', min: 0, max: 4, step: 0.1, def: () => 1.5 },
      { id: 'c2', label: 'c₂ (componente social)', min: 0, max: 4, step: 0.1, def: () => 1.5 },
    ] },
  { id: 'vnd', nome: 'VND', make: vnd,
    desc: 'Descida em vizinhança variável: percorre 2-opt, Or-opt e troca de duas cidades deterministicamente a partir de uma rota aleatória. Termina em um ótimo local para as três vizinhanças, sem mecanismo de escape.',
    params: [] },
];

/* ---------- resumo de cada algoritmo no TSP ---------- */

const EXPLICA = {
  nn: [
    ['Representação', 'Uma rota é uma permutação das n cidades, percorrida de forma cíclica.'],
    ['Construção', 'Sorteia a cidade inicial; a cada passo, vai à cidade ainda não visitada mais próxima da atual; ao fim, fecha o ciclo voltando à primeira.'],
    ['Busca local', 'Opcional: 2-opt de melhor melhora, que troca duas arestas (a,b) e (c,e) por (a,c) e (b,e), invertendo o trecho entre elas, enquanto houver ganho.'],
    ['Característica', 'Rápida, mas as últimas arestas costumam ser longas; o 2-opt remove os cruzamentos.'],
  ],
  ils: [
    ['Solução inicial', 'Rota aleatória (permutação sorteada).'],
    ['Busca local', 'Melhor melhora em 2-opt (inverte um trecho) e Or-opt (realoca um trecho de 1 a 3 cidades, eventualmente invertido), até um ótimo local.'],
    ['Perturbação', 'Double-bridge: divide a rota em quatro trechos A, B, C, D e a reconecta como A, C, B, D. O 2-opt e o Or-opt não desfazem facilmente esse movimento.'],
    ['Aceitação', 'Compara o novo ótimo local com o atual: "melhor" (só se encurta), "sempre" ou "intermediário" (se não for mais de 2% pior).'],
    ['Parada', 'Número fixo de iterações.'],
  ],
  grasp: [
    ['Solução inicial', 'Não há: cada iteração constrói uma rota do zero.'],
    ['Construção', 'Parte de uma cidade sorteada; a cada passo, a lista restrita de candidatos reúne as cidades não visitadas com distância ≤ d_min + α·(d_max − d_min) a partir da cidade atual, e sorteia uma delas. α = 0 reproduz o vizinho mais próximo.'],
    ['Busca local', '2-opt e Or-opt de melhor melhora sobre a rota construída.'],
    ['Perturbação', 'Não há; a diversificação vem da aleatoriedade da construção. Guarda a melhor rota entre as iterações.'],
  ],
  sa: [
    ['Solução inicial', 'Rota aleatória.'],
    ['Vizinho', 'Movimento aleatório: inversão de um trecho (2-opt), realocação de uma cidade ou troca de duas cidades.'],
    ['Aceitação', 'Aceita sempre se a rota encurta (Δ ≤ 0); se alonga, aceita com probabilidade e^(−Δ/T).'],
    ['Resfriamento', 'T ← β·T a cada proposta. No início, a rota muda muito (inclusive piorando); no fim, só aceita melhoras.'],
    ['Busca local / perturbação', 'Não há etapa separada: a aceitação de pioras faz o papel da perturbação.'],
  ],
  ga: [
    ['Representação', 'Cada indivíduo é uma rota (permutação das cidades).'],
    ['População inicial', 'Permutações aleatórias.'],
    ['Seleção e cruzamento', 'Torneio de 3 rotas escolhe os pais; o cruzamento OX copia um trecho do primeiro pai e completa com as demais cidades na ordem em que aparecem no segundo, preservando a permutação.'],
    ['Mutação', 'Com probabilidade p_mut, inverte um trecho curto do filho (movimento local, como um 2-opt aleatório).'],
    ['Nova geração', 'Elitismo: a melhor rota é copiada; o resto vem dos filhos. Não há busca local. A figura mostra a melhor rota encontrada até então.'],
  ],
  vns: [
    ['Solução inicial', 'Rota aleatória, seguida de busca local.'],
    ['Busca local', 'Melhor melhora na união de 2-opt, Or-opt e troca de duas cidades.'],
    ['Agitação', 'Em N_k, aplica k movimentos aleatórios (inversão, realocação ou troca) à rota atual.'],
    ['Atualização', 'Aplica a busca local à rota agitada. Se encurtou, adota-a e volta a k = 1; senão, mantém a atual e faz k ← k + 1 (volta a 1 ao passar de k máximo).'],
  ],
  gvns: [
    ['Solução inicial', 'Rota aleatória, seguida de VND.'],
    ['Busca local (VND)', 'Percorre N1 (2-opt), N2 (Or-opt) e N3 (troca de duas cidades) em sequência; qualquer melhora volta a N1; termina quando nenhuma das três melhora.'],
    ['Agitação', 'Em N_k, aplica k movimentos aleatórios à rota atual.'],
    ['Atualização', 'Mesma regra do VNS: melhora ⇒ aceita e k = 1; senão k ← k + 1.'],
  ],
  aco: [
    ['Solução inicial', 'Não há: o feromônio parte uniforme (τ = 1 em todas as arestas).'],
    ['Construção', 'Cada formiga parte de uma cidade sorteada e, entre as não visitadas, escolhe a próxima com probabilidade proporcional a τ^α · η^β, em que η = 1/distância.'],
    ['Atualização do feromônio', 'Evaporação τ ← (1 − ρ)·τ em todas as arestas; a melhor rota encontrada até então reforça as arestas que usa. τ é limitado a [0,01; 1].'],
    ['Efeito', 'Arestas frequentes nas boas rotas ganham feromônio (aparecem mais grossas no mapa) e passam a ser escolhidas mais vezes.'],
    ['Busca local / perturbação', 'Não há; a diversificação vem da escolha probabilística.'],
  ],
  pso: [
    ['Representação', 'Cada partícula tem um vetor real com uma chave por cidade; a rota é a ordem crescente das chaves (random keys).'],
    ['Solução inicial', 'Chaves sorteadas em [0, 1]; velocidades pequenas.'],
    ['Velocidade', 'v ← w·v + c₁·r₁·(melhor própria − x) + c₂·r₂·(melhor global − x), limitada em ±0,5.'],
    ['Posição', 'x ← x + v; a nova rota resulta de reordenar as cidades pelas novas chaves.'],
    ['Memória', 'Cada partícula guarda a melhor posição que visitou; o enxame guarda a melhor global (a rota exibida). Não há busca local.'],
  ],
  vnd: [
    ['Solução inicial', 'Rota aleatória.'],
    ['Descida', 'Aplica a melhor melhora em N1 (2-opt); sem melhora, passa a N2 (Or-opt) e depois a N3 (troca de duas cidades). Qualquer melhora volta a N1.'],
    ['Perturbação', 'Não há. Termina no primeiro ótimo local comum às três vizinhanças, sem mecanismo de escape.'],
  ],
};

const referenceCost = (I) => I.ref;

/* ---------- estado e interface ---------- */

const $ = (id) => document.getElementById(id);
const state = {
  alg: ALGS[0], inst: INSTANCES.pequena, vals: {}, seed: 1,
  gen: null, steps: [], best: null, optAt: null, optTime: 0, burst: null, done: false, playing: false, acc: 0,
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
    btn.onclick = () => { state.alg = a; state.vals = defaultsFor(a, state.inst); buildTabsSel(); buildParams(); reset(); if (state.showExplain) state.showExplain(a); };
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
      input.type = 'range'; input.min = q.min; input.max = typeof q.max === 'function' ? q.max(state.inst) : q.max; input.step = q.step;
      input.value = state.vals[q.id]; out.textContent = fmt(state.vals[q.id], q.dec || 3);
      input.oninput = () => { state.vals[q.id] = Number(input.value); out.textContent = fmt(input.value, q.dec || 3); };
      input.onchange = () => reset();
      title.appendChild(out);
    }
    lab.appendChild(title); lab.appendChild(input);
    box.appendChild(lab);
  });
}

function buildExplain() {
  const tabs = $('exp-tabs'), body = $('exp-body');
  const show = (a) => {
    [...tabs.children].forEach((b, i) => b.setAttribute('aria-selected', ALGS[i] === a));
    body.innerHTML = '<dl class="exp">' + EXPLICA[a.id].map(([t, x]) => `<dt>${t}</dt><dd>${x}</dd>`).join('') + '</dl>';
  };
  ALGS.forEach((a) => {
    const btn = document.createElement('button');
    btn.className = 'tab'; btn.textContent = a.nome; btn.setAttribute('role', 'tab');
    btn.onclick = () => show(a);
    tabs.appendChild(btn);
  });
  show(state.alg);
  return show;
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
  const I = state.inst, ref = referenceCost(I);
  const gap = state.best ? ` (+${fmt(100 * (state.best.f - ref) / ref, 1)}%)` : '';
  const found = state.optAt === null ? 'ainda não' : `no passo ${state.optAt}`;
  $('stats').innerHTML =
    `<span>Passo <b>${state.steps.length - 1}</b></span>` +
    `<span>Custo atual <b>${s && !s.empty ? fmt(s.f) : '-'}</b>${s && s.partial && !s.empty ? ' (rota parcial)' : ''}</span>` +
    `<span>Melhor rota <b>${state.best ? fmt(state.best.f) : '-'}</b>${gap}</span>` +
    `<span>Ótimo (${I.optSrc}) <b>${fmt(ref)}</b></span>` +
    `<span class="${state.optAt === null ? '' : 'hit'}">Ótimo alcançado: <b>${state.optAt === null ? found : '✓ ' + found}</b></span>` +
    `<span>${state.done ? '<b>Execução concluída</b>' : ''}</span>`;
}

function advance() {
  if (state.done) return false;
  const r = state.gen.next();
  if (r.done) {
    state.done = true; state.playing = false;
    $('play').textContent = 'Executar';
    log(`Execução concluída: melhor rota = ${fmt(state.best.f)} (ótimo = ${fmt(referenceCost(state.inst))}).`);
    updateStats();
    return false;
  }
  const s = r.value;
  state.steps.push(s);
  const idx = state.steps.length - 1;
  if (!s.partial && (!state.best || s.f < state.best.f - 1e-9)) state.best = { f: s.f, tour: s.tour };
  if (state.optAt === null && state.best && state.best.f <= referenceCost(state.inst) + 1e-7) {
    state.optAt = idx; state.optTime = performance.now(); state.burst = null;
    log(`Ótimo (${fmt(referenceCost(state.inst))}) alcançado no passo ${idx}.`, idx);
  }
  log(s.msg, idx);
  updateStats();
  return true;
}

function reset() {
  const rnd = mulberry32(state.seed);
  state.gen = state.alg.make(state.inst, state.vals, rnd);
  state.steps = []; state.best = null; state.optAt = null; state.optTime = 0; state.burst = null; state.done = false;
  state.playing = false; state.acc = 0;
  $('play').textContent = 'Executar';
  $('log').innerHTML = '';
  // passo 0: só as cidades, sem rota
  state.steps.push({ tour: [], f: 0, msg: `Instância com ${state.inst.n} cidades. Ainda não há rota.`, hi: [], partial: true, empty: true });
  log(state.steps[0].msg, 0);
  updateStats();
}

function initUI() {
  Object.values(INSTANCES).forEach((I) => {
    const o = document.createElement('option'); o.value = I.key; o.textContent = I.nome; $('inst').appendChild(o);
  });
  state.vals = defaultsFor(state.alg, state.inst);
  buildTabs(); buildTabsSel(); buildParams(); state.showExplain = buildExplain();
  $('inst').onchange = () => {
    state.inst = INSTANCES[$('inst').value];
    state.vals = defaultsFor(state.alg, state.inst);
    buildParams(); reset();
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
  $('finish').onclick = () => { state.playing = false; $('play').textContent = 'Executar'; for (let i = 0; i < 200000 && advance(); i++); };
  $('reset').onclick = reset;
  reset();
}

/* ---------- desenho (p5.js) ---------- */

new p5((p) => {
  const PAD = 12, WIDE = 820, MAPH_MAX = 460;
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
  const alpha = (c, a) => p.color(p.red(c), p.green(c), p.blue(c), a);

  function layout() {
    const W = p.width, wide = W >= WIDE;
    const mapW = wide ? Math.floor(W / 2) : W;
    const bb = state.inst.bb, mapH = Math.round(Math.min(MAPH_MAX, Math.max(300, mapW * Math.min(1, bb.sy / bb.sx) + 70)));
    return { wide, mapW, mapH, chartW: wide ? W - mapW : W, chartH: wide ? mapH : 240, total: wide ? mapH : mapH + 240 };
  }

  function drawMap(s, x0, y0, w, h) {
    const I = state.inst, n = I.n;
    p.push(); p.translate(x0, y0);
    txt(s.empty ? 'Cidades (ainda sem rota)' : 'Rota (custo ' + fmt(s.f) + (s.partial ? ', parcial' : '') + ')', PAD, 6, K.muted, 12);
    const M = 26, bb = I.bb, aw = w - 2 * M, ah = h - 24 - 1.5 * M;
    const sc = Math.min(aw / bb.sx, ah / bb.sy);
    const ox = (w - bb.sx * sc) / 2, oy = 24 + M * 0.5 + (ah - bb.sy * sc) / 2;
    const pt = (c) => [ox + (I.x[c] - bb.minx) * sc, oy + (I.y[c] - bb.miny) * sc];
    const edges = (t, closed) => { const out = []; for (let i = 0; i + 1 < t.length; i++) out.push([t[i], t[i + 1]]); if (closed && t.length > 1) out.push([t[t.length - 1], t[0]]); return out; };
    // feromônio
    if (s.tau) {
      for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) {
        const tv = s.tau[a * n + b];
        if (tv <= 0.03) continue;
        p.stroke(alpha(K.accent, 40 + 120 * tv)); p.strokeWeight(0.5 + 3.5 * tv);
        const [x1, y1] = pt(a), [x2, y2] = pt(b); p.line(x1, y1, x2, y2);
      }
    }
    // melhor rota até então (sob a rota atual)
    const showBest = state.best && !s.partial && state.best.f < s.f - 1e-9;
    if (showBest) {
      p.stroke(alpha(K.good, 150)); p.strokeWeight(5);
      edges(state.best.tour, true).forEach(([a, b]) => { const [x1, y1] = pt(a), [x2, y2] = pt(b); p.line(x1, y1, x2, y2); });
    }
    // rota atual
    const hi = new Set(s.hi.map(([a, b]) => (a < b ? a * n + b : b * n + a)));
    const cur = edges(s.tour, !s.partial);
    p.strokeWeight(2);
    cur.forEach(([a, b]) => {
      const hot = hi.has(a < b ? a * n + b : b * n + a);
      p.stroke(hot ? K.warn : (s.tau ? K.text : K.accent)); p.strokeWeight(hot ? 4 : 2);
      const [x1, y1] = pt(a), [x2, y2] = pt(b); p.line(x1, y1, x2, y2);
    });
    // cidades
    const inPath = new Set(s.tour);
    const r = n <= 30 ? 9 : 6;
    for (let c = 0; c < n; c++) {
      const [cx, cy] = pt(c);
      const visited = !s.partial || inPath.has(c);
      p.stroke(K.text); p.strokeWeight(1.5);
      p.fill(visited ? K.surface : K.bg);
      if (s.partial && c === s.tour[s.tour.length - 1]) { p.fill(K.warn); p.stroke(K.warn); }
      else if (s.partial && c === s.tour[0]) { p.fill(K.good); p.stroke(K.good); }
      p.circle(cx, cy, 2 * r);
      if (n <= 30) txt(String(c + 1), cx, cy, K.text, 9, p.CENTER, p.CENTER);
    }
    p.pop();
  }

  function drawChart(x0, y0, w, h) {
    const I = state.inst, S = state.steps, ref = referenceCost(I);
    p.push(); p.translate(x0, y0);
    txt('Convergência (custo da rota)', PAD, 6, K.muted, 12);
    const lg = [['atual', K.accent], ['melhor encontrada', K.good], ['ótimo', K.warn]];
    let lx = w - PAD;
    for (let i = lg.length - 1; i >= 0; i--) {
      p.textSize(10); const tw = p.textWidth(lg[i][0]);
      txt(lg[i][0], lx - tw, 22, K.muted, 10);
      p.stroke(lg[i][1]); p.strokeWeight(2); p.line(lx - tw - 22, 28, lx - tw - 6, 28); p.strokeWeight(1);
      lx -= tw + 34;
    }
    const L = PAD + 40, R = w - PAD, T = 44, B = h - 26;
    const done = S.filter((s) => !s.partial);
    const ymax = Math.max(ref * 1.15, ...done.map((s) => s.f)) * 1.02, ymin = ref * 0.85;
    const n = Math.max(30, S.length - 1);
    const xs = (i) => L + (i / n) * (R - L), ys = (f) => B - ((f - ymin) / (ymax - ymin)) * (B - T);
    p.stroke(K.border); p.line(L, B, R, B); p.line(L, T, L, B);
    txt(fmt(ymin, 0), L - 6, B - 6, K.muted, 10, p.RIGHT); txt(fmt(ymax, 0), L - 6, T - 2, K.muted, 10, p.RIGHT);
    txt(`passo (0 a ${n})`, R, B + 8, K.muted, 10, p.RIGHT);
    p.stroke(K.warn); p.drawingContext.setLineDash([6, 4]); p.line(L, ys(ref), R, ys(ref)); p.drawingContext.setLineDash([]);
    txt(fmt(ref), L - 6, ys(ref) - 6, K.warn, 10, p.RIGHT);
    p.noFill();
    p.stroke(K.accent); p.strokeWeight(1.5);
    p.beginShape(); S.forEach((s, i) => { if (!s.partial) p.vertex(xs(i), ys(Math.min(s.f, ymax))); }); p.endShape();
    p.stroke(K.good); p.strokeWeight(2);
    let b = Infinity; p.beginShape();
    S.forEach((s, i) => { if (s.partial) return; b = Math.min(b, s.f); p.vertex(xs(i), ys(b)); });
    p.endShape(); p.strokeWeight(1);
    p.pop();
  }

  /* Ótimo/referência: confete só na primeira vez (~2,5 s); depois fica apenas o ✓ no canto. */
  function celebrate() {
    if (state.optAt === null) return;
    txt(`✓ ótimo alcançado no passo ${state.optAt}`, layout().mapW - PAD, 6, K.good, 12, p.RIGHT);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const age = (performance.now() - state.optTime) / 1000;
    if (age > 2.5) return;
    if (!state.burst) {
      const cols = [K.good, K.accent, K.warn, K.bad];
      state.burst = Array.from({ length: 90 }, (_, i) => ({
        x: p.width / 2, y: Math.min(p.height * 0.3, 160),
        vx: (Math.random() - 0.5) * 520, vy: -Math.random() * 380 - 60,
        c: cols[i % cols.length], r: 3 + Math.random() * 3,
      }));
    }
    const a = 255 * Math.min(1, (2.5 - age) / 0.8);
    state.burst.forEach((q) => {
      const x = q.x + q.vx * age, y = q.y + q.vy * age + 450 * age * age;
      p.noStroke(); p.fill(alpha(q.c, a)); p.rect(x, y, q.r * 1.6, q.r, 1);
    });
    p.noStroke(); p.fill(alpha(K.good, a));
    p.textSize(22); p.textAlign(p.CENTER, p.CENTER);
    p.text(`Ótimo alcançado: ${fmt(referenceCost(state.inst))}`, p.width / 2, 40);
  }

  p.setup = () => {
    holder = $('holder');
    p.createCanvas(holder.clientWidth, 520).parent(holder);
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
    const L = layout();
    if (Math.abs(p.height - L.total) > 1) p.resizeCanvas(holder.clientWidth, L.total);
    K = readColors();
    p.clear();
    p.background(K.surface);
    drawMap(s, 0, 0, L.mapW, L.mapH);
    if (L.wide) { drawChart(L.mapW, 0, L.chartW, L.chartH); p.stroke(K.border); p.line(L.mapW, 0, L.mapW, L.mapH); }
    else { p.stroke(K.border); p.line(0, L.mapH, p.width, L.mapH); drawChart(0, L.mapH, p.width, L.chartH); }
    celebrate();
  };
}, document.body);

initUI();
