# Calendario PWA (Calendario Anglo)

Aplicação React + Vite para visualização de calendário acadêmico em formato **ano**, **mês**, **dia** e **detalhe de evento**, com suporte a **PWA**, cache em **Service Worker** e cache local em **IndexedDB**.

## Stack

- React 19 + TypeScript
- Vite 7
- Tailwind CSS
- Framer Motion
- ESLint 9
- vite-plugin-pwa
- IndexedDB (cache local de eventos)

## Requisitos

- Node.js 20+ (recomendado)
- npm

## Instalação

```bash
npm ci
```

## Scripts

```bash
npm run dev      # ambiente de desenvolvimento
npm run build    # build de produção (tsc + vite)
npm run lint     # lint com ESLint
npm run preview  # preview local do build
```

## Estrutura do projeto

```text
src/
  app/                    # composição principal da aplicação
  components/common/      # componentes compartilhados de UI
  features/
    year/                 # visualização anual
    month/                # visualização mensal
    day/                  # visualização diária
    event/                # detalhe de evento
  shared/
    hooks/                # hooks reutilizáveis
    services/             # integração com API e cache
    types/                # tipagens e constantes de domínio
    utils/                # funções utilitárias de data/evento
```

## Fluxo de navegação

O estado principal fica em `src/app/App.tsx` e controla os níveis:

- `year_list`
- `month_detail`
- `day_detail`
- `event_detail`

Também controla:

- tema claro/escuro (com persistência em `localStorage`)
- orientação (`portrait`/`landscape`)
- transições com Framer Motion

## Dados e API

As chamadas estão em `src/shared/services`:

- `apiCache.ts`: serviço principal com busca por intervalo + revalidação por ETag
- `eventCacheIDB.ts`: cache em IndexedDB com expiração
- `apiNoCache.ts`: alternativa sem cache

### Endpoint esperado

O app espera uma API com rotas como:

- `GET /api/events_list_cache?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`
- `GET /events_list`
- `POST /events_create`
- `GET /health`

> Observação: as URLs base estão hardcoded nos arquivos de serviço e devem ser ajustadas para o ambiente em uso.

## PWA e cache

Configurado em `vite.config.ts` com `vite-plugin-pwa`:

- estratégia `generateSW`
- registro `autoUpdate`
- cache de runtime para API e healthcheck

## Estado atual conhecido

- Não há suíte de testes automatizados no `package.json`.
- `npm run build` está funcionando.
- `npm run lint` apresenta erros já existentes no código-base.

## Branches revisadas (codex excluídas)

As branches abaixo foram lidas no remoto, excluindo explicitamente branches `codex/*`:

- `master` — base atual (mesmo commit da branch `copilot/add-project-documentation` neste momento).
- `agenda1.1` — evolução inicial com muitas alterações estruturais e README padrão do template Vite.
- `agenda2.0` — continuação da evolução visual, também com README padrão do template Vite.
- `agenda3.0` — versão posterior com reorganização de componentes e merge de otimizações.
- `copilot/add-documentation-for-repository` — branch focada em documentação (README completo).
- `copilot/add-project-documentation` — branch de trabalho atual.
