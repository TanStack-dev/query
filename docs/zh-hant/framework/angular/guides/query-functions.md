---
source-updated-at: '2024-01-26T03:31:25.000Z'
translation-updated-at: '2025-05-08T20:25:19.553Z'
id: query-functions
title: 查詢函數
---

查詢函式 (query function) 可以是**任何會回傳 promise 的函式**。這個 promise 應該要能夠**解析資料 (resolve the data)** 或**拋出錯誤 (throw an error)**。

以下都是有效的查詢函式設定方式：

```ts
injectQuery(() => ({ queryKey: ['todos'], queryFn: fetchAllTodos }))
injectQuery(() => ({ queryKey: ['todos', todoId], queryFn: () => fetchTodoById(todoId) })
injectQuery(() => ({
  queryKey: ['todos', todoId],
  queryFn: async () => {
    const data = await fetchTodoById(todoId)
    return data
  },
}))
injectQuery(() => ({
  queryKey: ['todos', todoId],
  queryFn: ({ queryKey }) => fetchTodoById(queryKey[1]),
}))
```

## 處理與拋出錯誤

為了讓 TanStack Query 判斷查詢是否發生錯誤，查詢函式**必須拋出錯誤**或回傳一個**被拒絕的 Promise (rejected Promise)**。任何在查詢函式中拋出的錯誤都會被保存在查詢的 `error` 狀態中。

```ts
todos = injectQuery(() => ({
  queryKey: ['todos', todoId()],
  queryFn: async () => {
    if (somethingGoesWrong) {
      throw new Error('Oh no!')
    }
    if (somethingElseGoesWrong) {
      return Promise.reject(new Error('Oh no!'))
    }

    return data
  },
}))
```

## 與預設不會拋出錯誤的 `fetch` 或其他客戶端一起使用

雖然大多數工具如 `axios` 或 `graphql-request` 會自動為不成功的 HTTP 呼叫拋出錯誤，但像 `fetch` 這樣的工具預設不會拋出錯誤。如果是這種情況，你需要自行拋出錯誤。以下是使用常見的 `fetch` API 來實現的簡單方法：

```ts
todos = injectQuery(() => ({
  queryKey: ['todos', todoId()],
  queryFn: async () => {
    const response = await fetch('/todos/' + todoId)
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    return response.json()
  },
}))
```

## 查詢函式變數

查詢鍵 (query key) 不僅用於唯一標識你正在獲取的資料，還會作為 QueryFunctionContext 的一部分方便地傳入你的查詢函式中。雖然這並非總是必要，但這使得在需要時提取查詢函式成為可能：

```ts
result = injectQuery(() => ({
  queryKey: ['todos', { status: status(), page: page() }],
  queryFn: fetchTodoList,
}))

// 在查詢函式中存取 key、status 和 page 變數！
function fetchTodoList({ queryKey }) {
  const [_key, { status, page }] = queryKey
  return new Promise()
}
```

### QueryFunctionContext

`QueryFunctionContext` 是傳遞給每個查詢函式的物件，它包含以下內容：

- `queryKey: QueryKey`: [查詢鍵 (Query Keys)](./query-keys.md)
- `client: QueryClient`: [QueryClient](../../../reference/QueryClient.md)
- `signal?: AbortSignal`
  - 由 TanStack Query 提供的 [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) 實例
  - 可用於 [查詢取消 (Query Cancellation)](./query-cancellation.md)
- `meta: Record<string, unknown> | undefined`
  - 一個可選欄位，你可以填入與查詢相關的額外資訊

此外，[無限查詢 (Infinite Queries)](./infinite-queries.md) 還會獲得以下傳遞的選項：

- `pageParam: TPageParam`
  - 用於獲取當前頁面的頁面參數
- `direction: 'forward' | 'backward'`
  - **已棄用**
  - 當前頁面獲取的方向
  - 要獲取當前頁面獲取的方向，請從 `getNextPageParam` 和 `getPreviousPageParam` 中將方向添加到 `pageParam`。
