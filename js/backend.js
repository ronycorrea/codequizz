// Toda mutação de progresso passa por RPC. Este módulo nunca calcula recompensas.
export function createBackend(client) {
  async function rpc(name,args={}) {
    const {data,error}=await client.rpc(name,args);
    if (error) {
      const missing=['PGRST202','42P01','42883'].includes(error.code);
      throw new Error(missing ? 'O jogo ainda está sendo preparado. Tente novamente em breve.' : error.message || 'Não foi possível conectar. Tente novamente.');
    }
    return data;
  }
  return {
    client,rpc,
    profile:()=>rpc('obter_perfil'),
    start:(phaseId,requestId)=>rpc('iniciar_partida',{p_fase_id:phaseId,p_requisicao_id:requestId}),
    hint:s=>rpc('usar_dica',{p_partida_id:s.sessionId,p_indice:s.currentIndex}),
    answer:(s,alternative,skip=false)=>rpc('responder_pergunta',{p_partida_id:s.sessionId,p_indice:s.currentIndex,p_pergunta_id:s.questionSnapshots[s.currentIndex].id,p_alternativa_id:alternative,p_pular:skip}),
    advance:s=>rpc('avancar_pergunta',{p_partida_id:s.sessionId,p_indice:s.currentIndex}),
    finish:(s,abandon=false)=>rpc('finalizar_partida',{p_partida_id:s.sessionId,p_abandonar:abandon}),
    claim:id=>rpc('resgatar_objetivo',{p_objetivo_id:id}),
    update:(p,settings=p.settings,nick=p.apelido,avatar=p.avatarId)=>rpc('atualizar_perfil',{p_apelido:nick,p_avatar_id:avatar,p_settings:settings}),
    ranking:()=>rpc('consultar_ranking',{p_limite:100})
  };
}
