---
source-updated-at: '2024-08-19T08:36:40.000Z'
translation-updated-at: '2025-05-08T20:15:42.275Z'
id: installation
title: 安裝
---

## 安裝

您可以透過 [NPM](https://npmjs.com) 安裝 Vue Query。

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

> 想在下載前試用看看嗎？試試這個 [基礎範例](../examples/basic)！

Vue Query 相容於 Vue 2.x 和 3.x

> 如果您使用的是 Vue 2.6，請確保同時設定 [@vue/composition-api](https://github.com/vuejs/composition-api)

### Vue Query 初始化

在使用 Vue Query 之前，您需要使用 `VueQueryPlugin` 進行初始化

```tsx
import { VueQueryPlugin } from '@tanstack/vue-query'

app.use(VueQueryPlugin)
```

### 搭配 `<script setup>` 使用組合式 API

我們文件中的所有範例都使用 [`<script setup>`](https://staging.vuejs.org/api/sfc-script-setup.html) 語法。

Vue 2 使用者也可以透過 [這個插件](https://github.com/antfu/unplugin-vue2-script-setup) 使用該語法。請查閱插件文件以獲取安裝詳情。

如果您不喜歡 `<script setup>` 語法，可以輕鬆將所有範例轉換為標準的組合式 API 語法，方法是將程式碼移至 `setup()` 函數中，並返回模板中使用的值。

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
