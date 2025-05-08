---
source-updated-at: '2025-01-10T12:49:47.000Z'
translation-updated-at: '2025-05-08T20:24:31.659Z'
id: disabling-queries
title: 停用/暫停查詢
---

若想禁止查詢自動執行，可使用 `enabled = false` 選項。`enabled` 選項也接受回傳布林值的回呼函式。

當 `enabled` 為 `false` 時：

- 若查詢有快取資料，則查詢會初始化為 `status === 'success'` 或 `isSuccess` 狀態。
- 若查詢無快取資料，則查詢會以 `status === 'pending'` 和 `fetchStatus === 'idle'` 狀態開始。
- 查詢不會在掛載時自動執行。
- 查詢不會在背景自動重新取得資料。
- 查詢會忽略查詢客戶端的 `invalidateQueries` 和 `refetchQueries` 呼叫（這些呼叫通常會導致查詢重新取得資料）。
- 從 `useQuery` 回傳的 `refetch` 可用於手動觸發查詢取得資料，但與 `skipToken` 併用時無效。

> TypeScript 使用者可改用 [skipToken](#typesafe-disabling-of-queries-using-skiptoken) 作為 `enabled = false` 的替代方案。

[//]: # '範例'

```tsx
function Todos() {
  const { isLoading, isError, data, error, refetch, isFetching } = useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodoList,
    enabled: false,
  })

  return (
    <div>
      <button onClick={() => refetch()}>Fetch Todos</button>

      {data ? (
        <>
          <ul>
            {data.map((todo) => (
              <li key={todo.id}>{todo.title}</li>
            ))}
          </ul>
        </>
      ) : isError ? (
        <span>Error: {error.message}</span>
      ) : isLoading ? (
        <span>Loading...</span>
      ) : (
        <span>Not ready ...</span>
      )}

      <div>{isFetching ? 'Fetching...' : null}</div>
    </div>
  )
}
```

[//]: # '範例'

永久禁用查詢會放棄 TanStack Query 提供的許多強大功能（如背景重新取得資料），這也非慣用做法。此做法會從宣告式模式（定義查詢執行時機的依賴條件）轉為命令式模式（點擊按鈕時才取得資料），且無法傳遞參數給 `refetch`。多數情況下，您需要的其實是延遲初始資料取得的「惰性查詢」：

## 惰性查詢 (Lazy Queries)

`enabled` 選項不僅能用於永久禁用查詢，還可控制後續啟用/禁用時機。典型範例是篩選表單——僅在使用者輸入篩選值後才發送首次請求：

[//]: # '範例2'

```tsx
function Todos() {
  const [filter, setFilter] = React.useState('')

  const { data } = useQuery({
    queryKey: ['todos', filter],
    queryFn: () => fetchTodos(filter),
    // ⬇️ 篩選值為空時禁用查詢
    enabled: !!filter,
  })

  return (
    <div>
      // 🚀 套用篩選值後會啟用並執行查詢
      <FiltersForm onApply={setFilter} />
      {data && <TodosTable data={data} />}
    </div>
  )
}
```

[//]: # '範例2'

### isLoading (原為 `isInitialLoading`)

惰性查詢會從開始就處於 `status: 'pending'`，因為 `pending` 表示尚未取得資料。技術上雖正確，但由於當前並未取得資料（查詢未被 _啟用_），意味著您可能無法用此標誌顯示載入指示器。

若使用禁用或惰性查詢，可改用 `isLoading` 標誌。這是個衍生標誌，由以下條件計算：

`isPending && isFetching`

因此僅在查詢首次取得資料時會為 `true`。

## 使用 `skipToken` 實現型別安全的查詢禁用

若使用 TypeScript，可用 `skipToken` 禁用查詢。這適用於需根據條件禁用查詢，同時保持查詢型別安全的情況。

> 重要：`useQuery` 的 `refetch` 與 `skipToken` 併用時無效。除此之外，`skipToken` 的行為與 `enabled: false` 相同。

[//]: # '範例3'

```tsx
import { skipToken, useQuery } from '@tanstack/react-query'

function Todos() {
  const [filter, setFilter] = React.useState<string | undefined>()

  const { data } = useQuery({
    queryKey: ['todos', filter],
    // ⬇️ 篩選值為 undefined 或空字串時禁用查詢
    queryFn: filter ? () => fetchTodos(filter) : skipToken,
  })

  return (
    <div>
      // 🚀 套用篩選值後會啟用並執行查詢
      <FiltersForm onApply={setFilter} />
      {data && <TodosTable data={data} />}
    </div>
  )
}
```

[//]: # '範例3'
