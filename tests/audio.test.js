import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createAudioEngine } from '../js/audio.js';

function rig() {
  const nodes = [], timers = new Map(); let contexts = 0, hidden = false, sequence = 0;
  const param = () => ({value:0,setValueAtTime(v,t){this.value=v;this.time=t;},exponentialRampToValueAtTime(){},cancelScheduledValues(){},setTargetAtTime(v){this.value=v;}});
  const context = {currentTime:0,destination:{},resume(){return Promise.resolve();},close(){},
    createGain(){const n = {gain:param(),connect(){},disconnect(){}};nodes.push(n);return n;},
    createOscillator(){const n = {frequency:param(),connect(){},disconnect(){},start(time){this.started=time;},stop(time){this.stopped=time ?? context.currentTime;}};nodes.push(n);return n;}
  };
  const audio = createAudioEngine({getContext(){contexts++;return context;},getHidden:()=>hidden,
    setTimer(fn){const id=++sequence;timers.set(id,fn);return id;},clearTimer(id){timers.delete(id);}});
  return {audio,context,nodes,timers,get contexts(){return contexts;},set hidden(v){hidden=v;},voices:()=>nodes.filter(n=>n.frequency)};
}

test('áudio aguarda interação; a música mantém um único agendador e pausa fora da campanha', async () => {
  const r = rig(); r.audio.configure({sound:true},'quiz');
  assert.equal(r.contexts,0); assert.equal(r.timers.size,0);
  r.audio.unlock(); await Promise.resolve();
  assert.equal(r.contexts,1); assert.equal(r.timers.size,1); assert.ok(r.voices().length>0);
  const before = r.voices().length;
  r.audio.configure({sound:true},'quiz'); r.audio.unlock(); await Promise.resolve();
  assert.equal(r.timers.size,1); assert.equal(r.voices().length,before);
  r.audio.configure({sound:true},'settings'); assert.equal(r.timers.size,0);
  assert.ok(r.voices().every(n=>n.stopped===0));
  r.audio.configure({sound:true},'map'); assert.equal(r.timers.size,1);
  r.hidden=true; r.audio.visibilityChanged(); assert.equal(r.timers.size,0);
  r.hidden=false; r.audio.visibilityChanged(); assert.equal(r.timers.size,1);
  r.audio.dispose(); assert.equal(r.timers.size,0);
});

test('música independente, volume e mudo respeitam a preferência; acerto e erro são distintos', async () => {
  const r = rig(); r.audio.configure({sound:true,music:false,volume:40},'quiz'); r.audio.unlock(); await Promise.resolve();
  assert.equal(r.timers.size,0); assert.equal(r.nodes[0].gain.value,.4);
  r.audio.play('correct'); const good = r.voices().map(n=>n.frequency.value);
  const count = good.length; r.audio.play('wrong'); const bad = r.voices().slice(count).map(n=>n.frequency.value);
  assert.equal(good.length,4); assert.equal(bad.length,3); assert.ok(good.at(-1)>good[0]); assert.ok(bad.at(-1)<bad[0]);
  const before = r.voices().length;
  r.audio.configure({sound:false,music:true,volume:40},'quiz'); r.audio.play('click');
  assert.equal(r.nodes[0].gain.value,0); assert.equal(r.timers.size,0); assert.equal(r.voices().length,before);
  r.audio.configure({sound:true,volume:0},'quiz'); r.audio.play('correct'); assert.equal(r.voices().length,before);
  r.audio.dispose();
});

test('navegador sem Web Audio mantém o jogo operacional', () => {
  const audio = createAudioEngine({getContext(){throw new Error('Unsupported');}});
  assert.doesNotThrow(()=>{audio.configure({sound:true},'quiz');audio.unlock();audio.play('click');audio.configure({sound:false},'central');});
});
