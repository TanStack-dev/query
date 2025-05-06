---
source-updated-at: '2025-03-18T08:45:11.000Z'
translation-updated-at: '2025-05-06T04:40:03.526Z'
id: useInfiniteQuery
title: useInfiniteQuery
---

```tsx
const {
  fetchNextPage,
  fetchPreviousPage,
  hasNextPage,
  hasPreviousPage,
  isFetchingNextPage,
  isFetchingPreviousPage,
  promise,
  ...result
} = useInfiniteQuery({
  queryKey,
  queryFn: ({ pageParam }) => fetchPage(pageParam),
  initialPageParam: 1,
  ...options,
  getNextPageParam: (lastPage, allPages, lastPageParam, allPageParams) =>
    lastPage.nextCursor,
  getPreviousPageParam: (firstPage, allPages, firstPageParam, allPageParams) =>
    firstPage.prevCursor,
})
```

**选项**

`useInfiniteQuery` 的选项与 [`useQuery` 钩子](./useQuery.md) 相同，但额外包含以下参数：

- `queryFn: (context: QueryFunctionContext) => Promise<TData>`
  - **必填（仅当未定义默认查询函数时）** [`defaultQueryFn`](../guides/default-query-function.md)
  - 查询用于请求数据的函数。
  - 接收一个 [QueryFunctionContext](../guides/query-functions.md#queryfunctioncontext) 对象。
  - 必须返回一个会解析为数据或抛出错误的 Promise。
- `initialPageParam: TPageParam`
  - **必填**
  - 获取第一页时使用的默认页面参数。
- `getNextPageParam: (lastPage, allPages, lastPageParam, allPageParams) => TPageParam | undefined | null`
  - **必填**
  - 当查询接收到新数据时，此函数会接收无限数据列表的最后一页、所有页面的完整数组以及页面参数信息。
  - 应返回一个**单一变量**，该变量将作为最后一个可选参数传递给查询函数。
  - 返回 `undefined` 或 `null` 表示没有下一页可用。
- `getPreviousPageParam: (firstPage, allPages, firstPageParam, allPageParams) => TPageParam | undefined | null`
  - 当查询接收到新数据时，此函数会接收无限数据列表的第一页、所有页面的完整数组以及页面参数信息。
  - 应返回一个**单一变量**，该变量将作为最后一个可选参数传递给查询函数。
  - 返回 `undefined` 或 `null` 表示没有上一页可用。
- `maxPages: number | undefined`
  - 无限查询数据中存储的最大页数。
  - 当达到最大页数时，获取新页将导致从页面数组中移除第一页或最后一页（取决于指定的方向）。
  - 如果为 `undefined` 或等于 `0`，则页数不受限制。
  - 默认值为 `undefined`。
  - 如果 `maxPages` 值大于 `0`，则必须正确定义 `getNextPageParam` 和 `getPreviousPageParam`，以便在需要时允许双向获取页面。

**返回值**

`useInfiniteQuery` 返回的属性与 [`useQuery` 钩子](./useQuery.md) 相同，但额外包含以下属性，且 `isRefetching` 和 `isRefetchError` 略有不同：

- `data.pages: TData[]`
  - 包含所有页面的数组。
- `data.pageParams: unknown[]`
  - 包含所有页面参数的数组。
- `isFetchingNextPage: boolean`
  - 当通过 `fetchNextPage` 获取下一页时为 `true`。
- `isFetchingPreviousPage: boolean`
  - 当通过 `fetchPreviousPage` 获取上一页时为 `true`。
- `fetchNextPage: (options?: FetchNextPageOptions) => Promise<UseInfiniteQueryResult>`
  - 此函数允许你获取下一页结果。
  - `options.cancelRefetch: boolean` 如果设置为 `true`，重复调用 `fetchNextPage` 将每次触发 `queryFn`，无论之前的调用是否已解析。同时，之前调用的结果将被忽略。如果设置为 `false`，重复调用 `fetchNextPage` 在第一次调用解析前不会产生任何效果。默认为 `true`。
- `fetchPreviousPage: (options?: FetchPreviousPageOptions) => Promise<UseInfiniteQueryResult>`
  - 此函数允许你获取上一页结果。
  - `options.cancelRefetch: boolean` 与 `fetchNextPage` 相同。
- `hasNextPage: boolean`
  - 如果存在可获取的下一页（通过 `getNextPageParam` 选项判断）则为 `true`。
- `hasPreviousPage: boolean`
  - 如果存在可获取的上一页（通过 `getPreviousPageParam` 选项判断）则为 `true`。
- `isFetchNextPageError: boolean`
  - 如果获取下一页时查询失败则为 `true`。
- `isFetchPreviousPageError: boolean`
  - 如果获取上一页时查询失败则为 `true`。
- `isRefetching: boolean`
  - 当后台重新获取正在进行时为 `true`，**不包括**初始的 `pending` 状态或获取下一页/上一页的操作。
  - 等同于 `isFetching && !isPending && !isFetchingNextPage && !isFetchingPreviousPage`。
- `isRefetchError: boolean`
  - 如果重新获取页面时查询失败则为 `true`。
- `promise: Promise<TData>`
  - 一个稳定的 Promise，解析为查询结果。
  - 可与 `React.use()` 配合使用以获取数据。
  - 需要在 `QueryClient` 上启用 `experimental_prefetchInRender` 特性标志。

请注意，命令式获取调用（如 `fetchNextPage`）可能会干扰默认的重新获取行为，导致数据过时。确保仅在响应用户操作时调用这些函数，或添加类似 `hasNextPage && !isFetching` 的条件。
