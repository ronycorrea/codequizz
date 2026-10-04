import { readFile } from 'node:fs/promises';
import { createProfile } from '../js/storage.js';
export const data = Object.fromEntries(await Promise.all(['config','mundos','fases','perguntas','objetivos'].map(async n => [n,JSON.parse(await readFile(new URL('../data/'+n+'.json',import.meta.url),'utf8'))])));
export const freshProfile = () => createProfile('Jogador','explorer',data.config);
export const random = () => { let state = 123456789; return () => { state = (1664525*state+1013904223) >>> 0; return state / 4294967296; }; };
export function memoryStorage() { const values = new Map(); return { getItem: k => values.get(k) || null, setItem: (k,v) => values.set(k,v), removeItem: k => values.delete(k) }; }
