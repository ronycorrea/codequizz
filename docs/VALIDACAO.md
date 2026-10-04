# Validação — 04/10/2026

Ambiente: Windows, Node.js 24.21.0, servidor estático em `http://127.0.0.1:4173`. Nenhuma dependência externa ou rede é necessária durante os testes.

## Executado

- `npm run validate`: cinco mundos, oito fases e 210 questões válidos. IDs, resposta correta, tipos, quotas, referências e ausência de ciclos verificados.
- `npm test`: 39 testes aprovados. Incluem distribuição por dificuldade, três tentativas sem repetição inicial, revisão de erros, retorno às exposições mais antigas e bloqueio por quota insuficiente.
- Economia: combo, penalidade de dica, saldo insuficiente, pulo único, estrelas, limites de níveis, bônus único, preservação de recorde e resgate único.
- Persistência: retomada no feedback, snapshots de conteúdo e regras, isolamento, revisão concorrente, falha de gravação, importação inválida/futura e limites de tamanho.
- Integração com DOM simulado: criação de perfil, todas as oito fases, portal, objetivos, troféus, estatísticas, ranking, configurações, ajuda, cancelamento de recuperação e exclusão isolada. Conclusão de 85 questões com recompensas sem duplicação.
- Nova interface: menu do jogo preserva a sessão, feedback abre em dialog e impede fechamento por cancelamento até avançar. Os testes simulam essas APIs; o comportamento nativo ainda depende da conferência em navegador.
- Áudio com API simulada: ausência de autoplay, agendador único, pausa ao sair da campanha ou ocultar a aba, volume, música independente, mudo e efeitos diferentes para acerto e erro. Integração verifica controles, persistência, compatibilidade com saves antigos e recusa de valores inválidos. Não foi possível ouvir a trilha ou conferir sua reprodução em navegador real.
- Responsividade: removidas as alturas mínimas fixas das cenas de campanha e a rolagem global; estrutura limitada ao viewport dinâmico, com layouts para celular vertical/horizontal e rolagem interna quando o conteúdo exige. A alteração foi inspecionada no código, sem medição visual em navegador.
- Mundos: cinco cenários CSS distintos conforme o GDD, seção 3; identificação pela fase na preparação/quiz/resultado e retomada por sessão. As telas gerais, incluindo entrada e menu, usam uma composição dos cinco cenários. Integração verifica todas as prévias futuras sem alterar o save nem desbloquear fases e a volta à partida no CAMP60. Conferência visual ainda pendente, pois a consulta de superfícies continua sem navegador disponível.
- Saída do perfil: botão no HUD, menu e feedback; volta à entrada, persiste a desativação do perfil e preserva o progresso e a partida, tanto aguardando resposta como no feedback. Testada a retomada sem pagamento duplicado e a saída após conflito entre abas sem sobrescrever progresso mais recente.
- Verificação sintática dos módulos e resposta HTTP 200 da entrada do projeto.

O teste integrado usa uma superfície DOM mínima para verificar navegação e eventos. Não valida renderização, semântica acessível completa ou ações nativas do navegador como seletor de arquivo e download.

## Pendente antes de considerar o MVP validado para publicação

Não havia navegador conectado disponível neste ambiente. A consulta de superfícies da revisão visual retornou nenhuma aplicação ou navegador; as tentativas anteriores de abrir a interface retornaram “No browser is available” e “Browser is not available: iab”. Portanto, não foi possível confirmar visualmente desktop/celular ou compatibilidade de navegador. Os estilos incluem disposições próprias para desktop, tablet e celular.

- Abrir em Chrome, Edge e Firefox; Safari quando disponível.
- Conferir o layout em 360, 768 e 1440 px, enunciados longos, código e ausência de rolagem horizontal global.
- Completar uma fase por teclado; verificar foco, radios, feedback, dialogs e lista alternativa ao mapa.
- Testar seletor de importação, download/exportação, cancelamento, áudio após interação e preferência de movimento reduzido.
- Abrir duas abas e verificar bloqueio de edição ao receber mudança de revisão.
- Simular localStorage bloqueado e quota excedida em navegador real.
- Revisar editorialmente as 210 questões e calibrar as dicas por pergunta; as dicas atuais são orientações por tema.
- Validar compreensão com estudantes iniciantes e medir as metas de carregamento no ambiente de referência.
- Conferir a versão HTTPS publicada, os caminhos relativos e a continuidade do progresso nessa origem.

Não foram verificados ganhos educacionais nem balanceamento com jogadores reais.
