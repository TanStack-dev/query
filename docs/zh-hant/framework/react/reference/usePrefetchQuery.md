---
source-updated-at: '2025-03-18T08:45:11.000Z'
translation-updated-at: '2025-05-08T20:19:21.386Z'
id: usePrefetchQuery
title: usePrefetchQuery
---

```tsx
usePrefetchQuery(options)
```

**選項**

你可以傳遞所有能傳給 [`queryClient.prefetchQuery`](../../../reference/QueryClient.md#queryclientprefetchquery) 的參數給 `usePrefetchQuery`。請注意以下為必要參數：

- `queryKey: QueryKey`

  - **必填**
  - 在渲染期間預先擷取的查詢鍵值 (query key)

- `queryFn: (context: QueryFunctionContext) => Promise<TData>`
  - **必填（但僅在未定義預設查詢函式時適用）** 詳見[預設查詢函式](../guides/default-query-function.md)說明。

**回傳值**

`usePrefetchQuery` 不會回傳任何內容，其用途僅在渲染階段觸發預先擷取，適用於包覆 [`useSuspenseQuery`](../reference/useSuspenseQuery.md) 元件的 suspense 邊界 (suspense boundary) 之前。
