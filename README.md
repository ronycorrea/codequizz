# CodeQuizz

Quiz educativo e campanha O Pôr do Sol.

- [Jogar](https://ronycorrea.github.io/codequizz/)
- [Campanha](https://ronycorrea.github.io/codequizz/campanha/) — exige login

Este repositório público guarda a distribuição compilada em gh-pages e a configuração de publicação em main. O workspace fonte, os gabaritos e os arquivos administrativos não são enviados a este repositório.

O workflow audita a lista exata de arquivos, os hashes SHA-256, a CSP e padrões de segredos antes do deploy. As Actions são fixadas por commit e as permissões de escrita ficam somente no job final.

- [Segurança](docs/SEGURANCA.md)
- [Publicação](docs/PUBLICACAO-PAGES.md)

O progresso e o ranking do quiz são conferidos no Supabase. Checkpoints da campanha ficam separados por conta neste dispositivo. A publicação não apaga contas ou partidas e não instala catálogos SQL automaticamente.
