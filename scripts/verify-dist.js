import {readFile,readdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
import path from 'node:path';
import {publicFiles,contentSecurityPolicy} from './public-files.js';
async function files(dir){return (await Promise.all((await readdir(dir,{withFileTypes:true})).map(async entry=>entry.isDirectory()?files(path.join(dir,entry.name)):[path.join(dir,entry.name)]))).flat();}
const list=await files('dist');
for(const file of list){
  const name=file.replaceAll('\\','/');
  assert.ok(!/supabase\/|perguntas\.json|seed\.sql|\.pdf$|legacy-|storage\.js|quiz\.js|selection\.js|generate-content|\.map$/.test(name),`Arquivo administrativo publicado: ${name}`);
  assert.ok(publicFiles.includes(name.slice(5)),`Arquivo fora da lista pública: ${name}`);
}
assert.equal(list.length,publicFiles.length,'Arquivo público ausente.');
const bundle=await readFile('dist/js/app.js','utf8');
const questions=JSON.parse(await readFile('privado/data/perguntas.json','utf8'));
for(const q of questions){assert.ok(!bundle.includes(q.enunciado),`Pergunta incorporada ao bundle: ${q.id}`);assert.ok(!bundle.includes(q.explicacao),`Explicação incorporada ao bundle: ${q.id}`);}
assert.ok(!bundle.includes('service_role'));
const config=JSON.parse(await readFile('dist/config/supabase.json','utf8'));
assert.ok(config.publishableKey.startsWith('sb_publishable_'));
assert.deepEqual(Object.keys(config).sort(),['publishableKey','url']);
const html=await readFile('dist/index.html','utf8');
assert.ok(html.includes(contentSecurityPolicy(config.url)),'Política CSP ausente/incorreta.');
for(const file of list.filter(f=>!f.endsWith('.ttf'))){
  const text=await readFile(file,'utf8');
  assert.ok(!/sb_secret_[A-Za-z0-9_-]+|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(text),`Credencial privada em ${file}`);
}
console.log(`Publicação verificada: ${list.length} arquivos, sem catálogo, gabaritos, SQLs ou save local.`);
