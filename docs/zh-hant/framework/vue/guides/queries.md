---
source-updated-at: '2024-01-26T03:31:25.000Z'
translation-updated-at: '2025-05-08T20:18:40.671Z'
id: queries
title: 查詢
---

## 查詢基礎

查詢是與**唯一鍵**綁定的非同步資料來源的宣告式依賴。查詢可與任何基於 Promise 的方法（包括 GET 和 POST 方法）一起使用，以從伺服器獲取資料。若您的方法會修改伺服器上的資料，建議改用[變更 (Mutations)](./mutations.md)。

要在元件或自訂鉤子中訂閱查詢，請呼叫 `useQuery` 鉤子並至少提供以下參數：

- **查詢的唯一鍵**
- 一個回傳 Promise 的函式，該 Promise 會：
  - 解析資料，或
  - 拋出錯誤

```ts
import { useQuery } from '@tanstack/vue-query'

const result = useQuery({ queryKey: ['todos'], queryFn: fetchTodoList })
```

您提供的**唯一鍵**會在內部用於重新獲取、快取及在應用程式中共享查詢。

`useQuery` 回傳的查詢結果包含所有與查詢相關的資訊，可供模板化或任何其他資料使用：

```tsx
const result = useQuery({ queryKey: ['todos'], queryFn: fetchTodoList })
```

`result` 物件包含幾個非常重要的狀態，您需要了解這些狀態才能有效使用。查詢在任一時刻只能處於以下其中一種狀態：

- `isPending` 或 `status === 'pending'` - 查詢尚未取得資料
- `isError` 或 `status === 'error'` - 查詢遇到錯誤
- `isSuccess` 或 `status === 'success'` - 查詢成功且資料可用

除了這些主要狀態外，根據查詢的狀態還可獲取更多資訊：

- `error` - 若查詢處於 `isError` 狀態，可透過 `error` 屬性取得錯誤資訊。
- `data` - 若查詢處於 `isSuccess` 狀態，可透過 `data` 屬性取得資料。
- `isFetching` - 在任何狀態下，若查詢正在獲取資料（包括背景重新獲取），`isFetching` 會為 `true`。

對於**大多數**查詢，通常只需檢查 `isPending` 狀態，接著檢查 `isError` 狀態，最後假設資料已可用並渲染成功狀態：

```vue
<script setup>
import { useQuery } from '@tanstack/vue-query'

const { isPending, isError, data, error } = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodoList,
})
</script>

<template>
  <span v-if="isPending">載入中...</span>
  <span v-else-if="isError">錯誤: {{ error.message }}</span>
  <!-- 此時可假設 `isSuccess === true` -->
  <ul v-else-if="data">
    <li v-for="todo in data" :key="todo.id">{{ todo.title }}</li>
  </ul>
</template>
```

若不喜歡布林值，也可以使用 `status` 狀態：

```vue
<script setup>
import { useQuery } from '@tanstack/vue-query'

const { status, data, error } = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodoList,
})
</script>

<template>
  <span v-if="status === 'pending'">載入中...</span>
  <span v-else-if="status === 'error'">錯誤: {{ error.message }}</span>
  <!-- 同樣 status === 'success'，但 "else" 邏輯也適用 -->
  <ul v-else-if="data">
    <li v-for="todo in data" :key="todo.id">{{ todo.title }}</li>
  </ul>
</template>
```

若您在存取 `data` 前已檢查過 `pending` 和 `error`，TypeScript 也會正確縮小 `data` 的型別範圍。

### 獲取狀態 (FetchStatus)

除了 `status` 欄位外，您還會獲得一個額外的 `fetchStatus` 屬性，其選項如下：

- `fetchStatus === 'fetching'` - 查詢正在獲取資料。
- `fetchStatus === 'paused'` - 查詢想要獲取資料，但已暫停。詳情請參閱[網路模式 (Network Mode)](./network-mode.md) 指南。
- `fetchStatus === 'idle'` - 查詢目前未進行任何操作。

### 為何有兩種不同狀態？

背景重新獲取和過期資料重新驗證邏輯使得 `status` 和 `fetchStatus` 的所有組合都有可能出現。例如：

- 處於 `success` 狀態的查詢通常會處於 `idle` 獲取狀態，但若正在進行背景重新獲取，也可能處於 `fetching` 狀態。
- 剛掛載且無資料的查詢通常會處於 `pending` 狀態和 `fetching` 獲取狀態，但若無網路連線，也可能處於 `paused` 狀態。

因此請記住，查詢可能處於 `pending` 狀態但實際上並未獲取資料。作為經驗法則：

- `status` 提供關於 `data` 的資訊：我們是否有資料？
- `fetchStatus` 提供關於 `queryFn` 的資訊：它是否正在執行？
