---
source-updated-at: '2024-04-22T08:38:13.000Z'
translation-updated-at: '2025-05-06T03:55:32.417Z'
id: InfiniteQueryObserver
title: InfiniteQueryObserver
---

## `InfiniteQueryObserver`

`InfiniteQueryObserver` 可用于观察和切换无限查询 (infinite queries)。

```tsx
const observer = new InfiniteQueryObserver(queryClient, {
  queryKey: ['posts'],
  queryFn: fetchPosts,
  getNextPageParam: (lastPage, allPages) => lastPage.nextCursor,
  getPreviousPageParam: (firstPage, allPages) => firstPage.prevCursor,
})

const unsubscribe = observer.subscribe((result) => {
  console.log(result)
  unsubscribe()
})
```

**选项**

`InfiniteQueryObserver` 的选项与 [`useInfiniteQuery`](../../framework/react/reference/useInfiniteQuery) 完全一致。
