# Validação — 07/10/2026

## Versão online limpa para o primeiro teste

- npm run validate: cinco mundos, oito fases e 210 questões válidos.
- npm test: 24 testes aprovados. Cobrem frontend online/Auth, áudio, cenários, contrato RPC, permissões e regras SQL. Os testes e módulos da versão local antiga foram removidos; a contagem anterior de 55 não se aplica mais.
- PostgreSQL via PGlite: RLS, recusa das nove RPCs para anon, auxiliares privadas inacessíveis, search_path fixo nas funções elevadas, isolamento entre contas e escrita direta de pontuação recusada.
- Sorteio/quotas, ausência de gabarito antes da resposta, IDs opacos, campanha de 85 questões, poderes, bônus, resgates e ranking. Chamadas repetidas não pagam novamente; catálogo alterado não modifica snapshots.
- Reset administrativo: jogador não pode executá-lo; remove perfis, partidas, respostas, progresso, histórico, recentes e conquistas por cascata; mantém 210 perguntas e 210 gabaritos; não seleciona contas sem perfil CodeQuizz; tokens antigos não consultam perfil/ranking. Novos perfis começam com zero XP/pontos, 100 moedas e nenhuma fase concluída.
- Limpeza do navegador: remove uma única vez apenas save/token antigos do jogo, preservando tokens novos e dados de outros aplicativos; armazenamento bloqueado não interrompe a inicialização por essa limpeza.
- Cadastro/login/recuperação via Auth simulado, saída e retomada do feedback. Reenvio somente após cadastro aceito com e-mail preenchido; login não confirmado mantém aviso na entrada.
- npm audit: zero vulnerabilidades conhecidas reportadas nas dependências de produção e desenvolvimento.
- Verificação remota sem sessão: nove RPCs e duas tabelas negam acesso anônimo, schema privado não exposto. Nenhuma conta ou dado remoto alterado pelo agente.
- Build copia lista exata de arquivos públicos, mantém licenças e insere CSP para scripts locais/conexão ao Supabase. Material administrativo e PDFs ficam em privado/, ignorada pelo Git. O histórico anterior ainda contém o catálogo; publique somente dist/ em repositório novo.

## Pendências externas

O reset remoto NÃO foi executado: não há conexão administrativa nem navegador conectado. Execute privado/supabase/preparar-primeiro-teste.sql uma vez como postgres no SQL Editor antes de novos cadastros; ele também aplica a proteção atualizada do ranking.

SMTP Brevo e confirmação de e-mail funcionando foram informados pelo usuário. Faltam conferir URLs finais do Pages, seed/permissões autenticadas no projeto hospedado, login/partida/recuperação reais, duas conexões concorrentes e layout/áudio/CSP/acessibilidade em navegador. PGlite usa uma conexão e os testes de frontend usam DOM/Auth simulados. Não foram validados resultados educacionais ou balanceamento com jogadores reais.

Procedimentos: [SUPABASE.md](SUPABASE.md). Revisão e limites de segurança: [SEGURANCA.md](SEGURANCA.md).
