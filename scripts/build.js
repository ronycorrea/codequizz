import { build } from 'esbuild';
import { mkdir, readFile, writeFile, cp } from 'node:fs/promises';
import path from 'node:path';
import {publicFiles,contentSecurityPolicy} from './public-files.js';

const root = process.cwd();
const output = path.resolve(root,'dist');
if (output !== path.join(root,'dist')) throw new Error('Diretório de publicação inválido.');
// O diretório é substituído pelo próprio Node, dentro do workspace, para evitar arquivos antigos.
const { rm } = await import('node:fs/promises');
await rm(output,{recursive:true,force:true});
await mkdir(path.join(output,'js'),{recursive:true});
for (const file of publicFiles.filter(file=>!['index.html','.nojekyll','config/supabase.json','js/app.js'].includes(file))) {
  await mkdir(path.dirname(path.join(output,file)),{recursive:true});
  await cp(file,path.join(output,file));
}
const settings = JSON.parse(await readFile('config/supabase.json','utf8'));
settings.url = process.env.SUPABASE_URL || settings.url;
settings.publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || settings.publishableKey;
if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(settings.url) || !/^sb_publishable_/.test(settings.publishableKey)) throw new Error('Configure a URL e a chave pública publishable do Supabase.');
await mkdir(path.join(output,'config'),{recursive:true});
await writeFile(path.join(output,'config/supabase.json'),JSON.stringify(settings,null,2));
await build({entryPoints:['js/app.js'],outfile:path.join(output,'js/app.js'),bundle:true,format:'esm',platform:'browser',target:'es2022',minify:true,legalComments:'eof'});
const html=await readFile('index.html','utf8');
if(!html.includes('<!-- SECURITY_POLICY -->')) throw new Error('Marcador de segurança ausente no HTML.');
await writeFile(path.join(output,'index.html'),html.replace('<!-- SECURITY_POLICY -->',`<meta http-equiv="Content-Security-Policy" content="${contentSecurityPolicy(settings.url)}">`));
await writeFile(path.join(output,'.nojekyll'),'');
console.log('Publicação pronta em dist/: HTML, CSS, JavaScript e configuração pública. Gabaritos e SQL excluídos.');
