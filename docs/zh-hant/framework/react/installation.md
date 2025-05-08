---
source-updated-at: '2025-03-18T08:45:11.000Z'
translation-updated-at: '2025-05-08T20:16:52.988Z'
id: installation
title: 安裝
---

# 安裝

您可以透過 [NPM](https://npmjs.com/) 安裝 React Query，或是透過 [ESM.sh](https://esm.sh/) 使用傳統的 `<script>` 標籤引入。

### NPM

```bash
npm i @tanstack/react-query
```

或

```bash
pnpm add @tanstack/react-query
```

或

```bash
yarn add @tanstack/react-query
```

或

```bash
bun add @tanstack/react-query
```

React Query 相容於 React v18+ 版本，並可在 ReactDOM 和 React Native 環境中使用。

> 想在下載前試用看看嗎？試試 [simple](../examples/simple) 或 [basic](../examples/basic) 範例！

### CDN

如果您沒有使用模組打包工具或套件管理器，也可以透過 [ESM.sh](https://esm.sh/) 這類支援 ESM 的 CDN 來使用此函式庫。只需在 HTML 檔案底部加入 `<script type="module">` 標籤：

```html
<script type="module">
  import React from 'https://esm.sh/react@18.2.0'
  import ReactDOM from 'https://esm.sh/react-dom@18.2.0'
  import { QueryClient } from 'https://esm.sh/@tanstack/react-query'
</script>
```

> 您可以在 [這裡](https://react.dev/reference/react/createElement#creating-an-element-without-jsx) 找到不使用 JSX 來使用 React 的說明。

### 需求

React Query 針對現代瀏覽器進行了優化，相容於以下瀏覽器配置：

```
Chrome >= 91
Firefox >= 90
Edge >= 91
Safari >= 15
iOS >= 15
Opera >= 77
```

> 根據您的環境，可能需要加入 polyfill。如果您需要支援舊版瀏覽器，需自行從 `node_modules` 轉譯函式庫。

### 建議

建議同時使用我們的 [ESLint Plugin Query](../../eslint/eslint-plugin-query.md) 來幫助您在編碼時捕捉錯誤和不一致。您可以透過以下指令安裝：

```bash
npm i -D @tanstack/eslint-plugin-query
```

或

```bash
pnpm add -D @tanstack/eslint-plugin-query
```

或

```bash
yarn add -D @tanstack/eslint-plugin-query
```

或

```bash
bun add -D @tanstack/eslint-plugin-query
```
