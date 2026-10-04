import { validateContent } from './validation.js';
import { emptySave, createProfile, loadSave, saveState, parseImport, SAVE_KEY } from './storage.js';
import { startSession, showCurrent, useHint, answerQuestion, nextQuestion, finishSession } from './quiz.js';
import { phaseState } from './map.js';
import { evaluateObjectives, claimObjective } from './achievements.js';
import { escape as e, icon, toast } from './ui.js';
import { audio } from './audio.js';
import { createGameScreens, gameShell } from './game-screens.js';

const root = document.querySelector('#app');
const modal = document.querySelector('#modal');
let data, save, storage, route = 'home', selectedPhase, selectedWorld, result, pendingImport, conflict = false, storageFault = false;
let titleAudio = { sound:true, music:true, volume:65 };
const audioSettings = () => profile()?.settings || titleAudio;
const profile = () => save?.profiles.find(p => p.id === save.activeProfileId);
const phase = id => data.fases.find(p => p.id === id);
const button = (label, action, cls = 'primary', attrs = '') => `<button class="btn ${cls}" data-action="${action}" ${attrs}>${label}</button>`;
const heading = (eyebrow, title, description = '') => `<div class="page-heading"><span class="eyebrow">${eyebrow}</span><h1 tabindex="-1">${title}</h1>${description ? `<p>${description}</p>` : ''}</div>`;
function persist() {
  if (conflict) return false;
  try { saveState(storage,save); storageFault = false; return true; }
  catch (err) { storageFault = true; if (err.message.includes('Outra aba')) conflict = true; toast(err.message.includes('Outra aba') ? err.message : 'Não foi possível salvar. Seus dados estão nesta aba; exporte o progresso em Configurações.'); return false; }
}
function render(focus = true) {
  const previousScroll = document.querySelector('.game-main')?.scrollTop || 0;
  if (route === 'quiz' && !profile()?.activeSession) route = 'central';
  const context = { data, save, profile: profile(), route, selectedPhase, selectedWorld, result, conflict, storageFault, audioSettings:audioSettings() };
  const screens = createGameScreens(context);
  document.documentElement.dataset.motion = profile()?.settings.motion ? 'on' : 'off';
  document.documentElement.dataset.screen = route;
  audio.configure(audioSettings(),route);
  root.innerHTML = gameShell(screens[route](),context);
  if (!focus) { const main = document.querySelector('.game-main'); if (main) main.scrollTop = previousScroll; }
  if (route === 'quiz' && showCurrent(profile())) persist();
  const feedback = document.querySelector('#feedback-dialog');
  if (feedback) { feedback.showModal(); feedback.addEventListener('cancel',event => event.preventDefault()); }
  if (focus) { (feedback?.querySelector('h2') || document.querySelector('main h1'))?.focus({preventScroll:true}); window.scrollTo({top:0,behavior:'instant'}); }
}
function go(screen) { route = screen; if (screen === 'profiles') selectedWorld = undefined; modal.close(); render(); }
function confirm(title, body, label, action, danger = false) {
  modal.innerHTML = `<h2 id="modal-title">${e(title)}</h2><p>${e(body)}</p><div class="button-group">${button('Cancelar','close-modal','secondary')}${button(e(label),action,danger ? 'danger' : 'primary')}</div>`; modal.showModal();
}
function exportSave() {
  const blob = new Blob([JSON.stringify(save,null,2)],{type:'application/json'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'codequizz-progresso.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url),1000);
}
function importFile() {
  const input = document.createElement('input'); input.type = 'file'; input.accept = '.json,application/json';
  input.addEventListener('change',async () => { try { const file = input.files[0]; if (!file) return; if (file.size > data.config.limites.importBytes) throw new Error('O arquivo deve ter no máximo 2 MB.'); pendingImport = parseImport(await file.text(),data); confirm('Substituir o progresso?',`O backup contém ${pendingImport.profiles.length} perfil(is): ${pendingImport.profiles.map(p => p.apelido).join(', ')}. Os ${save.profiles.length} perfis atuais serão substituídos.`, 'Importar backup','confirm-import'); } catch (err) { toast('Importação recusada: '+err.message); } }); input.click();
}
function evaluate() { const p = profile(); evaluateObjectives(p,data.objetivos,data.mundos); }
async function action(name, id) {
  const readonly = ['export','reload','close-modal','import-file','home','help','settings','profile','ranking','objectives','trophies','central','worlds','map','profiles','future','menu','fullscreen','logout'];
  if (conflict && !readonly.includes(name)) { toast('Recarregue: outra aba alterou o progresso.'); return; }
  if (name === 'map') {
    const w = id ? data.mundos.find(w => w.id === id)
      : data.mundos.find(w => w.id === selectedWorld && w.publicado) || data.mundos.find(w => w.publicado);
    if (!w?.publicado || !profile()) return;
    selectedWorld = w.id;
  }
  if (['home','help','profiles'].includes(name)) return go(name);
  if (['central','worlds','map','objectives','trophies','profile','ranking','settings'].includes(name)) return go(profile() ? name : 'profiles');
  const p = profile();
  switch (name) {
    case 'logout':
      if (p) {
        titleAudio = {sound:p.settings.sound,music:p.settings.music ?? true,volume:p.settings.volume ?? 65};
        // Keep another tab's newer progress if this view was marked stale.
        if (conflict) { save = loadSave(storage,data); conflict = false; }
        save.activeProfileId = null;
        persist();
      }
      selectedWorld = selectedPhase = result = pendingImport = undefined;
      go('home');
      break;
    case 'menu':
      modal.innerHTML = '<h2 id="modal-title">MENU DO JOGO</h2><nav class="pause-menu" aria-label="Menu do jogo">'+[['central','home','MENU PRINCIPAL'],['worlds','world','MUNDOS'],['objectives','target','OBJETIVOS'],['trophies','trophy','SALA DE TROFÉUS'],['profile','user','PERSONAGEM'],['ranking','chart','RANKING LOCAL'],['settings','settings','OPÇÕES'],['logout','logout','SAIR DO PERFIL']].map(([target,ic,label]) => button(icon(ic)+' '+label,target,'secondary')).join('')+'</nav>'+button('VOLTAR AO JOGO','close-modal','primary'); modal.showModal(); break;
    case 'fullscreen':
      try { if (document.fullscreenElement) await document.exitFullscreen(); else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen(); else toast('Tela cheia indisponível neste navegador.'); } catch { toast('Não foi possível ativar a tela cheia.'); } break;
    case 'future': {
      const w = data.mundos.find(w => w.id === id);
      if (w && !w.publicado && p) { selectedWorld = w.id; go('world-preview'); audio.play('click'); }
      else { audio.play('error'); toast('Esta região está em desenvolvimento. Comece sua jornada pelo CAMP60.'); }
      break;
    }
    case 'select-profile': if (save.profiles.some(p => p.id === id)) { selectedWorld = undefined; save.activeProfileId = id; persist(); go('central'); } break;
    case 'sound': case 'motion': {
      if (p) { p.settings[name] = !p.settings[name]; persist(); render(false); }
      else if (name === 'sound') { titleAudio.sound = !titleAudio.sound; render(false); }
      else toast('Crie ou selecione um perfil para salvar essa preferência.');
      if (name === 'sound') { audio.configure(audioSettings(),route); audio.unlock(); audio.play('click'); }
      document.querySelector(`[data-action="${name}"]`)?.focus?.({preventScroll:true});
      break;
    }
    case 'prepare': if (phase(id) && ['available','completed'].includes(phaseState(phase(id),p))) { selectedPhase = id; selectedWorld = phase(id).mundoId; go('prepare'); } break;
    case 'start': startSession(p,phase(selectedPhase),data.perguntas,data.config); if (persist()) go('quiz'); else if (!conflict) go('quiz'); audio.play('start'); break;
    case 'continue': if (p.activeSession) go('quiz'); break;
    case 'hint': if (useHint(p,data.config)) { persist(); render(false); audio.play('hint'); } break;
    case 'answer': { const selected = document.querySelector('input[name=answer]:checked'); if (selected && answerQuestion(p,selected.value,data.config)) { evaluate(); persist(); audio.play(p.activeSession.answers.at(-1).outcome); render(); } break; }
    case 'skip': if (answerQuestion(p,null,data.config,true)) { evaluate(); persist(); render(); audio.play('skipped'); } break;
    case 'next': { const next = nextQuestion(p); if (next === 'finish') { result = finishSession(p,data.config); evaluate(); persist(); go('result'); audio.play(result.approved ? 'complete' : 'retry'); } else if (next) { persist(); render(); } break; }
    case 'abandon': confirm('Abandonar esta partida?','Você mantém XP, moedas e pontos já recebidos. Essa tentativa não aprova a fase nem recebe o bônus final.','Abandonar partida','confirm-abandon'); break;
    case 'confirm-abandon': finishSession(p,data.config,true); persist(); go('central'); break;
    case 'claim': { const o = data.objetivos.find(o => o.id === id); if (o && claimObjective(p,o)) { persist(); toast('Recompensa recebida!'); audio.play('reward'); render(false); } break; }
    case 'export': exportSave(); break;
    case 'import-file': importFile(); break;
    case 'confirm-import': if (pendingImport) { pendingImport.revision = save.revision; save = pendingImport; pendingImport = null; persist(); go(profile() ? 'central' : 'profiles'); toast('Progresso importado.'); } break;
    case 'delete-profile': confirm('Excluir '+p.apelido+'?','Todo o progresso deste perfil será removido. Os outros perfis serão preservados. Você pode exportar um backup antes.','Excluir perfil','confirm-delete',true); break;
    case 'confirm-delete': save.profiles = save.profiles.filter(x => x.id !== p.id); save.activeProfileId = null; persist(); go('profiles'); break;
    case 'close-modal': pendingImport = null; modal.close(); break;
    case 'reload': location.reload(); break;
    case 'recover-save': confirm('Recomeçar o progresso local?','O arquivo armazenado não pôde ser lido. Baixe uma cópia antes de remover apenas os dados do CodeQuizz.','Recomeçar','confirm-recover',true); break;
    case 'download-raw': { const raw = storage.getItem(SAVE_KEY); const a = document.createElement('a'); const url = URL.createObjectURL(new Blob([raw],{type:'application/json'})); a.href = url; a.download = 'codequizz-recuperacao.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url),1000); break; }
    case 'confirm-recover': storage.removeItem(SAVE_KEY); save = emptySave(data.config.version); storageFault = false; go('profiles'); break;
  }
}
document.addEventListener('click',event => {
  const b = event.target.closest('button');
  if (!b || b.disabled) return;
  audio.unlock();
  if (!['answer','start','hint','skip','claim','sound','future'].includes(b.dataset.action)) audio.play('click');
  if (b.dataset.action) action(b.dataset.action,b.dataset.id).catch(err => { audio.play('error'); toast(err.message); });
});
document.addEventListener('visibilitychange',() => audio.visibilityChanged());
window.addEventListener('pagehide',() => audio.pause());
window.addEventListener('pageshow',() => audio.configure(audioSettings(),route));
document.addEventListener('input',event => {
  if (event.target.id !== 'volume-setting' || conflict) return;
  const value = Number(event.target.value);
  audio.configure({...audioSettings(),volume:value},route);
  const output = document.querySelector('output[for="volume-setting"]');
  if (output) output.textContent = value+'%';
});
document.addEventListener('change',event => {
  if (event.target.name === 'answer') { document.querySelector('#confirm-answer').disabled = false; audio.unlock(); audio.play('select'); }
  const preferences = {'sound-setting':'sound','music-setting':'music','motion-setting':'motion','volume-setting':'volume'};
  if (preferences[event.target.id] && !conflict) {
    profile().settings[preferences[event.target.id]] = event.target.id === 'volume-setting' ? Number(event.target.value) : event.target.checked;
    persist(); render(false); audio.unlock(); audio.play('click');
    document.querySelector('#'+event.target.id)?.focus?.({preventScroll:true});
  }
});
document.addEventListener('submit',event => {
  if (!['profile-form','rename-form'].includes(event.target.id)) return;
  event.preventDefault();
  audio.unlock();
  if (conflict) return toast('Recarregue antes de alterar o progresso.');
  try {
    const form = new FormData(event.target); const name = form.get('nickname').trim(); const avatarId = form.get('avatar');
    if (event.target.id === 'profile-form') { if (save.profiles.length >= 10) throw new Error('Limite de 10 perfis atingido.'); const p = createProfile(name,avatarId,data.config); p.settings.sound = titleAudio.sound; save.profiles.push(p); save.activeProfileId = p.id; persist(); go('central'); audio.play('start'); }
    else { if (name.length < 2 || name.length > 24) throw new Error('Use de 2 a 24 caracteres.'); profile().apelido = name; profile().avatarId = avatarId; persist(); render(false); toast('Perfil atualizado.'); }
  } catch (err) { toast(err.message); }
});
window.addEventListener('storage',event => { if (event.key === SAVE_KEY) { conflict = true; render(false); } });
async function init() {
  try {
    data = validateContent(Object.fromEntries(await Promise.all(['config','mundos','fases','perguntas','objetivos'].map(async name => { const res = await fetch(`data/${name}.json`); if (!res.ok) throw new Error(`Não foi possível carregar ${name}.`); return [name,await res.json()]; }))));
    try { storage = window.localStorage; save = loadSave(storage,data); }
    catch (err) {
      let raw; try { raw = storage?.getItem(SAVE_KEY); } catch { /* Storage blocked. */ }
      if (raw) { save = emptySave(data.config.version); root.innerHTML = `<main class="content loading">${heading('SEU PROGRESSO PRECISA DE ATENÇÃO','Não foi possível recuperar o save',e(err.message))}${button('Baixar cópia para recuperação','download-raw','secondary')}${button('Recomeçar','recover-save','danger')}</main>`; return; }
      storage = {getItem:() => null,setItem:() => {throw new Error('Armazenamento bloqueado');}}; save = emptySave(data.config.version); storageFault = true;
    }
    if (profile()) { evaluate(); persist(); route = 'central'; }
    render(false);
  } catch (err) { root.innerHTML = `<main class="content loading">${heading('VAMOS RESOLVER','O conteúdo não pôde ser carregado',e(err.message))}<p>Execute por um servidor HTTP local. No terminal, use <code>npm start</code> e abra o endereço exibido.</p>${button('Tentar novamente','reload')}</main>`; }
}
init();

