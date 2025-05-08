---
source-updated-at: '2025-03-18T08:45:11.000Z'
translation-updated-at: '2025-05-08T20:19:28.741Z'
id: usePrefetchInfiniteQuery
title: usePrefetchInfiniteQuery
---

```tsx
usePrefetchInfiniteQuery(options)
```

**選項**

你可以將所有能傳遞給 [`queryClient.prefetchInfiniteQuery`](../../../reference/QueryClient.md#queryclientprefetchinfinitequery) 的參數傳遞給 `usePrefetchInfiniteQuery`。請注意以下為必要參數：

- `queryKey: QueryKey`

  - **必填**
  - 渲染期間需預取的查詢鍵 (query key)

- `queryFn: (context: QueryFunctionContext) => Promise<TData>`

  - **必填（但僅在未定義預設查詢函式時適用）** 詳見 [預設查詢函式](../guides/default-query-function.md) 說明。

- `initialPageParam: TPageParam`

  - **必填**
  - 獲取第一頁時使用的預設頁面參數 (page param)。

- `getNextPageParam: (lastPage, allPages, lastPageParam, allPageParams) => TPageParam | undefined | null`

  - **必填**
  - 當此查詢接收到新資料時，此函式會取得無限資料清單的最後一頁、所有頁面的完整陣列，以及頁面參數資訊。
  - 應返回**單一變數**，該變數將作為最後一個可選參數傳遞給查詢函式。
  - 返回 `undefined` 或 `null` 表示沒有可用的下一頁。

- **返回值**

`usePrefetchInfiniteQuery` 不會返回任何內容，其用途僅在於在渲染期間（於包裹 [`useSuspenseInfiniteQuery`](../reference/useSuspenseInfiniteQuery.md) 元件的 suspense boundary 之前）觸發預取。
