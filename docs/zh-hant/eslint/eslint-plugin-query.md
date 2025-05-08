---
source-updated-at: '2025-04-07T09:17:45.000Z'
translation-updated-at: '2025-05-08T20:15:17.659Z'
id: eslint-plugin-query
title: ESLint 插件 Query
---

TanStack Query 提供了專屬的 ESLint 插件。此插件用於強制執行最佳實踐，並幫助您避免常見錯誤。

## 安裝

該插件是一個獨立套件，需另行安裝：

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

## 扁平化設定 (`eslint.config.js`)

### 推薦設定

若要啟用所有推薦規則，請加入以下設定：

```js
import pluginQuery from '@tanstack/eslint-plugin-query'

export default [
  ...pluginQuery.configs['flat/recommended'],
  // 其他設定...
]
```

### 自訂設定

或者，您可以載入插件並僅配置想使用的規則：

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
  // 其他設定...
]
```

## 傳統設定 (`.eslintrc`)

### 推薦設定

若要啟用所有推薦規則，請在 `extends` 中加入 `plugin:@tanstack/query/recommended`：

```json
{
  "extends": ["plugin:@tanstack/query/recommended"]
}
```

### 自訂設定

或者，在 `plugins` 區塊加入 `@tanstack/query`，並配置想使用的規則：

```json
{
  "plugins": ["@tanstack/query"],
  "rules": {
    "@tanstack/query/exhaustive-deps": "error"
  }
}
```

## 規則

- [@tanstack/query/exhaustive-deps](./exhaustive-deps.md)
- [@tanstack/query/no-rest-destructuring](./no-rest-destructuring.md)
- [@tanstack/query/stable-query-client](./stable-query-client.md)
- [@tanstack/query/no-unstable-deps](./no-unstable-deps.md)
- [@tanstack/query/infinite-query-property-order](./infinite-query-property-order.md)
- [@tanstack/query/no-void-query-fn](./no-void-query-fn.md)
