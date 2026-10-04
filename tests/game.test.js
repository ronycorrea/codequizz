import { test } from 'node:test';
import assert from 'node:assert/strict';
import { reward, stars, levelInfo, ranking, campaignScore } from '../js/game.js';
import { startSession, answerQuestion, showCurrent, useHint, nextQuestion, finishSession } from '../js/quiz.js';
import { evaluateObjectives, claimObjective } from '../js/achievements.js';
import { phaseState } from '../js/map.js';
import { data, freshProfile, random } from './helpers.js';
const config = data.config;
function complete(p, correct = 10) {
  startSession(p,data.fases[0],data.perguntas,config,random());
  for (let i = 0; i < 10; i++) { const q = p.activeSession.questionSnapshots[i]; answerQuestion(p,i < correct ? q.corretaId : q.alternativas.find(a => a.id !== q.corretaId).id,config); if (i < 9) nextQuestion(p); }
  return finishSession(p,config);
}
test('combo tem teto; dica reduz base mais bônus arredondando para baixo', () => {
  assert.deepEqual([0,1,2,3,4,5].map(s => reward('facil',s,false,config).points),[100,110,120,130,140,140]);
  assert.equal(reward('facil',0,true,config).points,70); assert.equal(reward('medio',1,true,config).points,112);
});
test('limiares de níveis incluem transições a partir do nível seis', () => {
  for (const [xp,l] of [[0,1],[499,1],[500,2],[1199,2],[1200,3],[1999,3],[2000,4],[2999,4],[3000,5],[3999,5],[4000,6],[5000,7]]) { const info = levelInfo(xp,config); assert.equal(info.level,l); assert.ok(info.progress >= 0 && info.progress < 1); }
});
test('estrelas respeitam aprovação, precisão e poderes', () => { assert.deepEqual([.5,.6,.8,1].map(a => stars(a,0,config)),[0,1,2,3]); assert.equal(stars(1,1,config),2); });
test('dica só debita uma vez; correção por ID só paga uma vez', () => {
  const p = freshProfile(); startSession(p,data.fases[0],data.perguntas,config,random()); showCurrent(p);
  assert.ok(useHint(p,config)); assert.equal(p.coins,80); assert.equal(useHint(p,config),false);
  const q = p.activeSession.questionSnapshots[0]; assert.ok(answerQuestion(p,q.corretaId,config)); const xp = p.xp;
  assert.equal(answerQuestion(p,q.corretaId,config),false); assert.equal(p.xp,xp); assert.equal(p.stats.correct,1);
});
test('pulo só uma vez por sessão, zera combo e não dá recompensa', () => {
  const p = freshProfile(); startSession(p,data.fases[0],data.perguntas,config,random());
  assert.ok(answerQuestion(p,p.activeSession.questionSnapshots[0].corretaId,config)); nextQuestion(p);
  assert.ok(answerQuestion(p,null,config,true)); assert.equal(p.activeSession.streak,0); assert.equal(p.activeSession.answers[1].xp,0); assert.equal(p.stats.skipped,1);
  nextQuestion(p); assert.equal(answerQuestion(p,null,config,true),false);
});
test('saldo insuficiente impede poder e preserva os dados', () => {
  const p = freshProfile(); p.coins = 10; startSession(p,data.fases[0],data.perguntas,config);
  assert.equal(useHint(p,config),false); assert.equal(answerQuestion(p,null,config,true),false); assert.equal(p.coins,10);
});
test('primeira aprovação paga uma vez; repetição inferior preserva recordes', () => {
  const p = freshProfile(); const first = complete(p); assert.ok(first.bonus); const before = structuredClone(p.phaseProgress['camp60-01']);
  assert.equal(finishSession(p,config),null); const second = complete(p,6); assert.equal(second.bonus,false);
  assert.equal(p.phaseProgress['camp60-01'].bestScore,before.bestScore); assert.equal(p.phaseProgress['camp60-01'].bestStars,3);
  assert.equal(phaseState(data.fases[1],p),'available'); assert.equal(phaseState(data.fases[2],p),'locked');
});
test('abandono registra apenas expostas e conserva recompensas sem bônus', () => {
  const p = freshProfile(); startSession(p,data.fases[0],data.perguntas,config); showCurrent(p); answerQuestion(p,p.activeSession.questionSnapshots[0].corretaId,config); const xp = p.xp;
  const summary = finishSession(p,config,true); assert.equal(summary.shownIds.length,1); assert.equal(summary.approved,false); assert.equal(p.xp,xp); assert.equal(p.stats.completed,0); assert.equal(p.phaseProgress['camp60-01'],undefined);
});
test('conquista resgata uma vez e ranking usa recordes, não pontos acumulados', () => {
  const p = freshProfile(); complete(p); evaluateObjectives(p,data.objetivos,data.mundos);
  assert.ok(claimObjective(p,data.objetivos[0])); const coins = p.coins; assert.equal(claimObjective(p,data.objetivos[0]),false); assert.equal(p.coins,coins);
  const other = freshProfile(); other.totalPoints = 999999; assert.equal(ranking([other,p])[0],p); assert.ok(campaignScore(p) > 0);
});
