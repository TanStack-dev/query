---
source-updated-at: '2025-03-25T15:32:47.000Z'
translation-updated-at: '2025-05-08T20:22:20.302Z'
id: query-invalidation
title: 查詢失效
---

## 查詢失效 (Query Invalidation)

單純等待查詢變為過時 (stale) 狀態後再重新獲取資料，這種方式並不總是適用，尤其是當你明確知道使用者的某些操作導致某個查詢的資料已經過時時。為此，`QueryClient` 提供了一個 `invalidateQueries` 方法，讓你能智慧地標記查詢為過時狀態，並可能觸發重新獲取！

[//]: # 'Example'

```tsx
// 使快取中的所有查詢失效
queryClient.invalidateQueries()
// 使所有以 `todos` 開頭的查詢失效
queryClient.invalidateQueries({ queryKey: ['todos'] })
```

[//]: # 'Example'

> 注意：其他使用正規化快取 (normalized caches) 的函式庫可能會嘗試透過命令式或模式推斷 (schema inference) 來更新本地查詢的新資料，而 TanStack Query 則提供工具讓你避免維護正規化快取的手動操作，轉而採用**針對性失效、背景重新獲取，最終實現原子更新**的策略。

當使用 `invalidateQueries` 使查詢失效時，會發生兩件事：

- 該查詢被標記為過時狀態。此過時狀態會覆寫 `useQuery` 或相關鉤子中設定的任何 `staleTime` 配置
- 如果該查詢目前正透過 `useQuery` 或相關鉤子渲染，它也會在背景重新獲取資料

## 使用 `invalidateQueries` 進行查詢匹配

在使用 `invalidateQueries` 和 `removeQueries` 等 API（以及其他支援部分查詢匹配的功能）時，你可以透過查詢鍵 (query key) 的前綴來匹配多個查詢，或者非常精確地匹配特定查詢。有關可使用的篩選器類型，請參閱[查詢篩選器](./filters.md#query-filters)。

在這個範例中，我們可以使用 `todos` 前綴來使任何查詢鍵以 `todos` 開頭的查詢失效：

[//]: # 'Example2'

```tsx
import { useQuery, useQueryClient } from '@tanstack/react-query'

// 從上下文中取得 QueryClient
const queryClient = useQueryClient()

queryClient.invalidateQueries({ queryKey: ['todos'] })

// 以下兩個查詢都會失效
const todoListQuery = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodoList,
})
const todoListQuery = useQuery({
  queryKey: ['todos', { page: 1 }],
  queryFn: fetchTodoList,
})
```

[//]: # 'Example2'

你甚至可以透過傳遞更具體的查詢鍵給 `invalidateQueries` 方法，來使帶有特定變數的查詢失效：

[//]: # 'Example3'

```tsx
queryClient.invalidateQueries({
  queryKey: ['todos', { type: 'done' }],
})

// 以下查詢會失效
const todoListQuery = useQuery({
  queryKey: ['todos', { type: 'done' }],
  queryFn: fetchTodoList,
})

// 但以下查詢不會失效
const todoListQuery = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodoList,
})
```

[//]: # 'Example3'

`invalidateQueries` API 非常靈活，因此即使你只想使**不帶任何其他變數或子鍵**的 `todos` 查詢失效，也可以傳遞 `exact: true` 選項給 `invalidateQueries` 方法：

[//]: # 'Example4'

```tsx
queryClient.invalidateQueries({
  queryKey: ['todos'],
  exact: true,
})

// 以下查詢會失效
const todoListQuery = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodoList,
})

// 但以下查詢不會失效
const todoListQuery = useQuery({
  queryKey: ['todos', { type: 'done' }],
  queryFn: fetchTodoList,
})
```

[//]: # 'Example4'

如果你需要**更細緻**的控制，可以傳遞一個斷言函式 (predicate function) 給 `invalidateQueries` 方法。這個函式會接收查詢快取中的每個 `Query` 實例，並讓你決定是否要使該查詢失效（返回 `true` 或 `false`）：

[//]: # 'Example5'

```tsx
queryClient.invalidateQueries({
  predicate: (query) =>
    query.queryKey[0] === 'todos' && query.queryKey[1]?.version >= 10,
})

// 以下查詢會失效
const todoListQuery = useQuery({
  queryKey: ['todos', { version: 20 }],
  queryFn: fetchTodoList,
})

// 以下查詢會失效
const todoListQuery = useQuery({
  queryKey: ['todos', { version: 10 }],
  queryFn: fetchTodoList,
})

// 但以下查詢不會失效
const todoListQuery = useQuery({
  queryKey: ['todos', { version: 5 }],
  queryFn: fetchTodoList,
})
```

[//]: # 'Example5'
