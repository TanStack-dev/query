---
source-updated-at: '2024-11-14T21:48:46.000Z'
translation-updated-at: '2025-05-08T20:25:28.513Z'
id: query-invalidation
title: 查詢失效
---

等待查詢變為過時 (stale) 後再重新獲取資料，這種方式並不總是有效，特別是當您確知由於使用者操作導致某個查詢的資料已經過期時。為此，`QueryClient` 提供了一個 `invalidateQueries` 方法，讓您能智能地標記查詢為過時狀態，並可能觸發重新獲取！

```tsx
// 使快取中的所有查詢失效
queryClient.invalidateQueries()
// 使所有以 `todos` 開頭的查詢鍵的查詢失效
queryClient.invalidateQueries({ queryKey: ['todos'] })
```

> 注意：其他使用正規化快取 (normalized caches) 的函式庫可能會嘗試透過命令式或模式推斷來更新本地查詢的新資料，而 TanStack Query 則提供工具讓您避免維護正規化快取的手動操作，轉而採用**精確的失效標記、背景重新獲取及最終的原子更新**。

當使用 `invalidateQueries` 使查詢失效時，會發生兩件事：

- 該查詢被標記為過時 (stale)。此過時狀態會覆蓋 `injectQuery` 或相關函式中使用的任何 `staleTime` 設定
- 如果該查詢目前正透過 `injectQuery` 或相關函式渲染，它也會在背景重新獲取資料

## 使用 `invalidateQueries` 進行查詢匹配

在使用如 `invalidateQueries` 和 `removeQueries` 等 API（以及其他支援部分查詢匹配的功能）時，您可以透過查詢鍵的前綴來匹配多個查詢，或者非常精確地匹配一個特定查詢。有關可使用的篩選器類型，請參閱[查詢篩選器](./filters.md#query-filters)。

在此範例中，我們可以使用 `todos` 前綴來使任何查詢鍵以 `todos` 開頭的查詢失效：

```ts
import { injectQuery, QueryClient } from '@tanstack/angular-query-experimental'

class QueryInvalidationExample {
  queryClient = inject(QueryClient)

  invalidateQueries() {
    this.queryClient.invalidateQueries({ queryKey: ['todos'] })
  }

  // 以下兩個查詢都將失效
  todoListQuery = injectQuery(() => ({
    queryKey: ['todos'],
    queryFn: fetchTodoList,
  }))
  todoListQuery = injectQuery(() => ({
    queryKey: ['todos', { page: 1 }],
    queryFn: fetchTodoList,
  }))
}
```

您甚至可以透過傳遞更明確的查詢鍵給 `invalidateQueries` 方法，來使帶有特定變數的查詢失效：

```ts
queryClient.invalidateQueries({
  queryKey: ['todos', { type: 'done' }],
})

// 以下查詢將失效
todoListQuery = injectQuery(() => ({
  queryKey: ['todos', { type: 'done' }],
  queryFn: fetchTodoList,
}))

// 但以下查詢不會失效
todoListQuery = injectQuery(() => ({
  queryKey: ['todos'],
  queryFn: fetchTodoList,
}))
```

`invalidateQueries` API 非常靈活，因此即使您只想使**不帶任何其他變數或子鍵**的 `todos` 查詢失效，也可以傳遞 `exact: true` 選項給 `invalidateQueries` 方法：

```ts
queryClient.invalidateQueries({
  queryKey: ['todos'],
  exact: true,
})

// 以下查詢將失效
todoListQuery = injectQuery(() => ({
  queryKey: ['todos'],
  queryFn: fetchTodoList,
}))

// 但以下查詢不會失效
const todoListQuery = injectQuery(() => ({
  queryKey: ['todos', { type: 'done' }],
  queryFn: fetchTodoList,
}))
```

如果您希望獲取**更細緻**的控制，可以傳遞一個斷言函式 (predicate function) 給 `invalidateQueries` 方法。此函式會接收查詢快取中的每個 `Query` 實例，並讓您返回 `true` 或 `false` 來決定是否要使該查詢失效：

```ts
queryClient.invalidateQueries({
  predicate: (query) =>
    query.queryKey[0] === 'todos' && query.queryKey[1]?.version >= 10,
})

// 以下查詢將失效
todoListQuery = injectQuery(() => ({
  queryKey: ['todos', { version: 20 }],
  queryFn: fetchTodoList,
}))

// 以下查詢將失效
todoListQuery = injectQuery(() => ({
  queryKey: ['todos', { version: 10 }],
  queryFn: fetchTodoList,
}))

// 但以下查詢不會失效
todoListQuery = injectQuery(() => ({
  queryKey: ['todos', { version: 5 }],
  queryFn: fetchTodoList,
}))
```
