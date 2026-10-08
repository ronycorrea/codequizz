import { readFile,writeFile,mkdir } from 'node:fs/promises';
const data = Object.fromEntries(await Promise.all(['config','mundos','fases','objetivos','perguntas'].map(async name => [name,JSON.parse(await readFile(`${name==='perguntas'?'privado/data':'data'}/${name}.json`,'utf8'))])));
const quote = x => "'"+JSON.stringify(x).replaceAll("'","''")+"'::jsonb";
const literal = x => "'"+String(x).replaceAll("'","''")+"'";
let sql='-- Conteúdo administrativo. Não publicar no GitHub Pages.\nbegin;\n';
for (const name of ['config','mundos','fases','objetivos']) sql+=`insert into codequizz_private.conteudo(nome,valor) values(${literal(name)},${quote(data[name])}) on conflict(nome) do update set valor=excluded.valor;\n`;
for (const q of data.perguntas) {
  const {corretaId,explicacao,dica,...safe}=q;
  sql+=`insert into codequizz_private.perguntas(id,documento) values(${literal(q.id)},${quote(safe)}) on conflict(id) do update set documento=excluded.documento;\n`;
  sql+=`insert into codequizz_private.gabaritos(pergunta_id,correta_id,explicacao,dica) values(${literal(q.id)},${literal(corretaId)},${literal(explicacao)},${literal(dica)}) on conflict(pergunta_id) do update set correta_id=excluded.correta_id,explicacao=excluded.explicacao,dica=excluded.dica;\n`;
}
sql+='commit;\n';
await mkdir('privado/supabase',{recursive:true});
await writeFile('privado/supabase/seed.sql',sql);
const migration=await readFile('privado/supabase/migrations/202610050001_codequizz.sql','utf8');
await writeFile('privado/supabase/instalar-codequizz.sql',migration+'\n'+sql);
console.log(`SQL gerado com ${data.perguntas.length} perguntas e gabaritos separados.`);
