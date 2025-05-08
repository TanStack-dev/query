---
source-updated-at: '2024-04-02T22:46:31.000Z'
translation-updated-at: '2025-05-08T20:17:51.394Z'
id: suspense
title: Suspense
---

> 注意：Vue Query 的 Suspense 模式目前處於實驗階段，與 Vue 本身的 Suspense 功能相同。這些 API 將會變更，除非您將 Vue 和 Vue Query 的版本鎖定在相互兼容的修補版本，否則不應在生產環境中使用。

Vue Query 也能與 Vue 的新 [Suspense](https://vuejs.org/guide/built-ins/suspense.html) API 搭配使用。

為此，您需要使用 Vue 提供的 `Suspense` 元件來包裹您的可暫停元件 (suspendable component)。

```vue
<script setup>
import SuspendableComponent from './SuspendableComponent.vue'
</script>

<template>
  <Suspense>
    <template #default>
      <SuspendableComponent />
    </template>
    <template #fallback>
      <div>Loading...</div>
    </template>
  </Suspense>
</template>
```

並將可暫停元件中的 `setup` 函式改為 `async`。接著您就能使用 `vue-query` 提供的非同步 `suspense` 函式。

```vue
<script>
import { defineComponent } from 'vue'
import { useQuery } from '@tanstack/vue-query'

const todoFetcher = async () =>
  await fetch('https://jsonplaceholder.cypress.io/todos').then((response) =>
    response.json(),
  )
export default defineComponent({
  name: 'SuspendableComponent',
  async setup() {
    const { data, suspense } = useQuery(['todos'], todoFetcher)
    await suspense()

    return { data }
  },
})
</script>
```

## 渲染時擷取 (Fetch-on-render) vs 隨擷取隨渲染 (Render-as-you-fetch)

預設情況下，Vue Query 在 `suspense` 模式下無需額外配置，就能完美作為**渲染時擷取 (Fetch-on-render)** 解決方案。這意味著當您的元件嘗試掛載時，它們會觸發查詢擷取並暫停，但只有在您導入並掛載它們後才會執行。如果您想進一步提升並實現**隨擷取隨渲染 (Render-as-you-fetch)** 模式，我們建議在路由回調和/或用戶互動事件上實作[預擷取 (Prefetching)](../prefetching)，以便在元件掛載前開始載入查詢，甚至能在您開始導入或掛載其父元件之前就進行。
