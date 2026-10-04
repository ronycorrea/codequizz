// Visual directions from GDD section 3 (page 4); these are scenery, not new game rules.
export const environments = {
  camp60: {name:'Campo de treinamento digital',description:'Plataformas, caminhos de instruções e conexões para organizar os primeiros algoritmos.'},
  fort57: {name:'Fortaleza com portas e circuitos',description:'Muralhas, portões e circuitos representam os mecanismos de condições e decisões.'},
  pagem: {name:'Cidade de páginas e rede',description:'Edifícios em forma de páginas, janelas e conexões unem HTML, CSS e JavaScript.'},
  lab22: {name:'Laboratório de rotinas e dados',description:'Bancadas, experimentos, matrizes e ciclos representam repetições e estruturas de dados.'},
  dimensao: {name:'Região avançada com portais',description:'Portais, órbitas e um núcleo luminoso conectam funções, parâmetros e soluções integradas.'}
};

export function currentWorld({data,profile,route,selectedWorld,selectedPhase,result}) {
  if (!['map','prepare','quiz','result','world-preview'].includes(route) || !profile) return null;
  const byWorld = id => data.mundos.find(w => w.id === id);
  const byPhase = id => byWorld(data.fases.find(f => f.id === id)?.mundoId);
  if (route === 'world-preview') return byWorld(selectedWorld) || null;
  if (route === 'quiz') return byPhase(profile.activeSession?.phaseId) || null;
  if (route === 'prepare') return byPhase(selectedPhase) || null;
  if (route === 'result') return byPhase(result?.phaseId) || null;
  return byWorld(selectedWorld) || byPhase(profile.activeSession?.phaseId)
    || byPhase(profile.sessions?.at(-1)?.phaseId) || data.mundos.find(w => w.publicado) || null;
}

export function worldBackground(world) {
  if (!world || !Object.hasOwn(environments,world.id)) return hubBackground();
  const pieces = {
    camp60: '<div class="training-path"></div><div class="training-pad pad-one"><i></i><i></i><i></i></div><div class="training-pad pad-two"><i></i><i></i><i></i></div><div class="instruction-beacon beacon-one"></div><div class="instruction-beacon beacon-two"></div>',
    fort57: '<div class="castle-wall wall-left"><div class="castle-gate"></div></div><div class="castle-wall wall-right"><div class="castle-gate"></div></div><div class="decision-circuit circuit-one"></div><div class="decision-circuit circuit-two"></div>',
    pagem: '<div class="network-links"></div><div class="page-building building-one"><i></i><i></i><i></i></div><div class="page-building building-two"><i></i><i></i><i></i></div><div class="page-building building-three"><i></i><i></i><i></i></div><div class="page-building building-four"><i></i><i></i><i></i></div>',
    lab22: '<div class="lab-bench bench-left"><div class="lab-flask flask-one"></div><div class="lab-flask flask-two"></div></div><div class="lab-bench bench-right"><div class="data-matrix"></div></div><div class="routine-orbit orbit-one"></div><div class="routine-orbit orbit-two"></div>',
    dimensao: '<div class="dimension-stars"></div><div class="digital-portal portal-one"><i></i><i></i></div><div class="digital-portal portal-two"><i></i><i></i></div><div class="dimension-core"><i></i><i></i></div>'
  };
  return `<div class="world-environment environment-${world.id}"><div class="environment-horizon"></div><div class="environment-grid"></div>${pieces[world.id]}</div>`;
}

function hubBackground() {
  return '<div class="hub-worlds">'+Object.keys(environments).map(id =>
    `<div class="hub-region hub-${id}">${worldBackground({id})}</div>`).join('')+'</div>';
}
