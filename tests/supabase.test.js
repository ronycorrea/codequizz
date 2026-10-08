// PostgreSQL real via WASM; auth.uid() e os papéis da API são simulados localmente.
// PGlite possui uma conexão. Concorrência entre conexões exige Supabase/PostgreSQL externo.
import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
let db;
before(async()=>{
  db=new PGlite();
  await db.exec(`create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key,raw_user_meta_data jsonb default '{}');create function auth.uid() returns uuid language sql as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;grant usage on schema auth to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;`);
  await db.exec(await readFile('privado/supabase/migrations/202610050001_codequizz.sql','utf8'));
  await db.exec(await readFile('privado/supabase/seed.sql','utf8'));
});
after(async()=>{await db?.close();});
async function asUser(id,role='authenticated'){
  await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id||'']);await db.exec(`set role ${role}`);
}
async function player(nick='QA'){
  await db.exec('reset role');const id=crypto.randomUUID();
  await db.query('insert into auth.users(id,raw_user_meta_data) values($1,$2)',[id,JSON.stringify({apelido:nick,avatarId:'android',coins:999999})]);await asUser(id);return id;
}
async function rpc(name,args=[]){return (await db.query(`select public.${name}(${args.map((_,i)=>'$'+(i+1)).join(',')}) as result`,args)).rows[0].result;}
const start=(phase='camp60-01',request=crypto.randomUUID())=>rpc('iniciar_partida',[phase,request]);
const session=response=>response.profile.activeSession;
async function secret(s){
  await db.exec('reset role');const q=(await db.query('select estado->\'questionSnapshots\'->$2::int as q from codequizz_private.partidas where id=$1',[s.sessionId,s.currentIndex])).rows[0].q;
  const owner=(await db.query('select jogador_id from codequizz_private.partidas where id=$1',[s.sessionId])).rows[0].jogador_id;await asUser(owner);return q;
}
async function answer(s,alt,skip=false){return rpc('responder_pergunta',[s.sessionId,s.currentIndex,s.questionSnapshots[s.currentIndex].id,alt,skip]);}
async function finishAll(s,options={}){
  while(true){
    const q=await secret(s);
    const a=await answer(s,options.wrong?q.alternativas.find(a=>a.id!==q.corretaId).id:q.corretaId);s=session(a);
    if(s.currentIndex+1===s.questionIds.length) return rpc('finalizar_partida',[s.sessionId,false]);
    s=session(await rpc('avancar_pergunta',[s.sessionId,s.currentIndex]));
  }
}

test('SQL: RLS, grants e funções bloqueiam gabaritos, outras contas e escrita de pontuação',async()=>{
  const id=await player('Jogador A');const other=await player('Jogador B');await asUser(id);
  assert.deepEqual((await db.query('select id from public.perfis')).rows.map(x=>x.id),[id]);
  assert.equal((await db.query('select * from public.perfis where id=$1',[other])).rows.length,0);
  for(const table of ['gabaritos','perguntas','partidas','respostas','historico','conteudo']) await assert.rejects(db.query(`select * from codequizz_private.${table}`),/permission denied/);
  await assert.rejects(db.query('update public.perfis set xp=999999,coins=999999'),/permission denied/);
  await assert.rejects(db.query("insert into public.progresso values($1,'camp60-01','{}')",[id]),/permission denied/);
  await assert.rejects(db.query('select codequizz_private.perfil_publico($1)',[other]),/permission denied/);
  assert.equal((await rpc('obter_perfil')).coins,100);
  await asUser(null);await assert.rejects(rpc('obter_perfil'),/Entre na sua conta/);
  await asUser(null,'anon');
  for(const [name,args] of [['obter_perfil',[]],['iniciar_partida',['camp60-01',crypto.randomUUID()]],['usar_dica',[id,0]],['responder_pergunta',[id,0,'q','a',false]],['avancar_pergunta',[id,0]],['finalizar_partida',[id,false]],['resgatar_objetivo',['primeiro_passo']],['atualizar_perfil',['QA','android',{}]],['consultar_ranking',[100]]])await assert.rejects(rpc(name,args),/permission denied/);
  await db.exec('reset role');
  const functions=(await db.query("select p.proname,p.prosecdef,p.proconfig,has_function_privilege('authenticated',p.oid,'execute') allowed from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname in ('codequizz_private','public') and p.proname not like 'pg_%'")).rows;
  assert.ok(functions.filter(f=>f.prosecdef).every(f=>f.proconfig?.some(c=>c.startsWith('search_path=')&&c.replaceAll('"','')==='search_path=')));
  assert.ok(functions.filter(f=>!['obter_perfil','iniciar_partida','usar_dica','responder_pergunta','avancar_pergunta','finalizar_partida','resgatar_objetivo','atualizar_perfil','consultar_ranking'].includes(f.proname)).every(f=>!f.allowed));
});

test('SQL: reset administrativo exclui contas/progresso, preserva catálogo e bloqueia tokens antigos',async()=>{
  const old=await player('Reset QA');let s=session(await start());const q=await secret(s);await answer(s,q.corretaId);
  await db.exec('reset role');
  const unrelated=crypto.randomUUID();await db.query('insert into auth.users(id) values($1)',[unrelated]);
  // Simula conta de outro uso sem perfil CodeQuizz; o reset não a inclui.
  await db.query('delete from public.perfis where id=$1',[unrelated]);
  await asUser(old);
  await assert.rejects(db.exec(await readFile('privado/supabase/preparar-primeiro-teste.sql','utf8')),/permission denied/);await db.exec('rollback');
  await db.exec('reset role');
  await db.exec(await readFile('privado/supabase/preparar-primeiro-teste.sql','utf8'));
  for(const table of ['public.perfis','public.progresso','codequizz_private.partidas','codequizz_private.respostas','codequizz_private.historico','codequizz_private.recentes','codequizz_private.conquistas'])assert.equal((await db.query(`select count(*)::int n from ${table}`)).rows[0].n,0);
  assert.equal((await db.query('select count(*)::int n from codequizz_private.perguntas')).rows[0].n,210);
  assert.equal((await db.query('select count(*)::int n from codequizz_private.gabaritos')).rows[0].n,210);
  assert.deepEqual((await db.query('select id from auth.users')).rows.map(r=>r.id),[unrelated]);
  await asUser(old);for(const name of ['obter_perfil','consultar_ranking'])await assert.rejects(rpc(name),/Perfil não encontrado/);
  await player('Novo teste');const fresh=await rpc('obter_perfil');
  assert.equal(fresh.xp,0);assert.equal(fresh.coins,100);assert.equal(fresh.totalPoints,0);assert.deepEqual(fresh.phaseProgress,{});assert.equal(fresh.activeSession,null);
});

test('SQL: sorteio privado entrega uma questão sem gabarito, exige fase desbloqueada e é idempotente',async()=>{
  await player();await assert.rejects(start('camp60-02'),/fase anterior/);
  const request=crypto.randomUUID(),r=await start('camp60-01',request),s=session(r);
  assert.deepEqual(await start('camp60-01',request),r);
  await assert.rejects(start(),/partida em andamento/);
  assert.equal(s.questionSnapshots.filter(Boolean).length,1);
  assert.equal(s.questionIds.length,10);assert.equal(new Set(s.questionIds).size,10);
  const q=s.questionSnapshots[0];for(const key of ['corretaId','explicacao','dica'])assert.ok(!Object.hasOwn(q,key));
  assert.ok(q.alternativas.every(a=>/^[a-f0-9-]{36}$/.test(a.id)));
  await db.exec('reset role');const full=(await db.query('select estado from codequizz_private.partidas where id=$1',[s.sessionId])).rows[0].estado;
  assert.deepEqual(full.questionSnapshots.reduce((counts,q)=>(counts[q.dificuldade]++,counts),{facil:0,medio:0,dificil:0}),{facil:5,medio:3,dificil:2});
  const catalog=(await db.query('select documento from codequizz_private.perguntas limit 1')).rows[0].documento;assert.ok(!('corretaId' in catalog));
});

test('SQL: dono, índice, alternativa e duplicação são validados; dica e avanço cobram uma vez',async()=>{
  const owner=await player(),s=session(await start()),q=await secret(s),intruder=await player('Outro');
  await assert.rejects(answer(s,q.corretaId),/Partida não encontrada/);await asUser(owner);
  await assert.rejects(rpc('finalizar_partida',[s.sessionId,false]),/todas as questões/);
  await assert.rejects(rpc('avancar_pergunta',[s.sessionId,0]),/Responda antes/);
  await assert.rejects(rpc('responder_pergunta',[s.sessionId,1,s.questionIds[1],'a',false]),/não está disponível/);
  await assert.rejects(answer(s,'a'),/Alternativa inválida/);
  let r=await rpc('usar_dica',[s.sessionId,0]);assert.equal(r.profile.coins,80);assert.ok(session(r).questionSnapshots[0].dica);assert.ok(!session(r).questionSnapshots[0].corretaId);
  assert.deepEqual(await rpc('usar_dica',[s.sessionId,0]),r);
  r=await answer(s,q.corretaId);assert.equal(r.profile.totalPoints,Math.floor(({facil:100,medio:150,dificil:200}[q.dificuldade])*.7));
  assert.equal(session(r).questionSnapshots[0].corretaId,q.corretaId);assert.ok(session(r).questionSnapshots[0].explicacao);
  assert.deepEqual(await answer(s,q.corretaId),r);
  await assert.rejects(answer(s,q.alternativas.find(a=>a.id!==q.corretaId).id),/outra alternativa/);
  r=await rpc('avancar_pergunta',[s.sessionId,0]);assert.equal(session(r).currentIndex,1);assert.equal(session(r).questionSnapshots[0],null);
  assert.deepEqual(await rpc('avancar_pergunta',[s.sessionId,0]),r);
  await asUser(intruder);await assert.rejects(rpc('finalizar_partida',[s.sessionId,true]),/Partida não encontrada/);
});

test('SQL: pulo só uma vez, saldo insuficiente, snapshot e abandono preservam as regras',async()=>{
  const id=await player();let s=session(await start()),r=await answer(s,null,true);assert.equal(r.profile.coins,70);assert.equal(r.profile.totalPoints,0);assert.equal(r.profile.stats.skipped,1);
  assert.deepEqual(await answer(s,null,true),r);s=session(await rpc('avancar_pergunta',[s.sessionId,0]));await assert.rejects(answer(s,null,true),/Pulo já utilizado/);
  await db.exec('reset role');await db.query('update public.perfis set coins=0 where id=$1',[id]);await asUser(id);
  await assert.rejects(rpc('usar_dica',[s.sessionId,1]),/Moedas insuficientes/);
  const q=await secret(s);r=await answer(s,q.corretaId);const xp=r.profile.xp;
  r=await rpc('finalizar_partida',[s.sessionId,true]);assert.equal(r.profile.xp,xp);assert.equal(r.result.approved,false);assert.deepEqual(r.profile.phaseProgress,{});
  assert.deepEqual(await rpc('finalizar_partida',[s.sessionId,true]),r);
});

test('SQL: campanha completa, bônus, conquistas, recordes e ranking são determinados pelo banco',async()=>{
  await player('Campanha QA');let r;
  for(let i=1;i<=8;i++){
    const phase='camp60-'+String(i).padStart(2,'0');r=await finishAll(session(await start(phase)));
    assert.equal(r.result.approved,true);assert.equal(r.result.stars,3);assert.equal(r.result.bonus,true);
    assert.deepEqual(await rpc('finalizar_partida',[r.result.sessionId,false]),r);
  }
  assert.equal(r.profile.stats.completed,8);assert.equal(r.profile.stats.correct,85);
  assert.equal(Object.keys(r.profile.phaseProgress).length,8);assert.ok(r.profile.achievements.dedicado);
  const first=r.profile.phaseProgress['camp60-01'];r=await finishAll(session(await start()),{wrong:true});
  assert.equal(r.result.approved,false);assert.equal(r.result.bonus,false);assert.equal(r.profile.phaseProgress['camp60-01'].bestScore,first.bestScore);assert.equal(r.profile.phaseProgress['camp60-01'].bestStars,3);
  r=await rpc('resgatar_objetivo',['primeiro_passo']);assert.ok(r.profile.achievements.primeiro_passo.claimedAt);assert.deepEqual(await rpc('resgatar_objetivo',['primeiro_passo']),r);
  await assert.rejects(rpc('resgatar_objetivo',['mestre']),/ainda não alcançado/);
  const ranks=await rpc('consultar_ranking',[100]);assert.equal(ranks.mine.score,Object.values(r.profile.phaseProgress).reduce((n,p)=>n+p.bestScore,0));
  assert.ok(ranks.players.every(x=>Object.keys(x).sort().join(',')==='apelido,avatarId,position,score,stars,you'));
  await assert.rejects(rpc('consultar_ranking',[101]),/Limite inválido/);
  await assert.rejects(rpc('atualizar_perfil',['OK','android',{sound:true,music:true,motion:true,volume:999}]),/Preferências inválidas/);
  r=await rpc('atualizar_perfil',['Alterado','explorer',{sound:false,music:false,motion:false,volume:35,coins:9999}]);assert.equal(r.profile.settings.volume,35);assert.equal(r.profile.settings.coins,undefined);
});

test('SQL: três tentativas respeitam janela recente e conteúdo insuficiente bloqueia sem partida parcial',async()=>{
  const id=await player();const ids=[];
  for(let i=0;i<3;i++){const s=session(await start());ids.push(...s.questionIds);await finishAll(s);}
  assert.equal(new Set(ids).size,30);
  await db.exec('reset role');await db.exec(`update codequizz_private.perguntas set documento=jsonb_set(documento,'{ativa}','false') where documento->'temas' ? 'fundamentos' and documento->>'dificuldade'='dificil'`);await asUser(id);
  await assert.rejects(start(),/Conteúdo insuficiente/);assert.equal((await rpc('obter_perfil')).activeSession,null);
  await db.exec('reset role');await db.exec(`update codequizz_private.perguntas set documento=jsonb_set(documento,'{ativa}','true') where documento->'temas' ? 'fundamentos'`);
});

test('SQL: atualização do catálogo e das regras não altera uma partida já sorteada',async()=>{
  const id=await player(),s=session(await start()),q=await secret(s);
  await db.exec('reset role');
  try{
    await db.query("update codequizz_private.gabaritos set correta_id='b',explicacao='Nova explicação' where pergunta_id=$1",[q.id]);
    await db.query("update codequizz_private.perguntas set documento=jsonb_set(documento,'{enunciado}','\"Enunciado atualizado\"') where id=$1",[q.id]);
    await db.exec("update codequizz_private.conteudo set valor=jsonb_set(valor,'{pontos,facil}','999999') where nome='config'");
    await asUser(id);const r=await answer(s,q.corretaId);
    assert.equal(session(r).answers[0].outcome,'correct');assert.equal(session(r).answers[0].points,{facil:100,medio:150,dificil:200}[q.dificuldade]);
    assert.equal(session(r).questionSnapshots[0].enunciado,q.enunciado);assert.equal(session(r).questionSnapshots[0].explicacao,q.explicacao);
  }finally{await db.exec('reset role');await db.exec(await readFile('privado/supabase/seed.sql','utf8'));}
});
