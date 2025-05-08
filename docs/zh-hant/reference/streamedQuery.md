---
source-updated-at: '2025-05-01T13:24:59.000Z'
translation-updated-at: '2025-05-08T20:14:52.262Z'
id: streamedQuery
title: streamedQuery
---

`streamedQuery` 是一個輔助函式，用於建立一個從 [AsyncIterable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncIterator) 串流資料的查詢函式。資料會是一個包含所有接收到的區塊的陣列。在接收到第一個資料區塊之前，查詢會處於 `pending` 狀態，但之後會轉為 `success`。查詢會持續保持 `fetchStatus` 為 `fetching`，直到串流結束。

若要查看 `streamedQuery` 的實際應用，請參考我們的 [聊天範例](../framework/react/examples/chat)。

```tsx
import { experimental_streamedQuery as streamedQuery } from '@tanstack/react-query'

const query = queryOptions({
  queryKey: ['data'],
  queryFn: streamedQuery({
    queryFn: fetchDataInChunks,
  }),
})
```

> 注意：`streamedQuery` 目前標記為 `experimental`，因為我們希望收集社群的意見回饋。如果您已試用此 API 並有建議，請在此 [GitHub 討論串](https://github.com/TanStack/query/discussions/9065) 中提供。

**選項**

- `queryFn: (context: QueryFunctionContext) => Promise<AsyncIterable<TData>>`
  - **必填**
  - 此函式需回傳一個 Promise，其解析值為要串流輸入的 AsyncIterable 資料。
  - 接收一個 [QueryFunctionContext](../guides/query-functions.md#queryfunctioncontext) 參數。
- `refetchMode?: 'append' | 'reset' | 'replace'`
  - 選填
  - 定義重新取得資料時的處理方式。
  - 預設為 `'reset'`
  - 設為 `'reset'` 時，查詢會清除所有資料並回到 `pending` 狀態。
  - 設為 `'append'` 時，資料會附加到現有資料之後。
  - 設為 `'replace'` 時，資料會在串流結束時寫入快取。
