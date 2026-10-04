export function objectiveProgress(objective, profile, worlds) {
  const s = profile.stats;
  switch (objective.tipoCondicao) {
    case 'primeira_fase': return profile.phaseProgress['camp60-01']?.approved ? 1 : 0;
    case 'acertos': return s.correct;
    case 'sequencia': return s.bestStreak;
    case 'perfeito': return Object.values(profile.phaseProgress).some(p => p.bestAccuracy === 1) ? 1 : 0;
    case 'mundo': return worlds.filter(w => w.publicado && w.faseIds.length && w.faseIds.every(id => profile.phaseProgress[id]?.approved)).length;
    default: return 0;
  }
}
export function evaluateObjectives(profile, objectives, worlds) {
  for (const o of objectives.filter(o => o.ativo)) if (objectiveProgress(o, profile, worlds) >= o.meta && !profile.achievements[o.id]) profile.achievements[o.id] = { unlockedAt: new Date().toISOString(), claimedAt: null };
}
export function claimObjective(profile, objective) {
  const achievement = profile.achievements[objective.id];
  if (!achievement || achievement.claimedAt) return false;
  achievement.claimedAt = new Date().toISOString();
  profile.xp += objective.recompensaXP; profile.coins += objective.recompensaMoedas;
  return true;
}
