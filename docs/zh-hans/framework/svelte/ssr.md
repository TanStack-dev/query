---
source-updated-at: '2024-04-02T22:46:31.000Z'
translation-updated-at: '2025-05-06T05:22:45.237Z'
id: overview
title: SSR 与 SvelteKit
---

## 配置

SvelteKit 默认使用服务端渲染 (SSR) 来渲染路由。因此，您需要在服务端禁用查询功能。否则，即使在 HTML 已发送至客户端后，您的查询仍会在服务端继续异步执行。

推荐的方式是在 `QueryClient` 对象中使用 SvelteKit 的 `browser` 模块。这不会禁用 `queryClient.prefetchQuery()`，该方法会在以下解决方案之一中使用。

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

## 预取数据

Svelte Query 支持两种在服务端预取数据并通过 SvelteKit 传递至客户端的方式。

如需查看理想的 SSR 配置，请参考 [SSR 示例](../examples/ssr)。

### 使用 `initialData`

结合 SvelteKit 的 [`load`](https://kit.svelte.dev/docs/load) 方法，您可以将服务端加载的数据传入 `createQuery` 的 `initialData` 选项：

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

优点：

- 此配置简洁，可快速解决部分场景需求
- 兼容 `+page.ts`/`+layout.ts` 和 `+page.server.ts`/`+layout.server.ts` 的 load 函数

缺点：

- 若在组件树深层调用 `createQuery`，需将 `initialData` 向下传递至该处
- 若在多个位置使用相同查询调用 `createQuery`，需为所有位置传递 `initialData`
- 无法获知查询在服务端的获取时间，因此 `dataUpdatedAt` 和判断查询是否需要重新获取将基于页面加载时间

### 使用 `prefetchQuery`

Svelte Query 支持在服务端预取查询。通过以下配置，您可以在数据发送至用户浏览器前将其预取并传入 QueryClientProvider。因此，数据已存在于缓存中，客户端不会发生初始获取。

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

  // 此处需使用 SvelteKit 的 fetch 函数
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

  // 此数据已被 +page.ts 中的 prefetchQuery 缓存，因此此处不会实际发起请求
  const query = createQuery({
    queryKey: ['posts'],
    queryFn: async () => (await fetch('/api/posts')).json(),
  })
</script>
```

优点：

- 服务端加载的数据可在任意位置访问，无需属性透传
- 页面渲染后客户端不会发生初始请求，因为查询缓存保留了包括 `dataUpdatedAt` 在内的完整查询信息

缺点：

- 初始配置需要更多文件
- 不兼容 `+page.server.ts`/`+layout.server.ts` 的 load 函数（但需注意，与 TanStack Query 配合使用的 API 必须完全暴露给浏览器端）
