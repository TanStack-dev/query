---
source-updated-at: '2025-03-18T08:45:11.000Z'
translation-updated-at: '2025-05-06T04:06:24.141Z'
id: query-options
title: 查询选项
---
## 查询选项 (Query Options)

在多个地方共享 `queryKey` 和 `queryFn` 同时保持它们彼此关联的最佳方式之一是使用 `queryOptions` 辅助函数。在运行时，这个辅助函数仅返回你传入的内容，但[配合 TypeScript 使用时](../typescript.md#typing-query-options)它能带来诸多优势。你可以在一个地方定义查询的所有可能选项，并同时获得完整的类型推断和类型安全。

[//]: # 'Example1'

```ts
import { queryOptions } from '@tanstack/react-query'

function groupOptions(id: number) {
  return queryOptions({
    queryKey: ['groups', id],
    queryFn: () => fetchGroups(id),
    staleTime: 5 * 1000,
  })
}

// 使用示例:

useQuery(groupOptions(1))
useSuspenseQuery(groupOptions(5))
useQueries({
  queries: [groupOptions(1), groupOptions(2)],
})
queryClient.prefetchQuery(groupOptions(23))
queryClient.setQueryData(groupOptions(42).queryKey, newGroups)
```

[//]: # 'Example1'

对于无限查询 (Infinite Queries)，可以使用单独的 [`infiniteQueryOptions`](../reference/infiniteQueryOptions.md) 辅助函数。

你仍然可以在组件级别覆盖某些选项。一个非常常见且实用的模式是为每个组件创建 [`select`](./render-optimizations.md#select) 函数：

[//]: # 'Example2'

```ts
// 类型推断仍然有效，因此 query.data 将是 select 的返回类型而非 queryFn 的返回类型

const query = useQuery({
  ...groupOptions(1),
  select: (data) => data.groupName,
})
```

[//]: # 'Example2'
