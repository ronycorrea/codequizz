# Segurança do CodeQuizz

## Quiz e contas

O navegador apresenta perguntas e envia respostas. As RPCs autenticadas conferem dono da partida, índice e dados esperados antes de calcular recompensas. RLS, grants e schema privado protegem contas e gabaritos.

Respostas escritas são analisadas como dados. O quiz não executa Python, Java, HTML ou SQL enviados pelo aluno. A nova gramática estática permanece no pacote administrativo de revisão até sua instalação aprovada.

Texto de jogadores, respostas e soluções são escapados ao aparecer na página. Logs de depuração são recusados nos fontes do jogo. Credenciais SMTP ficam no painel administrativo, fora do frontend.

Ao repetir o mesmo payload após falha de rede, o cliente mantém o UUID da requisição. Alterar a resposta gera outro UUID. O recibo do servidor impede recompensas duplicadas.

Rascunhos do quiz são locais por conta, sessão e pergunta; não concedem pontos. A campanha também possui checkpoints locais por UUID. Seus resultados não entram no ranking do quiz.

## Publicação

- O build executa a inspeção dos fontes antes de gerar dist/.
- verify:dist compara o bundle com o catálogo privado e confere a configuração pública.
- release-manifest.json registra tamanho e SHA-256 de cada arquivo. Detecta alterações após a preparação; não é uma assinatura independente.
- A auditoria recusa arquivos extras/ausentes, links simbólicos, SQLs, catálogos privados, PDFs e mapas de fonte.
- O scanner recusa padrões conhecidos de segredos Supabase, SMTP/Brevo, tokens GitHub, chaves privadas e JWTs privilegiados ou de sessão. Mensagens não reproduzem os valores.
- Somente a chave publishable ou a anon legada do mesmo projeto entra na configuração pública. O Supabase continua verificando a assinatura do JWT.
- O workflow repete a auditoria antes do deploy. Actions oficiais são fixadas por hash. Preparação usa contents:read; escrita de Pages/ID token fica no job final.
- O keep-alive permanece independente e sem credenciais administrativas.

Essas checagens não substituem revisão de código, proteção da conta GitHub ou rotação de uma credencial já exposta.

## CSP e campanha

O quiz permite scripts locais sem unsafe-eval e conexões somente ao próprio site e ao projeto Supabase configurado. A campanha usa wasm-unsafe-eval para o Pyodide existente, sem autoridade sobre o ranking.

A prévia da campanha sanitiza HTML, desabilita scripts e bloqueia rede e envio de formulários. Os controles locais não são uma autoridade remota de pontuação.

No Pages, a CSP é uma meta tag. frame-ancestors exige header HTTP e não é acrescentado como uma meta ineficaz. Os headers adicionais do servidor local não são uma garantia de headers iguais no Pages.

## Histórico e dados existentes

Ignorar privado/ não elimina os gabaritos do histórico Git local. A publicação usa uma cópia isolada e não conecta esse histórico ao repositório público. Com autorização do responsável, os dois ramos públicos são recriados com uma árvore limpa; as atualizações seguintes devem partir desses novos commits. Os dados do Supabase não são alterados.

A recriação dos ramos não desfaz clones, forks ou cópias anteriores e não garante a remoção imediata de objetos antigos retidos pelo GitHub. Conteúdo que já esteve público deve ser considerado conhecido. O workspace local conserva a manutenção e seus arquivos privados.

Testes de RLS, idempotência e contas diferentes usam PGlite local. SMTP, configuração administrativa e concorrência entre conexões reais exigem verificações próprias. Frontend e instalação de catálogo SQL são operações separadas.

Referências: [chaves Supabase](https://supabase.com/docs/guides/api/api-keys), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [segurança de Actions](https://docs.github.com/en/actions/reference/security/secure-use).
