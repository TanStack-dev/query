---
source-updated-at: '2024-04-02T22:46:31.000Z'
translation-updated-at: '2025-05-08T20:15:48.998Z'
id: overview
title: SSR 與 SvelteKit
---

## 設定

SvelteKit 預設會使用伺服器渲染 (SSR) 來渲染路由。因此，你需要在伺服器端停用查詢 (query)。否則，你的查詢會繼續在伺服器端非同步執行，即使在 HTML 已經傳送到客戶端之後也是如此。

推薦的做法是在 `QueryClient` 物件中使用 SvelteKit 的 `browser` 模組。這不會停用 `queryClient.prefetchQuery()`，該方法會在以下其中一種解決方案中使用。

**src/routes/+layout.svelte**

```svelte
<script lang="ts">
  import { browser } from '$app/environment'
  import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query'

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        enabled: browser,
      },
    },
  })
</script>

<QueryClientProvider client={queryClient}>
  <slot />
</QueryClientProvider>
```

## 預先取得資料

Svelte Query 支援兩種在伺服器端預先取得資料並透過 SvelteKit 傳遞給客戶端的方式。

如果你想查看理想的 SSR 設定，請參考 [SSR 範例](../examples/ssr)。

### 使用 `initialData`

結合 SvelteKit 的 [`load`](https://kit.svelte.dev/docs/load)，你可以將伺服器端載入的資料傳遞給 `createQuery` 的 `initialData` 選項：

**src/routes/+page.ts**

```ts
export async function load() {
  const posts = await getPosts()
  return { posts }
}
```

**src/routes/+page.svelte**

```svelte
<script>
  import { createQuery } from '@tanstack/svelte-query'
  import type { PageData } from './$types'

  export let data: PageData

  const query = createQuery({
    queryKey: ['posts'],
    queryFn: getPosts,
    initialData: data.posts,
  })
</script>
```

優點：

- 此設定非常簡潔，對於某些情況來說可以快速解決問題
- 同時適用於 `+page.ts`/`+layout.ts` 和 `+page.server.ts`/`+layout.server.ts` 的 load 函數

缺點：

- 如果你在樹狀結構較深的元件中呼叫 `createQuery`，則需要將 `initialData` 傳遞到該處
- 如果你在多個位置使用相同的查詢呼叫 `createQuery`，則需要將 `initialData` 傳遞給所有位置
- 無法知道查詢是在伺服器端的什麼時間點取得的，因此 `dataUpdatedAt` 和判斷查詢是否需要重新取得的依據會是頁面載入的時間

### 使用 `prefetchQuery`

Svelte Query 支援在伺服器端預先取得查詢。使用以下設定，你可以在資料傳送到使用者的瀏覽器之前，先取得資料並傳遞給 QueryClientProvider。因此，這些資料已經存在快取中，客戶端不會進行初始取得。

**src/routes/+layout.ts**

```ts
import { browser } from '$app/environment'
import { QueryClient } from '@tanstack/svelte-query'

export async function load() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        enabled: browser,
      },
    },
  })

  return { queryClient }
}
```

**src/routes/+layout.svelte**

```svelte
<script lang="ts">
  import { QueryClientProvider } from '@tanstack/svelte-query'
  import type { LayoutData } from './$types'

  export let data: LayoutData
</script>

<QueryClientProvider client={data.queryClient}>
  <slot />
</QueryClientProvider>
```

**src/routes/+page.ts**

```ts
export async function load({ parent, fetch }) {
  const { queryClient } = await parent()

  // 這裡需要使用 SvelteKit 的 fetch 函數
  await queryClient.prefetchQuery({
    queryKey: ['posts'],
    queryFn: async () => (await fetch('/api/posts')).json(),
  })
}
```

**src/routes/+page.svelte**

```svelte
<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query'

  // 這些資料已經由 +page.ts 中的 prefetchQuery 快取，因此這裡實際上不會進行取得
  const query = createQuery({
    queryKey: ['posts'],
    queryFn: async () => (await fetch('/api/posts')).json(),
  })
</script>
```

優點：

- 伺服器載入的資料可以在任何地方存取，無需透過屬性傳遞 (prop-drilling)
- 頁面渲染後，客戶端不會進行初始取得，因為查詢快取保留了所有關於查詢的資訊，包括 `dataUpdatedAt`

缺點：

- 初始設定需要更多檔案
- 不適用於 `+page.server.ts`/`+layout.server.ts` 的 load 函數（不過，與 TanStack Query 一起使用的 API 無論如何都需要完全暴露給瀏覽器）
