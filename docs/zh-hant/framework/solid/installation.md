---
source-updated-at: '2024-08-19T08:36:40.000Z'
translation-updated-at: '2025-05-08T20:15:59.011Z'
id: installation
title: 安裝
---

# 安裝 (Installation)

您可以透過 [NPM](https://npmjs.com/) 安裝 Solid Query，或是使用傳統的 `<script>` 標籤透過 [ESM.sh](https://esm.sh/) 引入。

### NPM

```bash
npm i @tanstack/solid-query
```

或

```bash
pnpm add @tanstack/solid-query
```

或

```bash
yarn add @tanstack/solid-query
```

或

```bash
bun add @tanstack/solid-query
```

> 想在下載前試用看看嗎？試試 [simple](../examples/simple) 或 [basic](../examples/basic) 範例！

### CDN

如果您沒有使用模組打包工具或套件管理器，也可以透過支援 ESM 的 CDN 如 [ESM.sh](https://esm.sh/) 來使用這個函式庫。只需在 HTML 檔案底部加入 `<script type="module">` 標籤：

```html
<script type="module">
  import { QueryClient } from 'https://esm.sh/@tanstack/solid-query'
</script>
```

### 需求 (Requirements)

Solid Query 針對現代瀏覽器進行了優化，相容於以下瀏覽器配置：

```
Chrome >= 91
Firefox >= 90
Edge >= 91
Safari >= 15
iOS >= 15
Opera >= 77
```

> 根據您的環境，可能需要加入 polyfill。如果您需要支援舊版瀏覽器，需自行從 `node_modules` 轉譯函式庫。
