const APP_KEY = 'behavior-style-v1';
const CURRENT_KEY = 'as16.current';

export const scaleLabels = [
  '左側（A側）にとても近い',
  '左側（A側）にやや近い',
  'どちらとも言えない（中立）',
  '右側（B側）にやや近い',
  '右側（B側）にとても近い'
];

export const scoreMap = {
  1: { L: 2, R: 0 },
  2: { L: 1, R: 0 },
  3: { L: 0, R: 0 },
  4: { L: 0, R: 1 },
  5: { L: 0, R: 2 }
};

export async function loadJson(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

export function saveState(state) {
  localStorage.setItem(APP_KEY, JSON.stringify(state));
}

export function saveCurrent(current) {
  localStorage.setItem(CURRENT_KEY, JSON.stringify(current));
}

export function loadState() {
  const raw = localStorage.getItem(APP_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function loadCurrent() {
  const raw = localStorage.getItem(CURRENT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearState() {
  localStorage.removeItem(APP_KEY);
}

export function clearCurrent() {
  localStorage.removeItem(CURRENT_KEY);
}

export function initAxisScores(axes) {
  return Object.fromEntries(axes.map((a) => [a.id, { L: 0, R: 0, n: 0 }]));
}

export function scoreQuestions(questions, answers, axes) {
  const byAxis = initAxisScores(axes);
  questions.forEach((q) => {
    const ans = answers[q.id];
    byAxis[q.axis].n += 1;
    if (!ans) return;
    const sc = scoreMap[ans];
    byAxis[q.axis].L += sc.L;
    byAxis[q.axis].R += sc.R;
  });
  return byAxis;
}

export function computeAxisMetric(axisDef, score) {
  const max = 2 * score.n;
  const raw = score.L - score.R;
  const norm = max ? raw / max : 0;
  const strength = Math.abs(norm);
  const answeredRatio = max ? (score.L + score.R) / max : 0;
  const leftPct = 50 + 50 * norm;
  const char = raw > 0 ? axisDef.left : raw < 0 ? axisDef.right : null;
  return {
    id: axisDef.id,
    left: axisDef.left,
    right: axisDef.right,
    leftName: axisDef.leftName,
    rightName: axisDef.rightName,
    raw,
    norm,
    strength,
    answeredRatio,
    leftPct,
    char
  };
}

export function summarize(metrics) {
  const unresolved = metrics.filter((m) => m.raw === 0).map((m) => m.id);
  const axisConf = metrics.map((m) => 0.7 * m.strength + 0.3 * m.answeredRatio);
  const overall = axisConf.reduce((a, b) => a + b, 0) / axisConf.length;
  let level = '中';
  let reason = 'やや拮抗する軸があり、参考情報として活用してください。';
  if (overall >= 0.7) {
    level = '高';
    reason = '各軸の偏りが比較的はっきりしています。';
  } else if (overall < 0.4) {
    level = '低';
    reason = '中立回答や拮抗軸が多めです。あくまで傾向としてご覧ください。';
  }
  return { unresolved, overall, level, reason };
}
