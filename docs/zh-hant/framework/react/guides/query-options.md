---
source-updated-at: '2025-03-18T08:45:11.000Z'
translation-updated-at: '2025-05-08T20:21:26.057Z'
id: query-options
title: 查詢選項
---

在多重使用場景間共享 `queryKey` 和 `queryFn`，同時保持它們彼此關聯的最佳方式之一，就是使用 `queryOptions` 輔助工具。在運行時，這個輔助工具僅會回傳你傳入的內容，但在[搭配 TypeScript 使用](../typescript.md#typing-query-options)時，它能帶來許多優勢。你可以在一個地方定義查詢的所有可能選項，並獲得完整的型別推論與型別安全。

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

// 使用方式:

useQuery(groupOptions(1))
useSuspenseQuery(groupOptions(5))
useQueries({
  queries: [groupOptions(1), groupOptions(2)],
})
queryClient.prefetchQuery(groupOptions(23))
queryClient.setQueryData(groupOptions(42).queryKey, newGroups)
```

[//]: # 'Example1'

針對無限查詢 (Infinite Queries)，另有獨立的 [`infiniteQueryOptions`](../reference/infiniteQueryOptions.md) 輔助工具可供使用。

你仍可在元件層級覆寫部分選項。一個非常常見且實用的模式是為每個元件建立專屬的 [`select`](./render-optimizations.md#select) 函式：

[//]: # 'Example2'

```ts
// 型別推論依然有效，因此 query.data 會是 select 的回傳型別，而非 queryFn 的

const query = useQuery({
  ...groupOptions(1),
  select: (data) => data.groupName,
})
```

[//]: # 'Example2'
