import { test } from 'node:test';
import assert from 'node:assert/strict';
import { currentWorld, worldBackground, environments } from '../js/world-background.js';
import { gameShell } from '../js/game-screens.js';
import { data, freshProfile } from './helpers.js';

test('cada mundo tem cenário próprio; a fase determina o fundo mesmo com uma seleção anterior diferente', () => {
  const extended = {...data,fases:data.mundos.map(w=>({id:w.id+'-theme-test',mundoId:w.id}))};
  const p = freshProfile(), markup = new Set();
  for (const w of data.mundos) {
    p.activeSession = {phaseId:w.id+'-theme-test'};
    const context = {data:extended,profile:p,route:'quiz',selectedWorld:'fort57'};
    assert.equal(currentWorld(context).id,w.id);
    const html = worldBackground(currentWorld(context));
    assert.match(html,new RegExp('environment-'+w.id)); markup.add(html);
    assert.ok(environments[w.id].description);
    assert.match(gameShell('<h1>Teste</h1>',context),new RegExp('data-world="'+w.id+'"'));
  }
  assert.equal(markup.size,5);
});

test('somente telas de um mundo usam seu cenário; menu e telas gerais usam a composição', () => {
  const p = freshProfile();
  const context = {data,profile:p,selectedWorld:'dimensao',selectedPhase:'camp60-01',result:{phaseId:'camp60-01'}};
  assert.equal(currentWorld({...context,route:'prepare'}).id,'camp60');
  assert.equal(currentWorld({...context,route:'result'}).id,'camp60');
  assert.equal(currentWorld({...context,route:'world-preview'}).id,'dimensao');
  assert.equal(currentWorld({...context,route:'worlds'}),null);
  assert.equal(currentWorld({...context,route:'profiles'}),null);
  p.sessions.push({phaseId:'camp60-01'});
  assert.equal(currentWorld({data,profile:p,route:'map'}).id,'camp60');
  for (const route of ['home','profiles','worlds','central','help','settings','profile','ranking','objectives','trophies']) {
    assert.equal(currentWorld({...context,route}),null);
    assert.match(gameShell('<h1>Teste</h1>',{...context,route}),/data-world="hub"/);
  }
  assert.equal(currentWorld({data,profile:null,route:'central'}),null);
});

test('o fundo geral reúne os cinco cenários sem incluir um mundo único como tema', () => {
  const html = worldBackground(null);
  assert.match(html,/class="hub-worlds"/);
  for (const w of data.mundos) assert.match(html,new RegExp('class="hub-region hub-'+w.id+'"'));
  assert.equal((html.match(/class="hub-region /g)||[]).length,5);
});
