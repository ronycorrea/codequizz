export function levelInfo(xp, config) {
  const thresholds = config.niveis;
  let level = 1;
  while (level < thresholds.length && xp >= thresholds[level]) level++;
  if (xp >= thresholds.at(-1)) level = thresholds.length + Math.floor((xp - thresholds.at(-1)) / config.xpPorNivelExtra);
  const start = level <= thresholds.length ? thresholds[level - 1] : thresholds.at(-1) + (level - thresholds.length) * config.xpPorNivelExtra;
  const end = level < thresholds.length ? thresholds[level] : start + config.xpPorNivelExtra;
  return { level, start, end, progress: (xp - start) / (end - start) };
}
export function reward(difficulty, streak, hinted, config) {
  const points = config.pontos[difficulty] + Math.min(streak * config.combo.passos, config.combo.maximo);
  return { points: Math.floor(points * (hinted ? config.fatorDica : 1)), xp: config.xp[difficulty], coins: config.moedas[difficulty] };
}
export function stars(accuracy, usedPowers, config) {
  if (accuracy < config.aprovacao) return 0;
  if (accuracy === 1 && !usedPowers) return 3;
  return accuracy >= config.duasEstrelas ? 2 : 1;
}
export function campaignScore(profile) { return Object.values(profile.phaseProgress).reduce((sum, p) => sum + p.bestScore, 0); }
export function totalStars(profile) { return Object.values(profile.phaseProgress).reduce((sum, p) => sum + p.bestStars, 0); }
export function ranking(profiles) {
  return [...profiles].sort((a, b) => campaignScore(b) - campaignScore(a) || totalStars(b) - totalStars(a) || a.apelido.localeCompare(b.apelido, 'pt-BR'));
}
