import { selectQuestions } from './selection.js';
import { reward, stars } from './game.js';
import { phaseState } from './map.js';
const now = () => new Date().toISOString();
export const makeId = () => globalThis.crypto.randomUUID();
export function startSession(profile, phase, questions, config, random = Math.random) {
  if (profile.activeSession) throw new Error('Continue ou abandone a partida atual antes de iniciar outra.');
  if (!['available', 'completed'].includes(phaseState(phase, profile))) throw new Error('Essa fase ainda está bloqueada.');
  const snapshots = selectQuestions(phase, questions, profile, random, config.janelaRecente);
  const session = { sessionId: makeId(), phaseId: phase.id, contentVersion: config.version, rules: structuredClone(config), questionIds: snapshots.map(q => q.id), questionSnapshots: snapshots, optionOrders: Object.fromEntries(snapshots.map(q => [q.id, q.alternativas.map(a => a.id)])), currentIndex: 0, answers: [], shownIds: [], hints: [], usedPowers: [], streak: 0, bestStreak: 0, totals: { points: 0, xp: 0, coins: 0 }, status: 'awaiting_answer', startedAt: now() };
  profile.activeSession = session;
  return session;
}
export function showCurrent(profile) {
  const session = profile.activeSession;
  const q = session.questionSnapshots[session.currentIndex];
  if (!session.shownIds.includes(q.id)) {
    session.shownIds.push(q.id);
    const h = profile.questionHistory[q.id] ||= { shownCount: 0, answeredCount: 0, correctCount: 0, wrongCount: 0, skippedCount: 0, lastOutcome: null };
    h.shownCount++; h.lastShownAt = now();
    return true;
  }
  return false;
}
export function useHint(profile, config) {
  const s = profile.activeSession;
  config = s?.rules || config;
  const q = s?.questionSnapshots[s.currentIndex];
  if (!s || s.status !== 'awaiting_answer' || s.hints.includes(q.id) || profile.coins < config.custos.dica) return false;
  profile.coins -= config.custos.dica; s.totals.coins -= config.custos.dica;
  s.hints.push(q.id); s.usedPowers.push('dica');
  return true;
}
export function answerQuestion(profile, alternativeId, config, skip = false) {
  const s = profile.activeSession;
  config = s?.rules || config;
  if (!s || s.status !== 'awaiting_answer' || s.answers[s.currentIndex]) return false;
  const q = s.questionSnapshots[s.currentIndex];
  if (skip) {
    if (s.usedPowers.includes('pulo') || profile.coins < config.custos.pulo) return false;
    profile.coins -= config.custos.pulo; s.totals.coins -= config.custos.pulo; s.usedPowers.push('pulo');
  } else if (!q.alternativas.some(a => a.id === alternativeId)) return false;
  showCurrent(profile);
  const outcome = skip ? 'skipped' : alternativeId === q.corretaId ? 'correct' : 'wrong';
  const r = outcome === 'correct' ? reward(q.dificuldade, s.streak, s.hints.includes(q.id), config) : { points: 0, xp: 0, coins: 0 };
  s.streak = outcome === 'correct' ? s.streak + 1 : 0;
  s.bestStreak = Math.max(s.bestStreak, s.streak);
  profile.stats.bestStreak = Math.max(profile.stats.bestStreak, s.streak);
  s.answers.push({ questionId: q.id, alternativeId: skip ? null : alternativeId, outcome, ...r });
  for (const key of ['points', 'xp', 'coins']) s.totals[key] += r[key];
  profile.xp += r.xp; profile.coins += r.coins; profile.totalPoints += r.points;
  profile.stats.answered++; profile.stats[outcome]++;
  const h = profile.questionHistory[q.id]; h.answeredCount++; h[outcome === 'correct' ? 'correctCount' : outcome === 'wrong' ? 'wrongCount' : 'skippedCount']++; h.lastOutcome = outcome;
  s.status = 'feedback';
  return true;
}
export function nextQuestion(profile) {
  const s = profile.activeSession;
  if (!s || s.status !== 'feedback') return false;
  if (s.currentIndex + 1 === s.questionIds.length) return 'finish';
  s.currentIndex++; s.status = 'awaiting_answer';
  return true;
}
export function finishSession(profile, config, abandoned = false) {
  const s = profile.activeSession;
  if (!s) return null;
  const retention = config;
  config = s.rules || config;
  if (!abandoned && s.answers.length !== s.questionIds.length) return null;
  const accuracy = s.answers.filter(a => a.outcome === 'correct').length / s.questionIds.length;
  const approved = !abandoned && accuracy >= config.aprovacao;
  const summary = { sessionId: s.sessionId, phaseId: s.phaseId, startedAt: s.startedAt, endedAt: now(), shownIds: [...s.shownIds], answers: s.answers, accuracy, approved, abandoned, stars: abandoned ? 0 : stars(accuracy, s.usedPowers.length, config), totals: { ...s.totals }, bestStreak: s.bestStreak, bonus: false };
  if (!abandoned) {
    const p = profile.phaseProgress[s.phaseId] ||= { approved: false, bestScore: 0, bestAccuracy: 0, bestStars: 0, completedAttempts: 0, firstBonusPaid: false };
    if (approved && !p.firstBonusPaid) { profile.xp += config.premioAprovacao.xp; profile.coins += config.premioAprovacao.moedas; summary.totals.xp += config.premioAprovacao.xp; summary.totals.coins += config.premioAprovacao.moedas; p.firstBonusPaid = true; summary.bonus = true; }
    p.approved ||= approved; p.bestScore = Math.max(p.bestScore, s.totals.points); p.bestAccuracy = Math.max(p.bestAccuracy, accuracy); p.bestStars = Math.max(p.bestStars, summary.stars); p.completedAttempts++; p.lastAttemptAt = summary.endedAt;
    profile.stats.completed++;
  }
  const recent = profile.recentByPhase[s.phaseId] ||= []; recent.push([...s.shownIds]);
  profile.recentByPhase[s.phaseId] = recent.slice(-retention.janelaRecente);
  profile.sessions.push(summary); profile.sessions = profile.sessions.slice(-retention.limites.sessoes);
  profile.activeSession = null;
  return summary;
}
