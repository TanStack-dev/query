---
source-updated-at: '2025-03-18T08:45:11.000Z'
translation-updated-at: '2025-05-08T20:22:12.592Z'
id: query-functions
title: 查詢函數
---

查詢函式 (query function) 可以是任何**回傳 Promise**的函式。該 Promise 應該要能**解析資料 (resolve the data)** 或**拋出錯誤 (throw an error)**。

以下都是有效的查詢函式配置：

[//]: # 'Example'

```tsx
useQuery({ queryKey: ['todos'], queryFn: fetchAllTodos })
useQuery({ queryKey: ['todos', todoId], queryFn: () => fetchTodoById(todoId) })
useQuery({
  queryKey: ['todos', todoId],
  queryFn: async () => {
    const data = await fetchTodoById(todoId)
    return data
  },
})
useQuery({
  queryKey: ['todos', todoId],
  queryFn: ({ queryKey }) => fetchTodoById(queryKey[1]),
})
```

[//]: # 'Example'

## 處理與拋出錯誤

為了讓 TanStack Query 判斷查詢是否出錯，查詢函式**必須拋出錯誤**或回傳**被拒絕的 Promise (rejected Promise)**。任何在查詢函式中拋出的錯誤都會被保存在查詢的 `error` 狀態中。

[//]: # 'Example2'

```tsx
const { error } = useQuery({
  queryKey: ['todos', todoId],
  queryFn: async () => {
    if (somethingGoesWrong) {
      throw new Error('Oh no!')
    }
    if (somethingElseGoesWrong) {
      return Promise.reject(new Error('Oh no!'))
    }

    return data
  },
})
```

[//]: # 'Example2'

## 與預設不拋出錯誤的 `fetch` 及其他客戶端搭配使用

雖然大多數工具如 `axios` 或 `graphql-request` 會自動針對失敗的 HTTP 呼叫拋出錯誤，但像 `fetch` 這類工具預設不會拋出錯誤。在這種情況下，你需要自行拋出錯誤。以下是使用常見的 `fetch` API 實現此功能的簡單方式：

[//]: # 'Example3'

```tsx
useQuery({
  queryKey: ['todos', todoId],
  queryFn: async () => {
    const response = await fetch('/todos/' + todoId)
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    return response.json()
  },
})
```

[//]: # 'Example3'

## 查詢函式變數 (Query Function Variables)

查詢鍵 (query key) 不僅用於唯一識別要取得的資料，還會以便利的方式作為 QueryFunctionContext 的一部分傳入查詢函式。雖然並非總是必要，但這讓你在需要時能夠提取查詢函式：

[//]: # 'Example4'

```tsx
function Todos({ status, page }) {
  const result = useQuery({
    queryKey: ['todos', { status, page }],
    queryFn: fetchTodoList,
  })
}

// 在查詢函式中存取鍵 (key)、狀態 (status) 和頁碼 (page) 變數！
function fetchTodoList({ queryKey }) {
  const [_key, { status, page }] = queryKey
  return new Promise()
}
```

[//]: # 'Example4'

### 查詢函式上下文 (QueryFunctionContext)

`QueryFunctionContext` 是傳遞給每個查詢函式的物件，包含以下內容：

- `queryKey: QueryKey`: [查詢鍵 (Query Keys)](./query-keys.md)
- `client: QueryClient`: [查詢客戶端 (QueryClient)](../../../reference/QueryClient.md)
- `signal?: AbortSignal`
  - 由 TanStack Query 提供的 [中止訊號 (AbortSignal)](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) 實例
  - 可用於 [查詢取消 (Query Cancellation)](./query-cancellation.md)
- `meta: Record<string, unknown> | undefined`
  - 可選欄位，可用於填入查詢的額外資訊

此外，[無限查詢 (Infinite Queries)](./infinite-queries.md) 還會傳入以下選項：

- `pageParam: TPageParam`
  - 用於取得當前頁面的頁面參數
- `direction: 'forward' | 'backward'`
  - **已棄用**
  - 當前頁面取得的方向
  - 若要取得當前頁面取得的方向，請從 `getNextPageParam` 和 `getPreviousPageParam` 中為 `pageParam` 添加方向資訊。
