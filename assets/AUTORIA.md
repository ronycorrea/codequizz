# Autoria dos elementos do CodeQuizz

| Material | Local | Origem e finalidade |
| --- | --- | --- |
| Marca tipográfica | `js/game-art.js`, CSS | Composição em texto com sombras coloridas e formas sobrepostas, inspirada nos protótipos do autor |
| Regiões e construções | `js/game-art.js`, função `regionArt` | Cinco ilustrações SVG originais para a campanha |
| Personagens de corpo inteiro | `js/game-art.js`, função `character` | Explorador e androide em SVG com estados de resposta e movimento opcional |
| Medalhas | `js/game-art.js`, função `medal` | Desenhos SVG originais de bronze, prata e ouro |
| Cenários por mundo | `js/world-background.js`, `css/worlds.css` | Construções, redes, experimentos e portais originais desenhados com CSS, baseados nas direções visuais da seção 3 do GDD; sem arquivos de imagem externos |
| Fundo das telas gerais | `js/world-background.js`, `css/worlds.css` | Composição original dos cinco cenários, distribuídos pelas bordas e combinados com gradientes suaves; reutiliza as formas CSS do projeto |
| Fonte Lilita One | `assets/fonts/LilitaOne-Regular.ttf` | Juan Montoreano, 2011; obtida no repositório oficial Google Fonts; licença SIL OFL 1.1 em `assets/fonts/OFL-LilitaOne.txt` |
| Dois avatares em pixels | `js/ui.js`, função `avatar` | Desenhos SVG originais para os perfis; sem atributos de jogo |
| Ícones | `js/ui.js`, catálogo `paths` | Traços SVG originais para navegação e ações |
| Favicon | `assets/icons/favicon.svg` | Desenho original com símbolo de código |
| Música e sons | `js/audio.js` | Composição original em ré menor, a 112 BPM, com melodia, acordes, baixo e percussão sintetizados; efeitos originais por ação, sem gravações ou bibliotecas externas |

As cores, mundos e a combinação de elementos digitais seguem os protótipos do GDD e os dez PNGs fornecidos pelo autor. Os screenshots não foram recortados nem reutilizados como assets da interface. CodeCombat é uma referência de organização da campanha; nenhuma imagem ou música dele foi utilizada. Fonte e licença: https://github.com/google/fonts/tree/main/ofl/lilitaone.

Os elementos originais foram criados para este projeto na presente implementação. A escolha de uma licença geral para distribuição do repositório permanece com o autor do projeto.

## Campanha O Pôr do Sol

O novo emblema da capa em `assets/campaign/codequizz-emblem.png` foi fornecido pelo responsável como `Emblema Futurista CodeQuizz.png`. A imagem original foi preservada, incluindo a transparência, e substitui apenas a ilustração da capa da campanha.

O cenário industrial em `assets/campaign/` foi fornecido pelo responsável no arquivo Figma e reutilizado na direção aprovada de Meridiana. A foto de Lia importada junto ao protótipo foi substituída por um retrato vetorial original na mesma biblioteca dos demais personagens; a foto não é distribuída pelo jogo. Os módulos de energia são SVGs originais desta implementação. Os retratos de San, Yuna, Lia, Buster, Nilo, Cora e Helena estão em `js/narrative-art.ts`. As fontes Space Grotesk e JetBrains Mono acompanham suas licenças OFL na mesma pasta.

A arte procedural da abertura, adaptada em `js/narrative-cutscene-art.js`, deriva do pacote `custcenas.rar` enviado pelo responsável. O novo reprodutor usa Canvas 2D e não inclui as dependências PixiJS ou GSAP do piloto. O ícone `assets/icons/campaign.svg`, as transições CSS e os efeitos sintetizados da campanha também são originais. Os personagens e a história são adaptados do documento de design fornecido pelo responsável pelo projeto. Nenhum asset dos jogos de referência foi reutilizado. As vozes gravadas ainda serão escolhidas e produzidas.

As aberturas de Forte Alamut, PAGEM, Dimensão e Laboratório 22 e o encerramento estendem essa arte com sete ambientes procedurais originais: fortaleza, acervo, estação temporal, pátio de 2026, transmissão, fotografia e nuvens. Eles usam primitivas Canvas do piloto aprovado, sem novas imagens, bibliotecas ou licenças externas. Os cards das cutscenes reutilizam os mesmos perfis vetoriais dos diálogos jogáveis, incluindo Lia.

O cenário `assets/campaign/forte-alamut-base.png` foi gerado para a segunda fase com a ferramenta integrada `image_gen`. O prompt e a origem estão em `assets/campaign/forte-alamut-README.md`. A porta, os indicadores, a rota, a fotografia e os estados narrativos são elementos separados em `js/narrative-alamut-art.ts` e `css/narrative-alamut.css`. Os retratos reutilizam a biblioteca da campanha.

O cenário `assets/campaign/pagem-base.png` foi gerado para a terceira fase com a ferramenta integrada `image_gen.imagegen`. O prompt final, a ferramenta e a origem estão em [pagem-README.md](campaign/pagem-README.md). A composição do arquivo histórico, a comparação de relatórios, os avisos e os resultados são elementos separados em `js/narrative-pagem-art.ts` e `css/narrative-pagem.css`. A fotografia e os retratos reutilizam os elementos existentes da campanha.

O cenário `assets/campaign/dimensao-base.png` foi gerado para a quarta fase com a ferramenta integrada `image_gen.imagegen`. O prompt final, a ferramenta e a origem estão em [dimensao-README.md](campaign/dimensao-README.md). A estação é um ambiente de pesquisa temporal sob uma usina desativada; o aro, os medidores, a fotografia, o estojo e a travessia são elementos separados em `js/narrative-dimensao-art.ts` e `css/narrative-dimensao.css`. O console espelha o HTML e o CSS do jogador em um iframe isolado. Os retratos reutilizam a biblioteca existente, com Yuna em aparência humana.

O cenário `assets/campaign/laboratorio-22-base.png` foi criado com a ferramenta integrada `image_gen.imagegen`; o prompt final e a origem estão em [laboratorio-22-README.md](campaign/laboratorio-22-README.md). O ambiente luminoso de 2026 não contém personagens ou controles. Equipamentos, despertar e transmissões são elementos separados da imagem. O epílogo reutiliza Meridiana.

CodeMirror e Pyodide são dependências de software, com licenças reunidas em `assets/campaign-licenses.txt`. A biblioteca padrão do Python é distribuída sem alteração de conteúdo, sob o nome de transporte `python_stdlib.data`.
