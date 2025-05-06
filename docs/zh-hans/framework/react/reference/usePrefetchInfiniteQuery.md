---
source-updated-at: '2025-03-18T08:45:11.000Z'
translation-updated-at: '2025-05-06T04:36:52.114Z'
id: usePrefetchInfiniteQuery
title: usePrefetchInfiniteQuery
---
```tsx
usePrefetchInfiniteQuery(options)
```

**选项**

你可以向 `usePrefetchInfiniteQuery` 传递所有 [`queryClient.prefetchInfiniteQuery`](../../../reference/QueryClient.md#queryclientprefetchinfinitequery) 支持的参数。请注意以下必填项：

- `queryKey: QueryKey`

  - **必填**
  - 用于在渲染期间预取的查询键 (query key)

- `queryFn: (context: QueryFunctionContext) => Promise<TData>`

  - **必填（但仅在未定义默认查询函数时）** 更多信息请参阅 [默认查询函数](../guides/default-query-function.md)

- `initialPageParam: TPageParam`

  - **必填**
  - 获取第一页时使用的默认页面参数 (page param)

- `getNextPageParam: (lastPage, allPages, lastPageParam, allPageParams) => TPageParam | undefined | null`

  - **必填**
  - 当接收到该查询的新数据时，此函数会接收无限数据列表的最后一页、所有页面的完整数组以及页面参数信息
  - 它应返回**单个变量**，该变量将作为最后一个可选参数传递给查询函数
  - 返回 `undefined` 或 `null` 表示没有可用的下一页

- **返回值**

`usePrefetchInfiniteQuery` 不返回任何内容，它仅用于在渲染期间（在包裹了使用 [`useSuspenseInfiniteQuery`](../reference/useSuspenseInfiniteQuery.md) 的组件的 Suspense 边界之前）触发预取
