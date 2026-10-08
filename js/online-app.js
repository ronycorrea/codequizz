import { icon,toast } from './ui.js';
import { audio } from './audio.js';
import { phaseState } from './map.js';
import { createGameScreens,gameShell } from './game-screens.js';
import { authErrorMessage } from './auth-messages.js';

export async function mountGame(backend) {
  const root=document.querySelector('#app'),modal=document.querySelector('#modal');
  const data=Object.fromEntries(await Promise.all(['config','mundos','fases','objetivos'].map(async name=>{
    const response=await fetch(`data/${name}.json`); if(!response.ok) throw new Error('Não foi possível carregar a aventura.'); return [name,await response.json()];
  })));
  let p=null,route='home',selectedPhase,selectedWorld,result,rankingData=null,busy=false,recovery=false,authSession=null,authRevision=0;
  let titleAudio={sound:true,music:true,volume:65,motion:true};
  let confirmationEmail='',accountEmail='',authNotice=null;
  const pendingStarts=new Map();
  const settings=()=>p?.settings||titleAudio;
  const button=(label,action,cls='secondary')=>`<button class="btn ${cls}" data-action="${action}">${label}</button>`;
  function render(focus=true) {
    if(!p&&!['home','profiles','signup','reset','confirmation','password','help'].includes(route)) route='home';
    if(route==='quiz'&&!p?.activeSession) route=p?'central':'home';
    const scroll=document.querySelector('.game-main')?.scrollTop||0;
    const context={data,profile:p,connected:!!authSession,route,selectedPhase,selectedWorld,result,rankingData,confirmationEmail,accountEmail,authNotice,audioSettings:settings()};
    document.documentElement.dataset.motion=settings().motion?'on':'off';
    document.documentElement.dataset.screen=route;
    audio.configure(settings(),route);
    root.innerHTML=gameShell(createGameScreens(context)[route](),context);
    root.setAttribute('aria-busy',String(busy));
    if(busy) root.querySelectorAll('button,input').forEach(node=>node.disabled=true);
    const feedback=document.querySelector('#feedback-dialog');
    if(feedback){feedback.showModal();feedback.addEventListener('cancel',event=>event.preventDefault());}
    if(focus) (feedback?.querySelector('h2')||document.querySelector('main h1'))?.focus({preventScroll:true});
    else {const main=document.querySelector('.game-main'); if(main) main.scrollTop=scroll;}
  }
  function go(screen,notice=null){route=screen;authNotice=notice;modal.close();render();}
  function showAuthNotice(message,type='error'){
    authNotice={message,type};
    const box=document.querySelector('#auth-feedback');
    if(box){box.hidden=false;box.textContent=message;box.dataset.kind=type;box.setAttribute('role',type==='error'?'alert':'status');}
  }
  function accept(response){
    if(!authSession||response.profile?.id!==authSession.user.id) throw new Error('A sessão mudou. Entre novamente.');
    p=response.profile; if(response.result) result=response.result;
  }
  async function refresh(){const revision=authRevision; const profile=await backend.profile(); if(revision===authRevision&&authSession)accept({profile});}
  async function run(task){
    if(busy) return;
    busy=true;root.setAttribute('aria-busy','true');
    const controls=[...root.querySelectorAll('button,input')]; const wasDisabled=controls.map(n=>n.disabled); controls.forEach(n=>n.disabled=true);
    try {await task();} catch(error){audio.play('error');showAuthNotice(error.message);toast(error.message);}
    finally {busy=false;root.setAttribute('aria-busy','false');controls.forEach((n,i)=>n.disabled=wasDisabled[i]);
      if(!controls.some(n=>root.contains(n))) render(false);
    }
  }
  async function action(name,id){
    if(name==='close-modal'){modal.close();return;}
    if(name==='logout'){
      const previousAudio={...settings()};
      const {error}=await backend.client.auth.signOut({scope:'local'}); if(error) throw error;
      authRevision++;authSession=null;titleAudio=previousAudio;p=null;recovery=false;confirmationEmail=accountEmail='';selectedPhase=selectedWorld=result=rankingData=undefined;pendingStarts.clear();go('home');return;
    }
    if(['home','profiles','signup','reset','help'].includes(name)){go(name);return;}
    if(name==='sound'||name==='motion'){
      const next={...settings(),[name]:!settings()[name]};
      if(p) accept(await backend.update(p,next));else titleAudio=next;
      render(false);audio.unlock();audio.play('click');return;
    }
    if(name==='fullscreen'){
      if(document.fullscreenElement) await document.exitFullscreen();else if(document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();return;
    }
    if(!p){go('profiles');return;}
    if(['central','worlds','map','objectives','trophies','profile','settings','ranking'].includes(name)){
      await refresh();
      if(name==='ranking') rankingData=await backend.ranking();
      if(name==='map') selectedWorld=id||data.mundos.find(w=>w.publicado)?.id;
      go(name);return;
    }
    const s=p.activeSession;
    switch(name){
      case 'menu':modal.innerHTML='<h2 id="modal-title">MENU DO JOGO</h2><nav class="pause-menu">'+[['central','MENU PRINCIPAL'],['worlds','MUNDOS'],['objectives','OBJETIVOS'],['trophies','TROFÉUS'],['ranking','RANKING'],['settings','OPÇÕES'],['logout','SAIR DO PERFIL']].map(([target,label])=>button(label,target)).join('')+'</nav>'+button('VOLTAR AO JOGO','close-modal','primary');modal.showModal();break;
      case 'future':if(data.mundos.some(w=>w.id===id&&!w.publicado)){selectedWorld=id;go('world-preview');}break;
      case 'prepare':{const f=data.fases.find(f=>f.id===id);if(f&&phaseState(f,p)!=='locked'){selectedPhase=id;selectedWorld=f.mundoId;go('prepare');}break;}
      case 'start':{
        const requestId=pendingStarts.get(selectedPhase)||crypto.randomUUID();pendingStarts.set(selectedPhase,requestId);
        accept(await backend.start(selectedPhase,requestId));pendingStarts.delete(selectedPhase);go('quiz');audio.play('start');break;
      }
      case 'continue':await refresh();if(p.activeSession)go('quiz');break;
      case 'hint':if(s){accept(await backend.hint(s));render(false);audio.play('hint');}break;
      case 'answer':{
        const selected=document.querySelector('input[name=answer]:checked');
        if(s&&selected){accept(await backend.answer(s,selected.value));render();audio.play(p.activeSession?.answers.at(-1)?.outcome||'click');}break;
      }
      case 'skip':if(s){accept(await backend.answer(s,null,true));render();audio.play('skipped');}break;
      case 'next':if(s){
        if(s.currentIndex+1===s.questionIds.length){accept(await backend.finish(s));go('result');audio.play(result.approved?'complete':'retry');}
        else {accept(await backend.advance(s));render();}break;
      }break;
      case 'abandon':modal.innerHTML='<h2 id="modal-title">Abandonar esta partida?</h2><p>Você mantém as recompensas já recebidas. Essa tentativa não aprova a fase.</p>'+button('Cancelar','close-modal')+button('Abandonar','confirm-abandon','danger');modal.showModal();break;
      case 'confirm-abandon':if(s){accept(await backend.finish(s,true));go('central');}break;
      case 'claim':accept(await backend.claim(id));render(false);audio.play('reward');toast('Recompensa recebida!');break;
    }
  }
  const click=event=>{
    const b=event.target.closest('button');if(!b||b.disabled||!b.dataset.action)return;
    audio.unlock();audio.play('click');run(()=>action(b.dataset.action,b.dataset.id));
  };
  const change=event=>{
    if(event.target.name==='answer'){const confirm=document.querySelector('#confirm-answer');if(confirm)confirm.disabled=false;audio.play('select');return;}
    const key={'sound-setting':'sound','music-setting':'music','motion-setting':'motion','volume-setting':'volume'}[event.target.id];
    if(key&&p) run(async()=>{accept(await backend.update(p,{...p.settings,[key]:key==='volume'?Number(event.target.value):event.target.checked}));render(false);audio.unlock();});
  };
  const input=event=>{
    if(event.target.name==='email')accountEmail=event.target.value.trim();
    if(event.target.id==='volume-setting'){audio.configure({...settings(),volume:Number(event.target.value)},route);const o=document.querySelector('output[for="volume-setting"]');if(o)o.textContent=event.target.value+'%';}
  };
  const submit=event=>{
    if(!['login-form','signup-form','reset-form','resend-form','password-form','rename-form'].includes(event.target.id)) return;
    event.preventDefault();audio.unlock();
    if(event.target.id==='resend-form'&&(route!=='confirmation'||!confirmationEmail)) return;
    const form=new FormData(event.target),id=event.target.id;
    run(async()=>{
      const redirect=new URL('./',location.href);redirect.hash='';redirect.search='';
      let response;
      if(['login-form','signup-form','reset-form','resend-form'].includes(id))accountEmail=form.get('email').trim();
      if(id==='login-form') response=await backend.client.auth.signInWithPassword({email:form.get('email').trim(),password:form.get('password')});
      if(id==='signup-form'){
        response=await backend.client.auth.signUp({email:accountEmail,password:form.get('password'),options:{data:{apelido:form.get('nickname').trim(),avatarId:form.get('avatar')},emailRedirectTo:redirect.href}});
      }
      if(id==='reset-form'){
        redirect.searchParams.set('recovery','1');response=await backend.client.auth.resetPasswordForEmail(form.get('email').trim(),{redirectTo:redirect.href});
      }
      if(id==='resend-form') response=await backend.client.auth.resend({type:'signup',email:form.get('email').trim(),options:{emailRedirectTo:redirect.href}});
      if(id==='password-form'){
        if(!recovery||!authSession) throw new Error('Abra o link de recuperação enviado por e-mail.');
        if(form.get('password')!==form.get('confirmation')) throw new Error('As senhas precisam ser iguais.');
        response=await backend.client.auth.updateUser({password:form.get('password')});
      }
      if(id==='rename-form'){accept(await backend.update(p,p.settings,form.get('nickname').trim(),form.get('avatar')));render(false);toast('Perfil atualizado.');return;}
      if(response?.error) {
        const message=authErrorMessage(response.error);
        throw new Error(message);
      }
      // O Auth pode ofuscar o cadastro repetido de conta confirmada: HTTP 200,
      // sem sessão e identities vazio. Não houve nova conta nem envio de e-mail.
      const signupUser=response?.data?.user;
      if(id==='signup-form'&&!response?.data?.session&&!signupUser?.invited_at&&Array.isArray(signupUser?.identities)&&signupUser.identities.length===0){
        confirmationEmail='';
        throw new Error(authErrorMessage({code:'user_already_exists'}));
      }
      if(id==='resend-form'){showAuthNotice('Se esta conta estiver aguardando confirmação, confira sua caixa de entrada e a pasta de spam. Se já confirmou, volte para entrar.','success');return;}
      if(id==='reset-form'){go('profiles');toast('Se houver uma conta com esse e-mail, você receberá o link de recuperação.');return;}
      if(id==='password-form'){recovery=false;history.replaceState({},'',redirect.href);await refresh();go('central');toast('Senha atualizada.');return;}
      if(response?.data?.session){authSession=response.data.session;await refresh();go('central');audio.play('start');}
      else if(id==='signup-form'){confirmationEmail=accountEmail;go('confirmation',{message:'Cadastro recebido. Confirme seu e-mail para entrar na conta.',type:'success'});}
    });
  };
  document.addEventListener('click',click);document.addEventListener('change',change);document.addEventListener('input',input);document.addEventListener('submit',submit);
  document.addEventListener('visibilitychange',()=>audio.visibilityChanged());window.addEventListener('pagehide',()=>audio.pause());
  // Não aguardar chamadas do Supabase dentro do callback de Auth (evita trava do cliente).
  const {data:subscription}=backend.client.auth.onAuthStateChange((event,session)=>{
    const changedUser=authSession?.user?.id!==session?.user?.id;
    authSession=session;authRevision++;
    if(changedUser){p=null;result=rankingData=null;selectedPhase=selectedWorld=undefined;pendingStarts.clear();}
    if(event==='PASSWORD_RECOVERY'){recovery=true;route='password';render();return;}
    if(event==='SIGNED_OUT'){p=null;recovery=false;route='home';render();return;}
    if(event==='SIGNED_IN'||event==='INITIAL_SESSION') setTimeout(()=>{
      if(!session)return;
      run(async()=>{await refresh();if(!recovery&&route!=='password'&&['home','profiles','signup'].includes(route))go('central');});
    },0);
  });
  const {data:sessionData,error}=await backend.client.auth.getSession();if(error)throw error;
  authSession=sessionData.session;
  if(authSession){
    // Mantém a tela de recuperação após o fragmento Auth ser consumido.
    recovery=recovery||new URL(location.href).searchParams.get('recovery')==='1';
    try{await refresh();route=recovery?'password':'central';}catch(err){toast(err.message);}
  }
  render(false);
  return {dispose(){subscription.subscription.unsubscribe();document.removeEventListener('click',click);document.removeEventListener('change',change);document.removeEventListener('input',input);document.removeEventListener('submit',submit);},getState:()=>({profile:p,route,result})};
}
