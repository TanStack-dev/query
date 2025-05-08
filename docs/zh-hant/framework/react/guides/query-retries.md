---
source-updated-at: '2024-01-25T20:57:22.000Z'
translation-updated-at: '2025-05-08T20:21:34.110Z'
id: query-retries
title: 查詢重試
---

當 `useQuery` 查詢失敗（查詢函式拋出錯誤）時，TanStack Query 會自動重試該查詢，前提是該查詢的請求尚未達到最大連續重試次數（預設為 `3` 次）或提供了決定是否允許重試的函式。

您可以在全域層級和個別查詢層級上配置重試行為：

- 設定 `retry = false` 將停用重試功能。
- 設定 `retry = 6` 會在顯示函式拋出的最終錯誤前重試失敗的請求 6 次。
- 設定 `retry = true` 會無限次重試失敗的請求。
- 設定 `retry = (failureCount, error) => ...` 可根據請求失敗原因自訂重試邏輯。

[//]: # 'Info'

> 在伺服器端，重試次數預設為 `0`，以確保伺服器渲染 (server rendering) 速度最快。

[//]: # 'Info'
[//]: # 'Example'

```tsx
import { useQuery } from '@tanstack/react-query'

// 讓特定查詢重試特定次數
const result = useQuery({
  queryKey: ['todos', 1],
  queryFn: fetchTodoListPage,
  retry: 10, // 會在顯示錯誤前重試失敗的請求 10 次
})
```

[//]: # 'Example'

> 資訊：在最後一次重試嘗試之前，`error` 屬性的內容將作為 `failureReason` 回應屬性的一部分存在於 `useQuery` 中。因此，在上述範例中，任何錯誤內容在前 9 次重試嘗試（總共 10 次嘗試）中都會是 `failureReason` 屬性的一部分，最終如果所有重試嘗試後錯誤仍然存在，這些內容將在最後一次嘗試後成為 `error` 的一部分。

## 重試延遲 (Retry Delay)

預設情況下，TanStack Query 不會在請求失敗後立即進行重試。按照標準做法，每次重試嘗試會逐步套用退避延遲 (back-off delay)。

預設的 `retryDelay` 設定為每次嘗試加倍（從 `1000` 毫秒開始），但不超過 30 秒：

[//]: # 'Example2'

```tsx
// 為所有查詢進行配置
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
})

function App() {
  return <QueryClientProvider client={queryClient}>...</QueryClientProvider>
}
```

[//]: # 'Example2'

雖然不建議這樣做，但您顯然可以在 Provider 和個別查詢選項中覆寫 `retryDelay` 函式/整數。如果設定為整數而非函式，延遲時間將始終保持相同：

[//]: # 'Example3'

```tsx
const result = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodoList,
  retryDelay: 1000, // 無論重試多少次，總是等待 1000 毫秒後重試
})
```

[//]: # 'Example3'
