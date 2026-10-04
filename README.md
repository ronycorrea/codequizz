# CodeQuizz

Aprenda programação jogando. Uma aventura em português brasileiro com mapa de progressão, quizzes e explicações, recriada do zero a partir do GDD e dos requisitos de software de 01/10/2026.

## Executar

Com Node.js 22.7 ou superior:

```sh
npm start
```

Abra **http://127.0.0.1:4173**. Não há dependências para instalar, build ou backend. Node é usado apenas para servir os arquivos no desenvolvimento e rodar testes. Também é possível usar qualquer servidor HTTP estático, como o Live Server do editor. Abrir `index.html` por `file://` não é suportado, pois o jogo carrega módulos e JSON.

## Telas e direção visual

A interface é organizada como um jogo: entrada, seleção de explorador, menu com hexágonos e botão PLAY, campanha por regiões, trilha de fases com bandeiras e quiz com personagem, janelas de desafio e painel de poderes. Objetivos, troféus, ranking local e opções têm telas próprias. O menu permite voltar à campanha sem perder a partida; há controle de tela cheia em navegadores compatíveis.

Os PDFs definem o escopo e as regras. Os dez protótipos fornecidos orientam as cores, a marca, os personagens e a composição das telas, sem reprodução literal. A campanha por regiões disponíveis e futuras também foi informada pela referência [CodeCombat](https://br.codecombat.com/play). As ilustrações e personagens são SVGs originais; nenhuma arte desse site foi incorporada. A fonte Lilita One é distribuída localmente com sua licença, sem depender de rede durante o jogo.

O fundo usa gradientes suaves de lilás e azul. A estrutura ocupa a altura disponível (`100dvh`), com menus e mapas dimensionados pela área da tela e disposições próprias para celular na vertical ou horizontal. A página não rola; listas extensas, opções, ajuda e textos longos têm rolagem interna para manter o conteúdo acessível. A conferência visual dessas disposições continua pendente em navegador real.

Os cenários de cada mundo seguem a seção 3 do GDD: CAMP60 tem plataformas e pistas de treinamento; FORT-57, muralhas, portões e circuitos; PAGEM, edifícios em forma de páginas conectadas; LAB22, bancadas, experimentos, matrizes e ciclos; DIMENSÃO, portais e núcleo digital. São elementos CSS decorativos, sem imagens externas, com centro suave para leitura e movimento respeitando a preferência do jogador. O mundo da fase determina o fundo no mapa, preparação, quiz e resultado, inclusive na retomada. Entrada, escolha de perfil, menu, seleção geral de mundos, objetivos, troféus, ranking, perfil, opções e ajuda usam uma composição dos cinco ambientes. Clique em uma região futura para ver seu ambiente; suas fases continuam em desenvolvimento.

O botão **Sair**, visível no topo quando existe um perfil ativo, retorna diretamente à tela de entrada e remove a seleção do perfil. Também está disponível no menu e no feedback do quiz. O progresso e a partida em andamento são preservados; para retomar, escolha o mesmo perfil. Atualizar a página depois de sair mantém a tela de entrada.

Uma trilha original de aventura, em loop a 112 BPM, acompanha mundos, mapa, preparação e quiz. Há efeitos distintos para botões, alternativas, acerto, erro, início, dica, pulo, recompensa e resultado. Tudo é sintetizado com Web Audio, sem arquivos externos. O áudio começa após interação, a música pausa quando a aba fica oculta e não reinicia a cada atualização do quiz. Em Opções há volume, música e som geral. Perfis antigos preservam a preferência de mudo; o ícone de alto-falante ativa o áudio.

## Implementação funcional

- Tela inicial, ajuda, central e até dez perfis locais com apelido e dois avatares.
- Cinco mundos apresentados; CAMP60 publicado com oito fases em sequência. As outras regiões aparecem como **Em desenvolvimento**.
- Mapa SVG e lista equivalente, preparação, alternativas por ID, confirmação, explicações e resultado.
- 210 questões autorais: sete bancos com 15 fáceis, 9 médias e 6 difíceis. A final compartilha os bancos por temas.
- Sorteio sem reposição, quotas fixas, janela das duas últimas tentativas por fase e prioridade alternada entre inéditas e erros antigos fora da janela.
- Dica, pulo, pontos, combo, XP, níveis, moedas, recordes, estrelas e desbloqueios.
- Seis objetivos permanentes, resgate único, Sala de Troféus, estatísticas e ranking dos perfis deste navegador.
- Partida retomável com snapshots das questões, alternativas e regras, inclusive durante feedback.
- Salvamento por evento, exportação/importação com validação e confirmação, exclusão por perfil com confirmação, detecção de conflitos entre abas e recuperação de save inválido.
- Layout para desktop e celular, controles de som e movimento, foco visível e alternativas operáveis por teclado. Os sons são sintetizados localmente e só iniciam por interação.

Esta é uma implementação inicial funcional, ainda sujeita à revisão editorial das questões, à conferência visual em navegador e à validação com estudantes. A história do Ruído e o guia Byte permanecem decisões abertas nos documentos e não foram incorporados à narrativa.

## Regras

| Dificuldade | Pontos base | XP | CodeCoins |
| --- | ---: | ---: | ---: |
| Fácil | 100 | 50 | 10 |
| Média | 150 | 75 | 15 |
| Difícil | 200 | 100 | 20 |

Fases comuns: 10 questões nas quotas 5/3/2. Final: 15 nas quotas 3/6/6. Aprovação a partir de 60%. Uma estrela com aprovação, duas com pelo menos 80%, três com 100% sem nenhum poder. Recordes de pontos, precisão e estrelas são preservados independentemente da última tentativa.

O combo acrescenta 10 por acerto anterior seguido, até 40. A dica custa 20 e aplica `floor((base + combo) * 0.7)` aos pontos, sem alterar XP ou moedas por acerto. O pulo custa 30, é limitado a uma vez por partida, dá zero e entra no denominador da precisão. Erro e pulo zeram o combo. A primeira aprovação de cada fase paga 100 XP e 50 moedas uma vez por perfil.

Níveis começam em 0, 500, 1.200, 2.000 e 3.000 XP; depois avançam a cada 1.000 XP. Não há cronômetro, vidas ou compra com dinheiro. Cada perfil recebe 100 moedas ao ser criado.

## Estrutura

```text
index.html              Entrada semântica
css/                    Base, telas de jogo, campanha e batalha
js/app.js               Navegação, persistência e eventos
js/game-screens.js      Composição das telas e HUD
js/game-art.js          Marca, personagens, regiões e medalhas SVG
js/world-background.js  Cenários CSS e identificação do mundo atual
js/audio.js             Trilha original, efeitos e controles de áudio
js/selection.js         Sorteio e embaralhamento
js/quiz.js              Sessão, respostas e exposição
js/game.js              Recompensas, níveis e ranking
js/achievements.js      Objetivos e resgates
js/storage.js           Persistência e validação do save
js/validation.js        Validação de conteúdo e regras
js/map.js               Pré-requisitos e progresso
js/ui.js                Componentes, arte SVG e áudio
data/                   Configuração, mundos, fases, questões e objetivos
assets/                 Ícone, padrão visual, fonte local e autoria
docs/                   Documentação original e relatório de validação
scripts/                Servidor, geração de conteúdo e validação
tests/                  Regras e integração dos eventos/telas
```

## Conteúdo e manutenção

Os arquivos em `data/` são consumidos diretamente pelo jogo. `scripts/generate-content.js` registra a fonte autoral do banco inicial; `node scripts/generate-content.js` regenera `data/perguntas.json`. Ao revisar esse banco, mantenha fonte e JSON sincronizados; não mova registros existentes, pois seus IDs são derivados da posição. Acrescente registros mantendo IDs estáveis, ou adote IDs explícitos antes de ampliar o gerador.

Cada questão tem quatro alternativas com IDs próprios, `corretaId`, dificuldade, temas, linguagem, explicação e dica. A letra visual muda ao embaralhar; o ID correto permanece. Conteúdo, código e apelidos são escapados na renderização; trechos de código nunca são executados. Revise enunciado, distratores e explicação antes de publicar.

Rode os verificadores depois de modificar conteúdo ou regras:

```sh
npm run validate
npm test
```

O validador verifica referências, IDs, alternativas, grafo de pré-requisitos e bancos com no mínimo três vezes cada quota. Os testes usam aleatoriedade controlada, regras econômicas, retomada, importação, isolamento de perfis e um fluxo integrado das oito fases. A superfície DOM simulada dos testes de integração não comprova layout, acessibilidade real ou compatibilidade entre navegadores.

## Dados locais

O save usa somente `codequizz:save:v1`, com `schemaVersion: 1`, versão do conteúdo e revisão. São mantidas as vinte sessões encerradas mais recentes, estatísticas permanentes e uma janela recente separada por fase. Dados de outros sites não são apagados. A versão inicial não possui migrações de schemas anteriores: saves desconhecidos são recusados sem sobrescrever o arquivo; é oferecido download para recuperação.

O progresso pertence à origem (protocolo, host e porta). HTTP e HTTPS, `localhost` e `127.0.0.1`, ou portas diferentes não compartilham automaticamente o save. Exporte para transferir. Na importação, um arquivo de até 2 MB é validado antes da confirmação para substituir os perfis existentes. Ao detectar mudanças de outra aba, ações de edição são bloqueadas até recarregar.

Não há autenticação, sincronização entre aparelhos, ranking online ou proteção de pontuação contra alterações locais. Falhas de armazenamento são comunicadas e o estado em memória pode ser exportado.

## Publicação no GitHub Pages

1. Envie os arquivos para um repositório GitHub.
2. Configure Pages para publicar a raiz da branch desejada.
3. Abra a URL HTTPS do projeto e confira carregamento de CSS, módulos, JSON, navegação e salvamento.

Todos os caminhos da aplicação são relativos. Não é necessário `npm run deploy`, build ou serviço Node no ambiente publicado. Nenhum repositório foi criado e nenhuma versão foi publicada nesta entrega.

## Documentação de referência

- [Requisitos de software](docs/CodeQuizz_Requisitos_de_Software.pdf)
- [Game Design Document](docs/CodeQuizz_GDD.pdf)
- [Validação executada e verificações pendentes](docs/VALIDACAO.md)
- [Autoria dos elementos visuais e sonoros](assets/AUTORIA.md)

Os PDFs são referências de produto e especificações planejadas. O escopo implementado e as evidências de teste estão descritos neste README e no relatório de validação.
