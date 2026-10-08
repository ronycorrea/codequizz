import { createClient } from '@supabase/supabase-js';
import { createBackend } from './backend.js';
import { mountGame } from './online-app.js';
import { prepareFirstTest } from './session-cleanup.js';
const root=document.querySelector('#app');
try {
  const response=await fetch('config/supabase.json');
  if (!response.ok) throw new Error('Não foi possível preparar a conexão.');
  const config=await response.json();
  if (!config.url || !config.publishableKey?.startsWith('sb_publishable_')) throw new Error('A conexão do jogo ainda está sendo configurada.');
  try { prepareFirstTest(localStorage,config.url); } catch { /* localStorage pode estar bloqueado. */ }
  const client=createClient(config.url,config.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'implicit'}});
  await mountGame(createBackend(client));
} catch (error) {
  root.innerHTML='<main id="main" class="loading"><h1>Não foi possível entrar no jogo.</h1><p id="startup-error"></p><button class="btn primary" id="retry-startup">Tentar novamente</button></main>';
  document.querySelector('#startup-error').textContent=error.message;
  document.querySelector('#retry-startup').addEventListener('click',()=>location.reload());
}
