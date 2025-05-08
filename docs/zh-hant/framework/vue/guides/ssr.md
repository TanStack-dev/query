---
source-updated-at: '2024-09-01T21:12:58.000Z'
translation-updated-at: '2025-05-08T20:18:57.153Z'
id: ssr
title: SSR 與 Nuxt
---

Vue Query 支援在伺服器端預先擷取多個查詢，並將這些查詢 _脫水 (dehydrate)_ 至 queryClient。這表示伺服器可以預先渲染頁面載入時立即可見的標記，一旦 JS 準備就緒，Vue Query 就能使用函式庫的完整功能來升級或 _水合 (hydrate)_ 這些查詢。這包括在客戶端重新擷取那些自伺服器渲染後已過時的查詢。

## 使用 Nuxt.js

### Nuxt 3

首先在 `plugins` 目錄下建立 `vue-query.ts` 檔案，內容如下：

```ts
import type {
  DehydratedState,
  VueQueryPluginOptions,
} from '@tanstack/vue-query'
import {
  VueQueryPlugin,
  QueryClient,
  hydrate,
  dehydrate,
} from '@tanstack/vue-query'
// Nuxt 3 app aliases
import { defineNuxtPlugin, useState } from '#imports'

export default defineNuxtPlugin((nuxt) => {
  const vueQueryState = useState<DehydratedState | null>('vue-query')

  // 在此修改你的 Vue Query 全域設定
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 5000 } },
  })
  const options: VueQueryPluginOptions = { queryClient }

  nuxt.vueApp.use(VueQueryPlugin, options)

  if (import.meta.server) {
    nuxt.hooks.hook('app:rendered', () => {
      vueQueryState.value = dehydrate(queryClient)
    })
  }

  if (import.meta.client) {
    hydrate(queryClient, vueQueryState.value)
  }
})
```

現在你可以使用 `onServerPrefetch` 在頁面中預先擷取資料。

- 使用 `queryClient.prefetchQuery` 或 `suspense` 預先擷取所有需要的查詢

```ts
export default defineComponent({
  setup() {
    const { data, suspense } = useQuery({
      queryKey: ['test'],
      queryFn: fetcher,
    })

    onServerPrefetch(async () => {
      await suspense()
    })

    return { data }
  },
})
```

### Nuxt 2

首先在 `plugins` 目錄下建立 `vue-query.js` 檔案，內容如下：

```js
import Vue from 'vue'
import { VueQueryPlugin, QueryClient, hydrate } from '@tanstack/vue-query'

export default (context) => {
  // 在此修改你的 Vue Query 全域設定
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 5000 } },
  })

  if (process.server) {
    context.ssrContext.VueQuery = queryClient
  }

  if (process.client) {
    Vue.use(VueQueryPlugin, { queryClient })

    if (context.nuxtState && context.nuxtState.vueQueryState) {
      hydrate(queryClient, context.nuxtState.vueQueryState)
    }
  }
}
```

將此插件加入你的 `nuxt.config.js`

```js
module.exports = {
  ...
  plugins: ['~/plugins/vue-query.js'],
}
```

現在你可以使用 `onServerPrefetch` 在頁面中預先擷取資料。

- 使用 `useContext` 取得 nuxt 上下文
- 使用 `useQueryClient` 取得伺服器端的 `queryClient` 實例
- 使用 `queryClient.prefetchQuery` 或 `suspense` 預先擷取所有需要的查詢
- 將 `queryClient` 脫水至 `nuxtContext`

```vue
// pages/todos.vue
<template>
  <div>
    <button @click="refetch">Refetch</button>
    <p>{{ data }}</p>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  onServerPrefetch,
  useContext,
} from '@nuxtjs/composition-api'
import { useQuery, useQueryClient, dehydrate } from '@tanstack/vue-query'

export default defineComponent({
  setup() {
    // 從 SSR 上下文或 Vue 上下文中取得 QueryClient
    const { ssrContext } = useContext()
    // 確保在 `useQuery` 呼叫中提供 `queryClient` 作為第二個參數
    const queryClient =
      (ssrContext != null && ssrContext.VueQuery) || useQueryClient()

    // 這將在伺服器端預先擷取並發送
    const { data, refetch, suspense } = useQuery(
      {
        queryKey: ['todos'],
        queryFn: getTodos,
      },
      queryClient,
    )
    // 這不會預先擷取，而是在客戶端開始擷取
    const { data2 } = useQuery(
      {
        queryKey: 'todos2',
        queryFn: getTodos,
      },
      queryClient,
    )

    onServerPrefetch(async () => {
      await suspense()
      ssrContext.nuxt.vueQueryState = dehydrate(queryClient)
    })

    return {
      refetch,
      data,
    }
  },
})
</script>
```

如範例所示，可以預先擷取部分查詢，並讓其他查詢在 queryClient 上擷取。這表示你可以透過為特定查詢新增或移除 `prefetchQuery` 或 `suspense` 來控制伺服器渲染的內容。

## 使用 Vite SSR

將 VueQuery 客戶端狀態與 [vite-ssr](https://github.com/frandiox/vite-ssr) 同步，以便在 DOM 中序列化：

```js
// main.js (入口點)
import App from './App.vue'
import viteSSR from 'vite-ssr/vue'
import {
  QueryClient,
  VueQueryPlugin,
  hydrate,
  dehydrate,
} from '@tanstack/vue-query'

export default viteSSR(App, { routes: [] }, ({ app, initialState }) => {
  // -- 這是 Vite SSR 的主要鉤子，每個請求呼叫一次

  // 建立一個新的 VueQuery 客戶端
  const queryClient = new QueryClient()

  // 將 initialState 與客戶端狀態同步
  if (import.meta.env.SSR) {
    // 指示如何在 SSR 期間存取和序列化 VueQuery 狀態
    initialState.vueQueryState = { toJSON: () => dehydrate(queryClient) }
  } else {
    // 在瀏覽器中重用現有狀態
    hydrate(queryClient, initialState.vueQueryState)
  }

  // 掛載並將客戶端提供給應用程式元件
  app.use(VueQueryPlugin, { queryClient })
})
```

然後，使用 Vue 的 `onServerPrefetch` 在任何元件中呼叫 VueQuery：

```html
<!-- MyComponent.vue -->
<template>
  <div>
    <button @click="refetch">Refetch</button>
    <p>{{ data }}</p>
  </div>
</template>

<script setup>
  import { useQuery } from '@tanstack/vue-query'
  import { onServerPrefetch } from 'vue'

  // 這將在伺服器端預先擷取並發送
  const { refetch, data, suspense } = useQuery({
    queryKey: ['todos'],
    queryFn: getTodos,
  })

  onServerPrefetch(suspense)
</script>
```

## 提示、技巧與注意事項

### 僅成功的查詢會包含在脫水過程中

任何有錯誤的查詢會自動排除在脫水過程之外。這表示預設行為是假裝這些查詢從未在伺服器上載入，通常會顯示載入狀態，並在 queryClient 上重試查詢。無論錯誤為何，都會發生這種情況。

有時這種行為並不理想，你可能希望在特定錯誤或查詢時渲染帶有正確狀態碼的錯誤頁面。在這些情況下，使用 `fetchQuery` 並捕獲任何錯誤以手動處理。

### 過時性是從查詢在伺服器上擷取時開始計算

查詢是否過時取決於 `dataUpdatedAt` 的時間。這裡需要注意的是，伺服器需要有正確的時間才能正常工作，但使用的是 UTC 時間，因此時區不會影響這一點。

由於 `staleTime` 預設為 `0`，查詢預設會在頁面載入時在背景重新擷取。你可能希望使用較高的 `staleTime` 來避免這種雙重擷取，特別是如果你沒有快取標記。

這種過時查詢的重新擷取非常適合在 CDN 中快取標記！你可以將頁面本身的快取時間設置得較高，以避免在伺服器上重新渲染頁面，但將查詢的 `staleTime` 設置得較低，以確保在用戶訪問頁面時立即在背景重新擷取資料。也許你想將頁面快取一週，但如果資料超過一天，則在頁面載入時自動重新擷取？

### 伺服器上的高記憶體消耗

如果你為每個請求建立 `QueryClient`，Vue Query 會為此客戶端建立隔離的快取，該快取會在 `gcTime` 期間保留在記憶體中。如果在該期間內有大量請求，可能會導致伺服器上的高記憶體消耗。

在伺服器上，`gcTime` 預設為 `Infinity`，這會停用手動垃圾回收，並在請求完成後自動清除記憶體。如果你明確設置了非 Infinity 的 `gcTime`，則需要負責提前清除快取。

為了在不再需要時清除快取並降低記憶體消耗，你可以在請求處理完畢並將脫水狀態發送到客戶端後，呼叫 [`queryClient.clear()`](../../../../reference/QueryClient/#queryclientclear)。

或者，你可以設置較小的 `gcTime`。
