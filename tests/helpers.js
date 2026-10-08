import { readFile } from 'node:fs/promises';
export const createProfile = (apelido, avatarId, config) => ({id:crypto.randomUUID(),apelido,avatarId,xp:0,coins:config.saldoInicial,totalPoints:0,stats:{answered:0,correct:0,wrong:0,skipped:0,bestStreak:0,completed:0},settings:{sound:true,music:true,volume:65,motion:true},phaseProgress:{},achievements:{},sessions:[],activeSession:null});
export const data = Object.fromEntries(await Promise.all(['config','mundos','fases','objetivos'].map(async n => [n,JSON.parse(await readFile(new URL('../data/'+n+'.json',import.meta.url),'utf8'))])));
export const freshProfile = () => createProfile('Jogador','explorer',data.config);
