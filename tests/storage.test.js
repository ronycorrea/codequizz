import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emptySave, saveState, loadSave, parseImport, validateSave, SAVE_KEY } from '../js/storage.js';
import { startSession, showCurrent, answerQuestion, useHint } from '../js/quiz.js';
import { data, freshProfile, memoryStorage, random } from './helpers.js';
function fixture() { const p = freshProfile(); const save = emptySave(data.config.version); save.profiles.push(p); save.activeProfileId = p.id; return {p,save}; }

test('preferências de áudio aceitam saves antigos e recusam volumes inválidos', () => {
  const {p,save} = fixture();
  delete p.settings.music; delete p.settings.volume; p.settings.sound = false;
  assert.equal(parseImport(JSON.stringify(save),data).profiles[0].settings.sound,false);
  p.settings.music = true; p.settings.volume = 65;
  assert.equal(parseImport(JSON.stringify(save),data).profiles[0].settings.volume,65);
  for (const value of [-1,101,1.5,'65']) { p.settings.volume = value; assert.throws(()=>parseImport(JSON.stringify(save),data),/áudio/); }
  p.settings.volume = 65; p.settings.music = 'true'; assert.throws(()=>validateSave(save,data),/áudio/);
});
test('feedback, IDs, ordem e recompensas sobrevivem à retomada sem novo pagamento', () => {
  const {p,save} = fixture(); const store = memoryStorage(); startSession(p,data.fases[0],data.perguntas,data.config,random()); showCurrent(p); useHint(p,data.config); answerQuestion(p,p.activeSession.questionSnapshots[0].corretaId,data.config); saveState(store,save);
  const restored = loadSave(store,data); assert.deepEqual(restored.profiles[0],p); assert.equal(answerQuestion(restored.profiles[0],p.activeSession.questionSnapshots[0].corretaId,data.config),false);
  assert.equal(restored.profiles[0].xp,p.xp);
});
test('snapshot preserva pergunta após atualização do banco', () => {
  const {p,save} = fixture(); startSession(p,data.fases[0],data.perguntas,data.config); showCurrent(p); const text = p.activeSession.questionSnapshots[0].enunciado;
  const changed = structuredClone(data); changed.perguntas.forEach(q => q.enunciado = 'Novo conteúdo'); validateSave(save,changed); assert.equal(p.activeSession.questionSnapshots[0].enunciado,text);
});
test('importação rejeita versão futura, saldo negativo e estado incoerente', () => {
  const {p,save} = fixture(); const future = {...save,schemaVersion:2}; assert.throws(() => parseImport(JSON.stringify(future),data));
  assert.throws(() => parseImport(JSON.stringify({...save,contentVersion:'2.0.0'}),data),/futura/);
  p.coins = -1; assert.throws(() => parseImport(JSON.stringify(save),data)); p.coins = 100;
  startSession(p,data.fases[0],data.perguntas,data.config); p.activeSession.currentIndex = 2; assert.throws(() => validateSave(save,data));
});
test('revision detecta alteração de outra aba antes de gravar', () => {
  const {save} = fixture(); const store = memoryStorage(); saveState(store,save); const stale = structuredClone(save); saveState(store,save);
  const disk = store.getItem(SAVE_KEY); assert.throws(() => saveState(store,stale),/Outra aba/); assert.equal(store.getItem(SAVE_KEY),disk);
});
test('falha de quota preserva revisão em memória para exportação', () => {
  const {save} = fixture(); const store = {getItem:() => null,setItem:() => {throw new Error('QuotaExceededError');}};
  assert.throws(() => saveState(store,save),/Quota/); assert.equal(save.revision,0);
});
test('perfis isolam moedas, XP e histórico', () => {
  const {p,save} = fixture(); const other = freshProfile(); save.profiles.push(other); startSession(p,data.fases[0],data.perguntas,data.config); answerQuestion(p,p.activeSession.questionSnapshots[0].corretaId,data.config);
  assert.equal(other.xp,0); assert.equal(other.coins,100); assert.equal(other.activeSession,null); assert.deepEqual(other.questionHistory,{}); validateSave(save,data);
});
test('importação válida restaura todos os perfis e valida tamanho máximo', () => {
  const {save} = fixture(); assert.deepEqual(parseImport(JSON.stringify(save),data),save); assert.throws(() => parseImport(' '.repeat(2097153),data),/2 MB/);
});
test('snapshot de regras mantém recompensas mesmo se a configuração for atualizada', () => {
  const {p,save} = fixture(); startSession(p,data.fases[0],data.perguntas,data.config); const changed = structuredClone(data); changed.config.pontos.facil = 999;
  const q = p.activeSession.questionSnapshots[0]; answerQuestion(p,q.corretaId,changed.config); assert.equal(p.activeSession.answers[0].points,data.config.pontos[q.dificuldade]); validateSave(save,changed);
});
test('importação rejeita pagamento adulterado e IDs de protótipo', () => {
  const {p,save} = fixture(); startSession(p,data.fases[0],data.perguntas,data.config); answerQuestion(p,p.activeSession.questionSnapshots[0].corretaId,data.config);
  const bad = structuredClone(save); bad.profiles[0].activeSession.answers[0].xp = 999; assert.throws(() => validateSave(bad,data),/Pagamento/);
  const proto = structuredClone(save); proto.profiles[0].activeSession.questionSnapshots[0].id = '__proto__'; assert.throws(() => validateSave(proto,data),/IDs/);
});
