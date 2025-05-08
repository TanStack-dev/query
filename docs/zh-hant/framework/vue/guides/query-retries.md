---
source-updated-at: '2024-01-26T03:31:25.000Z'
translation-updated-at: '2025-05-08T20:18:13.970Z'
id: query-retries
title: 查詢重試
---

當 `useQuery` 查詢失敗（查詢函數拋出錯誤）時，TanStack Query 會自動重試該查詢，前提是該查詢的請求尚未達到最大連續重試次數（預設為 `3`）或提供了決定是否允許重試的函數。

您可以在全域層級和單一查詢層級上配置重試行為：

- 設定 `retry = false` 將停用重試功能。
- 設定 `retry = 6` 會在顯示函數拋出的最終錯誤前，重試失敗的請求 6 次。
- 設定 `retry = true` 會無限次重試失敗的請求。
- 設定 `retry = (failureCount, error) => ...` 可根據請求失敗的原因自訂重試邏輯。

> 在伺服器端，重試次數預設為 `0`，以確保伺服器渲染 (server rendering) 的速度最快。

```tsx
import { useQuery } from '@tanstack/vue-query'

// 讓特定查詢重試指定次數
const result = useQuery({
  queryKey: ['todos', 1],
  queryFn: fetchTodoListPage,
  retry: 10, // 會在顯示錯誤前重試失敗的請求 10 次
})
```

> 提示：在最後一次重試嘗試之前，`error` 屬性的內容將屬於 `useQuery` 回應的 `failureReason` 屬性。因此，在上述範例中，任何錯誤內容在前 9 次重試嘗試（總共 10 次嘗試）中都會屬於 `failureReason` 屬性，如果所有重試嘗試後錯誤仍然存在，最終這些內容會在最後一次嘗試後屬於 `error` 屬性。

## 重試延遲

預設情況下，TanStack Query 不會在請求失敗後立即重試。按照標準做法，每次重試嘗試會逐漸增加退避延遲 (back-off delay)。

預設的 `retryDelay` 設定為每次嘗試加倍（從 `1000` 毫秒開始），但不超過 30 秒：

```ts
import { VueQueryPlugin } from '@tanstack/vue-query'

const vueQueryPluginOptions = {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
    },
  },
}
app.use(VueQueryPlugin, vueQueryPluginOptions)
```

雖然不建議這樣做，但您顯然可以在 Plugin 和單一查詢選項中覆寫 `retryDelay` 函數/整數。如果設定為整數而非函數，延遲時間將始終相同：

```tsx
const result = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodoList,
  retryDelay: 1000, // 無論重試多少次，總是等待 1000 毫秒後重試
})
```
