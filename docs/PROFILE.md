# Manutenção do perfil

O conteúdo e a identidade visual ficam em `profile.config.mjs`. O README é gerado: edite a configuração antes de reconstruí-lo.

Requer Node.js 22 ou superior.

```sh
npm ci
npm run profile:build
npm run profile:preview
```

Abra `preview/index.html` no navegador. A prévia aproxima a apresentação do Markdown do GitHub; o GitHub aplica sua própria sanitização e seu próprio layout.

## O que os scripts fazem

- `npm run assets:fetch`: pesquisa os GIFs na página original da NASA, seleciona a animação configurada e baixa fontes, licenças e os dez ícones SVG da stack. Guarda as fontes originais em `.cache/`.
- `npm run profile:build`: reaproveita o cache, compõe o GIF em 64 quadros, gera sua alternativa estática, desenha os cards e botões e recria o README. Busca apenas arquivos ausentes.
- `npm run profile:refresh`: baixa novamente as fontes externas e reconstrói todos os arquivos.
- `npm run profile:preview`: cria uma prévia HTML local do README existente.

Os arquivos publicados ficam em `assets/`. O perfil usa imagens locais: não depende de servidores de badges, GIFs ou estatísticas para ser exibido. Os scripts são ferramentas de geração; não precisam rodar no navegador do visitante. Nenhum comando faz commit, push ou publica mudanças.

O nome, função e localização também estão no texto alternativo do banner. O elemento `picture` seleciona versões próprias do banner e da stack em telas pequenas. Navegadores que indicam preferência por movimento reduzido recebem `hero.png` ou `hero-mobile.png`. Os cards têm largura fixa com limite da largura disponível, permitindo quebra natural de linha em telas menores.

## Direção visual

Carvão, branco e verde ácido; Space Grotesk nos títulos e IBM Plex Mono nos detalhes. A imagem astronômica foi convertida para monocromático e integrada a uma composição própria de tipografia e marcações técnicas. O texto mantém o foco em experiência, stack, dois projetos públicos e contato.

## Fontes e créditos

- **Animação:** [Black Hole Accretion Disk Visualization](https://svs.gsfc.nasa.gov/13326/), NASA’s Goddard Space Flight Center / Jeremy Schnittman. Arquivo `BH_AccretionDisk_Sim_Stationary_WebSize.gif`, adaptado em escala, cor e composição. [Diretrizes de uso da NASA](https://www.nasa.gov/nasa-brand-center/images-and-media/). Não há endosso da NASA ao perfil.
- **Ícones:** [Simple Icons](https://github.com/simple-icons/simple-icons), pacote fixado em `16.36.0`. Licença CC0 do conjunto em `assets/licenses/`; [informações das marcas e dos ícones](https://github.com/simple-icons/simple-icons/blob/develop/DISCLAIMER.md).
- **Space Grotesk:** [Google Fonts](https://github.com/google/fonts/tree/main/ofl/spacegrotesk), SIL Open Font License. Licença em `assets/licenses/Space-Grotesk-OFL.txt`.
- **IBM Plex Mono:** [Google Fonts](https://github.com/google/fonts/tree/main/ofl/ibmplexmono), SIL Open Font License. Licença em `assets/licenses/IBM-Plex-Mono-OFL.txt`.

`assets/sources.json` registra as URLs originais, tamanhos e hashes SHA-256 dos downloads. Os textos em SVG foram convertidos em curvas, preservando a tipografia sem carregar fontes externas.

O resumo do [Sentinel / GoPay Guard](https://github.com/andreodev/sentinel) foi baseado no README público. A descrição da [Ofixy](https://www.ofixy.com.br/) veio do site público, e a stack Next.js, PostgreSQL e Docker foi informada pelo autor. Seu código é privado, por isso o card aponta para o produto. FoodBox, Takusan, rest-go e port-main aparecem em links adicionais. Ajuste os destaques em `projects` e os demais links em `moreProjects`. Experiências profissionais e tecnologias foram preservadas do README anterior.

Para incluir uma tecnologia, acrescente seu nome e o slug oficial em `stack` e execute a geração. A composição atual tem duas linhas de cinco tecnologias; reorganize `buildStack()` caso aumente essa quantidade.
