# Instalar CodeQuizz no Supabase e publicar

## Projeto configurado

URL confirmada em 05/10/2026: `https://mlxrackuuxugctegsgak.supabase.co`.

A chave `publishable` enviada está em `config/supabase.json`. Ela é apropriada para o navegador e não permite administrar o banco. O código não usa a chave JWT `anon` enviada nem uma chave de serviço. [Tipos de chave](https://supabase.com/docs/guides/api/api-keys).

Na verificação mais recente, o endpoint de configurações do Auth respondeu HTTP 200: e-mail habilitado e confirmação obrigatória. As nove RPCs do jogo existem e recusam execução sem login (`42501`); as tabelas `perfis` e `progresso` também recusam leitura anônima. O schema `codequizz_private` não está exposto na API (`PGRST106`). Isso confirma a instalação da estrutura e as restrições de acesso anônimo. A quantidade de perguntas, os grants de usuários autenticados e o funcionamento com uma conta real ainda não foram conferidos remotamente. Nenhuma conta foi criada e nenhum dado foi alterado durante a verificação. Para conferir o conteúdo como administrador, execute `privado/supabase/verificar-instalacao.sql` no SQL Editor.

## 1. Instalar o banco

No [SQL Editor deste projeto](https://supabase.com/dashboard/project/mlxrackuuxugctegsgak/sql/new), abra uma consulta, copie todo o conteúdo de **`privado/supabase/instalar-codequizz.sql`** e execute como `postgres`.

Esse arquivo reúne a migração e as 210 perguntas. Use uma vez na instalação inicial. Ele não apaga tabelas existentes; se houver uma tabela `public.perfis` ou `public.progresso` criada por outra aplicação, revise a colisão antes de instalar. A migração é transacional; erros impedem sua aplicação parcial. O seed é uma transação separada e pode ser executado novamente.

Após instalar, estas funções aparecem em `public`:

| Função | Responsabilidade |
| --- | --- |
| `obter_perfil()` | Perfil, progresso e retomada segura |
| `iniciar_partida(text, uuid)` | Fase, pré-requisitos, sorteio e registro; UUID identifica a requisição |
| `responder_pergunta(uuid, integer, text, text, boolean)` | Validar dono, índice e alternativa; conferir resposta e pagar uma vez |
| `usar_dica(uuid, integer)` | Debitar uma vez e liberar a pista |
| `avancar_pergunta(uuid, integer)` | Avançar após feedback; índice impede avanço duplo |
| `finalizar_partida(uuid, boolean)` | Aprovação, estrelas, recordes e bônus único; também permite abandono |
| `resgatar_objetivo(text)` | Validar condição e resgatar uma vez |
| `atualizar_perfil(text, text, jsonb)` | Alterar somente apelido, avatar e preferências |
| `consultar_ranking(integer)` | Até 100 posições e a posição do jogador; sem e-mails ou IDs de contas |

Cada mutação autentica via `auth.uid()`. Travas de linha seguem a ordem perfil → partida para serializar saldo, respostas, bônus e conquistas. Respostas possuem chave única `(partida_id, indice)`, partidas ativas possuem índice único por jogador e inícios possuem UUID de requisição. Repetir a mesma resposta/finalização não paga novamente; trocar a alternativa de uma resposta gravada é recusado.

O catálogo é administrativo: `codequizz_private.perguntas` guarda enunciados/alternativas e `codequizz_private.gabaritos` guarda correção, explicações e pistas. Snapshots completos da partida ficam privados. A RPC só envia a questão atual; correção/explicação aparecem após a resposta registrada, e a pista após pagamento. IDs das alternativas são novos e opacos em cada partida.

## 2. Conferir Data API e Auth

Em **Data API**, mantenha `public` entre os schemas expostos. **Não adicione `codequizz_private`**. As tabelas privadas possuem RLS e nenhuma permissão concedida a `anon` ou `authenticated`. `public.perfis` e `public.progresso` possuem leitura apenas do próprio jogador e nenhuma escrita direta pelo navegador.

As funções públicas usam `SECURITY DEFINER`, `search_path = ''`, nomes de tabelas qualificados e verificação explícita de conta/dono. Permissões de execução foram retiradas de `PUBLIC` e `anon` e concedidas somente a `authenticated`. Funções auxiliares privadas não são executáveis pelos papéis da API. RLS não substitui essas permissões. [Funções de banco](https://supabase.com/docs/guides/database/functions), [segurança da API](https://supabase.com/docs/guides/api/securing-your-api).

Em **Authentication → URL Configuration**, defina a URL HTTPS final do jogo em **Site URL** e acrescente os redirecionamentos exatos:

```text
http://127.0.0.1:4173/
http://127.0.0.1:4173/?recovery=1
https://SEU-USUARIO.github.io/SEU-REPOSITORIO/
https://SEU-USUARIO.github.io/SEU-REPOSITORIO/?recovery=1
```

Substitua os dois últimos pela URL real do Pages, incluindo a barra final. Se usar domínio próprio ou `localhost`, inclua suas URLs correspondentes. O fluxo usa a mesma página estática: o SDK recebe o fragmento Auth, e `PASSWORD_RECOVERY` abre o formulário de nova senha. [URLs de redirecionamento](https://supabase.com/docs/guides/auth/redirect-urls).

Mantenha confirmação de e-mail habilitada. Para enviar confirmações/recuperações a jogadores reais, configure SMTP no Auth: o serviço padrão tem limitações de envio e destinatários. Confira os templates antes de testar os links. [Senhas e envio de e-mail](https://supabase.com/docs/guides/auth/passwords), [SMTP](https://supabase.com/docs/guides/auth/auth-smtp).

### Confirmação não recebida

Abra [SMTP Settings deste projeto](https://supabase.com/dashboard/project/mlxrackuuxugctegsgak/auth/smtp) e confira **Enable custom SMTP**. A chave pública do jogo não permite consultar SMTP ou logs administrativos, portanto o aviso de cadastro aceito não comprova a entrega da mensagem.

Se SMTP personalizado estiver desativado, o serviço padrão só aceita endereços pertencentes à equipe da organização e possui atualmente limite de dois e-mails por hora. Para contas dos jogadores, configure um provedor SMTP com remetente autorizado. Se já estiver ativado, confira a entrega/erro nos logs do Supabase Auth e no provedor, incluindo destinatário, remetente e limite de envio. [Restrições oficiais](https://supabase.com/docs/guides/auth/auth-smtp).

Em 05/10/2026, após o teste inicial com SMTP personalizado desativado, o usuário informou que configurou o Brevo no Supabase e que a confirmação de e-mail já funciona. Esse resultado foi relatado pelo usuário; credenciais e logs administrativos não foram acessados pelo agente. Se houver nova falha, consulte [Auth Logs deste projeto](https://supabase.com/dashboard/project/mlxrackuuxugctegsgak/logs/auth-logs) no horário da tentativa e os logs do Brevo. [Diagnóstico oficial de entrega](https://supabase.com/docs/guides/troubleshooting/not-receiving-auth-emails-from-the-supabase-project-OFSNzw).

No jogo, somente um cadastro aceito sem sessão abre a tela **Confirmar e-mail**, com o endereço preenchido e a opção de reenviar por `auth.resend({type:'signup'})`. Não há reenvio automático nem botão de reenvio no login ou antes do envio do cadastro. Login não confirmado mantém o aviso no próprio formulário de entrada. Respostas sem erro não são apresentadas como garantia de entrega; erros de envio/limite permanecem visíveis. Não informe senha ou credenciais SMTP pelo chat.

Após configurar o envio, use o reenvio no jogo, confira caixa de entrada e spam e abra o link. O redirecionamento precisa incluir `http://127.0.0.1:4173/` durante o teste local. Uma conta já confirmada deve usar o login.

## 3. Publicar somente o jogo

```sh
npm ci
npm run validate
npm test
npm run build
npm run verify:dist
```

`dist/` contém HTML, CSS, assets, JavaScript compilado, metadados visuais e configuração pública. Não contém o catálogo de questões, gabaritos, PDFs, módulos locais antigos, scripts administrativos ou SQLs. O servidor local também serve somente `dist/`.

Para esta publicação manual, crie um repositório novo para Pages e copie **somente o conteúdo de `dist/` para a raiz**. Em Settings → Pages, selecione a branch e a pasta raiz. O `index.html` deve ficar na raiz do repositório publicado. Não envie o workspace nem a pasta `dist` como subpasta.

`privado/` não entra no build e está ignorada pelo Git. As perguntas também existiam no histórico local anterior: não publique esse histórico. Excluir ou ignorar o arquivo atual não remove versões anteriores. Guarde uma cópia privada dos arquivos administrativos e PDFs. [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site).

Render não é necessário. O Node/esbuild é usado no desenvolvimento e no build; nenhum servidor Node é publicado.

## Atualizar questões

Revise `privado/data/perguntas.json` e sua fonte autoral, rode `npm run validate` e `npm run db:seed`, e execute **apenas `privado/supabase/seed.sql`** no SQL Editor. Questões/rules já sorteadas permanecem no snapshot privado da partida, preservando a retomada após atualizações.

## Reset para o primeiro teste

O agente não possui acesso administrativo para executar o reset remoto. Antes de abrir novos cadastros, execute **uma única vez** `privado/supabase/preparar-primeiro-teste.sql` no SQL Editor como postgres. Ele remove as contas vinculadas a perfis CodeQuizz e seus dados por CASCADE, preservando perguntas, gabaritos e configuração do Auth/Brevo. Também corrige o ranking para exigir perfil existente. Contas de Auth sem perfil CodeQuizz não são selecionadas. Se uma FK externa impedir a exclusão, a transação cancela inteira; não desabilite triggers ou RLS.

O resultado deve mostrar zero em perfis, progresso, partidas, respostas, histórico, recentes e conquistas; as perguntas e gabaritos devem continuar em 210. Não execute novamente depois de abrir o teste: ele apagaria as novas contas. Não reinstale a migração inicial em um banco já instalado.

A primeira abertura desta revisão remove apenas `codequizz:save:v1` e o token local deste projeto Supabase. Um marcador impede que a limpeza se repita ou apague os novos logins. Dados de outros aplicativos não são alterados. Excluir contas no banco é necessário para limpar o progresso remoto; limpar o navegador sozinho não zera o Supabase. [Exclusão de usuários](https://supabase.com/docs/guides/auth/managing-user-data#deleting-users).

Os últimos 20 relatórios são enviados ao jogador; registros e respostas anteriores são mantidos no banco para histórico e idempotência. A janela recente por fase continua limitada às duas últimas tentativas encerradas. Defina uma política de retenção administrativa antes de ampliar o uso.

## Validação e limites

Os testes locais executam a migração e o seed em PostgreSQL via PGlite, simulando o schema mínimo de Auth e os papéis da API. Cobrem permissões, RLS, contas diferentes, escrita direta recusada, ausência de gabarito, quotas, alternativas opacas, duplicação de resposta/avanço/dica/finalização/resgate, poderes, oito fases, bônus, ranking e retomada no frontend.

Pendentes no ambiente hospedado: conferir os totais do seed, login e partida autenticada, recuperação por link, duas abas/conexões concorrentes, publicação no Pages e inspeção visual em desktop/celular. A confirmação real de e-mail pelo Brevo foi informada como funcionando pelo usuário. As nove RPCs instaladas já foram identificadas e recusaram execução anônima. PGlite possui uma única conexão e não comprova comportamento entre conexões concorrentes; os testes de frontend usam um DOM simulado. Não houve navegador conectado nesta sessão.
