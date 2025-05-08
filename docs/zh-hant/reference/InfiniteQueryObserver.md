---
source-updated-at: '2024-04-22T08:38:13.000Z'
translation-updated-at: '2025-05-08T20:14:40.009Z'
id: InfiniteQueryObserver
title: InfiniteQueryObserver
---

## `InfiniteQueryObserver`

`InfiniteQueryObserver` 可用於觀察並切換不同的無限查詢 (infinite queries)。

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

**選項**

`InfiniteQueryObserver` 的選項與 [`useInfiniteQuery`](../../framework/react/reference/useInfiniteQuery) 完全相同。
