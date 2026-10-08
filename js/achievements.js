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
