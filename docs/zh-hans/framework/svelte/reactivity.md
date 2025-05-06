---
source-updated-at: '2024-08-19T12:20:53.000Z'
translation-updated-at: '2025-05-06T05:21:59.065Z'
id: reactivity
title: 响应式
---
Svelte 使用编译器构建代码以优化渲染。默认情况下，组件仅运行一次，除非在标记中被引用。若要对选项变化作出响应，您需要使用[存储 (store)](https://svelte.dev/docs/svelte-store)。

在以下示例中，`refetchInterval` 选项从绑定到输入框的变量 `intervalMs` 设置。然而由于查询无法响应 `intervalMs` 的变化，当输入值改变时 `refetchInterval` 不会更新。

```svelte
<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query'

  const endpoint = 'http://localhost:5173/api/data'

  let intervalMs = 1000

  const query = createQuery({
    queryKey: ['refetch'],
    queryFn: async () => await fetch(endpoint).then((r) => r.json()),
    refetchInterval: intervalMs,
  })
</script>

<input type="number" bind:value={intervalMs} />
```

为解决此问题，我们可以将 `intervalMs` 转换为可写存储 (writable store)。查询选项随后可转换为派生存储 (derived store)，以真正的响应式特性传入函数。

```svelte
<script lang="ts">
  import { derived, writable } from 'svelte/store'
  import { createQuery } from '@tanstack/svelte-query'

  const endpoint = 'http://localhost:5173/api/data'

  const intervalMs = writable(1000)

  const query = createQuery(
    derived(intervalMs, ($intervalMs) => ({
      queryKey: ['refetch'],
      queryFn: async () => await fetch(endpoint).then((r) => r.json()),
      refetchInterval: $intervalMs,
    })),
  )
</script>

<input type="number" bind:value={$intervalMs} />
```
