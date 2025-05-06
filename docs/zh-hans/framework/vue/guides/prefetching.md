---
source-updated-at: '2024-03-03T09:42:51.000Z'
translation-updated-at: '2025-05-06T16:02:02.404Z'
id: prefetching
title: 预获取
---

## 预取 (Prefetching)

如果足够幸运，您可能对用户即将执行的操作有充分了解，从而能在数据被实际需要之前预先获取！这种情况下，可以使用 `prefetchQuery` 方法预取查询结果并存入缓存：

[//]: # 'ExamplePrefetching'

```tsx
const prefetchTodos = async () => {
  // 该查询的结果会像普通查询一样被缓存
  await queryClient.prefetchQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
  })
}
```

[//]: # 'ExamplePrefetching'

- 如果该查询的**最新**数据已在缓存中，则不会发起请求
- 如果传入了 `staleTime`（例如 `prefetchQuery({ queryKey: ['todos'], queryFn: fn, staleTime: 5000 })`）且数据已超过指定的 `staleTime` 时间，则会重新发起查询
- 如果预取的查询没有对应的 `useQuery` 实例，则会在 `gcTime` 指定的时间后被删除并进行垃圾回收

## 预取无限查询 (Prefetching Infinite Queries)

无限查询 (Infinite Queries) 可以像常规查询一样预取。默认情况下，只会预取查询的第一页数据并存储在给定的 QueryKey 下。如需预取多页数据，可使用 `pages` 选项，此时还需提供 `getNextPageParam` 函数：

[//]: # 'ExampleInfiniteQuery'

```tsx
const prefetchProjects = async () => {
  // 该查询的结果会像普通查询一样被缓存
  await queryClient.prefetchInfiniteQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => lastPage.nextCursor,
    pages: 3, // 预取前 3 页数据
  })
}
```

[//]: # 'ExampleInfiniteQuery'

上述代码会按顺序尝试预取 3 页数据，并为每页执行 `getNextPageParam` 以确定下一页的预取参数。如果 `getNextPageParam` 返回 `undefined`，预取过程将停止。
