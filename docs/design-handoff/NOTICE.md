# NOTICE — este diretório está fora da licença MIT do repositório

O [`LICENSE`](../../LICENSE) da raiz é MIT e vale para o código escrito para o
`plano-b-digital` (`app/`, `backend/`, scripts e documentação do projeto). Ele
**não** vale para `docs/design-handoff/`.

## Por quê

`docs/design-handoff/` é o pacote de design entregue ao projeto, não código
produzido nele. Dentro dele, o diretório

```
src/_ds/ana-paula-fi-rio-design-system-6bd756eb-b104-4801-a60a-2c658330a1d1/
```

é um **design system de autoria de Ana Paula Fiório** — 305 KB entre
`_ds_bundle.js` e os tokens CSS. Está aqui porque
`src/Plano B Digital.dc.html` o carrega: sem ele o protótipo não abre com a
aparência original.

O pacote veio **sem arquivo de licença**. Sem concessão explícita, valem os
direitos autorais da autora, e não há como o MIT deste repositório conceder
sobre esse material o "use, copy, modify, merge, publish, distribute,
sublicense, and/or sell" que ele concede sobre o resto.

## O que isso significa na prática

- **Todos os direitos reservados aos autores originais** dentro deste diretório.
- Os arquivos ficam versionados apenas como **referência de design** do projeto.
- Quem quiser usar o design system fora daqui deve falar com a autora. Não
  extraia `_ds_bundle.js` nem os tokens contando com o MIT da raiz.

Os **valores** de design descritos no [`README.md`](README.md) deste diretório
(cores, tipografia, espaçamentos, textos da interface) foram recriados no código
do app, como o próprio handoff instrui — o que está excluído do MIT é o pacote
de arquivos deste diretório, não a aparência do produto.
