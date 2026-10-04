import { candidates } from './selection.js';
const check = (condition, message) => { if (!condition) throw new Error(message); };
const unique = (items, label) => check(new Set(items.map(x => x.id)).size === items.length && items.every(x => typeof x.id === 'string' && /^[a-z0-9_-]+$/.test(x.id) && !['__proto__','constructor','prototype'].includes(x.id)), `IDs inválidos ou duplicados em ${label}.`);
export function validateRules(config) {
  const positive = n => Number.isSafeInteger(n) && n > 0 && n <= 1e9;
  check(config && typeof config.version === 'string' && /^\d+\.\d+\.\d+$/.test(config.version), 'Versão de conteúdo inválida.');
  check(['pontos','xp','moedas'].every(k => config[k] && ['facil','medio','dificil'].every(d => positive(config[k][d]))), 'Recompensas inválidas.');
  check(config.combo && positive(config.combo.passos) && positive(config.combo.maximo) && config.custos && positive(config.custos.dica) && positive(config.custos.pulo), 'Custos ou combo inválidos.');
  check(config.premioAprovacao && positive(config.premioAprovacao.xp) && positive(config.premioAprovacao.moedas) && positive(config.saldoInicial), 'Bônus inválidos.');
  check([config.fatorDica,config.aprovacao,config.duasEstrelas].every(n => Number.isFinite(n) && n > 0 && n <= 1) && config.duasEstrelas >= config.aprovacao, 'Limiares de jogo inválidos.');
  check(Array.isArray(config.niveis) && config.niveis.length >= 2 && config.niveis.length <= 100 && config.niveis[0] === 0 && config.niveis.every((n,i,a) => Number.isSafeInteger(n) && (i === 0 || n > a[i-1])) && positive(config.xpPorNivelExtra), 'Configuração de níveis inválida.');
  check(positive(config.janelaRecente) && config.limites && ['perfis','sessoes','importBytes'].every(k => positive(config.limites[k])), 'Limites inválidos.');
}
export function validateQuestion(q) {
  check(q && typeof q.id === 'string' && typeof q.enunciado === 'string' && q.enunciado.trim() && typeof q.explicacao === 'string' && q.explicacao.trim() && typeof q.dica === 'string' && q.dica.trim(), 'Questão incompleta.');
  unique([q], 'questão');
  check(['facil','medio','dificil'].includes(q.dificuldade) && q.tipo === 'multipla_escolha' && q.linguagem === 'javascript' && Array.isArray(q.temas) && q.temas.length > 0, 'Tipo, linguagem ou dificuldade inválida.');
  check(Array.isArray(q.alternativas) && q.alternativas.length === 4 && q.alternativas.every(a => typeof a.texto === 'string' && a.texto.trim()), 'Alternativas inválidas.');
  unique(q.alternativas, 'alternativas');
  check(q.alternativas.some(a => a.id === q.corretaId), 'Resposta correta inexistente.');
  check(q.codigo === undefined || typeof q.codigo === 'string', 'Código inválido.');
}
export function validateContent(data) {
  const { mundos, fases, perguntas, objetivos, config } = data;
  for (const [name, values] of Object.entries({mundos, fases, perguntas, objetivos})) { check(Array.isArray(values), `Coleção inválida: ${name}.`); unique(values, name); }
  perguntas.forEach(validateQuestion);
  const byId = Object.fromEntries(fases.map(p => [p.id,p]));
  const visit = (id, path = new Set()) => { check(!path.has(id), 'Ciclo em pré-requisitos.'); const p = byId[id]; check(p, 'Pré-requisito inexistente.'); for (const previous of p.prerequisitos) visit(previous, new Set([...path, id])); };
  for (const phase of fases) {
    check(mundos.some(w => w.id === phase.mundoId && w.faseIds.includes(phase.id)), 'Mundo da fase inválido.');
    check(phase.perguntaIds === undefined || phase.perguntaIds.every(id => perguntas.some(q => q.id === id)), 'Questão referenciada não existe.');
    check(['facil','medio','dificil'].every(d => Number.isInteger(phase.quotas[d]) && phase.quotas[d] >= 0) && Object.values(phase.quotas).reduce((a,b) => a+b,0) === phase.quantidade, 'Quotas inválidas.');
    visit(phase.id);
    if (phase.publicada) for (const d of ['facil','medio','dificil']) check(candidates(phase, perguntas).filter(q => q.dificuldade === d).length >= phase.quotas[d] * 3, `Banco insuficiente: ${phase.id}, ${d}.`);
  }
  check(mundos.every(w => w.faseIds.every(id => byId[id]?.mundoId === w.id)), 'Referência de mundo inválida.');
  for (const o of objetivos) check(['primeira_fase','acertos','sequencia','perfeito','mundo'].includes(o.tipoCondicao) && Number.isInteger(o.meta) && o.meta > 0 && ['recompensaXP','recompensaMoedas'].every(k => Number.isSafeInteger(o[k]) && o[k] >= 0), 'Objetivo inválido.');
  validateRules(config);
  return data;
}
