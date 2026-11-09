// Inspeção local; não envia arquivos ou credenciais a nenhum serviço.
import {readFile,readdir} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {assertNoSensitiveContent} from './security-content.js';
import {auditPublicArtifact} from './audit-public-artifact.js';
if(process.argv.includes('--artifact')){
  const root=process.argv[process.argv.indexOf('--artifact')+1],policy=process.argv[process.argv.indexOf('--policy')+1];
  if(!root||!process.argv.includes('--policy')||!policy)throw Error('Informe --artifact e --policy.');
  const result=await auditPublicArtifact(root,{expectedFiles:JSON.parse(await readFile(policy,'utf8'))});
  console.log('Auditoria de publicação aprovada: '+result.files+' arquivos; lista, hashes, CSP e segredos conferidos.');
  process.exit(0);
}
const skip=new Set(['.git','node_modules','dist','.npm-cache','tmp','test-results','playwright-report','blob-report']);
async function files(dir){
  const found=[];
  for(const entry of await readdir(dir,{withFileTypes:true})){
    if(skip.has(entry.name))continue;
    const file=path.join(dir,entry.name);
    if(entry.isDirectory())found.push(...await files(file));
    else if(/\.(js|ts|json|webmanifest|sql|md|yml|yaml)$/.test(file)||entry.name.startsWith('.env'))found.push(file);
  }
  return found;
}
for(const file of await files('.')){
  const content=await readFile(file,'utf8');
  assertNoSensitiveContent(content,file);
  if(file.startsWith('js'+path.sep)&&/\.[jt]s$/.test(file))assert.ok(!/\bconsole\.(?:log|debug)\s*\(/.test(content),`Log de depuração no código do jogo: ${file}.`);
}
const ignored=await readFile('.gitignore','utf8');assert.ok(ignored.split(/\r?\n/).includes('privado/'));
for(const name of ['app','online-app','backend','game-screens','account-screens','game','achievements']){
  const source=await readFile(`js/${name}.js`,'utf8');
  assert.ok(!/from\s+['"]\.\/(?:(?:storage|quiz|selection)(?:\.js)?['"]|legacy-)/.test(source),`Dependência local antiga em ${name}.`);
}
console.log('Inspeção local: sem padrões conhecidos de chaves privadas; fontes administrativas ignoradas e motor local antigo removido.');
console.log('O histórico Git não é limpo por este comando. Publicar somente dist/ em repositório novo.');
