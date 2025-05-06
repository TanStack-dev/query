---
source-updated-at: '2025-03-18T08:45:11.000Z'
translation-updated-at: '2025-05-06T04:36:32.898Z'
id: usePrefetchQuery
title: usePrefetchQuery
---

```tsx
usePrefetchQuery(options)
```

**选项**

你可以向 `usePrefetchQuery` 传递所有 [`queryClient.prefetchQuery`](../../../reference/QueryClient.md#queryclientprefetchquery) 支持的参数。请注意以下必填项：

- `queryKey: QueryKey`

  - **必填**
  - 需要在渲染期间预取的查询键 (query key)

- `queryFn: (context: QueryFunctionContext) => Promise<TData>`
  - **必填（但仅在未定义默认查询函数时适用）** 更多信息请参阅 [默认查询函数](../guides/default-query-function.md)

**返回值**

`usePrefetchQuery` 不返回任何值，其用途仅是在渲染期间触发预取操作，通常用于包裹 [`useSuspenseQuery`](../reference/useSuspenseQuery.md) 组件的 suspense 边界之前执行。
