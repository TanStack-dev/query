---
source-updated-at: '2025-03-18T08:45:11.000Z'
translation-updated-at: '2025-05-08T20:20:21.908Z'
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

**選項**

`useInfiniteQuery` 的選項與 [`useQuery` 鉤子 (hook)](./useQuery.md) 相同，但額外增加了以下選項：

- `queryFn: (context: QueryFunctionContext) => Promise<TData>`
  - **必填，但僅在未定義預設查詢函式時需要** [`defaultQueryFn`](../guides/default-query-function.md)
  - 查詢用來請求資料的函式。
  - 接收一個 [QueryFunctionContext](../guides/query-functions.md#queryfunctioncontext)
  - 必須回傳一個會解析資料或拋出錯誤的 promise。
- `initialPageParam: TPageParam`
  - **必填**
  - 獲取第一頁時使用的預設頁面參數。
- `getNextPageParam: (lastPage, allPages, lastPageParam, allPageParams) => TPageParam | undefined | null`
  - **必填**
  - 當此查詢接收到新資料時，此函式會收到無限資料列表的最後一頁、所有頁面的完整陣列，以及 pageParam 資訊。
  - 應回傳一個**單一變數**，該變數將作為最後一個可選參數傳遞給查詢函式。
  - 回傳 `undefined` 或 `null` 表示沒有下一頁可用。
- `getPreviousPageParam: (firstPage, allPages, firstPageParam, allPageParams) => TPageParam | undefined | null`
  - 當此查詢接收到新資料時，此函式會收到無限資料列表的第一頁、所有頁面的完整陣列，以及 pageParam 資訊。
  - 應回傳一個**單一變數**，該變數將作為最後一個可選參數傳遞給查詢函式。
  - 回傳 `undefined` 或 `null` 表示沒有上一頁可用。
- `maxPages: number | undefined`
  - 無限查詢資料中儲存的最大頁數。
  - 當達到最大頁數時，獲取新頁面將導致從頁面陣列中移除第一頁或最後一頁，具體取決於指定的方向。
  - 如果為 `undefined` 或等於 `0`，則頁數沒有限制。
  - 預設值為 `undefined`。
  - 如果 `maxPages` 值大於 `0`，則必須正確定義 `getNextPageParam` 和 `getPreviousPageParam`，以便在需要時允許雙向獲取頁面。

**回傳值**

`useInfiniteQuery` 的回傳屬性與 [`useQuery` 鉤子 (hook)](./useQuery.md) 相同，但額外增加了以下屬性，並且 `isRefetching` 和 `isRefetchError` 有微小差異：

- `data.pages: TData[]`
  - 包含所有頁面的陣列。
- `data.pageParams: unknown[]`
  - 包含所有頁面參數的陣列。
- `isFetchingNextPage: boolean`
  - 當使用 `fetchNextPage` 獲取下一頁時，此值為 `true`。
- `isFetchingPreviousPage: boolean`
  - 當使用 `fetchPreviousPage` 獲取上一頁時，此值為 `true`。
- `fetchNextPage: (options?: FetchNextPageOptions) => Promise<UseInfiniteQueryResult>`
  - 此函式允許你獲取下一「頁」的結果。
  - `options.cancelRefetch: boolean` 如果設為 `true`，則重複呼叫 `fetchNextPage` 每次都會觸發 `queryFn`，無論前一次呼叫是否已解析。此外，前一次呼叫的結果將被忽略。如果設為 `false`，則重複呼叫 `fetchNextPage` 在第一次呼叫解析前不會有任何效果。預設為 `true`。
- `fetchPreviousPage: (options?: FetchPreviousPageOptions) => Promise<UseInfiniteQueryResult>`
  - 此函式允許你獲取上一「頁」的結果。
  - `options.cancelRefetch: boolean` 與 `fetchNextPage` 相同。
- `hasNextPage: boolean`
  - 如果有下一頁可供獲取（透過 `getNextPageParam` 選項得知），此值為 `true`。
- `hasPreviousPage: boolean`
  - 如果有上一頁可供獲取（透過 `getPreviousPageParam` 選項得知），此值為 `true`。
- `isFetchNextPageError: boolean`
  - 如果在獲取下一頁時查詢失敗，此值為 `true`。
- `isFetchPreviousPageError: boolean`
  - 如果在獲取上一頁時查詢失敗，此值為 `true`。
- `isRefetching: boolean`
  - 當背景重新獲取正在進行時，此值為 `true`，這**不包含**初始的 `pending` 狀態或獲取下一頁/上一頁。
  - 等同於 `isFetching && !isPending && !isFetchingNextPage && !isFetchingPreviousPage`。
- `isRefetchError: boolean`
  - 如果在重新獲取頁面時查詢失敗，此值為 `true`。
- `promise: Promise<TData>`
  - 一個穩定的 promise，解析為查詢結果。
  - 可與 `React.use()` 一起使用來獲取資料。
  - 需要在 `QueryClient` 上啟用 `experimental_prefetchInRender` 功能標誌。

請注意，命令式獲取呼叫（如 `fetchNextPage`）可能會干擾預設的重新獲取行為，導致資料過時。確保僅在回應使用者操作時呼叫這些函式，或添加條件如 `hasNextPage && !isFetching`。
