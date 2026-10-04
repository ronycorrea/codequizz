import { readFile } from 'node:fs/promises';
import { validateContent } from '../js/validation.js';
const data = Object.fromEntries(await Promise.all(['config','mundos','fases','perguntas','objetivos'].map(async name => [name,JSON.parse(await readFile(new URL('../data/'+name+'.json',import.meta.url),'utf8'))])));
validateContent(data);
console.log(`Conteúdo válido: ${data.mundos.length} mundos, ${data.fases.length} fases, ${data.perguntas.length} questões.`);
