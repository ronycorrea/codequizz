import { test } from 'node:test';
import assert from 'node:assert/strict';
import { selectQuestions } from '../js/selection.js';
import { validateContent } from '../js/validation.js';
import { data, freshProfile, random } from './helpers.js';
test('todos os bancos atendem três vezes cada quota e IDs são únicos', () => assert.equal(validateContent(data),data));
test('sorteio respeita unicidade, linguagem, temas, quotas e identidade das alternativas', () => {
  for (const phase of data.fases) {
    const questions = selectQuestions(phase,data.perguntas,freshProfile(),random());
    assert.equal(new Set(questions.map(q => q.id)).size,phase.quantidade);
    for (const d of ['facil','medio','dificil']) assert.equal(questions.filter(q => q.dificuldade === d).length,phase.quotas[d]);
    for (const q of questions) { assert.ok(q.temas.some(t => phase.temas.includes(t))); assert.ok(q.alternativas.some(a => a.id === q.corretaId)); }
    assert.ok(questions.some(q => q.alternativas[0].id !== q.corretaId));
  }
});
test('três tentativas de uma fase comum não repetem questões sem histórico anterior', () => {
  const p = freshProfile(), seen = new Set(), rng = random();
  for (let i = 0; i < 3; i++) {
    const selected = selectQuestions(data.fases[0],data.perguntas,p,rng);
    for (const q of selected) { assert.ok(!seen.has(q.id)); seen.add(q.id); p.questionHistory[q.id] = {shownCount:1,lastOutcome:'correct',lastShownAt:String(i)}; }
    (p.recentByPhase['camp60-01'] ||= []).push(selected.map(q => q.id));
  }
  assert.equal(seen.size,30);
});
test('inéditas e erros antigos alternam; a janela recente prevalece', () => {
  const p = freshProfile(); const pool = data.perguntas.filter(q => q.temas.includes('fundamentos'));
  p.questionHistory[pool[0].id] = {shownCount:1,lastOutcome:'wrong',lastShownAt:'1'};
  p.questionHistory[pool[1].id] = {shownCount:1,lastOutcome:'wrong',lastShownAt:'2'};
  p.recentByPhase['camp60-01'] = [[pool[1].id]];
  const selected = selectQuestions(data.fases[0],pool,p,random());
  assert.ok(selected.some(q => q.id === pool[0].id)); assert.ok(!selected.some(q => q.id === pool[1].id));
});
test('sem não recentes suficientes, retorna as exposições mais antigas', () => {
  const p = freshProfile(); const pool = data.perguntas.filter(q => q.temas.includes('fundamentos'));
  p.recentByPhase['camp60-01'] = [pool.map(q => q.id)];
  pool.forEach((q,i) => p.questionHistory[q.id] = {shownCount:1,lastOutcome:'correct',lastShownAt:String(i).padStart(2,'0')});
  const selected = selectQuestions(data.fases[0],pool,p,random());
  assert.deepEqual(selected.filter(q => q.dificuldade === 'facil').map(q => q.id).sort(),pool.slice(0,5).map(q => q.id).sort());
});
test('quota insuficiente bloqueia a partida', () => assert.throws(() => selectQuestions(data.fases[0],data.perguntas.filter(q => q.dificuldade !== 'dificil'),freshProfile()),/insuficiente/));
