// No application dependencies or private catalog: also runs in the Pages job.
import {readFile,readdir,lstat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {assertNoSensitiveContent} from './security-content.js';
import {isPublicApiKey} from '../js/public-api-key.js';

export const RELEASE_MANIFEST='release-manifest.json';
const same=(a,b)=>JSON.stringify([...a].sort())===JSON.stringify([...b].sort());
const publicPath=name=>typeof name==='string'&&name.length<220&&!name.startsWith('/')&&!name.includes('\\')&&!name.split('/').some(part=>!part||part==='.'||part==='..'||/^(?:\.|privado$|node_modules$|scripts$|tests$|docs$|tmp$|revisao$)/i.test(part))
  &&!/(?:^|\/)(?:perguntas|gabaritos|seed|\.env)(?:[._-]|$)|\.(?:sql|pdf|map|bak|zip|rar|cmd|ps1)$/i.test(name)
  &&/^[A-Za-z0-9_.\/-]+$/.test(name);
const sha256=buffer=>createHash('sha256').update(buffer).digest('hex');
async function entries(root,prefix=''){
  const found=[];
  for(const entry of await readdir(path.join(root,prefix),{withFileTypes:true})){
    const relative=prefix+entry.name,stat=await lstat(path.join(root,relative));
    if(stat.isSymbolicLink()||!stat.isDirectory()&&!stat.isFile())throw Error('Link ou arquivo especial no artefato: '+relative);
    if(entry.isDirectory()){if(!publicPath(relative))throw Error('Diretório fora do artefato público: '+relative);found.push(...await entries(root,relative+'/'));}
    else found.push(relative);
  }
  return found;
}
export async function createReleaseManifest(root,files){
  const records=[];
  for(const name of [...files].filter(name=>name!==RELEASE_MANIFEST).sort()){
    const buffer=await readFile(path.join(root,name));records.push({path:name,bytes:buffer.length,sha256:sha256(buffer)});
  }
  return {version:1,files:records};
}
export async function auditPublicArtifact(root,{expectedFiles}={}){
  root=path.resolve(root);
  const actual=await entries(root);
  if(!Array.isArray(expectedFiles)||!expectedFiles.length||new Set(expectedFiles).size!==expectedFiles.length)throw Error('Lista pública ausente ou inválida.');
  for(const name of actual)if(name!=='.nojekyll'&&!publicPath(name))throw Error('Arquivo administrativo no artefato: '+name);
  if(!same(actual,expectedFiles))throw Error('O artefato não corresponde à lista pública autorizada.');
  const manifestBuffer=await readFile(path.join(root,RELEASE_MANIFEST));
  if(manifestBuffer.length>200_000)throw Error('Manifesto excede o limite.');
  const manifest=JSON.parse(manifestBuffer.toString('utf8'));
  if(manifest.version!==1||!Array.isArray(manifest.files)||!same(manifest.files.map(item=>item.path),actual.filter(name=>name!==RELEASE_MANIFEST))||new Set(manifest.files.map(item=>item.path)).size!==manifest.files.length)throw Error('Manifesto incompleto ou duplicado.');
  let total=0;
  for(const entry of manifest.files){
    if(!Number.isSafeInteger(entry.bytes)||entry.bytes<0||entry.bytes>32*1024*1024||!/^[a-f0-9]{64}$/.test(entry.sha256))throw Error('Entrada inválida no manifesto.');
    const buffer=await readFile(path.join(root,entry.path));total+=buffer.length;
    if(total>128*1024*1024||buffer.length!==entry.bytes||sha256(buffer)!==entry.sha256)throw Error('Arquivo alterado após a revisão: '+entry.path);
    if(!/\.(?:wasm|data|ttf|woff2|png|jpe?g|webp|mp3|ogg|wav)$/i.test(entry.path))assertNoSensitiveContent(buffer.toString('utf8'),entry.path);
  }
  assertNoSensitiveContent(manifestBuffer.toString('utf8'),RELEASE_MANIFEST);
  const config=JSON.parse(await readFile(path.join(root,'config/supabase.json'),'utf8'));
  if(!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(config.url)||!same(Object.keys(config),['url','publishableKey']))throw Error('Configuração pública inválida.');
  if(!isPublicApiKey(config.publishableKey,config.url))throw Error('Chave pública inválida ou de outro projeto.');
  for(const [file,campaign] of [['index.html',false],['campanha/index.html',true]]){
    const html=await readFile(path.join(root,file),'utf8');
    const csp=html.match(/<meta\s+http-equiv="Content-Security-Policy"\s+content="([^"]+)"/i)?.[1];
    if(!csp)throw Error('CSP ausente: '+file);
    const parts=csp.split(';').map(part=>part.trim().split(/\s+/)).filter(parts=>parts[0]);
    if(new Set(parts.map(part=>part[0])).size!==parts.length)throw Error('Diretiva CSP duplicada: '+file);
    const directives=Object.fromEntries(parts.map(([name,...values])=>[name,values]));
    if(JSON.stringify(directives['default-src'])!==JSON.stringify(["'none'"])||JSON.stringify(directives['script-src'])!==JSON.stringify(campaign?["'self'","'wasm-unsafe-eval'"]:["'self'"])||JSON.stringify(directives['connect-src'])!==JSON.stringify(["'self'",config.url]))throw Error('CSP não autorizada: '+file);
    for(const name of ['object-src','base-uri','form-action'])if(JSON.stringify(directives[name])!==JSON.stringify(["'none'"]))throw Error('CSP incompleta: '+file);
    if(/<script(?![^>]*\bsrc=)[^>]*>\s*[^<\s]/i.test(html))throw Error('JavaScript inline no HTML: '+file);
  }
  return {files:actual.length,bytes:total};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{
    const [root,policy]=process.argv.slice(2);if(!root||!policy)throw Error('Informe artefato e lista pública.');
    const result=await auditPublicArtifact(root,{expectedFiles:JSON.parse(await readFile(policy,'utf8'))});
    console.log('Artefato público aprovado: '+result.files+' arquivos; hashes, CSP e padrões de segredos conferidos.');
  }catch(error){console.error(error.message);process.exitCode=1;}
}
