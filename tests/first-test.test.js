import {test} from 'node:test';
import assert from 'node:assert/strict';
import {prepareFirstTest} from '../js/session-cleanup.js';
test('primeiro teste limpa apenas dados antigos do jogo e preserva os novos cadastros',()=>{
  const values=new Map([['codequizz:save:v1','antigo'],['sb-projeto-auth-token','teste'],['sb-projeto-auth-token-code-verifier','teste'],['sb-outro-auth-token','outro'],['preferencia','manter']]);
  const storage={getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
  prepareFirstTest(storage,'https://projeto.supabase.co');
  assert.equal(values.has('codequizz:save:v1'),false);assert.equal(values.has('sb-projeto-auth-token'),false);assert.equal(values.has('sb-projeto-auth-token-code-verifier'),false);
  assert.equal(values.get('sb-outro-auth-token'),'outro');assert.equal(values.get('preferencia'),'manter');
  values.set('sb-projeto-auth-token','cadastro novo');prepareFirstTest(storage,'https://projeto.supabase.co');
  assert.equal(values.get('sb-projeto-auth-token'),'cadastro novo');
  assert.doesNotThrow(()=>prepareFirstTest({getItem(){throw new Error('bloqueado');}},'https://projeto.supabase.co'));
});
