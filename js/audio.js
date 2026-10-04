// Original procedural score and effects. No downloads or autoplay before interaction.
const adventureRoutes = new Set(['worlds', 'map', 'prepare', 'quiz']);
const midi = n => 440 * 2 ** ((n - 69) / 12);
const chords = [[50,57,62,65], [46,53,58,62], [53,60,65,69], [48,55,60,64]];
const melody = [74,null,77,81,79,77,76,null,74,77,81,null,84,81,77,76,
  77,null,81,84,81,79,77,null,76,79,84,null,83,79,76,72];
const effects = {
  click: [[76,0,.05],[81,.035,.06]], select: [[69,0,.06],[76,.05,.08]],
  correct: [[74,0,.12],[77,.09,.12],[81,.18,.16],[86,.3,.22]],
  wrong: [[57,0,.15],[53,.12,.18],[50,.26,.24]],
  hint: [[81,0,.12],[86,.1,.12],[89,.2,.2]],
  skipped: [[79,0,.07],[76,.06,.07],[72,.12,.12]],
  reward: [[81,0,.08],[86,.07,.08],[89,.14,.1],[93,.22,.2]],
  start: [[62,0,.1],[69,.08,.1],[74,.16,.12],[77,.25,.15],[81,.35,.23]],
  complete: [[62,0,.16],[65,.12,.16],[69,.24,.16],[74,.36,.2],[77,.55,.2],[81,.72,.4],[86,.92,.5]],
  retry: [[65,0,.18],[62,.17,.22],[69,.38,.3]], error: [[58,0,.1],[58,.16,.15]]
};

export function createAudioEngine({
  getContext = () => new (window.AudioContext || window.webkitAudioContext)(),
  getHidden = () => !!globalThis.document?.hidden,
  setTimer = (fn,ms) => setTimeout(fn,ms), clearTimer = id => clearTimeout(id)
} = {}) {
  let context, master, musicBus, effectsBus, unlocked = false, timer = null;
  let enabled = true, music = true, volume = .65, route = 'home', nextTime = 0, step = 0;
  const musicVoices = new Set();
  function gain(node, value) {
    node.gain.cancelScheduledValues(context.currentTime);
    node.gain.setTargetAtTime(value,context.currentTime,.025);
  }
  function stopMusic() {
    if (timer !== null) clearTimer(timer);
    timer = null;
    for (const voice of musicVoices) { try { voice.stop(); } catch { /* Already ended. */ } }
    musicVoices.clear();
  }
  function note(frequency, time, duration, bus, level = .09, shape = 'triangle', attack = .008, slide) {
    const oscillator = context.createOscillator(), envelope = context.createGain();
    oscillator.type = shape;
    oscillator.frequency.setValueAtTime(frequency,time);
    if (slide) oscillator.frequency.exponentialRampToValueAtTime(slide,time + duration);
    envelope.gain.setValueAtTime(.0001,time);
    envelope.gain.exponentialRampToValueAtTime(level,time + attack);
    envelope.gain.exponentialRampToValueAtTime(.0001,time + duration);
    oscillator.connect(envelope); envelope.connect(bus);
    if (bus === musicBus) musicVoices.add(oscillator);
    oscillator.onended = () => { musicVoices.delete(oscillator); oscillator.disconnect(); envelope.disconnect(); };
    oscillator.start(time); oscillator.stop(time + duration + .02);
  }
  const shouldPlay = () => unlocked && enabled && music && volume > 0 && adventureRoutes.has(route) && !getHidden();
  function schedule() {
    timer = null;
    if (!shouldPlay()) { stopMusic(); return; }
    if (nextTime < context.currentTime) nextTime = context.currentTime + .04;
    while (nextTime < context.currentTime + .3) {
      const chord = chords[Math.floor(step / 8) % chords.length];
      if (step % 8 === 0) chord.slice(1).forEach(n => note(midi(n),nextTime,1.95,musicBus,.025,'sine',.18));
      if (step % 4 === 0) note(midi(chord[0]),nextTime,.42,musicBus,.12,'triangle');
      const tone = melody[step % melody.length];
      if (tone !== null) note(midi(tone),nextTime,.22,musicBus,.07,'triangle');
      if (step % 4 === 0) note(110,nextTime,.11,musicBus,.14,'sine',.005,38);
      else if (step % 4 === 2) note(180,nextTime,.075,musicBus,.035,'triangle',.004,65);
      note(4200,nextTime,.025,musicBus,.008,'triangle',.002);
      nextTime += 60 / 112 / 2;
      step = (step + 1) % 64;
    }
    timer = setTimer(schedule,80);
  }
  function sync() {
    if (!context) return;
    gain(master,enabled ? volume : 0);
    if (!shouldPlay()) { stopMusic(); return; }
    if (timer === null) { step = 0; nextTime = context.currentTime + .04; schedule(); }
  }
  function configure(settings = {}, screen = route) {
    enabled = settings.sound !== false; music = settings.music !== false;
    volume = Math.max(0,Math.min(100,settings.volume ?? 65)) / 100;
    route = screen; sync();
  }
  function unlock() {
    if (!enabled) return;
    try {
      if (!context) {
        context = getContext();
        master = context.createGain(); musicBus = context.createGain(); effectsBus = context.createGain();
        master.gain.value = 0; musicBus.gain.value = .32; effectsBus.gain.value = .65;
        musicBus.connect(master); effectsBus.connect(master); master.connect(context.destination);
      }
      unlocked = true;
      Promise.resolve(context.resume()).then(sync).catch(() => {});
      sync();
    } catch { /* Unsupported or blocked audio does not prevent playing. */ }
  }
  function play(kind = 'click') {
    if (!enabled || !unlocked || !context || volume === 0 || getHidden()) return;
    try {
      const now = context.currentTime + .01;
      (effects[kind] || effects.click).forEach(([pitch,offset,duration]) => note(midi(pitch),now + offset,duration,effectsBus,
        kind === 'wrong' ? .1 : .12,kind === 'wrong' ? 'triangle' : 'sine'));
    } catch { /* Optional effects. */ }
  }
  function pause() { stopMusic(); }
  function dispose() { enabled = false; unlocked = false; stopMusic(); if (context) { gain(master,0); context.close(); context = undefined; } }
  return { configure, unlock, play, visibilityChanged:sync, pause, dispose };
}

export const audio = createAudioEngine();
