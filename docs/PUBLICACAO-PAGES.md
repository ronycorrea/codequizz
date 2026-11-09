# Publicação no GitHub Pages

Site: https://ronycorrea.github.io/codequizz/

Campanha: https://ronycorrea.github.io/codequizz/campanha/

gh-pages contém somente a distribuição pública. main guarda a configuração de publicação e verificadores independentes; não é uma cópia do histórico deste workspace.

## Preparar

```sh
npm run validate
npm test
npm run typecheck:campaign
npm run typecheck:e2e
npm run build
npm run verify:dist
```

O build executa a inspeção dos fontes e gera release-manifest.json. A auditoria confere lista exata, hashes, configuração pública, padrões de segredos e CSP. O catálogo privado é comparado localmente com o bundle.

## Enviar e publicar

1. Use uma cópia isolada do remoto. Não faça push deste workspace nem do seu histórico.
2. Atualize gh-pages somente com os arquivos auditados de dist/.
3. Atualize security/public-files.json em main com a mesma lista aprovada, junto dos verificadores/workflow quando necessário.
4. O workflow Publicar CodeQuizz audita o artefato antes do deploy. Também pode ser iniciado em Actions por Run workflow.
5. Confira o job, as duas URLs e os hashes do manifesto servido.

A preparação usa contents:read. pages:write e id-token:write ficam somente no deploy. A árvore publicada é a mesma que foi auditada. Actions são fixadas por commit.

## Preservação

O keep-alive é independente. Publicar o site não exige mudar seus secrets ou apagar contas, pontos e partidas.

As 12 questões novas em revisão possuem pacote SQL separado. Publicar o frontend mantém compatibilidade com questões já instaladas e não ativa esse catálogo no banco. Veja [QUESTOES-ESCRITAS-REVISAO.md](QUESTOES-ESCRITAS-REVISAO.md).

Checkpoints da campanha são locais por UUID. Login real, entrega de e-mails e concorrência do banco precisam de verificação própria.
