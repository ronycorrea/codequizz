import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mountGame} from '../js/online-app.js';
import {createBackend} from '../js/backend.js';
import {createProfile,data} from './helpers.js';
import {toast} from '../js/ui.js';
const tick=()=>new Promise(r=>setTimeout(r,5));
async function harness(initial=false,authErrors={},signupData={session:null,user:{identities:[{provider:'email'}]}}){
  const originals=Object.fromEntries(['document','window','fetch','FormData','location','history'].map(k=>[k,globalThis[k]]));
  const listeners=new Map(),requests=[],p=createProfile('Jogador QA','android',data.config);
  let session=initial?{user:{id:p.id}}:null,callback,controller,stored=structuredClone(p);
  let checked=null,controls=[],html='';
  const heading={focus(){}},notice={hidden:true,textContent:''},feedback={hidden:true,textContent:'',dataset:{},setAttribute(){}},modal={innerHTML:'',close(){},showModal(){}},confirm={disabled:true};
  const root={set innerHTML(value){html=value;controls=[{disabled:false}];},get innerHTML(){return html;},setAttribute(){},querySelectorAll(){return controls;},contains(n){return controls.includes(n);}};
  globalThis.document={documentElement:{dataset:{}},querySelector(selector){
    if(selector==='#feedback-dialog')return html.includes('id="feedback-dialog"')?{showModal(){},addEventListener(){},querySelector(){return heading;}}:null;
    return {'#app':root,'#modal':modal,'#notice':notice,'#auth-feedback':feedback,'main h1':heading,'#confirm-answer':confirm,'input[name=answer]:checked':checked}[selector]||null;
  },addEventListener(name,fn){listeners.set(name,fn);},removeEventListener(name){listeners.delete(name);}};
  globalThis.window={addEventListener(){},scrollTo(){}};
  globalThis.location={href:'https://example.github.io/codequizz/'};globalThis.history={replaceState(){}};
  globalThis.fetch=async url=>{requests.push(url);return {ok:true,json:async()=>structuredClone(data[url.split('/').at(-1).split('.')[0]])};};
  globalThis.FormData=class {constructor(form){this.fields=form.fields;}get(key){return this.fields[key];}};
  function emit(event,s){session=s;callback(event,s);}
  const auth={
    onAuthStateChange(fn){callback=fn;return {data:{subscription:{unsubscribe(){}}}};},getSession:async()=>({data:{session},error:null}),
    signInWithPassword:async args=>{requests.push({auth:'login',...args});if(authErrors.login)return {error:authErrors.login};emit('SIGNED_IN',{user:{id:p.id}});return {data:{session},error:null};},
    signUp:async args=>{requests.push({auth:'signup',...args});return {data:signupData,error:authErrors.signup||null};},
    resend:async args=>{requests.push({auth:'resend',...args});return {data:{},error:authErrors.resend||null};},
    signOut:async()=>{emit('SIGNED_OUT',null);return {error:null};},
    resetPasswordForEmail:async(email,args)=>{requests.push({auth:'reset',email,...args});return {error:null};},
    updateUser:async args=>{requests.push({auth:'update',...args});return {error:null};}
  };
  const client={auth,rpc:async(name,args)=>{
    requests.push({name,args});if(name==='obter_perfil')return {data:structuredClone(stored),error:null};
    if(name==='iniciar_partida'){
      stored.activeSession={sessionId:'match',phaseId:'camp60-01',currentIndex:0,questionIds:['q1'],questionSnapshots:[{id:'q1',enunciado:'Qual é a instrução?',dificuldade:'facil',alternativas:[{id:'opaque1',texto:'Instrução'},{id:'opaque2',texto:'Ruído'}]}],answers:[],hints:[],usedPowers:[],streak:0,totals:{points:0,xp:0,coins:0},rules:data.config,status:'awaiting_answer'};
    }
    if(name==='responder_pergunta'){
      stored.xp=50;stored.coins=110;const s=stored.activeSession;s.status='feedback';s.questionSnapshots[0].corretaId='opaque1';s.questionSnapshots[0].explicacao='Instruções orientam o computador.';s.answers=[{alternativeId:args.p_alternativa_id,outcome:'correct',points:100,xp:50,coins:10}];
    }
    return {data:{profile:structuredClone(stored)},error:null};
  }};
  controller=await mountGame(createBackend(client));await tick();
  return {root,requests,notice,feedback,emit,getState:()=>controller.getState(),async click(action,id){listeners.get('click')({target:{closest:()=>({disabled:false,dataset:{action,id}})}});await tick();},async submit(id,fields){listeners.get('submit')({preventDefault(){},target:{id,fields}});await tick();},select(value){checked={value};listeners.get('change')({target:{name:'answer'}});},cleanup(){controller.dispose();clearTimeout(toast.timer);for(const [key,value] of Object.entries(originals))globalThis[key]=value;}};
}
test('fluxo online: login, partida, resposta RPC, logout e retomada do feedback',async()=>{
  const h=await harness();try{
    assert.match(h.root.innerHTML,/Entre no jogo/);await h.click('profiles');assert.match(h.root.innerHTML,/login-form/);
    await h.submit('login-form',{email:'qa@example.com',password:'test-password'});assert.equal(h.getState().route,'central');assert.match(h.root.innerHTML,/Jogador QA/);
    await h.click('prepare','camp60-01');await h.click('start');assert.equal(h.getState().route,'quiz');assert.ok(!h.root.innerHTML.includes('Resposta correta:'));
    h.select('opaque1');await h.click('answer');assert.match(h.root.innerHTML,/Boa! Você acertou/);assert.equal(h.getState().profile.xp,50);
    const calls=h.requests.filter(r=>r.name==='responder_pergunta');assert.equal(calls.length,1);assert.ok(!('points' in calls[0].args));
    await h.click('logout');assert.equal(h.getState().profile,null);assert.equal(h.getState().route,'home');
    await h.submit('login-form',{email:'qa@example.com',password:'test-password'});await h.click('continue');assert.match(h.root.innerHTML,/Boa! Você acertou/);
    assert.ok(!h.requests.includes('data/perguntas.json'));
  }finally{h.cleanup();}
});

test('confirmação: cadastro preserva o e-mail e reenvio só acontece por envio do formulário',async()=>{
  const h=await harness();try{
    await h.click('profiles');assert.doesNotMatch(h.root.innerHTML,/Reenviar confirmação|resend-form/);
    await h.submit('resend-form',{email:'qa@example.com'});assert.equal(h.requests.filter(x=>x.auth==='resend').length,0);
    await h.click('signup');assert.doesNotMatch(h.root.innerHTML,/REENVIAR CONFIRMAÇÃO|resend-form/);
    await h.submit('signup-form',{email:'qa@example.com',password:'test-password',nickname:'QA',avatar:'android'});
    assert.equal(h.getState().route,'confirmation');assert.match(h.root.innerHTML,/resend-form/);assert.match(h.root.innerHTML,/value="qa@example.com"/);
    assert.equal(h.requests.filter(x=>x.auth==='resend').length,0);
    await h.submit('resend-form',{email:'qa@example.com'});
    assert.deepEqual(h.requests.find(x=>x.auth==='resend'),{auth:'resend',type:'signup',email:'qa@example.com',options:{emailRedirectTo:'https://example.github.io/codequizz/'}});
    assert.equal(h.getState().profile,null);assert.equal(h.feedback.dataset.kind,'success');assert.match(h.feedback.textContent,/Se esta conta estiver aguardando/);
    await h.click('profiles');assert.doesNotMatch(h.root.innerHTML,/Reenviar confirmação|resend-form/);
    await h.submit('resend-form',{email:'qa@example.com'});assert.equal(h.requests.filter(x=>x.auth==='resend').length,1);
  }finally{h.cleanup();}
});

test('falha de SMTP e limite de envio aparecem como erro persistente, sem informar sucesso',async()=>{
  for(const error of [{code:'email_address_not_authorized',message:'Email address not authorized'},{code:'over_email_send_rate_limit',message:'Email rate limit exceeded'}]){
    const h=await harness(false,{resend:error});try{
      await h.click('signup');await h.submit('signup-form',{email:'qa@example.com',password:'test-password',nickname:'QA',avatar:'android'});
      await h.submit('resend-form',{email:'qa@example.com'});
      assert.equal(h.feedback.dataset.kind,'error');assert.equal(h.feedback.hidden,false);assert.ok(!h.feedback.textContent.includes('confira sua caixa'));
      assert.match(h.feedback.textContent,error.code==='email_address_not_authorized'?/configurar o envio/:/limite de envio/);
      assert.equal(h.getState().profile,null);assert.equal(h.getState().route,'confirmation');
    }finally{h.cleanup();}
  }
});

test('conta existente: aviso persistente no cadastro e opções de acesso preservam o e-mail',async()=>{
  const cases=[
    {data:{session:null,user:{identities:[]}},error:null},
    {error:{code:'user_already_exists',message:'User already registered'}},
    {error:{code:'email_exists',message:'Email already exists'}},
    {error:{message:'User already registered'}}
  ];
  for(const response of cases){
    const h=await harness(false,{signup:response.error},response.data);try{
      await h.click('signup');
      await h.submit('signup-form',{email:' qa@example.com ',password:'test-password',nickname:'QA',avatar:'android'});
      assert.equal(h.getState().route,'signup');assert.equal(h.getState().profile,null);
      assert.equal(h.feedback.hidden,false);assert.equal(h.feedback.dataset.kind,'error');
      assert.equal(h.feedback.textContent,'Já existe uma conta com este e-mail. Entre na conta ou recupere sua senha.');
      assert.match(h.root.innerHTML,/ENTRAR NA CONTA/);assert.match(h.root.innerHTML,/ESQUECI MINHA SENHA/);
      assert.doesNotMatch(h.root.innerHTML,/resend-form/);
      assert.equal(h.requests.filter(x=>x.auth==='resend'||x.name==='obter_perfil'||x.name==='consultar_cadastro').length,0);
      await h.click('profiles');assert.match(h.root.innerHTML,/login-form/);assert.match(h.root.innerHTML,/value="qa@example.com"/);
      await h.click('reset');assert.match(h.root.innerHTML,/reset-form/);assert.match(h.root.innerHTML,/value="qa@example.com"/);
      await h.submit('reset-form',{email:'qa@example.com'});assert.equal(h.requests.filter(x=>x.auth==='reset').length,1);
      await h.submit('login-form',{email:'qa@example.com',password:'test-password'});assert.equal(h.getState().route,'central');
    }finally{h.cleanup();}
  }
});

test('conta pendente e convite continuam na confirmação, sem falso aviso de conta confirmada',async()=>{
  for(const user of [{identities:[{provider:'email'}],email_confirmed_at:null},{identities:[],invited_at:'2026-10-01T00:00:00Z'}]){
    const h=await harness(false,{}, {session:null,user});try{
      await h.click('signup');await h.submit('signup-form',{email:'qa@example.com',password:'test-password',nickname:'QA',avatar:'android'});
      assert.equal(h.getState().route,'confirmation');assert.equal(h.getState().profile,null);
      assert.match(h.root.innerHTML,/resend-form/);
      assert.doesNotMatch(h.root.innerHTML,/Já existe uma conta/);
      assert.equal(h.requests.filter(x=>x.auth==='resend').length,0);
    }finally{h.cleanup();}
  }
});

test('login não confirmado mantém o aviso no login; cadastro com falha não oferece reenvio',async()=>{
  const login=await harness(false,{login:{code:'email_not_confirmed',message:'Email not confirmed'}});
  try{
    await login.click('profiles');await login.submit('login-form',{email:'qa@example.com',password:'test-password'});
    assert.equal(login.getState().route,'profiles');assert.doesNotMatch(login.root.innerHTML,/resend-form|REENVIAR CONFIRMAÇÃO/);assert.match(login.feedback.textContent,/Confirme seu e-mail/);
  }finally{login.cleanup();}
  const signup=await harness(false,{signup:{message:'Error sending confirmation email'}});
  try{
    await signup.click('signup');await signup.submit('signup-form',{email:'qa@example.com',password:'test-password',nickname:'QA',avatar:'android'});
    assert.equal(signup.getState().route,'signup');assert.match(signup.feedback.textContent,/conferir o serviço de envio/);assert.equal(signup.feedback.dataset.kind,'error');assert.equal(signup.getState().profile,null);
    assert.doesNotMatch(signup.root.innerHTML,/resend-form|REENVIAR CONFIRMAÇÃO/);
  }finally{signup.cleanup();}
});
test('cadastro confirmado por e-mail, recuperação e mudança de senha mantêm o caminho do GitHub Pages',async()=>{
  const h=await harness();try{
    await h.click('signup');await h.submit('signup-form',{email:'qa@example.com',password:'test-password',nickname:'QA',avatar:'android'});
    const signup=h.requests.find(r=>r.auth==='signup');assert.equal(signup.options.emailRedirectTo,'https://example.github.io/codequizz/');assert.deepEqual(signup.options.data,{apelido:'QA',avatarId:'android'});assert.equal(h.getState().profile,null);
    await h.click('reset');await h.submit('reset-form',{email:'qa@example.com'});
    assert.equal(h.requests.find(r=>r.auth==='reset').redirectTo,'https://example.github.io/codequizz/?recovery=1');
    const id=(await (async()=>{await h.submit('login-form',{email:'qa@example.com',password:'test-password'});return h.getState().profile.id;})());
    h.emit('PASSWORD_RECOVERY',{user:{id}});assert.equal(h.getState().route,'password');assert.match(h.root.innerHTML,/password-form/);
    await h.submit('password-form',{password:'new-password',confirmation:'new-password'});assert.equal(h.getState().route,'central');assert.equal(h.requests.find(r=>r.auth==='update').password,'new-password');
  }finally{h.cleanup();}
});
