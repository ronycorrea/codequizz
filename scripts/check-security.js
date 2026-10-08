// Inspeção local; não envia arquivos ou credenciais a nenhum serviço.
import {readFile,readdir} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const skip=new Set(['.git','node_modules','dist','.npm-cache','tmp']);
async function files(dir){
  const found=[];
  for(const entry of await readdir(dir,{withFileTypes:true})){
    if(skip.has(entry.name))continue;
    const file=path.join(dir,entry.name);
    if(entry.isDirectory())found.push(...await files(file));
    else if(/\.(js|json|sql|md|yml|yaml)$/.test(file)||entry.name.startsWith('.env'))found.push(file);
  }
  return found;
}
for(const file of await files('.')){
  const content=await readFile(file,'utf8');
  assert.ok(!/sb_secret_[A-Za-z0-9_-]+|xkeysib-[A-Za-z0-9_-]+|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(content),`Credencial privada encontrada em ${file}.`);
  for(const token of content.match(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g)||[]){
    const claim=JSON.parse(Buffer.from(token.split('.')[1],'base64url').toString());
    assert.notEqual(claim.role,'service_role',`JWT administrativo em ${file}.`);
  }
}
const ignored=await readFile('.gitignore','utf8');assert.ok(ignored.split(/\r?\n/).includes('privado/'));
for(const name of ['app','online-app','backend','game-screens','account-screens','game','achievements']){
  const source=await readFile(`js/${name}.js`,'utf8');
  assert.ok(!/from\s+['"]\.\/(?:storage|quiz|selection|legacy-)/.test(source),`Dependência local antiga em ${name}.`);
}
console.log('Inspeção local: sem padrões conhecidos de chaves privadas; fontes administrativas ignoradas e motor local antigo removido.');
console.log('O histórico Git não é limpo por este comando. Publicar somente dist/ em repositório novo.');
