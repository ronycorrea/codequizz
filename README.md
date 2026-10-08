# CodeQuizz

Jogo web em HTML, CSS e JavaScript, com Supabase Auth e regras no PostgreSQL. O navegador mostra as telas; funções SQL/PLpgSQL sorteiam perguntas, conferem respostas e determinam pontos, XP, moedas, progresso e ranking.

## Executar

Com Node.js 24:

```sh
npm ci
npm start
```

Abra **http://127.0.0.1:4173**. O comando compila o jogo em `dist/` e serve apenas esse diretório. Abrir o HTML por `file://` ou servir a raiz do repositório não corresponde à versão publicada.

A URL do projeto e a chave pública estão em [config/supabase.json](config/supabase.json). As tabelas e funções precisam ser instaladas no Supabase antes de jogar: siga [docs/SUPABASE.md](docs/SUPABASE.md). A chave pública não administra o banco.

## Funcionamento

- Cadastro, login, confirmação de e-mail e recuperação de senha com Supabase Auth.
- Tela de confirmação com reenvio por ação do jogador e mensagens persistentes de falha de envio/limite.
- Um perfil por conta, com apelido e dois avatares. Senhas ficam sob responsabilidade do Auth.
- Cinco mundos; CAMP60 publicado com oito fases. As outras regiões possuem prévias de cenário.
- 210 perguntas autorais, com sorteio e quotas validados no banco. Só a pergunta atual é enviada, sem gabarito antes da resposta.
- Dica, pulo, combo, pontos, XP, moedas, níveis, estrelas, bônus e seis objetivos com resgate único.
- Retomada de partida inclusive no feedback, com snapshots privados das perguntas e regras.
- Ranking online pela soma dos recordes por fase; outros jogadores são identificados por apelido e avatar.
- Botão Sair no topo e no feedback: encerra a sessão neste dispositivo e preserva a partida no banco.
- Cenários CSS por mundo conforme a seção 3 do GDD; telas gerais compõem os cinco ambientes.
- Trilha de aventura e efeitos originais sintetizados com Web Audio; preferências de volume, som, música e animações.

Os PDFs definem o escopo. Os protótipos orientam cores e composição, sem reprodução literal; [CodeCombat](https://br.codecombat.com/play) orienta a campanha por regiões. Arte SVG e áudio são originais, e a fonte Lilita One possui licença local. A página usa `100dvh`, com rolagem interna para conteúdo longo. Validação visual em navegador ainda pendente.

## Regras

| Dificuldade | Pontos base | XP | CodeCoins |
| --- | ---: | ---: | ---: |
| Fácil | 100 | 50 | 10 |
| Média | 150 | 75 | 15 |
| Difícil | 200 | 100 | 20 |

Fases comuns: 10 questões nas quotas 5/3/2. Final: 15 nas quotas 3/6/6. Aprovação com 60%; duas estrelas com 80%; três com 100% sem poderes. Recordes de pontos, precisão e estrelas são preservados independentemente da última tentativa.

O combo acrescenta 10 por acerto anterior seguido, até 40. A dica custa 20 e aplica `floor((base + combo) * 0.7)` aos pontos. O pulo custa 30, uma vez por partida, dá zero e entra no denominador. Erro e pulo zeram o combo. A primeira aprovação de cada fase paga 100 XP e 50 moedas uma vez por conta. Objetivos têm resgate único.

Níveis começam em 0, 500, 1.200, 2.000 e 3.000 XP; depois avançam a cada 1.000 XP. Não há cronômetro, vidas ou compra com dinheiro. Cada perfil recebe 100 moedas ao ser criado.

## Arquitetura

| Componente | Responsabilidade |
| --- | --- |
| `js/app.js` | Inicializar supabase-js com chave pública |
| `js/online-app.js` | Navegação, Auth e eventos |
| `js/backend.js` | Contrato das chamadas RPC |
| `js/game-screens.js`, `js/account-screens.js` | Telas do jogo e contas |
| `privado/supabase/migrations/` | Tabelas, RLS, grants e funções SQL/PLpgSQL |
| `privado/supabase/seed.sql` | Conteúdo administrativo e gabaritos separados |
| `privado/supabase/instalar-codequizz.sql` | Instalação inicial completa no SQL Editor |
| `scripts/build.js` | Gerar somente os arquivos públicos em `dist/` |
| `privado/supabase/preparar-primeiro-teste.sql` | Reset administrativo único antes de novos cadastros |

Render não participa dessa arquitetura. O motor de pontuação local, importação/exportação de saves e a versão antiga foram removidos. O navegador apenas apresenta os resultados das RPCs. Na primeira abertura desta revisão, os saves e a sessão local antigos deste projeto são removidos uma única vez; novos logins são preservados.

## Conteúdo administrativo

`privado/data/perguntas.json` e `privado/scripts/generate-content.js` são fontes de autoria, nunca carregadas pelo jogo online. Depois de revisar as questões:

```sh
npm run validate
npm run db:seed
```

Execute apenas `privado/supabase/seed.sql` no SQL Editor para atualizar o catálogo. Partidas em andamento mantêm suas perguntas/regras originais. O instalador completo é usado uma vez em banco novo.

**Publique somente o conteúdo de `dist/` em um repositório novo para GitHub Pages.** `privado/` está no `.gitignore`, mas os gabaritos já existem no histórico Git local: ignorar ou mover arquivos não limpa esse histórico. Não envie a raiz nem o histórico deste projeto ao repositório público. Mantenha backup privado de `privado/`: ela contém perguntas, geradores, migrações e os PDFs. Veja [o guia](docs/SUPABASE.md).

## Verificação

```sh
npm run validate
npm test
npm run build
npm run verify:dist
npm run security
```

Os testes SQL usam PostgreSQL via PGlite, com `auth.uid()` e papéis de API simulados. Conferem permissões, isolamento, RPCs, economia, campanha completa e repetição de requisições. Testes de interface usam DOM/serviço Auth simulados; confirmação de e-mail, recuperação por link real, concorrência entre conexões e layout devem ser conferidos no Supabase e no navegador. Veja [docs/SUPABASE.md](docs/SUPABASE.md).

## Antes do primeiro teste

Execute uma única vez [privado/supabase/preparar-primeiro-teste.sql](privado/supabase/preparar-primeiro-teste.sql) no SQL Editor como postgres. Ele apaga contas com perfil CodeQuizz e todos os seus dados de jogo, preserva o catálogo e aplica a proteção do ranking para contas excluídas. O reset remoto não foi executado pelo agente, pois não há conexão administrativa disponível. Não execute novamente após começar os novos cadastros.

O diretório `dist/` já contém o site para publicação manual. Configure no Supabase a URL final do Pages e os redirecionamentos de confirmação/recuperação. A conexão SMTP com Brevo foi informada como funcionando pelo usuário. Revisão de segurança e limites: [docs/SEGURANCA.md](docs/SEGURANCA.md).
