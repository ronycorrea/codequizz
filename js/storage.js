import { makeId } from './quiz.js';
import { validateQuestion, validateRules } from './validation.js';
import { reward } from './game.js';
export const SAVE_KEY = 'codequizz:save:v1';
const guard = (c,m) => { if (!c) throw new Error(m); };
const nonnegative = n => Number.isSafeInteger(n) && n >= 0;
const object = x => x !== null && typeof x === 'object' && !Array.isArray(x);
export function emptySave(contentVersion) { return { schemaVersion: 1, contentVersion, revision: 0, activeProfileId: null, profiles: [] }; }
export function createProfile(apelido, avatarId, config) {
  apelido = apelido.trim();
  guard(apelido.length >= 2 && apelido.length <= 24 && ['explorer','android'].includes(avatarId), 'Escolha um apelido de 2 a 24 caracteres e um avatar.');
  return { id: makeId(), apelido, avatarId, createdAt: new Date().toISOString(), xp: 0, coins: config.saldoInicial, totalPoints: 0, stats: { answered: 0, correct: 0, wrong: 0, skipped: 0, bestStreak: 0, completed: 0 }, settings: { sound: true, music: true, volume: 65, motion: !globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches }, phaseProgress: {}, questionHistory: {}, recentByPhase: {}, achievements: {}, sessions: [], activeSession: null };
}
export function validateSave(save, data) {
  guard(object(save) && save.schemaVersion === 1 && typeof save.contentVersion === 'string' && /^\d+\.\d+\.\d+$/.test(save.contentVersion) && nonnegative(save.revision) && Array.isArray(save.profiles) && save.profiles.length <= data.config.limites.perfis, 'Formato ou versão de progresso incompatível.');
  const savedVersion = save.contentVersion.split('.').map(Number), currentVersion = data.config.version.split('.').map(Number);
  const differingPart = savedVersion.findIndex((n,i) => n !== currentVersion[i]);
  guard(differingPart < 0 || savedVersion[differingPart] < currentVersion[differingPart], 'Este progresso usa uma versão futura do conteúdo.');
  const ids = new Set();
  const phases = new Set(data.fases.map(p => p.id));
  const objectives = new Set(data.objetivos.map(o => o.id));
  const safeId = id => typeof id === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(id) && !['__proto__','constructor','prototype'].includes(id);
  for (const p of save.profiles) {
    guard(object(p) && safeId(p.id) && !ids.has(p.id) && typeof p.apelido === 'string' && p.apelido.trim().length >= 2 && p.apelido.length <= 24 && ['explorer','android'].includes(p.avatarId), 'Perfil inválido ou duplicado.'); ids.add(p.id);
    guard(['xp','coins','totalPoints'].every(k => nonnegative(p[k])) && object(p.stats) && ['answered','correct','wrong','skipped','bestStreak','completed'].every(k => nonnegative(p.stats[k])) && p.stats.answered === p.stats.correct + p.stats.wrong + p.stats.skipped, 'Estatísticas inválidas.');
    guard(object(p.settings) && typeof p.settings.sound === 'boolean' && typeof p.settings.motion === 'boolean', 'Preferências inválidas.');
    guard((p.settings.music === undefined || typeof p.settings.music === 'boolean') && (p.settings.volume === undefined || Number.isInteger(p.settings.volume) && p.settings.volume >= 0 && p.settings.volume <= 100), 'Preferências de áudio inválidas.');
    guard(['phaseProgress','questionHistory','recentByPhase','achievements'].every(k => object(p[k])) && Array.isArray(p.sessions) && p.sessions.length <= data.config.limites.sessoes, 'Histórico inválido.');
    for (const [id, r] of Object.entries(p.phaseProgress)) guard(phases.has(id) && object(r) && typeof r.approved === 'boolean' && typeof r.firstBonusPaid === 'boolean' && nonnegative(r.bestScore) && Number.isFinite(r.bestAccuracy) && r.bestAccuracy >= 0 && r.bestAccuracy <= 1 && nonnegative(r.bestStars) && r.bestStars <= 3 && nonnegative(r.completedAttempts), 'Progresso de fase inválido.');
    for (const [id, h] of Object.entries(p.questionHistory)) guard(safeId(id) && object(h) && ['shownCount','answeredCount','correctCount','wrongCount','skippedCount'].every(k => nonnegative(h[k])) && h.answeredCount === h.correctCount+h.wrongCount+h.skippedCount && h.shownCount >= h.answeredCount && [null,'correct','wrong','skipped'].includes(h.lastOutcome) && typeof h.lastShownAt === 'string', 'Histórico de questão inválido.');
    for (const [id, recent] of Object.entries(p.recentByPhase)) guard(phases.has(id) && Array.isArray(recent) && recent.length <= data.config.janelaRecente && recent.every(list => Array.isArray(list) && list.every(safeId) && new Set(list).size === list.length), 'Janela de repetição inválida.');
    for (const [id, a] of Object.entries(p.achievements)) guard(objectives.has(id) && object(a) && typeof a.unlockedAt === 'string' && (a.claimedAt === null || typeof a.claimedAt === 'string'), 'Conquista inválida.');
    const sessionIds = new Set();
    for (const s of p.sessions) {
      guard(object(s) && safeId(s.sessionId) && !sessionIds.has(s.sessionId) && phases.has(s.phaseId) && typeof s.abandoned === 'boolean' && typeof s.approved === 'boolean' && Number.isFinite(s.accuracy) && s.accuracy >= 0 && s.accuracy <= 1 && nonnegative(s.stars) && s.stars <= 3 && Array.isArray(s.shownIds) && s.shownIds.every(safeId) && new Set(s.shownIds).size === s.shownIds.length && Array.isArray(s.answers) && nonnegative(s.bestStreak), 'Resumo de sessão inválido.');
      const answered = new Set();
      for (const a of s.answers) { guard(object(a) && safeId(a.questionId) && !answered.has(a.questionId) && s.shownIds.includes(a.questionId) && ['correct','wrong','skipped'].includes(a.outcome) && ['points','xp','coins'].every(k => nonnegative(a[k])), 'Resposta histórica inválida.'); answered.add(a.questionId); }
      validateTotals(s.totals); sessionIds.add(s.sessionId);
    }
    if (p.activeSession !== null) {
      const s = p.activeSession; const phase = data.fases.find(f => f.id === s?.phaseId);
      guard(object(s) && phase && safeId(s.sessionId) && !sessionIds.has(s.sessionId) && typeof s.contentVersion === 'string' && ['awaiting_answer','feedback'].includes(s.status) && Array.isArray(s.questionSnapshots) && s.questionSnapshots.length === phase.quantidade, 'Partida ativa inválida.');
      s.questionSnapshots.forEach(validateQuestion);
      if (s.rules) validateRules(s.rules);
      const rules = s.rules || data.config;
      guard(Array.isArray(s.questionIds) && s.questionIds.every(safeId) && new Set(s.questionIds).size === phase.quantidade && s.questionSnapshots.every((q,i) => q.id === s.questionIds[i]) && nonnegative(s.currentIndex) && s.currentIndex < phase.quantidade && Array.isArray(s.answers) && s.answers.length === s.currentIndex + (s.status === 'feedback' ? 1 : 0), 'Posições da partida inválidas.');
      guard(object(s.optionOrders) && s.questionSnapshots.every(q => Array.isArray(s.optionOrders[q.id]) && JSON.stringify(s.optionOrders[q.id]) === JSON.stringify(q.alternativas.map(a => a.id))), 'Ordem de alternativas inválida.');
      guard(Array.isArray(s.shownIds) && new Set(s.shownIds).size === s.shownIds.length && s.shownIds.every(id => s.questionIds.includes(id)) && Array.isArray(s.hints) && new Set(s.hints).size === s.hints.length && s.hints.every(id => s.shownIds.includes(id)) && Array.isArray(s.usedPowers) && s.usedPowers.every(x => ['dica','pulo'].includes(x)) && s.usedPowers.filter(x => x === 'pulo').length <= 1 && s.usedPowers.filter(x => x === 'dica').length === s.hints.length && nonnegative(s.streak) && nonnegative(s.bestStreak), 'Poderes ou histórico da partida inválidos.');
      let streak = 0, bestStreak = 0;
      for (const [i,a] of s.answers.entries()) {
        const q = s.questionSnapshots[i];
        guard(object(a) && a.questionId === q.id && s.shownIds.includes(q.id) && ['correct','wrong','skipped'].includes(a.outcome) && (a.outcome === 'skipped' ? a.alternativeId === null : q.alternativas.some(x => x.id === a.alternativeId) && (a.alternativeId === q.corretaId) === (a.outcome === 'correct')) && ['points','xp','coins'].every(k => nonnegative(a[k])), 'Resposta salva inválida.');
        const expected = a.outcome === 'correct' ? reward(q.dificuldade,streak,s.hints.includes(q.id),rules) : {points:0,xp:0,coins:0};
        guard(['points','xp','coins'].every(k => a[k] === expected[k]), 'Pagamento salvo incoerente.');
        streak = a.outcome === 'correct' ? streak + 1 : 0; bestStreak = Math.max(bestStreak,streak);
      }
      validateTotals(s.totals);
      guard(s.usedPowers.filter(x => x === 'pulo').length === s.answers.filter(a => a.outcome === 'skipped').length && s.streak === streak && s.bestStreak === bestStreak && s.totals.points === s.answers.reduce((n,a) => n+a.points,0) && s.totals.xp === s.answers.reduce((n,a) => n+a.xp,0) && s.totals.coins === s.answers.reduce((n,a) => n+a.coins,0) - s.hints.length*rules.custos.dica - s.usedPowers.filter(x => x === 'pulo').length*rules.custos.pulo, 'Totais da partida incoerentes.');
    }
  }
  guard(save.activeProfileId === null || ids.has(save.activeProfileId), 'Perfil ativo inexistente.');
  return save;
}
function validateTotals(t) { guard(object(t) && nonnegative(t.points) && nonnegative(t.xp) && Number.isSafeInteger(t.coins), 'Recompensas inválidas.'); }
export function loadSave(storage, data) {
  const raw = storage.getItem(SAVE_KEY);
  if (!raw) return emptySave(data.config.version);
  return validateSave(JSON.parse(raw), data);
}
export function saveState(storage, save) {
  const raw = storage.getItem(SAVE_KEY);
  if (raw) {
    let disk;
    try { disk = JSON.parse(raw); } catch { throw new Error('O progresso armazenado está inválido. Exporte seus dados antes de recuperar.'); }
    if (disk.revision !== save.revision) throw new Error('Outra aba alterou seu progresso. Recarregue esta página para continuar.');
  }
  const next = { ...save, revision: save.revision + 1 };
  storage.setItem(SAVE_KEY, JSON.stringify(next)); save.revision = next.revision;
}
export function parseImport(text, data) {
  guard(new TextEncoder().encode(text).length <= data.config.limites.importBytes, 'O arquivo deve ter no máximo 2 MB.');
  return validateSave(JSON.parse(text), data);
}
