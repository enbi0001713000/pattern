export type AxisScore = {
  L: number;
  R: number;
  n: number;
};

export type ScoreBalance = {
  raw: number;
  norm: number;
  strength: number;
  answeredRatio: number;
  leftPct: number;
};

export function calcScores(score: AxisScore): ScoreBalance {
  const max = 2 * score.n;
  const raw = score.L - score.R;
  const norm = max === 0 ? 0 : raw / max;
  const strength = Math.abs(norm);
  const answeredRatio = max === 0 ? 0 : (score.L + score.R) / max;
  const leftPct = 50 + 50 * norm;

  return {
    raw,
    norm,
    strength,
    answeredRatio,
    leftPct
  };
}

export function strengthLabel(strength: number): '拮抗' | 'やや寄り' | '寄り' | '強く寄り' {
  if (strength < 0.2) return '拮抗';
  if (strength < 0.4) return 'やや寄り';
  if (strength < 0.7) return '寄り';
  return '強く寄り';
}
