import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createBackend} from '../js/backend.js';
import {createGameScreens,gameShell} from '../js/game-screens.js';
import {data,createProfile} from './helpers.js';
test('cliente só envia identidade da questão e alternativa; recompensas vêm da RPC',async()=>{
  const calls=[],server={profile:{xp:50,coins:110}};
  const api=createBackend({rpc:async(name,args)=>{calls.push({name,args});return {data:server,error:null};}});
  const s={sessionId:'partida',currentIndex:2,questionSnapshots:[null,null,{id:'pergunta'}],totals:{points:999999}};
  assert.equal(await api.answer(s,'alternativa'),server);
  assert.deepEqual(calls[0],{name:'responder_pergunta',args:{p_partida_id:'partida',p_indice:2,p_pergunta_id:'pergunta',p_alternativa_id:'alternativa',p_pular:false}});
  await api.answer(s,null,true);assert.equal(calls[1].args.p_pular,true);assert.equal(calls[1].args.p_alternativa_id,null);
  await api.start('camp60-01','request');assert.equal(calls[2].args.p_requisicao_id,'request');
});
test('falha da RPC não ativa pontuação local; preparação ausente produz mensagem para o jogador',async()=>{
  const api=createBackend({rpc:async()=>({data:null,error:{code:'PGRST202',message:'SQL técnico'}})});
  await assert.rejects(api.profile(),/jogo ainda está sendo preparado/);
});
test('telas de contas usam e-mail e senha; ranking recebe apenas dados públicos do servidor',()=>{
  const p=createProfile('Explorador','explorer',data.config);
  const ctx={data,profile:p,route:'profiles',rankingData:{players:[{position:1,apelido:'<script>',avatarId:'android',score:600,stars:3,you:true}],mine:{position:1}}};
  const screens=createGameScreens(ctx);
  assert.match(screens.profiles(),/login-form/);assert.match(screens.profiles(),/type="email"/);assert.match(screens.profiles(),/current-password/);
  assert.match(screens.signup(),/signup-form/);assert.match(screens.reset(),/reset-form/);assert.match(screens.password(),/password-form/);
  assert.match(screens.ranking(),/Ranking da campanha/);assert.ok(!screens.ranking().includes('<script>'));assert.match(screens.ranking(),/&lt;script&gt;/);
  assert.ok(!screens.settings().includes('IMPORTAR'));assert.ok(!screens.settings().includes('EXCLUIR ESTE PERFIL'));
  const shell=gameShell(screens.profiles(),ctx);assert.match(shell,/data-world="hub"/);assert.match(shell,/data-action="logout"/);assert.ok(!shell.includes('PROGRESSO LOCAL'));
});
