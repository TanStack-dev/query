---
source-updated-at: '2025-01-23T16:50:04.000Z'
translation-updated-at: '2025-05-06T05:21:37.348Z'
id: overview
title: 概述
---

`@tanstack/svelte-query` 包为通过 Svelte 使用 TanStack Query 提供了一流的 API。

## 示例

在项目根目录附近引入 QueryClientProvider：

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

然后在任意组件中调用函数（例如 createQuery）：

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

如果使用 SvelteKit，请查看 [服务端渲染 (SSR) 与 SvelteKit](../ssr) 文档。

## 可用函数

Svelte Query 提供了以下实用函数和组件，可简化 Svelte 应用中的服务端状态管理：

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

## Svelte Query 与 React Query 的重要区别

Svelte Query 提供了与 React Query 相似的 API，但需注意以下关键差异：

- Svelte Query 中的许多函数会返回 Svelte 的 store 对象。要响应式访问这些 store 的值，需要在变量名前添加 `$` 前缀。可通过 [Svelte store 文档](https://learn.svelte.dev/tutorial/writable-stores) 了解更多。
- 若查询或变更依赖变量，必须使用 store 作为配置项。详见 [响应式文档](../reactivity)。
