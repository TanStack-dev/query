---
source-updated-at: '2024-09-20T19:45:40.000Z'
translation-updated-at: '2025-05-06T03:48:55.772Z'
id: infinite-query-property-order
title: 无限查询属性顺序
---
对于以下函数，由于类型推断的原因，传入对象的属性顺序至关重要：

- `useInfiniteQuery`
- `useSuspenseInfiniteQuery`  
- `infiniteQueryOptions`

正确的属性顺序应如下：

- `queryFn`
- `getPreviousPageParam`  
- `getNextPageParam`

其他所有属性对顺序不敏感，因为它们不依赖于类型推断。

## 规则详情

该规则的 **错误** 代码示例：

```tsx
/* eslint "@tanstack/query/infinite-query-property-order": "warn" */
import { useInfiniteQuery } from '@tanstack/react-query'

const query = useInfiniteQuery({
  queryKey: ['projects'],
  getNextPageParam: (lastPage) => lastPage.nextId ?? undefined,
  queryFn: async ({ pageParam }) => {
    const response = await fetch(`/api/projects?cursor=${pageParam}`)
    return await response.json()
  },
  initialPageParam: 0,
  getPreviousPageParam: (firstPage) => firstPage.previousId ?? undefined,
  maxPages: 3,
})
```

该规则的 **正确** 代码示例：

```tsx
/* eslint "@tanstack/query/infinite-query-property-order": "warn" */
import { useInfiniteQuery } from '@tanstack/react-query'

const query = useInfiniteQuery({
  queryKey: ['projects'],
  queryFn: async ({ pageParam }) => {
    const response = await fetch(`/api/projects?cursor=${pageParam}`)
    return await response.json()
  },
  initialPageParam: 0,
  getPreviousPageParam: (firstPage) => firstPage.previousId ?? undefined,
  getNextPageParam: (lastPage) => lastPage.nextId ?? undefined,
  maxPages: 3,
})
```

## 特性

- [x] ✅ 推荐  
- [x] 🔧 可自动修复
