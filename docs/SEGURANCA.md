# Revisão para o primeiro teste — 07/10/2026

O banco remoto ainda precisa do reset administrativo. O site deve ser publicado usando somente os arquivos de `dist/`, em repositório novo, sem o histórico fonte local.

## Alterações

- Perguntas, gabaritos, gerador autoral, SQLs e PDFs separados em `privado/`, ignorada pelo Git. Versão local antiga, persistência/importação de saves, cálculo de recompensas no navegador, respectivos testes antigos e imagem de fundo sem uso removidos.
- Build copia uma lista exata de arquivos públicos. A verificação recusa arquivos extras, catálogo no bundle, configuração extra e padrões de credenciais privadas. Licenças foram mantidas.
- CSP permite scripts locais e conexão somente com o projeto Supabase configurado. JavaScript inline, `eval`, plugins, alteração de URL base e envio nativo de formulários são bloqueados. Estilos inline continuam permitidos para SVGs/barras. `no-referrer` evita envio de referências para outros destinos.
- Servidor local usa somente `dist/`, loopback, proteção contra caminhos fora da pasta, `nosniff` e bloqueio de frames. GitHub Pages não aplica os headers desse servidor local; a CSP publicada usa uma meta no HTML. A meta não oferece `frame-ancestors`.
- Ranking passou a exigir perfil existente, como as demais RPCs. Isso recusa JWTs antigos de contas apagadas pelo reset, mesmo antes de sua expiração. A alteração remota é incluída no SQL de preparação.
- Limpeza local única dos saves e tokens antigos deste jogo, sem apagar novos logins ou dados de outros aplicativos.

## Permissões e regras conferidas

RLS restringe perfil/progresso à própria conta; não há escrita de pontuação pelo navegador. Schema privado e auxiliares não são acessíveis pelos papéis da API. RPCs públicas exigem Auth, validam dono da partida e usam `SECURITY DEFINER` com `search_path=''`. Respostas, poderes, bônus e resgates são idempotentes; pontos vêm do banco. Alternativas recebem IDs opacos por partida. O gabarito da questão atual aparece apenas no feedback após uma resposta registrada.

Apelidos e textos de questões são escapados antes de virar HTML; mensagens usam `textContent`. A chave `sb_publishable_` é pública e deve permanecer no site. Nenhuma chave administrativa ou credencial SMTP deve ser publicada. [Permissões de funções](https://supabase.com/docs/guides/database/functions), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy).

## Evidências e limites

- Testes em PostgreSQL via PGlite verificam permissões, isolamento, ausência de gabarito antes da resposta, regras e duplicações. Reset testado com cascatas, preservação de 210 perguntas/gabaritos, recusa de execução pelo jogador, recusa de token antigo e novo perfil com zero XP/pontos e 100 moedas.
- Verificação remota em 07/10: nove RPCs e duas tabelas recusaram acesso anônimo; schema privado fora da API. Nenhuma conta ou pontuação foi alterada por essa verificação.
- `npm audit` em 07/10: zero vulnerabilidades conhecidas reportadas, incluindo dependências de desenvolvimento. Isso não equivale a uma garantia de ausência de falhas.
- Não há painel administrativo/navegador conectado nesta sessão. Reset remoto, concessões autenticadas reais, concorrência entre conexões e renderização/áudio/CSP em navegador ainda precisam de conferência no teste hospedado. SMTP Brevo funcionando foi relatado pelo usuário.

## Publicação manual

1. Execute `privado/supabase/preparar-primeiro-teste.sql` uma vez no SQL Editor como postgres, antes dos novos cadastros. Ele exclui todas as contas com perfil CodeQuizz e seus dados de jogo. Preserva conteúdo e Auth/Brevo. Não reutilize depois de abrir o teste.
2. Confira os totais retornados: dados de jogadores em zero; catálogo e gabaritos em 210.
3. Envie somente o conteúdo de `dist/` a um repositório novo. Não envie a raiz, `privado/`, `.git`, `node_modules` ou SQLs. O histórico local já continha gabaritos; mover/ignorar não limpa esse histórico. Se ele já foi público, esse conteúdo deve ser considerado conhecido.
4. Configure a URL HTTPS final do Pages no Auth, teste cadastro/confirmar/login, complete uma fase e confira ranking e recuperação de senha.

Os arquivos administrativos são necessários para manter o jogo e devem ter backup privado. O reset não altera sua conta do painel Supabase; exclui as contas de jogadores presentes no Auth deste projeto.
