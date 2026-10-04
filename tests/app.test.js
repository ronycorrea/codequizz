// Integração dos eventos e telas com uma superfície DOM mínima.
// Não substitui testes visuais, de layout ou de teclado em navegador real.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { data, memoryStorage } from './helpers.js';
import { SAVE_KEY, validateSave } from '../js/storage.js';
import { toast } from '../js/ui.js';
const tick = () => new Promise(resolve => setImmediate(resolve));
async function harness(raw) {
  const listeners = new Map(), storage = memoryStorage();
  if (raw) storage.setItem(SAVE_KEY,raw);
  const nodes = { app: {innerHTML:''}, modal: {innerHTML:'',open:false,close(){this.open=false;},showModal(){this.open=true;}}, notice:{hidden:true,textContent:''}, heading:{focus(){}}, confirm:{disabled:true}, selected:{value:'a'} };
  const originals = Object.fromEntries(['document','window','fetch','FormData'].map(k => [k,globalThis[k]]));
  globalThis.document = { documentElement:{dataset:{}}, querySelector(s) {
    if (s === '#feedback-dialog') {
      nodes.feedback = nodes.app.innerHTML.includes('id="feedback-dialog"') ? { open:false, events:new Map(), showModal(){this.open=true;}, addEventListener(name,fn){this.events.set(name,fn);}, querySelector(){return nodes.heading;} } : null;
      return nodes.feedback;
    }
    return {'#app':nodes.app,'#modal':nodes.modal,'#notice':nodes.notice,'main h1':nodes.heading,'#confirm-answer':nodes.confirm,'input[name=answer]:checked':nodes.selected}[s];
  }, addEventListener(name,fn){listeners.set(name,fn);}, createElement(){return {click(){},addEventListener(){}};} };
  globalThis.window = {localStorage:storage,scrollTo(){},addEventListener(name,fn){listeners.set(name,fn);}};
  globalThis.fetch = async url => ({ok:true,json:async () => structuredClone(data[url.split('/').at(-1).split('.')[0]])});
  globalThis.FormData = class { constructor(form){this.fields=form.fields;} get(key){return this.fields[key];} };
  await import('../js/app.js?test='+crypto.randomUUID()); await tick(); await tick();
  return { nodes, storage, async click(action,id){listeners.get('click')({target:{closest:() => ({disabled:false,dataset:{action,id}})}}); await tick();}, async submit(id,fields){listeners.get('submit')({preventDefault(){},target:{id,fields}});await tick();}, async change(target){listeners.get('change')({target});await tick();}, storageEvent(){listeners.get('storage')({key:SAVE_KEY});}, async reload(){await import('../js/app.js?test='+crypto.randomUUID());await tick();await tick();}, cleanup(){clearTimeout(toast.timer); for(const [k,v] of Object.entries(originals)) globalThis[k]=v;} };
}
test('fluxo completo: perfil, oito fases, portal, estatísticas, resgates e retomada', async () => {
  const h = await harness();
  try {
    assert.match(h.nodes.app.innerHTML,/Entre no jogo/); await h.click('profiles'); assert.match(h.nodes.app.innerHTML,/Escolha seu explorador/);
    await h.submit('profile-form',{nickname:'Explorador QA',avatar:'android'}); assert.match(h.nodes.app.innerHTML,/Olá, Explorador QA/);
    for (const phase of data.fases) {
      await h.click('prepare',phase.id); assert.match(h.nodes.app.innerHTML,/Pronto para o desafio/); await h.click('start');
      for (let i=0;i<phase.quantidade;i++) {
        const saved = JSON.parse(h.storage.getItem(SAVE_KEY)); const active = saved.profiles[0].activeSession; assert.equal(active.currentIndex,i);
        const q = active.questionSnapshots[i]; h.nodes.selected.value = q.corretaId; await h.change({name:'answer'}); assert.equal(h.nodes.confirm.disabled,false);
        await h.click('answer'); assert.match(h.nodes.app.innerHTML,/Boa! Você acertou/);
        if (i===0 && phase.ordem===1) { const before = h.storage.getItem(SAVE_KEY); await h.click('answer'); assert.equal(h.storage.getItem(SAVE_KEY),before); await h.reload(); assert.match(h.nodes.app.innerHTML,/SUA PARTIDA ESTÁ SALVA/); await h.click('continue'); assert.match(h.nodes.app.innerHTML,/Boa! Você acertou/); }
        await h.click('next');
      }
      assert.match(h.nodes.app.innerHTML,/conquistado|restaurado/); validateSave(JSON.parse(h.storage.getItem(SAVE_KEY)),data);
    }
    await h.click('map'); assert.match(h.nodes.app.innerHTML,/Portal habilitado/);
    for (const screen of ['worlds','objectives','trophies','profile','ranking','settings','help']) { await h.click(screen); assert.ok(h.nodes.app.innerHTML.includes('<h1')); assert.ok(!h.nodes.app.innerHTML.includes('undefined')); }
    await h.click('objectives'); await h.click('claim','primeiro_passo'); const before = h.storage.getItem(SAVE_KEY); await h.click('claim','primeiro_passo'); assert.equal(h.storage.getItem(SAVE_KEY),before);
    const p = JSON.parse(h.storage.getItem(SAVE_KEY)).profiles[0]; assert.equal(p.stats.completed,8); assert.equal(Object.keys(p.phaseProgress).length,8); assert.equal(p.stats.correct,85);
  } finally { h.cleanup(); }
});
test('menu preserva a partida e feedback abre até o jogador avançar', async () => {
  const h = await harness();
  try {
    await h.submit('profile-form',{nickname:'Jogador',avatar:'explorer'});
    await h.click('prepare',data.fases[0].id); await h.click('start');
    const before = h.storage.getItem(SAVE_KEY);
    await h.click('menu'); assert.equal(h.nodes.modal.open,true);
    await h.click('close-modal'); assert.equal(h.nodes.modal.open,false);
    assert.equal(h.storage.getItem(SAVE_KEY),before);
    h.nodes.selected.value = JSON.parse(before).profiles[0].activeSession.questionSnapshots[0].corretaId;
    await h.click('answer'); assert.equal(h.nodes.feedback.open,true);
    let prevented = false;
    h.nodes.feedback.events.get('cancel')({preventDefault(){prevented=true;}});
    assert.equal(prevented,true);
    assert.equal(JSON.parse(h.storage.getItem(SAVE_KEY)).profiles[0].activeSession.currentIndex,0);
    await h.click('next'); assert.equal(h.nodes.feedback,null);
    assert.equal(JSON.parse(h.storage.getItem(SAVE_KEY)).profiles[0].activeSession.currentIndex,1);
  } finally {h.cleanup();}
});

test('preferências de áudio persistem no perfil e o botão de som funciona antes do cadastro', async () => {
  const h = await harness();
  try {
    await h.click('sound');
    assert.match(h.nodes.app.innerHTML,/aria-label="Ativar som"/);
    await h.submit('profile-form',{nickname:'Som QA',avatar:'android'});
    assert.equal(JSON.parse(h.storage.getItem(SAVE_KEY)).profiles[0].settings.sound,false);
    await h.click('sound'); await h.click('settings');
    assert.match(h.nodes.app.innerHTML,/Música de aventura/);
    await h.change({id:'music-setting',checked:false});
    await h.change({id:'volume-setting',value:'35'});
    const saved = JSON.parse(h.storage.getItem(SAVE_KEY));
    assert.equal(saved.profiles[0].settings.sound,true);
    assert.equal(saved.profiles[0].settings.music,false);
    assert.equal(saved.profiles[0].settings.volume,35); validateSave(saved,data);
    await h.reload(); await h.click('settings');
    assert.match(h.nodes.app.innerHTML,/Volume do jogo/); assert.match(h.nodes.app.innerHTML,/35%/);
  } finally {h.cleanup();}
});

test('troca de cenário, prévias futuras e retomada preservam as regras e o save', async () => {
  const h = await harness();
  try {
    await h.submit('profile-form',{nickname:'Cenários QA',avatar:'explorer'});
    await h.click('worlds'); assert.match(h.nodes.app.innerHTML,/data-world="hub"/);
    const before = h.storage.getItem(SAVE_KEY);
    for (const w of data.mundos.filter(w=>!w.publicado)) {
      await h.click('future',w.id);
      assert.match(h.nodes.app.innerHTML,new RegExp('data-world="'+w.id+'"'));
      assert.match(h.nodes.app.innerHTML,/As fases ainda não estão disponíveis/);
      assert.equal(h.storage.getItem(SAVE_KEY),before);
      await h.click('worlds'); assert.match(h.nodes.app.innerHTML,/data-world="hub"/);
    }
    await h.click('map','camp60'); assert.match(h.nodes.app.innerHTML,/data-world="camp60"/);
    await h.click('prepare','camp60-01'); await h.click('start');
    const sessionId = JSON.parse(h.storage.getItem(SAVE_KEY)).profiles[0].activeSession.sessionId;
    await h.click('central'); await h.click('worlds'); await h.click('future','lab22');
    assert.match(h.nodes.app.innerHTML,/data-world="lab22"/);
    await h.click('continue'); assert.match(h.nodes.app.innerHTML,/data-world="camp60"/);
    assert.equal(JSON.parse(h.storage.getItem(SAVE_KEY)).profiles[0].activeSession.sessionId,sessionId);
    await h.reload(); assert.match(h.nodes.app.innerHTML,/data-world="hub"/); await h.click('continue'); assert.match(h.nodes.app.innerHTML,/data-world="camp60"/);
  } finally {h.cleanup();}
});

test('sair volta à entrada, persiste a saída e conserva a partida antes da resposta e no feedback', async () => {
  const h = await harness();
  try {
    await h.submit('profile-form',{nickname:'Saída QA',avatar:'android'});
    assert.match(h.nodes.app.innerHTML,/class="hud-logout"/);
    await h.click('prepare','camp60-01'); await h.click('start');
    let before = JSON.parse(h.storage.getItem(SAVE_KEY)).profiles;
    const id = before[0].id;
    await h.click('logout');
    let saved = JSON.parse(h.storage.getItem(SAVE_KEY));
    assert.equal(saved.activeProfileId,null); assert.deepEqual(saved.profiles,before);
    assert.match(h.nodes.app.innerHTML,/Entre no jogo/);
    assert.doesNotMatch(h.nodes.app.innerHTML,/CONTINUAR COMO|class="hud-coins"|class="hud-logout"/);
    assert.match(h.nodes.app.innerHTML,/hub-worlds/); validateSave(saved,data);
    await h.reload(); assert.match(h.nodes.app.innerHTML,/Entre no jogo/);
    await h.click('profiles'); await h.click('select-profile',id); await h.click('continue');
    assert.match(h.nodes.app.innerHTML,/data-world="camp60"/);
    const q = JSON.parse(h.storage.getItem(SAVE_KEY)).profiles[0].activeSession.questionSnapshots[0];
    h.nodes.selected.value = q.corretaId; await h.change({name:'answer'}); await h.click('answer');
    assert.match(h.nodes.app.innerHTML,/feedback-exit/);
    before = JSON.parse(h.storage.getItem(SAVE_KEY)).profiles;
    await h.click('logout'); saved = JSON.parse(h.storage.getItem(SAVE_KEY));
    assert.equal(saved.activeProfileId,null); assert.deepEqual(saved.profiles,before);
    assert.equal(saved.profiles[0].activeSession.status,'feedback');
    await h.click('profiles'); await h.click('select-profile',id); await h.click('continue');
    assert.match(h.nodes.app.innerHTML,/Boa! Você acertou/);
    const score = h.storage.getItem(SAVE_KEY); await h.click('answer'); assert.equal(h.storage.getItem(SAVE_KEY),score);
  } finally {h.cleanup();}
});

test('sair após conflito entre abas conserva a versão mais recente dos perfis', async () => {
  const h = await harness();
  try {
    await h.submit('profile-form',{nickname:'Aba QA',avatar:'explorer'});
    const latest = JSON.parse(h.storage.getItem(SAVE_KEY));
    latest.revision++; latest.profiles[0].coins += 10;
    h.storage.setItem(SAVE_KEY,JSON.stringify(latest)); h.storageEvent();
    await h.click('logout');
    const saved = JSON.parse(h.storage.getItem(SAVE_KEY));
    assert.equal(saved.activeProfileId,null);
    assert.deepEqual(saved.profiles,latest.profiles); assert.equal(saved.revision,latest.revision+1);
    assert.match(h.nodes.app.innerHTML,/Entre no jogo/);
  } finally {h.cleanup();}
});

test('save inválido apresenta recuperação e o cancelamento não altera os dados', async () => {
  const h = await harness('{"corrompido":true}');
  try { assert.match(h.nodes.app.innerHTML,/Não foi possível recuperar/); await h.click('recover-save'); assert.equal(h.nodes.modal.open,true); await h.click('close-modal'); assert.equal(h.nodes.modal.open,false); assert.equal(h.storage.getItem(SAVE_KEY),'{"corrompido":true}'); }
  finally {h.cleanup();}
});
test('exclusão cancelada preserva perfil; confirmação preserva os outros', async () => {
  const h = await harness();
  try {
    await h.submit('profile-form',{nickname:'Primeiro',avatar:'explorer'}); await h.submit('profile-form',{nickname:'Segundo',avatar:'android'});
    await h.click('delete-profile'); await h.click('close-modal'); assert.equal(JSON.parse(h.storage.getItem(SAVE_KEY)).profiles.length,2);
    await h.click('delete-profile'); await h.click('confirm-delete'); const save = JSON.parse(h.storage.getItem(SAVE_KEY)); assert.equal(save.profiles.length,1); assert.equal(save.profiles[0].apelido,'Primeiro');
  } finally {h.cleanup();}
});
