---
source-updated-at: '2025-03-18T08:45:11.000Z'
translation-updated-at: '2025-05-08T20:22:26.557Z'
id: queries
title: 查詢
---

## 查詢基礎

查詢 (Query) 是基於非同步資料來源的宣告式依賴，並與一個**唯一鍵**綁定。查詢可與任何基於 Promise 的方法（包括 GET 和 POST 方法）一起使用，從伺服器獲取資料。若您的方法會修改伺服器上的資料，建議改用[變更 (Mutations)](./mutations.md)。

要在元件或自訂 Hook 中訂閱查詢，請呼叫 `useQuery` Hook 並至少提供：

- **查詢的唯一鍵**
- 一個回傳 Promise 的函式，該 Promise 會：
  - 解析資料，或
  - 拋出錯誤

[//]: # '範例'

```tsx
import { useQuery } from '@tanstack/react-query'

function App() {
  const info = useQuery({ queryKey: ['todos'], queryFn: fetchTodoList })
}
```

[//]: # '範例'

您提供的**唯一鍵**會在內部用於重新獲取、快取及在應用程式中共享查詢。

`useQuery` 回傳的查詢結果包含所有與查詢相關的資訊，可供模板渲染或其他資料使用：

[//]: # '範例2'

```tsx
const result = useQuery({ queryKey: ['todos'], queryFn: fetchTodoList })
```

[//]: # '範例2'

`result` 物件包含幾個非常重要的狀態，您需要了解這些狀態才能有效使用。查詢在任何時刻只能處於以下其中一種狀態：

- `isPending` 或 `status === 'pending'` - 查詢尚未取得資料
- `isError` 或 `status === 'error'` - 查詢遇到錯誤
- `isSuccess` 或 `status === 'success'` - 查詢成功且資料可用

除了這些主要狀態外，根據查詢的狀態還可取得更多資訊：

- `error` - 若查詢處於 `isError` 狀態，可透過 `error` 屬性取得錯誤資訊。
- `data` - 若查詢處於 `isSuccess` 狀態，可透過 `data` 屬性取得資料。
- `isFetching` - 在任何狀態下，若查詢正在獲取資料（包括背景重新獲取），`isFetching` 會為 `true`。

對於**大多數**查詢，通常只需檢查 `isPending` 狀態，接著檢查 `isError` 狀態，最後假設資料可用並渲染成功狀態：

[//]: # '範例3'

```tsx
function Todos() {
  const { isPending, isError, data, error } = useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodoList,
  })

  if (isPending) {
    return <span>載入中...</span>
  }

  if (isError) {
    return <span>錯誤：{error.message}</span>
  }

  // 此時可假設 `isSuccess === true`
  return (
    <ul>
      {data.map((todo) => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  )
}
```

[//]: # '範例3'

若不喜歡使用布林值，也可以使用 `status` 狀態：

[//]: # '範例4'

```tsx
function Todos() {
  const { status, data, error } = useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodoList,
  })

  if (status === 'pending') {
    return <span>載入中...</span>
  }

  if (status === 'error') {
    return <span>錯誤：{error.message}</span>
  }

  // 同樣地，此時 status === 'success'，但使用 "else" 邏輯也適用
  return (
    <ul>
      {data.map((todo) => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  )
}
```

[//]: # '範例4'

若您在存取 `data` 前已檢查過 `pending` 和 `error`，TypeScript 也會正確縮小 `data` 的型別。

### 獲取狀態 (FetchStatus)

除了 `status` 欄位外，您還會獲得一個額外的 `fetchStatus` 屬性，其選項如下：

- `fetchStatus === 'fetching'` - 查詢正在獲取資料。
- `fetchStatus === 'paused'` - 查詢希望獲取資料，但已暫停。詳情請參閱[網路模式 (Network Mode)](./network-mode.md) 指南。
- `fetchStatus === 'idle'` - 查詢目前未進行任何操作。

### 為何需要兩種不同狀態？

背景重新獲取與「過期但可用」(stale-while-revalidate) 邏輯使得 `status` 和 `fetchStatus` 的所有組合都有可能出現。例如：

- 處於 `success` 狀態的查詢通常會處於 `idle` 獲取狀態，但若正在進行背景重新獲取，也可能處於 `fetching` 狀態。
- 剛掛載且無資料的查詢通常會處於 `pending` 狀態和 `fetching` 獲取狀態，但若無網路連線，也可能處於 `paused` 狀態。

因此請記住，查詢可能處於 `pending` 狀態但實際上並未獲取資料。作為經驗法則：

- `status` 提供關於 `data` 的資訊：我們是否有資料？
- `fetchStatus` 提供關於 `queryFn` 的資訊：它是否正在執行？

[//]: # '延伸閱讀'

## 延伸閱讀

若想了解其他執行狀態檢查的方式，請參閱[社群資源 (Community Resources)](../community/tkdodos-blog.md#4-status-checks-in-react-query)。

[//]: # '延伸閱讀'
