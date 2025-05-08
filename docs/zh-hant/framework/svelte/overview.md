---
source-updated-at: '2025-01-23T16:50:04.000Z'
translation-updated-at: '2025-05-08T20:15:25.664Z'
id: overview
title: 概述
---

`@tanstack/svelte-query` 套件提供了第一方 API，讓您能透過 Svelte 使用 TanStack Query。

## 範例

在專案根目錄附近加入 QueryClientProvider：

```svelte
<script lang="ts">
  import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query'
  import Example from './lib/Example.svelte'

  const queryClient = new QueryClient()
</script>

<QueryClientProvider client={queryClient}>
  <Example />
</QueryClientProvider>
```

接著在任何元件中呼叫任何函式（例如 createQuery）：

```svelte
<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query'

  const query = createQuery({
    queryKey: ['todos'],
    queryFn: () => fetchTodos(),
  })
</script>

<div>
  {#if $query.isLoading}
    <p>Loading...</p>
  {:else if $query.isError}
    <p>Error: {$query.error.message}</p>
  {:else if $query.isSuccess}
    {#each $query.data as todo}
      <p>{todo.title}</p>
    {/each}
  {/if}
</div>
```

## SvelteKit

如果您使用 SvelteKit，請參閱 [伺服器渲染 (SSR) 與 SvelteKit](../ssr)。

## 可用函式

Svelte Query 提供了實用的函式與元件，能簡化 Svelte 應用程式中的伺服器狀態管理。

- `createQuery`
- `createQueries`
- `createInfiniteQuery`
- `createMutation`
- `useQueryClient`
- `useIsFetching`
- `useIsMutating`
- `useHydrate`
- `<QueryClientProvider>`
- `<HydrationBoundary>`

## Svelte Query 與 React Query 的重要差異

Svelte Query 提供的 API 與 React Query 相似，但需注意以下關鍵差異：

- Svelte Query 中的許多函式會回傳 Svelte 的 store。若要響應式地存取這些 store 中的值，需在 store 名稱前加上 `$`。您可於[此處](https://learn.svelte.dev/tutorial/writable-stores)深入瞭解 Svelte store。
- 若查詢 (query) 或變異 (mutation) 依賴變數，必須使用 store 作為選項。更多資訊請參閱[反應性 (reactivity) 章節](../reactivity)。
