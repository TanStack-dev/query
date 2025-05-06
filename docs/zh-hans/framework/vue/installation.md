---
source-updated-at: '2024-08-19T08:36:40.000Z'
translation-updated-at: '2025-05-06T05:25:47.547Z'
id: installation
title: 安装
---

## 安装

您可以通过 [NPM](https://npmjs.com) 安装 Vue Query。

### NPM

```bash
npm i @tanstack/vue-query
```

或

```bash
pnpm add @tanstack/vue-query
```

或

```bash
yarn add @tanstack/vue-query
```

或

```bash
bun add @tanstack/vue-query
```

> 想在下载前先体验一下？试试这个 [基础示例](../examples/basic) 吧！

Vue Query 兼容 Vue 2.x 和 3.x 版本

> 如果您使用的是 Vue 2.6，请确保同时安装 [@vue/composition-api](https://github.com/vuejs/composition-api)

### Vue Query 初始化

在使用 Vue Query 之前，您需要通过 `VueQueryPlugin` 进行初始化

```tsx
import { VueQueryPlugin } from '@tanstack/vue-query'

app.use(VueQueryPlugin)
```

### 在 `<script setup>` 中使用组合式 API

我们文档中的所有示例都使用了 [`<script setup>`](https://staging.vuejs.org/api/sfc-script-setup.html) 语法。

Vue 2 用户也可以通过 [这个插件](https://github.com/antfu/unplugin-vue2-script-setup) 使用该语法。请查看插件文档了解安装细节。

如果您不喜欢 `<script setup>` 语法，可以轻松将所有示例转换为普通的组合式 API 语法，只需将代码移至 `setup()` 函数中并返回模板中使用的值即可。

```vue
<script setup>
import { useQuery } from '@tanstack/vue-query'

const { isPending, isFetching, isError, data, error } = useQuery({
  queryKey: ['todos'],
  queryFn: getTodos,
})
</script>

<template>...</template>
```
