export function levelInfo(xp, config) {
  const thresholds = config.niveis;
  let level = 1;
  while (level < thresholds.length && xp >= thresholds[level]) level++;
  if (xp >= thresholds.at(-1)) level = thresholds.length + Math.floor((xp - thresholds.at(-1)) / config.xpPorNivelExtra);
  const start = level <= thresholds.length ? thresholds[level - 1] : thresholds.at(-1) + (level - thresholds.length) * config.xpPorNivelExtra;
  const end = level < thresholds.length ? thresholds[level] : start + config.xpPorNivelExtra;
  return { level, start, end, progress: (xp - start) / (end - start) };
}
export function campaignScore(profile) { return Object.values(profile.phaseProgress).reduce((sum, p) => sum + p.bestScore, 0); }
export function totalStars(profile) { return Object.values(profile.phaseProgress).reduce((sum, p) => sum + p.bestStars, 0); }
