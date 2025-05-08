---
source-updated-at: '2025-04-03T21:54:40.000Z'
translation-updated-at: '2025-05-08T20:19:10.251Z'
id: suspense
title: Suspense
---

Solid Query 也能與 Solid 的 [Suspense](https://docs.solidjs.com/reference/components/suspense) API 搭配使用。

要實現這點，你需要用 Vue 提供的 `Suspense` 元件包裹可暫停 (suspendable) 的元件：

```tsx
import { Suspense } from 'solid-js'
;<Suspense fallback={<LoadingSpinner />}>
  <SuspendableComponent />
</Suspense>
```

你可以使用 `solid-query` 提供的非同步 `suspense` 函式：

```vue
<script>
import { defineComponent } from 'vue'
import { useQuery } from '@tanstack/solid-query'

const todoFetcher = async () =>
  await fetch('https://jsonplaceholder.cypress.io/todos').then((response) =>
    response.json(),
  )
export default defineComponent({
  name: 'SuspendableComponent',
  async setup() {
    const { data, suspense } = useQuery(() => ['todos'], todoFetcher)
    await suspense()

    return { data }
  },
})
</script>
```

## 渲染時擷取 (Fetch-on-render) vs 隨擷取隨渲染 (Render-as-you-fetch)

開箱即用，Solid Query 在 `suspense` 模式下作為**渲染時擷取 (Fetch-on-render)** 解決方案表現出色，無需額外配置。這意味著當你的元件嘗試掛載時，它們會觸發查詢擷取並暫停，但僅在你導入並掛載它們後才會發生。如果你想更進一步，實現**隨擷取隨渲染 (Render-as-you-fetch)** 模式，我們建議在路由回調和/或用戶互動事件上實作[預擷取 (Prefetching)](../prefetching)，以便在元件掛載前就開始載入查詢，甚至可以在導入或掛載其父元件之前就開始。
