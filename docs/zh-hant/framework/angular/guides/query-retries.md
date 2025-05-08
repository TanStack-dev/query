---
source-updated-at: '2024-11-07T15:18:52.000Z'
translation-updated-at: '2025-05-08T20:24:49.121Z'
id: query-retries
title: 查詢重試
---

當 `injectQuery` 查詢失敗（查詢函數拋出錯誤）時，TanStack Query 會自動重試該查詢，前提是該查詢的請求尚未達到最大連續重試次數（預設為 `3`）或提供了決定是否允許重試的函數。

您可以在全域層級和個別查詢層級設定重試行為：

- 設定 `retry = false` 將停用重試功能。
- 設定 `retry = 6` 會在顯示函數拋出的最終錯誤前重試失敗的請求 6 次。
- 設定 `retry = true` 會無限次重試失敗的請求。
- 設定 `retry = (failureCount, error) => ...` 可根據請求失敗原因自訂重試邏輯。

```ts
import { injectQuery } from '@tanstack/angular-query-experimental'

// 讓特定查詢重試特定次數
const result = injectQuery(() => ({
  queryKey: ['todos', 1],
  queryFn: fetchTodoListPage,
  retry: 10, // 會在顯示錯誤前重試失敗的請求 10 次
}))
```

> 資訊：在最後一次重試嘗試前，`error` 屬性的內容會是 `injectQuery` 回應屬性 `failureReason` 的一部分。因此在上例中，任何錯誤內容在前 9 次重試嘗試（總共 10 次嘗試）期間都會是 `failureReason` 屬性的一部分，若所有重試後錯誤仍存在，最終才會成為 `error` 的一部分。

## 重試延遲

預設情況下，TanStack Query 的重試不會在請求失敗後立即執行。按照標準做法，每次重試嘗試會逐步套用退避延遲。

預設的 `retryDelay` 設定為每次嘗試加倍（從 `1000` 毫秒開始），但不超過 30 秒：

```ts
// 為所有查詢進行設定
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/angular-query-experimental'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
})

bootstrapApplication(AppComponent, {
  providers: [provideTanStackQuery(queryClient)],
})
```

雖然不建議，但您顯然可以在外掛程式和個別查詢選項中覆寫 `retryDelay` 函數/整數。若設為整數而非函數，延遲時間將始終固定：

```ts
const result = injectQuery(() => ({
  queryKey: ['todos'],
  queryFn: fetchTodoList,
  retryDelay: 1000, // 無論重試多少次，始終等待 1000 毫秒後重試
}))
```
