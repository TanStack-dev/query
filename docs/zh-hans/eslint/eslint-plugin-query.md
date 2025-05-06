---
source-updated-at: '2025-03-30T12:48:40.000Z'
translation-updated-at: '2025-05-06T03:48:42.197Z'
id: eslint-plugin-query
title: ESLint 插件 Query
---
TanStack Query 提供了专属的 ESLint 插件。该插件用于强制执行最佳实践，并帮助您避免常见错误。

## 安装

该插件是一个独立包，需要单独安装：

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

## 扁平化配置 (`eslint.config.js`)

### 推荐配置

要启用所有推荐规则，请添加以下配置：

```js
import pluginQuery from '@tanstack/eslint-plugin-query'

export default [
  ...pluginQuery.configs['flat/recommended'],
  // 其他配置...
]
```

### 自定义配置

您也可以单独加载插件并仅配置需要的规则：

```js
import pluginQuery from '@tanstack/eslint-plugin-query'

export default [
  {
    plugins: {
      '@tanstack/query': pluginQuery,
    },
    rules: {
      '@tanstack/query/exhaustive-deps': 'error',
    },
  },
  // 其他配置...
]
```

## 传统配置 (`.eslintrc`)

### 推荐配置

要启用所有推荐规则，请在 extends 中添加 `plugin:@tanstack/query/recommended`：

```json
{
  "extends": ["plugin:@tanstack/query/recommended"]
}
```

### 自定义配置

或在 plugins 部分添加 `@tanstack/query`，并配置所需规则：

```json
{
  "plugins": ["@tanstack/query"],
  "rules": {
    "@tanstack/query/exhaustive-deps": "error"
  }
}
```

## 规则列表

- [@tanstack/query/exhaustive-deps](./exhaustive-deps.md)
- [@tanstack/query/no-rest-destructuring](./no-rest-destructuring.md)
- [@tanstack/query/stable-query-client](./stable-query-client.md)
- [@tanstack/query/no-unstable-deps](./no-unstable-deps.md)
- [@tanstack/query/infinite-query-property-order](./infinite-query-property-order.md)
