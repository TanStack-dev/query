---
source-updated-at: '2024-08-19T08:36:40.000Z'
translation-updated-at: '2025-05-06T05:16:47.879Z'
id: installation
title: 安装
---
# 安装

你可以通过 [NPM](https://npmjs.com/) 安装 Solid Query，或者通过 [ESM.sh](https://esm.sh/) 使用传统的 `<script>` 标签引入。

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

> 想在下载前先试用一下？可以尝试 [simple](../examples/simple) 或 [basic](../examples/basic) 示例！

### CDN

如果你没有使用模块打包工具或包管理器，也可以通过 [ESM.sh](https://esm.sh/) 这类兼容 ESM 的 CDN 来使用该库。只需在 HTML 文件底部添加一个 `<script type="module">` 标签：

```html
<script type="module">
  import { QueryClient } from 'https://esm.sh/@tanstack/solid-query'
</script>
```

### 环境要求

Solid Query 针对现代浏览器进行了优化，兼容以下浏览器配置：

```
Chrome >= 91
Firefox >= 90
Edge >= 91
Safari >= 15
iOS >= 15
Opera >= 77
```

> 根据你的运行环境，可能需要添加 polyfill。如果需要支持旧版浏览器，你需要自行从 `node_modules` 转译该库。
