---
source-updated-at: '2025-03-18T08:45:11.000Z'
translation-updated-at: '2025-05-06T04:26:26.668Z'
id: installation
title: 安装
---
# 安装

您可以通过 [NPM](https://npmjs.com/) 安装 React Query，或者通过 [ESM.sh](https://esm.sh/) 使用传统的 `<script>` 标签引入。

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

React Query 兼容 React v18+ 版本，支持 ReactDOM 和 React Native。

> 想在下载前试用一下？试试 [简单示例](../examples/simple) 或 [基础示例](../examples/basic)！

### CDN

如果您不使用模块打包工具或包管理器，也可以通过 ESM 兼容的 CDN 如 [ESM.sh](https://esm.sh/) 来使用该库。只需在 HTML 文件底部添加一个 `<script type="module">` 标签：

```html
<script type="module">
  import React from 'https://esm.sh/react@18.2.0'
  import ReactDOM from 'https://esm.sh/react-dom@18.2.0'
  import { QueryClient } from 'https://esm.sh/@tanstack/react-query'
</script>
```

> 您可以在 [这里](https://react.dev/reference/react/createElement#creating-an-element-without-jsx) 找到不使用 JSX 来使用 React 的说明。

### 环境要求

React Query 针对现代浏览器进行了优化，兼容以下浏览器配置：

```
Chrome >= 91
Firefox >= 90
Edge >= 91
Safari >= 15
iOS >= 15
Opera >= 77
```

> 根据您的环境，可能需要添加 polyfill。如果需要支持旧版浏览器，您需要自行转译 `node_modules` 中的库文件。

### 推荐配置

建议同时使用我们的 [ESLint Plugin Query](../../eslint/eslint-plugin-query.md) 来帮助您在编码时发现错误和不一致。可通过以下命令安装：

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
