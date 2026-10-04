export function shuffle(items, random = Math.random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [result[i], result[j]] = [result[j], result[i]]; }
  return result;
}
export function candidates(phase, questions) {
  return questions.filter(q => q.ativa && q.linguagem === phase.linguagem && (phase.perguntaIds?.includes(q.id) || q.temas.some(t => phase.temas.includes(t))));
}
export function selectQuestions(phase, questions, profile, random = Math.random, windowSize = 2) {
  const pool = candidates(phase, questions);
  const recent = new Set((profile.recentByPhase[phase.id] || []).slice(-windowSize).flat());
  const history = profile.questionHistory;
  const chosen = [];
  for (const difficulty of ['facil', 'medio', 'dificil']) {
    const eligible = pool.filter(q => q.dificuldade === difficulty);
    const quota = phase.quotas[difficulty];
    if (eligible.length < quota) throw new Error(`Conteúdo insuficiente: ${phase.titulo}, dificuldade ${difficulty}.`);
    const available = eligible.filter(q => !recent.has(q.id));
    const fresh = shuffle(available.filter(q => !history[q.id]?.shownCount), random);
    const errors = shuffle(available.filter(q => history[q.id]?.lastOutcome === 'wrong'), random);
    const other = shuffle(available.filter(q => history[q.id]?.shownCount && history[q.id]?.lastOutcome !== 'wrong'), random);
    const priority = [];
    while (fresh.length || errors.length) { if (fresh.length) priority.push(fresh.pop()); if (errors.length) priority.push(errors.pop()); }
    priority.push(...other);
    const fallback = shuffle(eligible.filter(q => recent.has(q.id)), random).sort((a, b) => (history[a.id]?.lastShownAt || '').localeCompare(history[b.id]?.lastShownAt || ''));
    chosen.push(...[...priority, ...fallback].slice(0, quota));
  }
  return shuffle(chosen, random).map(q => ({ ...structuredClone(q), alternativas: q.embaralharAlternativas === false ? structuredClone(q.alternativas) : shuffle(structuredClone(q.alternativas), random) }));
}
